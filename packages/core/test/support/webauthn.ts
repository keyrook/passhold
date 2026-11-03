/**
 * A relying party's side of WebAuthn, written apart from Passhold's code and
 * on Node's own crypto: what a website's server would check of a passkey
 * Passhold made, and of a signature it gave. Shared by the unit tests and the
 * end-to-end ones, which hold the real extension to the same checks.
 */
import { createHash, createPublicKey, verify } from 'node:crypto';

type Value = number | string | Uint8Array | Value[] | Map<Value, Value>;

/** Enough of RFC 8949 to read what an authenticator writes. */
export function decodeCbor(bytes: Uint8Array): Value {
  let at = 0;
  const length = (info: number): number => {
    if (info < 24) return info;
    const size = { 24: 1, 25: 2, 26: 4 }[info];
    if (!size) throw new Error(`unsupported CBOR length ${info}`);
    let value = 0;
    for (let i = 0; i < size; i++) value = value * 256 + bytes[at++]!;
    return value;
  };
  const item = (): Value => {
    const initial = bytes[at++]!;
    const major = initial >> 5;
    const n = length(initial & 31);
    switch (major) {
      case 0:
        return n;
      case 1:
        return -1 - n;
      case 2:
        return bytes.slice(at, (at += n));
      case 3:
        return new TextDecoder().decode(bytes.slice(at, (at += n)));
      case 4:
        return Array.from({ length: n }, item);
      case 5: {
        const map = new Map<Value, Value>();
        for (let i = 0; i < n; i++) map.set(item(), item());
        return map;
      }
      default:
        throw new Error(`unsupported CBOR major type ${major}`);
    }
  };
  const value = item();
  if (at !== bytes.length) throw new Error('trailing bytes after CBOR');
  return value;
}

const sha256 = (data: Uint8Array) => new Uint8Array(createHash('sha256').update(data).digest());
const b64url = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64url');

export interface AuthData {
  rpIdHash: Uint8Array;
  flags: { up: boolean; uv: boolean; be: boolean; bs: boolean; at: boolean; ed: boolean };
  signCount: number;
  aaguid?: string;
  credentialId?: string;
  publicKey?: Map<Value, Value>;
}

export function readAuthData(data: Uint8Array): AuthData {
  const flags = data[32]!;
  const out: AuthData = {
    rpIdHash: data.slice(0, 32),
    flags: { up: !!(flags & 1), uv: !!(flags & 4), be: !!(flags & 8), bs: !!(flags & 16), at: !!(flags & 64), ed: !!(flags & 128) },
    signCount: Buffer.from(data.slice(33, 37)).readUInt32BE(0),
  };
  if (out.flags.at) {
    out.aaguid = Buffer.from(data.slice(37, 53)).toString('hex');
    const idLength = (data[53]! << 8) | data[54]!;
    out.credentialId = b64url(data.slice(55, 55 + idLength));
    out.publicKey = decodeCbor(data.slice(55 + idLength)) as Map<Value, Value>;
  }
  return out;
}

/** The COSE key as a Node key: what the server stores for this passkey. */
export function coseToKey(cose: Map<Value, Value>) {
  if (cose.get(1) !== 2 || cose.get(3) !== -7 || cose.get(-1) !== 1) throw new Error('not an ES256 P-256 key');
  return createPublicKey({
    key: { kty: 'EC', crv: 'P-256', x: b64url(cose.get(-2) as Uint8Array), y: b64url(cose.get(-3) as Uint8Array) },
    format: 'jwk',
  });
}

export interface Registered {
  credentialId: string;
  key: ReturnType<typeof createPublicKey>;
  auth: AuthData;
  clientData: { type: string; challenge: string; origin: string; crossOrigin: boolean };
}

/** A registration as a server checks it: for this site, this challenge, from this origin. */
export function checkRegistration(
  response: { clientDataJSON: Uint8Array; attestationObject: Uint8Array },
  expected: { rpId: string; challenge: string; origin: string },
): Registered {
  const clientData = JSON.parse(new TextDecoder().decode(response.clientDataJSON)) as Registered['clientData'];
  if (clientData.type !== 'webauthn.create') throw new Error(`type ${clientData.type}`);
  if (clientData.challenge !== expected.challenge) throw new Error('challenge differs');
  if (clientData.origin !== expected.origin) throw new Error(`origin ${clientData.origin}`);
  const attestation = decodeCbor(response.attestationObject) as Map<Value, Value>;
  if (attestation.get('fmt') !== 'none') throw new Error(`fmt ${String(attestation.get('fmt'))}`);
  const auth = readAuthData(attestation.get('authData') as Uint8Array);
  if (b64url(auth.rpIdHash) !== b64url(sha256(new TextEncoder().encode(expected.rpId)))) throw new Error('rpIdHash differs');
  if (!auth.flags.up || !auth.flags.at) throw new Error('flags');
  return { credentialId: auth.credentialId!, key: coseToKey(auth.publicKey!), auth, clientData };
}

/** A sign-in as a server checks it: the signature, over this site and this challenge, by the key it registered. */
export function checkAssertion(
  response: { clientDataJSON: Uint8Array; authenticatorData: Uint8Array; signature: Uint8Array },
  registered: Pick<Registered, 'key'>,
  expected: { rpId: string; challenge: string; origin: string },
): AuthData {
  const clientData = JSON.parse(new TextDecoder().decode(response.clientDataJSON)) as Registered['clientData'];
  if (clientData.type !== 'webauthn.get') throw new Error(`type ${clientData.type}`);
  if (clientData.challenge !== expected.challenge) throw new Error('challenge differs');
  if (clientData.origin !== expected.origin) throw new Error(`origin ${clientData.origin}`);
  const auth = readAuthData(response.authenticatorData);
  if (b64url(auth.rpIdHash) !== b64url(sha256(new TextEncoder().encode(expected.rpId)))) throw new Error('rpIdHash differs');
  const signed = Buffer.concat([response.authenticatorData, sha256(response.clientDataJSON)]);
  if (!verify('sha256', signed, registered.key, Buffer.from(response.signature))) throw new Error('signature does not verify');
  return auth;
}
