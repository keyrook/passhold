/**
 * The Keyrook account, as every Keyrook product reaches it: how a password
 * becomes keys, what goes over the wire, the recovery kit, and moving the key
 * to a new browser.
 *
 * Products copy this package and never edit their copy. Nothing in here may
 * reference `chrome.*`, `window` or the DOM.
 */

// Crypto
export * from './crypto/kdf.js';
export * from './crypto/aead.js';

// The account
export * from './sync/adapter.js';
export * from './sync/account.js';
export * from './sync/protocol.js';
export * from './sync/http.js';
export * from './sync/kit.js';
export * from './sync/recovery.js';
export * from './sync/pairing.js';

// The products, as people meet them
export * from './products.js';

// Keys per product: the account's root, each product's box, its pin
export * from './keys/product.js';
export * from './keys/root.js';
export * from './keys/box.js';
export * from './keys/pin.js';
// Proof a device was removed by a holder of the product's key
export * from './keys/removal.js';
export * from './keys/contact.js';
// A file, sealed before it leaves the device
export * from './keys/file.js';
// Families: member keys, authenticated boxes, the join code, the roster and
// its pin, an organiser's word for a key, collection keys. Their labels are
// frozen as every other label is, each held by fixtures made once.
export * from './keys/org/labels.js';
export * from './keys/org/member.js';
export * from './keys/org/authbox.js';
export * from './keys/org/confirm.js';
export * from './keys/org/roster.js';
export * from './keys/org/vouch.js';
export * from './keys/org/collection.js';
export * from './keys/org/emergency.js';
export * from './keys/org/access.js';
export * from './keys/org/recovery.js';

// The flows every product runs on those keys
export * from './flows/product-key.js';
export * from './flows/recovery.js';
export * from './flows/start-over.js';
export * from './flows/console.js';
export * from './flows/passkey.js';
export * from './flows/family.js';
export * from './flows/emergency.js';
export * from './flows/breach.js';
export * from './flows/send.js';
export * from './flows/link.js';
export * from './keys/link.js';
export * from './keys/send.js';
export * from './flows/files.js';
// Machines and agent vaults: the agent authority, a machine's boxes, what it
// asks and is released, its log, and what Passhold pins of each.
export * from './keys/machine.js';
export * from './flows/machine.js';
export * from './sync/machine-http.js';

// Utilities worth exposing to app code
export { crockfordDecode, crockfordEncode, group } from './util/crockford.js';
export { toBase64, toBase64Url, fromBase64, toHex, fromHex, utf8, fromUtf8 } from './util/bytes.js';
export { newId, randomBytes } from './util/id.js';
