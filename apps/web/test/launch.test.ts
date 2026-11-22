/**
 * What the web vault does at launch, each line of it, against the account's
 * own server from the kit: the ways in (the password and its second step,
 * Google or GitHub, a passkey, the recovery key), Passhold's key joined on an
 * account made on the account's page and replaced when the server asks, a
 * family's shared vaults with one this account may only view, and what a
 * paid plan adds — versions, files kept with items, 2FA codes.
 *
 * `KEYROOK_KIT` names another kit to run against, as a server being built is
 * tried before it is copied here; the lines that need a server which gives a
 * web page its own sessions run only against one that does.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  consoleAcceptInvite,
  consoleAddPasskey,
  consoleConfirmMember,
  consoleCreateAccount,
  consoleCreateFamily,
  consoleSetCollectionAccess,
  consoleSignIn,
  createAccount,
  createProviderAccount,
  providerSession,
  HttpSyncAdapter,
  namedClient,
  passwordKeys,
  PASSKEY_PRF_INPUT,
  startRegistration,
  type Fetcher,
  type LoginResponse,
  type Tokens,
} from '@keyrook/account';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addLogin, emptyData, fetchFile, newProviderFlow, planPush, PRODUCT, recordsKey, storeFile, toBase64, type FileCalls } from '@passhold/core';
import type { CodesView, OpenedFile, VaultStatus } from '../../extension/src/lib/messaging.js';
import type { SignInStep, WebSession } from '../src/protocol.js';
import { WebVault } from '../src/worker/engine.js';

const KIT = process.env.KEYROOK_KIT ?? resolve(import.meta.dirname, '../../../vendor/keyrook-account-kit/server-kit.mjs');
const EXTENSION = 'chrome-extension://passholdtestextensionidaaaaaaaaa';
const WEB = 'http://localhost:5176';
const PAGE = 'http://localhost:5174';
const PASSWORD = 'Correct-Horse-Battery-9!';
/** The server gives a web page sessions of its own, Google and GitHub back to it, and the account's passkeys there. */
const PAGE_SESSIONS = existsSync(KIT) && (JSON.parse(readFileSync(resolve(dirname(KIT), 'messages.json'), 'utf8')) as { server: string[] }).server.includes('Approve the account page from an app. A web page cannot.');

interface SoftPasskey {
  credentialId: string;
  registration(): Record<string, unknown>;
  assertion(challenge: string, bend?: { clientData?: Record<string, unknown> }): Record<string, unknown>;
  prf(input: Uint8Array): Uint8Array | null;
}
interface Running {
  fetcher: Fetcher;
  fetcherFrom(origin: string): Fetcher;
  codeFor(email: string): string | undefined;
  close(): Promise<void>;
  sql: { query<T>(text: string, values?: unknown[]): Promise<T[]> };
}
interface Kit {
  startServer(options: Record<string, unknown>): Promise<Running>;
  standInProvider(name: string): unknown;
  softPasskey(options: { challenge: string; user: { id: string } }, made: { origin: string; rpId: string; prf?: boolean }): SoftPasskey;
  secondStepCode(secret: string, at?: number, steps?: number): string;
}

let kit: Kit;
let running: Running;
let browser: Fetcher;
let page: { baseUrl: string; fetcher: Fetcher };

beforeAll(async () => {
  if (!existsSync(KIT)) return;
  kit = (await import(/* @vite-ignore */ KIT)) as Kit;
  running = await kit.startServer({
    products: { passhold: [EXTENSION, WEB], console: [PAGE] },
    consoleUrl: PAGE,
    providers: { google: kit.standInProvider('google') },
    orgs: true,
    familyPlan: 'paid',
    personalPlan: 'paid',
    files: true,
  });
  browser = namedClient(running.fetcherFrom(EXTENSION), 'passhold/0.3.0');
  page = { baseUrl: '', fetcher: namedClient(running.fetcherFrom(PAGE), 'console/0.1.0') };
}, 60_000);
afterAll(async () => running?.close());

const BASE = 'http://kit.test';
/** The web vault's calls, from its origin, naming its build; the kit's addresses are named from a base it strips. */
const web: Fetcher = namedClient((input, init) => running.fetcherFrom(WEB)(String(input).replace(BASE, ''), init), 'passhold-web/0.1.0');

