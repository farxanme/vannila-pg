/**
 * Shared Footer Component
 */
export class Footer {
  constructor(options = {}) {
    this.options = {
      logo: options.logo || null,
      copyright: options.copyright || '',
      supportPrefix: options.supportPrefix || '',
      supportPhone: options.supportPhone || '',
      ...options,
    };

    this.init();
  }

  /**
   * Initialize footer
   */
  init() {
    this.createHTML();
  }

  /**
   * Create HTML structure
   */
  createHTML() {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.setAttribute('role', 'contentinfo');

    const container = document.createElement('div');
    container.className = 'container footer-container';

    // Logo
    if (this.options.logo) {
      const logo = document.createElement('div');
      logo.className = 'footer-logo';
      if (typeof this.options.logo === 'string') {
        const img = document.createElement('img');
        img.src = this.options.logo;
        img.alt = 'Logo';
        logo.appendChild(img);
      } else if (this.options.logo instanceof HTMLElement) {
        logo.appendChild(this.options.logo);
      }
      container.appendChild(logo);
    }

    // Support line
    if (this.options.supportPrefix || this.options.supportPhone) {
      const support = document.createElement('div');
      support.className = 'footer-support';
      const prefixSpan = document.createElement('span');
      prefixSpan.className = 'footer-support-prefix';
      prefixSpan.textContent = this.options.supportPrefix;
      support.appendChild(prefixSpan);
      if (this.options.supportPhone) {
        support.append(' ');
        const phoneLink = document.createElement('a');
        phoneLink.className = 'footer-support-link';
        phoneLink.href = `tel:${this.options.supportPhone}`;
        phoneLink.textContent = this.options.supportPhone;
        support.appendChild(phoneLink);
      }
      container.appendChild(support);
    }

    // Copyright
    if (this.options.copyright) {
      const copyright = document.createElement('div');
      copyright.className = 'footer-copyright';
      copyright.textContent = this.options.copyright;
      container.appendChild(copyright);
    }

    footer.appendChild(container);
    this.element = footer;
    document.body.appendChild(footer);
  }

  /**
   * Update copyright text
   * @param {string} text - New copyright text
   */
  updateCopyright(text) {
    const copyrightElement = this.element?.querySelector('.footer-copyright');
    if (copyrightElement) {
      copyrightElement.textContent = text;
    }
  }

  /**
   * Update support prefix text
   * @param {string} text - New support prefix
   */
  updateSupportPrefix(text) {
    const prefixElement = this.element?.querySelector('.footer-support-prefix');
    if (prefixElement) {
      prefixElement.textContent = text;
    }
  }

  /**
   * Update support phone
   * @param {string} phone - New support phone
   */
  updateSupportPhone(phone) {
    const phoneLink = this.element?.querySelector('.footer-support-link');
    if (phoneLink) {
      phoneLink.textContent = phone;
      phoneLink.setAttribute('href', `tel:${phone}`);
    }
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
