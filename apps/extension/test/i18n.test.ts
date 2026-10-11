import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { placeholdersOf, tagsOf } from '../src/i18n/format.js';
import { LOADERS, LOCALES } from '../src/i18n/locales.js';
import { en } from '../src/i18n/locales/en.js';

const SRC = resolve(import.meta.dirname, '../src');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

describe('languages', () => {
  it.each(LOCALES.filter((code) => code !== 'en'))('%s says everything English says, with the same placeholders and tags', async (code) => {
    const messages = await LOADERS[code as keyof typeof LOADERS]();
    expect(Object.keys(messages).sort()).toEqual(Object.keys(en).sort());
    const categories = new Set(new Intl.PluralRules(code).resolvedOptions().pluralCategories);
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(placeholdersOf(messages[key]), key).toEqual(placeholdersOf(en[key]));
      expect(tagsOf(messages[key]), key).toEqual(tagsOf(en[key]));
      const translated = messages[key];
      if (typeof translated !== 'string') {
        expect(typeof en[key], key).not.toBe('string');
        for (const form of Object.keys(translated)) expect(categories.has(form as Intl.LDMLPluralRule), `${key}.${form}`).toBe(true);
        expect(translated.other, key).toBeTruthy();
      }
    }
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
