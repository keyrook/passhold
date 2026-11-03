import { createCipheriv, createDecipheriv, createHash, createHmac, hkdfSync, pbkdf2Sync, randomBytes } from 'node:crypto';
import {
  AUTHENTICATOR,
  generateRecoveryKey,
  makeDeviceRemovalProof,
  newAccountRoot,
  openRootWithPassword,
  sealRootPin,
  wrapProductKeyForPairing,
  wrapRootUnderPassword,
  wrapRootUnderRecoveryKey,
} from '@keyrook/account';
import { describe, expect, it } from 'vitest';
import {
  addLogin,
  addWalletItem,
  allSent,
  applyPulled,
  resendAll,
  assertAcceptableAccountKdf,
  deriveAccountKeys,
  accountKitProof,
  formatAccountKitKey,
  isAccountKitKey,
  newAccountKdf,
  accountPasskeySalt,
  newPairingKeys,
  newProviderFlow,
  openWithPasskey,
  openRootBySheet,
  passkeyOfRecord,
  passkeyRecordId,
  readPassholdPin,
  removalProved,
  removedFromAccount,
  wrapForPasskey,
  wrapKeyForPairing,
  nextAccountKit,
  openPairedKey,
  pairingCode,
  strongEnoughForAccount,
  emptyData,
  exportDataKey,
  generateDataKey,
  loginSig,
  openLogin,
  PassholdError,
  planPush,
  purgeLogin,
  purgeWalletItem,
  PRODUCT,
  RECORD_KIND,
  recordsKey,
  sealLogin,
  sealTombstone,
  setFavorite,
  tombstoneOpens,
  trashLogin,
  trashWalletItem,
  updateLogin,
  WALLET_KIND,
  walletSig,
  type AccountLink,
  type RemoteRecord,
  sanitiseData,
} from '@passhold/core';

const KDF = { algorithm: 'PBKDF2-SHA256' as const, iterations: 600_000, salt: Buffer.from(randomBytes(16)).toString('base64') };

const code = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return error instanceof PassholdError ? error.code : `other: ${String(error)}`;
  }
  return 'resolved';
};

