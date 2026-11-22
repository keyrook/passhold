/**
 * 1Password's `.1pux` export: a ZIP archive whose `export.data` is JSON of
 * every account, vault and item. Its CSV holds logins alone; this holds the
 * rest — cards, identities, notes, and API Credentials, which come as API
 * keys. Its other kinds (documents, licences, servers, SSH keys…) Passhold
 * keeps nothing of but their notes, as with Bitwarden's.
 */
import { PassholdError } from '../errors.js';
import { normaliseUrl } from '../match.js';
import type { CustomField, VaultData } from '../vault/model.js';
import { countryCode } from '../vault/wallet.js';
import { apiKeyFrom } from './apikeys.js';
import { collector, json, MAX_IMPORT_BYTES, MAX_IMPORT_ROWS, record, str, type ImportResult } from './collect.js';
import { readZipEntry } from './zip.js';

/** 1Password's kinds of item, by their category's id. */
const LOGIN = '001';
const CARD = '002';
const NOTE = '003';
const IDENTITY = '004';
const PASSWORD = '005';
const API_CREDENTIAL = '112';

/** The bound on a `.1pux` archive itself, which carries its items' files: only `export.data` is read out of it. */
export const MAX_ONEPUX_BYTES = 500 * 1024 * 1024;

const DAY = 24 * 60 * 60 * 1000;

/** A field's value, whatever its kind: 1Password keeps each under a key naming the kind (`string`, `concealed`, `menu`…). */
type Value = Record<string, unknown>;

interface Field {
  id: string;
  title: string;
  value: Value;
}

/** A value as text, of the kinds that are text. */
function textOf(value: Value): string {
  for (const kind of ['string', 'concealed', 'email', 'url', 'phone', 'menu', 'creditCardNumber', 'creditCardType', 'gender']) {
    const found = value[kind];
    if (typeof found === 'string') return found;
  }
  return '';
}

/** A `date` value — seconds — as the day it falls on in UTC: 1Password writes a day as a moment around its noon there. */
function dayOf(value: Value): number | null {
  const seconds = value.date;
  return typeof seconds === 'number' && Number.isFinite(seconds) && seconds > 0 ? Math.floor((seconds * 1000) / DAY) * DAY : null;
}

/** A `monthYear` value, `202712`, as a card's month and year. */
function monthYear(value: Value): { expMonth: number | null; expYear: number | null } {
  const found = typeof value.monthYear === 'number' ? /^(\d{4})(\d{2})$/.exec(String(value.monthYear)) : null;
  return found ? { expMonth: Number(found[2]), expYear: Number(found[1]) } : { expMonth: null, expYear: null };
}

function fieldsOf(details: Record<string, unknown>): Field[] {
  const sections = Array.isArray(details.sections) ? details.sections : [];
  return sections.flatMap((section) => {
    const fields = record(section)?.fields;
    return (Array.isArray(fields) ? fields : []).flatMap((entry) => {
      const field = record(entry);
      const value = record(field?.value);
      return field && value ? [{ id: str(field.id), title: str(field.title), value }] : [];
    });
  });
}

/**
 * Fields an item's kind does not take, as fields of its own: concealed ones
 * hidden. A one-time code is counted, and kept nowhere: it is an
 * authenticator app's to keep.
 */
function ownFields(fields: readonly Field[], taken: ReadonlySet<string>, onTwoFactor: () => void): CustomField[] {
  const own: CustomField[] = [];
  for (const field of fields) {
    if (taken.has(field.id)) continue;
    if (typeof field.value.totp === 'string') {
      if (field.value.totp.trim()) onTwoFactor();
      continue;
    }
    const value = textOf(field.value);
    if (value) own.push({ name: field.title || field.id, value, hidden: 'concealed' in field.value });
  }
  return own;
}

