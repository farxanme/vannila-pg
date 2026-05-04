/**
 * Full-width error / notice block: wraps {@link EmptyState} in `.payment-init-error` (role alert).
 * Used for payment init failure, offline, and any caller that passes the same option shape.
 */
import { EmptyState } from './EmptyState.js';

export class PaymentInitErrorScreen {
  constructor(options = {}) {
    this.options = {
      image: options.image || '/assets/images/icons/icn-x.svg',
      title: options.title || '',
      description: options.description || '',
      buttons: Array.isArray(options.buttons) ? options.buttons : [],
      ariaLabel: options.ariaLabel || options.title || 'Error',
      container: options.container ?? null,
      headingId: 'payment-init-error-heading',
      ...options,
    };

    if (!this.options.container) {
      throw new Error('PaymentInitErrorScreen requires options.container');
    }

    this.element = null;
    this.emptyState = null;
    this.init();
  }

  init() {
    const root = document.createElement('div');
    root.className = 'payment-init-error';
    root.setAttribute('role', 'alert');
    root.setAttribute('aria-live', 'assertive');
    root.setAttribute('aria-label', this.options.ariaLabel);

    this.element = root;
    this.options.container.appendChild(root);

    this.emptyState = new EmptyState(root, {
      image: this.options.image,
      title: this.options.title,
      description: this.options.description,
      buttons: this.options.buttons,
      titleId: this.options.headingId,
    });
  }

  /**
   * @param {{ title?: string, description?: string }} texts
   */
  updateTexts(texts) {
    this.emptyState?.update(texts);
  }

  destroy() {
    this.emptyState?.destroy();
    this.emptyState = null;
    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
