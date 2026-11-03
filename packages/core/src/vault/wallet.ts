/**
 * Cards, addresses and notes: read with every field checked, and changed as
 * pure functions, as logins are (items.ts) — so the service worker applies a
 * change inside its serialised turn and nothing is half-changed if sealing
 * fails.
 */
import { PassholdError } from '../errors.js';
import { newId } from '../util/id.js';
import { cleanFields, cleanFolder, fieldWords, settleFolder } from './folders.js';
import { LIMITS, type AddressDraft, type AddressItem, type CardDraft, type CardItem, type CustomField, type Items, type NoteItem, type VaultData, type WalletDraft, type WalletItem } from './model.js';

/** Bounds on one field: far above anything printed on a card or an envelope, below what would slow every seal. */
export const WALLET_LIMITS = { line: 200, street: 1_000, postalCode: 20, phone: 40, email: 320, number: 19, code: 4, text: LIMITS.notes } as const;

// --- reading: everything from storage, a backup or the account is checked -----

const time = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null);

const text = (value: unknown, limit: number): string => (typeof value === 'string' ? value.slice(0, limit) : '');

/** One line: what a form field takes. A pasted newline would end the field early. */
const line = (value: unknown, limit: number = WALLET_LIMITS.line): string => text(value, limit * 2).replace(/\s+/g, ' ').trim().slice(0, limit);

const digits = (value: unknown, limit: number): string => (typeof value === 'string' ? value.replace(/\D/g, '').slice(0, limit) : '');

function lines(value: unknown, limit: number): string {
  return text(value, limit * 2)
    .split(/\r?\n/)
    .map((each) => each.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .slice(0, limit);
}

const month = (value: unknown): number | null => (Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 12 ? (value as number) : null);

/** Four digits; two are read as this century's, as a card prints them. */
function year(value: unknown): number | null {
  if (!Number.isInteger(value)) return null;
  const given = value as number;
  if (given >= 0 && given <= 99) return 2000 + given;
  return given >= 2000 && given <= 2099 ? given : null;
}

const country = (value: unknown): string => (typeof value === 'string' && /^[A-Za-z]{2}$/.test(value.trim()) ? value.trim().toUpperCase() : '');

/** What an item holds, kind by kind: everything but its name, its folder and fields, and what the vault keeps itself. */
type Content<T extends WalletItem> = T extends WalletItem ? Omit<T, 'id' | 'title' | 'favorite' | 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'deletedAt' | 'folder' | 'fields'> : never;

function contentOf(raw: Record<string, unknown>): Content<WalletItem> | null {
  switch (raw.kind) {
    case 'card':
      return {
        kind: 'card',
        holder: line(raw.holder),
        number: digits(raw.number, WALLET_LIMITS.number),
        expMonth: month(raw.expMonth),
        expYear: year(raw.expYear),
        code: digits(raw.code, WALLET_LIMITS.code),
        notes: text(raw.notes, LIMITS.notes),
      } satisfies Content<CardItem>;
    case 'address':
      return {
        kind: 'address',
        name: line(raw.name),
        organization: line(raw.organization),
        street: lines(raw.street, WALLET_LIMITS.street),
        city: line(raw.city),
        region: line(raw.region),
        postalCode: line(raw.postalCode, WALLET_LIMITS.postalCode),
        country: country(raw.country),
        phone: line(raw.phone, WALLET_LIMITS.phone),
        email: line(raw.email, WALLET_LIMITS.email),
        notes: text(raw.notes, LIMITS.notes),
      } satisfies Content<AddressItem>;
    case 'note':
      return { kind: 'note', text: text(raw.text, WALLET_LIMITS.text) } satisfies Content<NoteItem>;
    default:
      return null;
  }
}

/** A card, an address or a note as stored, or null rather than half of one. */
export function cleanWalletItem(value: unknown): WalletItem | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== 'string' || !raw.id) return null;
  const content = contentOf(raw);
  if (!content) return null;
  const createdAt = time(raw.createdAt) ?? Date.now();
  return {
    id: raw.id.slice(0, 64),
    title: line(raw.title, LIMITS.title),
    ...content,
    favorite: raw.favorite === true,
    createdAt,
    updatedAt: time(raw.updatedAt) ?? createdAt,
    lastUsedAt: time(raw.lastUsedAt),
    deletedAt: time(raw.deletedAt),
    folder: cleanFolder(raw.folder),
    fields: cleanFields(raw.fields),
  } as WalletItem;
}

