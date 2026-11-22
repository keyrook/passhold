/**
 * What an item held in secret before an edit replaced it — a login's
 * password, an API key's key, a hidden field's value — kept newest first,
 * so a value replaced by mistake can be had back.
 */
import { HISTORY_LIMIT, LIMITS, type CustomField, type PasswordChange } from './model.js';

const text = (value: unknown, limit: number): string => (typeof value === 'string' ? value.slice(0, limit) : '');

const time = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null);

/** A history as stored: each entry checked, none empty, at most `HISTORY_LIMIT`. `limit`: the longest value the item's own secret takes. */
export function cleanHistory(value: unknown, limit: number = LIMITS.password): PasswordChange[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is PasswordChange => typeof entry === 'object' && entry !== null)
    .map((entry): PasswordChange => {
      const field = text(entry.field, LIMITS.fieldName);
      // A hidden field's value is a field's, whatever the item's own secret takes.
      return { password: text(entry.password, field ? LIMITS.fieldValue : limit), changedAt: time(entry.changedAt) ?? 0, ...(field ? { field } : {}) };
    })
    .filter((entry) => entry.password)
    .slice(0, HISTORY_LIMIT);
}

/**
 * What a hidden field held before an edit that changed or removed it, newest
 * first: a field is known by its name, as its owner knows it.
 */
export function replacedHidden(before: readonly CustomField[], after: readonly CustomField[] | undefined, now: number): PasswordChange[] {
  if (!after) return [];
  return before
    .filter((field) => field.hidden && field.value && !after.some((next) => next.name === field.name && next.value === field.value))
    .map((field) => ({ password: field.value, changedAt: now, field: field.name }));
}

/** A history after an edit: what was replaced goes first, the oldest fall off the end. */
export function afterReplacing(history: readonly PasswordChange[], replaced: readonly PasswordChange[]): PasswordChange[] {
  return replaced.length ? [...replaced, ...history].slice(0, HISTORY_LIMIT) : [...history];
}
