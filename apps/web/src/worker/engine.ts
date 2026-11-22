/**
 * The web vault's worker: the one place in the page that holds Passhold's
 * key, the records key and the opened vault, for as long as the vault is
 * unlocked. The page ends this worker at every lock and starts an empty one,
 * which opens nothing until something is typed or touched.
 *
 * It is a Passhold device as the extension's service worker is one, moved
 * into the page: it signs in with @keyrook/account's flows, opens Passhold's
 * key as any Passhold does, pulls every record into memory (nothing is kept
 * between sittings), applies the changes pages describe with the core's rules
 * (`applyMutation`) and seals and sends them with the core's round
 * (`syncOwnRecords`, `syncFamilies`). The server is untrusted here as there.
 */
import {
  AUTHENTICATOR,
  beginLogin,
  checkRecoveryKey,
  familyCompareCode,
  finishSecondStep,
  HttpSyncAdapter,
  logout,
  namedClient,
  openFamily,
  openLink,
  openProductKey,
  passkeyCredential,
  passkeySignInOptions,
  passwordKeys,
  prelogin,
  providerSession,
  replaceProductKey,
  sealedFileSize,
  secondStepPasskeyOptions,
  signInWithPasskey,
  SyncHttpError,
  trustFamilyMember,
  deriveAccountKeys,
  type AccountKeys,
  type AccountRoot,
  type Fetcher,
  type LoginResponse,
  type ProductKey,
  type SecondStepRequest,
  type Tokens,
} from '@keyrook/account';
import {
  accountKitProof,
  addLinkedCode,
  applyMutation,
  attachFile,
  codeFitsLogin,
  deleteStoredFile,
  emptyData,
  exportDataKey,
  familyVault,
  fileCollection,
  filesDeleted,
  findAttachment,
  anyItem,
  hiddenValue,
  hideSecrets,
  forgetFiles,
  formatAccountKitKey,
  fromBase64,
  inFamilyVault,
  isAccountKitKey,
  isPassholdError,
  MAX_SEALED_FILE,
  newId,
  pageView,
  PassholdError,
  placeOf,
  PRODUCT,
  readLinkedCodes,
  readTotpSetup,
  recordsKey,
  showCode,
  syncFamilies,
  syncOwnRecords,
  websitesOf,
  planFromBilling,
  plansOfferedFromBilling,
  type AccountLink,
  type Attachment,
  type FamilyLink,
  type LinkedCodes,
  type LoginItem,
  type Mutation,
  type SignInProvider,
  type VaultData,
  type VaultPlace,
  type VaultTurn,
  type WalletItem,
} from '@passhold/core';
import { AppError, describeError, fail } from '../../../extension/src/i18n/errors.js';
import { accountFailure } from '../../../extension/src/lib/failure.js';
import type { AccountView, CodesView, Envelope, OpenedFile, SecondStepAnswer, SyncResult, VaultStatus } from '../../../extension/src/lib/messaging.js';
import { planOf, planView } from '../../../extension/src/lib/plan.js';
import { createSerialiser } from '../../../extension/src/lib/serial.js';
import type { AnyRequest, FromWorker, SignInStep, SyncState, WebSession, Ways } from '../protocol.js';
import { webFail } from '../words.js';

export interface EngineOptions {
  /** The account's server: the one address the page may reach. */
  baseUrl: string;
  /** How requests go out: `fetch`, named as this build (`x-keyrook-client`). */
  fetcher: Fetcher;
  /** How the account's devices list names this sitting. */
  deviceName: string;
  /** News for the page. */
  emit(message: FromWorker): void;
}

/** A sign-in waiting on its second step: the ticket, and what opens the account once it is through. */
interface Waiting {
  ticket: string;
  passkeys: boolean;
  email: string;
  deviceId: string;
  provider: SignInProvider | null;
  /** The password's keys, for a sign-in with the password: dropped once used, or when the step is given up. */
  keys: AccountKeys | null;
  at: number;
}

/** What only the open vault holds: Passhold's key, the records keys, the vault itself, and what the last sync read beside it. */
interface Open {
  productKey: ProductKey;
  records: CryptoKey;
  /** Passhold's key before a replacement, until every record is sealed again under the new one. */
  previous: { key: CryptoKey; records: CryptoKey } | null;
  data: VaultData;
  codes: LinkedCodes | null;
}

/** An upload a page has begun, until its file is named in an item. */
interface Upload {
  itemId: string;
  place: VaultPlace | null;
  size: number;
  done: boolean;
}

