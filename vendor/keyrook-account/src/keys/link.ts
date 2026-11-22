/**
 * A link between two products of one account: a small store of its own, under
 * a key both products hold and nothing else does. Each product keeps its own
 * key, and nothing of one opens the other's records; what a person chooses
 * to share between them is copied into the link (the 2FA codes Passhold shows
 * beside a login, from Keyrook Authenticator).
 *
 * The link key is sealed under each product's key, bound to the account, the
 * link and that product, so a box opens for that product of that account
 * alone. Each record is bound to the account, the link, its id and its
 * revision, and a deletion under a label of its own: a server cannot move
 * one, hand back an older revision, or delete one.
 */
import { DecryptionError, importDataKey, openJson, sealJson, type SealedBox } from '../crypto/aead.js';
import { toBase64, utf8, wipe } from '../util/bytes.js';
import { assertAccountId, assertProductName } from './product.js';

/** A link's id: its two products' names, in order, joined by `+`. */
export function linkIdOf(one: string, other: string): string {
  assertProductName(one);
  assertProductName(other);
  if (one === other) throw new Error('A link is between two different apps.');
  return [one, other].sort().join('+');
}

/** The two products a link id names, or null for one that is not a link's. */
export function productsOfLink(link: string): [string, string] | null {
  const parts = link.split('+');
  if (parts.length !== 2) return null;
  try {
    return linkIdOf(parts[0]!, parts[1]!) === link ? [parts[0]!, parts[1]!] : null;
  } catch {
    return null;
  }
}

function assertLink(link: string): void {
  if (!productsOfLink(link)) throw new Error('Malformed link.');
}

/** Associated data of a link key under one product's key. Frozen, as every label is: a new format is a new label beside it. */
export function linkKeyAad(accountId: string, link: string, product: string): Uint8Array {
  assertAccountId(accountId);
  assertLink(link);
  assertProductName(product);
  if (!link.split('+').includes(product)) throw new Error('That app is not one of this link’s.');
  return utf8(`keyrook.link-key:v1:${accountId}:${link}:${product}`);
}

function recordAad(label: 'link-record' | 'link-tombstone', place: LinkRecordPlace): Uint8Array {
  assertAccountId(place.accountId);
  assertLink(place.link);
  assertAccountId(place.id);
  if (!Number.isSafeInteger(place.rev) || place.rev < 0) throw new Error('Malformed record revision.');
  return utf8(`keyrook.${label}:v1:${place.accountId}:${place.link}:${place.id}:${place.rev}`);
}

/** Where a link's record belongs, and which revision of it this is. */
export interface LinkRecordPlace {
  accountId: string;
  link: string;
  id: string;
  rev: number;
}

/** A new link key, made by the device that turns the link on. */
export async function newLinkKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

/** The link key sealed under one product's key. */
export async function sealLinkKey(linkKey: CryptoKey, productKey: CryptoKey, accountId: string, link: string, product: string): Promise<SealedBox> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', linkKey));
  try {
    return await sealJson(productKey, { key: toBase64(raw) }, linkKeyAad(accountId, link, product));
  } finally {
    wipe(raw);
  }
}

/** Opens a link key with one product's key. A box for another account, link or product fails as a `DecryptionError`. */
export async function openLinkKey(box: SealedBox, productKey: CryptoKey, accountId: string, link: string, product: string): Promise<CryptoKey> {
  const opened = await openJson<{ key?: unknown }>(productKey, box, linkKeyAad(accountId, link, product));
  if (typeof opened?.key !== 'string') throw new DecryptionError('Malformed link key.');
  return importDataKey(opened.key);
}

/** A record of a link, sealed under its key at `place.rev`. */
export async function sealLinkRecord<T>(linkKey: CryptoKey, value: T, place: LinkRecordPlace): Promise<SealedBox> {
  return sealJson(linkKey, value, recordAad('link-record', place));
}

export async function openLinkRecord<T>(linkKey: CryptoKey, box: SealedBox, place: LinkRecordPlace): Promise<T> {
  return openJson<T>(linkKey, box, recordAad('link-record', place));
}

/** A record's deletion, sealed as the record would be: only someone holding the link key deletes. */
export async function sealLinkTombstone(linkKey: CryptoKey, place: LinkRecordPlace): Promise<SealedBox> {
  return sealJson(linkKey, { deleted: true }, recordAad('link-tombstone', place));
}

export async function openLinkTombstone(linkKey: CryptoKey, box: SealedBox, place: LinkRecordPlace): Promise<void> {
  const opened = await openJson<{ deleted?: unknown }>(linkKey, box, recordAad('link-tombstone', place));
  if (opened?.deleted !== true) throw new DecryptionError('Malformed link record.');
}

/** One 2FA code as a link carries it: all both sides need, and which side wrote it. */
export interface LinkCode {
  /** Base32, as a setup key is written. */
  secret: string;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: number;
  /** Seconds. */
  period: number;
  issuer: string;
  label: string;
  /** The websites it is for, as `example.com`: what Passhold matches a login against. */
  websites: string[];
  /** The product that wrote it. */
  from: string;
}
