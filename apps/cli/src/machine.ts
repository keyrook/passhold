/**
 * `passhold machine`: owner and machine-side commands for agents, agent
 * vaults, enrollments, tokens, grants, rekeying, exposure reports, audit logs,
 * and key replacement / restore recovery.
 *
 * Machine-side commands (`enroll`, `status`, `pull`) work on EVERY plan with
 * no owner session (`PASSHOLD_SESSION`) required.
 */
import { readFileSync } from 'node:fs';
import {
  beginMachineEnrollment,
  confirmMachineEnrollment,
  createAgentVault,
  createMachineToken,
  finishMachineRekey,
  forgetMachines,
  giveMachineItems,
  MACHINE_LIFETIME,
  machineEnrollmentStatus,
  machineLogGaps,
  moveAgentsToNewKey,
  openAgentVaults,
  openAgents,
  openGivenRecord,
  parseMachineToken,
  pullMachine,
  putAgentItem,
  readMachineAudit,
  readMachineCalls,
  readMachineStatus,
  removeMachine,
  renewMachine,
  resumeMachine,
  reviewMachineEnrollment,
  sendAgentsBack,
  startAgentsAfresh,
  stopAllMachines,
  submitMachineEnrollment,
  syncAgentVault,
  turnOnAgents,
  withdrawMachineItems,
  type AgentItem,
  type AgentsState,
  type MachineApproval,
  type MachineClient,
  type MachineIdentity,
  type MachineUse,
  type OpenedAgentVault,
  type OwnerProofFields,
  type PendingMachine,
  type TrustedAgents,
} from '@keyrook/account';
import {
  agentItemFromLogin,
  agentItemFromWallet,
  describeAgentItem,
  exposedKeysFor,
  extractAgentField,
  knownAgentRecordOf,
  listAgentMachines,
  mergeKnownAgentItems,
  openOrRecoverAgents,
  refreshEditedAgentItemGrants,
  toStoredAgentsState,
  type AgentItemValue,
  type ApiKeyItem,
  type LoginItem,
  type NoteItem,
  type SshKeyItem,
} from '@passhold/core';
import type { Account } from './account.js';
import type { Context } from './cli.js';
import { assignments, draftWith, KINDS, type Kind } from './edit.js';
import { CliError } from './reference.js';
import {
  exportMemberKey,
  exportVerifyKey,
  identityOfStoredMachine,
  importMemberKey,
  type CachedMachineItem,
  type CachedMachineState,
  type Store,
  type StoredEnrolledMachine,
} from './store.js';

export interface MachineCommandDeps {
  store: Store;
  account: Account;
  now: () => number;
  say: (line: string) => void;
  flags: Map<string, string | true>;
}

const DAY_MS = 24 * 60 * 60_000;
const MACHINE_USES: readonly MachineUse[] = ['request', 'run', 'fill', 'reveal'];
const MACHINE_APPROVALS: readonly MachineApproval[] = ['standing', 'session', 'each'];

const flagText = (flags: Map<string, string | true>, name: string): string | undefined => {
  const value = flags.get(name);
  return typeof value === 'string' ? value : undefined;
};

const flagInt = (flags: Map<string, string | true>, name: string, min: number, max: number): number | undefined => {
  const raw = flagText(flags, name);
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) throw new CliError(`--${name} must be an integer between ${min} and ${max}.`);
  return n;
};

/** Returns `PASSHOLD_MACHINE_TOKEN` from `env` regardless of casing (Windows compatibility). */
export function envMachineToken(env: NodeJS.ProcessEnv): string | undefined {
  for (const [k, v] of Object.entries(env)) {
    if (k.toUpperCase() === 'PASSHOLD_MACHINE_TOKEN' && v && v.trim()) return v.trim();
  }
  return undefined;
}

/** Returns true if `PASSHOLD_SESSION` (in any casing) is present and non-empty in `env`. */
export function hasPassholdSession(env: NodeJS.ProcessEnv): boolean {
  for (const [k, v] of Object.entries(env)) {
    if (k.toUpperCase() === 'PASSHOLD_SESSION' && v && v.trim()) return true;
  }
  return false;
}

export interface LoadedMachine {
  kind: 'token' | 'enrolled';
  identity: MachineIdentity;
  /** Invitation id for enrolled machines; machine's own id for token machines. */
  invitationId: string;
  expiresAt: number;
  confirmed: boolean;
  stored?: StoredEnrolledMachine;
}

/** Loads the machine identity from `PASSHOLD_MACHINE_TOKEN` or enrolled `machine.json`. */
export async function loadMachineIdentity(store: Store, env: NodeJS.ProcessEnv): Promise<LoadedMachine | null> {
  const tokenText = envMachineToken(env);
  if (tokenText) {
    const parsed = await parseMachineToken(tokenText);
    return {
      kind: 'token',
      identity: {
        credentials: parsed.credentials,
        key: parsed.key,
        pinned: parsed.pinned,
      },
      invitationId: parsed.machineId,
      expiresAt: parsed.expiresAt,
      confirmed: true,
    };
  }
  const stored = store.machine();
  if (!stored) return null;
  const identity = await identityOfStoredMachine(stored);
  return {
    kind: 'enrolled',
    identity,
    invitationId: stored.invitationId,
    expiresAt: stored.expiresAt,
    confirmed: stored.confirmed,
    stored,
  };
}

