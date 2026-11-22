/**
 * What a release of the command line is made of: the program as one
 * CommonJS file, which a single executable runs, with nothing in it that must
 * not be published; and the npm manifest, the Homebrew formula and the winget
 * manifests naming exactly the files a release carries.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
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
import { clientName, VERSION } from '../src/account.js';

const CLI = path(import.meta.dirname, '..');
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
    expect(installer).toContain(`InstallerUrl: ${urlOf(VERSION, windows)}\n    InstallerSha256: ${sums[assetOf(VERSION, windows)]!.toUpperCase()}`);
    expect(installer).toContain(`RelativeFilePath: passhold-${VERSION}-windows-x64\\passhold.exe\n    PortableCommandAlias: passhold`);
    expect(manifests[`${folder}/Keyrook.Passhold.CLI.locale.en-US.yaml`]).toContain('License: GPL-3.0-or-later');
    for (const text of Object.values(manifests)) expect(text).toContain(`PackageVersion: ${VERSION}`);
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
