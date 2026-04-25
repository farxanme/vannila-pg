import { extractNumbers } from './numberConverter.js';
import { getBankBins } from '../services/ipgService.js';

/**
 * Bank BIN Detection Utility
 */

const fallbackPanBins = [
  { bin: '991975', bankName: 'Mellat', bankCode: '012' },
  { bin: '207177', bankName: 'Export Development', bankCode: '020' },
  { bin: '189956', bankName: 'Tosee Taavon', bankCode: '' },
  { bin: '170019', bankName: 'Melli Iran', bankCode: '' },
  { bin: '606256', bankName: 'Mellal', bankCode: '075' },
  { bin: '606373', bankName: 'Mehr Iran', bankCode: '060' },
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
];

let panBins = [...fallbackPanBins];
let bankBinsInitialized = false;

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
  karafarin: { en: 'Kar Afarin', fa: 'کارآفرین', ar: 'كار آفرين' },
  'mehr-eghtesad': { en: 'Mehr', fa: 'مهر', ar: 'مهر' },
  mellal: { en: 'Mellal', fa: 'ملل', ar: 'ملل' },
  sarmaye: { en: 'Sarmayeh', fa: 'سرمایه', ar: 'سرماية' },
  tourism: { en: 'Tourism', fa: 'گردشگری', ar: 'السياحة' },
  'central-bank': { en: 'IRI CentralBank', fa: 'بانک مرکزی', ar: 'البنك المركزي' },
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
  {
    key: 'central-bank',
    checks: ['iri centralbank', 'iri central', 'central bank', 'centralbank', 'بانک مرکزی'],
  },
];

const logoKeyByLocalizationKey = {
  saman: 'saman',
  pasargad: 'pasargad',
  ayandeh: 'ayandeh',
  'gharzolhasaneh-resalat': 'gharzolhasaneh-resalat',
  melli: 'melli',
  mellat: 'mellat',
  saderat: 'saderat',
  keshavarzi: 'keshavarzi',
  tejarat: 'tejarat',
  maskan: 'maskan',
  'sanat-madan': 'sanat-madan',
  shahr: 'shahr',
  'eghtesad-novin': 'eghtesad-novin',
  sina: 'sina',
  refah: 'refah',
  sepah: 'sepah',
  'iran-zamin': 'iran-zamin',
  ansar: 'ansar',
  ghavamin: 'ghavamin',
  parsian: 'parsian',
  blu: 'blu',
  post: 'post-bank',
  'middle-east': 'khavarmiane',
  dey: 'day',
  'tosee-taavon': 'tosee-taavon',
  karafarin: 'karafarin',
  'mehr-eghtesad': 'mehr-eghtesad',
  mellal: 'mellal',
  sarmaye: 'sarmaye',
  tourism: 'gardeshgari',
  'central-bank': 'central-bank',
};

const availableLogoKeys = new Set([
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
]);

function isValidBinItem(item) {
  if (!item || typeof item !== 'object') return false;
  const bin = String(item.bin ?? '').trim();
  const bankName = String(item.bankName ?? '').trim();
  return /^\d{5,12}$/.test(bin) && bankName.length > 0;
}

function normalizeBankBins(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(isValidBinItem).map((item) => ({
    bin: String(item.bin).trim(),
    bankName: String(item.bankName).trim(),
    bankCode: String(item.bankCode ?? '').trim(),
  }));
}

function mergeBinLists(primary, secondary) {
  const map = new Map();
  [...primary, ...secondary].forEach((item) => {
    const normalized = isValidBinItem(item)
      ? {
          bin: String(item.bin).trim(),
          bankName: String(item.bankName).trim(),
          bankCode: String(item.bankCode ?? '').trim(),
        }
      : null;
    if (!normalized) return;
    const key = normalized.bin;
    if (!map.has(key)) {
      map.set(key, normalized);
    }
  });
  return Array.from(map.values());
}

function getKnownBins() {
  return panBins.filter((b) => b.bin && b.bankName && b.bankName !== 'Unknown');
}

function findBestBinByPan(numbers) {
  const candidates = getKnownBins().filter((b) => numbers.startsWith(b.bin));
  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => b.bin.length - a.bin.length)[0];
}

