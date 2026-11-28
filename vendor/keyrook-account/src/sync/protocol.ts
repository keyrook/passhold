/**
 * The wire contract between the client and the sync server.
 *
 * Types only. Keeping the contract in the
 * shared package means the extension, the future native apps and the server all
 * compile against one definition rather than three drifting copies.
 *
 * Nothing here is trusted because the server sent it: what a device acts on,
 * it checks itself.
 */
import type { SealedBox } from '../crypto/aead.js';
import type { RecoveryWrap } from './kit.js';
import type { ProductBox } from '../keys/box.js';
import type { AccountKdfParams } from './account.js';
import type { RemoteRecord } from './adapter.js';

export const SYNC_API_VERSION = 1;

// --- POST /auth/prelogin ----------------------------------------------------

export interface PreloginRequest {
  email: string;
}

/**
 * Returns the KDF parameters for an account so the client can derive its keys
 * before authenticating. Unknown emails get deterministic pseudo-parameters
 * derived from a server secret, so this cannot be used to enumerate accounts.
 */
export interface PreloginResponse {
  kdf: AccountKdfParams;
}

// --- POST /auth/register/start ----------------------------------------------

/**
 * Asks for a one-time code to be sent to the address. Answered the same way
 * whether or not the address already has an account: if it does, the email
 * says so instead of carrying a code, and only the address's owner reads it.
 */
export interface RegisterStartRequest {
  email: string;
}

// --- POST /auth/register ----------------------------------------------------

export interface RegisterRequest {
  email: string;
  /** The six-digit code sent to `email`. An account only exists once it is proved. */
  code: string;
  /** HKDF output; the server hashes it again before storing. */
  authHash: string;
  kdf: AccountKdfParams;
  /**
   * Keyrook Authenticator's data key, wrapped under the stretched key, as every
   * build before keys per product signs up. Only Authenticator sends it.
   */
  protectedKey?: SealedBox;
  /** Proof of holding that key; see `deriveKeyCheck`. Sent with `protectedKey`. */
  keyCheck?: string;
  /** The account's root and the signing-up product's key, from the start. */
  keys?: InitialKeys;
  /** Shown in the device list so a user can recognise their own sessions. */
  deviceName: string;
  deviceId: string;
}

/**
 * An account made with keys per product from its first moment: its root, and
 * the key of the product it was made from, sealed to that root.
 */
export interface InitialKeys {
  /**
   * The new account's id, a random UUID the device chose: every wrap, box and
   * pin below is bound to it, so it exists before the account does.
   */
  accountId: string;
  root: {
    publicKey: string;
    rootCheck: string;
    /** Under the password. Required on an account made with one. */
    passwordWrap: SealedBox | null;
    /** Under the recovery key. Required on an account made with Google or GitHub. */
    recoveryWrap: SealedBox | null;
    recoveryAuthHash: string | null;
  };
  /**
   * The calling product's key, sealed to the root, with its pin and proof
   * (`deriveProductKeyCheck`): all three, or none. None only when the account
   * page starts an account over, with its root alone; each product then joins
   * with the key it still holds, or a new one.
   */
  box?: ProductBox;
  pin?: SealedBox;
  keyCheck?: string;
}

// --- POST /auth/login -------------------------------------------------------

export interface LoginRequest {
  email: string;
  authHash: string;
  deviceId: string;
  deviceName: string;
  /**
   * This client can finish a sign-in with a second step (`SecondStepRequired`).
   * Without it, an account that has one is refused: an older client would
   * not know what the answer meant.
   */
  secondStep?: true;
}

// --- A second step at sign-in ------------------------------------------------

/**
 * The answer to a sign-in, with the password or Google or GitHub, on an
 * account with a second step: no session yet. `ticket` finishes it
 * (`POST /auth/second-step`) within five minutes, with a few tries.
 * `passkeys`: the account has passkeys, and one of them may answer instead.
 */
export interface SecondStepRequired {
  secondStep: { ticket: string; passkeys: boolean };
}

/**
 * Finishing a sign-in: the code the person's authenticator app shows, the
 * recovery key in its place (`deriveRecoveryAuthHash`, for an app that was
 * lost), or one of the account's passkeys, touched for a challenge from
 * `POST /auth/second-step/passkey`.
 */
export interface SecondStepRequest {
  ticket: string;
  code?: string;
  recoveryAuthHash?: string;
  passkey?: PasskeyProof;
}

/**
 * Where a change asks the owner, on an account with a second step: with the
 * password or a fresh provider sign-in, the code, or the recovery key in its
 * place. A passkey stands alone, as it does at sign-in.
 */
export type SecondStepProof = { code: string } | { recoveryAuthHash: string };

/** The owner's proof, as every change that asks for it takes it. */
export interface OwnerProofFields {
  authHash?: string;
  reauth?: ProviderTicket;
  passkey?: PasskeyProof;
  secondStep?: SecondStepProof;
}

/** A second step being set up: its secret, shown once, as text and as its QR code's contents. */
export interface SecondStepBegun {
  secret: string;
  uri: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  /**
   * Keyrook Authenticator's data key under the password, as before keys were
   * per product. Absent when there is none, or when the password changed
   * through another product and Authenticator has not wrapped it again yet;
   * the account's root, under the same password, opens it then.
   */
  protectedKey?: SealedBox;
  account: {
    /** The server's id for the account: what product keys, boxes and pins are bound to. Never changes. */
    id: string;
    email: string;
    /** How the account proves who is signing in. */
    method?: AccountMethod;
    /**
     * Which of Google and GitHub sign in to the account, whatever this
     * sign-in was made with: on an account without a password, a change is
     * confirmed with a fresh sign-in with one of them. A server from before
     * says nothing.
     */
    providers?: SignInProvider[];
    /**
     * The name the person gave the account, if any. The server's word, shown
     * as text and never taken as a sign of who anyone is. An older server says
     * nothing.
     */
    name?: string | null;
  };
}

/**
 * `password`: the account password, as since 0.2. `provider`: Google or
 * GitHub, with no password at all.
 */
export type AccountMethod = 'password' | 'provider';
export type SignInProvider = 'google' | 'github';

// --- Sign in with a provider ------------------------------------------------
//
// GET /oauth/:provider/start?ext=<extension id>&challenge=<S256 of a verifier>
//     &state=<client state>&purpose=signin|reauth
//   → the provider's consent page → /oauth/:provider/callback
//   → https://<extension id>.chromiumapp.org/oauth#ticket=…&state=…
//     (or #error=…&state=…)
//
// A phone app asks with `return=app&app=<app id>` in place of `ext`, and is
// handed `<app id>:/oauth#ticket=…&state=…`. A Firefox extension sends its
// add-on id as `ext` and is handed the answer at
// `https://<SHA-1 of the id, hex>.extensions.allizom.org/oauth#…`, where
// `identity.launchWebAuthFlow` waits; never by `return=message`, which no
// Firefox extension can receive.
//
// A product's web page asks with `client=web&origin=<its origin>` and
// nothing else naming a way back, and is handed `<origin>/#ticket=…&state=…`.
// The server takes only an origin it lists as that product's page, and gives
// the session it then signs in a shorter life: ten minutes per access token,
// and none past 12 hours after signing in, refreshes included.
//
// The ticket is worth nothing without the verifier, which never leaves the
// extension or the app.

/** A ticket from the callback, and the verifier its challenge was made from. */
export interface ProviderTicket {
  ticket: string;
  verifier: string;
}

export interface ProviderSessionRequest extends ProviderTicket {
  deviceId: string;
  deviceName: string;
  /** As `LoginRequest.secondStep`. */
  secondStep?: true;
}

/**
 * A provider account's session. No `protectedKey`: nothing wraps its data key
 * for the server, which is the point — a new browser gets the key by
 * `PairingRequest` or with the recovery key (`RecoveryWrapRequest`).
 */
export type ProviderLogin = Omit<LoginResponse, 'protectedKey'>;

/**
 * `existing`: signed in; the device holds no data key yet unless it already
 * had the account's. `new`: no account has this identity — `signupToken`
 * creates one within ten minutes. `link`, to the account page alone: the
 * address has an account with a password that this identity does not sign in
 * to yet. `linkToken`, with that password, adds it (`linkIdentity`) within ten
 * minutes; alone it signs in to nothing.
 */
export type ProviderSessionResponse =
  | { status: 'existing'; session: ProviderLogin }
  | { status: 'new'; signupToken: string; email: string }
  | { status: 'link'; linkToken: string; email: string; provider: string }
  | { status: 'second_step'; secondStep: SecondStepRequired['secondStep'] };

export interface ProviderRegisterRequest {
  signupToken: string;
  /** Proof of holding Keyrook Authenticator's data key; see `deriveKeyCheck`. Sent with `recovery`. */
  keyCheck?: string;
  /**
   * Keyrook Authenticator's recovery kit, as every build before keys per
   * product signs up. For an account with no password a recovery key is the
   * only way back in once every device is gone, so an account has either this
   * or `keys`, whose root is wrapped under one.
   */
  recovery?: {
    issuedAt: number;
    state: SealedBox;
    wrap: RecoveryWrap;
    recoveryAuthHash: string;
  };
  /** The account's root, under the recovery key, and the signing-up product's key. */
  keys?: InitialKeys;
  deviceId: string;
  deviceName: string;
}

/**
 * What a change to a provider account needs instead of the password: a fresh
 * sign-in with the provider, made for this purpose within the last minutes.
 */
export type OwnerProof = { authHash: string } | { reauth: ProviderTicket };

// --- Passkeys: /auth/passkey, /account/passkeys ------------------------------

/**
 * A passkey's answer as `PublicKeyCredential.toJSON()` writes it, with
 * `clientExtensionResults` taken out: the PRF answer opens the root and never
 * leaves the device, and the server refuses an answer that carries it.
 */
export interface PasskeyCredential {
  id: string;
  rawId: string;
  type: 'public-key';
  response: Record<string, string | null>;
}

/** What `navigator.credentials.get` is called with (base64url as the JSON form writes it); the PRF input is added by the client, never sent by the server. */
export interface PasskeySignInOptions {
  /** Names the challenge when the answer comes back; the challenge itself is in `publicKey`. */
  challengeId: string;
  publicKey: {
    challenge: string;
    rpId: string;
    timeout: number;
    userVerification: 'required';
    allowCredentials: { type: 'public-key'; id: string }[];
  };
}

export interface PasskeySignInRequest {
  challengeId: string;
  credential: PasskeyCredential;
  deviceId: string;
  deviceName: string;
}

/**
 * A session, like any sign-in, and the root wrapped under the passkey that
 * signed in when it unlocks: opened with its PRF answer, in the browser.
 */
export interface PasskeySignInResponse extends LoginResponse {
  passkey: { id: string; rootWrap: SealedBox | null };
}

/**
 * One of the account's passkeys touched just now, for a challenge from
 * `POST /account/passkeys/reauth`: where a change asks for the owner's proof,
 * it stands in for the password or a fresh Google or GitHub sign-in.
 */
export interface PasskeyProof {
  challengeId: string;
  credential: PasskeyCredential;
}

/** The owner's proof that adding a passkey needs: the password, a fresh Google or GitHub sign-in, or another of its passkeys. */
export interface PasskeyOptionsRequest {
  authHash?: string;
  reauth?: ProviderTicket;
  passkey?: PasskeyProof;
  /** On an account with a second step, beside the password or a provider sign-in (`SecondStepProof`). */
  secondStep?: SecondStepProof;
}

/** What `navigator.credentials.create` is called with, as its JSON form writes it. */
export interface PasskeyCreationOptions {
  challengeId: string;
  publicKey: {
    challenge: string;
    rp: { id: string; name: string };
    user: { id: string; name: string; displayName: string };
    pubKeyCredParams: { type: 'public-key'; alg: number }[];
    timeout: number;
    excludeCredentials: { type: 'public-key'; id: string }[];
    authenticatorSelection: { residentKey: 'required'; requireResidentKey: true; userVerification: 'required' };
    attestation: 'none';
  };
}

/**
 * A passkey just made, named by the person, and, when it answered PRF, the
 * root wrapped under that answer with proof of holding the root.
 */
export interface AddPasskeyRequest {
  challengeId: string;
  credential: PasskeyCredential;
  name: string;
  unlock?: PasskeyUnlock;
}

