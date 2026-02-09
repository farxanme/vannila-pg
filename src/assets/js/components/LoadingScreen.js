/**
 * Full-screen Loading Component
 */
export class LoadingScreen {
  constructor(options = {}) {
    this.options = {
      logo: options.logo || null,
      text: options.text || '',
      showProgressBar: options.showProgressBar !== false,
      ...options
    };
    
    this.init();
  }

  /**
   * Initialize loading screen
   */
  init() {
    this.createHTML();
  }

  /**
   * Create HTML structure
   */
  createHTML() {
    const loading = document.createElement('div');
    loading.className = 'loading-screen';
    loading.setAttribute('role', 'status');
    loading.setAttribute('aria-live', 'polite');
    loading.setAttribute('aria-label', 'Loading');

    const container = document.createElement('div');
    container.className = 'loading-container';

    // Logo
    if (this.options.logo) {
      const logo = document.createElement('div');
      logo.className = 'loading-logo';
      if (typeof this.options.logo === 'string') {
        const img = document.createElement('img');
        img.src = this.options.logo;
        img.alt = 'Logo';
        logo.appendChild(img);
      } else if (this.options.logo instanceof HTMLElement) {
        logo.appendChild(this.options.logo);
      }
      container.appendChild(logo);
    }

    // Progress bar
    if (this.options.showProgressBar) {
      const progressBar = document.createElement('div');
      progressBar.className = 'loading-progress-bar';
      
      const bar = document.createElement('div');
      bar.className = 'loading-progress-bar-indeterminate';
      
      const progress = document.createElement('div');
      progress.className = 'loading-progress';
      bar.appendChild(progress);
      
      progressBar.appendChild(bar);
      container.appendChild(progressBar);
    }

    // Text
    if (this.options.text) {
      const text = document.createElement('div');
      text.className = 'loading-text';
      text.textContent = this.options.text;
      container.appendChild(text);
    }

    loading.appendChild(container);
    this.element = loading;
    document.body.appendChild(loading);
  }

  /**
   * Show loading screen
   */
  show() {
    if (this.element) {
      this.element.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Hide loading screen
   */
  hide() {
    if (this.element) {
      this.element.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  /**
   * Update text
   * @param {string} text - New text
   */
  updateText(text) {
    const textElement = this.element?.querySelector('.loading-text');
    if (textElement) {
      textElement.textContent = text;
    }
  }

  /**
   * Destroy component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      document.body.style.overflow = '';
    }
  }
}
