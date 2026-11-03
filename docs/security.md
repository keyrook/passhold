# Passhold's security design

What Passhold defends, against whom, and where each defence lives. Every
claim here has a test that tries to break it; the test is named beside it.

## What it holds

Logins — a name, a username, a password, the websites it is for, notes, and
a website's passkey when it has one — and beside them payment cards,
addresses and notes, in one vault per browser profile. Any of them may have
fields of its owner's own — a PIN, a security question's answer — and a
folder. Both are sealed inside the item, as its password is: a folder is a
name on each item, not a record of its own, so the server learns no folder's
name nor that there are any (`folders.test.ts`, `e2e/folders.spec.ts`). A
field marked hidden is kept out of sight in Passhold's pages until asked
for, and out of search; it is never filled into a web page. Signed out of a Keyrook account, nothing
leaves the machine; signed in, only sealed records, to Keyrook's server and
nowhere else (below). No favicon service, no breach check. The extension's
only `connect-src` is that server, fixed at build time
(`test/manifest.test.ts`).

## The Keyrook account and sync

The account is the one Keyrook Authenticator signs in to: one email, and one
password or one Google or GitHub sign-in, for every Keyrook app. Each app has
a key of its own in it. The account's code — how a password becomes keys,
the account's root, each product's key, pairing, recovery, starting over — is
not written twice: it is keyrook-account's `@keyrook/account`, copied into
`vendor/keyrook-account` as it is committed there, never edited here, and
Passhold runs its flows (`src/flows`) rather than its own.

