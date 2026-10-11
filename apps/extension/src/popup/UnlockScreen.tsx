import { useState, type FormEvent } from 'react';
import { useT } from '../i18n/react.js';
import { send } from '../lib/messaging.js';
import { useAction } from '../ui/hooks.js';
import { PassholdMark } from '../ui/icons.js';
import { Button, Spinner } from '../ui/primitives.js';
import { PasswordInput } from './PasswordInput.js';

export function UnlockScreen() {
  const t = useT();
  const [password, setPassword] = useState('');
  const [forgot, setForgot] = useState(false);
  const { busy, error, run } = useAction();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (password && !busy) void run(() => send({ type: 'vault/unlock', password }));
  };

  return (
    <form onSubmit={submit} className="flex min-h-[560px] flex-col items-center gap-4 px-6 pb-6 pt-16">
      <PassholdMark size={72} className="kr-boil" />
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-lg font-semibold">{t('unlock.title')}</h1>
        <p className="text-[13px] text-neutral-600 dark:text-neutral-400">{t('unlock.body')}</p>
      </div>
      <div className="flex w-full flex-col gap-1.5 pt-2">
        <label htmlFor="master" className="sr-only">
          {t('unlock.password')}
        </label>
        <PasswordInput
          id="master"
          autoFocus
          placeholder={t('unlock.password')}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={Boolean(error)}
        />
        {error && (
          <p role="alert" className="text-[12px] text-red-600 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" variant="primary" className="w-full" disabled={!password || busy}>
        {busy ? (
          <>
            <Spinner /> {t('unlock.unlocking')}
          </>
        ) : (
          t('unlock.submit')
        )}
      </Button>
      <div className="mt-auto flex flex-col items-center gap-2 text-center">
        <button type="button" onClick={() => setForgot((value) => !value)} className="text-[13px] text-brand-600 hover:underline dark:text-brand-300">
          {t('unlock.forgot')}
        </button>
        {forgot && <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('unlock.forgotBody')}</p>}
      </div>
    </form>
  );
}
