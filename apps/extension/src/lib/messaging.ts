import type { AccountPasskeyAnswer, AccountPasskeyOptions, CardNetwork, DeviceCredential, ImportedLogin, LoginDraft, PasskeyFor, PasswordName, SignInProvider, VaultData, VaultSecret, VaultPlace, VaultSettings, WalletDraft } from '@passhold/core';
import type { Values } from '../i18n/format.js';
import type { MessageKey } from '../i18n/locales/en.js';

/**
 * Two kinds of caller talk to the service worker, and they are told apart by
 * the origin Chrome stamps on each message — never by anything the message
 * says about itself:
 *
 * - Extension pages (popup, settings, the inline list, the save prompt) report
 *   `chrome-extension://<id>` and may use the vault API (`Request`).
 * - The content script reports the web page's own origin, and gets a short,
 *   separate list (`ContentRequest`) that hands out nothing from the vault.
 *   It runs in every page; whatever it may ask for, any page that compromises
 *   its renderer may ask for too.
 */

/** What an extension page knows about the vault. */
export type VaultStatus =
  | { state: 'uninitialized' }
  /**
   * `pin`: the PIN can unlock it, for as long as this browser stays open.
   * `device`: what to ask the device's authenticator for, when it can unlock it.
   * `keys`: the security keys that can unlock it too.
   * `passwordName`: what the password typed for it is — the words a page uses.
   */
  | { state: 'locked'; secret: VaultSecret; passwordName: PasswordName; pin: boolean; device: DeviceCredential | null; keys: SecurityKey[] }
  /**
   * `device`: what to ask this device's authenticator, when it can unlock the
   * vault — and prove its owner; `keys`, the same of each security key. `data`
   * comes without the recovery key and the account's key and session:
   * `account` says what a page needs of it.
   */
  | {
      state: 'unlocked';
      secret: VaultSecret;
      passwordName: PasswordName;
      data: VaultData;
      device: DeviceCredential | null;
      keys: SecurityKey[];
      account: AccountView | null;
    };

/** A security key set up to unlock the vault: what to ask it, and when it was added. */
export interface SecurityKey {
  /** Base64. */
  credentialId: string;
  /** Base64, 32 bytes. */
  salt: string;
  addedAt: number;
}

/**
 * One of the Keyrook account's passkeys, touched in Passhold's own page for a
 * challenge from `account/passkeyChallenge`: the answer as the browser gave it,
 * and its PRF answer (base64), for the service worker alone to open the root
 * with.
 */
export interface AccountPasskeyTouch {
  challengeId: string;
  answer: AccountPasskeyAnswer;
  prf: string | null;
}

/**
 * A sign-in's second step, as its owner gives it: the code from the
 * authenticator app, the account's recovery key in its place, or one of the
 * account's passkeys.
 */
export type SecondStepAnswer = { code: string } | { recoveryKey: string } | { passkey: AccountPasskeyTouch };

/** The Keyrook account as a page shows it. */
export interface AccountView {
  email: string;
  /** Who the account is on the server, as a family's roster names it; null for a link from before each product had a key. */
  accountId: string | null;
  /** The name given the account on account.keyrook.com, as the last sign-in or sync said: text to show, nothing more. */
  name: string | null;
  lastSyncAt: number | null;
  /** The server ended this browser's session: sign in again to go on syncing. */
  signedOut: boolean;
  /**
   * The account's recovery kit, as far as this vault knows: made here and put
   * away or not, or none made here. `unchecked`: made on account.keyrook.com
   * or in another app, and no Passhold has seen it open the account yet.
   */
  kit: 'none' | 'unchecked' | 'elsewhere' | 'pending' | 'kept';
  /**
   * A start over asked for with the email alone, waiting to take effect.
   * `deviceName` is what the asking device called itself: theirs to choose.
   */
  startOver: { executesAt: number; deviceName: string } | null;
  /** The day the account started over, when that is why the server signed this browser out. */
  startedOver: number | null;
  /**
   * The day this browser was removed from the account, by a proof Passhold's
   * key checked, and what the account held taken off: said until its owner
   * closes it. Never the server's word alone.
   */
  removed: number | null;
  /** Signed in with Google or GitHub: no account password to ask for. */
  provider: SignInProvider | null;
  /** The account has no password — which provider it signs in with may not be known here. */
  passwordless: boolean;
  /** New computers can open the account with a passkey this vault put up. */
  passkey: boolean;
}

