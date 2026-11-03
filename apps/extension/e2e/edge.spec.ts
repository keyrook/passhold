import { asEdge, expect, test } from './fixtures.js';

test.describe('on Edge', () => {
  test('speaks of Edge, and sends nobody to Google Password Manager, which Edge does not have', async ({ context, extensionId }) => {
    const edge = await context.newPage();
    await asEdge(context, edge);
    await edge.goto(`chrome-extension://${extensionId}/options.html#signin`);
    await expect(edge.getByText('The first time, Edge asks to let Passhold use it.', { exact: false })).toBeVisible();
    await expect(edge.getByText(/Chrome|Google Password Manager/)).toHaveCount(0);

    // In Chrome, Chrome.
    const chrome = await context.newPage();
    await chrome.goto(`chrome-extension://${extensionId}/options.html#signin`);
    await expect(chrome.getByText('The first time, Chrome asks to let Passhold use it.', { exact: false })).toBeVisible();
  });
});
