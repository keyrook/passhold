/**
 * The MV3 service worker: the only thing that opens the vault, and the only
 * writer to it.
 *
 * Chrome stops a service worker whenever it likes, so nothing is assumed to
 * survive between messages: the vault comes back from storage and the key
 * from session storage (memory only) each time the worker wakes. Every
 * change is read-modify-write and goes through one serialiser with the read
 * inside the turn — two open pages, or a fill marking a login used while the
 * popup edits it, would otherwise lose one side's change.
 */
import {
  acceptPushed,
  addLogin,
  attachFile,
  deleteStoredFile,
  detachFile,
  fileCollection,
  filesDeleted,
  findAttachment,
  forgetFiles,
  MAX_SEALED_FILE,
  SEND_FILES,
  PassholdError,
  withoutFileKeys,
  type Attachment,
  judgeSentAddress,
  judgeSentCard,
  saveSent,
  sentAddress,
  sentCard,
  type AddressDraft,
  type CardDraft,
  addNeverSave,
  addWalletItem,
  cleanAccountName,
  importLogins,
  cardExpired,
  cardExpiry,
  cardNetwork,
  markWalletUsed,
  openWalletItem,
  purgeWalletItem,
  restoreWalletItem,
  setWalletFavorite,
  splitName,
  trashWalletItem,
  updateWalletItem,
  restoreWalletVersion,
  walletOf,
  walletTitle,
  type AddressItem,
  type CardItem,
  type WalletItem,
  backupText,
  createVault,
  emptyTrash,
  applyPulled,
  allSent,
  resendAll,
  deriveAccountKeys,
  exportApiKeysCsv,
  exportCsv,
  fillableWalletItem,
  accountKitProof,
  formatAccountKitKey,
  isAccountKitKey,
  passwordNameOf,
  nextAccountKit,
  PRODUCT,
  generateDataKey,
  newAccountKdf,
  openLogin,
  openRootBySheet,
  readPassholdPin,
  removalProved,
  removedFromAccount,
  strongEnoughForAccount,
  generateRecoveryKey,
  newId,
  planPush,
  recordsKey,
  exportPairingKeys,
  importPairingKeys,
  openWithPasskey,
  PASSKEY_KIND,
  passkeyOfRecord,
  passkeyRecordId,
  wrapForPasskey,
  newPairingKeys,
  newProviderFlow,
  openPairedKey,
  pairingCode,
  wrapKeyForPairing,
  type AccountKitLink,
  type AccountRoot,
  type AccountLink,
  type SignInProvider,
  type RemoteRecord,
  type SealedBox,
  exportDataKey,
  importDataKey,
  judgeCapture,
  loginsForSite,
  markBackedUp,
  markUsed,
  matchUrls,
  mergeBackup,
  normaliseRecoveryKey,
  openBackup,
  openWithDevice,
  openWithPin,
  PIN_TRIES,
  parseBackup,
  purgeLogin,
  readPayload,
  removeNeverSave,
  renameFolder,
  restoreLogin,
  rewrapVault,
  sealVault,
  sealWithDevice,
  sealWithPin,
  setFavorite,
  setPin,
  setRecoveryKeyPending,
  secretOf,
  withRecoveryKey,
  siteName,
  siteOf,
  trashLogin,
  unlockVault,
  updateLogin,
  restoreLoginVersion,
  updateSettings,
  verifyMasterPassword,
  fromBase64,
  isPassholdError,
  assertPasskey,
  attestPasskey,
  clientDataJSON,
  createPasskey,
  passkeyLogins,
  readCreateOptions,
  readGetOptions,
  rpIdFor,
  savePasskey,
  toBase64url,
  type CreateRequest,
  type GetRequest,
  type DeviceCredential,
  type LoginItem,
  type Site,
  type UnlockedVault,
  type VaultData,
  type VaultFile,
  dropFamilyVaults,
  emptyFamilyTrash,
  everyItem,
  familyVault,
  inFamilyVault,
  mergeFamilyPulled,
  moveToFamily,
  placeOf,
  planFamilyPush,
  purgeFromFamily,
  readDeparture,
  whereItemIs,
  type FamilyLink,
  type FamilyState,
  type FamilyValue,
  type FamilyVault,
  type Items,
  type UnreadableRecord,
  type VaultPlace,
  addLinkedCode,
  codeFitsLogin,
  emergencyView,
  exposedLogins,
  handOverEmergency,
  loginCopy,
  readEmergency,
  readLinkedCodes,
  readTotpSetup,
  showCode,
  trustEmergency,
  websitesOf,
  planAllows,
  planFromBilling,
  plansOfferedFromBilling,
  type CopyLabels,
  type LinkedCodes,
  applyMutation as applyChange,
  pageView,
  syncOwnRecords,
  syncFamilies as syncFamilyRound,
  toStoredAgentsState,
  type VaultTurn,
  type Plan,
  type StoredAgentsState,
} from '@passhold/core';
import {
  AUTHENTICATOR,
  createSend,
  moveAgentsToNewKey,
  openLink,
  type OwnerProofFields,
  createAccount as createKeyrookAccount,
  createAccountRoot,
  createProviderAccount as createProvider,
  // The account's kind of recovery key, 160 bits; @passhold/core's generateRecoveryKey is the vault's own.
  generateRecoveryKey as generateAccountRecoveryKey,
  openArchivedKey,
  openProductKey,
  passkeyCredential,
  passkeySignInOptions,
  replaceProductKey,
  readArchivedRecords,
  recoverAccount,
  replaceRecoveryKey,
  requestRecoveryCode,
  requestStartOverCode,
  sealToRoot,
  signInWithPasskey,
  startAccountOver,
  SyncHttpError,
  sealedFileSize,
  familyCompareCode,
  openFamily,
  pullFamily,
  pushFamily,
  rotateFamilyKeys,
  sealFamilyRecord,
  trustFamilyMember,
  type FamilyRecord,
  type OpenedFamily,
  type ProductFamily,
  type AccountKeysResponse,
  type PasskeySignInOptions as AccountPasskeyOptions,
  type SecondStepProof,
  type SecondStepRequest,
  type HttpSyncAdapter,
  type OpenedProductKey,
  type ProductKey,
  type SendCreated,
  type SendRequest,
} from '@keyrook/account';
import { AppError, describeError, fail } from '../i18n/errors.js';
import type { MessageKey } from '../i18n/locales/en.js';
import {
  type AccountPasskeyTouch,
  type SecondStepAnswer,
  isContentSender,
  isTrustedSender,
  ownOrigin,
  VAULT_CHANGED,
  type ArchiveView,
  type ContentHello,
  type ContentRequest,
  type JoinProgress,
  type PairingView,
  type ProviderView,
  type Envelope,
  type FieldKind,
  type MenuView,
  type Mutation,
  type PageInfo,
  type PasskeyAnswer,
  type PasskeyView,
  type PendingView,
  type WebAuthnOutcome,
  type WebAuthnStart,
  type PromptOutcome,
  type Proof,
  type Request,
  type CodesView,
  type SentView,
  type EmergencyRead,
  type SyncResult,
  type RestoreResult,
  type SecurityKey,
  type ToContent,
  type VaultStatus,
} from '../lib/messaging.js';
import { browserName, deviceLabel, deviceUnsupported, systemOf } from '../lib/name.js';
import { answered as ratingAnswered, loadRating, recordFill, shouldAsk, snooze as snoozeRating, updateRating } from '../lib/rating.js';
import { allows, planOf, planView } from '../lib/plan.js';
import { createSerialiser } from '../lib/serial.js';
import {
  clearDevice,
  clearPin,
  clearSession,
  loadEmergency,
  loadLinked,
  saveEmergency,
  saveLinked,
  type HeldCodes,
  clearUnlocks,
  clearVaultFile,
  loadDevice,
  loadKeys,
  loadPin,
  loadPrefs,
  loadSession,
  loadVaultFile,
  markActive,
  saveDevice,
  saveKeys,
  savePin,
  savePolicy,
  savePrefs,
  saveSession,
  saveVaultFile,
  sessionTable,
  type KeyUnlock,
  type LockPolicy,
  type Prefs,
} from '../lib/storage.js';
import { CLIPBOARD_ALARM, clearClipboardLater, clearClipboardNow } from './clipboard.js';
import { createNativeFillController } from './nativeFill.js';
import { accountFailure } from '../lib/failure.js';
import {
  agentsApproveUse,
  agentsAudit,
  agentsBeginEnrollment,
  agentsConfirmEnrollment,
  agentsCreateToken,
  agentsCreateVault,
  agentsDenyRequest,
  agentsEditItem,
  agentsForget,
  agentsGrantItem,
  agentsInboxAccept,
  agentsInboxDismiss,
  agentsMoveToNewKey,
  agentsPendingCount,
  agentsPutItem,
  agentsRekey,
  agentsRemoveMachine,
  agentsRenewMachine,
  agentsResumeMachine,
  agentsReviewEnrollment,
  agentsSendBack,
  agentsSettle,
  agentsStartAfresh,
  agentsStopAll,
  agentsTurnOn,
  agentsView,
  agentsWithdrawItem,
  readArchivedAgentsToVault,
  type AgentWorkerContext,
} from './agents.js';
import {
  acceptPairing,
  accountKeys,
  approvePairing,
  archivedRecords,
  archives,
  beginStartOver,
  createBox,
  createRoot,
  finishSecondStep,
  denyPairing,
  connect,
  KEYROOK_ORIGIN,
  KeyrookError,
  SERVER,
  login,
  openArchive,
  openPairings,
  pairingStatus,
  providerRegister,
  providerSession,
  providerStartUrl,
  recoverCode as sendRecoverCode,
  recoverRoot,
  recoverRootReset,
  requestPairing,
  secondStepPasskeyOptions,
  logout,
  prelogin,
  pull,
  push,
  register,
  registerStart,
  setRootRecovery,
  startOver,
  startOverCode as sendStartOverCode,
  updateBox,
  withSession,
  type Session,
  type Tokens,
} from './keyrook.js';

const AUTO_LOCK_ALARM = 'ph.autolock';
/** How long a sign-in waits to be saved, and an inline list stays usable. */
const PENDING_TTL = 5 * 60_000;
const MENU_TTL = 10 * 60_000;

const serial = createSerialiser();
/** Session tables are read-modify-write too, and have their own queue. */
const tableTurn = createSerialiser();

/** Warm cache for the lifetime of this worker instance only. */
let cached: UnlockedVault | null = null;
/**
 * How many times the vault has locked. A lock never waits for the queue — "Lock
 * now" must not sit behind a slow seal — so a turn that started before a lock
 * can finish after it. Such a turn must not put the vault back in the cache.
 */
let locks = 0;

void chrome.storage.session.setAccessLevel?.({ accessLevel: 'TRUSTED_CONTEXTS' });
// Local storage is open to content scripts unless closed, and the content
// script runs in every page: whatever it may do, a page that takes over its
// renderer may do too. Open, it hands that page the sealed vault file to
// guess the master password against offline, and lets it write over the
// vault or remove it. Chrome keeps the level across restarts; it is set at
// every start all the same (e2e/renderer.spec.ts tries both ways in).
//
// Firefox has no such level to set (and none for session storage, which it
// keeps from content scripts by itself). There the vault and the copies of
// its key are kept in the extension's own database instead (`disk()`,
// lib/storage.ts), and local storage holds only the theme and when to ask for
// a rating.
if (chrome.storage.local.setAccessLevel) {
  chrome.storage.local
    .setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' })
    .catch((error: unknown) => console.error('Local storage could not be closed to content scripts.', error));
}

// --- the vault ------------------------------------------------------------------

function policyOf(data: VaultData): LockPolicy {
  const { autoLockMinutes, lockWithSystem, clearClipboardSeconds } = data.settings;
  return { autoLockMinutes, lockWithSystem, clearClipboardSeconds };
}

function prefsOf(data: VaultData): Prefs {
  const { inlineButton, offerToSave, offerToSaveCards, autoSuggest, passkeys } = data.settings;
  return { inlineButton, offerToSave, offerToSaveCards, autoSuggest, passkeys };
}

async function current(): Promise<UnlockedVault | null> {
  if (cached) return cached;
  const epoch = locks;
  const file = await loadVaultFile();
  if (!file) return null;
  const { key } = await loadSession();
  if (!key) return null;
  const dataKey = await importDataKey(key);
  const opened: UnlockedVault = { file, dataKey, data: await readPayload(file, dataKey) };
  if (epoch === locks) cached = opened;
  return opened;
}

async function requireUnlocked(): Promise<UnlockedVault> {
  const vault = await current();
  if (vault) return vault;
  if (!(await loadVaultFile())) fail('error.noVault');
  fail('error.locked');
}

async function status(): Promise<VaultStatus> {
  const file = await loadVaultFile();
  if (!file) return { state: 'uninitialized' };
  const vault = await current();
  const unlock = await loadDevice();
  const device = unlock && credentialOf(unlock);
  const keys = (await loadKeys()).map(keyOf);
  const secret = secretOf(file);
  if (vault) return unlockedView(vault, device, keys);
  return { state: 'locked', secret, passwordName: passwordNameOf(file), pin: Boolean(await loadPin()), device, keys };
}

function broadcast(): void {
  chrome.runtime.sendMessage({ type: VAULT_CHANGED }).catch(() => undefined);
}

/** Seal and store new data. Runs inside a serialised turn. */
/** `fromSync`: a write sync makes itself, which must not set off another. */
async function commit(vault: UnlockedVault, data: VaultData, fromSync = false): Promise<UnlockedVault> {
  const epoch = locks;
  const file = await sealVault(vault.file, vault.dataKey, data);
  await saveVaultFile(file);
  const next = { ...vault, file, data };
  if (epoch === locks) cached = next;
  if (data.settings !== vault.data.settings) {
    await savePrefs(prefsOf(data));
    if (epoch === locks) await savePolicy(policyOf(data));
  }
  if (data.items !== vault.data.items || data.families !== vault.data.families) await rememberPasskeySites(data);
  broadcast();
  if (!fromSync && data.account?.tokens && (data.items !== vault.data.items || data.wallet !== vault.data.wallet || data.families !== vault.data.families)) scheduleSync();
  return next;
}

/** A fill made, for the one-time question about a rating; a counter that fails never fails the fill. */
function countFill(): void {
  void updateRating((state) => recordFill(state, Date.now())).catch(() => undefined);
}

/** Apply a change described by a page, with the read inside the turn. */
function change(apply: (data: VaultData) => VaultData): Promise<UnlockedVault> {
  return serial(async () => {
    const vault = await requireUnlocked();
    return commit(vault, apply(vault.data));
  });
}

/** A page's change, with the plan the server last named for this vault's account: the rules are the core's, shared with the web vault. */
const applyMutation = (data: VaultData, mutation: Mutation): VaultData => applyChange(data, mutation, planOf(data));

async function lock(): Promise<void> {
  locks++;
  cached = null;
  await clearSession();
  await chrome.alarms.clear(AUTO_LOCK_ALARM);
  void setAgentsBadge(0);
  broadcast();
}

async function setAgentsBadge(count: number): Promise<void> {
  try {
    await chrome.action?.setBadgeText({ text: count > 0 ? String(count > 99 ? '99+' : count) : '' });
    if (count > 0) await chrome.action?.setBadgeBackgroundColor({ color: '#2563eb' });
  } catch {
    // Environments without a toolbar action ignore badge updates.
  }
}

function noteAgentsOverview<T extends { status: string; requests?: readonly unknown[]; inbox?: readonly unknown[] }>(overview: T): T {
  void setAgentsBadge(overview.status === 'open' ? (overview.requests?.length ?? 0) + (overview.inbox?.length ?? 0) : 0);
  return overview;
}

async function refreshAgentsBadge(): Promise<void> {
  const open = await current();
  if (!open?.data.account?.tokens || !open.data.account.agents) {
    await setAgentsBadge(0);
    return;
  }
  const { count } = await withAgents((ctx) => agentsPendingCount(ctx)).catch(() => ({ count: 0 }));
  await setAgentsBadge(count);
}

/**
 * The vault is open: keep its key in memory and arm the lock. Opened with the
 * master password, the PIN's copy of the key is made afresh — so a full set of
 * tries again — or dropped if the vault has no PIN; opened with the PIN, the
 * copy that was just used stays.
 */
async function opened(vault: UnlockedVault, pin: 'renew' | 'keep' = 'renew'): Promise<VaultStatus> {
  await saveSession(await exportDataKey(vault.dataKey), policyOf(vault.data));
  if (pin === 'renew') {
    if (vault.data.pin) await savePin(await sealWithPin(vault.dataKey, vault.data.pin));
    else await clearPin();
  }
  await savePrefs(prefsOf(vault.data));
  await rememberPasskeySites(vault.data);
  cached = vault;
  await chrome.alarms.create(AUTO_LOCK_ALARM, { periodInMinutes: 1 });
  broadcast();
  const unlock = await loadDevice();
  if (vault.data.account?.tokens) scheduleSync(1_000);
  return unlockedView(vault, unlock && credentialOf(unlock), (await loadKeys()).map(keyOf));
}


/**
 * The open vault as pages see it. Pages hold every login already; they are
 * not handed what they have no use for: the recovery key (shown only with
 * proof), the account's key and session, and the private keys of websites'
 * passkeys.
 */
function unlockedView(vault: UnlockedVault, device: DeviceCredential | null, keys: SecurityKey[]): VaultStatus {
  const link = vault.data.account;
  return {
    state: 'unlocked',
    secret: secretOf(vault.file),
    passwordName: passwordNameOf(vault.file),
    // Websites' passkeys without their private keys, files without theirs: the core's rule, shared with the web vault.
    data: pageView(vault.data),
    device,
    keys,
    account: link && {
      email: link.email,
      accountId: link.accountId,
      name: link.name,
      lastSyncAt: link.lastSyncAt,
      signedOut: link.tokens === null,
      kit: !link.kit ? 'none' : link.kit.key ? (link.kit.pending ? 'pending' : 'kept') : link.productKey && link.sheetVerifiedAt === null ? 'unchecked' : 'elsewhere',
      // Warned of while it waits; once its day has come, the reason the server signed this browser out.
      startOver: link.tokens && link.pendingStartOver && link.pendingStartOver.executesAt > Date.now() ? { executesAt: link.pendingStartOver.executesAt, deviceName: link.pendingStartOver.deviceName } : null,
      startedOver: !link.tokens && link.pendingStartOver && link.pendingStartOver.executesAt <= Date.now() ? link.pendingStartOver.executesAt : null,
      removed: link.removedAt,
      provider: link.provider,
      // Not from `provider`: an account with a password may sign in with Google or GitHub too.
      passwordless: link.passwordless,
      passkey: link.passkey !== null,
    },
    plan: planView(vault.data),
  };
}

// --- pages in the active tab --------------------------------------------------------

async function activeTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab ?? null;
}

/**
 * Where the top frame of a tab is, and which document, as Chrome reports it.
 * Without the `tabs` permission Chrome tells the service worker no tab's
 * address, and the frame's own word for it is not taken: a page that took
 * over its renderer could name any site, and be handed that site's login from
 * the popup. So the frame's content script is asked to check in, and the
 * check-in's sender — its address and document, stamped by Chrome — is where
 * it is (e2e/renderer.spec.ts).
 */
const checkIns = new Map<string, { tabId: number; arrived: (sender: chrome.runtime.MessageSender) => void }>();
const CHECK_IN_WAIT = 1_000;

async function topFrame(tabId: number): Promise<{ site: Site; url: string; documentId: string } | null> {
  const nonce = newToken();
  const sender = await new Promise<chrome.runtime.MessageSender | null>((resolve) => {
    const done = (value: chrome.runtime.MessageSender | null) => {
      clearTimeout(timer);
      checkIns.delete(nonce);
      resolve(value);
    };
    const timer = setTimeout(() => done(null), CHECK_IN_WAIT);
    checkIns.set(nonce, { tabId, arrived: done });
    // No content script there — a browser page, a bot check — and nothing will check in.
    chrome.tabs.sendMessage<ToContent>(tabId, { type: 'ph/checkIn', nonce }, { frameId: 0 }).catch(() => done(null));
  });
  if (!sender?.url || !sender.documentId) return null;
  const site = siteOf(sender.url);
  return site ? { site, url: `${site.origin}${new URL(sender.url).pathname}`, documentId: sender.documentId } : null;
}

/**
 * Hand one frame a login. The frame is named by document, not just by number,
 * so a frame that navigated since it asked gets nothing; and the content script
 * checks the origin again before it types a character.
 */
async function deliverFill(
  tabId: number,
  target: { documentId: string } | { frameId: number },
  message: Extract<ToContent, { type: 'ph/fill' | 'ph/fillCard' | 'ph/fillAddress' }>,
): Promise<void> {
  const answer = await chrome.tabs
    .sendMessage<ToContent, { filled: boolean } | undefined>(tabId, message, target)
    .catch(() => undefined);
  if (!answer?.filled) fail('error.noFields');
}

function itemOrFail(data: VaultData, id: string): LoginItem {
  const item = data.items.find((entry) => entry.id === id && entry.deletedAt === null);
  if (!item) fail('error.itemNotFound');
  return item;
}

/** A live card or address, of the kind the field it is for takes: never a note, an SSH key or an API key, which are filled nowhere (`fillableWalletItem`). */
function walletItemOrFail(data: VaultData, id: string, kind: 'card' | 'address'): CardItem | AddressItem {
  const item = fillableWalletItem(data, id, kind);
  if (!item) fail('error.itemNotFound');
  return item;
}

// --- inline lists ---------------------------------------------------------------------

interface MenuSession {
  tabId: number;
  documentId: string;
  frameId: number;
  url: string;
  field: FieldKind;
  at: number;
}

const menus = sessionTable<MenuSession>('ph.menus');

