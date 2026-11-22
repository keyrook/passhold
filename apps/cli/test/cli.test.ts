/**
 * The command line against the Keyrook account's own server, from
 * keyrook-account's kit (test/kit.ts): an account made as Passhold makes one,
 * its logins sealed and sent as the extension sends them, then read back from
 * a terminal these tests play.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve as path } from 'node:path';
import {
  AUTHENTICATOR,
  consoleCreateFamily,
  consoleLinkProducts,
  consoleSignIn,
  createAccount,
  createProviderAccount,
  HttpSyncAdapter,
  login,
  namedClient,
  openProductKey,
  openSend,
  passwordKeys,
  readSendLink,
  startRegistration,
  type Fetcher,
  type LoginResponse,
  type Tokens,
} from '@keyrook/account';
import { afterAll, describe, expect, it } from 'vitest';
import {
  addLinkedCode,
  addLogin,
  applyPulled,
  attachmentsOf,
  emptyData,
  fetchFile,
  newPairingKeys,
  pairingCode,
  planPush,
  PRODUCT,
  readTotpSetup,
  recordsKey,
  totpCode,
  updateLogin,
  websitesOf,
  wrapKeyForPairing,
} from '@passhold/core';
import { APP_ID, clientName } from '../src/account.js';
import type { Context } from '../src/cli.js';
import { CliError, parseReference, resolve } from '../src/reference.js';
import { contents, DEVICE, forgetHomes, KIT, ORIGIN, PAGE, PASSWORD, server, terminal } from './kit.js';

afterAll(forgetHomes);

/** A terminal whose bytes, written as they are (`Context.write`), the test keeps. */
function terminalOf(passhold: ReturnType<typeof terminal>['passhold'], env: NodeJS.ProcessEnv) {
  return {
    run: (argv: string[], into: Uint8Array[]) => passhold(argv, [], '', { write: (bytes) => void into.push(bytes) }),
    env,
  };
}

describe('a reference', () => {
  it('is passhold://vault/item/field, each part written as an address writes it', () => {
    expect(parseReference('passhold://personal/My%20bank/One%2FTwo')).toEqual({ vault: 'personal', item: 'My bank', field: 'One/Two' });
    for (const text of ['passhold://personal/Bank', 'passhold://personal//password', 'https://personal/Bank/password', 'passhold://personal/Bank/password/more', 'passhold://personal/%E0%A4%A/x']) {
      expect(() => parseReference(text)).toThrow(CliError);
    }
  });

  it('names one item, by id or by a name only one has, and one field of its kind or of its own', async () => {
    let data = await contents();
    const bank = data.items.find((item) => item.title === 'Bank')!;
    expect(resolve(data, 'passhold://personal/Bank/password')).toBe('bank-Secret-2!');
    expect(resolve(data, `passhold://personal/${bank.id}/username`)).toBe('alice');
    expect(resolve(data, 'passhold://Personal/database/port')).toBe('5432');
    expect(resolve(data, 'passhold://personal/Wi-Fi/text')).toBe('pass-7Q!-river');
    expect(resolve(data, 'passhold://personal/Deploy%20key/private_key')).toContain('BEGIN OPENSSH PRIVATE KEY');
    expect(() => resolve(data, 'passhold://personal/Bank/pin')).toThrow(/has no field "pin"/);
    expect(() => resolve(data, 'passhold://family/Bank/password')).toThrow(/No vault named/);
    expect(() => resolve(data, 'passhold://personal/Nothing/password')).toThrow(/Nothing is named/);
    // Two of a name: never the first of them.
    data = addLogin(data, { title: 'Bank', username: 'bob', password: 'other', urls: [], notes: '' }).data;
    expect(() => resolve(data, 'passhold://personal/Bank/password')).toThrow(/2 items are named "Bank"/);
    // What is in the trash is not there to be read.
    const trashed = { ...data, items: data.items.map((item) => ({ ...item, deletedAt: 1 })) };
    expect(() => resolve(trashed, `passhold://personal/${bank.id}/password`)).toThrow(/Nothing is named/);
  });
});

describe('passhold generate', () => {
  it('makes a password of the length and kinds asked for, with no account at all', async () => {
    const { passhold } = terminal('generate', fetch);
    const made = await passhold(['generate', '--length', '40', '--no-symbols', '--no-upper']);
    expect(made.code).toBe(0);
    expect(made.out.trim()).toMatch(/^[a-z0-9]{40}$/);
    expect((await passhold(['generate', '--length', '4'])).err).toMatch(/whole number from 8 to 128/);
  });
});

