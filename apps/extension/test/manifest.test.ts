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
    expect(manifest.externally_connectable).toBeUndefined();
  });

  it('runs its script on web pages only, never on files or other extensions', () => {
    expect(manifest.content_scripts).toHaveLength(1);
    expect(manifest.content_scripts[0].matches).toEqual(['http://*/*', 'https://*/*']);
    expect(manifest.content_scripts[0].js).toEqual(['content.js']);
  });

  it('lets web pages frame only the list and the prompt, and only through Passhold', () => {
    expect(manifest.web_accessible_resources).toEqual([
      { resources: ['menu.html', 'prompt.html'], matches: ['http://*/*', 'https://*/*'], use_dynamic_url: true },
    ]);
  });

  it('talks to no server', () => {
    const csp: string = manifest.content_security_policy.extension_pages;
    expect(csp).toContain("connect-src 'none'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toMatch(/https?:/);
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
