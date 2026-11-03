import { useRef, useState, type FormEvent } from 'react';
import { useT } from '../i18n/react.js';
import { BackgroundError, send, type SecondStepAnswer } from '../lib/messaging.js';
import { PasswordInput } from '../popup/PasswordInput.js';
import { RecoveryKeyScreen } from '../popup/RecoveryKeyScreen.js';
import { SetupScreen } from '../popup/SetupScreen.js';
import { useAction } from '../ui/hooks.js';
import { Button, Callout, Field } from '../ui/primitives.js';
import { Create, NeedsRoot, Recover } from './AccountPanel.js';
import { Choice } from './Section.js';
import { AccountPasskeyButton } from './AccountPasskey.js';
import { SecondStepForm } from './SecondStep.js';
import { BACK_FROM_PROVIDER, Or, ProviderButtons, ProviderFlow, useProviderView } from './ProviderSignIn.js';
import { StartedOverScreens, type StartedOver } from './StartOver.js';

type Stage =
  | { name: 'signIn' }
  /** Back from Google or GitHub. */
  | { name: 'provider' }
  /** An account just made: its recovery key, before anything else. */
  | { name: 'kit'; key: string; email: string; passkey: boolean; password?: string }
  /** A start over asked for: its recovery key and its day. Nothing to sign in to until then. */
  | { name: 'startedOver'; done: StartedOver }
  /**
   * Signed in: how this browser opens. `passkey`: an account with no
   * password, whose passkey this makes. `password`: the account's, just
   * typed, which the vault opens with where there is no fingerprint.
   */
  | { name: 'unlock'; email: string; passkey: boolean; password?: string };

/**
 * Passhold on another computer, the first thing done here: sign in to the
 * Keyrook account — with its password, or with Google or GitHub — then choose
 * how this browser opens, and every login comes down. In the settings tab,
 * not the popup, which closes the moment a person goes to find a password, an
 * email or the other computer.
 */
/** `onOpenedWith`: the password or code this browser's vault is being made with, for a PIN offered next. */
export function JoinAccount({
  canUseDevice,
  onJoined,
  onOpenedWith,
}: {
  canUseDevice: boolean;
  onJoined: () => void;
  onOpenedWith?: (secret: string | null) => void;
}) {
  const t = useT();
  const [view, setView] = useProviderView(BACK_FROM_PROVIDER);
  const [stage, setStage] = useState<Stage>(BACK_FROM_PROVIDER ? { name: 'provider' } : { name: 'signIn' });

  const unlock = (email: string, passkey = false, password?: string) => {
    onJoined();
    setStage({ name: 'unlock', email, passkey, password });
  };
  const signIn = () => {
    setView(null);
    setStage({ name: 'signIn' });
    history.replaceState(null, '', '#signin');
  };

  // A start over asked for: its key and its day, then back to signing in — from that day, with the new password.
  const startedOver = (done: StartedOver) => setStage({ name: 'startedOver', done });

  // Until the worker says what came back from the provider: nothing it could replace.
  if (view === undefined) return <div className="min-h-[420px]" />;

  if (stage.name === 'startedOver') return <StartedOverScreens done={stage.done} onPrint={() => window.print()} onDone={signIn} />;

  if (stage.name === 'kit') {
    return (
      <RecoveryKeyScreen
        recoveryKey={stage.key}
        kind={stage.passkey ? 'accountNoPassword' : 'account'}
        framed
        onPrint={() => window.print()}
        markSaved={() => send({ type: 'account/joinKitSaved' })}
        onDone={() => unlock(stage.email, stage.passkey, stage.password)}
      />
    );
  }

  if (stage.name === 'unlock') {
    return (
      <SetupScreen
        canUseDevice={canUseDevice}
        joined={stage.email}
        passkey={stage.passkey}
        accountPassword={stage.password ?? null}
        onRecoveryKey={() => undefined}
        onJoinCancel={() => {
          void send({ type: 'account/joinCancel' });
          signIn();
        }}
        onOpenedWith={onOpenedWith}
        framed
      />
    );
  }

  if (stage.name === 'provider' && view) {
    const email = 'email' in view ? view.email : '';
    return (
      <div className="flex flex-col gap-4 p-6">
        <ProviderFlow
          view={view}
          onCreated={(key) => setStage({ name: 'kit', key, email, passkey: true })}
          // An account with a password was opened with it: this browser opens with it too. One without makes its passkey here.
          onIn={(_joined, password) => (password === undefined ? unlock(email, true) : unlock(email, false, password))}
          onStartedOver={startedOver}
          onClose={signIn}
          makeVault
          onOpening={onJoined}
          onView={setView}
        />
      </div>
    );
  }

  return (
    <SignInFirst
      onJoined={(email, password) => unlock(email, false, password)}
      // Signed in with the account's passkey: no password typed here, so this browser opens with its own unlock.
      onPasskeyIn={(email) => unlock(email)}
      onCreated={(key, email, password) => (key ? setStage({ name: 'kit', key, email, passkey: false, password }) : unlock(email, false, password))}
      onStartedOver={startedOver}
    />
  );
}

