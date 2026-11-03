/**
 * The languages Passhold speaks, and how one is chosen. English is the source
 * and the fallback for any text a translation lacks. Adding a language is one
 * file in `locales/`, a line in each table below and its store files in
 * `store/`; test/i18n.test.ts holds it to English's keys.
 */
import type { Dictionary } from './locales/en.js';

export const LOCALES = ['en', 'vi', 'es', 'es-419', 'pt-BR', 'de', 'fr', 'it', 'ja', 'ko', 'zh-CN', 'ru', 'id', 'ar', 'am', 'bg', 'bn', 'ca', 'cs', 'da', 'el', 'et', 'gu', 'he', 'hi', 'hr', 'hu', 'kn', 'fa', 'fi', 'fil', 'mr', 'ms', 'nl', 'ro', 'sk', 'sl', 'lt', 'lv', 'ml', 'no', 'pl', 'pt-PT', 'sr', 'sv', 'sw', 'ta', 'te', 'th', 'tr', 'uk', 'zh-TW'] as const;
export type Locale = (typeof LOCALES)[number];

/** Each language by its own name, as the picker lists it. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
  es: 'Español (España)',
  'es-419': 'Español (Latinoamérica)',
  'pt-BR': 'Português (Brasil)',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  'zh-CN': '简体中文',
  ru: 'Русский',
  id: 'Bahasa Indonesia',
  ar: 'العربية',
  am: 'አማርኛ',
  bg: 'Български',
  bn: 'বাংলা',
  ca: 'Català',
  cs: 'Čeština',
  da: 'Dansk',
  el: 'Ελληνικά',
  et: 'Eesti',
  gu: 'ગુજરાતી',
  he: 'עברית',
  hi: 'हिन्दी',
  hr: 'Hrvatski',
  hu: 'Magyar',
  kn: 'ಕನ್ನಡ',
  fa: 'فارسی',
  fi: 'Suomi',
  fil: 'Filipino',
  mr: 'मराठी',
  ms: 'Bahasa Melayu',
  nl: 'Nederlands',
  ro: 'Română',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  lt: 'Lietuvių',
  lv: 'Latviešu',
  ml: 'മലയാളം',
  no: 'Norsk bokmål',
  pl: 'Polski',
  'pt-PT': 'Português (Portugal)',
  sr: 'Српски',
  sv: 'Svenska',
  sw: 'Kiswahili',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  th: 'ไทย',
  tr: 'Türkçe',
  uk: 'Українська',
  'zh-TW': '繁體中文',
};

export const RTL_LOCALES = new Set<Locale>(['ar', 'fa', 'he']);

export const LOADERS: Record<Exclude<Locale, 'en'>, () => Promise<Dictionary>> = {
  vi: () => import('./locales/vi.js').then((module) => module.dictionary),
  es: () => import('./locales/es.js').then((module) => module.dictionary),
  'es-419': () => import('./locales/es-419.js').then((module) => module.dictionary),
  'pt-BR': () => import('./locales/pt-BR.js').then((module) => module.dictionary),
  de: () => import('./locales/de.js').then((module) => module.dictionary),
  fr: () => import('./locales/fr.js').then((module) => module.dictionary),
  it: () => import('./locales/it.js').then((module) => module.dictionary),
  ja: () => import('./locales/ja.js').then((module) => module.dictionary),
  ko: () => import('./locales/ko.js').then((module) => module.dictionary),
  'zh-CN': () => import('./locales/zh-CN.js').then((module) => module.dictionary),
  ru: () => import('./locales/ru.js').then((module) => module.dictionary),
  id: () => import('./locales/id.js').then((module) => module.dictionary),
  ar: () => import('./locales/ar.js').then((module) => module.dictionary),
  am: () => import('./locales/am.js').then((module) => module.dictionary),
  bg: () => import('./locales/bg.js').then((module) => module.dictionary),
  bn: () => import('./locales/bn.js').then((module) => module.dictionary),
  ca: () => import('./locales/ca.js').then((module) => module.dictionary),
  cs: () => import('./locales/cs.js').then((module) => module.dictionary),
  da: () => import('./locales/da.js').then((module) => module.dictionary),
  el: () => import('./locales/el.js').then((module) => module.dictionary),
  et: () => import('./locales/et.js').then((module) => module.dictionary),
  gu: () => import('./locales/gu.js').then((module) => module.dictionary),
  he: () => import('./locales/he.js').then((module) => module.dictionary),
  hi: () => import('./locales/hi.js').then((module) => module.dictionary),
  hr: () => import('./locales/hr.js').then((module) => module.dictionary),
  hu: () => import('./locales/hu.js').then((module) => module.dictionary),
  kn: () => import('./locales/kn.js').then((module) => module.dictionary),
  fa: () => import('./locales/fa.js').then((module) => module.dictionary),
  fi: () => import('./locales/fi.js').then((module) => module.dictionary),
  fil: () => import('./locales/fil.js').then((module) => module.dictionary),
  mr: () => import('./locales/mr.js').then((module) => module.dictionary),
  ms: () => import('./locales/ms.js').then((module) => module.dictionary),
  nl: () => import('./locales/nl.js').then((module) => module.dictionary),
  ro: () => import('./locales/ro.js').then((module) => module.dictionary),
  sk: () => import('./locales/sk.js').then((module) => module.dictionary),
  sl: () => import('./locales/sl.js').then((module) => module.dictionary),
  lt: () => import('./locales/lt.js').then((module) => module.dictionary),
  lv: () => import('./locales/lv.js').then((module) => module.dictionary),
  ml: () => import('./locales/ml.js').then((module) => module.dictionary),
  no: () => import('./locales/no.js').then((module) => module.dictionary),
  pl: () => import('./locales/pl.js').then((module) => module.dictionary),
  'pt-PT': () => import('./locales/pt-PT.js').then((module) => module.dictionary),
  sr: () => import('./locales/sr.js').then((module) => module.dictionary),
  sv: () => import('./locales/sv.js').then((module) => module.dictionary),
  sw: () => import('./locales/sw.js').then((module) => module.dictionary),
  ta: () => import('./locales/ta.js').then((module) => module.dictionary),
  te: () => import('./locales/te.js').then((module) => module.dictionary),
  th: () => import('./locales/th.js').then((module) => module.dictionary),
  tr: () => import('./locales/tr.js').then((module) => module.dictionary),
  uk: () => import('./locales/uk.js').then((module) => module.dictionary),
  'zh-TW': () => import('./locales/zh-TW.js').then((module) => module.dictionary),
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Spanish as Latin America speaks it, by region. CLDR gives `es-US` the same words, so it counts too. */
const LATIN_AMERICAN = new Set(['419', 'ar', 'bo', 'cl', 'co', 'cr', 'cu', 'do', 'ec', 'gt', 'hn', 'mx', 'ni', 'pa', 'pe', 'pr', 'py', 'sv', 'us', 'uy', 've']);

