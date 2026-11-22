import { isDeviceUnlock, isVaultFile, type DeviceUnlock, type EmergencyView, type LinkedCode, type PinEnvelope, type VaultFile } from '@passhold/core';
import { fail } from '../i18n/errors.js';
import { isFirefox } from './platform.js';

/**
 * Where things are kept, and why:
 *
 * - On disk (`disk()`): the vault file — readable JSON whose only sensitive
 *   fields are AES-256-GCM — the data key wrapped under the device's
 *   authenticator and under each security key (vault/device.ts), and the
 *   switches the content script needs while the vault is locked (`Prefs`),
 *   which say nothing about anyone's logins.
 * - `chrome.storage.session` is in memory only, wiped when the browser closes,
 *   and closed to content scripts (`TRUSTED_CONTEXTS`, set at start-up). It
 *   holds the unwrapped data key while unlocked, the data key wrapped under the
 *   PIN (kept across a lock, gone with the browser), the lock policy, the open
 *   inline lists and the sign-ins waiting to be saved.
 */

/** A place on disk for a few values by name. */
export interface Kept {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  remove(keys: string[]): Promise<void>;
}

/** Chrome's local storage, closed to content scripts at start-up (`TRUSTED_CONTEXTS`, background/index.ts). */
const chromeLocal: Kept = {
  get: async (key) => (await chrome.storage.local.get(key))[key],
  set: (key, value) => chrome.storage.local.set({ [key]: value }),
  remove: (keys) => chrome.storage.local.remove(keys),
};

const STORE = 'kept';

/**
 * The extension's own IndexedDB, for Firefox. Firefox's local storage cannot
 * be closed to content scripts (no `setAccessLevel`, bug 1724754): every
 * content script may read and write it, and so may a page that takes over its
 * renderer — the sealed vault to guess the master password against offline,
 * the vault to write over or remove. This database belongs to the extension's
 * origin, and a content script has the page's, so none reaches it. Firefox's
 * clearing of site data leaves an extension's databases alone, and
 * `unlimitedStorage` (scripts/firefox.mjs) keeps it from evicting this one
 * when the disk fills up.
 *
 * A write is done once its transaction is, and asks for the disk to have it
 * (`strict`): the vault is what it holds.
 */
export function keptInIndexedDB(factory: IDBFactory, name = 'passhold'): Kept {
  let opened: Promise<IDBDatabase> | null = null;
  const open = () =>
    (opened ??= new Promise<IDBDatabase>((resolve, reject) => {
      const request = factory.open(name, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => {
        const db = request.result;
        // Closed under it (a newer version opened elsewhere, the profile going): open again on the next call.
        db.onversionchange = () => {
          db.close();
          opened = null;
        };
        db.onclose = () => (opened = null);
        resolve(db);
      };
      request.onerror = () => {
        opened = null;
        reject(request.error);
      };
    }));
  const run = async <T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, mode, { durability: 'strict' });
      const request = work(transaction.objectStore(STORE));
      transaction.oncomplete = () => resolve(request ? request.result : undefined);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  };
  return {
    get: (key) => run('readonly', (store) => store.get(key)),
    set: async (key, value) => void (await run('readwrite', (store) => void store.put(value, key))),
    remove: async (keys) =>
      void (await run('readwrite', (store) => {
        for (const key of keys) store.delete(key);
      })),
  };
}

let kept: Kept | null = null;
/** Where the vault and the copies of its key are kept on disk: never anywhere a content script reads. */
const disk = () => (kept ??= isFirefox() ? keptInIndexedDB(indexedDB) : chromeLocal);
const VAULT_KEY = 'ph.vault';
const PREFS_KEY = 'ph.prefs';
const SESSION_KEY = 'ph.sessionKey';
const LAST_ACTIVE_KEY = 'ph.lastActive';
const POLICY_KEY = 'ph.policy';
const PIN_KEY = 'ph.pin';
const DEVICE_KEY = 'ph.device';
const KEYS_KEY = 'ph.keys';

