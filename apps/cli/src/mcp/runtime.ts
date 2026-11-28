/**
 * Machine runtime backing `passhold mcp`: manages machine identity, pulls and
 * caches grants (with 429 fallback to valid sealed cache), enforces host/bounds
 * checks and exact operation binding, manages in-memory session keys (never on
 * disk, per-command-line scoped for `run_command`), and seals audit log batches.
 */
import {
  consumeMachineRelease,
  forgetMachineAsks,
  openGivenRecord,
  prepareMachineAccess,
  prepareMachineUse,
  readMachineStatus,
  sealMachineLogBatch,
  sendMachineAsk,
  sendMachineLogBatch,
  SyncHttpError,
  type MachineAsk,
  type MachineClient,
  type MachineGivenItem,
  type MachineLogEntry,
  type MachineOperation,
  type MachineRelease,
} from '@keyrook/account';
import {
  boundsAllowCommand,
  boundsAllowRequest,
  buildHttpOperation,
  buildRunOperation,
  extractAgentField,
  hostAllowed,
  newId,
  operationsEqual,
  primaryAgentSecret,
  type AgentItemValue,
  type SecretEntry,
} from '@passhold/core';
import { ensureMachineConfirmed, pullMachineIntoCache, type LoadedMachine } from '../machine.js';
import { importVerifyKey, type CachedMachineItem, type CachedMachineState, type Store } from '../store.js';
import { executeSafeCommand, type CommandExecutor, type SafeExecResult } from './exec.js';
import { deliveryHeaderName, executeDirectHttp, type DirectHttpResponse, type HttpTransport } from './http.js';

export interface MachineRuntimeOptions {
  client: MachineClient;
  store: Store;
  env: NodeJS.ProcessEnv;
  loaded: LoadedMachine;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  /** Maximum time to wait for interactive human approval (ms). Defaults to 120s. */
  approvalTimeoutMs?: number;
  /** Poll interval while waiting for human approval (ms). Defaults to 1500ms. */
  pollIntervalMs?: number;
  httpTransport?: HttpTransport;
  commandExecutor?: CommandExecutor;
  /** Allow plain `http:` to loopback addresses (default true, useful for local servers and tests). */
  allowInsecureLoopback?: boolean;
}

interface SessionKeyHeld {
  key: CryptoKey;
  until: number;
  version: number;
}

interface QueuedLogEntry {
  sequence: number;
  entry: MachineLogEntry;
}

const LOG_INTERVAL_MS = 60_000;

export class MachineRuntime {
  private readonly client: MachineClient;
  private readonly store: Store;
  private readonly env: NodeJS.ProcessEnv;
  private loaded: LoadedMachine;
  private readonly now: () => number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly approvalTimeoutMs: number;
  private readonly pollIntervalMs: number;
  private readonly httpTransport: HttpTransport;
  private readonly commandExecutor: CommandExecutor;
  private readonly allowInsecureLoopback: boolean;

  private cache: CachedMachineState | null = null;
  /** In-memory session keys ONLY — never written to disk! */
  private readonly sessionKeys = new Map<string, SessionKeyHeld>();
  private readonly logStream: string;
  private logSequence = 0;
  private readonly unsealedLogs: QueuedLogEntry[] = [];
  private lastLogSendAt = 0;

  constructor(options: MachineRuntimeOptions) {
    this.client = options.client;
    this.store = options.store;
    this.env = options.env;
    this.loaded = options.loaded;
    this.now = options.now ?? Date.now;
    this.sleep = options.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.approvalTimeoutMs = options.approvalTimeoutMs ?? 120_000;
    this.pollIntervalMs = options.pollIntervalMs ?? 1_500;
    this.httpTransport = options.httpTransport ?? executeDirectHttp;
    this.commandExecutor = options.commandExecutor ?? executeSafeCommand;
    this.allowInsecureLoopback = options.allowInsecureLoopback ?? true;
    this.logStream = newId();
  }