/** The first of the browser's languages that Passhold speaks. */
export function detectLocale(preferred: readonly string[]): Locale {
  for (const tag of preferred) {
    const locale = localeOf(tag);
    if (locale) return locale;
  }
  return 'en';
}

/**
 * The language one browser tag asks for: its exact tag, then the variants a
 * language stands for, then its base language. The variants come before the
 * base, or `es-MX` would read as Spain's Spanish. Traditional Chinese
 * (`zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant`) reads as `zh-TW`, never as the
 * Simplified `zh-CN`.
 */
function localeOf(tag: string): Locale | undefined {
  const parts = tag.toLowerCase().split('-');
  const [base, ...rest] = parts;
  const region = rest.find((part) => /^([a-z]{2}|\d{3})$/.test(part));
  const exact = LOCALES.find((locale) => locale.toLowerCase() === parts.join('-'));
  if (exact) return exact;
  if (base === 'es' && region && LATIN_AMERICAN.has(region)) return 'es-419';
  if (base === 'zh' && (rest.length === 0 || rest[0] === 'hans' || region === 'sg')) return 'zh-CN';
  if (base === 'zh' && (region === 'tw' || region === 'hk' || region === 'mo' || rest[0] === 'hant')) return 'zh-TW';
  if (base === 'nb' || base === 'nn') return 'no';
  if (base === 'pt') return region && region !== 'br' ? 'pt-PT' : 'pt-BR';
  if (base === 'in') return 'id';
  if (base === 'iw') return 'he';
  if (base === 'tl') return 'fil';
  return LOCALES.find((locale) => locale.toLowerCase() === base);
}
