/**
 * Between the page's world and Passhold, for websites' passkeys: the isolated
 * half of webauthn.ts, in the top frame, from the moment the page starts.
 *
 * It takes requests the page's world posts, asks the service worker, puts up
 * Passhold's frame when the person has a choice to make, and posts back how
 * the request ended. It holds no passkey and signs nothing: what it carries
 * back is what the site receives anyway. A message counts only if this very
 * window sent it — a frame inside the page posting to its parent does not
 * speak for the page — and where a request comes from is what Chrome tells
 * the service worker, never what any message says.
 */
import type { ContentRequest, ContentResponseFor, ToContent, WebAuthnOutcome } from '../lib/messaging.js';
import { Frame } from './overlay.js';

const SOURCE = 'passhold-webauthn';
const WIDTH = 366;

async function ask<R extends ContentRequest>(request: R): Promise<ContentResponseFor<R> | null> {
  try {
    const response = (await chrome.runtime.sendMessage(request)) as { ok: boolean; value: ContentResponseFor<R> } | undefined;
    return response?.ok ? response.value : null;
  } catch {
    // The extension was reloaded under this page: the browser answers, as without Passhold.
    return null;
  }
}

const post = (message: Record<string, unknown>) => window.postMessage({ source: SOURCE, ...message }, location.origin);

/** Passhold's frame for each request the person is choosing for, by the page's name for it. */
const frames = new Map<string, Frame>();

function settle(id: string, outcome: WebAuthnOutcome): void {
  frames.get(id)?.remove();
  frames.delete(id);
  post({ kind: 'result', id, outcome });
}

async function request(id: string, op: 'create' | 'get', options: unknown, conditional: boolean): Promise<void> {
  const start = await ask({ type: 'content/webauthn', id, op, options, conditional });
  if (!start) return settle(id, { type: 'fallback' });
  if ('outcome' in start) return settle(id, start.outcome);
  if ('dialog' in start) {
    frames.get(id)?.remove();
    const frame = new Frame('passkey.html', start.dialog.token, { width: WIDTH, height: start.dialog.height });
    frame.inCorner();
    frames.set(id, frame);
  }
  // Waiting quietly: the answer comes when the person picks a passkey in the list under a field.
}

window.addEventListener('message', (event) => {
  if (event.source !== window || event.origin !== location.origin) return;
  const data = event.data as { source?: unknown; kind?: unknown; id?: unknown; op?: unknown; options?: unknown; conditional?: unknown } | null;
  if (!data || data.source !== SOURCE || typeof data.id !== 'string' || data.id.length > 64) return;
  const id = data.id;
  if (data.kind === 'request' && (data.op === 'create' || data.op === 'get')) {
    void request(id, data.op, data.options, data.conditional === true);
  } else if (data.kind === 'cancel') {
    frames.get(id)?.remove();
    frames.delete(id);
    void ask({ type: 'content/webauthnCancel', id });
  } else if (data.kind === 'canAnswer') {
    void ask({ type: 'content/hello' }).then((hello) => post({ kind: 'answers', id, answers: Boolean(hello?.ready && hello.passkeys) }));
  }
});

chrome.runtime.onMessage.addListener((message: ToContent, sender) => {
  if (sender.id !== chrome.runtime.id) return false;
  if (message.type === 'ph/webauthn') settle(message.id, message.outcome);
  if (message.type === 'ph/passkeySize') frames.get(message.id)?.resize(message.height);
  return false;
});
