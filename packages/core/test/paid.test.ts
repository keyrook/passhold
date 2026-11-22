/**
 * What the paid plans add, against the Keyrook account's own server from the
 * kit: the codes the link shares with Keyrook Authenticator, a Send, the
 * breach check and emergency access, each as Passhold runs it, and each
 * refused on a plan that does not hold it, with nothing taken away.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  AUTHENTICATOR,
  consoleCreateFamily,
  consoleLinkProducts,
  consoleSignIn,
  createAccount,
  createSend,
  HttpSyncAdapter,
  login,
  namedClient,
  newContactKey,
  openContactKey,
  openLink,
  openProductKey,
  openSend,
  passwordKeys,
  pullLink,
  readEmergencyVault,
  readSendLink,
  startRegistration,
  type AccountServer,
  type Fetcher,
  type LoginResponse,
  type ProductKey,
  type Tokens,
} from '@keyrook/account';
import { describe, expect, it } from 'vitest';
import {
  addLinkedCode,
  addLogin,
  base32Bytes,
  codeFitsLogin,
  emergencyView,
  emptyData,
  exposedLogins,
  handOverEmergency,
  loginCopy,
  planFromBilling,
  planPush,
  PRODUCT,
  readEmergency,
  readLinkedCodes,
  readTotpSetup,
  recordsKey,
  showCode,
  totpCode,
  trustEmergency,
  websitesOf,
  type VaultData,
} from '@passhold/core';

const KIT = resolve(import.meta.dirname, '../../../vendor/keyrook-account-kit/server-kit.mjs');
const ORIGIN = 'chrome-extension://passholdtestextensionidaaaaaaaaa';
const PAGE = 'http://localhost:5174';
const PASSWORD = 'Correct-Horse-Battery-9!';
const DEVICE = { deviceId: 'a', deviceName: 'Passhold · test' };
const LABELS = { username: 'Username', password: 'Password', website: 'Website', notes: 'Notes' };

describe('two-step codes', () => {
  // RFC 6238, appendix B: the secret is "12345678901234567890" in ASCII.
  const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

  it('works out the RFC’s codes, and says when each stops', async () => {
    expect(await totpCode({ secret, algorithm: 'SHA1', digits: 8, period: 30 }, 59_000)).toEqual({ code: '94287082', expiresAt: 60_000 });
    expect((await totpCode({ secret, algorithm: 'SHA1', digits: 8, period: 30 }, 1_111_111_109_000)).code).toBe('07081804');
    expect((await totpCode({ secret, algorithm: 'SHA1', digits: 6, period: 30 }, 2_000_000_000_000)).code).toBe('279037');
  });

  it('reads a setup key as sites write it, or a QR code’s address, and nothing else', () => {
    expect(base32Bytes('gezd gnbv-gy3t qojq')).toEqual(base32Bytes('GEZDGNBVGY3TQOJQ'));
    expect(readTotpSetup('jbsw y3dp ehpk 3pxp')).toMatchObject({ secret: 'JBSWY3DPEHPK3PXP', algorithm: 'SHA1', digits: 6, period: 30 });
    expect(readTotpSetup('otpauth://totp/Example:alice%40example.test?secret=JBSWY3DPEHPK3PXP&issuer=Example&digits=8&algorithm=SHA256')).toEqual({
      secret: 'JBSWY3DPEHPK3PXP',
      algorithm: 'SHA256',
      digits: 8,
      period: 30,
      issuer: 'Example',
      label: 'alice@example.test',
    });
    // A counter's code, a short or broken key, an algorithm no site uses.
    expect(readTotpSetup('otpauth://hotp/Example?secret=JBSWY3DPEHPK3PXP&counter=1')).toBeNull();
    expect(readTotpSetup('JBSWY3DP')).toBeNull();
    expect(readTotpSetup('not a key at all')).toBeNull();
    expect(readTotpSetup('otpauth://totp/x?secret=JBSWY3DPEHPK3PXP&algorithm=MD5')).toBeNull();
  });

  it('goes with a login by the site, never another site’s login', () => {
    const login = { urls: ['https://accounts.example.com/signin'] };
    expect(websitesOf(login)).toEqual(['example.com']);
    expect(codeFitsLogin(['example.com'], login)).toBe(true);
    expect(codeFitsLogin(['example.org'], login)).toBe(false);
    // A private suffix is a site of its own: alice’s code is not mallory’s.
    expect(codeFitsLogin(['alice.github.io'], { urls: ['https://mallory.github.io'] })).toBe(false);
  });
});

async function server(options: Record<string, unknown> = {}) {
  const kit = (await import(/* @vite-ignore */ KIT)) as typeof import('../../../vendor/keyrook-account-kit/server-kit.mjs');
  const running = await kit.startServer({ products: { passhold: [ORIGIN], console: [PAGE] }, consoleUrl: PAGE, ...options });
  const fetcher: Fetcher = namedClient(running.fetcherFrom(ORIGIN), 'passhold/0.1.0');
  const page: AccountServer = { baseUrl: '', fetcher: namedClient(running.fetcherFrom(PAGE), 'console/0.1.0') };
  const phone: AccountServer = { baseUrl: '', fetcher: namedClient(running.fetcher, 'authenticator/1.0.0') };
  const connect = (answer: Pick<LoginResponse, 'accessToken' | 'refreshToken'>, through: Fetcher = fetcher) => {
    let tokens: Tokens | null = { accessToken: answer.accessToken, refreshToken: answer.refreshToken };
    return new HttpSyncAdapter({ baseUrl: '', fetcher: through, tokens: { get: async () => tokens, set: async (next) => void (tokens = next), clear: async () => void (tokens = null) } });
  };
  /** An account made in Passhold, with Passhold's key, and a session to call with. */
  const signUp = async (email: string) => {
    await running.resetMailLimits(email);
    await startRegistration('', email, fetcher);
    const made = await createAccount({ baseUrl: '', fetcher }, { email, code: running.codeFor(email)!, password: PASSWORD, product: PRODUCT, ...DEVICE });
    return { api: connect(made.session), session: made.session, productKey: made.productKey, accountId: made.productKey.accountId };
  };
  /** Keyrook Authenticator on a phone, signed in with the same password: its own key. */
  const authenticator = async (email: string) => {
    const { keys } = await passwordKeys(phone, email, PASSWORD);
    const signedIn = await login('', { email, authHash: keys.authHash, deviceId: 'phone', deviceName: 'Phone' }, phone.fetcher);
    const api = connect(signedIn, phone.fetcher);
    const opened = await openProductKey(api, { accountId: signedIn.account.id, product: AUTHENTICATOR, unlockWith: { keys } });
    // The first time on this account: its key is made, and sealed to the root.
    if (opened.status !== 'open' && opened.status !== 'joined') throw new Error(`Authenticator's key: ${opened.status}`);
    return { api, productKey: opened.productKey };
  };
  /** The account page turning the link on, after the password. */
  const linkOnPage = async (email: string) => {
    const signedIn = (await consoleSignIn(page, { email, password: PASSWORD, deviceId: 'page', deviceName: 'Page' })) as LoginResponse;
    await consoleLinkProducts(connect(signedIn, page.fetcher), page, { products: [AUTHENTICATOR, PRODUCT], proof: { email, password: PASSWORD } });
  };
  /** Passhold's session again, its every request seen: what a server would be sent. */
  const watched = (session: Pick<LoginResponse, 'accessToken' | 'refreshToken'>) => {
    const sent: { path: string; body: string }[] = [];
    const api = connect(session, (input, init) => {
      sent.push({ path: input, body: typeof init?.body === 'string' ? init.body : '' });
      return fetcher(input, init);
    });
    return { api, sent };
  };
  /** Sends what a vault holds, sealed under Passhold's key, as the extension's sync does. */
  const send = async (api: HttpSyncAdapter, productKey: ProductKey, data: VaultData) => {
    const plan = await planPush(data, {}, await recordsKey(productKey.key), DEVICE.deviceId);
    await api.push(plan.records);
  };
  return { running, connect, signUp, authenticator, linkOnPage, send, watched };
}

