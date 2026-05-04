/**
 * Error Display Handler
 * Supports 3 modes: Toast, Page Element, DOM Change
 */
import { appIconHtml } from './icons.js';
import { i18n } from './i18n.js';

/**
 * Monochrome icon file for toast type (mask + theme color in CSS).
 * @param {string} type
 * @returns {string}
 */
function getToastIconFileForType(type) {
  switch (type) {
    case 'success':
      return 'icn-square-check.svg';
    case 'warning':
      return 'icn-square-minus.svg';
    case 'info':
      return 'icn-square-info.svg';
    case 'error':
    default:
      return 'icn-x.svg';
  }
}

class ErrorHandler {
  constructor() {
    this.toastContainer = null;
    /** @type {WeakMap<HTMLElement, { timeoutId: ReturnType<typeof setTimeout> | null, onEnter: () => void, onLeave: () => void, useTimer: boolean, dismissDeferred: boolean, pauseAt: number | null }>} */
    this.domMessageLifecycle = new WeakMap();
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
   * @param {number} options.duration - Duration in ms (toast auto-dismiss; for dom, used when `domDuration` omitted)
   * @param {number} [options.domDuration] - Dom-only: ms until auto-dismiss (0 = no timer or progress bar; if omitted, uses `duration` when positive, otherwise 8000)
   * @param {string} options.type - Toast/inline type: 'error', 'warning', 'info', 'success'
   * @param {string} [options.iconFile] - Optional icon filename under `/assets/images/icons/` (SVG mask). Overrides default icon for `toast` and `dom`.
   * @param {() => void} [options.domOnDismiss] - Called after dom message is cleared (auto, close button, or cancelDomMessage).
   */
  show(options) {
    const {
      message,
      mode = 'toast',
      elementId = null,
      targetElement = null,
      duration = 5000,
      type = 'error',
      iconFile = null,
      domOnDismiss = null,
    } = options;

    switch (mode) {
      case 'toast':
        this.showToast(message, duration, type, iconFile);
        break;
      case 'element':
        if (elementId) {
          this.showInElement(elementId, message, type);
        }
        break;
      case 'dom':
        if (targetElement) {
          const domDuration = options.domDuration ?? (duration > 0 ? duration : 8000);
          this.changeDOM(targetElement, message, type, {
            iconFile,
            duration: domDuration,
            domOnDismiss: typeof domOnDismiss === 'function' ? domOnDismiss : null,
          });
        }
        break;
      default:
        console.error('Invalid error display mode:', mode);
    }
  }

  /**
   * @param {string | null | undefined} iconFileOverride - SVG filename in icons dir, or null for type default
   */
  resolveToastIconFile(type, iconFileOverride) {
    if (typeof iconFileOverride === 'string' && iconFileOverride.trim() !== '') {
      return iconFileOverride.trim();
    }
    return getToastIconFileForType(type);
  }

  /**
   * Show toast notification
   * @param {string} message - Error message
   * @param {number} duration - Duration in ms
   * @param {string} type - Error type
   * @param {string | null | undefined} iconFileOverride - optional custom lead icon (SVG filename)
   */
  showToast(message, duration, type, iconFileOverride) {
    const normalizedType = ['error', 'warning', 'info', 'success'].includes(type) ? type : 'error';
    const toast = document.createElement('div');
    toast.className = `error-toast error-toast-${normalizedType}`;
    toast.setAttribute('role', 'alert');

    const inner = document.createElement('div');
    inner.className = 'error-toast-inner';

    const iconWrap = document.createElement('span');
    iconWrap.className = 'error-toast-icon-wrap';
    iconWrap.setAttribute('aria-hidden', 'true');
    iconWrap.innerHTML = appIconHtml(
      this.resolveToastIconFile(normalizedType, iconFileOverride),
      'error-toast-lead-icon'
    );

    const msgEl = document.createElement('span');
    msgEl.className = 'error-toast-message';
    msgEl.textContent = message;

    inner.appendChild(iconWrap);
    inner.appendChild(msgEl);
    toast.appendChild(inner);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'error-toast-close';
    closeBtn.type = 'button';
    closeBtn.innerHTML = appIconHtml('icn-x.svg');
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
   * Stop dom message timer / listeners without removing content (use before replacing same target).
   * @param {HTMLElement} targetElement
   */
  cancelDomMessage(targetElement) {
    if (!targetElement) return;
    const state = this.domMessageLifecycle.get(targetElement);
    if (!state) return;
    if (state.timeoutId != null) {
      window.clearTimeout(state.timeoutId);
      state.timeoutId = null;
    }
    if (typeof state.onEnter === 'function') {
      targetElement.removeEventListener('mouseenter', state.onEnter);
    }
    if (typeof state.onLeave === 'function') {
      targetElement.removeEventListener('mouseleave', state.onLeave);
    }
    this.domMessageLifecycle.delete(targetElement);
  }

  /**
   * @param {HTMLElement} el
   */
  stripErrorDomSurfaceClasses(el) {
    if (!el) return;
    el.classList.remove(
      'error-dom-content',
      'error-dom-error',
      'error-dom-warning',
      'error-dom-info',
      'error-dom-success'
    );
  }

  /**
   * Clear dom inline message UI and optional callback.
   * @param {HTMLElement} targetElement
   * @param {{ domOnDismiss?: (() => void) | null }} [opts]
   */
  finishDomMessage(targetElement, opts = {}) {
    if (!targetElement) return;
    this.cancelDomMessage(targetElement);
    this.stripErrorDomSurfaceClasses(targetElement);
    targetElement.replaceChildren();
    targetElement.removeAttribute('role');
    if (typeof opts.domOnDismiss === 'function') {
      opts.domOnDismiss();
    }
  }

  /**
   * Change DOM content (inline alert; icon row, dismiss button, thin progress bar, auto-dismiss with hover pause).
   * Preserves non–error-dom classes on the target (e.g. gift-card-inline-notice).
   * @param {HTMLElement} targetElement - Target element
   * @param {string} message - Error message
   * @param {string} type - 'error' | 'warning' | 'info' | 'success'
   * @param {{ iconFile?: string | null, duration?: number, domOnDismiss?: (() => void) | null }} [domOptions]
   */
  changeDOM(targetElement, message, type, domOptions = {}) {
    if (!targetElement) return;

    this.cancelDomMessage(targetElement);

    const normalizedType = ['error', 'warning', 'info', 'success'].includes(type) ? type : 'error';
    const variantClasses = ['error', 'warning', 'info', 'success'].map((t) => `error-dom-${t}`);

    targetElement.classList.add('error-dom-content');
    targetElement.classList.remove(...variantClasses);
    targetElement.classList.add(`error-dom-${normalizedType}`);
    targetElement.setAttribute('role', 'alert');

    const durationMs =
      typeof domOptions.duration === 'number' && domOptions.duration >= 0
        ? domOptions.duration
        : 8000;
    const useTimer = durationMs > 0;
    const onDismiss =
      typeof domOptions.domOnDismiss === 'function' ? domOptions.domOnDismiss : null;

    const iconFile = this.resolveToastIconFile(normalizedType, domOptions?.iconFile);

    const inner = document.createElement('div');
    inner.className = 'error-dom-inner';

    const mainRow = document.createElement('div');
    mainRow.className = 'error-dom-main-row';

    const iconWrap = document.createElement('span');
    iconWrap.className = 'error-dom-icon-wrap';
    iconWrap.setAttribute('aria-hidden', 'true');
    iconWrap.innerHTML = appIconHtml(iconFile, 'error-dom-lead-icon');

    const msgEl = document.createElement('span');
    msgEl.className = 'error-dom-message';
    msgEl.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'error-dom-dismiss';
    closeBtn.innerHTML = appIconHtml('icn-x.svg', 'error-dom-dismiss-icon');
    closeBtn.setAttribute('aria-label', i18n.t('common.close'));
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.finishDomMessage(targetElement, { domOnDismiss: onDismiss });
    });

    mainRow.append(iconWrap, msgEl, closeBtn);

    const track = document.createElement('div');
    track.className = 'error-dom-progress-track';
    track.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('div');
    fill.className = 'error-dom-progress-fill';
    if (useTimer) {
      fill.style.setProperty('--error-dom-progress-ms', `${durationMs}ms`);
    } else {
      track.hidden = true;
    }
    track.appendChild(fill);

    inner.append(mainRow, track);
    targetElement.replaceChildren(inner);

    if (!useTimer) {
      return;
    }

    /** Absolute time when the message should auto-dismiss (extended while hover pauses the bar). */
    let dismissAt = Date.now() + durationMs;

    /** @type {{ timeoutId: ReturnType<typeof setTimeout> | null, onEnter: () => void, onLeave: () => void, useTimer: boolean, dismissDeferred: boolean, pauseAt: number | null }} */
    const state = {
      timeoutId: null,
      onEnter: () => {},
      onLeave: () => {},
      useTimer: true,
      dismissDeferred: false,
      pauseAt: null,
    };

    const clearTimer = () => {
      if (state.timeoutId != null) {
        window.clearTimeout(state.timeoutId);
        state.timeoutId = null;
      }
    };

    const finalizeOrDefer = () => {
      if (targetElement.matches(':hover')) {
        state.dismissDeferred = true;
        return;
      }
      state.dismissDeferred = false;
      this.finishDomMessage(targetElement, { domOnDismiss: onDismiss });
    };

    const scheduleDismiss = (ms) => {
      clearTimer();
      const delay = Math.max(0, Math.ceil(ms));
      if (delay === 0) {
        finalizeOrDefer();
        return;
      }
      state.timeoutId = window.setTimeout(() => {
        state.timeoutId = null;
        finalizeOrDefer();
      }, delay);
    };

    state.onEnter = () => {
      clearTimer();
      state.dismissDeferred = false;
      // Align JS with CSS: hover pauses the keyframe; time spent hovered must not shrink remaining duration.
      state.pauseAt = Date.now();
    };

    state.onLeave = () => {
      if (state.dismissDeferred) {
        state.dismissDeferred = false;
        clearTimer();
        state.pauseAt = null;
        this.finishDomMessage(targetElement, { domOnDismiss: onDismiss });
        return;
      }
      const now = Date.now();
      let remaining;
      if (state.pauseAt != null) {
        remaining = Math.max(0, dismissAt - state.pauseAt);
        state.pauseAt = null;
      } else {
        remaining = Math.max(0, dismissAt - now);
      }
      dismissAt = now + remaining;
      scheduleDismiss(remaining);
    };

    this.domMessageLifecycle.set(targetElement, state);
    targetElement.addEventListener('mouseenter', state.onEnter);
    targetElement.addEventListener('mouseleave', state.onLeave);
    scheduleDismiss(durationMs);

    // If the pointer is already over the surface when it mounts, `mouseenter` does not fire
    // while CSS :hover still pauses the progress bar — keep JS in sync so we do not dismiss mid-hover.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (targetElement.matches(':hover')) {
          state.onEnter();
        }
      });
    });
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
    errorElements.forEach((el) => el.remove());
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();