  /** Pulls latest grants from the server, falling back to valid sealed local cache on HTTP 429. */
  async sync(): Promise<CachedMachineState> {
    const t = this.now();
    const { accountId, machineId } = this.loaded.identity.credentials;
    const cacheFile = this.store.cachePath(this.env);
    try {
      this.loaded = await ensureMachineConfirmed(this.client, this.store, this.loaded, t);
      const status = await readMachineStatus(this.client, this.loaded.identity, this.loaded.invitationId, t);
      this.loaded = { ...this.loaded, expiresAt: status.expiresAt };
      this.cache = await pullMachineIntoCache(this.client, this.store, this.env, this.loaded, t);
      // Drop any in-memory session key whose item was withdrawn or moved to a newer version.
      for (const [k, held] of [...this.sessionKeys.entries()]) {
        const [vault, item] = k.split(':');
        const current = this.cache.items[`${vault}:${item}`];
        if (!current || current.deleted || current.version !== held.version || held.until <= t) {
          this.sessionKeys.delete(k);
        }
      }
      return this.cache;
    } catch (error) {
      if (error instanceof SyncHttpError && (error.status === 401 || error.status === 403)) {
        forgetMachineAsks(this.loaded.identity);
        this.sessionKeys.clear();
        throw error;
      }
      if (error instanceof SyncHttpError && error.status === 429) {
        const fallback = this.cache ?? (await this.store.readMachineCache(this.loaded.identity.key, accountId, machineId, cacheFile));
        if (fallback && (fallback.machineExpiresAt === 0 || fallback.machineExpiresAt > t)) {
          this.cache = fallback;
          return fallback;
        }
      }
      throw error;
    }
  }

  private async ensureCache(): Promise<CachedMachineState> {
    if (!this.cache) return this.sync();
    return this.cache;
  }

  private findItem(cache: CachedMachineState, target: string): CachedMachineItem {
    const t = this.now();
    const live = Object.values(cache.items).filter(
      (entry) => !entry.deleted && (entry.grant.expiresAt === null || entry.grant.expiresAt > t),
    );
    const cleaned = target.trim();
    // Exact `vault:item` key
    if (cache.items[cleaned] && !cache.items[cleaned]!.deleted) {
      const hit = cache.items[cleaned]!;
      if (hit.grant.expiresAt !== null && hit.grant.expiresAt <= t) throw new Error(`Grant for "${cleaned}" has expired.`);
      return hit;
    }
    // `passhold://vault/item` or bare item id or exact title
    const refMatch = /^passhold:\/\/([^/]+)\/([^/]+)(?:\/.*)?$/i.exec(cleaned);
    const matches = live.filter((entry) => {
      if (refMatch) {
        const vWant = decodeURIComponent(refMatch[1]!).toLowerCase();
        const iWant = decodeURIComponent(refMatch[2]!).toLowerCase();
        const ref = (entry.listing.ref ?? '').toLowerCase();
        return (
          (entry.vault.toLowerCase() === vWant || ref.startsWith(`passhold://${vWant}/`)) &&
          (entry.item.toLowerCase() === iWant || (entry.listing.title ?? '').toLowerCase() === iWant)
        );
      }
      return (
        entry.item === cleaned ||
        (entry.listing.title ?? '').toLowerCase() === cleaned.toLowerCase() ||
        (entry.listing.ref ?? '').toLowerCase() === cleaned.toLowerCase()
      );
    });
    if (matches.length === 1) return matches[0]!;
    if (matches.length > 1) throw new Error(`Multiple granted items match "${target}". Specify "<vault>:<item>".`);
    throw new Error(`No active granted item matches "${target}".`);
  }

  private async cachedToGiven(entry: CachedMachineItem): Promise<MachineGivenItem<AgentItemValue>> {
    return {
      vault: entry.vault,
      item: entry.item,
      version: entry.version,
      grant: entry.grant,
      listing: entry.listing,
      delivery: entry.delivery,
      verify: await importVerifyKey(entry.recordWriteKey),
      key: null,
      record: entry.recordBox ? { rev: entry.rev, deleted: entry.deleted, box: entry.recordBox, value: entry.value } : null,
    };
  }

  /** Collects every known secret in the runtime (standing items + extra active secrets) for output redaction. */
  private collectRedactionSecrets(cache: CachedMachineState, extra: readonly SecretEntry[]): SecretEntry[] {
    const out: SecretEntry[] = [...extra];
    for (const entry of Object.values(cache.items)) {
      if (entry.deleted || !entry.value) continue;
      const primary = primaryAgentSecret(entry.value);
      if (primary.value) {
        out.push({
          label: entry.listing.title || entry.item,
          field: primary.field,
          value: primary.value,
          ...(primary.keyId ? { keyId: primary.keyId } : {}),
        });
      }
      for (const field of entry.value.fields ?? []) {
        if (field.hidden && field.value) {
          out.push({ label: entry.listing.title || entry.item, field: field.name, value: field.value });
        }
      }
    }
    return out;
  }

