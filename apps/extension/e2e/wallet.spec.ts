import type { Page } from '@playwright/test';
import { addLogin, addNew, diskDump, expect, frameOf, MASTER, openPopup, openSettings, passwordsView, pressFieldButton, setUp, test } from './fixtures.js';

const CARD = { kind: 'card', title: '', holder: 'NGUYEN VAN AN', number: '4242424242424242', expMonth: 8, expYear: 2029, code: '123', notes: '' };
const ADDRESS = {
  kind: 'address',
  title: 'Home',
  name: 'Nguyễn Văn An',
  organization: '',
  street: '12 Lý Thường Kiệt\nPhường Hàng Bài',
  city: 'Hà Nội',
  region: '',
  postalCode: '100000',
  country: 'VN',
  phone: '+84 912 345 678',
  email: 'an@example.test',
  notes: '',
};
const ALICE = { title: 'Example', username: 'alice@example.test', password: 'Tr0ub4dor&3-unique', url: 'https://login.example.test/' };

/** Straight to the service worker, as the add screens send it: the tests here are about what comes after. */
async function addWallet(popup: Page, draft: object): Promise<void> {
  const answer = await popup.evaluate((draft) => chrome.runtime.sendMessage({ type: 'vault/mutate', mutation: { op: 'wallet/add', draft } }), draft);
  expect(answer).toMatchObject({ ok: true });
}

test('keeps a card, an address and a note, each shown by its kind, a card’s number and code hidden until asked', async ({ context, extensionId, worker }) => {
  const popup = await setUp(context, extensionId);
  await addNew(popup, 'Card');
  await popup.locator('#card-number').fill('4242 4242 4242 4242');
  await popup.getByLabel('Name on card').fill('NGUYEN VAN AN');
  await popup.getByLabel('Month').selectOption('8');
  await popup.getByLabel('Year').selectOption('2029');
  await popup.locator('#card-code').fill('123');
  await popup.getByRole('button', { name: 'Save' }).click();
  await addNew(popup, 'Address');
  await popup.getByLabel('Name', { exact: true }).fill('Home');
  await popup.getByLabel('Full name').fill('Nguyễn Văn An');
  await popup.locator('#address-street').fill('12 Lý Thường Kiệt');
  await popup.getByRole('button', { name: 'Save' }).click();
  await addNew(popup, 'Note');
  await popup.getByLabel('Title').fill('Wi-Fi');
  await popup.locator('#note-text').fill('home-network: pass-7Q!');
  await popup.getByRole('button', { name: 'Save' }).click();
  await addLogin(popup, ALICE);

  // One kind at a time, or all of them.
  await popup.getByRole('radio', { name: 'Cards' }).click();
  await expect(popup.getByRole('button', { name: /^Visa •••• 4242/ })).toBeVisible();
  await expect(popup.getByText('Wi-Fi')).toHaveCount(0);
  await expect(popup.getByText(ALICE.title)).toHaveCount(0);
  await popup.getByRole('radio', { name: 'Everything' }).click();
  for (const name of [/^Visa •••• 4242/, /^Home/, /^Wi-Fi/, /^Example/]) await expect(popup.getByRole('button', { name })).toBeVisible();
  // A note is found by its words, a card by its last digits — never by its whole number.
  await popup.getByPlaceholder('Search').fill('home-network');
  await expect(popup.getByRole('button', { name: /^Wi-Fi/ })).toBeVisible();
  await popup.getByPlaceholder('Search').fill('4242424242424242');
  await expect(popup.getByText('Nothing matches “4242424242424242”.')).toBeVisible();
  await popup.getByPlaceholder('Search').fill('');

  await popup.getByRole('button', { name: /^Visa •••• 4242/ }).click();
  await expect(popup.getByTestId('card-number')).toHaveText('•••• •••• •••• 4242');
  await expect(popup.getByTestId('card-code')).toHaveText('•••');
  await popup.getByRole('button', { name: 'Show' }).first().click();
  await expect(popup.getByTestId('card-number')).toHaveText('4242 4242 4242 4242');
  await expect(popup.getByTestId('card-code')).toHaveText('•••');

  // None of it is on disk as it is.
  const disk = await diskDump(worker);
  for (const secret of ['4242424242424242', 'NGUYEN VAN AN', 'home-network', 'Lý Thường Kiệt']) expect(disk).not.toContain(secret);
});

