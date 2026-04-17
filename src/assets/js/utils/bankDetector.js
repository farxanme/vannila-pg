import { extractNumbers } from './numberConverter.js';

/**
 * Bank BIN Detection Utility
 */

const panBins = [
  { bin: 'Unknown', bankName: 'Unknown', bankCode: '' },
  { bin: '903769', bankName: 'Unknown', bankCode: '' },
  { bin: '991975', bankName: 'Mellat', bankCode: '012' },
  { bin: '207177', bankName: 'Export Development', bankCode: '020' },
  { bin: '189956', bankName: 'Tosee Taavon', bankCode: '' },
  { bin: '170019', bankName: 'Melli Iran', bankCode: '' },
  { bin: '606256', bankName: 'Mellal', bankCode: '075' },
  { bin: '606373', bankName: 'Mehr Iran', bankCode: '060' },
  { bin: '601287', bankName: 'Unknown', bankCode: '' },
  { bin: '603799', bankName: 'Melli', bankCode: '017' },
  { bin: '603769', bankName: 'Saderat', bankCode: '' },
  { bin: '603770', bankName: 'Keshavarzi', bankCode: '016' },
  { bin: '628023', bankName: 'Maskan', bankCode: '014' },
  { bin: '628157', bankName: 'Credit Istitute for Development', bankCode: '051' },
  { bin: '627884', bankName: 'Parsian', bankCode: '054' },
  { bin: '627961', bankName: 'Industry & Mine', bankCode: '011' },
  { bin: '627381', bankName: 'Ansar', bankCode: '015' },
  { bin: '627353', bankName: 'Tejarat', bankCode: '018' },
  { bin: '627488', bankName: 'Kar Afarin', bankCode: '053' },
  { bin: '627412', bankName: 'Eghtesad Novin', bankCode: '055' },
  { bin: '627648', bankName: 'Export Development', bankCode: '020' },
  { bin: '627760', bankName: 'Post', bankCode: '021' },
  { bin: '622106', bankName: 'Parsian', bankCode: '054' },
  { bin: '621986', bankName: 'Saman', bankCode: '056' },
  { bin: '610433', bankName: 'Mellat', bankCode: '' },
  { bin: '639607', bankName: 'Sarmayeh', bankCode: '058' },
  { bin: '639599', bankName: 'Ghavamin', bankCode: '052' },
  { bin: '639347', bankName: 'Pasargad', bankCode: '' },
  { bin: '639346', bankName: 'Sina', bankCode: '059' },
  { bin: '639370', bankName: 'Mehr', bankCode: '060' },
  { bin: '639217', bankName: 'Keshavarzi', bankCode: '016' },
  { bin: '636949', bankName: 'Hekmat', bankCode: '065' },
  { bin: '636214', bankName: 'Ayandeh', bankCode: '062' },
  { bin: '636795', bankName: 'IRI Central', bankCode: '' },
  { bin: '585983', bankName: 'Tejarat', bankCode: '018' },
  { bin: '585947', bankName: 'Middle East', bankCode: '' },
  { bin: '589463', bankName: 'Refah', bankCode: '013' },
  { bin: '589210', bankName: 'Sepah', bankCode: '015' },
  { bin: '594321', bankName: 'Central', bankCode: '' },
  { bin: '593333', bankName: 'SEP', bankCode: '' },
  { bin: '504172', bankName: 'Resalat', bankCode: '070' },
  { bin: '504706', bankName: 'Shahr', bankCode: '061' },
  { bin: '505801', bankName: 'Kowsar', bankCode: '' },
  { bin: '505809', bankName: 'Middle East', bankCode: '' },
  { bin: '505416', bankName: 'Tourism', bankCode: '064' },
  { bin: '505785', bankName: 'Iran Zamin', bankCode: '069' },
  { bin: '502806', bankName: 'Shahr', bankCode: '061' },
  { bin: '502908', bankName: 'Tosee Taavon', bankCode: '022' },
  { bin: '502938', bankName: 'Dey', bankCode: '066' },
  { bin: '502229', bankName: 'Pasargad', bankCode: '057' },
  { bin: '450905', bankName: 'Unknown', bankCode: '' },
];

// Neo-bank BINs that require extended (8+ digit) matching
const neoBins = [
  // Blu Bank – identified by first 8 digits of PAN
  { bin: '62198619', bankName: 'Blu', bankCode: '' },
];

