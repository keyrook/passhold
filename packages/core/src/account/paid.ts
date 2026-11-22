/**
 * What the paid plans add, run as the Keyrook account's flows run it: the
 * codes the link shares with Keyrook Authenticator, a Send, the breach check
 * and emergency access. Each takes a session and Passhold's key, and leaves
 * the plan to the server: a plan that does not hold a feature is refused
 * there, and nothing here deletes anything for it.
 */
import {
  AUTHENTICATOR,
  createSend,
  emergencyCompareCode,
  emergencyTrust,
  exposedCounts,
  handOverEmergencyKeys,
  openContactKey,
  openLink,
  pullLink,
  pushLink,
  readEmergencyVault,
  sealLinkCode,
  trustEmergencyContact,
  type EmergencyGrant,
  type Fetcher,
  type HttpSyncAdapter,
  type LinkCode,
  type OpenLink,
  type ProductKey,
  type SendBody,
  type SendView,
} from '@keyrook/account';
import { PassholdError } from '../errors.js';
import { fileFits } from './files.js';
import { totpCode, type TotpSetup } from '../totp.js';
import { newId } from '../util/id.js';
import { applyPulled, RECORDS_DRAWING, type RemoteRecord } from './sync.js';
import { emptyData } from '../vault/vault.js';
import type { LoginItem, VaultData } from '../vault/model.js';

// --- the codes, from the link with Keyrook Authenticator ---------------------------------

/** A code the link holds, as the link holds it: the secret stays with whoever called. */
export interface LinkedCode extends LinkCode {
  id: string;
}

export type LinkedCodes =
  | { status: 'open'; link: OpenLink; codes: LinkedCode[]; serverRev: number }
  /** Nobody turned the link on: it is turned on on the account page alone. */
  | { status: 'off' }
  /** The plan does not hold it now. Every code is still in Authenticator. */
  | { status: 'premium' };

/** Every live code in the link, read from the start: a link holds a few dozen codes, not thousands. */
export async function readLinkedCodes(api: HttpSyncAdapter, productKey: ProductKey): Promise<LinkedCodes> {
  const opened = await openLink(api, productKey, AUTHENTICATOR);
  if (opened.status !== 'open') return opened;
  const codes = new Map<string, LinkedCode | null>();
  let since = 0;
  // A server that always says there is more stops here, not never.
  for (let page = 0; page < 40; page++) {
    const pulled = await pullLink(api, opened.link, { since });
    for (const record of pulled.records) codes.set(record.id, record.value ? { ...record.value, id: record.id } : null);
    since = pulled.serverRev;
    if (!pulled.hasMore) break;
  }
  return { status: 'open', link: opened.link, codes: [...codes.values()].filter((code) => code !== null), serverRev: since };
}

/**
 * Writes a code into the link, marked as Passhold's: Authenticator takes it
 * into its own vault on its next sync, so it is never only here.
 */
export async function addLinkedCode(api: HttpSyncAdapter, productKey: ProductKey, setup: TotpSetup, websites: string[]): Promise<LinkedCodes> {
  const linked = await readLinkedCodes(api, productKey);
  if (linked.status !== 'open') return linked;
  const code: LinkedCode = { ...setup, websites, from: productKey.product, id: newId() };
  const { id, ...value } = code;
  const record = await sealLinkCode(linked.link, { id, rev: 1, value });
  const pushed = await pushLink(api, linked.link, [record], linked.serverRev);
  if (!pushed.accepted.some((entry) => entry.id === id)) throw new Error('The code was not taken. Try again.');
  return { ...linked, codes: [...linked.codes, code], serverRev: pushed.serverRev };
}

/** What a page may see of a code: who it is for and what it shows now, never the secret. */
export interface ShownCode {
  id: string;
  issuer: string;
  label: string;
  code: string;
  expiresAt: number;
  period: number;
}

