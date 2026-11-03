import { describe, expect, it } from 'vitest';
import {
  assertPasskey,
  attestPasskey,
  cleanLogin,
  clientDataJSON,
  createPasskey,
  derSignature,
  addLogin,
  joinLogin,
  mergeBackup,
  passkeyLogins,
  PASSHOLD_AAGUID,
  readCreateOptions,
  readGetOptions,
  rpIdFor,
  savePasskey,
  toHex,
  trashLogin,
  type StoredPasskey,
  type VaultData,
  DEFAULT_SETTINGS,
} from '@passhold/core';
import { checkAssertion, checkRegistration } from './support/webauthn.js';

const ORIGIN = 'https://login.example.com';
const b64url = (text: string) => Buffer.from(text).toString('base64url');

const empty = (): VaultData => ({
  schemaVersion: 1,
  items: [],
  wallet: [],
  settings: DEFAULT_SETTINGS,
  neverSave: [],
  lastBackupAt: null,
  pin: null,
  recoveryKeyPending: false,
  recoveryKey: null,
  account: null,
});

async function aPasskey(overrides: Partial<{ rpId: string; userHandle: string; userName: string }> = {}) {
  return createPasskey({
    rpId: overrides.rpId ?? 'example.com',
    rpName: 'Example',
    userHandle: overrides.userHandle ?? b64url('user-1'),
    userName: overrides.userName ?? 'alice@example.com',
    userDisplayName: 'Alice',
  });
}

describe('which site a page may make or use a passkey for', () => {
  it('its own host, or a parent within its registrable domain', () => {
    expect(rpIdFor(ORIGIN, null)).toBe('login.example.com');
    expect(rpIdFor(ORIGIN, 'login.example.com')).toBe('login.example.com');
    expect(rpIdFor(ORIGIN, 'example.com')).toBe('example.com');
    expect(rpIdFor('https://a.b.example.co.uk', 'example.co.uk')).toBe('example.co.uk');
  });

  it('never the Keyrook account’s page, whose passkeys open every app’s key: the browser answers it', () => {
    expect(rpIdFor('https://account.keyrook.com', null)).toBeNull();
    expect(rpIdFor('https://account.keyrook.com', 'account.keyrook.com')).toBeNull();
    // Nor a parent asked for from there, nor the page's passkey asked for from below it.
    expect(rpIdFor('https://account.keyrook.com', 'keyrook.com')).toBeNull();
    expect(rpIdFor('https://login.account.keyrook.com', 'account.keyrook.com')).toBeNull();
    expect(rpIdFor('https://login.account.keyrook.com', null)).toBeNull();
    // Keyrook's other pages are sites like any other.
    expect(rpIdFor('https://www.keyrook.com', 'keyrook.com')).toBe('keyrook.com');
  });

  it('never a public suffix, private ones included: a stranger shares it', () => {
    expect(rpIdFor(ORIGIN, 'com')).toBeNull();
    expect(rpIdFor('https://a.b.example.co.uk', 'co.uk')).toBeNull();
    // github.io is in the private section of the list: alice's page is not github.io.
    expect(rpIdFor('https://alice.github.io', 'github.io')).toBeNull();
    expect(rpIdFor('https://alice.github.io', null)).toBe('alice.github.io');
  });

  it('never another site, a lookalike, or a child of its own host', () => {
    expect(rpIdFor(ORIGIN, 'evil.com')).toBeNull();
    expect(rpIdFor(ORIGIN, 'ample.com')).toBeNull();
    expect(rpIdFor('https://evilexample.com', 'example.com')).toBeNull();
    expect(rpIdFor(ORIGIN, 'deeper.login.example.com')).toBeNull();
    expect(rpIdFor(ORIGIN, 'example.com.evil.com')).toBeNull();
  });

  it('secure pages only, localhost for a site being built, and no address', () => {
    expect(rpIdFor('http://login.example.com', null)).toBeNull();
    expect(rpIdFor('http://localhost:3000', null)).toBe('localhost');
    expect(rpIdFor('https://127.0.0.1', null)).toBeNull();
    expect(rpIdFor('https://[::1]', null)).toBeNull();
    expect(rpIdFor('chrome-extension://abc', null)).toBeNull();
    expect(rpIdFor('not a url', null)).toBeNull();
  });
});

