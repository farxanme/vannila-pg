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
      showLanguageSwitcher:
        typeof options.showLanguageSwitcher === 'boolean' ? options.showLanguageSwitcher : null,
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
    const { getShowLanguageSwitcher } = await import('../config/env.js');
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
    const shouldShowLanguageSwitcher =
      this.options.showLanguageSwitcher == null
        ? getShowLanguageSwitcher()
        : this.options.showLanguageSwitcher;
    if (shouldShowLanguageSwitcher) {
      await this.createLanguageDropdown(toolbar);
    }
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

    const getThemeOptionIconSvg = (mode) => {
      if (mode === 'light') {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Zm0 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-5a1 1 0 1 1 0 2h-1.5a1 1 0 1 1 0-2H20ZM6.5 11a1 1 0 1 1 0 2H5a1 1 0 1 1 0-2h1.5Zm9.07-4.66a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 1 1-1.41 1.41L15.57 7.75a1 1 0 0 1 0-1.41Zm-7.14 7.14a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 1 1-1.41 1.41L8.43 14.9a1 1 0 0 1 0-1.41Zm8.2 2.47a1 1 0 0 1 1.41 0 1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 1 1-1.41-1.41l1.06-1.06Zm-7.14-7.14a1 1 0 0 1 1.41-1.41 1 1 0 0 1 0 1.41L8.84 9.88a1 1 0 1 1-1.41-1.41l1.06-1.06Z"/></svg>';
      }
      if (mode === 'dark') {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.6 2.4a1 1 0 0 1 .7 1.68 7.5 7.5 0 1 0 8.62 8.62 1 1 0 0 1 1.68.7A9.5 9.5 0 1 1 14.6 2.4Z"/></svg>';
      }
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15h-11A2.5 2.5 0 0 1 4 12.5v-7Zm2.5-.5a.5.5 0 0 0-.5.5v7c0 .28.22.5.5.5h11a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-11ZM8 19a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Z"/></svg>';
    };

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
      const icon = document.createElement('span');
      icon.className = 'settings-theme-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = getThemeOptionIconSvg(value);
      const label = document.createElement('span');
      label.setAttribute('data-i18n', i18nKey);
      label.textContent = i18n.t(i18nKey);
      row.appendChild(icon);
      row.appendChild(label);
      row.appendChild(check);
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

    button.onclick = async (e) => {
      e.stopPropagation();
      if (this.langMenuEl) {
        this.langMenuEl.style.display = 'none';
        if (this.langButtonEl) this.langButtonEl.setAttribute('aria-expanded', 'false');
      }
      if (window.matchMedia('(max-width: 768px)').matches) {
        const { BottomSheet } = await import('./BottomSheet.js');
        let settingsSheet = null;
        const sheetContent = document.createElement('div');
        sheetContent.className = 'header-sheet-settings-menu';
        const sheetSectionTitle = document.createElement('div');
        sheetSectionTitle.className = 'settings-dropdown-section-title';
        sheetSectionTitle.id = `${menuId}-sheet-theme-heading`;
        sheetSectionTitle.setAttribute('data-i18n', 'settings.theme');
        sheetSectionTitle.textContent = i18n.t('settings.theme');

        const sheetRadiogroup = document.createElement('div');
        sheetRadiogroup.setAttribute('role', 'radiogroup');
        sheetRadiogroup.setAttribute('aria-labelledby', sheetSectionTitle.id);

        const themeButtonsSheet = [];
        const syncThemeSelectionSheet = () => {
          const pref = getThemePreference();
          themeButtonsSheet.forEach(({ el, value }) => {
            el.setAttribute('aria-checked', pref === value ? 'true' : 'false');
          });
        };

        modeDefs.forEach(({ value, i18nKey }) => {
          const row = document.createElement('button');
          row.type = 'button';
          row.className = 'settings-theme-option';
          row.setAttribute('role', 'radio');
          row.setAttribute('aria-checked', 'false');
          const checkEl = document.createElement('span');
          checkEl.className = 'settings-theme-check';
          checkEl.setAttribute('aria-hidden', 'true');
          const iconEl = document.createElement('span');
          iconEl.className = 'settings-theme-icon';
          iconEl.setAttribute('aria-hidden', 'true');
          iconEl.innerHTML = getThemeOptionIconSvg(value);
          const labelEl = document.createElement('span');
          labelEl.setAttribute('data-i18n', i18nKey);
          labelEl.textContent = i18n.t(i18nKey);
          row.appendChild(iconEl);
          row.appendChild(labelEl);
          row.appendChild(checkEl);
          row.onclick = (ev) => {
            ev.stopPropagation();
            setThemePreference(value);
            syncThemeSelection();
            syncThemeSelectionSheet();
            settingsSheet?.close();
          };
          themeButtonsSheet.push({ el: row, value });
          sheetRadiogroup.appendChild(row);
        });

        syncThemeSelectionSheet();
        sheetContent.appendChild(sheetSectionTitle);
        sheetContent.appendChild(sheetRadiogroup);

        settingsSheet = new BottomSheet({
          title: i18n.t('settings.theme'),
          content: sheetContent,
          scrollable: true,
          onClose: () => {
            settingsSheet?.destroy();
          },
        });
        settingsSheet.open();
        return;
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
      item.setAttribute('role', 'menuitemradio');
      item.setAttribute('aria-checked', lang.code === currentLang ? 'true' : 'false');
      const label = document.createElement('span');
      label.className = 'lang-dropdown-item-label';
      label.textContent = lang.nativeName;
      const check = document.createElement('span');
      check.className = 'settings-theme-check lang-dropdown-item-check';
      check.setAttribute('aria-hidden', 'true');
      item.appendChild(label);
      item.appendChild(check);
      item.setAttribute('data-lang-code', lang.code);
      item.onclick = () => {
        i18n.setLanguage(lang.code);
        button.textContent = lang.nativeName;
        dropdown.querySelectorAll('.lang-dropdown-item').forEach((dropdownItem) => {
          dropdownItem.classList.remove('active');
          dropdownItem.setAttribute('aria-checked', 'false');
        });
        item.classList.add('active');
        item.setAttribute('aria-checked', 'true');
        dropdown.style.display = 'none';
        button.setAttribute('aria-expanded', 'false');

        if (this.options.onLanguageChange) {
          this.options.onLanguageChange(lang.code);
        }
      };
      dropdown.appendChild(item);
    });

    button.onclick = async (e) => {
      e.stopPropagation();
      if (this.settingsMenuEl) {
        this.settingsMenuEl.style.display = 'none';
        if (this.settingsButtonEl) this.settingsButtonEl.setAttribute('aria-expanded', 'false');
      }
      if (window.matchMedia('(max-width: 768px)').matches) {
        const { BottomSheet } = await import('./BottomSheet.js');
        let langSheet = null;
        const sheetWrap = document.createElement('div');
        sheetWrap.className = 'header-sheet-lang-menu';
        const sheetActiveLang = i18n.getLanguage();
        languages.forEach((lang) => {
          const item = document.createElement('button');
          item.type = 'button';
          const isSelected = lang.code === sheetActiveLang;
          item.className = `lang-dropdown-item ${isSelected ? 'active' : ''}`.trim();
          item.setAttribute('role', 'menuitemradio');
          item.setAttribute('aria-checked', isSelected ? 'true' : 'false');
          item.setAttribute('data-lang-code', lang.code);
          if (isSelected) {
            item.setAttribute('aria-current', 'true');
          }
          const labelSheet = document.createElement('span');
          labelSheet.className = 'lang-dropdown-item-label';
          labelSheet.textContent = lang.nativeName;
          const checkSheet = document.createElement('span');
          checkSheet.className = 'settings-theme-check lang-dropdown-item-check';
          checkSheet.setAttribute('aria-hidden', 'true');
          item.appendChild(labelSheet);
          item.appendChild(checkSheet);
          item.onclick = () => {
            i18n.setLanguage(lang.code);
            button.textContent = lang.nativeName;
            dropdown.querySelectorAll('.lang-dropdown-item').forEach((dropdownItem) => {
              const isActive = dropdownItem.getAttribute('data-lang-code') === lang.code;
              dropdownItem.classList.toggle('active', isActive);
              dropdownItem.setAttribute('aria-checked', isActive ? 'true' : 'false');
            });
            button.setAttribute('aria-expanded', 'false');
            dropdown.style.display = 'none';
            langSheet?.close();
            if (this.options.onLanguageChange) {
              this.options.onLanguageChange(lang.code);
            }
          };
          sheetWrap.appendChild(item);
        });
        langSheet = new BottomSheet({
          title: i18n.t('accessibility.selectLanguage'),
          content: sheetWrap,
          scrollable: true,
          onClose: () => {
            langSheet?.destroy();
          },
        });
        langSheet.open();
        return;
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
