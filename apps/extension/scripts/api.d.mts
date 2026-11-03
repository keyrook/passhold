export const OFFICIAL_API: string;
export const TEST_API: string;
export function checkApi(url: string): string;
export function accountRpFor(url: string): string;
export function accountPageFor(url: string): string;
export function checkStoreUpload(files: [name: string, bytes: Buffer][]): void;
