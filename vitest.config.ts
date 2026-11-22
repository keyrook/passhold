import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@passhold/core': resolve(import.meta.dirname, 'packages/core/src/index.ts'),
      '@keyrook/brand': resolve(import.meta.dirname, 'vendor/keyrook-brand/src/index.ts'),
      '@keyrook/account': resolve(import.meta.dirname, 'vendor/keyrook-account/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    // Many files run the account's server from the kit side by side, and the web vault's is built twice:
    // a test that waits on them takes longer under that load than alone, and is not wrong for it.
    testTimeout: 30_000,
    include: ['packages/**/test/**/*.test.ts', 'apps/extension/test/**/*.test.ts', 'apps/cli/test/**/*.test.ts', 'apps/android/test/**/*.test.ts', 'apps/web/test/**/*.test.ts'],
  },
});