**The root and Passhold's key.** The account has a root, an ECDH P-256 key
pair. Its public half is on the server; its private half is there only
wrapped — under a key the password derives (HKDF, `keyrook:v1:root-wrap`) and
under the recovery key — and is in Passhold's memory only inside a flow, for
as long as it takes to open Passhold's box. Passhold's key is drawn in
Passhold and sealed to the root's public half (its box, bound to the account
and to the name `passhold`), beside a pin sealed under Passhold's key that
names the root. So the password or the recovery key opens Passhold's key on a
new computer; nothing Passhold holds opens Authenticator's key, nor
Authenticator's Passhold's; and a box or pin the server made up opens as
nothing (`account.test.ts`, `account-server.test.ts`, and `e2e/account.spec.ts`
against a derivation written with Node's own crypto and no Keyrook code).

- **The public half is never taken on the server's word.** It is the one
  the private half just opened has; or the one this vault pinned last time,
  which is passed back so that a server hiding or swapping the root is
  caught; or, when another app replaced the root, it is accepted only on this
  computer's own word — the password or the recovery key typed here opened
  it, and this vault still holds Passhold's key to seal to it again.
- **What a vault keeps** is Passhold's key, the root's public half it
  pinned, and the session's tokens, sealed in the vault — never the root's
  private half, never on disk as they are, never in a backup
  (`e2e/account.spec.ts`).
- **Making an account** proves the address with a six-digit code, takes a
  password Passhold rates strong (the root sits on the server under it, and
  the server never sees it to check), and sends the root, Passhold's box and
  pin and their proofs from the first moment: the server refuses a Passhold
  sign-up without them (`account-server.test.ts`). Every request names the
  build (`x-keyrook-client: passhold/x.y.z`).
- **An account Keyrook Authenticator made before roots** has none. Passhold
  says so before anything changes, and only then gives it one — under the
  recovery key the account already has, typed again and checked by the
  server without Passhold ever seeing what it wrapped before, or under a new
  one, shown once (`e2e/account.spec.ts`). The sign-in that found no root
  waits in session memory for that choice and makes the root, rather than a
  second sign-in; an owner who goes no further ends it. One made with Google
  or GitHub has no password to prove its owner, and a session alone is not
  proof: its owner signs in with the provider once more, for this alone, and
  a sign-in as anyone else changes nothing (`e2e/provider.spec.ts`).

**The account's recovery key** comes with the account: 160 random bits,
shown once with every way to keep it, until its owner types two of its
groups back, chosen at random, with the key out of sight — a box to tick let
people go on with a key they never kept. The screen says to keep it apart
from the email (or the Google or GitHub account): the two together open
everything. It wraps the root (HKDF, `keyrook:v1:root-recovery`, bound to the account),
so one sheet opens every app's key. The server holds that wrap and a proof of
the key (HKDF under its own label); neither opens anything without the key.

- **A forgotten password takes the sheet and the inbox.** The key's proof
  gets the root's wrap back, the key opens it, and a code emailed to the
  address must come with the new password, which wraps the same root: whoever
  found the printed sheet still needs the inbox. Every other session ends.
- **A new sheet takes the account password**, which opens the root to wrap
  it again; the server retires the sheet before it, everywhere, and tells
  the address. It is set last: the key is drawn first and held in session
  memory only, shown as not yet in use, saved and typed back, and only then
  does the password set it. Let go before that, nothing changed and the old
  sheet still works — no account is left with a sheet its owner never kept
  (`e2e/account.spec.ts`).
- **Its key is kept sealed in the vault**, as the vault's own recovery key
  is, and shown again only with proof of the vault's owner. A sheet set since
  by another app retires the key here: it is no longer shown.
- **A sheet no Passhold has seen open the root is asked for once.** An
  account made on account.keyrook.com, or one Passhold joined after another
  app made its sheet, has a key Passhold has never seen work. Passhold's pin
  (sealed under Passhold's key, which the server cannot write) records when
  a sheet last opened the root; while it says never, the popup and Settings
  ask for the key. Typed, it must open the root the server reports, and that
  root must be the one this vault is sealed to; then the pin says so, for
  every Passhold browser, and the key is kept as one made here is. A wrong
  key changes nothing (`e2e/account.spec.ts`). It is a reminder, not a
  lock: nothing is withheld until it is typed. The server is told too, with
  the key's proof, so the account page does not remind its owner for a
  while; a server that cannot note it changes nothing here.
- **A sheet that leaked** is replaced on the account page, account.keyrook.com,
  with a new root; whoever read the old one could still have opened
  Passhold's key, and every record sealed under it. So the server asks
  Passhold for a new key of its own (`mustReplace`), and the next time
  Passhold opens its key it takes one (`replaceProductKey`), keeps the old
  one, seals every login again under the new one and sends it a revision on —
  records still sealed under the old key open here meanwhile — and lets the
  old key go only once the server holds everything under the new one. A
  passkey that held the old key is taken down, to be set up again. The old key
  opens none of what the server holds after (`e2e/account.spec.ts`).

**A second step at sign-in**, where the account's owner turned it on at
account.keyrook.com: the password, or Google or GitHub, then gives no
session but a ticket, held in session memory for the five minutes the server
keeps it, and Passhold asks for the code from the authenticator app — or the
account's recovery key in its place, or one of the account's passkeys,
answered in Passhold's own page and sent without its extension results. A
wrong code changes nothing and the ticket stays for another try. Changes
that take the owner's proof (a new recovery key, an old account's root) take
a code of their own beside the password or a provider's sign-in again: the
server takes each code once, even right after a sign-in, and counts one it
took before as a wrong one toward locking the address out. So Passhold asks
for the app's next code, saying to wait for it, and refuses here, unsent,
the code a step took in the last minute and a half. A provider's sign-in
again is spent only once its code is right: the server checks the sign-in,
then the code, so a mistyped one is typed again within the sign-in's two
minutes, and Passhold keeps it waiting in session memory until then.
Passhold says it knows a sign-in may ask for this; a build that did not
would be told to update rather than let in on the password alone
(`e2e/account.spec.ts`, `e2e/provider.spec.ts`, `e2e/passkey.spec.ts`).

**The account's name.** Given, changed and cleared on account.keyrook.com,
never here; a sign-in says it, and every sync after, and Settings shows it
beside the address. It
is the server's word, so it is text and nothing more: never taken as a sign
of who anyone is, kept to 64 characters with no control or format character
(a direction override would turn what follows it around), and put into a
sentence after the sentence's own markup is gone, so a name that looks like
markup reads as it was written (`i18n.test.ts`, `e2e/account.spec.ts`). An
email's code is taken as the email shows it, `482 913`, the space dropped.

**The account's address.** Moved on account.keyrook.com, never here, with a
code sent to the new address; every session stays, so the next sync says
it, and Settings shows it with no sign-in again. It is the server's word
too: an address with no control or format character, or the one known
stays. Who the account is never rests on it: a sign-in again with Google,
GitHub or a passkey checks the account's id, so a browser signed out before
the move still comes back to its own account, and only to that one
(`e2e/account.spec.ts`).

**Google or GitHub on an account with a password.** Either may be added to
such an account on account.keyrook.com, and signs in to it. The provider
is not what proves this account's owner: its password is. Signed in that
way, Passhold asks for the password to open the root, as at any sign-in —
or the recovery key — and asks no other browser to let this one in; the
vault then opens with the account's password. Whether an account has a
password is kept apart from the provider it signed in with, as each
sign-in says (`account.test.ts`, `e2e/provider.spec.ts`).

**Starting over**, with nothing left but the email: a code to the inbox asks
for new keys — a new root, a new sheet, Passhold's new key, a new password
where it had one — made on the device that asks, and carried out by the
server a week later. The inbox gets the account back, never the data: what
it held is kept by the server still sealed, for 90 days, and opens only with
the old password or the old recovery key, which bring Passhold's old key back
and with it the old logins, joined into the vault as a backup's are
(`e2e/account.spec.ts`, `account-server.test.ts`).

- **The week is the owner's to say no.** Whoever took the inbox gets the code
  too. Until the day, nothing changes and no session is given; every browser
  still signed in shows it in red, in Settings and the popup, with the day,
  and cancels it with one click — nothing more is asked, since cancelling
  changes nothing. The name the asking device gave is shown in quotes and cut
  short: whoever asked chose it, so it is their words, never a fact. The
  server also emails the address when it is asked for, the day before, and
  when it happens or is cancelled.
- **The new recovery key is shown when it is asked for**, and kept nowhere
  here: there is no session to keep it with until the day, when it is the
  one that opens the new root. From then, the account signs in as at any
  sign-in, and Passhold's new key is in its box. A browser the server signs
  out on the day says why.

- **The password never leaves the device.** It is reduced to `authHash` and
  the root's wrapping key (PBKDF2, then HKDF under their labels). Only
  `authHash` is sent; the server keeps a peppered slow hash of it. A server
  asking for a cheaper derivation than 600,000 iterations, or a costlier one
  than ten million, is refused before anything is sent (`account.test.ts`,
  `e2e/account.spec.ts`).
- **Each login is a record of its own kind** (`passhold.login`), sealed under
  a key drawn from Passhold's (HKDF, `passhold:v1:records`) and bound to its
  id and revision. The server hands each app only its own kinds. What it sees
  is the email, when devices sync, how many records there are and how large:
  never a password, a name, a site or a folder. Cards, addresses and notes are records
  of one kind together (`passhold.wallet`), so the server cannot tell a card
  from a note; their sealing is bound to that kind, so neither kind opens as
  the other, and a Passhold from before them passes them over rather than
  read one as a login (`wallet.test.ts`, `e2e/wallet.spec.ts`).
- **The server is untrusted.** A record that will not open is skipped — or,
  over a login this vault holds, written over at the revision after it; never
  deleted — a revision no newer than one this device holds is ignored; a
  deletion for good on another device is applied, counted and said, never
  silent. A deletion is sealed as a login is, under a label of its own and
  bound to the kind, id and revision it deletes, and takes something away
  only if it opens: the protocol's flag alone, which the server could set on
  every record it holds — even after saying it was restored from a backup,
  when no revision is checked — is skipped, and the login goes back up over
  it (`account.test.ts`, `e2e/account.spec.ts`). A login edited on two
  devices keeps the newer edit, and the other password goes into its
  history. Every sentence the server can send back is said in the reader's
  language from a table held to the kit's list (`test/i18n.test.ts`), never
  shown as it came.
- **The network never holds the vault.** A sync pulls, brings what came into
  the vault inside the write queue, pushes, and settles inside the queue
  again; a change made meanwhile goes out next time. One sync runs at a time,
  so a refresh token is never spent twice — the server ends a session for that.
- **Signing out takes the vault off this browser**, as Bitwarden's and
  1Password's do: whoever uses it next finds nothing of its owner's, and
  signing in again brings everything back from the account. It happens only
  after a last sync leaves nothing the account does not hold; otherwise
  nothing is removed, and the person is told how many logins have not reached
  it (`e2e/account.spec.ts`).
- Signed out by the server, the vault keeps every login and asks to sign in
  again; signing in picks up where it stopped. A vault linked before each
  app had a key of its own holds the account's old shared key: it is dropped
  on opening, the vault is signed out, and signing in again gives Passhold
  its own key and sends every login up under it; a passkey record holding
  the old key is taken down.
- **Removed from the account** on its page, this browser hears so at its
  next call (`device_removed`). Only when the proof the page sent checks out
  under Passhold's key (`removalProved`), which the server never holds, does
  Passhold take the account's logins, cards, addresses and notes off it,
  with Passhold's key, the account's recovery key and the session; one added
  or changed here and never sent stays, this browser's own
  (`removedFromAccount`), and a notice says so until its owner closes it.
  With no proof, a bent one, or one replayed from an earlier session — whose
  device id this one, drawn anew at each sign-in, never shares — it is an
  ordinary sign-out and everything stays: the server can sign a browser
  out, never empty it (`e2e/account.spec.ts`).
- **Google and GitHub** sign in to an account with no password. The sign-in
  happens in Passhold's own tab: it goes to Keyrook's server, on to the
  provider, and comes back on a page of the server's that hands the answer to
  Passhold — the one web page that may message it (`externally_connectable`,
  checked again by sender in the service worker). The answer is a ticket
  worth nothing without a PKCE verifier that never left session memory, and
  it is taken only if its state is the one this browser sent
  (`e2e/provider.spec.ts` forges both). Making such an account makes its
  recovery key too, which its root is wrapped under, and it cannot be skipped.
- **Nothing Google, GitHub or Keyrook holds opens such an account's keys.** A
  new browser gets Passhold's key from a Passhold browser already in, after a
  person sees the same fifteen-character code on both — worked out over both
  browsers' ECDH keys, Passhold's name and the account, so a server that
  swapped a key or routed the request to another app's browser would show
  two codes — or with the recovery key, which opens the root. A key that
  arrives is taken only if Passhold's pin opens under it: one the server
  chose, wrapped correctly for this browser, is still refused
  (`e2e/provider.spec.ts`).
- **A passkey opens such an account on a new computer.** The passkey that
  unlocks the vault is asked, in the same touch, for a second answer to a
  fixed public salt; Passhold's key goes up wrapped under it (HKDF, then
  AES-GCM bound to the record's name), as a record of Passhold's own kind
  that the server cannot open. Kept by Google Password Manager, the passkey
  is on every Chrome its owner signs in to: a new computer signed in with
  Google asks it, and is in. Whoever holds both the Google or GitHub sign-in
  and the passkey — itself behind Google's screen lock or PIN — can open
  Passhold's key; that is what it is for. The key it opens is taken only if
  Passhold's pin opens under it, and a wrap the server changed is refused
  (`e2e/passkey.spec.ts`).
- **The account's own passkeys sign a new computer in.** A passkey added on
  account.keyrook.com belongs to that site; Chrome lets Passhold use it only
  with the host permission for it, which is optional, asked for when its
  owner chooses a passkey, and used for nothing else (the CSP still allows
  the Keyrook server alone, and Passhold's passkey scripts stay off the
  page). The passkey is asked in Passhold's own page, for a challenge the
  server issued for that site alone — one naming any other is refused. Its
  answer goes to the server without the PRF answer, which the server
  refuses anyway; the PRF answer opens the account's root in the service
  worker, and the root Passhold's key, as the password does — a root the
  server names is never taken. A passkey that only signs in opens nothing,
  and its session is ended (`account-server.test.ts`,
  `e2e/passkey.spec.ts`); one whose authenticator gives no PRF answer is
  refused before its answer is sent. The person is told which it is, since
  the account's page lets either in and is where each is set right: one
  with no wrap there may be let unlock, one with no PRF answer needs another
  passkey kept elsewhere. Signed in this way, no password was typed, so the
  vault opens with this computer's own unlock. Passhold's own passkey record
  (above) stays where it is set up; the account's passkeys are the way for
  new computers from now on.
- **One password.** A vault made by signing in with an email address
  opens with the account's own password where there is no fingerprint
  reader — wrapped as any master password is, PBKDF2 at 600,000 rounds —
  and follows it when it changes: signed in with the new one, the vault is
  wrapped under it and the old one opens nothing (`e2e/join.spec.ts`).
- **Signing in can come before the vault**, on a computer where Passhold is
  new. The session and Passhold's key wait in session memory — where an
  open vault's data key waits, closed to content scripts, never on disk — for
  at most fifteen minutes, and go into the vault the moment it is made with
  them. Choosing to start empty instead ends that session on the server.
  Such a vault's own recovery key is not pressed on its owner: signed in, the
  account brings every login back, and the Security page says so rather than
  that the key is put away.

**Where this is weakest.** The password and the recovery key each open the
root, and so every app's key: whoever has the password has everything, as
they always did. What keys per product take away is the rest: a Passhold
compromised while unlocked holds Passhold's key, not Authenticator's. A new
sheet, a forgotten password and starting over are Passhold's own screens;
replacing the root itself, or changing the account password, are left to
the account's own page, and a root another app replaced is taken here only when this computer
holds Passhold's key and its owner types the password or the sheet again.

## A family's shared vault

A family is made and run on account.keyrook.com: who is in it, who
organises it, and its keys. Passhold shares vaults in it, through the
account's own family flows (`openFamily`, `sealFamilyRecord`, `pullFamily`,
`pushFamily` in `@keyrook/account`), and wires none of the family's calls
itself. The labels its records and keys are sealed under are frozen with the
account's, so what is sealed today opens the same in every later version.
Until the account's server offers families, Passhold asks, hears that none
are, and keeps none.

