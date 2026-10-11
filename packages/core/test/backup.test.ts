import { describe, expect, it } from 'vitest';
import {
  addLogin,
  backupText,
  createVault,
  markBackedUp,
  mergeBackup,
  newKdfParams,
  openBackup,
  PassholdError,
  sealVault,
  trashLogin,
  updateLogin,
  type LoginItem,
  type VaultData,
} from '@passhold/core';

const FAST = () => newKdfParams(100_000);
const PASSWORD = 'correct horse battery';

async function backupWithSecret(secret = 'hunter2-the-real-one') {
  const vault = await createVault(PASSWORD, FAST());
  const { data } = addLogin(vault.data, {
    title: 'Bank',
    username: 'alice@example.com',
    password: secret,
    urls: ['https://bank.example.com/login'],
    notes: 'PIN is 4321',
  });
  const file = await sealVault(vault.file, vault.dataKey, markBackedUp(data));
  return { text: backupText(file), file, data, secret };
}

const code = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return error instanceof PassholdError ? error.code : `other: ${String(error)}`;
  }
  return 'resolved';
};

const login = (data: VaultData, title: string): LoginItem => data.items.find((item) => item.title === title)!;

describe('a backup file', () => {
  it('holds nothing readable', async () => {
    const { text, secret } = await backupWithSecret();
    for (const plain of [secret, 'alice@example.com', 'bank.example.com', 'PIN is 4321', 'Bank', PASSWORD]) {
      expect(text).not.toContain(plain);
    }
  });

  it('opens with the password it was made under, and says "backup" when that is wrong', async () => {
    const { text, secret } = await backupWithSecret();
    const opened = await openBackup(text, PASSWORD);
    expect(opened.data.items[0]!.password).toBe(secret);
    expect(opened.data.lastBackupAt).not.toBeNull();
    expect(await code(openBackup(text, 'correct horse battery '))).toBe('backupWrongPassword');
  });

  it('refuses what is not a backup', async () => {
    for (const junk of ['', 'name,url,username,password', '{}', '[]', 'null', '{"format":"passhold.vault"}']) {
      expect(await code(openBackup(junk, PASSWORD)), junk).toBe('backupInvalid');
    }
    expect(await code(openBackup(' '.repeat(20 * 1024 * 1024 + 1), PASSWORD))).toBe('backupInvalid');
  });

  it('notices a damaged payload rather than calling the password wrong', async () => {
    const { file } = await backupWithSecret();
    const ct = file.payload.ct;
    const flipped = { ...file, payload: { ...file.payload, ct: `${ct[0] === 'A' ? 'B' : 'A'}${ct.slice(1)}` } };
    expect(await code(openBackup(JSON.stringify(flipped), PASSWORD))).toBe('backupInvalid');
  });

  it('will not bring a weakened KDF onto this device', async () => {
    const { file } = await backupWithSecret();
    const weak = { ...file, kdf: { ...file.kdf, iterations: 1 } };
    expect(await code(openBackup(JSON.stringify(weak), PASSWORD))).toBe('kdfUnsupported');
  });

  it('keeps only the fields a vault has', async () => {
    const { file } = await backupWithSecret();
    const padded = { ...file, extra: 'x'.repeat(1000), kdf: { ...file.kdf, note: 'hi' }, payload: { ...file.payload, tag: 'z' } };
    const opened = await openBackup(JSON.stringify(padded), PASSWORD);
    expect(Object.keys(opened.file).sort()).toEqual(['createdAt', 'format', 'id', 'kdf', 'payload', 'updatedAt', 'version', 'wrappedKey']);
    expect(Object.keys(opened.file.kdf).sort()).toEqual(['algorithm', 'iterations', 'salt']);
    expect(Object.keys(opened.file.payload).sort()).toEqual(['ct', 'iv']);
  });
});

describe('restoring into a vault that has logins', () => {
  const draft = (title: string, password: string) => ({ title, username: 'alice', password, urls: [`https://${title.toLowerCase()}.test`], notes: '' });

  it('adds what is missing and removes nothing', async () => {
    const base = (await createVault(PASSWORD, FAST())).data;
    const here = addLogin(base, draft('Mail', 'm1')).data;
    const backup = addLogin(addLogin(base, draft('Bank', 'b1')).data, draft('Shop', 's1')).data;
    const { data, added, updated } = mergeBackup(here, backup);
    expect(data.items.map((item) => item.title).sort()).toEqual(['Bank', 'Mail', 'Shop']);
    expect([added, updated]).toEqual([2, 0]);
  });

  it('keeps the newer edit and the other password in its history', async () => {
    const start = addLogin((await createVault(PASSWORD, FAST())).data, draft('Bank', 'old'), 1_000).data;
    const id = login(start, 'Bank').id;
    // The backup was edited later than this vault was.
    const here = updateLogin(start, id, draft('Bank', 'changed-here'), 2_000);
    const backup = updateLogin(start, id, draft('Bank', 'changed-there'), 3_000);

    const { data, added, updated } = mergeBackup(here, backup);
    const bank = login(data, 'Bank');
    expect(bank.password).toBe('changed-there');
    expect(bank.history.map((entry) => entry.password)).toEqual(['changed-here', 'old']);
    expect([added, updated]).toEqual([0, 1]);

    // An older backup changes nothing current, but its password is not lost.
    const older = mergeBackup(backup, here).data;
    expect(login(older, 'Bank').password).toBe('changed-there');
    expect(login(older, 'Bank').history.map((entry) => entry.password)).toEqual(['changed-here', 'old']);
  });

  it('changes nothing when the same backup is restored again', async () => {
    let here = addLogin((await createVault(PASSWORD, FAST())).data, draft('Bank', 'a'), 1_000).data;
    const id = login(here, 'Bank').id;
    // A → B → A: the current password is in the history too.
    here = updateLogin(here, id, draft('Bank', 'b'), 2_000);
    here = updateLogin(here, id, draft('Bank', 'a'), 3_000);
    const once = mergeBackup(here, here);
    expect(once.data).toEqual(here);
    expect([once.added, once.updated]).toEqual([0, 0]);
  });

  it('counts a copy of a login already here as the same login', async () => {
    const base = (await createVault(PASSWORD, FAST())).data;
    // Two vaults that imported the same CSV: same login, different ids.
    const here = addLogin(base, draft('Bank', 'b1')).data;
    const backup = addLogin(base, draft('Bank', 'b1')).data;
    const { data, added } = mergeBackup(here, backup);
    expect(data.items).toHaveLength(1);
    expect(added).toBe(0);
  });

  it('keeps a login in the trash where the newer copy put it, and this vault’s settings', async () => {
    const start = addLogin((await createVault(PASSWORD, FAST())).data, draft('Bank', 'b1'), 1_000).data;
    const id = login(start, 'Bank').id;
    const here = { ...start, settings: { ...start.settings, autoLockMinutes: 60 }, neverSave: ['a.test'] };
    const backup = { ...trashLogin(start, id, 2_000), neverSave: ['b.test'] };
    const { data } = mergeBackup(here, backup);
    expect(login(data, 'Bank').deletedAt).toBe(2_000);
    expect(data.settings.autoLockMinutes).toBe(60);
    expect(data.neverSave.sort()).toEqual(['a.test', 'b.test']);
  });
});