/**
 * Back from Google or GitHub: an account to make with that identity, one this
 * browser asks to be let into, or what went wrong.
 */
export type ProviderView =
  | { kind: 'new'; provider: SignInProvider; email: string }
  /**
   * `asked`: a request to be let in is out, waiting for a browser already in.
   * `keyed`: some Passhold already has its key in this account; until one
   * does, no browser can let this one in and no passkey holds the key, and
   * the recovery key is the way.
   */
  | {
      kind: 'existing';
      provider: SignInProvider;
      email: string;
      asked: boolean;
      keyed: boolean;
      rooted: boolean;
      /** Giving it its root, after the sign-in again, waits for the next code from the authenticator app. */
      rootStep: boolean;
      /** The account has a password too: that, not another browser, opens its key here. */
      password: boolean;
    }
  /**
   * `rooted`: an account Keyrook Authenticator made before roots, given its
   * root here after a sign-in again; its new recovery key to show, if one was made.
   */
  | { kind: 'rooted'; provider: SignInProvider; email: string; recoveryKey: string | null; joined: boolean }
  /** Signed in with Google or GitHub to an account with a second step: the code, the recovery key or a passkey finishes it. */
  | { kind: 'secondStep'; provider: SignInProvider; passkeys: boolean }
  | { kind: 'failed'; error: MessageKey };

/** This browser's request to be let in: who has picked it up, the code to compare, done. */
export type JoinProgress =
  | { state: 'waiting' }
  | { state: 'accepted'; code: string }
  /** `joined`: no vault here yet; the sign-in waits for the vault to be made. */
  | { state: 'done'; joined: boolean }
  | { state: 'ended' };

/** A browser asking to be let into the account; `code` once this browser has started letting it in. */
export interface PairingView {
  id: string;
  deviceName: string;
  createdAt: number;
  code: string | null;
}

/**
 * What the account kept for Passhold when it started over: its logins, sealed
 * under Passhold's old key, until `expiresAt`. `byPassword`, `bySheet`: what
 * opens it — the old account password, the old recovery key.
 */
export interface ArchiveView {
  id: string;
  archivedAt: number;
  expiresAt: number;
  logins: number;
  byPassword: boolean;
  bySheet: boolean;
}

/** What a sync did that a person should hear about. */
export interface SyncResult {
  /** Logins deleted for good on another device, and so here. */
  removed: number;
  /** Records that would not open, passed over. */
  skipped: number;
}

/**
 * How a page shows that its owner is the one asking, for what an open vault
 * alone should not give — text out, a new way in: the vault's secret (master
 * password or recovery key), or the device's answer (base64) — or a security
 * key's, with `key` naming which (its credential id).
 */
export type Proof = { secret: string } | { prf: string; key?: string };

/** A change to the logins, cards, addresses and notes of one place: the vault's own, or a family's shared vault. */
export type ItemMutation =
  | { op: 'login/add'; draft: LoginDraft }
  | { op: 'login/update'; id: string; draft: LoginDraft }
  | { op: 'login/favorite'; id: string; favorite: boolean }
  | { op: 'login/trash'; id: string }
  | { op: 'login/restore'; id: string }
  | { op: 'login/purge'; id: string }
  /** A card, an address or a note. */
  | { op: 'wallet/add'; draft: WalletDraft }
  | { op: 'wallet/update'; id: string; draft: WalletDraft }
  | { op: 'wallet/favorite'; id: string; favorite: boolean }
  | { op: 'wallet/trash'; id: string }
  | { op: 'wallet/restore'; id: string }
  | { op: 'wallet/purge'; id: string }
  | { op: 'trash/empty' };

