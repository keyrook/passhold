import { diskDump, expect, MASTER, pageWithAuthenticator, settingsTab, setUp, test } from './fixtures.js';

const lock = (page: import('@playwright/test').Page) => page.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/lock' }));

test.describe('unlocking with the device', () => {
  test('sets up with the master password, and opens a locked vault — after a restart too', async ({ context, extensionId, worker }) => {
    await setUp(context, extensionId);
    const { page: options, credentials } = await pageWithAuthenticator(context);
    await options.goto(`chrome-extension://${extensionId}/options.html#security`);
    const section = options.locator('#device');
    await section.getByRole('button', { name: 'Set up', exact: true }).click();

    // A new way in takes the master password, checked before the authenticator
    // is asked: a wrong one costs no fingerprint and leaves no passkey.
    await section.getByLabel('Current master password').fill('not the password at all');
    await section.getByRole('button', { name: /^Set up / }).click();
    await expect(section.getByText('That is not the master password.')).toBeVisible();
    expect(await credentials()).toBe(0);
    expect(await diskDump(worker)).not.toContain('ph.device');

    await section.getByLabel('Current master password').fill(MASTER);
    await section.getByRole('button', { name: /^Set up / }).click();
    await expect(section.getByText('On', { exact: true })).toBeVisible();

    // On disk: the wrapped key, never the key.
    const sessionKey = await worker.evaluate(async () => (await chrome.storage.session.get('ph.sessionKey'))['ph.sessionKey'] as string);
    const disk = await diskDump(worker);
    expect(disk).toContain('ph.device');
    expect(disk).not.toContain(sessionKey);

    await lock(options);
    await options.getByRole('button', { name: /^Unlock with / }).click();
    await expect(options.getByRole('navigation').getByRole('button', { name: 'Passwords' })).toBeVisible();

    // A restart wipes session memory — the PIN's copy with it — but not this.
    await lock(options);
    await worker.evaluate(() => chrome.storage.session.clear());
    await options.reload();
    await options.getByRole('button', { name: /^Unlock with / }).click();
    await expect(options.getByRole('navigation').getByRole('button', { name: 'Passwords' })).toBeVisible();
  });

  test('another authenticator’s answer opens nothing, and turning it off takes it off the disk', async ({ context, extensionId, worker }) => {
    await setUp(context, extensionId);
    const { page: options } = await pageWithAuthenticator(context);
    await options.goto(`chrome-extension://${extensionId}/options.html#security`);
    const section = options.locator('#device');
    await section.getByRole('button', { name: 'Set up', exact: true }).click();
    await section.getByLabel('Current master password').fill(MASTER);
    await section.getByRole('button', { name: /^Set up / }).click();
    await expect(section.getByText('On', { exact: true })).toBeVisible();

    await lock(options);
    const forged = await options.evaluate(() =>
      chrome.runtime.sendMessage({ type: 'vault/unlockDevice', prf: btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))) }),
    );
    expect(forged).toMatchObject({ ok: false, key: 'error.deviceKeyWrong' });

    await options.getByRole('button', { name: /^Unlock with / }).click();
    await settingsTab(options, 'Security');
    await section.getByRole('button', { name: 'Turn off' }).click();
    await expect(section.getByText('Off', { exact: true })).toBeVisible();
    expect(await diskDump(worker)).not.toContain('ph.device');
  });

  test('an authenticator with no PRF keeps the key’s bytes in the passkey itself, as iCloud Keychain before macOS 15', async ({ context, extensionId, worker }) => {
    await setUp(context, extensionId);
    const { page: options } = await pageWithAuthenticator(context, { prf: false, largeBlob: true });
    await options.goto(`chrome-extension://${extensionId}/options.html#security`);
    const section = options.locator('#device');
    await section.getByRole('button', { name: 'Set up', exact: true }).click();
    await section.getByLabel('Current master password').fill(MASTER);
    await section.getByRole('button', { name: /^Set up / }).click();
    await expect(section.getByText('On', { exact: true })).toBeVisible();
    const stored = await worker.evaluate(async () => (await chrome.storage.local.get('ph.device'))['ph.device'] as Record<string, unknown>);
    expect(stored).toMatchObject({ via: 'largeBlob' });

    // Nothing on disk opens it: 32 bytes of anyone's choosing do not.
    await lock(options);
    const forged = await options.evaluate(() =>
      chrome.runtime.sendMessage({ type: 'vault/unlockDevice', prf: btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))) }),
    );
    expect(forged).toMatchObject({ ok: false, key: 'error.deviceKeyWrong' });
    // The passkey hands its bytes back, after a restart too.
    await worker.evaluate(() => chrome.storage.session.clear());
    await options.reload();
    await options.getByRole('button', { name: /^Unlock with / }).click();
    await expect(options.getByRole('navigation').getByRole('button', { name: 'Passwords' })).toBeVisible();
  });

  test('an authenticator that can do neither says so, and nothing is kept', async ({ context, extensionId, worker }) => {
    await setUp(context, extensionId);
    const { page: options } = await pageWithAuthenticator(context, { prf: false, largeBlob: false });
    await options.goto(`chrome-extension://${extensionId}/options.html#security`);
    const section = options.locator('#device');
    await section.getByRole('button', { name: 'Set up', exact: true }).click();
    await section.getByLabel('Current master password').fill(MASTER);
    await section.getByRole('button', { name: /^Set up / }).click();
    await expect(section.getByText(/cannot give Passhold a key to open with/)).toBeVisible();
    expect(await diskDump(worker)).not.toContain('ph.device');
  });

  test('a browser with no such unlock says so, and offers nothing to set up', async ({ context, extensionId }) => {
    await setUp(context, extensionId);
    const options = await context.newPage();
    // Headless Chromium has no platform authenticator of its own.
    await options.goto(`chrome-extension://${extensionId}/options.html#security`);
    await expect(options.locator('#device').getByText('Not available here')).toBeVisible();
    await expect(options.locator('#device').getByRole('button')).toHaveCount(0);
  });
});

test('the popup asks the device as soon as it opens', async ({ context, extensionId }) => {
  await setUp(context, extensionId);
  // One tab throughout, so the authenticator that made the passkey is the one asked.
  const { page } = await pageWithAuthenticator(context);
  await page.goto(`chrome-extension://${extensionId}/options.html#security`);
  const section = page.locator('#device');
  await section.getByRole('button', { name: 'Set up', exact: true }).click();
  await section.getByLabel('Current master password').fill(MASTER);
  await section.getByRole('button', { name: /^Set up / }).click();
  await expect(section.getByText('On', { exact: true })).toBeVisible();
  await lock(page);

  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  // No button pressed: opening it was the asking.
  await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
});
