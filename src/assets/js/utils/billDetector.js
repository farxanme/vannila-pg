import { extractNumbers } from './numberConverter.js';

const billTypeKeyByCode = {
  1: 'bill.type.water',
  2: 'bill.type.electricity',
  3: 'bill.type.gas',
  4: 'bill.type.phone',
  5: 'bill.type.mobile',
  6: 'bill.type.municipality',
  8: 'bill.type.tax',
  9: 'bill.type.traffic',
};

function toDigits(value) {
  return extractNumbers(value ?? '');
}

/**
 * Detects bill type translation key from billId.
 * @param {string | number} billId
 * @returns {string | null}
 */
export function detectBillTypeKey(billId) {
  const normalizedBillId = toDigits(billId);
  if (!normalizedBillId || normalizedBillId.length < 2) return null;
  const typeCode = Number(normalizedBillId.slice(-2, -1));
  return billTypeKeyByCode[typeCode] || null;
}

