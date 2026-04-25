/**
 * Dropdown Component for Input
 */
export class Dropdown {
  constructor(inputElement, options = {}) {
    this.inputElement =
      typeof inputElement === 'string' ? document.querySelector(inputElement) : inputElement;
    this.options = {
      items: options.items || [],
      onSelect: options.onSelect || null,
      searchable: options.searchable || false,
      footerButtons: options.footerButtons || [],
      emptyState: options.emptyState || null,
      placeholder: options.placeholder || 'Select...',
      maxHeight: options.maxHeight || '200px',
      ...options,
      /** When true, do not auto-open on focus on viewports below 769px (e.g. mobile bottom sheet). */
      desktopOnlyAutoOpen: options.desktopOnlyAutoOpen ?? false,
      /** When true, only auto-open on focus if the input value is empty (card picker UX). */
      openOnFocusWhenInputEmpty: options.openOnFocusWhenInputEmpty ?? false,
    };

    this.isOpen = false;
    /** When true, next focus on the linked input will not auto-open (e.g. after "add new card"). */
    this.skipNextFocusOpen = false;
    this.filteredItems = [...this.options.items];
    this.boundCloseOnResize = this.closeOnResize.bind(this);
    window.addEventListener('resize', this.boundCloseOnResize);
    this.init();
  }

  /**
   * Close when viewport is resized (position and width are invalid).
   */
  closeOnResize() {
    if (this.isOpen) {
      this.close();
    }
  }

  /**
   * Initialize dropdown
   */
  init() {
    this.createDropdown();
    this.attachEvents();
  }

  /**
   * Create dropdown HTML
   */
  createDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    dropdown.style.display = 'none';
    dropdown.style.position = 'absolute';
    dropdown.style.zIndex = '1000';

    if (this.options.searchable) {
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'dropdown-search';
      searchInput.placeholder = 'Search...';
      searchInput.addEventListener('input', (e) => {
        this.filterItems(e.target.value);
      });
      dropdown.appendChild(searchInput);
      this.searchInput = searchInput;
    }

    const list = document.createElement('ul');
    list.className = 'dropdown-list';
    list.style.maxHeight = this.options.maxHeight;
    dropdown.appendChild(list);
    this.listElement = list;

    const footer = document.createElement('div');
    footer.className = 'dropdown-footer';
    dropdown.appendChild(footer);
    this.footerElement = footer;

    // Find input wrapper (input-wrapper) and append dropdown to it
    let wrapper = this.inputElement.closest('.input-wrapper');
    if (!wrapper) {
      wrapper = this.inputElement.parentNode;
    }

    if (wrapper) {
      // Make wrapper position relative if not already
      const computedStyle = window.getComputedStyle(wrapper);
      if (computedStyle.position === 'static') {
        wrapper.style.position = 'relative';
      }
      wrapper.appendChild(dropdown);
    } else {
      document.body.appendChild(dropdown);
    }

