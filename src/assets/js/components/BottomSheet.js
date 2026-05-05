import { i18n } from '../utils/i18n.js';
import { appIconHtml } from '../utils/icons.js';

/**
 * Bottom Sheet Component (Mobile only with swipe down to close)
 */
export class BottomSheet {
  constructor(options = {}) {
    this.options = {
      title: options.title || '',
      subtitle: options.subtitle || '',
      content: options.content || '',
      buttons: options.buttons || [],
      scrollable: options.scrollable !== false,
      buttonsStacked: options.buttonsStacked === true,
      onClose: options.onClose || null,
      ...options,
    };

    this.isOpen = false;
    this.startY = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundCloseOnResize = this.closeOnResize.bind(this);
    window.addEventListener('resize', this.boundCloseOnResize);
    this.init();
  }

  /**
   * Close when viewport is resized (avoid stale layout / wrong surface).
   */
  closeOnResize() {
    if (this.isOpen) {
      this.close();
    }
  }

  /**
   * Initialize bottom sheet
   */
  init() {
    this.createHTML();
    this.attachEvents();
  }

  /**
   * Create HTML structure
   */
  createHTML() {
    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'bottom-sheet-backdrop';
    backdrop.addEventListener('click', () => this.close());
    this.backdrop = backdrop;

    // Bottom sheet container
    const sheet = document.createElement('div');
    sheet.className = 'bottom-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');

    // Handle bar (for swipe indication)
    const handleBar = document.createElement('div');
    handleBar.className = 'bottom-sheet-handle';
    sheet.appendChild(handleBar);

    // Header row: title (optional) + close (same control style as drawer / modal)
    const header = document.createElement('div');
    header.className = 'bottom-sheet-header';

    const titleEl = document.createElement('div');
    titleEl.className = 'bottom-sheet-title';
    if (this.options.title) {
      titleEl.id = 'bottom-sheet-title';
      titleEl.textContent = this.options.title;
      sheet.setAttribute('aria-labelledby', 'bottom-sheet-title');
    } else {
      titleEl.setAttribute('aria-hidden', 'true');
    }
    this.titleElement = titleEl;

    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'bottom-sheet-subtitle';
    if (this.options.subtitle) {
      subtitleEl.id = 'bottom-sheet-subtitle';
      subtitleEl.textContent = this.options.subtitle;
      sheet.setAttribute('aria-describedby', 'bottom-sheet-subtitle');
    } else {
      subtitleEl.setAttribute('aria-hidden', 'true');
    }
    this.subtitleElement = subtitleEl;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'bottom-sheet-close';
    closeBtn.innerHTML = appIconHtml('icn-x.svg', 'bottom-sheet-close-icon');
    closeBtn.setAttribute('aria-label', i18n.t('common.close'));
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    header.appendChild(titleEl);
    header.appendChild(subtitleEl);
    header.appendChild(closeBtn);
    sheet.appendChild(header);

    // Content
    const content = document.createElement('div');
    content.className = `bottom-sheet-content ${this.options.scrollable ? 'scrollable' : ''}`;

    if (typeof this.options.content === 'string') {
      content.innerHTML = this.options.content;
    } else if (this.options.content instanceof HTMLElement) {
      content.appendChild(this.options.content);
    }

    sheet.appendChild(content);
    this.contentElement = content;

    // Buttons container
    if (this.options.buttons && this.options.buttons.length > 0) {
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'bottom-sheet-buttons';
      if (this.options.buttonsStacked) {
        buttonsContainer.classList.add('bottom-sheet-buttons-stacked');
      }

      this.options.buttons.forEach((button, _index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const type = button.type || 'secondary';
        btn.className = `btn btn-${type}`;
        if (button.className) {
          btn.className += ` ${button.className}`;
        }
        const label = button.textKey ? i18n.t(button.textKey) : button.text || '';
        btn.textContent = label;
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

      sheet.appendChild(buttonsContainer);
    }

    this.sheetElement = sheet;
    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);
  }

