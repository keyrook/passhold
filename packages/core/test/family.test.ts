import { describe, expect, it } from 'vitest';
import {
  acceptPushed,
  addLogin,
  addWalletItem,
  dropFamilyVaults,
  emptyData,
  emptyFamilyTrash,
  everyItem,
  inFamilyVault,
  loginSig,
  markUsed,
  mergeFamilyPulled,
  moveToFamily,
  PassholdError,
  placeOf,
  planFamilyPush,
  purgeFromFamily,
  planPush,
  purgeLogin,
  readDeparture,
  RECORD_KIND,
  recordsKey,
  generateDataKey,
  removedFromAccount,
  restoreLogin,
  sanitiseData,
  trashLogin,
  updateLogin,
  WALLET_KIND,
  whereItemIs,
  type FamilyLink,
  type FamilyPushPlan,
  type FamilyVault,
  type OpenedFamilyRecord,
  type VaultData,
} from '@passhold/core';

const ORG = 'family-1';
const SHARED = 'collection-1';
const place = { orgId: ORG, vaultId: SHARED };
const draft = (title: string, password = `${title}-Pass-123!`) => ({ title, username: 'alice', password, urls: [`https://${title.toLowerCase()}.test`], notes: '' });

const vault = (extra: Partial<FamilyVault> = {}): FamilyVault => ({ id: SHARED, name: 'Family', generation: 1, keyDue: false, items: [], wallet: [], known: {}, ...extra });

const family = (role: FamilyLink['role'], vaults: FamilyVault[] = [vault()]): FamilyLink => ({
  orgId: ORG,
  name: 'The Nguyens',
  role,
  members: [{ accountId: 'me', email: 'alice@example.test', name: 'Alice', role, verified: true }],
  pin: null,
  keyChanged: [],
  left: [],
  state: { kind: 'open' },
  rotationDue: false,
  serverRev: 0,
  epoch: null,
  vaults,
});

const withFamily = (role: FamilyLink['role'] = 'member', data: VaultData = emptyData()): VaultData => ({ ...data, families: [family(role)] });

const code = (run: () => unknown) => {
  try {
    run();
  } catch (error) {
    return error instanceof PassholdError ? error.code : `other: ${String(error)}`;
  }
  return 'returned';
};

/**
 * What the family flows hand back for what this browser planned: each change
 * sealed, then opened again on another browser of the family, the value as it
 * went in. Passhold's deletions are sealed values in live records.
 */
const delivered = (plan: FamilyPushPlan, extra: Partial<OpenedFamilyRecord> = {}): OpenedFamilyRecord[] =>
  plan.records.map((change) => ({ id: change.id, kind: change.kind, collectionId: SHARED, rev: change.rev, deleted: false, value: change.value, stale: false, ...extra }));

const shared = (data: VaultData) => data.families[0]!.vaults[0]!;

