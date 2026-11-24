/**
 * What a release of the command line is made of: the program as one
 * CommonJS file, which a single executable runs, with nothing in it that must
 * not be published; and the npm manifest, the Homebrew formula and the winget
 * manifests naming exactly the files a release carries.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { resolve as path } from 'node:path';
import { build } from 'vite';
import { afterAll, describe, expect, it } from 'vitest';
import {
  assetOf,
  homebrewFormula,
  nodeArchiveOf,
  npmManifest,
  sumsFile,
  TARGETS,
  urlOf,
  wingetManifests,
  withoutSignature,
} from '../scripts/packaging.mjs';
import { tarGz, zip } from '../scripts/archive.mjs';
import { clientName, VERSION } from '../src/account.js';

const CLI = path(import.meta.dirname, '..');
const hasRuby = (() => {
  try {
    execFileSync('ruby', ['-ryaml', '-e', '']);
    return true;
  } catch {
    return false;
  }
})();
// What must not be published is listed outside what is: the public tree checks nothing against it.
const TRACES = path(CLI, '../../scripts/traces.mjs');
// A program holds the services' catalogues as literals, which name services and nothing else: the list takes those out before it looks.
const markerIn = async (text: string): Promise<string | null> =>
  existsSync(TRACES) ? ((await import(/* @vite-ignore */ TRACES)) as { markerInBundle(text: string, root: string): string | null }).markerInBundle(text, path(CLI, '../..')) : null;
const OUT = path(CLI, '../../.tmp/cli-test/sea');
const pkg = JSON.parse(readFileSync(path(CLI, 'package.json'), 'utf8')) as { version: string; license: string };
const pins = JSON.parse(readFileSync(path(CLI, 'packaging/node.json'), 'utf8')) as { version: string; archives: Record<string, string> };
const fake = (seed: number) => seed.toString(16).padStart(2, '0').repeat(32);
const sums = Object.fromEntries(TARGETS.map((target, index) => [assetOf(VERSION, target), fake(index + 1)]));

afterAll(() => rmSync(OUT, { recursive: true, force: true }));

