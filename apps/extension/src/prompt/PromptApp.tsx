import { useEffect, useLayoutEffect, useState } from 'react';
import { useT } from '../i18n/react.js';
import { send, type PendingView, type PromptOutcome } from '../lib/messaging.js';
import { useAction } from '../ui/hooks.js';
import { CheckIcon, CloseIcon, HistoryIcon, PassholdMark } from '../ui/icons.js';
import { Button } from '../ui/primitives.js';
import { pendingWords } from '../ui/pending.js';
import { useVisible } from '../ui/useVisible.js';

/**
 * "Save login to Passhold?" in the corner of the page, after a sign-in went
 * through — or "Save card to Passhold?" after a checkout. It shows the
 * username and the site, or the card by its last digits, never a password, a
 * card's number or its code. A new password for a login already saved says
 * so, and which login, in words of its own: an update is never worded as a
 * save, nor a save as an update.
 */
export function PromptApp({ token }: { token: string }) {
  const t = useT();
  const [view, setView] = useState<PendingView | null | undefined>(undefined);
  const [outcome, setOutcome] = useState<PromptOutcome | null>(null);
  const { error, run } = useAction();
  const { ref, visible, act } = useVisible<HTMLDivElement>(view);

  useEffect(() => {
    void run(async () => {
      const found = await send({ type: 'prompt/view', token });
      setView(found);
      // Already saved, or a site its owner said never to save on: nothing to ask.
      if (!found) await send({ type: 'prompt/answer', token, answer: 'dismiss' });
    });
  }, [run, token]);

  // The frame is as tall as the card, so it covers no more of the page than it
  // shows. The card is drawn at the frame's foot, so it stays put as the frame
  // shrinks to it.
  useLayoutEffect(() => {
    const card = ref.current;
    if (!card || !view) return;
    const report = () => void send({ type: 'prompt/size', token, height: Math.ceil(card.getBoundingClientRect().height) + 8 }).catch(() => undefined);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(card);
    return () => observer.disconnect();
  }, [ref, token, view]);

  const answer = (choice: 'save' | 'never' | 'dismiss') =>
    void run(async () => setOutcome((await send({ type: 'prompt/answer', token, answer: choice })).outcome));

  if (!view) return <div ref={ref} className="absolute bottom-2 left-0" />;
  const words = pendingWords(view, t, 'prompt');
  const saved = outcome === 'saved';

  return (
    <div
      ref={ref}
      className="absolute bottom-2 left-0 flex w-[calc(100vw-6px)] flex-col gap-2.5 overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 text-neutral-900 shadow-floating dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
    >
      <div className="flex items-start gap-2.5">
        {saved ? (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300">
            <CheckIcon className="h-4 w-4" />
          </span>
        ) : (
          <PassholdMark size={24} />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-[14px] font-semibold leading-snug">{saved ? words.done : words.title}</p>
          <p className="truncate text-[13px] text-neutral-600 dark:text-neutral-400" data-testid="prompt-body" title={words.body}>
            {words.body}
          </p>
        </div>
        <Button size="sm" variant="ghost" className="-me-1 -mt-1" aria-label={t('common.close')} title={t('common.close')} onClick={() => answer('dismiss')}>
          <CloseIcon className="h-4 w-4" />
        </Button>
      </div>

      {words.note && !saved && (
        <p className="flex items-start gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-2 text-[12.5px] leading-snug text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" data-testid="prompt-note">
          <HistoryIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{words.note}</span>
        </p>
      )}

      {saved ? null : outcome === 'locked' ? (
        <p className="text-[13px] leading-snug text-neutral-700 dark:text-neutral-300">{t('prompt.locked')}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="primary" {...act(() => answer('save'))}>
            {words.save}
          </Button>
          <Button size="sm" variant="ghost" {...act(() => answer(words.never ? 'never' : 'dismiss'))}>
            {words.never ? t('prompt.never') : t('common.notNow')}
          </Button>
        </div>
      )}
      {error && <p className="text-[12px] text-red-600 dark:text-red-300">{error}</p>}
      {!visible && <p className="text-[12px] text-red-600 dark:text-red-300">{t('menu.hidden')}</p>}
    </div>
  );
}
