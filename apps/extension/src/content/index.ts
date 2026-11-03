/**
 * The content script, in every http and https frame.
 *
 * It holds no logins and can ask for none (lib/messaging.ts, ContentRequest).
 * It draws the button in sign-in, card and address fields, asks the service
 * worker for a list token when the button is pressed — or when the field is
 * clicked and there is something to offer — fills what it is handed for its
 * own origin, and reports a sign-in it saw sent so Passhold can offer to save it.
 */
import type { ContentHello, ContentRequest, ContentResponseFor, FieldKind, ToContent } from '../lib/messaging.js';
import { fieldKind, isPasswordField, loginFieldsIn, passwordsIn, scopeOf } from './fields.js';
import { fill } from './fill.js';
import { FieldButton, Frame } from './overlay.js';
import { fillAddress, fillCard, hasCardFields, sentIn, walletFieldKind } from './wallet.js';

/** Each frame is 6 × 8 px larger than the card it holds: room for the card's hard shadow. */
const MENU_WIDTH = 326;
const PROMPT_SIZE = { width: 366, height: 124 };

/**
 * What Passhold offers a field: a sign-in's, a new password's, a card's or
 * an address's; null for none. A field that looks like a username with no
 * password beside it — a sign-in's first step, by fields.ts — is a card's or
 * an address's first when the form says so: a checkout's email or card number
 * is not a sign-in.
 */
function kindOf(field: HTMLInputElement): FieldKind | null {
  const login = fieldKind(field);
  if (login === 'new' || (login === 'login' && passwordsIn(scopeOf(field)).length > 0)) return login;
  return walletFieldKind(field) ?? login;
}

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

/**
 * `auto`: opened by a click in the field, so typing in it puts the list away.
 * `field` is null for a list this frame, the top one, draws for a field in a
 * frame too small to hold it; `token` names that list.
 */
let menu: { frame: Frame; field: HTMLInputElement | null; auto: boolean; token: string } | null = null;
/** The field the last list was opened from: a fill from the list goes there. */
let anchor: HTMLInputElement | null = null;
/** Only the latest request may put a list up: a press of the button overtakes a click's. */
let asking = 0;
/** A list the top frame drew for a field here, too small a frame to hold it. */
let drawnInTop: { field: HTMLInputElement; auto: boolean } | null = null;

/** Below this, a frame cannot hold the list: a payment provider's frame around one card field, say. */
const SMALL = { width: MENU_WIDTH + 16, height: 200 };

function closeMenu(): void {
  menu?.frame.remove();
  menu = null;
  if (drawnInTop) {
    drawnInTop = null;
    void ask({ type: 'content/closeMenu' });
  }
}

// --- a list for a frame too small to hold it ----------------------------------------------

/**
 * Such a frame posts a random word to the top window, then asks for its list
 * with the word: the top frame draws the list beside the frame whose window
 * the word came from. Chrome gives a content script no other way to tell which
 * of a page's frames is which.
 */
const FRAME_WORD = 'passhold-frame';
const said = new Map<string, { from: MessageEventSource; at: number }>();
const waiting = new Map<string, () => void>();

if (window === window.top) {
  addEventListener('message', (event) => {
    const data = event.data as { source?: unknown; word?: unknown } | null;
    if (data?.source !== FRAME_WORD || typeof data.word !== 'string' || !/^[0-9a-f]{32}$/.test(data.word) || !event.source) return;
    // The first window to post a word is its frame's: the page sees it only once posted, and posting it again is too late.
    if (said.has(data.word)) return;
    const now = Date.now();
    for (const [word, entry] of said) if (now - entry.at > 10_000) said.delete(word);
    said.set(data.word, { from: event.source, at: now });
    waiting.get(data.word)?.();
  });
}

/** The frame that posted `word`, waiting a moment for a post still on its way. */
async function frameThatSaid(word: string): Promise<HTMLIFrameElement | null> {
  if (!said.has(word)) {
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 500);
      waiting.set(word, () => {
        clearTimeout(timer);
        resolve();
      });
    });
    waiting.delete(word);
  }
  const from = said.get(word)?.from;
  return from ? ([...document.querySelectorAll('iframe')].find((frame) => frame.contentWindow === from) ?? null) : null;
}

