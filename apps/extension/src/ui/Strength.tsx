import { scorePassword } from '@passhold/core';
import type { MessageKey } from '../i18n/locales/en.js';
import { useT } from '../i18n/react.js';
import { cx } from './primitives.js';

const BAR = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-500'] as const;

/** How strong a password looks, as four drawn bars and a word, with what would help. */
export function Strength({ password }: { password: string }) {
  const t = useT();
  if (!password) return null;
  const { score, warnings } = scorePassword(password);
  return (
    <div className="flex flex-col gap-1" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={cx('h-1.5 flex-1 rounded-full', index < Math.max(score, 1) ? BAR[score] : 'bg-neutral-200 dark:bg-neutral-800')}
            />
          ))}
        </div>
        <span className="text-[12px] text-neutral-600 dark:text-neutral-400">{t(`strength.${score}` as MessageKey)}</span>
      </div>
      {warnings[0] && <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{t(`strength.${warnings[0]}` as MessageKey)}</p>}
    </div>
  );
}
