/**
 * Refusals, as message keys. The service worker throws `AppError` with a key,
 * never English; the core throws `PassholdError` with a code, which maps to
 * `error.<code>`. Whatever else escapes is shown as "Something went wrong"
 * with its text — rare, and better than a blank.
 */
import { isPassholdError, MIN_MASTER_PASSWORD, type ErrorCode } from '@passhold/core';
import type { Values } from './format.js';
import type { MessageKey } from './locales/en.js';

export class AppError extends Error {
  override readonly name = 'AppError';
  constructor(
    readonly key: MessageKey,
    readonly values?: Values,
  ) {
    super(key);
  }
}

export function fail(key: MessageKey, values?: Values): never {
  throw new AppError(key, values);
}

const VALUES: Partial<Record<ErrorCode, Values>> = {
  passwordTooShort: { min: MIN_MASTER_PASSWORD },
};

/** Any thrown value as a key and its values, for the envelope and for a page. */
export function describeError(error: unknown): { key: MessageKey; values?: Values; message: string } {
  if (error instanceof AppError) return { key: error.key, values: error.values, message: error.key };
  if (isPassholdError(error)) {
    return { key: `error.${error.code}` as MessageKey, values: VALUES[error.code], message: error.code };
  }
  if (typeof error === 'object' && error !== null && 'key' in error && typeof (error as { key: unknown }).key === 'string') {
    const { key, values, message } = error as { key: MessageKey; values?: Values; message?: string };
    return { key, values, message: message ?? key };
  }
  const detail = error instanceof Error ? error.message : String(error);
  return { key: 'error.unknown', values: { detail }, message: detail };
}
