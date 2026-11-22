/**
 * A file kept with an item, moved by the page its owner is looking at.
 *
 * The page reads the file and runs the account's own flows on it
 * (@passhold/core, account/files.ts): sealed here before a byte leaves,
 * opened here, and refused unless it is what was sealed. The bytes go
 * straight to the store and back — a message to the service worker carries
 * JSON, and a file is hundreds of megabytes — while every call to the
 * account goes through the service worker, which holds the session and
 * decides which item, and which vault's store, a file is for.
 */
import { DecryptionError } from '@keyrook/account';
import { fetchFile, fileFits, isPassholdError, storeFile, type Attachment, type FileCalls } from '@passhold/core';
import { accountSentenceKey } from '../background/sentences.js';
import type { MessageKey } from '../i18n/locales/en.js';
import { BackgroundError, send } from '../lib/messaging.js';

/** The account's calls for a file of this item, made by the service worker as this vault's session. */
function callsFor(itemId: string): FileCalls {
  return {
    beginFile: ({ id, size }) => send({ type: 'files/begin', itemId, id, size }),
    // What the store took is the service worker's to keep; the flow only waits for it.
    finishFile: async (id) => (await send({ type: 'files/finish', id })) as never,
    deleteFile: (id) => send({ type: 'files/cancel', id }),
  };
}

/**
 * What went wrong in this page's half, in a key a page can say: the service
 * worker's half says its own. `unreached`: what a request that never reached
 * the store means here — offline, or a store this build may not reach.
 */
export function said(error: unknown, unreached: MessageKey): BackgroundError {
  if (error instanceof BackgroundError) return error;
  const as = (key: MessageKey) => new BackgroundError(error instanceof Error ? error.message : String(error), key);
  // A seal that does not open: what came back is not what was added.
  if (error instanceof DecryptionError || (error instanceof Error && error.name === 'DecryptionError')) return as('error.fileWrong');
  if (isPassholdError(error)) return as(`error.${error.code}` as MessageKey);
  const known = error instanceof Error ? accountSentenceKey(error.message) : undefined;
  if (known) return as(known);
  if (error instanceof TypeError) return as(unreached);
  return as('error.unknown');
}

/** A file chosen from this computer, sealed, put in the account and named in the item. */
export async function attachChosen(itemId: string, chosen: File): Promise<void> {
  // Said before a byte is read: a person waits for nothing the account would refuse.
  if (!fileFits(chosen.size)) throw new BackgroundError('fileTooLarge', 'error.fileTooLarge');
  try {
    const bytes = new Uint8Array(await chosen.arrayBuffer());
    // Where it is kept — this account's, or a family's — is the service worker's to say, from where the item is.
    const added: Attachment = await storeFile(callsFor(itemId), { bytes, name: chosen.name, type: chosen.type, place: null });
    await send({ type: 'files/attach', id: added.id, key: added.key, name: added.name, fileType: added.type, size: added.size });
  } catch (error) {
    throw said(error, 'error.fileFailed');
  }
}

/** A file an item names, fetched and opened here. */
export async function openAttachment(itemId: string, fileId: string): Promise<{ file: Attachment; bytes: Uint8Array }> {
  try {
    const opened = await send({ type: 'files/open', itemId, fileId });
    const bytes = await fetchFile(async () => ({ url: opened.url, size: opened.file.size, expiresAt: opened.expiresAt }), opened.file);
    return { file: opened.file, bytes };
  } catch (error) {
    throw said(error, 'error.fileFetch');
  }
}

/**
 * Handed to the browser to save, under its own name. Its type is never the
 * one it came with: a page of Passhold's own does not open a file as HTML.
 */
export function saveFile(file: Pick<Attachment, 'name'>, bytes: Uint8Array): void {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/octet-stream' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name || 'file';
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  // Long enough for the browser to have taken it.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Pictures a page may show as an image: drawn, never run. A vector picture can hold script, and is saved instead. */
const PICTURES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif', 'image/bmp']);
const TEXT_NAMES = /\.(txt|text|md|csv|tsv|json|log|ini|cfg|conf|yaml|yml|toml|env|pem|pub|asc)$/i;
/** Shown here only up to this: a larger one is saved, and opened where it belongs. */
export const SHOWN_PICTURE = 20 * 1024 * 1024;
export const SHOWN_TEXT = 1024 * 1024;

/** How a page may show a file, if at all: a picture as an image, text as text — never as a page of its own. */
export function shownAs(file: Pick<Attachment, 'name' | 'type' | 'size'>): 'picture' | 'text' | null {
  if (PICTURES.has(file.type)) return file.size <= SHOWN_PICTURE ? 'picture' : null;
  const text = file.type.startsWith('text/') || file.type === 'application/json' || (!file.type && TEXT_NAMES.test(file.name));
  return text && file.size <= SHOWN_TEXT ? 'text' : null;
}

/** A picture as an image source this page's policy allows (`img-src data:`): nothing leaves the page for it. */
export function pictureSource(file: Pick<Attachment, 'type'>, bytes: Uint8Array): string {
  let binary = '';
  for (let at = 0; at < bytes.length; at += 0x8000) binary += String.fromCharCode(...bytes.subarray(at, at + 0x8000));
  return `data:${file.type};base64,${btoa(binary)}`;
}

/** A file's size in the reader's language. */
export function sizeText(size: number, locale: string): string {
  const [unit, by] =
    size >= 1024 ** 3 ? (['gigabyte', 1024 ** 3] as const) : size >= 1024 ** 2 ? (['megabyte', 1024 ** 2] as const) : size >= 1024 ? (['kilobyte', 1024] as const) : (['byte', 1] as const);
  // Bytes in words ("46 bytes"): their short form is a bare letter, or the word unbent.
  return new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: unit === 'byte' ? 'long' : 'short', maximumFractionDigits: unit === 'byte' || size / by >= 10 ? 0 : 1 }).format(size / by);
}
