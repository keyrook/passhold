import { cardNetwork, type CardNetwork, type WalletItem } from '@passhold/core';
import { INK, NEUTRAL } from '@keyrook/brand';
import { BRAND_ICONS } from './brand-icons.js';
import { CodeIcon, HomeIcon, ListIcon, PasswordIcon } from './icons.js';
import { cx } from './primitives.js';
import { BrandMark, isLight } from './SiteMark.js';

/** The networks whose own mark is bundled with the site marks (brand-icons.ts), by their slug there. */
const MARKS: Partial<Record<CardNetwork, string>> = { visa: 'visa', mastercard: 'mastercard', amex: 'americanexpress' };

/** The rest, by the letters their cards print. */
const LETTERS: Record<CardNetwork, string> = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
  jcb: 'JCB',
  discover: 'DISC',
  unionpay: 'UP',
  diners: 'DC',
  maestro: 'MAE',
  napas: 'NAPAS',
};

/**
 * A card, drawn as one: a small card in its network's colour with the
 * network's mark, or in grey with the letters it prints — so a list reads
 * as cards beside the site marks of logins. Nothing is fetched: as with site
 * marks, every one is compiled in.
 */
export function CardMark({ network, size = 36 }: { network: CardNetwork | null; size?: number }) {
  const slug = network ? MARKS[network] : undefined;
  const icon = slug ? BRAND_ICONS[slug] : undefined;
  const width = size;
  const height = Math.round(size * 0.66);
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      {icon?.kind === 'mono' && icon.hex ? (
        <span className="flex items-center justify-center rounded-[5px] dark:ring-1 dark:ring-inset dark:ring-white/10" style={{ width, height, background: `#${icon.hex}` }}>
          <svg viewBox={icon.viewBox} width={Math.round(width * 0.72)} height={Math.round(height * 0.72)} fill={isLight(icon.hex) ? INK : NEUTRAL[0]}>
            <path d={icon.body} />
          </svg>
        </span>
      ) : (
        <span
          className="flex items-center justify-center rounded-[5px] bg-neutral-200 font-semibold tracking-tight text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
          style={{ width, height, fontSize: Math.max(7, Math.round(size * (network === 'napas' ? 0.19 : 0.24))) }}
        >
          {network ? LETTERS[network] : '••••'}
        </span>
      )}
    </span>
  );
}

/** What stands before a card, an address or a note in a list: the card itself, an API key's service, or the kind's icon on a tile. */
export function WalletMark({ item, size = 36 }: { item: WalletItem; size?: number }) {
  if (item.kind === 'card') return <CardMark network={cardNetwork(item.number)} size={size} />;
  if (item.kind === 'apikey') return <ApiKeyMark service={item.service} size={size} />;
  const Icon = item.kind === 'address' ? HomeIcon : item.kind === 'ssh' ? CodeIcon : ListIcon;
  return (
    <span
      aria-hidden="true"
      className={cx(
        'flex shrink-0 items-center justify-center rounded-lg',
        item.kind === 'address'
          ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200'
          : item.kind === 'ssh'
            ? 'bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
            : 'bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200',
      )}
      style={{ width: size, height: size }}
    >
      <Icon style={{ width: Math.round(size * 0.5), height: Math.round(size * 0.5) }} />
    </span>
  );
}

/**
 * An API key: its service's mark, compiled in with the site marks, or a key's
 * asterisks on a tile where the service has none or is not named.
 */
export function ApiKeyMark({ service, size = 36 }: { service: string; size?: number }) {
  return (
    (service && <BrandMark slug={service} size={size} />) || (
      <span aria-hidden="true" className="flex shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200" style={{ width: size, height: size }}>
        <PasswordIcon style={{ width: Math.round(size * 0.55), height: Math.round(size * 0.55) }} />
      </span>
    )
  );
}