const bankLocalizedNames = {
  saman: { en: 'Saman', fa: 'سامان', ar: 'سامان' },
  pasargad: { en: 'Pasargad', fa: 'پاسارگاد', ar: 'باسارغاد' },
  ayandeh: { en: 'Ayandeh', fa: 'آینده', ar: 'آينده' },
  'gharzolhasaneh-resalat': { en: 'Resalat', fa: 'رسالت', ar: 'رسالت' },
  melli: { en: 'Melli', fa: 'ملی', ar: 'ملي' },
  mellat: { en: 'Mellat', fa: 'ملت', ar: 'ملت' },
  saderat: { en: 'Saderat', fa: 'صادرات', ar: 'صادرات' },
  keshavarzi: { en: 'Keshavarzi', fa: 'کشاورزی', ar: 'الزراعة' },
  tejarat: { en: 'Tejarat', fa: 'تجارت', ar: 'تجارت' },
  maskan: { en: 'Maskan', fa: 'مسکن', ar: 'مسكن' },
  'sanat-madan': { en: 'Industry & Mine', fa: 'صنعت و معدن', ar: 'الصناعة والمناجم' },
  shahr: { en: 'Shahr', fa: 'شهر', ar: 'شهر' },
  'eghtesad-novin': { en: 'Eghtesad Novin', fa: 'اقتصاد نوین', ar: 'اقتصاد نوين' },
  sina: { en: 'Sina', fa: 'سینا', ar: 'سينا' },
  refah: { en: 'Refah', fa: 'رفاه', ar: 'رفاه' },
  sepah: { en: 'Sepah', fa: 'سپه', ar: 'سبه' },
  'iran-zamin': { en: 'Iran Zamin', fa: 'ایران زمین', ar: 'ايران زمين' },
  ansar: { en: 'Ansar', fa: 'انصار', ar: 'أنصار' },
  ghavamin: { en: 'Ghavamin', fa: 'قوامین', ar: 'قوامين' },
  parsian: { en: 'Parsian', fa: 'پارسیان', ar: 'بارسيان' },
  blu: { en: 'Blu', fa: 'بلو', ar: 'بلو' },
  post: { en: 'Post', fa: 'پست بانک', ar: 'بنك البريد' },
  'middle-east': { en: 'Middle East', fa: 'خاورمیانه', ar: 'الشرق الأوسط' },
  dey: { en: 'Dey', fa: 'دی', ar: 'دي' },
  'tosee-taavon': { en: 'Tosee Taavon', fa: 'توسعه تعاون', ar: 'تنمية التعاون' },
  'karafarin': { en: 'Kar Afarin', fa: 'کارآفرین', ar: 'كار آفرين' },
  'mehr-eghtesad': { en: 'Mehr', fa: 'مهر', ar: 'مهر' },
  mellal: { en: 'Mellal', fa: 'ملل', ar: 'ملل' },
  sarmaye: { en: 'Sarmayeh', fa: 'سرمایه', ar: 'سرماية' },
  tourism: { en: 'Tourism', fa: 'گردشگری', ar: 'السياحة' },
};

const bankNameToKeyMatchers = [
  { key: 'saman', checks: ['saman', 'سامان'] },
  { key: 'pasargad', checks: ['pasargad', 'پاسارگاد'] },
  { key: 'ayandeh', checks: ['ayandeh', 'آینده'] },
  { key: 'gharzolhasaneh-resalat', checks: ['resalat', 'رسالت'] },
  { key: 'melli', checks: ['melli', 'melli iran', 'ملی'] },
  { key: 'mellat', checks: ['mellat', 'ملت'] },
  { key: 'saderat', checks: ['saderat', 'صادرات'] },
  { key: 'keshavarzi', checks: ['keshavarzi', 'کشاورزی'] },
  { key: 'tejarat', checks: ['tejarat', 'تجارت'] },
  { key: 'maskan', checks: ['maskan', 'مسکن'] },
  { key: 'sanat-madan', checks: ['industry & mine', 'صنعت و معدن'] },
  { key: 'shahr', checks: ['shahr', 'شهر'] },
  { key: 'eghtesad-novin', checks: ['eghtesad novin', 'اقتصاد نوین'] },
  { key: 'sina', checks: ['sina', 'سینا'] },
  { key: 'refah', checks: ['refah', 'رفاه'] },
  { key: 'sepah', checks: ['sepah', 'سپه'] },
  { key: 'iran-zamin', checks: ['iran zamin', 'ایران زمین'] },
  { key: 'ansar', checks: ['ansar', 'انصار'] },
  { key: 'ghavamin', checks: ['ghavamin', 'قوامین'] },
  { key: 'parsian', checks: ['parsian', 'پارسیان'] },
  { key: 'blu', checks: ['blu', 'بلو'] },
  { key: 'post', checks: ['post', 'پست'] },
  { key: 'middle-east', checks: ['middle east', 'خاورمیانه'] },
  { key: 'dey', checks: ['dey', 'دی'] },
  { key: 'tosee-taavon', checks: ['tosee taavon', 'توسعه تعاون'] },
  { key: 'karafarin', checks: ['kar afarin', 'کارآفرین'] },
  { key: 'mehr-eghtesad', checks: ['mehr', 'مهر'] },
  { key: 'mellal', checks: ['mellal', 'ملل'] },
  { key: 'sarmaye', checks: ['sarmayeh', 'سرمایه'] },
  { key: 'tourism', checks: ['tourism', 'گردشگری'] },
];

