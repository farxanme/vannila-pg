/**
 * Gregorian → Jalali (Persian) calendar conversion.
 * Algorithm aligned with common open implementations (e.g. jalaali-js).
 */

/**
 * @param {number} gy Gregorian year
 * @param {number} gm Gregorian month (1–12)
 * @param {number} gd Gregorian day of month
 * @returns {[number, number, number]} Jalali year, month (1–12), day
 */
export function gregorianToJalali(gy, gm, gd) {
  const gDm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy;
  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    gDm[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jmList = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  let jm = 0;
  for (; jm < 12 && days >= jmList[jm]; jm += 1) {
    days -= jmList[jm];
  }
  const jd = days + 1;
  return [jy, jm + 1, jd];
}

/**
 * Current Jalali year and month from local Gregorian date.
 * @returns {{ year: number, month: number }}
 */
export function getCurrentJalaliYearMonth() {
  const d = new Date();
  const [jy, jm] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return { year: jy, month: jm };
}

/**
 * Map 2-digit card year (last two digits of Jalali year) to full Jalali year.
 * @param {number} yy 0–99
 * @param {number} referenceJalaliYear current or anchor Jalali year
 */
export function resolveJalaliYearFromCardYy(yy, referenceJalaliYear) {
  const century = Math.floor(referenceJalaliYear / 100) * 100;
  let full = century + yy;
  if (full < referenceJalaliYear - 80) {
    full += 100;
  }
  if (full > referenceJalaliYear + 25) {
    full -= 100;
  }
  return full;
}
