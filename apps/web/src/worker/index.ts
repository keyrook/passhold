/**
 * The worker's entry: one `WebVault` for this worker's life, which the page
 * ends at every lock. It answers only the page that started it — a worker
 * hears no one else — and reaches only the account's server.
 */
import { namedClient } from '@keyrook/account';
import type { ToWorker } from '../protocol.js';
import { WebVault } from './engine.js';
import { webDeviceName } from './device.js';

/** The worker's own scope: it hears only the page that started it. */
const scope = self as unknown as { postMessage(message: unknown): void; onmessage: ((event: MessageEvent<ToWorker>) => void) | null };

/** A server that never answers must not hold the vault's queue forever. */
const TIMEOUT = 20_000;

const vault = new WebVault({
  baseUrl: __KEYROOK_API__,
  // Every request names this build; which product a session is, the server takes from the page's origin.
  fetcher: namedClient(
    (input, init) => fetch(input, { ...init, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal: init?.signal ?? AbortSignal.timeout(TIMEOUT) }),
    `passhold-web/${__PASSHOLD_VERSION__}`,
  ),
  deviceName: webDeviceName(navigator.userAgent, (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform),
  emit: (message) => scope.postMessage(message),
});

scope.onmessage = async (event: MessageEvent<ToWorker>) => {
  const { id, request } = event.data ?? {};
  if (typeof id !== 'number' || !request || typeof request !== 'object') return;
  scope.postMessage({ id, envelope: await vault.answer(request) });
};
