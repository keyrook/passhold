import { generateKeyPairSync } from 'node:crypto';
import type { Page } from '@playwright/test';
import { checkAssertion, checkRegistration, type Registered } from '../../../packages/core/test/support/webauthn.js';
import { expect, frameOf, MASTER, openPopup, pageWithAuthenticator, setUp, test } from './fixtures.js';

const SITE = 'https://passkeys.example.test';
const RP = 'passkeys.example.test';

interface Settled {
  ok: boolean;
  name?: string;
  isPublicKeyCredential?: boolean;
  json?: { id: string; rawId: string; type: string; authenticatorAttachment: string; response: Record<string, unknown> };
  extensions?: Record<string, unknown>;
}

const bytes = (text: unknown) => new Uint8Array(Buffer.from(String(text), 'base64url'));
const b64url = (text: string) => Buffer.from(text).toString('base64url');

/** What the site's server would do with a registration. */
function registered(result: Settled, challenge = 'register-challenge-0001'): Registered {
  const response = result.json!.response;
  return checkRegistration(
    { clientDataJSON: bytes(response.clientDataJSON), attestationObject: bytes(response.attestationObject) },
    { rpId: RP, challenge: b64url(challenge), origin: SITE },
  );
}

function signedIn(result: Settled, key: Pick<Registered, 'key'>, challenge = 'sign-in-challenge-0001') {
  const response = result.json!.response;
  return checkAssertion(
    { clientDataJSON: bytes(response.clientDataJSON), authenticatorData: bytes(response.authenticatorData), signature: bytes(response.signature) },
    key,
    { rpId: RP, challenge: b64url(challenge), origin: SITE },
  );
}

const passkeyFrames = (page: Page) => page.frames().filter((frame) => frame.url().includes('passkey.html'));

/** The site asks for a passkey to be made; Passhold's frame says yes. */
async function savePasskey(page: Page, options: Record<string, unknown> = {}): Promise<Settled> {
  const result = page.evaluate((o) => (window as unknown as { register: (o: unknown) => Promise<Settled> }).register(o), options);
  const frame = await frameOf(page, 'passkey.html');
  await frame.getByRole('button', { name: 'Save passkey' }).click();
  return result;
}

const signIn = (page: Page, options: Record<string, unknown> = {}) =>
  page.evaluate((o) => (window as unknown as { signIn: (o: unknown) => Promise<Settled> }).signIn(o), options);

