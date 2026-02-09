import { extractNumbers } from './numberConverter.js';

/**
 * Validation Rules
 */

/**
 * Validate card number (16 digits)
 * @param {string} cardNumber - Card number
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateCardNumber(cardNumber) {
  const numbers = extractNumbers(cardNumber);
  
  if (!numbers || numbers.length === 0) {
    return { valid: false, message: 'Card number is required' };
  }
  
  if (numbers.length !== 16) {
    return { valid: false, message: 'Card number must be 16 digits' };
  }
  
  // Luhn algorithm check
  let sum = 0;
  let isEven = false;
  
  for (let i = numbers.length - 1; i >= 0; i--) {
    let digit = parseInt(numbers[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  const valid = sum % 10 === 0;
  
  return {
    valid,
    message: valid ? '' : 'Invalid card number'
  };
}

/**
 * Validate mobile number (Iranian format)
 * @param {string} mobile - Mobile number
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateMobile(mobile) {
  const numbers = extractNumbers(mobile);
  
  if (!numbers || numbers.length === 0) {
    return { valid: false, message: 'Mobile number is required' };
  }
  
  // Iranian mobile: 09xxxxxxxxx (11 digits) or 9xxxxxxxxx (10 digits)
  const pattern = /^(09|\+989|989|9)\d{9}$/;
  const cleanMobile = numbers.startsWith('09') ? numbers : (numbers.startsWith('9') ? '0' + numbers : numbers);
  
  if (!pattern.test(cleanMobile) || cleanMobile.length !== 11) {
    return { valid: false, message: 'Invalid mobile number format' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate email
 * @param {string} email - Email address
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { valid: false, message: 'Email is required' };
  }
  
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = pattern.test(email);
  
  return {
    valid,
    message: valid ? '' : 'Invalid email format'
  };
}

/**
 * Validate CVV2 (3-4 digits)
 * @param {string} cvv - CVV2 code
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateCVV2(cvv) {
  const numbers = extractNumbers(cvv);
  
  if (!numbers || numbers.length === 0) {
    return { valid: false, message: 'CVV2 is required' };
  }
  
  if (numbers.length < 3 || numbers.length > 4) {
    return { valid: false, message: 'CVV2 must be 3 or 4 digits' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate expiry date
 * @param {string} month - Month (01-12)
 * @param {string} year - Year (YY or YYYY)
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateExpiryDate(month, year) {
  const monthNum = parseInt(extractNumbers(month));
  const yearNum = parseInt(extractNumbers(year));
  
  if (!month || !year) {
    return { valid: false, message: 'Expiry date is required' };
  }
  
  if (monthNum < 1 || monthNum > 12) {
    return { valid: false, message: 'Invalid month' };
  }
  
  // Convert 2-digit year to 4-digit
  const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  if (fullYear < currentYear || (fullYear === currentYear && monthNum < currentMonth)) {
    return { valid: false, message: 'Card has expired' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate required field
 * @param {string} value - Field value
 * @param {string} fieldName - Field name for error message
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateRequired(value, fieldName = 'Field') {
  if (!value || value.trim() === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: '' };
}

/**
 * Validate OTP (6 digits)
 * @param {string} otp - OTP code
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateOTP(otp) {
  const numbers = extractNumbers(otp);
  
  if (!numbers || numbers.length === 0) {
    return { valid: false, message: 'OTP is required' };
  }
  
  if (numbers.length !== 6) {
    return { valid: false, message: 'OTP must be 6 digits' };
  }
  
  return { valid: true, message: '' };
}
