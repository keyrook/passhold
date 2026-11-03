/**
 * What a website asks of a passkey, read from the page — which is input like
 * any other: every field checked, bounded, and anything Passhold does not do
 * left to the browser rather than half done.
 *
 * Two things are never the page's to say. Where the request comes from is
 * the frame's origin as Chrome reports it to the service worker, and it goes
 * into what is signed (`clientDataJSON`), so a signature made for one site
 * means nothing to another. And which site a passkey is for (the relying
 * party id) must be that origin's host or a parent of it within the same
 * registrable domain, private suffixes included: `alice.github.io` may not
 * ask for a passkey of `github.io`, nor `example.com` for one of `com`.
 */
import { getDomain } from 'tldts';
import { fromBase64, utf8 } from '../util/bytes.js';

/** What the site asks for to make a passkey. Bytes are base64url, as the page sent them. */
export interface CreateRequest {
  /** The relying party id the site named, if it named one. */
  rpId: string | null;
  rpName: string;
  user: { id: string; name: string; displayName: string };
  challenge: string;
  /** Credentials the site already holds for this account: none of them may be made again. */
  exclude: string[];
  /** Whether the site asked to be told the passkey is discoverable (the `credProps` extension). */
  credProps: boolean;
}

/** What the site asks for to sign in. */
export interface GetRequest {
  rpId: string | null;
  challenge: string;
  /** The passkeys the site will accept; empty: any of this site's. */
  allow: string[];
}

const B64URL = /^[A-Za-z0-9_-]*$/;
/** A credential id may be up to 1023 bytes (WebAuthn §5.8.3); the site's id for an account at most 64. */
const MAX_CREDENTIAL_ID = 1023;
const MAX_USER_ID = 64;
/** No site needs more; a bound keeps a page from making the service worker hash megabytes. */
const MAX_CHALLENGE = 1024;
const MAX_LIST = 64;
const MAX_TEXT = 1000;
/** ES256: ECDSA on P-256 with SHA-256 — the one algorithm every site accepts, and the only one Passhold makes. */
export const ES256 = -7;

const record = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

/** Bytes as the page sent them: base64url, within bounds, or null. */
function bytes(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string' || value.length > Math.ceil((max * 4) / 3) + 2 || !B64URL.test(value)) return null;
  let length: number;
  try {
    length = fromBase64(value).length;
  } catch {
    return null;
  }
  return length >= min && length <= max ? value : null;
}

const text = (value: unknown): string | null => (typeof value === 'string' && value.length <= MAX_TEXT ? value : null);

/** A list of credential descriptors: their ids, or null when it is not one. */
function credentials(value: unknown): string[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_LIST) return null;
  const ids: string[] = [];
  for (const entry of value) {
    const descriptor = record(entry);
    // Another type of credential is not one Passhold could hold: passed over, as the spec says.
    if (!descriptor || descriptor.type !== 'public-key') continue;
    const id = bytes(descriptor.id, 1, MAX_CREDENTIAL_ID);
    if (id === null) return null;
    ids.push(id);
  }
  return ids;
}

function rpIdOf(value: unknown): string | null | undefined {
  if (value === undefined) return null;
  if (typeof value !== 'string' || !value || value.length > 253) return undefined;
  return value.toLowerCase();
}

/** Hints and attachments that ask for a security key or a phone: the browser's to answer, not Passhold's. */
function wantsAnotherDevice(hints: unknown, attachment: unknown): boolean {
  if (attachment === 'cross-platform') return true;
  if (!Array.isArray(hints) || hints.length === 0) return false;
  return hints[0] === 'security-key' || hints[0] === 'hybrid';
}

/**
 * A request to make a passkey that Passhold can answer, or null: malformed
 * (the browser says how), or asking for something only another device makes.
 */
