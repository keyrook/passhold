/**
 * The web vault's worker against the account's own server from the kit: it
 * signs in from the vault's origin, opens what the extension sealed, writes
 * as the extension writes, opens nothing in a new worker until the password
 * is typed again, and takes nothing from a server that bends what it holds.
 * The public tree has no kit, and these are skipped there.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createAccount, HttpSyncAdapter, namedClient, startRegistration, type Fetcher, type LoginResponse, type ProductKey, type Tokens } from '@keyrook/account';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addLogin, addWalletItem, applyPulled, emptyData, planPush, PRODUCT, recordsKey, type LoginItem, type VaultData } from '@passhold/core';
import type { VaultStatus } from '../../extension/src/lib/messaging.js';
import type { FromWorker, SignInStep, WebSession } from '../src/protocol.js';
import { WebVault } from '../src/worker/engine.js';

const KIT = process.env.KEYROOK_KIT ?? resolve(import.meta.dirname, '../../../vendor/keyrook-account-kit/server-kit.mjs');
const EXTENSION = 'chrome-extension://passholdtestextensionidaaaaaaaaa';
/** Where Passhold's tests serve the web vault, listed under Passhold as production lists vault.keyrook.com. */
const WEB = 'http://localhost:5176';
const PAGE = 'http://localhost:5174';
const PASSWORD = 'Correct-Horse-Battery-9!';

interface Kit {
  startServer(options: Record<string, unknown>): Promise<{
    fetcherFrom(origin: string): Fetcher;
    codeFor(email: string): string | undefined;
    close(): Promise<void>;
    sql: { query<T>(text: string, values?: unknown[]): Promise<T[]> };
  }>;
}

let running: Awaited<ReturnType<Kit['startServer']>>;
let browser: Fetcher;
let web: Fetcher;
/** Every request the web vault sent, by method and path. */
const sent: string[] = [];

beforeAll(async () => {
  if (!existsSync(KIT)) return;
  const kit = (await import(/* @vite-ignore */ KIT)) as Kit;
  running = await kit.startServer({ products: { passhold: [EXTENSION, WEB], console: [PAGE] }, consoleUrl: PAGE });
  browser = namedClient(running.fetcherFrom(EXTENSION), 'passhold/0.3.0');
  const fromPage = running.fetcherFrom(WEB);
  web = namedClient(async (input, init) => {
    sent.push(`${init?.method ?? 'GET'} ${String(input).split('?')[0]}`);
    return fromPage(input, init);
  }, 'passhold-web/0.1.0');
}, 60_000);
afterAll(async () => running?.close());

function session(fetcher: Fetcher, answer: Pick<LoginResponse, 'accessToken' | 'refreshToken'>): HttpSyncAdapter {
  let tokens: Tokens | null = { accessToken: answer.accessToken, refreshToken: answer.refreshToken };
  return new HttpSyncAdapter({ baseUrl: '', fetcher, tokens: { get: async () => tokens, set: async (next) => void (tokens = next), clear: async () => void (tokens = null) } });
}

/** An account a Passhold browser made, with two logins and a note it sealed and sent as the extension's sync does. */
async function account(email: string, contents?: (data: VaultData) => VaultData) {
  await startRegistration('', email, browser);
  const made = await createAccount({ baseUrl: '', fetcher: browser }, { email, code: running.codeFor(email)!, password: PASSWORD, product: PRODUCT, deviceId: `browser-${email}`, deviceName: 'Passhold · test' });
  let data = addLogin(emptyData(), { title: 'Bank', username: 'alice', password: 'bank-Secret-2!', urls: ['https://bank.example.test'], notes: '' }).data;
  data = addLogin(data, { title: 'Mail', username: 'alice@mail.test', password: 'mail-Secret-3!', urls: ['https://mail.example.test'], notes: '' }).data;
  data = addWalletItem(data, { kind: 'note', title: 'Wi-Fi', text: 'pass-7Q!-river' }).data;
  if (contents) data = contents(data);
  const api = session(browser, made.session);
  const plan = await planPush(data, {}, await recordsKey(made.productKey.key), 'browser');
  expect((await api.push(plan.records)).accepted).toHaveLength(plan.records.length);
  return { email, id: made.session.account.id, productKey: made.productKey as ProductKey, api, data };
}

