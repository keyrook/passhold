/**
 * API keys in and out of files: Passhold's own CSV of them, Bitwarden
 * Secrets Manager's `bws secret list`, and the entries of another manager's
 * file that look like keys though they were saved as logins or notes.
 */
import { blankApiKey, cleanEnvName, cleanHosts, dayOf, dayText, serviceOfKey, withService } from '../apikey.js';
import { brandFor } from '../brand/match.js';
import { PassholdError } from '../errors.js';
import type { ApiKeyDraft, CustomField, VaultData, WalletItem } from '../vault/model.js';
import { collector, MAX_IMPORT_ROWS, record, str, type ImportResult } from './collect.js';

/** The columns of Passhold's CSV of API keys, in order: one key a row, its hosts in one cell, its dates as `YYYY-MM-DD`. */
export const API_KEY_COLUMNS = ['title', 'service', 'key', 'key_id', 'hosts', 'send_as', 'env', 'environment', 'scopes', 'issued', 'expires', 'notes', 'folder'] as const;

function cell(value: string): string {
  return /[",\r\n]/.test(value) || /^\s|\s$/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Every live API key, in Passhold's own columns. Plain text: the page that
 * offers it says so, and asks for proof of its owner first, as for logins.
 */
export function exportApiKeysCsv(wallet: readonly WalletItem[]): string {
  const lines = [API_KEY_COLUMNS.join(',')];
  for (const item of wallet) {
    if (item.kind !== 'apikey' || item.deletedAt !== null) continue;
    const row: Record<(typeof API_KEY_COLUMNS)[number], string> = {
      title: item.title,
      service: item.service,
      key: item.key,
      key_id: item.keyId,
      hosts: item.hosts.join(' '),
      send_as: item.sendAs,
      env: item.env,
      environment: item.environment,
      scopes: item.scopes,
      issued: dayText(item.issuedAt),
      expires: dayText(item.expiresAt),
      notes: item.notes,
      folder: item.folder,
    };
    lines.push(API_KEY_COLUMNS.map((column) => cell(row[column])).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}

/** Whether a CSV's header is Passhold's own for API keys. */
export function isApiKeysHeader(header: readonly string[]): boolean {
  return ['key', 'key_id', 'hosts', 'send_as'].every((column) => header.includes(column));
}

/** Rows of Passhold's CSV of API keys, into what an import brings. */
export function readApiKeysCsv(header: readonly string[], body: readonly string[][], vault: Pick<VaultData, 'items' | 'wallet'>): ImportResult {
  const into = collector(vault);
  for (const row of body) {
    const get = (column: (typeof API_KEY_COLUMNS)[number]) => row[header.indexOf(column)] ?? '';
    const title = get('title');
    into.keep(
      {
        ...blankApiKey(),
        title,
        service: get('service').trim(),
        key: get('key'),
        keyId: get('key_id'),
        hosts: cleanHosts(get('hosts')),
        sendAs: get('send_as'),
        env: get('env'),
        environment: get('environment'),
        scopes: get('scopes'),
        issuedAt: dayOf(get('issued')),
        expiresAt: dayOf(get('expires')),
        notes: get('notes'),
      },
      title,
      get('notes'),
      get('folder').trim(),
    );
  }
  return into.done('passhold');
}

/**
 * The service an entry is for: by what its key starts with, then by where
 * it is used, then by its name — a key is named only when one of them says.
 */
export function serviceFor(key: string, keyId: string, hosts: readonly string[], title: string): string {
  return serviceOfKey(key, keyId) ?? brandFor(hosts.length ? '' : title, hosts.map((host) => `https://${host.replace(/^\*\./, '')}`))?.slug ?? '';
}

/** An API key from what another manager's entry holds, filed under the service it is for, with that service's defaults. */
export function apiKeyFrom(entry: Partial<Omit<ApiKeyDraft, 'kind'>> & { key: string }): ApiKeyDraft {
  const draft: ApiKeyDraft = { ...blankApiKey(), ...entry, hosts: cleanHosts(entry.hosts ?? []) };
  return withService(draft, entry.service || serviceFor(draft.key, draft.keyId, draft.hosts, draft.title));
}

/** A field's name that says it holds a key: an API key, a token, a secret, an access key. */
const KEY_NAME = /\b(api[\s_-]?key|apikey|token|secret|access[\s_-]?key|client[\s_-]?secret|bearer)\b/i;

/** The hidden field of an entry that holds its key, by its name or by a service's prefix; null when none does. */
export function keyField(fields: readonly CustomField[]): CustomField | null {
  return fields.find((field) => field.hidden && field.value.trim() && (KEY_NAME.test(field.name) || serviceOfKey(field.value))) ?? null;
}

/**
 * Bitwarden Secrets Manager's secrets, as `bws secret list` prints them: each
 * one an API key, its name the variable a command reads it from.
 */
export function importBwsSecrets(input: unknown, vault: Pick<VaultData, 'items' | 'wallet'>): ImportResult {
  if (!Array.isArray(input)) throw new PassholdError('importUnknownFormat');
  if (!input.length) throw new PassholdError('importEmpty');
  if (input.length > MAX_IMPORT_ROWS) throw new PassholdError('importTooLarge');
  const secrets = input.map(record);
  if (!secrets.every((secret) => secret && typeof secret.key === 'string' && typeof secret.value === 'string')) throw new PassholdError('importUnknownFormat');
  const into = collector(vault);
  for (const secret of secrets as Record<string, unknown>[]) {
    const name = str(secret.key);
    into.keep(apiKeyFrom({ title: name, key: str(secret.value), env: cleanEnvName(name), notes: str(secret.note) }), name, str(secret.note));
  }
  return into.done('bitwarden');
}

/** Whether a JSON file is a list of Secrets Manager's secrets. */
export function isBwsList(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.every((entry) => record(entry)?.object === 'secret' || (typeof record(entry)?.key === 'string' && typeof record(entry)?.value === 'string' && 'projectId' in record(entry)!));
}

