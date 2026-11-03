import type { SealedBox } from '../crypto/aead.js';
import type { KdfParams } from '../crypto/kdf.js';
import type { GeneratorOptions } from '../generator.js';
import { DEFAULT_GENERATOR } from '../generator.js';

export const VAULT_FORMAT = 'passhold.vault';
export const VAULT_FILE_VERSION = 1;
export const VAULT_SCHEMA_VERSION = 1;

/** How many earlier passwords a login keeps, so a mistaken update can be undone. */
export const HISTORY_LIMIT = 5;

/**
 * Bounds on what one login may hold. They keep a pasted novel or a hostile
 * import from making every seal of the vault slow; nothing a person types
 * comes near them.
 */
export const LIMITS = {
  title: 200,
  username: 1_000,
  password: 10_000,
  notes: 100_000,
  url: 2_048,
  urls: 20,
  folder: 100,
  /** A family's shared vault: its collection's name, which the account takes up to 128 characters. */
  vaultName: 128,
  fieldName: 200,
  fieldValue: 10_000,
  fields: 50,
} as const;

/**
 * A line of its owner's own on an item: a security question's answer, a PIN,
 * an account number — what a login or a card has no place for.
 */
export interface CustomField {
  name: string;
  value: string;
  /** Kept out of sight until asked for, as a password is: a PIN, an answer. */
  hidden: boolean;
}

/**
 * A website's passkey, kept in the login for that account. Its private key
 * never leaves the service worker: pages learn that a login has a passkey,
 * for which site and which account, and the site gets only what it signs.
 */
export interface StoredPasskey {
  /** The credential's id, base64url, as the site knows it. */
  credentialId: string;
  /** The site it signs for — WebAuthn's relying party id: a host, never a URL. */
  rpId: string;
  /** The site's name for itself, as it gave it. */
  rpName: string;
  /** The site's own id for the account, base64url. */
  userHandle: string;
  userName: string;
  userDisplayName: string;
  /** The P-256 private key, PKCS#8, base64. */
  privateKey: string;
  createdAt: number;
}

export interface PasswordChange {
  password: string;
  changedAt: number;
}

/** One saved sign-in. */
export interface LoginItem {
  id: string;
  title: string;
  username: string;
  password: string;
  /** Where it is used, as saved: full URLs, matched by site (see match.ts). */
  urls: string[];
  notes: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  passwordChangedAt: number;
  lastUsedAt: number | null;
  /** In the trash since then; null while live. Only the owner empties the trash. */
  deletedAt: number | null;
  /** Earlier passwords, newest first. */
  history: PasswordChange[];
  /** The site's passkey for this account, or null. */
  passkey: StoredPasskey | null;
  /** The folder it is filed in, by name; '' for none. */
  folder: string;
  fields: CustomField[];
}

/**
 * The fields a person edits; everything else the vault keeps itself. A folder
 * or fields left out of an edit stay as they were: a password saved from a
 * page changes the password alone.
 */
export type LoginDraft = Pick<LoginItem, 'title' | 'username' | 'password' | 'urls' | 'notes'> & {
  favorite?: boolean;
  folder?: string;
  fields?: CustomField[];
};

/** A login from another manager's file, with the website's passkey it held, if any. */
export type ImportedLogin = LoginDraft & { passkey?: StoredPasskey };

/** A passkey from another manager's file, for a login the vault already has. */
export interface PasskeyFor {
  id: string;
  passkey: StoredPasskey;
}

/**
 * What Passhold keeps besides logins: payment cards, addresses and notes —
 * the wallet. None belongs to a site, so none is offered by site: a card or
 * an address is filled where its owner chooses it, and a note never.
 */
interface WalletBase {
  id: string;
  /** Its owner's name for it; left empty, pages name it from what it holds. */
  title: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number | null;
  /** In the trash since then; null while live. Only the owner empties the trash. */
  deletedAt: number | null;
  /** The folder it is filed in, by name; '' for none. Logins and the wallet share folders. */
  folder: string;
  fields: CustomField[];
}

export interface CardItem extends WalletBase {
  kind: 'card';
  /** The name on the card. */
  holder: string;
  /** Digits only. */
  number: string;
  /** 1–12, or null when not given. */
  expMonth: number | null;
  /** Four digits, or null when not given. */
  expYear: number | null;
  /** The security code on the back (CVC, CVV), digits only. */
  code: string;
  notes: string;
}

export interface AddressItem extends WalletBase {
  kind: 'address';
  /** The full name, as its owner writes it. */
  name: string;
  organization: string;
  /** The street address, one line per line. */
  street: string;
  city: string;
  /** State, province or region. */
  region: string;
  postalCode: string;
  /** ISO 3166-1 alpha-2, upper case; empty when not given. */
  country: string;
  phone: string;
  email: string;
  notes: string;
}

