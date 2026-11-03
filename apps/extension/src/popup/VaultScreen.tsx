import { useEffect, useMemo, useState } from 'react';
import { checkup, everyItem, placeOf, type LoginItem, type VaultData, type VaultPlace, type WalletItem, type WalletKind } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { send, type AccountView, type PageInfo, type PendingView } from '../lib/messaging.js';
import { useAction, useCopy } from '../ui/hooks.js';
import { CheckIcon, CloudCheckIcon, CloudOffIcon, CopyIcon, FingerprintIcon, KeyIcon, LockIcon, RefreshIcon, SearchIcon, SettingsIcon, StarIcon, UserIcon, UsersIcon } from '../ui/icons.js';
import { FolderFilter, foldersOf, shownFolder, unfiledCount } from '../ui/Folders.js';
import { AddMenu, KindChips, type AddKind, type Shown } from '../ui/Kinds.js';
import { Button, Callout, cx } from '../ui/primitives.js';
import { RatingAsk } from './RatingAsk.js';
import { RemovedNotice } from '../ui/RemovedNotice.js';
import { StartOverWarning } from '../ui/StartOverWarning.js';
import { SiteMark } from '../ui/SiteMark.js';
import { pendingWords } from '../ui/pending.js';
import { FamilyNotices } from '../ui/FamilyNotices.js';
import { atPlace, PlaceContext, PlaceTabs, samePlace, sharedVaults, type SharedVault } from '../ui/place.js';
import { entriesOf, NONE_OF, walletLine, walletName } from '../ui/wallet.js';
import { WalletMark } from '../ui/WalletMark.js';
import { ProviderButtons } from '../options/ProviderSignIn.js';
import { EditScreen } from './EditScreen.js';
import { Brand } from './Header.js';
import { ItemScreen } from './ItemScreen.js';
import { WalletEditScreen, WalletItemScreen } from './WalletScreens.js';

type View =
  | { name: 'list' }
  | { name: 'item'; id: string }
  | { name: 'edit'; id: string | null }
  | { name: 'wallet'; id: string }
  | { name: 'walletEdit'; kind: WalletKind; id: string | null };

/** Live logins, favourites first, then by name in the reader's language. */
function sorted(items: readonly LoginItem[], locale: string): LoginItem[] {
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });
  return items
    .filter((item) => item.deletedAt === null)
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || collator.compare(a.title, b.title));
}

/**
 * `account`: the Keyrook account it syncs with — the way back if the device
 * fails — or null. The list is of one place at a time: the vault's own, or a
 * family's shared vault, chosen above it once there is one.
 */
export function VaultScreen({ data: vault, account }: { data: VaultData; account: AccountView | null }) {
  const shared = useMemo(() => sharedVaults(vault), [vault]);
  const [chosen, setChosen] = useState<VaultPlace | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  // A shared vault gone from this browser — left, or no longer let into — leaves the vault's own shown.
  const place = shared.some((entry) => samePlace(entry.place, chosen)) ? chosen : null;
  const go = (next: VaultPlace | null, open: string | null = null) => {
    setOpening(open);
    setChosen(next);
  };
  return (
    <PlaceContext.Provider value={place}>
      <PlaceScreen
        key={place ? `${place.orgId}:${place.vaultId}` : 'mine'}
        vault={vault}
        data={atPlace(vault, place)}
        account={account}
        shared={shared}
        place={place}
        opening={opening}
        onPlace={go}
      />
    </PlaceContext.Provider>
  );
}

