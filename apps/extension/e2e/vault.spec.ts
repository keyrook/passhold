import { addLogin, diskDump, expect, MASTER, openPopup, setUp, test } from './fixtures.js';

test('a new vault, a login in it, and nothing readable on disk', async ({ context, extensionId, worker }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, { title: 'Example', username: 'alice@example.test', password: 'Tr0ub4dor&3-unique', url: 'https://login.example.test/' });
  await expect(popup.getByText('alice@example.test').first()).toBeVisible();

  const disk = await diskDump(worker);
  expect(disk).toContain('passhold.vault');
  for (const secret of ['Tr0ub4dor&3-unique', 'alice@example.test', 'login.example.test', 'Example', MASTER]) {
    expect(disk).not.toContain(secret);
  }
});

test('locks, refuses a wrong password, and opens with the right one', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await popup.getByRole('button', { name: 'Lock' }).click();
  await expect(popup.getByRole('heading', { name: 'Passhold is locked' })).toBeVisible();

  await popup.locator('#master').fill('not the password at all');
  await popup.getByRole('button', { name: 'Unlock' }).click();
  await expect(popup.getByRole('alert')).toHaveText('That is not the master password.');

  await popup.locator('#master').fill(MASTER);
  await popup.getByRole('button', { name: 'Unlock' }).click();
  await expect(popup.getByRole('button', { name: 'New login' }).first()).toBeVisible();
});

test('the session key never reaches the disk, and locking forgets it', async ({ context, extensionId, worker }) => {
  await setUp(context, extensionId);
  const session = await worker.evaluate(async () => Object.keys(await chrome.storage.session.get(null)));
  expect(session).toContain('ph.sessionKey');
  expect(await diskDump(worker)).not.toContain('sessionKey');

  const popup = await openPopup(context, extensionId);
  await popup.getByRole('button', { name: 'Lock' }).click();
  await expect(popup.getByRole('heading', { name: 'Passhold is locked' })).toBeVisible();
  expect(await worker.evaluate(async () => Object.keys(await chrome.storage.session.get(null)))).not.toContain('ph.sessionKey');
});

test('settings open locked, and a forgotten vault can be removed', async ({ context, extensionId, worker }) => {
  const popup = await setUp(context, extensionId);
  await popup.getByRole('button', { name: 'Lock' }).click();
  const options = await context.newPage();
  await options.goto(`chrome-extension://${extensionId}/options.html`);
  await expect(options.getByText('Unlock Passhold from the toolbar to change settings.')).toBeVisible();
  const remove = options.getByRole('button', { name: 'Remove vault' });
  await expect(remove).toBeDisabled();
  await options.getByLabel('Type delete to confirm').fill('delete');
  await remove.click();
  await expect(options.getByRole('button', { name: 'Remove vault' })).toHaveCount(0);
  expect(await diskDump(worker)).not.toContain('passhold.vault');
});

test('imports a Chrome export and skips what it already has', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, { username: 'alice', password: 'one', url: 'https://a.example.test' });
  const options = await context.newPage();
  await options.goto(`chrome-extension://${extensionId}/options.html#import`);
  await options.getByTestId('import-file').setInputFiles({
    name: 'Chrome Passwords.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('name,url,username,password,note\nA,https://a.example.test/,alice,one,\nB,https://b.example.test/,bob,two,\n'),
  });
  await expect(options.getByText('Found 1 login to import.')).toBeVisible();
  await expect(options.getByText('1 is already in your vault.')).toBeVisible();
  await options.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(options.getByText(/Imported 1 login\./)).toBeVisible();
  await popup.reload();
  await expect(popup.getByText('bob')).toBeVisible();
});

test('speaks Vietnamese when the choice is made', async ({ context, extensionId }) => {
  await setUp(context, extensionId);
  const options = await context.newPage();
  await options.goto(`chrome-extension://${extensionId}/options.html`);
  await options.getByLabel('Language').selectOption('vi');
  await expect(options.getByRole('heading', { name: 'Cài đặt' })).toBeVisible();
  const popup = await openPopup(context, extensionId);
  await expect(popup.getByRole('button', { name: 'Thêm đăng nhập' }).first()).toBeVisible();
});
