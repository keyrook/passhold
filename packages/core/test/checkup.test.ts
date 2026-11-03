import { describe, expect, it } from 'vitest';
import {
  addLogin,
  setRecoveryKeyPending,
  brandFor,
  BACKUP_DUE_AFTER,
  changePasswordUrl,
  checkup,
  emptyData,
  isValidPin,
  loginIssues,
  markBackedUp,
  newKdfParams,
  openWithPin,
  PassholdError,
  PIN_TRIES,
  generateDataKey,
  exportDataKey,
  isDeviceUnlock,
  openWithDevice,
  sealWithDevice,
  sanitiseData,
  sealWithPin,
  setPin,
  trashLogin,
  updateLogin,
  type VaultData,
} from '@passhold/core';

const login = (title: string, password: string, url = `https://${title.toLowerCase()}.example`) => ({
  title,
  username: 'alice',
  password,
  urls: [url],
  notes: '',
});

function vault(...logins: ReturnType<typeof login>[]): VaultData {
  return logins.reduce((data, draft) => addLogin(data, draft, 1_000).data, emptyData());
}

const code = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return error instanceof PassholdError ? error.code : `other: ${String(error)}`;
  }
  return 'resolved';
};

describe('the checkup', () => {
  it('finds weak passwords and passwords used more than once, among live logins only', () => {
    const data = vault(
      login('Bank', 'password123'),
      login('Mail', 'Same-Strong-Passw0rd!'),
      login('Shop', 'Same-Strong-Passw0rd!'),
      login('Forum', 'Same-Strong-Passw0rd!'),
      login('Code', 'G7#kq!2vLp@9xZ$e'),
    );
    const result = checkup(markBackedUp(data, 2_000), 3_000);
    expect(result.weak.map((item) => item.title)).toEqual(['Bank']);
    expect(result.reused.map((group) => group.map((item) => item.title).sort())).toEqual([['Forum', 'Mail', 'Shop']]);
    expect(result.backup).toBe('ok');
    expect(result.issues).toBe(2);

    // In the trash, a login is no longer anyone's problem.
    const bank = data.items.find((item) => item.title === 'Bank')!;
    expect(checkup(markBackedUp(trashLogin(data, bank.id), 2_000), 3_000).weak).toEqual([]);
  });

  it('says a backup is missing, and due again once logins changed and a month passed', () => {
    const data = vault(login('Code', 'G7#kq!2vLp@9xZ$e'));
    expect(checkup(data).backup).toBe('never');
    expect(checkup(emptyData()).backup).toBe('ok');

    const backedUp = markBackedUp(data, 10_000);
    expect(checkup(backedUp, 10_000 + BACKUP_DUE_AFTER * 2).backup).toBe('ok');
    const id = backedUp.items[0]!.id;
    const changed = updateLogin(backedUp, id, login('Code', 'another-G7#kq!2vLp@9xZ$e'), 20_000);
    expect(checkup(changed, 20_000).backup).toBe('ok');
    expect(checkup(changed, 10_000 + BACKUP_DUE_AFTER + 1).backup).toBe('due');
  });

  it('describes one login', () => {
    const data = vault(login('Mail', 'password123'), login('Shop', 'password123'));
    expect(loginIssues(data, data.items[0]!)).toEqual({ weak: true, reusedWith: 1 });
  });

  it('sends a person to the site’s own change-password address', () => {
    const data = vault(login('Mail', 'x', 'https://accounts.mail.example/login?next=/inbox'));
    expect(changePasswordUrl(data.items[0]!)).toBe('https://accounts.mail.example/.well-known/change-password');
    expect(changePasswordUrl({ ...data.items[0]!, urls: [] })).toBeNull();
  });
});

