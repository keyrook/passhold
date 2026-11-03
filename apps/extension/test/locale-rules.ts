/**
 * What every language Passhold speaks holds to, and its store listing: the
 * rules test/i18n.test.ts applies to the languages registered in
 * `src/i18n/locales.ts`, and `npm run locale:check` to a translation not
 * registered yet, so whoever writes one checks it before it is added.
 */
import { placeholdersOf, tagsOf, type Message } from '../src/i18n/format.js';
import { en } from '../src/i18n/locales/en.js';

/** The name, summary and shortcut's name, per language: what Chrome and the stores read from `_locales`. */
export interface StoreLocale {
  appName: string;
  appDescription: string;
  commandOpen: string;
}

const length = (text: string) => [...text].length;

/**
 * More than this share of messages the same as English is a file copied, not
 * translated. Names, `PIN`, `OK` and the like stay as they are, so a little
 * is to be expected.
 */
const UNTRANSLATED = 0.2;

/** A language's problems with its messages, as lines to read; none when it says everything English says. */
export function localeProblems(code: string, messages: Record<string, Message>): string[] {
  const problems: string[] = [];
  const keys = Object.keys(en) as (keyof typeof en)[];
  for (const key of keys) if (!(key in messages)) problems.push(`${key}: missing`);
  for (const key of Object.keys(messages)) if (!(key in en)) problems.push(`${key}: not a message English has`);
  let categories: Set<string>;
  try {
    categories = new Set(new Intl.PluralRules(code).resolvedOptions().pluralCategories);
  } catch {
    return [...problems, `${code}: not a language tag this browser knows`];
  }
  let same = 0;
  for (const key of keys) {
    const source: Message = en[key];
    const translated = messages[key];
    if (translated === undefined) continue;
    if (typeof translated === 'string' ? !translated.trim() : !translated.other?.trim()) problems.push(`${key}: empty`);
    if (JSON.stringify(placeholdersOf(translated)) !== JSON.stringify(placeholdersOf(source))) {
      problems.push(`${key}: placeholders ${placeholdersOf(translated).join(',') || '(none)'}, English has ${placeholdersOf(source).join(',') || '(none)'}`);
    }
    if (JSON.stringify(tagsOf(translated)) !== JSON.stringify(tagsOf(source))) {
      problems.push(`${key}: tags ${tagsOf(translated).join(',') || '(none)'}, English has ${tagsOf(source).join(',') || '(none)'}`);
    }
    if (typeof translated !== typeof source) {
      problems.push(`${key}: ${typeof source === 'string' ? 'a plain sentence in English' : 'plural forms in English'}`);
    } else if (typeof translated !== 'string') {
      // Every form the language has, and none it has not; `zero` may fall to `other`.
      for (const form of Object.keys(translated)) if (!categories.has(form)) problems.push(`${key}.${form}: ${code} has no such plural form`);
      for (const form of categories) if (form !== 'zero' && !(form in translated)) problems.push(`${key}.${form}: missing (${code} has ${[...categories].join(', ')})`);
    }
    if (JSON.stringify(translated) === JSON.stringify(source)) same++;
  }
  if (code !== 'en' && same / keys.length > UNTRANSLATED) problems.push(`${same} of ${keys.length} messages are word for word the English`);
  return problems;
}

/** Other password managers: a listing that names them is keyword spam to Chrome, and a refusal. */
const OTHERS = ['Bitwarden', '1Password', 'LastPass', 'Dashlane', 'NordPass', 'Proton', 'KeePass', 'Keeper', 'RoboForm', 'Enpass', 'iCloud Keychain', 'Apple Passwords'];

/**
 * Browsers by the names a listing could carry them under. Edge's policy 1.1.2
 * forbids naming another browser, and one package serves both stores, so none
 * is named — Edge and Chrome included. Latin names match whole words (a "knowledge"
 * is no Edge); the others, in their own scripts, wherever they stand.
 */
const BROWSER_WORDS = ['Chrome', 'Chromium', 'Firefox', 'Safari', 'Opera', 'Brave', 'Edge', 'Vivaldi'];
const BROWSER_SCRIPTS = ['クローム', 'ファイアフォックス', 'サファリ', '크롬', '파이어폭스', '사파리', 'Хром', 'Файрфокс', 'Сафари', 'Опера', '谷歌浏览器', '火狐', '歌浏览器', 'Chrome浏览器', 'كروم', 'فايرفوكس', 'سفاري', 'כרום', 'פיירפוקס', 'ספארי', 'โครม', 'ไฟร์ฟอกซ์', 'क्रोम', 'ক্রোম', 'குரோம்', 'క్రోమ్', 'ಕ್ರೋಮ್', 'ക്രോം', 'ક્રોમ', 'Κρομ', 'Φάιρφοξ'];
const browsersNamed = (text: string) => [
  ...BROWSER_WORDS.filter((name) => new RegExp(`(^|[^\\p{L}])${name}($|[^\\p{L}])`, 'iu').test(text)),
  ...BROWSER_SCRIPTS.filter((name) => text.includes(name)),
];

/**
 * A language's store listing: its name within Edge's 45 characters (Chrome
 * takes 75; one package serves both), its summary within Chrome's 132, and a
 * description Edge takes — 250 to 10,000 characters — naming no other
 * password manager and no term more than five times.
 */