function newToken(): string {
  return [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * An inline list belongs to the frame that opened it, and is used from the
 * extension page drawn inside that same tab. Anything else holding the token
 * — another tab, a list past its time — gets nothing.
 */
async function menuFor(token: string, sender: chrome.runtime.MessageSender): Promise<{ session: MenuSession; site: Site }> {
  const session = await menus.get(token);
  if (!session || Date.now() - session.at > MENU_TTL || sender.tab?.id !== session.tabId) fail('error.expired');
  const site = siteOf(session.url);
  if (!site) fail('error.expired');
  return { session, site };
}

async function menuView(token: string, sender: chrome.runtime.MessageSender): Promise<MenuView> {
  const { session, site } = await menuFor(token, sender);
  const base = { site: siteName(site), field: session.field, logins: [], cards: [], addresses: [], secure: site.origin.startsWith('https://') };
  if (!(await loadVaultFile())) return { ...base, state: 'uninitialized' };
  const vault = await current();
  if (!vault) return { ...base, state: 'locked' };
  return { ...base, state: 'ready', ...menuContents(vault.data, site, session.field, await conditionalFor(session.documentId)) };
}

/** What the list offers a field: logins for the site, or every card, or every address. */
function menuContents(data: VaultData, site: Site, field: FieldKind, waiting: PasskeyRequest | null): Pick<MenuView, 'logins' | 'cards' | 'addresses'> {
  if (field === 'card') {
    const cards = walletOf(everyItem(data), 'card').map((card) => ({
      id: card.id,
      title: walletTitle(card),
      network: cardNetwork(card.number),
      last4: card.number.slice(-4),
      expiry: cardExpiry(card),
      expired: cardExpired(card),
    }));
    // A card that no longer works is still shown — its owner may want to know it is there — but last.
    return { logins: [], cards: cards.sort((a, b) => Number(a.expired) - Number(b.expired)), addresses: [] };
  }
  if (field === 'address') {
    const addresses = walletOf(everyItem(data), 'address').map((address) => ({
      id: address.id,
      title: walletTitle(address),
      line: [address.street.split('\n')[0], address.city, address.country].filter(Boolean).join(', '),
    }));
    return { logins: [], cards: [], addresses };
  }
  return { logins: menuRows(data, site, waiting), cards: [], addresses: [] };
}

const menuCount = (contents: Pick<MenuView, 'logins' | 'cards' | 'addresses'>) => contents.logins.length + contents.cards.length + contents.addresses.length;

/**
 * The list's rows. For a sign-in the page is quietly waiting on, the passkeys
 * it would take come first — choosing one signs in — then the site's other
 * logins, to fill. A shared vault's too, each named by its vault.
 */
function menuRows(data: VaultData, site: Site, waiting: PasskeyRequest | null): MenuView['logins'] {
  const passkeys = waiting?.get ? passkeyLogins(everyItem(data), waiting.rpId, waiting.get.allow) : [];
  const signs = new Set(passkeys.map((item) => item.id));
  return [
    ...passkeys.map((item) => ({ id: item.id, title: item.title, username: item.passkey!.userName || item.username, passkey: true, vault: sharedVaultName(data, item.id) })),
    ...loginsForSite(everyItem(data), site)
      .filter(({ item }) => !signs.has(item.id))
      .map(({ item }) => ({ id: item.id, title: item.title, username: item.username, passkey: false, vault: sharedVaultName(data, item.id) })),
  ];
}

/** The name of the shared vault an item is in; null for one of the vault's own. */
function sharedVaultName(data: VaultData, id: string): string | null {
  const place = placeOf(data, id);
  if (!place) return null;
  return familyVault(data, place).vault.name;
}

// --- cards and addresses ---------------------------------------------------------------

/** Frames that said they hold a card's fields, by document: where else a card chosen in one of them goes. */
interface CardFrame {
  tabId: number;
  documentId: string;
  origin: string;
  at: number;
}

const cardFrames = sessionTable<CardFrame>('ph.cardFrames');
const CARD_FRAME_TTL = 30 * 60_000;

const cardFill = (card: CardItem) => ({ holder: card.holder, number: card.number, expMonth: card.expMonth, expYear: card.expYear, code: card.code });

function addressFill(address: AddressItem) {
  const { given, family } = splitName(address.name);
  const { name, organization, street, city, region, postalCode, country, phone, email } = address;
  return { name, givenName: given, familyName: family, organization, street, city, region, postalCode, country, phone, email };
}

/**
 * A card or an address, into the frame its list was opened from — checked by
 * the frame against its own origin before a character is typed. A card goes
 * also to the other frames of that same origin in the tab that said they hold
 * a card's fields: checkouts that put the number, the date and the code each
 * in a frame of its own. To a frame of any other origin it goes never: a
 * frame of the same origin could read it from the first one anyway, and one
 * of another origin is not where its owner chose to put it.
 */
async function fillWallet(session: MenuSession, site: Site, item: CardItem | AddressItem): Promise<void> {
  if (item.kind === 'card' && !site.origin.startsWith('https://')) fail('error.cardInsecure');
  if (item.kind === 'address') {
    await deliverFill(session.tabId, { documentId: session.documentId }, { type: 'ph/fillAddress', origin: site.origin, address: addressFill(item) });
    return;
  }
  const message: Extract<ToContent, { type: 'ph/fillCard' }> = { type: 'ph/fillCard', origin: site.origin, card: cardFill(item) };
  await deliverFill(session.tabId, { documentId: session.documentId }, message);
  const now = Date.now();
  const siblings = Object.values(await cardFrames.read()).filter(
    (frame) => frame.tabId === session.tabId && frame.origin === site.origin && frame.documentId !== session.documentId && now - frame.at < CARD_FRAME_TTL,
  );
  for (const frame of siblings) {
    await chrome.tabs.sendMessage<ToContent>(frame.tabId, message, { documentId: frame.documentId }).catch(() => undefined);
  }
}

/** The list put away: in the frame that opened it, and in the top frame where it may have been drawn for it. */
async function closeMenu(session: MenuSession, token: string): Promise<void> {
  await chrome.tabs.sendMessage<ToContent>(session.tabId, { type: 'ph/closeMenu' }, { documentId: session.documentId }).catch(() => undefined);
  if (session.frameId !== 0) await chrome.tabs.sendMessage<ToContent>(session.tabId, { type: 'ph/closeMenu', token }, { frameId: 0 }).catch(() => undefined);
}

async function openToolbarPopup(): Promise<boolean> {
  try {
    await chrome.action.openPopup();
    return true;
  } catch {
    return false;
  }
}

// --- sign-ins and checkouts waiting to be saved ------------------------------------------

interface PendingSave {
  id: string;
  token: string;
  tabId: number;
  /** Where the form was sent from: origin and path, never its query. */
  url: string;
  /** A sign-in sent; empty for a checkout. */
  username: string;
  password: string;
  /** In a form that changes a password, the one it held until now: it names which login is changed. */
  current?: string;
  /** The document that sent it, and its frame: what it became of is that document's to say, or the next one's there. */
  documentId?: string;
  frameId?: number;
  /**
   * The sign-in went through: its form went away, or the page moved on to one
   * with none. Until then nothing is offered — a sign-in sent with a mistyped
   * password is not one to keep. A checkout is sure as sent.
   */
  sure: boolean;
  /** A checkout sent: its card and its address, checked as a typed one is; null for a sign-in. */
  card?: CardDraft | null;
  address?: AddressDraft | null;
  at: number;
  /** Documents that have shown the prompt already, so a reload does not repeat it. */
  shownIn: string[];
}

const isCheckout = (entry: PendingSave) => Boolean(entry.card || entry.address);

const pending = sessionTable<PendingSave>('ph.pending');

/**
 * A sign-in's first step, sent in a tab: the username a password-only page
 * after it does not name. Kept for that page, on the same site, for a while.
 */
interface FirstStep {
  tabId: number;
  site: string;
  username: string;
  at: number;
}

const firstSteps = sessionTable<FirstStep>('ph.firstStep');
const FIRST_STEP_TTL = 10 * 60_000;

async function firstStepFor(tabId: number, site: string): Promise<string> {
  const step = (await firstSteps.read())[String(tabId)];
  return step && step.site === site && Date.now() - step.at < FIRST_STEP_TTL ? step.username : '';
}

/** Sign-ins still within their time. Expired ones are dropped the next time the table is written. */
async function livePending(): Promise<PendingSave[]> {
  const now = Date.now();
  return Object.values(await pending.read()).filter((entry) => now - entry.at < PENDING_TTL);
}

async function pendingView(entry: PendingSave): Promise<PendingView | null> {
  const vault = await current();
  const site = siteOf(entry.url);
  if (!site) return null;
  if (isCheckout(entry)) return checkoutView(entry, siteName(site), vault?.data ?? null);
  let kind: 'new' | 'update' | null = null;
  let username = entry.username;
  if (vault) {
    const verdict = judgeCapture(vault.data, site, entry.username, entry.password, entry.current);
    if (verdict.kind !== 'new' && verdict.kind !== 'update') return null;
    kind = verdict.kind;
    // Which login the new password goes to, by the name it is saved under:
    // never "a password for this site" when one particular login changes.
    if (verdict.kind === 'update') username = verdict.item.username || verdict.item.title || entry.username;
  }
  return { what: 'login', id: entry.id, site: siteName(site), username, kind };
}

/**
 * A checkout's card and address as the prompt names them — the card by its
 * network and last four digits, never its number or its code — less what the
 * vault already has; null when that is all of it. Locked, what is new is
 * decided on unlocking.
 */
function checkoutView(entry: PendingSave, site: string, data: VaultData | null): PendingView | null {
  const sentCard = entry.card ?? null;
  const sentAddress = entry.address ?? null;
  const cardVerdict = sentCard && data ? judgeSentCard(data, sentCard).kind : null;
  const addressVerdict = sentAddress && data ? judgeSentAddress(data, sentAddress) : null;
  const card =
    sentCard && cardVerdict !== 'known' ? { network: cardNetwork(sentCard.number), last4: sentCard.number.slice(-4), kind: cardVerdict } : null;
  const address =
    sentAddress && addressVerdict !== 'known' ? { line: sentAddress.street.split('\n')[0] ?? '', kind: addressVerdict } : null;
  if (!card && !address) return null;
  return { what: 'wallet', id: entry.id, site, card, address };
}

async function answerPending(entry: PendingSave, answer: 'save' | 'never' | 'dismiss'): Promise<PromptOutcome> {
  // A checkout is never "never for this site": that would stop the site's sign-ins being offered too.
  if (answer === 'dismiss' || (answer === 'never' && isCheckout(entry))) {
    await tableTurn(() => pending.remove(entry.id));
    return 'closed';
  }
  if (!(await current())) {
    await openToolbarPopup();
    return 'locked';
  }
  await change((data) => {
    const site = siteOf(entry.url);
    if (!site) return data;
    if (isCheckout(entry)) return saveSent(data, { card: entry.card ?? null, address: entry.address ?? null });
    if (answer === 'never') return addNeverSave(data, siteName(site));
    const verdict = judgeCapture(data, site, entry.username, entry.password, entry.current);
    if (verdict.kind === 'update') {
      return updateLogin(data, verdict.item.id, { ...verdict.item, password: entry.password });
    }
    if (verdict.kind === 'new') {
      return addLogin(data, { title: '', username: entry.username, password: entry.password, urls: [entry.url], notes: '' }).data;
    }
    return data;
  });
  await tableTurn(() => pending.remove(entry.id));
  return 'saved';
}

/**
 * Hold what a page sent for its prompt. One waiting per tab: the latest is the
 * one that worked. Offered at once only when sure; a sign-in waits to be.
 */
async function holdPending(entry: PendingSave): Promise<void> {
  await tableTurn(async () => {
    const live = (await livePending()).filter((candidate) => candidate.tabId !== entry.tabId);
    await pending.write(Object.fromEntries([...live, entry].map((candidate) => [candidate.id, candidate])));
  });
  if (entry.sure) await showPromptIn(entry);
  else {
    // The page after it may have loaded, and asked, before this was held.
    const frames = new Set([0, entry.frameId ?? 0]);
    for (const frameId of frames) await chrome.tabs.sendMessage<ToContent>(entry.tabId, { type: 'ph/askPrompt' }, { frameId }).catch(() => undefined);
  }
}

async function showPromptIn(entry: PendingSave): Promise<void> {
  await chrome.tabs.sendMessage<ToContent>(entry.tabId, { type: 'ph/showPrompt', token: entry.token }, { frameId: 0 }).catch(() => undefined);
}

async function closePrompt(tabId: number): Promise<void> {
  await chrome.tabs.sendMessage<ToContent>(tabId, { type: 'ph/closePrompt' }, { frameId: 0 }).catch(() => undefined);
}

// --- websites' passkeys ------------------------------------------------------------------

/**
 * A website waiting on a passkey: to make one, or to sign in with one. Held
 * in session memory while the person decides — in Passhold's frame on the
 * page, or in the list under a sign-in field for a sign-in the page started
 * quietly (`conditional`). Where it came from is what Chrome said of the
 * frame when it asked: its tab, its document, its origin.
 */
interface PasskeyRequest {
  token: string;
  /** The page's own name for the request, so the answer finds it. */
  id: string;
  tabId: number;
  documentId: string;
  origin: string;
  rpId: string;
  op: 'create' | 'get';
  conditional: boolean;
  at: number;
  create: CreateRequest | null;
  get: GetRequest | null;
}

const passkeyRequests = sessionTable<PasskeyRequest>('ph.webauthn');

/**
 * The sites this vault holds passkeys for, as of the last time it was open:
 * in session memory, so a locked Passhold asks to be unlocked only where it
 * has a passkey to offer, and leaves every other site's sign-in to the
 * browser. Gone with the browser; until the vault is first opened, unknown.
 */
const PASSKEY_SITES = 'ph.passkeySites';

async function rememberPasskeySites(data: VaultData): Promise<void> {
  const sites = [...new Set(everyItem(data).items.filter((item) => item.deletedAt === null && item.passkey).map((item) => item.passkey!.rpId))];
  await hold({ [PASSKEY_SITES]: sites });
}

/** As long as a site may reasonably wait; the page's own timeout usually ends it first. */
const PASSKEY_TTL = 10 * 60_000;
const NOT_ALLOWED: WebAuthnOutcome = { type: 'error', name: 'NotAllowedError', message: 'The operation either timed out or was not allowed.' };

/** The frame's first height, before it measures its own card: one row of logins, or the card for making one. */
function passkeyHeight(request: Pick<PasskeyRequest, 'op'>, rows: number): number {
  return request.op === 'create' ? 140 : 132 + Math.min(Math.max(rows, 1), 3) * 52;
}

async function livePasskeyRequests(): Promise<PasskeyRequest[]> {
  const now = Date.now();
  return Object.values(await passkeyRequests.read()).filter((entry) => now - entry.at < PASSKEY_TTL);
}

/** Tell the page how its request ended. To its document only: one that navigated meanwhile gets nothing. */
async function settlePasskey(entry: PasskeyRequest, outcome: WebAuthnOutcome): Promise<void> {
  await chrome.tabs
    .sendMessage<ToContent>(entry.tabId, { type: 'ph/webauthn', id: entry.id, outcome }, { documentId: entry.documentId })
    .catch(() => undefined);
}

/** Answer a request taken from the table; if the answer cannot be made, the page hears no rather than nothing. */
async function answerWith(entry: PasskeyRequest, make: () => Promise<WebAuthnOutcome>): Promise<void> {
  let outcome: WebAuthnOutcome;
  try {
    outcome = await make();
  } catch (error) {
    await settlePasskey(entry, NOT_ALLOWED);
    throw error;
  }
  await settlePasskey(entry, outcome);
}

/** Take a request out of the table, once: a second click on the same answer finds nothing. */
async function takePasskeyRequest(token: string): Promise<PasskeyRequest> {
  const entry = await tableTurn(async () => {
    const found = await passkeyRequests.get(token);
    if (found) await passkeyRequests.remove(token);
    return found;
  });
  if (!entry || Date.now() - entry.at > PASSKEY_TTL) fail('error.expired');
  return entry;
}

/** A request is used from Passhold's frame in the same tab, as an inline list is. */
async function passkeyRequestFor(token: string, sender: chrome.runtime.MessageSender): Promise<PasskeyRequest> {
  const entry = await passkeyRequests.get(token);
  if (!entry || Date.now() - entry.at > PASSKEY_TTL || sender.tab?.id !== entry.tabId) fail('error.expired');
  return entry;
}

/** The quiet sign-in a document is waiting on, for the list under its field. */
async function conditionalFor(documentId: string): Promise<PasskeyRequest | null> {
  return (await livePasskeyRequests()).find((entry) => entry.documentId === documentId && entry.conditional) ?? null;
}

async function startPasskeyRequest(
  request: Extract<ContentRequest, { type: 'content/webauthn' }>,
  sender: chrome.runtime.MessageSender,
  tabId: number,
  site: Site,
): Promise<WebAuthnStart> {
  const browsers: WebAuthnStart = { outcome: { type: 'fallback' } };
  // The top frame only: Passhold's frame is drawn there, and a frame of
  // another site inside the page is a request the browser's own dialog names.
  if (sender.frameId !== 0 || !sender.documentId || !(await loadVaultFile()) || !(await loadPrefs()).passkeys) return browsers;
  if (request.op !== 'create' && request.op !== 'get') return browsers;
  const create = request.op === 'create' ? readCreateOptions(request.options) : null;
  const get = request.op === 'get' ? readGetOptions(request.options) : null;
  const rpId = create || get ? rpIdFor(site.origin, (create ?? get)!.rpId) : null;
  // Malformed, for another site, or for a security key: the browser answers it, as it would without Passhold.
  if (!rpId) return browsers;
  const conditional = request.conditional === true && request.op === 'get';
  const vault = await current();
  if (!vault && get) {
    const known = await held<string[]>(PASSKEY_SITES);
    if (known && !known.includes(rpId)) return browsers;
  }
  const rows = vault && get ? passkeyLogins(everyItem(vault.data), rpId, get.allow).length : 0;
  // Nothing of Passhold's the site would take: the browser's own passkeys, a phone, a key.
  if (vault && get && rows === 0) return browsers;

  const entry: PasskeyRequest = {
    token: newToken(),
    id: request.id,
    tabId,
    documentId: sender.documentId,
    origin: site.origin,
    rpId,
    op: request.op,
    conditional,
    at: Date.now(),
    create,
    get,
  };
  // One request at a time per page, as in the browser: a new one ends the one before.
  const superseded = await tableTurn(async () => {
    const live = await livePasskeyRequests();
    const kept = live.filter((other) => other.documentId !== entry.documentId);
    await passkeyRequests.write(Object.fromEntries([...kept, entry].map((each) => [each.token, each])));
    return live.filter((other) => other.documentId === entry.documentId);
  });
  for (const old of superseded) await settlePasskey(old, NOT_ALLOWED);
  if (conditional) return { waiting: true };
  return { dialog: { token: entry.token, height: passkeyHeight(entry, rows) } };
}

async function cancelPasskeyRequest(id: string, sender: chrome.runtime.MessageSender): Promise<void> {
  await tableTurn(async () => {
    const table = await passkeyRequests.read();
    await passkeyRequests.write(
      Object.fromEntries(Object.entries(table).filter(([, entry]) => !(entry.id === id && entry.documentId === sender.documentId))),
    );
  });
}

async function passkeyView(token: string, sender: chrome.runtime.MessageSender): Promise<PasskeyView> {
  const entry = await passkeyRequestFor(token, sender);
  const view: PasskeyView = {
    op: entry.op,
    state: 'ready',
    site: siteName(siteOf(entry.origin)!),
    userName: entry.create ? entry.create.user.name || entry.create.user.displayName : '',
    accounts: [],
  };
  if (!(await loadVaultFile())) return { ...view, state: 'uninitialized' };
  const vault = await current();
  if (!vault) return { ...view, state: 'locked' };
  if (entry.create) {
    const exclude = entry.create.exclude;
    const held = holdsPasskey(vault.data, entry.rpId, exclude);
    return held ? { ...view, state: 'exists' } : view;
  }
  const accounts = passkeyLogins(everyItem(vault.data), entry.rpId, entry.get!.allow).map((item) => ({
    id: item.id,
    title: item.title,
    username: item.passkey!.userName || item.username,
    vault: sharedVaultName(vault.data, item.id),
  }));
  return { ...view, state: accounts.length ? 'ready' : 'none', accounts };
}

/**
 * One of the credentials a site would not have made again: one Passhold
 * already holds for it, in the vault's own or a shared vault, which signs
 * there too.
 */
const holdsPasskey = (data: VaultData, rpId: string, exclude: readonly string[]) =>
  everyItem(data).items.some((item) => item.deletedAt === null && item.passkey?.rpId === rpId && exclude.includes(item.passkey.credentialId));

/** The new passkey as the site reads it (WebAuthn's RegistrationResponseJSON). */
async function makePasskey(entry: PasskeyRequest): Promise<WebAuthnOutcome> {
  const create = entry.create!;
  const { passkey, publicKey } = await createPasskey({
    rpId: entry.rpId,
    rpName: create.rpName,
    userHandle: create.user.id,
    userName: create.user.name,
    userDisplayName: create.user.displayName,
  });
  const made = await attestPasskey(passkey, publicKey);
  // Kept before the site hears of it: a passkey the site has and Passhold lost would lock its owner out.
  await change((data) => savePasskey(data, `${entry.origin}/`, passkey).data);
  return {
    type: 'credential',
    credential: {
      id: passkey.credentialId,
      rawId: passkey.credentialId,
      type: 'public-key',
      authenticatorAttachment: 'platform',
      response: {
        clientDataJSON: toBase64url(clientDataJSON('webauthn.create', create.challenge, entry.origin)),
        attestationObject: toBase64url(made.attestationObject),
        authenticatorData: toBase64url(made.authenticatorData),
        publicKey: toBase64url(made.publicKey),
        publicKeyAlgorithm: made.publicKeyAlgorithm,
        transports: ['hybrid', 'internal'],
      },
      clientExtensionResults: create.credProps ? { credProps: { rk: true } } : {},
    },
  };
}

/** A sign-in with a login's passkey, as the site reads it (AuthenticationResponseJSON). */
async function signWithPasskey(entry: PasskeyRequest, item: LoginItem): Promise<WebAuthnOutcome> {
  const passkey = item.passkey!;
  const clientData = clientDataJSON('webauthn.get', entry.get!.challenge, entry.origin);
  const signed = await assertPasskey(passkey, clientData);
  return {
    type: 'credential',
    credential: {
      id: passkey.credentialId,
      rawId: passkey.credentialId,
      type: 'public-key',
      authenticatorAttachment: 'platform',
      response: {
        clientDataJSON: toBase64url(clientData),
        authenticatorData: toBase64url(signed.authenticatorData),
        signature: toBase64url(signed.signature),
        userHandle: toBase64url(signed.userHandle),
      },
      clientExtensionResults: {},
    },
  };
}

/**
 * The passkey the person chose, for the request it answers: one this site
 * would take, chosen again here from the vault — the page's choice of site
 * was settled when it asked, and the frame's word is only which login. A
 * shared vault's signs as the vault's own does: whoever shares a login shares
 * signing in to it.
 */
function chosenPasskey(data: VaultData, entry: PasskeyRequest, id: string | undefined): LoginItem {
  const item = passkeyLogins(everyItem(data), entry.rpId, entry.get?.allow ?? []).find((candidate) => candidate.id === id);
  if (!item) fail('error.itemNotFound');
  return item;
}

async function answerPasskey(token: string, answer: PasskeyAnswer, id: string | undefined, sender: chrome.runtime.MessageSender): Promise<void> {
  const pending = await passkeyRequestFor(token, sender);
  if (answer === 'cancel' || answer === 'other') {
    const entry = await takePasskeyRequest(token);
    await settlePasskey(entry, answer === 'other' ? { type: 'fallback' } : NOT_ALLOWED);
    return;
  }
  const vault = await requireUnlocked();
  if (answer === 'save') {
    if (!pending.create) fail('error.expired');
    const entry = await takePasskeyRequest(token);
    const exclude = pending.create.exclude;
    if (holdsPasskey(vault.data, entry.rpId, exclude)) {
      await settlePasskey(entry, { type: 'error', name: 'InvalidStateError', message: 'The authenticator already holds a credential for this account.' });
      return;
    }
    await answerWith(entry, () => makePasskey(entry));
    return;
  }
  if (!pending.get) fail('error.expired');
  const item = chosenPasskey(vault.data, pending, id);
  const entry = await takePasskeyRequest(token);
  await answerWith(entry, () => signWithPasskey(entry, item));
  await change((data) => whereItemIs(data, item.id, (items) => markUsed(items, item.id)));
}

// --- the Keyrook account ------------------------------------------------------------------

/**
 * The account's page, where Passhold offers to save nothing. Its password is
 * the one Passhold opens with ("One password, never two"), and its forms ask
 * for it again to confirm a change — a family made, someone confirmed —
 * beside fields that are no username: an invitation's address, a family's
 * name. Taken for sign-ins, they were offered to be saved under those. Known
 * by Chrome's stamp on the frame's messages, never by what a page says.
 */
const ACCOUNT_PAGE_ORIGIN = new URL(__KEYROOK_ACCOUNT_PAGE__).origin;

/**
 * Passhold's web vault, where no script of Passhold's runs (the manifest
 * keeps all three off it): should a frame of that origin speak all the same,
 * it is answered nothing — no list, no fill, no save, and no passkey request
 * taken from it, as its passkeys are the account's. Known by Chrome's stamp
 * on the frame's messages, never by what a page says.
 */
const VAULT_PAGE_ORIGIN = new URL(__KEYROOK_VAULT_PAGE__).origin;

const SYNC_ALARM = 'ph.sync';
let syncRun: Promise<SyncResult> | null = null;
let syncTimer: ReturnType<typeof setTimeout> | undefined;

/** Soon, and once: a burst of edits is one sync. The alarm catches whatever a sleeping worker drops. */
function scheduleSync(delay = 3_000): void {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => void syncNow().catch(() => undefined), delay);
}

/** One sync at a time: two would spend the same refresh token, and the server ends a session for that. */
function syncNow(): Promise<SyncResult> {
  syncRun ??= runSync()
    .then(async (result) => {
      // Inside the sync, not after it: nothing else the person does starts while these still use the session.
      await besideTheVault();
      return result;
    })
    .finally(() => {
      syncRun = null;
    });
  return syncRun;
}

/**
 * What a sync reads beside the vault, on the one session and side by side,
 * each quietly: a plan without it, a server that does not offer it or cannot
 * answer, refuses, and nothing is lost.
 */
async function besideTheVault(): Promise<void> {
  await withProductKey(
    async (api, productKey) => {
      await Promise.allSettled([
        // Passhold's own box of the contact key, its key handed to each contact compared here, and what Settings shows.
        (async () => {
          await handOverEmergency(api, productKey);
          await saveEmergency({ accountId: productKey.accountId, view: await emergencyView(api, productKey) });
        })(),
        // The plan the server names now, and whether it sells plans; one it cannot
        // name leaves the last answer standing, and one with no plans to read —
        // a server from before billing — sells none.
        (async () => {
          const billing = await api.billing().catch((error: unknown) => {
            if (error instanceof SyncHttpError && error.status === 404) return null;
            throw error;
          });
          await keepPlan(productKey.accountId, billing ? planFromBilling(billing) : undefined, billing ? plansOfferedFromBilling(billing) : false);
        })(),
        // And the link's codes, read now so that opening a login asks the server nothing.
        (async () => keepLinked(productKey.accountId, await readLinkedCodes(api, productKey)))(),
        // Files no item names any more, now that the records that named them have gone up; and uploads a page gave up on.
        deleteLeftFiles(api),
      ]);
    },
    { quiet: true },
  ).catch(() => undefined);
  // What these keep — emergency access, the link's codes — is in session
  // storage, not the vault, so no commit tells the pages: this does, or an open
  // Settings would still show what it read before the sync.
  broadcast();
}

/** How the account's list of devices names this browser. Firefox has no `userAgentData`: its system is read from the user agent. */
function deviceName(): string {
  const hint = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform;
  return deviceLabel(browserName(), systemOf(hint, navigator.userAgent));
}

/**
 * When this browser was removed from the account, if `error` is the server
 * saying so with a proof Passhold's key checks; null for any other refusal.
 * Passhold's own calls and @keyrook/account's flows hear it alike.
 */
async function removedBy(error: unknown, link: AccountLink): Promise<number | null> {
  const removal = (error instanceof KeyrookError || error instanceof SyncHttpError) && error.code === 'device_removed';
  return removal ? removalProved(link, error.proof) : null;
}

/**
 * The vault once the server refused this browser's session: signed out,
 * keeping all it holds — or, where `error` is a removal whose proof
 * Passhold's key checks, with what the account holds taken off. The server
 * alone can sign this browser out, never empty it.
 */
async function signedOutData(data: VaultData, link: AccountLink, error: unknown): Promise<VaultData> {
  const removedAt = await removedBy(error, link);
  if (removedAt === null) return { ...data, account: { ...link, tokens: null } };
  // A recovery key drawn for the account and not yet set has no place here now either.
  await drop(KIT_DRAFT);
  return removedFromAccount({ ...data, account: link }, removedAt);
}

/** The notice that this browser was removed from the account, closed by its owner. */
async function closeRemoval(): Promise<void> {
  await serial(async () => {
    const open = await requireUnlocked();
    const account = open.data.account;
    if (account?.removedAt) await commit(open, { ...open.data, account: { ...account, removedAt: null } });
  });
}

/** Who signed in, and with what: the session, Passhold's key, and the recovery key if one was made or used here. */
interface Authenticated {
  answer: Session;
  product: ProductKey;
  deviceId: string;
  kit?: AccountKitLink;
  /** Signed in with Google or GitHub: an account with no password. */
  provider?: SignInProvider;
  /** An account with no password, signed in some other way: with one of its passkeys, which does not say which provider. */
  passwordless?: boolean;
  /** The passkey that opened Passhold's key here, if one did. */
  passkey?: string;
  /** Passhold's key before this sign-in replaced it (the recovery key leaked): held until every record is sent again. */
  previousKey?: CryptoKey | null;
  previousKeyGeneration?: number;
  agentsMovePending?: boolean;
  agents?: StoredAgentsState;
}

const addressOf = (raw: string) => String(raw).trim().toLowerCase().slice(0, 320);

/**
 * The account's address as a sync says it, or null to keep the one known: an
 * address the server could have taken, with no control or format character —
 * a direction override would turn what follows it around on the page.
 */

/** The session as signed in, with the tokens it holds now. */
function answered(answer: Session, tokens: Tokens | null): Session {
  if (!tokens) fail('error.accountSignedOut');
  return { ...answer, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

/** Passhold's key as a link keeps it, or null for a link from before each product had a key of its own. */
async function productKeyOf(link: AccountLink | null | undefined): Promise<ProductKey | null> {
  if (!link?.accountId || !link.productKey || !link.root) return null;
  return {
    accountId: link.accountId,
    product: PRODUCT,
    key: await importDataKey(link.productKey),
    keyGeneration: link.keyGeneration,
    root: link.root,
    rootGeneration: link.rootGeneration,
    sheetVerifiedAt: link.sheetVerifiedAt,
  };
}

/** What a link keeps of Passhold's key: never the root's private half, which no flow hands back. */
async function keyFields(product: ProductKey): Promise<Pick<AccountLink, 'accountId' | 'productKey' | 'root' | 'keyGeneration' | 'rootGeneration' | 'sheetVerifiedAt'>> {
  return {
    accountId: product.accountId,
    productKey: await exportDataKey(product.key),
    root: product.root,
    keyGeneration: product.keyGeneration,
    rootGeneration: product.rootGeneration,
    sheetVerifiedAt: product.sheetVerifiedAt,
  };
}

/** The recovery key as the server last says it was set, with the one this vault holds when it is that one. */
function kitAfter(held: AccountKitLink | null, state: AccountKeysResponse): AccountKitLink | undefined {
  return nextAccountKit(held, state.recovery.wrappedAt) ?? undefined;
}

/** A recovery key made or typed here, as the vault keeps it: dated by the server's clock, which says when it was set. */
async function kitMade(api: HttpSyncAdapter, key: string, pending: boolean): Promise<AccountKitLink> {
  const state = await api.accountKeys();
  return { issuedAt: state.recovery.wrappedAt ?? Date.now(), key, pending };
}

/**
 * Passhold's key once @keyrook/account has opened what it could. A root this
 * computer had not seen — another app of the account replaced it — is taken
 * only on this computer's own word: the password or the recovery key typed
 * here just opened it, and the vault still holds Passhold's key to seal to it.
 *
 * Opened with `mustReplace`, the recovery key leaked: whoever read it could
 * have opened Passhold's key, and every record sealed under it. A new key
 * replaces it at once (`replaceProductKey`); the one before comes back too,
 * and is held until every record is sealed again under the new one and sent
 * with a higher revision — only then is it let go (`runSync`), so no record
 * is left that nothing here opens.
 */
async function settled(
  api: HttpSyncAdapter,
  opened: OpenedProductKey,
  resume: AccountLink | null,
): Promise<{
  product: ProductKey;
  previousKey: CryptoKey | null;
  previousKeyGeneration?: number;
  agentsMovePending?: boolean;
  agents?: StoredAgentsState;
}> {
  if (opened.status === 'open' && opened.mustReplace) {
    const replaced = await replaceProductKey(api, opened.productKey);
    // The link's key, sealed again under the new key while the one before still opens it; with no link, or a plan
    // that does not hold one, there is nothing to seal.
    await openLink(api, replaced.productKey, AUTHENTICATOR, replaced.previousKey ?? undefined).catch(() => undefined);
    // If agents were turned on under the replaced key, try moving them now while the old key is in hand;
    // if interrupted or offline, keep `previousKey` + `previousKeyGeneration` with `agentsMovePending: true`.
    let agents = resume?.agents;
    let agentsMovePending = false;
    try {
      const state = await api.agents(resume?.agents?.checkpoint.version ?? 0);
      if (state.authority && state.authority.keyGeneration === opened.productKey.keyGeneration) {
        const moved = await moveAgentsToNewKey(api, opened.productKey, replaced.productKey, resume?.agents?.checkpoint ?? null);
        agents = toStoredAgentsState(moved, resume?.agents);
      }
    } catch (error) {
      if (!(error instanceof SyncHttpError && (error.code === 'not_offered' || error.status === 404 || error.status === 501))) {
        agentsMovePending = true;
      }
    }
    return {
      product: replaced.productKey,
      previousKey: replaced.previousKey,
      previousKeyGeneration: opened.productKey.keyGeneration,
      ...(agentsMovePending ? { agentsMovePending: true } : {}),
      ...(agents ? { agents } : {}),
    };
  }
  if (opened.status === 'open' || opened.status === 'joined') return { product: opened.productKey, previousKey: null };
  if (opened.status === 'awaiting-confirmation') {
    const held = await productKeyOf(resume);
    if (!held) fail('error.accountRootChanged');
    return { product: await sealToRoot(api, held, opened.root), previousKey: null };
  }
  fail('error.accountNeedsRoot');
}

/** The link this vault already has to the account the server named, if any: the root it pinned, the key it holds. */
async function linkFor(accountId: string): Promise<AccountLink | null> {
  const before = (await current())?.data.account ?? (await held<{ link: AccountLink }>(JOIN))?.link ?? null;
  return before?.accountId === accountId ? before : null;
}

/**
 * Sign in with a Keyrook account's email and password, as @keyrook/account
 * does it: the password becomes `authHash` before anything is sent, and the
 * account's root comes back wrapped under a key only the password derives,
 * opening Passhold's box here — or, on an account Passhold has not been to,
 * taking Passhold's key sealed to it.
 *
 * An account Keyrook Authenticator made before roots has none: the person is
 * told first (`error.accountNeedsRoot`), and with `makeRoot` Passhold gives it
 * one — wrapped under the recovery key the account already has when it is
 * typed, which the server checks without Passhold ever seeing the old wrap,
 * or under a new one, shown once. The sign-in that found no root waits for
 * that choice (`ROOT_WAIT`), and the root is made with it: on an account with
 * a second step, signing in again would take another code. Making the root
 * takes a code of its own there; `step` is then that one.
 */
async function withPassword(
  email: string,
  password: string,
  makeRoot?: { recoveryKey?: string },
  step?: SecondStepAnswer,
): Promise<Authenticated & { newRecoveryKey: string | null }> {
  // Passhold's own check of what prelogin hands back, which @keyrook/account's
  // `passwordKeys` makes too, with a ceiling as well: a count of a billion
  // would hang the browser before anything is checked.
  const { kdf } = await prelogin(email);
  const keys = await deriveAccountKeys(String(password), kdf);
  const waiting = await rootWaitFor(email, makeRoot !== undefined);
  const { answer, deviceId } = waiting ?? (await passwordLogin(email, keys.authHash, step));
  const session = connect(answer);
  const accountId = answer.account.id;
  const resume = await linkFor(accountId);
  let opened = await openProductKey(session.api, {
    accountId,
    product: PRODUCT,
    unlockWith: { keys },
    ...(resume?.root ? { pinned: { root: resume.root } } : {}),
  });
  let newRecoveryKey: string | null = null;
  let typedSheet: string | null = null;
  if (opened.status === 'no-root') {
    // Told before anything changes on the account. The session waits in
    // session memory, with the tokens it holds now, for its owner's choice.
    const wait = () =>
      hold({
        [ROOT_WAIT]: { email, deviceId, answer: answered(answer, session.tokens()), at: waiting?.at ?? Date.now() } satisfies RootWait,
      });
    if (!makeRoot) {
      await wait();
      fail('error.accountNeedsRoot');
    }
    let made: Awaited<ReturnType<typeof createAccountRoot>>;
    // A step sent with a sign-in that was waiting is this one's: the sign-in's was taken before.
    const secondStep = waiting && step ? await ownerStep(step) : undefined;
    try {
      if (makeRoot.recoveryKey !== undefined && !isAccountKitKey(makeRoot.recoveryKey)) fail('error.accountKitShape');
      typedSheet = makeRoot.recoveryKey !== undefined ? formatAccountKitKey(makeRoot.recoveryKey) : null;
      made = await createAccountRoot(session.api, { accountId, product: PRODUCT, keys, ...(typedSheet ? { recoveryKey: typedSheet } : {}), ...(secondStep ? { secondStep } : {}) });
      await tookCode(secondStep);
    } catch (error) {
      // Asked for a code, or another after a wrong one: the sign-in goes on waiting.
      await wait();
      throw error;
    }
    await drop(ROOT_WAIT);
    opened = made.opened;
    newRecoveryKey = made.recoveryKey;
  }
  const { product, previousKey, previousKeyGeneration, agentsMovePending, agents } = await settled(session.api, opened, resume);
  const sheet = newRecoveryKey ?? typedSheet;
  const kit = sheet ? await kitMade(session.api, sheet, newRecoveryKey !== null) : kitAfter(resume?.kit ?? null, await session.api.accountKeys());
  // Signed in with its password, the account has one — whatever the link held before.
  return {
    answer: answered(answer, session.tokens()),
    product,
    previousKey,
    ...(previousKeyGeneration !== undefined ? { previousKeyGeneration } : {}),
    ...(agentsMovePending ? { agentsMovePending: true } : {}),
    ...(agents ? { agents } : {}),
    deviceId,
    passwordless: false,
    ...(kit ? { kit } : {}),
    newRecoveryKey,
  };
}

// --- A sign-in's second step ----------------------------------------------------------

/** A sign-in waiting on its second step: the server's ticket, for this address and this device. */
const SECOND_STEP = 'ph.secondStep';
/** As long as the server keeps the ticket. */
const SECOND_STEP_TTL = 5 * 60_000;

interface WaitingStep {
  ticket: string;
  email: string;
  deviceId: string;
  passkeys: boolean;
  at: number;
}

/**
 * The password's sign-in, and the second step its account may ask for. The
 * first answer is then a ticket, not a session: held in session memory, and
 * the page asked (`error.secondStepAsked`). The page sends the same sign-in
 * again with the code, the recovery key or a passkey, which finishes it on
 * the device the ticket was given for. A wrong code leaves the ticket for
 * another try, as the server does.
 */
async function passwordLogin(email: string, authHash: string, step?: SecondStepAnswer): Promise<{ answer: Session; deviceId: string }> {
  if (step) {
    const waiting = await held<WaitingStep>(SECOND_STEP);
    if (!waiting || waiting.email !== email || Date.now() - waiting.at > SECOND_STEP_TTL) fail('error.signInExpired');
    const request = await stepRequest(waiting.ticket, step);
    const answer = await finishSecondStep(request);
    await tookCode(request);
    await drop(SECOND_STEP);
    return { answer, deviceId: waiting.deviceId };
  }
  const deviceId = newId();
  const answer = await login({ email, authHash, deviceId, deviceName: deviceName() });
  if ('secondStep' in answer) {
    await hold({ [SECOND_STEP]: { ticket: answer.secondStep.ticket, email, deviceId, passkeys: answer.secondStep.passkeys, at: Date.now() } satisfies WaitingStep });
    fail('error.secondStepAsked');
  }
  await drop(SECOND_STEP);
  return { answer, deviceId };
}

/**
 * The last code a second step took here, and when. The server takes a code
 * once, and counts it again as a wrong one toward locking the address out —
 * and a change right after a sign-in asks for a code of its own. Typed again
 * while the app may still show it, it is refused here, never sent.
 */
const TAKEN_CODE = 'ph.takenCode';
/** The half-minute an app shows a code, the one after, and some. */
const TAKEN_CODE_TTL = 90_000;

/** A code as typed, spaces out; refused if it is the one just taken. */
async function freshCode(typed: unknown): Promise<string> {
  const code = String(typed).replace(/\s/g, '');
  const taken = await held<{ code: string; at: number }>(TAKEN_CODE);
  if (taken && taken.code === code && Date.now() - taken.at <= TAKEN_CODE_TTL) fail('error.secondStepTaken');
  return code;
}

/** The code a step was just taken with, if it was one. */
async function tookCode(proof: SecondStepProof | SecondStepRequest | undefined): Promise<void> {
  if (proof && 'code' in proof && proof.code) await hold({ [TAKEN_CODE]: { code: proof.code, at: Date.now() } });
}

/** What finishes a sign-in's second step: the code, the recovery key's proof, or a passkey's answer without its extension results. */
async function stepRequest(ticket: string, step: SecondStepAnswer): Promise<SecondStepRequest> {
  if ('passkey' in step) {
    return { ticket, passkey: { challengeId: String(step.passkey.challengeId), credential: passkeyCredential(step.passkey.answer) } };
  }
  return { ticket, ...(await ownerStep(step)) };
}

/**
 * The second step beside an owner's proof — the password, or a fresh sign-in
 * with Google or GitHub — on an account that has one: the code, or the
 * recovery key in its place. A passkey proves the owner alone, and is not this.
 */
async function ownerStep(step: SecondStepAnswer): Promise<SecondStepProof> {
  if ('code' in step) return { code: await freshCode(step.code) };
  if ('recoveryKey' in step) {
    if (!isAccountKitKey(String(step.recoveryKey))) fail('error.accountKitShape');
    return { recoveryAuthHash: await accountKitProof(formatAccountKitKey(String(step.recoveryKey))) };
  }
  fail('error.secondStepNeeded');
}

/** A sign-in to an account with no root yet, waiting while its owner is told and chooses (`withPassword`). */
const ROOT_WAIT = 'ph.rootWait';
/** Long enough to find the old recovery key, as a sign-in waiting for its vault. */
const ROOT_WAIT_TTL = 15 * 60_000;

interface RootWait {
  email: string;
  deviceId: string;
  answer: Session;
  at: number;
}

/**
 * The sign-in waiting for its account's root, when this one gives it: the
 * same address, in time. Any other is ended, so an owner who went another
 * way leaves no session behind.
 */
async function rootWaitFor(email: string, makingRoot: boolean): Promise<RootWait | null> {
  const waiting = await held<RootWait>(ROOT_WAIT);
  if (!waiting) return null;
  if (makingRoot && waiting.email === email && Date.now() - waiting.at <= ROOT_WAIT_TTL) return waiting;
  await endRootWait();
  return null;
}

/** Not giving the account its root after all: the waiting sign-in is ended. */
async function endRootWait(): Promise<void> {
  const waiting = await held<RootWait>(ROOT_WAIT);
  await drop(ROOT_WAIT);
  if (waiting) await logout(waiting.answer.refreshToken).catch(() => undefined);
}

/** The sign-in waiting on its second step, as a page shows it: whether one of the account's passkeys may answer. */
async function secondStepView(): Promise<{ passkeys: boolean } | null> {
  const waiting = await held<WaitingStep>(SECOND_STEP);
  return waiting && Date.now() - waiting.at <= SECOND_STEP_TTL ? { passkeys: waiting.passkeys } : null;
}

/** A challenge for one of the account's passkeys to answer as the second step: of the password's sign-in, or Google's or GitHub's. */
async function secondStepPasskey(): Promise<AccountPasskeyOptions> {
  const waiting = await held<WaitingStep>(SECOND_STEP);
  const outcome = await held<Outcome>(PROVIDER);
  const ticket = waiting?.ticket ?? (outcome?.kind === 'secondStep' ? outcome.ticket : null);
  if (!ticket) fail('error.signInExpired');
  try {
    const options = await secondStepPasskeyOptions(ticket);
    if (options.publicKey.rpId !== __KEYROOK_ACCOUNT_RP__) fail('error.accountServerWrong');
    return options;
  } catch (error) {
    accountFailure(error);
  }
}

/** Ask Keyrook to email a code, to set a forgotten account password anew with the recovery key. */
async function recoverCode(rawEmail: string): Promise<void> {
  try {
    await requestRecoveryCode(SERVER.baseUrl, addressOf(rawEmail), SERVER.fetcher);
  } catch (error) {
    accountFailure(error);
  }
}

/**
 * A forgotten account password, set anew through the account's recovery key
 * and a code sent to its address (@keyrook/account's `recoverAccount`):
 * someone who found the printed sheet still needs the inbox. Every other
 * device is signed out by the server and signs in with the new password.
 */
async function withSheet(email: string, code: string, rawKey: string, password: string): Promise<Authenticated> {
  if (!strongEnoughForAccount(String(password))) fail('error.accountPasswordWeak');
  if (!isAccountKitKey(String(rawKey))) fail('error.accountKitShape');
  const recoveryKey = formatAccountKitKey(String(rawKey));
  const deviceId = newId();
  let session: ReturnType<typeof connect> | null = null;
  try {
    const recovered = await recoverAccount(
      SERVER,
      { email, recoveryKey, code: String(code).replace(/\D/g, '').slice(0, 6), newPassword: String(password), product: PRODUCT, deviceId, deviceName: deviceName() },
      (answer) => (session = connect(answer)).api,
    );
    const api = session!.api;
    const { product, previousKey, previousKeyGeneration, agentsMovePending, agents } = await settled(api, recovered.opened, await linkFor(recovered.session.account.id));
    // The key just worked: kept, so it can be seen again, and already put away.
    const kit = await kitMade(api, recoveryKey, false);
    return {
      answer: answered(recovered.session, session!.tokens()),
      product,
      previousKey,
      ...(previousKeyGeneration !== undefined ? { previousKeyGeneration } : {}),
      ...(agentsMovePending ? { agentsMovePending: true } : {}),
      ...(agents ? { agents } : {}),
      deviceId,
      passwordless: false,
      kit,
    };
  } catch (error) {
    // Said alike for an unknown address and a wrong key, as the server says it.
    if (error instanceof SyncHttpError && error.code === 'invalid_credentials') fail('error.accountKitWrong');
    throw error;
  }
}

/**
 * The vault's link to the account, picking up where a link to the same account
 * and key stopped — or to the key this sign-in just replaced, whose every
 * record then goes up again under the new one.
 */
async function linkOf(auth: Authenticated, resume: AccountLink | null): Promise<AccountLink> {
  const fields = await keyFields(auth.product);
  const previous = auth.previousKey ? await exportDataKey(auth.previousKey) : null;
  const same = resume?.accountId === fields.accountId && (resume.productKey === fields.productKey || (previous !== null && resume.productKey === previous)) ? resume : null;
  const nextPreviousKey = previous ?? (same?.productKey === fields.productKey ? same.previousKey : null);
  const nextPreviousGen =
    auth.previousKeyGeneration ??
    (same?.productKey === fields.productKey ? same.previousKeyGeneration : undefined);
  const nextAgentsMove = auth.agentsMovePending ?? (same?.productKey === fields.productKey ? same.agentsMovePending : undefined);
  const nextAgents = auth.agents ?? same?.agents;
  return {
    email: auth.answer.account.email,
    // Given on account.keyrook.com: as a sign-in says it, and every sync after. A server from before, or a
    // sign-in through Google or GitHub, says nothing here, and what was known stays.
    name: auth.answer.account.name === undefined ? (same?.name ?? null) : cleanAccountName(auth.answer.account.name),
    deviceId: auth.deviceId,
    ...fields,
    previousKey: nextPreviousKey,
    ...(nextPreviousKey && nextPreviousGen !== undefined ? { previousKeyGeneration: nextPreviousGen } : {}),
    ...(nextAgentsMove ? { agentsMovePending: true } : {}),
    ...(nextAgents ? { agents: nextAgents } : {}),
    tokens: { accessToken: auth.answer.accessToken, refreshToken: auth.answer.refreshToken },
    serverRev: same?.serverRev ?? 0,
    epoch: same?.epoch ?? null,
    known: same ? (previous ? resendAll(same.known) : same.known) : {},
    lastSyncAt: same?.lastSyncAt ?? null,
    kit: auth.kit ?? same?.kit ?? null,
    // As the server says at the next sync: a start over that signed this browser out is over.
    pendingStartOver: null,
    // Said until its owner closes it, signed in again or not.
    removedAt: resume?.removedAt ?? null,
    provider: auth.provider ?? same?.provider ?? null,
    // As this sign-in says: an account may have gained a password since the link was made.
    passwordless: auth.passwordless ?? (auth.provider ? true : (same?.passwordless ?? false)),
    // A passkey here held the key before: it opens nothing now, and is set up again.
    passkey: previous ? null : auth.passkey ?? same?.passkey ?? null,
  };
}

/** Signed in, it is signed in; signed out by the server, signing in again to the same account picks up where it stopped. */
function refuseAnotherAccount(vault: UnlockedVault, email: string): void {
  const before = vault.data.account;
  if (before && (before.tokens || before.email !== email)) fail('error.accountAlready');
}

/** The session and Passhold's key, sealed into the vault: signed in from here on. */
async function keep(auth: Authenticated): Promise<void> {
  const before = await serial(async () => {
    const open = await requireUnlocked();
    const link = await linkOf(auth, open.data.account);
    const before = open.data.account;
    // One account per vault: signed in to another, this is not the way to switch.
    // The same account with Passhold's key just replaced is still this one.
    if (before?.tokens && before.productKey !== link.productKey && before.productKey !== link.previousKey) fail('error.accountAlready');
    await commit(open, { ...open.data, account: link }, true);
    return before;
  });
  // A link from before each product had a key of its own put the account's one
  // shared key up under a passkey: that record goes, now that it opens nothing here.
  // So does one holding Passhold's key from before this sign-in replaced it.
  if (before?.passkey && (before.productKey === null || auth.previousKey)) {
    const link = (await requireUnlocked()).data.account;
    if (link) await putPasskeyRecord(link, { id: passkeyRecordId(before.passkey), box: null }).catch(() => undefined);
  }
}

/**
 * A sign-in that holds Passhold's key now, wherever it goes: into the vault,
 * or — on a computer with no vault yet — waiting for the vault to be made.
 */
async function adopt(auth: Authenticated): Promise<{ joined: boolean }> {
  if (!(await loadVaultFile())) {
    await chrome.storage.session.set({ [JOIN]: { link: await linkOf(auth, null), at: Date.now() } });
    return { joined: true };
  }
  await keep(auth);
  await chrome.alarms.create(SYNC_ALARM, { periodInMinutes: 5 });
  scheduleSync(0);
  return { joined: false };
}

/** Sign in from a vault that exists. A new recovery key, when giving an old account its root made one, comes back to show. */
async function signIn(
  rawEmail: string,
  password: string,
  makeRoot?: { recoveryKey?: string },
  step?: SecondStepAnswer,
): Promise<SyncResult & { recoveryKey: string | null }> {
  const email = addressOf(rawEmail);
  refuseAnotherAccount(await requireUnlocked(), email);
  let recoveryKey: string | null;
  try {
    const auth = await withPassword(email, password, makeRoot, step);
    recoveryKey = auth.newRecoveryKey;
    await keep(auth);
  } catch (error) {
    accountFailure(error);
  }
  await followAccountPassword(String(password));
  await chrome.alarms.create(SYNC_ALARM, { periodInMinutes: 5 });
  return { ...(await syncNow()), recoveryKey };
}

/**
 * A forgotten account password set anew with the recovery key: into the vault
 * when there is one, which then opens with the new password if it opened with
 * the old; on a new computer, waiting for the vault, as a sign-in does.
 */
async function recover(rawEmail: string, code: string, rawKey: string, password: string): Promise<{ email: string; joined: boolean }> {
  const email = addressOf(rawEmail);
  const vault = (await loadVaultFile()) ? await requireUnlocked() : null;
  if (vault) refuseAnotherAccount(vault, email);
  let joined: boolean;
  try {
    ({ joined } = await adopt(await withSheet(email, code, rawKey, password)));
  } catch (error) {
    accountFailure(error);
  }
  if (!joined) await followAccountPassword(String(password));
  return { email, joined };
}

/**
 * A vault that opens with the account's password follows it: signed in with
 * a new one — changed elsewhere, or set anew with the recovery key — this
 * vault opens with that from now on, and the old one opens nothing. One
 * password, never two.
 */
async function followAccountPassword(password: string): Promise<void> {
  await serial(async () => {
    const open = await requireUnlocked();
    if (open.file.passwordIs !== 'account' || secretOf(open.file) !== 'password') return;
    const file = await rewrapVault(open.file, open.dataKey, password, 'password');
    await commit({ ...open, file: { ...file, passwordIs: 'account' } }, open.data);
  });
}

/**
 * A sign-in made before there is a vault — on a new computer, the first
 * thing someone does. It waits in session memory, where the data key of an
 * open vault waits too, for the vault it is for: made next, by how this
 * browser should open it, with the account in it from the start.
 */
const JOIN = 'ph.join';
/** Long enough to choose how to unlock; not so long a forgotten sign-in lingers. */
const JOIN_TTL = 15 * 60_000;

async function join(
  rawEmail: string,
  password: string,
  makeRoot?: { recoveryKey?: string },
  step?: SecondStepAnswer,
): Promise<{ email: string; recoveryKey: string | null }> {
  if (await loadVaultFile()) fail('error.vaultExists');
  const email = addressOf(rawEmail);
  try {
    const auth = await withPassword(email, password, makeRoot, step);
    const link = await linkOf(auth, null);
    await chrome.storage.session.set({ [JOIN]: { link, at: Date.now() } });
    return { email: link.email, recoveryKey: auth.newRecoveryKey };
  } catch (error) {
    accountFailure(error);
  }
}

// --- Signing in with one of the Keyrook account's passkeys ------------------------------

/**
 * A challenge to sign in with one of the account's passkeys. They belong to
 * the account's page (`__KEYROOK_ACCOUNT_RP__`); a server that names any other
 * site is not asking for those, and Passhold touches nothing for it.
 */
async function passkeyChallenge(): Promise<AccountPasskeyOptions> {
  try {
    const options = await passkeySignInOptions(SERVER.baseUrl, SERVER.fetcher);
    if (options.publicKey.rpId !== __KEYROOK_ACCOUNT_RP__) fail('error.accountServerWrong');
    return options;
  } catch (error) {
    accountFailure(error);
  }
}

/**
 * Signed in with one of the account's passkeys, as @keyrook/account does it:
 * the answer goes to the server without the PRF answer (`passkeyCredential`),
 * which opens the account's root here, and the root Passhold's box — as the
 * password does, or takes Passhold's key sealed to it. The root is the one the
 * PRF answer opened, never one the server names.
 *
 * A passkey that only signs in opens nothing Passhold can use, though the
 * account's page lets it in, and there is where it is set right — so the
 * person is told which of two it is. With no PRF answer, where the passkey is
 * kept cannot unlock — iCloud Keychain before macOS 15 — and nothing is sent:
 * another passkey, kept elsewhere, is the way. With one, but nothing on the
 * server for it to open, the page can let it unlock; the session it began is
 * ended either way.
 */
async function withAccountPasskey(touch: AccountPasskeyTouch): Promise<Authenticated> {
  const prf = typeof touch.prf === 'string' ? fromBase64(touch.prf) : null;
  if (!prf || prf.length !== 32) fail('error.passkeyNoPrf');
  const deviceId = newId();
  const { session: signedIn, root } = await signInWithPasskey(
    SERVER,
    { challengeId: String(touch.challengeId), answer: touch.answer, prf },
    { deviceId, deviceName: deviceName() },
  );
  const session = connect(signedIn);
  if (!root) {
    await logout(session.tokens()?.refreshToken ?? signedIn.refreshToken).catch(() => undefined);
    fail('error.passkeyNoUnlock');
  }
  const accountId = signedIn.account.id;
  const resume = await linkFor(accountId);
  const opened = await openProductKey(session.api, {
    accountId,
    product: PRODUCT,
    unlockWith: { root },
    ...(resume?.root ? { pinned: { root: resume.root } } : {}),
  });
  const { product, previousKey } = await settled(session.api, opened, resume);
  const kit = kitAfter(resume?.kit ?? null, await session.api.accountKeys());
  // A passkey does not say which of Google and GitHub the account signs in
  // with; the session does. With one, it is
  // the one this browser signs in again with; with both, either is.
  const linked = (signedIn.account.providers ?? []).filter((name): name is SignInProvider => name === 'google' || name === 'github');
  const provider = resume?.provider ?? (signedIn.account.method === 'provider' && linked.length === 1 ? linked[0] : undefined);
  return {
    answer: answered(signedIn, session.tokens()),
    product,
    previousKey,
    deviceId,
    ...(kit ? { kit } : {}),
    ...(provider ? { provider } : {}),
    passwordless: signedIn.account.method === 'provider',
  };
}

/** Passhold on another computer, signed in with a passkey before there is a vault: the sign-in waits for it, as `join` does. */
async function joinWithAccountPasskey(touch: AccountPasskeyTouch): Promise<{ email: string }> {
  if (await loadVaultFile()) fail('error.vaultExists');
  try {
    const link = await linkOf(await withAccountPasskey(touch), null);
    await chrome.storage.session.set({ [JOIN]: { link, at: Date.now() } });
    return { email: link.email };
  } catch (error) {
    accountFailure(error);
  }
}

/** A vault here signed in with a passkey: to the account it had, or — with none — to the one the passkey is for. */
async function signInWithAccountPasskey(touch: AccountPasskeyTouch): Promise<SyncResult> {
  const before = (await requireUnlocked()).data.account;
  if (before?.tokens) fail('error.accountAlready');
  try {
    const auth = await withAccountPasskey(touch);
    // By the account's id: its address may have moved on account.keyrook.com while this browser was signed out.
    // A link from before each product had a key of its own kept no id, only the address.
    if (before && (before.accountId ? before.accountId !== auth.answer.account.id : before.email !== auth.answer.account.email)) {
      // One account per vault: this sign-in was for another, and goes no further.
      await logout(auth.answer.refreshToken).catch(() => undefined);
      fail('error.accountAlready');
    }
    await keep(auth);
  } catch (error) {
    accountFailure(error);
  }
  await chrome.alarms.create(SYNC_ALARM, { periodInMinutes: 5 });
  return syncNow();
}

/** The sign-in waiting for this vault, or a refusal: nothing is made without it. */
async function joined(): Promise<AccountLink> {
  const { [JOIN]: held } = (await chrome.storage.session.get(JOIN)) as { [JOIN]?: { link: AccountLink; at: number } };
  if (!held || Date.now() - held.at > JOIN_TTL) fail('error.joinExpired');
  return held.link;
}

/** The sign-in is in the vault now: out of session memory, and syncing on schedule. */
async function settleJoin(): Promise<void> {
  await chrome.storage.session.remove(JOIN);
  await chrome.alarms.create(SYNC_ALARM, { periodInMinutes: 5 });
}

/** A vault just made, with the account in it from the start. */
async function withLink(vault: UnlockedVault, link: AccountLink | null): Promise<UnlockedVault> {
  if (!link) return vault;
  const data = { ...vault.data, account: link };
  return { ...vault, data, file: await sealVault(vault.file, vault.dataKey, data) };
}

// --- Google and GitHub ---------------------------------------------------------------

/** A sign-in gone to the provider, until its answer comes back to this tab. */
const OAUTH = 'ph.oauth';
/** What the answer was: an account to make, one to be let into, or a refusal. */
const PROVIDER = 'ph.provider';
/** This browser's request to be let in, and the key pair it waits with. */
const PAIRING = 'ph.pairing';
/** Requests this browser is letting in, with the key pair for each. */
const APPROVING = 'ph.approving';
/** Long enough to choose an account at Google or GitHub. */
const OAUTH_TTL = 10 * 60_000;

type Outcome =
  | { kind: 'new'; provider: SignInProvider; email: string; signupToken: string; deviceId: string }
  /**
   * `method`: how the account proves its owner. An account with a password
   * may sign in with Google or GitHub too, but its password — not the
   * provider — is what opens its key, so no other browser is asked.
   */
  | { kind: 'existing'; provider: SignInProvider; email: string; accountId: string; tokens: Tokens; deviceId: string; method: 'password' | 'provider' }
  /** Signed in with Google or GitHub to an account with a second step: its ticket, to finish within five minutes. */
  | { kind: 'secondStep'; provider: SignInProvider; ticket: string; passkeys: boolean; deviceId: string; at: number }
  /** An old account given its root here: its new recovery key, if one was made, to show; `joined` as for a sign-in. */
  | { kind: 'rooted'; provider: SignInProvider; email: string; recoveryKey: string | null; joined: boolean }
  | { kind: 'failed'; error: MessageKey };

interface Held {
  provider: SignInProvider;
  state: string;
  verifier: string;
  at: number;
  /**
   * `reauth`: a sign-in again with the provider, made only to prove the
   * owner — what giving an account with no password its root takes — with
   * the recovery key it already has, if typed.
   */
  purpose?: 'reauth';
  recoveryKey?: string;
}

/**
 * Giving an account with no password its root, on an account with a second
 * step: the sign-in again with the provider, unspent — the server spends it
 * only once the code is right — waiting for that code, or for another after
 * a wrong one.
 */
const ROOT_REAUTH = 'ph.rootReauth';
/** As long as the server keeps a provider's sign-in unspent: time enough for the app's next code. */
const ROOT_REAUTH_TTL = 2 * 60_000;

interface RootReauth {
  ticket: string;
  verifier: string;
  recoveryKey?: string;
  at: number;
}

interface Waiting {
  id: string;
  keys: Awaited<ReturnType<typeof exportPairingKeys>>;
}

type Approving = Record<string, { keys: Awaited<ReturnType<typeof exportPairingKeys>>; requesterKey: string }>;

// Everything here lives in session memory: a service worker can stop while a
// person picks an account or walks to the other computer, and none of it may
// reach the disk.
const held = async <T,>(key: string): Promise<T | undefined> => ((await chrome.storage.session.get(key)) as Record<string, T | undefined>)[key];
const hold = (values: Record<string, unknown>) => chrome.storage.session.set(values);
const drop = (...keys: string[]) => chrome.storage.session.remove(keys);

/** The key a refusal is said in, without throwing it. */
function failureKey(error: unknown): MessageKey {
  try {
    accountFailure(error);
  } catch (refusal) {
    if (refusal instanceof AppError) return refusal.key;
  }
  return 'error.accountFailed';
}

/** Where this tab goes to sign in; the verifier and the state stay here. */
async function startProvider(provider: SignInProvider): Promise<{ url: string }> {
  const flow = await newProviderFlow();
  await drop(PROVIDER, PAIRING, ROOT_REAUTH);
  await hold({ [OAUTH]: { provider, state: flow.state, verifier: flow.verifier, at: Date.now() } satisfies Held });
  return { url: providerStartUrl(provider, flow.challenge, flow.state) };
}

/**
 * The answer, handed over by the Keyrook server's page in Passhold's own tab.
 * Only the answer to the sign-in this browser started is taken; anything else
 * spends nothing and changes nothing.
 */
async function finishProvider(answer: URLSearchParams): Promise<boolean> {
  const flow = await held<Held>(OAUTH);
  if (!flow || answer.get('state') !== flow.state || Date.now() - flow.at > OAUTH_TTL) return false;
  await drop(OAUTH);
  const outcome = flow.purpose === 'reauth' ? await makeRootWith(flow, answer) : await redeem(flow, answer);
  if (outcome) await hold({ [PROVIDER]: outcome });
  return true;
}

/**
 * An account Keyrook Authenticator made with Google or GitHub before roots,
 * signed in to here: it has no root, and nothing Passhold could open. Giving
 * it one takes proof of its owner beyond the session — a sign-in again with
 * the provider, made for this — and the recovery key it already has, if its
 * owner has it, which the server checks without Passhold seeing what it
 * wrapped before. Without it a new one is made, shown once.
 */
async function confirmForRoot(rawKey: string | undefined): Promise<{ url: string }> {
  const outcome = await outcomeOf('existing');
  if (rawKey !== undefined && !isAccountKitKey(String(rawKey))) fail('error.accountKitShape');
  const flow = await newProviderFlow();
  await hold({
    [OAUTH]: {
      provider: outcome.provider,
      state: flow.state,
      verifier: flow.verifier,
      at: Date.now(),
      purpose: 'reauth',
      ...(rawKey !== undefined ? { recoveryKey: formatAccountKitKey(String(rawKey)) } : {}),
    } satisfies Held,
  });
  return { url: providerStartUrl(outcome.provider, flow.challenge, flow.state, 'reauth') };
}

async function makeRootWith(flow: Held, answer: URLSearchParams): Promise<Outcome> {
  const ticket = answer.get('ticket');
  if (!ticket) return { kind: 'failed', error: answer.get('error') === 'denied' ? 'error.providerDenied' : 'error.providerFailed' };
  return rootWith({ ticket, verifier: flow.verifier, ...(flow.recoveryKey ? { recoveryKey: flow.recoveryKey } : {}), at: Date.now() });
}

/**
 * The code for giving the account its root, after the sign-in again. A
 * wrong one is typed again on the same form: the server checks the sign-in,
 * then the code, and spends the sign-in only once both hold.
 */
async function providerRootStep(step: SecondStepAnswer): Promise<ProviderView | null> {
  const reauth = await held<RootReauth>(ROOT_REAUTH);
  if (!reauth || Date.now() - reauth.at > ROOT_REAUTH_TTL) {
    await drop(ROOT_REAUTH);
    fail('error.signInExpired');
  }
  const proof = await ownerStep(step);
  await hold({ [PROVIDER]: await rootWith(reauth, proof) });
  return providerView();
}

async function rootWith(reauth: RootReauth, secondStep?: SecondStepProof): Promise<Outcome> {
  const outcome = await outcomeOf('existing');
  const { api, done } = await joiningApi();
  let made: Awaited<ReturnType<typeof createAccountRoot>> | undefined;
  try {
    try {
      made = await createAccountRoot(api, {
        accountId: outcome.accountId,
        product: PRODUCT,
        reauth: { ticket: reauth.ticket, verifier: reauth.verifier },
        ...(reauth.recoveryKey ? { recoveryKey: reauth.recoveryKey } : {}),
        ...(secondStep ? { secondStep } : {}),
      });
    } catch (error) {
      if (secondStep || failureKey(error) !== 'error.secondStepNeeded') throw error;
      // Asked for the code: the page asks for it, and the sign-in again waits unspent.
      await done();
      await hold({ [ROOT_REAUTH]: reauth });
      return outcomeOf('existing');
    }
    await drop(ROOT_REAUTH);
    await tookCode(secondStep);
    const { product, previousKey } = await settled(api, made.opened, null);
    const sheet = made.recoveryKey ?? reauth.recoveryKey!;
    const kit = await kitMade(api, sheet, made.recoveryKey !== null);
    const tokens = await done();
    await drop(PAIRING);
    const { joined } = await adopt({
      answer: { ...tokens, account: { id: outcome.accountId, email: outcome.email } },
      product,
      previousKey,
      deviceId: outcome.deviceId,
      provider: outcome.provider,

      passwordless: outcome.method !== 'password',
      kit,
    });
    return { kind: 'rooted', provider: outcome.provider, email: outcome.email, recoveryKey: made.recoveryKey, joined };
  } catch (error) {
    const said = failureKey(error);
    if (!made && secondStep && said === 'error.secondStepWrong') {
      // The sign-in again is still unspent, and so is the session: the form says so and takes another code. The
      // tokens are kept as the call left them, or a refresh it made would end the session on the next one.
      await done();
      fail(said);
    }
    // Not going on — the failed view only goes back — so nothing of this sign-in is kept.
    const now = await held<Outcome>(PROVIDER);
    await drop(ROOT_REAUTH);
    await logout((now?.kind === 'existing' ? now : outcome).tokens.refreshToken).catch(() => undefined);
    return { kind: 'failed', error: said };
  }
}

async function redeem(flow: Held, answer: URLSearchParams): Promise<Outcome | null> {
  const ticket = answer.get('ticket');
  if (!ticket) return { kind: 'failed', error: answer.get('error') === 'denied' ? 'error.providerDenied' : 'error.providerFailed' };
  const deviceId = newId();
  try {
    const signedIn = await providerSession({ ticket, verifier: flow.verifier, deviceId, deviceName: deviceName() });
    if (signedIn.status === 'new') return { kind: 'new', provider: flow.provider, email: signedIn.email, signupToken: signedIn.signupToken, deviceId };
    if (signedIn.status === 'second_step') {
      const { ticket: waiting, passkeys } = signedIn.secondStep;
      return { kind: 'secondStep', provider: flow.provider, ticket: waiting, passkeys, deviceId, at: Date.now() };
    }
    return await signedInWithProvider(flow.provider, signedIn.session, deviceId);
  } catch (error) {
    return { kind: 'failed', error: failureKey(error) };
  }
}

/** Signed in with Google or GitHub, the second step done where the account has one. */
async function signedInWithProvider(provider: SignInProvider, session: Session, deviceId: string): Promise<Outcome | null> {
  // Signed out of this same account by the server, the vault still holds Passhold's key: back in at once.
  const before = (await current())?.data.account;
  const method = session.account.method === 'password' ? 'password' : 'provider';
  const product = before?.accountId === session.account.id && before.provider === provider ? await productKeyOf(before) : null;
  if (product) {
    await adopt({ answer: session, product, deviceId, provider, passwordless: method === 'provider' });
    return null;
  }
  return {
    kind: 'existing',
    provider,
    email: session.account.email,
    accountId: session.account.id,
    tokens: { accessToken: session.accessToken, refreshToken: session.refreshToken },
    deviceId,
    method,
  };
}

/**
 * The second step of a sign-in with Google or GitHub: the code, the recovery
 * key, or a passkey, on the device the ticket was given for. Then on as any
 * such sign-in goes; what comes next is the page's to show.
 */
async function providerSecondStep(step: SecondStepAnswer): Promise<ProviderView | null> {
  const outcome = await outcomeOf('secondStep');
  if (Date.now() - outcome.at > SECOND_STEP_TTL) {
    await drop(PROVIDER);
    fail('error.signInExpired');
  }
  let session: Session;
  try {
    const request = await stepRequest(outcome.ticket, step);
    session = await finishSecondStep(request);
    await tookCode(request);
  } catch (error) {
    accountFailure(error);
  }
  const next = await signedInWithProvider(outcome.provider, session, outcome.deviceId);
  if (next) await hold({ [PROVIDER]: next });
  else await drop(PROVIDER);
  return providerView();
}

async function outcomeOf<K extends Outcome['kind']>(kind: K): Promise<Extract<Outcome, { kind: K }>> {
  const outcome = await held<Outcome>(PROVIDER);
  if (outcome?.kind !== kind) fail('error.providerExpired');
  return outcome as Extract<Outcome, { kind: K }>;
}

/** A call with the session a provider sign-in gave, keeping the tokens should they rotate. */
async function asJoining<T>(run: (accessToken: string) => Promise<T>): Promise<T> {
  const outcome = await outcomeOf('existing');
  const { value, tokens } = await withSession(outcome.tokens, run);
  if (tokens !== outcome.tokens) await hold({ [PROVIDER]: { ...outcome, tokens } });
  return value;
}

/** The provider sign-in's session for @keyrook/account's flows; `done` keeps the tokens it rotated to. */
async function joiningApi(): Promise<{ api: HttpSyncAdapter; done: () => Promise<Tokens> }> {
  const outcome = await outcomeOf('existing');
  const session = connect(outcome.tokens);
  return {
    api: session.api,
    done: async () => {
      const tokens = session.tokens();
      if (!tokens) fail('error.accountSignedOut');
      await hold({ [PROVIDER]: { ...outcome, tokens } });
      return tokens;
    },
  };
}

/**
 * An account with no password, made with Google or GitHub. Its root is
 * wrapped under a recovery key made with it, which cannot be skipped: once
 * every browser is gone, it is the only way back.
 */
async function createProviderAccount(): Promise<{ recoveryKey: string; joined: boolean }> {
  const outcome = await outcomeOf('new');
  try {
    const made = await createProvider(SERVER, { signupToken: outcome.signupToken, product: PRODUCT, deviceId: outcome.deviceId, deviceName: deviceName() });
    await drop(PROVIDER);
    const session = connect(made.session);
    const kit = await kitMade(session.api, made.recoveryKey, true);
    const placed = await adopt({
      answer: answered(made.session, session.tokens()),
      product: made.productKey,
      deviceId: outcome.deviceId,
      provider: outcome.provider,

      kit,
    });
    return { recoveryKey: made.recoveryKey, ...placed };
  } catch (error) {
    accountFailure(error);
  }
}

/**
 * Passhold's key and the account's state, for a browser being let in: the
 * key is taken only when it opens Passhold's pin on this account, which only
 * Passhold's key opens — a key any other browser, a stale passkey or the
 * server itself sent is refused, whoever made it.
 */
async function checkedKey(key: CryptoKey, accountId: string): Promise<{ product: ProductKey; state: AccountKeysResponse }> {
  const state = await asJoining(accountKeys);
  if (state.accountId !== accountId || !state.box || !state.root) fail('error.pairingWrongKey');
  const pin = await readPassholdPin(key, state.box.pin, accountId);
  if (!pin) fail('error.pairingWrongKey');
  // Sealed to a root the account no longer has: another app replaced it, and this browser cannot confirm it.
  if (pin.root !== state.root.publicKey) fail('error.accountRootChanged');
  return {
    product: {
      accountId,
      product: PRODUCT,
      key,
      keyGeneration: state.box.keyGeneration,
      root: pin.root,
      rootGeneration: state.root.generation,
      sheetVerifiedAt: pin.sheetVerifiedAt,
    },
    state,
  };
}

/** Ask a Passhold browser already in the account to let this one in. */
async function askToJoin(): Promise<void> {
  const keys = await newPairingKeys();
  try {
    const { id } = await asJoining((token) => requestPairing(token, keys.publicKey, deviceName()));
    await hold({ [PAIRING]: { id, keys: await exportPairingKeys(keys) } satisfies Waiting });
  } catch (error) {
    accountFailure(error);
  }
}

/**
 * Where the request stands. Once another browser has started letting this
 * one in, both show the same code; once it has, the key it sent must open
 * Passhold's pin before it is taken.
 */
async function pollJoin(): Promise<JoinProgress> {
  const waiting = await held<Waiting>(PAIRING);
  if (!waiting) return { state: 'ended' };
  const outcome = await outcomeOf('existing');
  let status;
  try {
    status = await asJoining((token) => pairingStatus(token, waiting.id));
  } catch (error) {
    if (error instanceof KeyrookError && error.status === 404) {
      await drop(PAIRING);
      return { state: 'ended' };
    }
    accountFailure(error);
  }
  const keys = await importPairingKeys(waiting.keys);
  if (!status.approverKey) return { state: 'waiting' };
  const code = await pairingCode(outcome.accountId, waiting.id, keys.publicKey, status.approverKey);
  if (status.status !== 'approved' || !status.wrap) return { state: 'accepted', code };

  // Delivered once: whatever happens next, this request is over.
  await drop(PAIRING);
  const key = await openPairedKey(outcome.accountId, keys, waiting.id, status.approverKey, status.wrap);
  const { product, state } = await checkedKey(key, outcome.accountId);
  const { tokens } = await outcomeOf('existing');
  await drop(PROVIDER);
  const placed = await adopt({
    answer: { ...tokens, account: { id: outcome.accountId, email: outcome.email } },
    product,
    deviceId: outcome.deviceId,
    provider: outcome.provider,

    passwordless: outcome.method !== 'password',
    kit: kitAfter(null, state),
  });
  return { state: 'done', ...placed };
}

/**
 * Let in with the recovery key instead: it opens the account's root, which
 * the server hands any session wrapped under it, and the root opens
 * Passhold's box — or, on an account no Passhold has signed in to yet, takes
 * Passhold's key sealed to it.
 */
async function joinWithKit(rawKey: string): Promise<{ joined: boolean }> {
  const outcome = await outcomeOf('existing');
  if (!isAccountKitKey(String(rawKey))) fail('error.accountKitShape');
  const recoveryKey = formatAccountKitKey(String(rawKey));
  try {
    const { api, done } = await joiningApi();
    const state = await api.accountKeys();
    if (!state.root) fail('error.accountOld');
    if (!state.root.recoveryWrap) fail('error.accountKitWrong');
    const root = await openRootBySheet(state.root.recoveryWrap, recoveryKey, outcome.accountId);
    const opened = await openProductKey(api, { accountId: outcome.accountId, product: PRODUCT, unlockWith: { root }, recoveryKeyTyped: true });
    const { product, previousKey } = await settled(api, opened, null);
    const kit = await kitMade(api, recoveryKey, false);
    const tokens = await done();
    const waiting = await held<Waiting>(PAIRING);
    if (waiting) await withSession(tokens, (token) => denyPairing(token, waiting.id)).catch(() => undefined);
    await drop(PROVIDER, PAIRING);
    return adopt({
      answer: { ...tokens, account: { id: outcome.accountId, email: outcome.email } },
      product,
      previousKey,
      deviceId: outcome.deviceId,
      provider: outcome.provider,

      passwordless: outcome.method !== 'password',
      kit,
    });
  } catch (error) {
    accountFailure(error);
  }
}

/**
 * Signed in with Google or GitHub to an account that has a password: the
 * password, not the provider, proves its owner, so it opens the account's
 * root as at any sign-in, and the root Passhold's box — or takes Passhold's
 * key sealed to it. No other browser is asked to let this one in.
 */
async function providerWithPassword(password: string): Promise<{ joined: boolean }> {
  const outcome = await outcomeOf('existing');
  try {
    const { kdf } = await prelogin(outcome.email);
    const keys = await deriveAccountKeys(String(password), kdf);
    const { api, done } = await joiningApi();
    const resume = await linkFor(outcome.accountId);
    const opened = await openProductKey(api, {
      accountId: outcome.accountId,
      product: PRODUCT,
      unlockWith: { keys },
      ...(resume?.root ? { pinned: { root: resume.root } } : {}),
    }).catch((error) => {
      // The root that will not open under it says the password was not the account's.
      if (error instanceof Error && error.name === 'DecryptionError') fail('error.accountPasswordWrong');
      throw error;
    });
    const { product, previousKey } = await settled(api, opened, resume);
    const kit = kitAfter(resume?.kit ?? null, await api.accountKeys());
    const tokens = await done();
    await drop(PROVIDER, PAIRING);
    const placed = await adopt({
      answer: { ...tokens, account: { id: outcome.accountId, email: outcome.email } },
      product,
      previousKey,
      deviceId: outcome.deviceId,
      provider: outcome.provider,
      passwordless: false,
      ...(kit ? { kit } : {}),
    });
    if (!placed.joined) await followAccountPassword(String(password));
    return placed;
  } catch (error) {
    accountFailure(error);
  }
}

/** Whether giving the account its root waits for a code, in time. */
async function rootStepWaiting(): Promise<boolean> {
  const reauth = await held<RootReauth>(ROOT_REAUTH);
  return reauth !== undefined && Date.now() - reauth.at <= ROOT_REAUTH_TTL;
}

/** Not going on: the request withdrawn, the session ended, nothing kept. */
async function cancelProvider(): Promise<void> {
  const outcome = await held<Outcome>(PROVIDER);
  const waiting = await held<Waiting>(PAIRING);
  await drop(OAUTH, PROVIDER, PAIRING, ROOT_REAUTH);
  if (outcome?.kind !== 'existing') return;
  if (waiting) await withSession(outcome.tokens, (token) => denyPairing(token, waiting.id)).catch(() => undefined);
  await logout(outcome.tokens.refreshToken).catch(() => undefined);
}

/**
 * What came back from the provider. For an account in which no Passhold has
 * a key yet, no browser can let this one in and no passkey holds the key:
 * the recovery key is the way.
 */
async function providerView(): Promise<ProviderView | null> {
  const outcome = await held<Outcome>(PROVIDER);
  if (!outcome) return null;
  if (outcome.kind === 'failed') return outcome;
  if (outcome.kind === 'new') return { kind: 'new', provider: outcome.provider, email: outcome.email };
  if (outcome.kind === 'rooted') return outcome;
  if (outcome.kind === 'secondStep') return { kind: 'secondStep', provider: outcome.provider, passkeys: outcome.passkeys };
  const state = await asJoining(accountKeys).catch(() => null);
  return {
    kind: 'existing',
    provider: outcome.provider,
    email: outcome.email,
    asked: Boolean(await held<Waiting>(PAIRING)),
    keyed: state ? state.box !== null : true,
    rooted: state ? state.root !== null : true,
    rootStep: await rootStepWaiting(),
    password: outcome.method === 'password',
  };
}

// --- A passkey for new computers ---------------------------------------------------

/** The passkey records found for an account this browser is being let into, by record id. */
const PASSKEYS = 'ph.passkeys';

/**
 * Put Passhold's key up under a passkey: wrapped under its answer, as a
 * record of Passhold's own kind, which the server cannot open and no other
 * product is handed. Asked again with the same passkey, it replaces the
 * record.
 */
async function enrollPasskey(credentialId: string, prf: string): Promise<void> {
  const link = (await requireUnlocked()).data.account;
  if (!link?.tokens || !link.productKey) fail('error.accountNone');
  const id = passkeyRecordId(credentialId);
  // The server takes ids of up to 128 characters; a credential that long is not one this can hold.
  if (id.length > 128) fail(deviceUnsupported());
  const box = await wrapForPasskey(await importDataKey(link.productKey), fromBase64(prf), id);
  await putPasskeyRecord(link, { id, box });
  await serial(async () => {
    const open = await requireUnlocked();
    const account = open.data.account;
    if (account?.productKey === link.productKey) await commit(open, { ...open.data, account: { ...account, passkey: credentialId } }, true);
  });
}

/** Stop new computers opening the account with this vault's passkey: its record goes, everywhere. */
async function removePasskey(): Promise<void> {
  const link = (await requireUnlocked()).data.account;
  if (!link?.passkey) return;
  await putPasskeyRecord(link, { id: passkeyRecordId(link.passkey), box: null });
  await serial(async () => {
    const open = await requireUnlocked();
    const account = open.data.account;
    if (account?.productKey === link.productKey) await commit(open, { ...open.data, account: { ...account, passkey: null } }, true);
  });
}

/**
 * One record, written over whatever revision the server holds of it: the
 * first try as the first revision, and on a conflict the one after the
 * server's. (Revisions are small integers there — a timestamp overflows them.)
 */
async function putPasskeyRecord(link: AccountLink, { id, box }: { id: string; box: SealedBox | null }): Promise<void> {
  let rev = 1;
  try {
    for (let tries = 0; tries < 3; tries++) {
      const record: RemoteRecord = { id, kind: PASSKEY_KIND, serverRev: 0, rev, deleted: box === null, updatedAt: Date.now(), deviceId: link.deviceId, box };
      const answer = await asSignedIn((token) => push(token, [record], link.serverRev));
      const newer = answer.conflicts.find((each) => each.id === id);
      if (!newer) return;
      rev = newer.rev + 1;
    }
  } catch (error) {
    accountFailure(error);
  }
  fail('error.accountFailed');
}

/**
 * On a computer being let into the account: the passkeys that hold
 * Passhold's key, from the account's records. Kept in session memory to open
 * with whichever the person touches.
 */
async function providerPasskeys(): Promise<{ credentialIds: string[] }> {
  await outcomeOf('existing');
  const found: Record<string, SealedBox> = {};
  try {
    let since = 0;
    for (let page = 0; page < 40; page++) {
      const answer = await asJoining((token) => pull(token, since));
      for (const record of answer.records) {
        if (record.kind !== PASSKEY_KIND) continue;
        if (record.deleted || !record.box) delete found[record.id];
        else found[record.id] = record.box;
      }
      since = answer.serverRev;
      if (!answer.hasMore) break;
    }
  } catch (error) {
    accountFailure(error);
  }
  await hold({ [PASSKEYS]: found });
  return { credentialIds: Object.keys(found).map(passkeyOfRecord).filter((id): id is string => id !== null) };
}

/** In with the passkey's answer — if the key it opens is Passhold's own on this account. */
async function joinWithPasskey(credentialId: string, prf: string): Promise<{ joined: boolean }> {
  const outcome = await outcomeOf('existing');
  const id = passkeyRecordId(credentialId);
  const box = ((await held<Record<string, SealedBox>>(PASSKEYS)) ?? {})[id];
  if (!box) fail('error.passkeyWrong');
  const key = await openWithPasskey(box, fromBase64(prf), id);
  const { product, state } = await checkedKey(key, outcome.accountId);
  const { tokens } = await outcomeOf('existing');
  const waiting = await held<Waiting>(PAIRING);
  if (waiting) await withSession(tokens, (token) => denyPairing(token, waiting.id)).catch(() => undefined);
  await drop(PROVIDER, PAIRING, PASSKEYS);
  return adopt({
    answer: { ...tokens, account: { id: outcome.accountId, email: outcome.email } },
    product,
    deviceId: outcome.deviceId,
    provider: outcome.provider,

    passwordless: outcome.method !== 'password',
    kit: kitAfter(null, state),
    passkey: credentialId,
  });
}

// --- Letting another browser in --------------------------------------------------------

/** A call as the account this vault is signed in to, keeping the tokens should they rotate. */
async function asSignedIn<T>(run: (accessToken: string) => Promise<T>): Promise<T> {
  const link = (await requireUnlocked()).data.account;
  if (!link?.tokens) fail('error.accountNone');
  const { value, tokens } = await withSession(link.tokens, run);
  if (tokens !== link.tokens) {
    await serial(async () => {
      const open = await requireUnlocked();
      const account = open.data.account;
      if (account?.productKey === link.productKey) await commit(open, { ...open.data, account: { ...account, tokens } }, true);
    });
  }
  return value;
}

/** The vault's link with Passhold's key, or a refusal. */
async function keyedLink(): Promise<AccountLink & { accountId: string; productKey: string }> {
  const link = (await requireUnlocked()).data.account;
  if (!link?.tokens || !link.accountId || !link.productKey) fail('error.accountNone');
  return link as AccountLink & { accountId: string; productKey: string };
}

/**
 * Browsers waiting to be let in, with the code this browser shows for each it
 * has started on — worked out over its own key, never the one the server
 * echoes back, so a swapped key makes the two codes differ.
 */
async function listPairings(): Promise<PairingView[]> {
  const link = (await current())?.data.account;
  if (!link?.tokens || !link.accountId) return [];
  const accountId = link.accountId;
  const pairings = await asSignedIn((token) => openPairings(token)).catch((error) => accountFailure(error));
  const mine = (await held<Approving>(APPROVING)) ?? {};
  return Promise.all(
    pairings.map(async (pairing) => {
      const started = mine[pairing.id];
      return {
        id: pairing.id,
        deviceName: pairing.deviceName,
        createdAt: pairing.createdAt,
        code: started ? await pairingCode(accountId, pairing.id, started.requesterKey, started.keys.publicKey) : null,
      };
    }),
  );
}

async function startLettingIn(id: string): Promise<{ code: string }> {
  try {
    const link = await keyedLink();
    const pairing = (await asSignedIn((token) => openPairings(token))).find((each) => each.id === id);
    if (!pairing) fail('error.pairingEnded');
    const keys = await newPairingKeys();
    await asSignedIn((token) => acceptPairing(token, id, keys.publicKey));
    const mine = (await held<Approving>(APPROVING)) ?? {};
    await hold({ [APPROVING]: { ...mine, [id]: { keys: await exportPairingKeys(keys), requesterKey: pairing.requesterKey } } });
    return { code: await pairingCode(link.accountId, id, pairing.requesterKey, keys.publicKey) };
  } catch (error) {
    accountFailure(error);
  }
}

/** The codes matched: Passhold's key goes to that browser, wrapped for its key alone. */
async function letIn(id: string): Promise<void> {
  const mine = (await held<Approving>(APPROVING)) ?? {};
  const started = mine[id];
  if (!started) fail('error.pairingEnded');
  try {
    const link = await keyedLink();
    const wrap = await wrapKeyForPairing(link.accountId, await importDataKey(link.productKey), await importPairingKeys(started.keys), id, started.requesterKey);
    await asSignedIn((token) => approvePairing(token, id, wrap));
  } catch (error) {
    accountFailure(error);
  } finally {
    const { [id]: _done, ...rest } = (await held<Approving>(APPROVING)) ?? {};
    await hold({ [APPROVING]: rest });
  }
}

async function keepOut(id: string): Promise<void> {
  const { [id]: _done, ...rest } = (await held<Approving>(APPROVING)) ?? {};
  await hold({ [APPROVING]: rest });
  await asSignedIn((token) => denyPairing(token, id)).catch(() => undefined);
}

/** Ask Keyrook to email a code to an address, to make an account there. */
async function startAccount(rawEmail: string): Promise<void> {
  const vault = (await loadVaultFile()) ? await requireUnlocked() : null;
  if (vault?.data.account?.tokens) fail('error.accountAlready');
  try {
    await registerStart(addressOf(rawEmail));
  } catch (error) {
    accountFailure(error);
  }
}

/**
 * Make a Keyrook account with its keys from the first moment: a root,
 * wrapped under a key the password derives and under a recovery key made now;
 * Passhold's own key, sealed to the root; the password itself only as
 * `authHash`. Any Keyrook product signs in to the account made here, each to
 * a key of its own.
 */
async function createAccount(rawEmail: string, code: string, password: string): Promise<SyncResult & { recoveryKey: string; joined: boolean }> {
  // On a computer with no vault yet, the account is made first and waits for the vault, as a sign-in does.
  const vault = (await loadVaultFile()) ? await requireUnlocked() : null;
  if (vault?.data.account?.tokens) fail('error.accountAlready');
  if (!strongEnoughForAccount(String(password))) fail('error.accountPasswordWeak');
  const email = addressOf(rawEmail);
  let recoveryKey: string;
  let joined: boolean;
  try {
    const deviceId = newId();
    const made = await createKeyrookAccount(SERVER, {
      email,
      code: String(code).replace(/\D/g, '').slice(0, 6),
      password: String(password),
      product: PRODUCT,
      deviceId,
      deviceName: deviceName(),
    });
    const session = connect(made.session);
    recoveryKey = made.recoveryKey;
    const kit = await kitMade(session.api, made.recoveryKey, true);
    ({ joined } = await adopt({ answer: answered(made.session, session.tokens()), product: made.productKey, deviceId, kit }));
  } catch (error) {
    accountFailure(error);
  }
  if (joined) return { removed: 0, skipped: 0, recoveryKey, joined };
  return { ...(await syncNow()), recoveryKey, joined };
}

/** A new recovery key drawn, shown, and not yet set: in session memory only, until the password sets it or it is let go. */
const KIT_DRAFT = 'ph.kitDraft';
/** Long enough to save a key every way and type it back. */
const KIT_DRAFT_TTL = 30 * 60_000;

/**
 * A new recovery key for the account, drawn here and shown before anything
 * changes: until its owner has saved it, typed it back and given the account
 * password, the server still has the old one. A key set first and saved after
 * left an account whose only sheet was one its owner never kept — the day the
 * page closed too soon. Held in session memory, never on disk, for this
 * account alone.
 */
async function draftKit(): Promise<{ recoveryKey: string }> {
  const link = await keyedLink();
  const recoveryKey = generateAccountRecoveryKey();
  await hold({ [KIT_DRAFT]: { key: recoveryKey, accountId: link.accountId, at: Date.now() } });
  return { recoveryKey };
}

/**
 * The drawn key set as the account's recovery key: the root, opened with the
 * account password, wrapped under it. The server retires the sheet before it,
 * everywhere, and tells the address; the key is kept sealed in the vault to
 * be shown again, already put away — it was typed back before this.
 */
async function newKit(password: string, step?: SecondStepAnswer): Promise<void> {
  try {
    const link = await keyedLink();
    const draft = await held<{ key: string; accountId: string; at: number }>(KIT_DRAFT);
    if (!draft || draft.accountId !== link.accountId || Date.now() - draft.at > KIT_DRAFT_TTL) fail('error.kitDraftGone');
    const productKey = await productKeyOf(link);
    if (!productKey) fail('error.accountNone');
    const { kdf } = await prelogin(link.email);
    const keys = await deriveAccountKeys(String(password), kdf);
    const { replaced, kit } = await withApi(async (api) => {
      // The root that will not open under it says the password was not the account's.
      const secondStep = step ? await ownerStep(step) : undefined;
      const replaced = await replaceRecoveryKey(api, { productKey, with: { keys }, newRecoveryKey: draft.key, ...(secondStep ? { secondStep } : {}) }).catch((error) => {
        if (error instanceof Error && error.name === 'DecryptionError') fail('error.accountPasswordWrong');
        throw error;
      });
      await tookCode(secondStep);
      return { replaced, kit: await kitMade(api, draft.key, false) };
    });
    await drop(KIT_DRAFT);
    await serial(async () => {
      const open = await requireUnlocked();
      const account = open.data.account;
      if (account?.productKey !== link.productKey) return;
      await commit(open, { ...open.data, account: { ...account, ...(await keyFields(replaced.productKey)), kit } }, true);
    });
  } catch (error) {
    accountFailure(error);
  }
}

/**
 * The account's recovery key, typed once. An account Passhold joined without
 * seeing its sheet — made on account.keyrook.com, or in another app — has a
 * key no Passhold has seen open its root: the person may have lost it and not
 * know, until the day the password is forgotten. Typed here, it must open the
 * root this vault is sealed to (@keyrook/account checks it is the root the
 * server reports), and Passhold's pin then says the sheet protects it, for
 * every Passhold browser of the account. The key is kept sealed in the vault,
 * to be shown again, as one made here is.
 */
async function checkKit(rawKey: string): Promise<void> {
  if (!isAccountKitKey(String(rawKey))) fail('error.accountKitShape');
  const recoveryKey = formatAccountKitKey(String(rawKey));
  try {
    const link = await keyedLink();
    const { product, kit } = await withApi(async (api) => {
      const state = await api.accountKeys();
      if (!state.root?.recoveryWrap) fail('error.accountKitNotThis');
      const root = await openRootBySheet(state.root.recoveryWrap, recoveryKey, link.accountId).catch(() => fail('error.accountKitNotThis'));
      // A root another app put in place since is met where Passhold signs in
      // again, never taken on a check: this vault's key is sealed to the one before.
      if (root.publicKey !== link.root) fail('error.accountRootChanged');
      const opened = await openProductKey(api, {
        accountId: link.accountId,
        product: PRODUCT,
        unlockWith: { root },
        pinned: { root: link.root },
        recoveryKeyTyped: true,
      });
      if (opened.status !== 'open' || (await exportDataKey(opened.productKey.key)) !== link.productKey) fail('error.accountRootChanged');
      // Noted by the server only so that nobody is reminded to look for the key
      // for a while; an older server, which cannot note it, changes nothing here.
      await api.recoveryChecked({ rootRecoveryAuthHash: await accountKitProof(recoveryKey) }).catch(() => undefined);
      return { product: opened.productKey, kit: await kitMade(api, recoveryKey, false) };
    });
    await serial(async () => {
      const open = await requireUnlocked();
      const account = open.data.account;
      if (account?.productKey !== link.productKey) return;
      await commit(open, { ...open.data, account: { ...account, ...(await keyFields(product)), kit } }, true);
    });
  } catch (error) {
    accountFailure(error);
  }
}

/**
 * A call through @keyrook/account's flows as the account this vault is signed
 * in to: the tokens it rotated to are kept, and a session the server ended
 * leaves the vault signed out — removed, where a proof says so.
 */
/**
 * `quiet`: for what runs on its own after a sync. A session the server
 * refused is left for the next sync to find, as it finds it now; only tokens
 * the server renewed are kept, since the ones before no longer work.
 */
async function withApi<T>(run: (api: HttpSyncAdapter) => Promise<T>, { quiet = false } = {}): Promise<T> {
  const link = (await requireUnlocked()).data.account;
  if (!link?.tokens) fail('error.accountNone');
  const session = connect(link.tokens);
  let refused: unknown = null;
  try {
    return await run(session.api);
  } catch (error) {
    refused = error;
    throw error;
  } finally {
    const tokens = session.tokens();
    if (tokens?.refreshToken !== link.tokens.refreshToken && (tokens || !quiet)) {
      await serial(async () => {
        const open = await requireUnlocked();
        const account = open.data.account;
        if (account?.productKey !== link.productKey) return;
        await commit(open, tokens ? { ...open.data, account: { ...account, tokens } } : await signedOutData(open.data, account, refused), true);
      });
    }
  }
}

// --- what the paid plans add -------------------------------------------------------------

/**
 * Passhold's key and a session, for the paid plans' flows; null with no
 * account. The plan is the server's to say: a feature it does not hold is
 * refused there, in a sentence placed in sentences.ts.
 */
async function withProductKey<T>(run: (api: HttpSyncAdapter, productKey: ProductKey) => Promise<T>, options: { quiet?: boolean } = {}): Promise<T | null> {
  const open = await requireUnlocked();
  const productKey = await productKeyOf(open.data.account);
  if (!productKey || !open.data.account?.tokens) return null;
  return withApi((api) => run(api, productKey), options).catch(accountFailure);
}

/**
 * The plan the server named, and whether it sells plans, kept on the account
 * link: what an edit keeps, and what the pages offer. `plan` undefined: none
 * named, the last one kept.
 */
async function keepPlan(accountId: string, plan: Plan | undefined, offered: boolean): Promise<void> {
  await serial(async () => {
    const open = await requireUnlocked();
    const account = open.data.account;
    if (!account || account.accountId !== accountId) return;
    const next = { ...account, ...(plan ? { plan } : {}), plansOffered: offered };
    if (next.plan === account.plan && account.plansOffered === offered) return;
    await commit(open, { ...open.data, account: next }, true);
  });
}

/** The link's codes as they were read, kept for the pages to be shown from (`loadLinked`): the secrets never leave this worker. */
async function keepLinked(accountId: string, codes: LinkedCodes): Promise<HeldCodes> {
  const held: HeldCodes = { accountId, status: codes.status, codes: codes.status === 'open' ? codes.codes : [] };
  await saveLinked(held);
  return held;
}

/** The codes the last sync read, for this vault's account; null with none signed in. */
async function linkedCodes(): Promise<HeldCodes | null> {
  const account = (await requireUnlocked()).data.account;
  if (!account?.tokens || !account.accountId) return null;
  const held = await loadLinked();
  return held?.accountId === account.accountId ? held : null;
}

/** A live login, in the vault's own or a shared vault. */
function anyLogin(data: VaultData, id: string): LoginItem {
  const login = [...data.items, ...data.families.flatMap((family) => family.vaults.flatMap((vault) => vault.items))].find((item) => item.id === id && item.deletedAt === null);
  if (!login) fail('error.itemNotFound');
  return login;
}

async function codesFor(login: LoginItem, codes: Pick<HeldCodes, 'status' | 'codes'> | null): Promise<CodesView> {
  if (!codes) return { status: 'none' };
  if (codes.status !== 'open') return { status: codes.status };
  const now = Date.now();
  return { status: 'open', codes: await Promise.all(codes.codes.filter((code) => codeFitsLogin(code.websites, login)).map((code) => showCode(code, now))) };
}

async function addCode(id: string, typed: string): Promise<CodesView> {
  const login = anyLogin((await requireUnlocked()).data, id);
  const setup = readTotpSetup(typed);
  if (!setup) fail('error.notSetupKey');
  // A code goes with a login by its site: one with no website would show nowhere.
  const websites = websitesOf(login);
  if (!websites.length) fail('error.codeNeedsSite');
  const named = { ...setup, issuer: setup.issuer || login.title, label: setup.label || login.username };
  const held = await withProductKey(async (api, productKey) => keepLinked(productKey.accountId, await addLinkedCode(api, productKey, named, websites)));
  return codesFor(login, held);
}

const HOUR = 3_600_000;
/** Where a Send's link opens: the page that reads Sends from this build's server. */
const SEND_PAGE = __KEYROOK_SEND_PAGE__;

/** A Send of typed text or of a login's copy. The link is the person's to keep: nothing here holds it after. */
async function makeSend(request: Extract<Request, { type: 'send/create' }>): Promise<SentView> {
  const vault = await requireUnlocked();
  // Before the proof is asked for and anything is sealed: a plan without Send
  // is told so here, not after its owner typed a password for nothing.
  if (!allows(vault.data, 'send')) fail('error.notOnPlan');
  checkSendTerms(request);
  // A login's password leaves the vault in it, readable by whoever has the link: proof first, as for an export.
  if (!request.proof) fail('error.wrongPassword');
  await prove(vault, request.proof);
  const body = { item: loginCopy(anyLogin(vault.data, String(request.itemId)), copyLabels(request.labels)) };
  const password = typeof request.password === 'string' && request.password ? request.password : undefined;
  const made = await withProductKey((api) => createSend(api, { body, opens: request.opens, lifetime: request.lifetime, ...(password ? { password } : {}), page: SEND_PAGE }));
  if (!made) fail('error.accountNone');
  return { url: made.url, opensLeft: made.send.opensLeft, expiresAt: made.send.expiresAt };
}

/** How often a link opens and how long it lasts, as the account allows: anything else is refused before the server is asked. */
function checkSendTerms(terms: { opens: unknown; lifetime: unknown }): void {
  if (!Number.isInteger(terms.opens) || (terms.opens as number) < 1 || (terms.opens as number) > 100) fail('error.sendFailed');
  if (!Number.isInteger(terms.lifetime) || (terms.lifetime as number) < HOUR || (terms.lifetime as number) > 30 * 24 * HOUR) fail('error.sendFailed');
}

/**
 * A Send of typed text and files, as the page that sealed them asks: the
 * plan first, then the terms and each file's sealed size, then the server,
 * on this vault's session. The page never holds the session; what it is
 * handed is where to put each file, for minutes.
 */
async function beginSend(request: Extract<Request, { type: 'send/begin' }>): Promise<SendCreated> {
  const vault = await requireUnlocked();
  // Asked before the server is: Passhold must not learn the plan from a refusal.
  if (!allows(vault.data, 'send')) fail('error.notOnPlan');
  const given = (request.send ?? {}) as Partial<SendRequest>;
  checkSendTerms({ opens: given.opens, lifetime: given.lifetime });
  const files = Array.isArray(given.files) ? given.files : [];
  if (files.length > SEND_FILES) fail('error.sendFailed');
  for (const file of files) {
    if (typeof file?.id !== 'string' || !FILE_ID.test(file.id) || !Number.isSafeInteger(file.size) || file.size <= 0 || file.size > MAX_SEALED_FILE) fail('error.fileTooLarge');
  }
  if (typeof given.id !== 'string' || typeof given.accessHash !== 'string' || typeof given.body !== 'object' || given.body === null) fail('error.sendFailed');
  const made = await withProductKey((api) =>
    api.createSend({ id: given.id!, body: given.body!, accessHash: given.accessHash!, opens: given.opens!, lifetime: given.lifetime!, files: files.map((file) => ({ id: file.id, size: file.size })) }),
  );
  if (!made) fail('error.accountNone');
  // The kit's store answers on the server's own address, which it names from its root.
  return { ...made, uploads: made.uploads.map((upload) => ({ ...upload, url: new URL(upload.url, SERVER.baseUrl).href })) };
}

/** The copy's field names, as the page that asked writes them in its language: words only, a line each. */
function copyLabels(labels: unknown): CopyLabels {
  const given = (labels ?? {}) as Partial<Record<keyof CopyLabels, unknown>>;
  const word = (value: unknown, fallback: string) => (typeof value === 'string' && value.trim() ? value.trim().slice(0, 60) : fallback);
  return { username: word(given.username, 'Username'), password: word(given.password, 'Password'), website: word(given.website, 'Website'), notes: word(given.notes, 'Notes') };
}

// --- files kept with items --------------------------------------------------------------

/**
 * An upload a page has begun, until its file is named in an item: which
 * item, and what room it took. Kept in session storage, so a worker stopped
 * midway still knows of it, and an upload whose page went away gives back its
 * room (`dropAbandonedUploads`).
 */
interface Upload {
  itemId: string;
  place: VaultPlace | null;
  /** Sealed, as the account was told. */
  size: number;
  at: number;
  done: boolean;
}

const uploads = sessionTable<Upload>('ph.uploads');
/** The store's address for an upload lasts minutes; one not named in an item an hour on never will be. */
const UPLOAD_ABANDONED = 60 * 60_000;
/** As the account names a file. */
const FILE_ID = /^[A-Za-z0-9_-]{1,64}$/;

/** A live item of a vault this account may change, and where it is. */
function itemForFiles(data: VaultData, itemId: string): { place: VaultPlace | null; item: LoginItem | WalletItem } {
  const place = placeOf(data, itemId);
  if (place === undefined) fail('error.itemNotFound');
  const items = place ? familyVault(data, place).vault : data;
  if (place && familyVault(data, place).vault.viewOnly) fail('error.viewOnly');
  const item = [...items.items, ...items.wallet].find((entry) => entry.id === itemId);
  if (!item || item.deletedAt !== null) fail('error.itemNotFound');
  return { place, item };
}

/** The account's word for a file it does not keep, or a server's refusal, in a key a page can say. */
function fileFailure(error: unknown): never {
  if (error instanceof SyncHttpError && error.code === 'payload_too_large') throw new PassholdError('fileTooLarge');
  return accountFailure(error);
}

async function beginUpload(itemId: string, id: string, size: number): Promise<{ url: string; expiresAt: number }> {
  const { place } = itemForFiles((await requireUnlocked()).data, itemId);
  if (typeof id !== 'string' || !FILE_ID.test(id)) fail('error.accountServerWrong');
  if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_SEALED_FILE) throw new PassholdError('fileTooLarge');
  const collection = fileCollection(place);
  const begun = await withApi((api) => api.beginFile({ id, size, ...(collection ?? {}) })).catch(fileFailure);
  await tableTurn(() => uploads.put(id, { itemId, place, size, at: Date.now(), done: false }));
  // The kit's store answers on the server's own address, which it names from its root.
  return { url: new URL(begun.url, SERVER.baseUrl).href, expiresAt: begun.expiresAt };
}

async function finishUpload(id: string): Promise<void> {
  const upload = await uploads.get(id);
  if (!upload) fail('error.fileFailed');
  await withApi((api) => api.finishFile(id)).catch(fileFailure);
  await tableTurn(async () => {
    const now = await uploads.get(id);
    if (now) await uploads.put(id, { ...now, done: true });
  });
}

/** An upload given up: its room back at once. */
async function cancelUpload(id: string): Promise<void> {
  if (!(await uploads.get(id))) return;
  try {
    await withApi((api) => deleteStoredFile(api, id), { quiet: true });
    await tableTurn(() => uploads.remove(id));
  } catch {
    // Locked or offline: kept, and deleted once its hour is up (`deleteLeftFiles`).
  }
}

/**
 * The file the store now holds, named in the item it was begun for, with the
 * key it was sealed under. An item that has gone meanwhile — trashed, moved,
 * deleted on another device — takes none, and the file goes from the account.
 */
async function attachUpload(request: Extract<Request, { type: 'files/attach' }>): Promise<void> {
  const upload = await uploads.get(request.id);
  if (!upload?.done) fail('error.fileFailed');
  // What the page sealed is what the account was told of: a file the item names is the size it says.
  if (!Number.isSafeInteger(request.size) || sealedFileSize(request.size) !== upload.size) fail('error.fileFailed');
  const file: Attachment = { id: request.id, key: request.key, name: request.name, type: request.fileType, size: request.size, addedAt: Date.now() };
  try {
    await change((data) => {
      const { place } = itemForFiles(data, upload.itemId);
      if (!samePlace(place, upload.place)) fail('error.itemNotFound');
      return place ? inFamilyVault(data, place, (vault) => attachFile(vault, upload.itemId, file)) : attachFile(data, upload.itemId, file);
    });
  } catch (error) {
    await cancelUpload(request.id);
    throw error;
  }
  await tableTurn(() => uploads.remove(request.id));
}

const samePlace = (a: VaultPlace | null, b: VaultPlace | null) => a?.orgId === b?.orgId && a?.vaultId === b?.vaultId;

/** Where to read a file an item names, and the key for that one file alone: a page fetches it and opens it, and holds no other file's key. */
async function openStoredFile(itemId: string, fileId: string): Promise<{ url: string; expiresAt: number; file: Attachment }> {
  const { data } = await requireUnlocked();
  const found = [data, ...data.families.flatMap((family) => family.vaults)].map((items) => findAttachment(items, itemId, fileId)).find(Boolean);
  if (!found) fail('error.fileGone');
  const address = await withApi((api) => api.fileAddress(fileId)).catch(fileFailure);
  return { url: new URL(address.url, SERVER.baseUrl).href, expiresAt: address.expiresAt, file: found.file };
}

/**
 * Deletes in the account the files no item names any more, and each upload
 * a page gave up on. One the account no longer has is as good as deleted;
 * one it cannot delete now waits for the next sync.
 */
async function deleteLeftFiles(api: HttpSyncAdapter): Promise<void> {
  const waiting = (await requireUnlocked()).data.account?.filesToDelete ?? [];
  const deleted: string[] = [];
  for (const id of waiting) {
    try {
      await deleteStoredFile(api, id);
      deleted.push(id);
    } catch (error) {
      // Not offered now is not gone: it waits until the account keeps files again.
      if (error instanceof SyncHttpError && error.code === 'not_offered') break;
    }
  }
  if (deleted.length) {
    await serial(async () => {
      const open = await requireUnlocked();
      await commit(open, filesDeleted(open.data, deleted), true);
    });
  }
  const now = Date.now();
  for (const [id, upload] of Object.entries(await uploads.read())) {
    if (now - upload.at < UPLOAD_ABANDONED) continue;
    await deleteStoredFile(api, id).catch(() => undefined);
    await tableTurn(() => uploads.remove(id));
  }
}

async function readGrantor(grantId: string): Promise<EmergencyRead> {
  const read = await withProductKey((api, productKey) => readEmergency(api, productKey, grantId));
  if (!read) fail('error.accountNone');
  if (read.status !== 'open') return read;
  // Every kind, read only: no passkey's private key reaches a page, and no
  // versions or files, which a page would ask of this account's own vault.
  const strip = <T extends { versions?: unknown; attachments?: unknown; detached?: unknown }>({ versions: _v, attachments: _a, detached: _d, ...rest }: T) => rest;
  return {
    status: 'open',
    items: read.data.items.filter((item) => item.deletedAt === null).map((item) => ({ ...strip(item), passkey: null })),
    wallet: read.data.wallet.filter((item) => item.deletedAt === null).map((item) => strip(item) as WalletItem),
  };
}

// --- Starting over, with nothing left but the email -------------------------------------

/** Ask Keyrook to email a code, to start the account over. Answered alike for any address. */
async function startOverCode(rawEmail: string): Promise<void> {
  try {
    await requestStartOverCode(SERVER.baseUrl, addressOf(rawEmail), SERVER.fetcher);
  } catch (error) {
    accountFailure(error);
  }
}

/**
 * Asks to start the account over with the emailed code (@keyrook/account's
 * `startAccountOver`): a new root, a new recovery key, Passhold's new key and
 * — on a password account — a new password, all made here and handed to the
 * server, which carries them out a week later unless a browser still signed
 * in cancels it. Whoever has taken the inbox gets the code too; the week is
 * the owner's to see it and say no (`cancelStartOver`).
 *
 * Until then the account is as it was and no session is given, so nothing in
 * this vault changes. The new recovery key is shown now: it is the one that
 * works after. From that day the account signs in with the new password, or
 * with Google or GitHub, as at any sign-in, and Passhold's new key is in its
 * box; what the account held before is kept, still sealed, for 90 days, and
 * the old password or the old recovery key brings it back.
 *
 * A server from before the week carries it out at
 * once and names no day: then it is done, and the account signs in now.
 *
 * The code is spent once, so the page asks for everything first: a password
 * where the account has one.
 */
async function startOverWith(
  rawEmail: string,
  code: string,
  password: string | undefined,
): Promise<{ recoveryKey: string; email: string; method: 'password' | 'provider'; executesAt: number | null }> {
  const email = addressOf(rawEmail);
  const vault = (await loadVaultFile()) ? await requireUnlocked() : null;
  const before = vault?.data.account ?? null;
  if (before && before.email !== email) fail('error.accountAlready');
  if (password !== undefined && !strongEnoughForAccount(String(password))) fail('error.accountPasswordWeak');
  try {
    const over = await startAccountOver(SERVER, {
      email,
      code: String(code).replace(/\D/g, '').slice(0, 6),
      ...(password !== undefined ? { newPassword: String(password) } : {}),
      product: PRODUCT,
      deviceId: newId(),
      deviceName: deviceName(),
    });
    // A sign-in with Google or GitHub, or a wait for another browser, was for the account as it is: over.
    await drop(PROVIDER, PAIRING);
    const executesAt = Number.isSafeInteger(over.executesAt) ? over.executesAt : null;
    return { recoveryKey: over.recoveryKey, email, method: password !== undefined ? 'password' : 'provider', executesAt };
  } catch (error) {
    if (error instanceof Error && error.message === 'Choose a new password for this account.') fail('error.startOverNeedsPassword');
    accountFailure(error);
  }
}

/**
 * Says no to a start over waiting. Whoever asked for it had the inbox; this
 * browser, still signed in, is how the account's owner stops them, so nothing
 * more is asked: cancelling leaves everything as it was, and the server tells
 * the address. One already gone — cancelled elsewhere, or carried out — is
 * nothing to cancel, and the next sync says which.
 */
async function cancelStartOver(): Promise<void> {
  const link = await keyedLink();
  try {
    await withApi((api) => api.cancelStartOver());
  } catch (error) {
    if (!(error instanceof SyncHttpError && error.status === 404)) accountFailure(error);
  }
  await serial(async () => {
    const open = await requireUnlocked();
    const account = open.data.account;
    if (account?.productKey === link.productKey) await commit(open, { ...open.data, account: { ...account, pendingStartOver: null } }, true);
  });
}

// --- What the account kept when it started over -------------------------------------

/** What the account kept for Passhold when it started over, as a page shows it. */
async function listArchives(): Promise<ArchiveView[]> {
  const link = (await current())?.data.account;
  if (!link?.tokens) return [];
  const kept = await asSignedIn(archives).catch((error) => accountFailure(error));
  return kept
    // Only what Passhold could ever open: its own key, sealed to the old root, and logins under it.
    .filter((archive) => archive.box && archive.root && archive.records > 0)
    .map((archive) => ({
      id: archive.id,
      archivedAt: archive.archivedAt,
      expiresAt: archive.expiresAt,
      logins: archive.records,
      byPassword: Boolean(archive.root?.underPassword && archive.kdf),
      bySheet: Boolean(archive.root?.underRecoveryKey),
    }));
}

/**
 * The logins an account kept, brought back into this vault: the old password
 * or the old recovery key opens Passhold's old key (@keyrook/account's
 * `openArchivedKey`), and that key the logins. Each is joined with the
 * vault's own copy, as a backup's are; nothing here is replaced.
 */
async function openKept(id: string, secret: string): Promise<{ added: number }> {
  try {
    const link = await keyedLink();
    const logins = await withApi(async (api) => {
      const archive = (await api.archives()).find((each) => each.id === id);
      if (!archive) fail('error.archiveGone');
      const typed = String(secret);
      const old = await openArchivedKey(api, {
        archive,
        accountId: link.accountId,
        product: PRODUCT,
        with: isAccountKitKey(typed) ? { recoveryKey: formatAccountKitKey(typed) } : { password: typed },
      });
      const key = await recordsKey(old);
      const found: { items: LoginItem[]; wallet: WalletItem[] } = { items: [], wallet: [] };
      for await (const page of readArchivedRecords(api, id)) {
        for (const record of page) {
          const login = await openLogin(key, record);
          if (login) found.items.push(login);
          const kept = await openWalletItem(key, record);
          if (kept) found.wallet.push(kept);
        }
      }
      // Recover items kept in archived agent vaults too (`openArchivedAgents` + `readArchivedAgentVault`).
      const archivedAgents = await readArchivedAgentsToVault(api, archive, link.accountId, old);
      found.items.push(...archivedAgents.items);
      found.wallet.push(...archivedAgents.wallet);
      return found;
    });
    const added = await serial(async () => {
      const open = await requireUnlocked();
      const merged = mergeBackup(open.data, { ...open.data, ...logins, neverSave: [] });
      await commit(open, merged.data);
      return merged.added;
    });
    scheduleSync(0);
    return { added };
  } catch (error) {
    if (error instanceof SyncHttpError && error.code === 'invalid_credentials') fail('error.archiveWrong');
    if (error instanceof Error && error.name === 'DecryptionError') fail('error.archiveWrong');
    accountFailure(error);
  }
}

/** Sign out here: the session ends on the server, and the logins stay on this device. */
/**
 * Signing out takes the vault off this computer, as Bitwarden's and
 * 1Password's do: whoever uses it next finds nothing of its owner's, and
 * signing in again brings everything back from the account. So it happens
 * only once the account holds all of it — a last sync first, then nothing
 * left that the server has not taken; otherwise nothing is removed, and the
 * person is told how many logins have not reached the account. A login
 * edited here and never sent would be gone for good.
 */
async function signOut(): Promise<void> {
  const link = (await requireUnlocked()).data.account;
  if (!link) return;
  if (link.tokens) {
    // A conflict brings a login back changed, to be sent again: a few rounds, not one.
    for (let round = 0; round < 3; round++) {
      const sent = await syncNow().then(
        () => true,
        () => false,
      );
      if (!sent || (await unsentHere()) === 0) break;
    }
  }
  const left = await unsentHere();
  if (left > 0) fail('error.signOutUnsent', { count: left });
  const after = (await requireUnlocked()).data.account;
  if (after?.tokens) await logout(after.tokens.refreshToken).catch(() => undefined);
  await chrome.alarms.clear(SYNC_ALARM);
  await removeVault();
}

/** How many logins here the account does not hold as they are: every one, for a link with no key of Passhold's. */
async function unsentHere(): Promise<number> {
  const open = await requireUnlocked();
  const link = open.data.account;
  if (!link?.productKey) return open.data.items.length;
  const plan = await planPush(open.data, link.known, await recordsKey(await importDataKey(link.productKey)), link.deviceId);
  let unsent = plan.records.length;
  for (const family of open.data.families) for (const vault of family.vaults) unsent += (await planFamilyPush(vault, vault.known)).records.length;
  return unsent;
}

/** The vault off this browser: the file, every way to open it, and what waited on it. */
function removeVault(): Promise<void> {
  return serial(async () => {
    await lock();
    await clearPin();
    await clearVaultFile();
    await tableTurn(async () => {
      await menus.write({});
      await pending.write({});
      await firstSteps.write({});
      await passkeyRequests.write({});
      await cardFrames.write({});
    });
    await drop(PASSKEY_SITES);
    broadcast();
  });
}

/**
 * One round with the server. The network is never waited on inside the
 * vault's queue — a slow server must not hold up a fill — so it goes: pull;
 * in the queue, bring what came in into the vault as it is then and plan what
 * goes out; push; in the queue again, settle what was accepted. A change made
 * while the server was answering is in the vault, and goes out next round.
 */
async function runSync(): Promise<SyncResult> {
  const start = await current();
  const link = start?.data.account;
  if (!link?.tokens || !link.productKey) return { removed: 0, skipped: 0 };
  const productKey = link.productKey;
  const key = await recordsKey(await importDataKey(productKey));
  // The key before a replacement, while records sealed under it may still come down.
  const previous = link.previousKey ? await recordsKey(await importDataKey(link.previousKey)) : null;
  let tokens: Tokens = link.tokens;
  const authed = async <T,>(run: (accessToken: string) => Promise<T>): Promise<T> => {
    const answer = await withSession(tokens, run);
    tokens = answer.tokens;
    return answer.value;
  };

  try {
    // The round is the core's, shared with the web vault (account/round.ts); the session and the queue are this worker's.
    const round = await syncOwnRecords(
      { pull: (since) => authed((token) => pull(token, since)), push: (records, since) => authed((token) => push(token, records, since)), accountKeys: () => authed(accountKeys) },
      syncTurn(productKey, () => tokens),
      { productKey: await importDataKey(productKey), records: key, previous },
      link,
    );
    if (!round) return { removed: 0, skipped: 0 };
    if (round.again) scheduleSync(1_000);
    // Then the families, in this same round: one session at a time. A family
    // that fails is tried again next round, and takes nothing of this one's.
    await syncFamilies().catch(() => undefined);
    return { removed: round.removed, skipped: round.skipped };
  } catch (error) {
    // Rotated before the failure, the new tokens are the only good ones; signed
    // out, there are none.
    const signedOut = error instanceof KeyrookError && (error.code === 'signed_out' || error.code === 'device_removed');
    if (signedOut || tokens !== link.tokens) {
      await serial(async () => {
        const open = await current();
        const account = open?.data.account?.productKey === productKey ? open.data.account : null;
        if (!open || !account) return;
        await commit(open, signedOut ? await signedOutData(open.data, account, error) : { ...open.data, account: { ...account, tokens } }, true);
      });
    }
    accountFailure(error);
  }
}

/**
 * This worker's turn for a round (`VaultTurn`): the vault's queue, with the
 * read inside it, while the vault is open and still signed in with the
 * Passhold key the round began with. `tokens`: the session's, as they are
 * now, kept with what the step hands back.
 */
function syncTurn(productKey: string, tokens?: () => Tokens): VaultTurn {
  return <T,>(step: (data: VaultData) => Promise<{ data?: VaultData; value: T }>) =>
    serial(async (): Promise<T | null> => {
      const open = await requireUnlocked();
      if (open.data.account?.productKey !== productKey) return null;
      const { data, value } = await step(open.data);
      if (data) await commit(open, tokens && data.account ? { ...data, account: { ...data.account, tokens: tokens() } } : data, true);
      return value;
    });
}

// --- families --------------------------------------------------------------------------

/**
 * Each family of the account, after the vault's own records and in the same
 * round (`syncNow`), so one session at a time: the core's round
 * (account/round.ts), on this vault's session.
 */
async function syncFamilies(): Promise<void> {
  const link = (await current())?.data.account;
  const productKey = await productKeyOf(link);
  if (!link?.tokens || !link.productKey || !productKey) return;
  const previousKey = link.previousKey ? await importDataKey(link.previousKey) : undefined;
  const again = await withApi((api) => syncFamilyRound(api, syncTurn(link.productKey!), { productKey, previousKey, deviceId: link.deviceId }));
  if (again) scheduleSync(1_000);
}

const familyLinkOf = (data: VaultData, orgId: string) => data.families.find((family) => family.orgId === orgId);

/** The family as this vault holds it, with Passhold's key to open it: for what a person asks of it. */
async function heldFamily(orgId: string): Promise<{ held: FamilyLink; productKey: ProductKey; previousKey: CryptoKey | undefined }> {
  const open = await requireUnlocked();
  const held = familyLinkOf(open.data, orgId);
  const productKey = await productKeyOf(open.data.account);
  if (!productKey) fail('error.accountNone');
  if (!held) fail('error.familyGone');
  const previousKey = open.data.account?.previousKey ? await importDataKey(open.data.account.previousKey) : undefined;
  return { held, productKey, previousKey };
}

/**
 * The code to compare with someone in a family: the one the flows gave with
 * the family's key from them, or one for someone whose key changed.
 */
async function familyCode(orgId: string, accountId: string): Promise<string> {
  const { held, productKey, previousKey } = await heldFamily(orgId);
  if (held.state.kind === 'compare' && held.state.accountId === accountId) return held.state.code;
  return withApi(async (api) => {
    const opened = await openFamily(api, { productKey, orgId, pinned: held.pin, previousKey });
    if (opened.status === 'compare' && opened.accountId === accountId) return opened.code;
    if (opened.status !== 'open') fail('error.familyNotOpen');
    return familyCompareCode(opened.family, accountId);
  });
}

/**
 * The two codes matched, as the person saw: that key is pinned as theirs.
 * Only a key the flows named here — with the family's key, or as changed — is
 * trusted, never one a page names.
 */
async function trustMember(orgId: string, accountId: string, memberKey: string): Promise<void> {
  const { held, productKey, previousKey } = await heldFamily(orgId);
  const named =
    (held.state.kind === 'compare' && held.state.accountId === accountId && held.state.memberKey === memberKey) ||
    held.keyChanged.some((change) => change.accountId === accountId && change.memberKey === memberKey);
  if (!named) fail('error.familyGone');
  const pin = await trustFamilyMember(productKey, { orgId, pinned: held.pin, previousKey, accountId, memberKey });
  await serial(async () => {
    const open = await requireUnlocked();
    const now = familyLinkOf(open.data, orgId);
    if (!now || now.pin !== held.pin) return;
    const next: FamilyLink = { ...now, pin, keyChanged: now.keyChanged.filter((change) => change.accountId !== accountId) };
    await commit(open, { ...open.data, families: open.data.families.map((family) => (family.orgId === orgId ? next : family)) }, true);
  });
  await syncNow().catch(() => undefined);
}

/**
 * The account's password, once, for a family this browser holds no key to
 * yet: it opens the root here, which takes the member key under Passhold's
 * own, and is not asked again. Nothing of it is sent.
 */
async function unlockFamily(orgId: string, password: string): Promise<void> {
  const { held, productKey, previousKey } = await heldFamily(orgId);
  const email = (await requireUnlocked()).data.account?.email;
  if (!email) fail('error.accountNone');
  try {
    const { kdf } = await prelogin(email);
    const keys = await deriveAccountKeys(String(password), kdf);
    await withApi((api) => openFamily(api, { productKey, orgId, pinned: held.pin, previousKey, unlockWith: { keys } }));
  } catch (error) {
    accountFailure(error);
  }
  await syncNow().catch(() => undefined);
}

// --- requests from Passhold's own pages ------------------------------------------------

/** What was typed, as the file's secret is written: a recovery key in its one form. */
function typed(file: Pick<VaultFile, 'secret'>, input: string): string {
  return secretOf(file) === 'recoveryKey' ? (normaliseRecoveryKey(input) ?? input) : input;
}

function failWrongSecret(file: Pick<VaultFile, 'secret'>): never {
  fail(secretOf(file) === 'recoveryKey' ? 'error.wrongRecoveryKey' : 'error.wrongPassword');
}

/**
 * That the person asking is the vault's owner, beyond holding an open vault:
 * the file's own secret, or this device's answer — which opens the device's
 * copy of the key only for the one who satisfies the authenticator — or a
 * security key's, which opens that key's copy only for whoever holds the key
 * and knows its PIN.
 */
async function prove(vault: UnlockedVault, proof: Proof): Promise<void> {
  if (typeof proof !== 'object' || proof === null) failWrongSecret(vault.file);
  if ('prf' in proof && typeof proof.prf === 'string') {
    await openWithAnswer(vault.file.id, proof.prf, 'key' in proof ? proof.key : undefined);
    return;
  }
  const secret = 'secret' in proof && typeof proof.secret === 'string' ? proof.secret : '';
  if (!(await verifyMasterPassword(vault.file, typed(vault.file, secret)))) failWrongSecret(vault.file);
}

/**
 * The data key, from the device's answer or, with `key`, from that security
 * key's: each opens only its own copy, so an answer said to be another's
 * opens nothing.
 */
async function openWithAnswer(vaultId: string, prf: string, key: string | undefined): Promise<CryptoKey> {
  if (key === undefined) {
    const unlock = await loadDevice();
    if (!unlock) fail('error.deviceGone');
    return openWithDevice(unlock, fromBase64(prf), vaultId);
  }
  const unlock = (await loadKeys()).find((each) => each.credentialId === key);
  if (!unlock) fail('error.keyGone');
  try {
    return await openWithDevice(unlock, fromBase64(prf), vaultId);
  } catch (error) {
    if (isPassholdError(error) && error.code === 'deviceKeyWrong') fail('error.keyWrong');
    throw error;
  }
}

/** What a page needs to ask a security key again, and to tell keys apart: never the wrapped key. */
function keyOf(unlock: KeyUnlock): SecurityKey {
  return { credentialId: unlock.credentialId, salt: unlock.salt, addedAt: unlock.addedAt };
}

/** A credential as a page described it, kept to the size such a thing has. */
function deviceCredential(credential: DeviceCredential): DeviceCredential {
  return credentialOf({ credentialId: String(credential.credentialId).slice(0, 1024), salt: String(credential.salt).slice(0, 64), via: credential.via });
}

/** What a page needs to ask the authenticator again: never the wrapped key. */
function credentialOf(unlock: DeviceCredential): DeviceCredential {
  return { credentialId: unlock.credentialId, salt: unlock.salt, ...(unlock.via === 'largeBlob' ? { via: 'largeBlob' as const } : {}) };
}

async function handle(request: Request, sender: chrome.runtime.MessageSender): Promise<unknown> {
  switch (request.type) {
    case 'activity':
      // What keeps the vault from locking while idle: a person's hand in one
      // of Passhold's pages (ui/boot.tsx), never a request a page makes by
      // itself — a list, prompt or passkey frame a web page put up asks what
      // to show the moment it loads, and could otherwise hold the vault open
      // for as long as its owner is away (e2e/smart.spec.ts).
      await markActive();
      return;

    case 'vault/status':
      return status();

    case 'vault/create': {
      const status = await serial(async () => {
        if (await loadVaultFile()) fail('error.vaultExists');
        const link = request.join ? await joined() : null;
        const created = await createVault(request.password);
        // Signing in, the password is the account's own — one password for both — or, for an account with none, a code for this computer.
        const named = link && request.passwordIs ? { ...created, file: { ...created.file, passwordIs: request.passwordIs } } : created;
        const vault = await withLink(named, link);
        // A device or key copy left from a vault removed before belongs to nothing now.
        await clearUnlocks();
        await saveVaultFile(vault.file);
        return opened(vault);
      });
      if (request.join) await settleJoin();
      return status;
    }

    case 'vault/createWithDevice': {
      const made = await serial(async () => {
        if (await loadVaultFile()) fail('error.vaultExists');
        const link = request.join ? await joined() : null;
        // The secret the file is sealed under is drawn here, and kept only
        // sealed inside the vault, to be shown again with proof: the device
        // opens the vault every day, and this key the day the device cannot.
        const recoveryKey = generateRecoveryKey();
        const created = await createVault(recoveryKey, undefined, 'recoveryKey');
        const data = { ...withRecoveryKey(created.data, recoveryKey), account: link && { ...link, passkey: link.passkey ?? null } };
        const file = await sealVault(created.file, created.dataKey, data);
        // Keys left from a vault removed before open nothing here.
        await clearUnlocks();
        await saveDevice(await sealWithDevice(created.dataKey, fromBase64(request.prf), file.id, deviceCredential(request.credential)));
        await saveVaultFile(file);
        return { status: await opened({ file, data, dataKey: created.dataKey }), recoveryKey };
      });
      if (request.join) await settleJoin();
      // The same passkey, asked for the account's answer too: the account key
      // goes up under it, for a new computer to open with a touch.
      if (request.accountPrf) await enrollPasskey(request.credential.credentialId, request.accountPrf).catch(() => undefined);
      return made;
    }

    case 'passkey/enroll':
      return enrollPasskey(request.credentialId, request.prf);
    case 'passkey/remove':
      return removePasskey();
    case 'provider/passkeys':
      return providerPasskeys();
    case 'provider/withPasskey':
      return joinWithPasskey(request.credentialId, request.prf);

    case 'account/join':
      return join(request.email, request.password, request.makeRoot, request.secondStep);

    case 'provider/start':
      return startProvider(request.provider);
    case 'provider/answer':
      return typeof request.answer === 'string' && request.answer.length <= 4096 ? finishProvider(new URLSearchParams(request.answer)) : false;
    case 'provider/view':
      return providerView();
    case 'provider/create':
      return createProviderAccount();
    case 'provider/ask':
      return askToJoin();
    case 'provider/poll':
      return pollJoin();
    case 'provider/withKit':
      return joinWithKit(request.recoveryKey);
    case 'provider/withPassword':
      return providerWithPassword(request.password);
    case 'provider/secondStep':
      return providerSecondStep(request.secondStep);
    case 'provider/makeRoot':
      return confirmForRoot(request.recoveryKey);
    case 'provider/rootStep':
      return providerRootStep(request.secondStep);
    case 'provider/cancel':
      return cancelProvider();
    case 'pairing/list':
      return listPairings();
    case 'pairing/start':
      return startLettingIn(request.id);
    case 'pairing/approve':
      return letIn(request.id);
    case 'pairing/deny':
      return keepOut(request.id);
    case 'account/joinKitSaved': {
      // The key of an account made before its vault was: put away before there was a vault to say so in.
      const waiting = await held<{ link: AccountLink; at: number }>(JOIN);
      if (waiting?.link.kit) await hold({ [JOIN]: { ...waiting, link: { ...waiting.link, kit: { ...waiting.link.kit, pending: false } } } });
      return;
    }

    case 'account/joinCancel': {
      const { [JOIN]: held } = (await chrome.storage.session.get(JOIN)) as { [JOIN]?: { link: AccountLink } };
      await chrome.storage.session.remove(JOIN);
      // Best effort: a session nobody will use is better ended than left a month.
      if (held?.link.tokens) await logout(held.link.tokens.refreshToken).catch(() => undefined);
      return;
    }

    case 'vault/unlock':
      return serial(async () => {
        const file = await loadVaultFile();
        if (!file) fail('error.noVault');
        try {
          return opened(await unlockVault(file, typed(file, request.password)));
        } catch (error) {
          if (isPassholdError(error) && error.code === 'wrongPassword') failWrongSecret(file);
          throw error;
        }
      });

    case 'vault/unlockPin':
      return serial(async () => {
        const file = await loadVaultFile();
        if (!file) fail('error.noVault');
        const envelope = await loadPin();
        if (!envelope) fail('error.pinUnavailable');
        let dataKey: CryptoKey;
        try {
          dataKey = await openWithPin(envelope, request.pin);
        } catch (error) {
          if (!isPassholdError(error) || error.code !== 'wrongPin') throw error;
          // The tries are counted here, in the one place that holds the
          // envelope: no page can reset them, and the last wrong one takes
          // the envelope away, leaving the master password.
          const triesLeft = envelope.triesLeft - 1;
          if (triesLeft <= 0) {
            await clearPin();
            broadcast();
            fail('error.pinLockedOut');
          }
          await savePin({ ...envelope, triesLeft });
          fail('error.wrongPinLeft', { count: triesLeft });
        }
        await savePin({ ...envelope, triesLeft: PIN_TRIES });
        return opened({ file, dataKey, data: await readPayload(file, dataKey) }, 'keep');
      });

    case 'vault/setPin':
      return serial(async () => {
        const vault = await requireUnlocked();
        // A PIN is another way in: whoever is at an unlocked browser holds the
        // data key, but not necessarily the secret or the fingerprint.
        await prove(vault, request.proof);
        const data = setPin(vault.data, request.pin);
        // The PIN's copy of the key first: the change tells every page, and a
        // page that then locks must find the PIN ready.
        if (data.pin) await savePin(await sealWithPin(vault.dataKey, data.pin));
        else await clearPin();
        await commit(vault, data);
      });

    case 'vault/setDevice':
      return serial(async () => {
        const vault = await requireUnlocked();
        // A new way in, so it takes proof, as the PIN does.
        await prove(vault, request.proof);
        await saveDevice(await sealWithDevice(vault.dataKey, fromBase64(request.prf), vault.file.id, deviceCredential(request.credential)));
        broadcast();
      });

    case 'vault/addKey':
      return serial(async () => {
        const vault = await requireUnlocked();
        // A new way in, so it takes proof, as the device does.
        await prove(vault, request.proof);
        // Worked out from the key every time (PRF): a key keeps no bytes of Passhold's.
        const { credentialId, salt } = deviceCredential(request.credential);
        const sealed = await sealWithDevice(vault.dataKey, fromBase64(request.prf), vault.file.id, { credentialId, salt });
        // The same key added again replaces its copy; it is still one key.
        const others = (await loadKeys()).filter((each) => each.credentialId !== credentialId);
        await saveKeys([...others, { ...sealed, addedAt: Date.now() }]);
        broadcast();
      });

    case 'vault/removeKey':
      // One way in fewer takes nothing from anyone: a key is never the only way in.
      await serial(async () => saveKeys((await loadKeys()).filter((each) => each.credentialId !== request.credentialId)));
      broadcast();
      return;

    case 'vault/checkProof':
      await prove(await requireUnlocked(), request.proof);
      return;

    case 'vault/setSecret':
      return serial(async () => {
        const vault = await requireUnlocked();
        await prove(vault, request.proof);
        let recoveryKey: string | null = null;
        let file: VaultFile;
        if (request.next.kind === 'recoveryKey') {
          // With no password to type, the vault opens with the device every
          // day: there must be one.
          if (!(await loadDevice())) fail('error.deviceNeeded');
          recoveryKey = generateRecoveryKey();
          file = await rewrapVault(vault.file, vault.dataKey, recoveryKey, 'recoveryKey');
        } else {
          file = await rewrapVault(vault.file, vault.dataKey, request.next.password, 'password');
        }
        await commit({ ...vault, file }, withRecoveryKey(vault.data, recoveryKey));
        return { recoveryKey };
      });

    case 'vault/showRecoveryKey': {
      const vault = await requireUnlocked();
      // It opens the vault's file and every backup: as much as the master
      // password would, so it is shown only to someone who proves they are the owner.
      await prove(vault, request.proof);
      if (!vault.data.recoveryKey) fail('error.noRecoveryKey');
      return { recoveryKey: vault.data.recoveryKey };
    }

    case 'vault/removeDevice': {
      // One way in fewer takes nothing from anyone, so it asks for nothing —
      // unless it is the way in, for a vault with no password to type.
      const file = await loadVaultFile();
      if (file && secretOf(file) === 'recoveryKey') fail('error.deviceNeeded');
      await clearDevice();
      broadcast();
      return;
    }

    case 'vault/unlockDevice':
      return serial(async () => {
        const file = await loadVaultFile();
        if (!file) fail('error.noVault');
        const dataKey = await openWithAnswer(file.id, request.prf, request.key);
        return opened({ file, dataKey, data: await readPayload(file, dataKey) });
      });

    case 'account/signIn':
      return signIn(request.email, request.password, request.makeRoot, request.secondStep);

    case 'account/secondStepView':
      return secondStepView();

    case 'account/secondStepPasskey':
      return secondStepPasskey();

    case 'account/start':
      return startAccount(request.email);

    case 'account/create':
      return createAccount(request.email, request.code, request.password);

    case 'account/signOut':
      return signOut().then(() => void setAgentsBadge(0));

    case 'account/draftKit':
      return draftKit();

    case 'account/newKit':
      return newKit(request.password, request.secondStep);

    case 'account/dropKitDraft':
      await drop(KIT_DRAFT);
      return;

    case 'account/cancelRoot':
      return endRootWait();

    case 'account/recoverCode':
      return recoverCode(request.email);

    case 'account/recover':
      return recover(request.email, request.code, request.recoveryKey, request.password);

    case 'account/startOverCode':
      return startOverCode(request.email);

    case 'account/startOver':
      return startOverWith(request.email, request.code, request.password);

    case 'account/cancelStartOver':
      return cancelStartOver();
    case 'account/closeRemoval':
      return closeRemoval();

    case 'account/archives':
      return listArchives();

    case 'account/openArchive':
      return openKept(request.id, request.secret);

    case 'account/passkeyChallenge':
      return passkeyChallenge();

    case 'account/joinWithPasskey':
      return joinWithAccountPasskey(request.touch);

    case 'account/signInWithPasskey':
      return signInWithAccountPasskey(request.touch);

    case 'account/checkKit':
      return checkKit(request.recoveryKey);


    case 'account/showKit': {
      const vault = await requireUnlocked();
      // As the vault's own recovery key: as much as a password, so only to its owner.
      await prove(vault, request.proof);
      const key = vault.data.account?.kit?.key;
      if (!key) fail('error.accountNoKit');
      return { recoveryKey: key };
    }

    case 'account/sync':
      if (!(await current())?.data.account) fail('error.accountNone');
      return syncNow();

    case 'family/compareCode':
      return { code: await familyCode(request.orgId, request.accountId) };

    case 'codes/forLogin':
      return codesFor(anyLogin((await requireUnlocked()).data, request.id), await linkedCodes());
    case 'codes/add':
      return addCode(request.id, String(request.setup ?? ''));
    case 'send/create':
      return makeSend(request);
    case 'send/begin':
      return beginSend(request);
    case 'send/finish': {
      const finished = await withProductKey((api) => api.finishSend(String(request.id)));
      if (!finished) fail('error.accountNone');
      return finished;
    }
    case 'send/cancel':
      await withProductKey((api) => api.deleteSend(String(request.id)));
      return;
    case 'checkup/breach': {
      const { data } = await requireUnlocked();
      // The plan first: on one without it, not a character of a hash goes to
      // learn so from the server's refusal, whatever a page asks.
      if (!allows(data, 'breach')) fail('error.notOnPlan');
      const exposed = await withProductKey((api) => exposedLogins(api, data));
      if (!exposed) fail('error.accountNone');
      return { exposed };
    }
    case 'emergency/view': {
      // As the last sync saw it: Settings opening asks the server nothing.
      const account = (await requireUnlocked()).data.account;
      const held = await loadEmergency();
      return account?.tokens && held?.accountId === account.accountId ? held.view : { status: 'none' };
    }
    case 'emergency/trust':
      await withProductKey(async (api, productKey) => {
        await trustEmergency(api, productKey, request.grantId);
        // Compared: Passhold's key goes to them now if this account named them, and Settings shows where things stand.
        await handOverEmergency(api, productKey);
        await saveEmergency({ accountId: productKey.accountId, view: await emergencyView(api, productKey) });
      });
      return;
    case 'emergency/read':
      return readGrantor(request.grantId);

    case 'family/trust':
      return trustMember(request.orgId, request.accountId, request.memberKey);

    case 'family/unlock':
      return unlockFamily(request.orgId, request.password);

    case 'vault/lock':
      return lock();

    case 'vault/mutate':
      // Files no item names any more after it — a trash emptied, a file taken off — are deleted in the account after the next sync.
      await change((data) => forgetFiles(data, applyMutation(data, request.mutation)));
      return;

    case 'files/begin':
      return beginUpload(request.itemId, request.id, request.size);

    case 'files/finish':
      return finishUpload(request.id);

    case 'files/cancel':
      return cancelUpload(request.id);

    case 'files/attach':
      return attachUpload(request);

    case 'files/open':
      return openStoredFile(request.itemId, request.fileId);

    case 'vault/exportCsv': {
      const vault = await requireUnlocked();
      // Plain text leaves the vault here, so being unlocked is not enough:
      // whoever is at an unlocked browser has to prove they are its owner too.
      await prove(vault, request.proof);
      return { csv: request.kind === 'apikey' ? exportApiKeysCsv(vault.data.wallet) : exportCsv(vault.data.items) };
    }

    case 'vault/backup':
      return serial(async () => {
        const vault = await requireUnlocked();
        await prove(vault, request.proof);
        const next = await commit(vault, markBackedUp(vault.data));
        // A backup is for getting back in, not for being signed in: the
        // account's key and session stay with this browser.
        const file = await sealVault(next.file, next.dataKey, { ...next.data, account: null });
        return { backup: backupText(file) };
      });

    case 'vault/restore':
      return serial(async (): Promise<RestoreResult> => {
        // Asked before the backup's KDF runs, so a locked vault answers at once.
        const vault = (await loadVaultFile()) ? await requireUnlocked() : null;
        let backup: UnlockedVault;
        try {
          backup = await openBackup(request.backup, typed(parseBackup(request.backup), request.password));
        } catch (error) {
          if (isPassholdError(error) && error.code === 'backupWrongPassword' && secretOf(parseBackup(request.backup)) === 'recoveryKey') {
            fail('error.backupWrongRecoveryKey');
          }
          throw error;
        }
        if (!vault) {
          // Nothing here to lose: the backup becomes the vault, sealed afresh
          // from what was checked rather than stored as the file brought it.
          // A device or key copy left here was for another vault, and opens nothing.
          const file = await sealVault(backup.file, backup.dataKey, { ...backup.data, account: null });
          await clearUnlocks();
          await saveVaultFile(file);
          await opened({ ...backup, file });
          return { mode: 'new', added: backup.data.items.length + backup.data.wallet.length, updated: 0 };
        }
        const { data, added, updated } = mergeBackup(vault.data, backup.data);
        await commit(vault, data);
        return { mode: 'merged', added, updated };
      });

    case 'vault/reset':
      return removeVault();

    case 'page/info': {
      const tab = await activeTab();
      const here = tab?.id !== undefined ? await topFrame(tab.id) : null;
      const vault = await current();
      const info: PageInfo = {
        site: here ? siteName(here.site) : null,
        url: here?.url ?? null,
        loginIds: here && vault ? loginsForSite(everyItem(vault.data), here.site).map(({ item }) => item.id) : [],
      };
      return info;
    }

    case 'page/fill': {
      const vault = await requireUnlocked();
      const item = itemOrFail(everyItem(vault.data), request.id);
      const tab = await activeTab();
      const here = tab?.id !== undefined ? await topFrame(tab.id) : null;
      if (!tab?.id || !here || !matchUrls(item.urls, here.site)) fail('error.notOnPage');
      // To the document that checked in: one the tab navigated to since gets nothing.
      await deliverFill(tab.id, { documentId: here.documentId }, {
        type: 'ph/fill',
        origin: here.site.origin,
        username: item.username,
        password: item.password,
        field: 'any',
      });
      await change((data) => whereItemIs(data, item.id, (items) => markUsed(items, item.id)));
      countFill();
      return;
    }

    case 'rating/view':
      return { ask: shouldAsk(await loadRating(), Date.now()) };

    case 'rating/answer':
      await updateRating((state) => (request.answer === 'rated' ? ratingAnswered(state) : snoozeRating(state, Date.now())));
      return;

    case 'menu/view':
      return menuView(request.token, sender);

    case 'menu/fill': {
      const { session, site } = await menuFor(request.token, sender);
      const vault = await requireUnlocked();
      if (session.field === 'card' || session.field === 'address') {
        const chosen = walletItemOrFail(everyItem(vault.data), request.id, session.field);
        await fillWallet(session, site, chosen);
        await closeMenu(session, request.token);
        await change((data) => whereItemIs(data, chosen.id, (items) => markWalletUsed(items, chosen.id)));
        countFill();
        return;
      }
      const item = itemOrFail(everyItem(vault.data), request.id);
      // The list only showed logins for this site; checked again, because the
      // page that asked is whatever the token says, not what the list showed.
      if (!matchUrls(item.urls, site)) fail('error.notOnPage');
      await deliverFill(session.tabId, { documentId: session.documentId }, {
        type: 'ph/fill',
        origin: site.origin,
        username: item.username,
        password: item.password,
        field: session.field,
      });
      await closeMenu(session, request.token);
      await change((data) => whereItemIs(data, item.id, (items) => markUsed(items, item.id)));
      countFill();
      return;
    }

    case 'menu/suggest': {
      const { session, site } = await menuFor(request.token, sender);
      await deliverFill(session.tabId, { documentId: session.documentId }, {
        type: 'ph/fill',
        origin: site.origin,
        username: null,
        password: request.password,
        field: 'new',
      });
      await closeMenu(session, request.token);
      return;
    }

    case 'menu/unlock':
      await menuFor(request.token, sender);
      return { opened: await openToolbarPopup() };

    case 'menu/passkey': {
      const { session } = await menuFor(request.token, sender);
      const vault = await requireUnlocked();
      const waiting = await conditionalFor(session.documentId);
      if (!waiting) fail('error.expired');
      const item = chosenPasskey(vault.data, waiting, request.id);
      const entry = await takePasskeyRequest(waiting.token);
      await answerWith(entry, () => signWithPasskey(entry, item));
      await closeMenu(session, request.token);
      await change((data) => whereItemIs(data, item.id, (items) => markUsed(items, item.id)));
      return;
    }

    case 'passkey/view':
      return passkeyView(request.token, sender);

    case 'passkey/answer':
      return answerPasskey(request.token, request.answer, request.id, sender);

    case 'passkey/unlock':
      await passkeyRequestFor(request.token, sender);
      return { opened: await openToolbarPopup() };

    case 'passkey/size': {
      const entry = await passkeyRequestFor(request.token, sender);
      const height = Math.round(Math.min(Math.max(Number(request.height) || 0, 80), 480));
      await chrome.tabs
        .sendMessage<ToContent>(entry.tabId, { type: 'ph/passkeySize', id: entry.id, height }, { documentId: entry.documentId })
        .catch(() => undefined);
      return;
    }

    case 'prompt/size': {
      const entry = (await livePending()).find((candidate) => candidate.token === request.token);
      if (!entry || sender.tab?.id !== entry.tabId) return;
      const height = Math.round(Math.min(Math.max(Number(request.height) || 0, 60), 320));
      await chrome.tabs.sendMessage<ToContent>(entry.tabId, { type: 'ph/promptSize', height }, { frameId: 0 }).catch(() => undefined);
      return;
    }

    case 'prompt/view': {
      const entry = (await livePending()).find((candidate) => candidate.token === request.token);
      if (!entry || sender.tab?.id !== entry.tabId) return null;
      return pendingView(entry);
    }

    case 'prompt/answer': {
      const entry = (await livePending()).find((candidate) => candidate.token === request.token);
      if (!entry || sender.tab?.id !== entry.tabId) fail('error.expired');
      const outcome = await answerPending(entry, request.answer);
      if (outcome !== 'locked') setTimeout(() => void closePrompt(entry.tabId), outcome === 'saved' ? 1500 : 0);
      return { outcome };
    }

    case 'pending/view': {
      const tab = await activeTab();
      // Only one that went through: the popup never asks to keep a password the site refused.
      const entry = (await livePending()).filter((candidate) => candidate.tabId === tab?.id).at(-1);
      return entry?.sure ? pendingView(entry) : null;
    }

    case 'pending/answer': {
      const entry = (await livePending()).find((candidate) => candidate.id === request.id);
      if (!entry) fail('error.expired');
      await answerPending(entry, request.answer);
      await closePrompt(entry.tabId);
      return;
    }

    case 'clipboard/copied': {
      const { policy } = await loadSession();
      if (policy?.clearClipboardSeconds) await clearClipboardLater(policy.clearClipboardSeconds * 1000);
      return;
    }

    case 'agents/view':
      return withAgents((ctx) => agentsView(ctx)).then(noteAgentsOverview);
    case 'agents/pending':
      return withAgents((ctx) => agentsPendingCount(ctx)).then((res) => {
        void setAgentsBadge(res.count);
        return res;
      });
    case 'agents/turnOn':
      return withAgents((ctx) => agentsTurnOn(ctx)).then(noteAgentsOverview);
    case 'agents/vaultCreate':
      return withAgents((ctx) => agentsCreateVault(ctx, request.name));
    case 'agents/itemPut':
      return withAgents((ctx) => agentsPutItem(ctx, request.vaultId, request.itemId, request.value));
    case 'agents/itemEdit':
      return withAgents((ctx) =>
        agentsEditItem(ctx, {
          vaultId: request.vaultId,
          itemId: request.itemId,
          title: request.title,
          key: request.key,
          hosts: request.hosts,
        }),
      );
    case 'agents/enrollBegin':
      return withAgents((ctx) => agentsBeginEnrollment(ctx));
    case 'agents/enrollReview':
      return withAgents((ctx) => agentsReviewEnrollment(ctx, request.invitationId));
    case 'agents/enrollConfirm':
      return withAgents(async (ctx) =>
        agentsConfirmEnrollment(ctx, request.candidate, request.name, request.days, await ownerProofFromPassword(request.password)),
      );
    case 'agents/tokenCreate':
      return withAgents(async (ctx) =>
        agentsCreateToken(ctx, request.name, request.days, await ownerProofFromPassword(request.password)),
      );
    case 'agents/grant':
      return withAgents((ctx) =>
        agentsGrantItem(ctx, {
          machineId: request.machineId,
          vaultId: request.vaultId,
          itemId: request.itemId,
          uses: request.uses,
          approval: request.approval,
          ...(request.session !== undefined ? { session: request.session } : {}),
          ...(request.bounds ? { bounds: request.bounds } : {}),
          expiresAt: request.expiresAt ?? null,
        }),
      );
    case 'agents/withdraw':
      return withAgents((ctx) => agentsWithdrawItem(ctx, request.machineId, request.vaultId, request.itemId));
    case 'agents/approveUse':
      return withAgents((ctx) => agentsApproveUse(ctx, request.machineId, request.requestId, request.mode)).then(noteAgentsOverview);
    case 'agents/deny':
      return withAgents((ctx) => agentsDenyRequest(ctx, request.machineId, request.requestId)).then(noteAgentsOverview);
    case 'agents/inboxAccept':
      return withAgents((ctx) => agentsInboxAccept(ctx, request.machineId, request.entryId, request.vaultId)).then(noteAgentsOverview);
    case 'agents/inboxDismiss':
      return withAgents((ctx) => agentsInboxDismiss(ctx, request.machineId, request.entryId)).then(noteAgentsOverview);
    case 'agents/browserFillStatus':
      return nativeFill.status();
    case 'agents/browserFillSet':
      return nativeFill.setEnabled(request.enabled);
    case 'agents/remove':
      return withAgents(async (ctx) =>
        agentsRemoveMachine(ctx, request.machineId, request.password ? await ownerProofFromPassword(request.password) : null),
      ).then(noteAgentsOverview);
    case 'agents/stopAll':
      return withAgents(async (ctx) => agentsStopAll(ctx, await ownerProofFromPassword(request.password))).then(noteAgentsOverview);
    case 'agents/resume':
      return withAgents(async (ctx) => agentsResumeMachine(ctx, request.machineId, await ownerProofFromPassword(request.password)));
    case 'agents/renew':
      return withAgents(async (ctx) =>
        agentsRenewMachine(ctx, request.machineId, request.days, await ownerProofFromPassword(request.password), request.token),
      );
    case 'agents/rekey':
      return withAgents((ctx) => agentsRekey(ctx));
    case 'agents/settle':
      return withAgents((ctx) => agentsSettle(ctx));
    case 'agents/forget':
      return withAgents(async (ctx) =>
        agentsForget(ctx, request.machineId, await ownerProofFromPassword(request.password), request.keysReplaced),
      );
    case 'agents/audit':
      return withAgents((ctx) => agentsAudit(ctx, request.since));
    case 'agents/move':
      return withAgents((ctx) => agentsMoveToNewKey(ctx));
    case 'agents/sendBack':
      return withAgents((ctx) => agentsSendBack(ctx));
    case 'agents/reset':
      return withAgents(async (ctx) => agentsStartAfresh(ctx, await ownerProofFromPassword(request.password)));
  }
}

async function ownerProofFromPassword(password: string): Promise<OwnerProofFields> {
  const link = (await requireUnlocked()).data.account;
  if (!link) fail('error.accountNone');
  const { kdf } = await prelogin(link.email);
  const keys = await deriveAccountKeys(String(password), kdf);
  return { authHash: keys.authHash };
}

async function withAgents<T>(run: (ctx: AgentWorkerContext) => Promise<T>): Promise<T> {
  const open = await requireUnlocked();
  const link = open.data.account;
  const productKey = await productKeyOf(link);
  if (!link || !link.tokens || !productKey) fail('error.accountNone');
  const previous: ProductKey | null =
    link.previousKey && link.previousKeyGeneration
      ? {
          accountId: productKey.accountId,
          product: PRODUCT,
          key: await importDataKey(link.previousKey),
          keyGeneration: link.previousKeyGeneration,
          root: productKey.root,
          rootGeneration: productKey.rootGeneration,
          sheetVerifiedAt: productKey.sheetVerifiedAt,
        }
      : null;
  const save = async (agents: StoredAgentsState, options?: { clearMove?: boolean }) => {
    await serial(async () => {
      const currentVault = await requireUnlocked();
      const acct = currentVault.data.account;
      if (!acct || acct.accountId !== productKey.accountId) return;
      if (!options?.clearMove && JSON.stringify(acct.agents) === JSON.stringify(agents)) return;
      let nextAccount: AccountLink;
      if (options?.clearMove) {
        const { previousKeyGeneration: _, agentsMovePending: __, ...rest } = acct;
        nextAccount = { ...rest, previousKey: null, agents };
      } else {
        nextAccount = { ...acct, agents };
      }
      await commit(currentVault, { ...currentVault.data, account: nextAccount }, true);
    });
  };
  return withApi((api) =>
    run({ api, productKey, previous, deviceId: link.deviceId, stored: link.agents, save }),
  ).catch(accountFailure);
}

// --- requests from the content script, in some web page ---------------------------------

/**
 * The content script's whole vocabulary. Nothing here returns a login: the
 * script learns whether to draw its button, gets a token for the list (which
 * an extension page draws), and reports a sign-in it saw sent.
 */
async function handleContent(request: ContentRequest, sender: chrome.runtime.MessageSender): Promise<unknown> {
  const tabId = sender.tab?.id;
  // The frame's own address, as Chrome reports it — never one the script sends.
  const site = sender.url ? siteOf(sender.url) : null;
  if (tabId === undefined || !site || site.origin !== sender.origin) return null;
  // The web vault: nothing offered, filled, saved or signed there (`VAULT_PAGE_ORIGIN`).
  if (site.origin === VAULT_PAGE_ORIGIN) return null;

  switch (request.type) {
    case 'content/hello': {
      const hello: ContentHello = {
        ready: Boolean(await loadVaultFile()),
        ...(await loadPrefs()),
        agentBrowserFill: await nativeFill.isEnabled(),
      };
      return hello;
    }

    case 'content/openMenu': {
      if (!sender.documentId || sender.frameId === undefined) return null;
      const field: FieldKind = request.field === 'new' || request.field === 'card' || request.field === 'address' ? request.field : 'login';
      const waiting = await conditionalFor(sender.documentId);
      if (request.auto === true) {
        // Opened by a click in the field rather than on the button: only when
        // there is something to offer, so a list never pops up to say "none".
        const vault = await current();
        if (!vault || !vault.data.settings.autoSuggest) return null;
        if (field !== 'new' && menuCount(menuContents(vault.data, site, field, waiting)) === 0) return null;
      }
      const token = newToken();
      await tableTurn(async () => {
        const now = Date.now();
        const table = await menus.read();
        const live = Object.entries(table).filter(([, session]) => now - session.at < MENU_TTL && session.documentId !== sender.documentId);
        await menus.write({
          ...Object.fromEntries(live),
          [token]: { tabId, documentId: sender.documentId!, frameId: sender.frameId!, url: sender.url!, field, at: now },
        });
      });
      const vault = await current();
      const count = vault ? menuCount(menuContents(vault.data, site, field, waiting)) : 0;
      // Room for the list as the frame will draw it, so it never scrolls for
      // two logins and never covers the page for twenty.
      // A card or an address list with nothing to show says why in two lines, not one.
      const says = (field === 'card' || field === 'address') && (count === 0 || (field === 'card' && !site.origin.startsWith('https://')));
      const rows = vault ? (says ? 2 : Math.min(Math.max(count, 1), 4)) : 1;
      const height = 44 + rows * 52 + (field === 'new' && vault ? 64 : 0) + (vault ? 0 : 40);
      // Drawn in the top frame for a frame too small to hold it, beside that
      // frame, found by the window its word came from (content/index.ts). The
      // list is the extension's page in a closed shadow root there as it is
      // anywhere; its fill still goes to the field's own document. The page
      // around can read the word, but cannot post it from that frame's window,
      // and all a wrong frame would get is the list drawn in the wrong place.
      const rect = request.inTop;
      const inTop =
        sender.frameId !== 0 &&
        typeof rect === 'object' &&
        rect !== null &&
        typeof rect.word === 'string' &&
        /^[0-9a-f]{32}$/.test(rect.word) &&
        [rect.left, rect.right, rect.top, rect.bottom].every((value) => Number.isFinite(value))
          ? await chrome.tabs
              .sendMessage<ToContent, { hosted: boolean } | undefined>(
                tabId,
                { type: 'ph/hostMenu', token, word: rect.word, rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }, height, auto: request.auto === true },
                { frameId: 0 },
              )
              .then((answer) => answer?.hosted === true)
              .catch(() => false)
          : false;
      return { token, height, inTop };
    }

    case 'content/closeMenu': {
      if (!sender.documentId) return;
      const lists = Object.entries(await menus.read()).filter(([, session]) => session.documentId === sender.documentId && session.tabId === tabId);
      for (const [token] of lists) await chrome.tabs.sendMessage<ToContent>(tabId, { type: 'ph/closeMenu', token }, { frameId: 0 }).catch(() => undefined);
      return;
    }

    case 'content/offerSave': {
      const password = typeof request.password === 'string' ? request.password.slice(0, 10_000) : '';
      const username = typeof request.username === 'string' ? request.username.trim().slice(0, 1_000) : '';
      if (!password) return;
      if (site.origin === ACCOUNT_PAGE_ORIGIN) return;
      if (!(await loadVaultFile()) || !(await loadPrefs()).offerToSave) return;
      const passwordNow = typeof request.current === 'string' ? request.current.slice(0, 10_000) : '';
      const url = `${site.origin}${new URL(sender.url!).pathname}`;
      // A password-only page after a first step that named the account.
      const named = username || (await firstStepFor(tabId, siteName(site)));
      const entry: PendingSave = {
        id: newToken(),
        token: newToken(),
        tabId,
        url,
        username: named,
        password,
        ...(passwordNow ? { current: passwordNow } : {}),
        documentId: sender.documentId,
        frameId: sender.frameId,
        sure: false,
        at: Date.now(),
        shownIn: [],
      };
      const vault = await current();
      if (vault) {
        const verdict = judgeCapture(vault.data, site, named, password, passwordNow);
        if (verdict.kind !== 'new' && verdict.kind !== 'update') return;
      }
      await holdPending(entry);
      return;
    }

    case 'content/signInSettled': {
      if (!sender.documentId) return;
      const settled = await tableTurn(async () => {
        const entry = (await livePending()).find((candidate) => candidate.tabId === tabId && candidate.documentId === sender.documentId && !candidate.sure);
        if (!entry) return null;
        if (request.through !== true) {
          await pending.remove(entry.id);
          return null;
        }
        const sure = { ...entry, sure: true };
        await pending.put(entry.id, sure);
        return sure;
      });
      if (settled) await showPromptIn(settled);
      return;
    }

    case 'content/firstStep': {
      const username = typeof request.username === 'string' ? request.username.trim().slice(0, 1_000) : '';
      if (!username || site.origin === ACCOUNT_PAGE_ORIGIN) return;
      await tableTurn(() => firstSteps.put(String(tabId), { tabId, site: siteName(site), username, at: Date.now() }));
      return;
    }

    case 'content/offerWallet': {
      if (!(await loadVaultFile()) || !(await loadPrefs()).offerToSaveCards) return;
      // A card only from a page that keeps it from anyone on the way: as filling, https alone.
      const card = site.origin.startsWith('https://') ? sentCard(request.card) : null;
      const address = sentAddress(request.address);
      if (!card && !address) return;
      const url = `${site.origin}${new URL(sender.url!).pathname}`;
      const entry: PendingSave = { id: newToken(), token: newToken(), tabId, url, username: '', password: '', card, address, sure: true, at: Date.now(), shownIn: [] };
      const vault = await current();
      if (vault && !checkoutView(entry, siteName(site), vault.data)) return;
      await holdPending(entry);
      return;
    }

    case 'content/webauthn': {
      if (typeof request.id !== 'string' || !/^[\w-]{1,64}$/.test(request.id)) return null;
      return startPasskeyRequest(request, sender, tabId, site);
    }

    case 'content/webauthnCancel': {
      if (typeof request.id === 'string') await cancelPasskeyRequest(request.id, sender);
      return;
    }

    case 'content/here': {
      // The top frame, of the tab that was asked, answering its own question: never a frame inside the page.
      const asked = typeof request.nonce === 'string' ? checkIns.get(request.nonce) : undefined;
      if (asked && asked.tabId === tabId && sender.frameId === 0 && sender.documentId) asked.arrived(sender);
      return;
    }

    case 'content/cardFields': {
      if (!sender.documentId) return;
      const documentId = sender.documentId;
      await tableTurn(async () => {
        const now = Date.now();
        const live = Object.entries(await cardFrames.read()).filter(([, frame]) => now - frame.at < CARD_FRAME_TTL);
        await cardFrames.write({ ...Object.fromEntries(live), [documentId]: { tabId, documentId, origin: site.origin, at: now } });
      });
      return;
    }

    case 'content/checkPrompt': {
      if (!sender.documentId || sender.frameId === undefined) return null;
      const documentId = sender.documentId;
      const frameId = sender.frameId;
      // Every frame of every page asks: most, with nothing waiting in their tab, without a turn.
      if (!(await livePending()).some((candidate) => candidate.tabId === tabId)) return null;
      const { show, token } = await tableTurn(async (): Promise<{ show: PendingSave | null; token: string | null }> => {
        let entry = (await livePending()).filter((candidate) => candidate.tabId === tabId).at(-1);
        if (!entry) return { show: null, token: null };
        if (!entry.sure) {
          // A new document where the sign-in was sent, or a new page in the tab:
          // the sign-in went through, unless the page came back to a sign-in
          // form — the one it was sent from, saying the password was wrong.
          const after = documentId !== entry.documentId && (frameId === 0 || frameId === entry.frameId);
          if (!after) return { show: null, token: null };
          if (request.signInForm === true) {
            await pending.remove(entry.id);
            return { show: null, token: null };
          }
          entry = { ...entry, sure: true };
          await pending.put(entry.id, entry);
          // Settled by a frame inside the page: the top frame draws the prompt.
          if (frameId !== 0) return { show: entry, token: null };
        }
        // Only the top frame draws the prompt, once per document.
        if (frameId !== 0 || entry.shownIn.includes(documentId)) return { show: null, token: null };
        await pending.put(entry.id, { ...entry, shownIn: [...entry.shownIn, documentId] });
        return { show: null, token: entry.token };
      });
      if (show) await showPromptIn(show);
      return token ? { token } : null;
    }
  }
}

/**
 * A sign-in with Google or GitHub, made in Passhold's own tab, coming back:
 * the Keyrook server's page hands over the answer. No other page can message
 * Passhold (`externally_connectable`), and the sender is checked here as
 * well; the tab then goes back to Passhold's own page.
 */
// Firefox lets no web page message an extension, and has no such event.
chrome.runtime.onMessageExternal?.addListener((message: unknown, sender, respond) => {
  const answer = (message as { answer?: unknown } | null)?.answer;
  const tabId = sender.tab?.id;
  if (sender.origin !== KEYROOK_ORIGIN || tabId === undefined || typeof answer !== 'string' || answer.length > 4096) return false;
  finishProvider(new URLSearchParams(answer))
    .then(async (taken) => {
      if (taken) await chrome.tabs.update(tabId, { url: chrome.runtime.getURL('options.html#provider') });
      respond(taken);
    })
    .catch(() => respond(false));
  return true;
});

chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
  if (typeof message !== 'object' || message === null) return false;
  const runtimeId = chrome.runtime.id;
  const type = (message as { type?: unknown }).type;
  if (typeof type !== 'string') return false;

  let work: Promise<unknown>;
  if (isTrustedSender(sender, runtimeId, ownOrigin())) {
    // Our own broadcasts, and the offscreen document's private channel.
    if (type === VAULT_CHANGED || type.startsWith('offscreen/')) return false;
    work = handle(message as Request, sender);
  } else if (isContentSender(sender, runtimeId) && type.startsWith('content/')) {
    work = handleContent(message as ContentRequest, sender);
  } else {
    return false;
  }

  work.then(
    (value) => respond({ ok: true, value: value ?? null } satisfies Envelope<unknown>),
    (error: unknown) => {
      const { key, values, message: text } = describeError(error);
      if (!(error instanceof AppError) && key === 'error.unknown') console.error(error);
      respond({ ok: false, error: text, key, values } satisfies Envelope<unknown>);
    },
  );
  return true;
});

