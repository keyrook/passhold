/**
 * Host normalization, grant bounds checking, and canonical operation building
 * for machine/agent runtimes. Shared by CLI, MCP, and owner review UI so what
 * the person sees and approves is byte-for-byte what the runtime checks before
 * using any secret.
 */
import { isMachineOperation, type MachineOperation } from '@keyrook/account';
import { getDomain } from 'tldts';
import { toBase64, utf8 } from '../util/bytes.js';

const MAX_URL = 4096;
const MAX_HOST = 253;
const MAX_HEADERS = 64;
const MAX_ARGS = 256;
const MAX_TIMEOUT = 86_400;

export const ALLOWED_HTTP_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const;
export type AllowedHttpMethod = (typeof ALLOWED_HTTP_METHODS)[number];

/** Headers a caller may never set: framing, routing, proxy, or authentication. */
export const RESERVED_REQUEST_HEADERS = new Set([
  'host',
  'authorization',
  'proxy-authorization',
  'content-length',
  'transfer-encoding',
  'connection',
  'keep-alive',
  'te',
  'trailer',
  'upgrade',
]);

const HEADER_NAME = /^[a-z0-9!#$%&'*+.^_`|~-]{1,128}$/;
const HEADER_VALUE = /^[\t\x20-\x7e\x80-\xff]*$/;
const ENV_NAME = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/;
const LABEL = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?';
const HOST_PATTERN = new RegExp(`^(?:\\*\\.)?(?:${LABEL}\\.)*${LABEL}(?::([1-9][0-9]{0,4}))?$`);
const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const ABSOLUTE_PATH = /^(?:\/|[A-Za-z]:[\\/])/;

export interface NormalizedRequestUrl {
  /** Canonical ASCII URL (`parsed.href`), with dot-segments resolved, no userinfo, no fragment. */
  url: string;
  protocol: 'https:' | 'http:';
  /** Canonical lowercase ASCII (punycode for IDN) or bracketed IPv6 literal, never ending with a dot. */
  hostname: string;
  /** Non-default port string (`'8443'`), or `''` for the scheme's default port (443 for https, 80 for http). */
  port: string;
  /** `hostname` plus `:port` when non-default. */
  host: string;
  pathname: string;
  search: string;
}

export interface NormalizeUrlOptions {
  /** Allow plain `http:` strictly for loopback addresses (`localhost`, `127.0.0.1`, `[::1]`). Defaults to true. */
  allowInsecureLoopback?: boolean;
}

export function isIpHostname(hostname: string): boolean {
  if (hostname.startsWith('[') && hostname.endsWith(']')) return true;
  if (!IPV4_RE.test(hostname)) return false;
  return hostname.split('.').every((part) => Number(part) <= 255);
}

export function isLoopbackHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

/**
 * Strictly normalizes and validates a target HTTP(S) URL.
 * Refuses fragments, userinfo, backslashes in authority, trailing dots,
 * control characters, non-HTTP(S) schemes, and plain HTTP on non-loopback hosts.
 */
export function normalizeRequestUrl(rawUrl: string, options: NormalizeUrlOptions = {}): NormalizedRequestUrl {
  if (typeof rawUrl !== 'string' || rawUrl.length === 0 || rawUrl.length > MAX_URL) {
    throw new Error('Invalid request URL.');
  }
  if (/[\x00-\x1f\x7f]/.test(rawUrl)) throw new Error('Request URL contains control characters.');
  if (rawUrl.includes('#')) throw new Error('Request URL must not contain a fragment.');
  const schemeMatch = /^([A-Za-z][A-Za-z0-9+.-]*):\/\/([^/?#]*)/.exec(rawUrl);
  if (!schemeMatch) throw new Error('Request URL must be an absolute http or https URL.');
  const rawAuthority = schemeMatch[2]!;
  if (!rawAuthority || rawAuthority.includes('@') || rawAuthority.includes('\\')) {
    throw new Error('Request URL authority is not allowed.');
  }
  // Catch trailing dot on raw host before any normalization (e.g. `api.example.com.:443`).
  const rawHostOnly = rawAuthority.startsWith('[') ? rawAuthority.slice(0, rawAuthority.indexOf(']') + 1) : rawAuthority.split(':')[0]!;
  if (!rawHostOnly || rawHostOnly.endsWith('.') || rawHostOnly.startsWith('.') || rawHostOnly.includes('..')) {
    throw new Error('Request URL host is malformed.');
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid request URL.');
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Only https (or loopback http) URLs are allowed.');
  }
  if (parsed.username !== '' || parsed.password !== '' || parsed.hash !== '') {
    throw new Error('Request URL must not include credentials or a fragment.');
  }
  if (!parsed.hostname || parsed.hostname.endsWith('.')) {
    throw new Error('Request URL host is malformed.');
  }
  if (parsed.protocol === 'http:') {
    const allowLoopback = options.allowInsecureLoopback ?? true;
    if (!allowLoopback || !isLoopbackHostname(parsed.hostname)) {
      throw new Error('Plain HTTP is refused for non-loopback hosts.');
    }
  }
  if (parsed.href.length > MAX_URL) throw new Error('Normalized request URL is too long.');
  return {
    url: parsed.href,
    protocol: parsed.protocol,
    hostname: parsed.hostname.toLowerCase(),
    port: parsed.port,
    host: parsed.host.toLowerCase(),
    pathname: parsed.pathname,
    search: parsed.search,
  };
}

interface ParsedAllowedHost {
  wild: boolean;
  hostname: string;
  port: string;
}

function parseAllowedHost(entry: string): ParsedAllowedHost | null {
  if (typeof entry !== 'string' || entry.length === 0 || entry.length > MAX_HOST) return null;
  const trimmed = entry.trim().toLowerCase();
  if (trimmed !== entry || trimmed.endsWith('.')) return null;

  // Bracketed IPv6 literal with optional port, e.g. `[::1]` or `[::1]:8080`.
  if (trimmed.startsWith('[')) {
    try {
      const parsed = new URL(`https://${trimmed}/`);
      if (parsed.host !== trimmed) return null;
      return { wild: false, hostname: parsed.hostname, port: parsed.port };
    } catch {
      return null;
    }
  }

  const match = HOST_PATTERN.exec(trimmed);
  if (!match) return null;
  const port = match[1] ?? '';
  if (port && Number(port) > 65_535) return null;

  const wild = trimmed.startsWith('*.');
  const withoutWild = wild ? trimmed.slice(2) : trimmed;
  const hostname = port ? withoutWild.slice(0, -(port.length + 1)) : withoutWild;
  if (!hostname || hostname.endsWith('.')) return null;

  if (wild) {
    // Wildcards may never cover an IP address or a public/private suffix (`*.com`, `*.github.io`).
    if (isIpHostname(hostname)) return null;
    const domain = getDomain(hostname, { allowPrivateDomains: true });
    if (!domain || (hostname !== domain && !hostname.endsWith(`.${domain}`))) return null;
  }
  return { wild, hostname, port };
}

/**
 * Checks whether a normalized request URL is allowed by a list of host patterns.
 * - Exact hosts match exact hostname and exact port (default port if omitted).
 * - Wildcards (`*.example.com`) match `example.com` and subdomains on the matching port,
 *   never IP addresses, never trailing-dot/homograph mismatches, and never public/private suffixes.
 */
export function hostAllowed(target: NormalizedRequestUrl, allowedHosts: readonly string[]): boolean {
  if (!allowedHosts.length) return false;
  const targetIsIp = isIpHostname(target.hostname);
  for (const raw of allowedHosts) {
    const pattern = parseAllowedHost(raw);
    if (!pattern) continue;
    // Port must match explicitly (default port `''` only matches default port; `:443` on https was normalized to `''`).
    const patternPort =
      (target.protocol === 'https:' && pattern.port === '443') || (target.protocol === 'http:' && pattern.port === '80')
        ? ''
        : pattern.port;
    if (target.port !== patternPort) continue;
    if (!pattern.wild) {
      if (target.hostname === pattern.hostname) return true;
    } else if (!targetIsIp) {
      if (target.hostname === pattern.hostname || target.hostname.endsWith(`.${pattern.hostname}`)) return true;
    }
  }
  return false;
}

export interface RequestBounds {
  methods?: string[];
  hosts?: string[];
  paths?: string[];
}

export interface CommandBounds {
  commands?: string[];
  argvPrefixes?: string[][];
  cwd?: string[];
}

function pathMatchesPattern(pathname: string, rawPattern: string): boolean {
  if (typeof rawPattern !== 'string' || !rawPattern.startsWith('/')) return false;
  const pattern = rawPattern.endsWith('/*') ? rawPattern.slice(0, -1) : rawPattern;
  if (pattern === '/') return true;
  if (pattern.endsWith('/')) return pathname.startsWith(pattern);
  return pathname === pattern || pathname.startsWith(`${pattern}/`);
}

/**
 * Checks whether a normalized HTTP request fits the grant's `bounds` object.
 * Path checks run on the normalized pathname and reject encoded slash/dot traversal attempts.
 */
export function boundsAllowRequest(
  bounds: Record<string, unknown> | undefined,
  method: string,
  target: NormalizedRequestUrl,
): { ok: true } | { ok: false; reason: string } {
  if (!bounds || typeof bounds !== 'object') return { ok: true };

  if (Array.isArray(bounds.methods) && bounds.methods.length > 0) {
    const allowed = bounds.methods.filter((m): m is string => typeof m === 'string').map((m) => m.toUpperCase());
    if (!allowed.includes(method.toUpperCase())) {
      return { ok: false, reason: `HTTP method ${method} is not allowed by this grant.` };
    }
  }

  if (Array.isArray(bounds.hosts) && bounds.hosts.length > 0) {
    const allowed = bounds.hosts.filter((h): h is string => typeof h === 'string');
    if (!hostAllowed(target, allowed)) {
      return { ok: false, reason: `Host ${target.host} is not allowed by this grant's bounds.` };
    }
  }

  if (Array.isArray(bounds.paths) && bounds.paths.length > 0) {
    // Reject encoded path separators or encoded dot segments when path restrictions apply.
    if (/%2f|%5c|%2e%2e/i.test(target.pathname)) {
      return { ok: false, reason: 'Encoded path traversal characters are not allowed.' };
    }
    const allowed = bounds.paths.filter((p): p is string => typeof p === 'string');
    if (!allowed.some((pattern) => pathMatchesPattern(target.pathname, pattern))) {
      return { ok: false, reason: `Path ${target.pathname} is not allowed by this grant.` };
    }
  }

  return { ok: true };
}

/** Checks whether a command invocation fits the grant's `bounds` object. */
export function boundsAllowCommand(
  bounds: Record<string, unknown> | undefined,
  argv: readonly string[],
  cwd?: string,
): { ok: true } | { ok: false; reason: string } {
  if (!argv.length || !argv[0]) return { ok: false, reason: 'Command argv must not be empty.' };
  if (!bounds || typeof bounds !== 'object') return { ok: true };

  if (Array.isArray(bounds.commands) && bounds.commands.length > 0) {
    const allowed = bounds.commands.filter((c): c is string => typeof c === 'string' && c.length > 0);
    if (!allowed.includes(argv[0])) {
      return { ok: false, reason: `Command ${argv[0]} is not allowed by this grant.` };
    }
  }

  if (Array.isArray(bounds.argvPrefixes) && bounds.argvPrefixes.length > 0) {
    const prefixes = bounds.argvPrefixes.filter(
      (prefix): prefix is string[] => Array.isArray(prefix) && prefix.length > 0 && prefix.every((a) => typeof a === 'string'),
    );
    const matched = prefixes.some((prefix) => argv.length >= prefix.length && prefix.every((part, idx) => argv[idx] === part));
    if (!matched) {
      return { ok: false, reason: 'Command arguments do not match any allowed prefix in this grant.' };
    }
  }

  if (cwd && Array.isArray(bounds.cwd) && bounds.cwd.length > 0) {
    const allowed = bounds.cwd.filter((dir): dir is string => typeof dir === 'string' && ABSOLUTE_PATH.test(dir));
    const norm = cwd.replace(/\/+$/, '') || '/';
    const matched = allowed.some((dir) => {
      const base = dir.replace(/\/+$/, '') || '/';
      return base === '/' || norm === base || norm.startsWith(`${base}/`);
    });
    if (!matched) {
      return { ok: false, reason: `Working directory ${cwd} is not allowed by this grant.` };
    }
  }

  return { ok: true };
}

/**
 * Validates and canonicalizes caller-provided HTTP headers into lowercase sorted pairs.
 * Refuses reserved headers and any header name reserved for credential injection.
 */
export function cleanRequestHeaders(
  headers: Record<string, string> | readonly [string, string][] | undefined,
  forbiddenNames: readonly string[] = [],
): [string, string][] {
  if (!headers) return [];
  const entries: [string, string][] = Array.isArray(headers)
    ? headers.map(([k, v]) => [String(k), String(v)])
    : Object.entries(headers).map(([k, v]) => [String(k), String(v)]);
  if (entries.length > MAX_HEADERS) throw new Error('Too many request headers.');
  const blocked = new Set([...RESERVED_REQUEST_HEADERS, ...forbiddenNames.map((n) => n.toLowerCase())]);
  const out: [string, string][] = [];
  for (const [rawName, value] of entries) {
    const name = rawName.trim().toLowerCase();
    if (!HEADER_NAME.test(name)) throw new Error(`Invalid header name: ${rawName}`);
    if (blocked.has(name)) throw new Error(`Header "${name}" may not be set by the caller.`);
    if (value.length > MAX_URL || !HEADER_VALUE.test(value)) throw new Error(`Invalid value for header "${name}".`);
    out.push([name, value]);
  }
  out.sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])));
  return out;
}

