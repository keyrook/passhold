import { isFirefox } from './platform.js';

/**
 * What the app calls itself. A name of its own, carried with "by Keyrook":
 * Keyrook is the brand, Passhold one of its products. A name, so never
 * translated.
 */
export const APP_NAME = 'Passhold';
export const BRAND_NAME = 'Keyrook';

/**
 * The browser Passhold runs in, by the name its people know it: Firefox by
 * where it puts an extension's pages, Edge by its user agent (`Edg/`), and
 * every other Chromium spoken of as Chrome. Where the advice differs,
 * `onEdge` picks it: Chrome keeps passkeys in Google Password Manager, which
 * Edge does not have.
 */
export const onEdge = (): boolean => typeof navigator !== 'undefined' && navigator.userAgent.includes('Edg/');
export const browserName = (): 'Chrome' | 'Edge' | 'Firefox' => (isFirefox() ? 'Firefox' : onEdge() ? 'Edge' : 'Chrome');

/**
 * The computer's system, as the account's list of devices names it: Chromium's
 * own hint where it gives one (`navigator.userAgentData.platform`), else read
 * from the user agent, as Firefox gives no hint. Null when neither says.
 */
export function systemOf(hint: string | undefined, userAgent: string): string | null {
  if (hint) return hint;
  if (/Android/.test(userAgent)) return 'Android';
  if (/CrOS/.test(userAgent)) return 'ChromeOS';
  if (/Macintosh|Mac OS X/.test(userAgent)) return 'macOS';
  if (/Windows/.test(userAgent)) return 'Windows';
  if (/Linux|X11/.test(userAgent)) return 'Linux';
  return null;
}

/** What the account's list of devices shows for this browser: "Passhold · Firefox on macOS". */
export function deviceLabel(browser: string, system: string | null): string {
  return system ? `Passhold · ${browser} on ${system}` : `Passhold · ${browser}`;
}

/**
 * Whether advice may name Google Password Manager: Chrome's alone. Edge and
 * Firefox get the words that name no place, as neither has it.
 */
export const keepsInGoogle = (): boolean => !onEdge() && !isFirefox();

/** A passkey that cannot give Passhold a key, and where to save one that can: Google Password Manager is Chrome's. */
export const deviceUnsupported = () => (keepsInGoogle() ? ('error.deviceUnsupported' as const) : ('error.deviceUnsupportedEdge' as const));
