import { useEffect, useRef, useState, type FormEvent } from 'react';
import { accountPasskeySalt, randomBytes, toBase64, type SignInProvider } from '@passhold/core';
import { useT } from '../i18n/react.js';
import type { MessageKey } from '../i18n/locales/en.js';
import { send, type JoinProgress, type PairingView, type ProviderView } from '../lib/messaging.js';
import { askPasskey } from '../ui/device.js';
import { ExternalIcon, FingerprintIcon } from '../ui/icons.js';
import { useAction, useErrorText } from '../ui/hooks.js';
import { Button, Callout, Field } from '../ui/primitives.js';
import { BRAND_ICONS } from '../ui/brand-icons.js';
import { PasswordInput } from '../popup/PasswordInput.js';
import { SecondStepForm } from './SecondStep.js';
import { StartOver, type StartedOver } from './StartOver.js';

export const PROVIDER_NAME: Record<SignInProvider, MessageKey> = { google: 'provider.google', github: 'provider.github' };

/**
 * Google's sign-in button has to carry its four-colour mark as Google draws
 * it — not the single-tone tile a login gets in the list. GitHub's is its
 * monochrome mark, in the text colour. As in Keyrook Authenticator.
 */
function ProviderMark({ provider }: { provider: SignInProvider }) {
  if (provider === 'google') {
    return (
      <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
    );
  }
  const icon = BRAND_ICONS.github!;
  return (
    <svg viewBox={icon.viewBox} className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d={icon.body} />
    </svg>
  );
}

/** Opened by the answer coming back from Google or GitHub: ask what it was before drawing anything. */
export const BACK_FROM_PROVIDER = location.hash === '#provider';

/**
 * Signing in with Google or GitHub happens in this tab, as on a website: it
 * goes to Keyrook's server, on to the provider — whose page lists the
 * accounts this browser already knows — and comes back here.
 */