describe('a release of the command line', () => {
  it('is one version everywhere: the package, the program, what it tells the server', () => {
    expect(pkg.version).toBe(VERSION);
    expect(clientName('darwin')).toBe(`passhold-macos/${VERSION}`);
    expect(clientName('win32')).toBe(`passhold-windows/${VERSION}`);
    expect(pkg.license).toBe('GPL-3.0-or-later');
  });

  it('runs as the single CommonJS file a single executable takes, with nothing in it that must not be published', { timeout: 60_000 }, async () => {
    await build({ root: CLI, configFile: path(CLI, 'vite.config.ts'), mode: 'sea', logLevel: 'silent', build: { outDir: OUT } });
    const program = path(OUT, 'passhold.cjs');
    const text = readFileSync(program, 'utf8');
    expect(await markerIn(text)).toBeNull();
    // No top-level await, no import: a single executable runs CommonJS alone.
    expect(text).not.toMatch(/^import /m);
    expect(execFileSync(process.execPath, [program, '--version'], { encoding: 'utf8' })).toBe(`${VERSION}\n`);
    expect(execFileSync(process.execPath, [program, 'generate', '--length', '24'], { encoding: 'utf8' }).trim()).toMatch(/^.{24}$/);
  });

  it('goes to npm as one file, its readme and its licence, and nothing else', async () => {
    const manifest = npmManifest(VERSION);
    expect(manifest).toMatchObject({ name: '@keyrook/passhold-cli', version: VERSION, license: 'GPL-3.0-or-later', bin: { passhold: 'passhold.mjs' }, files: ['passhold.mjs', 'README.md', 'LICENSE'], engines: { node: '>=22' } });
    expect(await markerIn(JSON.stringify(manifest))).toBeNull();
  });

  it('is named by the Homebrew formula and the winget manifests by each file’s SHA-256, and by nothing it does not carry', () => {
    const formula = homebrewFormula(VERSION, sums);
    for (const target of TARGETS.filter((entry) => entry.os !== 'windows')) {
      expect(formula).toContain(`url "${urlOf(VERSION, target)}"\n      sha256 "${sums[assetOf(VERSION, target)]}"`);
    }
    expect(formula).toMatch(/^class PassholdCli < Formula$/m);
    expect(formula).toContain('license "GPL-3.0-or-later"');
    expect(formula).toContain('bin.install "passhold"');
    expect(formula).not.toContain('windows');
    expect(() => homebrewFormula(VERSION, { ...sums, [assetOf(VERSION, TARGETS[0]!)]: 'not a sum' })).toThrow(/No SHA-256/);

    const manifests = wingetManifests(VERSION, sums, '2026-11-16');
    const folder = `manifests/k/Keyrook/Passhold/CLI/${VERSION}`;
    expect(Object.keys(manifests).sort()).toEqual([`${folder}/Keyrook.Passhold.CLI.installer.yaml`, `${folder}/Keyrook.Passhold.CLI.locale.en-US.yaml`, `${folder}/Keyrook.Passhold.CLI.yaml`]);
    const installer = manifests[`${folder}/Keyrook.Passhold.CLI.installer.yaml`]!;
    const windows = TARGETS.find((target) => target.os === 'windows')!;
    expect(installer).toContain(`InstallerUrl: ${urlOf(VERSION, windows)}\n    InstallerSha256: '${sums[assetOf(VERSION, windows)]!.toUpperCase()}'`);
    expect(installer).toContain(`RelativeFilePath: passhold-${VERSION}-windows-x64\\passhold.exe\n    PortableCommandAlias: passhold`);
    expect(manifests[`${folder}/Keyrook.Passhold.CLI.locale.en-US.yaml`]).toContain('License: GPL-3.0-or-later');
    for (const text of Object.values(manifests)) expect(text).toContain(`PackageVersion: ${VERSION}`);
    // Read by a YAML parser, as winget's validation reads them: a plain value with ": " in it is no YAML at all, and a sum of digits alone would be a number.
    if (hasRuby) {
      const read = (text: string) => JSON.parse(execFileSync('ruby', ['-ryaml', '-rjson', '-rdate', '-e', 'puts JSON.generate(YAML.safe_load(STDIN.read, permitted_classes: [Date]))'], { input: text, encoding: 'utf8' }));
      const locale = read(manifests[`${folder}/Keyrook.Passhold.CLI.locale.en-US.yaml`]!);
      expect(locale.ShortDescription).toMatch(/^Passhold, the password manager by Keyrook, in a terminal: /);
      expect(locale.Tags).toContain('ssh-agent');
      expect(read(installer).Installers[0].InstallerSha256).toBe(sums[assetOf(VERSION, windows)]!.toUpperCase());
      expect(read(installer).NestedInstallerFiles[0].RelativeFilePath).toBe(`passhold-${VERSION}-windows-x64\\passhold.exe`);
    }
    expect(sumsFile(sums).split('\n').filter(Boolean)).toHaveLength(TARGETS.length);
  });

  it('is made from Node.js archives whose SHA-256 is pinned, or from none', () => {
    expect(pins.version).toMatch(/^\d+\.\d+\.\d+$/);
    // Pinned or not yet: never a sum of another release's archive.
    for (const name of Object.keys(pins.archives)) expect(TARGETS.map((target) => nodeArchiveOf(pins.version, target))).toContain(name);
    for (const sum of Object.values(pins.archives)) expect(sum).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('a Windows program, signed by Node.js', () => {
  /** The least of a PE32+ file: its headers, a body, and a certificate table at the end as signtool leaves one. */
  function program(signature: number): Buffer {
    const body = 0x200;
    const bytes = Buffer.alloc(body + signature);
    bytes.writeUInt16LE(0x5a4d, 0);
    bytes.writeUInt32LE(0x80, 0x3c);
    bytes.writeUInt32LE(0x00004550, 0x80);
    bytes.writeUInt16LE(0x20b, 0x80 + 24);
    const entry = 0x80 + 24 + 112 + 4 * 8;
    if (signature) {
      bytes.writeUInt32LE(body, entry);
      bytes.writeUInt32LE(signature, entry + 4);
      bytes.fill(0xee, body);
    }
    return bytes;
  }

  it('loses its signature, which would no longer check out, and nothing else', () => {
    const signed = program(64);
    const bare = withoutSignature(signed);
    expect(bare.length).toBe(0x200);
    expect(bare.readUInt32LE(0x80 + 24 + 112 + 32)).toBe(0);
    expect(bare.readUInt32LE(0x80 + 24 + 112 + 36)).toBe(0);
    expect(bare.subarray(0, 0x80 + 24 + 112 + 32).equals(signed.subarray(0, 0x80 + 24 + 112 + 32))).toBe(true);
    expect(withoutSignature(program(0)).equals(program(0))).toBe(true);
    // A table anywhere but at the end is not one signtool wrote: nothing is cut.
    const odd = program(64);
    odd.writeUInt32LE(0x100, 0x80 + 24 + 112 + 32);
    expect(() => withoutSignature(odd)).toThrow(/not at the end/);
    expect(() => withoutSignature(Buffer.from('#!/bin/sh\n'))).toThrow(/Not a Windows program/);
  });
});

describe('a release archive', () => {
  const entries = [
    { name: 'passhold-0.2.0-linux-x64/passhold', bytes: Buffer.from('#!/bin/sh\necho passhold\n'), program: true },
    { name: 'passhold-0.2.0-linux-x64/LICENSE', bytes: Buffer.alloc(70_000, 'GPL ') },
  ];
  // 2026-11-20 10:11:12 UTC: an even second, as zip keeps them.
  const epoch = 1_795_255_872;

  /** What the system's own tar or unzip makes of it, in a folder of its own. */
  function unpacked(kind: 'tar' | 'zip', bytes: Buffer) {
    const into = path(OUT, `${kind}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(into, { recursive: true });
    const file = path(into, kind === 'tar' ? 'a.tar.gz' : 'a.zip');
    writeFileSync(file, bytes);
    if (kind === 'tar') execFileSync('tar', ['-xzf', file, '-C', into]);
    else execFileSync('unzip', ['-q', file, '-d', into]);
    return (name: string) => ({ bytes: readFileSync(path(into, name)), stat: statSync(path(into, name)) });
  }

  it('is the same bytes from the same files, whenever and wherever it is made', () => {
    expect(tarGz(entries, epoch).equals(tarGz(entries.map((entry) => ({ ...entry, bytes: Buffer.from(entry.bytes) })), epoch))).toBe(true);
    expect(zip(entries, epoch).equals(zip(entries, epoch))).toBe(true);
    expect(tarGz(entries, epoch).equals(tarGz(entries, epoch + 2))).toBe(false);
    // gzip names no system and no time.
    expect([...tarGz(entries, epoch).subarray(4, 10)]).toEqual([0, 0, 0, 0, 2, 0xff]);
  });

  it.each(['tar', 'zip'] as const)('unpacks with the system’s own %s: each file whole, the program runnable, dated at the commit', (kind) => {
    const read = unpacked(kind, kind === 'tar' ? tarGz(entries, epoch) : zip(entries, epoch));
    for (const entry of entries) expect(read(entry.name).bytes.equals(entry.bytes)).toBe(true);
    expect(read(entries[0]!.name).stat.mode & 0o777).toBe(0o755);
    expect(read(entries[1]!.name).stat.mode & 0o777).toBe(0o644);
    // A zip's time is the local time unzip reads it as; tar's is the instant itself.
    if (kind === 'tar') expect(read(entries[1]!.name).stat.mtimeMs).toBe(epoch * 1000);
  });
});
