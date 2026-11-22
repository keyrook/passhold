/**
 * Emergency access between any two accounts: a contact key per account, the
 * code two people compare once, what each side pins, and the product keys one
 * hands the other.
 *
 * A contact key is an ECDH P-256 pair, as a member key is. Its private half
 * is sealed to the account's root, and under each product's key so that
 * product's devices use it without asking for the password. Its public half
 * sits on the server, and is taken from there only once two people compared
 * the code made from both halves; from then on each side's own pin, sealed
 * under its own product's key, says whose key it is.
 *
 * What is handed over is a product's key, never the root: the contact reads
 * that product's data and can change nothing of the account. Each key goes in
 * an authenticated box from the grantor's contact key to the contact's, so it
 * opens for that contact alone, and only as from the grantor whose key the
 * contact pinned. A server holds no contact key's private half, so it can
 * make none of these boxes.
 */
import { DecryptionError, open, openJson, seal, sealJson, type SealedBox } from '../crypto/aead.js';
import { CURVE, importPublicPoint, publicPointOf, transcript } from '../crypto/ecdh.js';
import { toBase64, utf8, wipe } from '../util/bytes.js';
import { crockfordEncode, group } from '../util/crockford.js';
import { openKeyFromAuthBox, sealKeyInAuthBox, type AuthBox } from './org/authbox.js';
import { assertAccountId, assertProductName } from './product.js';
import type { AccountRoot } from './root.js';

/** HKDF info: a contact key's private half sealed to its owner's root. */
export const CONTACT_ROOT_BOX_INFO = 'keyrook:v1:contact-root-box';
/** The first field of the transcript the contact code is the digest of. */
export const CONTACT_CONFIRM = 'keyrook:v1:contact-confirm';
/** HKDF info: a product's key handed to an emergency contact. */
export const EMERGENCY_KEY_BOX_INFO = 'keyrook:v1:emergency-key-box';

/** What a contact key is sealed under: its owner's root, or a product's key. */
export type ContactKeyUnder = 'root' | string;

/** AAD of a contact key's private half, under the root or under one product's key. */
export function contactKeyAad(accountId: string, under: ContactKeyUnder): Uint8Array {
  assertAccountId(accountId);
  // A product named `root` would read as the root's box: no product may be.
  if (under !== 'root') assertProductName(under);
  return utf8(`keyrook.contact-key:v1:${accountId}:${under}`);
}

/** AAD of one side's pin of the other's contact key, under one of its own products' keys. */
export function contactPinAad(accountId: string, contactId: string, product: string): Uint8Array {
  assertAccountId(accountId);
  assertAccountId(contactId);
  assertProductName(product);
  if (accountId === contactId) throw new Error('A contact is someone else.');
  return utf8(`keyrook.contact-pin:v1:${accountId}:${contactId}:${product}`);
}

/** AAD of a product's key handed from a grantor to their contact. */
export function emergencyKeyAad(grantorId: string, contactId: string, product: string): Uint8Array {
  assertAccountId(grantorId);
  assertAccountId(contactId);
  assertProductName(product);
  if (grantorId === contactId) throw new Error('A contact is someone else.');
  return utf8(`keyrook.emergency-key:v1:${grantorId}:${contactId}:${product}`);
}

/** AAD of a grantor's product key as the contact's device keeps it, under the contact's own product key. */
export function emergencyHeldAad(contactId: string, grantorId: string, product: string): Uint8Array {
  assertAccountId(contactId);
  assertAccountId(grantorId);
  assertProductName(product);
  if (grantorId === contactId) throw new Error('A contact is someone else.');
  return utf8(`keyrook.emergency-held:v1:${contactId}:${grantorId}:${product}`);
}

export interface ContactKey {
  /** Extractable, so it can be sealed again under another product's key. Never stored as it is. */
  privateKey: CryptoKey;
  /** The raw public point, base64: what the server holds and the other side pins. */
  publicKey: string;
}

/** A contact key's private half sealed to the owner's root, with an ephemeral key. */
export interface ContactRootBox {
  epk: string;
  iv: string;
  ct: string;
}

/** A new contact key, made the first time an account names or accepts a contact. */
export async function newContactKey(): Promise<ContactKey> {
  const pair = await crypto.subtle.generateKey(CURVE, true, ['deriveBits']);
  return { privateKey: pair.privateKey, publicKey: await publicPointOf(pair.privateKey) };
}

/** Checks a contact key's public half, from the server or a pin, is a point on the curve. */
export async function assertContactPublicKey(publicKey: string): Promise<void> {
  if (typeof publicKey !== 'string' || !(await importPublicPoint(publicKey))) throw new Error('Malformed contact key.');
}

