import { fromBase64, PASSKEY_PRF_INPUT, toBase64, toBase64url } from '@passhold/core';
import { BackgroundError, send, type AccountPasskeyTouch } from '../lib/messaging.js';
import { onEdge } from '../lib/name.js';

/**
 * One of the Keyrook account's passkeys, touched in Passhold's own page. They
 * belong to the account's page (`__KEYROOK_ACCOUNT_RP__`), and Chrome lets an
 * extension use a site's passkeys only with the host permission for it: asked
 * for here, on the click that chose a passkey, never at install.
 *
 * The answer goes to the service worker as the browser gave it, with the PRF
 * answer apart: the worker sends the server what it checks and nothing else
 * (`passkeyCredential`), and opens the account's root with the PRF answer
 * itself. This page keeps neither.
 */
const ORIGINS = [`https://${__KEYROOK_ACCOUNT_RP__}/*`];

type PrfResults = { prf?: { results?: { first?: ArrayBuffer } } };

const bytes = (base64url: string) => fromBase64(base64url) as BufferSource;
const text = (buffer: ArrayBuffer) => toBase64url(new Uint8Array(buffer));

/** `secondStep`: for a sign-in's second step, whose challenge is for the sign-in waiting on it. */
export async function touchAccountPasskey(purpose: 'signIn' | 'secondStep' = 'signIn'): Promise<AccountPasskeyTouch> {
  // Before anything else is awaited: Chrome asks only while the click is fresh.
  const allowed = (await chrome.permissions.contains({ origins: ORIGINS })) || (await chrome.permissions.request({ origins: ORIGINS }));
  if (!allowed) throw new BackgroundError('no permission', onEdge() ? 'error.passkeyPermissionEdge' : 'error.passkeyPermission');
  const options = await send({ type: purpose === 'secondStep' ? 'account/secondStepPasskey' : 'account/passkeyChallenge' });
  let credential: PublicKeyCredential | null;
  try {
    credential = (await navigator.credentials.get({
      publicKey: {
        challenge: bytes(options.publicKey.challenge),
        rpId: options.publicKey.rpId,
        timeout: options.publicKey.timeout,
        userVerification: 'required',
        allowCredentials: options.publicKey.allowCredentials.map((entry) => ({ type: 'public-key' as const, id: bytes(entry.id) })),
        extensions: { prf: { eval: { first: PASSKEY_PRF_INPUT as BufferSource } } } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential | null;
  } catch (error) {
    // Cancelled, timed out, or no passkey here for the account: all one to the person.
    if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
      throw new BackgroundError(error.name, 'error.passkeyCancelled');
    }
    throw new BackgroundError(String(error), 'error.passkeyFailed');
  }
  if (!credential) throw new BackgroundError('none', 'error.passkeyCancelled');
  const response = credential.response as AuthenticatorAssertionResponse;
  const first = (credential.getClientExtensionResults() as PrfResults).prf?.results?.first;
  return {
    challengeId: options.challengeId,
    answer: {
      id: credential.id,
      rawId: text(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: text(response.clientDataJSON),
        authenticatorData: text(response.authenticatorData),
        signature: text(response.signature),
        userHandle: response.userHandle ? text(response.userHandle) : null,
      },
    },
    prf: first && first.byteLength === 32 ? toBase64(new Uint8Array(first)) : null,
  };
}
