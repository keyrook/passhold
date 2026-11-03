import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import {
  acceptPushed,
  addLogin,
  addWalletItem,
  applyPulled,
  cleanFields,
  cleanFolder,
  cleanLogin,
  emptyData,
  folderCounts,
  generateDataKey,
  importBitwardenJson,
  importCsv,
  importLogins,
  LIMITS,
  loginSig,
  mergeBackup,
  openLogin,
  planPush,
  recordsKey,
  renameFolder,
  sanitiseData,
  searchLogins,
  searchWallet,
  sealLogin,
  trashLogin,
  updateLogin,
  updateWalletItem,
  walletSig,
  RECORD_KIND,
  type LoginDraft,
  type LoginItem,
  type VaultData,
} from '@passhold/core';

const PIN = { name: 'PIN', value: '4321', hidden: true };
const QUESTION = { name: 'First school', value: 'Chu Văn An', hidden: false };
const LOGIN: LoginDraft = { title: 'Bank', username: 'alice', password: 'pw-1', urls: ['https://bank.example.com'], notes: '' };
const NOTE = { kind: 'note' as const, title: 'Wi-Fi', text: 'home-network' };

describe('a folder and fields of its owner’s own', () => {
  it('are kept with a login, and an edit that leaves them out keeps them — a password saved from a page changes the password alone', () => {
    const { data, item } = addLogin(emptyData(), { ...LOGIN, folder: 'Banks', fields: [PIN, QUESTION] });
    expect(item).toMatchObject({ folder: 'Banks', fields: [PIN, QUESTION] });
    // What the worker sends when a sign-in on the page gives a new password.
    const saved = updateLogin(data, item.id, { title: item.title, username: item.username, password: 'pw-2', urls: item.urls, notes: item.notes }).items[0]!;
    expect(saved).toMatchObject({ password: 'pw-2', folder: 'Banks', fields: [PIN, QUESTION] });
    // Its owner's edit says what they now are, none included.
    const cleared = updateLogin(data, item.id, { ...LOGIN, folder: '', fields: [] }).items[0]!;
    expect(cleared).toMatchObject({ folder: '', fields: [] });
  });

  it('are kept with a card, an address or a note, and a note of fields alone is something to keep', () => {
    const { data, item } = addWalletItem(emptyData(), { ...NOTE, folder: 'Home', fields: [PIN] });
    expect(item).toMatchObject({ folder: 'Home', fields: [PIN] });
    expect(updateWalletItem(data, item.id, { ...NOTE, text: 'changed' }).wallet[0]).toMatchObject({ text: 'changed', folder: 'Home', fields: [PIN] });
    expect(addWalletItem(emptyData(), { kind: 'note', title: '', text: '', fields: [PIN] }).item.fields).toEqual([PIN]);
  });

  it('files a folder typed in another case into the one already there, but lets a folder’s only item fix its case', () => {
    let data = addLogin(emptyData(), { ...LOGIN, folder: 'Work' }).data;
    const second = addLogin(data, { ...LOGIN, username: 'bob', folder: '  work ' });
    expect(second.item.folder).toBe('Work');
    data = addWalletItem(second.data, { ...NOTE, folder: 'WORK' }).data;
    expect(folderCounts(data)).toEqual(new Map([['Work', 3]]));

    const alone = addLogin(emptyData(), { ...LOGIN, folder: 'banks' });
    expect(updateLogin(alone.data, alone.item.id, { ...LOGIN, folder: 'Banks' }).items[0]!.folder).toBe('Banks');
  });

  it('reads a folder from storage or a file as one line of text a page may show, and nothing more', () => {
    expect(cleanFolder('Work\nPersonal')).toBe('Work Personal');
    // A direction override would turn the words after it around on the page.
    expect(cleanFolder('Ban‮ks​')).toBe('Banks');
    expect(cleanFolder('a'.repeat(5_000))).toHaveLength(LIMITS.folder);
    expect(cleanFolder({ toString: () => 'Work' })).toBe('');
    // The joiners some scripts are written with stay.
    expect(cleanFolder('क्‍ष')).toBe('क्‍ष');
  });

  it('reads fields from storage or a file as what they say, an empty one dropped, and only so many', () => {
    expect(
      cleanFields([
        { name: 'PIN', value: '1234', hidden: 'yes' },
        { name: '', value: '' },
        { name: 'Line\none', value: 'kept\nas typed', hidden: true, extra: 'dropped' },
        'not a field',
        null,
        { name: 7, value: ['x'] },
      ]),
    ).toEqual([
      // Only `true` hides: a file that says "yes" shows the value rather than claim to keep it out of sight.
      { name: 'PIN', value: '1234', hidden: false },
      { name: 'Line one', value: 'kept\nas typed', hidden: true },
    ]);
    expect(cleanFields('PIN: 1234')).toEqual([]);
    const many = cleanFields(Array.from({ length: 500 }, (_, index) => ({ name: `f${index}`, value: 'v'.repeat(50_000) })));
    expect(many).toHaveLength(LIMITS.fields);
    expect(many[0]!.value).toHaveLength(LIMITS.fieldValue);
  });

  it('opens a vault from before folders and fields as having none', () => {
    const { item } = addLogin(emptyData(), LOGIN);
    const { folder: _, fields: __, ...before } = item;
    expect(sanitiseData({ items: [before], wallet: [] }).items[0]).toMatchObject({ folder: '', fields: [] });
    expect(cleanLogin({ ...before, folder: 42, fields: { name: 'x' } })).toMatchObject({ folder: '', fields: [] });
  });

  it('finds an item by its folder and by what its fields show, never by a value kept out of sight', () => {
    const login = addLogin(emptyData(), { ...LOGIN, folder: 'Ngân hàng', fields: [PIN, QUESTION] }).item;
    expect(searchLogins([login], 'ngan hang')).toHaveLength(1);
    expect(searchLogins([login], 'chu van an')).toHaveLength(1);
    expect(searchLogins([login], 'first school')).toHaveLength(1);
    expect(searchLogins([login], 'pin')).toHaveLength(1);
    expect(searchLogins([login], '4321')).toHaveLength(0);

    const note = addWalletItem(emptyData(), { ...NOTE, folder: 'Nhà', fields: [PIN] }).item;
    expect(searchWallet([note], 'nha')).toHaveLength(1);
    expect(searchWallet([note], '4321')).toHaveLength(0);
  });
});