/**
 * Pages describe a change; the service worker applies it inside its
 * serialised turn, seals and stores the result, and tells every page.
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

/** The field the inline list was opened from: a sign-in's, a new password's, a payment card's or an address's. */
export type FieldKind = 'login' | 'new' | 'card' | 'address';

/**
 * What the inline list shows: never a password, never a card's number or
 * code. `passkey`: choosing it signs in with the login's passkey, for a
 * sign-in the page is waiting on. Cards and addresses are offered only to a
 * field of their own kind, and on any site: they belong to none.
 */
export interface MenuView {
  state: 'uninitialized' | 'locked' | 'ready';
  site: string;
  field: FieldKind;
  /** `vault`: the shared vault a login is in, by name; null for one of the vault's own. */
  logins: { id: string; title: string; username: string; passkey: boolean; vault: string | null }[];
  /** `title`: '' when the card has none, and no number to be named by. */
  cards: { id: string; title: string; network: CardNetwork | null; last4: string; expiry: string; expired: boolean }[];
  /** The frame is https: a card is filled nowhere else, as a page over plain http sends it for anyone on the way to read. */
  secure: boolean;
  /** `line`: the address in one line, for telling two apart. */
  addresses: { id: string; title: string; line: string }[];
}

/**
 * A website asking for a passkey, as Passhold's frame on its page shows it.
 * `exists`: the site already holds the passkey Passhold has for this account.
 * `none`: Passhold has no passkey the site would take.
 */
export interface PasskeyView {
  op: 'create' | 'get';
  state: 'uninitialized' | 'locked' | 'ready' | 'exists' | 'none';
  site: string;
  /** The account the site is making a passkey for. */
  userName: string;
  /** The logins whose passkey the site would take; `vault`, the shared vault one is in. */
  accounts: { id: string; title: string; username: string; vault: string | null }[];
}

/** What the person chose in that frame. */
export type PasskeyAnswer = 'save' | 'use' | 'other' | 'cancel';

/**
 * A sign-in a page just sent, or a card and an address a checkout sent, as
 * the save prompt and the popup show it: never a password, a card's number
 * or its code. A kind is null while the vault is locked: what it means is
 * decided on unlocking.
 */
export type PendingView =
  | { what: 'login'; id: string; site: string; username: string; kind: 'new' | 'update' | null }
  | {
      what: 'wallet';
      id: string;
      site: string;
      /** The card by its network and last four digits; null when the checkout sent none new. */
      card: { network: CardNetwork | null; last4: string; kind: 'new' | 'update' | null } | null;
      /** The address by its street's first line; null when the checkout sent none new. */
      address: { line: string; kind: 'new' | null } | null;
    };

export type PromptOutcome = 'saved' | 'locked' | 'closed';

/** What restoring did: made the vault from the backup, or brought the backup into the vault here. */
export interface RestoreResult {
  mode: 'new' | 'merged';
  added: number;
  updated: number;
}

/** The page in the active tab, for the popup's "On this page". */
export interface PageInfo {
  site: string | null;
  /** Origin and path, without the query: what a new login made here is saved with. */
  url: string | null;
  loginIds: string[];
}

