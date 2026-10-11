/**
 * The languages Passhold speaks, and how one is chosen. English is the source
 * and the fallback for any text a translation lacks. Adding a language is one
 * file in `locales/`, a line in each table below and its store entry in
 * `scripts/manifest.mjs`; test/i18n.test.ts holds it to English's keys.
 */
import type { Dictionary } from './locales/en.js';

export const LOCALES = ['en', 'vi'] as const;
export type Locale = (typeof LOCALES)[number];

/** Each language by its own name, as the picker lists it. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

export const RTL_LOCALES = new Set<Locale>();

export const LOADERS: Record<Exclude<Locale, 'en'>, () => Promise<Dictionary>> = {
  vi: () => import('./locales/vi.js').then((module) => module.vi),
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** The first of the browser's languages that Passhold speaks, by language and then by base. */
export function detectLocale(preferred: readonly string[]): Locale {
  for (const tag of preferred) {
    if (isLocale(tag)) return tag;
    const base = tag.split('-')[0]!.toLowerCase();
    if (isLocale(base)) return base;
  }
  return 'en';
}
