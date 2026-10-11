/**
 * Which saved logins belong to the page in front of the person.
 *
 * This is the decision that hands a password to a web page, so it errs on
 * the side of offering nothing:
 *
 * - A site is its registrable domain — `accounts.example.co.uk` and
 *   `www.example.co.uk` are one site — taken from the Public Suffix List,
 *   private section included. Without the private section `alice.github.io`
 *   and `mallory.github.io` would be one site, and Mallory's page would be
 *   offered Alice's password.
 * - A page sent over plain http gets only a login saved for exactly that
 *   origin. Anything on the network can write an http page, so a password
 *   saved on the https site never flows down to one.
 * - A host the list cannot place — `localhost`, an address, a one-word name —
 *   has no "site" around it, so it matches only its exact origin.
 * - Only http and https. Never `file:`, `data:`, `javascript:` or an
 *   extension's page.
 */
import { getDomain } from 'tldts';

export interface Site {
  scheme: 'http' | 'https';
  host: string;
  /** scheme://host[:port], as `URL.origin` writes it. */
  origin: string;
  /** The registrable domain, or null where the host has none. */
  domain: string | null;
}

export type MatchStrength = 'exact' | 'site';

/**
 * Read a URL as a site. Something typed without a scheme (`example.com/login`)
 * is taken as https, the way a browser's address bar takes it.
 */
export function siteOf(input: string): Site | null {
  const text = input.trim();
  if (!text) return null;
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase();
  if (!host) return null;
  return {
    scheme: url.protocol === 'https:' ? 'https' : 'http',
    host,
    origin: url.origin,
    // Null for an address, `localhost` and a one-word name.
    domain: getDomain(host, { allowPrivateDomains: true }) ?? null,
  };
}

/**
 * How a saved URL relates to a page, or null when it must not be offered there.
 */
export function matchSite(saved: Site, page: Site): MatchStrength | null {
  if (saved.origin === page.origin) return 'exact';
  // Below here the two differ in scheme, host or port.
  if (page.scheme === 'http') return null;
  if (!saved.domain || !page.domain) return null;
  if (saved.domain !== page.domain) return null;
  // A login saved on http and used on the https site is the safe direction:
  // the page asking is the better-protected one.
  return saved.host === page.host ? 'exact' : 'site';
}

/** The best way any of a login's URLs matches the page. */
export function matchUrls(urls: readonly string[], page: Site): MatchStrength | null {
  let best: MatchStrength | null = null;
  for (const url of urls) {
    const site = siteOf(url);
    if (!site) continue;
    const strength = matchSite(site, page);
    if (strength === 'exact') return 'exact';
    if (strength) best = strength;
  }
  return best;
}

/** What to show for a site in a sentence: its domain, or its host where it has none. */
export function siteName(site: Site): string {
  return site.domain ?? site.host;
}

/** The URL as it should be stored: trimmed, with a scheme, no credentials or fragment. */
export function normaliseUrl(input: string): string | null {
  const text = input.trim();
  if (!text) return null;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!url.hostname) return null;
    url.username = '';
    url.password = '';
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}
