/**
 * A link between two products of one account, as each product's device runs
 * it: its key opened with the product's own key, and its records sealed,
 * opened, pulled and pushed under it. The account page turns it on, since
 * only the page opens every product's key (`consoleLinkProducts`); either
 * side, or the page, turns it off.
 */
import { DecryptionError, type SealedBox } from '../crypto/aead.js';
import {
  linkIdOf,
  openLinkKey,
  openLinkRecord,
  openLinkTombstone,
  sealLinkKey,
  sealLinkRecord,
  sealLinkTombstone,
  type LinkCode,
} from '../keys/link.js';
import type { RemoteRecord } from '../sync/adapter.js';
import { SyncHttpError, type HttpSyncAdapter } from '../sync/http.js';
import type { ProductKey } from './product-key.js';
import { boxFrom, wire } from './wire.js';

/** The kind every record of a link has. */
export const LINK_CODE_KIND = 'link.code';

/** A link, open on one product's device. */
export interface OpenLink {
  link: string;
  accountId: string;
  product: string;
  key: CryptoKey;
}

export type OpenedLink =
  | { status: 'open'; link: OpenLink }
  /** Nobody turned it on, or it was turned off: the codes are in Authenticator, and nothing shows them here. */
  | { status: 'off' }
  /** The account's plan does not hold it now. Nothing was deleted; it is there again when the plan comes back. */
  | { status: 'premium' };

/**
 * Opens the link between this product and `other`, with this product's key;
 * with the key it replaced too, while `replaceProductKey` runs, sealing the
 * link key again under the new one.
 */
export async function openLink(api: HttpSyncAdapter, productKey: ProductKey, other: string, previousKey?: CryptoKey): Promise<OpenedLink> {
  const link = linkIdOf(productKey.product, other);
  let state;
  try {
    state = await api.link(link);
  } catch (error) {
    if (error instanceof SyncHttpError && error.status === 404) return { status: 'off' };
    if (error instanceof SyncHttpError && error.status === 403 && error.code === 'forbidden' && /Premium/.test(error.message)) return { status: 'premium' };
    throw error;
  }
  const box = state.boxes.find((entry) => entry.product === productKey.product);
  if (!box) return { status: 'off' };
  const { accountId, product } = productKey;
  for (const key of [productKey.key, ...(previousKey ? [previousKey] : [])]) {
    let opened: CryptoKey;
    try {
      opened = await openLinkKey(boxFrom<SealedBox>(box.box), key, accountId, link, product);
    } catch (error) {
      if (error instanceof DecryptionError) continue;
      throw error;
    }
    if (key !== productKey.key) await api.putLinkBoxes(link, { boxes: [{ product, box: wire(await sealLinkKey(opened, productKey.key, accountId, link, product)) }] });
    return { status: 'open', link: { link, accountId, product, key: opened } };
  }
  throw new DecryptionError('The link’s key does not open with this app’s key.');
}

/** One of a link's records, opened. */
export interface LinkRecord {
  id: string;
  rev: number;
  serverRev: number;
  deleted: boolean;
  updatedAt: number;
  /** Null when deleted. */
  value: LinkCode | null;
}

/** A code of the link sealed at `rev`, for `pushLink`; `value` null deletes it, sealed as the record would be. */
export async function sealLinkCode(open: OpenLink, record: { id: string; rev: number; value: LinkCode | null; updatedAt?: number }): Promise<RemoteRecord> {
  const place = { accountId: open.accountId, link: open.link, id: record.id, rev: record.rev };
  if (record.value && record.value.from !== open.product) throw new Error('A code is written by the app that writes it.');
  return {
    id: record.id,
    kind: LINK_CODE_KIND,
    serverRev: 0,
    rev: record.rev,
    deleted: record.value === null,
    updatedAt: record.updatedAt ?? Date.now(),
    deviceId: '',
    box: record.value === null ? await sealLinkTombstone(open.key, place) : await sealLinkRecord(open.key, record.value, place),
  };
}

/**
 * Opens a record at the place and revision it says, all of which its seal
 * covers; a deletion only when its own seal opens. One that does not open
 * is set aside, never acted on.
 */
export async function openLinkCode(open: OpenLink, record: RemoteRecord): Promise<LinkRecord> {
  if (record.kind !== LINK_CODE_KIND || !record.box) throw new DecryptionError('Malformed link record.');
  const place = { accountId: open.accountId, link: open.link, id: record.id, rev: record.rev };
  const meta = { id: record.id, rev: record.rev, serverRev: record.serverRev, deleted: record.deleted, updatedAt: record.updatedAt };
  if (record.deleted) {
    await openLinkTombstone(open.key, record.box, place);
    return { ...meta, value: null };
  }
  const value = await openLinkRecord<LinkCode>(open.key, record.box, place);
  if (typeof value?.secret !== 'string' || typeof value.from !== 'string' || !Array.isArray(value.websites)) throw new DecryptionError('Malformed link record.');
  return { ...meta, value };
}

async function openEach(open: OpenLink, records: RemoteRecord[]): Promise<{ records: LinkRecord[]; unreadable: RemoteRecord[] }> {
  const opened: LinkRecord[] = [];
  const unreadable: RemoteRecord[] = [];
  for (const record of records) {
    try {
      opened.push(await openLinkCode(open, record));
    } catch {
      unreadable.push(record);
    }
  }
  return { records: opened, unreadable };
}

/** A page of the link's records since `since`, each opened. `restored`: the server's history is not the one `epoch` was. */
export async function pullLink(api: HttpSyncAdapter, open: OpenLink, input: { since: number; epoch?: string | null }) {
  const pulled = await api.linkPull(open.link, input.since);
  return {
    ...(await openEach(open, pulled.records)),
    serverRev: pulled.serverRev,
    hasMore: pulled.hasMore,
    epoch: pulled.epoch ?? '',
    restored: input.epoch != null && pulled.epoch !== input.epoch,
  };
}

/** Pushes what `sealLinkCode` made; a newer revision the server holds comes back opened, to merge. */
export async function pushLink(api: HttpSyncAdapter, open: OpenLink, records: RemoteRecord[], baseServerRev = 0) {
  const pushed = await api.linkPush(open.link, records, baseServerRev);
  const { records: conflicts, unreadable } = await openEach(open, pushed.conflicts);
  return { accepted: pushed.accepted, conflicts, unreadable, rejectedForLimit: (pushed.rejectedForLimit ?? []).map(({ id }) => id), serverRev: pushed.serverRev };
}

/** Turns the link off: its boxes and every record in it go. What each product keeps in its own vault stays. */
export async function unlinkProducts(api: HttpSyncAdapter, productKey: Pick<ProductKey, 'product'>, other: string): Promise<void> {
  await api.deleteLink(linkIdOf(productKey.product, other));
}
