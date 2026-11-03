/**
 * Moving in and out: the CSV files browsers and password managers export.
 *
 * Formats are told apart by their header row, not by the file's name, and
 * columns are found by name, so a manager that reorders its columns or adds
 * one still imports. A file is untrusted input — it is bounded in size, rows
 * and field length before anything is built from it, and what comes out goes
 * through the same cleaning as a login, a card or an address typed by hand.
 */
import { PassholdError } from '../errors.js';
import { normaliseUrl } from '../match.js';
import type { AddressDraft, CardDraft, CustomField, LoginItem, VaultData, WalletDraft } from '../vault/model.js';
import { countryCode } from '../vault/wallet.js';
import { collector, json, MAX_IMPORT_BYTES, MAX_IMPORT_ROWS, record, str, whole, type ImportFormat, type ImportResult } from './collect.js';

export { MAX_IMPORT_BYTES, MAX_IMPORT_ROWS, type ImportFormat, type ImportResult };

/** RFC 4180, plus what real exports do: a BOM, bare LF line ends, a missing final newline. */
export function parseCsv(input: string): string[][] {
  const textIn = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let i = 0;

  const endField = () => {
    row.push(field);
    field = '';
  };
  const endRow = () => {
    endField();
    if (row.length > 1 || row[0] !== '') rows.push(row);
    row = [];
    if (rows.length > MAX_IMPORT_ROWS) throw new PassholdError('importTooLarge');
  };

  while (i < textIn.length) {
    const char = textIn[i]!;
    if (quoted) {
      if (char === '"') {
        if (textIn[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
      } else field += char;
      i++;
      continue;
    }
    if (char === '"' && field === '') quoted = true;
    else if (char === ',') endField();
    else if (char === '\n') endRow();
    else if (char === '\r') {
      if (textIn[i + 1] === '\n') i++;
      endRow();
    } else field += char;
    i++;
  }
  if (field !== '' || row.length) endRow();
  return rows;
}

/** Where each export keeps what we need. Names are compared lower-cased and trimmed. */
const COLUMNS = {
  title: ['name', 'title', 'account', 'item name'],
  url: ['url', 'login_uri', 'login_url', 'website', 'web site', 'uri', 'urls'],
  extraUrls: ['additional_urls'],
  username: ['username', 'login_username', 'user name', 'login', 'email', 'user', 'username1'],
  password: ['password', 'login_password'],
  notes: ['note', 'notes', 'extra', 'comments'],
  type: ['type'],
  favorite: ['favorite', 'fav', 'favourite'],
  /** A login's two-factor secret: 1Password's and Apple's otpauth, Bitwarden, LastPass, KeePass, Proton, Dashlane. */
  twoFactor: ['otpauth', 'login_totp', 'totp', 'otpsecret', 'otpurl'],
  /** Where an entry is filed: Bitwarden's and NordPass's folder, LastPass's grouping, KeePass's group, Dashlane's category, Proton's vault, 1Password's tags. */
  folder: ['folder', 'grouping', 'group', 'category', 'vault', 'tags'],
} as const;

/** The exporters we have seen, recognised by columns only they write. */
const FORMATS: { name: ImportFormat; needs: string[] }[] = [
  { name: 'bitwarden', needs: ['login_uri', 'login_password'] },
  { name: 'firefox', needs: ['httprealm', 'formactionorigin'] },
  { name: 'lastpass', needs: ['grouping', 'extra'] },
  { name: 'keepass', needs: ['group', 'title', 'last modified'] },
  { name: 'dashlane', needs: ['username2', 'category'] },
  // Dashlane writes each kind to a file of its own: its payments and its personal info.
  { name: 'dashlane', needs: ['cc_number', 'expiration_month'] },
  { name: 'dashlane', needs: ['item_name', 'address_recipient'] },
  { name: 'proton', needs: ['vault', 'createtime'] },
  { name: 'nordpass', needs: ['additional_urls', 'cardholdername'] },
  { name: 'onepassword', needs: ['archived', 'tags', 'otpauth'] },
  { name: 'apple', needs: ['title', 'otpauth'] },
  { name: 'chrome', needs: ['name', 'url', 'username', 'password', 'note'] },
  // Dashlane's secure notes, last: every other file with these two has more, and is told apart above.
  { name: 'dashlane', needs: ['title', 'note'] },
];

function column(header: string[], names: readonly string[]): number {
  for (const name of names) {
    const index = header.indexOf(name);
    if (index !== -1) return index;
  }
  return -1;
}

/**
 * Some exports put several addresses in one cell — NordPass as a JSON list.
 * Split only where every piece reads as an address, so a URL with a comma in
 * its query survives.
 */
function urlsIn(cell: string): string[] {
  if (cell.trim().startsWith('[')) {
    const listed = json(cell);
    if (Array.isArray(listed)) return listed.map((each) => normaliseUrl(str(each))).filter((url): url is string => url !== null);
  }
  const whole = normaliseUrl(cell);
  const pieces = cell.split(/[,\s]+/).filter(Boolean);
  if (pieces.length > 1) {
    const each = pieces.map(normaliseUrl);
    if (each.every(Boolean)) return each as string[];
  }
  return whole ? [whole] : [];
}

type Kind = 'login' | 'card' | 'address' | 'note';

/** What a row is, in its exporter's word for it; null for what Passhold keeps nothing of. */
function kindOf(type: string): Kind | null {
  switch (type) {
    case '':
    case 'login':
    // NordPass's word for a login.
    case 'password':
      return 'login';
    case 'note':
      return 'note';
    // NordPass's and Dashlane's; Proton's creditCard, lower-cased.
    case 'credit_card':
    case 'creditcard':
      return 'card';
    // NordPass's and Proton's identity; Dashlane keeps an address as a row of its own.
    case 'identity':
    case 'address':
      return 'address';
    default:
      return null;
  }
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

/** A card's expiry as exporters write it: 01/22 and 01 / 2022, Proton's 2022-01, LastPass's June,2022. The vault checks the month and the year. */
function expiryOf(text: string): { expMonth: number | null; expYear: number | null } {
  const value = text.trim().toLowerCase();
  const named = MONTHS.findIndex((month) => value.startsWith(month));
  const parts = value.match(/\d+/g) ?? [];
  if (named !== -1) return { expMonth: named + 1, expYear: whole(parts[0] ?? '') };
  if (parts.length !== 2) return { expMonth: null, expYear: null };
  const [month, year] = parts[0]!.length === 4 ? [parts[1]!, parts[0]!] : [parts[0]!, parts[1]!];
  return { expMonth: whole(month), expYear: whole(year) };
}

type Field = (name: string) => string;

/**
 * Each row's folder, as the file files it. KeePass writes a group's whole
 * path, its database's root first — the root is no folder of the owner's
 * making, so a first part every row shares goes. Proton files everything in a
 * vault: with one vault in the file, it says nothing about where anything is.
 * 1Password tags an item many ways; its first tag is its folder.
 */
function foldersOf(cells: string[], format: ImportFormat): string[] {
  const folders = cells.map((cell) => (format === 'onepassword' ? (cell.split(/[,;]/)[0] ?? '') : cell).trim());
  if (format === 'keepass') {
    const roots = new Set(folders.map((folder) => folder.split('/')[0]));
    if (roots.size === 1) return folders.map((folder) => folder.split('/').slice(1).join('/'));
  }
  if (format === 'proton' && new Set(folders.filter(Boolean)).size < 2) return folders.map(() => '');
  return folders;
}

/** Bitwarden writes an item's custom fields into one cell, a line each: "name: value". Which were hidden it does not say. */
function bitwardenFields(cell: string): CustomField[] {
  return cell
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => {
      const colon = line.indexOf(': ');
      return colon === -1 ? { name: line.trim(), value: '', hidden: false } : { name: line.slice(0, colon).trim(), value: line.slice(colon + 2), hidden: false };
    });
}

/** A card from its own columns — NordPass's, Dashlane's — or from the JSON Proton writes into the note. */
function cardOf(field: Field, format: ImportFormat, title: string, notes: string): CardDraft | null {
  if (format === 'proton') {
    const card = record(json(notes));
    if (!card) return null;
    const { cardholderName, number, verificationNumber, expirationDate, note } = card;
    return { kind: 'card', title, holder: str(cardholderName), number: str(number), code: str(verificationNumber), ...expiryOf(str(expirationDate)), notes: str(note) };
  }
  if (format === 'dashlane') {
    // Dashlane names a card after its holder unless told otherwise: a name the same as the holder's is no name of its own.
    const name = field('account_name');
    const holder = field('account_holder') || name;
    return {
      kind: 'card',
      title: name === holder ? '' : name,
      holder,
      number: field('cc_number'),
      code: field('code'),
      expMonth: whole(field('expiration_month')),
      expYear: whole(field('expiration_year')),
      notes: field('note'),
    };
  }
  return { kind: 'card', title, holder: field('cardholdername'), number: field('cardnumber'), code: field('cvc'), ...expiryOf(field('expirydate')), notes };
}

/** An address from NordPass's identity, Dashlane's personal info, or the JSON Proton writes into the note. */
function addressOf(field: Field, format: ImportFormat, title: string, notes: string): AddressDraft | null {
  if (format === 'proton') {
    const who = record(json(notes));
    if (!who) return null;
    const named = [who.firstName, who.middleName, who.lastName].map(str).filter(Boolean).join(' ');
    return {
      kind: 'address',
      title,
      name: str(who.fullName) || named,
      organization: str(who.organization) || str(who.company),
      street: str(who.streetAddress),
      city: str(who.city),
      region: str(who.stateOrProvince),
      postalCode: str(who.zipOrPostalCode),
      country: countryCode(who.countryOrRegion),
      phone: str(who.phoneNumber),
      email: str(who.email),
      notes: str(who.note),
    };
  }
  if (format === 'dashlane') {
    // Its "title" is the person's (Mr, Ms); the address's own name is item_name.
    return {
      kind: 'address',
      title: field('item_name'),
      name: field('address_recipient'),
      organization: '',
      street: field('address'),
      city: field('city'),
      region: field('state'),
      postalCode: field('zip'),
      country: countryCode(field('country')),
      phone: '',
      email: '',
      notes: '',
    };
  }
  return {
    kind: 'address',
    title,
    name: field('full_name'),
    organization: '',
    street: [field('address1'), field('address2')].filter(Boolean).join('\n'),
    city: field('city'),
    region: field('state'),
    postalCode: field('zipcode'),
    country: countryCode(field('country')),
    phone: field('phone_number'),
    email: field('email'),
    notes,
  };
}

/**
 * A LastPass secure note: its first line names its kind ("NoteType:Credit
 * Card"), each line after is "Key:value", and "Notes:" runs to the end. A card
 * or an address is read as one; any other kind, or a plain note, is kept as
 * the note it is, its labelled lines and all.
 */
function lastPassNote(title: string, extra: string): WalletDraft {
  const lines = extra.split(/\r?\n/);
  const type = /^NoteType:(.*)$/.exec(lines[0] ?? '')?.[1]?.trim();
  if (type !== 'Credit Card' && type !== 'Address') return { kind: 'note', title, text: extra };
  const fields = new Map<string, string>();
  let notes: string[] | null = null;
  for (const line of lines.slice(1)) {
    if (notes) {
      notes.push(line);
      continue;
    }
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon);
    if (key === 'Notes') notes = [line.slice(colon + 1)];
    else fields.set(key, line.slice(colon + 1).trim());
  }
  const get = (key: string) => fields.get(key) ?? '';
  const words = notes?.join('\n') ?? '';
  if (type === 'Credit Card') {
    return { kind: 'card', title, holder: get('Name on Card'), number: get('Number'), code: get('Security Code'), ...expiryOf(get('Expiration Date')), notes: words };
  }
  // A phone is kept as JSON, its number in "num".
  const phone = get('Phone');
  return {
    kind: 'address',
    title,
    name: [get('First Name'), get('Middle Name'), get('Last Name')].filter(Boolean).join(' '),
    organization: get('Company'),
    street: [get('Address 1'), get('Address 2'), get('Address 3')].filter(Boolean).join('\n'),
    city: get('City / Town'),
    region: get('State'),
    postalCode: get('Zip / Postal Code'),
    country: countryCode(get('Country')),
    phone: phone.startsWith('{') ? str(record(json(phone))?.num) : phone,
    email: get('Email Address'),
    notes: words,
  };
}

export function importCsv(input: string, vault: Pick<VaultData, 'items' | 'wallet'> = { items: [], wallet: [] }): ImportResult {
  if (input.length > MAX_IMPORT_BYTES) throw new PassholdError('importTooLarge');
  const rows = parseCsv(input);
  const [headerRow, ...body] = rows;
  if (!headerRow || !body.length) throw new PassholdError('importEmpty');
  const header = headerRow.map((name) => name.trim().toLowerCase());

  const at = Object.fromEntries(
    Object.entries(COLUMNS).map(([key, names]) => [key, column(header, names)]),
  ) as Record<keyof typeof COLUMNS, number>;
  const logins = at.password !== -1 && (at.url !== -1 || at.username !== -1);
  const format = FORMATS.find(({ needs }) => needs.every((name) => header.includes(name)))?.name ?? 'generic';
  // Dashlane's cards, addresses and notes come in files of their own, with no logins in them.
  if (!logins && format !== 'dashlane') throw new PassholdError('importUnknownFormat');

  const into = collector(vault);
  const folders = foldersOf(
    body.map((row) => (at.folder === -1 ? '' : (row[at.folder] ?? ''))),
    format,
  );

  for (const [index, row] of body.entries()) {
    const cell = (index: number) => (index === -1 ? '' : (row[index] ?? ''));
    const field: Field = (name) => cell(header.indexOf(name));
    const folder = folders[index]!;
    if (cell(at.twoFactor).trim()) into.twoFactor();
    let kind = kindOf(cell(at.type).trim().toLowerCase());
    // In a file with no logins — Dashlane's secure notes — a row that does not say what it is is a note.
    if (kind === 'login' && !logins) kind = 'note';
    if (!kind) {
      into.skip();
      continue;
    }
    const title = cell(at.title);
    const notes = cell(at.notes);
    const url = cell(at.url);
    // LastPass writes its secure notes — cards and addresses among them — as logins to "http://sn".
    if (format === 'lastpass' && url.trim() === 'http://sn') {
      into.keep(lastPassNote(title, notes), title, notes, folder);
      continue;
    }
    if (kind === 'card') {
      into.keep(cardOf(field, format, title, notes), title, notes, folder);
      continue;
    }
    if (kind === 'address') {
      into.keep(addressOf(field, format, title, notes), title, notes, folder);
      continue;
    }
    const fields = format === 'bitwarden' ? bitwardenFields(field('fields')) : [];
    if (kind === 'note') {
      into.keep({ kind: 'note', title, text: notes, fields }, title, notes, folder);
      continue;
    }
    const urls = [...urlsIn(url), ...urlsIn(cell(at.extraUrls))];
    const username = cell(at.username);
    const password = cell(at.password);
    if (!password && !username) {
      // Nothing to sign in with, but words to keep — how KeePass and 1Password write a note: a note, its address its first line.
      into.keep(null, title, [url.trim(), notes].filter(Boolean).join('\n'), folder);
      continue;
    }
    into.login({
      title,
      username,
      password,
      urls,
      notes,
      favorite: ['1', 'true', 'yes'].includes(cell(at.favorite).trim().toLowerCase()),
      folder,
      fields,
    });
  }
  return into.done(format);
}

function cell(value: string): string {
  return /[",\r\n]/.test(value) || /^\s|\s$/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Every live login, in the columns Chrome writes — the one layout every
 * browser and password manager reads. In plain text: the page that offers it
 * says so, and asks for the master password first.
 */
export function exportCsv(items: readonly LoginItem[]): string {
  const lines = [['name', 'url', 'username', 'password', 'note'].join(',')];
  for (const item of items) {
    if (item.deletedAt !== null) continue;
    lines.push([item.title, item.urls[0] ?? '', item.username, item.password, item.notes].map(cell).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}
