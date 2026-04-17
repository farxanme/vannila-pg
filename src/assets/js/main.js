/**
 * Main initialization file
 * Loads translations and initializes i18n
 */
import { i18n } from './utils/i18n.js';
import { initTheme } from './utils/themeManager.js';

initTheme();

(async () => {
  await i18n.readyPromise;
  const savedLang = localStorage.getItem('app_language');
  const langToSet =
    savedLang && ['fa', 'en', 'tr', 'ar', 'ru'].includes(savedLang) ? savedLang : 'fa';
  i18n.setLanguage(langToSet);
})();

export { i18n };
