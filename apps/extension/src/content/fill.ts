import type { ToContent } from '../lib/messaging.js';
import { fieldKind, firstLogin, isPasswordField, loginFieldsIn, newPasswordFields, scopeOf } from './fields.js';

/**
 * Typing into a field so the page notices. The value goes through the
 * element's own setter — from this isolated world that is the browser's, not
 * a framework's wrapper — and then the events a person's typing would raise,
 * so React, Vue and plain listeners all see the change.
 */
function type(input: HTMLInputElement, value: string): void {
  input.focus({ preventScroll: true });
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  if (setter) setter.call(input, value);
  else input.value = value;
  input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, inputType: 'insertReplacementText', data: value }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Fill what the service worker handed this frame. `anchor` is the field the
 * inline list was opened from, if any.
 *
 * The service worker chose the login for this frame's origin; the origin is
 * checked again here, at the last moment, because the frame may have moved on
 * since it asked.
 */
export function fill(message: Extract<ToContent, { type: 'ph/fill' }>, anchor: HTMLInputElement | null): boolean {
  if (location.origin !== message.origin) return false;

  if (message.field === 'new') {
    const scope = anchor ? scopeOf(anchor) : document;
    const targets = newPasswordFields(scope);
    if (!targets.length && anchor && isPasswordField(anchor)) targets.push(anchor);
    for (const input of targets) type(input, message.password);
    return targets.length > 0;
  }

  const found = anchor && anchor.isConnected && fieldKind(anchor)
    ? { fields: loginFieldsIn(scopeOf(anchor)) }
    : firstLogin(document);
  if (!found) return false;
  let { username, passwords } = found.fields;
  if (anchor && !isPasswordField(anchor) && !username) username = anchor;

  let filled = false;
  if (username && message.username !== null) {
    type(username, message.username);
    filled = true;
  }
  const password = passwords[0];
  if (password) {
    type(password, message.password);
    filled = true;
  }
  return filled;
}
