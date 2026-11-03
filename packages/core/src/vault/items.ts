/**
 * Changes to the vault's contents, as pure functions: each takes the data and
 * returns new data, so the service worker can apply one inside its serialised
 * turn and nothing is half-changed if sealing fails.
 */
import { PassholdError } from '../errors.js';
import { normaliseGenerator } from '../generator.js';
import { matchUrls, normaliseUrl, siteName, siteOf, type MatchStrength, type Site } from '../match.js';
import { isValidPin } from './pin.js';
import { normaliseRecoveryKey } from './recovery.js';
import { isWellFormedRecoveryKey } from '@keyrook/account';
import { newId } from '../util/id.js';
import { rpIdKeepable } from '../webauthn/request.js';
import { cleanFields, cleanFolder, cleanVaultName, fieldWords, settleFolder } from './folders.js';
import { cleanWallet } from './wallet.js';
import {
  AUTO_LOCK_CHOICES,
  CLIPBOARD_CHOICES,
  DEFAULT_SETTINGS,
  HISTORY_LIMIT,
  LIMITS,
  type AccountKitLink,
  type PendingStartOver,
  type AccountLink,
  type KnownRecord,
  VAULT_SCHEMA_VERSION,
  type FamilyLink,
  type FamilyMember,
  type FamilyState,
  type FamilyVault,
  type ImportedLogin,
  type Items,
  type LoginDraft,
  type LoginItem,
  type PasskeyFor,
  type PasswordChange,
  type StoredPasskey,
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

const B64URL = /^[A-Za-z0-9_-]+$/;
const B64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** A website's passkey as stored, or null rather than half of one. */
export function cleanPasskey(value: unknown): StoredPasskey | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  const field = (key: string, pattern: RegExp, limit: number) =>
    typeof raw[key] === 'string' && (raw[key] as string).length <= limit && pattern.test(raw[key] as string) ? (raw[key] as string) : null;
  // A credential id is at most 1023 bytes, the site's id for an account 64; a P-256 key in PKCS#8 under 200.
  const credentialId = field('credentialId', B64URL, 1400);
  const userHandle = field('userHandle', B64URL, 88);
  const privateKey = field('privateKey', B64, 512);
  const rpId = typeof raw.rpId === 'string' && raw.rpId.length <= 253 && /^[a-z0-9.-]+$/.test(raw.rpId) ? raw.rpId : null;
  if (!credentialId || !userHandle || !privateKey || !rpId) return null;
  return {
    credentialId,
    rpId,
    rpName: text(raw.rpName, LIMITS.title),
    userHandle,
    userName: text(raw.userName, LIMITS.username),
    userDisplayName: text(raw.userDisplayName, LIMITS.username),
    privateKey,
    createdAt: time(raw.createdAt) ?? 0,
  };
}

export function cleanLogin(value: unknown): LoginItem | null {
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
    passkey: cleanPasskey(raw.passkey),
    folder: cleanFolder(raw.folder),
    fields: cleanFields(raw.fields),
  };
}

function oneOf<T extends number>(value: unknown, choices: readonly T[], fallback: T): T {
  return choices.includes(value as T) ? (value as T) : fallback;
}

export function cleanSettings(value: unknown): VaultSettings {
  const raw = (typeof value === 'object' && value !== null ? value : {}) as Partial<VaultSettings>;
  const flag = (key: 'lockWithSystem' | 'inlineButton' | 'offerToSave' | 'offerToSaveCards' | 'autoSuggest' | 'passkeys') =>
    typeof raw[key] === 'boolean' ? raw[key] : DEFAULT_SETTINGS[key];
  return {
    autoLockMinutes: oneOf(raw.autoLockMinutes, AUTO_LOCK_CHOICES, 15),
    lockWithSystem: flag('lockWithSystem'),
    clearClipboardSeconds: oneOf(raw.clearClipboardSeconds, CLIPBOARD_CHOICES, 30),
    inlineButton: flag('inlineButton'),
    offerToSave: flag('offerToSave'),
    offerToSaveCards: flag('offerToSaveCards'),
    autoSuggest: flag('autoSuggest'),
    passkeys: flag('passkeys'),
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
    const item = cleanLogin(entry);
    if (item && !seen.has(item.id)) {
      seen.add(item.id);
      items.push(item);
    }
  }
  return {
    schemaVersion: VAULT_SCHEMA_VERSION,
    items,
    wallet: cleanWallet(data.wallet, seen),
    settings: cleanSettings(data.settings),
    neverSave: Array.isArray(data.neverSave)
      ? [...new Set(data.neverSave.filter((site): site is string => typeof site === 'string').map((site) => site.slice(0, 255)))]
      : [],
    lastBackupAt: time(data.lastBackupAt),
    pin: typeof data.pin === 'string' && isValidPin(data.pin) ? data.pin : null,
    recoveryKeyPending: data.recoveryKeyPending === true,
    recoveryKey: typeof data.recoveryKey === 'string' ? normaliseRecoveryKey(data.recoveryKey) : null,
    account: cleanAccount(data.account),
    families: cleanFamilies(data.families),
  };
}

