import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  importFile,
  MAX_BACKUP_BYTES,
  parseBackup,
  PassholdError,
  secretOf,
  type DeviceCredential,
  type ImportResult,
  type VaultData,
  type VaultFile,
  type VaultSecret,
  type WalletDraft,
} from '@passhold/core';
import { describeError } from '../i18n/errors.js';
import type { MessageKey } from '../i18n/locales/en.js';
import { useT } from '../i18n/react.js';
import { send, type RestoreResult, type SecurityKey } from '../lib/messaging.js';
import { useAction } from '../ui/hooks.js';
import { BackupIcon, DownloadIcon, ExportIcon, ExternalIcon, ImportIcon } from '../ui/icons.js';
import { Button, Callout } from '../ui/primitives.js';
import { PasswordInput } from '../popup/PasswordInput.js';
import { useProof } from '../ui/Proof.js';
import { JobRow, Muted, Section, StateDot, SubpageHeader } from './Section.js';

export type BackupJob = 'backup' | 'restore' | 'import' | 'export';

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

function useWhen() {
  const t = useT();
  return new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium', timeStyle: 'short' });
}

/** A form inside a card. */
export function Card({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 p-4">{children}</div>;
}

/**
 * Four jobs, under the account in "Account & sync": a backup, bringing one
 * back, and the plain-text ways in and out. Opened from the popup or the
 * checkup, it goes straight to the one asked for.
 */
export function BackupPanel({
  data,
  secret,
  device,
  keys,
  job,
  onJob,
  onNew,
}: {
  data: VaultData;
  secret: VaultSecret;
  device: DeviceCredential | null;
  keys: SecurityKey[];
  job: BackupJob | null;
  onJob: (job: BackupJob | null) => void;
  onNew: (count: number) => void;
}) {
  const t = useT();
  const when = useWhen();
  const back = () => onJob(null);

  if (job === 'backup') {
    return (
      <>
        <SubpageHeader
          title={t('settings.backup')}
          description={secret === 'recoveryKey' ? t('settings.backupBodyRecovery') : t('settings.backupBody')}
          onBack={back}
        />
        <Backup data={data} secret={secret} device={device} keys={keys} />
      </>
    );
  }
  if (job === 'restore') {
    return (
      <>
        <SubpageHeader title={t('settings.restoreBackup')} description={t('settings.restoreBodyMerge')} onBack={back} />
        <Restore merge onNew={onNew} />
      </>
    );
  }
  if (job === 'import') {
    return (
      <>
        <SubpageHeader title={t('settings.import')} description={t('settings.importBody')} onBack={back} />
        <Import data={data} />
      </>
    );
  }
  if (job === 'export') {
    return (
      <>
        <SubpageHeader title={t('settings.export')} description={t('settings.exportBody')} onBack={back} />
        <Export secret={secret} device={device} keys={keys} />
      </>
    );
  }

  return (
    <>
      <Section title={t('nav.backup')} description={t('backup.description')}>
        <JobRow
          Icon={DownloadIcon}
          title={t('settings.backup')}
          body={t('backup.backupRow')}
          onClick={() => onJob('backup')}
          status={
            <>
              <StateDot good={data.lastBackupAt !== null} />
              {data.lastBackupAt ? t('settings.backupLast', { date: when.format(data.lastBackupAt) }) : t('settings.backupNever')}
            </>
          }
        />
        <JobRow Icon={BackupIcon} title={t('settings.restoreBackup')} body={t('backup.restoreRow')} onClick={() => onJob('restore')} />
        <JobRow Icon={ImportIcon} title={t('settings.import')} body={t('backup.importRow')} onClick={() => onJob('import')} />
        <JobRow Icon={ExportIcon} title={t('settings.export')} body={t('backup.exportRow')} tone="warning" onClick={() => onJob('export')} />
      </Section>
    </>
  );
}

function Backup({ data, secret, device, keys }: { data: VaultData; secret: VaultSecret; device: DeviceCredential | null; keys: SecurityKey[] }) {
  const t = useT();
  const when = useWhen();
  const proof = useProof({ secret, device, keys });
  const [done, setDone] = useState(false);
  const { busy, error, run } = useAction();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!proof.ready || busy) return;
    setDone(false);
    void run(async () => {
      const { backup } = await send({ type: 'vault/backup', proof: await proof.get() });
      download(`passhold-backup-${today()}.json`, backup, 'application/json');
      proof.reset();
      setDone(true);
    });
  };

  return (
    <Section id="backup">
      <Card>
        <p className="flex items-center text-[13px] font-medium" data-testid="last-backup">
          <StateDot good={data.lastBackupAt !== null} />
          {data.lastBackupAt ? t('settings.backupLast', { date: when.format(data.lastBackupAt) }) : t('settings.backupNever')}
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          {proof.field}
          <div>
            <Button type="submit" variant="primary" disabled={!proof.ready || busy}>
              {t('settings.backupButton')}
            </Button>
          </div>
        </form>
        {done && <Callout tone="info">{t('settings.backupDone')}</Callout>}
        {error && <Callout tone="danger">{error}</Callout>}
      </Card>
    </Section>
  );
}

/**
 * Restoring. With no vault here the backup becomes the vault; with one
 * (`merge`), the backup's logins are added to it and nothing is removed.
 */
