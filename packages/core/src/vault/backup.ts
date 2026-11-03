/**
 * Backups. A backup is the vault file itself, written out: already sealed by
 * the master password, so it is as safe in a downloads folder or a cloud drive
 * as it is on this disk, and it opens with the password it was made under.
 *
 * Restoring reads a file the owner chose — which may have been swapped,
 * damaged, or made by someone else — so it is input like any other: shape
 * checked, KDF bounded, payload sanitised, and only known fields kept.
 */
import { PassholdError, isPassholdError } from '../errors.js';
import { HISTORY_LIMIT, isVaultFile, type CustomField, type LoginItem, type PasswordChange, type VaultData, type VaultFile, type WalletItem } from './model.js';
import { unlockVault, type UnlockedVault } from './vault.js';

/** Far above any vault browser storage can hold; below what would stall a page. */
export const MAX_BACKUP_BYTES = 20 * 1024 * 1024;

export function backupText(file: VaultFile): string {
  return `${JSON.stringify(file, null, 2)}\n`;
}

/**
 * The file as a vault, before any password: for telling its owner at once
 * that they chose the wrong file. Only the fields a vault has are kept, so a
 * restored vault stores nothing the file brought along besides them.
 */
export function parseBackup(text: string): VaultFile {
  if (text.length > MAX_BACKUP_BYTES) throw new PassholdError('backupInvalid');
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new PassholdError('backupInvalid');
  }
  if (!isVaultFile(raw)) throw new PassholdError('backupInvalid');
  const stamp = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0);
  return {
    format: raw.format,
    version: raw.version,
    id: raw.id.slice(0, 64),
    kdf: { algorithm: raw.kdf.algorithm, iterations: raw.kdf.iterations, salt: raw.kdf.salt },
    ...(raw.secret === 'recoveryKey' ? { secret: 'recoveryKey' as const } : {}),
    wrappedKey: { iv: raw.wrappedKey.iv, ct: raw.wrappedKey.ct },
    payload: { iv: raw.payload.iv, ct: raw.payload.ct },
    createdAt: stamp(raw.createdAt),
    updatedAt: stamp(raw.updatedAt),
  };
}

/**
 * Open a backup with the password it was made under. Its own refusals say
 * "backup", not "vault": the vault on this device is fine, and "wrong master
 * password" would send its owner hunting for today's password when the file
 * wants the one it was made with.
 */
export async function openBackup(text: string, password: string): Promise<UnlockedVault> {
  const file = parseBackup(text);
  try {
    return await unlockVault(file, password);
  } catch (error) {
    if (isPassholdError(error) && error.code === 'wrongPassword') throw new PassholdError('backupWrongPassword');
    if (isPassholdError(error) && error.code === 'vaultCorrupt') throw new PassholdError('backupInvalid');
    throw error;
  }
}

/**
 * Keys in one order whatever order an item was built in, so the same item
 * always hashes the same — at every depth: a list of keys handed to
 * JSON.stringify would drop every key of a field not also a key of the item,
 * and a field's new value would never be seen, nor sent.
 */
export const canonical = (item: object) =>
  JSON.stringify(item, (_, value: unknown) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : value,
  );

/**
 * The newer copy's history, plus every password only the other copy knew —
 * its current one first. The newer history is kept exactly as it is, so
 * joining a login with itself changes nothing.
 */
function joinHistory(winner: LoginItem, loser: LoginItem): PasswordChange[] {
  const known = new Set([winner.password, ...winner.history.map((entry) => entry.password)]);
  const others: PasswordChange[] = [];
  for (const entry of [{ password: loser.password, changedAt: winner.updatedAt }, ...loser.history]) {
    if (!entry.password || known.has(entry.password)) continue;
    known.add(entry.password);
    others.push(entry);
  }
  if (!others.length) return winner.history;
  // Stable: a password replaced by the join sits ahead of one replaced at the same moment before it.
  return [...others, ...winner.history].sort((a, b) => b.changedAt - a.changedAt).slice(0, HISTORY_LIMIT);
}

