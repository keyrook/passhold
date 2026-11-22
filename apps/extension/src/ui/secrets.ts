/**
 * Where a screen's hidden values come from. In the extension a page holds
 * every item whole, as the service worker hands it, and a value is the
 * item's own. The web vault's screens hold none of them (`hideSecrets`):
 * each is asked of the worker that holds the vault when it is shown or
 * copied, and dropped with the screen.
 */
import { createContext, useCallback, useContext } from 'react';
import type { Secret } from '@passhold/core';

export type Reveal = (itemId: string, secret: Secret) => Promise<string>;

/** Set by the web vault's page; null in the extension's, whose items hold their values. */
export const RevealContext = createContext<Reveal | null>(null);

/** Whether this page's items stand with their hidden values hidden. */
export function useValuesHidden(): boolean {
  return useContext(RevealContext) !== null;
}

/** A hidden value, now: `held`, as the item holds it — itself in the extension, `HIDDEN` in the web vault, which asks for it. */
export function useReveal(): (itemId: string, secret: Secret, held: string) => Promise<string> {
  const reveal = useContext(RevealContext);
  return useCallback((itemId, secret, held) => (reveal ? reveal(itemId, secret) : Promise.resolve(held)), [reveal]);
}
