import { useCallback, useEffect, useMemo, useState } from 'react';
import { generatePassword } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { onVaultChanged, send, type MenuView } from '../lib/messaging.js';
import { useAction } from '../ui/hooks.js';
import { KeyIcon, LockIcon, PassholdMark } from '../ui/icons.js';
import { Button, cx } from '../ui/primitives.js';
import { useVisible } from '../ui/useVisible.js';
import { Monogram } from '../popup/VaultScreen.js';

/**
 * The list under a sign-in field. An extension page in a frame: the web page
 * around it cannot read which logins it shows, and a click here goes to the
 * service worker, which fills the frame that opened it — never this page's
 * word for where.
 */
export function MenuApp({ token }: { token: string }) {
  const t = useT();
  const [view, setView] = useState<MenuView | null>(null);
  const [hint, setHint] = useState(false);
  const { error, run } = useAction();
  const { ref, visible } = useVisible<HTMLDivElement>();
  const suggestion = useMemo(() => generatePassword(), []);

  const load = useCallback(() => void run(async () => setView(await send({ type: 'menu/view', token }))), [run, token]);
  useEffect(() => {
    load();
    return onVaultChanged(load);
  }, [load]);

  return (
    <div
      ref={ref}
      className="flex h-[calc(100vh-8px)] w-[calc(100vw-6px)] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-floating dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
    >
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-neutral-200 px-3 dark:border-neutral-800">
        <PassholdMark size={20} />
        <span className="text-[13px] font-semibold">{t('menu.title')}</span>
        {view && <span className="truncate text-[12px] text-neutral-600 dark:text-neutral-400">{view.site}</span>}
      </header>

      <div className="scrollarea flex-1 overflow-y-auto">
        {error && <p className="p-3 text-[13px] text-red-600 dark:text-red-300">{error}</p>}
        {!visible && <p className="px-3 pt-2 text-[12px] text-red-600 dark:text-red-300">{t('menu.hidden')}</p>}

        {view?.state === 'uninitialized' && <p className="p-3 text-[13px]">{t('menu.uninitialized')}</p>}

        {view?.state === 'locked' && (
          <div className="flex flex-col gap-2 p-3">
            <p className="text-[13px]">{t('menu.locked')}</p>
            <Button
              variant="primary"
              size="sm"
              disabled={!visible}
              onClick={() => void run(async () => setHint(!(await send({ type: 'menu/unlock', token })).opened))}
            >
              <LockIcon className="h-4 w-4" /> {t('menu.unlock')}
            </Button>
            {hint && <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{t('menu.unlockHint')}</p>}
          </div>
        )}

        {view?.state === 'ready' && (
          <>
            {view.field === 'new' && (
              <button
                type="button"
                disabled={!visible}
                title={t('menu.suggestBody')}
                onClick={() => void run(() => send({ type: 'menu/suggest', token, password: suggestion }))}
                className="flex h-16 w-full items-center gap-3 border-b border-neutral-200 px-3 text-start hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200">
                  <KeyIcon className="h-[18px] w-[18px]" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[13px] font-medium">{t('menu.suggest')}</span>
                  <span className="font-mono truncate text-[12px] text-neutral-600 dark:text-neutral-400">{suggestion}</span>
                </span>
              </button>
            )}
            {view.logins.length === 0 && view.field !== 'new' && (
              <p className="p-3 text-[13px] text-neutral-600 dark:text-neutral-400">{t('menu.none', { site: view.site })}</p>
            )}
            <ul aria-label={t('menu.fillFor', { site: view.site })}>
              {view.logins.map((login) => (
                <li key={login.id}>
                  <button
                    type="button"
                    disabled={!visible}
                    onClick={() => void run(() => send({ type: 'menu/fill', token, id: login.id }))}
                    className={cx('flex h-[52px] w-full items-center gap-3 px-3 text-start hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800')}
                  >
                    <Monogram title={login.title} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[13px] font-medium">{login.title || login.username}</span>
                      <span className="truncate text-[12px] text-neutral-600 dark:text-neutral-400">{login.username || t('vault.noUsername')}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
