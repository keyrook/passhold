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
import { buildManifest, STORE_LOCALES } from './manifest.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const brand = resolve(root, '../../vendor/keyrook-brand/assets');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: 'inherit' });

rmSync(dist, { recursive: true, force: true });

console.log('▸ Building pages + service worker');
run('npx', ['vite', 'build']);

console.log('\n▸ Building content script');
run('npx', ['vite', 'build', '--config', 'vite.content.config.ts']);

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
writeFileSync(resolve(dist, 'manifest.json'), `${JSON.stringify(buildManifest({ version: pkg.version }), null, 2)}\n`);

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
