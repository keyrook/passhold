/**
 * Talking to the Keyrook account's server — the one address this build may
 * reach (__KEYROOK_API__, fixed at build time; scripts/api.mjs).
 *
 * Everything here moves ciphertext and proofs. No login, password or key
 * leaves through these functions: a record's box is sealed before it gets
 * here, and the password is reduced to `authHash` first.
 */
import { HttpSyncAdapter, namedClient, type AccountServer } from '@keyrook/account';
import type {
  AccountArchive,
  AccountKeysResponse,
  ArchivedRecordsResponse,
  CreateBoxRequest,
  CreateRootRequest,
  InitialKeys,
  OpenArchiveRequest,
  OpenArchiveResponse,
  RootRecoverResetRequest,
  RootRecoverResponse,
  SetRootRecoveryRequest,
  StartOverBeginResponse,
  StartOverRequest,
  UpdateBoxRequest,
  PasskeySignInOptions,
  SecondStepRequest,
  SecondStepRequired,
} from '@keyrook/account';
import type { AccountKdfParams, RemoteRecord, SealedBox, SignInProvider } from '@passhold/core';

export class KeyrookError extends Error {
  override readonly name = 'KeyrookError';
  constructor(
    readonly status: number,
    /** The server's code (`invalid_credentials`, `rate_limited` …), or `network`. */
    readonly code: string,
    readonly retryAfter?: number,
    /** The server's sentence, in English: matched against the kit's list to say it in the reader's language (sentences.ts). */
    readonly sentence?: string,
    /**
     * On `device_removed`: the removal's proof as the server sent it, null for
     * none. The server's word until `removalProved` checks it under Passhold's key.
     */
    readonly proof?: unknown,
  ) {
    super(code);
  }
}

const TIMEOUT = 20_000;

/** The Keyrook server's origin: the one web page allowed to hand Passhold a sign-in. */
export const KEYROOK_ORIGIN = new URL(__KEYROOK_API__).origin;

/**
 * Every request names this build (`passhold/0.1.0`): the server tells builds
 * from before each product had a key of its own by their silence, and asks
 * them to update rather than let them change an account they cannot keep up
 * with. Which product a session is, it takes from the extension's origin.
 */
const fetcher = namedClient(
  (input, init) =>
    fetch(input, {
      ...init,
      // A server that never answers must not hold a sync, and the vault's queue, forever.
      signal: AbortSignal.timeout(TIMEOUT),
      credentials: 'omit',
      cache: 'no-store',
    }),
  `passhold/${chrome.runtime.getManifest().version}`,
);

/** The server, as @keyrook/account's flows reach it before there is a session. */
export const SERVER: AccountServer = { baseUrl: __KEYROOK_API__, fetcher };

/**
 * One session as @keyrook/account's flows use it, its tokens kept here as
 * they rotate: whoever holds the session afterwards takes `tokens()` back, or
 * the next refresh spends a token the server already replaced and ends the
 * session. Null once the server refused a refresh: signed out.
 */
export function connect(start: Tokens): { api: HttpSyncAdapter; tokens: () => Tokens | null } {
  let tokens: Tokens | null = { accessToken: start.accessToken, refreshToken: start.refreshToken };
  const api = new HttpSyncAdapter({
    baseUrl: __KEYROOK_API__,
    fetcher,
    tokens: {
      get: async () => tokens,
      set: async (next) => void (tokens = { accessToken: next.accessToken, refreshToken: next.refreshToken }),
      clear: async () => void (tokens = null),
    },
  });
  return { api, tokens: () => tokens };
}

