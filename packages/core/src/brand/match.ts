/**
 * Which service a login belongs to, so the list can be scanned by eye instead
 * of read word by word.
 *
 * This resolves a name; it draws nothing. The artwork lives in the extension,
 * so the desktop and mobile apps get the same matching without a web icon set.
 *
 * Nothing here touches the network, and nothing ever should: fetching a
 * site's icon at display time would tell whoever answers it every site its
 * owner has an account on.
 */
import { siteOf } from '../match.js';
import { CATALOG } from './catalog.js';
import type { BrandEntry } from './types.js';

export type { BrandEntry };

function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const BY_NAME = new Map<string, BrandEntry>();
const BY_DOMAIN = new Map<string, BrandEntry>();

// A service's own name is claimed before anyone's alias, so another service
// listing the same word as an alias cannot take it.
for (const brand of CATALOG) {
  for (const key of [brand.slug, brand.name]) {
    const name = normalise(key);
    if (name && !BY_NAME.has(name)) BY_NAME.set(name, brand);
  }
  for (const domain of brand.domains) if (!BY_DOMAIN.has(domain)) BY_DOMAIN.set(domain, brand);
}
for (const brand of CATALOG) {
  for (const alias of brand.aliases) {
    const name = normalise(alias);
    if (name && !BY_NAME.has(name)) BY_NAME.set(name, brand);
  }
}

/** The service a host belongs to: itself, or any domain it is under. */
function byHost(host: string): BrandEntry | null {
  const labels = host.toLowerCase().replace(/\.$/, '').split('.');
  for (let start = 0; start < labels.length - 1; start++) {
    const brand = BY_DOMAIN.get(labels.slice(start).join('.'));
    if (brand) return brand;
  }
  return null;
}

/**
 * Resolve a login to a service. Its websites decide first — they are where
 * the login is used — and its name only when no website is known: a login
 * named "Google" saved for some other site must not wear Google's mark.
 */
export function brandFor(title: string, urls: readonly string[]): BrandEntry | null {
  let sawSite = false;
  for (const url of urls) {
    const site = siteOf(url);
    if (!site) continue;
    sawSite = true;
    const brand = byHost(site.host);
    if (brand) return brand;
  }
  if (sawSite) return null;
  return BY_NAME.get(normalise(title)) ?? null;
}
