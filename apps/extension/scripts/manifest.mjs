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
 * Nothing else reaches the web: no `host_permissions`, no `scripting`, no
 * `tabs`, no network at all (`connect-src 'none'`).
 */
export const CONTENT_MATCHES = ['http://*/*', 'https://*/*'];

/**
 * Content Security Policy for every extension page.
 *
 * - `connect-src 'none'`: Passhold talks to no server. A bug cannot become a
 *   way out for the vault, and a favicon or breach check that would tell a
 *   server every site its owner has an account on cannot be added by accident.
 * - `img-src 'self' data:`: bundled artwork only, for the same reason.
 * - `style-src 'unsafe-inline'`: React writes inline style attributes. Script
 *   stays locked to the package.
 */
function contentSecurityPolicy() {
  return [
    "script-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "img-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "connect-src 'none'",
    "frame-src 'none'",
    "child-src 'none'",
    "form-action 'none'",
  ].join('; ');
}

const ICONS = { 16: 'icons/icon-16.png', 32: 'icons/icon-32.png', 48: 'icons/icon-48.png', 128: 'icons/icon-128.png' };

export function buildManifest({ version }) {
  return {
    manifest_version: 3,
    name: '__MSG_appName__',
    short_name: 'Passhold',
    version,
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

    content_scripts: [
      {
        matches: CONTENT_MATCHES,
        js: ['content.js'],
        // Sign-in forms often live in an iframe of the site's own.
        all_frames: true,
        run_at: 'document_idle',
      },
    ],

    // The inline list and the save prompt are extension pages framed into the
    // web page: drawn there, but in an origin the page cannot script or read.
    // `use_dynamic_url`: only Passhold's own script may frame them — a web page
    // that tries gets nothing, and cannot probe for the extension that way
    // (e2e/autofill.spec.ts holds it).
    web_accessible_resources: [
      { resources: ['menu.html', 'prompt.html'], matches: CONTENT_MATCHES, use_dynamic_url: true },
    ],

    content_security_policy: { extension_pages: contentSecurityPolicy() },

    commands: {
      _execute_action: {
        suggested_key: { default: 'Alt+Shift+P', mac: 'Alt+Shift+P' },
        description: '__MSG_commandOpen__',
      },
    },
  };
}

/** What Chrome and the store read from _locales: the name and summary per language. */
export const STORE_LOCALES = {
  en: {
    appName: 'Password Manager - Passhold',
    appDescription:
      'Save, fill and generate passwords. Encrypted on your device with your master password. By Keyrook.',
    commandOpen: 'Open Passhold',
  },
  vi: {
    appName: 'Quản lý mật khẩu - Passhold',
    appDescription:
      'Lưu, tự điền và tạo mật khẩu. Mã hoá ngay trên máy bằng mật khẩu chính của bạn. Một sản phẩm của Keyrook.',
    commandOpen: 'Mở Passhold',
  },
};
