import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { format } from '../src/i18n/format.js';
import { detectLocale, LOADERS, LOCALES } from '../src/i18n/locales.js';
import { en } from '../src/i18n/locales/en.js';
import { localeProblems, STORE_COPIES, storeProblems, termsProblems, type StoreLocale, type StoreTerms } from './locale-rules.js';
import { ACCOUNT_SENTENCES, accountSentenceKey, SERVER_SENTENCES, sentenceKey } from '../src/background/sentences.js';

const SRC = resolve(import.meta.dirname, '../src');
const STORE = resolve(import.meta.dirname, '../store');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

describe('languages', () => {
  it.each(LOCALES.filter((code) => code !== 'en'))('%s says everything English says, with the same placeholders and tags, in every plural form it has', async (code) => {
    expect(localeProblems(code, await LOADERS[code as keyof typeof LOADERS]())).toEqual([]);
  });

  // Each language Passhold speaks is listed in it too: a listing in one language and an extension in another is an uninstall.
  it.each([...LOCALES, ...STORE_COPIES])('%s has a store listing each store takes', (code) => {
    const store = JSON.parse(readFileSync(resolve(STORE, `locales/${code}.json`), 'utf8')) as StoreLocale;
    expect(storeProblems(code, store, readFileSync(resolve(STORE, `listings/${code}.txt`), 'utf8'))).toEqual([]);
  });

  it.each([...LOCALES, ...STORE_COPIES])('%s has search terms and captions each store takes, and its name\u2019s phrase in the summary and the listing\u2019s first sentence', (code) => {
    const store = JSON.parse(readFileSync(resolve(STORE, `locales/${code}.json`), 'utf8')) as StoreLocale;
    const terms = JSON.parse(readFileSync(resolve(STORE, `terms/${code}.json`), 'utf8')) as StoreTerms;
    expect(termsProblems(code, terms, store, readFileSync(resolve(STORE, `listings/${code}.txt`), 'utf8'))).toEqual([]);
  });

  // Chrome lists them apart from English, so each needs its own listing; Passhold has nothing else to say in them.
  it.each(STORE_COPIES)('%s is English’s listing, word for word, and not a language the extension opens in', (code) => {
    expect((LOCALES as readonly string[]).includes(code)).toBe(false);
    for (const folder of ['locales/%.json', 'listings/%.txt', 'terms/%.json']) {
      const [from, to] = ['en', code].map((name) => readFileSync(resolve(STORE, folder.replace('%', name)), 'utf8'));
      expect(to).toBe(from);
    }
  });

  it('refuses a listing that names a browser, in any script, and takes the word inside another', () => {
    const store = { appName: 'Password Manager - Passhold', appDescription: 'A password manager for you.', commandOpen: 'Open' };
    const listing = `Passhold is a password manager by Keyrook. ${'x '.repeat(200)}`;
    expect(storeProblems('en', store, listing)).toEqual([]);
    expect(storeProblems('en', store, `${listing} Works in Chrome.`)).toEqual(['listing: names the browser Chrome']);
    expect(storeProblems('en', store, `${listing} Also on Edge.`)).toEqual(['listing: names the browser Edge']);
    expect(storeProblems('en', store, `${listing} General knowledge, a ledger.`)).toEqual([]);
    expect(storeProblems('ja', { ...store, appDescription: 'クローム用' }, listing)).toEqual(['appDescription: names the browser クローム']);
    expect(storeProblems('ko', { ...store, appName: '크롬 - Passhold' }, listing)).toEqual(['appName: names the browser 크롬']);
    const terms: StoreTerms = { searchTerms: ['chrome password manager'], captions: ['a', 'b', 'c', 'd', 'e'] };
    expect(termsProblems('en', terms, store, listing)).toEqual(['searchTerms: "chrome password manager" names the browser Chrome']);
    expect(termsProblems('en', { ...terms, searchTerms: ['autofill'], captions: ['a', 'b', 'c', 'd', 'Safari'] }, store, listing)).toEqual(['captions: "Safari" names the browser Safari']);
  });

  it('refuses search words a store would take for spam', () => {
    const store = { appName: 'Password Manager - Passhold', appDescription: 'A password manager for you.', commandOpen: 'Open' };
    const listing = `Passhold is a password manager. ${'x '.repeat(200)}`;
    const good: StoreTerms = { searchTerms: ['autofill', 'passkey manager'], captions: ['a', 'b', 'c', 'd', 'e'] };
    expect(termsProblems('en', good, store, listing)).toEqual([]);
    const bad = (terms: Partial<StoreTerms>, changed = store, text = listing) => termsProblems('en', { ...good, ...terms }, changed, text);
    expect(bad({ searchTerms: [] })).toHaveLength(1);
    expect(bad({ searchTerms: Array.from({ length: 8 }, (_, i) => `term ${i}`) })[0]).toMatch(/8, 1 to 7/);
    expect(bad({ searchTerms: ['x'.repeat(31)] })[0]).toMatch(/over 30/);
    expect(bad({ searchTerms: ['one two three', 'four five six', 'seven eight nine', 'ten eleven twelve', 'a b c', 'd e f', 'g h i', 'j'] })).toEqual(expect.arrayContaining([expect.stringMatching(/searchTerms: 8, 1 to 7/)]));
    expect(bad({ searchTerms: ['a b c d e f g', 'h i j k l m n', 'o p q r s t u', 'v'] })[0]).toMatch(/22 words/);
    expect(bad({ searchTerms: ['better than Bitwarden'] })[0]).toMatch(/names Bitwarden/);
    expect(bad({ searchTerms: ['autofill', 'Autofill'] })[0]).toMatch(/twice/);
    expect(bad({ captions: ['a', 'b', 'c', 'd'] })[0]).toMatch(/exactly 5/);
    expect(bad({ captions: ['a', 'b', 'c', 'd', 'e'.repeat(61)] })[0]).toMatch(/1 to 60/);
    expect(bad({}, { ...store, appDescription: 'Autofill and passkeys.' })[0]).toMatch(/never says "password manager"/);
    expect(bad({}, store, `${'x '.repeat(200)}Passhold is a password manager.`)[0]).toMatch(/first 300 characters/);
    expect(bad({}, store, `Passhold is a password manager. ${'password manager '.repeat(5)}`)[0]).toMatch(/6 times/);
    expect(bad({ searchTerms: ['autofill'] }, store, `Passhold is a password manager. ${'autofill '.repeat(6)}`)[0]).toMatch(/"autofill" 6 times/);
    expect(bad({}, { ...store, appName: 'Passhold' })[0]).toMatch(/the phrase people type/);
  });

  it('uses every message it defines, and defines every message it uses', () => {
    const source = files(SRC)
      .filter((path) => /\.(ts|tsx)$/.test(path) && !path.includes(`${join('i18n', 'locales')}`))
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');
    const dynamic = ['strength.', 'error.'];
    for (const key of Object.keys(en)) {
      if (dynamic.some((prefix) => key.startsWith(prefix))) continue;
      expect(source.includes(`'${key}'`), `${key} is never used`).toBe(true);
    }
    for (const [, key] of source.matchAll(/\bt\(\s*'([a-zA-Z]+\.[\w.]+)'/g)) {
      expect(key! in en, `${key} is used but not defined`).toBe(true);
    }
  });

  // A sentence typed straight into a page is a sentence one language never sees.
  it('has no words written straight into a page', () => {
    // The translator itself is the one file that handles text as text.
    for (const path of files(SRC).filter((file) => file.endsWith('.tsx') && !file.endsWith(join('i18n', 'react.tsx')))) {
      const text = readFileSync(path, 'utf8');
      const literal = [...text.matchAll(/(?<![=-])>\s*([A-Za-zÀ-ỹ][^<>{}();=]*?)\s*</g)].map((match) => match[1]!.trim()).filter(Boolean);
      expect(literal, path).toEqual([]);
    }
  });
});

/**
 * The Keyrook account's server writes English. Every sentence it can send
 * back — the kit lists them all (vendor/keyrook-account-kit, copied by `npm
 * run account`) — stands for a message here, so a person reads it in their
 * language. The published source has no kit.
 */
const KIT_MESSAGES = resolve(import.meta.dirname, '../../../vendor/keyrook-account-kit/messages.json');
describe('a message with its values in', () => {
  it('drops the message’s own tags, and keeps a value as it was given, tags and braces and all', () => {
    expect(format('Signed in as <b>{name}</b> ({email})', 'en', { name: 'Nguyễn <b>An</b> {email}', email: 'a@example.test' })).toBe(
      'Signed in as Nguyễn <b>An</b> {email} (a@example.test)',
    );
    expect(format({ one: '{count} login', other: '{count} logins' }, 'en', { count: 1200 })).toBe('1,200 logins');
  });
});

describe.skipIf(!existsSync(KIT_MESSAGES))('the account server’s sentences', () => {
  // A skipped describe still runs its body to collect what it would test, so
  // without the kit there must be nothing to read: reading it threw instead.
  const { server, account } = existsSync(KIT_MESSAGES)
    ? (JSON.parse(readFileSync(KIT_MESSAGES, 'utf8')) as { server: string[]; account: string[] })
    : { server: [], account: [] };

  it.each([
    ['the server', server, SERVER_SENTENCES],
    ['@keyrook/account', account, ACCOUNT_SENTENCES],
  ] as const)('from %s each stand for a message Passhold says, and none is placed that is no longer said', (_, listed, table) => {
    expect(listed.length).toBeGreaterThan(0);
    expect(listed.filter((sentence) => !(sentence in table))).toEqual([]);
    expect(Object.keys(table).filter((sentence) => !listed.includes(sentence))).toEqual([]);
    for (const key of Object.values(table)) if (key) expect(key in en, key).toBe(true);
  });

  it('are found as the server fills them in', () => {
    expect(sentenceKey('This account has started over too often lately. Try again after 2026-11-02.')).toEqual({ key: 'error.startOverTooOften', filled: '2026-11-02' });
    expect(sentenceKey('A code was sent a moment ago. You can ask for another in 42 seconds.')?.key).toBe('error.accountCodeWait');
    expect(sentenceKey('That is no longer kept.')).toEqual({ key: 'error.archiveGone', filled: null });
    expect(sentenceKey('Something the server never says.')).toBeUndefined();
    // Thrown by @keyrook/account, the rest of a sentence after its first part.
    expect(accountSentenceKey('The server asked for 1,000 KDF iterations, below the 600,000 this app requires.')).toBe('error.accountKdfRefused');
    expect(accountSentenceKey('The server answered for another account.')).toBe('error.accountServerWrong');
  });
});

describe('the language a browser asks for', () => {
  it.each<[string[], string]>([
    [['es-MX'], 'es-419'],
    [['es-AR', 'en'], 'es-419'],
    [['es-US'], 'es-419'],
    [['es-ES'], 'es'],
    [['es'], 'es'],
    [['es-419'], 'es-419'],
    [['pt'], 'pt-BR'],
    [['pt-PT'], 'pt-PT'],
    [['pt-AO'], 'pt-PT'],
    [['pt-MZ'], 'pt-PT'],
    [['nb'], 'no'],
    [['nb-NO'], 'no'],
    [['nn'], 'no'],
    [['no-NO'], 'no'],
    [['pl-PL'], 'pl'],
    [['sr-Latn'], 'sr'],
    [['sr-RS'], 'sr'],
    [['sv-SE'], 'sv'],
    [['sw-KE'], 'sw'],
    [['pt-br'], 'pt-BR'],
    [['pt-BR'], 'pt-BR'],
    [['zh'], 'zh-CN'],
    [['zh-CN'], 'zh-CN'],
    [['zh-cn'], 'zh-CN'],
    [['zh-Hans-HK'], 'zh-CN'],
    [['zh-SG'], 'zh-CN'],
    [['zh-TW'], 'zh-TW'],
    [['zh-tw'], 'zh-TW'],
    [['zh-HK'], 'zh-TW'],
    [['zh-MO'], 'zh-TW'],
    [['zh-Hant'], 'zh-TW'],
    [['zh-Hant-HK'], 'zh-TW'],
    [['zh-Hans-TW'], 'zh-CN'],
    [['tr-TR'], 'tr'],
    [['uk-UA'], 'uk'],
    [['in-ID'], 'id'],
    [['iw-IL'], 'he'],
    [['he-IL'], 'he'],
    [['ar-EG'], 'ar'],
    [['gu-IN'], 'gu'],
    [['tl'], 'fil'],
    [['tl-PH'], 'fil'],
    [['fil'], 'fil'],
    [['fa-IR'], 'fa'],
    [['fi-FI'], 'fi'],
    [['hi-IN'], 'hi'],
    [['id'], 'id'],
    [['de-AT'], 'de'],
    [['fr-CA'], 'fr'],
    [['it-CH'], 'it'],
    [['ja-JP'], 'ja'],
    [['ko-KR'], 'ko'],
    [['ru-RU'], 'ru'],
    [['en-GB'], 'en'],
    [['xx-YY', 'de'], 'de'],
    [['xx'], 'en'],
    [[], 'en'],
  ])('%j reads as %s', (preferred, expected) => {
    expect(detectLocale(preferred)).toBe(expected);
  });
});

