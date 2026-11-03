/**
 * Folders and fields of an owner's own, the same for a login, a card, an
 * address and a note.
 *
 * A folder is a name on each item, not a thing of its own: it is there while
 * something is filed in it, it travels inside each item's sealed record — the
 * server learns no folder's name, nor that there are any — and two devices
 * cannot fall out over a folder one of them deleted while the other filled it.
 */
import { LIMITS, type CustomField, type Items, type LoginItem, type VaultData, type WalletItem } from './model.js';

/**
 * One line a page may show as text: no newline, no control or format
 * character — a direction override would turn what follows it around — but
 * the joiners some scripts write words with.
 */
function oneLine(value: unknown, limit: number): string {
  if (typeof value !== 'string') return '';
  return value
    .slice(0, limit * 4)
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .replace(/(?![‌‍])[\p{Cc}\p{Cf}]/gu, '')
    .trim()
    .slice(0, limit);
}

/** A shared vault's name, as its key opened it: one line, as a folder's. */
export function cleanVaultName(value: unknown): string {
  return oneLine(value, LIMITS.vaultName);
}

/** A folder's name as the vault keeps it; '' for none. */
export function cleanFolder(value: unknown): string {
  return oneLine(value, LIMITS.folder);
}

/** An item's fields as stored, sent or typed: each checked, one with neither a name nor a value dropped. */
export function cleanFields(value: unknown): CustomField[] {
  if (!Array.isArray(value)) return [];
  const fields: CustomField[] = [];
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) continue;
    const raw = entry as Record<string, unknown>;
    const name = oneLine(raw.name, LIMITS.fieldName);
    // A value is kept as typed, lines and spaces and all: it may be a key, or an answer spelled just so.
    const text = typeof raw.value === 'string' ? raw.value.slice(0, LIMITS.fieldValue) : '';
    if (!name && !text) continue;
    fields.push({ name, value: text, hidden: raw.hidden === true });
    if (fields.length >= LIMITS.fields) break;
  }
  return fields;
}

/** What a search may find in an item's fields: their names, and the values not kept out of sight. */
export function fieldWords(fields: readonly CustomField[]): string[] {
  return fields.flatMap((field) => (field.hidden ? [field.name] : [field.name, field.value]));
}

const same = (name: string) => name.toLowerCase();


/**
 * A folder as the vault already spells it — "work" files into "Work", never
 * beside it — or as given, for a new one. `except`: the item being edited,
 * whose own folder is no other item's spelling to keep.
 */
export function settleFolder(data: Items, name: string, except: string | null = null): string {
  const clean = cleanFolder(name);
  if (!clean) return '';
  for (const item of [...data.items, ...data.wallet]) {
    if (item.id !== except && item.folder && same(item.folder) === same(clean)) return item.folder;
  }
  return clean;
}

/** Every folder something live is filed in, and how many live items each holds. */
export function folderCounts(data: Items): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of [...data.items, ...data.wallet]) {
    if (item.deletedAt === null && item.folder) counts.set(item.folder, (counts.get(item.folder) ?? 0) + 1);
  }
  return counts;
}

/**
 * A folder renamed — or, to '', taken away: what was in it stays, filed
 * nowhere. Renamed to a folder already there, the two become one. Each item
 * moved counts as changed, so the move reaches every device; the trash's
 * items move too, so one restored lands where its folder went.
 */
export function renameFolder(data: VaultData, from: string, to: string, now = Date.now()): VaultData {
  if (!from) return data;
  const rest = { items: data.items.filter((item) => item.folder !== from), wallet: data.wallet.filter((item) => item.folder !== from) };
  const target = settleFolder(rest, to);
  if (target === from) return data;
  const move = <T extends LoginItem | WalletItem>(item: T): T => (item.folder === from ? { ...item, folder: target, updatedAt: now } : item);
  return { ...data, items: data.items.map(move), wallet: data.wallet.map(move) };
}