export type Request =
  | { type: 'vault/status' }
  /** `join`: with the account signed in to before there was a vault (`account/join`). */
  | { type: 'vault/create'; password: string; join?: boolean; passwordIs?: 'account' | 'code' }
  /** A vault with no master password: it opens with the device, and a recovery key drawn now. */
  /** `accountPrf`: the same passkey's answer for the account, to put the account key up under it. */
  | { type: 'vault/createWithDevice'; credential: DeviceCredential; prf: string; join?: boolean; accountPrf?: string | null }
  | { type: 'vault/unlock'; password: string }
  | { type: 'vault/unlockPin'; pin: string }
  /** A new PIN, or null to stop using one. Needs proof: it is a new way in. */
  | { type: 'vault/setPin'; proof: Proof; pin: string | null }
  /** `prf`: the authenticator's answer, base64. Needs proof: it is a new way in. */
  | { type: 'vault/setDevice'; proof: Proof; credential: DeviceCredential; prf: string }
  | { type: 'vault/removeDevice' }
  /** A security key as another way in: `prf`, its answer, base64. Needs proof, as the device does. */
  | { type: 'vault/addKey'; proof: Proof; credential: DeviceCredential; prf: string }
  /** One way in fewer: asks for nothing. */
  | { type: 'vault/removeKey'; credentialId: string }
  /**
   * Only whether the proof holds: asked before the device is, so a mistyped
   * password costs no fingerprint and leaves no passkey behind. Telling
   * nothing new — exporting or backing up answers the same question.
   */
  | { type: 'vault/checkProof'; proof: Proof }
  /**
   * What the file opens with from now on: a master password, or a recovery
   * key drawn in place of one (which needs the device set up, to open with
   * every day). Changing the master password is this too.
   */
  | { type: 'vault/setSecret'; proof: Proof; next: { kind: 'password'; password: string } | { kind: 'recoveryKey' } }
  /** The recovery key kept sealed in the vault, shown again to its owner. */
  | { type: 'vault/showRecoveryKey'; proof: Proof }
  /** `key`: the security key that answered (its credential id); without it, the device. */
  | { type: 'vault/unlockDevice'; prf: string; key?: string }
  | { type: 'vault/lock' }
  /** The account password is reduced to a proof before it leaves; see background/keyrook.ts. */
  /**
   * `makeRoot`: the account was made by Keyrook Authenticator before roots
   * (`error.accountNeedsRoot`), and its owner chose to give it one — under the
   * recovery key it already has, when typed, or a new one.
   */
  | { type: 'account/signIn'; email: string; password: string; makeRoot?: { recoveryKey?: string }; secondStep?: SecondStepAnswer }
  | { type: 'account/signOut' }
  /** Email a code to the address, to make an account there. */
  | { type: 'account/start'; email: string }
  /** Make the account with the emailed code; the password, again, only as a proof. */
  | { type: 'account/create'; email: string; code: string; password: string }
  /** Signing in before there is a vault: held in session memory until the vault is made with `join`. */
  | { type: 'account/join'; email: string; password: string; makeRoot?: { recoveryKey?: string }; secondStep?: SecondStepAnswer }
  /** Not going on with that sign-in after all. */
  | { type: 'account/joinCancel' }
  /** Not giving the account its root after all: the sign-in that found it had none is ended. */
  | { type: 'account/cancelRoot' }
  /** The recovery key of an account made before its vault, put away. */
  | { type: 'account/joinKitSaved' }
  /** Where this tab goes to sign in with Google or GitHub. */
  | { type: 'provider/start'; provider: SignInProvider }
  | { type: 'provider/view' }
  /** Make the account the provider's identity has none of; its recovery key comes back. */
  | { type: 'provider/create' }
  /** Ask a browser already in the account to let this one in. */
  | { type: 'provider/ask' }
  | { type: 'provider/poll' }
  /** Let this browser in with the account's recovery key instead. */
  | { type: 'provider/withKit'; recoveryKey: string }
  /** An account with a password, signed in with Google or GitHub: its password opens Passhold's key here. */
  | { type: 'provider/withPassword'; password: string }
  /** The second step of a sign-in with Google or GitHub; answers with what comes next. */
  | { type: 'provider/secondStep'; secondStep: SecondStepAnswer }
  /** Give an account with no root its root: where to sign in again with the provider, and the old recovery key if typed. */
  | { type: 'provider/makeRoot'; recoveryKey?: string }
  /** The code that giving it its root asks for, after that sign-in again; answers with what comes next. */
  | { type: 'provider/rootStep'; secondStep: SecondStepAnswer }
  | { type: 'provider/cancel' }
  /** The passkeys that hold Passhold's key, for a computer being let in. */
  | { type: 'provider/passkeys' }
  | { type: 'provider/withPasskey'; credentialId: string; prf: string }
  /** Put Passhold's key up under this passkey's answer, or take it down. */
  | { type: 'passkey/enroll'; credentialId: string; prf: string }
  | { type: 'passkey/remove' }
  /** Browsers asking to be let in, for one already in. */
  | { type: 'pairing/list' }
  | { type: 'pairing/start'; id: string }
  /** The codes matched: send that browser Passhold's key. */
  | { type: 'pairing/approve'; id: string }
  | { type: 'pairing/deny'; id: string }
  /** Email a code, to set a forgotten account password anew with the recovery key. */
  | { type: 'account/recoverCode'; email: string }
  /**
   * A forgotten account password, set anew with the account's recovery key
   * and the emailed code: into the vault, or — with none here yet — held
   * for it, as `account/join` is.
   */
  | { type: 'account/recover'; email: string; code: string; recoveryKey: string; password: string }
  /** Email a code, to start the account over with nothing but the address. */
  | { type: 'account/startOverCode'; email: string }
  /** Ask to start over with the emailed code, and a password account's new password: it takes effect a week later. */
  | { type: 'account/startOver'; email: string; code: string; password?: string }
  /** Say no to a start over waiting. */
  | { type: 'account/cancelStartOver' }
  /** Close the notice that this browser was removed from the account. */
  | { type: 'account/closeRemoval' }
  /** A challenge to sign in with one of the Keyrook account's passkeys. */
  | { type: 'account/passkeyChallenge' }
  /** Signed in with one of the account's passkeys before there is a vault: waits for it, as `account/join` does. */
  | { type: 'account/joinWithPasskey'; touch: AccountPasskeyTouch }
  /** This vault signed in with one of the account's passkeys. */
  | { type: 'account/signInWithPasskey'; touch: AccountPasskeyTouch }
  /** What the account kept when it started over, for Passhold. */
  | { type: 'account/archives' }
  /** Bring what was kept back, with the old account password or the old recovery key. */
  | { type: 'account/openArchive'; id: string; secret: string }
  /** A new recovery key for the account, drawn and shown: nothing changes on the account yet. */
  | { type: 'account/draftKit' }
  /** The drawn key set as the account's, once saved and typed back; takes the account password, which the server checks. */
  | { type: 'account/newKit'; password: string; secondStep?: SecondStepAnswer }
  /** The sign-in waiting on its second step: whether a passkey may answer it. */
  | { type: 'account/secondStepView' }
  /** A challenge for one of the account's passkeys to answer as a sign-in's second step. */
  | { type: 'account/secondStepPasskey' }
  /** The drawn key let go, unset. */
  | { type: 'account/dropKitDraft' }
  /** The account's recovery key kept in the vault, to its owner. */
  | { type: 'account/showKit'; proof: Proof }
  /** The account's recovery key, typed once: it must open the account's root, and is then kept like one made here. */
  | { type: 'account/checkKit'; recoveryKey: string }
  | { type: 'account/sync' }
  /** The code to compare with someone in a family, the same on both screens. */
  | { type: 'family/compareCode'; orgId: string; accountId: string }
  /** The two codes matched: that member key is trusted here from now on, and the family opened again. Only on a match the person saw. */
  | { type: 'family/trust'; orgId: string; accountId: string; memberKey: string }
  /** The account's password, once, so this browser takes its key to the family; never sent. */
  | { type: 'family/unlock'; orgId: string; password: string }
  | { type: 'vault/mutate'; mutation: Mutation }
  /** Plain text out: asks for proof, even unlocked. */
  | { type: 'vault/exportCsv'; proof: Proof }
  /** The vault file as it is, sealed under its secret. Asks for proof. */
  | { type: 'vault/backup'; proof: Proof }
  /** With no vault here, the backup becomes it; with one, its logins are added and nothing is removed. */
  | { type: 'vault/restore'; backup: string; password: string }
  /** Removes the vault from this browser. Needs no password: it is the way out when it is forgotten. */
  | { type: 'vault/reset' }
  | { type: 'page/info' }
  | { type: 'page/fill'; id: string }
  /** Whether the popup should ask for a rating now (lib/rating.ts), and the answer: `rated`, or `later` for "Not now". */
  | { type: 'rating/view' }
  | { type: 'rating/answer'; answer: 'rated' | 'later' }
  | { type: 'menu/view'; token: string }
  | { type: 'menu/fill'; token: string; id: string }
  | { type: 'menu/suggest'; token: string; password: string }
  | { type: 'menu/unlock'; token: string }
  /** Sign in with this login's passkey, for the sign-in the list's page is waiting on. */
  | { type: 'menu/passkey'; token: string; id: string }
  | { type: 'passkey/view'; token: string }
  /** `id`: the login whose passkey to sign in with, for `use`. */
  | { type: 'passkey/answer'; token: string; answer: PasskeyAnswer; id?: string }
  | { type: 'passkey/unlock'; token: string }
  /** The frame's card is this tall: the frame follows. */
  | { type: 'passkey/size'; token: string; height: number }
  | { type: 'prompt/view'; token: string }
  | { type: 'prompt/answer'; token: string; answer: 'save' | 'never' | 'dismiss' }
  | { type: 'pending/view' }
  | { type: 'pending/answer'; id: string; answer: 'save' | 'never' | 'dismiss' }
  | { type: 'clipboard/copied' }
  /** A person clicked or typed in one of Passhold's pages: the idle lock starts again. */
  | { type: 'activity' };