function SignInFirst({
  onJoined,
  onPasskeyIn,
  onCreated,
  onStartedOver,
}: {
  onJoined: (email: string, password: string) => void;
  onPasskeyIn: (email: string) => void;
  onCreated: (recoveryKey: string | null, email: string, password: string) => void;
  onStartedOver: (done: StartedOver) => void;
}) {
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signIn' | 'forgot' | 'create'>('signIn');
  const forgot = mode === 'forgot';
  const setForgot = (on: boolean) => setMode(on ? 'forgot' : 'signIn');
  const { busy, error, run } = useAction();

  const [needsRoot, setNeedsRoot] = useState(false);
  // `next`: the code that making the account's root asks for, after the sign-in's.
  const [step, setStep] = useState<{ passkeys: boolean; next?: boolean } | null>(null);
  // What the sign-in asked for before its second step: a root to be made, with the old sheet or a new one.
  const root = useRef<{ recoveryKey?: string } | undefined>(undefined);
  const go = async (makeRoot?: { recoveryKey?: string }, secondStep?: SecondStepAnswer) => {
    root.current = makeRoot;
    const answer = await send({ type: 'account/join', email, password, ...(makeRoot ? { makeRoot } : {}), ...(secondStep ? { secondStep } : {}) });
    setStep(null);
    const typed = password;
    setPassword('');
    // Given its root just now, under a new recovery key: shown before anything else, as for a new account.
    if (answer.recoveryKey) onCreated(answer.recoveryKey, answer.email, typed);
    else onJoined(answer.email, typed);
  };
  /** A refusal that asks for something more: the account's root to be made, or a second step — the sign-in's, or the root's. */
  const asked = async (refusal: unknown) => {
    if (refusal instanceof BackgroundError && refusal.key === 'error.accountNeedsRoot') {
      setStep(null);
      return setNeedsRoot(true);
    }
    if (refusal instanceof BackgroundError && refusal.key === 'error.secondStepAsked') return setStep((await send({ type: 'account/secondStepView' })) ?? { passkeys: false });
    if (refusal instanceof BackgroundError && refusal.key === 'error.secondStepNeeded' && root.current) {
      setNeedsRoot(false);
      return setStep({ passkeys: false, next: true });
    }
    throw refusal;
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password || busy) return;
    void run(() => go().catch(asked));
  };

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* New here, or back: both in plain sight, not a link at the foot of the card. */}
      {!forgot && !needsRoot && !step && (
        <Choice<'signIn' | 'create'>
          label={t('join.title')}
          value={mode === 'create' ? 'create' : 'signIn'}
          options={[
            { value: 'signIn', label: t('account.haveOne') },
            { value: 'create', label: t('account.create') },
          ]}
          onChange={setMode}
        />
      )}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[19px] font-semibold tracking-[-0.01em]">{mode === 'create' ? t('join.createTitle') : t('join.title')}</h2>
        <p className="text-[13.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">{mode === 'create' ? t('join.createBody') : t('join.body')}</p>
      </div>
      {step ? (
        <SecondStepForm
          passkeys={step.passkeys}
          owner={step.next}
          next={step.next}
          onAnswer={(answer) => go(root.current, answer).catch(asked)}
          onCancel={() => (step.next ? void send({ type: 'account/cancelRoot' }).finally(() => setStep(null)) : setStep(null))}
        />
      ) : needsRoot ? (
        <NeedsRoot submit={(recoveryKey) => go({ ...(recoveryKey ? { recoveryKey } : {}) }).catch(asked)} onCancel={() => setNeedsRoot(false)} />
      ) : mode === 'create' ? (
        <Create onCreated={(key, _joined, address, password) => onCreated(key, address, password)} />
      ) : forgot ? (
        <Recover
          email={email}
          fixed={false}
          bare
          onBack={() => setForgot(false)}
          submit={async (address, code, recoveryKey, next) => onJoined((await send({ type: 'account/recover', email: address, code, recoveryKey, password: next })).email, next)}
          onStartedOver={onStartedOver}
        />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <ProviderButtons />
            <AccountPasskeyButton join onIn={onPasskeyIn} />
          </div>
          <Or />
          <form onSubmit={submit} className="flex flex-col gap-3">
            <Field label={t('account.email')} type="email" autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} />
            <label className="flex flex-col gap-1.5 text-[13px] font-medium">
              {t('account.password')}
              <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error && <Callout tone="danger">{error}</Callout>}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary" disabled={!email || !password || busy}>
                {busy ? t('account.signingIn') : t('account.signIn')}
              </Button>
              <button type="button" onClick={() => setForgot(true)} className="text-[13px] text-brand-600 hover:underline dark:text-brand-300">
                {t('account.forgot')}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