/** A second step left this long is given up: its password's keys go with it. */
const STEP_TTL = 5 * 60_000;
/** As the account names a file. */
const FILE_ID = /^[A-Za-z0-9_-]{1,64}$/;
/** What a page may change here: the web vault imports nothing at launch, and holds no settings of its own. */
const CHANGES: ReadonlySet<Mutation['op']> = new Set([
  'login/add',
  'login/update',
  'login/favorite',
  'login/trash',
  'login/restore',
  'login/purge',
  'login/restoreVersion',
  'wallet/add',
  'wallet/update',
  'wallet/favorite',
  'wallet/trash',
  'wallet/restore',
  'wallet/purge',
  'wallet/restoreVersion',
  'file/detach',
  'trash/empty',
  'folder/rename',
  'family/change',
  'family/move',
  'family/departureRead',
  'settings/update',
]);

export class WebVault {
  private session: WebSession | null = null;
  private waiting: Waiting | null = null;
  private open: Open | null = null;
  private ways: Ways | null = null;
  private api: HttpSyncAdapter | null = null;
  private readonly turnQueue = createSerialiser();
  private syncRun: Promise<SyncResult> | null = null;
  private syncTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly uploads = new Map<string, Upload>();
  /** Changes made, and how many of them the last round that went through had: the rest wait in this tab. */
  private changesMade = 0;
  private changesSent = 0;
  private syncing = false;
  private failed: string | null = null;

  constructor(private readonly options: EngineOptions) {}

  /** A request, answered as an envelope: refusals as message keys, never English. */
  async answer(request: AnyRequest): Promise<Envelope<unknown>> {
    try {
      return { ok: true, value: await this.handle(request) };
    } catch (error) {
      const { key, values, message } = describeError(known(error));
      return { ok: false, error: message, key, values };
    }
  }

  async handle(request: AnyRequest): Promise<unknown> {
    switch (request.type) {
      case 'web/start':
        return this.start(request.session);
      case 'web/ways':
        return this.waysIn();
      case 'web/signIn':
        return this.signIn(String(request.email), String(request.password));
      case 'web/secondStep':
        return this.secondStep(request.answer);
      case 'account/secondStepView':
        return this.liveWaiting() ? { passkeys: this.waiting!.passkeys } : null;
      case 'account/secondStepPasskey': {
        const waiting = this.liveWaiting();
        if (!waiting) fail('error.providerExpired');
        return secondStepPasskeyOptions(this.options.baseUrl, waiting.ticket, this.options.fetcher);
      }
      case 'web/provider':
        return this.withProvider(request.provider, String(request.ticket), String(request.verifier));
      case 'web/unlock':
        return this.unlockWithPassword(String(request.password));
      case 'web/unlockRecoveryKey':
        return this.unlockWithRecoveryKey(String(request.recoveryKey));
      case 'account/passkeyChallenge':
        return passkeySignInOptions(this.options.baseUrl, this.options.fetcher);
      case 'web/passkey':
        return this.withPasskey(request.touch);
      case 'web/signOut':
        return this.signOut();
      case 'item/reveal': {
        const value = this.itemOf(String(request.id)) && hiddenValue(this.itemOf(String(request.id))!, request.secret);
        if (value === null || value === undefined) fail('error.itemNotFound');
        return value;
      }
      case 'item/full': {
        // As every page is handed an item (`pageView`): no passkey's private key, no file's key.
        const item = anyItem(pageView(this.requireOpen().data), String(request.id));
        if (!item) fail('error.itemNotFound');
        return item;
      }
      case 'web/flush':
        return this.flush();
      case 'web/syncState':
        return { syncing: this.syncing, unsent: this.changesMade - this.changesSent, failed: this.failed } satisfies SyncState;
      case 'vault/status':
        return this.status();
      case 'vault/lock':
        // The page ends this worker: nothing here outlives it.
        return undefined;
      case 'vault/mutate':
        return this.mutate(request.mutation);
      case 'account/sync':
        return this.syncNow();
      case 'account/checkKit':
        return this.checkKit(String(request.recoveryKey));
      case 'codes/forLogin':
        return this.codesFor(this.anyLogin(String(request.id)));
      case 'codes/add':
        return this.addCode(String(request.id), String(request.setup));
      case 'files/begin':
        return this.beginUpload(String(request.itemId), request.id, request.size);
      case 'files/finish':
        return this.finishUpload(String(request.id));
      case 'files/cancel':
        return this.cancelUpload(String(request.id));
      case 'files/attach':
        return this.attachUpload(request);
      case 'files/open':
        return this.openStoredFile(String(request.itemId), String(request.fileId));
      case 'family/compareCode':
        return { code: await this.familyCode(String(request.orgId), String(request.accountId)) };
      case 'family/trust':
        return this.trustMember(String(request.orgId), String(request.accountId), String(request.memberKey));
      case 'family/unlock':
        return this.unlockFamily(String(request.orgId), String(request.password));
      // What only the extension does: no page here asks, and none is answered.
      default:
        fail('error.unknown', { detail: 'not in the web vault' });
    }
  }

  // --- the tab's sign-in ---------------------------------------------------------

