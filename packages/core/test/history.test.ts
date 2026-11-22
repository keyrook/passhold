import { describe, expect, it } from 'vitest';
import { addLogin, cleanLogin, emptyData, HISTORY_LIMIT, updateLogin, type LoginDraft } from '@passhold/core';

const PIN = { name: 'PIN', value: '4321', hidden: true };
const NOTE = { name: 'Branch', value: 'Hà Nội', hidden: false };
const LOGIN: LoginDraft = { title: 'Bank', username: 'alice', password: 'pw-1', urls: ['https://bank.example.com'], notes: '' };

describe('a login’s history', () => {
  it('keeps the password a change replaced, and a hidden field’s value by the field’s name', () => {
    const { data, item } = addLogin(emptyData(), { ...LOGIN, fields: [PIN, NOTE] }, 1_000);
    const changed = updateLogin(data, item.id, { ...LOGIN, password: 'pw-2', fields: [{ ...PIN, value: '9999' }, { ...NOTE, value: 'Huế' }] }, 2_000);
    expect(changed.items[0]!.history).toEqual([
      { password: 'pw-1', changedAt: 2_000 },
      { password: '4321', changedAt: 2_000, field: 'PIN' },
    ]);
  });

  it('keeps a hidden field removed, and nothing for an edit that leaves it be or leaves the fields out', () => {
    const { data, item } = addLogin(emptyData(), { ...LOGIN, fields: [PIN] }, 1_000);
    expect(updateLogin(data, item.id, { ...LOGIN, title: 'Bank two' }, 2_000).items[0]!.history).toEqual([]);
    expect(updateLogin(data, item.id, { ...LOGIN, fields: [PIN] }, 2_000).items[0]!.history).toEqual([]);
    expect(updateLogin(data, item.id, { ...LOGIN, fields: [] }, 2_000).items[0]!.history).toEqual([{ password: '4321', changedAt: 2_000, field: 'PIN' }]);
  });

  it('holds the newest few, whatever they were', () => {
    let { data, item } = addLogin(emptyData(), { ...LOGIN, fields: [PIN] }, 1_000);
    for (let n = 2; n < 10; n++) data = updateLogin(data, item.id, { ...LOGIN, password: `pw-${n}`, fields: [{ ...PIN, value: `${n}${n}${n}` }] }, n * 1_000);
    item = data.items[0]!;
    expect(item.history).toHaveLength(HISTORY_LIMIT);
    expect(item.history[0]).toEqual({ password: 'pw-8', changedAt: 9_000 });
  });

  it('reads an entry as it was kept, and drops a field name that is not text', () => {
    const read = cleanLogin({
      id: 'a',
      history: [
        { password: 'old', changedAt: 5 },
        { password: '1234', changedAt: 6, field: 'PIN' },
        { password: '5678', changedAt: 7, field: { toString: 'PIN' } },
        { password: '', changedAt: 8, field: 'PIN' },
      ],
    });
    expect(read!.history).toEqual([
      { password: 'old', changedAt: 5 },
      { password: '1234', changedAt: 6, field: 'PIN' },
      { password: '5678', changedAt: 7 },
    ]);
  });
});
