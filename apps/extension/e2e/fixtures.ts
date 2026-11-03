import { test as base, chromium, expect, type BrowserContext, type CDPSession, type Frame, type Page, type Worker } from '@playwright/test';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

// The test build: it talks to a Keyrook server on 127.0.0.1 — the kit's, in account-fixtures.ts — never the real one.
const EXTENSION_PATH = resolve(import.meta.dirname, '../../../.tmp/extension-test');
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
/**
 * A site that offers passkeys, as one would: `register()` and `signIn()` call
 * `navigator.credentials` and hand back what the site would receive — the
 * credential in its JSON form, or the error's name.
 */
const PASSKEY_SITE = `<script>
  'use strict';
  const bytes = (text) => new TextEncoder().encode(text);
  const raw = (id) => Uint8Array.from(atob(id.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
  const settle = (promise) => promise.then(
    (c) => {
      // As GitHub's library does, in strict mode: it replaces the credential's toJSON.
      const json = c.toJSON();
      c.toJSON = () => json;
      return { ok: true, isPublicKeyCredential: c instanceof PublicKeyCredential, json: c.toJSON(), extensions: c.getClientExtensionResults() };
    },
    (e) => ({ ok: false, name: e.name, message: e.message }),
  );
  window.register = (o = {}) => settle(navigator.credentials.create({ publicKey: {
    rp: { name: 'Example Passkeys', id: o.rpId },
    user: { id: bytes(o.userId ?? 'user-1'), name: o.name ?? 'alice@example.test', displayName: 'Alice' },
    challenge: bytes(o.challenge ?? 'register-challenge-0001'),
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    excludeCredentials: (o.exclude ?? []).map((id) => ({ type: 'public-key', id: raw(id) })),
    authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
    extensions: { credProps: true },
  } }));
  window.signIn = (o = {}) => settle(navigator.credentials.get({ publicKey: {
    challenge: bytes(o.challenge ?? 'sign-in-challenge-0001'),
    rpId: o.rpId,
    allowCredentials: (o.allow ?? []).map((id) => ({ type: 'public-key', id: raw(id) })),
    userVerification: 'required',
  } }));
</script>`;

const CHECKOUT = `<!doctype html><title>Checkout</title>
  <form id="ship">
    <input id="name" autocomplete="shipping name" placeholder="Full name">
    <input id="street" autocomplete="shipping address-line1" placeholder="Address">
    <input id="street2" autocomplete="shipping address-line2" placeholder="Apartment">
    <input id="city" autocomplete="shipping address-level2" placeholder="City">
    <input id="zip" autocomplete="shipping postal-code" placeholder="ZIP">
    <select id="country" autocomplete="shipping country"><option value="">Country</option><option value="US">United States</option><option value="VN">Vietnam</option></select>
    <input id="tel" type="tel" autocomplete="shipping tel" placeholder="Phone">
    <input id="email" type="email" autocomplete="email" placeholder="Email">
  </form>
  <form id="pay">
    <input id="cc-name" autocomplete="cc-name" placeholder="Name on card">
    <input id="cc-number" autocomplete="cc-number" inputmode="numeric" placeholder="Card number">
    <input id="cc-exp" autocomplete="cc-exp" placeholder="MM / YY">
    <input id="cc-csc" autocomplete="cc-csc" placeholder="CVC">
    <input id="cc-hidden" autocomplete="cc-number" style="opacity:0;position:absolute;left:-9999px">
  </form>`;

/** A checkout that is sent: its address and card in one form, and a card number it hides before the one it shows. */
const PAY = `<!doctype html><title>Pay</title>
  <form id="order" action="/paid" method="post">
    <input id="name" autocomplete="shipping name" placeholder="Full name">
    <input id="street" autocomplete="shipping address-line1" placeholder="Address">
    <input id="city" autocomplete="shipping address-level2" placeholder="City">
    <select id="country" autocomplete="shipping country"><option value="">Country</option><option value="US">United States</option><option value="VN">Vietnam</option></select>
    <input id="tel" type="tel" autocomplete="shipping tel" placeholder="Phone">
    <input id="cc-name" autocomplete="cc-name" placeholder="Name on card">
    <input id="cc-decoy" autocomplete="cc-number" value="5555555555554444" style="opacity:0;position:absolute;left:-9999px">
    <input id="cc-number" autocomplete="cc-number" placeholder="Card number">
    <input id="cc-exp" autocomplete="cc-exp" placeholder="MM / YY">
    <input id="cc-csc" autocomplete="cc-csc" placeholder="CVC">
    <button type="submit">Pay</button>
  </form>`;

