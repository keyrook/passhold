/**
 * Bitwarden's export as JSON — the one of its exports that holds cards,
 * identities and websites' passkeys: its CSV has logins and notes alone. Only
 * the export that is not encrypted can be read; an encrypted one is refused by
 * name, so its owner knows which to make instead.
 */
import { PassholdError } from '../errors.js';
import { normaliseUrl } from '../match.js';
import { fromBase64, fromHex, toBase64, toBase64url } from '../util/bytes.js';
import { cleanPasskey } from '../vault/items.js';
import type { CustomField, StoredPasskey, VaultData } from '../vault/model.js';
import { countryCode } from '../vault/wallet.js';
import { signsAsPasskey } from '../webauthn/authenticator.js';
import { rpIdKeepable } from '../webauthn/request.js';
import { collector, json, MAX_IMPORT_BYTES, MAX_IMPORT_ROWS, record, str, whole, type ImportResult } from './collect.js';
import { importCsv } from './csv.js';

/** Bitwarden's kinds of item, by number. Its others — SSH keys, bank accounts, licences, passports — Passhold keeps nothing of. */
const LOGIN = 1;
const NOTE = 2;
const CARD = 3;
const IDENTITY = 4;

/** Bitwarden's kinds of custom field: text, hidden, a checkbox, and one linked to a field of the item's own, which holds nothing. */
const TEXT = 0;
const HIDDEN = 1;
const BOOLEAN = 2;

/** An item's custom fields, as Passhold keeps them: a checkbox's as the true or false it holds. */
function fieldsOf(value: unknown): CustomField[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const field = record(entry);
    if (!field || ![TEXT, HIDDEN, BOOLEAN].includes(field.type as number)) return [];
    return [{ name: str(field.name), value: str(field.value), hidden: field.type === HIDDEN }];
  });
}

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function base64url(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) return null;
  try {
    return fromBase64(text);
  } catch {
    return null;
  }
}

/**
 * A website's passkey from Bitwarden, as Passhold keeps one — or null when it
 * cannot be. Passhold signs with P-256 alone, and its count of signatures
 * stays at zero, as synced passkeys' do: one whose count has started would
 * look to its site like a copy, and could be refused. One for no site of its
 * own, or for the Keyrook account, is never kept. Bitwarden names a passkey by
 * a GUID, or by its bytes after "b64.".
 */
async function passkeyOf(value: unknown, now: number): Promise<StoredPasskey | null> {
  const raw = record(value);
  if (!raw || raw.keyType !== 'public-key' || raw.keyAlgorithm !== 'ECDSA' || raw.keyCurve !== 'P-256') return null;
  const count = typeof raw.counter === 'number' ? raw.counter : Number(str(raw.counter).trim() || '0');
  if (count !== 0) return null;
  const rpId = str(raw.rpId).trim().toLowerCase();
  if (!rpIdKeepable(rpId)) return null;
  const id = str(raw.credentialId);
  const credential = GUID.test(id) ? fromHex(id.replace(/-/g, '')) : id.startsWith('b64.') ? base64url(id.slice(4)) : null;
  const userHandle = base64url(str(raw.userHandle));
  const key = base64url(str(raw.keyValue));
  if (!credential || !userHandle || !key || !(await signsAsPasskey(key))) return null;
  return cleanPasskey({
    credentialId: toBase64url(credential),
    rpId,
    rpName: str(raw.rpName),
    userHandle: toBase64url(userHandle),
    userName: str(raw.userName),
    userDisplayName: str(raw.userDisplayName),
    privateKey: toBase64(key),
    createdAt: Date.parse(str(raw.creationDate)) || now,
  });
}

