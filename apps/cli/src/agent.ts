/**
 * `passhold ssh-agent`: an SSH agent, as OpenSSH's `ssh`, `git` and
 * `ssh-keygen -Y sign` speak to one (draft-miller-ssh-agent), for the SSH
 * keys the vaults hold — the vault's own and each family's shared vaults.
 * It listens on a Unix socket only its owner can reach, or on Windows on the
 * named pipe OpenSSH looks for.
 *
 * It lists and signs, nothing else: a key is never handed out, and a key
 * added with `ssh-add` is refused, so what it signs with is always what the
 * vault holds. Each signature is asked for first, where its owner will see
 * it, unless they said not to: whatever runs as them, or a server they
 * forwarded the agent to, could otherwise sign in as them without a word.
 *
 * It lasts as the unlock does. Once `passhold lock` runs, or the unlock
 * ends, it signs nothing more and stops.
 */
import { createConnection, createServer, type Server, type Socket } from 'node:net';
import { chmodSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fromUtf8, SshReader, sshSigner, SshWriter, type SshSigner } from '@passhold/core';
import type { Account } from './account.js';
import type { Context } from './cli.js';
import { CliError, nameOf, vaultWord, vaultsOf } from './reference.js';
import { homeOf, type Store } from './store.js';

const FAILURE = 5;
const REQUEST_IDENTITIES = 11;
const IDENTITIES_ANSWER = 12;
const SIGN_REQUEST = 13;
const SIGN_RESPONSE = 14;
/** OpenSSH's own ceiling on a message: anything longer is not one of theirs. */
const MAX_MESSAGE = 256 * 1024;
/** How long the keys are taken as read before an identities request reads them again. */
const FRESH_MS = 60_000;

/** The pipe Windows' OpenSSH looks for when SSH_AUTH_SOCK is not set. */
export const WINDOWS_PIPE = '\\\\.\\pipe\\openssh-ssh-agent';

/** Where the agent listens unless told otherwise: in the folder only its owner can read, or the pipe OpenSSH looks for. */
export function defaultSocket(env: NodeJS.ProcessEnv, platform: NodeJS.Platform = process.platform): string {
  return platform === 'win32' ? WINDOWS_PIPE : join(homeOf(env), 'agent.sock');
}

/** A key the agent offers, and where it is kept. */
export interface Offered {
  signer: SshSigner;
  name: string;
  vault: string;
}

export interface AgentOptions {
  store: Store;
  account: Account;
  now: () => number;
  say: (line: string) => void;
  socket: string | undefined;
  confirm: boolean;
}

/** What one request asks to have signed, in words: a sign-in, as whom and where, or what `ssh-keygen -Y sign` signs for. */
export function describe(data: Uint8Array): string {
  try {
    if (fromUtf8(data.subarray(0, 6)) === 'SSHSIG') {
      const reader = new SshReader(data.subarray(6));
      return `sign for "${printable(fromUtf8(reader.string()))}"`;
    }
    const reader = new SshReader(data);
    reader.string();
    // SSH_MSG_USERAUTH_REQUEST: a sign-in to a server.
    if (reader.byte() !== 50) return 'sign';
    const user = printable(fromUtf8(reader.string()));
    reader.string();
    const method = fromUtf8(reader.string());
    return method.startsWith('publickey') ? `sign in as "${user}"` : 'sign';
  } catch {
    return 'sign';
  }
}

/** Nothing a dialog or a terminal would act on, and not too much of it. */
const printable = (text: string) => text.replace(/[\u0000-\u001f\u007f-\u009f]+/g, ' ').slice(0, 80);

/** Each SSH key in the vaults, ready to sign; what cannot sign is said, once, by name. */
async function keysOf(context: Context, options: AgentOptions, said: Set<string>): Promise<Offered[]> {
  const unlocked = await options.store.session(context.env.PASSHOLD_SESSION, options.now());
  await options.account.requirePlan('cli');
  const { data } = await options.account.open(unlocked, { shared: true }, options.say);
  const offered: Offered[] = [];
  for (const vault of vaultsOf(data)) {
    for (const item of vault.items) {
      if (item.deletedAt !== null || !('kind' in item) || item.kind !== 'ssh') continue;
      const name = nameOf(item);
      const made = await sshSigner(item.privateKey);
      if (made.status === 'ready') {
        // One key kept in two vaults is offered once.
        if (!offered.some((entry) => same(entry.signer.blob, made.signer.blob))) offered.push({ signer: made.signer, name, vault: vaultWord(data, vault) });
        continue;
      }
      const why =
        made.status === 'sealed'
          ? 'is sealed with a passphrase, which Passhold does not hold. Keep it in Passhold without one: the vault seals it'
          : made.status === 'unsupported'
            ? `is a ${made.type} key, which is signed with by the hardware it lives on, not here`
            : 'is not a private key as OpenSSH writes it';
      const line = `"${name}" ${why}. It is not offered.`;
      if (!said.has(line)) options.say(line);
      said.add(line);
    }
  }
  return offered;
}

