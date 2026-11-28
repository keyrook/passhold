/**
 * Extension service worker agent flows: turns agents on, manages agent vaults
 * and items, enrollments, machine tokens, grants/withdrawals, request review
 * and approval, rekeying, "Keys the agent could read", audit logs, key
 * replacement moves / resets, server restore send-back, and archived agent
 * vault recovery.
 */
import {
  approveMachineUse,
  beginMachineEnrollment,
  confirmMachineEnrollment,
  createAgentVault,
  createMachineToken,
  denyMachineUse,
  dismissMachineInboxEntry,
  finishMachineRekey,
  forgetMachines,
  giveMachineItems,
  MACHINE_LIFETIME,
  machineLogGaps,
  moveAgentsToNewKey,
  openAgentVaults,
  openAgents,
  openArchivedAgents,
  putAgentItem,
  readArchivedAgentVault,
  readMachineAudit,
  readMachineCalls,
  readMachineInbox,
  removeMachine,
  renewMachine,
  resumeMachine,
  reviewMachineEnrollment,
  reviewMachineRequests,
  sendAgentsBack,
  settleMachines,
  startAgentsAfresh,
  stopAllMachines,
  syncAgentVault,
  turnOnAgents,
  withdrawMachineItems,
  type AgentCheckpoint,
  type AgentItem,
  type AgentsState,
  type HttpSyncAdapter,
  type MachineApproval,
  type MachineCandidate,
  type MachineOperation,
  type MachineUse,
  type OwnerProofFields,
  type ProductKey,
  type TrustedAgents,
} from '@keyrook/account';
import {
  agentApiKeyFromInbox,
  cleanHosts,
  describeAgentItem,
  exposedKeysFor,
  extractAgentField,
  knownAgentRecordOf,
  listAgentMachines,
  mergeKnownAgentItems,
  openOrRecoverAgents,
  parseAgentInboxApiKey,
  refreshEditedAgentItemGrants,
  serviceOfKey,
  toStoredAgentsState,
  type AgentItemValue,
  type AgentMachineSummary,
  type ApiKeyItem,
  type ExposedKeyEntry,
  type LoginItem,
  type NoteItem,
  type SshKeyItem,
  type StoredAgentsState,
  type WalletItem,
} from '@passhold/core';
import { fail } from '../i18n/errors.js';
import type {
  AgentsAuditView,
  AgentsOverview,
  AgentVaultSummary,
  PendingAgentInboxView,
  PendingAgentRequestView,
} from '../lib/messaging.js';

export interface AgentWorkerContext {
  api: HttpSyncAdapter;
  productKey: ProductKey;
  previous: ProductKey | null;
  deviceId: string;
  stored: StoredAgentsState | undefined;
  save: (agents: StoredAgentsState, options?: { clearMove?: boolean }) => Promise<void>;
}

const DAY_MS = 24 * 60 * 60_000;

function formatOpSummary(op: MachineOperation): string {
  switch (op.use) {
    case 'request':
      return `${op.method} ${op.url}`;
    case 'run':
      return `${op.argv.join(' ')} (${op.cwd})`;
    case 'fill':
      return `FILL ${op.url}`;
    case 'reveal':
      return `REVEAL ${op.field}`;
  }
}

