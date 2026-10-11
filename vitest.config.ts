import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@passhold/core': resolve(import.meta.dirname, 'packages/core/src/index.ts'),
      '@keyrook/brand': resolve(import.meta.dirname, 'vendor/keyrook-brand/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['packages/**/test/**/*.test.ts', 'apps/extension/test/**/*.test.ts'],
  },
});
