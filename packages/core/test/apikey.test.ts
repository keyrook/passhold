import { deflateRawSync } from 'node:zlib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addWalletItem,
  applyPulled,
  blankApiKey,
  checkup,
  chooseKeys,
  cleanEnvName,
  cleanHost,
  cleanHosts,
  cleanSendAs,
  cleanWalletItem,
  dayOf,
  daysLeft,
  emptyData,
  exportApiKeysCsv,
  exportCsv,
  expiryNotice,
  fillableWalletItem,
  generateDataKey,
  importBitwardenJson,
  importFile,
  importFileBytes,
  importOnePux,
  joinWalletItem,
  mergeFamilyPulled,
  planFamilyPush,
  planPush,
  recordsKey,
  restoreWalletVersion,
  sealJson,
  searchWallet,
  serviceOfKey,
  updateWalletItem,
  utf8,
  walletOf,
  walletTitle,
  withService,
  WALLET_KIND,
  type ApiKeyDraft,
  type ApiKeyItem,
  type FamilyVault,
  type RemoteRecord,
  type VaultData,
} from '@passhold/core';
import { readZipEntry } from '../src/import/zip.js';

const DAY = 24 * 60 * 60 * 1000;
/** Made up for these tests: each opens nothing anywhere. Shorter than a real
 * Stripe key, so that no secret scanner takes it for one: GitHub refuses a push
 * holding one. */
const STRIPE = 'sk_live_TestOnlyNotARealKey';
const GITHUB = 'ghp_TestOnlyNotARealToken000000000000000';

function key(draft: Partial<ApiKeyDraft> = {}): ApiKeyDraft {
  return { ...blankApiKey(), title: 'Payments', key: STRIPE, ...draft };
}

function added(draft: Partial<ApiKeyDraft> = {}, data: VaultData = emptyData(), now = 1_000) {
  const result = addWalletItem(data, key(draft), now);
  return { data: result.data, item: result.item as ApiKeyItem };
}

/** Midnight UTC of a date some days from today, where this computer is. */
function inDays(days: number, now = Date.now()): number {
  const here = new Date(now);
  return Date.UTC(here.getFullYear(), here.getMonth(), here.getDate()) + days * DAY;
}