/** A worker as the page starts one: what it said back to the page is kept, as the page keeps it. */
function worker() {
  const heard: FromWorker[] = [];
  let kept: WebSession | null = null;
  const vault = new WebVault({
    baseUrl: '',
    fetcher: web,
    deviceName: 'Passhold on the web · Safari on iOS',
    emit: (message) => {
      heard.push(message);
      if ('event' in message && message.event === 'session') kept = message.session;
    },
  });
  const ask = async <T,>(request: Parameters<WebVault['answer']>[0]): Promise<T> => {
    const envelope = await vault.answer(request);
    if (!envelope.ok) throw Object.assign(new Error(envelope.error), { key: envelope.key });
    return envelope.value as T;
  };
  const refused = async (request: Parameters<WebVault['answer']>[0]): Promise<string | undefined> => {
    const envelope = await vault.answer(request);
    if (envelope.ok) throw new Error(`${request.type} was not refused`);
    return envelope.key;
  };
  return { vault, ask, refused, heard, kept: () => kept };
}

const titles = (status: VaultStatus) => (status.state === 'unlocked' ? [...status.data.items.map((item) => item.title), ...status.data.wallet.map((item) => item.title)].sort() : null);

describe.skipIf(!existsSync(KIT))('the web vault’s worker, on the account’s own server', () => {
  it('opens what the extension sealed with the account’s password, and holds nothing before', async () => {
    const owner = await account('reader@example.test');
    const tab = worker();
    expect((await tab.ask<VaultStatus>({ type: 'vault/status' })).state).toBe('locked');
    expect(await tab.refused({ type: 'vault/mutate', mutation: { op: 'login/trash', id: owner.data.items[0]!.id } })).toBe('error.locked');
    const step = await tab.ask<SignInStep>({ type: 'web/signIn', email: owner.email, password: PASSWORD });
    expect(step).toEqual({ step: 'open' });
    const status = await tab.ask<VaultStatus>({ type: 'vault/status' });
    expect(titles(status)).toEqual(['Bank', 'Mail', 'Wi-Fi']);
    // The page is handed the vault without the account's key and session, and without a password it has not asked for.
    expect(status.state === 'unlocked' && status.data.account).toBeNull();
    for (const secret of ['bank-Secret-2!', 'mail-Secret-3!']) expect(JSON.stringify(status)).not.toContain(secret);
    const bank = owner.data.items.find((item) => item.title === 'Bank')!;
    expect(await tab.ask({ type: 'item/reveal', id: bank.id, secret: { kind: 'password' } })).toBe('bank-Secret-2!');
    // Only a hidden value is asked for so, and only of an item the vault holds.
    expect(await tab.refused({ type: 'item/reveal', id: bank.id, secret: { kind: 'number' } })).toBe('error.itemNotFound');
    expect(await tab.refused({ type: 'item/reveal', id: 'not-here', secret: { kind: 'password' } })).toBe('error.itemNotFound');
    expect(JSON.stringify(status)).not.toContain(tab.kept()!.refreshToken);
    // The page keeps the tab's sign-in, which opens nothing by itself.
    expect(tab.kept()).toMatchObject({ accountId: owner.id, email: owner.email });
  });

  it('writes as the extension writes: a change here is what the extension’s Passhold reads back', async () => {
    const owner = await account('writer@example.test');
    const tab = worker();
    await tab.ask({ type: 'web/signIn', email: owner.email, password: PASSWORD });
    const bank = owner.data.items.find((item) => item.title === 'Bank')!;
    await tab.ask({ type: 'vault/mutate', mutation: { op: 'login/update', id: bank.id, draft: { title: 'Bank', username: 'alice', password: 'new-Bank-Secret-4!', urls: bank.urls, notes: 'changed on the web' } } });
    await tab.ask({ type: 'vault/mutate', mutation: { op: 'login/add', draft: { title: 'Shop', username: 'al', password: 'shop-Secret-5!', urls: ['https://shop.example.test'], notes: '' } } });
    await tab.ask({ type: 'vault/mutate', mutation: { op: 'wallet/trash', id: owner.data.wallet[0]!.id } });
    await tab.ask({ type: 'account/sync' });
    expect(await tab.ask({ type: 'web/syncState' })).toEqual({ syncing: false, unsent: 0, failed: null });

    const pulled = await applyPulled(owner.data, {}, (await owner.api.pull(0)).records, await recordsKey(owner.productKey.key));
    const read = (title: string) => pulled.data.items.find((item: LoginItem) => item.title === title);
    expect(read('Bank')).toMatchObject({ password: 'new-Bank-Secret-4!', notes: 'changed on the web' });
    // The password it replaced is kept in the login's history, as everywhere.
    expect(read('Bank')!.history.map((entry) => entry.password)).toContain('bank-Secret-2!');
    expect(read('Shop')?.password).toBe('shop-Secret-5!');
    expect(pulled.data.wallet[0]!.deletedAt).not.toBeNull();
    expect(pulled.skipped).toBe(0);
  });

  it('opens nothing in a new worker until the password is typed again, and then asks for no new sign-in', async () => {
    const owner = await account('locked@example.test');
    const first = worker();
    await first.ask({ type: 'web/signIn', email: owner.email, password: PASSWORD });
    const kept = first.kept()!;

    // The lock: a new worker, handed only the tab's sign-in.
    const next = worker();
    expect(await next.ask<SignInStep>({ type: 'web/start', session: kept })).toEqual({ step: 'locked' });
    expect((await next.ask<VaultStatus>({ type: 'vault/status' })).state).toBe('locked');
    const asked: Parameters<WebVault['answer']>[0][] = [
      { type: 'vault/mutate', mutation: { op: 'login/add', draft: { title: 'x', username: '', password: 'x', urls: [], notes: '' } } },
      { type: 'files/open', itemId: owner.data.items[0]!.id, fileId: 'f' },
      { type: 'codes/forLogin', id: owner.data.items[0]!.id },
      { type: 'account/sync' },
    ];
    for (const request of asked) {
      expect(await next.refused(request)).toBe('error.locked');
    }
    // Handed twice, it keeps what it was handed first: a page cannot swap the session under an open vault.
    expect(await next.refused({ type: 'web/start', session: kept })).toBe('error.unknown');

    expect(await next.refused({ type: 'web/unlock', password: 'not-the-password' })).toBe('error.accountKeyWrong');
    expect((await next.ask<VaultStatus>({ type: 'vault/status' })).state).toBe('locked');

    sent.length = 0;
    expect(await next.ask<SignInStep>({ type: 'web/unlock', password: PASSWORD })).toEqual({ step: 'open' });
    expect(titles(await next.ask<VaultStatus>({ type: 'vault/status' }))).toEqual(['Bank', 'Mail', 'Wi-Fi']);
    // Opened here, with the account's keys as the server holds them: no sign-in, no second step.
    expect(sent.filter((call) => /\/auth\/(login|second-step|passkey)/.test(call))).toEqual([]);
  });

  it('sends what was changed when asked before a lock, and says what could not go', async () => {
    const owner = await account('flusher@example.test');
    const tab = worker();
    await tab.ask({ type: 'web/signIn', email: owner.email, password: PASSWORD });
    const bank = owner.data.items.find((item) => item.title === 'Bank')!;
    await tab.ask({ type: 'vault/mutate', mutation: { op: 'login/trash', id: bank.id } });
    // Asked at once, before the round the change set going: it is waited for, and nothing is left unsent.
    expect(await tab.ask({ type: 'web/flush' })).toEqual({ syncing: false, unsent: 0, failed: null });
    const pulled = await applyPulled(owner.data, {}, (await owner.api.pull(0)).records, await recordsKey(owner.productKey.key));
    expect(pulled.data.items.find((item: LoginItem) => item.id === bank.id)!.deletedAt).not.toBeNull();
    // The page is told how many changes wait, to ask before the tab is closed on them.
    expect(tab.heard.some((message) => 'event' in message && message.event === 'unsent' && message.count === 1)).toBe(true);
  });

  it('signs the tab out on the server too', async () => {
    const owner = await account('leaver@example.test');
    const tab = worker();
    await tab.ask({ type: 'web/signIn', email: owner.email, password: PASSWORD });
    const kept = tab.kept()!;
    await tab.ask({ type: 'web/signOut' });
    expect(tab.kept()).toBeNull();
    expect((await tab.ask<VaultStatus>({ type: 'vault/status' })).state).toBe('locked');
    // What the page kept opens nothing anywhere now.
    const after = worker();
    await after.ask({ type: 'web/start', session: kept });
    expect(await after.refused({ type: 'web/unlock', password: PASSWORD })).toMatch(/^error\.account(SignedOut|Failed)$/);
  });
});

