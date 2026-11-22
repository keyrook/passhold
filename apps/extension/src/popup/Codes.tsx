import { useEffect, useState, type FormEvent } from 'react';
import type { LoginItem } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { send, type CodesView } from '../lib/messaging.js';
import { useAction, useCopy } from '../ui/hooks.js';
import { CheckIcon, CopyIcon, ExternalIcon, TimerIcon } from '../ui/icons.js';
import { usePlan } from '../ui/plan.js';
import { Button, Callout } from '../ui/primitives.js';
import { FieldRow } from './Fields.js';

declare const __KEYROOK_ACCOUNT_PAGE__: string;
/** Where the link with Keyrook Authenticator is turned on: a product's session never sees the other's key box. */
const LINKS_PAGE = `${__KEYROOK_ACCOUNT_PAGE__}/#links`;

/** A code as a site's form shows its boxes: in two halves, read at a glance. */
const grouped = (code: string) => (code.length === 6 || code.length === 8 ? `${code.slice(0, code.length / 2)} ${code.slice(code.length / 2)}` : code);

/**
 * The login's 2FA codes, from the link the Keyrook account keeps with Keyrook
 * Authenticator: worked out in the service worker, which hands this page what
 * each shows now and when it changes, never the secret. With no account,
 * nothing shows; with no link, or a plan without it, the button says where
 * the codes are.
 */
export function Codes({ item, canAdd: canAddHere }: { item: LoginItem; canAdd: boolean }) {
  const t = useT();
  const [view, setView] = useState<CodesView | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [adding, setAdding] = useState(false);
  const [setup, setSetup] = useState('');
  const { copied, copy } = useCopy();
  const { busy, error, run } = useAction();
  const plan = usePlan();

  useEffect(() => {
    let alive = true;
    send({ type: 'codes/forLogin', id: item.id })
      .then((next) => alive && setView(next))
      .catch(() => alive && setView({ status: 'none' }));
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      alive = false;
      clearInterval(tick);
    };
  }, [item.id]);

  // A code past its time: the next one is asked for.
  const stale = view?.status === 'open' && view.codes.some((code) => code.expiresAt <= now);
  useEffect(() => {
    if (!stale) return;
    void send({ type: 'codes/forLogin', id: item.id }).then(setView, () => undefined);
  }, [stale, item.id]);

  if (!view || view.status === 'none') return null;
  // Codes held already show on any plan; the way to add one, which a paid plan
  // holds, shows only while plans are sold — until then, nothing invites a purchase.
  const canAdd = canAddHere && (view.status === 'open' || plan.codes || plan.offered);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!setup.trim() || busy) return;
    void run(async () => {
      setView(await send({ type: 'codes/add', id: item.id, setup }));
      setSetup('');
      setAdding(false);
    });
  };

  return (
    <>
      {view.status === 'open' &&
        view.codes.map((code) => {
          const left = Math.max(0, code.expiresAt - now);
          return (
            <FieldRow
              key={code.id}
              label={t('codes.title')}
              actions={
                <Button size="sm" variant="ghost" aria-label={t('fields.copy', { name: t('codes.title') })} title={t('fields.copy', { name: t('codes.title') })} onClick={() => void copy(`c-${code.id}`, code.code)}>
                  {copied === `c-${code.id}` ? <CheckIcon className="h-4 w-4 text-green-700 dark:text-green-300" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              }
            >
              <span className="flex flex-col gap-1">
                <span className="font-mono text-[15px] tracking-wider" data-testid="totp">
                  {grouped(code.code)}
                </span>
                {/* How long it lasts, drawn, not counted: a number that changes every second is read as the code. */}
                <span className="block h-1 w-24 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800" aria-hidden="true">
                  <span className="block h-full rounded-full bg-brand-500" style={{ width: `${Math.round((left / (code.period * 1000)) * 100)}%` }} />
                </span>
              </span>
            </FieldRow>
          );
        })}
      {canAdd && !adding && (
        <div className="pt-1">
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)} data-testid="add-code">
            <TimerIcon className="h-4 w-4" /> {t('codes.add')}
          </Button>
        </div>
      )}
      {canAdd && adding && view.status === 'off' && (
        <Callout tone="info">
          <span className="flex flex-col items-start gap-2">
            <span>{t('codes.off')}</span>
            <a href={LINKS_PAGE} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-medium text-brand-600 hover:underline dark:text-brand-300">
              {t('codes.link')} <ExternalIcon className="h-3.5 w-3.5" />
            </a>
          </span>
        </Callout>
      )}
      {canAdd && adding && view.status === 'premium' && <Callout tone="info">{t('codes.premium')}</Callout>}
      {canAdd && adding && view.status === 'open' && (
        <form onSubmit={submit} className="flex flex-col gap-2 py-2" data-testid="code-form">
          <label className="flex flex-col gap-1.5 text-[13px] font-medium">
            {t('codes.setup')}
            <input
              autoFocus
              value={setup}
              onChange={(event) => setSetup(event.target.value)}
              spellCheck={false}
              autoComplete="off"
              className="h-10 rounded-xl border border-neutral-200 bg-white px-3 font-mono text-[13px] focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900"
            />
          </label>
          <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">{t('codes.setupHint')}</p>
          {error && <Callout tone="danger">{error}</Callout>}
          <span className="flex gap-1.5">
            <Button type="submit" size="sm" variant="primary" disabled={busy || !setup.trim()}>
              {t('common.save')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              {t('common.cancel')}
            </Button>
          </span>
        </form>
      )}
    </>
  );
}