// --- locking ------------------------------------------------------------------------------

chrome.alarms.onAlarm.addListener((alarm) => {
  // Only where there is no offscreen document to wait in (clipboard.ts).
  if (alarm.name === CLIPBOARD_ALARM) {
    void clearClipboardNow();
    return;
  }
  if (alarm.name === SYNC_ALARM) {
    void (async () => {
      if ((await current())?.data.account?.tokens) {
        await syncNow().catch(() => undefined);
        await refreshAgentsBadge().catch(() => undefined);
      }
    })();
    return;
  }
  if (alarm.name !== AUTO_LOCK_ALARM) return;
  void (async () => {
    const { key, policy, lastActive } = await loadSession();
    if (!key) {
      await chrome.alarms.clear(AUTO_LOCK_ALARM);
      return;
    }
    if (policy && policy.autoLockMinutes > 0 && lastActive && Date.now() - lastActive >= policy.autoLockMinutes * 60_000) {
      await lock();
      return;
    }
    await refreshAgentsBadge().catch(() => undefined);
  })();
});

chrome.idle.onStateChanged.addListener((state) => {
  if (state !== 'locked') return;
  void (async () => {
    const { key, policy } = await loadSession();
    if (key && policy?.lockWithSystem !== false) await lock();
  })();
});

