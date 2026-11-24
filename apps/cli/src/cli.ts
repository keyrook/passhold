/**
 * The commands. Everything the program touches outside itself comes through
 * `Context`, so the tests run the same code against the account's real server
 * from the kit, with a terminal and a browser they play themselves.
 *
 * What a command prints for a person goes to the error stream; the output
 * stream carries only what was asked for — a value, a list, the line for
 * `eval` — so it can be piped.
 */
import { closeSync, fchmodSync, openSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { readFileSync as readBytes } from 'node:fs';
import { basename, extname } from 'node:path';
import { createSend, type Fetcher, type SignInProvider } from '@keyrook/account';
import {
  attachFile,
  attachmentsOf,
  codeFitsLogin,
  deleteStoredFile,
  detachFile,
  exportApiKeysCsv,
  exportCsv,
  fetchFile,
  fileFits,
  generatePassword,
  generateSshKey,
  isPassholdError,
  loginCopy,
  planAllows,
  readLinkedCodes,
  restoreLogin,
  restoreWalletItem,
  storeFile,
  totpCode,
  trashLogin,
  trashWalletItem,
  type Attachment,
  type GeneratorOptions,
  type Items,
  type Plan,
  type WalletItem,
} from '@passhold/core';
import { Account, OFFICIAL_API, VERSION, type Opened, type ProviderFlow } from './account.js';
import { agent } from './agent.js';
import { listen, openBrowser, type Listener } from './browser.js';
import { adding, assignments, draftWith, editing, KINDS, kindOf, type Kind } from './edit.js';
import {
  CliError,
  fieldOf,
  isLogin,
  isReference,
  itemNamed,
  locate,
  mainField,
  nameOf,
  OWN_VAULT,
  parseReference,
  referenceTo,
  resolve,
  SCHEME,
  vaultNamed,
  vaultsOf,
  vaultWord,
  type Item,
  type Vault,
} from './reference.js';
import { homeOf, Store, UNLOCK_MINUTES, type Unlocked } from './store.js';

export interface Context {
  /** What came after the program's name. */
  argv: string[];
  env: NodeJS.ProcessEnv;
  out(text: string): void;
  err(text: string): void;
  /** Asks at the terminal for something not to be shown as it is typed; a line of the input when there is no terminal. */
  secret(prompt: string): Promise<string>;
  /** Everything on the input, for `inject`. */
  input(): Promise<string>;
  /** Runs a command with an environment and hands back its exit code. */
  exec(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<number>;
  /** Bytes as they are, to the output stream: a file asked for with no `--out`. */
  write?(bytes: Uint8Array): void;
  /** Asks at the terminal for a line shown as it is typed: yes or no. */
  line?(prompt: string): Promise<string>;
  /**
   * Asks the person whether a key may sign, where they will see it: a
   * dialog, or the terminal the agent runs in. Absent where there is no way
   * to ask, and then `passhold ssh-agent` asks for none only when told to.
   */
  approve?: { how: string; ask(question: string): Promise<boolean> };
  /** Ends what runs until it is stopped: the SSH agent. */
  signal?: AbortSignal;
  /** Shows an address in the person's browser. The tests play the browser. */
  browse?(url: string, listener: Listener, flow: ProviderFlow): void;
  fetcher?: Fetcher;
  now?(): number;
}

const USAGE = `passhold ${VERSION}

  passhold login --google | --github | --email <address>
  passhold logout
  passhold status
  passhold unlock [--recovery-key | --with-browser] [--minutes <n>] [--raw]
  passhold lock

  passhold vaults
  passhold list [--vault <vault>] [--kind <kind>] [--search <words>] [--json]
  passhold get <passhold://vault/item/field | item> [--field <name>] [--json]
  passhold create <login|card|address|note|ssh|apikey> [--vault <vault>] [<field>=<value>…] [--generate] [--folder <name>]
  passhold edit <passhold://vault/item | item> [<field>=<value>…] [--generate] [--folder <name>]
  passhold delete <passhold://vault/item | item>
  passhold restore <passhold://vault/item | item>
  passhold compare <family>
  passhold generate [--length <n>] [--no-lower] [--no-upper] [--no-digits] [--no-symbols] [--ambiguous]
  passhold run [--env-file <file>] -- <command> [arguments]
  passhold inject [--in <file>] [--out <file>]
  passhold export [--format csv|json] [--kind apikey] [--out <file>] [--recovery-key]
  passhold totp <passhold://vault/item | item>
  passhold send [<text> | passhold://vault/item | --file <path>] [--opens <n>] [--expires 1h|1d|7d|30d] [--password]
  passhold file list <item>
  passhold file add <item> <path>
  passhold file get <item> <file> [--out <path>]
  passhold file rm <item> <file>
  passhold ssh-agent [--socket <path>] [--no-confirm]

A reference is passhold://vault/item/field. The vault's own is "${OWN_VAULT}",
a family's shared vault is its name; an item is its id or its name; a field
is one of the item's kind (password, username, url, notes, number,
private_key, key, key_id…) or one of its own, by name. In <field>=<value>, a value of -
is asked for, unseen, and @<path> is read from a file.

  eval "$(passhold unlock)"          unlocks for ${UNLOCK_MINUTES} minutes in this shell
  DB_PASSWORD=passhold://${OWN_VAULT}/Database/password passhold run -- ./deploy.sh
  passhold inject --in config.tpl --out config.yml     fills each {{ passhold://… }}
  passhold totp passhold://${OWN_VAULT}/GitHub          the 2FA code the link with Keyrook Authenticator holds for it
  passhold send --file report.pdf --opens 2 --expires 7d     prints a link, shown once
  passhold file add passhold://${OWN_VAULT}/Passport scan.pdf     sealed here, kept with the item
  passhold file get Passport scan.pdf --out scan.pdf            or to the output, with no --out
  passhold create apikey title=Payments key=- expires=2027-06-30     the service, its hosts and variable from the key
  STRIPE_API_KEY=passhold://${OWN_VAULT}/Payments/key passhold run -- npm test
  passhold create login --vault Family title=Netflix username=us@example.com url=https://netflix.com --generate
  passhold edit passhold://Family/Netflix password=-   asks for the new password, unseen
  passhold ssh-agent                                   signs with the vaults' SSH keys; asks each time
`;

const HOUR = 3_600_000;
/** How long a Send lasts, as `--expires` names it. */
const LIFETIMES: Record<string, number> = { '1h': HOUR, '1d': 24 * HOUR, '7d': 7 * 24 * HOUR, '30d': 30 * 24 * HOUR };
/** A copy's field names, as the extension writes them in English. */
const COPY_LABELS = { username: 'Username', password: 'Password', website: 'Website', notes: 'Notes' };

interface Args {
  positional: string[];
  flags: Map<string, string | true>;
  /** What came after `--`: for `run`, the command. */
  rest: string[];
}

/** Flags that take no value; any other takes the word after it, or what follows `=`. */
const SWITCHES = new Set(['google', 'github', 'json', 'raw', 'recovery-key', 'with-browser', 'password', 'no-lower', 'no-upper', 'no-digits', 'no-symbols', 'ambiguous', 'generate', 'no-confirm', 'help', 'version']);

function parse(argv: string[]): Args {
  const args: Args = { positional: [], flags: new Map(), rest: [] };
  for (let at = 0; at < argv.length; at++) {
    const word = argv[at]!;
    if (word === '--') {
      args.rest = argv.slice(at + 1);
      break;
    }
    if (!word.startsWith('--')) {
      args.positional.push(word);
      continue;
    }
    const [name, inline] = word.slice(2).split(/=(.*)/s) as [string, string | undefined];
    if (SWITCHES.has(name)) args.flags.set(name, true);
    else if (inline !== undefined) args.flags.set(name, inline);
    else if (at + 1 < argv.length) args.flags.set(name, argv[++at]!);
    else throw new CliError(`--${name} needs a value.`);
  }
  return args;
}

const text = (args: Args, name: string): string | undefined => {
  const value = args.flags.get(name);
  return typeof value === 'string' ? value : undefined;
};

function whole(args: Args, name: string, fallback: number, min: number, max: number): number {
  const given = text(args, name);
  if (given === undefined) return fallback;
  const value = Number(given);
  if (!Number.isInteger(value) || value < min || value > max) throw new CliError(`--${name} is a whole number from ${min} to ${max}.`);
  return value;
}

/** An item for a list or `--json`: what it holds, never a website's passkey's private key, its earlier versions, nor what opens its files. */
function shown(item: Item): Record<string, unknown> {
  const { versions: _, detached: ___, ...kept } = item;
  const rest = kept.attachments ? { ...kept, attachments: kept.attachments.map(({ key: ____, ...file }) => file) } : kept;
  if (!isLogin(item)) {
    // An API key's earlier keys, as a login's earlier passwords, are not part of what it is now.
    if (item.kind !== 'apikey') return rest;
    const { history: _____, ...apiKey } = rest as typeof item;
    return apiKey;
  }
  const { history: __, passkey, ...login } = rest as typeof item;
  return { kind: 'login', ...login, passkey: passkey ? { rpId: passkey.rpId, userName: passkey.userName } : null };
}

/** Whether the vaults a reference or a name could be in are more than the vault's own. */
function reachesShared(targets: readonly string[]): boolean {
  return targets.some((target) => {
    if (!isReference(target)) return true;
    try {
      return decodeURIComponent(target.slice(SCHEME.length).split('/')[0] ?? '').trim().toLowerCase() !== OWN_VAULT;
    } catch {
      return true;
    }
  });
}

/** A vault as `vaults` and a listing name it: the family's name before a shared vault's own. */
const placeName = (vault: Vault) => (vault.family ? `${vault.family} / ${vault.name}` : vault.name);

/** What the vault's own refusals mean at a terminal. */
const REFUSALS: Record<string, string> = {
  itemInvalid: 'That is not an item Passhold can keep: a login needs at least a title, a username or a password.',
  itemNotFound: 'That item is not there any more.',
};

export async function run(context: Context): Promise<number> {
  try {
    return await command(context);
  } catch (error) {
    if (error instanceof CliError) context.err(`${error.message}\n`);
    else if (isPassholdError(error)) context.err(`${REFUSALS[error.code] ?? `Passhold refused that (${error.code}).`}\n`);
    else context.err(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

async function command(context: Context): Promise<number> {
  const [name, ...after] = context.argv;
  const args = parse(after);
  const now = context.now ?? Date.now;
  const store = new Store(homeOf(context.env));
  const account = new Account(store, (context.env.PASSHOLD_API ?? OFFICIAL_API).replace(/\/+$/, ''), context.fetcher, context.env);
  const say = (line: string) => context.err(`${line}\n`);

  /**
   * The vaults, for a command that reads them: the unlock, then the plan as
   * the server names it, then the account's records; with `shared`, each
   * family's too.
   */
  const open = async (shared = true): Promise<Opened & { unlocked: Unlocked; plan: Plan }> => {
    const unlocked = await store.session(context.env.PASSHOLD_SESSION, now());
    const plan = await account.requirePlan('cli');
    return { ...(await account.open(unlocked, { shared }, say)), unlocked, plan };
  };
  const reader = { secret: (prompt: string) => context.secret(prompt), file: (path: string) => readFileSync(path, 'utf8') };

  if (!name || name === 'help' || args.flags.has('help') || name === '--help') {
    context.out(USAGE);
    return 0;
  }
  if (name === 'version' || name === '--version' || args.flags.has('version')) {
    context.out(`${VERSION}\n`);
    return 0;
  }

  switch (name) {
    case 'login': {
      const email = text(args, 'email');
      if (email) {
        const signedIn = await account.signInWithPassword(email, await context.secret('Password: '), () => context.secret('Code from your authenticator app: '));
        say(`Signed in as ${signedIn.email}. Next: eval "$(passhold unlock)"`);
        return 0;
      }
      const provider: SignInProvider | null = args.flags.has('google') ? 'google' : args.flags.has('github') ? 'github' : null;
      if (!provider) throw new CliError('Say how: passhold login --google, --github, or --email <address>');
      const offered = await account.providers();
      if (!offered.includes(provider)) {
        throw new CliError(`This server does not hand a sign-in with ${provider === 'google' ? 'Google' : 'GitHub'} back to an app yet. Sign in with: passhold login --email <address>`);
      }
      const listener = await listen();
      try {
        const flow = await account.startProvider(provider, listener.port);
        say('Opening your browser to sign in. If it does not open, go to:');
        say(`  ${flow.url}`);
        if (context.browse) context.browse(flow.url, listener, flow);
        else openBrowser(flow.url);
        const signedIn = await account.finishProvider(flow, await listener.answerFor(flow.state));
        say(`Signed in as ${signedIn.email}. Next: eval "$(passhold unlock --with-browser)", or --recovery-key`);
        return 0;
      } finally {
        listener.close();
      }
    }

    case 'logout':
      await account.signOut();
      say('Signed out, and locked.');
      return 0;

    case 'status': {
      const signedIn = store.account();
      if (!signedIn?.tokens) {
        say('Not signed in.');
        return 1;
      }
      say(`Signed in as ${signedIn.email} at ${signedIn.api}.`);
      try {
        const unlocked = await store.session(context.env.PASSHOLD_SESSION, now());
        say(`Unlocked for ${Math.max(1, Math.round((unlocked.expiresAt - now()) / 60_000))} more minutes.`);
      } catch (error) {
        say(error instanceof CliError ? error.message : 'Locked.');
      }
      return 0;
    }

    case 'unlock': {
      const minutes = whole(args, 'minutes', UNLOCK_MINUTES, 1, 24 * 60);
      account.signedIn();
      let session: string;
      if (args.flags.has('with-browser')) {
        say('Open Passhold in a browser signed in to this account. It will ask to let this terminal in.');
        session = await account.unlockWithBrowser(
          {
            onCode: (code) => say(`Check that the browser shows this code, then approve there:  ${code}`),
            wait: (milliseconds) => new Promise((done) => setTimeout(done, milliseconds)),
          },
          minutes,
          now(),
        );
      } else if (args.flags.has('recovery-key')) {
        session = await account.unlockWithRecoveryKey(await context.secret('Recovery key: '), minutes, now());
      } else {
        session = await account.unlockWithPassword(await context.secret('Account password: '), minutes, now());
      }
      // For `eval`: the key lives in the shell's memory, never in a file.
      context.out(args.flags.has('raw') ? `${session}\n` : `export PASSHOLD_SESSION="${session}"\n`);
      say(`Unlocked for ${minutes} minutes.`);
      return 0;
    }

    case 'lock':
      store.lock();
      say('Locked.');
      return 0;

    case 'generate': {
      const options: Partial<GeneratorOptions> = {
        ...(text(args, 'length') !== undefined ? { length: whole(args, 'length', 20, 8, 128) } : {}),
        ...(args.flags.has('no-lower') ? { lower: false } : {}),
        ...(args.flags.has('no-upper') ? { upper: false } : {}),
        ...(args.flags.has('no-digits') ? { digits: false } : {}),
        ...(args.flags.has('no-symbols') ? { symbols: false } : {}),
        ...(args.flags.has('ambiguous') ? { avoidAmbiguous: false } : {}),
      };
      context.out(`${generatePassword(options)}\n`);
      return 0;
    }

    case 'vaults': {
      const { data } = await open();
      for (const vault of vaultsOf(data)) {
        const count = vault.items.filter((item) => item.deletedAt === null).length;
        const access = vault.viewOnly ? 'view only' : vault.keyDue ? 'waiting for new keys' : 'edit';
        context.out(`${[vaultWord(data, vault), placeName(vault), access, `${count} item${count === 1 ? '' : 's'}`].join('\t')}\n`);
      }
      const gone = account.readDepartures();
      for (const { family, email } of gone) say(`${email} has left ${data.families.find((entry) => entry.orgId === family)?.name ?? family}.`);
      return 0;
    }

    case 'list': {
      const only = text(args, 'vault');
      const { data } = await open(only === undefined || reachesShared([`${SCHEME}${encodeURIComponent(only)}/`]));
      const words = (text(args, 'search') ?? '').toLowerCase().split(/\s+/).filter(Boolean);
      const kind = text(args, 'kind') as Kind | undefined;
      if (kind !== undefined && !KINDS.includes(kind)) throw new CliError(`--kind is one of ${KINDS.join(', ')}.`);
      const vaults = only === undefined ? vaultsOf(data) : [vaultNamed(data, only)];
      const items = vaults
        .flatMap((vault) => vault.items.filter((item) => item.deletedAt === null).map((item) => ({ vault, item })))
        .filter(({ item }) => {
          if (kind !== undefined && kindOf(item) !== kind) return false;
          // An API key is found by its service, id and hosts too — never by the key.
          const said = isLogin(item) ? `${item.username} ${item.urls.join(' ')}` : item.kind === 'apikey' ? `${item.service} ${item.keyId} ${item.hosts.join(' ')} ${item.environment}` : '';
          const haystack = [nameOf(item), said, item.folder].join(' ').toLowerCase();
          return words.every((word) => haystack.includes(word));
        })
        .sort((a, b) => nameOf(a.item).localeCompare(nameOf(b.item)) || a.vault.name.localeCompare(b.vault.name));
      if (args.flags.has('json')) {
        const listed = items.map(({ vault, item }) => ({
          id: item.id,
          vault: vaultWord(data, vault),
          kind: kindOf(item),
          name: nameOf(item),
          username: isLogin(item) ? item.username : undefined,
          reference: referenceTo(item, mainField(item), vaultWord(data, vault)),
        }));
        context.out(`${JSON.stringify(listed, null, 2)}\n`);
      } else {
        for (const { vault, item } of items) context.out(`${[item.id, kindOf(item), nameOf(item), isLogin(item) ? item.username : '', vaultWord(data, vault)].join('\t')}\n`);
      }
      return 0;
    }

    case 'get': {
      const target = args.positional[0];
      if (!target) throw new CliError('Say what: passhold get <passhold://vault/item/field | item>');
      const { data } = await open(reachesShared([target]));
      if (isReference(target) && target.slice(SCHEME.length).split('/').length === 3) {
        context.out(`${resolve(data, parseReference(target))}\n`);
        return 0;
      }
      const { item } = locate(data, target);
      if (args.flags.has('json')) context.out(`${JSON.stringify(shown(item), null, 2)}\n`);
      else context.out(`${fieldOf(item, text(args, 'field') ?? mainField(item))}\n`);
      return 0;
    }

    case 'create': {
      const kind = args.positional[0] as Kind | undefined;
      if (!kind || !KINDS.includes(kind)) throw new CliError(`Say what to make: passhold create <${KINDS.join('|')}> [<field>=<value>…]`);
      const named = text(args, 'vault') ?? OWN_VAULT;
      const opened = await open(reachesShared([`${SCHEME}${encodeURIComponent(named)}/`]));
      const vault = vaultNamed(opened.data, named);
      writable(vault);
      const given = await assignments(args.positional.slice(1), reader);
      const extra = await generated(kind, args, given);
      const draft = await draftWith(kind, null, given, { ...extra, ...(text(args, 'folder') !== undefined ? { folder: text(args, 'folder')! } : {}) });
      const id = await account.write(opened.unlocked, opened, vault, adding(kind, draft, now()));
      const word = vaultWord(opened.data, vault);
      context.out(`${SCHEME}${encodeURIComponent(word)}/${id}\n`);
      say(`Saved in ${placeName(vault)}.`);
      return 0;
    }

    case 'edit': {
      const target = args.positional[0];
      if (!target) throw new CliError('Say which: passhold edit <passhold://vault/item | item> [<field>=<value>…]');
      const opened = await open(reachesShared([target]));
      const { vault, item } = locate(opened.data, target);
      writable(vault);
      const given = await assignments(args.positional.slice(1), reader);
      const extra = await generated(kindOf(item), args, given);
      const folder = text(args, 'folder');
      if (!given.length && !Object.keys(extra).length && folder === undefined) throw new CliError('Say what to change: <field>=<value>, --generate or --folder.');
      const draft = await draftWith(kindOf(item), item, given, { ...extra, ...(folder !== undefined ? { folder } : {}) });
      await account.write(opened.unlocked, opened, vault, editing(item, draft, now(), planAllows(opened.plan, 'versions')));
      say(`Saved "${nameOf(item)}" in ${placeName(vault)}.`);
      return 0;
    }

    case 'delete':
    case 'restore': {
      const target = args.positional[0];
      if (!target) throw new CliError(`Say which: passhold ${name} <passhold://vault/item | item>`);
      const opened = await open(reachesShared([target]));
      const { vault, item } = locate(opened.data, target, name === 'restore');
      writable(vault);
      const at = now();
      await account.write(opened.unlocked, opened, vault, <T extends Items>(items: T) => ({
        items: name === 'delete' ? (isLogin(item) ? trashLogin(items, item.id, at) : trashWalletItem(items, item.id, at)) : isLogin(item) ? restoreLogin(items, item.id, at) : restoreWalletItem(items, item.id, at),
        id: item.id,
      }));
      const back = `${SCHEME}${encodeURIComponent(vaultWord(opened.data, vault))}/${item.id}`;
      // Only its owner empties the trash: nothing here destroys an item.
      say(name === 'delete' ? `"${nameOf(item)}" is in the trash of ${placeName(vault)}. To bring it back: passhold restore ${back}` : `"${nameOf(item)}" is back in ${placeName(vault)}.`);
      return 0;
    }

    case 'compare': {
      const family = args.positional.join(' ').trim();
      if (!family) throw new CliError('Say which family: passhold compare <family>');
      const unlocked = await store.session(context.env.PASSHOLD_SESSION, now());
      await account.requirePlan('cli');
      const ask = context.line ?? context.secret;
      const trusted = await account.compare(unlocked, family, async (who, code) => {
        say(`Ask ${who} to open their account page at account.keyrook.com, at this family, and read the code beside your name.`);
        return /^y(es)?$/i.test((await ask(`Does it read ${code}? [y/N] `)).trim());
      });
      say(trusted ? `Taken: ${trusted} key${trusted === 1 ? '' : 's'} compared.` : 'Nothing to compare: every key in it is one this terminal has taken.');
      return 0;
    }

    case 'file': {
      const [verb, target, which] = args.positional;
      if (!verb || !target || !['list', 'add', 'get', 'rm'].includes(verb)) throw new CliError('Say what: passhold file list|add|get|rm <item> …');
      // Files are kept with the vault's own items: a shared vault's are not reached from here yet.
      if (isReference(target) && reachesShared([target])) throw new CliError(`Files are kept here with the vault's own items only, in ${SCHEME}${OWN_VAULT}/…`);
      const { data, unlocked } = await open(false);
      const item = itemNamed(data, target);
      // The store's addresses are the server's to give; the tests' server answers them itself.
      const transfer: Fetcher = context.fetcher ?? ((input, init) => fetch(input, init));
      if (verb === 'list') {
        const files = attachmentsOf(item);
        if (args.flags.has('json')) context.out(`${JSON.stringify(files.map(({ key: _, ...file }) => file), null, 2)}\n`);
        else for (const file of files) context.out(`${[file.id, file.size, file.name].join('\t')}\n`);
        if (!files.length) say(`${nameOf(item)} has no files.`);
        return 0;
      }
      if (!which) throw new CliError(verb === 'add' ? 'Say which file: passhold file add <item> <path>' : `Say which file: passhold file ${verb} <item> <file>`);
      const { api } = await account.paid(unlocked);
      if (verb === 'add') {
        const size = statSync(which).size;
        if (!fileFits(size)) throw new CliError('That file is too large: Passhold keeps files of up to 500 MB.');
        const added = await storeFile(api, { bytes: new Uint8Array(readBytes(which)), name: basename(which), type: typeOf(which), place: null }, transfer, now());
        try {
          await account.writeItem(unlocked, item.id, (vault) => attachFile(vault, item.id, added, now()));
        } catch (error) {
          // Named by no item, it would take room and open for no one.
          await deleteStoredFile(api, added.id).catch(() => undefined);
          throw error;
        }
        context.out(`${added.id}\n`);
        say(`Sealed and kept with ${nameOf(item)}.`);
        return 0;
      }
      const file = fileOf(attachmentsOf(item), which);
      if (verb === 'get') {
        const bytes = await fetchFile(() => api.fileAddress(file.id), file, transfer);
        const out = text(args, 'out');
        // What is written is the file in plain text: for its owner alone.
        if (out) writeFileSync(out, bytes, { mode: 0o600 });
        else if (context.write) context.write(bytes);
        else context.out(new TextDecoder().decode(bytes));
        if (out) say(`Wrote ${file.name} to ${out}.`);
        return 0;
      }
      // Taken off the item first: a file deleted while an item still names it would be a line that opens nothing.
      await account.writeItem(unlocked, item.id, (vault) => detachFile(vault, item.id, file.id, now()));
      await deleteStoredFile(api, file.id);
      say(`Deleted ${file.name} from ${nameOf(item)}.`);
      return 0;
    }

    case 'ssh-agent':
      return agent(context, { store, account, now, say, socket: text(args, 'socket'), confirm: !args.flags.has('no-confirm') });

    case 'run': {
      const [program, ...programArgs] = args.rest;
      if (!program) throw new CliError('Say what to run: passhold run -- <command> [arguments]');
      const given: NodeJS.ProcessEnv = { ...context.env, ...envFile(text(args, 'env-file')) };
      const references = Object.entries(given).filter(([, value]) => value !== undefined && isReference(value));
      const data = references.length ? (await open(reachesShared(references.map(([, value]) => value!)))).data : null;
      const env: NodeJS.ProcessEnv = { ...given };
      for (const [key, value] of references) env[key] = resolve(data!, value!);
      // The command gets what it asked for and no way to ask for more. Windows reads a variable's name in any case, so every spelling goes.
      for (const key of Object.keys(env)) if (key.toUpperCase() === 'PASSHOLD_SESSION') delete env[key];
      return context.exec(program, programArgs, env);
    }

    case 'inject': {
      const source = text(args, 'in');
      const template = source ? readFileSync(source, 'utf8') : await context.input();
      const wanted = [...template.matchAll(TEMPLATE)];
      const data = wanted.length ? (await open(reachesShared(wanted.map((found) => found[1]!)))).data : null;
      const filled = template.replace(TEMPLATE, (_, reference: string) => resolve(data!, reference));
      const target = text(args, 'out');
      // What is written holds secrets: for its owner alone. A mode given to open applies only to a file it makes,
      // so one already there, readable by others, is closed to them before a byte of it is written.
      if (target) {
        const file = openSync(target, 'w', 0o600);
        try {
          if (process.platform !== 'win32') fchmodSync(file, 0o600);
          writeFileSync(file, filled);
        } finally {
          closeSync(file);
        }
      } else context.out(filled);
      return 0;
    }

    case 'export': {
      const format = text(args, 'format') ?? 'csv';
      if (format !== 'csv' && format !== 'json') throw new CliError('--format is csv or json.');
      const { data, unlocked } = await open(false);
      // Everything out in plain text asks for its owner again, as the extension does: an unlocked shell is not proof of who sits at it.
      await account.prove(unlocked, args.flags.has('recovery-key') ? { recoveryKey: await context.secret('Recovery key: ') } : { password: await context.secret('Account password, to export: ') });
      const kind = text(args, 'kind');
      if (kind !== undefined && kind !== 'apikey') throw new CliError('--kind is apikey: a CSV file of API keys. Logins are the CSV without it; --format json writes everything.');
      if (kind && format !== 'csv') throw new CliError('--kind apikey writes a CSV file.');
      const items = vaultNamed(data, OWN_VAULT).items.filter((item) => item.deletedAt === null);
      const wallet = items.filter((item): item is WalletItem => !isLogin(item));
      const written = kind ? exportApiKeysCsv(wallet) : format === 'csv' ? exportCsv(items.filter(isLogin)) : `${JSON.stringify({ items: items.filter(isLogin), wallet }, null, 2)}\n`;
      const target = text(args, 'out');
      if (target) writeFileSync(target, written, { mode: 0o600 });
      else context.out(written);
      say(
        kind
          ? 'API keys, in plain text. Keep the file only as long as you need it.'
          : format === 'csv'
            ? 'Logins only: a CSV file has no place for cards, addresses, notes or SSH keys. --kind apikey writes API keys; --format json writes everything.'
            : 'Everything in the vault, in plain text. Keep it only as long as you need it.',
      );
      return 0;
    }

    case 'totp': {
      const target = args.positional[0];
      if (!target) throw new CliError('Say which login: passhold totp <passhold://vault/item | item>');
      const { data, unlocked } = await open(reachesShared([target]));
      const item = itemNamed(data, target);
      if (!isLogin(item)) throw new CliError('A 2FA code goes with a login.');
      const { api, productKey } = await account.paid(unlocked);
      const linked = await readLinkedCodes(api, productKey);
      if (linked.status === 'off') throw new CliError('Passhold and Keyrook Authenticator are not linked. Link them on account.keyrook.com/#links.');
      if (linked.status === 'premium') throw new CliError('2FA codes in Passhold are part of Premium. Every code is still in Keyrook Authenticator.');
      // Matched by the site, as the extension matches it: never by anything the server says.
      const code = linked.codes.find((entry) => codeFitsLogin(entry.websites, item));
      if (!code) throw new CliError(`No 2FA code goes with ${nameOf(item)}. Add one in Passhold or Keyrook Authenticator.`);
      context.out(`${(await totpCode(code, now())).code}\n`);
      return 0;
    }

    case 'send': {
      const opens = whole(args, 'opens', 1, 1, 100);
      const lifetime = LIFETIMES[text(args, 'expires') ?? '1d'];
      if (!lifetime) throw new CliError('--expires is 1h, 1d, 7d or 30d.');
      const path = text(args, 'file');
      const target = args.positional.join(' ');
      const { data, unlocked } = await open(isReference(target) && reachesShared([target]));
      let body: { text?: string; item?: ReturnType<typeof loginCopy> } = {};
      if (isReference(target)) {
        const item = itemNamed(data, target);
        if (!isLogin(item)) throw new CliError('A copy is sent of a login. Send a note\'s text as text.');
        // A copy of a login is plain text out to whoever has the link: its owner, again, as for an export.
        await account.prove(unlocked, args.flags.has('recovery-key') ? { recoveryKey: await context.secret('Recovery key: ') } : { password: await context.secret('Account password, to send a copy: ') });
        body = { item: loginCopy(item, COPY_LABELS) };
      } else if (target) {
        body = { text: target };
      } else if (!path) {
        body = { text: await context.input() };
      }
      const files = path ? [{ name: basename(path), type: 'application/octet-stream', bytes: new Uint8Array(readBytes(path)) }] : [];
      const password = args.flags.has('password') ? await context.secret('Password for the link: ') : '';
      const { api } = await account.paid(unlocked);
      // A file goes straight to where the server says; the tests' server answers that address itself.
      const transfer: Fetcher = context.fetcher ?? ((input, init) => fetch(input, init));
      const { url, send } = await createSend(api, { body, ...(files.length ? { files } : {}), opens, lifetime, ...(password ? { password } : {}) }, transfer);
      context.out(`${url}\n`);
      say(`Opens ${send.opensLeft} time${send.opensLeft === 1 ? '' : 's'}, until ${new Date(send.expiresAt).toISOString()}. The link is shown only now: nothing keeps it.`);
      return 0;
    }

    default:
      throw new CliError(`No command "${name}". Run: passhold help`);
  }
}

/** One of an item's files, by its id or by a name only one of them has. */
function fileOf(files: readonly Attachment[], wanted: string): Attachment {
  const byId = files.find((file) => file.id === wanted);
  if (byId) return byId;
  const named = files.filter((file) => file.name === wanted);
  if (named.length === 1) return named[0]!;
  if (!named.length) throw new CliError(`No file named "${wanted}" is kept with that item. passhold file list <item> lists them.`);
  throw new CliError(`${named.length} files are named "${wanted}". Use an id: ${named.map((file) => file.id).join(', ')}`);
}

/** A file's type by its name, as a browser would say it, for the extension to show it by; '' for any other. */
const TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  txt: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  json: 'application/json',
  zip: 'application/zip',
};
const typeOf = (path: string) => TYPES[extname(path).slice(1).toLowerCase()] ?? '';

/** A vault this account may change: not one it may only view, nor one whose key someone gone still holds. */
function writable(vault: Vault): void {
  if (vault.viewOnly) throw new CliError(`You can view ${vault.name}, not change it.`);
  if (vault.keyDue) throw new CliError(`Someone who left ${vault.family} still holds the key to ${vault.name}. Nothing is written to it until an organiser changes it, as their Passhold does when it syncs.`);
}

/** `--generate`: a password for a login, made as `passhold generate` makes one; a new Ed25519 key for an SSH key. */
async function generated(kind: Kind, args: Args, given: readonly { field: string; value: string }[]): Promise<{ password?: string; privateKey?: string }> {
  if (!args.flags.has('generate')) return {};
  // The key's comment is its name, as `ssh-keygen -C` gives one and the extension does.
  if (kind === 'ssh') return { privateKey: (await generateSshKey(given.find((entry) => entry.field.toLowerCase() === 'title')?.value ?? '')).privateKey };
  if (kind !== 'login') throw new CliError('--generate makes a password for a login, or a key for an SSH key.');
  return { password: generatePassword(text(args, 'length') !== undefined ? { length: whole(args, 'length', 20, 8, 128) } : {}) };
}

/** `{{ passhold://vault/item/field }}`: a reference in a template, with any space inside the braces. */
const TEMPLATE = /\{\{\s*(passhold:\/\/[^\s{}]+)\s*\}\}/g;

/** `NAME=value` lines; a `#` line is a comment, and quotes around a value are taken off. */
function envFile(path: string | undefined): NodeJS.ProcessEnv {
  if (!path) return {};
  const env: NodeJS.ProcessEnv = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const entry = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!entry || line.trimStart().startsWith('#')) continue;
    env[entry[1]!] = entry[2]!.replace(/^(['"])(.*)\1$/, '$2');
  }
  return env;
}
