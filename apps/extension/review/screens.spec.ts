/**
 * Every screen, light and dark, into .tmp/review/ — for a person to look at
 * before a release. Not a test: `npm run review -w @passhold/extension`.
 */
import { resolve } from 'node:path';
import { addLogin, downloadBackup, frameOf, MASTER, openPopup, pressFieldButton, setUp, test } from '../e2e/fixtures.js';

const OUT = resolve(import.meta.dirname, '../../../.tmp/review');

const LOGINS = [
  { title: 'Example', username: 'alice@example.test', password: 'Tr0ub4dor&3-unique', url: 'https://login.example.test/' },
  { title: 'Mail', username: 'alice', password: 'mail-password-2', url: 'https://mail.example.org' },
  { title: 'Bank', username: 'alice.nguyen', password: 'bank-password-3', url: 'https://bank.example.net' },
  { title: 'Shop', username: 'alice@shop.test', password: 'shop-password-4', url: 'https://shop.test' },
];

for (const scheme of ['light', 'dark'] as const) {
  test(`every screen, ${scheme}`, async ({ context, extensionId }) => {
    for (const page of context.pages()) await page.emulateMedia({ colorScheme: scheme });
    context.on('page', (page) => void page.emulateMedia({ colorScheme: scheme }));
    const shot = (page: { screenshot: (o: { path: string; fullPage?: boolean }) => Promise<unknown> }, name: string, fullPage = false) =>
      page.screenshot({ path: `${OUT}/${scheme}-${name}.png`, fullPage });

    const first = await openPopup(context, extensionId);
    await first.emulateMedia({ colorScheme: scheme });
    await first.reload();
    await first.locator('#master').fill(MASTER);
    await shot(first, '01-setup');
    await first.close();

    const empty = await context.newPage();
    await empty.emulateMedia({ colorScheme: scheme });
    await empty.setViewportSize({ width: 900, height: 700 });
    await empty.goto(`chrome-extension://${extensionId}/options.html#restore`);
    await empty.getByRole('heading', { name: 'Restore from a backup' }).waitFor();
    await shot(empty, '11-settings-new');
    await empty.close();

    const popup = await setUp(context, extensionId);
    await popup.emulateMedia({ colorScheme: scheme });
    await shot(popup, '02-empty');
    for (const login of LOGINS) await addLogin(popup, login);
    await shot(popup, '03-vault');
    await popup.getByText('Bank').first().click();
    await shot(popup, '04-item');
    await popup.getByRole('button', { name: 'Edit' }).click();
    await popup.getByRole('button', { name: 'Generate' }).click();
    await shot(popup, '05-edit');
    await popup.getByRole('button', { name: 'Cancel' }).click();
    await popup.getByRole('button', { name: 'Back' }).click();

    const page = await context.newPage();
    await page.emulateMedia({ colorScheme: scheme });
    await page.setViewportSize({ width: 900, height: 560 });
    await page.goto('https://login.example.test/');
    await pressFieldButton(page.mainFrame(), '#email');
    await frameOf(page, 'menu.html');
    await page.waitForTimeout(400);
    await shot(page, '06-menu');

    await page.goto('https://accounts.example.test/signup');
    await pressFieldButton(page.mainFrame(), '#new');
    await frameOf(page, 'menu.html');
    await page.waitForTimeout(400);
    await shot(page, '07-suggest');

    await page.goto('https://login.example.test/');
    await page.locator('#email').fill('bob@example.test');
    await page.locator('#password').fill('a-brand-new-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await frameOf(page, 'prompt.html');
    await page.waitForTimeout(400);
    await shot(page, '08-prompt');

    const options = await context.newPage();
    await options.emulateMedia({ colorScheme: scheme });
    await options.setViewportSize({ width: 900, height: 1400 });
    await options.goto(`chrome-extension://${extensionId}/options.html`);
    await options.getByRole('heading', { name: 'Settings' }).waitFor();
    await shot(options, '09-settings', true);

    const backup = await downloadBackup(options);
    await options.getByTestId('restore-file').setInputFiles({ name: 'passhold-backup.json', mimeType: 'application/json', buffer: backup });
    await options.getByLabel('Master password of the backup').fill(MASTER);
    await options.locator('#backup').scrollIntoViewIfNeeded();
    await shot(options, '12-backup');

    await popup.bringToFront();
    await popup.getByRole('button', { name: 'Lock' }).click();
    await popup.locator('#master').waitFor();
    await shot(popup, '10-locked');
    const again = await openPopup(context, extensionId);
    void again;
  });
}
