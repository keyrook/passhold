/**
 * Files kept with an item: a login, a card, an address, a note or an SSH key.
 *
 * The bytes are the Keyrook account's to keep, sealed before they leave
 * (account/files.ts); what an item holds is the line that names one — its id
 * in the account, the key that opens it, its name — inside the item's own
 * sealed record. So a file travels as its item does: sync, a shared vault,
 * the trash, a backup.
 *
 * Two devices may add or take off files at once. A file's key is the only
 * way to it, so a copy that lacks one never takes it from another; and a file
 * taken off is named in the item (`detached`), so a copy from before does not
 * bring it back.
 */
import { PassholdError } from '../errors.js';
import { fromBase64 } from '../util/bytes.js';
import { oneLine } from './folders.js';
import { LIMITS, type Attachment, type Items, type LoginItem, type VaultData, type WalletItem } from './model.js';

/** As the account names a file: no colon, so its seal's label reads one way (@keyrook/account, keys/file.ts). */
const FILE_ID = /^[A-Za-z0-9_-]{1,64}$/;
/** A media type as a browser names one; anything else is no type at all. */
const MEDIA_TYPE = /^[a-z0-9][a-z0-9!#$&^_.+-]{0,63}\/[a-z0-9][a-z0-9!#$&^_.+-]{0,63}$/;
/** Files taken off an item are remembered this long a list, newest last: a copy older than that many removals is older than anyone keeps. */
const DETACHED_KEPT = 200;

const time = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null);

function fileKey(value: unknown): string | null {
  if (typeof value !== 'string' || value.length !== 44) return null;
  try {
    return fromBase64(value).length === 32 ? value : null;
  } catch {
    return null;
  }
}

/** One line naming a file, as stored or synced; null rather than half of one. */
export function cleanAttachment(value: unknown): Attachment | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  const key = fileKey(raw.key);
  if (typeof raw.id !== 'string' || !FILE_ID.test(raw.id) || !key) return null;
  const size = Number.isSafeInteger(raw.size) && (raw.size as number) >= 0 ? (raw.size as number) : null;
  if (size === null) return null;
  const type = typeof raw.type === 'string' ? raw.type.trim().toLowerCase() : '';
  return {
    id: raw.id,
    key,
    // A file's name is shown as text, in a list: one line, and no direction override.
    name: oneLine(raw.name, LIMITS.fileName),
    type: MEDIA_TYPE.test(type) ? type : '',
    size,
    addedAt: time(raw.addedAt) ?? 0,
  };
}

