/**
 * The content script, in every http and https frame.
 *
 * It holds no logins and can ask for none (lib/messaging.ts, ContentRequest).
 * It draws the button in sign-in fields, asks the service worker for a list
 * token when the button is pressed, fills what it is handed for its own
 * origin, and reports a sign-in it saw sent so Passhold can offer to save it.
 */
import type { ContentHello, ContentRequest, ContentResponseFor, FieldKind, ToContent } from '../lib/messaging.js';
import { fieldKind, isPasswordField, loginFieldsIn, scopeOf } from './fields.js';
import { fill } from './fill.js';
import { FieldButton, Frame } from './overlay.js';

/** Each frame is 6 × 8 px larger than the card it holds: room for the card's hard shadow. */
const MENU_WIDTH = 326;
const PROMPT_SIZE = { width: 366, height: 124 };

async function ask<R extends ContentRequest>(request: R): Promise<ContentResponseFor<R> | null> {
  try {
    const response = (await chrome.runtime.sendMessage(request)) as { ok: boolean; value: ContentResponseFor<R> } | undefined;
    return response?.ok ? response.value : null;
  } catch {
    // The extension was reloaded or updated under this page: this copy of the
    // script is orphaned and stays quiet until the page reloads.
    return null;
  }
}

// --- what the vault allows here, asked once and refreshed now and then ---------

let hello: { value: ContentHello; at: number } | null = null;

async function prefs(): Promise<ContentHello | null> {
  if (hello && Date.now() - hello.at < 10_000) return hello.value;
  const value = await ask({ type: 'content/hello' });
  hello = value ? { value, at: Date.now() } : null;
  return value;
}

// --- the button and the list ----------------------------------------------------------

let menu: { frame: Frame; field: HTMLInputElement } | null = null;
/** The field the last list was opened from: a fill from the list goes there. */
let anchor: HTMLInputElement | null = null;

function closeMenu(): void {
  menu?.frame.remove();
  menu = null;
}

async function openMenu(field: HTMLInputElement): Promise<void> {
  if (menu?.field === field) {
    closeMenu();
    return;
  }
  closeMenu();
  const kind: FieldKind = fieldKind(field) ?? 'login';
  const opened = await ask({ type: 'content/openMenu', field: kind });
  if (!opened) return;
  anchor = field;
  const frame = new Frame('menu.html', opened.token, { width: MENU_WIDTH, height: opened.height + 8 });
  frame.besideField(field);
  menu = { frame, field };
}

const button = new FieldButton((field) => void openMenu(field));

document.addEventListener(
  'focusin',
  (event) => {
    const target = event.composedPath()[0];
    if (!(target instanceof HTMLInputElement)) return;
    void prefs().then((current) => {
      if (!current?.ready || !current.inlineButton) return;
      // Still the field in focus once the answer is back.
      if (target.matches(':focus') && fieldKind(target)) button.show(target);
    });
  },
  true,
);

document.addEventListener(
  'focusout',
  (event) => {
    if (event.composedPath()[0] === button.field && !menu) {
      // After the click that may be on the button itself has landed.
      setTimeout(() => {
        if (document.activeElement !== button.field && !menu) button.hide();
      }, 150);
    }
  },
  true,
);

document.addEventListener(
  'mousedown',
  (event) => {
    if (!menu) return;
    const path = event.composedPath();
    if (path.some((node) => menu?.frame.contains(node) || button.contains(node))) return;
    closeMenu();
  },
  true,
);

document.addEventListener(
  'keydown',
  (event) => {
    if (event.key === 'Escape' && menu) closeMenu();
    // Alt+Down opens the list from the keyboard, as it opens a <select>.
    if (event.key === 'ArrowDown' && event.altKey && button.field && event.composedPath()[0] === button.field) {
      event.preventDefault();
      void openMenu(button.field);
    }
    if (event.key === 'Enter' && isPasswordField(event.composedPath()[0])) capture(event.composedPath()[0] as HTMLInputElement);
  },
  true,
);

