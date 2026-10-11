import { useState, type FormEvent } from 'react';
import type { GeneratorOptions, LoginItem, VaultSettings } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { send } from '../lib/messaging.js';
import { Generator } from '../ui/Generator.js';
import { useAction } from '../ui/hooks.js';
import { BackIcon, KeyIcon } from '../ui/icons.js';
import { Button, Callout, Field } from '../ui/primitives.js';
import { Strength } from '../ui/Strength.js';
import { PasswordInput } from './PasswordInput.js';

const TEXTAREA =
  'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50';

export function EditScreen({
  item,
  settings,
  defaultUrl,
  onDone,
}: {
  item: LoginItem | null;
  settings: VaultSettings;
  defaultUrl: string | null;
  onDone: (id: string | null) => void;
}) {
  const t = useT();
  const [title, setTitle] = useState(item?.title ?? '');
  const [username, setUsername] = useState(item?.username ?? '');
  const [password, setPassword] = useState(item?.password ?? '');
  const [urls, setUrls] = useState((item?.urls ?? (defaultUrl ? [defaultUrl] : [])).join('\n'));
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [generating, setGenerating] = useState(false);
  const [generator, setGenerator] = useState<GeneratorOptions>(settings.generator);
  const { busy, error, setError, run } = useAction();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() && !username.trim() && !password) {
      setError(t('edit.empty'));
      return;
    }
    const draft = { title, username, password, urls: urls.split('\n'), notes, favorite: item?.favorite ?? false };
    void run(async () => {
      if (generator !== settings.generator) {
        await send({ type: 'vault/mutate', mutation: { op: 'settings/update', patch: { generator } } });
      }
      if (item) {
        await send({ type: 'vault/mutate', mutation: { op: 'login/update', id: item.id, draft } });
        onDone(item.id);
      } else {
        await send({ type: 'vault/mutate', mutation: { op: 'login/add', draft } });
        onDone(null);
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex h-[560px] flex-col">
      <header className="flex items-center gap-1 border-b border-neutral-200 px-2 py-2 dark:border-neutral-800">
        <Button size="sm" variant="ghost" aria-label={t('common.back')} title={t('common.back')} onClick={() => onDone(item?.id ?? null)}>
          <BackIcon className="kr-icon-flip h-[18px] w-[18px]" />
        </Button>
        <h1 className="flex-1 text-[15px] font-semibold">{item ? t('edit.editTitle') : t('edit.newTitle')}</h1>
      </header>

      <div className="scrollarea flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        <Field label={t('edit.title')} hint={t('edit.titleHint')} value={title} onChange={(event) => setTitle(event.target.value)} autoFocus={!item} />
        <Field label={t('edit.username')} value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="off" spellCheck={false} />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
              {t('edit.password')}
            </label>
            <Button size="sm" variant="ghost" aria-expanded={generating} onClick={() => setGenerating((value) => !value)}>
              <KeyIcon className="h-4 w-4" /> {t('edit.generate')}
            </Button>
          </div>
          <PasswordInput id="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <Strength password={password} />
          {generating && (
            <Generator
              options={generator}
              onOptions={setGenerator}
              onUse={(next) => {
                setPassword(next);
                setGenerating(false);
              }}
            />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="urls" className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
            {t('edit.websites')}
          </label>
          <textarea id="urls" rows={2} value={urls} onChange={(event) => setUrls(event.target.value)} spellCheck={false} className={TEXTAREA} />
          <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{t('edit.websitesHint')}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
            {t('edit.notes')}
          </label>
          <textarea id="notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} className={TEXTAREA} />
        </div>
        {error && <Callout tone="danger">{error}</Callout>}
      </div>

      <footer className="flex justify-end gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <Button onClick={() => onDone(item?.id ?? null)}>{t('common.cancel')}</Button>
        <Button type="submit" variant="primary" disabled={busy}>
          {t('common.save')}
        </Button>
      </footer>
    </form>
  );
}
