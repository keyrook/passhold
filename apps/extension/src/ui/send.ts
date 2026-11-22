/**
 * A Send of typed text and files, made by the page that read them: sealed
 * here by the account's own flow (@passhold/core, `sendTyped`) before a byte
 * leaves, the files put straight where the server says — a message to the
 * service worker carries JSON, and a file is hundreds of megabytes — while
 * every call to the account goes through the service worker, which holds the
 * session and asks the plan first.
 */
import { sendTyped, type SendCalls } from '@passhold/core';
import { send, type SentView } from '../lib/messaging.js';
import { said } from './attachments.js';

const calls: SendCalls = {
  createSend: (request) => send({ type: 'send/begin', send: request }),
  finishSend: (id) => send({ type: 'send/finish', id }),
  deleteSend: (id) => send({ type: 'send/cancel', id }),
};

/** The Send made, its link to show once; a failure in a key a page can say, the server's own words placed where it said them. */
export async function sendFromPage(input: { text: string; files: File[]; opens: number; lifetime: number; password?: string }): Promise<SentView> {
  try {
    const files = await Promise.all(input.files.map(async (file) => ({ name: file.name, type: file.type, bytes: new Uint8Array(await file.arrayBuffer()) })));
    const made = await sendTyped(calls, { text: input.text, files, opens: input.opens, lifetime: input.lifetime, ...(input.password ? { password: input.password } : {}), page: __KEYROOK_SEND_PAGE__ });
    return { url: made.url, opensLeft: made.send.opensLeft, expiresAt: made.send.expiresAt };
  } catch (error) {
    // A request that never reached the store: offline, or a store this build may not reach.
    throw said(error, input.files.length ? 'error.fileFailed' : 'error.sendFailed');
  }
}