async function buildOverview(ctx: AgentWorkerContext, trusted: TrustedAgents, now = Date.now()): Promise<AgentsOverview> {
  const vaults = await openAgentVaults(ctx.api, trusted, ctx.productKey);
  const vaultNames = new Map(vaults.map((v) => [v.id, v.name]));
  const allItems: AgentItem<AgentItemValue>[] = [];
  const vaultSummaries: AgentVaultSummary[] = [];
  let known = ctx.stored?.known;

  const machines: AgentMachineSummary[] = listAgentMachines(trusted, now);
  const liveIds = new Set(machines.filter((m) => m.status === 'live' || m.status === 'paused').map((m) => m.id));
  const grantsByPlace = new Map<string, { machineId: string; machineName: string; approval: MachineApproval }[]>();
  for (const machineId of liveIds) {
    const pin = trusted.pins.get(machineId);
    if (!pin) continue;
    for (const grant of pin.grants) {
      if (!grant.item || (grant.expiresAt !== null && grant.expiresAt <= now)) continue;
      const place = `${grant.vault}:${grant.item}`;
      const list = grantsByPlace.get(place) ?? [];
      list.push({ machineId, machineName: pin.name, approval: grant.approval });
      grantsByPlace.set(place, list);
    }
  }

  for (const vault of vaults) {
    const synced = await syncAgentVault<AgentItemValue>(ctx.api, trusted, ctx.productKey, vault, {
      known: knownAgentRecordOf(known),
    });
    known = mergeKnownAgentItems(known, synced.items);
    allItems.push(...synced.items);
    vaultSummaries.push({
      id: vault.id,
      name: vault.name,
      generation: vault.generation,
      items: synced.items
        .filter((item) => !item.deleted)
        .map((item) => ({
          id: item.item,
          vault: vault.id,
          version: item.version,
          rev: item.rev,
          kind: item.value?.kind ?? 'apikey',
          title: item.value?.title || item.item,
          service: item.value?.kind === 'apikey' ? item.value.service : '',
          hosts: item.value?.kind === 'apikey' ? item.value.hosts : [],
          grants: grantsByPlace.get(`${vault.id}:${item.item}`) ?? [],
        })),
    });
  }

  const nextStored = toStoredAgentsState(trusted, ctx.stored, { known });
  if (JSON.stringify(nextStored) !== JSON.stringify(ctx.stored)) {
    await ctx.save(nextStored);
  }

  const itemsByPlace = new Map(allItems.filter((i) => !i.deleted).map((i) => [`${i.vault}:${i.item}`, i]));
  const reviewed = await reviewMachineRequests(ctx.api, trusted, ctx.productKey, now);
  const requests: PendingAgentRequestView[] = reviewed.requests.map((entry) => {
    const req = entry.request.request;
    if (req.kind === 'use') {
      const item = itemsByPlace.get(`${req.vault}:${req.item}`);
      return {
        requestId: entry.request.place.requestId,
        machineId: entry.machineId,
        machineName: entry.machineName,
        kind: 'use',
        vault: req.vault,
        vaultName: vaultNames.get(req.vault) ?? req.vault,
        item: req.item,
        itemTitle: item?.value?.title || req.item,
        field: req.field,
        use: req.operation.use,
        operation: formatOpSummary(req.operation),
        reason: req.reason,
        canSession: entry.grant?.approval === 'session' && req.operation.use !== 'reveal',
        fresh: entry.fresh,
        expiresAt: entry.expiresAt,
      };
    }
    return {
      requestId: entry.request.place.requestId,
      machineId: entry.machineId,
      machineName: entry.machineName,
      kind: 'access',
      what: req.what,
      reason: req.reason,
      canSession: false,
      fresh: entry.fresh,
      expiresAt: entry.expiresAt,
    };
  });

  const inboxRead = await readMachineInbox(ctx.api, trusted, ctx.productKey).catch(() => ({ entries: [], unreadable: 0 }));
  const inbox: PendingAgentInboxView[] = [];
  for (const entry of inboxRead.entries) {
    const parsed = parseAgentInboxApiKey(entry.body);
    if (!parsed) continue;
    inbox.push({
      id: entry.id,
      machineId: entry.machineId,
      machineName: entry.machineName,
      title: parsed.title,
      service: parsed.service,
      hosts: parsed.hosts,
      env: parsed.env,
      environment: parsed.environment,
      reason: parsed.reason,
      createdAt: entry.createdAt,
      expiresAt: entry.expiresAt,
    });
  }

  const exposed: ExposedKeyEntry[] = await exposedKeysFor(trusted, allItems);
  const pendingRekey = machines.reduce((sum, m) => sum + m.keysWaiting, 0);

  return {
    status: 'open',
    vaults: vaultSummaries,
    machines,
    requests,
    inbox,
    exposed,
    pendingRekey,
  };
}

