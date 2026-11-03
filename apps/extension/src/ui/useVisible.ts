import { useCallback, useEffect, useRef, useState } from 'react';
import { FRAME_MOVED } from '../lib/messaging.js';

/**
 * How long a framed page is seen, unmoved and unchanged, before a click in it
 * counts: about as long as Chrome makes its own prompts wait. A list put up,
 * filled or moved under a pointer already on its way down — the second click
 * of a double click the page asked for — is not one the person aimed at.
 */
export const SEEN_FOR = 500;

/**
 * Whether this framed page is really seen: not covered, faded, filtered or
 * transformed by the page around it. IntersectionObserver v2 computes that in
 * the browser, out of the page's reach, and is how a framed control defends
 * against being clicked through a decoy laid over it. Where the browser does
 * not compute it, the frame counts as seen.
 *
 * `visible` is what the page tells the person. `act` is what a button that
 * acts takes: it acts only once the browser has said the frame is seen, and
 * it has stayed so for SEEN_FOR with nothing under the pointer changing —
 * `content` changing (the rows coming in) starts the wait again, and so does
 * the content script saying it moved the frame (content/overlay.ts). Until
 * then the button looks as it will, says it is not ready (`aria-disabled`),
 * and does nothing.
 */
export function useVisible<T extends HTMLElement>(content?: unknown) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(true);
  const [armed, setArmed] = useState(false);
  // Read by the click itself, not the last render: a move the page made a
  // moment ago must stop a click that lands before React draws again.
  const seen = useRef(false);
  const ready = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const wait = useCallback(() => {
    clearTimeout(timer.current);
    ready.current = false;
    setArmed(false);
    if (!seen.current) return;
    timer.current = setTimeout(() => {
      ready.current = true;
      setArmed(true);
    }, SEEN_FOR);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1) as (IntersectionObserverEntry & { isVisible?: boolean }) | undefined;
        if (!entry) return;
        seen.current = entry.isVisible ?? entry.isIntersecting;
        setVisible(seen.current);
        wait();
      },
      { threshold: [1], trackVisibility: true, delay: 100 } as IntersectionObserverInit,
    );
    observer.observe(element);
    // Anyone may say it moved: all it can do is make a click wait.
    const moved = (event: MessageEvent) => {
      if ((event.data as { source?: unknown } | null)?.source === FRAME_MOVED) wait();
    };
    addEventListener('message', moved);
    return () => {
      observer.disconnect();
      removeEventListener('message', moved);
      clearTimeout(timer.current);
    };
  }, [wait]);

  useEffect(wait, [content, wait]);

  const act = (onClick: () => void, disabled = false) => ({
    disabled: !visible || disabled,
    'aria-disabled': armed ? undefined : true,
    onClick: () => {
      if (ready.current) onClick();
    },
  });

  return { ref, visible, act };
}
