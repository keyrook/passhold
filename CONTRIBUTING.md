# Contributing to Passhold

Issues and pull requests are welcome. This repository is a published copy of
the development tree: an accepted change is applied there and appears here
with the next release, credited to you.

## Before you send a change

- Comments explain *why*, not what.
- Every security claim has a test that tries to break it, not one that
  restates it.
- The content script never holds the vault, and nothing leaves the machine.
- Every word a person reads is in a language file (`src/i18n/locales/`).
- User-facing copy is plain and honest about limits.
- `npm run typecheck`, `npx vitest run` and
  `npm run test:e2e -w @passhold/extension` pass.

For a vulnerability, do not open an issue or a pull request: see
[SECURITY.md](SECURITY.md).

## The terms of a contribution

So that BRICK IT ALL LLC can keep offering Passhold under the GPL and under
other terms — for an organisation that cannot use GPL software, say — a
contribution comes with a licence to do both. You keep the copyright in what
you write.

By opening a pull request you confirm that:

1. the contribution is your own work, or you have the right to submit it
   under these terms;
2. it is licensed to everyone under GPL-3.0-or-later; and
3. you also grant BRICK IT ALL LLC a perpetual, worldwide, non-exclusive,
   royalty-free, irrevocable licence to use, copy, modify, distribute and
   sublicense it, under any terms.

Please say so in the pull request ("I agree to the terms in CONTRIBUTING.md").
A change we cannot accept on these terms we will not merge, but we are glad of
the report all the same.