/** The wallet as stored: each item checked, an id seen before — a login's included — dropped. */
export function cleanWallet(value: unknown, seen: Set<string>): WalletItem[] {
  const wallet: WalletItem[] = [];
  for (const entry of Array.isArray(value) ? value : []) {
    const item = cleanWalletItem(entry);
    if (item && !seen.has(item.id)) {
      seen.add(item.id);
      wallet.push(item);
    }
  }
  return wallet;
}

// --- writing ------------------------------------------------------------------

/** Whether there is anything to keep: a card needs its number or a name, an address any part of one, a note any words — or any of them, fields of its own. */
function worthKeeping(title: string, content: Content<WalletItem>, fields: readonly CustomField[]): boolean {
  if (fields.length) return true;
  switch (content.kind) {
    case 'card':
      return Boolean(content.number || title);
    case 'address':
      return Boolean(title || content.name || content.organization || content.street || content.city || content.phone || content.email);
    case 'note':
      return Boolean(title || content.text.trim());
  }
}

/** `folder` and `fields` stay undefined when the draft leaves them out: an edit then keeps the item's own. */
function cleanDraft(draft: WalletDraft): { title: string; content: Content<WalletItem>; folder?: string; fields?: CustomField[] } {
  const content = contentOf(draft as unknown as Record<string, unknown>);
  if (!content) throw new PassholdError('itemInvalid');
  const title = line(draft.title, LIMITS.title);
  const fields = draft.fields === undefined ? undefined : cleanFields(draft.fields);
  if (!worthKeeping(title, content, fields ?? [])) throw new PassholdError('itemInvalid');
  return { title, content, ...(draft.folder !== undefined ? { folder: cleanFolder(draft.folder) } : {}), ...(fields ? { fields } : {}) };
}

/** A draft as the vault would keep it, or null when it holds nothing to keep: what an import offers is checked before it is offered. */
export function cleanWalletDraft(draft: WalletDraft): WalletDraft | null {
  try {
    const { title, content, folder, fields } = cleanDraft(draft);
    return {
      ...content,
      title,
      ...(draft.favorite === true ? { favorite: true } : {}),
      ...(folder ? { folder } : {}),
      ...(fields?.length ? { fields } : {}),
    } as WalletDraft;
  } catch {
    return null;
  }
}

function find(data: Items, id: string): WalletItem {
  const item = data.wallet.find((entry) => entry.id === id);
  if (!item) throw new PassholdError('itemNotFound');
  return item;
}

function replace<T extends Items>(data: T, item: WalletItem): T {
  return { ...data, wallet: data.wallet.map((entry) => (entry.id === item.id ? item : entry)) };
}

export function addWalletItem<T extends Items>(data: T, draft: WalletDraft, now = Date.now()): { data: T; item: WalletItem } {
  const { title, content, folder, fields } = cleanDraft(draft);
  const item = {
    id: newId(),
    title,
    ...content,
    favorite: draft.favorite === true,
    createdAt: now,
    updatedAt: now,
    lastUsedAt: null,
    deletedAt: null,
    folder: settleFolder(data, folder ?? ''),
    fields: fields ?? [],
  } as WalletItem;
  return { data: { ...data, wallet: [...data.wallet, item] }, item };
}

