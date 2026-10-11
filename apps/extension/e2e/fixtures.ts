import { test as base, chromium, expect, type BrowserContext, type Frame, type Page, type Worker } from '@playwright/test';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const EXTENSION_PATH = resolve(import.meta.dirname, '../dist');
// Throwaway profiles stay inside the repository: nothing a test does may
// leave anything behind on the machine.
const PROFILE_ROOT = resolve(import.meta.dirname, '../../../.tmp/profiles');
const DOWNLOADS = resolve(import.meta.dirname, '../../../.tmp/downloads');

export const MASTER = 'correct horse battery staple';

/**
 * Sites for the tests to sign in to, served by Playwright itself: the browser
 * navigates to them for real, so the content script runs as it would on the
 * web, but nothing leaves the machine.
 */
export const SITES: Record<string, string> = {
  'https://login.example.test/': `<!doctype html><title>Sign in</title>
    <form action="/welcome" method="post">
      <input id="email" name="email" type="email" autocomplete="username" placeholder="Email">
      <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Password">
      <button type="submit">Sign in</button>
    </form>`,
  'https://login.example.test/welcome': `<!doctype html><title>Welcome</title><h1>Welcome</h1>`,
  'https://accounts.example.test/signup': `<!doctype html><title>Sign up</title>
    <form action="/done" method="post">
      <input id="email" name="email" type="email" autocomplete="username" placeholder="Email">
      <input id="new" name="new" type="password" autocomplete="new-password" placeholder="Password">
      <input id="again" name="again" type="password" autocomplete="new-password" placeholder="Again">
      <button type="submit">Create account</button>
    </form>`,
  'https://accounts.example.test/done': `<!doctype html><title>Done</title><h1>Done</h1>`,
  // A page of one site framing another site's form.
  'https://login.example.test/framed': `<!doctype html><title>Framed</title>
    <iframe src="https://evil.test/form" width="500" height="200"></iframe>`,
  'https://evil.test/form': `<!doctype html><title>Evil</title>
    <form><input id="email" type="email" autocomplete="username"><input id="password" type="password"></form>`,
  // The same login page over plain http.
  'http://login.example.test/': `<!doctype html><title>Plain</title>
    <form><input id="email" type="email" autocomplete="username"><input id="password" type="password"></form>`,
  // A page that hides a second password field beside the visible one.
  'https://login.example.test/trap': `<!doctype html><title>Trap</title>
    <form>
      <input id="email" type="email" autocomplete="username">
      <input id="password" type="password">
      <input id="hidden" type="password" style="opacity:0;position:absolute;left:-9999px">
    </form>`,
};

async function serve(context: BrowserContext): Promise<void> {
  await context.route(/^https?:\/\/[^/]*\.?(example\.test|evil\.test)\//, async (route) => {
    const url = route.request().url().split('?')[0]!;
    const body = SITES[url];
    if (!body) return route.fulfill({ status: 404, body: 'not found' });
    await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body });
  });
}

export interface Extension {
  context: BrowserContext;
  extensionId: string;
  worker: Worker;
}

export const test = base.extend<Extension>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    mkdirSync(PROFILE_ROOT, { recursive: true });
    const profile = mkdtempSync(join(PROFILE_ROOT, 'chrome-'));
    const context = await chromium.launchPersistentContext(profile, {
      channel: 'chromium',
      downloadsPath: DOWNLOADS,
      args: [`--disable-extensions-except=${EXTENSION_PATH}`, `--load-extension=${EXTENSION_PATH}`],
    });
    await serve(context);
    await use(context);
    await context.close();
    rmSync(profile, { recursive: true, force: true });
  },
  worker: async ({ context }, use) => {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    await use(worker);
  },
  extensionId: async ({ worker }, use) => {
    await use(new URL(worker.url()).host);
  },
});

export { expect };

export async function openPopup(context: BrowserContext, extensionId: string): Promise<Page> {
  const page = await context.newPage();
  await page.setViewportSize({ width: 380, height: 600 });
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  return page;
}

/** A vault with the master password above, made through the real setup screen. */
export async function setUp(context: BrowserContext, extensionId: string): Promise<Page> {
  const popup = await openPopup(context, extensionId);
  await popup.locator('#master').fill(MASTER);
  await popup.locator('#confirm').fill(MASTER);
  await popup.getByRole('checkbox').check();
  await popup.getByRole('button', { name: 'Create vault' }).click();
  await expect(popup.getByRole('button', { name: 'New login' }).first()).toBeVisible();
  return popup;
}

export async function addLogin(popup: Page, login: { title?: string; username: string; password: string; url: string }) {
  await popup.getByRole('button', { name: 'New login' }).first().click();
  if (login.title) await popup.getByLabel('Name', { exact: true }).fill(login.title);
  await popup.getByLabel('Username or email').fill(login.username);
  await popup.locator('#password').fill(login.password);
  await popup.locator('#urls').fill(login.url);
  await popup.getByRole('button', { name: 'Save' }).click();
  await expect(popup.getByRole('button', { name: 'New login' }).first()).toBeVisible();
}

/** Settings, opened in a tab of their own. */
export async function openSettings(context: BrowserContext, extensionId: string, hash = ''): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options.html${hash}`);
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  return page;
}

/** Make a backup from the settings tab and hand back the file it downloads. */
export async function downloadBackup(options: Page, password = MASTER): Promise<Buffer> {
  await options.locator('#backup').getByLabel('Current master password').fill(password);
  const [download] = await Promise.all([options.waitForEvent('download'), options.getByRole('button', { name: 'Download backup' }).click()]);
  expect(download.suggestedFilename()).toMatch(/^passhold-backup-\d{4}-\d{2}-\d{2}\.json$/);
  return readFileSync((await download.path())!);
}

/** Everything the extension keeps on disk, as one string. */
export async function diskDump(worker: Worker): Promise<string> {
  return worker.evaluate(async () => JSON.stringify(await chrome.storage.local.get(null)));
}

/**
 * Focus a field and press the Passhold button in it. The button sits in a
 * closed shadow root — out of reach of the page, and of Playwright's
 * selectors too — so it is pressed where it is drawn: at the field's end.
 */
export async function pressFieldButton(frame: Frame, selector: string): Promise<void> {
  const field = frame.locator(selector);
  await field.click();
  const box = await field.boundingBox();
  if (!box) throw new Error(`no box for ${selector}`);
  await frame.page().waitForTimeout(250);
  await frame.page().mouse.click(box.x + box.width - 6 - 11, box.y + box.height / 2);
}

export async function frameOf(page: Page, file: 'menu.html' | 'prompt.html'): Promise<Frame> {
  await expect.poll(() => page.frames().some((frame) => frame.url().includes(file))).toBe(true);
  return page.frames().find((frame) => frame.url().includes(file))!;
}
