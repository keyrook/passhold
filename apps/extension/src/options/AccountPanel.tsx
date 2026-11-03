import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { accountPasskeySalt, strongEnoughForAccount, type DeviceCredential, type VaultSecret } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { BackgroundError, send, type AccountView, type ArchiveView, type SecondStepAnswer, type SecurityKey, type SyncResult } from '../lib/messaging.js';
import { deviceUnsupported, onEdge } from '../lib/name.js';
import { askPasskey, enrollDevice, forgetCredential } from '../ui/device.js';
import { useAction } from '../ui/hooks.js';
import { useProof } from '../ui/Proof.js';
import { Button, Callout, Field } from '../ui/primitives.js';
import { PasswordInput } from '../popup/PasswordInput.js';
import { Strength } from '../ui/Strength.js';
import { ExternalIcon } from '../ui/icons.js';
import { Card } from './BackupPanel.js';
import { BACK_FROM_PROVIDER, LetInRequests, Or, PROVIDER_NAME, ProviderButtons, ProviderFlow, useProviderView } from './ProviderSignIn.js';
import { Choice, Muted, PageHeader, Row, Section, StateDot } from './Section.js';
import { SecondStepForm } from './SecondStep.js';
import { StartOver, type StartedOver } from './StartOver.js';
import { RemovedNotice } from '../ui/RemovedNotice.js';
import { StartOverWarning } from '../ui/StartOverWarning.js';
import { AccountPasskeyButton } from './AccountPasskey.js';

/**
 * The Keyrook account: the same one Keyrook Authenticator signs in to. Signed
 * in, the logins are sealed here and synced through Keyrook's server, which
 * can read none of them — nor which sites they are for.
 */
export function AccountPanel({
  account,
  secret,
  device,
  keys,
  onKit,
  onNewKit,
  onStartedOver,
}: {
  account: AccountView | null;
  secret: VaultSecret;
  device: DeviceCredential | null;
  keys: SecurityKey[];
  /** A recovery key for the account to show, with every way to keep it. */
  onKit: (key: string, noPassword?: boolean) => void;
  /** A new recovery key for the account: drawn, shown and typed back, then set with the password. */
  onNewKit: () => Promise<void>;
  /** A start over asked for: its recovery key and its day to show. */
  onStartedOver: (done: StartedOver) => void;
}) {
  const t = useT();
  const [view, setView] = useProviderView(BACK_FROM_PROVIDER);
  const done = () => {
    setView(null);
    history.replaceState(null, '', '#account');
  };
  return (
    <>
      <PageHeader title={t('nav.accountSync')} description={t('account.description')} />
      {account?.removed ? (
        <div className="mb-4">
          <RemovedNotice removedAt={account.removed} />
        </div>
      ) : null}
      {/* Until the worker says what came back from the provider, nothing it could replace — signed in already
          by an old account just given its root, the new recovery key still comes first. */}
      {view === undefined ? null : account && !account.signedOut && view?.kind !== 'rooted' ? (
        <SignedIn account={account} secret={secret} device={device} keys={keys} onKit={onKit} onNewKit={onNewKit} />
      ) : view ? (
        <Section>
          <Card>
            <ProviderFlow
              view={view}
              onCreated={(key) => {
                done();
                onKit(key, true);
              }}
              onIn={done}
              onStartedOver={(over) => {
                done();
                onStartedOver(over);
              }}
              onClose={done}
              onView={setView}
            />
          </Card>
        </Section>
      ) : account ? (
        <SignIn again={account} onKit={onKit} onStartedOver={onStartedOver} />
      ) : (
        <SignedOut onKit={onKit} onStartedOver={onStartedOver} />
      )}
    </>
  );
}

