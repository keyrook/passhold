/**
 * Machines, as a person's Passhold and a machine's runtime make them: turning
 * agents on, an invitation and the machine that answers it, the code both
 * screens show, the person's confirmation, and a token machine; agent
 * vaults, what each machine is given and taken back, new keys for what a
 * machine that is gone could open, and the machine's own pull.
 *
 * Before it writes, Passhold opens the directory and checks it against what
 * this device trusted last: the same version with the same digest, or a
 * later one reached through every version between, each naming the digest
 * of the one before. Every machine the directory names must have its pin,
 * and every pin a machine; a server that hides one, shows a stale one, or
 * shows a branch that left out a step this device saw, stops the write. A
 * device with nothing trusted yet takes the directory it is shown.
 */
import { DecryptionError, type SealedBox } from '../crypto/aead.js';
import {
  agentDirectoryDigest,
  agentItemKeyCheck,
  authorityPointsOf,
  checkAgentItemKey,
  checkAgentRecord,
  checkMachineActivation,
  checkMachineWithdrawal,
  checkOwnerStatement,
  decodeMachineInvitation,
  decodeMachineToken,
  encodeMachineInvitation,
  encodeMachineToken,
  machineConfirmCode,
  machinePinDigest,
  newAgentAuthority,
  newAgentItemKey,
  newAgentVaultKey,
  newMachineCredential,
  newMachineKey,
  newRequestKey,
  openAgentAuthority,
  openAgentDirectory,
  openAgentItemKey,
  openAgentRecord,
  openAgentTombstone,
  openAgentVaultKey,
  openAgentVaultName,
  openMachineAnswer,
  openMachineDecisionRecord,
  openMachineInboxEntry,
  openMachineItem,
  openMachineLogEntry,
  openMachinePin,
  openMachineRequest,
  pinAuthority,
  sealAgentAuthority,
  sealAgentDirectory,
  sealAgentItemKey,
  sealAgentRecord,
  sealAgentTombstone,
  sealAgentVaultKey,
  sealAgentVaultName,
  sealMachineAnswer,
  sealMachineDecisionRecord,
  sealMachineInboxEntry,
  sealMachineItem,
  sealMachineLogEntry,
  sealMachinePin,
  sealMachineRequest,
  signMachineActivation,
  signMachineWithdrawal,
  type AgentAuthority,
  type AgentDirectory,
  type AgentItemVersion,
  type AgentRecordPlace,
  type AgentReplacedItem,
  type AgentVaultKey,
  type MachineDecisionRecord,
  type MachineExposure,
  type MachineKind,
  type MachineLogEntry,
  type MachineOperation,
  type MachineRequest,
  type OpenedMachineAnswer,
  type OpenedMachineRequest,
  type OutstandingRequest,
  type MachinePin,
  type MachinePinGrant,
  type MachineToken,
  type PinnedAuthority,
} from '../keys/machine.js';
import type { MemberKey } from '../keys/org/member.js';
import { deriveProductKeyCheck, PASSHOLD } from '../keys/product.js';
import type { ProductKey } from './product-key.js';
import { SyncHttpError, type HttpSyncAdapter } from '../sync/http.js';
import type { MachineClient, MachineCredential } from '../sync/machine-http.js';
import type {
  AgentAuthorityPoints,
  AgentMoveProof,
  AgentMoveState,
  AgentMoveStepRequest,
  AgentMoveVault,
  AgentRecordWire,
  AgentRekeyRecord,
  AgentSignedBox,
  AgentsState,
  MachineApproval,
  MachineDelivery,
  MachineGrant,
  MachineGrantChange,
  MachineHourView,
  MachineInboxReceipt,
  MachineListing,
  MachineLogAck,
  MachineLogBatch,
  MachineLogRange,
  MachineRequestState,
  MachinePulledItem,
  MachineUse,
  MachineView,
  NextDirectory,
  OwnerProofFields,
  SendAgentsBackRequest,
} from '../sync/protocol.js';
import { toBase64, utf8 } from '../util/bytes.js';
import { newId, randomBytes } from '../util/id.js';

/** What a device remembers of the last directory it trusted. */
export interface AgentCheckpoint {
  version: number;
  digest: string;
}

/** The account's agents as this device opened and checked them. */
export interface TrustedAgents {
  /** The account, and the generation of Passhold's key, this was opened with. */
  accountId: string;
  keyGeneration: number;
  authority: AgentAuthority;
  directory: AgentDirectory;
  checkpoint: AgentCheckpoint;
  /** Each machine's pin, opened, by id. */
  pins: Map<string, MachinePin>;
  /** What the server holds of each machine. */
  machines: Map<string, MachineView>;
  state: AgentsState;
  /** What a start over put aside: read, and never written from. */
  readOnly?: boolean;
}

type OwnerApi = Pick<HttpSyncAdapter, 'agents' | 'createAgentAuthority' | 'createMachineEnrollment' | 'machineEnrollment' | 'confirmMachineEnrollment' | 'createTokenMachine'>;

/**
 * Turns agents on: a new authority, sealed under Passhold's key, and the
 * first directory, naming no machine yet. Returns what this device trusts.
 */
export async function turnOnAgents(api: Pick<OwnerApi, 'agents' | 'createAgentAuthority'>, passhold: ProductKey): Promise<TrustedAgents> {
  if (passhold.product !== PASSHOLD) throw new Error('Only Passhold holds the agent authority.');
  const { accountId, key: passholdKey } = passhold;
  const authority = await newAgentAuthority();
  const directory: AgentDirectory = { version: 1, prev: null, authority: authorityPointsOf(authority), vaults: [], machines: [], wholeVault: [], rekey: [], replaced: [] };
  const box = await sealAgentDirectory(passholdKey, accountId, directory);
  await api.createAgentAuthority({
    points: authorityPointsOf(authority),
    wrap: await sealAgentAuthority(authority, passholdKey, accountId),
    keyGeneration: passhold.keyGeneration,
    keyCheck: await deriveProductKeyCheck(PASSHOLD, passholdKey),
    directory: box,
  });
  return openAgents(api, passhold, { version: 1, digest: await agentDirectoryDigest(box, accountId) });
}

/**
 * Reads the account's agents and checks them against what this device last
 * trusted. A directory older than that, another of the same version, a later
 * one not reached through every version between from the trusted one, or a
 * pin set that does not match the directory, fails as a `DecryptionError`,
 * and nothing is written. What a machine is, how long it lasts and whether
 * it is removed come from the directory and its pin, never from the server.
 * A device that trusted the agents before they moved to Passhold's new key
 * (`moveAgentsToNewKey`) checks the steps under the old key with
 * `previousKey`; without it, only a checkpoint of the last of them is
 * followed.
 */
export async function openAgents(
  api: Pick<OwnerApi, 'agents'>,
  passhold: ProductKey,
  trusted: AgentCheckpoint | null,
  options: { previousKey?: CryptoKey } = {},
): Promise<TrustedAgents> {
  if (passhold.product !== PASSHOLD) throw new Error('Only Passhold holds the agent authority.');
  // The steps before the agents moved to Passhold's new key are under the key they moved from.
  return trustAgents(await api.agents(trusted?.version ?? 0), passhold, trusted, options.previousKey ? [passhold.key, options.previousKey] : [passhold.key]);
}

/** A step of the directory's history, opened with whichever of `keys` it is under. */
async function openStep(keys: CryptoKey[], box: SealedBox, accountId: string): Promise<AgentDirectory> {
  for (const key of keys) {
    try {
      return await openAgentDirectory(key, box, accountId);
    } catch (error) {
      if (!(error instanceof DecryptionError)) throw error;
    }
  }
  throw new DecryptionError('The agent directory does not match what this device trusts.');
}

/** The agents as `state` holds them, checked as `openAgents` checks what the server sends. */
async function trustAgents(state: AgentsState, passhold: ProductKey, trusted: AgentCheckpoint | null, stepKeys: CryptoKey[]): Promise<TrustedAgents> {
  if (passhold.product !== PASSHOLD) throw new Error('Only Passhold holds the agent authority.');
  const { accountId, key: passholdKey } = passhold;
  const stale = () => new DecryptionError('The agent directory does not match what this device trusts.');
  if (!state.authority) throw new DecryptionError('Agents are not turned on for this account.');
  const authority = await openAgentAuthority(state.authority.wrap, passholdKey, accountId);
  const points = authorityPointsOf(authority);
  if (state.authority.points.box !== points.box || state.authority.points.sign !== points.sign) throw stale();
  const box = state.authority.directory.box;
  const directory = await openAgentDirectory(passholdKey, box, accountId);
  const digest = await agentDirectoryDigest(box, accountId);
  if (directory.version !== state.authority.directory.version || directory.authority.box !== points.box || directory.authority.sign !== points.sign) throw stale();
  if (trusted) {
    if (directory.version < trusted.version) throw stale();
    if (directory.version === trusted.version && digest !== trusted.digest) throw stale();
    if (directory.version > trusted.version) {
      // Each step from the trusted version to this one, in order, each naming the digest of the one before.
      const steps = state.authority.history;
      if (steps.length !== directory.version - trusted.version) throw stale();
      let prev = trusted.digest;
      for (const [index, step] of steps.entries()) {
        if (step.version !== trusted.version + index + 1) throw stale();
        const opened = await openStep(stepKeys, step.box, accountId);
        if (opened.version !== step.version || opened.prev !== prev) throw stale();
        prev = await agentDirectoryDigest(step.box, accountId);
      }
      if (prev !== digest) throw stale();
    }
  }
  if (new Set(state.machines.map((machine) => machine.id)).size !== state.machines.length) throw stale();
  const views = new Map(state.machines.map((machine) => [machine.id, machine]));
  if (views.size !== directory.machines.length) throw stale();
  const pins = new Map<string, MachinePin>();
  const machines = new Map<string, MachineView>();
  for (const entry of directory.machines) {
    const view = views.get(entry.id);
    if (!view || (await machinePinDigest(view.pin, accountId, entry.id)) !== entry.pin) throw stale();
    const pin = await openMachinePin(passholdKey, view.pin, accountId, entry.id);
    if (pin.rev !== entry.rev || pin.key !== view.publicKey || pin.kind !== view.kind) throw stale();
    // The directory's word on removal stands, whatever the pin from before it says.
    const removed = entry.removed || pin.removedAt !== null;
    if (!entry.removed && pin.removedAt !== null) throw stale();
    pins.set(entry.id, pin);
    machines.set(entry.id, { ...view, kind: pin.kind, publicKey: pin.key, expiresAt: pin.expiresAt, createdAt: pin.createdAt, status: removed ? 'removed' : view.status === 'paused' ? 'paused' : 'live' });
  }
  // A whole vault given to a machine is in its pin and in the directory, both ways.
  const fromPins = new Set<string>();
  for (const [machineId, pin] of pins) {
    const entry = directory.machines.find((machine) => machine.id === machineId)!;
    if (entry.removed) continue;
    for (const grant of pin.grants) if (grant.item === null) fromPins.add(`${machineId}:${grant.vault}:${grant.rev}`);
  }
  const fromDirectory = new Set(directory.wholeVault.map((grant) => `${grant.machine}:${grant.vault}:${grant.rev}`));
  if (fromPins.size !== fromDirectory.size || [...fromPins].some((grant) => !fromDirectory.has(grant))) throw stale();
  return { accountId, keyGeneration: passhold.keyGeneration, authority, directory, checkpoint: { version: directory.version, digest }, pins, machines, state };
}

/** An invitation made on the person's device: what they carry to the machine, and its id to watch. */
export interface MachineInvitationMade {
  invitationId: string;
  /** `phi_…`, shown once, for the person to give the machine. */
  text: string;
}

/** Makes an invitation to enroll a machine. The secret goes to the server once, and in the text to the machine. */
export async function beginMachineEnrollment(api: OwnerApi, trusted: TrustedAgents, accountId: string): Promise<MachineInvitationMade> {
  const invitationId = newId();
  const secret = newMachineCredential();
  await api.createMachineEnrollment({ id: invitationId, secret });
  return { invitationId, text: await encodeMachineInvitation({ accountId, invitationId, secret, authority: authorityPointsOf(trusted.authority) }) };
}

/** A machine that has answered an invitation: what its runtime keeps, in its keychain, until it is confirmed. */
export interface PendingMachine {
  accountId: string;
  machineId: string;
  invitationId: string;
  key: MemberKey;
  credential: string;
  /** The authority as the invitation carried it from the person's device. */
  authority: AgentAuthorityPoints;
  /** The code this screen shows. */
  code: string;
}

/**
 * The machine's side: reads the invitation the person pasted, makes its own
 * id, key and credential, answers the invitation and shows its code.
 */
export async function submitMachineEnrollment(client: Pick<MachineClient, 'enroll'>, invitationText: string): Promise<PendingMachine> {
  const invitation = await decodeMachineInvitation(invitationText);
  const machineId = newId();
  const key = await newMachineKey();
  const credential = newMachineCredential();
  await client.enroll({ accountId: invitation.accountId, invitationId: invitation.invitationId, secret: invitation.secret }, { machineId, publicKey: key.publicKey, credential });
  const code = await machineConfirmCode({ accountId: invitation.accountId, authority: invitation.authority, machineId, machineKey: key.publicKey });
  return { accountId: invitation.accountId, machineId, invitationId: invitation.invitationId, key, credential, authority: invitation.authority, code };
}

/** Whether the person confirmed this machine. An activation that is not the authority's, for this machine, fails as a `DecryptionError`. */
export async function machineEnrollmentStatus(
  client: Pick<MachineClient, 'enrollmentStatus'>,
  pending: PendingMachine,
  now = Date.now(),
): Promise<{ confirmed: false } | { confirmed: true; expiresAt: number }> {
  const status = await client.enrollmentStatus({ accountId: pending.accountId, machineId: pending.machineId, credential: pending.credential });
  if (!status.confirmed || !status.activation) return { confirmed: false };
  // A genuine activation past its own end, handed back again, activates nothing.
  if (!(status.activation.expiresAt > now)) throw new DecryptionError('That was not signed by this account’s Passhold.');
  const pinned = await pinAuthority(pending.authority);
  await checkMachineActivation(pinned, { accountId: pending.accountId, machineId: pending.machineId, invitationId: pending.invitationId, machineKey: pending.key.publicKey }, status.activation.expiresAt, status.activation.sig);
  return { confirmed: true, expiresAt: status.activation.expiresAt };
}

/** The candidate the person compares, as their device computes the code itself. */
export interface MachineCandidate {
  invitationId: string;
  machineId: string;
  publicKey: string;
  code: string;
}

/** The person's side: the machine that answered, and the code this screen shows. Null until one has. */
export async function reviewMachineEnrollment(api: OwnerApi, trusted: TrustedAgents, accountId: string, invitationId: string): Promise<MachineCandidate | null> {
  const view = await api.machineEnrollment(invitationId);
  if (view.machineId === null || view.publicKey === null || view.confirmedAt !== null) return null;
  const code = await machineConfirmCode({ accountId, authority: authorityPointsOf(trusted.authority), machineId: view.machineId, machineKey: view.publicKey });
  return { invitationId, machineId: view.machineId, publicKey: view.publicKey, code };
}

const DAY_MS = 24 * 60 * 60_000;
/** An enrolled machine lasts a year unless the person chooses less; a token, 90 days. */
export const MACHINE_LIFETIME = { enrolled: 365 * DAY_MS, token: 90 * DAY_MS, min: DAY_MS, max: 365 * DAY_MS };

/** What adding any machine needs of the person: its name, how long it lasts, and fresh proof they are there. */
export interface MachineDetails {
  name: string;
  /** Milliseconds from now; the kind's default when left out. */
  lifetime?: number;
  proof: OwnerProofFields;
}

async function nextDirectory(trusted: TrustedAgents, accountId: string, passholdKey: CryptoKey, machineId: string, pinBox: SealedBox, pin: MachinePin) {
  const directory: AgentDirectory = {
    ...trusted.directory,
    version: trusted.directory.version + 1,
    prev: trusted.checkpoint.digest,
    machines: [...trusted.directory.machines, { id: machineId, rev: pin.rev, pin: await machinePinDigest(pinBox, accountId, machineId), removed: false }],
  };
  const box = await sealAgentDirectory(passholdKey, accountId, directory);
  return { directory, box, checkpoint: { version: directory.version, digest: await agentDirectoryDigest(box, accountId) } };
}

function pinFor(kind: MachineKind, key: string, details: MachineDetails, now: number): MachinePin {
  const lifetime = details.lifetime ?? MACHINE_LIFETIME[kind];
  if (!Number.isSafeInteger(lifetime) || lifetime < MACHINE_LIFETIME.min || lifetime > MACHINE_LIFETIME.max) throw new Error('A machine lasts from a day to a year.');
  return { rev: 1, kind, key, name: details.name, createdAt: now, expiresAt: now + lifetime, grants: [], lastGrant: 0, exposed: [], removedAt: null };
}

/**
 * Confirms the machine whose code the person matched: pins its point and
 * name, names it in the next directory, and signs its activation. The code
 * is worked out again here from the candidate as it is now; one that changed
 * after it was shown is never signed. Returns the checkpoint this device now
 * trusts.
 */
