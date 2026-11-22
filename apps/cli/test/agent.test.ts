/**
 * `passhold ssh-agent`, spoken to by OpenSSH's own programs: `ssh-add` lists
 * what it offers, and `ssh-keygen -Y sign` signs through it what
 * `ssh-keygen -Y verify` then checks, for each kind of key Passhold signs
 * with. Against the account's server from the kit, as the other tests are.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { resolve as path } from 'node:path';
import { createAccount, startRegistration } from '@keyrook/account';
import { afterAll, describe, expect, it } from 'vitest';
import { addWalletItem, PRODUCT, readSshKey, SshWriter, sshSigner, type SshKeyItem, type VaultData } from '@passhold/core';
import { describe as described } from '../src/agent.js';
import type { Context } from '../src/cli.js';
import { contents, DEVICE, forgetHomes, KIT, PASSWORD, server, terminal } from './kit.js';

const TMP = path(import.meta.dirname, '../../../.tmp');
// A socket's path must be short: under the project, but no deeper than this.
const SOCKETS = path(TMP, 's');
const KEYS = path(TMP, 'cli-test', `keys-${process.pid}`);
const hasOpenSsh = spawnSync('ssh-keygen', ['-?']).error === undefined && spawnSync('ssh-add', ['-?']).error === undefined;

afterAll(() => {
  forgetHomes();
  rmSync(KEYS, { recursive: true, force: true });
  rmSync(SOCKETS, { recursive: true, force: true });
});

/** A key ssh-keygen makes, as its file reads: `-N` a passphrase to seal it with. */
function keygen(name: string, type: string, passphrase = ''): string {
  mkdirSync(KEYS, { recursive: true });
  const file = path(KEYS, name);
  rmSync(file, { force: true });
  rmSync(`${file}.pub`, { force: true });
  const made = spawnSync('ssh-keygen', ['-q', '-t', type, ...(type === 'rsa' ? ['-b', '2048'] : []), '-N', passphrase, '-C', name, '-f', file]);
  expect(made.status).toBe(0);
  return readFileSync(file, 'utf8');
}

async function withKey(data: VaultData, title: string, privateKey: string): Promise<VaultData> {
  const info = await readSshKey(privateKey, title);
  return addWalletItem(data, { kind: 'ssh', title, privateKey, publicKey: info.publicKey, fingerprint: info.fingerprint, notes: '' }).data;
}

/** Alice's vault with an SSH key of each kind, a terminal unlocked, and an agent to start in it. */
async function alice() {
  const kit = await server();
  const email = 'alice@example.test';
  await startRegistration('', email, kit.browser);
  const made = await createAccount({ baseUrl: '', fetcher: kit.browser }, { email, code: kit.running.codeFor(email)!, password: PASSWORD, product: PRODUCT, ...DEVICE });
  let data = await contents();
  data = await withKey(data, 'Build server', keygen('rsa', 'rsa'));
  data = await withKey(data, 'Router', keygen('ecdsa', 'ecdsa'));
  data = await withKey(data, 'Old laptop', keygen('sealed', 'ed25519', 'a passphrase'));
  await kit.send(made.session, made.productKey.key, data);
  const shell = terminal(`agent-${Math.random().toString(36).slice(2)}`, kit.from);
  expect((await shell.passhold(['login', '--email', email], [PASSWORD])).code).toBe(0);
  expect((await shell.unlock([], [PASSWORD])).code).toBe(0);
  mkdirSync(SOCKETS, { recursive: true });
  const socket = path(SOCKETS, `${Math.random().toString(36).slice(2, 8)}.sock`);

  /** The agent, running until stopped, with its owner answering each question as `answer` says. */
  const start = async (argv: string[] = [], answer: (question: string) => boolean = () => true, more: Partial<Context> = {}) => {
    const asked: string[] = [];
    const said: string[] = [];
    const stop = new AbortController();
    const running = shell.passhold(['ssh-agent', '--socket', socket, ...argv], [], '', {
      approve: { how: 'in the test', ask: async (question) => (asked.push(question), answer(question)) },
      signal: stop.signal,
      err: (text) => void said.push(text),
      ...more,
    });
    for (let tries = 0; tries < 200 && !existsSync(socket); tries++) await new Promise((done) => setTimeout(done, 25));
    return { asked, said, running, stop: () => stop.abort() };
  };
  // Never spawnSync: the agent answers in this very process, whose turn a waiting child would hold.
  const ssh = (program: string, args: string[], input?: string) =>
    new Promise<{ status: number | null; stdout: string; stderr: string }>((done) => {
      const child = spawn(program, args, { env: { ...process.env, SSH_AUTH_SOCK: socket } });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (chunk: Buffer) => (stdout += chunk.toString('utf8')));
      child.stderr.on('data', (chunk: Buffer) => (stderr += chunk.toString('utf8')));
      child.once('close', (status) => done({ status, stdout, stderr }));
      child.stdin.end(input ?? '');
    });
  return { ...kit, ...shell, data, socket, start, ssh };
}

