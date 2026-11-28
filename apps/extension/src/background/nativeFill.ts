/**
 * Optional Native Messaging bridge for `passhold mcp` (`fill_login`).
 *
 * Connects to `com.keyrook.passhold.mcp` ONLY when the owner explicitly enabled
 * browser fill in Settings → Agents AND granted the optional `nativeMessaging`
 * permission. Every incoming fill request is verified against the active tab's
 * Chrome-stamped top-frame URL (never trusting page script and requiring no
 * `tabs` permission) and refuses Keyrook's own account/vault pages and any
 * domain mismatch. Passwords are never echoed back to the native host.
 */
import { isIpHostname, isLoopbackHostname, siteOf } from '@passhold/core';

export const NATIVE_HOST_NAME = 'com.keyrook.passhold.mcp';
export const BROWSER_FILL_PREF_KEY = 'passhold.agentBrowserFill';

export interface AgentBrowserFillStatus {
  enabled: boolean;
  permission: boolean;
  connected: boolean;
}

export interface NativeFillIncoming {
  id: string;
  type: 'fill_login';
  url: string;
  username: string;
  password: string;
  title?: string;
}

/**
 * Pure domain/origin guard deciding whether the active tab (`tabUrl`) may
 * receive credentials requested for `requestedUrl`.
 */
export function fillUrlAllowed(
  tabUrl: string,
  requestedUrl: string,
  blockedOrigins: readonly string[] = [],
): { ok: true; origin: string } | { ok: false; error: string } {
  let tabParsed: URL;
  let reqParsed: URL;
  try {
    tabParsed = new URL(tabUrl);
    reqParsed = new URL(requestedUrl);
  } catch {
    return { ok: false, error: 'Active tab URL or requested URL is invalid.' };
  }

  const tabHost = tabParsed.hostname.toLowerCase();
  const reqHost = reqParsed.hostname.toLowerCase();
  if (tabParsed.protocol !== 'https:' && !(tabParsed.protocol === 'http:' && isLoopbackHostname(tabHost))) {
    return { ok: false, error: 'Refusing to fill credentials on a non-HTTPS page.' };
  }
  if (reqParsed.protocol !== 'https:' && !(reqParsed.protocol === 'http:' && isLoopbackHostname(reqHost))) {
    return { ok: false, error: 'Refusing non-HTTPS fill target.' };
  }

  const blocked = new Set(blockedOrigins.map((origin) => origin.toLowerCase()));
  if (blocked.has(tabParsed.origin.toLowerCase())) {
    return { ok: false, error: 'Refusing to fill credentials on a protected Keyrook page.' };
  }

  const tabSite = siteOf(tabUrl);
  const reqSite = siteOf(requestedUrl);
  if (!tabSite || !reqSite) {
    return { ok: false, error: 'Refusing to fill on an unsupported page origin.' };
  }

  // Require exact origin match for IP, loopback, or hosts without a registrable domain (e.g. `.test`).
  if (
    !tabSite.domain ||
    !reqSite.domain ||
    isLoopbackHostname(tabHost) ||
    isLoopbackHostname(reqHost) ||
    isIpHostname(tabHost) ||
    isIpHostname(reqHost)
  ) {
    if (tabSite.origin !== reqSite.origin) {
      return { ok: false, error: `Active tab (${tabParsed.host}) does not match requested host (${reqParsed.host}).` };
    }
    return { ok: true, origin: tabSite.origin };
  }

  if (tabSite.domain !== reqSite.domain) {
    return { ok: false, error: `Active tab (${tabSite.host}) does not match requested site (${reqSite.host}).` };
  }
  return { ok: true, origin: tabSite.origin };
}

export interface NativeFillDeps {
  blockedOrigins: () => readonly string[];
  inspectActiveTab: () => Promise<{ tabId: number; url: string; documentId: string } | null>;
  deliver: (tabId: number, documentId: string, payload: { origin: string; username: string; password: string }) => Promise<void>;
}

export interface NativeFillController {
  init(): Promise<void>;
  isEnabled(): Promise<boolean>;
  status(): Promise<AgentBrowserFillStatus>;
  setEnabled(enabled: boolean): Promise<AgentBrowserFillStatus>;
}

