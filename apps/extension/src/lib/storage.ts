import { isVaultFile, type VaultFile } from '@passhold/core';
import { fail } from '../i18n/errors.js';

/**
 * Where things are kept, and why:
 *
 * - `chrome.storage.local` is on disk. It holds the vault file — readable JSON
 *   whose only sensitive fields are AES-256-GCM — and two switches the content
 *   script needs while the vault is locked (`Prefs`), which say nothing about
 *   anyone's logins.
 * - `chrome.storage.session` is in memory only, wiped when the browser closes,
 *   and closed to content scripts (`TRUSTED_CONTEXTS`, set at start-up). It
 *   holds the unwrapped data key while unlocked, the lock policy, the open
 *   inline lists and the sign-ins waiting to be saved.
 */
const VAULT_KEY = 'ph.vault';
const PREFS_KEY = 'ph.prefs';
const SESSION_KEY = 'ph.sessionKey';
const LAST_ACTIVE_KEY = 'ph.lastActive';
const POLICY_KEY = 'ph.policy';

export async function loadVaultFile(): Promise<VaultFile | null> {
  const value = (await chrome.storage.local.get(VAULT_KEY))[VAULT_KEY];
  if (value === undefined) return null;
  if (!isVaultFile(value)) fail('error.vaultCorrupt');
  return value;
}

export async function saveVaultFile(file: VaultFile): Promise<void> {
  await chrome.storage.local.set({ [VAULT_KEY]: file });
}

export async function clearVaultFile(): Promise<void> {
  await chrome.storage.local.remove([VAULT_KEY, PREFS_KEY]);
}

/** The two switches the content script reads before the vault opens. */
export interface Prefs {
  inlineButton: boolean;
  offerToSave: boolean;
}

export async function loadPrefs(): Promise<Prefs> {
  const value = (await chrome.storage.local.get(PREFS_KEY))[PREFS_KEY] as Partial<Prefs> | undefined;
  return { inlineButton: value?.inlineButton !== false, offerToSave: value?.offerToSave !== false };
}

export async function savePrefs(prefs: Prefs): Promise<void> {
  await chrome.storage.local.set({ [PREFS_KEY]: prefs });
}

/** How the vault locks, kept beside the key so the alarm can decide while the worker is cold. */
export interface LockPolicy {
  autoLockMinutes: number;
  lockWithSystem: boolean;
  clearClipboardSeconds: number;
}

export async function saveSession(rawKey: string, policy: LockPolicy): Promise<void> {
  await chrome.storage.session.set({ [SESSION_KEY]: rawKey, [POLICY_KEY]: policy, [LAST_ACTIVE_KEY]: Date.now() });
}

export async function savePolicy(policy: LockPolicy): Promise<void> {
  await chrome.storage.session.set({ [POLICY_KEY]: policy });
}

export async function loadSession(): Promise<{ key: string | null; policy: LockPolicy | null; lastActive: number | null }> {
  const stored = await chrome.storage.session.get([SESSION_KEY, POLICY_KEY, LAST_ACTIVE_KEY]);
  return {
    key: (stored[SESSION_KEY] as string | undefined) ?? null,
    policy: (stored[POLICY_KEY] as LockPolicy | undefined) ?? null,
    lastActive: (stored[LAST_ACTIVE_KEY] as number | undefined) ?? null,
  };
}

export async function clearSession(): Promise<void> {
  await chrome.storage.session.remove([SESSION_KEY, POLICY_KEY, LAST_ACTIVE_KEY]);
}

export async function markActive(): Promise<void> {
  await chrome.storage.session.set({ [LAST_ACTIVE_KEY]: Date.now() });
}

/** A small keyed table in session storage: open inline lists, sign-ins waiting to be saved. */
export function sessionTable<T>(key: string) {
  const read = async (): Promise<Record<string, T>> =>
    ((await chrome.storage.session.get(key))[key] as Record<string, T> | undefined) ?? {};
  return {
    read,
    async get(id: string): Promise<T | null> {
      return (await read())[id] ?? null;
    },
    async put(id: string, value: T): Promise<void> {
      await chrome.storage.session.set({ [key]: { ...(await read()), [id]: value } });
    },
    async remove(id: string): Promise<void> {
      const table = await read();
      delete table[id];
      await chrome.storage.session.set({ [key]: table });
    },
    async write(table: Record<string, T>): Promise<void> {
      await chrome.storage.session.set({ [key]: table });
    },
  };
}
