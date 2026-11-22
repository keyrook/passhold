/**
 * A family, as one product's device runs it: its member key opened with the
 * product's own key, the roster checked against what the device pinned, the
 * family's key and each collection's taken only from someone pinned, and the
 * product's records sealed, opened, pulled and pushed under them. The page
 * makes and changes the family (`console.ts`); a product reads and writes what
 * it shares, and an organiser's gives everyone new keys after someone went
 * (`rotateFamilyKeys`).
 *
 * The server can seal to any public key, but cannot make an authenticated
 * box from a member key it does not hold. So the family's key is taken only
 * from someone this device pinned with the key the box is from; on its first
 * look, from whom the roster names, as the page does. Anyone else, a new
 * organiser it has not seen or one whose key changed, is compared first, on
 * two screens (`orgCompareCode`); until then nothing from them is taken.
 * An organiser this device pinned who compared that key already, and said
 * so in a word only they could make (`vouch.ts`), stands for that comparison.
 * A key this device saw end (`OrgPin.retired`) is someone gone's, or one they
 * replaced: it is taken for nothing new.
 */
import { DecryptionError, type SealedBox } from '../crypto/aead.js';
import {
  checkOrgRecord,
  newWriteKey,
  openCollectionGeneration,
  openCollectionMembersOf,
  sealCollectionGeneration,
  sealCollectionMembers,
  signOrgRecord,
  type HeldGeneration,
  type WriteKey,
} from '../keys/org/access.js';
import { newOrgKey, openOrgKey, sealOrgKey, type AuthBox } from '../keys/org/authbox.js';
import {
  newCollectionKey,
  openCollectionName,
  openOrgRecord,
  openOrgTombstone,
  sealCollectionName,
  sealOrgRecord,
  sealOrgTombstone,
} from '../keys/org/collection.js';
import { orgCompareCode } from '../keys/org/confirm.js';
import { openMemberKeyWithProduct, openMemberKeyWithRoot, sealMemberKeyUnderProduct, type MemberKey, type MemberRootBox } from '../keys/org/member.js';
import {
  checkRoster,
  collectionSenderKey,
  leftSince,
  makeRoster,
  nextOrgPin,
  openOrgPin,
  pinnedKey,
  retiredKey,
  sealOrgPin,
  trustedOrgPin,
  type OrgPin,
  type RosterCheck,
} from '../keys/org/roster.js';
import { vouchedFor } from '../keys/org/vouch.js';
import { openRootWithPassword, type AccountRoot } from '../keys/root.js';
import type { AccountKeys } from '../sync/account.js';
import { SyncHttpError, type HttpSyncAdapter } from '../sync/http.js';
import type { OrgDetail, OrgPushResponse, OrgRecord } from '../sync/protocol.js';
import type { ProductKey } from './product-key.js';
import { boxFrom, wire } from './wire.js';

/** A collection of this product, with each of its keys the person holds. */
export interface FamilyCollection {
  id: string;
  /** Opened under its key in use. */
  name: string;
  /** The generation every record is written under. */
  generation: number;
  /** By generation: the one in use, and older ones, to read what is not sealed again yet. */
  keys: Map<number, CryptoKey>;
  /**
   * By generation, where view only is on: the write key each record of it is
   * signed with. A record of such a generation opens only with a signature
   * that checks out.
   */
  writeKeys: Map<number, WriteKey>;
  /** Whether this person may write here: always without view only, and with it, only holding the write key's private half. */
  canEdit: boolean;
}

/** Someone whose key is not the one this device pinned for them: compared on two screens before anything of theirs is taken. */
export interface FamilyKeyChange {
  accountId: string;
  /** The key the roster lists for them now. */
  memberKey: string;
}