describe('an API key, as the vault keeps it', () => {
  it('reads what a key goes to and how, and refuses what would send it elsewhere', () => {
    expect(cleanHost('https://api.stripe.com/v1/charges?x=1')).toBe('api.stripe.com');
    expect(cleanHost('API.Example.COM:8443')).toBe('api.example.com:8443');
    expect(cleanHost('*.example.com')).toBe('*.example.com');
    expect(cleanHost('*.api.example.co.uk')).toBe('*.api.example.co.uk');
    // A star over a whole suffix would hand the key to anyone who registers a name under it.
    for (const wide of ['*.com', '*.co.uk', '*.github.io', '*.*.example.com', '*']) expect(cleanHost(wide), wide).toBeNull();
    // Nor does a host carry someone's name and password, or a star in its middle.
    for (const odd of ['https://user:pw@api.example.com', 'api.*.example.com', '', 'exa mple.com']) expect(cleanHost(odd), odd).toBeNull();
    expect(cleanHosts(['api.example.com', 'API.example.com', 'bad host', ...Array.from({ length: 30 }, (_, i) => `h${i}.example.com`)])).toHaveLength(20);

    expect(cleanSendAs('header:X-Api-Key')).toBe('header:X-Api-Key');
    expect(cleanSendAs('query:api_key')).toBe('query:api_key');
    expect(cleanSendAs('basic')).toBe('basic');
    // A header's name with a line break in it would write a header of the caller's choosing into a request.
    for (const odd of ['header:X-Key\r\nCookie: a=b', 'header:', 'header:a b', 'query:a&b=c', 'cookie:a', 42, null]) expect(cleanSendAs(odd)).toBe('bearer');

    expect(cleanEnvName('stripe key')).toBe('stripe_key');
    expect(cleanEnvName('1PASSWORD')).toBe('_1PASSWORD');
    expect(cleanEnvName('$(rm -rf ~)')).toBe('__rm__rf___');

    expect(dayOf('2027-01-31')).toBe(Date.UTC(2027, 0, 31));
    expect(dayOf('2027-02-31')).toBeNull();
    expect(dayOf('31/01/2027')).toBeNull();
  });

  it('names its service by what the key — or its id — starts with, the longest prefix first, and never guesses', () => {
    expect(serviceOfKey(STRIPE)).toBe('stripe');
    expect(serviceOfKey(GITHUB)).toBe('github');
    // A longer prefix over a shorter one it starts with: GitHub's fine-grained token is not one of its classic ones.
    expect(serviceOfKey('github_pat_TestOnly0000')).toBe('github');
    expect(serviceOfKey('dckr_pat_TestOnly0000')).toBe('docker');
    expect(serviceOfKey('sk-or-v1-TestOnly')).toBe('openrouter');
    // Several services' keys start sk-: none is named for it.
    expect(serviceOfKey('sk-TestOnly0000')).toBeNull();
    expect(serviceOfKey('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', 'AKIAIOSFODNN7EXAMPLE')).toBe('aws');
    // A prefix alone is no key.
    expect(serviceOfKey('ghp_')).toBeNull();
  });

  it('takes its service’s hosts, way and variable when filed under it, and never writes over its owner’s', () => {
    const stripe = withService(key(), 'stripe');
    expect(stripe).toMatchObject({ service: 'stripe', hosts: ['api.stripe.com'], sendAs: 'bearer', env: 'STRIPE_API_KEY' });
    // Moved to another service: the defaults move with it.
    expect(withService(stripe, 'gitlab')).toMatchObject({ hosts: ['gitlab.com'], sendAs: 'header:PRIVATE-TOKEN', env: 'GITLAB_TOKEN' });
    // What its owner typed stays.
    const typed = withService({ ...stripe, hosts: ['payments.internal.example'], env: 'PAY_KEY' }, 'gitlab');
    expect(typed).toMatchObject({ hosts: ['payments.internal.example'], env: 'PAY_KEY' });
  });

  it('is kept for its key: a name alone is no API key, and a service the catalogue does not know is none', () => {
    expect(() => addWalletItem(emptyData(), { ...blankApiKey(), title: 'Payments' })).toThrow();
    const { item } = added({ service: 'not-a-service', hosts: ['*.com', 'api.stripe.com'], expiresAt: Date.UTC(2027, 0, 31, 15, 30) });
    expect(item.service).toBe('');
    expect(item.hosts).toEqual(['api.stripe.com']);
    // A date, not a moment.
    expect(item.expiresAt).toBe(Date.UTC(2027, 0, 31));
    expect(item.history).toEqual([]);
    expect(cleanWalletItem(JSON.parse(JSON.stringify(item)))).toEqual(item);
  });

  it('keeps the keys it held, and its hidden fields’ values, as a login keeps its passwords — and no edit writes that history', () => {
    let { data, item } = added({ fields: [{ name: 'Webhook secret', value: 'whsec_one', hidden: true }] });
    data = updateWalletItem(data, item.id, key({ key: GITHUB, fields: [{ name: 'Webhook secret', value: 'whsec_two', hidden: true }] }), 2_000);
    let now = data.wallet[0] as ApiKeyItem;
    expect(now.key).toBe(GITHUB);
    expect(now.history).toEqual([
      { password: STRIPE, changedAt: 2_000 },
      { password: 'whsec_one', changedAt: 2_000, field: 'Webhook secret' },
    ]);
    // A page that sends a history along with an edit plants nothing.
    const planted = { ...key({ key: 'sk_live_third000000000000' }), history: [{ password: 'planted', changedAt: 1 }] } as ApiKeyDraft;
    data = updateWalletItem(data, item.id, planted, 3_000);
    now = data.wallet[0] as ApiKeyItem;
    expect(now.history.map((entry) => entry.password)).toEqual([GITHUB, STRIPE, 'whsec_one']);
    // Five at most, the oldest dropped.
    for (let index = 0; index < 6; index++) data = updateWalletItem(data, item.id, key({ key: `sk_live_rotated${index}0000000000` }), 4_000 + index);
    expect((data.wallet[0] as ApiKeyItem).history).toHaveLength(5);
  });

  it('keeps a version of each edit on a plan that holds them, the history in none, and a version restored puts the key back', () => {
    let { data, item } = added();
    data = updateWalletItem(data, item.id, key({ key: GITHUB, environment: 'production' }), 2_000, { versions: true });
    const edited = data.wallet[0] as ApiKeyItem;
    expect(edited.versions).toHaveLength(1);
    expect(edited.versions![0]!.draft).not.toHaveProperty('history');
    expect((edited.versions![0]!.draft as ApiKeyDraft).key).toBe(STRIPE);
    data = restoreWalletVersion(data, item.id, 2_000, 3_000, { versions: true });
    const restored = data.wallet[0] as ApiKeyItem;
    expect(restored.key).toBe(STRIPE);
    expect(restored.history.map((entry) => entry.password)).toEqual([GITHUB, STRIPE]);
  });

  it('is found by its name, service, id, hosts and words — never by its key', () => {
    const { data } = added({ title: '', service: 'stripe', keyId: 'acct_TESTONLY', hosts: ['api.stripe.com'], environment: 'production', scopes: 'charges:write', env: 'PAY_KEY' });
    for (const word of ['stripe', 'acct_testonly', 'api.stripe.com', 'production', 'charges', 'PAY_KEY']) expect(searchWallet(data.wallet, word), word).toHaveLength(1);
    for (const part of [STRIPE, STRIPE.slice(8, 20), 'TestOnlyNotARealKey']) expect(searchWallet(data.wallet, part), part).toHaveLength(0);
    // Named after its service and environment when its owner gave it no name.
    expect(walletTitle(data.wallet[0]!)).toBe('Stripe · production');
  });
});

