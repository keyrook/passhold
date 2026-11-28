/**
 * Machines and agent vaults: an identity of the account for a program, the
 * keys it is handed one item at a time, what it asks of the person, and the
 * log it keeps.
 *
 * Passhold alone holds the agent authority: an ECDH pair `T` that every box
 * to or from a machine is sealed with, and an ECDSA pair that signs every
 * activation, grant, withdrawal and answer. Both private halves are sealed
 * under Passhold's key, so no other product, and no server, opens them.
 *
 * A machine has its own ECDH pair `A`, and pins the authority's two public
 * points when it is enrolled or its token is made. A box from `T` to `A` is
 * authenticated both ways, but the recipient of such a box can compute its
 * shared secrets as well as the sender, so a machine could make a box that
 * opens as from `T` to itself. What it cannot make is the authority's
 * signature: a machine believes a grant, a withdrawal, an activation or an
 * answer only when that signature checks out against the point it pinned,
 * over a statement that names its own point.
 *
 * An agent vault has its own key `V` and, per generation, an ECDSA write key
 * that signs every record and deletion. Each version of each item has a key
 * `I` of its own, sealed under `V`, so a machine handed one item's key opens
 * that item and not its neighbour, whatever else a server sends it.
 *
 * Ids are colon free, integers safe and canonical, base64 and points in their
 * one canonical spelling, so every label, digest and signature reads one way.
 */
import { DecryptionError, importDataKey, open, openJson, seal, sealJson, type SealedBox } from '../crypto/aead.js';
import { CURVE, importPublicPoint, publicPointOf, transcript } from '../crypto/ecdh.js';
import type {
  AgentAuthorityPoints,
  AgentSignedBox,
  MachineAnswer,
  MachineApproval,
  MachineDelivery,
  MachineGrant,
  MachineItemBox,
  MachineListing,
  MachineOutcome,
  MachineSealed,
  MachineUse,
  MachineWithdrawal,
} from '../sync/protocol.js';
import { fromBase64, fromUtf8, toBase64, toBase64Url, utf8, wipe } from '../util/bytes.js';
import { crockfordEncode, group } from '../util/crockford.js';
import { randomBytes } from '../util/id.js';
import { openAuthBox, sealAuthBox } from './org/authbox.js';
import type { MemberKey } from './org/member.js';
import { assertAccountId, PASSHOLD } from './product.js';

/** HKDF info of a box from the authority to a machine, holding one item's grant. */
export const MACHINE_BOX_INFO = 'keyrook:v1:machine-box';
/** HKDF info of a request from a machine to the authority. */
export const MACHINE_REQUEST_INFO = 'keyrook:v1:machine-request';
/** HKDF info of what the authority releases to a request's own key. */
export const MACHINE_RELEASE_INFO = 'keyrook:v1:machine-release';
/** HKDF info of one entry of a machine's log, to the authority. */
export const MACHINE_LOG_INFO = 'keyrook:v1:machine-log';
/** HKDF info of something a machine hands the person to keep. */
export const MACHINE_INBOX_INFO = 'keyrook:v1:machine-inbox';
/** The first field of the transcript the enrollment code is the digest of. */
export const MACHINE_CONFIRM = 'keyrook:v1:machine-confirm';
/** The first field of everything the authority's signing key signs. */
export const MACHINE_OWNER_SIGNATURE = 'keyrook:v1:machine-owner-signature';
/** The first field of what an agent vault's write key signs: a record or a deletion. */
export const AGENT_RECORD_SIGNATURE = 'keyrook:v1:agent-record-signature';
/** The first field of the transcript an item version's key is committed to by, so a device can tell the key it trusts without holding it. */
export const AGENT_ITEM_CHECK = 'keyrook:v1:agent-item-check';

const ECDSA: EcKeyImportParams = { name: 'ECDSA', namedCurve: 'P-256' };
const SIGN: EcdsaParams = { name: 'ECDSA', hash: 'SHA-256' };
const POINT_BYTES = 65;
const SIGNATURE_BYTES = 64;
const KEY_BYTES = 32;
const IV_BYTES = 12;
const TAG_BYTES = 16;
/** The product every label of this file names: agents are Passhold's alone. */
const PRODUCT = PASSHOLD;

/** Fifteen characters, in three groups of five, as every other code two screens compare. */
const CODE_LENGTH = 15;
/** Ceilings on what a sealed body may hold, so nothing a peer sends grows without end. */
const MAX_BOX_BYTES = 64 * 1024;
const MAX_BOUNDS_BYTES = 4096;
const MAX_OPERATION_BYTES = 16 * 1024;
const MAX_ENTRY_BYTES = 32 * 1024;
const MAX_TEXT = 2000;
const MAX_NAME = 200;
const MAX_FIELD = 128;
const MAX_HOST = 253;
const MAX_HOSTS = 64;
const MAX_ARGS = 256;
const MAX_HEADERS = 64;
const MAX_URL = 4096;
const MAX_REF = 800;
const MAX_TIMEOUT = 86_400;
const MAX_DEVICE_ID = 128;
const MAX_RETIRED = 16;
/**
 * A pin and the directory are rewritten whole at each change, a removal
 * included, so each has room for an account at its ceiling of live agent
 * records: every item granted, exposed, awaiting a new key and replaced.
 */
const MAX_STATE_BYTES = 1024 * 1024;
const MAX_GRANTS = 1100;
const MAX_EXPOSED = 2000;
const MAX_MACHINES = 128;
const MAX_VAULTS = 64;
const MAX_WHOLE_VAULT = 512;
const MAX_ITEM_VERSIONS = 2000;
/**
 * Items that have had a new key, deletions included, which are never let
 * go of: as many as fit in the directory beside every other list at its
 * ceiling, with ids and numbers at their widest.
 */
const MAX_REPLACED = 2500;
/** How far apart two clocks may be when a machine checks how long a session runs. */
const CLOCK_SKEW_MS = 2 * 60 * 1000;

// ---------------------------------------------------------------------------
// Primitive checks

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

function hasKeys(value: Record<string, unknown>, ...keys: string[]): boolean {
  const own = Object.keys(value).sort();
  const want = [...keys].sort();
  return own.length === want.length && own.every((key, index) => key === want[index]);
}

function isId(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    assertAccountId(value);
    return true;
  } catch {
    return false;
  }
}

/** Every id a label holds is text in its canonical, colon-free form; anything else is refused before it is spelled. */
const ids = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== 'string') throw new Error('Malformed account id.');
    assertAccountId(value);
  }
};

const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 1;
const isZeroOrMore = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && !Object.is(value, -0);
const isText = (value: unknown, max = MAX_TEXT): value is string => typeof value === 'string' && value.length <= max;
const isName = (value: unknown, max: number): value is string => isText(value, max) && value.length > 0;
const unique = (list: string[]) => new Set(list).size === list.length;

function assertPositive(value: unknown, sentence: 'generation' | 'version' | 'revision' | 'sequence'): asserts value is number {
  if (isCount(value)) return;
  if (sentence === 'generation') throw new Error('Malformed key generation.');
  if (sentence === 'version') throw new Error('Malformed item version.');
  if (sentence === 'sequence') throw new Error('Malformed log sequence.');
  throw new Error('Malformed record revision.');
}

function assertTime(value: unknown): asserts value is number {
  if (!isCount(value)) throw new Error('Malformed time.');
}

/** Text whose UTF-8 is its own: no lone surrogate, which would encode as a replacement character another string also encodes to. */
const WELL_FORMED = /^(?:[^\uD800-\uDFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF])*$/;

/** A device's own id, as it signs in with it: any well-formed text up to 128 characters, so it goes last in a label. */
function assertDeviceId(deviceId: unknown): asserts deviceId is string {
  if (typeof deviceId !== 'string' || deviceId.length === 0 || deviceId.length > MAX_DEVICE_ID || !WELL_FORMED.test(deviceId)) throw new Error('Malformed device id.');
}

/** Standard base64 with padding, decoding to a length within bounds, and spelled the one way that length is. */
function base64Bytes(value: unknown, min: number, max: number): Uint8Array | null {
  if (typeof value !== 'string' || value.length > Math.ceil(max / 3) * 4) return null;
  let raw: Uint8Array;
  try {
    raw = fromBase64(value);
  } catch {
    return null;
  }
  if (raw.length < min || raw.length > max || toBase64(raw) !== value) return null;
  return raw;
}

const isDigest = (value: unknown): value is string => base64Bytes(value, 32, 32) !== null;

/** Whether `point` is a P-256 point in its one canonical form: uncompressed, standard base64 with padding. */
async function isCanonicalPoint(point: unknown): Promise<boolean> {
  const raw = base64Bytes(point, POINT_BYTES, POINT_BYTES);
  if (!raw || raw[0] !== 0x04) return false;
  return (await importPublicPoint(point as string)) !== null;
}

/** An AES-GCM box in canonical form: a 12-byte nonce, and a ciphertext with its tag, within the ceiling. */
function isSealed(box: unknown, max = MAX_BOX_BYTES): box is SealedBox {
  return isObject(box) && base64Bytes(box.iv, IV_BYTES, IV_BYTES) !== null && base64Bytes(box.ct, TAG_BYTES, max + TAG_BYTES) !== null;
}

/** A box under a key a device holds, refused before it is opened unless it is in canonical form. */
function sealedOrRefuse(box: unknown, max = MAX_BOX_BYTES): SealedBox {
  if (!isSealed(box, max)) throw new DecryptionError('Malformed sealed box.');
  return { iv: box.iv, ct: box.ct };
}

/** A body sealed under a key a device holds, or null when it would be too large to be opened again. */
async function sealBounded(key: CryptoKey, value: unknown, aad: Uint8Array, max: number): Promise<SealedBox | null> {
  const bytes = utf8(JSON.stringify(value));
  try {
    return bytes.length > max ? null : await seal(key, bytes, aad);
  } finally {
    wipe(bytes);
  }
}

/** An authenticated box in canonical form: its ephemeral point, then a sealed box. */
async function isAuthSealed(box: unknown): Promise<boolean> {
  return isSealed(box) && (await isCanonicalPoint((box as unknown as Record<string, unknown>).epk));
}

async function assertAuthSealed(box: unknown, error: () => Error): Promise<MachineSealed> {
  if (!(await isAuthSealed(box))) throw error();
  const { epk, iv, ct } = box as MachineSealed;
  return { epk, iv, ct };
}

/** A plain JSON object within a byte ceiling: what a product defines and this package only carries. */
function isSmallObject(value: unknown, max: number): value is Record<string, unknown> {
  if (!isObject(value)) return false;
  try {
    return utf8(JSON.stringify(value)).length <= max;
  } catch {
    return false;
  }
}

function parseBody(opened: Uint8Array, error: () => Error): Record<string, unknown> {
  try {
    const body = JSON.parse(fromUtf8(opened)) as unknown;
    if (!isObject(body)) throw error();
    return body;
  } catch {
    throw error();
  } finally {
    wipe(opened);
  }
}

// ---------------------------------------------------------------------------
// What each box is bound to

/** AAD of the agent authority's private halves under Passhold's key. */
export function agentAuthorityAad(accountId: string): Uint8Array {
  ids(accountId);
  return utf8(`keyrook.agent-authority:v1:${accountId}:${PRODUCT}`);
}

/** AAD of an agent vault's key and its write key, of one generation, under Passhold's key. */
export function agentVaultKeyAad(accountId: string, vaultId: string, generation: number): Uint8Array {
  ids(accountId, vaultId);
  assertPositive(generation, 'generation');
  return utf8(`keyrook.agent-vault-key:v1:${accountId}:${vaultId}:${generation}:${PRODUCT}`);
}

/** AAD of an agent vault's name, under its key of one generation. */
export function agentVaultNameAad(accountId: string, vaultId: string, generation: number): Uint8Array {
  ids(accountId, vaultId);
  assertPositive(generation, 'generation');
  return utf8(`keyrook.agent-vault-name:v1:${accountId}:${vaultId}:${generation}`);
}

/** AAD of one item version's key, under its vault's key of one generation. */
export function agentItemKeyAad(accountId: string, vaultId: string, generation: number, itemId: string, version: number): Uint8Array {
  ids(accountId, vaultId, itemId);
  assertPositive(generation, 'generation');
  assertPositive(version, 'version');
  return utf8(`keyrook.agent-item-key:v1:${accountId}:${vaultId}:${generation}:${itemId}:${version}`);
}

