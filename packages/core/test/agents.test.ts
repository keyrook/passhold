import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  approveMachineUse,
  beginLogin,
  beginMachineEnrollment,
  confirmMachineEnrollment,
  consumeMachineRelease,
  createAccount,
  createAgentVault,
  createMachineToken,
  denyMachineUse,
  finishMachineRekey,
  forgetMachines,
  giveMachineItems,
  HttpSyncAdapter,
  isMachineDelivery,
  isMachineOperation,
  MachineClient,
  machineEnrollmentStatus,
  moveAgentsToNewKey,
  namedClient,
  openAgentVaults,
  openAgents,
  openArchivedAgents,
  openArchivedKey,
  openProductKey,
  parseMachineToken,
  passwordKeys,
  prepareMachineUse,
  pullMachine,
  putAgentItem,
  readArchivedAgentVault,
  readMachineAudit,
  readMachineStatus,
  removeMachine,
  renewMachine,
  replaceProductKey,
  requestStartOverCode,
  resumeMachine,
  reviewMachineEnrollment,
  reviewMachineRequests,
  sealMachineLogBatch,
  sendAgentsBack,
  sendMachineAsk,
  sendMachineLogBatch,
  startAccountOver,
  startAgentsAfresh,
  startRegistration,
  stopAllMachines,
  submitMachineEnrollment,
  syncAgentVault,
  turnOnAgents,
  withdrawMachineItems,
  type Fetcher,
  type LoginResponse,
  type Tokens,
} from '@keyrook/account';
import {
  API_SERVICES,
  boundsAllowCommand,
  boundsAllowRequest,
  buildHttpOperation,
  buildRunOperation,
  describeAgentItem,
  exposedKeysFor,
  hostAllowed,
  listAgentMachines,
  normalizeMachineSendAs,
  normalizeRequestUrl,
  openOrRecoverAgents,
  operationsEqual,
  redactHeaders,
  redactSecrets,
  refreshEditedAgentItemGrants,
  toBase64,
  toStoredAgentsState,
  utf8,
  type AgentItemValue,
} from '@passhold/core';

const KIT = resolve(import.meta.dirname, '../../../vendor/keyrook-account-kit/server-kit.mjs');
const ORIGIN = 'chrome-extension://passholdcoreagenttestaaaaaaaaaaa';
const PASSWORD = 'Correct-Horse-Battery-9!';
/** Short fake key so secret scanners never flag it. */
const FAKE_STRIPE = 'sk_live_AgentTestKey1';
const FAKE_NEXT = 'sk_live_AgentTestKey2';

