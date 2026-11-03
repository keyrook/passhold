import { useMemo, useState, type FormEvent } from 'react';
import { checkup, everyItem, loginIssues, settleFolder, type DeviceCredential, type LoginItem, type VaultData, type VaultPlace, type VaultSecret, type WalletItem, type WalletKind } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { EditScreen } from '../popup/EditScreen.js';
import { ItemScreen } from '../popup/ItemScreen.js';
import { WalletEditScreen, WalletItemScreen } from '../popup/WalletScreens.js';
import { send } from '../lib/messaging.js';
import { FolderFilter, foldersOf, shownFolder, unfiledCount } from '../ui/Folders.js';
import { useAction, useCopy } from '../ui/hooks.js';
import { CheckIcon, CopyIcon, EditIcon, FingerprintIcon, FolderIcon, SearchIcon, StarIcon, UserIcon } from '../ui/icons.js';
import { AddMenu, KindChips, type Shown } from '../ui/Kinds.js';
import { atPlace, PlaceContext, PlaceTabs, samePlace, sharedVaults, type SharedVault } from '../ui/place.js';
import { Button, Callout, cx } from '../ui/primitives.js';
import { SiteMark } from '../ui/SiteMark.js';
import { entriesOf, NONE_OF, walletLine, walletName } from '../ui/wallet.js';
import { WalletMark } from '../ui/WalletMark.js';
import { CheckupPanel } from './CheckupPanel.js';
import { Choice, Muted, PageHeader, Section } from './Section.js';
import { TrashPanel } from './TrashPanel.js';

export type PasswordsView = 'all' | 'attention' | 'trash';

type Open =
  | { name: 'list' }
  | { name: 'item'; id: string }
  | { name: 'edit'; id: string | null }
  | { name: 'wallet'; id: string }
  | { name: 'walletEdit'; kind: WalletKind; id: string | null };

/** Settings' card for one login: the popup's own screen, as tall as what it shows. */
const CARD = 'min-h-[440px]';

/**
 * Every login and passkey, in a page of its own — as Google Password Manager
 * has one: searched, opened, copied from and changed here, with what needs
 * attention and the trash one click away, rather than in a popup the size of
 * a phone.
 */
export function PasswordsPanel(props: {
  data: VaultData;
  secret: VaultSecret;
  device: DeviceCredential | null;
  linked: boolean;
  view: PasswordsView;
  onView: (view: PasswordsView) => void;
  onBackUp: () => void;
  onSecurity: () => void;
}) {
  const shared = useMemo(() => sharedVaults(props.data), [props.data]);
  const [chosen, setChosen] = useState<VaultPlace | null>(null);
  // A shared vault gone from this browser leaves the vault's own shown.
  const place = shared.some((entry) => samePlace(entry.place, chosen)) ? chosen : null;
  return (
    <PlaceContext.Provider value={place}>
      <PasswordsAt key={place ? `${place.orgId}:${place.vaultId}` : 'mine'} {...props} vault={props.data} data={atPlace(props.data, place)} shared={shared} place={place} onPlace={setChosen} />
    </PlaceContext.Provider>
  );
}

