/**
 * A family's shared vault in the account: each login, card, address and note
 * one record of the family's, synced by the rules the vault's own records
 * follow (`mergePulled`, `changesOf`).
 *
 * The records are sealed and opened by @keyrook/account's family flows
 * (`sealFamilyRecord`, `pullFamily`, `pushFamily`), under the collection's key
 * as this device's pinned roster vouches for it. A record they cannot read is
 * never taken; where this browser holds the item, its own copy goes up over
 * it, as the vault's own does over a record that will not open — or every
 * push of the item would come back a conflict. What is Passhold's is what goes
 * inside: the item, with its kind beside it, so a card's record never opens as
 * a login whatever the server labels it.
 *
 * A deletion goes inside too. The flows send a deletion as the record's
 * `deleted` flag with nothing sealed, and open any record the server flags as
 * one; the server may flag any record it holds, so taken at its word it could
 * take every shared item off every browser at once. Passhold seals its
 * deletions as values (`{ kind, id, deleted: true }`) in a live record, and
 * takes only those: a flag alone leaves the item, which goes up again over it,
 * as the vault's own records do (account/sync.ts, `sealTombstone`).
 */
import { cleanLogin } from '../vault/items.js';
import type { FamilyVault, KnownRecord, LoginItem, WalletItem } from '../vault/model.js';
import { cleanWalletItem } from '../vault/wallet.js';
import { changesOf, mergePulled, RECORD_KIND, synced, WALLET_KIND, type RecordCodec, type RemoteRecord } from './sync.js';

/**
 * A family record as the family flows hand it back, opened: its value, or
 * null where the server flagged it deleted; `stale` when it opened under a
 * key from before the one in use.
 */
export interface OpenedFamilyRecord {
  id: string;
  kind: string;
  collectionId: string;
  rev: number;
  deleted: boolean;
  value: unknown;
  stale: boolean;
}

/** A record the flows could not open: where it is and at which revision, and nothing of what it holds. */
export interface UnreadableRecord {
  id: string;
  kind: string;
  collectionId: string;
  rev: number;
  deleted: boolean;
}

/** What Passhold seals in a family record: the item and its kind, as it travels; or its deletion for good, sealed as well. */
export type FamilyValue = { kind: string; item: unknown } | { kind: string; id: string; deleted: true };

/** A change to a shared vault, for `sealFamilyRecord` to seal at `rev`. */
export interface FamilyChange {
  id: string;
  kind: string;
  rev: number;
  updatedAt: number;
  value: FamilyValue;
}

const valueOf = (kind: string, id: string, item: LoginItem | WalletItem | null): FamilyValue => (item ? { kind, item: synced(item) } : { kind, id, deleted: true });

/** A deletion Passhold sealed for this very record: its kind and id inside, in a record the flows opened as live. */
const sealedDeletion = (record: OpenedFamilyRecord): boolean => {
  const value = record.value as { kind?: unknown; id?: unknown; deleted?: unknown } | null;
  return !record.deleted && value?.kind === record.kind && value.id === record.id && value.deleted === true;
};

/** Opened records as the sync's rules read them: each found again by id and revision, never by what the server says around it. */
function openedCodec(records: readonly OpenedFamilyRecord[]): RecordCodec {
  const byPlace = new Map(records.map((record) => [`${record.id}:${record.rev}`, record]));
  const value = (record: RemoteRecord, kind: string) => {
    const opened = byPlace.get(`${record.id}:${record.rev}`);
    if (!opened || opened.deleted || sealedDeletion(opened) || opened.kind !== kind || record.kind !== kind) return null;
    const sealed = opened.value as { kind?: unknown; item?: unknown } | null;
    return sealed?.kind === kind ? { item: sealed.item, current: !opened.stale } : null;
  };
  const refuse = (): never => {
    throw new Error('Records of a shared vault are sealed by the family flows.');
  };
  return {
    sealLogin: refuse,
    sealWalletItem: refuse,
    async openLogin(record) {
      const opened = value(record, RECORD_KIND);
      const item = opened && cleanLogin(opened.item);
      return item && item.id === record.id ? { item: { ...item, lastUsedAt: null }, current: opened.current } : null;
    },
    async openWalletItem(record) {
      const opened = value(record, WALLET_KIND);
      const item = opened && cleanWalletItem(opened.item);
      return item && item.id === record.id ? { item: { ...item, lastUsedAt: null }, current: opened.current } : null;
    },
    sealTombstone: refuse,
    async tombstoneOpens(record) {
      const opened = byPlace.get(`${record.id}:${record.rev}`);
      return opened !== undefined && opened.kind === record.kind && sealedDeletion(opened);
    },
  };
}

/**
 * A shared vault with what the family's sync brought, as the flows opened it.
 * Only this collection's records are taken: the family's sync hands every
 * collection's together. One opened under a key from before goes up again
 * under the one in use.
 */
export async function mergeFamilyPulled(
  vault: FamilyVault,
  records: readonly OpenedFamilyRecord[],
  unreadable: readonly UnreadableRecord[] = [],
): Promise<{ vault: FamilyVault; removed: number; skipped: number }> {
  const mine = records.filter((record) => record.collectionId === vault.id);
  // Found by nothing in the codec, so each reads as a record that will not open.
  const blind = unreadable
    .filter((record) => record.collectionId === vault.id)
    .map(({ id, kind, rev, deleted }) => ({ id, kind, rev, deleted, serverRev: 0, updatedAt: 0, deviceId: '', box: null }));
  // A deletion is one sealed as such, or the server's flag, which `tombstoneOpens` will not take.
  const remote: RemoteRecord[] = mine.map((record) => ({
    id: record.id,
    kind: record.kind,
    rev: record.rev,
    deleted: record.deleted || sealedDeletion(record),
    serverRev: 0,
    updatedAt: 0,
    deviceId: '',
    box: null,
  }));
  const pulled = await mergePulled(vault, vault.known, [...remote, ...blind], openedCodec(mine));
  return { vault: { ...pulled.data, known: pulled.known }, removed: pulled.removed, skipped: pulled.skipped };
}

/** What of a shared vault goes up, for `sealFamilyRecord` to seal, and each item's signature to keep once it is taken. */
export async function planFamilyPush(vault: FamilyVault, known: Record<string, KnownRecord>, now = Date.now()): Promise<FamilyPushPlan> {
  const { changes, sigs } = await changesOf(vault, known, now);
  return { records: changes.map(({ id, kind, rev, updatedAt, item }) => ({ id, kind, rev, updatedAt, value: valueOf(kind, id, item) })), sigs };
}

/** As `PushPlan`, its records not yet sealed: `acceptPushed` takes it once the family's server has. */
export interface FamilyPushPlan {
  records: FamilyChange[];
  sigs: Record<string, string>;
}