function resolveBankLocalizationKey(bankName) {
  const raw = String(bankName || '').trim();
  if (!raw) return null;
  const normalized = raw.toLowerCase().replace(/\s+/g, ' ');
  for (const matcher of bankNameToKeyMatchers) {
    if (matcher.checks.some((s) => normalized.includes(s.toLowerCase()))) {
      return matcher.key;
    }
  }
  return null;
}

/**
 * Get localized bank name for card list.
 * - fa => Persian
 * - ar => Arabic
 * - others => English
 * @param {string} bankName
 * @param {string} lang
 * @returns {string}
 */
export function getLocalizedBankName(bankName, lang = 'fa') {
  const key = resolveBankLocalizationKey(bankName);
  if (!key || !bankLocalizedNames[key]) {
    return bankName || '';
  }
  const targetLang = lang === 'fa' || lang === 'ar' ? lang : 'en';
  return bankLocalizedNames[key][targetLang] || bankLocalizedNames[key].en || bankName || '';
}

/**
 * Detect bank from card number
 * @param {string} cardNumber - Card number (can include spaces)
 * @returns {Object|null} - Bank info or null
 */
export function detectBank(cardNumber) {
  if (!cardNumber) return null;

  // Extract only numbers (supports Persian/Arabic/English digits)
  const numbers = extractNumbers(cardNumber);
  const plain = cardNumber.replace(/\s/g, '');

  if (numbers.length < 6) return null;

  // 1) Check extended BINs (neo banks) first
  const neoBank = neoBins.find((neo) => {
    if (numbers.length < neo.bin.length) return false;
    const firstSegment = plain.slice(0, neo.bin.length);
    // Require full, unmasked digits (no '#') for the extended BIN
    if (firstSegment.length !== neo.bin.length) return false;
    if (firstSegment.includes('#')) return false;
    return numbers.startsWith(neo.bin);
  });

  if (neoBank) {
    return {
      name: neoBank.bankName,
      code: neoBank.bankCode,
      bin: neoBank.bin,
    };
  }

  // 2) Fallback to standard 6–digit BINs
  const bin = numbers.substring(0, 6);
  const bank = panBins.find((b) => b.bin === bin);

  if (bank && bank.bankName !== 'Unknown') {
    return {
      name: bank.bankName,
      code: bank.bankCode,
      bin: bin,
    };
  }

  return null;
}

/**
 * Detect bank from masked PAN (e.g. 62198*******8080, 621986######5273).
 * Do not concatenate all digits — that breaks BIN (e.g. 621988080 → wrong prefix).
 * Uses leading digits before mask, then longest matching BIN in panBins / neoBins.
 * @param {string} maskedPan - Masked PAN string
 * @returns {Object|null} - Bank info or null
 */