/** Where a record of an agent vault belongs: its item, the version of that item's key, and its revision. */
export interface AgentRecordPlace {
  accountId: string;
  vaultId: string;
  itemId: string;
  version: number;
  rev: number;
}

function recordLabel(place: AgentRecordPlace, deleted: boolean): string {
  ids(place.accountId, place.vaultId, place.itemId);
  assertPositive(place.version, 'version');
  if (!isZeroOrMore(place.rev)) throw new Error('Malformed record revision.');
  const label = deleted ? 'agent-tombstone' : 'agent-record';
  return `keyrook.${label}:v1:${place.accountId}:${place.vaultId}:${place.itemId}:${place.version}:${place.rev}`;
}

/** AAD of a record, under its item version's key. A new vault generation leaves the record's box as it was. */
export function agentRecordAad(place: AgentRecordPlace): Uint8Array {
  return utf8(recordLabel(place, false));
}

/** AAD of a deletion, under its item version's key: a label of its own, so a record never reads as one. */
export function agentTombstoneAad(place: AgentRecordPlace): Uint8Array {
  return utf8(recordLabel(place, true));
}

/** AAD of Passhold's pin of one machine, under Passhold's key. */
export function machinePinAad(accountId: string, machineId: string): Uint8Array {
  ids(accountId, machineId);
  return utf8(`keyrook.machine-pin:v1:${accountId}:${machineId}:${PRODUCT}`);
}

/** AAD of the account's agent directory, under Passhold's key. */
export function agentDirectoryAad(accountId: string): Uint8Array {
  ids(accountId);
  return utf8(`keyrook.agent-directory:v1:${accountId}:${PRODUCT}`);
}

/** Where one item's grant to one machine goes. */
export interface MachineBoxPlace {
  accountId: string;
  machineId: string;
  vaultId: string;
  itemId: string;
  version: number;
}

/** AAD of one item version's grant, from the authority to one machine. */
export function machineBoxAad(place: MachineBoxPlace): Uint8Array {
  ids(place.accountId, place.machineId, place.vaultId, place.itemId);
  assertPositive(place.version, 'version');
  return utf8(`keyrook.machine-box:v1:${place.accountId}:${place.machineId}:${place.vaultId}:${place.itemId}:${place.version}`);
}

/** One request of one machine. */
export interface MachineRequestPlace {
  accountId: string;
  machineId: string;
  requestId: string;
}

/** AAD of a request, from a machine to the authority. */
export function machineRequestAad(place: MachineRequestPlace): Uint8Array {
  ids(place.accountId, place.machineId, place.requestId);
  return utf8(`keyrook.machine-request:v1:${place.accountId}:${place.machineId}:${place.requestId}`);
}

/** AAD of what is released for a request, from the authority to the request's own key. */
export function machineReleaseAad(place: MachineRequestPlace): Uint8Array {
  ids(place.accountId, place.machineId, place.requestId);
  return utf8(`keyrook.machine-release:v1:${place.accountId}:${place.machineId}:${place.requestId}`);
}

/** AAD of one entry of a machine's log, by its place in the run that wrote it. */
export function machineLogAad(accountId: string, machineId: string, sequence: number): Uint8Array {
  ids(accountId, machineId);
  assertPositive(sequence, 'sequence');
  return utf8(`keyrook.machine-log:v1:${accountId}:${machineId}:${sequence}`);
}

/** AAD of something a machine hands the person to keep. */
export function machineInboxAad(accountId: string, machineId: string, entryId: string): Uint8Array {
  ids(accountId, machineId, entryId);
  return utf8(`keyrook.machine-inbox:v1:${accountId}:${machineId}:${entryId}`);
}

/** AAD of a deciding device's own copy of what it decided, under Passhold's key. The device's id goes last, as it signs in with it. */
export function machineDecisionAad(place: MachineRequestPlace, deviceId: string): Uint8Array {
  ids(place.accountId, place.machineId, place.requestId);
  assertDeviceId(deviceId);
  return utf8(`keyrook.machine-decision:v1:${place.accountId}:${place.machineId}:${place.requestId}:${deviceId}`);
}

// ---------------------------------------------------------------------------
// Points and keys

/** Checks a machine's public point, or a request's, is a canonical P-256 point. */
export async function assertMachinePoint(point: unknown): Promise<string> {
  if (!(await isCanonicalPoint(point))) throw new Error('Malformed machine key.');
  return point as string;
}

async function importVerifyPoint(point: unknown): Promise<CryptoKey> {
  if (!(await isCanonicalPoint(point))) throw new Error('Malformed write key.');
  return crypto.subtle.importKey('raw', fromBase64(point as string) as BufferSource, ECDSA, true, ['verify']);
}

/** Checks both of an authority's points, which are never the same point. */
export async function assertAuthorityPoints(points: unknown): Promise<AgentAuthorityPoints> {
  if (!isObject(points) || !(await isCanonicalPoint(points.box)) || !(await isCanonicalPoint(points.sign)) || points.box === points.sign) {
    throw new Error('Malformed agent authority.');
  }
  return { box: points.box as string, sign: points.sign as string };
}

/** An ECDSA pair as a key that signs: its private half, the public half that checks, and that half's point. */
export interface SigningKey {
  privateKey: CryptoKey;
  verify: CryptoKey;
  publicKey: string;
}

/**
 * The agent authority, open: `T`, the key that signs for it, and the `T` of
 * authorities it replaced, kept only to read what was sealed to them.
 */
export interface AgentAuthority {
  box: MemberKey;
  sign: SigningKey;
  retired: MemberKey[];
}

async function newSigningKey(): Promise<SigningKey> {
  const pair = await crypto.subtle.generateKey(ECDSA, true, ['sign', 'verify']);
  return { privateKey: pair.privateKey, verify: pair.publicKey, publicKey: toBase64(new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey))) };
}

/** A new ECDH pair, extractable so it can be sealed or carried in a token. */
export async function newMachineKey(): Promise<MemberKey> {
  const pair = await crypto.subtle.generateKey(CURVE, true, ['deriveBits']);
  return { privateKey: pair.privateKey, publicKey: await publicPointOf(pair.privateKey) };
}

/** A request's own key `E`: made for one request, held in memory, never extractable. */
export async function newRequestKey(): Promise<MemberKey> {
  const pair = await crypto.subtle.generateKey(CURVE, false, ['deriveBits']);
  return { privateKey: pair.privateKey, publicKey: toBase64(new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey))) };
}

/**
 * A new agent authority, made by the first Passhold device that turns agents
 * on, or in place of one that may have leaked: the old `T` then goes along,
 * to read the log and requests sealed to it, and signs nothing new.
 */
export async function newAgentAuthority(replacing?: AgentAuthority): Promise<AgentAuthority> {
  const retired = replacing ? [replacing.box, ...replacing.retired] : [];
  // Dropping one would leave whatever was sealed to it unreadable: the caller lets one go, on purpose, once nothing kept needs it.
  if (retired.length > MAX_RETIRED) throw new Error('Malformed agent authority.');
  return { box: await newMachineKey(), sign: await newSigningKey(), retired };
}

export function authorityPointsOf(authority: AgentAuthority): AgentAuthorityPoints {
  return { box: authority.box.publicKey, sign: authority.sign.publicKey };
}

async function exportPkcs8(key: CryptoKey): Promise<string> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('pkcs8', key));
  try {
    return toBase64(raw);
  } finally {
    wipe(raw);
  }
}

/** Base64url without padding, as a token carries bytes, in its one spelling. */
function base64UrlBytes(value: unknown, min: number, max: number): Uint8Array | null {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]*$/.test(value) || value.length > Math.ceil((max * 4) / 3)) return null;
  const raw = fromBase64(value);
  return raw.length >= min && raw.length <= max && toBase64Url(raw) === value ? raw : null;
}

/** An ECDH private half from its PKCS #8 bytes: standard base64 under a key, base64url in a token. */
async function importEcdhPrivate(pkcs8: unknown, url = false): Promise<MemberKey> {
  const raw = url ? base64UrlBytes(pkcs8, 1, 1024) : base64Bytes(pkcs8, 1, 1024);
  if (!raw) throw new DecryptionError('That box does not hold a key.');
  try {
    const privateKey = await crypto.subtle.importKey('pkcs8', raw as BufferSource, CURVE, true, ['deriveBits']);
    // The public half comes from what opened, never from anyone's word.
    return { privateKey, publicKey: await publicPointOf(privateKey) };
  } catch {
    throw new DecryptionError('That box does not hold a key.');
  } finally {
    wipe(raw);
  }
}

/** The ECDSA public half that belongs to a private one, read from the key itself. */
async function importSigningPrivate(pkcs8: unknown): Promise<SigningKey> {
  const raw = base64Bytes(pkcs8, 1, 1024);
  if (!raw) throw new DecryptionError('That box does not hold a key.');
  try {
    const privateKey = await crypto.subtle.importKey('pkcs8', raw as BufferSource, ECDSA, true, ['sign']);
    const jwk = await crypto.subtle.exportKey('jwk', privateKey);
    if (!jwk.x || !jwk.y) throw new DecryptionError('That box does not hold a key.');
    const point = new Uint8Array(POINT_BYTES);
    point[0] = 0x04;
    point.set(fromBase64(jwk.x), 1);
    point.set(fromBase64(jwk.y), 33);
    const publicKey = toBase64(point);
    return { privateKey, verify: await importVerifyPoint(publicKey), publicKey };
  } catch {
    throw new DecryptionError('That box does not hold a key.');
  } finally {
    wipe(raw);
  }
}

/** The agent authority's private halves, sealed under Passhold's key for this account. */
export async function sealAgentAuthority(authority: AgentAuthority, productKey: CryptoKey, accountId: string): Promise<SealedBox> {
  const aad = agentAuthorityAad(accountId);
  await assertAuthorityPoints(authorityPointsOf(authority));
  if (authority.retired.length > MAX_RETIRED) throw new Error('Malformed agent authority.');
  const body = {
    box: await exportPkcs8(authority.box.privateKey),
    sign: await exportPkcs8(authority.sign.privateKey),
    retired: await Promise.all(authority.retired.map((key) => exportPkcs8(key.privateKey))),
  };
  return sealJson(productKey, body, aad);
}

/** Opens the agent authority with Passhold's key. One for another account, or under another key, fails as a `DecryptionError`. */
export async function openAgentAuthority(box: SealedBox, productKey: CryptoKey, accountId: string): Promise<AgentAuthority> {
  const body = await openJson<unknown>(productKey, sealedOrRefuse(box), agentAuthorityAad(accountId));
  if (!isObject(body) || !hasKeys(body, 'box', 'sign', 'retired') || !Array.isArray(body.retired) || body.retired.length > MAX_RETIRED) {
    throw new DecryptionError('That box does not hold a key.');
  }
  const authority: AgentAuthority = {
    box: await importEcdhPrivate(body.box),
    sign: await importSigningPrivate(body.sign),
    retired: await Promise.all(body.retired.map((pkcs8) => importEcdhPrivate(pkcs8))),
  };
  try {
    await assertAuthorityPoints(authorityPointsOf(authority));
  } catch {
    throw new DecryptionError('That box does not hold a key.');
  }
  return authority;
}

/** The authority's points as a machine or a device pinned them, imported for checking. */
export interface PinnedAuthority {
  points: AgentAuthorityPoints;
  verify: CryptoKey;
}

export async function pinAuthority(points: AgentAuthorityPoints): Promise<PinnedAuthority> {
  const checked = await assertAuthorityPoints(points);
  return { points: checked, verify: await importVerifyPoint(checked.sign) };
}

// ---------------------------------------------------------------------------
// Enrollment: the invitation, the code two screens compare, the activation

/** What the person carries from their Passhold to the machine they enroll. */
export interface MachineInvitation {
  accountId: string;
  invitationId: string;
  /** The invitation's secret, spent once by the machine that enrolls with it. */
  secret: string;
  /** The authority, as the person's own device holds it: the machine takes it from here, never from the server. */
  authority: AgentAuthorityPoints;
}

const INVITATION_PREFIX = 'phi_';

/** The invitation as it is shown: `phi_`, then its fields as JSON in base64url. */
export async function encodeMachineInvitation(invitation: MachineInvitation): Promise<string> {
  ids(invitation.accountId, invitation.invitationId);
  if (!isMachineCredential(invitation.secret)) throw new Error('Malformed machine invitation.');
  const authority = await assertAuthorityPoints(invitation.authority);
  return INVITATION_PREFIX + toBase64Url(utf8(JSON.stringify({ v: 1, a: invitation.accountId, i: invitation.invitationId, c: invitation.secret, t: authority.box, s: authority.sign })));
}

