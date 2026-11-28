/**
 * What a release of the command line is made of, as text: the npm package's
 * manifest, the Homebrew formula and the winget manifests, each naming the
 * programs a release carries and their SHA-256. Nothing here reads a disk or
 * the network; scripts/release.mjs makes the files these describe.
 *
 * The programs are put on the public repository's releases, under a tag of
 * their own (`cli-v<version>`): the formula and the manifests point there, so
 * they are published only once those files are.
 */

export const PACKAGE = '@keyrook/passhold-cli';
export const REPOSITORY = 'https://github.com/keyrook/passhold';
export const HOMEPAGE = 'https://keyrook.com/passhold/';
export const WINGET_ID = 'Keyrook.Passhold.CLI';
export const FORMULA = 'passhold-cli';
const SUMMARY = 'Passhold, the password manager by Keyrook, in a terminal: secrets for scripts and an SSH agent.';

/** The systems a release has a program for, and the Node.js build each is made from. */
export const TARGETS = [
  { os: 'macos', arch: 'arm64', node: 'darwin-arm64' },
  { os: 'macos', arch: 'x64', node: 'darwin-x64' },
  { os: 'linux', arch: 'x64', node: 'linux-x64' },
  { os: 'linux', arch: 'arm64', node: 'linux-arm64' },
  { os: 'windows', arch: 'x64', node: 'win-x64' },
];

export const tagOf = (version) => `cli-v${version}`;
/** A folder of the program, its licence and its readme, packed as each system unpacks: zip on Windows. */
export const folderOf = (version, target) => `passhold-${version}-${target.os}-${target.arch}`;
export const assetOf = (version, target) => `${folderOf(version, target)}.${target.os === 'windows' ? 'zip' : 'tar.gz'}`;
export const urlOf = (version, target) => `${REPOSITORY}/releases/download/${tagOf(version)}/${assetOf(version, target)}`;
export const programOf = (target) => (target.os === 'windows' ? 'passhold.exe' : 'passhold');

/** The official Node.js archive a target's program is made from. */
export const nodeArchiveOf = (nodeVersion, target) => `node-v${nodeVersion}-${target.node}.${target.os === 'windows' ? 'zip' : 'tar.gz'}`;
export const nodeUrlOf = (nodeVersion, target) => `https://nodejs.org/dist/v${nodeVersion}/${nodeArchiveOf(nodeVersion, target)}`;

/** A different zlib can give the same files a different archive and SHA-256. */
export function checkBuildNode(runningVersion, pinnedVersion, fromTag) {
  if (runningVersion === pinnedVersion) return;
  const message = `This build is running on Node.js ${runningVersion}. The version pinned in packaging/node.json is ${pinnedVersion}. Archive bytes depend on the zlib of the Node.js running this script.`;
  if (fromTag) throw new Error(message);
  console.warn(`Warning: ${message}`);
}

/** The npm package's manifest: one file, run by the Node.js the person has. */
export function npmManifest(version) {
  return {
    name: PACKAGE,
    version,
    description: SUMMARY,
    license: 'GPL-3.0-or-later',
    author: 'BRICK IT ALL LLC',
    homepage: HOMEPAGE,
    repository: { type: 'git', url: `git+${REPOSITORY}.git`, directory: 'apps/cli' },
    bugs: `${REPOSITORY}/issues`,
    type: 'module',
    bin: { passhold: 'passhold.mjs' },
    files: ['passhold.mjs', 'README.md', 'LICENSE'],
    engines: { node: '>=22' },
    keywords: ['passhold', 'keyrook', 'password-manager', 'secrets', 'ssh-agent', 'cli'],
    publishConfig: { access: 'public' },
  };
}

/** A sum for each of the release's files, by name, or a refusal naming what is missing. */
function sumsFor(version, sums, targets) {
  return targets.map((target) => {
    const sum = sums[assetOf(version, target)];
    if (!/^[0-9a-f]{64}$/.test(sum ?? '')) throw new Error(`No SHA-256 for ${assetOf(version, target)}.`);
    return { target, sum };
  });
}

/**
 * The formula for a tap of Keyrook's (`brew install keyrook/tap/passhold-cli`):
 * the program made for each Mac and Linux, by its SHA-256.
 */
export function homebrewFormula(version, sums) {
  const block = (os, arch) => {
    const { target, sum } = sumsFor(version, sums, [TARGETS.find((entry) => entry.os === os && entry.arch === arch)])[0];
    return [`    on_${arch === 'arm64' ? 'arm' : 'intel'} do`, `      url "${urlOf(version, target)}"`, `      sha256 "${sum}"`, '    end'].join('\n');
  };
  return `class PassholdCli < Formula
  desc "Password manager in a terminal: secrets for scripts and an SSH agent"
  homepage "${HOMEPAGE}"
  version "${version}"
  license "GPL-3.0-or-later"

  on_macos do
${block('macos', 'arm64')}
${block('macos', 'x64')}
  end

  on_linux do
${block('linux', 'arm64')}
${block('linux', 'x64')}
  end

  def install
    bin.install "passhold"
    # The program is Node.js's too, whose licence goes with every copy.
    prefix.install "LICENSE", "LICENSE.node.txt"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/passhold --version")
    assert_match(/^.{32}$/, shell_output("#{bin}/passhold generate --length 32").strip)
  end
end
`;
}

