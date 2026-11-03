/**
 * What a form field asks for, when it is part of a card or an address: by the
 * page's own word first (`autocomplete`, HTML's names for these fields), then
 * by what the field is called — its name, id, placeholder and label — in the
 * languages Passhold speaks and a few more. Nothing here fills or reads a
 * value; fields.ts decides what a person can see.
 */

export type CardRole = 'cc-name' | 'cc-number' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year' | 'cc-csc';
export type AddressRole =
  | 'name'
  | 'given-name'
  | 'family-name'
  | 'organization'
  | 'street-address'
  | 'address-line1'
  | 'address-line2'
  | 'address-line3'
  | 'address-level1'
  | 'address-level2'
  | 'postal-code'
  | 'country'
  | 'country-name'
  | 'tel'
  | 'email';
export type Role = CardRole | AddressRole;

export type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export const CARD_ROLES: ReadonlySet<Role> = new Set<CardRole>(['cc-name', 'cc-number', 'cc-exp', 'cc-exp-month', 'cc-exp-year', 'cc-csc']);
/** The parts that make a form an address form, not a sign-up or a contact form: where. */
export const PLACE_ROLES: ReadonlySet<Role> = new Set<AddressRole>(['street-address', 'address-line1', 'address-level2', 'postal-code', 'country', 'country-name']);

const ROLES: ReadonlySet<string> = new Set<string>([
  ...CARD_ROLES,
  'name',
  'given-name',
  'family-name',
  'organization',
  'street-address',
  'address-line1',
  'address-line2',
  'address-line3',
  'address-level1',
  'address-level2',
  'postal-code',
  'country',
  'country-name',
  'tel',
  'email',
]);

/** Field names of autocomplete's that are a sign-in's, or a code's: such a field is never a card's or an address's. */
const OTHERS = new Set(['username', 'current-password', 'new-password', 'one-time-code', 'webauthn', 'nickname', 'url', 'photo', 'bday', 'sex', 'language']);

/**
 * The page's own word: the field name in `autocomplete`, after any section,
 * shipping/billing or home/work token. `undefined` when the page says nothing
 * that settles it — no attribute, "off", a word it made up — and `null` when
 * it says the field is something else.
 */
