/**
 * Shared Footer Component
 */
export class Footer {
  constructor(options = {}) {
    this.options = {
      logo: options.logo || null,
      copyright: options.copyright || '© 2024 All rights reserved',
      ...options
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
   * Destroy component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