/**
 * Lightweight count of live pending approval requests and inbox items for the
 * popup banner and toolbar badge: never throws when agents are off or not
 * offered, and avoids syncing every agent vault just to check whether work is waiting.
 */
export async function agentsPendingCount(ctx: AgentWorkerContext, now = Date.now()): Promise<{ count: number }> {
  const opened = await openOrRecoverAgents(ctx.api, ctx.productKey, ctx.stored, { previous: ctx.previous, autoMove: false });
  if (opened.status !== 'open' && opened.status !== 'sent-back') return { count: 0 };
  const trusted = opened.status === 'sent-back' ? opened.result.trusted : opened.trusted;
  const nextStored = toStoredAgentsState(trusted, ctx.stored);
  if (JSON.stringify(nextStored) !== JSON.stringify(ctx.stored)) {
    await ctx.save(nextStored);
  }
  const reviewed = await reviewMachineRequests(ctx.api, trusted, ctx.productKey, now);
  const inbox = await readMachineInbox(ctx.api, trusted, ctx.productKey).catch(() => ({ entries: [], unreadable: 0 }));
  const validInbox = inbox.entries.filter((entry) => parseAgentInboxApiKey(entry.body) !== null).length;
  return { count: reviewed.requests.length + validInbox };
}

async function openTrusted(ctx: AgentWorkerContext): Promise<TrustedAgents> {
  const opened = await openOrRecoverAgents(ctx.api, ctx.productKey, ctx.stored, { previous: ctx.previous, autoMove: false });
  if (opened.status === 'not-offered') fail('error.agentNotOffered');
  if (opened.status === 'off') fail('error.agentNotEnabled');
  if (opened.status === 'key-replaced') fail('error.agentStoppedKeyReplaced');
  return opened.status === 'sent-back' ? opened.result.trusted : opened.trusted;
}

export async function agentsView(ctx: AgentWorkerContext): Promise<AgentsOverview> {
  const opened = await openOrRecoverAgents(ctx.api, ctx.productKey, ctx.stored, { previous: ctx.previous, autoMove: false });
  if (opened.status === 'not-offered') return { status: 'not-offered' };
  if (opened.status === 'off') return { status: 'off' };
  if (opened.status === 'key-replaced') {
    return {
      status: 'key-replaced',
      moveInProgress: opened.moveInProgress,
      hasPreviousKey: ctx.previous !== null && ctx.previous.keyGeneration === opened.authorityKeyGeneration,
    };
  }
  const trusted = opened.status === 'sent-back' ? opened.result.trusted : opened.trusted;
  return buildOverview(ctx, trusted);
}

export async function agentsTurnOn(ctx: AgentWorkerContext): Promise<AgentsOverview> {
  const opened = await openOrRecoverAgents(ctx.api, ctx.productKey, ctx.stored, { previous: ctx.previous, autoMove: false });
  if (opened.status === 'not-offered') fail('error.agentNotOffered');
  const trusted = opened.status === 'off' ? await turnOnAgents(ctx.api, ctx.productKey) : await openTrusted(ctx);
  await ctx.save(toStoredAgentsState(trusted, ctx.stored));
  return buildOverview(ctx, trusted);
}

export async function agentsCreateVault(ctx: AgentWorkerContext, name: string): Promise<AgentsOverview> {
  const trusted = await openTrusted(ctx);
  const made = await createAgentVault(ctx.api, trusted, ctx.productKey, name.trim());
  const next = await openAgents(ctx.api, ctx.productKey, made.checkpoint);
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return buildOverview(ctx, next);
}

