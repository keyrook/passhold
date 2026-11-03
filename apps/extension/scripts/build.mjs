/**
 * Builds the extension into dist/, and with --zip the store upload into
 * ../../release/.
 *
 * The icons come from the brand kit as they are (vendor/keyrook-brand, copied
 * from ../keyrook-brand by `npm run brand`): Passhold's mark is
 * drawn there with the rest of Keyrook's family, never here.
 */
import { execFileSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkApi, checkStoreUpload, OFFICIAL_API, TEST_API } from './api.mjs';
import { buildManifest, STORE_LOCALES } from './manifest.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// `--test`: the end-to-end suite's build, talking to the account's server from
// the kit on this machine. `--local`: the same server, for trying by hand.
// Each is built apart, so the one loaded
// unpacked from dist/ is never one of them: each folder is its own extension
// to Chrome, and the server has to be told its id.
const LOCAL_DIST = resolve(root, '../../.tmp/extension-local');
const testBuild = process.argv.includes('--test');
const localBuild = process.argv.includes('--local');
const dist = testBuild ? resolve(root, '../../.tmp/extension-test') : localBuild ? LOCAL_DIST : resolve(root, 'dist');
const api = checkApi(testBuild || localBuild ? TEST_API : OFFICIAL_API);
if (process.argv.includes('--zip') && api !== OFFICIAL_API) throw new Error('A store upload talks to the official server only.');
const brand = resolve(root, '../../vendor/keyrook-brand/assets');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

const run = (command, args, env = {}) =>
  execFileSync(command, args, { cwd: root, stdio: 'inherit', env: { ...process.env, PASSHOLD_DIST: dist, KEYROOK_API: api, ...env } });

rmSync(dist, { recursive: true, force: true });

console.log('▸ Building pages + service worker');
run('npx', ['vite', 'build']);

for (const script of ['content', 'bridge', 'webauthn']) {
  console.log(`\n▸ Building content script: ${script}.js`);
  run('npx', ['vite', 'build', '--config', 'vite.content.config.ts'], { PASSHOLD_CONTENT: script });
}

console.log('\n▸ Icons, locales, manifest');
mkdirSync(resolve(dist, 'icons'), { recursive: true });
for (const size of [16, 32, 48, 128]) {
  copyFileSync(resolve(brand, `passhold-icon-${size}.png`), resolve(dist, 'icons', `icon-${size}.png`));
}
for (const [code, messages] of Object.entries(STORE_LOCALES)) {
  mkdirSync(resolve(dist, '_locales', code), { recursive: true });
  const json = Object.fromEntries(Object.entries(messages).map(([key, message]) => [key, { message }]));
  writeFileSync(resolve(dist, '_locales', code, 'messages.json'), `${JSON.stringify(json, null, 2)}\n`);
}
// Built at, to the minute, on this machine's clock: on the card in chrome://extensions.
const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const built = process.argv.includes('--zip')
  ? undefined
  : `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
writeFileSync(resolve(dist, 'manifest.json'), `${JSON.stringify(buildManifest({ version: pkg.version, api, built, test: testBuild }), null, 2)}\n`);

if (process.argv.includes('--zip')) {
  const releases = resolve(root, '../../release');
  mkdirSync(releases, { recursive: true });
  const archive = resolve(releases, `passhold-${pkg.version}.zip`);
  rmSync(archive, { force: true });
  // The same bytes from the same source on any machine: one date, one mode,
  // sorted entries, UTC timestamps; no directory entries or resource forks.
  const fixed = new Date('2020-01-01T00:00:00Z');
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else {
        chmodSync(path, 0o644);
        utimesSync(path, fixed, fixed);
        files.push(relative(dist, path).split(sep).join('/'));
      }
    }
  };
  walk(dist);
  files.sort();
  checkStoreUpload(files.map((file) => [file, readFileSync(resolve(dist, file))]));
  execFileSync('zip', ['-X', '-D', '-q', archive, '-@'], {
    cwd: dist,
    input: `${files.join('\n')}\n`,
    env: { ...process.env, TZ: 'UTC' },
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  console.log(`\n✓ Store upload: ${archive}`);
} else {
  console.log(`\n✓ Load unpacked from: ${dist}`);
}
