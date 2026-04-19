const ICON_DIR = '/assets/images/icons';

export function iconUrl(file) {
  return `${ICON_DIR}/${file}`;
}

export function setAppIconFile(el, file) {
  if (!el) return;
  el.style.setProperty('--app-icon-src', `url('${iconUrl(file)}')`);
}

export function createAppIcon(file, extraClass = '') {
  const span = document.createElement('span');
  span.className = ['app-icon', extraClass].filter(Boolean).join(' ');
  setAppIconFile(span, file);
  span.setAttribute('aria-hidden', 'true');
  return span;
}

/** Static HTML / template literals (trusted paths only). */
export function appIconHtml(file, extraClass = '') {
  const cls = ['app-icon', extraClass].filter(Boolean).join(' ');
  return `<span class="${cls}" style="--app-icon-src:url('${iconUrl(file)}')" aria-hidden="true"></span>`;
}