  /** Submits an approval request and polls until answered, denied, or timed out. */
  private async waitForRelease(ask: MachineAsk, expectedOperation?: MachineOperation): Promise<Extract<MachineRelease, { status: 'answered' }>> {
    await sendMachineAsk(this.client, this.loaded.identity, ask);
    const deadline = this.now() + this.approvalTimeoutMs;
    const machineExpiresAt = this.loaded.expiresAt || this.cache?.machineExpiresAt || this.now() + 86_400_000;
    for (;;) {
      const release = await consumeMachineRelease(this.client, this.loaded.identity, ask, {
        machineExpiresAt,
        now: this.now(),
        marks: this.cache?.marks ?? null,
      });
      if (release.status === 'answered') {
        // Explicit defense-in-depth operation binding check against the request we prepared.
        if (expectedOperation) {
          const sentReq = ask.outstanding.request;
          if (sentReq.kind !== 'use' || !operationsEqual(sentReq.operation, expectedOperation)) {
            throw new Error('Approved release does not match the prepared operation.');
          }
        }
        return release;
      }
      if (this.now() >= Math.min(deadline, release.expiresAt)) {
        throw new Error('Timed out waiting for approval in Passhold.');
      }
      await this.sleep(this.pollIntervalMs);
    }
  }

  /** Resolves one field value for an operation, using standing cache, valid session key, or interactive approval. */
  private async obtainSecretForUse(
    cache: CachedMachineState,
    entry: CachedMachineItem,
    field: string,
    operation: MachineOperation,
    reason: string,
    sessionScopeSuffix = '',
  ): Promise<{ value: string; mode: 'standing' | 'session' | 'once' }> {
    const t = this.now();
    if (!entry.grant.uses.includes(operation.use)) {
      throw new Error(`Grant for "${entry.listing.title || entry.item}" does not allow "${operation.use}".`);
    }
    if (entry.grant.expiresAt !== null && entry.grant.expiresAt <= t) {
      throw new Error(`Grant for "${entry.listing.title || entry.item}" has expired.`);
    }

    // Reveal ALWAYS requires per-use approval — never standing, never session!
    if (operation.use === 'reveal') {
      const given = await this.cachedToGiven(entry);
      const ask = await prepareMachineUse(this.loaded.identity, given, { field, operation, reason }, t);
      const answered = await this.waitForRelease(ask, operation);
      if (answered.outcome !== 'allow' || answered.release !== 'once') {
        throw new Error('Request to reveal value was denied.');
      }
      return { value: answered.value, mode: 'once' };
    }

    // Standing grant: open directly from verified sealed cache.
    if (entry.grant.approval === 'standing') {
      if (!entry.value) throw new Error(`Standing item "${entry.listing.title || entry.item}" has no readable value.`);
      const val = extractAgentField(entry.value, field);
      if (val === null) throw new Error(`Item "${entry.listing.title || entry.item}" has no field "${field}".`);
      return { value: val, mode: 'standing' };
    }

    // Session grant: check in-memory session key (scoped per command line for `run_command`!).
    const sessionKeyId = `${entry.vault}:${entry.item}${sessionScopeSuffix}`;
    if (entry.grant.approval === 'session') {
      const held = this.sessionKeys.get(sessionKeyId);
      if (held && held.until > t && held.version === entry.version) {
        const opened = await openGivenRecord<AgentItemValue>(
          this.loaded.identity.credentials.accountId,
          await this.cachedToGiven(entry),
          held.key,
        );
        if (opened) {
          const val = extractAgentField(opened, field);
          if (val !== null) return { value: val, mode: 'session' };
        }
      }
    }

    // Ask the person for approval (`each` or expired/missing `session`).
    const given = await this.cachedToGiven(entry);
    const ask = await prepareMachineUse(this.loaded.identity, given, { field, operation, reason }, t);
    const answered = await this.waitForRelease(ask, operation);
    if (answered.outcome !== 'allow') {
      throw new Error(`Request to use "${entry.listing.title || entry.item}" was denied.`);
    }
    if (answered.release === 'once') {
      return { value: answered.value, mode: 'once' };
    }
    if (answered.release === 'session') {
      this.sessionKeys.set(sessionKeyId, { key: answered.key, until: answered.until, version: entry.version });
      const opened = await openGivenRecord<AgentItemValue>(
        this.loaded.identity.credentials.accountId,
        given,
        answered.key,
      );
      if (!opened) throw new Error('Session key could not open the item record.');
      const val = extractAgentField(opened, field);
      if (val === null) throw new Error(`Item "${entry.listing.title || entry.item}" has no field "${field}".`);
      return { value: val, mode: 'session' };
    }
    throw new Error('Unexpected release kind for use request.');
  }

