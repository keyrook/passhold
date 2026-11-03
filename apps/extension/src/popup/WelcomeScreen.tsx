import { useT } from '../i18n/react.js';
import { ProviderButtons } from '../options/ProviderSignIn.js';
import { Button } from '../ui/primitives.js';
import { Brand } from './Header.js';

/**
 * The first thing Passhold shows: an account, and nothing to choose between.
 * Google or GitHub sign in — or make — the Keyrook account in a tab, which
 * stays when the popup closes; an email address goes to the settings tab.
 * The vault is made after, on this computer, with the account in it.
 */
export function WelcomeScreen() {
  const t = useT();
  return (
    <div className="flex min-h-[560px] flex-col gap-4 p-5">
      <Brand />
      <div className="flex flex-col gap-2 pt-8">
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em]">{t('welcome.title')}</h1>
        <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('welcome.body')}</p>
      </div>
      <div className="mt-auto flex flex-col gap-2">
        <ProviderButtons inNewTab />
        <Button variant="ghost" className="w-full" onClick={() => void chrome.tabs.create({ url: chrome.runtime.getURL('options.html#signin') })}>
          {t('welcome.email')}
        </Button>
        <p className="px-2 text-center text-[11.5px] leading-relaxed text-neutral-500">{t('welcome.note')}</p>
      </div>
    </div>
  );
}
