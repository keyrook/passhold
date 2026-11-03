import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  AUTO_LOCK_CHOICES,
  CLIPBOARD_CHOICES,
  isValidPin,
  MIN_MASTER_PASSWORD,
  type DeviceCredential,
  type VaultData,
  type VaultSecret,
  type VaultSettings,
} from '@passhold/core';
import { useT } from '../i18n/react.js';
import { send, type SecurityKey } from '../lib/messaging.js';
import { onEdge } from '../lib/name.js';
import { DEVICE_METHOD, deviceKind, enrollDevice, enrollKey, forgetCredential } from '../ui/device.js';
import { KeyIcon } from '../ui/icons.js';
import { useAction } from '../ui/hooks.js';
import { Button, Callout } from '../ui/primitives.js';
import { Strength } from '../ui/Strength.js';
import { PasswordInput } from '../popup/PasswordInput.js';
import { passwordName } from '../ui/passwordName.js';
import { useProof } from '../ui/Proof.js';
import { Choice, PageHeader, Row, Section, StateDot, Switch } from './Section.js';

export function SecurityPanel({
  data,
  secret,
  device,
  keys,
  canUseDevice,
  linked,
  onRecoveryKey,
  showRecovery = false,
}: {
  data: VaultData;
  secret: VaultSecret;
  device: DeviceCredential | null;
  keys: SecurityKey[];
  canUseDevice: boolean;
  /** Signed in to a Keyrook account: the way back if the device fails. */
  linked: boolean;
  /** A recovery key to show: just drawn, or asked to be seen again. */
  onRecoveryKey: (key: string) => void;
  /** Ask for the recovery key at once: the page was opened to show it. */
  showRecovery?: boolean;
}) {
  const t = useT();
  const { error, run } = useAction();
  const update = (patch: Partial<VaultSettings>) => void run(() => send({ type: 'vault/mutate', mutation: { op: 'settings/update', patch } }));
  const { settings } = data;
  const method = t(DEVICE_METHOD[deviceKind()]);

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
    <>
      <PageHeader title={t('nav.security')} description={t('security.description')} />
      {secret === 'password' ? (
        <>
          <Section title={t('settings.security')}>
            {passwordName() === 'account' ? (
              // One password: it changes with the account, never here on its own.
              <Row label={t('security.accountPasswordTitle')} description={t('security.accountPasswordBody')} />
            ) : (
              <>
                <NewPassword secret={secret} device={device} keys={keys} mode="change" />
                {device && <SwitchToDevice device={device} keys={keys} onRecoveryKey={onRecoveryKey} />}
              </>
            )}
          </Section>
          <Section id="device" title={t('device.title', { method })} description={t('device.description')}>
            <Device on={Boolean(device)} available={canUseDevice} secret={secret} device={device} keys={keys} />
          </Section>
        </>
      ) : (
        <Section id="opens" title={t('security.opensTitle')} description={t('security.opensBody', { method })}>
          <Device on={Boolean(device)} available={canUseDevice} secret={secret} device={device} keys={keys} />
          <RecoveryKeyRow pending={data.recoveryKeyPending} linked={linked} device={device} keys={keys} onRecoveryKey={onRecoveryKey} showAtOnce={showRecovery} />
          <NewPassword secret={secret} device={device} keys={keys} mode="set" />
        </Section>
      )}
      <Section id="keys" title={t('keys.title')} description={t('keys.description')}>
        <Keys keys={keys} secret={secret} device={device} />
      </Section>
      <Section id="pin" title={t('pin.title')} description={t('pin.description')}>
        <Pin on={data.pin !== null} secret={secret} device={device} keys={keys} />
      </Section>
      <Section title={t('security.locking')}>
        <Row
          label={t('settings.autoLock')}
          control={
            <Choice<number>
              label={t('settings.autoLock')}
              value={settings.autoLockMinutes}
              options={AUTO_LOCK_CHOICES.map((value) => ({ value, label: lockLabel(value) }))}
              onChange={(autoLockMinutes) => update({ autoLockMinutes })}
            />
          }
        />
        <Row
          label={t('settings.lockWithSystem')}
          control={<Switch label={t('settings.lockWithSystem')} checked={settings.lockWithSystem} onChange={(lockWithSystem) => update({ lockWithSystem })} />}
        />
        <Row
          label={t('settings.clipboard')}
          control={
            <Choice<number>
              label={t('settings.clipboard')}
              value={settings.clearClipboardSeconds}
              options={CLIPBOARD_CHOICES.map((value) => ({ value, label: clipboardLabel(value) }))}
              onChange={(clearClipboardSeconds) => update({ clearClipboardSeconds })}
            />
          }
        />
      </Section>
      {error && <Callout tone="danger">{error}</Callout>}
    </>
  );
}

