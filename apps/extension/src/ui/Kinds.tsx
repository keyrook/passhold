import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { WalletKind } from '@passhold/core';
import { useT } from '../i18n/react.js';
import type { MessageKey } from '../i18n/locales/en.js';
import { HomeIcon, KeyIcon, ListIcon, PlusIcon } from './icons.js';
import { Button, cx } from './primitives.js';
import { CardMark } from './WalletMark.js';

/** Which kind of thing a list shows. */
export type Shown = 'all' | 'login' | WalletKind;
/** What a person may add. */
export type AddKind = 'login' | WalletKind;

const SHOWN: { value: Shown; label: MessageKey }[] = [
  { value: 'all', label: 'kinds.all' },
  { value: 'login', label: 'kinds.logins' },
  { value: 'card', label: 'kinds.cards' },
  { value: 'address', label: 'kinds.addresses' },
  { value: 'note', label: 'kinds.notes' },
];

/** One kind or every kind, a click apart: always the same five, whatever the vault holds, so nothing moves under the pointer. */
export function KindChips({ value, onChange }: { value: Shown; onChange: (value: Shown) => void }) {
  const t = useT();
  return (
    <div role="radiogroup" aria-label={t('kinds.label')} className="flex flex-wrap gap-1">
      {SHOWN.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cx(
              'h-7 shrink-0 rounded-full px-2.5 text-[12px] font-medium transition-colors',
              selected
                ? 'bg-brand-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            )}
          >
            {t(option.label)}
          </button>
        );
      })}
    </div>
  );
}

const ADD: { kind: AddKind; label: MessageKey; mark: ReactNode }[] = [
  { kind: 'login', label: 'add.login', mark: <KeyIcon className="h-[18px] w-[18px]" /> },
  { kind: 'card', label: 'add.card', mark: <CardMark network={null} size={20} /> },
  { kind: 'address', label: 'add.address', mark: <HomeIcon className="h-[18px] w-[18px]" /> },
  { kind: 'note', label: 'add.note', mark: <ListIcon className="h-[18px] w-[18px]" /> },
];

/** "Add", and what to add: a login, a card, an address or a note. `wide`: the button says it, rather than showing a plus alone. */
export function AddMenu({ onAdd, wide = false }: { onAdd: (kind: AddKind) => void; wide?: boolean }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        size="sm"
        variant={wide ? 'primary' : 'ghost'}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('add.menu')}
        title={t('add.menu')}
        onClick={() => setOpen((value) => !value)}
      >
        <PlusIcon className={wide ? 'h-4 w-4' : 'h-[18px] w-[18px]'} />
        {wide && t('add.menu')}
      </Button>
      {open && (
        <div
          role="menu"
          aria-label={t('add.menu')}
          className="absolute end-0 top-full z-20 mt-1 flex w-44 flex-col rounded-xl border border-neutral-200 bg-white p-1 shadow-floating dark:border-neutral-800 dark:bg-neutral-900"
        >
          {ADD.map((item, index) => (
            <button
              key={item.kind}
              type="button"
              role="menuitem"
              autoFocus={index === 0}
              onClick={() => {
                setOpen(false);
                onAdd(item.kind);
              }}
              className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-start text-[13px] font-medium text-neutral-800 hover:bg-neutral-100 focus-visible:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:bg-neutral-800"
            >
              <span className="flex w-5 shrink-0 items-center justify-center text-neutral-600 dark:text-neutral-400">{item.mark}</span>
              {t(item.label)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