test('fills a card and an address into a checkout, each into its own fields, and nothing the page hides', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addWallet(popup, CARD);
  await addWallet(popup, ADDRESS);
  const page = await context.newPage();
  await page.goto('https://shop.example.test/checkout');

  await pressFieldButton(page.mainFrame(), '#cc-number');
  const menu = await frameOf(page, 'menu.html');
  // The list says which card — never its number, nor its code.
  await expect(menu.getByRole('button', { name: /Visa •••• 4242/ })).toBeVisible();
  await expect(menu.locator('body')).not.toContainText('4242 4242');
  await expect(menu.locator('body')).not.toContainText('NGUYEN');
  await menu.getByRole('button', { name: /Visa •••• 4242/ }).click();

  await expect(page.locator('#cc-number')).toHaveValue('4242424242424242');
  await expect(page.locator('#cc-name')).toHaveValue('NGUYEN VAN AN');
  await expect(page.locator('#cc-exp')).toHaveValue('08 / 29');
  await expect(page.locator('#cc-csc')).toHaveValue('123');
  await expect(page.locator('#cc-hidden')).toHaveValue('');
  for (const id of ['#name', '#street', '#email']) await expect(page.locator(id)).toHaveValue('');

  await pressFieldButton(page.mainFrame(), '#street');
  const list = await frameOf(page, 'menu.html');
  await list.getByRole('button', { name: /^Home/ }).click();
  await expect(page.locator('#name')).toHaveValue('Nguyễn Văn An');
  await expect(page.locator('#street')).toHaveValue('12 Lý Thường Kiệt');
  await expect(page.locator('#street2')).toHaveValue('Phường Hàng Bài');
  await expect(page.locator('#city')).toHaveValue('Hà Nội');
  await expect(page.locator('#zip')).toHaveValue('100000');
  await expect(page.locator('#country')).toHaveValue('VN');
  await expect(page.locator('#tel')).toHaveValue('+84 912 345 678');
  await expect(page.locator('#email')).toHaveValue('an@example.test');
  // The card stays as it was: an address goes into an address's fields only.
  await expect(page.locator('#cc-number')).toHaveValue('4242424242424242');
});

test('fills a Vietnamese checkout by its words and its lists, and a code hidden as a password is no login to save', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addWallet(popup, CARD);
  await addWallet(popup, ADDRESS);
  const page = await context.newPage();
  await page.goto('https://shop.example.test/vi');

  await pressFieldButton(page.mainFrame(), '#so-the');
  await (await frameOf(page, 'menu.html')).getByRole('button', { name: /Visa •••• 4242/ }).click();
  await expect(page.locator('#so-the')).toHaveValue('4242424242424242');
  await expect(page.locator('#chu-the')).toHaveValue('NGUYEN VAN AN');
  await expect(page.locator('#thang')).toHaveValue('08');
  await expect(page.locator('#nam')).toHaveValue('2029');
  await expect(page.locator('#cvv')).toHaveValue('123');

  await pressFieldButton(page.mainFrame(), '#ho-ten');
  await (await frameOf(page, 'menu.html')).getByRole('button', { name: /^Home/ }).click();
  await expect(page.locator('#ho-ten')).toHaveValue('Nguyễn Văn An');
  // One field for the street takes all of it; one for the province, the city it is.
  await expect(page.locator('#dia-chi')).toHaveValue('12 Lý Thường Kiệt, Phường Hàng Bài');
  await expect(page.locator('#tinh')).toHaveValue('Hà Nội');
  await expect(page.locator('#sdt')).toHaveValue('+84 912 345 678');
  await expect(page.locator('#thu')).toHaveValue('an@example.test');

  await page.getByRole('button', { name: 'Thanh toán' }).click();
  await page.waitForURL('https://shop.example.test/xong');
  await page.waitForTimeout(1000);
  expect(page.frames().some((frame) => frame.url().includes('prompt.html'))).toBe(false);
});

