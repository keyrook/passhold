/**
 * A release of the command line, into .tmp/cli-release/<version>/:
 *
 *   npm run release -w @passhold/cli                 the npm package (.tgz)
 *   npm run release -w @passhold/cli -- --programs   and a program for each system, with
 *                                                    SHA256SUMS, the Homebrew formula and
 *                                                    the winget manifests that name them
 *   npm run release -w @passhold/cli -- --pin-node   the SHA-256 of each Node.js archive, from
 *                                                    nodejs.org's SHASUMS256.txt, into
 *                                                    packaging/node.json, to be read and committed
 *
 * Nothing is published from here: not to npm, not to the repository's
 * releases, not to a tap or to winget-pkgs. Each of those is outward-facing,
 * and its owner's to do once they have looked at what is here.
 *
 * Each program is Node.js's own, from nodejs.org, with the command line put
 * inside it as a single executable application (Node's SEA): nothing to
 * install beside it. An archive is taken only if its SHA-256 is the one
 * pinned in packaging/node.json, committed and read before; a Homebrew build
 * of Node.js links to the system's libraries and is no use to anyone else.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import {
  assetOf,
  folderOf,
  FORMULA,
  homebrewFormula,
  nodeArchiveOf,
  nodeUrlOf,
  npmManifest,
  programOf,
  sumsFile,
  TARGETS,
  wingetManifests,
  withoutSignature,
} from './packaging.mjs';

const CLI = resolve(import.meta.dirname, '..');
const ROOT = resolve(CLI, '../..');
const { version } = JSON.parse(readFileSync(join(CLI, 'package.json'), 'utf8'));
const OUT = join(ROOT, '.tmp/cli-release', version);
const NODE_CACHE = join(ROOT, '.tmp/node-dist');
const PINS = join(CLI, 'packaging/node.json');
const args = new Set(process.argv.slice(2));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const run = (command, rest, options = {}) => execFileSync(command, rest, { stdio: 'inherit', ...options });
const say = (line) => process.stdout.write(`${line}\n`);

const pins = JSON.parse(readFileSync(PINS, 'utf8'));

if (args.has('--pin-node')) {
  // The list nodejs.org signs for each release: read once here, then reviewed in the diff of packaging/node.json.
  const answer = await fetch(`https://nodejs.org/dist/v${pins.version}/SHASUMS256.txt`);
  if (!answer.ok) throw new Error(`nodejs.org answered ${answer.status} for v${pins.version}'s SHASUMS256.txt.`);
  const listed = new Map((await answer.text()).split('\n').map((line) => line.trim().split(/\s+/).reverse()).filter(([name, sum]) => name && sum));
  const archives = {};
  for (const target of TARGETS) {
    const name = nodeArchiveOf(pins.version, target);
    if (!/^[0-9a-f]{64}$/.test(listed.get(name) ?? '')) throw new Error(`SHASUMS256.txt lists no ${name}.`);
    archives[name] = listed.get(name);
  }
  writeFileSync(PINS, `${JSON.stringify({ ...pins, archives }, null, 2)}\n`);
  say(`Pinned ${Object.keys(archives).length} archives of Node.js ${pins.version} in packaging/node.json. Read the diff, then commit it.`);
  process.exit(0);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// --- the program, as one file -------------------------------------------------------

run('npx', ['vite', 'build'], { cwd: CLI });
run('npx', ['vite', 'build', '--mode', 'sea'], { cwd: CLI });
// What must not be published is listed where it is not published itself; the public tree has no list to check against.
const traces = await import('../../../scripts/traces.mjs').catch(() => null);
for (const file of ['dist/passhold.mjs', 'dist/sea/passhold.cjs']) {
  const trace = traces?.markerInBundle(readFileSync(join(CLI, file), 'utf8'), ROOT);
  if (trace) throw new Error(`${file} holds "${trace}", which must not be published.`);
}
const said = execFileSync(process.execPath, [join(CLI, 'dist/sea/passhold.cjs'), '--version'], { encoding: 'utf8' }).trim();
if (said !== version) throw new Error(`The program says it is ${said}, the package ${version}.`);

// --- npm --------------------------------------------------------------------------------

const npm = join(OUT, 'npm');
mkdirSync(npm, { recursive: true });
copyFileSync(join(CLI, 'dist/passhold.mjs'), join(npm, 'passhold.mjs'));
chmodSync(join(npm, 'passhold.mjs'), 0o755);
copyFileSync(join(CLI, 'README.md'), join(npm, 'README.md'));
copyFileSync(join(ROOT, 'LICENSE'), join(npm, 'LICENSE'));
writeFileSync(join(npm, 'package.json'), `${JSON.stringify(npmManifest(version), null, 2)}\n`);
run('npm', ['pack', '--pack-destination', OUT], { cwd: npm, stdio: ['ignore', 'ignore', 'inherit'] });
const tarball = readdirSync(OUT).find((name) => name.endsWith('.tgz'));
say(`npm: ${join(OUT, tarball)} (not published: npm publish ${tarball}, from ${OUT}, once it is time)`);

if (!args.has('--programs')) {
  say('Programs for macOS, Linux and Windows: run again with --programs.');
  process.exit(0);
}

// --- a program for each system ------------------------------------------------------------

const archives = pins.archives ?? {};
for (const target of TARGETS) {
  if (!archives[nodeArchiveOf(pins.version, target)]) throw new Error(`No SHA-256 is pinned for ${nodeArchiveOf(pins.version, target)}: run with --pin-node, read the diff, commit it.`);
}
let inject;
try {
  const postject = await import('postject');
  inject = postject.inject ?? postject.default.inject;
} catch {
  throw new Error('postject is not installed: npm install, from the repository root.');
}

/** The archive from nodejs.org, kept in .tmp/node-dist, taken only at the SHA-256 pinned. */
async function nodeArchive(target) {
  const name = nodeArchiveOf(pins.version, target);
  const path = join(NODE_CACHE, name);
  if (!existsSync(path)) {
    mkdirSync(NODE_CACHE, { recursive: true });
    say(`Fetching ${nodeUrlOf(pins.version, target)}…`);
    const answer = await fetch(nodeUrlOf(pins.version, target));
    if (!answer.ok) throw new Error(`nodejs.org answered ${answer.status} for ${name}.`);
    writeFileSync(`${path}.part`, Buffer.from(await answer.arrayBuffer()));
    renameSync(`${path}.part`, path);
  }
  const sum = sha256(readFileSync(path));
  if (sum !== archives[name]) {
    rmSync(path, { force: true });
    throw new Error(`${name} is not the archive pinned (SHA-256 ${sum}): removed. Nothing was made from it.`);
  }
  return path;
}

