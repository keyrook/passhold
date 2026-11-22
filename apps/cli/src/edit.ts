/**
 * What `passhold create` and `passhold edit` are given: `field=value` words,
 * each field named as a reference names it (`password`, `url`, `number`,
 * `private_key`…), any other name one of the item's own fields. A value of
 * `-` is asked for at the terminal, unseen, so a secret need not be in the
 * shell's history; `@path` is read from a file, as a private key or a note's
 * text would be.
 *
 * An item is changed by the vault's own functions (`addLogin`,
 * `updateWalletItem`…), so a password replaced goes into the login's
 * history, and an edit is kept as a version where the plan holds them.
 */
import {
  addLogin,
  addWalletItem,
  blankApiKey,
  brandFor,
  cleanHosts,
  dayOf,
  loginDraftOf,
  readSshKey,
  serviceOfKey,
  withService,
  type ApiKeyDraft,
  updateLogin,
  updateWalletItem,
  walletDraftOf,
  type CustomField,
  type Items,
  type LoginDraft,
  type WalletDraft,
  type WalletKind,
} from '@passhold/core';
import type { Change } from './account.js';
import { CliError, fieldKey, isLogin, type Item } from './reference.js';

export type Kind = 'login' | WalletKind;
export const KINDS: readonly Kind[] = ['login', 'card', 'address', 'note', 'ssh', 'apikey'];

/** One `field=value`, its value read: `asked` when it was typed unseen. */
export interface Assignment {
  field: string;
  value: string;
  asked: boolean;
}

export interface Reader {
  secret(prompt: string): Promise<string>;
  file(path: string): string;
}

/** The words after the item, read: `-` asked for, `@path` read. */
export async function assignments(words: readonly string[], read: Reader): Promise<Assignment[]> {
  const out: Assignment[] = [];
  for (const word of words) {
    const at = word.indexOf('=');
    if (at <= 0) throw new CliError(`Say each field as name=value: ${word}`);
    const field = word.slice(0, at).trim();
    const given = word.slice(at + 1);
    if (given === '-') out.push({ field, value: await read.secret(`${field}: `), asked: true });
    else if (given.startsWith('@') && given.length > 1) out.push({ field, value: read.file(given.slice(1)), asked: false });
    else out.push({ field, value: given, asked: false });
  }
  return out;
}

/** What each kind's draft calls a field a reference names: `postal_code` is `postalCode`. */
const DRAFT_FIELDS: Record<Kind, Record<string, string>> = {
  login: { title: 'title', username: 'username', password: 'password', notes: 'notes' },
  card: { title: 'title', holder: 'holder', number: 'number', code: 'code', notes: 'notes' },
  address: {
    title: 'title',
    name: 'name',
    organization: 'organization',
    street: 'street',
    city: 'city',
    region: 'region',
    postal_code: 'postalCode',
    country: 'country',
    phone: 'phone',
    email: 'email',
    notes: 'notes',
  },
  note: { title: 'title', text: 'text' },
  ssh: { title: 'title', private_key: 'privateKey', notes: 'notes' },
  apikey: { title: 'title', key: 'key', secret: 'key', key_id: 'keyId', send_as: 'sendAs', env: 'env', environment: 'environment', scopes: 'scopes', notes: 'notes' },
};

const EMPTY: Record<Kind, LoginDraft | WalletDraft> = {
  login: { title: '', username: '', password: '', urls: [], notes: '' },
  card: { kind: 'card', title: '', holder: '', number: '', expMonth: null, expYear: null, code: '', notes: '' },
  address: { kind: 'address', title: '', name: '', organization: '', street: '', city: '', region: '', postalCode: '', country: '', phone: '', email: '', notes: '' },
  note: { kind: 'note', title: '', text: '' },
  ssh: { kind: 'ssh', title: '', privateKey: '', publicKey: '', fingerprint: '', notes: '' },
  apikey: blankApiKey(),
};

/** A date as `YYYY-MM-DD`; empty for none. */
function day(value: string, field: string): number | null {
  if (!value.trim()) return null;
  const found = dayOf(value);
  if (found === null) throw new CliError(`${field} is a date, as YYYY-MM-DD.`);
  return found;
}

/** A service by its slug or its name, as the brand catalogue knows it; empty for none. */
function service(value: string): string {
  if (!value.trim()) return '';
  const found = brandFor(value, []);
  if (!found) throw new CliError(`No service is called "${value}". Name it by its own name or slug (stripe, github, aws…), or leave it out.`);
  return found.slug;
}

/** `MM/YY` or `MM/YYYY`, as a card prints it. */
function expiry(value: string): { expMonth: number | null; expYear: number | null } {
  if (!value.trim()) return { expMonth: null, expYear: null };
  const found = /^\s*(\d{1,2})\s*\/\s*(\d{2}|\d{4})\s*$/.exec(value);
  if (!found) throw new CliError('An expiry is MM/YY, as the card prints it.');
  return { expMonth: Number(found[1]), expYear: Number(found[2]) };
}

const whole = (value: string, field: string): number | null => {
  if (!value.trim()) return null;
  if (!/^\d+$/.test(value.trim())) throw new CliError(`${field} is a number.`);
  return Number(value);
};

