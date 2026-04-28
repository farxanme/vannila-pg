/**
 * SEP auth captcha (auth.sep.ir) — image + key for CaptchaToken header.
 */
import { getCaptchaApiUrl, useCaptchaMock } from '../config/env.js';
import { fetchMockCaptcha, fetchMockCaptchaAudio } from '../mocks/captchaMocks.js';

/**
 * @returns {Promise<{ imageDataUrl: string, captchaKey: string, expiryInSeconds: number }>}
 */
export async function fetchCaptcha() {
  if (useCaptchaMock()) {
    return fetchMockCaptcha();
  }

  const base = getCaptchaApiUrl();
  const url = `${base}/captcha`;
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'omit',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `Captcha HTTP ${res.status}`);
  }
  const data = json.data;
  if (!data || !data.captchaImageBase64) {
    throw new Error('Invalid captcha response');
  }
  const raw = data.captchaImageBase64;
  const imageDataUrl = raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`;
  return {
    imageDataUrl,
    captchaKey: data.captchaKey,
    expiryInSeconds: data.expiryInSeconds ?? 180,
  };
}

/**
 * @param {string} captchaToken - Captcha key for query string
 * @returns {Promise<Blob>}
 */
export async function fetchCaptchaAudio(captchaToken) {
  if (!captchaToken) {
    throw new Error('Captcha token is required');
  }

  if (useCaptchaMock()) {
    return fetchMockCaptchaAudio(captchaToken);
  }

  const base = getCaptchaApiUrl();
  const captchaKey = encodeURIComponent(String(captchaToken).trim());
  const url = `${base}/captcha/voice?captchaKey=${captchaKey}`;
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'omit',
    headers: {
      Accept: '*/*',
    },
  });

  if (!res.ok) {
    const message = await res.text().catch(() => '');
    throw new Error(message || `Captcha audio HTTP ${res.status}`);
  }

  const blob = await res.blob();
  if (!blob || blob.size === 0) {
    throw new Error('Captcha audio response is empty');
  }

  return blob;
}