export async function confirmMachineEnrollment(
  api: OwnerApi,
  trusted: TrustedAgents,
  passhold: ProductKey,
  candidate: MachineCandidate,
  details: MachineDetails,
): Promise<AgentCheckpoint> {
  const { accountId, key: passholdKey } = passhold;
  const shown = { invitationId: candidate.invitationId, machineId: candidate.machineId, publicKey: candidate.publicKey, code: candidate.code };
  const code = await machineConfirmCode({ accountId, authority: authorityPointsOf(trusted.authority), machineId: shown.machineId, machineKey: shown.publicKey });
  if (code !== shown.code) throw new Error('The codes do not match. Start enrollment again.');
  const pin = pinFor('enrolled', shown.publicKey, details, Date.now());
  const pinBox = await sealMachinePin(passholdKey, accountId, shown.machineId, pin);
  const next = await nextDirectory(trusted, accountId, passholdKey, shown.machineId, pinBox, pin);
  const enrollment = { accountId, machineId: shown.machineId, invitationId: shown.invitationId, machineKey: shown.publicKey };
  await api.confirmMachineEnrollment(shown.invitationId, {
    ...details.proof,
    machineId: shown.machineId,
    publicKey: shown.publicKey,
    pin: pinBox,
    expiresAt: pin.expiresAt,
    directory: { version: next.directory.version, box: next.box, prev: trusted.checkpoint.digest },
    activation: await signMachineActivation(trusted.authority, enrollment, pin.expiresAt),
  });
  return next.checkpoint;
}

/**
 * Makes a token machine on this device: its key and credential, its pin and
 * the next directory. The token is returned to its maker alone, to show
 * once; nothing else keeps it.
 */
export async function createMachineToken(
  api: OwnerApi,
  trusted: TrustedAgents,
  passhold: ProductKey,
  details: MachineDetails,
): Promise<{ token: string; machineId: string; checkpoint: AgentCheckpoint }> {
  const { accountId, key: passholdKey } = passhold;
  const machineId = newId();
  const key = await newMachineKey();
  const credential = newMachineCredential();
  const pin = pinFor('token', key.publicKey, details, Date.now());
  const pinBox = await sealMachinePin(passholdKey, accountId, machineId, pin);
  const next = await nextDirectory(trusted, accountId, passholdKey, machineId, pinBox, pin);
  await api.createTokenMachine({
    ...details.proof,
    machineId,
    publicKey: key.publicKey,
    pin: pinBox,
    expiresAt: pin.expiresAt,
    directory: { version: next.directory.version, box: next.box, prev: trusted.checkpoint.digest },
    credential,
    // A token machine's activation names its own id where an enrolled one names its invitation.
    activation: await signMachineActivation(trusted.authority, { accountId, machineId, invitationId: machineId, machineKey: key.publicKey }, pin.expiresAt),
  });
  const token = await encodeMachineToken({ accountId, machineId, expiresAt: pin.expiresAt, credential, key, authority: authorityPointsOf(trusted.authority) });
  return { token: `PASSHOLD_MACHINE_TOKEN=${token}`, machineId, checkpoint: next.checkpoint };
}

/** Reads a token as a machine's runtime is given it. */
export async function parseMachineToken(text: string): Promise<MachineToken & { pinned: PinnedAuthority; credentials: MachineCredential }> {
  const token = await decodeMachineToken(text);
  return { ...token, pinned: await pinAuthority(token.authority), credentials: { accountId: token.accountId, machineId: token.machineId, credential: token.credential } };
}


// ---------------------------------------------------------------------------
// Agent vaults, as the person's Passhold writes them

type VaultApi = Pick<HttpSyncAdapter, 'agents' | 'agentVaults' | 'createAgentVault' | 'agentVaultPull' | 'agentVaultPush' | 'putMachineGrants' | 'rekeyAgentItems'>;

const stale = () => new DecryptionError('The agent directory does not match what this device trusts.');
const untrustedKey = () => new DecryptionError('That item key is not the one Passhold trusts.');
const notReplaced = () => new Error('The item keys have not been replaced yet.');
const stuck = () => new DecryptionError('The server sent pages that do not follow each other.');
/** More pages than any pull of an account at its ceilings takes. */
const MAX_PAGES = 1000;

/** The agents this device trusts, and the Passhold key that opened them: another account's, product's or generation's writes nothing, and nothing is written from an archive. */
function ownerOf(trusted: TrustedAgents, passhold: ProductKey, write = true): void {
  if (passhold.product !== PASSHOLD) throw new Error('Only Passhold holds the agent authority.');
  if (passhold.accountId !== trusted.accountId || passhold.keyGeneration !== trusted.keyGeneration) throw stale();
  if (write && trusted.readOnly) throw new Error('What a start over put aside can only be read.');
}

/** An agent vault as this device opened it: its key and write key, from Passhold's key, and its name. */
export interface OpenedAgentVault {
  id: string;
  generation: number;
  name: string;
  key: AgentVaultKey;
}

/** One item of an agent vault as this device opened it, with its version's key. */
export interface AgentItem<T = unknown> {
  vault: string;
  item: string;
  version: number;
  rev: number;
  deleted: boolean;
  /** The record's value; null for a deletion. */
  value: T | null;
  key: CryptoKey;
}

/** The vault as the directory this device trusts names it, or a refusal: a vault it does not name is no vault of this account's. */
function trustedVault(trusted: TrustedAgents, vault: Pick<OpenedAgentVault, 'id' | 'generation' | 'key'>) {
  const entry = trusted.directory.vaults.find((known) => known.id === vault.id);
  if (!entry || entry.generation !== vault.generation || entry.write !== vault.key.write.publicKey) throw stale();
  return entry;
}

/** Checks an item's key is the one the directory trusts for it, at the version it trusts. */
async function trustedItem(trusted: TrustedAgents, item: AgentItem, vault: OpenedAgentVault): Promise<void> {
  if (item.vault !== vault.id) throw untrustedKey();
  await checkAgentItemKey(trusted.directory, trusted.accountId, { vault: item.vault, item: item.item, version: item.version }, item.key);
}

/**
 * Whether a machine no longer acts for the account: the directory names it
 * removed, its pin's expiry has passed, or the server says it ended it. The
 * last is the server's word alone: it holds back writes, and the person
 * confirms it before the directory says so (`settleMachines`).
 */
function hasEnded(trusted: TrustedAgents, machineId: string, now: number): boolean {
  const entry = trusted.directory.machines.find((machine) => machine.id === machineId);
  const pin = trusted.pins.get(machineId);
  return !entry || !pin || entry.removed || pin.removedAt !== null || pin.expiresAt <= now || trusted.state.machines.find((view) => view.id === machineId)?.status === 'removed';
}

/**
 * Item versions that wait for a new key: those the directory names, and each
 * one whose key a machine that has ended could hold, at the version the
 * directory trusts, of a vault it still names. A removal writes the
 * directory alone; the work it leaves is read from the machine's own pin, so
 * no number of items keeps a machine from being removed.
 */
function pendingRekey(trusted: TrustedAgents, now = Date.now()): AgentItemVersion[] {
  const pending = new Map(trusted.directory.rekey.map((entry) => [versionOf(entry), entry]));
  for (const { id } of trusted.directory.machines) {
    if (!hasEnded(trusted, id, now)) continue;
    for (const exposure of trusted.pins.get(id)?.exposed ?? []) {
      if (!exposure.key || !trusted.directory.vaults.some((vault) => vault.id === exposure.vault)) continue;
      if (exposure.version !== trustedVersion(trusted.directory, exposure.vault, exposure.item)) continue;
      const entry = { vault: exposure.vault, item: exposure.item, version: exposure.version };
      if (!pending.has(versionOf(entry))) pending.set(versionOf(entry), entry);
    }
  }
  return [...pending.values()];
}

const waitsForKey = (trusted: TrustedAgents, entry: AgentItemVersion) => pendingRekey(trusted).some((pending) => versionOf(pending) === versionOf(entry));

/** The version of an item's key the directory trusts: the one that replaced it, or the first. */
const trustedVersion = (directory: AgentDirectory, vault: string, item: string) => directory.replaced.find((entry) => entry.vault === vault && entry.item === item)?.version ?? 1;

const versionOf = (entry: AgentItemVersion) => `${entry.vault}:${entry.item}:${entry.version}`;

/** The directory after this one: what `change` makes of it, the version after, naming this one. */
async function sealNextDirectory(trusted: TrustedAgents, passhold: ProductKey, change: (directory: AgentDirectory) => AgentDirectory) {
  const { accountId, key } = passhold;
  const directory: AgentDirectory = { ...change(trusted.directory), version: trusted.directory.version + 1, prev: trusted.checkpoint.digest };
  const box = await sealAgentDirectory(key, accountId, directory);
  const next: NextDirectory = { version: directory.version, box, prev: trusted.checkpoint.digest };
  return { directory, next, checkpoint: { version: directory.version, digest: await agentDirectoryDigest(box, accountId) } };
}

/** Pins as they now are, sealed, and the next directory naming each at its new revision and digest. */
async function sealPins(trusted: TrustedAgents, passhold: ProductKey, pins: Map<string, MachinePin>, change: (directory: AgentDirectory) => AgentDirectory = (same) => same) {
  const { accountId, key } = passhold;
  const boxes = new Map<string, SealedBox>();
  const digests = new Map<string, string>();
  for (const [machineId, pin] of pins) {
    const box = await sealMachinePin(key, accountId, machineId, pin);
    boxes.set(machineId, box);
    digests.set(machineId, await machinePinDigest(box, accountId, machineId));
  }
  const next = await sealNextDirectory(trusted, passhold, (directory) => {
    const changed = change(directory);
    return {
      ...changed,
      machines: changed.machines.map((entry) => (pins.has(entry.id) ? { ...entry, rev: pins.get(entry.id)!.rev, pin: digests.get(entry.id)! } : entry)),
    };
  });
  // What this device trusts once the write is taken: its own directory and pins, read from nothing the server says.
  const after: TrustedAgents = { ...trusted, directory: next.directory, checkpoint: next.checkpoint, pins: new Map([...trusted.pins, ...pins]) };
  return { ...next, boxes, after };
}

/** A machine the directory names as live, with its pin. */
function liveMachine(trusted: TrustedAgents, machineId: string, now: number): MachinePin {
  const entry = trusted.directory.machines.find((machine) => machine.id === machineId);
  const pin = trusted.pins.get(machineId);
  if (!entry || !pin || entry.removed || pin.removedAt !== null) throw new Error('This machine was removed.');
  if (pin.expiresAt <= now) throw new Error('This machine has expired. Enroll it again in Passhold.');
  return pin;
}

const keyExposed = (pin: MachinePin, entry: AgentItemVersion) => pin.exposed.some((known) => known.key && versionOf(known) === versionOf(entry));

/**
 * The exposure list with this version's key marked as one the machine could
 * hold. A key of an older version of the item, with no value read beside it,
 * says nothing the new key has not replaced, so it goes: the list grows with
 * items, never with how often their keys change.
 */
function exposeKey(exposed: MachineExposure[], entry: AgentItemVersion): MachineExposure[] {
  const kept = exposed.filter((known) => !(known.vault === entry.vault && known.item === entry.item && known.version !== entry.version && known.fields.length === 0));
  const at = kept.findIndex((known) => versionOf(known) === versionOf(entry));
  if (at < 0) return [...kept, { vault: entry.vault, item: entry.item, version: entry.version, key: true, fields: [] }];
  return kept.map((known, index) => (index === at ? { ...known, key: true, fields: known.fields.map((field) => ({ ...field })) } : known));
}

const grantOf = (grant: MachinePinGrant): MachineGrant => ({
  id: grant.id,
  rev: grant.rev,
  uses: [...grant.uses],
  approval: grant.approval,
  session: grant.session,
  bounds: grant.bounds,
  expiresAt: grant.expiresAt,
});

/**
 * Every agent vault the directory this device trusts names, opened with
 * Passhold's key. Each must be there, at the generation named, with the
 * write key named; the server's word on the write key is never taken. A
 * vault the server lists that the directory does not name is left out.
 */
export async function openAgentVaults(api: Pick<VaultApi, 'agentVaults'>, trusted: TrustedAgents, passhold: ProductKey): Promise<OpenedAgentVault[]> {
  ownerOf(trusted, passhold, false);
  const { accountId, key: passholdKey } = passhold;
  const listed = await api.agentVaults();
  const views = new Map(listed.vaults.map((view) => [view.id, view]));
  if (views.size !== listed.vaults.length) throw stale();
  const opened: OpenedAgentVault[] = [];
  for (const entry of trusted.directory.vaults) {
    const view = views.get(entry.id);
    if (!view || view.generation !== entry.generation) throw stale();
    const key = await openAgentVaultKey(view.keyWrap, passholdKey, accountId, entry.id, entry.generation);
    if (key.write.publicKey !== entry.write) throw stale();
    opened.push({ id: entry.id, generation: entry.generation, name: await openAgentVaultName(key.key, view.nameBox, accountId, entry.id, entry.generation), key });
  }
  return opened;
}

/** Makes an agent vault: its key and write key under Passhold's key, its name under its own, and the next directory naming it. */
export async function createAgentVault(api: Pick<VaultApi, 'createAgentVault'>, trusted: TrustedAgents, passhold: ProductKey, name: string): Promise<{ vault: OpenedAgentVault; checkpoint: AgentCheckpoint }> {
  ownerOf(trusted, passhold);
  const { accountId, key: passholdKey } = passhold;
  const vaultId = newId();
  const key = await newAgentVaultKey();
  const keyWrap = await sealAgentVaultKey(key, passholdKey, accountId, vaultId, 1);
  const nameBox = await sealAgentVaultName(key.key, name, accountId, vaultId, 1);
  const next = await sealNextDirectory(trusted, passhold, (directory) => ({ ...directory, vaults: [...directory.vaults, { id: vaultId, generation: 1, write: key.write.publicKey }] }));
  await api.createAgentVault({ id: vaultId, keyWrap, nameBox, writePoint: key.write.publicKey, directory: next.next });
  return { vault: { id: vaultId, generation: 1, name, key }, checkpoint: next.checkpoint };
}

/** The highest record of an item this device holds, so an older one is refused. */
export type KnownAgentRecord = (vault: string, item: string) => { version: number; rev: number } | null;

/** What a pull of an agent vault found. */
export interface AgentVaultSync<T = unknown> {
  /** Each item that changed, at its latest. */
  items: AgentItem<T>[];
  serverRev: number;
  epoch: string;
  /** The server's epoch was not the one this device knew, or its revision went back: this pull started from nothing, and the device sends back what the server lost. */
  reset: boolean;
}

const isBehind = (record: { version: number; rev: number }, held: { version: number; rev: number } | null | undefined) =>
  held !== null && held !== undefined && (record.version < held.version || (record.version === held.version && record.rev < held.rev));

async function openAgentItem<T>(trusted: TrustedAgents, vault: OpenedAgentVault, record: AgentRecordWire): Promise<AgentItem<T>> {
  const { accountId } = trusted;
  if (record.keyGeneration !== vault.generation) throw untrustedKey();
  const entry = { vault: vault.id, item: record.item, version: record.version };
  const key = await openAgentItemKey(record.itemKeyWrap, vault.key.key, accountId, vault.id, vault.generation, record.item, record.version);
  await checkAgentItemKey(trusted.directory, accountId, entry, key);
  const place: AgentRecordPlace = { accountId, vaultId: vault.id, itemId: record.item, version: record.version, rev: record.rev };
  if (record.deleted) {
    await openAgentTombstone(key, vault.key.write.verify, record.box, place);
    return { ...entry, rev: record.rev, deleted: true, value: null, key };
  }
  return { ...entry, rev: record.rev, deleted: false, value: await openAgentRecord<T>(key, vault.key.write.verify, record.box, place), key };
}

/**
 * Pulls what changed in an agent vault since `since`, every page of it. Each
 * record's key must be the one the directory trusts at that version, and
 * each record signed by the vault's write key for its place. A record older
 * than one this pull or `known` already holds, or pages that do not move on,
 * fail as a `DecryptionError`, and nothing of the pull is taken.
 */
export async function syncAgentVault<T = unknown>(
  api: Pick<VaultApi, 'agentVaultPull'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  vault: OpenedAgentVault,
  options: { since?: number; epoch?: string | null; known?: KnownAgentRecord } = {},
): Promise<AgentVaultSync<T>> {
  ownerOf(trusted, passhold, false);
  trustedVault(trusted, vault);
  let since = options.since ?? 0;
  let epoch = options.epoch ?? null;
  let reset = false;
  const items = new Map<string, AgentItem<T>>();
  const restart = (now: string) => {
    if (reset) throw stuck();
    reset = true;
    epoch = now;
    since = 0;
    items.clear();
  };
  for (let pages = 0; ; pages++) {
    if (pages >= MAX_PAGES) throw stuck();
    const page = await api.agentVaultPull(vault.id, since);
    if (!Number.isSafeInteger(page.serverRev) || page.serverRev < 0) throw stuck();
    if (epoch !== null && page.epoch !== epoch) {
      restart(page.epoch);
      continue;
    }
    epoch = page.epoch;
    // A vault's revision never goes back on one server: one behind this device's is a server that lost something.
    if (!page.hasMore && page.records.length === 0 && page.serverRev < since) {
      restart(page.epoch);
      continue;
    }
    for (const record of page.records) {
      const opened = await openAgentItem<T>(trusted, vault, record);
      if (isBehind(opened, items.get(record.item)) || isBehind(opened, options.known?.(vault.id, record.item))) throw new DecryptionError('That record is older than one this device has seen.');
      if (items.has(record.item) && !isBehind(items.get(record.item)!, opened)) throw new DecryptionError('That record is older than one this device has seen.');
      items.set(record.item, opened);
    }
    if (page.hasMore && page.serverRev <= since) throw stuck();
    since = page.serverRev;
    if (!page.hasMore) break;
  }
  return { items: [...items.values()], serverRev: since, epoch: epoch!, reset };
}

