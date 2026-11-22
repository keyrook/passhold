import { addLogin, expect, frameOf, MASTER, openPopup, openSettings, pressFieldButton, settingsTab, setUp, test } from './fixtures.js';

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

test('runs nothing of its own in Passhold’s web vault: no button, no list, no save, no passkey answered', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, ALICE);
  // The web vault's sign-in, served where the test build keeps it (scripts/api.mjs), and the same form on any other site.
  const form = `<!doctype html><title>Passhold</title>
    <form action="/in"><label>Email <input id="email" name="username" type="email" autocomplete="username"></label>
    <label>Account password <input id="password" name="password" type="password" autocomplete="current-password"></label><button>Sign in</button></form>`;
  for (const origin of ['http://localhost:5176', 'https://vaultlike.example.test']) {
    await context.route(`${origin}/**`, (route) => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: new URL(route.request().url()).pathname === '/' ? form : '<!doctype html><p>In.</p>' }));
  }
  const overlays = (frame: import('@playwright/test').Frame) => frame.evaluate(() => document.querySelectorAll('passhold-overlay').length);
  const signIn = async (origin: string) => {
    const tab = await context.newPage();
    await tab.goto(`${origin}/`);
    await tab.locator('#email').click();
    await tab.waitForTimeout(800);
    return tab;
  };

  const elsewhere = await signIn('https://vaultlike.example.test');
  await expect.poll(() => overlays(elsewhere.mainFrame())).toBeGreaterThan(0);

  const vault = await signIn('http://localhost:5176');
  expect(await overlays(vault.mainFrame())).toBe(0);
  expect(vault.frames().some((frame) => frame.url().includes('menu.html'))).toBe(false);
  await vault.locator('#email').fill(ALICE.username);
  await vault.locator('#password').fill('the-account-password-1');
  await vault.getByRole('button', { name: 'Sign in' }).click();
  await vault.waitForURL(/\/in/);
  await vault.waitForTimeout(1500);
  expect(vault.frames().some((frame) => frame.url().includes('prompt.html'))).toBe(false);
  // Its passkey requests are for the account's passkeys, which open the root: no bridge of Passhold's hears them.
  await vault.goto('http://localhost:5176/');
  const answered = await vault.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        addEventListener('message', (event) => {
          if ((event.data as { kind?: string })?.kind === 'answers') resolve(true);
        });
        postMessage({ source: 'passhold-webauthn', kind: 'canAnswer', id: 'probe' }, location.origin);
        setTimeout(() => resolve(false), 1000);
      }),
  );
  expect(answered).toBe(false);
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
  // Which login, and that its old password is kept: never worded as a save.
  await expect(prompt.getByTestId('prompt-body')).toHaveText(`${ALICE.username} on example.test`);
  await expect(prompt.getByTestId('prompt-note')).toHaveText('The old password is kept in the login’s history.');
  // Refusing one change is not refusing the site.
  await expect(prompt.getByRole('button', { name: 'Never for this site' })).toHaveCount(0);
  await prompt.getByRole('button', { name: 'Update' }).click();
  await expect(prompt.getByText('Password updated in Passhold.')).toBeVisible();

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

test('offers to save nothing on the Keyrook account’s page, whose password is the one Passhold opens with', async ({ context, extensionId }) => {
  await setUp(context, extensionId);
  // The account page's own forms: an invitation by address, then a family made under the password, as it asks to confirm.
  const page = `<!doctype html><title>Family</title>
    <form action="/invited"><label>Their email <input name="email" type="email" autocomplete="off"></label><button>Send invitation</button></form>
    <form action="/made"><label>Family name <input name="familyName" autocomplete="off"></label>
    <label>Your password <input name="password" type="password" autocomplete="current-password"></label><button>Make the family</button></form>`;
  const done = '<!doctype html><title>Done</title><p>Done.</p>';
  // The test build's account page (scripts/api.mjs), and, to hold the result to, the same page on any other site.
  for (const origin of ['http://localhost:5174', 'https://family.example.test']) {
    await context.route(`${origin}/**`, (route) => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: new URL(route.request().url()).pathname === '/family' ? page : done }));
  }
  const send = async (origin: string) => {
    const tab = await context.newPage();
    await tab.goto(`${origin}/family`);
    await tab.locator('input[name=email]').fill('bob@example.test');
    await tab.getByRole('button', { name: 'Send invitation' }).click();
    await tab.waitForURL(/\/invited/);
    await tab.goto(`${origin}/family`);
    await tab.locator('input[name=familyName]').fill('Our family');
    await tab.locator('input[name=password]').fill('the-account-password-1');
    await tab.getByRole('button', { name: 'Make the family' }).click();
    await tab.waitForURL(/\/made/);
    return tab;
  };

  const elsewhere = await send('https://family.example.test');
  await expect((await frameOf(elsewhere, 'prompt.html')).getByText('Save login to Passhold?')).toBeVisible();

  const account = await send('http://localhost:5174');
  await account.waitForTimeout(1500);
  expect(account.frames().some((frame) => frame.url().includes('prompt.html'))).toBe(false);
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

