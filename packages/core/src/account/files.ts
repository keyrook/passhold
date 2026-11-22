/**
 * Files kept with items, in the Keyrook account, run as the account's flows
 * run them: `uploadFile` seals a
 * file under a key made for it alone before a byte leaves, and
 * `downloadFile` refuses whatever is not what was sealed under that id and
 * key. Passhold keeps the key in the item's own sealed record
 * (vault/attachments.ts), and nothing the server or its store hands back
 * opens unless it is the file that was added.
 *
 * The plan is the server's to say: a plan that keeps no files refuses a new
 * one there, and one that has ended still reads and deletes what it holds —
 * nothing here deletes anything for a limit.
 */
import { DecryptionError, downloadFile, sealedFileSize, SyncHttpError, uploadFile, type Fetcher, type HttpSyncAdapter, type StoredFile } from '@keyrook/account';
import { PassholdError } from '../errors.js';
import type { VaultPlace } from '../vault/family.js';
import type { Attachment } from '../vault/model.js';

/**
 * The largest file the account keeps, as it is sealed (keyrook-account,
 * `MAX_FILE_BYTES`): 500 MiB, a little less of it the file's own. Refused
 * here before anything is sealed, so a person hears it before waiting.
 */
export const MAX_SEALED_FILE = 500 * 1024 * 1024;

/** Whether a file of `size` bytes is one the account keeps. */
export const fileFits = (size: number): boolean => Number.isSafeInteger(size) && size >= 0 && sealedFileSize(size) <= MAX_SEALED_FILE;

/**
 * The calls a file's flows make. A page that moves the bytes itself hands
 * them to the service worker, which holds the session: what it passes is
 * this, never the session.
 */
export type FileCalls = Pick<HttpSyncAdapter, 'beginFile' | 'finishFile' | 'deleteFile'>;

/** Where an item's files are kept: the account's own for the vault's, the family's collection for a shared vault's. */
export function fileCollection(place: VaultPlace | null): { orgId: string; collectionId: string } | undefined {
  return place ? { orgId: place.orgId, collectionId: place.vaultId } : undefined;
}

/** A file as an item names it, from what the store took. */
export function attachmentFor(stored: StoredFile, file: { name: string; type: string }, now = Date.now()): Attachment {
  return { id: stored.id, key: stored.key, name: file.name, type: file.type, size: stored.size, addedAt: now };
}

/**
 * Seals a file and puts it in the account, for an item in `place`: what the
 * item is to name, once the store holds it. A failed upload gives back the
 * room it took (`uploadFile`).
 */
export async function storeFile(
  api: FileCalls,
  file: { bytes: Uint8Array; name: string; type: string; place: VaultPlace | null },
  transfer: Fetcher = fetch,
  now = Date.now(),
): Promise<Attachment> {
  if (!fileFits(file.bytes.length)) throw new PassholdError('fileTooLarge');
  const collection = fileCollection(file.place);
  // The flow names the adapter's type; it calls these three, which are all a page is handed.
  const stored = await uploadFile(api as HttpSyncAdapter, { bytes: file.bytes, ...(collection ? { collection } : {}) }, transfer);
  return attachmentFor(stored, file, now);
}

/**
 * A file an item names, fetched and opened. Its seal binds every chunk to
 * this file's id, its place and how many there are; the size the item names,
 * sealed in its record, is checked besides, so a store that hands back
 * anything else is refused.
 */
export async function fetchFile(address: () => Promise<{ url: string; size: number; expiresAt: number }>, file: Pick<Attachment, 'id' | 'key' | 'size'>, transfer: Fetcher = fetch): Promise<Uint8Array> {
  const bytes = await downloadFile({ fileAddress: address } as unknown as HttpSyncAdapter, file, transfer);
  if (bytes.length !== file.size) throw new DecryptionError();
  return bytes;
}

/** A file deleted in the account. One the account no longer has is as good as deleted: an item that still named it says so no more. */
export async function deleteStoredFile(api: Pick<HttpSyncAdapter, 'deleteFile'>, id: string): Promise<void> {
  try {
    await api.deleteFile(id);
  } catch (error) {
    if (error instanceof SyncHttpError && error.status === 404) return;
    throw error;
  }
}
