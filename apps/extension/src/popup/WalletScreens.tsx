import { useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  apiService,
  apiServiceChoices,
  blankApiKey,
  cardExpired,
  cardExpiry,
  cardGroups,
  cardNetwork,
  cardNumberLooksRight,
  cleanEnvName,
  cleanHosts,
  COUNTRIES,
  dayOf,
  dayText,
  expiryNotice,
  generateSshKey,
  readSshKey,
  serviceName,
  serviceOfKey,
  withService,
  type AddressItem,
  type ApiKeyItem,
  type CardItem,
  type NoteItem,
  type SshKeyItem,
  type WalletDraft,
  type WalletItem,
  HIDDEN,
  type Secret,
  type WalletKind,
} from '@passhold/core';
import { useT, type Translator } from '../i18n/react.js';
import type { MessageKey } from '../i18n/locales/en.js';
import { useReveal } from '../ui/secrets.js';
import type { FolderEntry } from '../ui/Folders.js';
import type { ItemMutation } from '../lib/messaging.js';
import { MoveToFamily, useChange, ViewOnlyContext, type SharedVault } from '../ui/place.js';
import { useAction, useCopy } from '../ui/hooks.js';
import { BackIcon, CheckIcon, ChevronDownIcon, CopyIcon, EditIcon, ExternalIcon, EyeIcon, EyeOffIcon, StarIcon, TrashIcon } from '../ui/icons.js';
import { Button, Callout, cx, Field } from '../ui/primitives.js';
import { countryName, expiryWords, keyDate, walletName } from '../ui/wallet.js';
import { ApiKeyMark, CardMark, WalletMark } from '../ui/WalletMark.js';
import { TEXTAREA } from './EditScreen.js';
import { FieldRow, FieldsEditor, FieldsView, FolderField, FolderView } from './Fields.js';
import { Versions } from '../ui/Versions.js';
import { Files } from '../ui/Files.js';
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
  const viewOnly = useContext(ViewOnlyContext);
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
        {!viewOnly && (
          <>
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
          </>
        )}
      </header>

      <div className="scrollarea flex-1 overflow-y-auto px-4 py-2">
        {error && <Callout tone="danger">{error}</Callout>}
        {item.kind === 'card' && <CardFields card={item} />}
        {item.kind === 'address' && <AddressFields address={item} />}
        {item.kind === 'note' && <NoteFields note={item} />}
        {item.kind === 'ssh' && <SshFields sshKey={item} />}
        {item.kind === 'apikey' && <ApiKeyFields apiKey={item} />}
        <FieldsView fields={item.fields} itemId={item.id} />
        <Files item={item} />
        <FolderView folder={item.folder} />
        <p className="pt-3 text-[12px] text-neutral-600 dark:text-neutral-400">{t('wallet.updated', { date: date.format(item.updatedAt) })}</p>
        <Versions id={item.id} kind="wallet" versions={item.versions} name={(draft) => walletName({ ...item, ...(draft as WalletDraft) } as WalletItem, t)} />
      </div>

      {!viewOnly && (
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
      )}
    </div>
  );
}

/**
 * A field's copy and show buttons. `itemId`: the item, of which a hidden
 * value is asked as it is shown or copied where the page does not hold it
 * (ui/secrets.ts); shown, a value is kept here until hidden again.
 */
