import { describe, expect, it } from 'vitest';
import { fillUrlAllowed } from '../src/background/nativeFill.js';

describe('fill_login native bridge URL guard', () => {
  const BLOCKED = ['https://account.keyrook.com', 'https://vault.keyrook.com', 'https://api.keyrook.com'];

  it('allows matching HTTPS sites (including subdomains of the same registrable domain)', () => {
    expect(fillUrlAllowed('https://app.example.com/login', 'https://example.com/signin', BLOCKED)).toEqual({
      ok: true,
      origin: 'https://app.example.com',
    });
    expect(fillUrlAllowed('https://github.com/login', 'https://github.com/session', BLOCKED)).toEqual({
      ok: true,
      origin: 'https://github.com',
    });
  });

  it('allows exact loopback HTTP host+port matches for local development', () => {
    expect(fillUrlAllowed('http://127.0.0.1:3000/login', 'http://127.0.0.1:3000/login', BLOCKED)).toEqual({
      ok: true,
      origin: 'http://127.0.0.1:3000',
    });
    expect(fillUrlAllowed('http://127.0.0.1:3000/login', 'http://127.0.0.1:4000/login', BLOCKED).ok).toBe(false);
    expect(fillUrlAllowed('http://localhost:3000/login', 'http://127.0.0.1:3000/login', BLOCKED).ok).toBe(false);
  });

  it('refuses mismatched domains, non-HTTPS web pages, browser-internal pages, private-suffix siblings, and protected Keyrook pages', () => {
    expect(fillUrlAllowed('https://evil.test/login', 'https://example.com/login', BLOCKED).ok).toBe(false);
    expect(fillUrlAllowed('https://evil.test/login', 'https://other.test/login', BLOCKED).ok).toBe(false);
    expect(fillUrlAllowed('https://mallory.github.io/login', 'https://alice.github.io/login', BLOCKED).ok).toBe(false);
    expect(fillUrlAllowed('http://example.com/login', 'http://example.com/login', BLOCKED).ok).toBe(false);
    expect(fillUrlAllowed('chrome://settings', 'https://example.com/login', BLOCKED).ok).toBe(false);
    expect(fillUrlAllowed('https://account.keyrook.com/login', 'https://account.keyrook.com/login', BLOCKED).ok).toBe(false);
    expect(fillUrlAllowed('https://vault.keyrook.com/', 'https://vault.keyrook.com/', BLOCKED).ok).toBe(false);
    expect(fillUrlAllowed('not-a-url', 'https://example.com/login', BLOCKED).ok).toBe(false);
  });
});
