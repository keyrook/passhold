import { readFileSync } from 'node:fs';
import { openBackup, secretOf } from '@passhold/core';
import type { Page } from '@playwright/test';
import { diskDump, expect, keepRecoveryKey, pageWithAuthenticator, passwordsView, settingsTab, test } from './fixtures.js';

const status = (page: Page) =>
  page.evaluate(async () => ((await chrome.runtime.sendMessage({ type: 'vault/status' })) as { value: { state: string; secret?: string } }).value);
const send = (page: Page, message: object) => page.evaluate((body) => chrome.runtime.sendMessage(body), message);

/**
 * A vault made with the device in one tab — the tab whose authenticator holds
 * the passkey — and its recovery key: as the last step of signing in makes
 * one, here without an account, as a vault from before Passhold started with
 * one. The passkey is made in the page, as Passhold's own pages make it.
 */
async function makeWithDevice(context: import('@playwright/test').BrowserContext, extensionId: string, confirm = true) {
  const { page } = await pageWithAuthenticator(context);
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  const key = await page.evaluate(async () => {
    const b64 = (bytes: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const prf = { prf: { eval: { first: salt } } } as AuthenticationExtensionsClientInputs;
    const created = (await navigator.credentials.create({
      publicKey: {
        rp: { name: 'Passhold' },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'Passhold', displayName: 'Passhold' },
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
        extensions: prf,
      },
    })) as PublicKeyCredential;
    type Outputs = { prf?: { results?: { first?: ArrayBuffer } } };
    let first = (created.getClientExtensionResults() as Outputs).prf?.results?.first;
    if (!first) {
      const asked = (await navigator.credentials.get({
        publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), allowCredentials: [{ type: 'public-key', id: created.rawId }], userVerification: 'required', extensions: prf },
      })) as PublicKeyCredential;
      first = (asked.getClientExtensionResults() as Outputs).prf!.results!.first!;
    }
    const answer = (await chrome.runtime.sendMessage({
      type: 'vault/createWithDevice',
      credential: { credentialId: b64(created.rawId), salt: b64(salt) },
      prf: b64(first),
    })) as { value: { recoveryKey: string } };
    return answer.value.recoveryKey;
  });
  if (confirm) await send(page, { type: 'vault/mutate', mutation: { op: 'recovery/saved' } });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
  return { page, key };
}