function connect(fetcher: Fetcher, answer: Pick<LoginResponse, 'accessToken' | 'refreshToken'>): HttpSyncAdapter {
  let tokens: Tokens | null = { accessToken: answer.accessToken, refreshToken: answer.refreshToken };
  return new HttpSyncAdapter({ baseUrl: '', fetcher, tokens: { get: async () => tokens, set: async (next) => void (tokens = next), clear: async () => void (tokens = null) } });
}

/** An account a Passhold browser made, with a login it sealed and sent. */
async function passholdAccount(email: string) {
  await startRegistration('', email, browser);
  const made = await createAccount({ baseUrl: '', fetcher: browser }, { email, code: running.codeFor(email)!, password: PASSWORD, product: PRODUCT, deviceId: `browser-${email}`, deviceName: 'Passhold · test' });
  const data = addLogin(emptyData(), { title: 'Bank', username: 'alice', password: 'bank-Secret-2!', urls: ['https://bank.example.test'], notes: '' }).data;
  const plan = await planPush(data, {}, await recordsKey(made.productKey.key), 'browser');
  await connect(browser, made.session).push(plan.records);
  return { email, id: made.session.account.id, made };
}

/** The account's page, signed in with the password, as it calls the server. */
async function pageSession(email: string) {
  const answer = (await consoleSignIn(page, { email, password: PASSWORD, deviceId: 'page', deviceName: 'Chrome' })) as LoginResponse;
  return connect(page.fetcher, answer);
}

function worker() {
  let kept: WebSession | null = null;
  const vault = new WebVault({
    baseUrl: BASE,
    fetcher: web,
    deviceName: 'Passhold on the web · Safari on iOS',
    emit: (message) => {
      if ('event' in message && message.event === 'session') kept = message.session;
    },
  });
  const ask = async <T,>(request: Parameters<WebVault['answer']>[0]): Promise<T> => {
    const envelope = await vault.answer(request);
    if (!envelope.ok) throw Object.assign(new Error(`${request.type}: ${envelope.key} ${envelope.error}`), { key: envelope.key });
    return envelope.value as T;
  };
  const refused = async (request: Parameters<WebVault['answer']>[0]) => {
    const envelope = await vault.answer(request);
    if (envelope.ok) throw new Error(`${request.type} was not refused`);
    return envelope.key;
  };
  const status = () => ask<VaultStatus>({ type: 'vault/status' });
  return { vault, ask, refused, status, kept: () => kept };
}

const unlocked = (status: VaultStatus) => {
  if (status.state !== 'unlocked') throw new Error('locked');
  return status;
};