/** Reads an invitation as it was pasted. Anything else fails with one sentence. */
export async function decodeMachineInvitation(input: string): Promise<MachineInvitation> {
  const bad = () => new Error('Malformed machine invitation.');
  const body = readPrefixed(input, INVITATION_PREFIX, null, bad);
  if (!hasKeys(body, 'v', 'a', 'i', 'c', 't', 's') || body.v !== 1 || !isId(body.a) || !isId(body.i) || !isMachineCredential(body.c)) throw bad();
  let authority: AgentAuthorityPoints;
  try {
    authority = await assertAuthorityPoints({ box: body.t, sign: body.s });
  } catch {
    throw bad();
  }
  return { accountId: body.a, invitationId: body.i, secret: body.c, authority };
}

function readPrefixed(input: unknown, prefix: string, variable: string | null, error: () => Error): Record<string, unknown> {
  let value = typeof input === 'string' ? input.trim() : '';
  if (variable && value.startsWith(variable)) value = value.slice(variable.length);
  const encoded = value.slice(prefix.length);
  if (!value.startsWith(prefix) || !/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length > 8192) throw error();
  try {
    const raw = fromBase64(encoded);
    if (toBase64Url(raw) !== encoded) throw error();
    const body = JSON.parse(fromUtf8(raw)) as unknown;
    if (!isObject(body)) throw error();
    return body;
  } catch {
    throw error();
  }
}

export interface MachineConfirmParties {
  accountId: string;
  authority: AgentAuthorityPoints;
  machineId: string;
  /** The machine's point `A`, as this screen made it or was given it. */
  machineKey: string;
}

/**
 * The code a machine's screen and the person's Passhold both show: the
 * digest of the account, both of the authority's points, the machine's id
 * and its point. The machine takes the authority's points from the
 * invitation the person carried over, so only its own point crosses the
 * server unchecked; a server that swapped it would have to find another
 * point with the same 75 bits.
 */
export async function machineConfirmCode(parties: MachineConfirmParties): Promise<string> {
  ids(parties.accountId, parties.machineId);
  const authority = await assertAuthorityPoints(parties.authority);
  await assertMachinePoint(parties.machineKey);
  const digest = new Uint8Array(
    await crypto.subtle.digest(
      'SHA-256',
      transcript(MACHINE_CONFIRM, parties.accountId, authority.box, parties.machineId, parties.machineKey, authority.sign) as BufferSource,
    ),
  );
  return group(crockfordEncode(digest.subarray(0, 10)).slice(0, CODE_LENGTH), 5);
}

// ---------------------------------------------------------------------------
// What the authority signs

/** What a person's device decided for one request, as the server routes it and the machine checks it. */
export interface MachineDecisionStatement {
  accountId: string;
  machineId: string;
  requestId: string;
  /** The digest of the request box this answers. */
  request: string;
  outcome: MachineOutcome;
  /** The request's own key `E` a release is sealed to; null for an ask for access. */
  to: string | null;
  /** The authority's `T` that seals the release. */
  from: string;
  /** For a use, the item it asked for; for an ask for access that was allowed, the grant that answered it. */
  vault: string | null;
  item: string | null;
  version: number | null;
  grant: number | null;
  grantId: string | null;
  deadline: number | null;
  /** The digest of the answer's box; null when nothing is released. */
  answer: string | null;
}

/** Everything the authority signs, by kind. Each field sits at its place in a length-prefixed transcript. */
export type OwnerStatement =
  | { kind: 'activation'; accountId: string; machineId: string; invitationId: string; machineKey: string; authority: AgentAuthorityPoints; expiresAt: number }
  | { kind: 'grant'; accountId: string; machineId: string; machineKey: string; vaultId: string; itemId: string; version: number; rev: number; box: MachineSealed }
  | { kind: 'withdrawal'; accountId: string; machineId: string; vaultId: string; itemId: string; rev: number }
  | ({ kind: 'decision' } & MachineDecisionStatement);

const text = (value: number | string | null) => (value === null ? '' : String(value));

/** A transcript of fields that must each be text: a field left out never reads as an empty one. */
function framed(...fields: unknown[]): Uint8Array {
  if (!fields.every((field) => typeof field === 'string')) throw new Error('Malformed machine answer.');
  return transcript(...(fields as string[]));
}

function assertDecisionStatement(statement: MachineDecisionStatement): void {
  ids(statement.requestId);
  const bad = () => new Error('Malformed machine answer.');
  if (!isDigest(statement.request) || (statement.outcome !== 'allow' && statement.outcome !== 'deny')) throw bad();
  const isPoint = (point: unknown) => {
    const raw = base64Bytes(point, POINT_BYTES, POINT_BYTES);
    return raw !== null && raw[0] === 0x04;
  };
  if (!isPoint(statement.from) || !(statement.to === null || isPoint(statement.to)) || !(statement.grantId === null || isId(statement.grantId))) throw bad();
  if (!(statement.answer === null || isDigest(statement.answer))) throw bad();
  if (!(statement.vault === null || isId(statement.vault)) || !(statement.item === null || isId(statement.item))) throw bad();
  for (const count of [statement.version, statement.grant, statement.deadline]) {
    if (!(count === null || isCount(count))) throw bad();
  }
}

/**
 * The bytes the authority signs for a statement: the label, the kind, the
 * account and the machine, then that kind's own fields in a fixed order.
 * Each kind's fields are read by name, so nothing a peer adds to an object
 * changes which kind is signed. The server checks an answer over the same
 * bytes.
 */
export function ownerStatementBytes(statement: OwnerStatement): Uint8Array {
  const { kind, accountId, machineId } = statement;
  ids(accountId, machineId);
  const head = [MACHINE_OWNER_SIGNATURE, kind, accountId, machineId];
  if (kind === 'activation') {
    const { invitationId, machineKey, authority, expiresAt } = statement;
    ids(invitationId);
    assertTime(expiresAt);
    if (!isObject(authority)) throw new Error('Malformed agent authority.');
    return framed(...head, invitationId, machineKey, authority.box, authority.sign, String(expiresAt));
  }
  if (kind === 'grant') {
    const { machineKey, vaultId, itemId, version, rev, box } = statement;
    ids(vaultId, itemId);
    assertPositive(version, 'version');
    assertPositive(rev, 'revision');
    if (!isObject(box)) throw new Error('Malformed sealed box.');
    return framed(...head, machineKey, vaultId, itemId, String(version), String(rev), box.epk, box.iv, box.ct);
  }
  if (kind === 'withdrawal') {
    const { vaultId, itemId, rev } = statement;
    ids(vaultId, itemId);
    assertPositive(rev, 'revision');
    return framed(...head, vaultId, itemId, String(rev));
  }
  if (kind === 'decision') {
    assertDecisionStatement(statement);
    const { requestId, request, outcome, to, from, vault, item, version, grant, grantId, deadline, answer } = statement;
    return framed(...head, requestId, request, outcome, text(to), from, text(vault), text(item), text(version), text(grant), text(grantId), text(deadline), text(answer));
  }
  throw new Error('Malformed machine answer.');
}

async function signStatement(authority: AgentAuthority, statement: OwnerStatement): Promise<string> {
  const sig = await crypto.subtle.sign(SIGN, authority.sign.privateKey, ownerStatementBytes(statement) as BufferSource);
  return toBase64(new Uint8Array(sig));
}

/** Checks the authority signed `statement`. A signature by anyone else, over anything else or of another kind, fails as a `DecryptionError`. */
export async function checkOwnerStatement(pinned: PinnedAuthority, statement: OwnerStatement, sig: unknown): Promise<void> {
  const notSigned = () => new DecryptionError('That was not signed by this account’s Passhold.');
  const bytes = base64Bytes(sig, SIGNATURE_BYTES, SIGNATURE_BYTES);
  if (!bytes) throw notSigned();
  let message: Uint8Array;
  try {
    message = ownerStatementBytes(statement);
  } catch {
    throw notSigned();
  }
  // The bytes check a point's spelling; whether it is on the curve takes the curve.
  if (statement.kind === 'decision' && (!(await isCanonicalPoint(statement.from)) || !(statement.to === null || (await isCanonicalPoint(statement.to))))) throw notSigned();
  if (!(await crypto.subtle.verify(SIGN, pinned.verify, bytes as BufferSource, message as BufferSource))) throw notSigned();
}

/** An enrolled machine, as the person confirmed it: its own id and point, and the invitation it answered. */
export interface MachineEnrollment {
  accountId: string;
  machineId: string;
  invitationId: string;
  machineKey: string;
}

/** Signs a machine's activation, once the person confirmed the code. */
export async function signMachineActivation(authority: AgentAuthority, enrollment: MachineEnrollment, expiresAt: number): Promise<string> {
  await assertMachinePoint(enrollment.machineKey);
  const { accountId, machineId, invitationId, machineKey } = enrollment;
  return signStatement(authority, { kind: 'activation', accountId, machineId, invitationId, machineKey, authority: authorityPointsOf(authority), expiresAt });
}

/**
 * Checks the activation the server hands back is for what this machine
 * holds itself: its account, id and point, the invitation it spent, and the
 * authority it pinned. Only the expiry comes from the server, and that too
 * is signed.
 */
export async function checkMachineActivation(pinned: PinnedAuthority, own: MachineEnrollment, expiresAt: unknown, sig: unknown): Promise<void> {
  if (!isCount(expiresAt)) throw new DecryptionError('That was not signed by this account’s Passhold.');
  const { accountId, machineId, invitationId, machineKey } = own;
  await checkOwnerStatement(pinned, { kind: 'activation', accountId, machineId, invitationId, machineKey, authority: pinned.points, expiresAt }, sig);
}

/** Signs that one item is taken back from one machine, from grant revision `rev` on. */
export async function signMachineWithdrawal(authority: AgentAuthority, accountId: string, machineId: string, vaultId: string, itemId: string, rev: number): Promise<MachineWithdrawal> {
  const sig = await signStatement(authority, { kind: 'withdrawal', accountId, machineId, vaultId, itemId, rev });
  return { vault: vaultId, item: itemId, rev, sig };
}

export async function checkMachineWithdrawal(pinned: PinnedAuthority, accountId: string, machineId: string, withdrawal: MachineWithdrawal): Promise<void> {
  if (!isObject(withdrawal)) throw new DecryptionError('That was not signed by this account’s Passhold.');
  const { vault, item, rev, sig } = withdrawal;
  await checkOwnerStatement(pinned, { kind: 'withdrawal', accountId, machineId, vaultId: vault, itemId: item, rev }, sig);
}

// ---------------------------------------------------------------------------
// Grants and operations

const USES: readonly MachineUse[] = ['request', 'run', 'fill', 'reveal'];
const APPROVALS: readonly MachineApproval[] = ['standing', 'session', 'each'];
/** A session lasts from a minute to a day. */
const SESSION_SECONDS = { min: 60, max: 86_400 };

/** Whether `value` is a grant this package can carry: the checks a device makes before it seals one and after it opens one. */
export function isMachineGrant(value: unknown): value is MachineGrant {
  if (!isObject(value)) return false;
  const { id, rev, uses, approval, session, bounds, expiresAt } = value;
  if (!isId(id) || !isCount(rev)) return false;
  if (!Array.isArray(uses) || uses.length === 0 || !uses.every((use) => typeof use === 'string' && USES.includes(use as MachineUse)) || !unique(uses as string[])) return false;
  if (!APPROVALS.includes(approval as MachineApproval)) return false;
  if (approval === 'session') {
    if (!isCount(session) || session < SESSION_SECONDS.min || session > SESSION_SECONDS.max) return false;
  } else if (session !== null) return false;
  if (!isSmallObject(bounds, MAX_BOUNDS_BYTES)) return false;
  return expiresAt === null || isCount(expiresAt);
}

const grantOf = (grant: MachineGrant): MachineGrant => ({
  id: grant.id,
  rev: grant.rev,
  uses: [...grant.uses],
  approval: grant.approval,
  session: grant.session,
  bounds: grant.bounds,
  expiresAt: grant.expiresAt,
});

const LISTING_TEXT = ['title', 'kind', 'service', 'environment', 'ref'] as const;

/** Whether `value` holds only the fields an agent may be shown, each within bounds. */
export function isMachineListing(value: unknown): value is MachineListing {
  return isObject(value) && Object.keys(value).every((key) => (LISTING_TEXT as readonly string[]).includes(key) && isText(value[key], MAX_NAME));
}

