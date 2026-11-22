/**
 * A change a page describes, applied as the extension's service worker and
 * the web vault's worker both apply it (vault/mutation.ts): whatever a page
 * sends, a shared vault this account may only view takes no change, a plan
 * without versions restores none, and a page is handed no key it has no use for.
 */
import { describe, expect, it } from 'vitest';
import {
  addLogin,
  addWalletItem,
  anyItem,
  blankApiKey,
  applyMutation,
  HIDDEN,
  hiddenValue,
  hideSecrets,
  updateLogin,
  createPasskey,
  emptyData,
  isPassholdError,
  pageView,
  savePasskey,
  type FamilyLink,
  type FamilyVault,
  type ItemMutation,
  type Mutation,
  type VaultData,
} from '../src/index.js';

const place = { orgId: 'family-1', vaultId: 'collection-1' };
const draft = { title: 'Shared', username: 'alice', password: 'Shared-Pass-123!', urls: ['https://shared.test'], notes: '' };

function withShared(viewOnly: boolean, role: FamilyLink['role'] = 'owner'): VaultData {
  const inside = addLogin({ items: [], wallet: [] }, draft).data;
  const vault: FamilyVault = { id: place.vaultId, name: 'Family', generation: 1, keyDue: false, viewOnly, items: inside.items, wallet: [], known: {} };
  const family: FamilyLink = { orgId: place.orgId, name: 'Home', role, members: [], pin: null, keyChanged: [], left: [], state: { kind: 'open' }, rotationDue: false, serverRev: 0, epoch: null, vaults: [vault] };
  return { ...addLogin(emptyData(), { ...draft, title: 'Mine' }).data, families: [family] };
}

const code = (run: () => unknown) => {
  try {
    run();
  } catch (error) {
    return isPassholdError(error) ? error.code : String(error);
  }
  return null;
};

describe('a change described by a page', () => {
  it('is refused, every kind of it, in a shared vault this account may only view — even by its family’s organiser', () => {
    const data = withShared(true);
    const shared = data.families[0]!.vaults[0]!.items[0]!;
    const mine = data.items[0]!;
    const changes: ItemMutation[] = [
      { op: 'login/add', draft },
      { op: 'login/update', id: shared.id, draft: { ...draft, password: 'Changed-Pass-456!' } },
      { op: 'login/favorite', id: shared.id, favorite: true },
      { op: 'login/trash', id: shared.id },
      { op: 'login/restore', id: shared.id },
      { op: 'login/purge', id: shared.id },
      { op: 'login/restoreVersion', id: shared.id, savedAt: 1 },
      { op: 'wallet/add', draft: { kind: 'note', title: 'n', text: 't' } },
      { op: 'file/detach', id: shared.id, fileId: 'f' },
      { op: 'trash/empty' },
    ];
    for (const change of changes) expect([change.op, code(() => applyMutation(data, { op: 'family/change', place, change }, 'family-premium'))]).toEqual([change.op, 'viewOnly']);
    // Nor is anything of the vault's own moved into it.
    expect(code(() => applyMutation(data, { op: 'family/move', id: mine.id, place }, 'family-premium'))).toBe('viewOnly');
    // Where it may be changed, the same changes go through.
    const editable = withShared(false);
    const next = applyMutation(editable, { op: 'family/change', place, change: { op: 'login/trash', id: editable.families[0]!.vaults[0]!.items[0]!.id } }, 'family');
    expect(next.families[0]!.vaults[0]!.items[0]!.deletedAt).not.toBeNull();
  });

  it('restores no version on a plan that keeps none, and destroys nothing in a shared vault but by its organiser', () => {
    const data = withShared(false, 'member');
    const id = data.items[0]!.id;
    expect(code(() => applyMutation(data, { op: 'login/restoreVersion', id, savedAt: 1 }, 'personal'))).toBe('notOnPlan');
    expect(code(() => applyMutation(data, { op: 'family/change', place, change: { op: 'file/detach', id: data.families[0]!.vaults[0]!.items[0]!.id, fileId: 'f' } }, 'family'))).toBe('familyOrganiserOnly');
  });

  it('hands a page no passkey’s private key, no file’s key, and nothing of the account’s', async () => {
    const { passkey } = await createPasskey({ rpId: 'example.com', rpName: 'Example', userHandle: 'dXNlcg', userName: 'alice', userDisplayName: 'Alice' });
    let data = savePasskey(addLogin(emptyData(), draft).data, 'https://example.com', passkey).data;
    data = addWalletItem(data, { kind: 'note', title: 'n', text: 't' }).data;
    const handed = pageView({ ...data, recoveryKey: 'the-recovery-key', families: withShared(false).families });
    const text = JSON.stringify(handed);
    expect(text).not.toContain(passkey.privateKey);
    expect(text).not.toContain('the-recovery-key');
    expect(handed.account).toBeNull();
    expect(handed.families[0]!.pin).toBeNull();
  });
});

