import { BottomSheet } from './BottomSheet.js';
import { i18n } from '../main.js';

/**
 * Virtual Pin Pad Component
 * Random numbers 0-9, backspace, clear
 * Mobile: BottomSheet, Desktop: Dropdown below input
 */
export class VirtualPinPad {
  /** Only one pin pad may be open at a time (desktop or mobile). */
  static activeInstance = null;

  constructor(inputElement, options = {}) {
    this.inputElement =
      typeof inputElement === 'string' ? document.querySelector(inputElement) : inputElement;
    this.options = {
      maxLength: options.maxLength || 6,
      onInput: options.onInput || null,
      onComplete: options.onComplete || null,
      ...options,
    };

    this.isMobile = window.innerWidth <= 768;
    this.currentValue = '';
    this.numbers = this.generateRandomNumbers();
    this.boundCloseOnResize = this.closeOnViewportResize.bind(this);
    window.addEventListener('resize', this.boundCloseOnResize);
    this.init();
    this.pinPadLanguageChangeListener = () => this.applyPinPadI18n();
    document.addEventListener('languageChange', this.pinPadLanguageChangeListener);
  }

  /**
   * Close pin pad when viewport resizes (desktop panel position breaks; mobile sheet handles its own).
   */
  closeOnViewportResize() {
    const mobileOpen = this.isMobile && this.bottomSheet?.isOpen;
    const desktopOpen =
      !this.isMobile && this.desktopElement && this.desktopElement.style.display === 'block';
    if (mobileOpen || desktopOpen) {
      this.close();
    }
  }

  /**
   * Generate random numbers array (0-9), shuffled.
   */
  generateRandomNumbers() {
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    // Fisher-Yates shuffle
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
  }

  /**
   * Initialize pin pad
   */
  init() {
    if (this.isMobile) {
      this.initMobile();
    } else {
      this.initDesktop();
    }
  }

  /**
   * Initialize mobile (BottomSheet)
   */
  initMobile() {
    const content = this.createPinPadContent();

    this.bottomSheet = new BottomSheet({
      title: i18n.t('pinPad.secureKeyboardTitle'),
      content: content,
      scrollable: false,
      onClose: () => {
        // Reset on close
        this.currentValue = '';
        if (VirtualPinPad.activeInstance === this) {
          VirtualPinPad.activeInstance = null;
        }
      },
    });
  }

  /**
   * Initialize desktop (Dropdown)
   */
  initDesktop() {
    this.createDesktopPinPad();
    this.attachDesktopEvents();
  }

  /**
   * Create pin pad content (root element for the grid).
   */
  createPinPadContent() {
    const container = document.createElement('div');
    container.className = 'pin-pad';

    // Numbers grid
    const grid = document.createElement('div');
    grid.className = 'pin-pad-grid';

    // Row 1: 4 random numbers
    for (let i = 0; i < 4; i++) {
      const btn = this.createNumberButton(this.numbers[i]);
      grid.appendChild(btn);
    }

    // Row 2: next 4 random numbers
    for (let i = 4; i < 8; i++) {
      const btn = this.createNumberButton(this.numbers[i]);
      grid.appendChild(btn);
    }

    // Row 3: clear, remaining two numbers, backspace
    const backspaceBtn = document.createElement('button');
    backspaceBtn.type = 'button';
    backspaceBtn.className = 'pin-pad-btn pin-pad-backspace';
    backspaceBtn.innerHTML = `<span class="pin-pad-action-icon" aria-hidden="true">${this.getBackspaceIconSvg()}</span>`;
    backspaceBtn.onclick = () => this.handleBackspace();

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'pin-pad-btn pin-pad-clear';
    clearBtn.innerHTML = `<span class="pin-pad-action-icon" aria-hidden="true">${this.getClearIconSvg()}</span>`;
    clearBtn.setAttribute('aria-label', i18n.t('pinPad.clear'));
    clearBtn.onclick = () => this.handleClear();

    grid.appendChild(clearBtn);
    grid.appendChild(this.createNumberButton(this.numbers[8]));
    grid.appendChild(this.createNumberButton(this.numbers[9]));
    grid.appendChild(backspaceBtn);

    container.appendChild(grid);
    return container;
  }

