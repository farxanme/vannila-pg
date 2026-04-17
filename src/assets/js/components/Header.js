/**
 * Shared Header Component
 * Fixed at top, logo, title, language dropdown, card
 */
export class Header {
  static settingsMenuIdSeq = 0;

  constructor(options = {}) {
    this.options = {
      logo: options.logo || null,
      secondaryLogo: options.secondaryLogo || null,
      title: options.title || '',
      showCard: options.showCard !== false,
      cardContent: options.cardContent || null,
      onLanguageChange: options.onLanguageChange || null,
      ...options,
    };

    this.init();
  }

  /**
   * Initialize header
   */
  async init() {
    await this.createHTML();
    this.attachEvents();
    this.handleResize();
  }

  /**
   * Create HTML structure
   */
  async createHTML() {
    const header = document.createElement('header');
    header.className = 'header';
    header.setAttribute('role', 'banner');

    const container = document.createElement('div');
    container.className = 'container header-container';

    // Toolbar: settings + language (floating)
    const toolbar = document.createElement('div');
    toolbar.className = 'header-toolbar';
    this.headerToolbar = toolbar;
    await this.createSettingsDropdown(toolbar);
    await this.createLanguageDropdown(toolbar);
    header.appendChild(toolbar);

    this.closeAllHeaderMenus = () => {
      if (this.langMenuEl) this.langMenuEl.style.display = 'none';
      if (this.langButtonEl) this.langButtonEl.setAttribute('aria-expanded', 'false');
      if (this.settingsMenuEl) this.settingsMenuEl.style.display = 'none';
      if (this.settingsButtonEl) this.settingsButtonEl.setAttribute('aria-expanded', 'false');
    };
    document.addEventListener('click', (e) => {
      if (this.headerToolbar && !this.headerToolbar.contains(e.target)) {
        this.closeAllHeaderMenus();
      }
    });

    // Inner container
    const innerContainer = document.createElement('div');
    innerContainer.className = 'header-inner';

    // Logo (main brand logo)
    if (this.options.logo) {
      const logo = document.createElement('div');
      logo.className = 'header-logo';
      if (typeof this.options.logo === 'string') {
        const img = document.createElement('img');
        img.src = this.options.logo;
        img.alt = 'Logo';
        logo.appendChild(img);
      } else if (this.options.logo instanceof HTMLElement) {
        logo.appendChild(this.options.logo);
      }
      innerContainer.appendChild(logo);
    }

    // Title
    if (this.options.title) {
      const title = document.createElement('h1');
      title.className = 'header-title';
      title.textContent = this.options.title;
      innerContainer.appendChild(title);
    }

    // Secondary logo (to replace header card)
    if (this.options.secondaryLogo) {
      const secondary = document.createElement('div');
      secondary.className = 'header-shaparak-logo';
      if (typeof this.options.secondaryLogo === 'string') {
        const img = document.createElement('img');
        img.src = this.options.secondaryLogo;
        img.alt = 'Secondary Logo';
        secondary.appendChild(img);
      } else if (this.options.secondaryLogo instanceof HTMLElement) {
        secondary.appendChild(this.options.secondaryLogo);
      }
      innerContainer.appendChild(secondary);
    }

    container.appendChild(innerContainer);
    header.appendChild(container);

    this.element = header;
    document.body.insertBefore(header, document.body.firstChild);
  }

  /**
   * Settings dropdown (theme: light / dark / system)
   * @param {HTMLElement} container - Toolbar element
   */
  async createSettingsDropdown(container) {
    const { i18n } = await import('../utils/i18n.js');
    const { getThemePreference, setThemePreference } = await import('../utils/themeManager.js');

    const wrap = document.createElement('div');
    wrap.className = 'header-settings-dropdown';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'settings-dropdown-btn';
    button.setAttribute('aria-label', i18n.t('accessibility.openSettings'));
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', `header-settings-menu-${Header.settingsMenuIdSeq++}`);

    button.innerHTML = `
      <svg class="settings-dropdown-btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.65.87.12.064.243.123.367.18.338.154.73.26 1.125.26.17 0 .34-.02.505-.06l1.28-.256a1.125 1.125 0 011.315.63l.621 1.29c.15.307.09.67-.15.92l-.855.93a1.125 1.125 0 011.315 1.595l.855.93c.24.25.3.613.15.92l-.621 1.29a1.125 1.125 0 01-1.315.63l-1.28-.256a1.125 1.125 0 00-.505.06c-.385.07-.76.157-1.125.26-.124.057-.247.116-.367.18-.337.184-.587.496-.65.87l-.213 1.281c-.09.542-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.65-.87a5.71 5.71 0 01-.367-.18 1.125 1.125 0 01-1.125-.26l-1.28.256a1.125 1.125 0 01-1.315-.63l-.621-1.29a1.125 1.125 0 01.15-.92l.855-.93a1.125 1.125 0 01-1.315-1.595l.855-.93a1.125 1.125 0 01-.15-.92l.621-1.29a1.125 1.125 0 011.315-.63l1.28.256c.168.038.337.058.505.06.385.07.76.157 1.125.26.124.057.247.116.367.18.337.184.587.496.65.87l.213 1.281z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>`;

    const menu = document.createElement('div');
    menu.className = 'settings-dropdown-menu';
    menu.style.display = 'none';
    const menuId = button.getAttribute('aria-controls');
    menu.id = menuId;

    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'settings-dropdown-section-title';
    sectionTitle.id = `${menuId}-theme-heading`;
    sectionTitle.setAttribute('data-i18n', 'settings.theme');
    sectionTitle.textContent = i18n.t('settings.theme');

    const radiogroup = document.createElement('div');
    radiogroup.setAttribute('role', 'radiogroup');
    radiogroup.setAttribute('aria-labelledby', sectionTitle.id);

    const modeDefs = [
      { value: 'light', i18nKey: 'settings.theme.light' },
      { value: 'dark', i18nKey: 'settings.theme.dark' },
      { value: 'system', i18nKey: 'settings.theme.system' },
    ];

    const themeButtons = [];

    const syncThemeSelection = () => {
      const pref = getThemePreference();
      themeButtons.forEach(({ el, value }) => {
        const checked = pref === value;
        el.setAttribute('aria-checked', checked ? 'true' : 'false');
      });
    };

    modeDefs.forEach(({ value, i18nKey }) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'settings-theme-option';
      row.setAttribute('role', 'radio');
      row.setAttribute('aria-checked', 'false');
      const check = document.createElement('span');
      check.className = 'settings-theme-check';
      check.setAttribute('aria-hidden', 'true');
      check.textContent = '✓';
      const label = document.createElement('span');
      label.setAttribute('data-i18n', i18nKey);
      label.textContent = i18n.t(i18nKey);
      row.appendChild(check);
      row.appendChild(label);
      row.onclick = (e) => {
        e.stopPropagation();
        setThemePreference(value);
        syncThemeSelection();
        menu.style.display = 'none';
        button.setAttribute('aria-expanded', 'false');
      };
      themeButtons.push({ el: row, value });
      radiogroup.appendChild(row);
    });

