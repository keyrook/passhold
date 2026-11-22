/**
 * Sending text, a copy of an item or files by a link (`keys/send.ts`), and
 * opening one. The sender's app seals everything here, before anything
 * leaves; the page that opens a link does the rest here too, with the
 * secret from the fragment and the password the person types, and nothing
 * else.
 */
import { DecryptionError } from '../crypto/aead.js';
import { openFile, sealedFileSize, sealFile } from '../keys/file.js';
import { newSendLink, openSendBody, sealSendBody, sendAccessHash, sendKeys, sendLinkUrl, type SendBody, type SendFile, type SendLink } from '../keys/send.js';
import { openSendRemote, reportSendRemote, type Fetcher, type HttpSyncAdapter } from '../sync/http.js';
import type { SendView } from '../sync/protocol.js';
import { newId } from '../util/id.js';
import { boxFrom, wire } from './wire.js';

/** Where a link opens, unless a test or a development server says otherwise. */
export const SEND_PAGE = 'https://send.keyrook.com';

/**
 * Seals a Send and puts it on the server: the body, and each file under a
 * key of its own, which only the body holds. Returns the link, to show once:
 * nothing keeps it, here or on the server. Anything that fails after the
 * server took it deletes it again, so no half-made Send stays.
 */
export async function createSend(
  api: HttpSyncAdapter,
  input: {
    body: Omit<SendBody, 'files'>;
    files?: { name: string; type: string; bytes: Uint8Array }[];
    opens: number;
    /** In milliseconds. */
    lifetime: number;
    password?: string;
    page?: string;
  },
  transfer: Fetcher = fetch,
): Promise<{ url: string; send: SendView }> {
  const link = newSendLink(input.password !== undefined);
  const { contentKey, access } = await sendKeys(link, input.password);
  const sealed: { file: SendFile; bytes: Uint8Array }[] = [];
  for (const file of input.files ?? []) {
    const id = newId();
    const { key, sealed: bytes } = await sealFile(id, file.bytes);
    sealed.push({ file: { id, key, name: file.name, type: file.type, size: file.bytes.length }, bytes });
  }
  const box = await sealSendBody(contentKey, link.id, { ...input.body, ...(sealed.length ? { files: sealed.map(({ file }) => file) } : {}) });
  const created = await api.createSend({
    id: link.id,
    body: wire(box),
    accessHash: await sendAccessHash(access),
    opens: input.opens,
    lifetime: input.lifetime,
    files: sealed.map(({ file }) => ({ id: file.id, size: sealedFileSize(file.size) })),
  });
  let send = created.send;
  if (sealed.length) {
    try {
      for (const { file, bytes } of sealed) {
        const upload = created.uploads.find((entry) => entry.id === file.id);
        if (!upload) throw new Error('The file could not be sent. Try again.');
        const sent = await transfer(upload.url, { method: 'PUT', body: bytes as BodyInit });
        if (!sent.ok) throw new Error('The file could not be sent. Try again.');
      }
      send = await api.finishSend(link.id);
    } catch (error) {
      await api.deleteSend(link.id).catch(() => undefined);
      throw error;
    }
  }
  return { url: sendLinkUrl(input.page ?? SEND_PAGE, link), send };
}

/** A Send, opened: its body, and each file to fetch and open while its address lasts. */
export interface OpenedSend {
  body: SendBody;
  opensLeft: number;
  expiresAt: number;
  /** One of `body.files`, fetched and opened. */
  file(id: string): Promise<Uint8Array>;
}

/**
 * Opens a link: its keys from the secret and the password, one open counted
 * by the server against the token they make, and the body opened as bound
 * to this id. A wrong password, a link that ran out, or one that never was
 * are refused alike.
 */
export async function openSend(baseUrl: string, link: SendLink, password: string | undefined, fetcher: Fetcher = fetch, transfer: Fetcher = fetch): Promise<OpenedSend> {
  const { contentKey, access } = await sendKeys(link, password);
  const opened = await openSendRemote(baseUrl, link.id, access, fetcher);
  const body = await openSendBody(contentKey, link.id, boxFrom(opened.body));
  return {
    body,
    opensLeft: opened.opensLeft,
    expiresAt: opened.expiresAt,
    async file(id) {
      const known = body.files?.find((entry) => entry.id === id);
      const where = opened.files.find((entry) => entry.id === id);
      // A file the body does not name is the server's, and is not taken.
      if (!known || !where) throw new DecryptionError('That file is not part of this Send.');
      const answer = await transfer(where.url, { method: 'GET' });
      if (!answer.ok) throw new Error('The file could not be fetched. Try again.');
      return openFile(known.id, known.key, new Uint8Array(await answer.arrayBuffer()));
    },
  };
}

/** Reports a link, which stops it at once. */
export async function reportSend(baseUrl: string, link: SendLink, password: string | undefined, reason: string, fetcher: Fetcher = fetch): Promise<void> {
  const { access } = await sendKeys(link, password);
  await reportSendRemote(baseUrl, link.id, { access, reason }, fetcher);
}