const generation = (value: unknown): number => (Number.isSafeInteger(value) && (value as number) >= 1 ? (value as number) : 1);

const short = (value: unknown, limit: number): string | null => (typeof value === 'string' && value.length > 0 && value.length <= limit ? value : null);

/** The account link as stored: every field checked, or no link at all rather than half of one. */
/**
 * An account's name as the server gave it, as text a page may show: at most 64
 * characters, and no control or format character — a direction override would
 * turn what follows it around — but the joiners some scripts write names with.
 */
export function cleanAccountName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value
    .normalize('NFC')
    .replace(/(?![\u200C\u200D])[\p{Cc}\p{Cf}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 64);
  return name || null;
}

/**
 * What a device knows of each record, as stored. A card's, an address's or a
 * note's keeps its kind, or its deletion would go up as a login's.
 */
function cleanKnown(value: unknown): Record<string, KnownRecord> {
  const known: Record<string, KnownRecord> = {};
  if (typeof value !== 'object' || value === null) return known;
  for (const [id, record] of Object.entries(value as Record<string, unknown>)) {
    const entry = record as Partial<KnownRecord> | null;
    if (id.length <= 128 && entry && Number.isSafeInteger(entry.rev) && typeof entry.sig === 'string' && entry.sig.length === 64) {
      known[id] = entry.kind === 'wallet' ? { rev: entry.rev!, sig: entry.sig, kind: 'wallet' } : { rev: entry.rev!, sig: entry.sig };
    }
  }
  return known;
}

function cleanAccount(value: unknown): AccountLink | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  const email = short(raw.email, 320);
  const deviceId = short(raw.deviceId, 128);
  if (!email || !deviceId) return null;
  const accountId = short(raw.accountId, 64);
  const productKey = short(raw.productKey, 64);
  // A link from before each product had a key of its own holds the account's
  // one shared key: never used again, it is dropped, and the link is signed
  // out until its owner signs in once more.
  const keyed = accountId !== null && productKey !== null;
  const tokens = raw.tokens as Record<string, unknown> | null;
  const access = tokens ? short(tokens.accessToken, 4096) : null;
  const refresh = tokens ? short(tokens.refreshToken, 4096) : null;
  const known = cleanKnown(raw.known);
  return {
    email,
    deviceId,
    accountId: keyed ? accountId : null,
    productKey: keyed ? productKey : null,
    previousKey: keyed ? short(raw.previousKey, 64) : null,
    root: keyed ? short(raw.root, 128) : null,
    keyGeneration: keyed ? generation(raw.keyGeneration) : 1,
    rootGeneration: keyed ? generation(raw.rootGeneration) : 1,
    sheetVerifiedAt: keyed ? time(raw.sheetVerifiedAt) : null,
    name: cleanAccountName(raw.name),
    tokens: keyed && access && refresh ? { accessToken: access, refreshToken: refresh } : null,
    serverRev: keyed && Number.isSafeInteger(raw.serverRev) && (raw.serverRev as number) >= 0 ? (raw.serverRev as number) : 0,
    epoch: keyed ? short(raw.epoch, 128) : null,
    known: keyed ? known : {},
    lastSyncAt: keyed ? time(raw.lastSyncAt) : null,
    kit: keyed ? cleanKit(raw.kit) : null,
    pendingStartOver: keyed ? cleanPendingStartOver(raw.pendingStartOver) : null,
    // Kept on the link with no key that a removal leaves, until its owner closes the notice.
    removedAt: time(raw.removedAt),
    provider: raw.provider === 'google' || raw.provider === 'github' ? raw.provider : null,
    // As stored; a link from before it was kept says only its provider, which then meant no password.
    passwordless: typeof raw.passwordless === 'boolean' ? raw.passwordless : raw.provider === 'google' || raw.provider === 'github',
    passkey: short(raw.passkey, 512),
  };
}