export async function importBitwardenJson(input: string, vault: Pick<VaultData, 'items' | 'wallet'> = { items: [], wallet: [] }, now = Date.now()): Promise<ImportResult> {
  if (input.length > MAX_IMPORT_BYTES) throw new PassholdError('importTooLarge');
  const file = record(json(input.charCodeAt(0) === 0xfeff ? input.slice(1) : input));
  if (!file) throw new PassholdError('importUnknownFormat');
  // Under the Bitwarden account's key or a password of the export's own: nothing here could open it, and nothing asks.
  if (file.encrypted === true) throw new PassholdError('importEncrypted');
  if (!Array.isArray(file.items)) throw new PassholdError('importUnknownFormat');
  if (!file.items.length) throw new PassholdError('importEmpty');
  if (file.items.length > MAX_IMPORT_ROWS) throw new PassholdError('importTooLarge');

  // Folders by id: an item names the one it is in.
  const folders = new Map<string, string>();
  for (const entry of Array.isArray(file.folders) ? file.folders : []) {
    const folder = record(entry);
    if (folder && typeof folder.id === 'string') folders.set(folder.id, str(folder.name));
  }

  const into = collector(vault);
  for (const entry of file.items) {
    const item = record(entry);
    // In Bitwarden's trash, or not an item at all.
    if (!item || item.deletedDate) {
      into.skip();
      continue;
    }
    const title = str(item.name);
    const notes = str(item.notes);
    const favorite = item.favorite === true;
    const folder = (typeof item.folderId === 'string' && folders.get(item.folderId)) || '';
    const fields = fieldsOf(item.fields);
    switch (item.type) {
      case LOGIN: {
        const login = record(item.login) ?? {};
        if (str(login.totp).trim()) into.twoFactor();
        // One passkey to a login, as Passhold keeps them; any other is left, and said.
        let passkey: StoredPasskey | null = null;
        for (const credential of Array.isArray(login.fido2Credentials) ? login.fido2Credentials : []) {
          const kept: StoredPasskey | null = passkey ? null : await passkeyOf(credential, now);
          if (kept) passkey = kept;
          else into.passkeyLeft();
        }
        const uris = (Array.isArray(login.uris) ? login.uris : []).map((uri) => str(record(uri)?.uri));
        const password = str(login.password);
        // A passkey alone names its account and its site, as one saved in Passhold does.
        const username = str(login.username) || (passkey?.userName ?? '');
        const urls = uris.map(normaliseUrl).filter((url): url is string => url !== null);
        if (passkey && !urls.length) urls.push(`https://${passkey.rpId}/`);
        // Nothing to sign in with, but words to keep: a note, its address its first line, as a CSV row like it is.
        if (!username && !password && !passkey) {
          const words = [uris[0]?.trim() ?? '', notes].filter(Boolean).join('\n');
          // Its fields are something to keep too: a note of them, rather than nothing.
          into.keep(fields.length ? { kind: 'note', title, text: words, fields } : null, title, words, folder);
        } else into.login({ title, username, password, urls, notes, favorite, folder, fields }, passkey);
        break;
      }
      case NOTE:
        into.keep({ kind: 'note', title, text: notes, favorite, folder, fields }, title, notes);
        break;
      case CARD: {
        const card = record(item.card) ?? {};
        into.keep(
          {
            kind: 'card',
            title,
            holder: str(card.cardholderName),
            number: str(card.number),
            code: str(card.code),
            expMonth: whole(str(card.expMonth)),
            expYear: whole(str(card.expYear)),
            notes,
            favorite,
            folder,
            fields,
          },
          title,
          notes,
        );
        break;
      }
      case IDENTITY: {
        // Its address. A licence, a passport or a social security number is no part of one, and is not kept.
        const who = record(item.identity) ?? {};
        into.keep(
          {
            kind: 'address',
            title,
            name: [who.firstName, who.middleName, who.lastName].map(str).filter(Boolean).join(' '),
            organization: str(who.company),
            street: [who.address1, who.address2, who.address3].map(str).filter(Boolean).join('\n'),
            city: str(who.city),
            region: str(who.state),
            postalCode: str(who.postalCode),
            country: countryCode(who.country),
            phone: str(who.phone),
            email: str(who.email),
            notes,
            favorite,
            folder,
            fields,
          },
          title,
          notes,
        );
        break;
      }
      default:
        into.skip();
    }
  }
  return into.done('bitwarden');
}

/** A file from another manager, told apart by what it holds: Bitwarden's JSON, or a CSV file of any of them. */
export async function importFile(input: string, vault: Pick<VaultData, 'items' | 'wallet'> = { items: [], wallet: [] }): Promise<ImportResult> {
  return /^\uFEFF?\s*\{/.test(input) ? importBitwardenJson(input, vault) : importCsv(input, vault);
}