export const SITES: Record<string, string> = {
  'https://passkeys.example.test/': `<!doctype html><title>Passkeys</title><h1>Passkeys</h1>${PASSKEY_SITE}`,
  'https://other.example.test/': `<!doctype html><title>Other</title><h1>Other</h1>${PASSKEY_SITE}`,
  // The Keyrook account's page, as it asks for its own passkeys: Passhold stays out of it.
  'https://account.keyrook.com/': `<!doctype html><title>Keyrook account</title><h1>Keyrook account</h1>${PASSKEY_SITE}`,
  // A sign-in page that offers passkeys in the username field's own list, as it loads.
  'https://passkeys.example.test/login': `<!doctype html><title>Sign in</title>
    <form><input id="username" autocomplete="username webauthn" placeholder="Email"></form>${PASSKEY_SITE}
    <script>window.signedIn = settle(navigator.credentials.get({ mediation: 'conditional', publicKey: { challenge: bytes('conditional-challenge-01') } }));</script>`,
  // The site framing another site, whose page posts as if it were the site's.
  'https://passkeys.example.test/framed': `<!doctype html><title>Framed</title>${PASSKEY_SITE}
    <iframe src="https://evil.test/poster" width="300" height="100"></iframe>`,
  'https://evil.test/poster': `<!doctype html><title>Poster</title><script>
    window.forge = () => parent.postMessage({ source: 'passhold-webauthn', kind: 'request', id: 'forged', op: 'get',
      options: { challenge: 'AAAAAAAAAAAAAAAAAAAAAA' }, conditional: false }, '*');
  </script>`,
  // Bot checks, as Cloudflare serves them: in a frame of their own host, and on a site's own /cdn-cgi/.
  'https://challenges.cloudflare.com/turnstile': `<!doctype html><title>Turnstile</title>
    <form><input id="email" type="email" autocomplete="username"><input id="password" type="password"></form>`,
  'https://login.example.test/cdn-cgi/challenge': `<!doctype html><title>Just a moment</title>
    <form><input id="email" type="email" autocomplete="username"><input id="password" type="password"></form>`,
  // A page on a shared host (github.io is a private public suffix) naming the suffix as its site.
  'https://alice.github.io/': `<!doctype html><title>Alice</title>${PASSKEY_SITE}`,
  'https://login.example.test/': `<!doctype html><title>Sign in</title>
    <form action="/welcome" method="post">
      <input id="email" name="email" type="email" autocomplete="username" placeholder="Email">
      <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Password">
      <button type="submit">Sign in</button>
    </form>`,
  'https://login.example.test/welcome': `<!doctype html><title>Welcome</title><h1>Welcome</h1>`,
  // A sign-in page long enough to scroll, so the page can move the list from under a pointer.
  'https://login.example.test/tall': `<!doctype html><title>Sign in</title>
    <form><input id="email" type="email" autocomplete="username" placeholder="Email"><input id="password" type="password" autocomplete="current-password"></form>
    <div style="height: 3000px"></div>`,
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
  // A page whose own script puts the cursor in the email field.
  'https://login.example.test/autofocus': `<!doctype html><title>Autofocus</title>
    <form><input id="email" type="email" autocomplete="username"><input id="password" type="password"></form>
    <script>setTimeout(() => document.getElementById('email').focus(), 300)</script>`,
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
  // A checkout that names its fields as HTML does, with a card number it hides beside the one it shows.
  'https://shop.example.test/checkout': CHECKOUT,
  'http://shop.example.test/checkout': CHECKOUT,
  'https://shop.example.test/pay': PAY,
  'http://shop.example.test/pay': PAY,
  'https://shop.example.test/paid': `<!doctype html><title>Paid</title><h1>Thank you</h1>`,
  'http://shop.example.test/paid': `<!doctype html><title>Paid</title><h1>Thank you</h1>`,
  // A Vietnamese checkout that names its fields only in words, with lists for the expiry and the code hidden as a password.
  'https://shop.example.test/vi': `<!doctype html><html lang="vi"><title>Thanh toán</title>
    <form id="giao-hang">
      <input id="ho-ten" placeholder="Họ và tên">
      <input id="dia-chi" placeholder="Địa chỉ (số nhà, đường)">
      <input id="tinh" placeholder="Tỉnh / Thành phố">
      <input id="sdt" placeholder="Số điện thoại">
      <input id="thu" type="email" placeholder="Email">
    </form>
    <form id="the" action="/xong" method="post">
      <input id="so-the" name="so_the" placeholder="Số thẻ">
      <input id="chu-the" placeholder="Tên chủ thẻ">
      <label for="thang">Tháng</label><select id="thang" name="thang"><option value="">--</option>${[...Array(12)].map((_, i) => `<option value="${String(i + 1).padStart(2, '0')}">${String(i + 1).padStart(2, '0')}</option>`).join('')}</select>
      <label for="nam">Năm</label><select id="nam" name="nam"><option value="">--</option>${[...Array(12)].map((_, i) => `<option>${2025 + i}</option>`).join('')}</select>
      <input id="cvv" type="password" placeholder="CVV">
      <button type="submit">Thanh toán</button>
    </form></html>`,
  'https://shop.example.test/xong': `<!doctype html><title>Xong</title><h1>Cảm ơn</h1>`,
  // A checkout whose card is in the payment provider's frames, one field each, beside a frame of another site's.
  'https://shop.example.test/frames': `<!doctype html><title>Pay</title>
    <iframe id="number" src="https://pay.example.test/number" width="320" height="60"></iframe>
    <iframe id="expiry" src="https://pay.example.test/expiry" width="160" height="60"></iframe>
    <iframe id="code" src="https://pay.example.test/code" width="160" height="60"></iframe>
    <iframe id="other" src="https://evil.test/card-number" width="320" height="60"></iframe>`,
  'https://pay.example.test/number': `<!doctype html><title>Number</title><input id="field" autocomplete="cc-number" placeholder="Card number">`,
  'https://pay.example.test/expiry': `<!doctype html><title>Expiry</title><input id="field" autocomplete="cc-exp" placeholder="MM/YY">`,
  'https://pay.example.test/code': `<!doctype html><title>Code</title><input id="field" autocomplete="cc-csc" placeholder="CVC">`,
  'https://evil.test/card-number': `<!doctype html><title>Other</title><input id="field" autocomplete="cc-number" placeholder="Card number">`,
};