/** The panel for one place: the vault's own — its checkup and every trash — or a shared vault's logins and the rest. */
function PasswordsAt({
  vault,
  data,
  shared,
  place,
  onPlace,
  secret,
  device,
  linked,
  view,
  onView,
  onBackUp,
  onSecurity,
}: {
  vault: VaultData;
  data: VaultData;
  shared: SharedVault[];
  place: VaultPlace | null;
  onPlace: (place: VaultPlace | null) => void;
  secret: VaultSecret;
  device: DeviceCredential | null;
  linked: boolean;
  view: PasswordsView;
  onView: (view: PasswordsView) => void;
  onBackUp: () => void;
  onSecurity: () => void;
}) {
  const t = useT();
  const [open, setOpen] = useState<Open>({ name: 'list' });
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<Shown>('all');
  const [chosenFolder, setFolder] = useState<string | null>(null);
  const [renamedFrom, setRenamedFrom] = useState<string | null>(null);
  const { copied, copy } = useCopy();

  const folders = useMemo(() => foldersOf(data, t.locale), [data, t.locale]);
  const folder = shownFolder(chosenFolder, folders, renamedFrom);
  const choose = (next: string | null) => {
    setFolder(next);
    setRenamedFrom(null);
  };
  const live = useMemo(() => entriesOf(data, 'all', '', t).length, [data, t]);
  const entries = useMemo(() => entriesOf(data, kind, query, t, folder), [data, kind, query, t, folder]);
  const issues = useMemo(() => checkup(vault, Date.now(), linked).issues, [vault, linked]);
  // Every trash: the vault's own and each shared vault's, which the trash shows together.
  const trashed = useMemo(() => {
    const every = everyItem(vault);
    return [...every.items, ...every.wallet].filter((item) => item.deletedAt !== null).length;
  }, [vault]);

  if (open.name === 'item') {
    const item = data.items.find((entry) => entry.id === open.id);
    if (item) {
      return (
        <Section>
          <ItemScreen
            item={item}
            data={data}
            shared={place ? [] : shared}
            className={CARD}
            onBack={() => setOpen({ name: 'list' })}
            onEdit={() => setOpen({ name: 'edit', id: item.id })}
          />
        </Section>
      );
    }
  }
  if (open.name === 'edit') {
    const item = open.id ? data.items.find((entry) => entry.id === open.id) ?? null : null;
    return (
      <Section>
        <EditScreen
          item={item}
          settings={data.settings}
          defaultUrl={null}
          folders={folders}
          defaultFolder={folder ?? ''}
          className={CARD}
          onDone={(id) => setOpen(id ? { name: 'item', id } : { name: 'list' })}
        />
      </Section>
    );
  }
  if (open.name === 'wallet') {
    const item = data.wallet.find((entry) => entry.id === open.id);
    if (item) {
      return (
        <Section>
          <WalletItemScreen
            item={item}
            shared={place ? [] : shared}
            className={CARD}
            onBack={() => setOpen({ name: 'list' })}
            onEdit={() => setOpen({ name: 'walletEdit', kind: item.kind, id: item.id })}
          />
        </Section>
      );
    }
  }
  if (open.name === 'walletEdit') {
    const item = open.id ? data.wallet.find((entry) => entry.id === open.id) ?? null : null;
    return (
      <Section>
        <WalletEditScreen
          kind={open.kind}
          item={item}
          folders={folders}
          defaultFolder={folder ?? ''}
          className={CARD}
          onDone={(id) => setOpen(id ? { name: 'wallet', id } : { name: 'list' })}
        />
      </Section>
    );
  }

  return (
    <>
      <PageHeader
        title={t('nav.passwords')}
        description={t('passwords.description')}
        action={<AddMenu wide onAdd={(next) => setOpen(next === 'login' ? { name: 'edit', id: null } : { name: 'walletEdit', kind: next, id: null })} />}
      />
      <div className="mb-5">
        <Choice<PasswordsView>
          label={t('nav.passwords')}
          value={view}
          options={[
            { value: 'all', label: `${t('passwords.all')} · ${live}` },
            { value: 'attention', label: issues ? `${t('passwords.attention')} · ${issues}` : t('passwords.attention') },
            { value: 'trash', label: trashed ? `${t('settings.trash')} · ${trashed}` : t('settings.trash') },
          ]}
          onChange={onView}
        />
      </div>

      {view === 'attention' && (
        <CheckupPanel data={vault} secret={secret} device={device} linked={linked} onBackUp={onBackUp} onSecurity={onSecurity} />
      )}
      {view === 'trash' && <TrashPanel data={vault} />}
      {view === 'all' && (
        <>
          {shared.length > 0 && (
            <div className="mb-4">
              <PlaceTabs shared={shared} value={place} onChange={onPlace} />
            </div>
          )}
          <label className="relative mb-3 block">
            <span className="sr-only">{t('vault.search')}</span>
            <SearchIcon className="pointer-events-none absolute start-3 top-3 h-4 w-4 text-neutral-500" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('vault.search')}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white pe-3 ps-9 text-sm placeholder:text-neutral-400 focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900"
            />
          </label>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <KindChips value={kind} onChange={setKind} />
            <FolderFilter folders={folders} unfiled={unfiledCount(data)} value={folder} onChange={choose} align="end" />
          </div>
          {/* Renaming a folder is the vault's own: a shared vault's folders are filed by everyone in the family. */}
          {folder && !place && (
            <FolderBar
              key={folder}
              folder={folder}
              count={folders.find((entry) => entry.name === folder)?.count ?? 0}
              data={data}
              onRenamed={(to) => {
                setRenamedFrom(folder);
                setFolder(to);
              }}
            />
          )}
          {live === 0 && kind === 'all' ? (
            <Section>
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <p className="font-semibold">{t('vault.empty')}</p>
                <Muted>{t('vault.emptyBody')}</Muted>
              </div>
            </Section>
          ) : entries.length === 0 ? (
            <Muted>{query ? t('vault.noResults', { query }) : folder !== null ? t('folders.nothingHere') : kind === 'all' ? t('vault.noResults', { query }) : t(NONE_OF[kind])}</Muted>
          ) : (
            <Section>
              <ul>
                {entries.map((entry) =>
                  entry.kind === 'login' ? (
                    <LoginRow key={entry.item.id} item={entry.item} data={data} copied={copied} onCopy={copy} onOpen={() => setOpen({ name: 'item', id: entry.item.id })} />
                  ) : (
                    <WalletLine key={entry.item.id} item={entry.item} copied={copied} onCopy={copy} onOpen={() => setOpen({ name: 'wallet', id: entry.item.id })} />
                  ),
                )}
              </ul>
            </Section>
          )}
        </>
      )}
    </>
  );
}

