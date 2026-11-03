import { useState, type ReactNode } from 'react';
import type { CustomField } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { useCopy } from '../ui/hooks.js';
import { CheckIcon, CloseIcon, CopyIcon, EyeIcon, EyeOffIcon, FolderIcon, PlusIcon } from '../ui/icons.js';
import type { FolderEntry } from '../ui/Folders.js';
import { Button, cx } from '../ui/primitives.js';

const INPUT =
  'w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:placeholder:text-neutral-500';

export function FieldRow({ label, children, actions }: { label: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-neutral-200 py-2.5 last:border-0 dark:border-neutral-800">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[12px] text-neutral-600 dark:text-neutral-400">{label}</span>
        <div className="min-w-0 break-words text-sm">{children}</div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-0.5">{actions}</div>}
    </div>
  );
}

/** How many folders an edit offers to choose from at once: more, and the form is all folders. */
const OFFERED = 8;

const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/gi, 'd').toLowerCase();

/**
 * The folder an item is in: typed, or one already there chosen from beneath.
 * The choices are drawn whether or not the field has focus, so nothing moves
 * when it does; typing narrows them once there are more than fit.
 */
export function FolderField({ value, onChange, folders }: { value: string; onChange: (value: string) => void; folders: readonly FolderEntry[] }) {
  const t = useT();
  const typed = fold(value.trim());
  const offered = (folders.length > OFFERED && typed ? folders.filter((folder) => fold(folder.name).includes(typed)) : [...folders])
    .sort((a, b) => b.count - a.count)
    .slice(0, OFFERED);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="folder" className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
        {t('folders.label')}
      </label>
      <div className="relative">
        <FolderIcon className="pointer-events-none absolute start-3 top-3 h-4 w-4 text-neutral-500" />
        <input
          id="folder"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t('folders.placeholder')}
          autoComplete="off"
          maxLength={100}
          className={cx(INPUT, 'h-10 ps-9')}
        />
      </div>
      {folders.length ? (
        <div className="flex flex-wrap gap-1" role="group" aria-label={t('folders.choose')}>
          {offered.map((folder) => {
            const chosen = folder.name === value.trim();
            return (
              <button
                key={folder.name}
                type="button"
                aria-pressed={chosen}
                onClick={() => onChange(chosen ? '' : folder.name)}
                className={cx(
                  'h-7 max-w-full truncate rounded-full px-2.5 text-[12px] font-medium transition-colors',
                  chosen
                    ? 'bg-brand-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
                )}
              >
                {folder.name}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{t('folders.hint')}</p>
      )}
    </div>
  );
}

/** A field's value: as many lines as it has, up to a few — and out of sight while hidden, as a password is. */
function ValueBox({ id, value, hidden, onChange }: { id: string; value: string; hidden: boolean; onChange: (value: string) => void }) {
  const t = useT();
  const [shown, setShown] = useState(false);
  const masked = hidden && !shown;
  // A text area, not an input: an input drops a value's line breaks the moment it is edited.
  return (
    <div className="relative">
      <textarea
        id={id}
        aria-label={t('fields.value')}
        placeholder={t('fields.value')}
        rows={Math.min(Math.max(value.split('\n').length, 1), 4)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        autoComplete="off"
        className={cx(
          INPUT,
          'block resize-none py-2 leading-[22px]',
          hidden && 'pe-10',
          hidden && shown && 'font-mono',
          masked && '[-webkit-text-security:disc]',
        )}
      />
      {hidden && (
        <button
          type="button"
          onClick={() => setShown((now) => !now)}
          aria-label={shown ? t('common.hide') : t('common.show')}
          title={shown ? t('common.hide') : t('common.show')}
          className="absolute end-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          {shown ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

/** An item's own fields, edited: a name, a value, whether it is kept out of sight; added and taken away. */
export function FieldsEditor({ fields, onChange }: { fields: readonly CustomField[]; onChange: (fields: CustomField[]) => void }) {
  const t = useT();
  // Keys of their own, so a field taken from the middle takes its own inputs with it.
  const [keys, setKeys] = useState(() => fields.map((_, index) => index));
  const [next, setNext] = useState(fields.length);
  // The one just added takes the cursor; those the item came with do not.
  const [added, setAdded] = useState<number | null>(null);
  const set = (index: number, patch: Partial<CustomField>) => onChange(fields.map((field, at) => (at === index ? { ...field, ...patch } : field)));
  const remove = (index: number) => {
    setKeys((now) => now.filter((_, at) => at !== index));
    onChange(fields.filter((_, at) => at !== index));
  };
  const add = () => {
    setKeys((now) => [...now, next]);
    setAdded(next);
    setNext((now) => now + 1);
    onChange([...fields, { name: '', value: '', hidden: false }]);
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="pb-1.5 text-[13px] font-medium text-neutral-700 dark:text-neutral-300">{t('fields.title')}</legend>
      {fields.map((field, index) => {
        const key = keys[index] ?? index;
        return (
          <div key={key} className="flex flex-col gap-1.5 rounded-xl border border-neutral-200 p-2 dark:border-neutral-800" data-testid="field">
            <div className="flex items-center gap-1">
              <input
                aria-label={t('fields.name')}
                placeholder={t('fields.name')}
                value={field.name}
                autoFocus={key === added}
                onChange={(event) => set(index, { name: event.target.value })}
                autoComplete="off"
                maxLength={200}
                className={cx(INPUT, 'h-9 text-[13px] font-medium')}
              />
              <Button size="sm" variant="ghost" aria-label={t('fields.remove')} title={t('fields.remove')} onClick={() => remove(index)}>
                <CloseIcon className="h-4 w-4" />
              </Button>
            </div>
            <ValueBox id={`field-${key}`} value={field.value} hidden={field.hidden} onChange={(value) => set(index, { value })} />
            <label className="flex w-fit items-center gap-2 px-0.5 text-[12.5px] text-neutral-700 dark:text-neutral-300">
              <input type="checkbox" checked={field.hidden} onChange={(event) => set(index, { hidden: event.target.checked })} className="h-4 w-4 accent-brand-600" />
              {t('fields.hidden')}
            </label>
          </div>
        );
      })}
      <div>
        <Button size="sm" variant="ghost" onClick={add}>
          <PlusIcon className="h-4 w-4" /> {t('fields.add')}
        </Button>
      </div>
    </fieldset>
  );
}

/** An item's own fields, opened: each to copy, a hidden one kept out of sight until asked, as a password is. */
export function FieldsView({ fields }: { fields: readonly CustomField[] }) {
  const t = useT();
  const { copied, copy } = useCopy();
  const [shown, setShown] = useState<Record<number, boolean>>({});
  return (
    <>
      {fields.map((field, index) => {
        const name = field.name || t('fields.unnamed');
        const copyLabel = t('fields.copy', { name });
        return (
          <FieldRow
            key={index}
            label={name}
            actions={
              <>
                {field.hidden && (
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={shown[index] ? t('common.hide') : t('common.show')}
                    title={shown[index] ? t('common.hide') : t('common.show')}
                    onClick={() => setShown((now) => ({ ...now, [index]: !now[index] }))}
                  >
                    {shown[index] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </Button>
                )}
                {field.value && (
                  <Button size="sm" variant="ghost" aria-label={copyLabel} title={copyLabel} onClick={() => void copy(`field-${index}`, field.value)}>
                    {copied === `field-${index}` ? <CheckIcon className="h-4 w-4 text-green-700 dark:text-green-300" /> : <CopyIcon className="h-4 w-4" />}
                  </Button>
                )}
              </>
            }
          >
            {field.hidden ? (
              <span className="font-mono break-all" data-testid="field-value">
                {shown[index] ? field.value : '•'.repeat(Math.min(field.value.length, 16))}
              </span>
            ) : (
              <p className="whitespace-pre-wrap" data-testid="field-value">
                {field.value}
              </p>
            )}
          </FieldRow>
        );
      })}
    </>
  );
}

/** The folder an item is in, as a line of its own; nothing for an item in none. */
export function FolderView({ folder }: { folder: string }) {
  const t = useT();
  if (!folder) return null;
  return (
    <FieldRow label={t('folders.label')}>
      <span className="flex items-center gap-1.5" data-testid="folder">
        <FolderIcon className="h-4 w-4 shrink-0 text-neutral-500" />
        <span className="truncate">{folder}</span>
      </span>
    </FieldRow>
  );
}
