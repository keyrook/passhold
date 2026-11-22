/**
 * A change a page describes, and how it is applied: the same rules wherever
 * the vault is held — the extension's service worker, which keeps it sealed
 * on disk, and the web vault's worker, which keeps it in memory while it is
 * unlocked. Pages never apply a change themselves: they describe it, and the
 * one place that holds the vault applies it inside its own turn.
 */
import { PassholdError } from '../errors.js';
import { planAllows, type Plan } from '../plan.js';
import { detachFile, withoutFileKeys } from './attachments.js';
import { emptyFamilyTrash, familyVault, inFamilyVault, moveToFamily, purgeFromFamily, readDeparture, type VaultPlace } from './family.js';
import { renameFolder } from './folders.js';
import {
  addLogin,
  emptyTrash,
  importLogins,
  purgeLogin,
  removeNeverSave,
  restoreLogin,
  restoreLoginVersion,
  setFavorite,
  setRecoveryKeyPending,
  trashLogin,
  updateLogin,
  updateSettings,
} from './items.js';
import type { CustomField, ImportedLogin, Items, LoginDraft, LoginItem, PasskeyFor, VaultData, VaultSettings, WalletDraft, WalletItem } from './model.js';
import type { ItemVersion } from './versions.js';
import {
  addWalletItem,
  purgeWalletItem,
  restoreWalletItem,
  restoreWalletVersion,
  setWalletFavorite,
  trashWalletItem,
  updateWalletItem,
} from './wallet.js';

/** A change to the logins, cards, addresses and notes of one place: the vault's own, or a family's shared vault. */
export type ItemMutation =
  | { op: 'login/add'; draft: LoginDraft }
  | { op: 'login/update'; id: string; draft: LoginDraft }
  | { op: 'login/favorite'; id: string; favorite: boolean }
  | { op: 'login/trash'; id: string }
  | { op: 'login/restore'; id: string }
  | { op: 'login/purge'; id: string }
  /** The login as one of its versions was (`savedAt` names it); refused on a plan that keeps none. */
  | { op: 'login/restoreVersion'; id: string; savedAt: number }
  /** A card, an address or a note. */
  | { op: 'wallet/add'; draft: WalletDraft }
  | { op: 'wallet/update'; id: string; draft: WalletDraft }
  | { op: 'wallet/favorite'; id: string; favorite: boolean }
  | { op: 'wallet/trash'; id: string }
  | { op: 'wallet/restore'; id: string }
  | { op: 'wallet/purge'; id: string }
  | { op: 'wallet/restoreVersion'; id: string; savedAt: number }
  /** A file taken off a login, a card, an address or a note; it is deleted in the account at the next sync. In a shared vault, an organiser's. */
  | { op: 'file/detach'; id: string; fileId: string }
  | { op: 'trash/empty' };

/**
 * Pages describe a change; whatever holds the vault applies it inside its
 * serialised turn, seals and stores or sends the result, and tells every page.
 */
export type Mutation =
  | ItemMutation
  /** What a file from another manager held: its logins with their passkeys, passkeys for logins already here, its cards, addresses and notes. */
  | { op: 'import'; logins: ImportedLogin[]; passkeys: PasskeyFor[]; wallet: WalletDraft[] }
  /** A folder renamed, or taken away with `to` empty: what was in it stays. */
  | { op: 'folder/rename'; from: string; to: string }
  /** A change to a family's shared vault, as `ItemMutation` is to the vault's own; emptying its trash, or one item out of it, is an organiser's. */
  | { op: 'family/change'; place: VaultPlace; change: ItemMutation }
  /** An item of the vault's own moved into a shared vault, which takes it under a new id. */
  | { op: 'family/move'; id: string; place: VaultPlace }
  /** Its owner has read that someone is no longer in the family. */
  | { op: 'family/departureRead'; orgId: string; accountId: string }
  | { op: 'settings/update'; patch: Partial<VaultSettings> }
  | { op: 'neverSave/remove'; site: string }
  /** Its owner has put the recovery key away. */
  | { op: 'recovery/saved' }
  /** Its owner has put the account's recovery key away. */
  | { op: 'account/kitSaved' };

/**
 * The vault after a change. `plan`: what the server last named for the
 * vault's account — whether an edit keeps a version, and whether one may be
 * restored. A vault this account may only view refuses every change,
 * whatever the page sent.
 */