describe('an API key, never filled into a page', () => {
  it('is no card and no address, whatever id a page names, and no list under a field offers it', () => {
    const { data, item } = added();
    const withCard = addWalletItem(data, { kind: 'card', title: '', holder: 'A', number: '4242424242424242', expMonth: 1, expYear: 2030, code: '123', notes: '' }).data;
    expect(fillableWalletItem(withCard, item.id, 'card')).toBeNull();
    expect(fillableWalletItem(withCard, item.id, 'address')).toBeNull();
    expect(walletOf(withCard, 'card').map((entry) => entry.kind)).toEqual(['card']);
    expect(walletOf(withCard, 'address')).toEqual([]);
    expect(fillableWalletItem(withCard, withCard.wallet[1]!.id, 'card')?.kind).toBe('card');
  });
});

describe('an API key running out', () => {
  it('is said within fourteen days and once expired, and counted in the checkup', () => {
    const now = Date.now();
    const soon = added({ title: 'Soon', expiresAt: inDays(14, now) });
    const later = added({ title: 'Later', key: GITHUB, expiresAt: inDays(15, now) }, soon.data);
    const gone = added({ title: 'Gone', key: 'sk_live_gone000000000000000', expiresAt: inDays(-1, now) }, later.data);
    const never = added({ title: 'Never', key: 'sk_live_never00000000000000', expiresAt: null }, gone.data);
    expect(daysLeft(soon.item, now)).toBe(14);
    expect(expiryNotice(soon.item, now)).toEqual({ days: 14, expired: false });
    expect(expiryNotice(later.item, now)).toBeNull();
    expect(expiryNotice(gone.item, now)).toEqual({ days: -1, expired: true });
    expect(expiryNotice({ expiresAt: inDays(0, now) }, now)).toEqual({ days: 0, expired: false });
    const result = checkup(never.data, now, true);
    expect(result.expiring.map((item) => item.title)).toEqual(['Gone', 'Soon']);
    expect(result.issues).toBe(2 + 1);
    // One in the trash is nobody's worry.
    const trashed = { ...never.data, wallet: never.data.wallet.map((item) => (item.title === 'Gone' ? { ...item, deletedAt: now } : item)) };
    expect(checkup(trashed, now, true).expiring.map((item) => item.title)).toEqual(['Soon']);
  });
});

