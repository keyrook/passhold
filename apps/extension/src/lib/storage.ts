import { isDeviceUnlock, isVaultFile, type DeviceUnlock, type PinEnvelope, type VaultFile } from '@passhold/core';
import { fail } from '../i18n/errors.js';

/**
 * Where things are kept, and why:
 *
 * - `chrome.storage.local` is on disk. It holds the vault file — readable JSON
 *   whose only sensitive fields are AES-256-GCM — the data key wrapped under
 *   the device's authenticator and under each security key (vault/device.ts),
 *   and the switches the content script needs while the vault is locked
 *   (`Prefs`), which say nothing about anyone's logins.
 * - `chrome.storage.session` is in memory only, wiped when the browser closes,
 *   and closed to content scripts (`TRUSTED_CONTEXTS`, set at start-up). It
 *   holds the unwrapped data key while unlocked, the data key wrapped under the
 *   PIN (kept across a lock, gone with the browser), the lock policy, the open
 *   inline lists and the sign-ins waiting to be saved.
 */
const VAULT_KEY = 'ph.vault';
const PREFS_KEY = 'ph.prefs';
const SESSION_KEY = 'ph.sessionKey';
const LAST_ACTIVE_KEY = 'ph.lastActive';
const POLICY_KEY = 'ph.policy';
const PIN_KEY = 'ph.pin';
const DEVICE_KEY = 'ph.device';
const KEYS_KEY = 'ph.keys';

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
  await chrome.storage.local.remove([VAULT_KEY, PREFS_KEY, DEVICE_KEY, KEYS_KEY]);
}

/** The device's copy of the data key. It may stay across restarts: there is nothing in it to guess. */
export async function loadDevice(): Promise<DeviceUnlock | null> {
  const value = (await chrome.storage.local.get(DEVICE_KEY))[DEVICE_KEY];
  return isDeviceUnlock(value) ? value : null;
}

export async function saveDevice(unlock: DeviceUnlock): Promise<void> {
  await chrome.storage.local.set({ [DEVICE_KEY]: unlock });
}

export async function clearDevice(): Promise<void> {
  await chrome.storage.local.remove(DEVICE_KEY);
}

/** A security key's copy of the data key: kept as the device's is, and when it was added, to tell keys apart. */
export interface KeyUnlock extends DeviceUnlock {
  addedAt: number;
}

export async function loadKeys(): Promise<KeyUnlock[]> {
  const value = (await chrome.storage.local.get(KEYS_KEY))[KEYS_KEY];
  if (!Array.isArray(value)) return [];
  return value.filter((each): each is KeyUnlock => isDeviceUnlock(each) && each.via === undefined && typeof (each as KeyUnlock).addedAt === 'number');
}

export async function saveKeys(keys: KeyUnlock[]): Promise<void> {
  if (keys.length === 0) await chrome.storage.local.remove(KEYS_KEY);
  else await chrome.storage.local.set({ [KEYS_KEY]: keys });
}

/** Every copy of the data key on disk, for a vault that is no longer the one here. */
export async function clearUnlocks(): Promise<void> {
  await chrome.storage.local.remove([DEVICE_KEY, KEYS_KEY]);
}

/** The switches the content script reads before the vault opens. */
export interface Prefs {
  inlineButton: boolean;
  offerToSave: boolean;
  offerToSaveCards: boolean;
  autoSuggest: boolean;
  /** Answer websites' passkey requests: read before the vault opens, so a locked Passhold still offers to unlock. */
  passkeys: boolean;
}

export async function loadPrefs(): Promise<Prefs> {
  const value = (await chrome.storage.local.get(PREFS_KEY))[PREFS_KEY] as Partial<Prefs> | undefined;
  return {
    inlineButton: value?.inlineButton !== false,
    offerToSave: value?.offerToSave !== false,
    offerToSaveCards: value?.offerToSaveCards !== false,
    autoSuggest: value?.autoSuggest !== false,
    passkeys: value?.passkeys !== false,
  };
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

/** The PIN's copy of the data key. A lock leaves it; closing the browser, or the tries running out, does not. */
export async function loadPin(): Promise<PinEnvelope | null> {
  return ((await chrome.storage.session.get(PIN_KEY))[PIN_KEY] as PinEnvelope | undefined) ?? null;
}

export async function savePin(envelope: PinEnvelope): Promise<void> {
  await chrome.storage.session.set({ [PIN_KEY]: envelope });
}

export async function clearPin(): Promise<void> {
  await chrome.storage.session.remove(PIN_KEY);
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