/** Ensures an enrolled machine has finalized its activation if still pending confirmation. */
export async function ensureMachineConfirmed(
  client: MachineClient,
  store: Store,
  loaded: LoadedMachine,
  now: number,
): Promise<LoadedMachine> {
  if (loaded.confirmed || loaded.kind !== 'enrolled' || !loaded.stored) return loaded;
  const pending: PendingMachine = {
    accountId: loaded.stored.accountId,
    machineId: loaded.stored.machineId,
    invitationId: loaded.stored.invitationId,
    key: loaded.identity.key,
    credential: loaded.stored.credential,
    authority: loaded.stored.authority,
    code: '',
  };
  const check = await machineEnrollmentStatus(client, pending, now);
  if (!check.confirmed) {
    throw new CliError('This machine is waiting to be confirmed in Passhold.');
  }
  const updated: StoredEnrolledMachine = { ...loaded.stored, confirmed: true, expiresAt: check.expiresAt };
  store.saveMachine(updated);
  return { ...loaded, confirmed: true, expiresAt: check.expiresAt, stored: updated };
}

/**
 * Pulls the machine's granted items from the server, verifies signatures and
 * anti-rollback marks, merges into the sealed local cache, and returns the
 * updated state.
 */
export async function pullMachineIntoCache(
  client: MachineClient,
  store: Store,
  env: NodeJS.ProcessEnv,
  loaded: LoadedMachine,
  now: number,
): Promise<CachedMachineState> {
  const cacheFile = store.cachePath(env);
  const { accountId, machineId } = loaded.identity.credentials;
  const prev = await store.readMachineCache(loaded.identity.key, accountId, machineId, cacheFile);
  const pulled = await pullMachine<AgentItemValue>(client, loaded.identity, prev?.marks ?? null, now);

  const epochChanged = Boolean(prev?.marks.epoch && pulled.marks.epoch && prev.marks.epoch !== pulled.marks.epoch);
  const items: Record<string, CachedMachineItem> = epochChanged ? {} : { ...(prev?.items ?? {}) };
  for (const w of pulled.withdrawn) {
    delete items[`${w.vault}:${w.item}`];
  }
  for (const given of pulled.given) {
    const key = `${given.vault}:${given.item}`;
    const existing = items[key];
    // For standing grants, `pullMachine` already opened `given.record.value`; for session/each grants, keep record box so a session key can open it.
    let value: AgentItemValue | null = null;
    if (given.grant.approval === 'standing') {
      value = given.record?.value ?? (given.key ? await openGivenRecord<AgentItemValue>(accountId, given, given.key) : null);
    } else if (existing && existing.version === given.version && existing.rev === (given.record?.rev ?? existing.rev)) {
      value = existing.value;
    }
    items[key] = {
      vault: given.vault,
      item: given.item,
      version: given.version,
      grant: given.grant,
      listing: given.listing,
      delivery: given.delivery,
      value,
      rev: given.record?.rev ?? 0,
      deleted: given.record?.deleted ?? false,
      recordBox: given.record?.box ?? null,
      recordWriteKey: await exportVerifyKey(given.verify),
    };
  }

  const next: CachedMachineState = {
    marks: pulled.marks,
    items,
    pendingLogs: prev?.pendingLogs ?? [],
    machineExpiresAt: loaded.expiresAt || prev?.machineExpiresAt || 0,
  };
  await store.writeMachineCache(loaded.identity.key, accountId, machineId, next, cacheFile);
  return next;
}

/** Resolves a `passhold://vault/item/field` reference against a machine's standing cached items (free on all plans). */
export function resolveMachineReference(
  cache: CachedMachineState,
  rawRef: string,
): { value: string; item: CachedMachineItem; field: string } {
  const match = /^passhold:\/\/([^/]+)\/([^/]+)(?:\/(.+))?$/i.exec(rawRef);
  if (!match) throw new CliError(`Invalid reference: ${rawRef}`);
  const vaultWanted = decodeURIComponent(match[1]!).trim().toLowerCase();
  const itemWanted = decodeURIComponent(match[2]!).trim().toLowerCase();
  const fieldWanted = match[3] ? decodeURIComponent(match[3]).trim() : 'key';

  const live = Object.values(cache.items).filter((entry) => !entry.deleted);
  const matched = live.filter((entry) => {
    const ref = (entry.listing.ref ?? '').toLowerCase();
    const title = (entry.listing.title ?? '').toLowerCase();
    const vaultMatch = entry.vault.toLowerCase() === vaultWanted || ref.startsWith(`passhold://${vaultWanted}/`);
    const itemMatch = entry.item.toLowerCase() === itemWanted || title === itemWanted;
    return vaultMatch && itemMatch;
  });
  if (matched.length === 0) throw new CliError(`No granted item matches ${rawRef}.`);
  if (matched.length > 1) throw new CliError(`Multiple granted items match ${rawRef}; use the item id.`);
  const chosen = matched[0]!;
  if (chosen.grant.approval !== 'standing' || !chosen.value) {
    throw new CliError(`"${chosen.listing.title || chosen.item}" requires interactive approval (use passhold mcp).`);
  }
  const value = extractAgentField(chosen.value, fieldWanted);
  if (value === null) throw new CliError(`Item "${chosen.listing.title || chosen.item}" has no field "${fieldWanted}".`);
  return { value, item: chosen, field: fieldWanted };
}

async function promptOwnerProof(context: Context, account: Account, prompt: string): Promise<OwnerProofFields> {
  const password = await context.secret(prompt);
  return account.ownerProof({ password });
}

function findMachineId(trusted: TrustedAgents, query: string): string {
  if (trusted.pins.has(query)) return query;
  const matches = [...trusted.pins.entries()].filter(([, pin]) => pin.name.toLowerCase() === query.toLowerCase());
  if (matches.length === 1) return matches[0]![0];
  if (matches.length > 1) throw new CliError(`Multiple machines are named "${query}". Use an id: ${matches.map(([id]) => id).join(', ')}`);
  throw new CliError(`No machine named "${query}". Run: passhold machine list`);
}

