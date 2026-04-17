/**
 * Convert Persian/Arabic/English numbers to English numbers
 * @param {string} str - Input string with numbers
 * @returns {string} - String with English numbers
 */
export function convertToEnglishNumbers(str) {
  if (!str) return '';

  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let result = str.toString();

  // Convert Persian numbers
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
  }

  // Convert Arabic numbers
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
  }

  return result;
}

/**
 * Convert English numbers to Persian numbers
 * @param {string} str - Input string with English numbers
 * @returns {string} - String with Persian numbers
 */
export function convertToPersianNumbers(str) {
  if (!str) return '';

  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let result = str.toString();

  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(englishNumbers[i], 'g'), persianNumbers[i]);
  }

  return result;
}

/**
 * Extract only numbers from string
 * @param {string} str - Input string
 * @returns {string} - Only numbers
 */
export function extractNumbers(str) {
  if (!str) return '';
  return convertToEnglishNumbers(str).replace(/\D/g, '');
}

/**
 * Convert number to Persian words (for amount in words)
 * @param {number} num - Number to convert
 * @returns {string} - Persian words
 */
export function numberToPersianWords(num) {
  const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const hundreds = [
    '',
    'یکصد',
    'دویست',
    'سیصد',
    'چهارصد',
    'پانصد',
    'ششصد',
    'هفتصد',
    'هشتصد',
    'نهصد',
  ];
  const teens = [
    'ده',
    'یازده',
    'دوازده',
    'سیزده',
    'چهارده',
    'پانزده',
    'شانزده',
    'هفده',
    'هجده',
    'نوزده',
  ];

  if (num === 0) return 'صفر';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one > 0 ? ' و ' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return hundreds[hundred] + (remainder > 0 ? ' و ' + numberToPersianWords(remainder) : '');
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return (
      numberToPersianWords(thousand) +
      ' هزار' +
      (remainder > 0 ? ' و ' + numberToPersianWords(remainder) : '')
    );
  }
  if (num < 1000000000) {
    const million = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    return (
      numberToPersianWords(million) +
      ' میلیون' +
      (remainder > 0 ? ' و ' + numberToPersianWords(remainder) : '')
    );
  }
  return num.toString();
}

function numberToWordsByDictionary(num, dictionary) {
  const {
    ones,
    teens,
    tens,
    hundreds,
    thousandLabel,
    millionLabel,
    andWord,
    zeroWord,
  } = dictionary;

  if (num === 0) return zeroWord;
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one > 0 ? ` ${andWord} ${ones[one]}` : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return (
      hundreds[hundred] +
      (remainder > 0 ? ` ${andWord} ${numberToWordsByDictionary(remainder, dictionary)}` : '')
    );
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return (
      numberToWordsByDictionary(thousand, dictionary) +
      ` ${thousandLabel}` +
      (remainder > 0 ? ` ${andWord} ${numberToWordsByDictionary(remainder, dictionary)}` : '')
    );
  }
  if (num < 1000000000) {
    const million = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    return (
      numberToWordsByDictionary(million, dictionary) +
      ` ${millionLabel}` +
      (remainder > 0 ? ` ${andWord} ${numberToWordsByDictionary(remainder, dictionary)}` : '')
    );
  }
  return num.toString();
}

const enDictionary = {
  ones: ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
  teens: [
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ],
  tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
  hundreds: ['', 'one hundred', 'two hundred', 'three hundred', 'four hundred', 'five hundred', 'six hundred', 'seven hundred', 'eight hundred', 'nine hundred'],
  thousandLabel: 'thousand',
  millionLabel: 'million',
  andWord: 'and',
  zeroWord: 'zero',
};

const trDictionary = {
  ones: ['', 'bir', 'iki', 'uc', 'dort', 'bes', 'alti', 'yedi', 'sekiz', 'dokuz'],
  teens: ['on', 'on bir', 'on iki', 'on uc', 'on dort', 'on bes', 'on alti', 'on yedi', 'on sekiz', 'on dokuz'],
  tens: ['', '', 'yirmi', 'otuz', 'kirk', 'elli', 'altmis', 'yetmis', 'seksen', 'doksan'],
  hundreds: ['', 'yuz', 'iki yuz', 'uc yuz', 'dort yuz', 'bes yuz', 'alti yuz', 'yedi yuz', 'sekiz yuz', 'dokuz yuz'],
  thousandLabel: 'bin',
  millionLabel: 'milyon',
  andWord: 've',
  zeroWord: 'sifir',
};

const ruDictionary = {
  ones: ['', 'odin', 'dva', 'tri', 'chetyre', 'pyat', 'shest', 'sem', 'vosem', 'devyat'],
  teens: ['desyat', 'odinnadcat', 'dvenadcat', 'trinadcat', 'chetyrnadcat', 'pyatnadcat', 'shestnadcat', 'semnadcat', 'vosemnadcat', 'devyatnadcat'],
  tens: ['', '', 'dvadcat', 'tridcat', 'sorok', 'pyatdesyat', 'shestdesyat', 'semdesyat', 'vosemdesyat', 'devyanosto'],
  hundreds: ['', 'sto', 'dvesti', 'trista', 'chetyresta', 'pyatsot', 'shestsot', 'semsot', 'vosemsot', 'devyatsot'],
  thousandLabel: 'tysyacha',
  millionLabel: 'million',
  andWord: 'i',
  zeroWord: 'nol',
};

const arDictionary = {
  ones: ['', 'wahid', 'ithnan', 'thalatha', 'arbaa', 'khamsa', 'sitta', 'sabaa', 'thamaniya', 'tisaa'],
  teens: ['ashara', 'ahada ashar', 'ithna ashar', 'thalathata ashar', 'arbaata ashar', 'khamsata ashar', 'sittata ashar', 'sabata ashar', 'thamaniyata ashar', 'tisata ashar'],
  tens: ['', '', 'ishrun', 'thalathun', 'arbaun', 'khamsun', 'sittun', 'sabeun', 'thamanun', 'tiseun'],
  hundreds: ['', 'mia', 'miatan', 'thalathumiah', 'arbaumiah', 'khamsumiah', 'sittumiah', 'sabeumiah', 'thamanumiah', 'tiseumiah'],
  thousandLabel: 'alf',
  millionLabel: 'milyun',
  andWord: 'wa',
  zeroWord: 'sifr',
};

/**
 * Convert number to words based on app language.
 * @param {number} num - Number to convert
 * @param {string} lang - Language code (fa, en, tr, ar, ru)
 * @returns {string}
 */
export function numberToWordsByLang(num, lang = 'fa') {
  if (lang === 'fa') return numberToPersianWords(num);
  if (lang === 'tr') return numberToWordsByDictionary(num, trDictionary);
  if (lang === 'ru') return numberToWordsByDictionary(num, ruDictionary);
  if (lang === 'ar') return numberToWordsByDictionary(num, arDictionary);
  return numberToWordsByDictionary(num, enDictionary);
}