/**
 * A master password: a new one in place of the old, or one in place of the
 * recovery key. The data key is only wrapped again; no login is touched.
 */
function NewPassword({ secret, device, keys, mode }: { secret: VaultSecret; device: DeviceCredential | null; keys: SecurityKey[]; mode: 'change' | 'set' }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const proof = useProof({ secret, device, keys });
  const { busy, error, run } = useAction();
  const long = [...next].length >= MIN_MASTER_PASSWORD;
  const ready = proof.ready && long && next === confirm && !busy;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    void run(async () => {
      await send({ type: 'vault/setSecret', proof: await proof.get(), next: { kind: 'password', password: next } });
      proof.reset();
      setNext('');
      setConfirm('');
      setOpen(false);
      setDone(true);
    });
  };

  return (
    <Row
      label={mode === 'change' ? t('settings.change') : t('security.setPassword')}
      description={done ? t('settings.changed') : mode === 'change' ? t('settings.securityBody') : t('security.setPasswordBody')}
      control={
        !open && (
          <Button size="sm" onClick={() => setOpen(true)}>
            {mode === 'change' ? t('settings.changeOpen') : t('security.setPasswordOpen')}
          </Button>
        )
      }
    >
      {open && (
        <form onSubmit={submit} className="flex flex-col gap-3">
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
          {proof.field}
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={!ready}>
              {mode === 'change' ? t('settings.change') : t('security.setPasswordSave')}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      )}
    </Row>
  );
}

/** From a master password to the device alone, with a recovery key drawn for the day it cannot. */
function SwitchToDevice({ device, keys, onRecoveryKey }: { device: DeviceCredential; keys: SecurityKey[]; onRecoveryKey: (key: string) => void }) {
  const t = useT();
  const method = t(DEVICE_METHOD[deviceKind()]);
  const [open, setOpen] = useState(false);
  const proof = useProof({ secret: 'password', device, keys });
  const { busy, error, run } = useAction();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!proof.ready || busy) return;
    void run(async () => {
      const { recoveryKey } = await send({ type: 'vault/setSecret', proof: await proof.get(), next: { kind: 'recoveryKey' } });
      setOpen(false);
      if (recoveryKey) onRecoveryKey(recoveryKey);
    });
  };

  return (
    <Row
      label={t('security.dropPassword')}
      description={t('security.dropPasswordBody', { method })}
      control={
        !open && (
          <Button size="sm" onClick={() => setOpen(true)}>
            {t('security.dropPasswordOpen')}
          </Button>
        )
      }
    >
      {open && (
        <form onSubmit={submit} className="flex flex-col gap-3">
          {proof.field}
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={!proof.ready || busy}>
              {t('security.dropPasswordSave')}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      )}
    </Row>
  );
}

/**
 * Whether the page has asked for the key on its own already. Once per page:
 * the row is drawn again after the key is put away, and asking then would
 * bring the key straight back.
 */
let askedAtOnce = false;

/** The recovery key: put away or not, shown again, and a new one in its place. */
function RecoveryKeyRow({
  pending,
  linked,
  device,
  keys,
  onRecoveryKey,
  showAtOnce,
}: {
  pending: boolean;
  linked: boolean;
  device: DeviceCredential | null;
  keys: SecurityKey[];
  onRecoveryKey: (key: string) => void;
  showAtOnce: boolean;
}) {
  // Not put away, but signed in: the account brings every login back, and saying "not put away" would nag for nothing.
  const covered = pending && linked;
  const t = useT();
  const method = t(DEVICE_METHOD[deviceKind()]);
  const [atOnce] = useState(() => {
    const take = showAtOnce && !askedAtOnce;
    if (take) askedAtOnce = true;
    return take;
  });
  const [mode, setMode] = useState<'show' | 'new' | null>(atOnce ? 'show' : null);
  const proof = useProof({ secret: 'recoveryKey', device, keys });
  const { busy, error, run } = useAction();
  const asked = useRef(false);

  const go = (what: 'show' | 'new') =>
    void run(async () => {
      const shown = await proof.get();
      const { recoveryKey } =
        what === 'show'
          ? await send({ type: 'vault/showRecoveryKey', proof: shown })
          : await send({ type: 'vault/setSecret', proof: shown, next: { kind: 'recoveryKey' } });
      setMode(null);
      if (recoveryKey) onRecoveryKey(recoveryKey);
    });

  // Opened to show it, with a device to prove it: ask at once, once.
  useEffect(() => {
    if (!atOnce || !device || asked.current) return;
    asked.current = true;
    go('show');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atOnce, device]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mode && proof.ready && !busy) go(mode);
  };

  return (
    <Row
      label={
        <span className="flex items-center">
          <StateDot good={!pending || covered} />
          {covered ? t('recovery.covered') : pending ? t('recovery.pending') : t('recovery.keptState')}
        </span>
      }
      description={covered ? t('recovery.coveredBody', { method }) : t('recovery.rowBody', { method })}
      control={
        !mode && (
          <>
            <Button size="sm" variant={pending && !covered ? 'primary' : 'secondary'} onClick={() => setMode('show')}>
              {t('recovery.show')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMode('new')}>
              {t('recovery.makeNew')}
            </Button>
          </>
        )
      }
    >
      {mode ? (
        <form onSubmit={submit} className="flex flex-col gap-3">
          {proof.field}
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={!proof.ready || busy}>
              {mode === 'show' ? t('recovery.show') : t('recovery.makeNew')}
            </Button>
            <Button variant="ghost" onClick={() => setMode(null)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      ) : error ? (
        <Callout tone="danger">{error}</Callout>
      ) : null}
    </Row>
  );
}

