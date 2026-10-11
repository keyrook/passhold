import { addLogin, diskDump, downloadBackup, expect, MASTER, openPopup, openSettings, setUp, test } from './fixtures.js';

const restoreFile = (buffer: Buffer) => ({ name: 'passhold-backup.json', mimeType: 'application/json', buffer });

test('a backup brings the vault back to a browser that lost it', async ({ context, extensionId, worker }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, { title: 'Example', username: 'alice@example.test', password: 'Tr0ub4dor&3-unique', url: 'https://login.example.test/' });

  const options = await openSettings(context, extensionId);
  await expect(options.getByTestId('last-backup')).toHaveText('No backup yet.');

  // The backup opens only with the master password, so it asks for it.
  await options.locator('#backup').getByLabel('Current master password', { exact: true }).fill('not the password at all');
  await options.getByRole('button', { name: 'Download backup' }).click();
  await expect(options.locator('#backup').getByText('That is not the master password.')).toBeVisible();

  const backup = await downloadBackup(options);
  await expect(options.getByTestId('last-backup')).toContainText('Last backup:');
  const text = backup.toString('utf8');
  expect(text).toContain('passhold.vault');
  for (const secret of ['Tr0ub4dor&3-unique', 'alice@example.test', 'login.example.test', 'Example', MASTER]) {
    expect(text).not.toContain(secret);
  }

  // The browser loses its vault.
  await options.getByLabel('Type delete to confirm').fill('delete');
  await options.getByRole('button', { name: 'Remove vault' }).click();
  await expect(options.getByText(/^There is no vault in this browser yet\./)).toBeVisible();
  expect(await diskDump(worker)).not.toContain('passhold.vault');

  await options.getByTestId('restore-file').setInputFiles(restoreFile(backup));
  await expect(options.getByText(/^Backup made /)).toBeVisible();
  await options.getByLabel('Master password of the backup').fill('not the password at all');
  await options.getByRole('button', { name: 'Restore', exact: true }).click();
  await expect(options.locator('#restore').getByText('That is not the master password this backup was made with.')).toBeVisible();

  await options.getByLabel('Master password of the backup').fill(MASTER);
  await options.getByRole('button', { name: 'Restore', exact: true }).click();
  await expect(options.getByText('Vault restored, with 1 login.')).toBeVisible();
  await expect(options.getByRole('heading', { name: 'General' })).toBeVisible();

  // Open, with the login, and still nothing readable on disk.
  const again = await openPopup(context, extensionId);
  await expect(again.getByText('alice@example.test')).toBeVisible();
  const disk = await diskDump(worker);
  for (const secret of ['Tr0ub4dor&3-unique', 'alice@example.test', MASTER]) expect(disk).not.toContain(secret);

  // And it locks and opens with the backup's master password, as before.
  await again.getByRole('button', { name: 'Lock' }).click();
  await again.locator('#master').fill(MASTER);
  await again.getByRole('button', { name: 'Unlock' }).click();
  await expect(again.getByText('alice@example.test')).toBeVisible();
});

test('restoring into a vault adds what it lacks and removes nothing', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  await addLogin(popup, { username: 'alice', password: 'one', url: 'https://a.example.test' });
  const options = await openSettings(context, extensionId);
  const backup = await downloadBackup(options);

  // After the backup: a login added, and the backed-up one deleted for good.
  await addLogin(popup, { username: 'bob', password: 'two', url: 'https://b.example.test' });
  await popup.getByText('alice').first().click();
  await popup.getByRole('button', { name: 'Move to trash' }).click();
  await options.reload();
  await options.getByRole('button', { name: 'Delete forever' }).click();
  await expect(options.getByText('The trash is empty.')).toBeVisible();

  const restore = async () => {
    await options.getByTestId('restore-file').setInputFiles(restoreFile(backup));
    await options.getByLabel('Master password of the backup').fill(MASTER);
    await options.getByRole('button', { name: 'Restore', exact: true }).click();
  };
  await restore();
  await expect(options.getByText('Added 1 login from the backup.')).toBeVisible();
  await restore();
  await expect(options.getByText('Everything in the backup is already in this vault.')).toBeVisible();

  await popup.reload();
  await expect(popup.getByText('alice')).toBeVisible();
  await expect(popup.getByText('bob')).toBeVisible();
});

test('the setup screen leads to restoring, and a file that is not a backup is refused', async ({ context, extensionId }) => {
  const popup = await openPopup(context, extensionId);
  const [options] = await Promise.all([context.waitForEvent('page'), popup.getByRole('button', { name: 'Restore from a backup' }).click()]);
  await expect(options).toHaveURL(/options\.html#restore$/);
  await expect(options.getByRole('heading', { name: 'Restore from a backup' })).toBeVisible();

  await options.getByTestId('restore-file').setInputFiles({
    name: 'Chrome Passwords.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('name,url,username,password,note\nA,https://a.example.test/,alice,one,\n'),
  });
  await expect(options.getByText('That file is not a Passhold backup, or it is damaged.')).toBeVisible();
  await expect(options.getByLabel('Master password of the backup')).toHaveCount(0);
});
