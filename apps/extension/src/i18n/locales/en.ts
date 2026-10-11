/**
 * Every sentence Passhold shows, in English — the source each other language
 * translates. A new sentence goes here and into every language in the same
 * change; test/i18n.test.ts refuses a language with a missing key, or one
 * whose placeholders and tags differ from these.
 *
 * Names stay as they are in every language: Passhold, Keyrook, Chrome.
 */
import type { Message } from '../format.js';

export const en = {
  'app.by': 'by Keyrook',

  // Common
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.save': 'Save',
  'common.edit': 'Edit',
  'common.back': 'Back',
  'common.show': 'Show',
  'common.hide': 'Hide',
  'common.notNow': 'Not now',

  // Setup
  'setup.title': 'Make your vault',
  'setup.body':
    'Passhold keeps your passwords encrypted on this device. One master password opens them — choose one you will remember and use nowhere else.',
  'setup.password': 'Master password',
  'setup.confirm': 'Type it again',
  'setup.mismatch': 'The two passwords are not the same.',
  'setup.tooShort': 'Use at least {min} characters.',
  'setup.understand':
    'I understand that nobody — not Passhold, not Keyrook — can recover my vault if I forget this password.',
  'setup.create': 'Create vault',
  'setup.creating': 'Creating…',
  'setup.restore': 'Restore from a backup',

  // Strength
  'strength.0': 'Very weak',
  'strength.1': 'Weak',
  'strength.2': 'Fair',
  'strength.3': 'Strong',
  'strength.4': 'Very strong',
  'strength.short': 'Longer is stronger: aim for 14 characters or more.',
  'strength.digitsOnly': 'Digits alone are quick to guess.',
  'strength.repeats': 'Avoid the same character over and over.',

  // Unlock
  'unlock.title': 'Passhold is locked',
  'unlock.body': 'Enter your master password.',
  'unlock.password': 'Master password',
  'unlock.submit': 'Unlock',
  'unlock.unlocking': 'Unlocking…',
  'unlock.forgot': 'Forgot it?',
  'unlock.forgotBody':
    'Your master password is the only key to this vault, and it is never stored anywhere. Without it the vault cannot be opened — you can only remove it in Settings and start again.',

  // Vault
  'vault.search': 'Search logins',
  'vault.lock': 'Lock',
  'vault.settings': 'Settings',
  'vault.add': 'New login',
  'vault.onThisPage': 'On {site}',
  'vault.all': 'All logins',
  'vault.empty': 'No logins yet',
  'vault.emptyBody': 'Sign in to a site and Passhold offers to save it — or add one here, or import from your browser.',
  'vault.import': 'Import passwords',
  'vault.noResults': 'Nothing matches “{query}”.',
  'vault.fill': 'Fill',
  'vault.copyUsername': 'Copy username',
  'vault.copyPassword': 'Copy password',
  'vault.noUsername': 'No username',
  'vault.count': { one: '{count} login', other: '{count} logins' },

  // Pending save, in the popup
  'pending.saveTitle': 'Save this login?',
  'pending.updateTitle': 'Update the password?',
  'pending.lockedTitle': 'Save the login you just used?',
  'pending.body': '{username} on {site}',
  'pending.bodyNoUser': 'A password for {site}',
  'pending.save': 'Save',
  'pending.update': 'Update',
  'pending.never': 'Never for this site',

  // Item
  'item.username': 'Username',
  'item.password': 'Password',
  'item.website': 'Website',
  'item.websites': 'Websites',
  'item.notes': 'Notes',
  'item.favorite': 'Favourite',
  'item.unfavorite': 'Remove from favourites',
  'item.addFavorite': 'Add to favourites',
  'item.trash': 'Move to trash',
  'item.updated': 'Password changed {date}',
  'item.history': 'Earlier passwords',
  'item.openSite': 'Open {site}',

  // Edit
  'edit.newTitle': 'New login',
  'edit.editTitle': 'Edit login',
  'edit.title': 'Name',
  'edit.titleHint': 'Left empty, it is named after the website.',
  'edit.username': 'Username or email',
  'edit.password': 'Password',
  'edit.generate': 'Generate',
  'edit.websites': 'Websites',
  'edit.websitesHint': 'One per line. Passhold offers this login on these sites.',
  'edit.notes': 'Notes',
  'edit.empty': 'Give it a name, a username or a password.',

  // Generator
  'generator.length': 'Length',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'Leave out look-alikes (I l 1 O 0)',
  'generator.again': 'Another',
  'generator.use': 'Use this password',
  'generator.bits': '{bits} bits',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold is locked.',
  'menu.unlock': 'Unlock Passhold',
  'menu.unlockHint': 'Click Passhold in the toolbar to unlock, then come back here.',
  'menu.none': 'No saved logins for {site}.',
  'menu.uninitialized': 'Set up Passhold first: click it in the toolbar.',
  'menu.suggest': 'Use a strong password',
  'menu.suggestBody': 'A new password, filled in for you. Passhold offers to save it once the form is sent.',
  'menu.fillFor': 'Fill on {site}',
  'menu.hidden': 'Passhold is covered by something on this page, so it will not fill.',

  // Save prompt on a page
  'prompt.save': 'Save login to Passhold?',
  'prompt.update': 'Update the password in Passhold?',
  'prompt.saveButton': 'Save',
  'prompt.updateButton': 'Update',
  'prompt.never': 'Never for this site',
  'prompt.saved': 'Saved to Passhold.',
  'prompt.locked': 'Click Passhold in the toolbar and unlock — it will ask you to save there.',

  // Settings
  'settings.title': 'Settings',
  'settings.general': 'General',
  'settings.autoLock': 'Lock after',
  'settings.autoLock.never': 'Only when the browser closes',
  'settings.autoLock.minutes': { one: '{count} minute', other: '{count} minutes' },
  'settings.autoLock.hours': { one: '{count} hour', other: '{count} hours' },
  'settings.lockWithSystem': 'Lock when the computer locks or sleeps',
  'settings.clipboard': 'Clear copied passwords after',
  'settings.clipboard.never': 'Never',
  'settings.clipboard.seconds': { one: '{count} second', other: '{count} seconds' },
  'settings.clipboard.minutes': { one: '{count} minute', other: '{count} minutes' },
  'settings.inlineButton': 'Show the Passhold button in sign-in fields',
  'settings.offerToSave': 'Offer to save logins when you sign in',
  'settings.language': 'Language',
  'settings.language.auto': 'Same as the browser',
  'settings.theme': 'Appearance',
  'settings.theme.system': 'Same as the system',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',

  'settings.security': 'Master password',
  'settings.securityBody': 'Changing it re-locks the key to your vault; your logins stay as they are.',
  'settings.current': 'Current master password',
  'settings.new': 'New master password',
  'settings.confirm': 'Type the new one again',
  'settings.change': 'Change master password',
  'settings.changed': 'Master password changed.',

  'settings.backup': 'Backup',
  'settings.backupBody':
    'Your whole vault in one encrypted file. Keep it somewhere other than this computer — a USB drive, your cloud storage — so that losing this browser does not lose your logins. It opens only with the master password you have when you make it.',
  'settings.backupLast': 'Last backup: {date}',
  'settings.backupNever': 'No backup yet.',
  'settings.backupButton': 'Download backup',
  'settings.backupDone': 'Saved to your downloads. Now move it somewhere other than this computer.',

  'settings.restoreBackup': 'Restore from a backup',
  'settings.restoreBodyNew':
    'There is no vault in this browser yet. Bring yours back from a backup file — it will open with the master password the backup was made with — or make a new one from the Passhold button in the toolbar.',
  'settings.restoreBodyMerge':
    'Adds the logins in a backup to this vault. Nothing here is deleted: where both have the same login, the newer edit is kept and the other password goes into its history.',
  'settings.restoreChoose': 'Choose backup file',
  'settings.restoreMade': 'Backup made {date}',
  'settings.restorePassword': 'Master password of the backup',
  'settings.restoreButton': 'Restore',
  'settings.restoreNew': { one: 'Vault restored, with {count} login.', other: 'Vault restored, with {count} logins.' },
  'settings.restoreAdded': { one: 'Added {count} login from the backup.', other: 'Added {count} logins from the backup.' },
  'settings.restoreUpdated': {
    one: '{count} login had a newer edit in the backup.',
    other: '{count} logins had a newer edit in the backup.',
  },
  'settings.restoreNothing': 'Everything in the backup is already in this vault.',

  'settings.import': 'Import',
  'settings.importBody':
    'Bring your passwords from Chrome, Edge, Firefox, Safari, Apple Passwords, Bitwarden, 1Password, LastPass, KeePass, Dashlane, Proton Pass or NordPass: export them there as a CSV file, then choose it here.',
  'settings.importChoose': 'Choose CSV file',
  'settings.importFound': { one: 'Found {count} login to import.', other: 'Found {count} logins to import.' },
  'settings.importSkipped': { one: '{count} row is not a login and is left out.', other: '{count} rows are not logins and are left out.' },
  'settings.importDuplicates': { one: '{count} is already in your vault.', other: '{count} are already in your vault.' },
  'settings.importConfirm': 'Import',
  'settings.importDone': { one: 'Imported {count} login.', other: 'Imported {count} logins.' },
  'settings.importDelete': 'Now delete the CSV file: it holds your passwords in plain text.',
  'settings.importNothing': 'Nothing new to import in that file.',

  'settings.export': 'Export',
  'settings.exportBody':
    'A CSV file every browser and password manager can read. It holds your passwords in plain text: keep it only as long as you need it.',
  'settings.exportButton': 'Export CSV',
  'settings.exportDone': 'Exported. Delete the file once you are done with it.',

  'settings.neverSave': 'Never offer to save on',
  'settings.neverSaveEmpty': 'No sites. Choose “Never for this site” when Passhold offers to save, and it appears here.',
  'settings.remove': 'Remove',

  'settings.trash': 'Trash',
  'settings.trashEmpty': 'The trash is empty.',
  'settings.restore': 'Restore',
  'settings.deleteForever': 'Delete forever',
  'settings.emptyTrash': 'Empty trash',
  'settings.emptyTrashConfirm': 'Delete everything in the trash for good?',

  'settings.danger': 'Remove vault',
  'settings.dangerBody':
    'Deletes the vault from this browser. Every login in it is gone for good — download a backup first if you want to keep them.',
  'settings.dangerType': 'Type {word} to confirm',
  'settings.dangerWord': 'delete',
  'settings.dangerButton': 'Remove vault',

  'settings.about': 'Passhold {version} · by Keyrook',
  'settings.locked': 'Unlock Passhold from the toolbar to change settings.',

  // Errors
  'error.noWorker': 'Passhold did not answer. Close this and try again.',
  'error.wrongPassword': 'That is not the master password.',
  'error.passwordTooShort': 'Use at least {min} characters.',
  'error.vaultCorrupt': 'The vault on this device is damaged and cannot be opened.',
  'error.vaultTooNew': 'This vault was made by a newer Passhold. Update Passhold to open it.',
  'error.itemNotFound': 'That login is no longer in the vault.',
  'error.itemInvalid': 'That login cannot be saved as it is.',
  'error.importEmpty': 'That file has no logins in it.',
  'error.importTooLarge': 'That file is too large to import.',
  'error.importUnknownFormat': 'That file does not look like a password export.',
  'error.backupInvalid': 'That file is not a Passhold backup, or it is damaged.',
  'error.backupWrongPassword': 'That is not the master password this backup was made with.',
  'error.kdfUnsupported': 'The vault’s settings are not ones Passhold accepts.',
  'error.locked': 'Passhold is locked.',
  'error.noVault': 'There is no vault yet.',
  'error.vaultExists': 'A vault already exists.',
  'error.notOnPage': 'That login is not for the page in this tab.',
  'error.expired': 'This has expired. Try again.',
  'error.noFields': 'There is no sign-in form on this page to fill.',
  'error.unknown': 'Something went wrong: {detail}',
} satisfies Record<string, Message>;

export type MessageKey = keyof typeof en;
export type Dictionary = { [K in MessageKey]: Message };