const refusal = (promise: Promise<unknown>) => promise.then(() => null, (error: Error) => error.message);

describe.skipIf(!existsSync(KIT))('the paid plans, on the Keyrook account’s server', { timeout: 60_000 }, () => {
  it('reads the plan as the server bills it: paid, free, or paid by a family the account runs', async () => {
    const paid = await server({ personalPlan: 'paid' });
    expect(planFromBilling(await (await paid.signUp('alice@example.test')).api.billing())).toBe('personal-premium');
    const free = await server({ personalPlan: 'free', orgs: true, familyPlan: 'paid' });
    const bob = await free.signUp('bob@example.test');
    expect(planFromBilling(await bob.api.billing())).toBe('personal');
    const page: AccountServer = { baseUrl: '', fetcher: namedClient(free.running.fetcherFrom(PAGE), 'console/0.1.0') };
    const onPage = (await consoleSignIn(page, { email: 'bob@example.test', password: PASSWORD, deviceId: 'page', deviceName: 'Page' })) as LoginResponse;
    await consoleCreateFamily(free.connect(onPage, page.fetcher), page, { name: 'Home', collectionName: 'Shared', proof: { email: 'bob@example.test', password: PASSWORD } });
    expect(planFromBilling(await bob.api.billing())).toBe('personal-premium');
    await Promise.all([paid.running.close(), free.running.close()]);
  });

  it('shows the codes the link holds beside the login they are for, and writes one Authenticator takes in', async () => {
    const { running, signUp, authenticator, linkOnPage } = await server({ personalPlan: 'paid' });
    const email = 'alice@example.test';
    const passhold = await signUp(email);
    const phone = await authenticator(email);

    // Nobody turned the link on: it is turned on on the account page, and Passhold says so.
    expect(await readLinkedCodes(passhold.api, passhold.productKey)).toEqual({ status: 'off' });
    await linkOnPage(email);
    const linked = await readLinkedCodes(passhold.api, passhold.productKey);
    expect(linked).toMatchObject({ status: 'open', codes: [] });

    // Add a 2FA code, on a login for example.com.
    const login = addLogin(emptyData(), { title: 'Example', username: 'alice', password: 'Secret-1!', urls: ['https://www.example.com/login'], notes: '' }).item;
    const setup = readTotpSetup('otpauth://totp/Example:alice?secret=JBSWY3DPEHPK3PXP&issuer=Example')!;
    const added = await addLinkedCode(passhold.api, passhold.productKey, setup, websitesOf(login));
    expect(added.status).toBe('open');

    // Read again, as another opening of the popup would: there, and beside this login only.
    const again = await readLinkedCodes(passhold.api, passhold.productKey);
    if (again.status !== 'open') throw new Error(again.status);
    expect(again.codes).toHaveLength(1);
    expect(codeFitsLogin(again.codes[0]!.websites, login)).toBe(true);
    const shown = await showCode(again.codes[0]!, 59_000);
    expect(shown).toEqual({ id: again.codes[0]!.id, issuer: 'Example', label: 'alice', period: 30, ...(await totpCode(setup, 59_000)) });
    expect(Object.keys(shown)).not.toContain('secret');

    // Authenticator reads it from its side of the link, marked as Passhold's: it is never only here.
    const side = await openLink(phone.api, phone.productKey, PRODUCT);
    if (side.status !== 'open') throw new Error(side.status);
    const pulled = await pullLink(phone.api, side.link, { since: 0 });
    expect(pulled.records.map((record) => record.value)).toEqual([{ ...setup, websites: ['example.com'], from: PRODUCT }]);

    // What the server holds of it is sealed: no secret, no site.
    const dump = JSON.stringify(await running.sql.query('SELECT * FROM link_records'));
    expect(dump).not.toContain('JBSWY3DPEHPK3PXP');
    expect(dump).not.toContain('example.com');
    await running.close();
  });

  it('says the codes are part of Premium on a free plan, and the link is still there', async () => {
    const { running, signUp, authenticator, linkOnPage } = await server({ personalPlan: 'free' });
    const email = 'bob@example.test';
    const passhold = await signUp(email);
    await authenticator(email);
    // The page turns it on whatever the plan; what reads it is the plan's.
    await linkOnPage(email).catch(() => undefined);
    expect(await readLinkedCodes(passhold.api, passhold.productKey)).toEqual({ status: 'premium' });
    await running.close();
  });

  it('sends a copy of a login by a link that shows it once, opens as many times as chosen, and asks for the password set', async () => {
    const { running, signUp } = await server({ personalPlan: 'paid', send: true });
    const alice = await signUp('alice@example.test');
    const item = addLogin(emptyData(), {
      title: 'Bank',
      username: 'alice',
      password: 'bank-Secret-2!',
      urls: ['https://bank.example.test'],
      notes: 'savings',
      fields: [{ name: 'PIN', value: '2468', hidden: true }],
    }).item;
    const { url, send } = await createSend(alice.api, { body: { item: loginCopy(item, LABELS) }, opens: 2, lifetime: 3_600_000, password: 'between-us' });
    expect(send.opensLeft).toBe(2);
    const link = readSendLink(new URL(url).hash.slice(1))!;
    expect(url).not.toContain('bank-Secret-2!');

    expect(await refusal(openSend('', link, 'wrong', running.fetcher))).toBeTruthy();
    const opened = await openSend('', link, 'between-us', running.fetcher);
    expect(opened.body.item).toEqual({
      name: 'Bank',
      fields: [
        { label: 'Username', value: 'alice' },
        { label: 'Password', value: 'bank-Secret-2!', hidden: true },
        { label: 'Website', value: item.urls[0]! },
        { label: 'PIN', value: '2468', hidden: true },
        { label: 'Notes', value: 'savings' },
      ],
    });
    await openSend('', link, 'between-us', running.fetcher);
    // Two opens chosen, two spent.
    expect(await refusal(openSend('', link, 'between-us', running.fetcher))).toBeTruthy();
    expect((await alice.api.sends()).sends).toEqual([]);
    await running.close();
  });

  it('refuses a Send on a free plan, as part of Premium', async () => {
    const { running, signUp } = await server({ personalPlan: 'free', send: true });
    const bob = await signUp('bob@example.test');
    expect(await refusal(createSend(bob.api, { body: { text: 'hello' }, opens: 1, lifetime: 3_600_000 }))).toBe('Send is part of Premium.');
    await running.close();
  });

  it('finds the logins whose password was in a breach, sending only the start of each hash', async () => {
    const { running, signUp } = await server({ personalPlan: 'paid', breach: true });
    const alice = await signUp('alice@example.test');
    let data = emptyData();
    const weak = addLogin(data, { title: 'Old forum', username: 'alice', password: 'hunter2', urls: [], notes: '' });
    data = addLogin(weak.data, { title: 'Bank', username: 'alice', password: 'q9V!t2-unseen-Zr8#p', urls: [], notes: '' }).data;
    const exposed = await exposedLogins(alice.api, data);
    expect(exposed.map((entry) => entry.id)).toEqual([weak.item.id]);
    expect(exposed[0]!.count).toBeGreaterThan(0);

    const { signUp: free, running: other } = await server({ personalPlan: 'free', breach: true });
    expect(await refusal(exposedLogins((await free('bob@example.test')).api, data))).toBe('Breach alerts are part of Premium.');
    await Promise.all([running.close(), other.close()]);
  });

  it('hands the grantor’s vault to their emergency contact once both compared the code and the wait is over, to read only', async () => {
    const { running, signUp, send } = await server({ personalPlan: 'paid' });
    const alice = await signUp('alice@example.test');
    const bob = await signUp('bob@example.test');
    await send(alice.api, alice.productKey, addLogin(emptyData(), { title: 'Bank', username: 'alice', password: 'bank-Secret-2!', urls: [], notes: '' }).data);

    // Named on the account page, accepted there; each Passhold makes its contact key as it syncs.
    await alice.api.nameEmergencyContact({ email: 'bob@example.test', waitDays: 1, products: [PRODUCT] });
    expect(await handOverEmergency(alice.api, alice.productKey)).toEqual({ handed: [], compare: [] });
    const grantId = (await bob.api.emergency()).namedMe[0]!.id;
    await bob.api.acceptEmergency(grantId);
    await emergencyView(bob.api, bob.productKey);

    // Nothing is handed over before Alice compared the code with Bob.
    const aliceSees = await emergencyView(alice.api, alice.productKey);
    const bobSees = await emergencyView(bob.api, bob.productKey);
    if (aliceSees.status !== 'open' || bobSees.status !== 'open') throw new Error('needs-root');
    expect(aliceSees.entries[0]).toMatchObject({ they: 'contact', email: 'bob@example.test', accepted: true, trust: 'compare', open: false });
    expect(aliceSees.entries[0]!.code).toBe(bobSees.entries[0]!.code);
    expect(await handOverEmergency(alice.api, alice.productKey)).toEqual({ handed: [], compare: [grantId] });

    await trustEmergency(alice.api, alice.productKey, grantId);
    await trustEmergency(bob.api, bob.productKey, grantId);
    expect(await handOverEmergency(alice.api, alice.productKey)).toEqual({ handed: [grantId], compare: [] });

    // Asked for, and not open until the wait is over.
    await bob.api.requestEmergency(grantId);
    expect(await refusal(bob.api.emergencyBoxes(grantId))).toBe("It is not open yet: it opens once the wait is over, if they do not refuse.");
    const day = 86_400_000;
    await running.sql.query('UPDATE emergency_contacts SET requested_at = $2 WHERE id = $1', [grantId, Date.now() - 2 * day]);
    const view = await emergencyView(bob.api, bob.productKey);
    expect(view.status === 'open' && view.entries[0]).toMatchObject({ they: 'grantor', email: 'alice@example.test', trust: 'trusted', open: true });
    const read = await readEmergency(bob.api, bob.productKey, grantId);
    if (read.status !== 'open') throw new Error(read.status);
    expect(read.data.items.map((item) => [item.title, item.password])).toEqual([['Bank', 'bank-Secret-2!']]);
    // What Bob's device keeps of Alice's key opens nothing but her records: it is not her product key.
    const contact = await openContactKey(bob.api, bob.productKey);
    if ('status' in contact) throw new Error(contact.status);
    const plain = await readEmergencyVault(bob.api, contact, bob.productKey, contact.state.namedMe[0]!);
    expect(plain.status === 'open' && (await crypto.subtle.exportKey('raw', plain.grantorKey).then(() => 'exported', () => 'held'))).toBe('held');
    await running.close();
  });

  it('refuses emergency access on a free plan, as part of Premium', async () => {
    const { running, signUp } = await server({ personalPlan: 'free' });
    const alice = await signUp('alice@example.test');
    expect(await refusal(alice.api.nameEmergencyContact({ email: 'bob@example.test', waitDays: 1, products: [PRODUCT] }))).toBe('Emergency access is part of Premium.');
    await running.close();
  });
});

