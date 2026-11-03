import { useState } from 'react';
import { useT } from '../i18n/react.js';
import type { MessageKey } from '../i18n/locales/en.js';
import { BackgroundError, send } from '../lib/messaging.js';
import { browserName } from '../lib/name.js';
import { touchAccountPasskey } from '../ui/accountPasskey.js';
import { useAction } from '../ui/hooks.js';
import { ExternalIcon, KeyIcon } from '../ui/icons.js';
import { Button, Callout } from '../ui/primitives.js';

/**
 * A passkey that signs in but cannot unlock is set right on the account's
 * page, under Passkeys — let unlock there, or another added beside it. The
 * page keeps its views' names for the apps.
 */
const SET_RIGHT_ON_PAGE: readonly MessageKey[] = ['error.passkeyNoUnlock', 'error.passkeyNoPrf'];

/**
 * Sign in with one of the Keyrook account's passkeys — one added on the
 * account's page, which opens the account's key: on a computer with no vault
 * yet (`join`, the sign-in then waits for the vault), or into this one.
 */
export function AccountPasskeyButton({ join = false, onIn }: { join?: boolean; onIn?: (email: string) => void }) {
  const t = useT();
  const { busy, error, run } = useAction();
  const [toPage, setToPage] = useState(false);
  const go = () =>
    void run(async () => {
      setToPage(false);
      try {
        const touch = await touchAccountPasskey();
        if (join) onIn?.((await send({ type: 'account/joinWithPasskey', touch })).email);
        else await send({ type: 'account/signInWithPasskey', touch });
      } catch (caught) {
        setToPage(caught instanceof BackgroundError && caught.key !== undefined && SET_RIGHT_ON_PAGE.includes(caught.key));
        throw caught;
      }
    });
  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" className="w-full" disabled={busy} onClick={go}>
        <KeyIcon className="h-4 w-4" aria-hidden="true" />
        {busy ? t('accountPasskey.working') : t('accountPasskey.button')}
      </Button>
      <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('accountPasskey.hint', { browser: browserName() })}</p>
      {error && <Callout tone="danger">{error}</Callout>}
      {error && toPage && (
        <a
          href={`${__KEYROOK_ACCOUNT_PAGE__}/#passkeys`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 self-start rounded-lg px-3 text-[13px] font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
        >
          {t('accountPasskey.openPasskeys')}
          <ExternalIcon className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
