import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { DeviceCredential, VaultSecret } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { BackgroundError, send, type SecurityKey } from '../lib/messaging.js';
import { useAction, useErrorText } from '../ui/hooks.js';
import { askDevice, askKey, DEVICE_METHOD, deviceKind } from '../ui/device.js';
import { FingerprintIcon, KeyIcon, PassholdMark } from '../ui/icons.js';
import { Button, cx, Spinner } from '../ui/primitives.js';
import { passwordName } from '../ui/passwordName.js';
import { PasswordInput } from './PasswordInput.js';

/** The words for each kind of password a vault opens with. */
const WORDS = {
  master: { body: 'unlock.body', label: 'unlock.password', use: 'unlock.usePassword', forgot: 'unlock.forgotBody' },
  account: { body: 'unlock.bodyAccount', label: 'unlock.accountPassword', use: 'unlock.useAccountPassword', forgot: 'unlock.forgotBodyAccount' },
  code: { body: 'unlock.bodyCode', label: 'unlock.code', use: 'unlock.useCode', forgot: 'unlock.forgotBodyCode' },
} as const;

/**
 * The PIN when this browser still holds its copy of the key, the master
 * password otherwise — and always the choice of the password. `compact`: in a
 * card on the settings page, not filling the popup's height.
 */
