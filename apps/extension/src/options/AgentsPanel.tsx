import { useEffect, useState } from 'react';
import type { MachineApproval, MachineCandidate } from '@keyrook/account';
import { cleanHosts, serviceOfKey } from '@passhold/core';
import { useT } from '../i18n/react.js';
import { onVaultChanged, send, type AgentsAuditView, type AgentsOverview } from '../lib/messaging.js';
import { useAction } from '../ui/hooks.js';
import { Button, Callout, Field } from '../ui/primitives.js';
import { Choice, PageHeader, Row, Section, StateDot } from './Section.js';

function formatAuditEntry(entry: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const key of ['kind', 'use', 'outcome', 'method', 'url', 'item']) {
    const val = entry[key];
    if (typeof val === 'string' && val.trim()) parts.push(val.trim());
  }
  if (parts.length > 0) return parts.join(' · ');
  const json = JSON.stringify(entry);
  return json.length > 120 ? `${json.slice(0, 117)}…` : json;
}

/**
 * Agents settings panel: manage agent vaults, enroll or tokenize machines,
 * review pending use requests, rekey exposed items, view "Keys the agent could
 * read", inspect activity logs, and handle key replacement moves or resets.
 */
export function AgentsPanel({ onPendingChange }: { onPendingChange?: (count: number) => void } = {}) {
  const t = useT();
  const [view, setView] = useState<AgentsOverview | null>(null);
  const { busy, error, run } = useAction();

  // Forms & transient UI state (tokens/invitations are shown once, never persisted).
  const [password, setPassword] = useState('');
  const [vaultName, setVaultName] = useState('');
  const [machineName, setMachineName] = useState('');
  const [tokenShown, setTokenShown] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<{ invitationId: string; text: string } | null>(null);
  const [candidate, setCandidate] = useState<MachineCandidate | null>(null);
  const [keyVaultId, setKeyVaultId] = useState('');
  const [keyTitle, setKeyTitle] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [keyHost, setKeyHost] = useState('');
  const [grantApproval, setGrantApproval] = useState<MachineApproval>('each');
  const [editing, setEditing] = useState<{
    vaultId: string;
    itemId: string;
    kind: string;
    title: string;
    key: string;
    hosts: string;
  } | null>(null);
  const [audit, setAudit] = useState<AgentsAuditView | null>(null);

  const load = () =>
    send({ type: 'agents/view' }).then(
      (next) => setView(next),
      () => setView({ status: 'not-offered' }),
    );

  useEffect(() => {
    void load();
    return onVaultChanged(() => void load());
  }, []);

  useEffect(() => {
    if (!view || !onPendingChange) return;
    onPendingChange(view.status === 'open' ? view.requests.length : 0);
  }, [view, onPendingChange]);

  // Quietly refresh pending requests while the tab is open and idle so new asks appear without clicking Refresh.
  const openTab = view?.status === 'open';
  const editingOpen = editing !== null;
  useEffect(() => {
    if (!openTab || busy || editingOpen) return;
    let alive = true;
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      void send({ type: 'agents/view' }).then(
        (next) => {
          if (alive) setView(next);
        },
        () => undefined,
      );
    }, 5_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [openTab, busy, editingOpen]);

  if (!view) return null;

  if (view.status === 'not-offered') {
    return (
      <>
        <PageHeader title={t('agents.title')} description={t('agents.description')} />
        <Callout tone="info">{t('agents.notOffered')}</Callout>
      </>
    );
  }

  if (view.status === 'off') {
    return (
      <>
        <PageHeader title={t('agents.title')} description={t('agents.description')} />
        {error && (
          <div className="mb-4">
            <Callout tone="danger">{error}</Callout>
          </div>
        )}
        <Section>
          <Row
            label={t('agents.title')}
            description={t('agents.offBody')}
            control={
              <Button
                variant="primary"
                size="sm"
                disabled={busy}
                data-testid="agents-turn-on"
                onClick={() => void run(async () => setView(await send({ type: 'agents/turnOn' })))}
              >
                {t('agents.turnOn')}
              </Button>
            }
          />
        </Section>
      </>
    );
  }

  if (view.status === 'key-replaced') {
    return (
      <>
        <PageHeader title={t('agents.title')} description={t('agents.description')} />
        {error && (
          <div className="mb-4">
            <Callout tone="danger">{error}</Callout>
          </div>
        )}
        <Section title={t('agents.keyReplacedTitle')} description={t('agents.keyReplacedBody')}>
          <div className="flex flex-col gap-3 p-4">
            {view.hasPreviousKey && (
              <Button
                variant="primary"
                size="sm"
                disabled={busy}
                data-testid="agents-move"
                onClick={() => void run(async () => setView(await send({ type: 'agents/move' })))}
              >
                {t('agents.move')}
              </Button>
            )}
            <Field
              type="password"
              label={t('agents.passwordPrompt')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button
              variant="danger"
              size="sm"
              disabled={busy || !password}
              data-testid="agents-reset"
              onClick={() =>
                void run(async () => {
                  setView(await send({ type: 'agents/reset', password }));
                  setPassword('');
                })
              }
            >
              {t('agents.reset')}
            </Button>
          </div>
        </Section>
      </>
    );
  }

  const liveMachines = view.machines.filter((m) => m.status === 'live' || m.status === 'paused');
  const auditEvents = audit
    ? [
        ...audit.decisions.map((d) => ({
          key: `d:${d.machineId}:${d.requestId}`,
          at: d.decidedAt,
          label: `${d.machineName} · ${d.outcome}`,
          description: `${new Date(d.decidedAt).toLocaleString()} · ${d.requestId}`,
        })),
        ...audit.entries.map((e) => ({
          key: `e:${e.machineId}:${e.stream}:${e.sequence}`,
          at: e.at,
          label: `${e.machineName} · #${e.sequence}`,
          description: `${new Date(e.at).toLocaleString()} · ${formatAuditEntry(e.entry)}`,
        })),
      ]
        .sort((a, b) => b.at - a.at)
        .slice(0, 50)
    : [];

  return (
    <>
      <PageHeader
        title={t('agents.title')}
        description={t('agents.description')}
        action={
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => void run(async () => setView(await send({ type: 'agents/view' })))}>
            {t('agents.refresh')}
          </Button>
        }
      />

      {error && (
        <div className="mb-6">
          <Callout tone="danger">{error}</Callout>
        </div>
      )}

      {/* Pending machine approval requests */}
      <Section title={t('agents.requestsTitle')}>
        {view.requests.length === 0 ? (
          <Row label={t('agents.requestsEmpty')} />
        ) : (
          view.requests.map((req) => (
            <Row
              key={`${req.machineId}:${req.requestId}`}
              label={`${req.machineName} · ${req.kind === 'use' ? req.itemTitle : req.what}`}
              description={req.kind === 'use' ? req.operation : req.what}
              control={
                <>
                  {req.kind === 'use' && req.fresh && (
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={busy}
                      data-testid="agents-allow-once"
                      onClick={() =>
                        void run(async () =>
                          setView(await send({ type: 'agents/approveUse', machineId: req.machineId, requestId: req.requestId, mode: 'once' })),
                        )
                      }
                    >
                      {t('agents.allowOnce')}
                    </Button>
                  )}
                  {req.kind === 'use' && req.fresh && req.canSession && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      data-testid="agents-allow-session"
                      onClick={() =>
                        void run(async () =>
                          setView(await send({ type: 'agents/approveUse', machineId: req.machineId, requestId: req.requestId, mode: 'session' })),
                        )
                      }
                    >
                      {t('agents.allowSession')}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busy}
                    data-testid="agents-deny"
                    onClick={() =>
                      void run(async () => setView(await send({ type: 'agents/deny', machineId: req.machineId, requestId: req.requestId })))
                    }
                  >
                    {t('agents.deny')}
                  </Button>
                </>
              }
            >
              {req.reason && <p className="text-[12.5px] text-neutral-600 dark:text-neutral-400">{t('agents.reason', { reason: req.reason })}</p>}
            </Row>
          ))
        )}
      </Section>

      {/* Keys the agent could read */}
      {view.exposed.length > 0 && (
        <Section title={t('agents.exposedTitle')} description={t('agents.exposedBody')} tone="danger">
          {view.exposed.map((entry) => (
            <Row
              key={`${entry.machineId}:${entry.vault}:${entry.item}:${entry.version}`}
              leading={<StateDot good={!entry.stillCurrent} />}
              label={`${entry.title} · ${entry.machineName}`}
              description={entry.stillCurrent ? t('agents.exposedCurrent') : t('agents.exposedRotated')}
              control={
                entry.replaceUrl ? (
                  <a
                    href={entry.replaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center rounded-lg bg-neutral-100 px-2.5 text-[13px] font-medium text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                  >
                    {t('agents.replaceAtService')}
                  </a>
                ) : undefined
              }
            />
          ))}
        </Section>
      )}

      {/* Machines */}
      <Section
        title={t('agents.machinesTitle')}
        action={
          <div className="flex gap-2">
            {view.pendingRekey > 0 && (
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                data-testid="agents-rekey"
                onClick={() => void run(async () => setView((await send({ type: 'agents/rekey' })).overview))}
              >
                {t('agents.rekey')}
              </Button>
            )}
            {liveMachines.length > 0 && (
              <Button
                size="sm"
                variant="danger"
                disabled={busy || !password}
                data-testid="agents-stop-all"
                onClick={() =>
                  void run(async () => {
                    setView(await send({ type: 'agents/stopAll', password }));
                    setTokenShown(null);
                    setInvitation(null);
                    setCandidate(null);
                    setPassword('');
                  })
                }
              >
                {t('agents.stopAll')}
              </Button>
            )}
          </div>
        }
      >
        <div className="border-b border-neutral-100 p-4 dark:border-neutral-800/80">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label={t('agents.machineName')}
              value={machineName}
              onChange={(event) => setMachineName(event.target.value)}
            />
            <Field
              type="password"
              label={t('agents.passwordPrompt')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              data-testid="agents-invite"
              onClick={() =>
                void run(async () => {
                  setTokenShown(null);
                  setCandidate(null);
                  setInvitation(await send({ type: 'agents/enrollBegin' }));
                })
              }
            >
              {t('agents.invite')}
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={busy || !machineName.trim() || !password}
              data-testid="agents-create-token"
              onClick={() =>
                void run(async () => {
                  const res = await send({ type: 'agents/tokenCreate', name: machineName.trim(), password });
                  setTokenShown(res.token);
                  setView(res.overview);
                  setMachineName('');
                  setPassword('');
                })
              }
            >
              {t('agents.createToken')}
            </Button>
          </div>
          {invitation && (
            <div className="mt-3 flex flex-col gap-2 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
              <p className="text-[12.5px] text-neutral-600 dark:text-neutral-400">{t('agents.inviteBody')}</p>
              <code className="break-all font-mono text-[12px]" data-testid="agents-invitation-text">
                {invitation.text}
              </code>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  data-testid="agents-check-code"
                  onClick={() =>
                    void run(async () => {
                      setCandidate(await send({ type: 'agents/enrollReview', invitationId: invitation.invitationId }));
                    })
                  }
                >
                  {t('agents.checkCode')}
                </Button>
              </div>
              {candidate && (
                <div className="mt-2 flex flex-col gap-2">
                  <p className="font-mono text-[14px]" data-testid="agents-confirm-code">
                    {t('agents.confirmCode', { code: candidate.code })}
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={busy || !machineName.trim() || !password}
                    data-testid="agents-confirm-machine"
                    onClick={() =>
                      void run(async () => {
                        setView(
                          await send({
                            type: 'agents/enrollConfirm',
                            candidate,
                            name: machineName.trim(),
                            password,
                          }),
                        );
                        setInvitation(null);
                        setCandidate(null);
                        setMachineName('');
                        setPassword('');
                      })
                    }
                  >
                    {t('agents.confirm')}
                  </Button>
                </div>
              )}
            </div>
          )}
          {tokenShown && (
            <div className="mt-3 flex flex-col gap-1 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
              <p className="text-[12.5px] text-neutral-600 dark:text-neutral-400">{t('agents.tokenShown')}</p>
              <code className="break-all font-mono text-[12px]" data-testid="agents-token-shown">
                {tokenShown}
              </code>
            </div>
          )}
        </div>

        {view.machines.length === 0 ? (
          <Row label={t('agents.machinesEmpty')} />
        ) : (
          view.machines.map((machine) => (
            <Row
              key={machine.id}
              leading={<StateDot good={machine.status === 'live'} />}
              label={`${machine.name} (${machine.kind})`}
              description={`${machine.status} · ${machine.id}`}
              control={
                <>
                  {machine.status === 'paused' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy || !password}
                      onClick={() =>
                        void run(async () => {
                          setView(await send({ type: 'agents/resume', machineId: machine.id, password }));
                          setPassword('');
                        })
                      }
                    >
                      {t('agents.resume')}
                    </Button>
                  )}
                  {machine.status !== 'removed' && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy || (machine.status !== 'expired' && !password)}
                      data-testid={`agents-remove-${machine.id}`}
                      onClick={() =>
                        void run(async () => {
                          setView(
                            await send({
                              type: 'agents/remove',
                              machineId: machine.id,
                              ...(password ? { password } : {}),
                            }),
                          );
                          setTokenShown(null);
                          setPassword('');
                        })
                      }
                    >
                      {t('agents.remove')}
                    </Button>
                  )}
                  {machine.status === 'removed' && machine.keysWaiting === 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy || !password}
                      data-testid={`agents-forget-${machine.id}`}
                      onClick={() =>
                        void run(async () => {
                          const hasCurrentExposed = view.exposed.some((entry) => entry.machineId === machine.id && entry.stillCurrent);
                          setView(
                            await send({
                              type: 'agents/forget',
                              machineId: machine.id,
                              password,
                              keysReplaced: !hasCurrentExposed,
                            }),
                          );
                          setPassword('');
                        })
                      }
                    >
                      {t('agents.forget')}
                    </Button>
                  )}
                </>
              }
            />
          ))
        )}
      </Section>

      {/* Agent vaults & items */}
      <Section title={t('agents.vaultsTitle')}>
        <div className="border-b border-neutral-100 p-4 dark:border-neutral-800/80">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label={t('agents.vaultName')} value={vaultName} onChange={(event) => setVaultName(event.target.value)} />
            </div>
            <Button
              size="md"
              variant="primary"
              disabled={busy || !vaultName.trim()}
              data-testid="agents-create-vault"
              onClick={() =>
                void run(async () => {
                  setView(await send({ type: 'agents/vaultCreate', name: vaultName.trim() }));
                  setVaultName('');
                })
              }
            >
              {t('agents.createVault')}
            </Button>
          </div>
        </div>

        {view.vaults.length > 0 && liveMachines.length > 0 && (
          <Row
            label={t('agents.approvalLabel')}
            control={
              <Choice
                value={grantApproval}
                onChange={setGrantApproval}
                label={t('agents.approvalLabel')}
                options={[
                  { value: 'each', label: t('agents.approvalEach') },
                  { value: 'session', label: t('agents.approvalSession') },
                  { value: 'standing', label: t('agents.approvalStanding') },
                ]}
              />
            }
          />
        )}

        {view.vaults.length === 0 ? (
          <Row label={t('agents.vaultsEmpty')} />
        ) : (
          view.vaults.map((vault) => (
            <Row key={vault.id} label={vault.name} description={vault.id}>
              <div className="flex flex-col gap-3">
                {vault.items.map((item) =>
                  editing?.vaultId === vault.id && editing.itemId === item.id ? (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-xl border border-brand-300/80 bg-neutral-50/70 p-3 dark:border-brand-500/40 dark:bg-neutral-900/80"
                    >
                      <div className={editing.kind === 'apikey' ? 'grid grid-cols-1 gap-2 sm:grid-cols-3' : 'grid grid-cols-1 gap-2'}>
                        <Field
                          label={t('agents.addKeyTitle')}
                          value={editing.title}
                          data-testid={`agents-edit-title-${item.id}`}
                          onChange={(event) => setEditing((prev) => (prev ? { ...prev, title: event.target.value } : prev))}
                        />
                        {editing.kind === 'apikey' && (
                          <>
                            <Field
                              type="password"
                              label={t('agents.addKeySecret')}
                              hint={t('agents.editKeyHint')}
                              value={editing.key}
                              data-testid={`agents-edit-key-${item.id}`}
                              onChange={(event) => setEditing((prev) => (prev ? { ...prev, key: event.target.value } : prev))}
                            />
                            <Field
                              label={t('agents.addKeyHost')}
                              value={editing.hosts}
                              data-testid={`agents-edit-hosts-${item.id}`}
                              onChange={(event) => setEditing((prev) => (prev ? { ...prev, hosts: event.target.value } : prev))}
                            />
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={busy || !editing.title.trim()}
                          data-testid={`agents-save-${item.id}`}
                          onClick={() =>
                            void run(async () => {
                              const res = await send({
                                type: 'agents/itemEdit',
                                vaultId: vault.id,
                                itemId: item.id,
                                title: editing.title.trim(),
                                key: editing.key,
                                hosts: editing.kind === 'apikey' ? cleanHosts(editing.hosts) : [],
                              });
                              setView(res.overview);
                              setEditing(null);
                            })
                          }
                        >
                          {t('common.save')}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busy}
                          data-testid={`agents-cancel-${item.id}`}
                          onClick={() => setEditing(null)}
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200/70 px-3 py-2 dark:border-neutral-800"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium">{item.title}</div>
                        <div className="text-[12px] text-neutral-500 dark:text-neutral-400">{item.hosts.join(', ') || item.kind}</div>
                        {item.grants.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1" data-testid={`agents-item-grants-${item.id}`}>
                            {item.grants.map((g) => (
                              <span
                                key={`${g.machineId}:${g.approval}`}
                                className="inline-flex items-center rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                              >
                                {`${g.machineName} · ${
                                  g.approval === 'session'
                                    ? t('agents.approvalSession')
                                    : g.approval === 'standing'
                                      ? t('agents.approvalStanding')
                                      : t('agents.approvalEach')
                                }`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {liveMachines.map((m) => {
                          const held = item.grants.some((g) => g.machineId === m.id);
                          return (
                            <div key={m.id} className="flex gap-1">
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={busy}
                                data-testid={`agents-grant-${item.id}-${m.id}`}
                                onClick={() =>
                                  void run(async () =>
                                    setView(
                                      await send({
                                        type: 'agents/grant',
                                        machineId: m.id,
                                        vaultId: vault.id,
                                        itemId: item.id,
                                        uses: ['request', 'run'],
                                        approval: grantApproval,
                                      }),
                                    ),
                                  )
                                }
                              >
                                {`${t('agents.grantButton')} · ${m.name}`}
                              </Button>
                              {held && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={busy}
                                  data-testid={`agents-withdraw-${item.id}-${m.id}`}
                                  onClick={() =>
                                    void run(async () =>
                                      setView(
                                        await send({
                                          type: 'agents/withdraw',
                                          machineId: m.id,
                                          vaultId: vault.id,
                                          itemId: item.id,
                                        }),
                                      ),
                                    )
                                  }
                                >
                                  {t('agents.withdrawButton')}
                                </Button>
                              )}
                            </div>
                          );
                        })}
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy}
                          data-testid={`agents-edit-${item.id}`}
                          onClick={() =>
                            setEditing({
                              vaultId: vault.id,
                              itemId: item.id,
                              kind: item.kind,
                              title: item.title,
                              key: '',
                              hosts: item.hosts.join(', '),
                            })
                          }
                        >
                          {t('common.edit')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy}
                          data-testid={`agents-delete-${item.id}`}
                          onClick={() =>
                            void run(async () => {
                              const res = await send({
                                type: 'agents/itemPut',
                                vaultId: vault.id,
                                itemId: item.id,
                                value: null,
                              });
                              setView(res.overview);
                              if (editing?.vaultId === vault.id && editing.itemId === item.id) setEditing(null);
                            })
                          }
                        >
                          {t('agents.deleteButton')}
                        </Button>
                      </div>
                    </div>
                  ),
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Field
                    label={t('agents.addKeyTitle')}
                    value={keyVaultId === vault.id ? keyTitle : ''}
                    onChange={(event) => {
                      setKeyVaultId(vault.id);
                      setKeyTitle(event.target.value);
                    }}
                  />
                  <Field
                    type="password"
                    label={t('agents.addKeySecret')}
                    value={keyVaultId === vault.id ? keySecret : ''}
                    onChange={(event) => {
                      setKeyVaultId(vault.id);
                      setKeySecret(event.target.value);
                    }}
                  />
                  <Field
                    label={t('agents.addKeyHost')}
                    value={keyVaultId === vault.id ? keyHost : ''}
                    onChange={(event) => {
                      setKeyVaultId(vault.id);
                      setKeyHost(event.target.value);
                    }}
                  />
                </div>
                <div>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy || keyVaultId !== vault.id || !keyTitle.trim() || !keySecret}
                    data-testid={`agents-add-key-${vault.id}`}
                    onClick={() =>
                      void run(async () => {
                        const slug = serviceOfKey(keySecret) ?? '';
                        const res = await send({
                          type: 'agents/itemPut',
                          vaultId: vault.id,
                          itemId: null,
                          value: {
                            kind: 'apikey',
                            title: keyTitle.trim(),
                            service: slug,
                            key: keySecret,
                            keyId: '',
                            hosts: cleanHosts(keyHost),
                            sendAs: 'bearer',
                            env: '',
                            environment: '',
                            scopes: '',
                            issuedAt: null,
                            expiresAt: null,
                            notes: '',
                          },
                        });
                        setView(res.overview);
                        setKeyTitle('');
                        setKeySecret('');
                        setKeyHost('');
                      })
                    }
                  >
                    {t('agents.addKeyButton')}
                  </Button>
                </div>
              </div>
            </Row>
          ))
        )}
      </Section>

      {/* Activity & audit log */}
      <Section
        title={t('agents.auditTitle')}
        action={
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            data-testid="agents-load-audit"
            onClick={() => void run(async () => setAudit(await send({ type: 'agents/audit' })))}
          >
            {t('agents.loadAudit')}
          </Button>
        }
      >
        {audit && (
          <>
            {audit.gaps > 0 && (
              <div className="border-b border-neutral-100 p-4 dark:border-neutral-800/80">
                <Callout tone="warning">{t('agents.auditGaps', { count: audit.gaps })}</Callout>
              </div>
            )}
            {auditEvents.length === 0 ? (
              <Row label={t('agents.auditEmpty')} />
            ) : (
              auditEvents.map((ev) => <Row key={ev.key} label={ev.label} description={ev.description} />)
            )}
          </>
        )}
      </Section>
    </>
  );
}
