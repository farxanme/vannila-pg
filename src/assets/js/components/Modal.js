import { BottomSheet } from './BottomSheet.js';
import { i18n } from '../utils/i18n.js';
import { appIconHtml } from '../utils/icons.js';

function buildModalLeadVisual(options) {
  if (!options.image) return null;
  const useMask = options.imageAsMaskIcon === true;
  if (useMask) {
    const span = document.createElement('span');
    span.className = ['modal-image', 'app-icon', 'app-icon-block', options.imageExtraClass || '']
      .filter(Boolean)
      .join(' ');
    span.style.setProperty('--app-icon-src', `url('${options.image}')`);
    span.setAttribute('role', 'img');
    if (options.imageAlt) span.setAttribute('aria-label', options.imageAlt);
    else span.setAttribute('aria-hidden', 'true');
    if (options.imageAltKey) span.setAttribute('data-i18n-aria-label', options.imageAltKey);
    return span;
  }
  const img = document.createElement('img');
  img.src = options.image;
  img.alt = options.imageAlt || options.title || '';
  img.className = ['modal-image', options.imageExtraClass || ''].filter(Boolean).join(' ');
  if (options.imageAltKey) {
    img.setAttribute('data-i18n-alt', options.imageAltKey);
  }
  return img;
}

// Apply i18n keys onto modal options (mutates options).
function resolveModalOptionStrings(options) {
  if (options.titleKey) options.title = i18n.t(options.titleKey);
  if (options.descriptionKey) options.description = i18n.t(options.descriptionKey);
  if (options.imageAltKey) options.imageAlt = i18n.t(options.imageAltKey);
  if (options.closeButtonAriaLabelKey) {
    options.closeButtonAriaLabel = i18n.t(options.closeButtonAriaLabelKey);
  }
}

/**
 * Modal Component — desktop uses centered dialog; mobile uses BottomSheet.
 */
export class Modal {
  constructor(options = {}) {
    this.options = {
      titleKey: options.titleKey || '',
      descriptionKey: options.descriptionKey || '',
      imageAltKey: options.imageAltKey || '',
      closeButtonAriaLabelKey: options.closeButtonAriaLabelKey || '',
      title: options.title || '',
      description: options.description || '',
      content: options.content || '',
      image: options.image || null,
      imageExtraClass: options.imageExtraClass || '',
      imageAsMaskIcon: options.imageAsMaskIcon,
      imageAlt: options.imageAlt || '',
      showCloseButton: options.showCloseButton !== false,
      closeButtonAriaLabel: options.closeButtonAriaLabel || 'Close',
      buttons: options.buttons || [],
      // Full-width stacked buttons (e.g. cancel confirmation).
      buttonsStacked: options.buttonsStacked === true,
      onClose: options.onClose || null,
      ...options,
    };

    resolveModalOptionStrings(this.options);

    this.modalImageRef = null;
    this.modalCloseButton = null;
    this.boundResizeListener = this.handleResize.bind(this);
    this.boundKeyDownListener = this.handleKeyDown.bind(this);
    this.boundLanguageChangeListener = () => {
      if (this.isOpen) this.syncModalI18n();
    };

    this.isMobile = window.innerWidth <= 768;
    this.modalInstance = null;
    this.modalElement = null;
    this.backdrop = null;
    this.isOpen = false;

    window.addEventListener('resize', this.boundResizeListener);
    this.buildLayout();
  }

  /**
   * Rebuild when crossing the mobile breakpoint (single resize listener).
   */
  handleResize() {
    if (this.isOpen) {
      this.close();
    }

    const nextMobile = window.innerWidth <= 768;
    if (nextMobile === this.isMobile) return;
    this.destroyCurrentUi();
    this.isMobile = nextMobile;
    this.buildLayout();
  }

  buildLayout() {
    resolveModalOptionStrings(this.options);
    if (this.isMobile) {
      this.initBottomSheet();
    } else {
      this.initModal();
    }
  }

