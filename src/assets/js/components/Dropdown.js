/**
 * Dropdown Component for Input
 */
export class Dropdown {
  constructor(inputElement, options = {}) {
    this.inputElement = typeof inputElement === 'string' ? document.querySelector(inputElement) : inputElement;
    this.options = {
      items: options.items || [],
      onSelect: options.onSelect || null,
      searchable: options.searchable || false,
      placeholder: options.placeholder || 'Select...',
      maxHeight: options.maxHeight || '200px',
      ...options
    };
    
    this.isOpen = false;
    this.filteredItems = [...this.options.items];
    this.init();
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

    // Insert after input
    if (this.inputElement.parentNode) {
      this.inputElement.parentNode.insertBefore(dropdown, this.inputElement.nextSibling);
    } else {
      document.body.appendChild(dropdown);
    }
    
    this.dropdownElement = dropdown;
    this.renderItems();
  }

  /**
   * Render items
   */
  renderItems() {
    this.listElement.innerHTML = '';
    
    if (this.filteredItems.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'dropdown-empty';
      empty.textContent = 'No items found';
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
      }
      
      li.addEventListener('click', () => {
        this.selectItem(item);
      });
      
      this.listElement.appendChild(li);
    });
  }

  /**
   * Filter items
   * @param {string} query - Search query
   */
  filterItems(query) {
    const lowerQuery = query.toLowerCase();
    this.filteredItems = this.options.items.filter(item => {
      const text = typeof item === 'string' ? item : (item.text || item.value || '');
      return text.toLowerCase().includes(lowerQuery);
    });
    this.renderItems();
  }

  /**
   * Select item
   * @param {*} item - Selected item
   */
  selectItem(item) {
    const value = typeof item === 'string' ? item : (item.value || '');
    const text = typeof item === 'string' ? item : (item.text || value);
    
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
    
    const rect = this.inputElement.getBoundingClientRect();
    const dropdownRect = this.dropdownElement.getBoundingClientRect();
    
    // Position below input
    this.dropdownElement.style.top = `${rect.bottom + window.scrollY}px`;
    this.dropdownElement.style.left = `${rect.left + window.scrollX}px`;
    this.dropdownElement.style.width = `${rect.width}px`;
    
    // Check if dropdown goes off screen
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    if (spaceBelow < dropdownRect.height && spaceAbove > dropdownRect.height) {
      // Position above
      this.dropdownElement.style.top = `${rect.top + window.scrollY - dropdownRect.height}px`;
    }
  }

  /**
   * Handle outside click
   * @param {Event} e - Click event
   */
  handleOutsideClick = (e) => {
    if (!this.dropdownElement.contains(e.target) && 
        !this.inputElement.contains(e.target)) {
      this.close();
    }
  }

  /**
   * Attach events
   */
  attachEvents() {
    // Open on input focus
    if (this.inputElement) {
      this.inputElement.addEventListener('focus', () => {
        if (this.options.autoOpen !== false) {
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
  }

  /**
   * Destroy component
   */
  destroy() {
    document.removeEventListener('click', this.handleOutsideClick);
    if (this.dropdownElement && this.dropdownElement.parentNode) {
      this.dropdownElement.parentNode.removeChild(this.dropdownElement);
    }
  }
}
