import { addLogin, contentWorld, expect, MASTER, setUp, test } from './fixtures.js';

const ALICE = { title: 'Example', username: 'alice@example.test', password: 'Tr0ub4dor&3-unique', url: 'https://login.example.test/' };

/**
 * The content script runs in every page, so a page that takes over its
 * renderer holds the content script's world, and whatever it may do. These
 * run there what such a page would.
 */
test.describe('a page that took over its renderer', () => {
  test('can neither read nor write what Passhold keeps on disk', async ({ context, extensionId }) => {
    const popup = await setUp(context, extensionId);
    await addLogin(popup, ALICE);
    const page = await context.newPage();
    const run = await contentWorld(page, 'https://evil.test/form');
    const attempt = (call: string) => run(`${call}.then((value) => 'done: ' + JSON.stringify(value), (error) => 'refused: ' + error.message)`);

    // The sealed vault file, to guess the master password against offline; the device's and keys' copies of the key.
    for (const call of ['chrome.storage.local.get(null)', "chrome.storage.local.get(['ph.vault', 'ph.device', 'ph.keys'])", 'chrome.storage.session.get(null)']) {
      expect(await attempt(call), call).toMatch(/^refused: /);
    }
    // Writing over the vault, turning Passhold's offers off, or removing everything.
    for (const call of ["chrome.storage.local.set({ 'ph.vault': {} })", "chrome.storage.local.set({ 'ph.prefs': { offerToSave: false } })", "chrome.storage.local.remove('ph.vault')", 'chrome.storage.local.clear()']) {
      expect(await attempt(call), call).toMatch(/^refused: /);
    }

    // And the vault is as it was: locked, it opens with the master password, its login in it.
    await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/lock' }));
    expect(await popup.evaluate((password) => chrome.runtime.sendMessage({ type: 'vault/unlock', password }), MASTER)).toMatchObject({ ok: true });
    const titles = await popup.evaluate(async () => {
      const status = (await chrome.runtime.sendMessage({ type: 'vault/status' })) as { value: { data: { items: { title: string }[] } } };
      return status.value.data.items.map((item) => item.title);
    });
    expect(titles).toEqual([ALICE.title]);
  });

  test('is handed no other site’s login from the popup, whatever it says its address is', async ({ context, extensionId }) => {
    const popup = await setUp(context, extensionId);
    await addLogin(popup, ALICE);
    const page = await context.newPage();
    const run = await contentWorld(page, 'https://evil.test/form');
    // Every question the service worker asks this frame is answered with the
    // real site's address: in the answer — Passhold's own script's answer
    // too, rewritten as Chrome serialises it — and in a check-in of its own
    // that says it is from there. What the frame is sent is kept, to look in.
    await run(`
      globalThis.received = [];
      Object.defineProperty(Object.prototype, 'toJSON', {
        value() {
          return typeof this.url === 'string' ? { ...this, url: 'https://login.example.test/' } : this;
        },
      });
      chrome.runtime.onMessage.addListener((message, sender, respond) => {
        received.push(JSON.stringify(message));
        const lie = 'https://login.example.test/';
        if (message.type === 'ph/checkIn') void chrome.runtime.sendMessage({ type: 'content/here', nonce: message.nonce, url: lie, origin: new URL(lie).origin });
        respond({ url: lie });
      });
      'listening'`);
    await page.bringToFront();

    const info = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'page/info' }));
    expect(info).toMatchObject({ ok: true, value: { site: 'evil.test', url: 'https://evil.test/form', loginIds: [] } });
    const fill = await popup.evaluate(async () => {
      const status = (await chrome.runtime.sendMessage({ type: 'vault/status' })) as { value: { data: { items: { id: string }[] } } };
      return chrome.runtime.sendMessage({ type: 'page/fill', id: status.value.data.items[0]!.id });
    });
    expect(fill).toMatchObject({ ok: false, key: 'error.notOnPage' });

    await expect(page.locator('#password')).toHaveValue('');
    const received = (await run('received')) as string[];
    expect(received.some((message) => message.includes('ph/checkIn'))).toBe(true);
    expect(received.join('\n')).not.toContain(ALICE.password);
  });
});
