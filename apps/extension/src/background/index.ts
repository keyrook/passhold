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
  addLogin,
  addNeverSave,
  backupText,
  changeMasterPassword,
  createVault,
  emptyTrash,
  exportCsv,
  exportDataKey,
  importDataKey,
  judgeCapture,
  loginsForSite,
  markBackedUp,
  markUsed,
  matchUrls,
  mergeBackup,
  openBackup,
  purgeLogin,
  readPayload,
  removeNeverSave,
  restoreLogin,
  sealVault,
  setFavorite,
  siteName,
  siteOf,
  trashLogin,
  unlockVault,
  updateLogin,
  updateSettings,
  verifyMasterPassword,
  type LoginItem,
  type Site,
  type UnlockedVault,
  type VaultData,
} from '@passhold/core';
import { AppError, describeError, fail } from '../i18n/errors.js';
import {
  isContentSender,
  isTrustedSender,
  VAULT_CHANGED,
  type ContentHello,
  type ContentRequest,
  type Envelope,
  type FieldKind,
  type MenuView,
  type Mutation,
  type PageInfo,
  type PendingView,
  type PromptOutcome,
  type Request,
  type RestoreResult,
  type ToContent,
  type VaultStatus,
} from '../lib/messaging.js';
import { createSerialiser } from '../lib/serial.js';
import {
  clearSession,
  clearVaultFile,
  loadPrefs,
  loadSession,
  loadVaultFile,
  markActive,
  savePolicy,
  savePrefs,
  saveSession,
  saveVaultFile,
  sessionTable,
  type LockPolicy,
} from '../lib/storage.js';
import { clearClipboardLater } from './clipboard.js';

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

// --- the vault ------------------------------------------------------------------

function policyOf(data: VaultData): LockPolicy {
  const { autoLockMinutes, lockWithSystem, clearClipboardSeconds } = data.settings;
  return { autoLockMinutes, lockWithSystem, clearClipboardSeconds };
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
  return vault ? { state: 'unlocked', data: vault.data } : { state: 'locked' };
}

function broadcast(): void {
  chrome.runtime.sendMessage({ type: VAULT_CHANGED }).catch(() => undefined);
}

/** Seal and store new data. Runs inside a serialised turn. */
async function commit(vault: UnlockedVault, data: VaultData): Promise<UnlockedVault> {
  const epoch = locks;
  const file = await sealVault(vault.file, vault.dataKey, data);
  await saveVaultFile(file);
  const next = { ...vault, file, data };
  if (epoch === locks) cached = next;
  if (data.settings !== vault.data.settings) {
    await savePrefs({ inlineButton: data.settings.inlineButton, offerToSave: data.settings.offerToSave });
    if (epoch === locks) await savePolicy(policyOf(data));
  }
  broadcast();
  return next;
}

/** Apply a change described by a page, with the read inside the turn. */
function change(apply: (data: VaultData) => VaultData): Promise<UnlockedVault> {
  return serial(async () => {
    const vault = await requireUnlocked();
    return commit(vault, apply(vault.data));
  });
}

function applyMutation(data: VaultData, mutation: Mutation): VaultData {
  switch (mutation.op) {
    case 'login/add':
      return addLogin(data, mutation.draft).data;
    case 'login/update':
      return updateLogin(data, mutation.id, mutation.draft);
    case 'login/favorite':
      return setFavorite(data, mutation.id, mutation.favorite);
    case 'login/trash':
      return trashLogin(data, mutation.id);
    case 'login/restore':
      return restoreLogin(data, mutation.id);
    case 'login/purge':
      return purgeLogin(data, mutation.id);
    case 'login/import':
      return mutation.drafts.reduce((next, draft) => addLogin(next, draft).data, data);
    case 'trash/empty':
      return emptyTrash(data);
    case 'settings/update':
      return updateSettings(data, mutation.patch);
    case 'neverSave/remove':
      return removeNeverSave(data, mutation.site);
  }
}

async function lock(): Promise<void> {
  locks++;
  cached = null;
  await clearSession();
  await chrome.alarms.clear(AUTO_LOCK_ALARM);
  broadcast();
}

