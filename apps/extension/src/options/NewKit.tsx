import { useState, type FormEvent } from 'react';
import { useT } from '../i18n/react.js';
import { BackgroundError, send, type SecondStepAnswer } from '../lib/messaging.js';
import { PasswordInput } from '../popup/PasswordInput.js';
import { RecoveryKeyScreen } from '../popup/RecoveryKeyScreen.js';
import { useAction } from '../ui/hooks.js';
import { PassholdMark } from '../ui/icons.js';
import { Button, Callout } from '../ui/primitives.js';
import { SecondStepForm } from './SecondStep.js';

/**
 * A new recovery key for the account, in the order that leaves no account
 * with a sheet its owner never kept: the key drawn and shown — not yet in
 * use — then saved every way and typed back, and only then set, with the
 * account password. Until that last step the old key still works; let go
 * before it, nothing changed.
 */
export function NewKitScreens({ recoveryKey, onDone, onPrint }: { recoveryKey: string; onDone: () => void; onPrint: () => void }) {
  const [saved, setSaved] = useState(false);
  if (!saved) {
    return (
      <RecoveryKeyScreen
        recoveryKey={recoveryKey}
        kind="account"
        lead={'accountKit.draftBody'}
        framed
        onPrint={onPrint}
        markSaved={async () => undefined}
        onDone={() => setSaved(true)}
      />
    );
  }
  return <SetKit onDone={onDone} />;
}

function SetKit({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [password, setPassword] = useState('');
  // On an account with a second step, the password is not proof enough: the code goes with it.
  const [step, setStep] = useState(false);
  const { busy, error, run } = useAction();
  const set = async (secondStep?: SecondStepAnswer) => {
    try {
      await send({ type: 'account/newKit', password, ...(secondStep ? { secondStep } : {}) });
    } catch (refusal) {
      if (!secondStep && refusal instanceof BackgroundError && refusal.key === 'error.secondStepNeeded') return setStep(true);
      throw refusal;
    }
    onDone();
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!password || busy) return;
    void run(() => set());
  };
  const cancel = () =>
    void run(async () => {
      await send({ type: 'account/dropKitDraft' });
      onDone();
    });
  if (step) {
    return (
      <div className="flex flex-col gap-4 p-5">
        <PassholdMark size={40} />
        <SecondStepForm passkeys={false} owner onAnswer={set} onCancel={cancel} />
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-4 p-5" data-testid="set-kit">
      <PassholdMark size={40} />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-lg font-semibold">{t('accountKit.setTitle')}</h1>
        <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('accountKit.setBody')}</p>
      </div>
      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        {t('account.password')}
        <PasswordInput autoFocus value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      {error && <Callout tone="danger">{error}</Callout>}
      <div className="flex flex-col gap-2">
        <Button type="submit" variant="primary" className="w-full" disabled={!password || busy}>
          {t('accountKit.set')}
        </Button>
        <Button variant="ghost" className="w-full" disabled={busy} onClick={cancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}
