/**
 * Emergency access between any two accounts, as a product's device runs it:
 * its contact key, the code two people compare, the keys it hands over when
 * it is the grantor's, and what it reads when it is the contact's.
 *
 * Every key it seals to or opens as from is the one its own pin holds, never
 * the one the server lists: a key the server swapped in is shown as a code to
 * compare again, and nothing is sealed to it.
 */
import { DecryptionError, type SealedBox } from '../crypto/aead.js';
import {
  contactCode,
  newContactKey,
  openContactKeyWithProduct,
  openContactPin,
  openEmergencyKey,
  openHeldEmergencyKey,
  openHeldEmergencyKeyDrawn,
  sealContactKeyToRoot,
  sealContactKeyUnderProduct,
  sealContactPin,
  sealEmergencyKey,
  sealHeldEmergencyKey,
  type ContactKey,
  type ContactPin,
  type KeyDrawing,
} from '../keys/contact.js';
import type { AuthBox } from '../keys/org/authbox.js';
import type { HttpSyncAdapter } from '../sync/http.js';
import type { EmergencyGrant, EmergencyState } from '../sync/protocol.js';
import type { RemoteRecord } from '../sync/adapter.js';
import type { ProductKey } from './product-key.js';
import { boxFrom, wire } from './wire.js';

/** What a product's device holds of emergency access once it opened its contact key. */
export interface EmergencyOpened {
  state: EmergencyState;
  contactKey: ContactKey;
}

/**
 * The account's contact key, for this product: made and sealed to the root
 * and under this product's key the first time, opened under it after. It
 * answers `needs-root` when another product or the page made the key and
 * this one has no box of it yet: the password, a passkey or the page opens
 * the root and seals one.
 */
export async function openContactKey(api: HttpSyncAdapter, productKey: ProductKey): Promise<EmergencyOpened | { status: 'needs-root'; state: EmergencyState }> {
  const { accountId, product, key, root } = productKey;
  let state = await api.emergency();
  if (!state.myKey) {
    const made = await newContactKey();
    state = await api.putContactKey({
      publicKey: made.publicKey,
      rootBox: wire(await sealContactKeyToRoot(made, root, accountId)),
      productBoxes: [{ product, box: wire(await sealContactKeyUnderProduct(made, key, accountId, product)) }],
    });
    return { state, contactKey: made };
  }
  if (!state.myKey.box) return { status: 'needs-root', state };
  const opened = await openContactKeyWithProduct(boxFrom(state.myKey.box), key, accountId, product);
  // The public half comes from what opened. One the server lists otherwise is its word, and wrong.
  if (opened.publicKey !== state.myKey.publicKey) throw new DecryptionError('The server lists another contact key for this account.');
  return { state, contactKey: opened };
}

/** This product's pin of `otherId`, if it has one that opens. */
async function pinOf(state: EmergencyState, productKey: ProductKey, otherId: string): Promise<ContactPin | null> {
  const entry = state.pins.find((pin) => pin.contactId === otherId && pin.product === productKey.product);
  if (!entry) return null;
  try {
    return await openContactPin(productKey.key, boxFrom(entry.box), productKey.accountId, otherId, productKey.product);
  } catch {
    return null;
  }
}

/** The other side of a grant, from where this account stands. */
const otherOf = (grant: EmergencyGrant, accountId: string) => (grant.grantorId === accountId ? grant.contactId : grant.grantorId);

/**
 * Where a grant stands for this device: `trusted` once its pin holds the key
 * the other side has now; `compare` when there is a key and no pin, or the
 * pin holds another key (they started over, or the server swapped it); and
 * `waiting` while the other side has no key, or has not accepted.
 */
export async function emergencyTrust(opened: EmergencyOpened, productKey: ProductKey, grant: EmergencyGrant): Promise<'trusted' | 'compare' | 'waiting'> {
  const otherId = otherOf(grant, productKey.accountId);
  if (!otherId || !grant.otherKey) return 'waiting';
  const pin = await pinOf(opened.state, productKey, otherId);
  return pin && pin.contactKey === grant.otherKey ? 'trusted' : 'compare';
}

/** The code both people see for a grant: from this account's key and the key the server lists for the other. */
export async function emergencyCompareCode(opened: EmergencyOpened, productKey: ProductKey, grant: EmergencyGrant): Promise<string> {
  const otherId = otherOf(grant, productKey.accountId);
  if (!otherId || !grant.otherKey) throw new Error('They have no contact key yet.');
  return contactCode({ accountId: productKey.accountId, contactKey: opened.contactKey.publicKey }, { accountId: otherId, contactKey: grant.otherKey });
}