export async function sha256Base64(data: Uint8Array | string): Promise<string> {
  const bytes = typeof data === 'string' ? utf8(data) : data;
  const digest = await crypto.subtle.digest('SHA-256', bytes as BufferSource);
  return toBase64(new Uint8Array(digest));
}

export interface BuildHttpOperationInput {
  method: string;
  url: string;
  headers?: Record<string, string> | readonly [string, string][];
  body?: Uint8Array | string | null;
  forbiddenHeaders?: readonly string[];
  allowInsecureLoopback?: boolean;
}

/** Builds a canonical `request` operation guaranteed to pass `@keyrook/account`'s `isMachineOperation`. */
export async function buildHttpOperation(input: BuildHttpOperationInput): Promise<{
  normalized: NormalizedRequestUrl;
  operation: Extract<MachineOperation, { use: 'request' }>;
  bodyBytes: Uint8Array | null;
}> {
  const method = input.method.trim().toUpperCase();
  if (!(ALLOWED_HTTP_METHODS as readonly string[]).includes(method)) {
    throw new Error(`Unsupported HTTP method: ${input.method}`);
  }
  const normalized = normalizeRequestUrl(input.url, { allowInsecureLoopback: input.allowInsecureLoopback });
  const headers = cleanRequestHeaders(input.headers, input.forbiddenHeaders);
  const bodyBytes =
    input.body === undefined || input.body === null
      ? null
      : typeof input.body === 'string'
        ? utf8(input.body)
        : input.body;
  if ((method === 'GET' || method === 'HEAD') && bodyBytes !== null && bodyBytes.length > 0) {
    throw new Error(`${method} requests must not carry a body.`);
  }
  const effectiveBody = method === 'GET' || method === 'HEAD' ? null : bodyBytes;
  const bodyDigest = effectiveBody !== null ? await sha256Base64(effectiveBody) : null;
  const operation: Extract<MachineOperation, { use: 'request' }> = {
    use: 'request',
    method,
    url: normalized.url,
    headers,
    body: bodyDigest,
  };
  if (!isMachineOperation(operation)) throw new Error('Request operation failed canonical validation.');
  return { normalized, operation, bodyBytes: effectiveBody };
}