function findVault(vaults: readonly OpenedAgentVault[], query: string): OpenedAgentVault {
  const byId = vaults.find((v) => v.id === query);
  if (byId) return byId;
  const byName = vaults.filter((v) => v.name.toLowerCase() === query.toLowerCase());
  if (byName.length === 1) return byName[0]!;
  if (byName.length > 1) throw new CliError(`Multiple agent vaults are named "${query}". Use an id.`);
  throw new CliError(`No agent vault named "${query}". Run: passhold machine vault list`);
}

function findAgentItem(items: readonly AgentItem<AgentItemValue>[], query: string): AgentItem<AgentItemValue> {
  const live = items.filter((entry) => !entry.deleted);
  const byId = live.find((entry) => entry.item === query);
  if (byId) return byId;
  const byTitle = live.filter((entry) => (entry.value?.title ?? '').toLowerCase() === query.toLowerCase());
  if (byTitle.length === 1) return byTitle[0]!;
  if (byTitle.length > 1) throw new CliError(`Multiple items are named "${query}". Use an id.`);
  throw new CliError(`No item named "${query}" in that agent vault.`);
}

async function openOwnerAgents(
  account: Account,
  store: Store,
  env: NodeJS.ProcessEnv,
  now: () => number,
) {
  const unlocked = await store.session(env.PASSHOLD_SESSION, now());
  const ctx = await account.agents(unlocked);
  const opened = await openOrRecoverAgents(ctx.api, ctx.productKey, ctx.account.agents, { previous: ctx.previous, autoMove: false });
  return { ...ctx, unlocked, opened };
}

function requireOpenAgents(
  opened: Awaited<ReturnType<typeof openOrRecoverAgents>>,
): TrustedAgents {
  if (opened.status === 'not-offered') throw new CliError('Agents are not offered on this server yet.');
  if (opened.status === 'off') throw new CliError('Agents are not turned on yet. Run: passhold machine init');
  if (opened.status === 'key-replaced') {
    throw new CliError('Passhold’s key was replaced. Run `passhold machine move` (if this device holds the previous key) or `passhold machine reset`.');
  }
  return opened.status === 'sent-back' ? opened.result.trusted : opened.trusted;
}

async function printExposedKeys(
  api: Parameters<typeof openAgentVaults>[0] & Parameters<typeof syncAgentVault>[0],
  trusted: TrustedAgents,
  productKey: Parameters<typeof openAgentVaults>[2],
  say: (line: string) => void,
  out: (text: string) => void,
  asJson = false,
): Promise<void> {
  const vaults = await openAgentVaults(api, trusted, productKey);
  const allItems: AgentItem<AgentItemValue>[] = [];
  for (const vault of vaults) {
    const synced = await syncAgentVault<AgentItemValue>(api, trusted, productKey, vault);
    allItems.push(...synced.items);
  }
  const exposed = await exposedKeysFor(trusted, allItems);
  if (asJson) {
    out(`${JSON.stringify(exposed, null, 2)}\n`);
    return;
  }
  if (!exposed.length) {
    say('No keys were exposed to removed machines.');
    return;
  }
  say('Keys the agent could read:');
  for (const entry of exposed) {
    const state = entry.stillCurrent ? 'STILL CURRENT — replace at service' : 'already rotated';
    const url = entry.replaceUrl ? ` (${entry.replaceUrl})` : '';
    say(`  - ${entry.title} [${entry.machineName}] — ${state}${url}`);
  }
}