/**
 * Pins the other side's key as the server lists it now: on a code the person
 * saw match, or, if they chose, without comparing. Only then does this
 * device seal anything to it, or open anything as from it.
 */
export async function trustEmergencyContact(api: HttpSyncAdapter, opened: EmergencyOpened, productKey: ProductKey, grant: EmergencyGrant, compared: boolean): Promise<EmergencyOpened> {
  const otherId = otherOf(grant, productKey.accountId);
  if (!otherId || !grant.otherKey) throw new Error('They have no contact key yet.');
  const box = await sealContactPin(productKey.key, { contactKey: grant.otherKey, compared }, productKey.accountId, otherId, productKey.product);
  return { ...opened, state: await api.putContactPin(otherId, productKey.product, wire(box)) };
}

/**
 * On the grantor's device, as it syncs: this product's key sealed to each
 * contact who accepted, chose this product, and whose key this device pinned
 * and still matches. Those it could not hand over yet are named: `compare`
 * asks the person to compare the code, and nothing is sealed to them.
 */
export async function handOverEmergencyKeys(
  api: HttpSyncAdapter,
  opened: EmergencyOpened,
  productKey: ProductKey,
): Promise<{ opened: EmergencyOpened; handed: string[]; compare: string[] }> {
  let state = opened.state;
  const handed: string[] = [];
  const compare: string[] = [];
  for (const grant of state.named) {
    if (!grant.contactId || !grant.products.includes(productKey.product) || grant.boxes.includes(productKey.product)) continue;
    const trust = await emergencyTrust({ ...opened, state }, productKey, grant);
    if (trust === 'compare') compare.push(grant.id);
    if (trust !== 'trusted') continue;
    const pin = (await pinOf(state, productKey, grant.contactId))!;
    const box = await sealEmergencyKey(
      productKey.key,
      { grantor: opened.contactKey, grantorId: productKey.accountId, contactKey: pin.contactKey, contactId: grant.contactId },
      productKey.product,
    );
    state = await api.putEmergencyKeyBox(grant.id, productKey.product, wire(box));
    handed.push(grant.id);
  }
  return { opened: { ...opened, state }, handed, compare };
}

/**
 * On the contact's device, once access is open: the grantor's key of this
 * product, opened as from the grantor this device pinned, and every record
 * of theirs the server hands over, for the product to open as it opens its
 * own. Read only: nothing here writes, and the server takes no write.
 *
 * With `drawing`, `grantorKey` is the key the grantor's product draws from
 * its product key and seals its records under, as `openHeldEmergencyKeyDrawn`
 * opens it from `held` later. It only decrypts either way.
 */
export async function readEmergencyVault(
  api: HttpSyncAdapter,
  opened: EmergencyOpened,
  productKey: ProductKey,
  grant: EmergencyGrant,
  drawing?: KeyDrawing,
): Promise<{ status: 'compare' } | { status: 'nothing' } | { status: 'open'; grantorKey: CryptoKey; held: SealedBox; records: RemoteRecord[] }> {
  const pin = await pinOf(opened.state, productKey, grant.grantorId);
  if (!pin) return { status: 'compare' };
  const { boxes } = await api.emergencyBoxes(grant.id);
  const box = boxes.find((entry) => entry.product === productKey.product);
  if (!box) return { status: 'nothing' };
  const handed = await openEmergencyKey(
    boxFrom<AuthBox>(box.box),
    { contact: opened.contactKey, contactId: productKey.accountId, grantorKey: pin.contactKey, grantorId: grant.grantorId },
    productKey.product,
  );
  // Kept on this device under its own key, and read with a key that only reads.
  const held = await sealHeldEmergencyKey(productKey.key, handed, productKey.accountId, grant.grantorId, productKey.product);
  const grantorKey = drawing
    ? await openHeldEmergencyKeyDrawn(productKey.key, held, productKey.accountId, grant.grantorId, productKey.product, drawing)
    : await openHeldEmergencyKey(productKey.key, held, productKey.accountId, grant.grantorId, productKey.product);
  const records: RemoteRecord[] = [];
  let since = 0;
  for (;;) {
    const page = await api.emergencyPull(grant.id, since);
    records.push(...page.records);
    if (!page.hasMore || page.records.length === 0) break;
    since = page.records[page.records.length - 1]!.serverRev;
  }
  return { status: 'open', grantorKey, held, records };
}