/** No account here yet: sign in to one, or make one. */
function SignedOut({ onKit, onStartedOver }: { onKit: (key: string, noPassword?: boolean) => void; onStartedOver: (done: StartedOver) => void }) {
  const t = useT();
  const [mode, setMode] = useState<'signIn' | 'create'>('signIn');
  return (
    <>
      <div className="mb-4">
        <Choice<'signIn' | 'create'>
          label={t('nav.account')}
          value={mode}
          options={[
            { value: 'signIn', label: t('account.haveOne') },
            { value: 'create', label: t('account.create') },
          ]}
          onChange={setMode}
        />
      </div>
      {mode === 'signIn' ? (
        <SignIn again={null} onKit={onKit} onStartedOver={onStartedOver} />
      ) : (
        <Section>
          <Card>
            <Create onCreated={(key) => key && onKit(key)} />
          </Card>
        </Section>
      )}
    </>
  );
}

/**
 * Making an account: the address proved by a code Keyrook emails, then a
 * password strong enough to guard a copy of the account's key on the server.
 */
/**
 * `onCreated`: the account is made, with its recovery key to show (null if
 * the kit could not be made just then); `joined` when there is no vault yet
 * and the account waits for one.
 */
export function Create({
  onCreated,
  withProviders = true,
}: {
  onCreated: (recoveryKey: string | null, joined: boolean, email: string, password: string) => void;
  withProviders?: boolean;
}) {
  const t = useT();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const { busy, error, setError, run } = useAction();
  const strong = strongEnoughForAccount(password);
  const ready = /^\d{6}$/.test(code) && strong && password === again && !busy;

  const sendCode = (event: FormEvent) => {
    event.preventDefault();
    if (!email || busy) return;
    void run(async () => {
      await send({ type: 'account/start', email });
      setSent(true);
    });
  };

  const create = (event: FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    void run(async () => {
      const { recoveryKey, joined } = await send({ type: 'account/create', email, code, password });
      const typed = password;
      setPassword('');
      setAgain('');
      // Shown at once, as making the account's kit is part of making the account.
      onCreated(recoveryKey, joined, email.trim().toLowerCase(), typed);
    });
  };

  return (
    <>
        {!sent ? (
          <form onSubmit={sendCode} className="flex flex-col gap-3">
            {withProviders && (
              <>
                <ProviderButtons />
                <Or />
              </>
            )}
            <Field label={t('account.email')} type="email" autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} />
            {error && <Callout tone="danger">{error}</Callout>}
            <div>
              <Button type="submit" variant="primary" disabled={!email || busy}>
                {t('account.sendCode')}
              </Button>
            </div>
            <Muted>{t('account.createNote')}</Muted>
          </form>
        ) : (
          <form onSubmit={create} className="flex flex-col gap-3">
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
            <label className="flex flex-col gap-1.5 text-[13px] font-medium">
              {t('account.newPassword')}
              <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <Strength password={password} />
            {password && !strong && <p className="text-[12px] text-red-600 dark:text-red-300">{t('error.accountPasswordWeak')}</p>}
            <label className="flex flex-col gap-1.5 text-[13px] font-medium">
              {t('settings.confirm')}
              <PasswordInput value={again} onChange={(event) => setAgain(event.target.value)} error={Boolean(again) && again !== password} />
            </label>
            {again && again !== password && <p className="text-[12px] text-red-600 dark:text-red-300">{t('setup.mismatch')}</p>}
            <Muted>{t('account.passwordNote')}</Muted>
            {error && <Callout tone="danger">{error}</Callout>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="primary" disabled={!ready}>
                {busy ? t('account.creating') : t('account.createButton')}
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setError(null);
                  setSent(false);
                  setCode('');
                }}
              >
                {t('account.otherEmail')}
              </Button>
            </div>
          </form>
        )}
    </>
  );
}

/**
 * Why the server signed this browser out: the account started over, or just
 * that it did — unless the notice above says this browser was removed.
 */
function SignedOutBecause({ again }: { again: AccountView }) {
  const t = useT();
  if (again.startedOver) {
    const date = new Intl.DateTimeFormat(t.locale, { dateStyle: 'long' }).format(again.startedOver);
    return <Callout tone="warning">{t(again.passwordless ? 'account.startedOverProvider' : 'account.startedOver', { date })}</Callout>;
  }
  if (again.removed) return null;
  return <Callout tone="warning">{t('account.signedOutByServer')}</Callout>;
}

