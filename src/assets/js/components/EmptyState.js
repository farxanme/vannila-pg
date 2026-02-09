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
      ...options
    };
    
    this.init();
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

    // Image
    if (this.options.image) {
      const img = document.createElement('img');
      img.src = this.options.image;
      img.alt = this.options.title || 'Empty state';
      img.className = 'empty-state-image';
      emptyState.appendChild(img);
    }

    // Title
    if (this.options.title) {
      const title = document.createElement('h3');
      title.className = 'empty-state-title';
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
      
      this.options.buttons.forEach((button, index) => {
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