- **Opened with Passhold's key.** Each member has a member key for the
  family, sealed under each product's key; Passhold opens its own copy and
  never holds the account's root for it. Where Passhold has no copy yet — it
  had no key in the account when its owner joined — the account's password,
  typed once in Passhold's own page, opens the root here, and the member key
  is kept under Passhold's key from then on. The password is not sent.
- **Who holds which key is the roster's to say**, under a MAC the server
  cannot make, checked against the roster this browser pinned, sealed under
  Passhold's key in the vault. A roster older than the pin, or one that lists
  another key for someone, is refused. The family's key from someone not
  pinned, or a collection's key from someone whose key changed, is not taken
  until the two compare a code on two screens; the person says whether the
  codes match, and only a key the flows named is trusted then
  (`trustMember`), never one a page names. An organiser this browser pinned
  who compared that key as they let its holder in, and said so in a word only
  the two of them could make — a MAC under a key their two member keys
  agree — stands for that comparison: the server can drop such a word, never
  make or bend one (`e2e/family.spec.ts` bends one). Let in without
  comparing, nobody's word goes with a key. A key this browser saw end —
  someone gone's, or one someone replaced — is taken for nothing new: it
  sends no family key, hands over no collection key newer than those already
  seen, and no organiser's word brings it back, only two screens comparing a
  code. The code is shown as the account
  gives it, so it reads on both screens alike. Settings lists who is in a
  family by that roster alone, their names and addresses as the server gives
  them, as text; until the family opens here, nobody is listed.