  /** Appends an audit entry (never containing secret values) and queues it for sealed batch upload. */
  recordLog(detail: Record<string, unknown>): void {
    this.logSequence += 1;
    this.unsealedLogs.push({
      sequence: this.logSequence,
      entry: { stream: this.logStream, at: this.now(), entry: detail },
    });
  }

  /**
   * Seals queued audit entries and attempts to upload them to `/machine/log`.
   * Respects the 1-batch-per-minute ceiling unless `force` is true, and retains
   * unacknowledged or refused entries in the sealed local cache.
   */
  async flushLogs(force = false): Promise<{ sent: number; pending: number }> {
    const t = this.now();
    const { accountId, machineId } = this.loaded.identity.credentials;
    const cacheFile = this.store.cachePath(this.env);
    const cache = this.cache ?? (await this.store.readMachineCache(this.loaded.identity.key, accountId, machineId, cacheFile));
    const pending = [...(cache?.pendingLogs ?? [])];

    if (this.unsealedLogs.length > 0) {
      const batch = await sealMachineLogBatch(this.loaded.identity, this.unsealedLogs.splice(0));
      pending.push(...batch.entries);
    }

    if (pending.length === 0) return { sent: 0, pending: 0 };
    if (!force && this.lastLogSendAt > 0 && t - this.lastLogSendAt < LOG_INTERVAL_MS) {
      if (cache) {
        cache.pendingLogs = pending;
        await this.store.writeMachineCache(this.loaded.identity.key, accountId, machineId, cache, cacheFile);
      }
      return { sent: 0, pending: pending.length };
    }

    try {
      const ack = await sendMachineLogBatch(this.client, this.loaded.identity, { entries: pending });
      this.lastLogSendAt = t;
      const done = (stream: string, seq: number) =>
        [...ack.accepted, ...ack.conflicts].some((r) => r.stream === stream && seq >= r.first && seq <= r.last);
      const remaining = pending.filter((entry) => !done(entry.stream, entry.sequence));
      const sent = pending.length - remaining.length;
      if (cache) {
        cache.pendingLogs = remaining;
        await this.store.writeMachineCache(this.loaded.identity.key, accountId, machineId, cache, cacheFile);
      }
      return { sent, pending: remaining.length };
    } catch {
      // Keep sealed entries locally for the next attempt.
      if (cache) {
        cache.pendingLogs = pending;
        await this.store.writeMachineCache(this.loaded.identity.key, accountId, machineId, cache, cacheFile);
      }
      return { sent: 0, pending: pending.length };
    }
  }

  // --- MCP tool implementations ----------------------------------------------------------

  /** `list_items`: lists granted item metadata ONLY — never returns secret values. */
  async listItems(refresh = true) {
    const cache = refresh ? await this.sync() : await this.ensureCache();
    const t = this.now();
    return Object.values(cache.items)
      .filter((entry) => !entry.deleted && (entry.grant.expiresAt === null || entry.grant.expiresAt > t))
      .map((entry) => ({
        id: `${entry.vault}:${entry.item}`,
        vault: entry.vault,
        item: entry.item,
        title: entry.listing.title ?? entry.item,
        kind: entry.listing.kind ?? 'apikey',
        service: entry.listing.service ?? null,
        environment: entry.listing.environment ?? null,
        ref: entry.listing.ref ?? `passhold://${entry.vault}/${entry.item}`,
        uses: entry.grant.uses,
        approval: entry.grant.approval,
        sessionSeconds: entry.grant.session,
        hosts: entry.delivery.hosts,
        sendAs: entry.delivery.sendAs,
        env: entry.delivery.env,
        bounds: entry.grant.bounds,
        expiresAt: entry.grant.expiresAt,
      }));
  }