/**
 * Writes one item of an agent vault: `current` as this device last opened it
 * and its next value, a deletion with `null`, or a new item with no
 * `current`. An edit keeps its version's key, so whoever was given the item
 * reads the new revision; an item whose key waits to be replaced is refused
 * until it is, and the server takes the write only from the directory it is
 * at, so a device that has not seen a machine lose the item writes nothing.
 */
export async function putAgentItem<T>(
  api: Pick<VaultApi, 'agentVaultPush'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  vault: OpenedAgentVault,
  current: AgentItem | null,
  value: T | null,
): Promise<{ item: AgentItem<T>; serverRev: number }> {
  ownerOf(trusted, passhold);
  const { accountId } = passhold;
  trustedVault(trusted, vault);
  if (current === null && value === null) throw new Error('Malformed agent item.');
  if (current) {
    await trustedItem(trusted, current, vault);
    if (waitsForKey(trusted, current)) throw notReplaced();
  }
  const item = current?.item ?? newId();
  const version = current?.version ?? 1;
  const rev = current ? current.rev + 1 : 1;
  const key = current?.key ?? (await newAgentItemKey());
  const place: AgentRecordPlace = { accountId, vaultId: vault.id, itemId: item, version, rev };
  const box = value === null ? await sealAgentTombstone(key, vault.key.write, place) : await sealAgentRecord(key, vault.key.write, value, place);
  const itemKeyWrap = await sealAgentItemKey(key, vault.key.key, accountId, vault.id, vault.generation, item, version);
  const pushed = await api.agentVaultPush(vault.id, [{ item, version, rev, keyGeneration: vault.generation, itemKeyWrap, deleted: value === null, box }], trusted.directory.version);
  return { item: { vault: vault.id, item, version, rev, deleted: value === null, value, key }, serverRev: pushed.serverRev };
}

/** One item given to one machine: what it may do with it, and what it may show and how the value is used, as the person set them. */
export interface MachineGift {
  vault: OpenedAgentVault;
  item: AgentItem;
  uses: MachineUse[];
  approval: MachineApproval;
  /** Seconds an approved session lasts, for `session`; 15 minutes when left out. */
  session?: number;
  bounds?: Record<string, unknown>;
  expiresAt?: number | null;
  listing: MachineListing;
  delivery: MachineDelivery;
}

const SESSION_SECONDS = 15 * 60;

/**
 * Gives one machine these items, each as a new grant at the next revision:
 * a box from the authority to the machine's pinned point, signed, holding
 * the item's key only for a standing grant. A key the machine could newly
 * hold is first written into its pin, and only then is a box that carries
 * it made, so no refusal leaves a key with a machine that its pin does not
 * name. A grant that stops being standing leaves the machine with the key it
 * held: that version waits for a new key, as a withdrawal's does. A value an
 * agent may be shown always waits on the person.
 */
export async function giveMachineItems(
  api: Pick<VaultApi, 'putMachineGrants'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  machineId: string,
  gifts: MachineGift[],
  now = Date.now(),
): Promise<{ checkpoint: AgentCheckpoint; rekey: AgentItemVersion[] }> {
  ownerOf(trusted, passhold);
  const { accountId } = passhold;
  let pin = liveMachine(trusted, machineId, now);
  if (new Set(gifts.map((gift) => `${gift.vault.id}:${gift.item.item}`)).size !== gifts.length) throw new Error('Malformed machine grant.');
  for (const gift of gifts) {
    trustedVault(trusted, gift.vault);
    if (gift.item.deleted) throw new Error('Malformed machine grant.');
    await trustedItem(trusted, gift.item, gift.vault);
    if (waitsForKey(trusted, gift.item)) throw notReplaced();
    if (gift.uses.includes('reveal') && gift.approval === 'standing') throw new Error('An agent is shown a value only when the person allows it each time.');
  }
  const standing = gifts.filter((gift) => gift.approval === 'standing');
  if (standing.some((gift) => !keyExposed(pin, gift.item))) {
    let exposed = pin.exposed;
    for (const gift of standing) exposed = exposeKey(exposed, gift.item);
    pin = { ...pin, rev: pin.rev + 1, exposed };
    const first = await sealPins(trusted, passhold, new Map([[machineId, pin]]));
    await api.putMachineGrants(machineId, { changes: [], pin: first.boxes.get(machineId)!, directory: first.next });
    trusted = first.after;
  }
  let { lastGrant, grants } = pin;
  const changes: MachineGrantChange[] = [];
  const rekey: AgentItemVersion[] = [];
  for (const gift of gifts) {
    const { vault, item } = gift;
    lastGrant += 1;
    const grant: MachineGrant = {
      id: newId(),
      rev: lastGrant,
      uses: [...gift.uses],
      approval: gift.approval,
      session: gift.approval === 'session' ? (gift.session ?? SESSION_SECONDS) : null,
      bounds: gift.bounds ?? {},
      expiresAt: gift.expiresAt ?? null,
    };
    const place = { accountId, machineId, vaultId: vault.id, itemId: item.item, version: item.version };
    const box = await sealMachineItem(trusted.authority, pin.key, place, { grant, listing: gift.listing, delivery: gift.delivery, record: vault.key.write.publicKey, key: grant.approval === 'standing' ? item.key : null });
    if (grant.approval !== 'standing' && keyExposed(pin, item)) rekey.push({ vault: vault.id, item: item.item, version: item.version });
    grants = [...grants.filter((known) => !(known.vault === vault.id && known.item === item.item)), { ...grant, vault: vault.id, item: item.item }];
    changes.push({ vault: vault.id, item: item.item, version: item.version, box, withdrawal: null, grantId: grant.id, recordRev: item.rev });
  }
  const sealed = await sealPins(trusted, passhold, new Map([[machineId, { ...pin, rev: pin.rev + 1, grants, lastGrant }]]), (directory) => ({
    ...directory,
    rekey: [...directory.rekey, ...rekey],
  }));
  await api.putMachineGrants(machineId, { changes, pin: sealed.boxes.get(machineId)!, directory: sealed.next });
  return { checkpoint: sealed.checkpoint, rekey: sealed.directory.rekey };
}

/**
 * Takes items back from one machine: a withdrawal for each, signed at the
 * next revision, so the machine drops the item and refuses any older grant
 * of it. The server stops handing the item over at once. Each item whose
 * key the machine could hold is named in the directory as waiting for a new
 * key, which `finishMachineRekey` gives it; what the machine could read
 * stays in its pin.
 */
export async function withdrawMachineItems(
  api: Pick<VaultApi, 'putMachineGrants'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  machineId: string,
  items: { vault: string; item: string }[],
  now = Date.now(),
): Promise<{ checkpoint: AgentCheckpoint; rekey: AgentItemVersion[] }> {
  ownerOf(trusted, passhold);
  const { accountId } = passhold;
  const pin = liveMachine(trusted, machineId, now);
  if (new Set(items.map((entry) => `${entry.vault}:${entry.item}`)).size !== items.length) throw new Error('Malformed machine grant.');
  let { lastGrant, grants } = pin;
  const changes: MachineGrantChange[] = [];
  const rekey: AgentItemVersion[] = [];
  for (const { vault, item } of items) {
    if (!grants.some((grant) => grant.vault === vault && grant.item === item)) throw new Error('That machine was not given that item.');
    lastGrant += 1;
    const version = trustedVersion(trusted.directory, vault, item);
    changes.push({ vault, item, version, box: null, withdrawal: await signMachineWithdrawal(trusted.authority, accountId, machineId, vault, item, lastGrant), grantId: null, recordRev: null });
    grants = grants.filter((grant) => !(grant.vault === vault && grant.item === item));
    const entry = { vault, item, version };
    if (keyExposed(pin, entry) && !waitsForKey(trusted, entry)) rekey.push(entry);
  }
  const sealed = await sealPins(trusted, passhold, new Map([[machineId, { ...pin, rev: pin.rev + 1, grants, lastGrant }]]), (directory) => ({
    ...directory,
    rekey: [...directory.rekey, ...rekey],
  }));
  await api.putMachineGrants(machineId, { changes, pin: sealed.boxes.get(machineId)!, directory: sealed.next });
  return { checkpoint: sealed.checkpoint, rekey: sealed.directory.rekey };
}

/** What a machine may show of an item and how its value is used, worked out from the item as it now is, for a grant given again under a new key. */
export type DescribeAgentItem = (item: AgentItem) => { listing: MachineListing; delivery: MachineDelivery };

/** Roughly what one step of a rekey may carry, well under what the server takes in one request. */
const REKEY_BYTES = 1024 * 1024;

/**
 * The version an item's new key takes: past the one it replaces, and past
 * every version a pin says a machine could hold the key of, so no pin names
 * the new key. Once a server put back from a backup holds an item older
 * than versions machines were given, the next number may be one of those.
 */
function nextVersion(pins: Iterable<MachinePin>, entry: AgentItemVersion): number {
  let highest = entry.version;
  for (const pin of pins) {
    for (const exposure of pin.exposed) if (exposure.vault === entry.vault && exposure.item === entry.item && exposure.version > highest) highest = exposure.version;
  }
  if (highest >= MAX_VERSION) throw new Error('Malformed item version.');
  return highest + 1;
}

/** The highest version a server keeps of an item. */
const MAX_VERSION = 2_147_483_647;

/**
 * Gives every item the directory says waits for a new key one: a fresh key
 * at a later version (`nextVersion`), its record or deletion sealed again under it, each
 * live machine still granted the item a new grant of the new version (the
 * key in it only where the grant is standing), and each grant that has ended
 * taken back. The directory commits to each new key and lets the old
 * version go. Each step is all or none, against the versions read, and as
 * many steps are taken as fit what the server takes in one. An item the
 * server does not hand over stays waiting.
 */
export async function finishMachineRekey(
  api: Pick<VaultApi, 'agents' | 'agentVaults' | 'agentVaultPull' | 'rekeyAgentItems'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  describe: DescribeAgentItem,
  options: { now?: number; known?: KnownAgentRecord } = {},
): Promise<{ checkpoint: AgentCheckpoint; replaced: AgentItemVersion[] }> {
  ownerOf(trusted, passhold);
  const now = options.now ?? Date.now();
  const replacedAll: AgentItemVersion[] = [];
  while (pendingRekey(trusted, now).length > 0) {
    const waiting = pendingRekey(trusted, now).length;
    const step = await rekeyStep(api, trusted, passhold, describe, now, options.known);
    replacedAll.push(...step.replaced);
    trusted = await openAgents(api, passhold, step.checkpoint);
    // Each step moves on, or the server is not handing over what the directory names.
    if (pendingRekey(trusted, now).length >= waiting) throw stale();
  }
  return { checkpoint: trusted.checkpoint, replaced: replacedAll };
}

async function rekeyStep(
  api: Pick<VaultApi, 'agentVaults' | 'agentVaultPull' | 'rekeyAgentItems'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  describe: DescribeAgentItem,
  now: number,
  known: KnownAgentRecord | undefined,
): Promise<{ checkpoint: AgentCheckpoint; replaced: AgentItemVersion[] }> {
  const { accountId } = passhold;
  const pending = pendingRekey(trusted, now);
  const vaults = new Map((await openAgentVaults(api, trusted, passhold)).map((vault) => [vault.id, vault]));
  const current = new Map<string, AgentItem>();
  for (const vaultId of new Set(pending.map((entry) => entry.vault))) {
    const vault = vaults.get(vaultId);
    if (!vault) throw stale();
    for (const item of (await syncAgentVault(api, trusted, passhold, vault, { known })).items) current.set(`${vaultId}:${item.item}`, item);
  }
  const records: AgentRekeyRecord[] = [];
  const replaced: AgentReplacedItem[] = [];
  const done = new Set<string>();
  const pins = new Map<string, MachinePin>();
  const changes = new Map<string, MachineGrantChange[]>();
  let bytes = 0;
  for (const entry of pending) {
    const item = current.get(`${entry.vault}:${entry.item}`);
    // The server holds every item a directory names: one it does not hand over stays waiting.
    if (!item || item.version < entry.version) throw stale();
    if (item.version > entry.version) {
      done.add(versionOf(entry));
      continue;
    }
    const size = JSON.stringify(item.value ?? null).length * 2 + 4096;
    if (records.length > 0 && bytes + size > REKEY_BYTES) break;
    bytes += size;
    done.add(versionOf(entry));
    const vault = vaults.get(entry.vault)!;
    const version = nextVersion(trusted.pins.values(), entry);
    const rev = item.rev + 1;
    const key = await newAgentItemKey();
    const place: AgentRecordPlace = { accountId, vaultId: vault.id, itemId: item.item, version, rev };
    // A deletion is replaced too: an item brought back is brought back under the new key.
    records.push({
      vault: vault.id,
      item: item.item,
      from: item.version,
      version,
      rev,
      keyGeneration: vault.generation,
      itemKeyWrap: await sealAgentItemKey(key, vault.key.key, accountId, vault.id, vault.generation, item.item, version),
      deleted: item.deleted,
      box: item.deleted ? await sealAgentTombstone(key, vault.key.write, place) : await sealAgentRecord(key, vault.key.write, item.value, place),
    });
    const next = { vault: vault.id, item: item.item, version };
    replaced.push({ ...next, check: await agentItemKeyCheck(accountId, next, key) });
    for (const [machineId, pinned] of trusted.pins) {
      const listed = trusted.directory.machines.find((machine) => machine.id === machineId);
      const pin = pins.get(machineId) ?? pinned;
      const grant = pin.grants.find((held) => held.vault === vault.id && held.item === item.item);
      // A machine that has ended, by the directory, its expiry or the server's word, is given nothing new.
      if (!listed || !grant || hasEnded(trusted, machineId, now)) continue;
      const rev = pin.lastGrant + 1;
      let change: MachineGrantChange;
      let held: MachinePin;
      if (grant.expiresAt !== null && grant.expiresAt <= now) {
        // A grant that has ended is taken back, not given the new key.
        change = { ...next, box: null, withdrawal: await signMachineWithdrawal(trusted.authority, accountId, machineId, vault.id, item.item, rev), grantId: null, recordRev: null };
        held = { ...pin, grants: pin.grants.filter((other) => other !== grant), lastGrant: rev };
      } else {
        const renewed: MachineGrant = { ...grantOf(grant), id: newId(), rev };
        const standing = renewed.approval === 'standing';
        const { listing, delivery } = describe({ ...item, version, rev: item.rev + 1, key });
        const box = await sealMachineItem(trusted.authority, pin.key, { accountId, machineId, vaultId: vault.id, itemId: item.item, version }, { grant: renewed, listing, delivery, record: vault.key.write.publicKey, key: standing ? key : null });
        change = { ...next, box, withdrawal: null, grantId: renewed.id, recordRev: item.rev + 1 };
        held = {
          ...pin,
          grants: pin.grants.map((other) => (other === grant ? { ...renewed, vault: vault.id, item: item.item } : other)),
          lastGrant: rev,
          exposed: standing ? exposeKey(pin.exposed, next) : pin.exposed,
        };
      }
      pins.set(machineId, held);
      changes.set(machineId, [...(changes.get(machineId) ?? []), change]);
    }
  }
  const bumped = new Map([...pins].map(([machineId, pin]) => [machineId, { ...pin, rev: trusted.pins.get(machineId)!.rev + 1 }]));
  const sealed = await sealPins(trusted, passhold, bumped, (directory) => ({
    ...directory,
    rekey: directory.rekey.filter((entry) => !done.has(versionOf(entry))),
    replaced: [...directory.replaced.filter((earlier) => !replaced.some((made) => made.vault === earlier.vault && made.item === earlier.item)), ...replaced],
  }));
  await api.rekeyAgentItems({
    records,
    machines: [...changes].map(([machineId, list]) => ({ id: machineId, changes: list, pin: sealed.boxes.get(machineId)! })),
    directory: sealed.next,
  });
  return { checkpoint: sealed.checkpoint, replaced: replaced.map(({ vault, item, version }) => ({ vault, item, version })) };
}

// ---------------------------------------------------------------------------
// What a machine pulls

/** What a machine remembers of one item: the highest grant and withdrawal revisions seen, the grant's id, and the highest record and its digest. */
export interface MachineItemMark {
  grant: number;
  grantId: string | null;
  withdrawn: number;
  version: number;
  rev: number;
  record: string | null;
}

/** What a machine's runtime remembers between pulls, beside its sealed cache: plain values, so it keeps them as it likes. */
export interface MachineMarks {
  /** The machine's revision this runtime has pulled up to. */
  rev: number;
  epoch: string | null;
  /** By `vault:item`. */
  items: Record<string, MachineItemMark>;
}

/** A machine as its runtime holds it: its credential, its key, and the authority it pinned. */
export interface MachineIdentity {
  credentials: MachineCredential;
  key: MemberKey;
  pinned: PinnedAuthority;
}