describe('reading what a page asks for', () => {
  const create = {
    rp: { name: 'Example', id: 'example.com' },
    user: { id: b64url('user-1'), name: 'alice@example.com', displayName: 'Alice' },
    challenge: b64url('a challenge of sixteen+'),
    pubKeyCredParams: [{ type: 'public-key', alg: -8 }, { type: 'public-key', alg: -7 }],
    excludeCredentials: [{ type: 'public-key', id: b64url('old') }],
    extensions: { credProps: true },
  };

  it('takes a well-formed request to make a passkey', () => {
    expect(readCreateOptions(create)).toEqual({
      rpId: 'example.com',
      rpName: 'Example',
      user: create.user,
      challenge: create.challenge,
      exclude: [b64url('old')],
      credProps: true,
    });
    // No algorithms listed means the defaults, ES256 among them.
    expect(readCreateOptions({ ...create, pubKeyCredParams: [] })).not.toBeNull();
  });

  it('leaves to the browser what Passhold cannot do, or what is malformed', () => {
    expect(readCreateOptions({ ...create, pubKeyCredParams: [{ type: 'public-key', alg: -257 }] })).toBeNull();
    expect(readCreateOptions({ ...create, authenticatorSelection: { authenticatorAttachment: 'cross-platform' } })).toBeNull();
    expect(readCreateOptions({ ...create, hints: ['security-key'] })).toBeNull();
    expect(readCreateOptions({ ...create, user: { ...create.user, id: b64url('x'.repeat(65)) } })).toBeNull();
    expect(readCreateOptions({ ...create, user: { ...create.user, id: '' } })).toBeNull();
    expect(readCreateOptions({ ...create, challenge: 'not+base64url/' })).toBeNull();
    expect(readCreateOptions({ ...create, challenge: b64url('x'.repeat(2000)) })).toBeNull();
    expect(readCreateOptions({ ...create, rp: { name: 'x', id: 42 } })).toBeNull();
    expect(readCreateOptions({ ...create, excludeCredentials: Array.from({ length: 65 }, () => ({ type: 'public-key', id: 'AA' })) })).toBeNull();
    expect(readCreateOptions(null)).toBeNull();
    expect(readCreateOptions('create')).toBeNull();
  });

  it('takes a request to sign in, with or without the passkeys it accepts', () => {
    expect(readGetOptions({ challenge: b64url('c'), rpId: 'Example.com' })).toEqual({ rpId: 'example.com', challenge: b64url('c'), allow: [] });
    expect(readGetOptions({ challenge: b64url('c'), allowCredentials: [{ type: 'public-key', id: 'AQID' }] })).toMatchObject({ rpId: null, allow: ['AQID'] });
    expect(readGetOptions({ challenge: 42 })).toBeNull();
    expect(readGetOptions({ challenge: b64url('c'), hints: ['hybrid'] })).toBeNull();
  });
});

describe('a passkey, as a website’s server checks it', () => {
  it('registers with the site, the challenge and the origin it was made for, and signs in with the same key', async () => {
    const { passkey, publicKey } = await aPasskey();
    const challenge = b64url('register-challenge');
    const made = await attestPasskey(passkey, publicKey);
    const registered = checkRegistration(
      { clientDataJSON: clientDataJSON('webauthn.create', challenge, ORIGIN), attestationObject: made.attestationObject },
      { rpId: 'example.com', challenge, origin: ORIGIN },
    );
    expect(registered.credentialId).toBe(passkey.credentialId);
    expect(registered.auth.aaguid).toBe(toHex(PASSHOLD_AAGUID));
    // Present, verified, and backed up — it lives in the vault and the account.
    expect(registered.auth.flags).toMatchObject({ up: true, uv: true, be: true, bs: true, at: true, ed: false });
    expect(registered.auth.signCount).toBe(0);
    // The SPKI handed to sites that do not read COSE is the same key.
    expect(Buffer.from(made.publicKey).toString('base64')).toBe(
      registered.key.export({ format: 'der', type: 'spki' }).toString('base64'),
    );

    const signIn = b64url('sign-in-challenge');
    const clientData = clientDataJSON('webauthn.get', signIn, ORIGIN);
    const assertion = await assertPasskey(passkey, clientData);
    const auth = checkAssertion({ clientDataJSON: clientData, ...assertion }, registered, { rpId: 'example.com', challenge: signIn, origin: ORIGIN });
    expect(auth.flags).toMatchObject({ up: true, uv: true, be: true, bs: true, at: false });
    expect(Buffer.from(assertion.userHandle).toString()).toBe('user-1');
  });

  it('a signature for one site, or one challenge, is worth nothing for another', async () => {
    const { passkey, publicKey } = await aPasskey();
    const registered = checkRegistration(
      { clientDataJSON: clientDataJSON('webauthn.create', 'AA', ORIGIN), attestationObject: (await attestPasskey(passkey, publicKey)).attestationObject },
      { rpId: 'example.com', challenge: 'AA', origin: ORIGIN },
    );
    const clientData = clientDataJSON('webauthn.get', 'AQ', ORIGIN);
    const assertion = await assertPasskey(passkey, clientData);
    expect(() => checkAssertion({ clientDataJSON: clientData, ...assertion }, registered, { rpId: 'evil.com', challenge: 'AQ', origin: ORIGIN })).toThrow(/rpIdHash/);
    expect(() => checkAssertion({ clientDataJSON: clientData, ...assertion }, registered, { rpId: 'example.com', challenge: 'Ag', origin: ORIGIN })).toThrow(/challenge/);
    // Another origin's client data under this signature does not verify.
    const replayed = clientDataJSON('webauthn.get', 'AQ', 'https://evil.com');
    expect(() =>
      checkAssertion({ clientDataJSON: replayed, ...assertion }, registered, { rpId: 'example.com', challenge: 'AQ', origin: 'https://evil.com' }),
    ).toThrow(/signature/);
  });

  it('writes client data the way browsers do, byte for byte', () => {
    const text = new TextDecoder().decode(clientDataJSON('webauthn.get', 'abc_-', 'https://a.example'));
    expect(text).toBe('{"type":"webauthn.get","challenge":"abc_-","origin":"https://a.example","crossOrigin":false}');
  });

  it('writes signatures in DER, high bits padded and leading zeros dropped', () => {
    const raw = new Uint8Array(64);
    raw[0] = 0x80;
    raw[32] = 0;
    raw[33] = 0x01;
    const der = derSignature(raw);
    expect(der[0]).toBe(0x30);
    expect(der[2]).toBe(0x02);
    expect(der[3]).toBe(33); // r: a zero in front of the high bit
    expect(der[4]).toBe(0);
    const sAt = 4 + 33;
    expect(der[sAt]).toBe(0x02);
    expect(der[sAt + 1]).toBe(31); // s: its leading zero gone
    expect(der[1]).toBe(der.length - 2);
  });
});

