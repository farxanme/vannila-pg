/**
 * Side drawer from inline-start (left in LTR, right in RTL), dimmed backdrop, tabs, Escape to close.
 */
import { i18n } from '../utils/i18n.js';
import { appIconHtml } from '../utils/icons.js';

/**
 * @param {string} text
 * @returns {HTMLDivElement}
 */
function buildBodyParagraphs(text) {
  const wrap = document.createElement('div');
  wrap.className = 'drawer-tab-body-inner';
  const parts = String(text || '')
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    return wrap;
  }
  parts.forEach((chunk) => {
    const p = document.createElement('p');
    p.className = 'drawer-tab-paragraph';
    p.textContent = chunk;
    wrap.appendChild(p);
  });
  return wrap;
}

export class Drawer {
  /**
   * @param {object} options
   * @param {string} [options.titleKey]
   * @param {string} [options.title]
   * @param {string} [options.ariaTitleId]
   * @param {string} [options.closeAriaLabelKey]
   * @param {string} [options.tablistAriaLabelKey]
   * @param {{ id?: string, labelKey: string, bodyKey: string }[]} options.tabs
   * @param {() => void} [options.onClose]
   */
  constructor(options = {}) {
    this.options = {
      titleKey: options.titleKey || '',
      title: options.title || '',
      ariaTitleId: options.ariaTitleId || 'drawer-title',
      closeAriaLabelKey: options.closeAriaLabelKey || 'common.close',
      tablistAriaLabelKey: options.tablistAriaLabelKey || '',
      tabs: Array.isArray(options.tabs) ? options.tabs : [],
      onClose: options.onClose || null,
    };

    this.backdrop = null;
    this.panel = null;
    this.titleEl = null;
    this.closeBtn = null;
    /** @type {HTMLButtonElement[]} */
    this.tabButtons = [];
    /** @type {{ panel: HTMLElement, bodyHost: HTMLElement, bodyKey: string }[]} */
    this.tabPanels = [];
    this.activeTabIndex = 0;
    this.isOpen = false;
    /** @type {HTMLElement | null} */
    this.previousFocusEl = null;
    this.bodyOverflow = '';
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundLanguageChange = () => {
      if (this.isOpen || this.backdrop) {
        this.syncI18n();
      }
    };
  }

