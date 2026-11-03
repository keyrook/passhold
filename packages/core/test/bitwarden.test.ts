import { describe, expect, it } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import { addLogin, addWalletItem, assertPasskey, emptyData, importBitwardenJson, importFile, importLogins, PassholdError, type StoredPasskey } from '@passhold/core';
import { checkAssertion } from './support/webauthn.js';

const code = async (run: () => Promise<unknown>) => {
  try {
    await run();
  } catch (error) {
    return error instanceof PassholdError ? error.code : 'other';
  }
  return 'ok';
};

const exported = (items: unknown[]) => JSON.stringify({ encrypted: false, folders: [], items });

const RP = 'passkeys.example.test';
const GUID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

/** A passkey as Bitwarden exports one, made here, and the public half its site kept. */
function bitwardenPasskey(overrides: Record<string, unknown> = {}) {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const credential = {
    credentialId: GUID,
    keyType: 'public-key',
    keyAlgorithm: 'ECDSA',
    keyCurve: 'P-256',
    keyValue: privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64url'),
    rpId: RP,
    userHandle: Buffer.from('user-1').toString('base64url'),
    userName: 'alice@example.test',
    counter: '0',
    rpName: 'Example',
    userDisplayName: 'Alice',
    discoverable: 'true',
    creationDate: '2026-01-02T03:04:05.000Z',
    ...overrides,
  };
  return { credential, publicKey };
}

const loginWith = (name: string, fido2Credentials: unknown[], username: string | null = null, password: string | null = null) => ({
  ...{ id: 'x', organizationId: null, folderId: null, reprompt: 0, fields: [], passwordHistory: [], collectionIds: null },
  type: 1,
  name,
  notes: null,
  favorite: false,
  login: { uris: [], username, password, totp: null, fido2Credentials },
});

/** A sign-in as the site's server checks it, with the public key it kept from Bitwarden's passkey. */
async function signsFor(passkey: StoredPasskey, publicKey: ReturnType<typeof generateKeyPairSync>['publicKey']) {
  const origin = `https://${RP}`;
  const clientData = Buffer.from(JSON.stringify({ type: 'webauthn.get', challenge: 'Y2hhbGxlbmdl', origin, crossOrigin: false }));
  const assertion = await assertPasskey(passkey, clientData);
  checkAssertion({ clientDataJSON: clientData, authenticatorData: assertion.authenticatorData, signature: assertion.signature }, { key: publicKey }, { rpId: RP, challenge: 'Y2hhbGxlbmdl', origin });
  return Buffer.from(assertion.userHandle).toString();
}

const base = { id: 'x', organizationId: null, folderId: null, reprompt: 0, fields: [], passwordHistory: [], collectionIds: null };