    this.dropdownElement = dropdown;
    this.renderItems();
    this.renderFooterButtons();
  }

  /**
   * Render items
   */
  renderItems() {
    this.listElement.innerHTML = '';

    if (this.filteredItems.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'dropdown-empty';
      const emptyState = this.options.emptyState;
      if (typeof emptyState === 'function') {
        const rendered = emptyState();
        if (rendered instanceof HTMLElement) {
          empty.appendChild(rendered);
        } else if (typeof rendered === 'string' && rendered.trim().length > 0) {
          empty.innerHTML = rendered;
        } else {
          empty.textContent = 'No items found';
        }
      } else if (typeof emptyState === 'string' && emptyState.trim().length > 0) {
        empty.innerHTML = emptyState;
      } else {
        empty.textContent = 'No items found';
      }
      this.listElement.appendChild(empty);
      return;
    }

    this.filteredItems.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'dropdown-item';
      li.dataset.index = index;

      if (typeof item === 'string') {
        li.textContent = item;
        li.dataset.value = item;
      } else {
        li.innerHTML = item.html || item.text || '';
        li.dataset.value = item.value || '';
        if (item.icon) {
          const icon = document.createElement('span');
          icon.className = 'dropdown-item-icon';
          icon.innerHTML = item.icon;
          li.insertBefore(icon, li.firstChild);
        }
        if (typeof item.onRender === 'function') {
          item.onRender(li, this);
        }
      }

      li.addEventListener('click', () => {
        this.selectItem(item);
      });

      this.listElement.appendChild(li);
    });
  }

  renderFooterButtons() {
    if (!this.footerElement) return;
    this.footerElement.innerHTML = '';
    const buttons = Array.isArray(this.options.footerButtons) ? this.options.footerButtons : [];
    if (buttons.length === 0) {
      this.footerElement.style.display = 'none';
      return;
    }
    this.footerElement.style.display = 'flex';
    buttons.forEach((buttonDef) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `dropdown-footer-btn ${buttonDef.className || ''}`.trim();
      button.innerHTML = `
        ${buttonDef.icon ? `<span class="dropdown-footer-btn-icon" aria-hidden="true">${buttonDef.icon}</span>` : ''}
        <span class="dropdown-footer-btn-text">${buttonDef.text || ''}</span>
      `;
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (typeof buttonDef.onClick === 'function') {
          buttonDef.onClick(this);
        }
      });
      this.footerElement.appendChild(button);
    });
  }

  /**
   * Filter items
   * @param {string} query - Search query
   */
  filterItems(query) {
    const lowerQuery = query.toLowerCase();
    this.filteredItems = this.options.items.filter((item) => {
      const text = typeof item === 'string' ? item : item.text || item.value || '';
      return text.toLowerCase().includes(lowerQuery);
    });
    this.renderItems();
  }

  /**
   * Select item
   * @param {*} item - Selected item
   */
  selectItem(item) {
    const value = typeof item === 'string' ? item : item.value || '';
    const text = typeof item === 'string' ? item : item.text || value;

    if (this.inputElement) {
      this.inputElement.value = text;
      this.inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (this.options.onSelect) {
      this.options.onSelect(item, value);
    }

    this.close();
  }

  /**
   * Open dropdown
   */
  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.dropdownElement.style.display = 'block';
    this.renderItems();

    // Position dropdown
    this.positionDropdown();

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick);
    }, 0);
  }

  /**
   * Close dropdown
   */
  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.dropdownElement.style.display = 'none';
    document.removeEventListener('click', this.handleOutsideClick);

    if (this.searchInput) {
      this.searchInput.value = '';
      this.filterItems('');
    }
  }

  /**
   * Toggle dropdown
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Position dropdown
   */
  positionDropdown() {
    if (!this.inputElement) return;

    // Find input container (input-container) or input element
    const inputContainer = this.inputElement.closest('.input-container');
    const actualInput = this.inputElement.querySelector('input') || this.inputElement;
    const targetElement = inputContainer || actualInput;

    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const wrapper = this.dropdownElement.parentElement;
    if (!wrapper) return;

    const wrapperRect = wrapper.getBoundingClientRect();

    // Calculate position relative to wrapper
    const topOffset = rect.bottom - wrapperRect.top;
    const leftOffset = rect.left - wrapperRect.left;

    // Position below input container
    this.dropdownElement.style.top = `${topOffset}px`;
    this.dropdownElement.style.left = `${leftOffset}px`;
    this.dropdownElement.style.width = `${rect.width}px`;

    // Check if dropdown goes off screen
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = this.dropdownElement.offsetHeight || 200;

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      // Position above
      const topOffsetAbove = rect.top - wrapperRect.top - dropdownHeight;
      this.dropdownElement.style.top = `${topOffsetAbove}px`;
    }
  }

  /**
   * Handle outside click
   * @param {Event} e - Click event
   */
  handleOutsideClick = (e) => {
    const wrapper = this.inputElement.closest('.input-wrapper') || this.inputElement.parentNode;
    if (!this.dropdownElement.contains(e.target) && !wrapper.contains(e.target)) {
      this.close();
    }
  };

  /**
   * Attach events
   */
  attachEvents() {
    // Find the actual input element if wrapper was passed
    const actualInput = this.inputElement.querySelector('input') || this.inputElement;

    // Open on input focus
    if (actualInput && actualInput.tagName === 'INPUT') {
      actualInput.addEventListener('focus', () => {
        if (this.skipNextFocusOpen) {
          this.skipNextFocusOpen = false;
          return;
        }
        if (this.options.autoOpen !== false) {
          if (
            this.options.desktopOnlyAutoOpen &&
            !window.matchMedia('(min-width: 769px)').matches
          ) {
            return;
          }
          if (this.options.openOnFocusWhenInputEmpty) {
            const v = (actualInput.value || '').trim();
            if (v.length > 0) {
              return;
            }
          }
          this.open();
        }
      });
    }
  }

  /**
   * Update items
   * @param {Array} items - New items
   */
  updateItems(items) {
    this.options.items = items;
    this.filteredItems = [...items];
    this.renderItems();
    this.renderFooterButtons();
  }

  /**
   * Destroy component
   */
  destroy() {
    window.removeEventListener('resize', this.boundCloseOnResize);
    document.removeEventListener('click', this.handleOutsideClick);
    if (this.dropdownElement && this.dropdownElement.parentNode) {
      this.dropdownElement.parentNode.removeChild(this.dropdownElement);
    }
  }
}
