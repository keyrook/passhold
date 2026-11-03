/**
 * A translation, checked before it is registered in src/i18n/locales.ts:
 *
 *   npm run locale:check -w @passhold/extension -- de pt-BR
 *
 * For each language: src/i18n/locales/<code>.ts against English, and its
 * store listing — store/locales/<code>.json, store/listings/<code>.txt and
 * store/terms/<code>.json — against each store's limits, by the
 * rules the tests apply (test/locale-rules.ts). Prints what is wrong, and
 * fails if anything is. en-GB, en-AU and en-US are the store's alone: no
 * messages to check.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { localeProblems, STORE_COPIES, storeProblems, termsProblems, type StoreLocale, type StoreTerms } from '../test/locale-rules.ts';

const STORE = resolve(import.meta.dirname, '../store');
const codes = process.argv.slice(2);
if (!codes.length) {
  console.error('Name the languages to check: npm run locale:check -w @passhold/extension -- de pt-BR');
  process.exit(2);
}

let failed = false;
for (const code of codes) {
  const problems: string[] = [];
  const file = resolve(import.meta.dirname, `../src/i18n/locales/${code}.ts`);
  if ((STORE_COPIES as readonly string[]).includes(code)) {
    // Chrome counts these as languages of their own; Passhold opens in English for them.
  } else if (!existsSync(file)) {
    problems.push(`no src/i18n/locales/${code}.ts`);
  } else {
    const module = (await import(/* @vite-ignore */ file)) as { dictionary?: Parameters<typeof localeProblems>[1]; en?: Parameters<typeof localeProblems>[1] };
    // English is the source, by its own name; every other language is `dictionary`.
    const messages = code === 'en' ? module.en : module.dictionary;
    if (messages) problems.push(...localeProblems(code, messages));
    else problems.push('no `export const dictionary: Dictionary`');
  }
  const store = resolve(STORE, `locales/${code}.json`);
  const listing = resolve(STORE, `listings/${code}.txt`);
  if (!existsSync(store)) problems.push(`no store/locales/${code}.json`);
  if (!existsSync(listing)) problems.push(`no store/listings/${code}.txt`);
  const terms = resolve(STORE, `terms/${code}.json`);
  if (!existsSync(terms)) problems.push(`no store/terms/${code}.json`);
  if (existsSync(store) && existsSync(listing)) {
    const locale = JSON.parse(readFileSync(store, 'utf8')) as StoreLocale;
    const text = readFileSync(listing, 'utf8');
    problems.push(...storeProblems(code, locale, text));
    if (existsSync(terms)) problems.push(...termsProblems(code, JSON.parse(readFileSync(terms, 'utf8')) as StoreTerms, locale, text));
  }
  failed ||= problems.length > 0;
  console.log(problems.length ? `✗ ${code}\n${problems.map((line) => `  ${line}`).join('\n')}` : `✓ ${code}`);
}
process.exit(failed ? 1 : 0);
