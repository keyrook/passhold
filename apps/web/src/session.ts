/**
 * What the page keeps, and where: this tab's `sessionStorage`, under two keys
 * and nothing else, so closing the tab ends the sitting and a reload keeps
 * only the sign-in, locked. Nothing in `localStorage`, IndexedDB or caches:
 * every sitting reads the records again. Each read and write is guarded, as
 * a browser may refuse storage outright (a private window, a setting).
 */
import type { SignInProvider } from '@passhold/core';
import type { WebSession } from './protocol.js';

/** The session's tokens, the account's id and address, the tab's device id, the lock time chosen, and wrong passwords so far. */
export const SESSION_KEY = 'passhold.web.session';
/** A Google or GitHub sign-in's verifier and state, only across the provider's redirect. */
export const OAUTH_KEY = 'passhold.web.oauth';

/** The minutes a person may choose to stay unlocked while idle: there is no "never". */
export const LOCK_CHOICES = [1, 5, 15, 30, 60] as const;
export type LockMinutes = (typeof LOCK_CHOICES)[number];
export const DEFAULT_LOCK: LockMinutes = 15;
/** Wrong passwords at a locked tab before it signs out, so it cannot be tried for long. */
export const MAX_TRIES = 5;

export interface Kept {
  session: WebSession | null;
  lockMinutes: LockMinutes;
  tries: number;
}

const parsed = (text: string | null): unknown => (text ? (JSON.parse(text) as unknown) : null);

/*
 * Each call names its key, so the built page can be read for any other
 * (test/bundle.test.ts): nothing else is ever kept, and nothing is cleared whole.
 */
function readSession(): unknown {
  try {
    return parsed(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function writeSession(value: unknown): void {
  try {
    if (value === null) sessionStorage.removeItem(SESSION_KEY);
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
  } catch {
    // Refused storage: the sitting goes on, and a reload signs in again.
  }
}

function readOAuth(): unknown {
  try {
    return parsed(sessionStorage.getItem(OAUTH_KEY));
  } catch {
    return null;
  }
}

function writeOAuth(value: unknown): void {
  try {
    if (value === null) sessionStorage.removeItem(OAUTH_KEY);
    else sessionStorage.setItem(OAUTH_KEY, JSON.stringify(value));
  } catch {
    // Refused storage: the sign-in cannot come back to this tab, and says so when it does.
  }
}

const isLockMinutes = (value: unknown): value is LockMinutes => LOCK_CHOICES.includes(value as LockMinutes);

export function loadKept(): Kept {
  const raw = (readSession() ?? {}) as Partial<Kept>;
  const session = raw.session && typeof raw.session === 'object' ? raw.session : null;
  return {
    session,
    lockMinutes: isLockMinutes(raw.lockMinutes) ? raw.lockMinutes : DEFAULT_LOCK,
    tries: Number.isSafeInteger(raw.tries) && raw.tries! >= 0 ? raw.tries! : 0,
  };
}

export function saveKept(next: Kept): void {
  // Signed out with the default lock and no tries: nothing to keep at all.
  if (!next.session && next.lockMinutes === DEFAULT_LOCK && next.tries === 0) writeSession(null);
  else writeSession(next);
}

export function updateKept(change: (kept: Kept) => Kept): Kept {
  const next = change(loadKept());
  saveKept(next);
  return next;
}

/** What a Google or GitHub sign-in started in this tab keeps across the redirect. */
export interface OAuthFlow {
  provider: SignInProvider;
  verifier: string;
  state: string;
  at: number;
}

export function holdOAuth(flow: OAuthFlow): void {
  writeOAuth(flow);
}

/** The flow, taken once: read, it is gone. */
export function takeOAuth(): OAuthFlow | null {
  const raw = readOAuth() as Partial<OAuthFlow> | null;
  writeOAuth(null);
  if (!raw || (raw.provider !== 'google' && raw.provider !== 'github') || typeof raw.verifier !== 'string' || typeof raw.state !== 'string') return null;
  // A sign-in left this long has ended at the server too.
  if (typeof raw.at !== 'number' || Date.now() - raw.at > 10 * 60_000) return null;
  return { provider: raw.provider, verifier: raw.verifier, state: raw.state, at: raw.at };
}
