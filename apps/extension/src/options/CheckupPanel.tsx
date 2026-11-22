import { useMemo, useState } from 'react';
import { apiService, changePasswordUrl, checkup, type ApiKeyItem, type DeviceCredential, type LoginItem, type VaultData, type VaultSecret } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { DEVICE_METHOD, deviceKind } from '../ui/device.js';
import { ExternalIcon, ShieldCheckIcon, WarningIcon } from '../ui/icons.js';
import { send } from '../lib/messaging.js';
import { usePlan } from '../ui/plan.js';
import { useAction } from '../ui/hooks.js';
import { Button, Callout, cx } from '../ui/primitives.js';
import { SiteMark } from '../ui/SiteMark.js';
import { expiryWords, walletName } from '../ui/wallet.js';
import { ApiKeyMark } from '../ui/WalletMark.js';
import { Muted, Row, Section, StateDot } from './Section.js';

/** A login with the way to change its password on the site itself. */
function LoginRow({ item, note }: { item: LoginItem; note?: string }) {
  const t = useT();
  const change = changePasswordUrl(item);
  return (
    <Row
      leading={<SiteMark title={item.title} urls={item.urls} size={32} />}
      label={item.title || item.username}
      description={[item.title && item.username ? item.username : '', note ?? ''].filter(Boolean).join(' · ') || undefined}
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

/** An API key running out, with the way to its service's own page for a new one. */
function KeyRow({ item }: { item: ApiKeyItem }) {
  const t = useT();
  const replace = apiService(item.service)?.replace;
  return (
    <Row
      leading={<ApiKeyMark service={item.service} size={32} />}
      label={walletName(item, t)}
      description={expiryWords(item, t)}
      control={
        replace && (
          <a
            href={replace}
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
 * The breach check, run only when asked: each password's SHA-1 is made in
 * the service worker, and only its first five characters go to Keyrook, which
 * asks Pwned Passwords; the rest is matched there, on this computer.
 */
function Breach({ data }: { data: VaultData }) {
  const t = useT();
  const plan = usePlan();
  const [exposed, setExposed] = useState<{ item: LoginItem; count: number }[] | null>(null);
  const { busy, error, run } = useAction();
  const check = () =>
    void run(async () => {
      const answer = await send({ type: 'checkup/breach' });
      setExposed(answer.exposed.flatMap(({ id, count }) => data.items.filter((item) => item.id === id).map((item) => ({ item, count }))));
    });
  return (
    <Section
      title={t('checkup.breach')}
      description={t('checkup.breachBody')}
      action={
        // No button on a plan without it: said here, before anything is pressed.
        plan.breach && (
          <Button size="sm" variant="secondary" disabled={busy} onClick={check} data-testid="breach-check">
            {t('checkup.breachCheck')}
          </Button>
        )
      }
    >
      {!plan.breach && <Row label={<Muted>{t('checkup.breachPremium')}</Muted>} />}
      {error && (
        <div className="px-4 py-3">
          <Callout tone="danger">{error}</Callout>
        </div>
      )}
      {exposed?.length === 0 && (
        <Row
          label={
            <span className="flex items-center">
              <StateDot good />
              {t('checkup.breachNone')}
            </span>
          }
        />
      )}
      {exposed?.map(({ item, count }) => <LoginRow key={item.id} item={item} note={t('checkup.breachSeen', { count: count.toLocaleString(t.locale) })} />)}
    </Section>
  );
}

/**
 * What needs doing, in Passwords under "Needs attention". Everything is worked
 * out here from the vault, and nothing is sent anywhere to find it — but the
 * breach check, which its owner runs.
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
  const plan = usePlan();
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

      {result.expiring.length > 0 && (
        <Section title={t('checkup.apiKeys')} description={t('checkup.apiKeysBody')}>
          {result.expiring.map((item) => (
            <KeyRow key={item.id} item={item} />
          ))}
        </Section>
      )}

      {/* Nothing of a paid plan shows until plans are sold, not even that it is part of one. */}
      {linked && (plan.breach || plan.offered) && <Breach data={data} />}

      {/* Signed in, the breach check is above: the limits it states are those of a Passhold with no account. */}
      {!linked && <Muted>{t('checkup.limits')}</Muted>}
    </>
  );
}