async function serve(context: BrowserContext): Promise<void> {
  await context.route(/^https?:\/\/[^/]*\.?(example\.test|evil\.test|alice\.github\.io|challenges\.cloudflare\.com|account\.keyrook\.com)\//, async (route) => {
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

/** A browser with the test build loaded, in a throwaway profile: one device. */
export async function launchBrowser(): Promise<{ context: BrowserContext; close: () => Promise<void> }> {
  mkdirSync(PROFILE_ROOT, { recursive: true });
  const profile = mkdtempSync(join(PROFILE_ROOT, 'chrome-'));
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    downloadsPath: DOWNLOADS,
    args: [`--disable-extensions-except=${EXTENSION_PATH}`, `--load-extension=${EXTENSION_PATH}`],
  });
  await serve(context);
  return {
    context,
    close: async () => {
      await context.close();
      rmSync(profile, { recursive: true, force: true });
    },
  };
}

/** The extension in a browser launched here: its service worker and its id. */
export async function extensionOf(context: BrowserContext): Promise<{ worker: Worker; extensionId: string }> {
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  return { worker, extensionId: new URL(worker.url()).host };
}

export const test = base.extend<Extension>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const browser = await launchBrowser();
    await use(browser.context);
    await browser.close();
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

/**
 * Passhold's content script world in a page's top frame, reached as a page
 * that took over its renderer could reach it: what runs here runs with the
 * content script's own `chrome.*`. Navigates the page to `url` first, so as
 * to see the world made.
 */