function PlaceScreen({
  vault,
  data,
  account,
  shared,
  place,
  opening,
  onPlace,
}: {
  vault: VaultData;
  data: VaultData;
  account: AccountView | null;
  shared: SharedVault[];
  place: VaultPlace | null;
  /** A login to open as this place is shown: one of its own, chosen from the logins for the page. */
  opening: string | null;
  onPlace: (place: VaultPlace | null, open?: string | null) => void;
}) {
  const linked = account !== null;
  const t = useT();
  const [view, setView] = useState<View>(opening ? { name: 'item', id: opening } : { name: 'list' });
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState<Shown>('all');
  const [chosenFolder, setFolder] = useState<string | null>(null);
  const [page, setPage] = useState<PageInfo | null>(null);
  const [pending, setPending] = useState<PendingView | null>(null);
  const { copied, copy } = useCopy();
  const { error, run } = useAction();

  useEffect(() => {
    void send({ type: 'page/info' }).then(setPage).catch(() => setPage({ site: null, url: null, loginIds: [] }));
    void send({ type: 'pending/view' }).then(setPending).catch(() => setPending(null));
  }, [data]);

  const all = useMemo(() => sorted(data.items, t.locale), [data.items, t.locale]);
  const live = all.length + data.wallet.filter((item) => item.deletedAt === null).length;
  const attention = useMemo(() => checkup(vault, Date.now(), linked).issues > 0, [vault, linked]);
  const folders = useMemo(() => foldersOf(data, t.locale), [data, t.locale]);
  const folder = shownFolder(chosenFolder, folders);
  const entries = useMemo(() => entriesOf(data, shown, query, t, folder), [data, shown, query, t, folder]);
  // The vault's own and every shared vault's, as the page's list draws them: each shared one named by its vault.
  const fillable = useMemo(() => everyItem(vault).items, [vault]);
  const onPage = useMemo(
    () => (page ? page.loginIds.map((id) => fillable.find((item) => item.id === id)).filter((item): item is LoginItem => Boolean(item)) : []),
    [fillable, page],
  );
  const openWhereItIs = (id: string) => {
    const where = placeOf(vault, id);
    if (where === undefined || samePlace(where, place)) setView({ name: 'item', id });
    else onPlace(where, id);
  };

  if (view.name === 'item') {
    const item = data.items.find((entry) => entry.id === view.id);
    if (item) {
      return (
        <ItemScreen
          item={item}
          data={data}
          shared={place ? [] : shared}
          onBack={() => setView({ name: 'list' })}
          onEdit={() => setView({ name: 'edit', id: item.id })}
        />
      );
    }
  }
  if (view.name === 'edit') {
    const item = view.id ? data.items.find((entry) => entry.id === view.id) ?? null : null;
    return (
      <EditScreen
        item={item}
        settings={data.settings}
        defaultUrl={page?.url ?? null}
        folders={folders}
        defaultFolder={folder ?? ''}
        onDone={(id) => setView(id ? { name: 'item', id } : { name: 'list' })}
      />
    );
  }
  if (view.name === 'wallet') {
    const item = data.wallet.find((entry) => entry.id === view.id);
    if (item) {
      return (
        <WalletItemScreen
          item={item}
          shared={place ? [] : shared}
          onBack={() => setView({ name: 'list' })}
          onEdit={() => setView({ name: 'walletEdit', kind: item.kind, id: item.id })}
        />
      );
    }
  }
  if (view.name === 'walletEdit') {
    const item = view.id ? data.wallet.find((entry) => entry.id === view.id) ?? null : null;
    return (
      <WalletEditScreen
        kind={view.kind}
        item={item}
        folders={folders}
        defaultFolder={folder ?? ''}
        onDone={(id) => setView(id ? { name: 'wallet', id } : { name: 'list' })}
      />
    );
  }

  const add = (kind: AddKind) => setView(kind === 'login' ? { name: 'edit', id: null } : { name: 'walletEdit', kind, id: null });
  const logins = shown === 'all' || shown === 'login';
  // Every login, whatever its folder: the list the logins for this page are drawn from.
  const everything = logins && folder === null;

  const fill = (item: LoginItem) =>
    void run(async () => {
      await send({ type: 'page/fill', id: item.id });
      window.close();
    });

  const pendingSays = pending && pendingWords(pending, t, 'popup');

  const answer = (choice: 'save' | 'never' | 'dismiss') =>
    void run(async () => {
      if (!pending) return;
      await send({ type: 'pending/answer', id: pending.id, answer: choice });
      setPending(null);
    });

  return (
    <div className="flex h-[560px] flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <Brand>{t('vault.count', { count: live })}</Brand>
        <div className="flex items-center gap-0.5">
          <AddMenu onAdd={add} />
          <Button
            size="sm"
            variant="ghost"
            className="relative"
            aria-label={t('vault.settings')}
            aria-description={attention ? t('nav.needsAttention') : undefined}
            title={attention ? `${t('vault.settings')} · ${t('nav.needsAttention')}` : t('vault.settings')}
            // Settings open on Passwords, where the dot points too; an open
            // settings tab is brought forward rather than a second opened.
            onClick={() => void chrome.runtime.openOptionsPage()}
          >
            <SettingsIcon className="h-[18px] w-[18px]" />
            {attention && <span aria-hidden="true" className="absolute end-1 top-1 h-2 w-2 rounded-full bg-yellow-500" data-testid="attention" />}
          </Button>
          <Button size="sm" variant="ghost" aria-label={t('vault.lock')} title={t('vault.lock')} onClick={() => void send({ type: 'vault/lock' })}>
            <LockIcon className="h-[18px] w-[18px]" />
          </Button>
        </div>
      </header>

      <div className="px-4 pt-3">
        {shared.length > 0 && (
          <div className="pb-3">
            <PlaceTabs shared={shared} value={place} onChange={onPlace} />
          </div>
        )}
        <label className="relative block">
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
        <div className="pt-2.5">
          <KindChips value={shown} onChange={setShown} />
        </div>
        {folders.length > 0 && (
          <div className="pt-1.5">
            <FolderFilter folders={folders} unfiled={unfiledCount(data)} value={folder} onChange={setFolder} />
          </div>
        )}
      </div>

      <div className="scrollarea flex-1 overflow-y-auto px-2 pb-3 pt-2">
        {error && (
          <div className="px-2 pb-2">
            <Callout tone="danger">{error}</Callout>
          </div>
        )}

        {!query && (
          <div className="mx-2 mb-2 empty:hidden">
            <FamilyNotices data={vault} passwordless={account?.passwordless ?? false} />
          </div>
        )}

        {account?.startOver && (
          <div className="mx-2 mb-2">
            <StartOverWarning startOver={account.startOver} />
          </div>
        )}

        {account?.removed && !query && (
          <div className="mx-2 mb-2">
            <RemovedNotice removedAt={account.removed} />
          </div>
        )}

        {/* A vault from before Passhold started with an account: the account is
            its way back, and to every other computer — asked for until it is on. */}
        {!linked && !query && (
          <div className="mx-2 mb-2" data-testid="connect-account">
            <Callout tone="info">
              <span className="flex flex-col items-start gap-2">
                <span className="font-medium">{t('connect.title')}</span>
                <span>{t('connect.body')}</span>
                <span className="flex flex-wrap items-start gap-2">
                  <ProviderButtons inNewTab compact />
                  <Button size="sm" variant="ghost" onClick={() => void chrome.tabs.create({ url: chrome.runtime.getURL('options.html#account') })}>
                    {t('connect.email')}
                  </Button>
                </span>
              </span>
            </Callout>
          </div>
        )}

        {/* The account's recovery key, made on account.keyrook.com or in
            another app, that no Passhold has seen open the account: typed
            once in the settings, so its owner learns it is lost while
            another can still be made. */}
        {account?.kit === 'unchecked' && !account.signedOut && !query && (
          <div className="mx-2 mb-2" data-testid="check-kit">
            <Callout tone="info">
              <span className="flex flex-col items-start gap-2">
                <span className="font-medium">{t('kitCheck.title')}</span>
                <span>{t('kitCheck.body')}</span>
                <Button size="sm" onClick={() => void chrome.tabs.create({ url: chrome.runtime.getURL('options.html#kit') })}>
                  {t('accountKit.typeIt')}
                </Button>
              </span>
            </Callout>
          </div>
        )}

        {pendingSays && !query && logins && (
          <section className="mx-2 mb-2 flex flex-col gap-2 rounded-xl bg-brand-50 p-3 dark:bg-brand-500/10" data-testid="pending">
            <p className="text-[13px] font-semibold">{pendingSays.title}</p>
            <p className="text-[13px] text-neutral-700 dark:text-neutral-300">{pendingSays.body}</p>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="primary" onClick={() => answer('save')}>
                {pendingSays.save}
              </Button>
              {pendingSays.never && (
                <Button size="sm" variant="ghost" onClick={() => answer('never')}>
                  {t('pending.never')}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => answer('dismiss')}>
                {t('common.notNow')}
              </Button>
            </div>
          </section>
        )}

        {!query && !place && <RatingAsk />}

        {onPage.length > 0 && !query && everything && !place && page?.site && (
          <section className="mb-2" aria-label={t('vault.onThisPage', { site: page.site })}>
            <h2 className="px-2 pb-1 pt-1 text-[12px] font-medium text-neutral-600 dark:text-neutral-400">
              {t('vault.onThisPage', { site: page.site })}
            </h2>
            <ul>
              {onPage.map((item) => (
                <Row
                  key={item.id}
                  item={item}
                  vault={shared.find((entry) => samePlace(entry.place, placeOf(vault, item.id) ?? null))?.name ?? null}
                  copied={copied}
                  onCopy={copy}
                  onOpen={() => openWhereItIs(item.id)}
                  onFill={() => fill(item)}
                />
              ))}
            </ul>
          </section>
        )}

        {live === 0 && shown === 'all' ? (
          <div className="flex flex-col items-center gap-3 px-6 pt-12 text-center">
            <KeyIcon className="h-8 w-8 text-neutral-400" />
            <p className="font-semibold">{t('vault.empty')}</p>
            <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('vault.emptyBody')}</p>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="primary" onClick={() => setView({ name: 'edit', id: null })}>
                {t('vault.add')}
              </Button>
              <Button size="sm" onClick={() => void chrome.tabs.create({ url: chrome.runtime.getURL('options.html#import') })}>
                {t('vault.import')}
              </Button>
            </div>
          </div>
        ) : (
          <section>
            {!query && everything && !place && onPage.length > 0 && (
              <h2 className="px-2 pb-1 pt-2 text-[12px] font-medium text-neutral-600 dark:text-neutral-400">{shown === 'all' ? t('vault.everything') : t('vault.all')}</h2>
            )}
            {entries.length === 0 ? (
              <p className="px-4 pt-8 text-center text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                {query ? t('vault.noResults', { query }) : folder !== null ? t('folders.nothingHere') : shown === 'all' ? t('vault.noResults', { query }) : t(NONE_OF[shown])}
              </p>
            ) : (
              <ul>
                {entries.map((entry) =>
                  entry.kind === 'login' ? (
                    <Row key={entry.item.id} item={entry.item} copied={copied} onCopy={copy} onOpen={() => setView({ name: 'item', id: entry.item.id })} />
                  ) : (
                    <WalletRow key={entry.item.id} item={entry.item} copied={copied} onCopy={copy} onOpen={() => setView({ name: 'wallet', id: entry.item.id })} />
                  ),
                )}
              </ul>
            )}
          </section>
        )}
      </div>
      {account && <AccountBar account={account} />}
    </div>
  );
}

