/**
 * The one server Passhold may talk to: the Keyrook account's.
 *
 * A build names it at build time, and nothing else: the release build the
 * official server, a test build a server on this machine. Anything else is
 * refused here, so no build can be
 * pointed at a stranger — and the address goes into the extension's CSP as the
 * only `connect-src`, so not even a bug can reach past it.
 */
export const OFFICIAL_API = 'https://api.keyrook.com';
/** Where the account's server from the kit listens on this machine: for the end-to-end suite, and for trying by hand. */
export const TEST_API = 'http://127.0.0.1:8799';
/** The kit has no page of its own; this is the origin its server takes for one. */
const KIT_PAGE = 'http://localhost:5174';

export function checkApi(url) {
  const parsed = new URL(url);
  const local = parsed.protocol === 'http:' && parsed.hostname === '127.0.0.1';
  if (parsed.origin !== OFFICIAL_API && !local) {
    throw new Error(`The Keyrook server must be ${OFFICIAL_API}, or one on 127.0.0.1 for tests — not ${url}.`);
  }
  return parsed.origin;
}

/**
 * The site the Keyrook account's passkeys belong to — their RP ID — for the
 * server a build talks to: the host of the account's page, so `localhost` for
 * the kit's. Chrome lets an extension use another site's passkeys only with
 * the host permission for that site: Passhold asks for this one, and only when
 * its owner chooses a passkey.
 */
export function accountRpFor(url) {
  return new URL(accountPageFor(url)).hostname;
}

/**
 * The account's page for that server: where Passhold's links go, and what its
 * passkey scripts stay off (scripts/manifest.mjs).
 */
export function accountPageFor(url) {
  const api = checkApi(url);
  if (api === OFFICIAL_API) return 'https://account.keyrook.com';
  return KIT_PAGE;
}

const NOT_FOR_STORES = [TEST_API, KIT_PAGE].map((address) => new URL(address).host);

/**
 * A last look at what a store upload is about to carry, byte by byte. The
 * flags are checked before a build starts; this sees what it really made, so
 * an address that reached a bundle or the manifest any other way stops here,
 * before there is a zip to upload.
 */
export function checkStoreUpload(files) {
  for (const [name, bytes] of files) {
    const text = bytes.toString('latin1');
    const found = NOT_FOR_STORES.find((host) => text.includes(host));
    if (found) throw new Error(`A store upload talks to the official server only, and ${name} names ${found}.`);
  }
}
