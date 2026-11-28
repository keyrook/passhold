/**
 * `passhold mcp`: stdio JSON-RPC 2.0 MCP server backed by `MachineRuntime`.
 *
 * Security invariants:
 * - Refuses to start if `PASSHOLD_SESSION` (in any casing) is set in the
 *   environment, so an agent process can never inherit an interactive owner
 *   unlock.
 * - Never writes secrets to logs or errors; stdout carries pure JSON-RPC 2.0
 *   lines and stderr carries diagnostics.
 */
import { createInterface } from 'node:readline';
import { VERSION } from '../account.js';
import type { Context } from '../cli.js';
import { hasPassholdSession, loadMachineIdentity } from '../machine.js';
import { CliError } from '../reference.js';
import type { Store } from '../store.js';
import type { Account } from '../account.js';
import { MachineRuntime } from './runtime.js';

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string };
}

export const MCP_TOOLS = [
  {
    name: 'list_items',
    description: 'List Passhold items granted to this machine (metadata only, never secret values).',
    inputSchema: {
      type: 'object',
      properties: {
        refresh: { type: 'boolean', description: 'Pull fresh grants from Keyrook before listing (default true).' },
      },
    },
  },
  {
    name: 'http_request',
    description:
      'Perform an HTTP(S) request injecting a granted Passhold credential on the allowed host. Never follows redirects, ignores proxy env vars, and redacts secrets from response headers and body.',
    inputSchema: {
      type: 'object',
      required: ['item', 'method', 'url'],
      properties: {
        item: { type: 'string', description: 'Granted item id (`vault:item`), reference (`passhold://vault/item`), or title.' },
        method: { type: 'string', enum: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] },
        url: { type: 'string', description: 'Target HTTPS URL (or loopback HTTP URL) on an allowed host.' },
        headers: { type: 'object', additionalProperties: { type: 'string' } },
        body: { type: 'string' },
        field: { type: 'string', description: 'Optional field name (defaults to key or password).' },
        reason: { type: 'string', description: 'Short explanation shown to the human owner if approval is required.' },
        timeoutMs: { type: 'number' },
      },
    },
  },
  {
    name: 'run_command',
    description:
      'Run a child command (shell: false) with granted Passhold secrets injected via environment variables. Strips Passhold auth variables and redacts secrets from stdout and stderr.',
    inputSchema: {
      type: 'object',
      required: ['argv', 'env'],
      properties: {
        argv: { type: 'array', items: { type: 'string' }, minItems: 1 },
        cwd: { type: 'string' },
        env: { type: 'object', additionalProperties: { type: 'string' }, description: 'Map of env var name to granted item or passhold:// reference.' },
        timeout: { type: 'number', description: 'Timeout in seconds (default 60).' },
        reason: { type: 'string' },
      },
    },
  },
  {
    name: 'reveal',
    description: 'Request one-time human approval to reveal a single secret field value.',
    inputSchema: {
      type: 'object',
      required: ['item', 'reason'],
      properties: {
        item: { type: 'string' },
        field: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  },
  {
    name: 'request_access',
    description: 'Ask the human owner to grant this machine access to an item it does not hold yet.',
    inputSchema: {
      type: 'object',
      required: ['what', 'reason'],
      properties: {
        what: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  },
  {
    name: 'status',
    description: 'Return this machine identity status, expiry, and granted item count.',
    inputSchema: { type: 'object', properties: {} },
  },
] as const;

/** Handles one JSON-RPC 2.0 MCP message against `runtime`. Returns null for notifications. */
export async function handleMcpMessage(runtime: MachineRuntime, msg: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  const id = msg.id ?? null;
  if (msg.method === 'notifications/initialized' || msg.method.startsWith('notifications/')) {
    return null;
  }

  try {
    switch (msg.method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'passhold-mcp', version: VERSION },
          },
        };

      case 'ping':
        return { jsonrpc: '2.0', id, result: {} };

      case 'tools/list':
        return { jsonrpc: '2.0', id, result: { tools: MCP_TOOLS } };

      case 'tools/call': {
        const name = typeof msg.params?.name === 'string' ? msg.params.name : '';
        const args = (msg.params?.arguments ?? {}) as Record<string, unknown>;
        let payload: unknown;
        switch (name) {
          case 'list_items':
            payload = await runtime.listItems(args.refresh !== false);
            break;
          case 'http_request':
            payload = await runtime.httpRequest({
              item: String(args.item ?? ''),
              method: String(args.method ?? 'GET'),
              url: String(args.url ?? ''),
              ...(args.headers && typeof args.headers === 'object' ? { headers: args.headers as Record<string, string> } : {}),
              ...(typeof args.body === 'string' ? { body: args.body } : {}),
              ...(typeof args.field === 'string' ? { field: args.field } : {}),
              ...(typeof args.reason === 'string' ? { reason: args.reason } : {}),
              ...(typeof args.timeoutMs === 'number' ? { timeoutMs: args.timeoutMs } : {}),
            });
            break;
          case 'run_command':
            payload = await runtime.runCommand({
              argv: Array.isArray(args.argv) ? args.argv.map(String) : [],
              ...(typeof args.cwd === 'string' ? { cwd: args.cwd } : {}),
              env: args.env && typeof args.env === 'object' ? (args.env as Record<string, string>) : {},
              ...(typeof args.timeout === 'number' ? { timeout: args.timeout } : {}),
              ...(typeof args.reason === 'string' ? { reason: args.reason } : {}),
            });
            break;
          case 'reveal':
            payload = await runtime.reveal({
              item: String(args.item ?? ''),
              ...(typeof args.field === 'string' ? { field: args.field } : {}),
              reason: String(args.reason ?? ''),
            });
            break;
          case 'request_access':
            payload = await runtime.requestAccess({
              what: String(args.what ?? ''),
              reason: String(args.reason ?? ''),
            });
            break;
          case 'status':
            payload = await runtime.status();
            break;
          default:
            return { jsonrpc: '2.0', id, error: { code: -32601, message: `Unknown tool: ${name}` } };
        }
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(payload) }],
          },
        };
      }

      default:
        return { jsonrpc: '2.0', id, error: { code: -32601, message: `Unknown method: ${msg.method}` } };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (msg.method === 'tools/call') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          isError: true,
          content: [{ type: 'text', text: message }],
        },
      };
    }
    return { jsonrpc: '2.0', id, error: { code: -32000, message } };
  }
}