const same = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((byte, index) => byte === b[index]);

const frame = (payload: Uint8Array) => new SshWriter().uint32(payload.length).bytes(payload).done();

/** The longest path a Unix socket takes, in bytes: sun_path, less its closing zero. */
const socketLimit = (platform: NodeJS.Platform) => (platform === 'darwin' ? 103 : 107);

/** Listens where asked, refusing to take over another agent's socket. */
async function listenAt(path: string, platform: NodeJS.Platform, handle: (socket: Socket) => void): Promise<Server> {
  const server = createServer(handle);
  if (platform !== 'win32') {
    // A Unix socket's path is short: past it, the system would cut it, and ssh would look elsewhere.
    if (Buffer.byteLength(path) > socketLimit(platform)) throw new CliError(`That socket's path is too long for a socket: ${path}. Pass a shorter one with --socket.`);
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    if (existsSync(path)) {
      const alive = await new Promise<boolean>((done) => {
        const probe = createConnection(path, () => {
          probe.destroy();
          done(true);
        });
        probe.once('error', () => done(false));
      });
      if (alive) throw new CliError(`An agent already listens at ${path}.`);
      // Left by an agent that did not stop cleanly: nothing answers there.
      rmSync(path, { force: true });
    }
  }
  // Made for its owner alone from the first instant, not only once chmod below runs: a socket in a folder others reach is otherwise theirs to open meanwhile.
  const umask = platform === 'win32' ? null : process.umask(0o177);
  await new Promise<void>((done, fail) => {
    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE' && platform === 'win32') {
        fail(new CliError(`Another agent holds ${path}: most likely Windows' OpenSSH Authentication Agent service. Stop it (Stop-Service ssh-agent, as an administrator), or pass --socket \\\\.\\pipe\\passhold and set SSH_AUTH_SOCK to that.`));
      } else fail(error);
    });
    server.listen(path, () => done());
  }).finally(() => {
    if (umask !== null) process.umask(umask);
  });
  // For its owner alone: inside a folder only they can read, and the socket too.
  if (platform !== 'win32') chmodSync(path, 0o600);
  return server;
}

