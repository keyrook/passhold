/**
 * The web vault's page. Before the first render: its requests go to its own
 * worker, the shared screens are told what this page offers, the language
 * and the theme are set — so nothing paints one way and then another — and
 * the worker is started with the tab's sign-in, locked.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from '../../extension/src/i18n/react.js';
import { startI18n } from '../../extension/src/i18n/runtime.js';
import { useTransport } from '../../extension/src/lib/messaging.js';
import { setHost } from '../../extension/src/ui/host.js';
import { App } from './App.js';
import { restart, webTransport } from './client.js';
import './web.css';

/** The system's light or dark, followed as it changes: this page keeps no choice of its own. */
function startTheme(): void {
  const media = matchMedia('(prefers-color-scheme: dark)');
  const apply = () => (document.documentElement.dataset.theme = media.matches ? 'dark' : 'light');
  apply();
  media.addEventListener('change', apply);
}

useTransport(webTransport);
// A Send waits until after launch, and nothing here opens the extension's settings.
setHost({ send: false, openSettings: () => undefined });
startTheme();
// English until the web vault's words are translated: a page never mixes two languages.
await startI18n('en');
await restart();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
