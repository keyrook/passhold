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

/**
 * Where the files kept with items and sent in a Send are put and read: the
 * Cloudflare R2 address of Keyrook's account, under which each of its
 * buckets is a path. The account's server names the
 * bucket and signs each address for one file, for minutes; Passhold seals a
 * file before it goes and refuses one that comes back changed
 * (ui/attachments.ts), so the store learns sizes and nothing else.
 */
export const FILES_STORE = 'https://90e891d707677e65e06f30636b8fea5c.r2.cloudflarestorage.com';
/** The kit has no page of its own; this is the origin its server takes for one. */
const KIT_PAGE = 'http://localhost:5174';
/** Passhold's web vault, apart from the account's page: on the official server's side, and where the tests serve it. */
const VAULT_PAGE = 'https://vault.keyrook.com';
const KIT_VAULT_PAGE = 'http://localhost:5176';

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

/**
 * Passhold's web vault for that server: a page of Passhold's own, on an
 * origin of its own, where the extension neither fills nor saves and its
 * passkey scripts never run (scripts/manifest.mjs) — the vault holds the
 * account's password and passkeys as the account's page does.
 */
export function vaultPageFor(url) {
  const api = checkApi(url);
  if (api === OFFICIAL_API) return VAULT_PAGE;
  return KIT_VAULT_PAGE;
}

/**
 * Where a Send's link opens for that server: the page that reads Sends from
 * it. The kit has none; its links name the official page, which a test only
 * reads the fragment of.
 */
export function sendPageFor(url) {
  checkApi(url);
  return 'https://send.keyrook.com';
}

/**
 * The file store that server hands out addresses in, beside it in
 * `connect-src`; none for the kit's, which answers on the server's own address.
 */
export function filesStoreFor(url) {
  const api = checkApi(url);
  return api === OFFICIAL_API ? FILES_STORE : null;
}

const NOT_FOR_STORES = [TEST_API, KIT_PAGE, KIT_VAULT_PAGE].map((address) => new URL(address).host);

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