describe('host normalization, bounds, and operation building', () => {
  it('enforces strict URL and host normalization, port, IDN, IP, and wildcard PSL rules', () => {
    expect(() => normalizeRequestUrl('https://api.stripe.com./v1/charges')).toThrow(/malformed/i);
    expect(() => normalizeRequestUrl('https://user:pass@api.stripe.com/v1')).toThrow(/authority|credentials/i);
    expect(() => normalizeRequestUrl('https://api.stripe.com/v1#frag')).toThrow(/fragment/i);
    expect(() => normalizeRequestUrl('https://api.stripe.com\\@evil.test/v1')).toThrow(/authority/i);
    expect(() => normalizeRequestUrl('http://api.stripe.com/v1')).toThrow(/Plain HTTP/i);
    expect(() => normalizeRequestUrl('ftp://api.stripe.com/v1')).toThrow(/Only https/i);

    // Loopback HTTP is allowed by default for local dev/testing, refused when disabled.
    const loopback = normalizeRequestUrl('http://127.0.0.1:4321/api/v1');
    expect(loopback.host).toBe('127.0.0.1:4321');
    expect(() => normalizeRequestUrl('http://127.0.0.1:4321/api', { allowInsecureLoopback: false })).toThrow(/Plain HTTP/i);

    // Case & default port normalization.
    const stripe = normalizeRequestUrl('https://API.STRIPE.COM:443/v1/charges');
    expect(stripe.url).toBe('https://api.stripe.com/v1/charges');
    expect(hostAllowed(stripe, ['api.stripe.com'])).toBe(true);
    expect(hostAllowed(stripe, ['api.stripe.com:443'])).toBe(true);

    // Non-default port must match explicitly.
    const altPort = normalizeRequestUrl('https://api.stripe.com:8443/v1/charges');
    expect(hostAllowed(altPort, ['api.stripe.com'])).toBe(false);
    expect(hostAllowed(altPort, ['api.stripe.com:8443'])).toBe(true);

    // Unicode / IDN homograph (Cyrillic `а` instead of ASCII `a`) never matches ASCII host.
    const homograph = normalizeRequestUrl('https://\u0430pi.stripe.com/v1/charges');
    expect(homograph.hostname).toMatch(/^xn--/);
    expect(hostAllowed(homograph, ['api.stripe.com'])).toBe(false);

    // Wildcards: valid domain works; PSL suffixes and IP addresses never match wildcards.
    expect(hostAllowed(normalizeRequestUrl('https://sub.example.com/a'), ['*.example.com'])).toBe(true);
    expect(hostAllowed(normalizeRequestUrl('https://example.com/a'), ['*.example.com'])).toBe(true);
    expect(hostAllowed(normalizeRequestUrl('https://evil.com/a'), ['*.com'])).toBe(false);
    expect(hostAllowed(normalizeRequestUrl('https://evil.github.io/a'), ['*.github.io'])).toBe(false);
    expect(hostAllowed(loopback, ['*.127.0.0.1'])).toBe(false);
    expect(hostAllowed(loopback, ['127.0.0.1:4321'])).toBe(true);
    expect(hostAllowed(loopback, ['127.0.0.1'])).toBe(false);
  });

  it('enforces normalized path bounds and rejects path traversal and encoded slashes', () => {
    const traversed = normalizeRequestUrl('https://api.stripe.com/v1/charges/../../admin');
    expect(traversed.pathname).toBe('/admin');
    expect(boundsAllowRequest({ paths: ['/v1/charges'], methods: ['GET'] }, 'GET', traversed).ok).toBe(false);

    const ok = normalizeRequestUrl('https://api.stripe.com/v1/charges/ch_1');
    expect(boundsAllowRequest({ paths: ['/v1/charges'], methods: ['GET'] }, 'GET', ok).ok).toBe(true);
    expect(boundsAllowRequest({ paths: ['/v1/charges'], methods: ['GET'] }, 'POST', ok).ok).toBe(false);

    const encoded = normalizeRequestUrl('https://api.stripe.com/v1/charges/%2e%2e/admin');
    expect(boundsAllowRequest({ paths: ['/v1/charges'] }, 'GET', encoded).ok).toBe(false);
  });

  it('enforces command bounds and produces canonical operations passing isMachineOperation', async () => {
    expect(boundsAllowCommand({ commands: ['gh'], argvPrefixes: [['gh', 'pr', 'view']], cwd: ['/work/app'] }, ['gh', 'pr', 'view', '1'], '/work/app/sub').ok).toBe(true);
    expect(boundsAllowCommand({ commands: ['gh'], argvPrefixes: [['gh', 'pr', 'view']] }, ['gh', 'repo', 'delete']).ok).toBe(false);
    expect(boundsAllowCommand({ commands: ['gh'], cwd: ['/work/app'] }, ['gh', 'status'], '/etc').ok).toBe(false);

    const http1 = await buildHttpOperation({
      method: 'post',
      url: 'https://API.STRIPE.COM/v1/charges',
      headers: { 'X-Custom': '1', Accept: 'application/json' },
      body: '{"amount":100}',
    });
    const http2 = await buildHttpOperation({
      method: 'POST',
      url: 'https://api.stripe.com:443/v1/charges',
      headers: { accept: 'application/json', 'x-custom': '1' },
      body: '{"amount":100}',
    });
    expect(isMachineOperation(http1.operation)).toBe(true);
    expect(operationsEqual(http1.operation, http2.operation)).toBe(true);
    expect(operationsEqual(http1.operation, { ...http2.operation, method: 'DELETE' })).toBe(false);
    await expect(buildHttpOperation({ method: 'GET', url: 'https://api.stripe.com/v1', headers: { Authorization: 'Bearer nope' } })).rejects.toThrow(/not be set/i);

    const runOp = buildRunOperation({ argv: ['gh', 'pr', 'list'], cwd: '/work', env: [{ name: 'GH_TOKEN', ref: 'passhold://ops/GitHub' }], timeout: 30 });
    expect(isMachineOperation(runOp)).toBe(true);
  });

  it('normalizes every service in brand/apis.ts into a valid MachineDelivery', () => {
    for (const service of API_SERVICES) {
      const sendAs = normalizeMachineSendAs(service.sendAs ?? 'bearer', service.sendAs === 'basic' ? 'user1' : null);
      const item: AgentItemValue = {
        kind: 'apikey',
        title: service.slug,
        service: service.slug,
        key: 'test-secret-value',
        keyId: service.sendAs === 'basic' ? 'user1' : '',
        hosts: [...service.hosts],
        sendAs: service.sendAs ?? 'bearer',
        env: service.env,
        environment: 'test',
        scopes: '',
        issuedAt: null,
        expiresAt: null,
        notes: '',
      };
      const described = describeAgentItem({ vault: 'v1', item: 'i1', version: 1, rev: 1, deleted: false, value: item, key: {} as CryptoKey }, 'Ops');
      expect(isMachineDelivery(described.delivery), `service ${service.slug} (sendAs=${sendAs})`).toBe(true);
      // Even when a basic service has no keyId, fallback stays valid.
      const noId = describeAgentItem({ vault: 'v1', item: 'i2', version: 1, rev: 1, deleted: false, value: { ...item, keyId: '' }, key: {} as CryptoKey }, 'Ops');
      expect(isMachineDelivery(noId.delivery), `service ${service.slug} without keyId`).toBe(true);
    }
  });
});

