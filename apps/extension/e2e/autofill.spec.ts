import { addLogin, expect, frameOf, MASTER, openPopup, pressFieldButton, setUp, test } from './fixtures.js';

const ALICE = { title: 'Example', username: 'alice@example.test', password: 'Tr0ub4dor&3-unique', url: 'https://login.example.test/' };

test('fills from the button in the field', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, ALICE);

  const page = await context.newPage();
  await page.goto('https://login.example.test/');
  await pressFieldButton(page.mainFrame(), '#email');
  const menu = await frameOf(page, 'menu.html');
  // The page cannot put the list up itself, even at the very address ours has:
  // only Passhold's own script may frame it (use_dynamic_url).
  await page.evaluate((src) => {
    const copy = document.createElement('iframe');
    copy.src = src;
    document.body.append(copy);
  }, menu.url());
  await page.waitForTimeout(500);
  expect(page.frames().filter((frame) => frame.url().includes('menu.html'))).toHaveLength(1);
  await menu.getByRole('button', { name: /Example/ }).click();

  await expect(page.locator('#email')).toHaveValue(ALICE.username);
  await expect(page.locator('#password')).toHaveValue(ALICE.password);
  await expect.poll(() => page.frames().some((frame) => frame.url().includes('menu.html'))).toBe(false);
});

test('takes no click in the list until it has been seen, where it is, for a moment', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, { ...ALICE, url: 'https://login.example.test/tall' });
  const page = await context.newPage();
  await page.goto('https://login.example.test/tall');
  const email = page.locator('#email');
  const rowAt = async (menu: import('@playwright/test').Frame) => {
    const box = (await menu.getByRole('button', { name: /Example/ }).boundingBox())!;
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  };

  // A double click the page asked for: the first opens the list under the
  // field, the second lands on its first row the moment the row is there.
  await email.click();
  let menu = await frameOf(page, 'menu.html');
  await menu.getByRole('button', { name: /Example/ }).waitFor();
  let row = await rowAt(menu);
  await page.mouse.click(row.x, row.y);
  await page.waitForTimeout(300);
  await expect(email).toHaveValue('');
  // Seen a moment, the same click is the person's.
  await page.waitForTimeout(400);
  await page.mouse.click(row.x, row.y);
  await expect(email).toHaveValue(ALICE.username);

  // The page scrolls the list under a pointer that stayed where it was: the click waits again.
  await email.fill('');
  await page.locator('#password').fill('');
  await pressFieldButton(page.mainFrame(), '#email');
  menu = await frameOf(page, 'menu.html');
  await expect(menu.getByRole('button', { name: /Example/ })).toBeEnabled();
  await page.evaluate(() => scrollBy(0, 30));
  await page.waitForTimeout(100);
  row = await rowAt(menu);
  await page.mouse.click(row.x, row.y);
  await page.waitForTimeout(300);
  await expect(email).toHaveValue('');
  await page.waitForTimeout(400);
  await page.mouse.click(row.x, row.y);
  await expect(email).toHaveValue(ALICE.username);
});

test('draws nothing in a page until a sign-in field needs it, and nothing ever in a bot check', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, ALICE);
  const overlays = (frame: import('@playwright/test').Frame) => frame.evaluate(() => document.querySelectorAll('passhold-overlay').length);
  const page = await context.newPage();
  await page.goto('https://login.example.test/');
  await page.waitForTimeout(500);
  expect(await overlays(page.mainFrame())).toBe(0);
  await page.locator('#email').click();
  await expect.poll(() => overlays(page.mainFrame())).toBeGreaterThan(0);

  // Cloudflare's checks, in their own frame or on the site's /cdn-cgi/: Passhold is not there at all.
  for (const url of ['https://challenges.cloudflare.com/turnstile', 'https://login.example.test/cdn-cgi/challenge']) {
    await page.goto(url);
    await page.locator('#email').click();
    await page.waitForTimeout(800);
    expect(await overlays(page.mainFrame()), url).toBe(0);
    expect(page.frames().some((frame) => frame.url().includes('menu.html')), url).toBe(false);
    // No bridge answers for passkeys either.
    const answered = await page.evaluate(
      () =>
        new Promise<boolean>((resolve) => {
          addEventListener('message', (event) => {
            if ((event.data as { kind?: string })?.kind === 'answers') resolve(true);
          });
          postMessage({ source: 'passhold-webauthn', kind: 'canAnswer', id: 'probe' }, location.origin);
          setTimeout(() => resolve(false), 1000);
        }),
    );
    expect(answered, url).toBe(false);
  }
});

test('fills from the popup for the page in the active tab', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, ALICE);
  const page = await context.newPage();
  await page.goto('https://login.example.test/');
  await page.bringToFront();
  const result = await popup.evaluate(async (id) => {
    const status = (await chrome.runtime.sendMessage({ type: 'vault/status' })) as { value: { data: { items: { id: string }[] } } };
    return chrome.runtime.sendMessage({ type: 'page/fill', id: status.value.data.items[0]!.id });
  }, extensionId);
  expect(result).toMatchObject({ ok: true });
  await expect(page.locator('#password')).toHaveValue(ALICE.password);
});