/** Apply an edit. A card stays a card: an edit of another kind is refused, never turned into one. */
export function updateWalletItem<T extends Items>(data: T, id: string, draft: WalletDraft, now = Date.now()): T {
  const item = find(data, id);
  const { title, content, folder, fields } = cleanDraft(draft);
  if (content.kind !== item.kind) throw new PassholdError('itemInvalid');
  return replace(data, {
    ...item,
    title,
    ...content,
    favorite: draft.favorite ?? item.favorite,
    folder: folder === undefined ? item.folder : settleFolder(data, folder, item.id),
    fields: fields ?? item.fields,
    updatedAt: now,
  } as WalletItem);
}

export function setWalletFavorite<T extends Items>(data: T, id: string, favorite: boolean): T {
  return replace(data, { ...find(data, id), favorite });
}

/** To the trash. Nothing leaves the vault until its owner empties the trash. */
export function trashWalletItem<T extends Items>(data: T, id: string, now = Date.now()): T {
  return replace(data, { ...find(data, id), deletedAt: now, updatedAt: now });
}

export function restoreWalletItem<T extends Items>(data: T, id: string, now = Date.now()): T {
  return replace(data, { ...find(data, id), deletedAt: null, updatedAt: now });
}

/** Gone for good — only from the trash, so one click can never destroy a live card. */
export function purgeWalletItem<T extends Items>(data: T, id: string): T {
  if (find(data, id).deletedAt === null) throw new PassholdError('itemInvalid');
  return { ...data, wallet: data.wallet.filter((entry) => entry.id !== id) };
}

export function markWalletUsed<T extends Items>(data: T, id: string, now = Date.now()): T {
  return replace(data, { ...find(data, id), lastUsedAt: now });
}

// --- reading for a page ---------------------------------------------------------

const fold = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/gi, 'd').toLowerCase();

/**
 * Case- and accent-blind search over what a person would remember. Of a card,
 * its last digits, never the whole number: a search box is not where a card
 * number should be typed.
 */
export function searchWallet(items: readonly WalletItem[], query: string): WalletItem[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [...items];
  return items.filter((item) => {
    const haystack = fold([...searchable(item), item.folder, ...fieldWords(item.fields)].join(' '));
    return words.every((word) => haystack.includes(word));
  });
}

function searchable(item: WalletItem): string[] {
  switch (item.kind) {
    case 'card': {
      const network = cardNetwork(item.number);
      return [item.title, item.holder, network ? CARD_NETWORK_NAMES[network] : '', item.number.slice(-4), item.notes];
    }
    case 'address':
      return [item.title, item.name, item.organization, item.street, item.city, item.region, item.postalCode, item.country, item.phone, item.email, item.notes];
    case 'note':
      return [item.title, item.text];
  }
}

/** Live items of one kind, the most recently used first: what the list under a field offers. */
export function walletOf<K extends WalletItem['kind']>(data: VaultData, kind: K): Extract<WalletItem, { kind: K }>[] {
  return data.wallet
    .filter((item): item is Extract<WalletItem, { kind: K }> => item.kind === kind && item.deletedAt === null)
    .sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0) || walletTitle(a).localeCompare(walletTitle(b)));
}

/**
 * A name for an item its owner did not name, from what it holds — a card's
 * network and last digits, an address's name — or '' when nothing does, for
 * the page to say in its reader's language.
 */
export function walletTitle(item: WalletItem): string {
  if (item.title) return item.title;
  switch (item.kind) {
    case 'card': {
      if (!item.number) return '';
      const network = cardNetwork(item.number);
      return `${network ? `${CARD_NETWORK_NAMES[network]} ` : ''}•••• ${item.number.slice(-4)}`;
    }
    case 'address':
      return item.name || item.organization || item.street.split('\n')[0] || '';
    case 'note':
      return '';
  }
}

// --- cards -------------------------------------------------------------------------

export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'jcb' | 'discover' | 'unionpay' | 'diners' | 'maestro' | 'napas';

/** Each network as it names itself on its cards: a name, the same in every language. */
export const CARD_NETWORK_NAMES: Record<CardNetwork, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  jcb: 'JCB',
  discover: 'Discover',
  unionpay: 'UnionPay',
  diners: 'Diners Club',
  maestro: 'Maestro',
  napas: 'Napas',
};

