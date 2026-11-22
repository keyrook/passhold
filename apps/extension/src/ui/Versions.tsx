import type { ItemVersion, LoginDraft, WalletDraft } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { useAction } from './hooks.js';
import { useChange } from './place.js';
import { usePlan } from './plan.js';
import { Button, Callout } from './primitives.js';

/**
 * What an item was before each edit, newest first, each to restore — on a
 * plan that keeps them. Restoring is an edit like any other, so what the item
 * is now becomes a version in turn. Versions kept on a plan that has ended
 * stay in the item, unseen until it holds them again.
 */
export function Versions({
  id,
  kind,
  versions,
  name,
}: {
  id: string;
  kind: 'login' | 'wallet';
  versions: readonly ItemVersion<LoginDraft | WalletDraft>[] | undefined;
  /** How a version is named in its row: what it was called then. */
  name: (draft: LoginDraft | WalletDraft) => string;
}) {
  const t = useT();
  const plan = usePlan();
  const change = useChange();
  const { error, run } = useAction();
  if (!plan.versions || !versions?.length) return null;
  const when = new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium', timeStyle: 'short' });
  return (
    <details className="pt-2 text-[13px]" data-testid="versions">
      <summary className="cursor-pointer text-neutral-700 dark:text-neutral-300">{t('item.versions')}</summary>
      {error && <Callout tone="danger">{error}</Callout>}
      <ul className="flex flex-col gap-1 pt-2">
        {versions.map((version) => (
          <li key={version.savedAt} className="flex items-center justify-between gap-2" data-testid="version">
            <span className="flex min-w-0 flex-col">
              <span className="truncate">{name(version.draft)}</span>
              <span className="text-[12px] text-neutral-600 dark:text-neutral-400">{when.format(version.savedAt)}</span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void run(() => change({ op: kind === 'login' ? 'login/restoreVersion' : 'wallet/restoreVersion', id, savedAt: version.savedAt }))}
            >
              {t('settings.restore')}
            </Button>
          </li>
        ))}
      </ul>
    </details>
  );
}