export async function showCode(code: LinkedCode, now = Date.now()): Promise<ShownCode> {
  return { id: code.id, issuer: code.issuer, label: code.label, period: code.period, ...(await totpCode(code, now)) };
}

// --- a Send ------------------------------------------------------------------------------

// --- a Send of text and files -------------------------------------------------------------

/**
 * The calls a Send's flow makes. A page that moves the files itself hands
 * them to the service worker, which holds the session: what it passes is
 * this, never the session.
 */
export type SendCalls = Pick<HttpSyncAdapter, 'createSend' | 'finishSend' | 'deleteSend'>;

/** How many files one Send holds (keyrook-account, `MAX_SEND_FILES`). */
export const SEND_FILES = 10;

/**
 * A Send of typed text, files, or both, made where the files are read:
 * `createSend` seals the text and each file — under a key of its own, which
 * only the sealed text holds — before a byte leaves, puts the files where the
 * server says, and deletes the Send again if one does not arrive. Each file is
 * held to the size the account keeps before anything is sealed. The link is
 * returned to show once: nothing keeps it.
 */
export async function sendTyped(
  api: SendCalls,
  input: { text: string; files: { name: string; type: string; bytes: Uint8Array }[]; opens: number; lifetime: number; password?: string; page?: string },
  transfer: Fetcher = fetch,
): Promise<{ url: string; send: SendView }> {
  if (input.files.some((file) => !fileFits(file.bytes.length))) throw new PassholdError('fileTooLarge');
  // The flow names the adapter's type; it calls these three, which are all a page is handed.
  return createSend(
    api as HttpSyncAdapter,
    {
      body: input.text.trim() ? { text: input.text } : {},
      ...(input.files.length ? { files: input.files } : {}),
      opens: input.opens,
      lifetime: input.lifetime,
      ...(input.password ? { password: input.password } : {}),
      ...(input.page ? { page: input.page } : {}),
    },
    transfer,
  );
}

/** The names of a copy's fields, in the sender's language: the link shows them as the sender's app did. */
export interface CopyLabels {
  username: string;
  password: string;
  website: string;
  notes: string;
}

/** A copy of a login, for a Send: what its owner sees of it, the password and hidden fields marked hidden. */
export function loginCopy(login: LoginItem, labels: CopyLabels): NonNullable<SendBody['item']> {
  const fields: { label: string; value: string; hidden?: boolean }[] = [];
  if (login.username) fields.push({ label: labels.username, value: login.username });
  if (login.password) fields.push({ label: labels.password, value: login.password, hidden: true });
  for (const url of login.urls) fields.push({ label: labels.website, value: url });
  for (const field of login.fields ?? []) if (field.value) fields.push({ label: field.name, value: field.value, ...(field.hidden ? { hidden: true } : {}) });
  if (login.notes) fields.push({ label: labels.notes, value: login.notes });
  return { name: login.title, fields };
}

// --- the breach check --------------------------------------------------------------------

/** Each live login whose password was seen in a breach, and how often. Only the first five characters of each hash leave. */
export async function exposedLogins(api: HttpSyncAdapter, data: Pick<VaultData, 'items'>): Promise<{ id: string; count: number }[]> {
  const logins = data.items.filter((item) => item.deletedAt === null && item.password);
  if (logins.length === 0) return [];
  const counts = await exposedCounts(
    api,
    logins.map((item) => item.password),
  );
  return logins.map((item, at) => ({ id: item.id, count: counts[at] ?? 0 })).filter((entry) => entry.count > 0);
}

// --- emergency access ---------------------------------------------------------------------

/** A grant as Passhold shows it: whom it is with, which side this account is, and whether the two keys were compared here. */
export interface EmergencyEntry {
  id: string;
  /** `contact`: this account named them; `grantor`: they named this account. */
  they: 'contact' | 'grantor';
  email: string;
  name: string | null;
  accepted: boolean;
  /** Whether Passhold is among what the grantor hands over. */
  passhold: boolean;
  trust: 'trusted' | 'compare' | 'waiting';
  /** The code both people see, while it is to compare. */
  code: string | null;
  waitDays: number;
  requestedAt: number | null;
  opensAt: number | null;
  /** Their vault can be read here: access opened, and this account is the contact. */
  open: boolean;
}

