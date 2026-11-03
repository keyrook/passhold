import { useEffect, useRef, useState, type FormEvent } from 'react';
import { accountPasskeySalt, MIN_MASTER_PASSWORD } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { send } from '../lib/messaging.js';
import { onEdge } from '../lib/name.js';
import { DEVICE_METHOD, deviceKind, enrollDevice } from '../ui/device.js';
import { useAction } from '../ui/hooks.js';
import { FingerprintIcon } from '../ui/icons.js';
import { Button, Callout, cx } from '../ui/primitives.js';
import { Strength } from '../ui/Strength.js';
import { Brand } from './Header.js';
import { PasswordInput } from './PasswordInput.js';

/**
 * Making the vault. Where the device has an unlock Passhold can use, that is
 * the way offered first: nothing to make up or remember, and a recovery key
 * drawn for the day the device cannot. A master password is the other way,
 * one click off. Someone who already has Passhold elsewhere signs in instead.
 *
 * `joined`: signed in already (`account/join`), so this is the last step —
 * how this browser opens — and the account, not a key to put away, is the
 * way back.
 */
export function SetupScreen({
  canUseDevice,
  onRecoveryKey,
  onSignIn,
  joined = null,
  passkey = false,
  accountPassword = null,
  onJoinCancel,
  onOpenedWith,
  framed = false,
}: {
  canUseDevice: boolean;
  /** The recovery key of a vault just made with the device, to be shown once. */
  onRecoveryKey: (key: string) => void;
  /** Sign in to a Keyrook account instead of starting empty. */
  onSignIn?: () => void;
  /** The account signed in to, when this is the last step of signing in. */
  joined?: string | null;
  /**
   * An account with no password: the passkey made here holds its key too, so
   * a new computer opens it with Google or GitHub and a touch.
   */
  passkey?: boolean;
  /**
   * The account's password, just typed to sign in: where there is no
   * fingerprint, or by choice, the vault opens with it — one password for
   * both, nothing new to make up.
   */
  accountPassword?: string | null;
  onJoinCancel?: () => void;
  /**
   * Told the password or code a vault is about to be made with — before it is,
   * so a page that offers a PIN next has it ready when the vault opens, never
   * after a glimpse of what lies past it.
   */
  onOpenedWith?: (secret: string | null) => void;
  framed?: boolean;
}) {
  const t = useT();
  // An account with no password, on a computer with no fingerprint reader: a
  // passkey is still tried first — Google Password Manager keeps one behind its
  // own PIN, which Google, not this computer, stops anyone guessing. A code for
  // this computer is the way only when no passkey can be made here.
  const passkeyFirst = !canUseDevice && joined !== null && accountPassword === null;
  const [withPassword, setWithPassword] = useState(!canUseDevice && !passkeyFirst);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [understood, setUnderstood] = useState(false);
  const { busy, error, setError, run } = useAction();
  const method = passkeyFirst ? t('device.method.passkey') : t(DEVICE_METHOD[deviceKind()]);

  const long = [...password].length >= MIN_MASTER_PASSWORD;
  const same = password === confirm;
  // Signed in, a forgotten master password is not the end: the account brings every login back.
  const ready = long && same && (understood || joined !== null) && !busy;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    // Signed in to an account with no password, what is typed here is a code for this computer alone.
    if (ready) void run(() => withSecret(password, () => send({ type: 'vault/create', password, join: joined !== null, ...(joined !== null ? { passwordIs: 'code' as const } : {}) })));
  };

  /** Made with a password or a code: said first, and taken back if making it failed. */
  const withSecret = async (secret: string, make: () => Promise<unknown>) => {
    onOpenedWith?.(secret);
    try {
      await make();
    } catch (error) {
      onOpenedWith?.(null);
      throw error;
    }
  };

  const withAccountPassword = () =>
    void run(() => withSecret(accountPassword!, () => send({ type: 'vault/create', password: accountPassword!, join: true, passwordIs: 'account' })));

  // Nothing quicker on this computer, and the account's password at hand: no step at all.
  const opened = useRef(false);
  const straightIn = joined !== null && accountPassword !== null && !canUseDevice;
  useEffect(() => {
    if (!straightIn || opened.current) return;
    opened.current = true;
    withAccountPassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [straightIn]);

  const createWithDevice = () =>
    void run(async () => {
      const account = joined !== null && passkey ? { email: joined, salt: await accountPasskeySalt() } : undefined;
      const { credential, prf, accountPrf } = await enrollDevice(account);
      const { recoveryKey } = await send({ type: 'vault/createWithDevice', credential, prf, join: joined !== null, accountPrf });
      // Signed in, the account brings everything back; its key is the one to keep.
      if (joined === null) onRecoveryKey(recoveryKey);
    });

  const title = joined !== null ? t('join.lockTitle', { email: joined }) : t('setup.title');
  // Someone with Passhold elsewhere is second only to starting fresh.
  const signIn = joined === null && onSignIn && (
    <Button variant="secondary" className="w-full" onClick={onSignIn}>
      {t('setup.signIn')}
    </Button>
  );
  const elsewhere =
    joined !== null ? (
      <Button variant="ghost" className="w-full" disabled={busy} onClick={onJoinCancel}>
        {t('join.cancel')}
      </Button>
    ) : (
      // A file chooser closes the popup on some systems, so restoring happens in the settings tab.
      <Button variant="ghost" className="w-full" onClick={() => void chrome.tabs.create({ url: chrome.runtime.getURL('options.html#restore') })}>
        {t('setup.restore')}
      </Button>
    );

  if (straightIn) {
    return (
      <div className={cx('flex flex-col gap-4 p-5', !framed && 'min-h-[560px]')}>
        {!framed && <Brand />}
        <h1 className="pt-2 text-lg font-semibold">{title}</h1>
        {error ? <Callout tone="danger">{error}</Callout> : <p className="text-[13px] text-neutral-600 dark:text-neutral-400">{t('join.opening')}</p>}
        {elsewhere}
      </div>
    );
  }

  if (!withPassword) {
    return (
      <div className={cx('flex flex-col gap-4 p-5', !framed && 'min-h-[560px]')}>
        {!framed && <Brand />}
        <div className="flex flex-col gap-1.5 pt-2">
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            {joined !== null ? t('join.lockBodyDevice', { method }) : t('setup.deviceBody', { method })}
          </p>
        </div>
        {(deviceKind() === 'mac' || passkeyFirst) && (
          <p className="rounded-xl bg-neutral-100 px-3 py-2.5 text-[12.5px] leading-relaxed text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {t(onEdge() ? 'setup.deviceWhereMacEdge' : 'setup.deviceWhereMac')}
          </p>
        )}
        {error && <Callout tone="danger">{error}</Callout>}
        <div className={cx('flex flex-col gap-2', !framed && 'mt-auto')}>
          <Button variant="primary" className="w-full" disabled={busy} onClick={createWithDevice}>
            <FingerprintIcon className="h-[18px] w-[18px]" /> {busy ? t('setup.creating') : t('setup.createWithDevice', { method })}
          </Button>
          {signIn}
          <Button
            variant="ghost"
            className="w-full"
            disabled={busy}
            onClick={() => {
              setError(null);
              if (joined !== null && accountPassword !== null) withAccountPassword();
              else setWithPassword(true);
            }}
          >
            {joined === null ? t('setup.usePassword') : accountPassword !== null ? t('setup.useAccountPassword') : t('setup.useCode')}
          </Button>
          {elsewhere}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cx('flex flex-col gap-4 p-5', !framed && 'min-h-[560px]')}>
      {!framed && <Brand />}
      <div className="flex flex-col gap-1.5 pt-2">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{joined !== null ? t('join.lockBodyCode') : t('setup.body')}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="master" className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
          {joined !== null ? t('unlock.code') : t('setup.password')}
        </label>
        <PasswordInput id="master" autoFocus value={password} onChange={(event) => setPassword(event.target.value)} />
        <Strength password={password} />
        {password && !long && <p className="text-[12px] text-red-600 dark:text-red-300">{t('setup.tooShort', { min: MIN_MASTER_PASSWORD })}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm" className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
          {t('setup.confirm')}
        </label>
        <PasswordInput id="confirm" value={confirm} onChange={(event) => setConfirm(event.target.value)} error={Boolean(confirm) && !same} />
        {confirm && !same && <p className="text-[12px] text-red-600 dark:text-red-300">{t('setup.mismatch')}</p>}
      </div>
      {joined === null && (
        <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          <input type="checkbox" checked={understood} onChange={(event) => setUnderstood(event.target.checked)} className="mt-1 accent-brand-600" />
          {t('setup.understand')}
        </label>
      )}
      {error && <Callout tone="danger">{error}</Callout>}
      <div className={cx('flex flex-col gap-2', !framed && 'mt-auto')}>
        <Button type="submit" variant="primary" className="w-full" disabled={!ready}>
          {busy ? t('setup.creating') : t('setup.create')}
        </Button>
        {signIn}
        {(canUseDevice || passkeyFirst) && (
          <Button
            variant={joined !== null ? 'secondary' : 'ghost'}
            className="w-full"
            onClick={() => {
              setError(null);
              setWithPassword(false);
            }}
          >
            {t('setup.useDevice', { method })}
          </Button>
        )}
        {elsewhere}
      </div>
    </form>
  );
}
