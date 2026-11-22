export function policy(api: string, filesStore: string | null): string;
export function metaPolicy(api: string, filesStore: string | null): string;
export function headers(api: string, filesStore: string | null): { page: Record<string, string>; assets: Record<string, string> };
