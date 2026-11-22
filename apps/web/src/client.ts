/**
 * The page's side of the worker that holds the vault. The page starts it,
 * hands it the tab's sign-in, and passes on what its screens ask; a lock ends
 * it (`terminate`) and starts an empty one, which opens nothing until
 * something is typed or touched. The page itself never holds a key.
 */
import { BackgroundError, type Envelope, type Request, type Transport } from '../../extension/src/lib/messaging.js';
import type { AnyRequest, FromWorker, SyncState, WebSession } from './protocol.js';
import { loadKept, updateKept } from './session.js';
import workerUrl from './worker/index.ts?worker&url';

/** How long a copied secret stays on the clipboard, if the page still has focus to clear it. */
export const CLIPBOARD_SECONDS = 30;

type TrustedTypesLike = { createPolicy(name: string, rules: { createScriptURL(url: string): string }): { createScriptURL(url: string): unknown } };

/**
 * The page runs under Trusted Types (`require-trusted-types-for 'script'`):
 * the one script address it makes is its own worker's, through a policy that
 * makes no other. A browser without Trusted Types takes the address as it is.
 */
const policy = (globalThis as { trustedTypes?: TrustedTypesLike }).trustedTypes?.createPolicy('passhold-worker', {
  createScriptURL(url) {
    if (url !== workerUrl) throw new TypeError('Only the vault’s own worker is started here.');
    return url;
  },
});

let worker: Worker | null = null;
let nextId = 1;
const waiting = new Map<number, (envelope: Envelope<unknown>) => void>();
const changeListeners = new Set<() => void>();
const sessionListeners = new Set<(session: WebSession | null) => void>();
let clipboardTimer: ReturnType<typeof setTimeout> | undefined;
/** How many times the vault has locked: an answer from a worker since ended is not taken. */
let generation = 0;
/** Changes made in this tab the account has not taken yet, as the worker last said. */
let unsent = 0;
/**
 * Requests wait for the worker the page is starting: while a lock lets the
 * worker that held the keys send what was changed, nothing else reaches it.
 */
let ready: Promise<void> = Promise.resolve();

/** How long a lock waits for that worker to send what was changed: then it is ended, sent or not. */
export const FLUSH_WAIT = 10_000;

/** What became of the changes as the vault last locked: being sent, or some could not go. */
export type LockNote = 'saving' | 'lost' | null;
let lockNote: LockNote = null;
const noteListeners = new Set<(note: LockNote) => void>();

function setNote(note: LockNote): void {
  lockNote = note;
  for (const listener of noteListeners) listener(note);
}

export function currentLockNote(): LockNote {
  return lockNote;
}

export function onLockNote(listener: (note: LockNote) => void): () => void {
  noteListeners.add(listener);
  return () => noteListeners.delete(listener);
}

/** Read, once the vault is open again. */
export function clearLockNote(): void {
  setNote(null);
}

function startWorker(): Worker {
  const started = new Worker((policy ? policy.createScriptURL(workerUrl) : workerUrl) as string, { type: 'module', name: 'passhold-vault' });
  const mine = generation;
  started.onmessage = (event: MessageEvent<FromWorker>) => {
    if (mine !== generation) return;
    const message = event.data;
    if ('id' in message) {
      waiting.get(message.id)?.(message.envelope);
      waiting.delete(message.id);
    } else if (message.event === 'changed') {
      for (const listener of changeListeners) listener();
    } else if (message.event === 'session') {
      updateKept((kept) => ({ ...kept, session: message.session }));
      for (const listener of sessionListeners) listener(message.session);
    } else if (message.event === 'unsent') {
      unsent = message.count;
    }
  };
  return started;
}

function post(target: Worker, request: AnyRequest): Promise<Envelope<unknown>> {
  return new Promise((resolve) => {
    const id = nextId++;
    waiting.set(id, resolve);
    target.postMessage({ id, request });
  });
}

/** A request to the worker, as an envelope: refusals come back as message keys. */
export async function call(request: AnyRequest): Promise<Envelope<unknown>> {
  await ready;
  if (!worker) throw new Error('The vault’s worker is not started.');
  return post(worker, request);
}

