/**
 * Passhold's logins in a Keyrook account: each login one record, sealed on
 * this device before it leaves — and each card, address and note likewise.
 *
 * Passhold has a key of its own in the account (account/product.ts), which
 * no other Keyrook product holds. Records are sealed under a key drawn from it
 * (HKDF, "passhold:v1:records") and bound to their id and revision, under a
 * record kind of their own: the server hands each product only its own kinds,
 * and a record cannot be read, moved or replayed as another.
 *
 * The server is untrusted, not merely unable to read: it chooses every field
 * around the ciphertext and which records a device is handed. A record that
 * will not open is skipped; a newer edit here never yields to an older one
 * there; a deletion is sealed as a login is, taken only if it opens, and
 * counted, so it is never silent.
 */
import { open, seal, type SealedBox } from '../crypto/aead.js';
import { fromBase64, fromUtf8, toHex, utf8 } from '../util/bytes.js';
import { newId } from '../util/id.js';
import { canonical, joinLogin, joinWalletItem } from '../vault/backup.js';
import { cleanLogin } from '../vault/items.js';
import type { FamilyLink, Items, KnownRecord, LoginItem, VaultData, WalletItem } from '../vault/model.js';
import { cleanWalletItem } from '../vault/wallet.js';

export type { KnownRecord };

/** Passhold's records in the account. Authenticator's are `item` and `group`. */
export const RECORD_KIND = 'passhold.login';

/**
 * Cards, addresses and notes: one kind for the three, so the server learns how
 * many there are and never which is which. A Passhold from before them passes
 * the kind over, so it can neither read one as a login nor send it back as one.
 */
export const WALLET_KIND = 'passhold.wallet';

/** A record as the server carries it. */
export interface RemoteRecord {
  id: string;
  kind: string;
  serverRev: number;
  rev: number;
  deleted: boolean;
  updatedAt: number;
  deviceId: string;
  box: SealedBox | null;
}

/** The key Passhold's records are sealed under, drawn from Passhold's key in the account. */
export async function recordsKey(productKey: CryptoKey): Promise<CryptoKey> {
  const raw = await crypto.subtle.exportKey('raw', productKey);
  const material = await crypto.subtle.importKey('raw', raw, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32) as BufferSource, info: utf8('passhold:v1:records') as BufferSource },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

const aad = (id: string, rev: number) => utf8(`passhold.record:v1:${id}:${rev}`);
// Its own prefix, so a box from one kind of record never opens as the other.
const walletAad = (id: string, rev: number) => utf8(`passhold.wallet:v1:${id}:${rev}`);
// A deletion's own prefix, bound to the kind it deletes: neither a login's box nor a card's opens as one.
const tombstoneAad = (kind: string, id: string, rev: number) => utf8(`passhold.tombstone:v1:${kind}:${id}:${rev}`);

/**
 * What of a login travels: everything but when it was last used here, which
 * is this device's own. A folder and fields go only when there are some: an
 * item from before them hashes as it did, and is not sent again for nothing.
 */
export function synced<T extends LoginItem | WalletItem>(item: T): Omit<T, 'lastUsedAt' | 'folder' | 'fields'> & Partial<Pick<T, 'folder' | 'fields'>> {
  const { lastUsedAt: _, folder, fields, ...rest } = item;
  return { ...rest, ...(folder ? { folder } : {}), ...(fields.length ? { fields } : {}) };
}

export async function loginSig(item: LoginItem): Promise<string> {
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', utf8(JSON.stringify(synced(item))) as BufferSource)));
}

export async function sealLogin(key: CryptoKey, item: LoginItem, rev: number): Promise<SealedBox> {
  return seal(key, utf8(JSON.stringify(synced(item))), aad(item.id, rev));
}

/** The login a record holds, or null when it will not open or is not one: skipped, never thrown. */
export async function openLogin(key: CryptoKey, record: RemoteRecord): Promise<LoginItem | null> {
  if (record.kind !== RECORD_KIND || !record.box || record.deleted) return null;
  try {
    const raw = JSON.parse(fromUtf8(await open(key, record.box, aad(record.id, record.rev)))) as unknown;
    const item = cleanLogin(raw);
    // The id inside must be the record's: a box moved onto another record would not open, but say so twice.
    return item && item.id === record.id ? { ...item, lastUsedAt: null } : null;
  } catch {
    return null;
  }
}

