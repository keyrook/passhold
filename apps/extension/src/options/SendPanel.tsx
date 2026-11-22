import { useRef, useState, type FormEvent } from 'react';
import { fileFits, SEND_FILES, type DeviceCredential, type LoginItem, type VaultData, type VaultSecret } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { send, type SecurityKey, type SentView } from '../lib/messaging.js';
import { PasswordInput } from '../popup/PasswordInput.js';
import { useAction, useCopy } from '../ui/hooks.js';
import { sizeText } from '../ui/attachments.js';
import { CheckIcon, CloseIcon, CopyIcon, UploadIcon } from '../ui/icons.js';
import { Button, Callout, Spinner } from '../ui/primitives.js';
import { useProof } from '../ui/Proof.js';
import { usePlan } from '../ui/plan.js';
import { sendFromPage } from '../ui/send.js';
import { Choice, Muted, PageHeader, Row, Section } from './Section.js';

const HOUR = 3_600_000;
const LIFETIMES = [HOUR, 24 * HOUR, 7 * 24 * HOUR, 30 * 24 * HOUR] as const;
const OPENS = [1, 2, 5, 10] as const;

/** The login to send a copy of: the vault's own, or a shared vault's. */
function loginIn(data: VaultData, id: string | null): LoginItem | null {
  if (!id) return null;
  return [...data.items, ...data.families.flatMap((family) => family.vaults.flatMap((vault) => vault.items))].find((item) => item.id === id && item.deletedAt === null) ?? null;
}

/**
 * A Send: typed text, files, or a copy of a login, by a link that opens as many
 * times as chosen, until the time chosen, with a password if one is set. The
 * link is shown once, here: nothing keeps it, in Passhold or on the server. A
 * copy of a login is plain text out of the vault, and asks for proof first.
 * Text and files are sealed in this page, which moves the files' bytes
 * itself (ui/send.ts).
 */
