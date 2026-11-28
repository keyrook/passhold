/**
 * Native Messaging bridge for `fill_login`:
 *
 *   passhold mcp  ──(local 0600 IPC + random token)──▶  passhold mcp --native-host
 *                                                              │
 *                                                (4-byte LE stdio native messaging)
 *                                                              ▼
 *                                                   Passhold browser extension
 *                                                              │
 *                                                 (origin-checked documentId fill)
 *                                                              ▼
 *                                                      Active browser tab
 *
 * Passwords cross ONLY local owner-readable IPC and the browser's own native
 * messaging pipe; they are never logged and never returned to the MCP caller.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createConnection, createServer, type Server, type Socket } from 'node:net';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { VERSION } from '../account.js';
import { CliError } from '../reference.js';

export const NATIVE_HOST_NAME = 'com.keyrook.passhold.mcp';

export type NativeBrowser = 'chrome' | 'edge' | 'firefox';

export const OFFICIAL_CHROME_EXTENSION_ID = 'kpdeebmeokoggpcjbnabffjejppaecng';
export const OFFICIAL_EDGE_EXTENSION_ID = 'genbljljdddlokbbbnedphejagfhbmai';
export const OFFICIAL_FIREFOX_EXTENSION_ID = 'passhold@keyrook.com';

const MAX_NATIVE_BYTES = 1024 * 1024;
const MAX_IPC_LINE_BYTES = 64 * 1024;

export interface NativeFillRequest {
  url: string;
  username: string;
  password: string;
  title?: string;
}

export interface NativeFillResult {
  filled: boolean;
}

/** Platform-standard NativeMessagingHosts directory for each supported browser. */
export function nativeHostDir(
  browser: NativeBrowser,
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  fallbackHome?: string,
): string {
  const userHome = env.HOME || env.USERPROFILE || homedir();
  if (platform === 'darwin') {
    const base = join(userHome, 'Library', 'Application Support');
    if (browser === 'chrome') return join(base, 'Google', 'Chrome', 'NativeMessagingHosts');
    if (browser === 'edge') return join(base, 'Microsoft Edge', 'NativeMessagingHosts');
    return join(base, 'Mozilla', 'NativeMessagingHosts');
  }
  if (platform === 'linux') {
    const configHome = env.XDG_CONFIG_HOME || join(userHome, '.config');
    if (browser === 'chrome') return join(configHome, 'google-chrome', 'NativeMessagingHosts');
    if (browser === 'edge') return join(configHome, 'microsoft-edge', 'NativeMessagingHosts');
    return join(userHome, '.mozilla', 'native-messaging-hosts');
  }
  // Windows registers manifests by path; store cleanly under Passhold's own home dir.
  return join(fallbackHome || join(userHome, '.passhold'), 'native-messaging', browser);
}

/** Builds a Chrome/Edge or Firefox Native Messaging host manifest JSON object. */
export function buildNativeManifest(
  browser: NativeBrowser,
  launcherPath: string,
  extraExtensionIds: readonly string[] = [],
): Record<string, unknown> {
  const base = {
    name: NATIVE_HOST_NAME,
    description: 'Passhold local browser fill bridge for passhold mcp',
    path: launcherPath,
    type: 'stdio',
  };
  if (browser === 'firefox') {
    const ids = new Set<string>([OFFICIAL_FIREFOX_EXTENSION_ID, ...extraExtensionIds.map((s) => s.trim()).filter(Boolean)]);
    return { ...base, allowed_extensions: [...ids] };
  }
  const defaults = browser === 'chrome' ? [OFFICIAL_CHROME_EXTENSION_ID] : [OFFICIAL_EDGE_EXTENSION_ID];
  const origins = new Set<string>(
    [...defaults, ...extraExtensionIds.map((s) => s.trim()).filter(Boolean)].map((id) =>
      id.startsWith('chrome-extension://') ? (id.endsWith('/') ? id : `${id}/`) : `chrome-extension://${id}/`,
    ),
  );
  return { ...base, allowed_origins: [...origins] };
}