describe.skipIf(!existsSync(KIT))('the ways into the web vault', () => {
  it('signs in with the password and the second step, and the step is never asked at an unlock', async () => {
    const owner = await passholdAccount('stepped@example.test');
    const api = await pageSession(owner.email);
    const { keys } = await passwordKeys(page, owner.email, PASSWORD);
    const { secret } = await api.beginSecondStep({ authHash: keys.authHash });
    const base = Math.floor(Date.now() / 30_000) * 30_000;
    await api.confirmSecondStep(kit.secondStepCode(secret, base, -1));
    const tab = worker();
    expect(await tab.ask<SignInStep>({ type: 'web/signIn', email: owner.email, password: PASSWORD })).toEqual({ step: 'secondStep', passkeys: false });
    expect(await tab.refused({ type: 'web/secondStep', answer: { code: '000000' } })).toMatch(/^error\./);
    expect(await tab.ask<SignInStep>({ type: 'web/secondStep', answer: { code: kit.secondStepCode(secret, base, 1) } })).toEqual({ step: 'open' });
    expect(unlocked(await tab.status()).data.items.map((item) => item.title)).toEqual(['Bank']);
    // A lock, and the password again: no second step.
    const again = worker();
    await again.ask({ type: 'web/start', session: tab.kept() });
    expect(await again.ask<SignInStep>({ type: 'web/unlock', password: PASSWORD })).toEqual({ step: 'open' });
  });

  it('opens with the account’s recovery key, and refuses one that is not the account’s', async () => {
    await startRegistration('', 'kit@example.test', page.fetcher);
    const made = await consoleCreateAccount(page, { email: 'kit@example.test', code: running.codeFor('kit@example.test')!, password: PASSWORD, deviceId: 'page', deviceName: 'Chrome' }, (answer) => connect(page.fetcher, answer));
    const tab = worker();
    await tab.ask({ type: 'web/signIn', email: 'kit@example.test', password: PASSWORD });
    const locked = worker();
    await locked.ask({ type: 'web/start', session: tab.kept() });
    const wrong = made.recoveryKey.replace(/[A-Z0-9]/, (character) => (character === 'A' ? 'B' : 'A'));
    expect(await locked.refused({ type: 'web/unlockRecoveryKey', recoveryKey: wrong })).toMatch(/^error\.account(KeyWrong|KitNotThis|KitShape)$/);
    expect(await locked.ask<SignInStep>({ type: 'web/unlockRecoveryKey', recoveryKey: made.recoveryKey })).toEqual({ step: 'open' });
  });

  /** Google, as a person goes through it from the page: the server's start, Google's answer to its callback, and what comes back to the page's address. */
  async function google(email: string) {
    const { verifier, challenge, state } = await newProviderFlow();
    const start = await running.fetcher(`/oauth/google/start?${new URLSearchParams({ client: 'web', origin: WEB, challenge, state })}`, { redirect: 'manual' });
    expect(start.status).toBe(302);
    const serverState = new URL(start.headers.get('location')!).searchParams.get('state')!;
    const back = await running.fetcher(`/oauth/google/callback?${new URLSearchParams({ code: email, state: serverState })}`, { redirect: 'manual' });
    const answer = new URL(back.headers.get('location')!);
    // Back to the page's own address, the answer in its fragment, for the sign-in this page began.
    expect(answer.origin).toBe(WEB);
    const fragment = new URLSearchParams(answer.hash.slice(1));
    expect(fragment.get('state')).toBe(state);
    return { ticket: fragment.get('ticket')!, verifier };
  }

  it.skipIf(!PAGE_SESSIONS)('signs in with Google from the page’s own address, and the data opens with the recovery key, never by Google', async () => {
    // An account made with Google, in a Passhold: no password, its recovery key the way back.
    const email = 'google@example.test';
    const first = await google(email);
    const made = await providerSession('', { ticket: first.ticket, verifier: first.verifier, deviceId: 'browser', deviceName: 'Passhold · test' }, running.fetcherFrom(WEB));
    if (made.status !== 'new') throw new Error(made.status);
    const { recoveryKey } = await createProviderAccount({ baseUrl: '', fetcher: running.fetcherFrom(WEB) }, { signupToken: made.signupToken, product: PRODUCT, deviceId: 'browser', deviceName: 'Passhold · test' });

    const tab = worker();
    const { ticket, verifier } = await google(email);
    expect(await tab.ask<SignInStep>({ type: 'web/provider', provider: 'google', ticket, verifier })).toEqual({ step: 'locked' });
    expect(await tab.ask({ type: 'web/ways' })).toEqual({ password: false, recoveryKey: true });
    expect((await tab.status()).state).toBe('locked');
    expect(await tab.ask<SignInStep>({ type: 'web/unlockRecoveryKey', recoveryKey })).toEqual({ step: 'open' });
    expect(unlocked(await tab.status()).account).toMatchObject({ email, passwordless: true });
    // A ticket is spent once.
    expect(await worker().refused({ type: 'web/provider', provider: 'google', ticket, verifier })).toMatch(/^error\./);
  });

  it.skipIf(!PAGE_SESSIONS)('tells an account with a password to sign in with it, when Google is not one of its ways', async () => {
    const owner = await passholdAccount('haspassword@example.test');
    const { ticket, verifier } = await google(owner.email);
    expect(await worker().refused({ type: 'web/provider', provider: 'google', ticket, verifier })).toBe('error.providerHasPassword');
  });

  it.skipIf(!PAGE_SESSIONS)('hands no Google or GitHub answer to a page the server does not list', async () => {
    const { challenge, state } = await newProviderFlow();
    for (const origin of ['https://evil.test', PAGE, 'http://localhost:5199']) {
      const start = await running.fetcher(`/oauth/google/start?${new URLSearchParams({ client: 'web', origin, challenge, state })}`, { redirect: 'manual' });
      expect([origin, start.status]).toEqual([origin, 400]);
    }
  });

  it.skipIf(!PAGE_SESSIONS)('signs in and opens with one of the account’s passkeys, its PRF answer kept in the worker, and again for a locked tab', async () => {
    const owner = await passholdAccount('passkey@example.test');
    let passkey: SoftPasskey | null = null;
    await consoleAddPasskey(await pageSession(owner.email), page, {
      proof: { email: owner.email, password: PASSWORD },
      name: 'Phone',
      make: async (options) => {
        passkey = kit.softPasskey(options.publicKey, { origin: PAGE, rpId: 'localhost', prf: true });
        return { answer: passkey.registration() as never, prf: passkey.prf(PASSKEY_PRF_INPUT) };
      },
    });
    const touch = async (tab: ReturnType<typeof worker>) => {
      const options = await tab.ask<{ challengeId: string; publicKey: { challenge: string } }>({ type: 'account/passkeyChallenge' });
      // Made on the account's page, touched on the vault's: the browser signs for the page in front.
      return { challengeId: options.challengeId, answer: passkey!.assertion(options.publicKey.challenge, { clientData: { origin: WEB } }) as never, prf: toBase64(passkey!.prf(PASSKEY_PRF_INPUT)!) };
    };
    const tab = worker();
    expect(await tab.ask<SignInStep>({ type: 'web/passkey', touch: await touch(tab) })).toEqual({ step: 'open' });
    expect(unlocked(await tab.status()).data.items.map((item) => item.title)).toEqual(['Bank']);
    const kept = tab.kept()!;
    const locked = worker();
    await locked.ask({ type: 'web/start', session: kept });
    expect(await locked.ask<SignInStep>({ type: 'web/passkey', touch: await touch(locked) })).toEqual({ step: 'open' });
    // Signed in again under the same device: the page keeps one device in the account's list.
    expect(locked.kept()!.deviceId).toBe(kept.deviceId);
    // A PRF answer that is not the passkey's opens nothing.
    const other = worker();
    const bent = { ...(await touch(other)), prf: toBase64(new Uint8Array(32)) };
    expect(await other.refused({ type: 'web/passkey', touch: bent })).toMatch(/^error\./);
  });
});