export async function walletSig(item: WalletItem): Promise<string> {
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', utf8(canonical(synced(item))) as BufferSource)));
}

export async function sealWalletItem(key: CryptoKey, item: WalletItem, rev: number): Promise<SealedBox> {
  return seal(key, utf8(JSON.stringify(synced(item))), walletAad(item.id, rev));
}

/** The card, address or note a record holds, or null when it will not open or is not one. */
export async function openWalletItem(key: CryptoKey, record: RemoteRecord): Promise<WalletItem | null> {
  if (record.kind !== WALLET_KIND || !record.box || record.deleted) return null;
  try {
    const raw = JSON.parse(fromUtf8(await open(key, record.box, walletAad(record.id, record.rev)))) as unknown;
    const item = cleanWalletItem(raw);
    return item && item.id === record.id ? { ...item, lastUsedAt: null } : null;
  } catch {
    return null;
  }
}

/**
 * A deletion for good, sealed as the record it deletes would be. `deleted`
 * is a flag the server could set on any record it holds — and it knows
 * every record's id and revision — so unsealed, it would let the server
 * take every login off every device at once.
 */
export async function sealTombstone(key: CryptoKey, kind: string, id: string, rev: number): Promise<SealedBox> {
  return seal(key, utf8(JSON.stringify({ id, deleted: true })), tombstoneAad(kind, id, rev));
}

/** Whether a deletion is one sealed under this key, for this record at this revision. */
export async function tombstoneOpens(key: CryptoKey, record: RemoteRecord): Promise<boolean> {
  if (!record.deleted || !record.box) return false;
  try {
    const raw = JSON.parse(fromUtf8(await open(key, record.box, tombstoneAad(record.kind, record.id, record.rev)))) as { id?: unknown; deleted?: unknown } | null;
    return raw?.id === record.id && raw.deleted === true;
  } catch {
    return false;
  }
}

export interface PulledResult<T extends Items = VaultData> {
  data: T;
  known: Record<string, KnownRecord>;
  /** Logins removed here because another device deleted them for good. */
  removed: number;
  /** Records skipped because they would not open. */
  skipped: number;
}

/**
 * A login's signature as one still to be sealed and sent: no login hashes to
 * it, so the next push sends the login again, with a higher revision.
 */
export const UNSENT = '0'.repeat(64);

/** Every login known to the server, marked to go up again: sealed under a key that has just replaced the one before. */
export function resendAll(known: Record<string, KnownRecord>): Record<string, KnownRecord> {
  return Object.fromEntries(Object.entries(known).map(([id, record]) => [id, { ...record, sig: UNSENT }]));
}

/** Whether everything this device knows of is on the server as it is here, sealed under today's key. */
export function allSent(known: Record<string, KnownRecord>): boolean {
  return Object.values(known).every((record) => record.sig !== UNSENT);
}

/** An item a record held, and whether it opened under the key in use: one that did not goes up again under it. */
export interface Opened<T> {
  item: T;
  current: boolean;
}

/**
 * How records are sealed and opened: under Passhold's key in the account for
 * the vault's own (`keyCodec`), under a collection's key for a family's shared
 * vault (account/family.ts). What is taken and what is sent is the same for
 * both (`mergePulled`, `planRecords`).
 */
export interface RecordCodec {
  sealLogin(item: LoginItem, rev: number): Promise<SealedBox>;
  sealWalletItem(item: WalletItem, rev: number): Promise<SealedBox>;
  /** Null when it will not open, or is not one: skipped, never thrown. */
  openLogin(record: RemoteRecord): Promise<Opened<LoginItem> | null>;
  openWalletItem(record: RemoteRecord): Promise<Opened<WalletItem> | null>;
  sealTombstone(kind: string, id: string, rev: number): Promise<SealedBox>;
  tombstoneOpens(record: RemoteRecord): Promise<boolean>;
}