  private start(session: WebSession | null): SignInStep | null {
    // A worker is started once per lock: whatever it held before stays where it was, ended with the old worker.
    if (this.session || this.open) fail('error.unknown', { detail: 'started twice' });
    if (!session) return null;
    this.session = cleanSession(session);
    this.api = this.adapter();
    return { step: 'locked' };
  }

  /** The session's adapter: every call through it turns the tokens over, and the page keeps them. */
  private adapter(): HttpSyncAdapter {
    return new HttpSyncAdapter({
      baseUrl: this.options.baseUrl,
      fetcher: this.options.fetcher,
      tokens: {
        get: async () => (this.session ? { accessToken: this.session.accessToken, refreshToken: this.session.refreshToken } : null),
        set: async (next: Tokens) => {
          if (!this.session) return;
          this.session = { ...this.session, ...next };
          this.options.emit({ event: 'session', session: this.session });
        },
        clear: async () => this.ended(),
      },
    });
  }

  /** The server ended the session, or its owner did: nothing of it stays, and the page forgets it too. */
  private ended(): void {
    this.session = null;
    this.open = null;
    this.waiting = null;
    this.api = null;
    clearTimeout(this.syncTimer);
    this.options.emit({ event: 'session', session: null });
    this.options.emit({ event: 'changed' });
  }

  private signedApi(): HttpSyncAdapter {
    if (!this.session || !this.api) fail('error.accountSignedOut');
    return this.api;
  }

  /** A session the server just handed this tab. */
  private signedIn(answer: Pick<LoginResponse, 'accessToken' | 'refreshToken' | 'account'>, deviceId: string, provider: SignInProvider | null): void {
    this.session = cleanSession({ accessToken: answer.accessToken, refreshToken: answer.refreshToken, accountId: answer.account.id, email: answer.account.email, deviceId, provider });
    this.api = this.adapter();
    this.ways = null;
    this.options.emit({ event: 'session', session: this.session });
  }

  private async waysIn(): Promise<Ways> {
    if (this.ways) return this.ways;
    const held = await this.signedApi().accountKeys();
    this.ways = { password: Boolean(held.root?.passwordWrap), recoveryKey: Boolean(held.root?.recoveryWrap) };
    return this.ways;
  }

  private async signIn(email: string, password: string): Promise<SignInStep> {
    if (this.session) fail('error.unknown', { detail: 'already signed in' });
    const server = { baseUrl: this.options.baseUrl, fetcher: this.options.fetcher };
    const { keys } = await passwordKeys(server, email.trim().toLowerCase(), password);
    const deviceId = newId();
    const answer = await beginLogin(this.options.baseUrl, { email: email.trim().toLowerCase(), authHash: keys.authHash, deviceId, deviceName: this.options.deviceName }, this.options.fetcher);
    if ('secondStep' in answer) {
      this.waiting = { ticket: answer.secondStep.ticket, passkeys: answer.secondStep.passkeys, email, deviceId, provider: null, keys, at: Date.now() };
      return { step: 'secondStep', passkeys: answer.secondStep.passkeys };
    }
    this.signedIn(answer, deviceId, null);
    await this.openWith({ keys });
    return { step: 'open' };
  }

  private liveWaiting(): Waiting | null {
    if (this.waiting && Date.now() - this.waiting.at > STEP_TTL) this.waiting = null;
    return this.waiting;
  }

  private async secondStep(answer: SecondStepAnswer): Promise<SignInStep> {
    const waiting = this.liveWaiting();
    if (!waiting) fail('error.providerExpired');
    const session = await finishSecondStep(this.options.baseUrl, await stepRequest(waiting.ticket, answer), this.options.fetcher);
    this.waiting = null;
    this.signedIn(session, waiting.deviceId, waiting.provider);
    if (!waiting.keys) return { step: 'locked' };
    await this.openWith({ keys: waiting.keys });
    return { step: 'open' };
  }

  /**
   * Back from Google or GitHub, which prove who signs in and never what opens
   * the data: signed in, and locked until the password, the recovery key or
   * a passkey opens it.
   */
  private async withProvider(provider: SignInProvider, ticket: string, verifier: string): Promise<SignInStep> {
    if (this.session) fail('error.unknown', { detail: 'already signed in' });
    if (provider !== 'google' && provider !== 'github') fail('error.providerFailed');
    const deviceId = newId();
    const result = await providerSession(this.options.baseUrl, { ticket, verifier, deviceId, deviceName: this.options.deviceName }, this.options.fetcher);
    if (result.status === 'second_step') {
      this.waiting = { ticket: result.secondStep.ticket, passkeys: result.secondStep.passkeys, email: '', deviceId, provider, keys: null, at: Date.now() };
      return { step: 'secondStep', passkeys: result.secondStep.passkeys };
    }
    // An account is made on account.keyrook.com, or in an app: never here.
    if (result.status !== 'existing') webFail('noAccount');
    this.signedIn(result.session, deviceId, provider);
    return { step: 'locked' };
  }