export function readCreateOptions(raw: unknown): CreateRequest | null {
  const options = record(raw);
  const rp = record(options?.rp);
  const user = record(options?.user);
  if (!options || !rp || !user) return null;
  const rpId = rpIdOf(rp.id);
  const rpName = text(rp.name);
  const id = bytes(user.id, 1, MAX_USER_ID);
  const name = text(user.name);
  const displayName = user.displayName === undefined ? '' : text(user.displayName);
  const challenge = bytes(options.challenge, 1, MAX_CHALLENGE);
  const exclude = credentials(options.excludeCredentials);
  if (rpId === undefined || rpName === null || id === null || name === null || displayName === null || challenge === null || exclude === null) return null;

  const params = options.pubKeyCredParams;
  if (!Array.isArray(params) || params.length > MAX_LIST) return null;
  // An empty list means the defaults, ES256 among them (WebAuthn §5.4).
  const algorithms = params.map((param) => record(param)).filter((param) => param?.type === 'public-key').map((param) => param!.alg);
  if (params.length > 0 && !algorithms.includes(ES256)) return null;

  const selection = record(options.authenticatorSelection);
  if (wantsAnotherDevice(options.hints, selection?.authenticatorAttachment)) return null;
  const extensions = record(options.extensions);
  return {
    rpId,
    rpName,
    user: { id, name, displayName },
    challenge,
    exclude,
    credProps: extensions?.credProps === true,
  };
}

export function readGetOptions(raw: unknown): GetRequest | null {
  const options = record(raw);
  if (!options) return null;
  const rpId = rpIdOf(options.rpId);
  const challenge = bytes(options.challenge, 1, MAX_CHALLENGE);
  const allow = credentials(options.allowCredentials);
  if (rpId === undefined || challenge === null || allow === null) return null;
  if (wantsAnotherDevice(options.hints, undefined)) return null;
  return { rpId, challenge, allow };
}

const IP = /^(\d{1,3}(\.\d{1,3}){3}|\[[0-9a-f:.]+\])$/i;

/**
 * The Keyrook account's page. Its passkeys answer PRF with what opens the
 * account's root key, and so every app's key — Passhold's among them: one
 * kept in Passhold would be lost with the computer that holds it. Passhold's
 * scripts stay out of the page (the manifest); a request that names it anyway
 * is the browser's.
 */
const KEYROOK_ACCOUNT_HOST = 'account.keyrook.com';
const keyrookAccount = (host: string) => host === KEYROOK_ACCOUNT_HOST || host.endsWith(`.${KEYROOK_ACCOUNT_HOST}`);

/**
 * The relying party id a page at `origin` may use, or null when it may not
 * use the one it named — the browser then answers it, as without Passhold.
 *
 * Secure pages only, and `localhost` for sites being built. An address has
 * no parent to name, and is the browser's to judge. Never the Keyrook
 * account's page, nor a passkey for it.
 */
export function rpIdFor(origin: string, requested: string | null): string | null {
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  const local = host === 'localhost' || host.endsWith('.localhost');
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) return null;
  if (url.origin !== origin || IP.test(host)) return null;
  const rpId = requested ?? host;
  if (keyrookAccount(host) || keyrookAccount(rpId)) return null;
  if (rpId === host) return rpId;
  if (!host.endsWith(`.${rpId}`)) return null;
  // A parent, but never past the registrable domain: that would be a public suffix, shared with strangers.
  const domain = getDomain(host, { allowPrivateDomains: true });
  if (!domain) return null;
  return rpId === domain || rpId.endsWith(`.${domain}`) ? rpId : null;
}

/**
 * Whether a passkey made elsewhere — one an import brings — may be kept for
 * this relying party: a site's own name, under a registrable domain, or
 * `localhost` for sites being built. Never an address or a public suffix,
 * which name no one site, and never the Keyrook account: Passhold never
 * keeps a passkey that opens Passhold.
 */
export function rpIdKeepable(rpId: string): boolean {
  if (!/^[a-z0-9.-]+$/.test(rpId) || IP.test(rpId) || keyrookAccount(rpId)) return false;
  if (rpId === 'localhost' || rpId.endsWith('.localhost')) return true;
  return getDomain(rpId, { allowPrivateDomains: true }) !== null;
}

/**
 * What the passkey signs over, besides the site: who asked and what they
 * asked. Written in the order browsers write it, which some servers check
 * byte for byte (WebAuthn §5.8.1.2, the limited verification algorithm).
 */
export function clientDataJSON(type: 'webauthn.create' | 'webauthn.get', challenge: string, origin: string): Uint8Array {
  return utf8(JSON.stringify({ type, challenge, origin, crossOrigin: false }));
}
