import { CARD_NETWORK_NAMES } from '@passhold/core';
import type { Translator } from '../i18n/react.js';
import type { PendingView } from '../lib/messaging.js';

/**
 * What a waiting save says, in the corner of the page (`prompt`) or at the
 * top of the popup: its question, what it is — a username, or a card by its
 * network and last digits and an address by its first line, never a password,
 * a card's number or its code — the word on its button, and what it says once
 * done.
 *
 * A new password for a login already saved is worded as that, never as a
 * save: it names the login it goes to, says the old password is kept, and
 * offers "not now" rather than "never for this site" — refusing one change is
 * not refusing the site.
 */
export function pendingWords(
  view: PendingView,
  t: Translator,
  where: 'prompt' | 'popup',
): { title: string; body: string; note: string | null; save: string; done: string; never: boolean } {
  if (view.what === 'login') {
    const update = view.kind === 'update';
    return {
      title:
        where === 'popup'
          ? t(update ? 'pending.updateTitle' : 'pending.saveTitle')
          : update
            ? t('prompt.update')
            : view.kind === null
              ? t('pending.lockedTitle')
              : t('prompt.save'),
      body: view.username ? t('pending.body', { username: view.username, site: view.site }) : t('pending.bodyNoUser', { site: view.site }),
      note: update ? t('prompt.updateNote') : null,
      save: t(where === 'popup' ? (update ? 'pending.update' : 'pending.save') : update ? 'prompt.updateButton' : 'prompt.saveButton'),
      done: t(update ? 'prompt.updated' : 'prompt.saved'),
      never: !update,
    };
  }
  const { card, address } = view;
  const update = card?.kind === 'update' && !address;
  const items = [
    card ? `${card.network ? CARD_NETWORK_NAMES[card.network] : t('card.untitled')} •••• ${card.last4}` : '',
    address?.line ?? '',
  ].filter(Boolean);
  return {
    title: t(card && address ? 'prompt.saveCheckout' : card ? (update ? 'prompt.updateCard' : 'prompt.saveCard') : 'prompt.saveAddress'),
    // The page is the one just paid on: the line keeps its room for what is saved.
    body: items.join(' · '),
    note: null,
    save: t(update ? 'prompt.updateButton' : 'prompt.saveButton'),
    done: t('prompt.saved'),
    never: false,
  };
}
