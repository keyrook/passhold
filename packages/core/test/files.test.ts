/**
 * Files kept with items: what an item holds of one, how two copies of an
 * item settle their files, and the files themselves against the Keyrook
 * account's own server from the kit, with a bucket in memory — and with a
 * server and a store that hand back what they please.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createAccount, HttpSyncAdapter, namedClient, sealedFileSize, startRegistration, type Fetcher, type LoginResponse, type Tokens } from '@keyrook/account';
import { describe, expect, it } from 'vitest';
import {
  addLogin,
  addWalletItem,
  applyPulled,
  attachFile,
  attachmentsOf,
  cleanLogin,
  deleteStoredFile,
  detachFile,
  emptyData,
  emptyTrash,
  fetchFile,
  fileFits,
  filesGone,
  joinLogin,
  joinWalletItem,
  LIMITS,
  loginSig,
  MAX_SEALED_FILE,
  moveToFamily,
  planPush,
  PRODUCT,
  readAttachments,
  recordsKey,
  storeFile,
  synced,
  trashLogin,
  updateLogin,
  updateWalletItem,
  withoutFileKeys,
  type Attachment,
  type LoginItem,
  type NoteItem,
  type VaultData,
} from '@passhold/core';

const KIT = resolve(import.meta.dirname, '../../../vendor/keyrook-account-kit/server-kit.mjs');
const ORIGIN = 'chrome-extension://passholdtestextensionidaaaaaaaaa';
const PASSWORD = 'Correct-Horse-Battery-9!';
const DEVICE = { deviceId: 'a', deviceName: 'Passhold · test' };
const KEY = 'A'.repeat(43) + '=';

const file = (id: string, addedAt = 1_000): Attachment => ({ id, key: KEY, name: `${id}.pdf`, type: 'application/pdf', size: 10, addedAt });

function withLogin(): { data: VaultData; item: LoginItem } {
  return addLogin(emptyData(), { title: 'Bank', username: 'me', password: 'pw', urls: ['https://bank.example'], notes: '' });
}

describe('what an item holds of a file', () => {
  it('reads a file’s line as it was written, and drops one that is not a file’s', () => {
    const read = readAttachments({
      attachments: [
        { ...file('good'), name: 'scan\n‮ftp.exe', type: 'Image/PNG' },
        { ...file('good'), name: 'twice' },
        // A colon would let a file's id read as another's place in its seal's label.
        { ...file('a:b') },
        { ...file('short'), key: 'AAAA' },
        { ...file('minus'), size: -1 },
        { ...file('type'), type: 'text/html; charset=utf-8' },
        'not a file',
      ],
    });
    expect(read.attachments?.map((entry) => entry.id)).toEqual(['good', 'type']);
    // One line, shown as text: a newline and a direction override are gone.
    expect(read.attachments?.[0]).toMatchObject({ name: 'scan ftp.exe', type: 'image/png' });
    // A type that is not a plain media type is no type at all: a page shows a file by it.
    expect(read.attachments?.[1]?.type).toBe('');
    // An item with none holds no list at all, so one from before files hashes as it did.
    expect(readAttachments({ attachments: [] })).toEqual({});
    expect(Object.keys(cleanLogin({ id: 'x', title: 'Old' })!)).not.toContain('attachments');
  });

  it('adds a file to a live item only, up to its limit, and takes it off remembered as taken off', () => {
    const { data, item } = withLogin();
    const attached = attachFile(data, item.id, file('one'), 2_000);
    expect(attachmentsOf(attached.items[0]!).map((entry) => entry.id)).toEqual(['one']);
    expect(attached.items[0]!.updatedAt).toBe(2_000);
    expect(() => attachFile(trashLogin(data, item.id), item.id, file('two'))).toThrow('itemInvalid');
    let full = data;
    for (let at = 0; at < LIMITS.attachments; at++) full = attachFile(full, item.id, file(`f${at}`));
    expect(() => attachFile(full, item.id, file('over'))).toThrow('attachmentsFull');
    const detached = detachFile(attached, item.id, 'one', 3_000);
    expect(detached.items[0]!.attachments).toBeUndefined();
    expect(detached.items[0]!.detached).toEqual(['one']);
    // An edit leaves the files as they are.
    expect(attachmentsOf(updateLogin(attached, item.id, { title: 'Bank 2', username: 'me', password: 'new', urls: [], notes: '' }).items[0]!)).toHaveLength(1);
  });

  it('never loses a file’s key to a copy that lacks it, and never brings back a file taken off', () => {
    const { data, item } = withLogin();
    const base = data.items[0]!;
    const here = attachFile(data, item.id, file('mine', 2_000), 2_000).items[0]!;
    // The other device edited later, and never saw the file: its newer edit wins, the file stays.
    const there = { ...base, password: 'theirs', updatedAt: 3_000 };
    expect(joinLogin(here, there)).toMatchObject({ password: 'theirs' });
    expect(attachmentsOf(joinLogin(here, there)).map((entry) => entry.id)).toEqual(['mine']);
    expect(attachmentsOf(joinLogin(there, here)).map((entry) => entry.id)).toEqual(['mine']);
    // Taken off here; a copy from before, still naming it, does not put it back, in either order.
    const off = detachFile({ ...data, items: [here] }, item.id, 'mine', 4_000).items[0]!;
    expect(joinLogin(off, here).attachments).toBeUndefined();
    expect(joinLogin(here, off).attachments).toBeUndefined();
    expect(joinLogin(here, off).detached).toEqual(['mine']);
    // Joined with itself, nothing changes.
    expect(joinLogin(here, here)).toEqual(here);
  });

  it('keeps a card’s, an address’s or a note’s files out of its versions, so restoring one neither brings back nor takes away a file', () => {
    const { data, item } = addWalletItem(emptyData(), { kind: 'note', title: 'Passport', text: 'Number in the scan' });
    const attached = attachFile(data, item.id, file('scan'));
    const edited = updateWalletItem(attached, item.id, { kind: 'note', title: 'Passport', text: 'Renewed' }, 5_000, { versions: true });
    const note = edited.wallet[0] as NoteItem;
    expect(note.versions?.[0]?.draft).not.toHaveProperty('attachments');
    expect(attachmentsOf(note)).toHaveLength(1);
    const other = { ...(data.wallet[0] as NoteItem), text: 'Elsewhere', updatedAt: 9_000 };
    expect(attachmentsOf(joinWalletItem(note, other))).toHaveLength(1);
  });

  it('travels in the item’s sealed record, and an item with none sends what it sent before', async () => {
    const { data, item } = withLogin();
    const before = await loginSig(data.items[0]!);
    expect(synced(data.items[0]!)).not.toHaveProperty('attachments');
    expect(await loginSig({ ...data.items[0]!, attachments: undefined } as LoginItem)).toBe(before);
    const attached = attachFile(data, item.id, file('scan'));
    const key = await recordsKey(await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']));
    const plan = await planPush(attached, {}, key, 'device');
    const pulled = await applyPulled(emptyData(), {}, plan.records.map((record, at) => ({ ...record, serverRev: at + 1 })), key);
    expect(pulled.data.items[0]?.attachments).toEqual(attached.items[0]?.attachments);
  });

  it('names what a change leaves no item naming — a trash emptied — and hands pages no key', () => {
    const { data, item } = withLogin();
    const attached = attachFile(data, item.id, file('scan'));
    expect(filesGone(attached, trashLogin(attached, item.id))).toEqual([]);
    expect(filesGone(attached, emptyTrash(trashLogin(attached, item.id)))).toEqual(['scan']);
    expect(withoutFileKeys(attached.items[0]!).attachments?.[0]?.key).toBe('');
  });

  it('does not move an item with files into a shared vault: they are its owner’s in the account', () => {
    const { data, item } = withLogin();
    const family = {
      orgId: 'org',
      name: 'Home',
      role: 'owner' as const,
      members: [],
      pin: null,
      keyChanged: [],
      left: [],
      state: { kind: 'open' as const },
      rotationDue: false,
      serverRev: 0,
      epoch: null,
      vaults: [{ id: 'shared', name: 'Shared', generation: 1, keyDue: false, known: {}, items: [], wallet: [] }],
    };
    const attached = { ...attachFile(data, item.id, file('scan')), families: [family] };
    expect(() => moveToFamily(attached, item.id, { orgId: 'org', vaultId: 'shared' })).toThrow('filesStay');
  });

  it('keeps a file up to what the account takes, sealed', () => {
    expect(MAX_SEALED_FILE).toBe(500 * 1024 * 1024);
    expect(fileFits(499 * 1024 * 1024)).toBe(true);
    // 500 MiB is the sealed size: the file's own is a little less.
    expect(fileFits(500 * 1024 * 1024)).toBe(false);
    expect(fileFits(MAX_SEALED_FILE - (sealedFileSize(MAX_SEALED_FILE) - MAX_SEALED_FILE))).toBe(true);
  });
});

// --- against the account's server ------------------------------------------------------------

async function server(options: Record<string, unknown> = {}) {
  const kit = (await import(/* @vite-ignore */ KIT)) as typeof import('../../../vendor/keyrook-account-kit/server-kit.mjs');
  const running = await kit.startServer({ products: { passhold: [ORIGIN] }, files: true, ...options });
  const fetcher: Fetcher = namedClient(running.fetcherFrom(ORIGIN), 'passhold/0.1.0');
  /** Every request the store is sent, and every one the server is sent, as a server would see them. */
  const seen: string[] = [];
  const record = (input: string, init?: RequestInit) => {
    const body = init?.body;
    seen.push(`${input} ${typeof body === 'string' ? body : body instanceof Uint8Array ? new TextDecoder('latin1').decode(body) : ''}`);
  };
  const connect = (answer: Pick<LoginResponse, 'accessToken' | 'refreshToken'>) => {
    let tokens: Tokens | null = { accessToken: answer.accessToken, refreshToken: answer.refreshToken };
    return new HttpSyncAdapter({
      baseUrl: '',
      fetcher: (input, init) => (record(input, init), fetcher(input, init)),
      tokens: { get: async () => tokens, set: async (next) => void (tokens = next), clear: async () => void (tokens = null) },
    });
  };
  /** The bucket, as the server's addresses reach it. */
  const store: Fetcher = (input, init) => (record(input, init), running.fetcher(input, init));
  const signUp = async (email: string) => {
    await running.resetMailLimits(email);
    await startRegistration('', email, fetcher);
    const made = await createAccount({ baseUrl: '', fetcher }, { email, code: running.codeFor(email)!, password: PASSWORD, product: PRODUCT, ...DEVICE });
    return { api: connect(made.session), productKey: made.productKey, accountId: made.productKey.accountId };
  };
  return { running, signUp, store, seen };
}