function SignIn({
  again,
  onKit,
  onStartedOver,
}: {
  again: AccountView | null;
  onKit: (key: string, noPassword?: boolean) => void;
  onStartedOver: (done: StartedOver) => void;
}) {
  const t = useT();
  const [email, setEmail] = useState(again?.email ?? '');
  const [password, setPassword] = useState('');
  const [forgot, setForgot] = useState(false);
  const [needsRoot, setNeedsRoot] = useState(false);
  // `next`: the code that making the account's root asks for, after the sign-in's.
  const [step, setStep] = useState<{ passkeys: boolean; next?: boolean } | null>(null);
  // What the sign-in asked for before its second step: a root to be made, with the old sheet or a new one.
  const root = useRef<{ recoveryKey?: string } | undefined>(undefined);
  const { busy, error, run } = useAction();

  if (forgot) {
    return (
      <Recover
        email={email}
        fixed={Boolean(again)}
        onBack={() => setForgot(false)}
        onStartedOver={onStartedOver}
      />
    );
  }

  // An account with no password signs in again the way it signed in.
  if (again?.passwordless) {
    return (
      <Section>
        <Card>
          {again.signedOut && <SignedOutBecause again={again} />}
          <div className="flex flex-col gap-2">
            <ProviderButtons only={again.provider ?? undefined} />
            {/* Starting over took every passkey off the account. */}
            {!again.startedOver && <AccountPasskeyButton />}
          </div>
        </Card>
      </Section>
    );
  }

  const go = async (makeRoot?: { recoveryKey?: string }, secondStep?: SecondStepAnswer) => {
    root.current = makeRoot;
    const { recoveryKey } = await send({ type: 'account/signIn', email, password, ...(makeRoot ? { makeRoot } : {}), ...(secondStep ? { secondStep } : {}) });
    setPassword('');
    setNeedsRoot(false);
    setStep(null);
    if (recoveryKey) onKit(recoveryKey);
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

  if (step) {
    return (
      <Section>
        <Card>
          <SecondStepForm
            passkeys={step.passkeys}
            owner={step.next}
            next={step.next}
            onAnswer={(answer) => go(root.current, answer).catch(asked)}
            onCancel={() => (step.next ? void send({ type: 'account/cancelRoot' }).finally(() => setStep(null)) : setStep(null))}
          />
        </Card>
      </Section>
    );
  }

  if (needsRoot) {
    return (
      <Section>
        <Card>
          <NeedsRoot submit={(recoveryKey) => go({ ...(recoveryKey ? { recoveryKey } : {}) }).catch(asked)} onCancel={() => setNeedsRoot(false)} />
        </Card>
      </Section>
    );
  }

  return (
    <Section>
      <Card>
        {again?.signedOut && <SignedOutBecause again={again} />}
        {/* Starting over took every passkey off the account: only the new password is left to sign in with. */}
        {!again?.startedOver && (
          <div className="mb-3 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {!again && <ProviderButtons />}
              <AccountPasskeyButton />
            </div>
            <Or />
          </div>
        )}
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Field label={t('account.email')} type="email" autoComplete="off" value={email} readOnly={Boolean(again)} onChange={(event) => setEmail(event.target.value)} />
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
        <Muted>{t('account.note')}</Muted>
      </Card>
    </Section>
  );
}

/**
 * An account Keyrook Authenticator made before each app had a key of its
 * own: told first, then given its root here. The recovery key Authenticator
 * printed keeps working for every app when it is typed — the server checks
 * it, and Passhold never sees what it opened before — or a new one is made,
 * shown once, which replaces it.
 */
export function NeedsRoot({ submit, onCancel }: { submit: (recoveryKey?: string) => Promise<void>; onCancel: () => void }) {
  const t = useT();
  const [key, setKey] = useState('');
  const { busy, error, run } = useAction();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!busy) void run(() => submit(key.trim() || undefined));
      }}
      className="flex flex-col gap-3"
      data-testid="needs-root"
    >
      <Callout tone="info">{t('error.accountNeedsRoot')}</Callout>
      <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('needsRoot.body')}</p>
      <Field label={t('needsRoot.sheet')} autoComplete="off" spellCheck={false} className="font-mono" value={key} onChange={(event) => setKey(event.target.value)} />
      {error && <Callout tone="danger">{error}</Callout>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? t('account.signingIn') : key.trim() ? t('needsRoot.withSheet') : t('needsRoot.newSheet')}
        </Button>
        {/* The sign-in that found no root waits for this choice: not going on ends it. */}
        <Button variant="ghost" disabled={busy} onClick={() => void send({ type: 'account/cancelRoot' }).finally(onCancel)}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}

