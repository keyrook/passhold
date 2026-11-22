/**
 * The Keyrook account, from a terminal: signing in, opening Passhold's key,
 * and reading the vault's sealed records. Every step is one of
 * @keyrook/account's own flows, as the extension runs them; nothing of the
 * key design is wired here.
 *
 * Signing in says who is at the terminal. Opening Passhold's key is apart
 * from it, as on a new browser: with the account's password, with the
 * recovery key, or from a Passhold browser already in, after its owner
 * checks both show the same code.
 */
import {
  beginLogin,
  checkRecoveryKey,
  DecryptionError,
  familyCompareCode,
  finishSecondStep,
  HttpSyncAdapter,
  namedClient,
  openFamily,
  openProductKey,
  passwordKeys,
  providerSession,
  pullFamily,
  pushFamily,
  sealFamilyRecord,
  signInOptions,
  SyncHttpError,
  trustFamilyMember,
  type AccountKeys,
  type AccountRoot,
  type AccountServer,
  type Fetcher,
  type LoginResponse,
  type OrgRecord,
  type ProductFamily,
  type ProductKey,
  type SignInProvider,
} from '@keyrook/account';
import {
  applyPulled,
  cleanAccountName,
  emptyData,
  exportDataKey,
  importDataKey,
  keyCodec,
  mergeFamilyPulled,
  newPairingKeys,
  newProviderFlow,
  openPairedKey,
  pairingCode,
  planAllows,
  planFamilyPush,
  planFromBilling,
  planPush,
  planRecords,
  PRODUCT,
  readPassholdPin,
  readPlan,
  recordsKey,
  type FamilyLink,
  type FamilyValue,
  type FamilyVault,
  type Items,
  type KnownRecord,
  type OpenedFamilyRecord,
  type PaidFeature,
  type Plan,
  type RemoteRecord,
  type UnreadableRecord,
  type VaultData,
} from '@passhold/core';
import { CliError, type Vault } from './reference.js';
import { UNLOCK_MINUTES, type Store, type StoredAccount, type StoredFamily, type Unlocked } from './store.js';

export const VERSION = '0.1.0';
export const OFFICIAL_API = 'https://api.keyrook.com';

/**
 * The command line's id as an app the account's server may hand a Google or
 * GitHub sign-in back to: it is listed there as the phone apps are, and no
 * other id is this program.
 */
export const APP_ID = 'com.keyrook.passhold.cli';

const PLATFORMS: Partial<Record<NodeJS.Platform, { name: string; shown: string }>> = {
  darwin: { name: 'macos', shown: 'Mac' },
  win32: { name: 'windows', shown: 'Windows' },
  linux: { name: 'linux', shown: 'Linux' },
};

/** How this build names itself to the server: the product, then where it runs (`x-keyrook-client`). */
export function clientName(platform: NodeJS.Platform = process.platform): string {
  return `passhold-${PLATFORMS[platform]?.name ?? 'linux'}/${VERSION}`;
}

/** What the account's list of devices shows for a terminal. */
export function deviceName(platform: NodeJS.Platform = process.platform): string {
  return `Passhold CLI on ${PLATFORMS[platform]?.shown ?? 'Linux'}`;
}

/** A sign-in with Google or GitHub that has left for the browser: what it waits for, kept in memory only. */
export interface ProviderFlow {
  provider: SignInProvider;
  url: string;
  state: string;
  verifier: string;
}

/** What one request to be let in shows, and how it ends. */
export interface PairingAsk {
  /** Called once a Passhold browser has answered, with the code both must show. */
  onCode: (code: string) => void;
  /** Waits between two looks at the request. */
  wait: (milliseconds: number) => Promise<void>;
  /** How long to wait in all before giving up. */
  timeoutMs?: number;
}

const deviceId = () => crypto.randomUUID();