export type ResponseFor<R extends Request> = R extends {
  type: 'vault/status' | 'vault/create' | 'vault/unlock' | 'vault/unlockPin' | 'vault/unlockDevice';
}
  ? VaultStatus
  : R extends { type: 'vault/exportCsv' }
    ? { csv: string }
    : R extends { type: 'vault/backup' }
      ? { backup: string }
      : R extends { type: 'vault/createWithDevice' }
        ? { status: VaultStatus; recoveryKey: string }
        : R extends { type: 'vault/setSecret' | 'vault/showRecoveryKey' }
          ? { recoveryKey: string | null }
          : R extends { type: 'account/create' }
            ? SyncResult & { recoveryKey: string; joined: boolean }
            : R extends { type: 'account/signIn' }
              ? SyncResult & { recoveryKey: string | null }
              : R extends { type: 'account/sync' }
                ? SyncResult
                : R extends { type: 'family/compareCode' }
                  ? { code: string }
                : R extends { type: 'account/recover' }
                  ? { email: string; joined: boolean }
                  : R extends { type: 'account/startOver' }
                    ? { recoveryKey: string; email: string; method: 'password' | 'provider'; executesAt: number | null }
                    : R extends { type: 'account/archives' }
                      ? ArchiveView[]
                      : R extends { type: 'account/openArchive' }
                        ? { added: number }
              : R extends { type: 'account/secondStepView' }
                ? { passkeys: boolean } | null
                : R extends { type: 'provider/secondStep' | 'provider/rootStep' }
                  ? ProviderView | null
              : R extends { type: 'account/passkeyChallenge' | 'account/secondStepPasskey' }
                ? AccountPasskeyOptions
                : R extends { type: 'account/joinWithPasskey' }
                  ? { email: string }
                  : R extends { type: 'account/signInWithPasskey' }
                    ? SyncResult
              : R extends { type: 'account/draftKit' | 'account/showKit' }
                ? { recoveryKey: string }
                : R extends { type: 'account/join' }
                  ? { email: string; recoveryKey: string | null }
                  : R extends { type: 'provider/start' | 'provider/makeRoot' }
                    ? { url: string }
                    : R extends { type: 'provider/passkeys' }
                      ? { credentialIds: string[] }
                      : R extends { type: 'provider/withPasskey' }
                        ? { joined: boolean }
                        : R extends { type: 'provider/view' }
                      ? ProviderView | null
                      : R extends { type: 'provider/create' }
                        ? { recoveryKey: string; joined: boolean }
                        : R extends { type: 'provider/poll' }
                          ? JoinProgress
                          : R extends { type: 'provider/withKit' | 'provider/withPassword' }
                            ? { joined: boolean }
                            : R extends { type: 'pairing/list' }
                              ? PairingView[]
                              : R extends { type: 'pairing/start' }
                                ? { code: string }
                : R extends { type: 'vault/restore' }
                  ? RestoreResult
                  : R extends { type: 'page/info' }
                    ? PageInfo
                    : R extends { type: 'rating/view' }
                      ? { ask: boolean }
                    : R extends { type: 'menu/view' }
                      ? MenuView
                      : R extends { type: 'menu/unlock' | 'passkey/unlock' }
                        ? { opened: boolean }
                        : R extends { type: 'passkey/view' }
                          ? PasskeyView
                        : R extends { type: 'prompt/view' }
                          ? PendingView | null
                          : R extends { type: 'prompt/answer' }
                            ? { outcome: PromptOutcome }
                            : R extends { type: 'pending/view' }
                              ? PendingView | null
                              : void;