export interface NoteItem extends WalletBase {
  kind: 'note';
  text: string;
}

export type WalletItem = CardItem | AddressItem | NoteItem;
export type WalletKind = WalletItem['kind'];

type Editable<T extends WalletItem> = Omit<T, 'id' | 'favorite' | 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'deletedAt' | 'folder' | 'fields'> & {
  favorite?: boolean;
  /** Left out of an edit, the item keeps its own: a checkout saved over a card changes what the checkout sent. */
  folder?: string;
  fields?: CustomField[];
};
export type CardDraft = Editable<CardItem>;
export type AddressDraft = Editable<AddressItem>;
export type NoteDraft = Editable<NoteItem>;
/** The fields a person edits, by kind; everything else the vault keeps itself. */
export type WalletDraft = CardDraft | AddressDraft | NoteDraft;

export interface VaultSettings {
  /** Lock after this many minutes without use. 0: only when the browser closes. */
  autoLockMinutes: number;
  /** Lock when the computer locks or sleeps. */
  lockWithSystem: boolean;
  /** Clear a copied password from the clipboard after this many seconds. 0: never. */
  clearClipboardSeconds: number;
  /** Show the Passhold button in sign-in fields. */
  inlineButton: boolean;
  /** Offer to save a sign-in after a form is sent. */
  offerToSave: boolean;
  /** Offer to save a card or an address after a checkout is sent. */
  offerToSaveCards: boolean;
  /** Open the list by itself when a sign-in field is clicked and there is something to offer. */
  autoSuggest: boolean;
  /** Save websites' passkeys in Passhold and sign in with them, rather than leave them to the browser. */
  passkeys: boolean;
  generator: GeneratorOptions;
}

export const DEFAULT_SETTINGS: VaultSettings = {
  autoLockMinutes: 15,
  lockWithSystem: true,
  clearClipboardSeconds: 30,
  inlineButton: true,
  offerToSave: true,
  offerToSaveCards: true,
  autoSuggest: true,
  passkeys: true,
  generator: DEFAULT_GENERATOR,
};

export const AUTO_LOCK_CHOICES = [1, 5, 15, 30, 60, 240, 0] as const;
export const CLIPBOARD_CHOICES = [15, 30, 60, 120, 0] as const;

/** What this device knows of a login's record in the account: the revision it last saw, and what the login was then. */
export interface KnownRecord {
  rev: number;
  /** SHA-256 of the login as it was synced, so any change to it — a favourite, a trash — is seen. */
  sig: string;
  /**
   * `wallet` for a card, an address or a note (account/sync.ts,
   * WALLET_KIND); absent for a login. Kept so that once the item is gone
   * here, its deletion goes up as the kind of record it was.
   */
  kind?: 'wallet';
}

/**
 * This vault's link to a Keyrook account, sealed with everything else:
 * Passhold's key and the session's tokens are as sensitive as anything here,
 * and sync runs only while the vault is open.
 */
