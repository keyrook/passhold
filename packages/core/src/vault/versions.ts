/**
 * Every version of an item: what it held before each edit, kept inside the
 * item, so it is sealed, synced and backed up with it and never readable
 * apart from it. A version is what an edit would give back — never when the
 * item was used, nor its own earlier versions.
 *
 * Kept only while the owner's plan holds it (plan.ts); versions already kept
 * stay when it no longer does, since a limit never destroys data.
 */
import { canonical } from './canonical.js';

export interface ItemVersion<Draft> {
  /** When the edit that replaced it was made. */
  savedAt: number;
  draft: Draft;
}

/**
 * Bounds on what one item keeps. A version of a long note is as long as the
 * note, and every one is sealed with the item each time it changes.
 */
export const VERSION_LIMITS = { count: 50, bytes: 512_000 } as const;

/** The newest first, within the bounds: the oldest go first. */
export function trimVersions<Draft>(versions: readonly ItemVersion<Draft>[]): ItemVersion<Draft>[] {
  const kept = [...versions].sort((a, b) => b.savedAt - a.savedAt).slice(0, VERSION_LIMITS.count);
  let bytes = 0;
  const within: ItemVersion<Draft>[] = [];
  for (const version of kept) {
    bytes += JSON.stringify(version).length;
    if (bytes > VERSION_LIMITS.bytes && within.length) break;
    within.push(version);
  }
  return within;
}

/**
 * The versions after an edit: what the item was goes first, unless the edit
 * changed nothing a version holds (a favourite, a use) or versions are not
 * kept on this plan.
 */
export function afterEdit<Draft extends object>(
  versions: readonly ItemVersion<Draft>[] | undefined,
  before: Draft,
  after: Draft,
  now: number,
  keep: boolean,
): ItemVersion<Draft>[] | undefined {
  if (!keep || canonical(before) === canonical(after)) return versions as ItemVersion<Draft>[] | undefined;
  return trimVersions([{ savedAt: now, draft: before }, ...(versions ?? [])]);
}

/**
 * Versions as stored, each draft checked by `clean`, which says what the item
 * would be: a version that is not one is dropped.
 */
export function cleanVersions<Draft>(value: unknown, clean: (raw: Record<string, unknown>) => Draft | null): ItemVersion<Draft>[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const versions: ItemVersion<Draft>[] = [];
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) continue;
    const { savedAt, draft } = entry as { savedAt?: unknown; draft?: unknown };
    if (typeof savedAt !== 'number' || !Number.isFinite(savedAt) || savedAt <= 0) continue;
    if (typeof draft !== 'object' || draft === null) continue;
    const cleaned = clean(draft as Record<string, unknown>);
    if (cleaned) versions.push({ savedAt, draft: cleaned });
  }
  return versions.length ? trimVersions(versions) : undefined;
}

/** Both copies' versions, each once: two devices that edited the same item keep what either held. */
export function joinVersions<Draft>(a: readonly ItemVersion<Draft>[] | undefined, b: readonly ItemVersion<Draft>[] | undefined): ItemVersion<Draft>[] | undefined {
  if (!b?.length) return a as ItemVersion<Draft>[] | undefined;
  if (!a?.length) return b as ItemVersion<Draft>[];
  const seen = new Set<string>();
  const both: ItemVersion<Draft>[] = [];
  for (const version of [...a, ...b]) {
    const key = `${version.savedAt}:${canonical(version.draft as object)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    both.push(version);
  }
  return trimVersions(both);
}
