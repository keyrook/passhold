import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { API_SERVICES } from '../../../packages/core/src/brand/apis.js';
import { metaPolicy } from '../headers.mjs';

/**
 * React's own writes of markup, in react-dom, each reachable only from
 * `dangerouslySetInnerHTML` or a `<script>` element, neither of which the web
 * vault draws: the bundle test holds the source to that, and the page's
 * Trusted Types refuse either anyway. Nothing else in the page may write
 * markup.
 */
const REACT_MARKUP = [
  'if ("http://www.w3.org/2000/svg" !== a.namespaceURI || "innerHTML" in a) a.innerHTML = b;',
  'mb.innerHTML = "<svg>" + b.valueOf().toString() + "</svg>";',
  'a.innerHTML = "<script><\\/script>"',
  '"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"',
];

/** Addresses the page names without reaching them: XML's namespaces, the page React's errors point to, and Tailwind's licence line. */
const NAMED = ['http://www.w3.org/1999/xhtml', 'http://www.w3.org/2000/svg', 'http://www.w3.org/1999/xlink', 'http://www.w3.org/XML/1998/namespace', 'http://www.w3.org/1998/Math/MathML', 'https://reactjs.org/docs/error-decoder.html', 'https://tailwindcss.com'];

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });

/**
 * What the built page must never hold, as the web vault's design lists it.
 * The page is sent by a server each time it
 * opens; this is what anyone can check it against. Each finding comes back
 * as `file: what`; none, and the build is clean.
 */
export function audit(dist: string, api: string, filesStore: string | null, accountPage: string): string[] {
  const all = files(dist);
  const own = new Set(all.map((path) => `/${relative(dist, path).split('\\').join('/')}`));
  // Beside the account's addresses, the pages where each service an API key is for makes a new one: links its
  // owner follows, never reached by the page itself (its policy lets it reach the account's two addresses alone).
  const replaced = API_SERVICES.flatMap((service) => (service.replace ? [service.replace] : []));
  const allowed = new Set([api, accountPage, ...(filesStore ? [filesStore] : []), ...NAMED, ...replaced].map((url) => url.replace(/\/$/, '')));
  const found: string[] = [];
  for (const path of all) {
    const name = relative(dist, path);
    if (!/\.(js|css|html|webmanifest|svg)$/.test(name)) continue;
    let text = readFileSync(path, 'utf8');
    for (const markup of REACT_MARKUP) text = text.split(markup).join('');
    for (const [pattern, what] of [
      [/\beval\s*\(/, 'eval('],
      [/new\s+Function\b/, 'new Function'],
      [/innerHTML/, 'innerHTML'],
      [/outerHTML/, 'outerHTML'],
      [/insertAdjacentHTML/, 'insertAdjacentHTML'],
      // React reads the prop by name; only a page that draws markup ever sets it.
      [/[{,]\s*(dangerouslySetInnerHTML|__html)\s*:/, 'dangerouslySetInnerHTML'],
      [/document\.write/, 'document.write'],
      [/srcdoc/, 'srcdoc'],
      [/localStorage/, 'localStorage'],
      [/indexedDB/i, 'indexedDB'],
      [/\bcaches\s*\.|CacheStorage/, 'the Cache API'],
      [/serviceWorker/, 'a service worker'],
      [/importScripts/, 'importScripts'],
    ] as const) {
      if (pattern.test(text)) found.push(`${name}: ${what}`);
    }
    // sessionStorage holds two things, each under its own key: the tab's sign-in, and a Google or GitHub sign-in across its redirect.
    for (const use of text.matchAll(/sessionStorage\s*(\.\s*\w+\s*\(\s*([^,)]*))?/g)) {
      if (!/^\.\s*(getItem|setItem|removeItem)/.test(use[1] ?? '') || !/^(SESSION_KEY|OAUTH_KEY|["']passhold\.web\.(session|oauth)["'])$/.test((use[2] ?? '').trim())) {
        found.push(`${name}: ${use[0]}`);
      }
    }
    for (const url of text.matchAll(/https?:\/\/[^\s"'`<>);\\]*/g)) {
      const address = url[0].replace(/\/$/, '');
      // An address made from a login's own site, as a link to it: `https://${site}`.
      if (address === 'https://${' || /^https:\/\/\$\{\w*\}?$/.test(address)) continue;
      if (!allowed.has(address) && !allowed.has(address.split('?')[0]!)) found.push(`${name}: ${url[0]}`);
    }
    if (name.endsWith('.html')) found.push(...page(dist, name, text, own, api, filesStore));
  }
  return found;
}

/** The page itself: its policy, and nothing it loads but its own files, each with the hash it must have. */
function page(dist: string, name: string, text: string, own: Set<string>, api: string, filesStore: string | null): string[] {
  const found: string[] = [];
  if (!text.includes(`<meta http-equiv="Content-Security-Policy" content="${metaPolicy(api, filesStore)}">`)) found.push(`${name}: not its policy`);
  for (const tag of text.matchAll(/<(script|link)\b[^>]*>/g)) {
    const source = tag[0].match(/\b(?:src|href)\s*=\s*["']?([^"'\s>]+)/)?.[1];
    if (tag[1] === 'script' && !source) {
      found.push(`${name}: a script written into the page`);
      continue;
    }
    if (!source) continue;
    if (!own.has(source)) {
      found.push(`${name}: ${tag[0]}`);
      continue;
    }
    const loads = tag[1] === 'script' || /rel=["']?(stylesheet|modulepreload)/.test(tag[0]);
    if (!loads) continue;
    const integrity = tag[0].match(/\bintegrity="([^"]+)"/)?.[1];
    const actual = `sha384-${createHash('sha384').update(readFileSync(join(dist, source))).digest('base64')}`;
    if (integrity !== actual) found.push(`${name}: ${source} without the hash it has`);
  }
  return found;
}
