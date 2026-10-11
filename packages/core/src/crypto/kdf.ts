import { toBase64, fromBase64, utf8 } from '../util/bytes.js';
import { randomBytes } from '../util/id.js';
import { PassholdError } from '../errors.js';

/**
 * Key derivation is versioned and self-describing so a vault encrypted today
 * still opens after a stronger KDF (Argon2id) arrives in a later release:
 * the file names the algorithm and its parameters, and the next unlock can
 * re-wrap the data key under the new one without touching a single item.
 */
export type KdfAlgorithm = 'PBKDF2-SHA256';

export interface KdfParams {
  algorithm: KdfAlgorithm;
  iterations: number;
  /** Base64. */
  salt: string;
}

/** OWASP's 2023 floor for PBKDF2-HMAC-SHA256. */
export const DEFAULT_PBKDF2_ITERATIONS = 600_000;
const MIN_PBKDF2_ITERATIONS = 100_000;
const MAX_PBKDF2_ITERATIONS = 10_000_000;

export function newKdfParams(iterations = DEFAULT_PBKDF2_ITERATIONS): KdfParams {
  return {
    algorithm: 'PBKDF2-SHA256',
    iterations,
    salt: toBase64(randomBytes(16)),
  };
}

/**
 * Derive the key-encryption key from the master password. The result is
 * non-extractable: it can wrap and unwrap the data key but can never be read
 * back out of the browser's crypto engine.
 */
export async function deriveKek(password: string, params: KdfParams): Promise<CryptoKey> {
  // Both come from the vault file, which is on disk and could have been
  // swapped: a count of one would make the password free to guess, and a
  // count of a billion would hang the browser before anything is checked.
  if (params.algorithm !== 'PBKDF2-SHA256') throw new PassholdError('kdfUnsupported');
  if (!Number.isSafeInteger(params.iterations) || params.iterations < MIN_PBKDF2_ITERATIONS || params.iterations > MAX_PBKDF2_ITERATIONS) {
    throw new PassholdError('kdfUnsupported');
  }

  const passwordKey = await crypto.subtle.importKey(
    'raw',
    utf8(password.normalize('NFKC')) as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: fromBase64(params.salt) as BufferSource,
      iterations: params.iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey', 'encrypt', 'decrypt'],
  );
}