/**
 * One item a machine holds, as its box opened: the grant, what it may show,
 * how its value is used, and its record. The runtime checks the grant's
 * expiry again before each use, as a cache it keeps outlives this pull.
 */
export interface MachineGivenItem<T = unknown> {
  vault: string;
  item: string;
  version: number;
  grant: MachineGrant;
  listing: MachineListing;
  delivery: MachineDelivery;
  /** The item version's key, for a standing grant alone. */
  key: CryptoKey | null;
  /** The write key its records are checked with. */
  verify: CryptoKey;
  /** The item's record at that version, its signature checked; its value read only with the key. */
  record: { rev: number; deleted: boolean; box: AgentSignedBox; value: T | null } | null;
}

/** What a pull changed: items given or given again, and items taken back or whose grant has ended. */
export interface MachinePullResult<T = unknown> {
  marks: MachineMarks;
  given: MachineGivenItem<T>[];
  withdrawn: { vault: string; item: string }[];
}

const older = () => new DecryptionError('The server sent something older than this machine has seen.');

async function boxDigest(box: AgentSignedBox): Promise<string> {
  return toBase64(new Uint8Array(await crypto.subtle.digest('SHA-256', utf8(`${box.iv}.${box.ct}.${box.sig}`) as BufferSource)));
}

/**
 * The machine's side: pulls what it was given or had taken back since its
 * marks, every page. Each box must be from the authority it pinned, for its
 * own point and place, and each withdrawal signed by it; each record signed
 * by the write key its box names. A grant at or below a revision it saw
 * withdrawn, older than one it holds or another at the same revision, a
 * withdrawal no newer than the grant it would take back, an older record or
 * another at the same revision, or pages that do not move on, fail as a
 * `DecryptionError`, and nothing of the pull is taken. A grant that has
 * ended opens nothing, and is reported as taken back. With no marks, as a
 * run with no cache, there is nothing to compare with.
 */
export async function pullMachine<T = unknown>(client: Pick<MachineClient, 'pull'>, machine: MachineIdentity, marks: MachineMarks | null, now = Date.now()): Promise<MachinePullResult<T>> {
  const { accountId, machineId } = machine.credentials;
  const next: MachineMarks = {
    rev: marks?.rev ?? 0,
    epoch: marks?.epoch ?? null,
    items: Object.fromEntries(Object.entries(marks?.items ?? {}).map(([at, mark]) => [at, { ...mark }])),
  };
  const given = new Map<string, MachineGivenItem<T>>();
  const withdrawn = new Map<string, { vault: string; item: string }>();

  const take = async (change: MachinePulledItem) => {
    const at = `${change.vault}:${change.item}`;
    const mark: MachineItemMark = next.items[at] ?? { grant: 0, grantId: null, withdrawn: 0, version: 0, rev: -1, record: null };
    if (change.withdrawal) {
      if (change.box !== null || change.withdrawal.vault !== change.vault || change.withdrawal.item !== change.item) throw new DecryptionError('That was not signed by this account’s Passhold.');
      await checkMachineWithdrawal(machine.pinned, accountId, machineId, change.withdrawal);
      const rev = change.withdrawal.rev;
      if (rev <= mark.grant || rev < mark.withdrawn) throw older();
      next.items[at] = { ...mark, withdrawn: rev };
      given.delete(at);
      withdrawn.set(at, { vault: change.vault, item: change.item });
      return;
    }
    if (!change.box) throw new DecryptionError('Malformed machine grant.');
    const opened = await openMachineItem(machine.key, machine.pinned, change.box, { accountId, machineId, vaultId: change.vault, itemId: change.item, version: change.version });
    const rev = opened.grant.rev;
    if (rev <= mark.withdrawn || rev < mark.grant || change.version < mark.version) throw older();
    // Two grants at one revision are two devices' that raced; the one this machine took first stays.
    if (rev === mark.grant && (change.version !== mark.version || opened.grant.id !== mark.grantId)) throw older();
    const sameVersion = change.version === mark.version;
    let record: MachineGivenItem<T>['record'] = null;
    let recordMark = { rev: sameVersion ? mark.rev : -1, record: sameVersion ? mark.record : null };
    if (change.record) {
      const { rev: at, deleted, box } = change.record;
      if (typeof deleted !== 'boolean' || (sameVersion && at < mark.rev)) throw older();
      const place: AgentRecordPlace = { accountId, vaultId: change.vault, itemId: change.item, version: change.version, rev: at };
      await checkAgentRecord(opened.verify, box, place, deleted);
      const digest = await boxDigest(box);
      if (sameVersion && at === mark.rev && mark.record !== null && digest !== mark.record) throw older();
      const ended = opened.grant.expiresAt !== null && opened.grant.expiresAt <= now;
      let value: T | null = null;
      if (opened.key && !ended && deleted) await openAgentTombstone(opened.key, opened.verify, box, place);
      else if (opened.key && !ended) value = await openAgentRecord<T>(opened.key, opened.verify, box, place);
      record = { rev: at, deleted, box, value };
      recordMark = { rev: at, record: digest };
    }
    next.items[at] = { grant: rev, grantId: opened.grant.id, withdrawn: mark.withdrawn, version: change.version, ...recordMark };
    if (opened.grant.expiresAt !== null && opened.grant.expiresAt <= now) {
      given.delete(at);
      withdrawn.set(at, { vault: change.vault, item: change.item });
      return;
    }
    withdrawn.delete(at);
    given.set(at, { vault: change.vault, item: change.item, version: change.version, grant: opened.grant, listing: opened.listing, delivery: opened.delivery, key: opened.key, verify: opened.verify, record });
  };

  let since = next.rev;
  let after: { vault: string; item: string } | null = null;
  let reset = false;
  const seen = new Set<string>();
  const restart = (epoch: string) => {
    if (reset) throw stuck();
    reset = true;
    next.epoch = epoch;
    since = 0;
    after = null;
    seen.clear();
    given.clear();
    withdrawn.clear();
  };
  for (let pages = 0; ; pages++) {
    if (pages >= MAX_PAGES) throw stuck();
    const page = await endsAsks(machine, () => client.pull(machine.credentials, since, after));
    if (!Number.isSafeInteger(page.rev) || page.rev < 0) throw stuck();
    // A restored server starts this machine's changes again from nothing; what it holds is still compared with what it saw. Nothing asked before is answered after.
    if (next.epoch !== null && page.epoch !== next.epoch) {
      forgetMachineAsks(machine);
      restart(page.epoch);
      continue;
    }
    next.epoch = page.epoch;
    // A machine's revision never goes back on one server: one behind this machine's is a server that lost something.
    if (!page.hasMore && page.changes.length === 0 && page.rev < since) {
      restart(page.epoch);
      continue;
    }
    for (const change of page.changes) await take(change);
    if (!page.hasMore) {
      if (page.after !== null) throw stuck();
      since = Math.max(since, page.rev);
      break;
    }
    const cursor = page.after ? `${page.rev}:${page.after.vault}:${page.after.item}` : '';
    if (!page.after || page.rev < since || seen.has(cursor)) throw stuck();
    seen.add(cursor);
    since = page.rev;
    after = { vault: page.after.vault, item: page.after.item };
  }
  next.rev = since;
  return { marks: next, given: [...given.values()], withdrawn: [...withdrawn.values()] };
}

/** Opens a given item's record with its key, once a release handed the key over. One under another key, or for another place, fails as a `DecryptionError`. */
export async function openGivenRecord<T = unknown>(accountId: string, given: MachineGivenItem, key: CryptoKey): Promise<T | null> {
  if (!given.record) return null;
  const place: AgentRecordPlace = { accountId, vaultId: given.vault, itemId: given.item, version: given.version, rev: given.record.rev };
  if (given.record.deleted) {
    await openAgentTombstone(key, given.verify, given.record.box, place);
    return null;
  }
  return openAgentRecord<T>(key, given.verify, given.record.box, place);
}

// ---------------------------------------------------------------------------
// Asking the person, answering, and the log

type RequestApi = Pick<HttpSyncAdapter, 'machineRequests' | 'decideMachineRequest' | 'putMachineGrants' | 'resumeMachine' | 'agentLog' | 'agentAudit'>;

const gone = () => new Error('This request expired or was already answered.');
const unanswerable = () => new Error('Malformed machine answer.');
/** How old a request may be when it is answered, as the answer itself is held to. */
const REQUEST_FRESH_MS = 2 * 60 * 1000;
/** How long what is released waits for the machine to take it, unless the device says otherwise, and the longest it may. */
const RELEASE_DEADLINE_MS = 5 * 60 * 1000;
const MAX_RELEASE_MS = 10 * 60 * 1000;
const CLOCK_SKEW_MS = 2 * 60 * 1000;
/** How long after a request was made its machine still takes an answer to it: the person's two minutes, then the release's ten. */
const ANSWER_WINDOW_MS = REQUEST_FRESH_MS + MAX_RELEASE_MS + CLOCK_SKEW_MS;

/**
 * Each outstanding request's own key, by its place, in this process alone.
 * An answer is taken by removing the entry, so of every copy of a
 * `MachineAsk` one takes it, and a restart leaves nothing to take it with.
 */
const requestKeys = new Map<string, { key: MemberKey | null; at: number }>();
const placeOf = (place: { accountId: string; machineId: string; requestId: string }) => `${place.accountId}:${place.machineId}:${place.requestId}`;

/** A request this machine made, as its runtime keeps it until it is answered. Its own key is held apart, in this process alone. */
export interface MachineAsk {
  outstanding: OutstandingRequest;
  /** The item and grant it asks under, as this machine's box opened; null for an ask for access. */
  given: MachineGivenItem | null;
}

/** What a use asks for: the one field a release for one use carries, the operation exactly as Passhold will perform it, and the agent's reason. */
export interface MachineUseAsk {
  field: string;
  operation: MachineOperation;
  reason: string;
}

async function prepareAsk(machine: MachineIdentity, request: MachineRequest, given: MachineGivenItem | null, key: MemberKey | null): Promise<MachineAsk> {
  const { accountId, machineId } = machine.credentials;
  const sealed = await sealMachineRequest(machine.key, machine.pinned, { accountId, machineId, requestId: newId() }, request);
  for (const [at, held] of requestKeys) if (request.at - held.at > ANSWER_WINDOW_MS) requestKeys.delete(at);
  requestKeys.set(placeOf(sealed.place), { key, at: request.at });
  return { outstanding: sealed, given };
}

/**
 * The machine's side: a request to use one item it was given, for one
 * operation, under the grant its box holds, sealed with a fresh key of its
 * own so whatever is released opens for this request alone. Made before it
 * is sent, so a send whose response was lost is sent again as it was.
 */
export async function prepareMachineUse(machine: MachineIdentity, given: MachineGivenItem, ask: MachineUseAsk, now = Date.now()): Promise<MachineAsk> {
  if ((given.grant.expiresAt !== null && given.grant.expiresAt <= now) || !given.grant.uses.includes(ask.operation.use)) throw new Error('Malformed machine request.');
  const key = await newRequestKey();
  const { vault, item, version, grant } = given;
  return prepareAsk(machine, { kind: 'use', at: now, key: key.publicKey, vault, item, version, grant: grant.rev, grantId: grant.id, field: ask.field, operation: ask.operation, reason: ask.reason }, given, key);
}

/** The machine's side: an ask for something it was not given. The person may answer with a grant, never with a value. */
export async function prepareMachineAccess(machine: MachineIdentity, what: string, reason: string, now = Date.now()): Promise<MachineAsk> {
  return prepareAsk(machine, { kind: 'access', at: now, what, reason }, null, null);
}

/** Sends a request, or sends it again after a response that was lost: the server answers it as it stands. */
export async function sendMachineAsk(client: Pick<MachineClient, 'submitRequest'>, machine: MachineIdentity, ask: MachineAsk): Promise<MachineRequestState> {
  if (!requestKeys.has(placeOf(ask.outstanding.place))) throw gone();
  const state = await endsAsks(machine, () => client.submitRequest(machine.credentials, { id: ask.outstanding.place.requestId, box: ask.outstanding.box }));
  if (state.id !== ask.outstanding.place.requestId) throw gone();
  return state;
}

export async function requestMachineUse(client: Pick<MachineClient, 'submitRequest'>, machine: MachineIdentity, given: MachineGivenItem, ask: MachineUseAsk, now = Date.now()): Promise<MachineAsk> {
  const prepared = await prepareMachineUse(machine, given, ask, now);
  await sendMachineAsk(client, machine, prepared);
  return prepared;
}

export async function requestMachineAccess(client: Pick<MachineClient, 'submitRequest'>, machine: MachineIdentity, what: string, reason: string, now = Date.now()): Promise<MachineAsk> {
  const prepared = await prepareMachineAccess(machine, what, reason, now);
  await sendMachineAsk(client, machine, prepared);
  return prepared;
}

/** A machine's call, after which a refusal that it was paused, removed, replaced, restored or expired lets every request of the machine go. */
async function endsAsks<T>(machine: MachineIdentity, call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (error instanceof SyncHttpError && (error.status === 401 || error.status === 403)) forgetMachineAsks(machine);
    throw error;
  }
}

/** Lets every request of this machine go: it was paused or removed, or its runtime stops. */
export function forgetMachineAsks(machine: MachineIdentity): void {
  const prefix = `${machine.credentials.accountId}:${machine.credentials.machineId}:`;
  for (const at of [...requestKeys.keys()]) if (at.startsWith(prefix)) requestKeys.delete(at);
}

/** A request as its machine finds it: still waiting, or answered and taken. */
export type MachineRelease = { status: 'pending'; expiresAt: number } | ({ status: 'answered' } & OpenedMachineAnswer);

/**
 * The machine's side: reads its request, and once it is answered takes the
 * answer, once. The request's own key goes in the same step, before the
 * answer is opened, so a second taking, from any copy of the request or
 * after a restart, opens nothing. A request left waiting past the person's
 * two minutes, an answer read after it could still be taken, a machine past
 * its end, or, given the machine's latest marks, an item whose grant changed
 * or was taken back since, ends the request. A pause or a removal lets every
 * request of the machine go. The answer itself must be the authority's, for
 * this request, operation, item and grant, and release no more than the
 * grant allows (`openMachineAnswer`).
 */
export async function consumeMachineRelease(
  client: Pick<MachineClient, 'requestState'>,
  machine: MachineIdentity,
  ask: MachineAsk,
  context: { machineExpiresAt: number; now?: number; marks?: MachineMarks | null },
): Promise<MachineRelease> {
  const at = placeOf(ask.outstanding.place);
  const requestId = ask.outstanding.place.requestId;
  const now = context.now ?? Date.now();
  const madeAt = ask.outstanding.request.at;
  if (!requestKeys.has(at)) throw gone();
  if (context.machineExpiresAt <= now || now - madeAt > ANSWER_WINDOW_MS) {
    requestKeys.delete(at);
    throw gone();
  }
  let state: MachineRequestState;
  try {
    state = await client.requestState(machine.credentials, requestId);
  } catch (error) {
    if (error instanceof SyncHttpError && (error.status === 401 || error.status === 403)) forgetMachineAsks(machine);
    if (error instanceof SyncHttpError && error.status === 404) requestKeys.delete(at);
    throw error;
  }
  if (state.id !== requestId) throw unanswerable();
  if (state.status === 'pending') {
    if (state.answer !== null) throw unanswerable();
    if (now - madeAt > REQUEST_FRESH_MS + CLOCK_SKEW_MS) {
      requestKeys.delete(at);
      throw gone();
    }
    return { status: 'pending', expiresAt: state.expiresAt };
  }
  // Claimed before anything else is awaited: of two callers that both read the answer, one takes it.
  const held = requestKeys.get(at);
  if (!held || state.answer === null) throw gone();
  requestKeys.delete(at);
  if (ask.given && context.marks) {
    const mark = context.marks.items[`${ask.given.vault}:${ask.given.item}`];
    if (!mark || mark.grant !== ask.given.grant.rev || mark.grantId !== ask.given.grant.id || mark.withdrawn >= mark.grant || mark.version !== ask.given.version) throw gone();
  }
  const opened = await openMachineAnswer(held.key ?? (await newRequestKey()), machine.pinned, ask.outstanding, state.answer, {
    grant: ask.given?.grant ?? null,
    machineExpiresAt: context.machineExpiresAt,
    now,
  });
  // Grants go item by item: an answer naming a whole vault names nothing this machine was given.
  if (opened.outcome === 'allow' && opened.release === 'grant' && opened.grant.item === null) throw unanswerable();
  return { status: 'answered', ...opened };
}

/** One request waiting for the person, opened on this device from what it trusts. */
export interface ReviewedMachineRequest {
  machineId: string;
  /** The machine's name, from this device's pin, never from the server. */
  machineName: string;
  request: OpenedMachineRequest;
  /** For a use, the grant it names as this device pinned it; null when the machine holds no such grant now, or for an ask for access. */
  grant: MachinePinGrant | null;
  expiresAt: number;
  /** Whether it is recent enough to be answered: an older request is refused. */
  fresh: boolean;
}

/**
 * Every request waiting for the person, each opened with the authority as
 * from the point this device pinned for its machine. One for a machine the
 * directory does not name as live, or that does not open as from it, is
 * left out and counted: it is the server's, or nobody's.
 */