/** What a product's device holds of a family while it is open. Never the root. */
export interface ProductFamily {
  orgId: string;
  accountId: string;
  product: string;
  /**
   * The family as the server tells it: names, addresses, roles,
   * `org.rotationDue`. Whose key is whose comes from `roster`, never from here.
   */
  detail: OrgDetail;
  member: MemberKey;
  roster: RosterCheck;
  /** What this device keeps of the family, sealed under the product's key, to pass back to `openFamily` next time. */
  pinned: SealedBox;
  keyChanged: FamilyKeyChange[];
  /**
   * Account ids the roster no longer lists, once each, for the app to say so.
   * Nothing proves why someone went: a start over leaves no key to sign with,
   * so an organiser's app acts on the server's word that they did. This is
   * how a server's putting someone out is seen.
   */
  left: string[];
  collections: FamilyCollection[];
}

export type OpenedFamily =
  | { status: 'open'; family: ProductFamily }
  /** Accepted, and an organiser has not confirmed them yet: there is no family key to hold. */
  | { status: 'waiting' }
  /**
   * This product has no box of the member key, or one that does not open: the
   * root opens it once (`unlockWith`), or the account page gives it
   * (`consoleFamilyKeyToApps`).
   */
  | { status: 'needs-root' }
  /**
   * The family's key is from someone this device has not pinned with that
   * key. The two compare `code`; on a match, `trustFamilyMember` with
   * `accountId` and `memberKey`, then `openFamily` again.
   */
  | { status: 'compare'; accountId: string; memberKey: string; code: string };

/** A key the roster lists, read as the roster's own line: never one the server lists beside it. */
const listedKey = (roster: RosterCheck, accountId: string): string | undefined =>
  roster.body.members.find((line) => line.accountId === accountId)?.memberKey;

/** The pin this device kept, sealed under the product's key in use, or the one it replaced (`replaceProductKey`). */
async function pinFrom(productKey: ProductKey, orgId: string, pinned: SealedBox, previousKey?: CryptoKey): Promise<OrgPin> {
  const { accountId, product } = productKey;
  try {
    return await openOrgPin(productKey.key, pinned, orgId, accountId, product);
  } catch (error) {
    if (!(error instanceof DecryptionError) || !previousKey) throw error;
    return openOrgPin(previousKey, pinned, orgId, accountId, product);
  }
}

async function rootOf(api: HttpSyncAdapter, productKey: ProductKey, unlockWith: { keys: AccountKeys } | { root: AccountRoot }): Promise<AccountRoot> {
  let root: AccountRoot;
  if ('root' in unlockWith) {
    root = unlockWith.root;
  } else {
    const held = await api.accountKeys();
    if (held.accountId !== productKey.accountId) throw new Error('The server answered for another account.');
    if (!held.root?.passwordWrap) throw new Error('This account has no password to open its keys with.');
    root = await openRootWithPassword(held.root.passwordWrap, unlockWith.keys, productKey.accountId);
  }
  // The root this product pinned: another, even one the server reports, is not taken here.
  if (root.publicKey !== productKey.root) throw new Error('The account’s root key is not the one this app trusts. Open this app’s key again first.');
  return root;
}

/**
 * The member key, from this product's box; from the box under the key it
 * replaced, sealed again under the new one; or from the root, once, then kept
 * under the product's key so it is not asked again. Null when only the root
 * would open it and none was given.
 */
async function memberKeyOf(
  api: HttpSyncAdapter,
  productKey: ProductKey,
  detail: OrgDetail,
  input: { unlockWith?: { keys: AccountKeys } | { root: AccountRoot }; previousKey?: CryptoKey },
): Promise<MemberKey | null> {
  const orgId = detail.org.id;
  const { accountId, product } = productKey;
  const box = detail.me.productBoxes.find((entry) => entry.product === product);
  for (const key of box ? [productKey.key, ...(input.previousKey ? [input.previousKey] : [])] : []) {
    let member: MemberKey;
    try {
      member = await openMemberKeyWithProduct(boxFrom(box!.box), key, orgId, accountId, product);
    } catch (error) {
      if (error instanceof DecryptionError) continue;
      throw error;
    }
    if (key !== productKey.key) await api.putOrgProductBox(orgId, product, { box: wire(await sealMemberKeyUnderProduct(member, productKey.key, orgId, accountId, product)) });
    return member;
  }
  if (!input.unlockWith) return null;
  const root = await rootOf(api, productKey, input.unlockWith);
  let member: MemberKey;
  try {
    member = await openMemberKeyWithRoot(boxFrom<MemberRootBox>(detail.me.rootBox), root, orgId, accountId);
  } catch (error) {
    if (error instanceof DecryptionError) throw new Error('Your key for your family does not open with this account’s root. Nothing was changed.');
    throw error;
  }
  await api.putOrgProductBox(orgId, product, { box: wire(await sealMemberKeyUnderProduct(member, productKey.key, orgId, accountId, product)) });
  return member;
}