const said = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** Every vault the account holds, opened in memory, and what a change to one needs to go up. */
export interface Opened {
  /** The vault's own items, and each family's shared vaults in `families`. */
  data: VaultData;
  /** Each of the vault's own records as the server holds it: a change goes up one revision above. */
  known: Record<string, KnownRecord>;
  /** The account's counter when they were read. */
  serverRev: number;
  /** Each family opened, by its id: what seals a change to one of its vaults. */
  families: Map<string, ProductFamily>;
}

/** A change to one vault: its items as they are after, and the id of the one item changed. */
export type Change = <T extends Items>(items: T) => { items: T; id: string };

/** Pages of a family's records, at most: a server that always says there is more stops here, not never. */
const PAGES = 40;

export class Account {
  private readonly fetcher: Fetcher;

  constructor(
    private readonly store: Store,
    readonly api: string,
    fetcher: Fetcher = fetch,
    private readonly env: NodeJS.ProcessEnv = process.env,
  ) {
    this.fetcher = namedClient(fetcher, clientName());
  }

  private get server(): AccountServer {
    return { baseUrl: this.api, fetcher: this.fetcher };
  }

  /** The signed-in account, or a sentence saying how to sign in. */
  signedIn(): StoredAccount {
    const account = this.store.account();
    if (!account?.tokens) throw new CliError('Not signed in. Run: passhold login');
    if (account.api !== this.api) throw new CliError(`Signed in at ${account.api}, not ${this.api}. Run: passhold login`);
    return account;
  }

  /** The account's API as this session: tokens are kept as they are renewed, and dropped when the server ends the session. */
  private adapter(account: StoredAccount): HttpSyncAdapter {
    return new HttpSyncAdapter({
      baseUrl: this.api,
      fetcher: this.fetcher,
      tokens: {
        get: async () => this.store.account()?.tokens ?? null,
        set: async (tokens) => this.store.saveAccount({ ...(this.store.account() ?? account), tokens }),
        clear: async () => this.store.saveAccount({ ...(this.store.account() ?? account), tokens: null }),
      },
    });
  }

  private keep(session: Pick<LoginResponse, 'accessToken' | 'refreshToken' | 'account'>, device: string): StoredAccount {
    const before = this.store.account();
    const account: StoredAccount = {
      api: this.api,
      accountId: session.account.id,
      email: session.account.email,
      deviceId: device,
      tokens: { accessToken: session.accessToken, refreshToken: session.refreshToken },
      // What was pinned stays only for the same account: another's root, or its families, say nothing of this one.
      pinned: before?.accountId === session.account.id ? before.pinned : null,
      ...(before?.accountId === session.account.id && before.families ? { families: before.families } : {}),
    };
    this.store.lock();
    this.store.saveAccount(account);
    return account;
  }

  /** With the account's email and password; `code` is asked only of an account with a second step. */
  async signInWithPassword(email: string, password: string, code: () => Promise<string>): Promise<StoredAccount> {
    const { keys } = await passwordKeys(this.server, email, password);
    const device = deviceId();
    const answer = await beginLogin(this.api, { email, authHash: keys.authHash, deviceId: device, deviceName: deviceName() }, this.fetcher);
    const session = 'secondStep' in answer ? await finishSecondStep(this.api, { ticket: answer.secondStep.ticket, code: (await code()).replace(/\s+/g, '') }, this.fetcher) : answer;
    return this.keep(session, device);
  }

  /** Which of Google and GitHub the server signs in with, when it can hand the answer back to an app at all. */
  async providers(): Promise<SignInProvider[]> {
    const { providers, byApp } = await signInOptions(this.api, this.fetcher);
    return byApp ? providers : [];
  }

