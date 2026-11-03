/**
 * Which vault a screen shows and changes: the vault's own, or a family's
 * shared vault in it. The screens are the same for both; a change goes to the
 * place they show, and the service worker applies a shared vault's rules.
 */
import { createContext, useContext, useState } from 'react';
import type { VaultData, VaultPlace } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { send, type ItemMutation } from '../lib/messaging.js';
import { useAction } from './hooks.js';
import { UserIcon, UsersIcon } from './icons.js';
import { Button, cx } from './primitives.js';

export const PlaceContext = createContext<VaultPlace | null>(null);

/** A change to the items of the place shown. */
export function useChange(): (change: ItemMutation) => Promise<void> {
  const place = useContext(PlaceContext);
  return (change) => send({ type: 'vault/mutate', mutation: place ? { op: 'family/change', place, change } : change });
}

export interface SharedVault {
  place: VaultPlace;
  name: string;
  family: string;
  organiser: boolean;
}

/**
 * The shared vaults this browser holds, each with its family's name: also one
 * whose family waits on its owner — a password, a code to compare — whose
 * items stay here and fill meanwhile, and whose changes go up once it opens.
 */
export function sharedVaults(data: VaultData): SharedVault[] {
  return data.families.flatMap((family) =>
    family.vaults.map((vault) => ({ place: { orgId: family.orgId, vaultId: vault.id }, name: vault.name, family: family.name, organiser: family.role === 'owner' })),
  );
}

export const samePlace = (a: VaultPlace | null, b: VaultPlace | null) => a?.orgId === b?.orgId && a?.vaultId === b?.vaultId;

/** The vault as a screen of one place sees it: a shared vault's items in place of the vault's own. */
export function atPlace(data: VaultData, place: VaultPlace | null): VaultData {
  if (!place) return data;
  const vault = data.families.find((family) => family.orgId === place.orgId)?.vaults.find((entry) => entry.id === place.vaultId);
  return vault ? { ...data, items: vault.items, wallet: vault.wallet } : { ...data, items: [], wallet: [] };
}

/**
 * The vault's own, or one of the shared vaults: shown only once there is one.
 * Tabs, not chips: which vault is a place, not a filter, and must not look
 * like the kinds chosen below it.
 */
export function PlaceTabs({ shared, value, onChange }: { shared: SharedVault[]; value: VaultPlace | null; onChange: (place: VaultPlace | null) => void }) {
  const t = useT();
  if (!shared.length) return null;
  const tab = (key: string, label: string, title: string, place: VaultPlace | null) => {
    const selected = samePlace(place, value);
    return (
      <button
        key={key}
        type="button"
        role="radio"
        aria-checked={selected}
        title={title}
        onClick={() => onChange(place)}
        className={cx(
          '-mb-px flex h-8 max-w-[12rem] shrink-0 items-center gap-1.5 border-b-2 px-1 text-[13px] font-medium transition-colors',
          selected
            ? 'border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300'
            : 'border-transparent text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
        )}
      >
        {place ? <UsersIcon className="h-4 w-4 shrink-0" /> : <UserIcon className="h-4 w-4 shrink-0" />}
        <span className="truncate">{label}</span>
      </button>
    );
  };
  return (
    <div role="radiogroup" aria-label={t('place.label')} className="flex gap-4 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800" data-testid="places">
      {tab('mine', t('place.mine'), t('place.mine'), null)}
      {shared.map((vault) => tab(`${vault.place.orgId}:${vault.place.vaultId}`, vault.name, t('place.of', { vault: vault.name, family: vault.family }), vault.place))}
    </div>
  );
}

/**
 * An item of the vault's own moved into a shared vault, once its owner has
 * read what that means: everyone in the family sees it and may change it, and
 * its earlier passwords stay behind.
 */
export function MoveToFamily({ id, shared, onMoved }: { id: string; shared: SharedVault[]; onMoved: () => void }) {
  const t = useT();
  const [to, setTo] = useState<SharedVault | null>(null);
  const { busy, error, run } = useAction();
  if (!shared.length) return null;
  if (!to) {
    return (
      <span className="flex flex-wrap gap-1">
        {shared.map((vault) => (
          <Button key={`${vault.place.orgId}:${vault.place.vaultId}`} size="sm" variant="ghost" onClick={() => setTo(vault)}>
            <UsersIcon className="h-4 w-4" /> {t('move.to', { vault: vault.name })}
          </Button>
        ))}
      </span>
    );
  }
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl bg-neutral-100 p-3 text-[13px] leading-relaxed dark:bg-neutral-900" data-testid="move-confirm">
      <span>{t('move.confirm', { vault: to.name, family: to.family })}</span>
      {error && <span className="text-red-700 dark:text-red-300">{error}</span>}
      <span className="flex gap-1.5">
        <Button
          size="sm"
          variant="primary"
          disabled={busy}
          onClick={() =>
            void run(async () => {
              await send({ type: 'vault/mutate', mutation: { op: 'family/move', id, place: to.place } });
              onMoved();
            })
          }
        >
          {t('move.do')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setTo(null)}>
          {t('common.cancel')}
        </Button>
      </span>
    </div>
  );
}
