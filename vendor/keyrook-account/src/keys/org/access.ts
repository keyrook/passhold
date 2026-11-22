/**
 * View only, per collection: a write key for each generation of a collection
 * that has it, and the access box that hands it over.
 *
 * A collection's key is AES: whoever holds it can seal a record as well as
 * open one, so the server refusing a viewer's push would be the server's word
 * alone. A generation with a write key has every record, every deletion and
 * the list of who holds it signed with the key's private half, which only
 * those who may edit hold; every device checks each signature with the public
 * half it took from its own access box, and sets aside whatever does not
 * check out, as it does a record that does not open.
 *
 * The access box is authenticated from the sender's member key, as a
 * collection box is, so the public half comes from someone the device pinned,
 * never from the server. A device takes one only from an organiser.
 */
import { DecryptionError, type SealedBox } from '../../crypto/aead.js';
import { importDataKey } from '../../crypto/aead.js';
import { transcript } from '../../crypto/ecdh.js';
import { fromBase64, fromUtf8, toBase64, utf8, wipe } from '../../util/bytes.js';
import type { OrgCollection } from '../../sync/protocol.js';
import { openAuthBox, sealAuthBox, type AuthBox, type KeyBoxRecipient, type KeyBoxSender } from './authbox.js';
import { openCollectionKey, openCollectionMembers, sealCollectionHolders, sealCollectionKey, type CollectionPlace, type OrgRecordPlace } from './collection.js';
import { COLLECTION_ACCESS_BOX_INFO, collectionAccessAad, collectionHoldersAad, ORG_RECORD_SIGNATURE, orgRecordAad, orgTombstoneAad } from './labels.js';

const ECDSA: EcKeyImportParams = { name: 'ECDSA', namedCurve: 'P-256' };
const SIGN: EcdsaParams = { name: 'ECDSA', hash: 'SHA-256' };
/** An uncompressed P-256 point. */
const PUBLIC_BYTES = 65;
/** A P-256 signature as WebCrypto writes it: r then s. */
const SIGNATURE_BYTES = 64;

/** A generation's write key: its public half, which everyone holds, and its private half, which those who may edit hold. */
export interface WriteKey {
  /** The uncompressed point, base64. */
  publicKey: string;
  verify: CryptoKey;
  /** Null for someone who may only view. */
  sign: CryptoKey | null;
}

/** What an access box holds: the collection's key, and its write key. */
export interface CollectionAccess {
  key: CryptoKey;
  write: WriteKey;
}

/** A sealed box with its signature beside it, as a generation with a write key keeps every box. */
export type SignedBox = SealedBox & { sig: string };

/** A new write key, made by an organiser's device with a generation's collection key. */
export async function newWriteKey(): Promise<WriteKey> {
  const pair = await crypto.subtle.generateKey(ECDSA, true, ['sign', 'verify']);
  const publicKey = toBase64(new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey)));
  return { publicKey, verify: pair.publicKey, sign: pair.privateKey };
}

async function importVerify(publicKey: string): Promise<CryptoKey> {
  let raw: Uint8Array;
  try {
    raw = fromBase64(publicKey);
  } catch {
    throw new DecryptionError('Malformed write key.');
  }
  if (raw.length !== PUBLIC_BYTES || raw[0] !== 0x04) throw new DecryptionError('Malformed write key.');
  try {
    return await crypto.subtle.importKey('raw', raw as BufferSource, ECDSA, true, ['verify']);
  } catch {
    throw new DecryptionError('Malformed write key.');
  }
}

/**
 * A collection's key of `place.generation` and its write key, from an
 * organiser to one member: the private half only when `write.sign` is given,
 * for someone who may edit.
 */
