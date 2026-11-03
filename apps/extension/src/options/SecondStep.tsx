import { useState, type FormEvent } from 'react';
import { useT } from '../i18n/react.js';
import type { SecondStepAnswer } from '../lib/messaging.js';
import { touchAccountPasskey } from '../ui/accountPasskey.js';
import { useAction } from '../ui/hooks.js';
import { Button, Callout, Field } from '../ui/primitives.js';

/**
 * A second step, on an account that asks for one: one field that takes the
 * code from the authenticator app — or, where the app is lost, the account's
 * recovery key in its place — and, at sign-in where the account has passkeys,
 * one of them instead. Six digits are a code; anything else is read as the
 * recovery key. `owner`: beside the password for a change, where a passkey
 * does not stand in. `next`: the change comes right after a sign-in that took
 * a code, so it waits for the app's next one, and says so.
 */
export function SecondStepForm({
  passkeys,
  owner = false,
  next = false,
  onAnswer,
  onCancel,
}: {
  passkeys: boolean;
  owner?: boolean;
  next?: boolean;
  onAnswer: (answer: SecondStepAnswer) => Promise<void>;
  onCancel: () => void;
}) {
  const t = useT();
  const [typed, setTyped] = useState('');
  const { busy, error, run } = useAction();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!typed.trim() || busy) return;
    const digits = typed.replace(/\s/g, '');
    void run(() => onAnswer(/^\d{6}$/.test(digits) ? { code: digits } : { recoveryKey: typed }));
  };
  const withPasskey = () => void run(async () => onAnswer({ passkey: await touchAccountPasskey('secondStep') }));
  return (
    <form onSubmit={submit} className="flex flex-col gap-3" data-testid="second-step">
      <h2 className="text-[17px] font-semibold">{t('secondStep.title')}</h2>
      <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t(next ? 'secondStep.nextBody' : owner ? 'secondStep.ownerBody' : 'secondStep.body')}</p>
      <Field
        label={t('secondStep.field')}
        autoFocus
        autoComplete="one-time-code"
        spellCheck={false}
        className="font-mono"
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
      />
      {error && <Callout tone="danger">{error}</Callout>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={!typed.trim() || busy}>
          {t('secondStep.continue')}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </div>
      {passkeys && !owner && !next && (
        <button type="button" disabled={busy} onClick={withPasskey} className="self-start text-[13px] text-brand-600 hover:underline dark:text-brand-300">
          {t('secondStep.passkey')}
        </button>
      )}
    </form>
  );
}
