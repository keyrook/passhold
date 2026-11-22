import { describe, expect, it } from 'vitest';
import { isContentSender, isTrustedSender } from '../src/lib/messaging.js';

const ID = 'abcdefghijklmnopabcdefghijklmnop';

describe('who may drive the vault', () => {
  it('trusts Passhold’s own pages and nothing else', () => {
    expect(isTrustedSender({ id: ID, origin: `chrome-extension://${ID}` }, ID)).toBe(true);
    // The content script carries our id too — from inside a web page.
    expect(isTrustedSender({ id: ID, origin: 'https://evil.example' }, ID)).toBe(false);
    expect(isTrustedSender({ id: 'another-extension', origin: `chrome-extension://${ID}` }, ID)).toBe(false);
    expect(isTrustedSender({ id: ID, origin: 'chrome-extension://another-extension' }, ID)).toBe(false);
    expect(isTrustedSender({ id: ID }, ID)).toBe(false);
  });

  it('knows its pages by the origin the browser gives them, which in Firefox is not made from its id', () => {
    const ADDON = 'passhold@keyrook.com';
    const PAGES = 'moz-extension://2c127fa4-62c7-7e4f-90e5-472b45eecfdc';
    expect(isTrustedSender({ id: ADDON, origin: PAGES }, ADDON, PAGES)).toBe(true);
    // Another add-on's pages, or a web page carrying our id, are not ours.
    expect(isTrustedSender({ id: ADDON, origin: 'moz-extension://11111111-2222-3333-4444-555555555555' }, ADDON, PAGES)).toBe(false);
    expect(isTrustedSender({ id: ADDON, origin: 'https://evil.example' }, ADDON, PAGES)).toBe(false);
    expect(isTrustedSender({ id: 'another@example.com', origin: PAGES }, ADDON, PAGES)).toBe(false);
    // Nor is the origin Chrome would have given: it is asked of the browser, never guessed.
    expect(isTrustedSender({ id: ADDON, origin: `chrome-extension://${ADDON}` }, ADDON, PAGES)).toBe(false);
  });

  it('hears the content script only from web pages', () => {
    expect(isContentSender({ id: ID, origin: 'https://example.com' }, ID)).toBe(true);
    expect(isContentSender({ id: ID, origin: 'http://example.com' }, ID)).toBe(true);
    expect(isContentSender({ id: ID, origin: 'file://' }, ID)).toBe(false);
    expect(isContentSender({ id: ID, origin: 'null' }, ID)).toBe(false);
    expect(isContentSender({ id: 'another-extension', origin: 'https://example.com' }, ID)).toBe(false);
  });
});