// --- the content script's side ------------------------------------------------

export type ContentRequest =
  | { type: 'content/hello' }
  /**
   * `auto`: opened because the field was clicked, not the button pressed. The
   * answer is then nothing unless there is something to offer: an open vault
   * with logins for this frame's site, or a new-password field to suggest one for.
   */
  /**
   * `inTop`: this frame is too small to hold the list — a payment provider's
   * frame around one card field — so it is drawn in the top frame instead,
   * beside this one, at the field's place in it (CSS pixels of this frame).
   * `word`: what this frame just posted to the top window, so the top frame
   * can tell which of its frames this is.
   */
  | { type: 'content/openMenu'; field: FieldKind; auto?: boolean; inTop?: FieldRect & { word: string } }
  /** The list this frame had drawn in the top frame is no longer wanted. */
  | { type: 'content/closeMenu' }
  | { type: 'content/offerSave'; username: string; password: string }
  /** A checkout sent: the card in its card fields, the address in its address fields, as typed — the page's word, read as such. */
  | { type: 'content/offerWallet'; card: CardFill | null; address: SentAddress | null }
  | { type: 'content/checkPrompt' }
  /**
   * A website asking for a passkey (`navigator.credentials`), passed on as the
   * page wrote it: `id` is the page's own name for the request, `options` the
   * request with its bytes in base64url — all of it the page's word, and read
   * as such (`@passhold/core`, webauthn/request.ts). Top frame only.
   */
  | { type: 'content/webauthn'; id: string; op: 'create' | 'get'; options: unknown; conditional: boolean }
  /** The page gave up on that request. */
  | { type: 'content/webauthnCancel'; id: string }
  /**
   * This frame has a payment card's fields: a card chosen in another frame of
   * the same origin in this tab comes here too, as many checkouts put each
   * field in a frame of its own. It hands the script nothing.
   */
  | { type: 'content/cardFields' }
  /** The top frame checking in when asked (`ph/checkIn`): Chrome's stamp on the message says where it is. */
  | { type: 'content/here'; nonce: string };