  /**
   * Attach events
   */
  attachEvents() {
    // Touch events for swipe
    this.sheetElement.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: true,
    });
    this.sheetElement.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: false,
    });
    this.sheetElement.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: true,
    });

    // Keyboard events (same function reference for removeEventListener in destroy)
    document.addEventListener('keydown', this.boundHandleKeyDown);
  }

  /**
   * Handle touch start
   * @param {TouchEvent} e - Touch event
   */
  handleTouchStart(e) {
    this.startY = e.touches[0].clientY;
    this.isDragging = true;
  }

  /**
   * Handle touch move
   * @param {TouchEvent} e - Touch event
   */
  handleTouchMove(e) {
    if (!this.isDragging) return;

    this.currentY = e.touches[0].clientY;
    const deltaY = this.currentY - this.startY;

    // Only allow downward swipe
    if (deltaY > 0) {
      e.preventDefault();
      this.sheetElement.style.transform = `translateY(${deltaY}px)`;
      this.backdrop.style.opacity = `${1 - deltaY / 300}`;
    }
  }

  /**
   * Handle touch end
   * @param {TouchEvent} e - Touch event
   */
  handleTouchEnd(_e) {
    if (!this.isDragging) return;

    this.isDragging = false;
    const deltaY = this.currentY - this.startY;

    // Close if swiped down more than 100px
    if (deltaY > 100) {
      this.close();
    } else {
      // Snap back
      this.sheetElement.style.transform = '';
      this.backdrop.style.opacity = '';
    }
  }

  /**
   * Handle key down (ESC to close)
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyDown(e) {
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  /**
   * Open bottom sheet
   */
  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    this.backdrop.classList.add('show');
    this.sheetElement.classList.add('show');

    // Focus trap
    const firstFocusable = this.sheetElement.querySelector(
      'button, input, textarea, select, a[href]'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  /**
   * Close bottom sheet
   */
  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.backdrop.classList.remove('show');
    this.sheetElement.classList.remove('show');
    this.backdrop.style.opacity = '';
    this.sheetElement.style.transform = '';
    document.body.style.overflow = '';

    setTimeout(() => {
      if (this.options.onClose) {
        this.options.onClose();
      }
    }, 300);
  }

  /**
   * Update title (e.g. after language change).
   * @param {string} title - New title text
   */
  updateTitle(title) {
    this.options.title = title;
    if (this.titleElement) {
      this.titleElement.textContent = title;
      const hasTitle = Boolean(String(title || '').trim());
      if (hasTitle) {
        this.titleElement.id = 'bottom-sheet-title';
        this.titleElement.removeAttribute('aria-hidden');
        this.sheetElement?.setAttribute('aria-labelledby', 'bottom-sheet-title');
      } else {
        this.titleElement.removeAttribute('id');
        this.titleElement.setAttribute('aria-hidden', 'true');
        this.sheetElement?.removeAttribute('aria-labelledby');
      }
    }
  }

  /**
   * Update subtitle text (optional).
   * @param {string} subtitle - New subtitle text
   */
  updateSubtitle(subtitle) {
    this.options.subtitle = subtitle;
    if (this.subtitleElement) {
      this.subtitleElement.textContent = subtitle;
      const hasSubtitle = Boolean(String(subtitle || '').trim());
      if (hasSubtitle) {
        this.subtitleElement.id = 'bottom-sheet-subtitle';
        this.subtitleElement.removeAttribute('aria-hidden');
        this.sheetElement?.setAttribute('aria-describedby', 'bottom-sheet-subtitle');
      } else {
        this.subtitleElement.removeAttribute('id');
        this.subtitleElement.setAttribute('aria-hidden', 'true');
        this.sheetElement?.removeAttribute('aria-describedby');
      }
    }
  }

  /**
   * Update content
   * @param {string|HTMLElement} content - New content
   */
  updateContent(content) {
    if (typeof content === 'string') {
      this.contentElement.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.contentElement.innerHTML = '';
      this.contentElement.appendChild(content);
    }
  }

  /**
   * Destroy component
   */
  destroy() {
    window.removeEventListener('resize', this.boundCloseOnResize);
    document.removeEventListener('keydown', this.boundHandleKeyDown);
    if (this.isOpen) {
      this.isOpen = false;
      document.body.style.overflow = '';
    }
    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }
    if (this.sheetElement && this.sheetElement.parentNode) {
      this.sheetElement.parentNode.removeChild(this.sheetElement);
    }
  }
}
