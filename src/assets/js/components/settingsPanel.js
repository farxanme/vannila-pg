/**
 * Gateway settings: grouped sections (theme, future: notifications, …).
 * Single group: always expanded, no collapse UI.
 * Multiple groups: accordion, all panels collapsed by default.
 */

import { createAppIcon, iconUrl } from '../utils/icons.js';

export function getSettingsGroupDescriptors() {
  return [
    { id: 'theme', titleKey: 'settings.theme' },
    // Add more entries here (e.g. notifications). With 2+ groups, accordion + all-closed UI applies.
  ];
}

function getThemeOptionIconFile(mode) {
  if (mode === 'light') return 'icn-sun.svg';
  if (mode === 'dark') return 'icn-moon.svg';
  return 'icn-display.svg';
}

const themeModeDefs = [
  { value: 'light', i18nKey: 'settings.theme.light' },
  { value: 'dark', i18nKey: 'settings.theme.dark' },
  { value: 'system', i18nKey: 'settings.theme.system' },
];

/**
 * @param {object} options
 * @param {string} [options.labelledById]
 * @param {() => string} options.getThemePreference
 * @param {(mode: string) => void} options.setThemePreference
 * @param {object} options.i18n - i18n instance with .t()
 * @param {() => void} [options.onThemePicked]
 */
export function createThemeRadiogroup(options) {
  const { labelledById, getThemePreference, setThemePreference, i18n, onThemePicked } = options;

  const radiogroup = document.createElement('div');
  radiogroup.setAttribute('role', 'radiogroup');
  if (labelledById) {
    radiogroup.setAttribute('aria-labelledby', labelledById);
  }

  const themeButtons = [];

  const syncThemeSelection = () => {
    const pref = getThemePreference();
    themeButtons.forEach(({ el, value }) => {
      el.setAttribute('aria-checked', pref === value ? 'true' : 'false');
    });
  };

  themeModeDefs.forEach(({ value, i18nKey }) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'settings-theme-option';
    row.setAttribute('role', 'radio');
    row.setAttribute('aria-checked', 'false');
    const check = document.createElement('span');
    check.className = 'settings-theme-check';
    check.setAttribute('aria-hidden', 'true');
    const icon = document.createElement('span');
    icon.className = 'settings-theme-icon';
    icon.setAttribute('aria-hidden', 'true');
    const glyph = document.createElement('span');
    glyph.className = 'app-icon settings-theme-icon-inner';
    glyph.style.setProperty('--app-icon-src', `url('${iconUrl(getThemeOptionIconFile(value))}')`);
    glyph.setAttribute('aria-hidden', 'true');
    icon.appendChild(glyph);
    const label = document.createElement('span');
    label.setAttribute('data-i18n', i18nKey);
    label.textContent = i18n.t(i18nKey);
    row.appendChild(icon);
    row.appendChild(label);
    row.appendChild(check);
    row.onclick = (e) => {
      e.stopPropagation();
      setThemePreference(value);
      syncThemeSelection();
      onThemePicked?.();
    };
    themeButtons.push({ el: row, value });
    radiogroup.appendChild(row);
  });

  syncThemeSelection();
  return { radiogroup, themeButtons, syncThemeSelection };
}

/**
 * Build group body node for a descriptor. Extend when adding new group types.
 */
export function buildSettingsGroupBody(descriptor, ctx) {
  const { menuId, i18n, getThemePreference, setThemePreference, onThemePicked } = ctx;

  if (descriptor.id === 'theme') {
    const labelledById = ctx.themeLabelledById || `${menuId}-section-theme`;
    return createThemeRadiogroup({
      labelledById,
      getThemePreference,
      setThemePreference,
      i18n,
      onThemePicked,
    });
  }

  const placeholder = document.createElement('div');
  placeholder.className = 'settings-group-placeholder';
  placeholder.setAttribute('data-settings-group', descriptor.id);
  return { radiogroup: placeholder, themeButtons: [], syncThemeSelection: () => {} };
}

/**
 * Mount groups into container (dropdown menu or bottom sheet body).
 * @param {HTMLElement} container
 * @param {object} ctx
 */
export function mountSettingsGroupsLayout(container, ctx) {
  const { menuId, i18n, descriptors, accordion, buildBody } = ctx;

  container.textContent = '';

  if (!accordion) {
    const only = descriptors[0];
    const heading = document.createElement('div');
    heading.className = 'settings-dropdown-section-heading';
    if (only.id === 'theme') {
      heading.appendChild(createAppIcon('icn-brush.svg', 'settings-section-heading-icon app-icon-muted'));
    }
    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'settings-dropdown-section-title';
    sectionTitle.id = `${menuId}-section-${only.id}`;
    sectionTitle.setAttribute('data-i18n', only.titleKey);
    sectionTitle.textContent = i18n.t(only.titleKey);
    heading.appendChild(sectionTitle);

    const body = buildBody(only, { ...ctx, themeLabelledById: sectionTitle.id });
    container.appendChild(heading);
    container.appendChild(body.radiogroup);
    return { bodies: [body] };
  }

  const root = document.createElement('div');
  root.className = 'settings-groups settings-groups-accordion';

  const bodies = [];

  descriptors.forEach((desc) => {
    const section = document.createElement('div');
    section.className = 'settings-group';

    const headerId = `${menuId}-heading-${desc.id}`;
    const panelId = `${menuId}-panel-${desc.id}`;

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'settings-group-header';
    header.id = headerId;
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('aria-controls', panelId);

    const titleSpan = document.createElement('span');
    titleSpan.className = 'settings-group-header-text';
    titleSpan.setAttribute('data-i18n', desc.titleKey);
    titleSpan.textContent = i18n.t(desc.titleKey);

    if (desc.id === 'theme') {
      header.appendChild(createAppIcon('icn-brush.svg', 'settings-group-header-icon app-icon-muted'));
    }

    const chevron = document.createElement('span');
    chevron.className = 'settings-group-header-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>`;

    header.appendChild(titleSpan);
    header.appendChild(chevron);

    const panel = document.createElement('div');
    panel.className = 'settings-group-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', headerId);
    panel.hidden = true;

    const body = buildBody(desc, { ...ctx, themeLabelledById: headerId });
    bodies.push(body);
    panel.appendChild(body.radiogroup);

    header.addEventListener('click', () => {
      const open = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.hidden = open;
    });

    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });

    section.appendChild(header);
    section.appendChild(panel);
    root.appendChild(section);
  });

  container.appendChild(root);
  return { bodies };
}