/**
 * Initialize BIN list from API and keep fallback on failure.
 * API: GET /v2/ipg/base-data/bank-bins.js
 * @returns {Promise<object[]>}
 */
export async function initializeBankBins() {
  if (bankBinsInitialized) {
    return panBins;
  }

  try {
    const apiBins = await getBankBins();
    const normalized = normalizeBankBins(apiBins);
    if (normalized.length > 0) {
      panBins = mergeBinLists(normalized, fallbackPanBins);
    } else {
      panBins = [...fallbackPanBins];
    }
  } catch {
    panBins = [...fallbackPanBins];
  } finally {
    bankBinsInitialized = true;
  }

  return panBins;
}

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

function findBankRecordByBin(bankBin) {
  const normalizedBin = String(bankBin || '').replace(/\D/g, '');
  if (!normalizedBin) return null;

  const mergedBins = [...panBins, ...fallbackPanBins, ...neoBins];
  const candidates = mergedBins.filter(
    (item) =>
      item &&
      item.bin &&
      /^\d+$/.test(String(item.bin)) &&
      normalizedBin.startsWith(String(item.bin))
  );
  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => String(b.bin).length - String(a.bin).length)[0];
}

function resolveBankProfile(bankName, bankBin) {
  const byBin = findBankRecordByBin(bankBin);
  const effectiveName = byBin?.bankName || bankName || '';
  const key = resolveBankLocalizationKey(effectiveName);
  if (!key) {
    return {
      name: effectiveName,
      key: null,
      localized: null,
      logoKey: null,
    };
  }
  return {
    name: effectiveName,
    key,
    localized: bankLocalizedNames[key] || null,
    logoKey: logoKeyByLocalizationKey[key] || null,
  };
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
export function getLocalizedBankName(bankName, lang = 'fa', bankBin = '') {
  const profile = resolveBankProfile(bankName, bankBin);
  if (!profile.localized) {
    return profile.name || bankName || '';
  }
  const targetLang = lang === 'fa' || lang === 'ar' ? lang : 'en';
  return profile.localized[targetLang] || profile.localized.en || profile.name || bankName || '';
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

  if (numbers.length < 5) return null;

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

  // 2) Fallback to normal BIN list (supports variable lengths)
  const bank = findBestBinByPan(numbers);

  if (bank) {
    return {
      name: bank.bankName,
      code: bank.bankCode,
      bin: bank.bin,
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
    const neo = neoBins.find((n) => n.bin && n.bankName && n.bin.startsWith(lead));
    if (neo) {
      return {
        name: neo.bankName,
        code: neo.bankCode,
        bin: neo.bin,
      };
    }
  }

  const knownBins = getKnownBins();

  const exactLeadMatches = knownBins.filter((b) => lead.startsWith(b.bin));
  if (exactLeadMatches.length > 0) {
    const bestExact = exactLeadMatches.sort((a, b) => b.bin.length - a.bin.length)[0];
    return {
      name: bestExact.bankName,
      code: bestExact.bankCode,
      bin: bestExact.bin,
    };
  }

  const candidates = knownBins.filter((b) => b.bin && b.bin.startsWith(lead));

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
export function getBankLogo(bankName, bankBin = '') {
  const profile = resolveBankProfile(bankName, bankBin);
  if (!profile.name) {
    return '/assets/images/icons/icn-square-info.svg';
  }

  if (profile.logoKey && availableLogoKeys.has(profile.logoKey)) {
    return `/assets/images/banks/${profile.logoKey}.svg`;
  }

  const originalName = profile.name.trim();
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

  // Try localized key mapping first (covers Persian/English aliases)
  const localizedKey = resolveBankLocalizationKey(originalName);
  let mappedKey =
    localizedKey && logoKeyByLocalizationKey[localizedKey]
      ? logoKeyByLocalizationKey[localizedKey]
      : null;

  // Fallback to Latin/normalized mapping
  if (!mappedKey) {
    mappedKey = map[normalized] || normalized;
  }

  if (!availableLogoKeys.has(mappedKey)) {
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