/** A public key's kind and key, without its comment: what `ssh-add -L` and an allowed signers file name. */
const bare = (line: string) => line.split(' ').slice(0, 2).join(' ');

describe('what is asked to be signed', () => {
  it('is said in words: a sign-in, as whom, or what ssh-keygen signs for', () => {
    const userauth = new SshWriter().string(new Uint8Array(32)).byte(50).string('git').string('ssh-connection').string('publickey').byte(1).done();
    expect(described(userauth)).toBe('sign in as "git"');
    const sshsig = new SshWriter().bytes(new TextEncoder().encode('SSHSIG')).string('git').string('').string('sha512').string(new Uint8Array(64)).done();
    expect(described(sshsig)).toBe('sign for "git"');
    // A name sent to fool the question is one line, and short.
    const crafted = new SshWriter().string(new Uint8Array(32)).byte(50).string('root"\n\nAllow everything').string('ssh-connection').string('publickey').done();
    expect(described(crafted)).toBe('sign in as "root" Allow everything"');
    expect(described(new Uint8Array([1, 2, 3]))).toBe('sign');
  });
});

describe.skipIf(!hasOpenSsh)('a key Passhold signs with', () => {
  it('is the one its private part makes, and nothing that cannot sign here', async () => {
    const ed25519 = await sshSigner(keygen('plain', 'ed25519'));
    expect(ed25519.status).toBe('ready');
    expect((await sshSigner(keygen('sealed-too', 'ed25519', 'secret'))).status).toBe('sealed');
    expect((await sshSigner('-----BEGIN OPENSSH PRIVATE KEY-----\nAAAA\n-----END OPENSSH PRIVATE KEY-----')).status).toBe('invalid');
    // The public key it carries in the clear swapped for another's: refused, never offered as theirs.
    const mine = readFileSync(path(KEYS, 'plain'), 'utf8');
    const theirs = keygen('theirs', 'ed25519');
    const blob = (file: string) => {
      const body = Buffer.from(file.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''), 'base64');
      // The magic, the cipher and the KDF (both "none"), no KDF options, one key: then the public key, after its length.
      const at = 15 + 8 + 8 + 4 + 4 + 4;
      return { body, at, length: body.readUInt32BE(at - 4) };
    };
    const a = blob(mine);
    const b = blob(theirs);
    const swapped = Buffer.concat([a.body.subarray(0, a.at), b.body.subarray(b.at, b.at + b.length), a.body.subarray(a.at + a.length)]);
    expect((await sshSigner(`-----BEGIN OPENSSH PRIVATE KEY-----\n${swapped.toString('base64')}\n-----END OPENSSH PRIVATE KEY-----`)).status).toBe('invalid');
  });
});