/**
 * Opens a family on a product's device, as often as it syncs: the member key,
 * the family's key in use, the roster under it against what this device
 * pinned (`pinned`, from the last time), and the key and name of each of this
 * product's collections the person holds. A roster older than the pin, or one
 * that lists another key for the person, is refused.
 *
 * `previousKey`: while this product's key is being replaced
 * (`replaceProductKey`), the key it replaced, which still opens what was
 * sealed under it here.
 */
export async function openFamily(
  api: HttpSyncAdapter,
  input: {
    productKey: ProductKey;
    orgId: string;
    pinned?: SealedBox | null;
    previousKey?: CryptoKey;
    unlockWith?: { keys: AccountKeys } | { root: AccountRoot };
  },
): Promise<OpenedFamily> {
  const { productKey, orgId } = input;
  const { accountId, product } = productKey;
  const pin = input.pinned ? await pinFrom(productKey, orgId, input.pinned, input.previousKey) : null;
  const detail = await api.org(orgId);
  if (detail.me.status !== 'confirmed') return { status: 'waiting' };
  const member = await memberKeyOf(api, productKey, detail, input);
  if (!member) return { status: 'needs-root' };

  const box = detail.me.orgKeyBoxes.find((entry) => entry.generation === detail.org.generation);
  if (!box) throw new Error('You do not hold this family’s key yet: an organiser confirms you first.');
  const vouched = (members: readonly { accountId: string; role?: string; memberKey: string }[], subjects: string[]) =>
    vouchedFor({ orgId, me: member, meId: accountId, pin, members, vouches: detail.me.vouches, subjects });
  let senderKey = member.publicKey;
  if (box.senderId !== accountId) {
    // The roster the server sent, before anything checks it: what it names is
    // taken only as far as the pin, or an organiser the pin has, agrees; the
    // MAC over the same lines is checked next.
    const served = (detail.roster.body as { members?: { accountId: string; role?: string; memberKey: string }[] }).members ?? [];
    const named = served.find((line) => line.accountId === box.senderId)?.memberKey;
    if (!named) throw new Error('The family’s list of members does not name who sent you its key.');
    const pinned = pinnedKey(pin, box.senderId) === named && !retiredKey(pin, named);
    if (pin && !pinned && (await vouched(served, [box.senderId])).length === 0) {
      const code = await orgCompareCode(orgId, { accountId, memberKey: member.publicKey }, { accountId: box.senderId, memberKey: named });
      return { status: 'compare', accountId: box.senderId, memberKey: named, code };
    }
    senderKey = named;
  }
  const orgKey = await openOrgKey(boxFrom<AuthBox>(box.box), { recipient: member, recipientId: accountId, senderKey, senderId: box.senderId }, orgId, detail.org.generation);
  const roster = await checkRoster(orgKey, orgId, detail.roster, pin);
  if (listedKey(roster, accountId) !== member.publicKey) throw new Error('The family’s list of members names another key for you.');
  if (listedKey(roster, box.senderId) !== senderKey) throw new Error('The family’s list of members does not name who sent you its key.');

  // The person's own key is the one their own box opened: theirs to accept.
  // A key an organiser compared, and said so, is taken as one compared here.
  const compared = [accountId, ...(await vouched(roster.body.members, roster.changed))];
  const keyChanged = roster.changed.filter((id) => !compared.includes(id)).map((id) => ({ accountId: id, memberKey: listedKey(roster, id)! }));
  const handed = detail.me.collectionKeyBoxes.filter((box) => detail.collections.some((entry) => entry.id === box.collectionId && entry.product === product && box.generation <= entry.generation));
  const next = nextOrgPin(pin, roster, compared, handed);
  // A collection key is taken as from the key pinned now for its sender:
  // someone whose key changed is not, and someone gone is as they were, up to
  // what they handed over before they went.
  const senderOf = (keyBox: { senderId: string; collectionId: string; generation: number }): string | undefined => {
    if (keyBox.senderId === accountId) return member.publicKey;
    if (keyChanged.some((change) => change.accountId === keyBox.senderId)) return undefined;
    return collectionSenderKey(next, keyBox.senderId, keyBox.collectionId, keyBox.generation);
  };

  // A write key is taken only from an organiser, or from the person's own hand: never from a viewer's.
  const organisers = roster.body.members.filter((line) => line.role === 'owner').map((line) => line.accountId);
  const collections: FamilyCollection[] = [];
  for (const collection of detail.collections) {
    if (collection.product !== product) continue;
    const keys = new Map<number, CryptoKey>();
    const writeKeys = new Map<number, WriteKey>();
    for (const keyBox of detail.me.collectionKeyBoxes) {
      if (keyBox.collectionId !== collection.id || keyBox.generation > collection.generation || keys.has(keyBox.generation)) continue;
      const from = senderOf(keyBox);
      if (!from) continue;
      const place = { orgId, collectionId: collection.id, generation: keyBox.generation };
      const trusted = keyBox.senderId === accountId || organisers.includes(keyBox.senderId);
      const held = await openCollectionGeneration(boxFrom<AuthBox>(keyBox.box), { recipient: member, recipientId: accountId, senderKey: from, senderId: keyBox.senderId }, place, trusted);
      if (!held) {
        // An access box from someone no longer an organiser is set aside, not the whole family with it.
        if (!trusted) continue;
        throw new DecryptionError();
      }
      keys.set(keyBox.generation, held.key);
      if (held.write) writeKeys.set(keyBox.generation, held.write);
    }
    const key = keys.get(collection.generation);
    if (!key) continue;
    const place = { orgId, collectionId: collection.id, generation: collection.generation };
    const write = writeKeys.get(collection.generation);
    collections.push({
      id: collection.id,
      name: await openCollectionName(key, boxFrom(collection.nameBox), place),
      generation: collection.generation,
      keys,
      writeKeys,
      canEdit: !write || write.sign !== null,
    });
  }
  return {
    status: 'open',
    family: {
      orgId,
      accountId,
      product,
      detail,
      member,
      roster,
      pinned: await sealOrgPin(productKey.key, next, orgId, accountId, product),
      keyChanged,
      left: leftSince(pin, roster),
      collections,
    },
  };
}