describe('the account keys', () => {
  it('are the ones Keyrook derives: PBKDF2, then HKDF with the account’s labels', async () => {
    const password = 'correct horse battery staple';
    const keys = await deriveAccountKeys(password, KDF);
    // The same derivation, done independently by Node, as the account's design describes it.
    const master = pbkdf2Sync(password.normalize('NFKC'), Buffer.from(KDF.salt, 'base64'), KDF.iterations, 32, 'sha256');
    const auth = Buffer.from(hkdfSync('sha256', master, Buffer.alloc(0), 'authx:v1:auth', 32)).toString('base64');
    expect(keys.authHash).toBe(auth);

    // And the root, wrapped under what the password derives, opens with Node's own key and the account's binding.
    const accountId = crypto.randomUUID();
    const root = await newAccountRoot();
    const made = { root, publicKey: root.publicKey, passwordWrap: await wrapRootUnderPassword(root, keys, accountId) };
    const wrapKey = Buffer.from(hkdfSync('sha256', master, Buffer.alloc(0), 'keyrook:v1:root-wrap', 32));
    const sealed = Buffer.from(made.passwordWrap.ct, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', wrapKey, Buffer.from(made.passwordWrap.iv, 'base64'));
    decipher.setAAD(Buffer.from(`keyrook.root:v1:${accountId}:password`));
    decipher.setAuthTag(sealed.subarray(-16));
    const pkcs8 = Buffer.concat([decipher.update(sealed.subarray(0, -16)), decipher.final()]);
    const opened = await crypto.subtle.importKey('pkcs8', pkcs8, { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
    expect((await crypto.subtle.exportKey('jwk', opened)).d).toBe((await crypto.subtle.exportKey('jwk', made.root.privateKey)).d);
    expect((await openRootWithPassword(made.passwordWrap, keys, accountId)).publicKey).toBe(made.publicKey);
  });

  it('refuse a server asking for a cheaper derivation', async () => {
    for (const params of [
      { ...KDF, iterations: 100_000 },
      { ...KDF, salt: Buffer.alloc(8).toString('base64') },
      { ...KDF, algorithm: 'MD5' },
      null,
    ]) {
      expect(() => assertAcceptableAccountKdf(params as never)).toThrow(PassholdError);
    }
    expect(await code(deriveAccountKeys('x', { ...KDF, iterations: 1 }))).toBe('accountKdfRefused');
  });
});

describe('logins in the account', () => {
  const draft = (title: string, password = `${title}-Pass-123!`) => ({ title, username: 'alice', password, urls: [`https://${title.toLowerCase()}.test`], notes: '' });
  const record = async (key: CryptoKey, item: ReturnType<typeof addLogin>['item'], rev: number, extra: Partial<RemoteRecord> = {}): Promise<RemoteRecord> => ({
    id: item.id,
    kind: RECORD_KIND,
    serverRev: rev,
    rev,
    deleted: false,
    updatedAt: item.updatedAt,
    deviceId: 'other',
    box: await sealLogin(key, item, rev),
    ...extra,
  });

  it('open only as what they were sealed as: their kind, id and revision', async () => {
    const key = await recordsKey(await generateDataKey());
    const { item } = addLogin(emptyData(), draft('Mail'));
    const sealed = await record(key, item, 3);
    expect((await openLogin(key, sealed))?.password).toBe(item.password);
    expect(await openLogin(key, { ...sealed, rev: 4 })).toBeNull();
    expect(await openLogin(key, { ...sealed, id: 'another' })).toBeNull();
    expect(await openLogin(key, { ...sealed, kind: 'item' })).toBeNull();
    // Sealed under another key — another product's, or Passhold's own from before — it does not open.
    expect(await openLogin(await recordsKey(await generateDataKey()), await record(await recordsKey(await generateDataKey()), item, 3))).toBeNull();
  });

  it('come in: new ones added, a newer edit joined, Authenticator’s and broken ones passed over, deletions counted', async () => {
    const key = await recordsKey(await generateDataKey());
    let here = addLogin(emptyData(), draft('Mail'), 1_000).data;
    const mail = here.items[0]!;
    const known = { [mail.id]: { rev: 1, sig: await loginSig(mail) } };
    const shop = addLogin(emptyData(), draft('Shop'), 1_000).item;
    const bank = addLogin(emptyData(), draft('Bank'), 1_000).item;
    here = { ...here, items: [...here.items, bank] };
    const knownBank = { ...known, [bank.id]: { rev: 1, sig: await loginSig(bank) } };
    const newerMail = updateLogin({ ...emptyData(), items: [mail] }, mail.id, draft('Mail', 'changed-There-1!'), 2_000).items[0]!;

    const pulled = await applyPulled(here, knownBank, [
      await record(key, shop, 5),
      await record(key, newerMail, 2),
      { id: 'twofa', kind: 'item', serverRev: 6, rev: 1, deleted: false, updatedAt: 1, deviceId: 'x', box: { iv: 'AAAA', ct: 'AAAA' } },
      { ...(await record(key, shop, 5)), id: 'broken', box: { iv: 'AAAAAAAAAAAAAAAA', ct: 'AAAA' } },
      { id: bank.id, kind: RECORD_KIND, serverRev: 7, rev: 2, deleted: true, updatedAt: 3_000, deviceId: 'x', box: await sealTombstone(key, RECORD_KIND, bank.id, 2) },
    ], key);
    expect(pulled.data.items.map((item) => item.title).sort()).toEqual(['Mail', 'Shop']);
    expect(pulled.data.items.find((item) => item.title === 'Mail')!.password).toBe('changed-There-1!');
    expect(pulled.data.items.find((item) => item.title === 'Mail')!.history.map((entry) => entry.password)).toContain(mail.password);
    expect([pulled.removed, pulled.skipped]).toEqual([1, 1]);
    expect(pulled.known[bank.id]).toBeUndefined();
  });

  it('write over a record that will not open where this vault holds the login, and leave any other alone', async () => {
    const key = await recordsKey(await generateDataKey());
    const before = await recordsKey(await generateDataKey());
    const here = addLogin(emptyData(), draft('Mail'), 1_000).data;
    const mail = here.items[0]!;
    const stranger = addLogin(emptyData(), draft('Shop'), 1_000).item;
    // Sealed under the key from before each product had its own: they open no more.
    const pulled = await applyPulled(here, {}, [await record(before, mail, 4), await record(before, stranger, 2)], key);
    expect(pulled.skipped).toBe(2);
    expect(pulled.data.items).toEqual(here.items);
    // The vault's copy goes up over the old one, at the revision after it, and nothing is deleted.
    const plan = await planPush(pulled.data, pulled.known, key, 'me');
    expect(plan.records.map((entry) => [entry.id, entry.rev, entry.deleted])).toEqual([[mail.id, 5, false]]);
  });

  it('after Passhold’s key is replaced, take what the old key sealed, and send all of it again under the new one', async () => {
    const before = await recordsKey(await generateDataKey());
    const key = await recordsKey(await generateDataKey());
    const here = addLogin(emptyData(), draft('Mail'), 1_000).data;
    const mail = here.items[0]!;
    // Only on the server, sealed under the key before.
    const shop = addLogin(emptyData(), draft('Shop'), 1_000).item;
    const known = resendAll({ [mail.id]: { rev: 3, sig: await loginSig(mail) } });
    expect(allSent(known)).toBe(false);

    // Without the key before, what it sealed would not open here.
    expect((await applyPulled(here, known, [await record(before, shop, 2)], key)).skipped).toBe(1);
    const pulled = await applyPulled(here, known, [await record(before, shop, 2)], key, before);
    expect(pulled.skipped).toBe(0);
    expect(pulled.data.items.map((item) => item.title).sort()).toEqual(['Mail', 'Shop']);

    // Both go up again, each at the revision after the server's, sealed under the new key alone.
    const plan = await planPush(pulled.data, pulled.known, key, 'me');
    expect(Object.fromEntries(plan.records.map((entry) => [entry.id, entry.rev]))).toEqual({ [mail.id]: 4, [shop.id]: 3 });
    for (const entry of plan.records) {
      expect(await openLogin(key, { ...entry, serverRev: 9 })).not.toBeNull();
      expect(await openLogin(before, { ...entry, serverRev: 9 })).toBeNull();
    }
    // Once the server has them, nothing is left for the key before to open.
    const sent = Object.fromEntries(plan.records.map((entry) => [entry.id, { rev: entry.rev, sig: plan.sigs[entry.id]! }]));
    expect(allSent(sent)).toBe(true);
  });

  it('are taken away only by a deletion sealed under Passhold’s key, never by the server’s word', async () => {
    const key = await recordsKey(await generateDataKey());
    const stranger = await recordsKey(await generateDataKey());
    const here = addLogin(addLogin(emptyData(), draft('Mail'), 1_000).data, draft('Bank'), 1_000).data;
    const [mail, bank] = here.items;
    const known = { [mail!.id]: { rev: 2, sig: await loginSig(mail!) }, [bank!.id]: { rev: 2, sig: await loginSig(bank!) } };
    const tombstone = (id: string, rev: number, box: RemoteRecord['box'], kind = RECORD_KIND): RemoteRecord => ({ id, kind, serverRev: 9, rev, deleted: true, updatedAt: 3_000, deviceId: 'x', box });
    const forged = [
      // The flag alone, as the protocol carries a deletion: the server could set it on any record it holds.
      tombstone(mail!.id, 3, null),
      // Sealed, but under a key that is not Passhold's.
      tombstone(mail!.id, 3, await sealTombstone(stranger, RECORD_KIND, mail!.id, 3)),
      // A real deletion of another login, moved onto this one.
      tombstone(mail!.id, 3, await sealTombstone(key, RECORD_KIND, bank!.id, 3)),
      // A real deletion at another revision.
      tombstone(mail!.id, 3, await sealTombstone(key, RECORD_KIND, mail!.id, 7)),
      // A real deletion of a card, relabelled as a login's.
      tombstone(mail!.id, 3, await sealTombstone(key, WALLET_KIND, mail!.id, 3)),
      // The login's own sealed box, flagged as deleted.
      tombstone(mail!.id, 3, await sealLogin(key, mail!, 3)),
    ];
    for (const record of forged) {
      const pulled = await applyPulled(here, known, [record], key);
      expect([pulled.removed, pulled.skipped]).toEqual([0, 1]);
      expect(pulled.data.items).toEqual(here.items);
      // And the login goes back up over the deletion, at the revision after it.
      const plan = await planPush(pulled.data, pulled.known, key, 'me');
      expect(plan.records.map((entry) => [entry.id, entry.rev, entry.deleted])).toEqual([[mail!.id, 4, false]]);
    }
    // A server that says it was restored from a backup forgets what this device knew, so no revision is
    // checked: every login is still kept from a deletion it made up.
    const restored = await applyPulled(here, {}, [tombstone(mail!.id, 1, null), tombstone(bank!.id, 1, null)], key);
    expect(restored.data.items).toHaveLength(2);

    // A deletion for good on another device goes up sealed, and takes the login away here.
    const there = purgeLogin(trashLogin(here, bank!.id), bank!.id);
    const plan = await planPush(there, known, key, 'other');
    expect(plan.records.map((entry) => [entry.id, entry.deleted, entry.box !== null])).toEqual([[bank!.id, true, true]]);
    const gone = await applyPulled(here, known, plan.records.map((entry) => ({ ...entry, serverRev: 10 })), key);
    expect(gone.removed).toBe(1);
    expect(gone.data.items.map((item) => item.id)).toEqual([mail!.id]);
  });

  it('never yield to a replay of what this device already has', async () => {
    const key = await recordsKey(await generateDataKey());
    const here = addLogin(emptyData(), draft('Mail', 'current-Pass-9!'), 2_000).data;
    const mail = here.items[0]!;
    const older = { ...mail, password: 'old-Pass-1!', updatedAt: 1_000 };
    const known = { [mail.id]: { rev: 5, sig: await loginSig(mail) } };
    const pulled = await applyPulled(here, known, [await record(key, older, 5), await record(key, older, 4)], key);
    expect(pulled.data.items[0]!.password).toBe('current-Pass-9!');
  });

  it('once this browser is removed, go — but those added or changed here and never sent stay', async () => {
    let data = addLogin(addLogin(addLogin(emptyData(), draft('Mail'), 1_000).data, draft('Bank'), 1_000).data, draft('Shop'), 1_000).data;
    data = addWalletItem(addWalletItem(data, { kind: 'note', title: 'Wi-Fi', text: 'the password' }).data, { kind: 'note', title: 'Router', text: 'admin' }).data;
    const [mail, bank, shop] = data.items;
    const [wifi] = data.wallet;
    const known = {
      [mail!.id]: { rev: 2, sig: await loginSig(mail!) },
      [bank!.id]: { rev: 1, sig: await loginSig(bank!) },
      [wifi!.id]: { rev: 1, sig: await walletSig(wifi!), kind: 'wallet' as const },
    };
    // Since the last sync: Mail used, which is this device's own, Bank changed, Shop and Router never sent.
    data = updateLogin(data, bank!.id, draft('Bank', 'changed-Here-2!'), 2_000);
    data = { ...data, items: data.items.map((item) => (item.id === mail!.id ? { ...item, lastUsedAt: 3_000 } : item)) };
    const account: AccountLink = {
      email: 'alice@example.test',
      name: 'Alice',
      deviceId: crypto.randomUUID(),
      accountId: crypto.randomUUID(),
      productKey: await exportDataKey(await generateDataKey()),
      previousKey: await exportDataKey(await generateDataKey()),
      root: 'the-root',
      keyGeneration: 2,
      rootGeneration: 1,
      sheetVerifiedAt: 1_000,
      tokens: { accessToken: 'access', refreshToken: 'refresh' },
      serverRev: 9,
      epoch: 'epoch',
      known,
      lastSyncAt: 1_500,
      kit: { issuedAt: 1_000, key: generateRecoveryKey(), pending: false },
      pendingStartOver: null,
      removedAt: null,
      provider: null,
      passwordless: false,
      passkey: 'credential',
    };

    const after = await removedFromAccount({ ...data, account }, 1_790_000_000_000);
    expect(after.items.map((item) => item.title).sort()).toEqual(['Bank', 'Shop']);
    expect(after.items.find((item) => item.title === 'Bank')!.password).toBe('changed-Here-2!');
    expect(after.wallet.map((item) => item.title)).toEqual(['Router']);
    // Nothing of the account's is left to open anything with, and nothing known to be on it: a sign-in again sends what
    // stayed and deletes nothing there. The notice is kept, on the link with no key, until it is closed.
    expect(after.account).toEqual({
      email: 'alice@example.test',
      name: null,
      deviceId: account.deviceId,
      accountId: null,
      productKey: null,
      previousKey: null,
      root: null,
      keyGeneration: 1,
      rootGeneration: 1,
      sheetVerifiedAt: null,
      tokens: null,
      serverRev: 0,
      epoch: null,
      known: {},
      lastSyncAt: null,
      kit: null,
      pendingStartOver: null,
      removedAt: 1_790_000_000_000,
      provider: null,
      passwordless: false,
      passkey: null,
    });
    expect(sanitiseData(JSON.parse(JSON.stringify(after))).account).toEqual(after.account);
    expect((await planPush(after, after.account!.known, await recordsKey(await generateDataKey()), 'me')).records.map((entry) => entry.deleted)).toEqual([false, false, false]);
  });

  it('are known as cards, addresses or notes again when the vault is read, so a deletion goes up as what it deletes', async () => {
    const key = await recordsKey(await generateDataKey());
    const { data, item: wifi } = addWalletItem(emptyData(), { kind: 'note', title: 'Wi-Fi', text: 'the password' });
    const known = { [wifi.id]: { rev: 1, sig: await walletSig(wifi), kind: 'wallet' as const } };
    const stored = { items: [], account: { email: 'a@example.test', deviceId: 'd', accountId: 'acc', productKey: 'k'.repeat(44), known } };
    const read = sanitiseData(JSON.parse(JSON.stringify(stored))).account!.known;
    expect(read).toEqual(known);

    const [deletion] = (await planPush(purgeWalletItem(trashWalletItem(data, wifi.id), wifi.id), read, key, 'me')).records;
    expect([deletion!.kind, deletion!.deleted]).toEqual([WALLET_KIND, true]);
    expect(await tombstoneOpens(key, { ...deletion!, serverRev: 9 })).toBe(true);
  });

  it('go out when anything about them changed, and deletions for good go out as such', async () => {
    const key = await recordsKey(await generateDataKey());
    let data = addLogin(addLogin(emptyData(), draft('Mail')).data, draft('Bank')).data;
    const [mail, bank] = data.items;
    const known = { [mail!.id]: { rev: 1, sig: await loginSig(mail!) }, [bank!.id]: { rev: 1, sig: await loginSig(bank!) } };
    expect((await planPush(data, known, key, 'me')).records).toEqual([]);

    // A favourite does not move `updatedAt`, but it is a change all the same.
    data = setFavorite(data, mail!.id, true);
    data = purgeLogin(trashLogin(data, bank!.id), bank!.id);
    const plan = await planPush(data, known, key, 'me');
    expect(plan.records.map((entry) => [entry.id, entry.rev, entry.deleted])).toEqual([
      [mail!.id, 2, false],
      [bank!.id, 2, true],
    ]);
    // The deletion is sealed, and holds nothing of the login: it opens as a deletion, never as the login.
    expect(await tombstoneOpens(key, { ...plan.records[1]!, serverRev: 9 })).toBe(true);
    expect(await openLogin(key, { ...plan.records[1]!, serverRev: 9, deleted: false })).toBeNull();
    expect((await openLogin(key, { ...plan.records[0]!, serverRev: 9 }))?.favorite).toBe(true);
  });
});

describe('a new account', () => {
  it('asks for a strong password, at Keyrook’s cost', () => {
    expect(newAccountKdf().iterations).toBe(600_000);
    expect(strongEnoughForAccount('password123')).toBe(false);
    expect(strongEnoughForAccount('Correct-Horse-Battery-9!')).toBe(true);
    expect(PRODUCT).toBe('passhold');
  });

  it('takes a key as Passhold’s only when Passhold’s pin opens under it, on this account', async () => {
    const accountId = crypto.randomUUID();
    const productKey = await generateDataKey();
    const root = await newAccountRoot();
    const pin = await sealRootPin(productKey, { root: root.publicKey, sheetVerifiedAt: 4_000 }, accountId, PRODUCT);
    expect(await readPassholdPin(productKey, pin, accountId)).toEqual({ root: root.publicKey, sheetVerifiedAt: 4_000 });
    // A key the server chose, with a pin it sealed under that key, is not taken as Passhold's.
    const planted = await sealRootPin(await generateDataKey(), { root: root.publicKey, sheetVerifiedAt: null }, accountId, PRODUCT);
    expect(await readPassholdPin(productKey, planted, accountId)).toBeNull();
    // Nor is Passhold's pin moved to another account, or another product's pin under the same key.
    expect(await readPassholdPin(productKey, pin, crypto.randomUUID())).toBeNull();
    const theirs = await sealRootPin(productKey, { root: root.publicKey, sheetVerifiedAt: null }, accountId, AUTHENTICATOR);
    expect(await readPassholdPin(productKey, theirs, accountId)).toBeNull();
  });

  it('names a removal only by a proof Passhold’s key made for this account and this browser', async () => {
    const productKey = await generateDataKey();
    const link = { accountId: crypto.randomUUID(), productKey: await exportDataKey(productKey), deviceId: crypto.randomUUID() };
    const device = { accountId: link.accountId, product: PRODUCT, deviceId: link.deviceId };
    const proof = await makeDeviceRemovalProof(productKey, device, 1_790_000_000_000);
    expect(await removalProved(link, proof)).toBe(1_790_000_000_000);
    // The server's word alone, or a proof it bent, is no removal.
    for (const sent of [null, undefined, {}, 'removed', { removedAt: proof.removedAt }, { ...proof, removedAt: proof.removedAt + 1 }, { ...proof, mac: btoa('x'.repeat(32)) }]) {
      expect(await removalProved(link, sent)).toBeNull();
    }
    // A key the server chose, and a proof for another browser, another account or Keyrook Authenticator, are not this one's.
    expect(await removalProved(link, await makeDeviceRemovalProof(await generateDataKey(), device))).toBeNull();
    expect(await removalProved(link, await makeDeviceRemovalProof(productKey, { ...device, deviceId: crypto.randomUUID() }))).toBeNull();
    expect(await removalProved(link, await makeDeviceRemovalProof(productKey, { ...device, accountId: crypto.randomUUID() }))).toBeNull();
    expect(await removalProved(link, await makeDeviceRemovalProof(productKey, { ...device, product: AUTHENTICATOR }))).toBeNull();
    // A link from before keys per product, or with an id no proof could name, was removed by nothing.
    expect(await removalProved({ ...link, productKey: null }, proof)).toBeNull();
    expect(await removalProved({ ...link, deviceId: '' }, proof)).toBeNull();
  });

  it('checks a removal’s proof as keyrook-account’s frozen vector for Passhold says, and as any HKDF and HMAC would', async () => {
    // keyrook-account's own fixture, made once and never again.
    const ACCOUNT_ID = 'd6d06216-f401-4513-8745-154434f2dc50';
    const PASSHOLD_KEY = 'gzuTeoPBH7o/Vej2F84yGakixjmtH8pz1atc4Gi7uOY=';
    const DEVICE_ID = '58ade369-0d75-47b7-aa8f-768ae3112fa1';
    const REMOVED_AT = 1_793_059_200_000;
    const passhold = { removedAt: REMOVED_AT, mac: 'fDTzK7NLofcR8uq79ZjFCziaolbJrSHDXZN9uT1kyNg=' };
    const authenticator = { removedAt: REMOVED_AT, mac: 'v43djlxU90fSI02Y0L0wXjg6ZLJ6AF3A0J6Dii+G3pQ=' };
    // Node's own HKDF and HMAC, no Keyrook code.
    const macKey = Buffer.from(hkdfSync('sha256', Buffer.from(PASSHOLD_KEY, 'base64'), Buffer.alloc(0), 'keyrook:v1:device-removed', 32));
    const input = `keyrook.device-removed:v1:${ACCOUNT_ID}:${PRODUCT}:${REMOVED_AT}:${DEVICE_ID}`;
    expect(createHmac('sha256', macKey).update(input).digest('base64')).toBe(passhold.mac);

    const link = { accountId: ACCOUNT_ID, productKey: PASSHOLD_KEY, deviceId: DEVICE_ID };
    expect(await removalProved(link, passhold)).toBe(REMOVED_AT);
    // Keyrook Authenticator's proof for the same device is not Passhold's to act on.
    expect(await removalProved(link, authenticator)).toBeNull();
  });

  it('opens the root with the account’s recovery key alone, however typed, and no other', async () => {
    const accountId = crypto.randomUUID();
    const root = await newAccountRoot();
    const recoveryKey = generateRecoveryKey();
    const wrap = await wrapRootUnderRecoveryKey(root, recoveryKey, accountId);
    expect((await openRootBySheet(wrap, recoveryKey.toLowerCase().replace(/-/g, ' '), accountId)).publicKey).toBe(root.publicKey);
    await expect(openRootBySheet(wrap, generateRecoveryKey(), accountId)).rejects.toMatchObject({ code: 'accountKitWrong' });
    // A wrap under the right key, moved to another account, does not open there.
    await expect(openRootBySheet(wrap, recoveryKey, crypto.randomUUID())).rejects.toMatchObject({ code: 'accountKitWrong' });
  });
});

describe('the account’s recovery key', () => {
  it('is taken however it is typed, and told apart from the vault’s own', async () => {
    const recoveryKey = generateRecoveryKey();
    const typed = ` ${recoveryKey.toLowerCase().replace(/-/g, ' ')} `;
    expect(isAccountKitKey(typed)).toBe(true);
    expect(formatAccountKitKey(typed)).toBe(recoveryKey);
    // Its proof, worked out again here without Keyrook's code: Crockford base32, 160 bits, HKDF.
    const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    const bits = [...recoveryKey.replace(/-/g, '')].map((char) => ALPHABET.indexOf(char).toString(2).padStart(5, '0')).join('');
    const bytes = Buffer.from(bits.match(/.{8}/g)!.map((byte) => parseInt(byte, 2)));
    expect(bytes).toHaveLength(20);
    expect(await accountKitProof(typed)).toBe(Buffer.from(hkdfSync('sha256', bytes, Buffer.alloc(0), 'authx:v1:recovery-auth', 32)).toString('base64'));
    await expect(accountKitProof('ABCD-EFGH')).rejects.toMatchObject({ code: 'accountKitWrong' });
    // The vault's own recovery key is another thing: 24 characters, not 32.
    expect(isAccountKitKey('ABCD-EFGH-JKMN-PQRS-TVWX-YZ01')).toBe(false);
  });

  it('is shown as held only while no newer one was set, and not at all once the account has none', () => {
    const held = { issuedAt: 5, key: 'ABCD', pending: true };
    expect(nextAccountKit(held, 5)).toBe(held);
    expect(nextAccountKit(held, 3)).toBe(held);
    expect(nextAccountKit(held, 8)).toEqual({ issuedAt: 8, key: null, pending: false });
    expect(nextAccountKit(held, null)).toBeNull();
    expect(nextAccountKit(null, 8)).toEqual({ issuedAt: 8, key: null, pending: false });
    expect(nextAccountKit(null, null)).toBeNull();
  });
});

describe('signing in with Google or GitHub', () => {
  it('keeps whether the account has a password apart from the provider it signed in with', () => {
    const link = (fields: Record<string, unknown>) =>
      sanitiseData({ items: [], account: { email: 'a@example.test', deviceId: 'd', accountId: 'acc', productKey: 'k'.repeat(44), ...fields } }).account!;
    // An account with a password may sign in with Google too: unlocked again, it still has its password.
    expect(link({ provider: 'google', passwordless: false }).passwordless).toBe(false);
    expect(link({ provider: null, passwordless: true }).passwordless).toBe(true);
    // A link from before the field: Google or GitHub then meant no password.
    expect(link({ provider: 'github' }).passwordless).toBe(true);
    expect(link({ provider: null }).passwordless).toBe(false);
  });

  it('keeps the verifier here and sends only its PKCE challenge', async () => {
    const flow = await newProviderFlow();
    expect(flow.verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(flow.state).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(flow.challenge).toBe(createHash('sha256').update(flow.verifier).digest('base64url'));
    expect((await newProviderFlow()).verifier).not.toBe(flow.verifier);
  });

  it('takes a key only from the Passhold browser whose code was compared, on this account', async () => {
    const productKey = await generateDataKey();
    const accountId = crypto.randomUUID();
    const requester = await newPairingKeys();
    const approver = await newPairingKeys();
    const wrap = await wrapKeyForPairing(accountId, productKey, approver, 'pairing-1', requester.publicKey);
    expect(await exportDataKey(await openPairedKey(accountId, requester, 'pairing-1', approver.publicKey, wrap))).toBe(await exportDataKey(productKey));
    // Both browsers work the code out over both keys: a swapped one shows as a different code.
    const shown = await pairingCode(accountId, 'pairing-1', requester.publicKey, approver.publicKey);
    expect(shown).toMatch(/^[0-9A-HJKMNP-TV-Z]{5}(-[0-9A-HJKMNP-TV-Z]{5}){2}$/);
    const intruder = await newPairingKeys();
    expect(await pairingCode(accountId, 'pairing-1', requester.publicKey, intruder.publicKey)).not.toBe(shown);
    // Another account's code differs too, so a request routed from one account to another shows two codes.
    expect(await pairingCode(crypto.randomUUID(), 'pairing-1', requester.publicKey, approver.publicKey)).not.toBe(shown);
    // A wrap from another key, for another request or account, or from another product's browser, is refused.
    const forged = await wrapKeyForPairing(accountId, productKey, intruder, 'pairing-1', requester.publicKey);
    await expect(openPairedKey(accountId, requester, 'pairing-1', approver.publicKey, forged)).rejects.toMatchObject({ code: 'pairingRefused' });
    await expect(openPairedKey(accountId, requester, 'pairing-2', approver.publicKey, wrap)).rejects.toMatchObject({ code: 'pairingRefused' });
    await expect(openPairedKey(crypto.randomUUID(), requester, 'pairing-1', approver.publicKey, wrap)).rejects.toMatchObject({ code: 'pairingRefused' });
    const authenticators = await wrapProductKeyForPairing(AUTHENTICATOR, accountId, productKey, approver, 'pairing-1', requester.publicKey);
    await expect(openPairedKey(accountId, requester, 'pairing-1', approver.publicKey, authenticators)).rejects.toMatchObject({ code: 'pairingRefused' });
  });
});

describe('Passhold’s key under a passkey', () => {
  it('asks every passkey for the same public salt, so a computer that never saw the account can ask', async () => {
    expect(Buffer.from(await accountPasskeySalt()).toString('hex')).toBe(createHash('sha256').update('passhold:v1:account-passkey').digest('hex'));
  });

  it('names one record per passkey, and finds the passkey again from the name', () => {
    const credentialId = Buffer.from(randomBytes(32)).toString('base64');
    const id = passkeyRecordId(credentialId);
    expect(id.startsWith('passkey:')).toBe(true);
    expect(id.length).toBeLessThanOrEqual(128);
    expect(passkeyOfRecord(id)).toBe(credentialId);
    expect(passkeyOfRecord('a-login-id')).toBeNull();
  });

  it('opens only with that passkey’s answer, and only under its own name', async () => {
    const productKey = await generateDataKey();
    const answer = randomBytes(32);
    const id = passkeyRecordId(Buffer.from(randomBytes(16)).toString('base64'));
    const box = await wrapForPasskey(productKey, answer, id);
    expect(await exportDataKey(await openWithPasskey(box, answer, id))).toBe(await exportDataKey(productKey));
    // Another passkey's answer, or this wrap moved under another passkey's record: refused.
    await expect(openWithPasskey(box, randomBytes(32), id)).rejects.toMatchObject({ code: 'passkeyWrong' });
    await expect(openWithPasskey(box, answer, passkeyRecordId(Buffer.from(randomBytes(16)).toString('base64')))).rejects.toMatchObject({ code: 'passkeyWrong' });
    expect(JSON.stringify(box)).not.toContain(await exportDataKey(productKey));
  });
});
