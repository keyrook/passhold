import { describe, expect, it } from 'vitest';
import {
  acceptPushed,
  addLogin,
  addWalletItem,
  applyPulled,
  backupText,
  cardExpired,
  cardExpiry,
  cardGroups,
  cardNetwork,
  cardNumberLooksRight,
  checkup,
  cleanWalletItem,
  countryCode,
  judgeSentAddress,
  judgeSentCard,
  saveSent,
  sentAddress,
  sentCard,
  createVault,
  emptyData,
  emptyTrash,
  generateDataKey,
  markBackedUp,
  mergeBackup,
  newKdfParams,
  openBackup,
  openLogin,
  openWalletItem,
  PassholdError,
  planPush,
  purgeWalletItem,
  RECORD_KIND,
  recordsKey,
  restoreWalletItem,
  sanitiseData,
  sealVault,
  sealWalletItem,
  searchWallet,
  setWalletFavorite,
  splitName,
  trashWalletItem,
  updateWalletItem,
  walletOf,
  walletSig,
  walletTitle,
  WALLET_KIND,
  type CardDraft,
  type RemoteRecord,
  type WalletItem,
} from '@passhold/core';

const CARD: CardDraft = { kind: 'card', title: '', holder: 'NGUYEN VAN AN', number: '4242 4242 4242 4242', expMonth: 8, expYear: 2029, code: '123', notes: '' };
const ADDRESS = {
  kind: 'address' as const,
  title: 'Home',
  name: 'Nguyễn Văn An',
  organization: '',
  street: '12 Lý Thường Kiệt\nPhường Hàng Bài',
  city: 'Hà Nội',
  region: '',
  postalCode: '100000',
  country: 'vn',
  phone: '+84 912 345 678',
  email: 'an@example.test',
  notes: '',
};
const NOTE = { kind: 'note' as const, title: 'Wi-Fi', text: 'home-network: pass-7Q!' };

const code = (run: () => unknown) => {
  try {
    run();
  } catch (error) {
    return error instanceof PassholdError ? error.code : `other: ${String(error)}`;
  }
  return 'returned';
};

describe('cards, addresses and notes', () => {
  it('keep only what each kind holds, in the shape it is kept in', () => {
    const { item } = addWalletItem(emptyData(), { ...CARD, number: '4242-4242 4242 4242x', code: '12a3', expYear: 29 } as CardDraft);
    expect(item).toMatchObject({ kind: 'card', number: '4242424242424242', code: '123', expYear: 2029, expMonth: 8 });
    const address = addWalletItem(emptyData(), { ...ADDRESS, street: '  12 Lý Thường Kiệt \n\n  Phường   Hàng Bài ' }).item;
    expect(address).toMatchObject({ country: 'VN', street: '12 Lý Thường Kiệt\nPhường Hàng Bài' });
    // A name is one line: a pasted newline would end a form field early.
    expect(addWalletItem(emptyData(), { ...ADDRESS, name: 'An\nNguyễn' }).item).toMatchObject({ name: 'An Nguyễn' });
  });

  it('refuse a draft with nothing to keep, of no known kind, or of another kind than the item', () => {
    expect(code(() => addWalletItem(emptyData(), { ...CARD, number: '', title: '' }))).toBe('itemInvalid');
    expect(code(() => addWalletItem(emptyData(), { ...NOTE, title: ' ', text: '   ' }))).toBe('itemInvalid');
    expect(code(() => addWalletItem(emptyData(), { ...NOTE, kind: 'login' } as never))).toBe('itemInvalid');
    const { data, item } = addWalletItem(emptyData(), CARD);
    // A card stays a card: an edit cannot turn it into a note, which would lose its number.
    expect(code(() => updateWalletItem(data, item.id, NOTE))).toBe('itemInvalid');
    expect(updateWalletItem(data, item.id, { ...CARD, code: '987' }, 9_000).wallet[0]).toMatchObject({ code: '987', updatedAt: 9_000 });
  });

  it('read nothing they do not recognise from storage', () => {
    for (const junk of [null, 'card', { kind: 'card' }, { id: 'x', kind: 'wallet' }, { id: 'x' }]) expect(cleanWalletItem(junk)).toBeNull();
    const stored = cleanWalletItem({ id: 'x', kind: 'card', number: 4242, code: { value: 1 }, expMonth: 13, expYear: 1999, favorite: 'yes', extra: 'kept?' });
    expect(stored).toMatchObject({ number: '', code: '', expMonth: null, expYear: null, favorite: false });
    expect(stored).not.toHaveProperty('extra');
  });

  it('never take a login’s id: in the account the two would be one record', () => {
    const login = addLogin(emptyData(), { title: 'Mail', username: 'a', password: 'p', urls: [], notes: '' }).item;
    const data = sanitiseData({ items: [login], wallet: [{ ...addWalletItem(emptyData(), NOTE).item, id: login.id }, addWalletItem(emptyData(), CARD).item] });
    expect(data.items).toHaveLength(1);
    expect(data.wallet.map((item) => item.kind)).toEqual(['card']);
  });

  it('go to the trash, come back, and leave for good only from there', () => {
    let { data, item } = addWalletItem(emptyData(), CARD);
    expect(code(() => purgeWalletItem(data, item.id))).toBe('itemInvalid');
    data = trashWalletItem(data, item.id, 5_000);
    expect(walletOf(data, 'card')).toEqual([]);
    data = restoreWalletItem(data, item.id);
    expect(walletOf(data, 'card')).toHaveLength(1);
    data = emptyTrash(trashWalletItem(data, item.id));
    expect(data.wallet).toEqual([]);
  });

  it('are found by what a person remembers, a card by its last digits only', () => {
    const data = [CARD, ADDRESS, NOTE].reduce((next, draft) => addWalletItem(next, draft).data, emptyData());
    expect(searchWallet(data.wallet, 'visa').map((item) => item.kind)).toEqual(['card']);
    expect(searchWallet(data.wallet, '4242').map((item) => item.kind)).toEqual(['card']);
    expect(searchWallet(data.wallet, '4242424242424242')).toEqual([]);
    expect(searchWallet(data.wallet, 'ha noi').map((item) => item.kind)).toEqual(['address']);
    expect(searchWallet(data.wallet, 'home-network').map((item) => item.kind)).toEqual(['note']);
  });

  it('are named from what they hold when their owner gave no name', () => {
    expect(walletTitle(addWalletItem(emptyData(), CARD).item)).toBe('Visa •••• 4242');
    expect(walletTitle(addWalletItem(emptyData(), { ...ADDRESS, title: '' }).item)).toBe('Nguyễn Văn An');
    expect(walletTitle(addWalletItem(emptyData(), { ...NOTE, title: '' }).item)).toBe('');
  });
});

