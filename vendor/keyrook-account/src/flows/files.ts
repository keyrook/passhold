/**
 * Keeping a file. The server says where; the bytes go straight
 * to the store, sealed before they leave, and a product keeps what `uploadFile`
 * returns in its own sealed record. The server never sees that key, so nothing
 * it or the store hands back opens unless it is what was sealed.
 */
import { openFile, sealedFileSize, sealFile } from '../keys/file.js';
import type { Fetcher, HttpSyncAdapter } from '../sync/http.js';
import { newId } from '../util/id.js';

export interface StoredFile {
  id: string;
  /** What opens it. For the product's own sealed record, and nowhere else. */
  key: string;
  /** Its size as the person knows it, before sealing. */
  size: number;
}

/**
 * Seals `bytes` and puts them in the store: an account's, or with `collection`
 * a family's. Whatever goes wrong after the server made room gives the room
 * back, so a failed upload takes none of what the person's plan holds.
 */
export async function uploadFile(
  api: HttpSyncAdapter,
  input: { bytes: Uint8Array; collection?: { orgId: string; collectionId: string } },
  transfer: Fetcher = fetch,
): Promise<StoredFile> {
  const id = newId();
  const size = sealedFileSize(input.bytes.length);
  const { key, sealed } = await sealFile(id, input.bytes);
  const { url } = await api.beginFile({ id, size, ...input.collection });
  try {
    const sent = await transfer(url, { method: 'PUT', body: sealed as BodyInit });
    if (!sent.ok) throw new Error('The file could not be sent. Try again.');
    await api.finishFile(id);
  } catch (error) {
    await api.deleteFile(id).catch(() => undefined);
    throw error;
  }
  return { id, key, size: input.bytes.length };
}

/** Fetches a file and opens it, refusing whatever is not what was sealed under that id and key. */
export async function downloadFile(api: HttpSyncAdapter, file: { id: string; key: string }, transfer: Fetcher = fetch): Promise<Uint8Array> {
  return fetchAndOpen(await api.fileAddress(file.id), file, transfer);
}

/**
 * As `downloadFile`, for an emergency contact: one of the grantor's files,
 * named with its key in a record of theirs this product opened. What opens
 * is what the grantor sealed under that id, or nothing.
 */
export async function downloadEmergencyFile(api: HttpSyncAdapter, grantId: string, file: { id: string; key: string }, transfer: Fetcher = fetch): Promise<Uint8Array> {
  return fetchAndOpen(await api.emergencyFileAddress(grantId, file.id), file, transfer);
}

async function fetchAndOpen(address: { url: string }, file: { id: string; key: string }, transfer: Fetcher): Promise<Uint8Array> {
  const answer = await transfer(address.url, { method: 'GET' });
  if (!answer.ok) throw new Error('The file could not be fetched. Try again.');
  return openFile(file.id, file.key, new Uint8Array(await answer.arrayBuffer()));
}
