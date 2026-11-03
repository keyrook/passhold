import type { PasswordName } from '@passhold/core';

/**
 * What this vault's password is called — a master password of its own, the
 * Keyrook account's password, or a code for this computer — for the words a
 * field uses. Set by each page's root from the status it draws with, before
 * its children render, so no field shows one name and then another.
 */
let name: PasswordName = 'master';

export function setPasswordName(next: PasswordName): void {
  name = next;
}

export function passwordName(): PasswordName {
  return name;
}
