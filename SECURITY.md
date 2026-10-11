# Security policy

Passhold holds people's passwords. If you have found a way to weaken that, we
want to hear about it before anyone else does.

## Reporting

Email **brickitall.hi@gmail.com** with "Security" in the subject line. Please
include:

- what an attacker could do, and what they would need first;
- the version you tested (Settings, under the title) and your browser;
- steps or a proof of concept that shows it.

Please do not open a public issue or pull request for a vulnerability. We will
reply to confirm we have it, keep you told as we work on a fix, and credit you
in the release notes if you would like that.

## What we most want to know about

- Anything that reveals a password, the data key or the master password
  without the master password.
- Anything that lets a web page — or a frame inside one — read a login, see
  which logins are saved, drive the inline list or the save prompt, or have a
  login filled into a site it does not belong to.
- Anything that fills a field a person cannot see.
- Anything that writes something readable to disk, or sends anything off the
  machine.
- A backup file that, once restored, weakens the vault or removes logins.

## Limits we already state

Some weaknesses are documented, not hidden: [docs/security.md](docs/security.md)
ends with what Passhold does not defend against — malware on the computer,
someone at an unlocked browser, a weak master password against someone who has
the vault file. Reports that go further than what is documented are always
welcome.