/** The root wrapped under a passkey's PRF answer, and proof of holding that root (`deriveRootCheck`). */
export interface PasskeyUnlock {
  rootWrap: SealedBox;
  rootCheck: string;
}

export interface PasskeyView {
  id: string;
  name: string;
  createdAt: number;
  lastUsedAt: number | null;
  /** Kept by a service that copies it to the person's other devices (iCloud Keychain, Google Password Manager). */
  synced: boolean;
  /** Whether it opens the root, or only signs in. */
  unlocks: boolean;
}

export interface PasskeysResponse {
  passkeys: PasskeyView[];
}

// --- Joining by approval: /pairing ------------------------------------------

/** A browser signed in to the account, without its data key, asks to join. */
export interface PairingRequest {
  /** An ephemeral ECDH P-256 public key, raw, base64. */
  publicKey: string;
  deviceName: string;
}

export interface PairingCreated {
  id: string;
  expiresAt: number;
}

/** An open request, as a browser that could approve it sees it. */
export interface PairingSummary {
  id: string;
  deviceName: string;
  createdAt: number;
  requesterKey: string;
  /** Set once a browser has started approving. */
  approverKey: string | null;
}

export interface PairingsResponse {
  pairings: PairingSummary[];
}

/** The requester's view of its own request. */
export interface PairingStatus {
  status: 'waiting' | 'accepted' | 'approved';
  approverKey: string | null;
  /** The data key wrapped for the requester; see `unwrapPairedDataKey`. */
  wrap: SealedBox | null;
}

/** The approving browser's key, sent before the codes are compared. */
export interface PairingAccept {
  publicKey: string;
}

/** The data key, after the person approving said the codes match. */
export interface PairingApprove {
  wrap: SealedBox;
}

// --- Signing in to the account page by approving it from a product ---------

/**
 * The account page asks to be signed in by a product that already is. It
 * holds `secret`; the person types `code` into the product, which shows where
 * the request came from before they approve it.
 */
export interface ConsoleSignInRequest {
  /** What the browser says it is: "Chrome on macOS". */
  deviceName: string;
}

export interface ConsoleSignInCreated {
  id: string;
  /** Only the page that asked can collect the session with it. Never shown. */
  secret: string;
  /** Shown on the page, `XXXX-XXXX`, for the person to type into a product. */
  code: string;
  expiresAt: number;
}

/** A request, as the product the code was typed into shows it before approving. */
export interface ConsoleRequestFound {
  id: string;
  deviceName: string;
  /** The address the page asked from, as the server saw it. */
  address: string | null;
  createdAt: number;
  expiresAt: number;
}

export interface ConsoleCollectRequest {
  secret: string;
  deviceId: string;
}

export type ConsoleCollected =
  | { status: 'pending' }
  | { status: 'denied' }
  | { status: 'expired' }
  | { status: 'approved'; session: LoginResponse };

// --- POST /account/recovery/wrap ---------------------------------------------

/**
 * A signed-in browser with nothing but the recovery key asks for the kit's
 * wrap — how a provider account joins when no other browser is left.
 */
export interface RecoveryWrapRequest {
  recoveryAuthHash: string;
}

// --- POST /auth/refresh, POST /auth/logout ----------------------------------

export interface RefreshRequest {
  refreshToken: string;
}

export type RefreshResponse = Pick<LoginResponse, 'accessToken' | 'refreshToken' | 'expiresIn'>;

/** Ends this device's session on the server. Answers 204 whatever it finds. */
export type LogoutRequest = RefreshRequest;

// --- GET /account/devices, DELETE /account/devices/:id ----------------------

/** One signed-in session. A device that signs in again replaces its own. */
export interface DeviceSummary {
  /** The session's id: what `DELETE /account/devices/:id` takes. */
  id: string;
  /**
   * The id the device chose and sends at sign-in, which a removal proof names
   * (`makeDeviceRemovalProof`). As the server reports it: a server that lies
   * about it gets a proof the device it names refuses. An older server says
   * nothing: no proof can name the device, and removing it only signs it out.
   */
  deviceId?: string;
  name: string;
  /** The product the device signed in to; `console` is the account page. */
  product: string;
  createdAt: number;
  lastSeenAt: number;
  /** The session making this request. */
  current: boolean;
}

export interface DevicesResponse {
  devices: DeviceSummary[];
}

/**
 * Removing a device. Without a proof the session ends as it always did, and
 * the device keeps what it holds; with one, the device is told it was removed
 * and shown the proof (`device_removed`), and decides for itself.
 */
export interface RemoveDeviceRequest {
  proof?: DeviceRemovalProof;
}

/**
 * "The holder of this product's key removed this device": made and checked
 * with the product's key (`makeDeviceRemovalProof`, `checkDeviceRemovalProof`),
 * which the server never holds. It keeps the proof as sent and hands it back
 * as sent, and cannot make one.
 */
export interface DeviceRemovalProof {
  /** When it was made, by the remover's clock. Part of what the MAC covers. */
  removedAt: number;
  /** HMAC-SHA256, base64. */
  mac: string;
}

// --- PUT /account/profile ---------------------------------------------------

/**
 * The account's name: letters and marks of any script, spaces, and
 * `' ’ - .`, up to 64 characters; `null` or an empty name clears it. Anything
 * else is refused with 400, as any request the server cannot take.
 */
export interface ProfileRequest {
  name: string | null;
}

/** The name as the server keeps it: trimmed, NFC, spaces run together. */
export interface ProfileResponse {
  name: string | null;
}

// --- GET /account/console ---------------------------------------------------

/**
 * What the account page shows on its overview. Nothing sealed, wrapped or
 * hashed is in it: the page holds no key, and has no use for one.
 */
export interface ConsoleSummary {
  accountId: string;
  email: string;
  /** The name the person gave the account; null for none. An older server says nothing. */
  name?: string | null;
  method: 'password' | 'provider';
  /** The Google or GitHub identities that sign in to this account. */
  providers: { provider: string; email: string; since: number }[];
  createdAt: number;
  products: ConsoleProduct[];
  /** What was kept when the account started over, and when each is deleted. */
  archives: { id: string; archivedAt: number; expiresAt: number }[];
  /** A start over still waiting, which this page may cancel. */
  pendingStartOver: PendingStartOver | null;
  /** When the recovery key was issued and last confirmed to open the root, for reminding; null on an account without a root. */
  recoveryKey: { issuedAt: number | null; confirmedAt: number | null } | null;
  /** Since when sign-in asks for a second step; null when it does not. An older server says nothing. */
  secondStep?: { since: number } | null;
  /** Whether this server offers families; a server from before them says nothing, which is no. */
  orgsOffered?: boolean;
  /** Whether this server sells plans, so the page shows them; a server from before them says nothing, which is no. */
  billingOffered?: boolean;
  /** Whether this server looks up breaches, so the page shows Breach alerts; a server from before them says nothing, which is no. */
  breachOffered?: boolean;
  /** Whether this server offers agents, so the page shows Machines; a server from before them says nothing, which is no. */
  agentsOffered?: boolean;
  /** Who else opened the account's root, newest first, until it is replaced (`RootSeen`). An older server says nothing. */
  rootSeen?: RootSeen[];
}

/**
 * Someone else opened the account's root: its emergency contact once it was
 * handed over, or a family's organiser helping it back in. Until the root is
 * replaced they could open it again, and every product's key with it, so the
 * page and the apps ask for that. Gone once it is.
 */
export interface RootSeen {
  how: 'emergency' | 'organiser';
  /** Null when that account is gone. */
  by: { email: string; name: string | null } | null;
  /** Null when the family is gone. */
  orgName: string | null;
  at: number;
}

export interface ConsoleProduct {
  product: string;
  /** The product has a key on this account: a box, or Keyrook Authenticator's key from before keys per product. */
  hasKey: boolean;
  /**
   * The server's word that the recovery key opens this product's key. Shown,
   * never trusted: each product checks this for itself (key design, section 4),
   * and the page says so.
   */
  recoveryKeyProtects: boolean;
  /** Signed-in devices of this product. */
  devices: number;
}

// --- GET /account/export ----------------------------------------------------

/**
 * What the server holds about the account, for the person to download. Like
 * the overview, nothing sealed, wrapped or hashed is in it: those open nothing
 * for the person, and each app exports what it holds, decrypted, on the
 * device.
 */
export interface AccountExport {
  /** When the server answered, by its clock. */
  exportedAt: number;
  account: { id: string; email: string; name: string | null; method: 'password' | 'provider'; createdAt: number };
  /** The Google or GitHub identities that sign in, each with the address it reported. */
  providers: { provider: string; email: string; since: number }[];
  passkeys: { name: string; createdAt: number; lastUsedAt: number | null; synced: boolean; unlocks: boolean }[];
  secondStep: { since: number } | null;
  recoveryKey: { issuedAt: number | null; confirmedAt: number | null } | null;
  /** Each product with a key or records here: when its key was sealed and last replaced, and how many entries it syncs. */
  products: { product: string; keySince: number | null; keyChangedAt: number | null; entries: number }[];
  devices: { name: string; product: string; createdAt: number; lastSeenAt: number }[];
  /** Removals kept so a removed device hears of it, and until when. */
  removedDevices: { product: string; deviceId: string; removedAt: number; keptUntil: number }[];
  pendingStartOver: PendingStartOver | null;
  /** What was kept when the account started over, and when each is deleted. */
  archives: { archivedAt: number; expiresAt: number }[];
  /** The address the account had before its last change, while it is kept. An older server says nothing. */
  previousEmail?: { email: string; keptUntil: number } | null;
  /** The last 90 days of sign-ins and changes, as the page shows them. An older server says nothing. */
  activity?: SecurityEvent[];
  /** Files the account keeps, each sealed: which app's, how big, since when. An older server says nothing. */
  files?: { product: string; size: number; createdAt: number }[];
  /** The families the account is in, and its place in each. An older server says nothing. */
  orgs?: ExportedOrg[];
  /** Invitations still waiting: to the account's address, and those it sent. */
  orgInvites?: {
    received: { orgName: string; role: OrgRole; from: { email: string; name: string | null }; sentAt: number; expiresAt: number }[];
    sent: { orgName: string; email: string; role: OrgRole; sentAt: number; expiresAt: number }[];
  };
  /** When it last left a family, while that is kept, and the day it may join another. */
  leftFamily?: { leftAt: number; joinAnotherFrom: number } | null;
  /** Who else opened the account's root since it was last replaced. */
  rootSeen?: RootSeen[];
  /** The plans the account pays for, as Paddle last said of each. An older server says nothing. */
  subscriptions?: SubscriptionView[];
  /** Its emergency access: whom it named, and who named it. An older server says nothing. */
  emergency?: ExportedEmergency;
  /** Whether its address is watched for breaches, and what was found; null when it is not. An older server says nothing. */
  breachWatch?: ExportedBreachWatch | null;
}

export interface ExportedBreachWatch {
  watchingSince: number;
  checkedAt: number | null;
  breaches: { name: string; title: string; breachDate: string }[];
}

/** Emergency access as `GET /account/export` writes it: who, what and when, never a key, a pin or a box. */
export interface ExportedEmergency {
  /** Since when the account has a contact key; null for none. */
  contactKeySince: number | null;
  /** Those the account named. */
  named: ExportedEmergencyGrant[];
  /** Those who named the account, by its address until it accepts. */
  namedBy: ExportedEmergencyGrant[];
}

export interface ExportedEmergencyGrant {
  /** The other person: the address named, and their name once the account is known. */
  person: { email: string; name: string | null };
  waitDays: number;
  /** The products whose data the contact may read. */
  products: string[];
  namedAt: number;
  acceptedAt: number | null;
  requestedAt: number | null;
  refusedAt: number | null;
  /** When what was handed over was first given to the contact. */
  releasedAt: number | null;
}