test.describe('a vault with no master password', () => {
  test('is made with the device, keeps its recovery key sealed, and opens with the device', async ({ context, extensionId, worker }) => {
    const { page, key } = await makeWithDevice(context, extensionId);
    expect(key).toMatch(/^([0-9A-HJKMNP-TV-Z]{4}-){5}[0-9A-HJKMNP-TV-Z]{4}$/);
    expect(await status(page)).toMatchObject({ state: 'unlocked', secret: 'recoveryKey' });

    // The key is kept only sealed in the vault: never readable on disk or in memory.
    expect(await diskDump(worker)).not.toContain(key);
    expect(JSON.stringify(await worker.evaluate(() => chrome.storage.session.get(null)))).not.toContain(key);

    await send(page, { type: 'vault/lock' });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    // Opening the popup asks the device; nothing to type.
    await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
  });

  test('opens with the recovery key however it is typed, and only with it', async ({ context, extensionId }) => {
    const { page, key } = await makeWithDevice(context, extensionId);
    await send(page, { type: 'vault/lock' });
    expect(await send(page, { type: 'vault/unlock', password: 'ABCD-EFGH-JKMN-PQRS-TVWX-YZ00' })).toMatchObject({
      ok: false,
      key: 'error.wrongRecoveryKey',
    });
    const loose = key.toLowerCase().replace(/-/g, ' ');
    expect(await send(page, { type: 'vault/unlock', password: loose })).toMatchObject({ ok: true });
  });

  test('backs up with a touch, and the backup opens with the recovery key', async ({ context, extensionId }) => {
    const { page, key } = await makeWithDevice(context, extensionId);
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    await settingsTab(page, 'Account & sync');
    await page.getByRole('button', { name: /^Back up/ }).click();
    // The device proves the owner: no field to type in.
    await expect(page.locator('#backup').getByText(/^You will confirm with /)).toBeVisible();
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download backup' }).click()]);
    const text = readFileSync((await download.path())!, 'utf8');
    expect(text).not.toContain(key);
    const opened = await openBackup(text, key);
    expect(secretOf(opened.file)).toBe('recoveryKey');
  });

  test('keeps the device until a master password is set, then moves to one and back', async ({ context, extensionId }) => {
    const { page } = await makeWithDevice(context, extensionId);
    await page.goto(`chrome-extension://${extensionId}/options.html#security`);
    await expect(page.locator('#opens').getByRole('button', { name: 'Turn off' })).toHaveCount(0);
    expect(await send(page, { type: 'vault/removeDevice' })).toMatchObject({ ok: false, key: 'error.deviceNeeded' });

    // To a master password, proved with a touch.
    await page.getByRole('button', { name: 'Set one' }).click();
    await page.getByLabel('New master password').fill('a password of my own');
    await page.getByLabel('Type the new one again').fill('a password of my own');
    await page.getByRole('button', { name: 'Use this password' }).click();
    await expect.poll(async () => (await status(page)).secret).toBe('password');
    await send(page, { type: 'vault/lock' });
    expect(await send(page, { type: 'vault/unlock', password: 'a password of my own' })).toMatchObject({ ok: true });

    // And back: a new recovery key, shown once.
    await page.reload();
    await page.getByRole('button', { name: 'Switch', exact: true }).click();
    await page.getByRole('button', { name: 'Switch and show the recovery key' }).click();
    const key = await keepRecoveryKey(page);
    expect(await status(page)).toMatchObject({ secret: 'recoveryKey' });
    await send(page, { type: 'vault/lock' });
    expect(await send(page, { type: 'vault/unlock', password: 'a password of my own' })).toMatchObject({ ok: false });
    expect(await send(page, { type: 'vault/unlock', password: key })).toMatchObject({ ok: true });
  });

  test('a recovery key never confirmed as put away is in the checkup until a new one is', async ({ context, extensionId }) => {
    const { page } = await makeWithDevice(context, extensionId, false);
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    await expect(page.getByTestId('nav-attention')).toBeVisible();
    await page.getByRole('radio', { name: /^Needs attention/ }).click();
    await expect(page.getByText('Recovery key not put away').first()).toBeVisible();

    await page.getByRole('button', { name: 'Make a new one' }).click();
    await page.locator('#opens').getByRole('button', { name: 'Make a new one' }).click();
    await page.locator('#opens').locator('form').getByRole('button', { name: 'Make a new one' }).click();
    await keepRecoveryKey(page);
    await passwordsView(page, 'Needs attention');
    await expect(page.getByText('Recovery key not put away')).toHaveCount(0);
  });

  test('Settings shows the key again with a touch — as a QR code and on paper', async ({ context, extensionId }) => {
    const { page, key } = await makeWithDevice(context, extensionId, false);
    // In this tab, whose authenticator holds the passkey: shown at once, after a touch.
    await page.goto(`chrome-extension://${extensionId}/options.html#recovery`);
    await expect(page.getByTestId('recovery-key')).toHaveText(key);
    await page.getByRole('button', { name: 'Show QR code' }).click();
    await expect(page.getByRole('img', { name: 'The recovery key as a QR code' }).first()).toBeVisible();
    // The printed sheet is drawn, for paper only.
    await expect(page.getByTestId('recovery-kit')).toBeHidden();
    await expect(page.getByTestId('recovery-kit')).toContainText(key);
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByTestId('recovery-kit')).toBeVisible();
    await expect(page.getByTestId('recovery-key-screen')).toBeHidden();
    await page.emulateMedia({ media: 'screen' });

    await keepRecoveryKey(page);
    // Put away, it stays put away: the page does not ask for it again on its own.
    await expect(page.locator('#opens')).toBeVisible();
    await expect(page.getByTestId('recovery-key')).toHaveCount(0);
  });

  test('shows the key only to its owner', async ({ context, extensionId }) => {
    const { page } = await makeWithDevice(context, extensionId);
    expect(await send(page, { type: 'vault/showRecoveryKey', proof: { secret: 'not it' } })).toMatchObject({
      ok: false,
      key: 'error.wrongRecoveryKey',
    });
  });
});