/** Setting a PIN, changing it, or turning it off: each a new way in, or one less, so each takes proof. */
function Pin({ on, secret, device, keys }: { on: boolean; secret: VaultSecret; device: DeviceCredential | null; keys: SecurityKey[] }) {
  const t = useT();
  const [mode, setMode] = useState<'set' | 'off' | null>(null);
  const [pin, setPinValue] = useState('');
  const [again, setAgain] = useState('');
  const proof = useProof({ secret, device, keys });
  const { busy, error, setError, run } = useAction();
  const digits = (value: string) => value.replace(/\D/g, '').slice(0, 12);
  const ready = proof.ready && !busy && (mode === 'off' || (isValidPin(pin) && pin === again));

  const close = () => {
    setMode(null);
    setPinValue('');
    setAgain('');
    proof.reset();
    setError(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    void run(async () => {
      await send({ type: 'vault/setPin', proof: await proof.get(), pin: mode === 'off' ? null : pin });
      close();
    });
  };

  return (
    <Row
      label={
        <span className="flex items-center">
          <StateDot good={on} />
          {on ? t('pin.on') : t('pin.off')}
        </span>
      }
      description={secret === 'recoveryKey' ? t('pin.bodyRecovery') : t('pin.body')}
      control={
        !mode &&
        (on ? (
          <>
            <Button size="sm" onClick={() => setMode('set')}>
              {t('pin.change')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMode('off')}>
              {t('pin.turnOff')}
            </Button>
          </>
        ) : (
          <Button size="sm" variant="primary" onClick={() => setMode('set')}>
            {t('pin.setUp')}
          </Button>
        ))
      }
    >
      {mode && (
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === 'set' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                {t('pin.new')}
                <PasswordInput id="new-pin" inputMode="numeric" value={pin} onChange={(event) => setPinValue(digits(event.target.value))} />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                {t('pin.again')}
                <PasswordInput inputMode="numeric" value={again} onChange={(event) => setAgain(digits(event.target.value))} error={Boolean(again) && again !== pin} />
              </label>
            </div>
          )}
          {mode === 'set' && pin && !isValidPin(pin) && <p className="text-[12px] text-red-600 dark:text-red-300">{t('error.pinInvalid')}</p>}
          {proof.field}
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="flex gap-2">
            <Button type="submit" variant={mode === 'off' ? 'danger' : 'primary'} disabled={!ready}>
              {mode === 'off' ? t('pin.turnOff') : t('pin.save')}
            </Button>
            <Button variant="ghost" onClick={close}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      )}
    </Row>
  );
}

/**
 * The device's own unlock. Setting it up takes proof, as the PIN does: it is
 * a new way in. For a vault with a master password, turning it off takes
 * nothing; for one without, it is how the vault opens, so it stays until a
 * master password is set.
 */
