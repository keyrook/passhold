/**
 * What each sentence the Keyrook account's server can send back is, said in
 * the reader's language. The server writes English; Passhold never shows its
 * words, only the message they stand for here. The list is the kit's
 * (vendor/keyrook-account-kit/messages.json, copied from keyrook-account), and
 * test/i18n.test.ts holds this table to it: a sentence the server learns
 * must be placed here before Passhold takes that server.
 *
 * Null: a refusal Passhold settles itself — it tries again, or it never asks
 * what would draw it — or one its error code already says well enough.
 */
import type { MessageKey } from '../i18n/locales/en.js';

export const SERVER_SENTENCES: Record<string, MessageKey | null> = {
  '${identity.email} already has a Keyrook account that signs in with another provider.': 'error.providerOtherProvider',
  '${identity.email} already has a Keyrook account with a password. Sign in with your email and password instead.': 'error.providerHasPassword',
  '${identity.email} already has a Keyrook account.': 'error.providerEmailTaken',
  '${what} answered ${response.status}.': 'error.providerFailed',
  'A code was sent a moment ago. You can ask for another in ${reserved.retryAfter} seconds.': 'error.accountCodeWait',
  // The account's name is given on the account page; Passhold only shows it, and never sets one.
  'A name may hold letters, spaces, apostrophes, hyphens and full stops, up to 64 characters.': null,
  'A passkey answers only for Keyrook’s own page and apps.': 'error.passkeyFailed',
  // Adding a passkey is the account page’s alone; Passhold never asks.
  'Add a passkey on account.keyrook.com.': null,
  'Another device changed the recovery key just now.': 'error.accountKitRace',
  // Two of this computer's sign-ins racing to give the account Passhold's key: the loser takes the winner's.
  'Another device of this product set its key first.': null,
  'Email or password is incorrect.': 'error.accountWrong',
  'Enter the code from your authenticator app too.': 'error.secondStepNeeded',
  'Expired.': 'error.providerExpired',
  'GitHub refused the sign-in.': 'error.providerFailed',
  'Google has not verified that email address.': 'error.providerFailed',
  'KDF iteration count is below the minimum.': 'error.accountKdfRefused',
  'Malformed ID token.': 'error.providerFailed',
  'Missing bearer token.': 'error.accountSignedOut',
  'No GitHub user id.': 'error.providerFailed',
  'No ID token.': 'error.providerFailed',
  'No subject.': 'error.providerFailed',
  'Not issued by Google.': 'error.providerFailed',
  'Not issued for this server.': 'error.providerFailed',
  'Not this sign-in.': 'error.providerExpired',
  // Said to Keyrook Authenticator when it wraps its key for its older builds; Passhold never asks.
  'Older Keyrook Authenticator builds can no longer use this account.': null,
  // Said to the account page, account.keyrook.com, about what only it may ask; Passhold never asks.
  'Only the account page can ask for this.': null,
  'Only the account page reads every product’s key box.': null,
  'Only the old keys can delete what was kept before it expires.': 'error.archiveDeleteRefused',
  'Passkeys are not offered here.': 'error.passkeyNotOffered',
  'Record ${record.id} exceeds the size limit.': 'error.accountFailed',
  'Sign in again with the account you use for Keyrook to confirm this.': 'error.providerNotOwner',
  'Sign up with keys: this product has no account key of its own yet.': 'error.accountSignUpKeys',
  // The account page’s own: linking Google or GitHub, adding a password, turning the second step on or off.
  'Start turning on two-step sign-in again.': null,
  'That account id is taken. Sign up again.': 'error.accountIdTaken',
  'That account no longer exists.': 'error.accountSignedOut',
  // Signing the account page in by approving it from Passhold, which Passhold does not offer yet.
  'That code is not one the account page is showing. Check it, or start again there.': null,
  'That code is not right, or it has expired. Check the email, or ask for a new one.': 'error.accountCode',
  'That code is not right. Enter the one your authenticator app shows now.': 'error.secondStepWrong',
  'That does not open what was kept.': 'error.archiveWrong',
  'That Google or GitHub account already signs in to another Keyrook account.': null,
  'That Google or GitHub account has another email address than this Keyrook account.': null,
  'That has expired. Ask for a new code and start again.': 'error.startOverExpired',
  // Moving the account to a new address is the account page's; Passhold only shows the address it has now.
  'That is already this account’s address.': null,
  'That is no longer kept.': 'error.archiveGone',
  'That is not this product’s key.': 'error.accountKeyReplaced',
  'That passkey could not be checked. Try again.': 'error.passkeyFailed',
  'That passkey did not confirm it is you. Try again.': 'error.passkeyNotYou',
  // Adding, renaming and removing passkeys, and proving the owner with one, are the account page’s.
  'That passkey is already on a Keyrook account.': null,
  'That passkey is not on this account.': null,
  'That passkey is not one any Keyrook account knows. It may have been removed.': 'error.passkeyUnknown',
  'That passkey request has ended. Try again.': 'error.passkeyExpired',
  'That password is not correct.': 'error.accountPasswordWrong',
  // Passhold's own records are the only kind it sends.
  'That record belongs to another Keyrook product.': null,
  'That recovery key does not match this account.': 'error.accountKitWrong',
  'That recovery key does not open this account.': 'error.accountKitNotThis',
  'That request has ended, or another browser is approving it.': 'error.pairingEnded',
  'That request has ended.': 'error.pairingEnded',
  'That request has ended. Ask again.': 'error.pairingEnded',
  'That request has ended. Start again on the account page.': null,
  'That request has expired. Start again on the account page.': null,
  'That request is too large.': 'error.accountFailed',
  'That request was not valid JSON.': 'error.accountFailed',
  'That session has expired.': 'error.accountSignedOut',
  'That session is no longer valid.': 'error.accountSignedOut',
  'That sign-in has expired. Sign in again.': 'error.signInExpired',
  'That sign-in has expired. Try again.': 'error.providerExpired',
  'That sign-in is not on this account.': null,
  'That sign-up has expired. Sign in again.': 'error.providerExpired',
  'The account page cannot do that.': null,
  'The account’s root key is not the one this was sealed to.': 'error.accountRootChanged',
  'The email could not be sent. Try again in a minute.': 'error.accountMail',
  'This account already has 10 passkeys. Remove one before adding another.': null,
  'This account already has a password.': null,
  // Made only where there is none; another computer making one first is settled by opening that one.
  'This account already has a root key.': null,
  'This account already signs in with an account of that provider.': null,
  'This account already signs in with it.': null,
  // Passhold says it knows a sign-in may ask for a second step (`secondStep`); a build from before is told this.
  'This account asks for a second step to sign in. Update this app to sign in.': 'error.secondStepUpdate',
  'This account has no key of Keyrook Authenticator’s to set its keys up from.': null,
  'This account has no passkey.': null,
  // Said to the account page's Google or GitHub sign-in; Passhold makes the account itself.
  'This Google or GitHub account has no Keyrook account. Make one in Keyrook Authenticator or Passhold.': null,
  'This account has no root key yet.': 'error.accountNoRoot',
  'This account already starts over on ${day}.': 'error.startOverWaiting',
  // Cancelling a start over already gone: cancelled elsewhere, or carried out. Passhold settles it itself.
  'This account has no start over waiting.': null,
  'This account has started over too often lately. Try again after ${day}.': 'error.startOverTooOften',
  'This account signs in with Google or GitHub, not a password.': 'error.accountWrong',
  // Passhold never sends what only Keyrook Authenticator's data key would open.
  'This device does not hold the account key.': null,
  'This device does not hold the account’s root key.': 'error.accountRootNotHeld',
  // `device_removed`: the server's word is only a sign-out. A removal is acted on, and said, only where
  // its proof checks out under Passhold's key (`removalProved`), never on this sentence.
  'This device was removed from the account.': 'error.accountSignedOut',
  'This device was signed out because its session was used from somewhere else. Sign in again.': 'error.accountSessionStolen',
  'This is the only way to sign in to this account.': null,
  'This product has no key on this account yet.': 'error.accountKeyReplaced',
  'This product’s key changed. Look again.': 'error.accountKeyReplaced',
  'This product’s key was replaced on another device. Sign in again.': 'error.accountKeyReplaced',
  'Too many browsers are waiting to join this account. Try again in a few minutes.': 'error.pairingBusy',
  'Too many failed attempts. Try again in ${lock.retryAfter} seconds.': 'error.accountBusy',
  'Too many failed attempts. Try again in ${next.retryAfter} seconds.': 'error.accountBusy',
  'Too many wrong codes. Ask for a new one.': 'error.accountCode',
  'Two-step sign-in is already off.': null,
  'Two-step sign-in is already on.': null,
  'Two-step sign-in is not offered yet.': null,
  // Said to builds that do not name themselves; this one always does.
  'Update Keyrook Authenticator to keep using this account.': null,
  // Passhold says it knows a start over waits a week (`schedule`); a build from before is told this.
  'Update this app to start the account over: it now takes effect a week after it is asked for.': 'error.startOverUpdate',
  'Your GitHub account has no verified primary email address.': 'error.providerFailed',
  // The account page's own pin of a family (PUT /orgs/:org/me/page-pin), which Passhold never asks: it keeps its own.
  'Only the account page keeps that.': null,
  // Families: the /orgs routes, and replacing
  // the root with a family's keys in it (`/root/rotate`), none of which Passhold asks yet. Each one its shared
  // vault can meet gets its words with it.
  'A collection’s key goes only to confirmed members of the family. Load the family again.': null,
  'A collection’s new key goes only to those already in it. Load the family again.': null,
  'A collection’s new key must go to everyone still in it, and to nobody else. Load the family again.': null,
  'A family has at most 2 organisers, counting those invited.': null,
  'A family has at most 6 people, counting those invited.': null,
  'A family has at most 64 collections.': null,
  'A free family has at most 2 collections.': null,
  'A new family’s roster is its first: version 1, generation 1.': null,
  'A new organiser needs the family’s recovery key. Load the family again.': null,
  'A record stays in the collection it was made in.': null,
  'An app makes only its own collections.': null,
  'An app puts only its own box here.': null,
  'An organiser can step down only themselves.': null,
  // An organiser's word for a key goes with confirming someone, on the account page; Passhold never sends one.
  'An organiser’s word goes only to confirmed members of the family. Load the family again.': null,
  'Ask another organiser of your family to help you.': null,
  'Families are not offered yet.': null,
  'No organiser of your family can help you back in now.': null,
  'Nobody has handed your account’s key over yet.': null,
  'Nobody is asking for your emergency access.': null,
  'Nobody named you their emergency contact here.': null,
  'Only a family can be made here.': null,
  'Only an organiser of this family can do that.': null,
  'Only someone already confirmed can be made an organiser.': null,
  'Only someone confirmed in the family can do that.': null,
  'Only the account page can do that.': null,
  'Recovery by an organiser is already on in this family. Load the family again.': null,
  'Recovery by an organiser is not on in this family. Load the family again.': null,
  'Recovery by an organiser is not part of a free family.': null,
  'Someone else in the family has just become its organiser. Load the family again.': null,
  'Someone has already helped them. Load the family again.': null,
  'Someone left this family, and its key must be changed first. Load the family again.': null,
  'Someone there already holds this collection’s key. Load the family again.': null,
  'Someone who held this collection’s key is gone, and it must be changed first. Load the family again.': null,
  'That address is already in this family.': null,
  'That address is already invited.': null,
  'That collection belongs to another Keyrook product.': null,
  'That collection id is taken. Make the collection again.': null,
  'That collection’s key has changed. Load the family again.': null,
  'That family id is taken. Make the family again.': null,
  'That is not a collection of yours in this family.': null,
  'That is not one of this family’s collections, or its key has changed. Load the family again.': null,
  'That is not the collection key’s next generation. Load the family again.': null,
  'That is not the family key’s next generation. Load the family again.': null,
  'That is not the recovery key in use. Load the family again.': null,
  'That is not the recovery key’s next generation. Load the family again.': null,
  'That person is not in this family.': null,
  'That person is not waiting to be confirmed.': null,
  'That request is over. Ask again.': null,
  'That request is over. Load the family again.': null,
  'That roster is not for the family key in use. Load the family again.': null,
  'That roster is not for the new family key. Load the family again.': null,
  'That roster is not the next one. Load the family again.': null,
  'The key handed over is not this account’s. Ask again.': null,
  'The new family key must go to everyone in the family, and to nobody else. Load the family again.': null,
  'The recovery key must go to every organiser of the family, and to nobody else. Load the family again.': null,
  'There is no invitation to your address for that family.': null,
  'There is no such collection in this family.': null,
  'There is no such family, or you are not in it.': null,
  'There is no such invitation.': null,
  'They already have that role.': null,
  'They refused less than a day ago. You can ask again tomorrow.': null,
  'They refused your request.': null,
  'This app’s key for your family changed. Look again.': null,
  'This family’s key does not need changing. Load the family again.': null,
  'You are already in a family.': null,
  'You are the only organiser of your family. Make another member an organiser first.': null,
  'You have asked already.': null,
  'You left a family less than 12 months ago, and can join another 12 months after leaving.': null,
  'Your account’s keys changed while you waited. Ask again.': null,
  // --- the paid plans (keyrook-account a003bf5) ---
  // Naming, accepting, comparing on the page, plans and payment, view only for others: the account page's alone.
  'Let them edit each vault they can only view first: an organiser can edit every vault.': null,
  'Nobody named this address as their emergency contact.': null,
  'Payment is not available right now. Try again later.': null,
  'Plans are bought on the account page.': null,
  'Plans are not sold here yet.': null,
  'That is not from Paddle.': null,
  'The other organiser gives each view only vault you let people into new keys first, on account.keyrook.com.': null,
  'There is no such plan.': null,
  'These apps are linked already.': null,
  'They can edit this vault already. Load the family again.': null,
  'They named you already, under another address.': null,
  'This family already has Premium.': null,
  'View only is not on for this vault. Load the family again.': null,
  'View only is not part of a free family.': null,
  'Watching your address is not offered yet.': null,
  'You already have Premium.': null,
  'You can name up to ${MAX_CONTACTS} emergency contacts.': null,
  'You did not name that contact.': null,
  'You named this address already.': null,
  'Your emergency contact is someone else.': null,
  // Passhold hands over its own key only, keeps its own box and pins, and only for a product the grantor chose.
  'A product hands over its own key.': null,
  'A product keeps its own box of the contact key.': null,
  'A product keeps its own pins.': null,
  'You did not choose that product for this contact.': null,
  // Files kept with items, and sent in a Send.
  'Files are not offered yet.': 'error.filesNotOffered',
  'Sending files is not offered yet.': 'error.filesNotOffered',
  // Each the store not holding what was said: sent again, it goes.
  'That file has not arrived yet.': 'error.fileFailed',
  'That file id is taken. Send the file again.': 'error.fileFailed',
  'That file is not the size it said. Send it again.': 'error.fileFailed',
  'That file is too large.': 'error.fileTooLarge',
  'There is no such file.': 'error.fileGone',
  'Your plan keeps no files.': 'files.premium',
  'This link has run out, or the password is not right.': null,
  'Breach alerts are not offered yet.': 'error.notOffered',
  'Send is not offered yet.': 'error.notOffered',
  'Breach alerts are part of Premium.': 'error.notOnPlan',
  'Emergency access is part of Premium.': 'error.notOnPlan',
  'Send is part of Premium.': 'error.notOnPlan',
  // Said of files alone: an item's, or a Send's from the command line.
  'That would take you past what your plan keeps.': 'error.filesFull',
  'The codes in Passhold are part of Premium.': 'codes.premium',
  'There is no such link.': 'codes.off',
  'These apps are not linked.': 'codes.off',
  'That link is between two other apps.': 'error.accountServerWrong',
  'This account has another contact key.': 'error.accountServerWrong',
  'That Send’s id is taken. Make it again.': 'error.sendFailed',
  'There is no such Send.': 'error.sendFailed',
  'The breach check is not answering. Try again later.': 'error.accountFailed',
  'That person is not your emergency contact, nor you theirs.': 'error.accountFailed',
  'Ask for it first: it opens once the wait is over, if they do not refuse.': 'error.emergencyNotOpen',
  'It is not open yet: it opens once the wait is over, if they do not refuse.': 'error.emergencyNotOpen',
  'They did not share this product with you.': 'error.emergencyNothing',
  'They have no contact key yet.': 'error.emergencyWaiting',
  'They have not accepted yet.': 'error.emergencyWaiting',
  'You can view this vault, not change it.': 'error.viewOnly',
  // Every file on the server together is at the ceiling Keyrook set: nothing of this account's, and a later try may go through.
  'Keyrook has no room for more files just now. Try again later.': 'error.fileFailed',
  // An account page's sign-in is approved from an app's session; neither the extension nor the web vault asks to approve one.
  'Approve the account page from an app. A web page cannot.': null,
  // Plans bought through the App Store are the iPhone app's and the account page's business; Passhold neither buys nor manages one.
  'Plans are not sold in the App Store yet.': null,
  'That is not from Apple.': null,
  'This plan was bought through the App Store: change or cancel it in your Apple account.': null,
};