describe('a card', () => {
  it('is known by its network from its first digits', () => {
    const cases: [string, string | null][] = [
      ['4111111111111111', 'visa'],
      ['5555555555554444', 'mastercard'],
      ['2223003122003222', 'mastercard'],
      ['378282246310005', 'amex'],
      ['3530111333300000', 'jcb'],
      ['6011111111111117', 'discover'],
      ['6200000000000005', 'unionpay'],
      ['36227206271667', 'diners'],
      ['9704000000000018', 'napas'],
      ['1234567890123456', null],
    ];
    for (const [number, network] of cases) expect(cardNetwork(number), number).toBe(network);
  });

  it('says when a number has a digit wrong', () => {
    expect(cardNumberLooksRight('4242424242424242')).toBe(true);
    expect(cardNumberLooksRight('4242424242424241')).toBe(false);
    expect(cardNumberLooksRight('4242')).toBe(false);
    // Napas numbers do not all carry the check digit: no false alarm on them.
    expect(cardNumberLooksRight('9704000000000019')).toBe(true);
  });

  it('is shown as printed, and works to the end of its month', () => {
    expect(cardGroups('378282246310005')).toEqual(['3782', '822463', '10005']);
    expect(cardGroups('4242424242424242')).toEqual(['4242', '4242', '4242', '4242']);
    expect(cardExpiry({ expMonth: 8, expYear: 2029 })).toBe('08/29');
    expect(cardExpiry({ expMonth: null, expYear: 2029 })).toBe('');
    const card = { expMonth: 2, expYear: 2028 };
    expect(cardExpired(card, new Date(2028, 1, 29, 23, 59).getTime())).toBe(false);
    expect(cardExpired(card, new Date(2028, 2, 1, 0, 0).getTime())).toBe(true);
    expect(cardExpired({ expMonth: null, expYear: null })).toBe(false);
  });
});

describe('a name split for a form that asks for two parts', () => {
  it('puts a Vietnamese family name first, accents or not, and others last', () => {
    expect(splitName('Nguyễn Văn An')).toEqual({ family: 'Nguyễn', given: 'Văn An' });
    expect(splitName('Dang Thi Mai')).toEqual({ family: 'Dang', given: 'Thi Mai' });
    expect(splitName('Đặng Thị Mai')).toEqual({ family: 'Đặng', given: 'Thị Mai' });
    expect(splitName('Mary Jane Watson')).toEqual({ family: 'Watson', given: 'Mary Jane' });
    expect(splitName('Prince')).toEqual({ family: '', given: 'Prince' });
  });
});

