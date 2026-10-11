import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/**
 * The content script: one self-contained classic script, no imports, no
 * code splitting — what Chrome loads for a declared content script. It runs
 * in every page, so it carries no React and none of the vault code.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@keyrook/brand': resolve(import.meta.dirname, '../../vendor/keyrook-brand/src/index.ts'),
      '~': resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    target: 'chrome120',
    sourcemap: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/content/index.ts'),
      formats: ['iife'],
      name: 'Passhold',
      fileName: () => 'content.js',
    },
  },
});