  /**
   * A sign-in with Google or GitHub, to open in the person's own browser: the
   * phone apps' flow (`return=app`), with the port this program listens on so
   * the answer can come back to it at `http://127.0.0.1:<port>/oauth`. The
   * verifier never leaves this process: the ticket in the answer is worth
   * nothing without it.
   */
  async startProvider(provider: SignInProvider, port: number): Promise<ProviderFlow> {
    const { verifier, challenge, state } = await newProviderFlow();
    const query = new URLSearchParams({ return: 'app', app: APP_ID, port: String(port), challenge, state });
    return { provider, url: `${this.api}/oauth/${provider}/start?${query}`, state, verifier };
  }

  /**
   * The answer the browser came back with: the address it ended at, or its
   * fragment. Taken only if its state is the one this sign-in sent.
   */
  async finishProvider(flow: ProviderFlow, answer: string): Promise<StoredAccount> {
    const fragment = new URLSearchParams(answer.includes('#') ? answer.slice(answer.indexOf('#') + 1) : answer.replace(/^[?#]/, ''));
    if (fragment.get('state') !== flow.state) throw new CliError('That answer is not for this sign-in.');
    const refused = fragment.get('error');
    if (refused) throw new CliError(fragment.get('message') || (refused === 'denied' ? 'The sign-in was cancelled.' : `The sign-in was refused (${refused}).`));
    const ticket = fragment.get('ticket');
    if (!ticket) throw new CliError('That answer carries no sign-in.');
    const device = deviceId();
    const result = await providerSession(this.api, { ticket, verifier: flow.verifier, deviceId: device, deviceName: deviceName() }, this.fetcher);
    switch (result.status) {
      case 'existing':
        return this.keep({ ...result.session, account: result.session.account }, device);
      case 'new':
        throw new CliError(`${result.email} has no Keyrook account yet. Make one in Passhold first, then sign in here.`);
      case 'second_step':
        throw new CliError('This account asks for a second step, which a sign-in with Google or GitHub cannot answer here yet. Sign in with: passhold login --email <address>');
      default:
        throw new CliError('That sign-in is for the account page, not for Passhold.');
    }
  }

  async signOut(): Promise<void> {
    this.store.signOut();
  }

  // --- Passhold's key ------------------------------------------------------------

  /** Passhold's key, opened as the account's flows open it: with the password's keys, or the root the recovery key opened. */
  private async productKey(account: StoredAccount, unlockWith: { keys: AccountKeys } | { root: AccountRoot }, recoveryKeyTyped = false): Promise<{ key: CryptoKey; root: string }> {
    const result = await openProductKey(this.adapter(account), {
      accountId: account.accountId,
      product: PRODUCT,
      unlockWith,
      ...(account.pinned ? { pinned: { root: account.pinned } } : {}),
      ...(recoveryKeyTyped ? { recoveryKeyTyped: true } : {}),
    });
    if (result.status === 'no-root') throw new CliError('This account has no keys yet. Open Passhold in a browser once, then unlock here.');
    if (result.status === 'awaiting-confirmation') throw new CliError('The account’s key was replaced. Open Passhold in a browser to confirm it, then unlock here.');
    return { key: result.productKey.key, root: result.productKey.root };
  }

  private async opened(account: StoredAccount, unlockWith: { keys: AccountKeys } | { root: AccountRoot }, minutes: number, now: number, recoveryKeyTyped = false): Promise<string> {
    const { key, root } = await this.productKey(account, unlockWith, recoveryKeyTyped);
    return this.unlocked(account, key, root, minutes, now);
  }

  /**
   * Whether whoever is at the terminal is the account's owner, for what an
   * unlock alone should not give — everything out in plain text: the password
   * or the recovery key again, which must open the very key this unlock holds.
   */
  async prove(unlocked: Unlocked, secret: { password: string } | { recoveryKey: string }): Promise<void> {
    const account = this.signedIn();
    try {
      const unlockWith =
        'password' in secret
          ? { keys: (await passwordKeys(this.server, account.email, secret.password)).keys }
          : { root: await checkRecoveryKey(this.adapter(account), account.accountId, secret.recoveryKey) };
      const { key } = await this.productKey(account, unlockWith);
      if ((await exportDataKey(key)) !== unlocked.productKey) throw new Error('another key');
    } catch (error) {
      if (error instanceof CliError) throw error;
      throw new CliError('That does not open this account, so nothing was written.');
    }
  }

  private async unlocked(account: StoredAccount, key: CryptoKey, root: string | null, minutes: number, now: number): Promise<string> {
    if (root) this.store.saveAccount({ ...(this.store.account() ?? account), pinned: root });
    const unlocked: Unlocked = { accountId: account.accountId, productKey: await exportDataKey(key), expiresAt: now + minutes * 60_000 };
    return this.store.saveSession(unlocked);
  }

  /** With the account's password. The session key to keep in the shell is handed back. */
  async unlockWithPassword(password: string, minutes = UNLOCK_MINUTES, now = Date.now()): Promise<string> {
    const account = this.signedIn();
    const { keys } = await passwordKeys(this.server, account.email, password);
    try {
      return await this.opened(account, { keys }, minutes, now);
    } catch (error) {
      if (error instanceof CliError) throw error;
      throw new CliError(`That password does not open this account (${said(error)})`);
    }
  }

  /** With the account's recovery key: the way in for an account with no password and no Passhold browser at hand. */
  async unlockWithRecoveryKey(recoveryKey: string, minutes = UNLOCK_MINUTES, now = Date.now()): Promise<string> {
    const account = this.signedIn();
    let root: AccountRoot;
    try {
      root = await checkRecoveryKey(this.adapter(account), account.accountId, recoveryKey);
    } catch (error) {
      throw new CliError(said(error));
    }
    return this.opened(account, { root }, minutes, now, true);
  }

  /**
   * From a Passhold browser already in the account: this terminal asks, the
   * browser answers with its key, both show a code computed over both keys,
   * Passhold's name and the account, and once its owner says they match the
   * browser hands Passhold's key over, wrapped for this terminal alone. The
   * key is taken only if it opens Passhold's pin on the account.
   */
  async unlockWithBrowser(ask: PairingAsk, minutes = UNLOCK_MINUTES, now = Date.now()): Promise<string> {
    const account = this.signedIn();
    const api = this.adapter(account);
    const keys = await newPairingKeys();
    const { id, expiresAt } = await api.requestPairing({ publicKey: keys.publicKey, deviceName: deviceName() });
    const until = Math.min(expiresAt, Date.now() + (ask.timeoutMs ?? 5 * 60_000));
    let shown = false;
    for (;;) {
      const status = await api.pairingStatus(id);
      if (status.approverKey && !shown) {
        shown = true;
        ask.onCode(await pairingCode(account.accountId, id, keys.publicKey, status.approverKey));
      }
      if (status.status === 'approved' && status.approverKey && status.wrap) {
        const key = await openPairedKey(account.accountId, keys, id, status.approverKey, status.wrap);
        const state = await api.accountKeys();
        const pin = state.box ? await readPassholdPin(key, state.box.pin, account.accountId) : null;
        if (!pin) throw new CliError('The key that browser sent is not Passhold’s on this account. Nothing was taken.');
        return this.unlocked(account, key, pin.root, minutes, now);
      }
      if (Date.now() >= until) throw new CliError('No Passhold browser answered in time. Open Passhold in a browser signed in to this account, and try again.');
      await ask.wait(1_500);
    }
  }

  // --- the vault -----------------------------------------------------------------

  /**
   * A session and Passhold's key, for what the paid plans add. The link's
   * flows and a Send read the key, the account and the product's name; the
   * root is the extension's to pin, and nothing here seals to it.
   */
  async paid(unlocked: Unlocked): Promise<{ api: HttpSyncAdapter; productKey: ProductKey }> {
    const account = this.signedIn();
    return { api: this.adapter(account), productKey: await this.productKeyOf(account, unlocked) };
  }

  /**
   * The owner's plan, as the account's server names it now
   * (`GET /account/billing`), and kept for when it cannot be asked: a network
   * down, or a server that fails, takes nothing away. The free plan before
   * any answer. The server refuses on its own what a plan does not hold.
   */
  async plan(): Promise<Plan> {
    const account = this.signedIn();
    try {
      const plan = planFromBilling(await this.adapter(account).billing());
      const now = this.store.account() ?? account;
      if (now.plan !== plan) this.store.saveAccount({ ...now, plan });
      return plan;
    } catch {
      return readPlan(this.store.account()?.plan ?? account.plan);
    }
  }

  async requirePlan(feature: PaidFeature): Promise<Plan> {
    const plan = await this.plan();
    if (!planAllows(plan, feature)) throw new CliError('The command line is part of Premium, which this Keyrook account is not on.');
    return plan;
  }

  /** Passhold's key in the account, as the account's flows take it. */
  private async productKeyOf(account: StoredAccount, unlocked: Unlocked): Promise<ProductKey> {
    if (account.accountId !== unlocked.accountId) throw new CliError('That unlock is for another account. Run: eval "$(passhold unlock)"');
    const key = await importDataKey(unlocked.productKey);
    return { accountId: unlocked.accountId, product: PRODUCT, key, keyGeneration: 0, root: account.pinned ?? '', rootGeneration: 0, sheetVerifiedAt: null };
  }

  /** The vault's own records, pulled and opened in memory, with the revision of each and of the account: what a write goes up over. */
  private async read(account: StoredAccount, productKey: ProductKey): Promise<{ data: VaultData; known: Record<string, KnownRecord>; serverRev: number }> {
    const api = this.adapter(account);
    const records: RemoteRecord[] = [];
    let since = 0;
    for (;;) {
      const page = await api.pull(since);
      records.push(...(page.records as RemoteRecord[]));
      since = page.serverRev;
      if (!page.hasMore) break;
    }
    const pulled = await applyPulled(emptyData(), {}, records, await recordsKey(productKey.key));
    return { data: pulled.data, known: pulled.known, serverRev: since };
  }

  /**
   * The vault's own logins, cards, addresses, notes and SSH keys, read from
   * the account and opened in memory; with `shared`, each family's shared
   * vaults too (`families`). A record that does not open is passed over, as
   * in the extension; nothing is written. What a person should know of a
   * family — someone gone, a key to compare — is said through `tell`.
   */
  async open(unlocked: Unlocked, { shared }: { shared: boolean }, tell: (line: string) => void): Promise<Opened> {
    const account = this.signedIn();
    const productKey = await this.productKeyOf(account, unlocked);
    const { data, known, serverRev } = await this.read(account, productKey);
    const families = new Map<string, ProductFamily>();
    const links: FamilyLink[] = [];
    if (shared) {
      for (const { link, family } of await this.families(this.adapter(account), productKey, tell)) {
        links.push(link);
        families.set(link.orgId, family);
      }
    }
    return { data: { ...data, families: links }, known, serverRev, families };
  }

  /**
   * One item of the vault's own, changed and sent up as the extension's sync
   * sends it: sealed under Passhold's key, at the revision after the one the
   * account holds, and nothing else written. A device that changed the same
   * item a moment before wins the race: the item is read again and changed
   * again, once.
   */
  async writeItem(unlocked: Unlocked, id: string, change: (data: VaultData) => VaultData): Promise<VaultData> {
    const account = this.signedIn();
    const productKey = await this.productKeyOf(account, unlocked);
    const api = this.adapter(account);
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data, known, serverRev } = await this.read(account, productKey);
      const next = change(data);
      // That one item's record, and no other: the rest of the vault goes up from the extension, which holds it.
      const one = { items: next.items.filter((item) => item.id === id), wallet: next.wallet.filter((item) => item.id === id) };
      const plan = await planRecords(one, known[id] ? { [id]: known[id] } : {}, keyCodec(await recordsKey(productKey.key)), account.deviceId);
      if (!plan.records.length) return next;
      const pushed = await api.push(plan.records, serverRev);
      if (pushed.accepted.some((entry) => entry.id === id)) return next;
    }
    throw new CliError('Another device changed that item at the same moment. Try again.');
  }

  /** The families the account is in; none where the server offers none. */
  private async listed(api: HttpSyncAdapter): Promise<{ id: string; name: string }[]> {
    try {
      return (await api.orgs()).orgs.filter((org) => org.kind === 'family');
    } catch (error) {
      if (error instanceof SyncHttpError && error.code === 'not_offered') return [];
      throw error;
    }
  }

  /** What this terminal kept of a family, once `change` has been made to it. */
  private keepFamily(orgId: string, change: (kept: StoredFamily | undefined) => StoredFamily): StoredFamily {
    const now = this.signedIn();
    const next = change(now.families?.[orgId]);
    this.store.saveAccount({ ...now, families: { ...now.families, [orgId]: next } });
    return next;
  }

  /**
   * Each family the account is in, opened as a Passhold browser opens it
   * (`openFamily`): the roster checked against what this terminal pinned
   * before, its key taken only from someone pinned, each shared vault's
   * records pulled and opened under its key. One that will not open is said
   * and left out; the others, and the vault's own, are read all the same.
   */
  private async families(api: HttpSyncAdapter, productKey: ProductKey, tell: (line: string) => void): Promise<{ link: FamilyLink; family: ProductFamily }[]> {
    const opened: { link: FamilyLink; family: ProductFamily }[] = [];
    for (const org of await this.listed(api)) {
      const named = cleanAccountName(org.name) ?? org.id;
      const kept = this.signedIn().families?.[org.id];
      let answer;
      try {
        answer = await openFamily(api, { productKey, orgId: org.id, pinned: kept?.pin ?? null });
      } catch (error) {
        if (error instanceof DecryptionError && kept) {
          tell(`What this terminal kept of ${named} does not open with Passhold's key on this account now, so nothing of it was read. Sign in again to start afresh: passhold logout, then passhold login.`);
        } else {
          tell(`${named} did not open, so nothing of it was read: ${said(error)}`);
        }
        continue;
      }
      if (answer.status === 'waiting') {
        tell(`You are waiting for an organiser of ${named} to let you in. Its vaults are here once they have.`);
        continue;
      }
      if (answer.status === 'needs-root') {
        tell(`${named} opens once in Passhold in a browser, with the account's password. Its vaults are here after that.`);
        continue;
      }
      if (answer.status === 'compare') {
        tell(`${named}: its key came from ${this.nameIn(kept, answer.accountId)}, with a key this terminal has not seen for them, so nothing of it was read. Compare codes with them: passhold compare "${named}"`);
        continue;
      }
      const family = answer.family;
      const names = Object.fromEntries(family.detail.members.map((member) => [member.accountId, member.email]));
      const stored = this.keepFamily(org.id, (before) => ({
        pin: family.pinned,
        names: { ...before?.names, ...names },
        // Named once by the flows, and nowhere after: kept until shown, so a server putting someone out is seen.
        left: [...(before?.left ?? []), ...family.left.filter((id) => !before?.left.some((person) => person.accountId === id)).map((accountId) => ({ accountId, email: before?.names[accountId] ?? '' }))],
      }));
      for (const person of stored.left) tell(`${person.email || person.accountId} has left ${named}. passhold vaults shows this until you have read it.`);
      for (const change of family.keyChanged) {
        tell(`${named}: the key of ${this.nameIn(stored, change.accountId)} changed. Nothing new of theirs is taken until you compare codes: passhold compare "${named}"`);
      }
      opened.push({ link: await this.familyLink(api, family, named), family });
    }
    return opened;
  }

  private nameIn(kept: StoredFamily | undefined, accountId: string): string {
    return kept?.names[accountId] || accountId;
  }

  /** A family's shared vaults as the vault keeps them, from every record of the family the flows opened. */
  private async familyLink(api: HttpSyncAdapter, family: ProductFamily, named: string): Promise<FamilyLink> {
    const records: OpenedFamilyRecord[] = [];
    const unreadable: UnreadableRecord[] = [];
    for (let since = 0, page = 0; page < PAGES; page++) {
      const answer = await pullFamily<FamilyValue>(api, family, { since });
      records.push(...answer.records);
      unreadable.push(...answer.unreadable);
      since = answer.serverRev;
      if (!answer.hasMore) break;
    }
    // Someone gone still holds this key: what is written under it waits, as in the extension, for an organiser to change it.
    const due = new Set(family.detail.collections.filter((collection) => collection.rotationDue).map((collection) => collection.id));
    const vaults: FamilyVault[] = [];
    for (const collection of family.collections) {
      const base: FamilyVault = { id: collection.id, name: collection.name, generation: collection.generation, keyDue: due.has(collection.id), viewOnly: !collection.canEdit, items: [], wallet: [], known: {} };
      vaults.push((await mergeFamilyPulled(base, records, unreadable)).vault);
    }
    const lines = family.roster.body.members;
    const people = new Map(family.detail.members.map((member) => [member.accountId, member]));
    return {
      orgId: family.orgId,
      name: named,
      role: lines.find((line) => line.accountId === family.accountId)?.role === 'owner' ? 'owner' : 'member',
      members: lines.map((line) => ({
        accountId: line.accountId,
        email: people.get(line.accountId)?.email || line.accountId,
        name: cleanAccountName(people.get(line.accountId)?.name),
        role: line.role === 'owner' ? 'owner' : 'member',
        verified: line.verified,
      })),
      pin: family.pinned,
      keyChanged: family.keyChanged,
      left: [],
      state: { kind: 'open' },
      rotationDue: family.detail.org.rotationDue || due.size > 0,
      serverRev: 0,
      epoch: null,
      vaults,
    };
  }

  /** Those gone from each family since `passhold vaults` last showed them, and from now on not shown again. */
  readDepartures(): { family: string; email: string }[] {
    const account = this.signedIn();
    const told = Object.entries(account.families ?? {}).flatMap(([orgId, kept]) => kept.left.map((person) => ({ family: orgId, email: person.email || person.accountId })));
    if (told.length) {
      this.store.saveAccount({ ...account, families: Object.fromEntries(Object.entries(account.families ?? {}).map(([orgId, kept]) => [orgId, { ...kept, left: [] }])) });
    }
    return told;
  }

  /**
   * One change to one vault, sent as the extension sends it: the item at the
   * revision above the one the server held, sealed under the vault's key —
   * Passhold's in the account, or the shared vault's in its family. Only
   * that item goes up. A vault this account may only view, or whose key
   * someone gone still holds, is refused here before anything is sealed; the
   * server refuses the first again on its own.
   */
  async write(unlocked: Unlocked, opened: Opened, vault: Vault, change: Change): Promise<string> {
    const account = this.signedIn();
    const productKey = await this.productKeyOf(account, unlocked);
    const api = this.adapter(account);
    if (vault.orgId === null) {
      const { items, id } = change(opened.data);
      const plan = await planPush(items, opened.known, await recordsKey(productKey.key), account.deviceId);
      const records = plan.records.filter((record) => record.id === id);
      if (records.length) this.landed(await api.push(records, opened.serverRev), id);
      return id;
    }
    if (vault.viewOnly) throw new CliError(`You can view ${vault.name}, not change it.`);
    if (vault.keyDue) throw new CliError(`Someone who left ${vault.family} still holds the key to ${vault.name}. Nothing is written to it until an organiser changes it, as their Passhold does when it syncs.`);
    const family = opened.families.get(vault.orgId);
    const shared = opened.data.families.find((entry) => entry.orgId === vault.orgId)?.vaults.find((entry) => entry.id === vault.id);
    if (!family || !shared) throw new CliError(`${vault.name} is not open here. Run the command again.`);
    const { items, id } = change(shared);
    const plan = await planFamilyPush(items, shared.known);
    const sealed: OrgRecord[] = [];
    for (const record of plan.records.filter((entry) => entry.id === id)) {
      sealed.push(await sealFamilyRecord(family, { collectionId: vault.id, id: record.id, kind: record.kind, rev: record.rev, value: record.value, updatedAt: record.updatedAt, deviceId: account.deviceId }));
    }
    if (!sealed.length) return id;
    try {
      this.landed(await pushFamily<FamilyValue>(api, family, sealed), id);
    } catch (error) {
      if (error instanceof SyncHttpError && error.status === 409) throw new CliError(`The key to ${vault.name} changed just now, so nothing was written. Run the command again.`);
      throw error;
    }
    return id;
  }

  /** What the server did with the one item sent: taken, or refused with nothing kept anywhere — said, never passed over. */
  private landed(pushed: { accepted: { id: string }[]; rejectedForLimit?: unknown }, id: string): void {
    const limited = Array.isArray(pushed.rejectedForLimit) ? pushed.rejectedForLimit.map((entry) => (typeof entry === 'string' ? entry : (entry as { id?: string }).id)) : [];
    if (limited.includes(id)) throw new CliError('The account keeps no more items on its plan, so this was not saved. Nothing else was changed.');
    if (!pushed.accepted.some((entry) => entry.id === id)) throw new CliError('It was changed somewhere else meanwhile, so nothing was written. Run the command again.');
  }

  /**
   * The codes to compare for a family: the one for whoever its key came
   * from, unseen here, or one for each person whose key changed. Each is
   * taken only once its owner says the other screen shows the same code,
   * as the extension takes it.
   */
  async compare(unlocked: Unlocked, named: string, confirm: (who: string, code: string) => Promise<boolean>): Promise<number> {
    const account = this.signedIn();
    const productKey = await this.productKeyOf(account, unlocked);
    const api = this.adapter(account);
    const orgs = (await this.listed(api)).filter((org) => (cleanAccountName(org.name) ?? org.id).localeCompare(named, undefined, { sensitivity: 'accent' }) === 0 || org.id === named);
    if (orgs.length !== 1) throw new CliError(orgs.length ? `${orgs.length} families are named "${named}". Use an id: ${orgs.map((org) => org.id).join(', ')}` : `No family named "${named}".`);
    const orgId = orgs[0]!.id;
    let trusted = 0;
    for (let round = 0; round < 20; round++) {
      const kept = this.signedIn().families?.[orgId];
      const answer = await openFamily(api, { productKey, orgId, pinned: kept?.pin ?? null });
      let ask: { accountId: string; memberKey: string; code: string; pinned: StoredFamily['pin'] | null } | null = null;
      if (answer.status === 'compare') ask = { ...answer, pinned: kept?.pin ?? null };
      else if (answer.status === 'open' && answer.family.keyChanged.length) {
        const change = answer.family.keyChanged[0]!;
        ask = { ...change, code: await familyCompareCode(answer.family, change.accountId), pinned: answer.family.pinned };
      }
      if (!ask) return trusted;
      if (!(await confirm(this.nameIn(kept, ask.accountId), ask.code))) throw new CliError('Nothing was taken. Compare again once you have both codes in front of you.');
      const pin = await trustFamilyMember(productKey, { orgId, pinned: ask.pinned, accountId: ask.accountId, memberKey: ask.memberKey });
      this.keepFamily(orgId, (before) => ({ pin, names: before?.names ?? {}, left: before?.left ?? [] }));
      trusted++;
    }
    return trusted;
  }
}