/**
 * A draft of `kind` with the assignments made to it, from the item as it is
 * (an edit) or from nothing (a new one). A field of the item's own keeps
 * whether it is hidden; a new one is hidden when its value was typed unseen.
 * An own field given empty is removed.
 */
export async function draftWith(kind: Kind, item: Item | null, given: readonly Assignment[], extra: { folder?: string; password?: string; privateKey?: string } = {}): Promise<LoginDraft | WalletDraft> {
  const draft: Record<string, unknown> = item ? { ...(isLogin(item) ? loginDraftOf(item) : walletDraftOf(item)) } : { ...EMPTY[kind] };
  let fields: CustomField[] = item ? [...item.fields] : [];
  let urls: string[] | null = null;
  // `host=` given more than once adds each; `hosts=` says the whole list.
  let hostsGiven: string[] = [];
  let serviceGiven = false;
  for (const { field, value, asked } of given) {
    const key = fieldKey(field);
    const named = DRAFT_FIELDS[kind][key];
    if (named) {
      draft[named] = value;
    } else if (kind === 'login' && key === 'url') {
      urls = [...(urls ?? []), ...(value.trim() ? [value.trim()] : [])];
    } else if (kind === 'login' && key === 'urls') {
      urls = value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
    } else if (kind === 'card' && key === 'expiry') {
      Object.assign(draft, expiry(value));
    } else if (kind === 'card' && (key === 'exp_month' || key === 'exp_year')) {
      draft[key === 'exp_month' ? 'expMonth' : 'expYear'] = whole(value, field);
    } else if (kind === 'ssh' && (key === 'public_key' || key === 'fingerprint')) {
      throw new CliError(`An SSH key's ${field.replace('_', ' ')} is read from its private key, never given beside it.`);
    } else if (kind === 'apikey' && (key === 'host' || key === 'hosts')) {
      const hosts = cleanHosts(value);
      if (value.trim() && !hosts.length) throw new CliError(`${field} is a host, as api.example.com or *.example.com: ${value}`);
      draft.hosts = key === 'host' ? [...new Set([...hostsGiven, ...hosts])] : hosts;
      hostsGiven = draft.hosts as string[];
    } else if (kind === 'apikey' && (key === 'issued' || key === 'expires')) {
      draft[key === 'issued' ? 'issuedAt' : 'expiresAt'] = day(value, field);
    } else if (kind === 'apikey' && key === 'service') {
      draft.service = service(value);
      serviceGiven = true;
    } else {
      const at = fields.findIndex((entry) => entry.name.localeCompare(field, undefined, { sensitivity: 'accent' }) === 0);
      if (!value) fields = fields.filter((_, index) => index !== at);
      else if (at >= 0) fields = fields.map((entry, index) => (index === at ? { ...entry, value } : entry));
      else fields = [...fields, { name: field, value, hidden: asked }];
    }
  }
  if (urls) draft.urls = urls;
  if (extra.password !== undefined) draft.password = extra.password;
  if (extra.privateKey !== undefined) draft.privateKey = extra.privateKey;
  if (extra.folder !== undefined) draft.folder = extra.folder;
  draft.fields = fields;
  if (kind === 'apikey') {
    // Filed under its service — named, or known by what the key starts with — with that service's hosts, way and variable where none were given.
    const given = draft as unknown as ApiKeyDraft;
    const slug = serviceGiven ? given.service : given.service || serviceOfKey(given.key, given.keyId) || '';
    const filed = withService({ ...given, service: item ? given.service : '' }, slug);
    return { ...filed, fields } as ApiKeyDraft;
  }
  if (kind === 'ssh') {
    // The public key and its fingerprint, from the file itself: the two can never disagree with it.
    const privateKey = String(draft.privateKey ?? '');
    const info = privateKey.trim() ? await readSshKey(privateKey, String(draft.title ?? '')).catch(() => null) : null;
    if (privateKey.trim() && !info) throw new CliError('That is not a private key as OpenSSH writes it (-----BEGIN OPENSSH PRIVATE KEY-----).');
    draft.publicKey = info?.publicKey ?? '';
    draft.fingerprint = info?.fingerprint ?? '';
  }
  return draft as unknown as LoginDraft | WalletDraft;
}

/** A new item of that kind, from its draft. */
export function adding(kind: Kind, draft: LoginDraft | WalletDraft, now: number): Change {
  return <T extends Items>(items: T) => {
    const added = kind === 'login' ? addLogin(items, draft as LoginDraft, now) : addWalletItem(items, draft as WalletDraft, now);
    return { items: added.data, id: added.item.id };
  };
}

/** An item as its draft now says, kept as a version where `versions`. */
export function editing(item: Item, draft: LoginDraft | WalletDraft, now: number, versions: boolean): Change {
  return <T extends Items>(items: T) => ({
    items: isLogin(item) ? updateLogin(items, item.id, draft as LoginDraft, now, { versions }) : updateWalletItem(items, item.id, draft as WalletDraft, now, { versions }),
    id: item.id,
  });
}

export const kindOf = (item: Item): Kind => (isLogin(item) ? 'login' : item.kind);
