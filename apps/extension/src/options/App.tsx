import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  AUTO_LOCK_CHOICES,
  CLIPBOARD_CHOICES,
  importCsv,
  MAX_BACKUP_BYTES,
  MIN_MASTER_PASSWORD,
  parseBackup,
  PassholdError,
  type ImportResult,
  type VaultData,
  type VaultFile,
  type VaultSettings,
} from '@passhold/core';
import { describeError } from '../i18n/errors.js';
import { LOCALE_NAMES, LOCALES } from '../i18n/locales.js';
import { useT } from '../i18n/react.js';
import { currentPreference, setLanguage, type LanguagePreference } from '../i18n/runtime.js';
import { send, type RestoreResult } from '../lib/messaging.js';
import { APP_NAME } from '../lib/name.js';
import { useAction, useVault } from '../ui/hooks.js';
import { PassholdMark } from '../ui/icons.js';
import { Button, Callout, Select, Toggle } from '../ui/primitives.js';
import { Strength } from '../ui/Strength.js';
import { currentTheme, setTheme, type ThemePreference } from '../ui/theme.js';
import { PasswordInput } from '../popup/PasswordInput.js';

function Section({ id, title, children, tone }: { id?: string; title: string; children: ReactNode; tone?: 'danger' }) {
  return (
    <section
      id={id}
      className={
        tone === 'danger'
          ? 'flex flex-col gap-3 rounded-2xl border border-red-200 bg-white p-5 dark:border-red-500/30 dark:bg-neutral-900'
          : 'flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900'
      }
    >
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Muted({ children }: { children: ReactNode }) {
  return <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{children}</p>;
}

/** Hand the person a file, as a download from this page. */
function download(name: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const today = () => new Date().toISOString().slice(0, 10);

export function App() {
  const t = useT();
  const { status } = useVault();
  // Restoring into an empty browser swaps this page for the full settings, so
  // what it did is said here, above both.
  const [restored, setRestored] = useState<number | null>(null);
  useEffect(() => {
    if (status?.state === 'uninitialized') setRestored(null);
  }, [status?.state]);

  useEffect(() => {
    document.title = `${t('settings.title')} · ${APP_NAME}`;
  }, [t]);

  // Arriving at #import or #restore from the popup: scroll there once the page is drawn.
  useEffect(() => {
    if (status && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, [status]);

  if (!status) return <div className="min-h-screen" />;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 py-10">
      <header className="flex items-center gap-3">
        <PassholdMark size={40} />
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">{t('settings.title')}</h1>
          <span className="text-[13px] text-neutral-600 dark:text-neutral-400">
            {t('settings.about', { version: chrome.runtime.getManifest().version })}
          </span>
        </div>
      </header>

      {status.state === 'locked' && <Callout tone="info">{t('settings.locked')}</Callout>}
      {restored !== null && <Callout tone="info">{t('settings.restoreNew', { count: restored })}</Callout>}

      {status.state === 'uninitialized' && <Restore merge={false} onNew={setRestored} />}

      {status.state === 'unlocked' ? <General settings={status.data.settings} /> : <Appearance />}

      {status.state === 'unlocked' && (
        <>
          <ChangePassword />
          <Backup data={status.data} />
          <Restore merge onNew={setRestored} />
          <Import data={status.data} />
          <Export />
          <NeverSave data={status.data} />
          <Trash data={status.data} />
        </>
      )}

      {status.state !== 'uninitialized' && <RemoveVault />}
    </main>
  );
}

function Appearance() {
  const t = useT();
  const [language, setLanguageChoice] = useState<LanguagePreference>(currentPreference());
  const [theme, setThemeChoice] = useState<ThemePreference>(currentTheme());
  return (
    <>
      <Select<LanguagePreference>
        label={t('settings.language')}
        value={language}
        options={[{ value: 'auto', label: t('settings.language.auto') }, ...LOCALES.map((code) => ({ value: code, label: LOCALE_NAMES[code] }))]}
        onChange={(next) => {
          setLanguageChoice(next);
          void setLanguage(next);
        }}
      />
      <Select<ThemePreference>
        label={t('settings.theme')}
        value={theme}
        options={[
          { value: 'system', label: t('settings.theme.system') },
          { value: 'light', label: t('settings.theme.light') },
          { value: 'dark', label: t('settings.theme.dark') },
        ]}
        onChange={(next) => {
          setThemeChoice(next);
          void setTheme(next);
        }}
      />
    </>
  );
}

function General({ settings }: { settings: VaultSettings }) {
  const t = useT();
  const { error, run } = useAction();
  const update = (patch: Partial<VaultSettings>) =>
    void run(() => send({ type: 'vault/mutate', mutation: { op: 'settings/update', patch } }));

  const lockLabel = (minutes: number) =>
    minutes === 0
      ? t('settings.autoLock.never')
      : minutes >= 60
        ? t('settings.autoLock.hours', { count: minutes / 60 })
        : t('settings.autoLock.minutes', { count: minutes });
  const clipboardLabel = (seconds: number) =>
    seconds === 0
      ? t('settings.clipboard.never')
      : seconds >= 60
        ? t('settings.clipboard.minutes', { count: seconds / 60 })
        : t('settings.clipboard.seconds', { count: seconds });

  return (
    <Section title={t('settings.general')}>
      <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
        <Select<number>
          label={t('settings.autoLock')}
          value={settings.autoLockMinutes}
          options={AUTO_LOCK_CHOICES.map((value) => ({ value, label: lockLabel(value) }))}
          onChange={(autoLockMinutes) => update({ autoLockMinutes })}
        />
        <Toggle label={t('settings.lockWithSystem')} checked={settings.lockWithSystem} onChange={(lockWithSystem) => update({ lockWithSystem })} />
        <Select<number>
          label={t('settings.clipboard')}
          value={settings.clearClipboardSeconds}
          options={CLIPBOARD_CHOICES.map((value) => ({ value, label: clipboardLabel(value) }))}
          onChange={(clearClipboardSeconds) => update({ clearClipboardSeconds })}
        />
        <Toggle label={t('settings.inlineButton')} checked={settings.inlineButton} onChange={(inlineButton) => update({ inlineButton })} />
        <Toggle label={t('settings.offerToSave')} checked={settings.offerToSave} onChange={(offerToSave) => update({ offerToSave })} />
        <Appearance />
      </div>
      {error && <Callout tone="danger">{error}</Callout>}
    </Section>
  );
}

function ChangePassword() {
  const t = useT();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const { busy, error, run } = useAction();
  const long = [...next].length >= MIN_MASTER_PASSWORD;
  const ready = current && long && next === confirm && !busy;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    setDone(false);
    void run(async () => {
      await send({ type: 'vault/changePassword', current, next });
      setCurrent('');
      setNext('');
      setConfirm('');
      setDone(true);
    });
  };

  return (
    <Section title={t('settings.security')}>
      <Muted>{t('settings.securityBody')}</Muted>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-[13px] font-medium">
          {t('settings.current')}
          <PasswordInput value={current} onChange={(event) => setCurrent(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium">
          {t('settings.new')}
          <PasswordInput value={next} onChange={(event) => setNext(event.target.value)} />
        </label>
        <Strength password={next} />
        {next && !long && <p className="text-[12px] text-red-600 dark:text-red-300">{t('setup.tooShort', { min: MIN_MASTER_PASSWORD })}</p>}
        <label className="flex flex-col gap-1.5 text-[13px] font-medium">
          {t('settings.confirm')}
          <PasswordInput value={confirm} onChange={(event) => setConfirm(event.target.value)} error={Boolean(confirm) && confirm !== next} />
        </label>
        {confirm && confirm !== next && <p className="text-[12px] text-red-600 dark:text-red-300">{t('setup.mismatch')}</p>}
        {error && <Callout tone="danger">{error}</Callout>}
        {done && <Callout tone="info">{t('settings.changed')}</Callout>}
        <div>
          <Button type="submit" variant="primary" disabled={!ready}>
            {t('settings.change')}
          </Button>
        </div>
      </form>
    </Section>
  );
}

function Backup({ data }: { data: VaultData }) {
  const t = useT();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const { busy, error, run } = useAction();
  const when = new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium', timeStyle: 'short' });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!password) return;
    setDone(false);
    void run(async () => {
      const { backup } = await send({ type: 'vault/backup', password });
      download(`passhold-backup-${today()}.json`, backup, 'application/json');
      setPassword('');
      setDone(true);
    });
  };

  return (
    <Section id="backup" title={t('settings.backup')}>
      <Muted>{t('settings.backupBody')}</Muted>
      <p className="text-[13px] font-medium" data-testid="last-backup">
        {data.lastBackupAt ? t('settings.backupLast', { date: when.format(data.lastBackupAt) }) : t('settings.backupNever')}
      </p>
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5 text-[13px] font-medium">
          {t('settings.current')}
          <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <Button type="submit" variant="primary" disabled={!password || busy}>
          {t('settings.backupButton')}
        </Button>
      </form>
      {done && <Callout tone="info">{t('settings.backupDone')}</Callout>}
      {error && <Callout tone="danger">{error}</Callout>}
    </Section>
  );
}

/**
 * Restoring. With no vault here the backup becomes the vault; with one
 * (`merge`), the backup's logins are added to it and nothing is removed.
 */
function Restore({ merge, onNew }: { merge: boolean; onNew: (count: number) => void }) {
  const t = useT();
  const input = useRef<HTMLInputElement>(null);
  const [chosen, setChosen] = useState<{ text: string; file: VaultFile } | null>(null);
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<RestoreResult | null>(null);
  const { busy, error, setError, run } = useAction();
  const made = new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium', timeStyle: 'short' });

  const choose = async (file: File | undefined) => {
    setChosen(null);
    setResult(null);
    setError(null);
    if (!file) return;
    try {
      // Read only to say at once whether it is a backup: the service worker
      // checks it again, and is the one that opens it.
      if (file.size > MAX_BACKUP_BYTES) throw new PassholdError('backupInvalid');
      const text = await file.text();
      setChosen({ text, file: parseBackup(text) });
    } catch (caught) {
      const { key, values } = describeError(caught);
      setError(t(key, values));
    } finally {
      if (input.current) input.current.value = '';
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!chosen || !password) return;
    void run(async () => {
      const outcome = await send({ type: 'vault/restore', backup: chosen.text, password });
      setChosen(null);
      setPassword('');
      if (outcome.mode === 'new') onNew(outcome.added);
      else setResult(outcome);
    });
  };

  return (
    <Section id="restore" title={t('settings.restoreBackup')}>
      <Muted>{merge ? t('settings.restoreBodyMerge') : t('settings.restoreBodyNew')}</Muted>
      <input
        ref={input}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(event) => void choose(event.target.files?.[0])}
        data-testid="restore-file"
      />
      <div>
        <Button onClick={() => input.current?.click()}>{t('settings.restoreChoose')}</Button>
      </div>
      {chosen && (
        <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl bg-neutral-100 p-3 dark:bg-neutral-800">
          <p className="text-[13px]">{t('settings.restoreMade', { date: made.format(chosen.file.updatedAt) })}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1.5 text-[13px] font-medium">
              {t('settings.restorePassword')}
              <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <Button type="submit" variant="primary" disabled={!password || busy}>
              {t('settings.restoreButton')}
            </Button>
          </div>
        </form>
      )}
      {result && (
        <Callout tone="info">
          {result.added || result.updated
            ? [
                result.added ? t('settings.restoreAdded', { count: result.added }) : '',
                result.updated ? t('settings.restoreUpdated', { count: result.updated }) : '',
              ]
                .filter(Boolean)
                .join(' ')
            : t('settings.restoreNothing')}
        </Callout>
      )}
      {error && <Callout tone="danger">{error}</Callout>}
    </Section>
  );
}

function Import({ data }: { data: VaultData }) {
  const t = useT();
  const input = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [imported, setImported] = useState<number | null>(null);
  const { busy, error, setError, run } = useAction();

  const choose = async (file: File | undefined) => {
    setResult(null);
    setImported(null);
    setError(null);
    if (!file) return;
    try {
      setResult(importCsv(await file.text(), data.items));
    } catch (caught) {
      const { key, values } = describeError(caught);
      setError(t(key, values));
    } finally {
      if (input.current) input.current.value = '';
    }
  };

  return (
    <Section id="import" title={t('settings.import')}>
      <Muted>{t('settings.importBody')}</Muted>
      <input ref={input} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => void choose(event.target.files?.[0])} data-testid="import-file" />
      <div>
        <Button onClick={() => input.current?.click()}>{t('settings.importChoose')}</Button>
      </div>
      {result && (
        <div className="flex flex-col gap-2 rounded-xl bg-neutral-100 p-3 text-[13px] dark:bg-neutral-800">
          {result.drafts.length ? <p>{t('settings.importFound', { count: result.drafts.length })}</p> : <p>{t('settings.importNothing')}</p>}
          {result.skipped > 0 && <p>{t('settings.importSkipped', { count: result.skipped })}</p>}
          {result.duplicates > 0 && <p>{t('settings.importDuplicates', { count: result.duplicates })}</p>}
          {result.drafts.length > 0 && (
            <div>
              <Button
                variant="primary"
                size="sm"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await send({ type: 'vault/mutate', mutation: { op: 'login/import', drafts: result.drafts } });
                    setImported(result.drafts.length);
                    setResult(null);
                  })
                }
              >
                {t('settings.importConfirm')}
              </Button>
            </div>
          )}
        </div>
      )}
      {imported !== null && (
        <Callout tone="info">
          {t('settings.importDone', { count: imported })} {t('settings.importDelete')}
        </Callout>
      )}
      {error && <Callout tone="danger">{error}</Callout>}
    </Section>
  );
}

