import type { Page } from '@playwright/test';
import { addAuthenticator, diskDump, expect, MASTER, pageWithAuthenticator, settingsTab, setUp, test } from './fixtures.js';

const lock = (page: Page) => page.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/lock' }));
const randomAnswer = () => Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64');

/** Add a key in Security: proving with this password, or with whatever the form offers first — a key already set up. */
async function addKey(options: Page, password?: string): Promise<void> {
  const section = options.locator('#keys');
  await section.getByRole('button', { name: 'Add a key' }).click();
  if (password !== undefined) {
    const instead = section.getByRole('button', { name: 'Type the master password instead' });
    if (await instead.isVisible()) await instead.click();
    await section.getByLabel('Current master password').fill(password);
  }
  await section.getByRole('button', { name: 'Add this key' }).click();
}

/** What the vault says it opens with, as a locked page is told. */
async function unlocks(page: Page): Promise<{ device: { credentialId: string; salt: string } | null; keys: { credentialId: string; salt: string }[] }> {
  return page.evaluate(async () => (await chrome.runtime.sendMessage({ type: 'vault/status' })).value);
}

/** An authenticator's real PRF answer for this credential and salt, asked straight from the page, as an attacker in it could. */
function answerOf(page: Page, credential: { credentialId: string; salt: string }): Promise<string> {
  return page.evaluate(async ({ credentialId, salt }) => {
    const bytes = (base64: string) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const result = (await navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array(32),
        allowCredentials: [{ type: 'public-key', id: bytes(credentialId) }],
        userVerification: 'required',
        extensions: { prf: { eval: { first: bytes(salt) } } } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential;
    const first = (result.getClientExtensionResults() as { prf?: { results?: { first?: ArrayBuffer } } }).prf!.results!.first!;
    return btoa(String.fromCharCode(...new Uint8Array(first)));
  }, credential);
}

test.describe('unlocking with a security key', () => {
  test('adds a key with the master password on a computer with no Touch ID, keeps nothing on it, and opens a locked vault — after a restart too', async ({
    context,
    extensionId,
    worker,
  }) => {
    await setUp(context, extensionId);
    const { page: options, credentials, held } = await pageWithAuthenticator(context, { transport: 'usb' });
    await options.goto(`chrome-extension://${extensionId}/options.html#security`);
    // A key is not the computer's own unlock: that one is not offered here, the key is.
    await expect(options.locator('#device').getByText('Not available here')).toBeVisible();
    const section = options.locator('#keys');
    await expect(section.getByText('No key set up')).toBeVisible();

    // A new way in takes the master password, checked before the key is
    // asked: a wrong one costs no PIN and makes nothing.
    await addKey(options, 'not the password at all');
    await expect(section.getByText('That is not the master password.')).toBeVisible();
    expect(await credentials()).toBe(0);
    expect(await diskDump(worker)).not.toContain('ph.keys');

    await section.getByLabel('Current master password').fill(MASTER);
    await section.getByRole('button', { name: 'Add this key' }).click();
    await expect(section.getByText('1 key set up')).toBeVisible();
    await expect(section.getByText(/^Added /)).toBeVisible();
    // Not discoverable: the key gave up none of its few places for passkeys.
    expect(await held()).toMatchObject([{ isResidentCredential: false }]);

    // On disk: the wrapped key, never the key.
    const sessionKey = await worker.evaluate(async () => (await chrome.storage.session.get('ph.sessionKey'))['ph.sessionKey'] as string);
    const disk = await diskDump(worker);
    expect(disk).toContain('ph.keys');
    expect(disk).not.toContain(sessionKey);
    expect(disk).not.toContain('ph.device');

    await lock(options);
    await options.getByRole('button', { name: 'Unlock with a security key' }).click();
    await expect(options.getByRole('navigation').getByRole('button', { name: 'Passwords' })).toBeVisible();

    // A restart wipes session memory, but not this.
    await lock(options);
    await worker.evaluate(() => chrome.storage.session.clear());
    await options.reload();
    await options.getByRole('button', { name: 'Unlock with a security key' }).click();
    await expect(options.getByRole('navigation').getByRole('button', { name: 'Passwords' })).toBeVisible();
  });

  test('beside Touch ID, each opens only its own copy: an answer said to be the other’s opens nothing', async ({ context, extensionId }) => {
    await setUp(context, extensionId);
    const { page: options } = await pageWithAuthenticator(context);
    const key = await addAuthenticator(options, { transport: 'usb' });
    await options.goto(`chrome-extension://${extensionId}/options.html#security`);
    await addKey(options, MASTER);
    await expect(options.locator('#keys').getByText('1 key set up')).toBeVisible();

    // Touch ID beside it, the key left in the port untouched.
    await key.touched(false);
    const device = options.locator('#device');
    await device.getByRole('button', { name: 'Set up', exact: true }).click();
    await device.getByRole('button', { name: 'Type the master password instead' }).click();
    await device.getByLabel('Current master password').fill(MASTER);
    await device.getByRole('button', { name: /^Set up / }).click();
    await expect(device.getByText('On', { exact: true })).toBeVisible();
    await expect(options.locator('#keys').getByText('1 key set up')).toBeVisible();

    await lock(options);
    const { device: platform, keys } = await unlocks(options);
    const deviceAnswer = await answerOf(options, platform!);
    await key.touched(true);
    const keyAnswer = await answerOf(options, keys[0]!);
    const keyId = keys[0]!.credentialId;
    const unlock = (request: { prf: string; key?: string }) => options.evaluate((body) => chrome.runtime.sendMessage({ type: 'vault/unlockDevice', ...body }), request);
    const proof = (request: { prf: string; key?: string }) => options.evaluate((body) => chrome.runtime.sendMessage({ type: 'vault/checkProof', proof: body }), request);
    // The key's answer for Touch ID's copy, Touch ID's for the key's, anyone's for a key not set up here.
    expect(await unlock({ prf: keyAnswer })).toMatchObject({ ok: false, key: 'error.deviceKeyWrong' });
    expect(await unlock({ prf: deviceAnswer, key: keyId })).toMatchObject({ ok: false, key: 'error.keyWrong' });
    expect(await unlock({ prf: randomAnswer(), key: keyId })).toMatchObject({ ok: false, key: 'error.keyWrong' });
    expect(await unlock({ prf: keyAnswer, key: Buffer.from('not a key here').toString('base64') })).toMatchObject({ ok: false, key: 'error.keyGone' });
    // The real answers were real: each opens its own.
    expect(await unlock({ prf: keyAnswer, key: keyId })).toMatchObject({ ok: true });
    // A proof is held to the same.
    expect(await proof({ prf: keyAnswer })).toMatchObject({ ok: false, key: 'error.deviceKeyWrong' });
    expect(await proof({ prf: deviceAnswer, key: keyId })).toMatchObject({ ok: false, key: 'error.keyWrong' });
    expect(await proof({ prf: deviceAnswer })).toMatchObject({ ok: true });

    // Both buttons open it, each its own way.
    await lock(options);
    await options.getByRole('button', { name: 'Unlock with a security key' }).click();
    await expect(options.getByRole('navigation').getByRole('button', { name: 'Passwords' })).toBeVisible();
    await lock(options);
    await key.touched(false);
    // Named by the system it runs on: Touch ID only on a Mac, and CI is Linux.
    await options.getByRole('button', { name: /^Unlock with (?!a security key)/ }).click();
    await expect(options.getByRole('navigation').getByRole('button', { name: 'Passwords' })).toBeVisible();
  });

  test('proves its owner where there is no Touch ID: a PIN set with a touch of the key, and a page that skips the proof gets nothing', async ({
    context,
    extensionId,
    worker,
  }) => {
    await setUp(context, extensionId);
    const { page: options, credentials } = await pageWithAuthenticator(context, { transport: 'usb' });
    await options.goto(`chrome-extension://${extensionId}/options.html#security`);
    await addKey(options, MASTER);
    await expect(options.locator('#keys').getByText('1 key set up')).toBeVisible();

    await options.getByRole('button', { name: 'Set up PIN' }).click();
    const pin = options.locator('#pin');
    await expect(pin.getByText('You will confirm with your security key.')).toBeVisible();
    await options.locator('#new-pin').fill('246810');
    await options.getByLabel('Type it again').fill('246810');
    await pin.getByRole('button', { name: 'Save PIN' }).click();
    await expect(pin.getByText('On', { exact: true })).toBeVisible();

    // Straight to the worker, past the page's own check: no proof, no key.
    const before = await credentials();
    const skipped = await options.evaluate(() =>
      chrome.runtime.sendMessage({
        type: 'vault/addKey',
        proof: { secret: 'not the password at all' },
        credential: { credentialId: btoa('made up'), salt: btoa('made up salt') },
        prf: btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))),
      }),
    );
    expect(skipped).toMatchObject({ ok: false, key: 'error.wrongPassword' });
    const stored = await worker.evaluate(async () => (await chrome.storage.local.get('ph.keys'))['ph.keys'] as unknown[]);
    expect(stored).toHaveLength(1);
    expect(await credentials()).toBe(before);
  });

  test('the same key twice is refused, a key with no PRF is refused and nothing is kept, and removing one asks for nothing', async ({
    context,
    extensionId,
    worker,
  }) => {
    await setUp(context, extensionId);
    const { page: options, remove } = await pageWithAuthenticator(context, { transport: 'usb' });
    await options.goto(`chrome-extension://${extensionId}/options.html#security`);
    const section = options.locator('#keys');
    await addKey(options, MASTER);
    await expect(section.getByText('1 key set up')).toBeVisible();

    // The same key again, proving with itself: Chrome finds it already holds one of this vault's, and makes nothing.
    await addKey(options);
    await expect(section.getByText('That key is set up here already.')).toBeVisible();
    await section.getByRole('button', { name: 'Cancel' }).click();

    // A key that cannot answer PRF, as one made only for two-step sign-in.
    await remove();
    const old = await addAuthenticator(options, { transport: 'usb', prf: false });
    await addKey(options, MASTER);
    await expect(section.getByText(/cannot give Passhold what it needs to open/)).toBeVisible();
    await section.getByRole('button', { name: 'Cancel' }).click();
    expect(await worker.evaluate(async () => ((await chrome.storage.local.get('ph.keys'))['ph.keys'] as unknown[]).length)).toBe(1);

    // A second key, then one removed: one way in fewer, nothing asked.
    await old.remove();
    await addAuthenticator(options, { transport: 'usb' });
    await addKey(options, MASTER);
    await expect(section.getByText('2 keys set up')).toBeVisible();
    await section.getByRole('button', { name: 'Remove' }).first().click();
    await expect(section.getByText('1 key set up')).toBeVisible();
    await section.getByRole('button', { name: 'Remove' }).click();
    await expect(section.getByText('No key set up')).toBeVisible();
    expect(await diskDump(worker)).not.toContain('ph.keys');

    // Gone with the vault too: a key for a vault removed opens nothing, and is not kept for the next.
    await addKey(options, MASTER);
    await expect(section.getByText('1 key set up')).toBeVisible();
    await options.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/reset' }));
    expect(await diskDump(worker)).not.toContain('ph.keys');
  });
});

