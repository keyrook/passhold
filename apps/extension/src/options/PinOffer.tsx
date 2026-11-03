import { useState, type FormEvent } from 'react';
import { isValidPin } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { send } from '../lib/messaging.js';
import { PasswordInput } from '../popup/PasswordInput.js';
import { useAction } from '../ui/hooks.js';
import { PassholdMark } from '../ui/icons.js';
import { Button, Callout } from '../ui/primitives.js';

const digits = (value: string) => value.replace(/\D/g, '').slice(0, 12);

/**
 * Right after a vault is made to open with a password — no fingerprint here,
 * or none chosen — the quick way in for the rest of the day, offered once
 * rather than left for someone to find in Security. Said as it is: it lasts
 * until the browser closes, because a PIN never guards anything on disk.
 *
 * `secret`: the password or code the vault was just made with, the proof a
 * new way in asks for; it is not asked for again a moment after it was typed.
 */
export function PinOffer({ secret, onDone }: { secret: string; onDone: () => void }) {
  const t = useT();
  const [pin, setPin] = useState('');
  const [again, setAgain] = useState('');
  const { busy, error, run } = useAction();
  const ready = isValidPin(pin) && pin === again && !busy;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    void run(async () => {
      await send({ type: 'vault/setPin', proof: { secret }, pin });
      onDone();
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 p-6" data-testid="pin-offer">
      <PassholdMark size={32} />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[19px] font-semibold tracking-[-0.01em]">{t('pinOffer.title')}</h1>
        <p className="text-[13.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('pinOffer.body')}</p>
      </div>
      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        {t('pin.new')}
        <PasswordInput id="offer-pin" inputMode="numeric" autoFocus value={pin} onChange={(event) => setPin(digits(event.target.value))} />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        {t('pin.again')}
        <PasswordInput id="offer-pin-again" inputMode="numeric" value={again} onChange={(event) => setAgain(digits(event.target.value))} error={Boolean(again) && again !== pin} />
      </label>
      {pin && !isValidPin(pin) && <p className="text-[12px] text-red-600 dark:text-red-300">{t('error.pinInvalid')}</p>}
      {error && <Callout tone="danger">{error}</Callout>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={!ready}>
          {t('pin.save')}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onDone}>
          {t('common.notNow')}
        </Button>
      </div>
      <p className="text-[12.5px] text-neutral-600 dark:text-neutral-400">{t('pinOffer.later')}</p>
    </form>
  );
}