/**
 * The vault's own records, under the records key drawn from Passhold's key.
 * `previous`: the records key from before Passhold's key was replaced. A
 * record that opens only with it is taken, and marked to go up again under
 * the new key — until every one has, the previous key is kept.
 */
export function keyCodec(key: CryptoKey, previous: CryptoKey | null = null): RecordCodec {
  const either = async <T>(open: (with_: CryptoKey) => Promise<T | null>): Promise<Opened<T> | null> => {
    const current = await open(key);
    if (current) return { item: current, current: true };
    const before = previous ? await open(previous) : null;
    return before ? { item: before, current: false } : null;
  };
  return {
    sealLogin: (item, rev) => sealLogin(key, item, rev),
    sealWalletItem: (item, rev) => sealWalletItem(key, item, rev),
    openLogin: (record) => either((with_) => openLogin(with_, record)),
    openWalletItem: (record) => either((with_) => openWalletItem(with_, record)),
    sealTombstone: (kind, id, rev) => sealTombstone(key, kind, id, rev),
    tombstoneOpens: async (record) => (await tombstoneOpens(key, record)) || (previous !== null && (await tombstoneOpens(previous, record))),
  };
}

/**
 * Bring pulled records into the vault. A login here that changed since this
 * device last synced it keeps its edit, joined with the other copy (the
 * newer edit wins; the other password goes into the history), and is pushed
 * back. A deletion wins over an edit, as in Keyrook Authenticator: removing a
 * login everywhere must not be undone by a device that slept through it —
 * but only a deletion sealed under Passhold's key (`tombstoneOpens`).
 */
export async function applyPulled(
  data: VaultData,
  known: Record<string, KnownRecord>,
  records: RemoteRecord[],
  key: CryptoKey,
  previous: CryptoKey | null = null,
): Promise<PulledResult> {
  return mergePulled(data, known, records, keyCodec(key, previous));
}

/** `applyPulled`, for whatever holds items and however its records are sealed: the vault's own, or a family's shared vault. */
export async function mergePulled<T extends Items>(
  data: T,
  known: Record<string, KnownRecord>,
  records: RemoteRecord[],
  codec: RecordCodec,
): Promise<PulledResult<T>> {
  const next = { ...known };
  const items = new Map(data.items.map((item) => [item.id, item]));
  const wallet = new Map(data.wallet.map((item) => [item.id, item]));
  let removed = 0;
  let skipped = 0;
  for (const record of records) {
    if (record.kind !== RECORD_KIND && record.kind !== WALLET_KIND) continue;
    // A revision no newer than the one this device already holds is a replay, or its own push coming back.
    if (next[record.id] && record.rev <= next[record.id]!.rev) continue;
    if (record.deleted) {
      const sealed = await codec.tombstoneOpens(record);
      if (!sealed && (items.has(record.id) || wallet.has(record.id))) {
        // The server's word alone: the login stays, and goes up again over
        // the deletion at the revision after it, as over any record that
        // will not open. One this vault does not hold has nothing to lose.
        skipped++;
        next[record.id] = wallet.has(record.id) ? { rev: record.rev, sig: UNSENT, kind: 'wallet' } : { rev: record.rev, sig: UNSENT };
        continue;
      }
      if (items.delete(record.id) || wallet.delete(record.id)) removed++;
      delete next[record.id];
      continue;
    }
    if (record.kind === WALLET_KIND) {
      const opened = await codec.openWalletItem(record);
      if (!opened) {
        skipped++;
        if (wallet.has(record.id)) next[record.id] = { rev: record.rev, sig: UNSENT, kind: 'wallet' };
        continue;
      }
      const theirs = opened.item;
      const ours = wallet.get(record.id);
      wallet.set(record.id, ours ? { ...joinWalletItem(ours, theirs), lastUsedAt: ours.lastUsedAt } : theirs);
      next[record.id] = { rev: record.rev, sig: opened.current ? await walletSig(theirs) : UNSENT, kind: 'wallet' };
      continue;
    }
    const opened = await codec.openLogin(record);
    if (!opened) {
      skipped++;
      // A record that will not open over a login this vault holds — sealed
      // under a key from before, say — is written over by this one: without
      // its revision, every push of the login would come back a conflict.
      // One this vault does not hold is left alone, never deleted.
      if (items.has(record.id)) next[record.id] = { rev: record.rev, sig: UNSENT };
      continue;
    }
    const theirs = opened.item;
    const ours = items.get(record.id);
    items.set(record.id, ours ? { ...joinLogin(ours, theirs), lastUsedAt: ours.lastUsedAt } : theirs);
    // Opened with a key from before: on the server it is still sealed under that one, so it goes up again.
    next[record.id] = { rev: record.rev, sig: opened.current ? await loginSig(theirs) : UNSENT };
  }
  return { data: { ...data, items: [...items.values()], wallet: [...wallet.values()] }, known: next, removed, skipped };
}