  private async unlockWithPassword(password: string): Promise<SignInStep> {
    const session = this.signedOrFail();
    const { keys } = await passwordKeys({ baseUrl: this.options.baseUrl, fetcher: this.options.fetcher }, session.email, password);
    await this.openWith({ keys });
    return { step: 'open' };
  }

  private async unlockWithRecoveryKey(typed: string): Promise<SignInStep> {
    const session = this.signedOrFail();
    if (!isAccountKitKey(typed)) fail('error.accountKitShape');
    const root = await checkRecoveryKey(this.signedApi(), session.accountId, formatAccountKitKey(typed));
    await this.openWith({ root }, { recoveryKeyTyped: true });
    return { step: 'open' };
  }

  /**
   * One of the account's passkeys: a sign-in, or a sign-in again under the
   * same device id for a locked tab. Its PRF answer opens the root here; the
   * server is sent the answer without it (`passkeyCredential`).
   */
  private async withPasskey(touch: { challengeId: string; answer: Parameters<typeof passkeyCredential>[0]; prf: string | null }): Promise<SignInStep> {
    const prf = touch.prf ? fromBase64(touch.prf) : null;
    if (prf && prf.length !== 32) fail('error.passkeyFailed');
    const deviceId = this.session?.deviceId ?? newId();
    const before = this.session;
    const { session, root } = await signInWithPasskey(
      { baseUrl: this.options.baseUrl, fetcher: this.options.fetcher },
      { challengeId: String(touch.challengeId), answer: touch.answer, prf },
      { deviceId, deviceName: this.options.deviceName },
    );
    // Locked under one account, a passkey of another opens nothing here.
    if (before && before.accountId !== session.account.id) fail('error.passkeyWrong');
    this.signedIn(session, deviceId, before?.provider ?? null);
    if (before && before.refreshToken !== session.refreshToken) await logout(this.options.baseUrl, before.refreshToken, this.options.fetcher).catch(() => undefined);
    if (!root) fail('error.passkeyNoUnlock');
    await this.openWith({ root });
    return { step: 'open' };
  }

  private signedOrFail(): WebSession {
    if (!this.session) fail('error.accountSignedOut');
    return this.session;
  }

  private async signOut(): Promise<void> {
    // What was changed goes up first, for a few seconds at most: signed out, it would be lost with the session.
    await Promise.race([this.flush(), new Promise((done) => setTimeout(done, 8_000))]);
    const session = this.session;
    if (session) await logout(this.options.baseUrl, session.refreshToken, this.options.fetcher).catch(() => undefined);
    this.ended();
  }

  // --- opening ------------------------------------------------------------------------

  /**
   * Passhold's key, opened as any Passhold opens it, then every record read
   * from zero: nothing was kept. A key the server says must be replaced (the
   * recovery key leaked) is replaced here, as any Passhold replaces it, so
   * that someone whose only Passhold is this page can finish it.
   */
  private async openWith(unlockWith: { keys: AccountKeys } | { root: AccountRoot }, { recoveryKeyTyped = false } = {}): Promise<void> {
    const session = this.signedOrFail();
    const api = this.signedApi();
    const opened = await openProductKey(api, { accountId: session.accountId, product: PRODUCT, unlockWith, recoveryKeyTyped });
    if (opened.status === 'no-root') fail('error.accountNeedsRoot');
    if (opened.status === 'awaiting-confirmation') fail('error.accountRootChanged');
    let productKey = opened.productKey;
    let previous: Open['previous'] = null;
    if (opened.status === 'open' && opened.mustReplace) {
      const replaced = await replaceProductKey(api, productKey);
      // The link's key, sealed again under the new key while the one before still opens it.
      await openLink(api, replaced.productKey, AUTHENTICATOR, replaced.previousKey).catch(() => undefined);
      productKey = replaced.productKey;
      previous = { key: replaced.previousKey, records: await recordsKey(replaced.previousKey) };
    }
    const link: AccountLink = {
      email: session.email,
      name: null,
      deviceId: session.deviceId,
      accountId: session.accountId,
      // Raw, as the core's link holds it; it lives in this worker's memory alone, and goes with it.
      productKey: await exportDataKey(productKey.key),
      previousKey: previous ? await exportDataKey(previous.key) : null,
      root: productKey.root,
      keyGeneration: productKey.keyGeneration,
      rootGeneration: productKey.rootGeneration,
      sheetVerifiedAt: productKey.sheetVerifiedAt,
      tokens: { accessToken: session.accessToken, refreshToken: session.refreshToken },
      serverRev: 0,
      epoch: null,
      known: {},
      lastSyncAt: null,
      kit: null,
      pendingStartOver: null,
      removedAt: null,
      provider: session.provider,
      passwordless: !(await this.waysIn()).password,
      passkey: null,
    };
    const ready: Open = { productKey, records: await recordsKey(productKey.key), previous, data: { ...emptyData(), account: link }, codes: null };
    this.open = ready;
    try {
      await this.syncNow();
    } catch (error) {
      // Opened but never read is not open: the page asks again.
      if (this.open === ready) this.open = null;
      throw error;
    }
  }