export async function importOnePux(bytes: Uint8Array, vault: Pick<VaultData, 'items' | 'wallet'> = { items: [], wallet: [] }): Promise<ImportResult> {
  if (bytes.length > MAX_ONEPUX_BYTES) throw new PassholdError('importTooLarge');
  const data = await readZipEntry(bytes, 'export.data', MAX_IMPORT_BYTES);
  if (!data) throw new PassholdError('importUnknownFormat');
  const file = record(json(new TextDecoder().decode(data)));
  if (!file || !Array.isArray(file.accounts)) throw new PassholdError('importUnknownFormat');

  const entries: { item: Record<string, unknown>; vault: string }[] = [];
  for (const account of file.accounts) {
    for (const each of Array.isArray(record(account)?.vaults) ? (record(account)!.vaults as unknown[]) : []) {
      const shelf = record(each);
      const name = str(record(shelf?.attrs)?.name);
      for (const item of Array.isArray(shelf?.items) ? shelf.items : []) {
        const read = record(item);
        if (read) entries.push({ item: read, vault: name });
      }
    }
  }
  if (!entries.length) throw new PassholdError('importEmpty');
  if (entries.length > MAX_IMPORT_ROWS) throw new PassholdError('importTooLarge');

  const into = collector(vault);
  for (const { item } of entries) {
    // In 1Password's archive or trash: its owner put it away there.
    if (item.state !== undefined && item.state !== 'active') {
      into.skip();
      continue;
    }
    const overview = record(item.overview) ?? {};
    const details = record(item.details) ?? {};
    const title = str(overview.title);
    const notes = str(details.notesPlain);
    const favorite = typeof item.favIndex === 'number' && item.favIndex > 0;
    // Its first tag is where it is filed, as its CSV export has it.
    const tags = Array.isArray(overview.tags) ? overview.tags.map(str).filter(Boolean) : [];
    const folder = tags[0]?.split('/')[0]?.trim() ?? '';
    const fields = fieldsOf(details);
    const byId = (id: string) => fields.find((field) => field.id === id);
    const get = (id: string) => {
      const field = byId(id);
      return field ? textOf(field.value) : '';
    };
    const own = (...taken: string[]) => ownFields(fields, new Set(taken), () => into.twoFactor());

    switch (str(item.categoryUuid)) {
      case LOGIN:
      case PASSWORD: {
        const login = Array.isArray(details.loginFields) ? details.loginFields.map(record) : [];
        const designated = (name: string) => str(login.find((field) => field?.designation === name)?.value);
        const password = designated('password') || str(details.password);
        const username = designated('username');
        const listed = Array.isArray(overview.urls) ? overview.urls.map((entry) => str(record(entry)?.url)) : [];
        const urls = [...new Set([str(overview.url), ...listed].map(normaliseUrl).filter((url): url is string => url !== null))];
        const mine = own();
        if (!username && !password) into.keep(mine.length ? { kind: 'note', title, text: notes, fields: mine } : null, title, notes, folder);
        else into.login({ title, username, password, urls, notes, favorite, folder, fields: mine });
        break;
      }
      case NOTE:
        into.keep({ kind: 'note', title, text: notes, favorite, folder, fields: own() }, title, notes, folder);
        break;
      case CARD:
        into.keep(
          {
            kind: 'card',
            title,
            holder: get('cardholder'),
            number: get('ccnum'),
            code: get('cvv'),
            ...monthYear(byId('expiry')?.value ?? {}),
            notes,
            favorite,
            folder,
            fields: own('cardholder', 'ccnum', 'cvv', 'expiry', 'type'),
          },
          title,
          notes,
          folder,
        );
        break;
      case IDENTITY: {
        const address = record(byId('address')?.value.address) ?? {};
        into.keep(
          {
            kind: 'address',
            title,
            name: [get('firstname'), get('initial'), get('lastname')].filter(Boolean).join(' '),
            organization: get('company'),
            street: str(address.street),
            city: str(address.city),
            region: str(address.state),
            postalCode: str(address.zip),
            country: countryCode(address.country),
            phone: get('defphone'),
            email: get('email'),
            notes,
            favorite,
            folder,
            fields: own('firstname', 'initial', 'lastname', 'company', 'address', 'defphone', 'email'),
          },
          title,
          notes,
          folder,
        );
        break;
      }
      case API_CREDENTIAL: {
        // Its type says how the key is sent where it says bearer; anything else it says, and its file's name, go in its notes.
        const type = get('type').trim();
        const filename = get('filename').trim();
        const lines = [filename, type && !/bearer/i.test(type) ? type : '', notes].filter(Boolean);
        into.keep(
          apiKeyFrom({
            title,
            key: get('credential'),
            keyId: get('username'),
            hosts: get('hostname').split(/[\s,]+/).filter(Boolean),
            ...(/bearer/i.test(type) ? { sendAs: 'bearer' } : {}),
            issuedAt: dayOf(byId('validFrom')?.value ?? {}),
            expiresAt: dayOf(byId('expires')?.value ?? {}),
            notes: lines.join('\n'),
            favorite,
            folder,
            fields: own('credential', 'username', 'hostname', 'type', 'filename', 'validFrom', 'expires'),
          }),
          title,
          notes,
          folder,
        );
        break;
      }
      default:
        // Its notes, if it has any, as a note; nothing of what Passhold has no kind for.
        into.keep(null, title, notes, folder);
    }
  }
  return into.done('onepassword');
}