export async function contentWorld(page: Page, url: string): Promise<(expression: string) => Promise<unknown>> {
  const cdp = await page.context().newCDPSession(page);
  const worlds: { id: number; origin: string; auxData?: { type?: string; frameId?: string } }[] = [];
  cdp.on('Runtime.executionContextCreated', ({ context }) => worlds.push(context));
  await cdp.send('Runtime.enable');
  await page.goto(url);
  const { frameTree } = await cdp.send('Page.getFrameTree');
  const find = () =>
    [...worlds].reverse().find((each) => each.auxData?.type === 'isolated' && each.origin.startsWith('chrome-extension://') && each.auxData.frameId === frameTree.frame.id);
  for (let tries = 0; !find() && tries < 50; tries++) await page.waitForTimeout(100);
  const world = find();
  if (!world) throw new Error(`No content script in ${url}.`);
  return async (expression) => {
    const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', { expression, contextId: world.id, awaitPromise: true, returnByValue: true });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    return result.value as unknown;
  };
}

export async function openPopup(context: BrowserContext, extensionId: string): Promise<Page> {
  const page = await context.newPage();
  await page.setViewportSize({ width: 380, height: 600 });
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  return page;
}

/**
 * A vault with the master password above, and no account — as one from
 * before Passhold started with an account. Made by the service worker as the
 * last step of signing in makes it; tests of signing in go through the pages.
 */