export interface AccountLink {
  /**
   * The account's address, as the last sign-in or sync said: it may move on
   * account.keyrook.com. Who the account is, is `accountId`, never this.
   */
  email: string;
  /**
   * The name its owner gave the account on account.keyrook.com, as the last
   * sign-in or sync said; null for none. The server's word: shown as text, and never
   * taken as a sign of who anyone is.
   */
  name: string | null;
  /**
   * The id this browser signed in under last, drawn anew at each sign-in
   * (`newId()`) and never used again: a removal's proof names it, so one made
   * for an earlier session never names this one (`removalProved`).
   */
  deviceId: string;
  /**
   * The account's id on the server, which Passhold's box, pin and pairings are
   * bound to. Null, with `productKey`, for a link made before each Keyrook
   * product had a key of its own: it is signed out, and signs in again.
   */
  accountId: string | null;
  /** Passhold's own key in the account, raw, base64 (@keyrook/account's `ProductKey`). */
  productKey: string | null;
  /**
   * Passhold's key before it was replaced — the recovery key leaked, and the
   * server asked for a new one — held until every record is sealed again
   * under the new key and pushed, then dropped. Until then a record sealed
   * under it still opens here. Null the rest of the time.
   */
  previousKey: string | null;
  /**
   * The account's root this vault last saw Passhold's key sealed to: passed
   * back as `pinned`, so a server that hides or swaps the root is caught. The
   * root's private half is never kept.
   */
  root: string | null;
  keyGeneration: number;
  rootGeneration: number;
  /**
   * When the recovery key was last seen to open the root, as Passhold's pin
   * says: made or typed in a Passhold browser, or on account.keyrook.com.
   * Null: never, and the settings ask for it once.
   */
  sheetVerifiedAt: number | null;
  /** Null once the server has signed this browser out: signing in again resumes. */
  tokens: { accessToken: string; refreshToken: string } | null;
  serverRev: number;
  /** Names the server's history; a new one means it was restored, and everything is sent again. */
  epoch: string | null;
  known: Record<string, KnownRecord>;
  lastSyncAt: number | null;
  /** The account's recovery kit as this vault last saw it; null when the account has none. */
  kit: AccountKitLink | null;
  /**
   * A start over asked for with the email alone, as the server last said: it
   * takes effect at `executesAt` unless a browser still signed in cancels it.
   * Null: none waiting. Kept past the day it happens, so a browser the server
   * then signs out can say why.
   */
  pendingStartOver: PendingStartOver | null;
  /**
   * When this browser was removed from the account, by a proof Passhold's key
   * checked (`removalProved`): what the account held was taken off then
   * (`removedFromAccount`). Said until its owner closes it, signed in again
   * or not. Null: never, or closed.
   */
  removedAt: number | null;
  /**
   * How the account signs in: with its password, or with Google or GitHub —
   * an account with no password, whose key reaches a new browser only by
   * approval from one already in, or by the recovery key.
   */
  provider: SignInProvider | null;
  /**
   * The account has no password: it signs in with Google or GitHub. Known
   * where `provider` is not — signed in with one of its passkeys, which says
   * only that.
   */
  passwordless: boolean;
  /**
   * The passkey this vault knows holds Passhold's key for new computers
   * (`account/passkey.ts`), by credential id; null when none is known here.
   * On a link from before keys per product, the passkey whose record holds
   * the old shared key, to be taken down once signed in again.
   */
  passkey: string | null;
}

export type SignInProvider = 'google' | 'github';

/**
 * A start over waiting a week. `deviceName` is what the asking device called
 * itself: whoever asked chose it, so it is shown as their words, never as fact.
 */
export interface PendingStartOver {
  requestedAt: number;
  executesAt: number;
  deviceName: string;
}

export interface AccountKitLink {
  /** When the kit was made: a newer one, from any device, retires it. */
  issuedAt: number;
  /**
   * Its key, when it was made or used here — kept sealed, as the vault's own
   * recovery key is, so its owner can see it again. Null when another app
   * made it: the key is on that app's sheet, not here.
   */
  key: string | null;
  /** The key was shown and not yet said to be put away. */
  pending: boolean;
}

/** What the payload holds once opened. Never written anywhere unsealed. */
export interface VaultData {
  schemaVersion: number;
  items: LoginItem[];
  /** Cards, addresses and notes. Their ids never repeat a login's: in the account, both are records of Passhold's. */
  wallet: WalletItem[];
  settings: VaultSettings;
  /** Sites (registrable domains) the owner said never to offer saving on. */
  neverSave: string[];
  /** When the last backup was made from this vault, so its owner can see one is due. */
  lastBackupAt: number | null;
  /**
   * The PIN that unlocks this vault while the browser stays open, or null.
   * Sealed with everything else; see vault/pin.ts for why it is kept at all.
   */
  pin: string | null;
  /** A recovery key was drawn and its owner has not yet said it is put away. */
  recoveryKeyPending: boolean;
  /**
   * The recovery key of a vault with no master password, sealed with
   * everything else so its owner can see it again — with proof — while the
   * vault still opens. Null for a vault with a master password.
   */
  recoveryKey: string | null;
  /** The Keyrook account this vault syncs with, or null. */
  account: AccountLink | null;
  /** The families of that account that share a vault in Passhold; none while families are not offered. */
  families: FamilyLink[];
}

/** What holds logins, cards, addresses and notes: the vault itself, or a family's shared vault in it. */
export type Items = Pick<VaultData, 'items' | 'wallet'>;

/**
 * A family's shared vault, as this device holds it: one of the family's
 * collections whose product is Passhold. Its items are kept here, sealed with
 * everything else, so they fill offline as the vault's own do; its records
 * are the family's, sealed under the collection's key and synced with the
 * family, never with the account's own.
 */
export interface FamilyVault extends Items {
  /** The collection's id in the family. */
  id: string;
  /** Its name, as it opened under its key: the server never learns it. */
  name: string;
  /** The generation of its key in use when this device last opened it: what a new revision is sealed under. */
  generation: number;
  /** Someone who left the family still holds its key: what is changed here waits, unsent, until an organiser changes it. */
  keyDue: boolean;
  /** What this device knows of each of its records, as `AccountLink.known` does of the vault's own. */
  known: Record<string, KnownRecord>;
}