describe('output redaction', () => {
  it('redacts raw, base64, base64url, hex, url-encoded, JSON-escaped, and HTTP Basic encodings', () => {
    const secret = 's3cr3t+Key/With=Chars&More!';
    const keyId = 'acct_42';
    const rawBytes = utf8(secret);
    const b64 = toBase64(rawBytes);
    const b64Url = b64.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
    const hex = [...rawBytes].map((b) => b.toString(16).padStart(2, '0')).join('');
    const basic = toBase64(utf8(`${keyId}:${secret}`));
    const urlEnc = encodeURIComponent(secret);

    const leaky = [
      `raw=${secret}`,
      `b64=${b64}`,
      `b64url=${b64Url}`,
      `hex=${hex}`,
      `HEX=${hex.toUpperCase()}`,
      `basic=Basic ${basic}`,
      `url=${urlEnc}`,
    ].join('\n');

    const redacted = redactSecrets(leaky, [{ label: 'Payments', field: 'key', value: secret, keyId }]);
    for (const form of [secret, b64, b64Url, hex, hex.toUpperCase(), basic, urlEnc]) {
      expect(redacted).not.toContain(form);
    }
    expect(redacted.match(/\[passhold:Payments\/key\]/g)?.length).toBeGreaterThanOrEqual(7);

    const headers = redactHeaders([['x-echo', b64], ['location', `https://evil.test/?k=${urlEnc}`]], [{ label: 'Payments', field: 'key', value: secret, keyId }]);
    expect(headers[0]![1]).toBe('[passhold:Payments/key]');
    expect(headers[1]![1]).toBe('https://evil.test/?k=[passhold:Payments/key]');
  });
});

