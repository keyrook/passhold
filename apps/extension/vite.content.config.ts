import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/**
 * The content scripts: each one self-contained classic script, no imports, no
 * code splitting — what Chrome loads for a declared content script. They run
 * in every page, so they carry no React and none of the vault code. Built one
 * at a time (`PASSHOLD_CONTENT`): content.js, and for websites' passkeys
 * bridge.js beside it and webauthn.js in the page's own world.
 */
const entry = process.env.PASSHOLD_CONTENT ?? 'content';
if (!['content', 'bridge', 'webauthn'].includes(entry)) throw new Error(`No content script called ${entry}.`);
export default defineConfig({
  resolve: {
    alias: {
      '@keyrook/brand': resolve(import.meta.dirname, '../../vendor/keyrook-brand/src/index.ts'),
      '~': resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    outDir: process.env.PASSHOLD_DIST ?? 'dist',
    emptyOutDir: false,
    target: 'chrome120',
    sourcemap: false,
    lib: {
      entry: resolve(import.meta.dirname, entry === 'content' ? 'src/content/index.ts' : `src/content/${entry}.ts`),
      formats: ['iife'],
      name: 'Passhold',
      fileName: () => `${entry}.js`,
    },
  },
});
