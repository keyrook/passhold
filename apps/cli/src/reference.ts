/**
 * `passhold://vault/item/field`: one value in the vault, named so a script or
 * a file can say where a secret is without holding it. `passhold run` and
 * `passhold inject` put the value where the reference stands, and only in
 * the process or the output they are asked for.
 *
 * Each part is percent-decoded, so a name with a slash or a space can be
 * written. The vault's own is `personal`; a family's shared vault is named by
 * its name, or by its id where another vault has the same name. An item is
 * named by its id or by its name, which must then be the only one so named.
 */
import { cardExpiry, dayText, walletTitle, type LoginItem, type VaultData, type WalletItem } from '@passhold/core';

/** A refusal with a sentence for the terminal, and nothing of a secret in it. */
export class CliError extends Error {
  override readonly name = 'CliError';
}

export const SCHEME = 'passhold://';
/** The vault's own, in a reference. A family's shared vault is named by its own name. */
export const OWN_VAULT = 'personal';

export interface Reference {
  vault: string;
  item: string;
  field: string;
}

export type Item = LoginItem | WalletItem;

/** A vault a command may name: the vault's own, or one a family shares with this account. */
export interface Vault {
  /** `personal`, or the shared vault's id in its family. */
  id: string;
  name: string;
  /** The family it is shared in; null for the vault's own. */
  orgId: string | null;
  family: string | null;
  /** This account may read it, never change it (`FamilyCollection.canEdit`). */
  viewOnly: boolean;
  /** Someone who left still holds its key: nothing is written to it until an organiser changes it. */
  keyDue: boolean;
  /** Everything it holds, the trash included. */
  items: Item[];
}

export function isReference(text: string): boolean {
  return text.startsWith(SCHEME);
}

function decoded(parts: string[], text: string): string[] {
  try {
    return parts.map((part) => decodeURIComponent(part).trim());
  } catch {
    throw new CliError(`That reference is not written as an address can be: ${text}`);
  }
}

export function parseReference(text: string): Reference {
  const parts = isReference(text) ? text.slice(SCHEME.length).split('/') : [];
  if (parts.length !== 3) throw new CliError(`A reference is ${SCHEME}vault/item/field: ${text}`);
  const [vault, item, field] = decoded(parts, text) as [string, string, string];
  if (!vault || !item || !field) throw new CliError(`A reference is ${SCHEME}vault/item/field: ${text}`);
  return { vault, item, field };
}

export const isLogin = (item: Item): item is LoginItem => !('kind' in item);

const same = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;

/** Every vault the data holds: the vault's own first, then each family's, as the families list them. */
export function vaultsOf(data: VaultData): Vault[] {
  const own: Vault = { id: OWN_VAULT, name: OWN_VAULT, orgId: null, family: null, viewOnly: false, keyDue: false, items: [...data.items, ...data.wallet] };
  const shared = data.families.flatMap((family) =>
    family.vaults.map(
      (vault): Vault => ({
        id: vault.id,
        name: vault.name,
        orgId: family.orgId,
        family: family.name,
        viewOnly: vault.viewOnly === true,
        keyDue: vault.keyDue,
        items: [...vault.items, ...vault.wallet],
      }),
    ),
  );
  return [own, ...shared];
}

/**
 * The vault a name stands for: `personal` is the vault's own whatever a
 * family calls a vault; any other, a shared vault by its id, or by a name
 * only one has — never the first of two, which could be another family's.
 */
export function vaultNamed(data: VaultData, wanted: string): Vault {
  const vaults = vaultsOf(data);
  if (same(wanted, OWN_VAULT)) return vaults[0]!;
  const shared = vaults.slice(1);
  const byId = shared.find((vault) => vault.id === wanted);
  if (byId) return byId;
  const named = shared.filter((vault) => same(vault.name, wanted));
  if (named.length === 1) return named[0]!;
  if (named.length > 1) throw new CliError(`${named.length} vaults are named "${wanted}". Use an id: ${named.map((vault) => `${vault.id} (${vault.family})`).join(', ')}`);
  const names = vaults.map((vault) => `"${vault.name}"`).join(', ');
  throw new CliError(`No vault named "${wanted}". This account has ${names}.`);
}

/** How a reference names a vault: by its name, or by its id where the name would stand for another. */
export function vaultWord(data: VaultData, vault: Vault): string {
  if (vault.orgId === null) return OWN_VAULT;
  try {
    return vaultNamed(data, vault.name).id === vault.id ? vault.name : vault.id;
  } catch {
    return vault.id;
  }
}

const live = (vault: Vault) => vault.items.filter((item) => item.deletedAt === null);

/** The live items of the vault a reference names. */
export function itemsOf(data: VaultData, vault: string): Item[] {
  return live(vaultNamed(data, vault));
}

/** What an item is called: its own name, or for a card or an address with none, what it holds. */
export function nameOf(item: Item): string {
  return isLogin(item) ? item.title || item.username : walletTitle(item);
}

/** A reference to an item's field, as `resolve` reads it back. */
export function referenceTo(item: Item, field: string, vault = OWN_VAULT): string {
  return `${SCHEME}${[vault, item.id, field].map(encodeURIComponent).join('/')}`;
}

/** One item and the vault it is in. */
export interface Found {
  vault: Vault;
  item: Item;
}

