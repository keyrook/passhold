import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/**
 * One file with the core and the account's code in it and nothing to install
 * beside it: Node's own modules are all it needs.
 *
 * - `dist/passhold.mjs`, the npm package's program, run by the Node a person
 *   has.
 * - `--mode sea`: `dist/sea/passhold.cjs`, the same as CommonJS, which is all
 *   a single executable (Node's SEA) runs as its main script. The programs
 *   for macOS, Linux and Windows are made from it (scripts/release.mjs).
 */
export default defineConfig(({ mode }) => {
  const sea = mode === 'sea';
  return {
    resolve: {
      alias: {
        '@passhold/core': resolve(import.meta.dirname, '../../packages/core/src/index.ts'),
        '@keyrook/account': resolve(import.meta.dirname, '../../vendor/keyrook-account/src/index.ts'),
      },
    },
    ssr: { noExternal: true },
    build: {
      ssr: resolve(import.meta.dirname, 'src/main.ts'),
      outDir: sea ? 'dist/sea' : 'dist',
      emptyOutDir: true,
      target: 'node22',
      minify: false,
      rollupOptions: {
        output: sea ? { format: 'cjs', entryFileNames: 'passhold.cjs' } : { entryFileNames: 'passhold.mjs', banner: '#!/usr/bin/env node' },
      },
    },
  };
});