export async function agentsPutItem(
  ctx: AgentWorkerContext,
  vaultId: string,
  itemId: string | null,
  value: AgentItemValue | null,
): Promise<{ itemId: string; overview: AgentsOverview }> {
  const trusted = await openTrusted(ctx);
  const vaults = await openAgentVaults(ctx.api, trusted, ctx.productKey);
  const vault = vaults.find((v) => v.id === vaultId);
  if (!vault) fail('error.agentVaultGone');
  let current: AgentItem<AgentItemValue> | null = null;
  if (itemId) {
    const synced = await syncAgentVault<AgentItemValue>(ctx.api, trusted, ctx.productKey, vault);
    current = synced.items.find((entry) => entry.item === itemId) ?? null;
    if (!current) fail('error.itemNotFound');
  }
  const saved = await putAgentItem(ctx.api, trusted, ctx.productKey, vault, current, value);
  const vaultNames = new Map(vaults.map((v) => [v.id, v.name]));
  const updated = await refreshEditedAgentItemGrants(ctx.api, trusted, ctx.productKey, vault, current, saved.item, {
    known: ctx.stored?.known,
    vaultNames,
  });
  const known = mergeKnownAgentItems(ctx.stored?.known, [saved.item, updated.item]);
  await ctx.save(toStoredAgentsState(updated.trusted, ctx.stored, { known }));
  return { itemId: updated.item.item, overview: await buildOverview(ctx, updated.trusted) };
}

/**
 * Patches an existing agent vault item without clobbering fields the UI does not
 * display (such as CLI-configured `sendAs`, `keyId`, `env`, `notes`, or `fields`)
 * and keeps the existing secret when `key` is left blank.
 */
export async function agentsEditItem(
  ctx: AgentWorkerContext,
  input: { vaultId: string; itemId: string; title: string; key: string; hosts: string[] },
): Promise<{ itemId: string; overview: AgentsOverview }> {
  const trusted = await openTrusted(ctx);
  const vaults = await openAgentVaults(ctx.api, trusted, ctx.productKey);
  const vault = vaults.find((v) => v.id === input.vaultId);
  if (!vault) fail('error.agentVaultGone');
  const synced = await syncAgentVault<AgentItemValue>(ctx.api, trusted, ctx.productKey, vault);
  const current = synced.items.find((entry) => entry.item === input.itemId && !entry.deleted) ?? null;
  if (!current?.value) fail('error.itemNotFound');

  const title = input.title.trim() || current.value.title;
  const nextValue: AgentItemValue =
    current.value.kind === 'apikey'
      ? {
          ...current.value,
          title,
          key: input.key ? input.key : current.value.key,
          service: input.key ? (serviceOfKey(input.key) ?? current.value.service) : current.value.service,
          hosts: cleanHosts(input.hosts),
        }
      : { ...current.value, title };

  const saved = await putAgentItem(ctx.api, trusted, ctx.productKey, vault, current, nextValue);
  const vaultNames = new Map(vaults.map((v) => [v.id, v.name]));
  const updated = await refreshEditedAgentItemGrants(ctx.api, trusted, ctx.productKey, vault, current, saved.item, {
    known: ctx.stored?.known,
    vaultNames,
  });
  const known = mergeKnownAgentItems(ctx.stored?.known, [saved.item, updated.item]);
  await ctx.save(toStoredAgentsState(updated.trusted, ctx.stored, { known }));
  return { itemId: updated.item.item, overview: await buildOverview(ctx, updated.trusted) };
}

export async function agentsBeginEnrollment(ctx: AgentWorkerContext): Promise<{ invitationId: string; text: string }> {
  const trusted = await openTrusted(ctx);
  return beginMachineEnrollment(ctx.api, trusted, ctx.productKey.accountId);
}

export async function agentsReviewEnrollment(ctx: AgentWorkerContext, invitationId: string): Promise<MachineCandidate | null> {
  const trusted = await openTrusted(ctx);
  return reviewMachineEnrollment(ctx.api, trusted, ctx.productKey.accountId, invitationId);
}

export async function agentsConfirmEnrollment(
  ctx: AgentWorkerContext,
  candidate: MachineCandidate,
  name: string,
  days: number | undefined,
  proof: OwnerProofFields,
): Promise<AgentsOverview> {
  const trusted = await openTrusted(ctx);
  const cp = await confirmMachineEnrollment(ctx.api, trusted, ctx.productKey, candidate, {
    name: name.trim(),
    ...(days ? { lifetime: days * DAY_MS } : {}),
    proof,
  });
  const next = await openAgents(ctx.api, ctx.productKey, cp);
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return buildOverview(ctx, next);
}

