import { useEffect, useState } from 'react';
import {
  generatePassword,
  generatorEntropy,
  GENERATOR_MAX_LENGTH,
  GENERATOR_MIN_LENGTH,
  type GeneratorOptions,
} from '@passhold/core';
import { useT } from '../i18n/react.js';
import { RefreshIcon } from './icons.js';
import { Button, cx } from './primitives.js';

/**
 * A new password and the knobs that shape it. Each change of a knob draws a
 * fresh one; `onOptions` keeps the knobs for next time.
 */
export function Generator({
  options,
  onOptions,
  onUse,
}: {
  options: GeneratorOptions;
  onOptions: (next: GeneratorOptions) => void;
  onUse: (password: string) => void;
}) {
  const t = useT();
  const [settings, setSettings] = useState(options);
  const [password, setPassword] = useState(() => generatePassword(options));

  useEffect(() => setPassword(generatePassword(settings)), [settings]);

  const update = (patch: Partial<GeneratorOptions>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    onOptions(next);
  };

  const kinds = [
    ['lower', 'generator.lower'],
    ['upper', 'generator.upper'],
    ['digits', 'generator.digits'],
    ['symbols', 'generator.symbols'],
  ] as const;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start gap-2">
        <output className="font-mono min-h-10 flex-1 break-all rounded-lg bg-neutral-100 px-3 py-2 text-[14px] dark:bg-neutral-800" data-testid="generated">
          {password}
        </output>
        <Button size="sm" variant="ghost" aria-label={t('generator.again')} title={t('generator.again')} onClick={() => setPassword(generatePassword(settings))}>
          <RefreshIcon className="h-4 w-4" />
        </Button>
      </div>
      <label className="flex items-center gap-3 text-[13px]">
        <span className="w-16 shrink-0">{t('generator.length')}</span>
        <input
          type="range"
          min={GENERATOR_MIN_LENGTH}
          max={64}
          value={Math.min(settings.length, 64)}
          onChange={(event) => update({ length: Number(event.target.value) })}
          className="flex-1 accent-brand-600"
        />
        <input
          type="number"
          min={GENERATOR_MIN_LENGTH}
          max={GENERATOR_MAX_LENGTH}
          value={settings.length}
          aria-label={t('generator.length')}
          onChange={(event) => update({ length: Number(event.target.value) || GENERATOR_MIN_LENGTH })}
          className="h-8 w-14 rounded-lg border border-neutral-200 bg-white px-1 text-center text-[13px] dark:border-neutral-800 dark:bg-neutral-900"
        />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {kinds.map(([kind, label]) => (
          <button
            key={kind}
            type="button"
            aria-pressed={settings[kind]}
            onClick={() => update({ [kind]: !settings[kind] })}
            className={cx(
              'kr-press font-mono h-8 rounded-lg px-3 text-[13px]',
              settings[kind]
                ? 'bg-brand-600 text-white'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
            )}
          >
            {t(label)}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-[13px] text-neutral-700 dark:text-neutral-300">
        <input type="checkbox" checked={settings.avoidAmbiguous} onChange={(event) => update({ avoidAmbiguous: event.target.checked })} className="accent-brand-600" />
        {t('generator.avoidAmbiguous')}
      </label>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-neutral-600 dark:text-neutral-400">{t('generator.bits', { bits: generatorEntropy(settings) })}</span>
        <Button variant="primary" size="sm" onClick={() => onUse(password)}>
          {t('generator.use')}
        </Button>
      </div>
    </div>
  );
}
