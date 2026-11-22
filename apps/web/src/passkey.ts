/**
 * The account's passkeys, in the web vault. They are made for the account's
 * page (`__KEYROOK_ACCOUNT_RP__`), and the vault is another origin: the
 * account's page lists it as one of its own (`/.well-known/webauthn`,
 * WebAuthn's related origins). A browser that does not say it honours that
 * list is not offered the passkey at all, so nothing half works; nor is an
 * iPhone before iOS 18.4, whose earlier 18.x lost PRF answers.
 */
import { touchFor } from '../../extension/src/ui/accountPasskey.js';
import type { AccountPasskeyTouch } from '../../extension/src/lib/messaging.js';
import type { PasskeySignInOptions } from '@keyrook/account';
import { ask } from './client.js';


type Capabilities = Record<string, boolean>;
type WithCapabilities = { getClientCapabilities?: () => Promise<Capabilities> };

/** An iPhone's or iPad's system version, from what its browser says; null elsewhere. */
export function iosVersion(userAgent: string): [number, number] | null {
  if (!/iPhone|iPad|iPod/.test(userAgent)) return null;
  const found = /OS (\d+)[_.](\d+)/.exec(userAgent);
  return found ? [Number(found[1]), Number(found[2])] : [0, 0];
}

/** Whether the page's origin and the passkeys' site are one site: then no list is needed, as for the tests' kit. */
export function sameSite(host: string, rpId: string): boolean {
  return host === rpId || host.endsWith(`.${rpId}`);
}

/** Whether this browser may be offered the account's passkeys here. */
export async function passkeysHere(): Promise<boolean> {
  if (typeof PublicKeyCredential === 'undefined') return false;
  const ios = iosVersion(navigator.userAgent);
  if (ios && (ios[0] < 18 || (ios[0] === 18 && ios[1] < 4))) return false;
  if (sameSite(location.hostname, __KEYROOK_ACCOUNT_RP__)) return true;
  try {
    const capabilities = await (PublicKeyCredential as unknown as WithCapabilities).getClientCapabilities?.();
    return capabilities?.relatedOrigins === true;
  } catch {
    return false;
  }
}

/** One of the account's passkeys, touched for a sign-in (or a sign-in again, for a locked tab) or a sign-in's second step. */
export async function touchPasskey(purpose: 'signIn' | 'secondStep'): Promise<AccountPasskeyTouch> {
  const options = await ask<PasskeySignInOptions>({ type: purpose === 'secondStep' ? 'account/secondStepPasskey' : 'account/passkeyChallenge' });
  return touchFor(options);
}