  // --- the vault, as pages see it ---------------------------------------------------------

  private requireOpen(): Open {
    if (!this.open) fail('error.locked');
    return this.open;
  }

  private status(): VaultStatus {
    const open = this.open;
    if (!open) return { state: 'locked', secret: 'password', passwordName: 'account', pin: false, device: null, keys: [] };
    return {
      state: 'unlocked',
      secret: 'password',
      passwordName: 'account',
      // Every hidden value stands hidden until it is shown or copied (`item/reveal`).
      data: hideSecrets(pageView(open.data)),
      device: null,
      keys: [],
      account: accountView(open.data.account!),
      plan: planView(open.data),
    };
  }

  /** A step in the vault's queue, with the read inside it, while it is open with the key it began with. */
  private turn(productKey?: ProductKey): VaultTurn {
    return <T,>(step: (data: VaultData) => Promise<{ data?: VaultData; value: T }>) =>
      this.turnQueue(async (): Promise<T | null> => {
        const open = this.open;
        if (!open || (productKey && open.productKey !== productKey)) return null;
        const { data, value } = await step(open.data);
        if (data && this.open === open) {
          open.data = this.session && data.account ? { ...data, account: { ...data.account, tokens: { accessToken: this.session.accessToken, refreshToken: this.session.refreshToken } } } : data;
          this.options.emit({ event: 'changed' });
        }
        return value;
      });
  }

  private async change(apply: (data: VaultData) => VaultData | Promise<VaultData>): Promise<void> {
    const done = await this.turn()(async (data) => ({ data: await apply(data), value: true }));
    if (!done) fail('error.locked');
    this.changesMade++;
    this.tellUnsent();
    // Sent at once, not after a pause: a lock, a hidden tab or a closed one may end this worker any moment.
    this.scheduleSync(150);
  }

  private mutate(mutation: Mutation): Promise<void> {
    if (!mutation || typeof mutation !== 'object' || !CHANGES.has(mutation.op)) fail('error.unknown', { detail: 'not in the web vault' });
    // A file no item names any more after the change is deleted in the account at the next round, as the extension deletes it.
    return this.change((data) => forgetFiles(data, applyMutation(data, mutation, planOf(data))));
  }

  // --- the round with the server -------------------------------------------------------------

