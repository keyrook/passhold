import { describe, expect, it } from 'vitest';
import {
  backupText,
  createVault,
  generateRecoveryKey,
  groupMatches,
  newKdfParams,
  normaliseRecoveryKey,
  openBackup,
  PassholdError,
  pickGroups,
  rewrapVault,
  sanitiseData,
  secretOf,
  unlockVault,
  verifyMasterPassword,
  withRecoveryKey,
} from '@passhold/core';

const FAST = () => newKdfParams(100_000);

const code = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return error instanceof PassholdError ? error.code : `other: ${String(error)}`;
  }
  return 'resolved';
};

describe('the recovery key', () => {
  it('is 120 random bits in six groups of four, never twice the same', () => {
    const keys = new Set(Array.from({ length: 200 }, generateRecoveryKey));
    expect(keys.size).toBe(200);
    for (const key of keys) expect(key).toMatch(/^([0-9A-HJKMNP-TV-Z]{4}-){5}[0-9A-HJKMNP-TV-Z]{4}$/);
  });

  it('forgives how it is typed back, and refuses what it cannot be', () => {
    const key = generateRecoveryKey();
    const loose = ` ${key.toLowerCase().replace(/-/g, ' ')} `;
    expect(normaliseRecoveryKey(loose)).toBe(key);
    expect(normaliseRecoveryKey('ABCD-EFGH-JKMN-PQRS-TVWX-YZ0O')).toBe('ABCD-EFGH-JKMN-PQRS-TVWX-YZ00');
    expect(normaliseRecoveryKey('ILIL-0000-0000-0000-0000-0000')).toBe('1111-0000-0000-0000-0000-0000');
    for (const wrong of ['', 'ABCD-EFGH', `${key}-ABCD`, 'UUUU-0000-0000-0000-0000-0000', 'correct horse battery staple']) {
      expect(normaliseRecoveryKey(wrong), wrong).toBeNull();
    }
  });
});

describe('checking a recovery key was put away', () => {
  it('asks for two different groups, any two, counted from 1', () => {
    const key = generateRecoveryKey();
    const seen = new Set<string>();
    for (let i = 0; i < 400; i++) {
      const [a, b] = pickGroups(key);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(6);
      expect(a).toBeLessThan(b);
      seen.add(`${a},${b}`);
    }
    // Every pair of six turns up: nothing a person could learn to skip.
    expect(seen.size).toBe(15);
    // The account's key is eight groups, and every one of them can be asked for.
    const account = 'ABCD-EFGH-JKMN-PQRS-TVWX-YZ01-2345-6789';
    expect(pickGroups(account, (n) => n - 1)).toEqual([7, 8]);
    expect(pickGroups(account, () => 0)).toEqual([1, 2]);
  });

  it('takes a group typed loosely, and nothing else', () => {
    const key = 'ABCD-EF01-JKMN-PQRS-TVWX-YZ00';
    expect(groupMatches(key, 2, 'ef01')).toBe(true);
    expect(groupMatches(key, 2, ' EF O I ')).toBe(true);
    expect(groupMatches(key, 6, 'yzoo')).toBe(true);
    expect(groupMatches(key, 6, 'yzol')).toBe(false);
    for (const wrong of ['', 'EF0', 'EF012', 'ABCD', key, 'ABCDEF01']) expect(groupMatches(key, 2, wrong), wrong).toBe(false);
    // A group that is not there matches nothing, not even nothing.
    expect(groupMatches(key, 7, '')).toBe(false);
    expect(groupMatches(key, 0, 'ABCD')).toBe(false);
  });
});

describe('a vault with no master password', () => {
  it('opens with its recovery key, and says so in the file', async () => {
    const key = generateRecoveryKey();
    const vault = await createVault(key, FAST(), 'recoveryKey');
    expect(secretOf(vault.file)).toBe('recoveryKey');
    expect((await unlockVault(vault.file, key)).data.items).toEqual([]);
    expect(await code(unlockVault(vault.file, generateRecoveryKey()))).toBe('wrongPassword');
  });

  it('keeps its kind through a backup, and opens there with the key', async () => {
    const key = generateRecoveryKey();
    const vault = await createVault(key, FAST(), 'recoveryKey');
    const opened = await openBackup(backupText(vault.file), key);
    expect(secretOf(opened.file)).toBe('recoveryKey');
  });

  it('moves to a master password and back without touching the data key', async () => {
    const key = generateRecoveryKey();
    const vault = await createVault(key, FAST(), 'recoveryKey');
    const withPassword = await rewrapVault(vault.file, vault.dataKey, 'a password of my own', 'password');
    expect(secretOf(withPassword)).toBe('password');
    expect(await verifyMasterPassword(withPassword, key)).toBe(false);
    expect(await verifyMasterPassword(withPassword, 'a password of my own')).toBe(true);
    // The payload was not re-sealed: the same data key still opens it.
    expect((await unlockVault(withPassword, 'a password of my own')).data).toEqual(vault.data);

    const fresh = generateRecoveryKey();
    const back = await rewrapVault(withPassword, vault.dataKey, fresh, 'recoveryKey');
    expect(secretOf(back)).toBe('recoveryKey');
    expect(await verifyMasterPassword(back, 'a password of my own')).toBe(false);
    expect(await verifyMasterPassword(back, fresh)).toBe(true);
    expect(back.kdf.salt).not.toBe(withPassword.kdf.salt);
  });

  it('remembers that a key is waiting to be put away', () => {
    expect(sanitiseData({ items: [], recoveryKeyPending: true }).recoveryKeyPending).toBe(true);
    expect(sanitiseData({ items: [], recoveryKeyPending: 'yes' }).recoveryKeyPending).toBe(false);
  });

  it('files from before the field read as a master password', () => {
    expect(secretOf({})).toBe('password');
  });
});

describe('the recovery key kept in the vault', () => {
  it('is kept only in its one written form, sealed with the rest', async () => {
    const key = generateRecoveryKey();
    expect(sanitiseData({ items: [], recoveryKey: key.toLowerCase() }).recoveryKey).toBe(key);
    expect(sanitiseData({ items: [], recoveryKey: 'not a key' }).recoveryKey).toBeNull();
    const vault = await createVault(key, FAST(), 'recoveryKey');
    const sealed = JSON.stringify(vault.file);
    expect(sealed).not.toContain(key);
  });

  it('comes and goes with the vault’s kind', () => {
    const key = generateRecoveryKey();
    const withKey = withRecoveryKey(sanitiseData({ items: [] }), key);
    expect([withKey.recoveryKey, withKey.recoveryKeyPending]).toEqual([key, true]);
    const without = withRecoveryKey(withKey, null);
    expect([without.recoveryKey, without.recoveryKeyPending]).toEqual([null, false]);
  });
});