export interface BuildRunOperationInput {
  argv: readonly string[];
  cwd: string;
  env: readonly { name: string; ref: string }[];
  timeout: number;
}

/** Builds a canonical `run` operation guaranteed to pass `@keyrook/account`'s `isMachineOperation`. */
export function buildRunOperation(input: BuildRunOperationInput): Extract<MachineOperation, { use: 'run' }> {
  if (!Array.isArray(input.argv) || input.argv.length === 0 || input.argv.length > MAX_ARGS || !input.argv[0]) {
    throw new Error('Command argv must be a non-empty array of strings.');
  }
  if (!ABSOLUTE_PATH.test(input.cwd) || input.cwd.includes('\0')) {
    throw new Error('Working directory must be an absolute path.');
  }
  const timeout = Math.floor(input.timeout);
  if (!Number.isSafeInteger(timeout) || timeout < 1 || timeout > MAX_TIMEOUT) {
    throw new Error(`Timeout must be between 1 and ${MAX_TIMEOUT} seconds.`);
  }
  const seen = new Set<string>();
  const env: { name: string; ref: string }[] = [];
  for (const entry of input.env) {
    if (!ENV_NAME.test(entry.name)) throw new Error(`Invalid environment variable name: ${entry.name}`);
    const upper = entry.name.toUpperCase();
    if (seen.has(upper)) throw new Error(`Duplicate environment variable name: ${entry.name}`);
    seen.add(upper);
    env.push({ name: entry.name, ref: entry.ref });
  }
  env.sort((a, b) => a.name.localeCompare(b.name));
  const operation: Extract<MachineOperation, { use: 'run' }> = {
    use: 'run',
    argv: [...input.argv],
    cwd: input.cwd,
    env,
    timeout,
  };
  if (!isMachineOperation(operation)) throw new Error('Command operation failed canonical validation.');
  return operation;
}

/** Exact structural equality check between two canonical `MachineOperation` objects. */
export function operationsEqual(a: MachineOperation, b: MachineOperation): boolean {
  if (a.use !== b.use) return false;
  switch (a.use) {
    case 'request': {
      const other = b as Extract<MachineOperation, { use: 'request' }>;
      return (
        a.method === other.method &&
        a.url === other.url &&
        a.body === other.body &&
        a.headers.length === other.headers.length &&
        a.headers.every((pair, index) => pair[0] === other.headers[index]![0] && pair[1] === other.headers[index]![1])
      );
    }
    case 'run': {
      const other = b as Extract<MachineOperation, { use: 'run' }>;
      return (
        a.cwd === other.cwd &&
        a.timeout === other.timeout &&
        a.argv.length === other.argv.length &&
        a.argv.every((arg, index) => arg === other.argv[index]) &&
        a.env.length === other.env.length &&
        a.env.every((entry, index) => entry.name === other.env[index]!.name && entry.ref === other.env[index]!.ref)
      );
    }
    case 'fill':
      return a.url === (b as Extract<MachineOperation, { use: 'fill' }>).url;
    case 'reveal':
      return a.field === (b as Extract<MachineOperation, { use: 'reveal' }>).field;
  }
}
