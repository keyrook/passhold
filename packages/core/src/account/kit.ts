/**
 * The account's recovery key: 160 random bits on a printed sheet, which the
 * account's root is wrapped under (@keyrook/account, keys/root.ts). One sheet
 * opens every product's key, Passhold's among them, so a forgotten account
 * password — or, for an account with no password, every computer gone — is
 * not a lost account.
 *
 * It is for the account, not for Passhold's own vault, which has its own way
 * back.
 */
import { deriveRecoveryAuthHash, group, isWellFormedRecoveryKey, normaliseRecoveryKey } from '@keyrook/account';
import { PassholdError } from '../errors.js';
import type { AccountKitLink } from '../vault/model.js';

/** Whether this is an account recovery key at all — 32 characters, however typed. */
export function isAccountKitKey(input: string): boolean {
  return isWellFormedRecoveryKey(input);
}

/** The key as its sheet shows it, whatever spacing and case it was typed in. */
export function formatAccountKitKey(input: string): string {
  return group(normaliseRecoveryKey(input));
}

/** Proof of the key, for the server to hand over the root's wrapping under it. */
export async function accountKitProof(recoveryKey: string): Promise<string> {
  if (!isWellFormedRecoveryKey(recoveryKey)) throw new PassholdError('accountKitWrong');
  return deriveRecoveryAuthHash(recoveryKey);
}

/**
 * The account's recovery key as this vault should show it, given when the
 * server says the root was last wrapped under one (null: never, or no longer).
 * A sheet made since — by Keyrook Authenticator, or another browser — retires
 * the one this vault holds the key to, and its key is dropped rather than
 * shown as if it still worked. It is only ever for showing: what the sheet
 * opens is decided by the root it opens, never by this.
 */
export function nextAccountKit(held: AccountKitLink | null, wrappedAt: number | null): AccountKitLink | null {
  if (wrappedAt === null) return null;
  if (held && wrappedAt <= held.issuedAt) return held;
  return { issuedAt: wrappedAt, key: null, pending: false };
}