describe('a folder renamed', () => {
  const filed = (): VaultData => {
    let data = addLogin(emptyData(), { ...LOGIN, folder: 'Work' }, 1_000).data;
    data = addLogin(data, { ...LOGIN, username: 'bob', folder: 'Home' }, 1_000).data;
    data = addWalletItem(data, { ...NOTE, folder: 'Work' }, 1_000).data;
    const old = addLogin(data, { ...LOGIN, username: 'old', folder: 'Work' }, 1_000);
    return trashLogin(old.data, old.item.id, 1_000);
  };

  it('moves everything in it, the trash too, and each move is a change every device is sent', () => {
    const data = filed();
    const renamed = renameFolder(data, 'Work', 'Office', 2_000);
    const moved = [...renamed.items, ...renamed.wallet].filter((item) => item.folder === 'Office');
    expect(moved).toHaveLength(3);
    expect(moved.every((item) => item.updatedAt === 2_000)).toBe(true);
    // What was not in it is left as it was, its date with it.
    expect(renamed.items.find((item) => item.folder === 'Home')?.updatedAt).toBe(1_000);
  });

  it('into a folder already there becomes one with it, in the spelling that folder has', () => {
    const merged = renameFolder(filed(), 'Work', ' HOME ');
    expect(folderCounts(merged)).toEqual(new Map([['Home', 3]]));
  });

  it('to nothing takes the folder away and keeps what was in it', () => {
    const data = filed();
    const gone = renameFolder(data, 'Work', '');
    expect(gone.items).toHaveLength(data.items.length);
    expect(gone.wallet).toHaveLength(data.wallet.length);
    expect(folderCounts(gone)).toEqual(new Map([['Home', 1]]));
  });

  it('changes nothing when the name stays, or when there is no such folder', () => {
    const data = filed();
    expect(renameFolder(data, 'Work', 'Work')).toBe(data);
    expect(renameFolder(data, '', 'Anything')).toBe(data);
    expect(renameFolder(data, 'Nowhere', 'Anything').items).toEqual(data.items);
  });
});

