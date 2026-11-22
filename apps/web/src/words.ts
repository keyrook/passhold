/**
 * The web vault's own words, in English for now, other languages after. The
 * screens it shares with the extension speak through the extension's
 * language files, held to English here too (main.tsx), so a page never mixes
 * two languages. When the web vault is translated, these move into those
 * files, beside the rest.
 */
import { AppError } from '../../extension/src/i18n/errors.js';
import type { MessageKey } from '../../extension/src/i18n/locales/en.js';

export const WORDS = {
  tagline: 'Your passwords, in any browser.',
  signInTitle: 'Sign in to your vault',
  email: 'Email',
  password: 'Account password',
  signIn: 'Sign in',
  signingIn: 'Signing in…',
  or: 'or',
  google: 'Continue with Google',
  github: 'Continue with GitHub',
  passkey: 'Sign in with a passkey',
  newHere: 'New to Keyrook? Make your account on account.keyrook.com, then sign in here.',
  makeAccount: 'Make an account',
  secondStepTitle: 'One more step',
  secondStepBody: 'Enter the code from your authenticator app. Lost it? Enter your recovery key instead.',
  secondStepField: 'Code or recovery key',
  continue: 'Continue',
  usePasskey: 'Use a passkey instead',
  startAgain: 'Start again',
  lockedTitle: 'Your vault is locked',
  lockedAs: 'Signed in as {email}',
  savingAtLock: 'Saving your last change to your account…',
  lostAtLock: 'Your last change could not reach your account before the vault locked. Make it again once it is open.',
  unlock: 'Unlock',
  opening: 'Opening your vault…',
  unlockPasskey: 'Unlock with a passkey',
  recoveryKey: 'Recovery key',
  useRecoveryKey: 'Use the recovery key instead',
  usePassword: 'Use the password instead',
  noPasswordBody: 'Your account has no password. Unlock with one of its passkeys, or with its recovery key.',
  triesLeft: 'Wrong password. {count} more and this tab signs out.',
  signOut: 'Sign out',
  lock: 'Lock',
  lockAfter: 'Lock after',
  minutes: '{count} min',
  lockNote: 'Locks too when this tab is hidden for a minute.',
  menu: 'Menu',
  items: 'Items',
  account: 'Keyrook account',
  devices: 'Devices',
  recovery: 'Recovery key',
  passkeys: 'Passkeys',
  trash: 'Trash',
  back: 'Back',
  choose: 'Choose an item to see it here.',
  copied: 'Copied',
  copyNote: 'Cleared from the clipboard in 30 seconds while this page is open. Copied elsewhere, it may stay.',
  syncing: 'Saving…',
  notSent: 'Not saved to your account yet. Keep this tab open, or try again.',
  tryAgain: 'Try again',
  trashEmpty: 'Nothing in the trash.',
  restore: 'Restore',
  deleteForever: 'Delete for good',
  emptyTrash: 'Empty trash',
  emptyTrashConfirm: 'Delete everything in the trash for good? This cannot be undone.',
  deleteConfirm: 'Delete “{name}” for good? This cannot be undone.',
  cancel: 'Cancel',
  kitTitle: 'Check your recovery key',
  kitBody: 'Type the recovery key you saved for your Keyrook account once, so you know it works while you can still make another.',
  kitCheck: 'Check it',
  kitDone: 'Your recovery key works.',
  later: 'Later',
  error: {
    noAccount: 'There is no Keyrook account for that sign-in yet. Make one on account.keyrook.com, then sign in here.',
    signedOutTries: 'Five wrong passwords: this tab signed out. Sign in again.',
    passkeyOnly: 'Sign in with the password, Google or GitHub first, then unlock with a passkey.',
    notThisSignIn: 'That answer was for another sign-in. Start again.',
  },
} as const;

export type WebError = keyof (typeof WORDS)['error'];

/** A refusal in the web vault's own words: it travels as a key, as every refusal does, and the page says it. */
export function webFail(word: WebError): never {
  throw new AppError(`web.${word}` as MessageKey);
}

/** The web vault's sentence for a key it made, or null for one of the extension's. */
export function webSays(key: string): string | null {
  if (!key.startsWith('web.')) return null;
  const word = key.slice(4) as WebError;
  return WORDS.error[word] ?? null;
}

/** `{name}` and the like, filled. */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}
