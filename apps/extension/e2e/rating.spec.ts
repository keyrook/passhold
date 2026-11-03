import type { Page } from '@playwright/test';
import { addLogin, expect, setUp, test } from './fixtures.js';

const DAY = 24 * 60 * 60 * 1000;
const state = (popup: Page) => popup.evaluate(async () => (await chrome.storage.local.get('ph.rating'))['ph.rating']);
const seed = async (popup: Page, rating: object) => {
  await popup.evaluate((value) => chrome.storage.local.set({ 'ph.rating': value }), rating);
  await popup.reload();
};
const READY = { firstFillAt: Date.now() - 8 * DAY, fills: 15, snoozes: 0, snoozedUntil: null, done: false };

test('the question about a rating comes after a week and fifteen fills, and "Not now" puts it off', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, { title: 'Example', username: 'alice', password: 'pw-1-long-enough', url: 'https://example.test' });
  await expect(popup.getByTestId('rating')).toHaveCount(0);

  await seed(popup, { ...READY, fills: 14 });
  await expect(popup.getByRole('button', { name: /Example/ })).toBeVisible();
  await expect(popup.getByTestId('rating')).toHaveCount(0);

  await seed(popup, READY);
  const ask = popup.getByTestId('rating');
  await expect(ask).toContainText('Finding Passhold useful?');
  await ask.getByRole('button', { name: 'Not now' }).click();
  await expect(ask).toHaveCount(0);
  expect(await state(popup)).toMatchObject({ snoozes: 1, done: false });
  expect((await state(popup)).snoozedUntil).toBeGreaterThan(Date.now() + 59 * DAY);
  await popup.reload();
  await expect(popup.getByRole('button', { name: /Example/ })).toBeVisible();
  await expect(popup.getByTestId('rating')).toHaveCount(0);
});

test('"Rate it" opens the store’s page in a new tab, and is never asked again', async ({ context, extensionId }) => {
  // Nothing is fetched from the store: the tab is only seen to go there.
  const asked: string[] = [];
  await context.route(/chromewebstore\.google\.com|microsoftedge\.microsoft\.com/, (route) => {
    asked.push(route.request().url());
    return route.abort();
  });
  const popup = await setUp(context, extensionId);
  await addLogin(popup, { title: 'Example', username: 'alice', password: 'pw-1-long-enough', url: 'https://example.test' });
  await seed(popup, { ...READY, snoozes: 1, snoozedUntil: Date.now() - DAY });
  await popup.getByTestId('rating').getByRole('link', { name: 'Rate it' }).click();
  await expect.poll(() => asked).toEqual(['https://chromewebstore.google.com/detail/kpdeebmeokoggpcjbnabffjejppaecng/reviews']);
  await expect(popup.getByTestId('rating')).toHaveCount(0);
  await expect.poll(() => state(popup)).toMatchObject({ done: true });
  await popup.reload();
  await expect(popup.getByRole('button', { name: /Example/ })).toBeVisible();
  await expect(popup.getByTestId('rating')).toHaveCount(0);
});