export async function reviewMachineRequests(
  api: Pick<RequestApi, 'machineRequests'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  now = Date.now(),
): Promise<{ requests: ReviewedMachineRequest[]; unreadable: number }> {
  ownerOf(trusted, passhold);
  const { accountId } = trusted;
  const requests: ReviewedMachineRequest[] = [];
  const seen = new Set<string>();
  let unreadable = 0;
  let after: { machine: string; request: string } | null = null;
  for (let pages = 0; ; pages++) {
    if (pages >= MAX_PAGES) throw stuck();
    const page = await api.machineRequests(after);
    for (const view of page.requests) {
      const at = `${view.machineId}:${view.id}`;
      if (seen.has(at)) throw stuck();
      seen.add(at);
      const entry = trusted.directory.machines.find((machine) => machine.id === view.machineId);
      const pin = trusted.pins.get(view.machineId);
      if (!entry || entry.removed || !pin || pin.removedAt !== null || pin.expiresAt <= now) {
        unreadable += 1;
        continue;
      }
      let request: OpenedMachineRequest;
      try {
        request = await openMachineRequest(trusted.authority.box, pin.key, view.box, { accountId, machineId: view.machineId, requestId: view.id });
      } catch {
        unreadable += 1;
        continue;
      }
      const asked = request.request;
      const grant = asked.kind === 'use' ? (pin.grants.find((held) => held.vault === asked.vault && held.item === asked.item && held.id === asked.grantId && held.rev === asked.grant) ?? null) : null;
      requests.push({ machineId: view.machineId, machineName: pin.name, request, grant, expiresAt: view.expiresAt, fresh: Math.abs(now - asked.at) <= REQUEST_FRESH_MS });
    }
    if (!page.next) break;
    // The next page starts after the last request of this one, or the pages do not follow each other.
    const last = page.requests[page.requests.length - 1];
    if (!last || page.next.machine !== last.machineId || page.next.request !== last.id) throw stuck();
    after = page.next;
  }
  return { requests, unreadable };
}

/** The machine a reviewed request came from, live in what this device trusts, and the request as its box says, opened again here. */
async function askingMachine(trusted: TrustedAgents, reviewed: ReviewedMachineRequest, now: number): Promise<{ pin: MachinePin; opened: OpenedMachineRequest }> {
  const pin = liveMachine(trusted, reviewed.machineId, now);
  const place = { accountId: reviewed.request.place.accountId, machineId: reviewed.request.place.machineId, requestId: reviewed.request.place.requestId };
  if (pin.key !== reviewed.request.machineKey || place.accountId !== trusted.accountId || place.machineId !== reviewed.machineId) throw stale();
  const opened = await openMachineRequest(trusted.authority.box, pin.key, reviewed.request.box, place);
  // Nothing is signed for a request older than the person had to answer it, or dated ahead.
  if (Math.abs(now - opened.request.at) > REQUEST_FRESH_MS) throw gone();
  return { pin, opened };
}

/** The SHA-256 of a value, as a pin keeps what a machine could have read. */
async function valueDigest(value: string): Promise<string> {
  return toBase64(new Uint8Array(await crypto.subtle.digest('SHA-256', utf8(value) as BufferSource)));
}

/** The exposure list with one field of this version marked as read, at the value it had then. */
function exposeField(exposed: MachineExposure[], entry: AgentItemVersion, name: string, value: string): MachineExposure[] {
  const at = exposed.findIndex((known) => versionOf(known) === versionOf(entry));
  if (at < 0) return [...exposed, { vault: entry.vault, item: entry.item, version: entry.version, key: false, fields: [{ name, value }] }];
  return exposed.map((known, index) => (index === at ? { ...known, fields: [...known.fields.filter((field) => field.name !== name), { name, value }] } : known));
}

/** How a device answers a request for one use: one field's value, once, or the item version's key for a while. */
export type MachineUseChoice = { kind: 'once'; value: string } | { kind: 'session'; item: AgentItem; until?: number };

/** Where a deciding device keeps what it did: its own id, which its record is kept under, and how it holds on to the checkpoint an approval moves it to. */
export interface MachineDeciding {
  deviceId: string;
  /** Called with the checkpoint that records what the machine can read, once the server has it and before anything is released: kept, so no older view is taken after. */
  remember: (checkpoint: AgentCheckpoint) => void | Promise<void>;
}

/**
 * Allows one use the person was shown, as its box says, not as the object
 * handed in says. What the machine will be able to read goes into its pin
 * first, a field's value by its digest or the key, and the checkpoint that
 * holds it is handed to `remember`; only then is the answer sealed to the
 * request's own key and signed, within the grant this device pinned, and
 * sent with this device's own record of it.
 */
export async function approveMachineUse(
  api: Pick<RequestApi, 'decideMachineRequest' | 'putMachineGrants'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  reviewed: ReviewedMachineRequest,
  choice: MachineUseChoice,
  deciding: MachineDeciding,
  options: { now?: number; deadline?: number } = {},
): Promise<{ checkpoint: AgentCheckpoint; status: 'live' | 'paused'; record: MachineDecisionRecord }> {
  ownerOf(trusted, passhold);
  // Read once, before anything waits: what is recorded is what is released.
  const chosen: MachineUseChoice = choice.kind === 'once' ? { kind: 'once', value: choice.value } : { kind: 'session', item: { ...choice.item }, until: choice.until };
  if (chosen.kind === 'once' && typeof chosen.value !== 'string') throw unanswerable();
  const now = options.now ?? Date.now();
  const asking = await askingMachine(trusted, reviewed, now);
  let pin = asking.pin;
  const { opened } = asking;
  const use = opened.request.kind === 'use' ? opened.request : null;
  if (!use) throw unanswerable();
  const held = pin.grants.find((grant) => grant.vault === use.vault && grant.item === use.item);
  if (!held || held.id !== use.grantId || held.rev !== use.grant) throw unanswerable();
  const entry: AgentItemVersion = { vault: use.vault, item: use.item, version: use.version };
  if (waitsForKey(trusted, entry)) throw notReplaced();
  if (use.version !== trustedVersion(trusted.directory, use.vault, use.item)) throw unanswerable();
  if (chosen.kind === 'session') {
    if (chosen.item.vault !== use.vault || chosen.item.item !== use.item || chosen.item.version !== use.version) throw unanswerable();
    await checkAgentItemKey(trusted.directory, trusted.accountId, entry, chosen.item.key);
  }
  const ends = Math.min(pin.expiresAt, held.expiresAt ?? Number.MAX_SAFE_INTEGER);
  const exposed = chosen.kind === 'session' ? exposeKey(pin.exposed, entry) : exposeField(pin.exposed, entry, use.field, await valueDigest(chosen.value));
  if (JSON.stringify(exposed) !== JSON.stringify(pin.exposed)) {
    pin = { ...pin, rev: pin.rev + 1, exposed };
    const first = await sealPins(trusted, passhold, new Map([[reviewed.machineId, pin]]));
    await api.putMachineGrants(reviewed.machineId, { changes: [], pin: first.boxes.get(reviewed.machineId)!, directory: first.next });
    trusted = first.after;
    await deciding.remember(trusted.checkpoint);
  }
  const release =
    chosen.kind === 'once'
      ? { kind: 'once' as const, value: chosen.value }
      : { kind: 'session' as const, key: chosen.item.key, until: chosen.until ?? Math.min(now + (held.session ?? 0) * 1000, ends) };
  const deadline = options.deadline ?? Math.min(now + RELEASE_DEADLINE_MS, ends);
  const sealed = await sealMachineAnswer(
    trusted.authority,
    pin.key,
    opened.place,
    opened.box,
    { allow: true, release, deadline },
    { grant: grantOf(held), machineExpiresAt: pin.expiresAt, now },
    { productKey: passhold.key, deviceId: deciding.deviceId },
  );
  const decided = await api.decideMachineRequest(opened.place.requestId, { machineId: reviewed.machineId, answer: sealed.answer, record: sealed.kept });
  return { checkpoint: trusted.checkpoint, status: decided.status, record: sealed.record };
}

/**
 * Answers an ask for access with the grant this device has made beside it,
 * as its pin now names it: the machine learns it was given the item, and
 * takes the grant itself from its next pull.
 */
export async function approveMachineAccess(
  api: Pick<RequestApi, 'decideMachineRequest'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  reviewed: ReviewedMachineRequest,
  given: { vault: string; item: string },
  deviceId: string,
  now = Date.now(),
): Promise<{ status: 'live' | 'paused'; record: MachineDecisionRecord }> {
  ownerOf(trusted, passhold);
  const { pin, opened } = await askingMachine(trusted, reviewed, now);
  if (opened.request.kind !== 'access') throw unanswerable();
  const grant = pin.grants.find((held) => held.vault === given.vault && held.item === given.item);
  if (!grant) throw new Error('That machine was not given that item.');
  const sealed = await sealMachineAnswer(
    trusted.authority,
    pin.key,
    opened.place,
    opened.box,
    { allow: true, grant: { vault: grant.vault, item: grant.item, id: grant.id, rev: grant.rev } },
    { grant: null, machineExpiresAt: pin.expiresAt, now },
    { productKey: passhold.key, deviceId },
  );
  const decided = await api.decideMachineRequest(opened.place.requestId, { machineId: reviewed.machineId, answer: sealed.answer, record: sealed.kept });
  return { status: decided.status, record: sealed.record };
}

/** Denies a request, a use or an ask for access, while it is recent enough to answer. Three in a row pause the machine until the person resumes it. */
export async function denyMachineUse(
  api: Pick<RequestApi, 'decideMachineRequest'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  reviewed: ReviewedMachineRequest,
  deviceId: string,
  now = Date.now(),
): Promise<{ status: 'live' | 'paused'; record: MachineDecisionRecord }> {
  ownerOf(trusted, passhold);
  const { pin, opened } = await askingMachine(trusted, reviewed, now);
  const sealed = await sealMachineAnswer(
    trusted.authority,
    pin.key,
    opened.place,
    opened.box,
    { allow: false },
    { grant: null, machineExpiresAt: pin.expiresAt, now },
    { productKey: passhold.key, deviceId },
  );
  const decided = await api.decideMachineRequest(opened.place.requestId, { machineId: reviewed.machineId, answer: sealed.answer, record: sealed.kept });
  return { status: decided.status, record: sealed.record };
}

/** Lets a paused machine ask again, with fresh proof that the person is there. */
export async function resumeMachine(api: Pick<RequestApi, 'resumeMachine'>, trusted: TrustedAgents, machineId: string, proof: OwnerProofFields, now = Date.now()): Promise<void> {
  liveMachine(trusted, machineId, now);
  await api.resumeMachine(machineId, proof);
}

/** One sealed entry a machine handed the person, opened and authenticated against its pinned key. */
export interface OpenedMachineInboxEntry {
  id: string;
  machineId: string;
  machineName: string;
  body: Record<string, unknown>;
  createdAt: number;
  expiresAt: number;
}

/** Pending inbox entries opened for review, beside the count of entries that did not open. */
export interface MachineInboxRead {
  entries: OpenedMachineInboxEntry[];
  unreadable: number;
}

/**
 * The machine's side: seals an entry to the authority and hands it to the
 * server for the person to review and accept into an agent vault. Never
 * discloses the entry to the server; an identical retry with the same `id`
 * is answered as it was.
 */
export async function sendMachineInboxEntry(
  client: Pick<MachineClient, 'submitInbox'>,
  machine: MachineIdentity,
  body: Record<string, unknown>,
  options: { id?: string } = {},
): Promise<MachineInboxReceipt> {
  const { accountId, machineId } = machine.credentials;
  const entryId = options.id ?? newId();
  const box = await sealMachineInboxEntry(machine.key, machine.pinned, accountId, machineId, entryId, body);
  const receipt = await endsAsks(machine, () => client.submitInbox(machine.credentials, { id: entryId, box }));
  if (receipt.id !== entryId) throw new DecryptionError('The server returned an inbox receipt for another entry.');
  return receipt;
}

/**
 * Reads pending inbox entries from the account's machines. Each entry must
 * open with the authority (or a retired key it carries) as from the point
 * this device pinned for the machine it is filed under, bound to its own id.
 */
export async function readMachineInbox(
  api: Pick<HttpSyncAdapter, 'agentInbox'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
): Promise<MachineInboxRead> {
  ownerOf(trusted, passhold, false);
  const { accountId } = trusted;
  const keys = [trusted.authority.box, ...trusted.authority.retired];
  const page = await api.agentInbox();
  const entries: OpenedMachineInboxEntry[] = [];
  const seen = new Set<string>();
  let unreadable = 0;
  for (const view of page.entries) {
    const at = `${view.machineId}:${view.id}`;
    const pin = trusted.pins.get(view.machineId);
    const machine = trusted.directory.machines.find((entry) => entry.id === view.machineId);
    if (!pin || !machine || machine.removed || seen.has(at)) {
      unreadable += 1;
      continue;
    }
    let body: Record<string, unknown> | null = null;
    for (const key of keys) {
      try {
        body = await openMachineInboxEntry(key, pin.key, view.box, accountId, view.machineId, view.id);
        break;
      } catch {
        // Sealed to another of the authority's keys, or not the machine's at all.
      }
    }
    if (!body) {
      unreadable += 1;
      continue;
    }
    seen.add(at);
    entries.push({ id: view.id, machineId: view.machineId, machineName: pin.name, body, createdAt: view.createdAt, expiresAt: view.expiresAt });
  }
  return { entries, unreadable };
}

/** Removes one inbox entry once the person has accepted or dismissed it. */
export async function dismissMachineInboxEntry(api: Pick<HttpSyncAdapter, 'deleteAgentInbox'>, machineId: string, entryId: string): Promise<void> {
  await api.deleteAgentInbox(machineId, entryId);
}

/**
 * The machine's side: seals entries of its log, each at its place in its
 * run, as one batch. The runtime keeps the batch as sealed until it is
 * acknowledged, and sends it again as it is after a lost response.
 */
export async function sealMachineLogBatch(machine: MachineIdentity, entries: { sequence: number; entry: MachineLogEntry }[]): Promise<MachineLogBatch> {
  const { accountId, machineId } = machine.credentials;
  const sealed: MachineLogBatch['entries'] = [];
  for (const { sequence, entry } of entries) {
    sealed.push({ stream: entry.stream, sequence, box: await sealMachineLogEntry(machine.key, machine.pinned, accountId, machineId, sequence, entry) });
  }
  return { entries: sealed };
}

/**
 * Sends a sealed batch and checks what the server says it did: every place
 * it names was sent, and is named once. What is not acknowledged as kept
 * stays with the machine; one that names a place not sent is refused, so
 * nothing is let go on its word.
 */
export async function sendMachineLogBatch(client: Pick<MachineClient, 'log'>, machine: MachineIdentity, batch: MachineLogBatch): Promise<MachineLogAck> {
  const ack = await client.log(machine.credentials, batch);
  const sent = new Set(batch.entries.map((entry) => `${entry.stream}:${entry.sequence}`));
  const named = new Set<string>();
  const lied = () => new DecryptionError('The server acknowledged log entries this machine did not send.');
  for (const range of [...(ack.accepted ?? []), ...(ack.refused ?? []), ...(ack.conflicts ?? [])]) {
    if (!Number.isSafeInteger(range?.first) || !Number.isSafeInteger(range?.last) || range.first > range.last || range.last - range.first >= sent.size) throw lied();
    for (let sequence = range.first; sequence <= range.last; sequence++) {
      const at = `${range.stream}:${sequence}`;
      if (!sent.has(at) || named.has(at)) throw lied();
      named.add(at);
    }
  }
  return ack;
}

/** One entry of a machine's log, opened. */
export interface MachineLogRead extends MachineLogEntry {
  machineId: string;
  sequence: number;
  receivedAt: number;
}

/** A deciding device's record, opened with Passhold's key. */
export interface MachineDecisionRead {
  machineId: string;
  requestId: string;
  deviceId: string;
  decidedAt: number;
  record: MachineDecisionRecord;
}

/** What the log held after the revision this device read, up to where this read stopped. */
export interface MachineAuditRead {
  entries: MachineLogRead[];
  decisions: MachineDecisionRead[];
  /** Entries the server says it refused for want of room, which their machine keeps: its word, shown beside what is missing, never in its place. */
  refused: (MachineLogRange & { machineId: string })[];
  /** Entries and records that did not open as what they were filed as, or came again: the server's, or nobody's. */
  unreadable: number;
  /** The revision to read from next. */
  rev: number;
  /** More follows `rev`: read again from there. */
  hasMore: boolean;
  /** The server's revision went back: this read started again from nothing. */
  reset: boolean;
}

/**
 * Reads the machines' log, the devices' decisions and the refusals after
 * `since`, up to `pages` pages. Each entry must open with the authority, or
 * one it replaced, as from the point this device pinned for the machine it
 * is filed under, at its place in its run; each decision with Passhold's key
 * for its device and request, with the outcome the server shows, and, when
 * the authority signed it, with its signature. Each row must sit after the
 * revision asked for and within the page, once.
 */
