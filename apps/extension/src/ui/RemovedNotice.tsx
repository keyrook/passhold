import { useT } from '../i18n/react.js';
import { send } from '../lib/messaging.js';
import { useAction } from './hooks.js';
import { Button, Callout } from './primitives.js';

/**
 * This browser was removed from the account, and what the account held was
 * taken off it: said in the popup and the settings until its owner closes
 * it, so a list grown short is never a mystery. Only a proof Passhold's key
 * checked brings it.
 */
export function RemovedNotice({ removedAt }: { removedAt: number }) {
  const t = useT();
  const { busy, error, run } = useAction();
  const date = new Intl.DateTimeFormat(t.locale, { dateStyle: 'long' }).format(removedAt);
  return (
    <Callout tone="warning">
      <span className="flex flex-col items-start gap-2" data-testid="removed">
        <span className="font-medium">{t('removed.title')}</span>
        <span>{t('removed.body', { date })}</span>
        {error && <span className="font-medium">{error}</span>}
        <Button size="sm" disabled={busy} onClick={() => void run(() => send({ type: 'account/closeRemoval' }))}>
          {t('common.close')}
        </Button>
      </span>
    </Callout>
  );
}
