import type { ComponentType, ReactNode, SVGProps } from 'react';
import { useT } from '../i18n/react.js';
import { ArrowLeftIcon, ChevronDownIcon, ChevronIcon } from '../ui/icons.js';
import { cx } from '../ui/primitives.js';

/** The top of a tab: what it is for, in a line, and the one thing people come to do. */
export function PageHeader({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <header className="mb-8 flex items-start justify-between gap-6">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-[-0.015em]">{title}</h1>
        {description && <p className="mt-1 max-w-[62ch] text-[13.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

/** A page one step into a tab, with the way back to it. */
export function SubpageHeader({ title, description, onBack }: { title: string; description?: ReactNode; onBack: () => void }) {
  const t = useT();
  return (
    <header className="mb-8">
      <button
        type="button"
        onClick={onBack}
        aria-label={t('common.back')}
        className="-ms-1.5 mb-3 grid h-8 w-8 place-items-center rounded-lg text-[17px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
      >
        <ArrowLeftIcon className="kr-icon-flip" />
      </button>
      <h1 className="text-[22px] font-semibold tracking-[-0.015em]">{title}</h1>
      {description && <p className="mt-1 max-w-[62ch] text-[13.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">{description}</p>}
    </header>
  );
}

/**
 * A group of settings: a short label above, its rows in one card below. A
 * label over rows reads as controls; a paragraph inside a card reads as a
 * page of a manual.
 */
export function Section({
  id,
  title,
  description,
  action,
  tone = 'default',
  children,
}: {
  id?: string;
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  /** A danger zone is outlined in red, so it is never mistaken for an ordinary setting. */
  tone?: 'default' | 'danger';
  children?: ReactNode;
}) {
  return (
    <section id={id} className="mb-8">
      {(title || action) && (
        <div className="mb-2 flex items-end justify-between gap-4 px-1">
          <div className="min-w-0">
            {title && (
              <h2 className={cx('text-[13px] font-semibold', tone === 'danger' ? 'text-red-600 dark:text-red-300' : 'text-neutral-800 dark:text-neutral-200')}>
                {title}
              </h2>
            )}
            {description && <p className="mt-0.5 max-w-[62ch] text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children && (
        <div
          className={cx(
            'overflow-hidden rounded-2xl border bg-white dark:bg-neutral-900/60',
            tone === 'danger' ? 'border-red-200 dark:border-red-500/30' : 'border-neutral-200/80 dark:border-neutral-800',
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}

export function Row({
  label,
  description,
  control,
  leading,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  control?: ReactNode;
  /** Before the label: a site's mark, a state dot. */
  leading?: ReactNode;
  /** What opens under the row when its control is used: a form, a warning. */
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-neutral-100 px-4 py-3.5 last:border-b-0 dark:border-neutral-800/80">
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-3">
          {leading}
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-medium">{label}</div>
            {description && <p className="mt-0.5 text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">{description}</p>}
          </div>
        </div>
        {control && <div className="flex shrink-0 items-center gap-1.5">{control}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

/** A row that leads somewhere: an icon tile, what it is, what it does, a chevron. */
export function JobRow({
  Icon,
  title,
  body,
  tone = 'brand',
  onClick,
  status,
}: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: ReactNode;
  /** Amber for the ways out that are not encrypted. */
  tone?: 'brand' | 'warning';
  onClick: () => void;
  status?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 border-b border-neutral-100 px-4 py-4 text-start transition-colors last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800/80 dark:hover:bg-neutral-900"
    >
      <span
        className={cx(
          'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
          tone === 'warning'
            ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300'
            : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium">{title}</span>
        <span className="mt-0.5 block text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">{body}</span>
        {status && <span className="mt-1 flex items-center text-[12.5px] font-medium">{status}</span>}
      </span>
      <ChevronIcon className="kr-icon-flip h-4 w-4 shrink-0 text-neutral-400" />
    </button>
  );
}

/** A dot before a state: green when nothing needs doing, amber when something does. */
export function StateDot({ good }: { good: boolean }) {
  return <span aria-hidden="true" className={cx('me-2 inline-block h-2 w-2 shrink-0 rounded-full', good ? 'bg-green-500' : 'bg-yellow-500')} />;
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-6 w-10 rounded-full transition-colors', checked ? 'bg-brand-600' : 'bg-neutral-300 dark:bg-neutral-700')}
    >
      {/* `start-0` matters: with no inset, an absolute box in a <button> sits at
          its centred static position, and the knob would start halfway along. */}
      <span
        className={cx(
          'absolute start-0 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[18px] rtl:-translate-x-[18px]' : 'translate-x-0.5 rtl:-translate-x-0.5',
        )}
      />
    </button>
  );
}

/**
 * A choice of a few values. Up to three show as a segmented control — every
 * option visible, one click — and more as a menu; `menu` forces the menu for
 * a list that will grow, such as languages.
 */
export function Choice<T extends string | number>({
  value,
  onChange,
  options,
  label,
  menu = false,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
  menu?: boolean;
}) {
  if (options.length <= 3 && !menu) {
    return (
      <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-neutral-100 p-0.5 dark:bg-neutral-800">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={cx(
                'h-8 rounded-[10px] px-3 text-[12.5px] font-medium transition-colors',
                selected
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={String(value)}
        onChange={(event) => {
          const picked = options.find((option) => String(option.value) === event.target.value);
          if (picked) onChange(picked.value);
        }}
        className="h-9 appearance-none rounded-xl border border-neutral-200 bg-white pe-8 ps-3 text-[13px] font-medium text-neutral-800 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}

/** A paragraph of quieter text under or between rows. */
export function Muted({ children }: { children: ReactNode }) {
  return <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{children}</p>;
}