describe('an API key in the account', () => {
  it('is sealed as any wallet record is, so the server cannot tell it from a card or a note, and keeps the keys either copy held', async () => {
    const recordKey = await recordsKey(await generateDataKey());
    const { data, item } = added();
    const plan = await planPush(data, {}, recordKey, 'me');
    expect(plan.records.map((record) => record.kind)).toEqual([WALLET_KIND]);
    expect(JSON.stringify(plan.records)).not.toContain(STRIPE);
    expect(JSON.stringify(plan.records)).not.toContain('apikey');

    // Two devices change the key at once: the newer edit wins, and neither key is lost.
    const here = updateWalletItem(data, item.id, key({ key: GITHUB }), 2_000);
    const there = updateWalletItem(data, item.id, key({ key: 'sk_live_there000000000000000' }), 3_000);
    const theirs = await planPush(there, {}, recordKey, 'other');
    const pulled = await applyPulled(here, {}, theirs.records, recordKey);
    const joined = pulled.data.wallet[0] as ApiKeyItem;
    expect(joined.key).toBe('sk_live_there000000000000000');
    expect(joined.history.map((entry) => entry.password).sort()).toEqual([GITHUB, STRIPE].sort());
    expect(joinWalletItem(joined, joined)).toEqual(joined);
  });
});

/** A ZIP archive of the files given, the way 1Password writes a .1pux: each one deflated. */
function zip(files: Record<string, string | Uint8Array>): Uint8Array {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const raw = typeof content === 'string' ? Buffer.from(content) : Buffer.from(content);
    const data = deflateRawSync(raw);
    const nameBytes = Buffer.from(name);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, nameBytes, data);
    centrals.push(central, nameBytes);
    offset += local.length + nameBytes.length + data.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(files).length, 8);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...locals, directory, end]));
}

const field = (id: string, value: Record<string, unknown>, title = id) => ({ id, title, value });

function onePux(items: Record<string, unknown>[]): Uint8Array {
  const data = { accounts: [{ attrs: { name: 'Test' }, vaults: [{ attrs: { name: 'Private' }, items }] }] };
  return zip({ 'export.attributes': '{"version":3}', 'export.data': JSON.stringify(data), 'files/doc.bin': new Uint8Array(64) });
}