  private scheduleSync(delay: number): void {
    clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => void this.syncNow().catch(() => undefined), delay);
  }

  /** One round at a time: two would spend the same refresh token, and the server ends a session for that. */
  syncNow(): Promise<SyncResult> {
    this.syncRun ??= this.runSync().finally(() => {
      this.syncRun = null;
    });
    return this.syncRun;
  }

  private async runSync(): Promise<SyncResult> {
    const open = this.requireOpen();
    const api = this.signedApi();
    const turn = this.turn(open.productKey);
    const upTo = this.changesMade;
    this.syncing = true;
    this.options.emit({ event: 'changed' });
    try {
      const result = await this.round(open, api, turn);
      this.changesSent = Math.max(this.changesSent, upTo);
      this.failed = null;
      return result;
    } catch (error) {
      this.failed = describeError(known(error)).key;
      throw error;
    } finally {
      this.syncing = false;
      this.tellUnsent();
      this.options.emit({ event: 'changed' });
    }
  }

  /** How many changes made here the account has not taken yet, told to the page: it asks before the tab is closed on them. */
  private tellUnsent(): void {
    this.options.emit({ event: 'unsent', count: this.changesMade - this.changesSent });
  }

  /**
   * Everything changed here, sent before this worker is ended: a lock asks
   * this first, so a change made just before it reaches the account. A round
   * that is going is waited for, and one more is made for what came after it.
   * What could not go is said in what comes back.
   */
  private async flush(): Promise<SyncState> {
    clearTimeout(this.syncTimer);
    for (let round = 0; round < 3 && this.open && this.session; round++) {
      if (this.syncRun) await this.syncRun.catch(() => undefined);
      if (this.changesMade <= this.changesSent) break;
      await this.syncNow().catch(() => undefined);
      if (this.failed) break;
    }
    return { syncing: this.syncing, unsent: this.changesMade - this.changesSent, failed: this.failed };
  }

  private async round(open: Open, api: HttpSyncAdapter, turn: VaultTurn): Promise<SyncResult> {
    try {
      const round = await syncOwnRecords(api, turn, { productKey: open.productKey.key, records: open.records, previous: open.previous?.records ?? null }, open.data.account!);
      if (!round) return { removed: 0, skipped: 0 };
      const again = await syncFamilies(api, turn, { productKey: open.productKey, previousKey: open.previous?.key, deviceId: open.data.account!.deviceId }).catch(() => false);
      // Every record sealed again under the new key and sent: the one before is let go here too.
      if (this.open === open && open.previous && open.data.account?.previousKey === null) open.previous = null;
      await this.besideTheVault(open, api);
      if (round.again || again) this.scheduleSync(1_000);
      return { removed: round.removed, skipped: round.skipped };
    } catch (error) {
      if (error instanceof SyncHttpError && (error.status === 401 || error.code === 'device_removed')) this.ended();
      throw error;
    }
  }

  /** What a round reads beside the vault, each quietly: the plan, the link's codes, and files no item names any more. */
  private async besideTheVault(open: Open, api: HttpSyncAdapter): Promise<void> {
    const accountId = open.productKey.accountId;
    await Promise.allSettled([
      (async () => {
        const billing = await api.billing().catch((error: unknown) => {
          if (error instanceof SyncHttpError && error.status === 404) return null;
          throw error;
        });
        const plan = billing ? planFromBilling(billing) : undefined;
        const offered = billing ? plansOfferedFromBilling(billing) : false;
        await this.turn(open.productKey)(async (data) => {
          const account = data.account!;
          if (account.accountId !== accountId || (account.plan === (plan ?? account.plan) && account.plansOffered === offered)) return { value: undefined };
          return { data: { ...data, account: { ...account, ...(plan ? { plan } : {}), plansOffered: offered } }, value: undefined };
        });
      })(),
      (async () => {
        open.codes = await readLinkedCodes(api, open.productKey);
      })(),
      this.deleteLeftFiles(open, api),
    ]);
    this.options.emit({ event: 'changed' });
  }

  /** Files no item names any more, now that the records that named them have gone up. */
  private async deleteLeftFiles(open: Open, api: HttpSyncAdapter): Promise<void> {
    const deleted: string[] = [];
    for (const id of open.data.account?.filesToDelete ?? []) {
      try {
        await deleteStoredFile(api, id);
        deleted.push(id);
      } catch (error) {
        if (error instanceof SyncHttpError && error.code === 'not_offered') break;
      }
    }
    if (deleted.length) await this.turn(open.productKey)(async (data) => ({ data: filesDeleted(data, deleted), value: undefined }));
  }

  // --- the account's recovery key, checked once ------------------------------------------------

  /** The account's recovery key, typed once: it must open the account's root, as Passhold's pin then says. */
  private async checkKit(typed: string): Promise<void> {
    const open = this.requireOpen();
    if (!isAccountKitKey(typed)) fail('error.accountKitShape');
    const recoveryKey = formatAccountKitKey(typed);
    const api = this.signedApi();
    const root = await checkRecoveryKey(api, open.productKey.accountId, recoveryKey).catch(() => fail('error.accountKitNotThis'));
    if (root.publicKey !== open.productKey.root) fail('error.accountRootChanged');
    const opened = await openProductKey(api, { accountId: open.productKey.accountId, product: PRODUCT, unlockWith: { root }, pinned: { root: open.productKey.root }, recoveryKeyTyped: true });
    if (opened.status !== 'open' || (await exportDataKey(opened.productKey.key)) !== (await exportDataKey(open.productKey.key))) fail('error.accountRootChanged');
    await api.recoveryChecked({ rootRecoveryAuthHash: await accountKitProof(recoveryKey) }).catch(() => undefined);
    await this.turn(open.productKey)(async (data) => ({ data: { ...data, account: { ...data.account!, sheetVerifiedAt: opened.productKey.sheetVerifiedAt } }, value: undefined }));
  }

  // --- 2FA codes beside logins ---------------------------------------------------------------

  private itemOf(id: string): LoginItem | WalletItem | undefined {
    return anyItem(this.requireOpen().data, id);
  }

  private anyLogin(id: string): LoginItem {
    const { data } = this.requireOpen();
    const login = [...data.items, ...data.families.flatMap((family) => family.vaults.flatMap((vault) => vault.items))].find((item) => item.id === id && item.deletedAt === null);
    if (!login) fail('error.itemNotFound');
    return login;
  }

  private async codesFor(login: LoginItem, codes: LinkedCodes | null = this.open?.codes ?? null): Promise<CodesView> {
    if (!codes) return { status: 'none' };
    if (codes.status !== 'open') return { status: codes.status === 'off' ? 'off' : 'premium' };
    const now = Date.now();
    return { status: 'open', codes: await Promise.all(codes.codes.filter((code) => codeFitsLogin(code.websites, login)).map((code) => showCode(code, now))) };
  }

  private async addCode(id: string, typed: string): Promise<CodesView> {
    const open = this.requireOpen();
    const login = this.anyLogin(id);
    const setup = readTotpSetup(typed);
    if (!setup) fail('error.notSetupKey');
    const websites = websitesOf(login);
    if (!websites.length) fail('error.codeNeedsSite');
    const named = { ...setup, issuer: setup.issuer || login.title, label: setup.label || login.username };
    open.codes = await addLinkedCode(this.signedApi(), open.productKey, named, websites);
    return this.codesFor(login, open.codes);
  }

  // --- files kept with items ----------------------------------------------------------------

  private itemForFiles(data: VaultData, itemId: string): { place: VaultPlace | null; item: LoginItem | WalletItem } {
    const place = placeOf(data, itemId);
    if (place === undefined) fail('error.itemNotFound');
    const items = place ? familyVault(data, place).vault : data;
    if (place && familyVault(data, place).vault.viewOnly) fail('error.viewOnly');
    const item = [...items.items, ...items.wallet].find((entry) => entry.id === itemId);
    if (!item || item.deletedAt !== null) fail('error.itemNotFound');
    return { place, item };
  }

  /** The store's addresses are named from the server's root, as the kit's are. */
  private address(url: string): string {
    return new URL(url, this.options.baseUrl).href;
  }

  private async beginUpload(itemId: string, id: unknown, size: unknown): Promise<{ url: string; expiresAt: number }> {
    const { place } = this.itemForFiles(this.requireOpen().data, itemId);
    if (typeof id !== 'string' || !FILE_ID.test(id)) fail('error.accountServerWrong');
    if (typeof size !== 'number' || !Number.isSafeInteger(size) || size <= 0 || size > MAX_SEALED_FILE) throw new PassholdError('fileTooLarge');
    const collection = fileCollection(place);
    const begun = await this.signedApi().beginFile({ id, size, ...(collection ?? {}) }).catch(fileFailure);
    this.uploads.set(id, { itemId, place, size, done: false });
    return { url: this.address(begun.url), expiresAt: begun.expiresAt };
  }

  private async finishUpload(id: string): Promise<void> {
    const upload = this.uploads.get(id);
    if (!upload) fail('error.fileFailed');
    await this.signedApi().finishFile(id).catch(fileFailure);
    upload.done = true;
  }

  private async cancelUpload(id: string): Promise<void> {
    if (!this.uploads.has(id)) return;
    this.uploads.delete(id);
    await deleteStoredFile(this.signedApi(), id).catch(() => undefined);
  }

  /**
   * The file the store now holds, named in the item it was begun for, with
   * the key it was sealed under. An item that has gone meanwhile takes none,
   * and the file goes from the account.
   */
  private async attachUpload(request: { id: string; key: string; name: string; fileType: string; size: number }): Promise<void> {
    const upload = this.uploads.get(String(request.id));
    if (!upload?.done) fail('error.fileFailed');
    // What the page sealed is what the account was told of: a file the item names is the size it says.
    if (!Number.isSafeInteger(request.size) || sealedFileSize(request.size) !== upload.size) fail('error.fileFailed');
    const file: Attachment = { id: String(request.id), key: String(request.key), name: String(request.name), type: String(request.fileType), size: request.size, addedAt: Date.now() };
    try {
      await this.change((data) => {
        const { place } = this.itemForFiles(data, upload.itemId);
        if (place?.orgId !== upload.place?.orgId || place?.vaultId !== upload.place?.vaultId) fail('error.itemNotFound');
        return place ? inFamilyVault(data, place, (vault) => attachFile(vault, upload.itemId, file)) : attachFile(data, upload.itemId, file);
      });
    } catch (error) {
      await this.cancelUpload(file.id);
      throw error;
    }
    this.uploads.delete(file.id);
  }

  /** Where to read a file an item names, and the key for that one file alone. */
  private async openStoredFile(itemId: string, fileId: string): Promise<OpenedFile> {
    const { data } = this.requireOpen();
    const found = [data, ...data.families.flatMap((family) => family.vaults)].map((items) => findAttachment(items, itemId, fileId)).find(Boolean);
    if (!found) fail('error.fileGone');
    const address = await this.signedApi().fileAddress(fileId).catch(fileFailure);
    return { url: this.address(address.url), expiresAt: address.expiresAt, file: found.file };
  }

  // --- a family's shared vaults -------------------------------------------------------------

  private heldFamily(orgId: string): { held: FamilyLink; open: Open } {
    const open = this.requireOpen();
    const held = open.data.families.find((family) => family.orgId === orgId);
    if (!held) fail('error.familyGone');
    return { held, open };
  }

  private async familyCode(orgId: string, accountId: string): Promise<string> {
    const { held, open } = this.heldFamily(orgId);
    if (held.state.kind === 'compare' && held.state.accountId === accountId) return held.state.code;
    const opened = await openFamily(this.signedApi(), { productKey: open.productKey, orgId, pinned: held.pin, previousKey: open.previous?.key });
    if (opened.status === 'compare' && opened.accountId === accountId) return opened.code;
    if (opened.status !== 'open') fail('error.familyNotOpen');
    return familyCompareCode(opened.family, accountId);
  }

  /** The two codes matched, as the person saw: only a key the flows named here is trusted, never one a page names. */
  private async trustMember(orgId: string, accountId: string, memberKey: string): Promise<void> {
    const { held, open } = this.heldFamily(orgId);
    const named =
      (held.state.kind === 'compare' && held.state.accountId === accountId && held.state.memberKey === memberKey) ||
      held.keyChanged.some((change) => change.accountId === accountId && change.memberKey === memberKey);
    if (!named) fail('error.familyGone');
    const pin = await trustFamilyMember(open.productKey, { orgId, pinned: held.pin, previousKey: open.previous?.key, accountId, memberKey });
    await this.turn(open.productKey)(async (data) => {
      const now = data.families.find((family) => family.orgId === orgId);
      if (!now || now.pin !== held.pin) return { value: undefined };
      const next: FamilyLink = { ...now, pin, keyChanged: now.keyChanged.filter((change) => change.accountId !== accountId) };
      return { data: { ...data, families: data.families.map((family) => (family.orgId === orgId ? next : family)) }, value: undefined };
    });
    await this.syncNow().catch(() => undefined);
  }

  /** The account's password, once, for a family this sitting holds no key to yet: it opens the root here; nothing of it is sent. */
  private async unlockFamily(orgId: string, password: string): Promise<void> {
    const { held, open } = this.heldFamily(orgId);
    const kdf = await prelogin(this.options.baseUrl, this.signedOrFail().email, this.options.fetcher);
    const keys = await deriveAccountKeys(password, kdf);
    await openFamily(this.signedApi(), { productKey: open.productKey, orgId, pinned: held.pin, previousKey: open.previous?.key, unlockWith: { keys } });
    await this.syncNow().catch(() => undefined);
  }
}

