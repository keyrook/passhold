/**
 * Signing in with Google or GitHub, as Keyrook does it (@keyrook/account).
 *
 * Such an account has no password, so nothing Google, GitHub or Keyrook holds
 * can open its keys. A new browser gets Passhold's key one of three ways: a
 * Passhold browser already in approves it, after a person checks both show
 * the same code; a passkey that holds it; or the recovery key, which opens the
 * account's root and so Passhold's box.
 *
 * The code is computed over both browsers' public keys, Passhold's name and
 * the account, so a server that swapped either key — or routed the request to
 * another product's browser — shows two different codes.
 */
import {
  exportPairingKeys,
  importPairingKeys,
  newPairingKeys,
  productPairingCode,
  toBase64,
  unwrapPairedProductKey,
  wrapProductKeyForPairing,
  type PairingKeys,
  type SealedBox,
} from '@keyrook/account';
import { PassholdError } from '../errors.js';
import { PRODUCT } from './product.js';

export { exportPairingKeys, importPairingKeys, newPairingKeys, type PairingKeys };

const base64url = (bytes: Uint8Array) => toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/**
 * One sign-in's secrets. The verifier never leaves this browser: the ticket
 * the server hands back is worth nothing without it, so a ticket read from a
 * URL, a log or a hostile page buys nothing. The state ties the answer to the
 * sign-in that asked for it.
 */
export async function newProviderFlow(): Promise<{ verifier: string; challenge: string; state: string }> {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
  return { verifier, challenge, state: base64url(crypto.getRandomValues(new Uint8Array(24))) };
}

/** The code both Passhold browsers show for one request to be let in. */
export function pairingCode(accountId: string, pairingId: string, requesterKey: string, approverKey: string): Promise<string> {
  return productPairingCode(PRODUCT, accountId, pairingId, requesterKey, approverKey);
}

/** The approving browser: Passhold's key, wrapped for the requester's key alone. */
export function wrapKeyForPairing(accountId: string, productKey: CryptoKey, approver: PairingKeys, pairingId: string, requesterKey: string): Promise<SealedBox> {
  return wrapProductKeyForPairing(PRODUCT, accountId, productKey, approver, pairingId, requesterKey);
}

/**
 * Passhold's key, from an approving browser's wrap. Opening proves only that
 * the wrap came from whoever holds the key the codes were compared over; the
 * caller still checks the key opens Passhold's pin before taking it.
 */
export async function openPairedKey(accountId: string, requester: PairingKeys, pairingId: string, approverKey: string, box: SealedBox): Promise<CryptoKey> {
  try {
    return await unwrapPairedProductKey(PRODUCT, accountId, requester, pairingId, approverKey, box);
  } catch {
    throw new PassholdError('pairingRefused');
  }
}