    syncThemeSelection();
    window.addEventListener('themePreferenceChange', syncThemeSelection);

    menu.appendChild(sectionTitle);
    menu.appendChild(radiogroup);

    const refreshSettingsI18n = () => {
      sectionTitle.textContent = i18n.t('settings.theme');
      i18n.applyDataI18n(menu);
      button.setAttribute('aria-label', i18n.t('accessibility.openSettings'));
      radiogroup.setAttribute('aria-label', i18n.t('settings.theme'));
    };
    document.addEventListener('languageChange', refreshSettingsI18n);

    button.onclick = (e) => {
      e.stopPropagation();
      if (this.langMenuEl) {
        this.langMenuEl.style.display = 'none';
        if (this.langButtonEl) this.langButtonEl.setAttribute('aria-expanded', 'false');
      }
      const isOpen = menu.style.display === 'block';
      menu.style.display = isOpen ? 'none' : 'block';
      button.setAttribute('aria-expanded', !isOpen);
    };

    wrap.appendChild(button);
    wrap.appendChild(menu);
    container.appendChild(wrap);

    this.settingsButtonEl = button;
    this.settingsMenuEl = menu;
  }

  /**
   * Create language dropdown
   * @param {HTMLElement} container - Toolbar element
   */
  async createLanguageDropdown(container) {
    const { i18n } = await import('../utils/i18n.js');

    const wrap = document.createElement('div');
    wrap.className = 'header-lang-dropdown';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lang-dropdown-btn';
    button.setAttribute('aria-label', i18n.t('accessibility.selectLanguage'));
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');

    const currentLang = i18n.getLanguage();
    const languages = i18n.getAvailableLanguages();
    const currentLangObj = languages.find((l) => l.code === currentLang);
    button.textContent = currentLangObj?.nativeName || currentLang.toUpperCase();

    const dropdown = document.createElement('div');
    dropdown.className = 'lang-dropdown-menu';
    dropdown.style.display = 'none';

    languages.forEach((lang) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `lang-dropdown-item ${lang.code === currentLang ? 'active' : ''}`;
      item.textContent = lang.nativeName;
      item.onclick = () => {
        i18n.setLanguage(lang.code);
        button.textContent = lang.nativeName;
        dropdown.style.display = 'none';
        button.setAttribute('aria-expanded', 'false');

        if (this.options.onLanguageChange) {
          this.options.onLanguageChange(lang.code);
        }
      };
      dropdown.appendChild(item);
    });

    button.onclick = (e) => {
      e.stopPropagation();
      if (this.settingsMenuEl) {
        this.settingsMenuEl.style.display = 'none';
        if (this.settingsButtonEl) this.settingsButtonEl.setAttribute('aria-expanded', 'false');
      }
      const isOpen = dropdown.style.display === 'block';
      dropdown.style.display = isOpen ? 'none' : 'block';
      button.setAttribute('aria-expanded', !isOpen);
    };

    wrap.appendChild(button);
    wrap.appendChild(dropdown);
    container.appendChild(wrap);

    this.langButtonEl = button;
    this.langMenuEl = dropdown;
    this.langDropdown = wrap;
  }

  /**
   * Update title
   * @param {string} title - New title
   */
  updateTitle(title) {
    const titleElement = this.element?.querySelector('.header-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  /**
   * Update card content
   * @param {string|HTMLElement} content - New content
   */
  updateCard(content) {
    if (this.cardElement) {
      if (typeof content === 'string') {
        this.cardElement.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        this.cardElement.innerHTML = '';
        this.cardElement.appendChild(content);
      }
    }
  }

  /**
   * Handle resize (mobile header height animation)
   */
  handleResize() {
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const header = this.element;

      if (window.innerWidth <= 768) {
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      lastScrollY = currentScrollY;
    });
  }

  /**
   * Attach events
   */
  attachEvents() {
    // Handle mobile card animation
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  /**
   * Destroy component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
