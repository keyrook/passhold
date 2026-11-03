/**
 * The recovery key: what a vault with no master password opens with when the
 * device cannot — a new computer, a passkey deleted, a fingerprint reader
 * gone.
 *
 * It stands where a master password would: the vault file and its backups are
 * sealed under it, through the same KDF. The difference is who chose it.
 * Passhold draws it at random, 120 bits, so there is nothing to guess and
 * nothing to remember; its owner keeps it on paper or in a file, somewhere
 * other than this computer.
 *
 * Written in Crockford's base32 — no I, L, O or U, so nothing reads as
 * something else — in six groups of four. Typed back, it forgives case,
 * spaces, dashes and the letters people put for 0 and 1.
 */
import { randomBytes } from '../util/id.js';

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const GROUPS = 6;
const GROUP = 4;
const LENGTH = GROUPS * GROUP;

export function generateRecoveryKey(): string {
  // 15 bytes are 120 bits: exactly 24 characters of five bits each.
  const bytes = randomBytes((LENGTH * 5) / 8);
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  return group(out);
}

function group(chars: string): string {
  return chars.match(new RegExp(`.{${GROUP}}`, 'g'))!.join('-');
}

/** A recovery key as typed, in its one written form; null when it cannot be one. */
export function normaliseRecoveryKey(input: string): string | null {
  const chars = input
    .toUpperCase()
    .replace(/[\s‐-―-]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
  if (chars.length !== LENGTH || [...chars].some((char) => !ALPHABET.includes(char))) return null;
  return group(chars);
}

/**
 * Checking a recovery key was put away: two of its groups, chosen at random,
 * typed back from wherever it was saved. A box ticked alone let people go on
 * with a key they never kept, and they found out the day they needed it; this
 * finds out while the key can still be shown again. The account's recovery
 * key is written in the same alphabet and groups of four, so it is checked
 * the same way.
 */
const groupsOf = (key: string): string[] => key.replace(/[\s‐-―-]/g, '').match(new RegExp(`.{1,${GROUP}}`, 'g')) ?? [];

const randomBelow = (n: number): number => crypto.getRandomValues(new Uint32Array(1))[0]! % n;

/** Two different groups of the key to ask for, counted from 1, in order. */
export function pickGroups(key: string, random: (n: number) => number = randomBelow): [number, number] {
  const count = groupsOf(key).length;
  if (count < 2) throw new Error('A recovery key has more than one group.');
  const first = random(count);
  let second = random(count - 1);
  // Never the same group twice: the second is drawn from the others.
  if (second >= first) second += 1;
  return [Math.min(first, second) + 1, Math.max(first, second) + 1];
}

/** Whether what was typed is the key's group at `position`, read the way the key is read when used. */
export function groupMatches(key: string, position: number, typed: string): boolean {
  const group = groupsOf(key.toUpperCase())[position - 1];
  const read = typed
    .toUpperCase()
    .replace(/[\s‐-―-]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
  return group !== undefined && read === group;
}
