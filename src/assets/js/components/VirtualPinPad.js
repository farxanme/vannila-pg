import { BottomSheet } from './BottomSheet.js';

/**
 * Virtual Pin Pad Component
 * Random numbers 0-9, backspace, clear
 * Mobile: BottomSheet, Desktop: Dropdown below input
 */
export class VirtualPinPad {
  constructor(inputElement, options = {}) {
    this.inputElement = typeof inputElement === 'string' ? document.querySelector(inputElement) : inputElement;
    this.options = {
      maxLength: options.maxLength || 6,
      onInput: options.onInput || null,
      onComplete: options.onComplete || null,
      ...options
    };
    
    this.isMobile = window.innerWidth <= 768;
    this.currentValue = '';
    this.numbers = this.generateRandomNumbers();
    this.init();
  }

  /**
   * Generate random numbers array (0-9)
   * @returns {Array} - Shuffled numbers array
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
      title: 'Enter PIN',
      content: content,
      scrollable: false,
      onClose: () => {
        // Reset on close
        this.currentValue = '';
      }
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
   * Create pin pad content
   * @returns {HTMLElement} - Pin pad element
   */
  createPinPadContent() {
    const container = document.createElement('div');
    container.className = 'pin-pad';

    // Display area
    const display = document.createElement('div');
    display.className = 'pin-pad-display';
    display.textContent = '•'.repeat(this.currentValue.length).padEnd(this.options.maxLength, '○');
    this.displayElement = display;
    container.appendChild(display);

    // Numbers grid
    const grid = document.createElement('div');
    grid.className = 'pin-pad-grid';

    // First row: 1, 2, 3
    for (let i = 0; i < 3; i++) {
      const btn = this.createNumberButton(this.numbers[i + 1]);
      grid.appendChild(btn);
    }

    // Second row: 4, 5, 6
    for (let i = 0; i < 3; i++) {
      const btn = this.createNumberButton(this.numbers[i + 4]);
      grid.appendChild(btn);
    }

    // Third row: 7, 8, 9
    for (let i = 0; i < 3; i++) {
      const btn = this.createNumberButton(this.numbers[i + 7]);
      grid.appendChild(btn);
    }

    // Fourth row: 0, backspace, clear
    const zeroBtn = this.createNumberButton(0);
    grid.appendChild(zeroBtn);

    const backspaceBtn = document.createElement('button');
    backspaceBtn.type = 'button';
    backspaceBtn.className = 'pin-pad-btn pin-pad-backspace';
    backspaceBtn.innerHTML = '⌫';
    backspaceBtn.onclick = () => this.handleBackspace();
    grid.appendChild(backspaceBtn);

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'pin-pad-btn pin-pad-clear';
    clearBtn.textContent = 'Clear';
    clearBtn.onclick = () => this.handleClear();
    grid.appendChild(clearBtn);

    container.appendChild(grid);
    return container;
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
    
    const content = this.createPinPadContent();
    pinPad.appendChild(content);
    
    // Position relative to input
    if (this.inputElement && this.inputElement.parentNode) {
      this.inputElement.parentNode.insertBefore(pinPad, this.inputElement.nextSibling);
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
      this.inputElement.addEventListener('focus', () => {
        this.showDesktop();
      });
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!this.desktopElement.contains(e.target) && 
            !this.inputElement.contains(e.target)) {
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
    
    const rect = this.inputElement.getBoundingClientRect();
    this.desktopElement.style.top = `${rect.bottom + 10}px`;
    this.desktopElement.style.left = `${rect.left}px`;
  }

  /**
   * Handle number input
   * @param {number} number - Number pressed
   */
  handleNumber(number) {
    if (this.currentValue.length >= this.options.maxLength) return;
    
    this.currentValue += number.toString();
    this.updateDisplay();
    this.updateInput();
    
    if (this.options.onInput) {
      this.options.onInput(this.currentValue, this);
    }
    
    if (this.currentValue.length >= this.options.maxLength && this.options.onComplete) {
      this.options.onComplete(this.currentValue, this);
    }
  }

  /**
   * Handle backspace
   */
  handleBackspace() {
    if (this.currentValue.length > 0) {
      this.currentValue = this.currentValue.slice(0, -1);
      this.updateDisplay();
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
    this.updateDisplay();
    this.updateInput();
    
    if (this.options.onInput) {
      this.options.onInput(this.currentValue, this);
    }
  }

  /**
   * Update display
   */
  updateDisplay() {
    if (this.displayElement) {
      const filled = '•'.repeat(this.currentValue.length);
      const empty = '○'.repeat(Math.max(0, this.options.maxLength - this.currentValue.length));
      this.displayElement.textContent = filled + empty;
    }
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
      this.showDesktop();
    }
  }

  /**
   * Close pin pad
   */
  close() {
    if (this.isMobile) {
      if (this.bottomSheet) {
        this.bottomSheet.close();
      }
    } else {
      this.hideDesktop();
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
    this.updateDisplay();
    this.updateInput();
  }

  /**
   * Destroy component
   */
  destroy() {
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
