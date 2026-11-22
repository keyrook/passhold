import { systemOf } from '../../../extension/src/lib/name.js';

/** The browser, from what it says of itself: iOS's say which app they are, as every iPhone browser is Safari's engine. */
export function browserOf(userAgent: string): string {
  if (/EdgiOS|Edg\//.test(userAgent)) return 'Edge';
  if (/FxiOS|Firefox\//.test(userAgent)) return 'Firefox';
  if (/CriOS|Chrome\//.test(userAgent)) return 'Chrome';
  if (/Safari\//.test(userAgent)) return 'Safari';
  return 'a browser';
}

/** The account's devices list names each sitting: "Passhold on the web · Safari on iOS". */
export function webDeviceName(userAgent: string, hint?: string): string {
  const system = /iPhone|iPad|iPod/.test(userAgent) ? 'iOS' : systemOf(hint, userAgent);
  const browser = browserOf(userAgent);
  return system ? `Passhold on the web · ${browser} on ${system}` : `Passhold on the web · ${browser}`;
}