export function applyMutation(data: VaultData, mutation: Mutation, plan: Plan, now = Date.now()): VaultData {
  switch (mutation.op) {
    case 'import':
      return mutation.wallet.reduce((next, draft) => addWalletItem(next, draft).data, importLogins(data, mutation.logins, mutation.passkeys));
    case 'folder/rename':
      return renameFolder(data, mutation.from, mutation.to);
    case 'family/change':
      return applyFamilyChange(data, mutation.place, mutation.change, plan, now);
    case 'family/move':
      if (familyVault(data, mutation.place).vault.viewOnly) throw new PassholdError('viewOnly');
      return moveToFamily(data, mutation.id, mutation.place).data;
    case 'family/departureRead':
      return readDeparture(data, mutation.orgId, mutation.accountId);
    case 'settings/update':
      return updateSettings(data, mutation.patch);
    case 'neverSave/remove':
      return removeNeverSave(data, mutation.site);
    case 'recovery/saved':
      return setRecoveryKeyPending(data, false);
    case 'account/kitSaved':
      return data.account?.kit ? { ...data, account: { ...data.account, kit: { ...data.account.kit, pending: false } } } : data;
    default:
      return applyItemMutation(data, mutation, plan, now);
  }
}

/** A change to the items of one place, the vault's own or a shared vault in it: the same rules for both. */
export function applyItemMutation<T extends Items>(data: T, mutation: ItemMutation, plan: Plan, now = Date.now()): T {
  const options = editOptions(plan);
  switch (mutation.op) {
    case 'login/add':
      return addLogin(data, mutation.draft).data;
    case 'login/update':
      return updateLogin(data, mutation.id, mutation.draft, now, options);
    case 'login/restoreVersion':
      if (!planAllows(plan, 'versions')) throw new PassholdError('notOnPlan');
      return restoreLoginVersion(data, mutation.id, mutation.savedAt, now, options);
    case 'login/favorite':
      return setFavorite(data, mutation.id, mutation.favorite);
    case 'login/trash':
      return trashLogin(data, mutation.id);
    case 'login/restore':
      return restoreLogin(data, mutation.id);
    case 'login/purge':
      return purgeLogin(data, mutation.id);
    case 'wallet/add':
      return addWalletItem(data, mutation.draft).data;
    case 'wallet/update':
      return updateWalletItem(data, mutation.id, mutation.draft, now, options);
    case 'wallet/restoreVersion':
      if (!planAllows(plan, 'versions')) throw new PassholdError('notOnPlan');
      return restoreWalletVersion(data, mutation.id, mutation.savedAt, now, options);
    case 'wallet/favorite':
      return setWalletFavorite(data, mutation.id, mutation.favorite);
    case 'wallet/trash':
      return trashWalletItem(data, mutation.id);
    case 'wallet/restore':
      return restoreWalletItem(data, mutation.id);
    case 'wallet/purge':
      return purgeWalletItem(data, mutation.id);
    case 'file/detach':
      return detachFile(data, mutation.id, mutation.fileId);
    case 'trash/empty':
      return emptyTrash(data);
  }
}

/** Versions are kept of what is edited on a plan that holds them; those kept stay when it no longer does. */
const editOptions = (plan: Plan) => ({ versions: planAllows(plan, 'versions') });

/** In a shared vault, destroying is an organiser's: its trash emptied, or one item out of it. */
function applyFamilyChange(data: VaultData, place: VaultPlace, change: ItemMutation, plan: Plan, now: number): VaultData {
  // A vault this account may only view: filled and copied from, never changed (`FamilyCollection.canEdit`).
  if (familyVault(data, place).vault.viewOnly) throw new PassholdError('viewOnly');
  if (change.op === 'trash/empty') return emptyFamilyTrash(data, place);
  if (change.op === 'login/purge' || change.op === 'wallet/purge') return purgeFromFamily(data, place, change.id);
  // A file taken off is deleted in the family's store for everyone in it: an organiser's, as a purge is.
  if (change.op === 'file/detach' && familyVault(data, place).family.role !== 'owner') throw new PassholdError('familyOrganiserOnly');
  return inFamilyVault(data, place, (vault) => applyItemMutation(vault, change, plan, now));
}

const withoutPrivateKey = (item: LoginItem): LoginItem => withoutFileKeys(item.passkey ? { ...item, passkey: { ...item.passkey, privateKey: '' } } : item);

/**
 * The open vault as pages are handed it. They are not handed what they have
 * no use for: the recovery key (shown only with proof), the account's key and
 * session, websites' passkeys' private keys — only what holds the vault signs
 * — and the keys of files, of which a page is handed the one it opens.
 */
export function pageView(data: VaultData): VaultData {
  return {
    ...data,
    items: data.items.map(withoutPrivateKey),
    wallet: data.wallet.map(withoutFileKeys),
    recoveryKey: null,
    account: null,
    // A shared vault's passkeys likewise; its pin and what was sent of it are the holder's business.
    families: data.families.map((family) => ({
      ...family,
      pin: null,
      vaults: family.vaults.map((entry) => ({ ...entry, known: {}, items: entry.items.map(withoutPrivateKey), wallet: entry.wallet.map(withoutFileKeys) })),
    })),
  };
}

/** What a page holds in place of a hidden value it has not shown or copied: plainly not the value. */
export const HIDDEN = '••••••••';