export function Restore({ merge, onNew }: { merge: boolean; onNew: (count: number) => void }) {
  const t = useT();
  const made = useWhen();
  const input = useRef<HTMLInputElement>(null);
  const [chosen, setChosen] = useState<{ text: string; file: VaultFile } | null>(null);
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<RestoreResult | null>(null);
  const { busy, error, setError, run } = useAction();

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
    <Section id="restore">
      <Card>
        {!merge && <Muted>{t('settings.restoreBodyNew')}</Muted>}
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
                {secretOf(chosen.file) === 'recoveryKey' ? t('settings.restoreRecoveryKey') : t('settings.restorePassword')}
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
              ? [result.added ? t('settings.restoreAdded', { count: result.added }) : '', result.updated ? t('settings.restoreUpdated', { count: result.updated }) : '']
                  .filter(Boolean)
                  .join(' ')
              : t('settings.restoreNothing')}
          </Callout>
        )}
        {error && <Callout tone="danger">{error}</Callout>}
      </Card>
    </Section>
  );
}

/** Where to keep the two-step codes Passhold does not: Keyrook's own authenticator. */
const AUTHENTICATOR = 'https://keyrook.com/authenticator/';

/** "3 logins, 2 passkeys, 2 cards and 1 note", in the reader's language. */
function useWhatFound() {
  const t = useT();
  return ({ drafts, passkeys, wallet }: Pick<ImportResult, 'drafts' | 'passkeys' | 'wallet'>) => {
    const of = (kind: WalletDraft['kind']) => wallet.filter((item) => item.kind === kind).length;
    const counts: [number, MessageKey][] = [
      [drafts.length, 'settings.importLogins'],
      // With the new logins, and for logins already here.
      [drafts.filter((draft) => draft.passkey).length + passkeys.length, 'settings.importPasskeys'],
      [of('card'), 'settings.importCards'],
      [of('address'), 'settings.importAddresses'],
      [of('note'), 'settings.importNotes'],
    ];
    const said = counts.filter(([count]) => count > 0).map(([count, key]) => t(key, { count }));
    return new Intl.ListFormat(t.locale, { type: 'conjunction' }).format(said);
  };
}

function Import({ data }: { data: VaultData }) {
  const t = useT();
  const whatFound = useWhatFound();
  const input = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [imported, setImported] = useState<ImportResult | null>(null);
  const { busy, error, setError, run } = useAction();

  const choose = async (file: File | undefined) => {
    setResult(null);
    setImported(null);
    setError(null);
    if (!file) return;
    try {
      setResult(await importFile(await file.text(), data));
    } catch (caught) {
      const { key, values } = describeError(caught);
      setError(t(key, values));
    } finally {
      if (input.current) input.current.value = '';
    }
  };

  const found = result ? result.drafts.length + result.passkeys.length + result.wallet.length : 0;
  // Said before the import and after it: after is when the old manager gets deleted.
  const twoFactor = (result ?? imported)?.twoFactor ?? 0;
  const passkeysLeft = (result ?? imported)?.passkeysLeft ?? 0;
  return (
    <Section id="import">
      <Card>
        <input ref={input} type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={(event) => void choose(event.target.files?.[0])} data-testid="import-file" />
        <div>
          <Button onClick={() => input.current?.click()}>{t('settings.importChoose')}</Button>
        </div>
        {result && (
          <div className="flex flex-col gap-2 rounded-xl bg-neutral-100 p-3 text-[13px] dark:bg-neutral-800">
            {found ? <p>{t('settings.importFound', { what: whatFound(result) })}</p> : <p>{t('settings.importNothing')}</p>}
            {result.skipped > 0 && <p>{t('settings.importSkipped', { count: result.skipped })}</p>}
            {result.duplicates > 0 && <p>{t('settings.importDuplicates', { count: result.duplicates })}</p>}
            {found > 0 && (
              <div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await send({ type: 'vault/mutate', mutation: { op: 'import', logins: result.drafts, passkeys: result.passkeys, wallet: result.wallet } });
                      setImported(result);
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
        {imported && (
          <Callout tone="info">
            {t('settings.importDone', { what: whatFound(imported) })} {t('settings.importDelete')}
          </Callout>
        )}
        {passkeysLeft > 0 && (
          <Callout tone="warning">
            <p>{t('settings.importPasskeysLeft', { count: passkeysLeft })}</p>
          </Callout>
        )}
        {twoFactor > 0 && (
          <Callout tone="warning">
            <p>{t('settings.importTwoFactor', { count: twoFactor })}</p>
            <a href={AUTHENTICATOR} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 font-medium underline underline-offset-2">
              {t('settings.importAuthenticator')}
              <ExternalIcon className="h-3.5 w-3.5" />
            </a>
          </Callout>
        )}
        {error && <Callout tone="danger">{error}</Callout>}
      </Card>
    </Section>
  );
}

function Export({ secret, device, keys }: { secret: VaultSecret; device: DeviceCredential | null; keys: SecurityKey[] }) {
  const t = useT();
  const proof = useProof({ secret, device, keys });
  const [done, setDone] = useState(false);
  const { busy, error, run } = useAction();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!proof.ready || busy) return;
    void run(async () => {
      const { csv } = await send({ type: 'vault/exportCsv', proof: await proof.get() });
      download(`passhold-${today()}.csv`, csv, 'text/csv');
      proof.reset();
      setDone(true);
    });
  };

  return (
    <Section id="export">
      <Card>
        <form onSubmit={submit} className="flex flex-col gap-3">
          {proof.field}
          <div>
            <Button type="submit" disabled={!proof.ready || busy}>
              {t('settings.exportButton')}
            </Button>
          </div>
        </form>
        {done && <Callout tone="info">{t('settings.exportDone')}</Callout>}
        {error && <Callout tone="danger">{error}</Callout>}
      </Card>
    </Section>
  );
}
