import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const alias = {
  '@passhold/core': resolve(import.meta.dirname, '../../packages/core/src/index.ts'),
  '@keyrook/brand': resolve(import.meta.dirname, '../../vendor/keyrook-brand/src/index.ts'),
  '~': resolve(import.meta.dirname, 'src'),
};

/**
 * The extension's pages and its service worker. The content script is built
 * on its own (vite.content.config.ts): Chrome loads a declared content script
 * as a classic script, so it must be one file with no imports.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'chrome120',
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: resolve(import.meta.dirname, 'popup.html'),
        options: resolve(import.meta.dirname, 'options.html'),
        menu: resolve(import.meta.dirname, 'menu.html'),
        prompt: resolve(import.meta.dirname, 'prompt.html'),
        offscreen: resolve(import.meta.dirname, 'offscreen.html'),
        background: resolve(import.meta.dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        // Library code and ours in separate, named files, so a store reviewer
        // opening the package can tell them apart at a glance.
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
          if (id.includes('packages/core')) return 'passhold-core';
          return undefined;
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
});