/** Someone in a family, as its roster lists them. */
export interface FamilyMember {
  accountId: string;
  /** The server's word, shown as text: who someone is, is their member key in the pinned roster. */
  email: string;
  name: string | null;
  role: 'owner' | 'member';
  /** Their code was compared when they joined. */
  verified: boolean;
}

/**
 * Where this browser stands with a family: open; accepted, and waiting for an
 * organiser to confirm it; needing the account's password once, to take its
 * key to the family; or holding the family's key from someone not pinned, with
 * the code the two compare before it is taken.
 */
export type FamilyState =
  | { kind: 'open' }
  | { kind: 'waiting' }
  | { kind: 'needs-root' }
  | { kind: 'compare'; accountId: string; memberKey: string; code: string };

/** Someone a family's roster stopped listing, as this browser last knew them: `email` empty and `name` null where it never did. */
export interface FamilyDeparture {
  accountId: string;
  email: string;
  name: string | null;
}

/**
 * A family the account is in. It is made and run on account.keyrook.com;
 * Passhold keeps what it needs to share vaults in it, and to warn of a change
 * in who holds its keys.
 */
export interface FamilyLink {
  orgId: string;
  /** The family's name, which the server keeps in the clear: its word, shown as text. */
  name: string;
  /** This account's place in it. Only an organiser empties a shared vault's trash. */
  role: 'owner' | 'member';
  members: FamilyMember[];
  /**
   * The roster as this device last checked it, sealed under Passhold's key in
   * the account: an older roster, or a member key changed behind it, is
   * refused against it.
   */
  pin: SealedBox | null;
  /** People whose member key changed since this browser pinned theirs, and the key the roster lists now: warned of, and nothing of theirs taken, until a code is compared. */
  keyChanged: { accountId: string; memberKey: string }[];
  /**
   * Those gone since this browser last looked, until its owner has read so.
   * The flows name each once, and nothing names them after: a server that put
   * someone out is seen here or nowhere, for a start over leaves no key to
   * prove who went by their own hand.
   */
  left: FamilyDeparture[];
  state: FamilyState;
  /** Someone who held its keys has gone, and an organiser is yet to change them on the account page. */
  rotationDue: boolean;
  /** The family's own counter and its database's history, as `AccountLink.serverRev` and `epoch` are the account's. */
  serverRev: number;
  epoch: string | null;
  vaults: FamilyVault[];
}

/**
 * The vault as stored: plaintext JSON whose only sensitive fields are
 * `wrappedKey` and `payload`, both AES-256-GCM.
 */
/**
 * What the file opens with: a master password its owner chose, or a recovery
 * key Passhold drew for a vault that opens with the device instead.
 */
export type VaultSecret = 'password' | 'recoveryKey';

/** What a vault's password is called: see `VaultFile.passwordIs`. */
export type PasswordName = 'master' | 'account' | 'code';

export interface VaultFile {
  format: typeof VAULT_FORMAT;
  version: number;
  id: string;
  kdf: KdfParams;
  /**
   * Which of the two the key below is wrapped under; absent means a master
   * password. In the clear, and unauthenticated: it only decides which word a
   * page uses for what to type, and the wrong word opens nothing.
   */
  secret?: VaultSecret;
  /**
   * What the password typed for it is, for the words a page uses — and so
   * one password stays one: the Keyrook account's own (`account`), or a code
   * that opens Passhold on this computer only, for an account with no
   * password (`code`). Absent, a master password of the vault's own, as
   * before Passhold started with an account. In the clear, like `secret`.
   */
  passwordIs?: 'account' | 'code';
  /** The data key, wrapped by the key derived from the master password or the recovery key. */
  wrappedKey: SealedBox;
  payload: SealedBox;
  createdAt: number;
  updatedAt: number;
}

function isBox(value: unknown): value is SealedBox {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as SealedBox).iv === 'string' &&
    typeof (value as SealedBox).ct === 'string'
  );
}

/** The shape check run on whatever storage hands back, before anything trusts it. */
export function isVaultFile(value: unknown): value is VaultFile {
  if (typeof value !== 'object' || value === null) return false;
  const file = value as Partial<VaultFile>;
  return (
    file.format === VAULT_FORMAT &&
    typeof file.version === 'number' &&
    typeof file.id === 'string' &&
    typeof file.kdf === 'object' &&
    file.kdf !== null &&
    typeof file.kdf.algorithm === 'string' &&
    typeof file.kdf.iterations === 'number' &&
    typeof file.kdf.salt === 'string' &&
    isBox(file.wrappedKey) &&
    isBox(file.payload)
  );
}