// By the first digits. Napas — Vietnam's own network — first: its 9704 is no other's.
const NETWORKS: readonly [CardNetwork, RegExp][] = [
  ['napas', /^9704/],
  ['amex', /^3[47]/],
  ['jcb', /^35(2[89]|[3-8])/],
  ['diners', /^3(0[0-5]|09|[68])/],
  ['visa', /^4/],
  ['mastercard', /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/],
  ['maestro', /^(5018|5020|5038|5893|6304|6759|676[1-3])/],
  ['unionpay', /^62/],
  ['discover', /^(6011|64[4-9]|65)/],
];

export function cardNetwork(number: string): CardNetwork | null {
  return NETWORKS.find(([, prefix]) => prefix.test(number))?.[0] ?? null;
}

/**
 * The check digit every international card number ends with (Luhn). A miss is
 * almost always a mistyped digit; Napas numbers are left to their bank, as not
 * all of them carry it.
 */
export function cardNumberLooksRight(number: string): boolean {
  if (!/^\d{12,19}$/.test(number)) return false;
  if (cardNetwork(number) === 'napas') return true;
  let sum = 0;
  for (let index = 0; index < number.length; index++) {
    let digit = Number(number[number.length - 1 - index]);
    if (index % 2 === 1) digit = digit * 2 > 9 ? digit * 2 - 9 : digit * 2;
    sum += digit;
  }
  return sum % 10 === 0;
}

/** The number in the groups it is printed in: American Express 4–6–5, the rest in fours. */
export function cardGroups(number: string): string[] {
  const sizes = cardNetwork(number) === 'amex' ? [4, 6, 5] : [];
  const groups: string[] = [];
  let at = 0;
  for (const size of sizes) {
    if (at >= number.length) break;
    groups.push(number.slice(at, at + size));
    at += size;
  }
  for (; at < number.length; at += 4) groups.push(number.slice(at, at + 4));
  return groups;
}

/** MM/YY, as a card prints it; '' when either half is missing. */
export function cardExpiry(card: Pick<CardItem, 'expMonth' | 'expYear'>): string {
  if (card.expMonth === null || card.expYear === null) return '';
  return `${String(card.expMonth).padStart(2, '0')}/${String(card.expYear % 100).padStart(2, '0')}`;
}

/** A card works until the last day of the month printed on it. */
export function cardExpired(card: Pick<CardItem, 'expMonth' | 'expYear'>, now = Date.now()): boolean {
  if (card.expMonth === null || card.expYear === null) return false;
  // Month numbers count from 0 here, so the card's own month, 1-based, is the first after it.
  return now >= new Date(card.expYear, card.expMonth, 1).getTime();
}

// --- addresses ---------------------------------------------------------------------

/**
 * Surnames that open a Vietnamese name, written as a page would compare them:
 * no accents. Over nine in ten Vietnamese carry one of these.
 */
const FAMILY_FIRST = new Set(
  'nguyen tran le pham hoang huynh phan vu vo dang bui do ho ngo duong ly dao doan vuong trinh truong lam phung mai to ha ta cao luu dinh chau thai quach luong kieu tang'.split(' '),
);

/**
 * A full name as a form that asks for it in two parts wants it. A Vietnamese
 * name puts the family first — Nguyễn Văn An is An of the Nguyễn — and most
 * others last. Only for forms that split the name: the name is kept whole,
 * as its owner writes it.
 */
export function splitName(full: string): { given: string; family: string } {
  const words = full.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return { given: words[0] ?? '', family: '' };
  if (FAMILY_FIRST.has(fold(words[0]!))) return { given: words.slice(1).join(' '), family: words[0]! };
  return { given: words.slice(0, -1).join(' '), family: words.at(-1)! };
}

/** Every country and territory with an ISO 3166-1 code; a page names each in its reader's language. */
export const COUNTRIES: readonly string[] = (
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP ' +
  'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT ' +
  'MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW ' +
  'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG ' +
  'UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'
).split(' ');

