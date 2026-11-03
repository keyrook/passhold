import { useState, type FormEvent } from 'react';
import { groupMatches, pickGroups } from '@passhold/core';
import { useT } from '../i18n/react.js';
import type { MessageKey } from '../i18n/locales/en.js';
import { send } from '../lib/messaging.js';
import { useAction, useCopy } from '../ui/hooks.js';
import { CheckIcon, PassholdMark } from '../ui/icons.js';
import { Button, Callout, cx, Field } from '../ui/primitives.js';
import { QrCode } from '../ui/QrCode.js';

/**
 * Which key: the vault's own, or the Keyrook account's — each with its own
 * words and its own way back. `accountNoPassword`: an account made with
 * Google or GitHub, which the key lets a new computer into.
 */
export type RecoveryKind = 'vault' | 'account' | 'accountNoPassword';

const WORDS = {
  vault: {
    title: 'recovery.title',
    body: 'recovery.body',
    // The vault's key opens nothing without a copy of the vault: no inbox to keep it from.
    apart: null,
    fileTitle: 'recovery.fileTitle',
    fileBody: 'recovery.fileBody',
    file: 'passhold-recovery-key.txt',
  },
  account: {
    title: 'accountKit.title',
    body: 'accountKit.body',
    apart: 'accountKit.apart',
    fileTitle: 'accountKit.fileTitle',
    fileBody: 'accountKit.fileBody',
    file: 'keyrook-account-recovery-key.txt',
  },
  accountNoPassword: {
    title: 'accountKit.title',
    body: 'accountKit.bodyNoPassword',
    apart: 'accountKit.apartNoPassword',
    fileTitle: 'accountKit.fileTitle',
    fileBody: 'accountKit.fileBodyNoPassword',
    file: 'keyrook-account-recovery-key.txt',
  },
} as const;

/**
 * A recovery key, and every way to keep it: a file, the clipboard, a phone
 * pointed at a QR code, a printed sheet. Most people do none of these unless
 * asked, and a box to tick let them say they had: so its owner goes on only
 * by typing two of its groups back, chosen at random, from what they saved,
 * with the key out of sight. If this closes first, the popup and the checkup
 * keep asking.
 *
 * The account's key, with the inbox (or the Google or GitHub account) it
 * signs in with, opens everything: it is kept apart from them, and said so.
 *
 * `onPrint`: in the settings tab, print this page; in the popup, which a
 * print dialog would close, open the settings tab to print there.
 */
