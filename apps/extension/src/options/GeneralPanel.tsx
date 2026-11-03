import { useState } from 'react';
import type { VaultData, VaultSettings } from '@passhold/core';
import { LOCALE_NAMES, LOCALES } from '../i18n/locales.js';
import { useT } from '../i18n/react.js';
import { currentPreference, setLanguage, type LanguagePreference } from '../i18n/runtime.js';
import { send } from '../lib/messaging.js';
import { useAction } from '../ui/hooks.js';
import { Button, Callout } from '../ui/primitives.js';
import { currentTheme, setTheme, type ThemePreference } from '../ui/theme.js';
import { Choice, Muted, PageHeader, Row, Section, Switch } from './Section.js';

export function GeneralPanel({ data }: { data: VaultData }) {
  const t = useT();
  const { error, run } = useAction();
  const update = (patch: Partial<VaultSettings>) => void run(() => send({ type: 'vault/mutate', mutation: { op: 'settings/update', patch } }));
  const { settings } = data;

  return (
    <>
      <PageHeader title={t('nav.general')} description={t('general.description')} />
      <Section title={t('general.filling')}>
        <Row
          label={t('settings.autoSuggest')}
          description={t('settings.autoSuggestBody')}
          control={<Switch label={t('settings.autoSuggest')} checked={settings.autoSuggest} onChange={(autoSuggest) => update({ autoSuggest })} />}
        />
        <Row
          label={t('settings.inlineButton')}
          control={<Switch label={t('settings.inlineButton')} checked={settings.inlineButton} onChange={(inlineButton) => update({ inlineButton })} />}
        />
        <Row
          label={t('settings.offerToSave')}
          control={<Switch label={t('settings.offerToSave')} checked={settings.offerToSave} onChange={(offerToSave) => update({ offerToSave })} />}
        />
        <Row
          label={t('settings.offerToSaveCards')}
          description={t('settings.offerToSaveCardsBody')}
          control={
            <Switch label={t('settings.offerToSaveCards')} checked={settings.offerToSaveCards} onChange={(offerToSaveCards) => update({ offerToSaveCards })} />
          }
        />
        <Row
          label={t('settings.passkeys')}
          description={t('settings.passkeysBody')}
          control={<Switch label={t('settings.passkeys')} checked={settings.passkeys} onChange={(passkeys) => update({ passkeys })} />}
        />
      </Section>
      {error && <Callout tone="danger">{error}</Callout>}
      <NeverSave data={data} />
      <Appearance />
      <RemoveVault />
    </>
  );
}

function NeverSave({ data }: { data: VaultData }) {
  const t = useT();
  const { run } = useAction();
  return (
    <Section title={t('settings.neverSave')} description={data.neverSave.length === 0 ? t('settings.neverSaveEmpty') : undefined}>
      {data.neverSave.length > 0 &&
        data.neverSave.map((site) => (
          <Row
            key={site}
            label={site}
            control={
              <Button size="sm" variant="ghost" onClick={() => void run(() => send({ type: 'vault/mutate', mutation: { op: 'neverSave/remove', site } }))}>
                {t('settings.remove')}
              </Button>
            }
          />
        ))}
    </Section>
  );
}

/** Kept outside the vault, so it is the same on the lock screen. */
export function Appearance() {
  const t = useT();
  const [language, setLanguageChoice] = useState<LanguagePreference>(currentPreference());
  const [theme, setThemeChoice] = useState<ThemePreference>(currentTheme());
  return (
    <Section title={t('general.appearance')}>
      <Row
        label={t('settings.language')}
        control={
          <Choice<LanguagePreference>
            menu
            label={t('settings.language')}
            value={language}
            options={[{ value: 'auto', label: t('settings.language.auto') }, ...LOCALES.map((code) => ({ value: code, label: LOCALE_NAMES[code] }))]}
            onChange={(next) => {
              setLanguageChoice(next);
              void setLanguage(next);
            }}
          />
        }
      />
      <Row
        label={t('settings.theme')}
        control={
          <Choice<ThemePreference>
            label={t('settings.theme')}
            value={theme}
            options={[
              { value: 'system', label: t('settings.theme.system') },
              { value: 'light', label: t('settings.theme.light') },
              { value: 'dark', label: t('settings.theme.dark') },
            ]}
            onChange={(next) => {
              setThemeChoice(next);
              void setTheme(next);
            }}
          />
        }
      />
    </Section>
  );
}

/**
 * Language and theme in one quiet row, for the pages before Passhold opens:
 * within reach before anything else is read, never a section of its own.
 */
export function AppearanceInline() {
  const t = useT();
  const [language, setLanguageChoice] = useState<LanguagePreference>(currentPreference());
  const [theme, setThemeChoice] = useState<ThemePreference>(currentTheme());
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[12.5px] text-neutral-600 dark:text-neutral-400">
      <label className="flex items-center gap-2">
        {t('settings.language')}
        <Choice<LanguagePreference>
          menu
          label={t('settings.language')}
          value={language}
          options={[{ value: 'auto', label: t('settings.language.auto') }, ...LOCALES.map((code) => ({ value: code, label: LOCALE_NAMES[code] }))]}
          onChange={(next) => {
            setLanguageChoice(next);
            void setLanguage(next);
          }}
        />
      </label>
      <Choice<ThemePreference>
        label={t('settings.theme')}
        value={theme}
        options={[
          { value: 'system', label: t('settings.theme.system') },
          { value: 'light', label: t('settings.theme.light') },
          { value: 'dark', label: t('settings.theme.dark') },
        ]}
        onChange={(next) => {
          setThemeChoice(next);
          void setTheme(next);
        }}
      />
    </div>
  );
}

/** The way out when the password is forgotten, so it asks for no password: only that the word be typed. */
export function RemoveVault() {
  const t = useT();
  const [typed, setTyped] = useState('');
  const { busy, error, run } = useAction();
  const word = t('settings.dangerWord');
  return (
    <Section title={t('settings.danger')} tone="danger">
      <div className="flex flex-col gap-3 p-4">
        <Muted>{t('settings.dangerBody')}</Muted>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium">
          {t('settings.dangerType', { word })}
          <input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-900"
            autoComplete="off"
          />
        </label>
        {error && <Callout tone="danger">{error}</Callout>}
        <div>
          <Button
            variant="danger"
            disabled={typed.trim().toLocaleLowerCase(t.locale) !== word.toLocaleLowerCase(t.locale) || busy}
            onClick={() => void run(() => send({ type: 'vault/reset' }))}
          >
            {t('settings.dangerButton')}
          </Button>
        </div>
      </div>
    </Section>
  );
}
