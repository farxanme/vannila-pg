/**
 * Bottom Sheet Component (Mobile only with swipe down to close)
 */
export class BottomSheet {
  constructor(options = {}) {
    this.options = {
      title: options.title || '',
      content: options.content || '',
      buttons: options.buttons || [],
      scrollable: options.scrollable !== false,
      onClose: options.onClose || null,
      ...options
    };
    
    this.isOpen = false;
    this.startY = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.init();
  }

  /**
   * Initialize bottom sheet
   */
  init() {
    this.createHTML();
    this.attachEvents();
  }

  /**
   * Create HTML structure
   */
  createHTML() {
    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'bottom-sheet-backdrop';
    backdrop.addEventListener('click', () => this.close());
    this.backdrop = backdrop;

    // Bottom sheet container
    const sheet = document.createElement('div');
    sheet.className = 'bottom-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-labelledby', 'bottom-sheet-title');

    // Handle bar (for swipe indication)
    const handleBar = document.createElement('div');
    handleBar.className = 'bottom-sheet-handle';
    sheet.appendChild(handleBar);

    // Title
    if (this.options.title) {
      const title = document.createElement('div');
      title.id = 'bottom-sheet-title';
      title.className = 'bottom-sheet-title';
      title.textContent = this.options.title;
      sheet.appendChild(title);
    }

    // Content
    const content = document.createElement('div');
    content.className = `bottom-sheet-content ${this.options.scrollable ? 'scrollable' : ''}`;
    
    if (typeof this.options.content === 'string') {
      content.innerHTML = this.options.content;
    } else if (this.options.content instanceof HTMLElement) {
      content.appendChild(this.options.content);
    }
    
    sheet.appendChild(content);
    this.contentElement = content;

    // Buttons container
    if (this.options.buttons && this.options.buttons.length > 0) {
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'bottom-sheet-buttons';
      
      this.options.buttons.forEach((button, index) => {
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
      
      sheet.appendChild(buttonsContainer);
    }

    this.sheetElement = sheet;
    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);
  }

  /**
   * Attach events
   */
  attachEvents() {
    // Touch events for swipe
    this.sheetElement.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.sheetElement.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.sheetElement.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Handle touch start
   * @param {TouchEvent} e - Touch event
   */
  handleTouchStart(e) {
    this.startY = e.touches[0].clientY;
    this.isDragging = true;
  }

  /**
   * Handle touch move
   * @param {TouchEvent} e - Touch event
   */
  handleTouchMove(e) {
    if (!this.isDragging) return;
    
    this.currentY = e.touches[0].clientY;
    const deltaY = this.currentY - this.startY;
    
    // Only allow downward swipe
    if (deltaY > 0) {
      e.preventDefault();
      this.sheetElement.style.transform = `translateY(${deltaY}px)`;
      this.backdrop.style.opacity = `${1 - deltaY / 300}`;
    }
  }

  /**
   * Handle touch end
   * @param {TouchEvent} e - Touch event
   */
  handleTouchEnd(e) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    const deltaY = this.currentY - this.startY;
    
    // Close if swiped down more than 100px
    if (deltaY > 100) {
      this.close();
    } else {
      // Snap back
      this.sheetElement.style.transform = '';
      this.backdrop.style.opacity = '';
    }
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
   * Open bottom sheet
   */
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    this.backdrop.classList.add('show');
    this.sheetElement.classList.add('show');
    
    // Focus trap
    const firstFocusable = this.sheetElement.querySelector('button, input, textarea, select, a[href]');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  /**
   * Close bottom sheet
   */
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.backdrop.classList.remove('show');
    this.sheetElement.classList.remove('show');
    document.body.style.overflow = '';
    
    setTimeout(() => {
      if (this.options.onClose) {
        this.options.onClose();
      }
    }, 300);
  }

  /**
   * Update content
   * @param {string|HTMLElement} content - New content
   */
  updateContent(content) {
    if (typeof content === 'string') {
      this.contentElement.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.contentElement.innerHTML = '';
      this.contentElement.appendChild(content);
    }
  }

  /**
   * Destroy component
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }
    if (this.sheetElement && this.sheetElement.parentNode) {
      this.sheetElement.parentNode.removeChild(this.sheetElement);
    }
  }
}
