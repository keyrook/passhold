import { useEffect, useState } from 'react';
import { useT } from '../i18n/react.js';
import { send } from '../lib/messaging.js';
import { onEdge } from '../lib/name.js';
import { REVIEW_URLS } from '../lib/rating.js';
import { Button, Callout } from '../ui/primitives.js';

/**
 * The one-time question about a rating (lib/rating.ts), above the list once
 * the vault is open. Everyone asked gets this same question; "Not now" is as
 * easy as "Rate it". "Rate it" is a plain link to the store's page in a new
 * tab, which needs no permission.
 */
export function RatingAsk() {
  const t = useT();
  const [ask, setAsk] = useState(false);
  useEffect(() => {
    void send({ type: 'rating/view' })
      .then((view) => setAsk(view.ask))
      .catch(() => setAsk(false));
  }, []);
  if (!ask) return null;

  const answer = (answer: 'rated' | 'later') => {
    setAsk(false);
    void send({ type: 'rating/answer', answer }).catch(() => undefined);
  };
  return (
    <div className="mx-2 mb-2" data-testid="rating">
      <Callout tone="info">
        <span className="flex flex-col items-start gap-2">
          <span className="font-medium">{t('rating.title')}</span>
          <span>{t('rating.body')}</span>
          <span className="flex flex-wrap items-start gap-2">
            <a
              href={onEdge() ? REVIEW_URLS.edge : REVIEW_URLS.chrome}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => answer('rated')}
              className="kr-press inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-600 px-2.5 text-[13px] font-medium text-white select-none hover:bg-brand-500 active:bg-brand-700"
            >
              {t('rating.rate')}
            </a>
            <Button size="sm" variant="ghost" onClick={() => answer('later')}>
              {t('rating.later')}
            </Button>
          </span>
        </span>
      </Callout>
    </div>
  );
}