test('offers nothing to another site framed into the page', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, ALICE);
  const page = await context.newPage();
  await page.goto('https://login.example.test/framed');
  const evil = page.frames().find((frame) => frame.url().startsWith('https://evil.test/'))!;
  await pressFieldButton(evil, '#email');
  const menu = await frameOf(page, 'menu.html');
  await expect(menu.getByText('No saved logins for evil.test.')).toBeVisible();
  await expect(menu.getByRole('button', { name: /Example/ })).toHaveCount(0);
});

test('offers nothing to the same site over plain http', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, ALICE);
  const page = await context.newPage();
  await page.goto('http://login.example.test/');
  await pressFieldButton(page.mainFrame(), '#email');
  const menu = await frameOf(page, 'menu.html');
  await expect(menu.getByText('No saved logins for example.test.')).toBeVisible();
});

test('never fills a password field the page hides', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, { ...ALICE, url: 'https://login.example.test/trap' });
  const page = await context.newPage();
  await page.goto('https://login.example.test/trap');
  await pressFieldButton(page.mainFrame(), '#email');
  const menu = await frameOf(page, 'menu.html');
  await menu.getByRole('button', { name: /Example/ }).click();
  await expect(page.locator('#password')).toHaveValue(ALICE.password);
  await expect(page.locator('#hidden')).toHaveValue('');
});

test('a locked vault offers to unlock, and shows no logins', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, ALICE);
  await popup.getByRole('button', { name: 'Lock' }).click();
  const page = await context.newPage();
  await page.goto('https://login.example.test/');
  await pressFieldButton(page.mainFrame(), '#email');
  const menu = await frameOf(page, 'menu.html');
  await expect(menu.getByRole('button', { name: 'Unlock Passhold' })).toBeVisible();
  await expect(menu.getByText(ALICE.username)).toHaveCount(0);
});

test('offers to save a new sign-in after the form is sent, and saves it', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  const page = await context.newPage();
  await page.goto('https://login.example.test/');
  await page.locator('#email').fill('bob@example.test');
  await page.locator('#password').fill('a-brand-new-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('https://login.example.test/welcome');

  const prompt = await frameOf(page, 'prompt.html');
  await expect(prompt.getByText('Save login to Passhold?')).toBeVisible();
  await expect(prompt.getByText('bob@example.test on example.test')).toBeVisible();
  // The prompt shows who and where — never the password.
  await expect(prompt.locator('body')).not.toContainText('a-brand-new-password');
  await prompt.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(prompt.getByText('Saved to Passhold.')).toBeVisible();

  await popup.reload();
  await expect(popup.getByText('bob@example.test').first()).toBeVisible();
});

test('offers to update a changed password, not to save a second login', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, ALICE);
  const page = await context.newPage();
  await page.goto('https://login.example.test/');
  await page.locator('#email').fill(ALICE.username);
  await page.locator('#password').fill('the-new-password-1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  const prompt = await frameOf(page, 'prompt.html');
  await expect(prompt.getByText('Update the password in Passhold?')).toBeVisible();
  await prompt.getByRole('button', { name: 'Update' }).click();
  await expect(prompt.getByText('Saved to Passhold.')).toBeVisible();

  const items = await popup.evaluate(async () => {
    const status = (await chrome.runtime.sendMessage({ type: 'vault/status' })) as { value: { data: { items: { password: string; history: unknown[] }[] } } };
    return status.value.data.items;
  });
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({ password: 'the-new-password-1' });
  expect(items[0]!.history).toHaveLength(1);
});

test('stays quiet about a sign-in it already has', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, ALICE);
  const page = await context.newPage();
  await page.goto('https://login.example.test/');
  await page.locator('#email').fill(ALICE.username);
  await page.locator('#password').fill(ALICE.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('https://login.example.test/welcome');
  await page.waitForTimeout(1000);
  expect(page.frames().some((frame) => frame.url().includes('prompt.html'))).toBe(false);
});

test('suggests a strong password on a sign-up form, in both fields', async ({ context, extensionId }) => {
  await setUp(context, extensionId);
  const page = await context.newPage();
  await page.goto('https://accounts.example.test/signup');
  await pressFieldButton(page.mainFrame(), '#new');
  const menu = await frameOf(page, 'menu.html');
  await menu.getByRole('button', { name: /Use a strong password/ }).click();
  const value = await page.locator('#new').inputValue();
  expect(value).toHaveLength(20);
  await expect(page.locator('#again')).toHaveValue(value);
  await expect(page.locator('#email')).toHaveValue('');
});

test('a sign-in sent while locked waits in the popup until unlocked', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await popup.getByRole('button', { name: 'Lock' }).click();
  const page = await context.newPage();
  await page.goto('https://login.example.test/');
  await page.locator('#email').fill('carol@example.test');
  await page.locator('#password').fill('carols-password-9');
  await page.getByRole('button', { name: 'Sign in' }).click();
  const prompt = await frameOf(page, 'prompt.html');
  await prompt.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(prompt.getByText(/unlock/i)).toBeVisible();

  await page.bringToFront();
  const again = await openPopup(context, extensionId);
  await page.bringToFront();
  await again.locator('#master').fill(MASTER);
  await again.getByRole('button', { name: 'Unlock' }).click();
  await expect(again.getByTestId('pending')).toContainText('carol@example.test on example.test');
  await again.getByTestId('pending').getByRole('button', { name: 'Save' }).click();
  await expect(again.getByText('carol@example.test').first()).toBeVisible();
});
