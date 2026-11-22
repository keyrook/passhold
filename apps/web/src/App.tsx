import { useCallback, useEffect, useRef, useState } from 'react';
import { BackgroundError } from '../../extension/src/lib/messaging.js';
import { useVault } from '../../extension/src/ui/hooks.js';
import { ask, clearLockNote, lock, onSession, restart, sendNow } from './client.js';
import { watchLock } from './lock.js';
import type { SignInStep } from './protocol.js';
import { loadKept, takeOAuth, updateKept, type LockMinutes } from './session.js';
import { SignInScreen } from './screens/SignIn.js';
import { SecondStepScreen, UnlockScreen } from './screens/Unlock.js';
import { VaultScreen } from './screens/Vault.js';
import { useSay } from './ui.js';
import { WORDS } from './words.js';

type Phase =
  | { name: 'boot' }
  | { name: 'signedOut'; said: string | null }
  | { name: 'secondStep'; passkeys: boolean }
  | { name: 'locked' }
  | { name: 'open' };

/** The answer Google or GitHub sent back to this page's address, taken once: the address is cleaned of it at once. */
function providerAnswer(): URLSearchParams | null {
  if (!location.hash.includes('state=')) return null;
  const answer = new URLSearchParams(location.hash.slice(1));
  history.replaceState(null, '', location.pathname + location.search);
  return answer;
}

export function App() {
  const say = useSay();
  const [phase, setPhase] = useState<Phase>({ name: 'boot' });
  const [lockMinutes, setLockMinutes] = useState<LockMinutes>(() => loadKept().lockMinutes);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const minutesRef = useRef(lockMinutes);
  minutesRef.current = lockMinutes;

  const step = useCallback((next: SignInStep) => {
    if (next.step === 'open') setPhase({ name: 'open' });
    else if (next.step === 'locked') setPhase({ name: 'locked' });
    else setPhase({ name: 'secondStep', passkeys: next.passkeys });
  }, []);

  /** `left`: the page is being left, and the keys go at once, sent or not. */
  const doLock = useCallback(async (why: 'asked' | 'idle' | 'hidden' | 'left' = 'asked') => {
    if (phaseRef.current.name !== 'open') return;
    // The screens go first, with every item they drew; then the worker that held the keys, once it has sent what changed.
    setPhase({ name: 'locked' });
    await lock({ flush: why !== 'left' });
  }, []);

  const signOut = useCallback(async (said: string | null = null) => {
    setPhase({ name: 'signedOut', said });
    await ask({ type: 'web/signOut' }).catch(() => undefined);
    updateKept((kept) => ({ ...kept, session: null, tries: 0 }));
    await restart();
  }, []);

  useEffect(() => {
    void (async () => {
      const answer = providerAnswer();
      if (answer) {
        const flow = takeOAuth();
        const ticket = answer.get('ticket');
        // An answer to another sign-in, or to none started in this tab, spends nothing and changes nothing.
        if (!flow || answer.get('state') !== flow.state) return setPhase({ name: 'signedOut', said: WORDS.error.notThisSignIn });
        if (!ticket) return setPhase({ name: 'signedOut', said: say(new BackgroundError('no ticket', answer.get('error') === 'denied' ? 'error.providerDenied' : 'error.providerFailed')) });
        try {
          step(await ask<SignInStep>({ type: 'web/provider', provider: flow.provider, ticket, verifier: flow.verifier }));
        } catch (caught) {
          setPhase({ name: 'signedOut', said: say(caught) });
        }
        return;
      }
      setPhase(loadKept().session ? { name: 'locked' } : { name: 'signedOut', said: null });
    })();
    // The server ended the session, or five wrong passwords did: the tab is signed out.
    const stop = onSession((session) => {
      if (!session && phaseRef.current.name !== 'signedOut' && phaseRef.current.name !== 'boot') setPhase({ name: 'signedOut', said: null });
    });
    const unwatch = watchLock({ minutes: () => minutesRef.current, isOpen: () => phaseRef.current.name === 'open', lock: (why) => void doLock(why), hidden: sendNow });
    return () => {
      stop();
      unwatch();
    };
    // Once, as the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chooseLock = (minutes: LockMinutes) => {
    setLockMinutes(minutes);
    updateKept((kept) => ({ ...kept, lockMinutes: minutes }));
  };

  switch (phase.name) {
    case 'boot':
      return null;
    case 'signedOut':
      return <SignInScreen key={phase.said ?? ''} said={phase.said} onStep={step} />;
    case 'secondStep':
      return <SecondStepScreen passkeys={phase.passkeys} onStep={step} onCancel={() => void signOut()} />;
    case 'locked':
      return (
        <UnlockScreen
          email={loadKept().session?.email ?? ''}
          onOpen={() => {
            clearLockNote();
            setPhase({ name: 'open' });
          }}
          onSignedOut={(said) => setPhase({ name: 'signedOut', said: said || null })}
        />
      );
    case 'open':
      return <Opened lockMinutes={lockMinutes} onLockMinutes={chooseLock} onLock={() => void doLock()} onSignOut={() => void signOut()} />;
  }
}

/** The open vault, as the worker shows it now: read again at every change it reports. */
function Opened(props: { lockMinutes: LockMinutes; onLockMinutes: (minutes: LockMinutes) => void; onLock: () => void; onSignOut: () => void }) {
  const { status } = useVault();
  if (!status || status.state !== 'unlocked') return null;
  return <VaultScreen status={status} {...props} />;
}