export interface PushPlan {
  records: RemoteRecord[];
  /** Each pushed item's signature, to be kept once the server accepts it. */
  sigs: Record<string, string>;
}

/** Logins, cards, addresses and notes changed since this device last synced them, and those deleted here for good. */
export async function planPush(data: VaultData, known: Record<string, KnownRecord>, key: CryptoKey, deviceId: string, now = Date.now()): Promise<PushPlan> {
  return planRecords(data, known, keyCodec(key), deviceId, now);
}

/** What is to go up: an item at its next revision, or, with no item, its deletion for good. */
export interface RecordChange {
  id: string;
  kind: string;
  rev: number;
  updatedAt: number;
  item: LoginItem | WalletItem | null;
}

/**
 * What changed since this device last synced, not yet sealed: for a family's
 * shared vault, whose records the account's family flows seal.
 */
export async function changesOf(data: Items, known: Record<string, KnownRecord>, now = Date.now()): Promise<{ changes: RecordChange[]; sigs: Record<string, string> }> {
  const changes: RecordChange[] = [];
  const sigs: Record<string, string> = {};
  for (const item of data.items) {
    const sig = await loginSig(item);
    if (known[item.id]?.sig === sig) continue;
    changes.push({ id: item.id, kind: RECORD_KIND, rev: (known[item.id]?.rev ?? 0) + 1, updatedAt: item.updatedAt, item });
    sigs[item.id] = sig;
  }
  for (const item of data.wallet) {
    const sig = await walletSig(item);
    if (known[item.id]?.sig === sig) continue;
    changes.push({ id: item.id, kind: WALLET_KIND, rev: (known[item.id]?.rev ?? 0) + 1, updatedAt: item.updatedAt, item });
    sigs[item.id] = sig;
  }
  const here = new Set([...data.items, ...data.wallet].map((item) => item.id));
  for (const [id, record] of Object.entries(known)) {
    if (here.has(id)) continue;
    changes.push({ id, kind: record.kind === 'wallet' ? WALLET_KIND : RECORD_KIND, rev: record.rev + 1, updatedAt: now, item: null });
  }
  return { changes, sigs };
}

/** `planPush`, for whatever holds items and however its records are sealed. */
export async function planRecords(data: Items, known: Record<string, KnownRecord>, codec: RecordCodec, deviceId: string, now = Date.now()): Promise<PushPlan> {
  const { changes, sigs } = await changesOf(data, known, now);
  const records: RemoteRecord[] = [];
  for (const { id, kind, rev, updatedAt, item } of changes) {
    const box = !item
      ? await codec.sealTombstone(kind, id, rev)
      : kind === WALLET_KIND
        ? await codec.sealWalletItem(item as WalletItem, rev)
        : await codec.sealLogin(item as LoginItem, rev);
    records.push({ id, kind, serverRev: 0, rev, deleted: !item, updatedAt, deviceId, box });
  }
  return { records, sigs };
}

/**
 * What this device knows once the server took a push: each accepted item at
 * the signature it was sent with — if it changed since, the two differ, and it
 * goes out again — and each accepted deletion forgotten.
 */