/**
 * What each sentence @keyrook/account's own code throws stands for. These are
 * thrown here, in the service worker, never by the server: most say the
 * server answered with something the account's keys do not match, which
 * Passhold refuses rather than believes.
 */
export const ACCOUNT_SENTENCES: Record<string, MessageKey | null> = {
  '"${char}" is not part of a recovery key': 'error.accountKitShape',
  // Passhold's own pairing never makes one with a single key.
  'A pairing needs two different keys.': null,
  'A password account’s root must be wrapped under the password.': 'error.accountFailed',
  'Account KDF iteration count is below the safe minimum': 'error.accountKdfRefused',
  'Choose a new password for this account.': 'error.startOverNeedsPassword',
  // The account page’s own flows (flows/console.ts), which Passhold does not run.
  'Confirm with the password, or the recovery key and a sign-in with Google or GitHub.': null,
  'Hex string has odd length': 'error.accountFailed',
  'Invalid hex string': 'error.accountFailed',
  'KDF iteration count is below the safe minimum': 'error.accountKdfRefused',
  // Passhold's name is a constant, never Authenticator's.
  'Keyrook Authenticator makes an account without a root.': null,
  'Keyrook Authenticator’s key is not under this password yet. Open Keyrook Authenticator once, then try again.': null,
  'Malformed account id.': 'error.accountServerWrong',
  'Malformed account key.': 'error.accountServerWrong',
  // Checking a removal's proof (`removalProved`), which catches it: a device id no proof names is no removal.
  'Malformed device id.': null,
  'Malformed pairing key.': 'error.pairingRefused',
  // A passkey id from the server that is no passkey’s.
  'Malformed passkey id.': 'error.accountServerWrong',
  'Malformed recovery state.': 'error.accountServerWrong',
  // Making a removal's proof is the account page's (`makeDeviceRemovalProof`); Passhold only checks one.
  'Malformed removal time.': null,
  'Malformed root pin.': 'error.accountServerWrong',
  // Checking a removal's proof, with no sign-in time to hold it to: device ids are drawn anew at each sign-in.
  'Malformed sign-in time.': null,
  'Not a Keyrook product name.': null,
  'Nothing kept for this product opens with that.': 'error.archiveWrong',
  'Only Keyrook Authenticator has older builds to keep working.': null,
  'Recovery key is empty': 'error.accountKitShape',
  'That approval did not come from the browser whose code you checked.': 'error.pairingRefused',
  'That box was not sealed to this account.': 'error.accountBoxWrong',
  'That does not look like a recovery key.': 'error.accountKitShape',
  'That is not an account key.': 'error.accountKeyWrong',
  'That passkey did not answer as one that unlocks.': 'error.passkeyNoPrf',
  // It has something on the server to open, which its answer does not: "Let it unlock" is no help for it.
  'That passkey does not open this account’s key. Sign in with the password instead.': 'error.passkeyWrong',
  // The account page’s own flows (flows/console.ts), which Passhold does not run.
  'That passkey does not unlock this account. Confirm with the password instead.': null,
  'That password is not correct.': null,
  // `checkRecoveryKey`, which Passhold does not run: it opens the root itself, and tells the server only if it can.
  'That recovery key does not open this account.': 'error.accountKitNotThis',
  'The account key is not the one you confirmed. Look again.': 'error.accountRootChanged',
  'The account’s root key changed. Open this product’s key again before replacing it.': 'error.accountRootChanged',
  // The account page's own flows (flows/console.ts), which Passhold does not run.
  'The key of ${entry.product} does not open with this account’s root. Nothing was changed.': null,
  'The passkey’s wrap did not open again. Nothing was changed.': null,
  'The server answered for another account.': 'error.accountServerWrong',
  'The server answered for another passkey.': 'error.accountServerWrong',
  'The server asked for ${params.iterations.toLocaleString()} KDF iterations, ': 'error.accountKdfRefused',
  'The server asked for an unsupported KDF: ${params.algorithm}': 'error.accountKdfRefused',
  'The server made the account under another id.': 'error.accountServerWrong',
  'The server reported an account key other than the one just made.': null,
  'The server reported an account key other than the one that opened.': 'error.accountServerWrong',
  'The server returned too short a salt.': 'error.accountKdfRefused',
  'The server says this account has no root key, but this device has seen one.': 'error.accountServerWrong',
  'This account already has a password.': null,
  'This account already has a root key.': null,
  'This account had no password then.': 'error.archiveWrong',
  'This account has a password: confirm with it.': null,
  'This account has no password to open its keys with.': 'error.accountWrong',
  'This account has no recovery key yet.': 'error.accountNoRoot',
  'This account has no root key yet.': 'error.accountNoRoot',
  'This account has no root key yet. Open Keyrook Authenticator to do this.': null,
  // Replacing Passhold's key just after the server said its box is there.
  'This product has no key on this account yet.': 'error.accountKeyReplaced',
  'Unsupported KDF: ${params.algorithm}': 'error.accountKdfRefused',
  'Unsupported account KDF: ${params.algorithm}': 'error.accountKdfRefused',
  // The account page's flows, which pin each family as Passhold's do; said on the page alone.
  'Someone in your family has a key this browser has not seen. Compare codes with them first.': null,
  // The products' family flows (flows/family.ts), which Passhold's shared vaults run. A record that will not
  // open is set apart by them (`unreadable`), never thrown to Passhold.
  'Malformed family record.': null,
  'That record is under a key you do not hold.': null,
  // Sealing for a collection the family stopped sharing a moment ago: Passhold opens the family again and plans anew.
  'That is not a collection of yours in this family.': null,
  // The root a password opened is not the one Passhold's key was pinned to: it was replaced on another computer.
  'The account’s root key is not the one this app trusts. Open this app’s key again first.': 'error.accountKeyReplaced',
  // Families' keys (keys/org), the account page's family flows and `replaceAccountRoot`, none of which Passhold
  // runs yet. Each one its shared vault can throw gets its words with it.
  'A collection needs a name of up to 128 characters.': null,
  'Ask another organiser of your family to help you.': null,
  // Who holds a collection, thrown and caught inside the flows: one that will not read leaves the collection marked.
  'Malformed collection holders.': null,
  'Malformed collection name.': null,
  'Malformed family pin.': null,
  'Malformed family roster.': null,
  'Malformed join code.': null,
  'Malformed key generation.': null,
  'Malformed member key.': null,
  'Malformed record revision.': null,
  'Malformed roster version.': null,
  'Nobody has handed your account’s key over yet.': null,
  // An organiser vouching for their own key, which no flow asks: a slip in the code, not anything a person did.
  'Nobody vouches for their own key.': null,
  'Only an organiser of this family can do that.': null,
  'Recovery by an organiser is not on in your family.': null,
  'That box does not hold a key.': null,
  'That box does not hold a recovery key.': null,
  'That box does not hold an account key.': null,
  'That box is not from a member key.': null,
  'That family roster is older than one this device has seen.': null,
  'That family roster was not made by anyone in the family.': null,
  'That is not a member key.': null,
  'That is not the recovery key the family’s roster lists.': null,
  'That key did not come from the organiser whose code you checked. Nothing was changed.': null,
  'That member key was not sealed to this account.': null,
  'That person is not waiting to be confirmed.': null,
  'That request is over. Load the family again.': null,
  'The family’s list of members does not name that person. Load the family again.': null,
  'The family’s list of members does not name who sent you its key.': null,
  'The family’s list of members names another key for you.': null,
  'The key was handed over by someone this page showed no code for. Nothing was changed.': null,
  'The server reported an account key other than the one handed over.': null,
  'The server sent the key of someone else. Nothing was handed over.': null,
  'You do not hold this family’s key yet: an organiser confirms you first.': null,
  'You do not hold your family’s recovery key. Load the family again.': null,
  'Your key for your family does not open with this account’s root. Nothing was changed.': null,
  'Your key for your family does not open with this app’s key. Nothing was changed.': null,
  // --- the paid plans (keyrook-account a003bf5) ---
  // The account page's: linking two apps, who may view or edit a vault, naming a contact.
  'A contact is someone else.': null,
  'An organiser can always edit, and only someone let into a vault can be set to view it.': null,
  'Only someone let into this vault can be set to view it.': null,
  'Only someone who may edit this vault can let another edit it.': null,
  'Sign in to both apps with this account first: each needs a key of its own to hold the link’s.': null,
  'Someone who held this collection’s key is gone, and it must be changed first. Load the family again.': null,
  'There is no such collection in this family.': null,
  'They are not in this vault.': null,
  // A Send's files are chosen ten at most (SEND_FILES); opening a link is the Send page's.
  'A Send holds at most 10 files.': null,
  'That file is not part of this Send.': null,
  'That is not a Keyrook Send link.': null,
  // An item's file, as the store answered a page that moved it.
  'The file could not be fetched. Try again.': 'error.fileFetch',
  'The file could not be sent. Try again.': 'error.fileFailed',
  'Type the password.': null,
  'A Send needs text, an item or a file.': 'error.sendFailed',
  'That text is too long to send.': 'error.sendFailed',
  // What a server or a record not as the keys say would bring: stopped, as for any other.
  'A code is written by the app that writes it.': 'error.accountServerWrong',
  'A link is between two different apps.': 'error.accountServerWrong',
  'Malformed Send.': 'error.accountServerWrong',
  'Malformed contact key.': 'error.accountServerWrong',
  'Malformed contact pin.': 'error.accountServerWrong',
  'Malformed file id.': 'error.accountServerWrong',
  'Malformed link key.': 'error.accountServerWrong',
  'Malformed link record.': 'error.accountServerWrong',
  'Malformed link.': 'error.accountServerWrong',
  'Malformed write key.': 'error.accountServerWrong',
  'That app is not one of this link’s.': 'error.accountServerWrong',
  'That contact key was not sealed to this account.': 'error.accountServerWrong',
  'That is not a contact key.': 'error.accountServerWrong',
  'That is not a product key.': 'error.accountServerWrong',
  'That record is not signed by anyone who may edit this vault.': 'error.accountServerWrong',
  'The link’s key does not open with this app’s key.': 'error.accountServerWrong',
  'The server lists another contact key for this account.': 'error.accountServerWrong',
  'They have no contact key yet.': 'error.emergencyWaiting',
  'They have no contact key yet: it is made the next time they open Keyrook.': 'error.emergencyWaiting',
  'They have not accepted yet.': 'error.emergencyWaiting',
  'This account’s contact key does not open here. Open a Keyrook app signed in to this account, then try again.': 'error.emergencyNeedsRoot',
  'This vault’s list of who is in it does not open. Load the family again.': 'error.familyNotOpen',
  'You do not hold this vault’s key.': 'error.familyNotOpen',
  'You can view this vault, not change it.': 'error.viewOnly',
};

