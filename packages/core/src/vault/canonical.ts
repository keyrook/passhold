/**
 * Keys in one order whatever order an item was built in, so the same item
 * always hashes the same — at every depth: a list of keys handed to
 * JSON.stringify would drop every key of a field not also a key of the item,
 * and a field's new value would never be seen, nor sent.
 */
export const canonical = (item: object) =>
  JSON.stringify(item, (_, value: unknown) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : value,
  );
