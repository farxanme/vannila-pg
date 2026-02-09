/**
 * Input Component
 * Supports: label, hint, validation errors, action buttons, clear button
 */
export class Input {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      id: options.id || `input-${Date.now()}`,
      name: options.name || '',
      type: options.type || 'text',
      label: options.label || '',
      placeholder: options.placeholder || '',
      hint: options.hint || '',
      value: options.value || '',
      disabled: options.disabled || false,
      required: options.required || false,
      validator: options.validator || null,
      leftAction: options.leftAction || null,
      rightAction: options.rightAction || null,
      showClear: options.showClear !== false,
      onInput: options.onInput || null,
      onChange: options.onChange || null,
      onFocus: options.onFocus || null,
      onBlur: options.onBlur || null,
      onValidation: options.onValidation || null,
      liveValidation: options.liveValidation !== false,
      inputMode: options.inputMode || null,
      pattern: options.pattern || null,
      maxLength: options.maxLength || null,
      ...options
    };
    
    this.isValid = true;
    this.errorMessage = '';
    this.element = null;
    this.init();
  }

  /**
   * Initialize input
   */
  init() {
    this.createHTML();
    this.attachEvents();
    if (this.options.value) {
      this.setValue(this.options.value);
    }
  }

  /**
   * Create HTML structure
   */
  createHTML() {
    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';
    wrapper.dataset.inputId = this.options.id;

    // Label
    if (this.options.label) {
      const label = document.createElement('label');
      label.className = 'input-label';
      label.setAttribute('for', this.options.id);
      label.textContent = this.options.label;
      if (this.options.required) {
        const required = document.createElement('span');
        required.className = 'input-required';
        required.textContent = ' *';
        label.appendChild(required);
      }
      wrapper.appendChild(label);
    }

    // Input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    // Left action button
    if (this.options.leftAction) {
      const leftBtn = document.createElement('button');
      leftBtn.type = 'button';
      leftBtn.className = 'input-action input-action-left';
      leftBtn.innerHTML = this.options.leftAction.icon || '';
      leftBtn.setAttribute('aria-label', this.options.leftAction.label || '');
      if (this.options.disabled) {
        leftBtn.disabled = true;
      }
      leftBtn.onclick = (e) => {
        e.stopPropagation();
        if (!this.options.disabled && this.options.leftAction.onClick) {
          this.options.leftAction.onClick(this);
        }
      };
      inputContainer.appendChild(leftBtn);
    }

    // Input element
    const input = document.createElement('input');
    input.type = this.options.type === 'password' ? 'password' : this.options.type;
    input.id = this.options.id;
    input.name = this.options.name || this.options.id;
    input.className = 'input-field';
    input.placeholder = this.options.placeholder;
    input.value = this.options.value;
    input.disabled = this.options.disabled;
    input.required = this.options.required;
    
    if (this.options.inputMode) {
      input.inputMode = this.options.inputMode;
    }
    
    if (this.options.pattern) {
      input.pattern = this.options.pattern;
    }
    
    if (this.options.maxLength) {
      input.maxLength = this.options.maxLength;
    }

    // For password type inputs that should look like numbers
    if (this.options.type === 'password' && this.options.inputMode === 'numeric') {
      input.style.fontFamily = 'monospace';
      input.style.letterSpacing = '2px';
    }

    inputContainer.appendChild(input);
    this.element = input;

    // Right side container (for clear button and right action)
    const rightContainer = document.createElement('div');
    rightContainer.className = 'input-right-container';

    // Clear button
    if (this.options.showClear) {
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'input-clear';
      clearBtn.innerHTML = '×';
      clearBtn.setAttribute('aria-label', 'Clear');
      clearBtn.style.display = 'none';
      clearBtn.onclick = (e) => {
        e.stopPropagation();
        this.clear();
      };
      rightContainer.appendChild(clearBtn);
      this.clearButton = clearBtn;
    }

    // Right action button
    if (this.options.rightAction) {
      const rightBtn = document.createElement('button');
      rightBtn.type = 'button';
      rightBtn.className = 'input-action input-action-right';
      rightBtn.innerHTML = this.options.rightAction.icon || '';
      rightBtn.setAttribute('aria-label', this.options.rightAction.label || '');
      if (this.options.disabled) {
        rightBtn.disabled = true;
      }
      rightBtn.onclick = (e) => {
        e.stopPropagation();
        if (!this.options.disabled && this.options.rightAction.onClick) {
          this.options.rightAction.onClick(this);
        }
      };
      rightContainer.appendChild(rightBtn);
    }

    inputContainer.appendChild(rightContainer);
    wrapper.appendChild(inputContainer);

    // Hint
    if (this.options.hint) {
      const hint = document.createElement('div');
      hint.className = 'input-hint';
      hint.textContent = this.options.hint;
      wrapper.appendChild(hint);
    }

    // Error message
    const error = document.createElement('div');
    error.className = 'input-error';
    error.setAttribute('role', 'alert');
    wrapper.appendChild(error);
    this.errorElement = error;

    this.container.appendChild(wrapper);
    this.wrapper = wrapper;
  }

  /**
   * Attach events
   */
  attachEvents() {
    // Input event
    this.element.addEventListener('input', (e) => {
      this.updateClearButton();
      if (this.options.onInput) {
        this.options.onInput(e.target.value, this);
      }
      if (this.options.liveValidation) {
        this.validate();
      }
    });

    // Change event
    this.element.addEventListener('change', (e) => {
      if (this.options.onChange) {
        this.options.onChange(e.target.value, this);
      }
      if (!this.options.liveValidation) {
        this.validate();
      }
    });

    // Focus event
    this.element.addEventListener('focus', (e) => {
      this.wrapper.classList.add('focused');
      if (this.options.onFocus) {
        this.options.onFocus(e, this);
      }
    });

    // Blur event
    this.element.addEventListener('blur', (e) => {
      this.wrapper.classList.remove('focused');
      if (this.options.onBlur) {
        this.options.onBlur(e, this);
      }
      this.validate();
    });
  }

  /**
   * Update clear button visibility
   */
  updateClearButton() {
    if (this.clearButton) {
      this.clearButton.style.display = this.element.value && !this.options.disabled ? 'block' : 'none';
    }
  }

  /**
   * Validate input
   * @returns {boolean} - Is valid
   */
  validate() {
    const value = this.getValue();
    let validationResult = { valid: true, message: '' };

    // Required check
    if (this.options.required && !value) {
      validationResult = { valid: false, message: 'This field is required' };
    }
    // Custom validator
    else if (this.options.validator && value) {
      validationResult = this.options.validator(value);
    }

    this.isValid = validationResult.valid;
    this.errorMessage = validationResult.message || '';

    this.updateValidationState();

    if (this.options.onValidation) {
      this.options.onValidation(this.isValid, this.errorMessage, this);
    }

    return this.isValid;
  }

  /**
   * Update validation state UI
   */
  updateValidationState() {
    if (this.isValid) {
      this.wrapper.classList.remove('error');
      this.errorElement.textContent = '';
      this.errorElement.style.display = 'none';
    } else {
      this.wrapper.classList.add('error');
      this.errorElement.textContent = this.errorMessage;
      this.errorElement.style.display = 'block';
      
      // Vibration feedback
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    }
  }

  /**
   * Get value
   * @returns {string} - Input value
   */
  getValue() {
    return this.element.value;
  }

  /**
   * Set value
   * @param {string} value - Value to set
   */
  setValue(value) {
    this.element.value = value;
    this.updateClearButton();
    if (this.options.liveValidation) {
      this.validate();
    }
  }

  /**
   * Clear input
   */
  clear() {
    this.setValue('');
    this.element.focus();
  }

  /**
   * Enable input
   */
  enable() {
    this.options.disabled = false;
    this.element.disabled = false;
    this.wrapper.classList.remove('disabled');
    const actionButtons = this.wrapper.querySelectorAll('.input-action');
    actionButtons.forEach(btn => btn.disabled = false);
  }

  /**
   * Disable input
   */
  disable() {
    this.options.disabled = true;
    this.element.disabled = true;
    this.wrapper.classList.add('disabled');
    const actionButtons = this.wrapper.querySelectorAll('.input-action');
    actionButtons.forEach(btn => btn.disabled = true);
    this.updateClearButton();
  }

  /**
   * Focus input
   */
  focus() {
    this.element.focus();
  }

  /**
   * Blur input
   */
  blur() {
    this.element.blur();
  }

  /**
   * Destroy component
   */
  destroy() {
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }
}
