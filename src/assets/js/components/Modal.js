import { BottomSheet } from './BottomSheet.js';

/**
 * Modal Component
 * Converts to BottomSheet on mobile
 */
export class Modal {
  constructor(options = {}) {
    this.options = {
      title: options.title || '',
      description: options.description || '',
      content: options.content || '',
      image: options.image || null,
      showCloseButton: options.showCloseButton !== false,
      buttons: options.buttons || [],
      onClose: options.onClose || null,
      ...options
    };
    
    this.isMobile = window.innerWidth <= 768;
    this.modalInstance = null;
    this.init();
  }

  /**
   * Initialize modal
   */
  init() {
    // Use BottomSheet on mobile, Modal on desktop
    if (this.isMobile) {
      this.initBottomSheet();
    } else {
      this.initModal();
    }
    
    // Listen for resize to switch between modal and bottom sheet
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      
      if (wasMobile !== this.isMobile) {
        this.destroy();
        this.init();
      }
    });
  }

  /**
   * Initialize as BottomSheet (mobile)
   */
  initBottomSheet() {
    const buttons = [...this.options.buttons];
    
    this.modalInstance = new BottomSheet({
      title: this.options.title,
      content: this.createMobileContent(),
      buttons: buttons,
      onClose: this.options.onClose
    });
  }

  /**
   * Create mobile content
   * @returns {HTMLElement} - Content element
   */
  createMobileContent() {
    const container = document.createElement('div');
    container.className = 'modal-content-mobile';
    
    if (this.options.description) {
      const desc = document.createElement('p');
      desc.className = 'modal-description';
      desc.textContent = this.options.description;
      container.appendChild(desc);
    }
    
    if (this.options.image) {
      const img = document.createElement('img');
      img.src = this.options.image;
      img.alt = this.options.title || '';
      img.className = 'modal-image';
      container.appendChild(img);
    }
    
    if (typeof this.options.content === 'string') {
      const content = document.createElement('div');
      content.innerHTML = this.options.content;
      container.appendChild(content);
    } else if (this.options.content instanceof HTMLElement) {
      container.appendChild(this.options.content);
    }
    
    return container;
  }

  /**
   * Initialize as Modal (desktop)
   */
  initModal() {
    this.createModalHTML();
    this.attachEvents();
  }

  /**
   * Create modal HTML
   */
  createModalHTML() {
    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.addEventListener('click', () => this.close());
    this.backdrop = backdrop;

    // Modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    // Modal content
    const content = document.createElement('div');
    content.className = 'modal-content';

    // Close button
    if (this.options.showCloseButton) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'modal-close';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.onclick = () => this.close();
      content.appendChild(closeBtn);
    }

    // Title
    if (this.options.title) {
      const title = document.createElement('h2');
      title.id = 'modal-title';
      title.className = 'modal-title';
      title.textContent = this.options.title;
      content.appendChild(title);
    }

    // Description
    if (this.options.description) {
      const desc = document.createElement('p');
      desc.className = 'modal-description';
      desc.textContent = this.options.description;
      content.appendChild(desc);
    }

    // Image
    if (this.options.image) {
      const img = document.createElement('img');
      img.src = this.options.image;
      img.alt = this.options.title || '';
      img.className = 'modal-image';
      content.appendChild(img);
    }

    // Body content
    const body = document.createElement('div');
    body.className = 'modal-body';
    
    if (typeof this.options.content === 'string') {
      body.innerHTML = this.options.content;
    } else if (this.options.content instanceof HTMLElement) {
      body.appendChild(this.options.content);
    }
    
    content.appendChild(body);

    // Buttons
    if (this.options.buttons && this.options.buttons.length > 0) {
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'modal-buttons';
      
      this.options.buttons.forEach((button) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn btn-${button.type || 'secondary'}`;
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
          if (button.closeOnClick !== false) {
            this.close();
          }
        };
        
        buttonsContainer.appendChild(btn);
      });
      
      content.appendChild(buttonsContainer);
    }

    modal.appendChild(content);
    this.modalElement = modal;
    
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
  }

  /**
   * Attach events
   */
  attachEvents() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Handle key down (ESC to close)
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyDown(e) {
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  /**
   * Open modal
   */
  open() {
    if (this.modalInstance) {
      if (this.isMobile) {
        this.modalInstance.open();
      } else {
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        this.backdrop.classList.add('show');
        this.modalElement.classList.add('show');
        
        // Focus trap
        const firstFocusable = this.modalElement.querySelector('button, input, textarea, select, a[href]');
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    }
  }

  /**
   * Close modal
   */
  close() {
    if (this.modalInstance) {
      if (this.isMobile) {
        this.modalInstance.close();
      } else {
        this.isOpen = false;
        this.backdrop.classList.remove('show');
        this.modalElement.classList.remove('show');
        document.body.style.overflow = '';
        
        setTimeout(() => {
          if (this.options.onClose) {
            this.options.onClose();
          }
        }, 300);
      }
    }
  }

  /**
   * Destroy component
   */
  destroy() {
    if (this.modalInstance) {
      if (this.isMobile) {
        this.modalInstance.destroy();
      } else {
        document.removeEventListener('keydown', this.handleKeyDown);
        if (this.backdrop && this.backdrop.parentNode) {
          this.backdrop.parentNode.removeChild(this.backdrop);
        }
        if (this.modalElement && this.modalElement.parentNode) {
          this.modalElement.parentNode.removeChild(this.modalElement);
        }
      }
    }
  }
}