export async function loadVaultFile(): Promise<VaultFile | null> {
  const value = await disk().get(VAULT_KEY);
  if (value === undefined) return null;
  if (!isVaultFile(value)) fail('error.vaultCorrupt');
  return value;
}

export async function saveVaultFile(file: VaultFile): Promise<void> {
  await disk().set(VAULT_KEY, file);
}

export async function clearVaultFile(): Promise<void> {
  await disk().remove([VAULT_KEY, PREFS_KEY, DEVICE_KEY, KEYS_KEY]);
}

/** The device's copy of the data key. It may stay across restarts: there is nothing in it to guess. */
export async function loadDevice(): Promise<DeviceUnlock | null> {
  const value = await disk().get(DEVICE_KEY);
  return isDeviceUnlock(value) ? value : null;
}

export async function saveDevice(unlock: DeviceUnlock): Promise<void> {
  await disk().set(DEVICE_KEY, unlock);
}

export async function clearDevice(): Promise<void> {
  await disk().remove([DEVICE_KEY]);
}

/** A security key's copy of the data key: kept as the device's is, and when it was added, to tell keys apart. */
export interface KeyUnlock extends DeviceUnlock {
  addedAt: number;
}

export async function loadKeys(): Promise<KeyUnlock[]> {
  const value = await disk().get(KEYS_KEY);
  if (!Array.isArray(value)) return [];
  return value.filter((each): each is KeyUnlock => isDeviceUnlock(each) && each.via === undefined && typeof (each as KeyUnlock).addedAt === 'number');
}

export async function saveKeys(keys: KeyUnlock[]): Promise<void> {
  if (keys.length === 0) await disk().remove([KEYS_KEY]);
  else await disk().set(KEYS_KEY, keys);
}

/** Every copy of the data key on disk, for a vault that is no longer the one here. */
export async function clearUnlocks(): Promise<void> {
  await disk().remove([DEVICE_KEY, KEYS_KEY]);
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
  const value = (await disk().get(PREFS_KEY)) as Partial<Prefs> | undefined;
  return {
    inlineButton: value?.inlineButton !== false,
    offerToSave: value?.offerToSave !== false,
    offerToSaveCards: value?.offerToSaveCards !== false,
    autoSuggest: value?.autoSuggest !== false,
    passkeys: value?.passkeys !== false,
  };
}

export async function savePrefs(prefs: Prefs): Promise<void> {
  await disk().set(PREFS_KEY, prefs);
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
  await chrome.storage.session.remove([SESSION_KEY, POLICY_KEY, LAST_ACTIVE_KEY, LINKED_KEY, EMERGENCY_KEY]);
}

const LINKED_KEY = 'ph.linked';

/**
 * The 2FA codes the link held at the last sync, secrets and all: in session
 * storage, beside the vault's key, closed to content scripts and gone with a
 * lock. Kept so that opening a login asks the server nothing: when someone
 * looks at a login is not Keyrook's to learn.
 */
export interface HeldCodes {
  accountId: string;
  status: 'open' | 'off' | 'premium';
  codes: LinkedCode[];
}

export async function loadLinked(): Promise<HeldCodes | null> {
  return ((await chrome.storage.session.get(LINKED_KEY))[LINKED_KEY] as HeldCodes | undefined) ?? null;
}

export async function saveLinked(held: HeldCodes): Promise<void> {
  await chrome.storage.session.set({ [LINKED_KEY]: held });
}

const EMERGENCY_KEY = 'ph.emergency';

/** Emergency access as the last sync saw it, for Settings to show without asking the server as it opens. */
export interface HeldEmergency {
  accountId: string;
  view: EmergencyView;
}

export async function loadEmergency(): Promise<HeldEmergency | null> {
  return ((await chrome.storage.session.get(EMERGENCY_KEY))[EMERGENCY_KEY] as HeldEmergency | undefined) ?? null;
}

export async function saveEmergency(held: HeldEmergency): Promise<void> {
  await chrome.storage.session.set({ [EMERGENCY_KEY]: held });
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
