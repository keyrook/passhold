import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  cardExpired,
  cardExpiry,
  cardGroups,
  cardNetwork,
  cardNumberLooksRight,
  COUNTRIES,
  type AddressItem,
  type CardItem,
  type NoteItem,
  type WalletDraft,
  type WalletItem,
  type WalletKind,
} from '@passhold/core';
import { useT, type Translator } from '../i18n/react.js';
import type { MessageKey } from '../i18n/locales/en.js';
import type { FolderEntry } from '../ui/Folders.js';
import type { ItemMutation } from '../lib/messaging.js';
import { MoveToFamily, useChange, type SharedVault } from '../ui/place.js';
import { useAction, useCopy } from '../ui/hooks.js';
import { BackIcon, CheckIcon, ChevronDownIcon, CopyIcon, EditIcon, EyeIcon, EyeOffIcon, StarIcon, TrashIcon } from '../ui/icons.js';
import { Button, Callout, cx, Field } from '../ui/primitives.js';
import { countryName, walletName } from '../ui/wallet.js';
import { CardMark, WalletMark } from '../ui/WalletMark.js';
import { TEXTAREA } from './EditScreen.js';
import { FieldRow, FieldsEditor, FieldsView, FolderField, FolderView } from './Fields.js';
import { PasswordInput } from './PasswordInput.js';

// --- one item -------------------------------------------------------------------------

/**
 * A card, an address or a note, opened: each field to copy, a card's number
 * and code hidden until asked. `shared`: the shared vaults one of the vault's
 * own may move into.
 */
export function WalletItemScreen({
  item,
  shared = [],
  onBack,
  onEdit,
  className = 'h-[560px]',
}: {
  item: WalletItem;
  shared?: SharedVault[];
  onBack: () => void;
  onEdit: () => void;
  className?: string;
}) {
  const t = useT();
  const { error, run } = useAction();
  const change = useChange();
  const mutate = (mutation: ItemMutation) => run(() => change(mutation));
  const date = new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium' });

  return (
    <div className={cx('flex flex-col', className)}>
      <header className="flex items-center gap-1 border-b border-neutral-200 px-2 py-2 dark:border-neutral-800">
        <Button size="sm" variant="ghost" aria-label={t('common.back')} title={t('common.back')} onClick={onBack}>
          <BackIcon className="kr-icon-flip h-[18px] w-[18px]" />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <WalletMark item={item} size={32} />
          <h1 className="truncate text-[15px] font-semibold">{walletName(item, t)}</h1>
        </div>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={item.favorite}
          aria-label={item.favorite ? t('item.unfavorite') : t('item.addFavorite')}
          title={item.favorite ? t('item.unfavorite') : t('item.addFavorite')}
          onClick={() => void mutate({ op: 'wallet/favorite', id: item.id, favorite: !item.favorite })}
        >
          <StarIcon className={cx('h-[18px] w-[18px]', item.favorite && 'text-yellow-600')} />
        </Button>
        <Button size="sm" variant="ghost" aria-label={t('common.edit')} title={t('common.edit')} onClick={onEdit}>
          <EditIcon className="h-[18px] w-[18px]" />
        </Button>
      </header>

      <div className="scrollarea flex-1 overflow-y-auto px-4 py-2">
        {error && <Callout tone="danger">{error}</Callout>}
        {item.kind === 'card' && <CardFields card={item} />}
        {item.kind === 'address' && <AddressFields address={item} />}
        {item.kind === 'note' && <NoteFields note={item} />}
        <FieldsView fields={item.fields} />
        <FolderView folder={item.folder} />
        <p className="pt-3 text-[12px] text-neutral-600 dark:text-neutral-400">{t('wallet.updated', { date: date.format(item.updatedAt) })}</p>
      </div>

      <footer className="flex flex-col items-start gap-1 border-t border-neutral-200 px-4 py-2 dark:border-neutral-800">
        <MoveToFamily id={item.id} shared={shared} onMoved={onBack} />
        <Button
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700 dark:text-red-300"
          onClick={() =>
            void run(async () => {
              await change({ op: 'wallet/trash', id: item.id });
              onBack();
            })
          }
        >
          <TrashIcon className="h-4 w-4" /> {t('item.trash')}
        </Button>
      </footer>
    </div>
  );
}