const nativeFill = createNativeFillController({
  blockedOrigins: () => [KEYROOK_ORIGIN, VAULT_PAGE_ORIGIN, 'https://account.keyrook.com', 'https://vault.keyrook.com'],
  inspectActiveTab: async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab?.id === undefined) return null;
    const frame = await topFrame(tab.id);
    if (!frame) return null;
    return { tabId: tab.id, url: frame.url, documentId: frame.documentId };
  },
  deliver: async (tabId, documentId, payload) => {
    await deliverFill(tabId, { documentId }, {
      type: 'ph/fill',
      origin: payload.origin,
      username: payload.username,
      password: payload.password,
      field: 'login',
    });
  },
});
void nativeFill.init().catch(() => undefined);

// A closed tab's waiting sign-in and inline lists go with it.
chrome.tabs.onRemoved.addListener((tabId) => {
  void tableTurn(async () => {
    const table = await pending.read();
    await pending.write(Object.fromEntries(Object.entries(table).filter(([, entry]) => entry.tabId !== tabId)));
    await firstSteps.remove(String(tabId));
    const open = await menus.read();
    await menus.write(Object.fromEntries(Object.entries(open).filter(([, session]) => session.tabId !== tabId)));
    const asking = await passkeyRequests.read();
    await passkeyRequests.write(Object.fromEntries(Object.entries(asking).filter(([, entry]) => entry.tabId !== tabId)));
    const frames = await cardFrames.read();
    await cardFrames.write(Object.fromEntries(Object.entries(frames).filter(([, frame]) => frame.tabId !== tabId)));
  });
});

