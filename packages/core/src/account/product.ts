/**
 * Passhold's own key in the Keyrook account (@keyrook/account, keys per
 * product).
 *
 * The account has a root: an ECDH key pair whose private half the server
 * holds only wrapped, under the account password and under the recovery key.
 * Passhold's logins are sealed under a key of Passhold's own, sealed to the
 * root's public half, so the password or the recovery key opens it on a new
 * computer — and nothing Passhold holds opens another product's key, nor
 * theirs Passhold's. Beside it sits a pin, sealed under Passhold's key, naming
 * the root Passhold sealed itself to. The server can write neither.
 *
 * The flows that make, open and change these are @keyrook/account's
 * (`src/flows`); what is here is Passhold's side of them.
 */
import {
  checkDeviceRemovalProof,
  openRootPin,
  openRootWithRecoveryKey,
  PASSHOLD,
  type AccountRoot,
  type DeviceRemovalProof,
  type RootPin,
  type SealedBox,
} from '@keyrook/account';
import { importDataKey } from '../crypto/aead.js';
import { PassholdError } from '../errors.js';
import type { AccountLink } from '../vault/model.js';

export type { AccountRoot, RootPin };

/**
 * What a page asks the Keyrook account's passkey to answer with PRF: the
 * account's own input, the same in every app and on the account's page, so
 * one passkey's answer opens the root wherever it is touched. Only the
 * service worker uses that answer, never the page that asked.
 */
export { PASSKEY_PRF_INPUT } from '@keyrook/account';
export type { PasskeyAnswer as AccountPasskeyAnswer, PasskeySignInOptions as AccountPasskeyOptions } from '@keyrook/account';

/** Passhold's name in the account. A constant: what every box, pin and pairing here is bound to, never a name the server reports. */
export const PRODUCT = PASSHOLD;

/** The root, with the recovery key, however it was typed. */
export async function openRootBySheet(box: SealedBox, recoveryKey: string, accountId: string): Promise<AccountRoot> {
  try {
    return await openRootWithRecoveryKey(box, recoveryKey, accountId);
  } catch {
    throw new PassholdError('accountKitWrong');
  }
}

/**
 * Passhold's pin, opened with a key: null when that key is not Passhold's on
 * this account. A key that came from another browser or a passkey is taken
 * only once its pin opens — the server cannot seal one under a key it chose
 * and have it pass for Passhold's.
 */
export async function readPassholdPin(productKey: CryptoKey, pin: SealedBox, accountId: string): Promise<RootPin | null> {
  try {
    return await openRootPin(productKey, pin, accountId, PRODUCT);
  } catch {
    return null;
  }
}

/**
 * When this browser was removed from the account, if `proof` — what the
 * server handed back with `device_removed`, untrusted — says so under
 * Passhold's key: the account's page opens that key from the root to make
 * one. Null for no proof, a bent one, or one for another account, product,
 * device or key: then the server only signed this browser out, which it can
 * always do, and nothing here says more than that.
 *
 * No sign-in time is held to it: every sign-in draws a device id of its own
 * (`AccountLink.deviceId`), so a proof naming this link's id was made for
 * this session — there is no earlier one for a server to replay it from.
 */
export async function removalProved(link: Pick<AccountLink, 'accountId' | 'productKey' | 'deviceId'>, proof: unknown): Promise<number | null> {
  if (!link.accountId || !link.productKey) return null;
  const device = { accountId: link.accountId, product: PRODUCT, deviceId: link.deviceId, signedInAt: 0 };
  try {
    return (await checkDeviceRemovalProof(await importDataKey(link.productKey), device, proof)) ? (proof as DeviceRemovalProof).removedAt : null;
  } catch {
    // A device id no proof could name ("Malformed device id."): nothing removed it.
    return null;
  }
}