/** Node.js's own program and licence out of its archive. */
function unpack(archive, target, into) {
  const top = archive.split('/').pop().replace(/\.(tar\.gz|zip)$/, '');
  const inside = target.os === 'windows' ? [`${top}/node.exe`, `${top}/LICENSE`] : [`${top}/bin/node`, `${top}/LICENSE`];
  mkdirSync(into, { recursive: true });
  // bsdtar, as macOS and Windows have it, reads a zip as well as a tarball.
  run('tar', ['-xf', archive, '-C', into, ...inside]);
  return { program: join(into, inside[0]), licence: join(into, inside[1]) };
}

const work = join(OUT, 'work');
const blob = join(work, 'passhold.blob');
mkdirSync(work, { recursive: true });
const seaConfig = join(work, 'sea.json');
writeFileSync(seaConfig, JSON.stringify({ main: join(CLI, 'dist/sea/passhold.cjs'), output: blob, disableExperimentalSEAWarning: true, useSnapshot: false, useCodeCache: false }));

// The blob is made by the very Node.js the programs are, run here: this computer's own build where it is one of them.
const host = TARGETS.find((target) => target.node === `${process.platform === 'win32' ? 'win' : process.platform}-${process.arch}`);
if (!host) throw new Error(`No program is made for this computer (${process.platform}-${process.arch}), so none can make the blob.`);
const hostNode = unpack(await nodeArchive(host), host, join(work, 'host')).program;
run(hostNode, ['--experimental-sea-config', seaConfig]);

