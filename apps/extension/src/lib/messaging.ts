import type { LoginDraft, VaultData, VaultSettings } from '@passhold/core';
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
  | { state: 'locked' }
  | { state: 'unlocked'; data: VaultData };

/**
 * Pages describe a change; the service worker applies it inside its
 * serialised turn, seals and stores the result, and tells every page.
 */
export type Mutation =
  | { op: 'login/add'; draft: LoginDraft }
  | { op: 'login/update'; id: string; draft: LoginDraft }
  | { op: 'login/favorite'; id: string; favorite: boolean }
  | { op: 'login/trash'; id: string }
  | { op: 'login/restore'; id: string }
  | { op: 'login/purge'; id: string }
  | { op: 'login/import'; drafts: LoginDraft[] }
  | { op: 'trash/empty' }
  | { op: 'settings/update'; patch: Partial<VaultSettings> }
  | { op: 'neverSave/remove'; site: string };

/** The field the inline list was opened from. */
export type FieldKind = 'login' | 'new';

/** What the inline list shows: never a password. */
export interface MenuView {
  state: 'uninitialized' | 'locked' | 'ready';
  site: string;
  field: FieldKind;
  logins: { id: string; title: string; username: string }[];
}

/** A sign-in a page just sent, as the save prompt and the popup show it. */
export interface PendingView {
  id: string;
  site: string;
  username: string;
  /** Null while the vault is locked: what it means is decided on unlocking. */
  kind: 'new' | 'update' | null;
}

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
  | { type: 'vault/create'; password: string }
  | { type: 'vault/unlock'; password: string }
  | { type: 'vault/lock' }
  | { type: 'vault/mutate'; mutation: Mutation }
  | { type: 'vault/changePassword'; current: string; next: string }
  /** Plain text out: asks for the master password, even unlocked. */
  | { type: 'vault/exportCsv'; password: string }
  /** The vault file as it is, sealed. Asks for the master password: the file opens with nothing else. */
  | { type: 'vault/backup'; password: string }
  /** With no vault here, the backup becomes it; with one, its logins are added and nothing is removed. */
  | { type: 'vault/restore'; backup: string; password: string }
  /** Removes the vault from this browser. Needs no password: it is the way out when it is forgotten. */
  | { type: 'vault/reset' }
  | { type: 'page/info' }
  | { type: 'page/fill'; id: string }
  | { type: 'menu/view'; token: string }
  | { type: 'menu/fill'; token: string; id: string }
  | { type: 'menu/suggest'; token: string; password: string }
  | { type: 'menu/unlock'; token: string }
  | { type: 'prompt/view'; token: string }
  | { type: 'prompt/answer'; token: string; answer: 'save' | 'never' | 'dismiss' }
  | { type: 'pending/view' }
  | { type: 'pending/answer'; id: string; answer: 'save' | 'never' | 'dismiss' }
  | { type: 'clipboard/copied' };

export type ResponseFor<R extends Request> = R extends { type: 'vault/status' | 'vault/create' | 'vault/unlock' }
  ? VaultStatus
  : R extends { type: 'vault/exportCsv' }
    ? { csv: string }
    : R extends { type: 'vault/backup' }
      ? { backup: string }
      : R extends { type: 'vault/restore' }
        ? RestoreResult
        : R extends { type: 'page/info' }
          ? PageInfo
          : R extends { type: 'menu/view' }
            ? MenuView
            : R extends { type: 'menu/unlock' }
              ? { opened: boolean }
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
  | { type: 'content/openMenu'; field: FieldKind }
  | { type: 'content/offerSave'; username: string; password: string }
  | { type: 'content/checkPrompt' };

export interface ContentHello {
  /** A vault exists here: without one there is nothing to offer. */
  ready: boolean;
  inlineButton: boolean;
  offerToSave: boolean;
}

export type ContentResponseFor<R extends ContentRequest> = R extends { type: 'content/hello' }
  ? ContentHello
  : R extends { type: 'content/openMenu' }
    ? { token: string; height: number } | null
    : R extends { type: 'content/checkPrompt' }
      ? { token: string } | null
      : void;

/** What the service worker sends a frame. A fill names the origin it is for. */
export type ToContent =
  | { type: 'ph/fill'; origin: string; username: string | null; password: string; field: FieldKind | 'any' }
  | { type: 'ph/closeMenu' }
  | { type: 'ph/showPrompt'; token: string }
  | { type: 'ph/closePrompt' };

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
