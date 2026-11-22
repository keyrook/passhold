import { createContext, useContext } from 'react';
import type { PlanView } from '../lib/messaging.js';

/** What the owner's plan holds, as the service worker said with the vault's status: nothing paid, and nothing for sale, until it says so. */
export const PlanContext = createContext<PlanView>({ versions: false, files: false, breach: false, send: false, codes: false, emergency: false, offered: false });

export function usePlan(): PlanView {
  return useContext(PlanContext);
}

/**
 * Whether a page may say that `feature` is part of Premium: only while the
 * plan does not hold it and the account's server sells plans. Until then
 * nothing of a paid plan shows at all — no feature, no invitation to buy.
 */
export function useUpsell(feature: Exclude<keyof PlanView, 'offered'>): boolean {
  const plan = usePlan();
  return plan.offered && !plan[feature];
}