async function rootBoxKey(privateKey: CryptoKey, peer: string, epk: string, root: string): Promise<CryptoKey> {
  const point = await importPublicPoint(peer);
  if (!point) throw new Error('Malformed account key.');
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: point }, privateKey, 256);
  const material = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: transcript(epk, root) as BufferSource, info: utf8(CONTACT_ROOT_BOX_INFO) as BufferSource },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function sealPrivateHalf(contact: ContactKey, key: CryptoKey, aad: Uint8Array): Promise<SealedBox> {
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', contact.privateKey));
  try {
    return await seal(key, pkcs8, aad);
  } finally {
    wipe(pkcs8);
  }
}

async function openPrivateHalf(box: SealedBox, key: CryptoKey, aad: Uint8Array): Promise<ContactKey> {
  const pkcs8 = await open(key, box, aad);
  try {
    const privateKey = await crypto.subtle.importKey('pkcs8', pkcs8 as BufferSource, CURVE, true, ['deriveBits']);
    // The public half comes from what opened, never from the server.
    return { privateKey, publicKey: await publicPointOf(privateKey) };
  } catch (error) {
    if (error instanceof DecryptionError) throw error;
    throw new DecryptionError('That is not a contact key.');
  } finally {
    wipe(pkcs8);
  }
}

/** Seals a contact key's private half to the owner's root: only the root's public half is needed. */
export async function sealContactKeyToRoot(contact: ContactKey, rootPublicKey: string, accountId: string): Promise<ContactRootBox> {
  const aad = contactKeyAad(accountId, 'root');
  const ephemeral = await crypto.subtle.generateKey(CURVE, false, ['deriveBits']);
  const epk = toBase64(new Uint8Array(await crypto.subtle.exportKey('raw', ephemeral.publicKey)));
  const key = await rootBoxKey(ephemeral.privateKey, rootPublicKey, epk, rootPublicKey);
  return { epk, ...(await sealPrivateHalf(contact, key, aad)) };
}

/** Opens a contact key with the owner's root. One for another root or account fails as a `DecryptionError`. */
export async function openContactKeyWithRoot(box: ContactRootBox, root: AccountRoot, accountId: string): Promise<ContactKey> {
  const aad = contactKeyAad(accountId, 'root');
  let key: CryptoKey;
  try {
    key = await rootBoxKey(root.privateKey, box.epk, box.epk, root.publicKey);
  } catch {
    throw new DecryptionError('That contact key was not sealed to this account.');
  }
  return openPrivateHalf(box, key, aad);
}

function underProduct(accountId: string, product: string): Uint8Array {
  if (product === 'root') throw new Error('Not a Keyrook product name.');
  return contactKeyAad(accountId, product);
}

/** Seals a contact key's private half under a product's key, for that product's devices. */
export async function sealContactKeyUnderProduct(contact: ContactKey, productKey: CryptoKey, accountId: string, product: string): Promise<SealedBox> {
  return sealPrivateHalf(contact, productKey, underProduct(accountId, product));
}

/** Opens a contact key with a product's key. One for another product or account fails as a `DecryptionError`. */
export async function openContactKeyWithProduct(box: SealedBox, productKey: CryptoKey, accountId: string, product: string): Promise<ContactKey> {
  return openPrivateHalf(box, productKey, underProduct(accountId, product));
}

/** One side of a contact: an account and its contact key's public half. */
export interface ContactParty {
  accountId: string;
  contactKey: string;
}

/**
 * The code two people compare once: fifteen Crockford characters, the digest
 * of both accounts and both contact keys, in account order, so either screen
 * makes the same one. A server that swapped either key shows two codes that
 * differ. Seventy-five bits, as a family's join code has, so the server cannot
 * search for a key of its own that gives the same code.
 */
export async function contactCode(one: ContactParty, other: ContactParty): Promise<string> {
  assertAccountId(one.accountId);
  assertAccountId(other.accountId);
  if (one.accountId === other.accountId) throw new Error('A contact is someone else.');
  await assertContactPublicKey(one.contactKey);
  await assertContactPublicKey(other.contactKey);
  const [first, second] = one.accountId < other.accountId ? [one, other] : [other, one];
  const digest = new Uint8Array(
    await crypto.subtle.digest(
      'SHA-256',
      transcript(CONTACT_CONFIRM, first.accountId, first.contactKey, second.accountId, second.contactKey) as BufferSource,
    ),
  );
  return group(crockfordEncode(digest.subarray(0, 10)).slice(0, 15), 5);
}

/** What one side keeps of the other once the code matched, or was skipped. */
export interface ContactPin {
  /** The other side's contact key, as it was when the two compared. */
  contactKey: string;
  /** Whether the two compared the code, or confirmed without it. */
  compared: boolean;
}

/** Seals a pin of `contactId`'s key under one of the owner's products' keys. */
export async function sealContactPin(productKey: CryptoKey, pin: ContactPin, accountId: string, contactId: string, product: string): Promise<SealedBox> {
  await assertContactPublicKey(pin.contactKey);
  return sealJson(productKey, { contactKey: pin.contactKey, compared: pin.compared === true }, contactPinAad(accountId, contactId, product));
}

