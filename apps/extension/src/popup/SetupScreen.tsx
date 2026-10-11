import { useState, type FormEvent } from 'react';
import { MIN_MASTER_PASSWORD } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { send } from '../lib/messaging.js';
import { useAction } from '../ui/hooks.js';
import { Button, Callout } from '../ui/primitives.js';
import { Strength } from '../ui/Strength.js';
import { Brand } from './Header.js';
import { PasswordInput } from './PasswordInput.js';

export function SetupScreen() {
  const t = useT();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [understood, setUnderstood] = useState(false);
  const { busy, error, run } = useAction();

  const long = [...password].length >= MIN_MASTER_PASSWORD;
  const same = password === confirm;
  const ready = long && same && understood && !busy;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (ready) void run(() => send({ type: 'vault/create', password }));
  };

  return (
    <form onSubmit={submit} className="flex min-h-[560px] flex-col gap-4 p-5">
      <Brand />
      <div className="flex flex-col gap-1.5 pt-2">
        <h1 className="text-lg font-semibold">{t('setup.title')}</h1>
        <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('setup.body')}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="master" className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
          {t('setup.password')}
        </label>
        <PasswordInput id="master" autoFocus value={password} onChange={(event) => setPassword(event.target.value)} />
        <Strength password={password} />
        {password && !long && (
          <p className="text-[12px] text-red-600 dark:text-red-300">{t('setup.tooShort', { min: MIN_MASTER_PASSWORD })}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm" className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
          {t('setup.confirm')}
        </label>
        <PasswordInput id="confirm" value={confirm} onChange={(event) => setConfirm(event.target.value)} error={Boolean(confirm) && !same} />
        {confirm && !same && <p className="text-[12px] text-red-600 dark:text-red-300">{t('setup.mismatch')}</p>}
      </div>
      <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300">
        <input type="checkbox" checked={understood} onChange={(event) => setUnderstood(event.target.checked)} className="mt-1 accent-brand-600" />
        {t('setup.understand')}
      </label>
      {error && <Callout tone="danger">{error}</Callout>}
      <div className="mt-auto flex flex-col gap-2">
        <Button type="submit" variant="primary" className="w-full" disabled={!ready}>
          {busy ? t('setup.creating') : t('setup.create')}
        </Button>
        {/* A file chooser closes the popup on some systems, so restoring happens in the settings tab. */}
        <Button variant="ghost" className="w-full" onClick={() => void chrome.tabs.create({ url: chrome.runtime.getURL('options.html#restore') })}>
          {t('setup.restore')}
        </Button>
      </div>
    </form>
  );
}