/** "When was this last synced?" in words: a minute ago, yesterday. */
function since(locale: string, at: number, justNow: string): string {
  const seconds = Math.round((Date.now() - at) / 1000);
  if (seconds < 60) return justNow;
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (seconds < 3600) return format.format(-Math.round(seconds / 60), 'minute');
  if (seconds < 86_400) return format.format(-Math.round(seconds / 3600), 'hour');
  return format.format(-Math.round(seconds / 86_400), 'day');
}

/**
 * The account at the foot of the list: who is signed in, when the logins last
 * synced, a way to sync now, and one click to the account's own page. Signed
 * out by the server, it says so in amber and the click is the way back in.
 */
function AccountBar({ account }: { account: AccountView }) {
  const t = useT();
  const [syncing, setSyncing] = useState(false);
  const { error, run } = useAction();
  const open = () => void chrome.tabs.create({ url: chrome.runtime.getURL('options.html#account') });
  const sync = () =>
    void run(async () => {
      setSyncing(true);
      try {
        await send({ type: 'account/sync' });
      } finally {
        setSyncing(false);
      }
    });
  const state = account.signedOut
    ? t(account.startedOver ? 'accountBar.startedOver' : account.removed ? 'accountBar.removed' : 'accountBar.signedOut')
    : syncing
      ? t('accountBar.syncing')
      : account.lastSyncAt
        ? t('accountBar.synced', { time: since(t.locale, account.lastSyncAt, t('accountBar.justNow')) })
        : t('account.notSynced');
  return (
    <footer className="flex items-center gap-1 border-t border-neutral-200 px-2 py-1.5 dark:border-neutral-800" data-testid="account-bar">
      <button
        type="button"
        onClick={open}
        title={t('nav.accountSync')}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 text-start hover:bg-neutral-100 dark:hover:bg-neutral-900"
      >
        {account.signedOut ? (
          <CloudOffIcon className="h-[18px] w-[18px] shrink-0 text-yellow-700 dark:text-yellow-300" aria-hidden="true" />
        ) : (
          <CloudCheckIcon className="h-[18px] w-[18px] shrink-0 text-green-700 dark:text-green-300" aria-hidden="true" />
        )}
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[12.5px] font-medium">{account.email}</span>
          <span className={cx('truncate text-[12px]', account.signedOut || error ? 'text-yellow-800 dark:text-yellow-300' : 'text-neutral-600 dark:text-neutral-400')}>
            {error ?? state}
          </span>
        </span>
      </button>
      {!account.signedOut && (
        <Button size="sm" variant="ghost" aria-label={t('account.syncNow')} title={t('account.syncNow')} disabled={syncing} onClick={sync}>
          <RefreshIcon className="h-4 w-4" />
        </Button>
      )}
    </footer>
  );
}

