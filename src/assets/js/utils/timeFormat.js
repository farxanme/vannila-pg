/**
 * Parse "HH:MM:SS" time span to total seconds (used for API timeouts).
 * @param {string} timeSpan
 * @param {number} [fallbackSeconds=900]
 * @returns {number}
 */
export function parseTimeSpanToSeconds(timeSpan, fallbackSeconds = 900) {
  if (!timeSpan || typeof timeSpan !== 'string') return fallbackSeconds;
  const parts = timeSpan.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return fallbackSeconds;
}

/**
 * Format seconds as MM:SS (OTP cooldown display).
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatSecondsAsMmSs(totalSeconds) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}
