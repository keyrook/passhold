import { useEffect, useRef, useState } from 'react';

/**
 * Whether this framed page is really seen: not covered, faded, filtered or
 * transformed by the page around it. IntersectionObserver v2 computes that in
 * the browser, out of the page's reach, and is how a framed control defends
 * against being clicked through a decoy laid over it. Where the browser does
 * not compute it, the frame counts as seen.
 */
export function useVisible<T extends HTMLElement>(): { ref: React.RefObject<T>; visible: boolean } {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1) as (IntersectionObserverEntry & { isVisible?: boolean }) | undefined;
        if (entry) setVisible(entry.isVisible ?? entry.isIntersecting);
      },
      { threshold: [1], trackVisibility: true, delay: 100 } as IntersectionObserverInit,
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}
