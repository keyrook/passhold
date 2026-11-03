/**
 * Unlocking with a PIN, for the many times a day the vault locks while its
 * owner is at the same browser.
 *
 * A six-digit PIN has a million values: on disk, a copy of the file would
 * give it up in minutes. So the PIN never protects anything on disk. While
 * the browser stays open, the data key is kept wrapped by a key derived from
 * the PIN, in memory only, with a handful of tries; when the browser closes,
 * or the tries run out, that copy is gone and the master password is needed.
 *
 * The PIN itself is kept in the vault's sealed payload, so unlocking with the
 * master password can set the PIN up again without asking for it.
 */
import { DecryptionError, unwrapDataKey, wrapDataKey, type SealedBox } from '../crypto/aead.js';
import { deriveKek, newKdfParams, type KdfParams } from '../crypto/kdf.js';
import { PassholdError } from '../errors.js';

export const PIN_TRIES = 5;
const PIN_SHAPE = /^\d{6,12}$/;

export function isValidPin(pin: string): boolean {
  return PIN_SHAPE.test(pin);
}

/** The data key wrapped under the PIN, as kept in memory while the browser is open. */
export interface PinEnvelope {
  kdf: KdfParams;
  wrappedKey: SealedBox;
  triesLeft: number;
}

export async function sealWithPin(dataKey: CryptoKey, pin: string): Promise<PinEnvelope> {
  if (!isValidPin(pin)) throw new PassholdError('pinInvalid');
  const kdf = newKdfParams();
  return { kdf, wrappedKey: await wrapDataKey(await deriveKek(pin, kdf), dataKey), triesLeft: PIN_TRIES };
}

export async function openWithPin(envelope: PinEnvelope, pin: string): Promise<CryptoKey> {
  try {
    return await unwrapDataKey(await deriveKek(pin, envelope.kdf), envelope.wrappedKey);
  } catch (error) {
    if (error instanceof DecryptionError) throw new PassholdError('wrongPin');
    throw error;
  }
}
