/**
 * One file out of a ZIP archive — 1Password's `.1pux` is one, its items in
 * `export.data` — read with what every browser and Node already have
 * (`DecompressionStream`), and nothing else. The archive is untrusted: every
 * offset is checked against its length, and a file that inflates past
 * `limit` is refused before it is all in memory.
 */
import { PassholdError } from '../errors.js';

const END = 0x06054b50;
const CENTRAL = 0x02014b50;
const LOCAL = 0x04034b50;
const STORED = 0;
const DEFLATED = 8;

export function isZip(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

async function inflate(data: Uint8Array, limit: number): Promise<Uint8Array> {
  const source = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });
  const reader = source.pipeThrough(new DecompressionStream('deflate-raw')).getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > limit) {
      await reader.cancel();
      throw new PassholdError('importTooLarge');
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}

/** The named file's bytes, or null when the archive holds no such file. Anything not a ZIP Passhold can read is `importUnknownFormat`. */
export async function readZipEntry(bytes: Uint8Array, wanted: string, limit: number): Promise<Uint8Array | null> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const fail = (): never => {
    throw new PassholdError('importUnknownFormat');
  };
  const u16 = (at: number) => (at + 2 <= bytes.length ? view.getUint16(at, true) : fail());
  const u32 = (at: number) => (at + 4 <= bytes.length ? view.getUint32(at, true) : fail());

  // The end record is in the last 64 KiB and 22 bytes: its comment may be up to 65,535 bytes long.
  let end = -1;
  for (let at = bytes.length - 22; at >= Math.max(0, bytes.length - 22 - 0xffff); at--) {
    if (view.getUint32(at, true) === END) {
      end = at;
      break;
    }
  }
  if (end < 0) fail();
  const count = u16(end + 10);
  let at = u32(end + 16);
  const names = new TextDecoder();
  for (let index = 0; index < count; index++) {
    if (u32(at) !== CENTRAL) fail();
    const method = u16(at + 10);
    const compressed = u32(at + 20);
    const size = u32(at + 24);
    const nameLength = u16(at + 28);
    const extraLength = u16(at + 30);
    const commentLength = u16(at + 32);
    const local = u32(at + 42);
    if (at + 46 + nameLength > bytes.length) fail();
    const name = names.decode(bytes.subarray(at + 46, at + 46 + nameLength));
    at += 46 + nameLength + extraLength + commentLength;
    if (name !== wanted) continue;
    // ZIP64's sizes, which a file this size never needs, are read as what they are: too large.
    if (size > limit || compressed === 0xffffffff) throw new PassholdError('importTooLarge');
    if (u32(local) !== LOCAL) fail();
    const start = local + 30 + u16(local + 26) + u16(local + 28);
    if (start + compressed > bytes.length) fail();
    const data = bytes.subarray(start, start + compressed);
    if (method === STORED) return data.slice();
    if (method === DEFLATED) return inflate(data, limit);
    fail();
  }
  return null;
}
