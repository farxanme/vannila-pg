/**
 * Input Component
 * Supports: label, hint, validation errors, action buttons, clear button
 */
import { appIconHtml } from '../utils/icons.js';
import { i18n } from '../utils/i18n.js';

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
      maskWithPasswordFont: options.maskWithPasswordFont || false,
      omitInnerError: options.omitInnerError || false,
      skipBlurValidate: options.skipBlurValidate || false,
      ariaLabel: options.ariaLabel || '',
      /** When set, empty-required errors use `i18n.t(key)` on each validate (survives language changes). */
      requiredMessageKey: options.requiredMessageKey || '',
      requiredMessage: options.requiredMessage || 'This field is required',
      clearButtonAriaLabel: options.clearButtonAriaLabel || 'Clear',
      /** If set (e.g. `'off'`), applied as the input `autocomplete` attribute. */
      autocomplete: options.autocomplete,
      ...options,
    };

    this.isValid = true;
    this.errorMessage = '';
    this.element = null;
    this.labelElement = null;
    this.inputContainer = null;
    this.hintElement = null;
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
      this.labelElement = document.createElement('label');
      this.labelElement.className = 'input-label';
      this.labelElement.setAttribute('for', this.options.id);
      this.labelElement.textContent = this.options.label;
      wrapper.appendChild(this.labelElement);
    }

    // Input container (state classes: focused, error, disabled, bordered)
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container' + (this.options.bordered ? ' bordered' : '');
    if (this.options.disabled) inputContainer.classList.add('disabled');
    this.inputContainer = inputContainer;

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
    const isPasswordType = this.options.type === 'password';
    input.type = isPasswordType ? 'tel' : this.options.type;
    input.id = this.options.id;
    input.name = this.options.name || this.options.id;
    input.className = 'input-field';
    input.placeholder = this.options.placeholder;
    input.value = this.options.value;
    input.disabled = this.options.disabled;
    input.required = this.options.required;

    if (this.options.inputMode) {
      input.inputMode = this.options.inputMode;
    } else if (isPasswordType) {
      input.inputMode = 'tel';
    }

    if (this.options.pattern) {
      input.pattern = this.options.pattern;
    }

    if (this.options.maxLength) {
      input.maxLength = this.options.maxLength;
    }
    if (typeof this.options.autocomplete === 'string' && this.options.autocomplete.length > 0) {
      input.setAttribute('autocomplete', this.options.autocomplete);
      if (this.options.autocomplete === 'off') {
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('autocapitalize', 'off');
      }
    }
    if (this.options.maskWithPasswordFont) {
      input.classList.add('input-password-mask');
    }

    if (this.options.ariaLabel) {
      input.setAttribute('aria-label', this.options.ariaLabel);
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
      clearBtn.innerHTML = appIconHtml('icn-x.svg');
      clearBtn.setAttribute('aria-label', this.options.clearButtonAriaLabel);
      clearBtn.style.visibility = 'hidden';
      clearBtn.style.pointerEvents = 'none';
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
      this.hintElement = hint;
    }

    // Error message (optional: parent shows a shared error row)
    if (!this.options.omitInnerError) {
      const error = document.createElement('div');
      error.className = 'input-error';
      error.setAttribute('role', 'alert');
      wrapper.appendChild(error);
      this.errorElement = error;
    } else {
      this.errorElement = null;
    }

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
      if (this.inputContainer) this.inputContainer.classList.add('focused');
      if (this.options.onFocus) {
        this.options.onFocus(e, this);
      }
    });

    // Blur event
    this.element.addEventListener('blur', (e) => {
      if (this.inputContainer) this.inputContainer.classList.remove('focused');
      if (this.options.onBlur) {
        this.options.onBlur(e, this);
      }
      if (!this.options.skipBlurValidate) {
        this.validate();
      }
    });
  }

  /**
   * Update clear button visibility
   */
  updateClearButton() {
    if (this.clearButton) {
      const shouldShow = Boolean(this.element.value) && !this.options.disabled;
      this.clearButton.style.visibility = shouldShow ? 'visible' : 'hidden';
      this.clearButton.style.pointerEvents = shouldShow ? 'auto' : 'none';
    }
  }

  /**
   * Validate input
   * @returns {boolean} - Is valid
   */
  validate() {
    if (this.element?.disabled || this.element?.readOnly || this.options.disabled) {
      this.isValid = true;
      this.errorMessage = '';
      this.clearValidation();
      return true;
    }

    const value = this.getValue();
    let validationResult = { valid: true, message: '' };

    if (this.options.required && !value) {
      const requiredMsg = this.options.requiredMessageKey
        ? i18n.t(this.options.requiredMessageKey)
        : this.options.requiredMessage;
      validationResult = { valid: false, message: requiredMsg };
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
      this.clearValidation();
    } else {
      this.wrapper.classList.add('error');
      if (this.inputContainer) this.inputContainer.classList.add('error');
      if (this.errorElement) {
        this.errorElement.textContent = this.errorMessage;
        this.errorElement.style.visibility = 'visible';
      }

      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    }
  }

  /**
   * Clear validation UI state
   */
  clearValidation() {
    this.wrapper.classList.remove('error');
    if (this.inputContainer) this.inputContainer.classList.remove('error');
    if (this.errorElement) {
      this.errorElement.textContent = '';
      this.errorElement.style.visibility = 'hidden';
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
    // Dispatch native input event so external listeners (like page logic)
    // can react to the cleared value (e.g. hide bank logo)
    const event = new Event('input', { bubbles: true });
    this.element.dispatchEvent(event);
    this.element.focus();
  }

  /**
   * Enable input
   */
  enable() {
    this.options.disabled = false;
    this.element.disabled = false;
    this.wrapper.classList.remove('disabled');
    if (this.inputContainer) this.inputContainer.classList.remove('disabled');
    const actionButtons = this.wrapper.querySelectorAll('.input-action');
    actionButtons.forEach((btn) => (btn.disabled = false));
  }

  /**
   * Disable input
   */
  disable() {
    this.options.disabled = true;
    this.element.disabled = true;
    this.wrapper.classList.add('disabled');
    if (this.inputContainer) this.inputContainer.classList.add('disabled');
    const actionButtons = this.wrapper.querySelectorAll('.input-action');
    actionButtons.forEach((btn) => (btn.disabled = true));
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
   * Set label text
   * @param {string} label - Label text
   */
  setLabel(label) {
    this.options.label = label;
    if (!this.labelElement && this.wrapper) {
      // Create label if it doesn't exist
      this.labelElement = document.createElement('label');
      this.labelElement.className = 'input-label';
      this.labelElement.setAttribute('for', this.options.id);
      this.wrapper.insertBefore(this.labelElement, this.wrapper.firstChild);
    }
    if (this.labelElement) {
      this.labelElement.textContent = label;
    }
  }

  /**
   * Update accessible name when there is no visible label.
   * @param {string} ariaLabelText
   */
  setAriaLabel(ariaLabelText) {
    this.options.ariaLabel = ariaLabelText || '';
    if (this.element) {
      if (this.options.ariaLabel) {
        this.element.setAttribute('aria-label', this.options.ariaLabel);
      } else {
        this.element.removeAttribute('aria-label');
      }
    }
  }

  /**
   * Set placeholder text
   * @param {string} placeholder - Placeholder text
   */
  setPlaceholder(placeholder) {
    this.options.placeholder = placeholder;
    if (this.element) {
      this.element.placeholder = placeholder;
    }
  }

  /**
   * Update aria-label for the right action button (e.g. after language change).
   * @param {string} label - Accessible label
   */
  setRightActionAriaLabel(label) {
    if (this.options.rightAction) {
      this.options.rightAction.label = label || '';
    }
    const rightBtn = this.wrapper?.querySelector('.input-action-right');
    if (rightBtn) {
      rightBtn.setAttribute('aria-label', label || '');
    }
  }

  /**
   * Update clear button accessible name (e.g. after language change).
   * @param {string} label
   */
  setClearButtonAriaLabel(label) {
    this.options.clearButtonAriaLabel = label || '';
    if (this.clearButton) {
      this.clearButton.setAttribute('aria-label', label || '');
    }
  }

  /**
   * Re-run validation when the field is invalid so messages track the active language.
   * @returns {boolean}
   */
  revalidateIfShowingError() {
    if (!this.wrapper?.classList.contains('error')) return true;
    return this.validate();
  }

  /**
   * Set hint text (below the input)
   * @param {string} hintText - Hint text
   */
  setHint(hintText) {
    this.options.hint = hintText || '';
    if (this.hintElement) {
      this.hintElement.textContent = this.options.hint;
    }
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