describe('site marks', () => {
  it('match a login by where it is used, subdomains included', () => {
    expect(brandFor('', ['https://github.com/login'])?.slug).toBe('github');
    expect(brandFor('Work', ['https://gist.github.com/'])?.slug).toBe('github');
  });

  it('are not worn by a look-alike', () => {
    expect(brandFor('GitHub', ['https://github.com.evil.test/login'])).toBeNull();
    expect(brandFor('GitHub', ['https://notgithub.com/'])).toBeNull();
  });

  it('fall back to the name only when no website is saved', () => {
    expect(brandFor('GitHub', [])?.slug).toBe('github');
    expect(brandFor('Corner shop', [])).toBeNull();
  });
});

describe('the PIN', () => {
  it('is six to twelve digits', () => {
    for (const pin of ['123456', '000000000000']) expect(isValidPin(pin), pin).toBe(true);
    for (const pin of ['12345', '1234567890123', '12345a', ' 123456', '１２３４５６']) expect(isValidPin(pin), pin).toBe(false);
    expect(() => setPin(emptyData(), '1234')).toThrow(PassholdError);
  });

  it('opens the data key with the PIN and nothing else', async () => {
    const dataKey = await generateDataKey();
    const envelope = await sealWithPin(dataKey, '246810');
    expect(envelope.triesLeft).toBe(PIN_TRIES);
    const opened = await openWithPin(envelope, '246810');
    expect(await exportDataKey(opened)).toBe(await exportDataKey(dataKey));
    expect(await code(openWithPin(envelope, '246811'))).toBe('wrongPin');
  });

  it('will not open under a KDF weakened in memory', async () => {
    const envelope = await sealWithPin(await generateDataKey(), '246810');
    expect(await code(openWithPin({ ...envelope, kdf: { ...envelope.kdf, iterations: 1 } }, '246810'))).toBe('kdfUnsupported');
    expect(envelope.kdf.iterations).toBe(newKdfParams().iterations);
  });

  it('is kept only when it has the right shape', () => {
    expect(sanitiseData({ items: [], pin: '135790' }).pin).toBe('135790');
    expect(sanitiseData({ items: [], pin: '12' }).pin).toBeNull();
    expect(sanitiseData({ items: [], pin: 135790 }).pin).toBeNull();
  });
});

describe('unlocking with the device', () => {
  const credential = { credentialId: 'Y3JlZA==', salt: 'c2FsdA==' };
  const answer = (fill: number) => new Uint8Array(32).fill(fill);

  it('opens with the authenticator’s answer for this vault, and nothing else', async () => {
    const dataKey = await generateDataKey();
    const unlock = await sealWithDevice(dataKey, answer(7), 'vault-a', credential);
    expect(isDeviceUnlock(unlock)).toBe(true);
    expect(await exportDataKey(await openWithDevice(unlock, answer(7), 'vault-a'))).toBe(await exportDataKey(dataKey));
    // Another authenticator, or the same one's answer for another vault's copy.
    expect(await code(openWithDevice(unlock, answer(8), 'vault-a'))).toBe('deviceKeyWrong');
    expect(await code(openWithDevice(unlock, answer(7), 'vault-b'))).toBe('deviceKeyWrong');
    // An answer of the wrong length is refused before anything is tried.
    expect(await code(openWithDevice(unlock, new Uint8Array(16), 'vault-a'))).toBe('deviceKeyWrong');
  });

  it('keeps nothing readable: the copy on disk is the wrapped key and two public values', async () => {
    const dataKey = await generateDataKey();
    const unlock = await sealWithDevice(dataKey, answer(7), 'vault-a', credential);
    expect(Object.keys(unlock).sort()).toEqual(['credentialId', 'salt', 'wrappedKey']);
    expect(JSON.stringify(unlock)).not.toContain(await exportDataKey(dataKey));
  });
});

describe('the vault’s own recovery key in the checkup', () => {
  it('counts as a problem until put away — unless a Keyrook account brings everything back', () => {
    const data = setRecoveryKeyPending(emptyData(), true);
    expect(checkup(data).recoveryKeyPending).toBe(true);
    expect(checkup(data).issues).toBe(1);
    expect(checkup(data, Date.now(), true).recoveryKeyPending).toBe(false);
    expect(checkup(data, Date.now(), true).issues).toBe(0);
  });
});
