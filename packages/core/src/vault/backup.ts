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
import { HISTORY_LIMIT, isVaultFile, type LoginItem, type PasswordChange, type VaultData, type VaultFile } from './model.js';
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
function joinLogin(here: LoginItem, there: LoginItem): LoginItem {
  const [winner, loser] = there.updatedAt > here.updatedAt ? [there, here] : [here, there];
  return {
    ...winner,
    createdAt: Math.min(here.createdAt, there.createdAt),
    lastUsedAt: Math.max(here.lastUsedAt ?? 0, there.lastUsedAt ?? 0) || null,
    history: joinHistory(winner, loser),
  };
}

function sameLogin(a: LoginItem, b: LoginItem): boolean {
  return (
    a.title === b.title &&
    a.username === b.username &&
    a.password === b.password &&
    a.notes === b.notes &&
    a.urls.length === b.urls.length &&
    a.urls.every((url, index) => url === b.urls[index])
  );
}

export interface MergeResult {
  data: VaultData;
  /** Logins this vault did not have. */
  added: number;
  /** Logins the backup held a newer edit of. */
  updated: number;
}

/**
 * A backup's logins, brought into this vault. Nothing here is removed: a
 * login both have keeps the newer edit, and the password the other copy had
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
    const differs = !sameLogin(ours, theirs) || ours.deletedAt !== theirs.deletedAt || ours.favorite !== theirs.favorite;
    if (theirs.updatedAt > ours.updatedAt && differs) updated++;
    byId.set(ours.id, joinLogin(ours, theirs));
  }
  return {
    data: {
      ...here,
      items: [...byId.values()],
      neverSave: [...new Set([...here.neverSave, ...backup.neverSave])],
    },
    added,
    updated,
  };
}