/**
 * The folder the list shows, and what can be done with it: renamed — into
 * another's name, the two become one — or taken away, its items kept.
 */
function FolderBar({ folder, count, data, onRenamed }: { folder: string; count: number; data: VaultData; onRenamed: (folder: string | null) => void }) {
  const t = useT();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(folder);
  const { busy, error, run } = useAction();
  const rename = (to: string) =>
    void run(async () => {
      // Where the items land, as the worker will settle it: a folder already there keeps its own spelling.
      const rest = { items: data.items.filter((item) => item.folder !== folder), wallet: data.wallet.filter((item) => item.folder !== folder) };
      const landed = settleFolder(rest, to);
      await send({ type: 'vault/mutate', mutation: { op: 'folder/rename', from: folder, to } });
      onRenamed(landed || null);
    });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim() && name.trim() !== folder) rename(name);
    else setRenaming(false);
  };

  return (
    <div className="mb-4 flex flex-col gap-2" data-testid="folder-bar">
      {renaming ? (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <label htmlFor="folder-name" className="sr-only">
            {t('folders.renameTo')}
          </label>
          <input
            id="folder-name"
            autoFocus
            value={name}
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            className="h-8 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
          />
          <Button size="sm" onClick={() => setRenaming(false)}>
            {t('common.cancel')}
          </Button>
          <Button size="sm" type="submit" variant="primary" disabled={busy}>
            {t('common.save')}
          </Button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <FolderIcon className="h-[18px] w-[18px] shrink-0 text-neutral-500" />
            <span className="truncate text-[14px] font-semibold">{folder}</span>
            <span className="shrink-0 text-[12.5px] text-neutral-600 dark:text-neutral-400">{t('folders.count', { count })}</span>
          </span>
          <Button size="sm" variant="ghost" onClick={() => setRenaming(true)}>
            <EditIcon className="h-4 w-4" /> {t('folders.rename')}
          </Button>
          <Button size="sm" variant="ghost" title={t('folders.removeHint')} disabled={busy} onClick={() => rename('')}>
            {t('folders.remove')}
          </Button>
        </div>
      )}
      {error && <Callout tone="danger">{error}</Callout>}
    </div>
  );
}