describe('a family’s shared vault in the vault', () => {
  it('is read back as kept, and what does not read right is dropped, never half kept', () => {
    const kept = withFamily('owner', addLogin(emptyData(), draft('Mail')).data);
    const read = sanitiseData(JSON.parse(JSON.stringify(kept)));
    expect(read.families).toEqual(kept.families);
    // Held back only where it says so: the server refuses the rest anyway.
    const [one] = kept.families;
    const due = sanitiseData(JSON.parse(JSON.stringify({ ...kept, families: [{ ...one, vaults: [{ ...one!.vaults[0], keyDue: true }, { ...vault(), id: 'other', keyDue: 'yes' }] }] })));
    expect(due.families[0]!.vaults.map((entry) => entry.keyDue)).toEqual([true, false]);

    const junk = sanitiseData({
      items: [],
      families: [
        { ...family('owner'), orgId: '' },
        { ...family('member'), role: 'admin', vaults: [{ id: 'v', name: '', items: [] }, { ...vault(), items: [{ nonsense: true }] }] },
        { ...family('member'), name: 'A second copy' },
      ],
    });
    expect(junk.families).toHaveLength(1);
    // A role it does not know is a member's, which empties no trash.
    expect(junk.families[0]!.role).toBe('member');
    expect(junk.families[0]!.vaults.map((entry) => [entry.id, entry.items.length])).toEqual([[SHARED, 0]]);
  });

  it('is changed as the vault’s own is: an edit keeps the password before, a deletion goes to its trash', () => {
    let data = inFamilyVault(withFamily(), place, (entry) => addLogin(entry, draft('Router', 'first-Pass-1!')).data);
    const id = shared(data).items[0]!.id;
    data = inFamilyVault(data, place, (entry) => updateLogin(entry, id, draft('Router', 'second-Pass-2!')));
    expect(shared(data).items[0]!.history.map((entry) => entry.password)).toEqual(['first-Pass-1!']);
    data = inFamilyVault(data, place, (entry) => trashLogin(entry, id));
    expect(shared(data).items[0]!.deletedAt).not.toBeNull();
    data = inFamilyVault(data, place, (entry) => restoreLogin(entry, id));
    expect(shared(data).items[0]!.deletedAt).toBeNull();
    // The vault's own is untouched by any of it.
    expect(data.items).toEqual([]);
    expect(code(() => inFamilyVault(data, { orgId: ORG, vaultId: 'gone' }, (entry) => entry))).toBe('itemNotFound');
  });

  it('has its trash emptied by an organiser only', () => {
    const trashed = (role: FamilyLink['role']) => {
      const data = inFamilyVault(withFamily(role), place, (entry) => addLogin(entry, draft('Router')).data);
      return inFamilyVault(data, place, (entry) => trashLogin(entry, entry.items[0]!.id));
    };
    expect(code(() => emptyFamilyTrash(trashed('member'), place))).toBe('familyOrganiserOnly');
    // Nor one item at a time around the rule.
    const asMember = trashed('member');
    expect(code(() => purgeFromFamily(asMember, place, shared(asMember).items[0]!.id))).toBe('familyOrganiserOnly');
    expect(shared(emptyFamilyTrash(trashed('owner'), place)).items).toEqual([]);
    const asOrganiser = trashed('owner');
    expect(shared(purgeFromFamily(asOrganiser, place, shared(asOrganiser).items[0]!.id)).items).toEqual([]);
  });
});

describe('someone gone from a family', () => {
  const stored = (left: unknown) => {
    const { left: _, ...before } = family('member');
    return { ...emptyData(), families: [left === undefined ? before : { ...before, left }] };
  };

  it('reads a vault from before there were any as holding none', () => {
    expect(sanitiseData(stored(undefined)).families[0]!.left).toEqual([]);
    expect(sanitiseData(stored('Lan')).families[0]!.left).toEqual([]);
  });

  it('keeps the person when their name does not read right, and drops only what names nobody', () => {
    const lan = { accountId: 'lan', email: 'lan@example.test', name: 'Lan' };
    const read = sanitiseData(stored([lan, lan, { accountId: 'hoa', email: 7, name: {} }, { email: 'nobody@example.test' }, 'junk']));
    expect(read.families[0]!.left).toEqual([lan, { accountId: 'hoa', email: '', name: null }]);
  });

  it('is read one person at a time, in one family only', () => {
    const lan = { accountId: 'lan', email: 'lan@example.test', name: null };
    const hoa = { accountId: 'hoa', email: 'hoa@example.test', name: null };
    const data = { ...emptyData(), families: [{ ...family('member'), left: [lan, hoa] }, { ...family('member'), orgId: 'family-2', left: [lan] }] };
    const read = readDeparture(data, ORG, 'lan');
    expect(read.families.map((entry) => entry.left)).toEqual([[hoa], [lan]]);
    // A family gone meanwhile, or someone already read, changes nothing.
    expect(readDeparture(read, 'gone', 'lan').families).toEqual(read.families);
    expect(readDeparture(read, ORG, 'lan').families).toEqual(read.families);
  });
});

