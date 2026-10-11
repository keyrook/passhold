import { useEffect, useMemo, useState } from 'react';
import { searchLogins, type LoginItem, type VaultData } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { send, type PageInfo, type PendingView } from '../lib/messaging.js';
import { useAction, useCopy } from '../ui/hooks.js';
import { CheckIcon, CopyIcon, KeyIcon, LockIcon, PlusIcon, SearchIcon, SettingsIcon, StarIcon, UserIcon } from '../ui/icons.js';
import { Button, Callout, cx } from '../ui/primitives.js';
import { EditScreen } from './EditScreen.js';
import { Brand } from './Header.js';
import { ItemScreen } from './ItemScreen.js';

type View = { name: 'list' } | { name: 'item'; id: string } | { name: 'edit'; id: string | null };

/** Live logins, favourites first, then by name in the reader's language. */
function sorted(items: readonly LoginItem[], locale: string): LoginItem[] {
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });
  return items
    .filter((item) => item.deletedAt === null)
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || collator.compare(a.title, b.title));
}

export function VaultScreen({ data }: { data: VaultData }) {
  const t = useT();
  const [view, setView] = useState<View>({ name: 'list' });
  const [query, setQuery] = useState('');
  const [page, setPage] = useState<PageInfo | null>(null);
  const [pending, setPending] = useState<PendingView | null>(null);
  const { copied, copy } = useCopy();
  const { error, run } = useAction();

  useEffect(() => {
    void send({ type: 'page/info' }).then(setPage).catch(() => setPage({ site: null, url: null, loginIds: [] }));
    void send({ type: 'pending/view' }).then(setPending).catch(() => setPending(null));
  }, [data]);

  const all = useMemo(() => sorted(data.items, t.locale), [data.items, t.locale]);
  const shown = useMemo(() => (query ? searchLogins(all, query) : all), [all, query]);
  const onPage = useMemo(
    () => (page ? page.loginIds.map((id) => all.find((item) => item.id === id)).filter((item): item is LoginItem => Boolean(item)) : []),
    [all, page],
  );

  if (view.name === 'item') {
    const item = data.items.find((entry) => entry.id === view.id);
    if (item) {
      return (
        <ItemScreen
          item={item}
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
        onDone={(id) => setView(id ? { name: 'item', id } : { name: 'list' })}
      />
    );
  }

  const fill = (item: LoginItem) =>
    void run(async () => {
      await send({ type: 'page/fill', id: item.id });
      window.close();
    });

  const answer = (choice: 'save' | 'never' | 'dismiss') =>
    void run(async () => {
      if (!pending) return;
      await send({ type: 'pending/answer', id: pending.id, answer: choice });
      setPending(null);
    });

  return (
    <div className="flex h-[560px] flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <Brand>{t('vault.count', { count: all.length })}</Brand>
        <div className="flex items-center gap-0.5">
          <Button size="sm" variant="ghost" aria-label={t('vault.add')} title={t('vault.add')} onClick={() => setView({ name: 'edit', id: null })}>
            <PlusIcon className="h-[18px] w-[18px]" />
          </Button>
          <Button size="sm" variant="ghost" aria-label={t('vault.settings')} title={t('vault.settings')} onClick={() => void chrome.runtime.openOptionsPage()}>
            <SettingsIcon className="h-[18px] w-[18px]" />
          </Button>
          <Button size="sm" variant="ghost" aria-label={t('vault.lock')} title={t('vault.lock')} onClick={() => void send({ type: 'vault/lock' })}>
            <LockIcon className="h-[18px] w-[18px]" />
          </Button>
        </div>
      </header>

      <div className="px-4 pt-3">
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
      </div>

      <div className="scrollarea flex-1 overflow-y-auto px-2 pb-3 pt-2">
        {error && (
          <div className="px-2 pb-2">
            <Callout tone="danger">{error}</Callout>
          </div>
        )}

        {pending && !query && (
          <section className="mx-2 mb-2 flex flex-col gap-2 rounded-xl bg-brand-50 p-3 dark:bg-brand-500/10" data-testid="pending">
            <p className="text-[13px] font-semibold">
              {pending.kind === 'update' ? t('pending.updateTitle') : t('pending.saveTitle')}
            </p>
            <p className="text-[13px] text-neutral-700 dark:text-neutral-300">
              {pending.username ? t('pending.body', { username: pending.username, site: pending.site }) : t('pending.bodyNoUser', { site: pending.site })}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="primary" onClick={() => answer('save')}>
                {pending.kind === 'update' ? t('pending.update') : t('pending.save')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => answer('never')}>
                {t('pending.never')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => answer('dismiss')}>
                {t('common.notNow')}
              </Button>
            </div>
          </section>
        )}

        {onPage.length > 0 && !query && page?.site && (
          <section className="mb-2" aria-label={t('vault.onThisPage', { site: page.site })}>
            <h2 className="px-2 pb-1 pt-1 text-[12px] font-medium text-neutral-600 dark:text-neutral-400">
              {t('vault.onThisPage', { site: page.site })}
            </h2>
            <ul>
              {onPage.map((item) => (
                <Row key={item.id} item={item} copied={copied} onCopy={copy} onOpen={() => setView({ name: 'item', id: item.id })} onFill={() => fill(item)} />
              ))}
            </ul>
          </section>
        )}

        {all.length === 0 ? (
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
            {!query && onPage.length > 0 && (
              <h2 className="px-2 pb-1 pt-2 text-[12px] font-medium text-neutral-600 dark:text-neutral-400">{t('vault.all')}</h2>
            )}
            {shown.length === 0 ? (
              <p className="px-4 pt-8 text-center text-[13px] text-neutral-600 dark:text-neutral-400">{t('vault.noResults', { query })}</p>
            ) : (
              <ul>
                {shown.map((item) => (
                  <Row key={item.id} item={item} copied={copied} onCopy={copy} onOpen={() => setView({ name: 'item', id: item.id })} />
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

/** A letter on a crayon-tinted tile: no logo is ever fetched for a site. */
export function Monogram({ title }: { title: string }) {
  const letter = [...(title.trim() || '?')][0]!.toLocaleUpperCase();
  const tints = [
    'bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200',
    'bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200',
    'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
    'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200',
  ];
  const tint = tints[[...title].reduce((sum, char) => sum + char.codePointAt(0)!, 0) % tints.length];
  return (
    <span aria-hidden="true" className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[15px] font-semibold', tint)}>
      {letter}
    </span>
  );
}

function Row({
  item,
  copied,
  onCopy,
  onOpen,
  onFill,
}: {
  item: LoginItem;
  copied: string | null;
  onCopy: (id: string, text: string) => Promise<void>;
  onOpen: () => void;
  onFill?: () => void;
}) {
  const t = useT();
  return (
    <li className="group flex items-center gap-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 px-2 py-2 text-start">
        <Monogram title={item.title} />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1 truncate text-sm font-medium">
            <span className="truncate">{item.title || item.username}</span>
            {item.favorite && <StarIcon className="h-3.5 w-3.5 shrink-0 text-yellow-600" aria-label={t('item.favorite')} />}
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
