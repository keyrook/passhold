import { addLogin, diskDump, expect, frameOf, MASTER, openPopup, openSettings, settingsTab, setUp, test } from './fixtures.js';

const ALICE = { title: 'Example', username: 'alice@example.test', password: 'Tr0ub4dor&3-unique', url: 'https://login.example.test/' };

const menuOpen = (page: import('@playwright/test').Page) => page.frames().some((frame) => frame.url().includes('menu.html'));

test.describe('suggestions in the field', () => {
  test('open by themselves when a sign-in field is clicked, and step aside for typing', async ({ context, extensionId }) => {
    const popup = await setUp(context, extensionId);
    await addLogin(popup, ALICE);
    const page = await context.newPage();
    await page.goto('https://login.example.test/');
    await page.locator('#email').click();
    const menu = await frameOf(page, 'menu.html');
    await expect(menu.getByRole('button', { name: /Example/ })).toBeVisible();

    await page.keyboard.type('a');
    await expect.poll(() => menuOpen(page)).toBe(false);

    // Tab is a person choosing the field too.
    await page.locator('#email').fill('');
    await page.locator('#password').focus();
    await page.keyboard.press('Shift+Tab');
    await frameOf(page, 'menu.html');
  });

  test('offer a strong password on a sign-up form', async ({ context, extensionId }) => {
    await setUp(context, extensionId);
    const page = await context.newPage();
    await page.goto('https://accounts.example.test/signup');
    await page.locator('#new').click();
    const menu = await frameOf(page, 'menu.html');
    await expect(menu.getByRole('button', { name: /Use a strong password/ })).toBeVisible();
  });

  test('stay away when there is nothing to offer, when locked, or when the page focuses the field itself', async ({ context, extensionId }) => {
    const popup = await setUp(context, extensionId);
    await addLogin(popup, ALICE);
    const page = await context.newPage();

    // Plain http is never offered the https site's login, so there is nothing to show.
    await page.goto('http://login.example.test/');
    await page.locator('#email').click();
    await page.waitForTimeout(800);
    expect(menuOpen(page)).toBe(false);

    // The page's own script focusing the field is not a person choosing it.
    await page.goto('https://login.example.test/autofocus');
    await page.waitForTimeout(1200);
    expect(menuOpen(page)).toBe(false);
    await expect(page.locator('#email')).toBeFocused();

    await popup.getByRole('button', { name: 'Lock' }).click();
    await page.goto('https://login.example.test/');
    await page.locator('#email').click();
    await page.waitForTimeout(800);
    expect(menuOpen(page)).toBe(false);
  });

  test('can be turned off', async ({ context, extensionId }) => {
    const popup = await setUp(context, extensionId);
    await addLogin(popup, ALICE);
    const options = await openSettings(context, extensionId);
    await settingsTab(options, 'General');
    const toggle = options.getByRole('switch', { name: 'Show suggestions when you click a sign-in, card or address field' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    const page = await context.newPage();
    await page.goto('https://login.example.test/');
    await page.locator('#email').click();
    await page.waitForTimeout(800);
    expect(menuOpen(page)).toBe(false);
  });
});

test.describe('the PIN', () => {
  async function setPin(context: import('@playwright/test').BrowserContext, extensionId: string, pin = '246810') {
    const options = await openSettings(context, extensionId);
    await settingsTab(options, 'Security');
    await options.getByRole('button', { name: 'Set up PIN' }).click();
    await options.locator('#new-pin').fill(pin);
    await options.getByLabel('Type it again').fill(pin);
    await options.getByLabel('Current master password').fill('not the password at all');
    await options.getByRole('button', { name: 'Save PIN' }).click();
    // A new way in takes the master password.
    await expect(options.getByText('That is not the master password.')).toBeVisible();
    await options.getByLabel('Current master password').fill(MASTER);
    await options.getByRole('button', { name: 'Save PIN' }).click();
    await expect(options.getByText('On', { exact: true })).toBeVisible();
    return options;
  }

  test('unlocks while the browser is open, and the key it guards never reaches the disk', async ({ context, extensionId, worker }) => {
    const popup = await setUp(context, extensionId);
    await addLogin(popup, ALICE);
    await setPin(context, extensionId);

    await popup.getByRole('button', { name: 'Lock' }).click();
    await expect(popup.locator('#pin')).toBeVisible();
    expect(await diskDump(worker)).not.toContain('ph.pin');
    expect(await worker.evaluate(async () => Object.keys(await chrome.storage.session.get(null)))).toContain('ph.pin');

    await popup.locator('#pin').fill('111111');
    await popup.getByRole('button', { name: 'Unlock' }).click();
    await expect(popup.getByRole('alert')).toHaveText('That is not the PIN. 4 tries left.');

    await popup.locator('#pin').fill('246810');
    await popup.getByRole('button', { name: 'Unlock' }).click();
    await expect(popup.getByText(ALICE.username)).toBeVisible();
  });

  test('gives way to the master password after five wrong tries', async ({ context, extensionId }) => {
    const popup = await setUp(context, extensionId);
    await setPin(context, extensionId);
    await popup.getByRole('button', { name: 'Lock' }).click();
    for (let left = 4; left >= 1; left--) {
      await popup.locator('#pin').fill('000000');
      await popup.getByRole('button', { name: 'Unlock' }).click();
      await expect(popup.getByRole('alert')).toContainText(`${left} ${left === 1 ? 'try' : 'tries'} left`);
    }
    await popup.locator('#pin').fill('000000');
    await popup.getByRole('button', { name: 'Unlock' }).click();
    await expect(popup.getByRole('alert')).toHaveText('Too many wrong PINs. Unlock another way; the PIN works again after that.');
    await expect(popup.locator('#master')).toBeVisible();
    // Even the right PIN does nothing now: the envelope is gone.
    const status = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/unlockPin', pin: '246810' }));
    expect(status).toMatchObject({ ok: false, key: 'error.pinUnavailable' });

    await popup.locator('#master').fill(MASTER);
    await popup.getByRole('button', { name: 'Unlock' }).click();
    await expect(popup.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
  });
});

test('the checkup finds weak and reused passwords, and points to where they are changed', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, { title: 'Mail', username: 'alice', password: 'password123', url: 'https://mail.example.org' });
  await addLogin(popup, { title: 'Shop', username: 'alice', password: 'password123', url: 'https://shop.example.net' });
  await addLogin(popup, ALICE);
  await expect(popup.getByTestId('attention')).toBeVisible();

  // The login's own row: "Mail" alone would also find the account banner's "Email".
  await popup.getByRole('button', { name: 'Mail alice' }).click();
  const issues = popup.getByTestId('issues');
  await expect(issues).toContainText('This password is weak');
  await expect(issues).toContainText('also used for 1 other login');
  await expect(issues.getByRole('link', { name: 'Change it on the site' })).toHaveAttribute('href', 'https://mail.example.org/.well-known/change-password');

  const options = await openSettings(context, extensionId);
  await expect(options.getByTestId('nav-attention')).toBeVisible();
  // In the list, each login says what is wrong with it.
  await expect(options.getByRole('listitem').filter({ hasText: 'Mail' })).toContainText('Weak');
  await expect(options.getByRole('listitem').filter({ hasText: 'Mail' })).toContainText('Reused');
  await options.getByRole('radio', { name: 'Needs attention · 4' }).click();
  // Two weak logins, one shared password, and no backup yet.
  await expect(options.getByTestId('checkup-summary')).toContainText('4 things to look at');
  await expect(options.getByRole('heading', { name: '2 weak passwords' })).toBeVisible();
  await expect(options.getByRole('heading', { name: '1 password used more than once' })).toBeVisible();
});

test.describe('the idle lock', () => {
  test('locks while its owner is away, whatever a web page puts up meanwhile', async ({ context, extensionId, worker }) => {
    const popup = await setUp(context, extensionId);
    await addLogin(popup, ALICE);
    await popup.close();
    const lastActive = () => worker.evaluate(() => chrome.storage.session.get('ph.lastActive').then((stored) => stored['ph.lastActive'] as number));
    const awayFor = async (minutes: number) => {
      await worker.evaluate((at) => chrome.storage.session.set({ 'ph.lastActive': at }), Date.now() - minutes * 60_000);
      return lastActive();
    };

    // An hour away. A web page puts up Passhold's passkey frame and its save
    // prompt, each asking the service worker what to show, with no one there.
    const away = await awayFor(60);
    const page = await context.newPage();
    await page.goto('https://passkeys.example.test/');
    // Left waiting: the page goes elsewhere next.
    void page.evaluate(() => (window as unknown as { register: () => Promise<unknown> }).register()).catch(() => undefined);
    await expect((await frameOf(page, 'passkey.html')).getByText('Save a passkey for example.test?')).toBeVisible();
    await page.goto('https://login.example.test/');
    await page.evaluate(() => {
      (document.getElementById('email') as HTMLInputElement).value = 'mallory@example.test';
      (document.getElementById('password') as HTMLInputElement).value = 'Made-Up-By-The-Page-1';
      setTimeout(() => document.querySelector('form')!.requestSubmit());
    });
    await page.waitForURL('**/welcome');
    const prompt = await frameOf(page, 'prompt.html');
    await expect(prompt.getByText('Save login to Passhold?')).toBeVisible();
    expect(await lastActive()).toBe(away);

    // So when the idle lock next looks, it locks.
    await worker.evaluate(() => chrome.alarms.create('ph.autolock', { when: Date.now() }));
    await expect.poll(() => worker.evaluate(() => chrome.storage.session.get('ph.sessionKey').then((stored) => stored['ph.sessionKey'] ?? null))).toBeNull();

    // A person's click in one of those frames is someone there; so is opening the popup.
    await prompt.getByRole('button', { name: 'Close' }).click();
    await expect.poll(lastActive).toBeGreaterThan(away);
    const awayAgain = await awayFor(60);
    await openPopup(context, extensionId);
    await expect.poll(lastActive).toBeGreaterThan(awayAgain);
  });
});
