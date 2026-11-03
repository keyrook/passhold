/**
 * What every importer gives back, gathered the same way whatever the file:
 * each login, card, address and note cleaned as one typed by hand, what the
 * vault already holds left out, and a login's two-step secret counted and
 * kept nowhere.
 */
import { cleanDraft } from '../vault/items.js';
import type { ImportedLogin, LoginDraft, PasskeyFor, StoredPasskey, VaultData, WalletDraft, WalletItem } from '../vault/model.js';
import { cleanWalletDraft } from '../vault/wallet.js';

export const MAX_IMPORT_BYTES = 20 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 50_000;

export type ImportFormat =
  | 'chrome'
  | 'firefox'
  | 'apple'
  | 'bitwarden'
  | 'onepassword'
  | 'lastpass'
  | 'keepass'
  | 'dashlane'
  | 'proton'
  | 'nordpass'
  | 'generic';

export interface ImportResult {
  format: ImportFormat;
  /** New logins, with the website's passkey each held, if any. */
  drafts: ImportedLogin[];
  /** Passkeys for logins the vault already has, which hold none. */
  passkeys: PasskeyFor[];
  /**
   * Passkeys the file holds that cannot come: of a kind Passhold does not
   * sign with, for no site of their own or the Keyrook account, or a second
   * for one login. The page says how many, as it does two-step secrets.
   */
  passkeysLeft: number;
  /** The cards, addresses and notes the file holds, for the wallet. */
  wallet: WalletDraft[];
  /** Entries Passhold keeps nothing of — folders, aliases, bank accounts, IDs, SSH keys — or that hold nothing at all. */
  skipped: number;
  /** Entries the vault already holds: a login's site, username and password; a card's number; an address's name and street; a note's words. */
  duplicates: number;
  /**
   * Logins with a two-step secret. Passhold keeps none — they are an
   * authenticator app's to keep — so the page says how many, before the old
   * manager is deleted with them still in it.
   */
  twoFactor: number;
}

/** What a JSON value holds, or null: a file is untrusted, and what is not what its exporter writes is read as nothing. */
export function json(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export const str = (value: unknown): string => (typeof value === 'string' ? value : '');

/** A month or a year as written, "04" or "2031"; the vault checks it is one. */
export const whole = (text: string): number | null => (/^\d{1,4}$/.test(text.trim()) ? Number(text.trim()) : null);

/** A login already in the vault, or earlier in the file: which, and whether it has a passkey. */
interface Seen {
  id: string | null;
  index: number;
  passkey: boolean;
}

export function collector(vault: Pick<VaultData, 'items' | 'wallet'>) {
  const live = vault.items.filter((item) => item.deletedAt === null);
  const known = new Map<string, Seen>();
  for (const item of live) if (!known.has(fingerprint(item))) known.set(fingerprint(item), { id: item.id, index: -1, passkey: item.passkey !== null });
  const credentials = new Set(live.flatMap((item) => (item.passkey ? [item.passkey.credentialId] : [])));
  const knownWallet = new Set(vault.wallet.filter((item) => item.deletedAt === null).map(walletPrint));
  const drafts: ImportedLogin[] = [];
  const passkeys: PasskeyFor[] = [];
  const wallet: WalletDraft[] = [];
  let skipped = 0;
  let duplicates = 0;
  let twoFactor = 0;
  let passkeysLeft = 0;

  return {
    /**
     * A login, and the website's passkey it held. The same login already
     * here takes the passkey if it has none, so a password saved before and
     * a passkey brought now are one login, as they were in the other manager.
     */
    login(raw: LoginDraft, held: StoredPasskey | null = null) {
      let draft: LoginDraft;
      try {
        // A folder or fields the file left empty are no part of what it brings.
        const { folder, fields, ...rest } = cleanDraft(raw);
        draft = { ...rest, ...(folder ? { folder } : {}), ...(fields?.length ? { fields } : {}) };
      } catch {
        skipped++;
        return;
      }
      // A passkey the vault, or this file, has already.
      const passkey = held && !credentials.has(held.credentialId) ? held : null;
      if (passkey) credentials.add(passkey.credentialId);
      const print = fingerprint(draft);
      const seen = known.get(print);
      if (seen && !(passkey && seen.passkey)) {
        duplicates++;
        if (!passkey) return;
        seen.passkey = true;
        if (seen.id) passkeys.push({ id: seen.id, passkey });
        else drafts[seen.index] = { ...drafts[seen.index]!, passkey };
        return;
      }
      // New, or the same login with another passkey than the one it has: one login per passkey.
      if (!seen) known.set(print, { id: null, index: drafts.length, passkey: passkey !== null });
      drafts.push(passkey ? { ...draft, passkey } : draft);
    },
    passkeyLeft() {
      passkeysLeft++;
    },
    /**
     * Into the wallet. What does not read as a card or an address is kept as
     * a note of the words it came with, if it has any — in the folder the
     * file had it in, either way.
     */
    keep(draft: WalletDraft | null, title: string, words: string, folder = '') {
      const filed = draft && draft.folder === undefined && folder ? { ...draft, folder } : draft;
      const clean = (filed && cleanWalletDraft(filed)) ?? (words.trim() ? cleanWalletDraft({ kind: 'note', title, text: words, folder }) : null);
      if (!clean) {
        skipped++;
        return;
      }
      const print = walletPrint(clean);
      if (knownWallet.has(print)) {
        duplicates++;
        return;
      }
      knownWallet.add(print);
      wallet.push(clean);
    },
    skip() {
      skipped++;
    },
    twoFactor() {
      twoFactor++;
    },
    done(format: ImportFormat): ImportResult {
      return { format, drafts, passkeys, passkeysLeft, wallet, skipped, duplicates, twoFactor };
    },
  };
}

function fingerprint(login: Pick<LoginDraft, 'urls' | 'username' | 'password'>): string {
  const host = login.urls[0] ? new URL(login.urls[0]).host : '';
  return JSON.stringify([host, login.username, login.password]);
}

/** The same card is its number; the same address, its name and first line of street; the same note, its name and words. */
function walletPrint(item: WalletDraft | WalletItem): string {
  const low = (text: string) => text.trim().toLowerCase();
  switch (item.kind) {
    case 'card':
      return JSON.stringify(item.number ? ['card', item.number] : ['card', low(item.title), low(item.holder)]);
    case 'address':
      return JSON.stringify(['address', low(item.name), low(item.street.split('\n')[0] ?? ''), low(item.postalCode)]);
    case 'note':
      return JSON.stringify(['note', item.title.trim(), item.text.trim()]);
  }
}