  /**
   * Remove the active surface (modal DOM or bottom sheet) without removing the resize listener.
   */
  destroyCurrentUi() {
    if (this.isMobile && this.modalInstance) {
      this.modalInstance.destroy();
      this.modalInstance = null;
      return;
    }
    if (!this.isMobile) {
      document.removeEventListener('keydown', this.boundKeyDownListener);
      if (this.backdrop?.parentNode) {
        this.backdrop.parentNode.removeChild(this.backdrop);
      }
      if (this.modalElement?.parentNode) {
        this.modalElement.parentNode.removeChild(this.modalElement);
      }
      this.backdrop = null;
      this.modalElement = null;
      this.isOpen = false;
    }
  }

  /**
   * Initialize as BottomSheet (mobile)
   */
  initBottomSheet() {
    this.modalInstance = new BottomSheet({
      title: this.options.title,
      content: this.createMobileContent(),
      buttons: this.normalizeButtonsForSheet(),
      buttonsStacked: this.options.buttonsStacked,
      onClose: this.options.onClose,
    });
  }

  /**
   * Clone button configs for BottomSheet (same shape as desktop).
   */
  normalizeButtonsForSheet() {
    return this.options.buttons.map((b) => ({ ...b }));
  }

  createMobileContent() {
    const container = document.createElement('div');
    container.className = 'modal-content-mobile';

    if (this.options.image) {
      const lead = buildModalLeadVisual(this.options);
      if (lead) container.appendChild(lead);
    }

    if (this.options.description) {
      const desc = document.createElement('p');
      desc.className = 'modal-description';
      desc.textContent = this.options.description;
      if (this.options.descriptionKey) {
        desc.setAttribute('data-i18n', this.options.descriptionKey);
      }
      container.appendChild(desc);
    }

    if (typeof this.options.content === 'string' && this.options.content) {
      const el = document.createElement('div');
      el.innerHTML = this.options.content;
      container.appendChild(el);
    } else if (this.options.content instanceof HTMLElement) {
      container.appendChild(this.options.content);
    }

    return container;
  }

  /**
   * Initialize as Modal (desktop)
   */
  initModal() {
    this.createModalHTML();
    document.addEventListener('keydown', this.boundKeyDownListener);
  }

  createModalHTML() {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.addEventListener('click', () => this.close());
    this.backdrop = backdrop;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    const content = document.createElement('div');
    content.className = 'modal-content';

    if (this.options.showCloseButton) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'modal-close';
      closeBtn.innerHTML = appIconHtml('icn-x.svg', 'modal-close-icon');
      closeBtn.setAttribute('aria-label', this.options.closeButtonAriaLabel);
      closeBtn.onclick = () => this.close();
      this.modalCloseButton = closeBtn;
      content.appendChild(closeBtn);
    }

    if (this.options.title) {
      const title = document.createElement('h2');
      title.id = 'modal-title';
      title.className = 'modal-title';
      title.textContent = this.options.title;
      if (this.options.titleKey) {
        title.setAttribute('data-i18n', this.options.titleKey);
      }
      content.appendChild(title);
    }

    if (this.options.image) {
      const lead = buildModalLeadVisual(this.options);
      this.modalImageRef = lead;
      if (lead) content.appendChild(lead);
    }

    if (this.options.description) {
      const desc = document.createElement('p');
      desc.className = 'modal-description';
      desc.textContent = this.options.description;
      if (this.options.descriptionKey) {
        desc.setAttribute('data-i18n', this.options.descriptionKey);
      }
      content.appendChild(desc);
    }

    const body = document.createElement('div');
    body.className = 'modal-body';

    if (typeof this.options.content === 'string' && this.options.content) {
      body.innerHTML = this.options.content;
    } else if (this.options.content instanceof HTMLElement) {
      body.appendChild(this.options.content);
    }

    content.appendChild(body);