describe.skipIf(!existsSync(KIT))('Passhold’s key, from the web vault alone', () => {
  it('joins an account made on the account’s page, and checks its recovery key once', async () => {
    const email = 'joiner@example.test';
    await startRegistration('', email, page.fetcher);
    const made = await consoleCreateAccount(page, { email, code: running.codeFor(email)!, password: PASSWORD, deviceId: 'page', deviceName: 'Chrome' }, (answer) => connect(page.fetcher, answer));
    const tab = worker();
    expect(await tab.ask<SignInStep>({ type: 'web/signIn', email, password: PASSWORD })).toEqual({ step: 'open' });
    const status = unlocked(await tab.status());
    expect(status.data.items).toEqual([]);
    expect(status.account!.kit).toBe('unchecked');
    // Its key is on the account now, as any Passhold's: what is written here, another Passhold reads.
    const [box] = await running.sql.query<{ product: string }>("SELECT product FROM product_keys WHERE account_id = (SELECT id FROM accounts WHERE email_normalised = $1) AND product = 'passhold'", [email]);
    expect(box?.product).toBe('passhold');
    expect(await tab.refused({ type: 'account/checkKit', recoveryKey: 'ABCD-EFGH-JKMN-PQRS-TVWX-YZ01-2345-6789' })).toMatch(/^error\.accountKit/);
    await tab.ask({ type: 'account/checkKit', recoveryKey: made.recoveryKey });
    expect(unlocked(await tab.status()).account!.kit).toBe('elsewhere');
  });

  it('replaces Passhold’s key when the server asks, and every record goes up again under the new one', async () => {
    const owner = await passholdAccount('leaked@example.test');
    await running.sql.query("UPDATE product_keys SET must_replace = TRUE WHERE account_id = $1 AND product = 'passhold'", [owner.id]);
    const tab = worker();
    await tab.ask({ type: 'web/signIn', email: owner.email, password: PASSWORD });
    expect(unlocked(await tab.status()).data.items.map((item) => item.title)).toEqual(['Bank']);
    const [row] = await running.sql.query<{ must_replace: boolean; key_generation: number }>("SELECT must_replace, key_generation FROM product_keys WHERE account_id = $1 AND product = 'passhold'", [owner.id]);
    expect(row).toMatchObject({ must_replace: false, key_generation: 2 });
    // A new worker opens it under the new key alone: nothing was left sealed under the one before.
    const next = worker();
    await next.ask({ type: 'web/start', session: tab.kept() });
    await next.ask({ type: 'web/unlock', password: PASSWORD });
    expect(unlocked(await next.status()).data.items.map((item) => item.title)).toEqual(['Bank']);
    const [records] = await running.sql.query<{ count: string }>('SELECT count(*) FROM records WHERE account_id = $1 AND NOT deleted', [owner.id]);
    expect(Number(records!.count)).toBe(1);
  });
});

