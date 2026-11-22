import { useEffect, useRef, useState, type FormEvent } from 'react';
import { SecondStepForm } from '../../../extension/src/options/SecondStep.js';
import { PasswordInput } from '../../../extension/src/popup/PasswordInput.js';
import { BackgroundError, type SecondStepAnswer } from '../../../extension/src/lib/messaging.js';
import { FingerprintIcon } from '../../../extension/src/ui/icons.js';
import { Button, Callout, Spinner } from '../../../extension/src/ui/primitives.js';
import { ask, currentLockNote, onLockNote, type LockNote } from '../client.js';
import { touchPasskey } from '../passkey.js';
import type { SignInStep, Ways } from '../protocol.js';
import { MAX_TRIES, updateKept } from '../session.js';
import { Card, useSay } from '../ui.js';
import { fill, WORDS } from '../words.js';
import { usePasskeys } from './SignIn.js';

/** What a wrong password or recovery key comes back as: the account's key would not open with it. */
const WRONG = new Set(['error.accountKeyWrong', 'error.accountKitNotThis', 'error.accountKitShape']);

/**
 * A sign-in's second step: the code, the recovery key in its place, or one of
 * the account's passkeys. Asked at every sign-in of an account that has one,
 * never at an unlock.
 */
export function SecondStepScreen({ passkeys, onStep, onCancel }: { passkeys: boolean; onStep: (step: SignInStep) => void; onCancel: () => void }) {
  const here = usePasskeys();
  if (here === null) return null;
  return (
    <Card>
      <SecondStepForm
        passkeys={passkeys && here}
        touch={() => touchPasskey('secondStep')}
        onAnswer={async (answer: SecondStepAnswer) => onStep(await ask<SignInStep>({ type: 'web/secondStep', answer }))}
        onCancel={onCancel}
      />
    </Card>
  );
}

/**
 * The vault locked, with the sign-in kept: the account's password opens it
 * again here — no new sign-in, no second step — or, on an account with none,
 * a passkey or the recovery key. Five wrong tries sign the tab out, so a
 * locked tab cannot be tried for long.
 */
export function UnlockScreen({ email, onOpen, onSignedOut }: { email: string; onOpen: () => void; onSignedOut: (said: string) => void }) {
  const say = useSay();
  const passkeys = usePasskeys();
  const [ways, setWays] = useState<Ways | null>(null);
  const [way, setWay] = useState<'password' | 'recoveryKey'>('password');
  const [busy, setBusy] = useState<'typed' | 'passkey' | 'out' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const field = useRef<HTMLInputElement>(null);
  // What became of a change made just before the lock: being sent, or never sent.
  const [note, setNote] = useState<LockNote>(currentLockNote);
  useEffect(() => onLockNote(setNote), []);

  useEffect(() => {
    void ask<Ways>({ type: 'web/ways' })
      .then((answer) => {
        setWays(answer);
        if (!answer.password) setWay('recoveryKey');
      })
      // Unreachable: the password is the likeliest way in, and its answer says what went wrong.
      .catch(() => setWays({ password: true, recoveryKey: true }));
  }, []);

  const signOut = async (said?: string) => {
    setBusy('out');
    await ask({ type: 'web/signOut' }).catch(() => undefined);
    updateKept((kept) => ({ ...kept, session: null, tries: 0 }));
    onSignedOut(said ?? '');
  };

  const opened = () => {
    updateKept((kept) => ({ ...kept, tries: 0 }));
    onOpen();
  };

  const failed = async (caught: unknown) => {
    if (caught instanceof BackgroundError && caught.key && WRONG.has(caught.key)) {
      const tries = updateKept((kept) => ({ ...kept, tries: kept.tries + 1 })).tries;
      if (tries >= MAX_TRIES) return signOut(WORDS.error.signedOutTries);
      setError(fill(WORDS.triesLeft, { count: MAX_TRIES - tries }));
    } else {
      setError(say(caught));
    }
    setBusy(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const typed = field.current?.value ?? '';
    if (!typed) return;
    setBusy('typed');
    setError(null);
    void ask<SignInStep>(way === 'password' ? { type: 'web/unlock', password: typed } : { type: 'web/unlockRecoveryKey', recoveryKey: typed })
      .then(() => {
        if (field.current) field.current.value = '';
        opened();
      })
      .catch(failed);
  };

  const passkey = () => {
    setBusy('passkey');
    setError(null);
    void touchPasskey('signIn')
      .then((touch) => ask<SignInStep>({ type: 'web/passkey', touch }))
      .then(opened)
      .catch(failed);
  };

  if (!ways || passkeys === null) return null;
  return (
    <Card>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{WORDS.lockedTitle}</h1>
        <p className="truncate text-[14px] text-neutral-600 dark:text-neutral-400">{fill(WORDS.lockedAs, { email })}</p>
      </div>
      {note === 'saving' && (
        <p className="flex items-center gap-2 text-[13px] text-neutral-600 dark:text-neutral-400" role="status">
          <Spinner /> {WORDS.savingAtLock}
        </p>
      )}
      {note === 'lost' && (
        <div data-testid="lost-at-lock">
          <Callout tone="warning">{WORDS.lostAtLock}</Callout>
        </div>
      )}
      {!ways.password && <p className="text-[14px] leading-relaxed text-neutral-700 dark:text-neutral-300">{WORDS.noPasswordBody}</p>}
      {error && <Callout tone="danger">{error}</Callout>}
      {passkeys && (
        <Button variant={ways.password ? 'secondary' : 'primary'} className="w-full" disabled={busy !== null} onClick={passkey} data-testid="unlock-passkey">
          {busy === 'passkey' ? <Spinner /> : <FingerprintIcon className="h-[18px] w-[18px]" />}
          {WORDS.unlockPasskey}
        </Button>
      )}
      <form className="flex flex-col gap-3" onSubmit={submit}>
        {/* The account's email, for a browser's own password manager to match the password to. */}
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">{way === 'password' ? WORDS.password : WORDS.recoveryKey}</span>
          <PasswordInput
            key={way}
            ref={field}
            name={way === 'password' ? 'password' : 'recovery-key'}
            autoComplete={way === 'password' ? 'current-password' : 'off'}
            autoCapitalize="off"
            className={way === 'recoveryKey' ? 'font-mono' : undefined}
            autoFocus={!passkeys || ways.password}
          />
        </label>
        <Button type="submit" variant={ways.password || !passkeys ? 'primary' : 'secondary'} className="w-full" disabled={busy !== null}>
          {busy === 'typed' ? (
            <>
              <Spinner /> {WORDS.opening}
            </>
          ) : (
            WORDS.unlock
          )}
        </Button>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {ways.password && ways.recoveryKey && (
          <Button variant="ghost" disabled={busy !== null} onClick={() => setWay(way === 'password' ? 'recoveryKey' : 'password')}>
            {way === 'password' ? WORDS.useRecoveryKey : WORDS.usePassword}
          </Button>
        )}
        <Button variant="ghost" disabled={busy !== null} onClick={() => void signOut()}>
          {WORDS.signOut}
        </Button>
      </div>
    </Card>
  );
}
