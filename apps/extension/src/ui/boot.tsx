import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from '../i18n/react.js';
import { startI18n } from '../i18n/runtime.js';
import { send } from '../lib/messaging.js';
import { startTheme } from './theme.js';
import '../styles/tailwind.css';

/** Often enough for a lock counted in minutes. */
const ACTIVITY_EVERY = 10_000;
let reported = 0;

/**
 * A person's own hand in one of Passhold's pages keeps the vault open: a
 * click, a key or a wheel, which no script can make (`isTrusted`), and which
 * no web page can make in one of Passhold's frames on it. Nothing a page
 * does by itself counts. The popup and Settings count as they open too: no
 * web page can open either, while the frames on web pages are put up by
 * whatever page they are on.
 */
function reportActivity(event?: Event): void {
  if (event && !event.isTrusted) return;
  if (Date.now() - reported < ACTIVITY_EVERY) return;
  reported = Date.now();
  void send({ type: 'activity' }).catch(() => undefined);
}

/**
 * Every page starts the same way: language and theme first, then the first
 * render — so nothing paints in one language or one colour and then flips.
 */
export async function boot(app: ReactNode): Promise<void> {
  for (const type of ['pointerdown', 'keydown', 'wheel']) addEventListener(type, reportActivity, { capture: true, passive: true });
  if (window === window.top) reportActivity();
  await Promise.all([startI18n(), startTheme()]);
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <I18nProvider>{app}</I18nProvider>
    </StrictMode>,
  );
}