- **Each item one record of the family's**, sealed under the collection's
  key in use, bound to the family, the collection, the generation, the id
  and the revision, with Passhold's own kind sealed inside it: a card's
  record never opens as a login, nor a record moved from another collection
  as this one's (`account/family.ts`). The server learns how many items a
  shared vault holds and when they change, never what they are, nor the
  vault's name.
- **A deletion is sealed too.** The flags the server could set on any record
  delete nothing: Passhold seals its deletions of shared items as values in
  live records, and takes only those. A record the flows cannot read is never
  taken; over an item this browser holds, its own copy goes up above it, as
  the vault's own does (`e2e/family.spec.ts`).
- **Nothing goes up under a key someone gone still holds.** Once someone
  who held a shared vault's key leaves, what is changed in it waits on this
  browser, unsent, and its people are told why, until an organiser's
  Passhold gives everyone left new keys, which it does as it syncs
  (`rotateFamilyKeys`), or the account page does; the server refuses it
  meanwhile. Nobody is given a new key on a key this browser has not taken:
  the rotation waits for that code to be compared. A rotation runs with
  nobody watching, so it never seals to the server's list of who holds a
  vault: it seals to the list sealed under the vault's key, which only someone
  holding that key could write, and a vault with no such list stays as it is.
  Then everything this browser holds of the vault goes up again under the new
  key, not only what changed, as the account leaves each product to do.
- **Someone gone is named.** Whoever the roster stops listing is said once by
  the flows (`left`), and Passhold keeps it above the list and in Settings,
  by the name this browser last knew, until its owner closes it. It says
  Passhold cannot tell why they went, for it cannot (below): this is how a
  server's putting someone out comes to be seen, by someone who knows they
  never left (`e2e/family.spec.ts`).
- **Only an organiser destroys.** Anyone in the family changes a shared
  item, and its earlier passwords are kept as the vault's own are; anyone
  restores from its trash; emptying the trash, or deleting one item from it
  for good, is an organiser's. Moving an item of one's own into a shared vault
  takes it out of one's own, under a new id, without its earlier passwords.
- **Nothing a family held is lost to its going.** A family left, or a shared
  vault this account is no longer let into, goes with what it held — the
  family still holds it — but an item added or changed here and never sent
  moves into the vault's own. Signing out counts what a family has not been
  given yet, as it counts the vault's own.
- **Filled as the vault's own is.** A shared login is offered on its own site
  only, named by its vault, and filled by the same checks. A website's passkey
  kept with a shared login travels with it, and a page is never handed its
  private key: it signs in the service worker, for its own site only, as the
  vault's own do — whoever shares a login shares signing in to it. A new
  passkey is always kept in the vault's own; one a site already holds in a
  shared vault is not made again.

**Where this is weakest.** Everyone in a family can read what it shares, and
what they read cannot be taken back: removing someone changes the keys for
what is added from then on, and nothing more. Someone who compared a code
without looking is trusted as if they had looked — and an organiser who did,
by everyone their word reaches. A
browser that first opens a family takes its roster as the server sends it,
with nothing pinned to hold it to, as the account page does. Who has gone is
the server's word: someone who starts their account over keeps no key to say
so with, so an organiser's Passhold gives everyone left new keys without them
on the server's say, and nothing stops a server putting someone out that way.
Everyone left is told; the one put out is not, and only people can undo it.

## The vault at rest

- A random 256-bit data key encrypts the vault with AES-256-GCM. The payload
  is bound to the vault's id as associated data, so a payload from another
  vault does not open in this one (`vault.test.ts`: spliced payload, flipped
  bit).
- The master password, through PBKDF2-HMAC-SHA256 at 600,000 iterations with
  a random salt, derives a key that wraps the data key. That derived key is
  non-extractable. Changing the password re-wraps 32 bytes under a fresh salt;
  the logins are not touched (`vault.test.ts`).
- The KDF settings live in the file, so the file's word on them is checked:
  fewer than 100,000 iterations, more than 10 million, or an unknown
  algorithm is refused (`vault.test.ts`). A file from a newer Passhold is
  refused rather than opened and rewritten without what it did not know.
- A decrypted payload is still input: every field is type-checked and
  bounded on the way in (`vault.test.ts`: hostile payload).
- The master password has a ten-character floor and is never stored. Nobody
  can recover a vault whose password is forgotten; the setup screen says so
  and asks for that to be acknowledged.

