# Passhold CLI

Passhold, the password manager by Keyrook, in a terminal. It reads and writes
the logins, cards, addresses, notes and SSH keys of your Passhold vault and of
the vaults your family shares with you; puts secrets into scripts and
configuration by reference, so they are never written into either; and signs
with your SSH keys as an SSH agent.

The command line is one of what Keyrook Premium adds to Passhold; Passhold
itself stays free.

## Install

```sh
npm install --global @keyrook/passhold-cli    # Node.js 22 or later
```

Homebrew, winget and a program for each system, with no Node.js to install,
come with a later release.

## Sign in and unlock

```sh
passhold login --google            # or --github, or --email you@example.com
eval "$(passhold unlock)"          # the account's password; --recovery-key; or --with-browser
```

Signing in says who you are. Unlocking opens Passhold's key, for this shell
only and for 15 minutes unless you say otherwise (`--minutes`): the key that
opens the unlock lives in the shell's `PASSHOLD_SESSION`, never in a file.
`--with-browser` lets a Passhold browser already signed in hand the key over,
once both show the same code. `passhold lock` ends it.

## References

A secret is named `passhold://vault/item/field`. Your own vault is
`personal`; a family's shared vault is its name. An item is its name or its
id; a field is one of its kind's (`password`, `username`, `url`, `notes`,
`number`, `code`, `private_key`…) or one of its own.

```sh
passhold get passhold://personal/GitHub/password
DB_PASSWORD=passhold://Family/Database/password passhold run -- ./deploy.sh
passhold inject --in config.tpl --out config.yml      # fills each {{ passhold://… }}
```

`run` hands each reference's value to the command it runs, and to nothing
else; `inject` writes a file only its owner can read.

## Vaults and items

```sh
passhold vaults
passhold list [--vault Family] [--search words] [--json]
passhold create login --vault Family title=Netflix username=us@example.com url=https://netflix.com --generate
passhold edit passhold://Family/Netflix password=-           # asked for, unseen
passhold create ssh title="Build server" private_key=@id_ed25519
passhold delete passhold://Family/Netflix                    # to the trash
passhold restore passhold://Family/Netflix
```

In `field=value`, a value of `-` is asked for without showing what is typed,
so it stays out of the shell's history, and `@path` is read from a file. A
password replaced is kept in the login's history. Deleting moves an item to
the trash; only its owner empties the trash, in Passhold.

A vault you may only view is read, never written. Someone who left a family
is named until `passhold vaults` has shown it, and a member whose key changed
is taken only once you have compared codes with them: `passhold compare Family`.

## SSH agent

```sh
passhold ssh-agent
```

It offers the SSH keys in your vaults to `ssh`, `git` and
`ssh-keygen -Y sign`, and asks you before each signature — in a dialog, with
your `SSH_ASKPASS`, or in its own terminal — unless you pass `--no-confirm`.
It listens at `~/.config/passhold/agent.sock`; tell `ssh` with

```
Host *
  IdentityAgent ~/.config/passhold/agent.sock
```

or `export SSH_AUTH_SOCK=~/.config/passhold/agent.sock`. On Windows it listens
on `\\.\pipe\openssh-ssh-agent`, where Windows' OpenSSH looks; if the OpenSSH
Authentication Agent service holds that pipe, stop the service first. It hands out no key and takes
none (`ssh-add` is refused), and it stops when Passhold is locked or the
unlock ends. A key sealed with a passphrase is not offered: keep it in
Passhold without one, since the vault seals it.

## What stays on this computer

`~/.config/passhold` (or `PASSHOLD_HOME`), readable by you alone: which
account is signed in and its session, the unlock sealed under a key only your
shell holds, and what was last checked of each family, sealed. Nothing a
login holds is ever written there: every command reads the sealed records
from your account and opens them in memory.

## Licence

Copyright (C) 2026 BRICK IT ALL LLC. Free software under the GNU General
Public License, version 3 or (at your option) any later version: see
`LICENSE`. A program built for one system is built on Node.js, whose licence
is in `LICENSE.node.txt` beside it. Passhold's source is at
https://github.com/keyrook/passhold; the command line's joins it with
Passhold's next release.