export async function agentsCreateToken(
  ctx: AgentWorkerContext,
  name: string,
  days: number | undefined,
  proof: OwnerProofFields,
): Promise<{ token: string; machineId: string; overview: AgentsOverview }> {
  const trusted = await openTrusted(ctx);
  const made = await createMachineToken(ctx.api, trusted, ctx.productKey, {
    name: name.trim(),
    ...(days ? { lifetime: days * DAY_MS } : {}),
    proof,
  });
  const next = await openAgents(ctx.api, ctx.productKey, made.checkpoint);
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return { token: made.token, machineId: made.machineId, overview: await buildOverview(ctx, next) };
}

export async function agentsGrantItem(
  ctx: AgentWorkerContext,
  input: {
    machineId: string;
    vaultId: string;
    itemId: string;
    uses: MachineUse[];
    approval: MachineApproval;
    session?: number;
    bounds?: Record<string, unknown>;
    expiresAt?: number | null;
  },
): Promise<AgentsOverview> {
  const trusted = await openTrusted(ctx);
  const vaults = await openAgentVaults(ctx.api, trusted, ctx.productKey);
  const vault = vaults.find((v) => v.id === input.vaultId);
  if (!vault) fail('error.agentVaultGone');
  const synced = await syncAgentVault<AgentItemValue>(ctx.api, trusted, ctx.productKey, vault);
  const item = synced.items.find((entry) => entry.item === input.itemId && !entry.deleted);
  if (!item) fail('error.itemNotFound');
  const { listing, delivery } = describeAgentItem(item, vault.name);
  const given = await giveMachineItems(ctx.api, trusted, ctx.productKey, input.machineId, [
    {
      vault,
      item,
      uses: input.uses,
      approval: input.approval,
      ...(input.session !== undefined ? { session: input.session } : {}),
      ...(input.bounds ? { bounds: input.bounds } : {}),
      expiresAt: input.expiresAt ?? null,
      listing,
      delivery,
    },
  ]);
  let next = await openAgents(ctx.api, ctx.productKey, given.checkpoint);
  if (given.rekey.length > 0) {
    const names = new Map(vaults.map((v) => [v.id, v.name]));
    const rekeyed = await finishMachineRekey(ctx.api, next, ctx.productKey, (entry) => describeAgentItem(entry, names.get(entry.vault)));
    next = await openAgents(ctx.api, ctx.productKey, rekeyed.checkpoint);
  }
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return buildOverview(ctx, next);
}

export async function agentsWithdrawItem(
  ctx: AgentWorkerContext,
  machineId: string,
  vaultId: string,
  itemId: string,
): Promise<AgentsOverview> {
  const trusted = await openTrusted(ctx);
  const result = await withdrawMachineItems(ctx.api, trusted, ctx.productKey, machineId, [{ vault: vaultId, item: itemId }]);
  let next = await openAgents(ctx.api, ctx.productKey, result.checkpoint);
  if (result.rekey.length > 0) {
    const vaults = await openAgentVaults(ctx.api, next, ctx.productKey);
    const names = new Map(vaults.map((v) => [v.id, v.name]));
    const rekeyed = await finishMachineRekey(ctx.api, next, ctx.productKey, (entry) => describeAgentItem(entry, names.get(entry.vault)));
    next = await openAgents(ctx.api, ctx.productKey, rekeyed.checkpoint);
  }
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return buildOverview(ctx, next);
}