export function ProviderButtons({ only, inNewTab = false, compact = false }: { only?: SignInProvider; inNewTab?: boolean; compact?: boolean }) {
  const t = useT();
  const { busy, error, run } = useAction();
  const go = (provider: SignInProvider) =>
    void run(async () => {
      const { url } = await send({ type: 'provider/start', provider });
      // From the popup, a tab of its own: the popup closes the moment the person looks away.
      if (inNewTab) await chrome.tabs.create({ url });
      else location.assign(url);
    });
  return (
    <div className="flex flex-col gap-2">
      <div className={compact ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2'}>
        {(only ? [only] : (['google', 'github'] as const)).map((provider) => (
          <Button
            key={provider}
            variant="secondary"
            size={compact ? 'sm' : undefined}
            className={compact ? undefined : 'w-full'}
            disabled={busy}
            onClick={() => go(provider)}
          >
            <ProviderMark provider={provider} />
            {compact ? t(PROVIDER_NAME[provider]) : t('provider.continue', { provider: t(PROVIDER_NAME[provider]) })}
          </Button>
        ))}
      </div>
      {error && <Callout tone="danger">{error}</Callout>}
    </div>
  );
}

/** "or", between the providers and the email form. */
export function Or() {
  const t = useT();
  return (
    <div className="flex items-center gap-3 text-[12px] text-neutral-500" aria-hidden="true">
      <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      {t('provider.or')}
      <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}

/** What the answer from Google or GitHub was, asked once, before drawing. `undefined` while asking. */
export function useProviderView(ask: boolean): [ProviderView | null | undefined, (view: ProviderView | null) => void] {
  const [view, setView] = useState<ProviderView | null | undefined>(ask ? undefined : null);
  useEffect(() => {
    if (ask) void send({ type: 'provider/view' }).then(setView, () => setView(null));
  }, [ask]);
  return [view, setView];
}

/**
 * Back from Google or GitHub: make the account that identity has none of,
 * be let into the one it has, or say what went wrong.
 *
 * `onCreated`: the account is made, and its recovery key is to be shown.
 * `onIn`: this browser holds the account's key — `joined` when there is no
 * vault yet and the sign-in waits for one.
 */
export function ProviderFlow({
  view,
  onCreated,
  onIn,
  onStartedOver,
  onClose,
  makeVault = false,
  onOpening,
  onView,
}: {
  view: ProviderView;
  onCreated: (recoveryKey: string, joined: boolean) => void;
  onIn: (joined: boolean, password?: string) => void;
  /** Neither a browser, a passkey nor the recovery key left: the account started over, with its new recovery key. */
  onStartedOver: (done: StartedOver) => void;
  onClose: () => void;
  /** No vault here yet: a passkey that opens the account sets up this browser's unlock in the same touch. */
  makeVault?: boolean;
  /** The vault is about to be made: what comes after it is to be chosen now. */
  onOpening?: () => void;
  /** What came next, once the second step is done. */
  onView?: (view: ProviderView) => void;
}) {
  const t = useT();
  const { busy, error, run } = useAction();
  const cancel = () =>
    void run(async () => {
      await send({ type: 'provider/cancel' });
      onClose();
    });

  if (view.kind === 'secondStep') {
    return (
      <SecondStepForm
        passkeys={view.passkeys}
        onAnswer={async (answer) => {
          const next = await send({ type: 'provider/secondStep', secondStep: answer });
          // Back into the account this vault was signed in to: nothing more to ask.
          if (next) onView?.(next);
          else onIn(false);
        }}
        onCancel={cancel}
      />
    );
  }

  if (view.kind === 'failed') {
    // Google or GitHub is added to an account with a password on the account's page, signed in there with the
    // password: `#signin` opens that view, once signed in. The page keeps its views' names for the apps.
    const toPage = view.error === 'error.providerHasPassword' || view.error === 'error.providerEmailTaken';
    return (
      <div className="flex flex-col gap-3">
        <Callout tone="danger">{t(view.error)}</Callout>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" disabled={busy} onClick={cancel}>
            {t('common.back')}
          </Button>
          {toPage && (
            <a
              href={`${__KEYROOK_ACCOUNT_PAGE__}/#signin`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
            >
              {t('provider.openAccountPage')}
              <ExternalIcon className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  const provider = t(PROVIDER_NAME[view.provider]);
  if (view.kind === 'new') {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-[17px] font-semibold">{t('provider.newTitle')}</h2>
        <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('provider.newBody', { provider, email: view.email })}</p>
        {error && <Callout tone="danger">{error}</Callout>}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const { recoveryKey, joined } = await send({ type: 'provider/create' });
                onCreated(recoveryKey, joined);
              })
            }
          >
            {busy ? t('account.creating') : t('account.createButton')}
          </Button>
          <Button variant="ghost" disabled={busy} onClick={cancel}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    );
  }
  if (view.kind === 'rooted') return <Rooted view={view} onCreated={onCreated} onIn={onIn} />;
  if (!view.rooted && view.rootStep) {
    // Back from signing in again: giving the account its root asks for the code after the one the sign-in took.
    return (
      <SecondStepForm
        passkeys={false}
        owner
        next
        onAnswer={async (answer) => {
          const next = await send({ type: 'provider/rootStep', secondStep: answer });
          if (next) onView?.(next);
        }}
        onCancel={cancel}
      />
    );
  }
  if (!view.rooted) return <NeedsRootAgain view={view} onCancel={cancel} />;
  return <Existing view={view} onIn={onIn} onStartedOver={onStartedOver} onCancel={cancel} makeVault={makeVault} onOpening={onOpening} />;
}

/**
 * Back from signing in again: the account has its root and Passhold its key.
 * A new recovery key is shown first, as for a new account; with the old one
 * typed, the account goes straight in.
 */
function Rooted({
  view,
  onCreated,
  onIn,
}: {
  view: Extract<ProviderView, { kind: 'rooted' }>;
  onCreated: (recoveryKey: string, joined: boolean) => void;
  onIn: (joined: boolean, password?: string) => void;
}) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    // What came back is in the vault, or waiting for it: nothing is left to hold.
    void send({ type: 'provider/cancel' }).finally(() => (view.recoveryKey ? onCreated(view.recoveryKey, view.joined) : onIn(view.joined)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div className="min-h-[200px]" />;
}

/**
 * An account Keyrook Authenticator made with Google or GitHub before each app
 * had a key of its own: it has no root, so nothing here could open anything.
 * Its owner is told, and gives it one by signing in with the provider once
 * more — proof of the owner, which the session alone is not.
 */
function NeedsRootAgain({ view, onCancel }: { view: Extract<ProviderView, { kind: 'existing' }>; onCancel: () => void }) {
  const t = useT();
  const [key, setKey] = useState('');
  const { busy, error, run } = useAction();
  const provider = t(PROVIDER_NAME[view.provider]);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (busy) return;
        void run(async () => {
          const { url } = await send({ type: 'provider/makeRoot', ...(key.trim() ? { recoveryKey: key } : {}) });
          location.assign(url);
        });
      }}
      className="flex flex-col gap-3"
      data-testid="needs-root"
    >
      <h2 className="text-[17px] font-semibold">{t('provider.joinTitle')}</h2>
      <Callout tone="info">{t('provider.needsRoot', { provider, email: view.email })}</Callout>
      <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('needsRoot.body')}</p>
      <Field label={t('needsRoot.sheet')} autoComplete="off" spellCheck={false} className="font-mono" value={key} onChange={(event) => setKey(event.target.value)} />
      {error && <Callout tone="danger">{error}</Callout>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={busy}>
          {t('provider.confirmWith', { provider })}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}

/**
 * An account this browser does not hold the key of yet. Its passkey first —
 * one touch, nothing to approve — and the other ways when there is none here.
 */
function Existing({
  view,
  onIn,
  onStartedOver,
  onCancel,
  makeVault,
  onOpening,
}: {
  view: Extract<ProviderView, { kind: 'existing' }>;
  onIn: (joined: boolean, password?: string) => void;
  onStartedOver: (done: StartedOver) => void;
  onCancel: () => void;
  makeVault: boolean;
  onOpening?: () => void;
}) {
  // No Passhold has its key in this account yet: nothing to ask a passkey or a browser for.
  const [passkeys, setPasskeys] = useState<string[] | null>(view.keyed ? null : []);
  const [other, setOther] = useState(false);
  useEffect(() => {
    if (!view.keyed) return;
    void send({ type: 'provider/passkeys' }).then(
      ({ credentialIds }) => setPasskeys(credentialIds),
      () => setPasskeys([]),
    );
  }, [view.keyed]);
  // Asking which passkeys there are: nothing drawn that the answer would replace.
  if (passkeys === null) return <div className="min-h-[200px]" />;
  if (passkeys.length > 0 && !other) {
    return <WithPasskey view={view} credentialIds={passkeys} onIn={onIn} onOther={() => setOther(true)} onCancel={onCancel} makeVault={makeVault} onOpening={onOpening} />;
  }
  return <LetMeIn view={view} onIn={onIn} onStartedOver={onStartedOver} onCancel={onCancel} />;
}

/**
 * The passkey answers twice in one touch: once for the account, opening its
 * key, and once for a new vault here, which it then unlocks too.
 */
function WithPasskey({
  view,
  credentialIds,
  onIn,
  onOther,
  onCancel,
  makeVault,
  onOpening,
}: {
  view: Extract<ProviderView, { kind: 'existing' }>;
  credentialIds: string[];
  onIn: (joined: boolean, password?: string) => void;
  onOther: () => void;
  onCancel: () => void;
  makeVault: boolean;
  onOpening?: () => void;
}) {
  const t = useT();
  const { busy, error, run } = useAction();
  const tried = useRef(false);

  const open = () =>
    void run(async () => {
      const vaultSalt = makeVault ? randomBytes(32) : undefined;
      const answer = await askPasskey(credentialIds, await accountPasskeySalt(), vaultSalt);
      const { joined } = await send({ type: 'provider/withPasskey', credentialId: answer.credentialId, prf: answer.first });
      if (joined && vaultSalt && answer.second) {
        onOpening?.();
        // The page becomes the vault's once it exists: nothing after this is drawn here.
        await send({
          type: 'vault/createWithDevice',
          credential: { credentialId: answer.credentialId, salt: toBase64(vaultSalt) },
          prf: answer.second,
          join: true,
        });
        return;
      }
      onIn(joined);
    });

  // Asked at once, once: coming back from Google, the touch is the only thing left to do.
  useEffect(() => {
    if (tried.current) return;
    tried.current = true;
    open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[17px] font-semibold">{t('passkey.joinTitle')}</h2>
      <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('passkey.joinBody', { email: view.email })}</p>
      {error && <Callout tone="danger">{error}</Callout>}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" disabled={busy} onClick={open}>
          <FingerprintIcon className="h-[18px] w-[18px]" /> {t('passkey.use')}
        </Button>
        <Button variant="secondary" disabled={busy} onClick={onOther}>
          {t('passkey.otherWays')}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}

/**
 * Waiting to be let in by a browser already in — or the recovery key instead.
 * With no Passhold in the account yet, the recovery key is the only way; with
 * that lost too, the account starts over.
 */
function LetMeIn({
  view,
  onIn,
  onStartedOver,
  onCancel,
}: {
  view: Extract<ProviderView, { kind: 'existing' }>;
  onIn: (joined: boolean, password?: string) => void;
  onStartedOver: (done: StartedOver) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [progress, setProgress] = useState<JoinProgress>({ state: 'waiting' });
  // An account with a password opens with it; one without, by another browser — or, where none has the key, the recovery key.
  const [withKey, setWithKey] = useState(!view.keyed && !view.password);
  const [password, setPassword] = useState('');
  const [over, setOver] = useState(false);
  const [key, setKey] = useState('');
  const { busy, error, setError, run } = useAction();
  const errorText = useErrorText();
  const asked = useRef(view.asked);

  // Ask once, then look every second and a half: the person is walking to the other computer.
  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const look = async () => {
      try {
        if (!asked.current) {
          await send({ type: 'provider/ask' });
          asked.current = true;
        }
        const next = await send({ type: 'provider/poll' });
        if (stop) return;
        setProgress(next);
        if (next.state === 'done') return onIn(next.joined);
        if (next.state === 'ended') return;
      } catch (failure) {
        if (stop) return;
        setError(errorText(failure));
        return;
      }
      timer = setTimeout(() => void look(), 1_500);
    };
    if (!withKey && view.keyed && !view.password) void look();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withKey, progress.state === 'ended']);

  const submitPassword = (event: FormEvent) => {
    event.preventDefault();
    if (!password || busy) return;
    // The password goes up with the sign-in: a vault made here opens with it, as one made by signing in with it does.
    void run(async () => onIn((await send({ type: 'provider/withPassword', password })).joined, password));
  };

  const submitKey = (event: FormEvent) => {
    event.preventDefault();
    if (!key.trim() || busy) return;
    void run(async () => onIn((await send({ type: 'provider/withKit', recoveryKey: key })).joined));
  };

  if (over) return <StartOver email={view.email} fixed method="provider" onDone={onStartedOver} onBack={() => setOver(false)} />;

  if (view.password && !withKey) {
    return (
      <form onSubmit={submitPassword} className="flex flex-col gap-3" data-testid="provider-password">
        <h2 className="text-[17px] font-semibold">{t('provider.passwordTitle')}</h2>
        <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {t('provider.passwordBody', { provider: t(PROVIDER_NAME[view.provider]), email: view.email })}
        </p>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium">
          {t('account.password')}
          <PasswordInput autoFocus value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && <Callout tone="danger">{error}</Callout>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={!password || busy}>
            {busy ? t('account.signingIn') : t('account.signIn')}
          </Button>
          <Button variant="ghost" disabled={busy} onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setError(null);
            setWithKey(true);
          }}
          className="self-start text-[13px] text-brand-600 hover:underline dark:text-brand-300"
        >
          {t('provider.useKit')}
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[17px] font-semibold">{t('provider.joinTitle')}</h2>
      <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        {view.keyed ? t('provider.joinBody', { email: view.email }) : t('provider.noKeyYet', { email: view.email })}
      </p>
      {withKey ? (
        <form onSubmit={submitKey} className="flex flex-col gap-3">
          <Field
            label={t('account.recoveryKey')}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
            autoFocus
            value={key}
            onChange={(event) => setKey(event.target.value)}
          />
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary" disabled={!key.trim() || busy}>
              {t('provider.useThisKey')}
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setError(null);
                if (view.keyed || view.password) setWithKey(false);
                else onCancel();
              }}
            >
              {view.keyed || view.password ? t('common.back') : t('common.cancel')}
            </Button>
          </div>
          <button type="button" onClick={() => setOver(true)} className="self-start text-[13px] text-brand-600 hover:underline dark:text-brand-300">
            {t('startOver.link')}
          </button>
        </form>
      ) : (
        <>
          {progress.state === 'accepted' ? (
            <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800" data-testid="join-code">
              <p className="text-[13px] text-neutral-700 dark:text-neutral-300">{t('provider.compare')}</p>
              <p className="select-all text-center font-mono text-[18px] tracking-wide">{progress.code}</p>
            </div>
          ) : progress.state === 'ended' ? (
            <Callout tone="warning">{t('provider.ended')}</Callout>
          ) : (
            <p className="text-[13px] text-neutral-600 dark:text-neutral-400" role="status">
              {t('provider.waiting')}
            </p>
          )}
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="flex flex-wrap gap-2">
            {progress.state === 'ended' && (
              <Button
                variant="primary"
                onClick={() => {
                  asked.current = false;
                  setError(null);
                  setProgress({ state: 'waiting' });
                }}
              >
                {t('provider.askAgain')}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                setError(null);
                setWithKey(true);
              }}
            >
              {t('provider.useKit')}
            </Button>
            <Button variant="ghost" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Browsers asking to be let into the account, for this one — which holds the
 * key — to let in. It is let in only once a person has seen the same code on
 * both screens: a server that swapped either browser's key would make them
 * differ.
 */
export function LetInRequests() {
  const t = useT();
  const [pairings, setPairings] = useState<PairingView[]>([]);
  const { busy, error, run } = useAction();

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const look = async () => {
      const found = await send({ type: 'pairing/list' }).catch(() => null);
      if (stop) return;
      if (found) setPairings(found);
      timer = setTimeout(() => void look(), 3_000);
    };
    void look();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, []);

  const act = (change: () => Promise<unknown>) =>
    void run(async () => {
      await change();
      setPairings(await send({ type: 'pairing/list' }));
    });

  if (pairings.length === 0) return null;
  return (
    <div className="mb-6 flex flex-col gap-3" data-testid="let-in">
      {pairings.map((pairing) => (
        <Callout key={pairing.id} tone="warning">
          <span className="flex flex-col items-start gap-2.5">
            <span className="font-medium">{t('pairing.asking', { device: pairing.deviceName })}</span>
            {pairing.code ? (
              <>
                <span>{t('pairing.compare')}</span>
                <span className="select-all font-mono text-[17px] tracking-wide text-neutral-900 dark:text-neutral-50">{pairing.code}</span>
                <span className="flex flex-wrap gap-2">
                  <Button size="sm" variant="primary" disabled={busy} onClick={() => act(() => send({ type: 'pairing/approve', id: pairing.id }))}>
                    {t('pairing.match')}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => act(() => send({ type: 'pairing/deny', id: pairing.id }))}>
                    {t('pairing.differ')}
                  </Button>
                </span>
              </>
            ) : (
              <span className="flex flex-wrap gap-2">
                <Button size="sm" variant="primary" disabled={busy} onClick={() => act(() => send({ type: 'pairing/start', id: pairing.id }))}>
                  {t('pairing.start')}
                </Button>
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => act(() => send({ type: 'pairing/deny', id: pairing.id }))}>
                  {t('pairing.notMe')}
                </Button>
              </span>
            )}
          </span>
        </Callout>
      ))}
      {error && <Callout tone="danger">{error}</Callout>}
    </div>
  );
}
