/**
 * Single source of truth for manifest.json.
 *
 * Permission policy. Passhold puts its button in sign-in fields and offers to
 * save what a form sends, so its content script is declared on every http and
 * https page — which is what puts "read and change all your data on all
 * websites" on the install prompt, as it does for every password manager that
 * fills in the page. That script is the narrowest thing in the package: it
 * never sees the vault, only a fill it is handed for its own frame, and the
 * list of logins is drawn in an extension page the web page cannot read
 * (docs/security.md).
 *
 * Nothing else reaches the web: no `host_permissions` at install — one,
 * optional, for the Keyrook account's page, asked for only to sign in with its
 * passkeys — no `scripting`, no `tabs`, and one address on the network — the
 * Keyrook account's server, for whoever signs in (scripts/api.mjs). That server is also the one web page
 * that may send Passhold a message: how a sign-in with Google or GitHub,
 * made in Passhold's own tab, comes back to it.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { accountPageFor, accountRpFor, checkApi, OFFICIAL_API } from './api.mjs';

export const CONTENT_MATCHES = ['http://*/*', 'https://*/*'];

/**
 * Pages that check whether a person or a bot is there: Cloudflare's Turnstile
 * and challenge pages, Google's reCAPTCHA, hCaptcha. Nothing in them is
 * Passhold's to fill or answer, and anything a script changes in them can fail
 * the check — and with it the sign-in it guards, in a loop of reloads.
 */
/**
 * The Keyrook account's own page, whose passkeys answer PRF with what opens
 * the account's root key — every app's key. Passhold's passkey scripts stay
 * out of it: that answer must pass through nothing of Passhold's, and a
 * passkey that opens Passhold must never be kept in Passhold, or losing the
 * computer loses both. The worker refuses its passkeys too (`rpIdFor`). A
 * test build stays off its own page as the release stays off the
 * real one, by this alone: `rpIdFor` is in every store upload, so it names the
 * real page and no other.
 */
const keyrookAccountPage = (api) => `${accountPageFor(api)}/*`;

export const CONTENT_EXCLUDES = [
  'https://challenges.cloudflare.com/*',
  '*://*/cdn-cgi/*',
  'https://www.google.com/recaptcha/*',
  'https://www.recaptcha.net/*',
  'https://recaptcha.net/*',
  'https://*.hcaptcha.com/*',
];

/**
 * Content Security Policy for every extension page.
 *
 * - `connect-src` the Keyrook server and nothing else: what reaches it is
 *   sealed before it leaves, and only for an owner who signed in. A bug cannot
 *   become a way out anywhere else, and a favicon or breach check that would
 *   tell a server every site its owner has an account on cannot be added by
 *   accident.
 * - `img-src 'self' data:`: bundled artwork only, for the same reason.
 * - `style-src 'unsafe-inline'`: React writes inline style attributes. Script
 *   stays locked to the package.
 */
function contentSecurityPolicy(api) {
  return [
    "script-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "img-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    `connect-src ${api}`,
    "frame-src 'none'",
    "child-src 'none'",
    "form-action 'none'",
  ].join('; ');
}

const ICONS = { 16: 'icons/icon-16.png', 32: 'icons/icon-32.png', 48: 'icons/icon-48.png', 128: 'icons/icon-128.png' };

/**
 * `built`: when this copy was built, for one loaded unpacked — Chrome shows
 * it on the extension's card, so whoever tries a build can see the one
 * running is the one they were given. A store upload carries none.
 */
