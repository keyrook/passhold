/**
 * API keys: which service a key is for, where it may be sent, how, and when
 * it runs out.
 *
 * The services are those of the brand catalogue (brand/catalog.ts), by the
 * same slug, so a key wears the mark its service's logins wear and nothing is
 * fetched to draw it. Its table of APIs (brand/apis.ts) adds what a key
 * needs: the hosts it goes to, how a request carries it, the variable a
 * command reads it from, what its keys start with, and where a new one is
 * made. Each is a default its owner may change on the item.
 */
import { getDomain } from 'tldts';
import { API_SERVICES, type ApiService } from './brand/apis.js';
import { CATALOG } from './brand/catalog.js';
import type { ApiKeyItem, ApiKeyDraft, VaultData } from './vault/model.js';

export { API_SERVICES, type ApiService } from './brand/apis.js';

const BY_SLUG = new Map(API_SERVICES.map((service) => [service.slug, service]));
const NAMES = new Map(CATALOG.map((brand) => [brand.slug, brand.name]));

/** The service a slug names, as the table has it; null for one it does not list. */
export function apiService(slug: string): ApiService | null {
  return BY_SLUG.get(slug) ?? null;
}

/** A service's own name, from the catalogue; '' for none. */
export function serviceName(slug: string): string {
  return slug ? (NAMES.get(slug) ?? '') : '';
}

/** Every service a key may be filed under, by name: those the table knows, as the catalogue names them. */
export function apiServiceChoices(): { slug: string; name: string }[] {
  return API_SERVICES.map(({ slug }) => ({ slug, name: serviceName(slug) || slug })).sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

/**
 * The service a key is for, by what it — or its id — starts with: the
 * longest prefix that fits, where one service's prefix begins another's.
 * Null when none fits: a key is never guessed at.
 */
export function serviceOfKey(key: string, keyId = ''): string | null {
  let found: { slug: string; length: number } | null = null;
  for (const service of API_SERVICES) {
    for (const prefix of service.prefixes ?? []) {
      const fits = [key.trim(), keyId.trim()].some((value) => value.length > prefix.length && value.startsWith(prefix));
      if (fits && (!found || prefix.length > found.length)) found = { slug: service.slug, length: prefix.length };
    }
  }
  return found?.slug ?? null;
}

// --- what an item holds, checked ------------------------------------------------------

export const API_KEY_LIMITS = {
  /** Far above any key a service issues — a JWT or a service account's JSON included — and below what would slow every seal. */
  key: 20_000,
  keyId: 1_000,
  hosts: 20,
  env: 100,
  line: 200,
  scopes: 2_000,
} as const;

const TOKEN = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
const QUERY_NAME = /^[A-Za-z0-9_.~-]+$/;

/**
 * How a request carries the key, as one of the four ways; anything else is
 * `bearer`. A header's name is an HTTP token, so no line break or colon can
 * ride in it into a request.
 */
export function cleanSendAs(value: unknown): string {
  if (typeof value !== 'string') return 'bearer';
  const text = value.trim();
  if (text === 'bearer' || text === 'basic') return text;
  const header = /^header:(.+)$/i.exec(text);
  if (header && header[1]!.length <= 100 && TOKEN.test(header[1]!)) return `header:${header[1]}`;
  const query = /^query:(.+)$/i.exec(text);
  if (query && query[1]!.length <= 100 && QUERY_NAME.test(query[1]!)) return `query:${query[1]}`;
  return 'bearer';
}

/** A variable's name as a shell takes one: letters, digits and `_`, not starting with a digit. What else was typed becomes `_`, so nothing typed is lost. */
export function cleanEnvName(value: unknown): string {
  if (typeof value !== 'string') return '';
  const name = value.trim().replace(/[^A-Za-z0-9_]/g, '_').slice(0, API_KEY_LIMITS.env);
  return /^[0-9]/.test(name) ? `_${name}`.slice(0, API_KEY_LIMITS.env) : name;
}

/**
 * One host a key may go to, as the address bar would write it — or null.
 * A URL pasted whole gives its host. `*.example.com` is example.com and every
 * host under it; a star over a whole suffix (`*.com`, `*.github.io`) is
 * refused: it would hand the key to anyone who registers a name there.
 */
export function cleanHost(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  let text = value.trim().toLowerCase();
  if (!text) return null;
  const wild = text.startsWith('*.');
  if (wild) text = text.slice(2);
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  if (url.username || url.password || !url.hostname || url.hostname.includes('*')) return null;
  const host = url.host;
  if (!wild) return host;
  const domain = getDomain(url.hostname, { allowPrivateDomains: true });
  return domain && (url.hostname === domain || url.hostname.endsWith(`.${domain}`)) ? `*.${host}` : null;
}

/** Hosts as stored: each checked, none twice, at most twenty. */
export function cleanHosts(value: unknown): string[] {
  const listed = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[\s,]+/) : [];
  const hosts: string[] = [];
  for (const entry of listed) {
    const host = cleanHost(entry);
    if (host && !hosts.includes(host)) hosts.push(host);
    if (hosts.length >= API_KEY_LIMITS.hosts) break;
  }
  return hosts;
}

