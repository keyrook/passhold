import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { BrowserContext, Page } from '@playwright/test';
import { addLogin, expect, frameOf, launchBrowser, PASSKEY_SITE, setUp, test as base, addAuthenticator } from './fixtures.js';

/**
 * The build a store is handed, rather than the test build: the test build
 * keeps its scripts off its own stand-ins for the account's page and the web
 * vault (localhost:5174 and :5176), which proves that build's manifest and
 * nothing about the one people install. This one names the real pages, and is
 * held to them here, in the browser, where a wrong pattern would show.
 * `node scripts/build.mjs --store` writes it, before the suite (test:e2e).
 */
const STORE_BUILD = resolve(import.meta.dirname, '../../../.tmp/extension-store');

/**
 * It talks to the official server, so nothing may reach that server or its
 * file store from here: Chromium resolves neither name. The pages below are
 * answered by Playwright before any name is looked up.
 */
const OFFLINE = '--host-resolver-rules=MAP keyrook.com ~NOTFOUND, MAP *.keyrook.com ~NOTFOUND, MAP *.r2.cloudflarestorage.com ~NOTFOUND';

const test = base.extend({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    if (!existsSync(resolve(STORE_BUILD, 'manifest.json'))) throw new Error('No store build at .tmp/extension-store. Run: node scripts/build.mjs --store');
    const browser = await launchBrowser({ extension: STORE_BUILD, args: [OFFLINE] });
    await use(browser.context);
    await browser.close();
  },
});

const VAULT = 'https://vault.keyrook.com';
const ACCOUNT = 'https://account.keyrook.com';
const ELSEWHERE = 'https://signin.example.test';

/** A sign-in that is sent, with a site's passkey calls: the web vault's, the account page's, or anyone's. */
const SIGN_IN = `<!doctype html><title>Sign in</title>
  <form action="/in" method="post"><input id="email" name="email" type="email" autocomplete="username" placeholder="Email">
  <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Password">
  <button type="submit">Sign in</button></form>${PASSKEY_SITE}`;

async function serveSignIn(context: BrowserContext): Promise<void> {
  // After the suite's own sites, so these answer first.
  await context.route(/^https:\/\/(vault\.keyrook\.com|account\.keyrook\.com|signin\.example\.test)\//, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: new URL(route.request().url()).pathname === '/' ? SIGN_IN : '<!doctype html><p>In.</p>' }),
  );
}

/**
 * Passhold's content scripts' worlds in a tab's top frame, once it has loaded
 * and they would be there. In a tab of its own, closed after: a second CDP
 * session on a page makes Chromium refuse WebAuthn in it ("not supported on
 * sites with TLS certificate errors"), which would pass the passkey checks
 * for the wrong reason.
 */
async function extensionWorlds(context: BrowserContext, url: string): Promise<number> {
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  let worlds: { origin: string; auxData?: { type?: string; frameId?: string } }[] = [];
  cdp.on('Runtime.executionContextCreated', ({ context }) => worlds.push(context));
  cdp.on('Runtime.executionContextsCleared', () => (worlds = []));
  await cdp.send('Runtime.enable');
  await page.goto(url);
  await page.waitForLoadState('load');
  await page.waitForTimeout(800);
  const { frameTree } = await cdp.send('Page.getFrameTree');
  const count = worlds.filter((each) => each.auxData?.type === 'isolated' && each.origin.startsWith('chrome-extension://') && each.auxData.frameId === frameTree.frame.id).length;
  await cdp.detach();
  await page.close();
  return count;
}

/** Whether Passhold's passkey bridge answers the page, as webauthn.js asks it before every request. */
const bridgeAnswers = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        addEventListener('message', (event) => {
          if ((event.data as { kind?: string })?.kind === 'answers') resolve(true);
        });
        postMessage({ source: 'passhold-webauthn', kind: 'canAnswer', id: 'probe' }, location.origin);
        setTimeout(() => resolve(false), 1000);
      }),
  );

const overlays = (page: Page) => page.evaluate(() => document.querySelectorAll('passhold-overlay').length);
const passhold = (page: Page, file: string) => page.frames().some((frame) => frame.url().includes(file));
const register = (page: Page) => page.evaluate(() => (window as unknown as { register: (o: unknown) => Promise<{ ok: boolean; isPublicKeyCredential?: boolean }> }).register({}));
const signIn = (page: Page) => page.evaluate(() => (window as unknown as { signIn: (o: unknown) => Promise<{ ok: boolean }> }).signIn({}));