describe('passkeys in the vault', () => {
  const url = 'https://login.example.com/';

  it('joins the login for the same account, or makes one of its own', async () => {
    let data = addLogin(empty(), { title: 'Example', username: 'alice@example.com', password: 'pw-1', urls: [url], notes: '' }).data;
    const { passkey } = await aPasskey();
    const saved = savePasskey(data, url, passkey);
    expect(saved.data.items).toHaveLength(1);
    expect(saved.item).toMatchObject({ title: 'Example', password: 'pw-1', passkey: { credentialId: passkey.credentialId } });
    data = saved.data;

    const other = (await aPasskey({ userHandle: b64url('user-2'), userName: 'bob@example.com' })).passkey;
    const second = savePasskey(data, url, other);
    expect(second.data.items).toHaveLength(2);
    expect(second.item).toMatchObject({ title: 'Example', username: 'bob@example.com', password: '', urls: ['https://login.example.com/'] });
  });

  it('a passkey made again for the same account replaces the old one, which goes to the trash', async () => {
    const first = (await aPasskey()).passkey;
    const { data } = savePasskey(empty(), url, first);
    const again = (await aPasskey()).passkey;
    const saved = savePasskey(data, url, again);
    const live = saved.data.items.filter((item) => item.deletedAt === null);
    const trashed = saved.data.items.filter((item) => item.deletedAt !== null);
    expect(live).toHaveLength(1);
    expect(live[0]!.passkey!.credentialId).toBe(again.credentialId);
    expect(trashed).toHaveLength(1);
    expect(trashed[0]!.passkey!.credentialId).toBe(first.credentialId);
  });

  it('is found by the site it signs for, live, and only those the site names', async () => {
    const a = (await aPasskey()).passkey;
    const b = (await aPasskey({ userHandle: b64url('user-2'), userName: 'bob' })).passkey;
    const elsewhere = (await aPasskey({ rpId: 'other.com' })).passkey;
    let data = savePasskey(empty(), url, a).data;
    data = savePasskey(data, url, b).data;
    data = savePasskey(data, 'https://other.com/', elsewhere).data;
    expect(passkeyLogins(data, 'example.com').map((item) => item.passkey!.credentialId).sort()).toEqual([a.credentialId, b.credentialId].sort());
    expect(passkeyLogins(data, 'example.com', [b.credentialId]).map((item) => item.username)).toEqual(['bob']);
    expect(passkeyLogins(data, 'login.example.com')).toEqual([]);
    const trashed = trashLogin(data, data.items.find((item) => item.passkey?.credentialId === a.credentialId)!.id);
    expect(passkeyLogins(trashed, 'example.com').map((item) => item.username)).toEqual(['bob']);
  });

  it('is never dropped when two copies of a login meet', async () => {
    const { passkey } = await aPasskey();
    const { data, item } = savePasskey(empty(), url, passkey);
    const without = { ...item, passkey: null, updatedAt: item.updatedAt + 1000 };
    expect(joinLogin(item, without).passkey?.credentialId).toBe(passkey.credentialId);
    expect(mergeBackup({ ...data, items: [without] }, data).data.items[0]!.passkey?.credentialId).toBe(passkey.credentialId);
  });

  it('reads back only a whole, well-formed passkey', async () => {
    const { passkey } = await aPasskey();
    const { item } = savePasskey(empty(), url, passkey);
    expect(cleanLogin(JSON.parse(JSON.stringify(item)))!.passkey).toEqual(passkey);
    const broken = (patch: Partial<Record<keyof StoredPasskey, unknown>>) => cleanLogin({ ...item, passkey: { ...passkey, ...patch } })!.passkey;
    expect(broken({ privateKey: 42 })).toBeNull();
    expect(broken({ credentialId: 'has spaces' })).toBeNull();
    expect(broken({ rpId: 'Example.COM/path' })).toBeNull();
    expect(broken({ userHandle: 'x'.repeat(200) })).toBeNull();
    expect(cleanLogin({ ...item, passkey: 'nope' })!.passkey).toBeNull();
  });
});
