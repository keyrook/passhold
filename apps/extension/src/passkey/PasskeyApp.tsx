import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useT } from '../i18n/react.js';
import { onVaultChanged, send, type PasskeyAnswer, type PasskeyView } from '../lib/messaging.js';
import { useAction } from '../ui/hooks.js';
import { CloseIcon, FingerprintIcon, LockIcon, PassholdMark, UsersIcon } from '../ui/icons.js';
import { Button } from '../ui/primitives.js';
import { SiteMark } from '../ui/SiteMark.js';
import { useVisible } from '../ui/useVisible.js';

/**
 * A website asking for a passkey, in the corner of its page: "Save a passkey
 * for this site?", or which saved passkey to sign in with. An extension page
 * in a frame, as the inline list is: the page cannot read which accounts are
 * offered, and a click here goes to the service worker, which answers the
 * page that asked — never this frame's word for which.
 */
export function PasskeyApp({ token }: { token: string }) {
  const t = useT();
  const [view, setView] = useState<PasskeyView | null>(null);
  const [hint, setHint] = useState(false);
  const { busy, error, run } = useAction();
  const { ref, visible, act } = useVisible<HTMLDivElement>(view);

  const load = useCallback(() => void run(async () => setView(await send({ type: 'passkey/view', token }))), [run, token]);
  useEffect(() => {
    load();
    return onVaultChanged(load);
  }, [load]);

  // The frame is as tall as the card, so it covers no more of the page than it shows.
  useLayoutEffect(() => {
    const card = ref.current;
    if (!card || !view) return;
    const report = () => void send({ type: 'passkey/size', token, height: Math.ceil(card.getBoundingClientRect().height) + 8 }).catch(() => undefined);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(card);
    return () => observer.disconnect();
  }, [ref, token, view]);

  const answer = (choice: PasskeyAnswer, id?: string) => void run(() => send({ type: 'passkey/answer', token, answer: choice, id }));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') answer('cancel');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!view) return <div ref={ref} />;

  const title =
    view.op === 'create'
      ? view.state === 'exists'
        ? t('passkey.existsTitle')
        : t('passkey.saveTitle', { site: view.site })
      : t('passkey.signInTitle', { site: view.site });
  const body =
    view.state === 'locked'
      ? t('menu.locked')
      : view.state === 'uninitialized'
        ? t('menu.uninitialized')
        : view.state === 'none'
          ? t('passkey.none', { site: view.site })
          : view.op === 'create'
            ? view.userName || t('vault.noUsername')
            : t('passkey.signInBody');

  const unlock = (
    <Button variant="primary" size="sm" {...act(() => void run(async () => setHint(!(await send({ type: 'passkey/unlock', token })).opened)))}>
      <LockIcon className="h-4 w-4" /> {t('menu.unlock')}
    </Button>
  );
  const other = (
    <Button size="sm" variant="ghost" {...act(() => answer('other'), busy)}>
      {view.op === 'create' ? t('passkey.saveElsewhere') : t('passkey.useElsewhere')}
    </Button>
  );

  return (
    <div
      ref={ref}
      className="flex w-[calc(100vw-6px)] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-floating dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
    >
      <div className="flex items-start gap-2 p-3">
        <PassholdMark size={24} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-[14px] font-semibold">{title}</p>
          <p className="truncate text-[13px] text-neutral-600 dark:text-neutral-400" data-testid="passkey-body">
            {body}
          </p>
        </div>
        <Button size="sm" variant="ghost" aria-label={t('common.close')} title={t('common.close')} onClick={() => answer('cancel')}>
          <CloseIcon className="h-4 w-4" />
        </Button>
      </div>

      {view.op === 'create' && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-3">
          {view.state === 'locked' ? (
            unlock
          ) : view.state === 'exists' ? (
            <Button size="sm" variant="primary" {...act(() => answer('save'), busy)}>
              {t('passkey.ok')}
            </Button>
          ) : view.state === 'ready' ? (
            <Button size="sm" variant="primary" {...act(() => answer('save'), busy)}>
              <FingerprintIcon className="h-4 w-4" /> {t('passkey.save')}
            </Button>
          ) : null}
          {view.state !== 'exists' && other}
        </div>
      )}

      {view.op === 'get' && (
        <>
          {view.state === 'locked' && <div className="px-3 pb-3">{unlock}</div>}
          {view.state === 'ready' && (
            <ul aria-label={t('passkey.signInTitle', { site: view.site })} className="scrollarea max-h-[156px] overflow-y-auto border-t border-neutral-200 dark:border-neutral-800">
              {view.accounts.map((account) => (
                <li key={account.id}>
                  <button
                    type="button"
                    {...act(() => answer('use', account.id), busy)}
                    className="flex h-[52px] w-full items-center gap-3 px-3 text-start hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
                  >
                    <SiteMark title={account.title} urls={[view.site]} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[13px] font-medium">{account.username || account.title}</span>
                      <span className="truncate text-[12px] text-neutral-600 dark:text-neutral-400">{account.title}</span>
                    </span>
                    {account.vault && (
                      <span className="flex max-w-[7.5rem] shrink-0 items-center gap-1 text-[11.5px] text-neutral-600 dark:text-neutral-400" title={account.vault}>
                        <UsersIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{account.vault}</span>
                      </span>
                    )}
                    <FingerprintIcon className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end border-t border-neutral-200 px-2 py-1.5 dark:border-neutral-800">{other}</div>
        </>
      )}

      {(hint || error || !visible) && (
        <div className="flex flex-col gap-1 px-3 pb-3">
          {hint && <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{t('menu.unlockHint')}</p>}
          {error && <p className="text-[12px] text-red-600 dark:text-red-300">{error}</p>}
          {!visible && <p className="text-[12px] text-red-600 dark:text-red-300">{t('passkey.hidden')}</p>}
        </div>
      )}
    </div>
  );
}