describe('importing Bitwarden’s JSON', () => {
  it('reads its logins, cards, identities and notes, and counts the two-step secrets it keeps nowhere', async () => {
    const result = await importBitwardenJson(
      exported([
        { ...base, type: 1, name: 'GitHub', notes: null, favorite: true, login: { uris: [{ match: null, uri: 'https://github.com/login' }, { uri: 'https://gist.github.com' }], username: 'jdoe', password: 'pw', totp: 'JBSWY3DPEHPK3PXP', fido2Credentials: [] } },
        { ...base, type: 3, name: 'Visa', notes: 'mine', favorite: true, card: { cardholderName: 'John Doe', brand: 'Visa', number: '4242 4242 4242 4242', expMonth: '04', expYear: '2031', code: '123' } },
        {
          ...base,
          type: 4,
          name: 'Home',
          notes: null,
          favorite: false,
          identity: {
            title: 'Mr',
            firstName: 'John',
            middleName: 'William',
            lastName: 'Doe',
            address1: '123 Any St',
            address2: 'Apt #123',
            address3: null,
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'US',
            company: 'Acme Inc.',
            email: 'john@company.com',
            phone: '5555551234',
            ssn: '000-123-4567',
            username: 'jdoe',
            passportNumber: 'US-123456789',
            licenseNumber: 'D123-12-123-12333',
          },
        },
        { ...base, type: 2, name: 'Wi-Fi', notes: 'the password', favorite: false, secureNote: { type: 0 } },
        // An SSH key and an item in Bitwarden's trash: nothing Passhold keeps.
        { ...base, type: 5, name: 'Server', notes: null, favorite: false, sshKey: { privateKey: 'KEY', publicKey: 'PUB', keyFingerprint: 'FP' } },
        { ...base, type: 2, name: 'Gone', notes: 'old', favorite: false, deletedDate: '2026-01-01T00:00:00.000Z', secureNote: { type: 0 } },
      ]),
    );
    expect(result.format).toBe('bitwarden');
    expect(result.drafts).toEqual([
      { title: 'GitHub', username: 'jdoe', password: 'pw', urls: ['https://github.com/login', 'https://gist.github.com/'], notes: '', favorite: true },
    ]);
    expect(result.wallet).toEqual([
      { kind: 'card', title: 'Visa', holder: 'John Doe', number: '4242424242424242', expMonth: 4, expYear: 2031, code: '123', notes: 'mine', favorite: true },
      {
        kind: 'address',
        title: 'Home',
        name: 'John William Doe',
        organization: 'Acme Inc.',
        street: '123 Any St\nApt #123',
        city: 'New York',
        region: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: '5555551234',
        email: 'john@company.com',
        notes: '',
      },
      { kind: 'note', title: 'Wi-Fi', text: 'the password' },
    ]);
    expect(result).toMatchObject({ skipped: 2, duplicates: 0, twoFactor: 1 });
    // Counted, never kept; nor an identity's numbers, which are no part of an address.
    for (const secret of ['JBSWY3DPEHPK3PXP', '000-123-4567', 'US-123456789', 'D123-12-123-12333', 'KEY']) expect(JSON.stringify(result)).not.toContain(secret);
  });

  it('keeps a login with words but nothing to sign in with as a note, and leaves out what the wallet holds', async () => {
    let data = emptyData();
    data = addWalletItem(data, { kind: 'note', title: 'Wi-Fi', text: 'the password' }).data;
    const result = await importBitwardenJson(
      exported([
        { ...base, type: 1, name: 'Licence', notes: 'KEY-123', favorite: false, login: { uris: [{ uri: 'https://shop.example.com' }], username: null, password: null, totp: null } },
        { ...base, type: 2, name: 'Wi-Fi', notes: 'the password', favorite: false, secureNote: { type: 0 } },
      ]),
      data,
    );
    expect(result.wallet).toEqual([{ kind: 'note', title: 'Licence', text: 'https://shop.example.com\nKEY-123' }]);
    expect(result.duplicates).toBe(1);
  });

  it('refuses an encrypted export by name, and anything that is not Bitwarden’s', async () => {
    // Encrypted under the account's key, and under a password of the export's own.
    expect(await code(() => importBitwardenJson(JSON.stringify({ encrypted: true, encKeyValidation_DO_NOT_EDIT: '2.x', folders: [], items: [] })))).toBe('importEncrypted');
    expect(await code(() => importBitwardenJson(JSON.stringify({ encrypted: true, passwordProtected: true, salt: 's', kdfIterations: 600000, kdfType: 0, data: '2.x' })))).toBe('importEncrypted');
    expect(await code(() => importBitwardenJson('{"encrypted":false,"items":[]}'))).toBe('importEmpty');
    expect(await code(() => importBitwardenJson('{"items":{}}'))).toBe('importUnknownFormat');
    expect(await code(() => importBitwardenJson('{'))).toBe('importUnknownFormat');
    expect(await code(() => importBitwardenJson('[1]'))).toBe('importUnknownFormat');
    expect(await code(() => importBitwardenJson(`{"items":[${'1,'.repeat(50_000)}1]}`))).toBe('importTooLarge');
  });

  it('reads each field as what it names and nothing else, from a file that lies about them', async () => {
    const result = await importBitwardenJson(
      // Written by hand: JSON.parse makes "__proto__" a key like any other, which nothing here reads.
      '{"items":[' +
        'null,' +
        '{"type":"1","name":"a string for a type","login":{"username":"u","password":"p"}},' +
        '{"type":3,"name":["not","a","name"],"card":{"number":4242424242424242,"cardholderName":{"x":1},"expMonth":"13","expYear":"2031","code":"123456"}},' +
        '{"type":3,"name":"Named","card":{"__proto__":{"number":"4242424242424242"},"expMonth":4}},' +
        '{"type":1,"name":"Odd","login":{"uris":"https://a.example","username":"u","password":"p","totp":["JBSWY3DPEHPK3PXP"]}}' +
        ']}',
    );
    expect(result.wallet).toEqual([{ kind: 'card', title: 'Named', holder: '', number: '', expMonth: null, expYear: null, code: '', notes: '' }]);
    expect(result.drafts).toEqual([{ title: 'Odd', username: 'u', password: 'p', urls: [], notes: '', favorite: false }]);
    // Null, a type that is a string, and a card with neither a number nor a name.
    expect(result.skipped).toBe(3);
    expect(result.twoFactor).toBe(0);
  });

  it('brings a login’s passkey, which signs for its site as it did in Bitwarden', async () => {
    const { credential, publicKey } = bitwardenPasskey();
    const other = bitwardenPasskey({ credentialId: `b64.${Buffer.from('id-two').toString('base64url')}`, rpId: 'shop.example.test', userName: 'bob' });
    const result = await importBitwardenJson(exported([loginWith('Example', [credential]), loginWith('Shop', [other.credential], 'bob', 'pw')]));
    // A passkey alone names its account, and its site's address is where it signs.
    expect(result.drafts[0]).toEqual({
      title: 'Example',
      username: 'alice@example.test',
      password: '',
      urls: [`https://${RP}/`],
      notes: '',
      favorite: false,
      passkey: {
        credentialId: Buffer.from(GUID.replace(/-/g, ''), 'hex').toString('base64url'),
        rpId: RP,
        rpName: 'Example',
        userHandle: Buffer.from('user-1').toString('base64url'),
        userName: 'alice@example.test',
        userDisplayName: 'Alice',
        privateKey: Buffer.from(credential.keyValue, 'base64url').toString('base64'),
        createdAt: Date.parse('2026-01-02T03:04:05.000Z'),
      },
    });
    expect(result.drafts[1]!.passkey!.credentialId).toBe(Buffer.from('id-two').toString('base64url'));
    expect(result.passkeysLeft).toBe(0);
    expect(await signsFor(result.drafts[0]!.passkey!, publicKey)).toBe('user-1');
  });

  it('leaves a passkey it cannot keep, and says how many: the Keyrook account’s, one for no site of its own, one that counts, one of another kind', async () => {
    const bad = (overrides: Record<string, unknown>) => bitwardenPasskey(overrides).credential;
    const result = await importBitwardenJson(
      exported([
        loginWith('Keyrook', [bad({ rpId: 'account.keyrook.com' })], 'me', 'pw1'),
        loginWith('Suffix', [bad({ rpId: 'github.io' })], 'me', 'pw2'),
        loginWith('Address', [bad({ rpId: '192.168.1.1' })], 'me', 'pw3'),
        loginWith('Counted', [bad({ counter: '3' })], 'me', 'pw4'),
        loginWith('Counted number', [bad({ counter: 7 })], 'me', 'pw5'),
        loginWith('P-384', [bad({ keyCurve: 'P-384' })], 'me', 'pw6'),
        loginWith('Not a key', [bad({ keyValue: Buffer.from('not a key at all').toString('base64url') })], 'me', 'pw7'),
        loginWith('Odd id', [bad({ credentialId: 'not-a-guid' })], 'me', 'pw8'),
        loginWith('No handle', [bad({ userHandle: null })], 'me', 'pw9'),
        // One passkey to a login: the second is left.
        loginWith('Two', [bad({}), bad({ credentialId: '00000000-0000-0000-0000-000000000002' })], 'me', 'pw10'),
      ]),
    );
    expect(result.passkeysLeft).toBe(10);
    // The logins come, each without the passkey it could not keep.
    expect(result.drafts.map((draft) => [draft.title, Boolean(draft.passkey)])).toEqual([
      ['Keyrook', false],
      ['Suffix', false],
      ['Address', false],
      ['Counted', false],
      ['Counted number', false],
      ['P-384', false],
      ['Not a key', false],
      ['Odd id', false],
      ['No handle', false],
      ['Two', true],
    ]);
  });

  it('gives a passkey to the same login already in the vault, and never brings one twice', async () => {
    const { data, item } = addLogin(emptyData(), { title: 'Example', username: 'alice@example.test', password: 'pw', urls: [`https://${RP}`], notes: '' });
    const { credential, publicKey } = bitwardenPasskey();
    const file = exported([loginWith('Example', [credential], 'alice@example.test', 'pw')]);
    const first = await importBitwardenJson(file, data);
    expect(first).toMatchObject({ drafts: [], duplicates: 1, passkeys: [{ id: item.id }] });
    const after = importLogins(data, first.drafts, first.passkeys);
    expect(after.items).toHaveLength(1);
    expect(await signsFor(after.items[0]!.passkey!, publicKey)).toBe('user-1');
    expect(await importBitwardenJson(file, after)).toMatchObject({ drafts: [], passkeys: [], duplicates: 1 });
  });

  it('keeps no passkey for the Keyrook account, or for no site, however a page sends it', async () => {
    const { credential } = bitwardenPasskey();
    const keyrook = { ...(await importBitwardenJson(exported([loginWith('Example', [credential])]))).drafts[0]!.passkey!, rpId: 'account.keyrook.com' };
    const { data, item } = addLogin(emptyData(), { title: 'Kept', username: 'me', password: 'pw', urls: [], notes: '' });
    const after = importLogins(
      data,
      [
        { title: 'Keyrook', username: 'me', password: 'pw', urls: [], notes: '', passkey: keyrook },
        { title: 'Suffix', username: 'me', password: 'pw2', urls: [], notes: '', passkey: { ...keyrook, rpId: 'com' } },
      ],
      [{ id: item.id, passkey: keyrook }],
    );
    expect(after.items.map((login) => [login.title, login.passkey])).toEqual([
      ['Kept', null],
      ['Keyrook', null],
      ['Suffix', null],
    ]);
  });

  it('tells Bitwarden’s JSON from a CSV file by what it holds', async () => {
    expect((await importFile(`\uFEFF  ${exported([{ ...base, type: 2, name: 'N', notes: 't', favorite: false }])}`)).format).toBe('bitwarden');
    expect((await importFile('name,url,username,password,note\nA,https://a.com,u,p,\n')).format).toBe('chrome');
  });
});
