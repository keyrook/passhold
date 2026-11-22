/**
 * When the vault locks, and the worker that held its keys is ended:
 *
 * - idle: no key, tap or click for the minutes chosen (15 unless chosen; 1
 *   to 60, never "never");
 * - hidden: a tab hidden for more than a minute locks as it is shown again —
 *   compared on return, as a hidden tab's timers may not run. A minute lets a
 *   person copy a password, paste it in another app and come back;
 * - left: on `pagehide` the keys go, so a page the browser restores from its
 *   back-forward cache opens locked.
 *
 * A reload needs no rule: the worker is gone with the page.
 */
export const HIDDEN_GRACE = 60_000;
/** Often enough for a lock counted in minutes. */
const CHECK_EVERY = 5_000;

export interface LockWatch {
  /** The minutes chosen now. */
  minutes(): number;
  /** Whether there is anything open to lock. */
  isOpen(): boolean;
  /** `left`: the page is being left, and the keys go at once. */
  lock(why: 'idle' | 'hidden' | 'left'): void;
  /** The tab is being hidden: what was changed goes up now. */
  hidden?(): void;
  /** The clock, for the tests. */
  now?: () => number;
}

/** Starts watching; the function back stops it. */
export function watchLock(watch: LockWatch, target: Window = window): () => void {
  const now = watch.now ?? (() => Date.now());
  let last = now();
  let hiddenAt: number | null = null;

  const lockIfOpen = (why: 'idle' | 'hidden' | 'left') => {
    if (watch.isOpen()) watch.lock(why);
  };
  const idleTooLong = () => now() - last > watch.minutes() * 60_000;

  // A person's own hand: a script on the page cannot make a trusted event.
  const touched = (event: Event) => {
    if (!event.isTrusted) return;
    if (idleTooLong()) lockIfOpen('idle');
    last = now();
  };
  const shown = () => {
    if (target.document.visibilityState === 'hidden') {
      hiddenAt = now();
      watch.hidden?.();
      return;
    }
    const away = hiddenAt === null ? 0 : now() - hiddenAt;
    hiddenAt = null;
    if (away > HIDDEN_GRACE) lockIfOpen('hidden');
    else if (idleTooLong()) lockIfOpen('idle');
  };
  const left = () => lockIfOpen('left');
  const back = (event: PageTransitionEvent) => {
    // Restored from the back-forward cache: `pagehide` already locked it; this holds even where it did not run.
    if (event.persisted) lockIfOpen('left');
  };
  const tick = () => {
    if (target.document.visibilityState === 'hidden') return;
    if (idleTooLong()) lockIfOpen('idle');
  };

  const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
  for (const type of events) target.addEventListener(type, touched, { capture: true, passive: true });
  target.document.addEventListener('visibilitychange', shown);
  target.addEventListener('pagehide', left);
  target.addEventListener('pageshow', back);
  const timer = target.setInterval(tick, CHECK_EVERY);
  return () => {
    for (const type of events) target.removeEventListener(type, touched, { capture: true });
    target.document.removeEventListener('visibilitychange', shown);
    target.removeEventListener('pagehide', left);
    target.removeEventListener('pageshow', back);
    target.clearInterval(timer);
  };
}