describe.skipIf(!existsSync(KIT))('full agent lifecycle, rekey, key replacement, restore, and archive recovery', () => {
  it('exercises turnOn, enroll, token, grants, approve/deny/pause/resume, exposed keys, rekey, move, restore, reset, and archive', async () => {
    const kit = (await import(/* @vite-ignore */ KIT)) as {
      startServer(options: Record<string, unknown>): Promise<{
        fetcher: Fetcher;
        fetcherFrom(origin: string): Fetcher;
        codeFor(email: string): string | undefined;
        resetMailLimits(email: string): Promise<void>;
        newEpoch(): Promise<string>;
        startOversDue(): Promise<number>;
        close(): Promise<void>;
        sql: { query<T>(text: string, values?: unknown[]): Promise<T[]> };
      }>;
    };
    const running = await kit.startServer({ products: { passhold: [ORIGIN] }, agents: true, personalPlan: 'paid' });
    try {
      const fetcher = namedClient(running.fetcherFrom(ORIGIN), 'passhold/0.3.1');
      const email = 'agents-core@example.test';
      await startRegistration('', email, fetcher);
      const code = running.codeFor(email)!;
      const made = await createAccount({ baseUrl: '', fetcher }, { email, code, password: PASSWORD, product: 'passhold', deviceId: 'dev-1', deviceName: 'Test' });
      let tokens: Tokens | null = { accessToken: made.session.accessToken, refreshToken: made.session.refreshToken };
      const api = new HttpSyncAdapter({
        baseUrl: '',
        fetcher,
        tokens: { get: async () => tokens, set: async (t) => void (tokens = t), clear: async () => void (tokens = null) },
      });
      const proof = { authHash: (await passwordKeys({ baseUrl: '', fetcher }, email, PASSWORD)).keys.authHash };
      const pk = made.productKey;
      const machineClient = new MachineClient({ baseUrl: '', fetcher: namedClient(running.fetcher, 'passhold-macos/0.2.0') });

      // 1. Turn on agents & create vault + API key item.
      let trusted = await turnOnAgents(api, pk);
      const createdVault = await createAgentVault(api, trusted, pk, 'Production');
      trusted = await openAgents(api, pk, createdVault.checkpoint);
      const apiKeyValue: AgentItemValue = {
        kind: 'apikey',
        title: 'Stripe Live',
        service: 'stripe',
        key: FAKE_STRIPE,
        keyId: '',
        hosts: ['api.stripe.com'],
        sendAs: 'bearer',
        env: 'STRIPE_API_KEY',
        environment: 'production',
        scopes: 'read',
        issuedAt: null,
        expiresAt: null,
        notes: '',
      };
      const put = await putAgentItem(api, trusted, pk, createdVault.vault, null, apiKeyValue);

      // 2. Enroll an interactive machine + create a token machine.
      const inv = await beginMachineEnrollment(api, trusted, pk.accountId);
      const pending = await submitMachineEnrollment(machineClient, inv.text);
      const candidate = await reviewMachineEnrollment(api, trusted, pk.accountId, inv.invitationId);
      expect(candidate?.code).toBe(pending.code);
      const confirmCp = await confirmMachineEnrollment(api, trusted, pk, candidate!, { name: 'Laptop', proof });
      trusted = await openAgents(api, pk, confirmCp);
      const status = await machineEnrollmentStatus(machineClient, pending);
      expect(status.confirmed).toBe(true);

      const tok = await createMachineToken(api, trusted, pk, { name: 'CI Runner', proof });
      trusted = await openAgents(api, pk, tok.checkpoint);
      const parsedTok = await parseMachineToken(tok.token);
      expect(listAgentMachines(trusted).map((m) => m.name).sort()).toEqual(['CI Runner', 'Laptop']);

      // 3. Grant item (`each` to Laptop, `standing` to CI Runner) & test pull + use approval + audit log.
      const { listing, delivery } = describeAgentItem(put.item, 'Production');
      const g1 = await giveMachineItems(api, trusted, pk, pending.machineId, [{ vault: createdVault.vault, item: put.item, uses: ['request'], approval: 'each', listing, delivery }]);
      trusted = await openAgents(api, pk, g1.checkpoint);
      const g2 = await giveMachineItems(api, trusted, pk, tok.machineId, [{ vault: createdVault.vault, item: put.item, uses: ['request'], approval: 'standing', listing, delivery }]);
      trusted = await openAgents(api, pk, g2.checkpoint);

      const laptopId = { credentials: { accountId: pending.accountId, machineId: pending.machineId, credential: pending.credential }, key: pending.key, pinned: parsedTok.pinned };
      const pulled = await pullMachine<AgentItemValue>(machineClient, laptopId, null);
      expect(pulled.given).toHaveLength(1);

      const { operation } = await buildHttpOperation({ method: 'GET', url: 'https://api.stripe.com/v1/balance' });
      const ask = await prepareMachineUse(laptopId, pulled.given[0]!, { field: 'key', operation, reason: 'Check balance' });
      await sendMachineAsk(machineClient, laptopId, ask);
      const reviewed = await reviewMachineRequests(api, trusted, pk);
      expect(reviewed.requests).toHaveLength(1);
      expect(reviewed.requests[0]!.machineName).toBe('Laptop');

      let remembered = false;
      const approved = await approveMachineUse(api, trusted, pk, reviewed.requests[0]!, { kind: 'once', value: FAKE_STRIPE }, { deviceId: 'dev-1', remember: () => void (remembered = true) });
      expect(remembered).toBe(true);
      trusted = await openAgents(api, pk, approved.checkpoint);
      const liveStatus = await readMachineStatus(machineClient, laptopId, pending.invitationId);
      const release = await consumeMachineRelease(machineClient, laptopId, ask, { machineExpiresAt: liveStatus.expiresAt, marks: pulled.marks });
      expect(release).toMatchObject({ status: 'answered', outcome: 'allow', release: 'once', value: FAKE_STRIPE });

      // Seal & read audit log batch.
      const batch = await sealMachineLogBatch(laptopId, [{ sequence: 1, entry: { stream: 'run-1', at: Date.now(), entry: { tool: 'http_request', status: 200 } } }]);
      const ack = await sendMachineLogBatch(machineClient, laptopId, batch);
      expect(ack.accepted).toHaveLength(1);
      const audit = await readMachineAudit(api, trusted, pk, 0);
      expect(audit.entries).toHaveLength(1);
      expect(audit.decisions).toHaveLength(1);

      // 4. Three consecutive denials pause Laptop, resume restores it.
      for (let i = 0; i < 3; i++) {
        const denyAsk = await prepareMachineUse(laptopId, pulled.given[0]!, { field: 'key', operation, reason: `Deny ${i}` });
        await sendMachineAsk(machineClient, laptopId, denyAsk);
        const pendingReqs = await reviewMachineRequests(api, trusted, pk);
        const res = await denyMachineUse(api, trusted, pk, pendingReqs.requests[0]!, 'dev-1');
        if (i === 2) expect(res.status).toBe('paused');
      }
      expect((await readMachineStatus(machineClient, laptopId, pending.invitationId)).status).toBe('paused');
      await resumeMachine(api, trusted, pending.machineId, proof);
      expect((await readMachineStatus(machineClient, laptopId, pending.invitationId)).status).toBe('live');

      // 5. Renew token machine & verify new token works.
      const renewed = await renewMachine(api, trusted, pk, tok.machineId, { proof, token: tok.token });
      expect(renewed.token).toBeTruthy();
      trusted = await openAgents(api, pk, renewed.checkpoint);

      // 6. Remove Laptop -> check "Keys the agent could read" -> rotate key -> stillCurrent flips false -> rekey!
      const rem = await removeMachine(api, trusted, pk, pending.machineId, proof);
      trusted = await openAgents(api, pk, rem.checkpoint);
      const vaultsNow = await openAgentVaults(api, trusted, pk);
      const syncedBefore = await syncAgentVault<AgentItemValue>(api, trusted, pk, vaultsNow[0]!);
      const exposedBefore = await exposedKeysFor(trusted, syncedBefore.items);
      expect(exposedBefore).toHaveLength(1);
      expect(exposedBefore[0]).toMatchObject({ machineName: 'Laptop', title: 'Stripe Live', stillCurrent: true, replaceUrl: 'https://dashboard.stripe.com/apikeys' });

      // Update secret to rotated value -> stillCurrent becomes false!
      const rotated = await putAgentItem(api, trusted, pk, vaultsNow[0]!, syncedBefore.items[0]!, { ...apiKeyValue, key: FAKE_NEXT });
      const exposedAfter = await exposedKeysFor(trusted, [rotated.item]);
      expect(exposedAfter[0]!.stillCurrent).toBe(false);

      // Withdraw from CI Runner and rekey exposed item key!
      const wd = await withdrawMachineItems(api, trusted, pk, tok.machineId, [{ vault: createdVault.vault.id, item: put.item.item }]);
      trusted = await openAgents(api, pk, wd.checkpoint);
      const rekeyed = await finishMachineRekey(api, trusted, pk, (entry) => describeAgentItem(entry, 'Production'));
      expect(rekeyed.replaced.length).toBeGreaterThan(0);
      trusted = await openAgents(api, pk, rekeyed.checkpoint);

      // Stop all remaining machines.
      const stopped = await stopAllMachines(api, trusted, pk, proof);
      trusted = await openAgents(api, pk, stopped.checkpoint);

      // 7. Save snapshot, simulate server restore (epoch change), and verify `sendAgentsBack`!
      const savedBeforeRestore = toStoredAgentsState(trusted);
      await running.newEpoch();
      const sentBack = await sendAgentsBack(api, pk, savedBeforeRestore.checkpoint, savedBeforeRestore.state as never);
      expect(sentBack.trusted.checkpoint.version).toBeGreaterThanOrEqual(savedBeforeRestore.checkpoint.version);
      trusted = sentBack.trusted;

      // Verify `forgetMachines` refuses while machine log is kept (server sentence: "This machine’s log is still kept.").
      await expect(forgetMachines(api, trusted, pk, [pending.machineId], proof, { keysReplaced: true })).rejects.toThrow(/log is still kept/i);

      // 8. Replace Passhold key -> openOrRecoverAgents reports `key-replaced` -> moveAgentsToNewKey moves agents cleanly!
      const replaced1 = await replaceProductKey(api, pk);
      const detected = await openOrRecoverAgents(api, replaced1.productKey, toStoredAgentsState(trusted), { autoMove: false });
      expect(detected).toMatchObject({ status: 'key-replaced', authorityKeyGeneration: pk.keyGeneration });
      const moved = await moveAgentsToNewKey(api, pk, replaced1.productKey, trusted.checkpoint);
      expect(moved.keyGeneration).toBe(replaced1.productKey.keyGeneration);
      const movedVaults = await openAgentVaults(api, moved, replaced1.productKey);
      const movedItems = await syncAgentVault<AgentItemValue>(api, moved, replaced1.productKey, movedVaults[0]!);
      expect(movedItems.items.find((i) => i.item === put.item.item)?.value).toMatchObject({ title: 'Stripe Live', key: FAKE_NEXT });

      // Calling `startAgentsAfresh` when already under Passhold's key opens as-is; replacing key again and starting afresh resets cleanly!
      const replaced2 = await replaceProductKey(api, replaced1.productKey);
      const afresh = await startAgentsAfresh(api, replaced2.productKey, proof);
      expect(afresh.keyGeneration).toBe(replaced2.productKey.keyGeneration);
      expect(await openAgentVaults(api, afresh, replaced2.productKey)).toEqual([]);

      // Create an item under fresh authority, then start account over -> verify `openArchivedAgents` + `readArchivedAgentVault`!
      const v2 = await createAgentVault(api, afresh, replaced2.productKey, 'ArchiveMe');
      const afresh2 = await openAgents(api, replaced2.productKey, v2.checkpoint);
      await putAgentItem(api, afresh2, replaced2.productKey, v2.vault, null, { ...apiKeyValue, title: 'Archived Key', key: FAKE_STRIPE });

      await running.resetMailLimits(email);
      await requestStartOverCode('', email, fetcher);
      const soCode = running.codeFor(email)!;
      const newPassword = 'New-Password-After-9!';
      const scheduled = await startAccountOver({ baseUrl: '', fetcher }, { email, code: soCode, newPassword, product: 'passhold', deviceId: 'dev-2', deviceName: 'New' });
      expect(scheduled.executesAt).toBeGreaterThan(0);
      expect(await running.startOversDue()).toBe(1);

      // Sign in after start-over executes and recover archived agent vault items with the old password!
      const newKeys = (await passwordKeys({ baseUrl: '', fetcher }, email, newPassword)).keys;
      const loggedIn = await beginLogin('', { email, authHash: newKeys.authHash, deviceId: 'dev-2', deviceName: 'New' }, fetcher);
      expect('accessToken' in loggedIn).toBe(true);
      if ('accessToken' in loggedIn) {
        let t2: Tokens | null = { accessToken: loggedIn.accessToken, refreshToken: loggedIn.refreshToken };
        const api2 = new HttpSyncAdapter({ baseUrl: '', fetcher, tokens: { get: async () => t2, set: async (x) => void (t2 = x), clear: async () => void (t2 = null) } });
        const openedAfter = await openProductKey(api2, { accountId: loggedIn.account.id, product: 'passhold', unlockWith: { keys: newKeys } });
        expect(openedAfter.status).toBe('open');
        const archives = await api2.archives();
        expect(archives.length).toBeGreaterThan(0);
        const oldKey = await openArchivedKey(api2, { archive: archives[0]!, accountId: loggedIn.account.id, product: 'passhold', with: { password: PASSWORD } });
        const archAgents = await openArchivedAgents(api2, archives[0]!, loggedIn.account.id, oldKey);
        expect(archAgents).not.toBeNull();
        expect(archAgents!.vaults).toHaveLength(1);
        const archItems = await readArchivedAgentVault<AgentItemValue>(api2, archAgents!, archAgents!.vaults[0]!);
        expect(archItems[0]!.value).toMatchObject({ title: 'Archived Key', key: FAKE_STRIPE });
      }
    } finally {
      await running.close();
    }
  });

  it('refreshes active machine grants when item listing or delivery changes, including after session key exposure', async () => {
    const kit = (await import(/* @vite-ignore */ KIT)) as {
      startServer(options: Record<string, unknown>): Promise<{
        fetcher: Fetcher;
        fetcherFrom(origin: string): Fetcher;
        codeFor(email: string): string | undefined;
        close(): Promise<void>;
      }>;
    };
    const running = await kit.startServer({ products: { passhold: [ORIGIN] }, agents: true, personalPlan: 'paid' });
    try {
      const fetcher = namedClient(running.fetcherFrom(ORIGIN), 'passhold/0.3.1');
      const email = 'agents-edit-refresh@example.test';
      await startRegistration('', email, fetcher);
      const code = running.codeFor(email)!;
      const made = await createAccount({ baseUrl: '', fetcher }, { email, code, password: PASSWORD, product: 'passhold', deviceId: 'dev-1', deviceName: 'Test' });
      let tokens: Tokens | null = { accessToken: made.session.accessToken, refreshToken: made.session.refreshToken };
      const api = new HttpSyncAdapter({
        baseUrl: '',
        fetcher,
        tokens: { get: async () => tokens, set: async (t) => void (tokens = t), clear: async () => void (tokens = null) },
      });
      const proof = { authHash: (await passwordKeys({ baseUrl: '', fetcher }, email, PASSWORD)).keys.authHash };
      const pk = made.productKey;
      const machineClient = new MachineClient({ baseUrl: '', fetcher: namedClient(running.fetcher, 'passhold-macos/0.2.0') });

      let trusted = await turnOnAgents(api, pk);
      const createdVault = await createAgentVault(api, trusted, pk, 'Ops');
      trusted = await openAgents(api, pk, createdVault.checkpoint);
      const initialVal: AgentItemValue = {
        kind: 'apikey',
        title: 'Payments',
        service: 'stripe',
        key: FAKE_STRIPE,
        keyId: '',
        hosts: ['127.0.0.1'],
        sendAs: 'bearer',
        env: 'STRIPE_API_KEY',
        environment: 'test',
        scopes: '',
        issuedAt: null,
        expiresAt: null,
        notes: '',
      };
      const put1 = await putAgentItem(api, trusted, pk, createdVault.vault, null, initialVal);

      // Three machines: session (will expose item key), each (with custom bounds), and standing.
      const mSession = await createMachineToken(api, trusted, pk, { name: 'SessionBot', proof });
      trusted = await openAgents(api, pk, mSession.checkpoint);
      const mEach = await createMachineToken(api, trusted, pk, { name: 'EachBot', proof });
      trusted = await openAgents(api, pk, mEach.checkpoint);
      const mStanding = await createMachineToken(api, trusted, pk, { name: 'StandingBot', proof });
      trusted = await openAgents(api, pk, mStanding.checkpoint);

      const desc1 = describeAgentItem(put1.item, 'Ops');
      const gSession = await giveMachineItems(api, trusted, pk, mSession.machineId, [
        { vault: createdVault.vault, item: put1.item, uses: ['request'], approval: 'session', session: 600, bounds: { methods: ['GET'] }, ...desc1 },
      ]);
      trusted = await openAgents(api, pk, gSession.checkpoint);
      const gEach = await giveMachineItems(api, trusted, pk, mEach.machineId, [
        { vault: createdVault.vault, item: put1.item, uses: ['request', 'run'], approval: 'each', bounds: { methods: ['GET', 'POST'] }, ...desc1 },
      ]);
      trusted = await openAgents(api, pk, gEach.checkpoint);
      const gStanding = await giveMachineItems(api, trusted, pk, mStanding.machineId, [
        { vault: createdVault.vault, item: put1.item, uses: ['request'], approval: 'standing', ...desc1 },
      ]);
      trusted = await openAgents(api, pk, gStanding.checkpoint);

      const parseId = async (token: string) => {
        const parsed = await parseMachineToken(token);
        return { credentials: parsed.credentials, key: parsed.key, pinned: parsed.pinned };
      };
      const idSession = await parseId(mSession.token);
      const idEach = await parseId(mEach.token);
      const idStanding = await parseId(mStanding.token);

      let marksSession = (await pullMachine<AgentItemValue>(machineClient, idSession, null)).marks;
      let marksEach = (await pullMachine<AgentItemValue>(machineClient, idEach, null)).marks;
      let marksStanding = (await pullMachine<AgentItemValue>(machineClient, idStanding, null)).marks;

      // 1. Secret-only edit does NOT re-issue grants, and standing machine still receives the new secret.
      const secretEdit = await putAgentItem(api, trusted, pk, createdVault.vault, put1.item, { ...initialVal, key: FAKE_NEXT });
      const noRefresh = await refreshEditedAgentItemGrants(api, trusted, pk, createdVault.vault, put1.item, secretEdit.item);
      expect(noRefresh.refreshed).toBe(0);
      expect(noRefresh.rekeyed).toBe(false);
      const standingAfterSecret = await pullMachine<AgentItemValue>(machineClient, idStanding, marksStanding);
      marksStanding = standingAfterSecret.marks;
      expect(standingAfterSecret.given).toHaveLength(1);
      expect(standingAfterSecret.given[0]!.record?.value).toMatchObject({ key: FAKE_NEXT });

      // 2. Approve a session for SessionBot so its pin records key exposure on version 1.
      const pulledSession = await pullMachine<AgentItemValue>(machineClient, idSession, null);
      const { operation } = await buildHttpOperation({ method: 'GET', url: 'http://127.0.0.1/v1' });
      const ask = await prepareMachineUse(idSession, pulledSession.given[0]!, { field: 'key', operation, reason: 'Open session' });
      await sendMachineAsk(machineClient, idSession, ask);
      const reviewed = await reviewMachineRequests(api, trusted, pk);
      const approved = await approveMachineUse(api, trusted, pk, reviewed.requests[0]!, { kind: 'session', item: secretEdit.item }, { deviceId: 'dev-1', remember: () => {} });
      trusted = await openAgents(api, pk, approved.checkpoint);

      // 3. Edit hosts & title: SessionBot's prior key exposure triggers automatic rekey,
      //    updating ALL three live machines with the new hosts/title and preserving their policies!
      const hostEditVal: AgentItemValue = { ...initialVal, key: FAKE_NEXT, title: 'Payments v2', hosts: ['127.0.0.1:48080'], sendAs: 'header:x-api-key' };
      const hostEdit = await putAgentItem(api, trusted, pk, createdVault.vault, secretEdit.item, hostEditVal);
      const refreshed = await refreshEditedAgentItemGrants(api, trusted, pk, createdVault.vault, secretEdit.item, hostEdit.item, {
        vaultNames: new Map([[createdVault.vault.id, createdVault.vault.name]]),
      });
      expect(refreshed.refreshed).toBe(3);
      expect(refreshed.rekeyed).toBe(true);
      expect(refreshed.item.version).toBeGreaterThan(secretEdit.item.version);
      trusted = refreshed.trusted;

      const pSession = await pullMachine<AgentItemValue>(machineClient, idSession, marksSession);
      const pEach = await pullMachine<AgentItemValue>(machineClient, idEach, marksEach);
      const pStanding = await pullMachine<AgentItemValue>(machineClient, idStanding, marksStanding);
      expect(pSession.given[0]).toMatchObject({
        version: refreshed.item.version,
        listing: { title: 'Payments v2' },
        delivery: { hosts: ['127.0.0.1:48080'], sendAs: 'header:x-api-key' },
        grant: { approval: 'session', session: 600, bounds: { methods: ['GET'] } },
      });
      expect(pEach.given[0]).toMatchObject({
        version: refreshed.item.version,
        listing: { title: 'Payments v2' },
        delivery: { hosts: ['127.0.0.1:48080'], sendAs: 'header:x-api-key' },
        grant: { approval: 'each', uses: ['request', 'run'], bounds: { methods: ['GET', 'POST'] } },
      });
      expect(pStanding.given[0]).toMatchObject({
        version: refreshed.item.version,
        listing: { title: 'Payments v2' },
        delivery: { hosts: ['127.0.0.1:48080'], sendAs: 'header:x-api-key' },
        grant: { approval: 'standing' },
      });
      expect(pStanding.given[0]!.record?.value).toMatchObject({ key: FAKE_NEXT });

      // 4. Subsequent edit works immediately (nothing left stuck waiting for rekey).
      const hostEdit2 = await putAgentItem(api, trusted, pk, createdVault.vault, refreshed.item, { ...hostEditVal, hosts: ['127.0.0.1:49090'] });
      const refreshed2 = await refreshEditedAgentItemGrants(api, trusted, pk, createdVault.vault, refreshed.item, hostEdit2.item, {
        vaultNames: new Map([[createdVault.vault.id, createdVault.vault.name]]),
      });
      expect(refreshed2.refreshed).toBe(3);
      expect(refreshed2.rekeyed).toBe(false);
      const pEach2 = await pullMachine<AgentItemValue>(machineClient, idEach, pEach.marks);
      expect(pEach2.given[0]!.delivery.hosts).toEqual(['127.0.0.1:49090']);
    } finally {
      await running.close();
    }
  });
});
