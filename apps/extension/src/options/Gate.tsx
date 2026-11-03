import type { ComponentType, ReactNode, SVGProps } from 'react';
import { useT } from '../i18n/react.js';
import type { MessageKey } from '../i18n/locales/en.js';
import { APP_NAME } from '../lib/name.js';
import { CloudCheckIcon, FingerprintIcon, PassholdMark, ShieldIcon } from '../ui/icons.js';
import { AppearanceInline } from './GeneralPanel.js';

const POINTS: { Icon: ComponentType<SVGProps<SVGSVGElement>>; title: MessageKey; body: MessageKey }[] = [
  { Icon: FingerprintIcon, title: 'gate.touchTitle', body: 'gate.touchBody' },
  { Icon: CloudCheckIcon, title: 'gate.everywhereTitle', body: 'gate.everywhereBody' },
  { Icon: ShieldIcon, title: 'gate.privateTitle', body: 'gate.privateBody' },
];

function Mark() {
  const t = useT();
  return (
    <div className="flex items-center gap-3">
      <PassholdMark size={44} />
      <div className="leading-tight">
        <p className="text-[21px] font-semibold tracking-[-0.01em]">{APP_NAME}</p>
        <p className="text-[12.5px] text-neutral-600 dark:text-neutral-400">{t('app.by')}</p>
      </div>
    </div>
  );
}

/**
 * The settings tab before Passhold opens: on a computer where it is new, or
 * locked. A page of its own rather than a popup stretched across a tab — the
 * name once, what Passhold is beside the one thing to do here, and the
 * language within reach before anything else is read. `intro`: say what
 * Passhold is, for someone meeting it; locked, the person knows already.
 * `after`: what goes under the card, quieter.
 */
export function Gate({ children, after, intro = true }: { children: ReactNode; after?: ReactNode; intro?: boolean }) {
  const t = useT();
  const card = <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">{children}</div>;

  if (!intro) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col justify-center gap-6 px-6 py-10">
        {/* The card leads with Passhold's own mark: the name once. */}
        {card}
        {after}
        <AppearanceInline />
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1040px] items-center gap-10 px-6 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-16">
      <section className="flex flex-col gap-8" aria-labelledby="gate-title">
        <Mark />
        <h1 id="gate-title" className="max-w-[15ch] text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-balance md:text-[38px]">
          {t('welcome.title')}
        </h1>
        <ul className="flex max-w-[44ch] flex-col gap-5">
          {POINTS.map(({ Icon, title, body }) => (
            <li key={title} className="flex gap-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[14.5px] font-semibold">{t(title)}</span>
                <span className="text-[13.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t(body)}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="hidden md:block">
          <AppearanceInline />
        </div>
      </section>
      <div className="flex min-w-0 flex-col gap-4">
        {card}
        {after}
        <div className="md:hidden">
          <AppearanceInline />
        </div>
      </div>
    </div>
  );
}
