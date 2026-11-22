/**
 * Send: what a link opens, and nothing else does.
 *
 * The link carries a secret in its fragment, which a browser never sends to
 * a server. From it, and a password stretched as an account's is when the
 * sender chose one, come two things: the key the body is sealed under, and
 * an access token, which the server keeps only the hash of and asks for
 * before it hands the sealed body over. So knowing an id spends no opens,
 * and the server, holding neither the secret nor the password, opens
 * nothing, and cannot let anyone past the password.
 */
import { DecryptionError, openJson, sealJson, type SealedBox } from '../crypto/aead.js';
import { transcript } from '../crypto/ecdh.js';
import { DEFAULT_PBKDF2_ITERATIONS } from '../crypto/kdf.js';
import { concatBytes, fromBase64, toBase64Url, toHex, utf8, wipe } from '../util/bytes.js';
import { randomBytes } from '../util/id.js';

/** HKDF's salt, and the first field of each of its infos. Frozen, as every label is: a new format is a new label beside it. */
export const SEND_INFO = 'keyrook:v1:send';
/** What a Send's body is bound to. */
export const sendBodyAad = (id: string): Uint8Array => utf8(`keyrook.send:v1:${id}:body`);

const SECRET_BYTES = 32;
/** A Send's id: 16 random bytes, base64url, so a link has no character a browser would change. */
export const SEND_ID = /^[A-Za-z0-9_-]{22}$/;
const SECRET = /^[A-Za-z0-9_-]{43}$/;

/** What a link holds: the Send's id, its secret, and whether a password is asked for too. */
export interface SendLink {
  id: string;
  secret: string;
  password: boolean;
}

/** A new Send's id and secret, made on the sender's device. */
export function newSendLink(password: boolean): SendLink {
  return { id: toBase64Url(randomBytes(16)), secret: toBase64Url(randomBytes(SECRET_BYTES)), password };
}

/** The link as the sender shares it: everything after `#` stays in the browser. */
export const sendLinkUrl = (page: string, link: SendLink): string => `${page.replace(/\/+$/, '')}/#${link.id}.${link.secret}${link.password ? '.p' : ''}`;

/** A link's fragment, read; null for anything that is not one. */
export function readSendLink(fragment: string): SendLink | null {
  const parts = fragment.replace(/^#/, '').split('.');
  const [id, secret, flag] = parts;
  if (parts.length > 3 || !id || !secret || !SEND_ID.test(id) || !SECRET.test(secret) || (flag !== undefined && flag !== 'p')) return null;
  return { id, secret, password: flag === 'p' };
}

const fromBase64Url = (value: string) => fromBase64(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4));

const info = (purpose: string, id: string) => transcript(SEND_INFO, purpose, id) as BufferSource;

/**
 * The body's key and the access token of a link, with its password when it
 * has one. A wrong password makes another key and another token: the server
 * refuses the token, and nothing opens.
 */
export async function sendKeys(link: Pick<SendLink, 'id' | 'secret'>, password?: string): Promise<{ contentKey: CryptoKey; access: string }> {
  if (!SEND_ID.test(link.id) || !SECRET.test(link.secret)) throw new DecryptionError('That is not a Keyrook Send link.');
  const secret = fromBase64Url(link.secret);
  let stretched = new Uint8Array(0);
  if (password !== undefined) {
    if (password.length === 0) throw new Error('Type the password.');
    // A salt only the link knows, so the server holds nothing to guess the password against.
    const base = await crypto.subtle.importKey('raw', secret as BufferSource, 'HKDF', false, ['deriveBits']);
    const salt = new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: utf8(SEND_INFO) as BufferSource, info: info('salt', link.id) }, base, 128));
    const typed = await crypto.subtle.importKey('raw', utf8(password.normalize('NFKC')) as BufferSource, 'PBKDF2', false, ['deriveBits']);
    stretched = new Uint8Array(
      await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt as BufferSource, iterations: DEFAULT_PBKDF2_ITERATIONS, hash: 'SHA-256' }, typed, 256),
    );
  }
  const ikm = concatBytes(secret, stretched);
  try {
    const material = await crypto.subtle.importKey('raw', ikm as BufferSource, 'HKDF', false, ['deriveKey', 'deriveBits']);
    const params = (purpose: string): HkdfParams => ({ name: 'HKDF', hash: 'SHA-256', salt: utf8(SEND_INFO) as BufferSource, info: info(purpose, link.id) });
    const contentKey = await crypto.subtle.deriveKey(params('content'), material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    const access = toBase64Url(new Uint8Array(await crypto.subtle.deriveBits(params('access'), material, 256)));
    return { contentKey, access };
  } finally {
    wipe(secret);
    wipe(stretched);
    wipe(ikm);
  }
}

/** What the server keeps of an access token, to compare with one presented. */
export async function sendAccessHash(access: string): Promise<string> {
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', utf8(access) as BufferSource)));
}

/** A file a Send holds: sealed as any file is, its key, name and type known only to the body. */
export interface SendFile {
  id: string;
  key: string;
  name: string;
  type: string;
  /** Before sealing. */
  size: number;
}

/** What a Send holds, sealed as one: text, a copy of an item, files, and the sender's name if they chose to show it. */
export interface SendBody {
  text?: string;
  /** A copy of one item, taken when it was sent: its name and each field, as the app that sent it shows them. */
  item?: { name: string; fields: { label: string; value: string; hidden?: boolean }[] };
  files?: SendFile[];
  from?: string;
}

/** As much as a Send holds besides its files: the body travels in a request. */
export const MAX_SEND_TEXT = 32 * 1024;
export const MAX_SEND_FILES = 10;

export async function sealSendBody(contentKey: CryptoKey, id: string, body: SendBody): Promise<SealedBox> {
  if (!body.text && !body.item && !body.files?.length) throw new Error('A Send needs text, an item or a file.');
  if ((body.text?.length ?? 0) > MAX_SEND_TEXT) throw new Error('That text is too long to send.');
  if ((body.files?.length ?? 0) > MAX_SEND_FILES) throw new Error('A Send holds at most 10 files.');
  return sealJson(contentKey, body, sendBodyAad(id));
}

/** Opens a Send's body; one sealed for another id, or under another key, fails as a `DecryptionError`. */
export async function openSendBody(contentKey: CryptoKey, id: string, box: SealedBox): Promise<SendBody> {
  const body = await openJson<SendBody>(contentKey, box, sendBodyAad(id));
  const string = (value: unknown) => typeof value === 'string';
  const ok =
    body !== null &&
    typeof body === 'object' &&
    (body.text === undefined || string(body.text)) &&
    (body.from === undefined || string(body.from)) &&
    (body.item === undefined || (string(body.item?.name) && Array.isArray(body.item?.fields) && body.item.fields.every((field) => string(field?.label) && string(field?.value)))) &&
    (body.files === undefined ||
      (Array.isArray(body.files) && body.files.every((file) => string(file?.id) && string(file?.key) && string(file?.name) && string(file?.type) && Number.isSafeInteger(file?.size))));
  if (!ok) throw new DecryptionError('Malformed Send.');
  return body;
}
