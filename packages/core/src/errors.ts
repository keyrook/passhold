/**
 * Every refusal the core makes, as a code. The core says nothing in English:
 * the extension turns a code into a sentence in the reader's language, and a
 * future app will do the same in its own.
 */
export type ErrorCode =
  | 'wrongPassword'
  | 'passwordTooShort'
  | 'vaultCorrupt'
  | 'vaultTooNew'
  | 'itemNotFound'
  | 'itemInvalid'
  | 'importEmpty'
  | 'importTooLarge'
  | 'importUnknownFormat'
  | 'importEncrypted'
  | 'backupInvalid'
  | 'backupWrongPassword'
  | 'pinInvalid'
  | 'wrongPin'
  | 'deviceKeyWrong'
  | 'accountKdfRefused'
  | 'accountKeyWrong'
  | 'accountKitWrong'
  | 'pairingRefused'
  | 'passkeyWrong'
  | 'kdfUnsupported'
  | 'familyOrganiserOnly'
  /** An item holds as many files as it may. */
  | 'attachmentsFull'
  /** A file is larger than the account keeps. */
  | 'fileTooLarge'
  /** An item with files moves into a shared vault only once they are off it: they are its owner's in the account, not the family's. */
  | 'filesStay'
  /** A shared vault this account may only view: every change refused, whatever a page sends. */
  | 'viewOnly'
  /** What the owner's plan does not hold, asked for all the same. */
  | 'notOnPlan';

export class PassholdError extends Error {
  override readonly name = 'PassholdError';
  constructor(readonly code: ErrorCode) {
    super(code);
  }
}

export function isPassholdError(value: unknown): value is PassholdError {
  return value instanceof Error && value.name === 'PassholdError' && 'code' in value;
}
