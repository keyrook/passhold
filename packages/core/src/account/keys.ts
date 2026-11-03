/**
 * The Keyrook account's keys — from @keyrook/account, the account code every
 * Keyrook product shares (vendor/keyrook-account, copied from keyrook-account,
 * which owns it). Written once, there: an account made in one product must
 * open in the others, and two copies would drift.
 *
 *     masterKey    = PBKDF2(password, the account's salt)
 *     authHash     = HKDF(masterKey, "authx:v1:auth")         proves the password to the server
 *     rootWrapKey  = HKDF(masterKey, "keyrook:v1:root-wrap")  opens the account's root; never leaves the device
 *
 * What is here is Passhold's side of it: refusals as Passhold's own codes, so
 * a page can say them in the reader's language.
 */
import {
  accountPasswordProblem,
  assertAcceptableAccountKdf as assertAcceptable,
  DEFAULT_ACCOUNT_ITERATIONS,
  deriveAccountKeys as derive,
  newAccountKdfParams,
  type AccountKdfParams,
  type AccountKeys,
} from '@keyrook/account';
import { PassholdError } from '../errors.js';

export type { AccountKdfParams, AccountKeys };

export const ACCOUNT_ITERATIONS = DEFAULT_ACCOUNT_ITERATIONS;

/**
 * Refuse parameters weaker than Keyrook would choose. Prelogin answers before
 * anything is proved, so a hostile server could ask for a cheap count and
 * make every sign-in after hand it an `authHash` cheap to attack offline.
 */
export function assertAcceptableAccountKdf(params: AccountKdfParams): void {
  try {
    if (typeof params !== 'object' || params === null) throw new Error('No parameters.');
    assertAcceptable(params);
    // Keyrook sets no ceiling; a count of a billion would hang the browser before anything is checked.
    if (params.iterations > 10_000_000) throw new Error('Too many iterations.');
  } catch {
    throw new PassholdError('accountKdfRefused');
  }
}

export async function deriveAccountKeys(password: string, params: AccountKdfParams): Promise<AccountKeys> {
  assertAcceptableAccountKdf(params);
  return derive(password, params);
}

/** Fresh parameters for a new account: Keyrook's cost, a salt of its own. */
export function newAccountKdf(): AccountKdfParams {
  return newAccountKdfParams();
}

/**
 * Whether a password may guard a Keyrook account: Keyrook's own rule, the
 * same in every product. The account's root sits on the server wrapped under
 * it, and the server never sees the password to check.
 */
export function strongEnoughForAccount(password: string): boolean {
  return accountPasswordProblem(password) === null;
}
