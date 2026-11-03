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
  await expect(popup.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
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
  await expect(options.getByRole('heading', { name: 'Passhold is locked' })).toBeVisible();
  // The way out is there, but behind a quiet link: not the next step beside the unlock button.
  await expect(options.getByRole('button', { name: 'Remove vault' })).toHaveCount(0);
  await options.getByRole('button', { name: 'Cannot open it at all? Remove the vault from this browser' }).click();
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

test('imports NordPass’s logins, cards, addresses and notes, and says what two-step codes a file leaves behind', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  const options = await context.newPage();
  await options.goto(`chrome-extension://${extensionId}/options.html#import`);
  await options.getByTestId('import-file').setInputFiles({
    name: 'nordpass.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(
      'name,url,additional_urls,username,password,note,cardholdername,cardnumber,cvc,expirydate,zipcode,folder,full_name,phone_number,email,address1,address2,city,country,state,type,custom_fields\n' +
        'Mail,https://mail.example.test,,alice,pw-one,,,,,,,,,,,,,,,,password,\n' +
        'Visa,,,,,,Alice Doe,4111111111111111,123,01 / 31,,,,,,,,,,,credit_card,\n' +
        'Home,,,,,,,,,,100000,,Alice Doe,,,12 Lý Thường Kiệt,,Hà Nội,Vietnam,,identity,\n' +
        'Wi-Fi,,,,,home-network: pass-7Q!,,,,,,,,,,,,,,,note,\n',
    ),
  });
  await expect(options.getByText('Found 1 login, 1 card, 1 address, and 1 note to import.')).toBeVisible();
  // NordPass writes no two-step codes: nothing to warn of.
  await expect(options.getByText('two-step (2FA)', { exact: false })).toHaveCount(0);
  await options.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(options.getByText(/Imported 1 login, 1 card, 1 address, and 1 note\./)).toBeVisible();
  await popup.reload();
  for (const name of [/^Mail/, /^Visa •••• 1111/, /^Home/, /^Wi-Fi/]) await expect(popup.getByRole('button', { name })).toBeVisible();

  // A file whose logins carry two-step codes: said before the import and after it, with where to keep them.
  await options.getByTestId('import-file').setInputFiles({
    name: 'bitwarden.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(
      'folder,favorite,type,name,notes,fields,reprompt,login_uri,login_username,login_password,login_totp\n' +
        ',,login,Bank,,,0,https://bank.example.test,bob,pw-two,JBSWY3DPEHPK3PXP\n' +
        ',,login,Shop,,,0,https://shop.example.test,bob,pw-three,otpauth://totp/Shop?secret=KRSXG5CTMVRXEZLU\n',
    ),
  });
  const warning = options.getByText('2 logins in this file have two-step (2FA) codes.', { exact: false });
  await expect(warning).toBeVisible();
  await expect(options.getByRole('link', { name: 'Get Keyrook Authenticator' })).toHaveAttribute('href', 'https://keyrook.com/authenticator/');
  await options.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(options.getByText(/Imported 2 logins\./)).toBeVisible();
  await expect(warning).toBeVisible();
  // The codes are counted, never kept: not in the vault, opened.
  const vault = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/status' }));
  expect(JSON.stringify(vault)).toContain('pw-two');
  for (const secret of ['JBSWY3DPEHPK3PXP', 'KRSXG5CTMVRXEZLU']) expect(JSON.stringify(vault)).not.toContain(secret);
});

test('imports Bitwarden’s JSON, its cards and identities with it, and names the encrypted export it cannot open', async ({ context, extensionId }) => {
  const popup = await setUp(context, extensionId);
  const options = await context.newPage();
  await options.goto(`chrome-extension://${extensionId}/options.html#import`);
  await options.getByTestId('import-file').setInputFiles({
    name: 'bitwarden_encrypted_export.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ encrypted: true, passwordProtected: true, salt: 's', kdfIterations: 600000, kdfType: 0, encKeyValidation_DO_NOT_EDIT: '2.x', data: '2.y' })),
  });
  await expect(options.getByText('That Bitwarden export is encrypted', { exact: false })).toBeVisible();
  await options.getByTestId('import-file').setInputFiles({
    name: 'bitwarden_export.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({
        encrypted: false,
        folders: [],
        items: [
          { type: 1, name: 'Code host', notes: null, favorite: false, login: { uris: [{ uri: 'https://code.example.test' }], username: 'jdoe', password: 'pw-gh', totp: 'JBSWY3DPEHPK3PXP' } },
          { type: 3, name: 'Visa', notes: null, favorite: false, card: { cardholderName: 'John Doe', number: '4242424242424242', expMonth: '4', expYear: '2031', code: '123' } },
          { type: 4, name: 'Home', notes: null, favorite: false, identity: { firstName: 'John', lastName: 'Doe', address1: '1 Main St', city: 'Springfield', postalCode: '62701', country: 'US' } },
        ],
      }),
    ),
  });
  await expect(options.getByText('Found 1 login, 1 card, and 1 address to import.')).toBeVisible();
  await expect(options.getByText('1 login in this file has a two-step (2FA) code.', { exact: false })).toBeVisible();
  await options.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(options.getByText(/Imported 1 login, 1 card, and 1 address\./)).toBeVisible();
  await popup.reload();
  for (const name of [/^Code host/, /^Visa •••• 4242/, /^Home/]) await expect(popup.getByRole('button', { name })).toBeVisible();
});

test('speaks Vietnamese when the choice is made', async ({ context, extensionId }) => {
  await setUp(context, extensionId);
  const options = await context.newPage();
  await options.goto(`chrome-extension://${extensionId}/options.html`);
  await options.getByRole('button', { name: 'General', exact: true }).click();
  await options.getByLabel('Language').selectOption('vi');
  await expect(options.getByRole('navigation', { name: 'Cài đặt' })).toBeVisible();
  const popup = await openPopup(context, extensionId);
  await expect(popup.getByRole('button', { name: 'Thêm đăng nhập' }).first()).toBeVisible();
});