/** A family the account is in, as `GET /account/export` writes it: nothing in it is sealed, and nothing opens anything. */
export interface ExportedOrg {
  id: string;
  kind: OrgKind;
  name: string;
  createdAt: number;
  madeByYou: boolean;
  role: OrgRole;
  status: OrgMemberStatus;
  /** Whether the join code was compared when it was confirmed. */
  verified: boolean;
  joinedAt: number;
  confirmedAt: number | null;
  /** Everyone else in it, as the Family view lists them. */
  people: { email: string; name: string | null; role: OrgRole; status: OrgMemberStatus }[];
  /** The shared collections it holds a key to, and how many entries each syncs. Their names are encrypted, and not here. */
  collections: { product: string; createdAt: number; entries: number }[];
  /**
   * Recovery by an organiser: whether it is on for the family; since when the
   * account's root is kept for its organisers, sealed; and whether the account,
   * as an organiser, holds the recovery key. Never a box or a key.
   */
  recovery: { on: boolean; keptSince: number | null; holdsKey: boolean };
  /** When the account page last pinned the family's members and keys, sealed; never the pin. */
  pagePinnedAt: number | null;
  /**
   * The organiser's words that a code was compared (`ConfirmOrgMemberRequest.vouches`)
   * that name the account: whose key, by which organiser, told to whom, and
   * when; never the word. Absent from an older server.
   */
  vouches?: { about: { email: string; name: string | null }; by: { email: string; name: string | null }; to: { email: string; name: string | null }; at: number }[];
}

// --- GET /account/activity --------------------------------------------------

/** What happened to the account. A server may add kinds; a client shows one it does not know plainly. */
export type SecurityEventKind =
  | 'account-created'
  | 'sign-in'
  | 'password-changed'
  | 'password-added'
  | 'recovery-key-changed'
  | 'keys-replaced'
  | 'provider-added'
  | 'provider-removed'
  | 'passkey-added'
  | 'passkey-removed'
  | 'second-step-on'
  | 'second-step-off'
  | 'second-step-recovery-used'
  | 'device-removed'
  | 'email-changed'
  | 'start-over-asked'
  | 'start-over-cancelled'
  | 'started-over';

/**
 * How a session was started: the password; a passkey; Google or GitHub; the
 * account page approved from a product; the recovery key, setting a new
 * password; or the password, or Google or GitHub, then a second step.
 */
export type SignInVia =
  | 'password'
  | 'passkey'
  | 'google'
  | 'github'
  | 'approval'
  | 'recovery-key'
  | 'password+second-step'
  | 'provider+second-step'
  /** Back in with a family organiser's help, setting a new password and replacing the keys. */
  | 'family';

export interface SecurityEvent {
  at: number;
  kind: SecurityEventKind;
  /** The app it came from; `console` is the account page. Null for what the server did on its own, such as a start over taking effect. */
  product: string | null;
  deviceName: string | null;
  /** For a sign-in or a new account: how. */
  via: SignInVia | null;
  /** Two letters, from the network provider; never the address itself. Null when not known. */
  country: string | null;
  /** A passkey's, device's or provider's name, where the kind names one. Never an email address. */
  detail: string | null;
}

/** The last 90 days, newest first. */
export interface ActivityResponse {
  events: SecurityEvent[];
}

// --- POST /account/email/begin, POST /account/email -------------------------

/**
 * Moving the account to a new address, on the owner's proof as for any change
 * to how the account is reached. A code goes to the new address; the answer is
 * the same whether that address is free or not.
 */
export interface EmailChangeBeginRequest extends OwnerProofFields {
  email: string;
}

/** The code the new address received, with the address it was sent to. */
export interface EmailChangeRequest {
  email: string;
  code: string;
}

/** The account's address as kept now. */
export interface EmailChangeResponse {
  email: string;
}

// --- POST /account/password -------------------------------------------------

/**
 * Replaces the account password. The data key does not change — only its
 * wrapping — so nothing is re-encrypted. Proving the *current* password is
 * required: a session token alone must never be enough to take over an
 * account. Every other session is ended.
 */
export interface ChangePasswordRequest {
  currentAuthHash: string;
  authHash: string;
  kdf: AccountKdfParams;
  /**
   * Keyrook Authenticator's data key under the new password. Required on an
   * account without a root. On one with a root, only Authenticator and the
   * account page can send it; without it the old one is marked out of date.
   */
  protectedKey?: SealedBox;
  /**
   * Proof that `protectedKey` wraps Keyrook Authenticator's key
   * (`deriveKeyCheck`). Required with `protectedKey` from the account page,
   * which is not Authenticator and has to show it holds Authenticator's key.
   */
  keyCheck?: string;
  /** The account's root under the new password. Required on an account with a root. */
  rootPasswordWrap?: SealedBox;
  /** On an account with a second step, beside the password or a provider sign-in (`SecondStepProof`). */
  secondStep?: SecondStepProof;
}

/**
 * Keyrook Authenticator wrapping its data key under the current password
 * again, after the password changed through another product, so its older
 * builds sign in again.
 */
export interface ProtectedKeyRequest {
  authHash: string;
  protectedKey: SealedBox;
  /** Proof the key is the account's data key (`deriveKeyCheck`). */
  keyCheck: string;
}

// --- PUT /account/recovery --------------------------------------------------

/**
 * Sets or removes the account's recovery kit. Needs the account password and
 * the data key, not just the session: whoever sets the kit can reset the
 * password through it, and anyone at an unlocked vault holds the data key.
 */
export interface SetRecoveryRequest {
  /** Proof of the current account password. Password accounts. */
  authHash?: string;
  /** A fresh sign-in with the provider. Provider accounts. */
  reauth?: ProviderTicket;
  /** On an account with a second step, beside the password or a provider sign-in (`SecondStepProof`). */
  secondStep?: SecondStepProof;
  keyCheck: string;
  /**
   * The sealed state's `issuedAt`, in the clear so an honest server can refuse
   * a change that is not newer than the one it holds — two devices racing, or
   * one with a slow clock. A hostile server can ignore it; devices still
   * refuse to go backwards on their own.
   */
  issuedAt: number;
  /** What the account's other devices adopt. */
  state: SealedBox;
  /** What a device with nothing but the recovery key is handed. Null removes. */
  wrap: RecoveryWrap | null;
  recoveryAuthHash: string | null;
}

// --- POST /auth/recover, POST /auth/recover/reset ---------------------------

/** Step one of recovering an account with nothing but its recovery key. */
export interface RecoverRequest {
  email: string;
  recoveryAuthHash: string;
}

export interface RecoverResponse {
  wrap: RecoveryWrap;
}

/**
 * Step two: a new password, with proof that the kit really did open the data
 * key. Every existing session is ended.
 */
export interface RecoverResetRequest {
  email: string;
  recoveryAuthHash: string;
  keyCheck: string;
  authHash: string;
  kdf: AccountKdfParams;
  protectedKey: SealedBox;
  deviceId: string;
  deviceName: string;
}

// --- DELETE /account --------------------------------------------------------

/** Irreversible, so it takes the password — or a fresh provider sign-in — not just a session. */
export interface DeleteAccountRequest {
  authHash?: string;
  reauth?: ProviderTicket;
  /** On an account with a second step, beside the password or a provider sign-in (`SecondStepProof`). */
  secondStep?: SecondStepProof;
}

// --- Ways to sign in: Google or GitHub added or removed, a password added ---

/**
 * A Google or GitHub identity added to the account, never by its email alone:
 * the owner's proof, and a fresh sign-in as that identity. `link` is the
 * ticket of a sign-in the page started for this (`purpose=link`);
 * `linkToken` comes from a page sign-in the server answered with
 * `status: 'link'`. Its verified email must be the account's.
 */
export interface LinkIdentityRequest {
  link?: ProviderTicket;
  linkToken?: string;
  authHash?: string;
  reauth?: ProviderTicket;
  passkey?: PasskeyProof;
  /** On an account with a second step, beside the password or a provider sign-in (`SecondStepProof`). */
  secondStep?: SecondStepProof;
}

/** The owner's proof for removing a Google or GitHub identity, while the account keeps another way to sign in. */
export interface UnlinkIdentityRequest {
  authHash?: string;
  reauth?: ProviderTicket;
  passkey?: PasskeyProof;
  /** On an account with a second step, beside the password or a provider sign-in (`SecondStepProof`). */
  secondStep?: SecondStepProof;
}

/**
 * A password for an account that signs in with Google or GitHub. Its root,
 * opened in the browser, wrapped under the new password, with proof it is the
 * account's root; and the owner's proof, a fresh provider sign-in or a passkey.
 * The account signs in with the password from then on, and with its
 * identities as before.
 */
export interface AddPasswordRequest {
  authHash: string;
  kdf: AccountKdfParams;
  rootPasswordWrap: SealedBox;
  rootCheck: string;
  reauth?: ProviderTicket;
  passkey?: PasskeyProof;
  /** On an account with a second step, beside the password or a provider sign-in (`SecondStepProof`). */
  secondStep?: SecondStepProof;
}

// --- GET /sync?since=<serverRev> -------------------------------------------

export interface PullResponse {
  records: RemoteRecord[];
  serverRev: number;
  hasMore: boolean;
  /**
   * The account's recovery-kit state, sealed under the data key, when it
   * changed after `since`. Opaque to the server; see `openRecoveryState`.
   */
  recovery?: SealedBox;
  /**
   * Names the database's history. It changes only when the server is restored
   * from a backup, which forgets every change made after the backup was taken.
   */
  epoch?: string;
}

// --- POST /sync -------------------------------------------------------------

export interface PushRequest {
  records: RemoteRecord[];
  /** The revision the client believes it is up to date with. */
  baseServerRev: number;
}

/**
 * `POST /files`: room for a sealed file of `size` bytes, in the person's own
 * files or, with both family fields, a family's shared collection.
 */
export interface BeginFileRequest {
  id: string;
  size: number;
  orgId?: string;
  collectionId?: string;
}

/** Where the device puts the file, and until when. */
export interface BeginFileResponse {
  url: string;
  expiresAt: number;
}

/** A file as its owner sees it. Nothing here opens it, or says what it is. */
export interface FileView {
  id: string;
  size: number;
  createdAt: number;
  /** Whether the store holds it yet. */
  uploaded: boolean;
  /** The family's collection it is in, for a family's. */
  collectionId: string | null;
  /** Kept with what an account held before it started over; it counts against no room. */
  archived: boolean;
}

export interface FilesResponse {
  files: FileView[];
  /** Bytes taken, and the bytes the plan holds; 0 for a plan that keeps none. */
  used: number;
  allowance: number;
}

/** Where the device reads a file, and until when. */
export interface FileAddress {
  url: string;
  size: number;
  expiresAt: number;
}

export interface PushResponse {
  accepted: { id: string; rev: number; serverRev: number }[];
  /** Records the server refused because it holds a newer revision. */
  conflicts: RemoteRecord[];
  serverRev: number;
  /** Set when a push was trimmed by the account's ceiling on live accounts. */
  rejectedForLimit?: { id: string }[];
}

// --- Errors -----------------------------------------------------------------

export type SyncErrorCode =
  | 'invalid_credentials'
  /** Signed in, but the password or key proof this change needs was wrong. */
  | 'forbidden'
  /** The emailed code was wrong, used, expired, or tried too many times. */
  | 'invalid_code'
  /** A provider identity whose email already belongs to another account. */
  | 'email_taken'
  /** A pairing that has ended, expired, or is not this session's to act on. */
  | 'not_found'
  /** The server could not do something it depends on, such as sending mail. */
  | 'unavailable'
  | 'rate_limited'
  | 'stale_revision'
  | 'payload_too_large'
  /**
   * A build from before keys per product, asked to change an account that
   * has them. It is told to update rather than change what it cannot keep
   * up with.
   */
  | 'update_required'
  | 'unauthorized'
  /**
   * A 401 like `unauthorized`, for a session `DELETE /account/devices/:id`
   * ended: the device was removed from the account. Every product hears it
   * the same way; what it does with it is its own. It says nothing a device
   * should act on without checking `proof` with its own key.
   */
  | 'device_removed'
  /**
   * A 404 for what this server does not offer yet, such as families: nothing
   * to retry until it says otherwise.
   */
  | 'not_offered'
  /** A machine's credential the person removed: it stays told so while it could have been used. */
  | 'machine_removed'
  /** A machine past its expiry: it enrolls again, or a new token is made. */
  | 'machine_expired'
  /** A token machine whose token was made again: the new token is the one to use. */
  | 'machine_replaced'
  /** A machine three of whose requests in a row were denied: it asks nothing more until the person resumes it, and still uses what it was given. */
  | 'machine_paused'
  /** A machine made before the server was restored: it enrolls again. */
  | 'machine_restored';