describe('filling from a shared vault', () => {
  it('offers its items beside the vault’s own, and marks one used where it is', () => {
    let data = withFamily('member', addLogin(emptyData(), draft('Mine')).data);
    data = inFamilyVault(data, place, (entry) => addLogin(entry, draft('Shared')).data);
    expect(everyItem(data).items.map((item) => item.title)).toEqual(['Mine', 'Shared']);
    const id = shared(data).items[0]!.id;
    expect(placeOf(data, id)).toEqual(place);
    expect(placeOf(data, data.items[0]!.id)).toBeNull();
    expect(placeOf(data, 'nowhere')).toBeUndefined();

    const used = whereItemIs(data, id, (items) => markUsed(items, id, 9_000));
    expect(shared(used).items[0]!.lastUsedAt).toBe(9_000);
    expect(used.items[0]!.lastUsedAt).toBeNull();
    expect(whereItemIs(data, 'nowhere', (items) => markUsed(items, 'nowhere'))).toBe(data);
  });

  it('never shows a shared item twice under an id the vault’s own holds', () => {
    let data = withFamily('member', addLogin(emptyData(), draft('Mine')).data);
    const mine = data.items[0]!;
    data = inFamilyVault(data, place, (entry) => ({ ...entry, items: [{ ...mine, title: 'Impostor' }] }));
    expect(everyItem(data).items.map((item) => item.title)).toEqual(['Mine']);
  });
});

describe('moving into a shared vault', () => {
  it('takes the login out of the vault’s own, under a new id, without its earlier passwords or folder', () => {
    let data = withFamily('member', addLogin(emptyData(), { ...draft('Bank', 'first-Pass-1!'), folder: 'Money', fields: [{ name: 'PIN', value: '2468', hidden: true }] }).data);
    const own = data.items[0]!;
    data = updateLogin(data, own.id, { ...draft('Bank', 'second-Pass-2!'), folder: 'Money' });
    const moved = moveToFamily(data, own.id, place, 5_000);
    expect(moved.data.items).toEqual([]);
    const there = shared(moved.data).items[0]!;
    expect(there.id).toBe(moved.id);
    expect(there.id).not.toBe(own.id);
    expect([there.password, there.history, there.folder, there.fields]).toEqual(['second-Pass-2!', [], '', [{ name: 'PIN', value: '2468', hidden: true }]]);
  });

  it('is said to the account as the login leaving the vault, so no other browser keeps a copy', async () => {
    const key = await recordsKey(await generateDataKey());
    const data = withFamily('member', addLogin(emptyData(), draft('Bank')).data);
    const own = data.items[0]!;
    const known = { [own.id]: { rev: 3, sig: await loginSig(own) } };
    const plan = await planPush(moveToFamily(data, own.id, place).data, known, key, 'me');
    expect(plan.records.map((record) => [record.id, record.rev, record.deleted])).toEqual([[own.id, 4, true]]);
  });

  it('refuses what is in the trash, or a shared vault the family does not list', () => {
    const data = withFamily('member', addWalletItem(emptyData(), { kind: 'note', title: 'Wi-Fi', text: 'the password' }).data);
    const note = data.wallet[0]!.id;
    expect(shared(moveToFamily(data, note, place).data).wallet.map((item) => item.title)).toEqual(['Wi-Fi']);
    expect(code(() => moveToFamily(data, note, { orgId: ORG, vaultId: 'another' }))).toBe('itemNotFound');
    const inTrash = addLogin(withFamily(), draft('Old')).data;
    expect(code(() => moveToFamily(trashLogin(inTrash, inTrash.items[0]!.id), inTrash.items[0]!.id, place))).toBe('itemInvalid');
  });
});

