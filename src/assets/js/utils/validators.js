import { extractNumbers } from './numberConverter.js';
import { i18n } from './i18n.js';

/**
 * Validation Rules
 */

/**
 * Saved-card masked PAN (no spaces): full 16 chars, middle hidden with # / • / *.
 * Examples: 621986######5273, 62198●●●●●●8080 (from API 62198*******8080 shown as •).
 */
function isMaskedSavedCardPan(raw) {
  if (!raw || raw.length !== 16) return false;

  // Legacy: 6 digits + 6 mask (# or •) + 4 digits
  if (/^(\d{6})[#●]{6}\d{4}$/.test(raw)) return true;

  // IPG-style: 4–6 leading digits + mask run + last 4 (e.g. 62198*******8080)
  const m = raw.match(/^(\d{4,6})([#●*]+)(\d{4})$/);
  if (!m) return false;
  const lead = m[1];
  const mid = m[2];
  const tail = m[3];
  if (lead.length + mid.length + tail.length !== 16) return false;
  if (!/^[#●*]+$/.test(mid)) return false;
  return true;
}

/**
 * Validate card number (16 digits)
 * @param {string} cardNumber - Card number
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateCardNumber(cardNumber) {
  const raw = (cardNumber || '').replace(/\s/g, '');
  if (isMaskedSavedCardPan(raw)) {
    return { valid: true, message: '' };
  }

  const numbers = extractNumbers(cardNumber);

  if (!numbers || numbers.length === 0) {
    return { valid: false, message: i18n.t('form.cardNumber.required') };
  }

  if (numbers.length !== 16) {
    return { valid: false, message: i18n.t('form.cardNumber.mustBe16Digits') };
  }

  // Luhn accepts impossible PANs like 0000000000000000 (checksum 0); reject all-identical digits.
  if (/^(\d)\1{15}$/.test(numbers)) {
    return { valid: false, message: i18n.t('form.cardNumber.invalid') };
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
    message: valid ? '' : i18n.t('form.cardNumber.invalid'),
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
    return { valid: false, message: i18n.t('form.mobile.required') };
  }

  // Iranian mobile: 09xxxxxxxxx (11 digits) or 9xxxxxxxxx (10 digits)
  const pattern = /^(09|\+989|989|9)\d{9}$/;
  const cleanMobile = numbers.startsWith('09')
    ? numbers
    : numbers.startsWith('9')
      ? '0' + numbers
      : numbers;

  if (!pattern.test(cleanMobile) || cleanMobile.length !== 11) {
    return { valid: false, message: i18n.t('form.mobile.invalid') };
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
    return { valid: false, message: i18n.t('form.email.required') };
  }

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = pattern.test(email);

  return {
    valid,
    message: valid ? '' : i18n.t('form.email.invalid'),
  };
}

/**
 * Validate CVV2
 * @param {string} cvv - CVV2 code
 * @param {number | null} expectedLength - Exact expected length (3 or 4). If null, allow 3-4.
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateCVV2(cvv, expectedLength = null) {
  const numbers = extractNumbers(cvv);

  if (!numbers || numbers.length === 0) {
    return { valid: false, message: i18n.t('form.cvv2.required') };
  }

  if (expectedLength === 3 || expectedLength === 4) {
    if (numbers.length !== expectedLength) {
      return {
        valid: false,
        message: i18n.t('form.cvv2.invalidLength', { count: String(expectedLength) }),
      };
    }
    return { valid: true, message: '' };
  }

  if (numbers.length < 3 || numbers.length > 4) {
    return { valid: false, message: i18n.t('form.cvv2.invalidLengthRange') };
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
    return { valid: false, message: i18n.t('form.expiryDate.required') };
  }

  if (monthNum < 1 || monthNum > 12) {
    return { valid: false, message: i18n.t('form.expiryDate.invalidMonth') };
  }

  // Convert 2-digit year to 4-digit
  const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  if (fullYear < currentYear || (fullYear === currentYear && monthNum < currentMonth)) {
    return { valid: false, message: i18n.t('form.expiryDate.expired') };
  }

  return { valid: true, message: '' };
}

/**
 * Validate required field
 * @param {string} value - Field value
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateRequired(value) {
  if (!value || value.trim() === '') {
    return { valid: false, message: i18n.t('common.required') };
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
    return { valid: false, message: i18n.t('form.otp.required') };
  }

  if (numbers.length !== 6) {
    return { valid: false, message: i18n.t('form.otp.mustBe6Digits') };
  }

  return { valid: true, message: '' };
}