async function send(page: Page): Promise<void> {
  await page.locator('#email').fill('alice@example.test');
  await page.locator('#password').fill('the-account-password-1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/in$/);
}

async function passkeysKept(popup: Page): Promise<number> {
  const status = (await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/status' }))) as { value: { data: { items: { passkey?: unknown }[] } } };
  return status.value.data.items.filter((item) => item.passkey).length;
}

/**
 * The same page on a site of no one's: there, this build does all it does —
 * its world, its button, its passkey frame, its offer to save — which is what
 * makes its absence on Keyrook's pages mean something.
 */
async function everythingElsewhere(context: BrowserContext): Promise<void> {
  expect(await extensionWorlds(context, `${ELSEWHERE}/`)).toBeGreaterThan(0);
  const page = await context.newPage();
  await addAuthenticator(page);
  await page.goto(`${ELSEWHERE}/`);
  await page.locator('#email').click();
  await expect.poll(() => overlays(page)).toBeGreaterThan(0);
  expect(await bridgeAnswers(page)).toBe(true);
  const made = register(page);
  await (await frameOf(page, 'passkey.html')).getByRole('button', { name: 'Save it elsewhere' }).click();
  expect(await made).toMatchObject({ ok: true });
  await send(page);
  await expect((await frameOf(page, 'prompt.html')).getByText('Save login to Passhold?')).toBeVisible();
  await page.close();
}

test.describe('the build a store is handed', () => {
  test('is the official server’s, and keeps every script off the web vault and its passkey scripts off the account’s page', () => {
    const manifest = JSON.parse(readFileSync(resolve(STORE_BUILD, 'manifest.json'), 'utf8'));
    expect(manifest.version_name).toBeUndefined();
    expect(manifest.host_permissions).toBeUndefined();
    expect(manifest.content_security_policy.extension_pages).toContain('connect-src https://api.keyrook.com ');
    const scripts = Object.fromEntries(manifest.content_scripts.map((script: { js: string[]; exclude_matches: string[] }) => [script.js[0], script.exclude_matches]));
    expect(Object.keys(scripts).sort()).toEqual(['bridge.js', 'content.js', 'webauthn.js']);
    for (const excluded of Object.values(scripts)) expect(excluded).toContain(`${VAULT}/*`);
    expect(scripts['bridge.js']).toContain(`${ACCOUNT}/*`);
    expect(scripts['webauthn.js']).toContain(`${ACCOUNT}/*`);
  });

  test('runs nothing at all in the web vault: no world, no button, no passkey answered, nothing offered to save', async ({ context, extensionId }) => {
    const popup = await setUp(context, extensionId);
    // A login for the vault's own address: were anything of Passhold's there, it would have this to offer.
    await addLogin(popup, { title: 'Keyrook', username: 'alice@example.test', password: 'the-account-password-1', url: `${VAULT}/` });
    await serveSignIn(context);
    await everythingElsewhere(context);

    expect(await extensionWorlds(context, `${VAULT}/`)).toBe(0);
    const page = await context.newPage();
    const { credentials } = await addAuthenticator(page);
    await page.goto(`${VAULT}/`);
    await page.locator('#email').click();
    await page.waitForTimeout(800);
    expect(await overlays(page)).toBe(0);
    expect(passhold(page, 'menu.html')).toBe(false);
    // Its passkeys are the account's, which open its root: the browser alone makes and answers them.
    expect(await bridgeAnswers(page)).toBe(false);
    const before = await credentials();
    expect(await register(page)).toMatchObject({ ok: true, isPublicKeyCredential: true });
    expect(await credentials()).toBe(before + 1);
    expect(await signIn(page)).toMatchObject({ ok: true });
    expect(passhold(page, 'passkey.html')).toBe(false);
    await send(page);
    await page.waitForTimeout(1500);
    expect(passhold(page, 'prompt.html')).toBe(false);
    expect(await passkeysKept(popup)).toBe(0);
  });

  test('answers no passkey on the account’s page and offers nothing there to save', async ({ context, extensionId }) => {
    const popup = await setUp(context, extensionId);
    await serveSignIn(context);
    await everythingElsewhere(context);

    const page = await context.newPage();
    const { credentials } = await addAuthenticator(page);
    await page.goto(`${ACCOUNT}/`);
    expect(await bridgeAnswers(page)).toBe(false);
    const before = await credentials();
    expect(await register(page)).toMatchObject({ ok: true, isPublicKeyCredential: true });
    expect(await credentials()).toBe(before + 1);
    expect(await signIn(page)).toMatchObject({ ok: true });
    expect(passhold(page, 'passkey.html')).toBe(false);
    // Its password is the one Passhold opens with: never a login of its own.
    await send(page);
    await page.waitForTimeout(1500);
    expect(passhold(page, 'prompt.html')).toBe(false);
    expect(await passkeysKept(popup)).toBe(0);
  });
});