const ids = (value: unknown): string[] => (Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string' && FILE_ID.test(entry)) : []);

/** File ids as stored, each once: what is still to be deleted in the account. */
export const readFileIds = (value: unknown): string[] => [...new Set(ids(value))].slice(-1_000);

/**
 * An item's files as stored or synced, for spreading into it: nothing at all
 * for an item with none, so one from before files reads, hashes and syncs as
 * it did.
 */
export function readAttachments(raw: { attachments?: unknown; detached?: unknown }): { attachments?: Attachment[]; detached?: string[] } {
  const detached = [...new Set(ids(raw.detached))].slice(-DETACHED_KEPT);
  const gone = new Set(detached);
  const seen = new Set<string>();
  const attachments: Attachment[] = [];
  for (const entry of Array.isArray(raw.attachments) ? raw.attachments : []) {
    const file = cleanAttachment(entry);
    if (!file || seen.has(file.id) || gone.has(file.id)) continue;
    seen.add(file.id);
    attachments.push(file);
    if (attachments.length >= LIMITS.attachments) break;
  }
  return { ...(attachments.length ? { attachments } : {}), ...(detached.length ? { detached } : {}) };
}

type WithFiles = LoginItem | WalletItem;

export const attachmentsOf = (item: Pick<WithFiles, 'attachments'>): Attachment[] => item.attachments ?? [];

/** The item with these files and these taken off, and neither key where there are none. */
function withFiles<T extends WithFiles>(item: T, attachments: Attachment[], detached: string[]): T {
  const { attachments: _, detached: __, ...rest } = item;
  return { ...rest, ...readAttachments({ attachments, detached }) } as T;
}

function inItems<T extends Items>(data: T, id: string, change: <I extends WithFiles>(item: I) => I): T {
  if (data.items.some((item) => item.id === id)) return { ...data, items: data.items.map((item) => (item.id === id ? change(item) : item)) };
  if (data.wallet.some((item) => item.id === id)) return { ...data, wallet: data.wallet.map((item) => (item.id === id ? change(item) : item)) };
  throw new PassholdError('itemNotFound');
}

/** A file added to a live item. One in the trash takes none: it is restored first. */
export function attachFile<T extends Items>(data: T, itemId: string, file: Attachment, now = Date.now()): T {
  const clean = cleanAttachment(file);
  if (!clean) throw new PassholdError('itemInvalid');
  return inItems(data, itemId, (item) => {
    if (item.deletedAt !== null) throw new PassholdError('itemInvalid');
    const files = attachmentsOf(item);
    if (files.some((entry) => entry.id === clean.id)) return item;
    if (files.length >= LIMITS.attachments) throw new PassholdError('attachmentsFull');
    return { ...withFiles(item, [...files, clean], (item.detached ?? []).filter((id) => id !== clean.id)), updatedAt: now };
  });
}

/** A file taken off its item, and remembered as taken off: what deletes it in the account is the caller's (account/files.ts). */
export function detachFile<T extends Items>(data: T, itemId: string, fileId: string, now = Date.now()): T {
  return inItems(data, itemId, (item) => {
    if (!attachmentsOf(item).some((entry) => entry.id === fileId)) return item;
    return { ...withFiles(item, attachmentsOf(item).filter((entry) => entry.id !== fileId), [...(item.detached ?? []), fileId]), updatedAt: now };
  });
}

/** Both copies' files, but for any either took off: a key one copy lacks is never lost, and a file taken off stays off. */
export function joinAttachments(a: Pick<WithFiles, 'attachments' | 'detached'>, b: Pick<WithFiles, 'attachments' | 'detached'>): Pick<WithFiles, 'attachments' | 'detached'> {
  const detached = [...new Set([...(a.detached ?? []), ...(b.detached ?? [])])];
  const byId = new Map<string, Attachment>();
  for (const file of [...attachmentsOf(a), ...attachmentsOf(b)]) if (!byId.has(file.id)) byId.set(file.id, file);
  const attachments = [...byId.values()].sort((x, y) => x.addedAt - y.addedAt);
  return readAttachments({ attachments, detached });
}

/** `item` with the files both copies hold, as `joinAttachments` settles them. */
export function withJoinedFiles<T extends WithFiles>(item: T, here: WithFiles, there: WithFiles): T {
  const joined = joinAttachments(here, there);
  return withFiles(item, joined.attachments ?? [], joined.detached ?? []);
}

/** The ids of every file an item in the vault names: its own, each shared vault's, live or in a trash. */
export function filesIn(data: Pick<VaultData, 'items' | 'wallet' | 'families'>): Set<string> {
  const every = [data, ...data.families.flatMap((family) => family.vaults)].flatMap((items) => [...items.items, ...items.wallet]);
  return new Set(every.flatMap((item) => attachmentsOf(item).map((file) => file.id)));
}

/** Files no item names any more after a change — a trash emptied, an item deleted for good, a file taken off: theirs to delete in the account. */
export function filesGone(before: Pick<VaultData, 'items' | 'wallet' | 'families'>, after: Pick<VaultData, 'items' | 'wallet' | 'families'>): string[] {
  const kept = filesIn(after);
  return [...filesIn(before)].filter((id) => !kept.has(id));
}

/**
 * The vault after a change, with the files no item names any more since
 * `before` added to those still to delete in the account: they go at the next
 * sync, once the record that no longer names them has gone up, and wait until
 * the account says they are gone.
 */
export function forgetFiles(before: VaultData, after: VaultData): VaultData {
  const gone = filesGone(before, after);
  if (!gone.length || !after.account) return after;
  return { ...after, account: { ...after.account, filesToDelete: readFileIds([...(after.account.filesToDelete ?? []), ...gone]) } };
}

/** The vault once the account has deleted these files, or never had them. */
export function filesDeleted(data: VaultData, ids: readonly string[]): VaultData {
  if (!data.account?.filesToDelete || !ids.length) return data;
  const left = data.account.filesToDelete.filter((id) => !ids.includes(id));
  const { filesToDelete: _, ...account } = data.account;
  return { ...data, account: left.length ? { ...account, filesToDelete: left } : account };
}

/** An item as a page sees it: its files named, none of their keys. */
export function withoutFileKeys<T extends WithFiles>(item: T): T {
  return item.attachments ? { ...item, attachments: item.attachments.map((file) => ({ ...file, key: '' })) } : item;
}

/** A file an item names, wherever the item is, with the item: null for none. */
export function findAttachment(items: Items, itemId: string, fileId: string): { item: WithFiles; file: Attachment } | null {
  const item = [...items.items, ...items.wallet].find((entry) => entry.id === itemId);
  const file = item && attachmentsOf(item).find((entry) => entry.id === fileId);
  return item && file ? { item, file } : null;
}
