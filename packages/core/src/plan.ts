/**
 * Keyrook's four plans, by the names the account's server gives them
 * (keyrook-account, `apps/server/src/plans.ts`), and what of Passhold each
 * holds. Pages and the service worker ask what a plan allows, never its name,
 * so a feature can move to a free plan here alone. A line that is free stays
 * free for good: what is listed here as paid may become free, never the other
 * way.
 */
export type Plan = 'personal' | 'personal-premium' | 'family' | 'family-premium';

/** What only a paid plan holds in Passhold. */
export type PaidFeature =
  /** Every version of an item, kept as it is edited, with restore. */
  | 'versions'
  /** The command line: `passhold` in a terminal. */
  | 'cli'
  /** Files kept with items, in the Keyrook account (account/files.ts). One that ends keeps what it holds, to open and delete. */
  | 'files'
  /**
   * The breach check of saved passwords. Asked of the plan before anything
   * goes: the first five characters of each password's SHA-1 leave only for a
   * plan that holds it, never to learn from the server's refusal.
   */
  | 'breach'
  /** Send: a link to a text, files, or a copy of a login. Asked before a copy's proof, and before anything is sealed. */
  | 'send'
  /** 2FA codes beside logins, from the link with Keyrook Authenticator. One that ends keeps every code in Authenticator. */
  | 'codes'
  /** Emergency access: naming someone who may ask for the vault. Whoever is named reads it on any plan. */
  | 'emergency';

const PAID: readonly Plan[] = ['personal-premium', 'family-premium'];

export function planAllows(plan: Plan, _feature: PaidFeature): boolean {
  return PAID.includes(plan);
}

/**
 * The plan `GET /account/billing` says the person is on: paid when their own
 * plan is, which the server counts as paid when a family they are in pays.
 * Anything else is the free plan.
 */
export function planFromBilling(view: { personal?: unknown }): Plan {
  return view.personal === 'paid' ? 'personal-premium' : 'personal';
}

/**
 * Whether the account's server sells plans now (`GET /account/billing`'s
 * `offered`). Until it does, Passhold shows nothing of what only a paid plan
 * holds — neither the feature nor a word that it could be bought — while a
 * plan held from before is honoured either way. Anything but a plain yes is
 * no: a server from before billing, or one that cannot say, sells nothing.
 */
export function plansOfferedFromBilling(view: { offered?: unknown }): boolean {
  return view.offered === true;
}

/**
 * A plan as the server named it, or the free one for anything else: a plan
 * Passhold does not know of opens nothing, rather than everything.
 */
export function readPlan(value: unknown): Plan {
  return value === 'personal-premium' || value === 'family' || value === 'family-premium' ? value : 'personal';
}
