/**
 * Error Display Handler
 * Supports 3 modes: Toast, Page Element, DOM Change
 */
class ErrorHandler {
  constructor() {
    this.toastContainer = null;
    this.initToastContainer();
  }

  /**
   * Initialize toast container
   */
  initToastContainer() {
    if (!document.getElementById('error-toast-container')) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'error-toast-container';
      this.toastContainer.className = 'error-toast-container';
      this.toastContainer.setAttribute('aria-live', 'polite');
      this.toastContainer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(this.toastContainer);
    } else {
      this.toastContainer = document.getElementById('error-toast-container');
    }
  }

  /**
   * Show error
   * @param {Object} options - Error options
   * @param {string} options.message - Error message
   * @param {string} options.mode - Display mode: 'toast', 'element', 'dom'
   * @param {string} options.elementId - Element ID for 'element' mode
   * @param {HTMLElement} options.targetElement - Target element for 'dom' mode
   * @param {number} options.duration - Duration in ms (for toast)
   * @param {string} options.type - Error type: 'error', 'warning', 'info'
   */
  show(options) {
    const {
      message,
      mode = 'toast',
      elementId = null,
      targetElement = null,
      duration = 5000,
      type = 'error'
    } = options;

    switch (mode) {
      case 'toast':
        this.showToast(message, duration, type);
        break;
      case 'element':
        if (elementId) {
          this.showInElement(elementId, message, type);
        }
        break;
      case 'dom':
        if (targetElement) {
          this.changeDOM(targetElement, message, type);
        }
        break;
      default:
        console.error('Invalid error display mode:', mode);
    }
  }

  /**
   * Show toast notification
   * @param {string} message - Error message
   * @param {number} duration - Duration in ms
   * @param {string} type - Error type
   */
  showToast(message, duration, type) {
    const toast = document.createElement('div');
    toast.className = `error-toast error-toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'error-toast-close';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.onclick = () => this.removeToast(toast);
    toast.appendChild(closeBtn);
    
    this.toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast);
      }, duration);
    }
  }

  /**
   * Remove toast
   * @param {HTMLElement} toast - Toast element
   */
  removeToast(toast) {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  /**
   * Show error in specific element
   * @param {string} elementId - Element ID
   * @param {string} message - Error message
   * @param {string} type - Error type
   */
  showInElement(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID "${elementId}" not found`);
      return;
    }

    // Remove existing error
    const existingError = element.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = `error-message error-message-${type}`;
    errorElement.setAttribute('role', 'alert');
    errorElement.textContent = message;
    
    element.appendChild(errorElement);
  }

  /**
   * Change DOM content
   * @param {HTMLElement} targetElement - Target element
   * @param {string} message - Error message
   * @param {string} type - Error type
   */
  changeDOM(targetElement, message, type) {
    if (!targetElement) return;

    targetElement.className = `error-dom-content error-dom-${type}`;
    targetElement.textContent = message;
    targetElement.setAttribute('role', 'alert');
  }

  /**
   * Clear all errors
   */
  clear() {
    // Clear toasts
    if (this.toastContainer) {
      this.toastContainer.innerHTML = '';
    }

    // Clear element errors
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();
