/**
 * A family's shared vaults, inside the vault: what changes them, and what
 * moves an item into one.
 *
 * A shared vault holds what the vault's own does, and is changed by the same
 * functions (items.ts, wallet.ts): a login keeps its history there, a deletion
 * goes to its trash. What differs is whose it is. Everyone in the family who
 * holds its key may change it, and anyone may restore from its trash; only an
 * organiser empties it, so nobody alone destroys what the others use.
 */
import { PassholdError } from '../errors.js';
import { newId } from '../util/id.js';
import { emptyTrash, purgeLogin } from './items.js';
import { purgeWalletItem } from './wallet.js';
import type { FamilyLink, FamilyVault, Items, LoginItem, VaultData, WalletItem } from './model.js';

/** Which shared vault: the family, and the collection in it. */
export interface VaultPlace {
  orgId: string;
  vaultId: string;
}

/** The family and the shared vault a place names, or `itemNotFound`: one the family no longer lists is gone. */
export function familyVault(data: VaultData, place: VaultPlace): { family: FamilyLink; vault: FamilyVault } {
  const family = data.families.find((entry) => entry.orgId === place.orgId);
  const vault = family?.vaults.find((entry) => entry.id === place.vaultId);
  if (!family || !vault) throw new PassholdError('itemNotFound');
  return { family, vault };
}

/** The vault with one shared vault changed by `change`, which may be any of the item functions. */
export function inFamilyVault(data: VaultData, place: VaultPlace, change: (vault: FamilyVault) => FamilyVault): VaultData {
  const { vault } = familyVault(data, place);
  const next = change(vault);
  return {
    ...data,
    families: data.families.map((family) =>
      family.orgId === place.orgId ? { ...family, vaults: family.vaults.map((entry) => (entry.id === vault.id ? next : entry)) } : family,
    ),
  };
}

/** Its trash emptied, by an organiser only: the others in the family restore from it, and lose nothing to one person. */
export function emptyFamilyTrash(data: VaultData, place: VaultPlace): VaultData {
  organiserOnly(data, place);
  return inFamilyVault(data, place, emptyTrash);
}

/** One item out of its trash for good: by an organiser only, as the whole trash, or the rule would go one item at a time. */
export function purgeFromFamily(data: VaultData, place: VaultPlace, id: string): VaultData {
  organiserOnly(data, place);
  return inFamilyVault(data, place, (vault) =>
    vault.items.some((item) => item.id === id) ? purgeLogin(vault, id) : purgeWalletItem(vault, id),
  );
}

/** Someone gone, as this browser's owner has now read: told again only if they come back and go again. */
export function readDeparture(data: VaultData, orgId: string, accountId: string): VaultData {
  return {
    ...data,
    families: data.families.map((family) => (family.orgId === orgId ? { ...family, left: family.left.filter((person) => person.accountId !== accountId) } : family)),
  };
}

function organiserOnly(data: VaultData, place: VaultPlace): void {
  if (familyVault(data, place).family.role !== 'owner') throw new PassholdError('familyOrganiserOnly');
}

/**
 * The vault's own items with every shared vault's beside them, to offer and
 * fill on a page: read only. An id the vault's own already holds is its own;
 * a shared one under it is left out rather than shown twice.
 */
export function everyItem(data: VaultData): VaultData {
  const own = new Set([...data.items, ...data.wallet].map((item) => item.id));
  const shared = data.families.flatMap((family) => family.vaults);
  return {
    ...data,
    items: [...data.items, ...shared.flatMap((vault) => vault.items).filter((item) => !own.has(item.id))],
    wallet: [...data.wallet, ...shared.flatMap((vault) => vault.wallet).filter((item) => !own.has(item.id))],
  };
}

/** Where the item with that id is: the vault's own (null), or the shared vault holding it. */
export function placeOf(data: VaultData, id: string): VaultPlace | null | undefined {
  if ([...data.items, ...data.wallet].some((item) => item.id === id)) return null;
  for (const family of data.families) {
    for (const vault of family.vaults) {
      if ([...vault.items, ...vault.wallet].some((item) => item.id === id)) return { orgId: family.orgId, vaultId: vault.id };
    }
  }
  return undefined;
}

/** `change` applied where the item with that id is; the vault as it was for one that is nowhere. */
export function whereItemIs(data: VaultData, id: string, change: <T extends Items>(items: T) => T): VaultData {
  const place = placeOf(data, id);
  if (place === undefined) return data;
  return place === null ? change(data) : inFamilyVault(data, place, change);
}

/**
 * A login, a card, an address or a note of the vault's own, moved into a
 * shared vault: it leaves the vault — two copies would drift apart — and
 * arrives as a new item, under a new id, as the family's.
 *
 * Its earlier passwords stay behind, gone with it from the vault: they may be
 * passwords still used elsewhere, and sharing a login shares what it is now,
 * not what it was. So does its folder, which is its owner's own way of
 * filing. Its passkey, notes and fields go with it: they are the login.
 */
export function moveToFamily(data: VaultData, id: string, place: VaultPlace, now = Date.now()): { data: VaultData; id: string } {
  familyVault(data, place);
  const login = data.items.find((item) => item.id === id);
  const walletItem = login ? undefined : data.wallet.find((item) => item.id === id);
  const item = login ?? walletItem;
  if (!item) throw new PassholdError('itemNotFound');
  // From the trash it would arrive in the family's trash, where nobody looks for it.
  if (item.deletedAt !== null) throw new PassholdError('itemInvalid');
  const moved = { ...item, id: newId(), folder: '', updatedAt: now };
  const without = { ...data, items: data.items.filter((entry) => entry.id !== id), wallet: data.wallet.filter((entry) => entry.id !== id) };
  const next = inFamilyVault(without, place, (vault) =>
    login
      ? { ...vault, items: [...vault.items, { ...(moved as LoginItem), history: [] }] }
      : { ...vault, wallet: [...vault.wallet, moved as WalletItem] },
  );
  return { data: next, id: moved.id };
}
