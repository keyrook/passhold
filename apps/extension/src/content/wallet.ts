/**
 * Payment cards and addresses on a page that was not written for us: which
 * fields are theirs, and filling what the service worker hands this frame.
 *
 * As with sign-ins, only what a person can see is filled (fields.ts), and the
 * frame's origin is checked again at the last moment. A card fills the card
 * fields of the form it was chosen in, never the address beside it; an
 * address, never a card's.
 */
import type { AddressFill, CardFill, SentAddress, ToContent } from '../lib/messaging.js';
import { isVisible, usable } from './fields.js';
import { choose, type } from './fill.js';
import { CARD_ROLES, PLACE_ROLES, roleOf, type CardRole, type Control, type Role } from './roles.js';

interface Found {
  control: Control;
  role: Role;
}

function controlsIn(scope: ParentNode): Found[] {
  const found: Found[] = [];
  for (const control of scope.querySelectorAll<Control>('input, select, textarea')) {
    if (!usable(control)) continue;
    const role = roleOf(control);
    if (role) found.push({ control, role });
  }
  return found;
}

/** A sign-in's password field: where one is, the form is not an address form. */
const hasPassword = (scope: ParentNode) =>
  [...scope.querySelectorAll('input')].some((input) => input.type === 'password' && isVisible(input) && roleOf(input) !== 'cc-csc');

/**
 * Three parts of an address, one of them where — a street, a city, a postal
 * code, a country — and no password: a sign-up with a name, an email and a
 * phone is not an address form, and gets no button for one.
 */
function looksLikeAddress(scope: ParentNode): boolean {
  if (hasPassword(scope)) return false;
  const roles = new Set(controlsIn(scope).map(({ role }) => role).filter((role) => !CARD_ROLES.has(role)));
  return roles.size >= 3 && [...roles].some((role) => PLACE_ROLES.has(role));
}

/** The address form a field is part of: its form, or the nearest part of the page that is one, a few levels up at most. */
function addressScopeOf(field: Control): ParentNode | null {
  if (field.form) return looksLikeAddress(field.form) ? field.form : null;
  let node = field.parentElement;
  for (let depth = 0; node && depth < 8; depth++, node = node.parentElement) {
    if (looksLikeAddress(node)) return node;
  }
  return null;
}

/** Whether this field is a payment card's or an address's, for the button and the list; null when it is neither. */
export function walletFieldKind(field: HTMLInputElement): 'card' | 'address' | null {
  if (!usable(field)) return null;
  const role = roleOf(field);
  if (!role) return null;
  if (CARD_ROLES.has(role)) return 'card';
  return addressScopeOf(field) ? 'address' : null;
}

/** Whether this document holds a card's fields, for checkouts that put each in a frame of its own. */
export function hasCardFields(doc: Document): boolean {
  return controlsIn(doc).some(({ role }) => CARD_ROLES.has(role));
}

// --- putting a value in ------------------------------------------------------------

const fold = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/gi, 'd').toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Type a value, or choose the option that is it: by its value or its words,
 * or failing both one whose words start with it ("Hà Nội" in "Hà Nội City").
 * A list with no such option is left as it is.
 */