export async function readMachineAudit(api: Pick<RequestApi, 'agentLog'>, trusted: TrustedAgents, passhold: ProductKey, since = 0, pages = 50): Promise<MachineAuditRead> {
  ownerOf(trusted, passhold, false);
  const { accountId } = trusted;
  const keys = [trusted.authority.box, ...trusted.authority.retired];
  const current: PinnedAuthority = { points: authorityPointsOf(trusted.authority), verify: trusted.authority.sign.verify };
  let rev = since;
  let reset = false;
  let hasMore = false;
  const out: Omit<MachineAuditRead, 'rev' | 'hasMore' | 'reset'> = { entries: [], decisions: [], refused: [], unreadable: 0 };
  const seen = new Set<string>();
  for (let read = 0; read < pages; read++) {
    const page = await api.agentLog(rev);
    if (!Number.isSafeInteger(page.rev) || page.rev < 0) throw stuck();
    // The account's audit revision never goes back on one server: one behind this device's is a server that lost something.
    if (!page.hasMore && page.rev < rev && page.entries.length + page.decisions.length + page.refused.length === 0) {
      if (reset) throw stuck();
      reset = true;
      rev = 0;
      Object.assign(out, { entries: [], decisions: [], refused: [], unreadable: 0 });
      seen.clear();
      read = -1;
      continue;
    }
    if (page.hasMore && page.rev <= rev) throw stuck();
    const revs = new Set<number>();
    for (const view of [...page.entries, ...page.decisions, ...page.refused]) {
      if (!Number.isSafeInteger(view.rev) || view.rev <= rev || view.rev > page.rev || revs.has(view.rev)) throw stuck();
      revs.add(view.rev);
    }
    for (const view of page.entries) {
      const pin = trusted.pins.get(view.machineId);
      const at = `entry:${view.machineId}:${view.stream}:${view.sequence}`;
      let opened: MachineLogEntry | null = null;
      for (const key of pin && !seen.has(at) ? keys : []) {
        try {
          opened = await openMachineLogEntry(key, pin!.key, view.box, accountId, view.machineId, view.stream, view.sequence);
          break;
        } catch {
          // Sealed to another of the authority's keys, or not the machine's at all.
        }
      }
      if (!opened) {
        out.unreadable += 1;
        continue;
      }
      seen.add(at);
      out.entries.push({ ...opened, machineId: view.machineId, sequence: view.sequence, receivedAt: view.receivedAt });
    }
    for (const view of page.decisions) {
      const at = `decision:${view.machineId}:${view.requestId}`;
      try {
        if (seen.has(at)) throw stale();
        const record = await openMachineDecisionRecord(passhold.key, view.box, { accountId, machineId: view.machineId, requestId: view.requestId }, view.deviceId);
        if (record.statement.outcome !== view.outcome) throw stale();
        // Under Passhold's key, it is a Passhold device's; signed by this authority, its signature checks out too.
        if (record.signedBy === current.points.sign) await checkOwnerStatement(current, { kind: 'decision', ...record.statement }, record.sig);
        seen.add(at);
        out.decisions.push({ machineId: view.machineId, requestId: view.requestId, deviceId: view.deviceId, decidedAt: view.decidedAt, record });
      } catch {
        out.unreadable += 1;
      }
    }
    for (const view of page.refused) out.refused.push({ machineId: view.machineId, stream: view.stream, first: view.first, last: view.last });
    rev = page.rev;
    hasMore = page.hasMore;
    if (!page.hasMore) break;
  }
  return { ...out, rev, hasMore, reset };
}

/**
 * Sequences missing from one run of one machine, between 1 and the highest
 * held: those the server says it refused for want of room, which it alone
 * vouches for, apart from the rest.
 */
export interface MachineLogGap {
  machineId: string;
  stream: string;
  /** Missing, and not claimed as refused. */
  missing: number;
  ranges: { first: number; last: number }[];
  /** Missing, and claimed by the server as refused for want of room. */
  claimed: number;
  claimedRanges: { first: number; last: number }[];
}

/** Ranges of `holes` inside, or outside, any of `covers`. */
function split(holes: { first: number; last: number }[], covers: { first: number; last: number }[]) {
  let outside = holes;
  const inside: { first: number; last: number }[] = [];
  for (const cover of covers) {
    outside = outside.flatMap((hole) => {
      if (cover.last < hole.first || cover.first > hole.last) return [hole];
      inside.push({ first: Math.max(hole.first, cover.first), last: Math.min(hole.last, cover.last) });
      const left = cover.first > hole.first ? [{ first: hole.first, last: cover.first - 1 }] : [];
      const right = cover.last < hole.last ? [{ first: cover.last + 1, last: hole.last }] : [];
      return [...left, ...right];
    });
  }
  return { outside, inside: inside.sort((a, b) => a.first - b.first) };
}

const counted = (ranges: { first: number; last: number }[]) => ranges.reduce((total, range) => total + range.last - range.first + 1, 0);

/**
 * Where each run has entries missing, from every entry a device holds of it,
 * with what the server says it refused shown apart. A server can still hide
 * the end of a run, or a whole run; a hole in the middle shows, whatever it
 * says of it.
 */
export function machineLogGaps(entries: { machineId: string; stream: string; sequence: number }[], refused: { machineId: string; stream: string; first: number; last: number }[]): MachineLogGap[] {
  const runs = new Map<string, { machineId: string; stream: string; held: number[] }>();
  for (const entry of entries) {
    const at = `${entry.machineId}:${entry.stream}`;
    if (!runs.has(at)) runs.set(at, { machineId: entry.machineId, stream: entry.stream, held: [] });
    runs.get(at)!.held.push(entry.sequence);
  }
  const gaps: MachineLogGap[] = [];
  for (const [at, run] of runs) {
    const held = [...new Set(run.held)].sort((a, b) => a - b);
    const holes: { first: number; last: number }[] = [];
    let next = 1;
    for (const sequence of held) {
      if (sequence > next) holes.push({ first: next, last: sequence - 1 });
      next = sequence + 1;
    }
    const { outside, inside } = split(
      holes,
      refused.filter((known) => `${known.machineId}:${known.stream}` === at),
    );
    if (outside.length + inside.length > 0) gaps.push({ machineId: run.machineId, stream: run.stream, missing: counted(outside), ranges: outside, claimed: counted(inside), claimedRanges: inside });
  }
  return gaps;
}

/** The server's own account of each machine's calls, hour by hour from `from`, for the machines this device trusts: its word, named from the pins. */
export async function readMachineCalls(api: Pick<RequestApi, 'agentAudit'>, trusted: TrustedAgents, from: number): Promise<(MachineHourView & { machineName: string })[]> {
  const hours: (MachineHourView & { machineName: string })[] = [];
  const seen = new Set<string>();
  let after: { hour: number; machine: string } | null = null;
  for (let pages = 0; ; pages++) {
    if (pages >= MAX_PAGES) throw stuck();
    const page = await api.agentAudit(from, after);
    for (const hour of page.hours) {
      const at = `${hour.hour}:${hour.machineId}`;
      if (seen.has(at)) throw stuck();
      seen.add(at);
      const pin = trusted.pins.get(hour.machineId);
      if (pin) hours.push({ ...hour, machineName: pin.name });
    }
    if (!page.next) break;
    const last = page.hours[page.hours.length - 1];
    if (!last || page.next.hour !== last.hour || page.next.machine !== last.machineId) throw stuck();
    after = page.next;
  }
  return hours;
}

// ---------------------------------------------------------------------------
// Removing a machine, renewing one, and what follows

type LifecycleApi = Pick<HttpSyncAdapter, 'agents' | 'removeMachine' | 'stopAllMachines' | 'renewMachine' | 'forgetMachines' | 'putMachineGrants'>;

/**
 * What a removal leaves. The server has ended the machines at once: they
 * can no longer connect. The item versions whose keys they could hold wait
 * for new keys until `finishMachineRekey` gives them; until then a server
 * that went on serving them would serve keys that open what was there, not
 * what is written after.
 */
export interface MachinesEnded {
  checkpoint: AgentCheckpoint;
  removed: string[];
  /** Every item version still waiting for a new key: these machines' and any before. */
  rekey: AgentItemVersion[];
}

/**
 * The next directory with these machines marked removed and their
 * whole-vault grants gone. The item versions whose keys they could hold
 * wait for new keys from then on, read from their pins (`pendingRekey`).
 */
async function directoryEnding(trusted: TrustedAgents, passhold: ProductKey, machineIds: string[]) {
  const ending = new Set(machineIds);
  const next = await sealNextDirectory(trusted, passhold, (directory) => ({
    ...directory,
    machines: directory.machines.map((entry) => (ending.has(entry.id) ? { ...entry, removed: true } : entry)),
    wholeVault: directory.wholeVault.filter((grant) => !ending.has(grant.machine)),
  }));
  const after: TrustedAgents = { ...trusted, directory: next.directory, checkpoint: next.checkpoint };
  return { ...next, after };
}

function namedMachine(trusted: TrustedAgents, machineId: string) {
  const entry = trusted.directory.machines.find((machine) => machine.id === machineId);
  if (!entry || !trusted.pins.has(machineId)) throw new Error('There is no such machine.');
  if (entry.removed) throw new Error('This machine was removed.');
  return entry;
}

/**
 * Removes one machine: the directory names it removed and queues every item
 * version whose key it could hold, and the server ends it in the same step.
 * `proof` is fresh proof the person is there; a machine past its expiry, or
 * one the server has already ended, takes none.
 */
export async function removeMachine(
  api: Pick<LifecycleApi, 'removeMachine'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  machineId: string,
  proof: OwnerProofFields | null,
): Promise<MachinesEnded> {
  ownerOf(trusted, passhold);
  namedMachine(trusted, machineId);
  const next = await directoryEnding(trusted, passhold, [machineId]);
  const ended = await api.removeMachine(machineId, { ...(proof ?? {}), directory: next.next });
  if (!ended.removed.includes(machineId)) throw stale();
  return { checkpoint: next.checkpoint, removed: [machineId], rekey: pendingRekey(next.after) };
}

/** Stops every agent: every machine the directory names live is removed in one step, with every invitation still waiting. */
export async function stopAllMachines(api: Pick<LifecycleApi, 'stopAllMachines'>, trusted: TrustedAgents, passhold: ProductKey, proof: OwnerProofFields): Promise<MachinesEnded> {
  ownerOf(trusted, passhold);
  const live = trusted.directory.machines.filter((entry) => !entry.removed).map((entry) => entry.id);
  const next = await directoryEnding(trusted, passhold, live);
  const ended = await api.stopAllMachines({ ...proof, directory: next.next });
  if (live.some((machineId) => !ended.removed.includes(machineId))) throw stale();
  return { checkpoint: next.checkpoint, removed: live, rekey: pendingRekey(next.after) };
}

/**
 * Renews a live machine: a new expiry, from a day to a year from now, in its
 * pin and the next directory, and the authority's activation of its point at
 * that expiry, which the machine checks (`readMachineStatus`). A token
 * machine's renewal is a new token: this device keeps no machine's key, so
 * it takes the token in use, checks it is this machine's, and makes the new
 * one with a new credential; the old token is told it was replaced. Returns
 * the new token to its maker alone, to show once.
 */
export async function renewMachine(
  api: Pick<LifecycleApi, 'renewMachine'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  machineId: string,
  details: { lifetime?: number; proof: OwnerProofFields; token?: string },
  now = Date.now(),
): Promise<{ checkpoint: AgentCheckpoint; expiresAt: number; token: string | null }> {
  ownerOf(trusted, passhold);
  const { accountId } = passhold;
  const pin = liveMachine(trusted, machineId, now);
  const view = trusted.machines.get(machineId);
  if (!view) throw stale();
  const lifetime = details.lifetime ?? MACHINE_LIFETIME[pin.kind];
  if (!Number.isSafeInteger(lifetime) || lifetime < MACHINE_LIFETIME.min || lifetime > MACHINE_LIFETIME.max) throw new Error('A machine lasts from a day to a year.');
  const expiresAt = now + lifetime;
  let credential: string | null = null;
  let token: string | null = null;
  if (pin.kind === 'token') {
    if (details.token === undefined) throw new Error('A token machine is renewed with the token it has now.');
    const held = await decodeMachineToken(details.token);
    const points = authorityPointsOf(trusted.authority);
    if (held.accountId !== accountId || held.machineId !== machineId || held.key.publicKey !== pin.key || held.authority.box !== points.box || held.authority.sign !== points.sign) {
      throw new Error('That token is not this machine’s.');
    }
    credential = newMachineCredential();
    token = `PASSHOLD_MACHINE_TOKEN=${await encodeMachineToken({ accountId, machineId, expiresAt, credential, key: held.key, authority: points })}`;
  } else if (details.token !== undefined) {
    throw new Error('An enrolled machine keeps its own credential.');
  }
  // What the activation names: the invitation an enrolled machine answered, which only that machine can check against its own.
  const invitationId = pin.kind === 'token' ? machineId : view.invitationId;
  const sealed = await sealPins(trusted, passhold, new Map([[machineId, { ...pin, rev: pin.rev + 1, expiresAt }]]));
  const activation = await signMachineActivation(trusted.authority, { accountId, machineId, invitationId, machineKey: pin.key }, expiresAt);
  await api.renewMachine(machineId, { ...details.proof, expiresAt, pin: sealed.boxes.get(machineId)!, directory: sealed.next, activation, ...(credential ? { credential } : {}) });
  return { checkpoint: sealed.checkpoint, expiresAt, token };
}

/**
 * The machine's side: until when it lasts, by the authority's activation of
 * its own point and invitation, never the server's word; whether it is
 * paused is the server's word, as a pause is the server's to keep. An
 * activation past its end, or a refusal that says the machine was removed,
 * replaced or restored, lets every request of the machine go.
 * `invitationId` is the invitation it answered; a token machine's own id.
 */
export async function readMachineStatus(
  client: Pick<MachineClient, 'status'>,
  machine: MachineIdentity,
  invitationId: string,
  now = Date.now(),
): Promise<{ status: 'live' | 'paused'; expiresAt: number }> {
  const { accountId, machineId } = machine.credentials;
  const view = await endsAsks(machine, () => client.status(machine.credentials));
  if (view.machineId !== machineId || !view.activation || view.activation.expiresAt !== view.expiresAt) throw new DecryptionError('That was not signed by this account’s Passhold.');
  await checkMachineActivation(machine.pinned, { accountId, machineId, invitationId, machineKey: machine.key.publicKey }, view.activation.expiresAt, view.activation.sig);
  if (view.activation.expiresAt <= now) {
    forgetMachineAsks(machine);
    throw new Error('This machine has expired. Enroll it again in Passhold.');
  }
  return { status: view.status === 'paused' ? 'paused' : 'live', expiresAt: view.activation.expiresAt };
}

/**
 * What this device does about machines and grants whose time is up, once it
 * is unlocked: a machine past the expiry its pin names is removed from the
 * directory, and a grant past its own end is taken back. A machine the
 * server alone says it ended (a restore, Passhold's key replaced) is
 * returned in `ended` for the person to remove (`removeMachine`, which then
 * takes no proof); until then nothing whose key it could hold is written
 * (`pendingRekey`). None of this takes proof: nothing that can still connect
 * is ended. `finishMachineRekey` gives the new keys after.
 */
export async function settleMachines(
  api: Pick<LifecycleApi, 'agents' | 'removeMachine' | 'putMachineGrants'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  now = Date.now(),
): Promise<{ checkpoint: AgentCheckpoint; removed: string[]; ended: string[]; withdrawn: { machine: string; vault: string; item: string }[]; rekey: AgentItemVersion[] }> {
  ownerOf(trusted, passhold);
  const removed: string[] = [];
  for (const entry of [...trusted.directory.machines]) {
    if (entry.removed || trusted.pins.get(entry.id)!.expiresAt > now) continue;
    trusted = await openAgents(api, passhold, (await removeMachine(api, trusted, passhold, entry.id, null)).checkpoint);
    removed.push(entry.id);
  }
  const ended = trusted.directory.machines.filter((entry) => !entry.removed && hasEnded(trusted, entry.id, now)).map((entry) => entry.id);
  const withdrawn: { machine: string; vault: string; item: string }[] = [];
  for (const entry of [...trusted.directory.machines]) {
    if (entry.removed || ended.includes(entry.id)) continue;
    const lapsed = trusted.pins.get(entry.id)!.grants.filter((grant) => grant.item !== null && grant.expiresAt !== null && grant.expiresAt <= now);
    if (lapsed.length === 0) continue;
    const items = lapsed.map((grant) => ({ vault: grant.vault, item: grant.item! }));
    trusted = await openAgents(api, passhold, (await withdrawMachineItems(api, trusted, passhold, entry.id, items, now)).checkpoint);
    withdrawn.push(...items.map((item) => ({ machine: entry.id, ...item })));
  }
  return { checkpoint: trusted.checkpoint, removed, ended, withdrawn, rekey: pendingRekey(trusted, now) };
}

/**
 * Lets removed machines go from the directory, and the server let their rows
 * go, with fresh proof, once nothing kept needs the pin that names them: the
 * server refuses while any of their log, decisions or hours is still kept.
 * A pin is the only record of what its machine could read, so one goes only
 * once every key it could hold has been replaced, and, where it could read a
 * value, once the person says those secrets were replaced at their services
 * (`keysReplaced`, after `keysAgentsCouldRead`).
 */
