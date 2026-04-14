/**
 * Captcha API mocks — image + audio for local runs (no auth.sep.ir).
 */

import { mockDelay } from './ipgMocks.js';

/** Stable token for CaptchaToken header in mock flows (OTP/pay still use real IPG or IPG mocks). */
export const mockCaptchaKey = 'mock-captcha-key-local-dev';

/**
 * Visible placeholder captcha (SVG) so the UI is clearly in mock mode.
 * @returns {string} data URL
 */
export function getMockCaptchaImageDataUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="44"><rect fill="#f0f2f5" width="100%" height="100%" rx="6"/><text x="70" y="28" text-anchor="middle" font-size="13" font-family="system-ui,sans-serif" fill="#64748b">MOCK CAPTCHA</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Build a short WAV with an audible tone (mock MP3 substitute) — silent buffers often feel “broken”.
 * @returns {Blob}
 */
export function getMockCaptchaAudioBlob() {
  const sampleRate = 22050;
  const seconds = 0.45;
  const frequency = 880;
  const numSamples = Math.floor(sampleRate * seconds);
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buffer);

  const writeStr = (pos, str) => {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(pos + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  v.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  writeStr(36, 'data');
  v.setUint32(40, dataSize, true);

  const amp = 0.12;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * amp;
    const int16 = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
    v.setInt16(44 + i * 2, int16, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Same shape as GET /captcha JSON response payload used by fetchCaptcha.
 * @returns {Promise<{ imageDataUrl: string, captchaKey: string, expiryInSeconds: number }>}
 */
export async function fetchMockCaptcha() {
  await mockDelay(200);
  return {
    imageDataUrl: getMockCaptchaImageDataUrl(),
    captchaKey: mockCaptchaKey,
    expiryInSeconds: 180,
  };
}

/**
 * Same shape as GET /captcha/play (binary audio).
 * @param {string} _captchaToken - ignored in mock (signature matches real API)
 * @returns {Promise<Blob>}
 */
export async function fetchMockCaptchaAudio(_captchaToken) {
  await mockDelay(200);
  return getMockCaptchaAudioBlob();
}