export async function sealCollectionAccess(collectionKey: CryptoKey, write: WriteKey, from: KeyBoxSender, place: CollectionPlace, canEdit: boolean): Promise<AuthBox> {
  if (canEdit && !write.sign) throw new Error('Only someone who may edit this vault can let another edit it.');
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', collectionKey));
  const pkcs8 = canEdit ? new Uint8Array(await crypto.subtle.exportKey('pkcs8', write.sign!)) : null;
  const body = utf8(JSON.stringify({ key: toBase64(raw), write: write.publicKey, ...(pkcs8 ? { sign: toBase64(pkcs8) } : {}) }));
  try {
    return await sealAuthBox(from.sender, from.recipientKey, body, COLLECTION_ACCESS_BOX_INFO, collectionAccessAad(place.orgId, place.collectionId, place.generation, from.senderId, from.recipientId));
  } finally {
    wipe(raw);
    if (pkcs8) wipe(pkcs8);
    wipe(body);
  }
}

/**
 * Opens an access box as from `to.senderId`, with the key the pinned roster
 * lists for them. A private half that is not the public half's, or a box of
 * any other kind, fails as a `DecryptionError`.
 */
export async function openCollectionAccess(box: AuthBox, to: KeyBoxRecipient, place: CollectionPlace): Promise<CollectionAccess> {
  const opened = await openAuthBox(
    to.recipient,
    to.senderKey,
    box,
    COLLECTION_ACCESS_BOX_INFO,
    collectionAccessAad(place.orgId, place.collectionId, place.generation, to.senderId, to.recipientId),
  );
  let body: { key?: unknown; write?: unknown; sign?: unknown };
  try {
    body = JSON.parse(fromUtf8(opened)) as typeof body;
  } catch {
    throw new DecryptionError('That box does not hold a key.');
  } finally {
    wipe(opened);
  }
  if (typeof body.key !== 'string' || typeof body.write !== 'string' || (body.sign !== undefined && typeof body.sign !== 'string')) {
    throw new DecryptionError('That box does not hold a key.');
  }
  const raw = fromBase64(body.key);
  if (raw.length !== 32) throw new DecryptionError('That box does not hold a key.');
  wipe(raw);
  const key = await importDataKey(body.key);
  const verify = await importVerify(body.write);
  let sign: CryptoKey | null = null;
  if (typeof body.sign === 'string') {
    try {
      sign = await crypto.subtle.importKey('pkcs8', fromBase64(body.sign) as BufferSource, ECDSA, true, ['sign']);
    } catch {
      throw new DecryptionError('Malformed write key.');
    }
    // A private half for another key would sign what nobody here accepts: refused now, not found later.
    const probe = utf8('keyrook write key check');
    if (!(await crypto.subtle.verify(SIGN, verify, await crypto.subtle.sign(SIGN, sign, probe as BufferSource), probe as BufferSource))) {
      throw new DecryptionError('Malformed write key.');
    }
  }
  return { key, write: { publicKey: body.write, verify, sign } };
}

/** What a write key signs: the label, the box's associated data, and the box, each field length-prefixed. */
const signed = (aad: Uint8Array, box: SealedBox) => transcript(ORG_RECORD_SIGNATURE, fromUtf8(aad), box.iv, box.ct);

async function signBox(write: WriteKey, box: SealedBox, aad: Uint8Array): Promise<SignedBox> {
  if (!write.sign) throw new Error('You can view this vault, not change it.');
  const sig = new Uint8Array(await crypto.subtle.sign(SIGN, write.sign, signed(aad, box) as BufferSource));
  return { iv: box.iv, ct: box.ct, sig: toBase64(sig) };
}

async function checkBox(write: Pick<WriteKey, 'verify'>, box: SealedBox, aad: Uint8Array): Promise<void> {
  const sig = (box as Partial<SignedBox>).sig;
  if (typeof sig !== 'string') throw new DecryptionError('That record is not signed by anyone who may edit this vault.');
  let bytes: Uint8Array;
  try {
    bytes = fromBase64(sig);
  } catch {
    throw new DecryptionError('That record is not signed by anyone who may edit this vault.');
  }
  if (bytes.length !== SIGNATURE_BYTES || !(await crypto.subtle.verify(SIGN, write.verify, bytes as BufferSource, signed(aad, box) as BufferSource))) {
    throw new DecryptionError('That record is not signed by anyone who may edit this vault.');
  }
}

