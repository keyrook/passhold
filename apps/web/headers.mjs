/**
 * What the host sends with the web vault's files. The page repeats its policy in a
 * `<meta>`, which carries all of it but `frame-ancestors`: browsers read that
 * one from a header alone.
 */

/** The page's policy: its own code and the account's two addresses, nothing else. */
export function policy(api, filesStore) {
  const connect = [api, ...(filesStore && filesStore !== api ? [filesStore] : [])].join(' ');
  return [
    "default-src 'none'",
    "script-src 'self'",
    "worker-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    `connect-src ${connect}`,
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "require-trusted-types-for 'script'",
    // The one Trusted Types policy the page makes: its own worker's address (client.ts).
    'trusted-types passhold-worker',
  ].join('; ');
}

/** The policy as a `<meta>` carries it. */
export function metaPolicy(api, filesStore) {
  return policy(api, filesStore)
    .split('; ')
    .filter((directive) => !directive.startsWith('frame-ancestors'))
    .join('; ');
}

/** Every header the host sends, by path: `index.html` (and `/`) is never cached, nor written into on the way. */
export function headers(api, filesStore) {
  const always = {
    'Content-Security-Policy': policy(api, filesStore),
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
    'Cross-Origin-Opener-Policy': 'same-origin',
  };
  return {
    page: { ...always, 'Cache-Control': 'no-cache, no-store, no-transform' },
    // Named by their content: a new build is new names.
    assets: { ...always, 'Cache-Control': 'public, max-age=31536000, immutable' },
  };
}