const DAY = 24 * 60 * 60 * 1000;

/** A date as stored: midnight UTC of the day it falls on there. Null for what is no date. */
export function cleanDay(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  const day = Math.floor(value / DAY) * DAY;
  // Years 2000 to 2199: a key from before, or one that never expires written as a far date, is kept as given within them.
  return day >= Date.UTC(2000, 0, 1) && day < Date.UTC(2200, 0, 1) ? day : null;
}

/** `YYYY-MM-DD`, as a date input takes it; '' for none. */
export function dayText(day: number | null): string {
  return day === null ? '' : new Date(day).toISOString().slice(0, 10);
}

/** A date input's `YYYY-MM-DD` as stored; null for none, or for what is not a date. */
export function dayOf(text: string): number | null {
  const found = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(text);
  if (!found) return null;
  const [year, month, date] = [Number(found[1]), Number(found[2]), Number(found[3])];
  const day = Date.UTC(year, month - 1, date);
  // 2027-02-31 is no date, though Date would make it March's.
  return new Date(day).getUTCDate() === date ? cleanDay(day) : null;
}

// --- running out --------------------------------------------------------------------------

/** A key that runs out within this many days is said to its owner: in the checkup, its list and its page. */
export const EXPIRY_NOTICE_DAYS = 14;

/**
 * Days from today to the day a key expires: 0 on that day, negative once it
 * has. Today is the owner's own date, where the device is; null when the key
 * has no expiry.
 */
export function daysLeft(item: Pick<ApiKeyItem, 'expiresAt'>, now = Date.now()): number | null {
  if (item.expiresAt === null) return null;
  const here = new Date(now);
  const today = Date.UTC(here.getFullYear(), here.getMonth(), here.getDate());
  return Math.round((item.expiresAt - today) / DAY);
}

/** Expired, or running out within the notice: what to say of it. Null for a key with time to spare, or no expiry. */
export function expiryNotice(item: Pick<ApiKeyItem, 'expiresAt'>, now = Date.now()): { days: number; expired: boolean } | null {
  const days = daysLeft(item, now);
  if (days === null || days > EXPIRY_NOTICE_DAYS) return null;
  return { days, expired: days < 0 };
}

/** Live API keys expired or running out within the notice, the soonest first. */
export function expiringKeys(data: Pick<VaultData, 'wallet'>, now = Date.now()): ApiKeyItem[] {
  return data.wallet
    .filter((item): item is ApiKeyItem => item.kind === 'apikey' && item.deletedAt === null && expiryNotice(item, now) !== null)
    .sort((a, b) => a.expiresAt! - b.expiresAt!);
}

// --- a new key's defaults -----------------------------------------------------------------

/**
 * A draft filed under another service: the hosts, the way it is sent and the
 * variable that service's keys go by — where the draft holds none, or still
 * holds the defaults of the service it was under. What its owner typed is
 * never written over.
 */
export function withService(draft: ApiKeyDraft, slug: string): ApiKeyDraft {
  const before = apiService(draft.service);
  const after = apiService(slug);
  const kept = <T>(value: T, empty: boolean, defaulted: T | undefined) => !empty && (defaulted === undefined || JSON.stringify(value) !== JSON.stringify(defaulted));
  return {
    ...draft,
    service: slug,
    hosts: kept(draft.hosts, !draft.hosts.length, before?.hosts) ? draft.hosts : [...(after?.hosts ?? [])],
    sendAs: kept(draft.sendAs, !draft.sendAs || draft.sendAs === 'bearer', before ? (before.sendAs ?? 'bearer') : undefined) ? draft.sendAs : (after?.sendAs ?? 'bearer'),
    env: kept(draft.env, !draft.env, before?.env) ? draft.env : (after?.env ?? ''),
  };
}

/** An empty API key, as a form starts one. */
export function blankApiKey(): ApiKeyDraft {
  return { kind: 'apikey', title: '', service: '', key: '', keyId: '', hosts: [], sendAs: 'bearer', env: '', environment: '', scopes: '', issuedAt: null, expiresAt: null, notes: '' };
}
