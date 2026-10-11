import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Each test launches its own Chromium profile with the extension; profiles
  // in parallel fight over nothing, but one at a time keeps failures readable.
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? 'line' : [['list']],
  use: { trace: 'retain-on-failure' },
  outputDir: '../../.tmp/test-results',
  projects: [
    { name: 'e2e', testDir: './e2e' },
    // Every screen in light and dark, for a person to look at: `npm run review`.
    { name: 'review', testDir: './review', timeout: 120_000 },
  ],
});
