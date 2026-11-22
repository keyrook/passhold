/**
 * One round with the account's server, for whatever holds the vault: the
 * extension's service worker, which keeps it sealed on disk, and the web
 * vault's worker, which keeps it in memory while it is unlocked. What is
 * pulled, merged, planned, sealed and pushed is the same for both; only how
 * each reaches the vault differs, and that is its `VaultTurn`.
 *
 * The network is never waited on inside the holder's turn — a slow server
 * must not hold up a change a person makes — so a round goes: pull; in the
 * turn, bring what came in into the vault as it is then and plan what goes
 * out; push; in the turn again, settle what was accepted. A change made while
 * the server was answering is in the vault, and goes out next round.
 */
import {
  openFamily,
  pullFamily,
  pushFamily,
  rotateFamilyKeys,
  sealFamilyRecord,
  SyncHttpError,
  type AccountKeysResponse,
  type FamilyRecord,
  type HttpSyncAdapter,
  type OpenedFamily,
  type ProductFamily,
  type ProductKey,
} from '@keyrook/account';
import { cleanAccountName } from '../vault/items.js';
import { familyVault, inFamilyVault } from '../vault/family.js';
import type { AccountLink, FamilyLink, FamilyState, FamilyVault, VaultData } from '../vault/model.js';
import { mergeFamilyPulled, planFamilyPush, type FamilyValue, type UnreadableRecord } from './family.js';
import { nextAccountKit } from './kit.js';
import { readPassholdPin } from './product.js';
import { acceptPushed, allSent, applyPulled, dropFamilyVaults, planPush, resendAll, type RemoteRecord } from './sync.js';

/**
 * A step inside the holder's turn: it reads the vault as it is now and may
 * hand back a new one, which the holder keeps (and, on disk, seals and
 * stores). Null back: the vault is locked, or no longer this account's — the
 * step was not run, and the round stops.
 */
export type VaultTurn = <T>(step: (data: VaultData) => Promise<{ data?: VaultData; value: T }>) => Promise<T | null>;

/** The vault's own records on the server: what a round needs of a session. */
export interface RecordsServer {
  pull(since: number): Promise<{ records: RemoteRecord[]; serverRev: number; hasMore: boolean; epoch?: string | null | undefined }>;
  push(records: RemoteRecord[], since: number): Promise<{ accepted: { id: string; rev: number }[]; conflicts: RemoteRecord[] }>;
  accountKeys(): Promise<AccountKeysResponse>;
}

/** What a round of the vault's own records did: deleted for good elsewhere, would not open, and whether to go again soon. */
export interface OwnRound {
  removed: number;
  skipped: number;
  /** A push came back with newer revisions: merged here, they go up again. */
  again: boolean;
}

/** An address the server sent, kept only if it is one: anything else leaves the one known. */
export function syncedAddress(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const address = String(value).trim().toLowerCase().slice(0, 320);
  return /^[^\s@\p{Cc}\p{Cf}]+@[^\s@\p{Cc}\p{Cf}]+$/u.test(address) ? address : null;
}

/**
 * The vault's own records, one round. `records`, `previous`: the records key
 * drawn from Passhold's key, and the one from before a replacement while
 * records sealed under it may still come down; `productKey`, Passhold's key,
 * to read its pin with. `link`: the account as the round starts; the turn
 * hands each step the vault as it is then.
 */