test('fills a card split across a payment provider’s frames: each frame of that provider, none of another site', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addWallet(popup, CARD);
  const page = await context.newPage();
  await page.goto('https://shop.example.test/frames');
  const frame = (url: string) => page.frames().find((each) => each.url() === url)!;
  await expect.poll(() => ['number', 'expiry', 'code'].every((path) => frame(`https://pay.example.test/${path}`))).toBe(true);
  // Each frame says it holds a card's fields as it loads.
  await page.waitForTimeout(1000);

  await pressFieldButton(frame('https://pay.example.test/number'), '#field');
  const menu = await frameOf(page, 'menu.html');
  // Too small a frame to hold the list: the page draws it beside that frame.
  expect(menu.parentFrame()).toBe(page.mainFrame());
  await expect(menu.getByRole('button', { name: /Visa •••• 4242/ })).toBeEnabled();
  await menu.getByRole('button', { name: /Visa •••• 4242/ }).click();

  await expect(frame('https://pay.example.test/number').locator('#field')).toHaveValue('4242424242424242');
  await expect(frame('https://pay.example.test/expiry').locator('#field')).toHaveValue('08/29');
  await expect(frame('https://pay.example.test/code').locator('#field')).toHaveValue('123');
  await expect(frame('https://evil.test/card-number').locator('#field')).toHaveValue('');
  await expect.poll(() => page.frames().some((each) => each.url().includes('menu.html'))).toBe(false);
});

test('fills no card into a page over plain http, even asked directly, though it fills an address there', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addWallet(popup, CARD);
  await addWallet(popup, ADDRESS);
  const page = await context.newPage();
  await page.goto('http://shop.example.test/checkout');

  await pressFieldButton(page.mainFrame(), '#cc-number');
  const menu = await frameOf(page, 'menu.html');
  await expect(menu.getByText(/This page is not secure/)).toBeVisible();
  await expect(menu.getByRole('button', { name: /Visa/ })).toHaveCount(0);
  const cardId = await popup.evaluate(async () => {
    const status = (await chrome.runtime.sendMessage({ type: 'vault/status' })) as { value: { data: { wallet: { id: string; kind: string }[] } } };
    return status.value.data.wallet.find((item) => item.kind === 'card')!.id;
  });
  const answer = await menu.evaluate((id) => chrome.runtime.sendMessage({ type: 'menu/fill', token: location.hash.slice(1), id }), cardId);
  expect(answer).toMatchObject({ ok: false, key: 'error.cardInsecure' });
  await expect(page.locator('#cc-number')).toHaveValue('');

  await pressFieldButton(page.mainFrame(), '#street');
  await (await frameOf(page, 'menu.html')).getByRole('button', { name: /^Home/ }).click();
  await expect(page.locator('#street')).toHaveValue('12 Lý Thường Kiệt');
});

test('keeps cards in Settings too, and in the trash until restored', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addWallet(popup, CARD);
  await addLogin(popup, ALICE);
  const options = await openSettings(context, extensionId);
  await options.getByRole('radio', { name: 'Cards' }).click();
  await expect(options.getByRole('button', { name: /^Example/ })).toHaveCount(0);
  await options.getByRole('button', { name: /^Visa •••• 4242/ }).click();
  await options.getByRole('button', { name: 'Move to trash' }).click();
  await passwordsView(options, 'Trash');
  await expect(options.getByText('Visa •••• 4242')).toBeVisible();
  await options.getByRole('button', { name: 'Restore' }).click();
  await passwordsView(options, 'All');
  await expect(options.getByRole('button', { name: /^Visa •••• 4242/ })).toBeVisible();
});

/** What the vault holds now, as Passhold's own pages are handed it. */
async function walletOf(popup: Page): Promise<Record<string, unknown>[]> {
  return popup.evaluate(async () => {
    const status = (await chrome.runtime.sendMessage({ type: 'vault/status' })) as { value: { data: { wallet: Record<string, unknown>[] } } };
    return status.value.data.wallet;
  });
}

/** A checkout filled as a person would, and sent. */
async function pay(page: Page, url: string, card: { number: string; expiry: string; code: string }, address = true): Promise<void> {
  await page.goto(url);
  if (address) {
    await page.locator('#name').fill('Nguyễn Văn An');
    await page.locator('#street').fill('12 Lý Thường Kiệt');
    await page.locator('#city').fill('Hà Nội');
    await page.locator('#country').selectOption('VN');
    await page.locator('#tel').fill('+84 912 345 678');
  }
  await page.locator('#cc-name').fill('NGUYEN VAN AN');
  await page.locator('#cc-number').fill(card.number);
  await page.locator('#cc-exp').fill(card.expiry);
  await page.locator('#cc-csc').fill(card.code);
  await page.getByRole('button', { name: 'Pay' }).click();
  await page.waitForURL(url.replace('/pay', '/paid'));
}

const noPrompt = async (page: Page) => {
  await page.waitForTimeout(1000);
  expect(page.frames().some((frame) => frame.url().includes('prompt.html'))).toBe(false);
};

