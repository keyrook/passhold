/**
 * What a family needs of this browser's owner, above the list: the account's
 * password once, to take their key to the family; a code to compare with
 * someone whose key this browser does not know, before anything of theirs is
 * taken; that an organiser has yet to confirm them; that someone is no longer
 * in it; or, now someone has gone, that what is changed waits here until the
 * keys are changed — which an organiser's Passhold does as it syncs.
 */
import { useState, type FormEvent } from 'react';
import type { FamilyDeparture, FamilyLink, VaultData } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { PasswordInput } from '../popup/PasswordInput.js';
import { send } from '../lib/messaging.js';
import { useAction } from './hooks.js';
import { ExternalIcon } from './icons.js';
import { Button, Callout } from './primitives.js';

export const FAMILY_PAGE = `${__KEYROOK_ACCOUNT_PAGE__}/#family`;

/** `passwordless`: the account has no password, so only its page can give Passhold its key. */
export function FamilyNotices({ data, passwordless }: { data: VaultData; passwordless: boolean }) {
  const notices = data.families.flatMap((family) => {
    const out = [];
    if (family.state.kind === 'needs-root') out.push(<UnlockFamily key={`${family.orgId}:unlock`} family={family} passwordless={passwordless} />);
    if (family.state.kind === 'compare') {
      out.push(<CompareCodes key={`${family.orgId}:sender`} family={family} accountId={family.state.accountId} memberKey={family.state.memberKey} sender />);
    }
    for (const change of family.keyChanged) {
      out.push(<CompareCodes key={`${family.orgId}:${change.accountId}`} family={family} accountId={change.accountId} memberKey={change.memberKey} />);
    }
    if (family.state.kind === 'waiting') out.push(<Waiting key={`${family.orgId}:waiting`} family={family} />);
    for (const person of family.left) out.push(<Gone key={`${family.orgId}:left:${person.accountId}`} family={family} person={person} />);
    const held = family.vaults.some((vault) => vault.keyDue);
    if (family.state.kind === 'open' && family.rotationDue && (held || family.role === 'owner')) out.push(<ChangeKeys key={`${family.orgId}:rotate`} family={family} />);
    return out;
  });
  if (!notices.length) return null;
  return (
    <div className="flex flex-col gap-2" data-testid="family-notices">
      {notices}
    </div>
  );
}

function PageLink() {
  const t = useT();
  return (
    <a href={FAMILY_PAGE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium underline">
      {t('family.openPage')}
      <ExternalIcon className="h-3.5 w-3.5" />
    </a>
  );
}

function UnlockFamily({ family, passwordless }: { family: FamilyLink; passwordless: boolean }) {
  const t = useT();
  const [password, setPassword] = useState('');
  const { busy, error, run } = useAction();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void run(() => send({ type: 'family/unlock', orgId: family.orgId, password }));
  };
  return (
    <Callout tone="info">
      <form onSubmit={submit} className="flex flex-col items-start gap-2">
        <span className="font-medium">{t('family.unlockTitle', { family: family.name })}</span>
        {passwordless ? (
          <>
            <span>{t('family.unlockOnPage')}</span>
            <PageLink />
          </>
        ) : (
          <>
            <span>{t('family.unlockBody')}</span>
            <span className="w-full">
              <PasswordInput aria-label={t('family.password')} placeholder={t('family.password')} value={password} onChange={(event) => setPassword(event.target.value)} />
            </span>
            {error && <span className="text-red-700 dark:text-red-300">{error}</span>}
            <Button size="sm" variant="primary" type="submit" disabled={busy || !password}>
              {t('family.unlock')}
            </Button>
          </>
        )}
      </form>
    </Callout>
  );
}

/**
 * Someone whose key this browser does not know: one whose key changed, or
 * (`sender`) the one who sent the family's key. Shown the code, the person
 * says whether it is the one on the other screen; only a match trusts the key.
 */
function CompareCodes({ family, accountId, memberKey, sender = false }: { family: FamilyLink; accountId: string; memberKey: string; sender?: boolean }) {
  const t = useT();
  const [code, setCode] = useState<string | null>(null);
  const [differed, setDiffered] = useState(false);
  const { busy, error, run } = useAction();
  const member = family.members.find((entry) => entry.accountId === accountId);
  const who = member?.name || member?.email || t('family.someone');
  return (
    <Callout tone="warning">
      <span className="flex flex-col items-start gap-2" data-testid="compare-codes">
        <span className="font-medium">{sender ? t('family.newSender', { family: family.name, who }) : t('family.keyChanged', { family: family.name, who })}</span>
        <span>{t('family.keyChangedBody')}</span>
        {differed ? (
          <span>{t('family.differed')}</span>
        ) : code === null ? (
          <Button size="sm" disabled={busy} onClick={() => void run(async () => setCode((await send({ type: 'family/compareCode', orgId: family.orgId, accountId })).code))}>
            {t('family.showCode')}
          </Button>
        ) : (
          <>
            <span className="flex flex-col">
              <span className="text-[12px]">{t('family.codeIs')}</span>
              {/* As the account gives it, in three groups of five, so the two screens read alike; never moving. */}
              <span className="font-mono text-[17px] font-semibold tracking-wider" data-testid="family-code">
                {code}
              </span>
            </span>
            <span className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="primary" disabled={busy} onClick={() => void run(() => send({ type: 'family/trust', orgId: family.orgId, accountId, memberKey }))}>
                {t('family.match')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDiffered(true)}>
                {t('family.differ')}
              </Button>
            </span>
          </>
        )}
        {error && <span className="text-red-700 dark:text-red-300">{error}</span>}
      </span>
    </Callout>
  );
}

function Waiting({ family }: { family: FamilyLink }) {
  const t = useT();
  return <Callout tone="info">{t('family.waiting', { family: family.name })}</Callout>;
}

/**
 * Someone the roster no longer lists. Passhold cannot tell a person leaving
 * from a server putting them out, so the only check there is on the server is
 * someone here who knows better: it stays until they have closed it.
 */
function Gone({ family, person }: { family: FamilyLink; person: FamilyDeparture }) {
  const t = useT();
  const { busy, error, run } = useAction();
  return (
    <Callout tone="info">
      <span className="flex flex-col items-start gap-2" data-testid="family-left">
        <span className="font-medium">{t('family.left', { family: family.name, who: person.name || person.email || t('family.someone') })}</span>
        <span>{t('family.leftBody')}</span>
        {error && <span className="text-red-700 dark:text-red-300">{error}</span>}
        <Button
          size="sm"
          disabled={busy}
          onClick={() => void run(() => send({ type: 'vault/mutate', mutation: { op: 'family/departureRead', orgId: family.orgId, accountId: person.accountId } }))}
        >
          {t('common.close')}
        </Button>
      </span>
    </Callout>
  );
}

/**
 * Someone gone, who still holds a shared vault's key: what is changed in it
 * waits here, unsent, until an organiser's Passhold gives everyone new keys,
 * as it syncs. An organiser sees this only where theirs could not: someone
 * staying has a key to compare first, or something kept it from finishing,
 * which the account page can finish.
 */
function ChangeKeys({ family }: { family: FamilyLink }) {
  const t = useT();
  if (family.role !== 'owner') return <Callout tone="info">{t('family.rotateWait', { family: family.name })}</Callout>;
  if (family.keyChanged.length) return <Callout tone="warning">{t('family.rotateCompare', { family: family.name })}</Callout>;
  return (
    <Callout tone="warning">
      <span className="flex flex-col items-start gap-2">
        <span>{t('family.rotate', { family: family.name })}</span>
        <PageLink />
      </span>
    </Callout>
  );
}
