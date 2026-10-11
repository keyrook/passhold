import type { ReactNode } from 'react';
import { useT } from '../i18n/react.js';
import { APP_NAME } from '../lib/name.js';
import { PassholdMark } from '../ui/icons.js';

/** The mark, the name, and "by Keyrook" in small: the product speaks first. */
export function Brand({ children }: { children?: ReactNode }) {
  const t = useT();
  return (
    <div className="flex items-center gap-2.5">
      <PassholdMark size={28} />
      <div className="flex flex-col leading-tight">
        <span className="text-[15px] font-semibold">{APP_NAME}</span>
        <span className="text-[11px] text-neutral-600 dark:text-neutral-400">{children ?? t('app.by')}</span>
      </div>
    </div>
  );
}
