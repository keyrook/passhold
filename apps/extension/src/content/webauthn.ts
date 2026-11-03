/**
 * Websites' passkeys, in the page's own world.
 *
 * A site asks for a passkey through `navigator.credentials`. This script runs
 * before the page's own and puts Passhold in front of the browser there: it
 * passes the request to Passhold's script in the isolated world (bridge.ts)
 * and hands back what comes — a passkey made, or a sign-in signed, in the
 * service worker after the person chose it in Passhold's own frame — or,
 * when Passhold has nothing to offer or the person picks another device,
 * calls the browser's own as if Passhold were not there.
 *
 * This is the page's world: the page can read and replace everything here,
 * so nothing here is trusted by anyone. Where a request comes from is what
 * Chrome tells the service worker about the frame; what is signed, and for
 * which site, is decided there; the page receives what any authenticator
 * would give it, and no more.
 */

const SOURCE = 'passhold-webauthn';
/** Longer than any site waits; the page's own timeout is shorter. */
const MAX_WAIT = 10 * 60_000;

type Outcome =
  | { type: 'credential'; credential: CredentialJSON }
  | { type: 'fallback' }
  | { type: 'error'; name: string; message: string };

interface CredentialJSON {
  id: string;
  rawId: string;
  type: 'public-key';
  authenticatorAttachment: string;
  response: Record<string, unknown>;
  clientExtensionResults: Record<string, unknown>;
}

