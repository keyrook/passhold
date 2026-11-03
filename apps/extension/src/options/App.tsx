import { useEffect, useMemo, useState, type ComponentType, type SVGProps } from 'react';
import { checkup } from '@passhold/core';
import { useT } from '../i18n/react.js';
import type { MessageKey } from '../i18n/locales/en.js';
import { APP_NAME } from '../lib/name.js';
import { send } from '../lib/messaging.js';
import { useVault } from '../ui/hooks.js';
import { CloudIcon, CodeIcon, KeyIcon, LockIcon, PassholdMark, SettingsIcon, ShieldIcon, UsersIcon } from '../ui/icons.js';
import { Callout, cx } from '../ui/primitives.js';
import { RecoveryKeyScreen, type RecoveryKind } from '../popup/RecoveryKeyScreen.js';
import { UnlockScreen } from '../popup/UnlockScreen.js';
import { deviceAvailable } from '../ui/device.js';
import { setPasswordName } from '../ui/passwordName.js';
import { AccountPanel } from './AccountPanel.js';
import { BackupPanel, type BackupJob } from './BackupPanel.js';
import { FamilyPanel } from './FamilyPanel.js';
import { JoinAccount } from './JoinAccount.js';
import { GeneralPanel, RemoveVault } from './GeneralPanel.js';
import { Gate } from './Gate.js';
import { PinOffer } from './PinOffer.js';
import { NewKitScreens } from './NewKit.js';
import { StartedOverScreens, type StartedOver } from './StartOver.js';
import { PasswordsPanel, type PasswordsView } from './PasswordsPanel.js';
import { SecurityPanel } from './SecurityPanel.js';

const SOURCE = 'https://github.com/keyrook/passhold';

type Tab = 'passwords' | 'account' | 'family' | 'security' | 'general';

/**
 * Four tabs: the logins themselves (with what needs attention and the trash),
 * the account they sync with (with backups beside it), how Passhold opens,
 * and how it behaves; and a fifth once the account is in a family, for who
 * is in it and what it shares.
 */
const TABS: { id: Tab; label: MessageKey; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { id: 'passwords', label: 'nav.passwords', Icon: KeyIcon },
  { id: 'account', label: 'nav.accountSync', Icon: CloudIcon },
  { id: 'family', label: 'nav.family', Icon: UsersIcon },
  { id: 'security', label: 'nav.security', Icon: LockIcon },
  { id: 'general', label: 'nav.general', Icon: SettingsIcon },
];

/**
 * Where the address says to start. Every tab is worth a link of its own, and
 * the addresses of the tabs there were before still lead to what they held:
 * #checkup and #trash to Passwords, #backup and its jobs to the account.
 */
function fromHash(): { tab: Tab; job: BackupJob | null; view: PasswordsView } {
  const hash = location.hash.slice(1);
  const at = (tab: Tab, job: BackupJob | null = null, view: PasswordsView = 'all') => ({ tab, job, view });
  if (hash === 'recovery') return at('security');
  if (hash === 'restore' || hash === 'import' || hash === 'export') return at('account', hash);
  if (hash === 'checkup') return at('passwords', null, 'attention');
  if (hash === 'trash') return at('passwords', null, 'trash');
  if (hash === 'security' || hash === 'general' || hash === 'account' || hash === 'passwords' || hash === 'family') return at(hash);
  // Back from Google or GitHub, or signing in on a computer with no vault yet;
  // or sent from the popup to type the account's recovery key.
  if (hash === 'provider' || hash === 'signin' || hash === 'backup' || hash === 'kit') return at('account');
  return at('passwords');
}

const START = fromHash();
/** Sent here to see the recovery key again — to print it, say: asked for at once. */
const SHOW_RECOVERY = location.hash === '#recovery';

