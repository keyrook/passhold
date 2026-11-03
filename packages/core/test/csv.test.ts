import { describe, expect, it } from 'vitest';
import { addLogin, addWalletItem, emptyData, exportCsv, importCsv, parseCsv, PassholdError } from '@passhold/core';

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

  it('reads Bitwarden, its notes into the wallet', () => {
    const result = importCsv(
      'folder,favorite,type,name,notes,fields,reprompt,login_uri,login_username,login_password,login_totp\n' +
        ',1,login,Mail,,,0,"https://mail.example.com,https://example.com",carol,pw3,JBSWY3DPEHPK3PXP\n' +
        ',,card,Visa,,,0,,,,\n' +
        ',,note,Secret note,text,,0,,,,\n',
    );
    expect(result.format).toBe('bitwarden');
    expect(result.drafts[0]).toMatchObject({
      title: 'Mail',
      favorite: true,
      urls: ['https://mail.example.com/', 'https://example.com/'],
    });
    // Its CSV holds no card's details: a card row is nothing to keep.
    expect(result.wallet).toEqual([{ kind: 'note', title: 'Secret note', text: 'text' }]);
    expect(result.skipped).toBe(1);
    // Counted, so the page can say so; kept nowhere.
    expect(result.twoFactor).toBe(1);
    expect(JSON.stringify(result)).not.toContain('JBSWY3DPEHPK3PXP');
  });

  it('reads 1Password, Apple Passwords, LastPass and KeePassXC', () => {
    expect(importCsv('Title,Url,Username,Password,OTPAuth,Favorite,Archived,Tags,Notes\nA,a.com,u,p,,,,,\n').format).toBe('onepassword');
    expect(importCsv('Title,URL,Username,Password,Notes,OTPAuth\nA,https://a.com,u,p,,\n').format).toBe('apple');
    const lastpass = importCsv('url,username,password,totp,extra,name,grouping,fav\nhttp://sn,,,,secret,Note,,0\nhttps://a.com,u,p,,,A,,0\n');
    expect(lastpass).toMatchObject({ format: 'lastpass', skipped: 0, wallet: [{ kind: 'note', title: 'Note', text: 'secret' }] });
    expect(importCsv('"Group","Title","Username","Password","URL","Notes","TOTP","Icon","Last Modified","Created"\n"Root","A","u","p","https://a.com","","","0","",""\n').format).toBe('keepass');
  });

  it('leaves out what the vault already holds, and repeats within the file', () => {
    const { data } = addLogin(emptyData(), { title: 'A', username: 'u', password: 'p', urls: ['https://a.com'], notes: '' });
    const result = importCsv('name,url,username,password,note\nA,https://a.com,u,p,\nB,https://b.com,u,p,\nB,https://b.com,u,p,\n', data);
    expect(result.duplicates).toBe(2);
    expect(result.drafts).toHaveLength(1);
  });

  it('reads NordPass: logins it calls passwords, their extra addresses, and its cards, identities and notes', () => {
    const header = 'name,url,additional_urls,username,password,note,cardholdername,cardnumber,cvc,expirydate,zipcode,folder,full_name,phone_number,email,address1,address2,city,country,state,type,custom_fields\n';
    const result = importCsv(
      header +
        'notesFolder,,,,,,,,,,,,,,,,,,,,,\n' +
        'Site,https://example.com,"[""https://example.net""]",hello@example.com,pw,a note,,,,,,Folder,,,,,,,,,password,\n' +
        'SomeVisa,,,,,,Some Holder,4024 0071 0393 9509,123,01 / 22,12345,,,,,,,,,,credit_card,\n' +
        'Home,,,,,a note,,,,,50667,,Jo Doe,123456789,jo@example.com,Test street 123,Flat 4,Cologne,Germany,NRW,identity,\n' +
        'Wi-Fi,,,,,the password,,,,,,notesFolder,,,,,,,,,note,\n',
    );
    expect(result.format).toBe('nordpass');
    expect(result.drafts).toEqual([
      { title: 'Site', username: 'hello@example.com', password: 'pw', urls: ['https://example.com/', 'https://example.net/'], notes: 'a note', favorite: false, folder: 'Folder' },
    ]);
    expect(result.wallet).toEqual([
      { kind: 'card', title: 'SomeVisa', holder: 'Some Holder', number: '4024007103939509', expMonth: 1, expYear: 2022, code: '123', notes: '' },
      {
        kind: 'address',
        title: 'Home',
        name: 'Jo Doe',
        organization: '',
        street: 'Test street 123\nFlat 4',
        city: 'Cologne',
        region: 'NRW',
        postalCode: '50667',
        country: 'DE',
        phone: '123456789',
        email: 'jo@example.com',
        notes: 'a note',
      },
      { kind: 'note', title: 'Wi-Fi', text: 'the password', folder: 'notesFolder' },
    ]);
    // The folder's own row holds nothing.
    expect(result.skipped).toBe(1);
  });

  it('reads LastPass’s secure notes: a card, an address, and any other kind kept as the note it is', () => {
    const note = (extra: string, name: string) => `http://sn,,,,"${extra.replace(/"/g, '""')}",${name},,0\n`;
    const result = importCsv(
      'url,username,password,totp,extra,name,grouping,fav\n' +
        note('NoteType:Credit Card\nLanguage:en-US\nName on Card:Jo Doe\nType:Visa\nNumber:4111111111111111\nSecurity Code:321\nStart Date:,\nExpiration Date:June,2030\nNotes:first line\nsecond: line', 'Visa') +
        note('NoteType:Address\nLanguage:en-US\nTitle:mr\nFirst Name:Jo\nMiddle Name:\nLast Name:Doe\nCompany:Acme\nAddress 1:1 Main St\nAddress 2:Unit 2\nAddress 3:\nCity / Town:Springfield\nState:IL\nZip / Postal Code:62701\nCountry:US\nEmail Address:jo@example.com\nPhone:{"num":"5551234","ext":"","cc3l":"USA"}\nNotes:', 'Home') +
        note('NoteType:Bank Account\nBank Name:Big Bank\nAccount Number:12345', 'Bank') +
        'https://a.com,u,p,JBSWY3DPEHPK3PXP,,A,,0\n',
    );
    expect(result.wallet).toEqual([
      { kind: 'card', title: 'Visa', holder: 'Jo Doe', number: '4111111111111111', expMonth: 6, expYear: 2030, code: '321', notes: 'first line\nsecond: line' },
      {
        kind: 'address',
        title: 'Home',
        name: 'Jo Doe',
        organization: 'Acme',
        street: '1 Main St\nUnit 2',
        city: 'Springfield',
        region: 'IL',
        postalCode: '62701',
        country: 'US',
        phone: '5551234',
        email: 'jo@example.com',
        notes: '',
      },
      { kind: 'note', title: 'Bank', text: 'NoteType:Bank Account\nBank Name:Big Bank\nAccount Number:12345' },
    ]);
    expect(result.drafts).toHaveLength(1);
    expect(result.twoFactor).toBe(1);
  });

  it('reads Dashlane’s other files: its cards, its addresses and its secure notes', () => {
    const payments = importCsv(
      'type,account_name,account_holder,cc_number,code,expiration_month,expiration_year,routing_number,account_number,country,issuing_bank\n' +
        "bank,John's savings account,John Doe,,,,,routingNumber,accountNumber,US,US-ALLY\n" +
        'credit_card,John Doe,,4111111111111111,123,01,2031,,,US,\n',
    );
    expect(payments).toMatchObject({ format: 'dashlane', drafts: [], skipped: 1 });
    expect(payments.wallet).toEqual([{ kind: 'card', title: '', holder: 'John Doe', number: '4111111111111111', expMonth: 1, expYear: 2031, code: '123', notes: '' }]);

    const personal = importCsv(
      'type,title,first_name,middle_name,last_name,login,date_of_birth,place_of_birth,email,email_type,item_name,phone_number,address,country,state,city,zip,address_recipient,address_building,address_apartment,address_floor,address_door_code,job_title,url\n' +
        'name,MR,John,,Doe,jdoe,2022-01-30,world,,,,,,,,,,,,,,,,\n' +
        "address,,,,,,,,,,John's home address,,1 some street,de,NW,some city,123123,John,1,1,1,123,,\n",
    );
    expect(personal).toMatchObject({ format: 'dashlane', skipped: 1 });
    expect(personal.wallet).toEqual([
      { kind: 'address', title: "John's home address", name: 'John', organization: '', street: '1 some street', city: 'some city', region: 'NW', postalCode: '123123', country: 'DE', phone: '', email: '', notes: '' },
    ]);

    expect(importCsv('title,note\nWi-Fi,the password\n')).toMatchObject({ format: 'dashlane', wallet: [{ kind: 'note', title: 'Wi-Fi', text: 'the password' }] });
    expect(importCsv('username,username2,username3,title,password,note,url,category,otpSecret\njdoe,,,example.com,pw,,https://www.example.com,Fun,JBSWY3DPEHPK3PXP\n').twoFactor).toBe(1);
  });

  it('reads Proton Pass, whose cards and identities come as JSON in the note', () => {
    const row = (type: string, name: string, note: string, totp = '') => `${type},${name},,,,,"${note.replace(/"/g, '""')}",${totp},1,1,Personal\n`;
    const result = importCsv(
      'type,name,url,email,username,password,note,totp,createTime,modifyTime,vault\n' +
        'login,Mail,https://mail.example.com,,carol,pw,,otpauth://totp/x?secret=JBSWY3DPEHPK3PXP,1,1,Personal\n' +
        row('creditCard', 'Visa', JSON.stringify({ cardholderName: 'Jo Doe', cardType: 0, number: '4111111111111111', verificationNumber: '999', expirationDate: '2031-04', pin: '', note: 'mine' })) +
        row('identity', 'Me', JSON.stringify({ fullName: '', firstName: 'Jo', lastName: 'Doe', streetAddress: '1 Main St', city: 'Hanoi', countryOrRegion: 'Vietnam', zipOrPostalCode: '100000', email: 'jo@example.com', note: '' })) +
        row('note', 'Wi-Fi', 'the password') +
        'alias,Alias,,alias@example.com,,,,,1,1,Personal\n',
    );
    expect(result.format).toBe('proton');
    expect(result.drafts).toHaveLength(1);
    expect(result.twoFactor).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.wallet).toEqual([
      { kind: 'card', title: 'Visa', holder: 'Jo Doe', number: '4111111111111111', expMonth: 4, expYear: 2031, code: '999', notes: 'mine' },
      { kind: 'address', title: 'Me', name: 'Jo Doe', organization: '', street: '1 Main St', city: 'Hanoi', region: '', postalCode: '100000', country: 'VN', phone: '', email: 'jo@example.com', notes: '' },
      { kind: 'note', title: 'Wi-Fi', text: 'the password' },
    ]);
  });

  it('reads a card’s JSON as nothing but what it names, and keeps words it cannot read as a note', () => {
    const row = (note: string) => `creditCard,Card,,,,,"${note.replace(/"/g, '""')}",,1,1,Personal\n`;
    const result = importCsv(
      'type,name,url,email,username,password,note,totp,createTime,modifyTime,vault\n' +
        // Written by hand: JSON.parse makes "__proto__" a key like any other, which nothing here reads.
        row('{"__proto__":{"number":"4111111111111111"},"number":{"valueOf":4111},"cardholderName":["x"],"verificationNumber":"12345678","expirationDate":"2031-13"}') +
        row('not JSON, but words') +
        row('[1,2]'),
    );
    expect(result.wallet).toEqual([
      // Named, so kept: but with no number, no holder, a code cut to four digits and no month that is not one.
      { kind: 'card', title: 'Card', holder: '', number: '', expMonth: null, expYear: 2031, code: '1234', notes: '' },
      { kind: 'note', title: 'Card', text: 'not JSON, but words' },
      { kind: 'note', title: 'Card', text: '[1,2]' },
    ]);
  });

  it('counts the two-factor secrets it does not keep, in 1Password’s, Apple’s and KeePass’s files', () => {
    expect(importCsv('Title,Url,Username,Password,OTPAuth,Favorite,Archived,Tags,Notes\nA,a.com,u,p,otpauth://totp/A?secret=X,,,,\nB,b.com,u,p,,,,,\n').twoFactor).toBe(1);
    expect(importCsv('Title,URL,Username,Password,Notes,OTPAuth\nA,https://a.com,u,p,,otpauth://totp/A?secret=X\n').twoFactor).toBe(1);
    expect(importCsv('"Group","Title","Username","Password","URL","Notes","TOTP","Icon","Last Modified","Created"\n"Root","A","u","p","https://a.com","","otpauth://totp/A?secret=X","0","",""\n').twoFactor).toBe(1);
    expect(importCsv('name,url,username,password,note\nA,https://a.com,u,p,\n').twoFactor).toBe(0);
  });

  it('keeps a row with words but nothing to sign in with as a note, as KeePass writes one', () => {
    const result = importCsv('"Group","Title","Username","Password","URL","Notes","TOTP","Icon","Last Modified","Created"\n"Root","Licence","","","https://shop.example.com","KEY-123","","0","",""\n"Root","Empty","","","","","","0","",""\n');
    expect(result.wallet).toEqual([{ kind: 'note', title: 'Licence', text: 'https://shop.example.com\nKEY-123' }]);
    expect(result.skipped).toBe(1);
  });

  it('leaves out cards, addresses and notes the wallet already holds, and repeats within the file', () => {
    let data = emptyData();
    data = addWalletItem(data, { kind: 'card', title: '', holder: 'Jo', number: '4111111111111111', expMonth: 1, expYear: 2031, code: '', notes: '' }).data;
    data = addWalletItem(data, { kind: 'note', title: 'Wi-Fi', text: 'the password' }).data;
    const result = importCsv(
      'name,url,additional_urls,username,password,note,cardholdername,cardnumber,cvc,expirydate,zipcode,folder,full_name,phone_number,email,address1,address2,city,country,state,type,custom_fields\n' +
        'Visa,,,,,,Jo,4111111111111111,123,01/31,,,,,,,,,,,credit_card,\n' +
        'Wi-Fi,,,,,the password,,,,,,,,,,,,,,,note,\n' +
        'Home,,,,,,,,,,1000,,Jo Doe,,,1 Main St,,Hanoi,VN,,identity,\n' +
        'Home again,,,,,,,,,,1000,,jo doe,,,1 main st,,Hanoi,VN,,identity,\n',
      data,
    );
    expect(result.duplicates).toBe(3);
    expect(result.wallet.map((item) => item.title)).toEqual(['Home']);
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
