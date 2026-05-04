/**
 * Transaction `appSettings.prCodesPanLimits`: allow-list by PAN product segment (digits 7–8, 1-based).
 */

function parseMaskedPanLeadTail(securePan) {
  if (!securePan || typeof securePan !== 'string') {
    return { lead: '', tail: '', tailStart: 0, totalLen: 0 };
  }
  const raw = securePan
    .replace(/\s/g, '')
    .replace(/●/g, '*')
    .replace(/#/g, '*')
    .replace(/[^\d*]/g, '');
  let i = 0;
  let lead = '';
  while (i < raw.length && raw[i] !== '*') {
    lead += raw[i];
    i += 1;
  }
  let maskLen = 0;
  while (i < raw.length && raw[i] === '*') {
    maskLen += 1;
    i += 1;
  }
  let tail = '';
  while (i < raw.length && raw[i] !== '*') {
    tail += raw[i];
    i += 1;
  }
  const totalLen = lead.length + maskLen + tail.length;
  const tailStart = lead.length + maskLen;
  return { lead, tail, tailStart, totalLen };
}

/**
 * Normalize a PAN product code entry for comparison (digits only, two-digit segment).
 * @param {unknown} segment
 * @returns {string}
 */
export function normalizePanProductSegment(segment) {
  if (segment == null) return '';
  const s = String(segment).replace(/\D/g, '');
  if (s.length === 0) return '';
  if (s.length === 1) return s.padStart(2, '0');
  return s.slice(0, 2);
}

/**
 * Two-digit PAN product code from digits 7–8 (1-based) of a full digit string.
 * @param {string} digits
 * @returns {string|null}
 */
export function getPanPrCodeFromDigitString(digits) {
  const d = String(digits || '').replace(/\D/g, '');
  if (d.length < 8) return null;
  const seg = normalizePanProductSegment(d.slice(6, 8));
  return seg || null;
}

/**
 * From saved-card `securePan` (masked or 16-digit). Returns null when digits 7–8 are not visible.
 * @param {string} securePan
 * @returns {string|null}
 */
export function getPanPrCodeFromSecurePan(securePan) {
  if (!securePan || typeof securePan !== 'string') return null;
  const noSpace = securePan.replace(/\s/g, '');
  if (/^\d{16}$/.test(noSpace)) {
    return getPanPrCodeFromDigitString(noSpace);
  }
  const { lead, totalLen } = parseMaskedPanLeadTail(securePan);
  if (totalLen !== 16 || lead.length < 8) return null;
  const seg = normalizePanProductSegment(lead.slice(6, 8));
  return seg || null;
}

/**
 * @param {unknown} panProductCodes
 * @returns {Set<string>}
 */
export function buildPanProductAllowedSet(panProductCodes) {
  const set = new Set();
  if (!Array.isArray(panProductCodes)) return set;
  for (const entry of panProductCodes) {
    const norm = normalizePanProductSegment(entry);
    if (norm) set.add(norm);
  }
  return set;
}

/**
 * Active restriction when limits object is present, `prCode` matches the transaction, and allow-list is non-empty.
 * @param {number|null} transactionPrCode
 * @param {unknown} limits
 * @returns {null | { allowedPanPrCodes: Set<string>, title: string, titleEn: string }}
 */
export function resolveActivePanProductRestriction(transactionPrCode, limits) {
  if (limits == null || typeof limits !== 'object') return null;
  const codes = limits.PanProductCodes ?? limits.panProductCodes;
  if (!Array.isArray(codes) || codes.length === 0) return null;
  const limitPr = Number(limits.prCode);
  if (!Number.isFinite(limitPr)) return null;
  const txPr =
    typeof transactionPrCode === 'number' && !Number.isNaN(transactionPrCode)
      ? transactionPrCode
      : null;
  if (txPr == null || txPr !== limitPr) return null;
  const allowed = buildPanProductAllowedSet(codes);
  if (allowed.size === 0) return null;
  const title = typeof limits.title === 'string' ? limits.title.trim() : '';
  const titleEn = typeof limits.titleEn === 'string' ? limits.titleEn.trim() : '';
  return { allowedPanPrCodes: allowed, title, titleEn };
}

/**
 * @param {string|null|undefined} panPrCode
 * @param {Set<string>} allowedSet
 * @returns {boolean}
 */
export function isPanPrCodeInAllowedSet(panPrCode, allowedSet) {
  if (panPrCode == null || !allowedSet || allowedSet.size === 0) return false;
  const norm = normalizePanProductSegment(panPrCode);
  if (!norm) return false;
  return allowedSet.has(norm);
}