export type EmergencyView = { status: 'open'; entries: EmergencyEntry[] } | { status: 'needs-root' };

async function opened(api: HttpSyncAdapter, productKey: ProductKey) {
  const answer = await openContactKey(api, productKey);
  return 'status' in answer ? null : answer;
}

/** Every grant this account is in, either side, with the code to compare where Passhold has not pinned their key. */
export async function emergencyView(api: HttpSyncAdapter, productKey: ProductKey, now = Date.now()): Promise<EmergencyView> {
  const contact = await opened(api, productKey);
  if (!contact) return { status: 'needs-root' };
  const entry = async (grant: EmergencyGrant, they: EmergencyEntry['they']): Promise<EmergencyEntry> => {
    const trust = await emergencyTrust(contact, productKey, grant);
    return {
      id: grant.id,
      they,
      email: grant.otherEmail,
      name: grant.otherName,
      accepted: grant.acceptedAt !== null,
      passhold: grant.products.includes(productKey.product),
      trust,
      code: trust === 'compare' ? await emergencyCompareCode(contact, productKey, grant) : null,
      waitDays: grant.waitDays,
      requestedAt: grant.requestedAt,
      opensAt: grant.opensAt,
      open: they === 'grantor' && grant.refusedAt === null && (grant.releasedAt !== null || (grant.opensAt !== null && grant.opensAt <= now)),
    };
  };
  const { named, namedMe } = contact.state;
  return {
    status: 'open',
    entries: [...(await Promise.all(named.map((grant) => entry(grant, 'contact')))), ...(await Promise.all(namedMe.map((grant) => entry(grant, 'grantor'))))],
  };
}

/** The code matched, as its owner saw: that key is pinned, and from then on keys are handed to it, or read as from it. */
export async function trustEmergency(api: HttpSyncAdapter, productKey: ProductKey, grantId: string): Promise<void> {
  const contact = await opened(api, productKey);
  if (!contact) throw new Error('Open the account’s root first.');
  const grant = [...contact.state.named, ...contact.state.namedMe].find((each) => each.id === grantId);
  if (!grant) throw new Error('There is no such grant.');
  await trustEmergencyContact(api, contact, productKey, grant, true);
}

/**
 * As the grantor's device syncs: its contact key made the first time, and
 * Passhold's key handed to each contact whose key was compared here. The
 * names of those still to compare come back.
 */
export async function handOverEmergency(api: HttpSyncAdapter, productKey: ProductKey): Promise<{ handed: string[]; compare: string[] } | null> {
  const contact = await opened(api, productKey);
  if (!contact) return null;
  const { handed, compare } = await handOverEmergencyKeys(api, contact, productKey);
  return { handed, compare };
}

/** The grantor's vault, opened as Passhold opens its own, to read only. */
export async function readEmergency(
  api: HttpSyncAdapter,
  productKey: ProductKey,
  grantId: string,
): Promise<{ status: 'compare' | 'nothing' } | { status: 'open'; data: VaultData; skipped: number }> {
  const contact = await opened(api, productKey);
  if (!contact) return { status: 'compare' };
  const grant = contact.state.namedMe.find((each) => each.id === grantId);
  if (!grant) throw new Error('There is no such grant.');
  // The grantor's records key, drawn by the account's code from their product key, which never leaves it.
  const read = await readEmergencyVault(api, contact, productKey, grant, { salt: new Uint8Array(RECORDS_DRAWING.salt), info: RECORDS_DRAWING.info });
  if (read.status !== 'open') return read;
  const pulled = await applyPulled(emptyData(), {}, read.records as RemoteRecord[], read.grantorKey);
  return { status: 'open', data: pulled.data, skipped: pulled.skipped };
}