describe('a folder and fields in the account', () => {
  const sha = (text: string) => createHash('sha256').update(text).digest('hex');

  it('leave a login from before them hashing as it did, so nothing is sent again for them', async () => {
    const { item } = addLogin(emptyData(), LOGIN);
    const { lastUsedAt: _, folder: __, fields: ___, ...before } = item;
    expect(await loginSig(item)).toBe(sha(JSON.stringify(before)));
    expect(await loginSig({ ...item, folder: 'Work' })).not.toBe(await loginSig(item));
  });

  it('see a field’s value change on a card, an address or a note, and send it', async () => {
    const key = await recordsKey(await generateDataKey());
    const { data, item } = addWalletItem(emptyData(), { ...NOTE, fields: [PIN] });
    const known = { [item.id]: { rev: 1, sig: await walletSig(item), kind: 'wallet' as const } };
    const changed = updateWalletItem(data, item.id, { ...NOTE, fields: [{ ...PIN, value: '9999' }] });
    expect(await walletSig(changed.wallet[0]!)).not.toBe(known[item.id]!.sig);
    expect((await planPush(changed, known, key, 'me')).records).toHaveLength(1);
    const hidden = updateWalletItem(data, item.id, { ...NOTE, fields: [{ ...PIN, hidden: false }] });
    expect((await planPush(hidden, known, key, 'me')).records).toHaveLength(1);
  });

  it('travel sealed, and arrive on another device as they left', async () => {
    const key = await recordsKey(await generateDataKey());
    const here = addLogin(emptyData(), { ...LOGIN, folder: 'Ngân hàng', fields: [PIN] }).data;
    const plan = await planPush(here, {}, key, 'me');
    const sealed = JSON.stringify(plan.records);
    for (const secret of ['Ngân hàng', '4321', 'PIN']) expect(sealed).not.toContain(secret);
    const there = await applyPulled(emptyData(), {}, plan.records.map((record) => ({ ...record, serverRev: 1 })), key);
    expect(there.data.items[0]).toMatchObject({ folder: 'Ngân hàng', fields: [PIN] });
    expect((await planPush(there.data, there.known, key, 'other')).records).toEqual([]);
    const known = acceptPushed({}, plan, plan.records.map(({ id, rev }) => ({ id, rev })));
    expect((await planPush(here, known, key, 'me')).records).toEqual([]);
  });

  it('come back through a record’s box exactly, whatever order the item was built in', async () => {
    const key = await recordsKey(await generateDataKey());
    const item: LoginItem = addLogin(emptyData(), { ...LOGIN, fields: [QUESTION] }).item;
    const box = await sealLogin(key, item, 1);
    const opened = await openLogin(key, { id: item.id, kind: RECORD_KIND, serverRev: 1, rev: 1, deleted: false, updatedAt: item.updatedAt, deviceId: 'x', box });
    expect(await loginSig(opened!)).toBe(await loginSig(item));
  });
});

describe('a folder and fields in a backup', () => {
  it('count a folder moved in the backup as a newer edit, and take it', () => {
    const { data, item } = addLogin(emptyData(), { ...LOGIN, folder: 'Home' }, 1_000);
    const backup = renameFolder(data, 'Home', 'Banks', 2_000);
    const merged = mergeBackup(data, backup);
    expect(merged.updated).toBe(1);
    expect(merged.data.items.find((entry) => entry.id === item.id)?.folder).toBe('Banks');
  });

  it('keep two logins that differ only in their fields apart', () => {
    const here = addLogin(emptyData(), LOGIN).data;
    const other = addLogin(emptyData(), { ...LOGIN, fields: [PIN] }).data;
    expect(mergeBackup(here, other).added).toBe(1);
    // The same login filed elsewhere is the same login.
    expect(mergeBackup(here, addLogin(emptyData(), { ...LOGIN, folder: 'Work' }).data).added).toBe(0);
  });
});