describe.skipIf(!existsSync(KIT))('a family’s shared vaults, in the web vault', () => {
  it('shows a shared vault, writes where it may, and refuses every change where it may only view', async () => {
    const minh = await passholdAccount('minh@example.test');
    const alice = await passholdAccount('alice@example.test');
    const proof = (email: string) => ({ email, password: PASSWORD });
    const orgId = (await consoleCreateFamily(await pageSession(minh.email), page, { name: 'Home', collectionName: 'Shared', proof: proof(minh.email) })).org.id;
    await (await pageSession(minh.email)).inviteToOrg(orgId, { email: alice.email, role: 'member' });
    await consoleAcceptInvite(await pageSession(alice.email), page, { orgId, proof: proof(alice.email) });
    await consoleConfirmMember(await pageSession(minh.email), page, { orgId, accountId: alice.id, proof: proof(minh.email), compare: async () => 'match' });

    // Minh, in the web vault, moves a login into the shared vault.
    const minhTab = worker();
    await minhTab.ask({ type: 'web/signIn', email: minh.email, password: PASSWORD });
    const mine = unlocked(await minhTab.status());
    const family = mine.data.families[0]!;
    const place = { orgId, vaultId: family.vaults[0]!.id };
    await minhTab.ask({ type: 'vault/mutate', mutation: { op: 'family/move', id: mine.data.items[0]!.id, place } });
    await minhTab.ask({ type: 'account/sync' });

    // Alice reads it; then she may only view it, and every change is refused, whatever the server would take.
    const aliceTab = worker();
    await aliceTab.ask({ type: 'web/signIn', email: alice.email, password: PASSWORD });
    const seen = unlocked(await aliceTab.status()).data.families[0]!.vaults[0]!;
    expect(seen.items.map((item) => item.title)).toEqual(['Bank']);
    await consoleSetCollectionAccess(await pageSession(minh.email), page, { orgId, collectionId: place.vaultId, accountId: alice.id, access: 'view', proof: proof(minh.email) });
    const viewer = worker();
    await viewer.ask({ type: 'web/signIn', email: alice.email, password: PASSWORD });
    const held = unlocked(await viewer.status()).data.families[0]!.vaults[0]!;
    expect(held.viewOnly).toBe(true);
    const id = held.items[0]!.id;
    for (const change of [
      { op: 'login/update', id, draft: { title: 'Bank', username: 'alice', password: 'Changed-Pass-1!', urls: [], notes: '' } },
      { op: 'login/trash', id },
      { op: 'login/add', draft: { title: 'New', username: '', password: 'x', urls: [], notes: '' } },
    ] as const) {
      expect(await viewer.refused({ type: 'vault/mutate', mutation: { op: 'family/change', place, change: change as never } })).toBe('error.viewOnly');
    }
    expect(await viewer.refused({ type: 'vault/mutate', mutation: { op: 'family/move', id: unlocked(await viewer.status()).data.items[0]!.id, place } })).toBe('error.viewOnly');
  });
});

