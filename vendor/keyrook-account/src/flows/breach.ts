/**
 * Whether passwords are known to be exposed, by k-anonymity: each one's SHA-1
 * is made here, only its first five characters go to the account server,
 * which asks Pwned Passwords, and the rest is matched here against what comes
 * back. Neither the password nor its whole hash leaves the device; the answer
 * is padded, so its size says nothing of how many there were.
 */
import type { HttpSyncAdapter } from '../sync/http.js';
import { toHex, utf8 } from '../util/bytes.js';

/** Prefixes the server takes in one request. */
const PER_REQUEST = 50;

async function sha1(password: string): Promise<string> {
  const bytes = utf8(password);
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-1', bytes as BufferSource))).toUpperCase();
}

/**
 * How many times each password was seen in a breach, in the order given: 0
 * for one never seen. A password given twice is looked up once.
 */
export async function exposedCounts(api: HttpSyncAdapter, passwords: string[]): Promise<number[]> {
  const hashes = await Promise.all(passwords.map(sha1));
  const prefixes = [...new Set(hashes.map((hash) => hash.slice(0, 5)))];
  const counts = new Map<string, number>();
  for (let at = 0; at < prefixes.length; at += PER_REQUEST) {
    const { ranges } = await api.breachRanges(prefixes.slice(at, at + PER_REQUEST));
    for (const prefix of prefixes.slice(at, at + PER_REQUEST)) {
      for (const line of (ranges[prefix] ?? '').split(/\r?\n/)) {
        const [suffix, seen] = line.trim().split(':');
        const count = Number(seen);
        // Padding has a count of 0, and a line of anything else is not taken.
        if (suffix && /^[0-9A-F]{35}$/.test(suffix) && Number.isSafeInteger(count) && count > 0) counts.set(prefix + suffix, count);
      }
    }
  }
  return hashes.map((hash) => counts.get(hash) ?? 0);
}
