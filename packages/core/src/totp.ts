/**
 * Two-step codes (RFC 6238), as the Keyrook account's link between Keyrook
 * Authenticator and Passhold carries them: read from the setup key a site
 * shows, or the `otpauth://` address its QR code holds, and worked out here.
 * A code goes with a login by the websites it names, never by anything the
 * server says.
 */
import { matchUrls, siteOf } from './match.js';
import type { LoginItem } from './vault/model.js';

export type TotpAlgorithm = 'SHA1' | 'SHA256' | 'SHA512';

/** What works a code out, and what names it: as `LinkCode` holds them, less where it came from. */
export interface TotpSetup {
  /** Base32, upper case, no spaces or padding. */
  secret: string;
  algorithm: TotpAlgorithm;
  digits: number;
  /** Seconds. */
  period: number;
  issuer: string;
  label: string;
}

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const HASHES: Record<TotpAlgorithm, string> = { SHA1: 'SHA-1', SHA256: 'SHA-256', SHA512: 'SHA-512' };

/** The bytes of a base32 setup key, as sites write them: any case, spaces and dashes between groups, padding or none. */
export function base32Bytes(text: string): Uint8Array | null {
  const clean = text.toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, '');
  if (!clean || /[^A-Z2-7]/.test(clean)) return null;
  const out: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of clean) {
    value = ((value << 5) | BASE32.indexOf(char)) & 0xffff;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

function checked(setup: { secret: string; algorithm: string; digits: number; period: number; issuer: string; label: string }): TotpSetup | null {
  const bytes = base32Bytes(setup.secret);
  // Fewer than 80 bits is a typo, not a secret: no site hands out less.
  if (!bytes || bytes.length < 10) return null;
  const algorithm = setup.algorithm.toUpperCase();
  if (algorithm !== 'SHA1' && algorithm !== 'SHA256' && algorithm !== 'SHA512') return null;
  if (![6, 7, 8].includes(setup.digits)) return null;
  if (!Number.isInteger(setup.period) || setup.period < 10 || setup.period > 300) return null;
  return {
    secret: setup.secret.toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, ''),
    algorithm,
    digits: setup.digits,
    period: setup.period,
    issuer: setup.issuer.trim().slice(0, 200),
    label: setup.label.trim().slice(0, 200),
  };
}

/**
 * A setup key typed or pasted, or an `otpauth://totp/…` address: null for
 * anything else, a counter-based code (`hotp`) included, which the link does
 * not carry.
 */
export function readTotpSetup(input: string): TotpSetup | null {
  const text = input.trim();
  if (!/^otpauth:\/\//i.test(text)) return checked({ secret: text, algorithm: 'SHA1', digits: 6, period: 30, issuer: '', label: '' });
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (url.hostname.toLowerCase() !== 'totp') return null;
  const params = url.searchParams;
  let path: string;
  try {
    path = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
  } catch {
    return null;
  }
  const colon = path.indexOf(':');
  const label = colon >= 0 ? path.slice(colon + 1) : path;
  const issuer = params.get('issuer') ?? (colon >= 0 ? path.slice(0, colon) : '');
  return checked({
    secret: params.get('secret') ?? '',
    algorithm: params.get('algorithm') ?? 'SHA1',
    digits: Number(params.get('digits') ?? 6),
    period: Number(params.get('period') ?? 30),
    issuer,
    label,
  });
}

/** The code for `now`, and when it stops being the one a site takes. */
export async function totpCode(setup: Pick<TotpSetup, 'secret' | 'algorithm' | 'digits' | 'period'>, now = Date.now()): Promise<{ code: string; expiresAt: number }> {
  const bytes = base32Bytes(setup.secret);
  if (!bytes) throw new TypeError('Not a base32 secret.');
  const counter = Math.floor(now / 1000 / setup.period);
  const message = new Uint8Array(8);
  new DataView(message.buffer).setBigUint64(0, BigInt(counter));
  const key = await crypto.subtle.importKey('raw', bytes as BufferSource, { name: 'HMAC', hash: HASHES[setup.algorithm] }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, message as BufferSource));
  const at = mac[mac.length - 1]! & 0x0f;
  const binary = ((mac[at]! & 0x7f) << 24) | (mac[at + 1]! << 16) | (mac[at + 2]! << 8) | mac[at + 3]!;
  return { code: String(binary % 10 ** setup.digits).padStart(setup.digits, '0'), expiresAt: (counter + 1) * setup.period * 1000 };
}

/** The websites a code added on `login` is for, as the link writes them: each address's registrable domain, or its host. */
export function websitesOf(login: Pick<LoginItem, 'urls'>): string[] {
  const sites = login.urls.map((url) => siteOf(url)).filter((site) => site !== null);
  return [...new Set(sites.map((site) => site.domain ?? site.host))];
}

/** Whether a code naming `websites` goes with `login`: one of them is a site the login is saved for. */
export function codeFitsLogin(websites: readonly string[], login: Pick<LoginItem, 'urls'>): boolean {
  return websites.some((website) => {
    const site = siteOf(website.includes('://') ? website : `https://${website}`);
    return site !== null && matchUrls(login.urls, site) !== null;
  });
}