/**
 * A forgotten account password, set anew with the account's recovery key —
 * the one from the sheet saved when the account was made, here or in Keyrook
 * Authenticator — and a code Keyrook emails: someone who found the sheet still
 * needs the inbox. With neither the key nor the password, the account starts
 * over from here.
 */
export function Recover({
  email: initial,
  fixed,
  onBack,
  submit: go = async (email, code, recoveryKey, password) => void (await send({ type: 'account/recover', email, code, recoveryKey, password })),
  onStartedOver,
  bare = false,
}: {
  email: string;
  fixed: boolean;
  onBack: () => void;
  /** What the key and the new password are for: here, the vault's account; on a new computer, signing in first. */
  submit?: (email: string, code: string, recoveryKey: string, password: string) => Promise<void>;
  /** Started over instead: the account's new recovery key, to show. */
  onStartedOver: (done: StartedOver) => void;
  /** Drawn inside a card already. */
  bare?: boolean;
}) {
  const t = useT();
  const [email, setEmail] = useState(initial);
  const [sent, setSent] = useState(false);
  const [over, setOver] = useState(false);
  const [code, setCode] = useState('');
  const [key, setKey] = useState('');
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const { busy, error, setError, run } = useAction();
  const strong = strongEnoughForAccount(password);
  const ready = /^\d{6}$/.test(code) && key.trim().length > 0 && strong && password === again && !busy;

  const sendCode = (event: FormEvent) => {
    event.preventDefault();
    if (!email || busy) return;
    void run(async () => {
      await send({ type: 'account/recoverCode', email });
      setSent(true);
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    void run(async () => {
      await go(email, code, key, password);
      setPassword('');
      setAgain('');
    });
  };

  const wrap = (body: ReactNode) =>
    bare ? (
      body
    ) : (
      <Section>
        <Card>{body}</Card>
      </Section>
    );

  if (over) return wrap(<StartOver email={email} fixed={fixed} method="password" onDone={onStartedOver} onBack={() => setOver(false)} />);

  if (!sent) {
    return wrap(
      <form onSubmit={sendCode} className="flex flex-col gap-3">
        <Callout tone="info">{t('account.recoverBody')}</Callout>
        <Field label={t('account.email')} type="email" autoComplete="off" value={email} readOnly={fixed} onChange={(event) => setEmail(event.target.value)} />
        {error && <Callout tone="danger">{error}</Callout>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={!email || busy}>
            {t('account.sendCode')}
          </Button>
          <Button variant="ghost" disabled={busy} onClick={onBack}>
            {t('account.backToSignIn')}
          </Button>
        </div>
        <button type="button" onClick={() => setOver(true)} className="self-start text-[13px] text-brand-600 hover:underline dark:text-brand-300">
          {t('startOver.link')}
        </button>
      </form>,
    );
  }

  return wrap(
    <form onSubmit={submit} className="flex flex-col gap-3">
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
      <Field
        label={t('account.recoveryKey')}
        autoComplete="off"
        spellCheck={false}
        className="font-mono"
        value={key}
        onChange={(event) => setKey(event.target.value)}
      />
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
      {error && <Callout tone="danger">{error}</Callout>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={!ready}>
          {busy ? t('account.recovering') : t('account.recoverButton')}
        </Button>
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() => {
            setError(null);
            setSent(false);
            setCode('');
          }}
        >
          {t('common.back')}
        </Button>
      </div>
      <button type="button" onClick={() => setOver(true)} className="self-start text-[13px] text-brand-600 hover:underline dark:text-brand-300">
        {t('startOver.link')}
      </button>
    </form>,
  );
}

function SignedIn({
  account,
  secret,
  device,
  keys,
  onKit,
  onNewKit,
}: {
  account: AccountView;
  secret: VaultSecret;
  device: DeviceCredential | null;
  keys: SecurityKey[];
  onKit: (key: string, noPassword?: boolean) => void;
  onNewKit: () => Promise<void>;
}) {
  const t = useT();
  const [result, setResult] = useState<SyncResult | null>(null);
  const { busy, error, run } = useAction();
  const when = new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium', timeStyle: 'short' });
  const provider = account.provider ? t(PROVIDER_NAME[account.provider]) : null;

  return (
    <>
      {account.startOver && (
        <div className="mb-4">
          <StartOverWarning startOver={account.startOver} />
        </div>
      )}
      <LetInRequests />
      <Section>
        <Row
          label={
            <span className="flex items-center">
              <StateDot good={account.lastSyncAt !== null} />
              {account.name
                ? provider
                  ? t('provider.signedInWithNamed', { provider, name: account.name, email: account.email })
                  : t('account.signedInAsNamed', { name: account.name, email: account.email })
                : provider
                  ? t('provider.signedInWith', { provider, email: account.email })
                  : t('account.signedInAs', { email: account.email })}
            </span>
          }
          description={account.lastSyncAt ? t('account.synced', { date: when.format(account.lastSyncAt) }) : t('account.notSynced')}
          control={
            <Button size="sm" disabled={busy} onClick={() => void run(async () => setResult(await send({ type: 'account/sync' })))}>
              {t('account.syncNow')}
            </Button>
          }
        >
          {result || error ? (
            <div className="flex flex-col gap-2">
              {result && (
                <Callout tone="info">
                  {[
                    t('account.syncDone'),
                    result.removed ? t('account.removed', { count: result.removed }) : '',
                    result.skipped ? t('account.skipped', { count: result.skipped }) : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </Callout>
              )}
              {error && <Callout tone="danger">{error}</Callout>}
            </div>
          ) : null}
        </Row>
        {account.provider && <PasskeyRow account={account} device={device} />}
        <KeptRows />
        <KitRow
          kit={account.kit}
          canMake={!account.passwordless}
          secret={secret}
          device={device}
          keys={keys}
          onKit={(key) => onKit(key, account.passwordless)}
          onNewKit={onNewKit}
        />
        <ManageRow passwordless={account.passwordless} />
        <SignOutRow />
      </Section>
    </>
  );
}

// The account is Keyrook's, not Passhold's: its password, its recovery sheet
// and starting it over are changed on Keyrook's own page, once for every app.
const ACCOUNT_PAGE = __KEYROOK_ACCOUNT_PAGE__;

function ManageRow({ passwordless }: { passwordless: boolean }) {
  const t = useT();
  return (
    <Row
      label={t('account.manage')}
      description={t(passwordless ? 'account.manageBodyProvider' : 'account.manageBody')}
      control={
        <a
          href={ACCOUNT_PAGE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
        >
          {t('account.manageOpen')}
          <ExternalIcon className="h-3.5 w-3.5" />
        </a>
      }
    />
  );
}

/**
 * Signing out removes the vault from this browser, so it asks once, in the
 * row: what will happen, and the button that does it.
 */
function SignOutRow() {
  const t = useT();
  const [asking, setAsking] = useState(false);
  const { busy, error, run } = useAction();
  return (
    <Row
      label={t('account.signOut')}
      description={t('account.signOutBody')}
      control={
        !asking && (
          <Button size="sm" variant="ghost" onClick={() => setAsking(true)}>
            {t('account.signOut')}
          </Button>
        )
      }
    >
      {asking ? (
        <div className="flex flex-col gap-3">
          <Callout tone="warning">{t('account.signOutConfirm')}</Callout>
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="danger" disabled={busy} onClick={() => void run(() => send({ type: 'account/signOut' }))}>
              {t('account.signOutButton')}
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setAsking(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      ) : null}
    </Row>
  );
}

const KIT_STATE = {
  none: { label: 'accountKit.none', body: 'accountKit.noneBody' },
  unchecked: { label: 'accountKit.unchecked', body: 'accountKit.uncheckedBody' },
  elsewhere: { label: 'accountKit.elsewhere', body: 'accountKit.elsewhereBody' },
  pending: { label: 'accountKit.pending', body: 'accountKit.rowBody' },
  kept: { label: 'accountKit.keptState', body: 'accountKit.rowBody' },
} as const;

/** Sent here from the popup to type the account's recovery key: the form open at once. */
const CHECK_KIT = location.hash === '#kit';

/**
 * The account's recovery key: shown again with proof of the vault's owner, as
 * the vault's own is; made anew with the account password, which the server
 * asks for — whoever sets the kit can reset the password through it. One made
 * elsewhere that no Passhold has seen open the account is asked for once.
 */
function KitRow({
  kit,
  canMake,
  secret,
  device,
  keys,
  onKit,
  onNewKit,
}: {
  kit: AccountView['kit'];
  /** A new kit takes the account password; an account with no password makes one on the account's page. */
  canMake: boolean;
  secret: VaultSecret;
  device: DeviceCredential | null;
  keys: SecurityKey[];
  onKit: (key: string, noPassword?: boolean) => void;
  /** A new key drawn and shown, to be saved and typed back before the password sets it. */
  onNewKit: () => Promise<void>;
}) {
  const t = useT();
  const [mode, setMode] = useState<'show' | 'check' | null>(kit === 'unchecked' && CHECK_KIT ? 'check' : null);
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);
  const proof = useProof({ secret, device, keys });
  const { busy, error, setError, run } = useAction();
  const held = kit === 'pending' || kit === 'kept';
  const ready = !busy && (mode === 'show' ? proof.ready : typed.trim().length > 0);

  const close = () => {
    setMode(null);
    setTyped('');
    proof.reset();
    setError(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!mode || !ready) return;
    void run(async () => {
      if (mode === 'check') {
        await send({ type: 'account/checkKit', recoveryKey: typed });
        close();
        setChecked(true);
        return;
      }
      const { recoveryKey } = await send({ type: 'account/showKit', proof: await proof.get() });
      close();
      onKit(recoveryKey);
    });
  };

  return (
    <Row
      label={
        <span className="flex items-center">
          <StateDot good={kit === 'kept' || kit === 'elsewhere'} />
          {t(KIT_STATE[kit].label)}
        </span>
      }
      // An account with no password: the key lets a computer in, it sets no password.
      description={!canMake && KIT_STATE[kit].body === 'accountKit.rowBody' ? t('accountKit.rowBodyNoPassword') : t(KIT_STATE[kit].body)}
      control={
        !mode && (
          <>
            {kit === 'unchecked' && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setChecked(false);
                  setMode('check');
                }}
              >
                {t('accountKit.typeIt')}
              </Button>
            )}
            {held && (
              <Button size="sm" variant={kit === 'pending' ? 'primary' : 'secondary'} onClick={() => setMode('show')}>
                {t('recovery.show')}
              </Button>
            )}
            {canMake && (
              <Button size="sm" variant={kit === 'none' ? 'primary' : held || kit === 'unchecked' ? 'ghost' : 'secondary'} disabled={busy} onClick={() => void run(onNewKit)}>
                {kit === 'none' ? t('accountKit.make') : t('recovery.makeNew')}
              </Button>
            )}
          </>
        )
      }
    >
      {mode ? (
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === 'show' ? (
            proof.field
          ) : (
            <Field
              label={t('account.recoveryKey')}
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
              autoFocus
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
            />
          )}
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={!ready}>
              {mode === 'show' ? t('recovery.show') : t('recovery.check')}
            </Button>
            <Button variant="ghost" disabled={busy} onClick={close}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      ) : error ? (
        <Callout tone="danger">{error}</Callout>
      ) : checked && kit === 'kept' ? (
        <Callout tone="info">{t('accountKit.checked')}</Callout>
      ) : null}
    </Row>
  );
}

/**
 * An account with no password, opened on a new computer with Google or
 * GitHub and a passkey: the account key goes up wrapped under the passkey's
 * answer. The passkey that unlocks this vault is asked, where there is one —
 * kept by Google Password Manager, it is on every Chrome its owner signs in to.
 */
function PasskeyRow({ account, device }: { account: AccountView; device: DeviceCredential | null }) {
  const t = useT();
  const { busy, error, run } = useAction();
  const provider = account.provider ? t(PROVIDER_NAME[account.provider]) : '';

  const turnOn = () =>
    void run(async () => {
      const salt = await accountPasskeySalt();
      if (device) {
        const answer = await askPasskey([device.credentialId], salt);
        await send({ type: 'passkey/enroll', credentialId: answer.credentialId, prf: answer.first });
        return;
      }
      const { credential, accountPrf } = await enrollDevice({ email: account.email, salt });
      if (!accountPrf) {
        // Kept its bytes in the passkey instead (largeBlob): that opens a vault here, not the account elsewhere.
        forgetCredential(credential);
        throw new BackgroundError('no prf', deviceUnsupported());
      }
      await send({ type: 'passkey/enroll', credentialId: credential.credentialId, prf: accountPrf });
    });

  return (
    <Row
      label={
        <span className="flex items-center">
          <StateDot good={account.passkey} />
          {account.passkey ? t('passkey.onLabel') : t('passkey.offLabel')}
        </span>
      }
      description={t(onEdge() ? 'passkey.bodyEdge' : 'passkey.body', { provider })}
      control={
        account.passkey ? (
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => void run(() => send({ type: 'passkey/remove' }))}>
            {t('passkey.turnOff')}
          </Button>
        ) : (
          <Button size="sm" variant="primary" disabled={busy} onClick={turnOn}>
            {t('passkey.turnOn')}
          </Button>
        )
      }
    >
      {error ? <Callout tone="danger">{error}</Callout> : null}
    </Row>
  );
}

/**
 * What the account kept when it started over — Passhold's logins from before,
 * still sealed under Passhold's old key — until it lapses. The old account
 * password or the old recovery key opens it; what it holds is joined with
 * this vault's logins, as a backup's are.
 */
function KeptRows() {
  const [kept, setKept] = useState<ArchiveView[]>([]);
  useEffect(() => {
    void send({ type: 'account/archives' }).then(setKept, () => setKept([]));
  }, []);
  return (
    <>
      {kept.map((archive) => (
        <KeptRow key={archive.id} archive={archive} />
      ))}
    </>
  );
}

function KeptRow({ archive }: { archive: ArchiveView }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState('');
  const [added, setAdded] = useState<number | null>(null);
  const { busy, error, setError, run } = useAction();
  const until = new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium' }).format(archive.expiresAt);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!secret || busy) return;
    void run(async () => {
      const done = await send({ type: 'account/openArchive', id: archive.id, secret });
      setSecret('');
      setOpen(false);
      setAdded(done.added);
    });
  };

  return (
    <Row
      label={
        <span className="flex items-center">
          <StateDot good={false} />
          {t('kept.title', { count: archive.logins })}
        </span>
      }
      description={t('kept.body', { date: until })}
      control={
        !open && (
          <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
            {t('kept.open')}
          </Button>
        )
      }
    >
      {open ? (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-[13px] font-medium">
            {t('kept.secret')}
            <PasswordInput value={secret} onChange={(event) => setSecret(event.target.value)} />
          </label>
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={!secret || busy}>
              {t('kept.open')}
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                setSecret('');
                setError(null);
              }}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      ) : added !== null ? (
        <Callout tone="info">{added > 0 ? t('kept.done', { count: added }) : t('kept.nothingNew')}</Callout>
      ) : null}
    </Row>
  );
}