function newWord(): string {
  return [...crypto.getRandomValues(new Uint8Array(16))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function openMenu(field: HTMLInputElement, auto = false): Promise<void> {
  if (menu?.field === field) {
    if (!auto) closeMenu();
    return;
  }
  // The top frame puts its list away on a click of its own without saying so
  // here: a press draws it again rather than guess whether it is still up.
  if (drawnInTop?.field === field && auto) return;
  closeMenu();
  const mine = ++asking;
  const kind: FieldKind = kindOf(field) ?? 'login';
  const small = window !== window.top && (innerWidth < SMALL.width || innerHeight < SMALL.height);
  const rect = field.getBoundingClientRect();
  const word = small ? newWord() : '';
  if (small) window.top?.postMessage({ source: FRAME_WORD, word }, '*');
  const opened = await ask({ type: 'content/openMenu', field: kind, auto, ...(small ? { inTop: { left: rect.left, top: rect.top, bottom: rect.bottom, word } } : {}) });
  if (!opened || mine !== asking) return;
  anchor = field;
  if (opened.inTop) {
    drawnInTop = { field, auto };
    return;
  }
  // Moved on, or already typing, while the answer came: the list would be in the way.
  if (auto && (!field.matches(':focus') || field.value)) return;
  const frame = new Frame('menu.html', opened.token, { width: MENU_WIDTH, height: opened.height + 8 });
  frame.besideField(field);
  menu = { frame, field, auto, token: opened.token };
}

/** Top frame only: a list for a field in one of this page's frames, too small to hold it, drawn beside that frame. */
async function hostMenu(message: Extract<ToContent, { type: 'ph/hostMenu' }>): Promise<boolean> {
  if (window !== window.top) return false;
  const frame = await frameThatSaid(message.word);
  if (!frame) return false;
  closeMenu();
  const list = new Frame('menu.html', message.token, { width: MENU_WIDTH, height: message.height + 8 });
  list.besideFieldIn(frame, message.rect);
  menu = { frame: list, field: null, auto: message.auto, token: message.token };
  return true;
}

const button = new FieldButton((field) => void openMenu(field));

/**
 * The list shows itself only for a person: a real click in the field, or Tab
 * into it. A page can focus a field from its own script, and does on load;
 * neither counts, because script cannot make a trusted event. This decides
 * only whether the list appears — filling from it still takes a click in
 * Passhold's own frame.
 */
let tabbedAt = 0;

function suggest(field: HTMLInputElement): void {
  void prefs().then((current) => {
    if (!current?.ready || !current.autoSuggest) return;
    if (field.matches(':focus') && !field.value && kindOf(field)) void openMenu(field, true);
  });
}

document.addEventListener(
  'focusin',
  (event) => {
    const target = event.composedPath()[0];
    if (!(target instanceof HTMLInputElement)) return;
    if (menu && menu.field !== target) closeMenu();
    const tabbed = Date.now() - tabbedAt < 500;
    void prefs().then((current) => {
      if (!current?.ready) return;
      // Still the field in focus once the answer is back.
      if (!target.matches(':focus')) return;
      const kind = kindOf(target);
      if (!kind) return;
      if (kind === 'card') announceCardFields();
      if (current.inlineButton) button.show(target);
      if (tabbed) suggest(target);
    });
  },
  true,
);

document.addEventListener(
  'click',
  (event) => {
    const target = event.composedPath()[0];
    if (event.isTrusted && target instanceof HTMLInputElement) suggest(target);
  },
  true,
);

// Typing means the person is writing it themselves: a list that opened on its
// own steps aside. One opened with the button stays until they choose.
document.addEventListener(
  'input',
  (event) => {
    const field = event.composedPath()[0];
    if ((menu?.auto && field === menu.field) || (drawnInTop?.auto && field === drawnInTop.field)) closeMenu();
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
    if (!menu && !drawnInTop) return;
    const path = event.composedPath();
    if (path.some((node) => menu?.frame.contains(node) || button.contains(node))) return;
    closeMenu();
  },
  true,
);

document.addEventListener(
  'keydown',
  (event) => {
    if (event.key === 'Tab' && event.isTrusted) tabbedAt = Date.now();
    if (event.key === 'Escape' && (menu || drawnInTop)) closeMenu();
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
/** Words on a control that sends a checkout. */
const PAYS = /\bpay\b|\border\b|check\s?out|\bbuy\b|purchase|thanh toán|đặt hàng|đặt mua|mua ngay|bezahlen|payer|pagar|paga/i;
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

let lastOfferedCheckout = '';

/**
 * A checkout being sent: its card and address, reported so Passhold can offer
 * to keep them. Sent at once, not after asking whether to: a checkout leaves
 * the page as soon as it is sent, and a question in between would be lost
 * with it. The service worker says no for a vault where offering is off.
 */
function captureCheckout(scope: ParentNode): void {
  if (hello && (!hello.value.ready || !hello.value.offerToSaveCards)) return;
  const { card, address } = sentIn(scope);
  if (!card && !address) return;
  const key = [card?.number, card?.expMonth, card?.expYear, address?.street].join('\u0000');
  if (key === lastOfferedCheckout) return;
  lastOfferedCheckout = key;
  void ask({ type: 'content/offerWallet', card, address });
}

document.addEventListener(
  'submit',
  (event) => {
    if (!(event.target instanceof HTMLFormElement)) return;
    capture(event.target);
    captureCheckout(event.target);
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
      if (sends) {
        capture(form);
        captureCheckout(form);
      }
      return;
    }
    // Outside a form, only a control that says it sends: a toggle that shows
    // the password, or a "forgot?" link styled as a button, is not a sign-in.
    const label = [control.textContent, control.getAttribute('aria-label'), control.getAttribute('value'), control.title].join(' ');
    if (SHOWS.test(label)) return;
    if (PAYS.test(label) || SENDS.test(label)) captureCheckout(document);
    if (!SENDS.test(label)) return;
    const password = [...document.querySelectorAll('input')].find((input) => isPasswordField(input) && input.value);
    if (password) capture(password);
  },
  true,
);

// --- a card's fields, each in a frame of its own ----------------------------------------

/**
 * Many checkouts put the card's number, its date and its code each in a frame
 * of the payment provider's. A frame holding any of them says so, once: a
 * card chosen in one goes to the others of the same origin (the service
 * worker's fillWallet). Asked twice, as such a frame may draw its field a
 * moment after it loads.
 */
let announced = false;

function announceCardFields(): void {
  if (announced || window === window.top) return;
  void prefs().then((current) => {
    if (announced || !current?.ready || !hasCardFields(document)) return;
    announced = true;
    void ask({ type: 'content/cardFields' });
  });
}

if (window !== window.top) {
  announceCardFields();
  setTimeout(announceCardFields, 2500);
}

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

chrome.runtime.onMessage.addListener((message: ToContent, sender, respond) => {
  // Only the extension itself can reach this listener; the check is for the
  // day that stops being true.
  if (sender.id !== chrome.runtime.id) return false;
  switch (message.type) {
    case 'ph/fill':
    case 'ph/fillCard':
    case 'ph/fillAddress': {
      const filled = message.type === 'ph/fill' ? fill(message, anchor) : message.type === 'ph/fillCard' ? fillCard(message, anchor) : fillAddress(message, anchor);
      if (filled) {
        // The service worker puts away a list drawn in the top frame for this one.
        drawnInTop = null;
        closeMenu();
        hello = null;
      }
      respond({ filled });
      return false;
    }
    case 'ph/closeMenu':
      // Named, it is a list this frame drew for another, and only that one goes.
      if (!message.token || message.token === menu?.token) {
        if (message.token) {
          menu?.frame.remove();
          menu = null;
        } else closeMenu();
      }
      return false;
    case 'ph/hostMenu':
      void hostMenu(message).then((hosted) => respond({ hosted }));
      return true;
    case 'ph/showPrompt':
      showPrompt(message.token);
      return false;
    case 'ph/closePrompt':
      prompt?.remove();
      prompt = null;
      return false;
    case 'ph/checkIn':
      // Not an answer with an address in it: a message of its own, which Chrome stamps with this frame's.
      if (window === window.top) void ask({ type: 'content/here', nonce: message.nonce });
      return false;
  }
  return false;
});