    if (this.options.buttons && this.options.buttons.length > 0) {
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'modal-buttons';
      if (this.options.buttonsStacked) {
        buttonsContainer.classList.add('modal-buttons--stacked');
      }

      this.options.buttons.forEach((button) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const type = button.type || 'secondary';
        btn.className = `btn btn-${type}`;
        if (button.className) {
          btn.className += ` ${button.className}`;
        }
        const btnLabel = button.textKey ? i18n.t(button.textKey) : button.text || '';
        btn.textContent = btnLabel;
        if (button.textKey) {
          btn.setAttribute('data-i18n', button.textKey);
        }

        if (button.icon) {
          const icon = document.createElement('span');
          icon.className = 'btn-icon';
          icon.innerHTML = button.icon;
          btn.insertBefore(icon, btn.firstChild);
        }

        btn.onclick = () => {
          if (button.onClick) {
            button.onClick(this);
          }
          if (button.closeOnClick !== false) {
            this.close();
          }
        };

        buttonsContainer.appendChild(btn);
      });

      content.appendChild(buttonsContainer);
    }

    modal.appendChild(content);
    this.modalElement = modal;

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
  }

  /**
   * Update visible strings when language changes while dialog is open.
   */
  syncModalI18n() {
    if (this.isMobile && this.modalInstance) {
      if (this.options.titleKey) {
        this.modalInstance.updateTitle(i18n.t(this.options.titleKey));
      }
      const sheet = this.modalInstance.sheetElement;
      if (sheet) {
        i18n.applyDataI18n(sheet);
      }
      const lead = this.modalInstance.contentElement?.querySelector('.modal-image');
      if (lead && this.options.imageAltKey) {
        const t = i18n.t(this.options.imageAltKey);
        if (lead.tagName === 'IMG') lead.alt = t;
        else lead.setAttribute('aria-label', t);
      }
      return;
    }
    if (this.modalElement) {
      i18n.applyDataI18n(this.modalElement);
    }
    if (this.modalImageRef && this.options.imageAltKey) {
      const t = i18n.t(this.options.imageAltKey);
      if (this.modalImageRef.tagName === 'IMG') this.modalImageRef.alt = t;
      else this.modalImageRef.setAttribute('aria-label', t);
    }
    if (this.modalCloseButton && this.options.closeButtonAriaLabelKey) {
      this.modalCloseButton.setAttribute(
        'aria-label',
        i18n.t(this.options.closeButtonAriaLabelKey)
      );
    }
  }

  handleKeyDown(e) {
    if (e.key !== 'Escape') return;
    if (this.isMobile) return;
    if (this.isOpen) {
      this.close();
    }
  }

  open() {
    document.removeEventListener('languageChange', this.boundLanguageChangeListener);
    document.addEventListener('languageChange', this.boundLanguageChangeListener);
    if (this.isMobile) {
      if (this.modalInstance) {
        this.modalInstance.open();
        this.isOpen = true;
      }
      return;
    }
    if (!this.modalElement || !this.backdrop) return;

    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    this.backdrop.classList.add('show');
    this.modalElement.classList.add('show');

    const firstFocusable = this.modalElement.querySelector(
      'button, input, textarea, select, a[href]'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  close() {
    document.removeEventListener('languageChange', this.boundLanguageChangeListener);
    if (this.isMobile) {
      this.isOpen = false;
      if (this.modalInstance) {
        this.modalInstance.close();
      }
      return;
    }
    if (!this.modalElement || !this.backdrop) return;

    this.isOpen = false;
    this.backdrop.classList.remove('show');
    this.modalElement.classList.remove('show');
    document.body.style.overflow = '';

    setTimeout(() => {
      if (this.options.onClose) {
        this.options.onClose();
      }
    }, 300);
  }

  /**
   * Remove listeners and DOM (full teardown).
   */
  destroy() {
    document.removeEventListener('languageChange', this.boundLanguageChangeListener);
    window.removeEventListener('resize', this.boundResizeListener);
    this.destroyCurrentUi();
  }
}
