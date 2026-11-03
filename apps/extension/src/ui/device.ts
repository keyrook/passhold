/**
 * Asking the device's authenticator — Touch ID, Windows Hello, a screen lock —
 * for the 32 bytes that unlock Passhold (WebAuthn's PRF extension, or where
 * there is none the bytes kept in the passkey itself — largeBlob; see
 * packages/core/src/vault/device.ts for what they do). A USB security key is
 * asked the same way, PRF alone (`enrollKey`, `askKey`).
 *
 * Only an extension page can ask: WebAuthn needs a document, and the
 * credential belongs to Passhold's own origin, so no web page can ask it for
 * anything. The answer goes straight to the service worker.
 *
 * Nothing here is checked by a server, so the challenge is only random bytes:
 * what proves the person is the answer itself, which no other authenticator
 * can give.
 */
import { fromBase64, randomBytes, toBase64, type DeviceCredential } from '@passhold/core';
import type { MessageKey } from '../i18n/locales/en.js';
import { BackgroundError, type SecurityKey } from '../lib/messaging.js';
import { APP_NAME, deviceUnsupported } from '../lib/name.js';

export type DeviceKind = 'mac' | 'windows' | 'other';

/** The unlock's name in a sentence: "Unlock with Touch ID". */
export const DEVICE_METHOD: Record<DeviceKind, MessageKey> = {
  mac: 'device.method.mac',
  windows: 'device.method.windows',
  other: 'device.method.other',
};

/** What the person knows the unlock as: named by the system it runs on. */
export function deviceKind(): DeviceKind {
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform;
  if (/mac/i.test(platform)) return 'mac';
  if (/win/i.test(platform)) return 'windows';
  return 'other';
}

