import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import { accountPageFor, accountRpFor, checkApi, filesStoreFor, OFFICIAL_API, sendPageFor } from '../extension/scripts/api.mjs';
import { metaPolicy } from './headers.mjs';

const here = import.meta.dirname;
const api = checkApi(process.env.KEYROOK_API ?? OFFICIAL_API);
const version = (JSON.parse(readFileSync(resolve(here, 'package.json'), 'utf8')) as { version: string }).version;
const brand = resolve(here, '../../vendor/keyrook-brand/assets');

/** What "Add to Home Screen" reads: the page opens like an app, with no service worker and nothing kept. */
const MANIFEST = {
  name: 'Passhold',
  short_name: 'Passhold',
  description: 'Your passwords, in any browser.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: '#FBF8F2',
  theme_color: '#FBF8F2',
  icons: [
    { src: '/icons/passhold-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icons/passhold.svg', sizes: 'any', type: 'image/svg+xml' },
  ],
};

/**
 * The page as it is served: its policy in a `<meta>` (the host sends it as a
 * header too, with what a `<meta>` cannot carry: headers.mjs), every script
 * and stylesheet it loads with its `integrity`, and its icons and manifest
 * copied from the brand kit as they are. An asset changed on its own — by a
 * cache, by a mistake — is refused by the browser; whoever changes
 * `index.html` changes the hashes too, which is what the published list of
 * every file's hash is for.
 */
function served(): Plugin {
  return {
    name: 'passhold-web-served',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        let page = html.replace('<!--policy-->', `<meta http-equiv="Content-Security-Policy" content="${metaPolicy(api, filesStoreFor(api))}">`);
        const bundle = context.bundle;
        if (!bundle) return page;
        page = page.replace(/<(script|link)\b([^>]*?)\s(src|href)="\/([^"]+)"([^>]*)>/g, (whole, tag: string, before: string, attribute: string, path: string, after: string) => {
          const file = bundle[path];
          if (!file || !/\.(js|css)$/.test(path)) return whole;
          const bytes = file.type === 'chunk' ? file.code : file.source;
          const integrity = `sha384-${createHash('sha384').update(bytes).digest('base64')}`;
          const crossorigin = /crossorigin/.test(before + after) ? '' : ' crossorigin';
          return `<${tag}${before} ${attribute}="/${path}"${after} integrity="${integrity}"${crossorigin}>`;
        });
        return page;
      },
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: `${JSON.stringify(MANIFEST, null, 2)}\n` });
      this.emitFile({ type: 'asset', fileName: 'icons/passhold-512.png', source: readFileSync(resolve(brand, 'passhold-mark-512.png')) });
      this.emitFile({ type: 'asset', fileName: 'icons/passhold.svg', source: readFileSync(resolve(brand, 'passhold-mark.svg')) });
    },
  };
}

/**
 * Passhold's web vault: built only from a release tag, not minified, so it
 * reads beside its source, and the same bytes from two clean checkouts
 * (test/bundle.test.ts). Its one server is the account's, named at build
 * time and checked as the extension's is (../extension/scripts/api.mjs).
 */
export default defineConfig({
  root: here,
  base: '/',
  plugins: [react(), tailwindcss(), served()],
  resolve: {
    alias: {
      '@passhold/core': resolve(here, '../../packages/core/src/index.ts'),
      '@keyrook/account': resolve(here, '../../vendor/keyrook-account/src/index.ts'),
      '@keyrook/brand': resolve(here, '../../vendor/keyrook-brand/src/index.ts'),
    },
  },
  // The kit's tests serve the page here (`products: { passhold: [...] }`).
  server: { port: 5176, strictPort: true },
  preview: { port: 5176, strictPort: true },
  worker: { format: 'es' },
  build: {
    outDir: process.env.PASSHOLD_WEB_DIST ?? 'dist',
    emptyOutDir: true,
    target: ['es2022', 'safari16', 'chrome111', 'firefox115'],
    minify: false,
    sourcemap: false,
    // No preload helper written into the page: the scripts it loads are named, hashed and nothing else.
    modulePreload: { polyfill: false },
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    __KEYROOK_API__: JSON.stringify(api),
    __KEYROOK_ACCOUNT_PAGE__: JSON.stringify(accountPageFor(api)),
    __KEYROOK_ACCOUNT_RP__: JSON.stringify(accountRpFor(api)),
    // Named by a screen the page shares and never shows (a Send waits until after launch); defined, so it cannot throw.
    __KEYROOK_SEND_PAGE__: JSON.stringify(sendPageFor(api)),
    __PASSHOLD_VERSION__: JSON.stringify(version),
  },
});