export async function runMcpServer(
  context: Context,
  deps: { store: Store; account: Account; now: () => number; say: (line: string) => void },
): Promise<number> {
  // Hard security guard: NEVER start MCP if PASSHOLD_SESSION is present in env!
  if (hasPassholdSession(context.env)) {
    throw new CliError('Refusing to start passhold mcp while PASSHOLD_SESSION is set in the environment. Unset PASSHOLD_SESSION first.');
  }

  const loaded = await loadMachineIdentity(deps.store, context.env);
  if (!loaded) {
    throw new CliError('No machine enrolled and PASSHOLD_MACHINE_TOKEN is not set. Run: passhold machine enroll <phi_...>');
  }

  const runtime = new MachineRuntime({
    client: deps.account.machineClient(),
    store: deps.store,
    env: context.env,
    loaded,
    now: deps.now,
  });

  // Initial sync to validate machine status and warm the sealed cache.
  await runtime.sync();

  const processLine = async (rawLine: string) => {
    const trimmed = rawLine.trim();
    if (!trimmed) return;
    let parsed: JsonRpcRequest;
    try {
      parsed = JSON.parse(trimmed) as JsonRpcRequest;
    } catch {
      context.out(`${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } })}\n`);
      return;
    }
    const response = await handleMcpMessage(runtime, parsed);
    if (response) context.out(`${JSON.stringify(response)}\n`);
  };

  // In tests, `context.mcpLines` or `context.input()` provides JSON-RPC lines; in production, read stdin line-by-line.
  if (context.mcpStream) {
    for await (const line of context.mcpStream) {
      await processLine(line);
    }
    await runtime.flushLogs(true).catch(() => undefined);
    return 0;
  }

  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  const flushTimer = setInterval(() => {
    void runtime.flushLogs(false).catch(() => undefined);
  }, 60_000);
  flushTimer.unref?.();

  try {
    for await (const line of rl) {
      if (context.signal?.aborted) break;
      await processLine(line);
    }
  } finally {
    clearInterval(flushTimer);
    rl.close();
    await runtime.flushLogs(true).catch(() => undefined);
  }
  return 0;
}