export async function deviceAvailable(): Promise<boolean> {
  if (typeof PublicKeyCredential === 'undefined') return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

interface PrfOutputs {
  prf?: { enabled?: boolean; results?: { first?: ArrayBuffer; second?: ArrayBuffer } };
  largeBlob?: { supported?: boolean; blob?: ArrayBuffer; written?: boolean };
}

/** The passkey's own bytes, read or written: one touch either way. */
async function largeBlob(credential: DeviceCredential, write?: Uint8Array): Promise<PrfOutputs['largeBlob']> {
  const result = (await navigator.credentials.get({
    publicKey: {
      challenge: randomBytes(32) as BufferSource,
      allowCredentials: [{ type: 'public-key', id: fromBase64(credential.credentialId) as BufferSource }],
      userVerification: 'required',
      timeout: 60_000,
      extensions: { largeBlob: write ? { write: write as BufferSource } : { read: true } } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null;
  return (result?.getClientExtensionResults() as PrfOutputs | undefined)?.largeBlob;
}

const answerOf = (buffer: ArrayBuffer | undefined) => (buffer ? toBase64(new Uint8Array(buffer)) : null);

const toBase64Url = (bytes: Uint8Array) => toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** A refusal from the authenticator, as a message the page can say. */
function refusal(error: unknown): never {
  if (error instanceof BackgroundError) throw error;
  // Cancelled, timed out, or the person did not prove themselves: all one to the person.
  if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
    throw new BackgroundError(error.name, 'error.deviceCancelled');
  }
  throw new BackgroundError(String(error), deviceUnsupported());
}

/** Ask for the answer, once the person proves themselves to the authenticator. */
export async function askDevice(credential: DeviceCredential): Promise<string> {
  try {
    if (credential.via === 'largeBlob') {
      const blob = (await largeBlob(credential))?.blob;
      if (!blob || blob.byteLength !== 32) throw new BackgroundError('no blob', deviceUnsupported());
      return toBase64(new Uint8Array(blob));
    }
    const result = (await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32) as BufferSource,
        allowCredentials: [{ type: 'public-key', id: fromBase64(credential.credentialId) as BufferSource }],
        userVerification: 'required',
        timeout: 60_000,
        extensions: { prf: { eval: { first: fromBase64(credential.salt) as BufferSource } } } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential | null;
    const first = (result?.getClientExtensionResults() as PrfOutputs | undefined)?.prf?.results?.first;
    if (!first) throw new BackgroundError('no prf', deviceUnsupported());
    return toBase64(new Uint8Array(first));
  } catch (error) {
    refusal(error);
  }
}

/**
 * Ask any of these passkeys — the account's, kept by Google Password Manager
 * on every Chrome its owner signs in to — for one or two answers at once: so
 * a new computer is let into the account, and set to unlock with the same
 * passkey, with one touch.
 */
export async function askPasskey(
  credentialIds: readonly string[],
  first: Uint8Array,
  second?: Uint8Array,
): Promise<{ credentialId: string; first: string; second: string | null }> {
  try {
    const result = (await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32) as BufferSource,
        allowCredentials: credentialIds.map((id) => ({ type: 'public-key' as const, id: fromBase64(id) as BufferSource })),
        userVerification: 'required',
        timeout: 60_000,
        extensions: { prf: { eval: { first: first as BufferSource, ...(second ? { second: second as BufferSource } : {}) } } } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential | null;
    if (!result) throw new BackgroundError('none', 'error.deviceCancelled');
    const results = (result.getClientExtensionResults() as PrfOutputs | undefined)?.prf?.results;
    const answer = answerOf(results?.first);
    if (!answer) throw new BackgroundError('no prf', deviceUnsupported());
    return { credentialId: toBase64(new Uint8Array(result.rawId)), first: answer, second: second ? answerOf(results?.second) : null };
  } catch (error) {
    refusal(error);
  }
}

/** Tell the authenticator to drop a credential Passhold will not use. Best effort: older browsers cannot. */
export function forgetCredential(credential: DeviceCredential): void {
  const signal = (PublicKeyCredential as unknown as { signalUnknownCredential?: (options: { rpId: string; credentialId: string }) => Promise<void> })
    .signalUnknownCredential;
  void signal?.call(PublicKeyCredential, { rpId: location.host, credentialId: toBase64Url(fromBase64(credential.credentialId)) }).catch(() => undefined);
}

/**
 * Make a credential for this vault on this device, and its first answer. An
 * authenticator that answers at creation is asked once; the rest twice.
 *
 * `account`: the same passkey also answers for the account (its salt is
 * `accountPasskeySalt`), named by the account's email so its owner knows it
 * in Google Password Manager — where it is on every Chrome they sign in to,
 * and opens the account on a new computer.
 */
export async function enrollDevice(account?: {
  email: string;
  salt: Uint8Array;
}): Promise<{ credential: DeviceCredential; prf: string; accountPrf: string | null }> {
  const salt = randomBytes(32);
  let created: PublicKeyCredential | null;
  try {
    created = (await navigator.credentials.create({
      publicKey: {
        rp: { name: APP_NAME },
        user: account
          ? { id: randomBytes(16) as BufferSource, name: account.email, displayName: `${APP_NAME} · ${account.email}` }
          : { id: randomBytes(16) as BufferSource, name: APP_NAME, displayName: APP_NAME },
        challenge: randomBytes(32) as BufferSource,
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        // This device's own unlock, not a phone or a key on a keyring.
        // Discoverable: found by itself on a new computer when it is the
        // account's too, and needed for bytes kept in the passkey (largeBlob).
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'required' },
        attestation: 'none',
        timeout: 60_000,
        extensions: {
          prf: { eval: { first: salt as BufferSource, ...(account ? { second: account.salt as BufferSource } : {}) } },
          largeBlob: { support: 'preferred' },
        } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential | null;
  } catch (error) {
    refusal(error);
  }
  if (!created) throw new BackgroundError('none', 'error.deviceCancelled');
  const credential: DeviceCredential = { credentialId: toBase64(new Uint8Array(created.rawId)), salt: toBase64(salt) };
  const outputs = created.getClientExtensionResults() as PrfOutputs;
  const first = answerOf(outputs.prf?.results?.first);
  const second = answerOf(outputs.prf?.results?.second);
  if (first && (!account || second)) return { credential, prf: first, accountPrf: second };
  // PRF, not answered at creation: one more touch, for both at once.
  const keeps = outputs.largeBlob?.supported === true;
  if (outputs.prf?.enabled === true || (outputs.prf?.enabled === undefined && !keeps)) {
    const asked = await askPasskey([credential.credentialId], salt, account?.salt);
    return { credential, prf: asked.first, accountPrf: asked.second };
  }
  // No PRF here, as iCloud Keychain before macOS 15: 32 random bytes kept in
  // the passkey itself, one more touch to put them there. They open this
  // vault; the account's passkey for new computers needs PRF, and is not made.
  if (keeps) {
    const secret = randomBytes(32);
    const kept = { ...credential, via: 'largeBlob' as const };
    let written: PrfOutputs['largeBlob'];
    try {
      written = await largeBlob(kept, secret);
    } catch (error) {
      forgetCredential(credential);
      refusal(error);
    }
    if (written?.written === true) return { credential: kept, prf: toBase64(secret), accountPrf: null };
  }
  forgetCredential(credential);
  throw new BackgroundError('no prf', deviceUnsupported());
}

/**
 * A key found, plugged in and its PIN typed takes longer than a touch of the
 * computer's own sensor.
 */
const KEY_TIMEOUT = 120_000;

/**
 * Make a credential for this vault on a USB security key, and its answer:
 * another way in beside the others, for whoever holds the key and knows its
 * PIN. Not discoverable: the key keeps nothing of Passhold's — none of the
 * few places it has for passkeys — and answers only to the credential's id,
 * which this browser alone keeps. PRF alone (the key's hmac-secret, which
 * FIDO2 keys have): a key without it is refused, and nothing is kept.
 *
 * `existing`: the keys set up already, so the same key is not added twice.
 */
export async function enrollKey(existing: readonly SecurityKey[]): Promise<{ credential: DeviceCredential; prf: string }> {
  const salt = randomBytes(32);
  let created: PublicKeyCredential | null;
  try {
    created = (await navigator.credentials.create({
      publicKey: {
        rp: { name: APP_NAME },
        user: { id: randomBytes(16) as BufferSource, name: APP_NAME, displayName: APP_NAME },
        challenge: randomBytes(32) as BufferSource,
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        excludeCredentials: existing.map((key) => ({ type: 'public-key' as const, id: fromBase64(key.credentialId) as BufferSource })),
        // A key on a keyring, not this computer's own unlock; `hints` has
        // Chrome ask for one straight away rather than offer a phone first.
        authenticatorSelection: { authenticatorAttachment: 'cross-platform', userVerification: 'required', residentKey: 'discouraged' },
        hints: ['security-key'],
        attestation: 'none',
        timeout: KEY_TIMEOUT,
        extensions: { prf: { eval: { first: salt as BufferSource } } } as AuthenticationExtensionsClientInputs,
      } as PublicKeyCredentialCreationOptions,
    })) as PublicKeyCredential | null;
  } catch (error) {
    // The key holds one of `existing`: Chrome said so, and made nothing.
    if (error instanceof DOMException && error.name === 'InvalidStateError') throw new BackgroundError(error.name, 'error.keyAlreadyAdded');
    refusal(error);
  }
  if (!created) throw new BackgroundError('none', 'error.deviceCancelled');
  const credential: DeviceCredential = { credentialId: toBase64(new Uint8Array(created.rawId)), salt: toBase64(salt) };
  const outputs = created.getClientExtensionResults() as PrfOutputs;
  const first = answerOf(outputs.prf?.results?.first);
  if (first) return { credential, prf: first };
  // Nothing to forget on the key either way: the credential is only its id.
  if (outputs.prf?.enabled === false) throw new BackgroundError('no prf', 'error.keyUnsupported');
  // PRF, not answered at creation: one more PIN and touch.
  return { credential, prf: (await askKey([credential])).prf };
}

/**
 * Ask whichever of these security keys is plugged in, once its PIN is typed
 * and it is touched — each for its own salt. `key`: which one answered.
 */
export async function askKey(keys: readonly Pick<SecurityKey, 'credentialId' | 'salt'>[]): Promise<{ key: string; prf: string }> {
  try {
    const result = (await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32) as BufferSource,
        allowCredentials: keys.map((key) => ({ type: 'public-key' as const, id: fromBase64(key.credentialId) as BufferSource })),
        userVerification: 'required',
        hints: ['security-key'],
        timeout: KEY_TIMEOUT,
        extensions: {
          prf: { evalByCredential: Object.fromEntries(keys.map((key) => [toBase64Url(fromBase64(key.credentialId)), { first: fromBase64(key.salt) as BufferSource }])) },
        } as AuthenticationExtensionsClientInputs,
      } as PublicKeyCredentialRequestOptions,
    })) as PublicKeyCredential | null;
    if (!result) throw new BackgroundError('none', 'error.deviceCancelled');
    const first = (result.getClientExtensionResults() as PrfOutputs | undefined)?.prf?.results?.first;
    if (!first) throw new BackgroundError('no prf', 'error.keyUnsupported');
    return { key: toBase64(new Uint8Array(result.rawId)), prf: toBase64(new Uint8Array(first)) };
  } catch (error) {
    refusal(error);
  }
}
