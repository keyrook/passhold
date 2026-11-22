/**
 * Where the vault is kept on disk. In Firefox every content script may read,
 * write and remove local storage — and so may a page that takes over its
 * renderer — so these tests play that page: whatever it does there, the vault
 * opened is the one Passhold kept, and nothing it could guess against is
 * there to read.
 */
import { createVault, newKdfParams, type VaultFile } from '@passhold/core';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const PASSWORD = 'Correct-Horse-Battery-9!';
const UNLOCK = { credentialId: 'Y3JlZGVudGlhbA==', salt: 'c2FsdHNhbHRzYWx0c2FsdA==', wrappedKey: { iv: 'aXZpdml2aXZpdml2', ct: 'Y2lwaGVydGV4dA==' } };
const PREFS = { inlineButton: false, offerToSave: true, offerToSaveCards: false, autoSuggest: true, passkeys: false };

/** Local storage as Firefox gives it to every content script: one map anyone in the extension may read and write. */
function localStorage() {
  const items = new Map<string, unknown>();
  const area = {
    get: async (key: string) => (items.has(key) ? { [key]: structuredClone(items.get(key)) } : {}),
    set: async (values: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(values)) items.set(key, structuredClone(value));
    },
    remove: async (keys: string | string[]) => {
      for (const key of [keys].flat()) items.delete(key);
    },
  };
  return { items, area };
}

/** A start of the browser: the extension's code loaded afresh, over whatever the profile already holds. */
async function start(base: string, local = localStorage()) {
  vi.resetModules();
  vi.stubGlobal('chrome', { runtime: { getURL: (path: string) => `${base}${path}` }, storage: { local: local.area } });
  return { local, storage: await import('../src/lib/storage.js') };
}

const FIREFOX = 'moz-extension://5d1c9a4e-7b1f-4c2a-9d3e-8f6a2b1c0d4e/';
const CHROME = 'chrome-extension://abcdefghijklmnopabcdefghijklmnop/';

let vault: VaultFile;
let other: VaultFile;

beforeEach(async () => {
  // A profile of its own for each test.
  vi.stubGlobal('indexedDB', new IDBFactory());
  vault ??= (await createVault(PASSWORD, newKdfParams(100_000))).file;
  other ??= (await createVault('Made-Up-By-The-Page-1', newKdfParams(100_000))).file;
});

afterEach(() => vi.unstubAllGlobals());

describe('the vault on disk, in Firefox', () => {
  it('is kept with every copy of its key where no content script reads, and none of it in local storage', async () => {
    const { local, storage } = await start(FIREFOX);
    await storage.saveVaultFile(vault);
    await storage.saveDevice(UNLOCK);
    await storage.saveKeys([{ ...UNLOCK, addedAt: 1 }]);
    await storage.savePrefs(PREFS);

    // What a content script can read: nothing at all, let alone the sealed vault to guess against.
    expect([...local.items.keys()]).toEqual([]);
    expect(await storage.loadVaultFile()).toEqual(vault);
    expect(await storage.loadDevice()).toEqual(UNLOCK);
    expect(await storage.loadKeys()).toEqual([{ ...UNLOCK, addedAt: 1 }]);
    expect(await storage.loadPrefs()).toEqual(PREFS);
  });

  it('opens no vault a page puts in local storage, takes none of its switches, and loses nothing a page removes there', async () => {
    const { local, storage } = await start(FIREFOX);
    await storage.saveVaultFile(vault);

    // The page writes its own vault, a device that unlocks it, and switches that turn protections off.
    await local.area.set({ 'ph.vault': other, 'ph.device': UNLOCK, 'ph.keys': [{ ...UNLOCK, addedAt: 2 }], 'ph.prefs': { ...PREFS, offerToSave: false } });
    expect(await storage.loadVaultFile()).toEqual(vault);
    expect(await storage.loadDevice()).toBeNull();
    expect(await storage.loadKeys()).toEqual([]);
    expect((await storage.loadPrefs()).offerToSave).toBe(true);

    // And removes everything it can reach.
    await local.area.remove(['ph.vault', 'ph.device', 'ph.keys', 'ph.prefs']);
    expect(await storage.loadVaultFile()).toEqual(vault);
  });

  it('is there again after the browser restarts, and gone only when Passhold removes it', async () => {
    const first = await start(FIREFOX);
    await first.storage.saveVaultFile(vault);
    await first.storage.saveDevice(UNLOCK);

    const again = await start(FIREFOX);
    expect(await again.storage.loadVaultFile()).toEqual(vault);
    expect(await again.storage.loadDevice()).toEqual(UNLOCK);

    await again.storage.clearUnlocks();
    expect(await again.storage.loadDevice()).toBeNull();
    expect(await again.storage.loadVaultFile()).toEqual(vault);
    await again.storage.clearVaultFile();
    expect(await (await start(FIREFOX)).storage.loadVaultFile()).toBeNull();
  });

  it('refuses a file that is not a vault, as Chrome does', async () => {
    const { storage } = await start(FIREFOX);
    await storage.keptInIndexedDB(indexedDB).set('ph.vault', { format: 'something else' });
    await expect(storage.loadVaultFile()).rejects.toThrow();
  });
});

describe('the vault on disk, in Chrome', () => {
  it('stays in local storage, which the worker closes to content scripts, and makes no database', async () => {
    const { local, storage } = await start(CHROME);
    await storage.saveVaultFile(vault);
    await storage.savePrefs(PREFS);
    expect([...local.items.keys()].sort()).toEqual(['ph.prefs', 'ph.vault']);
    expect(await storage.loadVaultFile()).toEqual(vault);
    expect(await indexedDB.databases()).toEqual([]);
  });
});