async function opened(vault: UnlockedVault): Promise<VaultStatus> {
  await saveSession(await exportDataKey(vault.dataKey), policyOf(vault.data));
  await savePrefs({ inlineButton: vault.data.settings.inlineButton, offerToSave: vault.data.settings.offerToSave });
  cached = vault;
  await chrome.alarms.create(AUTO_LOCK_ALARM, { periodInMinutes: 1 });
  broadcast();
  return { state: 'unlocked', data: vault.data };
}

// --- pages in the active tab --------------------------------------------------------

async function activeTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab ?? null;
}

/**
 * Where the top frame of a tab is. `tab.url` is there for pages the content
 * script runs on; where Chrome withholds it, the frame's own script is asked.
 */
async function tabSite(tab: chrome.tabs.Tab): Promise<Site | null> {
  let url = tab.url ?? null;
  if (!url && tab.id !== undefined) {
    url = await chrome.tabs
      .sendMessage<{ type: 'ph/where' }, { url: string } | undefined>(tab.id, { type: 'ph/where' }, { frameId: 0 })
      .then((answer) => answer?.url ?? null)
      .catch(() => null);
  }
  return url ? siteOf(url) : null;
}

/**
 * Hand one frame a login. The frame is named by document, not just by number,
 * so a frame that navigated since it asked gets nothing; and the content script
 * checks the origin again before it types a character.
 */
async function deliverFill(
  tabId: number,
  target: { documentId: string } | { frameId: number },
  message: Extract<ToContent, { type: 'ph/fill' }>,
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
  const base = { site: siteName(site), field: session.field, logins: [] };
  if (!(await loadVaultFile())) return { ...base, state: 'uninitialized' };
  const vault = await current();
  if (!vault) return { ...base, state: 'locked' };
  return {
    ...base,
    state: 'ready',
    logins: loginsForSite(vault.data, site).map(({ item }) => ({ id: item.id, title: item.title, username: item.username })),
  };
}

async function closeMenu(session: MenuSession): Promise<void> {
  await chrome.tabs.sendMessage<ToContent>(session.tabId, { type: 'ph/closeMenu' }, { documentId: session.documentId }).catch(() => undefined);
}

async function openToolbarPopup(): Promise<boolean> {
  try {
    await chrome.action.openPopup();
    return true;
  } catch {
    return false;
  }
}

// --- sign-ins waiting to be saved ---------------------------------------------------

interface PendingSave {
  id: string;
  token: string;
  tabId: number;
  /** Where the form was sent from: origin and path, never its query. */
  url: string;
  username: string;
  password: string;
  at: number;
  /** Documents that have shown the prompt already, so a reload does not repeat it. */
  shownIn: string[];
}

const pending = sessionTable<PendingSave>('ph.pending');

/** Sign-ins still within their time. Expired ones are dropped the next time the table is written. */
async function livePending(): Promise<PendingSave[]> {
  const now = Date.now();
  return Object.values(await pending.read()).filter((entry) => now - entry.at < PENDING_TTL);
}

async function pendingView(entry: PendingSave): Promise<PendingView | null> {
  const vault = await current();
  const site = siteOf(entry.url);
  if (!site) return null;
  let kind: PendingView['kind'] = null;
  if (vault) {
    const verdict = judgeCapture(vault.data, site, entry.username, entry.password);
    if (verdict.kind === 'known' || verdict.kind === 'neverSave') return null;
    kind = verdict.kind;
  }
  return { id: entry.id, site: siteName(site), username: entry.username, kind };
}

