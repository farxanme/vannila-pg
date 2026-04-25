/**
 * Theme preference: light, dark, or system (day/night by local clock).
 * System schedule: light 06:00–18:00 local time, dark otherwise.
 */
const storageKey = 'app_theme';
const validModes = ['light', 'dark', 'system'];

/** @returns {'light'|'dark'|'system'} */
export function getThemePreference() {
  const raw = localStorage.getItem(storageKey);
  if (raw && validModes.includes(raw)) {
    return raw;
  }
  return 'light';
}

/**
 * Effective theme from local clock when preference is "system".
 * @returns {'light'|'dark'}
 */
export function getSystemThemeByClock(date = new Date()) {
  const hour = date.getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

/**
 * Resolved UI theme (always light or dark).
 * @returns {'light'|'dark'}
 */
export function getResolvedTheme() {
  const pref = getThemePreference();
  if (pref === 'light') return 'light';
  if (pref === 'dark') return 'dark';
  return getSystemThemeByClock();
}

export function applyThemeToDocument() {
  const resolved = getResolvedTheme();
  if (resolved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = 'light';
  }
}

/**
 * @param {'light'|'dark'|'system'} mode
 */
export function setThemePreference(mode) {
  if (!validModes.includes(mode)) return;
  localStorage.setItem(storageKey, mode);
  applyThemeToDocument();
  window.dispatchEvent(new CustomEvent('themePreferenceChange', { detail: { mode } }));
  scheduleSystemTick();
}

let tickId = null;

function scheduleSystemTick() {
  if (tickId != null) {
    clearInterval(tickId);
    tickId = null;
  }
  if (getThemePreference() !== 'system') return;
  tickId = window.setInterval(() => {
    applyThemeToDocument();
  }, 60_000);
}

export function initTheme() {
  applyThemeToDocument();
  scheduleSystemTick();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      applyThemeToDocument();
    }
  });
}