function useFieldActions(itemId: string) {
  const t = useT();
  const { copied, copy } = useCopy();
  const reveal = useReveal();
  const [shown, setShown] = useState<Record<string, string>>({});
  /** `label`: the field's own name, which "Copy …" is made from; `name`, when that would not read as a sentence. `secret`: a hidden value. */
  const copyButton = (id: string, text: string, label: string, named?: string, secret?: Secret) => {
    const name = named ?? t('wallet.copyField', { field: label.toLocaleLowerCase(t.locale) });
    return (
      <Button size="sm" variant="ghost" aria-label={name} title={name} onClick={() => void (async () => copy(id, secret ? await reveal(itemId, secret, text) : text))().catch(() => undefined)}>
        {copied === id ? <CheckIcon className="h-4 w-4 text-green-700 dark:text-green-300" /> : <CopyIcon className="h-4 w-4" />}
      </Button>
    );
  };
  const showButton = (id: string, secret: Secret, held: string) => (
    <Button
      size="sm"
      variant="ghost"
      aria-label={id in shown ? t('common.hide') : t('common.show')}
      title={id in shown ? t('common.hide') : t('common.show')}
      onClick={() =>
        void (async () => {
          if (id in shown) return setShown(({ [id]: _, ...rest }) => rest);
          const value = await reveal(itemId, secret, held);
          setShown((now) => ({ ...now, [id]: value }));
        })().catch(() => undefined)
      }
    >
      {id in shown ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
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
  const { copyButton, showButton, shown } = useFieldActions(card.id);
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
        <FieldRow label={t('card.number')} actions={<>{showButton('number', { kind: 'number' }, card.number)}{copyButton('number', card.number, t('card.number'), undefined, { kind: 'number' })}</>}>
          {/* The last group stays in sight, as on the card's own statement. */}
          <span className="font-mono break-all" data-testid="card-number">
            {shown.number ? cardGroups(shown.number).join(' ') : groups.map((group, index) => (index === groups.length - 1 ? group : '•'.repeat(group.length))).join(' ')}
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
        <FieldRow label={t('card.code')} actions={<>{showButton('code', { kind: 'code' }, card.code)}{copyButton('code', card.code, t('card.code'), undefined, { kind: 'code' })}</>}>
          <span className="font-mono" data-testid="card-code">
            {shown.code ?? '•'.repeat(card.code === HIDDEN ? 3 : card.code.length)}
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
  const { copyButton } = useFieldActions(address.id);
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
  const { copyButton } = useFieldActions(note.id);
  if (!note.text) return null;
  return (
    <FieldRow label={t('note.text')} actions={copyButton('text', note.text, t('note.text'))}>
      <p className="whitespace-pre-wrap" data-testid="note-text">
        {note.text}
      </p>
    </FieldRow>
  );
}

/**
 * An SSH key: its public key and fingerprint to copy, as what a server is
 * given; the private key out of sight until asked, as a password is, and
 * monospaced, never moving.
 */
function SshFields({ sshKey }: { sshKey: SshKeyItem }) {
  const t = useT();
  const { copyButton, showButton, shown } = useFieldActions(sshKey.id);
  return (
    <>
      {sshKey.publicKey && (
        <FieldRow label={t('ssh.publicKey')} actions={copyButton('public', sshKey.publicKey, t('ssh.publicKey'))}>
          <span className="line-clamp-3 font-mono text-[12px] break-all" data-testid="ssh-public">
            {sshKey.publicKey}
          </span>
        </FieldRow>
      )}
      {sshKey.fingerprint && (
        <FieldRow label={t('ssh.fingerprint')} actions={copyButton('fingerprint', sshKey.fingerprint, t('ssh.fingerprint'))}>
          <span className="font-mono text-[12px] break-all" data-testid="ssh-fingerprint">
            {sshKey.fingerprint}
          </span>
        </FieldRow>
      )}
      {sshKey.privateKey && (
        <FieldRow
          label={t('ssh.privateKey')}
          actions={
            <>
              {showButton('private', { kind: 'privateKey' }, sshKey.privateKey)}
              {copyButton('private', sshKey.privateKey, t('ssh.privateKey'), undefined, { kind: 'privateKey' })}
            </>
          }
        >
          {shown.private ? (
            // Its lines as the file has them, scrolled sideways: wrapped, a key reads as a different file.
            <pre className="scrollarea overflow-x-auto font-mono text-[11px] whitespace-pre" data-testid="ssh-private">
              {shown.private!.trim()}
            </pre>
          ) : (
            <span className="font-mono">{'•'.repeat(16)}</span>
          )}
        </FieldRow>
      )}
      <Notes notes={sshKey.notes} />
    </>
  );
}

/**
 * An API key: the key out of sight until asked, as a password is, and
 * monospaced; where it goes and what for; and, when it runs out within two
 * weeks or has, a word that says so and the service's own page for a new one.
 * Nothing here fills a page: a key is copied, or read by a command.
 */
function ApiKeyFields({ apiKey }: { apiKey: ApiKeyItem }) {
  const t = useT();
  const { copyButton, showButton, shown } = useFieldActions(apiKey.id);
  const notice = expiryNotice(apiKey);
  const service = serviceName(apiKey.service);
  const replace = apiService(apiKey.service)?.replace;
  const label = (key: MessageKey) => t(key);
  const masked = (value: string) => `•••• ${value.length >= 16 ? value.slice(-4) : ''}`.trim();
  return (
    <>
      {notice && (
        <div className="mb-1 mt-2" data-testid="apikey-expiry">
          <Callout tone={notice.expired ? 'danger' : 'warning'}>
            <span className="flex flex-col gap-1">
              <span>{expiryWords(apiKey, t)}</span>
              {replace && (
                <a href={replace} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium underline">
                  {t('apikey.replaceAt', { service })}
                  <ExternalIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </span>
          </Callout>
        </div>
      )}
      {apiKey.key && (
        <FieldRow label={label('apikey.key')} actions={<>{showButton('key', { kind: 'key' }, apiKey.key)}{copyButton('key', apiKey.key, label('apikey.key'), undefined, { kind: 'key' })}</>}>
          <span className="font-mono text-[12px] break-all" data-testid="apikey-key">
            {shown.key ?? '•'.repeat(16)}
          </span>
        </FieldRow>
      )}
      {apiKey.keyId && (
        <FieldRow label={label('apikey.keyId')} actions={copyButton('keyId', apiKey.keyId, label('apikey.keyId'))}>
          <span className="font-mono text-[12px] break-all">{apiKey.keyId}</span>
        </FieldRow>
      )}
      {service && <FieldRow label={label('apikey.service')}>{service}</FieldRow>}
      {apiKey.hosts.length > 0 && (
        <FieldRow label={label('apikey.hosts')} actions={copyButton('hosts', apiKey.hosts.join('\n'), label('apikey.hosts'))}>
          <span className="flex flex-col font-mono text-[12px]">
            {apiKey.hosts.map((host) => (
              <span key={host} className="break-all">
                {host}
              </span>
            ))}
          </span>
        </FieldRow>
      )}
      {apiKey.environment && <FieldRow label={label('apikey.environment')}>{apiKey.environment}</FieldRow>}
      {apiKey.scopes && <FieldRow label={label('apikey.scopes')}>{apiKey.scopes}</FieldRow>}
      {apiKey.env && (
        <FieldRow label={label('apikey.env')} actions={copyButton('env', apiKey.env, label('apikey.env'))}>
          <span className="font-mono text-[12px]">{apiKey.env}</span>
        </FieldRow>
      )}
      {apiKey.issuedAt !== null && <FieldRow label={label('apikey.issued')}>{keyDate(apiKey.issuedAt, t)}</FieldRow>}
      {apiKey.expiresAt !== null && <FieldRow label={label('apikey.expires')}>{keyDate(apiKey.expiresAt, t)}</FieldRow>}
      <Notes notes={apiKey.notes} />
      {apiKey.history.length > 0 && (
        <details className="pt-2 text-[13px]">
          <summary className="cursor-pointer text-neutral-700 dark:text-neutral-300">{t('apikey.history')}</summary>
          <ul className="flex flex-col gap-1 pt-2">
            {apiKey.history.map((entry, index) => (
              <li key={index} className="flex items-center justify-between gap-2" data-testid="apikey-history">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-mono">{masked(entry.password)}</span>
                  {entry.field && <span className="truncate text-[12px] text-neutral-600 dark:text-neutral-400">{entry.field}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[12px] text-neutral-600 dark:text-neutral-400">
                  {new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium' }).format(entry.changedAt)}
                  {copyButton(`h-${index}`, entry.password, entry.field ?? label('apikey.key'), entry.field ? t('fields.copy', { name: entry.field }) : undefined, { kind: 'history', index })}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
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
    case 'ssh':
      return { kind, title: '', privateKey: '', publicKey: '', fingerprint: '', notes: '' };
    case 'apikey':
      return blankApiKey();
  }
}

function draftOf(item: WalletItem): WalletDraft {
  const { id: _, createdAt: __, updatedAt: ___, lastUsedAt: ____, deletedAt: _____, versions: ______, ...draft } = item;
  // An API key's history is the vault's to keep: an edit never sends it.
  if (draft.kind === 'apikey') {
    const { history: _______, ...rest } = draft;
    return rest;
  }
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
    case 'ssh':
      // The key itself, read: a name alone is no SSH key, and one that did not read has no public key.
      return Boolean(draft.privateKey.trim() && draft.publicKey);
    case 'apikey':
      return Boolean(draft.key.trim());
  }
}

const HEADINGS: Record<WalletKind, { new: MessageKey; edit: MessageKey; empty: MessageKey }> = {
  card: { new: 'card.newTitle', edit: 'card.editTitle', empty: 'card.empty' },
  address: { new: 'address.newTitle', edit: 'address.editTitle', empty: 'address.empty' },
  note: { new: 'note.newTitle', edit: 'note.editTitle', empty: 'note.empty' },
  ssh: { new: 'ssh.newTitle', edit: 'ssh.editTitle', empty: 'ssh.hint' },
  apikey: { new: 'apikey.newTitle', edit: 'apikey.editTitle', empty: 'apikey.empty' },
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
        {draft.kind === 'ssh' && <SshForm draft={draft} onChange={setDraft} autoFocus={!item} />}
        {draft.kind === 'apikey' && <ApiKeyForm draft={draft} onChange={setDraft} autoFocus={!item} />}
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

/**
 * An SSH key's form. The public key and the fingerprint are never typed: they
 * are read from the private key as it is pasted (or made), so the three can
 * never disagree. The name is the comment the public key carries.
 */
function SshForm({ draft, onChange, autoFocus }: FormProps<Extract<WalletDraft, { kind: 'ssh' }>>) {
  const t = useT();
  const latest = useRef(draft);
  latest.current = draft;
  const [unread, setUnread] = useState(false);
  const { busy, error, run } = useAction();
  const set = (patch: Partial<typeof draft>) => onChange({ ...draft, ...patch });

  useEffect(() => {
    let stale = false;
    const { privateKey, title } = draft;
    const read = privateKey.trim() ? readSshKey(privateKey, title).catch(() => null) : Promise.resolve(null);
    void read.then((info) => {
      if (stale) return;
      setUnread(Boolean(privateKey.trim()) && !info);
      const { publicKey, fingerprint } = info ?? { publicKey: '', fingerprint: '' };
      if (latest.current.publicKey !== publicKey || latest.current.fingerprint !== fingerprint) onChange({ ...latest.current, publicKey, fingerprint });
    });
    return () => {
      stale = true;
    };
    // Read again only when what it is read from changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.privateKey, draft.title]);

  return (
    <>
      <Field label={t('note.title')} value={draft.title} onChange={(event) => set({ title: event.target.value })} autoFocus={autoFocus} />
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="ssh-private"
          aside={
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void run(async () => set({ privateKey: (await generateSshKey(draft.title)).privateKey }))}>
              {t('edit.generate')}
            </Button>
          }
        >
          {t('ssh.privateKey')}
        </Label>
        <textarea
          id="ssh-private"
          rows={7}
          value={draft.privateKey}
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          onChange={(event) => set({ privateKey: event.target.value })}
          className={cx(TEXTAREA, 'font-mono text-[11px]')}
        />
        <p className={cx('text-[12px]', unread ? 'text-red-700 dark:text-red-300' : 'text-neutral-600 dark:text-neutral-400')} data-testid="ssh-hint">
          {t('ssh.hint')}
        </p>
        {error && <Callout tone="danger">{error}</Callout>}
      </div>
      {draft.fingerprint && (
        <div className="flex flex-col gap-0.5 text-[12px]">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">{t('ssh.fingerprint')}</span>
          <span className="font-mono break-all" data-testid="ssh-fingerprint">
            {draft.fingerprint}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ssh-notes">{t('item.notes')}</Label>
        <textarea id="ssh-notes" rows={3} value={draft.notes} onChange={(event) => set({ notes: event.target.value })} className={TEXTAREA} />
      </div>
    </>
  );
}

const MONO_INPUT =
  'h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 font-mono text-[13px] text-neutral-900 focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50';

/**
 * An API key's form. A key pasted with a service's prefix names the service,
 * and the service brings where its keys go and the variable they go by; the
 * owner may change any of it. How a request carries the key comes with the
 * service, and stays as it is.
 */
function ApiKeyForm({ draft, onChange, autoFocus }: FormProps<Extract<WalletDraft, { kind: 'apikey' }>>) {
  const t = useT();
  const set = (patch: Partial<typeof draft>) => onChange({ ...draft, ...patch });
  const services = useMemo(() => apiServiceChoices(), []);
  // The hosts as typed, read into the draft as they are: a half-typed one would otherwise vanish under the cursor.
  const [hostsText, setHostsText] = useState(draft.hosts.join('\n'));
  useEffect(() => {
    if (cleanHosts(hostsText).join('\n') !== draft.hosts.join('\n')) setHostsText(draft.hosts.join('\n'));
    // Only when the service brought hosts of its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.hosts]);
  const keyChanged = (key: string) => {
    // A service named by the key's own prefix, where its owner has named none.
    const found = draft.service ? null : serviceOfKey(key, draft.keyId);
    onChange(found ? withService({ ...draft, key }, found) : { ...draft, key });
  };
  return (
    <>
      <Field label={t('edit.title')} hint={t('apikey.titleHint')} value={draft.title} onChange={(event) => set({ title: event.target.value })} autoFocus={autoFocus} />
      <div className="flex flex-col gap-1.5">
        {/* The mark's room is kept while there is none: a key pasted names its service, and nothing below may move under the cursor. */}
        <Label htmlFor="apikey-service" aside={draft.service ? <ApiKeyMark service={draft.service} size={24} /> : <span aria-hidden="true" className="h-6 w-6" />}>
          {t('apikey.service')}
        </Label>
        <Select id="apikey-service" label={t('apikey.service')} value={draft.service} onChange={(slug) => onChange(withService(draft, slug))}>
          <option value="">{t('apikey.serviceNone')}</option>
          {services.map(({ slug, name }) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
          {/* One the table does not list, from an import: shown as itself. */}
          {draft.service && !services.some((entry) => entry.slug === draft.service) && <option value={draft.service}>{serviceName(draft.service) || draft.service}</option>}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="apikey-key">{t('apikey.key')}</Label>
        <PasswordInput id="apikey-key" className="font-mono" value={draft.key} onChange={(event) => keyChanged(event.target.value)} />
      </div>
      <Field label={t('apikey.keyId')} hint={t('apikey.keyIdHint')} value={draft.keyId} onChange={(event) => set({ keyId: event.target.value })} autoComplete="off" spellCheck={false} className="font-mono" />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="apikey-hosts">{t('apikey.hosts')}</Label>
        <textarea
          id="apikey-hosts"
          rows={2}
          value={hostsText}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          onChange={(event) => {
            setHostsText(event.target.value);
            set({ hosts: cleanHosts(event.target.value) });
          }}
          className={cx(TEXTAREA, 'font-mono text-[12px]')}
        />
        <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{t('apikey.hostsHint')}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label={t('apikey.environment')} placeholder={t('apikey.environmentHint')} value={draft.environment} onChange={(event) => set({ environment: event.target.value })} autoComplete="off" />
        <Field label={t('apikey.scopes')} value={draft.scopes} onChange={(event) => set({ scopes: event.target.value })} autoComplete="off" spellCheck={false} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="apikey-env">{t('apikey.env')}</Label>
        <input id="apikey-env" value={draft.env} spellCheck={false} autoComplete="off" onChange={(event) => set({ env: cleanEnvName(event.target.value) })} className={MONO_INPUT} />
        <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{t('apikey.envHint')}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="apikey-issued">{t('apikey.issued')}</Label>
          <input id="apikey-issued" type="date" value={dayText(draft.issuedAt)} onChange={(event) => set({ issuedAt: dayOf(event.target.value) })} className={cx(MONO_INPUT, 'font-sans')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="apikey-expires">{t('apikey.expires')}</Label>
          <input id="apikey-expires" type="date" value={dayText(draft.expiresAt)} onChange={(event) => set({ expiresAt: dayOf(event.target.value) })} className={cx(MONO_INPUT, 'font-sans')} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="apikey-notes">{t('item.notes')}</Label>
        <textarea id="apikey-notes" rows={3} value={draft.notes} onChange={(event) => set({ notes: event.target.value })} className={TEXTAREA} />
      </div>
    </>
  );
}
