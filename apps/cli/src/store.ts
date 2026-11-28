/**
 * What the command line keeps on this computer, in one folder only its owner
 * can read (`~/.config/passhold`, or `PASSHOLD_HOME`):
 *
 * - `account.json`: which account is signed in, and its session's tokens. A
 *   token fetches the account's records, which are sealed: it opens none.
 *   With it, what this terminal pinned of each family, and what it last
 *   trusted of the account's agents.
 * - `session.json`: Passhold's key in the account, sealed under a key that is
 *   nowhere on disk. `passhold unlock` prints that key for the shell to hold
 *   (`PASSHOLD_SESSION`), and the file says when the unlock ends.
 * - `machine.json`: an enrolled machine's own identity (key pair, credential,
 *   pinned authority), kept mode 0600.
 * - `machine-cache.json` (or `PASSHOLD_CACHE`): sealed local cache of a
 *   machine's pulled items, anti-rollback `MachineMarks`, and unsent sealed
 *   log entries, encrypted under a key derived from the machine's ECDH key.
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import {
  pinAuthority,
  type AgentAuthorityPoints,
  type AgentSignedBox,
  type MachineDelivery,
  type MachineGrant,
  type MachineIdentity,
  type MachineListing,
  type MachineMarks,
  type MachineSealed,
  type MemberKey,
} from '@keyrook/account';
import {
  exportDataKey,
  fromBase64,
  generateDataKey,
  importDataKey,
  openJson,
  sealJson,
  toBase64,
  utf8,
  type AgentItemValue,
  type Plan,
  type SealedBox,
  type StoredAgentsState,
} from '@passhold/core';
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
  /** Passhold's current key generation in this account (1+). */
  keyGeneration?: number;
  /** Previous Passhold key (raw base64) kept while moving agents after a key replacement. */
  previousKey?: string | null;
  previousKeyGeneration?: number;
  agentsMovePending?: boolean;
  /** The plan the server last named: the answer kept for when it cannot be asked. */
  plan?: Plan;
  /** What this terminal keeps of each family the account is in, by the family's id. */
  families?: Record<string, StoredFamily>;
  /** What this terminal last trusted of the account's agents. */
  agents?: StoredAgentsState;
}

/** A family, as this terminal last checked it. */
export interface StoredFamily {
  pin: SealedBox;
  names: Record<string, string>;
  left: { accountId: string; email: string }[];
}

/** Passhold's key as an unlock keeps it. */
export interface Unlocked {
  accountId: string;
  /** Base64, as `exportDataKey` writes a key. */
  productKey: string;
  /** Key generation of `productKey`, when known. */
  keyGeneration?: number;
  expiresAt: number;
}

interface StoredSession {
  expiresAt: number;
  box: SealedBox;
}

/** An enrolled machine's persistent identity on this computer (mode 0600). */
export interface StoredEnrolledMachine {
  api: string;
  accountId: string;
  machineId: string;
  invitationId: string;
  /** PKCS#8 base64 of the machine's ECDH P-256 private key. */
  privateKey: string;
  /** Uncompressed P-256 public point, base64. */
  publicKey: string;
  credential: string;
  authority: AgentAuthorityPoints;
  /** Authority-signed expiry once confirmed; 0 while pending confirmation. */
  expiresAt: number;
  confirmed: boolean;
}

export interface CachedMachineItem {
  vault: string;
  item: string;
  version: number;
  grant: MachineGrant;
  listing: MachineListing;
  delivery: MachineDelivery;
  /** Present only for standing grants whose record opened cleanly. */
  value: AgentItemValue | null;
  rev: number;
  deleted: boolean;
  /** Kept for session grants so a released session key can open the record locally. */
  recordBox: AgentSignedBox | null;
  recordWriteKey: string;
}

export interface CachedMachineState {
  marks: MachineMarks;
  items: Record<string, CachedMachineItem>;
  pendingLogs: { stream: string; sequence: number; box: MachineSealed }[];
  machineExpiresAt: number;
}

interface SealedCacheFile {
  version: 1;
  accountId: string;
  machineId: string;
  box: SealedBox;
}

/** How long an unlock lasts unless asked otherwise: a quarter of an hour, as the extension locks. */
export const UNLOCK_MINUTES = 15;