/** A record's box, or its deletion's, signed for the place it is sealed for. */
export async function signOrgRecord(write: WriteKey, box: SealedBox, place: OrgRecordPlace, deleted: boolean): Promise<SignedBox> {
  return signBox(write, box, recordAad(place, deleted));
}

/** Checks a record's or a deletion's signature before it is opened. One missing, or for any other place, fails as a `DecryptionError`. */
export async function checkOrgRecord(write: Pick<WriteKey, 'verify'>, box: SealedBox, place: OrgRecordPlace, deleted: boolean): Promise<void> {
  await checkBox(write, box, recordAad(place, deleted));
}

/** Who holds a collection, its sealed list signed for its generation. */
export async function signCollectionHolders(write: WriteKey, box: SealedBox, place: CollectionPlace): Promise<SignedBox> {
  return signBox(write, box, collectionHoldersAad(place.orgId, place.collectionId, place.generation));
}

export async function checkCollectionHolders(write: Pick<WriteKey, 'verify'>, box: SealedBox, place: CollectionPlace): Promise<void> {
  await checkBox(write, box, collectionHoldersAad(place.orgId, place.collectionId, place.generation));
}

const recordAad = (place: OrgRecordPlace, deleted: boolean) =>
  (deleted ? orgTombstoneAad : orgRecordAad)(place.orgId, place.collectionId, place.generation, place.id, place.rev);

/** What a device holds of one generation of a collection: its key, and its write key where view only is on. */
export interface HeldGeneration {
  key: CryptoKey;
  write: WriteKey | null;
}

/**
 * Opens one key box of a collection: an access box, when it comes from an
 * organiser or the device's own account, else a collection box. Null when
 * neither opens: an access box from anyone else is never taken, so a viewer
 * cannot hand out a write key of their own making.
 */
export async function openCollectionGeneration(box: AuthBox, to: KeyBoxRecipient, place: CollectionPlace, fromOrganiser: boolean): Promise<HeldGeneration | null> {
  if (fromOrganiser) {
    try {
      const access = await openCollectionAccess(box, to, place);
      return { key: access.key, write: access.write };
    } catch (error) {
      if (!(error instanceof DecryptionError)) throw error;
    }
  }
  try {
    return { key: await openCollectionKey(box, to, place), write: null };
  } catch (error) {
    if (error instanceof DecryptionError) return null;
    throw error;
  }
}

/** The box that lets `from.recipientId` into one generation: an access box where it has a write key, a collection box where it has none. */
export async function sealCollectionGeneration(held: HeldGeneration, from: KeyBoxSender, place: CollectionPlace, canEdit: boolean): Promise<AuthBox> {
  return held.write ? sealCollectionAccess(held.key, held.write, from, place, canEdit) : sealCollectionKey(held.key, from, place);
}

/** Who holds a generation, sealed under its key, and where it has a write key, with who may only view, signed. */
export async function sealCollectionMembers(held: HeldGeneration, holders: string[], place: CollectionPlace, viewers: string[]): Promise<SealedBox> {
  if (!held.write) return sealCollectionHolders(held.key, holders, place);
  return signCollectionHolders(held.write, await sealCollectionHolders(held.key, holders, place, viewers), place);
}

/**
 * Who holds a collection's generation in use and who may only view it, from
 * its sealed list; where it has a write key, only a list its signature checks
 * out for, and one that names its viewers. Null when there is no such list.
 */
export async function openCollectionMembersOf(
  held: HeldGeneration,
  orgId: string,
  collection: Pick<OrgCollection, 'id' | 'generation' | 'holdersBox'>,
): Promise<{ holders: string[]; viewers: string[] } | null> {
  if (!collection.holdersBox) return null;
  const box = collection.holdersBox as unknown as SealedBox;
  const place = { orgId, collectionId: collection.id, generation: collection.generation };
  try {
    if (held.write) await checkCollectionHolders(held.write, box, place);
    const members = await openCollectionMembers(held.key, box, place);
    if (held.write && members.viewers === null) return null;
    return { holders: members.holders, viewers: members.viewers ?? [] };
  } catch {
    return null;
  }
}