function put(control: Control, value: string | readonly string[]): boolean {
  const candidates = (typeof value === 'string' ? [value] : value).filter(Boolean);
  if (!candidates.length) return false;
  if (control instanceof HTMLSelectElement) {
    const wanted = candidates.map(fold);
    const options = [...control.options].filter((option) => !option.disabled);
    const option =
      options.find((option) => wanted.includes(fold(option.value)) || wanted.includes(fold(option.text))) ??
      options.find((option) => wanted.some((word) => word.length >= 3 && fold(option.text).startsWith(word)));
    if (!option) return false;
    if (control.value !== option.value) choose(control, option.value);
    return true;
  }
  type(control, candidates[0]!);
  return true;
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Every way a list of months may name this one: 8, 08, August, Aug, Tháng 8. */
function monthNames(month: number): string[] {
  const date = new Date(2000, month - 1, 15);
  const names = [pad(month), String(month)];
  for (const locale of [document.documentElement.lang || navigator.language, 'en', 'vi']) {
    try {
      for (const style of ['long', 'short'] as const) names.push(new Intl.DateTimeFormat(locale, { month: style }).format(date));
    } catch {
      // A page's lang the browser does not know: the others still name it.
    }
  }
  return names;
}

/** The expiry date in the one field for both, in the form its placeholder shows: MM/YY unless it asks otherwise. */
function expiryText(control: Control, month: number, year: number): string {
  if (control instanceof HTMLInputElement && control.type === 'month') return `${year}-${pad(month)}`;
  const hint = `${control.getAttribute('placeholder') ?? ''} ${control.getAttribute('aria-label') ?? ''}`.toLowerCase();
  const maxLength = control instanceof HTMLSelectElement ? -1 : control.maxLength;
  if (maxLength === 4) return `${pad(month)}${pad(year % 100)}`;
  const long = /yyyy|aaaa|jjjj/.test(hint) || (!/yy|aa|jj/.test(hint) && maxLength === 7);
  const separator = /\s\/\s/.test(hint) ? ' / ' : /-/.test(hint) && !hint.includes('/') ? '-' : '/';
  return `${pad(month)}${separator}${long ? year : pad(year % 100)}`;
}

function cardValue(role: CardRole, control: Control, card: CardFill): string | string[] {
  switch (role) {
    case 'cc-name':
      return card.holder;
    case 'cc-number':
      return card.number;
    case 'cc-csc':
      return card.code;
    case 'cc-exp':
      return card.expMonth && card.expYear ? expiryText(control, card.expMonth, card.expYear) : '';
    case 'cc-exp-month':
      return card.expMonth ? monthNames(card.expMonth) : '';
    case 'cc-exp-year': {
      if (!card.expYear) return '';
      const short = pad(card.expYear % 100);
      if (control instanceof HTMLSelectElement) return [String(card.expYear), short];
      const hint = (control.getAttribute('placeholder') ?? '').toLowerCase();
      return control.maxLength === 2 || /^(yy|aa)$/.test(hint.trim()) ? short : String(card.expYear);
    }
  }
}

/**
 * Fill a card here. `anchor` is the field its list was opened from, if any:
 * its form is filled — a page with a second card form keeps that one as it
 * is — and with none, every card field in the frame, for a frame that holds
 * only some of them.
 */
export function fillCard(message: Extract<ToContent, { type: 'ph/fillCard' }>, anchor: HTMLInputElement | null): boolean {
  if (location.origin !== message.origin) return false;
  const scope = anchor?.isConnected && anchor.form && walletFieldKind(anchor) === 'card' ? anchor.form : document;
  let filled = false;
  for (const { control, role } of controlsIn(scope)) {
    if (!CARD_ROLES.has(role)) continue;
    if (put(control, cardValue(role as CardRole, control, message.card))) filled = true;
  }
  return filled;
}

function countryNames(code: string): string[] {
  const names = [code];
  for (const locale of [document.documentElement.lang || navigator.language, 'en', 'vi']) {
    try {
      const name = new Intl.DisplayNames([locale], { type: 'region' }).of(code);
      if (name) names.push(name);
    } catch {
      // As for months: the other languages still name it.
    }
  }
  return names;
}

function addressValue(role: Role, control: Control, address: AddressFill, roles: ReadonlySet<Role>): string | string[] {
  const lines = address.street ? address.street.split('\n') : [];
  switch (role) {
    case 'name':
      return address.name;
    case 'given-name':
      return address.givenName;
    case 'family-name':
      return address.familyName;
    case 'organization':
      return address.organization;
    case 'street-address':
      return control instanceof HTMLTextAreaElement ? lines.join('\n') : lines.join(', ');
    // A form with one line for the street gets all of it there; one with two, the rest in the second.
    case 'address-line1':
      return roles.has('address-line2') ? (lines[0] ?? '') : lines.join(', ');
    case 'address-line2':
      return roles.has('address-line3') ? (lines[1] ?? '') : lines.slice(1).join(', ');
    case 'address-line3':
      return lines.slice(2).join(', ');
    // A form with one of the two takes whichever is kept: "Tỉnh / Thành phố" is Hà Nội's, kept as its city or its province.
    case 'address-level1':
      return address.region || (roles.has('address-level2') ? '' : address.city);
    case 'address-level2':
      return address.city || (roles.has('address-level1') ? '' : address.region);
    case 'postal-code':
      return address.postalCode;
    case 'country':
    case 'country-name': {
      if (!address.country) return '';
      if (control instanceof HTMLSelectElement) return countryNames(address.country);
      // Typed, a country is its name in the page's language; a field that takes two characters, its code.
      if (control instanceof HTMLInputElement && control.maxLength === 2) return address.country;
      return countryNames(address.country)[1] ?? address.country;
    }
    case 'tel':
      return address.phone;
    case 'email':
      return address.email;
    default:
      return '';
  }
}

// --- what a checkout sends ------------------------------------------------------------

/** What a field holds as a person would read it: what was typed, or the words of the option chosen. */
function valueOf(control: Control): string {
  if (control instanceof HTMLSelectElement) return control.selectedOptions[0]?.text.trim() ?? '';
  return control.value.trim();
}

/** A month from a list — by its value, its number or its name — or from a field. */
function monthOf(control: Control): number | null {
  const texts = control instanceof HTMLSelectElement ? [control.value, control.selectedOptions[0]?.text ?? ''] : [control.value];
  for (const text of texts) {
    const number = Number.parseInt(text.trim(), 10);
    if (number >= 1 && number <= 12) return number;
  }
  const named = fold(texts.at(-1) ?? '');
  for (let month = 1; named && month <= 12; month++) if (monthNames(month).slice(2).some((name) => fold(name) === named)) return month;
  return null;
}

/** A year as a card prints it, two digits or four. */
function yearOf(text: string): number | null {
  const digits = text.replace(/\D/g, '');
  if (digits.length === 2) return 2000 + Number(digits);
  const year = Number(digits);
  return digits.length === 4 && year >= 2000 && year <= 2099 ? year : null;
}

/** Month and year from the one field for both: 08/29, 08 / 2029, 0829, or a month picker's 2029-08. */
function expiryOf(control: Control): { month: number | null; year: number | null } {
  const text = valueOf(control);
  const picked = /^(\d{4})-(\d{1,2})$/.exec(text);
  if (picked) return { month: Number(picked[2]), year: Number(picked[1]) };
  const parts = text.split(/\D+/).filter(Boolean);
  const [month, year] = parts.length === 2 ? parts : [text.replace(/\D/g, '').slice(0, 2), text.replace(/\D/g, '').slice(2)];
  const number = Number.parseInt(month ?? '', 10);
  return { month: number >= 1 && number <= 12 ? number : null, year: yearOf(year ?? '') };
}

/** A country as the form gave it: a list's code where its value is one, or the words shown. */
function countryOf(control: Control): string {
  if (control instanceof HTMLSelectElement && /^[A-Za-z]{2}$/.test(control.value.trim())) return control.value.trim();
  return valueOf(control);
}

/**
 * What a checkout holds as it is sent: its card, from its card fields, and its
 * address, from an address form's fields — only fields a person can see, so a
 * field the page hides beside the real one is never what is offered. Each is
 * the page's word: the service worker checks it as it would anything typed.
 */
export function sentIn(scope: ParentNode): { card: CardFill | null; address: SentAddress | null } {
  const found = controlsIn(scope);
  const card: CardFill = { holder: '', number: '', expMonth: null, expYear: null, code: '' };
  for (const { control, role } of found) {
    switch (role) {
      case 'cc-name':
        card.holder ||= valueOf(control);
        break;
      case 'cc-number':
        card.number ||= valueOf(control).replace(/\D/g, '');
        break;
      case 'cc-csc':
        card.code ||= valueOf(control).replace(/\D/g, '');
        break;
      case 'cc-exp': {
        const { month, year } = expiryOf(control);
        card.expMonth ??= month;
        card.expYear ??= year;
        break;
      }
      case 'cc-exp-month':
        card.expMonth ??= monthOf(control);
        break;
      case 'cc-exp-year':
        card.expYear ??= yearOf(valueOf(control));
        break;
    }
  }
  return { card: card.number.length >= 12 ? card : null, address: looksLikeAddress(scope) ? addressIn(found) : null };
}

function addressIn(found: Found[]): SentAddress | null {
  const first = (role: Role, read: (control: Control) => string = valueOf) =>
    found
      .filter((entry) => entry.role === role)
      .map((entry) => read(entry.control))
      .find(Boolean) ?? '';
  const street = first('street-address') || [first('address-line1'), first('address-line2'), first('address-line3')].filter(Boolean).join('\n');
  if (!street) return null;
  return {
    name: first('name') || [first('given-name'), first('family-name')].filter(Boolean).join(' '),
    organization: first('organization'),
    street,
    city: first('address-level2'),
    region: first('address-level1'),
    postalCode: first('postal-code'),
    country: first('country', countryOf) || first('country-name', countryOf),
    phone: first('tel'),
    email: first('email'),
  };
}

/** Fill an address into the address form the list was opened from, or the frame's one address form. */
export function fillAddress(message: Extract<ToContent, { type: 'ph/fillAddress' }>, anchor: HTMLInputElement | null): boolean {
  if (location.origin !== message.origin) return false;
  const scope = (anchor?.isConnected && addressScopeOf(anchor)) || document;
  const found = controlsIn(scope).filter(({ role }) => !CARD_ROLES.has(role));
  const roles = new Set(found.map(({ role }) => role));
  let filled = false;
  for (const { control, role } of found) {
    if (put(control, addressValue(role, control, message.address, roles))) filled = true;
  }
  return filled;
}