export interface SyncErrorBody {
  error: SyncErrorCode;
  message: string;
  /** Seconds to wait, on `rate_limited`. */
  retryAfter?: number;
  /** When a limit counted by UTC hour, day or month starts again, in milliseconds, on `rate_limited`. */
  resetAt?: number;
  /** On `device_removed`: the proof the remover sent, as sent, or null when it sent none. Untrusted until checked. */
  proof?: DeviceRemovalProof | null;
}

// --- /account/keys: keys per product ----------------------------------------

/** The account's root, as the server holds it: the public half, and the private half only wrapped. */
export interface RootKeyState {
  publicKey: string;
  /** Goes up when the root itself is replaced. */
  generation: number;
  /** The private half under the account password; null on an account without one. */
  passwordWrap: SealedBox | null;
  /** The private half under the recovery key; null until a recovery key wraps it. */
  recoveryWrap: SealedBox | null;
}

/** A product's key, as the server holds it. */
export interface ProductKeyState {
  box: ProductBox;
  pin: SealedBox;
  /** Goes up when the product replaces its key. */
  keyGeneration: number;
  /** The root generation the box is sealed to. */
  rootGeneration: number;
  /**
   * The recovery key leaked and the root was replaced: the product replaces
   * its own key (`replaceProductKey`) when it is next opened.
   */
  mustReplace: boolean;
}

export interface AccountKeysResponse {
  /** What every box, pin and product pairing is bound to. */
  accountId: string;
  root: RootKeyState | null;
  /** The calling session's product's key; a session never sees another product's. */
  box: ProductKeyState | null;
  /**
   * For showing a person, never for deciding: whether the recovery key
   * protects a product is that product's pin's to say.
   */
  recovery: { wrappedAt: number | null; checkedAt: number | null; products: string[] };
  /** A start over asked for with the email alone, still waiting: any session of the account may cancel it. */
  pendingStartOver: PendingStartOver | null;
  /**
   * The name the person gave the account, as at sign-in (`account.name`), so
   * a product that rarely signs in again keeps up with one changed on the
   * page. Shown as text, never a sign of who anyone is. An older server says
   * nothing.
   */
  name?: string | null;
  /**
   * The account's address now, for the same reason: it may have changed on
   * the page since this product signed in. An older server says nothing.
   */
  email?: string;
  /**
   * The member key of each organisation the account is in, sealed under this
   * product's key (`PUT /orgs/:org/me/boxes/:product`): what a device seals
   * again to a new root when it replaces it. An older server says nothing.
   */
  memberKeyBoxes?: { orgId: string; box: OrgBox }[];
  /** Who else opened the account's root, until it is replaced: this product asks for that too. An older server says nothing. */
  rootSeen?: RootSeen[];
}

/**
 * A start over asked for with the email alone, which takes effect at
 * `executesAt` unless a session of the account cancels it first
 * (`DELETE /account/start-over`).
 */
export interface PendingStartOver {
  requestedAt: number;
  executesAt: number;
  /** The device that asked, as it named itself. */
  deviceName: string;
}

/**
 * The recovery key just opened the root on this device, typed whole: the
 * server checks its proof and notes when, so people are reminded to look for
 * it again. A reminder only; a product decides from its own pin.
 */
export interface RecoveryCheckedRequest {
  rootRecoveryAuthHash: string;
}

/**
 * Gives an account its root, once. The root must open with what the account
 * has: the password, on a password account; the recovery key, on one that
 * signs in with Google or GitHub. Proof of the owner as for any change.
 */
export interface CreateRootRequest {
  publicKey: string;
  passwordWrap: SealedBox | null;
  recoveryWrap: SealedBox | null;
  /** Proof of the recovery key `recoveryWrap` is under. */
  recoveryAuthHash: string | null;
  /** `deriveRootCheck` of this root, which the server keeps hashed to check its holder later. */
  rootCheck: string;
  /**
   * `recoveryWrap` is under the recovery key the account already has (Keyrook
   * Authenticator's kit's): refused unless it is, so a mistyped sheet never
   * becomes the only way back in.
   */
  keepsRecoveryKey?: boolean;
  /** Proof of the account password. Password accounts. */
  authHash?: string;
  /** A fresh sign-in with the provider. Provider accounts. */
  reauth?: ProviderTicket;
  /** On an account with a second step, beside the password or a provider sign-in (`SecondStepProof`). */
  secondStep?: SecondStepProof;
}

/**
 * Wraps the root under a recovery key: the first one, or a new one that
 * retires the last. Proof of the owner, and of holding the root.
 */
export interface SetRootRecoveryRequest {
  recoveryWrap: SealedBox;
  recoveryAuthHash: string;
  rootCheck: string;
  /** As in `CreateRootRequest`: the recovery key of Keyrook Authenticator's kit, checked. */
  keepsRecoveryKey?: boolean;
  authHash?: string;
  reauth?: ProviderTicket;
  /** On an account with a second step, beside the password or a provider sign-in (`SecondStepProof`). */
  secondStep?: SecondStepProof;
}

/** Asks for a code to the account's address, to reset the password with the recovery key. */
export interface RecoverCodeRequest {
  email: string;
}

/** The root, wrapped under the recovery key, for whoever proves the recovery key. */
export interface RootRecoverRequest {
  email: string;
  recoveryAuthHash: string;
}

export interface RootRecoverResponse {
  accountId: string;
  recoveryWrap: SealedBox;
}

/**
 * A new password through the recovery key, on an account with a root. Takes
 * the recovery key, the code sent to the address, and proof the recovery key
 * opened the account's real root: someone who found the printed sheet still
 * needs the inbox, and a planted wrap opens nothing the check accepts.
 */
export interface RootRecoverResetRequest {
  email: string;
  recoveryAuthHash: string;
  code: string;
  rootCheck: string;
  authHash: string;
  kdf: AccountKdfParams;
  /** The root under the new password. */
  rootPasswordWrap: SealedBox;
  deviceId: string;
  deviceName: string;
}

/** Seals the calling session's product's key to the root. The first device of a product wins. */
export interface CreateBoxRequest {
  box: ProductBox;
  pin: SealedBox;
  /** Proof of holding the key in the box (`deriveProductKeyCheck`). */
  keyCheck: string;
  /** The root generation the box is sealed to; refused unless it is the current one. */
  rootGeneration: number;
}

/** Replaces the box and pin of the same key: sealed to a new root, or a pin updated. */
export interface UpdateBoxRequest extends CreateBoxRequest {
  /** The key generation the caller holds; refused unless it is the current one. */
  keyGeneration: number;
}

/**
 * A product replaces its own key: the recovery key leaked (`mustReplace`).
 * The new key's box is sealed to the current root; `previousKeyCheck` proves
 * the key it replaces.
 */
export interface ReplaceBoxRequest extends UpdateBoxRequest {
  previousKeyCheck: string;
}

/**
 * Replaces the account's root, from a device of a product that holds its key:
 * the recovery key was lost on an account without a password, it leaked, or
 * the password is forgotten while a device is still open. Every other session
 * ends, the root's old wraps are gone at once, and the address is told.
 */
export interface RotateRootRequest {
  publicKey: string;
  rootCheck: string;
  /** The new root under the password: the current one, or `newPassword`'s. Password accounts. */
  passwordWrap: SealedBox | null;
  /** The new root under a new recovery key. Required on an account without a password. */
  recoveryWrap: SealedBox | null;
  recoveryAuthHash: string | null;
  /** The calling product's key, sealed to the new root, with its pin. */
  box: ProductBox;
  pin: SealedBox;
  /** Proof of the key in `box`. */
  keyCheck: string;
  /**
   * When `box` holds a new key for the product — the recovery key leaked —
   * proof of the key it replaces.
   */
  previousKeyCheck?: string;
  /**
   * Each family's member key this product holds a box of, sealed again to the
   * new root: exactly those, as `memberKeyBoxes` lists.
   */
  memberRootBoxes?: { orgId: string; box: OrgBox }[];
  /** Proof of the owner: the current password, */
  authHash?: string;
  /** or a fresh sign-in with the provider, */
  reauth?: ProviderTicket;
  /** or, with `newPassword`, a code sent to the address. */
  code?: string;
  /** A new password, when the old one is forgotten. Needs `code`. */
  newPassword?: { authHash: string; kdf: AccountKdfParams };
  /** On an account with a second step, beside the password or a provider sign-in (`SecondStepProof`). */
  secondStep?: SecondStepProof;
}

// --- The account page's keys -------------------------------------------------

/**
 * Every product's box, for the account page, which opens them with the root
 * to seal them again (`/account/console/rotate`) or bring their pins up to
 * date (`/account/console/pins`). A product's own session never sees another
 * product's box.
 */
export interface ConsoleKeysResponse {
  accountId: string;
  root: RootKeyState | null;
  /** Every product's box, sealed to the root. */
  products: ({ product: string } & ProductKeyState)[];
  /**
   * Keyrook Authenticator's wrap for its older builds, opened at rest, as a
   * sign-in would hand it. Null when it has none, or it is out of date.
   */
  protectedKey: SealedBox | null;
  /** Whether Keyrook Authenticator 0.3 can still use the account (`legacy_retired`). */
  olderAuthenticator: 'active' | 'retired';
  /** The root wrapped under each passkey that unlocks it now; absent from a server without passkeys. */
  passkeyWraps?: { id: string; rootWrap: SealedBox }[];
  /** The member key of each organisation the account is in, sealed to the root; absent from a server without families. */
  memberRootBoxes?: { orgId: string; box: OrgBox }[];
}

/**
 * The account page gives an account that only Keyrook Authenticator has used
 * its root, and Authenticator's key its box, in one step: Authenticator's key
 * opened in the browser from its wrap under the password, or from its old
 * kit with the recovery key (`POST /account/recovery/wrap`). The server checks
 * the box holds Authenticator's key by its key check, and that a recovery
 * wrap is under the kit's own recovery key, so the account keeps one.
 */
export interface ConsoleRootRequest {
  publicKey: string;
  rootCheck: string;
  /** Under the password; null on an account without one. */
  passwordWrap: SealedBox | null;
  /** Under the old kit's recovery key; null when none was typed (an account with a password). */
  recoveryWrap: SealedBox | null;
  recoveryAuthHash?: string;
  /** Keyrook Authenticator's key, sealed to the new root, its pin, and its key check. */
  box: ProductBox;
  pin: SealedBox;
  keyCheck: string;
  authHash?: string;
  reauth?: ProviderTicket;
  /** On an account with a second step, beside the password or a provider sign-in (`SecondStepProof`). */
  secondStep?: SecondStepProof;
}

/**
 * The account page replaces the root and seals every product's key to the new
 * one in one transaction: the recovery key was lost (a password account), or
 * leaked.
 */
export interface ConsoleRotateRequest {
  publicKey: string;
  rootCheck: string;
  /** Under the password; null on an account without one. */
  passwordWrap: SealedBox | null;
  recoveryWrap: SealedBox;
  recoveryAuthHash: string;
  /** Every product whose box is sealed to the current root, sealed again to the new one. */
  products: { product: string; box: ProductBox; pin: SealedBox; keyCheck: string; keyGeneration: number }[];
  /** The recovery key leaked: every product must replace its own key when next opened. */
  leaked: boolean;
  /** Each organisation's member key, sealed again to the new root: one for each the account is in. */
  memberRootBoxes?: { orgId: string; box: OrgBox }[];
  authHash?: string;
  reauth?: ProviderTicket;
  /** On an account with a second step, beside the password or a provider sign-in (`SecondStepProof`). */
  secondStep?: SecondStepProof;
}

/** Each product's pin brought up to date by the account page, after a recovery key was made or typed there. */
export interface ConsolePinsRequest {
  pins: { product: string; pin: SealedBox; keyCheck: string; keyGeneration: number }[];
}

// --- /auth/start-over: nothing left but the email ----------------------------

/**
 * Asks for a code to start the account over. The answer is the same whether
 * or not the address has an account.
 */
export interface StartOverCodeRequest {
  email: string;
}

/** Spends the code, and says what the new keys are bound to. */
export interface StartOverBeginRequest {
  email: string;
  code: string;
}

export interface StartOverBeginResponse {
  /** The account's id, the same as before: what every new wrap, box and pin is bound to. */
  accountId: string;
  method: 'password' | 'provider';
  /** Stands for the code in the next step, once, for a few minutes. */
  ticket: string;
}

/**
 * Asks to start the account over. It takes effect a week later
 * (`StartOverScheduledResponse`) unless a session of the account cancels it:
 * then what it held is put aside, still sealed, for 90 days, the account gets
 * this new root and the calling product's new key, and every session ends.
 * The address is told when it is asked for, the day before, and when it
 * happens or is cancelled.
 */