async function hasNativePermission(): Promise<boolean> {
  if (!chrome.permissions?.contains) return false;
  return chrome.permissions.contains({ permissions: ['nativeMessaging'] }).catch(() => false);
}

async function readEnabledPref(): Promise<boolean> {
  const stored = await chrome.storage.local.get(BROWSER_FILL_PREF_KEY).catch(() => ({} as Record<string, unknown>));
  return stored[BROWSER_FILL_PREF_KEY] === true;
}

async function writeEnabledPref(enabled: boolean): Promise<void> {
  await chrome.storage.local.set({ [BROWSER_FILL_PREF_KEY]: enabled });
}

/** Manages the background worker's optional Native Messaging connection. */
export function createNativeFillController(deps: NativeFillDeps): NativeFillController {
  let port: chrome.runtime.Port | null = null;
  let connected = false;

  const disconnect = () => {
    if (port) {
      try {
        port.disconnect();
      } catch {
        // Already closed.
      }
      port = null;
    }
    connected = false;
  };

  const handleIncoming = async (activePort: chrome.runtime.Port, raw: unknown) => {
    if (!raw || typeof raw !== 'object') return;
    const msg = raw as Record<string, unknown>;
    if (msg.type === 'ready' || msg.type === 'pong') {
      connected = true;
      return;
    }
    if (msg.type !== 'fill_login' || typeof msg.id !== 'string') return;
    const reply = (payload: { id: string; ok: boolean; filled?: boolean; error?: string }) => {
      try {
        activePort.postMessage(payload);
      } catch {
        // Port closed while filling.
      }
    };
    if (typeof msg.url !== 'string' || typeof msg.password !== 'string') {
      reply({ id: msg.id, ok: false, error: 'Malformed fill_login message.' });
      return;
    }
    const active = await deps.inspectActiveTab().catch(() => null);
    if (!active) {
      reply({ id: msg.id, ok: false, error: 'No active web page tab is ready for filling.' });
      return;
    }
    const check = fillUrlAllowed(active.url, msg.url, deps.blockedOrigins());
    if (!check.ok) {
      reply({ id: msg.id, ok: false, error: check.error });
      return;
    }
    try {
      await deps.deliver(active.tabId, active.documentId, {
        origin: check.origin,
        username: typeof msg.username === 'string' ? msg.username : '',
        password: msg.password,
      });
      reply({ id: msg.id, ok: true, filled: true });
    } catch {
      reply({ id: msg.id, ok: false, error: 'No sign-in fields found on the active tab.' });
    }
  };

  const connect = async (): Promise<void> => {
    if (port) return;
    if (!(await hasNativePermission())) return;
    if (!chrome.runtime?.connectNative) return;
    try {
      const next = chrome.runtime.connectNative(NATIVE_HOST_NAME);
      port = next;
      connected = false;
      next.onMessage.addListener((message: unknown) => {
        void handleIncoming(next, message);
      });
      next.onDisconnect.addListener(() => {
        // Read lastError so Chrome does not log an unchecked warning when the host is not yet installed.
        void chrome.runtime.lastError;
        if (port === next) {
          port = null;
          connected = false;
        }
      });
      next.postMessage({ type: 'ping' });
    } catch {
      port = null;
      connected = false;
    }
  };

  return {
    async init() {
      if ((await readEnabledPref()) && (await hasNativePermission())) {
        await connect();
      }
    },

    isEnabled() {
      return readEnabledPref();
    },

    async status() {
      const [enabled, permission] = await Promise.all([readEnabledPref(), hasNativePermission()]);
      if (enabled && permission && !port) {
        await connect();
        await new Promise((r) => setTimeout(r, 80));
      } else if ((!enabled || !permission) && port) {
        disconnect();
      }
      return { enabled, permission, connected };
    },

    async setEnabled(enabled: boolean) {
      await writeEnabledPref(enabled);
      const permission = await hasNativePermission();
      if (enabled && permission) {
        disconnect();
        await connect();
        await new Promise((r) => setTimeout(r, 120));
      } else {
        disconnect();
      }
      return { enabled, permission, connected };
    },
  };
}