/**
 * A template as a pattern: each `${…}` stands for whatever was put there. One
 * that ends in a space was the first part of a longer sentence: the rest may follow.
 */
const compile = (table: Record<string, MessageKey | null>) =>
  Object.entries(table).map(([template, key]) => {
    const parts = template.split(/\$\{[^}]*\}/).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return { pattern: new RegExp(`^${parts.join('(.+?)')}${/\s$/.test(template) ? '' : '$'}`, 's'), key, holes: parts.length - 1 };
  });
const patterns = compile(SERVER_SENTENCES);
const thrown = compile(ACCOUNT_SENTENCES);

/** The message a sentence @keyrook/account threw stands for; undefined for one not in the list. */
export function accountSentenceKey(sentence: string): MessageKey | undefined {
  for (const { pattern, key } of thrown) if (pattern.test(sentence)) return key ?? undefined;
  return undefined;
}

/**
 * The message a server's sentence stands for, and what filled its first gap
 * (a date, a number of seconds); undefined for a sentence not in the list.
 */
export function sentenceKey(sentence: string | undefined): { key: MessageKey | null; filled: string | null } | undefined {
  if (!sentence) return undefined;
  for (const { pattern, key, holes } of patterns) {
    const found = pattern.exec(sentence);
    if (found) return { key, filled: holes > 0 ? (found[1] ?? null) : null };
  }
  return undefined;
}
