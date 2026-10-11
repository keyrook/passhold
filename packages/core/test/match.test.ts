import { describe, expect, it } from 'vitest';
import { addLogin, emptyData, judgeCapture, loginsForSite, matchUrls, siteOf, type Site } from '@passhold/core';

const page = (url: string): Site => siteOf(url)!;
const offered = (saved: string, at: string) => matchUrls([saved], page(at));

describe('which logins a page is offered', () => {
  it('offers a login across the hosts of one site', () => {
    expect(offered('https://example.com/login', 'https://example.com/other')).toBe('exact');
    expect(offered('https://www.example.com', 'https://accounts.example.com')).toBe('site');
    expect(offered('https://example.co.uk', 'https://login.example.co.uk')).toBe('site');
  });

  it('never offers one site’s login to another', () => {
    expect(offered('https://example.com', 'https://example.org')).toBeNull();
    expect(offered('https://example.com', 'https://example.com.evil.net')).toBeNull();
    expect(offered('https://example.com', 'https://notexample.com')).toBeNull();
    // Two companies under one public suffix are two sites.
    expect(offered('https://bank.co.uk', 'https://evil.co.uk')).toBeNull();
  });

  // Without the private section of the Public Suffix List, every page on a
  // shared host would be one site, and each would be offered the others' logins.
  it('keeps neighbours on a shared host apart', () => {
    expect(offered('https://alice.github.io', 'https://mallory.github.io')).toBeNull();
    expect(offered('https://alice.blogspot.com', 'https://mallory.blogspot.com')).toBeNull();
    expect(offered('https://app.herokuapp.com', 'https://evil.herokuapp.com')).toBeNull();
    expect(offered('https://alice.github.io/a', 'https://alice.github.io/b')).toBe('exact');
  });

  // Anything on the network can write a plain-http page.
  it('never sends a password down to plain http', () => {
    expect(offered('https://example.com', 'http://example.com')).toBeNull();
    expect(offered('https://www.example.com', 'http://login.example.com')).toBeNull();
    expect(offered('http://www.example.com', 'http://login.example.com')).toBeNull();
    // Saved on exactly that http origin, it is that origin's own.
    expect(offered('http://intranet.example.com', 'http://intranet.example.com/login')).toBe('exact');
    // Up from http to the https site is the safe direction.
    expect(offered('http://example.com', 'https://example.com')).toBe('exact');
  });

  it('matches a host with no site around it only exactly', () => {
    expect(offered('http://localhost:3000', 'http://localhost:3000/login')).toBe('exact');
    expect(offered('http://localhost:3000', 'http://localhost:4000')).toBeNull();
    expect(offered('https://192.168.1.1', 'https://192.168.1.2')).toBeNull();
    expect(offered('https://router', 'https://router.evil.com')).toBeNull();
  });

  it('offers nothing to pages that are not on the web', () => {
    for (const url of ['file:///etc/passwd', 'data:text/html,hi', 'javascript:alert(1)', 'chrome-extension://abc/x.html', 'about:blank']) {
      expect(siteOf(url)).toBeNull();
    }
  });

  it('takes a typed address without a scheme as https', () => {
    expect(siteOf('example.com/login')).toMatchObject({ scheme: 'https', host: 'example.com', domain: 'example.com' });
  });

  it('skips the trash and puts the exact host first', () => {
    let data = emptyData();
    data = addLogin(data, { title: 'site', username: 'a', password: '1', urls: ['https://example.com'], notes: '' }).data;
    data = addLogin(data, { title: 'exact', username: 'b', password: '2', urls: ['https://login.example.com'], notes: '' }).data;
    const trashed = addLogin(data, { title: 'gone', username: 'c', password: '3', urls: ['https://login.example.com'], notes: '' });
    data = { ...trashed.data, items: trashed.data.items.map((i) => (i.id === trashed.item.id ? { ...i, deletedAt: 1 } : i)) };
    expect(loginsForSite(data, page('https://login.example.com/x')).map((m) => m.item.title)).toEqual(['exact', 'site']);
  });
});

describe('what a sent sign-in means', () => {
  const saved = addLogin(emptyData(), {
    title: 'Example',
    username: 'alice',
    password: 'old-password',
    urls: ['https://example.com'],
    notes: '',
  });

  it('knows a login it already has', () => {
    expect(judgeCapture(saved.data, page('https://example.com'), 'alice', 'old-password').kind).toBe('known');
  });

  it('offers to update a changed password and to save a new account', () => {
    expect(judgeCapture(saved.data, page('https://example.com'), 'alice', 'new-password')).toMatchObject({ kind: 'update' });
    expect(judgeCapture(saved.data, page('https://example.com'), 'bob', 'whatever').kind).toBe('new');
    expect(judgeCapture(saved.data, page('https://other.com'), 'alice', 'old-password').kind).toBe('new');
  });

  it('stays quiet on a site its owner said never to save', () => {
    const data = { ...saved.data, neverSave: ['example.com'] };
    expect(judgeCapture(data, page('https://www.example.com'), 'bob', 'x').kind).toBe('neverSave');
  });
});