describe('API keys from other managers', () => {
  it('come from 1Password’s .1pux: its API Credentials as API keys, its logins, cards and notes as they are', async () => {
    const expires = Date.UTC(2027, 5, 30, 12) / 1000;
    const file = onePux([
      {
        uuid: 'a',
        favIndex: 1,
        state: 'active',
        categoryUuid: '112',
        overview: { title: 'Stripe live', tags: ['Work/Payments'] },
        details: {
          notesPlain: 'Rotate each quarter.',
          sections: [
            {
              fields: [
                field('username', { string: 'acct_TESTONLY' }),
                field('credential', { concealed: STRIPE }),
                field('type', { menu: 'bearer' }),
                field('filename', { string: 'stripe.key' }),
                field('validFrom', { date: Date.UTC(2026, 0, 1, 12) / 1000 }, 'valid from'),
                field('expires', { date: expires }),
                field('hostname', { string: 'https://api.stripe.com' }),
                field('xyz', { concealed: 'whsec_TESTONLY' }, 'Webhook secret'),
                field('otp', { totp: 'otpauth://totp/x?secret=JBSWY3DPEHPK3PXP' }, 'one-time'),
              ],
            },
          ],
        },
      },
      { uuid: 'b', state: 'active', categoryUuid: '001', overview: { title: 'Mail', url: 'https://mail.example.test' }, details: { loginFields: [{ designation: 'username', value: 'alice' }, { designation: 'password', value: 'pw-Mail-1!' }] } },
      { uuid: 'c', state: 'active', categoryUuid: '002', overview: { title: 'Visa' }, details: { sections: [{ fields: [field('ccnum', { creditCardNumber: '4242424242424242' }), field('cvv', { concealed: '123' }), field('expiry', { monthYear: 203004 })] }] } },
      { uuid: 'd', state: 'archived', categoryUuid: '112', overview: { title: 'Old' }, details: { sections: [{ fields: [field('credential', { concealed: GITHUB })] }] } },
      { uuid: 'e', state: 'active', categoryUuid: '006', overview: { title: 'A document' }, details: {} },
    ]);
    const result = await importFileBytes(file);
    expect(result.format).toBe('onepassword');
    expect(result.drafts.map((draft) => draft.title)).toEqual(['Mail']);
    const [apiKey, card] = [result.wallet.find((item) => item.kind === 'apikey') as ApiKeyDraft, result.wallet.find((item) => item.kind === 'card')];
    expect(apiKey).toMatchObject({
      title: 'Stripe live',
      service: 'stripe',
      key: STRIPE,
      keyId: 'acct_TESTONLY',
      hosts: ['api.stripe.com'],
      sendAs: 'bearer',
      env: 'STRIPE_API_KEY',
      issuedAt: Date.UTC(2026, 0, 1),
      expiresAt: Date.UTC(2027, 5, 30),
      notes: 'stripe.key\nRotate each quarter.',
      favorite: true,
      folder: 'Work',
      fields: [{ name: 'Webhook secret', value: 'whsec_TESTONLY', hidden: true }],
    });
    expect(card).toMatchObject({ number: '4242424242424242', code: '123', expMonth: 4, expYear: 2030 });
    // The archived one is left; the document, with nothing Passhold keeps, too; the one-time code is counted.
    expect([result.skipped, result.twoFactor]).toEqual([2, 1]);
  });

  it('refuses a .1pux that is not one, and one whose items inflate past the bound, before they are all in memory', async () => {
    await expect(importOnePux(zip({ 'other.txt': 'x' }))).rejects.toMatchObject({ code: 'importUnknownFormat' });
    await expect(importOnePux(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3]))).rejects.toMatchObject({ code: 'importUnknownFormat' });
    const bomb = zip({ 'export.data': '0'.repeat(2_000_000) });
    await expect(readZipEntry(bomb, 'export.data', 100_000)).rejects.toMatchObject({ code: 'importTooLarge' });
    expect(new TextDecoder().decode((await readZipEntry(bomb, 'export.data', 3_000_000))!).length).toBe(2_000_000);
  });

  it('are offered from Bitwarden where its logins and notes hold them, and come as keys only where their owner ticks them', async () => {
    const vault = added({ key: 'sk_live_alreadyhere00000000000' }).data;
    const file = JSON.stringify({
      encrypted: false,
      items: [
        // A key saved as a login: its password starts as GitHub's tokens do.
        { type: 1, name: 'GitHub CI', login: { username: 'ci-bot', password: GITHUB, uris: [{ uri: 'https://api.github.com' }] } },
        // A note holding one in a hidden field named for it.
        { type: 2, name: 'Mail API', notes: 'For the newsletter.', fields: [{ name: 'API key', value: 'key-TESTONLY000000', type: 1 }, { name: 'Region', value: 'eu', type: 0 }] },
        // A login with a password of its own and a token beside it is a login.
        { type: 1, name: 'Bank', login: { username: 'alice', password: 'pw-Bank-1!', uris: [{ uri: 'https://bank.example.test' }] }, fields: [{ name: 'Token', value: 'abc', type: 1 }] },
        // A key the vault holds already is not offered again.
        { type: 2, name: 'Old', notes: 'sk_live_alreadyhere00000000000' },
      ],
    });
    const result = await importBitwardenJson(file, vault);
    expect(result.keys.map((candidate) => [candidate.from, candidate.draft.title, candidate.draft.service])).toEqual([
      ['login', 'GitHub CI', 'github'],
      ['wallet', 'Mail API', ''],
    ]);
    expect(result.keys[0]!.draft).toMatchObject({ key: GITHUB, keyId: 'ci-bot', hosts: ['api.github.com'], env: 'GITHUB_TOKEN' });
    expect(result.keys[1]!.draft).toMatchObject({ key: 'key-TESTONLY000000', notes: 'For the newsletter.', fields: [{ name: 'Region', value: 'eu', hidden: false }] });

    // The first ticked: it comes as a key and not as a login; the note comes as the note it was.
    const chosen = chooseKeys(result, new Set([0]));
    expect(chosen.logins.map((login) => login.title)).toEqual(['Bank']);
    expect(chosen.wallet.map((item) => [item.kind, item.title])).toEqual([
      ['note', 'Mail API'],
      ['note', 'Old'],
      ['apikey', 'GitHub CI'],
    ]);
    // None ticked: everything as it was.
    expect(chooseKeys(result, new Set()).logins).toHaveLength(2);
  });

  it('come from Bitwarden Secrets Manager’s list, each named as the variable it is', async () => {
    const listed = JSON.stringify([
      { object: 'secret', id: '1', organizationId: 'o', projectId: 'p', key: 'STRIPE_KEY', value: STRIPE, note: 'live', creationDate: '2026-01-01T00:00:00Z' },
      { object: 'secret', id: '2', organizationId: 'o', projectId: 'p', key: 'db password', value: 'pw', note: '' },
    ]);
    const result = await importFile(listed);
    expect(result.wallet.map((item) => item.kind === 'apikey' && [item.title, item.env, item.service, item.key])).toEqual([
      ['STRIPE_KEY', 'STRIPE_KEY', 'stripe', STRIPE],
      ['db password', 'db_password', '', 'pw'],
    ]);
    await expect(importFile('[1, 2]')).rejects.toMatchObject({ code: 'importUnknownFormat' });
  });

  it('go out as a CSV of their own, never in the logins’ file, and come back from it as they were', async () => {
    let { data } = added({ title: 'Pay, "live"', service: 'stripe', keyId: 'acct_1', hosts: ['api.stripe.com', '*.stripe.com'], sendAs: 'header:Stripe-Key', env: 'PAY', environment: 'production', scopes: 'charges, refunds', issuedAt: Date.UTC(2026, 0, 1), expiresAt: Date.UTC(2027, 0, 1), notes: 'line one\nline two', folder: 'Work' });
    data = added({ key: GITHUB, title: 'gone' }, data).data;
    data = { ...data, wallet: data.wallet.map((item) => (item.title === 'gone' ? { ...item, deletedAt: 5 } : item)) };
    const csv = exportApiKeysCsv(data.wallet);
    expect(csv.split('\r\n')[0]).toBe('title,service,key,key_id,hosts,send_as,env,environment,scopes,issued,expires,notes,folder');
    expect(csv).not.toContain(GITHUB);
    expect(exportCsv(data.items)).not.toContain(STRIPE);
    const back = await importFile(csv);
    expect(back.format).toBe('passhold');
    const { kind: _, ...was } = data.wallet[0] as ApiKeyItem;
    expect(back.wallet).toEqual([
      expect.objectContaining({ kind: 'apikey', title: was.title, service: was.service, key: was.key, keyId: was.keyId, hosts: was.hosts, sendAs: was.sendAs, env: was.env, environment: was.environment, scopes: was.scopes, issuedAt: was.issuedAt, expiresAt: was.expiresAt, notes: was.notes, folder: was.folder }),
    ]);
    // Into the vault that has it already, nothing new.
    expect((await importFile(csv, data)).duplicates).toBe(1);
  });
});