/**
 * How a passkey request ends, for the page: a passkey made or a sign-in
 * signed (WebAuthn's JSON form, bytes in base64url), the browser's own
 * answer instead, or an error by its DOMException name.
 */
export type WebAuthnOutcome =
  | { type: 'credential'; credential: Record<string, unknown> }
  | { type: 'fallback' }
  | { type: 'error'; name: 'NotAllowedError' | 'InvalidStateError' | 'AbortError'; message: string };

/** What starting one does: ends it at once, waits for the person in Passhold's frame, or waits for the list under a field. */
export type WebAuthnStart = { outcome: WebAuthnOutcome } | { dialog: { token: string; height: number } } | { waiting: true };

export interface ContentHello {
  /** A vault exists here: without one there is nothing to offer. */
  ready: boolean;
  inlineButton: boolean;
  offerToSave: boolean;
  offerToSaveCards: boolean;
  autoSuggest: boolean;
  passkeys: boolean;
}

/** A field's place in its own frame. */
export interface FieldRect {
  left: number;
  top: number;
  bottom: number;
}

export type ContentResponseFor<R extends ContentRequest> = R extends { type: 'content/hello' }
  ? ContentHello
  : R extends { type: 'content/openMenu' }
    ? { token: string; height: number; inTop: boolean } | null
    : R extends { type: 'content/checkPrompt' }
      ? { token: string } | null
      : R extends { type: 'content/webauthn' }
        ? WebAuthnStart | null
        : void;