  /**
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    if (!this.isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
  }

  ensureDom() {
    if (this.backdrop) {
      return;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close();
      }
    });

    const panel = document.createElement('div');
    panel.className = 'drawer-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', this.options.ariaTitleId);

    const header = document.createElement('div');
    header.className = 'drawer-header';

    const title = document.createElement('h2');
    title.id = this.options.ariaTitleId;
    title.className = 'drawer-title';
    this.titleEl = title;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'drawer-close';
    closeBtn.innerHTML = appIconHtml('icn-x.svg', 'drawer-close-icon');
    closeBtn.setAttribute('aria-label', i18n.t(this.options.closeAriaLabelKey));
    closeBtn.addEventListener('click', () => this.close());
    this.closeBtn = closeBtn;

    header.appendChild(title);
    header.appendChild(closeBtn);

    const tablist = document.createElement('div');
    tablist.className = 'drawer-tablist';
    tablist.setAttribute('role', 'tablist');
    if (this.options.tablistAriaLabelKey) {
      tablist.setAttribute('aria-label', i18n.t(this.options.tablistAriaLabelKey));
    }

    const tabsRow = document.createElement('div');
    tabsRow.className = 'drawer-tabs-row';

    const body = document.createElement('div');
    body.className = 'drawer-body';

    this.options.tabs.forEach((tab, index) => {
      const baseId = tab.id || `drawer-tab-${index}`;
      const panelId = `${baseId}-panel`;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'drawer-tab';
      btn.setAttribute('role', 'tab');
      btn.id = `${baseId}-tab`;
      btn.setAttribute('aria-controls', panelId);
      btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      btn.setAttribute('tabindex', index === 0 ? '0' : '-1');
      btn.dataset.labelKey = tab.labelKey;
      btn.addEventListener('click', () => this.selectTab(index));
      tabsRow.appendChild(btn);
      this.tabButtons.push(btn);

      const panel = document.createElement('div');
      panel.className = 'drawer-tab-panel';
      panel.id = panelId;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `${baseId}-tab`);
      panel.hidden = index !== 0;

      const bodyHost = document.createElement('div');
      bodyHost.className = 'drawer-tab-body';
      panel.appendChild(bodyHost);
      body.appendChild(panel);
      this.tabPanels.push({ panel, bodyHost, bodyKey: tab.bodyKey });
    });

    tablist.appendChild(tabsRow);

    panel.appendChild(header);
    panel.appendChild(tablist);
    panel.appendChild(body);

    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);

    this.backdrop = backdrop;
    this.panel = panel;

    document.addEventListener('languageChange', this.boundLanguageChange);
  }

  syncI18n() {
    if (this.titleEl) {
      this.titleEl.textContent = this.options.titleKey
        ? i18n.t(this.options.titleKey)
        : this.options.title || '';
    }
    if (this.closeBtn) {
      this.closeBtn.setAttribute('aria-label', i18n.t(this.options.closeAriaLabelKey));
    }
    const tablist = this.backdrop?.querySelector('.drawer-tablist');
    if (tablist && this.options.tablistAriaLabelKey) {
      tablist.setAttribute('aria-label', i18n.t(this.options.tablistAriaLabelKey));
    }

    this.tabButtons.forEach((btn, index) => {
      const key = btn.dataset.labelKey;
      btn.textContent = key ? i18n.t(key) : '';
      const { bodyHost, bodyKey } = this.tabPanels[index];
      bodyHost.replaceChildren();
      bodyHost.appendChild(buildBodyParagraphs(i18n.t(bodyKey)));
    });
  }

  /**
   * @param {number} index
   */
  selectTab(index) {
    const max = this.tabButtons.length - 1;
    const i = Math.max(0, Math.min(max, index));
    this.activeTabIndex = i;
    this.tabButtons.forEach((btn, j) => {
      const selected = j === i;
      btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      btn.setAttribute('tabindex', selected ? '0' : '-1');
      btn.classList.toggle('drawer-tab-active', selected);
      this.tabPanels[j].panel.hidden = !selected;
    });
  }

  open() {
    this.ensureDom();
    this.syncI18n();
    this.selectTab(0);

    if (this.isOpen) {
      return;
    }

    this.previousFocusEl =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.isOpen = true;
    this.bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    this.backdrop.classList.add('drawer-open');
    document.addEventListener('keydown', this.boundKeyDown);

    window.requestAnimationFrame(() => {
      const focusTarget = this.tabButtons[0] || this.closeBtn;
      focusTarget?.focus?.();
    });
  }

  close() {
    if (!this.isOpen || !this.backdrop) {
      return;
    }

    this.isOpen = false;
    this.backdrop.classList.remove('drawer-open');
    document.removeEventListener('keydown', this.boundKeyDown);
    document.body.style.overflow = this.bodyOverflow || '';

    window.setTimeout(() => {
      if (this.options.onClose) {
        this.options.onClose();
      }
      if (this.previousFocusEl && typeof this.previousFocusEl.focus === 'function') {
        this.previousFocusEl.focus();
      }
      this.previousFocusEl = null;
    }, 280);
  }

  destroy() {
    document.removeEventListener('languageChange', this.boundLanguageChange);
    document.removeEventListener('keydown', this.boundKeyDown);
    if (this.isOpen) {
      this.isOpen = false;
      document.body.style.overflow = this.bodyOverflow || '';
    }
    if (this.backdrop?.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }
    this.backdrop = null;
    this.panel = null;
    this.titleEl = null;
    this.closeBtn = null;
    this.tabButtons = [];
    this.tabPanels = [];
  }
}