const promptUp = (page: import('@playwright/test').Page) => page.frames().some((frame) => frame.url().includes('prompt.html'));

test('asks nothing about a password the site refused, and asks once it takes one', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, ALICE);
  const page = await context.newPage();

  // A server-drawn sign-in that comes back to its form: the password was wrong.
  await page.goto('https://login.example.test/again');
  await page.locator('#email').fill(ALICE.username);
  await page.locator('#password').fill('a-typo');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForLoadState();
  await page.waitForTimeout(1500);
  expect(promptUp(page)).toBe(false);
  // Nor does the popup offer to put the typo over the saved password.
  const again = await openPopup(context, extensionId);
  await expect(again.getByTestId('pending')).toHaveCount(0);
  await again.close();

  // A sign-in drawn by script: a refused password leaves the form where it was.
  await page.goto('https://login.example.test/app');
  await page.locator('#email').fill(ALICE.username);
  await page.locator('#password').fill('another-typo');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Wrong password')).toBeVisible();
  await page.waitForTimeout(1500);
  expect(promptUp(page)).toBe(false);
  // Leaving for "forgot password?" is not the sign-in moving on.
  await page.locator('#forgot').click();
  await page.waitForURL('https://login.example.test/welcome');
  await page.waitForTimeout(1500);
  expect(promptUp(page)).toBe(false);

  // The right one puts the form away: that one is offered.
  await page.goto('https://login.example.test/app');
  await page.locator('#email').fill(ALICE.username);
  await page.locator('#password').fill('right-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Welcome')).toBeVisible();
  const prompt = await frameOf(page, 'prompt.html');
  await expect(prompt.getByText('Update the password in Passhold?')).toBeVisible();
  await prompt.getByRole('button', { name: 'Update' }).click();
  await expect(prompt.getByText('Password updated in Passhold.')).toBeVisible();
  const items = await popup.evaluate(async () => {
    const status = (await chrome.runtime.sendMessage({ type: 'vault/status' })) as { value: { data: { items: { password: string }[] } } };
    return status.value.data.items;
  });
  expect(items.map((item) => item.password)).toEqual(['right-password']);
});

test('a password asked for on the page after the email goes to that account, not another one of the site', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, { title: 'Steps', username: 'alice@example.test', password: 'alices-password', url: 'https://steps.example.test/' });
  await addLogin(popup, { title: 'Steps', username: 'bob@example.test', password: 'bobs-password', url: 'https://steps.example.test/' });
  const page = await context.newPage();
  await page.goto('https://steps.example.test/');
  await page.locator('#email').fill('Bob@example.test');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForURL('https://steps.example.test/password');
  await page.locator('#password').fill('bobs-new-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('https://steps.example.test/home');

  const prompt = await frameOf(page, 'prompt.html');
  await expect(prompt.getByText('Update the password in Passhold?')).toBeVisible();
  await expect(prompt.getByTestId('prompt-body')).toHaveText('bob@example.test on example.test');
  await prompt.getByRole('button', { name: 'Update' }).click();
  await expect(prompt.getByText('Password updated in Passhold.')).toBeVisible();
  const items = await popup.evaluate(async () => {
    const status = (await chrome.runtime.sendMessage({ type: 'vault/status' })) as { value: { data: { items: { username: string; password: string }[] } } };
    return status.value.data.items.map(({ username, password }) => ({ username, password }));
  });
  expect(items).toHaveLength(2);
  expect(items).toContainEqual({ username: 'alice@example.test', password: 'alices-password' });
  expect(items).toContainEqual({ username: 'bob@example.test', password: 'bobs-new-password' });
});

