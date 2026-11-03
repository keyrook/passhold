import { describe, expect, it } from 'vitest';
import { buildManifest, STORE_LOCALES } from '../scripts/manifest.mjs';

const manifest = buildManifest({ version: '0.0.0' }) as Record<string, any>;

// What the install prompt says, and what Passhold can reach, is decided here.
// Any widening is a decision to be made on purpose, in this test.
describe('the manifest', () => {
  it('asks for no permission beyond the ones it needs', () => {
    expect(manifest.permissions.sort()).toEqual(['alarms', 'clipboardWrite', 'idle', 'offscreen', 'storage']);
    expect(manifest.host_permissions).toBeUndefined();
    expect(manifest.optional_permissions).toBeUndefined();
  });

  it('asks for the Keyrook account’s page only when a passkey is chosen, and for no other site', () => {
    expect(manifest.optional_host_permissions).toEqual(['https://account.keyrook.com/*']);
    // The kit's page is on localhost; the suite cannot answer Chrome, so a test build has it already.
    const test = buildManifest({ version: '0.0.0', api: 'http://127.0.0.1:8799', test: true }) as Record<string, any>;
    expect(test.optional_host_permissions).toEqual(['https://localhost/*']);
    expect(test.host_permissions).toEqual(['https://localhost/*']);
    const local = buildManifest({ version: '0.0.0', api: 'http://127.0.0.1:8799' }) as Record<string, any>;
    expect(local.host_permissions).toBeUndefined();
  });

  it('takes messages from the Keyrook server’s pages and no other web page', () => {
    expect(manifest.externally_connectable).toEqual({ matches: ['https://api.keyrook.com/*'] });
    const test = buildManifest({ version: '0.0.0', api: 'http://127.0.0.1:8799' }) as Record<string, any>;
    expect(test.externally_connectable).toEqual({ matches: ['http://127.0.0.1:8799/*'] });
  });

  it('runs its scripts on web pages only, never on files or other extensions', () => {
    expect(manifest.content_scripts.map((script: { js: string[] }) => script.js)).toEqual([['content.js'], ['bridge.js'], ['webauthn.js']]);
    for (const script of manifest.content_scripts) expect(script.matches).toEqual(['http://*/*', 'https://*/*']);
  });

  it('puts in the page’s own world only the passkey script, and only in the top frame', () => {
    const page = manifest.content_scripts.filter((script: { world?: string }) => script.world === 'MAIN');
    expect(page).toHaveLength(1);
    expect(page[0]).toMatchObject({ matches: ['http://*/*', 'https://*/*'], js: ['webauthn.js'], run_at: 'document_start', world: 'MAIN' });
    const bridge = manifest.content_scripts.find((script: { js: string[] }) => script.js[0] === 'bridge.js');
    expect(bridge.all_frames).toBeUndefined();
  });

  it('keeps every script out of the pages that check for bots, where a change fails the check', () => {
    for (const script of manifest.content_scripts) {
      expect(script.exclude_matches).toEqual(expect.arrayContaining(['https://challenges.cloudflare.com/*', '*://*/cdn-cgi/*', 'https://www.google.com/recaptcha/*', 'https://*.hcaptcha.com/*']));
    }
  });

  it('keeps its passkey scripts out of the Keyrook account’s page, whose passkeys open every app’s key', () => {
    const passkeys = manifest.content_scripts.filter((script: { js: string[] }) => ['bridge.js', 'webauthn.js'].includes(script.js[0]!));
    expect(passkeys).toHaveLength(2);
    for (const script of passkeys) expect(script.exclude_matches).toContain('https://account.keyrook.com/*');
    // A test build stays off the kit's page the same way.
    const test = buildManifest({ version: '0.0.0', api: 'http://127.0.0.1:8799', test: true }) as Record<string, any>;
    for (const script of test.content_scripts.filter((script: { js: string[] }) => ['bridge.js', 'webauthn.js'].includes(script.js[0]!))) {
      expect(script.exclude_matches).toContain('http://localhost:5174/*');
    }
  });

  it('lets web pages frame only the list, the prompt and the passkey frame, and only through Passhold', () => {
    expect(manifest.web_accessible_resources).toEqual([
      { resources: ['menu.html', 'prompt.html', 'passkey.html'], matches: ['http://*/*', 'https://*/*'], use_dynamic_url: true },
    ]);
  });

  it('talks to the Keyrook server and nothing else', () => {
    const csp: string = manifest.content_security_policy.extension_pages;
    expect(csp).toContain('connect-src https://api.keyrook.com;');
    expect(csp).toContain("script-src 'self'");
    expect(csp.match(/https?:\/\/[^\s;]+/g)).toEqual(['https://api.keyrook.com']);
  });

  it('can be built against a server on this machine for tests, and no other', () => {
    const test = buildManifest({ version: '0.0.0', api: 'http://127.0.0.1:8799' }) as Record<string, any>;
    expect(test.content_security_policy.extension_pages).toContain('connect-src http://127.0.0.1:8799;');
    for (const api of ['https://evil.test', 'http://api.keyrook.com', 'http://localhost.evil.test:8799', 'https://api.keyrook.com.evil.test']) {
      expect(() => buildManifest({ version: '0.0.0', api }), api).toThrow();
    }
  });

  it('says when a copy loaded unpacked was built, and a store upload nothing of the kind', () => {
    expect(manifest.version_name).toBeUndefined();
    const unpacked = buildManifest({ version: '0.1.0', built: '2026-10-13 11:52' }) as Record<string, any>;
    expect(unpacked).toMatchObject({ version: '0.1.0', version_name: '0.1.0 (2026-10-13 11:52)' });
  });

  it('names itself in every language it lists', () => {
    for (const messages of Object.values(STORE_LOCALES)) {
      expect(Object.keys(messages).sort()).toEqual(Object.keys(STORE_LOCALES.en!).sort());
      expect(messages.appName).toContain('Passhold');
      expect(messages.appName.length).toBeLessThanOrEqual(45);
      expect(messages.appDescription.length).toBeLessThanOrEqual(132);
    }
  });
});
