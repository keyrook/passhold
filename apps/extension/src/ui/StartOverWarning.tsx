import { useT } from '../i18n/react.js';
import { send, type AccountView } from '../lib/messaging.js';
import { useAction } from './hooks.js';
import { Button, Callout } from './primitives.js';

/**
 * A start over waiting a week. Whoever asked had the code Keyrook emailed, so
 * this browser, still signed in, is where the account's owner says no — the
 * one thing that stops someone who took the inbox. Red, with the day, and the
 * name the asking device gave itself: in quotes, as its own words, since
 * whoever asked chose it.
 */
export function StartOverWarning({ startOver }: { startOver: NonNullable<AccountView['startOver']> }) {
  const t = useT();
  const { busy, error, run } = useAction();
  const date = new Intl.DateTimeFormat(t.locale, { dateStyle: 'long', timeStyle: 'short' }).format(startOver.executesAt);
  // Long enough to recognise one's own device, too short to carry a message of its own.
  const device = startOver.deviceName.length > 48 ? `${startOver.deviceName.slice(0, 47)}…` : startOver.deviceName;
  return (
    <Callout tone="danger">
      <span className="flex flex-col items-start gap-2" data-testid="start-over-waiting">
        <span className="font-medium">{t('startOverWait.title', { date })}</span>
        <span>{device ? t('startOverWait.body', { device }) : t('startOverWait.bodyNoName')}</span>
        {error && <span className="font-medium">{error}</span>}
        <Button size="sm" variant="danger" disabled={busy} onClick={() => void run(() => send({ type: 'account/cancelStartOver' }))}>
          {t('startOverWait.cancel')}
        </Button>
      </span>
    </Callout>
  );
}