describe('a folder and fields from another manager', () => {
  it('reads Bitwarden’s folders and fields from its JSON, a checkbox as what it holds and a linked field as nothing', async () => {
    const result = await importBitwardenJson(
      JSON.stringify({
        encrypted: false,
        folders: [{ id: 'f1', name: 'Banks' }],
        items: [
          {
            type: 1,
            name: 'Bank',
            folderId: 'f1',
            login: { username: 'alice', password: 'pw', uris: [{ uri: 'https://bank.example.com' }] },
            fields: [
              { name: 'PIN', value: '4321', type: 1 },
              { name: 'Question', value: 'Chu Văn An', type: 0 },
              { name: 'Remember me', value: 'true', type: 2 },
              { name: 'Linked', value: null, type: 3, linkedId: 100 },
            ],
          },
          { type: 2, name: 'Wi-Fi', notes: 'home', folderId: 'nowhere', secureNote: { type: 0 } },
          { type: 3, name: 'Visa', folderId: 'f1', card: { number: '4242424242424242' }, fields: [{ name: 'Online PIN', value: '9', type: 1 }] },
        ],
      }),
    );
    expect(result.drafts[0]).toMatchObject({
      folder: 'Banks',
      fields: [
        { name: 'PIN', value: '4321', hidden: true },
        { name: 'Question', value: 'Chu Văn An', hidden: false },
        { name: 'Remember me', value: 'true', hidden: false },
      ],
    });
    expect(result.wallet[0]).not.toHaveProperty('folder');
    expect(result.wallet[1]).toMatchObject({ kind: 'card', folder: 'Banks', fields: [{ name: 'Online PIN', value: '9', hidden: true }] });
    // Into the vault, the folders and fields come along.
    const data = importLogins(emptyData(), result.drafts, result.passkeys);
    expect(data.items[0]).toMatchObject({ folder: 'Banks', fields: [{ name: 'PIN', hidden: true }, {}, {}] });
  });

  it('reads Bitwarden’s CSV: its folder, and its fields a line each', () => {
    const result = importCsv(
      'folder,favorite,type,name,notes,fields,reprompt,login_uri,login_username,login_password,login_totp\n' +
        'Banks,,login,Bank,,"PIN: 4321\nQuestion: a: b",0,https://bank.example.com,alice,pw,\n' +
        ',,note,Wi-Fi,home,,0,,,,\n',
    );
    expect(result.drafts[0]).toMatchObject({
      folder: 'Banks',
      fields: [
        { name: 'PIN', value: '4321', hidden: false },
        { name: 'Question', value: 'a: b', hidden: false },
      ],
    });
    expect(result.wallet[0]).toEqual({ kind: 'note', title: 'Wi-Fi', text: 'home' });
  });

  it('leaves out KeePass’s root group, which every entry is under', () => {
    const header = 'Group,Title,Username,Password,URL,Notes,TOTP,Icon,Last Modified,Created\n';
    const row = (group: string, user: string) => `"${group}",Site,${user},pw,https://a.example.com,,,0,2024-01-01,2024-01-01\n`;
    const result = importCsv(header + row('Root', 'a') + row('Root/Email', 'b') + row('Root/Email/Old', 'c'));
    expect(result.format).toBe('keepass');
    expect(result.drafts.map((draft) => draft.folder ?? '')).toEqual(['', 'Email', 'Email/Old']);
  });

  it('files Proton’s entries by vault only when the file holds more than one', () => {
    const header = 'type,name,url,email,username,password,note,totp,createTime,modifyTime,vault\n';
    const row = (vault: string, user: string) => `login,Site,https://a.example.com,,${user},pw,,,1,1,${vault}\n`;
    expect(importCsv(header + row('Personal', 'a') + row('Personal', 'b')).drafts.every((draft) => draft.folder === undefined)).toBe(true);
    expect(importCsv(header + row('Personal', 'a') + row('Work', 'b')).drafts.map((draft) => draft.folder)).toEqual(['Personal', 'Work']);
  });

  it('reads LastPass’s grouping as a folder, for its logins and its secure notes alike', () => {
    const result = importCsv('url,username,password,totp,extra,name,grouping,fav\nhttps://a.com,u,p,,,A,Social,0\nhttp://sn,,,,the words,Note,Private,0\n');
    expect(result.drafts[0]).toMatchObject({ folder: 'Social' });
    expect(result.wallet[0]).toMatchObject({ kind: 'note', folder: 'Private' });
  });
});