const refusal = (promise: Promise<unknown>) => promise.then(() => null, (error: Error) => error.message);
const bytesOf = (text: string) => new TextEncoder().encode(text);
const textOf = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

/** The bytes the store hands back, bent: what a store or a server that is not to be trusted could give. */
function bentStore(store: Fetcher, bend: (bytes: Uint8Array, url: string) => Uint8Array | Promise<Uint8Array>): Fetcher {
  return async (input, init) => {
    const answer = await store(input, init);
    if ((init?.method ?? 'GET') !== 'GET' || !answer.ok) return answer;
    return new Response(await bend(new Uint8Array(await answer.arrayBuffer()), input) as BodyInit, { status: 200 });
  };
}

describe.skipIf(!existsSync(KIT))('files, on the Keyrook account’s server', { timeout: 60_000 }, () => {
  it('puts a file in the account sealed, and opens it on another device from the item’s record alone', async () => {
    const { running, signUp, store, seen } = await server({ personalPlan: 'paid' });
    const alice = await signUp('alice@example.test');
    const secret = 'Passport number P1234567, scanned';
    const added = await storeFile(alice.api, { bytes: bytesOf(secret), name: 'passport.pdf', type: 'application/pdf', place: null }, store, 7_000);
    expect(added).toMatchObject({ name: 'passport.pdf', type: 'application/pdf', size: secret.length, addedAt: 7_000 });
    const { data, item } = withLogin();
    const vault = attachFile(data, item.id, added);
    const key = await recordsKey(alice.productKey.key);
    await alice.api.push((await planPush(vault, {}, key, DEVICE.deviceId)).records);

    // Neither the server nor the store was told what is in it, what it is called, or what opens it.
    const everything = seen.join('\n');
    for (const said of [secret, 'passport', added.key]) expect(everything).not.toContain(said);
    // The server holds a row with a size, and no name.
    const [row] = await running.sql.query<Record<string, unknown>>('SELECT * FROM files');
    expect(Object.values(row!).map(String).join(' ')).not.toMatch(/passport/i);

    // Another device: the record, then the file it names.
    const pulled = await applyPulled(emptyData(), {}, (await alice.api.pull(0)).records as never, key);
    const named = attachmentsOf(pulled.data.items[0]!)[0]!;
    expect(textOf(await fetchFile(() => alice.api.fileAddress(named.id), named, store))).toBe(secret);
    await running.close();
  });

  it('refuses whatever a store or a server hands back that is not the file sealed under that id and key', async () => {
    const { running, signUp, store } = await server({ personalPlan: 'paid' });
    const alice = await signUp('alice@example.test');
    const big = new Uint8Array(1024 * 1024 + 100).map((_, at) => at % 251);
    const one = await storeFile(alice.api, { bytes: big, name: 'two-chunks.bin', type: '', place: null }, store);
    const other = await storeFile(alice.api, { bytes: bytesOf('the other file'), name: 'other.txt', type: 'text/plain', place: null }, store);
    const sealedOther = new Uint8Array(await (await store((await alice.api.fileAddress(other.id)).url)).arrayBuffer());
    const address = () => alice.api.fileAddress(one.id);
    const refused = (bend: Parameters<typeof bentStore>[1]) => refusal(fetchFile(address, one, bentStore(store, bend)));

    expect(textOf((await fetchFile(address, one, store)).slice(0, 3))).toBe('\u0000\u0001\u0002');
    // A byte changed.
    expect(await refused((bytes) => bytes.map((value, at) => (at === 10 ? value ^ 1 : value)))).toBeTruthy();
    // Cut short by its last chunk: the count is in every chunk's label.
    expect(await refused((bytes) => bytes.subarray(0, 1024 * 1024 + 16))).toBeTruthy();
    // Its chunks swapped.
    expect(await refused((bytes) => new Uint8Array([...bytes.subarray(1024 * 1024 + 16), ...bytes.subarray(0, 1024 * 1024 + 16)]))).toBeTruthy();
    // Another of the account's own files, under this one's id.
    expect(await refused(() => sealedOther)).toBeTruthy();
    // A server that names the other file's address for this one.
    expect(await refusal(fetchFile(() => alice.api.fileAddress(other.id), one, store))).toBeTruthy();
    // The right bytes under the wrong key: what an item's record says opens nothing else.
    expect(await refusal(fetchFile(() => alice.api.fileAddress(other.id), { ...other, key: one.key }, store))).toBeTruthy();
    // And the size the record names is held too: a file the record says is shorter is refused, opened or not.
    expect(await refusal(fetchFile(() => alice.api.fileAddress(other.id), { ...other, size: 3 }, store))).toBeTruthy();
    await running.close();
  });

  it('deletes a file and gives back its room; one already gone is as good as deleted', async () => {
    const { running, signUp, store } = await server({ personalPlan: 'paid' });
    const alice = await signUp('alice@example.test');
    const added = await storeFile(alice.api, { bytes: bytesOf('to go'), name: 'note.txt', type: 'text/plain', place: null }, store);
    expect((await alice.api.files()).used).toBe(sealedFileSize(5));
    await deleteStoredFile(alice.api, added.id);
    expect((await alice.api.files()).used).toBe(0);
    await deleteStoredFile(alice.api, added.id);
    expect(await refusal(fetchFile(() => alice.api.fileAddress(added.id), added, store))).toBe('There is no such file.');
    await running.close();
  });

  it('keeps no file on the free plan, refuses one too large before sealing it, and gives back the room of an upload that failed', async () => {
    const { running, signUp, store } = await server({ personalPlan: 'free' });
    const bob = await signUp('bob@example.test');
    expect(await refusal(storeFile(bob.api, { bytes: bytesOf('x'), name: 'x', type: '', place: null }, store))).toBe('Your plan keeps no files.');
    const huge = { length: 600 * 1024 * 1024 } as Uint8Array;
    expect(await refusal(storeFile(bob.api, { bytes: huge, name: 'huge', type: '', place: null }, () => Promise.reject(new Error('sent'))))).toBe('fileTooLarge');
    await running.close();

    const paid = await server({ personalPlan: 'paid' });
    const alice = await paid.signUp('alice@example.test');
    // The store refuses the bytes: the row the server made for them goes, and takes no room.
    const failing: Fetcher = async (input, init) => (init?.method === 'PUT' ? new Response(null, { status: 403 }) : paid.store(input, init));
    expect(await refusal(storeFile(alice.api, { bytes: bytesOf('x'), name: 'x', type: '', place: null }, failing))).toBe('The file could not be sent. Try again.');
    expect(await alice.api.files()).toMatchObject({ files: [], used: 0 });
    await paid.running.close();
  });

  it('reads and deletes what it holds once its plan has ended, and keeps nothing new', async () => {
    const { running, signUp, store } = await server({ personalPlan: 'free' });
    const alice = await signUp('alice@example.test');
    // A personal plan, paid for, as billing would record one.
    const now = Date.now();
    await running.sql.query(
      `INSERT INTO subscriptions (id, customer_id, plan, account_id, status, event_at, created_at, updated_at) VALUES ($1, 'ctm_alice', 'personal', $2, 'active', $3, $3, $3)`,
      [`sub_${'a'.repeat(26)}`, alice.accountId, now],
    );
    const kept = await storeFile(alice.api, { bytes: bytesOf('kept for good'), name: 'kept.txt', type: 'text/plain', place: null }, store);
    const second = await storeFile(alice.api, { bytes: bytesOf('also kept'), name: 'also.txt', type: 'text/plain', place: null }, store);
    await running.sql.query(`UPDATE subscriptions SET status = 'canceled'`);

    expect(await refusal(storeFile(alice.api, { bytes: bytesOf('new'), name: 'new.txt', type: '', place: null }, store))).toBe('Your plan keeps no files.');
    expect(textOf(await fetchFile(() => alice.api.fileAddress(kept.id), kept, store))).toBe('kept for good');
    await deleteStoredFile(alice.api, second.id);
    expect((await alice.api.files()).files.map((entry) => entry.id)).toEqual([kept.id]);
    await running.close();
  });
});
