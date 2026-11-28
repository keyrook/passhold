/**
 * Direct HTTP/HTTPS executor for agent `http_request` calls.
 *
 * Security invariants:
 * - Uses `node:http` / `node:https` directly with `agent: false`: NEVER reads
 *   `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, or `NO_PROXY`.
 * - NEVER follows redirects (3xx responses are returned as-is; credentials are
 *   never resent to any `Location` target).
 * - Injects credentials strictly according to `MachineDelivery.sendAs`.
 * - Caps response body at 1 MiB and redacts all known secrets from response
 *   headers and body before returning to the agent.
 */
import http from 'node:http';
import https from 'node:https';
import type { MachineDelivery } from '@keyrook/account';
import {
  redactBytes,
  redactHeaders,
  toBase64,
  utf8,
  type NormalizedRequestUrl,
  type SecretEntry,
} from '@passhold/core';

export const MAX_RESPONSE_BYTES = 1024 * 1024;
export const DEFAULT_HTTP_TIMEOUT_MS = 30_000;

export interface DirectHttpRequest {
  method: string;
  normalized: NormalizedRequestUrl;
  headers: readonly [string, string][];
  body: Uint8Array | null;
  delivery: MachineDelivery;
  secretValue: string;
  /** Every secret to redact from response headers and body (always includes `secretValue`). */
  redact: readonly SecretEntry[];
  timeoutMs?: number;
}

export interface DirectHttpResponse {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: string;
  truncated: boolean;
  redirected: boolean;
}

export type HttpTransport = (request: DirectHttpRequest) => Promise<DirectHttpResponse>;

function applyCredential(
  targetUrl: URL,
  headers: Record<string, string>,
  delivery: MachineDelivery,
  secretValue: string,
): void {
  const sendAs = delivery.sendAs;
  if (sendAs === 'bearer') {
    headers['authorization'] = `Bearer ${secretValue}`;
    return;
  }
  if (sendAs === 'basic') {
    const pair = `${delivery.keyId ?? ''}:${secretValue}`;
    headers['authorization'] = `Basic ${toBase64(utf8(pair))}`;
    return;
  }
  if (sendAs.startsWith('header:')) {
    const name = sendAs.slice('header:'.length).toLowerCase();
    headers[name] = secretValue;
    return;
  }
  if (sendAs.startsWith('query:')) {
    const param = sendAs.slice('query:'.length);
    targetUrl.searchParams.set(param, secretValue);
    return;
  }
  headers['authorization'] = `Bearer ${secretValue}`;
}

/** Returns the header name occupied by credential injection (so the caller cannot collide with it). */
export function deliveryHeaderName(delivery: MachineDelivery): string[] {
  if (delivery.sendAs === 'bearer' || delivery.sendAs === 'basic') return ['authorization'];
  if (delivery.sendAs.startsWith('header:')) return [delivery.sendAs.slice('header:'.length).toLowerCase()];
  return [];
}

/**
 * Executes a single direct HTTP(S) request without proxy environment lookup
 * and without redirect following, redacting all secrets from headers & body.
 */
export async function executeDirectHttp(req: DirectHttpRequest): Promise<DirectHttpResponse> {
  const targetUrl = new URL(req.normalized.url);
  const outgoingHeaders: Record<string, string> = {};
  for (const [name, value] of req.headers) outgoingHeaders[name] = value;
  applyCredential(targetUrl, outgoingHeaders, req.delivery, req.secretValue);

  if (req.body !== null && req.body.length > 0) {
    outgoingHeaders['content-length'] = String(req.body.length);
  }
  // Explicitly request uncompressed or standard encoding; disable keep-alive reuse across calls.
  outgoingHeaders['connection'] = 'close';

  const isHttps = targetUrl.protocol === 'https:';
  const mod = isHttps ? https : http;
  const port = targetUrl.port ? Number(targetUrl.port) : isHttps ? 443 : 80;
  const timeoutMs = Math.min(Math.max(1_000, req.timeoutMs ?? DEFAULT_HTTP_TIMEOUT_MS), 120_000);

  return new Promise<DirectHttpResponse>((resolve, reject) => {
    const clientReq = mod.request(
      {
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname.replace(/^\[|\]$/g, ''),
        port,
        path: `${targetUrl.pathname}${targetUrl.search}`,
        method: req.method,
        headers: outgoingHeaders,
        // `agent: false` forces a fresh direct socket with zero proxy agent involvement.
        agent: false,
      },
      (res) => {
        const chunks: Buffer[] = [];
        let total = 0;
        let truncated = false;

        res.on('data', (chunk: Buffer) => {
          if (total >= MAX_RESPONSE_BYTES) {
            truncated = true;
            return;
          }
          const remaining = MAX_RESPONSE_BYTES - total;
          if (chunk.length > remaining) {
            chunks.push(chunk.subarray(0, remaining));
            total += remaining;
            truncated = true;
          } else {
            chunks.push(chunk);
            total += chunk.length;
          }
        });

        res.on('end', () => {
          const rawHeaders: [string, string][] = [];
          for (const [name, val] of Object.entries(res.headers)) {
            if (val === undefined) continue;
            if (Array.isArray(val)) {
              for (const v of val) rawHeaders.push([name, v]);
            } else {
              rawHeaders.push([name, val]);
            }
          }
          const status = res.statusCode ?? 0;
          const bodyBytes = new Uint8Array(Buffer.concat(chunks));
          resolve({
            status,
            statusText: res.statusMessage ?? '',
            headers: redactHeaders(rawHeaders, req.redact),
            body: redactBytes(bodyBytes, req.redact),
            truncated,
            redirected: status >= 300 && status < 400,
          });
        });

        res.on('error', reject);
      },
    );

    clientReq.setTimeout(timeoutMs, () => {
      clientReq.destroy(new Error(`HTTP request timed out after ${Math.round(timeoutMs / 1000)}s.`));
    });
    clientReq.on('error', reject);
    if (req.body !== null && req.body.length > 0) {
      clientReq.write(Buffer.from(req.body));
    }
    clientReq.end();
  });
}