export async function setUp(context: BrowserContext, extensionId: string): Promise<Page> {
  const popup = await openPopup(context, extensionId);
  await popup.evaluate((password) => chrome.runtime.sendMessage({ type: 'vault/create', password }), MASTER);
  await popup.reload();
  await expect(popup.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
  return popup;
}

/** "Add", then what to add: a login, a card, an address or a note. */
export async function addNew(page: Page, kind: 'Login' | 'Card' | 'Address' | 'Note'): Promise<void> {
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('menuitem', { name: kind, exact: true }).click();
}

export async function addLogin(popup: Page, login: { title?: string; username: string; password: string; url: string }) {
  await addNew(popup, 'Login');
  if (login.title) await popup.getByLabel('Name', { exact: true }).fill(login.title);
  await popup.getByLabel('Username or email').fill(login.username);
  await popup.locator('#password').fill(login.password);
  await popup.locator('#urls').fill(login.url);
  await popup.getByRole('button', { name: 'Save' }).click();
  await expect(popup.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
}

/**
 * A vault just made to open with a password or a code offers a PIN before
 * anything else; a test that is about something else goes on without one.
 */
export async function skipPinOffer(page: Page): Promise<void> {
  await page.getByTestId('pin-offer').getByRole('button', { name: 'Not now' }).click();
}

/**
 * The screen that shows a recovery key, passed as its owner passes it: the key
 * read off, "I have saved it", and the two groups it then asks for typed back
 * from what was read. Returns the key.
 */
export async function keepRecoveryKey(page: Page): Promise<string> {
  const key = (await page.getByTestId('recovery-key').textContent())!.trim();
  await page.getByRole('button', { name: 'I have saved it' }).click();
  const check = page.getByTestId('recovery-key-check');
  const groups = key.split('-');
  for (const label of await check.locator('label').allTextContents()) {
    await check.getByLabel(label, { exact: true }).fill(groups[Number(label.replace(/\D/g, '')) - 1]!);
  }
  await check.getByRole('button', { name: 'Check' }).click();
  await expect(check).toHaveCount(0);
  return key;
}

/** Settings, opened in a tab of their own, on an unlocked vault. */
export async function openSettings(context: BrowserContext, extensionId: string, hash = ''): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options.html${hash}`);
  await expect(page.getByRole('navigation', { name: 'Settings' }).getByRole('button').first()).toBeVisible();
  return page;
}

/** A tab of Settings, by the name in its sidebar. */
export async function settingsTab(options: Page, name: string): Promise<void> {
  await options.getByRole('navigation').getByRole('button', { name, exact: true }).click();
}

/** One of the views of Passwords in Settings, by the start of its name: the trash, what needs attention. */
export async function passwordsView(options: Page, name: 'All' | 'Needs attention' | 'Trash'): Promise<void> {
  await settingsTab(options, 'Passwords');
  await options.getByRole('radio', { name: new RegExp(`^${name}`) }).click();
}

/** Open the backup form in Settings. */
export async function openBackupForm(options: Page): Promise<void> {
  await settingsTab(options, 'Account & sync');
  await options.getByRole('button', { name: /^Back up/ }).click();
}

/** Make a backup from the settings tab and hand back the file it downloads. */
export async function downloadBackup(options: Page, password = MASTER): Promise<Buffer> {
  if (!(await options.locator('#backup').isVisible())) await openBackupForm(options);
  await options.locator('#backup').getByLabel('Current master password').fill(password);
  const [download] = await Promise.all([options.waitForEvent('download'), options.getByRole('button', { name: 'Download backup' }).click()]);
  expect(download.suggestedFilename()).toMatch(/^passhold-backup-\d{4}-\d{2}-\d{2}\.json$/);
  return readFileSync((await download.path())!);
}

/**
 * A tab with a stand-in for Touch ID: Chromium's virtual authenticator, built
 * in, user-verifying and answering PRF. Added before the page loads, so the
 * page finds it when it asks whether there is one. `prf: false, largeBlob:
 * true` stands in for iCloud Keychain before macOS 15; `transport: 'usb'`,
 * for a USB security key instead.
 */
export async function pageWithAuthenticator(
  context: BrowserContext,
  options: AuthenticatorOptions = {},
): Promise<{ page: Page } & VirtualAuthenticator> {
  const page = await context.newPage();
  return { page, ...(await addAuthenticator(page, options)) };
}

interface AuthenticatorOptions {
  prf?: boolean;
  largeBlob?: boolean;
  transport?: 'internal' | 'usb';
}

interface VirtualAuthenticator {
  remove: () => Promise<void>;
  credentials: () => Promise<number>;
  /** What it holds: whether each is discoverable, taking one of a key's places. */
  held: () => Promise<{ isResidentCredential: boolean }[]>;
  /**
   * Whether it answers a touch by itself. A key that holds nothing for a
   * request ends it when touched, as a real one does; one left plugged in
   * while Touch ID is asked is left untouched, as a person would leave it.
   */
  touched: (on: boolean) => Promise<void>;
}

/** One CDP session a page: turning WebAuthn on in a second would start its authenticators over. */
const sessions = new WeakMap<Page, Promise<CDPSession>>();

/**
 * Another authenticator in a tab: a security key plugged in beside Touch ID,
 * say. A USB one verifies its user itself, as a key with a fingerprint
 * reader does, so no PIN is asked for.
 */
export async function addAuthenticator(page: Page, { prf = true, largeBlob = false, transport = 'internal' }: AuthenticatorOptions = {}): Promise<VirtualAuthenticator> {
  if (!sessions.has(page)) {
    sessions.set(
      page,
      page
        .context()
        .newCDPSession(page)
        .then(async (cdp) => {
          await cdp.send('WebAuthn.enable');
          return cdp;
        }),
    );
  }
  const cdp = await sessions.get(page)!;
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      ctap2Version: 'ctap2_1',
      transport,
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      hasPrf: prf,
      hasLargeBlob: largeBlob,
      automaticPresenceSimulation: true,
    },
  });
  const held = async () => (await cdp.send('WebAuthn.getCredentials', { authenticatorId })).credentials;
  return {
    remove: async () => {
      await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
    },
    credentials: async () => (await held()).length,
    held,
    touched: async (enabled) => {
      await cdp.send('WebAuthn.setAutomaticPresenceSimulation', { authenticatorId, enabled });
    },
  };
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
  await frame.page().waitForTimeout(400);
  // The click may have opened the list by itself; pressing the button then would close it.
  if (frame.page().frames().some((each) => each.url().includes('menu.html'))) return;
  await frame.page().mouse.click(box.x + box.width - 6 - 11, box.y + box.height / 2);
}

export async function frameOf(page: Page, file: 'menu.html' | 'prompt.html' | 'passkey.html'): Promise<Frame> {
  await expect.poll(() => page.frames().some((frame) => frame.url().includes(file))).toBe(true);
  return page.frames().find((frame) => frame.url().includes(file))!;
}

/** Edge on a Mac, as it names itself to a page. */
export const EDGE = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0',
  userAgentMetadata: {
    brands: [
      { brand: 'Microsoft Edge', version: '140' },
      { brand: 'Chromium', version: '140' },
    ],
    fullVersion: '140.0.0.0',
    platform: 'macOS',
    platformVersion: '15.0.0',
    architecture: 'arm',
    model: '',
    mobile: false,
  },
};

/** That page as Edge's. */
export async function asEdge(context: BrowserContext, page: Page): Promise<void> {
  await (await context.newCDPSession(page)).send('Emulation.setUserAgentOverride', EDGE);
}
