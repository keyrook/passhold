/**
 * What the command line keeps on this computer, in one folder only its owner
 * can read (`~/.config/passhold`, or `PASSHOLD_HOME`):
 *
 * - `account.json`: which account is signed in, and its session's tokens. A
 *   token fetches the account's records, which are sealed: it opens none.
 *   With it, what this terminal pinned of each family, sealed under
 *   Passhold's key, as a Passhold browser keeps it in its vault.
 * - `session.json`: Passhold's key in the account, sealed under a key that is
 *   nowhere on disk. `passhold unlock` prints that key for the shell to hold
 *   (`PASSHOLD_SESSION`), and the file says when the unlock ends.
 *
 * Nothing a login holds is ever written here: every command reads the sealed
 * records from the account and opens them in memory.
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { exportDataKey, generateDataKey, importDataKey, openJson, sealJson, utf8, type Plan, type SealedBox } from '@passhold/core';
import { CliError } from './reference.js';

export interface StoredAccount {
  /** The account's server this session was made on. */
  api: string;
  accountId: string;
  email: string;
  /** Drawn at sign-in, as every Passhold browser draws its own. */
  deviceId: string;
  tokens: { accessToken: string; refreshToken: string } | null;
  /** The root Passhold's key was last seen sealed to: a server that later shows another is caught (`openProductKey`). */
  pinned: string | null;
  /** The plan the server last named: the answer kept for when it cannot be asked. */
  plan?: Plan;
  /** What this terminal keeps of each family the account is in, by the family's id. */
  families?: Record<string, StoredFamily>;
}

/** A family, as this terminal last checked it. */
export interface StoredFamily {
  /**
   * The roster as this terminal last checked it, sealed under Passhold's key
   * (`openFamily`'s `pinned`): a roster older than it, or one naming another
   * key for someone in it, is refused against it.
   */
  pin: SealedBox;
  /** Who is in it, by account id, as the server last named them: to say who went once it names them no more. */
  names: Record<string, string>;
  /** Those the roster stopped listing, until `passhold vaults` has shown them. */
  left: { accountId: string; email: string }[];
}

/** Passhold's key as an unlock keeps it. */
export interface Unlocked {
  accountId: string;
  /** Base64, as `exportDataKey` writes a key. */
  productKey: string;
  expiresAt: number;
}

interface StoredSession {
  expiresAt: number;
  box: SealedBox;
}

/** How long an unlock lasts unless asked otherwise: a quarter of an hour, as the extension locks. */
export const UNLOCK_MINUTES = 15;

export function homeOf(env: NodeJS.ProcessEnv): string {
  if (env.PASSHOLD_HOME) return env.PASSHOLD_HOME;
  return join(env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'passhold');
}

export class Store {
  constructor(private readonly home: string) {}

  private path(name: string): string {
    return join(this.home, name);
  }

  private read<T>(name: string): T | null {
    if (!existsSync(this.path(name))) return null;
    try {
      return JSON.parse(readFileSync(this.path(name), 'utf8')) as T;
    } catch {
      return null;
    }
  }

  /** Written for its owner alone: the folder 700, the file 600. */
  private write(name: string, value: unknown): void {
    mkdirSync(this.home, { recursive: true, mode: 0o700 });
    writeFileSync(this.path(name), `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
    chmodSync(this.path(name), 0o600);
  }

  account(): StoredAccount | null {
    return this.read<StoredAccount>('account.json');
  }

  saveAccount(account: StoredAccount): void {
    this.write('account.json', account);
  }

  signOut(): void {
    rmSync(this.path('account.json'), { force: true });
    this.lock();
  }

  /** Keeps an unlock, and hands back the key that opens it: for the shell, never for a file. */
  async saveSession(unlocked: Unlocked): Promise<string> {
    const key = await generateDataKey();
    const box = await sealJson(key, unlocked, sessionAad(unlocked.expiresAt));
    this.write('session.json', { expiresAt: unlocked.expiresAt, box } satisfies StoredSession);
    return exportDataKey(key);
  }

  /**
   * The unlock a session key opens, while it lasts. The time it ends is
   * sealed with it, so a file edited to last longer does not open.
   */
  async session(sessionKey: string | undefined, now: number): Promise<Unlocked> {
    const stored = this.read<StoredSession>('session.json');
    if (!stored || !sessionKey) throw new CliError('Passhold is locked. Run: eval "$(passhold unlock)"');
    if (stored.expiresAt <= now) {
      this.lock();
      throw new CliError('The unlock has ended. Run: eval "$(passhold unlock)"');
    }
    try {
      return await openJson<Unlocked>(await importDataKey(sessionKey), stored.box, sessionAad(stored.expiresAt));
    } catch {
      throw new CliError('PASSHOLD_SESSION does not open this unlock. Run: eval "$(passhold unlock)"');
    }
  }

  lock(): void {
    rmSync(this.path('session.json'), { force: true });
  }
}

const sessionAad = (expiresAt: number) => utf8(`passhold.cli.session:v1:${expiresAt}`);