export function detectBankFromMaskedPan(maskedPan) {
  if (!maskedPan || typeof maskedPan !== 'string') return null;

  const raw = maskedPan.replace(/\s/g, '');
  const hasMask = /[#*●]/.test(raw);

  if (!hasMask) {
    return detectBank(raw);
  }

  const leadMatch = raw.match(/^(\d+)/);
  if (!leadMatch) return null;
  const lead = leadMatch[1];

  if (lead.length >= 6) {
    const padded = (lead + '0000000000').slice(0, 16);
    const fromFull = detectBank(padded);
    if (fromFull) return fromFull;
  }

  if (lead.length < 4) {
    return null;
  }

  // Neo (8+ digit BIN, e.g. Blu): only when enough digits are visible — avoids Blu vs Saman on short prefixes like 62198
  if (lead.length >= 8) {
    const neo = neoBins.find(
      (n) => n.bin && n.bankName && n.bin.startsWith(lead)
    );
    if (neo) {
      return {
        name: neo.bankName,
        code: neo.bankCode,
        bin: neo.bin,
      };
    }
  }

  const candidates = panBins.filter(
    (b) =>
      b.bin &&
      b.bin !== 'Unknown' &&
      b.bankName &&
      b.bankName !== 'Unknown' &&
      b.bin.startsWith(lead)
  );

  if (candidates.length === 0) {
    return null;
  }

  // Prefer shortest BIN (e.g. 621986 before 62198619 when prefix is ambiguous)
  const best = candidates.sort((a, b) => a.bin.length - b.bin.length)[0];
  return {
    name: best.bankName,
    code: best.bankCode,
    bin: best.bin,
  };
}

/**
 * Get bank logo path
 * @param {string} bankName - Bank name
 * @returns {string} - Logo path
 */
export function getBankLogo(bankName) {
  if (!bankName) {
    return '/assets/images/icons/icn-square-info.svg';
  }

  const originalName = bankName.trim();
  // Normalize (Latin) bank name for file path
  const normalized = originalName.toLowerCase().replace(/\s+/g, '-');

  // Explicit overrides where normalized name does NOT match file name
  const map = {
    'melli-iran': 'melli',
    'industry-&-mine': 'sanat-madan',
    'kar-afarin': 'karafarin',
    post: 'post-bank',
    central: 'central-bank',
    'iri-central': 'central-bank',
    'export-development': 'tosee-saderat',
    sarmayeh: 'sarmaye',
    mehr: 'mehr-eghtesad',
    'mehr-iran': 'mehr-eghtesad',
    'gharzolhasaneh-resalat': 'gharzolhasaneh-resalat',
    'gharzolhasaneh-mehr': 'gharzolhasaneh-mehr',
    noor: 'noor',
    sep: 'shaparak',
  };

  // Handle common Persian bank names coming from API
  const persianMap = [
    { keyword: 'سامان', key: 'saman' },
    { keyword: 'پاسارگاد', key: 'pasargad' },
    { keyword: 'آینده', key: 'ayandeh' },
    { keyword: 'قرض الحسنه رسالت', key: 'gharzolhasaneh-resalat' },
    { keyword: 'رسالت', key: 'gharzolhasaneh-resalat' },
    { keyword: 'ملی', key: 'melli' },
    { keyword: 'ملت', key: 'mellat' },
    { keyword: 'صادرات', key: 'saderat' },
    { keyword: 'کشاورزی', key: 'keshavarzi' },
    { keyword: 'تجارت', key: 'tejarat' },
    { keyword: 'مسکن', key: 'maskan' },
    { keyword: 'صنعت و معدن', key: 'sanat-madan' },
    { keyword: 'شهر', key: 'shahr' },
    { keyword: 'اقتصاد نوین', key: 'eghtesad-novin' },
    { keyword: 'سینا', key: 'sina' },
    { keyword: 'رفاه', key: 'refah' },
    { keyword: 'سپه', key: 'sepah' },
    { keyword: 'آینده', key: 'ayandeh' },
    { keyword: 'ایران زمین', key: 'iran-zamin' },
    { keyword: 'انصار', key: 'ansar' },
    { keyword: 'قوامین', key: 'ghavamin' },
  ];

  // All available bank SVG icon filenames (without extension)
  const availableIcons = [
    'gharzolhasaneh-resalat',
    'ansar',
    'ghavamin',
    'khavarmiane',
    'central-bank',
    'gharzolhasaneh-mehr',
    'gardeshgari',
    'melli',
    'iran-venezuela',
    'parsian',
    'ayandeh',
    'hekmat',
    'post-bank',
    'tosee-saderat',
    'future',
    'taavon-eslami',
    'kosar',
    'karafarin',
    'day',
    'keshavarzi',
    'mellat',
    'saman',
    'maskan',
    'noor',
    'sarmaye',
    'mellal',
    'pasargad',
    'shaparak',
    'saderat',
    'blu',
    'tejarat',
    'sina',
    'shahr',
    'wepod',
    'tat',
    'iran-zamin',
    'abank',
    'sanat-madan',
    'sepah',
    'refah',
    'tosee-taavon',
    'mehr-eghtesad',
    'tosee',
    'bankino',
    'eghtesad-novin',
    'farda',
    'iran-europe',
  ];

  // Try Persian mapping first
  let mappedKey = null;
  for (const item of persianMap) {
    if (originalName.includes(item.keyword)) {
      mappedKey = item.key;
      break;
    }
  }

  // Fallback to Latin/normalized mapping
  if (!mappedKey) {
    mappedKey = map[normalized] || normalized;
  }

  if (!availableIcons.includes(mappedKey)) {
    return '/assets/images/icons/icn-square-info.svg';
  }

  return `/assets/images/banks/${mappedKey}.svg`;
}

/**
 * Format card number (4-4-4-4)
 * @param {string} cardNumber - Card number
 * @returns {string} - Formatted card number
 */
export function formatCardNumber(cardNumber) {
  if (!cardNumber) return '';

  const numbers = cardNumber.replace(/\D/g, '');
  const parts = [];

  for (let i = 0; i < numbers.length; i += 4) {
    parts.push(numbers.substring(i, i + 4));
  }

  return parts.join(' ');
}
