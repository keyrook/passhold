/**
 * A family's shared vaults from a terminal, against the account's own server
 * from the kit: Minh makes the family on the account page and shares what
 * his Passhold seals, Alice reads and writes it from the command line, and
 * what she writes is read back by Minh's Passhold as the extension reads it.
 */
import {
  consoleAcceptInvite,
  consoleConfirmMember,
  consoleCreateFamily,
  consoleFamilyCompareCode,
  consoleRotateFamily,
  consoleSetCollectionAccess,
  consoleSignIn,
  createAccount,
  namedClient,
  openFamily,
  pullFamily,
  pushFamily,
  sealFamilyRecord,
  startRegistration,
  type LoginResponse,
  type ProductFamily,
} from '@keyrook/account';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve as path } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  addLogin,
  addWalletItem,
  applyPulled,
  emptyData,
  mergeFamilyPulled,
  planFamilyPush,
  PRODUCT,
  recordsKey,
  type FamilyValue,
  type FamilyVault,
  type LoginItem,
  type RemoteRecord,
} from '@passhold/core';
import { Account } from '../src/account.js';
import { vaultNamed } from '../src/reference.js';
import { Store } from '../src/store.js';
import { contents, forgetHomes, KIT, ORIGIN, PAGE, PASSWORD, server, session, terminal } from './kit.js';

const SOCKETS = path(import.meta.dirname, '../../../.tmp/s');

afterAll(() => {
  forgetHomes();
  rmSync(SOCKETS, { recursive: true, force: true });
});

const options = { orgs: true, familyPlan: 'paid', products: { passhold: [ORIGIN], console: [PAGE] }, consoleUrl: PAGE };

/** A family on the kit's server: Minh organises it, Alice and Lan are in it, Alice at a terminal signed in and unlocked. */
async function family() {
  const kit = await server(options);
  const page = namedClient(kit.running.fetcherFrom(PAGE), 'console/0.1.0');
  const pageOf = async (email: string) => session(page, (await consoleSignIn({ baseUrl: '', fetcher: page }, { email, password: PASSWORD, deviceId: 'page', deviceName: 'Page' })) as LoginResponse);
  const proof = (email: string) => ({ email, password: PASSWORD });
  /** Someone whose account a Passhold browser made: that browser's session and key. */
  const person = async (email: string) => {
    await startRegistration('', email, kit.browser);
    const made = await createAccount({ baseUrl: '', fetcher: kit.browser }, { email, code: kit.running.codeFor(email)!, password: PASSWORD, product: PRODUCT, deviceId: `browser-${email}`, deviceName: 'Passhold · test' });
    return { email, id: made.session.account.id, made, passhold: kit.connect(made.session) };
  };
  const minh = await person('minh@example.test');
  const alice = await person('alice@example.test');
  const lan = await person('lan@example.test');
  await kit.send(alice.made.session, alice.made.productKey.key, await contents());

  const orgId = (await consoleCreateFamily(await pageOf(minh.email), { baseUrl: '', fetcher: page }, { name: 'Home', collectionName: 'Shared', proof: proof(minh.email) })).org.id;
  const join = async (who: typeof alice, compared = true) => {
    await (await pageOf(minh.email)).inviteToOrg(orgId, { email: who.email, role: 'member' });
    await consoleAcceptInvite(await pageOf(who.email), { baseUrl: '', fetcher: page }, { orgId, proof: proof(who.email) });
    const confirmed = await consoleConfirmMember(await pageOf(minh.email), { baseUrl: '', fetcher: page }, { orgId, accountId: who.id, proof: proof(minh.email), compare: async () => (compared ? 'match' : 'without-comparing') });
    expect(confirmed).toBeTruthy();
  };
  await join(alice);
  await join(lan);

  /** The family as a Passhold browser of `who` opens it, and its first shared vault with every record in it opened. */
  const sharedOf = async (who: typeof minh): Promise<{ family: ProductFamily; vault: FamilyVault }> => {
    const opened = await openFamily(who.passhold, { productKey: who.made.productKey, orgId });
    if (opened.status !== 'open') throw new Error(`The family is ${opened.status}.`);
    const collection = opened.family.collections[0]!;
    const pulled = await pullFamily<FamilyValue>(who.passhold, opened.family, { since: 0 });
    const base: FamilyVault = { id: collection.id, name: collection.name, generation: collection.generation, keyDue: false, items: [], wallet: [], known: {} };
    return { family: opened.family, vault: (await mergeFamilyPulled(base, pulled.records, pulled.unreadable)).vault };
  };
  /** What Minh's Passhold puts in the shared vault, sealed as it seals it. */
  const share = async (change: (vault: FamilyVault) => FamilyVault) => {
    const { family, vault } = await sharedOf(minh);
    const plan = await planFamilyPush(change(vault), vault.known);
    const sealed = [];
    for (const record of plan.records) sealed.push(await sealFamilyRecord(family, { collectionId: vault.id, id: record.id, kind: record.kind, rev: record.rev, value: record.value, updatedAt: record.updatedAt }));
    expect((await pushFamily(minh.passhold, family, sealed)).accepted).toHaveLength(sealed.length);
  };
  await share((vault) => addLogin(vault, { title: 'Netflix', username: 'home@example.test', password: 'N3tflix-Home-1!', urls: ['https://www.netflix.com'], notes: '' }).data);
  await share((vault) => addWalletItem(vault, { kind: 'note', title: 'Wi-Fi', text: 'home-5G pass-9Z!' }).data);

  const shell = terminal(`family-${Math.random().toString(36).slice(2)}`, kit.from);
  expect((await shell.passhold(['login', '--email', alice.email], [PASSWORD])).code).toBe(0);
  expect((await shell.unlock([], [PASSWORD])).code).toBe(0);
  return { ...kit, ...shell, page, pageOf, proof, orgId, minh, alice, lan, join, sharedOf, share };
}