export function UnlockScreen({
  secret = 'password',
  pin: pinReady = false,
  device = null,
  keys = [],
  ask = false,
  compact = false,
}: {
  /** What the vault opens with when nothing quicker can: a master password, or its recovery key. */
  secret?: VaultSecret;
  pin?: boolean;
  /** The device's unlock, offered first: drawn at once, since it was there when it was set up. */
  device?: DeviceCredential | null;
  /**
   * Security keys set up here, offered after the device. Never asked on their
   * own: a key may be in a drawer, and the prompt would stand there waiting for it.
   */
  keys?: SecurityKey[];
  /** Ask the device as soon as the screen opens: the popup, opened to get in. */
  ask?: boolean;
  compact?: boolean;
}) {
  const t = useT();
  const name = passwordName();
  const [mode, setMode] = useState<'pin' | 'password'>(pinReady ? 'pin' : 'password');
  const [entered, setEntered] = useState('');
  const [forgot, setForgot] = useState(false);
  const { busy, error, setError, run } = useAction();
  const errorText = useErrorText();
  const [asking, setAsking] = useState<'device' | 'key' | null>(null);
  const asked = useRef(false);

  // The tries ran out, or the browser was restarted: the PIN is gone, but the
  // reason it gave is still worth reading while the password is typed.
  useEffect(() => {
    if (!pinReady) setMode('password');
  }, [pinReady]);

  const switchTo = (next: 'pin' | 'password') => {
    setMode(next);
    setEntered('');
    setError(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!entered || busy) return;
    void run(async () => {
      try {
        await send(mode === 'pin' ? { type: 'vault/unlockPin', pin: entered } : { type: 'vault/unlock', password: entered });
      } finally {
        if (mode === 'pin') setEntered('');
      }
    });
  };

  const field = mode === 'pin' ? 'pin' : 'master';
  const method = t(DEVICE_METHOD[deviceKind()]);
  const unlockWith = (way: 'device' | 'key', quietly = false) => {
    if ((way === 'device' ? !device : keys.length === 0) || asking) return;
    setAsking(way);
    setError(null);
    // Not through `run`: the PIN and the password stay usable while the
    // device or a key is asked, for whoever would rather type.
    void (async () => {
      try {
        if (way === 'device') await send({ type: 'vault/unlockDevice', prf: await askDevice(device!) });
        else await send({ type: 'vault/unlockDevice', ...(await askKey(keys)) });
      } catch (caught) {
        // Dismissing a prompt nobody pressed a button for is no error to show:
        // the button and the PIN are right there.
        if (!(quietly && caught instanceof BackgroundError && caught.key === 'error.deviceCancelled')) setError(errorText(caught));
      } finally {
        setAsking(null);
      }
    })();
  };

  // Once per screen, however often it draws: one prompt, never a second behind it.
  useEffect(() => {
    if (!ask || !device || asked.current) return;
    asked.current = true;
    unlockWith('device', true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask, device]);
  return (
    <form onSubmit={submit} className={cx('flex flex-col items-center gap-4 px-6 pb-6', compact ? 'pt-10' : 'min-h-[560px] pt-16')}>
      <PassholdMark size={72} className="kr-boil" />
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-lg font-semibold">{t('unlock.title')}</h1>
        <p className="text-[13px] text-neutral-600 dark:text-neutral-400">
          {device ? t('unlock.deviceBody', { method }) : keys.length > 0 ? t('unlock.keyBody') : mode === 'pin' ? t('unlock.pinBody') : secret === 'recoveryKey' ? t('unlock.recoveryBody') : t(WORDS[name].body)}
        </p>
      </div>
      {(device || keys.length > 0) && (
        <>
          {device && (
            <Button variant="primary" className="mt-2 w-full" disabled={asking !== null} onClick={() => unlockWith('device')}>
              {asking === 'device' ? <Spinner /> : <FingerprintIcon className="h-[18px] w-[18px]" />} {t('unlock.device', { method })}
            </Button>
          )}
          {keys.length > 0 && (
            <Button variant={device ? 'secondary' : 'primary'} className={cx('w-full', !device && 'mt-2')} disabled={asking !== null} onClick={() => unlockWith('key')}>
              {asking === 'key' ? <Spinner /> : <KeyIcon className="h-[18px] w-[18px]" />} {t('unlock.key')}
            </Button>
          )}
          <div className="flex w-full items-center gap-3 text-[12px] text-neutral-500" aria-hidden="true">
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            {t('unlock.or')}
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </>
      )}
      <div className={cx('flex w-full flex-col gap-1.5', !device && keys.length === 0 && 'pt-2')}>
        <label htmlFor={field} className="sr-only">
          {mode === 'pin' ? t('unlock.pin') : secret === 'recoveryKey' ? t('unlock.recoveryKey') : t(WORDS[name].label)}
        </label>
        <PasswordInput
          key={field}
          id={field}
          autoFocus
          inputMode={mode === 'pin' ? 'numeric' : undefined}
          maxLength={mode === 'pin' ? 12 : undefined}
          placeholder={mode === 'pin' ? t('unlock.pin') : secret === 'recoveryKey' ? t('unlock.recoveryKey') : t(WORDS[name].label)}
          value={entered}
          onChange={(event) => setEntered(mode === 'pin' ? event.target.value.replace(/\D/g, '') : event.target.value)}
          error={Boolean(error)}
        />
        {error && (
          <p role="alert" className="text-[12px] text-red-600 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" variant={device || keys.length > 0 ? 'secondary' : 'primary'} className="w-full" disabled={!entered || busy}>
        {busy ? (
          <>
            <Spinner /> {t('unlock.unlocking')}
          </>
        ) : (
          t('unlock.submit')
        )}
      </Button>
      {pinReady && (
        <button
          type="button"
          onClick={() => switchTo(mode === 'pin' ? 'password' : 'pin')}
          className="text-[13px] text-brand-600 hover:underline dark:text-brand-300"
        >
          {mode === 'pin' ? (secret === 'recoveryKey' ? t('unlock.useRecoveryKey') : t(WORDS[name].use)) : t('unlock.usePin')}
        </button>
      )}
      <div className={cx('flex flex-col items-center gap-2 text-center', compact ? 'pt-4' : 'mt-auto')}>
        <button type="button" onClick={() => setForgot((value) => !value)} className="text-[13px] text-brand-600 hover:underline dark:text-brand-300">
          {secret === 'recoveryKey' ? t('unlock.lost') : t('unlock.forgot')}
        </button>
        {forgot && (
          <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            {secret === 'recoveryKey' ? t('unlock.forgotBodyRecovery') : t(WORDS[name].forgot)}
          </p>
        )}
      </div>
    </form>
  );
}
