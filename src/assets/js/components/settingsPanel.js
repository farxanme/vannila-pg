/**
 * Gateway settings: grouped sections (theme, future: notifications, …).
 * Single group: always expanded, no collapse UI.
 * Multiple groups: accordion, all panels collapsed by default.
 */

export function getSettingsGroupDescriptors() {
  return [
    { id: 'theme', titleKey: 'settings.theme' },
    // Add more entries here (e.g. notifications). With 2+ groups, accordion + all-closed UI applies.
  ];
}

function getThemeOptionIconSvg(mode) {
  if (mode === 'light') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Zm0 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-5a1 1 0 1 1 0 2h-1.5a1 1 0 1 1 0-2H20ZM6.5 11a1 1 0 1 1 0 2H5a1 1 0 1 1 0-2h1.5Zm9.07-4.66a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 1 1-1.41 1.41L15.57 7.75a1 1 0 0 1 0-1.41Zm-7.14 7.14a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 1 1-1.41 1.41L8.43 14.9a1 1 0 0 1 0-1.41Zm8.2 2.47a1 1 0 0 1 1.41 0 1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 1 1-1.41-1.41l1.06-1.06Zm-7.14-7.14a1 1 0 0 1 1.41-1.41 1 1 0 0 1 0 1.41L8.84 9.88a1 1 0 1 1-1.41-1.41l1.06-1.06Z"/></svg>';
  }
  if (mode === 'dark') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.6 2.4a1 1 0 0 1 .7 1.68 7.5 7.5 0 1 0 8.62 8.62 1 1 0 0 1 1.68.7A9.5 9.5 0 1 1 14.6 2.4Z"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15h-11A2.5 2.5 0 0 1 4 12.5v-7Zm2.5-.5a.5.5 0 0 0-.5.5v7c0 .28.22.5.5.5h11a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-11ZM8 19a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Z"/></svg>';
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
    icon.innerHTML = getThemeOptionIconSvg(value);
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
    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'settings-dropdown-section-title';
    sectionTitle.id = `${menuId}-section-${only.id}`;
    sectionTitle.setAttribute('data-i18n', only.titleKey);
    sectionTitle.textContent = i18n.t(only.titleKey);

    const body = buildBody(only, { ...ctx, themeLabelledById: sectionTitle.id });
    container.appendChild(sectionTitle);
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