const listingOf = (listing: MachineListing): MachineListing => {
  const out: MachineListing = {};
  for (const key of LISTING_TEXT) if (listing[key] !== undefined) out[key] = listing[key];
  return out;
};

const LABEL = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?';
/** A host in lower-case ASCII, `*.` for a host and those under it, a port where one is named; no trailing dot. */
const HOST = new RegExp(`^(?:\\*\\.)?(?:${LABEL}\\.)*${LABEL}(?::([1-9][0-9]{0,4}))?$`);

function isHost(value: unknown): boolean {
  if (typeof value !== 'string' || value.length > MAX_HOST) return false;
  // An IPv6 literal in brackets, as a URL writes it, in the URL parser's own spelling.
  if (value.startsWith('[')) {
    try {
      return new URL(`https://${value}/`).host === value;
    } catch {
      return false;
    }
  }
  const match = HOST.exec(value);
  return match !== null && (match[1] === undefined || Number(match[1]) <= 65_535);
}
const QUERY_NAME = /^[A-Za-z0-9._~-]{1,128}$/;

function isSendAs(value: unknown): value is string {
  if (value === 'bearer' || value === 'basic') return true;
  if (typeof value !== 'string') return false;
  if (value.startsWith('header:')) {
    const name = value.slice('header:'.length);
    return HEADER_NAME.test(name) && !RESERVED_HEADERS.has(name);
  }
  return value.startsWith('query:') && QUERY_NAME.test(value.slice('query:'.length));
}

/** Whether `value` says how an item's value is put to use, each field in its one form. */
export function isMachineDelivery(value: unknown): value is MachineDelivery {
  if (!isObject(value) || !hasKeys(value, 'hosts', 'sendAs', 'keyId', 'env')) return false;
  const { hosts, sendAs, keyId, env } = value;
  if (!Array.isArray(hosts) || hosts.length > MAX_HOSTS || !hosts.every(isHost) || !unique(hosts as string[])) return false;
  if (!isSendAs(sendAs) || !(keyId === null || isName(keyId, MAX_NAME))) return false;
  if (sendAs === 'basic' && keyId === null) return false;
  return env === null || (typeof env === 'string' && VARIABLE.test(env));
}

const deliveryOf = (delivery: MachineDelivery): MachineDelivery => ({ hosts: [...delivery.hosts], sendAs: delivery.sendAs, keyId: delivery.keyId, env: delivery.env });

/**
 * The operation Passhold will perform with a value, exactly as the person is
 * shown it and the runtime checks it again before the value is used.
 */
export type MachineOperation =
  | {
      use: 'request';
      method: string;
      /** The normalized destination: scheme, host, port, path and query; no credentials, no fragment. */
      url: string;
      /** The caller's own headers, as sent: lower-case names. Passhold adds the key itself. */
      headers: [string, string][];
      /** The body's SHA-256, base64; null for none. */
      body: string | null;
    }
  | {
      use: 'run';
      argv: string[];
      /** An absolute directory. */
      cwd: string;
      /** Each variable the command gets, and the reference it is filled from. */
      env: { name: string; ref: string }[];
      /** Seconds. */
      timeout: number;
    }
  | { use: 'fill'; url: string }
  | { use: 'reveal'; field: string };

const METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const HEADER_NAME = /^[a-z0-9!#$%&'*+.^_`|~-]{1,128}$/;
/** Headers that say where a request goes, how it is framed or who sends it: the runtime's to set, never the caller's. */
const RESERVED_HEADERS = new Set(['host', 'authorization', 'proxy-authorization', 'content-length', 'transfer-encoding', 'connection', 'keep-alive', 'te', 'trailer', 'upgrade']);
/** A header value: bytes, as HTTP carries them, and no control character but a tab. */
const HEADER_VALUE = /^[\t\x20-\x7e\x80-\xff]*$/;
const VARIABLE = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/;
const ABSOLUTE = /^(?:\/|[A-Za-z]:[\\/])/;
const noNul = (value: string) => !value.includes('\0');

function isUrl(value: unknown): value is string {
  if (!isText(value, MAX_URL) || value.includes('#')) return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.username === '' && url.password === '' && url.hash === '' && url.href === value;
  } catch {
    return false;
  }
}

function isOperationShape(value: Record<string, unknown>): boolean {
  switch (value.use) {
    case 'request': {
      if (!hasKeys(value, 'use', 'method', 'url', 'headers', 'body')) return false;
      if (!METHODS.includes(value.method as string) || !isUrl(value.url) || !(value.body === null || isDigest(value.body))) return false;
      // A request that carries no body cannot be shown as one that does.
      if ((value.method === 'GET' || value.method === 'HEAD') && value.body !== null) return false;
      const headers = value.headers;
      return (
        Array.isArray(headers) &&
        headers.length <= MAX_HEADERS &&
        headers.every(
          (pair) =>
            Array.isArray(pair) &&
            pair.length === 2 &&
            typeof pair[0] === 'string' &&
            HEADER_NAME.test(pair[0]) &&
            !RESERVED_HEADERS.has(pair[0]) &&
            isText(pair[1], MAX_URL) &&
            HEADER_VALUE.test(pair[1]),
        )
      );
    }
    case 'run': {
      if (!hasKeys(value, 'use', 'argv', 'cwd', 'env', 'timeout')) return false;
      const { argv, cwd, env, timeout } = value;
      if (!Array.isArray(argv) || argv.length === 0 || argv.length > MAX_ARGS || !argv.every((arg) => isText(arg, MAX_URL) && noNul(arg)) || argv[0] === '') return false;
      if (!isName(cwd, MAX_URL) || !noNul(cwd) || !ABSOLUTE.test(cwd) || !isCount(timeout) || timeout > MAX_TIMEOUT) return false;
      if (!Array.isArray(env) || env.length > MAX_HEADERS) return false;
      const names = new Set<string>();
      for (const entry of env) {
        if (!isObject(entry) || !hasKeys(entry, 'name', 'ref')) return false;
        // Windows reads variable names without regard to case: two that differ only in case are one there.
        if (typeof entry.name !== 'string' || !VARIABLE.test(entry.name) || names.has(entry.name.toUpperCase()) || !isName(entry.ref, MAX_REF) || !noNul(entry.ref)) return false;
        names.add(entry.name.toUpperCase());
      }
      return true;
    }
    case 'fill':
      return hasKeys(value, 'use', 'url') && isUrl(value.url);
    case 'reveal':
      return hasKeys(value, 'use', 'field') && isName(value.field, MAX_FIELD);
    default:
      return false;
  }
}

/** Whether `value` is an operation in its canonical form, within its byte ceiling. */
export function isMachineOperation(value: unknown): value is MachineOperation {
  return isObject(value) && isOperationShape(value) && isSmallObject(value, MAX_OPERATION_BYTES);
}

/** The operation rebuilt field by field, so its JSON is the same wherever it was made. */
function operationOf(operation: MachineOperation): MachineOperation {
  switch (operation.use) {
    case 'request':
      return { use: 'request', method: operation.method, url: operation.url, headers: operation.headers.map(([name, value]) => [name, value]), body: operation.body };
    case 'run':
      return { use: 'run', argv: [...operation.argv], cwd: operation.cwd, env: operation.env.map(({ name, ref }) => ({ name, ref })), timeout: operation.timeout };
    case 'fill':
      return { use: 'fill', url: operation.url };
    case 'reveal':
      return { use: 'reveal', field: operation.field };
  }
}

async function digestOf(...fields: string[]): Promise<string> {
  return toBase64(new Uint8Array(await crypto.subtle.digest('SHA-256', transcript(...fields) as BufferSource)));
}

/** The digest of an operation in its canonical form: what a release names, so it answers that operation and no other. */
async function operationDigest(operation: MachineOperation): Promise<string> {
  return digestOf(JSON.stringify(operationOf(operation)));
}

// ---------------------------------------------------------------------------
// Agent vaults, their items and their records

/** An agent vault's key of one generation, and the write key that signs its records. */
export interface AgentVaultKey {
  key: CryptoKey;
  write: SigningKey;
}

/** A new vault key and write key, for a new vault or a vault's next generation. */
export async function newAgentVaultKey(): Promise<AgentVaultKey> {
  return { key: await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']), write: await newSigningKey() };
}

/** A new item version's key `I`. */
export async function newAgentItemKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

async function rawKey(key: CryptoKey): Promise<string> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
  try {
    return toBase64(raw);
  } finally {
    wipe(raw);
  }
}

async function importKeyText(value: unknown): Promise<CryptoKey> {
  const raw = base64Bytes(value, KEY_BYTES, KEY_BYTES);
  if (!raw) throw new DecryptionError('That box does not hold a key.');
  wipe(raw);
  return importDataKey(value as string);
}

/** A vault's key and write key of one generation, sealed under Passhold's key. */
export async function sealAgentVaultKey(vault: AgentVaultKey, productKey: CryptoKey, accountId: string, vaultId: string, generation: number): Promise<SealedBox> {
  const aad = agentVaultKeyAad(accountId, vaultId, generation);
  return sealJson(productKey, { key: await rawKey(vault.key), sign: await exportPkcs8(vault.write.privateKey) }, aad);
}

/** Opens a vault's key and write key. One for another account, vault or generation fails as a `DecryptionError`. */
export async function openAgentVaultKey(box: SealedBox, productKey: CryptoKey, accountId: string, vaultId: string, generation: number): Promise<AgentVaultKey> {
  const body = await openJson<unknown>(productKey, sealedOrRefuse(box), agentVaultKeyAad(accountId, vaultId, generation));
  if (!isObject(body) || !hasKeys(body, 'key', 'sign')) throw new DecryptionError('That box does not hold a key.');
  return { key: await importKeyText(body.key), write: await importSigningPrivate(body.sign) };
}

/** A vault's name, sealed under its key of one generation. */
export async function sealAgentVaultName(vaultKey: CryptoKey, name: string, accountId: string, vaultId: string, generation: number): Promise<SealedBox> {
  const aad = agentVaultNameAad(accountId, vaultId, generation);
  if (!isText(name, MAX_NAME)) throw new Error('Malformed vault name.');
  return sealJson(vaultKey, { name }, aad);
}

export async function openAgentVaultName(vaultKey: CryptoKey, box: SealedBox, accountId: string, vaultId: string, generation: number): Promise<string> {
  const body = await openJson<unknown>(vaultKey, sealedOrRefuse(box), agentVaultNameAad(accountId, vaultId, generation));
  if (!isObject(body) || !hasKeys(body, 'name') || !isText(body.name, MAX_NAME)) throw new DecryptionError('Malformed vault name.');
  return body.name;
}

/** An item version's key, sealed under its vault's key of one generation. */
export async function sealAgentItemKey(itemKey: CryptoKey, vaultKey: CryptoKey, accountId: string, vaultId: string, generation: number, itemId: string, version: number): Promise<SealedBox> {
  const aad = agentItemKeyAad(accountId, vaultId, generation, itemId, version);
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', itemKey));
  try {
    return await seal(vaultKey, raw, aad);
  } finally {
    wipe(raw);
  }
}

/** Opens an item version's key: extractable, since the owner's device seals it again for machines. */
export async function openAgentItemKey(box: SealedBox, vaultKey: CryptoKey, accountId: string, vaultId: string, generation: number, itemId: string, version: number): Promise<CryptoKey> {
  const raw = await open(vaultKey, sealedOrRefuse(box), agentItemKeyAad(accountId, vaultId, generation, itemId, version));
  try {
    if (raw.length !== KEY_BYTES) throw new DecryptionError('That box does not hold a key.');
    return await importDataKey(toBase64(raw));
  } finally {
    wipe(raw);
  }
}

const recordSigned = (label: string, box: SealedBox) => transcript(AGENT_RECORD_SIGNATURE, label, box.iv, box.ct);

async function signRecord(write: SigningKey, box: SealedBox, label: string): Promise<AgentSignedBox> {
  const sig = new Uint8Array(await crypto.subtle.sign(SIGN, write.privateKey, recordSigned(label, box) as BufferSource));
  return { iv: box.iv, ct: box.ct, sig: toBase64(sig) };
}

/**
 * Checks a record's or a deletion's signature, with the write key's point
 * from a box this device trusts. One missing, by another key, for another
 * place or kind, or spelled any other way, fails as a `DecryptionError`.
 */
