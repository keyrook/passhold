import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from '../i18n/react.js';
import { startI18n } from '../i18n/runtime.js';
import { startTheme } from './theme.js';
import '../styles/tailwind.css';

/**
 * Every page starts the same way: language and theme first, then the first
 * render — so nothing paints in one language or one colour and then flips.
 */
export async function boot(app: ReactNode): Promise<void> {
  await Promise.all([startI18n(), startTheme()]);
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <I18nProvider>{app}</I18nProvider>
    </StrictMode>,
  );
}
