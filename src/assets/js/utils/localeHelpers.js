/**
 * Locale helpers for number formatting (aligns with RTL languages using fa-IR digits).
 * @param {string} lang - i18n language code (fa, en, tr, ar, ru)
 * @returns {string} BCP 47 locale tag for Intl
 */
export function getNumberLocaleForLang(lang) {
  return ['fa', 'ar'].includes(lang) ? 'fa-IR' : 'en-US';
}

/**
 * Format amount with localized digits and rial suffix.
 * @param {number|string} amount
 * @param {string} lang
 * @param {(key: string) => string} translate
 * @returns {string}
 */
export function formatCurrencyAmountLabel(amount, lang, translate) {
  const locale = getNumberLocaleForLang(lang);
  return `${Number(amount).toLocaleString(locale)} ${translate('transaction.rial')}`;
}
