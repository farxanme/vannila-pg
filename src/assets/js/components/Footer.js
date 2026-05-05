/**
 * Shared Footer Component
 */
import { i18n } from '../utils/i18n.js';

const sepSiteUrl = 'https://sep.ir';

function normalizePhoneHref(phone) {
  const raw = String(phone || '').trim();
  if (!raw) return '';
  const latin = raw
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[^\d+]/g, '');
  return latin || raw;
}

export class Footer {
  constructor(options = {}) {
    this.options = {
      logo: options.logo || null,
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
        const logoPath = this.options.logo.trim();
        if (logoPath.toLowerCase().endsWith('.svg')) {
          const icon = document.createElement('span');
          icon.className = 'footer-logo-icon app-icon app-icon-block';
          icon.style.setProperty('--app-icon-src', `url('${logoPath}')`);
          icon.setAttribute('role', 'img');
          icon.setAttribute('aria-label', 'Logo');
          logo.appendChild(icon);
        } else {
          const img = document.createElement('img');
          img.src = logoPath;
          img.alt = 'Logo';
          logo.appendChild(img);
        }
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
        phoneLink.href = `tel:${normalizePhoneHref(this.options.supportPhone)}`;
        phoneLink.textContent = this.options.supportPhone;
        phoneLink.dir = 'ltr';
        support.appendChild(phoneLink);
      }
      container.appendChild(support);
    }

    // Copyright (second line includes brand link to sep.ir, new tab)
    const copyright = document.createElement('div');
    copyright.className = 'footer-copyright';
    this.fillCopyrightFromI18n(copyright);
    container.appendChild(copyright);

    footer.appendChild(container);
    this.element = footer;
    document.body.appendChild(footer);
  }

  /**
   * Renders copyright lines from i18n (brand name links to sep.ir in a new tab).
   * @param {HTMLElement} container
   */
  fillCopyrightFromI18n(container) {
    if (!container) return;
    container.replaceChildren();

    const line1 = document.createElement('div');
    line1.className = 'footer-copyright-line footer-copyright-line-first';
    line1.textContent = i18n.t('footer.copyrightLineFirst');

    const line2 = document.createElement('div');
    line2.className = 'footer-copyright-line footer-copyright-line-second';
    line2.append(document.createTextNode(i18n.t('footer.copyrightLineSecondBefore')));

    const brandLink = document.createElement('a');
    brandLink.className = 'footer-copyright-brand-link';
    brandLink.href = sepSiteUrl;
    brandLink.target = '_blank';
    brandLink.rel = 'noopener noreferrer';
    brandLink.textContent = i18n.t('footer.copyrightBrandLink');
    brandLink.setAttribute('aria-label', i18n.t('footer.copyrightBrandLinkAriaLabel'));
    line2.appendChild(brandLink);
    line2.append(document.createTextNode(i18n.t('footer.copyrightLineSecondAfter')));

    container.append(line1, line2);
  }

  /**
   * Refresh copyright block after language change.
   */
  updateCopyright() {
    const copyrightElement = this.element?.querySelector('.footer-copyright');
    if (copyrightElement) {
      this.fillCopyrightFromI18n(copyrightElement);
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
      phoneLink.setAttribute('href', `tel:${normalizePhoneHref(phone)}`);
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
