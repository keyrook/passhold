import type { ReactNode } from 'react';
import type { Values } from '../../extension/src/i18n/format.js';
import { useT } from '../../extension/src/i18n/react.js';
import { BackgroundError } from '../../extension/src/lib/messaging.js';
import { Brand } from '../../extension/src/popup/Header.js';
import { webSays } from './words.js';

/** A refusal in words: the web vault's own, or the extension's for the rest. */
export function useSay(): (error: unknown) => string {
  const t = useT();
  return (error) => {
    if (error instanceof BackgroundError && error.key) return webSays(error.key) ?? t(error.key, error.values as Values | undefined);
    return t('error.unknown', { detail: error instanceof Error ? error.message : String(error) });
  };
}

/** A screen before the vault opens: the brand, then one card, centred, within the screen's safe areas. */
export function Card({ children }: { children: ReactNode }) {
  return (
    <main className="safe">
      <div className="flex min-h-dvh flex-col items-center px-4 py-8 min-[600px]:justify-center">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Brand />
          <div className="flex flex-col gap-4">{children}</div>
        </div>
      </div>
    </main>
  );
}

/** A line between two ways in. */
export function Or({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 text-[12px] text-neutral-600 dark:text-neutral-400" role="separator">
      <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      {children}
      <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}
