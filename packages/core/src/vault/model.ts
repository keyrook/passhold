import type { SealedBox } from '../crypto/aead.js';
import type { KdfParams } from '../crypto/kdf.js';
import type { GeneratorOptions } from '../generator.js';
import { DEFAULT_GENERATOR } from '../generator.js';

export const VAULT_FORMAT = 'passhold.vault';
export const VAULT_FILE_VERSION = 1;
export const VAULT_SCHEMA_VERSION = 1;

/** How many earlier passwords a login keeps, so a mistaken update can be undone. */
export const HISTORY_LIMIT = 5;

/**
 * Bounds on what one login may hold. They keep a pasted novel or a hostile
 * import from making every seal of the vault slow; nothing a person types
 * comes near them.
 */
export const LIMITS = {
  title: 200,
  username: 1_000,
  password: 10_000,
  notes: 100_000,
  url: 2_048,
  urls: 20,
} as const;

export interface PasswordChange {
  password: string;
  changedAt: number;
}

/** One saved sign-in. */
export interface LoginItem {
  id: string;
  title: string;
  username: string;
  password: string;
  /** Where it is used, as saved: full URLs, matched by site (see match.ts). */
  urls: string[];
  notes: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  passwordChangedAt: number;
  lastUsedAt: number | null;
  /** In the trash since then; null while live. Only the owner empties the trash. */
  deletedAt: number | null;
  /** Earlier passwords, newest first. */
  history: PasswordChange[];
}

/** The fields a person edits; everything else the vault keeps itself. */
export type LoginDraft = Pick<LoginItem, 'title' | 'username' | 'password' | 'urls' | 'notes'> & {
  favorite?: boolean;
};

export interface VaultSettings {
  /** Lock after this many minutes without use. 0: only when the browser closes. */
  autoLockMinutes: number;
  /** Lock when the computer locks or sleeps. */
  lockWithSystem: boolean;
  /** Clear a copied password from the clipboard after this many seconds. 0: never. */
  clearClipboardSeconds: number;
  /** Show the Passhold button in sign-in fields. */
  inlineButton: boolean;
  /** Offer to save a sign-in after a form is sent. */
  offerToSave: boolean;
  generator: GeneratorOptions;
}

export const DEFAULT_SETTINGS: VaultSettings = {
  autoLockMinutes: 15,
  lockWithSystem: true,
  clearClipboardSeconds: 30,
  inlineButton: true,
  offerToSave: true,
  generator: DEFAULT_GENERATOR,
};

export const AUTO_LOCK_CHOICES = [1, 5, 15, 30, 60, 240, 0] as const;
export const CLIPBOARD_CHOICES = [15, 30, 60, 120, 0] as const;

/** What the payload holds once opened. Never written anywhere unsealed. */
export interface VaultData {
  schemaVersion: number;
  items: LoginItem[];
  settings: VaultSettings;
  /** Sites (registrable domains) the owner said never to offer saving on. */
  neverSave: string[];
  /** When the last backup was made from this vault, so its owner can see one is due. */
  lastBackupAt: number | null;
}

/**
 * The vault as stored: plaintext JSON whose only sensitive fields are
 * `wrappedKey` and `payload`, both AES-256-GCM.
 */
export interface VaultFile {
  format: typeof VAULT_FORMAT;
  version: number;
  id: string;
  kdf: KdfParams;
  /** The data key, wrapped by the key derived from the master password. */
  wrappedKey: SealedBox;
  payload: SealedBox;
  createdAt: number;
  updatedAt: number;
}

function isBox(value: unknown): value is SealedBox {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as SealedBox).iv === 'string' &&
    typeof (value as SealedBox).ct === 'string'
  );
}

/** The shape check run on whatever storage hands back, before anything trusts it. */
export function isVaultFile(value: unknown): value is VaultFile {
  if (typeof value !== 'object' || value === null) return false;
  const file = value as Partial<VaultFile>;
  return (
    file.format === VAULT_FORMAT &&
    typeof file.version === 'number' &&
    typeof file.id === 'string' &&
    typeof file.kdf === 'object' &&
    file.kdf !== null &&
    typeof file.kdf.algorithm === 'string' &&
    typeof file.kdf.iterations === 'number' &&
    typeof file.kdf.salt === 'string' &&
    isBox(file.wrappedKey) &&
    isBox(file.payload)
  );
}
