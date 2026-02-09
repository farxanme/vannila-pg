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
