/**
 * Environment helpers (Vite: import.meta.env.VITE_*)
 */

export function getIpgBaseUrl() {
  const u = import.meta.env.VITE_IPG_BASE_URL;
  return typeof u === 'string' ? u.replace(/\/$/, '') : '';
}

/**
 * When true or when IPG base URL is empty, use local mocks (see mocks/ipgMocks.js).
 */
export function useIpgMock() {
  if (import.meta.env.VITE_IPG_USE_MOCK === 'true') return true;
  return getIpgBaseUrl() === '';
}

/**
 * Captcha API base (default: Vite dev proxy path to auth.sep.ir).
 */
export function getCaptchaApiUrl() {
  const u = import.meta.env.VITE_CAPTCHA_API_URL;
  if (typeof u === 'string' && u.length > 0) {
    return u.replace(/\/$/, '');
  }
  return '/sep-auth/api/v1';
}

/**
 * When true, captcha image + audio use mocks (see mocks/captchaMocks.js) instead of auth.sep.ir.
 * Same trigger as IPG mock: VITE_CAPTCHA_USE_MOCK, or empty VITE_IPG_BASE_URL (unless IPG mock forced off).
 */
export function useCaptchaMock() {
  if (import.meta.env.VITE_CAPTCHA_USE_MOCK === 'true') return true;
  return useIpgMock();
}

/**
 * Language switcher visibility in header.
 * - false: hide
 * - any other value / undefined: show
 */
export function getShowLanguageSwitcher() {
  return import.meta.env.VITE_SHOW_LANGUAGE_SWITCHER !== 'false';
}

function parsePositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * OTP length constraints.
 * - VITE_OTP_MIN_LENGTH (default: 6)
 * - VITE_OTP_MAX_LENGTH (default: 12)
 */
export function getOtpLengthConfig() {
  const minLength = parsePositiveInt(import.meta.env.VITE_OTP_MIN_LENGTH, 6);
  const rawMaxLength = parsePositiveInt(import.meta.env.VITE_OTP_MAX_LENGTH, 12);
  const maxLength = Math.max(minLength, rawMaxLength);
  return { minLength, maxLength };
}

/**
 * Captcha code length.
 * - VITE_CAPTCHA_CODE_LENGTH (default: 6)
 */
export function getCaptchaCodeLength() {
  return parsePositiveInt(import.meta.env.VITE_CAPTCHA_CODE_LENGTH, 6);
}

/**
 * Default behavior for card input lock during OTP cooldown.
 * - true (default): card input locked while cooldown active
 * - false: keep card input editable during cooldown
 */
export function getDefaultLockCardNumberDuringOtpCooldown() {
  return import.meta.env.VITE_LOCK_CARD_NUMBER_DURING_OTP_COOLDOWN !== 'false';
}