/** Opens a pin. One for another account, contact or product, or under another key, fails as a `DecryptionError`. */
export async function openContactPin(productKey: CryptoKey, box: SealedBox, accountId: string, contactId: string, product: string): Promise<ContactPin> {
  const pin = await openJson<{ contactKey?: unknown; compared?: unknown }>(productKey, box, contactPinAad(accountId, contactId, product));
  if (typeof pin?.contactKey !== 'string' || typeof pin.compared !== 'boolean') throw new Error('Malformed contact pin.');
  await assertContactPublicKey(pin.contactKey);
  return { contactKey: pin.contactKey, compared: pin.compared };
}

/** The grantor's side of a handover: their contact key, and the contact's from their pin. */
export interface EmergencySender {
  grantor: ContactKey;
  grantorId: string;
  /** From the grantor's pin of the contact, never from the server. */
  contactKey: string;
  contactId: string;
}

/** The contact's side: their contact key, and the grantor's from their pin. */
export interface EmergencyRecipient {
  contact: ContactKey;
  contactId: string;
  /** From the contact's pin of the grantor, never from the server. */
  grantorKey: string;
  grantorId: string;
}

/** A product's key, sealed from the grantor's contact key to the contact's, for that product alone. */
export async function sealEmergencyKey(productKey: CryptoKey, from: EmergencySender, product: string): Promise<AuthBox> {
  return sealKeyInAuthBox(
    productKey,
    { sender: from.grantor, senderId: from.grantorId, recipientKey: from.contactKey, recipientId: from.contactId },
    EMERGENCY_KEY_BOX_INFO,
    emergencyKeyAad(from.grantorId, from.contactId, product),
  );
}

/**
 * Opens a product's key handed over, as from the grantor's pinned contact
 * key. One for anyone else, from anyone else, for another product, or
 * tampered with, fails as a `DecryptionError`.
 */
export async function openEmergencyKey(box: AuthBox, to: EmergencyRecipient, product: string): Promise<CryptoKey> {
  return openKeyFromAuthBox(
    box,
    { recipient: to.contact, recipientId: to.contactId, senderKey: to.grantorKey, senderId: to.grantorId },
    EMERGENCY_KEY_BOX_INFO,
    emergencyKeyAad(to.grantorId, to.contactId, product),
  );
}

/** A grantor's product key as the contact's device keeps it, under the contact's own product key. */
export async function sealHeldEmergencyKey(ownProductKey: CryptoKey, grantorKey: CryptoKey, contactId: string, grantorId: string, product: string): Promise<SealedBox> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', grantorKey));
  try {
    return await seal(ownProductKey, raw, emergencyHeldAad(contactId, grantorId, product));
  } finally {
    wipe(raw);
  }
}

/**
 * How a product draws the key its records are sealed under from its product
 * key, when it does not seal under the product key itself: HKDF-SHA256 with
 * this salt and info, to an AES-GCM key of 256 bits.
 */
export interface KeyDrawing {
  salt: Uint8Array;
  info: string;
}

async function openHeldRaw<T>(ownProductKey: CryptoKey, box: SealedBox, contactId: string, grantorId: string, product: string, use: (raw: Uint8Array) => Promise<T>): Promise<T> {
  const raw = await open(ownProductKey, box, emergencyHeldAad(contactId, grantorId, product));
  try {
    if (raw.length !== 32) throw new DecryptionError('That is not a product key.');
    return await use(raw);
  } finally {
    wipe(raw);
  }
}

/** Opens what `sealHeldEmergencyKey` kept. Not extractable: the contact reads with it, and seals nothing for anyone. */
export async function openHeldEmergencyKey(ownProductKey: CryptoKey, box: SealedBox, contactId: string, grantorId: string, product: string): Promise<CryptoKey> {
  return openHeldRaw(ownProductKey, box, contactId, grantorId, product, (raw) =>
    crypto.subtle.importKey('raw', raw as BufferSource, { name: 'AES-GCM' }, false, ['decrypt']),
  );
}

/**
 * Opens what `sealHeldEmergencyKey` kept as the key the grantor's product
 * draws from it, for a product whose records are sealed under a drawn key.
 * The bytes never leave this function, and what it gives back is as
 * `openHeldEmergencyKey`'s: not extractable, and it only decrypts.
 */
export async function openHeldEmergencyKeyDrawn(
  ownProductKey: CryptoKey,
  box: SealedBox,
  contactId: string,
  grantorId: string,
  product: string,
  drawing: KeyDrawing,
): Promise<CryptoKey> {
  return openHeldRaw(ownProductKey, box, contactId, grantorId, product, async (raw) => {
    const base = await crypto.subtle.importKey('raw', raw as BufferSource, 'HKDF', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: drawing.salt as BufferSource, info: utf8(drawing.info) as BufferSource },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );
  });
}
