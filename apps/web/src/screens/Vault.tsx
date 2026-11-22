import { useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { type LoginItem, type Secret, type VaultData, type VaultPlace, type WalletItem, type WalletKind } from '@passhold/core';
import { useT } from '../../../extension/src/i18n/react.js';
import type { AccountView, VaultStatus } from '../../../extension/src/lib/messaging.js';
import { TrashPanel } from '../../../extension/src/options/TrashPanel.js';
import { EditScreen } from '../../../extension/src/popup/EditScreen.js';
import { ItemScreen } from '../../../extension/src/popup/ItemScreen.js';
import { WalletEditScreen, WalletItemScreen } from '../../../extension/src/popup/WalletScreens.js';
import { FamilyNotices } from '../../../extension/src/ui/FamilyNotices.js';
import { FilesContext } from '../../../extension/src/ui/Files.js';
import { FolderFilter, foldersOf, shownFolder, unfiledCount } from '../../../extension/src/ui/Folders.js';
import { useCopy } from '../../../extension/src/ui/hooks.js';
import { BackIcon, CheckIcon, CopyIcon, ExternalIcon, FingerprintIcon, LockIcon, SearchIcon, StarIcon, TrashIcon, UserIcon } from '../../../extension/src/ui/icons.js';
import { AddMenu, KindChips, type AddKind, type Shown } from '../../../extension/src/ui/Kinds.js';
import { atPlace, organiserAt, PlaceContext, PlaceTabs, samePlace, sharedVaults, viewOnlyAt, ViewOnlyContext } from '../../../extension/src/ui/place.js';
import { PlanContext } from '../../../extension/src/ui/plan.js';
import { RevealContext, type Reveal } from '../../../extension/src/ui/secrets.js';
import { Brand } from '../../../extension/src/popup/Header.js';
import { Button, Callout, cx, Spinner } from '../../../extension/src/ui/primitives.js';
import { SiteMark } from '../../../extension/src/ui/SiteMark.js';
import { entriesOf, NONE_OF, walletLine, walletName } from '../../../extension/src/ui/wallet.js';
import { WalletMark } from '../../../extension/src/ui/WalletMark.js';
import { ask, onChanged } from '../client.js';
import type { SyncState } from '../protocol.js';
import { LOCK_CHOICES, type LockMinutes } from '../session.js';
import { useSay } from '../ui.js';
import { fill, WORDS } from '../words.js';


type View =
  | { name: 'none' }
  | { name: 'item'; id: string }
  | { name: 'edit'; id: string | null }
  | { name: 'wallet'; id: string }
  | { name: 'walletEdit'; kind: WalletKind; id: string | null }
  | { name: 'trash' };

type Unlocked = Extract<VaultStatus, { state: 'unlocked' }>;

/**
 * The open vault: the list and the item side by side from 600 pixels wide,
 * one at a time below — search at the top, the list, then the item, and
 * back. Every control is large enough for a finger and none waits on a hover.
 */
export function VaultScreen({
  status,
  lockMinutes,
  onLockMinutes,
  onLock,
  onSignOut,
}: {
  status: Unlocked;
  lockMinutes: LockMinutes;
  onLockMinutes: (minutes: LockMinutes) => void;
  onLock: () => void;
  onSignOut: () => void;
}) {
  const vault = status.data;
  const shared = useMemo(() => sharedVaults(vault), [vault]);
  const [chosen, setChosen] = useState<VaultPlace | null>(null);
  // A shared vault gone meanwhile leaves the vault's own shown.
  const place = shared.some((entry) => samePlace(entry.place, chosen)) ? chosen : null;
  const [view, setView] = useState<View>({ name: 'none' });
  const go = (next: VaultPlace | null) => {
    setChosen(next);
    setView({ name: 'none' });
  };
  return (
    <RevealContext.Provider value={reveal}>
    <PlanContext.Provider value={status.plan}>
      <PlaceContext.Provider value={place}>
        <ViewOnlyContext.Provider value={viewOnlyAt(vault, place)}>
          {/* Files are chosen here, in the page itself: nothing closes when a file chooser opens. */}
          <FilesContext.Provider value={{ linked: true, organiser: organiserAt(vault, place), settings: true }}>
            <div className="safe h-dvh">
            <div className="flex h-full flex-col">
              <TopBar account={status.account!} lockMinutes={lockMinutes} onLockMinutes={onLockMinutes} onLock={onLock} onSignOut={onSignOut} onTrash={() => setView({ name: 'trash' })} />
              <div className="flex min-h-0 flex-1">
                <aside
                  className={cx(
                    'min-h-0 w-full flex-col border-neutral-200 dark:border-neutral-800 min-[600px]:flex min-[600px]:w-[340px] min-[600px]:shrink-0 min-[600px]:border-e min-[900px]:w-[380px]',
                    view.name === 'none' ? 'flex' : 'hidden',
                  )}
                  aria-label={WORDS.items}
                >
                  <List key={place ? `${place.orgId}:${place.vaultId}` : 'mine'} vault={vault} account={status.account!} place={place} shared={shared} view={view} onView={setView} onPlace={go} />
                </aside>
                <section className={cx('min-h-0 min-w-0 flex-1 flex-col', view.name === 'none' ? 'hidden min-[600px]:flex' : 'flex')}>
                  <Detail vault={vault} place={place} view={view} onView={setView} />
                </section>
              </div>
            </div>
            </div>
          </FilesContext.Provider>
        </ViewOnlyContext.Provider>
      </PlaceContext.Provider>
    </PlanContext.Provider>
    </RevealContext.Provider>
  );
}

/** A hidden value, asked of the worker as it is shown or copied: the screens hold none until then (`hideSecrets`). */
const reveal: Reveal = (itemId, secret) => ask<string>({ type: 'item/reveal', id: itemId, secret });

/** The brand, whether what changed has reached the account, a lock, and the menu. */
function TopBar({
  account,
  lockMinutes,
  onLockMinutes,
  onLock,
  onSignOut,
  onTrash,
}: {
  account: AccountView;
  lockMinutes: LockMinutes;
  onLockMinutes: (minutes: LockMinutes) => void;
  onLock: () => void;
  onSignOut: () => void;
  onTrash: () => void;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <header className="relative flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
      <Brand />
      <div className="flex items-center gap-1">
        <SyncBadge />
        <Button variant="ghost" aria-label={WORDS.lock} title={WORDS.lock} onClick={onLock} data-testid="lock">
          <LockIcon className="h-5 w-5" />
          <span className="max-[420px]:sr-only">{WORDS.lock}</span>
        </Button>
        <Button variant="ghost" aria-expanded={menu} aria-haspopup="menu" onClick={() => setMenu((open) => !open)} data-testid="menu">
          <span aria-hidden="true" className="text-lg leading-none">⋯</span>
          <span className="sr-only">{WORDS.menu}</span>
        </Button>
      </div>
      {menu && (
        <Menu
          account={account}
          lockMinutes={lockMinutes}
          onLockMinutes={onLockMinutes}
          onClose={() => setMenu(false)}
          onTrash={() => {
            setMenu(false);
            onTrash();
          }}
          onSignOut={onSignOut}
        />
      )}
    </header>
  );
}

/** Saving, or not saved yet: a change lives in this tab until the account has it. */
function SyncBadge() {
  const [state, setState] = useState<SyncState | null>(null);
  useEffect(() => {
    const read = () => void ask<SyncState>({ type: 'web/syncState' }).then(setState).catch(() => undefined);
    read();
    return onChanged(read);
  }, []);
  if (!state) return null;
  if (state.failed) {
    return (
      <Button
        variant="ghost"
        className="text-yellow-800 dark:text-yellow-300"
        title={WORDS.notSent}
        aria-description={WORDS.notSent}
        onClick={() => void ask({ type: 'account/sync' }).catch(() => undefined)}
        data-testid="not-sent"
      >
        {WORDS.tryAgain}
      </Button>
    );
  }
  if (!state.syncing && !state.unsent) return null;
  return (
    <span className="flex items-center gap-1.5 px-2 text-[13px] text-neutral-600 dark:text-neutral-400" role="status">
      <Spinner /> {WORDS.syncing}
    </span>
  );
}

/** What the vault's own page does not hold: the lock time, the trash, the account's own page, and signing out. */
function Menu({
  account,
  lockMinutes,
  onLockMinutes,
  onClose,
  onTrash,
  onSignOut,
}: {
  account: AccountView;
  lockMinutes: LockMinutes;
  onLockMinutes: (minutes: LockMinutes) => void;
  onClose: () => void;
  onTrash: () => void;
  onSignOut: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node)) onClose();
    };
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    addEventListener('pointerdown', away, true);
    addEventListener('keydown', escape);
    return () => {
      removeEventListener('pointerdown', away, true);
      removeEventListener('keydown', escape);
    };
  }, [onClose]);
  // The account's views, by the names the account's page keeps for them.
  const link = (hash: string, label: string) => (
    <a
      href={`${__KEYROOK_ACCOUNT_PAGE__}/#${hash}`}
      rel="noopener noreferrer"
      target="_blank"
      className="flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 text-[14px] hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      {label}
      <ExternalIcon className="h-4 w-4 shrink-0 text-neutral-500" />
    </a>
  );
  return (
    <div
      ref={panel}
      role="menu"
      className="absolute end-2 top-full z-20 mt-1 flex w-[min(20rem,calc(100vw-1rem))] flex-col gap-1 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
      data-testid="menu-panel"
    >
      <p className="truncate px-3 pb-1 pt-2 text-[13px] text-neutral-600 dark:text-neutral-400">{account.email}</p>
      <div className="flex flex-col gap-1.5 px-3 py-2">
        <span className="text-[13px] font-medium">{WORDS.lockAfter}</span>
        <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={WORDS.lockAfter}>
          {LOCK_CHOICES.map((minutes) => (
            <button
              key={minutes}
              type="button"
              role="radio"
              aria-checked={minutes === lockMinutes}
              onClick={() => onLockMinutes(minutes)}
              className={cx(
                'min-h-11 min-w-11 rounded-lg px-2 text-[13px]',
                minutes === lockMinutes ? 'bg-brand-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800',
              )}
            >
              {fill(WORDS.minutes, { count: minutes })}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-neutral-600 dark:text-neutral-400">{WORDS.lockNote}</span>
      </div>
      <button type="button" onClick={onTrash} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-start text-[14px] hover:bg-neutral-100 dark:hover:bg-neutral-800" data-testid="open-trash">
        <TrashIcon className="h-4 w-4" /> {WORDS.trash}
      </button>
      <div className="border-t border-neutral-200 pt-1 dark:border-neutral-800">
        <p className="px-3 pb-1 pt-2 text-[12px] font-medium text-neutral-600 dark:text-neutral-400">{WORDS.account}</p>
        {link('devices', WORDS.devices)}
        {link('recovery', WORDS.recovery)}
        {link('passkeys', WORDS.passkeys)}
      </div>
      <button type="button" onClick={onSignOut} className="flex min-h-11 items-center rounded-lg px-3 text-start text-[14px] text-red-700 hover:bg-neutral-100 dark:text-red-300 dark:hover:bg-neutral-800" data-testid="sign-out">
        {WORDS.signOut}
      </button>
    </div>
  );
}

/** Live logins, favourites first, then by name in the reader's language. */
function List({
  vault,
  account,
  place,
  shared,
  view,
  onView,
  onPlace,
}: {
  vault: VaultData;
  account: AccountView;
  place: VaultPlace | null;
  shared: ReturnType<typeof sharedVaults>;
  view: View;
  onView: (view: View) => void;
  onPlace: (place: VaultPlace | null) => void;
}) {
  const t = useT();
  const viewOnly = useContext(ViewOnlyContext);
  const data = atPlace(vault, place);
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState<Shown>('all');
  const [chosenFolder, setFolder] = useState<string | null>(null);
  const { copied, copy } = useCopy();
  const folders = useMemo(() => foldersOf(data, t.locale), [data, t.locale]);
  const folder = shownFolder(chosenFolder, folders);
  const entries = useMemo(() => entriesOf(data, shown, query, t, folder), [data, shown, query, t, folder]);
  const live = data.items.filter((item) => item.deletedAt === null).length + data.wallet.filter((item) => item.deletedAt === null).length;
  const add = (kind: AddKind) => onView(kind === 'login' ? { name: 'edit', id: null } : { name: 'walletEdit', kind, id: null });
  const selected = view.name === 'item' || view.name === 'wallet' ? view.id : null;

  return (
    <>
      <div className="flex flex-col gap-2 px-3 pt-3">
        {shared.length > 0 && <PlaceTabs shared={shared} value={place} onChange={onPlace} />}
        <div className="flex items-center gap-2">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">{t('vault.search')}</span>
            <SearchIcon className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="search"
              inputMode="search"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('vault.search')}
              className="h-11 w-full rounded-xl border border-neutral-200 bg-white pe-3 ps-9 placeholder:text-neutral-400 focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900"
              data-testid="search"
            />
          </label>
          {!viewOnly && <AddMenu onAdd={add} />}
        </div>
        <KindChips value={shown} onChange={setShown} />
        {folders.length > 0 && <FolderFilter folders={folders} unfiled={unfiledCount(data)} value={folder} onChange={setFolder} />}
      </div>
      <div className="scrollarea min-h-0 flex-1 overflow-y-auto px-2 pb-4 pt-2">
        {viewOnly && !query && (
          <div className="mx-1 mb-2" data-testid="view-only">
            <Callout tone="info">{t('family.viewOnly')}</Callout>
          </div>
        )}
        {!query && (
          <div className="mx-1 mb-2 empty:hidden">
            <FamilyNotices data={vault} passwordless={account.passwordless} />
          </div>
        )}
        {!query && !place && account.kit === 'unchecked' && <KitCheck />}
        {live === 0 && shown === 'all' ? (
          <p className="px-4 pt-10 text-center text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('vault.empty')}</p>
        ) : entries.length === 0 ? (
          <p className="px-4 pt-10 text-center text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            {query ? t('vault.noResults', { query }) : folder !== null ? t('folders.nothingHere') : shown === 'all' ? t('vault.noResults', { query }) : t(NONE_OF[shown])}
          </p>
        ) : (
          <ul className="flex flex-col" data-testid="list">
            {entries.map((entry) =>
              entry.kind === 'login' ? (
                <LoginRow key={entry.item.id} item={entry.item} selected={selected === entry.item.id} copied={copied} onCopy={copy} onOpen={() => onView({ name: 'item', id: entry.item.id })} />
              ) : (
                <WalletRow key={entry.item.id} item={entry.item} selected={selected === entry.item.id} copied={copied} onCopy={copy} onOpen={() => onView({ name: 'wallet', id: entry.item.id })} />
              ),
            )}
          </ul>
        )}
      </div>
    </>
  );
}

/** One row: the whole row opens the item; its one copy button copies what is most asked for. */
function Row({ mark, title, line, badges, selected, onOpen, action }: { mark: ReactNode; title: string; line: string; badges?: ReactNode; selected: boolean; onOpen: () => void; action?: ReactNode }) {
  return (
    <li className={cx('flex items-center gap-1 rounded-xl', selected && 'bg-neutral-100 dark:bg-neutral-900')}>
      <button type="button" onClick={onOpen} aria-current={selected || undefined} className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-start active:bg-neutral-100 dark:active:bg-neutral-900">
        {mark}
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1 text-[15px] font-medium">
            <span className="truncate">{title}</span>
            {badges}
          </span>
          <span className="truncate text-[13px] text-neutral-600 dark:text-neutral-400">{line}</span>
        </span>
      </button>
      {action}
    </li>
  );
}

/** One tap: `secret`, a hidden value, is asked for as it is copied. */
function CopyButton({ id, itemId, secret, label, copied, onCopy, icon = <CopyIcon className="h-5 w-5" /> }: { id: string; itemId: string; secret: Secret; label: string; copied: string | null; onCopy: (id: string, text: string) => Promise<void>; icon?: ReactNode }) {
  return (
    <Button variant="ghost" className="h-11 w-11 shrink-0 px-0" aria-label={label} title={label} onClick={() => void reveal(itemId, secret).then((text) => onCopy(id, text)).catch(() => undefined)}>
      {copied === id ? <CheckIcon className="h-5 w-5 text-green-700 dark:text-green-300" /> : icon}
    </Button>
  );
}

function LoginRow({ item, selected, copied, onCopy, onOpen }: { item: LoginItem; selected: boolean; copied: string | null; onCopy: (id: string, text: string) => Promise<void>; onOpen: () => void }) {
  const t = useT();
  return (
    <Row
      mark={<SiteMark title={item.title} urls={item.urls} size={40} />}
      title={item.title || item.username}
      line={item.username || t('vault.noUsername')}
      selected={selected}
      onOpen={onOpen}
      badges={
        <>
          {item.passkey && <FingerprintIcon className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-300" aria-label={t('item.passkey')} role="img" />}
          {item.favorite && <StarIcon className="h-3.5 w-3.5 shrink-0 text-yellow-600" aria-label={t('item.favorite')} />}
        </>
      }
      action={item.password ? <CopyButton id={`${item.id}:p`} itemId={item.id} secret={{ kind: 'password' }} label={t('vault.copyPassword')} copied={copied} onCopy={onCopy} /> : undefined}
    />
  );
}

function WalletRow({ item, selected, copied, onCopy, onOpen }: { item: WalletItem; selected: boolean; copied: string | null; onCopy: (id: string, text: string) => Promise<void>; onOpen: () => void }) {
  const t = useT();
  return (
    <Row
      mark={<WalletMark item={item} size={40} />}
      title={walletName(item, t)}
      line={walletLine(item, t)}
      selected={selected}
      onOpen={onOpen}
      badges={item.favorite && <StarIcon className="h-3.5 w-3.5 shrink-0 text-yellow-600" aria-label={t('item.favorite')} />}
      action={item.kind === 'card' && item.number ? <CopyButton id={`${item.id}:n`} itemId={item.id} secret={{ kind: 'number' }} label={t('card.copyNumber')} copied={copied} onCopy={onCopy} /> : undefined}
    />
  );
}

/** The item chosen, its edit, or the trash; on a wide screen, a word in the empty pane. */
function Detail({ vault, place, view, onView }: { vault: VaultData; place: VaultPlace | null; view: View; onView: (view: View) => void }) {
  const data = atPlace(vault, place);
  const shared = useMemo(() => (place ? [] : sharedVaults(vault)), [vault, place]);
  const folders = useMemo(() => foldersOf(data, 'en'), [data]);
  const back = () => onView({ name: 'none' });
  switch (view.name) {
    case 'item': {
      const item = data.items.find((entry) => entry.id === view.id);
      if (!item) break;
      return (
        <WithCopyBar copies={loginCopies(item)}>
          <ItemScreen key={item.id} item={item} data={data} linked shared={shared} className="h-full min-h-0" onBack={back} onEdit={() => onView({ name: 'edit', id: item.id })} />
        </WithCopyBar>
      );
    }
    case 'edit':
      return (
        <Whole id={view.id}>
          {(item) => <EditScreen item={item as LoginItem | null} settings={vault.settings} defaultUrl={null} folders={folders} className="h-full min-h-0" onDone={(id) => onView(id ? { name: 'item', id } : { name: 'none' })} />}
        </Whole>
      );
    case 'wallet': {
      const item = data.wallet.find((entry) => entry.id === view.id);
      if (!item) break;
      return (
        <WithCopyBar copies={walletCopies(item)}>
          <WalletItemScreen key={item.id} item={item} shared={shared} className="h-full min-h-0" onBack={back} onEdit={() => onView({ name: 'walletEdit', kind: item.kind, id: item.id })} />
        </WithCopyBar>
      );
    }
    case 'walletEdit': {
      const kind = view.kind;
      return (
        <Whole id={view.id}>
          {(item) => <WalletEditScreen kind={kind} item={item as WalletItem | null} folders={folders} className="h-full min-h-0" onDone={(id) => onView(id ? { name: 'wallet', id } : { name: 'none' })} />}
        </Whole>
      );
    }
    case 'trash':
      return (
        <div className="flex h-full min-h-0 flex-col" data-testid="trash">
          <header className="flex items-center gap-1 border-b border-neutral-200 px-2 py-2 dark:border-neutral-800">
            <Button variant="ghost" aria-label={WORDS.back} title={WORDS.back} onClick={back}>
              <BackIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-[16px] font-semibold">{WORDS.trash}</h1>
          </header>
          <div className="scrollarea min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <TrashPanel data={vault} />
          </div>
        </div>
      );
    case 'none':
      break;
  }
  return <p className="m-auto max-w-xs px-6 text-center text-[14px] text-neutral-600 dark:text-neutral-400">{WORDS.choose}</p>;
}

/**
 * An item whole, for its edit screen, asked of the worker as the screen
 * opens: what is typed over is what the item holds. Gone with the screen. A
 * new item has nothing to ask for.
 */
function Whole({ id, children }: { id: string | null; children: (item: LoginItem | WalletItem | null) => ReactNode }) {
  const [item, setItem] = useState<LoginItem | WalletItem | null | undefined>(id ? undefined : null);
  useEffect(() => {
    if (!id) return setItem(null);
    let current = true;
    // Refused — locked meanwhile, gone from the vault — it draws nothing, rather than a new item's empty form.
    void ask<LoginItem | WalletItem>({ type: 'item/full', id }).then((whole) => current && setItem(whole), () => undefined);
    return () => {
      current = false;
    };
  }, [id]);
  return item === undefined ? null : <>{children(item)}</>;
}

interface Copy {
  id: string;
  itemId: string;
  /** A hidden value to ask for as it is copied, or what to copy as it is. */
  value: Secret | string;
  label: string;
  icon: ReactNode;
}

function loginCopies(item: LoginItem): (t: ReturnType<typeof useT>) => Copy[] {
  return (t) => [
    ...(item.password ? [{ id: 'bar:p', itemId: item.id, value: { kind: 'password' } as const, label: t('vault.copyPassword'), icon: <CopyIcon className="h-5 w-5" /> }] : []),
    ...(item.username ? [{ id: 'bar:u', itemId: item.id, value: item.username, label: t('vault.copyUsername'), icon: <UserIcon className="h-5 w-5" /> }] : []),
  ];
}

function walletCopies(item: WalletItem): (t: ReturnType<typeof useT>) => Copy[] {
  if (item.kind === 'apikey' && item.key) return (t) => [{ id: 'bar:k', itemId: item.id, value: { kind: 'key' } as const, label: t('wallet.copyField', { field: t('apikey.key').toLocaleLowerCase(t.locale) }), icon: <CopyIcon className="h-5 w-5" /> }];
  return (t) => (item.kind === 'card' && item.number ? [{ id: 'bar:n', itemId: item.id, value: { kind: 'number' } as const, label: t('card.copyNumber'), icon: <CopyIcon className="h-5 w-5" /> }] : []);
}

/**
 * An item, with what is most copied as the largest thing on it, at the foot
 * where a thumb is: a copied password is cleared after 30 seconds while the
 * page has focus, and the page says it may stay otherwise.
 */
function WithCopyBar({ copies, children }: { copies: (t: ReturnType<typeof useT>) => Copy[]; children: ReactNode }) {
  const t = useT();
  const { copied, copy } = useCopy();
  const list = copies(t);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1">{children}</div>
      {list.length > 0 && (
        <footer className="flex flex-col gap-1.5 border-t border-neutral-200 px-3 pb-3 pt-2 dark:border-neutral-800" data-testid="copy-bar">
          {/* Side by side where both read whole; one above the other on the narrowest phones. */}
          <div className="flex gap-2 max-[380px]:flex-col">
            {list.map((entry, index) => (
              <Button key={entry.id} variant={index === 0 ? 'primary' : 'secondary'} className="h-12 min-w-0 flex-1 rounded-2xl px-3 text-[15px] max-[380px]:flex-none" onClick={() => void (typeof entry.value === 'string' ? Promise.resolve(entry.value) : reveal(entry.itemId, entry.value)).then((text) => copy(entry.id, text)).catch(() => undefined)}>
                {copied === entry.id ? <CheckIcon className="h-5 w-5" /> : entry.icon}
                <span className="truncate">{copied === entry.id ? WORDS.copied : entry.label}</span>
              </Button>
            ))}
          </div>
          {copied && <p className="text-[12px] text-neutral-600 dark:text-neutral-400" role="status">{WORDS.copyNote}</p>}
        </footer>
      )}
    </div>
  );
}

/** The account's recovery key, made on the account's page and never seen to open the account by a Passhold: typed once here. */
function KitCheck() {
  const say = useSay();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [later, setLater] = useState(false);
  if (later) return null;
  const check = () => {
    setBusy(true);
    setError(null);
    void ask({ type: 'account/checkKit', recoveryKey: typed })
      .then(() => setTyped(''))
      .catch((caught: unknown) => setError(say(caught)))
      .finally(() => setBusy(false));
  };
  return (
    <div className="mx-1 mb-2" data-testid="check-kit">
      <Callout tone="info">
        <span className="flex flex-col items-start gap-2">
          <span className="font-medium">{WORDS.kitTitle}</span>
          <span>{WORDS.kitBody}</span>
          {open ? (
            <span className="flex w-full flex-col gap-2">
              <input
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 font-mono dark:border-neutral-800 dark:bg-neutral-900"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-label={WORDS.recoveryKey}
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
              />
              {error && <span className="text-red-700 dark:text-red-300">{error}</span>}
              <span className="flex gap-2">
                <Button variant="primary" disabled={busy || !typed.trim()} onClick={check}>
                  {busy ? <Spinner /> : WORDS.kitCheck}
                </Button>
                <Button variant="ghost" onClick={() => setLater(true)}>
                  {WORDS.later}
                </Button>
              </span>
            </span>
          ) : (
            <span className="flex gap-2">
              <Button variant="primary" onClick={() => setOpen(true)}>
                {WORDS.kitCheck}
              </Button>
              <Button variant="ghost" onClick={() => setLater(true)}>
                {WORDS.later}
              </Button>
            </span>
          )}
        </span>
      </Callout>
    </div>
  );
}
