import { createContext, useContext, useRef, useState } from 'react';
import { attachmentsOf, type Attachment, type LoginItem, type WalletItem } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { attachChosen, openAttachment, pictureSource, saveFile, shownAs, sizeText } from './attachments.js';
import { useAction } from './hooks.js';
import { currentHost } from './host.js';
import { DownloadIcon, EyeIcon, EyeOffIcon, TrashIcon, UploadIcon } from './icons.js';
import { useChange, ViewOnlyContext } from './place.js';
import { usePlan } from './plan.js';
import { Button, Callout, Spinner } from './primitives.js';

/**
 * Where an item's files are shown. `linked`: signed in to a Keyrook account,
 * which keeps them. `organiser`: of the shared vault shown, or the vault's own
 * is — only an organiser deletes what a family keeps. `settings`: the
 * settings tab, where a file is chosen; the popup sends its owner there, as
 * a popup closes when a file chooser opens over it.
 */
export const FilesContext = createContext({ linked: false, organiser: true, settings: false });

type Shown = { id: string; as: 'picture' | 'text'; content: string };

/**
 * The files kept with an item, each to look at, save or delete, and a way to
 * add one on a plan that keeps them. On one that has ended, what is there
 * still opens and deletes: only adding stops.
 */
export function Files({ item }: { item: LoginItem | WalletItem }) {
  const t = useT();
  const plan = usePlan();
  const viewOnly = useContext(ViewOnlyContext);
  const { linked, organiser, settings } = useContext(FilesContext);
  const change = useChange();
  const chooser = useRef<HTMLInputElement>(null);
  const [working, setWorking] = useState<{ id: string; text: string } | null>(null);
  const [shown, setShown] = useState<Shown | null>(null);
  const [deleting, setDeleting] = useState<Attachment | null>(null);
  const { error, run } = useAction();
  const files = attachmentsOf(item);
  const adding = linked && plan.files && !viewOnly && item.deletedAt === null;
  if (!files.length && !adding) return null;

  const busy = (id: string, text: string, action: () => Promise<void>) =>
    void run(async () => {
      setWorking({ id, text });
      try {
        await action();
      } finally {
        setWorking(null);
      }
    });

  const look = (file: Attachment) => {
    if (shown?.id === file.id) return setShown(null);
    busy(file.id, t('files.opening', { name: file.name }), async () => {
      const { bytes } = await openAttachment(item.id, file.id);
      const as = shownAs(file);
      if (as === 'picture') setShown({ id: file.id, as, content: pictureSource(file, bytes) });
      else if (as === 'text') setShown({ id: file.id, as, content: new TextDecoder().decode(bytes) });
    });
  };

  const download = (file: Attachment) =>
    busy(file.id, t('files.opening', { name: file.name }), async () => {
      const { bytes } = await openAttachment(item.id, file.id);
      saveFile(file, bytes);
    });

  const chosen = (list: FileList | null) => {
    const picked = list?.[0];
    if (chooser.current) chooser.current.value = '';
    if (picked) busy('new', t('files.sending', { name: picked.name }), () => attachChosen(item.id, picked));
  };

  const attach = () => {
    if (settings) return chooser.current?.click();
    // From the popup: Settings, at this item.
    currentHost().openSettings(`files=${encodeURIComponent(item.id)}`);
  };

  return (
    <section className="border-b border-neutral-200 py-2.5 last:border-0 dark:border-neutral-800" data-testid="files">
      <h2 className="text-[12px] text-neutral-600 dark:text-neutral-400">{t('files.title')}</h2>
      {error && <Callout tone="danger">{error}</Callout>}
      {files.length > 0 && (
        <ul className="flex flex-col pt-0.5">
          {files.map((file) => {
            const preview = shownAs(file);
            const open = shown?.id === file.id;
            return (
              <li key={file.id} className="flex flex-col py-1" data-testid="file">
                <div className="flex items-center gap-2">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-[12px] text-neutral-600 dark:text-neutral-400">
                      {working?.id === file.id ? working.text : sizeText(file.size, t.locale)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-0.5">
                    {preview && (
                      <Button size="sm" variant="ghost" aria-label={t('files.open', { name: file.name })} title={t('files.open', { name: file.name })} aria-pressed={open} disabled={working !== null} onClick={() => look(file)}>
                        {open ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" aria-label={t('files.download', { name: file.name })} title={t('files.download', { name: file.name })} disabled={working !== null} onClick={() => download(file)}>
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                    {!viewOnly && organiser && (
                      <Button size="sm" variant="ghost" aria-label={t('files.delete', { name: file.name })} title={t('files.delete', { name: file.name })} disabled={working !== null} onClick={() => setDeleting(file)}>
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </span>
                </div>
                {open && shown.as === 'picture' && <img src={shown.content} alt={file.name} className="mt-1.5 max-h-72 w-full rounded-lg bg-neutral-100 object-contain dark:bg-neutral-900" data-testid="file-picture" />}
                {open && shown.as === 'text' && (
                  <pre className="scrollarea mt-1.5 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-neutral-100 p-2.5 font-mono text-[12px] dark:bg-neutral-900" data-testid="file-text">
                    {shown.content}
                  </pre>
                )}
                {deleting?.id === file.id && (
                  <div className="my-1.5 flex flex-col items-start gap-2 rounded-xl bg-neutral-100 p-3 text-[13px] leading-relaxed dark:bg-neutral-900" data-testid="file-delete">
                    <span>{t('files.deleteConfirm', { name: file.name })}</span>
                    <span className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          void run(async () => {
                            await change({ op: 'file/detach', id: item.id, fileId: file.id });
                            setDeleting(null);
                            if (shown?.id === file.id) setShown(null);
                          })
                        }
                      >
                        {t('files.deleteDo')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleting(null)}>
                        {t('common.cancel')}
                      </Button>
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {adding ? (
        <div className="flex flex-col items-start gap-1 pt-1.5">
          <input ref={chooser} type="file" className="hidden" data-testid="file-input" onChange={(event) => chosen(event.target.files)} />
          <Button size="sm" variant="ghost" disabled={working !== null} title={settings ? undefined : t('files.inSettings')} onClick={attach}>
            {working?.id === 'new' ? <Spinner /> : <UploadIcon className="h-4 w-4" />} {working?.id === 'new' ? working.text : t('files.attach')}
          </Button>
          <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{settings ? t('files.about') : t('files.inSettings')}</p>
        </div>
      ) : (
        // Said only while plans are sold: until then, nothing of a paid plan shows.
        linked && !plan.files && plan.offered && !viewOnly && <p className="pt-1.5 text-[12px] text-neutral-600 dark:text-neutral-400">{t('files.premium')}</p>
      )}
    </section>
  );
}