/** A card as a payment form takes it. */
export interface CardFill {
  holder: string;
  number: string;
  expMonth: number | null;
  expYear: number | null;
  code: string;
}

/** An address as a form takes it: the name whole, and in the two parts some forms ask for. */
export interface AddressFill {
  name: string;
  givenName: string;
  familyName: string;
  organization: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}

/** An address as a checkout sends it: the name whole, the country as the form named it. */
export type SentAddress = Omit<AddressFill, 'givenName' | 'familyName'>;

/**
 * What the content script posts into one of Passhold's frames when it moves
 * it: the page inside waits again before a click counts (ui/useVisible.ts).
 */
export const FRAME_MOVED = 'passhold-frame-moved';

/** What the service worker sends a frame. A fill names the origin it is for. */
export type ToContent =
  | { type: 'ph/fill'; origin: string; username: string | null; password: string; field: 'login' | 'new' | 'any' }
  | { type: 'ph/fillCard'; origin: string; card: CardFill }
  | { type: 'ph/fillAddress'; origin: string; address: AddressFill }
  /** `token`: only the list drawn for that one, where a frame draws another's. */
  | { type: 'ph/closeMenu'; token?: string }
  /** Top frame only: draw a list for a field in the frame that posted `word`, too small to hold it, beside that frame. */
  | { type: 'ph/hostMenu'; token: string; word: string; rect: FieldRect; height: number; auto: boolean }
  | { type: 'ph/showPrompt'; token: string }
  | { type: 'ph/closePrompt' }
  /** A passkey request settled: `id` is the page's name for it. */
  | { type: 'ph/webauthn'; id: string; outcome: WebAuthnOutcome }
  | { type: 'ph/passkeySize'; id: string; height: number }
  /** Top frame only: check in (`content/here`), so the service worker learns from Chrome where this frame is. */
  | { type: 'ph/checkIn'; nonce: string };

// --- envelope -------------------------------------------------------------------

export type Envelope<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; key?: MessageKey | undefined; values?: Values | undefined };

/** Broadcast to extension pages after any change to the vault or its lock. */
export const VAULT_CHANGED = 'vault/changed' as const;

/** The parts of a `chrome.runtime.MessageSender` the trust decision needs. */
export interface SenderIdentity {
  id?: string | undefined;
  origin?: string | undefined;
}

/**
 * Whether a message comes from one of Passhold's own pages.
 *
 * `id` alone is not enough: the content script carries the extension's id
 * too, from inside every web page. The origin is what tells them apart — an
 * extension page reports `chrome-extension://<id>`, a content script the
 * page's own.
 */
export function isTrustedSender(sender: SenderIdentity, runtimeId: string): boolean {
  return sender.id === runtimeId && sender.origin === `chrome-extension://${runtimeId}`;
}

/** Whether a message comes from our content script, in some web page. */
export function isContentSender(sender: SenderIdentity, runtimeId: string): boolean {
  return (
    sender.id === runtimeId &&
    typeof sender.origin === 'string' &&
    (sender.origin.startsWith('https://') || sender.origin.startsWith('http://'))
  );
}

/** A refusal from the service worker, carrying the message key a page translates. */
export class BackgroundError extends Error {
  override readonly name = 'BackgroundError';
  constructor(
    message: string,
    readonly key?: MessageKey,
    readonly values?: Values,
  ) {
    super(message);
  }
}

export async function send<R extends Request>(request: R): Promise<ResponseFor<R>> {
  const response = (await chrome.runtime.sendMessage(request)) as Envelope<ResponseFor<R>> | undefined;
  if (!response) throw new BackgroundError('No response from the service worker.', 'error.noWorker');
  if (!response.ok) throw new BackgroundError(response.error, response.key, response.values);
  return response.value;
}

export function onVaultChanged(handler: () => void): () => void {
  const listener = (message: unknown) => {
    if (typeof message === 'object' && message !== null && (message as { type?: string }).type === VAULT_CHANGED) {
      handler();
    }
  };
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}