describe('the vault as the web vault’s screens hold it', () => {
  it('holds no hidden value until it is asked for, and hands back each one asked for, from the item alone', () => {
    const secrets = ['first-Pass-1!', 'second-Pass-2!', 'the-pin-4321', '4111111111111111', '737', '-----BEGIN OPENSSH PRIVATE KEY-----x'];
    let data = addLogin(emptyData(), { title: 'Bank', username: 'alice', password: secrets[0]!, urls: [], notes: '', fields: [{ name: 'PIN', value: secrets[2]!, hidden: true }, { name: 'Branch', value: 'Main', hidden: false }] }).data;
    const login = data.items[0]!;
    data = updateLogin(data, login.id, { title: 'Bank', username: 'alice', password: secrets[1]!, urls: [], notes: '', fields: login.fields }, Date.now(), { versions: true });
    data = addWalletItem(data, { kind: 'card', title: 'Visa', holder: 'Alice', number: secrets[3]!, expMonth: 1, expYear: 2031, code: secrets[4]!, notes: '' }).data;
    data = addWalletItem(data, { kind: 'ssh', title: 'Deploy', privateKey: secrets[5]!, publicKey: 'ssh-ed25519 AAAA', fingerprint: 'SHA256:x', notes: '' }).data;
    const held = hideSecrets(pageView(data));
    const text = JSON.stringify(held);
    for (const secret of secrets) expect([secret, text.includes(secret)]).toEqual([secret, false]);
    // What is plainly not a secret stays in sight: the username, a visible field, a card's network digits and last four.
    expect(held.items[0]).toMatchObject({ username: 'alice', password: HIDDEN });
    expect(held.items[0]!.fields.map((field) => field.value)).toEqual([HIDDEN, 'Main']);
    expect(held.wallet[0]).toMatchObject({ number: '411111••••••1111', code: HIDDEN });
    const id = held.items[0]!.id;
    const card = held.wallet[0]!.id;
    const whole = (target: string) => anyItem(data, target)!;
    expect(hiddenValue(whole(id), { kind: 'password' })).toBe(secrets[1]);
    expect(hiddenValue(whole(id), { kind: 'history', index: 0 })).toBe(secrets[0]);
    expect(hiddenValue(whole(id), { kind: 'field', index: 0 })).toBe(secrets[2]);
    // A field in sight is no secret to ask for, nor a value an item does not have.
    expect(hiddenValue(whole(id), { kind: 'field', index: 1 })).toBeNull();
    expect(hiddenValue(whole(id), { kind: 'number' })).toBeNull();
    expect(hiddenValue(whole(card), { kind: 'number' })).toBe(secrets[3]);
    expect(hiddenValue(whole(card), { kind: 'code' })).toBe(secrets[4]);
    expect(hiddenValue(whole(data.wallet[1]!.id), { kind: 'privateKey' })).toBe(secrets[5]);
    expect(hiddenValue(whole(id), { kind: 'nothing' } as never)).toBeNull();
  });

  it('holds an API key and the keys it replaced as it holds a password, its last four in sight to tell two apart', () => {
    // Short of a real key's length, so that no secret scanner takes these for one.
    const first = 'sk_live_FIRSTkeyFIRST1234';
    const second = 'sk_live_SECONDkeySECOND5678';
    let data = addWalletItem(emptyData(), { ...blankApiKey(), title: 'Payments', key: first }).data;
    const id = data.wallet[0]!.id;
    data = applyMutation(data, { op: 'wallet/update', id, draft: { ...blankApiKey(), title: 'Payments', key: second } }, 'personal-premium');
    const held = hideSecrets(pageView(data));
    const text = JSON.stringify(held);
    expect([text.includes(first), text.includes(second)]).toEqual([false, false]);
    expect((held.wallet[0] as { key: string }).key.endsWith('5678')).toBe(true);
    expect(hiddenValue(anyItem(data, id)!, { kind: 'key' })).toBe(second);
    expect(hiddenValue(anyItem(data, id)!, { kind: 'history', index: 0 })).toBe(first);
    expect(hiddenValue(anyItem(data, id)!, { kind: 'password' })).toBeNull();
  });
});

// The union a page may send is the core's: the extension's messages name it, never a copy.
const _typed: Mutation = { op: 'trash/empty' };
void _typed;
