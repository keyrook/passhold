import { cardExpired, cardExpiry, expiryNotice, searchLogins, searchWallet, serviceName, walletTitle, type ApiKeyItem, type LoginItem, type VaultData, type WalletItem } from '@passhold/core';
import type { Translator } from '../i18n/react.js';
import type { MessageKey } from '../i18n/locales/en.js';
import type { Shown } from './Kinds.js';

/** An item's name in a page: its own, one made from what it holds, or its kind's word when there is neither. */
export function walletName(item: WalletItem, t: Translator): string {
  const untitled: Record<WalletItem['kind'], MessageKey> = { card: 'card.untitled', address: 'address.untitled', note: 'note.untitled', ssh: 'add.ssh', apikey: 'add.apikey' };
  return walletTitle(item) || t(untitled[item.kind]);
}

/** A country by its code, in the reader's language. */
export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * The line under an item's name in a list: what tells two apart — never a
 * card's whole number, nor a note's words, which a list shows to anyone
 * looking over a shoulder.
 */
export function walletLine(item: WalletItem, t: Translator): string {
  switch (item.kind) {
    case 'card': {
      const expiry = cardExpiry(item);
      // A card named by its owner says its last digits here; one named after them already says them.
      const who = item.title && item.number ? `•••• ${item.number.slice(-4)}` : item.holder;
      return [who, expiry && (cardExpired(item) ? t('card.expiredOn', { expiry }) : expiry)].filter(Boolean).join(' · ');
    }
    case 'address':
      return [item.street.split('\n')[0], item.city, item.country && countryName(item.country, t.locale)].filter(Boolean).join(', ');
    case 'note':
      return t('note.edited', { date: new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium' }).format(item.updatedAt) });
    case 'ssh':
      // What a server's log and `ssh-add -l` show of it: enough to tell two keys apart, and no secret.
      return item.fingerprint;
    case 'apikey': {
      // Its service and environment where its name does not say them, else where it goes; and that it runs out, when it does.
      const said = item.title ? [serviceName(item.service), item.environment] : [];
      const where = item.service ? '' : (item.hosts[0] ?? '');
      const parts = [...said, where, expiryWords(item, t)].filter(Boolean);
      // Two keys with nothing else to tell them apart, by their last characters, as a card by its last digits.
      return parts.length ? parts.join(' · ') : item.key.length >= 16 ? `•••• ${item.key.slice(-4)}` : '';
    }
  }
}

/** A day an API key was issued or expires: stored as midnight UTC, and shown as that date wherever its reader is. */
export function keyDate(day: number, t: Translator): string {
  return new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(day);
}

/** That a key has run out or runs out soon, in its reader's words; '' when it does neither. */
export function expiryWords(item: ApiKeyItem, t: Translator, now = Date.now()): string {
  const notice = expiryNotice(item, now);
  if (!notice) return '';
  if (notice.expired) return t('apikey.expiredOn', { date: keyDate(item.expiresAt!, t) });
  return t('apikey.expiresWhen', { when: new Intl.RelativeTimeFormat(t.locale, { numeric: 'auto' }).format(notice.days, 'day') });
}

/** A row of a list of everything: a login, or a card, an address or a note. */
export type Entry = { kind: 'login'; item: LoginItem } | { kind: 'wallet'; item: WalletItem };

/**
 * What a list shows for one kind or all, searched: logins and the wallet in
 * one list, favourites first, then by name in the reader's language.
 * `folder`: one folder's, '' for what is in none, null for every folder.
 */
export function entriesOf(data: VaultData, shown: Shown, query: string, t: Translator, folder: string | null = null): Entry[] {
  const filed = (item: { deletedAt: number | null; folder: string }) => item.deletedAt === null && (folder === null || item.folder === folder);
  const logins = shown === 'all' || shown === 'login' ? data.items.filter(filed) : [];
  const wallet = shown === 'login' ? [] : data.wallet.filter((item) => filed(item) && (shown === 'all' || item.kind === shown));
  const entries: Entry[] = [
    ...(query ? searchLogins(logins, query) : logins).map((item) => ({ kind: 'login' as const, item })),
    ...(query ? searchWallet(wallet, query) : wallet).map((item) => ({ kind: 'wallet' as const, item })),
  ];
  const collator = new Intl.Collator(t.locale, { sensitivity: 'base' });
  const name = (entry: Entry) => (entry.kind === 'login' ? entry.item.title || entry.item.username : walletName(entry.item, t));
  return entries.sort((a, b) => Number(b.item.favorite) - Number(a.item.favorite) || collator.compare(name(a), name(b)));
}

/** What a list says when one kind has nothing in it yet. */
export const NONE_OF: Record<Exclude<Shown, 'all'>, MessageKey> = {
  login: 'kinds.noLogins',
  card: 'kinds.noCards',
  address: 'kinds.noAddresses',
  note: 'kinds.noNotes',
};