  /** `http_request`: injects credentials into an authenticated, host-checked, non-redirected direct HTTP request. */
  async httpRequest(input: {
    item: string;
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: string | null;
    field?: string;
    reason?: string;
    timeoutMs?: number;
  }): Promise<DirectHttpResponse> {
    const cache = await this.sync();
    const entry = this.findItem(cache, input.item);
    if (!entry.grant.uses.includes('request')) {
      throw new Error(`Item "${entry.listing.title || entry.item}" is not granted for http_request.`);
    }
    const forbidden = deliveryHeaderName(entry.delivery);
    const { normalized, operation, bodyBytes } = await buildHttpOperation({
      method: input.method,
      url: input.url,
      headers: input.headers,
      body: input.body ?? null,
      forbiddenHeaders: forbidden,
      allowInsecureLoopback: this.allowInsecureLoopback,
    });
    if (!hostAllowed(normalized, entry.delivery.hosts)) {
      this.recordLog({ tool: 'http_request', item: `${entry.vault}:${entry.item}`, method: operation.method, host: normalized.host, outcome: 'blocked_host' });
      throw new Error(`Host "${normalized.host}" is not in the allowed hosts for "${entry.listing.title || entry.item}".`);
    }
    const boundsCheck = boundsAllowRequest(entry.grant.bounds, operation.method, normalized);
    if (!boundsCheck.ok) {
      this.recordLog({ tool: 'http_request', item: `${entry.vault}:${entry.item}`, method: operation.method, host: normalized.host, outcome: 'blocked_bounds' });
      throw new Error(boundsCheck.reason);
    }

    const field = input.field?.trim() || (entry.listing.kind === 'login' ? 'password' : 'key');
    const obtained = await this.obtainSecretForUse(cache, entry, field, operation, input.reason?.trim() || '');
    const usedSecret: SecretEntry = {
      label: entry.listing.title || entry.item,
      field,
      value: obtained.value,
      ...(entry.delivery.keyId ? { keyId: entry.delivery.keyId } : {}),
    };
    const redactList = this.collectRedactionSecrets(cache, [usedSecret]);

    const response = await this.httpTransport({
      method: operation.method,
      normalized,
      headers: operation.headers,
      body: bodyBytes,
      delivery: entry.delivery,
      secretValue: obtained.value,
      redact: redactList,
      timeoutMs: input.timeoutMs,
    });

    this.recordLog({
      tool: 'http_request',
      item: `${entry.vault}:${entry.item}`,
      method: operation.method,
      host: normalized.host,
      path: normalized.pathname,
      status: response.status,
      mode: obtained.mode,
    });
    return response;
  }

