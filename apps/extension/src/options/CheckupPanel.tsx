import { useMemo } from 'react';
import { changePasswordUrl, checkup, type DeviceCredential, type LoginItem, type VaultData, type VaultSecret } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { DEVICE_METHOD, deviceKind } from '../ui/device.js';
import { ExternalIcon, ShieldCheckIcon, WarningIcon } from '../ui/icons.js';
import { Button, cx } from '../ui/primitives.js';
import { SiteMark } from '../ui/SiteMark.js';
import { Muted, Row, Section, StateDot } from './Section.js';

/** A login with the way to change its password on the site itself. */
function LoginRow({ item }: { item: LoginItem }) {
  const t = useT();
  const change = changePasswordUrl(item);
  return (
    <Row
      leading={<SiteMark title={item.title} urls={item.urls} size={32} />}
      label={item.title || item.username}
      description={item.title && item.username ? item.username : undefined}
      control={
        change && (
          <a
            href={change}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
          >
            {t('checkup.change')}
            <ExternalIcon className="h-3.5 w-3.5" />
          </a>
        )
      }
    />
  );
}

/**
 * What needs doing, in Passwords under "Needs attention". Everything is worked
 * out here from the vault; nothing is sent anywhere to find it.
 */
export function CheckupPanel({
  data,
  secret,
  device,
  linked,
  onBackUp,
  onSecurity,
}: {
  data: VaultData;
  secret: VaultSecret;
  device: DeviceCredential | null;
  /** Signed in to a Keyrook account. */
  linked: boolean;
  onBackUp: () => void;
  onSecurity: () => void;
}) {
  const t = useT();
  const result = useMemo(() => checkup(data, Date.now(), linked), [data, linked]);
  const when = new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium' });
  const method = t(DEVICE_METHOD[deviceKind()]);
  // A vault with no master password, in a browser where the device was never
  // set up: every unlock asks for the recovery key.
  const deviceMissing = secret === 'recoveryKey' && !device;
  const issues = result.issues + (deviceMissing ? 1 : 0);
  const clear = issues === 0;

  return (
    <>
      <div
        className={cx(
          'mb-8 flex items-center gap-4 rounded-2xl p-5',
          clear ? 'bg-green-50 text-green-900 dark:bg-green-500/10 dark:text-green-200' : 'bg-yellow-50 text-yellow-900 dark:bg-yellow-500/10 dark:text-yellow-200',
        )}
        data-testid="checkup-summary"
      >
        {clear ? <ShieldCheckIcon className="h-8 w-8 shrink-0" /> : <WarningIcon className="h-8 w-8 shrink-0" />}
        <div>
          <p className="text-[15px] font-semibold">{clear ? t('checkup.clear') : t('checkup.issues', { count: issues })}</p>
          <p className="text-[13px] opacity-80">{clear ? t('checkup.clearBody') : t('checkup.issuesBody')}</p>
        </div>
      </div>

      {(result.recoveryKeyPending || deviceMissing) && (
        <Section title={t('checkup.access')}>
          {result.recoveryKeyPending && (
            <Row
              label={
                <span className="flex items-center">
                  <StateDot good={false} />
                  {t('recovery.pending')}
                </span>
              }
              description={t('checkup.recoveryPending', { method })}
              control={
                <Button size="sm" variant="primary" onClick={onSecurity}>
                  {t('recovery.makeNew')}
                </Button>
              }
            />
          )}
          {deviceMissing && (
            <Row
              label={
                <span className="flex items-center">
                  <StateDot good={false} />
                  {t('device.notHere', { method })}
                </span>
              }
              description={t('checkup.deviceMissing', { method })}
              control={
                <Button size="sm" variant="primary" onClick={onSecurity}>
                  {t('device.setUp')}
                </Button>
              }
            />
          )}
        </Section>
      )}

      <Section title={t('checkup.backup')}>
        <Row
          label={
            <span className="flex items-center">
              <StateDot good={result.backup === 'ok' && data.lastBackupAt !== null} />
              {data.lastBackupAt === null ? t('settings.backupNever') : t('checkup.lastBackup', { date: when.format(data.lastBackupAt) })}
            </span>
          }
          description={result.backup === 'never' ? t('checkup.backupNever') : result.backup === 'due' ? t('checkup.backupDue') : undefined}
          control={
            <Button size="sm" variant={result.backup === 'ok' ? 'secondary' : 'primary'} onClick={onBackUp}>
              {t('checkup.backUp')}
            </Button>
          }
        />
      </Section>

      <Section title={t('checkup.weak', { count: result.weak.length })} description={result.weak.length ? t('checkup.weakBody') : t('checkup.weakNone')}>
        {result.weak.length > 0 && result.weak.map((item) => <LoginRow key={item.id} item={item} />)}
      </Section>

      <Section title={t('checkup.reused', { count: result.reused.length })} description={result.reused.length ? t('checkup.reusedBody') : t('checkup.reusedNone')}>
        {result.reused.length > 0 &&
          result.reused.map((group) => (
            <div key={group[0]!.id} className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800/80">
              <p className="px-4 pt-3 text-[12px] font-medium text-neutral-600 dark:text-neutral-400">{t('checkup.sharedBy', { count: group.length })}</p>
              {group.map((item) => (
                <LoginRow key={item.id} item={item} />
              ))}
            </div>
          ))}
      </Section>

      <Muted>{t('checkup.limits')}</Muted>
    </>
  );
}
