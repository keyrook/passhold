/**
 * Finding sign-in fields in a page that was not written for us.
 *
 * Every rule here is about what a person can see: a field that is hidden,
 * zero-sized or transparent is never filled and never read. A page that wants
 * a password could otherwise put an invisible field next to the visible one
 * and collect whatever a password manager pours into the form.
 */
import type { FieldKind } from '../lib/messaging.js';

const TEXT_TYPES = new Set(['text', 'email', 'tel', 'url', '']);
/** Fields that look like a username but are a search box, a code or a captcha. */
const NOT_USERNAME = /search|query|captcha|otp|one.?time|verification|2fa|totp|coupon|promo|zip|postal|phone.?code/i;
const LOOKS_LIKE_USERNAME = /user|email|e-mail|login|account|identifier|mail/i;

export function isVisible(element: HTMLElement): boolean {
  if (!element.isConnected) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width < 4 || rect.height < 4) return false;
  if (typeof element.checkVisibility === 'function') {
    if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
  }
  const style = getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0.1;
}

function usable(input: HTMLInputElement): boolean {
  return !input.disabled && !input.readOnly && isVisible(input);
}

export function isPasswordField(element: unknown): element is HTMLInputElement {
  return element instanceof HTMLInputElement && element.type === 'password';
}

function describe(input: HTMLInputElement): string {
  return [input.name, input.id, input.autocomplete, input.placeholder, input.getAttribute('aria-label') ?? ''].join(' ');
}

export function isUsernameCandidate(element: unknown): element is HTMLInputElement {
  if (!(element instanceof HTMLInputElement)) return false;
  if (!TEXT_TYPES.has(element.type) || NOT_USERNAME.test(describe(element))) return false;
  return true;
}

function passwordsIn(scope: ParentNode): HTMLInputElement[] {
  return [...scope.querySelectorAll('input')].filter(isPasswordField).filter(usable);
}

/**
 * The part of the page a field's sign-in lives in: its form, or — for the many
 * pages that use no form — the nearest ancestor that also holds a password
 * field, a few levels up at most.
 */
export function scopeOf(field: HTMLInputElement): ParentNode {
  if (field.form) return field.form;
  let node: HTMLElement | null = field.parentElement;
  for (let depth = 0; node && depth < 8; depth++, node = node.parentElement) {
    if (passwordsIn(node).length) return node;
  }
  return field.ownerDocument;
}

export interface LoginFields {
  username: HTMLInputElement | null;
  passwords: HTMLInputElement[];
}

/** The username field is the last usable text field before the first password field. */
export function loginFieldsIn(scope: ParentNode): LoginFields {
  const passwords = passwordsIn(scope);
  const inputs = [...scope.querySelectorAll('input')];
  const firstPassword = passwords[0] ? inputs.indexOf(passwords[0]) : inputs.length;
  const before = inputs.slice(0, firstPassword).filter(isUsernameCandidate).filter(usable);
  const named = before.filter((input) => /username|email/.test(input.autocomplete));
  return { username: named.at(-1) ?? before.at(-1) ?? null, passwords };
}

/** What kind of sign-in field this is, or null when Passhold should leave it alone. */
export function fieldKind(field: HTMLInputElement): FieldKind | null {
  if (!usable(field)) return null;
  if (field.type === 'password') {
    if (field.autocomplete.includes('new-password')) return 'new';
    if (field.autocomplete.includes('current-password')) return 'login';
    const { passwords } = loginFieldsIn(scopeOf(field));
    // Two password fields are a sign-up (password, again); in three, the first
    // is the current one and the rest are new.
    if (passwords.length === 2) return 'new';
    if (passwords.length >= 3) return passwords.indexOf(field) === 0 ? 'login' : 'new';
    return 'login';
  }
  if (!isUsernameCandidate(field)) return null;
  const { username } = loginFieldsIn(scopeOf(field));
  if (username === field) return 'login';
  // A first step that asks only for the username, password on the next page.
  if (!passwordsIn(scopeOf(field)).length && (/username|email/.test(field.autocomplete) || LOOKS_LIKE_USERNAME.test(describe(field)))) {
    return 'login';
  }
  return null;
}

/** The password fields a new password goes into: all but a current-password one. */
export function newPasswordFields(scope: ParentNode): HTMLInputElement[] {
  const { passwords } = loginFieldsIn(scope);
  if (passwords.length >= 3) return passwords.slice(1);
  return passwords.filter((input) => !input.autocomplete.includes('current-password'));
}

/** The first visible sign-in on the page, for a fill started from the toolbar. */
export function firstLogin(doc: Document): { scope: ParentNode; fields: LoginFields } | null {
  const password = passwordsIn(doc)[0];
  if (password) {
    const scope = scopeOf(password);
    return { scope, fields: loginFieldsIn(scope) };
  }
  const username = [...doc.querySelectorAll('input')].find(
    (input) => isUsernameCandidate(input) && fieldKind(input) === 'login',
  );
  return username ? { scope: doc, fields: { username, passwords: [] } } : null;
}
