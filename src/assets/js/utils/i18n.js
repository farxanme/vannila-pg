/**
 * Internationalization (i18n) Manager
 * Supports: Persian (default), English, Turkish, Arabic, Russian
 */
class I18n {
  constructor() {
    // Load language from localStorage or use default
    const savedLang = localStorage.getItem('app_language');
    this.currentLang = savedLang && ['fa', 'en', 'tr', 'ar', 'ru'].includes(savedLang) ? savedLang : 'fa';
    this.translations = {};
    this.loadTranslations();
  }

  /**
   * Load translations
   */
  async loadTranslations() {
    try {
      const [fa, en, tr, ar, ru] = await Promise.all([
        import('../locales/fa.js'),
        import('../locales/en.js'),
        import('../locales/tr.js'),
        import('../locales/ar.js'),
        import('../locales/ru.js')
      ]);
      
      this.translations = {
        fa: fa.default || {},
        en: en.default || {},
        tr: tr.default || {},
        ar: ar.default || {},
        ru: ru.default || {}
      };
    } catch (err) {
      console.warn('Failed to load translations:', err);
      this.translations = {
        fa: {},
        en: {},
        tr: {},
        ar: {},
        ru: {}
      };
    }
  }

  /**
   * Set language
   * @param {string} lang - Language code (fa, en, tr, ar, ru)
   */
  setLanguage(lang) {
    if (['fa', 'en', 'tr', 'ar', 'ru'].includes(lang)) {
      this.currentLang = lang;
      // Save to localStorage
      localStorage.setItem('app_language', lang);
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', this.getDirection(lang));
      this.updatePageDirection();
      this.triggerLanguageChange();
    }
  }

  /**
   * Get current language
   * @returns {string} - Current language code
   */
  getLanguage() {
    return this.currentLang;
  }

  /**
   * Get text direction
   * @param {string} lang - Language code
   * @returns {string} - Direction (rtl or ltr)
   */
  getDirection(lang) {
    return ['fa', 'ar'].includes(lang) ? 'rtl' : 'ltr';
  }

  /**
   * Update page direction
   */
  updatePageDirection() {
    const direction = this.getDirection(this.currentLang);
    document.documentElement.setAttribute('dir', direction);
    document.body.setAttribute('dir', direction);
  }

  /**
   * Translate key
   * @param {string} key - Translation key
   * @param {Object} params - Parameters to replace
   * @returns {string} - Translated text
   */
  t(key, params = {}) {
    const translation = this.translations[this.currentLang]?.[key] || key;
    
    // Replace parameters
    let result = translation;
    Object.keys(params).forEach(param => {
      result = result.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
    });
    
    return result;
  }

  /**
   * Load translations from file
   * @param {string} lang - Language code
   * @param {Object} translations - Translations object
   */
  loadTranslationsForLang(lang, translations) {
    this.translations[lang] = { ...this.translations[lang], ...translations };
  }

  /**
   * Trigger language change event
   */
  triggerLanguageChange() {
    const event = new CustomEvent('languageChange', {
      detail: { lang: this.currentLang }
    });
    document.dispatchEvent(event);
  }

  /**
   * Get available languages
   * @returns {Array} - Array of language objects
   */
  getAvailableLanguages() {
    return [
      { code: 'fa', name: 'فارسی', nativeName: 'فارسی' },
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' }
    ];
  }
}

// Export singleton instance
export const i18n = new I18n();