test('draws clear of where Chrome draws its own: the list beside the field, the prompt in the bottom corner', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, { ...ALICE, url: 'https://login.example.test/eye' });
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('https://login.example.test/eye');
  await pressFieldButton(page.mainFrame(), '#email');
  await frameOf(page, 'menu.html');
  const field = (await page.locator('#email').boundingBox())!;
  const list = await menuBox(page);
  // Beside the field's end, not under it, where Chrome's list of saved passwords would cover it.
  expect(list.x).toBeGreaterThanOrEqual(field.x + field.width);
  expect(list.y).toBeLessThanOrEqual(field.y + field.height);

  await page.keyboard.press('Escape');
  await page.goto('https://login.example.test/');
  await page.locator('#email').fill('bob@example.test');
  await page.locator('#password').fill('a-brand-new-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('https://login.example.test/welcome');
  await frameOf(page, 'prompt.html');
  await page.waitForTimeout(500);
  const prompt = await frameBox(page, 'prompt.html');
  // The bottom right, not the top, where Chrome asks to save from its address bar.
  expect(prompt.y).toBeGreaterThan(720 / 2);
  expect(prompt.y + prompt.height).toBeLessThanOrEqual(720);
  expect(prompt.x + prompt.width).toBeGreaterThan(1280 - 40);
  // As tall as its card: no strip of frame over the page above it.
  expect(prompt.height).toBeLessThan(160);
});

test('the button keeps off the page\u2019s own control at the field\u2019s end, and is drawn in a dialog the page opened', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, { ...ALICE, url: 'https://login.example.test/dialog' });
  const page = await context.newPage();
  await page.goto('https://login.example.test/eye');
  await page.locator('#password').click();
  await page.waitForTimeout(500);
  const eye = (await page.locator('#eye').boundingBox())!;
  // What is under the eye is the eye, not Passhold's button over it.
  const under = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.id, { x: eye.x + eye.width / 2, y: eye.y + eye.height / 2 });
  expect(under).toBe('eye');
  await page.locator('#eye').click();
  await expect(page.locator('#password')).toHaveAttribute('type', 'text');

  // A sign-in in a dialog opened with showModal(), above the page in the
  // browser's top layer: Passhold's button and list are drawn inside it, or
  // they would be under it and could not be clicked.
  await page.goto('https://login.example.test/dialog');
  await page.locator('#open').click();
  await pressFieldButton(page.mainFrame(), '#email');
  const menu = await frameOf(page, 'menu.html');
  expect(await page.locator('#box passhold-overlay').count()).toBeGreaterThan(0);
  await menu.getByRole('button', { name: /Example/ }).click();
  await expect(page.locator('#email')).toHaveValue(ALICE.username);
  await expect(page.locator('#password')).toHaveValue(ALICE.password);
});

/** Where one of Passhold's frames is on the page, by the frame element's box. */
async function frameBox(page: import('@playwright/test').Page, file: string) {
  const frame = page.frames().find((each) => each.url().includes(file))!;
  const element = await frame.frameElement();
  return (await element.boundingBox())!;
}

const menuBox = (page: import('@playwright/test').Page) => frameBox(page, 'menu.html');

test('stays out of email fields that are not a sign-in: a newsletter, a message to the site', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, ALICE);
  const page = await context.newPage();
  await page.goto('https://login.example.test/news');
  await page.locator('#news').click();
  await page.locator('#mail').click();
  await page.waitForTimeout(800);
  expect(await page.locator('passhold-overlay').count()).toBe(0);
  // A sign-in's first step, named so by its page, still has it.
  await page.goto('https://steps.example.test/');
  await page.locator('#email').click();
  await expect.poll(() => page.locator('passhold-overlay').count()).toBeGreaterThan(0);
});

test('Settings opens the browser\u2019s own password settings, to turn its offer to save off without a permission', async ({ context, extensionId }) => {
  await setUp(context, extensionId);
  const options = await openSettings(context, extensionId);
  await settingsTab(options, 'General');
  await expect(options.getByText('The browser’s own password manager')).toBeVisible();
  const [opened] = await Promise.all([context.waitForEvent('page'), options.getByRole('button', { name: 'Open its settings' }).click()]);
  await expect.poll(() => opened.url()).toContain('chrome://password-manager/settings');
});