test('the popup offers the key, and waits for the button: a key may be in a drawer', async ({ context, extensionId }) => {
  await setUp(context, extensionId);
  const { page } = await pageWithAuthenticator(context, { transport: 'usb' });
  await page.goto(`chrome-extension://${extensionId}/options.html#security`);
  await addKey(page, MASTER);
  await expect(page.locator('#keys').getByText('1 key set up')).toBeVisible();
  await lock(page);

  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  const button = page.getByRole('button', { name: 'Unlock with a security key' });
  await expect(button).toBeVisible();
  // The key answers at once when asked: still locked a moment later means it was not.
  await page.waitForTimeout(1_000);
  expect(await page.evaluate(async () => (await chrome.runtime.sendMessage({ type: 'vault/status' })).value.state)).toBe('locked');
  await button.click();
  await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
});

test('plain text out, with a touch of the key and nothing typed', async ({ context, extensionId }) => {
  await setUp(context, extensionId);
  const { page } = await pageWithAuthenticator(context, { transport: 'usb' });
  await page.goto(`chrome-extension://${extensionId}/options.html#security`);
  await addKey(page, MASTER);
  await expect(page.locator('#keys').getByText('1 key set up')).toBeVisible();
  await settingsTab(page, 'Account & sync');
  await page.getByRole('button', { name: /^Export/ }).click();
  const form = page.locator('#export');
  await expect(form.getByText('You will confirm with your security key.')).toBeVisible();
  await form.getByRole('button', { name: 'Export CSV' }).click();
  await expect(form.getByText(/^Exported\./)).toBeVisible();
});
