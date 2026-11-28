/**
 * `passhold approve`: interactive terminal approval of pending machine requests.
 *
 * Security invariants:
 * 1. Runs ONLY at an interactive terminal (`context.isTTY === true`). Never
 *    accepts piped stdin or non-TTY execution.
 * 2. ALWAYS unlocks Passhold's `ProductKey` freshly at the terminal (password,
 *    `--recovery-key`, or `--with-browser`). NEVER reads `PASSHOLD_SESSION` or
 *    `session.json`, and NEVER writes a session file.
 * 3. Persists the updated agent directory checkpoint in `deciding.remember`
 *    BEFORE any secret or session key is released.
 * 4. Drops the freshly unlocked key when the command returns.
 */
import {
  approveMachineAccess,
  approveMachineUse,
  denyMachineUse,
  openAgentVaults,
  openAgents,
  reviewMachineRequests,
  syncAgentVault,
  type AgentCheckpoint,
  type AgentItem,
  type MachineOperation,
  type OpenedAgentVault,
  type ReviewedMachineRequest,
  type TrustedAgents,
} from '@keyrook/account';
import {
  extractAgentField,
  mergeKnownAgentItems,
  openOrRecoverAgents,
  toStoredAgentsState,
  type AgentItemValue,
} from '@passhold/core';
import type { Account } from './account.js';
import type { Context } from './cli.js';
import { CliError } from './reference.js';
import type { Store } from './store.js';

export interface ApproveOptions {
  store: Store;
  account: Account;
  now: () => number;
  say: (line: string) => void;
  recoveryKey: boolean;
  withBrowser: boolean;
  /** Optional filter to review requests for a single machine id. */
  machineId?: string;
}

function formatOperation(op: MachineOperation): string[] {
  switch (op.use) {
    case 'request': {
      const lines = [`  Operation: HTTP ${op.method} ${op.url}`];
      if (op.headers.length) lines.push(`  Headers:   ${op.headers.map(([k, v]) => `${k}: ${v}`).join(', ')}`);
      if (op.body !== null) lines.push(`  Body SHA-256: ${op.body}`);
      return lines;
    }
    case 'run': {
      const lines = [
        `  Operation: RUN ${op.argv.join(' ')}`,
        `  Directory: ${op.cwd}`,
        `  Timeout:   ${op.timeout}s`,
      ];
      if (op.env.length) lines.push(`  Env vars:  ${op.env.map((e) => `${e.name}=${e.ref}`).join(', ')}`);
      return lines;
    }
    case 'fill':
      return [`  Operation: FILL ${op.url}`];
    case 'reveal':
      return [`  Operation: REVEAL field "${op.field}" (one-time value disclosure)`];
  }
}