export async function forgetMachines(
  api: Pick<LifecycleApi, 'forgetMachines'>,
  trusted: TrustedAgents,
  passhold: ProductKey,
  machineIds: string[],
  proof: OwnerProofFields,
  options: { keysReplaced?: boolean } = {},
): Promise<AgentCheckpoint> {
  ownerOf(trusted, passhold);
  const forgetting = new Set(machineIds);
  if (forgetting.size === 0 || forgetting.size !== machineIds.length) throw new Error('Malformed machine grant.');
  const pending = new Set(pendingRekey(trusted).map(versionOf));
  for (const machineId of forgetting) {
    const entry = trusted.directory.machines.find((machine) => machine.id === machineId);
    if (!entry) throw new Error('There is no such machine.');
    if (!entry.removed) throw new Error('Remove this machine first.');
    const exposed = trusted.pins.get(machineId)!.exposed;
    if (exposed.some((known) => known.key && pending.has(versionOf(known)))) throw notReplaced();
    if (exposed.some((known) => known.fields.length > 0) && options.keysReplaced !== true) throw new Error('Replace the keys the agent could read first.');
  }
  const next = await sealNextDirectory(trusted, passhold, (directory) => ({ ...directory, machines: directory.machines.filter((entry) => !forgetting.has(entry.id)) }));
  await api.forgetMachines({ ...proof, machines: [...forgetting], directory: next.next });
  return next.checkpoint;
}

/** What one removed machine could have read, from its pin: each item version whose key it could hold, and each field whose value it could read, by the value's digest then. */
export interface KeysAgentCouldRead {
  machineId: string;
  machineName: string;
  exposed: MachineExposure[];
}

/**
 * Keys the agent could read: for every machine the directory names removed,
 * what it could have taken with it. A new item key does not take a value
 * back; each stays listed until its value changes at the service that issued
 * it, which Passhold tells by comparing the digest with the value now.
 */
export function keysAgentsCouldRead(trusted: TrustedAgents): KeysAgentCouldRead[] {
  return trusted.directory.machines
    .filter((entry) => entry.removed && (trusted.pins.get(entry.id)?.exposed.length ?? 0) > 0)
    .map((entry) => {
      const pin = trusted.pins.get(entry.id)!;
      return { machineId: entry.id, machineName: pin.name, exposed: pin.exposed.map((known) => ({ ...known, fields: known.fields.map((field) => ({ ...field })) })) };
    });
}

/**
 * How many item keys an ended machine could hold that still wait for new
 * ones: ending a machine takes effect at once, and its keys are replaced
 * later, by a Passhold device that opens the items. Zero for a live machine.
 */
export function keysWaitingFor(trusted: TrustedAgents, machineId: string, now = Date.now()): number {
  if (!hasEnded(trusted, machineId, now)) return 0;
  const waiting = new Set(pendingRekey(trusted, now).map(versionOf));
  return (trusted.pins.get(machineId)?.exposed ?? []).filter((exposure) => exposure.key && waiting.has(versionOf(exposure))).length;
}

// ---------------------------------------------------------------------------
// Passhold's key replaced, and a server put back from a backup

type MoveApi = Pick<HttpSyncAdapter, 'agents' | 'agentVaults' | 'agentVaultPull' | 'beginAgentMove' | 'agentMoveDecisions' | 'agentMoveStep' | 'finishAgentMove'>;
type SendBackApi = Pick<HttpSyncAdapter, 'agents' | 'agentVaultPull' | 'sendAgentsBack'>;

/** Roughly what one step of a move or a send-back carries, well under what the server takes in one request. */
const STEP_BYTES = 1024 * 1024;
/** As many entries as one step carries of each kind, under what the server takes. */
const STEP_ENTRIES = 200;
/** What one request may hold, with room under the server's limit. */
const REQUEST_BYTES = 1_900_000;

const samePoints = (a: AgentAuthorityPoints, b: AgentAuthorityPoints) => a.box === b.box && a.sign === b.sign;

/** Items held back until they come to `STEP_BYTES` or `STEP_ENTRIES`, then sent together. */
function stepper<T>(send: (items: T[]) => Promise<void>) {
  let held: T[] = [];
  let bytes = 0;
  const flush = async () => {
    if (held.length === 0) return;
    const sending = held;
    held = [];
    bytes = 0;
    await send(sending);
  };
  return {
    async add(item: T) {
      const size = JSON.stringify(item).length;
      if (held.length > 0 && (bytes + size > STEP_BYTES || held.length >= STEP_ENTRIES)) await flush();
      held.push(item);
      bytes += size;
    },
    flush,
  };
}

/** Every record of a vault as the server holds it now, the latest of each item, as it came: nothing is opened here. */
async function everyRecord(api: Pick<VaultApi, 'agentVaultPull'>, vaultId: string): Promise<AgentRecordWire[]> {
  const items = new Map<string, AgentRecordWire>();
  let since = 0;
  let epoch: string | null = null;
  for (let pages = 0; ; pages++) {
    if (pages >= MAX_PAGES) throw stuck();
    const page = await api.agentVaultPull(vaultId, since);
    if (!Number.isSafeInteger(page.serverRev) || page.serverRev < 0 || (epoch !== null && page.epoch !== epoch)) throw stuck();
    epoch = page.epoch;
    for (const record of page.records) items.set(record.item, record);
    if (!page.hasMore) break;
    if (page.serverRev <= since) throw stuck();
    since = page.serverRev;
  }
  return [...items.values()];
}

/** A move under way, opened with Passhold's new key. */
interface OpenedMove {
  authority: AgentAuthority;
  vaults: Map<string, { generation: number; key: AgentVaultKey }>;
}

/**
 * The move the server holds, when this device can take it up: under the new
 * key, from an authority that carries along every `T` of the one it
 * replaces, which only a device that opened that one could seal, with the
 * next generation of every vault.
 */
async function openMove(move: AgentMoveState, old: TrustedAgents, vaults: OpenedAgentVault[], passhold: ProductKey): Promise<OpenedMove> {
  const { accountId, key } = passhold;
  if (move.keyGeneration !== passhold.keyGeneration || move.vaults.length !== vaults.length) throw stale();
  const authority = await openAgentAuthority(move.wrap, key, accountId);
  if (!samePoints(authorityPointsOf(authority), move.points)) throw stale();
  const carried = [old.authority.box, ...old.authority.retired].map((held) => held.publicKey);
  if (authority.retired.length !== carried.length || authority.retired.some((held, index) => held.publicKey !== carried[index])) throw stale();
  const next = new Map<string, { generation: number; key: AgentVaultKey }>();
  for (const vault of vaults) {
    const view = move.vaults.find((entry) => entry.id === vault.id);
    if (!view || view.generation !== vault.generation + 1) throw stale();
    const opened = await openAgentVaultKey(view.keyWrap, key, accountId, vault.id, view.generation);
    if (opened.write.publicKey !== view.writePoint) throw stale();
    await openAgentVaultName(opened.key, view.nameBox, accountId, vault.id, view.generation);
    next.set(vault.id, { generation: view.generation, key: opened });
  }
  return { authority, vaults: next };
}

/**
 * The directory a move ends with: the new authority, every vault at its next
 * generation, every machine removed under its pin sealed again, every item
 * at the key that replaced its own, and what the old directory said of
 * items the server no longer holds, as it said it.
 */
function movedDirectory(old: TrustedAgents, move: OpenedMove, pins: Map<string, string>, replaced: AgentReplacedItem[]): AgentDirectory {
  const moved = new Set(replaced.map((entry) => `${entry.vault}:${entry.item}`));
  return {
    version: old.directory.version + 1,
    prev: old.checkpoint.digest,
    authority: authorityPointsOf(move.authority),
    vaults: old.directory.vaults.map((entry) => {
      const next = move.vaults.get(entry.id)!;
      return { id: entry.id, generation: next.generation, write: next.key.write.publicKey };
    }),
    machines: old.directory.machines.map((entry) => ({ id: entry.id, rev: entry.rev, pin: pins.get(entry.id)!, removed: true })),
    wholeVault: [],
    rekey: [],
    replaced: [...old.directory.replaced.filter((entry) => !moved.has(`${entry.vault}:${entry.item}`)), ...replaced],
  };
}

/**
 * Moves the agents to Passhold's new key, once it replaced one that may
 * have leaked (`replaceProductKey`, or a new root that replaced it).
 * Whoever held the old key could open the authority, every vault's key and
 * write key, and every item's key, so nothing is only sealed again: a new
 * authority, which carries the old `T` along to read what was sealed to it,
 * a new key and write key for each vault at its next generation, and a new
 * key for each item at a later version (`nextVersion`), its record sealed
 * again under it and signed by the new write key. Every pin, and every
 * device's record of a decision, is sealed again under the new key. Every
 * machine stays removed: each pinned the old authority, and is enrolled
 * again.
 *
 * `previous` is Passhold's key the agents are under, as `replaceProductKey`
 * returned it, and `trusted` what this device trusted of them under it.
 * Every call proves both keys to the server. Until the last step the server
 * keeps what is under the old key as it was, sets what the move makes
 * beside it, each piece once, and refuses every other agent write; the last
 * step puts all of it in place at once. A move that stops is taken up where
 * it was by calling this again with the same keys, and what it set is
 * checked and kept, so the previous key is kept until this returns. Returns
 * what this device trusts under the new key.
 */
export async function moveAgentsToNewKey(
  api: MoveApi,
  previous: ProductKey,
  passhold: ProductKey,
  trusted: AgentCheckpoint | null,
  options: { known?: KnownAgentRecord } = {},
): Promise<TrustedAgents> {
  if (previous.product !== PASSHOLD || passhold.product !== PASSHOLD) throw new Error('Only Passhold holds the agent authority.');
  if (previous.accountId !== passhold.accountId || passhold.keyGeneration <= previous.keyGeneration) throw stale();
  const { accountId, key } = passhold;
  const state = await api.agents(trusted?.version ?? 0);
  if (!state.authority) throw new DecryptionError('Agents are not turned on for this account.');
  // A move already finished, whose answer did not come back: its directory follows the last one under the old key.
  if (state.authority.keyGeneration === passhold.keyGeneration && !state.move) return trustAgents(state, passhold, trusted, [key, previous.key]);
  if (state.authority.keyGeneration !== previous.keyGeneration) throw stale();
  const old = await trustAgents(state, previous, trusted, [previous.key]);
  const vaults = await openAgentVaults(api, old, previous);
  const held = new Map<string, AgentRecordWire[]>();
  for (const vault of vaults) held.set(vault.id, await everyRecord(api, vault.id));
  const proof: AgentMoveProof = { keyCheck: await deriveProductKeyCheck(PASSHOLD, key), previousKeyCheck: await deriveProductKeyCheck(PASSHOLD, previous.key) };

  let move: OpenedMove | null = null;
  if (state.move) {
    try {
      move = await openMove(state.move, old, vaults, passhold);
    } catch (error) {
      // One this device cannot take up is put aside by beginning this device's own over it.
      if (!(error instanceof DecryptionError)) throw error;
    }
  }
  // What the server set of a move this device takes up is checked and kept; one begun here has set nothing yet.
  const resumed = move !== null;
  if (!move) {
    const authority = await newAgentAuthority(old.authority);
    const next = new Map<string, { generation: number; key: AgentVaultKey }>();
    for (const vault of vaults) next.set(vault.id, { generation: vault.generation + 1, key: await newAgentVaultKey() });
    move = { authority, vaults: next };
    // The directory a move ends with commits to a key for every item: one too large for it is refused before anything moves.
    const draft = [...held].flatMap(([vault, records]) =>
      records.map((record) => ({ vault, item: record.item, version: nextVersion(old.pins.values(), { vault, item: record.item, version: record.version }), check: toBase64(randomBytes(32)) })),
    );
    await sealAgentDirectory(key, accountId, movedDirectory(old, move, new Map(old.directory.machines.map((entry) => [entry.id, entry.pin])), draft));
    const views: AgentMoveVault[] = [];
    for (const vault of vaults) {
      const { generation, key: vaultKey } = next.get(vault.id)!;
      views.push({
        id: vault.id,
        generation,
        keyWrap: await sealAgentVaultKey(vaultKey, key, accountId, vault.id, generation),
        nameBox: await sealAgentVaultName(vaultKey.key, vault.name, accountId, vault.id, generation),
        writePoint: vaultKey.write.publicKey,
      });
    }
    await api.beginAgentMove({
      ...proof,
      points: authorityPointsOf(authority),
      wrap: await sealAgentAuthority(authority, key, accountId),
      keyGeneration: passhold.keyGeneration,
      from: old.directory.version,
      vaults: views,
    });
  }
  const opened = move;
  const points = authorityPointsOf(opened.authority);
  const step = (body: Pick<AgentMoveStepRequest, 'pins' | 'records' | 'decisions'>) => api.agentMoveStep({ ...body, ...proof, points });

  // Every pin as it is, under the new key; one set already must be just that.
  const staged = new Map(resumed ? (state.move?.pins ?? []).map((entry) => [entry.machine, entry.pin]) : []);
  const pins = new Map<string, string>();
  const pinSteps = stepper<{ machine: string; pin: SealedBox }>((list) => step({ pins: list }));
  for (const [machineId, pin] of old.pins) {
    const set = staged.get(machineId);
    if (set) {
      if (JSON.stringify(await openMachinePin(key, set, accountId, machineId)) !== JSON.stringify(pin)) throw stale();
      pins.set(machineId, await machinePinDigest(set, accountId, machineId));
      continue;
    }
    const box = await sealMachinePin(key, accountId, machineId, pin);
    pins.set(machineId, await machinePinDigest(box, accountId, machineId));
    await pinSteps.add({ machine: machineId, pin: box });
  }
  await pinSteps.flush();

  // Every record at a later version, under a key nobody had, in its vault's next generation and signed by its new write key.
  const replaced: AgentReplacedItem[] = [];
  const recordSteps = stepper<AgentRekeyRecord>((list) => step({ records: list }));
  for (const vault of vaults) {
    const next = opened.vaults.get(vault.id)!;
    for (const record of held.get(vault.id)!) {
      const at = (version: number, rev: number): AgentRecordPlace => ({ accountId, vaultId: vault.id, itemId: record.item, version, rev });
      const moved = resumed ? (record.moved ?? null) : null;
      if (moved) {
        // Set by a run that stopped: a key under the vault's next key, which only this move made, for the record after this one.
        if (record.keyGeneration !== vault.generation || !(moved.version > record.version) || moved.rev !== record.rev + 1) throw stale();
        const itemKey = await openAgentItemKey(moved.itemKeyWrap, next.key.key, accountId, vault.id, next.generation, record.item, moved.version);
        if (record.deleted) await openAgentTombstone(itemKey, next.key.write.verify, moved.box, at(moved.version, moved.rev));
        else await openAgentRecord(itemKey, next.key.write.verify, moved.box, at(moved.version, moved.rev));
        const entry = { vault: vault.id, item: record.item, version: moved.version };
        replaced.push({ ...entry, check: await agentItemKeyCheck(accountId, entry, itemKey) });
        continue;
      }
      const item = await openAgentItem(old, vault, record);
      if (isBehind(item, options.known?.(vault.id, item.item))) throw new DecryptionError('That record is older than one this device has seen.');
      const entry = { vault: vault.id, item: item.item, version: nextVersion(old.pins.values(), item) };
      const rev = item.rev + 1;
      const itemKey = await newAgentItemKey();
      const place = at(entry.version, rev);
      await recordSteps.add({
        vault: vault.id,
        item: item.item,
        from: item.version,
        version: entry.version,
        rev,
        keyGeneration: next.generation,
        itemKeyWrap: await sealAgentItemKey(itemKey, next.key.key, accountId, vault.id, next.generation, item.item, entry.version),
        deleted: item.deleted,
        box: item.deleted ? await sealAgentTombstone(itemKey, next.key.write, place) : await sealAgentRecord(itemKey, next.key.write, item.value, place),
      });
      replaced.push({ ...entry, check: await agentItemKeyCheck(accountId, entry, itemKey) });
    }
  }
  await recordSteps.flush();

  // Each device's record of what it decided, under the new key. One that does not open under the key it was kept under is nobody's, and goes.
  const decisionSteps = stepper<{ machineId: string; requestId: string; box: SealedBox | null }>((list) => step({ decisions: list }));
  let after: { machine: string; request: string } | null = null;
  for (let pages = 0; ; pages++) {
    if (pages >= MAX_PAGES) throw stuck();
    const page = await api.agentMoveDecisions(after);
    for (const view of page.decisions) {
      let record: MachineDecisionRecord | null = null;
      try {
        record = await openMachineDecisionRecord(previous.key, view.box, { accountId, machineId: view.machineId, requestId: view.requestId }, view.deviceId);
      } catch {
        // Not under the old key for its place and device, or not a record at all.
      }
      const box = record ? await sealMachineDecisionRecord(key, view.deviceId, record, await pinAuthority({ box: record.statement.from, sign: record.signedBy })) : null;
      await decisionSteps.add({ machineId: view.machineId, requestId: view.requestId, box });
    }
    if (!page.next) break;
    const last = page.decisions[page.decisions.length - 1];
    if (!last || page.next.machine !== last.machineId || page.next.request !== last.requestId) throw stuck();
    after = page.next;
  }
  await decisionSteps.flush();

  const directory = movedDirectory(old, opened, pins, replaced);
  const box = await sealAgentDirectory(key, accountId, directory);
  await api.finishAgentMove({ ...proof, points, directory: { version: directory.version, box, prev: old.checkpoint.digest } });
  return openAgents(api, passhold, { version: directory.version, digest: await agentDirectoryDigest(box, accountId) });
}

