export async function fetchMockCaptcha() {
  throw new Error('Captcha mock is disabled in build mode');
}

export async function fetchMockCaptchaAudio() {
  throw new Error('Captcha audio mock is disabled in build mode');
}