describe('a shared vault’s records', () => {
  const twoBrowsers = async () => {
    const here = inFamilyVault(withFamily(), place, (entry) => addLogin(addWalletItem(entry, { kind: 'note', title: 'Wi-Fi', text: 'the password' }).data, draft('Router')).data);
    const plan = await planFamilyPush(shared(here), {});
    return { here, plan, records: delivered(plan) };
  };

  it('come into another browser of the family as they went up, and nothing goes back', async () => {
    const { here, plan, records } = await twoBrowsers();
    expect(plan.records.map((change) => [change.kind, change.rev, (change.value as { kind: string }).kind])).toEqual([
      [RECORD_KIND, 1, RECORD_KIND],
      [WALLET_KIND, 1, WALLET_KIND],
    ]);
    const there = await mergeFamilyPulled(vault(), records);
    expect(there.vault.items.map((item) => item.title)).toEqual(['Router']);
    expect(there.vault.wallet.map((item) => item.title)).toEqual(['Wi-Fi']);
    expect(there.vault.items[0]!.id).toBe(shared(here).items[0]!.id);
    expect((await planFamilyPush(there.vault, there.vault.known)).records).toEqual([]);

    // Taken by the server: known at the revision it took, so nothing goes up again.
    const known = acceptPushed({}, plan, plan.records.map(({ id, rev }) => ({ id, rev })));
    expect((await planFamilyPush(shared(here), known)).records).toEqual([]);
  });

  it('never open as another kind, whatever the server labels them, nor as another record', async () => {
    const { records } = await twoBrowsers();
    const login = records.find((record) => record.kind === RECORD_KIND)!;
    const note = records.find((record) => record.kind === WALLET_KIND)!;
    const tries: OpenedFamilyRecord[] = [
      // A note's value under a login's label, and a login's under a note's.
      { ...note, kind: RECORD_KIND },
      { ...login, kind: WALLET_KIND },
      // A login's value handed back as another login.
      { ...login, id: 'another' },
      // A value of no kind of Passhold's.
      { ...login, value: (login.value as { item: unknown }).item },
    ];
    for (const record of tries) {
      const pulled = await mergeFamilyPulled(vault(), [record]);
      expect([pulled.vault.items.length, pulled.vault.wallet.length, pulled.skipped], `${record.kind} ${record.id}`).toEqual([0, 0, 1]);
    }
    // Another collection's records are not this vault's to take at all.
    const elsewhere = await mergeFamilyPulled(vault(), [{ ...login, collectionId: 'other' }]);
    expect([elsewhere.vault.items.length, elsewhere.skipped]).toEqual([0, 0]);
  });

  it('are taken away only by a deletion sealed for them, never by the server’s flag, as the flows hand it on', async () => {
    const { records } = await twoBrowsers();
    const there = (await mergeFamilyPulled(vault(), records)).vault;
    const login = records.find((record) => record.kind === RECORD_KIND)!;

    // The flows open any record the server flags as deleted, with nothing in it.
    const flagged = await mergeFamilyPulled(there, [{ ...login, rev: 2, deleted: true, value: null }]);
    expect([flagged.vault.items.length, flagged.removed]).toEqual([1, 0]);
    // And it goes up again over the server's deletion.
    expect((await planFamilyPush(flagged.vault, flagged.vault.known)).records.map((change) => [change.rev, 'item' in change.value])).toEqual([[3, true]]);

    // A deletion from a browser of the family that holds the key: sealed, as a value.
    const gone = inFamilyVault({ ...emptyData(), families: [family('owner', [there])] }, place, (entry) => deleteForGood(entry, login.id));
    const plan = await planFamilyPush(shared(gone), there.known);
    expect(plan.records.map((change) => [change.id, change.rev, change.value])).toEqual([[login.id, 2, { kind: RECORD_KIND, id: login.id, deleted: true }]]);
    const taken = await mergeFamilyPulled(there, delivered(plan));
    expect([taken.vault.items.length, taken.removed]).toEqual([0, 1]);

    // Sealed for one record, it deletes no other: not under another id, nor as another kind.
    const { data: withMail, item: mail } = addLogin(there, draft('Mail'));
    const moved = await mergeFamilyPulled(withMail, delivered(plan, { id: mail.id, rev: 1 }));
    expect([moved.vault.items.map((item) => item.title).sort(), moved.removed]).toEqual([['Mail', 'Router'], 0]);
    const relabelled = await mergeFamilyPulled(there, delivered(plan, { kind: WALLET_KIND }));
    expect([relabelled.vault.items.length, relabelled.removed]).toEqual([1, 0]);
  });

  it('that the flows could not read are never taken, but one over an item held here is written over by it', async () => {
    const { records } = await twoBrowsers();
    const there = (await mergeFamilyPulled(vault(), records)).vault;
    const login = records.find((record) => record.kind === RECORD_KIND)!;
    // The server's deletion of the login, or a record sealed under a key this browser does not hold.
    for (const deleted of [true, false]) {
      const blind = await mergeFamilyPulled(there, [], [{ id: login.id, kind: RECORD_KIND, collectionId: SHARED, rev: 2, deleted }]);
      expect([blind.vault.items.length, blind.removed, blind.skipped]).toEqual([1, 0, 1]);
      expect((await planFamilyPush(blind.vault, blind.vault.known)).records.map((change) => [change.id, change.rev])).toEqual([[login.id, 3]]);
    }
    // One this browser holds nothing of is left alone; another collection's is not this vault's.
    const elsewhere = await mergeFamilyPulled(there, [], [
      { id: 'unknown', kind: RECORD_KIND, collectionId: SHARED, rev: 1, deleted: false },
      { id: login.id, kind: RECORD_KIND, collectionId: 'other', rev: 5, deleted: false },
    ]);
    expect(elsewhere.vault.known).toEqual(there.known);
    expect((await planFamilyPush(elsewhere.vault, elsewhere.vault.known)).records).toEqual([]);
  });

  it('opened under a key from before the one in use are taken, and go up again under it', async () => {
    const { records } = await twoBrowsers();
    const pulled = await mergeFamilyPulled(vault(), records.map((record) => ({ ...record, stale: true })));
    expect(pulled.vault.items).toHaveLength(1);
    expect((await planFamilyPush(pulled.vault, pulled.vault.known)).records.map((change) => [change.rev, 'item' in change.value])).toEqual([
      [2, true],
      [2, true],
    ]);
  });
});