const sums = {};
for (const target of TARGETS) {
  const { program: node, licence } = unpack(await nodeArchive(target), target, join(work, target.node));
  const folder = join(work, 'out', folderOf(version, target));
  mkdirSync(folder, { recursive: true });
  const program = join(folder, programOf(target));
  if (target.os === 'windows') writeFileSync(program, withoutSignature(readFileSync(node)));
  else copyFileSync(node, program);
  // A Mac program's signature covers what is changed next: taken off first, made again after.
  if (target.os === 'macos' && process.platform === 'darwin') run('codesign', ['--remove-signature', program]);
  await inject(program, 'NODE_SEA_BLOB', readFileSync(blob), {
    sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
    ...(target.os === 'macos' ? { machoSegmentName: 'NODE_SEA' } : {}),
  });
  if (target.os === 'macos') {
    if (process.platform !== 'darwin') throw new Error('A Mac program is signed on a Mac: run this there.');
    // Signed ad hoc, which is what an Apple silicon Mac needs to run it at all; a Developer ID signature, if one is named, for everyone else's.
    run('codesign', ['--sign', process.env.PASSHOLD_CODESIGN_IDENTITY || '-', ...(process.env.PASSHOLD_CODESIGN_IDENTITY ? ['--options', 'runtime', '--timestamp'] : []), program]);
  }
  chmodSync(program, 0o755);
  copyFileSync(join(ROOT, 'LICENSE'), join(folder, 'LICENSE'));
  // The program is Node.js's too, which asks for its own licence to go with every copy.
  copyFileSync(licence, join(folder, 'LICENSE.node.txt'));
  copyFileSync(join(CLI, 'README.md'), join(folder, 'README.md'));
  const asset = join(OUT, assetOf(version, target));
  if (target.os === 'windows') run('zip', ['-qr', asset, folderOf(version, target)], { cwd: dirname(folder) });
  else run('tar', ['-czf', asset, '-C', dirname(folder), folderOf(version, target)]);
  sums[assetOf(version, target)] = sha256(readFileSync(asset));
  say(`${assetOf(version, target)}  ${sums[assetOf(version, target)]}`);
}

// The program this computer runs, run: it must say what it is, and make a password with no account at all.
const mine = join(work, 'out', folderOf(version, host), programOf(host));
if (execFileSync(mine, ['--version'], { encoding: 'utf8' }).trim() !== version) throw new Error(`${mine} does not say ${version}.`);
if (!/^.{24}$/.test(execFileSync(mine, ['generate', '--length', '24'], { encoding: 'utf8' }).trim())) throw new Error(`${mine} did not make a password.`);

writeFileSync(join(OUT, 'SHA256SUMS'), sumsFile(sums));
mkdirSync(join(OUT, 'homebrew'), { recursive: true });
writeFileSync(join(OUT, 'homebrew', `${FORMULA}.rb`), homebrewFormula(version, sums));
for (const [path, text] of Object.entries(wingetManifests(version, sums, new Date().toISOString().slice(0, 10)))) {
  mkdirSync(dirname(join(OUT, 'winget', path)), { recursive: true });
  writeFileSync(join(OUT, 'winget', path), text);
}
rmSync(work, { recursive: true, force: true });
say(`Ready in ${OUT}: the programs and SHA256SUMS for the release ${version} (tag cli-v${version}), homebrew/${FORMULA}.rb for the tap, winget/ for winget-pkgs. Nothing was published.`);