export async function agentsApproveUse(
  ctx: AgentWorkerContext,
  machineId: string,
  requestId: string,
  mode: 'once' | 'session',
): Promise<AgentsOverview> {
  const trusted = await openTrusted(ctx);
  const reviewed = await reviewMachineRequests(ctx.api, trusted, ctx.productKey);
  const entry = reviewed.requests.find((r) => r.machineId === machineId && r.request.place.requestId === requestId);
  if (!entry || entry.request.request.kind !== 'use') fail('error.agentRequestEnded');
  const req = entry.request.request;
  const vaults = await openAgentVaults(ctx.api, trusted, ctx.productKey);
  const vault = vaults.find((v) => v.id === req.vault);
  if (!vault) fail('error.agentVaultGone');
  const synced = await syncAgentVault<AgentItemValue>(ctx.api, trusted, ctx.productKey, vault);
  const item = synced.items.find((i) => i.item === req.item && !i.deleted);
  if (!item?.value) fail('error.itemNotFound');

  const choice =
    mode === 'session'
      ? { kind: 'session' as const, item }
      : { kind: 'once' as const, value: extractAgentField(item.value, req.field) ?? fail('error.itemInvalid') };

  const result = await approveMachineUse(ctx.api, trusted, ctx.productKey, entry, choice, {
    deviceId: ctx.deviceId,
    remember: async (cp: AgentCheckpoint) => {
      await ctx.save({ ...(ctx.stored ?? { checkpoint: cp }), checkpoint: cp });
    },
  });
  const next = await openAgents(ctx.api, ctx.productKey, result.checkpoint);
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return buildOverview(ctx, next);
}

export async function agentsDenyRequest(ctx: AgentWorkerContext, machineId: string, requestId: string): Promise<AgentsOverview> {
  const trusted = await openTrusted(ctx);
  const reviewed = await reviewMachineRequests(ctx.api, trusted, ctx.productKey);
  const entry = reviewed.requests.find((r) => r.machineId === machineId && r.request.place.requestId === requestId);
  if (!entry) fail('error.agentRequestEnded');
  await denyMachineUse(ctx.api, trusted, ctx.productKey, entry, ctx.deviceId);
  const next = await openAgents(ctx.api, ctx.productKey, trusted.checkpoint);
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return buildOverview(ctx, next);
}

export async function agentsInboxAccept(
  ctx: AgentWorkerContext,
  machineId: string,
  entryId: string,
  vaultId: string,
): Promise<AgentsOverview> {
  const trusted = await openTrusted(ctx);
  const vaults = await openAgentVaults(ctx.api, trusted, ctx.productKey);
  const vault = vaults.find((v) => v.id === vaultId);
  if (!vault) fail('error.agentVaultGone');
  const inbox = await readMachineInbox(ctx.api, trusted, ctx.productKey);
  const entry = inbox.entries.find((item) => item.machineId === machineId && item.id === entryId);
  const parsed = entry ? parseAgentInboxApiKey(entry.body) : null;
  if (!entry || !parsed) fail('error.agentRequestEnded');
  const saved = await putAgentItem(ctx.api, trusted, ctx.productKey, vault, null, agentApiKeyFromInbox(parsed));
  await dismissMachineInboxEntry(ctx.api, machineId, entryId);
  const known = mergeKnownAgentItems(ctx.stored?.known, [saved.item]);
  await ctx.save(toStoredAgentsState(trusted, ctx.stored, { known }));
  return buildOverview(ctx, trusted);
}

export async function agentsInboxDismiss(ctx: AgentWorkerContext, machineId: string, entryId: string): Promise<AgentsOverview> {
  const trusted = await openTrusted(ctx);
  await dismissMachineInboxEntry(ctx.api, machineId, entryId);
  return buildOverview(ctx, trusted);
}

export async function agentsRemoveMachine(
  ctx: AgentWorkerContext,
  machineId: string,
  proof: OwnerProofFields | null,
): Promise<AgentsOverview> {
  const trusted = await openTrusted(ctx);
  const ended = await removeMachine(ctx.api, trusted, ctx.productKey, machineId, proof);
  const next = await openAgents(ctx.api, ctx.productKey, ended.checkpoint);
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return buildOverview(ctx, next);
}

