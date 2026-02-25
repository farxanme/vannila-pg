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
  const hundreds = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];

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
    return numberToPersianWords(thousand) + ' هزار' + (remainder > 0 ? ' و ' + numberToPersianWords(remainder) : '');
  }
  if (num < 1000000000) {
    const million = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    return numberToPersianWords(million) + ' میلیون' + (remainder > 0 ? ' و ' + numberToPersianWords(remainder) : '');
  }
  return num.toString();
}