/** One of several, by id first, then by a name only one has: never the first of several. */
function pick(found: readonly Found[], wanted: string, word: (vault: Vault) => string): Found {
  const byId = found.find(({ item }) => item.id === wanted);
  if (byId) return byId;
  const named = found.filter(({ item }) => same(nameOf(item), wanted));
  if (named.length === 1) return named[0]!;
  if (!named.length) throw new CliError(`Nothing is named "${wanted}".`);
  throw new CliError(`${named.length} items are named "${wanted}". Name one: ${named.map(({ vault, item }) => `${SCHEME}${encodeURIComponent(word(vault))}/${item.id}`).join(', ')}`);
}

/** One item of a list, by its id or by its name. */
export function findItem(items: readonly Item[], wanted: string): Item {
  const vault: Vault = { id: OWN_VAULT, name: OWN_VAULT, orgId: null, family: null, viewOnly: false, keyDue: false, items: [...items] };
  return pick(items.map((item) => ({ vault, item })), wanted, () => OWN_VAULT).item;
}

/**
 * The item a command names, and where it is: `passhold://vault/item`, a
 * field after it passed over; or an id or a name, looked for in every vault,
 * which only one item may then have. `trash`: what is in the trash instead,
 * for `restore`.
 */
export function locate(data: VaultData, target: string, trash = false): Found {
  const wanted = (vault: Vault) => vault.items.filter((item) => (item.deletedAt !== null) === trash).map((item) => ({ vault, item }));
  const word = (vault: Vault) => vaultWord(data, vault);
  if (!isReference(target)) return pick(vaultsOf(data).flatMap(wanted), target, word);
  const parts = target.slice(SCHEME.length).split('/');
  if (parts.length < 2 || parts.length > 3) throw new CliError(`An item is ${SCHEME}vault/item: ${target}`);
  const [vault, item] = decoded(parts, target) as [string, string];
  if (!vault || !item) throw new CliError(`An item is ${SCHEME}vault/item: ${target}`);
  return pick(wanted(vaultNamed(data, vault)), item, word);
}

/** The item a command names, wherever it is. */
export function itemNamed(data: VaultData, target: string): Item {
  return locate(data, target).item;
}

/** The fields each kind has, by the names a reference uses for them. */
function ownFields(item: Item): Record<string, string> {
  if (isLogin(item)) {
    return { title: item.title, username: item.username, password: item.password, url: item.urls[0] ?? '', urls: item.urls.join('\n'), notes: item.notes };
  }
  switch (item.kind) {
    case 'card':
      return {
        title: item.title,
        holder: item.holder,
        number: item.number,
        code: item.code,
        expiry: cardExpiry(item),
        exp_month: item.expMonth === null ? '' : String(item.expMonth).padStart(2, '0'),
        exp_year: item.expYear === null ? '' : String(item.expYear),
        notes: item.notes,
      };
    case 'address':
      return {
        title: item.title,
        name: item.name,
        organization: item.organization,
        street: item.street,
        city: item.city,
        region: item.region,
        postal_code: item.postalCode,
        country: item.country,
        phone: item.phone,
        email: item.email,
        notes: item.notes,
      };
    case 'note':
      return { title: item.title, text: item.text };
    case 'ssh':
      return { title: item.title, private_key: item.privateKey, public_key: item.publicKey, fingerprint: item.fingerprint, notes: item.notes };
    case 'apikey':
      // `key` is the secret, as the item names it; `secret` is the same, for whoever thinks of it by that word.
      return {
        title: item.title,
        key: item.key,
        secret: item.key,
        key_id: item.keyId,
        service: item.service,
        host: item.hosts[0] ?? '',
        hosts: item.hosts.join('\n'),
        send_as: item.sendAs,
        env: item.env,
        environment: item.environment,
        scopes: item.scopes,
        issued: dayText(item.issuedAt),
        expires: dayText(item.expiresAt),
        notes: item.notes,
      };
  }
}

/** A field's name as a reference writes it: `Postal code`, `postal-code` and `postal_code` are one. */
export const fieldKey = (field: string) => field.toLowerCase().trim().replace(/[\s-]+/g, '_');

/** The names a reference may use for an item's fields: its kind's, then its own. */
export function fieldNames(item: Item): string[] {
  return [...Object.keys(ownFields(item)), ...item.fields.map((field) => field.name)];
}

/** Whether a name is one of the fields every item of that kind has, rather than one of the item's own. */
export function isOwnField(item: Item, field: string): boolean {
  return fieldKey(field) in ownFields(item);
}

/** What `get` gives when no field is asked for: what the item is kept for. */
export function mainField(item: Item): string {
  if (isLogin(item)) return 'password';
  return { card: 'number', address: 'street', note: 'text', ssh: 'public_key', apikey: 'key' }[item.kind];
}

/** One field's value: the kind's own by its name, or a field of the item's own by the name its owner gave it. */
export function fieldOf(item: Item, field: string): string {
  const own = ownFields(item);
  const key = fieldKey(field);
  if (key in own) return own[key]!;
  const custom = item.fields.filter((entry) => same(entry.name, field));
  if (custom.length === 1) return custom[0]!.value;
  if (custom.length > 1) throw new CliError(`"${nameOf(item)}" has ${custom.length} fields named "${field}".`);
  throw new CliError(`"${nameOf(item)}" has no field "${field}". It has: ${fieldNames(item).join(', ')}`);
}

/** The value a reference stands for. */
export function resolve(data: VaultData, reference: Reference | string): string {
  const { vault, item, field } = typeof reference === 'string' ? parseReference(reference) : reference;
  const named = vaultNamed(data, vault);
  return fieldOf(pick(live(named).map((entry) => ({ vault: named, item: entry })), item, (vault) => vaultWord(data, vault)).item, field);
}