describe('an API key, never written to a log', () => {
  const said: string[] = [];
  beforeEach(() => {
    said.length = 0;
    for (const method of ['log', 'info', 'warn', 'error', 'debug', 'trace'] as const) {
      vi.spyOn(console, method).mockImplementation((...values: unknown[]) => void said.push(values.map((value) => (value instanceof Error ? `${value.message} ${value.stack}` : String(value))).join(' ')));
    }
  });
  afterEach(() => vi.restoreAllMocks());

  it('through everything the vault does with it, a refusal included', async () => {
    let { data, item } = added({ service: 'stripe' });
    data = updateWalletItem(data, item.id, key({ key: GITHUB }), 2_000, { versions: true });
    searchWallet(data.wallet, 'stripe');
    checkup(data);
    exportApiKeysCsv(data.wallet);
    await importFile(exportApiKeysCsv(data.wallet), data);
    await planPush(data, {}, await recordsKey(await generateDataKey()), 'me');
    const refused = (() => {
      try {
        updateWalletItem(data, item.id, { kind: 'card', title: '', holder: '', number: GITHUB, expMonth: null, expYear: null, code: '', notes: '' } as never, 3_000);
      } catch (error) {
        return error as Error;
      }
      return null;
    })();
    expect(refused).not.toBeNull();
    expect(`${refused!.message} ${refused!.stack}`).not.toContain(GITHUB);
    expect(said.join('\n')).not.toContain(STRIPE);
    expect(said.join('\n')).not.toContain(GITHUB);
  });
});

