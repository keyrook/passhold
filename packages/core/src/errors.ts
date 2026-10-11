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
  | 'backupInvalid'
  | 'backupWrongPassword'
  | 'kdfUnsupported';

export class PassholdError extends Error {
  override readonly name = 'PassholdError';
  constructor(readonly code: ErrorCode) {
    super(code);
  }
}

export function isPassholdError(value: unknown): value is PassholdError {
  return value instanceof Error && value.name === 'PassholdError' && 'code' in value;
}