export async function checkAgentRecord(verify: CryptoKey, box: AgentSignedBox, place: AgentRecordPlace, deleted: boolean): Promise<void> {
  const label = recordLabel(place, deleted);
  const notSigned = () => new DecryptionError('That record is not signed by anyone who may edit this vault.');
  if (!isSealed(box)) throw notSigned();
  const bytes = base64Bytes((box as Partial<AgentSignedBox>).sig, SIGNATURE_BYTES, SIGNATURE_BYTES);
  if (!bytes || !(await crypto.subtle.verify(SIGN, verify, bytes as BufferSource, recordSigned(label, box) as BufferSource))) throw notSigned();
}

/** A record sealed under its item version's key at `place.rev`, and signed by the vault's write key. */
export async function sealAgentRecord<T>(itemKey: CryptoKey, write: SigningKey, value: T, place: AgentRecordPlace): Promise<AgentSignedBox> {
  const label = recordLabel(place, false);
  const box = await sealBounded(itemKey, value, utf8(label), MAX_BOX_BYTES);
  if (!box) throw new Error('That item is too large.');
  return signRecord(write, box, label);
}

/** A record's deletion, sealed and signed as a record is, under a label of its own. */
export async function sealAgentTombstone(itemKey: CryptoKey, write: SigningKey, place: AgentRecordPlace): Promise<AgentSignedBox> {
  const label = recordLabel(place, true);
  return signRecord(write, await sealJson(itemKey, { deleted: true }, utf8(label)), label);
}

/** Opens a record whose signature checks out. */
export async function openAgentRecord<T>(itemKey: CryptoKey, verify: CryptoKey, box: AgentSignedBox, place: AgentRecordPlace): Promise<T> {
  await checkAgentRecord(verify, box, place, false);
  return openJson<T>(itemKey, box, agentRecordAad(place));
}

/** Opens a deletion whose signature checks out. */
export async function openAgentTombstone(itemKey: CryptoKey, verify: CryptoKey, box: AgentSignedBox, place: AgentRecordPlace): Promise<void> {
  await checkAgentRecord(verify, box, place, true);
  const body = await openJson<unknown>(itemKey, box, agentTombstoneAad(place));
  if (!isObject(body) || !hasKeys(body, 'deleted') || body.deleted !== true) throw new DecryptionError('That record is not signed by anyone who may edit this vault.');
}

/** Imports a write key's point, as a machine's box hands it over. */
export async function importAgentWriteKey(point: string): Promise<CryptoKey> {
  return importVerifyPoint(point);
}

// ---------------------------------------------------------------------------
// One item given to one machine

/** What a machine's box holds: the grant, what it may list, how the value is used, the write key's point its records are checked with, and a standing grant's key. */
export interface MachineItemGrant {
  grant: MachineGrant;
  listing: MachineListing;
  delivery: MachineDelivery;
  /** The point of the write key that signs this item's records. */
  record: string;
  /** The item version's key: a standing grant's alone. */
  key: CryptoKey | null;
}

/** An opened box: the grant, and the write key imported for checking the item's records. */
export interface OpenedMachineItem extends MachineItemGrant {
  verify: CryptoKey;
}

/**
 * Seals one item version's grant from the authority to the machine whose
 * point the owner pinned, and signs the box, its place and that point. Only
 * a standing grant carries the item's key; any other carries policy alone,
 * and the key or a value goes over only in an approved release.
 */
export async function sealMachineItem(authority: AgentAuthority, machineKey: string, place: MachineBoxPlace, content: MachineItemGrant): Promise<MachineItemBox> {
  const aad = machineBoxAad(place);
  await assertMachinePoint(machineKey);
  const bad = () => new Error('Malformed machine grant.');
  if (!isMachineGrant(content.grant) || (content.grant.approval === 'standing') !== (content.key !== null) || !isMachineListing(content.listing) || !isMachineDelivery(content.delivery)) throw bad();
  await importVerifyPoint(content.record);
  const body: Record<string, unknown> = { grant: grantOf(content.grant), listing: listingOf(content.listing), delivery: deliveryOf(content.delivery), record: content.record };
  if (content.key) body.key = await rawKey(content.key);
  const plaintext = utf8(JSON.stringify(body));
  try {
    const box = await sealAuthBox(authority.box, machineKey, plaintext, MACHINE_BOX_INFO, aad);
    const { accountId, machineId, vaultId, itemId, version } = place;
    const rev = content.grant.rev;
    const sig = await signStatement(authority, { kind: 'grant', accountId, machineId, machineKey, vaultId, itemId, version, rev, box });
    return { epk: box.epk, iv: box.iv, ct: box.ct, rev, sig };
  } finally {
    wipe(plaintext);
  }
}

/**
 * Opens one item's box with the machine's key, as from the authority it
 * pinned. The signature is checked first, over this machine's own point: a
 * box the machine could have made itself, a grant edited after sealing, one
 * for another machine or place, or a gated grant carrying a key, fails as a
 * `DecryptionError`.
 */
export async function openMachineItem(machine: MemberKey, pinned: PinnedAuthority, box: MachineItemBox, place: MachineBoxPlace): Promise<OpenedMachineItem> {
  const aad = machineBoxAad(place);
  const bad = () => new DecryptionError('Malformed machine grant.');
  const sealed = await assertAuthSealed(box, () => new DecryptionError('Malformed sealed box.'));
  const rev = (box as Partial<MachineItemBox>).rev;
  if (!isCount(rev)) throw new DecryptionError('That was not signed by this account’s Passhold.');
  const { accountId, machineId, vaultId, itemId, version } = place;
  await checkOwnerStatement(pinned, { kind: 'grant', accountId, machineId, machineKey: machine.publicKey, vaultId, itemId, version, rev, box: sealed }, box.sig);
  const body = parseBody(await openAuthBox(machine, pinned.points.box, sealed, MACHINE_BOX_INFO, aad), bad);
  const standing = isObject(body.grant) && body.grant.approval === 'standing';
  if (!hasKeys(body, 'grant', 'listing', 'delivery', 'record', ...(standing ? ['key'] : []))) throw bad();
  if (!isMachineGrant(body.grant) || body.grant.rev !== rev || !isMachineListing(body.listing) || !isMachineDelivery(body.delivery)) throw bad();
  let verify: CryptoKey;
  try {
    verify = await importVerifyPoint(body.record);
  } catch {
    throw bad();
  }
  return {
    grant: grantOf(body.grant),
    listing: listingOf(body.listing),
    delivery: deliveryOf(body.delivery),
    record: body.record as string,
    key: standing ? await importKeyText(body.key) : null,
    verify,
  };
}

// ---------------------------------------------------------------------------
// A request, and what is released for it

/** A request to use an item under a grant that waits on the person. */
export interface MachineUseRequest {
  kind: 'use';
  /** When the machine made it, in milliseconds. */
  at: number;
  /** The request's own key `E`, which the release is sealed to. */
  key: string;
  vault: string;
  item: string;
  version: number;
  grant: number;
  /** The id of the grant it asks under, from the machine's box. */
  grantId: string;
  /** The one field a release for one use carries. For `reveal`, the field the operation names. */
  field: string;
  operation: MachineOperation;
  /** The agent's words, shown as the agent's. */
  reason: string;
}

/** An ask for something not given yet: the person may answer it with a grant, never with a value. */
export interface MachineAccessRequest {
  kind: 'access';
  at: number;
  what: string;
  reason: string;
}

export type MachineRequest = MachineUseRequest | MachineAccessRequest;

async function checkRequest(value: unknown): Promise<MachineRequest> {
  const bad = () => new Error('Malformed machine request.');
  if (!isObject(value)) throw bad();
  if (value.kind === 'use') {
    if (!hasKeys(value, 'kind', 'at', 'key', 'vault', 'item', 'version', 'grant', 'grantId', 'field', 'operation', 'reason')) throw bad();
    const { at, key, vault, item, version, grant, grantId, field, operation, reason } = value;
    if (!isCount(at) || !isId(vault) || !isId(item) || !isCount(version) || !isCount(grant) || !isId(grantId) || !isName(field, MAX_FIELD)) throw bad();
    if (!isMachineOperation(operation) || !isText(reason) || !(await isCanonicalPoint(key))) throw bad();
    if (operation.use === 'reveal' && operation.field !== field) throw bad();
    return { kind: 'use', at, key: key as string, vault, item, version, grant, grantId, field, operation: operationOf(operation), reason };
  }
  if (value.kind === 'access') {
    if (!hasKeys(value, 'kind', 'at', 'what', 'reason')) throw bad();
    if (!isCount(value.at) || !isText(value.what) || !isText(value.reason)) throw bad();
    return { kind: 'access', at: value.at, what: value.what, reason: value.reason };
  }
  throw bad();
}

/** A request as its machine keeps it until it is answered: what it asked, the box it sent, and that box's digest. */
export interface OutstandingRequest {
  place: MachineRequestPlace;
  request: MachineRequest;
  box: MachineSealed;
  digest: string;
}

/** A request as the person's device opened it: the same, and the machine's pinned point it came from. */
export interface OpenedMachineRequest extends OutstandingRequest {
  machineKey: string;
}

/** The digest of a request's box, bound to its place: what an answer names, and what an identical retry repeats. */
export async function machineRequestDigest(box: MachineSealed, place: MachineRequestPlace): Promise<string> {
  const aad = fromUtf8(machineRequestAad(place));
  const sealed = await assertAuthSealed(box, () => new Error('Malformed sealed box.'));
  return digestOf(aad, sealed.epk, sealed.iv, sealed.ct);
}

/** The digest of an answer's box, bound to its place: what the authority signs alongside the outcome. */
export async function machineAnswerDigest(box: MachineSealed, place: MachineRequestPlace): Promise<string> {
  const aad = fromUtf8(machineReleaseAad(place));
  const sealed = await assertAuthSealed(box, () => new Error('Malformed sealed box.'));
  return digestOf(aad, sealed.epk, sealed.iv, sealed.ct);
}

/** A request, sealed from the machine to the authority it pinned. The machine keeps what this returns until the request is answered. */
export async function sealMachineRequest(machine: MemberKey, pinned: PinnedAuthority, place: MachineRequestPlace, request: MachineRequest): Promise<OutstandingRequest> {
  const aad = machineRequestAad(place);
  const checked = await checkRequest(request);
  const plaintext = utf8(JSON.stringify(checked));
  try {
    const box = await sealAuthBox(machine, pinned.points.box, plaintext, MACHINE_REQUEST_INFO, aad);
    const { accountId, machineId, requestId } = place;
    return { place: { accountId, machineId, requestId }, request: checked, box, digest: await machineRequestDigest(box, place) };
  } finally {
    wipe(plaintext);
  }
}

/**
 * Opens a request with the authority's `T` (or a retired one, for an old
 * request), as from the machine's pinned point, with its digest. One from
 * any other key, or for another place, fails as a `DecryptionError`.
 */
export async function openMachineRequest(boxKey: MemberKey, machineKey: string, box: MachineSealed, place: MachineRequestPlace): Promise<OpenedMachineRequest> {
  const aad = machineRequestAad(place);
  const bad = () => new DecryptionError('Malformed machine request.');
  const sealed = await assertAuthSealed(box, () => new DecryptionError('Malformed sealed box.'));
  const body = parseBody(await openAuthBox(boxKey, machineKey, sealed, MACHINE_REQUEST_INFO, aad), bad);
  let request: MachineRequest;
  try {
    request = await checkRequest(body);
  } catch {
    throw bad();
  }
  const { accountId, machineId, requestId } = place;
  return { place: { accountId, machineId, requestId }, request, box: sealed, digest: await machineRequestDigest(sealed, place), machineKey };
}

/** One grant as an answer names it: its vault, its item (null for a whole vault), its id and its revision. */
export interface MachineGrantReference {
  vault: string;
  item: string | null;
  id: string;
  rev: number;
}

/** What a person's device decided, before it is sealed and signed. */
export type MachineChoice =
  | { allow: false }
  /** For an ask for access: the grant the device made beside it, one item or (with a null item) a whole vault. */
  | { allow: true; grant: MachineGrantReference }
  /** For a use: one field once, or the item version's key until `until`. Either may be taken until `deadline`. */
  | { allow: true; release: { kind: 'once'; value: string } | { kind: 'session'; key: CryptoKey; until: number }; deadline: number };

/** What the deciding device holds itself, that a release is held to: the grant as it pinned it, when the machine ends, and its clock. */
export interface MachinePolicy {
  /** The machine's grant of the item asked for, from this device's pin; null for an ask for access. */
  grant: MachineGrant | null;
  machineExpiresAt: number;
  now: number;
}

/** An answer, and the deciding device's record of exactly what it signed, sealed in the same step. */
export interface SealedMachineAnswer {
  answer: MachineAnswer;
  record: MachineDecisionRecord;
  /** The record under Passhold's key, as it is kept. */
  kept: SealedBox;
}

