<p align="center">
  <img src="vendor/keyrook-brand/assets/passhold-icon-128.png" width="88" height="88" alt="">
</p>

<h1 align="center">Passhold</h1>

<p align="center">
  A password manager by <a href="https://keyrook.com">Keyrook</a>, as a Chrome extension.<br>
  Your logins, encrypted on your own machine, filled with one click.
</p>

<p align="center">GPL-3.0-or-later</p>

## Why the source is open

A password manager holds the keys to someone's whole online life. You should
not have to take anyone's word for how it is protected — so the code that runs
on your machine is here to read, build and check against what the store ships.

This repository is a published copy of the development tree, updated at each
release. Each release is tagged here (`vX.Y.Z`).

## What it does

- **Saves your logins** and fills them from a button in the sign-in field;
  offers to save new ones as you sign in.
- **Generates strong passwords**, and suggests one on sign-up forms.
- **Imports** the CSV exports of Chrome, Edge, Firefox, Safari, Apple
  Passwords and other password managers, and **exports** to the CSV every one
  of them reads — after asking for the master password.
- **Encrypted backups**: the whole vault in one file, under the same master
  password, to keep somewhere else and restore from. Restoring into a vault
  adds what it lacks and removes nothing.
- **Nothing leaves the machine.** No sync server, no favicon service, no breach
  check: each would tell a server every site you have an account on. The
  extension's pages are built with `connect-src 'none'`.
- English and Vietnamese.

## What is here

```
packages/core/          @passhold/core — encryption, the vault, site matching, the
                        generator, CSV import and export, backups. No chrome.*, no
                        DOM: written to be reused by desktop and mobile apps.
apps/extension/         The MV3 extension: service worker, popup, settings page,
                        the content script, and the inline list and save prompt.
vendor/keyrook-brand/   Keyrook's colours, marks and motion, which the extension
                        is drawn with.
docs/security.md        What Passhold defends against, and how.
```

## Security in brief

Logins are encrypted with AES-256-GCM under a random data key, bound to the
vault's id. The data key is wrapped by a non-extractable key derived from your
master password with PBKDF2-SHA256 at 600,000 rounds; while the vault is
unlocked it lives only in session memory, closed to content scripts.

The content script, which runs in every page, never holds the vault: the list
of logins is drawn by an extension page framed into the page, and a login
reaches a frame only as a fill for that frame's own site, checked again before
a character is typed. A site is its registrable domain, private suffixes
included; plain http gets only its exact origin. Hidden and covered fields are
never filled.

Every claim has a test that tries to break it. Details, and what Passhold does
not defend against: [docs/security.md](docs/security.md).

## Building from source

You need Node 22 and npm.

```bash
npm ci
npm run typecheck
npx vitest run
npm run build -w @passhold/extension
```

Load `apps/extension/dist` at **chrome://extensions → Developer mode → Load
unpacked**.

The end-to-end suite loads the built extension into a real Chromium:

```bash
npx playwright install chromium
npm run test:e2e -w @passhold/extension
```

## Checking a release against this source

Builds are deterministic: two builds of the same commit, from the same
lockfile, produce byte-identical files. To check what the store gave you:

1. Check out the tag for the version you have installed, then
   `npm ci && npm run build -w @passhold/extension` with Node 22.
2. Find the installed copy: open `chrome://version`, take the **Profile Path**,
   and look in `Extensions/<extension id>/<version>/`.
3. Compare the two folders, for example with `diff -r`.

Expect differences only in the `_metadata/` folder and in `manifest.json` fields
the store adds itself, such as `update_url`.

## Reporting a vulnerability

Please do not open a public issue. See [SECURITY.md](SECURITY.md).

## Contributing

Issues and pull requests are welcome; accepted changes appear here with the
next release, credited to you. Before you send one, read
[CONTRIBUTING.md](CONTRIBUTING.md): it lists the rules the code follows and
the terms a contribution comes with.

## Licence and names

Copyright (C) 2026 BRICK IT ALL LLC.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version. It is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See [LICENSE](LICENSE) for the full text.

"Passhold" and "Keyrook", and their logos, are trademarks of BRICK IT ALL LLC.
The licence covers the code; it grants no right to use the names or the logos.
A modified version you distribute must carry a name and icons of its own, so
that nobody mistakes it for Passhold.
