import { describe, expect, it } from 'vitest';
import { answered, ASK_AFTER_DAYS, ASK_AFTER_FILLS, FRESH_RATING, isRatingState, type RatingState, recordFill, shouldAsk, SNOOZE_DAYS, snooze } from '../src/lib/rating.js';

const DAY = 24 * 60 * 60 * 1000;
const START = Date.UTC(2026, 10, 1);

/** Fills made one after another, the first at START. */
const filled = (times: number, state: RatingState = FRESH_RATING) => Array.from({ length: times }).reduce<RatingState>((next) => recordFill(next, START), state);

describe('when to ask for a rating', () => {
  it('asks no one at the start, and no one who has only looked around', () => {
    expect(shouldAsk(FRESH_RATING, START)).toBe(false);
    expect(shouldAsk(filled(ASK_AFTER_FILLS - 1), START + 30 * DAY)).toBe(false);
    expect(shouldAsk(filled(ASK_AFTER_FILLS), START + ASK_AFTER_DAYS * DAY - 1)).toBe(false);
  });

  it('asks after a week and fifteen fills, both', () => {
    expect(shouldAsk(filled(ASK_AFTER_FILLS), START + ASK_AFTER_DAYS * DAY)).toBe(true);
    expect(shouldAsk(filled(ASK_AFTER_FILLS + 40), START + 400 * DAY)).toBe(true);
  });

  it('counts a week from the first fill, not from the latest', () => {
    const later = recordFill(filled(ASK_AFTER_FILLS - 1), START + 6 * DAY);
    expect(later.firstFillAt).toBe(START);
    expect(shouldAsk(later, START + ASK_AFTER_DAYS * DAY)).toBe(true);
  });

  it('puts the question off for two months on "Not now", and asks again after', () => {
    const ready = filled(ASK_AFTER_FILLS);
    const now = START + 10 * DAY;
    const later = snooze(ready, now);
    expect(later).toMatchObject({ snoozes: 1, done: false });
    expect(shouldAsk(later, now + SNOOZE_DAYS * DAY - 1)).toBe(false);
    expect(shouldAsk(later, now + SNOOZE_DAYS * DAY)).toBe(true);
  });

  it('never asks a third time: the second "Not now" is the last', () => {
    const second = snooze(snooze(filled(ASK_AFTER_FILLS), START + 10 * DAY), START + 80 * DAY);
    expect(second).toMatchObject({ snoozes: 2, done: true });
    expect(shouldAsk(second, START + 1000 * DAY)).toBe(false);
  });

  it('never asks again once answered, and stops counting', () => {
    const rated = answered(filled(ASK_AFTER_FILLS));
    expect(shouldAsk(rated, START + 1000 * DAY)).toBe(false);
    expect(recordFill(rated, START + DAY)).toBe(rated);
  });

  // Review-gating is what the stores forbid: the question must not depend on anything about how the person feels.
  it('is decided by time and fills alone', () => {
    expect(Object.keys(FRESH_RATING).sort()).toEqual(['done', 'fills', 'firstFillAt', 'snoozedUntil', 'snoozes'].sort());
  });
});

describe('what is read back from storage', () => {
  it('takes what was written, and nothing else', () => {
    expect(isRatingState(filled(3))).toBe(true);
    expect(isRatingState(snooze(filled(3), START))).toBe(true);
    for (const wrong of [undefined, null, 7, 'asked', {}, { ...FRESH_RATING, fills: '3' }, { ...FRESH_RATING, fills: 1.5 }, { ...FRESH_RATING, done: 1 }, { ...FRESH_RATING, firstFillAt: Number.NaN }, { ...FRESH_RATING, snoozedUntil: '2026' }]) {
      expect(isRatingState(wrong)).toBe(false);
    }
  });
});