async function call<T>(path: string, init: { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown; token?: string }): Promise<T> {
  let response: Response;
  try {
    response = await fetcher(`${__KEYROOK_API__}${path}`, {
      method: init.method,
      headers: {
        ...(init.body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(init.token ? { authorization: `Bearer ${init.token}` } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new KeyrookError(0, 'network');
  }
  if (!response.ok) {
    // A captive portal or a server that is down will not answer in our shape.
    const body = (await response.json().catch(() => null)) as { error?: unknown; retryAfter?: unknown; message?: unknown; proof?: unknown } | null;
    const code = typeof body?.error === 'string' ? body.error : 'failed';
    throw new KeyrookError(
      response.status,
      code,
      typeof body?.retryAfter === 'number' ? body.retryAfter : undefined,
      typeof body?.message === 'string' ? body.message.slice(0, 500) : undefined,
      code === 'device_removed' ? (body?.proof ?? null) : undefined,
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/** A session, and whose: the account's id is what Passhold's box, pin and pairings are bound to. */
export interface Session extends Tokens {
  /** `name`: the one its owner gave it, if the server says. */
  account: { id: string; email: string; method?: 'password' | 'provider'; name?: string | null };
}

export interface Pulled {
  records: RemoteRecord[];
  serverRev: number;
  hasMore: boolean;
  epoch?: string;
}

export interface Pushed {
  accepted: { id: string; rev: number; serverRev: number }[];
  conflicts: RemoteRecord[];
  serverRev: number;
}

export const prelogin = (email: string) => call<{ kdf: AccountKdfParams }>('/auth/prelogin', { method: 'POST', body: { email } });

/**
 * A sign-in with the password. Passhold says it knows an account may ask for
 * a second step (`secondStep: true`), so such an account answers with a
 * ticket rather than a session — and a build that did not say so would be
 * told to update instead.
 */
export const login = (body: { email: string; authHash: string; deviceId: string; deviceName: string }) =>
  call<Session | SecondStepRequired>('/auth/login', { method: 'POST', body: { ...body, secondStep: true } });

/** A sign-in's second step: the code, the recovery key's proof, or one of the account's passkeys. */
export const finishSecondStep = (body: SecondStepRequest) => call<Session>('/auth/second-step', { method: 'POST', body });

/** A challenge for one of the account's passkeys to answer as a sign-in's second step. */
export const secondStepPasskeyOptions = (ticket: string) =>
  call<PasskeySignInOptions>('/auth/second-step/passkey', { method: 'POST', body: { ticket } });

export const logout = (refreshToken: string) => call<void>('/auth/logout', { method: 'POST', body: { refreshToken } });

/**
 * Asks for a six-digit code by email. Answered alike whether or not the
 * address has an account; to one that has, the email says so instead.
 */
export const registerStart = (email: string) => call<{ sent: true }>('/auth/register/start', { method: 'POST', body: { email } });

/**
 * Makes the account with its keys from the first moment: its root, and
 * Passhold's key sealed to it. The server refuses a Passhold sign-up without
 * them; the wrapping of one shared key that builds before used is never sent.
 */
export const register = (body: {
  email: string;
  code: string;
  authHash: string;
  kdf: AccountKdfParams;
  keys: InitialKeys;
  deviceId: string;
  deviceName: string;
}) => call<Session>('/auth/register', { method: 'POST', body });

// --- A forgotten password, and starting over ----------------------------------------

/** A code to the address, to set a new password with the recovery key. Answered alike for any address. */
export const recoverCode = (email: string) => call<{ sent: true }>('/auth/recover/code', { method: 'POST', body: { email } });

/** The root under the recovery key, to whoever proves the key. */
export const recoverRoot = (body: { email: string; recoveryAuthHash: string }) =>
  call<RootRecoverResponse>('/auth/recover/root', { method: 'POST', body });

/** A new password, with the recovery key, the emailed code, and proof the key opened the real root. */
export const recoverRootReset = (body: RootRecoverResetRequest) => call<Session>('/auth/recover/root/reset', { method: 'POST', body });

/** A code to the address, to start the account over with nothing left but the email. */
export const startOverCode = (email: string) => call<{ sent: true }>('/auth/start-over/code', { method: 'POST', body: { email } });

/** The code spent: the account's id, which the new keys are bound to, and a ticket for the next step. */
export const beginStartOver = (body: { email: string; code: string }) =>
  call<StartOverBeginResponse>('/auth/start-over/begin', { method: 'POST', body });

/** New keys, and on a password account a new password; what it held is kept, sealed, for 90 days. */
export const startOver = (body: StartOverRequest) => call<Session>('/auth/start-over', { method: 'POST', body });

const refresh = (refreshToken: string) => call<Tokens>('/auth/refresh', { method: 'POST', body: { refreshToken } });

/**
 * An authenticated call, refreshing the session once on a 401. Only the
 * server refusing the refresh ends the session — an offline laptop does not —
 * and the rotated tokens come back with the answer, for the vault to keep.
 * A refresh refused because this browser was removed from the account says
 * so, proof and all: still a sign-out, but one the vault may be able to name.
 */
export async function withSession<T>(tokens: Tokens, run: (accessToken: string) => Promise<T>): Promise<{ value: T; tokens: Tokens }> {
  try {
    return { value: await run(tokens.accessToken), tokens };
  } catch (error) {
    if (!(error instanceof KeyrookError) || error.status !== 401) throw error;
  }
  let next: Tokens;
  try {
    next = await refresh(tokens.refreshToken);
  } catch (error) {
    if (error instanceof KeyrookError && error.status === 401) throw error.code === 'device_removed' ? error : new KeyrookError(401, 'signed_out');
    throw error;
  }
  return { value: await run(next.accessToken), tokens: { accessToken: next.accessToken, refreshToken: next.refreshToken } };
}

// --- The account's root and Passhold's key -----------------------------------------

/** The account's root and Passhold's box, as the server holds them. A session sees only its own product's box. */
export const accountKeys = (accessToken: string) => call<AccountKeysResponse>('/account/keys', { method: 'GET', token: accessToken });

/** A root for an account made before there were roots, wrapped under its password. */
export const createRoot = (accessToken: string, body: CreateRootRequest) =>
  call<AccountKeysResponse>('/account/keys/root', { method: 'POST', token: accessToken, body });

/** The root under a new recovery key, which retires the sheet before it everywhere. */
export const setRootRecovery = (accessToken: string, body: SetRootRecoveryRequest) =>
  call<AccountKeysResponse>('/account/keys/root/recovery', { method: 'PUT', token: accessToken, body });

/** Passhold's key, sealed to the root, from the first Passhold browser on the account. */
export const createBox = (accessToken: string, body: CreateBoxRequest) =>
  call<AccountKeysResponse>('/account/keys/box', { method: 'POST', token: accessToken, body });

/** The same key's box and pin again: the pin brought up to date. */
export const updateBox = (accessToken: string, body: UpdateBoxRequest) =>
  call<AccountKeysResponse>('/account/keys/box', { method: 'PUT', token: accessToken, body });

// --- What an account kept when it started over ---------------------------------------

export const archives = async (accessToken: string) =>
  (await call<{ archives: AccountArchive[] }>('/account/archives', { method: 'GET', token: accessToken })).archives;

/** The old root's wrap under the old password or the old recovery key, for proof of either. */
export const openArchive = (accessToken: string, id: string, body: OpenArchiveRequest) =>
  call<OpenArchiveResponse>(`/account/archives/${encodeURIComponent(id)}/open`, { method: 'POST', token: accessToken, body });

export const archivedRecords = (accessToken: string, id: string, after: number) =>
  call<ArchivedRecordsResponse>(`/account/archives/${encodeURIComponent(id)}/records?after=${after}`, { method: 'GET', token: accessToken });

export const pull = (accessToken: string, since: number) => call<Pulled>(`/sync?since=${since}`, { method: 'GET', token: accessToken });

export const push = (accessToken: string, records: RemoteRecord[], baseServerRev: number) =>
  call<Pushed>('/sync', { method: 'POST', token: accessToken, body: { records, baseServerRev } });

// --- Google and GitHub -------------------------------------------------------------

/**
 * Where Passhold's own tab goes to sign in with a provider. The server sends
 * it on to Google or GitHub, and the answer comes back on a page of the
 * server's that messages Passhold (`return=message`).
 */
export function providerStartUrl(provider: SignInProvider, challenge: string, state: string, purpose: 'signin' | 'reauth' = 'signin'): string {
  const query = new URLSearchParams({ ext: chrome.runtime.id, challenge, state, return: 'message', purpose });
  return `${__KEYROOK_API__}/oauth/${provider}/start?${query}`;
}

export type ProviderSession =
  | { status: 'existing'; session: Session }
  | { status: 'new'; signupToken: string; email: string }
  | { status: 'second_step'; secondStep: SecondStepRequired['secondStep'] };

/** A ticket and its verifier: signed in to an account, a token to make one, or — as for the password — a second step to finish. */
export const providerSession = (body: { ticket: string; verifier: string; deviceId: string; deviceName: string }) =>
  call<ProviderSession>('/oauth/session', { method: 'POST', body: { ...body, secondStep: true } });

/**
 * An account with no password: its root is wrapped under a recovery key made
 * with it, the only way back once every browser is gone.
 */
export const providerRegister = (body: { signupToken: string; keys: InitialKeys; deviceId: string; deviceName: string }) =>
  call<Session>('/oauth/register', { method: 'POST', body });

// --- Letting a browser in -----------------------------------------------------------

export interface PairingSummary {
  id: string;
  deviceName: string;
  createdAt: number;
  requesterKey: string;
  approverKey: string | null;
}

export interface PairingStatus {
  status: 'waiting' | 'accepted' | 'approved';
  approverKey: string | null;
  wrap: SealedBox | null;
}

const pairingPath = (id: string) => `/pairing/${encodeURIComponent(id)}`;

export const requestPairing = (accessToken: string, publicKey: string, deviceName: string) =>
  call<{ id: string; expiresAt: number }>('/pairing', { method: 'POST', token: accessToken, body: { publicKey, deviceName } });

export const pairingStatus = (accessToken: string, id: string) => call<PairingStatus>(pairingPath(id), { method: 'GET', token: accessToken });

export const openPairings = async (accessToken: string) =>
  (await call<{ pairings: PairingSummary[] }>('/pairing', { method: 'GET', token: accessToken })).pairings;

export const acceptPairing = (accessToken: string, id: string, publicKey: string) =>
  call<void>(`${pairingPath(id)}/accept`, { method: 'POST', token: accessToken, body: { publicKey } });

export const approvePairing = (accessToken: string, id: string, wrap: SealedBox) =>
  call<void>(`${pairingPath(id)}/approve`, { method: 'POST', token: accessToken, body: { wrap } });

export const denyPairing = (accessToken: string, id: string) => call<void>(`${pairingPath(id)}/deny`, { method: 'POST', token: accessToken, body: {} });