const record = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

const list = (value: unknown, limit: number): unknown[] => (Array.isArray(value) ? value.slice(0, limit) : []);

/**
 * The families as stored, each checked as the account link is: a family, a
 * member or a shared vault that does not read right is dropped, never half
 * kept. The next sync with the family brings back whatever it holds.
 */
function cleanFamilies(value: unknown): FamilyLink[] {
  const families: FamilyLink[] = [];
  for (const entry of list(value, 16)) {
    const raw = record(entry);
    const orgId = raw && short(raw.orgId, 64);
    const name = raw && cleanAccountName(raw.name);
    if (!raw || !orgId || !name || families.some((family) => family.orgId === orgId)) continue;
    const members: FamilyMember[] = [];
    for (const one of list(raw.members, 16)) {
      const member = record(one);
      const accountId = member && short(member.accountId, 64);
      const email = member && short(member.email, 320);
      if (member && accountId && email && !members.some((other) => other.accountId === accountId)) {
        members.push({ accountId, email, name: cleanAccountName(member.name), role: member.role === 'owner' ? 'owner' : 'member', verified: member.verified === true });
      }
    }
    const pin = record(raw.pin);
    families.push({
      orgId,
      name,
      role: raw.role === 'owner' ? 'owner' : 'member',
      members,
      pin: pin && short(pin.iv, 64) && short(pin.ct, 65_536) ? { iv: pin.iv as string, ct: pin.ct as string } : null,
      keyChanged: cleanKeyChanges(raw.keyChanged),
      left: cleanDepartures(raw.left),
      state: cleanFamilyState(raw.state),
      rotationDue: raw.rotationDue === true,
      serverRev: Number.isSafeInteger(raw.serverRev) && (raw.serverRev as number) >= 0 ? (raw.serverRev as number) : 0,
      epoch: short(raw.epoch, 128),
      vaults: cleanFamilyVaults(raw.vaults),
    });
  }
  return families;
}

function cleanKeyChanges(value: unknown): FamilyLink['keyChanged'] {
  const changes: FamilyLink['keyChanged'] = [];
  for (const entry of list(value, 16)) {
    const raw = record(entry);
    const accountId = raw && short(raw.accountId, 64);
    const memberKey = raw && short(raw.memberKey, 256);
    if (accountId && memberKey && !changes.some((change) => change.accountId === accountId)) changes.push({ accountId, memberKey });
  }
  return changes;
}

/** As stored; a vault from before there were any holds none. Someone not named here is still gone, so a name that does not read right is dropped, never the person. */
function cleanDepartures(value: unknown): FamilyLink['left'] {
  const left: FamilyLink['left'] = [];
  for (const entry of list(value, 16)) {
    const raw = record(entry);
    const accountId = raw && short(raw.accountId, 64);
    if (raw && accountId && !left.some((other) => other.accountId === accountId)) left.push({ accountId, email: short(raw.email, 320) ?? '', name: cleanAccountName(raw.name) });
  }
  return left;
}

/** As stored; anything else is a family to open again, which the next sync does. */
function cleanFamilyState(value: unknown): FamilyState {
  const raw = record(value);
  if (raw?.kind === 'compare') {
    const accountId = short(raw.accountId, 64);
    const memberKey = short(raw.memberKey, 256);
    const code = short(raw.code, 64);
    if (accountId && memberKey && code) return { kind: 'compare', accountId, memberKey, code };
  }
  return raw?.kind === 'waiting' || raw?.kind === 'needs-root' ? { kind: raw.kind } : { kind: 'open' };
}