export interface StartOverRequest {
  /** A build that knows a start over waits says so; one that does not is told to update. */
  schedule: true;
  email: string;
  ticket: string;
  /** A password account's new password. An account without one sends neither. */
  authHash?: string;
  kdf?: AccountKdfParams;
  /** `accountId` is the one `StartOverBeginResponse` gave. */
  keys: InitialKeys;
  deviceId: string;
  deviceName: string;
}

/** When the start over asked for takes effect. No session is issued: until then the account is as it was. */
export interface StartOverScheduledResponse {
  executesAt: number;
}

// --- /account/archives: what an account held before it started over --------

export interface AccountArchive {
  id: string;
  archivedAt: number;
  /** When it is deleted. The address is reminded a week before. */
  expiresAt: number;
  /** The old password's KDF, to derive what proves it. Null on an account that had none. */
  kdf: AccountKdfParams | null;
  /** The root as it was. Its wraps are handed out only for proof of the old password or recovery key. */
  root: { publicKey: string; generation: number; underPassword: boolean; underRecoveryKey: boolean } | null;
  /** The calling product's key as it was, sealed to that root. */
  box: ProductKeyState | null;
  /** Keyrook Authenticator's wrap and kit from before keys per product; to Authenticator only. */
  legacy: { underPassword: boolean; underRecoveryKey: boolean } | null;
  /** How many of the calling product's records it holds. */
  records: number;
}

export interface AccountArchivesResponse {
  archives: AccountArchive[];
}

/** Proof of the old password or the old recovery key; one of the two. */
export interface OpenArchiveRequest {
  /** Derived from the old password with the archive's `kdf`. */
  authHash?: string;
  recoveryAuthHash?: string;
}

/** What the proof opens: the root's wrap under it, and, to Authenticator, its own old one. */
export interface OpenArchiveResponse {
  rootPasswordWrap?: SealedBox;
  rootRecoveryWrap?: SealedBox;
  protectedKey?: SealedBox;
  legacyRecoveryWrap?: RecoveryWrap;
}

export interface ArchivedRecordsResponse {
  records: RemoteRecord[];
  /** The `after` for the next page; null on the last. */
  next: number | null;
}

/**
 * Deletes an archive before it expires: the whole of it, for proof of the old
 * root, or the calling product's part, for proof of its old key. The inbox
 * alone deletes nothing.
 */
export interface DeleteArchiveRequest {
  rootCheck?: string;
  keyCheck?: string;
}

// --- /account/billing: the plans Paddle and the App Store sell ----------------

/** A plan a person pays for, as the store that sold it last said of it. */
export interface SubscriptionView {
  /** The store's id for it: Paddle's, or `apple_` and the App Store's original transaction. */
  id: string;
  /**
   * Who sold it: Paddle, on the web, whose own page changes it; or Apple,
   * in an app, where only the person's Apple account settings change or
   * cancel it.
   */
  store: 'paddle' | 'apple';
  plan: 'personal' | 'family';
  /** The family it is for; null for a person's plan, or a family that is gone. */
  orgId: string | null;
  /**
   * In Paddle's words, whichever store: `active`, `trialing`, `past_due` and
   * the plan holds; `paused` or `canceled` and it does not.
   */
  status: string;
  /** When it is next paid for; null when it is not. */
  renewsAt: number | null;
  /** When it ends, once cancelled; null while it renews. */
  endsAt: number | null;
}

/** `GET /account/billing`: what the person's plans hold and what they pay for. Any product may read it. */
export interface BillingView {
  /** Whether this server sells plans now, on the account page. A plan sold before is honoured either way. */
  offered: boolean;
  /**
   * The App Store products an app sells the plans as, through Apple's
   * in-app purchase, while it does; null while it does not.
   */
  appStore: { personal: string; family: string } | null;
  /** The person's own plan: paid for by them, or by a family they are in. */
  personal: 'free' | 'paid';
  /** Each family the person is in, its plan, and whether they may buy one for it. */
  families: { orgId: string; name: string; organiser: boolean; plan: 'free' | 'paid' }[];
  /** What the person pays for, not counting what has ended. */
  subscriptions: SubscriptionView[];
}

/** `POST /account/billing/checkout`, from the account page alone: a plan for oneself, or for a family one organises. */
export type CheckoutRequest = { plan: 'personal' } | { plan: 'family'; orgId: string };

/**
 * Where to pay: Paddle's checkout, on the payment page, never on the account
 * page. `POST /account/billing/manage` answers the same for the person's own
 * page at Paddle, a few minutes long.
 */
export interface BillingLink {
  url: string;
}

/**
 * `POST /account/billing/apple`, from an app, with a `CheckoutRequest`: what
 * to buy through Apple's in-app purchase. The token goes to StoreKit as the
 * purchase's `appAccountToken`; Apple hands it back with every transaction of
 * the subscription, and it names whom the plan is for. Asked again for the
 * same plan, it is the same.
 */
export interface AppleCheckout {
  productId: string;
  appAccountToken: string;
}

/** `POST /account/billing/manage`: the plan to change, cancel, or see receipts of. */
export interface ManageBillingRequest {
  subscription: string;
}

// --- /orgs: families ----------------------------------------------------------

/**
 * A box a device sealed: to a member's key, or under a key the server never
 * holds. The server keeps it and hands it back as sent, and opens none; what
 * a device takes from one it checks itself.
 */
export type OrgBox = Record<string, unknown>;

export type OrgKind = 'family' | 'team' | 'business';
/** An organiser (`owner`) or a member. A family has one or two organisers. */
export type OrgRole = 'owner' | 'member';
/** Accepted an invitation and waits for an organiser; or confirmed, and holds the organisation key. */
export type OrgMemberStatus = 'accepted' | 'confirmed';

/**
 * Who is in the organisation, each with their member key, as its organisers'
 * devices last wrote it, MAC'd under the organisation key. The server keeps
 * only the newest, cannot check the MAC, and takes a version only one above
 * the one it holds; each device pins the newest it has seen.
 */
export interface OrgRoster {
  version: number;
  generation: number;
  body: Record<string, unknown>;
  mac: string;
}

/** Someone joining: their member key's public half, its private half sealed to their root, and under an app's key. */
export interface NewOrgMember {
  key: string;
  rootBox: OrgBox;
  /** Under the key of the app asking, so its devices open it without the root. An app may seal only to its own. */
  productBox?: { product: string; box: OrgBox };
}

/** `GET /orgs`: an account's organisations, and the invitations waiting at its address. */
export interface OrgsResponse {
  orgs: {
    id: string;
    kind: OrgKind;
    name: string;
    role: OrgRole;
    status: OrgMemberStatus;
    verified: boolean;
  }[];
  invitations: {
    /** What the invited address declines it by (`DELETE /orgs/:org/invites/:id`). */
    id: string;
    orgId: string;
    orgName: string;
    kind: OrgKind;
    role: OrgRole;
    invitedBy: { name: string | null; email: string };
    expiresAt: number;
  }[];
}

/**
 * `POST /orgs`: a family, made by its first organiser. The id is the
 * device's own, as an account's is: the roster's MAC and every box bind it,
 * so it is chosen before they are made.
 */
export interface CreateOrgRequest {
  id: string;
  kind: 'family';
  name: string;
  member: NewOrgMember;
  /** Version 1, generation 1: the organiser alone. */
  roster: OrgRoster;
  /** The organisation key, sealed to the organiser's own member key. */
  orgKeyBox: OrgBox;
}

/** A person in the organisation, as the server holds them. Who they are, and their key, is the roster's to say. */
export interface OrgMember {
  accountId: string;
  email: string;
  name: string | null;
  role: OrgRole;
  status: OrgMemberStatus;
  verified: boolean;
  memberKey: string;
  joinedAt: number;
  confirmedBy: string | null;
  confirmedAt: number | null;
}

