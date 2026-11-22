/**
 * A file, sealed on the device before it leaves. What opens it
 * is a key made for this file alone, which the product keeps in its own sealed
 * record, so the server and the store hold bytes neither can read.
 *
 * WebCrypto has no streaming, and AES-GCM over a whole file would need it all
 * in memory twice, so a file is cut into chunks, each with its own tag. The
 * label binds a chunk to its file, its place and how many there are: moved,
 * swapped into another file, or cut short, it does not open.
 */
import { DecryptionError } from '../crypto/aead.js';
import { fromBase64, toBase64, utf8 } from '../util/bytes.js';
import { randomBytes } from '../util/id.js';

const CHUNK_BYTES = 1024 * 1024;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

/** As an account's id: no colon, so the label reads one way. */
const FILE_ID = /^[A-Za-z0-9_-]{1,64}$/;

/** What each chunk is sealed to: which file, where in it, and out of how many, so none is moved, dropped or added. */
export const fileChunkAad = (fileId: string, index: number, count: number): Uint8Array => utf8(`keyrook.file:v1:${fileId}:${index}:${count}`);

const chunksOf = (size: number) => Math.max(1, Math.ceil(size / CHUNK_BYTES));

/** How many bytes a file of `size` takes once sealed: what the server is told, before anything is sealed. */
export const sealedFileSize = (size: number): number => size + chunksOf(size) * TAG_BYTES;

/** The chunk's place: safe as a nonce because the key seals this one file and no other. */
function nonce(index: number): Uint8Array {
  const iv = new Uint8Array(12);
  new DataView(iv.buffer).setUint32(8, index);
  return iv;
}

const chunkKey = (raw: Uint8Array, use: KeyUsage) => crypto.subtle.importKey('raw', raw as BufferSource, 'AES-GCM', false, [use]);

export interface SealedFile {
  /** What opens it, base64: for the product's own sealed record, and never for the server. */
  key: string;
  sealed: Uint8Array;
}

/**
 * Seals `bytes` as the file `fileId`, under a key made here. It takes no key:
 * a nonce is safe only because a key never seals twice, and a caller who could
 * pass one could do that.
 */
export async function sealFile(fileId: string, bytes: Uint8Array): Promise<SealedFile> {
  if (!FILE_ID.test(fileId)) throw new Error('Malformed file id.');
  const raw = randomBytes(KEY_BYTES);
  const key = await chunkKey(raw, 'encrypt');
  const count = chunksOf(bytes.length);
  const sealed = new Uint8Array(sealedFileSize(bytes.length));
  for (let index = 0; index < count; index += 1) {
    const chunk = bytes.subarray(index * CHUNK_BYTES, (index + 1) * CHUNK_BYTES);
    const ct = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce(index) as BufferSource, additionalData: fileChunkAad(fileId, index, count) as BufferSource, tagLength: TAG_BYTES * 8 },
      key,
      chunk as BufferSource,
    );
    sealed.set(new Uint8Array(ct), index * (CHUNK_BYTES + TAG_BYTES));
  }
  return { key: toBase64(raw), sealed };
}

/** Opens what `sealFile` made, refusing it whole if any of it was changed, moved or cut. */
export async function openFile(fileId: string, key: string, sealed: Uint8Array): Promise<Uint8Array> {
  if (!FILE_ID.test(fileId)) throw new Error('Malformed file id.');
  const raw = fromBase64(key);
  if (raw.length !== KEY_BYTES || sealed.length < TAG_BYTES) throw new DecryptionError();
  const opening = await chunkKey(raw, 'decrypt');
  const full = CHUNK_BYTES + TAG_BYTES;
  const count = Math.ceil(sealed.length / full);
  const out = new Uint8Array(sealed.length - count * TAG_BYTES);
  for (let index = 0; index < count; index += 1) {
    const chunk = sealed.subarray(index * full, (index + 1) * full);
    let plain: ArrayBuffer;
    try {
      plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: nonce(index) as BufferSource, additionalData: fileChunkAad(fileId, index, count) as BufferSource, tagLength: TAG_BYTES * 8 },
        opening,
        chunk as BufferSource,
      );
    } catch {
      throw new DecryptionError();
    }
    out.set(new Uint8Array(plain), index * CHUNK_BYTES);
  }
  return out;
}