/** Only what a session is made of, from the page's storage: anything else it may hold is not taken. */
function cleanSession(session: WebSession): WebSession {
  const text = (value: unknown) => (typeof value === 'string' ? value : '');
  const provider = session.provider === 'google' || session.provider === 'github' ? session.provider : null;
  const clean = { accessToken: text(session.accessToken), refreshToken: text(session.refreshToken), accountId: text(session.accountId), email: text(session.email), deviceId: text(session.deviceId), provider };
  if (!clean.accessToken || !clean.refreshToken || !clean.accountId || !clean.deviceId) fail('error.accountSignedOut');
  return clean;
}

/** A second step as the server takes it: the code, the recovery key's proof in its place, or a passkey's answer without its PRF. */
async function stepRequest(ticket: string, step: SecondStepAnswer): Promise<SecondStepRequest> {
  if ('passkey' in step) return { ticket, passkey: { challengeId: String(step.passkey.challengeId), credential: passkeyCredential(step.passkey.answer) } };
  if ('code' in step) return { ticket, code: String(step.code).replace(/\s+/g, '') };
  if ('recoveryKey' in step) {
    if (!isAccountKitKey(String(step.recoveryKey))) fail('error.accountKitShape');
    return { ticket, recoveryAuthHash: await accountKitProof(formatAccountKitKey(String(step.recoveryKey))) };
  }
  fail('error.secondStepNeeded');
}

