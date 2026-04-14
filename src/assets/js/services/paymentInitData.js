/**
 * Reads SSR-injected payment session values from #payment-init-data (data-* attributes).
 * Server should render this element with the same field names as the former hidden inputs.
 */

const paymentInitDataId = 'payment-init-data';

/** @type {readonly string[]} */
const requiredKeys = Object.freeze([
  'userSessionKey',
  'transactionId',
  'refNum',
  'terminalNumber',
  'salt',
]);

/**
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validatePaymentInitData() {
  const data = getPaymentInitData();
  if (!data) {
    return { valid: false, missing: [...requiredKeys] };
  }
  const missing = requiredKeys.filter((key) => {
    const value = data[key];
    return typeof value !== 'string' || value.trim() === '';
  });
  return { valid: missing.length === 0, missing };
}

/**
 * @returns {object | null}
 */
export function getPaymentInitData() {
  const el = document.getElementById(paymentInitDataId);
  if (!el) return null;
  const ds = el.dataset;
  return {
    userSessionKey: ds.userSessionKey ?? '',
    transactionId: ds.transactionId ?? '',
    refNum: ds.refNum ?? '',
    terminalNumber: ds.terminalNumber ?? '',
    salt: ds.salt ?? '',
  };
}

/**
 * Same shape as backend Data.* for JSON or FormData bodies.
 * @returns {object | null}
 */
export function getPaymentInitDataAsDataPayload() {
  const d = getPaymentInitData();
  if (!d) return null;
  return {
    UserSessionKey: d.userSessionKey,
    TransactionId: d.transactionId,
    RefNum: d.refNum,
    TerminalNumber: d.terminalNumber,
    Salt: d.salt,
  };
}

/**
 * Query string params for IPG GET endpoints (PascalCase as per API).
 * @returns {Record<string, string> | null}
 */
export function getSessionQueryParams() {
  const d = getPaymentInitData();
  if (!d) return null;
  return {
    TransactionId: String(d.transactionId),
    RefNum: d.refNum,
    Salt: d.salt,
    UserSessionKey: d.userSessionKey,
    TerminalNumber: String(d.terminalNumber),
  };
}

/**
 * Session fields for IPG JSON bodies (camelCase as per API).
 * @returns {object | null}
 */
export function getSessionJsonBody() {
  const d = getPaymentInitData();
  if (!d) return null;
  const tid = parseInt(d.transactionId, 10);
  const term = parseInt(d.terminalNumber, 10);
  return {
    transactionId: Number.isNaN(tid) ? d.transactionId : tid,
    refNum: d.refNum,
    salt: d.salt,
    userSessionKey: d.userSessionKey,
    terminalNumber: Number.isNaN(term) ? d.terminalNumber : term,
  };
}