function cleanFamilyVaults(value: unknown): FamilyVault[] {
  const vaults: FamilyVault[] = [];
  for (const entry of list(value, 64)) {
    const raw = record(entry);
    const id = raw && short(raw.id, 64);
    const name = raw && cleanVaultName(raw.name);
    if (!raw || !id || !name || vaults.some((vault) => vault.id === id)) continue;
    const seen = new Set<string>();
    const items: LoginItem[] = [];
    for (const one of Array.isArray(raw.items) ? raw.items : []) {
      const item = cleanLogin(one);
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        items.push(item);
      }
    }
    vaults.push({ id, name, generation: generation(raw.generation), keyDue: raw.keyDue === true, items, wallet: cleanWallet(raw.wallet, seen), known: cleanKnown(raw.known) });
  }
  return vaults;
}

function cleanPendingStartOver(value: unknown): PendingStartOver | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const requestedAt = time(raw.requestedAt);
  const executesAt = time(raw.executesAt);
  if (requestedAt === null || executesAt === null) return null;
  return { requestedAt, executesAt, deviceName: short(raw.deviceName, 128) ?? '' };
}

function cleanKit(value: unknown): AccountKitLink | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const issuedAt = time(raw.issuedAt);
  if (issuedAt === null) return null;
  const key = typeof raw.key === 'string' && isWellFormedRecoveryKey(raw.key) ? raw.key : null;
  return { issuedAt, key, pending: raw.pending === true && key !== null };
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
    ...(draft.folder !== undefined ? { folder: cleanFolder(draft.folder) } : {}),
    ...(draft.fields !== undefined ? { fields: cleanFields(draft.fields) } : {}),
  };
  if (!clean.title && !clean.username && !clean.password) throw new PassholdError('itemInvalid');
  return clean;
}

function find(data: Items, id: string): LoginItem {
  const item = data.items.find((entry) => entry.id === id);
  if (!item) throw new PassholdError('itemNotFound');
  return item;
}

function replace<T extends Items>(data: T, item: LoginItem): T {
  return { ...data, items: data.items.map((entry) => (entry.id === item.id ? item : entry)) };
}

export function addLogin<T extends Items>(data: T, draft: LoginDraft, now = Date.now()): { data: T; item: LoginItem } {
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
    passkey: null,
    folder: settleFolder(data, clean.folder ?? ''),
    fields: clean.fields ?? [],
  };
  return { data: { ...data, items: [...data.items, item] }, item };
}

/**
 * What an import brings: new logins, a website's passkey with some, and
 * passkeys for logins the vault already has and that hold none. Each passkey
 * is checked again here as one read from storage is, and one for no site of
 * its own, or for the Keyrook account, is dropped however it was sent:
 * Passhold never keeps a passkey that opens Passhold.
 */
export function importLogins(data: VaultData, logins: readonly ImportedLogin[], passkeys: readonly PasskeyFor[], now = Date.now()): VaultData {
  const keepable = (value: unknown) => {
    const passkey = cleanPasskey(value);
    return passkey && rpIdKeepable(passkey.rpId) ? passkey : null;
  };
  let next = data;
  for (const login of logins) {
    const added = addLogin(next, login, now);
    const passkey = keepable(login.passkey);
    next = passkey ? replace(added.data, { ...added.item, passkey }) : added.data;
  }
  for (const { id, passkey } of passkeys) {
    const item = next.items.find((entry) => entry.id === id && entry.deletedAt === null && entry.passkey === null);
    const kept = keepable(passkey);
    if (item && kept) next = replace(next, { ...item, passkey: kept, updatedAt: now });
  }
  return next;
}

/**
 * A website's new passkey, into the login it belongs with: the one already
 * holding a passkey for this account on this site, which it replaces; or one
 * for the site with the username the site just named and no passkey yet; or
 * a login of its own. A passkey it replaces goes to the trash in a copy of
 * the login — the site may still know it — never straight away.
 */
