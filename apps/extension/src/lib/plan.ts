import { planAllows, type PaidFeature, type Plan, type VaultData } from '@passhold/core';
import type { PlanView } from './messaging.js';

/**
 * The owner's plan, as the account's server last named it
 * (`GET /account/billing`, read as Passhold syncs, kept on the account link):
 * the free plan with no account, or before the first answer. A server that
 * cannot be asked leaves the last answer standing, and a plan that ends takes
 * nothing away: only what needs it stops, and says it is part of Premium.
 */
export function planOf(data: Pick<VaultData, 'account'>): Plan {
  return data.account?.plan ?? 'personal';
}

export function allows(data: Pick<VaultData, 'account'>, feature: PaidFeature): boolean {
  return planAllows(planOf(data), feature);
}

/** Whether the account's server said it sells plans now: never with no account, nor before its first answer. */
export function plansOffered(data: Pick<VaultData, 'account'>): boolean {
  return data.account?.plansOffered === true;
}

export function planView(data: Pick<VaultData, 'account'>): PlanView {
  return { versions: allows(data, 'versions'), files: allows(data, 'files'), breach: allows(data, 'breach'), send: allows(data, 'send'), codes: allows(data, 'codes'), emergency: allows(data, 'emergency'), offered: plansOffered(data) };
}