describe('the wallet in the account', () => {
  const record = async (key: CryptoKey, item: WalletItem, rev: number): Promise<RemoteRecord> => ({
    id: item.id,
    kind: WALLET_KIND,
    serverRev: rev,
    rev,
    deleted: false,
    updatedAt: item.updatedAt,
    deviceId: 'other',
    box: await sealWalletItem(key, item, rev),
  });

  it('opens only as what it was sealed as: a card is never read as a login, nor a login as a card', async () => {
    const key = await recordsKey(await generateDataKey());
    const card = addWalletItem(emptyData(), CARD).item;
    const sealed = await record(key, card, 2);
    expect((await openWalletItem(key, sealed))?.kind).toBe('card');
    expect(await openWalletItem(key, { ...sealed, rev: 3 })).toBeNull();
    // A Passhold from before the wallet, or a server that relabels the record: nothing opens.
    expect(await openLogin(key, sealed)).toBeNull();
    expect(await openLogin(key, { ...sealed, kind: RECORD_KIND })).toBeNull();
    expect(JSON.stringify(sealed)).not.toContain('4242');
  });

  it('goes up, comes down on another device, and leaves it when deleted for good — as the kind of record it was', async () => {
    const key = await recordsKey(await generateDataKey());
    let here = addWalletItem(addWalletItem(emptyData(), CARD).data, NOTE).data;
    const plan = await planPush(here, {}, key, 'me');
    expect(plan.records.map((entry) => entry.kind)).toEqual([WALLET_KIND, WALLET_KIND]);
    const known = acceptPushed({}, plan, plan.records.map(({ id, rev }) => ({ id, rev })));
    expect(Object.values(known).every((entry) => entry.kind === 'wallet')).toBe(true);
    expect((await planPush(here, known, key, 'me')).records).toEqual([]);

    // Another device takes both in.
    const there = await applyPulled(emptyData(), {}, plan.records.map((entry) => ({ ...entry, serverRev: 1 })), key);
    expect(there.data.wallet.map((item) => item.kind).sort()).toEqual(['card', 'note']);

    // Deleted for good here, the card goes up as a deletion of a wallet record, not of a login.
    const card = here.wallet.find((item) => item.kind === 'card')!;
    here = purgeWalletItem(trashWalletItem(here, card.id), card.id);
    const gone = await planPush(here, known, key, 'me');
    expect(gone.records.map((entry) => [entry.id, entry.kind, entry.deleted])).toEqual([[card.id, WALLET_KIND, true]]);
    const after = await applyPulled(there.data, there.known, gone.records.map((entry) => ({ ...entry, serverRev: 2 })), key);
    expect(after.removed).toBe(1);
    expect(after.data.wallet.map((item) => item.kind)).toEqual(['note']);
  });

  it('keeps the newer edit, and no change at all is seen as none', async () => {
    const key = await recordsKey(await generateDataKey());
    const { data, item } = addWalletItem(emptyData(), CARD, 1_000);
    const known = { [item.id]: { rev: 1, sig: await walletSig(item), kind: 'wallet' as const } };
    const newer = updateWalletItem(data, item.id, { ...CARD, code: '999' }, 2_000).wallet[0]!;
    const older = updateWalletItem(data, item.id, { ...CARD, code: '000' }, 500).wallet[0]!;
    const pulled = await applyPulled(data, known, [await record(key, newer, 2)], key);
    expect(pulled.data.wallet[0]).toMatchObject({ code: '999' });
    const stale = await applyPulled(pulled.data, pulled.known, [await record(key, older, 3)], key);
    expect(stale.data.wallet[0]).toMatchObject({ code: '999' });
    // A favourite is a change all the same.
    expect((await planPush(setWalletFavorite(data, item.id, true), known, key, 'me')).records).toHaveLength(1);
  });
});

describe('the wallet in a backup', () => {
  it('comes back with the vault, joins one that has some of it, and twice changes nothing', async () => {
    const vault = await createVault('correct horse battery', newKdfParams(100_000));
    const data = [CARD, ADDRESS, NOTE].reduce((next, draft) => addWalletItem(next, draft).data, vault.data);
    const text = backupText(await sealVault(vault.file, vault.dataKey, markBackedUp(data)));
    expect(text).not.toContain('4242');
    expect(text).not.toContain('Lý Thường Kiệt');
    const backup = (await openBackup(text, 'correct horse battery')).data;
    expect(backup.wallet).toHaveLength(3);

    const here = addWalletItem(emptyData(), NOTE).data;
    const merged = mergeBackup(here, backup);
    // The note was already here, written the same: one note, not two.
    expect([merged.added, merged.data.wallet.length]).toEqual([2, 3]);
    const again = mergeBackup(merged.data, backup);
    expect([again.added, again.updated]).toEqual([0, 0]);
  });

  it('is due again once a card changed since the last one', () => {
    const backedUp = markBackedUp(addWalletItem(emptyData(), CARD, 1_000).data, 2_000);
    const later = 2_000 + 31 * 24 * 60 * 60 * 1000;
    expect(checkup(backedUp, later).backup).toBe('ok');
    expect(checkup(addWalletItem(backedUp, NOTE, 3_000).data, later).backup).toBe('due');
    expect(checkup(addWalletItem(emptyData(), CARD).data).backup).toBe('never');
  });
});

