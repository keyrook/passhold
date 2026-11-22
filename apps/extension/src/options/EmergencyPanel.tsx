import { useEffect, useMemo, useState } from 'react';
import { emptyData, type EmergencyEntry, type EmergencyView } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { onVaultChanged, send, type EmergencyRead } from '../lib/messaging.js';
import { useAction, useCopy } from '../ui/hooks.js';
import { SearchIcon } from '../ui/icons.js';
import { FilesContext } from '../ui/Files.js';
import { KindChips, type Shown } from '../ui/Kinds.js';
import { ViewOnlyContext } from '../ui/place.js';
import { usePlan } from '../ui/plan.js';
import { Button, Callout } from '../ui/primitives.js';
import { entriesOf, NONE_OF } from '../ui/wallet.js';
import { ItemScreen } from '../popup/ItemScreen.js';
import { WalletItemScreen } from '../popup/WalletScreens.js';
import { LoginRow, WalletLine } from './PasswordsPanel.js';
import { Muted, Row, Section, SubpageHeader } from './Section.js';


/**
 * Emergency access as Passhold takes part in it: naming people, the wait and
 * asking are the account page's; here, the code each side compares before
 * Passhold hands its key to a contact or reads as from a grantor, and, once
 * access opens, the grantor's vault to read.
 */
export function EmergencyPanel() {
  const t = useT();
  const [view, setView] = useState<EmergencyView | { status: 'none' } | null>(null);
  const [reading, setReading] = useState<{ entry: EmergencyEntry; read: EmergencyRead } | null>(null);
  const { busy, error, run } = useAction();
  const plan = usePlan();

  // Read again each time the worker says something changed — after a sync,
  // which is when it learns of emergency access: someone named, accepting or
  // asking on the account page would otherwise show only once Settings was
  // opened anew.
  useEffect(() => {
    let alive = true;
    const read = () =>
      send({ type: 'emergency/view' }).then(
        (next) => alive && setView(next),
        // A plan without it, or a server that does not offer it: nothing to show.
        () => alive && setView({ status: 'none' }),
      );
    void read();
    const off = onVaultChanged(() => void read());
    return () => {
      alive = false;
      off();
    };
  }, []);

  if (!view || view.status === 'none') return null;
  // Emergency access is a paid plan's. Until plans are sold, only someone who
  // already takes part in it — named, or naming — sees anything of it.
  if (!plan.emergency && !plan.offered && !(view.status === 'open' && view.entries.length > 0)) return null;
  if (reading) return <GrantorVault entry={reading.entry} read={reading.read} onBack={() => setReading(null)} />;

  const name = (entry: EmergencyEntry) => entry.name || entry.email;
  const trust = (entry: EmergencyEntry) =>
    void run(async () => {
      await send({ type: 'emergency/trust', grantId: entry.id });
      setView(await send({ type: 'emergency/view' }));
    });
  const open = (entry: EmergencyEntry) => void run(async () => setReading({ entry, read: await send({ type: 'emergency/read', grantId: entry.id }) }));

  return (
    <Section title={t('emergency.title')} description={t('emergency.intro')}>
      {error && (
        <div className="px-4 py-3">
          <Callout tone="danger">{error}</Callout>
        </div>
      )}
      {view.status === 'needs-root' && <Row label={t('emergency.needsRoot')} />}
      {view.status === 'open' && view.entries.length === 0 && <Row label={t('emergency.none')} />}
      {view.status === 'open' &&
        view.entries.map((entry) => (
          <Row
            key={entry.id}
            label={entry.name ? `${entry.name} · ${entry.email}` : entry.email}
            description={entry.they === 'contact' ? t('emergency.yourContact') : t('emergency.theirContact')}
            control={
              entry.they === 'grantor' && entry.open && entry.trust === 'trusted' ? (
                <Button size="sm" variant="primary" disabled={busy} onClick={() => open(entry)} data-testid="emergency-open">
                  {t('emergency.view')}
                </Button>
              ) : undefined
            }
          >
            {entry.trust === 'waiting' && <p className="text-[12.5px] text-neutral-600 dark:text-neutral-400">{t('emergency.waiting')}</p>}
            {entry.trust === 'compare' && entry.code && (
              <div className="flex flex-col items-start gap-2" data-testid="emergency-compare">
                <p className="text-[12.5px] leading-relaxed text-neutral-700 dark:text-neutral-300">{t('emergency.compare', { name: name(entry) })}</p>
                {/* As the flows write it, in its groups: the same on both screens, and on the account page. */}
                <p className="font-mono text-[17px] tracking-wider">{entry.code}</p>
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => trust(entry)}>
                  {t('emergency.match')}
                </Button>
              </div>
            )}
          </Row>
        ))}
    </Section>
  );
}

