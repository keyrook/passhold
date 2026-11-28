# Passhold CLI: changes

## 0.3.0

- Machines and agents: a separate, sealed vault for automation and coding tools
  that stays apart from your personal vault. Enrol a machine with an invite
  code (`passhold machine invite`, `passhold machine enroll`, `passhold machine
  confirm`), grant individual API keys with per-use, session or standing
  approval (`passhold machine grant`, `passhold machine withdraw`), and manage
  machine keys, emergency stop, removal and audit logs (`passhold machine
  stop-all`, `remove`, `rekey`, `forget`, `audit`).
- Interactive approval at the terminal (`passhold approve`), requiring a fresh
  unlock separate from `PASSHOLD_SESSION`.
- Local MCP server over stdio (`passhold mcp`) exposing only the enrolled
  machine's permitted tools, with per-use requests waiting for owner approval
  in Passhold (browser extension, Android app or `passhold approve`).

## 0.2.0

- A program for each system, with nothing else to install: macOS (Apple
  silicon and Intel), Linux (x64 and arm64) and Windows (x64), each with its
  SHA-256 in `SHA256SUMS`. Built from the release's tag, the same bytes every
  time. Homebrew and winget install the same programs. They are built on
  Node.js 22.23.5, which has October 2026's security fixes.
- API keys, an item of their own: `passhold create apikey`, read by
  reference (`passhold://personal/Payments/key`), `passhold list --kind
  apikey`, and `passhold export --kind apikey`. A key's earlier values are not
  shown with it.
- `passhold ssh-agent --socket <path>` with a relative path now prints the
  socket's full path, so `ssh` run from another folder finds it, unless that
  path is longer than a socket takes.
- `passhold inject --out` over a file that was already there makes it
  readable by its owner alone before writing, as it does a new file.
- `passhold run` keeps `PASSHOLD_SESSION` from the command however its name
  is spelled, since Windows reads `passhold_session` as the same variable.

## 0.1.0

- The first release, on npm (`@keyrook/passhold-cli`, Node.js 22 or later):
  sign in and unlock, `get`, `run`, `inject`, items made, changed and deleted
  in every vault, a family's shared ones among them, and an SSH agent.
