export interface Target {
  os: 'macos' | 'linux' | 'windows';
  arch: 'arm64' | 'x64';
  node: string;
}
export const PACKAGE: string;
export const REPOSITORY: string;
export const HOMEPAGE: string;
export const WINGET_ID: string;
export const FORMULA: string;
export const TARGETS: readonly Target[];
export function tagOf(version: string): string;
export function folderOf(version: string, target: Target): string;
export function assetOf(version: string, target: Target): string;
export function urlOf(version: string, target: Target): string;
export function programOf(target: Target): string;
export function nodeArchiveOf(nodeVersion: string, target: Target): string;
export function nodeUrlOf(nodeVersion: string, target: Target): string;
export function npmManifest(version: string): Record<string, unknown> & { name: string; version: string; bin: Record<string, string>; files: string[]; license: string };
export function homebrewFormula(version: string, sums: Record<string, string>): string;
export function wingetManifests(version: string, sums: Record<string, string>, releasedOn: string): Record<string, string>;
export function sumsFile(sums: Record<string, string>): string;
export function withoutSignature(bytes: Uint8Array): Buffer;
