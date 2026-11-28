/**
 * Passhold-side helpers over `@keyrook/account`'s machine and agent vault flows:
 * item serialization, delivery normalization (for `brand/apis.ts`), machine
 * summaries, "Keys the agent could read" reports, and automatic recovery on
 * key replacement or server restore.
 */
import {
  DecryptionError,
  finishMachineRekey,
  giveMachineItems,
  isMachineDelivery,
  keysAgentsCouldRead,
  keysWaitingFor,
  moveAgentsToNewKey,
  openAgentVaults,
  openAgents,
  sendAgentsBack,
  syncAgentVault,
  SyncHttpError,
  type AgentCheckpoint,
  type AgentItem,
  type AgentsSentBack,
  type AgentsState,
  type HttpSyncAdapter,
  type KnownAgentRecord,
  type MachineDelivery,
  type MachineListing,
  type OpenedAgentVault,
  type ProductKey,
  type TrustedAgents,
} from '@keyrook/account';
import { apiService, cleanEnvName, cleanHosts, cleanSendAs, serviceOfKey } from '../apikey.js';
import { apiKeyFrom } from '../import/apikeys.js';
import { RESERVED_REQUEST_HEADERS, sha256Base64 } from '../agents/guard.js';
import type { ApiKeyItem, CustomField, LoginItem, StoredAgentsState, WalletItem } from '../vault/model.js';

export interface AgentApiKeyValue {
  kind: 'apikey';
  title: string;
  service: string;
  key: string;
  keyId: string;
  hosts: string[];
  sendAs: string;
  env: string;
  environment: string;
  scopes: string;
  issuedAt: number | null;
  expiresAt: number | null;
  notes: string;
  fields?: CustomField[];
}

export interface AgentLoginValue {
  kind: 'login';
  title: string;
  username: string;
  password: string;
  urls: string[];
  notes: string;
  fields?: CustomField[];
}

export interface AgentNoteValue {
  kind: 'note';
  title: string;
  text: string;
  fields?: CustomField[];
}

export interface AgentSshValue {
  kind: 'ssh';
  title: string;
  privateKey: string;
  publicKey: string;
  fingerprint: string;
  notes: string;
  fields?: CustomField[];
}

/** Structured item stored inside an agent vault record (`AgentItem<AgentItemValue>`). */
export type AgentItemValue = AgentApiKeyValue | AgentLoginValue | AgentNoteValue | AgentSshValue;

/** Converts a Passhold `WalletItem` (API key, note, or SSH key) into an agent vault item value. */
export function agentItemFromWallet(item: WalletItem): AgentItemValue | null {
  switch (item.kind) {
    case 'apikey':
      return {
        kind: 'apikey',
        title: item.title,
        service: item.service,
        key: item.key,
        keyId: item.keyId,
        hosts: [...item.hosts],
        sendAs: item.sendAs,
        env: item.env,
        environment: item.environment,
        scopes: item.scopes,
        issuedAt: item.issuedAt,
        expiresAt: item.expiresAt,
        notes: item.notes,
        ...(item.fields.length ? { fields: item.fields.map((f) => ({ ...f })) } : {}),
      };
    case 'note':
      return {
        kind: 'note',
        title: item.title,
        text: item.text,
        ...(item.fields.length ? { fields: item.fields.map((f) => ({ ...f })) } : {}),
      };
    case 'ssh':
      return {
        kind: 'ssh',
        title: item.title,
        privateKey: item.privateKey,
        publicKey: item.publicKey,
        fingerprint: item.fingerprint,
        notes: item.notes,
        ...(item.fields.length ? { fields: item.fields.map((f) => ({ ...f })) } : {}),
      };
    default:
      return null;
  }
}

/** Converts a Passhold `LoginItem` into an agent vault item value. */
export function agentItemFromLogin(item: LoginItem): AgentLoginValue {
  return {
    kind: 'login',
    title: item.title,
    username: item.username,
    password: item.password,
    urls: [...item.urls],
    notes: item.notes,
    ...(item.fields.length ? { fields: item.fields.map((f) => ({ ...f })) } : {}),
  };
}