export function acceptPushed(
  known: Record<string, KnownRecord>,
  plan: { records: readonly { id: string; kind: string }[]; sigs: Record<string, string> },
  accepted: readonly { id: string; rev: number }[],
): Record<string, KnownRecord> {
  const next = { ...known };
  const kinds = new Map(plan.records.map((record) => [record.id, record.kind]));
  for (const { id, rev } of accepted) {
    const sig = plan.sigs[id];
    if (sig) next[id] = kinds.get(id) === WALLET_KIND ? { rev, sig, kind: 'wallet' } : { rev, sig };
    else delete next[id];
  }
  return next;
}

/**
 * The vault once this browser was removed from the account, by a proof
 * Passhold's key checked (`removalProved`) and never on the server's word:
 * each login, card, address and note the account holds as it is here is
 * taken off, and with them Passhold's key, the account's recovery key and
 * the session. One added or changed here and never sent stays, this
 * browser's own — Keyrook Authenticator keeps the same. The link stays,
 * signed out and holding no key, as one from before keys per product does:
 * signing in again brings the account's back, and sends up what stayed.
 */
export async function removedFromAccount(data: VaultData, removedAt: number): Promise<VaultData> {
  const link = data.account;
  if (!link) return data;
  // The families are the account's: their shared vaults go too, but for what this browser never sent them.
  data = { ...(await dropFamilyVaults(data, () => false)), families: [] };
  // As `planPush` sees it: an item whose signature is the one the account took is the account's copy.
  const items: LoginItem[] = [];
  for (const item of data.items) if (link.known[item.id]?.sig !== (await loginSig(item))) items.push(item);
  const wallet: WalletItem[] = [];
  for (const item of data.wallet) if (link.known[item.id]?.sig !== (await walletSig(item))) wallet.push(item);
  return {
    ...data,
    items,
    wallet,
    account: {
      email: link.email,
      name: null,
      deviceId: link.deviceId,
      accountId: null,
      productKey: null,
      previousKey: null,
      root: null,
      keyGeneration: 1,
      rootGeneration: 1,
      sheetVerifiedAt: null,
      tokens: null,
      serverRev: 0,
      epoch: null,
      // Known to nobody now: a sign-in again pushes no deletion for what was taken off here.
      known: {},
      lastSyncAt: null,
      kit: null,
      pendingStartOver: null,
      removedAt,
      provider: link.provider,
      passwordless: link.passwordless,
      // Left on the account: on a link with no key, a passkey named here is one to take down at the next sign-in.
      passkey: null,
    },
  };
}

/**
 * The vault with the shared vaults `keep` refuses taken out: a family left, a
 * collection deleted or no longer shared with this account. What they held
 * goes with them — the family still holds it — but an item added or changed
 * here and never sent stays, moved into the vault's own, as a browser removed
 * from the account keeps what it never sent (`removedFromAccount`).
 */
export async function dropFamilyVaults(data: VaultData, keep: (place: { orgId: string; vaultId: string }) => boolean): Promise<VaultData> {
  const items = [...data.items];
  const wallet = [...data.wallet];
  const taken = new Set([...items, ...wallet].map((item) => item.id));
  // Its id was the family's to choose: one the vault's own already uses is given a new one.
  const settle = <T extends LoginItem | WalletItem>(item: T): T => {
    const placed = taken.has(item.id) ? { ...item, id: newId() } : item;
    taken.add(placed.id);
    return placed;
  };
  const families: FamilyLink[] = [];
  for (const family of data.families) {
    const vaults = [];
    for (const vault of family.vaults) {
      if (keep({ orgId: family.orgId, vaultId: vault.id })) {
        vaults.push(vault);
        continue;
      }
      for (const item of vault.items) if (vault.known[item.id]?.sig !== (await loginSig(item))) items.push(settle(item));
      for (const item of vault.wallet) if (vault.known[item.id]?.sig !== (await walletSig(item))) wallet.push(settle(item));
    }
    families.push({ ...family, vaults });
  }
  return { ...data, items, wallet, families };
}

/** The account key kept in the vault, back as a key. */
export async function importAccountKey(raw: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', fromBase64(raw) as BufferSource, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
}