export async function agentsStopAll(ctx: AgentWorkerContext, proof: OwnerProofFields): Promise<AgentsOverview> {
  const trusted = await openTrusted(ctx);
  const ended = await stopAllMachines(ctx.api, trusted, ctx.productKey, proof);
  const next = await openAgents(ctx.api, ctx.productKey, ended.checkpoint);
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return buildOverview(ctx, next);
}

export async function agentsResumeMachine(ctx: AgentWorkerContext, machineId: string, proof: OwnerProofFields): Promise<AgentsOverview> {
  const trusted = await openTrusted(ctx);
  await resumeMachine(ctx.api, trusted, machineId, proof);
  const next = await openAgents(ctx.api, ctx.productKey, trusted.checkpoint);
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return buildOverview(ctx, next);
}

export async function agentsRenewMachine(
  ctx: AgentWorkerContext,
  machineId: string,
  days: number | undefined,
  proof: OwnerProofFields,
  token?: string,
): Promise<{ token: string | null; expiresAt: number; overview: AgentsOverview }> {
  const trusted = await openTrusted(ctx);
  const pin = trusted.pins.get(machineId);
  if (!pin) fail('error.agentMachineGone');
  const lifetime = days ? days * DAY_MS : MACHINE_LIFETIME[pin.kind];
  const renewed = await renewMachine(ctx.api, trusted, ctx.productKey, machineId, {
    lifetime,
    proof,
    ...(token ? { token } : {}),
  });
  const next = await openAgents(ctx.api, ctx.productKey, renewed.checkpoint);
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return { token: renewed.token, expiresAt: renewed.expiresAt, overview: await buildOverview(ctx, next) };
}

export async function agentsRekey(ctx: AgentWorkerContext): Promise<{ replaced: number; overview: AgentsOverview }> {
  const trusted = await openTrusted(ctx);
  const vaults = await openAgentVaults(ctx.api, trusted, ctx.productKey);
  const names = new Map(vaults.map((v) => [v.id, v.name]));
  const result = await finishMachineRekey(ctx.api, trusted, ctx.productKey, (entry) => describeAgentItem(entry, names.get(entry.vault)));
  const next = await openAgents(ctx.api, ctx.productKey, result.checkpoint);
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return { replaced: result.replaced.length, overview: await buildOverview(ctx, next) };
}

export async function agentsSettle(ctx: AgentWorkerContext): Promise<AgentsOverview> {
  const trusted = await openTrusted(ctx);
  const settled = await settleMachines(ctx.api, trusted, ctx.productKey);
  const next = await openAgents(ctx.api, ctx.productKey, settled.checkpoint);
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return buildOverview(ctx, next);
}

export async function agentsForget(
  ctx: AgentWorkerContext,
  machineId: string,
  proof: OwnerProofFields,
  keysReplaced: boolean,
): Promise<AgentsOverview> {
  const trusted = await openTrusted(ctx);
  const cp = await forgetMachines(ctx.api, trusted, ctx.productKey, [machineId], proof, { keysReplaced });
  const next = await openAgents(ctx.api, ctx.productKey, cp);
  await ctx.save(toStoredAgentsState(next, ctx.stored));
  return buildOverview(ctx, next);
}

export async function agentsAudit(ctx: AgentWorkerContext, since = 0): Promise<AgentsAuditView> {
  const trusted = await openTrusted(ctx);
  const audit = await readMachineAudit(ctx.api, trusted, ctx.productKey, since);
  const gaps = machineLogGaps(audit.entries, audit.refused);
  const calls = await readMachineCalls(ctx.api, trusted, 0);
  await ctx.save(toStoredAgentsState(trusted, ctx.stored, { auditRev: audit.rev }));
  return {
    entries: audit.entries.map((e) => ({
      machineId: e.machineId,
      machineName: trusted.pins.get(e.machineId)?.name ?? e.machineId,
      stream: e.stream,
      sequence: e.sequence,
      at: e.at,
      entry: e.entry,
    })),
    decisions: audit.decisions.map((d) => ({
      machineId: d.machineId,
      machineName: trusted.pins.get(d.machineId)?.name ?? d.machineId,
      requestId: d.requestId,
      outcome: d.record.statement.outcome,
      decidedAt: d.decidedAt,
    })),
    gaps: gaps.length,
    calls: calls.length,
    rev: audit.rev,
  };
}

