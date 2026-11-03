/**
 * Asking for a rating, once, after real use — and never in a way the stores
 * forbid. Both ban rewarding a rating; asking only the people who said they
 * were happy, and sending the rest to a feedback form, is the review-gating
 * they treat as manipulation. So everyone who is asked gets the same plain
 * question, and "Not now" is as easy as "Rate it".
 *
 * What it remembers is in local storage (`ph.rating`) and is never sent
 * anywhere: when Passhold first filled something, how many fills since, and
 * the answer. No login, no site, no account — the privacy policy lists it.
 */

const RATING_KEY = 'ph.rating';

/** Real use, not a first look: a week of it, and logins actually filled. */
export const ASK_AFTER_DAYS = 7;
export const ASK_AFTER_FILLS = 15;
/** "Not now" means not for two months. The second "Not now" means never. */
export const SNOOZE_DAYS = 60;
const MAX_SNOOZES = 2;

const DAY = 24 * 60 * 60 * 1000;

export interface RatingState {
  firstFillAt: number | null;
  fills: number;
  snoozes: number;
  snoozedUntil: number | null;
  /** Rated, or asked as many times as it ever will be. */
  done: boolean;
}

export const FRESH_RATING: RatingState = { firstFillAt: null, fills: 0, snoozes: 0, snoozedUntil: null, done: false };

export function shouldAsk(state: RatingState, now: number): boolean {
  if (state.done || state.firstFillAt === null) return false;
  if (state.snoozedUntil !== null && now < state.snoozedUntil) return false;
  return now - state.firstFillAt >= ASK_AFTER_DAYS * DAY && state.fills >= ASK_AFTER_FILLS;
}

export function recordFill(state: RatingState, now: number): RatingState {
  if (state.done) return state;
  return { ...state, firstFillAt: state.firstFillAt ?? now, fills: state.fills + 1 };
}

export function snooze(state: RatingState, now: number): RatingState {
  const snoozes = state.snoozes + 1;
  return { ...state, snoozes, snoozedUntil: now + SNOOZE_DAYS * DAY, done: snoozes >= MAX_SNOOZES };
}

export function answered(state: RatingState): RatingState {
  return { ...state, done: true };
}

export function isRatingState(value: unknown): value is RatingState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return (
    (state.firstFillAt === null || (typeof state.firstFillAt === 'number' && Number.isFinite(state.firstFillAt))) &&
    Number.isInteger(state.fills) &&
    Number.isInteger(state.snoozes) &&
    (state.snoozedUntil === null || (typeof state.snoozedUntil === 'number' && Number.isFinite(state.snoozedUntil))) &&
    typeof state.done === 'boolean'
  );
}

/** Where a review is written: Chrome's own page for this extension, and Edge's. The page opens it in a tab; no permission is needed to link. */
export const REVIEW_URLS = {
  chrome: 'https://chromewebstore.google.com/detail/kpdeebmeokoggpcjbnabffjejppaecng/reviews',
  edge: 'https://microsoftedge.microsoft.com/addons/detail/genbljljdddlokbbbnedphejagfhbmai',
} as const;

export async function loadRating(): Promise<RatingState> {
  const stored = (await chrome.storage.local.get(RATING_KEY))[RATING_KEY];
  return isRatingState(stored) ? stored : FRESH_RATING;
}

/**
 * Read, change, write, one at a time: the worker counts a fill while the popup
 * may answer, and neither should lose the other's change.
 */
let turn: Promise<unknown> = Promise.resolve();
export function updateRating(change: (state: RatingState) => RatingState): Promise<RatingState> {
  const next = turn.then(async () => {
    const state = change(await loadRating());
    await chrome.storage.local.set({ [RATING_KEY]: state });
    return state;
  });
  turn = next.catch(() => undefined);
  return next;
}