/** Extracts a single named field value from an agent vault item (for per-use release or reveal). */
export function extractAgentField(value: AgentItemValue, field: string): string | null {
  const name = field.trim().toLowerCase();
  if (value.kind === 'apikey') {
    if (name === 'key' || name === 'secret' || name === 'token') return value.key;
    if (name === 'key_id' || name === 'keyid' || name === 'id') return value.keyId;
    if (name === 'notes') return value.notes;
  } else if (value.kind === 'login') {
    if (name === 'password') return value.password;
    if (name === 'username' || name === 'user') return value.username;
    if (name === 'notes') return value.notes;
  } else if (value.kind === 'note') {
    if (name === 'text' || name === 'notes' || name === 'value') return value.text;
  } else if (value.kind === 'ssh') {
    if (name === 'private_key' || name === 'privatekey' || name === 'key') return value.privateKey;
    if (name === 'public_key' || name === 'publickey') return value.publicKey;
    if (name === 'fingerprint') return value.fingerprint;
    if (name === 'notes') return value.notes;
  }
  const custom = value.fields?.find((f) => f.name.trim().toLowerCase() === name);
  return custom ? custom.value : null;
}

/** Primary secret field name and value for an agent vault item. */
export function primaryAgentSecret(value: AgentItemValue): { field: string; value: string; keyId?: string } {
  switch (value.kind) {
    case 'apikey':
      return { field: 'key', value: value.key, ...(value.keyId ? { keyId: value.keyId } : {}) };
    case 'login':
      return { field: 'password', value: value.password, ...(value.username ? { keyId: value.username } : {}) };
    case 'note':
      return { field: 'text', value: value.text };
    case 'ssh':
      return { field: 'private_key', value: value.privateKey };
  }
}