export function buildManifest({ version, api = OFFICIAL_API, built, test = false }) {
  // The Keyrook account's passkeys: their site, asked for when a passkey is chosen (scripts/api.mjs).
  const accountRp = [`https://${accountRpFor(api)}/*`];
  return {
    manifest_version: 3,
    name: '__MSG_appName__',
    short_name: 'Passhold',
    version,
    ...(built ? { version_name: `${version} (${built})` } : {}),
    description: '__MSG_appDescription__',
    default_locale: 'en',
    // Offscreen documents, runtime.getContexts and messages addressed to one
    // document (documentId) are all there by 120.
    minimum_chrome_version: '120',

    action: { default_title: 'Passhold', default_popup: 'popup.html', default_icon: ICONS },
    icons: ICONS,

    background: { service_worker: 'background.js', type: 'module' },

    options_ui: { page: 'options.html', open_in_tab: true },

    // `idle`: lock when the computer locks. `offscreen` + `clipboardWrite`:
    // clear a copied password after a while. None carries an install warning.
    permissions: ['storage', 'alarms', 'idle', 'offscreen', 'clipboardWrite'],

    // Signing in with one of the Keyrook account's passkeys: Chrome lets an
    // extension use a site's passkeys only with the host permission for that
    // site. Optional, so nothing at install; asked for when its owner chooses
    // a passkey, and used for nothing else — the CSP below still lets Passhold
    // reach the Keyrook server alone, and Passhold's passkey scripts stay off
    // the page (keyrookAccountPage). A test build has it already: the suite
    // cannot answer Chrome's question.
    optional_host_permissions: accountRp,
    ...(test ? { host_permissions: accountRp } : {}),

    content_scripts: [
      {
        matches: CONTENT_MATCHES,
        exclude_matches: CONTENT_EXCLUDES,
        js: ['content.js'],
        // Sign-in forms often live in an iframe of the site's own.
        all_frames: true,
        run_at: 'document_idle',
      },
      // Websites' passkeys: a site asks `navigator.credentials` in its own
      // world, often as the page loads, so Passhold is there first — in that
      // world (webauthn.js, which holds nothing) and beside it (bridge.js),
      // in the top frame, where Passhold's frame for the choice is drawn.
      // Never on the Keyrook account's page, whose passkeys are the browser's alone.
      { matches: CONTENT_MATCHES, exclude_matches: [...CONTENT_EXCLUDES, keyrookAccountPage(api)], js: ['bridge.js'], run_at: 'document_start' },
      { matches: CONTENT_MATCHES, exclude_matches: [...CONTENT_EXCLUDES, keyrookAccountPage(api)], js: ['webauthn.js'], run_at: 'document_start', world: 'MAIN' },
    ],

    // The inline list, the save prompt and the passkey frame are extension
    // pages framed into the web page: drawn there, but in an origin the page
    // cannot script or read.
    // `use_dynamic_url`: only Passhold's own script may frame them — a web page
    // that tries gets nothing, and cannot probe for the extension that way
    // (e2e/autofill.spec.ts holds it).
    web_accessible_resources: [
      { resources: ['menu.html', 'prompt.html', 'passkey.html'], matches: CONTENT_MATCHES, use_dynamic_url: true },
    ],

    content_security_policy: { extension_pages: contentSecurityPolicy(checkApi(api)) },

    // A sign-in with Google or GitHub leaves Passhold's tab for the Keyrook
    // server and the provider, and comes back on a page of the server's that
    // hands the answer over. No other page may message Passhold at all, and
    // the service worker checks the sender is that origin too. Not a
    // permission: it adds nothing to the install prompt.
    externally_connectable: { matches: [`${checkApi(api)}/*`] },

    commands: {
      _execute_action: {
        suggested_key: { default: 'Alt+Shift+P', mac: 'Alt+Shift+P' },
        description: '__MSG_commandOpen__',
      },
    },
  };
}

/**
 * What Chrome and the stores read from `_locales`: the name, the summary and
 * the shortcut's name, one file per language in store/locales — beside its
 * long description in store/listings, pasted into each store's dashboard.
 * Chrome names a regional language with an
 * underscore: pt-BR is `pt_BR`.
 */
const STORE = resolve(import.meta.dirname, '../store/locales');
export const STORE_LOCALES = Object.fromEntries(
  readdirSync(STORE)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => [file.slice(0, -'.json'.length).replace('-', '_'), JSON.parse(readFileSync(resolve(STORE, file), 'utf8'))]),
);