describe.skipIf(!existsSync(KIT))('passhold, signed in', { timeout: 60_000 }, () => {
  it('signs in with the account’s email and password, unlocks with the password, and reads the vault from the account', async () => {
    const { running, from, browser, send } = await server();
    const email = 'alice@example.test';
    await startRegistration('', email, browser);
    const made = await createAccount({ baseUrl: '', fetcher: browser }, { email, code: running.codeFor(email)!, password: PASSWORD, product: PRODUCT, ...DEVICE });
    await send(made.session, made.productKey.key, await contents());

    const { home, env, passhold, unlock } = terminal('password', from);
    // Nothing is read before signing in, nor before unlocking.
    expect((await passhold(['list'])).err).toMatch(/Passhold is locked/);
    expect((await passhold(['unlock'], [PASSWORD])).err).toMatch(/Not signed in/);
    expect((await passhold(['login', '--email', email], ['not the password'])).code).toBe(1);
    expect((await passhold(['login', '--email', email], [PASSWORD])).err).toMatch(/Signed in as alice@example.test/);
    expect((await passhold(['list'])).err).toMatch(/Passhold is locked/);
    expect((await unlock([], ['not the password'])).code).toBe(1);
    expect((await unlock([], [PASSWORD])).code).toBe(0);

    const list = await passhold(['list']);
    expect(list.out.split('\n').filter(Boolean).map((line) => line.split('\t').slice(1))).toEqual([
      ['login', 'Bank', 'alice', 'personal'],
      ['login', 'Database', 'app', 'personal'],
      ['ssh', 'Deploy key', '', 'personal'],
      ['note', 'Wi-Fi', '', 'personal'],
    ]);
    expect(JSON.parse((await passhold(['list', '--search', 'bank', '--json'])).out)).toMatchObject([{ kind: 'login', name: 'Bank', username: 'alice' }]);
    expect((await passhold(['get', 'passhold://personal/Database/password'])).out).toBe('db-Secret-1!\n');
    expect((await passhold(['get', 'Bank'])).out).toBe('bank-Secret-2!\n');
    expect((await passhold(['get', 'Bank', '--field', 'username'])).out).toBe('alice\n');
    expect(JSON.parse((await passhold(['get', 'Database', '--json'])).out)).toMatchObject({ kind: 'login', title: 'Database', fields: [{ name: 'Port', value: '5432' }] });
    expect((await passhold(['get', 'passhold://personal/Database/nothing'])).code).toBe(1);

    // run: a reference in the environment becomes its value for the command alone, which is not handed the session.
    env.DB_PASSWORD = 'passhold://personal/Database/password';
    const ran = await passhold(['run', '--', process.execPath, '-e', 'process.stdout.write(`${process.env.DB_PASSWORD} ${process.env.PORT} ${process.env.PASSHOLD_SESSION}`); process.exit(7)'], [], '');
    expect(ran.code).toBe(7);
    expect(ran.out).toBe('db-Secret-1! undefined undefined');
    delete env.DB_PASSWORD;
    mkdirSync(home, { recursive: true });
    writeFileSync(path(home, 'app.env'), '# the app\nexport PORT="passhold://personal/Database/Port"\nPLAIN=as-it-is\n');
    const fromFile = await passhold(['run', '--env-file', path(home, 'app.env'), '--', process.execPath, '-e', 'process.stdout.write(`${process.env.PORT} ${process.env.PLAIN}`)']);
    expect(fromFile.out).toBe('5432 as-it-is');

    // inject: each reference in a template, and nothing else, replaced.
    const template = 'user: {{ passhold://personal/Database/username }}\npass: {{passhold://personal/Database/password}}\nkept: {{ not a reference }}\n';
    expect((await passhold(['inject'], [], template)).out).toBe('user: app\npass: db-Secret-1!\nkept: {{ not a reference }}\n');
    writeFileSync(path(home, 'config.tpl'), template);
    expect((await passhold(['inject', '--in', path(home, 'config.tpl'), '--out', path(home, 'config.yml')])).code).toBe(0);
    expect(readFileSync(path(home, 'config.yml'), 'utf8')).toContain('pass: db-Secret-1!');
    expect(statSync(path(home, 'config.yml')).mode & 0o077).toBe(0);
    expect((await passhold(['inject'], [], '{{ passhold://personal/Nothing/password }}')).code).toBe(1);

    // export: everything out in plain text asks for the owner again.
    expect((await passhold(['export'], ['not the password'])).out).toBe('');
    const csv = await passhold(['export'], [PASSWORD]);
    expect(csv.out.split(/\r?\n/)[0]).toBe('name,url,username,password,note');
    expect(csv.out).toContain('bank-Secret-2!');
    const json = JSON.parse((await passhold(['export', '--format', 'json'], [PASSWORD])).out) as { items: unknown[]; wallet: { kind: string }[] };
    expect([json.items.length, json.wallet.map((item) => item.kind).sort()]).toEqual([2, ['note', 'ssh']]);

    // On disk: who is signed in and a sealed unlock, for its owner alone, and nothing a login holds.
    const kept = ['account.json', 'session.json'].map((file) => readFileSync(path(home, file), 'utf8')).join('\n');
    for (const secret of ['db-Secret-1!', 'bank-Secret-2!', PASSWORD, env.PASSHOLD_SESSION!]) expect(kept).not.toContain(secret);
    expect(statSync(path(home, 'session.json')).mode & 0o077).toBe(0);

    // The unlock is the shell's: without its key, or once locked, or once its time is up, nothing opens.
    const session = env.PASSHOLD_SESSION!;
    delete env.PASSHOLD_SESSION;
    expect((await passhold(['get', 'Bank'])).err).toMatch(/Passhold is locked/);
    env.PASSHOLD_SESSION = session.replace(/^./, (first) => (first === 'A' ? 'B' : 'A'));
    expect((await passhold(['get', 'Bank'])).err).toMatch(/does not open this unlock/);
    env.PASSHOLD_SESSION = session;
    const edited = JSON.parse(readFileSync(path(home, 'session.json'), 'utf8')) as { expiresAt: number };
    writeFileSync(path(home, 'session.json'), JSON.stringify({ ...edited, expiresAt: edited.expiresAt + 3_600_000 }));
    expect((await passhold(['get', 'Bank'])).err).toMatch(/does not open this unlock/);
    expect((await passhold(['lock'])).code).toBe(0);
    expect((await passhold(['get', 'Bank'])).err).toMatch(/Passhold is locked/);
    expect((await passhold(['logout'])).code).toBe(0);
    expect(existsSync(path(home, 'account.json'))).toBe(false);
    await running.close();
  });

  it('reads the plan from the account: not given on the free plan, given when a family pays, and kept when the server cannot say', async () => {
    const email = 'alice@example.test';
    let billingDown = false;
    const { running, from, browser } = await server({ personalPlan: 'free', orgs: true, familyPlan: 'paid', products: { passhold: [ORIGIN], console: [PAGE] }, consoleUrl: PAGE });
    await startRegistration('', email, browser);
    const made = await createAccount({ baseUrl: '', fetcher: browser }, { email, code: running.codeFor(email)!, password: PASSWORD, product: PRODUCT, ...DEVICE });
    // The terminal's requests, with the plan's route failing when a test says so.
    const through: Fetcher = (input, init) => (billingDown && input.includes('/account/billing') ? Promise.reject(new TypeError('Failed to fetch')) : from(input, init));
    const { passhold, unlock } = terminal('plan', through);
    expect((await passhold(['login', '--email', email], [PASSWORD])).code).toBe(0);
    expect((await unlock([], [PASSWORD])).code).toBe(0);

    // The free plan: the command line is not given, generating a password still is.
    expect((await passhold(['list'])).err).toMatch(/part of Premium/);
    expect((await passhold(['generate'])).code).toBe(0);

    // A family Alice runs, on a paid plan: hers counts as paid.
    const page = namedClient(running.fetcherFrom(PAGE), 'console/0.1.0');
    const onPage = (await consoleSignIn({ baseUrl: '', fetcher: page }, { email, password: PASSWORD, deviceId: 'page', deviceName: 'Page' })) as LoginResponse;
    let pageTokens: Tokens | null = { accessToken: onPage.accessToken, refreshToken: onPage.refreshToken };
    const pageApi = new HttpSyncAdapter({ baseUrl: '', fetcher: page, tokens: { get: async () => pageTokens, set: async (next) => void (pageTokens = next), clear: async () => void (pageTokens = null) } });
    await consoleCreateFamily(pageApi, { baseUrl: '', fetcher: page }, { name: 'Home', collectionName: 'Shared', proof: { email, password: PASSWORD } });
    expect((await passhold(['list'])).code).toBe(0);

    // The server cannot be asked: the last answer stands, and nothing paid is taken away by a network.
    billingDown = true;
    expect((await passhold(['list'])).code).toBe(0);
    expect(made.productKey.product).toBe(PRODUCT);
    await running.close();
  });

  it('signs in with Google in the person’s browser, as the phone apps do, and unlocks with the recovery key or from a Passhold browser', async () => {
    const { running, from, browser, send, connect } = await server();
    const email = 'bob@example.test';
    // The account, made in a browser with Google: no password opens it.
    const signIn = async (fetcher: Fetcher, query: Record<string, string>) => {
      const start = await fetcher(`/oauth/google/start?${new URLSearchParams(query)}`);
      const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
      return fetcher(`/oauth/google/callback?${new URLSearchParams({ state, code: email })}`);
    };
    const back = await (await signIn(browser, { ext: 'abcdefghijklmnopabcdefghijklmnop', challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', state: 'client-state-0001', return: 'message' })).text();
    const ticket = new URLSearchParams(/data-answer="([^"]+)"/.exec(back)?.[1]?.replace(/&amp;/g, '&') ?? /answer[^?]*\?([^"']+)/.exec(back)?.[1] ?? '').get('ticket');
    const session = await (await browser('/oauth/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ticket, verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', ...DEVICE }) })).json();
    const made = await createProviderAccount({ baseUrl: '', fetcher: browser }, { signupToken: session.signupToken, product: PRODUCT, ...DEVICE });
    await send(made.session, made.productKey.key, await contents());

    // The terminal's browser: it follows the start address to Google and back, and the page the
    // terminal serves hands the answer's fragment to the listener it came from.
    let opened = '';
    const { passhold, unlock } = terminal('provider', from, {
      browse: (url, listener) => {
        opened = url;
        void (async () => {
          const query = Object.fromEntries(new URL(url, 'http://server').searchParams);
          const answer = (await signIn(namedClient(from, clientName()), query)).headers.get('location')!;
          // Back to the terminal's own listener, never to an app's address.
          expect(answer.startsWith(`http://127.0.0.1:${listener.port}/oauth#`)).toBe(true);
          const page = await fetch(`http://127.0.0.1:${listener.port}/oauth`);
          expect(await page.text()).toContain('/oauth/answer');
          // An answer for another sign-in ends nothing.
          expect((await fetch(`http://127.0.0.1:${listener.port}/oauth/answer`, { method: 'POST', body: 'ticket=stolen&state=another' })).status).toBe(400);
          await fetch(`http://127.0.0.1:${listener.port}/oauth/answer`, { method: 'POST', body: answer.slice(answer.indexOf('#') + 1) });
        })();
      },
    });
    const signedIn = await passhold(['login', '--google']);
    expect(signedIn.err).toMatch(/Signed in as bob@example.test/);
    const asked = new URL(opened, 'http://server').searchParams;
    expect([asked.get('return'), asked.get('app'), Number(asked.get('port')) > 0, asked.get('challenge')?.length, asked.has('verifier')]).toEqual(['app', APP_ID, true, 43, false]);

    // No password opens this account; its recovery key does.
    expect((await unlock([], ['anything'])).code).toBe(1);
    expect((await unlock(['--recovery-key'], ['AAAA-AAAA-AAAA-AAAA-AAAA-AAAA-AAAA-AAAA'])).code).toBe(1);
    expect((await unlock(['--recovery-key'], [made.recoveryKey])).code).toBe(0);
    expect((await passhold(['get', 'passhold://personal/Bank/password'])).out).toBe('bank-Secret-2!\n');
    expect((await passhold(['lock'])).code).toBe(0);

    // Or a Passhold browser already in lets the terminal in, once both show the same code.
    const api = connect(made.session);
    const accountId = made.productKey.accountId;
    let shown = '';
    const approving = (async () => {
      for (let tries = 0; tries < 200; tries++) {
        const [request] = await api.openPairings();
        if (request) {
          const keys = await newPairingKeys();
          await api.acceptPairing(request.id, keys.publicKey);
          shown = await pairingCode(accountId, request.id, request.requesterKey, keys.publicKey);
          await api.approvePairing(request.id, await wrapKeyForPairing(accountId, made.productKey.key, keys, request.id, request.requesterKey));
          return;
        }
        await new Promise((done) => setTimeout(done, 25));
      }
    })();
    const paired = await unlock(['--with-browser'], []);
    await approving;
    expect(paired.code).toBe(0);
    expect(paired.err).toContain(shown);
    expect(shown).not.toBe('');
    expect((await passhold(['get', 'Database'])).out).toBe('db-Secret-1!\n');
    await running.close();
  });
});

