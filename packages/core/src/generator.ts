/**
 * New passwords, from the platform's cryptographic random source only.
 *
 * Two things a generator gets quietly wrong: `byte % alphabet.length` favours
 * the first characters of the alphabet (256 is not a multiple of 70), and a
 * password that must contain each chosen kind of character, made by retrying
 * until one does, is fine — but one made by overwriting a position with a
 * forced character is not uniform. Here every character comes from rejection
 * sampling, one of each chosen kind is placed first, and the whole is then
 * shuffled with the same unbiased source.
 */

export interface GeneratorOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  /** Leave out characters that read alike: Il1 O0 and friends. */
  avoidAmbiguous: boolean;
}

export const DEFAULT_GENERATOR: GeneratorOptions = {
  length: 20,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  avoidAmbiguous: true,
};

export const GENERATOR_MIN_LENGTH = 8;
export const GENERATOR_MAX_LENGTH = 128;

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  // Symbols every sign-up form we know of accepts; quotes, backslash and
  // space are the ones that break forms and shell scripts alike.
  symbols: '!#$%&*+-.:;=?@^_~',
} as const;

const AMBIGUOUS = new Set('Il1O0o|`\'"'.split(''));

/** A uniform integer in [0, bound), without modulo bias. */
export function randomBelow(bound: number): number {
  if (!Number.isInteger(bound) || bound <= 0 || bound > 2 ** 32) throw new RangeError('bound');
  const limit = Math.floor(2 ** 32 / bound) * bound;
  const word = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(word);
    if (word[0]! < limit) return word[0]! % bound;
  }
}

function pickFrom(alphabet: string): string {
  return alphabet[randomBelow(alphabet.length)]!;
}

export function normaliseGenerator(options: Partial<GeneratorOptions>): GeneratorOptions {
  const merged = { ...DEFAULT_GENERATOR, ...options };
  const length = Math.round(Number(merged.length));
  return {
    ...merged,
    length: Number.isFinite(length)
      ? Math.min(GENERATOR_MAX_LENGTH, Math.max(GENERATOR_MIN_LENGTH, length))
      : DEFAULT_GENERATOR.length,
    // With every kind switched off there is nothing to draw from; lower case
    // is the kind no form refuses.
    lower: merged.lower || !(merged.upper || merged.digits || merged.symbols),
  };
}

export function generatePassword(options: Partial<GeneratorOptions> = {}): string {
  const settings = normaliseGenerator(options);
  const kinds = (Object.keys(SETS) as (keyof typeof SETS)[])
    .filter((kind) => settings[kind])
    .map((kind) =>
      settings.avoidAmbiguous
        ? [...SETS[kind]].filter((char) => !AMBIGUOUS.has(char)).join('')
        : SETS[kind],
    );
  const all = kinds.join('');

  const chars = kinds.map(pickFrom);
  while (chars.length < settings.length) chars.push(pickFrom(all));

  // Fisher–Yates, so the guaranteed characters are not always up front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomBelow(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join('');
}

/** Bits of entropy in a password this generator makes with these options. */
export function generatorEntropy(options: Partial<GeneratorOptions> = {}): number {
  const settings = normaliseGenerator(options);
  const size = (Object.keys(SETS) as (keyof typeof SETS)[])
    .filter((kind) => settings[kind])
    .reduce(
      (sum, kind) =>
        sum + (settings.avoidAmbiguous ? [...SETS[kind]].filter((char) => !AMBIGUOUS.has(char)).length : SETS[kind].length),
      0,
    );
  return Math.floor(settings.length * Math.log2(size));
}