/** Installs the native messaging launcher and browser manifest for `passhold mcp --install-browser`. */
export function installBrowserHost(options: {
  browser: NativeBrowser;
  home: string;
  command?: string;
  dir?: string;
  extensionIds?: readonly string[];
  env?: NodeJS.ProcessEnv;
  platform?: NodeJS.Platform;
}): { browser: NativeBrowser; manifestPath: string; launcherPath: string } {
  const platform = options.platform ?? process.platform;
  const cmd = options.command?.trim() || 'passhold';
  mkdirSync(options.home, { recursive: true, mode: 0o700 });

  const launcherPath = resolve(options.home, platform === 'win32' ? 'passhold-native-host.cmd' : 'passhold-native-host.sh');
  if (platform === 'win32') {
    writeFileSync(launcherPath, `@echo off\r\n"${cmd.replace(/"/g, '""')}" mcp --native-host %*\r\n`, 'utf8');
  } else {
    const escaped = cmd.replace(/'/g, "'\\''");
    writeFileSync(launcherPath, `#!/bin/sh\nexec '${escaped}' mcp --native-host "$@"\n`, { encoding: 'utf8', mode: 0o755 });
    chmodSync(launcherPath, 0o755);
  }

  const targetDir = options.dir ? resolve(options.dir) : nativeHostDir(options.browser, options.env, platform, options.home);
  mkdirSync(targetDir, { recursive: true });
  const manifestPath = join(targetDir, `${NATIVE_HOST_NAME}.json`);
  const manifest = buildNativeManifest(options.browser, launcherPath, options.extensionIds);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return { browser: options.browser, manifestPath, launcherPath };
}

/** Local owner-only IPC endpoint path for `passhold mcp` ↔ `passhold mcp --native-host`. */
export function nativeSocketPath(home: string, platform: NodeJS.Platform = process.platform): string {
  const hash = createHash('sha256').update(resolve(home)).digest('hex').slice(0, 16);
  if (platform === 'win32') return `\\\\.\\pipe\\passhold-mcp-fill-${hash}`;
  const direct = join(home, 'mcp-fill.sock');
  // Unix domain sockets are capped at ~104 bytes on macOS; fall back to tmpdir when home is deep.
  return Buffer.byteLength(direct, 'utf8') <= 96 ? direct : join(tmpdir(), `passhold-fill-${hash}.sock`);
}

export function nativeTokenPath(home: string): string {
  return join(home, 'mcp-fill.token');
}

/** Encodes one message using Chrome/Firefox Native Messaging 4-byte LE framing. */
export function encodeNativeMessage(message: unknown): Buffer {
  const body = Buffer.from(JSON.stringify(message), 'utf8');
  if (body.length > MAX_NATIVE_BYTES) throw new Error('Native messaging frame exceeds 1 MiB limit.');
  const frame = Buffer.allocUnsafe(4 + body.length);
  frame.writeUInt32LE(body.length, 0);
  body.copy(frame, 4);
  return frame;
}

/** Incremental parser for 4-byte LE length-prefixed Native Messaging frames. */
export function createNativeMessageDecoder(onMessage: (message: Record<string, unknown>) => void): (chunk: Buffer) => void {
  let buf = Buffer.alloc(0);
  return (chunk: Buffer) => {
    buf = buf.length === 0 ? chunk : Buffer.concat([buf, chunk]);
    while (buf.length >= 4) {
      const length = buf.readUInt32LE(0);
      if (length === 0 || length > MAX_NATIVE_BYTES) {
        buf = Buffer.alloc(0);
        throw new Error(`Invalid native message length: ${length}`);
      }
      if (buf.length < 4 + length) break;
      const raw = buf.subarray(4, 4 + length).toString('utf8');
      buf = buf.subarray(4 + length);
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        onMessage(parsed as Record<string, unknown>);
      }
    }
  };
}

function safeTokenEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export interface NativeHostHandle {
  socketPath: string;
  tokenPath: string;
  close(): Promise<void>;
  done: Promise<void>;
}

/**
 * Starts the Native Messaging host process (`passhold mcp --native-host`):
 * speaks 4-byte LE JSON over `input`/`output` with the browser extension and
 * listens on an owner-only local socket authenticated by a per-session 0600 token.
 */
export async function startNativeHost(options: {
  home: string;
  input?: NodeJS.ReadableStream;
  output?: NodeJS.WritableStream;
  signal?: AbortSignal;
}): Promise<NativeHostHandle> {
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  mkdirSync(options.home, { recursive: true, mode: 0o700 });

  const sockPath = nativeSocketPath(options.home);
  const tokPath = nativeTokenPath(options.home);
  const sessionToken = randomBytes(32).toString('hex');

  if (process.platform !== 'win32') {
    mkdirSync(dirname(sockPath), { recursive: true });
    rmSync(sockPath, { force: true });
  }

  const pending = new Map<
    string,
    { resolve: (reply: { ok: boolean; filled?: boolean; error?: string }) => void; timer: ReturnType<typeof setTimeout> }
  >();

  const sendToExtension = (msg: Record<string, unknown>) => {
    output.write(encodeNativeMessage(msg));
  };

  const server: Server = createServer((socket: Socket) => {
    let raw = '';
    socket.setEncoding('utf8');
    const finish = (reply: { ok: boolean; filled?: boolean; error?: string }) => {
      if (!socket.destroyed) socket.end(`${JSON.stringify(reply)}\n`);
    };
    socket.on('data', (chunk: string) => {
      raw += chunk;
      if (Buffer.byteLength(raw, 'utf8') > MAX_IPC_LINE_BYTES) {
        finish({ ok: false, error: 'Request too large.' });
        return;
      }
      const nl = raw.indexOf('\n');
      if (nl === -1) return;
      const line = raw.slice(0, nl).trim();
      raw = '';
      let req: Record<string, unknown>;
      try {
        req = JSON.parse(line) as Record<string, unknown>;
      } catch {
        finish({ ok: false, error: 'Malformed request.' });
        return;
      }
      if (typeof req.token !== 'string' || !safeTokenEquals(req.token, sessionToken)) {
        finish({ ok: false, error: 'Unauthorized local bridge token.' });
        return;
      }
      if (req.type !== 'fill_login' || typeof req.url !== 'string' || typeof req.password !== 'string') {
        finish({ ok: false, error: 'Unsupported bridge request.' });
        return;
      }
      const id = randomBytes(16).toString('hex');
      const timer = setTimeout(() => {
        pending.delete(id);
        finish({ ok: false, error: 'Timed out waiting for the Passhold browser extension to fill the page.' });
      }, 15_000);
      timer.unref?.();
      pending.set(id, {
        timer,
        resolve: (reply) => finish(reply),
      });
      try {
        sendToExtension({
          id,
          type: 'fill_login',
          url: req.url,
          username: typeof req.username === 'string' ? req.username : '',
          password: req.password,
          ...(typeof req.title === 'string' ? { title: req.title } : {}),
        });
      } catch {
        clearTimeout(timer);
        pending.delete(id);
        finish({ ok: false, error: 'Browser extension bridge disconnected.' });
      }
    });
  });

  await new Promise<void>((resolveReady, rejectReady) => {
    server.once('error', rejectReady);
    server.listen(sockPath, () => {
      server.removeListener('error', rejectReady);
      resolveReady();
    });
  });

  if (process.platform !== 'win32') {
    chmodSync(sockPath, 0o600);
  }
  writeFileSync(tokPath, `${sessionToken}\n`, { encoding: 'utf8', mode: 0o600 });
  if (process.platform !== 'win32') chmodSync(tokPath, 0o600);

  let closed = false;
  let resolveDone!: () => void;
  const done = new Promise<void>((r) => {
    resolveDone = r;
  });

  const close = async () => {
    if (closed) return;
    closed = true;
    for (const [id, entry] of pending) {
      clearTimeout(entry.timer);
      entry.resolve({ ok: false, error: 'Browser bridge closed.' });
      pending.delete(id);
    }
    await new Promise<void>((r) => server.close(() => r()));
    rmSync(tokPath, { force: true });
    if (process.platform !== 'win32') rmSync(sockPath, { force: true });
    resolveDone();
  };

  const decode = createNativeMessageDecoder((msg) => {
    if (msg.type === 'ping') {
      sendToExtension({ type: 'pong', version: VERSION });
      return;
    }
    if (typeof msg.id === 'string') {
      const waiter = pending.get(msg.id);
      if (!waiter) return;
      clearTimeout(waiter.timer);
      pending.delete(msg.id);
      // Only ever forward boolean/status fields — never echo credentials.
      waiter.resolve({
        ok: Boolean(msg.ok),
        ...(typeof msg.filled === 'boolean' ? { filled: msg.filled } : {}),
        ...(typeof msg.error === 'string' ? { error: msg.error } : {}),
      });
    }
  });

  input.on('data', (chunk: Buffer | string) => {
    try {
      decode(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    } catch {
      void close();
    }
  });
  input.once('end', () => void close());
  input.once('close', () => void close());
  options.signal?.addEventListener('abort', () => void close(), { once: true });

  sendToExtension({ type: 'ready', version: VERSION });
  return { socketPath: sockPath, tokenPath: tokPath, close, done };
}

/** Sends a single-use authenticated `fill_login` request from `passhold mcp` to the running native host. */
export async function sendNativeFill(home: string, request: NativeFillRequest, timeoutMs = 15_000): Promise<NativeFillResult> {
  const tokPath = nativeTokenPath(home);
  const sockPath = nativeSocketPath(home);
  let token: string;
  try {
    token = readFileSync(tokPath, 'utf8').trim();
  } catch {
    throw new CliError(
      'Browser fill bridge is not running. Enable "Browser fill for agents" in Passhold extension settings and run: passhold mcp --install-browser',
    );
  }
  if (!token) {
    throw new CliError('Browser fill bridge token is missing.');
  }

  return new Promise<NativeFillResult>((resolveResult, rejectResult) => {
    const socket = createConnection(sockPath);
    let raw = '';
    let settled = false;
    const finish = (err: Error | null, res?: NativeFillResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      if (err) rejectResult(err);
      else resolveResult(res!);
    };

    const timer = setTimeout(() => {
      finish(new CliError('Timed out waiting for the Passhold browser extension to fill the login.'));
    }, timeoutMs);
    timer.unref?.();

    socket.setEncoding('utf8');
    socket.once('error', () => {
      finish(
        new CliError(
          'Could not connect to the Passhold browser extension bridge. Make sure your browser is open with "Browser fill for agents" enabled.',
        ),
      );
    });
    socket.once('connect', () => {
      socket.write(`${JSON.stringify({ token, type: 'fill_login', ...request })}\n`);
    });
    socket.on('data', (chunk: string) => {
      raw += chunk;
      const nl = raw.indexOf('\n');
      if (nl === -1) return;
      try {
        const reply = JSON.parse(raw.slice(0, nl)) as { ok?: boolean; filled?: boolean; error?: string };
        if (reply.ok && reply.filled) finish(null, { filled: true });
        else finish(new CliError(reply.error || 'The browser extension refused to fill that login.'));
      } catch {
        finish(new CliError('Invalid response from the browser fill bridge.'));
      }
    });
    socket.once('end', () => {
      if (!settled) finish(new CliError('Browser fill bridge closed before answering.'));
    });
  });
}