/**
 * Turns agents on afresh under Passhold's key, once it replaced a key the
 * agents are still under and they cannot move (`moveAgentsToNewKey`)
 * because no device holds the key replaced any more. What they held under
 * it no longer opens, so all of it goes, their log with it, and whatever a
 * move under way had set under the new key, for fresh proof the person is
 * there and proof of `passhold`, Passhold's key as it is. Every machine was
 * ended already, and is enrolled again. Agents already under `passhold`,
 * as a call whose answer was lost leaves them, are opened as they are, as a
 * first view. Returns what this device trusts.
 */
export async function startAgentsAfresh(api: Pick<HttpSyncAdapter, 'agents' | 'resetAgents' | 'createAgentAuthority'>, passhold: ProductKey, proof: OwnerProofFields): Promise<TrustedAgents> {
  if (passhold.product !== PASSHOLD) throw new Error('Only Passhold holds the agent authority.');
  const state = await api.agents(0);
  if (state.authority?.keyGeneration === passhold.keyGeneration) return openAgents(api, passhold, null);
  if (state.authority) await api.resetAgents({ ...proof, keyCheck: await deriveProductKeyCheck(PASSHOLD, passhold.key), keyGeneration: passhold.keyGeneration });
  return turnOnAgents(api, passhold);
}

/** What sending back found the server had lost. */
export interface AgentsSentBack {
  trusted: TrustedAgents;
  /** False when the server already followed what this device trusted, and nothing was sent. */
  sent: boolean;
  /** Vaults this device trusted that the server no longer holds: what they held is made again in a vault of now. */
  lostVaults: string[];
  /** Items this device knew that the server no longer holds: no key of theirs is trusted again, and each is made again as a new item. */
  lostItems: { vault: string; item: string }[];
}

/** Whether `wide` names every key and every field value `narrow` names of what a machine could read. */
function namesAll(wide: MachinePin, narrow: MachinePin): boolean {
  return narrow.exposed.every((entry) => {
    const held = wide.exposed.find((known) => versionOf(known) === versionOf(entry));
    return held !== undefined && (held.key || !entry.key) && entry.fields.every((field) => held.fields.some((known) => known.name === field.name && known.value === field.value));
  });
}

/**
 * One pin of a machine from two that went apart: the later one, after both,
 * naming everything either says the machine could read. A field read at two
 * values keeps the later pin's.
 */
function joinedPin(a: MachinePin, b: MachinePin): MachinePin {
  const [base, other] = b.rev > a.rev ? [b, a] : [a, b];
  const exposed = base.exposed.map((entry) => ({ ...entry, fields: entry.fields.map((field) => ({ ...field })) }));
  for (const entry of other.exposed) {
    const at = exposed.findIndex((known) => versionOf(known) === versionOf(entry));
    if (at < 0) {
      exposed.push({ ...entry, fields: entry.fields.map((field) => ({ ...field })) });
      continue;
    }
    const known = exposed[at]!;
    exposed[at] = { ...known, key: known.key || entry.key, fields: [...known.fields, ...entry.fields.filter((field) => !known.fields.some((held) => held.name === field.name))] };
  }
  return { ...base, rev: Math.max(a.rev, b.rev) + 1, lastGrant: Math.max(a.lastGrant, b.lastGrant), exposed, removedAt: base.removedAt ?? other.removedAt };
}

/**
 * Sends back what this device trusted of the agents to a server put back
 * from a backup, which holds less: the pins of machines that have ended,
 * with all each could read, machines the server no longer knows, and the
 * item keys this device saw replaced. `kept` is the agents as this device
 * last opened them (`TrustedAgents.state`), which it keeps, sealed as they
 * came, beside `checkpoint`. Only a server whose epoch is not the one kept
 * has a reason to hold less; any other is refused as `openAgents` refuses
 * it.
 *
 * The next step of the server's own directory puts together what the server
 * holds, checked as a first view is, and what this device trusted, and
 * leaves out nothing either says a machine could read: two pins of a
 * machine that went apart are joined into one that names all of it, a
 * machine ended on either side or by the server's word is removed, and
 * every key an ended machine could hold at the version trusted waits for a
 * new one in the directory itself. An item whose key the server holds older
 * than the one this device trusted is read under the server's key, and
 * waits for a new one (`finishMachineRekey`) before anything is written
 * under it. An item or a vault the server no longer holds is left behind,
 * and no key of it is trusted again. A machine the server still lets
 * connect keeps its pin as the server holds it; one this device knows as
 * removed, or with a newer pin, stops the send-back. When the server
 * already follows this device's checkpoint, nothing is sent.
 */
export async function sendAgentsBack(api: SendBackApi, passhold: ProductKey, checkpoint: AgentCheckpoint, kept: AgentsState): Promise<AgentsSentBack> {
  if (passhold.product !== PASSHOLD) throw new Error('Only Passhold holds the agent authority.');
  const { accountId, key } = passhold;
  const mine = await trustAgents(kept, passhold, checkpoint, [key]);
  let refusal: unknown;
  try {
    return { trusted: await openAgents(api, passhold, mine.checkpoint), sent: false, lostVaults: [], lostItems: [] };
  } catch (error) {
    if (!(error instanceof DecryptionError)) throw error;
    refusal = error;
  }
  const state = await api.agents(0);
  if (state.epoch === undefined || kept.epoch === undefined || state.epoch === kept.epoch) throw refusal;
  const server = await trustAgents(state, passhold, null, [key]);
  const points = authorityPointsOf(mine.authority);
  if (!samePoints(authorityPointsOf(server.authority), points)) throw stale();
  const theirs = server.directory;
  const views = new Map(state.machines.map((view) => [view.id, view]));

  // The server's vaults, each as this device knew it; one the server lost is left behind with every key of it.
  const vaultIds = new Set(theirs.vaults.map((vault) => vault.id));
  for (const vault of mine.directory.vaults) {
    const there = theirs.vaults.find((entry) => entry.id === vault.id);
    if (there && (there.generation !== vault.generation || there.write !== vault.write)) throw stale();
  }
  const lostVaults = mine.directory.vaults.filter((vault) => !vaultIds.has(vault.id)).map((vault) => vault.id);

  const machines: AgentDirectory['machines'] = [];
  const chosen = new Map<string, MachinePin>();
  const sending: SendAgentsBackRequest['pins'] = [];
  for (const machineId of new Set([...theirs.machines.map((entry) => entry.id), ...mine.directory.machines.map((entry) => entry.id)])) {
    const ours = mine.directory.machines.find((entry) => entry.id === machineId);
    const named = theirs.machines.find((entry) => entry.id === machineId);
    const view = named ? views.get(machineId)! : null;
    const keptView = kept.machines.find((entry) => entry.id === machineId);
    const here = ours ? mine.pins.get(machineId)! : null;
    const there = named ? server.pins.get(machineId)! : null;
    if (view && view.status !== 'removed') {
      // A machine the server still lets connect: its pin goes with its grants, and never back from here.
      if (named!.removed || ours?.removed || keptView?.status === 'removed') throw stale();
      if (here && (here.rev > there!.rev || (here.rev === there!.rev && ours!.pin !== named!.pin))) throw stale();
      machines.push({ ...named! });
      chosen.set(machineId, there!);
      continue;
    }
    // Ended: one pin that names everything either says it could read.
    let pin: MachinePin;
    let box: SealedBox | null = null;
    if (here && there && ours!.pin !== named!.pin) {
      if (namesAll(here, there) && here.rev >= there.rev) [pin, box] = [here, keptView!.pin];
      else if (namesAll(there, here) && there.rev >= here.rev) pin = there;
      else {
        pin = joinedPin(here, there);
        box = await sealMachinePin(key, accountId, machineId, pin);
      }
    } else if (there) pin = there;
    else [pin, box] = [here!, keptView!.pin];
    if (view && (view.publicKey !== pin.key || view.kind !== pin.kind)) throw stale();
    machines.push({ id: machineId, rev: pin.rev, pin: box ? await machinePinDigest(box, accountId, machineId) : named!.pin, removed: true });
    chosen.set(machineId, pin);
    if (box) {
      const machine = { kind: pin.kind, publicKey: pin.key, createdAt: pin.createdAt, expiresAt: pin.expiresAt, invitationId: keptView!.invitationId };
      sending.push({ id: machineId, pin: box, ...(view ? {} : { machine }) });
    }
  }

  // Every item this device knew anything of, against what the server holds of it.
  const considered = new Map<string, { vault: string; item: string }>();
  const consider = (vault: string, item: string) => {
    if (vaultIds.has(vault)) considered.set(`${vault}:${item}`, { vault, item });
  };
  for (const entry of [...mine.directory.replaced, ...mine.directory.rekey]) consider(entry.vault, entry.item);
  for (const pin of chosen.values()) {
    for (const exposure of pin.exposed) consider(exposure.vault, exposure.item);
    for (const grant of pin.grants) if (grant.item !== null) consider(grant.vault, grant.item);
  }
  const holds = new Map<string, number>();
  for (const vault of theirs.vaults) for (const record of await everyRecord(api, vault.id)) holds.set(`${vault.id}:${record.item}`, record.version);
  const replaced: AgentReplacedItem[] = theirs.replaced.map((entry) => ({ ...entry }));
  const rekey = new Map(theirs.rekey.map((entry) => [versionOf(entry), { ...entry }]));
  const lostItems: { vault: string; item: string }[] = [];
  for (const [at, { vault, item }] of considered) {
    const same = (entry: { vault: string; item: string }) => entry.vault === vault && entry.item === item;
    const ours = mine.directory.replaced.find(same);
    const named = theirs.replaced.find(same);
    const version = holds.get(at);
    const theirVersion = named?.version ?? 1;
    const ourVersion = ours?.version ?? 1;
    if (version === undefined) {
      // Records are never deleted: a server waits for a new key only of an item it holds.
      if (theirs.rekey.some(same)) throw stale();
      // Closed already, by a device that found it lost, past what this device knew of it and every version a pin names.
      const pastPins = nextVersion(chosen.values(), { vault, item, version: 1 }) <= theirVersion;
      if (named && pastPins && (ourVersion < theirVersion || (ourVersion === theirVersion && ours?.check === named.check))) continue;
      // Closed past every version known, under a commitment no key has: none of its keys is trusted again, and nothing waits for it.
      const closed = { vault, item, version: nextVersion(chosen.values(), { vault, item, version: Math.max(ourVersion, theirVersion) }), check: toBase64(randomBytes(32)) };
      replaced.splice(0, replaced.length, ...replaced.filter((entry) => !same(entry)), closed);
      lostItems.push({ vault, item });
      continue;
    }
    if (version !== theirVersion) throw stale();
    if (ourVersion > theirVersion || (ourVersion === theirVersion && ours?.check !== named?.check)) {
      // This device trusted a later key than the server holds: the one it holds is read, and replaced before anything is written under it.
      const entry = { vault, item, version: theirVersion };
      rekey.set(versionOf(entry), entry);
    } else if (ourVersion === theirVersion) {
      for (const entry of mine.directory.rekey) if (same(entry) && entry.version === theirVersion) rekey.set(versionOf(entry), { ...entry });
    }
  }
  // Every key an ended machine could hold, at the version trusted now, waits in the directory itself, so no step of this leans on a pin still to come.
  for (const entry of machines) {
    if (!entry.removed) continue;
    for (const exposure of chosen.get(entry.id)!.exposed) {
      if (!exposure.key || !holds.has(`${exposure.vault}:${exposure.item}`)) continue;
      const trustedNow = replaced.find((known) => known.vault === exposure.vault && known.item === exposure.item)?.version ?? 1;
      if (exposure.version === trustedNow) rekey.set(versionOf(exposure), { vault: exposure.vault, item: exposure.item, version: exposure.version });
    }
  }
  const wholeVault: AgentDirectory['wholeVault'] = [];
  for (const entry of machines) {
    if (entry.removed) continue;
    for (const grant of chosen.get(entry.id)!.grants) {
      if (grant.item !== null) continue;
      if (!vaultIds.has(grant.vault)) throw stale();
      wholeVault.push({ machine: entry.id, vault: grant.vault, rev: grant.rev });
    }
  }

  // In steps the server takes, each a directory naming no pin the server does not hold once the step is taken.
  const directoryAt = (base: AgentCheckpoint, named: AgentDirectory['machines']): AgentDirectory => ({
    version: base.version + 1,
    prev: base.digest,
    authority: points,
    vaults: theirs.vaults,
    machines: named,
    wholeVault,
    rekey: [...rekey.values()],
    replaced,
  });
  const room = REQUEST_BYTES - JSON.stringify(await sealAgentDirectory(key, accountId, directoryAt(server.checkpoint, machines))).length;
  const groups: SendAgentsBackRequest['pins'][] = [[]];
  let bytes = 0;
  for (const entry of sending) {
    const size = JSON.stringify(entry).length;
    if (groups[groups.length - 1]!.length > 0 && bytes + size > room) {
      groups.push([]);
      bytes = 0;
    }
    groups[groups.length - 1]!.push(entry);
    bytes += size;
  }
  const waiting = new Set(sending.map((entry) => entry.id));
  let base: AgentCheckpoint = server.checkpoint;
  for (const group of groups) {
    for (const entry of group) waiting.delete(entry.id);
    const named = machines.flatMap((entry) => {
      if (!waiting.has(entry.id)) return [entry];
      const there = theirs.machines.find((known) => known.id === entry.id);
      return there ? [{ ...there, removed: true }] : [];
    });
    const box = await sealAgentDirectory(key, accountId, directoryAt(base, named));
    await api.sendAgentsBack({ directory: { version: base.version + 1, box, prev: base.digest }, pins: group });
    base = { version: base.version + 1, digest: await agentDirectoryDigest(box, accountId) };
  }
  return { trusted: await openAgents(api, passhold, base), sent: true, lostVaults, lostItems };
}

// ---------------------------------------------------------------------------
// What a start over put aside

type ArchiveApi = Pick<HttpSyncAdapter, 'archivedAgents' | 'archivedAgentVaultPull' | 'archivedAgentLog' | 'archivedAgentAudit'>;

/** What an account's agents held when it started over, opened with Passhold's old key: to read, and to copy into new vaults under new keys. */
export interface ArchivedAgents {
  archiveId: string;
  trusted: TrustedAgents;
  /** Passhold's old key as the flows take it: it opens what was kept, and writes nothing. */
  passhold: ProductKey;
  vaults: OpenedAgentVault[];
}

/**
 * Opens what an archive kept of the agents with Passhold's old key
 * (`openArchivedKey`): the authority, the directory and every pin, each
 * checked as a first view is, and every vault the directory names. Null when
 * there were no agents, or Passhold's part was deleted. Every machine in it
 * is ended: nothing of an archive acts. Bringing an item back is a new item
 * in a vault of now, under new keys (`putAgentItem`).
 */
export async function openArchivedAgents(api: Pick<ArchiveApi, 'archivedAgents'>, archive: { id: string }, accountId: string, oldKey: CryptoKey): Promise<ArchivedAgents | null> {
  const kept = await api.archivedAgents(archive.id);
  if (!kept.authority) return null;
  const passhold: ProductKey = { accountId, product: PASSHOLD, key: oldKey, keyGeneration: kept.authority.keyGeneration, root: '', rootGeneration: 0, sheetVerifiedAt: null };
  const state: AgentsState = {
    authority: { ...kept.authority, history: [] },
    machines: kept.machines.map((machine) => ({ ...machine, invitationId: machine.id })),
    enrollments: [],
    allowance: { machines: 0, vaults: 0 },
  };
  const opened = await openAgents({ agents: async () => state }, passhold, null);
  const trusted: TrustedAgents = { ...opened, readOnly: true };
  for (const [machineId, view] of trusted.machines) trusted.machines.set(machineId, { ...view, status: 'removed' });
  const vaults = await openAgentVaults({ agentVaults: async () => ({ vaults: kept.vaults, records: 0, ceiling: 0 }) }, trusted, passhold);
  return { archiveId: archive.id, trusted, passhold, vaults };
}

/** Every item an archived vault held, at its latest, each checked as a pull checks it. */
export async function readArchivedAgentVault<T = unknown>(api: Pick<ArchiveApi, 'archivedAgentVaultPull'>, archived: ArchivedAgents, vault: OpenedAgentVault): Promise<AgentItem<T>[]> {
  const pull = { agentVaultPull: (vaultId: string, since: number) => api.archivedAgentVaultPull(archived.archiveId, vaultId, since) };
  return (await syncAgentVault<T>(pull, archived.trusted, archived.passhold, vault)).items;
}

/** The log, decisions and refusals an archive kept, read as `readMachineAudit` reads the account's own. */
export async function readArchivedAgentLog(api: Pick<ArchiveApi, 'archivedAgentLog'>, archived: ArchivedAgents, since = 0, pages = 50): Promise<MachineAuditRead> {
  return readMachineAudit({ agentLog: (from: number) => api.archivedAgentLog(archived.archiveId, from) }, archived.trusted, archived.passhold, since, pages);
}

/** The server's own account of each machine's calls an archive kept, hour by hour from `from`, named from the archived pins. */
export async function readArchivedMachineCalls(api: Pick<ArchiveApi, 'archivedAgentAudit'>, archived: ArchivedAgents, from = 0): Promise<(MachineHourView & { machineName: string })[]> {
  return readMachineCalls({ agentAudit: (start: number, after) => api.archivedAgentAudit(archived.archiveId, start, after) }, archived.trusted, from);
}
