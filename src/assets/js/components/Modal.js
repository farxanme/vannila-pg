import { BottomSheet } from './BottomSheet.js';

/**
 * Modal Component — desktop uses centered dialog; mobile uses BottomSheet.
 */
export class Modal {
  constructor(options = {}) {
    this.options = {
      title: options.title || '',
      description: options.description || '',
      content: options.content || '',
      image: options.image || null,
      imageAlt: options.imageAlt || '',
      showCloseButton: options.showCloseButton !== false,
      closeButtonAriaLabel: options.closeButtonAriaLabel || 'Close',
      buttons: options.buttons || [],
      onClose: options.onClose || null,
      ...options,
    };

    this.isMobile = window.innerWidth <= 768;
    /** @type {BottomSheet | null} */
    this.modalInstance = null;
    this.modalElement = null;
    this.backdrop = null;
    this.isOpen = false;

    this._onResize = this.handleResize.bind(this);
    this._onKeyDown = this.handleKeyDown.bind(this);

    window.addEventListener('resize', this._onResize);
    this.buildLayout();
  }

  /**
   * Rebuild when crossing the mobile breakpoint (single resize listener).
   */
  handleResize() {
    const nextMobile = window.innerWidth <= 768;
    if (nextMobile === this.isMobile) return;
    this.destroyCurrentUi();
    this.isMobile = nextMobile;
    this.buildLayout();
  }

  buildLayout() {
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
      document.removeEventListener('keydown', this._onKeyDown);
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
      buttons: [...this.options.buttons],
      onClose: this.options.onClose,
    });
  }

  /**
   * @returns {HTMLElement}
   */
  createMobileContent() {
    const container = document.createElement('div');
    container.className = 'modal-content-mobile';

    if (this.options.image) {
      const img = document.createElement('img');
      img.src = this.options.image;
      img.alt = this.options.imageAlt || this.options.title || '';
      img.className = 'modal-image';
      container.appendChild(img);
    }

    if (this.options.description) {
      const desc = document.createElement('p');
      desc.className = 'modal-description';
      desc.textContent = this.options.description;
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
    document.addEventListener('keydown', this._onKeyDown);
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
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', this.options.closeButtonAriaLabel);
      closeBtn.onclick = () => this.close();
      content.appendChild(closeBtn);
    }

    if (this.options.title) {
      const title = document.createElement('h2');
      title.id = 'modal-title';
      title.className = 'modal-title';
      title.textContent = this.options.title;
      content.appendChild(title);
    }

    if (this.options.description) {
      const desc = document.createElement('p');
      desc.className = 'modal-description';
      desc.textContent = this.options.description;
      content.appendChild(desc);
    }

    if (this.options.image) {
      const img = document.createElement('img');
      img.src = this.options.image;
      img.alt = this.options.imageAlt || this.options.title || '';
      img.className = 'modal-image';
      content.appendChild(img);
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

      this.options.buttons.forEach((button) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const type = button.type || 'secondary';
        btn.className = `btn btn-${type}`;
        if (button.className) {
          btn.className += ` ${button.className}`;
        }
        btn.textContent = button.text || '';

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
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    if (e.key !== 'Escape') return;
    if (this.isMobile) return;
    if (this.isOpen) {
      this.close();
    }
  }

  open() {
    if (this.isMobile) {
      if (this.modalInstance) {
        this.modalInstance.open();
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
    if (this.isMobile) {
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
    window.removeEventListener('resize', this._onResize);
    this.destroyCurrentUi();
  }
}
