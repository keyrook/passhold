import type { Items, VaultData, VaultPlace } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { send, type ItemMutation } from '../lib/messaging.js';
import { useAction } from '../ui/hooks.js';
import { UsersIcon } from '../ui/icons.js';
import { sharedVaults } from '../ui/place.js';
import { Button, Callout } from '../ui/primitives.js';
import { SiteMark } from '../ui/SiteMark.js';
import { walletLine, walletName } from '../ui/wallet.js';
import { WalletMark } from '../ui/WalletMark.js';
import { Muted, Row, Section } from './Section.js';

/**
 * Where deleted logins, cards, addresses and notes wait, in Passwords. Only
 * their owner empties it: a limit never destroys data. A shared vault's trash
 * is below the vault's own: anyone in the family restores from it, and only an
 * organiser deletes from it for good.
 */
export function TrashPanel({ data }: { data: VaultData }) {
  const t = useT();
  const shared = sharedVaults(data).flatMap((vault) => {
    const held = data.families.find((family) => family.orgId === vault.place.orgId)?.vaults.find((entry) => entry.id === vault.place.vaultId);
    return held && [...held.items, ...held.wallet].some((item) => item.deletedAt !== null) ? [{ ...vault, held }] : [];
  });
  return (
    <>
      <Trash items={data} place={null} destroys />
      {shared.map((vault) => (
        <div key={`${vault.place.orgId}:${vault.place.vaultId}`} className="mt-8" data-testid="shared-trash">
          <h3 className="mb-3 flex items-center gap-2 px-1 text-[14px] font-semibold">
            <UsersIcon className="h-4 w-4" aria-hidden="true" />
            {t('place.of', { vault: vault.name, family: vault.family })}
          </h3>
          <Trash items={vault.held} place={vault.place} destroys={vault.organiser} />
        </div>
      ))}
    </>
  );
}

/** One place's trash. `destroys`: whoever sees it may delete from it for good — never a family's member who is not its organiser. */
function Trash({ items, place, destroys }: { items: Items; place: VaultPlace | null; destroys: boolean }) {
  const t = useT();
  const { error, run } = useAction();
  const logins = items.items.filter((item) => item.deletedAt !== null);
  const wallet = items.wallet.filter((item) => item.deletedAt !== null);
  const trashed = [...logins, ...wallet];
  if (place && !trashed.length) return null;
  const mutate = (change: ItemMutation) => void run(() => send({ type: 'vault/mutate', mutation: place ? { op: 'family/change', place, change } : change }));
  const restoreAndDelete = (restore: ItemMutation, purge: ItemMutation) => (
    <>
      <Button size="sm" variant="ghost" onClick={() => mutate(restore)}>
        {t('settings.restore')}
      </Button>
      {destroys && (
        <Button size="sm" variant="ghost" className="text-red-600 dark:text-red-300" onClick={() => mutate(purge)}>
          {t('settings.deleteForever')}
        </Button>
      )}
    </>
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4 px-1">
        <Muted>{trashed.length ? t(place ? (destroys ? 'trash.sharedDescription' : 'trash.sharedMember') : 'trash.description') : t('settings.trashEmpty')}</Muted>
        {trashed.length > 0 && destroys && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (confirm(t('settings.emptyTrashConfirm'))) mutate({ op: 'trash/empty' });
            }}
          >
            {t('settings.emptyTrash')}
          </Button>
        )}
      </div>
      {error && <Callout tone="danger">{error}</Callout>}
      {trashed.length > 0 && (
        <Section>
          {logins.map((item) => (
            <Row
              key={item.id}
              leading={<SiteMark title={item.title} urls={item.urls} size={32} />}
              label={item.title || item.username}
              description={item.title && item.username ? item.username : undefined}
              control={restoreAndDelete({ op: 'login/restore', id: item.id }, { op: 'login/purge', id: item.id })}
            />
          ))}
          {wallet.map((item) => (
            <Row
              key={item.id}
              leading={<WalletMark item={item} size={32} />}
              label={walletName(item, t)}
              description={walletLine(item, t) || undefined}
              control={restoreAndDelete({ op: 'wallet/restore', id: item.id }, { op: 'wallet/purge', id: item.id })}
            />
          ))}
        </Section>
      )}
    </>
  );
}