## A vault with no master password

Where the device has an unlock that answers PRF (see below), the vault can be
made without a master password (`recovery.test.ts`, `e2e/passwordless.spec.ts`):

- The file is sealed exactly as above, but under a **recovery key** Passhold
  draws: 120 random bits, in Crockford base32, six groups of four. There is
  nothing to guess, so the file and its backups are safe from password
  guessing however weak a person's memory.
- The key is kept only sealed inside the vault's payload, never readable on
  disk or in memory (`e2e/passwordless.spec.ts` looks in both), so its owner
  can see it again — after proving themselves, as for export — while the
  vault still opens. It opens as much as a master password would, and whoever
  can read the payload can read every password already.
- Most people keep nothing they are not pushed to, so it is offered every
  way that stays on the device: a file, the clipboard (cleared as a copied
  password is), a QR code drawn here for a phone to read, and a printed
  sheet. It counts as put away only once two of its groups, chosen at
  random, are typed back with the key out of sight; until then the popup and
  the checkup keep asking. A new one can be made, which stops the old one opening the vault,
  though backups made before still open with it.
- Every day the vault opens with the device. The device's copy of the key
  stays until a master password is set: without it, only the recovery key
  would open the vault.
- Moving to a master password, or back, re-wraps the data key under the new
  secret after the owner proves themselves; no login is re-encrypted.
- What this trades: lose both the device and the recovery key and nobody can
  open the vault. And whoever can satisfy the device's authenticator can open
  it, as with any device unlock.

**Where this is weakest.** PBKDF2 is what Web Crypto offers; it is not memory
hard. Someone who copies the vault file can try passwords on a GPU, and a
weak master password will fall. The KDF is versioned so a later release can
move to Argon2id on the next unlock without re-encrypting a login.

## Unlocking with a PIN

A six-digit PIN has a million values; on disk, a copy of the file would give
it up in minutes. So the PIN never guards anything on disk
(`checkup.test.ts`, `e2e/smart.spec.ts`):

- While the browser stays open, the data key is kept wrapped by a key derived
  from the PIN (PBKDF2, as for the master password) in session memory, beside
  the unwrapped key while unlocked and in its place once locked. The disk
  never sees it (`e2e/smart.spec.ts` dumps storage and looks).
- Five wrong PINs and that copy is gone: the service worker counts the tries,
  no page can reset them, and from then on another way in is needed. Closing
  the browser drops it too.