/** A hidden value of an item, as a page names it to have it shown or copied. */
export type Secret =
  | { kind: 'password' }
  /** One of the login's earlier passwords, by its place in the history. */
  | { kind: 'history'; index: number }
  /** One of the item's own fields, by its place. */
  | { kind: 'field'; index: number }
  | { kind: 'number' }
  | { kind: 'code' }
  | { kind: 'privateKey' }
  /** An API key's secret. */
  | { kind: 'key' };

const hide = (value: string) => (value ? HIDDEN : '');
const hideFields = <T extends { fields?: CustomField[] }>(item: T): T => (item.fields ? { ...item, fields: item.fields.map((field) => (field.hidden ? { ...field, value: hide(field.value) } : field)) } : item);

/** An API key with its last four characters, which tell two keys apart in a list as a card's last digits do. */
const maskedKey = (key: string) => (key.length >= 16 ? `${'•'.repeat(key.length - 4)}${key.slice(-4)}` : hide(key));

/** A card's number with the digits that name its network and the last four, as a receipt prints it. */
function maskedNumber(number: string): string {
  return number.length > 10 ? `${number.slice(0, 6)}${'•'.repeat(number.length - 10)}${number.slice(-4)}` : hide(number);
}

function hideDraft<T extends LoginDraft | WalletDraft>(draft: T): T {
  const fields = hideFields(draft as T & { fields?: CustomField[] });
  if ('password' in fields) return { ...fields, password: hide(fields.password) };
  if ('number' in fields) return { ...fields, number: maskedNumber(fields.number), code: hide(fields.code) };
  if ('privateKey' in fields) return { ...fields, privateKey: hide(fields.privateKey) };
  if ('key' in fields && 'service' in fields) return { ...fields, key: maskedKey(fields.key) };
  return fields;
}

const hideVersions = <T extends { versions?: ItemVersion<LoginDraft | WalletDraft>[] }>(item: T): T => (item.versions ? { ...item, versions: item.versions.map((version) => ({ ...version, draft: hideDraft(version.draft) })) } : item);

function hiddenLogin(item: LoginItem): LoginItem {
  return hideVersions(hideFields({ ...item, password: hide(item.password), history: item.history.map((entry) => ({ ...entry, password: hide(entry.password) })) }));
}

function hiddenWalletItem(item: WalletItem): WalletItem {
  const shown = hideVersions(hideFields(item));
  if (shown.kind === 'card') return { ...shown, number: maskedNumber(shown.number), code: hide(shown.code) };
  if (shown.kind === 'ssh') return { ...shown, privateKey: hide(shown.privateKey) };
  // An API key keeps the keys it replaced, as a login its passwords.
  if (shown.kind === 'apikey') return { ...shown, key: maskedKey(shown.key), history: shown.history.map((entry) => ({ ...entry, password: hide(entry.password) })) };
  return shown;
}

/**
 * The open vault as the web vault's screens are handed it (`pageView`, and
 * more): every hidden value — a password and those it replaced, a hidden
 * field, a card's number and code, an SSH key's private half, an API key and
 * the keys it replaced, and each of
 * them in an item's versions — stands as `HIDDEN` until it is shown or
 * copied (`hiddenValue`). A card keeps the digits that name its network and its
 * last four. What a page never held, it cannot leave behind after a lock.
 */
export function hideSecrets(data: VaultData): VaultData {
  const items = (held: Items) => ({ items: held.items.map(hiddenLogin), wallet: held.wallet.map(hiddenWalletItem) });
  return {
    ...data,
    ...items(data),
    families: data.families.map((family) => ({ ...family, vaults: family.vaults.map((vault) => ({ ...vault, ...items(vault) })) })),
  };
}

/** The item a page names, in the vault's own or a shared vault, live or in a trash. */
export function anyItem(data: VaultData, id: string): LoginItem | WalletItem | undefined {
  for (const held of [data, ...data.families.flatMap((family) => family.vaults)]) {
    const found = held.items.find((item) => item.id === id) ?? held.wallet.find((item) => item.id === id);
    if (found) return found;
  }
  return undefined;
}

/** One hidden value, for the page that shows or copies it now; null where the item holds no such value. */
export function hiddenValue(item: LoginItem | WalletItem, secret: Secret): string | null {
  const text = (value: unknown) => (typeof value === 'string' && value ? value : null);
  switch (secret?.kind) {
    case 'password':
      return 'password' in item && 'history' in item ? text(item.password) : null;
    case 'history':
      return 'history' in item ? text(item.history[secret.index]?.password) : null;
    case 'field': {
      const field = item.fields[secret.index];
      return field?.hidden ? text(field.value) : null;
    }
    case 'number':
      return 'kind' in item && item.kind === 'card' ? text(item.number) : null;
    case 'code':
      return 'kind' in item && item.kind === 'card' ? text(item.code) : null;
    case 'privateKey':
      return 'kind' in item && item.kind === 'ssh' ? text(item.privateKey) : null;
    case 'key':
      return 'kind' in item && item.kind === 'apikey' ? text(item.key) : null;
    default:
      return null;
  }
}
