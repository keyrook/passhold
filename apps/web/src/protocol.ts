/**
 * What the web vault's page and its worker say to each other. The worker is
 * the extension's service worker moved into the page: it alone holds
 * Passhold's key and the opened vault, and the page describes what it wants.
 * Every request a screen shared with the extension sends (`Request`) is
 * answered as the service worker answers it, where the web vault does it at
 * all; the rest are the web vault's own (`WebRequest`).
 */
import type { Secret, SignInProvider } from '@passhold/core';
import type { AccountPasskeyTouch, Envelope, Request, SecondStepAnswer } from '../../extension/src/lib/messaging.js';

/**
 * The tab's sign-in, as the page keeps it in `sessionStorage` under
 * `passhold.web.session`: closing the tab ends it, a reload keeps it, and it
 * opens nothing without what is typed or touched.
 */
export interface WebSession {
  accessToken: string;
  refreshToken: string;
  accountId: string;
  email: string;
  /** This tab's device id on the account, drawn at sign-in. */
  deviceId: string;
  provider: SignInProvider | null;
}

/** How the locked vault may be opened, as the account's keys say: never from the page's word. */
export interface Ways {
  password: boolean;
  recoveryKey: boolean;
}

export type WebRequest =
  /** The tab's sign-in, given to a new worker (after a lock, or a reload); null for none. */
  | { type: 'web/start'; session: WebSession | null }
  /** How the signed-in account opens: asked of the server, once per worker. */
  | { type: 'web/ways' }
  /** With the account's email and password: signed in, and — the password being what opens the account — open. */
  | { type: 'web/signIn'; email: string; password: string }
  /** The second step a sign-in waits on: the code, the recovery key in its place, or one of the account's passkeys. */
  | { type: 'web/secondStep'; answer: SecondStepAnswer }
  /** Back from Google or GitHub: the ticket the server handed this page, and the verifier this tab kept for it. */
  | { type: 'web/provider'; provider: SignInProvider; ticket: string; verifier: string }
  /** Opened again with the account's password: no new sign-in, and no second step. */
  | { type: 'web/unlock'; password: string }
  /** Opened with the account's recovery key. */
  | { type: 'web/unlockRecoveryKey'; recoveryKey: string }
  /** Signed in, or opened again, with one of the account's passkeys: its answer and its PRF answer. */
  | { type: 'web/passkey'; touch: AccountPasskeyTouch }
  /** Ends the session on the server too. */
  | { type: 'web/signOut' }
  /** Whether what changed here has reached the account. */
  | { type: 'web/syncState' }
  /** Send what was changed here now, and say what could not go: asked before this worker is ended. */
  | { type: 'web/flush' }
  /** One hidden value, as it is shown or copied now: the screens hold none until then. */
  | { type: 'item/reveal'; id: string; secret: Secret }
  /** An item whole, for its edit screen: what is typed over is what the item holds. */
  | { type: 'item/full'; id: string };

/** A change lives in this tab until the account has it: whether one waits, is going, or could not go. */
export interface SyncState {
  syncing: boolean;
  /** Changes made here the account has not taken yet. */
  unsent: number;
  /** Why the last round failed, as a message key; null when it went through. */
  failed: string | null;
}

/** What a page sends: the shared screens' requests and the web vault's own. */
export type AnyRequest = Request | WebRequest;

/** Where a sign-in stands, as the page draws it. */
export type SignInStep = { step: 'open' } | { step: 'locked' } | { step: 'secondStep'; passkeys: boolean };

/** Page to worker. */
export interface ToWorker {
  id: number;
  request: AnyRequest;
}

/** Worker to page: an answer, or news. */
export type FromWorker =
  | { id: number; envelope: Envelope<unknown> }
  /** The vault changed: the screens read it again. */
  | { event: 'changed' }
  /** The tab's sign-in now: tokens turned over, or — null — the server ended it. */
  | { event: 'session'; session: WebSession | null }
  /** How many changes made here the account has not taken yet. */
  | { event: 'unsent'; count: number };