/** A country as a form names it — its code, or its name in English or Vietnamese — as its code; '' when it names none. */
export function countryCode(value: unknown): string {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  if (/^[A-Za-z]{2}$/.test(text) && COUNTRIES.includes(text.toUpperCase())) return text.toUpperCase();
  const wanted = fold(text);
  if (!wanted) return '';
  for (const locale of ['en', 'vi']) {
    const names = new Intl.DisplayNames([locale], { type: 'region' });
    const found = COUNTRIES.find((code) => fold(names.of(code) ?? '') === wanted);
    if (found) return found;
  }
  return '';
}

// --- what a checkout sent -----------------------------------------------------------

/**
 * A card a checkout just sent, as the vault would keep it — or null when it is
 * no card to offer: a number that does not add up is a slip of the finger,
 * and saving it would fill the slip in everywhere after.
 */
export function sentCard(raw: unknown): CardDraft | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const content = contentOf({ ...(raw as Record<string, unknown>), kind: 'card' }) as Content<CardItem>;
  if (!cardNumberLooksRight(content.number)) return null;
  return { ...content, title: '' };
}

/** An address a checkout just sent, as the vault would keep it — or null without a street, which is what makes it an address. */
export function sentAddress(raw: unknown): AddressDraft | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const given = raw as Record<string, unknown>;
  const content = contentOf({ ...given, kind: 'address', country: countryCode(given.country) }) as Content<AddressItem>;
  if (!content.street) return null;
  return { ...content, title: '' };
}

export type SentVerdict = { kind: 'new' } | { kind: 'update'; item: CardItem } | { kind: 'known' };

/**
 * Whether a card just sent is new to the vault, a newer copy of one it has —
 * a new expiry date, a code, a name where there was none — or one it has as
 * it is. A field the checkout left empty is no change.
 */
export function judgeSentCard(data: VaultData, sent: CardDraft): SentVerdict {
  const same = walletOf(data, 'card').find((card) => card.number === sent.number);
  if (!same) return { kind: 'new' };
  const differs =
    (sent.expMonth !== null && sent.expMonth !== same.expMonth) ||
    (sent.expYear !== null && sent.expYear !== same.expYear) ||
    (sent.code !== '' && sent.code !== same.code) ||
    (sent.holder !== '' && fold(sent.holder) !== fold(same.holder));
  return differs ? { kind: 'update', item: same } : { kind: 'known' };
}

/** Whether the vault has an address just sent: the same first line of the street, and the same name where both have one. */
export function judgeSentAddress(data: VaultData, sent: AddressDraft): 'new' | 'known' {
  const line = (street: string) => fold(street.split('\n')[0] ?? '');
  const known = walletOf(data, 'address').some(
    (address) => line(address.street) === line(sent.street) && (!sent.name || !address.name || fold(address.name) === fold(sent.name)),
  );
  return known ? 'known' : 'new';
}

/**
 * What a checkout sent, into the vault: a new card or address added, a card
 * it has taking what changed — over what it had, its name and notes its
 * own — and what it already has left as it is.
 */
export function saveSent(data: VaultData, sent: { card: CardDraft | null; address: AddressDraft | null }, now = Date.now()): VaultData {
  let next = data;
  if (sent.card) {
    const verdict = judgeSentCard(next, sent.card);
    if (verdict.kind === 'new') next = addWalletItem(next, sent.card, now).data;
    if (verdict.kind === 'update') {
      const { item } = verdict;
      next = updateWalletItem(
        next,
        item.id,
        {
          kind: 'card',
          title: item.title,
          holder: sent.card.holder || item.holder,
          number: item.number,
          expMonth: sent.card.expMonth ?? item.expMonth,
          expYear: sent.card.expYear ?? item.expYear,
          code: sent.card.code || item.code,
          notes: item.notes,
        },
        now,
      );
    }
  }
  if (sent.address && judgeSentAddress(next, sent.address) === 'new') next = addWalletItem(next, sent.address, now).data;
  return next;
}
