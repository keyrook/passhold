/**
 * SSH keys, as OpenSSH writes them (PROTOCOL.key in its source): reading what
 * a private key file says of itself, and making a new Ed25519 key.
 *
 * A private key file carries its public key in the clear, before the private
 * part, whether or not a passphrase seals that part. So the public key and
 * its fingerprint are read from the file itself and never typed beside it,
 * where the two could disagree.
 */
import { PassholdError } from './errors.js';
import { fromBase64, fromUtf8, toBase64, toBase64url, utf8 } from './util/bytes.js';

const BEGIN = '-----BEGIN OPENSSH PRIVATE KEY-----';
const END = '-----END OPENSSH PRIVATE KEY-----';
const MAGIC = utf8('openssh-key-v1\0');

/** What a private key file says of the key it holds. */
export interface SshKeyInfo {
  /** `ssh-ed25519`, `ssh-rsa`, `ecdsa-sha2-nistp256`…: the key's kind, as OpenSSH names it. */
  type: string;
  /** The line an `authorized_keys` file takes: the kind, the key and its comment. */
  publicKey: string;
  /** `SHA256:` and the hash of the public key, as `ssh-keygen -l` prints it. */
  fingerprint: string;
  /** Sealed with a passphrase: usable only by whoever knows it too. */
  encrypted: boolean;
}

/** Reads what SSH writes: whole numbers, and strings each after its length. */
export class SshReader {
  private at = 0;
  constructor(private readonly bytes: Uint8Array) {}

  get left(): number {
    return this.bytes.length - this.at;
  }

  take(length: number): Uint8Array {
    if (length < 0 || length > this.left) throw new PassholdError('itemInvalid');
    const part = this.bytes.subarray(this.at, this.at + length);
    this.at += length;
    return part;
  }

  uint32(): number {
    const [a, b, c, d] = this.take(4) as unknown as [number, number, number, number];
    return ((a << 24) | (b << 16) | (c << 8) | d) >>> 0;
  }

  string(): Uint8Array {
    return this.take(this.uint32());
  }

  byte(): number {
    return this.take(1)[0]!;
  }
}

/** Writes as SSH does. */
export class SshWriter {
  private readonly parts: Uint8Array[] = [];

  bytes(part: Uint8Array): this {
    this.parts.push(part);
    return this;
  }

  uint32(value: number): this {
    return this.bytes(new Uint8Array([value >>> 24, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff]));
  }

  string(value: Uint8Array | string): this {
    const part = typeof value === 'string' ? utf8(value) : value;
    return this.uint32(part.length).bytes(part);
  }

  byte(value: number): this {
    return this.bytes(new Uint8Array([value & 0xff]));
  }

  /** A positive whole number as SSH writes one: big-endian, with a zero before a first byte whose top bit is set. */
  mpint(value: Uint8Array): this {
    let at = 0;
    while (at < value.length && value[at] === 0) at++;
    const bare = value.subarray(at);
    if (bare.length && bare[0]! & 0x80) return this.string(new SshWriter().byte(0).bytes(bare).done());
    return this.string(bare);
  }

  done(): Uint8Array {
    const out = new Uint8Array(this.parts.reduce((sum, part) => sum + part.length, 0));
    let at = 0;
    for (const part of this.parts) {
      out.set(part, at);
      at += part.length;
    }
    return out;
  }
}

/** One line, with nothing in it a file or a terminal would act on. */
const oneLine = (text: string) => text.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 200);

/** Whether a text is, by its first line, a private key as OpenSSH writes it. */
export function looksLikeSshKey(text: string): boolean {
  return text.trim().startsWith(BEGIN);
}

/**
 * What a private key file holds, read from the file alone. Refused
 * (`itemInvalid`) when it is not one OpenSSH wrote, or holds more or less
 * than one key.
 */
export async function readSshKey(text: string, comment = ''): Promise<SshKeyInfo> {
  const trimmed = text.trim();
  if (!trimmed.startsWith(BEGIN) || !trimmed.endsWith(END)) throw new PassholdError('itemInvalid');
  const body = trimmed.slice(BEGIN.length, -END.length).replace(/\s+/g, '');
  let file: Uint8Array;
  try {
    file = fromBase64(body);
  } catch {
    throw new PassholdError('itemInvalid');
  }
  const reader = new SshReader(file);
  const magic = reader.take(MAGIC.length);
  if (!magic.every((byte, index) => byte === MAGIC[index])) throw new PassholdError('itemInvalid');
  const cipher = fromUtf8(reader.string());
  reader.string(); // The KDF's name,
  reader.string(); // and what it was given.
  if (reader.uint32() !== 1) throw new PassholdError('itemInvalid');
  const blob = reader.string();
  const type = fromUtf8(new SshReader(blob).string());
  if (!/^[a-z0-9@.-]{1,64}$/.test(type)) throw new PassholdError('itemInvalid');
  // The private part must at least be there: a public key with a private key's header is not a key to keep.
  if (reader.string().length === 0) throw new PassholdError('itemInvalid');
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', blob as BufferSource));
  const named = oneLine(comment);
  return {
    type,
    publicKey: `${type} ${toBase64(blob)}${named ? ` ${named}` : ''}`,
    fingerprint: `SHA256:${toBase64(digest).replace(/=+$/, '')}`,
    encrypted: cipher !== 'none',
  };
}