/** The code to compare with someone in the family, from this device's key and the one the roster lists for them. */
export async function familyCompareCode(family: ProductFamily, accountId: string): Promise<string> {
  const theirs = listedKey(family.roster, accountId);
  if (!theirs) throw new Error('The family’s list of members does not name that person. Load the family again.');
  return orgCompareCode(family.orgId, { accountId: family.accountId, memberKey: family.member.publicKey }, { accountId, memberKey: theirs });
}

/**
 * After the two screens showed the same code: `memberKey` pinned as theirs,
 * so what they send is taken from then on. Returns the pin to keep, for
 * `openFamily`. Only ever on a match the person saw.
 */
export async function trustFamilyMember(
  productKey: ProductKey,
  input: { orgId: string; pinned: SealedBox | null; previousKey?: CryptoKey; accountId: string; memberKey: string },
): Promise<SealedBox> {
  const { accountId, product } = productKey;
  const pin = input.pinned ? await pinFrom(productKey, input.orgId, input.pinned, input.previousKey) : null;
  return sealOrgPin(productKey.key, trustedOrgPin(pin, input.accountId, input.memberKey), input.orgId, accountId, product);
}

/** What `rotateFamilyKeys` did. */
export type FamilyRotation =
  /** Nothing of this app's to change: nobody went, or only the family's key waits, for an organiser. */
  | { status: 'not-due' }
  /** New keys went to everyone staying: open the family again (`openFamily`) to read and write under them. */
  | { status: 'rotated' }
  /**
   * Someone staying has a key this device has not taken (`keyChanged`), and
   * nothing new is sealed to it until the two compare `code`. On a match,
   * `trustFamilyMember`, `openFamily`, and this again.
   */
  | { status: 'compare'; accountId: string; memberKey: string; code: string }
  /** The family changed since it was opened, another organiser's new keys first among what can: open it again. */
  | { status: 'stale' };

