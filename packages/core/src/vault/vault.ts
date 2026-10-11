import {
  DecryptionError,
  exportDataKey,
  generateDataKey,
  importDataKey,
  openJson,
  sealJson,
  unwrapDataKey,
  wrapDataKey,
} from '../crypto/aead.js';
import { deriveKek, newKdfParams, type KdfParams } from '../crypto/kdf.js';
import { PassholdError } from '../errors.js';
import { utf8 } from '../util/bytes.js';
import { newId } from '../util/id.js';
import { sanitiseData } from './items.js';
import {
  DEFAULT_SETTINGS,
  VAULT_FILE_VERSION,
  VAULT_FORMAT,
  VAULT_SCHEMA_VERSION,
  type VaultData,
  type VaultFile,
} from './model.js';

export { exportDataKey, importDataKey };

export const MIN_MASTER_PASSWORD = 10;

/**
 * Associated data binds a ciphertext to the vault it belongs to, so a payload
 * lifted from one vault cannot be spliced into another.
 */
function aad(file: Pick<VaultFile, 'id' | 'version'>): Uint8Array {
  return utf8(`passhold.vault:v${file.version}:${file.id}`);
}

export interface UnlockedVault {
  file: VaultFile;
  data: VaultData;
  dataKey: CryptoKey;
}

export function emptyData(): VaultData {
  return {
    schemaVersion: VAULT_SCHEMA_VERSION,
    items: [],
    settings: structuredClone(DEFAULT_SETTINGS),
    neverSave: [],
    lastBackupAt: null,
  };
}

function checkMasterPassword(password: string): void {
  // Counted in code points, so a password in any script gets the same rule.
  if ([...password].length < MIN_MASTER_PASSWORD) throw new PassholdError('passwordTooShort');
}

/**
 * A new vault under a new master password. The data key is random; the
 * password only wraps it, so changing the password later re-wraps 32 bytes
 * rather than re-encrypting every login.
 */
export async function createVault(password: string, kdf: KdfParams = newKdfParams()): Promise<UnlockedVault> {
  checkMasterPassword(password);
  const kek = await deriveKek(password, kdf);
  const dataKey = await generateDataKey();
  const now = Date.now();
  const skeleton = { id: newId(), version: VAULT_FILE_VERSION };
  const data = emptyData();

  const file: VaultFile = {
    format: VAULT_FORMAT,
    version: skeleton.version,
    id: skeleton.id,
    kdf,
    wrappedKey: await wrapDataKey(kek, dataKey),
    payload: await sealJson(dataKey, data, aad(skeleton)),
    createdAt: now,
    updatedAt: now,
  };
  return { file, data, dataKey };
}

function checkVersion(file: VaultFile): void {
  // A vault written by a newer Passhold may hold fields this one would drop
  // on its next write. Refusing is the only way not to lose them.
  if (file.version > VAULT_FILE_VERSION) throw new PassholdError('vaultTooNew');
}

export async function unlockVault(file: VaultFile, password: string): Promise<UnlockedVault> {
  checkVersion(file);
  const kek = await deriveKek(password, file.kdf);
  let dataKey: CryptoKey;
  try {
    dataKey = await unwrapDataKey(kek, file.wrappedKey);
  } catch (error) {
    if (error instanceof DecryptionError) throw new PassholdError('wrongPassword');
    throw error;
  }
  return { file, dataKey, data: await readPayload(file, dataKey) };
}

/** Reopen with a key already held in memory: the service worker waking up. */
export async function readPayload(file: VaultFile, dataKey: CryptoKey): Promise<VaultData> {
  checkVersion(file);
  let raw: unknown;
  try {
    raw = await openJson<unknown>(dataKey, file.payload, aad(file));
  } catch (error) {
    // The key unwrapped, so the password was right: a payload that will not
    // open has been damaged or swapped, and saying "wrong password" would
    // send its owner hunting for a password that is not the problem.
    if (error instanceof DecryptionError) throw new PassholdError('vaultCorrupt');
    throw error;
  }
  return sanitiseData(raw);
}

/** Re-encrypt the payload. Returns a new file; the input is left untouched. */
export async function sealVault(file: VaultFile, dataKey: CryptoKey, data: VaultData): Promise<VaultFile> {
  return {
    ...file,
    payload: await sealJson(dataKey, data, aad(file)),
    updatedAt: Date.now(),
  };
}

export async function verifyMasterPassword(file: VaultFile, password: string): Promise<boolean> {
  try {
    await unwrapDataKey(await deriveKek(password, file.kdf), file.wrappedKey);
    return true;
  } catch (error) {
    if (error instanceof DecryptionError) return false;
    throw error;
  }
}

/**
 * A new master password. The current one is checked here rather than trusted
 * from the caller: anyone at an unlocked vault holds the data key, and the
 * password is what stands between them and changing who can open it.
 */
export async function changeMasterPassword(
  file: VaultFile,
  current: string,
  next: string,
): Promise<VaultFile> {
  checkMasterPassword(next);
  const dataKey = await unwrapDataKey(await deriveKek(current, file.kdf), file.wrappedKey).catch((error) => {
    if (error instanceof DecryptionError) throw new PassholdError('wrongPassword');
    throw error;
  });
  // A fresh salt, so the new wrapping shares nothing with the old one.
  const kdf = newKdfParams();
  return {
    ...file,
    kdf,
    wrappedKey: await wrapDataKey(await deriveKek(next, kdf), dataKey),
    updatedAt: Date.now(),
  };
}
