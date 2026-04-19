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
   * Settings dropdown (grouped; collapsible when multiple groups — see settingsPanel.js).
   * Container: toolbar element.
   */
  async createSettingsDropdown(container) {
    const { i18n } = await import('../utils/i18n.js');
    const { getThemePreference, setThemePreference } = await import('../utils/themeManager.js');
    const {
      getSettingsGroupDescriptors,
      buildSettingsGroupBody,
      mountSettingsGroupsLayout,
    } = await import('./settingsPanel.js');
    const { appIconHtml } = await import('../utils/icons.js');

    const wrap = document.createElement('div');
    wrap.className = 'header-settings-dropdown';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'settings-dropdown-btn';
    button.setAttribute('aria-label', i18n.t('accessibility.openSettings'));
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', `header-settings-menu-${Header.settingsMenuIdSeq++}`);

    button.innerHTML = appIconHtml('icn-config.svg', 'settings-dropdown-btn-icon');

    const menu = document.createElement('div');
    menu.className = 'settings-dropdown-menu';
    menu.style.display = 'none';
    const menuId = button.getAttribute('aria-controls');
    menu.id = menuId;

    const descriptors = getSettingsGroupDescriptors();
    const accordion = descriptors.length > 1;

    const syncThemeFromWindow = () => {
      if (typeof this.settingsMenuThemeSync === 'function') {
        this.settingsMenuThemeSync();
      }
    };

    const { bodies } = mountSettingsGroupsLayout(menu, {
      menuId,
      i18n,
      descriptors,
      accordion,
      getThemePreference,
      setThemePreference,
      buildBody: buildSettingsGroupBody,
      onThemePicked: () => {
        menu.style.display = 'none';
        button.setAttribute('aria-expanded', 'false');
      },
    });

    const menuThemeBody = bodies.find((b) => b.themeButtons && b.themeButtons.length > 0) || bodies[0];
    this.settingsMenuThemeSync = menuThemeBody.syncThemeSelection;
    window.addEventListener('themePreferenceChange', syncThemeFromWindow);

    const refreshSettingsI18n = () => {
      i18n.applyDataI18n(menu);
      button.setAttribute('aria-label', i18n.t('accessibility.openSettings'));
      const singleTitle = menu.querySelector('.settings-dropdown-section-title');
      if (singleTitle && !accordion) {
        singleTitle.textContent = i18n.t(descriptors[0].titleKey);
      }
      menu.querySelectorAll('.settings-group-header-text').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key) {
          el.textContent = i18n.t(key);
        }
      });
      const rg = menu.querySelector('[role="radiogroup"]');
      if (rg && !accordion) {
        rg.setAttribute('aria-label', i18n.t('settings.theme'));
      }
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

        const sheetTitle = accordion
          ? i18n.t('accessibility.openSettings')
          : i18n.t(descriptors[0].titleKey);

        const { bodies: sheetBodies } = mountSettingsGroupsLayout(sheetContent, {
          menuId: `${menuId}-sheet`,
          i18n,
          descriptors,
          accordion,
          getThemePreference,
          setThemePreference,
          buildBody: buildSettingsGroupBody,
          onThemePicked: () => {
            settingsSheet?.close();
          },
        });

        const sheetThemeBody =
          sheetBodies.find((b) => b.themeButtons && b.themeButtons.length > 0) || sheetBodies[0];
        const onThemePrefChangeForSheet = () => {
          sheetThemeBody.syncThemeSelection();
        };
        window.addEventListener('themePreferenceChange', onThemePrefChangeForSheet);

        settingsSheet = new BottomSheet({
          title: sheetTitle,
          content: sheetContent,
          scrollable: true,
          onClose: () => {
            window.removeEventListener('themePreferenceChange', onThemePrefChangeForSheet);
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
   * Create language dropdown. Container: toolbar element.
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
   * Update title text.
   */
  updateTitle(title) {
    const titleElement = this.element?.querySelector('.header-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  /**
   * Update card content (HTML string or element).
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
    window.addEventListener('resize', () => {
      this.closeAllHeaderMenus?.();
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