const login = (vault: FamilyVault, title: string) => vault.items.find((item) => item.title === title && item.deletedAt === null) as LoginItem | undefined;

describe.skipIf(!existsSync(KIT))('a family’s shared vaults, from a terminal', { timeout: 120_000 }, () => {
  it('are listed, searched and read beside the vault’s own, by name or by reference', async () => {
    const { running, passhold, env, sharedOf, minh } = await family();
    const vaults = await passhold(['vaults']);
    expect(vaults.out.split('\n').filter(Boolean).map((line) => line.split('\t'))).toEqual([
      ['personal', 'personal', 'edit', '4 items'],
      ['Shared', 'Home / Shared', 'edit', '2 items'],
    ]);

    const listed = (await passhold(['list'])).out.split('\n').filter(Boolean).map((line) => line.split('\t').slice(1));
    expect(listed).toContainEqual(['login', 'Netflix', 'home@example.test', 'Shared']);
    // Two notes called Wi-Fi, one in each vault: both listed, neither taken for the other.
    expect(listed.filter(([, name]) => name === 'Wi-Fi').map(([, , , vault]) => vault).sort()).toEqual(['Shared', 'personal']);
    expect(JSON.parse((await passhold(['list', '--vault', 'Shared', '--json'])).out)).toEqual([
      expect.objectContaining({ kind: 'login', name: 'Netflix', vault: 'Shared', reference: expect.stringMatching(/^passhold:\/\/Shared\/[^/]+\/password$/) }),
      expect.objectContaining({ kind: 'note', name: 'Wi-Fi', vault: 'Shared' }),
    ]);
    expect((await passhold(['list', '--search', 'netflix'])).out.split('\n').filter(Boolean)).toHaveLength(1);

    expect((await passhold(['get', 'passhold://Shared/Netflix/password'])).out).toBe('N3tflix-Home-1!\n');
    expect((await passhold(['get', 'passhold://shared/Netflix/username'])).out).toBe('home@example.test\n');
    expect((await passhold(['get', 'Netflix'])).out).toBe('N3tflix-Home-1!\n');
    expect((await passhold(['get', 'passhold://Shared/Wi-Fi/text'])).out).toBe('home-5G pass-9Z!\n');
    expect((await passhold(['get', 'passhold://personal/Wi-Fi/text'])).out).toBe('pass-7Q!-river\n');
    // A name two vaults share is never the first of them.
    const twice = await passhold(['get', 'Wi-Fi']);
    expect([twice.code, twice.out]).toEqual([1, '']);
    expect(twice.err).toMatch(/2 items are named "Wi-Fi"\. Name one: passhold:\/\/personal\/.+, passhold:\/\/Shared\//);
    expect((await passhold(['get', 'passhold://Elsewhere/Netflix/password'])).err).toMatch(/No vault named "Elsewhere"/);

    env.TV = 'passhold://Shared/Netflix/password';
    expect((await passhold(['run', '--', process.execPath, '-e', 'process.stdout.write(process.env.TV)'])).out).toBe('N3tflix-Home-1!');
    delete env.TV;
    expect((await passhold(['inject'], [], 'tv: {{ passhold://Shared/Netflix/password }}\n')).out).toBe('tv: N3tflix-Home-1!\n');

    // Reading writes nothing: Minh's Passhold finds the shared vault as it left it.
    expect((await sharedOf(minh)).vault.items.map((item) => item.title)).toEqual(['Netflix']);
    await running.close();
  });

  it('are written to as the extension writes, and another member’s Passhold reads it all back', async () => {
    const { running, passhold, sharedOf, minh, alice, connect } = await family();

    // A new login, its password made here and never typed.
    const made = await passhold(['create', 'login', '--vault', 'Shared', 'title=Disney+', 'username=home@example.test', 'url=https://www.disneyplus.com', 'PIN=-', '--generate', '--length', '24'], ['2468']);
    expect(made.code).toBe(0);
    expect(made.out).toMatch(/^passhold:\/\/Shared\/[^/\s]+\n$/);
    const created = login((await sharedOf(minh)).vault, 'Disney+')!;
    expect(created).toMatchObject({ username: 'home@example.test', urls: ['https://www.disneyplus.com/'] });
    expect(created.password).toMatch(/^.{24}$/);
    // Typed unseen, kept out of sight.
    expect(created.fields).toEqual([{ name: 'PIN', value: '2468', hidden: true }]);
    expect((await passhold(['get', `${made.out.trim()}/password`])).out).toBe(`${created.password}\n`);

    // An edit: the password asked for unseen, the one it replaces kept in the login's history.
    expect((await passhold(['edit', 'passhold://Shared/Netflix', 'password=-', 'notes=@/dev/null'], ['N3tflix-Home-2!'])).code).toBe(0);
    const edited = login((await sharedOf(minh)).vault, 'Netflix')!;
    expect(edited.password).toBe('N3tflix-Home-2!');
    expect(edited.history.map((entry) => entry.password)).toEqual(['N3tflix-Home-1!']);

    // Deleted: into the shared trash, for anyone in the family to restore; never gone.
    const deleted = await passhold(['delete', 'passhold://Shared/Netflix']);
    expect(deleted.err).toMatch(/in the trash of Home \/ Shared\. To bring it back: passhold restore passhold:\/\/Shared\//);
    const trashed = (await sharedOf(minh)).vault.items.find((item) => item.title === 'Netflix')!;
    expect(trashed.deletedAt).not.toBeNull();
    expect((await passhold(['get', 'passhold://Shared/Netflix/password'])).code).toBe(1);
    expect((await passhold(['restore', 'passhold://Shared/Netflix'])).code).toBe(0);
    expect(login((await sharedOf(minh)).vault, 'Netflix')?.password).toBe('N3tflix-Home-2!');

    // A card, an address and an SSH key, each of its own kind.
    expect((await passhold(['create', 'card', '--vault', 'Shared', 'title=Groceries', 'holder=M Nguyen', 'number=-', 'expiry=09/29', 'code=-'], ['4111 1111 1111 1111', '737'])).code).toBe(0);
    expect((await passhold(['create', 'ssh', '--vault', 'Shared', 'title=NAS', '--generate'])).code).toBe(0);
    const wallet = (await sharedOf(minh)).vault.wallet;
    expect(wallet.find((item) => item.title === 'Groceries')).toMatchObject({ kind: 'card', number: '4111111111111111', expMonth: 9, expYear: 2029, code: '737' });
    const nas = wallet.find((item) => item.title === 'NAS');
    expect(nas).toMatchObject({ kind: 'ssh', publicKey: expect.stringMatching(/^ssh-ed25519 \S+ NAS$/) });
    expect((await passhold(['edit', 'passhold://Shared/NAS', 'public_key=ssh-ed25519 AAAA'])).err).toMatch(/read from its private key/);

    // The SSH agent offers it with the vault's own keys.
    mkdirSync(SOCKETS, { recursive: true });
    const socket = path(SOCKETS, `f${Math.random().toString(36).slice(2, 8)}.sock`);
    const stop = new AbortController();
    const agent = passhold(['ssh-agent', '--socket', socket, '--no-confirm'], [], '', { signal: stop.signal });
    for (let tries = 0; tries < 200 && !existsSync(socket); tries++) await new Promise((done) => setTimeout(done, 25));
    const listed = await new Promise<string>((done) => {
      const child = spawn('ssh-add', ['-L'], { env: { ...process.env, SSH_AUTH_SOCK: socket } });
      let out = '';
      child.stdout.on('data', (chunk: Buffer) => (out += chunk.toString('utf8')));
      child.once('close', () => done(out));
      child.once('error', () => done(''));
    });
    stop.abort();
    expect((await agent).code).toBe(0);
    if (listed) expect(listed).toContain((nas as { publicKey: string }).publicKey.split(' ').slice(0, 2).join(' '));

    // The vault's own, the same way: Alice's Passhold reads it at its next sync.
    expect((await passhold(['create', 'note', 'title=Locker', 'text=@/dev/null'])).code).toBe(0);
    expect((await passhold(['edit', 'passhold://personal/Bank', 'password=bank-Secret-3!'])).code).toBe(0);
    const pulled = await connect(alice.made.session).pull(0);
    const own = (await applyPulled(emptyData(), {}, pulled.records as RemoteRecord[], await recordsKey(alice.made.productKey.key))).data;
    expect(own.wallet.map((item) => item.title)).toContain('Locker');
    const bank = own.items.find((item) => item.title === 'Bank')!;
    expect([bank.password, bank.history.map((entry) => entry.password)]).toEqual(['bank-Secret-3!', ['bank-Secret-2!']]);
    // Kept as a version too, on a plan that keeps them.
    expect(bank.versions?.[0]?.draft.password).toBe('bank-Secret-2!');
    await running.close();
  });

  it('is never written to where this account may only view, however the command line is asked', async () => {
    const { running, passhold, pageOf, proof, orgId, minh, alice, sharedOf, share, home, env } = await family();
    const detail = await (await pageOf(minh.email)).org(orgId);
    await consoleSetCollectionAccess(await pageOf(minh.email), { baseUrl: '', fetcher: namedClient(running.fetcherFrom(PAGE), 'console/0.1.0') }, { orgId, collectionId: detail.collections[0]!.id, accountId: alice.id, access: 'view', proof: proof(minh.email) });
    // Minh may still change it: his Passhold changes Netflix's password.
    await share((vault) => ({ ...vault, items: vault.items.map((item) => (item.title === 'Netflix' ? { ...item, password: 'N3tflix-Home-9!', updatedAt: Date.now() } : item)) }));
    const before = (await sharedOf(minh)).vault;

    expect((await passhold(['vaults'])).out).toMatch(/^Shared\tHome \/ Shared\tview only\t2 items$/m);
    // Read and used, as a view-only vault is.
    expect((await passhold(['get', 'passhold://Shared/Netflix/password'])).out).toBe('N3tflix-Home-9!\n');
    for (const argv of [
      ['create', 'login', '--vault', 'Shared', 'title=Mine', 'password=x'],
      ['edit', 'passhold://Shared/Netflix', 'password=taken'],
      ['delete', 'passhold://Shared/Netflix'],
    ]) {
      const refused = await passhold(argv);
      expect([refused.code, refused.err]).toEqual([1, 'You can view Shared, not change it.\n']);
    }

    // Past the command's own check, as a build that forgot it would go: the flows sign nothing, and the server takes nothing.
    const store = new Store(home);
    const account = new Account(store, '', running.fetcher, env);
    const unlocked = await store.session(env.PASSHOLD_SESSION, Date.now());
    const opened = await account.open(unlocked, { shared: true }, () => undefined);
    const shared = vaultNamed(opened.data, 'Shared');
    const netflix = shared.items.find((item) => 'title' in item && item.title === 'Netflix')!;
    await expect(
      account.write(unlocked, opened, { ...shared, viewOnly: false }, (items) => ({ items: { ...items, items: items.items.map((item) => (item.id === netflix.id ? { ...item, password: 'taken' } : item)) }, id: netflix.id })),
    ).rejects.toThrow(/view this vault, not change it/);
    const after = (await sharedOf(minh)).vault;
    expect(after.known).toEqual(before.known);
    expect(login(after, 'Netflix')?.password).toBe('N3tflix-Home-9!');
    await running.close();
  });

  it('says who has left until it is read, holds writes until the keys change, and takes a changed key only once compared', async () => {
    const { running, passhold, pageOf, proof, orgId, minh, alice, lan, join, sharedOf, page } = await family();
    expect((await passhold(['list'])).code).toBe(0);

    // Lan leaves, and the keys she held are not changed yet: nothing is sealed under the one she holds.
    await (await pageOf(minh.email)).removeOrgMember(orgId, lan.id);
    expect((await passhold(['vaults'])).out).toMatch(/^Shared\tHome \/ Shared\twaiting for new keys\t/m);
    expect((await passhold(['edit', 'passhold://Shared/Netflix', 'password=while-due'])).err).toMatch(/Someone who left Home still holds the key to Shared/);
    expect((await passhold(['get', 'passhold://Shared/Netflix/password'])).out).toBe('N3tflix-Home-1!\n');

    // Minh changes them: the roster stops listing her, and the terminal says so, every time, until it is read.
    await consoleRotateFamily(await pageOf(minh.email), { baseUrl: '', fetcher: page }, { orgId, proof: proof(minh.email) });
    expect((await passhold(['list'])).err).toMatch(/lan@example\.test has left Home\./);
    expect((await passhold(['list'])).err).toMatch(/lan@example\.test has left Home\./);
    expect((await passhold(['vaults'])).err).toMatch(/lan@example\.test has left Home\./);
    expect((await passhold(['list'])).err).not.toMatch(/has left/);
    expect((await passhold(['edit', 'passhold://Shared/Netflix', 'password=after-new-keys'])).code).toBe(0);
    expect(login((await sharedOf(minh)).vault, 'Netflix')?.password).toBe('after-new-keys');

    // Lan comes back with a new key, let in without comparing it: nothing new of hers is taken here until the codes match.
    await join(lan, false);
    const warned = await passhold(['list']);
    expect(warned.err).toMatch(/the key of lan@example\.test changed\. .*passhold compare "Home"/);
    const code = (await consoleFamilyCompareCode(await pageOf(lan.email), { baseUrl: '', fetcher: page }, { orgId, accountId: alice.id, proof: proof(lan.email) })).code;
    // Another code than hers: nothing is taken.
    expect((await passhold(['compare', 'Home'], ['no'])).code).toBe(1);
    expect((await passhold(['list'])).err).toMatch(/the key of lan@example\.test changed/);
    const compared = await passhold(['compare', 'Home'], ['yes']);
    expect(compared.code).toBe(0);
    expect(compared.err).toContain(`Does it read ${code}?`);
    expect((await passhold(['list'])).err).not.toMatch(/changed/);
    await running.close();
  });
});