describe.skipIf(!existsSync(KIT))('the paid plans, against a server that is not to be trusted', { timeout: 60_000 }, () => {
  it('shows no code the server moved to another place in the link, or gave another revision', async () => {
    const { running, signUp, authenticator, linkOnPage } = await server({ personalPlan: 'paid' });
    const email = 'alice@example.test';
    const passhold = await signUp(email);
    await authenticator(email);
    await linkOnPage(email);
    const setup = readTotpSetup('JBSWY3DPEHPK3PXP')!;
    let linked = await addLinkedCode(passhold.api, passhold.productKey, setup, ['example.com']);
    linked = await addLinkedCode(passhold.api, passhold.productKey, { ...setup, secret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ' }, ['example.org']);
    if (linked.status !== 'open') throw new Error(linked.status);
    const [forCom, forOrg] = linked.codes;

    // The server hands example.com's login the code sealed for example.org's.
    await running.sql.query('UPDATE link_records SET box = (SELECT box FROM link_records WHERE id = $2) WHERE id = $1', [forCom!.id, forOrg!.id]);
    const swapped = await readLinkedCodes(passhold.api, passhold.productKey);
    expect(swapped.status === 'open' && swapped.codes.map((code) => [code.id, code.websites])).toEqual([[forOrg!.id, ['example.org']]]);

    // And hands back the other at a revision it was never sealed at.
    await running.sql.query('UPDATE link_records SET rev = rev + 1 WHERE id = $1', [forOrg!.id]);
    expect(await readLinkedCodes(passhold.api, passhold.productKey)).toMatchObject({ status: 'open', codes: [] });
    await running.close();
  });

  it('keeps nothing of a Send the server could read: not the text, the password, nor the link’s secret', async () => {
    const { running, signUp } = await server({ personalPlan: 'paid', send: true });
    const alice = await signUp('alice@example.test');
    const { url } = await createSend(alice.api, { body: { text: 'the door code is 4821' }, opens: 1, lifetime: 3_600_000, password: 'between-us' });
    const secret = readSendLink(new URL(url).hash.slice(1))!.secret;
    const held = JSON.stringify(await running.sql.query('SELECT * FROM sends'));
    for (const word of ['4821', 'door', 'between-us', secret]) expect(held).not.toContain(word);
    await running.close();
  });

  it('sends the server the first five characters of each password’s hash, and nothing else of any password', async () => {
    const { running, signUp, watched } = await server({ personalPlan: 'paid', breach: true });
    const alice = await signUp('alice@example.test');
    const { api, sent } = watched(alice.session);
    const passwords = ['hunter2', 'q9V!t2-unseen-Zr8#p'];
    let data = emptyData();
    for (const password of passwords) data = addLogin(data, { title: password.slice(0, 3), username: 'alice', password, urls: [], notes: '' }).data;
    await exposedLogins(api, data);
    const asked = sent.filter((request) => request.path.includes('breach'));
    expect(asked.length).toBeGreaterThan(0);
    const hashes = await Promise.all(
      passwords.map(async (password) => [...new Uint8Array(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password)))].map((byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()),
    );
    for (const { body } of asked) {
      for (const password of passwords) expect(body).not.toContain(password);
      for (const hash of hashes) expect(body).not.toContain(hash.slice(0, 6));
      for (const prefix of JSON.stringify(JSON.parse(body)).match(/[0-9A-F]{5,}/g) ?? []) expect(prefix).toHaveLength(5);
    }
    expect(asked.map(({ body }) => body).join()).toContain(hashes[0]!.slice(0, 5));
    await running.close();
  });

  it('compares the code again, and hands over nothing, when the server swaps a contact’s key after it was compared', async () => {
    const { running, signUp } = await server({ personalPlan: 'paid' });
    const alice = await signUp('alice@example.test');
    const bob = await signUp('bob@example.test');
    await alice.api.nameEmergencyContact({ email: 'bob@example.test', waitDays: 1, products: [PRODUCT] });
    await emergencyView(alice.api, alice.productKey);
    const grantId = (await bob.api.emergency()).namedMe[0]!.id;
    await bob.api.acceptEmergency(grantId);
    await emergencyView(bob.api, bob.productKey);
    const compared = await emergencyView(alice.api, alice.productKey);
    await trustEmergency(alice.api, alice.productKey, grantId);

    // Before Alice's Passhold hands its key over, the server lists a key of its own making as Bob's.
    const mallory = await newContactKey();
    await running.sql.query('UPDATE contact_keys SET public_key = $2 WHERE account_id = $1', [bob.accountId, mallory.publicKey]);
    const view = await emergencyView(alice.api, alice.productKey);
    if (view.status !== 'open' || compared.status !== 'open') throw new Error('needs-root');
    expect(view.entries[0]).toMatchObject({ trust: 'compare' });
    expect(view.entries[0]!.code).not.toBe(compared.entries[0]!.code);
    expect(await handOverEmergency(alice.api, alice.productKey)).toEqual({ handed: [], compare: [grantId] });
    expect(await running.sql.query('SELECT * FROM emergency_key_boxes')).toEqual([]);
    await running.close();
  });
});
