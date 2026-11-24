/**
 * A release's archives, the same bytes from the same files on any computer:
 * the system's own `tar` and `zip` write each file's time, owner and group,
 * the order the disk lists them in, and (gzip) which system packed them, so
 * two builds of one tag would never have one SHA-256.
 *
 * Here every entry is dated at the commit the release is built from
 * (SOURCE_DATE_EPOCH), owned by nobody, in the order given, with 0755 for a
 * program and 0644 for anything else.
 */
import { crc32, deflateRawSync, gzipSync } from 'node:zlib';

/**
 * @typedef {{ name: string, bytes: Uint8Array, program?: boolean }} Entry
 *   `name` is the path inside the archive, with `/` between folders.
 */

const modeOf = (entry) => (entry.program ? 0o755 : 0o644);

/** The folders an archive's files are in, each once and before what is in it. */
function foldersOf(entries) {
  const seen = new Set();
  const folders = [];
  for (const { name } of entries) {
    const parts = name.split('/').slice(0, -1);
    for (let at = 1; at <= parts.length; at++) {
      const folder = `${parts.slice(0, at).join('/')}/`;
      if (!seen.has(folder)) {
        seen.add(folder);
        folders.push(folder);
      }
    }
  }
  return folders;
}

/** One ustar header: 512 bytes, its checksum counted with its own field as spaces. */
function tarHeader(name, size, mode, mtime, type) {
  if (Buffer.byteLength(name) > 100) throw new Error(`${name} is longer than a tar header holds.`);
  const header = Buffer.alloc(512);
  const field = (text, at, length) => header.write(text, at, length, 'utf8');
  const octal = (value, at, length) => field(`${value.toString(8).padStart(length - 1, '0')}\0`, at, length);
  field(name, 0, 100);
  octal(mode, 100, 8);
  octal(0, 108, 8);
  octal(0, 116, 8);
  octal(size, 124, 12);
  octal(mtime, 136, 12);
  header.fill(0x20, 148, 156);
  field(type, 156, 1);
  field('ustar\0', 257, 6);
  field('00', 263, 2);
  let sum = 0;
  for (const byte of header) sum += byte;
  field(`${sum.toString(8).padStart(6, '0')}\0 `, 148, 8);
  return header;
}

/** A .tar.gz of the entries, dated `epoch` (seconds). */
export function tarGz(entries, epoch) {
  const blocks = [];
  for (const folder of foldersOf(entries)) blocks.push(tarHeader(folder, 0, 0o755, epoch, '5'));
  for (const entry of entries) {
    const bytes = Buffer.from(entry.bytes);
    blocks.push(tarHeader(entry.name, bytes.length, modeOf(entry), epoch, '0'), bytes, Buffer.alloc((512 - (bytes.length % 512)) % 512));
  }
  blocks.push(Buffer.alloc(1024));
  const gz = gzipSync(Buffer.concat(blocks), { level: 9 });
  // gzip's header names the system that packed it (byte 9) and has no time (bytes 4-7, left 0 by zlib): "unknown", everywhere.
  gz[9] = 0xff;
  return gz;
}

/** An MS-DOS date and time, as zip keeps them, in UTC: two seconds at a time, from 1980. */
function dosTime(epoch) {
  const at = new Date(Math.max(epoch, 315532800) * 1000);
  const time = (at.getUTCHours() << 11) | (at.getUTCMinutes() << 5) | (at.getUTCSeconds() >> 1);
  const date = ((at.getUTCFullYear() - 1980) << 9) | ((at.getUTCMonth() + 1) << 5) | at.getUTCDate();
  return { time, date };
}

/** A .zip of the entries, deflated, dated `epoch` (seconds), with Unix modes for whoever unzips on a Mac or Linux. */
export function zip(entries, epoch) {
  const { time, date } = dosTime(epoch);
  const locals = [];
  const central = [];
  let offset = 0;
  const add = (name, data, mode, folder) => {
    const nameBytes = Buffer.from(name, 'utf8');
    const packed = folder ? Buffer.alloc(0) : deflateRawSync(data, { level: 9 });
    const crc = folder ? 0 : crc32(data);
    const method = folder ? 0 : 8;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    // Bit 11: the name is UTF-8.
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, nameBytes, packed);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    // Made by Unix (3), zip 2.0: so the external attributes below are read as a Unix mode.
    entry.writeUInt16LE((3 << 8) | 20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(0x0800, 8);
    entry.writeUInt16LE(method, 10);
    entry.writeUInt16LE(time, 12);
    entry.writeUInt16LE(date, 14);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(packed.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(nameBytes.length, 28);
    // Unix mode in the high half; the MS-DOS directory bit in the low one.
    entry.writeUInt32LE(((((folder ? 0o040000 : 0o100000) | mode) << 16) | (folder ? 0x10 : 0)) >>> 0, 38);
    entry.writeUInt32LE(offset, 42);
    central.push(entry, nameBytes);
    offset += local.length + nameBytes.length + packed.length;
  };
  const folders = foldersOf(entries);
  for (const folder of folders) add(folder, Buffer.alloc(0), 0o755, true);
  for (const entry of entries) add(entry.name, Buffer.from(entry.bytes), modeOf(entry), false);
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  const count = folders.length + entries.length;
  end.writeUInt16LE(count, 8);
  end.writeUInt16LE(count, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}