function declared(control: Control): Role | null | undefined {
  const tokens = (control.getAttribute('autocomplete') ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  for (const token of tokens.reverse()) {
    if (ROLES.has(token)) return token as Role;
    if (token.startsWith('tel-')) return 'tel';
    if (token === 'cc-given-name' || token === 'cc-family-name') return 'cc-name';
    if (OTHERS.has(token)) return null;
  }
  return undefined;
}

function labelText(control: Control): string {
  const labels = [...(control.labels ?? [])].map((label) => label.textContent ?? '');
  const by = (control.getAttribute('aria-labelledby') ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => control.ownerDocument.getElementById(id)?.textContent ?? '');
  return [...labels, ...by].join(' ');
}

/** What the field is called, as words: "ccExpMonth" and "cc_exp-month" both read "cc exp month". */
export function describe(control: Control): string {
  return [control.name, control.id, control.getAttribute('placeholder'), control.getAttribute('aria-label'), labelText(control)]
    .join(' ')
    .replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')
    .replace(/[_\-.:/[\]()*]+/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .slice(0, 500);
}

/** Whole words, in any script: JavaScript's \b knows no letter outside a–z, and so no Vietnamese word. */
const words = (...alternatives: string[]) => new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${alternatives.join('|')})(?=$|[^\\p{L}\\p{N}])`, 'iu');

const CARD_NAME = words('card ?holder', 'holder ?name', 'name on (the )?card', 'cc ?name', 'card ?name', 'tên chủ thẻ', 'chủ thẻ', 'tên trên thẻ', 'ten chu the', 'chu the', 'karteninhaber', 'titulaire( de la carte)?', 'titular');
const CARD_CODE = words('cvc2?', 'cvv2?', 'csc', 'cvn', 'security ?code', 'card ?code', 'card ?verification', 'verification ?(code|value|number)', 'mã bảo mật', 'ma bao mat', 'mã cvv', 'prüfnummer', 'cryptogramme');
const EXPIRY = words('exp', 'expiry', 'expiration', 'expires', 'expire', 'valid ?(thru|through|until)', 'mm ?yy', 'mm ?yyyy', 'hết hạn', 'het han', 'ngày hết hạn', 'hạn dùng', 'hiệu lực', 'gültig ?bis', 'ablauf(datum)?', "date d'expiration", 'vencimiento', 'scadenza');
const MONTH = words('month', 'mm', 'mo', 'tháng', 'thang', 'monat', 'mois', 'mes', 'mese');
const YEAR = words('year', 'yy', 'yyyy', 'yr', 'năm', 'jahr', 'année', 'annee', 'año', 'anno');
const CARD_NUMBER = words('card ?(number|num|no|nr)', 'cardnumber', 'cc ?(number|num|no)', 'ccnumber', 'credit ?card', 'debit ?card', 'pan', 'số thẻ', 'so the', 'mã số thẻ', 'kartennummer', 'numéro de carte', 'número de tarjeta', 'numero (de )?tarjeta', 'numero carta');

const BIRTH = words('birth', 'birthday', 'birth ?date', 'dob', 'ngày sinh', 'ngay sinh', 'sinh nhật', 'geburt(sdatum|stag)?', 'naissance', 'nacimiento');

/**
 * An expiry date's month or year by its shape, for the many checkouts that
 * name it no more than "MM", or put up a list of months and one of years
 * from this one on. Never a birthday's: those years are past.
 */
function expiryByShape(control: Control, text: string): CardRole | null {
  if (BIRTH.test(text)) return null;
  if (control instanceof HTMLSelectElement) {
    const values = [...control.options].map((option) => (option.value || option.text).trim()).filter((value) => /^\d{1,4}$/.test(value)).map(Number);
    // Twelve options from 1 to 12 is also a quantity: a month only when the field says so.
    if (MONTH.test(text) && values.length >= 12 && values.length <= 13 && [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].every((month) => values.includes(month))) return 'cc-exp-month';
    const years = values.filter((value) => value >= 1000);
    if (years.length >= 5 && Math.min(...years) >= new Date().getFullYear() - 1) return 'cc-exp-year';
    return null;
  }
  const hint = (control.getAttribute('placeholder') ?? '').trim().toLowerCase();
  if (hint === 'mm') return 'cc-exp-month';
  if (/^(yy|yyyy|aa|aaaa)$/.test(hint)) return 'cc-exp-year';
  if (/^mm ?\/ ?(yy|yyyy|aa|aaaa)$/.test(hint)) return 'cc-exp';
  return null;
}

const EMAIL = words('e ?mail', 'thư điện tử');
const PHONE = words('phone', 'mobile', 'tel', 'telephone', 'cell', 'điện thoại', 'dien thoai', 'sđt', 'sdt', 'số điện thoại', 'telefon', 'téléphone', 'teléfono', 'telefono');
const POSTAL = words('zip', 'zip ?code', 'postal', 'post ?code', 'postcode', 'mã bưu (chính|điện)', 'ma buu chinh', 'plz', 'cap', 'code postal', 'código postal', 'codice postale');
const COUNTRY = words('country', 'quốc gia', 'quoc gia', 'nation', 'land', 'pays', 'país', 'paese');
const REGION = words('state', 'province', 'region', 'prefecture', 'county', 'tỉnh', 'tinh', 'tỉnh ?(/ ?)?thành( phố)?', 'bundesland', 'provincia', 'estado');
const CITY = words('city', 'town', 'suburb', 'locality', 'thành phố', 'thanh pho', 'quận', 'huyện', 'quận ?(/ ?)?huyện', 'stadt', 'ort', 'ville', 'ciudad', 'città', 'citta');
const LINE_TWO = words('address ?(line )?2', 'addr ?2', 'street ?2', 'apartment', 'apt', 'suite', 'unit', 'building', 'floor', 'căn hộ', 'tòa nhà', 'toa nha', 'adresszusatz', "complément d'adresse");
const STREET = words('address', 'address ?(line )?1', 'addr', 'addr ?1', 'street', 'street ?address', 'đường', 'địa chỉ', 'dia chi', 'số nhà', 'so nha', 'straße', 'strasse', 'adresse', 'dirección', 'direccion', 'indirizzo');
const ORGANIZATION = words('company', 'organi[sz]ation', 'business', 'firm', 'công ty', 'cong ty', 'tổ chức', 'firma', 'société', 'empresa', 'azienda');
const FULL_NAME = words('full ?name', 'your ?name', 'họ (và )?tên', 'ho (va )?ten', 'recipient', 'người nhận', 'nguoi nhan', 'name', 'nom complet', 'nombre completo');
const GIVEN_NAME = words('first ?name', 'given ?name', 'fname', 'forename', 'tên', 'vorname', 'prénom', 'prenom', 'nombre');
const FAMILY_NAME = words('last ?name', 'family ?name', 'surname', 'lname', 'họ', 'nachname', 'nom', 'apellidos?', 'cognome');

const TEXT_TYPES = new Set(['text', 'tel', 'email', 'number', 'month', 'password', '']);

/**
 * The part of a card or an address this field asks for, or null. A password
 * field is a card's only as its security code: some checkouts hide the code
 * as they would a password.
 */
export function roleOf(control: Control): Role | null {
  if (control instanceof HTMLInputElement && !TEXT_TYPES.has(control.type)) return null;
  const word = declared(control);
  if (word !== undefined) return control instanceof HTMLInputElement && control.type === 'password' && word !== 'cc-csc' ? null : word;
  const text = describe(control);
  if (control instanceof HTMLInputElement && control.type === 'password') return CARD_CODE.test(text) ? 'cc-csc' : null;
  if (CARD_NAME.test(text)) return 'cc-name';
  if (CARD_CODE.test(text)) return 'cc-csc';
  // A month picker is a card's expiry unless it says it is a birthday.
  if (control instanceof HTMLInputElement && control.type === 'month') return BIRTH.test(text) ? null : 'cc-exp';
  if (EXPIRY.test(text)) {
    const month = MONTH.test(text);
    const year = YEAR.test(text);
    // "MM/YY" names both: one field for the two.
    if (month !== year) return month ? 'cc-exp-month' : 'cc-exp-year';
    return 'cc-exp';
  }
  if (CARD_NUMBER.test(text)) return 'cc-number';
  const expiry = expiryByShape(control, text);
  if (expiry) return expiry;

  if ((control instanceof HTMLInputElement && control.type === 'email') || EMAIL.test(text)) return 'email';
  if ((control instanceof HTMLInputElement && control.type === 'tel') || PHONE.test(text)) return 'tel';
  if (POSTAL.test(text)) return 'postal-code';
  if (COUNTRY.test(text)) return 'country';
  if (REGION.test(text)) return 'address-level1';
  if (CITY.test(text)) return 'address-level2';
  if (LINE_TWO.test(text)) return 'address-line2';
  if (STREET.test(text)) return control instanceof HTMLTextAreaElement ? 'street-address' : 'address-line1';
  if (ORGANIZATION.test(text)) return 'organization';
  // A full name before its parts: "Họ và tên" names both "họ" and "tên".
  if (words('full ?name', 'họ (và )?tên', 'ho (va )?ten').test(text)) return 'name';
  if (GIVEN_NAME.test(text) && !FAMILY_NAME.test(text)) return 'given-name';
  if (FAMILY_NAME.test(text) && !GIVEN_NAME.test(text)) return 'family-name';
  if (FULL_NAME.test(text)) return 'name';
  return null;
}
