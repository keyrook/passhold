/**
 * Changes to the vault's contents, as pure functions: each takes the data and
 * returns new data, so the service worker can apply one inside its serialised
 * turn and nothing is half-changed if sealing fails.
 */
import { PassholdError } from '../errors.js';
import { normaliseGenerator } from '../generator.js';
import { matchUrls, normaliseUrl, siteName, siteOf, type MatchStrength, type Site } from '../match.js';
import { newId } from '../util/id.js';
import {
  AUTO_LOCK_CHOICES,
  CLIPBOARD_CHOICES,
  DEFAULT_SETTINGS,
  HISTORY_LIMIT,
  LIMITS,
  VAULT_SCHEMA_VERSION,
  type LoginDraft,
  type LoginItem,
  type PasswordChange,
  type VaultData,
  type VaultSettings,
} from './model.js';

// --- reading: everything from storage or an import is checked ---------------

const text = (value: unknown, limit: number): string =>
  typeof value === 'string' ? value.slice(0, limit) : '';

const time = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;

function cleanUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const urls: string[] = [];
  for (const entry of value) {
    if (typeof entry !== 'string' || entry.length > LIMITS.url) continue;
    const url = normaliseUrl(entry);
    if (url && !urls.includes(url)) urls.push(url);
    if (urls.length >= LIMITS.urls) break;
  }
  return urls;
}

function cleanHistory(value: unknown): PasswordChange[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is PasswordChange => typeof entry === 'object' && entry !== null)
    .map((entry) => ({ password: text(entry.password, LIMITS.password), changedAt: time(entry.changedAt) ?? 0 }))
    .filter((entry) => entry.password)
    .slice(0, HISTORY_LIMIT);
}

function cleanItem(value: unknown): LoginItem | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== 'string' || !raw.id) return null;
  const createdAt = time(raw.createdAt) ?? Date.now();
  return {
    id: raw.id.slice(0, 64),
    title: text(raw.title, LIMITS.title),
    username: text(raw.username, LIMITS.username),
    password: text(raw.password, LIMITS.password),
    urls: cleanUrls(raw.urls),
    notes: text(raw.notes, LIMITS.notes),
    favorite: raw.favorite === true,
    createdAt,
    updatedAt: time(raw.updatedAt) ?? createdAt,
    passwordChangedAt: time(raw.passwordChangedAt) ?? createdAt,
    lastUsedAt: time(raw.lastUsedAt),
    deletedAt: time(raw.deletedAt),
    history: cleanHistory(raw.history),
  };
}

function oneOf<T extends number>(value: unknown, choices: readonly T[], fallback: T): T {
  return choices.includes(value as T) ? (value as T) : fallback;
}

export function cleanSettings(value: unknown): VaultSettings {
  const raw = (typeof value === 'object' && value !== null ? value : {}) as Partial<VaultSettings>;
  const flag = (key: 'lockWithSystem' | 'inlineButton' | 'offerToSave') =>
    typeof raw[key] === 'boolean' ? raw[key] : DEFAULT_SETTINGS[key];
  return {
    autoLockMinutes: oneOf(raw.autoLockMinutes, AUTO_LOCK_CHOICES, 15),
    lockWithSystem: flag('lockWithSystem'),
    clearClipboardSeconds: oneOf(raw.clearClipboardSeconds, CLIPBOARD_CHOICES, 30),
    inlineButton: flag('inlineButton'),
    offerToSave: flag('offerToSave'),
    generator: normaliseGenerator(typeof raw.generator === 'object' && raw.generator !== null ? raw.generator : {}),
  };
}

/** The opened payload, checked field by field: a decrypted vault is still input. */
export function sanitiseData(raw: unknown): VaultData {
  if (typeof raw !== 'object' || raw === null) throw new PassholdError('vaultCorrupt');
  const data = raw as Partial<VaultData>;
  const seen = new Set<string>();
  const items: LoginItem[] = [];
  for (const entry of Array.isArray(data.items) ? data.items : []) {
    const item = cleanItem(entry);
    if (item && !seen.has(item.id)) {
      seen.add(item.id);
      items.push(item);
    }
  }
  return {
    schemaVersion: VAULT_SCHEMA_VERSION,
    items,
    settings: cleanSettings(data.settings),
    neverSave: Array.isArray(data.neverSave)
      ? [...new Set(data.neverSave.filter((site): site is string => typeof site === 'string').map((site) => site.slice(0, 255)))]
      : [],
    lastBackupAt: time(data.lastBackupAt),
  };
}

// --- writing ------------------------------------------------------------------

/** A login's name when its owner gave none: the site it is for. */
export function titleFor(urls: readonly string[]): string {
  for (const url of urls) {
    const site = siteOf(url);
    if (site) return siteName(site);
  }
  return '';
}

export function cleanDraft(draft: LoginDraft): LoginDraft {
  const urls = cleanUrls(draft.urls);
  const clean: LoginDraft = {
    title: text(draft.title, LIMITS.title).trim() || titleFor(urls),
    username: text(draft.username, LIMITS.username).trim(),
    password: text(draft.password, LIMITS.password),
    urls,
    notes: text(draft.notes, LIMITS.notes),
    favorite: draft.favorite === true,
  };
  if (!clean.title && !clean.username && !clean.password) throw new PassholdError('itemInvalid');
  return clean;
}

function find(data: VaultData, id: string): LoginItem {
  const item = data.items.find((entry) => entry.id === id);
  if (!item) throw new PassholdError('itemNotFound');
  return item;
}

