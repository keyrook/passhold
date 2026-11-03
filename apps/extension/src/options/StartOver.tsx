import { useState, type FormEvent } from 'react';
import { strongEnoughForAccount } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { send } from '../lib/messaging.js';
import { PasswordInput } from '../popup/PasswordInput.js';
import { RecoveryKeyScreen } from '../popup/RecoveryKeyScreen.js';
import { useAction } from '../ui/hooks.js';
import { PassholdMark } from '../ui/icons.js';
import { Button, Callout, Field } from '../ui/primitives.js';
import { Strength } from '../ui/Strength.js';

/** A start over asked for: the account's new recovery key, and the day it takes effect (null: done at once). */
export interface StartedOver {
  recoveryKey: string;
  email: string;
  method: 'password' | 'provider';
  executesAt: number | null;
}

/**
 * The account started over, with nothing left but its email: a code to the
 * inbox, then new keys — and, on a password account, a new password — which
 * Keyrook carries out a week later, unless a browser still signed in says no.
 * What it held is kept, still sealed, for 90 days, and the old password or the
 * old recovery key brings it back.
 */
export function StartOver({
  email: initial,
  fixed,
  method,
  onDone,
  onBack,
}: {
  email: string;
  fixed: boolean;
  /** How the account signs in, known from where the person came: the code is spent once, so everything is asked first. */
  method: 'password' | 'provider';
  onDone: (done: StartedOver) => void;
  onBack: () => void;
}) {
  const t = useT();
  const [email, setEmail] = useState(initial);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const { busy, error, setError, run } = useAction();
  const strong = strongEnoughForAccount(password);
  const codeReady = /^\d{6}$/.test(code) && !busy;
  const ready = codeReady && (method === 'provider' || (strong && password === again));

  const sendCode = (event: FormEvent) => {
    event.preventDefault();
    if (!email || busy) return;
    void run(async () => {
      await send({ type: 'account/startOverCode', email });
      setSent(true);
    });
  };

  const finish = () =>
    void run(async () => {
      const typed = method === 'password' ? password : undefined;
      const done = await send({ type: 'account/startOver', email, code, ...(typed ? { password: typed } : {}) });
      setPassword('');
      setAgain('');
      onDone(done);
    });

  return (
    <div className="flex flex-col gap-3" data-testid="start-over">
      <h2 className="text-[15px] font-semibold">{t('startOver.title')}</h2>
      <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('startOver.body')}</p>
      {!sent ? (
        <form onSubmit={sendCode} className="flex flex-col gap-3">
          <Field label={t('account.email')} type="email" autoComplete="off" value={email} readOnly={fixed} onChange={(event) => setEmail(event.target.value)} />
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary" disabled={!email || busy}>
              {t('account.sendCode')}
            </Button>
            <Button variant="ghost" disabled={busy} onClick={onBack}>
              {t('common.back')}
            </Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (ready) finish();
          }}
          className="flex flex-col gap-3"
        >
          <Callout tone="info">{t('account.codeSent', { email })}</Callout>
          <Field
            label={t('account.code')}
            inputMode="numeric"
            autoComplete="one-time-code"
            // An email shows the code as "482 913": a paste of it whole keeps its last digit, and the space is dropped below.
            maxLength={7}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          {method === 'password' && (
            <>
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                {t('account.recoverPassword')}
                <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
              <Strength password={password} />
              {password && !strong && <p className="text-[12px] text-red-600 dark:text-red-300">{t('error.accountPasswordWeak')}</p>}
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                {t('settings.confirm')}
                <PasswordInput value={again} onChange={(event) => setAgain(event.target.value)} error={Boolean(again) && again !== password} />
              </label>
              {again && again !== password && <p className="text-[12px] text-red-600 dark:text-red-300">{t('setup.mismatch')}</p>}
            </>
          )}
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="danger" disabled={!ready}>
              {busy ? t('startOver.working') : t('startOver.button')}
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setError(null);
                setCode('');
                setSent(false);
              }}
            >
              {t('common.back')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

/**
 * After asking: the new recovery key first — shown only now, and the one that
 * works once the account has started over — then the day it does, and how to
 * sign in from then. Nothing is kept here: there is no session to keep it
 * with until that day, and the key is kept as any made elsewhere is, on the
 * sheet its owner saved.
 */
export function StartedOverScreens({ done, onDone, onPrint }: { done: StartedOver; onDone: () => void; onPrint: () => void }) {
  const [saved, setSaved] = useState(false);
  if (!saved) {
    return (
      <RecoveryKeyScreen
        recoveryKey={done.recoveryKey}
        kind={done.method === 'provider' ? 'accountNoPassword' : 'account'}
        lead={'startOver.kitBody'}
        framed
        onPrint={onPrint}
        markSaved={async () => undefined}
        onDone={() => setSaved(true)}
      />
    );
  }
  return <StartOverDay done={done} onDone={onDone} />;
}

function StartOverDay({ done, onDone }: { done: StartedOver; onDone: () => void }) {
  const t = useT();
  const provider = done.method === 'provider';
  const date = done.executesAt !== null ? new Intl.DateTimeFormat(t.locale, { dateStyle: 'full', timeStyle: 'short' }).format(done.executesAt) : '';
  return (
    <div className="flex flex-col gap-4 p-5" data-testid="start-over-day">
      <PassholdMark size={40} />
      {done.executesAt !== null ? (
        <div className="flex flex-col gap-1.5">
          <h1 className="text-lg font-semibold">{t('startOver.waitTitle', { date })}</h1>
          <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('startOver.waitBody', { email: done.email })}</p>
          <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t(provider ? 'startOver.waitThenProvider' : 'startOver.waitThen')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <h1 className="text-lg font-semibold">{t('startOver.doneTitle')}</h1>
          <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t(provider ? 'startOver.doneBodyProvider' : 'startOver.doneBody')}</p>
        </div>
      )}
      <Button variant="primary" className="w-full" onClick={onDone}>
        {done.executesAt !== null ? t('startOver.understood') : t('account.backToSignIn')}
      </Button>
    </div>
  );
}
