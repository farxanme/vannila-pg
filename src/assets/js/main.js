/**
 * Main initialization file
 * Loads translations and initializes i18n
 */
import { i18n } from './utils/i18n.js';

// Initialize i18n
(async () => {
  await i18n.loadTranslations();
  i18n.setLanguage('fa'); // Set default language
})();

export { i18n };
