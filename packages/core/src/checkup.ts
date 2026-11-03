/**
 * What in a vault needs its owner's attention, worked out on this device from
 * the vault alone.
 *
 * Weak and reused passwords, and a backup that is missing or behind. Not
 * "breached": knowing that means asking a server, and Passhold asks none.
 * Not "old" either: a strong, unique password does not weaken with age, and
 * asking people to change good passwords on a schedule is advice the
 * standards (NIST SP 800-63B) have dropped, because it makes passwords worse.
 */
import { siteOf } from './match.js';
import { scorePassword } from './strength.js';
import type { LoginItem, VaultData } from './vault/model.js';

/** A backup made this long ago, with logins changed since, is due again. */
export const BACKUP_DUE_AFTER = 30 * 24 * 60 * 60 * 1000;

export interface Checkup {
  /** Live logins whose password scores Weak or Very weak. */
  weak: LoginItem[];
  /** Live logins sharing a password, one group per password, largest first. */
  reused: LoginItem[][];
  backup: 'never' | 'due' | 'ok';
  /** A recovery key drawn but not yet put away: the one way in if the device is lost. */
  recoveryKeyPending: boolean;
  /** How many things there are to do: each weak login, each reused group, a due backup, a recovery key to keep. */
  issues: number;
}

/**
 * `accountLinked`: signed in to a Keyrook account, whose copy of every login
 * is the way back — so a vault recovery key not yet put away is not a problem.
 */
export function checkup(data: VaultData, now = Date.now(), accountLinked = false): Checkup {
  const live = data.items.filter((item) => item.deletedAt === null);
  const weak = live.filter((item) => item.password && scorePassword(item.password).score <= 1);

  const byPassword = new Map<string, LoginItem[]>();
  for (const item of live) {
    if (!item.password) continue;
    byPassword.set(item.password, [...(byPassword.get(item.password) ?? []), item]);
  }
  const reused = [...byPassword.values()].filter((group) => group.length > 1).sort((a, b) => b.length - a.length);

  let backup: Checkup['backup'] = 'ok';
  // A card or a note is as much to lose as a login.
  const kept = [...data.items, ...data.wallet];
  if (kept.some((item) => item.deletedAt === null)) {
    if (data.lastBackupAt === null) backup = 'never';
    else if (now - data.lastBackupAt > BACKUP_DUE_AFTER && kept.some((item) => item.updatedAt > data.lastBackupAt!)) {
      backup = 'due';
    }
  }

  const recoveryKeyPending = data.recoveryKeyPending && !accountLinked;
  return {
    weak,
    reused,
    backup,
    recoveryKeyPending,
    issues: weak.length + reused.length + (backup === 'ok' ? 0 : 1) + (recoveryKeyPending ? 1 : 0),
  };
}

/** What is wrong with one login's password, for its own page. */
export function loginIssues(data: VaultData, item: LoginItem): { weak: boolean; reusedWith: number } {
  if (!item.password || item.deletedAt !== null) return { weak: false, reusedWith: 0 };
  const others = data.items.filter((other) => other.id !== item.id && other.deletedAt === null && other.password === item.password);
  return { weak: scorePassword(item.password).score <= 1, reusedWith: others.length };
}

/**
 * Where a site lets its users change their password: the well-known address
 * browsers and password managers agree on (W3C "A Well-Known URL for Changing
 * Passwords"). A site that has none sends the visitor somewhere sensible, or
 * to its front page. Opening it is a visit the person chooses, not a request
 * Passhold makes.
 */
export function changePasswordUrl(item: LoginItem): string | null {
  for (const url of item.urls) {
    const site = siteOf(url);
    if (site) return `${site.origin}/.well-known/change-password`;
  }
  return null;
}
