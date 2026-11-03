import { useEffect, useRef, useState } from 'react';
import { folderCounts, type VaultData } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { CheckIcon, ChevronDownIcon, FolderIcon } from './icons.js';
import { cx } from './primitives.js';

export interface FolderEntry {
  name: string;
  /** Live items filed in it. */
  count: number;
}

/** Every folder something live is in, by name in the reader's language. */
export function foldersOf(data: Pick<VaultData, 'items' | 'wallet'>, locale: string): FolderEntry[] {
  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true });
  return [...folderCounts(data)].map(([name, count]) => ({ name, count })).sort((a, b) => collator.compare(a.name, b.name));
}

/** Live items filed in no folder. */
export function unfiledCount(data: Pick<VaultData, 'items' | 'wallet'>): number {
  return [...data.items, ...data.wallet].filter((item) => item.deletedAt === null && !item.folder).length;
}

/**
 * Which folder a list shows: null for every one, '' for what is in none. A
 * folder renamed or emptied from under the list is read as every folder, so
 * the list never shows a folder that is no longer there. `renamedFrom`: the
 * name the chosen folder had until a rename here — shown until the vault
 * says the new one, so the list does not blink to every folder in between.
 */
export function shownFolder(chosen: string | null, folders: readonly FolderEntry[], renamedFrom: string | null = null): string | null {
  const there = (name: string) => folders.some((folder) => folder.name === name);
  if (chosen === null || chosen === '' || there(chosen)) return chosen;
  return renamedFrom && there(renamedFrom) ? renamedFrom : null;
}

/**
 * One folder or all, from a menu — a sixth chip would not fit beside the kinds
 * in the popup. Drawn only where something is filed: a vault with no folders
 * sees nothing of them.
 */
export function FolderFilter({
  folders,
  unfiled,
  value,
  onChange,
  align = 'start',
}: {
  folders: readonly FolderEntry[];
  unfiled: number;
  value: string | null;
  onChange: (value: string | null) => void;
  /** Which edge of the button the menu hangs from: the end, where the button sits at the end of its row. */
  align?: 'start' | 'end';
}) {
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

  if (!folders.length) return null;
  const label = value === null ? t('folders.all') : value === '' ? t('folders.none') : value;
  const choose = (next: string | null) => {
    setOpen(false);
    onChange(next);
  };
  const options: { value: string | null; label: string; count: number | null }[] = [
    { value: null, label: t('folders.all'), count: null },
    ...folders.map((folder) => ({ value: folder.name, label: folder.name, count: folder.count })),
    ...(unfiled ? [{ value: '', label: t('folders.none'), count: unfiled }] : []),
  ];

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('folders.label')}: ${label}`}
        onClick={() => setOpen((now) => !now)}
        className={cx(
          'flex h-7 max-w-full items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium transition-colors',
          value === null
            ? 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
            : 'bg-brand-50 text-brand-800 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-200 dark:hover:bg-brand-500/25',
        )}
      >
        <FolderIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{label}</span>
        <ChevronDownIcon className="h-3.5 w-3.5 shrink-0" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={t('folders.label')}
          className={cx(
            'scrollarea absolute top-full z-20 mt-1 flex max-h-72 w-60 flex-col overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-floating dark:border-neutral-800 dark:bg-neutral-900',
            align === 'end' ? 'end-0' : 'start-0',
          )}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value ?? '\u0000all'}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                autoFocus={selected || (index === 0 && value === null)}
                onClick={() => choose(option.value)}
                className="flex h-9 w-full shrink-0 items-center gap-2 rounded-lg px-2.5 text-start text-[13px] text-neutral-800 hover:bg-neutral-100 focus-visible:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:bg-neutral-800"
              >
                <span className="flex w-4 shrink-0 justify-center text-brand-600 dark:text-brand-300">{selected && <CheckIcon className="h-4 w-4" />}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{option.label}</span>
                {option.count !== null && <span className="shrink-0 text-[12px] text-neutral-500 dark:text-neutral-400">{option.count}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