function useFieldActions() {
  const t = useT();
  const { copied, copy } = useCopy();
  const [shown, setShown] = useState<Record<string, boolean>>({});
  /** `label`: the field's own name, which "Copy …" is made from; `name`, when that would not read as a sentence. */
  const copyButton = (id: string, text: string, label: string, named?: string) => {
    const name = named ?? t('wallet.copyField', { field: label.toLocaleLowerCase(t.locale) });
    return (
      <Button size="sm" variant="ghost" aria-label={name} title={name} onClick={() => void copy(id, text)}>
        {copied === id ? <CheckIcon className="h-4 w-4 text-green-700 dark:text-green-300" /> : <CopyIcon className="h-4 w-4" />}
      </Button>
    );
  };
  const showButton = (id: string) => (
    <Button
      size="sm"
      variant="ghost"
      aria-label={shown[id] ? t('common.hide') : t('common.show')}
      title={shown[id] ? t('common.hide') : t('common.show')}
      onClick={() => setShown((now) => ({ ...now, [id]: !now[id] }))}
    >
      {shown[id] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
    </Button>
  );
  return { copyButton, showButton, shown };
}

function Notes({ notes }: { notes: string }) {
  const t = useT();
  if (!notes) return null;
  return (
    <FieldRow label={t('item.notes')}>
      <p className="whitespace-pre-wrap">{notes}</p>
    </FieldRow>
  );
}

function CardFields({ card }: { card: CardItem }) {
  const t = useT();
  const { copyButton, showButton, shown } = useFieldActions();
  const groups = cardGroups(card.number);
  const expiry = cardExpiry(card);
  return (
    <>
      {cardExpired(card) && (
        <div className="mb-1 mt-2">
          <Callout tone="warning">{t('card.expired')}</Callout>
        </div>
      )}
      {card.number && (
        <FieldRow label={t('card.number')} actions={<>{showButton('number')}{copyButton('number', card.number, t('card.number'))}</>}>
          {/* The last group stays in sight, as on the card's own statement. */}
          <span className="font-mono break-all" data-testid="card-number">
            {shown.number ? groups.join(' ') : groups.map((group, index) => (index === groups.length - 1 ? group : '•'.repeat(group.length))).join(' ')}
          </span>
        </FieldRow>
      )}
      {card.holder && (
        <FieldRow label={t('card.holder')} actions={copyButton('holder', card.holder, t('card.holder'))}>
          {card.holder}
        </FieldRow>
      )}
      {expiry && (
        <FieldRow label={t('card.expiry')} actions={copyButton('expiry', expiry, t('card.expiry'), t('card.copyExpiry'))}>
          <span className="font-mono">{expiry}</span>
        </FieldRow>
      )}
      {card.code && (
        <FieldRow label={t('card.code')} actions={<>{showButton('code')}{copyButton('code', card.code, t('card.code'))}</>}>
          <span className="font-mono" data-testid="card-code">
            {shown.code ? card.code : '•'.repeat(card.code.length)}
          </span>
        </FieldRow>
      )}
      <Notes notes={card.notes} />
    </>
  );
}

/** The address as it goes on an envelope: street, then postal code and city, region, country. */
function envelope(address: AddressItem, t: Translator): string[] {
  return [
    ...address.street.split('\n'),
    [address.postalCode, address.city].filter(Boolean).join(' '),
    address.region,
    address.country ? countryName(address.country, t.locale) : '',
  ].filter(Boolean);
}

function AddressFields({ address }: { address: AddressItem }) {
  const t = useT();
  const { copyButton } = useFieldActions();
  const lines = envelope(address, t);
  const rows: [string, string, MessageKey][] = [
    ['name', address.name, 'address.name'],
    ['organization', address.organization, 'address.organization'],
  ];
  return (
    <>
      {rows.map(([id, value, label]) =>
        value ? (
          <FieldRow key={id} label={t(label)} actions={copyButton(id, value, t(label))}>
            {value}
          </FieldRow>
        ) : null,
      )}
      {lines.length > 0 && (
        <FieldRow label={t('address.address')} actions={copyButton('address', lines.join('\n'), t('address.address'))}>
          <p className="whitespace-pre-wrap">{lines.join('\n')}</p>
        </FieldRow>
      )}
      {address.phone && (
        <FieldRow label={t('address.phone')} actions={copyButton('phone', address.phone, t('address.phone'))}>
          {address.phone}
        </FieldRow>
      )}
      {address.email && (
        <FieldRow label={t('address.email')} actions={copyButton('email', address.email, t('address.email'))}>
          {address.email}
        </FieldRow>
      )}
      <Notes notes={address.notes} />
    </>
  );
}

function NoteFields({ note }: { note: NoteItem }) {
  const t = useT();
  const { copyButton } = useFieldActions();
  if (!note.text) return null;
  return (
    <FieldRow label={t('note.text')} actions={copyButton('text', note.text, t('note.text'))}>
      <p className="whitespace-pre-wrap" data-testid="note-text">
        {note.text}
      </p>
    </FieldRow>
  );
}

// --- adding and editing -------------------------------------------------------------

/** A new address's country: the reader's own, as the browser knows it. */
function homeCountry(locale: string): string {
  const region = (() => {
    try {
      return new Intl.Locale(navigator.language).maximize().region;
    } catch {
      return undefined;
    }
  })();
  if (region && COUNTRIES.includes(region)) return region;
  return locale === 'vi' ? 'VN' : '';
}

function blank(kind: WalletKind, locale: string): WalletDraft {
  switch (kind) {
    case 'card':
      return { kind, title: '', holder: '', number: '', expMonth: null, expYear: null, code: '', notes: '' };
    case 'address':
      return { kind, title: '', name: '', organization: '', street: '', city: '', region: '', postalCode: '', country: homeCountry(locale), phone: '', email: '', notes: '' };
    case 'note':
      return { kind, title: '', text: '' };
  }
}

function draftOf(item: WalletItem): WalletDraft {
  const { id: _, createdAt: __, updatedAt: ___, lastUsedAt: ____, deletedAt: _____, ...draft } = item;
  return draft;
}

/** Whether there is anything to save, as the vault will judge it: a card's number or a name, any part of an address, any words — or any field of its own. */
function worthSaving(draft: WalletDraft): boolean {
  if (draft.fields?.some((field) => field.name.trim() || field.value)) return true;
  switch (draft.kind) {
    case 'card':
      return Boolean(draft.number.replace(/\D/g, '') || draft.title.trim());
    case 'address':
      return [draft.title, draft.name, draft.organization, draft.street, draft.city, draft.phone, draft.email].some((value) => value.trim());
    case 'note':
      return Boolean(draft.title.trim() || draft.text.trim());
  }
}

const HEADINGS: Record<WalletKind, { new: MessageKey; edit: MessageKey; empty: MessageKey }> = {
  card: { new: 'card.newTitle', edit: 'card.editTitle', empty: 'card.empty' },
  address: { new: 'address.newTitle', edit: 'address.editTitle', empty: 'address.empty' },
  note: { new: 'note.newTitle', edit: 'note.editTitle', empty: 'note.empty' },
};

const SELECT =
  'h-10 w-full appearance-none rounded-xl border border-neutral-200 bg-white pe-8 ps-3 text-sm text-neutral-900 focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50';

function Select({ id, label, value, onChange, children }: { id: string; label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <div className="relative">
      <select id={id} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={SELECT}>
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}

function Label({ htmlFor, children, aside }: { htmlFor: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
        {children}
      </label>
      {aside}
    </div>
  );
}

/** A new card, address or note — `kind` — or an edit of `item`. `defaultFolder`: a new one's, the folder the list was showing. */
export function WalletEditScreen({
  kind,
  item,
  folders,
  defaultFolder = '',
  onDone,
  className = 'h-[560px]',
}: {
  kind: WalletKind;
  item: WalletItem | null;
  folders: readonly FolderEntry[];
  defaultFolder?: string;
  onDone: (id: string | null) => void;
  className?: string;
}) {
  const t = useT();
  const [draft, setDraft] = useState<WalletDraft>(() => (item ? draftOf(item) : { ...blank(kind, t.locale), folder: defaultFolder, fields: [] }));
  const { busy, error, setError, run } = useAction();
  const change = useChange();
  const headings = HEADINGS[draft.kind];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!worthSaving(draft)) {
      setError(t(headings.empty));
      return;
    }
    void run(async () => {
      if (item) {
        await change({ op: 'wallet/update', id: item.id, draft });
        onDone(item.id);
      } else {
        await change({ op: 'wallet/add', draft });
        onDone(null);
      }
    });
  };

  return (
    <form onSubmit={submit} className={cx('flex flex-col', className)}>
      <header className="flex items-center gap-1 border-b border-neutral-200 px-2 py-2 dark:border-neutral-800">
        <Button size="sm" variant="ghost" aria-label={t('common.back')} title={t('common.back')} onClick={() => onDone(item?.id ?? null)}>
          <BackIcon className="kr-icon-flip h-[18px] w-[18px]" />
        </Button>
        <h1 className="flex-1 text-[15px] font-semibold">{item ? t(headings.edit) : t(headings.new)}</h1>
      </header>

      <div className="scrollarea flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        {draft.kind === 'card' && <CardForm draft={draft} onChange={setDraft} autoFocus={!item} />}
        {draft.kind === 'address' && <AddressForm draft={draft} onChange={setDraft} autoFocus={!item} />}
        {draft.kind === 'note' && <NoteForm draft={draft} onChange={setDraft} autoFocus={!item} />}
        <FieldsEditor fields={draft.fields ?? []} onChange={(fields) => setDraft((now) => ({ ...now, fields }))} />
        <FolderField value={draft.folder ?? ''} onChange={(folder) => setDraft((now) => ({ ...now, folder }))} folders={folders} />
        {error && <Callout tone="danger">{error}</Callout>}
      </div>

      <footer className="flex justify-end gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <Button onClick={() => onDone(item?.id ?? null)}>{t('common.cancel')}</Button>
        <Button type="submit" variant="primary" disabled={busy}>
          {t('common.save')}
        </Button>
      </footer>
    </form>
  );
}