export async function syncOwnRecords(
  server: RecordsServer,
  turn: VaultTurn,
  keys: { productKey: CryptoKey; records: CryptoKey; previous: CryptoKey | null },
  link: AccountLink,
): Promise<OwnRound | null> {
  let since = link.serverRev;
  let epoch = link.epoch;
  let restored = false;
  const records: RemoteRecord[] = [];
  // A server that always says there is more stops here, not never.
  for (let page = 0; page < 40; page++) {
    const answer = await server.pull(since);
    if (epoch && answer.epoch && answer.epoch !== epoch && !restored) {
      // Restored from a backup, the server forgot what came after it: start
      // over, and everything here goes back up.
      restored = true;
      since = 0;
      records.length = 0;
      epoch = answer.epoch;
      continue;
    }
    records.push(...answer.records);
    since = answer.serverRev;
    epoch = answer.epoch ?? epoch;
    if (!answer.hasMore) break;
  }
  // When the account's recovery key was last set, for the page to say whether this vault holds it.
  const state = await server.accountKeys();
  // And whether a sheet was seen to open the root since: typed in another
  // Passhold, or on account.keyrook.com, which says so on every product's
  // pin. Only a pin that opens under Passhold's key, naming the root this
  // vault is sealed to, is read: the server can write neither.
  const pin = state.box && link.accountId ? await readPassholdPin(keys.productKey, state.box.pin, link.accountId) : null;

  const planned = await turn(async (data) => {
    const account = data.account!;
    const pulled = await applyPulled(data, restored ? {} : account.known, records, keys.records, keys.previous);
    const plan = await planPush(pulled.data, pulled.known, keys.records, account.deviceId);
    const kit = nextAccountKit(account.kit, state.recovery.wrappedAt);
    const seen = pin?.root === account.root ? pin.sheetVerifiedAt : null;
    const sheetVerifiedAt = seen !== null && seen > (account.sheetVerifiedAt ?? 0) ? seen : account.sheetVerifiedAt;
    // The account's name as the server says it now, so one changed on account.keyrook.com shows here at the
    // next sync; an older server says nothing, and what was known stays.
    const name = state.name === undefined ? account.name : cleanAccountName(state.name);
    // And its address: moved there, the account keeps every session, so this one hears it here. Without it, a
    // new recovery key would ask the server for an address it no longer knows, and be refused the password. An
    // older server says nothing.
    const email = syncedAddress(state.email) ?? account.email;
    const next: AccountLink = { ...account, email, name, known: pulled.known, serverRev: since, epoch, kit, sheetVerifiedAt, pendingStartOver: state.pendingStartOver ?? null };
    return { data: { ...pulled.data, account: next }, value: { plan, removed: pulled.removed, skipped: pulled.skipped } };
  });
  if (!planned) return null;

  const accepted: { id: string; rev: number }[] = [];
  const conflicts: RemoteRecord[] = [];
  for (let at = 0; at < planned.plan.records.length; at += 200) {
    const answer = await server.push(planned.plan.records.slice(at, at + 200), since);
    accepted.push(...answer.accepted);
    conflicts.push(...answer.conflicts);
  }

  await turn(async (data) => {
    const account = data.account!;
    const known = acceptPushed(account.known, planned.plan, accepted);
    const merged = await applyPulled(data, known, conflicts, keys.records, keys.previous);
    // Every record sealed again under the new key and on the server: the one before is let go.
    const previousKey = account.previousKey && allSent(merged.known) ? null : account.previousKey;
    return { data: { ...merged.data, account: { ...account, known: merged.known, lastSyncAt: Date.now(), previousKey } }, value: undefined };
  });
  return { removed: planned.removed, skipped: planned.skipped, again: conflicts.length > 0 };
}

// --- families --------------------------------------------------------------------------

type Shared = FamilyRecord<FamilyValue>;

/** Where this vault stands with a family, as `openFamily` left it. */
export function familyState(opened: OpenedFamily): FamilyState {
  switch (opened.status) {
    case 'open':
      return { kind: 'open' };
    case 'waiting':
      return { kind: 'waiting' };
    case 'needs-root':
      return { kind: 'needs-root' };
    case 'compare':
      return { kind: 'compare', accountId: opened.accountId, memberKey: opened.memberKey, code: opened.code };
  }
}

/**
 * The family as the vault keeps it, from what `openFamily` checked: who is in
 * it and their place from the roster, whose MAC the server cannot make; their
 * addresses and names from the server, shown as text.
 */