export function storeProblems(code: string, store: StoreLocale, listing: string): string[] {
  const problems: string[] = [];
  if (!store.appName.includes('Passhold')) problems.push('appName: must carry the name Passhold');
  if (length(store.appName) > 45) problems.push(`appName: ${length(store.appName)} characters, over 45`);
  if (!store.appDescription.trim() || length(store.appDescription) > 132) problems.push(`appDescription: ${length(store.appDescription)} characters, 1 to 132`);
  if (!store.commandOpen.trim()) problems.push('commandOpen: empty');
  if (length(listing) < 250 || length(listing) > 10_000) problems.push(`listing: ${length(listing)} characters, 250 to 10,000`);
  for (const name of OTHERS) if (listing.toLowerCase().includes(name.toLowerCase())) problems.push(`listing: names ${name}`);
  for (const [where, text] of [['appName', store.appName], ['appDescription', store.appDescription], ['listing', listing]] as const) {
    for (const name of browsersNamed(text)) problems.push(`${where}: names the browser ${name}`);
  }
  const times = [...listing.matchAll(/Passhold/g)].length;
  if (times > 5) problems.push(`listing: Passhold ${times} times, over 5`);
  if (code !== 'en' && !/Keyrook/.test(listing)) problems.push('listing: never says Keyrook');
  return problems;
}

/**
 * Languages Chrome lists as its own that Passhold does not speak: the store's
 * words are the English ones, copied, and the extension opens in English.
 * Never in `LOCALES`.
 */
export const STORE_COPIES = ['en-GB', 'en-AU', 'en-US'] as const;

/** Edge's hidden search terms, and the five captions on the screenshots (store/terms/<code>.json). */
export interface StoreTerms {
  searchTerms: string[];
  captions: string[];
}

const TERMS_MAX = 7;
const TERM_LENGTH = 30;
const TERMS_WORDS = 21;
const CAPTIONS = 5;
const CAPTION_LENGTH = 60;
/** Chrome weighs the opening of a description most, and calls a keyword said more than this keyword spam. */
const OPENING = 300;
const MOST_TIMES = 5;

const occurrences = (text: string, phrase: string) => (phrase ? text.split(phrase).length - 1 : 0);

/**
 * A language's search words and captions: Edge's seven terms (30 characters
 * each, 21 words in all, a hyphen counting as a gap, as Edge counts it; no rival named), the five captions the screenshots
 * carry, and the phrase its name leads with — which the summary and the
 * listing's first sentence must say too, since Chrome reads all three, and
 * which, like each term, the listing says at most five times.
 */
export function termsProblems(code: string, terms: StoreTerms, store: StoreLocale, listing: string): string[] {
  const problems: string[] = [];
  const lower = (text: string) => text.toLocaleLowerCase(code);
  const { searchTerms, captions } = terms;
  if (!Array.isArray(searchTerms) || searchTerms.length < 1 || searchTerms.length > TERMS_MAX) {
    problems.push(`searchTerms: ${Array.isArray(searchTerms) ? searchTerms.length : 'not a list'}, 1 to ${TERMS_MAX}`);
  } else {
    for (const term of searchTerms) {
      if (typeof term !== 'string' || !term.trim()) problems.push('searchTerms: an empty term');
      else if (length(term) > TERM_LENGTH) problems.push(`searchTerms: "${term}" is ${length(term)} characters, over ${TERM_LENGTH}`);
      else {
        for (const name of OTHERS) if (lower(term).includes(lower(name))) problems.push(`searchTerms: "${term}" names ${name}`);
        for (const name of browsersNamed(term)) problems.push(`searchTerms: "${term}" names the browser ${name}`);
      }
    }
    const words = searchTerms.reduce((sum, term) => sum + String(term).trim().split(/[\s-]+/).filter(Boolean).length, 0);
    if (words > TERMS_WORDS) problems.push(`searchTerms: ${words} words, over ${TERMS_WORDS}`);
    if (new Set(searchTerms.map(lower)).size !== searchTerms.length) problems.push('searchTerms: a term twice');
  }
  if (!Array.isArray(captions) || captions.length !== CAPTIONS) {
    problems.push(`captions: ${Array.isArray(captions) ? captions.length : 'not a list'}, exactly ${CAPTIONS}`);
  } else {
    for (const caption of captions) {
      if (typeof caption !== 'string' || length(caption.trim()) < 1 || length(caption) > CAPTION_LENGTH) {
        problems.push(`captions: "${caption}" is ${typeof caption === 'string' ? length(caption) : 'not text'} characters, 1 to ${CAPTION_LENGTH}`);
      } else for (const name of browsersNamed(caption)) problems.push(`captions: "${caption}" names the browser ${name}`);
    }
  }

  const phrase = lower(store.appName.replace(/\s*[-–—]\s*Passhold$/, ''));
  if (!phrase || phrase === lower(store.appName)) {
    problems.push('appName: must be the phrase people type, then " - Passhold"');
  } else {
    if (!lower(store.appDescription).includes(phrase)) problems.push(`appDescription: never says "${phrase}", the name's phrase`);
    if (!lower([...listing].slice(0, OPENING).join('')).includes(phrase)) problems.push(`listing: "${phrase}", the name's phrase, is not in the first ${OPENING} characters`);
    const times = occurrences(lower(listing), phrase);
    if (times > MOST_TIMES) problems.push(`listing: "${phrase}" ${times} times, over ${MOST_TIMES}`);
  }
  if (Array.isArray(searchTerms)) {
    for (const term of searchTerms) {
      const times = occurrences(lower(listing), lower(String(term)));
      if (times > MOST_TIMES) problems.push(`listing: "${term}" ${times} times, over ${MOST_TIMES}`);
    }
  }
  return problems;
}