function replace(data: VaultData, item: LoginItem): VaultData {
  return { ...data, items: data.items.map((entry) => (entry.id === item.id ? item : entry)) };
}

export function addLogin(data: VaultData, draft: LoginDraft, now = Date.now()): { data: VaultData; item: LoginItem } {
  const clean = cleanDraft(draft);
  const item: LoginItem = {
    id: newId(),
    title: clean.title,
    username: clean.username,
    password: clean.password,
    urls: clean.urls,
    notes: clean.notes,
    favorite: clean.favorite ?? false,
    createdAt: now,
    updatedAt: now,
    passwordChangedAt: now,
    lastUsedAt: null,
    deletedAt: null,
    history: [],
  };
  return { data: { ...data, items: [...data.items, item] }, item };
}

/** Apply an edit. A new password pushes the old one onto the login's history. */
export function updateLogin(data: VaultData, id: string, draft: LoginDraft, now = Date.now()): VaultData {
  const item = find(data, id);
  const clean = cleanDraft(draft);
  const passwordChanged = clean.password !== item.password;
  return replace(data, {
    ...item,
    ...clean,
    favorite: clean.favorite ?? item.favorite,
    updatedAt: now,
    passwordChangedAt: passwordChanged ? now : item.passwordChangedAt,
    history:
      passwordChanged && item.password
        ? [{ password: item.password, changedAt: now }, ...item.history].slice(0, HISTORY_LIMIT)
        : item.history,
  });
}

export function setFavorite(data: VaultData, id: string, favorite: boolean): VaultData {
  return replace(data, { ...find(data, id), favorite });
}

/** To the trash. Nothing leaves the vault until its owner empties the trash. */
export function trashLogin(data: VaultData, id: string, now = Date.now()): VaultData {
  return replace(data, { ...find(data, id), deletedAt: now, updatedAt: now });
}

export function restoreLogin(data: VaultData, id: string, now = Date.now()): VaultData {
  return replace(data, { ...find(data, id), deletedAt: null, updatedAt: now });
}

/** Gone for good — only from the trash, so one click can never destroy a live login. */
export function purgeLogin(data: VaultData, id: string): VaultData {
  const item = find(data, id);
  if (item.deletedAt === null) throw new PassholdError('itemInvalid');
  return { ...data, items: data.items.filter((entry) => entry.id !== id) };
}

export function emptyTrash(data: VaultData): VaultData {
  return { ...data, items: data.items.filter((item) => item.deletedAt === null) };
}

export function markUsed(data: VaultData, id: string, now = Date.now()): VaultData {
  return replace(data, { ...find(data, id), lastUsedAt: now });
}

export function markBackedUp(data: VaultData, now = Date.now()): VaultData {
  return { ...data, lastBackupAt: now };
}

export function updateSettings(data: VaultData, patch: Partial<VaultSettings>): VaultData {
  return { ...data, settings: cleanSettings({ ...data.settings, ...patch }) };
}

export function addNeverSave(data: VaultData, site: string): VaultData {
  return data.neverSave.includes(site) ? data : { ...data, neverSave: [...data.neverSave, site.slice(0, 255)] };
}

export function removeNeverSave(data: VaultData, site: string): VaultData {
  return { ...data, neverSave: data.neverSave.filter((entry) => entry !== site) };
}

// --- reading for a page ---------------------------------------------------------

export interface SiteMatch {
  item: LoginItem;
  strength: MatchStrength;
}

/** Live logins for a page, the closest and most recently used first. */
export function loginsForSite(data: VaultData, page: Site): SiteMatch[] {
  const matches: SiteMatch[] = [];
  for (const item of data.items) {
    if (item.deletedAt !== null) continue;
    const strength = matchUrls(item.urls, page);
    if (strength) matches.push({ item, strength });
  }
  return matches.sort(
    (a, b) =>
      (a.strength === b.strength ? 0 : a.strength === 'exact' ? -1 : 1) ||
      (b.item.lastUsedAt ?? 0) - (a.item.lastUsedAt ?? 0) ||
      a.item.title.localeCompare(b.item.title),
  );
}

/**
 * What a sign-in just sent on a page would mean for the vault: a new login,
 * a new password for one already saved, or nothing new at all.
 */
export type CaptureVerdict =
  | { kind: 'new' }
  | { kind: 'update'; item: LoginItem }
  | { kind: 'known' }
  | { kind: 'neverSave' };

export function judgeCapture(data: VaultData, page: Site, username: string, password: string): CaptureVerdict {
  if (data.neverSave.includes(siteName(page))) return { kind: 'neverSave' };
  const matches = loginsForSite(data, page);
  const sameUser = matches.find(({ item }) => item.username === username);
  if (sameUser) return sameUser.item.password === password ? { kind: 'known' } : { kind: 'update', item: sameUser.item };
  // A form that sends only a password — a second step, a re-auth prompt —
  // most likely belongs to the one login this site has.
  if (!username) {
    if (matches.some(({ item }) => item.password === password)) return { kind: 'known' };
    if (matches.length === 1) return { kind: 'update', item: matches[0]!.item };
  }
  return { kind: 'new' };
}

/** Case- and accent-blind search over what a person would remember of a login. */
export function searchLogins(items: readonly LoginItem[], query: string): LoginItem[] {
  const fold = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [...items];
  return items.filter((item) => {
    const haystack = fold([item.title, item.username, ...item.urls, item.notes].join(' '));
    return words.every((word) => haystack.includes(word));
  });
}
