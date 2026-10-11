import { describe, expect, it } from 'vitest';
import { addLogin, emptyData, exportCsv, importCsv, parseCsv, PassholdError } from '@passhold/core';

const code = (run: () => unknown) => {
  try {
    run();
  } catch (error) {
    return error instanceof PassholdError ? error.code : 'other';
  }
  return 'ok';
};

describe('reading CSV', () => {
  it('handles quotes, commas, line breaks inside a field, a BOM and CRLF', () => {
    const rows = parseCsv('﻿a,b,c\r\n"x, y","say ""hi""","line\none"\r\n\r\nlast,,\n');
    expect(rows).toEqual([
      ['a', 'b', 'c'],
      ['x, y', 'say "hi"', 'line\none'],
      ['last', '', ''],
    ]);
  });
});

describe('importing', () => {
  it('reads Chrome, Edge and every other Chromium browser', () => {
    const result = importCsv('name,url,username,password,note\nExample,https://example.com/login,alice,pw1,hello\n');
    expect(result.format).toBe('chrome');
    expect(result.drafts).toEqual([
      { title: 'Example', urls: ['https://example.com/login'], username: 'alice', password: 'pw1', notes: 'hello', favorite: false },
    ]);
  });

  it('reads Firefox, which has no names, and names each login after its site', () => {
    const result = importCsv(
      '"url","username","password","httpRealm","formActionOrigin","guid","timeCreated","timeLastUsed","timePasswordChanged"\n' +
        '"https://accounts.example.co.uk","bob","pw2",,"https://accounts.example.co.uk","{x}","1","1","1"\n',
    );
    expect(result.format).toBe('firefox');
    expect(result.drafts[0]).toMatchObject({ title: 'example.co.uk', username: 'bob', password: 'pw2' });
  });

  it('reads Bitwarden and leaves out its cards and notes', () => {
    const result = importCsv(
      'folder,favorite,type,name,notes,fields,reprompt,login_uri,login_username,login_password,login_totp\n' +
        ',1,login,Mail,,,0,"https://mail.example.com,https://example.com",carol,pw3,\n' +
        ',,card,Visa,,,0,,,,\n' +
        ',,note,Secret note,text,,0,,,,\n',
    );
    expect(result.format).toBe('bitwarden');
    expect(result.skipped).toBe(2);
    expect(result.drafts[0]).toMatchObject({
      title: 'Mail',
      favorite: true,
      urls: ['https://mail.example.com/', 'https://example.com/'],
    });
  });

  it('reads 1Password, Apple Passwords, LastPass and KeePassXC', () => {
    expect(importCsv('Title,Url,Username,Password,OTPAuth,Favorite,Archived,Tags,Notes\nA,a.com,u,p,,,,,\n').format).toBe('onepassword');
    expect(importCsv('Title,URL,Username,Password,Notes,OTPAuth\nA,https://a.com,u,p,,\n').format).toBe('apple');
    const lastpass = importCsv('url,username,password,totp,extra,name,grouping,fav\nhttp://sn,,,,secret,Note,,0\nhttps://a.com,u,p,,,A,,0\n');
    expect(lastpass).toMatchObject({ format: 'lastpass', skipped: 1 });
    expect(importCsv('"Group","Title","Username","Password","URL","Notes","TOTP","Icon","Last Modified","Created"\n"Root","A","u","p","https://a.com","","","0","",""\n').format).toBe('keepass');
  });

  it('leaves out what the vault already holds, and repeats within the file', () => {
    const { data } = addLogin(emptyData(), { title: 'A', username: 'u', password: 'p', urls: ['https://a.com'], notes: '' });
    const result = importCsv('name,url,username,password,note\nA,https://a.com,u,p,\nB,https://b.com,u,p,\nB,https://b.com,u,p,\n', data.items);
    expect(result.duplicates).toBe(2);
    expect(result.drafts).toHaveLength(1);
  });

  it('drops addresses that are not on the web', () => {
    const result = importCsv('name,url,username,password,note\nX,javascript:alert(1),u,p,\n');
    expect(result.drafts[0]!.urls).toEqual([]);
  });

  it('refuses a file it cannot read as logins', () => {
    expect(code(() => importCsv(''))).toBe('importEmpty');
    expect(code(() => importCsv('name,url\n'))).toBe('importEmpty');
    expect(code(() => importCsv('colour,size\nred,10\n'))).toBe('importUnknownFormat');
    expect(code(() => importCsv('x'.repeat(21 * 1024 * 1024)))).toBe('importTooLarge');
    expect(code(() => importCsv(`name,url,username,password\n${'a,b,c,d\n'.repeat(50_001)}`))).toBe('importTooLarge');
  });
});

describe('exporting', () => {
  it('writes Chrome’s columns, and reads back as what went in', () => {
    let data = emptyData();
    data = addLogin(data, { title: 'Comma, "quoted"', username: ' spaced ', password: 'p,w\n2', urls: ['https://a.com'], notes: 'n' }).data;
    const gone = addLogin(data, { title: 'Trashed', username: 'x', password: 'y', urls: [], notes: '' });
    data = { ...gone.data, items: gone.data.items.map((i) => (i.id === gone.item.id ? { ...i, deletedAt: 1 } : i)) };
    const csv = exportCsv(data.items);
    expect(csv.startsWith('name,url,username,password,note\r\n')).toBe(true);
    expect(csv).not.toContain('Trashed');
    const back = importCsv(csv);
    expect(back.drafts[0]).toMatchObject({ title: 'Comma, "quoted"', username: 'spaced', password: 'p,w\n2' });
  });
});