describe.skipIf(!existsSync(KIT) || !hasOpenSsh)('passhold ssh-agent', { timeout: 120_000 }, () => {
  it('offers the vaults’ keys to ssh, and each signature it makes, once allowed, checks out', async () => {
    const { running, data, start, ssh } = await alice();
    const agent = await start();
    const keys = data.wallet.filter((item): item is SshKeyItem => item.kind === 'ssh');
    const offered = await ssh('ssh-add', ['-L']);
    expect(offered.status).toBe(0);
    expect(offered.stdout.trim().split('\n').map(bare).sort()).toEqual(keys.filter((item) => item.title !== 'Old laptop').map((item) => bare(item.publicKey)).sort());
    expect(agent.said.join('')).toMatch(/"Old laptop" is sealed with a passphrase, which Passhold does not hold\. Keep it in Passhold without one: the vault seals it\. It is not offered\./);
    expect(agent.said.join('')).toMatch(/Each signature is asked for first, in the test\./);

    mkdirSync(KEYS, { recursive: true });
    const message = path(KEYS, 'commit');
    writeFileSync(message, 'tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904\n\nThe first commit\n');
    for (const title of ['Deploy key', 'Build server', 'Router']) {
      const key = keys.find((item) => item.title === title)!;
      const publicFile = path(KEYS, 'signing.pub');
      writeFileSync(publicFile, `${key.publicKey}\n`);
      rmSync(`${message}.sig`, { force: true });
      const signed = await ssh('ssh-keygen', ['-Y', 'sign', '-n', 'git', '-f', publicFile, message]);
      expect(signed.status, signed.stderr).toBe(0);
      writeFileSync(path(KEYS, 'allowed'), `alice@example.test ${bare(key.publicKey)}\n`);
      const checked = await ssh('ssh-keygen', ['-Y', 'verify', '-f', path(KEYS, 'allowed'), '-I', 'alice@example.test', '-n', 'git', '-s', `${message}.sig`], readFileSync(message, 'utf8'));
      expect(checked.status, checked.stderr).toBe(0);
    }
    expect(agent.asked).toEqual(['Allow "Deploy key" (personal) to sign for "git"?', 'Allow "Build server" (personal) to sign for "git"?', 'Allow "Router" (personal) to sign for "git"?']);

    // A key added from outside is refused: the agent holds what the vaults hold, and nothing else.
    const added = await ssh('ssh-add', [path(KEYS, 'plain')]);
    expect(added.status).not.toBe(0);
    expect((await ssh('ssh-add', ['-L'])).stdout).not.toContain(bare(readFileSync(path(KEYS, 'plain.pub'), 'utf8')));
    agent.stop();
    expect((await agent.running).code).toBe(0);
    await running.close();
  });

  it('signs nothing its owner refuses, nor anything once Passhold is locked', async () => {
    const { running, data, start, ssh, passhold, socket } = await alice();
    const agent = await start([], () => false);
    const key = data.wallet.find((item): item is SshKeyItem => item.kind === 'ssh' && item.title === 'Deploy key')!;
    mkdirSync(KEYS, { recursive: true });
    const publicFile = path(KEYS, 'refused.pub');
    writeFileSync(publicFile, `${key.publicKey}\n`);
    writeFileSync(path(KEYS, 'refused'), 'a message');
    rmSync(path(KEYS, 'refused.sig'), { force: true });
    const signed = await ssh('ssh-keygen', ['-Y', 'sign', '-n', 'git', '-f', publicFile, path(KEYS, 'refused')]);
    expect(signed.status).not.toBe(0);
    expect(existsSync(path(KEYS, 'refused.sig'))).toBe(false);
    expect(agent.said.join('')).toMatch(/Refused: "Deploy key" to sign for "git"\./);

    // What does not speak the protocol, or asks of a key the vault does not hold, gets nothing.
    const reply = await raw(socket, new SshWriter().byte(13).string(new SshWriter().string('ssh-ed25519').string(new Uint8Array(32)).done()).string('data').uint32(0).done());
    expect([...reply]).toEqual([0, 0, 0, 1, 5]);
    expect(await closedOn(socket, new SshWriter().uint32(1 << 30).done())).toBe(true);

    expect((await passhold(['lock'])).code).toBe(0);
    expect((await ssh('ssh-add', ['-L'])).status).not.toBe(0);
    expect((await agent.running).code).toBe(0);
    expect(agent.said.join('')).toMatch(/Passhold is locked\. Run: eval "\$\(passhold unlock\)" The agent has stopped\./);
    expect(existsSync(socket)).toBe(false);
    await running.close();
  });

  it('asks nothing only when told, and will not start where it cannot ask', async () => {
    const { running, data, start, ssh, passhold, socket } = await alice();
    const cannot = await passhold(['ssh-agent', '--socket', socket], [], '', { approve: undefined });
    expect([cannot.code, cannot.err]).toEqual([1, expect.stringMatching(/no way to ask you before each signature/)]);
    expect(existsSync(socket)).toBe(false);

    const agent = await start(['--no-confirm']);
    const key = data.wallet.find((item): item is SshKeyItem => item.kind === 'ssh' && item.title === 'Router')!;
    writeFileSync(path(KEYS, 'quiet.pub'), `${key.publicKey}\n`);
    writeFileSync(path(KEYS, 'quiet'), 'a message');
    rmSync(path(KEYS, 'quiet.sig'), { force: true });
    expect((await ssh('ssh-keygen', ['-Y', 'sign', '-n', 'file', '-f', path(KEYS, 'quiet.pub'), path(KEYS, 'quiet')])).status).toBe(0);
    expect(agent.asked).toEqual([]);
    expect(agent.said.join('')).toMatch(/Signed: "Router" to sign for "file"\./);
    // Another agent is not taken over while this one answers.
    const second = await passhold(['ssh-agent', '--socket', socket, '--no-confirm']);
    expect(second.err).toMatch(/An agent already listens at/);
    agent.stop();
    await agent.running;
    await running.close();
  });
});

/** One message sent, the answer read. */
function raw(socket: string, payload: Uint8Array): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const connection = createConnection(socket, () => connection.write(new SshWriter().uint32(payload.length).bytes(payload).done()));
    let got = Buffer.alloc(0);
    connection.on('data', (chunk) => {
      got = Buffer.concat([got, chunk]);
      if (got.length >= 4 && got.length >= 4 + got.readUInt32BE(0)) {
        connection.destroy();
        resolve(got);
      }
    });
    connection.on('error', reject);
  });
}

/** Whether the agent hangs up on what is sent. */
function closedOn(socket: string, bytes: Uint8Array): Promise<boolean> {
  return new Promise((resolve) => {
    const connection = createConnection(socket, () => connection.write(bytes));
    connection.on('close', () => resolve(true));
    connection.on('error', () => resolve(true));
    setTimeout(() => resolve(false), 3_000);
  });
}
