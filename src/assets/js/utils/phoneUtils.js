import { extractNumbers } from './numberConverter.js';

/**
 * Normalize phone-like text for tel: links.
 * Keeps a leading plus sign when present and strips separators/spaces.
 * @param {string} value
 * @returns {string}
 */
export function normalizePhoneForTel(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const hasPlus = raw.startsWith('+');
  const digits = extractNumbers(raw);
  if (!digits) return '';
  return `${hasPlus ? '+' : ''}${digits}`;
}

/**
 * Basic plausibility check for phone numbers after normalization.
 * @param {string} normalizedPhone
 * @returns {boolean}
 */
export function isPlausiblePhone(normalizedPhone) {
  const digitsCount = String(normalizedPhone || '').replace(/\D/g, '').length;
  return digitsCount >= 8 && digitsCount <= 14;
}