/** Where the deciding device keeps its record: Passhold's key, and its own id. */
export interface MachineDecisionKeeping {
  productKey: CryptoKey;
  deviceId: string;
}

/** The longest a release may be taken after it is made. */
const MAX_DEADLINE_MS = 10 * 60 * 1000;

function snapshotChoice(choice: MachineChoice): MachineChoice {
  if (!isObject(choice) || typeof choice.allow !== 'boolean') throw new Error('Malformed machine answer.');
  if (!choice.allow) return { allow: false };
  if ('grant' in choice) {
    const { vault, item, id, rev } = choice.grant ?? ({} as MachineGrantReference);
    return { allow: true, grant: { vault, item, id, rev } };
  }
  const release = choice.release;
  if (!isObject(release)) throw new Error('Malformed machine answer.');
  const kept = release.kind === 'once' ? { kind: 'once' as const, value: release.value } : { kind: 'session' as const, key: (release as { key: CryptoKey }).key, until: (release as { until: number }).until };
  if (release.kind !== 'once' && release.kind !== 'session') throw new Error('Malformed machine answer.');
  return { allow: true, release: kept, deadline: choice.deadline };
}
/** How old a request may be when it is allowed, and how far ahead of this clock. */
const REQUEST_FRESH_MS = 2 * 60 * 1000;

/**
 * Opens a request with the current authority, as from the machine's pinned
 * point, and answers it: what is released goes in a box to the request's
 * own key, naming the request's digest and its key, the operation's digest,
 * the item and grant, and when it was approved; the signature covers the
 * box's digest with the routing and both keys, so neither can be exchanged.
 * Nothing is sealed that the grant, the machine's expiry or the clock does
 * not allow: one field for any use, a session only under a grant that has
 * sessions, never for `reveal`, and never past either expiry.
 */
export async function sealMachineAnswer(
  authority: AgentAuthority,
  machineKey: string,
  place: MachineRequestPlace,
  box: MachineSealed,
  choice: MachineChoice,
  policy: MachinePolicy,
  keeping: MachineDecisionKeeping,
): Promise<SealedMachineAnswer> {
  const bad = () => new Error('Malformed machine answer.');
  // Read once, before anything waits: what is checked is what is sealed and what is kept.
  choice = snapshotChoice(choice);
  const opened = await openMachineRequest(authority.box, machineKey, box, place);
  const request = opened.request;
  const { accountId, machineId, requestId } = opened.place;
  const { now, machineExpiresAt } = policy;
  assertTime(now);
  assertTime(machineExpiresAt);
  const use = request.kind === 'use' ? request : null;
  type Route = Pick<MachineAnswer, 'vault' | 'item' | 'version' | 'grant' | 'grantId'>;
  let route: Route = use
    ? { vault: use.vault, item: use.item, version: use.version, grant: use.grant, grantId: use.grantId }
    : { vault: null, item: null, version: null, grant: null, grantId: null };
  const signed = async (outcome: MachineOutcome, deadline: number | null, release: MachineSealed | null, details: Pick<MachineDecisionRecord, 'release' | 'field' | 'until'>): Promise<SealedMachineAnswer> => {
    const answerDigest = release ? await machineAnswerDigest(release, opened.place) : null;
    const statement: MachineDecisionStatement = { accountId, machineId, requestId, request: opened.digest, outcome, to: use ? use.key : null, from: authority.box.publicKey, ...route, deadline, answer: answerDigest };
    const sig = await signStatement(authority, { kind: 'decision', ...statement });
    const answer: MachineAnswer = { outcome, to: statement.to, ...route, deadline, sig, box: release };
    const record: MachineDecisionRecord = { statement, sig, signedBy: authority.sign.publicKey, at: now, shown: request, ...details };
    // Sealed here, from what was signed, before any caller holds an object it could change.
    const kept = await sealMachineDecisionRecord(keeping.productKey, keeping.deviceId, record, { points: authorityPointsOf(authority), verify: authority.sign.verify });
    return { answer, record, kept };
  };
  if (!choice.allow) return signed('deny', null, null, { release: null, field: null, until: null });
  if (machineExpiresAt <= now) throw bad();
  if (use ? now - use.at > REQUEST_FRESH_MS || use.at - now > REQUEST_FRESH_MS : now - request.at > REQUEST_FRESH_MS || request.at - now > REQUEST_FRESH_MS) throw bad();
  if ('grant' in choice) {
    const made = choice.grant;
    if (use || !isObject(made) || !isId(made.vault) || !(made.item === null || isId(made.item)) || !isId(made.id) || !isCount(made.rev)) throw bad();
    route = { vault: made.vault, item: made.item, version: null, grant: made.rev, grantId: made.id };
    return signed('allow', null, null, { release: 'grant', field: null, until: null });
  }
  const grant = policy.grant;
  if (!use || !isMachineGrant(grant) || grant.id !== use.grantId || grant.rev !== use.grant || !grant.uses.includes(use.operation.use)) throw bad();
  const ends = Math.min(machineExpiresAt, grant.expiresAt ?? Number.MAX_SAFE_INTEGER);
  assertTime(choice.deadline);
  if (ends <= now || choice.deadline <= now || choice.deadline > now + MAX_DEADLINE_MS || choice.deadline > ends) throw bad();
  const release = choice.release;
  const body: Record<string, unknown> = {
    request: opened.digest,
    to: use.key,
    operation: await operationDigest(use.operation),
    ...route,
    release: release.kind,
    from: now,
    deadline: choice.deadline,
  };
  if (release.kind === 'once') {
    if (typeof release.value !== 'string') throw bad();
    body.field = use.field;
    body.value = release.value;
  } else {
    if (use.operation.use === 'reveal' || grant.approval !== 'session') throw bad();
    assertTime(release.until);
    if (release.until <= now || release.until > now + grant.session! * 1000 || release.until > ends) throw bad();
    body.key = await rawKey(release.key);
    body.until = release.until;
  }
  const plaintext = utf8(JSON.stringify(body));
  try {
    const sealed = await sealAuthBox(authority.box, use.key, plaintext, MACHINE_RELEASE_INFO, machineReleaseAad(opened.place));
    return await signed('allow', choice.deadline, sealed, {
      release: release.kind,
      field: release.kind === 'once' ? use.field : null,
      until: release.kind === 'session' ? release.until : null,
    });
  } finally {
    wipe(plaintext);
  }
}

/** An answer as the machine takes it. */
export type OpenedMachineAnswer =
  | { outcome: 'deny' }
  /** An ask for access was allowed with this grant, which arrives as a box of its own. */
  | { outcome: 'allow'; release: 'grant'; grant: MachineGrantReference }
  | { outcome: 'allow'; release: 'once'; field: string; value: string; deadline: number }
  | { outcome: 'allow'; release: 'session'; key: CryptoKey; until: number; deadline: number };

/** What the machine holds that an answer is checked against beside the request: the grant from its own box, when it ends, and its clock. */
export interface MachineAnswerContext {
  /** The grant from the machine's own box; null for an ask for access, which no grant answers. */
  grant: MachineGrant | null;
  machineExpiresAt: number;
  now: number;
}

/**
 * Checks and opens the answer to a request this machine keeps outstanding,
 * with the request's own key. The signature must be the authority's, over
 * this request's digest, its key, the pinned `T`, the routing and the box;
 * the box must name the same request, key, operation, item and grant, and
 * release no more than the grant allows: one field for one use, or a
 * session no longer than the grant's from when it was approved, never for
 * `reveal`, and never past the grant's or the machine's end. Anything else
 * fails as a `DecryptionError`.
 */
export async function openMachineAnswer(
  requestKey: MemberKey,
  pinned: PinnedAuthority,
  outstanding: OutstandingRequest,
  answer: MachineAnswer,
  context: MachineAnswerContext,
): Promise<OpenedMachineAnswer> {
  const malformed = () => new DecryptionError('Malformed machine answer.');
  const request = await checkRequest(outstanding.request).catch(() => {
    throw malformed();
  });
  if ((await machineRequestDigest(outstanding.box, outstanding.place)) !== outstanding.digest) throw malformed();
  if (!isObject(answer) || (answer.outcome !== 'allow' && answer.outcome !== 'deny')) throw malformed();
  const box = answer.box === null ? null : await assertAuthSealed(answer.box, () => new DecryptionError('Malformed sealed box.'));
  const answerDigest = box ? await machineAnswerDigest(box, outstanding.place) : null;
  const use = request.kind === 'use' ? request : null;
  const { accountId, machineId, requestId } = outstanding.place;
  await checkOwnerStatement(
    pinned,
    {
      kind: 'decision',
      accountId,
      machineId,
      requestId,
      request: outstanding.digest,
      outcome: answer.outcome,
      to: use ? use.key : null,
      from: pinned.points.box,
      vault: answer.vault,
      item: answer.item,
      version: answer.version,
      grant: answer.grant,
      grantId: answer.grantId,
      deadline: answer.deadline,
      answer: answerDigest,
    },
    answer.sig,
  );
  if (answer.to !== (use ? use.key : null)) throw malformed();
  if (!use) {
    if (box || answer.deadline !== null || answer.version !== null) throw malformed();
    if (answer.outcome === 'deny') {
      if (answer.vault !== null || answer.item !== null || answer.grant !== null || answer.grantId !== null) throw malformed();
      return { outcome: 'deny' };
    }
    if (!isId(answer.vault) || !(answer.item === null || isId(answer.item)) || !isCount(answer.grant) || !isId(answer.grantId)) throw malformed();
    return { outcome: 'allow', release: 'grant', grant: { vault: answer.vault, item: answer.item, id: answer.grantId, rev: answer.grant } };
  }
  if (answer.vault !== use.vault || answer.item !== use.item || answer.version !== use.version || answer.grant !== use.grant || answer.grantId !== use.grantId) throw malformed();
  if (answer.outcome === 'deny') {
    if (box || answer.deadline !== null) throw malformed();
    return { outcome: 'deny' };
  }
  const { grant, now, machineExpiresAt } = context;
  if (!isCount(now) || !isCount(machineExpiresAt)) throw malformed();
  if (use.key !== requestKey.publicKey || !box || !isCount(answer.deadline) || answer.deadline <= now) throw malformed();
  if (!isMachineGrant(grant) || grant.id !== use.grantId || grant.rev !== use.grant || !grant.uses.includes(use.operation.use)) throw malformed();
  const ends = Math.min(machineExpiresAt, grant.expiresAt ?? Number.MAX_SAFE_INTEGER);
  if (ends <= now || answer.deadline > ends) throw malformed();
  const body = parseBody(await openAuthBox(requestKey, pinned.points.box, box, MACHINE_RELEASE_INFO, machineReleaseAad(outstanding.place)), malformed);
  const common = ['request', 'to', 'operation', 'vault', 'item', 'version', 'grant', 'grantId', 'release', 'from', 'deadline'];
  if (body.request !== outstanding.digest || body.to !== use.key || body.operation !== (await operationDigest(use.operation))) throw malformed();
  if (body.vault !== use.vault || body.item !== use.item || body.version !== use.version || body.grant !== use.grant || body.grantId !== use.grantId || body.deadline !== answer.deadline) throw malformed();
  if (!isCount(body.from) || body.from > now + CLOCK_SKEW_MS || body.from >= answer.deadline || answer.deadline > body.from + MAX_DEADLINE_MS) throw malformed();
  if (body.release === 'once') {
    if (!hasKeys(body, ...common, 'field', 'value') || body.field !== use.field || typeof body.value !== 'string') throw malformed();
    return { outcome: 'allow', release: 'once', field: use.field, value: body.value, deadline: answer.deadline };
  }
  if (body.release !== 'session' || !hasKeys(body, ...common, 'key', 'until')) throw malformed();
  if (use.operation.use === 'reveal' || grant.approval !== 'session' || !isCount(body.until) || body.until <= now) throw malformed();
  if (body.until - body.from > grant.session! * 1000 || body.until > ends) throw malformed();
  return { outcome: 'allow', release: 'session', key: await importKeyText(body.key), until: body.until, deadline: answer.deadline };
}

// ---------------------------------------------------------------------------
// The machine's log, and what it hands the person

/** One entry of a machine's log: the run it belongs to, when, and what the runtime wrote. */
export interface MachineLogEntry {
  /** A random id, one per run, so each run numbers its entries from 1. */
  stream: string;
  at: number;
  entry: Record<string, unknown>;
}