  getBackspaceIconSvg() {
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M11 7H19C20.1 7 21 7.9 21 9V15C21 16.1 20.1 17 19 17H11L4 12L11 7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M14 10L17 14M17 10L14 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `;
  }

  getClearIconSvg() {
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }

  /**
   * Create number button
   * @param {number} number - Number to display
   * @returns {HTMLElement} - Button element
   */
  createNumberButton(number) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pin-pad-btn pin-pad-number';
    btn.textContent = number;
    btn.onclick = () => this.handleNumber(number);
    return btn;
  }

  /**
   * Create desktop pin pad
   */
  createDesktopPinPad() {
    const pinPad = document.createElement('div');
    pinPad.className = 'pin-pad-desktop';
    pinPad.style.display = 'none';

    const header = document.createElement('div');
    header.className = 'pin-pad-desktop-header';

    const titleEl = document.createElement('span');
    titleEl.className = 'pin-pad-desktop-title';
    titleEl.textContent = i18n.t('pinPad.secureKeyboardTitle');
    this.desktopTitleElement = titleEl;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'pin-pad-desktop-close';
    closeBtn.setAttribute('aria-label', i18n.t('common.close'));
    this.desktopCloseButton = closeBtn;
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    });

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'pin-pad-desktop-body';
    body.appendChild(this.createPinPadContent());

    pinPad.appendChild(header);
    pinPad.appendChild(body);
    this.desktopBodyElement = body;

    // Attach to input wrapper (same pattern as card dropdown).
    let wrapper = this.inputElement?.closest('.input-wrapper');
    if (!wrapper) {
      wrapper = this.inputElement?.parentNode;
    }
    if (wrapper) {
      const computedStyle = window.getComputedStyle(wrapper);
      if (computedStyle.position === 'static') {
        wrapper.style.position = 'relative';
      }
      wrapper.appendChild(pinPad);
    } else {
      document.body.appendChild(pinPad);
    }

    this.desktopElement = pinPad;
  }

  /**
   * Attach desktop events
   */
  attachDesktopEvents() {
    if (this.inputElement) {
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (
          this.desktopElement &&
          !this.desktopElement.contains(e.target) &&
          !this.inputElement.contains(e.target)
        ) {
          this.hideDesktop();
        }
      });
    }
  }

  /**
   * Show desktop pin pad
   */
  showDesktop() {
    if (this.desktopElement) {
      this.positionDesktop();
      this.desktopElement.style.display = 'block';
    }
  }

  /**
   * Hide desktop pin pad
   */
  hideDesktop() {
    if (this.desktopElement) {
      this.desktopElement.style.display = 'none';
    }
  }

  /**
   * Position desktop pin pad
   */
  positionDesktop() {
    if (!this.inputElement || !this.desktopElement) return;

    const inputContainer = this.inputElement.closest('.input-container');
    const targetElement = inputContainer || this.inputElement;
    const rect = targetElement.getBoundingClientRect();
    const wrapper = this.desktopElement.parentElement;
    if (!wrapper) return;
    const wrapperRect = wrapper.getBoundingClientRect();

    this.desktopElement.style.top = `${rect.bottom - wrapperRect.top + 8}px`;
    this.desktopElement.style.left = `${rect.left - wrapperRect.left}px`;
    this.desktopElement.style.width = `${rect.width}px`;
  }

  /**
   * Handle number input
   * @param {number} number - Number pressed
   */
  handleNumber(number) {
    if (this.currentValue.length >= this.options.maxLength) return;

    this.currentValue += number.toString();
    this.updateInput();

    if (this.options.onInput) {
      this.options.onInput(this.currentValue, this);
    }

    if (this.currentValue.length >= this.options.maxLength) {
      if (this.options.onComplete) {
        this.options.onComplete(this.currentValue, this);
      }
      this.close();
    }
  }

  /**
   * Handle backspace
   */
  handleBackspace() {
    if (this.currentValue.length > 0) {
      this.currentValue = this.currentValue.slice(0, -1);
      this.updateInput();

      if (this.options.onInput) {
        this.options.onInput(this.currentValue, this);
      }
    }
  }

  /**
   * Handle clear
   */
  handleClear() {
    this.currentValue = '';
    this.updateInput();

    if (this.options.onInput) {
      this.options.onInput(this.currentValue, this);
    }
  }

  /**
   * Update display
   */
  updateDisplay() {
    // Display bar was removed by design. Keep method for compatibility.
  }

  /**
   * Update input element
   */
  updateInput() {
    if (this.inputElement) {
      this.inputElement.value = this.currentValue;
      this.inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      this.inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  /**
   * Open pin pad
   */
  open() {
    if (VirtualPinPad.activeInstance && VirtualPinPad.activeInstance !== this) {
      VirtualPinPad.activeInstance.close();
    }
    VirtualPinPad.activeInstance = this;

    if (this.isMobile) {
      // Regenerate random numbers
      this.numbers = this.generateRandomNumbers();
      // Recreate content with new numbers
      if (this.bottomSheet) {
        const newContent = this.createPinPadContent();
        this.bottomSheet.updateContent(newContent);
      }
      this.bottomSheet.open();
    } else {
      this.numbers = this.generateRandomNumbers();
      if (this.desktopBodyElement) {
        this.desktopBodyElement.innerHTML = '';
        this.desktopBodyElement.appendChild(this.createPinPadContent());
      } else if (this.desktopElement) {
        this.desktopElement.innerHTML = '';
        this.desktopElement.appendChild(this.createPinPadContent());
      }
      this.showDesktop();
    }
  }

  /**
   * Close pin pad
   */
  close() {
    if (VirtualPinPad.activeInstance === this) {
      VirtualPinPad.activeInstance = null;
    }
    if (this.isMobile) {
      if (this.bottomSheet) {
        this.bottomSheet.close();
      }
    } else {
      this.hideDesktop();
    }
  }

  /**
   * Refresh visible strings when language changes (keeps pin pad in sync with i18n).
   */
  applyPinPadI18n() {
    if (this.desktopTitleElement) {
      this.desktopTitleElement.textContent = i18n.t('pinPad.secureKeyboardTitle');
    }
    if (this.desktopCloseButton) {
      this.desktopCloseButton.setAttribute('aria-label', i18n.t('common.close'));
    }
    if (this.desktopBodyElement) {
      this.desktopBodyElement
        .querySelector('.pin-pad-clear')
        ?.setAttribute('aria-label', i18n.t('pinPad.clear'));
    }
    if (this.bottomSheet) {
      this.bottomSheet.updateTitle(i18n.t('pinPad.secureKeyboardTitle'));
      this.bottomSheet.contentElement
        ?.querySelector('.pin-pad-clear')
        ?.setAttribute('aria-label', i18n.t('pinPad.clear'));
    }
  }

  /**
   * Get current value
   * @returns {string} - Current PIN value
   */
  getValue() {
    return this.currentValue;
  }

  /**
   * Clear value
   */
  clear() {
    this.currentValue = '';
    this.updateInput();
  }

  /**
   * Destroy component
   */
  destroy() {
    window.removeEventListener('resize', this.boundCloseOnResize);
    document.removeEventListener('languageChange', this.pinPadLanguageChangeListener);
    if (VirtualPinPad.activeInstance === this) {
      VirtualPinPad.activeInstance = null;
    }
    if (this.isMobile) {
      if (this.bottomSheet) {
        this.bottomSheet.destroy();
      }
    } else {
      if (this.desktopElement && this.desktopElement.parentNode) {
        this.desktopElement.parentNode.removeChild(this.desktopElement);
      }
    }
  }
}