test.describe('websites’ passkeys', () => {
  test('stays out of the Keyrook account’s page: its passkey is the browser’s, never kept in Passhold', async ({ context, extensionId }) => {
    const popup = await setUp(context, extensionId);
    const { page, credentials } = await pageWithAuthenticator(context);
    // Anywhere else, Passhold offers to keep it.
    await page.goto(`${SITE}/`);
    const elsewhere = page.evaluate(() => (window as unknown as { register: (o: unknown) => Promise<Settled> }).register({}));
    const frame = await frameOf(page, 'passkey.html');
    await frame.getByRole('button', { name: 'Save it elsewhere' }).click();
    expect(await elsewhere).toMatchObject({ ok: true });
    expect(await credentials()).toBe(1);

    // There, nothing of Passhold's is in the page: the browser makes the passkey and answers it, PRF and all.
    await page.goto('https://account.keyrook.com/');
    const made = await page.evaluate(() => (window as unknown as { register: (o: unknown) => Promise<Settled> }).register({}));
    expect(made).toMatchObject({ ok: true, isPublicKeyCredential: true });
    expect(passkeyFrames(page)).toHaveLength(0);
    expect(await credentials()).toBe(2);
    const used = await page.evaluate(() => (window as unknown as { signIn: (o: unknown) => Promise<Settled> }).signIn({}));
    expect(used).toMatchObject({ ok: true });
    expect(passkeyFrames(page)).toHaveLength(0);
    const status = (await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/status' }))) as { value: { data: { items: { passkey?: unknown }[] } } };
    expect(status.value.data.items.filter((item) => item.passkey)).toEqual([]);
  });

  test('a site’s passkey is saved in Passhold, and signs in with one click', async ({ context, extensionId }) => {
    const popup = await setUp(context, extensionId);
    const page = await context.newPage();
    await page.goto(`${SITE}/`);

    const made = page.evaluate(() => (window as unknown as { register: (o: unknown) => Promise<Settled> }).register({}));
    const frame = await frameOf(page, 'passkey.html');
    await expect(frame.getByText('Save a passkey for example.test?')).toBeVisible();
    await expect(frame.getByText('alice@example.test')).toBeVisible();
    // The page cannot put the frame up itself, at the very address ours has.
    await page.evaluate((src) => document.body.append(Object.assign(document.createElement('iframe'), { src })), frame.url());
    await page.waitForTimeout(500);
    expect(passkeyFrames(page)).toHaveLength(1);
    await frame.getByRole('button', { name: 'Save passkey' }).click();
    const creation = await made;

    // What the site gets is a credential like any other, and its server accepts it.
    expect(creation).toMatchObject({ ok: true, isPublicKeyCredential: true, extensions: { credProps: { rk: true } } });
    expect(creation.json).toMatchObject({ type: 'public-key', authenticatorAttachment: 'platform' });
    const key = registered(creation);
    expect(key.credentialId).toBe(creation.json!.id);
    expect(key.auth.flags).toMatchObject({ up: true, uv: true, be: true, bs: true });
    await expect.poll(() => passkeyFrames(page).length).toBe(0);

    // It is a login in the vault now; pages are told it has a passkey, never its private key.
    const status = (await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/status' }))) as {
      value: { data: { items: { username: string; password: string; urls: string[]; passkey: { rpId: string; privateKey: string } | null }[] } };
    };
    expect(status.value.data.items).toEqual([
      expect.objectContaining({ username: 'alice@example.test', password: '', urls: [`${SITE}/`], passkey: expect.objectContaining({ rpId: RP, privateKey: '' }) }),
    ]);

    // Signing in: one account, one click, and the signature verifies with the key the site kept.
    const asked = signIn(page);
    const choose = await frameOf(page, 'passkey.html');
    await expect(choose.getByText('Sign in to example.test')).toBeVisible();
    await choose.getByRole('button', { name: /alice@example\.test/ }).click();
    const assertion = await asked;
    expect(assertion).toMatchObject({ ok: true, isPublicKeyCredential: true });
    expect(assertion.json!.id).toBe(key.credentialId);
    expect(Buffer.from(String(assertion.json!.response.userHandle), 'base64url').toString()).toBe('user-1');
    expect(signedIn(assertion, key).flags).toMatchObject({ up: true, uv: true });
  });

  test('a passkey brought from Bitwarden signs in to its site, and one for the Keyrook account is left behind', async ({ context, extensionId }) => {
    const popup = await setUp(context, extensionId);
    const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const passkey = (rpId: string, credentialId: string) => ({
      credentialId,
      keyType: 'public-key',
      keyAlgorithm: 'ECDSA',
      keyCurve: 'P-256',
      keyValue: privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64url'),
      rpId,
      userHandle: b64url('user-1'),
      userName: 'alice@example.test',
      counter: '0',
      rpName: 'Example',
      userDisplayName: 'Alice',
      discoverable: 'true',
      creationDate: '2026-01-02T03:04:05.000Z',
    });
    const login = (name: string, uri: string, username: string | null, password: string | null, credential: object) => ({
      type: 1,
      name,
      notes: null,
      favorite: false,
      login: { uris: [{ uri }], username, password, totp: null, fido2Credentials: [credential] },
    });
    const options = await context.newPage();
    await options.goto(`chrome-extension://${extensionId}/options.html#import`);
    await options.getByTestId('import-file').setInputFiles({
      name: 'bitwarden_export.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          encrypted: false,
          folders: [],
          items: [
            login('Example', SITE, null, null, passkey(RP, '3f2504e0-4f89-11d3-9a0c-0305e82c3301')),
            login('Keyrook', 'https://account.keyrook.com', 'alice@example.test', 'pw', passkey('account.keyrook.com', '3f2504e0-4f89-11d3-9a0c-0305e82c3302')),
          ],
        }),
      ),
    });
    await expect(options.getByText('Found 2 logins and 1 passkey to import.')).toBeVisible();
    await expect(options.getByText('1 passkey in this file cannot come to Passhold.', { exact: false })).toBeVisible();
    await options.getByRole('button', { name: 'Import', exact: true }).click();
    await expect(options.getByText(/Imported 2 logins and 1 passkey\./)).toBeVisible();

    // The site signs in with it as it did with Bitwarden: the same credential, the same account, the key it kept.
    const page = await context.newPage();
    await page.goto(`${SITE}/`);
    const asked = signIn(page);
    const choose = await frameOf(page, 'passkey.html');
    await choose.getByRole('button', { name: /alice@example\.test/ }).click();
    const assertion = await asked;
    expect(assertion).toMatchObject({ ok: true, isPublicKeyCredential: true });
    expect(assertion.json!.id).toBe(Buffer.from('3f2504e04f8911d39a0c0305e82c3301', 'hex').toString('base64url'));
    expect(Buffer.from(String(assertion.json!.response.userHandle), 'base64url').toString()).toBe('user-1');
    expect(signedIn(assertion, { key: publicKey }).flags).toMatchObject({ up: true, uv: true });

    // The Keyrook account's login came; its passkey did not.
    const status = (await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/status' }))) as {
      value: { data: { items: { title: string; passkey: { rpId: string } | null }[] } };
    };
    expect(status.value.data.items.map((item) => [item.title, item.passkey?.rpId ?? null])).toEqual([
      ['Example', RP],
      ['Keyrook', null],
    ]);
  });

  test('a page waiting quietly gets the passkey picked in the list under its field', async ({ context, extensionId }) => {
    await setUp(context, extensionId);
    const page = await context.newPage();
    await page.goto(`${SITE}/`);
    const key = registered(await savePasskey(page));

    await page.goto(`${SITE}/login`);
    await page.locator('#username').click();
    const menu = await frameOf(page, 'menu.html');
    await menu.getByRole('button', { name: /Passkey · alice@example\.test/ }).click();
    const result = await page.evaluate(() => (window as unknown as { signedIn: Promise<Settled> }).signedIn);
    expect(result).toMatchObject({ ok: true, isPublicKeyCredential: true });
    signedIn(result, key, 'conditional-challenge-01');
    await expect.poll(() => page.frames().some((frame) => frame.url().includes('menu.html'))).toBe(false);
  });

  test('locked, it asks to be unlocked, then offers the passkey', async ({ context, extensionId }) => {
    const popup = await setUp(context, extensionId);
    const page = await context.newPage();
    await page.goto(`${SITE}/`);
    const key = registered(await savePasskey(page));
    await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/lock' }));

    const asked = signIn(page);
    const frame = await frameOf(page, 'passkey.html');
    await expect(frame.getByText('Passhold is locked.')).toBeVisible();
    await expect(frame.getByRole('button', { name: 'Unlock Passhold' })).toBeVisible();
    // Unlocked in Passhold's own page — never in the frame on the site.
    await popup.reload();
    await popup.locator('#master').fill(MASTER);
    await popup.getByRole('button', { name: 'Unlock' }).click();
    await frame.getByRole('button', { name: /alice@example\.test/ }).click();
    signedIn(await asked, key);

    // Locked again, a site it holds no passkey for is the browser's at once: no frame asking to unlock.
    await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/lock' }));
    const { page: other } = await pageWithAuthenticator(context);
    await other.goto('https://other.example.test/');
    expect(await signIn(other)).toMatchObject({ ok: false, name: 'NotAllowedError' });
    expect(passkeyFrames(other)).toHaveLength(0);
  });

  test('another device, when the person chooses it: the browser answers, and Passhold keeps nothing', async ({ context, extensionId }) => {
    const popup = await setUp(context, extensionId);
    const { page, credentials } = await pageWithAuthenticator(context);
    await page.goto(`${SITE}/`);
    const made = page.evaluate(() => (window as unknown as { register: (o: unknown) => Promise<Settled> }).register({}));
    const frame = await frameOf(page, 'passkey.html');
    await frame.getByRole('button', { name: 'Save it elsewhere' }).click();
    expect(await made).toMatchObject({ ok: true });
    expect(await credentials()).toBe(1);
    const status = (await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/status' }))) as { value: { data: { items: unknown[] } } };
    expect(status.value.data.items).toEqual([]);

    // Turned off in settings, Passhold stays out of the way altogether.
    await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/mutate', mutation: { op: 'settings/update', patch: { passkeys: false } } }));
    expect(await page.evaluate(() => (window as unknown as { register: (o: unknown) => Promise<Settled> }).register({ userId: 'user-2', name: 'bob' }))).toMatchObject({ ok: true });
    expect(await credentials()).toBe(2);
    expect(passkeyFrames(page)).toHaveLength(0);
  });

  test('a passkey the site already holds is not made twice', async ({ context, extensionId }) => {
    await setUp(context, extensionId);
    const page = await context.newPage();
    await page.goto(`${SITE}/`);
    const first = await savePasskey(page);
    const again = page.evaluate((id) => (window as unknown as { register: (o: unknown) => Promise<Settled> }).register({ exclude: [id] }), first.json!.id);
    const frame = await frameOf(page, 'passkey.html');
    await expect(frame.getByText('This passkey is already in Passhold')).toBeVisible();
    await frame.getByRole('button', { name: 'OK' }).click();
    expect(await again).toMatchObject({ ok: false, name: 'InvalidStateError' });
  });

  test('never for another site: not one the page names, nor a shared suffix', async ({ context, extensionId }) => {
    await setUp(context, extensionId);
    const page = await context.newPage();
    await page.goto(`${SITE}/`);
    // Left to the browser, which refuses it as it would without Passhold.
    expect(await page.evaluate(() => (window as unknown as { register: (o: unknown) => Promise<Settled> }).register({ rpId: 'evil.test' }))).toMatchObject({ ok: false, name: 'SecurityError' });
    expect(await signIn(page, { rpId: 'evil.test' })).toMatchObject({ ok: false, name: 'SecurityError' });
    await page.goto('https://alice.github.io/');
    expect(await page.evaluate(() => (window as unknown as { register: (o: unknown) => Promise<Settled> }).register({ rpId: 'github.io' }))).toMatchObject({ ok: false, name: 'SecurityError' });
    expect(passkeyFrames(page)).toHaveLength(0);
  });

  test('a frame of another site cannot ask in the page’s name', async ({ context, extensionId }) => {
    await setUp(context, extensionId);
    const page = await context.newPage();
    await page.goto(`${SITE}/`);
    await savePasskey(page);

    await page.goto(`${SITE}/framed`);
    const evil = page.frames().find((frame) => frame.url().startsWith('https://evil.test/'))!;
    await evil.evaluate(() => (window as unknown as { forge: () => void }).forge());
    await page.waitForTimeout(1000);
    expect(passkeyFrames(page)).toHaveLength(0);
    // The same message from the page itself is a request — which is what makes the check above mean something.
    await page.evaluate(() =>
      window.postMessage({ source: 'passhold-webauthn', kind: 'request', id: 'own', op: 'get', options: { challenge: 'AAAAAAAAAAAAAAAAAAAAAA' }, conditional: false }, location.origin),
    );
    await frameOf(page, 'passkey.html');
  });

  test('a page cannot tell its browser functions have Passhold in front of them', async ({ context, extensionId }) => {
    await setUp(context, extensionId);
    const page = await context.newPage();
    await page.goto(`${SITE}/`);
    const look = await page.evaluate(() => {
      const fns = [navigator.credentials.get, navigator.credentials.create, PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable];
      return {
        native: fns.map((fn) => Function.prototype.toString.call(fn).includes('[native code]')),
        names: fns.map((fn) => fn.name),
        lengths: fns.map((fn) => fn.length),
        own: ['get', 'create'].some((name) => Object.prototype.hasOwnProperty.call(navigator.credentials, name)),
        prototypes: navigator.credentials.get === CredentialsContainer.prototype.get && navigator.credentials.create === CredentialsContainer.prototype.create,
      };
    });
    expect(look).toEqual({
      native: [true, true, true],
      names: ['get', 'create', 'isUserVerifyingPlatformAuthenticatorAvailable'],
      lengths: [0, 0, 0],
      own: false,
      prototypes: true,
    });
    // And yet Passhold is there: a site asking to make a passkey gets its frame.
    void page.evaluate(() => (window as unknown as { register: (o: unknown) => Promise<Settled> }).register({})).catch(() => undefined);
    await frameOf(page, 'passkey.html');
  });

  test('the popup shows which logins have a passkey', async ({ context, extensionId }) => {
    await setUp(context, extensionId);
    const page = await context.newPage();
    await page.goto(`${SITE}/`);
    await savePasskey(page);
    const popup = await openPopup(context, extensionId);
    await popup.getByRole('button', { name: /Example Passkeys/ }).click();
    await expect(popup.getByTestId('passkey')).toHaveText(/^For passkeys\.example\.test, saved /);
  });
});
