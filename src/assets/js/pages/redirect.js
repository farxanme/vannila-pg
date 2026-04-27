/**
 * Redirect Page Script
 * Uses same LoadingScreen as index: logo, progress bar, description
 */
import { i18n } from '../main.js';
import { LoadingScreen } from '../components/LoadingScreen.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('redirect-form');
  if (!form) {
    return;
  }

  await i18n.readyPromise;

  const loadingScreen = new LoadingScreen({
    logo: '/assets/images/logo-full.svg',
    text: i18n.t('redirect.loading'),
    showProgressBar: true,
  });
  loadingScreen.show();

  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('url') || '/';
  const data = urlParams.get('data');

  let formData = {};
  if (data) {
    try {
      formData = JSON.parse(decodeURIComponent(data));
    } catch (e) {
      console.error('Failed to parse redirect data:', e);
    }
  }

  form.action = redirectUrl;
  Object.keys(formData).forEach((key) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = formData[key];
    form.appendChild(input);
  });

  setTimeout(() => {
    loadingScreen.hide();
    loadingScreen.destroy();
    form.submit();
  }, 1000);
});