describe('older builds never lose an unknown wallet kind on sync', () => {
  it('leaves an unrecognized wallet record alone in personal and family sync without pushing a deletion or overwrite', async () => {
    const key = await recordsKey(await generateDataKey());
    // Simulate a record created by a newer Passhold build with a future wallet kind.
    const futureId = 'future-item-1';
    const futurePayload = { kind: 'future_secret_v2', id: futureId, title: 'Future item', secret: 'keep-me-safe', updatedAt: 5_000 };
    const box = await sealJson(key, { kind: WALLET_KIND, item: futurePayload }, utf8(`passhold.record:v1:${futureId}:${WALLET_KIND}:1`));
    const remote: RemoteRecord = {
      id: futureId,
      kind: WALLET_KIND,
      rev: 1,
      deleted: false,
      serverRev: 1,
      updatedAt: 5_000,
      deviceId: 'newer-device',
      box,
    };

    // Personal vault: older client cannot decode `future_secret_v2`, so `applyPulled` skips it without adding to `known`,
    // and `planPush` does not emit a tombstone or overwrite for `futureId`.
    const pulled = await applyPulled(emptyData(), {}, [remote], key);
    expect(pulled.skipped).toBe(1);
    expect(pulled.data.wallet).toEqual([]);
    expect(pulled.known[futureId]).toBeUndefined();

    // Even after editing another item locally, `futureId` is never touched or deleted.
    const edited = addWalletItem(pulled.data, { kind: 'note', title: 'Local note', text: 'hello' }, 6_000);
    const plan = await planPush(edited.data, pulled.known, key, 'older-device');
    expect(plan.records.map((r) => r.id)).toEqual([edited.item.id]);
    expect(plan.records.some((r) => r.id === futureId)).toBe(false);

    // Family vault: same invariant via `mergeFamilyPulled` + `planFamilyPush`.
    const familyVault: FamilyVault = {
      id: 'col-1',
      name: 'Shared',
      generation: 1,
      keyDue: false,
      items: [],
      wallet: [],
      known: {},
    };
    const familyMerged = await mergeFamilyPulled(familyVault, [
      {
        collectionId: 'col-1',
        id: futureId,
        kind: WALLET_KIND,
        rev: 1,
        deleted: false,
        stale: false,
        value: { kind: WALLET_KIND, item: futurePayload },
      },
    ]);
    expect(familyMerged.skipped).toBe(1);
    expect(familyMerged.vault.wallet).toEqual([]);
    expect(familyMerged.vault.known[futureId]).toBeUndefined();

    const familyPlan = await planFamilyPush(familyMerged.vault, familyMerged.vault.known, 7_000);
    expect(familyPlan.records).toEqual([]);
  });
});