/**
 * After someone went, as an organiser's app syncs, what the page's
 * `consoleRotateFamily` does, from the member key this app holds: the next
 * family key to everyone left, from the roster's keys; the roster without
 * whoever went; and the next key of each of this app's marked collections the
 * person holds, to those still in it, its name sealed again under it. Another
 * app's collection stays marked for that app, or the page; so does one the
 * person does not hold.
 *
 * Once the family's key has changed, a collection still marked, one no
 * organiser held, say, gets its next key from the app of anyone holding it,
 * organiser or not, to exactly those holding it: nobody let in or out, which
 * stays an organiser's.
 *
 * Nothing is lost meanwhile: everyone opens what they could under the keys
 * they hold, and older records stay readable under the older key, to be
 * sealed again (`FamilyRecord.stale`). Of two organisers at once, the server
 * takes the first, and the other is told `stale`. An app never takes over a
 * family left with no organiser: that is the page's (`consoleTakeOverFamily`).
 */
export async function rotateFamilyKeys(api: HttpSyncAdapter, family: ProductFamily): Promise<FamilyRotation> {
  const { orgId, accountId, detail, member, roster } = family;
  const organiser = detail.me.role === 'owner' && roster.body.members.find((line) => line.accountId === accountId)?.role === 'owner';
  // The family's key first, an organiser's; a member's app waits for it.
  if (detail.org.rotationDue && !organiser) return { status: 'not-due' };
  const confirmed = detail.members.filter((entry) => entry.status === 'confirmed').map((entry) => entry.accountId);
  // `family.collections` holds this app's own alone, and only those whose key
  // in use the person holds. Each goes to those its sealed list names, never
  // to whoever the server's list adds; with no list that opens, it stays marked.
  const marked = [];
  for (const collection of detail.collections) {
    const held = family.collections.find((entry) => entry.id === collection.id && entry.generation === collection.generation);
    if (!collection.rotationDue || !held) continue;
    const write = held.writeKeys.get(held.generation) ?? null;
    // A view only collection's next write key comes from an organiser alone: nobody else's would be taken.
    if (write && !organiser) continue;
    const members = await openCollectionMembersOf({ key: held.keys.get(held.generation)!, write }, orgId, collection);
    const holders = members?.holders.filter((id) => confirmed.includes(id)) ?? [];
    if (holders.length > 0) marked.push({ collection, name: held.name, holders, viewers: write ? members!.viewers.filter((id) => holders.includes(id)) : null });
  }
  if (!detail.org.rotationDue && marked.length === 0) return { status: 'not-due' };

  const staying = detail.org.rotationDue ? roster.body.members.filter((line) => confirmed.includes(line.accountId)) : [];
  // Someone the server counts in but the roster never listed gets no key.
  const recipients = [...(detail.org.rotationDue ? confirmed : []), ...marked.flatMap(({ holders }) => holders)];
  if (recipients.some((id) => listedKey(roster, id) === undefined)) {
    throw new Error('The family’s list of members does not name that person. Load the family again.');
  }
  const change = family.keyChanged.find((entry) => recipients.includes(entry.accountId));
  if (change) return { status: 'compare', ...change, code: await familyCompareCode(family, change.accountId) };
  const to = (recipientId: string) => ({ sender: member, senderId: accountId, recipientKey: listedKey(roster, recipientId)!, recipientId });

  const collections = [];
  for (const { collection, name, holders, viewers } of marked) {
    const place = { orgId, collectionId: collection.id, generation: collection.generation + 1 };
    // Where view only is on, the next generation gets its own write key, its private half only to those who may edit.
    const next: HeldGeneration = { key: await newCollectionKey(), write: viewers ? await newWriteKey() : null };
    const keyBoxes = [];
    for (const holder of holders) keyBoxes.push({ accountId: holder, box: wire(await sealCollectionGeneration(next, to(holder), place, !viewers?.includes(holder))) });
    const nameBox = wire(await sealCollectionName(next.key, name, place));
    collections.push({
      collectionId: collection.id,
      generation: place.generation,
      nameBox,
      holdersBox: wire(await sealCollectionMembers(next, holders, place, viewers ?? [])),
      keyBoxes,
      ...(viewers ? { viewers } : {}),
    });
  }
  try {
    if (detail.org.rotationDue) {
      const generation = roster.generation + 1;
      const orgKey = await newOrgKey();
      // One that stopped since the roster was made is listed no more, as the page does.
      const body = { ...roster.body, members: staying, recoveryKey: detail.recovery.on ? roster.body.recoveryKey : null };
      const next = await makeRoster(orgKey, orgId, generation, roster.version + 1, body);
      const orgKeyBoxes = [];
      for (const line of staying) orgKeyBoxes.push({ accountId: line.accountId, box: wire(await sealOrgKey(orgKey, to(line.accountId), orgId, generation)) });
      await api.rotateOrg(orgId, { generation, roster: next, orgKeyBoxes, collections });
    } else {
      // The family's key went already, from someone not holding these, or another app.
      for (const { collectionId, ...rest } of collections) await api.rotateCollection(orgId, collectionId, rest);
    }
  } catch (error) {
    if (error instanceof SyncHttpError && error.status === 409) return { status: 'stale' };
    throw error;
  }
  return { status: 'rotated' };
}