export function SendPanel({
  data,
  secret,
  device,
  keys,
  itemId,
}: {
  data: VaultData;
  secret: VaultSecret;
  device: DeviceCredential | null;
  keys: SecurityKey[];
  itemId: string | null;
}) {
  const t = useT();
  const plan = usePlan();
  const [copyOf, setCopyOf] = useState(() => loginIn(data, itemId));
  const proof = useProof({ secret, device, keys });
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [tooLarge, setTooLarge] = useState(false);
  const chooser = useRef<HTMLInputElement>(null);
  const [opens, setOpens] = useState<number>(1);
  const [lifetime, setLifetime] = useState<number>(24 * HOUR);
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState<SentView | null>(null);
  const { busy, error, run } = useAction();
  const { copied, copy } = useCopy();
  const when = new Intl.DateTimeFormat(t.locale, { dateStyle: 'medium', timeStyle: 'short' });
  const lifetimeLabel = { [LIFETIMES[0]]: t('send.hour'), [LIFETIMES[1]]: t('send.day'), [LIFETIMES[2]]: t('send.week'), [LIFETIMES[3]]: t('send.month') } as Record<number, string>;

  // With no plan sold, Send is not there at all (the tab is hidden too).
  if (!plan.send && !plan.offered) return null;
  const ready = copyOf ? proof.ready : text.trim().length > 0 || files.length > 0;
  const choose = (list: FileList | null) => {
    const picked = [...(list ?? [])];
    if (chooser.current) chooser.current.value = '';
    // Said before a byte is read: a person waits for nothing the account would refuse.
    setTooLarge(picked.some((file) => !fileFits(file.size)));
    setFiles((now) => [...now, ...picked.filter((file) => fileFits(file.size))].slice(0, SEND_FILES));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready || busy) return;
    void run(async () => {
      const terms = { opens, lifetime, ...(password ? { password } : {}) };
      setSent(
        copyOf
          ? await send({
              type: 'send/create',
              itemId: copyOf.id,
              proof: await proof.get(),
              labels: { username: t('item.username'), password: t('item.password'), website: t('item.website'), notes: t('item.notes') },
              ...terms,
            })
          : await sendFromPage({ text, files, ...terms }),
      );
      proof.reset();
    });
  };
  const again = () => {
    setSent(null);
    setText('');
    setFiles([]);
    setTooLarge(false);
    setPassword('');
    setCopyOf(null);
    history.replaceState(null, '', '#send');
  };

  return (
    <>
      <PageHeader title={t('send.title')} description={t('send.description')} />
      {!plan.send ? (
        // Said before anything is typed: no form, no proof asked for, nothing sealed.
        <Section>
          <Row label={<Muted>{t('send.premium')}</Muted>} />
        </Section>
      ) : sent ? (
        <Section>
          <div className="flex flex-col gap-3 px-4 py-4" data-testid="send-made">
            <Callout tone="info">{t('send.ready')}</Callout>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={sent.url}
                onFocus={(event) => event.currentTarget.select()}
                aria-label={t('send.title')}
                className="h-10 min-w-0 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 font-mono text-[12.5px] dark:border-neutral-800 dark:bg-neutral-900"
                data-testid="send-url"
              />
              <Button variant="primary" onClick={() => void copy('send', sent.url)}>
                {copied === 'send' ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />} {t('send.copyLink')}
              </Button>
            </div>
            <p className="text-[12.5px] text-neutral-600 dark:text-neutral-400">{t('send.left', { count: sent.opensLeft, date: when.format(sent.expiresAt) })}</p>
            <div>
              <Button size="sm" variant="ghost" onClick={again}>
                {t('send.another')}
              </Button>
            </div>
          </div>
        </Section>
      ) : (
        <form onSubmit={submit}>
          <Section>
            {copyOf ? (
              <Row label={t('send.copyOf', { name: copyOf.title || copyOf.username })} />
            ) : (
              <div className="px-4 py-3.5">
                <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                  {t('send.text')}
                  <textarea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    rows={5}
                    maxLength={32 * 1024}
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-normal focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900"
                    data-testid="send-text"
                  />
                </label>
              </div>
            )}
            {!copyOf && (
              <div className="flex flex-col items-start gap-1.5 border-b border-neutral-100 px-4 py-3.5 dark:border-neutral-800/80" data-testid="send-files">
                <span className="text-[13px] font-medium">{t('files.title')}</span>
                {files.length > 0 && (
                  <ul className="flex w-full flex-col">
                    {files.map((file, at) => (
                      <li key={`${at}:${file.name}`} className="flex items-center gap-2 py-0.5" data-testid="send-file">
                        <span className="min-w-0 flex-1 truncate text-sm" title={file.name}>
                          {file.name}
                        </span>
                        <span className="shrink-0 text-[12px] text-neutral-600 dark:text-neutral-400">{sizeText(file.size, t.locale)}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={t('send.removeFile', { name: file.name })}
                          title={t('send.removeFile', { name: file.name })}
                          disabled={busy}
                          onClick={() => setFiles((now) => now.filter((_, index) => index !== at))}
                        >
                          <CloseIcon className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                <input ref={chooser} type="file" multiple className="hidden" data-testid="send-file-input" onChange={(event) => choose(event.target.files)} />
                {files.length < SEND_FILES && (
                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => chooser.current?.click()}>
                    <UploadIcon className="h-4 w-4" /> {t('files.attach')}
                  </Button>
                )}
                {tooLarge && <p className="text-[12px] text-red-700 dark:text-red-300">{t('error.fileTooLarge')}</p>}
                <p className="text-[12px] text-neutral-600 dark:text-neutral-400">{t('files.about')}</p>
              </div>
            )}
            <Row label={t('send.opens')} control={<Choice<number> label={t('send.opens')} value={opens} onChange={setOpens} options={OPENS.map((value) => ({ value, label: value.toLocaleString(t.locale) }))} />} />
            <Row label={t('send.expires')} control={<Choice<number> label={t('send.expires')} menu value={lifetime} onChange={setLifetime} options={LIFETIMES.map((value) => ({ value, label: lifetimeLabel[value]! }))} />} />
            <div className="border-b border-neutral-100 px-4 py-3.5 last:border-b-0 dark:border-neutral-800/80">
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                {t('send.password')}
                <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
              </label>
            </div>
            {copyOf && <div className="px-4 py-3.5">{proof.field}</div>}
          </Section>
          {error && (
            <div className="mb-4">
              <Callout tone="danger">{error}</Callout>
            </div>
          )}
          <Button type="submit" variant="primary" disabled={!ready || busy} data-testid="send-create">
            {busy && files.length > 0 && <Spinner />} {t('send.create')}
          </Button>
        </form>
      )}
    </>
  );
}