function Device({
  on,
  available,
  secret,
  device,
  keys,
}: {
  on: boolean;
  available: boolean;
  secret: VaultSecret;
  device: DeviceCredential | null;
  keys: SecurityKey[];
}) {
  const t = useT();
  const method = t(DEVICE_METHOD[deviceKind()]);
  const [open, setOpen] = useState(false);
  const proof = useProof({ secret, device, keys });
  const { busy, error, setError, run } = useAction();
  const passwordless = secret === 'recoveryKey';

  const close = () => {
    setOpen(false);
    proof.reset();
    setError(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!proof.ready || busy) return;
    void run(async () => {
      // Proof first: a mistyped secret costs no fingerprint and leaves no passkey behind.
      const shown = await proof.get();
      await send({ type: 'vault/checkProof', proof: shown });
      const { credential, prf } = await enrollDevice();
      try {
        await send({ type: 'vault/setDevice', proof: shown, credential, prf });
      } catch (caught) {
        // Not kept, so not left behind in the authenticator either.
        forgetCredential(credential);
        throw caught;
      }
      close();
    });
  };

  if (!on && !available) {
    return <Row label={t('device.unavailable')} description={passwordless ? t('device.unavailableRecovery') : t('device.unavailableBody')} />;
  }

  return (
    <Row
      label={
        <span className="flex items-center">
          <StateDot good={on} />
          {passwordless ? (on ? t('device.opensWith', { method }) : t('device.notHere', { method })) : on ? t('device.on') : t('device.off')}
        </span>
      }
      description={
        <>
          {passwordless ? (on ? t('device.isTheWayIn') : t('device.setUpHere', { method })) : t('device.body')}
          {!on && deviceKind() === 'mac' && <span className="mt-1 block">{t(onEdge() ? 'device.whereMacEdge' : 'device.whereMac')}</span>}
        </>
      }
      control={
        !open &&
        (on ? (
          !passwordless && (
            <Button size="sm" variant="ghost" onClick={() => void run(() => send({ type: 'vault/removeDevice' }))}>
              {t('device.turnOff')}
            </Button>
          )
        ) : (
          <Button size="sm" variant="primary" onClick={() => setOpen(true)}>
            {t('device.setUp')}
          </Button>
        ))
      }
    >
      {/* One child or none: an empty row would still leave room for one. */}
      {open ? (
        <form onSubmit={submit} className="flex flex-col gap-3">
          {proof.field}
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={!proof.ready || busy}>
              {t('device.save', { method })}
            </Button>
            <Button variant="ghost" onClick={close}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      ) : error ? (
        <Callout tone="danger">{error}</Callout>
      ) : null}
    </Row>
  );
}

/**
 * USB security keys, each another way in beside the others and never the
 * only one: adding one takes proof, as the device does; removing one asks
 * for nothing.
 */
function Keys({ keys, secret, device }: { keys: SecurityKey[]; secret: VaultSecret; device: DeviceCredential | null }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const proof = useProof({ secret, device, keys });
  const { busy, error, setError, run } = useAction();
  const when = new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium', timeStyle: 'short' });

  const close = () => {
    setOpen(false);
    proof.reset();
    setError(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!proof.ready || busy) return;
    void run(async () => {
      // Proof first: a mistyped secret costs no PIN and no touch.
      const shown = await proof.get();
      await send({ type: 'vault/checkProof', proof: shown });
      const { credential, prf } = await enrollKey(keys);
      // Nothing to take back from the key should this fail: it keeps nothing of Passhold's.
      await send({ type: 'vault/addKey', proof: shown, credential, prf });
      close();
    });
  };

  return (
    <>
      <Row
        label={
          <span className="flex items-center">
            <StateDot good={keys.length > 0} />
            {keys.length > 0 ? t('keys.on', { count: keys.length }) : t('keys.off')}
          </span>
        }
        description={t('keys.body')}
        control={
          !open && (
            <Button size="sm" onClick={() => setOpen(true)}>
              {t('keys.add')}
            </Button>
          )
        }
      >
        {open ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            {proof.field}
            {error && <Callout tone="danger">{error}</Callout>}
            <div className="flex gap-2">
              <Button type="submit" variant="primary" disabled={!proof.ready || busy}>
                {t('keys.save')}
              </Button>
              <Button variant="ghost" onClick={close}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        ) : error ? (
          <Callout tone="danger">{error}</Callout>
        ) : null}
      </Row>
      {keys.map((key) => (
        <Row
          key={key.credentialId}
          leading={<KeyIcon className="h-[18px] w-[18px] shrink-0 text-neutral-500 dark:text-neutral-400" />}
          label={t('keys.one')}
          description={t('keys.added', { date: when.format(key.addedAt) })}
          control={
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void run(() => send({ type: 'vault/removeKey', credentialId: key.credentialId }))}>
              {t('keys.remove')}
            </Button>
          }
        />
      ))}
    </>
  );
}