// --- noticing a sign-in being sent --------------------------------------------------

let lastOffered = '';

/** Words on a control that sends a sign-in, in the languages Passhold speaks and a few more. */
const SENDS = /log\s?in|sign\s?(in|up|on)|register|continue|next|submit|create|save|đăng|tiếp|xác nhận|anmelden|connexion|iniciar|entrar|accedi/i;
const SHOWS = /show|hide|reveal|forgot|hiện|ẩn|quên/i;

function capture(from: HTMLInputElement | HTMLFormElement): void {
  const scope = from instanceof HTMLFormElement ? from : scopeOf(from);
  const { username, passwords } = loginFieldsIn(scope);
  // In a change-password form the last filled field holds the new password.
  const filled = passwords.filter((input) => input.value);
  const password = filled.at(-1)?.value ?? '';
  if (!password) return;
  const user = username?.value ?? '';
  const key = `${user}\u0000${password}`;
  if (key === lastOffered) return;
  lastOffered = key;
  void prefs().then((current) => {
    if (current?.ready && current.offerToSave) void ask({ type: 'content/offerSave', username: user, password });
  });
}

document.addEventListener(
  'submit',
  (event) => {
    if (event.target instanceof HTMLFormElement) capture(event.target);
  },
  true,
);

// Many sign-in pages never submit a form: a script reads the fields when the
// button is clicked. A click on something button-like next to a filled
// password field counts as sending it.
document.addEventListener(
  'click',
  (event) => {
    const target = event.composedPath()[0];
    if (!(target instanceof Element)) return;
    const control = target.closest('button, input[type="submit"], input[type="button"], [role="button"]');
    if (!(control instanceof HTMLElement)) return;
    const form = control.closest('form');
    if (form) {
      // In a form, only a button that sends it: not the eye that shows the
      // password, which would offer to save half a password.
      const sends =
        (control instanceof HTMLButtonElement && control.type === 'submit') ||
        (control instanceof HTMLInputElement && control.type === 'submit');
      if (sends) capture(form);
      return;
    }
    // Outside a form, only a control that says it sends: a toggle that shows
    // the password, or a "forgot?" link styled as a button, is not a sign-in.
    const label = [control.textContent, control.getAttribute('aria-label'), control.getAttribute('value'), control.title].join(' ');
    if (!SENDS.test(label) || SHOWS.test(label)) return;
    const password = [...document.querySelectorAll('input')].find((input) => isPasswordField(input) && input.value);
    if (password) capture(password);
  },
  true,
);

// --- the save prompt, top frame only -------------------------------------------------

let prompt: Frame | null = null;

function showPrompt(token: string): void {
  if (window !== window.top) return;
  prompt?.remove();
  prompt = new Frame('prompt.html', token, PROMPT_SIZE);
  prompt.inCorner();
}

if (window === window.top) {
  void prefs().then(async (current) => {
    if (!current?.ready) return;
    const waiting = await ask({ type: 'content/checkPrompt' });
    if (waiting) showPrompt(waiting.token);
  });
}

// --- what the service worker sends -------------------------------------------------------

chrome.runtime.onMessage.addListener((message: ToContent | { type: 'ph/where' }, sender, respond) => {
  // Only the extension itself can reach this listener; the check is for the
  // day that stops being true.
  if (sender.id !== chrome.runtime.id) return false;
  switch (message.type) {
    case 'ph/fill': {
      const filled = fill(message, anchor);
      if (filled) {
        closeMenu();
        hello = null;
      }
      respond({ filled });
      return false;
    }
    case 'ph/closeMenu':
      closeMenu();
      return false;
    case 'ph/showPrompt':
      showPrompt(message.token);
      return false;
    case 'ph/closePrompt':
      prompt?.remove();
      prompt = null;
      return false;
    case 'ph/where':
      respond({ url: location.href });
      return false;
  }
  return false;
});