export async function runApprove(context: Context, options: ApproveOptions): Promise<number> {
  // Invariant 1: terminal only.
  if (context.isTTY !== true) {
    throw new CliError('passhold approve runs only at an interactive terminal.');
  }

  const { account, now, say, recoveryKey, withBrowser } = options;
  account.signedIn();

  // Invariant 2: ALWAYS unlock freshly — never touch PASSHOLD_SESSION or session.json.
  let fresh: Awaited<ReturnType<Account['freshProductKey']>>;
  if (withBrowser) {
    say('Open Passhold in a browser signed in to this account to unlock for this approval.');
    fresh = await account.freshProductKey({
      browser: {
        onCode: (code) => say(`Check that the browser shows this code, then approve there:  ${code}`),
        wait: (ms) => new Promise((done) => setTimeout(done, ms)),
      },
    });
  } else if (recoveryKey) {
    fresh = await account.freshProductKey({ recoveryKey: await context.secret('Recovery key (fresh unlock for approve): ') });
  } else {
    fresh = await account.freshProductKey({ password: await context.secret('Account password (fresh unlock for approve): ') });
  }

  const { api, productKey, previous, account: storedAccount } = fresh;
  const opened = await openOrRecoverAgents(api, productKey, storedAccount.agents, { previous, autoMove: false });
  if (opened.status === 'not-offered') throw new CliError('Agents are not offered on this server yet.');
  if (opened.status === 'off') throw new CliError('Agents are not turned on for this account. Run: passhold machine init');
  if (opened.status === 'key-replaced') {
    throw new CliError('Passhold’s key was replaced. Move agents (passhold machine move) or start afresh (passhold machine reset) first.');
  }
  let trusted: TrustedAgents = opened.status === 'sent-back' ? opened.result.trusted : opened.trusted;
  let storedAgents = toStoredAgentsState(trusted, storedAccount.agents);
  account.saveAgentsState(storedAgents);

  const reviewed = await reviewMachineRequests(api, trusted, productKey, now());
  if (reviewed.unreadable > 0) {
    say(`Skipped ${reviewed.unreadable} unreadable or unverified request${reviewed.unreadable === 1 ? '' : 's'}.`);
  }
  const queue = options.machineId
    ? reviewed.requests.filter((entry) => entry.machineId === options.machineId)
    : reviewed.requests;

  if (queue.length === 0) {
    say('No pending machine requests.');
    return 0;
  }

  // Load agent vaults & items once so we can display real titles and resolve fields/keys cleanly.
  const vaults: OpenedAgentVault[] = await openAgentVaults(api, trusted, productKey);
  const vaultNames = new Map(vaults.map((v) => [v.id, v.name]));
  const itemsByPlace = new Map<string, AgentItem<AgentItemValue>>();
  let known = storedAgents.known;
  for (const vault of vaults) {
    const synced = await syncAgentVault<AgentItemValue>(api, trusted, productKey, vault);
    known = mergeKnownAgentItems(known, synced.items);
    for (const item of synced.items) {
      if (!item.deleted) itemsByPlace.set(`${vault.id}:${item.item}`, item);
    }
  }
  storedAgents = toStoredAgentsState(trusted, storedAgents, { known });
  account.saveAgentsState(storedAgents);

  const askLine = context.line ?? context.secret;
  let answered = 0;

  for (const entry of queue) {
    const req = entry.request.request;
    say('');
    say(`Request ${entry.request.place.requestId} from machine "${entry.machineName}" (${entry.machineId})`);
    if (!entry.fresh) {
      say('  This request is no longer fresh and cannot be approved.');
      continue;
    }

    if (req.kind === 'use') {
      const place = `${req.vault}:${req.item}`;
      const item = itemsByPlace.get(place);
      const vaultLabel = vaultNames.get(req.vault) ?? req.vault;
      const itemLabel = item?.value?.title || req.item;
      say(`  Item:      ${vaultLabel} / ${itemLabel} (field: ${req.field})`);
      for (const line of formatOperation(req.operation)) say(line);
      if (req.reason) say(`  Agent reason (untrusted): "${req.reason}"`);

      if (!entry.grant) {
        say('  No matching grant is held by this machine. Denying or skipping only.');
      }

      const canSession =
        entry.grant !== null &&
        entry.grant.approval === 'session' &&
        req.operation.use !== 'reveal' &&
        item !== undefined;
      const prompt = canSession
        ? 'Allow [o]nce, allow for [s]ession, [d]eny, or s[k]ip? [k] '
        : entry.grant && item
          ? '[a]llow once, [d]eny, or s[k]ip? [k] '
          : '[d]eny or s[k]ip? [k] ';
      const choice = (await askLine(prompt)).trim().toLowerCase();

      if ((choice === 'o' || choice === 'a' || choice === 'allow' || choice === 'once') && entry.grant && item?.value) {
        const value = extractAgentField(item.value, req.field);
        if (value === null) {
          say(`  Item "${itemLabel}" has no field "${req.field}"; skipped.`);
          continue;
        }
        const result = await approveMachineUse(
          api,
          trusted,
          productKey,
          entry,
          { kind: 'once', value },
          {
            deviceId: storedAccount.deviceId,
            remember: (cp: AgentCheckpoint) => {
              storedAgents = { ...storedAgents, checkpoint: cp };
              account.saveAgentsState(storedAgents);
            },
          },
          { now: now() },
        );
        trusted = await openAgents(api, productKey, result.checkpoint);
        storedAgents = toStoredAgentsState(trusted, storedAgents, { known });
        account.saveAgentsState(storedAgents);
        say(`  Approved once for "${entry.machineName}".`);
        answered++;
      } else if ((choice === 's' || choice === 'session') && canSession && item) {
        const result = await approveMachineUse(
          api,
          trusted,
          productKey,
          entry,
          { kind: 'session', item },
          {
            deviceId: storedAccount.deviceId,
            remember: (cp: AgentCheckpoint) => {
              storedAgents = { ...storedAgents, checkpoint: cp };
              account.saveAgentsState(storedAgents);
            },
          },
          { now: now() },
        );
        trusted = await openAgents(api, productKey, result.checkpoint);
        storedAgents = toStoredAgentsState(trusted, storedAgents, { known });
        account.saveAgentsState(storedAgents);
        say(`  Approved for session (${entry.grant!.session}s) for "${entry.machineName}".`);
        answered++;
      } else if (choice === 'd' || choice === 'deny') {
        const result = await denyMachineUse(api, trusted, productKey, entry, storedAccount.deviceId, now());
        say(
          result.status === 'paused'
            ? `  Denied. Machine "${entry.machineName}" was paused after 3 denials.`
            : `  Denied request from "${entry.machineName}".`,
        );
        answered++;
      } else {
        say('  Skipped.');
      }
      continue;
    }

    // Access request (`kind === 'access'`)
    say(`  Access request for: "${req.what}"`);
    if (req.reason) say(`  Agent reason (untrusted): "${req.reason}"`);
    const pin = trusted.pins.get(entry.machineId);
    const prompt = '[d]eny, [a]pprove with an existing grant (<vault>:<item>), or s[k]ip? [k] ';
    const answer = (await askLine(prompt)).trim();
    const lower = answer.toLowerCase();
    if (lower === 'd' || lower === 'deny') {
      const result = await denyMachineUse(api, trusted, productKey, entry, storedAccount.deviceId, now());
      say(
        result.status === 'paused'
          ? `  Denied. Machine "${entry.machineName}" was paused after 3 denials.`
          : `  Denied access request from "${entry.machineName}".`,
      );
      answered++;
    } else if (lower === 'a' || lower === 'approve' || answer.includes(':')) {
      const target = answer.includes(':') ? answer : (await askLine('Granted vault:item id: ')).trim();
      const [vaultId, itemId] = target.split(':');
      const hasGrant = pin?.grants.some((g) => g.vault === vaultId && g.item === itemId);
      if (!vaultId || !itemId || !hasGrant) {
        say('  Machine does not hold that grant yet. Grant the item with `passhold machine grant` first; skipped.');
        continue;
      }
      await approveMachineAccess(api, trusted, productKey, entry, { vault: vaultId, item: itemId }, storedAccount.deviceId, now());
      say(`  Approved access request for "${entry.machineName}".`);
      answered++;
    } else {
      say('  Skipped.');
    }
  }

  say(`Reviewed ${queue.length} request${queue.length === 1 ? '' : 's'} (${answered} answered).`);
  return 0;
}

export type { ReviewedMachineRequest };