async function answerPending(entry: PendingSave, answer: 'save' | 'never' | 'dismiss'): Promise<PromptOutcome> {
  if (answer === 'dismiss') {
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
    if (answer === 'never') return addNeverSave(data, siteName(site));
    const verdict = judgeCapture(data, site, entry.username, entry.password);
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

async function closePrompt(tabId: number): Promise<void> {
  await chrome.tabs.sendMessage<ToContent>(tabId, { type: 'ph/closePrompt' }, { frameId: 0 }).catch(() => undefined);
}

// --- requests from Passhold's own pages ------------------------------------------------

async function handle(request: Request, sender: chrome.runtime.MessageSender): Promise<unknown> {
  if (request.type !== 'vault/status') void markActive();
  switch (request.type) {
    case 'vault/status':
      return status();

    case 'vault/create':
      return serial(async () => {
        if (await loadVaultFile()) fail('error.vaultExists');
        const vault = await createVault(request.password);
        await saveVaultFile(vault.file);
        return opened(vault);
      });

    case 'vault/unlock':
      return serial(async () => {
        const file = await loadVaultFile();
        if (!file) fail('error.noVault');
        return opened(await unlockVault(file, request.password));
      });

    case 'vault/lock':
      return lock();

    case 'vault/mutate':
      await change((data) => applyMutation(data, request.mutation));
      return;

    case 'vault/changePassword':
      return serial(async () => {
        const vault = await requireUnlocked();
        const file = await changeMasterPassword(vault.file, request.current, request.next);
        await saveVaultFile(file);
        cached = { ...vault, file };
        broadcast();
      });

    case 'vault/exportCsv': {
      const vault = await requireUnlocked();
      // Plain text leaves the vault here, so being unlocked is not enough:
      // whoever is at an unlocked browser has to know the password too.
      if (!(await verifyMasterPassword(vault.file, request.password))) fail('error.wrongPassword');
      return { csv: exportCsv(vault.data.items) };
    }

    case 'vault/backup':
      return serial(async () => {
        const vault = await requireUnlocked();
        // The backup opens with this password and nothing else, so it is asked
        // for here: a backup its owner cannot open is no backup.
        if (!(await verifyMasterPassword(vault.file, request.password))) fail('error.wrongPassword');
        const next = await commit(vault, markBackedUp(vault.data));
        return { backup: backupText(next.file) };
      });

    case 'vault/restore':
      return serial(async (): Promise<RestoreResult> => {
        // Asked before the backup's KDF runs, so a locked vault answers at once.
        const vault = (await loadVaultFile()) ? await requireUnlocked() : null;
        const backup = await openBackup(request.backup, request.password);
        if (!vault) {
          // Nothing here to lose: the backup becomes the vault, sealed afresh
          // from what was checked rather than stored as the file brought it.
          const file = await sealVault(backup.file, backup.dataKey, backup.data);
          await saveVaultFile(file);
          await opened({ ...backup, file });
          return { mode: 'new', added: backup.data.items.length, updated: 0 };
        }
        const { data, added, updated } = mergeBackup(vault.data, backup.data);
        await commit(vault, data);
        return { mode: 'merged', added, updated };
      });

    case 'vault/reset':
      return serial(async () => {
        await lock();
        await clearVaultFile();
        await tableTurn(async () => {
          await menus.write({});
          await pending.write({});
        });
        broadcast();
      });

    case 'page/info': {
      const tab = await activeTab();
      const site = tab ? await tabSite(tab) : null;
      const vault = await current();
      const info: PageInfo = {
        site: site ? siteName(site) : null,
        url: site && tab?.url ? `${site.origin}${new URL(tab.url).pathname}` : site ? site.origin : null,
        loginIds: site && vault ? loginsForSite(vault.data, site).map(({ item }) => item.id) : [],
      };
      return info;
    }

    case 'page/fill': {
      const vault = await requireUnlocked();
      const item = itemOrFail(vault.data, request.id);
      const tab = await activeTab();
      const site = tab ? await tabSite(tab) : null;
      if (!tab?.id || !site || !matchUrls(item.urls, site)) fail('error.notOnPage');
      await deliverFill(tab.id, { frameId: 0 }, {
        type: 'ph/fill',
        origin: site.origin,
        username: item.username,
        password: item.password,
        field: 'any',
      });
      await change((data) => markUsed(data, item.id));
      return;
    }

    case 'menu/view':
      return menuView(request.token, sender);

    case 'menu/fill': {
      const { session, site } = await menuFor(request.token, sender);
      const vault = await requireUnlocked();
      const item = itemOrFail(vault.data, request.id);
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
      await closeMenu(session);
      await change((data) => markUsed(data, item.id));
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
      await closeMenu(session);
      return;
    }

    case 'menu/unlock':
      await menuFor(request.token, sender);
      return { opened: await openToolbarPopup() };

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
      const entry = (await livePending()).filter((candidate) => candidate.tabId === tab?.id).at(-1);
      return entry ? pendingView(entry) : null;
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
  }
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

  switch (request.type) {
    case 'content/hello': {
      const hello: ContentHello = { ready: Boolean(await loadVaultFile()), ...(await loadPrefs()) };
      return hello;
    }

    case 'content/openMenu': {
      if (!sender.documentId || sender.frameId === undefined) return null;
      const token = newToken();
      const field: FieldKind = request.field === 'new' ? 'new' : 'login';
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
      const count = vault ? loginsForSite(vault.data, site).length : 0;
      // Room for the list as the frame will draw it, so it never scrolls for
      // two logins and never covers the page for twenty.
      const rows = vault ? Math.min(Math.max(count, 1), 4) : 1;
      const height = 44 + rows * 52 + (field === 'new' && vault ? 64 : 0) + (vault ? 0 : 40);
      return { token, height };
    }

    case 'content/offerSave': {
      const password = typeof request.password === 'string' ? request.password.slice(0, 10_000) : '';
      const username = typeof request.username === 'string' ? request.username.trim().slice(0, 1_000) : '';
      if (!password) return;
      if (!(await loadVaultFile()) || !(await loadPrefs()).offerToSave) return;
      const url = `${site.origin}${new URL(sender.url!).pathname}`;
      const entry: PendingSave = { id: newToken(), token: newToken(), tabId, url, username, password, at: Date.now(), shownIn: [] };
      const vault = await current();
      if (vault) {
        const verdict = judgeCapture(vault.data, site, username, password);
        if (verdict.kind === 'known' || verdict.kind === 'neverSave') return;
      }
      // One sign-in waiting per tab: the latest is the one that worked.
      await tableTurn(async () => {
        const live = (await livePending()).filter((candidate) => candidate.tabId !== tabId);
        await pending.write(Object.fromEntries([...live, entry].map((candidate) => [candidate.id, candidate])));
      });
      await chrome.tabs.sendMessage<ToContent>(tabId, { type: 'ph/showPrompt', token: entry.token }, { frameId: 0 }).catch(() => undefined);
      return;
    }

    case 'content/checkPrompt': {
      // Only the top frame draws the prompt, once per document.
      if (sender.frameId !== 0 || !sender.documentId) return null;
      return tableTurn(async () => {
        const entry = (await livePending()).filter((candidate) => candidate.tabId === tabId).at(-1);
        if (!entry || entry.shownIn.includes(sender.documentId!)) return null;
        await pending.put(entry.id, { ...entry, shownIn: [...entry.shownIn, sender.documentId!] });
        return { token: entry.token };
      });
    }
  }
}

chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
  if (typeof message !== 'object' || message === null) return false;
  const runtimeId = chrome.runtime.id;
  const type = (message as { type?: unknown }).type;
  if (typeof type !== 'string') return false;

  let work: Promise<unknown>;
  if (isTrustedSender(sender, runtimeId)) {
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
  if (alarm.name !== AUTO_LOCK_ALARM) return;
  void (async () => {
    const { key, policy, lastActive } = await loadSession();
    if (!key) {
      await chrome.alarms.clear(AUTO_LOCK_ALARM);
      return;
    }
    if (policy && policy.autoLockMinutes > 0 && lastActive && Date.now() - lastActive >= policy.autoLockMinutes * 60_000) {
      await lock();
    }
  })();
});

chrome.idle.onStateChanged.addListener((state) => {
  if (state !== 'locked') return;
  void (async () => {
    const { key, policy } = await loadSession();
    if (key && policy?.lockWithSystem !== false) await lock();
  })();
});

// A closed tab's waiting sign-in and inline lists go with it.
chrome.tabs.onRemoved.addListener((tabId) => {
  void tableTurn(async () => {
    const table = await pending.read();
    await pending.write(Object.fromEntries(Object.entries(table).filter(([, entry]) => entry.tabId !== tabId)));
    const open = await menus.read();
    await menus.write(Object.fromEntries(Object.entries(open).filter(([, session]) => session.tabId !== tabId)));
  });
});

