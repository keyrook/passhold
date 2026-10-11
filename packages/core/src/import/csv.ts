/**
 * Moving in and out: the CSV files browsers and password managers export.
 *
 * Formats are told apart by their header row, not by the file's name, and
 * columns are found by name, so a manager that reorders its columns or adds
 * one still imports. A file is untrusted input — it is bounded in size, rows
 * and field length before anything is built from it, and what comes out goes
 * through the same cleaning as a login typed by hand.
 */
import { PassholdError } from '../errors.js';
import { normaliseUrl } from '../match.js';
import { cleanDraft } from '../vault/items.js';
import type { LoginDraft, LoginItem } from '../vault/model.js';

export const MAX_IMPORT_BYTES = 20 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 50_000;

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
} as const;

/** The exporters we have seen, recognised by columns only they write. */
const FORMATS: { name: ImportFormat; needs: string[] }[] = [
  { name: 'bitwarden', needs: ['login_uri', 'login_password'] },
  { name: 'firefox', needs: ['httprealm', 'formactionorigin'] },
  { name: 'lastpass', needs: ['grouping', 'extra'] },
  { name: 'keepass', needs: ['group', 'title', 'last modified'] },
  { name: 'dashlane', needs: ['username2', 'category'] },
  { name: 'proton', needs: ['vault', 'createtime'] },
  { name: 'nordpass', needs: ['additional_urls', 'cardholdername'] },
  { name: 'onepassword', needs: ['archived', 'tags', 'otpauth'] },
  { name: 'apple', needs: ['title', 'otpauth'] },
  { name: 'chrome', needs: ['name', 'url', 'username', 'password', 'note'] },
];

export type ImportFormat =
  | 'chrome'
  | 'firefox'
  | 'apple'
  | 'bitwarden'
  | 'onepassword'
  | 'lastpass'
  | 'keepass'
  | 'dashlane'
  | 'proton'
  | 'nordpass'
  | 'generic';

export interface ImportResult {
  format: ImportFormat;
  drafts: LoginDraft[];
  /** Rows that are not logins (cards, notes) or hold nothing to sign in with. */
  skipped: number;
  /** Rows the vault already holds: same site, username and password. */
  duplicates: number;
}

function column(header: string[], names: readonly string[]): number {
  for (const name of names) {
    const index = header.indexOf(name);
    if (index !== -1) return index;
  }
  return -1;
}

/**
 * Some exports put several addresses in one cell. Split only where every
 * piece reads as an address, so a URL with a comma in its query survives.
 */
function urlsIn(cell: string): string[] {
  const whole = normaliseUrl(cell);
  const pieces = cell.split(/[,\s]+/).filter(Boolean);
  if (pieces.length > 1) {
    const each = pieces.map(normaliseUrl);
    if (each.every(Boolean)) return each as string[];
  }
  return whole ? [whole] : [];
}

export function importCsv(input: string, existing: readonly LoginItem[] = []): ImportResult {
  if (input.length > MAX_IMPORT_BYTES) throw new PassholdError('importTooLarge');
  const rows = parseCsv(input);
  const [headerRow, ...body] = rows;
  if (!headerRow || !body.length) throw new PassholdError('importEmpty');
  const header = headerRow.map((name) => name.trim().toLowerCase());

  const at = Object.fromEntries(
    Object.entries(COLUMNS).map(([key, names]) => [key, column(header, names)]),
  ) as Record<keyof typeof COLUMNS, number>;
  if (at.password === -1 || (at.url === -1 && at.username === -1)) throw new PassholdError('importUnknownFormat');

  const format = FORMATS.find(({ needs }) => needs.every((name) => header.includes(name)))?.name ?? 'generic';
  const known = new Set(existing.filter((item) => item.deletedAt === null).map(fingerprint));
  const drafts: LoginDraft[] = [];
  let skipped = 0;
  let duplicates = 0;

  for (const row of body) {
    const cell = (index: number) => (index === -1 ? '' : (row[index] ?? ''));
    const type = cell(at.type).trim().toLowerCase();
    // Bitwarden and Proton list cards, notes and identities in the same file.
    if (type && type !== 'login') {
      skipped++;
      continue;
    }
    const url = cell(at.url);
    // LastPass writes its secure notes as logins to "http://sn".
    if (format === 'lastpass' && url.trim() === 'http://sn') {
      skipped++;
      continue;
    }
    const urls = [...urlsIn(url), ...urlsIn(cell(at.extraUrls))];
    const username = cell(at.username);
    const password = cell(at.password);
    if (!password && !username) {
      skipped++;
      continue;
    }
    let draft: LoginDraft;
    try {
      draft = cleanDraft({
        title: cell(at.title),
        username,
        password,
        urls,
        notes: cell(at.notes),
        favorite: ['1', 'true', 'yes'].includes(cell(at.favorite).trim().toLowerCase()),
      });
    } catch {
      skipped++;
      continue;
    }
    const print = fingerprint(draft);
    if (known.has(print)) {
      duplicates++;
      continue;
    }
    known.add(print);
    drafts.push(draft);
  }
  return { format, drafts, skipped, duplicates };
}

function fingerprint(login: Pick<LoginDraft, 'urls' | 'username' | 'password'>): string {
  const host = login.urls[0] ? new URL(login.urls[0]).host : '';
  return JSON.stringify([host, login.username, login.password]);
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