  /** `run_command`: runs a child command with injected env secrets (`shell: false`), stripping Passhold auth vars and redacting output. */
  async runCommand(input: {
    argv: string[];
    cwd?: string;
    env: Record<string, string>;
    timeout?: number;
    reason?: string;
  }): Promise<SafeExecResult> {
    const cache = await this.sync();
    const cwd = input.cwd || process.cwd();
    const timeout = input.timeout ?? 60;
    const envPairs = Object.entries(input.env ?? {});
    if (envPairs.length === 0) throw new Error('run_command requires at least one secret env mapping.');

    const resolvedTargets: { name: string; ref: string; field: string; entry: CachedMachineItem }[] = [];
    for (const [envName, rawTarget] of envPairs) {
      const refMatch = /^passhold:\/\/([^/]+)\/([^/]+)(?:\/(.+))?$/i.exec(rawTarget.trim());
      const field = refMatch?.[3] ? decodeURIComponent(refMatch[3]).trim() : 'key';
      const itemTarget = refMatch ? `passhold://${refMatch[1]}/${refMatch[2]}` : rawTarget.trim();
      const entry = this.findItem(cache, itemTarget);
      if (!entry.grant.uses.includes('run')) {
        throw new Error(`Item "${entry.listing.title || entry.item}" is not granted for run_command.`);
      }
      const check = boundsAllowCommand(entry.grant.bounds, input.argv, cwd);
      if (!check.ok) {
        this.recordLog({ tool: 'run_command', item: `${entry.vault}:${entry.item}`, argv0: input.argv[0], outcome: 'blocked_bounds' });
        throw new Error(check.reason);
      }
      resolvedTargets.push({
        name: envName,
        ref: entry.listing.ref || `passhold://${entry.vault}/${entry.item}`,
        field,
        entry,
      });
    }

    const operation = buildRunOperation({
      argv: input.argv,
      cwd,
      env: resolvedTargets.map(({ name, ref }) => ({ name, ref })),
      timeout,
    });

    // Per-command-line session scope so session approval for one argv never covers a different command!
    const runScope = `:run:${JSON.stringify(operation.argv)}`;
    const injectedEnv: Record<string, string> = {};
    const extraRedact: SecretEntry[] = [];
    for (const target of resolvedTargets) {
      const obtained = await this.obtainSecretForUse(
        cache,
        target.entry,
        target.field,
        operation,
        input.reason?.trim() || '',
        runScope,
      );
      injectedEnv[target.name] = obtained.value;
      extraRedact.push({
        label: target.entry.listing.title || target.entry.item,
        field: target.field,
        value: obtained.value,
        ...(target.entry.delivery.keyId ? { keyId: target.entry.delivery.keyId } : {}),
      });
    }

    const result = await this.commandExecutor({
      argv: operation.argv,
      cwd: operation.cwd,
      baseEnv: this.env,
      injectedEnv,
      timeoutSeconds: operation.timeout,
      redact: this.collectRedactionSecrets(cache, extraRedact),
    });

    this.recordLog({
      tool: 'run_command',
      argv0: operation.argv[0],
      cwd: operation.cwd,
      exitCode: result.exitCode,
      timedOut: result.timedOut,
    });
    return result;
  }

  /** `reveal`: requests explicit one-time human approval to disclose a single field value. */
  async reveal(input: { item: string; field?: string; reason: string }): Promise<{ field: string; value: string }> {
    const cache = await this.sync();
    const entry = this.findItem(cache, input.item);
    if (!entry.grant.uses.includes('reveal')) {
      throw new Error(`Item "${entry.listing.title || entry.item}" is not granted for reveal.`);
    }
    const field = input.field?.trim() || (entry.listing.kind === 'login' ? 'password' : 'key');
    const operation: MachineOperation = { use: 'reveal', field };
    const obtained = await this.obtainSecretForUse(cache, entry, field, operation, input.reason?.trim() || '');
    this.recordLog({ tool: 'reveal', item: `${entry.vault}:${entry.item}`, field, mode: 'once' });
    return { field, value: obtained.value };
  }

  /** `request_access`: asks the human owner for a grant to an item this machine does not yet hold. */
  async requestAccess(input: { what: string; reason: string }): Promise<{ granted: boolean; vault?: string; item?: string }> {
    const t = this.now();
    const ask = await prepareMachineAccess(this.loaded.identity, input.what, input.reason, t);
    const answered = await this.waitForRelease(ask);
    if (answered.outcome === 'allow' && answered.release === 'grant') {
      await this.sync();
      this.recordLog({ tool: 'request_access', what: input.what, outcome: 'allow', vault: answered.grant.vault, item: answered.grant.item });
      return { granted: true, vault: answered.grant.vault, item: answered.grant.item ?? undefined };
    }
    this.recordLog({ tool: 'request_access', what: input.what, outcome: 'deny' });
    return { granted: false };
  }

  /** `status`: returns verified machine status and cached item count. */
  async status() {
    const t = this.now();
    this.loaded = await ensureMachineConfirmed(this.client, this.store, this.loaded, t);
    const s = await readMachineStatus(this.client, this.loaded.identity, this.loaded.invitationId, t);
    this.loaded = { ...this.loaded, expiresAt: s.expiresAt };
    const cache = await this.ensureCache();
    return {
      machineId: this.loaded.identity.credentials.machineId,
      kind: this.loaded.kind,
      status: s.status,
      expiresAt: s.expiresAt,
      grantedItems: Object.values(cache.items).filter((i) => !i.deleted).length,
      pendingLogs: (cache.pendingLogs?.length ?? 0) + this.unsealedLogs.length,
    };
  }
}