function familyLink(family: ProductFamily, before: FamilyLink | undefined, rest: Pick<FamilyLink, 'left' | 'serverRev' | 'epoch' | 'vaults'>): FamilyLink {
  const named = new Map(family.detail.members.map((member) => [member.accountId, member]));
  const lines = family.roster.body.members;
  // The server stops naming someone it dropped while the roster, until the keys
  // change, still lists them: taken at its word they would lose their name here
  // just before Passhold has to say who went.
  const known = (accountId: string) => named.get(accountId) ?? before?.members.find((member) => member.accountId === accountId);
  return {
    orgId: family.orgId,
    name: cleanAccountName(family.detail.org.name) ?? before?.name ?? family.orgId,
    role: lines.find((line) => line.accountId === family.accountId)?.role === 'owner' ? 'owner' : 'member',
    members: lines.map((line) => ({
      accountId: line.accountId,
      email: known(line.accountId)?.email || line.accountId,
      name: cleanAccountName(known(line.accountId)?.name),
      role: line.role === 'owner' ? 'owner' : 'member',
      verified: line.verified,
    })),
    pin: family.pinned,
    keyChanged: family.keyChanged,
    state: { kind: 'open' },
    rotationDue: family.detail.org.rotationDue || dueVaults(family).size > 0,
    ...rest,
  };
}

/**
 * Those to tell of someone gone: whoever is told of already, and `named`, as
 * this vault last knew them, for neither the roster nor the server says any
 * more. One the roster lists again is back, and no longer gone.
 */
function departures(family: ProductFamily, before: FamilyLink | undefined, named: Set<string>): FamilyLink['left'] {
  const told = before?.left ?? [];
  const fresh = [...named]
    .filter((accountId) => !told.some((person) => person.accountId === accountId))
    .map((accountId) => {
      const known = before?.members.find((member) => member.accountId === accountId);
      // Someone nobody ever named here is filed under their id, which tells a person nothing.
      return { accountId, email: known && known.email !== accountId ? known.email : '', name: known?.name ?? null };
    });
  return [...told, ...fresh].filter((person) => !family.roster.body.members.some((line) => line.accountId === person.accountId));
}

/** The family's shared vaults of this account whose key someone who left still holds, until an organiser changes it. */
const dueVaults = (family: ProductFamily) =>
  new Set(family.detail.collections.filter((collection) => collection.rotationDue && family.collections.some((mine) => mine.id === collection.id)).map((collection) => collection.id));

const familyLinkOf = (data: VaultData, orgId: string) => data.families.find((family) => family.orgId === orgId);

/** What opens the account's families: Passhold's key, the one before a replacement, and the id this session signed in under. */
export interface FamilyKeys {
  productKey: ProductKey;
  previousKey: CryptoKey | undefined;
  deviceId: string;
}

/**
 * Each family of the account, after the vault's own records and in the same
 * round, so one session at a time. A family is opened with Passhold's key and
 * its roster checked against the pin kept here (`openFamily`); each shared
 * vault's records are pulled, merged and pushed as the flows open and seal
 * them. One family that fails leaves the others, and the vault's own, as they
 * were; the next round tries it again. True back: something came back to go
 * up again soon.
 */
export async function syncFamilies(api: HttpSyncAdapter, turn: VaultTurn, keys: FamilyKeys): Promise<boolean> {
  let listed: { id: string; name: string; role: string }[];
  try {
    listed = (await api.orgs()).orgs.filter((org) => org.kind === 'family');
  } catch (error) {
    // A server that offers no families: none is kept, but what was never sent of them.
    if (!(error instanceof SyncHttpError && error.code === 'not_offered')) throw error;
    listed = [];
  }
  let again = false;
  for (const org of listed) {
    again = (await syncFamily(api, turn, keys, org).catch(() => false)) || again;
  }
  await turn(async (data) => {
    const ids = new Set(listed.map((org) => org.id));
    if (data.families.every((family) => ids.has(family.orgId))) return { value: undefined };
    // A family left, or gone: its shared vaults go, with what was never sent kept.
    const kept = await dropFamilyVaults(data, ({ orgId }) => ids.has(orgId));
    return { data: { ...kept, families: kept.families.filter((family) => ids.has(family.orgId)) }, value: undefined };
  });
  return again;
}