export async function agent(context: Context, options: AgentOptions): Promise<number> {
  const { store, now, say } = options;
  const platform = process.platform;
  const unlocked = await store.session(context.env.PASSHOLD_SESSION, now());
  const approve = context.approve;
  if (options.confirm && !approve) {
    throw new CliError('There is no way to ask you before each signature here: no terminal, no dialog. Run it in a terminal, set SSH_ASKPASS, or pass --no-confirm to sign without asking.');
  }
  const said = new Set<string>();
  let keys = await keysOf(context, options, said);
  let readAt = Date.now();

  let stop!: (reason: string | null) => void;
  const stopped = new Promise<string | null>((done) => (stop = done));
  /** Whether the unlock still holds: a lock, or its end, stops the agent and signs nothing more. */
  const stillOpen = async (): Promise<boolean> => {
    try {
      await store.session(context.env.PASSHOLD_SESSION, now());
      return true;
    } catch (error) {
      stop(error instanceof CliError ? error.message : 'Passhold is locked.');
      return false;
    }
  };

  // One question at a time: two dialogs at once could each be answered for the other.
  let asking: Promise<unknown> = Promise.resolve();
  const ask = (question: string) => {
    const next = asking.then(() => approve!.ask(question));
    asking = next.catch(() => undefined);
    return next.catch(() => false);
  };

  const answer = async (message: Uint8Array): Promise<Uint8Array> => {
    const failure = new Uint8Array([FAILURE]);
    if (!message.length) return failure;
    const reader = new SshReader(message.subarray(1));
    switch (message[0]) {
      case REQUEST_IDENTITIES: {
        if (!(await stillOpen())) return failure;
        if (Date.now() - readAt > FRESH_MS) {
          try {
            keys = await keysOf(context, options, said);
            readAt = Date.now();
          } catch (error) {
            // A network down takes no key away: the ones read last are offered.
            say(`The vaults could not be read again (${error instanceof Error ? error.message : String(error)}); the keys read before are offered.`);
          }
        }
        const writer = new SshWriter().byte(IDENTITIES_ANSWER).uint32(keys.length);
        for (const { signer, name } of keys) writer.string(signer.blob).string(name);
        return writer.done();
      }
      case SIGN_REQUEST: {
        let blob: Uint8Array;
        let data: Uint8Array;
        let flags: number;
        try {
          blob = reader.string();
          data = reader.string();
          flags = reader.uint32();
        } catch {
          return failure;
        }
        const key = keys.find((entry) => same(entry.signer.blob, blob));
        if (!key || !(await stillOpen())) return failure;
        const what = describe(data);
        if (options.confirm) {
          const question = `Allow "${printable(key.name)}" (${printable(key.vault)}) to ${what}?`;
          if (!(await ask(question))) {
            say(`Refused: "${key.name}" to ${what}.`);
            return failure;
          }
        }
        // Asked, and answered: the unlock may have ended while the question waited.
        if (!(await stillOpen())) return failure;
        const signature = await key.signer.sign(data, flags);
        say(`Signed: "${key.name}" to ${what}.`);
        return new SshWriter().byte(SIGN_RESPONSE).string(signature).done();
      }
      default:
        // Adding, removing, locking, extensions: the agent holds what the vaults hold, and nothing else.
        return failure;
    }
  };

  const connections = new Set<Socket>();
  const handle = (socket: Socket) => {
    connections.add(socket);
    let buffered = Buffer.alloc(0);
    // One request at a time on a connection: the answers go back in the order asked.
    let turn: Promise<void> = Promise.resolve();
    socket.on('data', (chunk: Buffer) => {
      buffered = Buffer.concat([buffered, chunk]);
      for (;;) {
        if (buffered.length < 4) return;
        const length = buffered.readUInt32BE(0);
        if (length > MAX_MESSAGE) {
          socket.destroy();
          return;
        }
        if (buffered.length < 4 + length) return;
        const message = new Uint8Array(buffered.subarray(4, 4 + length));
        buffered = buffered.subarray(4 + length);
        turn = turn.then(async () => {
          const reply = await answer(message).catch(() => new Uint8Array([FAILURE]));
          if (!socket.destroyed) socket.write(frame(reply));
        });
      }
    });
    socket.on('error', () => undefined);
    socket.on('close', () => connections.delete(socket));
  };

  const path = options.socket ?? defaultSocket(context.env, platform);
  const server = await listenAt(path, platform, handle);
  // Listened at as given, which keeps a long folder's socket under the length limit; named in full, or ssh run from another folder would look elsewhere.
  // A full path past that limit would reach no socket at all, so it is named as given, and said to be from this folder.
  const full = platform === 'win32' ? path : resolvePath(path);
  const named = platform !== 'win32' && Buffer.byteLength(full) > socketLimit(platform) ? path : full;
  const cleanUp = () => {
    server.close();
    for (const socket of connections) socket.destroy();
    if (platform !== 'win32') rmSync(path, { force: true });
  };

  const ends = setTimeout(() => void stillOpen(), Math.max(0, unlocked.expiresAt - now()) + 1_000);
  const aborted = () => stop(null);
  context.signal?.addEventListener('abort', aborted, { once: true });
  try {
    // What a shell evaluates, as ssh-agent prints it, on the output; the rest for the person.
    context.out(platform === 'win32' ? `$env:SSH_AUTH_SOCK = '${named}'\n` : `SSH_AUTH_SOCK=${shellQuoted(named)}; export SSH_AUTH_SOCK;\n`);
    say(keys.length ? `Offering ${keys.length} key${keys.length === 1 ? '' : 's'}: ${keys.map((key) => `"${key.name}"`).join(', ')}.` : 'No SSH key in the vaults can sign here yet.');
    if (named !== full) say(`Its full path is too long for ssh to reach: run ssh from this folder, or pass a shorter --socket.`);
    say(options.confirm ? `Each signature is asked for first, ${approve!.how}.` : 'Signing without asking first, as --no-confirm says.');
    say(platform === 'win32' ? `Listening at ${named}. Stop with Ctrl-C.` : `Listening at ${named}. For every ssh, put in ~/.ssh/config:\n  Host *\n    IdentityAgent "${named}"\nStop with Ctrl-C.`);
    const reason = await stopped;
    if (reason) say(`${reason} The agent has stopped.`);
    return 0;
  } finally {
    clearTimeout(ends);
    context.signal?.removeEventListener('abort', aborted);
    cleanUp();
  }
}

const shellQuoted = (text: string) => (/^[\w@%+=:,./-]+$/.test(text) ? text : `'${text.replace(/'/g, `'\\''`)}'`);
