import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { useT } from '../i18n/react.js';
import { EyeIcon, EyeOffIcon } from '../ui/icons.js';
import { cx } from '../ui/primitives.js';

/** A password field with a show/hide button. Shown, it is monospaced: every character readable. */
export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(
  function PasswordInput({ className, error, ...props }, ref) {
    const t = useT();
    const [shown, setShown] = useState(false);
    return (
      <div className="relative">
        <input
          ref={ref}
          type={shown ? 'text' : 'password'}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          className={cx(
            'h-10 w-full rounded-xl border bg-white pe-10 ps-3 text-sm text-neutral-900 transition-[border-color] placeholder:text-neutral-400 dark:bg-neutral-900 dark:text-neutral-50',
            shown && 'font-mono',
            error ? 'border-red-400 dark:border-red-500' : 'border-neutral-200 focus:border-brand-500 dark:border-neutral-800',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShown((value) => !value)}
          aria-label={shown ? t('common.hide') : t('common.show')}
          title={shown ? t('common.hide') : t('common.show')}
          className="absolute end-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          {shown ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);
