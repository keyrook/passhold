export interface Entry {
  name: string;
  bytes: Uint8Array;
  program?: boolean;
}
export function tarGz(entries: readonly Entry[], epoch: number): Buffer;
export function zip(entries: readonly Entry[], epoch: number): Buffer;