function Export() {
  const t = useT();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const { busy, error, run } = useAction();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!password) return;
    void run(async () => {
      const { csv } = await send({ type: 'vault/exportCsv', password });
      download(`passhold-${today()}.csv`, csv, 'text/csv');
      setPassword('');
      setDone(true);
    });
  };

  return (
    <Section title={t('settings.export')}>
      <Muted>{t('settings.exportBody')}</Muted>
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5 text-[13px] font-medium">
          {t('settings.current')}
          <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <Button type="submit" disabled={!password || busy}>
          {t('settings.exportButton')}
        </Button>
      </form>
      {done && <Callout tone="info">{t('settings.exportDone')}</Callout>}
      {error && <Callout tone="danger">{error}</Callout>}
    </Section>
  );
}

function NeverSave({ data }: { data: VaultData }) {
  const t = useT();
  const { run } = useAction();
  return (
    <Section title={t('settings.neverSave')}>
      {data.neverSave.length === 0 ? (
        <Muted>{t('settings.neverSaveEmpty')}</Muted>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
          {data.neverSave.map((site) => (
            <li key={site} className="flex items-center justify-between py-2 text-sm">
              {site}
              <Button size="sm" variant="ghost" onClick={() => void run(() => send({ type: 'vault/mutate', mutation: { op: 'neverSave/remove', site } }))}>
                {t('settings.remove')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Trash({ data }: { data: VaultData }) {
  const t = useT();
  const { run } = useAction();
  const trashed = data.items.filter((item) => item.deletedAt !== null);
  return (
    <Section title={t('settings.trash')}>
      {trashed.length === 0 ? (
        <Muted>{t('settings.trashEmpty')}</Muted>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
            {trashed.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="min-w-0 truncate">
                  {item.title || item.username}
                  {item.username && item.title && <span className="text-neutral-600 dark:text-neutral-400"> · {item.username}</span>}
                </span>
                <span className="flex shrink-0 gap-1">
                  <Button size="sm" variant="ghost" onClick={() => void run(() => send({ type: 'vault/mutate', mutation: { op: 'login/restore', id: item.id } }))}>
                    {t('settings.restore')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 dark:text-red-300"
                    onClick={() => void run(() => send({ type: 'vault/mutate', mutation: { op: 'login/purge', id: item.id } }))}
                  >
                    {t('settings.deleteForever')}
                  </Button>
                </span>
              </li>
            ))}
          </ul>
          <div>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (confirm(t('settings.emptyTrashConfirm'))) void run(() => send({ type: 'vault/mutate', mutation: { op: 'trash/empty' } }));
              }}
            >
              {t('settings.emptyTrash')}
            </Button>
          </div>
        </>
      )}
    </Section>
  );
}

function RemoveVault() {
  const t = useT();
  const [typed, setTyped] = useState('');
  const { busy, error, run } = useAction();
  const word = t('settings.dangerWord');
  return (
    <Section title={t('settings.danger')} tone="danger">
      <Muted>{t('settings.dangerBody')}</Muted>
      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        {t('settings.dangerType', { word })}
        <input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-900"
          autoComplete="off"
        />
      </label>
      {error && <Callout tone="danger">{error}</Callout>}
      <div>
        <Button
          variant="danger"
          disabled={typed.trim().toLocaleLowerCase(t.locale) !== word.toLocaleLowerCase(t.locale) || busy}
          onClick={() => void run(() => send({ type: 'vault/reset' }))}
        >
          {t('settings.dangerButton')}
        </Button>
      </div>
    </Section>
  );
}
