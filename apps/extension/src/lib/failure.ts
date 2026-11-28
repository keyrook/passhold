/**
 * A refusal, from the account's server or from the account's code, as a
 * message key a page can say: the same for the extension's service worker and
 * the web vault's worker. Nothing here reaches the network or the browser.
 */
import { SyncHttpError } from '@keyrook/account';
import { isPassholdError } from '@passhold/core';
import { accountSentenceKey, sentenceKey } from '../background/sentences.js';
import { AppError, fail } from '../i18n/errors.js';

/**
 * The extension's own calls to the server refuse with a `KeyrookError`
 * (background/keyrook.ts, which only the service worker loads): told by its
 * name, so the web vault reads the same refusals without that file.
 */
interface KeyrookRefusal {
  name: 'KeyrookError';
  status: number;
  code: string;
  retryAfter?: number;
  sentence?: string;
}

function isKeyrookError(error: unknown): error is KeyrookRefusal {
  return error instanceof Error && error.name === 'KeyrookError' && typeof (error as Partial<KeyrookRefusal>).code === 'string';
}

/** A refusal from the server or from the account's code, in a key a page can say. */
export function accountFailure(error: unknown): never {
  if (error instanceof AppError || isPassholdError(error)) throw error;
  // Passhold's own calls and @keyrook/account's flows refuse alike: a status, the server's code, its sentence.
  const refusal =
    isKeyrookError(error)
      ? { status: error.status, code: error.code, sentence: error.sentence, retryAfter: error.retryAfter }
      : error instanceof SyncHttpError
        ? { status: error.status, code: error.code, sentence: error.message, retryAfter: undefined }
        : null;
  if (refusal) {
    if (refusal.code === 'network') fail('error.accountOffline');
    // Removed from the account, this browser is signed out as by any other end of its session; what
    // the account held goes only where the proof checks out (`signedOutData`).
    if (refusal.code === 'signed_out' || refusal.code === 'device_removed') fail('error.accountSignedOut');
    // The server's own sentence first, where it says more than its code.
    const said = sentenceKey(refusal.sentence);
    const wait = Math.max(1, Math.ceil(refusal.retryAfter ?? (Number(said?.filled) || 60)));
    if (said?.key === 'error.accountBusy' || said?.key === 'error.accountCodeWait') fail(said.key, { count: wait });
    if (said?.key === 'error.startOverTooOften' || said?.key === 'error.startOverWaiting') fail(said.key, { day: said.filled ?? '' });
    if (said?.key === 'error.agentItemLimit' || said?.key === 'error.agentVaultLimit' || said?.key === 'error.agentMachineLimit') {
      fail(said.key, { limit: said.filled ?? '' });
    }
    if (said?.key) fail(said.key);
    // A refresh the server refused: the session is gone.
    if (refusal.status === 401 && error instanceof SyncHttpError && refusal.code === 'unauthorized') fail('error.accountSignedOut');
    if (refusal.code === 'invalid_credentials') fail('error.accountWrong');
    if (refusal.code === 'rate_limited') fail('error.accountBusy', { count: wait });
    if (refusal.code === 'invalid_code') fail('error.accountCode');
    if (refusal.code === 'forbidden') fail('error.accountPasswordWrong');
    if (refusal.code === 'stale_revision') fail('error.accountKitRace');
    if (refusal.code === 'email_taken') fail('error.providerEmailTaken');
    if (refusal.code === 'not_found') fail('error.pairingEnded');
    if (refusal.code === 'unavailable') fail('error.accountMail');
    fail('error.accountFailed');
  }
  if (error instanceof Error) {
    // A wrap that would not open: the password or the key was not the account's.
    if (error.name === 'DecryptionError') fail('error.accountKeyWrong');
    const said = accountSentenceKey(error.message);
    if (said) fail(said);
  }
  fail('error.accountFailed');
}

