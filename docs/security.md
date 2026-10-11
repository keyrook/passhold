# Passhold's security design

What Passhold defends, against whom, and where each defence lives. Every
claim here has a test that tries to break it; the test is named beside it.

## What it holds

Logins — a name, a username, a password, the websites it is for, notes — in
one vault per browser profile. Nothing leaves the machine: there is no sync
server, no favicon service, no breach check (`connect-src 'none'`,
`test/manifest.test.ts`).

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

**Where this is weakest.** PBKDF2 is what Web Crypto offers; it is not memory
hard. Someone who copies the vault file can try passwords on a GPU, and a
weak master password will fall. The KDF is versioned so a later release can
move to Argon2id on the next unlock without re-encrypting a login.

## While unlocked

- The unwrapped key is kept in `chrome.storage.session`: memory only, wiped
  when the browser closes, and readable only by Passhold's own pages
  (`TRUSTED_CONTEXTS`). The disk never sees it (`e2e/vault.spec.ts`).
- The vault locks after the chosen idle time, when the computer locks, and
  on "Lock". A lock never waits behind a write in progress, and a write that
  finishes after a lock does not put the vault back.
- A copied password is cleared from the clipboard after the chosen time.

## Who may ask the service worker for what

The service worker is the only thing that opens the vault. Chrome stamps
every message with the sender's origin, and that origin — never anything the
message claims — decides what it may ask (`test/sender.test.ts`):

- **Passhold's own pages** (`chrome-extension://<id>`): the vault API.
- **The content script** (the web page's origin): whether to draw its button,
  a token for the list, and "a sign-in was just sent". Nothing that returns a
  login. It runs in every page; whatever it may ask for, a page that takes
  over its renderer may ask for too.

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

Nothing fills without a click. There is no fill on page load.

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

## Plain text out

Exporting asks for the master password even when unlocked, and the page says
what a CSV file is. Importing reads a file the person chose, bounded in size
and rows, and cleans every field the same way a typed login is cleaned
(`csv.test.ts`).

## Backups

A backup is the vault file itself, downloaded: sealed exactly as it is on
disk, so it holds nothing readable (`backup.test.ts`, `e2e/backup.spec.ts`)
and is as safe in a cloud drive as on this computer — and as exposed to
password guessing as the vault file, which is why the master password's
strength matters. Making one asks for the master password, because the file
opens with nothing else; a backup its owner cannot open is no backup. It
opens with the password in use when it was made: changing the master password
later does not re-lock old backups, so after a password is exposed, old
backups are worth deleting.

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

## Not defended against

- Malware on the computer, or another extension with broad permissions.
- Someone at the browser while it is unlocked.
- A weak or reused master password, against someone who has the vault file.
- A site that is itself compromised: it is the site the login is for.