type FormProps<T extends WalletDraft> = { draft: T; onChange: (draft: WalletDraft) => void; autoFocus: boolean };

function CardForm({ draft, onChange, autoFocus }: FormProps<Extract<WalletDraft, { kind: 'card' }>>) {
  const t = useT();
  const set = (patch: Partial<typeof draft>) => onChange({ ...draft, ...patch });
  const digits = draft.number.replace(/\D/g, '');
  const network = cardNetwork(digits);
  const thisYear = new Date().getFullYear();
  const years = useMemo(() => {
    const range = Array.from({ length: 21 }, (_, index) => thisYear - 1 + index);
    return draft.expYear && !range.includes(draft.expYear) ? [draft.expYear, ...range] : range;
  }, [draft.expYear, thisYear]);
  return (
    <>
      <Field label={t('edit.title')} hint={t('card.titleHint')} value={draft.title} onChange={(event) => set({ title: event.target.value })} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-number" aside={digits.length >= 4 && <CardMark network={network} size={28} />}>
          {t('card.number')}
        </Label>
        <input
          id="card-number"
          autoFocus={autoFocus}
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={cardGroups(digits).join(' ')}
          onChange={(event) => set({ number: event.target.value.replace(/\D/g, '').slice(0, 19) })}
          className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 font-mono text-sm text-neutral-900 focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
        />
        {digits.length >= 12 && !cardNumberLooksRight(digits) && <p className="text-[12px] text-yellow-800 dark:text-yellow-300">{t('card.numberCheck')}</p>}
      </div>
      <Field label={t('card.holder')} value={draft.holder} onChange={(event) => set({ holder: event.target.value })} autoComplete="off" spellCheck={false} />
      <div className="grid grid-cols-[1fr_1fr_6.5rem] gap-2">
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="card-month">{t('card.expiry')}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select id="card-month" label={t('card.month')} value={draft.expMonth ? String(draft.expMonth) : ''} onChange={(value) => set({ expMonth: value ? Number(value) : null })}>
              <option value="">{t('card.month')}</option>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={String(index + 1)}>
                  {String(index + 1).padStart(2, '0')}
                </option>
              ))}
            </Select>
            <Select id="card-year" label={t('card.year')} value={draft.expYear ? String(draft.expYear) : ''} onChange={(value) => set({ expYear: value ? Number(value) : null })}>
              <option value="">{t('card.year')}</option>
              {years.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-code">{t('card.code')}</Label>
          <PasswordInput id="card-code" inputMode="numeric" maxLength={4} value={draft.code} onChange={(event) => set({ code: event.target.value.replace(/\D/g, '').slice(0, 4) })} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-notes">{t('edit.notes')}</Label>
        <textarea id="card-notes" rows={3} value={draft.notes} onChange={(event) => set({ notes: event.target.value })} className={TEXTAREA} />
      </div>
    </>
  );
}