/** One of a family's records, opened. */
export interface FamilyRecord<T> {
  id: string;
  kind: string;
  collectionId: string;
  generation: number;
  rev: number;
  serverRev: number;
  deleted: boolean;
  updatedAt: number;
  deviceId: string;
  /** Null when deleted. */
  value: T | null;
  /**
   * Under an older key of its collection, which someone gone may hold: seal
   * it again (`sealFamilyRecord`, one revision up) and push it.
   */
  stale: boolean;
}

/**
 * A record of one of this product's collections, sealed under its key in use
 * at `rev`, for `pushFamily`; `value` null deletes it, the deletion sealed as
 * the record would be (`sealOrgTombstone`). `kind` is one of the product's
 * own (`passhold.*`), `id` as `newId` makes one.
 */
export async function sealFamilyRecord<T>(
  family: ProductFamily,
  record: { collectionId: string; id: string; kind: string; rev: number; value: T | null; updatedAt?: number; deviceId?: string },
): Promise<OrgRecord> {
  const collection = family.collections.find((entry) => entry.id === record.collectionId);
  const key = collection?.keys.get(collection.generation);
  if (!collection || !key) throw new Error('That is not a collection of yours in this family.');
  const place = { orgId: family.orgId, collectionId: collection.id, generation: collection.generation, id: record.id, rev: record.rev };
  const write = collection.writeKeys.get(collection.generation);
  if (write && !write.sign) throw new Error('You can view this vault, not change it.');
  const sealed = record.value === null ? await sealOrgTombstone(key, place) : await sealOrgRecord(key, record.value, place);
  return {
    id: record.id,
    kind: record.kind,
    collectionId: collection.id,
    generation: collection.generation,
    serverRev: 0,
    rev: record.rev,
    deleted: record.value === null,
    updatedAt: record.updatedAt ?? Date.now(),
    // The server names the device the session is for.
    deviceId: record.deviceId ?? '',
    box: write ? await signOrgRecord(write, sealed, place, record.value === null) : sealed,
  };
}

/**
 * Opens a record with the key of the collection and generation it says, at
 * the revision it says, all of which its seal covers: one moved, renumbered
 * or handed back from another revision fails to open. A deletion is one only
 * when its own seal opens (`openOrgTombstone`): the server's word that a
 * record is deleted, or no longer is, opens nothing.
 */