/**
 * A new Ed25519 key, in the file OpenSSH would have written for it, with no
 * passphrase: the vault is what seals it. `comment` is the name it carries,
 * as `ssh-keygen -C` gives one.
 */
export async function generateSshKey(comment = ''): Promise<{ privateKey: string } & SshKeyInfo> {
  const pair = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify'])) as CryptoKeyPair;
  const publicBytes = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
  // PKCS#8 for Ed25519 is a fixed header and then the 32-byte seed.
  const seed = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey)).slice(-32);
  const named = oneLine(comment);
  const blob = new SshWriter().string('ssh-ed25519').string(publicBytes).done();
  const check = crypto.getRandomValues(new Uint8Array(4));
  const secret = new Uint8Array(64);
  secret.set(seed);
  secret.set(publicBytes, 32);
  const inner = new SshWriter().bytes(check).bytes(check).string('ssh-ed25519').string(publicBytes).string(secret).string(named);
  // Padded to the cipher's block, which for no cipher is eight bytes: 1, 2, 3…
  let privatePart = inner.done();
  const padding = (8 - (privatePart.length % 8)) % 8;
  privatePart = new SshWriter().bytes(privatePart).bytes(Uint8Array.from({ length: padding }, (_, index) => index + 1)).done();
  const file = new SshWriter().bytes(MAGIC).string('none').string('none').string('').uint32(1).string(blob).string(privatePart).done();
  seed.fill(0);
  secret.fill(0);
  const lines = toBase64(file).match(/.{1,70}/g) ?? [];
  const privateKey = `${BEGIN}\n${lines.join('\n')}\n${END}\n`;
  return { privateKey, ...(await readSshKey(privateKey, named)) };
}

// --- signing, as an SSH agent signs ------------------------------------------------

/** `SSH_AGENT_RSA_SHA2_256` and `_512`: which hash an RSA signature is asked for with. */
export const SSH_RSA_SHA2_256 = 2;
export const SSH_RSA_SHA2_512 = 4;

/** A private key that can sign: its public key as the agent protocol names it, and how it signs. */
export interface SshSigner {
  type: string;
  /** The public key blob, as an agent lists it and a server checks it. */
  blob: Uint8Array;
  fingerprint: string;
  /** The signature over `data`, as SSH writes one: the algorithm's name, then the signature itself. */
  sign(data: Uint8Array, flags?: number): Promise<Uint8Array>;
}

export type SshSignerResult =
  | { status: 'ready'; signer: SshSigner }
  /** Sealed with a passphrase, which Passhold does not hold. */
  | { status: 'sealed' }
  /** A kind it cannot sign with here: a security key's (`sk-…`), or one it does not know. */
  | { status: 'unsupported'; type: string }
  /** Not a key as OpenSSH writes one, or one whose two halves disagree. */
  | { status: 'invalid' };

const CURVES: Record<string, { curve: string; named: string; size: number; hash: string }> = {
  'ecdsa-sha2-nistp256': { curve: 'nistp256', named: 'P-256', size: 32, hash: 'SHA-256' },
  'ecdsa-sha2-nistp384': { curve: 'nistp384', named: 'P-384', size: 48, hash: 'SHA-384' },
  'ecdsa-sha2-nistp521': { curve: 'nistp521', named: 'P-521', size: 66, hash: 'SHA-512' },
};

/** Without the zeros an mpint may start with: JWK numbers are bare. */
function bare(value: Uint8Array): Uint8Array {
  let at = 0;
  while (at < value.length - 1 && value[at] === 0) at++;
  return value.subarray(at);
}

/** Exactly `size` bytes, as an elliptic curve's coordinates are written in a JWK. */
function sized(value: Uint8Array, size: number): Uint8Array {
  const trimmed = bare(value);
  if (trimmed.length > size) throw new PassholdError('itemInvalid');
  const out = new Uint8Array(size);
  out.set(trimmed, size - trimmed.length);
  return out;
}

const big = (value: Uint8Array) => BigInt(`0x${Array.from(value, (byte) => byte.toString(16).padStart(2, '0')).join('') || '0'}`);
function bytesOf(value: bigint): Uint8Array {
  const hex = value.toString(16);
  const even = hex.length % 2 ? `0${hex}` : hex;
  return Uint8Array.from(even.match(/../g) ?? [], (pair) => parseInt(pair, 16));
}

const same = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((byte, index) => byte === b[index]);

/**
 * A private key file, ready to sign as an SSH agent signs: Ed25519, RSA
 * (`rsa-sha2-256` and `-512`, or the old `ssh-rsa` only when neither is asked
 * for) and ECDSA on the NIST curves. The public key offered is the one the
 * file's private part makes, and the file is refused when the public key it
 * carries in the clear says otherwise: what an agent lists and what it signs
 * with are then one key.
 */