export function homeOf(env: NodeJS.ProcessEnv): string {
  if (env.PASSHOLD_HOME) return env.PASSHOLD_HOME;
  return join(env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'passhold');
}

export async function exportMemberKey(key: MemberKey): Promise<{ privateKey: string; publicKey: string }> {
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', key.privateKey));
  return { privateKey: toBase64(pkcs8), publicKey: key.publicKey };
}

export async function importMemberKey(stored: { privateKey: string; publicKey: string }): Promise<MemberKey> {
  const raw = fromBase64(stored.privateKey);
  const privateKey = await crypto.subtle.importKey('pkcs8', raw as BufferSource, { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  return { privateKey, publicKey: stored.publicKey };
}

export async function identityOfStoredMachine(stored: StoredEnrolledMachine): Promise<MachineIdentity> {
  const key = await importMemberKey(stored);
  const pinned = await pinAuthority(stored.authority);
  return {
    credentials: { accountId: stored.accountId, machineId: stored.machineId, credential: stored.credential },
    key,
    pinned,
  };
}

export async function exportVerifyKey(verify: CryptoKey): Promise<string> {
  const spki = new Uint8Array(await crypto.subtle.exportKey('spki', verify));
  return toBase64(spki);
}

export async function importVerifyKey(spkiBase64: string): Promise<CryptoKey> {
  const raw = fromBase64(spkiBase64);
  return crypto.subtle.importKey('spki', raw as BufferSource, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
}

/** Derives a local AES-256-GCM cache key from the machine's ECDH private key via HKDF-SHA256. */
async function cacheKeyFor(machineKey: MemberKey, accountId: string, machineId: string): Promise<CryptoKey> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('pkcs8', machineKey.privateKey));
  const base = await crypto.subtle.importKey('raw', raw as BufferSource, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: utf8(`${accountId}:${machineId}`) as BufferSource,
      info: utf8('passhold.machine-cache:v1') as BufferSource,
    },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

const cacheAad = (accountId: string, machineId: string) => utf8(`passhold.machine-cache:v1:${accountId}:${machineId}`);

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
    this.writePath(this.path(name), value);
  }

  private writePath(fullPath: string, value: unknown): void {
    mkdirSync(dirname(fullPath), { recursive: true, mode: 0o700 });
    writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
    if (process.platform !== 'win32') chmodSync(fullPath, 0o600);
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

  // --- Enrolled machine identity & sealed machine cache -----------------------------------

  machine(): StoredEnrolledMachine | null {
    return this.read<StoredEnrolledMachine>('machine.json');
  }

  saveMachine(machine: StoredEnrolledMachine): void {
    this.write('machine.json', machine);
  }

  removeMachine(): void {
    rmSync(this.path('machine.json'), { force: true });
  }

  cachePath(env?: NodeJS.ProcessEnv): string {
    return env?.PASSHOLD_CACHE || this.path('machine-cache.json');
  }

  async readMachineCache(
    machineKey: MemberKey,
    accountId: string,
    machineId: string,
    filePath?: string,
  ): Promise<CachedMachineState | null> {
    const target = filePath || this.path('machine-cache.json');
    if (!existsSync(target)) return null;
    try {
      const file = JSON.parse(readFileSync(target, 'utf8')) as Partial<SealedCacheFile>;
      if (file.version !== 1 || file.accountId !== accountId || file.machineId !== machineId || !file.box) return null;
      const key = await cacheKeyFor(machineKey, accountId, machineId);
      return await openJson<CachedMachineState>(key, file.box, cacheAad(accountId, machineId));
    } catch {
      return null;
    }
  }

  async writeMachineCache(
    machineKey: MemberKey,
    accountId: string,
    machineId: string,
    state: CachedMachineState,
    filePath?: string,
  ): Promise<void> {
    const target = filePath || this.path('machine-cache.json');
    const key = await cacheKeyFor(machineKey, accountId, machineId);
    const box = await sealJson(key, state, cacheAad(accountId, machineId));
    this.writePath(target, { version: 1, accountId, machineId, box } satisfies SealedCacheFile);
  }
}

const sessionAad = (expiresAt: number) => utf8(`passhold.cli.session:v1:${expiresAt}`);
