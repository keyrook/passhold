import { useCallback, useEffect, useRef, useState } from 'react';
import { BackgroundError, onVaultChanged, send, type VaultStatus } from '../lib/messaging.js';
import type { Values } from '../i18n/format.js';
import type { MessageKey } from '../i18n/locales/en.js';
import { useT } from '../i18n/react.js';

/** The vault's status, following every change any page or the lock makes. */
export function useVault(): { status: VaultStatus | null; refresh: () => Promise<void> } {
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const refresh = useCallback(async () => setStatus(await send({ type: 'vault/status' })), []);
  useEffect(() => {
    void refresh();
    return onVaultChanged(() => void refresh());
  }, [refresh]);
  return { status, refresh };
}

/** A refusal in the reader's language. */
export function useErrorText(): (error: unknown) => string {
  const t = useT();
  return (error: unknown) => {
    if (error instanceof BackgroundError && error.key) return t(error.key, error.values as Values | undefined);
    return t('error.unknown', { detail: error instanceof Error ? error.message : String(error) });
  };
}

/** Run an action, keeping its busy state and its error for the page to show. */
export function useAction() {
  const errorText = useErrorText();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
      setBusy(true);
      setError(null);
      try {
        return await action();
      } catch (caught) {
        setError(errorText(caught));
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    // errorText follows the language; a stale one only words an error.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return { busy, error, setError, run };
}

/** Copy, tell the service worker (it clears the clipboard later), and say so for a moment. */
export function useCopy(): { copied: string | null; copy: (id: string, text: string) => Promise<void> } {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const copy = useCallback(async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    void send({ type: 'clipboard/copied' }).catch(() => undefined);
    setCopied(id);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1500);
  }, []);
  return { copied, copy };
}

export type { MessageKey };