export async function sshSigner(text: string): Promise<SshSignerResult> {
  const trimmed = text.trim();
  if (!trimmed.startsWith(BEGIN) || !trimmed.endsWith(END)) return { status: 'invalid' };
  try {
    const reader = new SshReader(fromBase64(trimmed.slice(BEGIN.length, -END.length).replace(/\s+/g, '')));
    if (!same(reader.take(MAGIC.length), MAGIC)) return { status: 'invalid' };
    if (fromUtf8(reader.string()) !== 'none') return { status: 'sealed' };
    reader.string();
    reader.string();
    if (reader.uint32() !== 1) return { status: 'invalid' };
    const blob = reader.string().slice();
    const inner = new SshReader(reader.string());
    if (inner.uint32() !== inner.uint32()) return { status: 'invalid' };
    const type = fromUtf8(inner.string());
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', blob as BufferSource));
    const fingerprint = `SHA256:${toBase64(digest).replace(/=+$/, '')}`;
    const made = await signerFor(type, inner);
    if (!made) return { status: 'unsupported', type: oneLine(type) };
    if (!same(made.blob, blob)) return { status: 'invalid' };
    return { status: 'ready', signer: { type, blob, fingerprint, sign: made.sign } };
  } catch {
    return { status: 'invalid' };
  }
}

async function signerFor(type: string, inner: SshReader): Promise<{ blob: Uint8Array; sign: SshSigner['sign'] } | null> {
  if (type === 'ssh-ed25519') {
    const publicKey = inner.string();
    const secret = inner.string();
    if (publicKey.length !== 32 || secret.length !== 64 || !same(secret.subarray(32), publicKey)) throw new PassholdError('itemInvalid');
    const key = await crypto.subtle.importKey('jwk', { kty: 'OKP', crv: 'Ed25519', d: toBase64url(secret.subarray(0, 32)), x: toBase64url(publicKey) }, { name: 'Ed25519' }, false, ['sign']);
    return {
      blob: new SshWriter().string(type).string(publicKey).done(),
      sign: async (data) => new SshWriter().string(type).string(new Uint8Array(await crypto.subtle.sign({ name: 'Ed25519' }, key, data as BufferSource))).done(),
    };
  }
  if (type === 'ssh-rsa') {
    const [n, e, d, iqmp, p, q] = [inner.string(), inner.string(), inner.string(), inner.string(), inner.string(), inner.string()].map(bare) as [Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array];
    // A JWK wants both exponents of the Chinese remainder, which the file leaves to be worked out.
    const [D, P, Q] = [big(d), big(p), big(q)];
    if (P * Q !== big(n)) throw new PassholdError('itemInvalid');
    const jwk = { kty: 'RSA', n: toBase64url(n), e: toBase64url(e), d: toBase64url(d), p: toBase64url(p), q: toBase64url(q), dp: toBase64url(bytesOf(D % (P - 1n))), dq: toBase64url(bytesOf(D % (Q - 1n))), qi: toBase64url(iqmp) };
    const keys = new Map<string, Promise<CryptoKey>>();
    const keyFor = (hash: string) => {
      if (!keys.has(hash)) keys.set(hash, crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash }, false, ['sign']) as Promise<CryptoKey>);
      return keys.get(hash)!;
    };
    await keyFor('SHA-512');
    return {
      blob: new SshWriter().string(type).mpint(e).mpint(n).done(),
      sign: async (data, flags = 0) => {
        const [name, hash] = flags & SSH_RSA_SHA2_512 ? ['rsa-sha2-512', 'SHA-512'] : flags & SSH_RSA_SHA2_256 ? ['rsa-sha2-256', 'SHA-256'] : ['ssh-rsa', 'SHA-1'];
        return new SshWriter().string(name!).string(new Uint8Array(await crypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5' }, await keyFor(hash!), data as BufferSource))).done();
      },
    };
  }
  const curve = CURVES[type];
  if (curve) {
    if (fromUtf8(inner.string()) !== curve.curve) throw new PassholdError('itemInvalid');
    const point = inner.string();
    const d = inner.string();
    if (point.length !== 1 + 2 * curve.size || point[0] !== 4) throw new PassholdError('itemInvalid');
    const jwk = {
      kty: 'EC',
      crv: curve.named,
      x: toBase64url(point.subarray(1, 1 + curve.size)),
      y: toBase64url(point.subarray(1 + curve.size)),
      d: toBase64url(sized(d, curve.size)),
    };
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: curve.named }, false, ['sign']);
    return {
      blob: new SshWriter().string(type).string(curve.curve).string(point).done(),
      sign: async (data) => {
        // WebCrypto gives r and s side by side; SSH writes each as an mpint.
        const raw = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: curve.hash }, key, data as BufferSource));
        const rs = new SshWriter().mpint(raw.subarray(0, curve.size)).mpint(raw.subarray(curve.size)).done();
        return new SshWriter().string(type).string(rs).done();
      },
    };
  }
  return null;
}