/** One login as both copies know it: the newer edit, and the passwords either had. */
export function joinLogin(here: LoginItem, there: LoginItem): LoginItem {
  const [winner, loser] = there.updatedAt > here.updatedAt ? [there, here] : [here, there];
  return {
    ...winner,
    createdAt: Math.min(here.createdAt, there.createdAt),
    lastUsedAt: Math.max(here.lastUsedAt ?? 0, there.lastUsedAt ?? 0) || null,
    history: joinHistory(winner, loser),
    // A passkey is a key no site can hand back: one copy without it never takes it from the other.
    passkey: winner.passkey ?? loser.passkey,
  };
}

/** One card, address or note as both copies know it: the newer edit, wholly. */
export function joinWalletItem(here: WalletItem, there: WalletItem): WalletItem {
  const winner = there.updatedAt > here.updatedAt ? there : here;
  return {
    ...winner,
    createdAt: Math.min(here.createdAt, there.createdAt),
    lastUsedAt: Math.max(here.lastUsedAt ?? 0, there.lastUsedAt ?? 0) || null,
  };
}

/** The same thing written down twice: what it holds, whatever its id, its dates and its folder. */
function sameWalletItem(a: WalletItem, b: WalletItem): boolean {
  const content = ({ id: _, favorite: __, createdAt: ___, updatedAt: ____, lastUsedAt: _____, deletedAt: ______, folder: _______, ...rest }: WalletItem) => canonical(rest);
  return content(a) === content(b);
}

const sameFields = (a: readonly CustomField[], b: readonly CustomField[]) => canonical(a) === canonical(b);

function sameLogin(a: LoginItem, b: LoginItem): boolean {
  return (
    a.title === b.title &&
    a.username === b.username &&
    a.password === b.password &&
    a.notes === b.notes &&
    (a.passkey?.credentialId ?? null) === (b.passkey?.credentialId ?? null) &&
    a.urls.length === b.urls.length &&
    a.urls.every((url, index) => url === b.urls[index]) &&
    sameFields(a.fields, b.fields)
  );
}

/** Whether a copy says something else of an item than this one: what it holds, or where it is, or the star. */
const differs = <T extends LoginItem | WalletItem>(ours: T, theirs: T, same: (a: T, b: T) => boolean) =>
  !same(ours, theirs) || ours.deletedAt !== theirs.deletedAt || ours.favorite !== theirs.favorite || ours.folder !== theirs.folder;

export interface MergeResult {
  data: VaultData;
  /** Logins, cards, addresses and notes this vault did not have. */
  added: number;
  /** Those the backup held a newer edit of. */
  updated: number;
}

/**
 * A backup's logins, cards, addresses and notes, brought into this vault.
 * Nothing here is removed: a login both have keeps the newer edit, and the password the other copy had
 * goes into its history. Settings stay this vault's own. Restoring the same
 * backup twice changes nothing the second time.
 */
export function mergeBackup(here: VaultData, backup: VaultData): MergeResult {
  const byId = new Map(here.items.map((item) => [item.id, item]));
  let added = 0;
  let updated = 0;
  for (const theirs of backup.items) {
    const ours = byId.get(theirs.id);
    if (!ours) {
      // Another vault's copy of a login already here — both made from the
      // same CSV, say — is the same login, not a second one.
      if (here.items.some((item) => item.deletedAt === null && theirs.deletedAt === null && sameLogin(item, theirs))) continue;
      byId.set(theirs.id, theirs);
      added++;
      continue;
    }
    if (theirs.updatedAt > ours.updatedAt && differs(ours, theirs, sameLogin)) updated++;
    byId.set(ours.id, joinLogin(ours, theirs));
  }
  const wallet = new Map(here.wallet.map((item) => [item.id, item]));
  for (const theirs of backup.wallet) {
    const ours = wallet.get(theirs.id);
    if (!ours) {
      if (byId.has(theirs.id)) continue;
      if (here.wallet.some((item) => item.deletedAt === null && theirs.deletedAt === null && sameWalletItem(item, theirs))) continue;
      wallet.set(theirs.id, theirs);
      added++;
      continue;
    }
    if (theirs.updatedAt > ours.updatedAt && differs(ours, theirs, sameWalletItem)) updated++;
    wallet.set(ours.id, joinWalletItem(ours, theirs));
  }
  return {
    data: {
      ...here,
      items: [...byId.values()],
      wallet: [...wallet.values()],
      neverSave: [...new Set([...here.neverSave, ...backup.neverSave])],
    },
    added,
    updated,
  };
}
