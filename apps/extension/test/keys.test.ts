import { afterEach, describe, expect, it, vi } from 'vitest';
import { fromBase64, toBase64 } from '@passhold/core';
import { askKey, enrollDevice, enrollKey } from '../src/ui/device.js';

/**
 * What the pages ask WebAuthn for a security key, with the browser stood in
 * for: the paths Chromium's virtual authenticator never takes — a key that
 * answers PRF only when used, one with no PRF at all, one already set up.
 * The real thing is in e2e/keys.spec.ts.
 */
const created: CredentialCreationOptions[] = [];
const asked: CredentialRequestOptions[] = [];

function browser({ create, get }: { create?: () => unknown; get?: (options: CredentialRequestOptions) => unknown }) {
  vi.stubGlobal('navigator', {
    credentials: {
      create: async (options: CredentialCreationOptions) => {
        created.push(options);
        return create?.();
      },
      get: async (options: CredentialRequestOptions) => {
        asked.push(options);
        return get?.(options);
      },
    },
  });
}

const answer = (fill: number) => new Uint8Array(32).fill(fill).buffer;
const credential = (id: number, outputs: object) => ({ rawId: new Uint8Array([id, id, id]).buffer, getClientExtensionResults: () => outputs });
const toBase64Url = (bytes: Uint8Array) => toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

afterEach(() => {
  vi.unstubAllGlobals();
  created.length = 0;
  asked.length = 0;
});

describe('a security key', () => {
  it('is asked for as a key on a keyring, and takes none of its places for passkeys', async () => {
    browser({ create: () => credential(1, { prf: { enabled: true, results: { first: answer(7) } } }) });
    const existing = [{ credentialId: toBase64(new Uint8Array([9, 9])), salt: toBase64(new Uint8Array(32)), addedAt: 0 }];
    const { credential: made, prf } = await enrollKey(existing);
    const options = created[0]!.publicKey as PublicKeyCredentialCreationOptions & { hints?: string[] };
    expect(options.authenticatorSelection).toEqual({ authenticatorAttachment: 'cross-platform', userVerification: 'required', residentKey: 'discouraged' });
    expect(options.hints).toEqual(['security-key']);
    // Nothing for the key to keep: no largeBlob, no account's salt beside its own.
    expect(Object.keys(options.extensions!)).toEqual(['prf']);
    expect(Object.keys((options.extensions as { prf: { eval: object } }).prf.eval)).toEqual(['first']);
    // The keys set up already, so the same one is not added twice.
    expect(options.excludeCredentials!.map((each) => [...new Uint8Array(each.id as ArrayBuffer)])).toEqual([[9, 9]]);
    expect(made.via).toBeUndefined();
    expect(fromBase64(made.salt)).toHaveLength(32);
    expect(prf).toBe(toBase64(new Uint8Array(answer(7))));
    // Answered at creation: asked once.
    expect(asked).toHaveLength(0);
  });

  it('that answers only when used is asked once more, for its own salt', async () => {
    browser({
      create: () => credential(1, { prf: { enabled: true } }),
      get: () => credential(1, { prf: { results: { first: answer(8) } } }),
    });
    const { credential: made, prf } = await enrollKey([]);
    expect(prf).toBe(toBase64(new Uint8Array(answer(8))));
    const options = asked[0]!.publicKey!;
    expect(options.userVerification).toBe('required');
    const byCredential = (options.extensions as { prf: { evalByCredential: Record<string, { first: Uint8Array }> } }).prf.evalByCredential;
    expect(Object.keys(byCredential)).toEqual([toBase64Url(new Uint8Array([1, 1, 1]))]);
    expect(toBase64(byCredential[toBase64Url(new Uint8Array([1, 1, 1]))]!.first)).toBe(made.salt);
  });

  it('with no PRF is refused, and nothing is asked again', async () => {
    browser({ create: () => credential(1, { prf: { enabled: false }, largeBlob: { supported: true } }) });
    await expect(enrollKey([])).rejects.toMatchObject({ key: 'error.keyUnsupported' });
    expect(asked).toHaveLength(0);
  });

  it('already set up is said so, not taken for a key that cannot', async () => {
    browser({
      create: () => {
        throw new DOMException('excluded', 'InvalidStateError');
      },
    });
    await expect(enrollKey([])).rejects.toMatchObject({ key: 'error.keyAlreadyAdded' });
  });

  it('opens with whichever key is plugged in, each asked for its own salt, and says which answered', async () => {
    const keys = [
      { credentialId: toBase64(new Uint8Array([1, 1, 1])), salt: toBase64(new Uint8Array(32).fill(1)) },
      { credentialId: toBase64(new Uint8Array([2, 2, 2])), salt: toBase64(new Uint8Array(32).fill(2)) },
    ];
    browser({ get: () => credential(2, { prf: { results: { first: answer(5) } } }) });
    expect(await askKey(keys)).toEqual({ key: keys[1]!.credentialId, prf: toBase64(new Uint8Array(answer(5))) });
    const options = asked[0]!.publicKey!;
    expect(options.allowCredentials!.map((each) => toBase64(new Uint8Array(each.id as ArrayBuffer)))).toEqual(keys.map((key) => key.credentialId));
    const byCredential = (options.extensions as { prf: { evalByCredential: Record<string, { first: Uint8Array }> } }).prf.evalByCredential;
    for (const key of keys) expect(toBase64(byCredential[toBase64Url(fromBase64(key.credentialId))]!.first)).toBe(key.salt);
  });

  it('that gives no answer opens nothing', async () => {
    browser({ get: () => credential(1, {}) });
    await expect(askKey([{ credentialId: toBase64(new Uint8Array([1, 1, 1])), salt: toBase64(new Uint8Array(32)) }])).rejects.toMatchObject({
      key: 'error.keyUnsupported',
    });
  });
});

describe('the computer’s own unlock', () => {
  it('is still this computer’s alone, beside the keys', async () => {
    browser({ create: () => credential(1, { prf: { enabled: true, results: { first: answer(7) } } }) });
    await enrollDevice();
    const options = created[0]!.publicKey as PublicKeyCredentialCreationOptions & { hints?: string[] };
    expect(options.authenticatorSelection).toEqual({ authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'required' });
    expect(options.hints).toBeUndefined();
  });
});