/** An invitation still waiting, as its organisers see it. */
export interface OrgInvite {
  id: string;
  email: string;
  role: OrgRole;
  invitedBy: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * What a family's plan lets it do. The server's word, which it holds itself
 * to: it decides what a person is offered, and nothing a device opens or
 * trusts.
 */
export interface FamilyAllowance {
  /** Live collections, every product's together. What is past it stays; only a new one is refused. */
  collections: number;
  /** An organiser turning on recovery for the family. Once on, it stays. */
  memberRecovery: boolean;
  /** Letting someone into a shared vault to view it only. Those set already stay as they are. An older server says nothing, which is no. */
  viewOnly?: boolean;
}

/** `GET /orgs/:org`: the organisation as one of its people sees it, with their own boxes. */
export interface OrgDetail {
  org: { id: string; kind: OrgKind; name: string; generation: number; rotationDue: boolean; createdAt: number };
  allowance: FamilyAllowance;
  roster: OrgRoster;
  members: OrgMember[];
  me: {
    role: OrgRole;
    status: OrgMemberStatus;
    verified: boolean;
    rootBox: OrgBox;
    /** The page sees each app's; an app only its own. */
    productBoxes: { product: string; box: OrgBox }[];
    /** The page only: what it last pinned of the family, sealed under a key the root makes (`PUT /orgs/:org/me/page-pin`). */
    pagePin?: OrgBox | null;
    /** None until an organiser confirms them. */
    orgKeyBoxes: { generation: number; senderId: string; box: OrgBox }[];
    collectionKeyBoxes: { collectionId: string; generation: number; senderId: string; box: OrgBox }[];
    /**
     * Each organiser's word to the caller that a key is someone's, made when
     * they compared it (`ConfirmOrgMemberRequest.vouches`): only the two of
     * them could make one. Absent from an older server.
     */
    vouches?: { accountId: string; by: string; tag: string }[];
  };
  /** Organisers only. */
  invites?: OrgInvite[];
  /** Every collection to an organiser, who lets people in and out and rotates; to anyone else, those they hold a key of. */
  collections: OrgCollection[];
  /** An organiser recovering a member. */
  recovery: OrgRecovery;
}

/**
 * Recovery by an organiser, as one of the family sees it. The recovery key's
 * public half is in the roster; its private half goes to each organiser, and
 * each member who turns it on seals their own root to it.
 */
export interface OrgRecovery {
  /** An organiser turned it on, and nobody who held its key has gone since. */
  on: boolean;
  /** The recovery key's generation: the one in use while on, the last one made while off. */
  generation: number;
  /** The caller's root is sealed to the recovery key in use. */
  mine: boolean;
  /** Organisers only: their own box of the recovery key in use, and who sealed it. */
  keyBox?: { senderId: string; box: OrgBox } | null;
  /** Organisers only: who has their root sealed to it. */
  members?: string[];
  /** Organisers only: those asking for help now, each with their new browser's key. */
  requests?: OrgRecoveryRequest[];
}

export interface OrgRecoveryRequest {
  id: string;
  accountId: string;
  /** The new browser's key, for the code and the box: as the server says, until the codes match. */
  browserKey: string;
  createdAt: number;
  expiresAt: number;
  /** Who handed the root over, and when; null until someone does. */
  handedBy: string | null;
}

/** A shared collection: its name sealed under its own key, and whose keys it is under, never what is in it. */
export interface OrgCollection {
  id: string;
  product: string;
  generation: number;
  /** Someone who held its key is gone: the next rotation gives it a new one. */
  rotationDue: boolean;
  /** Its name, under its key of `generation` (`keyrook.collection-name:v1:<org>:<collection>:<generation>`). */
  nameBox: OrgBox;
  /** The accounts holding its key of the generation in use. The server's word: a device seals to `holdersBox`, never to this. */
  holders: string[];
  /** Who holds it, under its key of `generation` (`keyrook.collection-holders:v1:<org>:<collection>:<generation>`). Absent from one made before there was any. */
  holdersBox?: OrgBox;
  /**
   * View only is on: each generation from then has a write key, and those it
   * lists may only view. The server's word, for what the page shows; a device
   * takes who may edit from its own access box and the signed list of holders.
   * An older server says nothing, which is off.
   */
  viewOnly?: boolean;
  viewers?: string[];
}

/** `POST /orgs/:org/invites`: an address, mailed. No secret goes with it: the account that proves the address finds it. */
export interface OrgInviteRequest {
  email: string;
  role: OrgRole;
}

/** `POST /orgs/:org/accept`: by the account at the invited address. */
export interface AcceptOrgInviteRequest {
  member: NewOrgMember;
}

/**
 * `POST /orgs/:org/members/:account/confirm`: by an organiser, once the join
 * code matched (`verified`), or without comparing it, which leaves the member
 * unverified on every device until they do.
 */
export interface ConfirmOrgMemberRequest {
  verified: boolean;
  /** One version up, with the member's line. */
  roster: OrgRoster;
  /** The organisation key, sealed to the member's key, for the generation in use. */
  orgKeyBox: OrgBox;
  /** A key for each collection they are let into, of its generation in use. */
  collectionKeyBoxes: { collectionId: string; generation: number; box: OrgBox; holdersBox?: OrgBox; viewer?: boolean }[];
  /** Invited as an organiser while recovery is on: the recovery key sealed to them, as `OrgRoleRequest` has. */
  recoveryKeyBox?: OrgBox;
  /**
   * Only once the code matched: the organiser's word that the member's key is
   * theirs, to each confirmed member the roster lists, the organiser too
   * (`vouchFor`), so their devices take it without comparing a code again.
   */
  vouches?: { accountId: string; tag: string }[];
}

/**
 * `POST /orgs/:org/members/:account/verify`: an organiser compared the code
 * of someone already in the family. The roster one version up, marking them
 * verified, and the organiser's word to everyone else, as `ConfirmOrgMemberRequest`.
 */
export interface VerifyOrgMemberRequest {
  roster: OrgRoster;
  vouches?: { accountId: string; tag: string }[];
}

/**
 * `POST /orgs/:org/rotate`: by an organiser, from the page or an app, after
 * someone left or was removed; by anyone confirmed, from the page alone, in a
 * family a start over left with no organiser. The organisation key one
 * generation up, sealed to every confirmed member left, the organiser too;
 * the roster without the one who went, MAC'd under the new key; and a new key
 * for each marked collection the organiser holds, to everyone still holding
 * it, with its name sealed again under it. An app sends only its own
 * product's. A marked collection not here stays marked, for anyone who
 * holds it (`RotateCollectionRequest`).
 * The keys are sealed to the members of the pinned roster, never to keys the
 * server hands over.
 */
export interface RotateOrgRequest {
  generation: number;
  roster: OrgRoster;
  orgKeyBoxes: { accountId: string; box: OrgBox }[];
  collections: { collectionId: string; generation: number; nameBox: OrgBox; holdersBox?: OrgBox; keyBoxes: { accountId: string; box: OrgBox }[]; viewers?: string[] }[];
}

/**
 * `PUT /orgs/:org/role/:account`: an organiser makes another confirmed member
 * an organiser, or steps down while another is left. The roster says who is
 * which, so it moves one version up with it.
 */
export interface OrgRoleRequest {
  role: OrgRole;
  roster: OrgRoster;
  /** While recovery is on, the recovery key sealed to the new organiser, from the one naming them. */
  recoveryKeyBox?: OrgBox;
}

/**
 * `PUT /orgs/:org/me/boxes/:product`: the caller's member key sealed under a
 * product's key, so that product's devices open it without the root. An app
 * puts only its own; the page any. It replaces the one there, as a product
 * key replaced makes the old box unopenable.
 */
export interface OrgProductBoxRequest {
  box: OrgBox;
}

/**
 * `POST /orgs/:org/collections`: by an organiser. A new collection of one
 * product at generation 1, its key sealed to each confirmed member let in.
 * The id is the device's own, as a family's is: the name's seal binds it.
 */
export interface CreateCollectionRequest {
  id: string;
  product: string;
  nameBox: OrgBox;
  holdersBox?: OrgBox;
  keyBoxes: { accountId: string; box: OrgBox }[];
  /** With view only on: those of `keyBoxes` who may only view, none an organiser. Absent, it is off. */
  viewers?: string[];
}

/** `PUT /orgs/:org/collections/:id`: a new name, sealed under the key in use. */
export interface RenameCollectionRequest {
  generation: number;
  nameBox: OrgBox;
}

/**
 * `POST /orgs/:org/collections/:id/keys`: confirmed members let in. Each
 * gets the key in use, and may get older generations too, to read records
 * not yet sealed again under the new one.
 */
export interface CollectionKeysRequest {
  keyBoxes: { accountId: string; generation: number; box: OrgBox }[];
  /** Who holds it now, those let in too. */
  holdersBox?: OrgBox;
  /** Of those let in, who may only view, where view only is on. */
  viewers?: string[];
}

/** `PUT /orgs/:org/collections/:id/editors/:account`: someone who could only view may edit, from an organiser's access box with the private half. */
export interface CollectionEditorRequest {
  generation: number;
  box: OrgBox;
  holdersBox: OrgBox;
}

/**
 * `POST /orgs/:org/collections/:id/rotate`: the collection's key one
 * generation up, sealed to exactly those who stay in it, with its name under
 * the new key. Whoever held it and gets no box is let out, their boxes gone.
 * By an organiser; or, while it is marked and once the family's key has
 * changed, by anyone holding it, to exactly those holding it.
 */
export interface RotateCollectionRequest {
  generation: number;
  nameBox: OrgBox;
  holdersBox?: OrgBox;
  keyBoxes: { accountId: string; box: OrgBox }[];
  /** Who may only view from this generation: view only turned on, or someone who could edit made a viewer. Absent, as they were. */
  viewers?: string[];
}

/**
 * A family's record: an account's record with the collection it belongs to,
 * for ever, and the generation of the collection key it is sealed under.
 * Both are in what the seal covers
 * (`keyrook.org-record:v1:<org>:<collection>:<generation>:<id>:<rev>`).
 */
export interface OrgRecord extends RemoteRecord {
  collectionId: string;
  generation: number;
}

/**
 * `GET /orgs/:org/sync?since=&collection=`: the records of the asking
 * product's collections the caller holds the key of, by the family's own
 * counter. `collection` pulls one collection alone, from zero when it is new
 * to the device.
 */
export interface OrgPullResponse {
  records: OrgRecord[];
  serverRev: number;
  hasMore: boolean;
  /** The database's history, as for an account's records: a restore changes it. */
  epoch: string;
}

/** `POST /orgs/:org/sync`: as `/sync`, each record written under its collection's key in use. */
export interface OrgPushRequest {
  records: OrgRecord[];
}

export interface OrgPushResponse {
  accepted: { id: string; rev: number; serverRev: number }[];
  /** Records the server refused because it holds a newer revision. */
  conflicts: OrgRecord[];
  serverRev: number;
  /** Set when a push was trimmed by the family's ceiling on what it shares. The device keeps those. */
  rejectedForLimit?: { id: string }[];
}

/**
 * `POST /orgs/:org/recovery`: an organiser turns recovery on. The next
 * recovery key, sealed to every confirmed organiser, the caller too; the
 * roster one version up, listing its public half.
 */
export interface OrgRecoveryOnRequest {
  generation: number;
  roster: OrgRoster;
  keyBoxes: { accountId: string; box: OrgBox }[];
}

/** `DELETE /orgs/:org/recovery`: an organiser turns it off; the roster one version up, listing no recovery key. */
export interface OrgRecoveryOffRequest {
  roster: OrgRoster;
}

/** `PUT /orgs/:org/me/recovery`: the caller's root, sealed by their own device to the recovery key in use, from their member key. */
export interface OrgRecoveryBoxRequest {
  generation: number;
  box: OrgBox;
}

/** `POST /orgs/:org/recovery/requests/:id/box`: the member's root sealed to the recovery key, for the organiser answering their request. The member is mailed. */
export interface OrgRecoveryBoxResponse {
  accountId: string;
  generation: number;
  box: OrgBox;
}

/** `POST /orgs/:org/recovery/requests/:id/handover`: the root, from the organiser's member key to the request's browser key. */
export interface OrgRecoveryHandoverRequest {
  box: OrgBox;
}

// --- /auth/family-recovery: a member asking their family's organiser --------

export interface FamilyRecoveryCodeRequest {
  email: string;
}

/**
 * `POST /auth/family-recovery`: the code mailed to the address, and the key
 * the new browser made for this request. Answered only for an account in a
 * family whose organisers hold its root.
 */
export interface FamilyRecoveryAskRequest {
  email: string;
  code: string;
  browserKey: string;
  /** On an account with a second step: the code its authenticator app shows. Without it, nobody is asked. */
  secondStep?: { code: string };
}

/**
 * `POST /auth/family-recovery` on an account with a second step, asked
 * without it: nothing was asked of anyone, and the emailed code stands for
 * the request that brings the code (`secondStep`).
 */
export interface FamilyRecoveryStepRequired {
  secondStep: true;
}

export interface FamilyRecoveryAskResponse {
  id: string;
  /** What the browser shows again for each step of this request: a secret, never in a URL. */
  ticket: string;
  accountId: string;
  orgId: string;
  orgName: string;
  expiresAt: number;
  /** Who can help, each with their member key as the server says, for the code each should see. */
  organisers: { accountId: string; email: string; name: string | null; memberKey: string }[];
}

/** `POST /auth/family-recovery/:id`: where the request stands. */
export interface FamilyRecoveryStatusRequest {
  ticket: string;
}

export interface FamilyRecoveryStatusResponse {
  expiresAt: number;
  /** Once an organiser handed the root over: who, and the box. */
  handover: { organiserId: string; box: OrgBox } | null;
  /** Once handed over: what is sealed to the root now, to be sealed again to the next one. */
  keys: FamilyRecoveryKeys | null;
}

export interface FamilyRecoveryKeys {
  accountId: string;
  /** A password account chooses a new password; one without wraps the new root under the recovery key alone. */
  method: 'password' | 'provider';
  root: { publicKey: string; generation: number };
  /** Every product's box, as the account page sees them. */
  products: { product: string; box: ProductBox; keyGeneration: number; rootGeneration: number }[];
  /** The member key of each organisation the account is in, sealed to the root. */
  memberRootBoxes: { orgId: string; box: OrgBox }[];
  /** Keyrook Authenticator's older builds still open a wrap under the password. */
  olderAuthenticator: 'active' | 'retired';
}

/**
 * `POST /auth/family-recovery/:id/finish`: the root replaced at once, as the
 * account page replaces it, with what proves the handed root is the
 * account's (`previousRootCheck`), and a session for the page.
 */
export interface FamilyRecoveryFinishRequest {
  ticket: string;
  previousRootCheck: string;
  publicKey: string;
  rootCheck: string;
  passwordWrap: SealedBox | null;
  recoveryWrap: SealedBox;
  recoveryAuthHash: string;
  products: { product: string; box: ProductBox; pin: SealedBox; keyCheck: string; keyGeneration: number }[];
  memberRootBoxes: { orgId: string; box: OrgBox }[];
  /** A password account's new password. */
  newPassword?: { authHash: string; kdf: AccountKdfParams };
  deviceId: string;
  deviceName: string;
}

/** The waits a grantor may choose between asking and access, in days. */
export const EMERGENCY_WAITS = [1, 3, 7, 14, 30] as const;
export type EmergencyWait = (typeof EMERGENCY_WAITS)[number];

/**
 * One grant of emergency access between two accounts, as either side sees it.
 * `other*` is the other side: the contact for the grantor, the grantor for the
 * contact. Their key is the server's word until the two compared the code.
 */
export interface EmergencyGrant {
  id: string;
  grantorId: string;
  /** Null until the person named accepts. */
  contactId: string | null;
  otherEmail: string;
  otherName: string | null;
  /** The other side's contact key, once both have one and the contact accepted. */
  otherKey: string | null;
  waitDays: EmergencyWait;
  /** The products whose keys are handed over, in the grantor's choice. */
  products: string[];
  /** The products a handover box is waiting for. */
  boxes: string[];
  createdAt: number;
  acceptedAt: number | null;
  requestedAt: number | null;
  refusedAt: number | null;
  releasedAt: number | null;
  /** When access opens if nobody refuses: the request and the wait. */
  opensAt: number | null;
}

/** `GET /emergency`: the caller's contact key, pins, whom they named and who named them. */
export interface EmergencyState {
  /**
   * The caller's contact key, sealed for this session: under its product's
   * key, or to the root for the account page, which is also given every
   * product's box of it, to open the key by once the root was replaced.
   */
  myKey: { publicKey: string; box: OrgBox | null; productBoxes?: { product: string; box: OrgBox }[] } | null;
  /** The caller's own pins of others' keys: each sealed under one of their products' keys. */
  pins: { contactId: string; product: string; box: OrgBox }[];
  named: EmergencyGrant[];
  namedMe: EmergencyGrant[];
}

/** `PUT /emergency/key`: the caller's contact key, the first time, or another box of the same key. */
export interface EmergencyKeyRequest {
  publicKey: string;
  /** The private half sealed to the root: required the first time, and sent again once the root was replaced. */
  rootBox?: OrgBox;
  /** The private half under each product's key the caller holds. */
  productBoxes?: { product: string; box: OrgBox }[];
}

/** `POST /emergency/contacts`: naming someone, by address. */
export interface EmergencyNameRequest {
  email: string;
  waitDays: EmergencyWait;
  products: string[];
}

/** `PATCH /emergency/contacts/:id`: the wait, or the products, changed. */
export interface EmergencyChangeRequest {
  waitDays?: EmergencyWait;
  products?: string[];
}

/** `GET /emergency/named-by/:grantor/sync`: the grantor's records of one product, read only. */
export interface EmergencyPullResponse {
  records: RemoteRecord[];
  serverRev: number;
  hasMore: boolean;
}

/** `POST /breach/ranges`: the first five characters of passwords' SHA-1, in upper-case hex. The passwords never leave the device. */
export interface BreachRangesRequest {
  prefixes: string[];
}

/** By prefix: every suffix Pwned Passwords knows under it, `SUFFIX:COUNT` a line, padded with lines of count 0. */
export interface BreachRangesResponse {
  ranges: Record<string, string>;
}

/** A breach an address is in, as Have I Been Pwned published it. */
export interface BreachView {
  /** Its name there, which stays the same. */
  name: string;
  title: string;
  /** The site's domain; empty for none. */
  domain: string;
  /** `YYYY-MM-DD`; empty when not known. */
  breachDate: string;
  /** What was taken: "Email addresses", "Passwords" and the like. */
  dataClasses: string[];
}

/** `GET /breach/account`: whether the account's address is watched, and the breaches it was found in. */
export interface BreachWatchState {
  /** Whether this server can watch an address at all. */
  offered: boolean;
  /** Since when it is watched; null when it is not. */
  watchingSince: number | null;
  /** When it was last looked up; null before the first. */
  checkedAt: number | null;
  breaches: BreachView[];
}

/** `PUT /breach/account`: watch the account's address, or stop. */
export interface BreachWatchRequest {
  watch: boolean;
}

/** `POST /sends`: a Send, its body sealed, the hash of its access token, and the size of each file it holds, sealed. */
export interface SendRequest {
  id: string;
  body: OrgBox;
  accessHash: string;
  /** From 1 to 100. */
  opens: number;
  /** How long it lives, in milliseconds: from an hour to 30 days. */
  lifetime: number;
  files: { id: string; size: number }[];
}

/** What `POST /sends` answers: where to put each file, and the Send as it stands. */
export interface SendCreated {
  send: SendView;
  uploads: { id: string; url: string; expiresAt: number }[];
}

/** A Send as its sender sees it. Nothing of what it holds. */
export interface SendView {
  id: string;
  opensLeft: number;
  expiresAt: number;
  createdAt: number;
  /** Its files, sealed, together. */
  size: number;
  /** Whether every file is in place, so it opens. */
  ready: boolean;
  /** When someone reported it, which stopped it; null for never. */
  reportedAt: number | null;
}

/** `POST /sends/:id/open`: the access token, which only the link, and its password, make. */
export interface SendOpenRequest {
  access: string;
}

/** What one open hands over: the sealed body, and where to read each file for a few minutes. */
export interface SendOpened {
  body: OrgBox;
  files: { id: string; url: string; size: number }[];
  opensLeft: number;
  expiresAt: number;
}

/** `POST /sends/:id/report`: the access token, so only someone with the link reports it, and why, in their words. */
export interface SendReportRequest {
  access: string;
  reason: string;
}

/**
 * `GET /links/:link`: a link between two of the account's products, as one
 * side, or the page, sees it: the box of the link key under the session's
 * own product's key (none for the page, which holds no product's key and
 * only seals them), and where its records stand.
 */
export interface LinkState {
  link: string;
  /** The products that have a box; both, once it is turned on. */
  products: string[];
  boxes: { product: string; box: OrgBox }[];
  serverRev: number;
  epoch: string;
  createdAt: number;
}

/** `PUT /links/:link`: the page turning a link on, a box for each side; or one side sealing its own again under a new key. */
export interface LinkBoxesRequest {
  boxes: { product: string; box: OrgBox }[];
}

/**
 * An authenticated box from one P-256 key to another, as a machine's boxes,
 * requests, answers and log entries go: the ephemeral point, then AES-GCM.
 */
export interface MachineSealed {
  epk: string;
  iv: string;
  ct: string;
}
/** The public halves of an account's agent authority: what a machine pins, and every box to or from a machine is checked against. */
export interface AgentAuthorityPoints {
  /** The ECDH point `T`: machines seal to it, and boxes to them come from it. */
  box: string;
  /** The ECDSA point that signs every activation, grant, withdrawal and answer. */
  sign: string;
}
/** What one machine may do with one item. Sealed in its box and in its pin, never readable by the server. */
export type MachineUse = 'request' | 'run' | 'fill' | 'reveal';
/** When it may: whenever it runs, for a while once the person approves, or each time the person approves. */
export type MachineApproval = 'standing' | 'session' | 'each';
/** A grant as the owner's devices make it and the machine opens it. */
export interface MachineGrant {
  /** Random, and new with every change: the one grant a request or an answer names, whoever else made one at the same revision. */
  id: string;
  /** Its revision: a later grant or withdrawal of the same item has a higher one. */
  rev: number;
  uses: MachineUse[];
  approval: MachineApproval;
  /** How long an approved session lasts, in seconds; null unless `approval` is `session`. */
  session: number | null;
  /** Limits the runtime holds the use to, as the product defines them. */
  bounds: Record<string, unknown>;
  /** When the grant ends; null for when the machine does. */
  expiresAt: number | null;
}
/** One item given to one machine: the box from the authority, its grant's revision, and the authority's signature over both and the machine's point. */
export interface MachineItemBox extends MachineSealed {
  rev: number;
  sig: string;
}
/** An item taken back from one machine, signed so the machine drops it and refuses older grants of it. */
export interface MachineWithdrawal {
  vault: string;
  item: string;
  rev: number;
  sig: string;
}
/**
 * What a person's device answered: readable routing, the authority's
 * signature, and, when something is released, a box to the request's own
 * key. The server reads whether it was allowed, and nothing of what.
 */
export interface MachineAnswer {
  outcome: MachineOutcome;
  /** The request's own key a release is sealed to; null for an ask for access. Public, and made for this request alone. */
  to: string | null;
  vault: string | null;
  item: string | null;
  version: number | null;
  grant: number | null;
  /** The grant's id, beside its revision. */
  grantId: string | null;
  /** Until when what is released may be taken; null when nothing is. */
  deadline: number | null;
  sig: string;
  box: MachineSealed | null;
}
/** Whether the person allowed the request. What was released, if anything, is sealed. */
export type MachineOutcome = 'allow' | 'deny';
/** What a machine may show an agent of an item it was given: never a value, notes or anything else. */
export interface MachineListing {
  title?: string;
  kind?: string;
  service?: string;
  environment?: string;
  /** How the agent names it. */
  ref?: string;
}
/**
 * How Passhold puts an item's value to use, as the owner set it when the
 * grant was made: where it may be sent, how a request carries it, and the
 * variable a command reads it from. None of it is secret; all of it is
 * signed with the grant, so a change to it is a new grant.
 */
export interface MachineDelivery {
  /** Hosts, lower case, `*.` for a host and those under it, `:port` where one is named. */
  hosts: string[];
  /** `bearer`, `basic`, `header:<name>` or `query:<name>`. */
  sendAs: string;
  /** The part that goes with the value and is not secret, as Basic authentication needs; null for none. */
  keyId: string | null;
  /** The variable a command reads it from; null for none. */
  env: string | null;
}
/** A record of an agent vault, or its deletion, signed by the vault's write key. */
export interface AgentSignedBox {
  iv: string;
  ct: string;
  sig: string;
}
/** What a person's Passhold reads of its agents: the authority and directory, sealed, every machine's pin, and enrollments waiting. */
export interface AgentsState {
  authority: AgentAuthorityState | null;
  machines: MachineView[];
  enrollments: MachineEnrollmentView[];
  /** What this plan allows. */
  allowance: { machines: number; vaults: number };
  /** Once Passhold's key was replaced, the move of the agents to the new key while it is under way. */
  move?: AgentMoveState | null;
  /** The server's sync epoch, which a database put back from a backup changes. */
  epoch?: string;
}
/** One vault's next generation in a move: its key and write key under Passhold's new key, its name under its new key. */
export interface AgentMoveVault {
  id: string;
  generation: number;
  keyWrap: SealedBox;
  nameBox: SealedBox;
  writePoint: string;
}
/** A move of the agents to Passhold's new key, under way: the new authority, sealed under the new key, every vault's next generation, and the pins set beside their machines so far. */
export interface AgentMoveState {
  points: AgentAuthorityPoints;
  wrap: SealedBox;
  keyGeneration: number;
  vaults: AgentMoveVault[];
  pins: { machine: string; pin: SealedBox }[];
}
/** Proof a device holds both of Passhold's keys: the one the agents move to (or are moving to), and the one they are under. */
export interface AgentMoveProof {
  keyCheck: string;
  previousKeyCheck: string;
}
/**
 * `POST /agents/move`: the agents start to move to Passhold's new key, from
 * the directory version the device read, with proof it holds both keys.
 */
export interface BeginAgentMoveRequest extends AgentMoveProof {
  points: AgentAuthorityPoints;
  wrap: SealedBox;
  keyGeneration: number;
  from: number;
  vaults: AgentMoveVault[];
}
/**
 * `POST /agents/move/step`: for the move whose new authority is `points`,
 * pins sealed again under the new key, records at a later version under
 * their vault's next generation, and devices' records of decisions sealed
 * again under the new key, or let go (`null`) when they do not open under
 * the key they were kept under. Each is set once beside what it replaces.
 */
export interface AgentMoveStepRequest extends AgentMoveProof {
  points: AgentAuthorityPoints;
  pins?: { machine: string; pin: SealedBox }[];
  records?: AgentRekeyRecord[];
  decisions?: { machineId: string; requestId: string; box: SealedBox | null }[];
}
/** `GET /agents/move/decisions?machine=&request=`: the devices' records of decisions not yet sealed again, a page at a time. */
export interface AgentMoveDecisionsPage {
  decisions: MachineDecisionView[];
  next: { machine: string; request: string } | null;
}
/** `POST /agents/move/finish`: the directory under the new key, which puts everything the move set beside what it replaces in its place at once. */
export interface FinishAgentMoveRequest extends AgentMoveProof {
  points: AgentAuthorityPoints;
  directory: NextDirectory;
}
/** `POST /agents/reset`: agents stopped under a Passhold key replaced let go of, with fresh proof the person is there and proof of Passhold's key as it is. */
export interface ResetAgentsRequest extends OwnerProofFields {
  keyCheck: string;
  keyGeneration: number;
}
/** A machine a server lost, as the device that sends its pin back last read it. */
export interface SentBackMachine {
  kind: 'enrolled' | 'token';
  publicKey: string;
  createdAt: number;
  expiresAt: number;
  invitationId: string;
}
/**
 * `POST /agents/send-back`: from a device that trusted more than a server
 * put back from a backup holds, the next directory and the pins of ended
 * machines it names that the server holds older, or not at all.
 */
export interface SendAgentsBackRequest {
  directory: NextDirectory;
  pins: { id: string; pin: SealedBox; machine?: SentBackMachine }[];
}
export interface AgentAuthorityState {
  points: AgentAuthorityPoints;
  /** Sealed under Passhold's key. */
  wrap: SealedBox;
  keyGeneration: number;
  directory: { version: number; box: SealedBox };
  /** The directories after the version asked for, up to this one, so each step can be checked. */
  history: { version: number; box: SealedBox }[];
}
/** One machine as the server keeps it: routing in the clear, everything else in its sealed pin. */
export interface MachineView {
  id: string;
  kind: 'enrolled' | 'token';
  publicKey: string;
  pin: SealedBox;
  status: 'live' | 'paused' | 'removed';
  createdAt: number;
  expiresAt: number;
  removedAt: number | null;
  /** The invitation an enrolled machine answered, or a token machine's own id: what its activation names. */
  invitationId: string;
}
export interface MachineEnrollmentView {
  id: string;
  createdAt: number;
  expiresAt: number;
  /** What the machine answered with, once it has. */
  machineId: string | null;
  publicKey: string | null;
  answeredAt: number | null;
  confirmedAt: number | null;
}
/** `POST /agents/authority`: the first Passhold device to turn agents on, with proof it holds Passhold's key. */
export interface CreateAgentAuthorityRequest {
  points: AgentAuthorityPoints;
  wrap: SealedBox;
  keyGeneration: number;
  keyCheck: string;
  directory: SealedBox;
}
/** `POST /agents/enrollments`: an invitation, its id and secret made on the person's device. */
export interface CreateMachineEnrollmentRequest {
  id: string;
  secret: string;
}
/** `POST /machine/enroll`, with the invitation's secret: the machine's own id, its point and its own credential. */
export interface MachineEnrollRequest {
  machineId: string;
  publicKey: string;
  credential: string;
}
/** `GET /machine/enrollment`, with the machine's own credential: the activation once the person confirmed. */
export interface MachineEnrollmentStatus {
  confirmed: boolean;
  activation: { sig: string; expiresAt: number } | null;
}
/**
 * What the person's device writes when it adds a machine: its pin, the next
 * directory that names it, and fresh proof that the person is there.
 */
export interface MachineAddition extends OwnerProofFields {
  machineId: string;
  publicKey: string;
  pin: SealedBox;
  expiresAt: number;
  directory: NextDirectory;
  /**
   * The authority's activation of this point and expiry: for an enrolled
   * machine, for the invitation it answered; for a token machine, under its
   * own id. Only a device that holds the authority makes one.
   */
  activation: string;
}
/** `POST /agents/enrollments/:id/confirm`: an enrolled machine, confirmed. */
export type ConfirmMachineEnrollmentRequest = MachineAddition;
/** `POST /agents/machines`: a token machine, its credential made on the person's device. */
export interface CreateTokenMachineRequest extends MachineAddition {
  credential: string;
}
/** An agent vault as the server keeps it: its key's wrap and name, sealed, and its write key's point. */
export interface AgentVaultView {
  id: string;
  generation: number;
  /** The vault's key and write key, under Passhold's key. */
  keyWrap: SealedBox;
  /** Its name, under its own key. */
  nameBox: SealedBox;
  writePoint: string;
  serverRev: number;
  createdAt: number;
}
/** `GET /agents/vaults`: every vault, and how many live records they hold together against the ceiling. */
export interface AgentVaultsResponse {
  vaults: AgentVaultView[];
  records: number;
  ceiling: number;
}
/** The next directory a change names, after the version the device read. */
export interface NextDirectory {
  version: number;
  box: SealedBox;
  /**
   * The digest of the directory it follows, as this device trusted it: one
   * made for another directory of the same version, as after agents start
   * afresh or a database is put back, is refused.
   */
  prev: string;
}
/** `POST /agents/vaults`: a new vault, and the next directory naming it. */
export interface CreateAgentVaultRequest {
  id: string;
  keyWrap: SealedBox;
  nameBox: SealedBox;
  writePoint: string;
  directory: NextDirectory;
}
/** One record of an agent vault as it goes over the wire, with its item version's key, wrapped under the vault's. */
export interface AgentRecordWire {
  item: string;
  version: number;
  rev: number;
  keyGeneration: number;
  itemKeyWrap: SealedBox;
  deleted: boolean;
  box: AgentSignedBox;
  /** While the agents move to Passhold's new key, the record the move set beside this one, under the vault's next generation. */
  moved?: AgentMovedRecord | null;
}
export interface AgentMovedRecord {
  version: number;
  rev: number;
  itemKeyWrap: SealedBox;
  box: AgentSignedBox;
}
/** `GET /agents/vaults/:id/sync?since=`: what changed since, a page at a time. */
export interface AgentVaultPull {
  records: AgentRecordWire[];
  serverRev: number;
  hasMore: boolean;
  epoch: string;
}
/**
 * `POST /agents/vaults/:id/sync`: records written on this device, each at
 * the revision after the one the server holds (a new item at 1), from the
 * directory version the device read. All are taken, or none.
 */
export interface AgentVaultPush {
  records: AgentRecordWire[];
  directory: number;
}
export interface AgentVaultPushed {
  serverRev: number;
}
/** One item's grant or withdrawal for one machine, where it goes. */
export interface MachineGrantChange {
  vault: string;
  item: string;
  version: number;
  /** The grant, sealed and signed; null for a withdrawal. */
  box: MachineItemBox | null;
  withdrawal: MachineWithdrawal | null;
  /** For a grant, its id, as an answer names it; null for a withdrawal. */
  grantId: string | null;
  /** For a grant, the revision of the record it was made from, so one made from an older one is refused; null for a withdrawal. */
  recordRev: number | null;
}
/** `PUT /agents/machines/:id/grants`: grants and withdrawals, the machine's pin as it now is, and the next directory. */
export interface MachineGrantsRequest {
  changes: MachineGrantChange[];
  pin: SealedBox;
  directory: NextDirectory;
}
/** A record sealed again under a new item key, at a version past `from`, the one read. */
export interface AgentRekeyRecord extends AgentRecordWire {
  vault: string;
  from: number;
}
/**
 * `POST /agents/rekey`: items given new keys, each machine still holding one
 * given the new key's grant with its pin as it now is, and the next directory.
 * All are taken, or none.
 */
export interface AgentRekeyRequest {
  records: AgentRekeyRecord[];
  machines: { id: string; changes: MachineGrantChange[]; pin: SealedBox }[];
  directory: NextDirectory;
}
/** One change a machine pulls: a grant with the item's current record, or a withdrawal. */
export interface MachinePulledItem {
  vault: string;
  item: string;
  version: number;
  grant: number;
  box: MachineItemBox | null;
  withdrawal: MachineWithdrawal | null;
  /** The item's record at the version the box is for; null when there is none at that version. */
  record: { rev: number; deleted: boolean; box: AgentSignedBox } | null;
}
/**
 * `GET /machine/pull?since=&vault=&item=`: this machine's changes after its
 * cursor, and nothing of anyone else's. With `hasMore`, the next page follows
 * `rev` and `after`, the last item of this page in that revision; without,
 * `rev` is the machine's revision now and `after` is null.
 */
export interface MachinePull {
  rev: number;
  after: { vault: string; item: string } | null;
  epoch: string;
  changes: MachinePulledItem[];
  hasMore: boolean;
}
/** `POST /machine/requests`: a request sealed from the machine to the authority, under an id the machine made. The same again is answered as it was. */
export interface MachineRequestSubmission {
  id: string;
  box: MachineSealed;
}
/** `GET /machine/requests/:id`: a request as its machine reads it back, waiting or answered, until it may no longer be. */
export interface MachineRequestState {
  id: string;
  status: 'pending' | 'answered';
  /** Until when the person may answer it, or, once answered, until when the answer may be taken. */
  expiresAt: number;
  answer: MachineAnswer | null;
}
/** One request waiting for the person, as Passhold reads it to open and show. */
export interface MachineRequestView {
  machineId: string;
  id: string;
  box: MachineSealed;
  createdAt: number;
  expiresAt: number;
}
/** `GET /agents/requests?machine=&after=`: requests waiting, a page at a time, after the machine and request the last page ended on. */
export interface MachineRequestsPage {
  requests: MachineRequestView[];
  next: { machine: string; request: string } | null;
}
/** `POST /agents/requests/:id/decision`: what the device answered, and its own record of it under Passhold's key. */
export interface MachineDecisionSubmission {
  machineId: string;
  answer: MachineAnswer;
  record: SealedBox;
}
/** What a decision left the machine: still live, or paused by a run of denials. */
export interface MachineDecided {
  status: 'live' | 'paused';
}
/** One entry of a machine's log, at its place in the run that wrote it. */
export interface MachineLogWire {
  stream: string;
  sequence: number;
  box: MachineSealed;
}
/** `POST /machine/log`: a batch of entries, at most one batch a minute. */
export interface MachineLogBatch {
  entries: MachineLogWire[];
}
/** Sequences of one run, from `first` to `last`. */
export interface MachineLogRange {
  stream: string;
  first: number;
  last: number;
}
/**
 * What the server did with a batch: the entries it keeps, those it refused
 * for want of room this month, which the machine keeps, and those whose place
 * already holds another entry. An identical retry is acknowledged as before.
 */
export interface MachineLogAck {
  accepted: MachineLogRange[];
  refused: MachineLogRange[];
  conflicts: MachineLogRange[];
}
/** One log entry as a person's Passhold reads it. */
export interface MachineLogView extends MachineLogWire {
  machineId: string;
  receivedAt: number;
  rev: number;
}
/** A deciding device's record of what it decided, under Passhold's key. */
export interface MachineDecisionView {
  machineId: string;
  requestId: string;
  deviceId: string;
  outcome: MachineOutcome;
  box: SealedBox;
  decidedAt: number;
  rev: number;
}
/** Entries the server refused for want of room, counted and never kept. */
export interface MachineRefusedView extends MachineLogRange {
  machineId: string;
  refusedAt: number;
  rev: number;
}
/** `GET /agents/log?since=`: log entries, decisions and refusals after the account's audit revision, in order. */
export interface AgentLogPage {
  entries: MachineLogView[];
  decisions: MachineDecisionView[];
  refused: MachineRefusedView[];
  rev: number;
  hasMore: boolean;
}
/** The server's own account of one machine's calls in one UTC hour: its word, not the machine's. */
export interface MachineHourView {
  machineId: string;
  /** The hour's start, in milliseconds. */
  hour: number;
  calls: number;
  pulls: number;
  /** Pulls that found nothing new. */
  unchanged: number;
  /** Requests for approval sent. */
  asks: number;
  /** Reads of a request's answer. */
  reads: number;
  logs: number;
  /** Calls refused for a limit. */
  refused: number;
  addresses: string[];
  countries: string[];
  clients: string[];
  /** The items it was handed, `vault:item`. */
  fetched: string[];
}
/** `GET /agents/audit?from=&machine=&hour=`: hours from `from`, a page at a time, after the hour and machine the last page ended on. */
export interface AgentAuditPage {
  hours: MachineHourView[];
  next: { hour: number; machine: string } | null;
}
/**
 * `DELETE /agents/machines/:id` and `DELETE /agents/machines`: the next
 * directory, which names the machines removed and the item versions they
 * could have opened, with fresh proof unless every machine named has expired
 * or was already ended by the server.
 */
export interface RemoveMachinesRequest extends OwnerProofFields {
  directory: NextDirectory;
}
/** What the server ended: these machines can no longer connect. Replacing the keys they could hold is the device's. */
export interface MachinesRemoved {
  removed: string[];
}
/**
 * `POST /agents/machines/:id/renew`: a live machine's new expiry, its pin and
 * the next directory, the authority's activation of its point at that
 * expiry, and for a token machine the credential its new token carries.
 */
export interface RenewMachineRequest extends OwnerProofFields {
  expiresAt: number;
  pin: SealedBox;
  directory: NextDirectory;
  activation: string;
  credential?: string;
}
/** `POST /agents/forget`: removed machines the directory names no more, once nothing kept of them needs their pin, with fresh proof. */
export interface ForgetMachinesRequest extends OwnerProofFields {
  machines: string[];
  directory: NextDirectory;
}
/** `GET /machine/status`: a live machine as the server holds it, with the authority's activation of its expiry. */
export interface MachineStatusView {
  machineId: string;
  kind: 'enrolled' | 'token';
  status: 'live' | 'paused';
  expiresAt: number;
  activation: { sig: string; expiresAt: number };
}
/**
 * `GET /account/archives/:id/agent-vaults`: what an account's agents held
 * when it started over, sealed as it was under Passhold's old key; null
 * when there were none. No machine of it can use anything here.
 */
export interface ArchivedAgentsResponse {
  authority: Omit<AgentAuthorityState, 'history'> | null;
  machines: Omit<MachineView, 'invitationId'>[];
  vaults: AgentVaultView[];
}
