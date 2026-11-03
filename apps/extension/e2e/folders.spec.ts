import { addLogin, addNew, diskDump, expect, openPopup, openSettings, passwordsView, setUp, test } from './fixtures.js';

const PIN = 'pin-7731-only-here';

test('a login keeps a hidden field and a folder, shows the field only when asked, and keeps both off the disk', async ({ context, extensionId, worker }) => {
  const popup = await setUp(context, extensionId);
  await addNew(popup, 'Login');
  await popup.getByLabel('Name', { exact: true }).fill('Bank');
  await popup.getByLabel('Username or email').fill('alice');
  await popup.locator('#password').fill('bank-password-1');
  await popup.locator('#urls').fill('https://bank.example.test');
  await popup.getByRole('button', { name: 'Add a field' }).click();
  // The new field takes the cursor: its name is typed straight away.
  await popup.keyboard.type('PIN');
  await popup.getByTestId('field').getByLabel('Value').fill(PIN);
  await popup.getByTestId('field').getByLabel('Hide it, like a password').check();
  await popup.getByRole('button', { name: 'Add a field' }).click();
  await popup.getByTestId('field').nth(1).getByLabel('Field name').fill('First school');
  await popup.getByTestId('field').nth(1).getByLabel('Value').fill('Chu Văn An');
  await popup.getByLabel('Folder', { exact: true }).fill('Ngân hàng');
  await popup.getByRole('button', { name: 'Save' }).click();

  await popup.getByRole('button', { name: /^Bank/ }).click();
  await expect(popup.getByTestId('folder')).toHaveText('Ngân hàng');
  const values = popup.getByTestId('field-value');
  await expect(values.nth(0)).toHaveText('•'.repeat(16));
  await expect(values.nth(1)).toHaveText('Chu Văn An');
  await expect(popup.getByText(PIN)).toHaveCount(0);
  // The password's own comes first.
  await popup.getByRole('button', { name: 'Show' }).nth(1).click();
  await expect(values.nth(0)).toHaveText(PIN);
  await expect(popup.getByRole('button', { name: 'Copy PIN' })).toBeVisible();

  // An edit that changes the password leaves the fields and the folder where they were.
  await popup.getByRole('button', { name: 'Edit' }).click();
  await expect(popup.getByTestId('field')).toHaveCount(2);
  await expect(popup.getByRole('button', { name: 'Ngân hàng', pressed: true })).toBeVisible();
  await popup.locator('#password').fill('bank-password-2');
  await popup.getByRole('button', { name: 'Save' }).click();
  await expect(popup.getByTestId('folder')).toHaveText('Ngân hàng');
  await expect(popup.getByTestId('field-value')).toHaveCount(2);

  const disk = await diskDump(worker);
  for (const secret of [PIN, 'First school', 'Chu Văn An', 'Ngân hàng']) expect(disk).not.toContain(secret);
});

test('a folder narrows the popup’s list, and a new item made there goes in it', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  // No folders yet: nothing of them is drawn.
  await expect(popup.getByRole('button', { name: /^Folder:/ })).toHaveCount(0);
  await addLogin(popup, { title: 'Mail', username: 'alice', password: 'mail-pw', url: 'https://mail.example.test' });
  await addNew(popup, 'Login');
  await popup.getByLabel('Name', { exact: true }).fill('Bank');
  await popup.getByLabel('Username or email').fill('alice');
  await popup.locator('#password').fill('bank-pw');
  await popup.getByLabel('Folder', { exact: true }).fill('Money');
  await popup.getByRole('button', { name: 'Save' }).click();

  await popup.getByRole('button', { name: 'Folder: All folders' }).click();
  await popup.getByRole('menuitemradio', { name: /^Money/ }).click();
  await expect(popup.getByRole('button', { name: /^Bank/ })).toBeVisible();
  await expect(popup.getByRole('button', { name: /^Mail/ })).toHaveCount(0);

  // A note added while the folder is shown is filed in it, and found there.
  await addNew(popup, 'Note');
  await expect(popup.getByLabel('Folder', { exact: true })).toHaveValue('Money');
  await popup.getByLabel('Title').fill('Safe box');
  await popup.getByRole('button', { name: 'Save' }).click();
  await expect(popup.getByRole('button', { name: /^Safe box/ })).toBeVisible();

  await popup.getByRole('button', { name: 'Folder: Money' }).click();
  await popup.getByRole('menuitemradio', { name: /^In no folder/ }).click();
  await expect(popup.getByRole('button', { name: /^Mail/ })).toBeVisible();
  await expect(popup.getByRole('button', { name: /^Bank/ })).toHaveCount(0);
  await expect(popup.getByRole('button', { name: /^Safe box/ })).toHaveCount(0);
});

test('a folder renamed in Settings takes everything in it along, and one removed leaves its items in none', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  for (const [title, folder] of [['Bank', 'money'], ['Card bill', 'Money'], ['Mail', '']] as const) {
    await addNew(popup, 'Login');
    await popup.getByLabel('Name', { exact: true }).fill(title);
    await popup.getByLabel('Username or email').fill('alice');
    await popup.locator('#password').fill(`${title}-pw`);
    if (folder) await popup.getByLabel('Folder', { exact: true }).fill(folder);
    await popup.getByRole('button', { name: 'Save' }).click();
    await expect(popup.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
  }

  const options = await openSettings(context, extensionId);
  await passwordsView(options, 'All');
  await options.getByRole('button', { name: 'Folder: All folders' }).click();
  // "Money" typed in another case went into the folder already there: one folder, two items.
  await expect(options.getByRole('menuitemradio')).toHaveText(['All folders', 'money2', 'In no folder1']);
  await options.getByRole('menuitemradio', { name: /^money/ }).click();
  await expect(options.getByTestId('folder-bar')).toContainText('2 items');

  await options.getByRole('button', { name: 'Rename' }).click();
  await options.getByLabel('New name for the folder').fill('Finance');
  await options.getByRole('button', { name: 'Save' }).click();
  await expect(options.getByTestId('folder-bar')).toContainText('Finance');
  await expect(options.getByRole('button', { name: /^Bank/ })).toBeVisible();
  await expect(options.getByRole('button', { name: /^Card bill/ })).toBeVisible();
  await expect(options.getByRole('button', { name: /^Mail/ })).toHaveCount(0);

  await options.getByRole('button', { name: 'Remove folder' }).click();
  await expect(options.getByTestId('folder-bar')).toHaveCount(0);
  await expect(options.getByRole('button', { name: /^Folder:/ })).toHaveCount(0);
  for (const title of ['Bank', 'Card bill', 'Mail']) await expect(options.getByRole('button', { name: new RegExp(`^${title}`) })).toBeVisible();

  const again = await openPopup(context, extensionId);
  await expect(again.getByRole('button', { name: /^Folder:/ })).toHaveCount(0);
});
