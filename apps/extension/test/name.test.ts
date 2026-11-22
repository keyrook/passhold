/**
 * What the account's list of devices calls this browser. Firefox gives no
 * `navigator.userAgentData`, and was once named "Passhold · Chrome" for it.
 */
import { describe, expect, it } from 'vitest';
import { deviceLabel, systemOf } from '../src/lib/name.js';

const FIREFOX_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:160.0) Gecko/20100101 Firefox/160.0';
const FIREFOX_WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0';
const FIREFOX_LINUX = 'Mozilla/5.0 (X11; Linux x86_64; rv:160.0) Gecko/20100101 Firefox/160.0';
const CHROME_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';
const CHROMEBOOK = 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';

describe('the name a browser gives itself on the account', () => {
  it('reads Firefox’s system from its user agent, which is all it gives', () => {
    expect(deviceLabel('Firefox', systemOf(undefined, FIREFOX_MAC))).toBe('Passhold · Firefox on macOS');
    expect(deviceLabel('Firefox', systemOf(undefined, FIREFOX_WINDOWS))).toBe('Passhold · Firefox on Windows');
    expect(deviceLabel('Firefox', systemOf(undefined, FIREFOX_LINUX))).toBe('Passhold · Firefox on Linux');
  });

  it('takes Chromium’s own hint first, and tells a Chromebook from Linux', () => {
    expect(deviceLabel('Chrome', systemOf('macOS', CHROME_MAC))).toBe('Passhold · Chrome on macOS');
    expect(deviceLabel('Edge', systemOf('Windows', ''))).toBe('Passhold · Edge on Windows');
    expect(systemOf(undefined, CHROMEBOOK)).toBe('ChromeOS');
  });

  it('names the browser alone when nothing says the system, never another browser', () => {
    expect(systemOf(undefined, 'Mozilla/5.0')).toBeNull();
    expect(deviceLabel('Firefox', null)).toBe('Passhold · Firefox');
  });
});
