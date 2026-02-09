/**
 * Shared Header Component
 * Fixed at top, logo, title, language dropdown, card
 */
export class Header {
  constructor(options = {}) {
    this.options = {
      logo: options.logo || null,
      // لوگوی دوم برای سمت دیگر هدر (به جای کارت)
      secondaryLogo: options.secondaryLogo || null,
      title: options.title || '',
      showCard: options.showCard !== false,
      cardContent: options.cardContent || null,
      onLanguageChange: options.onLanguageChange || null,
      ...options
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

    // Language dropdown (outside container, floating)
    const langDropdown = document.createElement('div');
    langDropdown.className = 'header-lang-dropdown';
    await this.createLanguageDropdown(langDropdown);
    header.appendChild(langDropdown);

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
      secondary.className = 'header-secondary-logo';
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
   * Create language dropdown
   * @param {HTMLElement} container - Container element
   */
  async createLanguageDropdown(container) {
    const { i18n } = await import('../utils/i18n.js');
    
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lang-dropdown-btn';
    button.setAttribute('aria-label', 'Select language');
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    
    const currentLang = i18n.getLanguage();
    const languages = i18n.getAvailableLanguages();
    const currentLangObj = languages.find(l => l.code === currentLang);
    button.textContent = currentLangObj?.nativeName || currentLang.toUpperCase();
    
    const dropdown = document.createElement('div');
    dropdown.className = 'lang-dropdown-menu';
    dropdown.style.display = 'none';
    
    languages.forEach(lang => {
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
      const isOpen = dropdown.style.display === 'block';
      dropdown.style.display = isOpen ? 'none' : 'block';
      button.setAttribute('aria-expanded', !isOpen);
    };
    
    container.appendChild(button);
    container.appendChild(dropdown);
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        dropdown.style.display = 'none';
        button.setAttribute('aria-expanded', 'false');
      }
    });
    
    this.langDropdown = container;
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