export function App() {
  const t = useT();
  const { status } = useVault();
  const [tab, setTab] = useState<Tab>(START.tab);
  const [job, setJob] = useState<BackupJob | null>(START.job);
  const [view, setView] = useState<PasswordsView>(START.view);
  // Bumped on every click in the sidebar, so choosing the tab already open
  // goes back to its first page.
  const [visit, setVisit] = useState(0);
  // Restoring into an empty browser swaps this page for the full settings, so
  // what it did is said above both.
  const [restored, setRestored] = useState<number | null>(null);
  // A recovery key just drawn — at setup here, or by a change in Security — shown once, before anything else.
  const [shown, setShown] = useState<{ key: string; kind: RecoveryKind } | null>(null);
  // A vault just made here to open with a password or code: a PIN offered before anything else.
  const [pinOffer, setPinOffer] = useState<string | null>(null);
  const setRecoveryKey = (key: string) => setShown({ key, kind: 'vault' });
  // A start over just asked for: its recovery key and its day, before anything else.
  const [startedOver, setStartedOver] = useState<StartedOver | null>(null);
  // A new recovery key for the account, drawn and not yet set: shown, typed back, then set with the password.
  const [newKit, setNewKit] = useState<string | null>(null);
  // Asked once, before anything is drawn, so Security never shows one answer and then another.
  const [canUseDevice, setCanUseDevice] = useState<boolean | null>(null);
  useEffect(() => void deviceAvailable().then(setCanUseDevice), []);
  const data = status?.state === 'unlocked' ? status.data : null;
  const linked = status?.state === 'unlocked' && status.account !== null;
  const attention = useMemo(() => (data ? checkup(data, Date.now(), linked).issues > 0 : false), [data, linked]);

  useEffect(() => {
    document.title = `${t('settings.title')} · ${APP_NAME}`;
  }, [t]);

  useEffect(() => {
    if (status?.state === 'uninitialized') setRestored(null);
  }, [status?.state]);

  const go = (next: Tab, nextJob: BackupJob | null = null, nextView: PasswordsView = 'all') => {
    setTab(next);
    setJob(nextJob);
    setView(nextView);
    setVisit((count) => count + 1);
    history.replaceState(null, '', `#${nextJob ?? next}`);
  };

  // Until the worker answers, a blank page: nothing drawn that the answer could swap.
  if (!status || canUseDevice === null) return <div className="min-h-screen" />;
  if (status.state !== 'uninitialized') setPasswordName(status.passwordName);

  if ((shown || startedOver || newKit) && status.state === 'unlocked') {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10 print:block print:max-w-none print:p-0">
        <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/60 print:border-0">
          {shown ? (
            <RecoveryKeyScreen recoveryKey={shown.key} kind={shown.kind} onDone={() => setShown(null)} onPrint={() => window.print()} framed />
          ) : newKit ? (
            <NewKitScreens recoveryKey={newKit} onDone={() => setNewKit(null)} onPrint={() => window.print()} />
          ) : (
            <StartedOverScreens done={startedOver!} onDone={() => setStartedOver(null)} onPrint={() => window.print()} />
          )}
        </div>
      </div>
    );
  }

  if (pinOffer && status.state === 'unlocked') {
    return (
      <Gate intro={false}>
        <PinOffer secret={pinOffer} onDone={() => setPinOffer(null)} />
      </Gate>
    );
  }

  if (status.state === 'locked') {
    return (
      <Gate intro={false} after={<CannotOpen />}>
        <UnlockScreen secret={status.secret} pin={status.pin} device={status.device} keys={status.keys} compact />
      </Gate>
    );
  }

  if (status.state !== 'unlocked') {
    // Passhold starts with an account: signed in, or made, then the vault.
    return (
      <Gate>
        <JoinAccount
          canUseDevice={canUseDevice}
          onOpenedWith={setPinOffer}
          // Signed in, the vault opens on the account it came with — chosen
          // now, while nothing is drawn, so it never shows another tab first.
          onJoined={() => {
            setTab('account');
            setJob(null);
            history.replaceState(null, '', '#account');
          }}
        />
      </Gate>
    );
  }

  const count = [...status.data.items, ...status.data.wallet].filter((item) => item.deletedAt === null).length;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl gap-12 px-6 py-10">
      <aside className="sticky top-10 flex h-[calc(100vh-5rem)] w-56 shrink-0 flex-col">
        <div className="mb-8 flex items-center gap-3 px-3">
          <PassholdMark size={32} />
          <div className="leading-tight">
            <p className="text-[14.5px] font-semibold tracking-[-0.01em]">{APP_NAME}</p>
            <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{t('vault.count', { count })}</p>
          </div>
        </div>

        <nav aria-label={t('settings.title')} className="flex flex-col gap-1">
          {TABS.filter(({ id }) => id !== 'family' || status.data.families.length > 0).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              aria-current={tab === id ? 'page' : undefined}
              // Said beside the name, not in it: the tab is still "Passwords".
              aria-description={id === 'passwords' && attention ? t('nav.needsAttention') : undefined}
              className={cx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-start text-[14px] font-medium transition-colors',
                tab === id
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200',
              )}
            >
              <Icon className={cx('h-[18px] w-[18px] shrink-0', tab === id ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-400 dark:text-neutral-500')} />
              {t(label)}
              {id === 'passwords' && attention && <span className="ms-auto h-2 w-2 rounded-full bg-yellow-500" aria-hidden="true" data-testid="nav-attention" />}
            </button>
          ))}
        </nav>

        {/* What someone deciding whether to trust this wants to know, always in sight. */}
        <div className="mt-auto flex flex-col gap-1.5 px-3 text-[12px] text-neutral-600 dark:text-neutral-400">
          <p className="flex items-center gap-1.5 font-medium text-neutral-600 dark:text-neutral-300">
            <ShieldIcon className="h-4 w-4 text-green-700 dark:text-green-300" />
            {t('settings.encryptedHere')}
          </p>
          <a href={SOURCE} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-neutral-900 hover:underline dark:hover:text-neutral-200">
            <CodeIcon className="h-4 w-4" />
            {t('settings.source')}
          </a>
          <p>{t('settings.about', { version: chrome.runtime.getManifest().version_name ?? chrome.runtime.getManifest().version })}</p>
        </div>
      </aside>

      <main key={visit} className="min-w-0 max-w-[720px] flex-1 pb-16">
        {restored !== null && (
          <div className="mb-6">
            <Callout tone="info">{t('settings.restoreNew', { count: restored })}</Callout>
          </div>
        )}
        {tab === 'passwords' && (
          <PasswordsPanel
            data={status.data}
            secret={status.secret}
            device={status.device}
            linked={linked}
            view={view}
            onView={(next) => {
              setView(next);
              history.replaceState(null, '', `#${next === 'all' ? 'passwords' : next === 'attention' ? 'checkup' : 'trash'}`);
            }}
            onBackUp={() => go('account', 'backup')}
            onSecurity={() => go('security')}
          />
        )}
        {tab === 'security' && (
          <SecurityPanel
            data={status.data}
            secret={status.secret}
            device={status.device}
            keys={status.keys}
            canUseDevice={canUseDevice}
            linked={linked}
            onRecoveryKey={setRecoveryKey}
            showRecovery={SHOW_RECOVERY && visit === 0}
          />
        )}
        {tab === 'account' && (
          <>
            {/* A backup job takes the page; otherwise the account, and the backups below it. */}
            {!job && (
              <AccountPanel account={status.account} secret={status.secret} device={status.device} keys={status.keys} onKit={(key, noPassword) => setShown({ key, kind: noPassword ? 'accountNoPassword' : 'account' })}
                onStartedOver={setStartedOver}
                onNewKit={async () => setNewKit((await send({ type: 'account/draftKit' })).recoveryKey)}
              />
            )}
            <BackupPanel
              data={status.data}
              secret={status.secret}
              device={status.device}
              keys={status.keys}
              job={job}
              onJob={(next) => {
                setJob(next);
                history.replaceState(null, '', `#${next ?? 'account'}`);
              }}
              onNew={setRestored}
            />
          </>
        )}
        {tab === 'family' && <FamilyPanel data={status.data} me={status.account?.accountId ?? null} passwordless={status.account?.passwordless ?? false} />}
        {tab === 'general' && <GeneralPanel data={status.data} />}
      </main>
    </div>
  );
}

/**
 * Under a locked vault, the way out when nothing opens it: removing it from
 * this browser. Behind a quiet link — beside the unlock button, a red box
 * reads as the next step, not the last resort.
 */
function CannotOpen() {
  const t = useT();
  const [open, setOpen] = useState(false);
  if (open) return <RemoveVault />;
  return (
    <button type="button" onClick={() => setOpen(true)} className="self-center text-[13px] text-neutral-600 hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-neutral-200">
      {t('settings.cannotOpen')}
    </button>
  );
}