export function savePasskey(data: VaultData, url: string, passkey: StoredPasskey, now = Date.now()): { data: VaultData; item: LoginItem } {
  const site = siteOf(url);
  if (!site) throw new PassholdError('itemInvalid');
  const target =
    data.items.find((item) => item.deletedAt === null && item.passkey?.rpId === passkey.rpId && item.passkey.userHandle === passkey.userHandle) ??
    loginsForSite(data, site)
      .map(({ item }) => item)
      .find((item) => !item.passkey && item.username !== '' && item.username === passkey.userName);
  if (target) {
    const item: LoginItem = { ...target, passkey, updatedAt: now };
    const items = data.items.map((entry) => (entry.id === target.id ? item : entry));
    if (target.passkey) {
      items.push({ ...target, id: newId(), password: '', history: [], favorite: false, updatedAt: now, deletedAt: now, lastUsedAt: null });
    }
    return { data: { ...data, items }, item };
  }
  const urls = cleanUrls([site.origin]);
  const item: LoginItem = {
    id: newId(),
    title: passkey.rpName.trim().slice(0, LIMITS.title) || titleFor(urls),
    username: passkey.userName,
    password: '',
    urls,
    notes: '',
    favorite: false,
    createdAt: now,
    updatedAt: now,
    passwordChangedAt: now,
    lastUsedAt: null,
    deletedAt: null,
    history: [],
    passkey,
    folder: '',
    fields: [],
  };
  return { data: { ...data, items: [...data.items, item] }, item };
}

/** Apply an edit. A new password pushes the old one onto the login's history. */
export function updateLogin<T extends Items>(data: T, id: string, draft: LoginDraft, now = Date.now()): T {
  const item = find(data, id);
  const clean = cleanDraft(draft);
  const passwordChanged = clean.password !== item.password;
  return replace(data, {
    ...item,
    ...clean,
    favorite: clean.favorite ?? item.favorite,
    folder: clean.folder === undefined ? item.folder : settleFolder(data, clean.folder, item.id),
    fields: clean.fields ?? item.fields,
    updatedAt: now,
    passwordChangedAt: passwordChanged ? now : item.passwordChangedAt,
    history:
      passwordChanged && item.password
        ? [{ password: item.password, changedAt: now }, ...item.history].slice(0, HISTORY_LIMIT)
        : item.history,
  });
}

export function setFavorite<T extends Items>(data: T, id: string, favorite: boolean): T {
  return replace(data, { ...find(data, id), favorite });
}

/** To the trash. Nothing leaves the vault until its owner empties the trash. */
export function trashLogin<T extends Items>(data: T, id: string, now = Date.now()): T {
  return replace(data, { ...find(data, id), deletedAt: now, updatedAt: now });
}

export function restoreLogin<T extends Items>(data: T, id: string, now = Date.now()): T {
  return replace(data, { ...find(data, id), deletedAt: null, updatedAt: now });
}

/** Gone for good — only from the trash, so one click can never destroy a live login. */
export function purgeLogin<T extends Items>(data: T, id: string): T {
  const item = find(data, id);
  if (item.deletedAt === null) throw new PassholdError('itemInvalid');
  return { ...data, items: data.items.filter((entry) => entry.id !== id) };
}

/** Logins, cards, addresses and notes alike. */
export function emptyTrash<T extends Items>(data: T): T {
  return { ...data, items: data.items.filter((item) => item.deletedAt === null), wallet: data.wallet.filter((item) => item.deletedAt === null) };
}

export function markUsed<T extends Items>(data: T, id: string, now = Date.now()): T {
  return replace(data, { ...find(data, id), lastUsedAt: now });
}

export function setPin(data: VaultData, pin: string | null): VaultData {
  if (pin !== null && !isValidPin(pin)) throw new PassholdError('pinInvalid');
  return { ...data, pin };
}

export function setRecoveryKeyPending(data: VaultData, pending: boolean): VaultData {
  return { ...data, recoveryKeyPending: pending };
}

/** A new recovery key, waiting to be put away; or none, for a vault that has a master password again. */
export function withRecoveryKey(data: VaultData, key: string | null): VaultData {
  return { ...data, recoveryKey: key, recoveryKeyPending: key !== null };
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
 * Live logins holding a passkey for this relying party, the most recently
 * used first; with `allow`, only the passkeys the site named. Matched by the
 * passkey's own site, never by the login's URLs, which its owner may edit.
 */
export function passkeyLogins(data: VaultData, rpId: string, allow: readonly string[] = []): LoginItem[] {
  return data.items
    .filter((item) => item.deletedAt === null && item.passkey?.rpId === rpId && (allow.length === 0 || allow.includes(item.passkey.credentialId)))
    .sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0) || a.title.localeCompare(b.title));
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
    const haystack = fold([item.title, item.username, ...item.urls, item.notes, item.folder, ...fieldWords(item.fields)].join(' '));
    return words.every((word) => haystack.includes(word));
  });
}
