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
