import { useEffect, useRef, useState, type FormEvent } from 'react';
import { newProviderFlow, type SignInProvider } from '@passhold/core';
import { useT } from '../../../extension/src/i18n/react.js';
import { PasswordInput } from '../../../extension/src/popup/PasswordInput.js';
import { ProviderMark } from '../../../extension/src/options/ProviderSignIn.js';
import { ExternalIcon, FingerprintIcon } from '../../../extension/src/ui/icons.js';
import { Button, Callout, Field, Spinner } from '../../../extension/src/ui/primitives.js';
import { ask } from '../client.js';
import { passkeysHere, touchPasskey } from '../passkey.js';
import type { SignInStep } from '../protocol.js';
import { holdOAuth } from '../session.js';
import { Card, Or, useSay } from '../ui.js';
import { WORDS } from '../words.js';


/** Whether this browser may be offered the account's passkeys: asked once, before the screen is drawn. */
export function usePasskeys(): boolean | null {
  const [here, setHere] = useState<boolean | null>(null);
  useEffect(() => void passkeysHere().then(setHere), []);
  return here;
}

/**
 * The first screen: the account's email and password, Google or GitHub, or
 * one of the account's passkeys. Nothing else: an account is made on the
 * account's page, or in an app.
 */
export function SignInScreen({ onStep, said }: { onStep: (step: SignInStep) => void; said?: string | null }) {
  const t = useT();
  const say = useSay();
  const passkeys = usePasskeys();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<'password' | 'passkey' | SignInProvider | null>(null);
  const [error, setError] = useState<string | null>(said ?? null);
  const password = useRef<HTMLInputElement>(null);

  const run = async (what: NonNullable<typeof busy>, action: () => Promise<void>) => {
    setBusy(what);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(say(caught));
      setBusy(null);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const typed = password.current?.value ?? '';
    void run('password', async () => {
      const step = await ask<SignInStep>({ type: 'web/signIn', email, password: typed });
      // Held by the flow that used it, then dropped: the field is cleared.
      if (password.current) password.current.value = '';
      onStep(step);
    });
  };

  /** Google or GitHub, in this tab: the answer comes back to this page's address, and the verifier waits for it here. */
  const provider = (which: SignInProvider) =>
    void run(which, async () => {
      const { verifier, challenge, state } = await newProviderFlow();
      holdOAuth({ provider: which, verifier, state, at: Date.now() });
      const query = new URLSearchParams({ client: 'web', origin: location.origin, challenge, state });
      location.assign(`${__KEYROOK_API__}/oauth/${which}/start?${query}`);
    });

  const passkey = () =>
    void run('passkey', async () => {
      onStep(await ask<SignInStep>({ type: 'web/passkey', touch: await touchPasskey('signIn') }));
    });

  if (passkeys === null) return null;
  return (
    <Card>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{WORDS.signInTitle}</h1>
        <p className="text-[14px] text-neutral-600 dark:text-neutral-400">{WORDS.tagline}</p>
      </div>
      {error && <Callout tone="danger">{error}</Callout>}
      <form className="flex flex-col gap-3" onSubmit={submit}>
        <Field
          label={WORDS.email}
          type="email"
          name="username"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">{WORDS.password}</span>
          {/* The account's password: a browser's own password manager may keep it, as for the account's page. */}
          <PasswordInput ref={password} name="password" autoComplete="current-password" autoCapitalize="off" required />
        </label>
        <Button type="submit" variant="primary" className="w-full" disabled={busy !== null}>
          {busy === 'password' ? (
            <>
              <Spinner /> {WORDS.signingIn}
            </>
          ) : (
            WORDS.signIn
          )}
        </Button>
      </form>
      <Or>{WORDS.or}</Or>
      <div className="flex flex-col gap-2">
        {(['google', 'github'] as const).map((which) => (
          <Button key={which} className="w-full" disabled={busy !== null} onClick={() => provider(which)}>
            {busy === which ? <Spinner /> : <ProviderMark provider={which} />}
            {which === 'google' ? WORDS.google : WORDS.github}
          </Button>
        ))}
        {passkeys && (
          <Button className="w-full" disabled={busy !== null} onClick={passkey} data-testid="passkey">
            {busy === 'passkey' ? <Spinner /> : <FingerprintIcon className="h-[18px] w-[18px]" />}
            {WORDS.passkey}
          </Button>
        )}
      </div>
      <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        {WORDS.newHere}{' '}
        <a className="inline-flex items-center gap-1 font-medium text-brand-600 underline dark:text-brand-300" href={__KEYROOK_ACCOUNT_PAGE__} rel="noopener noreferrer">
          {WORDS.makeAccount}
          <ExternalIcon className="h-3.5 w-3.5" />
        </a>
      </p>
      <p className="sr-only">{t('app.by')}</p>
    </Card>
  );
}