describe.skipIf(!existsSync(KIT))('passhold totp and passhold send, on a paid plan', { timeout: 60_000 }, () => {
  const paid = { personalPlan: 'paid', send: true, files: true, products: { passhold: [ORIGIN], console: [PAGE] }, consoleUrl: PAGE };

  /** Alice's account, made in a browser with the vault's contents, and a terminal signed in and unlocked. */
  /** `extra` may be made from the server's own fetcher: to stand between the terminal and it. */
  async function alice(options: Record<string, unknown> = paid, more: Partial<Context> | ((from: Fetcher) => Partial<Context>) = {}) {
    const kit = await server(options);
    const extra = typeof more === 'function' ? more(kit.from) : more;
    const email = 'alice@example.test';
    await startRegistration('', email, kit.browser);
    const made = await createAccount({ baseUrl: '', fetcher: kit.browser }, { email, code: kit.running.codeFor(email)!, password: PASSWORD, product: PRODUCT, ...DEVICE });
    const data = await contents();
    await kit.send(made.session, made.productKey.key, data);
    const shell = terminal(`paid-${Math.random().toString(36).slice(2)}`, kit.from, extra);
    expect((await shell.passhold(['login', '--email', email], [PASSWORD])).code).toBe(0);
    expect((await shell.unlock([], [PASSWORD])).code).toBe(0);
    return { ...kit, ...shell, email, made, data };
  }

  it('prints the 2FA code the link holds for a login, matched by its site, and says where the link is turned on', async () => {
    const at = Date.now();
    const { running, passhold, connect, made, data, email } = await alice(paid, { now: () => at });
    const off = await passhold(['totp', 'passhold://personal/Database']);
    expect([off.code, off.out]).toEqual([1, '']);
    expect(off.err).toMatch(/account\.keyrook\.com\/#links/);

    // Authenticator signed in on a phone, and the account page turning the link on.
    const phone = namedClient(running.fetcher, 'authenticator/1.0.0');
    const { keys } = await passwordKeys({ baseUrl: '', fetcher: phone }, email, PASSWORD);
    const onPhone = await login('', { email, authHash: keys.authHash, deviceId: 'phone', deviceName: 'Phone' }, phone);
    let tokens: Tokens | null = { accessToken: onPhone.accessToken, refreshToken: onPhone.refreshToken };
    const phoneApi = new HttpSyncAdapter({ baseUrl: '', fetcher: phone, tokens: { get: async () => tokens, set: async (next) => void (tokens = next), clear: async () => void (tokens = null) } });
    await openProductKey(phoneApi, { accountId: onPhone.account.id, product: AUTHENTICATOR, unlockWith: { keys } });
    const page = namedClient(running.fetcherFrom(PAGE), 'console/0.1.0');
    const onPage = (await consoleSignIn({ baseUrl: '', fetcher: page }, { email, password: PASSWORD, deviceId: 'page', deviceName: 'Page' })) as LoginResponse;
    let pageTokens: Tokens | null = { accessToken: onPage.accessToken, refreshToken: onPage.refreshToken };
    const pageApi = new HttpSyncAdapter({ baseUrl: '', fetcher: page, tokens: { get: async () => pageTokens, set: async (next) => void (pageTokens = next), clear: async () => void (pageTokens = null) } });
    await consoleLinkProducts(pageApi, { baseUrl: '', fetcher: page }, { products: [AUTHENTICATOR, PRODUCT], proof: { email, password: PASSWORD } });

    // A code added in the browser for the database's site.
    const database = data.items.find((item) => item.title === 'Database')!;
    const setup = readTotpSetup('JBSWY3DPEHPK3PXP')!;
    await addLinkedCode(connect(made.session), made.productKey, setup, websitesOf(database));

    const printed = await passhold(['totp', 'passhold://personal/Database']);
    expect(printed.out).toBe(`${(await totpCode(setup, at)).code}\n`);
    expect((await passhold(['totp', 'Database'])).out).toBe(printed.out);
    expect((await passhold(['totp', 'passhold://personal/Wi-Fi'])).err).toMatch(/goes with a login/);
    await running.close();
  });

  it('sends text, a file, or a copy of a login after its owner again, by a link printed once', async () => {
    const { running, passhold, connect, made, env } = await alice();
    const opened = (url: string, password?: string) => openSend('', readSendLink(new URL(url).hash.slice(1))!, password, running.fetcher, running.fetcher);

    const text = await passhold(['send', 'the', 'door', 'code', 'is', '4821', '--opens', '2', '--expires', '1h']);
    expect(text.code).toBe(0);
    expect(text.err).toMatch(/Opens 2 times/);
    expect((await opened(text.out.trim())).body.text).toBe('the door code is 4821');

    // A copy of a login is plain text out: the password again, or nothing is made.
    expect((await passhold(['send', 'passhold://personal/Bank'], ['not the password'])).out).toBe('');
    expect((await connect(made.session).sends()).sends).toHaveLength(1);
    const copy = await passhold(['send', 'passhold://personal/Bank', '--password'], [PASSWORD, 'between-us']);
    const item = (await opened(copy.out.trim(), 'between-us')).body.item!;
    expect(item.name).toBe('Bank');
    expect(item.fields).toContainEqual({ label: 'Password', value: 'bank-Secret-2!', hidden: true });

    mkdirSync(env.PASSHOLD_HOME!, { recursive: true });
    const file = path(env.PASSHOLD_HOME!, 'report.txt');
    writeFileSync(file, 'quarterly numbers');
    const sent = await opened((await passhold(['send', '--file', file, '--expires', '7d'])).out.trim());
    const [attached] = sent.body.files!;
    expect(attached!.name).toBe('report.txt');
    expect(new TextDecoder().decode(await sent.file(attached!.id))).toBe('quarterly numbers');
    expect((await passhold(['send', 'x', '--expires', '2w'])).err).toMatch(/--expires is 1h, 1d, 7d or 30d/);
    await running.close();
  });

  it('keeps a file with an item, sealed here: listed, read back, written out and deleted, and the extension opens it', async () => {
    const { running, from, passhold, connect, made, env } = await alice();
    const written: Uint8Array[] = [];
    const shell = terminalOf(passhold, env);
    mkdirSync(env.PASSHOLD_HOME!, { recursive: true });
    const scan = path(env.PASSHOLD_HOME!, 'passport.pdf');
    const secret = '%PDF-1.7 passport number P1234567';
    writeFileSync(scan, secret);

    const added = await passhold(['file', 'add', 'passhold://personal/Bank', scan]);
    expect(added.code).toBe(0);
    const id = added.out.trim();
    expect(added.err).toMatch(/Sealed and kept with Bank/);

    const listed = await passhold(['file', 'list', 'Bank']);
    expect(listed.out).toBe(`${id}\t${secret.length}\tpassport.pdf\n`);
    // What opens it never reaches the output, with --json or without.
    const json = await passhold(['file', 'list', 'Bank', '--json']);
    expect(JSON.parse(json.out)).toEqual([expect.objectContaining({ id, name: 'passport.pdf', type: 'application/pdf', size: secret.length })]);
    expect(JSON.parse(json.out)[0]).not.toHaveProperty('key');
    expect(JSON.parse((await passhold(['get', 'Bank', '--json'])).out).attachments[0]).not.toHaveProperty('key');

    // As the extension reads it: the record names the file, and its key opens what the store holds.
    const records = (await connect(made.session).pull(0)).records;
    const vault = (await applyPulled(emptyData(), {}, records as never, await recordsKey(made.productKey.key))).data;
    const named = attachmentsOf(vault.items.find((item) => item.title === 'Bank')!)[0]!;
    expect(new TextDecoder().decode(await fetchFile(() => connect(made.session).fileAddress(named.id), named, from))).toBe(secret);
    // The server holds no name, and the store nothing readable.
    const rows = await running.sql.query<Record<string, unknown>>('SELECT * FROM files');
    expect(JSON.stringify(rows)).not.toMatch(/passport/);

    const out = await shell.run(['file', 'get', 'Bank', 'passport.pdf'], written);
    expect([out.code, new TextDecoder().decode(written[0])]).toEqual([0, secret]);
    const target = path(env.PASSHOLD_HOME!, 'out.pdf');
    expect((await passhold(['file', 'get', 'Bank', id, '--out', target])).code).toBe(0);
    expect(readFileSync(target, 'utf8')).toBe(secret);
    expect(statSync(target).mode & 0o777).toBe(0o600);

    const gone = await passhold(['file', 'rm', 'Bank', 'passport.pdf']);
    expect([gone.code, gone.err]).toEqual([0, expect.stringMatching(/Deleted passport.pdf from Bank/)]);
    expect((await passhold(['file', 'list', 'Bank'])).out).toBe('');
    expect((await connect(made.session).files()).used).toBe(0);
    expect((await passhold(['file', 'get', 'Bank', 'passport.pdf'])).err).toMatch(/No file named "passport.pdf"/);
    await running.close();
  });

  it('refuses a file the store hands back changed, writing nothing, and keeps another device’s edit made at the same moment', async () => {
    let bend: ((bytes: Uint8Array) => Uint8Array) | null = null;
    let race: (() => Promise<void>) | null = null;
    const hostile =
      (from: Fetcher): Fetcher =>
      async (input, init) => {
        if (race && input.startsWith('/sync') && init?.method === 'POST') {
          const now = race;
          race = null;
          await now();
        }
        const answer = await from(input, init);
        if (!bend || !input.startsWith('/__files/') || (init?.method ?? 'GET') !== 'GET') return answer;
        return new Response(bend(new Uint8Array(await answer.arrayBuffer())) as BodyInit, { status: 200 });
      };
    const kit = await alice(paid, (from) => ({ fetcher: hostile(from) }));
    const { running, passhold, connect, made, env } = kit;
    mkdirSync(env.PASSHOLD_HOME!, { recursive: true });
    const note = path(env.PASSHOLD_HOME!, 'note.txt');
    writeFileSync(note, 'the real file');

    // The browser changes the Bank login just before the terminal sends its own change of it.
    race = async () => {
      const key = await recordsKey(made.productKey.key);
      const pulled = await applyPulled(emptyData(), {}, (await connect(made.session).pull(0)).records as never, key);
      const bank = pulled.data.items.find((item) => item.title === 'Bank')!;
      const edited = updateLogin(pulled.data, bank.id, { title: 'Bank', username: 'alice', password: 'changed-Elsewhere-3!', urls: bank.urls, notes: bank.notes }, Date.now() + 1);
      const plan = await planPush({ ...edited, items: edited.items.filter((item) => item.id === bank.id), wallet: [] }, pulled.known, key, 'other-browser');
      await connect(made.session).push(plan.records);
    };
    expect((await passhold(['file', 'add', 'Bank', note])).code).toBe(0);
    expect((await passhold(['get', 'passhold://personal/Bank/password'])).out.trim()).toBe('changed-Elsewhere-3!');
    expect((await passhold(['file', 'list', 'Bank'])).out).toMatch(/note\.txt/);

    bend = (bytes) => bytes.map((value, at) => (at === 3 ? value ^ 1 : value));
    const target = path(env.PASSHOLD_HOME!, 'bent.txt');
    const refused = await passhold(['file', 'get', 'Bank', 'note.txt', '--out', target]);
    expect([refused.code, refused.out, existsSync(target)]).toEqual([1, '', false]);
    bend = () => new TextEncoder().encode('a file of the server’s own');
    expect((await passhold(['file', 'get', 'Bank', 'note.txt'])).out).toBe('');
    await running.close();
  });

  it('is refused on the free plan, as the whole command line is, and keeps nothing', async () => {
    const { running, passhold, connect, made } = await alice({ ...paid, personalPlan: 'free' });
    const refused = await passhold(['send', 'hello']);
    expect([refused.code, refused.out]).toEqual([1, '']);
    expect(refused.err).toMatch(/part of Premium/);
    expect(await connect(made.session).sends().catch(() => null)).not.toEqual({ sends: [expect.anything()] });
    await running.close();
  });
});
