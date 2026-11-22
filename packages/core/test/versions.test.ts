import { describe, expect, it } from 'vitest';
import {
  addLogin,
  addWalletItem,
  cleanLogin,
  cleanWalletItem,
  emptyData,
  joinLogin,
  loginSig,
  PassholdError,
  planAllows,
  planFromBilling,
  plansOfferedFromBilling,
  readPlan,
  sanitiseData,
  restoreLoginVersion,
  restoreWalletVersion,
  setFavorite,
  trimVersions,
  updateLogin,
  updateWalletItem,
  VERSION_LIMITS,
  type LoginDraft,
} from '@passhold/core';

const LOGIN: LoginDraft = { title: 'Bank', username: 'alice', password: 'pw-1', urls: ['https://bank.example.com'], notes: '' };
const KEEP = { versions: true };

describe('every version of an item', () => {
  it('is kept only on a plan that holds it', () => {
    const { data, item } = addLogin(emptyData(), LOGIN, 1_000);
    expect(updateLogin(data, item.id, { ...LOGIN, password: 'pw-2' }, 2_000).items[0]!.versions).toBeUndefined();
    const kept = updateLogin(data, item.id, { ...LOGIN, password: 'pw-2' }, 2_000, KEEP).items[0]!;
    expect(kept.versions).toEqual([{ savedAt: 2_000, draft: { ...LOGIN, urls: ['https://bank.example.com/'], folder: '', fields: [] } }]);
    expect(['personal', 'family'].map((plan) => planAllows(readPlan(plan), 'versions'))).toEqual([false, false]);
    expect(['personal-premium', 'family-premium'].map((plan) => planAllows(readPlan(plan), 'versions'))).toEqual([true, true]);
    // A plan Passhold does not know of opens nothing.
    expect(planAllows(readPlan('enterprise'), 'versions')).toBe(false);
    // As GET /account/billing says it: paid, for oneself or through a family, or anything else, free.
    expect([{ personal: 'paid' }, { personal: 'free' }, {}, { personal: 'PAID' }].map((view) => planFromBilling(view))).toEqual(['personal-premium', 'personal', 'personal', 'personal']);
    // And kept on the account link across a lock, never anything but a plan Passhold knows.
    const link = { email: 'alice@example.test', deviceId: 'd', accountId: 'a', productKey: 'k', root: 'r' };
    expect(sanitiseData({ ...emptyData(), account: { ...link, plan: 'personal-premium' } }).account?.plan).toBe('personal-premium');
    expect(sanitiseData({ ...emptyData(), account: { ...link, plan: 'enterprise' } }).account?.plan).toBe('personal');
    expect(sanitiseData({ ...emptyData(), account: link }).account?.plan).toBeUndefined();
  });

  it('is offered for sale only when the server says it sells plans now, and in no other words', () => {
    // A server from before billing, one that cannot say, or one that says anything but yes: nothing is for sale.
    expect([{ offered: true }, { offered: false }, {}, { offered: 'true' }, { offered: 1 }].map((view) => plansOfferedFromBilling(view))).toEqual([true, false, false, false, false]);
    const link = { email: 'alice@example.test', deviceId: 'd', accountId: 'a', productKey: 'k', root: 'r' };
    expect(sanitiseData({ ...emptyData(), account: { ...link, plansOffered: true } }).account?.plansOffered).toBe(true);
    expect(sanitiseData({ ...emptyData(), account: { ...link, plansOffered: 'yes' } }).account?.plansOffered).toBeUndefined();
    expect(sanitiseData({ ...emptyData(), account: link }).account?.plansOffered).toBeUndefined();
  });

  it('is not made by an edit that changes nothing a version holds', () => {
    let { data, item } = addLogin(emptyData(), LOGIN, 1_000);
    data = updateLogin(data, item.id, { ...LOGIN }, 2_000, KEEP);
    data = setFavorite(data, item.id, true);
    expect(data.items[0]!.versions).toBeUndefined();
  });

  it('restores as an edit, so what the item was becomes a version in turn and its password goes into the history', () => {
    let { data, item } = addLogin(emptyData(), LOGIN, 1_000);
    data = updateLogin(data, item.id, { ...LOGIN, title: 'My bank', password: 'pw-2', notes: 'changed' }, 2_000, KEEP);
    data = restoreLoginVersion(data, item.id, 2_000, 3_000, KEEP);
    item = data.items[0]!;
    expect([item.title, item.password, item.notes]).toEqual(['Bank', 'pw-1', '']);
    expect(item.history[0]).toEqual({ password: 'pw-2', changedAt: 3_000 });
    expect(item.versions!.map((version) => [version.savedAt, version.draft.title])).toEqual([
      [3_000, 'My bank'],
      [2_000, 'Bank'],
    ]);
    expect(() => restoreLoginVersion(data, item.id, 42, 4_000, KEEP)).toThrow(PassholdError);
  });

  it('keeps a card’s, an address’s or a note’s the same way, never turning one into another', () => {
    const added = addWalletItem(emptyData(), { kind: 'note', title: 'Wi-Fi', text: 'first' }, 1_000);
    let data = updateWalletItem(added.data, added.item.id, { kind: 'note', title: 'Wi-Fi', text: 'second' }, 2_000, KEEP);
    data = restoreWalletVersion(data, added.item.id, 2_000, 3_000, KEEP);
    const note = data.wallet[0]!;
    expect(note.kind === 'note' && note.text).toBe('first');
    expect(note.versions!.map((version) => version.draft.kind === 'note' && version.draft.text)).toEqual(['second', 'first']);
  });

  it('reads what was kept as an item of its kind would be read, and nothing a version should not hold', () => {
    const read = cleanLogin({
      id: 'a',
      title: 'Bank',
      versions: [
        { savedAt: 5, draft: { title: 'Old', password: 'old', urls: ['javascript:alert(1)'], versions: [{ savedAt: 1, draft: { title: 'deeper' } }], passkey: { rpId: 'x' } } },
        { savedAt: -1, draft: { title: 'never' } },
        { savedAt: 6, draft: 'not a draft' },
      ],
    })!;
    expect(read.versions).toEqual([{ savedAt: 5, draft: { title: 'Old', username: '', password: 'old', urls: [], notes: '', folder: '', fields: [] } }]);
    // A card's version is a card's: one with another kind's content is not a version of it.
    const card = cleanWalletItem({ id: 'c', kind: 'card', number: '4242424242424242', versions: [{ savedAt: 5, draft: { kind: 'tank' } }] })!;
    expect(card.versions).toBeUndefined();
  });

  it('leaves an item from before versions to hash as it did, and joins both copies’ versions', async () => {
    const { item } = addLogin(emptyData(), LOGIN, 1_000);
    const read = cleanLogin(JSON.parse(JSON.stringify(item)))!;
    expect('versions' in read).toBe(false);
    expect(await loginSig(read)).toBe(await loginSig(item));
    const here = updateLogin({ ...emptyData(), items: [item] }, item.id, { ...LOGIN, title: 'Here' }, 2_000, KEEP).items[0]!;
    const there = updateLogin({ ...emptyData(), items: [item] }, item.id, { ...LOGIN, title: 'There' }, 3_000, KEEP).items[0]!;
    const joined = joinLogin(here, there);
    expect(joined.title).toBe('There');
    expect(joined.versions!.map((version) => version.savedAt)).toEqual([3_000, 2_000]);
    expect(joinLogin(here, here).versions).toEqual(here.versions);
  });

  it('holds the newest within its bounds', () => {
    const many = Array.from({ length: VERSION_LIMITS.count + 10 }, (_, n) => ({ savedAt: n + 1, draft: { text: 'x' } }));
    const kept = trimVersions(many);
    expect(kept).toHaveLength(VERSION_LIMITS.count);
    expect(kept[0]!.savedAt).toBe(VERSION_LIMITS.count + 10);
    const long = Array.from({ length: 10 }, (_, n) => ({ savedAt: n + 1, draft: { text: 'x'.repeat(200_000) } }));
    expect(trimVersions(long).length).toBeLessThan(10);
    expect(trimVersions(long).length).toBeGreaterThan(0);
  });
});
