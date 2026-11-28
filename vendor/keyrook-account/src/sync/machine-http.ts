/**
 * A machine's own client: its credential in a scheme of its own, never a
 * person's bearer token, and no refresh on a 401. A machine that is refused
 * is told why and stops; it has no session of a person's to fall back on.
 */
import type { Fetcher } from './http.js';
import { request } from './http.js';
import type {
  MachineEnrollmentStatus,
  MachineEnrollRequest,
  MachineLogAck,
  MachineLogBatch,
  MachinePull,
  MachineRequestState,
  MachineRequestSubmission,
  MachineStatusView,
} from './protocol.js';

/** What a machine presents: its account, its own id and its credential. */
export interface MachineCredential {
  accountId: string;
  machineId: string;
  credential: string;
}

/** What an invitation lets a machine do once: answer it. */
export interface InvitationCredential {
  accountId: string;
  invitationId: string;
  secret: string;
}

/** A live machine as the server holds it; its expiry is the authority's word only through the activation (`readMachineStatus`). */
export type MachineStatus = MachineStatusView;

export interface MachineClientOptions {
  baseUrl: string;
  fetcher?: Fetcher;
}

export class MachineClient {
  private readonly fetcher: Fetcher;
  constructor(private readonly options: MachineClientOptions) {
    this.fetcher = options.fetcher ?? fetch;
  }

  private call<T>(path: string, init: RequestInit, authorization: string): Promise<T> {
    return request<T>(this.options.baseUrl, path, { ...init, headers: { ...(init.headers ?? {}), authorization } }, this.fetcher);
  }

  private static machine(credential: MachineCredential): string {
    return `KeyrookMachine ${credential.accountId}:${credential.machineId}:${credential.credential}`;
  }

  /** Answers an invitation once, with the machine's own id, point and credential. */
  async enroll(invitation: InvitationCredential, body: MachineEnrollRequest): Promise<void> {
    await this.call<unknown>('/machine/enroll', { method: 'POST', body: JSON.stringify(body) }, `KeyrookInvitation ${invitation.accountId}:${invitation.invitationId}:${invitation.secret}`);
  }

  /** Whether the person has confirmed this machine, and the activation they signed if so. */
  async enrollmentStatus(credential: MachineCredential): Promise<MachineEnrollmentStatus> {
    return this.call<MachineEnrollmentStatus>('/machine/enrollment', { method: 'GET' }, MachineClient.machine(credential));
  }

  /** This machine, as the server holds it: nothing it was given, only that it is live. */
  async status(credential: MachineCredential): Promise<MachineStatus> {
    return this.call<MachineStatus>('/machine/status', { method: 'GET' }, MachineClient.machine(credential));
  }

  /** What this machine was given or had taken back after its cursor, a page at a time. */
  async pull(credential: MachineCredential, since: number, after: { vault: string; item: string } | null = null): Promise<MachinePull> {
    const page = after ? `&vault=${encodeURIComponent(after.vault)}&item=${encodeURIComponent(after.item)}` : '';
    return this.call<MachinePull>(`/machine/pull?since=${since}${page}`, { method: 'GET' }, MachineClient.machine(credential));
  }

  /** Sends a request for the person; the same again is answered as it stands. */
  async submitRequest(credential: MachineCredential, body: MachineRequestSubmission): Promise<MachineRequestState> {
    return this.call<MachineRequestState>('/machine/requests', { method: 'POST', body: JSON.stringify(body) }, MachineClient.machine(credential));
  }

  /** A request as it stands, with its answer once there is one. */
  async requestState(credential: MachineCredential, requestId: string): Promise<MachineRequestState> {
    return this.call<MachineRequestState>(`/machine/requests/${encodeURIComponent(requestId)}`, { method: 'GET' }, MachineClient.machine(credential));
  }

  /** Sends a batch of the log: what was kept, refused for want of room, or refused for a place already taken. */
  async log(credential: MachineCredential, batch: MachineLogBatch): Promise<MachineLogAck> {
    return this.call<MachineLogAck>('/machine/log', { method: 'POST', body: JSON.stringify(batch) }, MachineClient.machine(credential));
  }
}