describe('what a checkout sent', () => {
  const SENT_CARD = { holder: 'NGUYEN VAN AN', number: '4242424242424242', expMonth: 8, expYear: 2029, code: '123' };
  const SENT_ADDRESS = { name: 'Nguyễn Văn An', street: '12 Lý Thường Kiệt', city: 'Hà Nội', country: 'Viet Nam', phone: '', email: '', organization: '', region: '', postalCode: '' };

  it('is a card only when its number adds up, and an address only with a street', () => {
    expect(sentCard(SENT_CARD)).toMatchObject({ kind: 'card', number: '4242424242424242', code: '123' });
    // One digit wrong: offering to save it would fill the slip in at every checkout after.
    expect(sentCard({ ...SENT_CARD, number: '4242424242424241' })).toBeNull();
    expect(sentCard({ ...SENT_CARD, number: '4242' })).toBeNull();
    for (const junk of [null, 'card', 42]) expect(sentCard(junk)).toBeNull();
    expect(sentAddress(SENT_ADDRESS)).toMatchObject({ kind: 'address', country: 'VN', street: '12 Lý Thường Kiệt' });
    expect(sentAddress({ ...SENT_ADDRESS, street: '  ' })).toBeNull();
  });

  it('names a country by its code, or by its name in English or Vietnamese', () => {
    expect(['vn', 'VN', 'Vietnam', 'Việt Nam', 'viet nam', 'United States', 'Hoa Kỳ'].map(countryCode)).toEqual(['VN', 'VN', 'VN', 'VN', 'VN', 'US', 'US']);
    expect(['', 'Atlantis', 'XX', 7].map(countryCode)).toEqual(['', '', '', '']);
  });

  it('is new, the card the vault has, or a newer copy of it — and a field left empty is no change', () => {
    const { data, item } = addWalletItem(emptyData(), CARD);
    const sent = sentCard(SENT_CARD)!;
    expect(judgeSentCard(emptyData(), sent)).toEqual({ kind: 'new' });
    expect(judgeSentCard(data, sent)).toEqual({ kind: 'known' });
    expect(judgeSentCard(data, { ...sent, code: '', holder: '', expMonth: null })).toEqual({ kind: 'known' });
    expect(judgeSentCard(data, { ...sent, holder: 'nguyen van an' })).toEqual({ kind: 'known' });
    expect(judgeSentCard(data, { ...sent, expYear: 2031 })).toMatchObject({ kind: 'update', item: { id: item.id } });
    // One in the trash is not one the vault keeps: a new card it is.
    expect(judgeSentCard(trashWalletItem(data, item.id), sent)).toEqual({ kind: 'new' });
  });

  it('knows an address by its street and name, accents or not', () => {
    const data = addWalletItem(emptyData(), ADDRESS).data;
    expect(judgeSentAddress(data, sentAddress(SENT_ADDRESS)!)).toBe('known');
    expect(judgeSentAddress(data, sentAddress({ ...SENT_ADDRESS, street: '12 Ly Thuong Kiet', name: '' })!)).toBe('known');
    expect(judgeSentAddress(data, sentAddress({ ...SENT_ADDRESS, name: 'Trần Thị Bình' })!)).toBe('new');
    expect(judgeSentAddress(data, sentAddress({ ...SENT_ADDRESS, street: '1 Tràng Tiền' })!)).toBe('new');
  });

  it('goes in as a new card and address, or takes what changed and keeps its name and notes', () => {
    const saved = saveSent(emptyData(), { card: sentCard(SENT_CARD), address: sentAddress(SENT_ADDRESS) }, 1_000);
    expect(saved.wallet.map((item) => item.kind).sort()).toEqual(['address', 'card']);
    // Saved twice, nothing doubles.
    expect(saveSent(saved, { card: sentCard(SENT_CARD), address: sentAddress(SENT_ADDRESS) }).wallet).toHaveLength(2);

    const named = addWalletItem(emptyData(), { ...CARD, title: 'Everyday', notes: 'PIN with the bank', code: '' }).data;
    const after = saveSent(named, { card: sentCard({ ...SENT_CARD, expYear: 2031, holder: '' }), address: null }, 2_000);
    expect(after.wallet).toHaveLength(1);
    expect(after.wallet[0]).toMatchObject({ title: 'Everyday', notes: 'PIN with the bank', holder: 'NGUYEN VAN AN', expYear: 2031, code: '123', updatedAt: 2_000 });
  });
});