/** Settings' card for one item: the popup's own screen, as tall as what it shows. */
const CARD = 'min-h-[440px]';

/**
 * A grantor's vault, read only: everything that was handed over, every kind,
 * as they kept it — searched, opened and copied from as the vault's own is,
 * with nothing to change, move or delete, and nothing asked of this
 * account's own vault for it (its files and versions are not handed to a page).
 */
function GrantorVault({ entry, read, onBack }: { entry: EmergencyEntry; read: EmergencyRead; onBack: () => void }) {
  const t = useT();
  const [open, setOpen] = useState<{ kind: 'login' | 'wallet'; id: string } | null>(null);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<Shown>('all');
  const { copied, copy } = useCopy();
  const data = useMemo(() => (read.status === 'open' ? { ...emptyData(), items: read.items, wallet: read.wallet } : emptyData()), [read]);
  const entries = useMemo(() => entriesOf(data, kind, query, t), [data, kind, query, t]);
  const title = t('emergency.vaultOf', { name: entry.name || entry.email });

  if (read.status === 'open' && open) {
    const login = open.kind === 'login' ? data.items.find((item) => item.id === open.id) : undefined;
    const card = open.kind === 'wallet' ? data.wallet.find((item) => item.id === open.id) : undefined;
    const back = () => setOpen(null);
    return (
      <>
        <SubpageHeader title={title} description={t('emergency.readOnly')} onBack={back} />
        <ViewOnlyContext.Provider value>
          <FilesContext.Provider value={{ linked: false, organiser: false, settings: true }}>
            <Section>
              {login && <ItemScreen item={login} data={data} className={CARD} onBack={back} onEdit={back} />}
              {card && <WalletItemScreen item={card} className={CARD} onBack={back} onEdit={back} />}
            </Section>
          </FilesContext.Provider>
        </ViewOnlyContext.Provider>
      </>
    );
  }

  return (
    <>
      <SubpageHeader title={title} description={t('emergency.readOnly')} onBack={onBack} />
      {read.status !== 'open' ? (
        <Callout tone="info">{read.status === 'compare' ? t('error.emergencyCompare') : t('error.emergencyNothing')}</Callout>
      ) : (
        <>
          <label className="relative mb-3 block">
            <span className="sr-only">{t('vault.search')}</span>
            <SearchIcon className="pointer-events-none absolute start-3 top-3 h-4 w-4 text-neutral-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('vault.search')}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white pe-3 ps-9 text-sm placeholder:text-neutral-400 focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900"
            />
          </label>
          <div className="mb-4">
            <KindChips value={kind} onChange={setKind} />
          </div>
          {entries.length === 0 ? (
            <Muted>{query ? t('vault.noResults', { query }) : kind === 'all' ? t('vault.empty') : t(NONE_OF[kind])}</Muted>
          ) : (
            <Section>
              <ul data-testid="emergency-items">
                {entries.map((shown) =>
                  shown.kind === 'login' ? (
                    <LoginRow key={shown.item.id} item={shown.item} data={data} copied={copied} onCopy={copy} onOpen={() => setOpen({ kind: 'login', id: shown.item.id })} />
                  ) : (
                    <WalletLine key={shown.item.id} item={shown.item} copied={copied} onCopy={copy} onOpen={() => setOpen({ kind: 'wallet', id: shown.item.id })} />
                  ),
                )}
              </ul>
            </Section>
          )}
        </>
      )}
    </>
  );
}
