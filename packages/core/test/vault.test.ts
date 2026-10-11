import { describe, expect, it } from 'vitest';
import {
  addLogin,
  changeMasterPassword,
  createVault,
  newKdfParams,
  PassholdError,
  readPayload,
  sealVault,
  unlockVault,
  verifyMasterPassword,
  type VaultFile,
} from '@passhold/core';

// The floor the KDF accepts, so the suite stays fast; production uses 600,000.
const FAST = () => newKdfParams(100_000);
const PASSWORD = 'correct horse battery';

async function vaultWithSecret(secret = 'hunter2-the-real-one') {
  const vault = await createVault(PASSWORD, FAST());
  const { data } = addLogin(vault.data, {
    title: 'Bank',
    username: 'alice@example.com',
    password: secret,
    urls: ['https://bank.example.com/login'],
    notes: 'PIN is 4321',
  });
  const file = await sealVault(vault.file, vault.dataKey, data);
  return { file, dataKey: vault.dataKey, secret };
}

const code = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return error instanceof PassholdError ? error.code : `other: ${String(error)}`;
  }
  return 'resolved';
};

describe('the vault file', () => {
  it('holds nothing readable', async () => {
    const { file, secret } = await vaultWithSecret();
    const stored = JSON.stringify(file);
    for (const plain of [secret, 'alice@example.com', 'bank.example.com', 'PIN is 4321', 'Bank', PASSWORD]) {
      expect(stored).not.toContain(plain);
    }
  });

  it('opens with the master password and nothing else', async () => {
    const { file, secret } = await vaultWithSecret();
    const opened = await unlockVault(file, PASSWORD);
    expect(opened.data.items[0]!.password).toBe(secret);
    expect(await code(unlockVault(file, 'correct horse battery '))).toBe('wrongPassword');
    expect(await code(unlockVault(file, ''))).toBe('wrongPassword');
  });

  it('refuses a master password under ten characters', async () => {
    expect(await code(createVault('short', FAST()))).toBe('passwordTooShort');
    // Counted in characters, not UTF-16 units: ten emoji are ten characters.
    expect(await code(createVault('🔑'.repeat(9), FAST()))).toBe('passwordTooShort');
    await expect(createVault('🔑'.repeat(10), FAST())).resolves.toBeTruthy();
  });

  // Someone with the disk can swap files; associated data ties each payload
  // to its own vault, so a payload from another one does not open.
  it('will not open a payload spliced in from another vault', async () => {
    const a = await vaultWithSecret('secret-a');
    const b = await vaultWithSecret('secret-b');
    const spliced: VaultFile = { ...a.file, payload: b.file.payload };
    expect(await code(readPayload(spliced, a.dataKey))).toBe('vaultCorrupt');
  });

  it('notices a single flipped bit', async () => {
    const { file, dataKey } = await vaultWithSecret();
    const ct = atob(file.payload.ct);
    const flipped = btoa(String.fromCharCode(ct.charCodeAt(0) ^ 1) + ct.slice(1));
    expect(await code(readPayload({ ...file, payload: { ...file.payload, ct: flipped } }, dataKey))).toBe('vaultCorrupt');
  });

  // The KDF settings live in the file. A file rewritten to a count of one
  // would make the password free to guess on the next unlock and re-wrap.
  it('refuses KDF settings that would weaken or hang it', async () => {
    const { file } = await vaultWithSecret();
    expect(await code(unlockVault({ ...file, kdf: { ...file.kdf, iterations: 1 } }, PASSWORD))).toBe('kdfUnsupported');
    expect(await code(unlockVault({ ...file, kdf: { ...file.kdf, iterations: 1e12 } }, PASSWORD))).toBe('kdfUnsupported');
    expect(
      await code(unlockVault({ ...file, kdf: { ...file.kdf, algorithm: 'MD5' as 'PBKDF2-SHA256' } }, PASSWORD)),
    ).toBe('kdfUnsupported');
  });

  it('refuses a vault from a newer Passhold rather than drop what it does not know', async () => {
    const { file } = await vaultWithSecret();
    expect(await code(unlockVault({ ...file, version: file.version + 1 }, PASSWORD))).toBe('vaultTooNew');
  });

  it('changes the master password without touching the logins', async () => {
    const { file, secret } = await vaultWithSecret();
    expect(await code(changeMasterPassword(file, 'not the password', 'a whole new password'))).toBe('wrongPassword');
    const changed = await changeMasterPassword(file, PASSWORD, 'a whole new password');
    expect(changed.payload).toEqual(file.payload);
    expect(changed.kdf.salt).not.toBe(file.kdf.salt);
    expect(await verifyMasterPassword(changed, PASSWORD)).toBe(false);
    expect((await unlockVault(changed, 'a whole new password')).data.items[0]!.password).toBe(secret);
  });

  it('treats a decrypted payload as input: junk fields are dropped, not trusted', async () => {
    const vault = await createVault(PASSWORD, FAST());
    const hostile = {
      items: [
        { id: 'a', title: 42, password: 'p', urls: ['javascript:alert(1)', 'https://ok.example'], history: 'x' },
        { id: 'a', title: 'duplicate id' },
        null,
        'string',
      ],
      settings: { autoLockMinutes: -5, generator: { length: 100000 } },
      neverSave: [1, 'example.com'],
    };
    const file = await sealVault(vault.file, vault.dataKey, hostile as never);
    const data = await readPayload(file, vault.dataKey);
    expect(data.items).toHaveLength(1);
    expect(data.items[0]).toMatchObject({ title: '', password: 'p', urls: ['https://ok.example/'], history: [] });
    expect(data.settings.autoLockMinutes).toBe(15);
    expect(data.settings.generator.length).toBe(128);
    expect(data.neverSave).toEqual(['example.com']);
  });
});
