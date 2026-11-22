/**
 * The built page, as a browser is served it: what the design says it must
 * never hold, looked for in every file — and the check itself shown to catch
 * each of them, in a copy with one planted. Two builds of the same source are
 * the same bytes, so anyone can build the tag and compare it with what they
 * were served.
 */
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { build } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FILES_STORE, OFFICIAL_API } from '../../extension/scripts/api.mjs';
import { headers, policy } from '../headers.mjs';
import { audit } from './audit.js';

const ROOT = resolve(import.meta.dirname, '..');
const TMP = resolve(ROOT, '../../.tmp');
const ACCOUNT_PAGE = 'https://account.keyrook.com';
let scratch: string;
let first: string;
let second: string;

async function built(into: string): Promise<void> {
  // For the official server, as it would be uploaded.
  const mode = process.env.NODE_ENV;
  process.env.PASSHOLD_WEB_DIST = into;
  // React's production build, as served: the tests' own mode would bring its development one.
  process.env.NODE_ENV = 'production';
  delete process.env.KEYROOK_API;
  try {
    await build({ root: ROOT, configFile: join(ROOT, 'vite.config.ts'), logLevel: 'silent', mode: 'production' });
  } finally {
    delete process.env.PASSHOLD_WEB_DIST;
    process.env.NODE_ENV = mode;
  }
}

beforeAll(async () => {
  mkdirSync(TMP, { recursive: true });
  scratch = mkdtempSync(join(TMP, 'web-audit-'));
  first = join(scratch, 'first');
  second = join(scratch, 'second');
  await built(first);
  await built(second);
}, 240_000);
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const paths = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? paths(path) : [path];
  });
const every = (dir: string): string[] => paths(dir).map((path) => relative(dir, path));
const scriptOf = (dist: string) => join(dist, 'assets', readdirSync(join(dist, 'assets')).find((name) => name.endsWith('.js') && readFileSync(join(dist, 'index.html'), 'utf8').includes(name))!);

describe('the built page', () => {
  it('holds nothing it must not, and names no address but the account’s', () => {
    expect(audit(first, OFFICIAL_API, FILES_STORE, ACCOUNT_PAGE)).toEqual([]);
  });

  it('is the same bytes when built again from the same source', () => {
    const names = every(first).sort();
    expect(every(second).sort()).toEqual(names);
    for (const name of names) expect(readFileSync(join(second, name)).equals(readFileSync(join(first, name))), name).toBe(true);
  });

  it('starts its worker as a module of its own, under the page’s policy, and keeps nothing that would outlive a fix', () => {
    const assets = readdirSync(join(first, 'assets'));
    // The page's script and the worker's, and the stylesheet: no service worker, no manifest of cached files.
    expect(assets.filter((name) => name.endsWith('.js'))).toHaveLength(2);
    expect(every(first).some((name) => /sw\.js|service-worker|workbox/.test(name))).toBe(false);
    const manifest = JSON.parse(readFileSync(join(first, 'manifest.webmanifest'), 'utf8')) as { display: string; start_url: string };
    expect(manifest).toMatchObject({ display: 'standalone', start_url: '/' });
  });
});

describe('what the host sends with it', () => {
  it('is the policy of the design, with Trusted Types and the one policy name the page makes', () => {
    expect(policy(OFFICIAL_API, FILES_STORE)).toBe(
      `default-src 'none'; script-src 'self'; worker-src 'self'; style-src 'self'; img-src 'self' data:; connect-src ${OFFICIAL_API} ${FILES_STORE}; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; require-trusted-types-for 'script'; trusted-types passhold-worker`,
    );
    const sent = headers(OFFICIAL_API, FILES_STORE);
    expect(sent.page).toMatchObject({
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cache-Control': 'no-cache, no-store, no-transform',
    });
    expect(sent.page['Strict-Transport-Security']).toMatch(/max-age=\d+/);
  });
});

describe('the check itself', () => {
  const plants: [string, 'js' | 'html' | 'css', (text: string) => string][] = [
    ['eval', 'js', (text) => `${text}\neval("1");`],
    ['new Function', 'js', (text) => `${text}\nnew Function("return 1");`],
    ['innerHTML', 'js', (text) => `${text}\ndocument.body.innerHTML = "x";`],
    ['dangerouslySetInnerHTML', 'js', (text) => `${text}\nconst bad = { dangerouslySetInnerHTML: { __html: "x" } };`],
    ['localStorage', 'js', (text) => `${text}\nlocalStorage.setItem("k", "v");`],
    ['IndexedDB', 'js', (text) => `${text}\nindexedDB.open("vault");`],
    ['the Cache API', 'js', (text) => `${text}\ncaches.open("v1");`],
    ['a service worker', 'js', (text) => `${text}\nnavigator.serviceWorker.register("/sw.js");`],
    ['another sessionStorage key', 'js', (text) => `${text}\nsessionStorage.setItem("password", "v");`],
    ['sessionStorage cleared whole', 'js', (text) => `${text}\nsessionStorage.clear();`],
    ['sessionStorage read whole', 'js', (text) => `${text}\nconst all = sessionStorage;`],
    ['another address', 'js', (text) => `${text}\nfetch("https://collector.example/x");`],
    ['plain http elsewhere', 'js', (text) => `${text}\nfetch("http://localhost:9999/x");`],
    ['a script from elsewhere', 'html', (text) => text.replace('</head>', '<script src="https://cdn.example/x.js"></script></head>')],
    ['a script written in', 'html', (text) => text.replace('</head>', '<script>alert(1)</script></head>')],
    ['a stylesheet from elsewhere', 'html', (text) => text.replace('</head>', '<link rel="stylesheet" href="//fonts.example/x.css"></head>')],
    ['a script without its hash', 'html', (text) => text.replace(/ integrity="[^"]+"/, '')],
    ['a policy loosened', 'html', (text) => text.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")],
    ['an asset changed on its own', 'css', (text) => `${text}\nbody{background:red}`],
  ];

  for (const [what, kind, plant] of plants) {
    it(`catches ${what}`, () => {
      const copy = join(scratch, what.replace(/\W+/g, '-'));
      cpSync(first, copy, { recursive: true });
      const target =
        kind === 'html' ? join(copy, 'index.html') : kind === 'css' ? join(copy, 'assets', readdirSync(join(copy, 'assets')).find((name) => name.endsWith('.css'))!) : scriptOf(copy);
      writeFileSync(target, plant(readFileSync(target, 'utf8')));
      expect(audit(copy, OFFICIAL_API, FILES_STORE, ACCOUNT_PAGE)).not.toEqual([]);
    });
  }
});

describe('the source', () => {
  /** Every file the page is built from that the web vault and the extension share, and its own. */
  const sources = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? sources(path) : /\.(ts|tsx)$/.test(name) ? [path] : [];
    });

  it('draws no markup anywhere: no dangerouslySetInnerHTML, no innerHTML, in the web vault or the screens it shares', () => {
    const shared = ['src', '../extension/src/ui', '../extension/src/popup', '../extension/src/options', '../extension/src/lib', '../extension/src/i18n'];
    for (const path of shared.flatMap((dir) => sources(resolve(ROOT, dir)))) {
      const text = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
      expect([path, /dangerouslySetInnerHTML|\.innerHTML\b|outerHTML|insertAdjacentHTML/.test(text)]).toEqual([path, false]);
    }
  });
});
