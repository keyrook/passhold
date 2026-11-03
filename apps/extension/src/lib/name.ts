/**
 * What the app calls itself. A name of its own, carried with "by Keyrook":
 * Keyrook is the brand, Passhold one of its products. A name, so never
 * translated.
 */
export const APP_NAME = 'Passhold';
export const BRAND_NAME = 'Keyrook';

/**
 * The browser Passhold runs in, by the name its people know it: Edge says so
 * in its user agent (`Edg/`), and every other Chromium is spoken of as Chrome.
 * Where the advice differs, `onEdge` picks it: Chrome keeps passkeys in
 * Google Password Manager, which Edge does not have.
 */
export const onEdge = (): boolean => typeof navigator !== 'undefined' && navigator.userAgent.includes('Edg/');
export const browserName = (): 'Chrome' | 'Edge' => (onEdge() ? 'Edge' : 'Chrome');

/** A passkey that cannot give Passhold a key, and where to save one that can: Google Password Manager is Chrome's. */
export const deviceUnsupported = () => (onEdge() ? ('error.deviceUnsupportedEdge' as const) : ('error.deviceUnsupported' as const));
