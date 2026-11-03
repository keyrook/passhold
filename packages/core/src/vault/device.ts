/**
 * Unlocking with the device's own unlock: Touch ID, Windows Hello, a phone's
 * screen lock — whatever the platform authenticator is.
 *
 * The authenticator holds a secret that never leaves it. Asked with a salt
 * (WebAuthn's PRF extension) after the person proves themselves to it, it
 * answers with 32 bytes derived from that secret: the same bytes every time,
 * for this credential and this salt, and from no other authenticator. Those
 * bytes, stretched by HKDF and bound to the vault's id, wrap the data key.
 *
 * An authenticator without PRF — iCloud Keychain before macOS 15 — may keep
 * a few bytes with the passkey instead (the largeBlob extension), and hand
 * them back only to the person it answers to: 32 random bytes are kept
 * there, and serve the same way. Either way the bytes are nowhere on disk.
 *
 * Unlike the PIN's, this copy of the key may stay on disk across restarts:
 * there is nothing on disk to guess. Opening it takes the authenticator in
 * hand and the person it answers to — which, on most computers, is anyone
 * who can unlock the computer itself. The settings page says so.
 *
 * Nothing here calls WebAuthn: that is the page's job. This is only what the
 * bytes do once they exist.
 */
import { DecryptionError, unwrapDataKey, wrapDataKey, type SealedBox } from '../crypto/aead.js';
import { PassholdError } from '../errors.js';
import { utf8 } from '../util/bytes.js';

/** What an extension page needs to ask the authenticator again. Neither part is secret. */
export interface DeviceCredential {
  /** Base64. */
  credentialId: string;
  /** Base64, 32 bytes: what the authenticator's secret is applied to. */
  salt: string;
  /** The 32 bytes are kept in the passkey and read back (largeBlob), rather than worked out (PRF). */
  via?: 'largeBlob';
}

/** The data key wrapped under the authenticator's answer, as kept on this device's disk. */
export interface DeviceUnlock extends DeviceCredential {
  wrappedKey: SealedBox;
}

const PRF_LENGTH = 32;

async function keyFrom(prf: Uint8Array, vaultId: string): Promise<CryptoKey> {
  if (prf.length !== PRF_LENGTH) throw new PassholdError('deviceKeyWrong');
  const material = await crypto.subtle.importKey('raw', prf as BufferSource, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    // The vault's id in the derivation: the same authenticator's answer
    // cannot open a copy of the key made for another vault.
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32) as BufferSource, info: utf8(`passhold:v1:device:${vaultId}`) as BufferSource },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey'],
  );
}

export async function sealWithDevice(dataKey: CryptoKey, prf: Uint8Array, vaultId: string, credential: DeviceCredential): Promise<DeviceUnlock> {
  return { ...credential, wrappedKey: await wrapDataKey(await keyFrom(prf, vaultId), dataKey) };
}

export async function openWithDevice(unlock: DeviceUnlock, prf: Uint8Array, vaultId: string): Promise<CryptoKey> {
  try {
    return await unwrapDataKey(await keyFrom(prf, vaultId), unlock.wrappedKey);
  } catch (error) {
    if (error instanceof DecryptionError) throw new PassholdError('deviceKeyWrong');
    throw error;
  }
}

/** The shape check run on what storage hands back. */
export function isDeviceUnlock(value: unknown): value is DeviceUnlock {
  if (typeof value !== 'object' || value === null) return false;
  const unlock = value as Partial<DeviceUnlock>;
  return (
    typeof unlock.credentialId === 'string' &&
    typeof unlock.salt === 'string' &&
    (unlock.via === undefined || unlock.via === 'largeBlob') &&
    typeof unlock.wrappedKey === 'object' &&
    unlock.wrappedKey !== null &&
    typeof unlock.wrappedKey.iv === 'string' &&
    typeof unlock.wrappedKey.ct === 'string'
  );
}