describe.skipIf(!existsSync(KIT))('the web vault, against a server that bends what it holds', () => {
  /** The account's records as the server holds them, by id. */
  const records = (accountId: string) => running.sql.query<{ id: string; kind: string; rev: number; box: unknown }>('SELECT id, kind, rev, box FROM records WHERE account_id = $1', [accountId]);
  /** What the server writes is new to every device: its counter moves on. */
  const bump = async (accountId: string, id: string, set: string, values: unknown[]) => {
    const [row] = await running.sql.query<{ server_rev: string | number }>('UPDATE accounts SET server_rev = server_rev + 1 WHERE id = $1 RETURNING server_rev', [accountId]);
    await running.sql.query(`UPDATE records SET ${set}, server_rev = $3 WHERE account_id = $1 AND id = $2`, [accountId, id, Number(row!.server_rev), ...values]);
  };
  const opened = async (email: string) => {
    const tab = worker();
    await tab.ask({ type: 'web/signIn', email, password: PASSWORD });
    return titles(await tab.ask<VaultStatus>({ type: 'vault/status' }));
  };

  it('opens no record of another kind, another revision or another account, and none moved under another id', async () => {
    // One login the server leaves alone: it opens, so what does not is what was bent.
    const owner = await account('bent@example.test', (data) => addLogin(data, { title: 'Untouched', username: 'al', password: 'un-Secret-7!', urls: [], notes: '' }).data);
    const other = await account('other@example.test', (data) => addLogin(data, { title: 'Theirs', username: 'eve', password: 'eve-Secret-6!', urls: [], notes: '' }).data);
    const [bank, mail] = ['Bank', 'Mail'].map((title) => owner.data.items.find((item) => item.title === title)!);
    const note = owner.data.wallet[0]!;
    const held = await records(owner.id);
    const box = (id: string) => held.find((row) => row.id === id)!.box;
    // Mail's box under Bank's id; the note's record called a login; a login one revision on.
    await bump(owner.id, bank!.id, 'box = $4', [box(mail!.id)]);
    await bump(owner.id, note.id, "kind = 'passhold.login'", []);
    await bump(owner.id, mail!.id, 'rev = rev + 1', []);
    // And another account's login, handed to this one under its own id.
    const theirs = (await records(other.id)).find((row) => row.kind === 'passhold.login' && !owner.data.items.some((item) => item.id === row.id))!;
    const [row] = await running.sql.query<{ server_rev: string | number }>('UPDATE accounts SET server_rev = server_rev + 1 WHERE id = $1 RETURNING server_rev', [owner.id]);
    await running.sql.query("INSERT INTO records (account_id, id, kind, server_rev, rev, deleted, updated_at, device_id, box, product) VALUES ($1, $2, 'passhold.login', $3, 1, FALSE, 0, 'server', $4, 'passhold')", [owner.id, theirs.id, Number(row!.server_rev), JSON.stringify(theirs.box)]);
    expect(await opened(owner.email)).toEqual(['Untouched']);
  });

  it('keeps a login the server alone says is deleted', async () => {
    const owner = await account('kept@example.test');
    const bank = owner.data.items.find((item) => item.title === 'Bank')!;
    await bump(owner.id, bank.id, 'deleted = TRUE, box = NULL, rev = rev + 1', []);
    // Nothing held here yet, nothing to lose: the record is skipped, never taken as a deletion of anything sealed.
    expect(await opened(owner.email)).toEqual(['Mail', 'Wi-Fi']);
    // A sealed deletion is the only kind any Passhold takes, and the server wrote none.
    const pulled = await applyPulled(owner.data, {}, (await owner.api.pull(0)).records, await recordsKey(owner.productKey.key));
    expect(pulled.data.items.map((item) => item.title).sort()).toEqual(['Bank', 'Mail']);
  });

  it('refuses to open Passhold’s key from a box that does not match its pin, or another account’s', async () => {
    const owner = await account('boxed@example.test');
    const other = await account('boxer@example.test');
    const [theirs] = await running.sql.query<{ box: unknown; pin: unknown }>("SELECT box, pin FROM product_keys WHERE account_id = $1 AND product = 'passhold'", [other.id]);
    // Their pin beside this account's box: it opens under neither key.
    await running.sql.query("UPDATE product_keys SET pin = $2 WHERE account_id = $1 AND product = 'passhold'", [owner.id, JSON.stringify(theirs!.pin)]);
    const tab = worker();
    expect(await tab.refused({ type: 'web/signIn', email: owner.email, password: PASSWORD })).toMatch(/^error\./);
    expect((await tab.ask<VaultStatus>({ type: 'vault/status' })).state).toBe('locked');
    // Their box, sealed to their root: this account's root does not open it.
    await running.sql.query("UPDATE product_keys SET box = $2 WHERE account_id = $1 AND product = 'passhold'", [owner.id, JSON.stringify(theirs!.box)]);
    const again = worker();
    expect(await again.refused({ type: 'web/signIn', email: owner.email, password: PASSWORD })).toMatch(/^error\./);
    expect((await again.ask<VaultStatus>({ type: 'vault/status' })).state).toBe('locked');
  });
});
