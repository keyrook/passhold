/**
 * The little CBOR (RFC 8949) a passkey has to write: an attestation object
 * and a COSE public key. Maps are written in the order they are given, which
 * the callers keep canonical (shorter keys first, then bytewise: §4.2.1);
 * nothing here reads CBOR, because Passhold never has to.
 */
export type Cbor = number | string | Uint8Array | Cbor[] | Map<number | string, Cbor>;

function head(major: number, value: number): number[] {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) throw new RangeError('CBOR length or integer out of range');
  if (value < 24) return [(major << 5) | value];
  if (value < 0x100) return [(major << 5) | 24, value];
  if (value < 0x10000) return [(major << 5) | 25, value >> 8, value & 0xff];
  return [(major << 5) | 26, (value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
}

function write(value: Cbor, out: number[]): void {
  if (typeof value === 'number') {
    out.push(...(value >= 0 ? head(0, value) : head(1, -1 - value)));
  } else if (typeof value === 'string') {
    const bytes = new TextEncoder().encode(value);
    out.push(...head(3, bytes.length), ...bytes);
  } else if (value instanceof Uint8Array) {
    out.push(...head(2, value.length));
    for (const byte of value) out.push(byte);
  } else if (Array.isArray(value)) {
    out.push(...head(4, value.length));
    for (const entry of value) write(entry, out);
  } else {
    out.push(...head(5, value.size));
    for (const [key, entry] of value) {
      write(key, out);
      write(entry, out);
    }
  }
}

export function encodeCbor(value: Cbor): Uint8Array {
  const out: number[] = [];
  write(value, out);
  return new Uint8Array(out);
}
