import { useState } from 'react';
import { changePasswordUrl, loginIssues, siteName, siteOf, type LoginItem, type VaultData } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { useAction, useCopy } from '../ui/hooks.js';
import { BackIcon, CheckIcon, CopyIcon, EditIcon, ExternalIcon, EyeIcon, EyeOffIcon, StarIcon, TrashIcon } from '../ui/icons.js';
import { Button, Callout, cx } from '../ui/primitives.js';
import { MoveToFamily, useChange, type SharedVault } from '../ui/place.js';
import { SiteMark } from '../ui/SiteMark.js';
import { FieldRow, FieldsView, FolderView } from './Fields.js';

/** `className`: the screen's height — the popup's own, or Settings' card. */
/** `shared`: the shared vaults this login of the vault's own may move into. */
export function ItemScreen({
  item,
  data,
  shared = [],
  onBack,
  onEdit,
  className = 'h-[560px]',
}: {
  item: LoginItem;
  data: VaultData;
  shared?: SharedVault[];
  onBack: () => void;
  onEdit: () => void;
  className?: string;
}) {
  const t = useT();
  const change = useChange();
  const [shown, setShown] = useState(false);
  const { copied, copy } = useCopy();
  const { error, run } = useAction();
  const date = new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium' });

  const copyButton = (id: string, text: string, label: string) => (
    <Button size="sm" variant="ghost" aria-label={label} title={label} onClick={() => void copy(id, text)}>
      {copied === id ? <CheckIcon className="h-4 w-4 text-green-700 dark:text-green-300" /> : <CopyIcon className="h-4 w-4" />}
    </Button>
  );

  return (
    <div className={cx('flex flex-col', className)}>
      <header className="flex items-center gap-1 border-b border-neutral-200 px-2 py-2 dark:border-neutral-800">
        <Button size="sm" variant="ghost" aria-label={t('common.back')} title={t('common.back')} onClick={onBack}>
          <BackIcon className="kr-icon-flip h-[18px] w-[18px]" />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SiteMark title={item.title} urls={item.urls} size={32} />
          <h1 className="truncate text-[15px] font-semibold">{item.title || item.username}</h1>
        </div>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={item.favorite}
          aria-label={item.favorite ? t('item.unfavorite') : t('item.addFavorite')}
          title={item.favorite ? t('item.unfavorite') : t('item.addFavorite')}
          onClick={() => void run(() => change({ op: 'login/favorite', id: item.id, favorite: !item.favorite }))}
        >
          <StarIcon className={cx('h-[18px] w-[18px]', item.favorite && 'text-yellow-600')} />
        </Button>
        <Button size="sm" variant="ghost" aria-label={t('common.edit')} title={t('common.edit')} onClick={onEdit}>
          <EditIcon className="h-[18px] w-[18px]" />
        </Button>
      </header>

      <div className="scrollarea flex-1 overflow-y-auto px-4 py-2">
        {error && <Callout tone="danger">{error}</Callout>}
        <Issues item={item} data={data} />
        {item.username && (
          <FieldRow label={t('item.username')} actions={copyButton('u', item.username, t('vault.copyUsername'))}>
            {item.username}
          </FieldRow>
        )}
        {item.password && (
          <FieldRow
            label={t('item.password')}
            actions={
              <>
                <Button size="sm" variant="ghost" aria-label={shown ? t('common.hide') : t('common.show')} title={shown ? t('common.hide') : t('common.show')} onClick={() => setShown((value) => !value)}>
                  {shown ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
                {copyButton('p', item.password, t('vault.copyPassword'))}
              </>
            }
          >
            <span className="font-mono break-all" data-testid="password">
              {shown ? item.password : '•'.repeat(Math.min(item.password.length, 16))}
            </span>
          </FieldRow>
        )}
        {item.passkey && (
          <FieldRow label={t('item.passkey')}>
            <span data-testid="passkey">{t('item.passkeyBody', { site: item.passkey.rpId, date: date.format(item.passkey.createdAt) })}</span>
          </FieldRow>
        )}
        {item.urls.length > 0 && (
          <FieldRow label={item.urls.length > 1 ? t('item.websites') : t('item.website')}>
            <ul className="flex flex-col gap-1">
              {item.urls.map((url) => {
                const site = siteOf(url);
                return (
                  <li key={url} className="flex items-center gap-1">
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex min-w-0 items-center gap-1 text-brand-600 hover:underline dark:text-brand-300"
                      title={site ? t('item.openSite', { site: siteName(site) }) : url}
                    >
                      <span className="truncate">{url.replace(/^https:\/\//, '').replace(/\/$/, '')}</span>
                      <ExternalIcon className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </FieldRow>
        )}
        {item.notes && (
          <FieldRow label={t('item.notes')}>
            <p className="whitespace-pre-wrap">{item.notes}</p>
          </FieldRow>
        )}
        <FieldsView fields={item.fields} />
        <FolderView folder={item.folder} />
        {item.password && (
          <p className="pt-3 text-[12px] text-neutral-600 dark:text-neutral-400">
            {t('item.updated', { date: date.format(item.passwordChangedAt) })}
          </p>
        )}
        {item.history.length > 0 && (
          <details className="pt-2 text-[13px]">
            <summary className="cursor-pointer text-neutral-700 dark:text-neutral-300">{t('item.history')}</summary>
            <ul className="flex flex-col gap-1 pt-2">
              {item.history.map((entry, index) => (
                <li key={index} className="flex items-center justify-between gap-2">
                  <span className="font-mono truncate">{entry.password}</span>
                  <span className="shrink-0 text-[12px] text-neutral-600 dark:text-neutral-400">{date.format(entry.changedAt)}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <footer className="flex flex-col items-start gap-1 border-t border-neutral-200 px-4 py-2 dark:border-neutral-800">
        <MoveToFamily id={item.id} shared={shared} onMoved={onBack} />
        <Button
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700 dark:text-red-300"
          onClick={() =>
            void run(async () => {
              await change({ op: 'login/trash', id: item.id });
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

/** What is wrong with this password, and the way to the site's own page for changing it. */
function Issues({ item, data }: { item: LoginItem; data: VaultData }) {
  const t = useT();
  const { weak, reusedWith } = loginIssues(data, item);
  if (!weak && !reusedWith) return null;
  const change = changePasswordUrl(item);
  return (
    <div className="mb-1 mt-2" data-testid="issues">
      <Callout tone="warning">
        <span className="flex flex-col gap-1">
          {weak && <span>{t('item.weak')}</span>}
          {reusedWith > 0 && <span>{t('item.reused', { count: reusedWith })}</span>}
          {change && (
            <a href={change} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium underline">
              {t('item.changePassword')}
              <ExternalIcon className="h-3.5 w-3.5" />
            </a>
          )}
        </span>
      </Callout>
    </div>
  );
}
