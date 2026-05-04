/**
 * EmptyState Component
 */
export class EmptyState {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      image: options.image || null,
      title: options.title || '',
      description: options.description || '',
      buttons: options.buttons || [],
      titleId: null,
      ...options,
    };

    this.init();
  }

  /**
   * Keep decorative image accessible name aligned with the visible title text.
   */
  syncDecorativeImageAccessibleName() {
    if (!this.element) return;
    const titleEl = this.element.querySelector('.empty-state-title');
    const label = (titleEl?.textContent || this.options.title || '').trim() || 'Empty state';
    const img = this.element.querySelector('.empty-state-image');
    if (!img) return;
    if (img.tagName === 'SPAN' && img.getAttribute('role') === 'img') {
      img.setAttribute('aria-label', label);
    } else if (img.tagName === 'IMG') {
      img.alt = label;
    }
  }

  /**
   * Initialize empty state
   */
  init() {
    this.createHTML();
  }

  /**
   * Create HTML structure
   */
  createHTML() {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';

    // Image / SVG as CSS mask (monochrome SVG + theme color via .app-icon)
    if (this.options.image) {
      const imageStr = String(this.options.image);
      const useMask = /\.svg(\?|$)/i.test(imageStr);
      if (useMask) {
        const span = document.createElement('span');
        span.className = 'empty-state-image app-icon app-icon-block';
        const safeUrl = imageStr.replace(/'/g, "\\'");
        span.style.setProperty('--app-icon-src', `url('${safeUrl}')`);
        span.setAttribute('role', 'img');
        span.setAttribute('aria-label', this.options.title || 'Empty state');
        emptyState.appendChild(span);
      } else {
        const img = document.createElement('img');
        img.src = this.options.image;
        img.alt = this.options.title || 'Empty state';
        img.className = 'empty-state-image';
        emptyState.appendChild(img);
      }
    }

    // Title
    if (this.options.title) {
      const title = document.createElement('h3');
      title.className = 'empty-state-title';
      if (this.options.titleId) {
        title.id = this.options.titleId;
      }
      title.textContent = this.options.title;
      emptyState.appendChild(title);
    }

    // Description
    if (this.options.description) {
      const desc = document.createElement('p');
      desc.className = 'empty-state-description';
      desc.textContent = this.options.description;
      emptyState.appendChild(desc);
    }

    // Buttons
    if (this.options.buttons && this.options.buttons.length > 0) {
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'empty-state-buttons';

      this.options.buttons.forEach((button, _index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn btn-${button.type || 'primary'}`;
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
        };

        buttonsContainer.appendChild(btn);
      });

      emptyState.appendChild(buttonsContainer);
    }

    this.element = emptyState;
    this.container.appendChild(emptyState);
    this.syncDecorativeImageAccessibleName();
  }

  /**
   * Update content
   * @param {Object} options - Update options
   */
  update(options) {
    if (options.title !== undefined) {
      const titleEl = this.element.querySelector('.empty-state-title');
      if (titleEl) {
        titleEl.textContent = options.title;
      }
      this.syncDecorativeImageAccessibleName();
    }

    if (options.description !== undefined) {
      const descEl = this.element.querySelector('.empty-state-description');
      if (descEl) {
        descEl.textContent = options.description;
      }
    }
  }

  /**
   * Show empty state
   */
  show() {
    this.element.style.display = 'block';
  }

  /**
   * Hide empty state
   */
  hide() {
    this.element.style.display = 'none';
  }

  /**
   * Destroy component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
