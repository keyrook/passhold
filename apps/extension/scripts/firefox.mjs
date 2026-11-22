/**
 * The Firefox build's manifest, made from the Chrome one so the two cannot
 * drift: the same pages, content scripts, policy and commands, with only what
 * Firefox does differently changed. `npm run build:firefox` writes it.
 */

/**
 * The add-on's id on addons.mozilla.org. Firefox names the extension by it
 * (`runtime.id`), signs it under it, and derives the address its sign-in
 * window returns to from it, so it never changes once a version is uploaded;
 * the account's server lists it before it hands the add-on a sign-in
 *. It only looks like an email address: there is no
 * mailbox behind it.
 */
export const GECKO_ID = 'passhold@keyrook.com';

/**
 * 153, an ESR, is the first Firefox that names each document (`documentId`):
 * on the messages it carries, and as the address `tabs.sendMessage` takes. The
 * worker learns where a frame is from that stamp, and fills, closes a list or
 * answers a passkey request only in the document that asked — a frame that
 * navigated meanwhile gets nothing. Before it, Firefox could address a frame
 * only by its place in the tab, whatever document is there by then.
 * It is past everything else the extension leans on there: the built-in data
 * consent addons.mozilla.org requires of a new listing (140), `storage.session`
 * (115), module background scripts (112), a content script in the page's own
 * world (128), and host access asked for at install (127).
 */
export const FIREFOX_MIN_VERSION = '153.0';

/**
 * What a Keyrook account sends, in Firefox's words: the email and password
 * (as a key derived from it) or the Google or GitHub sign-in that stands in
 * for them, the address, and the device's name and the build's version. What
 * the vault holds leaves only sealed, which Firefox's categories do not
 * describe. Optional: Firefox grants none of it at install, and nothing is
 * sent before it is given. Changing this list is a change to the privacy
 * policy.
 */
export const ACCOUNT_DATA = ['authenticationInfo', 'personallyIdentifyingInfo', 'technicalAndInteraction'];

export function firefoxManifest(manifest) {
  const {
    // Chrome's alone.
    minimum_chrome_version: _chromeOnly,
    // Firefox lets no web page message an extension, so a sign-in made in a
    // tab cannot come back that way: Google and GitHub sign in by the
    // browser's own window (`identity`), which returns to an address made
    // from the add-on's id.
    externally_connectable: _noWebPages,
    // The Keyrook account's passkeys, which the account's server takes from
    // no Firefox extension: its pages' origin is drawn at install, so the
    // server cannot tell Passhold's from another's.
    optional_host_permissions: _noAccountPasskeys,
    host_permissions: _testOnly,
    background,
    permissions,
    web_accessible_resources,
    ...shared
  } = manifest;
  return {
    ...shared,
    // Firefox runs no service worker for an extension: the same file runs as
    // an event page, stopped when idle and started by an event, as the worker is.
    background: { scripts: [background.service_worker], type: background.type },
    // No offscreen documents in Firefox, and no need of one: the event page
    // has a clipboard of its own. `identity`: the sign-in window.
    // `unlimitedStorage`: the vault is kept in the extension's own database
    // there (lib/storage.ts), which Firefox may otherwise evict when the disk
    // fills up.
    permissions: [...permissions.filter((name) => name !== 'offscreen'), 'identity', 'unlimitedStorage'],
    // Firefox draws the extension's address anew on every install, so a page
    // cannot probe for it; `use_dynamic_url` is Chrome's way to the same end.
    web_accessible_resources: web_accessible_resources.map(({ use_dynamic_url: _, ...entry }) => entry),
    browser_specific_settings: {
      gecko: {
        id: GECKO_ID,
        strict_min_version: FIREFOX_MIN_VERSION,
        data_collection_permissions: { required: ['none'], optional: ACCOUNT_DATA },
      },
    },
  };
}
