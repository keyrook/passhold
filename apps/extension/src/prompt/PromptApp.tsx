import { useEffect, useState } from 'react';
import { useT } from '../i18n/react.js';
import { send, type PendingView, type PromptOutcome } from '../lib/messaging.js';
import { useAction } from '../ui/hooks.js';
import { CheckIcon, CloseIcon, PassholdMark } from '../ui/icons.js';
import { Button } from '../ui/primitives.js';
import { useVisible } from '../ui/useVisible.js';

/**
 * "Save login to Passhold?" in the corner of the page, after a sign-in was
 * sent. It shows the username and the site, never the password.
 */
export function PromptApp({ token }: { token: string }) {
  const t = useT();
  const [view, setView] = useState<PendingView | null | undefined>(undefined);
  const [outcome, setOutcome] = useState<PromptOutcome | null>(null);
  const { error, run } = useAction();
  const { ref, visible } = useVisible<HTMLDivElement>();

  useEffect(() => {
    void run(async () => {
      const found = await send({ type: 'prompt/view', token });
      setView(found);
      // Already saved, or a site its owner said never to save on: nothing to ask.
      if (!found) await send({ type: 'prompt/answer', token, answer: 'dismiss' });
    });
  }, [run, token]);

  const answer = (choice: 'save' | 'never' | 'dismiss') =>
    void run(async () => setOutcome((await send({ type: 'prompt/answer', token, answer: choice })).outcome));

  if (!view) return <div ref={ref} className="h-screen" />;

  return (
    <div
      ref={ref}
      className="flex h-[calc(100vh-8px)] w-[calc(100vw-6px)] flex-col gap-2 overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 text-neutral-900 shadow-floating dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
    >
      <div className="flex items-start gap-2">
        <PassholdMark size={24} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-[14px] font-semibold">
            {outcome === 'saved'
              ? t('prompt.saved')
              : view.kind === 'update'
                ? t('prompt.update')
                : view.kind === null
                  ? t('pending.lockedTitle')
                  : t('prompt.save')}
          </p>
          <p className="truncate text-[13px] text-neutral-600 dark:text-neutral-400">
            {view.username ? t('pending.body', { username: view.username, site: view.site }) : t('pending.bodyNoUser', { site: view.site })}
          </p>
        </div>
        <Button size="sm" variant="ghost" aria-label={t('common.close')} title={t('common.close')} onClick={() => answer('dismiss')}>
          <CloseIcon className="h-4 w-4" />
        </Button>
      </div>

      {outcome === 'saved' ? (
        <div className="flex items-center gap-2 text-[13px] text-green-700 dark:text-green-300">
          <CheckIcon className="h-4 w-4" />
        </div>
      ) : outcome === 'locked' ? (
        <p className="text-[13px] leading-snug text-neutral-700 dark:text-neutral-300">{t('prompt.locked')}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="primary" disabled={!visible} onClick={() => answer('save')}>
            {view.kind === 'update' ? t('prompt.updateButton') : t('prompt.saveButton')}
          </Button>
          <Button size="sm" variant="ghost" disabled={!visible} onClick={() => answer('never')}>
            {t('prompt.never')}
          </Button>
        </div>
      )}
      {error && <p className="text-[12px] text-red-600 dark:text-red-300">{error}</p>}
      {!visible && <p className="text-[12px] text-red-600 dark:text-red-300">{t('menu.hidden')}</p>}
    </div>
  );
}