export async function openFamilyRecord<T>(family: ProductFamily, record: OrgRecord): Promise<FamilyRecord<T>> {
  const collection = family.collections.find((entry) => entry.id === record.collectionId);
  const key = collection?.keys.get(record.generation);
  if (!collection || !key) throw new DecryptionError('That record is under a key you do not hold.');
  const meta = {
    id: record.id,
    kind: record.kind,
    collectionId: record.collectionId,
    generation: record.generation,
    rev: record.rev,
    serverRev: record.serverRev,
    deleted: record.deleted,
    updatedAt: record.updatedAt,
    deviceId: record.deviceId,
    stale: record.generation < collection.generation,
  };
  if (!record.box) throw new Error('Malformed family record.');
  const place = { orgId: family.orgId, collectionId: collection.id, generation: record.generation, id: record.id, rev: record.rev };
  // Where view only is on, only what someone who may edit signed: a viewer's write, let through, is set aside here.
  const write = collection.writeKeys.get(record.generation);
  if (write) await checkOrgRecord(write, record.box, place, record.deleted);
  if (record.deleted) {
    await openOrgTombstone(key, record.box, place);
    return { ...meta, value: null };
  }
  return { ...meta, value: await openOrgRecord<T>(key, record.box, place) };
}

/**
 * Each record opened, or set aside: one that does not open is never acted on.
 * It stays on the server at its revision, above what this device last wrote,
 * so a device that holds that record pushes its own one revision above it,
 * as a server's deletion would otherwise stand.
 */
async function openEach<T>(family: ProductFamily, records: OrgRecord[]): Promise<{ records: FamilyRecord<T>[]; unreadable: OrgRecord[] }> {
  const opened: FamilyRecord<T>[] = [];
  const unreadable: OrgRecord[] = [];
  for (const record of records) {
    try {
      opened.push(await openFamilyRecord<T>(family, record));
    } catch {
      unreadable.push(record);
    }
  }
  return { records: opened, unreadable };
}

/**
 * A page of this product's records in the family since `since`, by the
 * family's own counter, each opened; `collectionId` pulls one collection,
 * from zero when this device is new to it. `restored`: the server's history
 * is not the one `epoch` was, so this device pulls from zero and pushes what
 * the server no longer has, as for an account's records.
 */
export async function pullFamily<T>(
  api: HttpSyncAdapter,
  family: ProductFamily,
  input: { since: number; collectionId?: string; epoch?: string | null },
): Promise<{ records: FamilyRecord<T>[]; unreadable: OrgRecord[]; serverRev: number; hasMore: boolean; epoch: string; restored: boolean }> {
  const pulled = await api.orgPull(family.orgId, input.since, input.collectionId);
  return {
    ...(await openEach<T>(family, pulled.records)),
    serverRev: pulled.serverRev,
    hasMore: pulled.hasMore,
    epoch: pulled.epoch,
    restored: input.epoch != null && pulled.epoch !== input.epoch,
  };
}

/**
 * Pushes records `sealFamilyRecord` made. A record the server holds a newer
 * revision of comes back in `conflicts`, that revision opened, for the
 * product to merge and push one revision above it. A collection whose key
 * changed since it was opened is refused whole: open the family again.
 */
export async function pushFamily<T>(
  api: HttpSyncAdapter,
  family: ProductFamily,
  records: OrgRecord[],
): Promise<{ accepted: OrgPushResponse['accepted']; conflicts: FamilyRecord<T>[]; unreadable: OrgRecord[]; rejectedForLimit: string[]; serverRev: number }> {
  const pushed = await api.orgPush(family.orgId, records);
  const { records: conflicts, unreadable } = await openEach<T>(family, pushed.conflicts);
  return { accepted: pushed.accepted, conflicts, unreadable, rejectedForLimit: (pushed.rejectedForLimit ?? []).map(({ id }) => id), serverRev: pushed.serverRev };
}