(() => {
  if (!navigator.credentials || typeof CredentialsContainer === 'undefined' || typeof PublicKeyCredential === 'undefined' || !window.isSecureContext) return;

  // --- bytes ----------------------------------------------------------------------

  function encode(source: unknown): string {
    let bytes: Uint8Array;
    if (source instanceof ArrayBuffer) bytes = new Uint8Array(source);
    else if (ArrayBuffer.isView(source)) bytes = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    else throw new TypeError('not a BufferSource');
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decode(text: unknown): ArrayBuffer {
    const base64 = String(text).replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  /** Only the fields WebAuthn defines, copied out: a page's object may be anything at all. */
  const descriptors = (list: unknown) =>
    Array.isArray(list) ? list.map((entry: PublicKeyCredentialDescriptor) => ({ type: entry.type, id: encode(entry.id) })) : undefined;

  /** WebAuthn Level 3's hints, which this browser's types may not know yet. */
  function hintsOf(options: object): unknown[] | undefined {
    const hints = (options as { hints?: unknown }).hints;
    return Array.isArray(hints) ? [...(hints as unknown[])] : undefined;
  }

  function createOptions(options: PublicKeyCredentialCreationOptions): unknown {
    const selection = options.authenticatorSelection;
    return {
      rp: { id: options.rp.id, name: options.rp.name },
      user: { id: encode(options.user.id), name: options.user.name, displayName: options.user.displayName },
      challenge: encode(options.challenge),
      pubKeyCredParams: Array.isArray(options.pubKeyCredParams) ? options.pubKeyCredParams.map((param) => ({ type: param.type, alg: param.alg })) : undefined,
      excludeCredentials: descriptors(options.excludeCredentials),
      authenticatorSelection: selection && { authenticatorAttachment: selection.authenticatorAttachment },
      hints: hintsOf(options),
      extensions: { credProps: options.extensions?.credProps === true },
    };
  }

  function getOptions(options: PublicKeyCredentialRequestOptions): unknown {
    return {
      rpId: options.rpId,
      challenge: encode(options.challenge),
      allowCredentials: descriptors(options.allowCredentials),
      hints: hintsOf(options),
    };
  }

  // --- the answer, as the browser would give it ------------------------------------------

  /**
   * As the browser's own: its fields are read-only, its methods may be
   * replaced. Sites' libraries do replace them — GitHub's sets `toJSON` on
   * the credential it gets back, which throws on a read-only one.
   */
  function define<T extends object>(target: T, values: Record<string, unknown>): T {
    for (const [key, value] of Object.entries(values)) {
      const method = typeof value === 'function';
      Object.defineProperty(target, key, { value, enumerable: !method, writable: method, configurable: method });
    }
    return target;
  }

  /**
   * A credential a site cannot tell from the browser's: of the browser's own
   * classes (`instanceof PublicKeyCredential` holds), with every field and
   * method a site reads, `toJSON` included.
   */
  function credentialOf(op: 'create' | 'get', json: CredentialJSON): PublicKeyCredential {
    const r = json.response;
    const response =
      op === 'create'
        ? define(Object.create(AuthenticatorAttestationResponse.prototype) as AuthenticatorAttestationResponse, {
            clientDataJSON: decode(r.clientDataJSON),
            attestationObject: decode(r.attestationObject),
            getAuthenticatorData: () => decode(r.authenticatorData),
            getPublicKey: () => decode(r.publicKey),
            getPublicKeyAlgorithm: () => r.publicKeyAlgorithm,
            getTransports: () => [...(r.transports as string[])],
          })
        : define(Object.create(AuthenticatorAssertionResponse.prototype) as AuthenticatorAssertionResponse, {
            clientDataJSON: decode(r.clientDataJSON),
            authenticatorData: decode(r.authenticatorData),
            signature: decode(r.signature),
            userHandle: decode(r.userHandle),
          });
    return define(Object.create(PublicKeyCredential.prototype) as PublicKeyCredential, {
      id: json.id,
      rawId: decode(json.rawId),
      type: 'public-key',
      authenticatorAttachment: json.authenticatorAttachment,
      response,
      getClientExtensionResults: () => JSON.parse(JSON.stringify(json.clientExtensionResults)) as AuthenticationExtensionsClientOutputs,
      toJSON: () => JSON.parse(JSON.stringify(json)) as unknown,
    });
  }

  // --- talking to Passhold ----------------------------------------------------------------

  const waiting = new Map<string, (outcome: Outcome) => void>();

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data as { source?: unknown; kind?: unknown; id?: unknown; outcome?: Outcome } | null;
    if (!data || data.source !== SOURCE || data.kind !== 'result' || typeof data.id !== 'string') return;
    const resolve = waiting.get(data.id);
    if (!resolve || !data.outcome) return;
    waiting.delete(data.id);
    resolve(data.outcome);
  });

  const post = (message: Record<string, unknown>) => window.postMessage({ source: SOURCE, ...message }, location.origin);

  function ask(op: 'create' | 'get', options: unknown, conditional: boolean, signal: AbortSignal | undefined, timeout: unknown): Promise<Outcome> {
    const id = crypto.randomUUID();
    return new Promise((resolve) => {
      const end = (outcome: Outcome) => {
        if (!waiting.delete(id)) return;
        post({ kind: 'cancel', id });
        resolve(outcome);
      };
      waiting.set(id, resolve);
      post({ kind: 'request', id, op, options, conditional });
      signal?.addEventListener('abort', () => end({ type: 'error', name: 'AbortError', message: 'The operation was aborted.' }), { once: true });
      const wait = typeof timeout === 'number' && timeout > 0 ? Math.min(timeout, MAX_WAIT) : MAX_WAIT;
      if (!conditional) setTimeout(() => end({ type: 'error', name: 'NotAllowedError', message: 'The operation either timed out or was not allowed.' }), wait);
    });
  }

  function settle<T>(op: 'create' | 'get', outcome: Outcome, browsers: () => Promise<T>): Promise<T | PublicKeyCredential> {
    if (outcome.type === 'credential') return Promise.resolve(credentialOf(op, outcome.credential));
    if (outcome.type === 'fallback') return browsers();
    return Promise.reject(new DOMException(outcome.message, outcome.name));
  }

  /**
   * A sign-in the page started quietly, for the list under its username field.
   * Passhold's passkeys are offered in Passhold's list and the browser's in its
   * own: whichever the person picks answers, and the other stands down.
   */
  function conditional(
    options: CredentialRequestOptions,
    serial: unknown,
    browsers: (options: CredentialRequestOptions) => Promise<Credential | null>,
  ): Promise<Credential | null> {
    const passhold = new AbortController();
    const browser = new AbortController();
    const page = options.signal;
    page?.addEventListener(
      'abort',
      () => {
        passhold.abort(page.reason);
        browser.abort(page.reason);
      },
      { once: true },
    );
    return new Promise((resolve, reject) => {
      let failed = 0;
      let reason: unknown = new DOMException('The operation either timed out or was not allowed.', 'NotAllowedError');
      const failure = (error: unknown) => {
        if (error) reason = error;
        if (++failed === 2) reject(reason);
      };
      void ask('get', serial, true, passhold.signal, undefined).then((outcome) => {
        if (outcome.type !== 'credential') return failure(outcome.type === 'error' && page?.aborted ? page.reason : null);
        browser.abort();
        resolve(credentialOf('get', outcome.credential));
      });
      browsers({ ...options, signal: browser.signal }).then(
        (credential) => {
          passhold.abort();
          resolve(credential);
        },
        (error: unknown) => failure(error),
      );
    });
  }

  // --- in front of the browser ----------------------------------------------------------------

  /**
   * Put Passhold in front of one of the browser's methods without changing
   * how the method looks: on the same object (the prototype, not the
   * instance), with the same name and length, and `toString` still the
   * browser's "[native code]". Anti-bot checks — Cloudflare's among them —
   * read a page's browser functions to see whether a script replaced them, and
   * a plain function there fails the check, and with it the sign-in around it.
   */
  function intercept(owner: object, name: string, handler: (native: (...args: unknown[]) => unknown, self: unknown, args: unknown[]) => unknown): boolean {
    const descriptor = Object.getOwnPropertyDescriptor(owner, name);
    const native = descriptor?.value as ((...args: unknown[]) => unknown) | undefined;
    if (!descriptor || typeof native !== 'function') return false;
    const proxy = new Proxy(native, { apply: (target, self, args: unknown[]) => handler(target, self, args) });
    Object.defineProperty(owner, name, { ...descriptor, value: proxy });
    return true;
  }

  const browserCreate = (native: (...args: unknown[]) => unknown, self: unknown, options: unknown) => Reflect.apply(native, self, [options]) as Promise<Credential | null>;

  intercept(CredentialsContainer.prototype, 'create', (native, self, args) => {
    const options = args[0] as CredentialCreationOptions | undefined;
    const publicKey = options?.publicKey;
    const browsers = () => browserCreate(native, self, options);
    // Passwords, federated sign-in, a passkey made quietly after a password: the browser's.
    if (!options || !publicKey || options.signal?.aborted || (options as { mediation?: string }).mediation === 'conditional') return browsers();
    let serial: unknown;
    try {
      serial = createOptions(publicKey);
    } catch {
      return browsers();
    }
    return ask('create', serial, false, options.signal, publicKey.timeout).then((outcome) => settle('create', outcome, browsers));
  });

  intercept(CredentialsContainer.prototype, 'get', (native, self, args) => {
    const options = args[0] as CredentialRequestOptions | undefined;
    const publicKey = options?.publicKey;
    const browsers = (instead?: CredentialRequestOptions) => Reflect.apply(native, self, [instead ?? options]) as Promise<Credential | null>;
    if (!options || !publicKey || options.signal?.aborted || options.mediation === 'silent') return browsers();
    let serial: unknown;
    try {
      serial = getOptions(publicKey);
    } catch {
      return browsers();
    }
    if (options.mediation === 'conditional') return conditional(options, serial, browsers);
    return ask('get', serial, false, options.signal, publicKey.timeout).then((outcome) => settle('get', outcome, () => browsers()));
  });

  /** Whether Passhold here would answer a passkey request: asked of Passhold, through the bridge. */
  function passholdAnswers(): Promise<boolean> {
    const id = crypto.randomUUID();
    return new Promise((resolve) => {
      const listener = (event: MessageEvent) => {
        const data = event.data as { source?: unknown; kind?: unknown; id?: unknown; answers?: unknown } | null;
        if (event.source !== window || !data || data.source !== SOURCE || data.kind !== 'answers' || data.id !== id) return;
        window.removeEventListener('message', listener);
        resolve(data.answers === true);
      };
      window.addEventListener('message', listener);
      post({ kind: 'canAnswer', id });
      setTimeout(() => {
        window.removeEventListener('message', listener);
        resolve(false);
      }, 1000);
    });
  }

  // Sites offer to make a passkey only where they are told one can be made:
  // with Passhold, on any computer, fingerprint reader or not. Passhold is
  // asked only when the browser alone would say no.
  intercept(PublicKeyCredential, 'isUserVerifyingPlatformAuthenticatorAvailable', async (native, self, args) => {
    const alone = await (Reflect.apply(native, self, args) as Promise<boolean>).catch(() => false);
    return alone || passholdAnswers();
  });
  intercept(PublicKeyCredential, 'getClientCapabilities', async (native, self, args) => {
    const capabilities = (await Reflect.apply(native, self, args)) as Record<string, boolean>;
    if (capabilities.passkeyPlatformAuthenticator && capabilities.conditionalGet) return capabilities;
    if (!(await passholdAnswers())) return capabilities;
    return { ...capabilities, conditionalGet: true, passkeyPlatformAuthenticator: true, userVerifyingPlatformAuthenticator: true };
  });
})();
