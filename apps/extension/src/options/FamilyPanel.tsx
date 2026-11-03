import type { FamilyLink, VaultData } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { FAMILY_PAGE, FamilyNotices } from '../ui/FamilyNotices.js';
import { ExternalIcon, UserIcon, UsersIcon } from '../ui/icons.js';
import { Muted, PageHeader, Row, Section } from './Section.js';

/**
 * The families this account is in, as this browser holds them: who is in
 * each and their part in it, by the roster this browser checked, and the
 * vaults it shares; above them, what a family needs of this browser's owner.
 * A family is run on the account's Family page — inviting, removing, changing
 * its keys — never here.
 */
/** `me`: this account, as a roster names it. */
export function FamilyPanel({ data, me, passwordless }: { data: VaultData; me: string | null; passwordless: boolean }) {
  const t = useT();
  return (
    <>
      <PageHeader
        title={t('family.title')}
        description={t('family.description')}
        action={
          <a
            href={FAMILY_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
          >
            {t('family.openPage')}
            <ExternalIcon className="h-3.5 w-3.5" />
          </a>
        }
      />
      <div className="mb-8 empty:hidden">
        <FamilyNotices data={data} passwordless={passwordless} />
      </div>
      {data.families.length ? (
        data.families.map((family) => <Family key={family.orgId} family={family} me={me} />)
      ) : (
        <Muted>{t('family.none')}</Muted>
      )}
    </>
  );
}

function Family({ family, me }: { family: FamilyLink; me: string | null }) {
  const t = useT();
  const live = (items: { deletedAt: number | null }[]) => items.filter((item) => item.deletedAt === null).length;
  return (
    <div data-testid="family">
      <Section title={family.name} description={t(family.role === 'owner' ? 'family.youOrganise' : 'family.youMember')}>
        {/* Until the family opens here, the roster is not checked: nobody is shown as in it on the server's word. */}
        {family.members.length ? (
          family.members.map((member) => (
            <Row
              key={member.accountId}
              leading={
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  <UserIcon className="h-4 w-4" />
                </span>
              }
              label={
                <>
                  {member.name || member.email}
                  {member.accountId === me && <span className="ms-1.5 font-normal text-neutral-500 dark:text-neutral-400">{t('family.you')}</span>}
                </>
              }
              description={
                [
                  member.name ? member.email : null,
                  family.keyChanged.some((change) => change.accountId === member.accountId) ? t('family.keyNew') : member.verified ? null : t('family.notCompared'),
                ]
                  .filter(Boolean)
                  .join(' · ') || undefined
              }
              control={member.role === 'owner' && <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{t('family.organiser')}</span>}
            />
          ))
        ) : (
          <div className="px-4 py-3.5">
            <Muted>{t('family.membersLater')}</Muted>
          </div>
        )}
      </Section>
      {family.vaults.length > 0 && (
        <Section title={t('family.sharedVaults')}>
          {family.vaults.map((vault) => (
            <Row
              key={vault.id}
              leading={
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <UsersIcon className="h-4 w-4" />
                </span>
              }
              label={vault.name}
              description={vault.keyDue ? t('family.vaultWaits') : t('vault.count', { count: live([...vault.items, ...vault.wallet]) })}
            />
          ))}
        </Section>
      )}
    </div>
  );
}
