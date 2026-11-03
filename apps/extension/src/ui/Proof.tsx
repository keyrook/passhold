import { useState } from 'react';
import type { DeviceCredential, VaultSecret } from '@passhold/core';
import { useT } from '../i18n/react.js';
import type { Proof, SecurityKey } from '../lib/messaging.js';
import { PasswordInput } from '../popup/PasswordInput.js';
import { askDevice, askKey, DEVICE_METHOD, deviceKind } from './device.js';
import { passwordName } from './passwordName.js';
import { FingerprintIcon, KeyIcon } from './icons.js';

/**
 * Showing that the person is the vault's owner, for what an open vault alone
 * should not give: the device's unlock where this browser has one — a touch,
 * nothing to type — or else a security key set up here, and the vault's own
 * secret otherwise, or by choice.
 */
export function useProof({ secret, device, keys = [] }: { secret: VaultSecret; device: DeviceCredential | null; keys?: SecurityKey[] }) {
  const t = useT();
  const quick = device ? 'device' : keys.length > 0 ? 'key' : null;
  // The person's choice, not the answer to it: a way set up while the page
  // is open is offered from then on, unless they chose to type.
  const [choseTyping, setChoseTyping] = useState(false);
  const typing = choseTyping || !quick;
  const [value, setValue] = useState('');
  const method = quick === 'key' ? t('keys.method') : t(DEVICE_METHOD[deviceKind()]);
  const Icon = quick === 'key' ? KeyIcon : FingerprintIcon;
  const name = passwordName();
  const label =
    secret === 'recoveryKey'
      ? t('proof.recoveryKey')
      : name === 'account'
        ? t('unlock.accountPassword')
        : name === 'code'
          ? t('unlock.code')
          : t('settings.current');

  const field = typing ? (
    <div className="flex flex-col gap-1.5">
      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        {label}
        <PasswordInput value={value} onChange={(event) => setValue(event.target.value)} />
      </label>
      {quick && (
        <button type="button" onClick={() => setChoseTyping(false)} className="self-start text-[12.5px] text-brand-600 hover:underline dark:text-brand-300">
          {t('proof.useDevice', { method })}
        </button>
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-1.5">
      <p className="flex items-center gap-2 text-[13px] text-neutral-700 dark:text-neutral-300">
        <Icon className="h-4 w-4 shrink-0" />
        {t('proof.withDevice', { method })}
      </p>
      <button type="button" onClick={() => setChoseTyping(true)} className="self-start text-[12.5px] text-brand-600 hover:underline dark:text-brand-300">
        {secret === 'recoveryKey'
          ? t('proof.useRecoveryKey')
          : name === 'account'
            ? t('proof.useAccountPassword')
            : name === 'code'
              ? t('proof.useCode')
              : t('proof.usePassword')}
      </button>
    </div>
  );

  return {
    field,
    /** Whether the form can be sent: always, when the device or a key will be asked. */
    ready: !typing || value.length > 0,
    /** The proof, asking the device or a key now if that is the way. */
    async get(): Promise<Proof> {
      if (!typing && device) return { prf: await askDevice(device) };
      if (!typing && keys.length > 0) return askKey(keys);
      return { secret: value };
    },
    reset: () => setValue(''),
  };
}