async function syncFamily(api: HttpSyncAdapter, turn: VaultTurn, { productKey, previousKey, deviceId }: FamilyKeys, org: { id: string; name: string; role: string }): Promise<boolean> {
  const read = await turn(async (data) => ({ value: { held: familyLinkOf(data, org.id) } }));
  if (!read) return false;
  const { held } = read;
  let opened = await openFamily(api, { productKey, orgId: org.id, pinned: held?.pin ?? null, previousKey });
  // Each opening names only who is gone since the pin it was given, and opening
  // again below goes from this one's: read from the last alone, someone would go unsaid.
  const left = new Set(opened.status === 'open' ? opened.family.left : []);
  if (opened.status === 'open') {
    // Someone went: an organiser's Passhold gives everyone left new keys as it
    // syncs, and reads and writes under them in the same round. One whose key
    // this vault has not taken is compared first (`keyChanged`), and a
    // rotation that does not go through now is tried again next round; what
    // was changed waits here meanwhile (`keyDue`).
    const turned = await rotateFamilyKeys(api, opened.family).catch(() => null);
    if (turned?.status === 'rotated' || turned?.status === 'stale') {
      opened = await openFamily(api, { productKey, orgId: org.id, pinned: opened.family.pinned, previousKey });
    }
  }
  if (opened.status !== 'open') {
    // Nothing of it is read or written until it opens: what it held here stays as it was.
    const state = familyState(opened);
    await turn(async (data) => {
      const before = familyLinkOf(data, org.id);
      const next: FamilyLink = before
        ? { ...before, state }
        : { orgId: org.id, name: cleanAccountName(org.name) ?? org.id, role: org.role === 'owner' ? 'owner' : 'member', members: [], pin: null, keyChanged: [], left: [], state, rotationDue: false, serverRev: 0, epoch: null, vaults: [] };
      return { data: { ...data, families: [...data.families.filter((family) => family.orgId !== org.id), next] }, value: undefined };
    });
    return false;
  }
  const family = opened.family;
  for (const accountId of family.left) left.add(accountId);
  const due = dueVaults(family);

  let since = held?.serverRev ?? 0;
  let epoch = held?.epoch ?? null;
  let restored = false;
  const records: Shared[] = [];
  const unreadable: UnreadableRecord[] = [];
  // A server that always says there is more stops here, not never.
  for (let page = 0; page < 40; page++) {
    const answer = await pullFamily<FamilyValue>(api, family, { since, epoch });
    if (answer.restored && !restored) {
      // Restored from a backup, the server forgot what came after it: from the start, and everything here goes back up.
      restored = true;
      since = 0;
      records.length = 0;
      unreadable.length = 0;
      epoch = answer.epoch;
      continue;
    }
    records.push(...answer.records);
    unreadable.push(...answer.unreadable);
    since = answer.serverRev;
    epoch = answer.epoch;
    if (!answer.hasMore) break;
  }
  // A collection just shared with this account holds what came before the family's counter stood here.
  for (const collection of family.collections) {
    if (!held || restored || held.vaults.some((vault) => vault.id === collection.id)) continue;
    for (let after = 0, page = 0; page < 40; page++) {
      const answer = await pullFamily<FamilyValue>(api, family, { since: after, collectionId: collection.id });
      records.push(...answer.records);
      unreadable.push(...answer.unreadable);
      after = answer.serverRev;
      if (!answer.hasMore) break;
    }
  }

  const planned = await turn(async (data) => {
    const before = familyLinkOf(data, org.id);
    const vaults: FamilyVault[] = [];
    for (const collection of family.collections) {
      const kept = before?.vaults.find((vault) => vault.id === collection.id);
      // Its key was changed since: the server holds it under the one before, and each product seals its own again (`consoleRotateFamily`).
      const known = !kept || restored ? {} : collection.generation > kept.generation ? resendAll(kept.known) : kept.known;
      const base: FamilyVault = kept
        ? { ...kept, name: collection.name, generation: collection.generation, keyDue: due.has(collection.id), viewOnly: !collection.canEdit, known }
        : { id: collection.id, name: collection.name, generation: collection.generation, keyDue: due.has(collection.id), viewOnly: !collection.canEdit, items: [], wallet: [], known: {} };
      vaults.push((await mergeFamilyPulled(base, records, unreadable)).vault);
    }
    const gone = before?.vaults.filter((vault) => !family.collections.some((collection) => collection.id === vault.id)) ?? [];
    const placed = { ...data, families: [...data.families.filter((entry) => entry.orgId !== org.id), familyLink(family, before, { left: departures(family, before, left), serverRev: since, epoch, vaults: [...vaults, ...gone] })] };
    // A shared vault this account is no longer let into goes, with what was never sent kept.
    const next = await dropFamilyVaults(placed, ({ orgId, vaultId }) => orgId !== org.id || family.collections.some((collection) => collection.id === vaultId));
    const plans: { vaultId: string; plan: Awaited<ReturnType<typeof planFamilyPush>> }[] = [];
    for (const vault of familyLinkOf(next, org.id)?.vaults ?? []) plans.push({ vaultId: vault.id, plan: await planFamilyPush(vault, vault.known) });
    return { data: next, value: plans };
  });
  if (!planned) return false;

  // Sealed and sent outside the vault's turn, as the vault's own records are.
  let again = false;
  const sent: { vaultId: string; plan: Awaited<ReturnType<typeof planFamilyPush>>; accepted: { id: string; rev: number }[]; conflicts: Shared[]; blind: UnreadableRecord[] }[] = [];
  for (const { vaultId, plan } of planned) {
    // Sealed now, it would be under a key someone gone still holds, and the
    // server refuses it: it waits here, unsent, for the key an organiser gives
    // next. Sent anyway, every round would come back refused, and try again.
    // Nor from a vault this account may only view: the flows sign nothing for it, and the server takes nothing.
    if (!plan.records.length || due.has(vaultId) || !family.collections.find((collection) => collection.id === vaultId)?.canEdit) continue;
    const sealed = [];
    for (const change of plan.records) {
      sealed.push(await sealFamilyRecord(family, { collectionId: vaultId, id: change.id, kind: change.kind, rev: change.rev, value: change.value, updatedAt: change.updatedAt, deviceId }));
    }
    const accepted: { id: string; rev: number }[] = [];
    const conflicts: Shared[] = [];
    const blind: UnreadableRecord[] = [];
    try {
      for (let at = 0; at < sealed.length; at += 200) {
        const answer = await pushFamily<FamilyValue>(api, family, sealed.slice(at, at + 200));
        accepted.push(...answer.accepted);
        conflicts.push(...answer.conflicts);
        blind.push(...answer.unreadable);
      }
    } catch (error) {
      // Its key changed since the family was opened: opened again next round, and sealed anew.
      if (!(error instanceof SyncHttpError && error.status === 409)) throw error;
      again = true;
    }
    sent.push({ vaultId, plan, accepted, conflicts, blind });
  }
  if (!sent.length) return again;

  await turn(async (data) => {
    let next = data;
    for (const { vaultId, plan, accepted, conflicts, blind } of sent) {
      const place = { orgId: org.id, vaultId };
      if (!familyLinkOf(next, org.id)?.vaults.some((vault) => vault.id === vaultId)) continue;
      const { vault } = familyVault(next, place);
      // A newer revision there comes back opened: joined with this one, which goes up again above it.
      const merged = await mergeFamilyPulled({ ...vault, known: acceptPushed(vault.known, plan, accepted) }, conflicts, blind);
      next = inFamilyVault(next, place, () => merged.vault);
    }
    return { data: next, value: undefined };
  });
  return again || sent.some(({ conflicts, blind }) => conflicts.length > 0 || blind.length > 0);
}