/** The worker's answer, or its refusal thrown as the shared screens throw it. */
export async function ask<T>(request: AnyRequest): Promise<T> {
  const envelope = await call(request);
  if (!envelope.ok) throw new BackgroundError(envelope.error, envelope.key, envelope.values);
  return envelope.value as T;
}

/**
 * A new, empty worker, given the tab's sign-in: the first at load, and one
 * after every lock. The worker before is ended, with everything it held;
 * whatever it was still answering is answered "locked".
 */
export async function restart(): Promise<void> {
  generation++;
  worker?.terminate();
  for (const resolve of waiting.values()) resolve({ ok: false, error: 'error.locked', key: 'error.locked' });
  waiting.clear();
  worker = startWorker();
  await post(worker, { type: 'web/start', session: loadKept().session });
}

/**
 * The vault locks. The screens have already dropped every item they drew;
 * the worker that held the keys is asked first to send what was changed and
 * not yet sent — for `FLUSH_WAIT` at most — and is then ended, and an empty
 * one started. What could not go is said on the lock screen (`LockNote`).
 * `flush: false`, as the page is left: the keys go at once, since a page
 * leaving may be frozen before any answer comes.
 */
export async function lock({ flush = true }: { flush?: boolean } = {}): Promise<void> {
  const before = ready;
  let opened!: () => void;
  ready = new Promise((resolve) => (opened = resolve));
  try {
    // A lock already under way finishes first.
    await before;
    const holder = worker;
    let lost = false;
    if (unsent > 0 && holder && flush) {
      setNote('saving');
      const answer = await Promise.race([post(holder, { type: 'web/flush' }), new Promise<null>((done) => setTimeout(() => done(null), FLUSH_WAIT))]);
      lost = !answer || !answer.ok || (answer.value as SyncState).unsent > 0;
    } else if (unsent > 0) {
      lost = true;
    }
    unsent = 0;
    await restart();
    setNote(lost ? 'lost' : null);
  } finally {
    opened();
  }
  for (const listener of changeListeners) listener();
}

/** What was changed, sent now rather than in a moment: the tab is being hidden, and a phone may end it. */
export function sendNow(): void {
  if (unsent > 0) void call({ type: 'account/sync' }).catch(() => undefined);
}

// Closing or reloading the tab on a change not yet sent: the browser asks first, where it lets a page ask.
addEventListener('beforeunload', (event) => {
  if (unsent === 0) return;
  event.preventDefault();
  event.returnValue = '';
});

export function onSession(listener: (session: WebSession | null) => void): () => void {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

export function onChanged(listener: () => void): () => void {
  changeListeners.add(listener);
  return () => changeListeners.delete(listener);
}

/**
 * Clears what was copied, once, if the page still has focus: a browser lets
 * a page write the clipboard only then, so the page says the copy may stay.
 */
function clearClipboardLater(): void {
  clearTimeout(clipboardTimer);
  clipboardTimer = setTimeout(() => {
    if (document.hasFocus()) void navigator.clipboard.writeText('').catch(() => undefined);
  }, CLIPBOARD_SECONDS * 1000);
}

/** What the shared screens send, as the web vault answers it: most goes to the worker, a few are the page's own. */
export const webTransport: Transport = {
  async send(request: Request) {
    switch (request.type) {
      case 'clipboard/copied':
        clearClipboardLater();
        return { ok: true, value: undefined };
      case 'vault/lock':
        await lock();
        return { ok: true, value: undefined };
      // Activity is the page's to watch (lock.ts); nothing here fills a page, saves from one or asks for a rating.
      case 'activity':
        return { ok: true, value: undefined };
      case 'page/info':
        return { ok: true, value: { site: null, url: null, loginIds: [] } };
      case 'pending/view':
        return { ok: true, value: null };
      case 'rating/view':
        return { ok: true, value: { ask: false } };
      default:
        return call(request);
    }
  },
  onChanged,
};