- Setting, changing or turning off the PIN asks for proof of the owner (the
  vault's secret, the device, or a security key): it is a new way in, and
  whoever is at an unlocked browser holds the data key but not necessarily
  any of them. Right after a vault is made to open with a password or a
  code, a PIN is offered once, before anything else; the proof is that
  password, typed a moment before, kept by the page only until the offer is
  answered (`e2e/join.spec.ts`).
- The PIN itself is sealed in the vault's payload, so unlocking another way
  can make the copy again — with a full set of tries — without asking for
  the PIN.

## Unlocking with Touch ID, Windows Hello or a screen lock

The device's platform authenticator holds a secret that never leaves it. A
credential made for Passhold's own origin — no web page can ask it for
anything — answers a fixed salt with 32 bytes (WebAuthn's PRF extension),
after the person proves themselves to it. Those bytes, through HKDF and bound
to the vault's id, wrap the data key (`checkup.test.ts`, `e2e/device.spec.ts`):

- The wrapped copy may stay on disk across restarts: there is nothing in it to
  guess, only 256 bits the authenticator alone can produce. The disk never
  holds the key itself (`e2e/device.spec.ts`).
- Another authenticator's answer, or this one's for another vault, opens
  nothing (`checkup.test.ts`, `e2e/device.spec.ts`).
- Setting it up asks for the master password, as the PIN does — checked
  before the authenticator is asked, so a mistyped password leaves no passkey
  behind (`e2e/device.spec.ts`). Turning it off takes it off the disk and
  asks for nothing: one way in fewer.
- Not every place Chrome keeps a passkey answers PRF. A passkey in Google
  Password Manager does; one in the Chrome profile does not, nor iCloud
  Keychain before macOS 15, and the settings page says which to choose.
- Where there is no PRF but the authenticator keeps a few bytes with the
  passkey (WebAuthn's largeBlob, which iCloud Keychain has from macOS 14),
  32 random bytes are kept there instead, and serve the same way: handed back
  only to the person the authenticator answers to, never on disk; random
  bytes in their place open nothing (`e2e/device.spec.ts`). Such a passkey
  opens the vault on this computer; it does not open the account on another,
  which needs PRF. Where neither comes, nothing is kept.
- What it does not change: anyone who can satisfy the authenticator can open
  Passhold — on most computers that includes whoever knows the computer's own
  password, which the authenticator accepts in place of a fingerprint. The
  settings page says so before it is turned on.
- No server checks the WebAuthn signature, so the challenge is only random
  bytes: the proof is the answer itself.
- The popup asks the authenticator as soon as it opens, since opening it is
  asking to get in; the settings page waits for the button. A dismissed
  prompt says nothing and leaves the PIN and the password to type
  (`e2e/device.spec.ts`).

## Unlocking with a security key

A USB security key — a FIDO2 key with hmac-secret, which Chrome offers as
PRF — opens the vault too, beside the master password or recovery key, this
computer's own unlock and the PIN, never in their place (`keys.test.ts`,
`e2e/keys.spec.ts`):

- It is asked as the device is: a credential for Passhold's own origin
  answers a salt of its own with 32 bytes once the key's PIN is typed and the
  key is touched (user verification required), and those bytes, through HKDF
  and bound to the vault's id, wrap the data key. Each key has its own copy
  on disk, beside the device's, and an answer opens only the copy of the
  authenticator it is said to come from: a key's answer opens neither
  Touch ID's copy nor another key's, nor the reverse, and a proof is held to
  the same (`e2e/keys.spec.ts` asks each authenticator itself, as a page
  could, and swaps the answers).
- The credential is not discoverable. The key keeps nothing of Passhold's
  and gives up none of the few places it has for passkeys (retail keys hold
  tens): it answers only to the credential's id, which this browser alone
  keeps (`e2e/keys.spec.ts` looks in the authenticator). PRF alone: a key
  without it — one made only for two-step sign-in (U2F) — is refused and
  nothing is kept, and no bytes are ever stored on a key (largeBlob), as
  they are in a passkey that lacks PRF. The same key added twice is refused
  by the key itself.
- Adding a key asks for proof of the owner, as the device does — checked
  before the key is asked, so a mistyped password costs no PIN and makes
  nothing; the service worker checks it again however it is asked
  (`e2e/keys.spec.ts`). Removing one asks for nothing: a key is never the
  only way in. A vault with no master password opens with this computer's
  own unlock, and a key does not stand in for it there.
- Where there is no device unlock to ask, a key set up here proves the owner
  as the device would: plain text out, a new PIN or a new way in
  (`e2e/keys.spec.ts`).
- It opens Passhold only in the browser where it was set up: its copy of the
  key is in that browser's storage. On another computer it opens nothing
  until it is set up there too, with proof there. Removing the vault, or
  making a new one, takes every key's copy with it.
- What it trades: whoever holds the key and knows its PIN can open Passhold
  wherever it was set up. The key guards its PIN — a FIDO2 key blocks after
  eight wrong ones, and only a reset, which voids every credential on it,
  unblocks it — but only a key that keeps its secret does: an unhardened one
  (a development board) gives it up to whoever holds the key, PIN or not,
  and belongs on test vaults alone. Losing a key leaves the other ways in.
  The settings page says both before a key is added.
- The popup offers the key and waits for the button, unlike the device: a
  key may be in a drawer, and a prompt would stand there waiting for it
  (`e2e/keys.spec.ts`).
- A key opens this vault on this computer; it does not open the Keyrook
  account on another. Passhold's own passkey for new computers is the one
  that unlocks the vault where it was made — a computer let in with it makes
  it that computer's only way in, which a key is never meant to be — so a
  key is not made that passkey. A security key added on account.keyrook.com
  as one of the account's own passkeys is the way meant for that (above).

## While unlocked

- The unwrapped key is kept in `chrome.storage.session`: memory only, wiped
  when the browser closes, and readable only by Passhold's own pages
  (`TRUSTED_CONTEXTS`). The disk never sees it (`e2e/vault.spec.ts`).
- The vault locks after the chosen idle time, when the computer locks, and
  on "Lock". A lock never waits behind a write in progress, and a write that
  finishes after a lock does not put the vault back.
- Idle is counted from the last click, key or wheel in one of Passhold's
  pages, or the popup or Settings opening — which no web page can do. Never
  from a request a page makes by itself: the list, the save prompt and the
  passkey frame are put up by whatever web page they are on, ask what to show
  as they load, and would otherwise hold the vault open for as long as its
  owner is away (`e2e/smart.spec.ts`).
- A copied password is cleared from the clipboard after the chosen time.

## Who may ask the service worker for what

The service worker is the only thing that opens the vault. Chrome stamps
every message with the sender's origin, and that origin — never anything the
message claims — decides what it may ask (`test/sender.test.ts`):

- **Passhold's own pages** (`chrome-extension://<id>`): the vault API.
- **The content script** (the web page's origin): whether to draw its button,
  a token for the list, "a sign-in was just sent", "a checkout was just
  sent", "this frame holds a card's fields", "the list drawn for this frame
  is no longer wanted", and a
  website's request for a passkey (below). Nothing that returns a login, a
  card or an address. It runs in every page; whatever it may ask for, a page
  that takes over its renderer may ask for too.

Nor can the content script reach what Passhold keeps: local storage, where
the sealed vault file and the device's and keys' copies of the key are, is
closed to it as session storage is (`TRUSTED_CONTEXTS`, set at every start
and kept by Chrome across restarts). Open, a page that took over its
renderer could take the file to guess the master password against offline,
or write over the vault or remove it (`e2e/renderer.spec.ts`, which runs in
the content script's own world what such a page would).

## Filling

1. The person presses the Passhold button in a field. The content script asks
   for a token; the service worker records the frame's document, origin and
   address *as Chrome reports them*.
2. The list is `menu.html`, an extension page framed into the web page inside
   a closed shadow root. It asks the service worker for logins with the token,
   and is answered only from a page in the same tab. A web page cannot frame
   `menu.html` itself, even at the same address (`use_dynamic_url`,
   `e2e/autofill.spec.ts`), and cannot read the frame.
3. Only logins for the frame's own site are listed:
   - a site is its registrable domain from the Public Suffix List, private
     section included, so `alice.github.io` and `mallory.github.io` are two
     sites (`match.test.ts`);
   - a page over plain http is offered only a login saved for exactly that
     origin, never one from the https site (`match.test.ts`,
     `e2e/autofill.spec.ts`);
   - an address or `localhost` matches only its exact origin.
   A cross-site frame inside a page is its own site and is offered its own
   logins, not the page's (`e2e/autofill.spec.ts`).
4. A click in the list goes to the service worker, which checks the login
   against the site again and sends it to that one document by `documentId`.
   The content script checks the origin once more before typing.
5. Only visible fields are filled. A password field hidden beside the real
   one gets nothing (`e2e/autofill.spec.ts`).
6. A list or prompt that the page has covered, faded or transformed will not
   act: IntersectionObserver v2 reports whether the frame is really seen,
   computed by the browser out of the page's reach.
7. A click counts only once the frame has been seen, where it is, for half a
   second. A list put up, filled with its rows, or moved — the page scrolled,
   or moved or resized the field — under a pointer already on its way down,
   as the second click of a double click a page asked for, chooses nothing
   (`e2e/autofill.spec.ts`). The content script says when it moves the frame;
   a page that moves it by restyling what holds it, rather than the field,
   goes unseen by that, and is left to the half second from when it appeared.

From the popup, "Fill" goes to the active tab's top frame. Passhold has no
`tabs` permission, so Chrome does not tell it a tab's address, and the
frame's own word for it is never taken — a page that took over its renderer
could name any site, and be handed its login. The frame is asked to check in
instead, and where it is, is what Chrome stamps on that message; the fill
goes to that document alone (`e2e/renderer.spec.ts`).

Nothing fills without a click. There is no fill on page load.

The list may open by itself, so the person does not have to find the button:
when a sign-in field is clicked or reached with Tab, and the vault is open,
and there is something to offer — logins for the frame's own site, or a
strong password for a new-password field. A page's own script focusing a
field does not open it: only a trusted click or key does, and script cannot
make one (`e2e/smart.spec.ts`). Opening the list is all this does; filling
from it still takes a click in Passhold's frame. The answer to "is there
something to offer?" tells a frame whether its own site has a saved login —
which the height of the list told it already, and which the site learns at
the next sign-in anyway.

## Cards and addresses

A card or an address belongs to no site, so the list under a card's or an
address's field offers every one, and fills the one the person clicks; the
list names a card by its network, its last four digits and its expiry, never
its number or its code. The rest is filling as above: the frame that asked,
by `documentId`, its origin checked again before a character is typed, only
visible fields (`e2e/wallet.spec.ts`), and nothing without a click.

- **A card fills only an https page**, as Chrome's own autofill: a page over
  plain http sends it for anyone on the way to read. The list says so, and
  the service worker refuses even when asked directly (`e2e/wallet.spec.ts`).
- **A card fills its own fields, an address its own**: the card's fields of
  the form it was chosen in, never the address beside it, and the other way
  round. A security code a checkout hides as a password is the card's, never
  a password to offer a login for or to save (`e2e/wallet.spec.ts`).
- **A card split across a payment provider's frames** — number, date and code
  each in a frame of their own — reaches every frame of that provider's
  origin in the tab that said it holds a card's fields, and no frame of any
  other origin: a frame of the same origin could read it from the first one
  anyway (`e2e/wallet.spec.ts`).
- **A frame too small to hold the list** has it drawn in the top frame,
  beside it. The frame posts a random word to the top window and sends the
  same word with its request; the top frame draws the list beside the frame
  whose window the word came from. The page can read the word but cannot post
  it from that window, and all a wrong frame would get is the list in the
  wrong place: what is chosen still fills the field's own document. The list
  is the same extension page in a closed shadow root, kept to the frame's own
  box.
- **Search never takes a whole card number**: a card is found by its last
  digits, so its number need not be typed into a search box (`wallet.test.ts`).
- Cards, addresses and notes go to the trash as logins do, travel in backups,
  and are filled nowhere a note is concerned: a note is shown and copied only
  in Passhold's own pages.

**Offering to save what a checkout sent.** When a form is sent — or a
button that says it pays is pressed — the content script reads the card from
its card fields and the address from an address form's, only fields a person
can see: a card number the page hides before the real one is never what is
offered (`e2e/wallet.spec.ts`). They wait in session memory for five minutes,
as a sign-in does, and are checked as anything typed is:

- A card is taken only from an https page, and only when its number adds up:
  a slip of a digit, saved, would be filled in at every checkout after
  (`wallet.test.ts`, `e2e/wallet.spec.ts`).
- One the vault has as it is says nothing; one whose date, code or name
  changed is offered as an update, which keeps the card's own name and notes
  (`wallet.test.ts`).
- The prompt names the card by its network and last four digits and the
  address by its first line; never the number or the code
  (`e2e/wallet.spec.ts`). Saving takes a click there; locked, it waits for the
  popup.
- It can be turned off in General, apart from sign-ins; and "never for this
  site" is not offered, as it would stop the site's sign-ins too.

A card split across a payment provider's frames is not offered: the frames
that hold it are not the one that sends the checkout.

## Saving

When a form with a password is sent, the content script reports the
username and password. The service worker keeps them in session memory for
five minutes, decides whether they are new, a changed password, or already
known, and shows the save prompt — another framed extension page, which
shows the username and site but never the password. Saving while locked
waits for the popup to be unlocked. "Never for this site" is remembered in
the vault.

A page can make the prompt appear with whatever it puts in its own fields;
saving still needs a click, and saves only for that page's own site.

## Websites' passkeys

A site that offers passkeys asks `navigator.credentials`; Passhold answers
the way Google Password Manager or iCloud Keychain do — it makes the passkey,
keeps it in the login for that account, and signs in with it.

1. `webauthn.js` runs in the page's own world before the page, in the top
   frame, and stands in front of `navigator.credentials`. It holds nothing
   and is trusted by nothing: the page can read and replace it. It passes the
   request to `bridge.js`, Passhold's script beside it, which takes a message
   only from its own window — a frame of another site inside the page posting
   to its parent does not speak for the page (`e2e/site-passkeys.spec.ts`).
2. The service worker reads the request as input: every field checked and
   bounded (`webauthn.test.ts`). Where it came from is the frame's origin and
   document *as Chrome reports them*. The site it is for (the relying party
   id) must be that origin's host, or a parent of it within the same
   registrable domain, private suffixes included: `alice.github.io` cannot
   make or use a passkey for `github.io`, nor `example.com` for `com`
   (`webauthn.test.ts`, `e2e/site-passkeys.spec.ts`). Secure pages only, and
   `localhost`. Anything else — another site, a security key, a request
   Passhold cannot read — is left to the browser, which answers as it would
   without Passhold.
   The Keyrook account's page, `account.keyrook.com`, is left out entirely:
   its passkeys answer PRF with what opens the account's root, and so every
   app's key, so `webauthn.js` and `bridge.js` never run there (the
   manifest's `exclude_matches`), and a request for it from anywhere is
   refused (`rpIdFor`). Its answer passes through nothing of Passhold's, and
   a passkey that opens Passhold is never kept in Passhold, where losing the
   computer would lose both (`manifest.test.ts`, `webauthn.test.ts`,
   `e2e/site-passkeys.spec.ts`).
3. The person chooses in `passkey.html`, an extension page framed into the
   page as the list is: the page cannot read which accounts are offered,
   cannot frame it itself, and a covered frame will not act. Or, for a site
   that offers passkeys in its username field's own list (conditional
   mediation), in Passhold's list under the field. "Save it elsewhere" or "Use
   a passkey from elsewhere" hands the request to the browser — its own
   dialog, with iCloud Keychain, Google Password Manager, a phone or a key.
   What comes back looks to the site like the browser's own credential, its
   methods replaceable as the browser's are: GitHub's library replaces
   `toJSON` on it (`e2e/site-passkeys.spec.ts`).
4. The service worker signs. The private key never leaves it: pages are told
   a login has a passkey, for which site and account, and nothing more
   (`e2e/site-passkeys.spec.ts`). What it signs includes the origin Chrome
   reported, so a signature made for one site means nothing to another
   (`webauthn.test.ts`). The answer goes to the document that asked, by
   `documentId`.
5. A passkey is saved before the site hears of it, so the site never holds
   one Passhold lost. One the site makes again for the same account replaces
   it, and the old one goes to the trash, not away. A passkey the site says it
   already holds is not made twice.

Every passkey is P-256, discoverable, and says it is backed up: it lives in
the vault, its backups and the account. The vault being open counts as the
person verified, as in other password managers: they proved who they are to
open it, and choose each passkey in Passhold's own frame. The counter stays
at zero, as synced passkeys' do. Attestation is "none"; a site can tell the
passkey is Passhold's from its AAGUID, and nothing about the person. A CSV
export cannot carry passkeys; a backup does.

A passkey made elsewhere comes in only from Bitwarden's JSON export, and only
as one Passhold would have made: P-256, its private key one WebCrypto signs
with, its count still at zero — a site that has seen a count could take a
zero for a copy — and for a site's own name: never an address, a public
suffix, or the Keyrook account, whose passkeys open Passhold. The page that
reads the file checks each, and the service worker checks again whatever a
page sends (`importLogins`); one that fails is left, and the page says how
many, so its owner keeps the old manager until each site has another
(`bitwarden.test.ts`, `e2e/site-passkeys.spec.ts`).

A locked Passhold puts up its frame — asking to be opened, in its own popup —
only for a site it held a passkey for when last open; every other site's
sign-in is the browser's at once. That list is kept in session memory, gone
with the browser.

Not handled, and left to the browser: requests from frames inside the page,
a site naming another site of its own as related (Related Origin Requests),
making a passkey quietly after a password sign-in (conditional create), and
the PRF and large-blob extensions.

## Plain text out

Exporting asks for proof of the owner even when unlocked — the master
password or recovery key, the device's unlock, or a security key set up
here — and the page says what a CSV file is. Importing reads a file the person chose, bounded in size
and rows, and cleans every field the same way a typed login, card or address
is cleaned; what an exporter writes as JSON (Bitwarden's export, Proton's
cards and identities in a cell) is read only for the fields it names, as
strings, and anything else in it is kept as a note's words or left out,
never run or merged (`csv.test.ts`, `bitwarden.test.ts`). An encrypted
Bitwarden export is refused by name: Passhold asks for no Bitwarden
password, and opens nothing sealed under one.
A login's two-step secret is counted and kept nowhere: the page says how
many the file holds, and where to move them, before the old manager is
deleted with them in it.

## Backups

A backup is the vault file itself, downloaded: sealed exactly as it is on
disk, so it holds nothing readable (`backup.test.ts`, `e2e/backup.spec.ts`)
and is as safe in a cloud drive as on this computer — and as exposed to
password guessing as the vault file, which is why the master password's
strength matters. Making one asks for proof of the owner. It opens with the
vault's secret in use when it was made — the master password, or for a vault
with none, the recovery key: changing either later does not re-lock old
backups, so after one is exposed, old backups are worth deleting.

Restoring reads a file the person chose, which may have been damaged, swapped
or made by someone else, so it is input like any other (`backup.test.ts`):

- Only the fields a vault has are kept, the KDF is bounded as it is for the
  vault on disk — a backup cannot bring a one-iteration KDF onto the device —
  and the payload is sanitised field by field.
- A damaged payload is reported as a damaged backup, a wrong password as the
  backup's password: neither is mistaken for a problem with the vault here.
- Into a browser with no vault, the backup becomes the vault, sealed afresh.
  Into one with a vault, it must be unlocked, and the backup's logins are
  added: nothing is removed, a login both have keeps the newer edit, and the
  other password goes into its history. Settings stay the vault's own.

## The checkup and site marks

The checkup — weak passwords, passwords used for more than one login, a
backup missing or behind — is worked out in the page from the vault, and
nothing is sent anywhere for it. It does not check passwords against breach
lists, because that would mean asking a server. "Change" opens the site's
own `/.well-known/change-password` address in a new tab: a visit the person
chooses, not a request Passhold makes.

The mark beside a login is compiled into the extension (NOTICE.md) and chosen
by the login's own websites, never fetched: an icon requested at display time
would tell whoever serves it every site its owner has an account on. A login
saved for a look-alike host does not wear the real site's mark
(`checkup.test.ts`).

## Not defended against

- Malware on the computer, or another extension with broad permissions.
- Someone at the browser while it is unlocked.
- A weak or reused master password, against someone who has the vault file.
- A site that is itself compromised: it is the site the login is for.
- A page learning that Passhold is installed. The passkey script stands in
  front of the browser's methods without changing how they look — on the same
  prototype, with their names, lengths and "[native code]"
  (`e2e/site-passkeys.spec.ts`) — because anti-bot checks that see a replaced
  function fail the sign-in they guard. A page set on finding out still can,
  as with every password manager that offers passkeys. It learns nothing of
  the vault from it — at most, from a sign-in it starts, whether Passhold
  holds a passkey for its own site, which it would learn the moment the
  person signs in.
- Bot checks are left alone: no script of Passhold's runs in Cloudflare's
  Turnstile or challenge pages, reCAPTCHA or hCaptcha, and on any page the
  field button is drawn only once a sign-in field needs it
  (`e2e/autofill.spec.ts`). Anything a script changes in such a check can fail
  it, and with it the sign-in around it.