/** One log entry, sealed from the machine to the authority at its place in its run. */
export async function sealMachineLogEntry(machine: MemberKey, pinned: PinnedAuthority, accountId: string, machineId: string, sequence: number, entry: MachineLogEntry): Promise<MachineSealed> {
  const aad = machineLogAad(accountId, machineId, sequence);
  if (!isId(entry.stream) || !isCount(entry.at) || !isSmallObject(entry.entry, MAX_ENTRY_BYTES)) throw new Error('Malformed log entry.');
  const plaintext = utf8(JSON.stringify({ stream: entry.stream, at: entry.at, entry: entry.entry }));
  try {
    return await sealAuthBox(machine, pinned.points.box, plaintext, MACHINE_LOG_INFO, aad);
  } finally {
    wipe(plaintext);
  }
}

/**
 * Opens a log entry with `T` (or a retired one), as from the machine's
 * pinned point, at the place the server filed it. The run it names must be
 * the run it was filed under, so an entry cannot be moved between runs.
 */
export async function openMachineLogEntry(boxKey: MemberKey, machineKey: string, box: MachineSealed, accountId: string, machineId: string, stream: string, sequence: number): Promise<MachineLogEntry> {
  const aad = machineLogAad(accountId, machineId, sequence);
  if (!isId(stream)) throw new Error('Malformed log entry.');
  const bad = () => new DecryptionError('Malformed log entry.');
  const sealed = await assertAuthSealed(box, () => new DecryptionError('Malformed sealed box.'));
  const body = parseBody(await openAuthBox(boxKey, machineKey, sealed, MACHINE_LOG_INFO, aad), bad);
  if (!hasKeys(body, 'stream', 'at', 'entry') || body.stream !== stream || !isCount(body.at) || !isSmallObject(body.entry, MAX_ENTRY_BYTES)) throw bad();
  return { stream, at: body.at, entry: body.entry };
}

/** Something a machine hands the person to keep, sealed to the authority. */
export async function sealMachineInboxEntry(machine: MemberKey, pinned: PinnedAuthority, accountId: string, machineId: string, entryId: string, body: Record<string, unknown>): Promise<MachineSealed> {
  const aad = machineInboxAad(accountId, machineId, entryId);
  if (!isSmallObject(body, MAX_ENTRY_BYTES)) throw new Error('Malformed inbox entry.');
  const plaintext = utf8(JSON.stringify(body));
  try {
    return await sealAuthBox(machine, pinned.points.box, plaintext, MACHINE_INBOX_INFO, aad);
  } finally {
    wipe(plaintext);
  }
}

export async function openMachineInboxEntry(boxKey: MemberKey, machineKey: string, box: MachineSealed, accountId: string, machineId: string, entryId: string): Promise<Record<string, unknown>> {
  const aad = machineInboxAad(accountId, machineId, entryId);
  const bad = () => new DecryptionError('Malformed inbox entry.');
  const sealed = await assertAuthSealed(box, () => new DecryptionError('Malformed sealed box.'));
  const body = parseBody(await openAuthBox(boxKey, machineKey, sealed, MACHINE_INBOX_INFO, aad), bad);
  if (!isSmallObject(body, MAX_ENTRY_BYTES)) throw bad();
  return body;
}

/**
 * A deciding device's own record of what it decided, kept under Passhold's
 * key: the statement it signed, as signed, and what went with it. It stays
 * readable after the server lets the request go.
 */
export interface MachineDecisionRecord {
  statement: MachineDecisionStatement;
  sig: string;
  /** The signing point the signature checks out against. */
  signedBy: string;
  /** When the device decided. */
  at: number;
  /** The request as the device showed it. */
  shown: MachineRequest;
  /** What went with an allow: one field, a session, or a grant made for an ask for access; null for a denial. */
  release: 'once' | 'session' | 'grant' | null;
  /** The field released once, never its value. */
  field: string | null;
  /** When a session ends. */
  until: number | null;
}

/** A decision's one identity: the digest of the statement signed, which no other spelling of its signature changes. */
export async function machineDecisionId(statement: MachineDecisionStatement): Promise<string> {
  const bytes = ownerStatementBytes({ kind: 'decision', ...statementOf(statement as unknown as Record<string, unknown>) });
  return toBase64(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes as BufferSource)));
}

const statementOf = (value: Record<string, unknown>): MachineDecisionStatement => ({
  accountId: value.accountId as string,
  machineId: value.machineId as string,
  requestId: value.requestId as string,
  request: value.request as string,
  outcome: value.outcome as MachineOutcome,
  to: value.to as string | null,
  from: value.from as string,
  vault: value.vault as string | null,
  item: value.item as string | null,
  version: value.version as number | null,
  grant: value.grant as number | null,
  grantId: value.grantId as string | null,
  deadline: value.deadline as number | null,
  answer: value.answer as string | null,
});

async function checkDecisionRecord(value: unknown, place: MachineRequestPlace): Promise<MachineDecisionRecord> {
  const bad = () => new Error('Malformed machine answer.');
  if (!isObject(value) || !hasKeys(value, 'statement', 'sig', 'signedBy', 'at', 'shown', 'release', 'field', 'until')) throw bad();
  const raw = value.statement;
  if (!isObject(raw) || !hasKeys(raw, 'accountId', 'machineId', 'requestId', 'request', 'outcome', 'to', 'from', 'vault', 'item', 'version', 'grant', 'grantId', 'deadline', 'answer')) throw bad();
  const statement = statementOf(raw);
  ownerStatementBytes({ kind: 'decision', ...statement });
  if (statement.accountId !== place.accountId || statement.machineId !== place.machineId || statement.requestId !== place.requestId) throw bad();
  const { sig, signedBy, at, release, field, until } = value;
  if (base64Bytes(sig, SIGNATURE_BYTES, SIGNATURE_BYTES) === null || !(await isCanonicalPoint(signedBy)) || !isCount(at) || !(await isCanonicalPoint(statement.from))) throw bad();
  const shown = await checkRequest(value.shown);
  const use = shown.kind === 'use' ? shown : null;
  if (statement.to !== (use ? use.key : null)) throw bad();
  if (use && (statement.vault !== use.vault || statement.item !== use.item || statement.version !== use.version || statement.grant !== use.grant || statement.grantId !== use.grantId)) throw bad();
  const released = statement.answer !== null;
  if (statement.outcome === 'deny') {
    if (release !== null || field !== null || until !== null || released || statement.deadline !== null) throw bad();
    if (!use && (statement.vault !== null || statement.item !== null || statement.grant !== null || statement.grantId !== null)) throw bad();
  } else if (release === 'once') {
    if (!use || field !== use.field || until !== null || !released) throw bad();
  } else if (release === 'session') {
    if (!use || use.operation.use === 'reveal' || field !== null || !isCount(until) || !released) throw bad();
  } else if (release === 'grant') {
    if (use || field !== null || until !== null || released || statement.vault === null || statement.grant === null || statement.grantId === null) throw bad();
  } else throw bad();
  return { statement, sig: sig as string, signedBy: signedBy as string, at, shown, release: release as MachineDecisionRecord['release'], field: field as string | null, until: until as number | null };
}

/** Seals a device's record of its decision, once its signature checks out against the authority that made it. */
export async function sealMachineDecisionRecord(productKey: CryptoKey, deviceId: string, record: MachineDecisionRecord, pinned: PinnedAuthority): Promise<SealedBox> {
  const place = { accountId: record.statement?.accountId, machineId: record.statement?.machineId, requestId: record.statement?.requestId } as MachineRequestPlace;
  const aad = machineDecisionAad(place, deviceId);
  const checked = await checkDecisionRecord(record, place);
  if (checked.signedBy !== pinned.points.sign || checked.statement.from !== pinned.points.box) throw new Error('Malformed machine answer.');
  await checkOwnerStatement(pinned, { kind: 'decision', ...checked.statement }, checked.sig);
  const box = await sealBounded(productKey, checked, aad, MAX_BOX_BYTES);
  if (!box) throw new Error('Malformed machine answer.');
  return box;
}

/**
 * Opens a device's record of its decision. Given the authority that was
 * trusted when it was made, the record's signature is checked against it too.
 */
export async function openMachineDecisionRecord(productKey: CryptoKey, box: SealedBox, place: MachineRequestPlace, deviceId: string, signedBy?: PinnedAuthority): Promise<MachineDecisionRecord> {
  const body = await openJson<unknown>(productKey, sealedOrRefuse(box), machineDecisionAad(place, deviceId));
  let record: MachineDecisionRecord;
  try {
    record = await checkDecisionRecord(body, place);
  } catch {
    throw new DecryptionError('Malformed machine answer.');
  }
  if (signedBy) {
    if (record.signedBy !== signedBy.points.sign || record.statement.from !== signedBy.points.box) throw new DecryptionError('That was not signed by this account’s Passhold.');
    await checkOwnerStatement(signedBy, { kind: 'decision', ...record.statement }, record.sig);
  }
  return record;
}

// ---------------------------------------------------------------------------
// What Passhold remembers of each machine, and of all of them

/** A grant as the owner's pin keeps it: one item, or a whole vault and what is added to it. */
export interface MachinePinGrant extends MachineGrant {
  vault: string;
  /** Null for the whole vault. */
  item: string | null;
}

/** One item version of an agent vault. */
export interface AgentItemVersion {
  vault: string;
  item: string;
  version: number;
}

/**
 * What a machine could have read of one item version: its key, when it was
 * delivered standing or for a session, and the fields whose values it could
 * have read, each with the SHA-256 of the value then, so Passhold can tell
 * when each has since changed.
 */
export interface MachineExposure extends AgentItemVersion {
  key: boolean;
  fields: { name: string; value: string }[];
}

export type MachineKind = 'enrolled' | 'token';

/** What Passhold pins of one machine. The server knows the machine by id alone. */
export interface MachinePin {
  /** Each change to the pin has a higher one. */
  rev: number;
  kind: MachineKind;
  /** The machine's point `A`. */
  key: string;
  name: string;
  createdAt: number;
  expiresAt: number;
  grants: MachinePinGrant[];
  /** The highest revision any grant or withdrawal to this machine has had: the next of either goes above it. */
  lastGrant: number;
  exposed: MachineExposure[];
  /** When it was removed; null while it is not. */
  removedAt: number | null;
}

function isItemVersion(value: unknown): value is AgentItemVersion {
  return isObject(value) && hasKeys(value, 'vault', 'item', 'version') && isId(value.vault) && isId(value.item) && isCount(value.version);
}

function isExposure(value: unknown): value is MachineExposure {
  if (!isObject(value) || !hasKeys(value, 'vault', 'item', 'version', 'key', 'fields')) return false;
  const { vault, item, version, key, fields } = value;
  if (!isId(vault) || !isId(item) || !isCount(version) || typeof key !== 'boolean' || !Array.isArray(fields) || fields.length > MAX_HEADERS) return false;
  if (!fields.every((field) => isObject(field) && hasKeys(field, 'name', 'value') && isName(field.name, MAX_FIELD) && isDigest(field.value))) return false;
  return unique(fields.map((field) => field.name as string)) && (key || fields.length > 0);
}

const versionKey = (entry: AgentItemVersion) => `${entry.vault}:${entry.item}:${entry.version}`;
const itemKey = (entry: { vault: string; item: string | null }) => `${entry.vault}:${entry.item ?? ''}`;

async function checkPin(value: unknown): Promise<MachinePin> {
  const bad = () => new Error('Malformed machine pin.');
  if (!isObject(value) || !hasKeys(value, 'rev', 'kind', 'key', 'name', 'createdAt', 'expiresAt', 'grants', 'lastGrant', 'exposed', 'removedAt')) throw bad();
  const { rev, kind, key, name, createdAt, expiresAt, grants, lastGrant, exposed, removedAt } = value;
  if (!isCount(rev) || (kind !== 'enrolled' && kind !== 'token') || !isText(name, MAX_NAME) || !isCount(createdAt) || !isCount(expiresAt) || expiresAt < createdAt) throw bad();
  if (!(removedAt === null || (isCount(removedAt) && removedAt >= createdAt)) || !isZeroOrMore(lastGrant) || !(await isCanonicalPoint(key))) throw bad();
  if (!Array.isArray(grants) || grants.length > MAX_GRANTS || !Array.isArray(exposed) || exposed.length > MAX_EXPOSED) throw bad();
  const pinGrants: MachinePinGrant[] = [];
  for (const grant of grants) {
    if (!isObject(grant) || !isId(grant.vault) || !(grant.item === null || isId(grant.item))) throw bad();
    const { vault, item, ...rest } = grant;
    if (!isMachineGrant(rest) || !hasKeys(rest, 'id', 'rev', 'uses', 'approval', 'session', 'bounds', 'expiresAt') || rest.rev > lastGrant) throw bad();
    // A value an agent may read is given item by item, never with everything a vault holds or comes to hold.
    if (item === null && rest.uses.includes('reveal')) throw bad();
    pinGrants.push({ ...grantOf(rest), vault: vault as string, item: item as string | null });
  }
  if (!unique(pinGrants.map(itemKey)) || !unique(pinGrants.map((grant) => grant.id)) || !exposed.every(isExposure) || !unique(exposed.map(versionKey))) throw bad();
  return {
    rev,
    kind,
    key: key as string,
    name,
    createdAt,
    expiresAt,
    grants: pinGrants,
    lastGrant,
    exposed: exposed.map((entry: MachineExposure) => ({
      vault: entry.vault,
      item: entry.item,
      version: entry.version,
      key: entry.key,
      fields: entry.fields.map((field) => ({ name: field.name, value: field.value })),
    })),
    removedAt: removedAt as number | null,
  };
}