test('offers to save the card and address a checkout sent, names the card by its last digits only, and saves both', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  const page = await context.newPage();
  await pay(page, 'https://shop.example.test/pay', { number: '4242 4242 4242 4242', expiry: '08 / 29', code: '123' });

  const prompt = await frameOf(page, 'prompt.html');
  await expect(prompt.getByText('Save card and address to Passhold?')).toBeVisible();
  await expect(prompt.getByTestId('prompt-body')).toHaveText('Visa •••• 4242 · 12 Lý Thường Kiệt');
  // The page around cannot read the prompt, and the prompt says no more than the list does: never the number, nor the code.
  const shown = (await prompt.locator('body').textContent()) ?? '';
  for (const secret of ['4242 4242', '4242424242424242', '123', '5555']) expect(shown).not.toContain(secret);
  await prompt.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(prompt.getByText('Saved to Passhold.')).toBeVisible();

  const wallet = await walletOf(popup);
  // The card shown, not the one the page hid before it.
  expect(wallet.find((item) => item.kind === 'card')).toMatchObject({ number: '4242424242424242', holder: 'NGUYEN VAN AN', expMonth: 8, expYear: 2029, code: '123', title: '' });
  expect(wallet.find((item) => item.kind === 'address')).toMatchObject({ name: 'Nguyễn Văn An', street: '12 Lý Thường Kiệt', city: 'Hà Nội', country: 'VN', phone: '+84 912 345 678' });
});

test('stays quiet about a card it has, and offers to update one whose date changed', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addWallet(popup, CARD);
  const page = await context.newPage();
  await pay(page, 'https://shop.example.test/pay', { number: '4242424242424242', expiry: '08/29', code: '123' }, false);
  await noPrompt(page);

  await pay(page, 'https://shop.example.test/pay', { number: '4242424242424242', expiry: '03/31', code: '123' }, false);
  const prompt = await frameOf(page, 'prompt.html');
  await expect(prompt.getByText('Update the card in Passhold?')).toBeVisible();
  await expect(prompt.getByTestId('prompt-body')).toHaveText('Visa •••• 4242');
  await prompt.getByRole('button', { name: 'Update' }).click();
  await expect(prompt.getByText('Saved to Passhold.')).toBeVisible();
  const cards = (await walletOf(popup)).filter((item) => item.kind === 'card');
  expect(cards).toHaveLength(1);
  expect(cards[0]).toMatchObject({ expMonth: 3, expYear: 2031, code: '123' });
});

test('takes no card from a page over plain http, none whose number does not add up, and none once told not to', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  const page = await context.newPage();
  await pay(page, 'http://shop.example.test/pay', { number: '4242424242424242', expiry: '08/29', code: '123' }, false);
  await noPrompt(page);
  await pay(page, 'https://shop.example.test/pay', { number: '4242424242424241', expiry: '08/29', code: '123' }, false);
  await noPrompt(page);

  const off = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/mutate', mutation: { op: 'settings/update', patch: { offerToSaveCards: false } } }));
  expect(off).toMatchObject({ ok: true });
  await pay(page, 'https://shop.example.test/pay', { number: '4242424242424242', expiry: '08/29', code: '123' });
  await noPrompt(page);
  expect(await walletOf(popup)).toEqual([]);
});

test('a checkout sent while locked waits in the popup until unlocked', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await popup.getByRole('button', { name: 'Lock' }).click();
  const page = await context.newPage();
  await pay(page, 'https://shop.example.test/pay', { number: '4242424242424242', expiry: '08/29', code: '123' }, false);
  const prompt = await frameOf(page, 'prompt.html');
  await expect(prompt.getByText('Save card to Passhold?')).toBeVisible();
  await prompt.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(prompt.getByText(/unlock/i)).toBeVisible();

  await page.bringToFront();
  const again = await openPopup(context, extensionId);
  await page.bringToFront();
  await again.locator('#master').fill(MASTER);
  await again.getByRole('button', { name: 'Unlock' }).click();
  await expect(again.getByTestId('pending')).toContainText('Visa •••• 4242');
  await expect(again.getByTestId('pending').getByRole('button', { name: 'Never for this site' })).toHaveCount(0);
  await again.getByTestId('pending').getByRole('button', { name: 'Save' }).click();
  await expect(again.getByRole('button', { name: /^Visa •••• 4242/ })).toBeVisible();
});