// winget-pkgs asks for its current schema (1.28.0 when 0.2.0 was sent).
const SCHEMA = '1.28.0';
// A plain YAML value may not hold ": " or start with most punctuation; one in single quotes holds anything but its own quote, doubled.
const quoted = (text) => `'${text.replaceAll("'", "''")}'`;
const schema = (kind) => `# yaml-language-server: $schema=https://aka.ms/winget-manifest.${kind}.${SCHEMA}.schema.json\n`;

/**
 * The three manifests winget-pkgs takes for a version, by the path they go
 * at there: the program, unzipped and on the PATH as `passhold`.
 */
export function wingetManifests(version, sums, releasedOn) {
  const folder = `manifests/k/Keyrook/Passhold/CLI/${version}`;
  const windows = sumsFor(version, sums, TARGETS.filter((target) => target.os === 'windows'));
  return {
    [`${folder}/${WINGET_ID}.yaml`]: `${schema('version')}PackageIdentifier: ${WINGET_ID}
PackageVersion: ${version}
DefaultLocale: en-US
ManifestType: version
ManifestVersion: ${SCHEMA}
`,
    [`${folder}/${WINGET_ID}.installer.yaml`]: `${schema('installer')}PackageIdentifier: ${WINGET_ID}
PackageVersion: ${version}
InstallerType: zip
NestedInstallerType: portable
NestedInstallerFiles:
  - RelativeFilePath: ${folderOf(version, windows[0].target)}\\passhold.exe
    PortableCommandAlias: passhold
Commands:
  - passhold
ReleaseDate: ${releasedOn}
Installers:
${windows.map(({ target, sum }) => `  - Architecture: ${target.arch}\n    InstallerUrl: ${urlOf(version, target)}\n    InstallerSha256: ${quoted(sum.toUpperCase())}`).join('\n')}
ManifestType: installer
ManifestVersion: ${SCHEMA}
`,
    [`${folder}/${WINGET_ID}.locale.en-US.yaml`]: `${schema('defaultLocale')}PackageIdentifier: ${WINGET_ID}
PackageVersion: ${version}
PackageLocale: en-US
Publisher: Keyrook
PublisherUrl: https://keyrook.com/
PublisherSupportUrl: ${REPOSITORY}/issues
Author: BRICK IT ALL LLC
PackageName: Passhold CLI
PackageUrl: ${HOMEPAGE}
License: GPL-3.0-or-later
LicenseUrl: ${REPOSITORY}/blob/main/LICENSE
Copyright: Copyright (C) 2026 BRICK IT ALL LLC
ShortDescription: ${quoted(SUMMARY)}
Description: |-
  Reads, writes and injects the logins, cards, notes and SSH keys of a Passhold account, its family's shared vaults
  among them, by passhold:// references, and signs with its SSH keys as an SSH agent. A Premium feature of a Keyrook
  account; nothing is kept on the computer but sealed.
Moniker: passhold
Tags:
  - password-manager
  - secrets
  - ssh-agent
  - cli
ManifestType: defaultLocale
ManifestVersion: ${SCHEMA}
`,
  };
}

/** `SHA256SUMS`, as `sha256sum -c` reads it. */
export function sumsFile(sums) {
  return Object.entries(sums)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, sum]) => `${sum}  ${name}\n`)
    .join('');
}

/**
 * A Windows program without the Authenticode signature it was made from:
 * Node.js signs node.exe, and a program made from it with its own script
 * added would carry a signature that no longer checks out. Its certificate
 * table, named in the optional header, is cut off the end and unnamed.
 */
export function withoutSignature(bytes) {
  const view = Buffer.from(bytes);
  if (view.readUInt16LE(0) !== 0x5a4d) throw new Error('Not a Windows program.');
  const pe = view.readUInt32LE(0x3c);
  if (view.readUInt32LE(pe) !== 0x00004550) throw new Error('Not a Windows program.');
  const optional = pe + 24;
  const magic = view.readUInt16LE(optional);
  // The data directories start 96 bytes in for PE32, 112 for PE32+; the certificate table is the fifth.
  const directories = optional + (magic === 0x20b ? 112 : 96);
  const entry = directories + 4 * 8;
  const at = view.readUInt32LE(entry);
  const size = view.readUInt32LE(entry + 4);
  if (!at || !size) return view;
  if (at + size !== view.length) throw new Error('The signature is not at the end of the program.');
  const out = Buffer.from(view.subarray(0, at));
  out.writeUInt32LE(0, entry);
  out.writeUInt32LE(0, entry + 4);
  return out;
}