function LoginRow({
  item,
  data,
  copied,
  onCopy,
  onOpen,
}: {
  item: LoginItem;
  data: VaultData;
  copied: string | null;
  onCopy: (id: string, text: string) => Promise<void>;
  onOpen: () => void;
}) {
  const t = useT();
  const { weak, reusedWith } = loginIssues(data, item);
  return (
    <li className="group flex items-center gap-2 border-b border-neutral-100 pe-3 last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800/80 dark:hover:bg-neutral-900">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-start">
        <SiteMark title={item.title} urls={item.urls} size={32} />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5 text-[13.5px] font-medium">
            <span className="truncate">{item.title || item.username}</span>
            {item.passkey && <FingerprintIcon className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-300" aria-label={t('item.passkey')} role="img" />}
            {item.favorite && <StarIcon className="h-3.5 w-3.5 shrink-0 text-yellow-600" aria-label={t('item.favorite')} role="img" />}
          </span>
          <span className="truncate text-[12.5px] text-neutral-600 dark:text-neutral-400">{item.username || t('vault.noUsername')}</span>
        </span>
      </button>
      {(weak || reusedWith > 0) && (
        <span className="flex shrink-0 gap-1">
          {weak && <Pill>{t('passwords.weak')}</Pill>}
          {reusedWith > 0 && <Pill>{t('passwords.reused')}</Pill>}
        </span>
      )}
      <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        {item.username && (
          <Button size="sm" variant="ghost" aria-label={t('vault.copyUsername')} title={t('vault.copyUsername')} onClick={() => void onCopy(`${item.id}:u`, item.username)}>
            {copied === `${item.id}:u` ? <CheckIcon className="h-4 w-4 text-green-700 dark:text-green-300" /> : <UserIcon className="h-4 w-4" />}
          </Button>
        )}
        {item.password && (
          <Button size="sm" variant="ghost" aria-label={t('vault.copyPassword')} title={t('vault.copyPassword')} onClick={() => void onCopy(`${item.id}:p`, item.password)}>
            {copied === `${item.id}:p` ? <CheckIcon className="h-4 w-4 text-green-700 dark:text-green-300" /> : <CopyIcon className="h-4 w-4" />}
          </Button>
        )}
      </span>
    </li>
  );
}

function WalletLine({
  item,
  copied,
  onCopy,
  onOpen,
}: {
  item: WalletItem;
  copied: string | null;
  onCopy: (id: string, text: string) => Promise<void>;
  onOpen: () => void;
}) {
  const t = useT();
  return (
    <li className="group flex items-center gap-2 border-b border-neutral-100 pe-3 last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800/80 dark:hover:bg-neutral-900">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-start">
        <WalletMark item={item} size={32} />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5 text-[13.5px] font-medium">
            <span className="truncate">{walletName(item, t)}</span>
            {item.favorite && <StarIcon className="h-3.5 w-3.5 shrink-0 text-yellow-600" aria-label={t('item.favorite')} role="img" />}
          </span>
          <span className="truncate text-[12.5px] text-neutral-600 dark:text-neutral-400">{walletLine(item, t)}</span>
        </span>
      </button>
      {item.kind === 'card' && item.number && (
        <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <Button size="sm" variant="ghost" aria-label={t('card.copyNumber')} title={t('card.copyNumber')} onClick={() => void onCopy(`${item.id}:n`, item.number)}>
            {copied === `${item.id}:n` ? <CheckIcon className="h-4 w-4 text-green-700 dark:text-green-300" /> : <CopyIcon className="h-4 w-4" />}
          </Button>
        </span>
      )}
    </li>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <span className={cx('rounded-md bg-yellow-50 px-1.5 py-0.5 text-[11.5px] font-medium text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300')}>{children}</span>
  );
}
