/**
 * What differs between the browsers Passhold runs in, asked of the browser
 * itself. Nothing here changes what Passhold does in Chrome.
 */

/** Firefox, by where it puts an extension's pages: an address drawn at install, never made from the add-on's id. */
export function isFirefox(): boolean {
  return chrome.runtime.getURL('').startsWith('moz-extension://');
}

/**
 * What a Keyrook account sends, in Firefox's words (scripts/firefox.mjs,
 * which the manifest declares it from; test/manifest.test.ts holds the two
 * lists to each other). Firefox grants none of it at install: the click that
 * starts a sign-in asks, and nothing is sent to the account's server before
 * its owner has said yes.
 */
export const ACCOUNT_DATA = ['authenticationInfo', 'personallyIdentifyingInfo', 'technicalAndInteraction'];

// Firefox's own addition to `permissions`, which Chrome's types do not know.
const asked = { data_collection: ACCOUNT_DATA } as unknown as chrome.permissions.Permissions;

/** Whether the account's data may be sent: always in Chrome, which asks nothing of the kind. */
export async function accountDataAllowed(): Promise<boolean> {
  if (!isFirefox()) return true;
  return chrome.permissions.contains(asked).catch(() => false);
}

/**
 * Asks Firefox's question, once: answered yes before, it asks nothing. Called
 * first thing in the click that starts a sign-in — Firefox takes the question
 * only from a click.
 */
export async function askAccountData(): Promise<boolean> {
  if (!isFirefox()) return true;
  return chrome.permissions.request(asked).catch(() => false);
}

/** The requests that start using an account: what a page asks consent before sending, in Firefox. */
export const STARTS_ACCOUNT: ReadonlySet<string> = new Set(['account/start', 'account/join', 'account/startOverCode', 'provider/start']);
