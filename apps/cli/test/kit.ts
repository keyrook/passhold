/**
 * What the command line's tests share: the account's own server from
 * keyrook-account's kit, an account made as Passhold makes one with its
 * logins sealed and sent as the extension sends them, and a terminal the
 * tests type at. The public tree has no kit, and the tests that need it are
 * skipped there.
 *
 * The terminal calls as a phone app does, with no origin: the server knows it
 * for Passhold's by the name it gives (`passhold-<platform>/…`, on
 * `nativeProducts`). The browser that made the account calls from the
 * extension's origin.
 */
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { resolve as path } from 'node:path';
import { HttpSyncAdapter, namedClient, type Fetcher, type LoginResponse, type Tokens } from '@keyrook/account';
import { expect } from 'vitest';
import { addLogin, addWalletItem, emptyData, generateSshKey, planPush, recordsKey, type VaultData } from '@passhold/core';
import { APP_ID } from '../src/account.js';
import { run, type Context } from '../src/cli.js';

export const KIT = path(import.meta.dirname, '../../../vendor/keyrook-account-kit/server-kit.mjs');
export const ORIGIN = 'chrome-extension://passholdtestextensionidaaaaaaaaa';
export const PAGE = 'http://localhost:5174';
export const PASSWORD = 'Correct-Horse-Battery-9!';
export const DEVICE = { deviceId: 'browser', deviceName: 'Passhold · test' };
const HOMES = path(import.meta.dirname, '../../../.tmp/cli-test');
/** The homes this test file made: each file takes away its own, and no other's. */
const made = new Set<string>();

export function forgetHomes(): void {
  for (const home of made) rmSync(home, { recursive: true, force: true });
}

/** A session of the account's API, as a browser or a page holds one. */
export function session(fetcher: Fetcher, answer: Pick<LoginResponse, 'accessToken' | 'refreshToken'>): HttpSyncAdapter {
  let tokens: Tokens | null = { accessToken: answer.accessToken, refreshToken: answer.refreshToken };
  return new HttpSyncAdapter({ baseUrl: '', fetcher, tokens: { get: async () => tokens, set: async (next) => void (tokens = next), clear: async () => void (tokens = null) } });
}

/** What the vault holds in these tests: two logins, a note and an SSH key. */
export async function contents(): Promise<VaultData> {
  let data = addLogin(emptyData(), { title: 'Database', username: 'app', password: 'db-Secret-1!', urls: ['https://db.example.test'], notes: '', fields: [{ name: 'Port', value: '5432', hidden: false }] }).data;
  data = addLogin(data, { title: 'Bank', username: 'alice', password: 'bank-Secret-2!', urls: ['https://bank.example.test'], notes: 'savings' }).data;
  data = addWalletItem(data, { kind: 'note', title: 'Wi-Fi', text: 'pass-7Q!-river' }).data;
  const key = await generateSshKey('deploy');
  data = addWalletItem(data, { kind: 'ssh', title: 'Deploy key', privateKey: key.privateKey, publicKey: key.publicKey, fingerprint: key.fingerprint, notes: '' }).data;
  return data;
}

/**
 * What of the kit these tests use, named here rather than imported: the
 * public tree has no kit, and must still typecheck without one.
 */
interface Kit {
  startServer(options: Record<string, unknown>): Promise<{
    fetcher: Fetcher;
    fetcherFrom(origin: string): Fetcher;
    codeFor(email: string): string | undefined;
    close(): Promise<void>;
    sql: { query<T>(text: string, values?: unknown[]): Promise<T[]> };
  }>;
  standInProvider(name: 'google' | 'github'): unknown;
}

export async function server(options: Record<string, unknown> = {}) {
  const kit = (await import(/* @vite-ignore */ KIT)) as Kit;
  // On a paid plan unless a test says otherwise: the command line is part of Premium.
  const running = await kit.startServer({ products: { passhold: [ORIGIN] }, nativeProducts: ['passhold'], appClients: [APP_ID], providers: { google: kit.standInProvider('google') }, personalPlan: 'paid', ...options });
  const browser = namedClient(running.fetcherFrom(ORIGIN), 'passhold/0.1.0');
  // The terminal's: no origin at all.
  const from: Fetcher = running.fetcher;
  const connect = (answer: Pick<LoginResponse, 'accessToken' | 'refreshToken'>) => session(browser, answer);
  /** Seals what a vault holds under Passhold's key and sends it, as the extension's sync does. */
  const send = async (session: Pick<LoginResponse, 'accessToken' | 'refreshToken'>, productKey: CryptoKey, data: VaultData) => {
    const plan = await planPush(data, {}, await recordsKey(productKey), DEVICE.deviceId);
    const pushed = await connect(session).push(plan.records);
    expect(pushed.accepted).toHaveLength(plan.records.length);
  };
  return { running, from, browser, connect, send, kit };
}

/** A terminal the test types at: what it printed, and the lines it will answer prompts with. */
export function terminal(name: string, fetcher: Fetcher, extra: Partial<Context> = {}) {
  const home = path(HOMES, `${name}-${process.pid}`);
  rmSync(home, { recursive: true, force: true });
  made.add(home);
  const env: NodeJS.ProcessEnv = { PASSHOLD_HOME: home, PASSHOLD_API: '', PATH: process.env.PATH };
  /** One run of the program: what it printed, its prompts among it, and the lines it was answered with. Runs may overlap. */
  const passhold = async (argv: string[], answers: string[] = [], input = '', more: Partial<Context> = {}) => {
    const printed = { out: '', err: '' };
    const code = await run({
      argv,
      env,
      out: (text) => void (printed.out += text),
      err: (text) => void (printed.err += text),
      // The prompt is printed as the program prints it, on the error stream.
      secret: async (prompt) => {
        printed.err += prompt;
        return answers.shift() ?? '';
      },
      input: async () => input,
      exec: async (command, args, childEnv) => {
        const child = spawnSync(command, args, { env: childEnv, encoding: 'utf8' });
        printed.out += child.stdout;
        return child.status ?? 1;
      },
      fetcher,
      ...extra,
      ...more,
    });
    return { code, ...printed };
  };
  /** `eval "$(passhold unlock)"`, as a shell would run it. */
  const unlock = async (argv: string[], answers: string[]) => {
    const result = await passhold(['unlock', ...argv], answers);
    const session = /^export PASSHOLD_SESSION="([^"]+)"$/m.exec(result.out)?.[1];
    if (session) env.PASSHOLD_SESSION = session;
    return result;
  };
  return { home, env, passhold, unlock };
}