function AddressForm({ draft, onChange, autoFocus }: FormProps<Extract<WalletDraft, { kind: 'address' }>>) {
  const t = useT();
  const set = (patch: Partial<typeof draft>) => onChange({ ...draft, ...patch });
  const countries = useMemo(() => {
    const collator = new Intl.Collator(t.locale, { sensitivity: 'base' });
    return COUNTRIES.map((code) => ({ code, name: countryName(code, t.locale) })).sort((a, b) => collator.compare(a.name, b.name));
  }, [t.locale]);
  return (
    <>
      <Field label={t('edit.title')} hint={t('address.titleHint')} value={draft.title} onChange={(event) => set({ title: event.target.value })} autoFocus={autoFocus} />
      <Field label={t('address.name')} value={draft.name} onChange={(event) => set({ name: event.target.value })} autoComplete="off" />
      <Field label={t('address.organization')} value={draft.organization} onChange={(event) => set({ organization: event.target.value })} autoComplete="off" />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address-street">{t('address.street')}</Label>
        <textarea id="address-street" rows={2} value={draft.street} onChange={(event) => set({ street: event.target.value })} className={TEXTAREA} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label={t('address.city')} value={draft.city} onChange={(event) => set({ city: event.target.value })} autoComplete="off" />
        <Field label={t('address.region')} value={draft.region} onChange={(event) => set({ region: event.target.value })} autoComplete="off" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label={t('address.postalCode')} value={draft.postalCode} onChange={(event) => set({ postalCode: event.target.value })} autoComplete="off" />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address-country">{t('address.country')}</Label>
          <Select id="address-country" label={t('address.country')} value={draft.country} onChange={(value) => set({ country: value })}>
            <option value="">{t('address.chooseCountry')}</option>
            {countries.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <Field label={t('address.phone')} type="tel" value={draft.phone} onChange={(event) => set({ phone: event.target.value })} autoComplete="off" />
      <Field label={t('address.email')} type="email" value={draft.email} onChange={(event) => set({ email: event.target.value })} autoComplete="off" spellCheck={false} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address-notes">{t('edit.notes')}</Label>
        <textarea id="address-notes" rows={2} value={draft.notes} onChange={(event) => set({ notes: event.target.value })} className={TEXTAREA} />
      </div>
    </>
  );
}

function NoteForm({ draft, onChange, autoFocus }: FormProps<Extract<WalletDraft, { kind: 'note' }>>) {
  const t = useT();
  const set = (patch: Partial<typeof draft>) => onChange({ ...draft, ...patch });
  return (
    <>
      <Field label={t('note.title')} value={draft.title} onChange={(event) => set({ title: event.target.value })} autoFocus={autoFocus} />
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="note-text">{t('note.text')}</Label>
        <textarea id="note-text" rows={12} value={draft.text} onChange={(event) => set({ text: event.target.value })} className={cx(TEXTAREA, 'flex-1')} />
      </div>
    </>
  );
}