export function RecoveryKeyScreen({
  recoveryKey,
  onDone,
  onPrint,
  framed = false,
  kind = 'vault',
  lead,
  markSaved = () => send({ type: 'vault/mutate', mutation: { op: kind === 'vault' ? 'recovery/saved' : 'account/kitSaved' } }),
}: {
  recoveryKey: string;
  onDone: () => void;
  onPrint: () => void;
  framed?: boolean;
  kind?: RecoveryKind;
  /** What the key is for, where the kind's own words would not say it: a start over's key works only from its day. */
  lead?: MessageKey;
  /** Saying it is put away: in the vault, or — before there is one — where the sign-in waits for it. */
  markSaved?: () => Promise<unknown>;
}) {
  const words = WORDS[kind];
  const t = useT();
  // The two groups asked for, once its owner says the key is saved; null while it is shown.
  const [asked, setAsked] = useState<[number, number] | null>(null);
  const [typed, setTyped] = useState<[string, string]>(['', '']);
  const [wrong, setWrong] = useState(false);
  const [qr, setQr] = useState(false);
  const { copied, copy } = useCopy();
  const { busy, error, run } = useAction();
  const made = new Intl.DateTimeFormat(t.locale, { dateStyle: 'long' }).format(new Date());

  const download = () => {
    const lines = [t(words.fileTitle), '', recoveryKey, '', t('recovery.fileMade', { date: made }), '', t(words.fileBody), ''];
    if (words.apart) lines.push(t(words.apart), '');
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = words.file;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  // Other groups each time: nothing to learn from the last try.
  const ask = () => {
    setAsked(pickGroups(recoveryKey));
    setTyped(['', '']);
    setWrong(false);
  };

  const check = (event: FormEvent) => {
    event.preventDefault();
    if (!asked || busy) return;
    if (!asked.every((position, at) => groupMatches(recoveryKey, position, typed[at]!))) {
      setWrong(true);
      return;
    }
    void run(async () => {
      await markSaved();
      onDone();
    });
  };

  return (
    <>
      {asked ? (
        <form
          onSubmit={check}
          className={cx('flex flex-col gap-4 p-5 print:hidden', !framed && 'min-h-[560px]')}
          data-testid="recovery-key-check"
        >
          <PassholdMark size={40} />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-lg font-semibold">{t('recovery.checkTitle')}</h1>
            <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('recovery.checkBody')}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {asked.map((position, at) => (
              <Field
                key={position}
                label={t('recovery.group', { position })}
                autoFocus={at === 0}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className="font-mono uppercase tracking-wider"
                value={typed[at]}
                onChange={(event) => {
                  const next: [string, string] = [...typed];
                  next[at] = event.target.value;
                  setTyped(next);
                  setWrong(false);
                }}
              />
            ))}
          </div>
          {wrong && <Callout tone="danger">{t('recovery.checkWrong')}</Callout>}
          {error && <Callout tone="danger">{error}</Callout>}
          <div className={cx('flex flex-col gap-2', !framed && 'mt-auto')}>
            <Button type="submit" variant="primary" className="w-full" disabled={busy || typed.some((group) => !group.trim())}>
              {t('recovery.check')}
            </Button>
            <Button variant="ghost" className="w-full" disabled={busy} onClick={() => setAsked(null)}>
              {t('recovery.showAgain')}
            </Button>
          </div>
        </form>
      ) : (
        <div className={cx('flex flex-col gap-4 p-5 print:hidden', !framed && 'min-h-[560px]')} data-testid="recovery-key-screen">
          <PassholdMark size={40} />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-lg font-semibold">{t(words.title)}</h1>
            <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t(lead ?? words.body)}</p>
          </div>
          <p
            className={cx(
              'select-all whitespace-nowrap rounded-xl border border-neutral-200 bg-white px-3 py-3 text-center font-mono dark:border-neutral-800 dark:bg-neutral-900',
              // The account's key is eight groups to the vault's six: on one line all the same, never broken mid-key.
              kind !== 'vault' ? 'text-[13px]' : 'text-[15px] tracking-wide',
            )}
            data-testid="recovery-key"
          >
            {recoveryKey}
          </p>
          {qr && (
            <div className="flex flex-col items-center gap-2">
              <QrCode text={recoveryKey} size={168} label={t('recovery.qrLabel')} />
              <p className="text-center text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('recovery.qrHint')}</p>
            </div>
          )}
          {/* Four ways, side by side, each as easy to reach as the next. Words
              only: the brand has no printer to draw, and three icons and a gap read worse. */}
          <div className="grid grid-cols-2 gap-1.5">
            <Button size="sm" onClick={download}>
              {t('recovery.download')}
            </Button>
            <Button size="sm" onClick={onPrint}>
              {t('recovery.print')}
            </Button>
            <Button size="sm" onClick={() => setQr((shown) => !shown)} aria-pressed={qr}>
              {qr ? t('recovery.qrHide') : t('recovery.qr')}
            </Button>
            <Button size="sm" onClick={() => void copy('recovery', recoveryKey)}>
              {copied === 'recovery' && <CheckIcon className="h-4 w-4 text-green-700 dark:text-green-300" />}
              {copied === 'recovery' ? t('recovery.copied') : t('recovery.copy')}
            </Button>
          </div>
          {words.apart && <Callout tone="warning">{t(words.apart)}</Callout>}
          <div className={cx(!framed && 'mt-auto')}>
            <Button variant="primary" className="w-full" onClick={ask}>
              {t('recovery.savedIt')}
            </Button>
          </div>
        </div>
      )}
      <RecoveryKit recoveryKey={recoveryKey} made={made} kind={kind} />
    </>
  );
}

/** The printed sheet: on paper only, black on white whatever the theme. */
function RecoveryKit({ recoveryKey, made, kind }: { recoveryKey: string; made: string; kind: RecoveryKind }) {
  const t = useT();
  const account = kind !== 'vault';
  const noPassword = kind === 'accountNoPassword';
  return (
    <div className="hidden bg-white p-10 text-black print:block" data-testid="recovery-kit">
      <div className="flex items-center gap-3">
        <PassholdMark size={36} />
        <div>
          <p className="text-[16px] font-semibold">{account ? t('accountKit.sheetTitle') : t('kit.title')}</p>
          <p className="text-[12px]">{t('kit.made', { date: made })}</p>
        </div>
      </div>
      <div className="mt-8 flex items-center gap-8 rounded-xl border border-black p-6">
        <div className="flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-wide">{t('kit.keyLabel')}</p>
          <p className="mt-2 font-mono text-[22px] tracking-wider">{recoveryKey}</p>
        </div>
        <QrCode text={recoveryKey} size={128} label={t('recovery.qrLabel')} exact />
      </div>
      <h2 className="mt-8 text-[14px] font-semibold">
        {noPassword ? t('accountKit.whenTitleNoPassword') : account ? t('accountKit.whenTitle') : t('kit.whenTitle')}
      </h2>
      <ul className="mt-2 list-disc space-y-1.5 ps-5 text-[13px] leading-relaxed">
        <li>{noPassword ? t('accountKit.inPassholdNoPassword') : account ? t('accountKit.inPasshold') : t('kit.sameDevice')}</li>
        <li>{account ? t('accountKit.inAuthenticator') : t('kit.newDevice')}</li>
      </ul>
      <p className="mt-6 text-[13px] leading-relaxed">{noPassword ? t('accountKit.keepNoPassword') : account ? t('accountKit.keep') : t('kit.keep')}</p>
    </div>
  );
}