export async function runMachine(
  context: Context,
  positional: string[],
  deps: MachineCommandDeps,
): Promise<number> {
  const { store, account, now, say, flags } = deps;
  const [sub, ...rest] = positional;
  if (!sub) {
    throw new CliError(
      'Usage: passhold machine <enroll|status|pull|init|list|invite|confirm|token|grant|withdraw|rekey|remove|stop-all|resume|renew|forget|exposed|audit|move|send-back|reset|vault>',
    );
  }

  // --- Machine-side subcommands (free on EVERY plan, no owner session) -------------------
  if (sub === 'enroll') {
    const invitation = rest[0] || (await context.secret('Invitation (phi_...): ')).trim();
    if (!invitation) throw new CliError('Usage: passhold machine enroll <phi_...>');
    const client = account.machineClient();
    const pending = await submitMachineEnrollment(client, invitation);
    const exported = await exportMemberKey(pending.key);
    const stored: StoredEnrolledMachine = {
      api: account.api,
      accountId: pending.accountId,
      machineId: pending.machineId,
      invitationId: pending.invitationId,
      privateKey: exported.privateKey,
      publicKey: exported.publicKey,
      credential: pending.credential,
      authority: pending.authority,
      expiresAt: 0,
      confirmed: false,
    };
    store.saveMachine(stored);
    context.out(`${pending.code}\n`);
    say(`Machine id: ${pending.machineId}`);
    say(`Compare this code in Passhold to confirm: ${pending.code}`);
    if (flags.has('wait')) {
      const timeoutSec = flagInt(flags, 'timeout', 5, 600) ?? 120;
      const deadline = now() + timeoutSec * 1000;
      while (now() < deadline) {
        const status = await machineEnrollmentStatus(client, pending, now());
        if (status.confirmed) {
          store.saveMachine({ ...stored, confirmed: true, expiresAt: status.expiresAt });
          say(`Confirmed. Valid until ${new Date(status.expiresAt).toISOString()}.`);
          return 0;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      throw new CliError('Timed out waiting for confirmation in Passhold.');
    }
    return 0;
  }

  if (sub === 'status') {
    const loaded = await loadMachineIdentity(store, context.env);
    if (!loaded) throw new CliError('No machine enrolled and PASSHOLD_MACHINE_TOKEN is not set.');
    const client = account.machineClient();
    const confirmed = await ensureMachineConfirmed(client, store, loaded, now());
    const status = await readMachineStatus(client, confirmed.identity, confirmed.invitationId, now());
    if (confirmed.kind === 'enrolled' && confirmed.stored && confirmed.stored.expiresAt !== status.expiresAt) {
      store.saveMachine({ ...confirmed.stored, expiresAt: status.expiresAt, confirmed: true });
    }
    const cache = await store.readMachineCache(
      confirmed.identity.key,
      confirmed.identity.credentials.accountId,
      confirmed.identity.credentials.machineId,
      store.cachePath(context.env),
    );
    const itemCount = Object.values(cache?.items ?? {}).filter((i) => !i.deleted).length;
    const summary = {
      machineId: confirmed.identity.credentials.machineId,
      kind: confirmed.kind,
      status: status.status,
      expiresAt: status.expiresAt,
      cachedItems: itemCount,
    };
    if (flags.has('json')) {
      context.out(`${JSON.stringify(summary, null, 2)}\n`);
    } else {
      context.out(`${[summary.machineId, summary.kind, summary.status, new Date(summary.expiresAt).toISOString(), `${itemCount} items`].join('\t')}\n`);
    }
    return 0;
  }

  if (sub === 'pull') {
    const loaded = await loadMachineIdentity(store, context.env);
    if (!loaded) throw new CliError('No machine enrolled and PASSHOLD_MACHINE_TOKEN is not set.');
    const client = account.machineClient();
    const confirmed = await ensureMachineConfirmed(client, store, loaded, now());
    const status = await readMachineStatus(client, confirmed.identity, confirmed.invitationId, now());
    const updatedLoaded: LoadedMachine = { ...confirmed, expiresAt: status.expiresAt };
    if (confirmed.kind === 'enrolled' && confirmed.stored) {
      store.saveMachine({ ...confirmed.stored, confirmed: true, expiresAt: status.expiresAt });
    }
    const cached = await pullMachineIntoCache(client, store, context.env, updatedLoaded, now());
    const live = Object.values(cached.items).filter((entry) => !entry.deleted);
    if (flags.has('json')) {
      context.out(
        `${JSON.stringify(
          live.map((entry) => ({
            vault: entry.vault,
            item: entry.item,
            title: entry.listing.title ?? entry.item,
            kind: entry.listing.kind ?? 'apikey',
            uses: entry.grant.uses,
            approval: entry.grant.approval,
            hosts: entry.delivery.hosts,
          })),
          null,
          2,
        )}\n`,
      );
    } else {
      for (const entry of live) {
        context.out(`${[entry.vault, entry.item, entry.listing.title ?? entry.item, entry.grant.approval, entry.grant.uses.join(',')].join('\t')}\n`);
      }
      if (!live.length) say('No items granted to this machine.');
    }
    return 0;
  }

  // --- Owner-side subcommands -----------------------------------------------------------
  if (sub === 'init') {
    const { api, productKey, account: storedAccount, opened } = await openOwnerAgents(account, store, context.env, now);
    if (opened.status === 'not-offered') throw new CliError('Agents are not offered on this server yet.');
    let trusted: TrustedAgents;
    if (opened.status === 'off') {
      trusted = await turnOnAgents(api, productKey);
      say('Agents turned on for this account.');
    } else {
      trusted = requireOpenAgents(opened);
      say('Agents are already turned on for this account.');
    }
    account.saveAgentsState(toStoredAgentsState(trusted, storedAccount.agents));
    return 0;
  }

  if (sub === 'move') {
    const unlocked = await store.session(context.env.PASSHOLD_SESSION, now());
    const ctx = await account.agents(unlocked);
    if (!ctx.previous) throw new CliError('This device does not hold Passhold’s previous key. Run `passhold machine reset` to start agents afresh.');
    const trusted = await moveAgentsToNewKey(ctx.api, ctx.previous, ctx.productKey, ctx.account.agents?.checkpoint ?? null, {
      known: knownAgentRecordOf(ctx.account.agents?.known),
    });
    account.saveAgentsState(toStoredAgentsState(trusted, ctx.account.agents), { clearMove: true });
    say('Moved agents to Passhold’s new key. All previous machines were removed and must be enrolled again.');
    return 0;
  }

  if (sub === 'send-back') {
    const unlocked = await store.session(context.env.PASSHOLD_SESSION, now());
    const ctx = await account.agents(unlocked);
    if (!ctx.account.agents?.checkpoint || !ctx.account.agents.state) {
      throw new CliError('No saved agent snapshot on this device to send back.');
    }
    const result = await sendAgentsBack(
      ctx.api,
      ctx.productKey,
      ctx.account.agents.checkpoint,
      ctx.account.agents.state as unknown as AgentsState,
    );
    account.saveAgentsState(toStoredAgentsState(result.trusted, ctx.account.agents));
    say(result.sent ? 'Restored agent state sent back to server.' : 'Server already matches what this device trusted.');
    if (result.lostVaults.length) say(`Vaults lost on server: ${result.lostVaults.join(', ')}`);
    if (result.lostItems.length) say(`Items lost on server: ${result.lostItems.length}`);
    return 0;
  }

  if (sub === 'reset') {
    const unlocked = await store.session(context.env.PASSHOLD_SESSION, now());
    const ctx = await account.agents(unlocked);
    const proof = await promptOwnerProof(context, account, 'Account password, to start agents afresh: ');
    const trusted = await startAgentsAfresh(ctx.api, ctx.productKey, proof);
    account.saveAgentsState(toStoredAgentsState(trusted), { clearMove: true });
    say('Agents started afresh under Passhold’s current key.');
    return 0;
  }

  // Remaining owner subcommands need agents open & trusted.
  const ctx = await openOwnerAgents(account, store, context.env, now);
  const trusted = requireOpenAgents(ctx.opened);
  account.saveAgentsState(toStoredAgentsState(trusted, ctx.account.agents));

  switch (sub) {
    case 'list': {
      const machines = listAgentMachines(trusted, now());
      if (flags.has('json')) {
        context.out(`${JSON.stringify(machines, null, 2)}\n`);
      } else {
        for (const m of machines) {
          context.out(
            `${[m.id, m.name, m.kind, m.status, `${m.grantsCount} grants`, m.keysWaiting ? `${m.keysWaiting} rekey due` : 'ok'].join('\t')}\n`,
          );
        }
        if (!machines.length) say('No machines yet. Run: passhold machine invite or passhold machine token');
      }
      return 0;
    }

    case 'invite': {
      const made = await beginMachineEnrollment(ctx.api, trusted, ctx.productKey.accountId);
      context.out(`${made.text}\n`);
      say(`Invitation id: ${made.invitationId}`);
      say('Give the phi_... invitation to the machine, then run: passhold machine confirm <invitationId> --name <name>');
      return 0;
    }

    case 'confirm': {
      const invitationId = rest[0];
      const name = flagText(flags, 'name');
      if (!invitationId || !name) throw new CliError('Usage: passhold machine confirm <invitationId> --name <name> [--days <1-365>]');
      const candidate = await reviewMachineEnrollment(ctx.api, trusted, ctx.productKey.accountId, invitationId);
      if (!candidate) throw new CliError('No machine has answered that invitation yet.');
      const askLine = context.line ?? context.secret;
      const answer = (await askLine(`Does the machine show code ${candidate.code}? [y/N] `)).trim();
      if (!/^y(es)?$/i.test(answer)) throw new CliError('Enrollment cancelled — codes were not confirmed.');
      const days = flagInt(flags, 'days', 1, 365);
      const proof = await promptOwnerProof(context, account, 'Account password, to confirm machine: ');
      const cp = await confirmMachineEnrollment(ctx.api, trusted, ctx.productKey, candidate, {
        name,
        ...(days ? { lifetime: days * DAY_MS } : {}),
        proof,
      });
      const refreshed = await openAgents(ctx.api, ctx.productKey, cp);
      account.saveAgentsState(toStoredAgentsState(refreshed, ctx.account.agents));
      context.out(`${candidate.machineId}\n`);
      say(`Confirmed machine "${name}" (${candidate.machineId}).`);
      return 0;
    }

    case 'token': {
      const name = flagText(flags, 'name') ?? rest[0];
      if (!name) throw new CliError('Usage: passhold machine token --name <name> [--days <1-365>]');
      const days = flagInt(flags, 'days', 1, 365);
      const proof = await promptOwnerProof(context, account, 'Account password, to create machine token: ');
      const made = await createMachineToken(ctx.api, trusted, ctx.productKey, {
        name,
        ...(days ? { lifetime: days * DAY_MS } : {}),
        proof,
      });
      const refreshed = await openAgents(ctx.api, ctx.productKey, made.checkpoint);
      account.saveAgentsState(toStoredAgentsState(refreshed, ctx.account.agents));
      context.out(`${made.token}\n`);
      say(`Machine id: ${made.machineId}. Save this token now — it is shown once.`);
      return 0;
    }

    case 'grant': {
      const [machineQuery, target] = rest;
      if (!machineQuery || !target || !target.includes('/')) {
        throw new CliError('Usage: passhold machine grant <machine> <vault>/<item> [--uses request,run] [--approval each|session|standing]');
      }
      const machineId = findMachineId(trusted, machineQuery);
      const [vaultQuery, itemQuery] = target.split(/\/(.*)/s) as [string, string];
      const vaults = await openAgentVaults(ctx.api, trusted, ctx.productKey);
      const vault = findVault(vaults, vaultQuery);
      const synced = await syncAgentVault<AgentItemValue>(ctx.api, trusted, ctx.productKey, vault);
      const item = findAgentItem(synced.items, itemQuery);
      const usesRaw = (flagText(flags, 'uses') ?? 'request').split(',').map((u) => u.trim()).filter(Boolean) as MachineUse[];
      if (!usesRaw.length || !usesRaw.every((u) => MACHINE_USES.includes(u))) {
        throw new CliError(`--uses must be a comma-separated subset of: ${MACHINE_USES.join(', ')}`);
      }
      const approval = (flagText(flags, 'approval') ?? 'each') as MachineApproval;
      if (!MACHINE_APPROVALS.includes(approval)) {
        throw new CliError(`--approval must be one of: ${MACHINE_APPROVALS.join(', ')}`);
      }
      const sessionSec = flagInt(flags, 'session', 60, 86_400);
      const days = flagInt(flags, 'days', 1, 365);
      const bounds: Record<string, unknown> = {};
      const methods = flagText(flags, 'methods');
      if (methods) bounds.methods = methods.split(',').map((m) => m.trim().toUpperCase()).filter(Boolean);
      const paths = flagText(flags, 'paths');
      if (paths) bounds.paths = paths.split(',').map((p) => p.trim()).filter(Boolean);
      const commands = flagText(flags, 'commands');
      if (commands) bounds.commands = commands.split(',').map((c) => c.trim()).filter(Boolean);
      const hosts = flagText(flags, 'hosts');
      if (hosts) bounds.hosts = hosts.split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);

      const { listing, delivery } = describeAgentItem(item, vault.name);
      const result = await giveMachineItems(
        ctx.api,
        trusted,
        ctx.productKey,
        machineId,
        [
          {
            vault,
            item,
            uses: usesRaw,
            approval,
            ...(sessionSec !== undefined ? { session: sessionSec } : {}),
            bounds,
            expiresAt: days ? now() + days * DAY_MS : null,
            listing,
            delivery,
          },
        ],
        now(),
      );
      const refreshed = await openAgents(ctx.api, ctx.productKey, result.checkpoint);
      account.saveAgentsState(toStoredAgentsState(refreshed, ctx.account.agents));
      say(`Granted "${listing.title}" to machine ${trusted.pins.get(machineId)?.name ?? machineId} (${approval}: ${usesRaw.join(', ')}).`);
      return 0;
    }

    case 'withdraw': {
      const [machineQuery, target] = rest;
      if (!machineQuery || !target || !target.includes('/')) {
        throw new CliError('Usage: passhold machine withdraw <machine> <vault>/<item>');
      }
      const machineId = findMachineId(trusted, machineQuery);
      const [vaultQuery, itemQuery] = target.split(/\/(.*)/s) as [string, string];
      const vaults = await openAgentVaults(ctx.api, trusted, ctx.productKey);
      const vault = findVault(vaults, vaultQuery);
      const synced = await syncAgentVault<AgentItemValue>(ctx.api, trusted, ctx.productKey, vault);
      const item = findAgentItem(synced.items, itemQuery);
      const result = await withdrawMachineItems(ctx.api, trusted, ctx.productKey, machineId, [{ vault: vault.id, item: item.item }], now());
      let refreshed = await openAgents(ctx.api, ctx.productKey, result.checkpoint);
      if (result.rekey.length > 0 && !flags.has('no-rekey')) {
        const rekeyed = await finishMachineRekey(ctx.api, refreshed, ctx.productKey, (entry) => describeAgentItem(entry, vault.name), {
          now: now(),
          known: knownAgentRecordOf(ctx.account.agents?.known),
        });
        refreshed = await openAgents(ctx.api, ctx.productKey, rekeyed.checkpoint);
        say(`Withdrew item and rekeyed ${rekeyed.replaced.length} item key${rekeyed.replaced.length === 1 ? '' : 's'}.`);
      } else {
        say(`Withdrew item from ${trusted.pins.get(machineId)?.name ?? machineId}.`);
      }
      account.saveAgentsState(toStoredAgentsState(refreshed, ctx.account.agents));
      return 0;
    }

    case 'rekey': {
      const vaults = await openAgentVaults(ctx.api, trusted, ctx.productKey);
      const names = new Map(vaults.map((v) => [v.id, v.name]));
      const result = await finishMachineRekey(ctx.api, trusted, ctx.productKey, (entry) => describeAgentItem(entry, names.get(entry.vault)), {
        now: now(),
        known: knownAgentRecordOf(ctx.account.agents?.known),
      });
      const refreshed = await openAgents(ctx.api, ctx.productKey, result.checkpoint);
      account.saveAgentsState(toStoredAgentsState(refreshed, ctx.account.agents));
      say(`Replaced ${result.replaced.length} item key${result.replaced.length === 1 ? '' : 's'}.`);
      return 0;
    }

    case 'remove': {
      const machineQuery = rest[0];
      if (!machineQuery) throw new CliError('Usage: passhold machine remove <machine>');
      const machineId = findMachineId(trusted, machineQuery);
      const proof = await promptOwnerProof(context, account, 'Account password, to remove machine: ');
      const ended = await removeMachine(ctx.api, trusted, ctx.productKey, machineId, proof);
      const refreshed = await openAgents(ctx.api, ctx.productKey, ended.checkpoint);
      account.saveAgentsState(toStoredAgentsState(refreshed, ctx.account.agents));
      say(`Removed machine "${trusted.pins.get(machineId)?.name ?? machineId}".`);
      if (ended.rekey.length) say(`${ended.rekey.length} item key(s) wait for rekey: run \`passhold machine rekey\`.`);
      await printExposedKeys(ctx.api, refreshed, ctx.productKey, say, context.out, false);
      return 0;
    }

    case 'stop-all': {
      const proof = await promptOwnerProof(context, account, 'Account password, to stop all machines: ');
      const ended = await stopAllMachines(ctx.api, trusted, ctx.productKey, proof);
      const refreshed = await openAgents(ctx.api, ctx.productKey, ended.checkpoint);
      account.saveAgentsState(toStoredAgentsState(refreshed, ctx.account.agents));
      say(`Stopped ${ended.removed.length} machine${ended.removed.length === 1 ? '' : 's'}.`);
      await printExposedKeys(ctx.api, refreshed, ctx.productKey, say, context.out, false);
      return 0;
    }

    case 'resume': {
      const machineQuery = rest[0];
      if (!machineQuery) throw new CliError('Usage: passhold machine resume <machine>');
      const machineId = findMachineId(trusted, machineQuery);
      const proof = await promptOwnerProof(context, account, 'Account password, to resume machine: ');
      await resumeMachine(ctx.api, trusted, machineId, proof, now());
      say(`Resumed machine "${trusted.pins.get(machineId)?.name ?? machineId}".`);
      return 0;
    }

    case 'renew': {
      const machineQuery = rest[0];
      if (!machineQuery) throw new CliError('Usage: passhold machine renew <machine> [--days <1-365>] [--token <pht_...>]');
      const machineId = findMachineId(trusted, machineQuery);
      const pin = trusted.pins.get(machineId)!;
      const days = flagInt(flags, 'days', 1, 365);
      const lifetime = days ? days * DAY_MS : MACHINE_LIFETIME[pin.kind];
      const currentToken = flagText(flags, 'token');
      const proof = await promptOwnerProof(context, account, 'Account password, to renew machine: ');
      const renewed = await renewMachine(
        ctx.api,
        trusted,
        ctx.productKey,
        machineId,
        {
          lifetime,
          proof,
          ...(currentToken ? { token: currentToken } : {}),
        },
        now(),
      );
      const refreshed = await openAgents(ctx.api, ctx.productKey, renewed.checkpoint);
      account.saveAgentsState(toStoredAgentsState(refreshed, ctx.account.agents));
      if (renewed.token) context.out(`${renewed.token}\n`);
      say(`Renewed machine "${pin.name}" until ${new Date(renewed.expiresAt).toISOString()}.`);
      return 0;
    }

    case 'forget': {
      const machineQuery = rest[0];
      if (!machineQuery) throw new CliError('Usage: passhold machine forget <machine> [--keys-replaced]');
      const machineId = findMachineId(trusted, machineQuery);
      const proof = await promptOwnerProof(context, account, 'Account password, to forget removed machine: ');
      const cp = await forgetMachines(ctx.api, trusted, ctx.productKey, [machineId], proof, {
        keysReplaced: flags.has('keys-replaced'),
      });
      const refreshed = await openAgents(ctx.api, ctx.productKey, cp);
      account.saveAgentsState(toStoredAgentsState(refreshed, ctx.account.agents));
      say(`Forgot removed machine ${machineId}.`);
      return 0;
    }

    case 'exposed': {
      await printExposedKeys(ctx.api, trusted, ctx.productKey, say, context.out, flags.has('json'));
      return 0;
    }

    case 'audit': {
      const since = flagInt(flags, 'since', 0, Number.MAX_SAFE_INTEGER) ?? 0;
      const audit = await readMachineAudit(ctx.api, trusted, ctx.productKey, since);
      const gaps = machineLogGaps(audit.entries, audit.refused);
      const calls = await readMachineCalls(ctx.api, trusted, 0);
      account.saveAgentsState(toStoredAgentsState(trusted, ctx.account.agents, { auditRev: audit.rev }));
      if (flags.has('json')) {
        context.out(`${JSON.stringify({ ...audit, gaps, calls }, null, 2)}\n`);
      } else {
        for (const entry of audit.entries) {
          const label = trusted.pins.get(entry.machineId)?.name ?? entry.machineId;
          context.out(`${[new Date(entry.at).toISOString(), label, `#${entry.sequence}`, JSON.stringify(entry.entry)].join('\t')}\n`);
        }
        for (const dec of audit.decisions) {
          const label = trusted.pins.get(dec.machineId)?.name ?? dec.machineId;
          context.out(`${[new Date(dec.decidedAt).toISOString(), label, `decision:${dec.record.statement.outcome}`, dec.requestId].join('\t')}\n`);
        }
        if (gaps.length) say(`Warning: ${gaps.length} gap(s) detected in machine log sequence.`);
        if (!audit.entries.length && !audit.decisions.length) say('No audit entries yet.');
      }
      return 0;
    }

    case 'vault': {
      return runMachineVault(context, rest, ctx, trusted, deps);
    }

    default:
      throw new CliError(`Unknown machine subcommand "${sub}".`);
  }
}

async function runMachineVault(
  context: Context,
  rest: string[],
  ctx: Awaited<ReturnType<typeof openOwnerAgents>>,
  trusted: TrustedAgents,
  deps: MachineCommandDeps,
): Promise<number> {
  const { account, now, say, flags } = deps;
  const [verb, ...args] = rest;
  if (!verb) throw new CliError('Usage: passhold machine vault <list|create|items|add|edit|delete> …');

  const vaults = await openAgentVaults(ctx.api, trusted, ctx.productKey);
  if (verb === 'list') {
    if (flags.has('json')) {
      context.out(`${JSON.stringify(vaults.map((v) => ({ id: v.id, name: v.name, generation: v.generation })), null, 2)}\n`);
    } else {
      for (const v of vaults) context.out(`${[v.id, v.name, `gen ${v.generation}`].join('\t')}\n`);
      if (!vaults.length) say('No agent vaults yet. Run: passhold machine vault create <name>');
    }
    return 0;
  }

  if (verb === 'create') {
    const name = args.join(' ').trim();
    if (!name) throw new CliError('Usage: passhold machine vault create <name>');
    const made = await createAgentVault(ctx.api, trusted, ctx.productKey, name);
    const refreshed = await openAgents(ctx.api, ctx.productKey, made.checkpoint);
    account.saveAgentsState(toStoredAgentsState(refreshed, ctx.account.agents));
    context.out(`${made.vault.id}\n`);
    say(`Created agent vault "${made.vault.name}".`);
    return 0;
  }

  const vaultQuery = args[0];
  if (!vaultQuery) throw new CliError(`Usage: passhold machine vault ${verb} <vault> …`);
  const vault = findVault(vaults, vaultQuery);
  const synced = await syncAgentVault<AgentItemValue>(ctx.api, trusted, ctx.productKey, vault, {
    known: knownAgentRecordOf(ctx.account.agents?.known),
  });
  const known = mergeKnownAgentItems(ctx.account.agents?.known, synced.items);
  account.saveAgentsState(toStoredAgentsState(trusted, ctx.account.agents, { known }));

  if (verb === 'items') {
    const live = synced.items.filter((entry) => !entry.deleted);
    if (flags.has('json')) {
      context.out(
        `${JSON.stringify(
          live.map((entry) => ({
            id: entry.item,
            version: entry.version,
            rev: entry.rev,
            kind: entry.value?.kind ?? 'unknown',
            title: entry.value?.title ?? entry.item,
          })),
          null,
          2,
        )}\n`,
      );
    } else {
      for (const entry of live) {
        context.out(`${[entry.item, entry.value?.kind ?? 'unknown', entry.value?.title ?? entry.item, `v${entry.version} r${entry.rev}`].join('\t')}\n`);
      }
      if (!live.length) say(`Agent vault "${vault.name}" is empty.`);
    }
    return 0;
  }

  const reader = { secret: (prompt: string) => context.secret(prompt), file: (path: string) => readFileSync(path, 'utf8') };

  if (verb === 'add') {
    const kind = args[1] as Kind | undefined;
    if (!kind || !['apikey', 'login', 'note', 'ssh'].includes(kind)) {
      throw new CliError(`Usage: passhold machine vault add <vault> <apikey|login|note|ssh> [<field>=<value>…]`);
    }
    const given = await assignments(args.slice(2), reader);
    const draft = await draftWith(kind, null, given, {});
    const value = draftToAgentValue(kind, draft);
    const saved = await putAgentItem(ctx.api, trusted, ctx.productKey, vault, null, value);
    account.saveAgentsState(toStoredAgentsState(trusted, ctx.account.agents, { known: mergeKnownAgentItems(known, [saved.item]) }));
    context.out(`${saved.item.item}\n`);
    say(`Added "${value.title}" to agent vault "${vault.name}".`);
    return 0;
  }

  if (verb === 'edit') {
    const itemQuery = args[1];
    if (!itemQuery) throw new CliError('Usage: passhold machine vault edit <vault> <item> <field>=<value>…');
    const existing = findAgentItem(synced.items, itemQuery);
    if (!existing.value) throw new CliError('That item cannot be edited.');
    const kind = existing.value.kind as Kind;
    const given = await assignments(args.slice(2), reader);
    if (!given.length) throw new CliError('Specify at least one <field>=<value> to update.');
    const baseItem = agentValueToItem(existing.item, existing.value, now());
    const draft = await draftWith(kind, baseItem, given, {});
    const value = draftToAgentValue(kind, draft);
    const saved = await putAgentItem(ctx.api, trusted, ctx.productKey, vault, existing, value);
    const vaultNames = new Map(vaults.map((v) => [v.id, v.name]));
    const updated = await refreshEditedAgentItemGrants(ctx.api, trusted, ctx.productKey, vault, existing, saved.item, {
      now: now(),
      known,
      vaultNames,
    });
    account.saveAgentsState(
      toStoredAgentsState(updated.trusted, ctx.account.agents, {
        known: mergeKnownAgentItems(known, [saved.item, updated.item]),
      }),
    );
    const suffix = updated.refreshed > 0 ? ` (refreshed ${updated.refreshed} machine${updated.refreshed === 1 ? '' : 's'})` : '';
    say(`Updated "${value.title}" in agent vault "${vault.name}"${suffix}.`);
    return 0;
  }

  if (verb === 'delete') {
    const itemQuery = args[1];
    if (!itemQuery) throw new CliError('Usage: passhold machine vault delete <vault> <item>');
    const existing = findAgentItem(synced.items, itemQuery);
    const saved = await putAgentItem<AgentItemValue>(ctx.api, trusted, ctx.productKey, vault, existing, null);
    account.saveAgentsState(toStoredAgentsState(trusted, ctx.account.agents, { known: mergeKnownAgentItems(known, [saved.item]) }));
    say(`Deleted "${existing.value?.title ?? existing.item}" from agent vault "${vault.name}".`);
    return 0;
  }

  throw new CliError(`Unknown agent vault verb "${verb}".`);
}

function draftToAgentValue(kind: Kind, draft: Record<string, unknown>): AgentItemValue {
  const now = Date.now();
  const base = { id: 'tmp', favorite: false, createdAt: now, updatedAt: now, lastUsedAt: null, deletedAt: null, folder: '', fields: (draft.fields as LoginItem['fields']) ?? [] };
  if (kind === 'login') {
    return agentItemFromLogin({ ...base, title: String(draft.title ?? ''), username: String(draft.username ?? ''), password: String(draft.password ?? ''), urls: (draft.urls as string[]) ?? [], notes: String(draft.notes ?? ''), passwordChangedAt: now, history: [], passkey: null });
  }
  if (kind === 'apikey') {
    const item: ApiKeyItem = { ...base, kind: 'apikey', title: String(draft.title ?? ''), service: String(draft.service ?? ''), key: String(draft.key ?? ''), keyId: String(draft.keyId ?? ''), hosts: (draft.hosts as string[]) ?? [], sendAs: String(draft.sendAs ?? 'bearer'), env: String(draft.env ?? ''), environment: String(draft.environment ?? ''), scopes: String(draft.scopes ?? ''), issuedAt: (draft.issuedAt as number | null) ?? null, expiresAt: (draft.expiresAt as number | null) ?? null, notes: String(draft.notes ?? ''), history: [] };
    return agentItemFromWallet(item)!;
  }
  if (kind === 'note') {
    const item: NoteItem = { ...base, kind: 'note', title: String(draft.title ?? ''), text: String(draft.text ?? '') };
    return agentItemFromWallet(item)!;
  }
  if (kind === 'ssh') {
    const item: SshKeyItem = { ...base, kind: 'ssh', title: String(draft.title ?? ''), privateKey: String(draft.privateKey ?? ''), publicKey: String(draft.publicKey ?? ''), fingerprint: String(draft.fingerprint ?? ''), notes: String(draft.notes ?? '') };
    return agentItemFromWallet(item)!;
  }
  throw new CliError(`Agent vaults do not support kind "${kind}" (use ${KINDS.filter((k) => ['apikey', 'login', 'note', 'ssh'].includes(k)).join(', ')}).`);
}

function agentValueToItem(id: string, value: AgentItemValue, at: number): LoginItem | ApiKeyItem | NoteItem | SshKeyItem {
  const base = { id, title: value.title, favorite: false, createdAt: at, updatedAt: at, lastUsedAt: null, deletedAt: null, folder: '', fields: value.fields ?? [] };
  switch (value.kind) {
    case 'login':
      return { ...base, username: value.username, password: value.password, urls: value.urls, notes: value.notes, passwordChangedAt: at, history: [], passkey: null };
    case 'apikey':
      return { ...base, kind: 'apikey', service: value.service, key: value.key, keyId: value.keyId, hosts: value.hosts, sendAs: value.sendAs, env: value.env, environment: value.environment, scopes: value.scopes, issuedAt: value.issuedAt, expiresAt: value.expiresAt, notes: value.notes, history: [] };
    case 'note':
      return { ...base, kind: 'note', text: value.text };
    case 'ssh':
      return { ...base, kind: 'ssh', privateKey: value.privateKey, publicKey: value.publicKey, fingerprint: value.fingerprint, notes: value.notes };
  }
}

export { importMemberKey };
