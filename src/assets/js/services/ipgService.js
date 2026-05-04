/**
 * SEP IPG REST API (v2) — transaction, cards, OTP, pay, receipt redirect.
 */
import { getIpgBaseUrl, useIpgMock } from '../config/env.js';
import { getSessionQueryParams, getSessionJsonBody } from './paymentInitData.js';
import {
  mockGetTransactionResponse,
  mockGetUserCardsResponse,
  mockGetBankBinsResponse,
  mockSendOtpResponse,
  mockPayTransactionResponse,
  mockReceiptRedirectParamsResponse,
  mockCancelTransactionResponse,
  mockDeActiveUserCardResponse,
  mockDelay,
} from '../mocks/ipgMocks.js';

const IPG_SUCCESS = 2000;

/**
 * @param {string} path - path under /v2/ipg (e.g. '/transaction')
 * @param {RequestInit} init
 */
async function ipgFetch(path, init = {}) {
  const base = getIpgBaseUrl();
  if (!base) {
    throw new Error('IPG base URL is not configured');
  }
  const url = `${base}/v2/ipg${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...init.headers,
  };
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.statusTitle || json.message || `HTTP ${res.status}`);
  }
  if (json.statusCode !== undefined && json.statusCode !== IPG_SUCCESS) {
    const msg = json.validationErrors?.length
      ? json.validationErrors.map((e) => e.message || e).join(', ')
      : json.statusTitle || 'Request failed';
    throw new Error(msg);
  }
  return json;
}

async function ipgFetchText(path, init = {}) {
  const base = getIpgBaseUrl();
  if (!base) {
    throw new Error('IPG base URL is not configured');
  }
  const url = `${base}/v2/ipg${path}`;
  const headers = {
    ...init.headers,
  };
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.text();
}

function parseBankBinsScript(payload) {
  if (!payload) return [];
  const raw = String(payload);
  const arrayMatch = raw.match(/panBins\s*=\s*(\[[\s\S]*?\])/);
  if (!arrayMatch || !arrayMatch[1]) return [];
  const arrayLiteral = arrayMatch[1];
  try {
    // First attempt: strict JSON-like payloads
    return JSON.parse(arrayLiteral.replace(/'/g, '"'));
  } catch {
    try {
      // Fallback: JS object literal payloads (unquoted keys, trailing commas, etc.)
      const parser = new Function(`return (${arrayLiteral});`);
      const result = parser();
      return Array.isArray(result) ? result : [];
    } catch {
      return [];
    }
  }
}

function requireSessionQuery() {
  const q = getSessionQueryParams();
  if (!q) {
    throw new Error('Payment session is missing');
  }
  return q;
}

function requireSessionBody() {
  const b = getSessionJsonBody();
  if (!b) {
    throw new Error('Payment session is missing');
  }
  return b;
}

function toQueryString(params) {
  return new URLSearchParams(params).toString();
}

/**
 * GET /transaction — transaction + merchant + appSettings
 */
export async function getTransaction() {
  if (useIpgMock()) {
    await mockDelay();
    return mockGetTransactionResponse;
  }
  const q = requireSessionQuery();
  return ipgFetch(`/transaction?${toQueryString(q)}`, { method: 'GET' });
}

/**
 * GET /user/cards — saved cards for session
 */
export async function getUserCards() {
  if (useIpgMock()) {
    await mockDelay();
    return mockGetUserCardsResponse;
  }
  const q = requireSessionQuery();
  return ipgFetch(`/user/cards?${toQueryString(q)}`, { method: 'GET' });
}

/**
 * GET /base-data/bank-bins.js — BIN list for bank detection
 */
export async function getBankBins() {
  if (useIpgMock()) {
    await mockDelay();
    return mockGetBankBinsResponse;
  }
  const scriptText = await ipgFetchText('/base-data/bank-bins.js', { method: 'GET' });
  return parseBankBinsScript(scriptText);
}

/**
 * POST /transaction/otp — request OTP (dynamic PIN)
 * @param {object} body - pan, cardId, cardRegisteredType, bill, etc.
 * @param {{ captchaToken: string, captchaResponse: string }} captchaHeaders
 */
export async function sendTransactionOtp(body, captchaHeaders = {}) {
  if (useIpgMock()) {
    await mockDelay();
    return mockSendOtpResponse;
  }
  const session = requireSessionBody();
  const payload = { ...session, ...body };
  return ipgFetch('/transaction/otp', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      CaptchaToken: captchaHeaders.captchaToken,
      CaptchaResponse: captchaHeaders.captchaResponse,
    },
  });
}

/**
 * POST /transaction/pay — pay
 * @param {object} body - pan, cvv2, expiryDate, pin2, saveCardAfterPay, cellNumber, email, ...
 * @param {{ captchaToken: string, captchaResponse: string }} captchaHeaders
 */
export async function payTransaction(body, captchaHeaders = {}) {
  if (useIpgMock()) {
    await mockDelay();
    return mockPayTransactionResponse;
  }
  const session = requireSessionBody();
  const payload = { ...session, ...body };
  return ipgFetch('/transaction/pay', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      CaptchaToken: captchaHeaders.captchaToken,
      CaptchaResponse: captchaHeaders.captchaResponse,
    },
  });
}

/**
 * GET /transaction/receipt/redirect-params — merchant return URL + receipt tokens
 */
export async function getReceiptRedirectParams() {
  if (useIpgMock()) {
    await mockDelay();
    return mockReceiptRedirectParamsResponse;
  }
  const q = requireSessionQuery();
  return ipgFetch(`/transaction/receipt/redirect-params?${toQueryString(q)}`, { method: 'GET' });
}

/**
 * POST /transaction/cancel — cancel current payment session.
 */
export async function cancelTransaction() {
  if (useIpgMock()) {
    await mockDelay();
    return mockCancelTransactionResponse;
  }
  const session = requireSessionBody();
  return ipgFetch('/transaction/cancel', {
    method: 'POST',
    body: JSON.stringify(session),
  });
}

/**
 * POST /user/cards/de-active — remove saved card for session (cardRegisteredType must be 1).
 * @param {{ cardId: number, cardRegisteredType: number }} cardFields
 */
export async function deActiveUserCard(cardFields) {
  if (useIpgMock()) {
    await mockDelay();
    return mockDeActiveUserCardResponse;
  }
  const session = requireSessionBody();
  const payload = { ...session, ...cardFields };
  return ipgFetch('/user/cards/de-active', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
