import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  addWalletItem,
  cleanWalletItem,
  emptyData,
  generateSshKey,
  looksLikeSshKey,
  PassholdError,
  readSshKey,
  searchWallet,
  updateWalletItem,
  walletTitle,
  type SshKeyDraft,
} from '@passhold/core';

// Made by ssh-keygen for these tests alone; they open nothing anywhere.
const PLAIN = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACAo8p+OyW3nusOLMHdjJuuWa+d2f/Hf7/aOL3w/YJQBlAAAAJgT5q+GE+av
hgAAAAtzc2gtZWQyNTUxOQAAACAo8p+OyW3nusOLMHdjJuuWa+d2f/Hf7/aOL3w/YJQBlA
AAAEC30WNT4Cnk6ZM+E8eUUswpPTy43ZPYNXuG6gotppevjSjyn47Jbee6w4swd2Mm65Zr
53Z/8d/v9o4vfD9glAGUAAAAFWZpeHR1cmVAcGFzc2hvbGQudGVzdA==
-----END OPENSSH PRIVATE KEY-----
`;
const PLAIN_PUBLIC = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICjyn47Jbee6w4swd2Mm65Zr53Z/8d/v9o4vfD9glAGU';
const PLAIN_FINGERPRINT = 'SHA256:eZWQB8T27O9gfUHgkHoOq4aAe8XhlgsNdHGFkSVUupU';

// The same, sealed with a passphrase: its public key is still in the clear.
const SEALED = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAACmFlczI1Ni1jdHIAAAAGYmNyeXB0AAAAGAAAABC6XlJU/n
PULn9Jm1u418JKAAAAGAAAAAEAAAAzAAAAC3NzaC1lZDI1NTE5AAAAIEj3+KYPcWnpaAap
o5bK9f4dvO2d6mlkxW9sGAivbbDOAAAAoEtp0q2HjGTO/Ugzu6e8DfHwMnczVLZpZseTIc
QcTG8TbkF5WivYJNWgK5r0R9kQSELSQsT8pK/BCMG3ZSPwzcKD91KT8AY/1i797yblVoKD
y2Cml55hlTfXM1wY9ukVeD5r45j4wLEZiOL7CmX+Dm1lBSmM7GsNyxVQcn1WkcvCuDfA/b
xW4YYzD/htX5qHYy5pMQIBVC7O3vC7QgWZP6E=
-----END OPENSSH PRIVATE KEY-----`;

const code = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return error instanceof PassholdError ? error.code : `other: ${String(error)}`;
  }
  return 'resolved';
};

const hasSshKeygen = spawnSync('ssh-keygen', ['-?']).error === undefined;

describe('an SSH key', () => {
  it('says its public key and fingerprint itself, as ssh-keygen prints them', async () => {
    const info = await readSshKey(PLAIN, 'alice@laptop');
    expect(info).toEqual({ type: 'ssh-ed25519', publicKey: `${PLAIN_PUBLIC} alice@laptop`, fingerprint: PLAIN_FINGERPRINT, encrypted: false });
    expect((await readSshKey(`\n  ${PLAIN.replace(/\n/g, '\r\n')}  `)).publicKey).toBe(PLAIN_PUBLIC);
  });

  it('says them of a key sealed with a passphrase too, and that it is sealed', async () => {
    const info = await readSshKey(SEALED);
    expect(info.encrypted).toBe(true);
    expect(info.fingerprint).toBe('SHA256:Gm/3T63vYT5Nm1qeV9bcapwkGC9n3TSnsMwqzn9oLpw');
  });

  it('refuses what OpenSSH did not write, and a comment cannot add a line to the public key', async () => {
    expect(looksLikeSshKey(PLAIN)).toBe(true);
    expect(looksLikeSshKey('-----BEGIN RSA PRIVATE KEY-----')).toBe(false);
    for (const text of ['', 'hunter2', '-----BEGIN RSA PRIVATE KEY-----\nMIIE\n-----END RSA PRIVATE KEY-----', PLAIN.replace('b3BlbnNzaC1rZXktdjE', 'b3BlbnNzaC1rZXktdjI'), PLAIN.slice(0, 200), PLAIN.replace(/\n-----END[^\n]*\n$/, '')]) {
      expect(await code(readSshKey(text))).toBe('itemInvalid');
    }
    const info = await readSshKey(PLAIN, 'alice\nssh-ed25519 AAAA mallory');
    expect(info.publicKey.split('\n')).toHaveLength(1);
  });

  it('makes a new Ed25519 key that reads back as the key it is', async () => {
    const made = await generateSshKey('alice@laptop');
    const read = await readSshKey(made.privateKey, 'alice@laptop');
    expect([read.type, read.encrypted]).toEqual(['ssh-ed25519', false]);
    expect([read.publicKey, read.fingerprint]).toEqual([made.publicKey, made.fingerprint]);
    expect(made.publicKey).toMatch(/^ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI[A-Za-z0-9+/]{42,43}=? alice@laptop$/);
    expect((await generateSshKey()).fingerprint).not.toBe(made.fingerprint);
  });

  // The proof that the file is OpenSSH's own: OpenSSH reads it, and derives the same public key and fingerprint.
  it.skipIf(!hasSshKeygen)('makes a file ssh-keygen itself reads', async () => {
    const dir = resolve(import.meta.dirname, '../../../.tmp/ssh-test');
    mkdirSync(dir, { recursive: true });
    const file = resolve(dir, `key-${process.pid}`);
    try {
      const made = await generateSshKey('made by passhold');
      writeFileSync(file, made.privateKey);
      chmodSync(file, 0o600);
      expect(execFileSync('ssh-keygen', ['-y', '-f', file], { encoding: 'utf8' }).trim()).toBe(made.publicKey);
      expect(execFileSync('ssh-keygen', ['-l', '-f', file], { encoding: 'utf8' })).toContain(made.fingerprint);
    } finally {
      rmSync(file, { force: true });
    }
  });

  it('is kept as the file was written, found by its name, comment and fingerprint, never by the key', async () => {
    const info = await readSshKey(PLAIN, 'deploy@build');
    const draft: SshKeyDraft = { kind: 'ssh', title: '', privateKey: PLAIN, publicKey: info.publicKey, fingerprint: info.fingerprint, notes: '' };
    const { data, item } = addWalletItem(emptyData(), draft, 1_000);
    expect(item.kind === 'ssh' && item.privateKey).toBe(PLAIN);
    expect(walletTitle(item)).toBe('deploy@build');
    expect(searchWallet(data.wallet, 'deploy')).toHaveLength(1);
    expect(searchWallet(data.wallet, 'eZWQB8T27O9')).toHaveLength(1);
    expect(searchWallet(data.wallet, 'ed25519')).toHaveLength(1);
    expect(searchWallet(data.wallet, 'AAAAC3NzaC1lZDI1NTE5')).toHaveLength(0);
    expect(searchWallet(data.wallet, 'b3BlbnNzaC1rZXk')).toHaveLength(0);
    // Read back from storage or the account, it is the same item.
    expect(cleanWalletItem(JSON.parse(JSON.stringify(item)))).toEqual(item);
    // A key stays a key: an edit of another kind is refused.
    expect(() => updateWalletItem(data, item.id, { kind: 'note', title: 'x', text: 'y' })).toThrow(PassholdError);
    expect(() => addWalletItem(emptyData(), { ...draft, privateKey: '', publicKey: '', fingerprint: '' })).toThrow(PassholdError);
  });
});
