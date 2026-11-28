/**
 * Output redaction for agent runtimes: scrubs every known secret value and its
 * common encodings (raw, base64, base64url, hex, URL-encoded, JSON-escaped,
 * and HTTP Basic auth) from response headers, bodies, stdout, and stderr.
 */
import { fromUtf8, toBase64, utf8 } from '../util/bytes.js';

export interface SecretEntry {
  /** Human-readable item label for the redaction placeholder (e.g. `Stripe`). */
  label: string;
  /** Field name (e.g. `key`, `password`). */
  field: string;
  /** Raw secret value to scrub. */
  value: string;
  /** Optional non-secret key id / username, used to scrub HTTP Basic base64 pairs (`keyId:value`). */
  keyId?: string;
}

const MIN_SECRET_LENGTH = 4;

function toHex(bytes: Uint8Array): string {
  let out = '';
  for (const byte of bytes) out += byte.toString(16).padStart(2, '0');
  return out;
}

function variantsOf(entry: SecretEntry): string[] {
  const { value, keyId } = entry;
  if (!value || value.length < MIN_SECRET_LENGTH) return [];
  const rawBytes = utf8(value);
  const b64 = toBase64(rawBytes);
  const b64NoPad = b64.replace(/=+$/, '');
  const b64Url = b64NoPad.replace(/\+/g, '-').replace(/\//g, '_');
  const hexLower = toHex(rawBytes);
  const hexUpper = hexLower.toUpperCase();
  const urlEnc = encodeURIComponent(value);
  const urlEncLower = urlEnc.replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase());
  const urlEncPlus = urlEnc.replace(/%20/g, '+');
  const jsonEsc = JSON.stringify(value).slice(1, -1);

  const candidates = new Set<string>([
    value,
    b64,
    b64NoPad,
    b64Url,
    hexLower,
    hexUpper,
    urlEnc,
    urlEncLower,
    urlEncPlus,
    jsonEsc,
  ]);

  const addBasic = (pair: string) => {
    const encoded = toBase64(utf8(pair));
    candidates.add(encoded);
    candidates.add(encoded.replace(/=+$/, ''));
  };
  if (keyId) addBasic(`${keyId}:${value}`);
  addBasic(`:${value}`);
  addBasic(`${value}:`);

  return [...candidates].filter((needle) => needle.length >= MIN_SECRET_LENGTH);
}

function placeholderFor(entry: SecretEntry): string {
  const safeLabel = (entry.label || 'secret').replace(/[\[\]\r\n]/g, '_');
  const safeField = (entry.field || 'value').replace(/[\[\]\r\n]/g, '_');
  return `[passhold:${safeLabel}/${safeField}]`;
}

/** Replaces all raw and encoded forms of `secrets` inside `text` with `[passhold:<label>/<field>]`. */
export function redactSecrets(text: string, secrets: readonly SecretEntry[]): string {
  if (!text || !secrets.length) return text;
  const pairs: { needle: string; replacement: string }[] = [];
  const seen = new Set<string>();
  for (const entry of secrets) {
    const replacement = placeholderFor(entry);
    for (const needle of variantsOf(entry)) {
      if (seen.has(needle)) continue;
      seen.add(needle);
      pairs.push({ needle, replacement });
    }
  }
  if (!pairs.length) return text;
  // Longest first so compound forms (e.g. HTTP Basic base64 or full raw secret) win over shorter encodings.
  pairs.sort((a, b) => b.needle.length - a.needle.length);
  let out = text;
  for (const { needle, replacement } of pairs) {
    if (out.includes(needle)) out = out.split(needle).join(replacement);
  }
  return out;
}

/** Redacts secret values from HTTP response header pairs. */
export function redactHeaders(headers: readonly [string, string][], secrets: readonly SecretEntry[]): [string, string][] {
  if (!headers.length || !secrets.length) return headers.map(([k, v]) => [k, v]);
  return headers.map(([name, value]) => [name, redactSecrets(value, secrets)]);
}

/** Redacts secrets from a UTF-8 byte buffer, returning the redacted string. */
export function redactBytes(bytes: Uint8Array, secrets: readonly SecretEntry[]): string {
  if (!bytes.length) return '';
  return redactSecrets(fromUtf8(bytes), secrets);
}
