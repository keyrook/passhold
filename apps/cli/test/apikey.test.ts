/**
 * API keys from a terminal: made, read by the names a reference gives their
 * fields, changed with the key kept in their history, listed by kind, and
 * written out in their own CSV — against the account's own server from the
 * kit, as the other command line tests are.
 */
import { existsSync } from 'node:fs';
import { createAccount, startRegistration } from '@keyrook/account';
import { afterAll, describe, expect, it } from 'vitest';
import { PRODUCT } from '@passhold/core';
import { contents, DEVICE, forgetHomes, KIT, PASSWORD, server, terminal } from './kit.js';

afterAll(forgetHomes);

/** Made up for this test: it opens nothing anywhere. Shorter than a real
 * Stripe key, so that no secret scanner takes it for one: GitHub refuses a push
 * holding one. */
const KEY = 'sk_live_CliTestOnlyNotARealKey';
const NEXT = 'sk_live_CliTestOnlyTheNextOne';

describe.skipIf(!existsSync(KIT))('an API key from the command line', () => {
  it('is made from its key alone, found by key, secret and key_id, changed with the old key kept, and written out in its own CSV', async () => {
    const { running, from, browser, send } = await server();
    const email = 'keys@example.test';
    await startRegistration('', email, browser);
    const made = await createAccount({ baseUrl: '', fetcher: browser }, { email, code: running.codeFor(email)!, password: PASSWORD, product: PRODUCT, ...DEVICE });
    await send(made.session, made.productKey.key, await contents());
    const { env, passhold, unlock } = terminal('apikey', from);
    expect((await passhold(['login', '--email', email], [PASSWORD])).code).toBe(0);
    expect((await unlock([], [PASSWORD])).code).toBe(0);

    // Typed unseen, the key never stands in the shell's history; its prefix names the service, which brings its host and variable.
    const create = await passhold(['create', 'apikey', 'title=Payments', 'key=-', 'key_id=acct_TESTONLY', 'environment=production', 'expires=2027-06-30'], [KEY]);
    expect(create.code).toBe(0);
    expect((await passhold(['get', 'passhold://personal/Payments/key'])).out).toBe(`${KEY}\n`);
    expect((await passhold(['get', 'passhold://personal/Payments/secret'])).out).toBe(`${KEY}\n`);
    expect((await passhold(['get', 'passhold://personal/Payments/key_id'])).out).toBe('acct_TESTONLY\n');
    expect((await passhold(['get', 'Payments'])).out).toBe(`${KEY}\n`);
    expect((await passhold(['get', 'Payments', '--field', 'host'])).out).toBe('api.stripe.com\n');
    expect((await passhold(['get', 'Payments', '--field', 'env'])).out).toBe('STRIPE_API_KEY\n');
    expect((await passhold(['get', 'Payments', '--field', 'expires'])).out).toBe('2027-06-30\n');

    // Listed by its kind, and found by its service — never by the key.
    const listed = await passhold(['list', '--kind', 'apikey']);
    expect(listed.out.split('\n').filter(Boolean).map((line) => line.split('\t').slice(1, 3))).toEqual([['apikey', 'Payments']]);
    expect((await passhold(['list', '--search', 'stripe'])).out).toContain('Payments');
    expect((await passhold(['list', '--search', KEY.slice(8, 30)])).out).toBe('');
    expect((await passhold(['list', '--kind', 'spaceship'])).code).toBe(1);

    // A run reads it where the reference stands, for the command alone.
    env.STRIPE_API_KEY = 'passhold://personal/Payments/key';
    const ran = await passhold(['run', '--', process.execPath, '-e', 'process.stdout.write(process.env.STRIPE_API_KEY)']);
    delete env.STRIPE_API_KEY;
    expect(ran.out).toBe(KEY);

    // A new key: the old one goes into the item's history, and a bad host or date is refused without a write.
    expect((await passhold(['edit', 'Payments', 'key=-'], [NEXT])).code).toBe(0);
    expect((await passhold(['get', 'Payments'])).out).toBe(`${NEXT}\n`);
    const json = JSON.parse((await passhold(['get', 'Payments', '--json'])).out) as Record<string, unknown>;
    expect(json).toMatchObject({ kind: 'apikey', service: 'stripe', key: NEXT });
    expect(json).not.toHaveProperty('history');
    expect((await passhold(['edit', 'Payments', 'host=*.com'])).err).toMatch(/is a host/);
    expect((await passhold(['edit', 'Payments', 'expires=30/06/2027'])).err).toMatch(/YYYY-MM-DD/);
    expect((await passhold(['edit', 'Payments', 'service=not-a-service'])).err).toMatch(/No service is called/);

    // Out in its own CSV, after its owner again; the logins' CSV has no place for it.
    const csv = await passhold(['export', '--kind', 'apikey'], [PASSWORD]);
    expect(csv.out.split(/\r?\n/)[0]).toBe('title,service,key,key_id,hosts,send_as,env,environment,scopes,issued,expires,notes,folder');
    expect(csv.out).toContain(NEXT);
    expect((await passhold(['export'], [PASSWORD])).out).not.toContain(NEXT);

    // Whatever was said on the error stream along the way, a key was never part of it.
    const everything = [create, listed, csv].map((result) => result.err).join('\n');
    expect(everything).not.toContain(KEY);
    expect(everything).not.toContain(NEXT);
    await running.close();
  });
});
