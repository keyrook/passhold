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

  it('hears the content script only from web pages', () => {
    expect(isContentSender({ id: ID, origin: 'https://example.com' }, ID)).toBe(true);
    expect(isContentSender({ id: ID, origin: 'http://example.com' }, ID)).toBe(true);
    expect(isContentSender({ id: ID, origin: 'file://' }, ID)).toBe(false);
    expect(isContentSender({ id: ID, origin: 'null' }, ID)).toBe(false);
    expect(isContentSender({ id: 'another-extension', origin: 'https://example.com' }, ID)).toBe(false);
  });
});