export async function sealMachinePin(productKey: CryptoKey, accountId: string, machineId: string, pin: MachinePin): Promise<SealedBox> {
  const aad = machinePinAad(accountId, machineId);
  const box = await sealBounded(productKey, await checkPin(pin), aad, MAX_STATE_BYTES);
  if (!box) throw new Error('Malformed machine pin.');
  return box;
}

/** Opens a pin. One under another key, or for another account or machine, fails as a `DecryptionError`. */
export async function openMachinePin(productKey: CryptoKey, box: SealedBox, accountId: string, machineId: string): Promise<MachinePin> {
  const body = await openJson<unknown>(productKey, sealedOrRefuse(box, MAX_STATE_BYTES), machinePinAad(accountId, machineId));
  try {
    return await checkPin(body);
  } catch {
    throw new DecryptionError('Malformed machine pin.');
  }
}

/** The digest of a pin's box, for its place: what the directory commits to. */
export async function machinePinDigest(box: SealedBox, accountId: string, machineId: string): Promise<string> {
  const aad = fromUtf8(machinePinAad(accountId, machineId));
  if (!isSealed(box, MAX_STATE_BYTES)) throw new Error('Malformed sealed box.');
  return digestOf(aad, box.iv, box.ct);
}

/** An item that has had a new key: its version now, and a commitment to that key, so a device takes no other wrap of the same version. */
export interface AgentReplacedItem extends AgentItemVersion {
  /** `agentItemKeyCheck` of the key: nothing that opens a record. */
  check: string;
}

/**
 * The commitment to one item version's key: SHA-256 over the label, the
 * account, the vault, the item, the version and the key. The key is random,
 * so the digest opens nothing, and it names one key for one place.
 */
export async function agentItemKeyCheck(accountId: string, entry: AgentItemVersion, key: CryptoKey): Promise<string> {
  ids(accountId, entry.vault, entry.item);
  assertPositive(entry.version, 'version');
  const algorithm = key.algorithm as AesKeyAlgorithm;
  if (algorithm.name !== 'AES-GCM' || algorithm.length !== 256) throw new DecryptionError('That box does not hold a key.');
  return digestOf(AGENT_ITEM_CHECK, accountId, entry.vault, entry.item, String(entry.version), await rawKey(key));
}

/**
 * The account's agent directory: one versioned list of every machine's pin,
 * every vault with its write key, every grant of a whole vault, every item
 * version still to be replaced, and, for each item that has been, the
 * version and key that replaced it. A removal changes the directory alone,
 * so it fits whatever the pins hold. Each device remembers the latest
 * version and digest it trusted, and refuses an older one, another one of
 * the same version, or a next one that does not name it.
 */
export interface AgentDirectory {
  version: number;
  /** The digest of the directory this one follows; null for the first alone. */
  prev: string | null;
  authority: AgentAuthorityPoints;
  vaults: { id: string; generation: number; write: string }[];
  machines: { id: string; rev: number; pin: string; removed: boolean }[];
  wholeVault: { machine: string; vault: string; rev: number }[];
  /** Item versions a machine that is gone could have opened, until each is replaced. */
  rekey: AgentItemVersion[];
  replaced: AgentReplacedItem[];
}

async function checkDirectory(value: unknown): Promise<AgentDirectory> {
  const bad = () => new Error('Malformed agent directory.');
  if (!isObject(value) || !hasKeys(value, 'version', 'prev', 'authority', 'vaults', 'machines', 'wholeVault', 'rekey', 'replaced')) throw bad();
  const { version, prev, authority, vaults, machines, wholeVault, rekey, replaced } = value;
  if (!isCount(version) || (version === 1 ? prev !== null : !isDigest(prev))) throw bad();
  let points: AgentAuthorityPoints;
  try {
    points = await assertAuthorityPoints(authority);
  } catch {
    throw bad();
  }
  if (!Array.isArray(vaults) || vaults.length > MAX_VAULTS || !Array.isArray(machines) || machines.length > MAX_MACHINES) throw bad();
  if (!Array.isArray(wholeVault) || wholeVault.length > MAX_WHOLE_VAULT || !Array.isArray(rekey) || rekey.length > MAX_ITEM_VERSIONS || !Array.isArray(replaced) || replaced.length > MAX_REPLACED) throw bad();
  for (const vault of vaults) {
    if (!isObject(vault) || !hasKeys(vault, 'id', 'generation', 'write') || !isId(vault.id) || !isCount(vault.generation) || !(await isCanonicalPoint(vault.write))) throw bad();
  }
  if (!machines.every((machine) => isObject(machine) && hasKeys(machine, 'id', 'rev', 'pin', 'removed') && isId(machine.id) && isCount(machine.rev) && isDigest(machine.pin) && typeof machine.removed === 'boolean')) throw bad();
  const vaultIds = new Set(vaults.map((vault) => vault.id as string));
  const live = new Set(machines.filter((machine) => machine.removed === false).map((machine) => machine.id as string));
  if (vaultIds.size !== vaults.length || !unique(machines.map((machine) => machine.id as string))) throw bad();
  if (!wholeVault.every((grant) => isObject(grant) && hasKeys(grant, 'machine', 'vault', 'rev') && live.has(grant.machine as string) && vaultIds.has(grant.vault as string) && isCount(grant.rev))) throw bad();
  if (!unique(wholeVault.map((grant) => `${grant.machine}:${grant.vault}`))) throw bad();
  if (!rekey.every((entry) => isItemVersion(entry) && vaultIds.has(entry.vault)) || !unique(rekey.map(versionKey))) throw bad();
  const isReplaced = (entry: unknown): entry is AgentReplacedItem =>
    isObject(entry) && hasKeys(entry, 'vault', 'item', 'version', 'check') && isId(entry.vault) && vaultIds.has(entry.vault) && isId(entry.item) && isCount(entry.version) && entry.version > 1 && isDigest(entry.check);
  if (!replaced.every(isReplaced) || !unique(replaced.map((entry: AgentReplacedItem) => itemKey(entry)))) throw bad();
  return {
    version,
    prev: prev as string | null,
    authority: points,
    vaults: vaults.map((vault) => ({ id: vault.id as string, generation: vault.generation as number, write: vault.write as string })),
    machines: machines.map((machine) => ({ id: machine.id, rev: machine.rev, pin: machine.pin, removed: machine.removed })),
    wholeVault: wholeVault.map((grant) => ({ machine: grant.machine, vault: grant.vault, rev: grant.rev })),
    rekey: rekey.map((entry: AgentItemVersion) => ({ vault: entry.vault, item: entry.item, version: entry.version })),
    replaced: replaced.map((entry: AgentReplacedItem) => ({ vault: entry.vault, item: entry.item, version: entry.version, check: entry.check })),
  };
}

export async function sealAgentDirectory(productKey: CryptoKey, accountId: string, directory: AgentDirectory): Promise<SealedBox> {
  const aad = agentDirectoryAad(accountId);
  const box = await sealBounded(productKey, await checkDirectory(directory), aad, MAX_STATE_BYTES);
  if (!box) throw new Error('Malformed agent directory.');
  return box;
}

/** Opens the directory. One under another key, or for another account, fails as a `DecryptionError`. */
export async function openAgentDirectory(productKey: CryptoKey, box: SealedBox, accountId: string): Promise<AgentDirectory> {
  const body = await openJson<unknown>(productKey, sealedOrRefuse(box, MAX_STATE_BYTES), agentDirectoryAad(accountId));
  try {
    return await checkDirectory(body);
  } catch {
    throw new DecryptionError('Malformed agent directory.');
  }
}

/** The digest of a directory's box: what a device remembers beside its version, and the next directory names as `prev`. */
export async function agentDirectoryDigest(box: SealedBox, accountId: string): Promise<string> {
  const aad = fromUtf8(agentDirectoryAad(accountId));
  if (!isSealed(box, MAX_STATE_BYTES)) throw new Error('Malformed sealed box.');
  return digestOf(aad, box.iv, box.ct);
}

/**
 * Checks an item version's key against the directory a device trusts: an
 * item that has had a new key is trusted only at that version and with the
 * key committed to, so an older wrap, or a competing one for the same
 * version that lost, is refused. An item the directory does not name has
 * never had a new key, and is trusted at its first version alone.
 */
export async function checkAgentItemKey(directory: AgentDirectory, accountId: string, entry: AgentItemVersion, key: CryptoKey): Promise<void> {
  const refuse = () => new DecryptionError('That item key is not the one Passhold trusts.');
  const known = directory.replaced.find((replaced) => replaced.vault === entry.vault && replaced.item === entry.item);
  if (!known) {
    if (entry.version !== 1) throw refuse();
    return;
  }
  if (known.version !== entry.version || known.check !== (await agentItemKeyCheck(accountId, entry, key))) throw refuse();
}

// ---------------------------------------------------------------------------
// A machine's credential, and the token that carries one

/** A machine's secret for the server, or an invitation's: 32 random bytes, base64url without padding. */
export function newMachineCredential(): string {
  return toBase64Url(randomBytes(32));
}

/** Whether `value` is such a secret in its one spelling. */
export function isMachineCredential(value: unknown): value is string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(value)) return false;
  const raw = fromBase64(value);
  return raw.length === 32 && toBase64Url(raw) === value;
}

/**
 * Everything a token machine needs, made on the person's device and shown
 * once. Whoever holds the token is the machine: it is carried as a secret,
 * and nothing in it is checked against anything but itself.
 */
export interface MachineToken {
  accountId: string;
  machineId: string;
  expiresAt: number;
  credential: string;
  key: MemberKey;
  authority: AgentAuthorityPoints;
}

const TOKEN_PREFIX = 'pht_';
const TOKEN_VARIABLE = 'PASSHOLD_MACHINE_TOKEN=';

/** The token as it is shown: `pht_`, then its fields as JSON in base64url. */
export async function encodeMachineToken(token: MachineToken): Promise<string> {
  ids(token.accountId, token.machineId);
  assertTime(token.expiresAt);
  if (!isMachineCredential(token.credential)) throw new Error('Malformed machine token.');
  const authority = await assertAuthorityPoints(token.authority);
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', token.key.privateKey));
  const body = utf8(JSON.stringify({ v: 1, a: token.accountId, m: token.machineId, e: token.expiresAt, c: token.credential, k: toBase64Url(pkcs8), t: authority.box, s: authority.sign }));
  try {
    return TOKEN_PREFIX + toBase64Url(body);
  } finally {
    wipe(pkcs8);
    wipe(body);
  }
}

/** Reads a token as it was pasted, with or without the variable's name. Anything else fails with one sentence. */
export async function decodeMachineToken(input: string): Promise<MachineToken> {
  const bad = () => new Error('Malformed machine token.');
  const body = readPrefixed(input, TOKEN_PREFIX, TOKEN_VARIABLE, bad);
  if (!hasKeys(body, 'v', 'a', 'm', 'e', 'c', 'k', 't', 's') || body.v !== 1 || !isId(body.a) || !isId(body.m) || !isCount(body.e) || !isMachineCredential(body.c)) throw bad();

  let authority: AgentAuthorityPoints;
  let key: MemberKey;
  try {
    authority = await assertAuthorityPoints({ box: body.t, sign: body.s });
    key = await importEcdhPrivate(body.k, true);
  } catch {
    throw bad();
  }
  return { accountId: body.a, machineId: body.m, expiresAt: body.e, credential: body.c, key, authority };
}