export async function agentsMoveToNewKey(ctx: AgentWorkerContext): Promise<AgentsOverview> {
  if (!ctx.previous) fail('error.agentNoMove');
  const trusted = await moveAgentsToNewKey(ctx.api, ctx.previous, ctx.productKey, ctx.stored?.checkpoint ?? null, {
    known: knownAgentRecordOf(ctx.stored?.known),
  });
  await ctx.save(toStoredAgentsState(trusted, ctx.stored), { clearMove: true });
  return buildOverview(ctx, trusted);
}

export async function agentsSendBack(ctx: AgentWorkerContext): Promise<AgentsOverview> {
  if (!ctx.stored?.checkpoint || !ctx.stored.state) fail('error.accountServerWrong');
  const sent = await sendAgentsBack(ctx.api, ctx.productKey, ctx.stored.checkpoint, ctx.stored.state as unknown as AgentsState);
  await ctx.save(toStoredAgentsState(sent.trusted, ctx.stored));
  return buildOverview(ctx, sent.trusted);
}

export async function agentsStartAfresh(ctx: AgentWorkerContext, proof: OwnerProofFields): Promise<AgentsOverview> {
  const trusted = await startAgentsAfresh(ctx.api, ctx.productKey, proof);
  await ctx.save(toStoredAgentsState(trusted), { clearMove: true });
  return buildOverview(ctx, trusted);
}

/**
 * Reads items from archived agent vaults (put aside when an account started over)
 * and maps them into standard Passhold `LoginItem`/`WalletItem` entries so `openKept`
 * restores them cleanly into the owner's vault.
 */
export async function readArchivedAgentsToVault(
  api: HttpSyncAdapter,
  archive: { id: string },
  accountId: string,
  oldKey: CryptoKey,
): Promise<{ items: LoginItem[]; wallet: WalletItem[] }> {
  const items: LoginItem[] = [];
  const wallet: WalletItem[] = [];
  const archived = await openArchivedAgents(api, archive, accountId, oldKey).catch(() => null);
  if (!archived) return { items, wallet };
  const now = Date.now();
  for (const vault of archived.vaults) {
    const records = await readArchivedAgentVault<AgentItemValue>(api, archived, vault);
    for (const record of records) {
      if (record.deleted || !record.value) continue;
      const val = record.value;
      const base = {
        id: record.item,
        title: val.title || record.item,
        favorite: false,
        createdAt: now,
        updatedAt: now,
        lastUsedAt: null,
        deletedAt: null,
        folder: vault.name,
        fields: val.fields ?? [],
      };
      if (val.kind === 'login') {
        items.push({ ...base, username: val.username, password: val.password, urls: val.urls, notes: val.notes, passwordChangedAt: now, history: [], passkey: null });
      } else if (val.kind === 'apikey') {
        wallet.push({
          ...base,
          kind: 'apikey',
          service: val.service,
          key: val.key,
          keyId: val.keyId,
          hosts: val.hosts,
          sendAs: val.sendAs,
          env: val.env,
          environment: val.environment,
          scopes: val.scopes,
          issuedAt: val.issuedAt,
          expiresAt: val.expiresAt,
          notes: val.notes,
          history: [],
        } satisfies ApiKeyItem);
      } else if (val.kind === 'note') {
        wallet.push({ ...base, kind: 'note', text: val.text } satisfies NoteItem);
      } else if (val.kind === 'ssh') {
        wallet.push({
          ...base,
          kind: 'ssh',
          privateKey: val.privateKey,
          publicKey: val.publicKey,
          fingerprint: val.fingerprint,
          notes: val.notes,
        } satisfies SshKeyItem);
      }
    }
  }
  return { items, wallet };
}