function WalletRow({
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
    <li className="group flex items-center gap-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 px-2 py-2 text-start">
        <WalletMark item={item} />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1 truncate text-sm font-medium">
            <span className="truncate">{walletName(item, t)}</span>
            {item.favorite && <StarIcon className="h-3.5 w-3.5 shrink-0 text-yellow-600" aria-label={t('item.favorite')} />}
          </span>
          <span className="truncate text-[12px] text-neutral-600 dark:text-neutral-400">{walletLine(item, t)}</span>
        </span>
      </button>
      {item.kind === 'card' && item.number && (
        <div className="flex items-center gap-0.5 pe-1 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100">
          <Button size="sm" variant="ghost" aria-label={t('card.copyNumber')} title={t('card.copyNumber')} onClick={() => void onCopy(`${item.id}:n`, item.number)}>
            {copied === `${item.id}:n` ? <CheckIcon className="h-4 w-4 text-green-700 dark:text-green-300" /> : <CopyIcon className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </li>
  );
}

function Row({
  item,
  vault = null,
  copied,
  onCopy,
  onOpen,
  onFill,
}: {
  item: LoginItem;
  /** The shared vault it is in, by name, where the list is not of that vault alone. */
  vault?: string | null;
  copied: string | null;
  onCopy: (id: string, text: string) => Promise<void>;
  onOpen: () => void;
  onFill?: () => void;
}) {
  const t = useT();
  return (
    <li className="group flex items-center gap-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 px-2 py-2 text-start">
        <SiteMark title={item.title} urls={item.urls} />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1 truncate text-sm font-medium">
            <span className="truncate">{item.title || item.username}</span>
            {item.passkey && <FingerprintIcon className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-300" aria-label={t('item.passkey')} role="img" />}
            {item.favorite && <StarIcon className="h-3.5 w-3.5 shrink-0 text-yellow-600" aria-label={t('item.favorite')} />}
            {vault && (
              <span className="flex max-w-[7rem] shrink-0 items-center gap-1 text-[11.5px] font-normal text-neutral-600 dark:text-neutral-400" title={vault}>
                <UsersIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{vault}</span>
              </span>
            )}
          </span>
          <span className="truncate text-[12px] text-neutral-600 dark:text-neutral-400">{item.username || t('vault.noUsername')}</span>
        </span>
      </button>
      <div className={cx('flex items-center gap-0.5 pe-1', !onFill && 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100')}>
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
        {onFill && (
          <Button size="sm" variant="primary" onClick={onFill}>
            {t('vault.fill')}
          </Button>
        )}
      </div>
    </li>
  );
}