describe.skipIf(!existsSync(KIT))('what a paid plan adds, in the web vault', () => {
  it('keeps every version of an edited login, and restores one', async () => {
    const owner = await passholdAccount('versions@example.test');
    const tab = worker();
    await tab.ask({ type: 'web/signIn', email: owner.email, password: PASSWORD });
    const login = unlocked(await tab.status()).data.items[0]!;
    await tab.ask({ type: 'vault/mutate', mutation: { op: 'login/update', id: login.id, draft: { title: 'Bank', username: 'alice', password: 'second-Secret-3!', urls: login.urls, notes: 'second' } } });
    const edited = unlocked(await tab.status()).data.items[0]!;
    expect(edited.versions?.length).toBeGreaterThan(0);
    // The plan as the server named it, read as the vault opened.
    expect(unlocked(await tab.status()).plan.versions).toBe(true);
    await tab.ask({ type: 'vault/mutate', mutation: { op: 'login/restoreVersion', id: login.id, savedAt: edited.versions![0]!.savedAt } });
    // The screens hold no password: it is asked for as it is shown, and the edit screen is handed the item whole.
    expect(unlocked(await tab.status()).data.items[0]!.password).toBe('••••••••');
    expect(await tab.ask({ type: 'item/reveal', id: login.id, secret: { kind: 'password' } })).toBe('bank-Secret-2!');
    // The password history keeps the one replaced, on any plan.
    const whole = await tab.ask<{ history: { password: string }[] }>({ type: 'item/full', id: login.id });
    expect(whole.history.map((entry) => entry.password)).toContain('second-Secret-3!');
    expect(await tab.ask({ type: 'item/reveal', id: login.id, secret: { kind: 'history', index: whole.history.findIndex((entry) => entry.password === 'second-Secret-3!') } })).toBe('second-Secret-3!');
  });

  it('adds a file to an item sealed where it is added, opens it again, and takes it off', async () => {
    const owner = await passholdAccount('files@example.test');
    const tab = worker();
    await tab.ask({ type: 'web/signIn', email: owner.email, password: PASSWORD });
    const itemId = unlocked(await tab.status()).data.items[0]!.id;
    const store: typeof fetch = (input, init) => running.fetcherFrom(WEB)(String(input).replace(BASE, ''), init) as never;
    // As the page does it (ui/attachments.ts): the worker makes every call to the account, the page moves the bytes.
    const calls: FileCalls = {
      beginFile: ({ id, size }) => tab.ask({ type: 'files/begin', itemId, id, size }),
      finishFile: async (id) => (await tab.ask({ type: 'files/finish', id })) as never,
      deleteFile: (id) => tab.ask({ type: 'files/cancel', id }),
    };
    const bytes = new TextEncoder().encode('the deed to the house');
    const added = await storeFile(calls, { bytes, name: 'deed.txt', type: 'text/plain', place: null }, store as never);
    await tab.ask({ type: 'files/attach', id: added.id, key: added.key, name: added.name, fileType: added.type, size: added.size });
    const shown = unlocked(await tab.status()).data.items[0]!;
    // The page is handed the file by name, never its key.
    expect(shown.attachments?.map((file) => [file.name, file.key])).toEqual([['deed.txt', '']]);
    const opened = await tab.ask<OpenedFile>({ type: 'files/open', itemId, fileId: added.id });
    expect(new TextDecoder().decode(await fetchFile(async () => ({ url: opened.url, size: opened.file.size, expiresAt: opened.expiresAt }), opened.file, store as never))).toBe('the deed to the house');
    await tab.ask({ type: 'vault/mutate', mutation: { op: 'file/detach', id: itemId, fileId: added.id } });
    await tab.ask({ type: 'account/sync' });
    expect(unlocked(await tab.status()).data.items[0]!.attachments ?? []).toEqual([]);
    const [left] = await running.sql.query<{ count: string }>('SELECT count(*) FROM files WHERE id = $1', [added.id]);
    expect(Number(left!.count)).toBe(0);
  });

  it('says where the 2FA codes are, as the link with Keyrook Authenticator stands', async () => {
    const owner = await passholdAccount('codes@example.test');
    const tab = worker();
    await tab.ask({ type: 'web/signIn', email: owner.email, password: PASSWORD });
    const id = unlocked(await tab.status()).data.items[0]!.id;
    // Nobody turned the link on: it is turned on on the account's page alone.
    expect(await tab.ask<CodesView>({ type: 'codes/forLogin', id })).toEqual({ status: 'off' });
  });
});
