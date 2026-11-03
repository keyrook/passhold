/**
 * Passhold as an authenticator: it makes a website's passkey and signs with
 * it, the way Google Password Manager or iCloud Keychain do (WebAuthn Level
 * 3, §6). No chrome.*, no DOM: what the request is, and who asked, is the
 * service worker's to establish (`request.ts`).
 *
 * Every passkey is P-256 (ES256), discoverable, and says it is backed up —
 * it lives in the vault, its backups and the Keyrook account, so it is not
 * lost with this computer; sites read that from the flags. The signature
 * counter stays at zero, as synced passkeys' do: a copy on another computer
 * cannot keep one count with this one, and zero tells the site not to try.
 * Attestation is "none": a site learns that a passkey is Passhold's from the
 * AAGUID below, and nothing about the person.
 */
import type { StoredPasskey } from '../vault/model.js';
import { concatBytes, fromBase64, fromHex, toBase64, toBase64url, utf8 } from '../util/bytes.js';
import { randomBytes } from '../util/id.js';
import { encodeCbor, type Cbor } from './cbor.js';
import { ES256 } from './request.js';

/** Passhold's authenticator model, the same in every copy. */
export const PASSHOLD_AAGUID = fromHex('5b15aceb220f471ebbd6821479b3c447');

const UP = 0x01; // the person was there: they chose this in Passhold
const UV = 0x04; // and verified: the vault is open only after they did
const BE = 0x08; // backup eligible
const BS = 0x10; // backed up
const AT = 0x40; // a new credential follows

const P256: EcKeyImportParams = { name: 'ECDSA', namedCurve: 'P-256' };

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', data as BufferSource));
}

async function authenticatorData(rpId: string, flags: number, attested?: Uint8Array): Promise<Uint8Array> {
  const counter = new Uint8Array(4);
  return concatBytes(await sha256(utf8(rpId)), new Uint8Array([flags]), counter, attested ?? new Uint8Array(0));
}

/** WebCrypto signs ECDSA as r‖s; WebAuthn wants it as ASN.1 DER (§6.5.6). */
export function derSignature(raw: Uint8Array): Uint8Array {
  const integer = (half: Uint8Array) => {
    let start = 0;
    while (start < half.length - 1 && half[start] === 0) start++;
    const trimmed = half.subarray(start);
    const body = trimmed[0]! & 0x80 ? concatBytes(new Uint8Array([0]), trimmed) : trimmed;
    return concatBytes(new Uint8Array([0x02, body.length]), body);
  };
  const r = integer(raw.subarray(0, 32));
  const s = integer(raw.subarray(32, 64));
  return concatBytes(new Uint8Array([0x30, r.length + s.length]), r, s);
}

export interface NewPasskey {
  rpId: string;
  rpName: string;
  /** The site's id for the account, base64url. */
  userHandle: string;
  userName: string;
  userDisplayName: string;
}

/** A new passkey, and its public half for the site. */
export async function createPasskey(input: NewPasskey, now = Date.now()): Promise<{ passkey: StoredPasskey; publicKey: CryptoKey }> {
  const pair = await crypto.subtle.generateKey(P256, true, ['sign', 'verify']);
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
  return {
    passkey: {
      credentialId: toBase64url(randomBytes(16)),
      rpId: input.rpId,
      rpName: input.rpName,
      userHandle: input.userHandle,
      userName: input.userName,
      userDisplayName: input.userDisplayName,
      privateKey: toBase64(pkcs8),
      createdAt: now,
    },
    publicKey: pair.publicKey,
  };
}

export interface Attestation {
  attestationObject: Uint8Array;
  authenticatorData: Uint8Array;
  /** SubjectPublicKeyInfo, DER: what `getPublicKey()` hands a site that does not read COSE. */
  publicKey: Uint8Array;
  publicKeyAlgorithm: number;
}

/** What the site keeps of a new passkey: its id, its public key, the site it is for. */
export async function attestPasskey(passkey: StoredPasskey, publicKey: CryptoKey): Promise<Attestation> {
  const jwk = await crypto.subtle.exportKey('jwk', publicKey);
  const cose = encodeCbor(
    new Map<number, number | Uint8Array>([
      [1, 2], // kty: EC2
      [3, ES256], // alg
      [-1, 1], // crv: P-256
      [-2, fromBase64(jwk.x!)],
      [-3, fromBase64(jwk.y!)],
    ]),
  );
  const id = fromBase64(passkey.credentialId);
  const length = new Uint8Array([id.length >> 8, id.length & 0xff]);
  const data = await authenticatorData(passkey.rpId, UP | UV | BE | BS | AT, concatBytes(PASSHOLD_AAGUID, length, id, cose));
  return {
    attestationObject: encodeCbor(
      new Map<string, Cbor>([
        ['fmt', 'none'],
        ['attStmt', new Map<string, Cbor>()],
        ['authData', data],
      ]),
    ),
    authenticatorData: data,
    publicKey: new Uint8Array(await crypto.subtle.exportKey('spki', publicKey)),
    publicKeyAlgorithm: ES256,
  };
}

/** Whether these bytes are a P-256 private key in PKCS#8 that WebCrypto will sign with: a passkey an import brings is checked before it is kept. */
export async function signsAsPasskey(pkcs8: Uint8Array): Promise<boolean> {
  try {
    await crypto.subtle.importKey('pkcs8', pkcs8 as BufferSource, P256, false, ['sign']);
    return true;
  } catch {
    return false;
  }
}

export interface Assertion {
  authenticatorData: Uint8Array;
  signature: Uint8Array;
  userHandle: Uint8Array;
}

/** A signature for a sign-in: over this site, these flags and what the site asked (`clientDataJSON`). */
export async function assertPasskey(passkey: StoredPasskey, clientData: Uint8Array): Promise<Assertion> {
  const key = await crypto.subtle.importKey('pkcs8', fromBase64(passkey.privateKey) as BufferSource, P256, false, ['sign']);
  const data = await authenticatorData(passkey.rpId, UP | UV | BE | BS);
  const signed = concatBytes(data, await sha256(clientData));
  const raw = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, signed as BufferSource));
  return { authenticatorData: data, signature: derSignature(raw), userHandle: fromBase64(passkey.userHandle) };
}
