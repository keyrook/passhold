/**
 * Passhold's key in the account under a passkey, for a new computer to open
 * with a touch.
 *
 * An account made with Google or GitHub has no password, so a new browser
 * otherwise waits for one already in to let it in, or for the recovery key.
 * A passkey kept by Google Password Manager is on every Chrome its owner signs
 * in to, and its PRF answer is a secret only it can give: Passhold's key,
 * wrapped under that answer, is stored in the account as a record of
 * Passhold's own kind. Keyrook's server holds the wrap and cannot open it; a
 * new browser signed in with Google asks the passkey, and is in.
 *
 * The salt the passkey answers for is fixed and public: the passkey's own
 * secret is what makes the answer, and a fixed salt is what lets a computer
 * that has never seen this account ask for it.
 */
import { PassholdError } from '../errors.js';
import { fromBase64, toBase64, utf8 } from '../util/bytes.js';
import type { SealedBox } from '../crypto/aead.js';

export const PASSKEY_KIND = 'passhold.passkey';
const KEY_INFO = 'passhold:v1:account-passkey';
const PREFIX = 'passkey:';

/** What the account's passkey is asked to answer for, wherever it is asked. */
export async function accountPasskeySalt(): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', utf8(KEY_INFO) as BufferSource));
}

const base64url = (bytes: Uint8Array) => toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64url = (text: string) => fromBase64(text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4));

/** One record per passkey, named by its credential, so asking again replaces it. */
export function passkeyRecordId(credentialId: string): string {
  return PREFIX + base64url(fromBase64(credentialId));
}

/** The credential a record is for, to ask the authenticator for it; null for anything else. */
export function passkeyOfRecord(id: string): string | null {
  if (!id.startsWith(PREFIX)) return null;
  try {
    const raw = fromBase64url(id.slice(PREFIX.length));
    return raw.length > 0 ? toBase64(raw) : null;
  } catch {
    return null;
  }
}

async function wrappingKey(prf: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', prf as BufferSource, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0) as BufferSource, info: utf8(KEY_INFO) as BufferSource },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey'],
  );
}

/** Bound to its record: a wrap moved under another credential's name does not open. */
const params = (iv: Uint8Array, recordId: string): AesGcmParams => ({
  name: 'AES-GCM',
  iv: iv as BufferSource,
  tagLength: 128,
  additionalData: utf8(`passhold.passkey:v1:${recordId}`) as BufferSource,
});

export async function wrapForPasskey(productKey: CryptoKey, prf: Uint8Array, recordId: string): Promise<SealedBox> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrapped = await crypto.subtle.wrapKey('raw', productKey, await wrappingKey(prf), params(iv, recordId));
  return { iv: toBase64(iv), ct: toBase64(new Uint8Array(wrapped)) };
}

export async function openWithPasskey(box: SealedBox, prf: Uint8Array, recordId: string): Promise<CryptoKey> {
  try {
    return await crypto.subtle.unwrapKey(
      'raw',
      fromBase64(box.ct) as BufferSource,
      await wrappingKey(prf),
      params(fromBase64(box.iv), recordId),
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );
  } catch {
    throw new PassholdError('passkeyWrong');
  }
}