/** The account as the screens show it. */
function accountView(link: AccountLink): AccountView {
  return {
    email: link.email,
    accountId: link.accountId,
    name: link.name,
    lastSyncAt: link.lastSyncAt,
    signedOut: link.tokens === null,
    // Nothing of the account's recovery key is kept here: it is unchecked until a Passhold has seen it open the account.
    kit: link.sheetVerifiedAt === null ? 'unchecked' : 'elsewhere',
    startOver: link.pendingStartOver && link.pendingStartOver.executesAt > Date.now() ? { executesAt: link.pendingStartOver.executesAt, deviceName: link.pendingStartOver.deviceName } : null,
    startedOver: null,
    removed: null,
    provider: link.provider,
    passwordless: link.passwordless,
    passkey: false,
  };
}

/** The account's word for a file it does not keep, in a key a page can say. */
function fileFailure(error: unknown): never {
  if (error instanceof SyncHttpError && error.code === 'payload_too_large') throw new PassholdError('fileTooLarge');
  throw error;
}

/** Any refusal as one a page can say: the core's and this worker's as they are, the server's and the flows' as the extension says them. */
function known(error: unknown): unknown {
  if (error instanceof AppError || isPassholdError(error)) return error;
  try {
    accountFailure(error);
  } catch (said) {
    return said;
  }
  return error;
}