const VALID_HEADER_TOKEN = /^[a-z0-9!#$%&'*+.^_`|~-]{1,128}$/;
const VALID_ENV_VAR = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/;

/**
 * Normalizes Passhold's `sendAs` (e.g. `header:PRIVATE-TOKEN` or `header:Authorization`
 * from `brand/apis.ts`) into a valid `@keyrook/account` `MachineDelivery.sendAs`:
 * lowercase header names, no reserved headers, and `basic` only when `keyId` is non-empty.
 */
export function normalizeMachineSendAs(rawSendAs: string, keyId: string | null): string {
  const cleaned = cleanSendAs(rawSendAs);
  if (cleaned === 'bearer') return 'bearer';
  if (cleaned === 'basic') return keyId ? 'basic' : 'bearer';
  if (cleaned.startsWith('header:')) {
    const lower = cleaned.slice('header:'.length).toLowerCase();
    if (lower === 'authorization') return 'bearer';
    if (VALID_HEADER_TOKEN.test(lower) && !RESERVED_REQUEST_HEADERS.has(lower)) {
      return `header:${lower}`;
    }
    return 'bearer';
  }
  if (cleaned.startsWith('query:')) return cleaned;
  return 'bearer';
}

/** Builds a valid `{ listing, delivery }` pair for `giveMachineItems` and `finishMachineRekey`. */
export function describeAgentItem(
  item: AgentItem<unknown>,
  vaultName?: string,
): { listing: MachineListing; delivery: MachineDelivery } {
  const raw = item.value as Partial<AgentItemValue> | null;
  const title = typeof raw?.title === 'string' && raw.title.trim() ? raw.title.trim().slice(0, 200) : item.item;
  const kind = typeof raw?.kind === 'string' ? raw.kind : 'apikey';
  const service = kind === 'apikey' && typeof (raw as Partial<AgentApiKeyValue>).service === 'string' ? (raw as Partial<AgentApiKeyValue>).service!.slice(0, 200) : '';
  const environment =
    kind === 'apikey' && typeof (raw as Partial<AgentApiKeyValue>).environment === 'string'
      ? (raw as Partial<AgentApiKeyValue>).environment!.slice(0, 200)
      : '';
  const ref = vaultName ? `passhold://${vaultName}/${title}`.slice(0, 200) : `passhold://${item.vault}/${item.item}`.slice(0, 200);

  const listing: MachineListing = {
    title,
    kind,
    ...(service ? { service } : {}),
    ...(environment ? { environment } : {}),
    ref,
  };

  if (kind === 'apikey') {
    const apiKey = raw as Partial<AgentApiKeyValue>;
    const keyId = typeof apiKey.keyId === 'string' && apiKey.keyId.trim() ? apiKey.keyId.trim().slice(0, 200) : null;
    const hosts = cleanHosts(apiKey.hosts ?? []);
    const sendAs = normalizeMachineSendAs(apiKey.sendAs ?? 'bearer', keyId);
    const cleanedEnv = cleanEnvName(apiKey.env ?? '');
    const env = cleanedEnv && VALID_ENV_VAR.test(cleanedEnv) ? cleanedEnv : null;
    const candidate: MachineDelivery = { hosts, sendAs, keyId, env };
    if (isMachineDelivery(candidate)) return { listing, delivery: candidate };
    // Fallback stripping any host not accepted by strict `isMachineDelivery`.
    const safeHosts = hosts.filter((h) => isMachineDelivery({ hosts: [h], sendAs: 'bearer', keyId: null, env: null }));
    return { listing, delivery: { hosts: safeHosts, sendAs, keyId, env } };
  }

  if (kind === 'login') {
    const login = raw as Partial<AgentLoginValue>;
    const hosts = cleanHosts(login.urls ?? []).filter((h) => isMachineDelivery({ hosts: [h], sendAs: 'bearer', keyId: null, env: null }));
    const keyId = typeof login.username === 'string' && login.username.trim() ? login.username.trim().slice(0, 200) : null;
    return { listing, delivery: { hosts, sendAs: 'bearer', keyId, env: null } };
  }

  return { listing, delivery: { hosts: [], sendAs: 'bearer', keyId: null, env: null } };
}

export interface AgentMachineSummary {
  id: string;
  name: string;
  kind: 'enrolled' | 'token';
  status: 'live' | 'paused' | 'expired' | 'removed';
  createdAt: number;
  expiresAt: number;
  removedAt: number | null;
  grantsCount: number;
  exposedCount: number;
  keysWaiting: number;
}

/** Lists every machine in the verified directory with its trusted pin details and pending rekey count. */
export function listAgentMachines(trusted: TrustedAgents, now = Date.now()): AgentMachineSummary[] {
  return trusted.directory.machines.map((entry) => {
    const pin = trusted.pins.get(entry.id)!;
    const view = trusted.machines.get(entry.id);
    const removed = entry.removed || pin.removedAt !== null;
    const expired = !removed && pin.expiresAt <= now;
    const status: AgentMachineSummary['status'] = removed
      ? 'removed'
      : expired
        ? 'expired'
        : view?.status === 'paused'
          ? 'paused'
          : 'live';
    return {
      id: entry.id,
      name: pin.name,
      kind: pin.kind,
      status,
      createdAt: pin.createdAt,
      expiresAt: pin.expiresAt,
      removedAt: pin.removedAt,
      grantsCount: pin.grants.length,
      exposedCount: pin.exposed.length,
      keysWaiting: keysWaitingFor(trusted, entry.id, now),
    };
  });
}

export interface ExposedKeyEntry {
  machineId: string;
  machineName: string;
  vault: string;
  item: string;
  version: number;
  title: string;
  service: string;
  replaceUrl: string | null;
  /** True when the machine held the item's encryption key (standing or session grant). */
  keyExposed: boolean;
  /** True when the current item value still matches what the removed machine could have read. */
  stillCurrent: boolean;
  fields: { name: string; stillCurrent: boolean }[];
}

/**
 * Computes "Keys the agent could read" for every removed machine: compares the
 * SHA-256 digests recorded in the machine's pin against the current item values,
 * and attaches each service's key replacement URL from `brand/apis.ts`.
 */
export async function exposedKeysFor(
  trusted: TrustedAgents,
  items: readonly AgentItem<AgentItemValue>[],
): Promise<ExposedKeyEntry[]> {
  const byPlace = new Map(items.map((entry) => [`${entry.vault}:${entry.item}`, entry]));
  const reports: ExposedKeyEntry[] = [];
  for (const machine of keysAgentsCouldRead(trusted)) {
    for (const exposure of machine.exposed) {
      const current = byPlace.get(`${exposure.vault}:${exposure.item}`);
      const val = current && !current.deleted ? current.value : null;
      const title = val?.title || exposure.item;
      const service = val?.kind === 'apikey' ? val.service : '';
      const replaceUrl = service ? (apiService(service)?.replace ?? null) : null;
      const fields: { name: string; stillCurrent: boolean }[] = [];
      for (const field of exposure.fields) {
        const nowVal = val ? extractAgentField(val, field.name) : null;
        const stillCurrent = nowVal !== null && (await sha256Base64(nowVal)) === field.value;
        fields.push({ name: field.name, stillCurrent });
      }
      // If the machine held the item's key (standing/session) and the item is still alive,
      // the secret value is considered still exposed until rotated at the service (or deleted).
      const stillCurrent = (exposure.key && val !== null) || fields.some((f) => f.stillCurrent);
      reports.push({
        machineId: machine.machineId,
        machineName: machine.machineName,
        vault: exposure.vault,
        item: exposure.item,
        version: exposure.version,
        title,
        service,
        replaceUrl,
        keyExposed: exposure.key,
        stillCurrent,
        fields,
      });
    }
  }
  return reports;
}

/** Builds a `KnownAgentRecord` lookup function from persisted `StoredAgentsState['known']`. */
export function knownAgentRecordOf(known?: Record<string, { version: number; rev: number }>): KnownAgentRecord {
  return (vault, item) => known?.[`${vault}:${item}`] ?? null;
}

/** Merges synced agent vault items into `StoredAgentsState['known']` (anti-rollback tracking). */
export function mergeKnownAgentItems(
  prev: Record<string, { version: number; rev: number }> | undefined,
  items: readonly Pick<AgentItem, 'vault' | 'item' | 'version' | 'rev'>[],
): Record<string, { version: number; rev: number }> {
  const next = { ...(prev ?? {}) };
  for (const entry of items) {
    const key = `${entry.vault}:${entry.item}`;
    const existing = next[key];
    if (!existing || entry.version > existing.version || (entry.version === existing.version && entry.rev > existing.rev)) {
      next[key] = { version: entry.version, rev: entry.rev };
    }
  }
  return next;
}

/** Packs a `TrustedAgents` snapshot into a JSON-safe `StoredAgentsState` for persistence. */
export function toStoredAgentsState(
  trusted: TrustedAgents,
  previous?: StoredAgentsState,
  extra?: { known?: Record<string, { version: number; rev: number }>; auditRev?: number },
): StoredAgentsState {
  return {
    checkpoint: { ...trusted.checkpoint },
    state: trusted.state as unknown as Record<string, unknown>,
    ...(extra?.known ?? previous?.known ? { known: extra?.known ?? previous?.known } : {}),
    ...(extra?.auditRev !== undefined ? { auditRev: extra.auditRev } : previous?.auditRev !== undefined ? { auditRev: previous.auditRev } : {}),
  };
}

export type OpenAgentsOutcome =
  | { status: 'not-offered' }
  | { status: 'off' }
  | { status: 'open'; trusted: TrustedAgents }
  | { status: 'moved'; trusted: TrustedAgents }
  | { status: 'sent-back'; result: AgentsSentBack }
  | { status: 'key-replaced'; authorityKeyGeneration: number; moveInProgress: boolean };

/**
 * Opens the account's agents, automatically handling:
 * - agents not offered (`not-offered`) or not yet turned on (`off`);
 * - normal open (`open`), using `previousKey` when following history across a key move;
 * - Passhold key replacement (`moveAgentsToNewKey` when `previous` key is held and `autoMove !== false`,
 *   otherwise returning `key-replaced` so the owner can move or call `startAgentsAfresh`);
 * - server backup restore (`sendAgentsBack` when server epoch changed and a kept snapshot exists).
 */
export async function openOrRecoverAgents(
  api: HttpSyncAdapter,
  passhold: ProductKey,
  stored: StoredAgentsState | undefined,
  options: { previous?: ProductKey | null; autoMove?: boolean } = {},
): Promise<OpenAgentsOutcome> {
  let raw: AgentsState;
  try {
    raw = await api.agents(stored?.checkpoint.version ?? 0);
  } catch (error) {
    if (error instanceof SyncHttpError && (error.code === 'not_offered' || error.status === 404 || error.status === 501)) {
      return { status: 'not-offered' };
    }
    throw error;
  }

  if (!raw.authority) return { status: 'off' };

  if (raw.authority.keyGeneration < passhold.keyGeneration) {
    if (options.previous && options.previous.keyGeneration === raw.authority.keyGeneration && options.autoMove !== false) {
      const trusted = await moveAgentsToNewKey(api, options.previous, passhold, stored?.checkpoint ?? null, {
        known: knownAgentRecordOf(stored?.known),
      });
      return { status: 'moved', trusted };
    }
    return {
      status: 'key-replaced',
      authorityKeyGeneration: raw.authority.keyGeneration,
      moveInProgress: raw.move !== null,
    };
  }

  const checkpoint: AgentCheckpoint | null = stored?.checkpoint ?? null;
  try {
    const trusted = await openAgents(api, passhold, checkpoint, {
      ...(options.previous ? { previousKey: options.previous.key } : {}),
    });
    return { status: 'open', trusted };
  } catch (error) {
    if (error instanceof DecryptionError && stored?.checkpoint && stored.state) {
      const kept = stored.state as unknown as AgentsState;
      const fresh = await api.agents(0);
      if (fresh.epoch !== undefined && kept.epoch !== undefined && fresh.epoch !== kept.epoch) {
        const result = await sendAgentsBack(api, passhold, stored.checkpoint, kept);
        return { status: 'sent-back', result };
      }
    }
    throw error;
  }
}

/** Re-export helper to construct an `ApiKeyItem` draft compatible with agent items. */
export function isAgentApiKeyValue(value: unknown): value is AgentApiKeyValue {
  return typeof value === 'object' && value !== null && (value as Partial<AgentApiKeyValue>).kind === 'apikey' && typeof (value as Partial<AgentApiKeyValue>).key === 'string';
}

/** Validated API key payload delivered by a machine via `save_api_key` into the owner's inbox. */
export interface AgentInboxApiKey {
  kind: 'apikey';
  title: string;
  service: string;
  key: string;
  keyId: string;
  hosts: string[];
  sendAs: string;
  env: string;
  environment: string;
  scopes: string;
  notes: string;
  reason: string;
}

const trimMax = (value: unknown, max: number): string => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/**
 * Validates and normalizes an opened machine inbox entry body into a typed
 * API key candidate, auto-filling known service defaults and dropping any host
 * that fails `isMachineDelivery` (such as overly broad wildcard suffixes).
 */
export function parseAgentInboxApiKey(body: Record<string, unknown>): AgentInboxApiKey | null {
  if (body.kind !== undefined && body.kind !== 'apikey') return null;
  const key = typeof body.key === 'string' ? body.key.trim() : '';
  if (!key || key.length > 8192) return null;
  const rawTitle = trimMax(body.title, 200);
  const rawService = trimMax(body.service, 100);
  const rawKeyId = trimMax(body.keyId, 200);
  const rawHosts = Array.isArray(body.hosts) ? body.hosts.filter((h): h is string => typeof h === 'string') : typeof body.hosts === 'string' ? body.hosts : [];
  const rawEnv = trimMax(body.env, 128);
  const rawSendAs = trimMax(body.sendAs, 128);
  const draft = apiKeyFrom({
    title: rawTitle || rawEnv || 'API key',
    service: rawService,
    key,
    keyId: rawKeyId,
    hosts: cleanHosts(rawHosts),
    ...(rawSendAs ? { sendAs: rawSendAs } : {}),
    ...(rawEnv ? { env: cleanEnvName(rawEnv) } : {}),
    environment: trimMax(body.environment, 100),
    scopes: trimMax(body.scopes, 500),
    notes: trimMax(body.notes, 4000),
  });
  const detectedService = draft.service || serviceOfKey(key, rawKeyId) || '';
  const safeHosts = cleanHosts(draft.hosts).filter((h) => isMachineDelivery({ hosts: [h], sendAs: 'bearer', keyId: null, env: null }));
  const keyId = draft.keyId.trim();
  const sendAs = normalizeMachineSendAs(draft.sendAs || 'bearer', keyId || null);
  const env = cleanEnvName(draft.env);
  return {
    kind: 'apikey',
    title: draft.title.trim() || 'API key',
    service: detectedService,
    key,
    keyId,
    hosts: safeHosts,
    sendAs,
    env: env && VALID_ENV_VAR.test(env) ? env : '',
    environment: draft.environment.trim(),
    scopes: draft.scopes.trim(),
    notes: draft.notes.trim(),
    reason: trimMax(body.reason, 500),
  };
}

/** Converts a reviewed inbox API key payload into an agent vault item ready for `putAgentItem`. */
export function agentApiKeyFromInbox(entry: AgentInboxApiKey): AgentApiKeyValue {
  return {
    kind: 'apikey',
    title: entry.title,
    service: entry.service,
    key: entry.key,
    keyId: entry.keyId,
    hosts: [...entry.hosts],
    sendAs: entry.sendAs,
    env: entry.env,
    environment: entry.environment,
    scopes: entry.scopes,
    issuedAt: null,
    expiresAt: null,
    notes: entry.notes,
  };
}

export type McpClientKind = 'standard' | 'cursor' | 'vscode' | 'raw';

/**
 * Generates a ready-to-paste MCP client configuration snippet for `passhold mcp`.
 * Shared between the CLI (`passhold machine config`) and the extension UI.
 */
export function buildMcpConfigSnippet(
  client: McpClientKind = 'standard',
  options: { command?: string; apiUrl?: string } = {},
): string {
  const command = options.command?.trim() || 'passhold';
  const apiUrl = options.apiUrl?.trim();
  const env = apiUrl && apiUrl !== 'https://api.keyrook.com' ? { PASSHOLD_API: apiUrl } : undefined;
  if (client === 'raw') {
    return env ? `PASSHOLD_API=${env.PASSHOLD_API} ${command} mcp\n` : `${command} mcp\n`;
  }
  if (client === 'vscode') {
    return `${JSON.stringify(
      {
        servers: {
          passhold: {
            type: 'stdio',
            command,
            args: ['mcp'],
            ...(env ? { env } : {}),
          },
        },
      },
      null,
      2,
    )}\n`;
  }
  return `${JSON.stringify(
    {
      mcpServers: {
        passhold: {
          command,
          args: ['mcp'],
          ...(env ? { env } : {}),
        },
      },
    },
    null,
    2,
  )}\n`;
}

function sameItemDescription(
  a: { listing: MachineListing; delivery: MachineDelivery },
  b: { listing: MachineListing; delivery: MachineDelivery },
): boolean {
  return (
    a.listing.title === b.listing.title &&
    a.listing.kind === b.listing.kind &&
    (a.listing.service ?? '') === (b.listing.service ?? '') &&
    (a.listing.environment ?? '') === (b.listing.environment ?? '') &&
    (a.listing.ref ?? '') === (b.listing.ref ?? '') &&
    a.delivery.sendAs === b.delivery.sendAs &&
    a.delivery.keyId === b.delivery.keyId &&
    a.delivery.env === b.delivery.env &&
    a.delivery.hosts.length === b.delivery.hosts.length &&
    a.delivery.hosts.every((host, index) => host === b.delivery.hosts[index])
  );
}

export interface RefreshEditedAgentItemResult {
  trusted: TrustedAgents;
  item: AgentItem<AgentItemValue>;
  /** Number of live machines whose grants were re-issued with the updated listing and delivery. */
  refreshed: number;
  /** True when re-issuing a grant that previously held an item key triggered `finishMachineRekey`. */
  rekeyed: boolean;
}

/**
 * Re-issues active grants for an edited agent item whenever its `listing` or
 * `delivery` (`hosts`, `sendAs`, `keyId`, `env`, `title`, …) changed.
 *
 * `putAgentItem` updates the sealed record (and the server notifies holders),
 * but `listing` and `delivery` are signed inside each machine's grant box, so
 * live machines would otherwise keep using stale hosts or titles until granted
 * again by hand. If re-issuing a non-standing grant whose machine previously
 * held the item key (such as an active session) queues a rekey, this finishes
 * the rekey right away so every remaining live machine receives the update at
 * the new version and the item is not left waiting for a key replacement.
 */
export async function refreshEditedAgentItemGrants(
  api: HttpSyncAdapter,
  trusted: TrustedAgents,
  productKey: ProductKey,
  vault: OpenedAgentVault,
  previous: AgentItem<AgentItemValue> | null,
  saved: AgentItem<AgentItemValue>,
  options: {
    now?: number;
    known?: Record<string, { version: number; rev: number }>;
    vaultNames?: ReadonlyMap<string, string>;
  } = {},
): Promise<RefreshEditedAgentItemResult> {
  if (saved.deleted || !saved.value || !previous || previous.deleted || !previous.value) {
    return { trusted, item: saved, refreshed: 0, rekeyed: false };
  }
  const before = describeAgentItem(previous, vault.name);
  const after = describeAgentItem(saved, vault.name);
  if (sameItemDescription(before, after)) {
    return { trusted, item: saved, refreshed: 0, rekeyed: false };
  }

  const now = options.now ?? Date.now();
  const targets: string[] = [];
  for (const entry of trusted.directory.machines) {
    if (entry.removed) continue;
    const pin = trusted.pins.get(entry.id);
    const view = trusted.machines.get(entry.id);
    if (!pin || pin.removedAt !== null || pin.expiresAt <= now || view?.status === 'removed') continue;
    const held = pin.grants.find((grant) => grant.vault === vault.id && grant.item === saved.item);
    if (!held || (held.expiresAt !== null && held.expiresAt <= now)) continue;
    targets.push(entry.id);
  }
  if (targets.length === 0) {
    return { trusted, item: saved, refreshed: 0, rekeyed: false };
  }

  let currentTrusted = trusted;
  let refreshed = 0;
  let rekeyed = false;
  let currentItem = saved;
  const knownAfterEdit = mergeKnownAgentItems(options.known, [saved]);

  for (const machineId of targets) {
    const pin = currentTrusted.pins.get(machineId);
    const held = pin?.grants.find((grant) => grant.vault === vault.id && grant.item === saved.item);
    if (!pin || pin.removedAt !== null || pin.expiresAt <= now || !held || (held.expiresAt !== null && held.expiresAt <= now)) {
      continue;
    }
    const given = await giveMachineItems(
      api,
      currentTrusted,
      productKey,
      machineId,
      [
        {
          vault,
          item: currentItem,
          uses: [...held.uses],
          approval: held.approval,
          ...(held.approval === 'session' && held.session !== null ? { session: held.session } : {}),
          bounds: { ...held.bounds },
          expiresAt: held.expiresAt,
          listing: after.listing,
          delivery: after.delivery,
        },
      ],
      now,
    );
    currentTrusted = await openAgents(api, productKey, given.checkpoint);
    refreshed += 1;

    const queuedThisItem = given.rekey.some(
      (entry) => entry.vault === vault.id && entry.item === saved.item && entry.version === currentItem.version,
    );
    if (queuedThisItem) {
      const names =
        options.vaultNames ??
        new Map((await openAgentVaults(api, currentTrusted, productKey)).map((v) => [v.id, v.name]));
      const rekeyResult = await finishMachineRekey(
        api,
        currentTrusted,
        productKey,
        (entry) => describeAgentItem(entry, names.get(entry.vault)),
        { now, known: knownAgentRecordOf(knownAfterEdit) },
      );
      currentTrusted = await openAgents(api, productKey, rekeyResult.checkpoint);
      const synced = await syncAgentVault<AgentItemValue>(api, currentTrusted, productKey, vault, {
        known: knownAgentRecordOf(knownAfterEdit),
      });
      const updated = synced.items.find((entry) => entry.item === saved.item);
      if (updated) currentItem = updated;
      rekeyed = true;
      // `finishMachineRekey` re-issued grants for every remaining live machine holding this item.
      refreshed = targets.length;
      break;
    }
  }

  return { trusted: currentTrusted, item: currentItem, refreshed, rekeyed };
}

export type { ApiKeyItem };
