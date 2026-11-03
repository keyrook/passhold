import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkStoreUpload, OFFICIAL_API, TEST_API } from '../scripts/api.mjs';
import { buildManifest } from '../scripts/manifest.mjs';

const extension = resolve(import.meta.dirname, '..');
const repository = resolve(extension, '../..');

const official = buildManifest({ version: '0.0.0', api: OFFICIAL_API }) as Record<string, unknown>;
const local = buildManifest({ version: '0.0.0', api: TEST_API }) as Record<string, unknown>;
const file = (text: string | object) => Buffer.from(typeof text === 'string' ? text : JSON.stringify(text));
const upload = (...files: [string, Buffer][]) => checkStoreUpload(files);

// What a build leaves behind: a refused one must not have touched either.
const left = () => [resolve(extension, 'dist'), resolve(repository, 'release')].map((path) => statSync(path, { throwIfNoEntry: false })?.mtimeMs);

// A store upload is the one build that reaches strangers, so it is tried here
// from every side another server's address could come in by.
describe('a store upload', () => {
  it('is refused before anything is built, whichever way the flags are given', { timeout: 60_000 }, () => {
    const before = left();
    for (const flags of [
      ['--zip', '--local'],
      ['--local', '--zip'],
      ['--zip', '--test'],
      ['--test', '--zip'],
      ['--zip', '--local', '--test'],
    ]) {
      // Refusing takes a moment. Were it to stop refusing, the timeout cuts the build short, and the last look still stands before any zip.
      const build = spawnSync(process.execPath, ['scripts/build.mjs', ...flags], { cwd: extension, encoding: 'utf8', timeout: 8_000 });
      expect(build.status, flags.join(' ')).not.toBe(0);
      expect(build.stderr, flags.join(' ')).toContain('A store upload talks to the official server only.');
    }
    expect(left()).toEqual(before);
  });

  it('carries nothing of the server on this machine when built for the official one', () => {
    expect(JSON.stringify(official)).not.toMatch(/127\.0\.0\.1|localhost:5174/);
    expect(() => upload(['manifest.json', file(official)])).not.toThrow();
  });

  it.each(['content_security_policy', 'externally_connectable', 'content_scripts'])(
    'stops at the last look if the manifest’s %s names another server',
    (field) => {
      // The local build's own value, or the test would plant something no build makes.
      expect(local[field]).not.toEqual(official[field]);
      expect(() => upload(['icons/icon-16.png', Buffer.alloc(16)], ['manifest.json', file({ ...official, [field]: local[field] })])).toThrow(/manifest\.json names/);
    },
  );

  it.each([
    ['the server on this machine', `fetch("${TEST_API}/auth/login")`],
    ['the kit’s page', 'href:"http://localhost:5174/#family"'],
  ])('stops at the last look for %s', (_, text) => {
    expect(() => upload(['background.js', file('ok')], ['chunks/passhold-core-abc123.js', file(text)])).toThrow(/passhold-core-abc123\.js names/);
  });

  it('reads a file as bytes, so one that is not text hides nothing', () => {
    const planted = Buffer.concat([Buffer.from([0xff, 0xfe, 0x00, 0x80]), file(TEST_API), Buffer.from([0x00, 0xc3])]);
    expect(() => upload(['assets/font.woff2', planted])).toThrow(/font\.woff2 names/);
  });

  it('cannot get the address from the source: only scripts/ names it', () => {
    const named: string[] = [];
    for (const folder of ['apps/extension/src', 'packages/core/src', 'vendor/keyrook-account/src', 'vendor/keyrook-brand/src']) {
      for (const entry of readdirSync(resolve(repository, folder), { recursive: true, withFileTypes: true })) {
        if (!entry.isFile()) continue;
        const path = join(entry.parentPath, entry.name);
        if (/127\.0\.0\.1:8799|localhost:5174/.test(readFileSync(path, 'latin1'))) named.push(path);
      }
    }
    expect(named).toEqual([]);
  });
});