describe('a shared vault no longer listed', () => {
  it('goes, but what this browser added or changed and never sent stays, in the vault’s own', async () => {
    let data = inFamilyVault(withFamily(), place, (entry) => addLogin(addLogin(entry, draft('Sent')).data, draft('Changed')).data);
    const plan = await planFamilyPush(shared(data), {});
    data = inFamilyVault(data, place, (entry) => ({ ...entry, known: acceptPushed({}, plan, plan.records.map(({ id, rev }) => ({ id, rev }))) }));
    const changed = shared(data).items.find((item) => item.title === 'Changed')!;
    data = inFamilyVault(data, place, (entry) => updateLogin(entry, changed.id, draft('Changed', 'edited-Here-3!')));
    data = inFamilyVault(data, place, (entry) => addWalletItem(entry, { kind: 'note', title: 'Never sent', text: 'x' }).data);

    const left = await dropFamilyVaults(data, () => false);
    expect(left.families[0]!.vaults).toEqual([]);
    expect(left.items.map((item) => [item.title, item.password])).toEqual([['Changed', 'edited-Here-3!']]);
    expect(left.wallet.map((item) => item.title)).toEqual(['Never sent']);
    expect(await dropFamilyVaults(data, () => true)).toEqual(data);
  });

  it('keeps an id of the vault’s own as it was: what comes back from a family takes another', async () => {
    let data = addLogin(emptyData(), draft('Mine')).data;
    const mine = data.items[0]!;
    data = { ...data, families: [family('member', [vault({ items: [{ ...mine, title: 'Theirs' }] })])] };
    const left = await dropFamilyVaults(data, () => false);
    expect(left.items.map((item) => item.title)).toEqual(['Mine', 'Theirs']);
    expect(new Set(left.items.map((item) => item.id)).size).toBe(2);
    expect(left.items[0]!.id).toBe(mine.id);
  });

  it('goes with the account when this browser is removed from it', async () => {
    const data = inFamilyVault(addLogin(withFamily(), draft('Mine')).data, place, (entry) => addLogin(entry, draft('Unsent')).data);
    const account = sanitiseData({ items: [], account: { email: 'a@example.test', deviceId: 'd', accountId: 'acc', productKey: 'k'.repeat(44) } }).account!;
    const after = await removedFromAccount({ ...data, account }, 1_790_000_000_000);
    expect(after.families).toEqual([]);
    expect(after.items.map((item) => item.title).sort()).toEqual(['Mine', 'Unsent']);
  });
});

/** A login deleted for good in a shared vault, as its organiser's browser does: to the trash, then out of it. */
function deleteForGood(entry: FamilyVault, id: string): FamilyVault {
  return purgeLogin(trashLogin(entry, id), id);
}
