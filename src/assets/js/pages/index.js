/**
 * Index Page Script
 */
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Input } from '../components/Input.js';
import { Dropdown } from '../components/Dropdown.js';
import { VirtualPinPad } from '../components/VirtualPinPad.js';
import { Timer } from '../classes/Timer.js';
import { LoadingScreen } from '../components/LoadingScreen.js';
import { PaymentInitErrorScreen } from '../components/PaymentInitErrorScreen.js';
import {
  validateCardNumber,
  validateMobile,
  validateEmail,
  validateOTP,
  validateExpiryDate,
} from '../utils/validators.js';
import {
  detectBank,
  formatCardNumber,
  getBankLogo,
  getLocalizedBankName,
} from '../utils/bankDetector.js';
import {
  convertToEnglishNumbers,
  extractNumbers,
  numberToWordsByLang,
} from '../utils/numberConverter.js';
import { getNumberLocaleForLang } from '../utils/localeHelpers.js';
import { parseTimeSpanToSeconds, formatSecondsAsMmSs } from '../utils/timeFormat.js';
import { resolveMerchantLogoUrl } from '../utils/merchantAssets.js';
import { getTransactionTypeInfo } from '../utils/transactionType.js';
import { dataStore } from '../services/dataStore.js';
import { cardService } from '../services/cardService.js';
import { getPaymentInitData, validatePaymentInitData } from '../services/paymentInitData.js';
import {
  getCaptchaCodeLength,
  getDefaultLockCardNumberDuringOtpCooldown,
  getOtpLengthConfig,
} from '../config/env.js';
import { fetchCaptcha, fetchCaptchaAudio } from '../services/captchaService.js';
import * as ipgService from '../services/ipgService.js';
import { i18n } from '../main.js';
import { errorHandler } from '../utils/errorHandler.js';
import { soundManager } from '../utils/sound.js';
import { Modal } from '../components/Modal.js';
import { shareContent, downloadElementAsPng } from '../utils/share.js';
import { appIconHtml, createAppIcon, setAppIconFile } from '../utils/icons.js';

// Initialize sound manager
soundManager.init();

// Initialize components
let header,
  footer,
  timer,
  cardNumberInput,
  cvv2Input,
  expiryMonthInput,
  expiryYearInput,
  /** Composite: validate, clearValidation, setValue, focus, element (first field). */
  expiryDateInput,
  captchaInput,
  otpInput,
  mobileInput,
  emailInput;
let cardDropdown, cvv2PinPad, otpPinPad;
let cardList = [];
/** True after getCards() returns a valid array in `Data` (may be empty). */
let cardListLoadSucceeded = false;
let cardListSheetRef = null;
/** Set in initializeFormInputs when the mobile card list sheet is available. */
let openCardListSheetFn = null;
let otpLabelElement = null;
let captchaLabelElement = null;
let isCurrentGiftCard = false;
let isExpiryDateLockedFromCard = false;
let hasUserEnabledExpiryDateEdit = false;

/** When user picks a saved card from dropdown, used for OTP/pay cardId vs pan */
let selectedSavedCardForApi = null;

let captchaTokenKey = null;

let paymentInitErrorScreen = null;

/** From GET /transaction `appSettings.otpSettings` (mutable `maxTries` is tracked per card below). */
let transactionOtpSettings = { maxTries: 5, nextTrySeconds: 120 };
/** Configurable: lock card input while OTP cooldown is active (default: enabled). */
let lockCardNumberDuringOtpCooldown = getDefaultLockCardNumberDuringOtpCooldown();
const otpLengthConfig = getOtpLengthConfig();
const captchaCodeLength = getCaptchaCodeLength();

/** Per-card OTP tries remaining (key → count). */
const otpTriesRemainingByCardKey = Object.create(null);
/** Per-card cooldown end timestamp (ms) after a successful OTP request. */
const otpCooldownUntilByCardKey = Object.create(null);

let otpButtonCountdownIntervalId = null;
let otpRequestInFlight = false;
let currentTransactionPrCode = null;

/** Merchant / transaction type snapshot for inline receipt (from getTransaction). */
let paymentReceiptMerchantContext = null;
let paymentReceiptRedirectUrl = null;
let paymentReceiptReturnSeconds = 0;
let paymentReceiptReturnIntervalId = null;
let paySubmitInFlight = false;
const clickLockMap = new WeakMap();

/** Last `paymentReceipt` from pay API when inline receipt is shown (for i18n refresh). */
let lastPaymentReceiptData = null;
let refreshCardDropdownFooterButtons = null;
let isCardListManageMode = false;
let syncOtpPrerequisiteFieldLock = () => {};

/**
 * Reveal main content after loading and all setup (success, error, or failure paths).
 */
function markAppReady() {
  const root = document.documentElement;
  root.classList.remove('app-booting');
  root.classList.add('app-ready');
}

async function loadCaptchaImage(captchaImageEl) {
  try {
    const captcha = await fetchCaptcha();
    captchaTokenKey = captcha.captchaKey;
    captchaImageEl.src = captcha.imageDataUrl;
  } catch (err) {
    console.error(err);
    captchaTokenKey = null;
    errorHandler.show({
      message: i18n.t('error.network'),
      mode: 'toast',
      type: 'error',
    });
  }
}

/**
 * Card fields for OTP / pay (IPG expects pan or cardId).
 * @returns {{ cardId: string | null, pan: string | null, bill: null, cardRegisteredType: number } | null}
 */
function buildCardPayloadForIpg() {
  const pan = extractNumbers(cardNumberInput.getValue());
  if (pan.length === 16) {
    return { cardId: null, pan, bill: null, cardRegisteredType: 0 };
  }
  if (selectedSavedCardForApi) {
    return {
      cardId: String(selectedSavedCardForApi.subscriberCardId),
      pan: null,
      bill: null,
      cardRegisteredType: selectedSavedCardForApi.cardRegisteredType ?? 1,
    };
  }
  return null;
}

/**
 * Stable key for OTP try limits / cooldown (16-digit PAN or saved card id).
 * @returns {string | null}
 */
function getOtpCardStateKey() {
  const pan = extractNumbers(cardNumberInput.getValue());
  if (pan.length === 16) {
    return `pan:${pan}`;
  }
  if (selectedSavedCardForApi?.subscriberCardId != null) {
    return `cardId:${selectedSavedCardForApi.subscriberCardId}`;
  }
  return null;
}

function ensureOtpTriesForKey(key) {
  if (!key) return;
  if (otpTriesRemainingByCardKey[key] === undefined) {
    otpTriesRemainingByCardKey[key] = transactionOtpSettings.maxTries;
  }
}

function clearOtpButtonCountdownInterval() {
  if (otpButtonCountdownIntervalId != null) {
    clearInterval(otpButtonCountdownIntervalId);
    otpButtonCountdownIntervalId = null;
  }
}

function maybeStartOtpButtonCountdownTicker() {
  clearOtpButtonCountdownInterval();
  otpButtonCountdownIntervalId = setInterval(() => {
    syncGetOtpButtonState();
    const key = getOtpCardStateKey();
    const until = key ? otpCooldownUntilByCardKey[key] : null;
    if (until == null || Date.now() >= until) {
      clearOtpButtonCountdownInterval();
      syncGetOtpButtonState();
    }
  }, 400);
}

/**
 * Validates only fields required for requesting OTP: card, expiry, CVV2, captcha (+ captcha token).
 * Focuses the first invalid field and returns false if any check fails.
 * @returns {boolean}
 */
function validateFieldsForOtpRequest() {
  const order = [cardNumberInput, expiryDateInput, cvv2Input, captchaInput];
  for (const input of order) {
    const ok = input.validate();
    if (!ok) {
      input.focus();
      errorHandler.show({
        message: i18n.t('form.validation.error'),
        mode: 'toast',
        type: 'error',
      });
      return false;
    }
  }
  if (!captchaTokenKey) {
    captchaInput.validate();
    captchaInput.focus();
    errorHandler.show({
      message: i18n.t('form.validation.error'),
      mode: 'toast',
      type: 'error',
    });
    return false;
  }
  if (!buildCardPayloadForIpg()) {
    cardNumberInput.validate();
    cardNumberInput.focus();
    errorHandler.show({
      message: i18n.t('form.validation.error'),
      mode: 'toast',
      type: 'error',
    });
    return false;
  }
  return true;
}

/**
 * Updates OTP request button: cooldown timer, disabled state, exhausted tries.
 */
function syncGetOtpButtonState() {
  const key = getOtpCardStateKey();
  if (key) {
    ensureOtpTriesForKey(key);
  }

  const triesLeft = key != null ? otpTriesRemainingByCardKey[key] : null;
  const until = key != null ? otpCooldownUntilByCardKey[key] : null;
  const now = Date.now();
  const inCooldown = until != null && now < until;
  const remainingCooldownSec = inCooldown ? (until - now) / 1000 : 0;
  const exhausted = triesLeft !== null && triesLeft <= 0;
  const maxTriesCfg = transactionOtpSettings.maxTries;
  syncOtpPrerequisiteFieldLock();

  const btn = document.getElementById('get-otp-button');
  if (!btn) return;

  if (otpRequestInFlight) {
    btn.classList.add('loading');
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.textContent = i18n.t('common.processing');
    btn.removeAttribute('aria-label');
    return;
  }
  btn.classList.remove('loading');
  btn.removeAttribute('aria-busy');

  if (maxTriesCfg <= 0) {
    btn.disabled = true;
    btn.textContent = i18n.t('form.getOtpExhausted');
    btn.setAttribute('aria-label', i18n.t('form.getOtpExhausted'));
    return;
  }

  if (exhausted) {
    btn.disabled = true;
    btn.textContent = i18n.t('form.getOtpExhausted');
    btn.setAttribute('aria-label', i18n.t('form.getOtpExhausted'));
    return;
  }

  if (inCooldown) {
    btn.disabled = true;
    const timeLabel = formatSecondsAsMmSs(remainingCooldownSec);
    btn.textContent = timeLabel;
    btn.setAttribute(
      'aria-label',
      i18n.t('form.getOtpCountdownAria', { time: timeLabel })
    );
    return;
  }

  btn.disabled = false;
  btn.textContent = i18n.t('form.getOtp');
  btn.removeAttribute('aria-label');
}

function getExpiryDateForApi() {
  const m = extractNumbers(expiryMonthInput?.getValue?.() || '');
  const y = extractNumbers(expiryYearInput?.getValue?.() || '');
  return m.length === 2 && y.length === 2 ? `${m}${y}` : '';
}

function handlePaymentInitLanguageChange() {
  if (!paymentInitErrorScreen) return;
  paymentInitErrorScreen.updateTexts({
    title: i18n.t('paymentInit.error.title'),
    description: i18n.t('paymentInit.error.description'),
  });
}

function isVisibleInputField(field) {
  if (!field || field.disabled || field.readOnly) return false;
  return field.offsetParent !== null;
}

function focusNextVisibleInputField(currentField) {
  const allFields = Array.from(document.querySelectorAll('#payment-form .input-field'));
  const currentIndex = allFields.indexOf(currentField);
  if (currentIndex < 0) return;
  for (let i = currentIndex + 1; i < allFields.length; i += 1) {
    const nextField = allFields[i];
    if (isVisibleInputField(nextField)) {
      nextField.focus();
      return;
    }
  }
}

function getCurrentCardBankName() {
  if (selectedSavedCardForApi?.bankName) {
    return String(selectedSavedCardForApi.bankName);
  }
  const bank = detectBank(cardNumberInput?.getValue?.() || '');
  return bank?.name || '';
}

function getCvv2Constraints() {
  const bankName = getCurrentCardBankName();
  const normalized = bankName.trim().toLowerCase();
  const isSamanBank = normalized === 'saman' || bankName.includes('سامان');
  if (isSamanBank) {
    return { minLength: 3, maxLength: 3, fixedLength: true };
  }
  return { minLength: 3, maxLength: 4, fixedLength: false };
}

function shouldSendExpiryDateInPayRequest() {
  return !isExpiryDateLockedFromCard || hasUserEnabledExpiryDateEdit;
}

function getMaskedDisplayPan(securePan) {
  if (!securePan) return '';
  const raw = securePan.replace(/\s/g, '').replace(/#/g, '●').replace(/\*/g, '●');
  const parts = [];
  for (let i = 0; i < raw.length; i += 4) {
    parts.push(raw.substring(i, i + 4));
  }
  return parts.join(' ');
}

/**
 * Digit string from card field for filtering saved cards: full typed PAN, or lead+tail when UI shows mask (●).
 */
function getCardNumberFilterDigits(rawValue) {
  if (!rawValue) return '';
  const value = convertToEnglishNumbers(rawValue);
  if (!/[●*#]/.test(value)) {
    return extractNumbers(rawValue);
  }
  let firstMaskIdx = -1;
  for (let i = 0; i < value.length; i++) {
    if (/[●*#]/.test(value[i])) {
      firstMaskIdx = i;
      break;
    }
  }
  let lastMaskIdx = -1;
  for (let i = value.length - 1; i >= 0; i--) {
    if (/[●*#]/.test(value[i])) {
      lastMaskIdx = i;
      break;
    }
  }
  const before = firstMaskIdx === -1 ? value : value.slice(0, firstMaskIdx);
  const after = lastMaskIdx === -1 ? '' : value.slice(lastMaskIdx + 1);
  return `${before.replace(/\D/g, '')}${after.replace(/\D/g, '')}`;
}

/**
 * Parse API masked PAN into BIN prefix, suffix, and index where suffix starts (standard 16-digit layout).
 */
function parseMaskedPanStructure(securePan) {
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
    i++;
  }
  let maskLen = 0;
  while (i < raw.length && raw[i] === '*') {
    maskLen++;
    i++;
  }
  let tail = '';
  while (i < raw.length && raw[i] !== '*') {
    tail += raw[i];
    i++;
  }
  const totalLen = lead.length + maskLen + tail.length;
  const tailStart = lead.length + maskLen;
  return { lead, tail, tailStart, totalLen };
}

/**
 * Whether typed digits can still match this saved card's masked PAN (prefix, middle unknown, suffix aligned).
 */
function savedCardMatchesTypedDigits(securePan, typedDigits) {
  const U = String(typedDigits).replace(/\D/g, '');
  if (U.length === 0) return true;

  const { lead, tail, tailStart, totalLen } = parseMaskedPanStructure(securePan);
  if (!totalLen) return false;

  const compareLen = Math.min(U.length, totalLen);
  if (compareLen === 0) return true;

  const prefixLen = Math.min(compareLen, lead.length);
  if (prefixLen > 0 && U.slice(0, prefixLen) !== lead.slice(0, prefixLen)) {
    return false;
  }

  if (compareLen <= tailStart) {
    return true;
  }

  if (!tail || tail.length === 0) {
    return true;
  }

  for (let j = tailStart; j < compareLen; j++) {
    const ti = j - tailStart;
    if (ti >= tail.length) break;
    if (U[j] !== tail[ti]) {
      return false;
    }
  }
  return true;
}

/**
 * Stable unique key for saved-card rows (remove / select). Uses API subscriberCardId when set.
 * Do not use `card.number` alone: IPG mapping can duplicate the same synthetic PAN per bank BIN.
 */
function getCardListKey(card) {
  if (card == null) return '';
  if (card.subscriberCardId != null && card.subscriberCardId !== '') {
    return String(card.subscriberCardId);
  }
  return String(card.number ?? '');
}

function isCardListUiEnabled() {
  return cardList.length > 0 || cardListLoadSucceeded;
}

function isMobileCardListViewport() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function isLimitedCardSelectionOnlyMode() {
  return cardList.some((card) => Boolean(card?.isLimited));
}

function getSelectableCards() {
  const availableCards = cardList.filter((card) => card != null);
  if (!isLimitedCardSelectionOnlyMode()) {
    return availableCards;
  }
  return availableCards.filter((card) => Boolean(card.isLimited));
}

function getDefaultSelectableCard() {
  const selectableCards = getSelectableCards();
  if (selectableCards.length === 0) return null;
  return selectableCards.find((card) => Boolean(card.selected)) || null;
}

function buildCardEmptyStateElement() {
  const wrap = document.createElement('div');
  wrap.className = 'dropdown-empty-state';
  const icon = createAppIcon('icn-credit-card.svg', 'dropdown-empty-state-img app-icon-muted');
  const title = document.createElement('p');
  title.className = 'dropdown-empty-state-title';
  title.textContent = i18n.t('cardList.empty');
  wrap.appendChild(icon);
  wrap.appendChild(title);
  return wrap;
}

function buildCardDropdownItems(typedDigits) {
  const selectableCards = getSelectableCards();
  const digits =
    typedDigits !== undefined
      ? String(typedDigits).replace(/\D/g, '')
      : getCardNumberFilterDigits(cardNumberInput?.getValue?.() || '');
  const filtered =
    digits.length > 0
      ? selectableCards.filter((card) => savedCardMatchesTypedDigits(card.securePan, digits))
      : selectableCards;
  const lang = typeof i18n.getLanguage === 'function' ? i18n.getLanguage() : 'fa';
  return filtered.map((card) => {
    const logoPath = getBankLogo(card.bankName);
    const localizedBankName = getLocalizedBankName(card.bankName, lang);
    const maskedPan = getMaskedDisplayPan(card.securePan);
    const rowKey = getCardListKey(card);
    const removeButtonHtml = isCardListManageMode
      ? `
                <button type="button" class="dropdown-card-remove-btn" data-card-value="${rowKey.replace(/"/g, '&quot;')}" aria-label="${i18n.t('common.delete')}">
                  ${appIconHtml('icn-x.svg', 'dropdown-card-remove-icon')}
                </button>`
      : '';
    return {
      text: maskedPan,
      value: rowKey,
      html: `
            <div class="dropdown-card-item">
              <div class="dropdown-card-bank">
                ${logoPath ? `<img class="dropdown-card-bank-logo" src="${logoPath}" alt="${localizedBankName}" />` : ''}
                <span class="dropdown-card-bank-name">${localizedBankName}</span>
              </div>
              <div class="dropdown-card-meta">
                <span class="dropdown-card-number">${maskedPan}</span>
                ${removeButtonHtml}
                ${card.pinned ? '<span class="dropdown-card-pinned">📌</span>' : ''}
              </div>
            </div>
          `,
      onRender: (listItem) => {
        const removeBtn = listItem.querySelector('.dropdown-card-remove-btn');
        if (!removeBtn) return;
        removeBtn.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          const targetValue = removeBtn.getAttribute('data-card-value');
          if (!targetValue) return;
          removeCardFromList(targetValue);
        });
      },
    };
  });
}

function removeCardFromList(cardListKey) {
  const keyStr = String(cardListKey);
  const beforeCount = cardList.length;
  cardList = cardList.filter((card) => getCardListKey(card) !== keyStr);
  if (cardList.length === beforeCount) return;
  if (cardList.length === 0) {
    isCardListManageMode = false;
  }
  dataStore.set('savedCards', cardList);

  if (selectedSavedCardForApi && getCardListKey(selectedSavedCardForApi) === keyStr) {
    selectedSavedCardForApi = null;
    cardNumberInput?.setValue('');
    cardNumberInput?.clearValidation?.();
    updateBankLogo(null);
  }

  if (cardDropdown) {
    cardDropdown.updateItems(buildCardDropdownItems());
  }
  if (typeof refreshCardDropdownFooterButtons === 'function') {
    refreshCardDropdownFooterButtons();
  }
  // Bottom sheet list is separate DOM — rebuild when open so removed rows disappear
  if (cardListSheetRef && typeof openCardListSheetFn === 'function') {
    void openCardListSheetFn();
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await initializePage();
});

async function initializePage() {
  const loadingScreen = new LoadingScreen({
    logo: '/assets/images/logo-full.svg',
    // Non-empty so .loading-text exists for updateText() after i18n is ready
    text: '\u00A0',
    showProgressBar: true,
    ariaLabel: '\u00A0',
  });
  loadingScreen.show();

  await i18n.readyPromise;
  loadingScreen.updateText(i18n.t('common.loading'));
  if (loadingScreen.element) {
    loadingScreen.element.setAttribute('aria-label', i18n.t('common.loading'));
  }

  const paymentInitCheck = validatePaymentInitData();
  if (!paymentInitCheck.valid) {
    const initErrorRoot = document.getElementById('payment-init-error-root');
    const initErrorSection = document.getElementById('payment-init-error-section');
    const paymentFlowSection = document.getElementById('payment-flow-section');
    if (!initErrorRoot || !initErrorSection || !paymentFlowSection) {
      loadingScreen.hide();
      loadingScreen.destroy();
      markAppReady();
      errorHandler.show({
        message: i18n.t('error.unknown'),
        mode: 'toast',
        type: 'error',
      });
      return;
    }

    try {
      header = new Header({
        title: i18n.t('header.title'),
        logo: '/assets/images/logo-shaparak.svg',
        secondaryLogo: '/assets/images/logo.svg',
        showCard: false,
      });

      footer = new Footer({
        logo: '/assets/images/logo.svg',
        supportPrefix: i18n.t('footer.supportPrefix'),
        supportPhone: i18n.t('footer.supportPhone'),
        copyright: i18n.t('footer.copyright'),
      });

      paymentFlowSection.setAttribute('hidden', '');
      initErrorSection.removeAttribute('hidden');

      paymentInitErrorScreen = new PaymentInitErrorScreen({
        container: initErrorRoot,
        image: '/assets/images/icons/icn-x.svg',
        title: i18n.t('paymentInit.error.title'),
        description: i18n.t('paymentInit.error.description'),
        ariaLabel: i18n.t('paymentInit.error.title'),
      });

      updatePageContent();
      document.addEventListener('languageChange', handleLanguageChange);
      document.addEventListener('languageChange', handlePaymentInitLanguageChange);
    } finally {
      loadingScreen.hide();
      loadingScreen.destroy();
      markAppReady();
    }
    return;
  }

  try {
    // Initialize header
    header = new Header({
      title: i18n.t('header.title'),
      logo: '/assets/images/logo-shaparak.svg',
      secondaryLogo: '/assets/images/logo.svg',
      showCard: false,
    });

    // Initialize footer
    footer = new Footer({
      logo: '/assets/images/logo.svg',
      supportPrefix: i18n.t('footer.supportPrefix'),
      supportPhone: i18n.t('footer.supportPhone'),
      copyright: i18n.t('footer.copyright'),
    });

    // Load saved cards from API
    await loadCards();

    const txUi = await initializeTransactionInfo();

    // Initialize timer (duration from transaction appSettings when available)
    initializeTimer(txUi?.durationSeconds ?? 900);

    // Initialize form inputs
    initializeFormInputs();

    // Initialize partner logos (merchant logo from transaction when available)
    initializePartnerLogos(txUi?.merchantLogoUrl ?? null);

    // Attach form events
    attachFormEvents();

    // Update page content with current language
    updatePageContent();

    // Listen for language changes
    document.addEventListener('languageChange', handleLanguageChange);

    // Hide loading screen
    loadingScreen.hide();
    loadingScreen.destroy();
    markAppReady();
  } catch (error) {
    console.error('Initialization error:', error);
    errorHandler.show({
      message: i18n.t('error.unknown'),
      mode: 'toast',
      type: 'error',
    });
    loadingScreen.hide();
    loadingScreen.destroy();
    markAppReady();
  }
}

function initializeTimer(durationSeconds = 900) {
  const timerContainer = document.getElementById('timer-container');
  const timerHeader = document.getElementById('timer-header');
  const timerProgress = timerContainer.querySelector('.timer-progress');
  const timerValue = timerContainer.querySelector('.timer-value');
  const total = Math.max(1, durationSeconds);
  const defaultHeaderTitle = i18n.t('header.title');

  const syncMobileHeaderTitleWithTimer = (timeLabel) => {
    const headerTitleEl = header?.element?.querySelector('.header-title');
    if (!headerTitleEl) return;
    if (window.matchMedia('(max-width: 768px)').matches) {
      headerTitleEl.textContent = timeLabel;
      return;
    }
    headerTitleEl.textContent = defaultHeaderTitle;
  };

  timer = new Timer({
    duration: total,
    onTick: (remaining) => {
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const timeLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      timerValue.textContent = timeLabel;
      setTimerProgressIndicator(timerProgress, remaining / total);
      syncMobileHeaderTitleWithTimer(timeLabel);

      // Update timer header style based on progress
      if (timerHeader) {
        timerHeader.classList.remove('warning', 'danger');
      }
      const progress = remaining / total;
      if (progress <= 1 / 3) {
        if (timerHeader) timerHeader.classList.add('danger');
      } else if (progress <= 2 / 3) {
        if (timerHeader) timerHeader.classList.add('warning');
      }
    },
    onOneThird: () => {
      if (timerHeader) timerHeader.classList.add('warning');
    },
    onTwoThird: () => {
      if (timerHeader) timerHeader.classList.add('danger');
    },
    onEnd: () => {
      setTimerProgressIndicator(timerProgress, 0);
      syncMobileHeaderTitleWithTimer('00:00');
      errorHandler.show({
        message: i18n.t('timer.expired'),
        mode: 'toast',
        type: 'warning',
      });
    },
  });

  setTimerProgressIndicator(timerProgress, 1);
  timer.start();
}

/**
 * Load cards from API service
 */
async function loadCards() {
  cardListLoadSucceeded = false;
  try {
    const response = await cardService.getCards();

    if (response && Array.isArray(response.Data)) {
      // cardService.getCards() already maps API → internal format; do not convert again
      cardList = response.Data.filter((card) => card != null);

      // Also save to localStorage for offline access
      dataStore.set('savedCards', cardList);
      cardListLoadSucceeded = true;
    } else {
      // Fallback to localStorage if API fails
      cardList = dataStore.get('savedCards') || [];
    }
  } catch (error) {
    console.error('Failed to load cards:', error);
    // Fallback to localStorage
    cardList = dataStore.get('savedCards') || [];
  }
}

function initializeFormInputs() {
  const resetFieldsOnCardChange = () => {
    cvv2Input?.setValue('');
    cvv2Input?.clearValidation?.();
    expiryDateInput?.setValue('');
    expiryDateInput?.clearValidation?.();
    captchaInput?.setValue('');
    captchaInput?.clearValidation?.();
    otpInput?.setValue('');
    otpInput?.clearValidation?.();
    mobileInput?.setValue('');
    mobileInput?.clearValidation?.();
    emailInput?.setValue('');
    emailInput?.clearValidation?.();

    if (cvv2PinPad) {
      cvv2PinPad.clear();
      cvv2PinPad.close();
    }
    if (otpPinPad) {
      otpPinPad.clear();
      otpPinPad.close();
    }

    const saveCardEl = document.getElementById('save-card-checkbox');
    if (saveCardEl) {
      saveCardEl.checked = false;
      const saveCardIcon = document.querySelector('.save-card-icon .app-icon');
      if (saveCardIcon) {
        setAppIconFile(saveCardIcon, 'icn-square-check.svg');
      }
    }

    const showReceiptEl = document.getElementById('show-receipt-toggle');
    if (showReceiptEl) {
      showReceiptEl.checked = false;
    }
    const receiptFields = document.getElementById('receipt-fields');
    if (receiptFields) {
      receiptFields.classList.remove('show');
    }
    const showReceiptIcon = document.querySelector('.show-receipt-icon .app-icon');
    if (showReceiptIcon) {
      setAppIconFile(showReceiptIcon, 'icn-square-plus.svg');
    }
  };

  const syncCvv2Constraints = () => {
    if (!cvv2Input || !cvv2Input.element) return;
    const constraints = getCvv2Constraints();
    cvv2Input.options.maxLength = constraints.maxLength;
    cvv2Input.element.maxLength = constraints.maxLength;

    const digitsOnly = extractNumbers(cvv2Input.getValue()).slice(0, constraints.maxLength);
    if (digitsOnly !== cvv2Input.getValue()) {
      cvv2Input.setValue(digitsOnly);
    }

    if (cvv2PinPad) {
      cvv2PinPad.options.maxLength = constraints.maxLength;
      if (cvv2PinPad.currentValue.length > constraints.maxLength) {
        cvv2PinPad.currentValue = cvv2PinPad.currentValue.slice(0, constraints.maxLength);
        cvv2PinPad.updateDisplay();
        cvv2PinPad.updateInput();
      } else {
        cvv2PinPad.updateDisplay();
      }
    }
  };

  const getExpiryEditActionButton = () => {
    return expiryYearInput?.wrapper?.querySelector('.input-action-right') || null;
  };

  const setExpiryDateLockedState = ({ lockByCard, lockByOtp }) => {
    const locked = Boolean(lockByCard || lockByOtp);
    if (!expiryMonthInput?.element || !expiryYearInput?.element) return;
    isExpiryDateLockedFromCard = Boolean(lockByCard);
    for (const inp of [expiryMonthInput, expiryYearInput]) {
      inp.element.disabled = locked;
      inp.element.setAttribute('aria-disabled', locked ? 'true' : 'false');
      // Keep options.disabled false so the edit action remains clickable while field is locked.
      inp.options.disabled = false;
      if (inp.wrapper) {
        inp.wrapper.classList.toggle('disabled', locked);
      }
      if (inp.inputContainer) {
        inp.inputContainer.classList.toggle('disabled', locked);
      }
      if (inp.clearButton) {
        if (locked) {
          inp.clearButton.style.display = 'none';
        } else {
          inp.updateClearButton();
        }
      }
    }
    if (lockByCard) {
      expiryMonthInput.setValue('');
      expiryYearInput.setValue('');
      expiryMonthInput.setPlaceholder('\u2022\u2022');
      expiryYearInput.setPlaceholder('\u2022\u2022');
      expiryMonthInput.wrapper.classList.add('expiry-date-field--locked-placeholder');
      expiryYearInput.wrapper.classList.add('expiry-date-field--locked-placeholder');
    } else {
      expiryMonthInput.wrapper.classList.remove('expiry-date-field--locked-placeholder');
      expiryYearInput.wrapper.classList.remove('expiry-date-field--locked-placeholder');
      expiryMonthInput.setPlaceholder(i18n.t('form.expiryMonth'));
      expiryYearInput.setPlaceholder(i18n.t('form.expiryYear'));
    }
    const editActionBtn = getExpiryEditActionButton();
    if (editActionBtn) {
      if (lockByCard) {
        editActionBtn.style.display = 'inline-flex';
        editActionBtn.disabled = Boolean(lockByOtp);
        editActionBtn.setAttribute('aria-disabled', lockByOtp ? 'true' : 'false');
        editActionBtn.tabIndex = lockByOtp ? -1 : 0;
      } else {
        editActionBtn.style.display = 'none';
      }
    }
    if (locked) {
      expiryDateInput?.clearValidation?.();
    }
  };

  const applyExpiryDateModeForSelectedCard = () => {
    const lockByCard =
      Boolean(selectedSavedCardForApi?.hasValidExpiredDate) && !hasUserEnabledExpiryDateEdit;
    const key = getOtpCardStateKey();
    const until = key != null ? otpCooldownUntilByCardKey[key] : null;
    const lockByOtp = until != null && Date.now() < until;
    setExpiryDateLockedState({ lockByCard, lockByOtp });
  };

  const setInputLockedByOtpCooldown = (input, locked) => {
    if (!input?.element) return;
    if (locked) {
      input.disable();
      input.clearValidation?.();
      return;
    }
    input.enable();
  };

  const syncOtpLockedFieldsState = () => {
    const key = getOtpCardStateKey();
    const until = key != null ? otpCooldownUntilByCardKey[key] : null;
    const isLocked = until != null && Date.now() < until;
    if (lockCardNumberDuringOtpCooldown) {
      if (isLocked) {
        cardNumberInput?.disable?.();
      } else {
        cardNumberInput?.enable?.();
        setCardInputTypingLocked(isLimitedCardSelectionOnlyMode());
      }
    }
    setInputLockedByOtpCooldown(cvv2Input, isLocked);
    setInputLockedByOtpCooldown(captchaInput, isLocked);
    applyExpiryDateModeForSelectedCard();
  };

  syncOtpPrerequisiteFieldLock = syncOtpLockedFieldsState;

  const setCardInputTypingLocked = (locked) => {
    if (!cardNumberInput?.element) return;
    const isLocked = Boolean(locked);
    cardNumberInput.element.readOnly = isLocked;
    cardNumberInput.element.setAttribute('aria-readonly', isLocked ? 'true' : 'false');
    if (cardNumberInput.clearButton) {
      if (isLocked) {
        cardNumberInput.clearButton.style.visibility = 'hidden';
        cardNumberInput.clearButton.style.pointerEvents = 'none';
      } else {
        cardNumberInput.updateClearButton?.();
      }
    }
  };

  const applySavedCardSelection = (card, { focusNext = false } = {}) => {
    if (!card || !cardNumberInput) return;
    resetFieldsOnCardChange();
    selectedSavedCardForApi = card;
    hasUserEnabledExpiryDateEdit = false;
    cardNumberInput.setValue(getMaskedDisplayPan(card.securePan));
    updateBankLogo({ name: card.bankName });
    handleGiftCardNotificationFromPan(card.securePan);
    applyExpiryDateModeForSelectedCard();
    syncCvv2Constraints();
    syncGetOtpButtonState();
    if (focusNext) {
      focusNextVisibleInputField(cardNumberInput.element);
    }
  };

  // Card Number Input
  const cardNumberContainer = document.getElementById('card-number-input-container');
  const hasCardListUi = isCardListUiEnabled();
  const cardNumberLabel = hasCardListUi
    ? i18n.t('form.cardNumber.selectCard')
    : i18n.t('form.cardNumber');
  cardNumberInput = new Input(cardNumberContainer, {
    id: 'card-number',
    name: 'cardNumber',
    type: 'text',
    autocomplete: 'off',
    label: cardNumberLabel,
    placeholder: i18n.t('form.cardNumber.placeholder'),
    required: true,
    requiredMessageKey: 'form.cardNumber.required',
    clearButtonAriaLabel: i18n.t('common.clear'),
    validator: validateCardNumber,
    maxLength: 19, // 16 digits + 3 spaces
    rightAction: hasCardListUi
      ? {
          icon: appIconHtml('icn-credit-card.svg'),
          label: i18n.t('form.showCards'),
          onClick: () => toggleCardList(),
        }
      : null,
    onInput: (value) => {
      resetFieldsOnCardChange();
      selectedSavedCardForApi = null;
      hasUserEnabledExpiryDateEdit = false;
      applyExpiryDateModeForSelectedCard();

      syncGetOtpButtonState();

      // Format card number (4-4-4-4)
      const formatted = formatCardNumber(value);
      if (formatted !== value) {
        cardNumberInput.setValue(formatted);
      }

      // Detect bank and show logo
      const bank = detectBank(value);
      updateBankLogo(bank);
      syncCvv2Constraints();

      if (extractNumbers(value).length >= 16) {
        focusNextVisibleInputField(cardNumberInput.element);
      }

      // Detect gift card and notify
      handleGiftCardNotificationFromPan(value);

      if (cardDropdown) {
        cardDropdown.updateItems(buildCardDropdownItems());
      }
    },
  });

  const syncCardDropdownAfterListChange = () => {
    if (cardDropdown) {
      cardDropdown.updateItems(buildCardDropdownItems());
    }
    if (typeof refreshCardDropdownFooterButtons === 'function') {
      refreshCardDropdownFooterButtons();
    }
  };

  const buildCardDropdownFooterButtons = () => {
    if (isLimitedCardSelectionOnlyMode()) return [];
    if (getSelectableCards().length === 0) return [];
    return [
      ...(isCardListManageMode
        ? [
            {
              text: i18n.t('common.cancel'),
              className: 'dropdown-footer-btn-cancel',
              icon: appIconHtml('icn-x.svg'),
              onClick: () => {
                isCardListManageMode = false;
                syncCardDropdownAfterListChange();
                if (isMobileCardListViewport() && cardListSheetRef) {
                  cardListSheetRef.destroy();
                  cardListSheetRef = null;
                  void openCardListSheet();
                }
              },
            },
          ]
        : [
            {
              text: i18n.t('cardList.addNew'),
              className: 'dropdown-footer-btn-add',
              icon: appIconHtml('icn-square-plus.svg'),
              onClick: () => {
                selectedSavedCardForApi = null;
                hasUserEnabledExpiryDateEdit = false;
                cardNumberInput.setValue('');
                cardNumberInput.clearValidation?.();
                updateBankLogo(null);
                applyExpiryDateModeForSelectedCard();
                syncCvv2Constraints();
                syncGetOtpButtonState();
                resetFieldsOnCardChange();
                if (cardListSheetRef) {
                  cardListSheetRef.destroy();
                  cardListSheetRef = null;
                }
                cardNumberInput.focus();
              },
            },
            {
              text: i18n.t('cardList.manage'),
              className: 'dropdown-footer-btn-manage',
              icon: appIconHtml('icn-credit-card.svg'),
              onClick: () => {
                isCardListManageMode = true;
                syncCardDropdownAfterListChange();
                if (isMobileCardListViewport() && cardListSheetRef) {
                  cardListSheetRef.destroy();
                  cardListSheetRef = null;
                  void openCardListSheet();
                }
              },
            },
          ]),
    ];
  };

  async function openCardListSheet() {
    if (!isCardListUiEnabled()) return;
    if (cardListSheetRef) {
      cardListSheetRef.destroy();
      cardListSheetRef = null;
    }
    const { BottomSheet } = await import('../components/BottomSheet.js');
    const content = document.createElement('div');
    content.className = 'card-list-sheet';

    const selectableCards = getSelectableCards();
    if (selectableCards.length === 0) {
      content.appendChild(buildCardEmptyStateElement());
    } else {
      const ul = document.createElement('ul');
      ul.className = 'card-list-sheet-list';
      const items = buildCardDropdownItems();
      items.forEach((itemDef) => {
        const li = document.createElement('li');
        li.className = 'dropdown-item card-list-sheet-item';
        li.innerHTML = itemDef.html || '';
        if (typeof itemDef.onRender === 'function') {
          itemDef.onRender(li);
        }
        li.addEventListener('click', () => {
          if (isCardListManageMode) {
            return;
          }
          const card = selectableCards.find((c) => getCardListKey(c) === itemDef.value);
          if (card) {
            applySavedCardSelection(card, { focusNext: true });
            if (cardListSheetRef) {
              cardListSheetRef.close();
            }
          }
        });
        ul.appendChild(li);
      });
      content.appendChild(ul);
    }

    const footerDefs = buildCardDropdownFooterButtons();
    if (footerDefs.length > 0) {
      const footer = document.createElement('div');
      footer.className = 'card-list-sheet-footer';
      footerDefs.forEach((buttonDef) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `dropdown-footer-btn ${buttonDef.className || ''}`.trim();
        button.innerHTML = `
        ${buttonDef.icon ? `<span class="dropdown-footer-btn-icon" aria-hidden="true">${buttonDef.icon}</span>` : ''}
        <span class="dropdown-footer-btn-text">${buttonDef.text || ''}</span>
      `;
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (typeof buttonDef.onClick === 'function') {
            buttonDef.onClick();
          }
        });
        footer.appendChild(button);
      });
      content.appendChild(footer);
    }

    const sheet = new BottomSheet({
      title: i18n.t('form.cardNumber.selectCard'),
      content,
      scrollable: true,
      onClose: () => {
        if (cardListSheetRef === sheet) {
          cardListSheetRef = null;
        }
        sheet.destroy();
      },
    });
    cardListSheetRef = sheet;
    sheet.open();
  }

  openCardListSheetFn = openCardListSheet;

  // Create card dropdown when the list was loaded from API (empty or with cards)
  if (hasCardListUi) {
    cardDropdown = new Dropdown(cardNumberInput.element, {
      items: buildCardDropdownItems(),
      footerButtons: buildCardDropdownFooterButtons(),
      emptyState: () => buildCardEmptyStateElement(),
      desktopOnlyAutoOpen: true,
      openOnFocusWhenInputEmpty: true,
      onSelect: (item) => {
        if (isCardListManageMode) {
          return;
        }
        const card = getSelectableCards().find((c) => getCardListKey(c) === item.value);
        if (card) {
          applySavedCardSelection(card, { focusNext: true });
        }
      },
    });

    refreshCardDropdownFooterButtons = () => {
      if (!cardDropdown) return;
      cardDropdown.options.footerButtons = buildCardDropdownFooterButtons();
      cardDropdown.renderFooterButtons();
    };
  }

  const defaultCard = getDefaultSelectableCard();
  if (defaultCard) {
    applySavedCardSelection(defaultCard);
  }
  setCardInputTypingLocked(isLimitedCardSelectionOnlyMode());
  syncCardDropdownAfterListChange();

  /**
   * Detect if card is a gift card based on PAN pattern.
   * Uses the same logic as:
   * function isGiftCard(value) {
   *   if (hasValue(value) && value.length != 2) {
   *     return false;
   *   }
   *   return parseInt(value) >= 20 && parseInt(value) <= 49;
   * }
   * Here we derive the 2–digit value from the PAN.
   */
  function isGiftCardFromPan(pan) {
    const numbers = extractNumbers(pan);
    // Need at least 8 digits to extract a stable 2–digit segment
    if (numbers.length < 8) return false;
    // Take a 2–digit segment from the middle of the PAN (positions 7–8)
    const value = numbers.substring(6, 8);
    if (!value || value.length !== 2) {
      return false;
    }
    const num = parseInt(value, 10);
    if (Number.isNaN(num)) return false;
    return num >= 20 && num <= 49;
  }

  function handleGiftCardNotificationFromPan(pan) {
    const isGift = isGiftCardFromPan(pan);
    if (isGift && !isCurrentGiftCard) {
      errorHandler.show({
        message: i18n.t('form.giftCardNotice'),
        mode: 'toast',
        type: 'info',
      });
    }
    isCurrentGiftCard = isGift;
  }

  // CVV2 Input
  const cvv2Container = document.getElementById('cvv2-input-container');
  cvv2Input = new Input(cvv2Container, {
    id: 'cvv2',
    name: 'cvv2',
    type: 'password',
    autocomplete: 'off',
    label: i18n.t('form.cvv2'),
    placeholder: i18n.t('form.cvv2.placeholder'),
    hint: i18n.t('form.cvv2.hint'),
    required: true,
    requiredMessageKey: 'form.cvv2.required',
    clearButtonAriaLabel: i18n.t('common.clear'),
    validator: (value) => {
      const constraints = getCvv2Constraints();
      const numbers = extractNumbers(value);
      if (!numbers || numbers.length === 0) {
        return { valid: false, message: i18n.t('form.cvv2.required') };
      }
      if (constraints.fixedLength && numbers.length !== constraints.maxLength) {
        return {
          valid: false,
          message: i18n.t('form.cvv2.invalidLength', { count: String(constraints.maxLength) }),
        };
      }
      if (
        !constraints.fixedLength &&
        (numbers.length < constraints.minLength || numbers.length > constraints.maxLength)
      ) {
        return {
          valid: false,
          message: i18n.t('form.cvv2.invalidLengthRange'),
        };
      }
      return { valid: true, message: '' };
    },
    inputMode: 'numeric',
    maskWithPasswordFont: true,
    maxLength: getCvv2Constraints().maxLength,
    onInput: (value) => {
      const constraints = getCvv2Constraints();
      const digitsOnly = extractNumbers(value).slice(0, constraints.maxLength);
      if (digitsOnly !== value) {
        cvv2Input.setValue(digitsOnly);
      }
      if (digitsOnly.length >= constraints.maxLength) {
        focusNextVisibleInputField(cvv2Input.element);
      }
    },
    rightAction: {
      icon: appIconHtml('icn-pinpad.svg'),
      label: i18n.t('form.virtualPinPad'),
      onClick: () => {
        if (!cvv2PinPad) {
          cvv2PinPad = new VirtualPinPad(cvv2Input.element, {
            maxLength: getCvv2Constraints().maxLength,
            onInput: (value) => {
              cvv2Input.setValue(value);
            },
          });
        }
        cvv2PinPad.open();
      },
    },
  });
  syncCvv2Constraints();

  // Expiry: separate Jalali month (01–12) and 2-digit year fields; one shared error row
  const expiryDateContainer = document.getElementById('expiry-date-container');
  expiryDateContainer.replaceChildren();
  expiryDateContainer.classList.add('expiry-date-group');

  const expiryGroupLabel = document.createElement('label');
  expiryGroupLabel.id = 'expiry-date-group-label';
  expiryGroupLabel.className = 'input-label';
  expiryGroupLabel.setAttribute('for', 'expiry-month');
  expiryGroupLabel.textContent = i18n.t('form.expiryDate');

  const expiryFieldsRow = document.createElement('div');
  expiryFieldsRow.className = 'expiry-date-fields-row';
  const expiryMonthSlot = document.createElement('div');
  expiryMonthSlot.className = 'expiry-date-slot expiry-date-slot-month';
  const expiryYearSlot = document.createElement('div');
  expiryYearSlot.className = 'expiry-date-slot expiry-date-slot-year';
  expiryFieldsRow.appendChild(expiryMonthSlot);
  expiryFieldsRow.appendChild(expiryYearSlot);

  const groupError = document.createElement('div');
  groupError.id = 'expiry-date-group-error';
  groupError.className = 'input-error';
  groupError.setAttribute('role', 'alert');
  groupError.setAttribute('aria-live', 'polite');
  groupError.style.visibility = 'hidden';

  expiryDateContainer.appendChild(expiryGroupLabel);
  expiryDateContainer.appendChild(expiryFieldsRow);

  function clearExpiryGroupValidation() {
    groupError.textContent = '';
    groupError.style.visibility = 'hidden';
    for (const inp of [expiryMonthInput, expiryYearInput]) {
      if (!inp) continue;
      inp.wrapper?.classList.remove('error');
      inp.inputContainer?.classList.remove('error');
      inp.element?.setAttribute('aria-invalid', 'false');
    }
  }

  function applyExpiryGroupValidation(result) {
    if (!expiryMonthInput || !expiryYearInput) return;
    const ok = result.valid;
    for (const inp of [expiryMonthInput, expiryYearInput]) {
      inp.wrapper.classList.toggle('error', !ok);
      if (inp.inputContainer) inp.inputContainer.classList.toggle('error', !ok);
      inp.element.setAttribute('aria-invalid', ok ? 'false' : 'true');
    }
    if (ok) {
      groupError.textContent = '';
      groupError.style.visibility = 'hidden';
    } else {
      groupError.textContent = result.message;
      groupError.style.visibility = 'visible';
    }
  }

  function validateExpiryDateGroup() {
    if (!expiryMonthInput || !expiryYearInput) return true;
    if (!shouldSendExpiryDateInPayRequest()) {
      clearExpiryGroupValidation();
      return true;
    }
    const result = validateExpiryDate(expiryMonthInput.getValue(), expiryYearInput.getValue());
    applyExpiryGroupValidation(result);
    if (!result.valid && navigator.vibrate) {
      navigator.vibrate(200);
    }
    return result.valid;
  }

  expiryMonthInput = new Input(expiryMonthSlot, {
    id: 'expiry-month',
    name: 'expiryMonth',
    type: 'tel',
    autocomplete: 'off',
    label: '',
    ariaLabel: i18n.t('form.expiryMonth'),
    placeholder: i18n.t('form.expiryMonth'),
    required: false,
    clearButtonAriaLabel: i18n.t('common.clear'),
    inputMode: 'numeric',
    maxLength: 2,
    omitInnerError: true,
    skipBlurValidate: true,
    liveValidation: false,
    onInput: (value) => {
      const digits = extractNumbers(value).slice(0, 2);
      if (digits !== value) {
        expiryMonthInput.setValue(digits);
      } else if (digits.length >= 2) {
        focusNextVisibleInputField(expiryMonthInput.element);
      }
      validateExpiryDateGroup();
    },
    onBlur: () => {
      let digits = extractNumbers(expiryMonthInput.getValue());
      if (digits.length === 1) {
        const n = parseInt(digits, 10);
        if (n >= 1 && n <= 9) {
          digits = digits.padStart(2, '0');
          expiryMonthInput.setValue(digits);
        }
      }
      validateExpiryDateGroup();
    },
  });

  expiryYearInput = new Input(expiryYearSlot, {
    id: 'expiry-year',
    name: 'expiryYear',
    type: 'tel',
    autocomplete: 'off',
    label: '',
    ariaLabel: i18n.t('form.expiryYear'),
    placeholder: i18n.t('form.expiryYear'),
    required: false,
    clearButtonAriaLabel: i18n.t('common.clear'),
    inputMode: 'numeric',
    maxLength: 2,
    omitInnerError: true,
    skipBlurValidate: true,
    liveValidation: false,
    rightAction: {
      icon: appIconHtml('icn-edit.svg'),
      label: i18n.t('common.edit'),
      onClick: () => {
        if (!isExpiryDateLockedFromCard) return;
        hasUserEnabledExpiryDateEdit = true;
        applyExpiryDateModeForSelectedCard();
        expiryMonthInput.focus();
      },
    },
    onInput: (value) => {
      const digits = extractNumbers(value).slice(0, 2);
      if (digits !== value) {
        expiryYearInput.setValue(digits);
      } else if (digits.length >= 2) {
        focusNextVisibleInputField(expiryYearInput.element);
      }
      validateExpiryDateGroup();
    },
    onBlur: () => {
      let digits = extractNumbers(expiryYearInput.getValue());
      if (digits.length === 1) {
        expiryYearInput.setValue(digits.padStart(2, '0'));
      }
      validateExpiryDateGroup();
    },
  });

  expiryDateContainer.appendChild(groupError);
  expiryMonthInput.element.setAttribute('aria-describedby', 'expiry-date-group-error');
  expiryYearInput.element.setAttribute('aria-describedby', 'expiry-date-group-error');

  expiryDateInput = {
    validate: validateExpiryDateGroup,
    clearValidation: clearExpiryGroupValidation,
    setValue(v) {
      const n = extractNumbers(v || '');
      if (n.length >= 4) {
        expiryMonthInput.setValue(n.slice(0, 2));
        expiryYearInput.setValue(n.slice(2, 4));
      } else {
        expiryMonthInput.setValue('');
        expiryYearInput.setValue('');
      }
      clearExpiryGroupValidation();
    },
    focus: () => {
      const m = extractNumbers(expiryMonthInput.getValue());
      const y = extractNumbers(expiryYearInput.getValue());
      if (m.length < 2) {
        expiryMonthInput.focus();
      } else if (y.length < 2) {
        expiryYearInput.focus();
      } else {
        expiryMonthInput.focus();
      }
    },
    get element() {
      return expiryMonthInput.element;
    },
  };
  applyExpiryDateModeForSelectedCard();

  // Captcha Input
  const captchaContainer = document.getElementById('captcha-container');

  // Create label separately (outside flex container)
  captchaLabelElement = document.createElement('label');
  captchaLabelElement.className = 'input-label';
  captchaLabelElement.setAttribute('for', 'captcha');
  captchaLabelElement.textContent = i18n.t('form.securityCode');
  captchaContainer.appendChild(captchaLabelElement);

  // Flex row: [ input + captcha image ] | audio — cluster keeps field + image aligned
  const captchaRow = document.createElement('div');
  captchaRow.className = 'captcha-input-row';

  const captchaCluster = document.createElement('div');
  captchaCluster.className = 'captcha-input-cluster';
  captchaRow.appendChild(captchaCluster);

  // Create input without label, with reload action inside (first in row)
  captchaInput = new Input(captchaCluster, {
    id: 'captcha',
    name: 'captcha',
    type: 'text',
    autocomplete: 'off',
    label: '',
    placeholder: i18n.t('form.captcha.placeholder'),
    required: true,
    requiredMessageKey: 'common.required',
    clearButtonAriaLabel: i18n.t('common.clear'),
    maxLength: captchaCodeLength,
    inputMode: 'numeric',
    onInput: (value) => {
      const digitsOnly = extractNumbers(value).slice(0, captchaCodeLength);
      if (digitsOnly !== value) {
        captchaInput.setValue(digitsOnly);
      }
      if (digitsOnly.length >= captchaCodeLength) {
        focusNextVisibleInputField(captchaInput.element);
      }
    },
    rightAction: {
      icon: appIconHtml('icn-refresh.svg'),
      label: i18n.t('form.reloadCaptcha'),
      onClick: () => {
        loadCaptchaImage(captchaImage);
      },
    },
  });

  // Hide the label inside input-wrapper since we have it separately
  const captchaInputWrapper = captchaCluster.querySelector('.input-wrapper');
  if (captchaInputWrapper) {
    const innerLabel = captchaInputWrapper.querySelector('.input-label');
    if (innerLabel) {
      innerLabel.style.display = 'none';
    }
  }

  // Create captcha image (will be attached after input visually)
  const captchaImage = document.createElement('img');
  captchaImage.className = 'captcha-image';
  captchaImage.alt = i18n.t('form.captchaImageAlt');
  captchaImage.onclick = () => {
    loadCaptchaImage(captchaImage);
  };

  // Append image after input wrapper (visually attached to the same cluster)
  captchaCluster.appendChild(captchaImage);

  // Create audio button (outside input, like OTP button)
  const captchaAudio = document.createElement('button');
  captchaAudio.type = 'button';
  captchaAudio.className = 'btn btn-primary btn-bordered captcha-audio-btn';
  captchaAudio.setAttribute('aria-label', i18n.t('form.captchaAudio'));
  captchaAudio.innerHTML = `
    <span class="captcha-audio-btn-label" data-i18n="form.audioPlay">${i18n.t('form.audioPlay')}</span>
    <span class="btn-icon" aria-hidden="true">
      ${appIconHtml('icn-volume.svg')}
    </span>
  `;
  captchaAudio.onclick = async () => {
    if (!captchaTokenKey) {
      await loadCaptchaImage(captchaImage);
      if (!captchaTokenKey) return;
    }

    captchaAudio.disabled = true;
    try {
      const captchaAudioBlob = await fetchCaptchaAudio(captchaTokenKey);
      await soundManager.playAudioBlob(captchaAudioBlob);
    } catch (err) {
      console.error(err);
      errorHandler.show({
        message: i18n.t('error.network'),
        mode: 'toast',
        type: 'error',
      });
    } finally {
      captchaAudio.disabled = false;
    }
  };

  captchaRow.appendChild(captchaAudio);
  captchaContainer.appendChild(captchaRow);

  loadCaptchaImage(captchaImage).catch(() => {});

  // OTP Input
  const otpContainer = document.getElementById('otp-input-container');

  // Create label separately (outside flex container)
  otpLabelElement = document.createElement('label');
  otpLabelElement.className = 'input-label';
  otpLabelElement.setAttribute('for', 'otp');
  otpLabelElement.textContent = i18n.t('form.otp');
  otpContainer.appendChild(otpLabelElement);

  // Create flex wrapper for input and button
  const otpWrapper = document.createElement('div');
  otpWrapper.className = 'otp-input-row';

  // Create input without label
  otpInput = new Input(otpWrapper, {
    id: 'otp',
    name: 'otp',
    type: 'password',
    autocomplete: 'off',
    label: '',
    placeholder: i18n.t('form.otp.placeholder'),
    required: true,
    requiredMessageKey: 'form.otp.required',
    clearButtonAriaLabel: i18n.t('common.clear'),
    validator: validateOTP,
    inputMode: 'numeric',
    maskWithPasswordFont: true,
    maxLength: otpLengthConfig.maxLength,
    onInput: (value) => {
      const digitsOnly = extractNumbers(value).slice(0, otpLengthConfig.maxLength);
      if (digitsOnly !== value) {
        otpInput.setValue(digitsOnly);
      }
      if (digitsOnly.length >= otpLengthConfig.maxLength) {
        focusNextVisibleInputField(otpInput.element);
      }
    },
    rightAction: {
      icon: appIconHtml('icn-pinpad.svg'),
      label: i18n.t('form.virtualPinPad'),
      onClick: () => {
        if (!otpPinPad) {
          otpPinPad = new VirtualPinPad(otpInput.element, {
            maxLength: otpLengthConfig.maxLength,
            onInput: (value) => {
              otpInput.setValue(value);
            },
            onComplete: (value) => {
              otpPinPad.close();
            },
          });
        }
        otpPinPad.open();
      },
    },
  });

  // Make OTP input wrapper flex to fill remaining space
  const otpInputWrapper = otpWrapper.querySelector('.input-wrapper');
  if (otpInputWrapper) {
    // Hide the label inside input-wrapper since we have it separately
    const innerLabel = otpInputWrapper.querySelector('.input-label');
    if (innerLabel) {
      innerLabel.style.display = 'none';
    }
  }

  const getOtpButton = document.createElement('button');
  getOtpButton.type = 'button';
  getOtpButton.id = 'get-otp-button';
  getOtpButton.className = 'btn btn-success btn-bordered';
  getOtpButton.textContent = i18n.t('form.getOtp');
  getOtpButton.onclick = async () => {
    syncGetOtpButtonState();
    const btn = document.getElementById('get-otp-button');
    if (btn?.disabled) return;

    if (!validateFieldsForOtpRequest()) {
      return;
    }

    const cardPart = buildCardPayloadForIpg();
    const key = getOtpCardStateKey();
    if (!cardPart || !key) {
      errorHandler.show({
        message: i18n.t('form.validation.error'),
        mode: 'toast',
        type: 'error',
      });
      return;
    }

    otpRequestInFlight = true;
    syncGetOtpButtonState();

    try {
      await ipgService.sendTransactionOtp(cardPart, {
        captchaToken: captchaTokenKey,
        captchaResponse: captchaInput.getValue(),
      });

      ensureOtpTriesForKey(key);
      otpTriesRemainingByCardKey[key] = Math.max(
        0,
        otpTriesRemainingByCardKey[key] - 1
      );
      otpCooldownUntilByCardKey[key] =
        Date.now() + Math.max(1, transactionOtpSettings.nextTrySeconds) * 1000;

      errorHandler.show({
        message: i18n.t('form.getOtpSuccess'),
        mode: 'toast',
        type: 'success',
      });

      maybeStartOtpButtonCountdownTicker();
      syncGetOtpButtonState();
    } catch (err) {
      console.error(err);
      errorHandler.show({
        message: err.message || i18n.t('error.network'),
        mode: 'toast',
        type: 'error',
      });
    } finally {
      otpRequestInFlight = false;
      syncGetOtpButtonState();
    }
  };
  otpWrapper.appendChild(getOtpButton);
  syncGetOtpButtonState();
  otpContainer.appendChild(otpWrapper);
  syncOtpLockedFieldsState();

  // Mobile Input (hidden initially)
  const mobileContainer = document.getElementById('mobile-input-container');
  mobileInput = new Input(mobileContainer, {
    id: 'mobile',
    name: 'mobile',
    type: 'tel',
    autocomplete: 'off',
    label: i18n.t('form.mobile'),
    placeholder: i18n.t('form.mobile.placeholder'),
    validator: validateMobile,
    inputMode: 'tel',
    onInput: (value) => {
      const digitsOnly = extractNumbers(value);
      if (digitsOnly !== value) {
        mobileInput.setValue(digitsOnly);
      }
      if (digitsOnly.length >= 11) {
        focusNextVisibleInputField(mobileInput.element);
      }
    },
  });

  // Email Input (hidden initially)
  const emailContainer = document.getElementById('email-input-container');
  emailInput = new Input(emailContainer, {
    id: 'email',
    name: 'email',
    type: 'email',
    autocomplete: 'off',
    label: i18n.t('form.email'),
    placeholder: i18n.t('form.email.placeholder'),
    validator: validateEmail,
  });
}

function updateBankLogo(bank) {
  if (!cardNumberInput || !cardNumberInput.element) {
    return;
  }

  const wrapper = cardNumberInput.element.closest('.input-wrapper');
  if (!wrapper) return;

  const container = wrapper.querySelector('.input-container');
  if (!container) return;

  let logoWrapper = container.querySelector('.card-bank-logo');
  if (!logoWrapper) {
    logoWrapper = document.createElement('div');
    logoWrapper.className = 'card-bank-logo';
    // Insert as first child so that in LTR it appears on the left,
    // and in RTL (with flex-row) it appears on the right – opposite side of actions
    container.insertBefore(logoWrapper, container.firstChild);
  }

  // If no bank detected or no valid logo, hide the logo inside input
  if (!bank || !bank.name) {
    logoWrapper.innerHTML = '';
    logoWrapper.classList.add('hidden');
    return;
  }

  const logoPath = getBankLogo(bank.name);
  // If getBankLogo falls back to generic info icon or returns nothing, hide in input
  if (!logoPath || logoPath.includes('/assets/images/icons/icn-square-info.svg')) {
    logoWrapper.innerHTML = '';
    logoWrapper.classList.add('hidden');
    return;
  }

  logoWrapper.innerHTML = `<img src="${logoPath}" alt="${bank.name}" />`;
  logoWrapper.classList.remove('hidden');
}

function toggleCardList() {
  if (isMobileCardListViewport()) {
    if (typeof openCardListSheetFn === 'function') {
      void openCardListSheetFn();
    }
  } else if (cardDropdown) {
    cardDropdown.updateItems(buildCardDropdownItems());
    cardDropdown.toggle();
  }
}

async function initializeTransactionInfo() {
  const container = document.getElementById('transaction-info');

  const init = getPaymentInitData();

  let txPayload = null;
  try {
    const res = await ipgService.getTransaction();
    txPayload = res?.data ?? null;
  } catch (e) {
    console.error('getTransaction failed:', e);
  }

  const terminalFromSession =
    init?.terminalNumber != null && String(init.terminalNumber).trim() !== ''
      ? String(init.terminalNumber).trim()
      : null;
  const terminalFromApi =
    txPayload?.terminalNumber != null ? String(txPayload.terminalNumber).trim() : null;
  const terminalStr = terminalFromSession ?? terminalFromApi ?? '12345678';

  const merchantNumStr =
    txPayload?.merchant?.merchantNumber != null
      ? String(txPayload.merchant.merchantNumber).trim()
      : '';

  const terminalMerchantDisplay =
    merchantNumStr !== '' && terminalStr !== ''
      ? `${terminalStr} / ${merchantNumStr}`
      : merchantNumStr !== ''
        ? merchantNumStr
        : terminalStr;

  const transactionData = {
    merchant: txPayload?.merchant?.merchantName ?? i18n.t('transaction.demo.merchantName'),
    amount: typeof txPayload?.totalAmount === 'number' ? txPayload.totalAmount : 100000,
    terminal: terminalMerchantDisplay,
    site:
      txPayload?.merchant?.merchantWebSite?.replace(/^https?:\/\//, '')?.replace(/\/$/, '') ??
      i18n.t('transaction.demo.siteHost'),
  };

  const transactionDescriptionRaw =
    txPayload?.merchant?.merchantDescription ?? txPayload?.merchant?.description ?? '';
  const transactionDescription = String(transactionDescriptionRaw).replace(/\r\n/g, '\n').trim();

  const durationSeconds = parseTimeSpanToSeconds(txPayload?.appSettings?.cardViewTimeOut);
  const merchantLogoUrl = resolveMerchantLogoUrl(txPayload?.merchant?.merchantLogoUri);
  const prCodeCandidate = txPayload?.appSettings?.prCodesPanLimits?.prCode;
  currentTransactionPrCode =
    typeof prCodeCandidate === 'number' && !Number.isNaN(prCodeCandidate) ? prCodeCandidate : null;
  const transactionTypeInfo = getTransactionTypeInfo(currentTransactionPrCode, (k) => i18n.t(k));

  const rawOtp = txPayload?.appSettings?.otpSettings;
  const maxTriesFromApi =
    rawOtp != null && typeof rawOtp.maxTries === 'number' && rawOtp.maxTries >= 0
      ? Math.floor(rawOtp.maxTries)
      : 5;
  transactionOtpSettings = {
    maxTries: maxTriesFromApi,
    nextTrySeconds: parseTimeSpanToSeconds(
      typeof rawOtp?.nextTryTime === 'string' ? rawOtp.nextTryTime : '00:02:00'
    ),
  };
  lockCardNumberDuringOtpCooldown =
    typeof rawOtp?.lockCardNumberDuringCooldown === 'boolean'
      ? rawOtp.lockCardNumberDuringCooldown
      : getDefaultLockCardNumberDuringOtpCooldown();

  // Convert amount to Tomans (divide by 10)
  const amountInTomans = Math.floor(transactionData.amount / 10);
  const amountInWords = numberToWordsByLang(amountInTomans, i18n.getLanguage());
  const amountLocale = getNumberLocaleForLang(i18n.getLanguage());
  const txTypeIconMask = `<span class="app-icon" style="--app-icon-src:url('${transactionTypeInfo.icon}')" aria-hidden="true"></span>`;

  container.innerHTML = `
    <div class="transaction-summary-card">
      <div class="transaction-info-item">
        <div class="transaction-info-icon">
          ${appIconHtml('icn-shopping-bag.svg')}
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label" data-transaction-field="merchant">${i18n.t('transaction.merchant')}</div>
          <div class="transaction-info-value">${transactionData.merchant}</div>
        </div>
      </div>
      <div class="transaction-info-item">
        <div class="transaction-info-icon">
          ${appIconHtml('icn-cash-banknote.svg')}
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label" data-transaction-field="amount">${i18n.t('transaction.amount')}</div>
          <div class="transaction-info-value">
            <div class="transaction-amount-rial" data-amount="${transactionData.amount}">${transactionData.amount.toLocaleString(amountLocale)} ${i18n.t('transaction.rial')}</div>
            <div class="transaction-amount-toman">${amountInWords} ${i18n.t('transaction.toman')}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="more-content" id="more-transaction-info">
      <div class="transaction-info-item">
        <div class="transaction-info-icon">
          ${txTypeIconMask}
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label" data-transaction-field="transactionType">${i18n.t('transaction.transactionType')}</div>
          <div class="transaction-info-value" id="transaction-type-value">${transactionTypeInfo.label}</div>
        </div>
      </div>
      <div class="transaction-info-item">
        <div class="transaction-info-icon">
          ${appIconHtml('icn-shop.svg')}
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label" data-transaction-field="terminal">${i18n.t('transaction.terminal')}</div>
          <div class="transaction-info-value">${transactionData.terminal}</div>
        </div>
      </div>
      <div class="transaction-info-item">
        <div class="transaction-info-icon">
          ${appIconHtml('icn-world.svg')}
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label" data-transaction-field="site">${i18n.t('transaction.site')}</div>
          <div class="transaction-info-value">${transactionData.site}</div>
        </div>
      </div>
      <div class="transaction-info-item transaction-description-item" id="transaction-description-block" hidden>
        <div class="transaction-info-icon">
          ${appIconHtml('icn-square-info.svg')}
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label" data-transaction-field="description">${i18n.t('transaction.description')}</div>
          <div class="transaction-description-wrap">
            <div id="transaction-description-text" class="transaction-info-value transaction-description-value is-collapsed"></div>
            <button type="button" class="transaction-description-toggle" id="transaction-description-toggle" hidden aria-expanded="false">
              ${appIconHtml('icn-square-plus.svg')}
            </button>
          </div>
        </div>
      </div>
    </div>
    <button type="button" class="more-toggle" id="more-toggle">${i18n.t('transaction.showMore')}</button>
  `;

  const moreToggle = document.getElementById('more-toggle');
  const moreContent = document.getElementById('more-transaction-info');

  if (moreToggle && moreContent) {
    moreToggle.onclick = () => {
      const isShowing = moreContent.classList.contains('show');
      if (isShowing) {
        moreContent.classList.remove('show');
        moreToggle.textContent = i18n.t('transaction.showMore');
      } else {
        moreContent.classList.add('show');
        moreToggle.textContent = i18n.t('transaction.showLess');
      }
    };
  }

  wireTransactionDescriptionUi(transactionDescription);

  // Initialize pay button label with current amount
  setPayButtonState('active');

  paymentReceiptMerchantContext = {
    merchant: transactionData.merchant,
    merchantNumber:
      txPayload?.merchant?.merchantNumber != null ? String(txPayload.merchant.merchantNumber) : '',
    terminalNumber: terminalStr,
    gatewayCode:
      txPayload?.appSettings?.gatewayCode ??
      txPayload?.gatewayCode ??
      txPayload?.merchant?.gatewayCode ??
      '',
    paymentFacilitator:
      txPayload?.merchant?.paymentFacilitatorName ?? txPayload?.paymentFacilitatorName ?? '',
    merchantSite: transactionData.site,
  };
  paymentReceiptReturnSeconds = parseTimeSpanToSeconds(txPayload?.appSettings?.receiptViewTimeOut);

  return { durationSeconds, merchantLogoUrl };
}

function getTransactionAmountFromDom() {
  const rialElement = document.querySelector('.transaction-amount-rial');
  if (!rialElement) return null;
  const amountAttr = rialElement.getAttribute('data-amount');
  if (!amountAttr) return null;
  const amount = parseInt(amountAttr, 10);
  return Number.isNaN(amount) ? null : amount;
}

const transactionFieldToI18nKey = {
  terminal: 'transaction.terminal',
  site: 'transaction.site',
  transactionType: 'transaction.transactionType',
  description: 'transaction.description',
  merchant: 'transaction.merchant',
  amount: 'transaction.amount',
};

function refreshTransactionTypeValue() {
  const valueEl = document.getElementById('transaction-type-value');
  if (!valueEl) return;
  const typeInfo = getTransactionTypeInfo(currentTransactionPrCode, (k) => i18n.t(k));
  valueEl.textContent = typeInfo.label;
}

/**
 * Re-format rial / toman lines from `data-amount` (used after language change).
 */
function refreshTransactionAmountValues() {
  const amount = getTransactionAmountFromDom();
  const rialEl = document.querySelector('.transaction-amount-rial');
  const tomanEl = document.querySelector('.transaction-amount-toman');
  if (!rialEl || !tomanEl) return;
  if (typeof amount !== 'number' || Number.isNaN(amount)) return;

  const lang = typeof i18n.getLanguage === 'function' ? i18n.getLanguage() : 'fa';
  const locale = getNumberLocaleForLang(lang);
  rialEl.textContent = `${amount.toLocaleString(locale)} ${i18n.t('transaction.rial')}`;
  rialEl.setAttribute('data-amount', String(amount));

  const amountInTomans = Math.floor(amount / 10);
  const amountInWords = numberToWordsByLang(amountInTomans, lang);
  tomanEl.textContent = `${amountInWords} ${i18n.t('transaction.toman')}`;
}

function setPayButtonState(state) {
  const payButton = document.getElementById('pay-button');
  if (!payButton) return;

  const amount = getTransactionAmountFromDom();
  const lang = typeof i18n.getLanguage === 'function' ? i18n.getLanguage() : 'fa';
  const locale = getNumberLocaleForLang(lang);

  if (state === 'active') {
    if (typeof amount === 'number') {
      const formattedAmount = amount.toLocaleString(locale);
      payButton.textContent = i18n.t('form.pay.secureWithAmount', {
        amount: formattedAmount,
        currency: i18n.t('transaction.rial'),
      });
    } else {
      payButton.textContent = i18n.t('form.pay.securePrefix');
    }
    payButton.disabled = false;
  } else if (state === 'disabled') {
    payButton.textContent = i18n.t('form.pay.disabled');
    payButton.disabled = false;
  } else if (state === 'processing') {
    payButton.textContent = i18n.t('form.pay.processing');
    payButton.disabled = true;
  }
}

/** Fallback when merchant logo is missing or fails to load (SVG). */
const DEFAULT_MERCHANT_LOGO_URL = '/assets/images/logo-mini.svg';

const TRANSACTION_DESCRIPTION_MAX_CHARS = 800;

/**
 * Multi-line transaction description under type: clamp to 2 lines unless expanded; toggle only if overflow.
 * @param {string} descriptionText
 */
function wireTransactionDescriptionUi(descriptionText) {
  const block = document.getElementById('transaction-description-block');
  const textEl = document.getElementById('transaction-description-text');
  const toggle = document.getElementById('transaction-description-toggle');
  const icon = toggle?.querySelector('.app-icon') ?? null;
  if (!block || !textEl || !toggle || !icon) return;

  const normalized = String(descriptionText ?? '')
    .replace(/\r\n/g, '\n')
    .trim();
  const clipped =
    normalized.length > TRANSACTION_DESCRIPTION_MAX_CHARS
      ? `${normalized.slice(0, TRANSACTION_DESCRIPTION_MAX_CHARS)}…`
      : normalized;

  if (!clipped) {
    block.hidden = true;
    textEl.textContent = '';
    toggle.hidden = true;
    return;
  }

  block.hidden = false;
  textEl.textContent = clipped;
  textEl.classList.remove('is-expanded');
  textEl.classList.add('is-collapsed');
  toggle.hidden = true;
  setAppIconFile(icon, 'icn-square-plus.svg');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', i18n.t('transaction.descriptionExpand'));

  const applyOverflow = () => {
    textEl.classList.add('is-collapsed');
    textEl.classList.remove('is-expanded');
    const overflow = textEl.scrollHeight - textEl.clientHeight > 2;
    if (overflow) {
      toggle.hidden = false;
      toggle.setAttribute('aria-label', i18n.t('transaction.descriptionExpand'));
    } else {
      textEl.classList.remove('is-collapsed');
      toggle.hidden = true;
    }
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(applyOverflow);
  });

  toggle.onclick = () => {
    const expand = !textEl.classList.contains('is-expanded');
    textEl.classList.toggle('is-expanded', expand);
    textEl.classList.toggle('is-collapsed', !expand);
    setAppIconFile(icon, expand ? 'icn-square-minus.svg' : 'icn-square-plus.svg');
    toggle.setAttribute('aria-expanded', expand ? 'true' : 'false');
    toggle.setAttribute(
      'aria-label',
      i18n.t(expand ? 'transaction.descriptionCollapse' : 'transaction.descriptionExpand')
    );
  };
}

function initializePartnerLogos(merchantLogoUrl) {
  const container = document.getElementById('partner-logos');
  const section = document.getElementById('partner-logos-section');
  if (!container || !section) return;

  const primarySrc = merchantLogoUrl || DEFAULT_MERCHANT_LOGO_URL;
  const logos = [primarySrc];

  section.classList.remove('hidden');
  container.innerHTML = '';

  logos.forEach((src) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'partner-logo';
    img.alt = i18n.t('accessibility.partnerLogo');
    img.addEventListener(
      'error',
      () => {
        if (img.dataset.fallbackApplied === '1') return;
        img.dataset.fallbackApplied = '1';
        img.src = DEFAULT_MERCHANT_LOGO_URL;
      },
      { once: true }
    );
    container.appendChild(img);
  });

  container.classList.add('single-logo');
}

/** Illustration for cancel confirmation (served from Vite root `src/assets`). */
const cancelConfirmImageUrl = '/assets/images/icons/icn-logout.svg';

/**
 * Open cancel confirmation: desktop = modal, mobile = bottom sheet (via Modal).
 */
function openCancelPaymentConfirm() {
  let modalRef = null;
  modalRef = new Modal({
    title: i18n.t('cancelConfirm.title'),
    description: i18n.t('cancelConfirm.description'),
    image: cancelConfirmImageUrl,
    imageExtraClass: 'modal-image-icon-lead',
    imageAlt: i18n.t('cancelConfirm.imageAlt'),
    closeButtonAriaLabel: i18n.t('common.close'),
    buttons: [
      {
        text: i18n.t('cancelConfirm.continuePay'),
        type: 'success',
        onClick: () => {},
      },
      {
        text: i18n.t('cancelConfirm.confirmLeave'),
        type: 'danger',
        onClick: () => {
          window.location.href = '/';
        },
      },
    ],
    onClose: () => {
      modalRef?.destroy();
      modalRef = null;
    },
  });
  modalRef.open();
}

function getPaymentReceiptCardDisplay(paymentReceipt) {
  if (paymentReceipt?.maskedPan != null && String(paymentReceipt.maskedPan).trim() !== '') {
    return String(paymentReceipt.maskedPan).replace(/\*/g, '●');
  }
  const digits = extractNumbers(cardNumberInput?.getValue?.() || '');
  if (digits.length >= 4) {
    return `****${digits.slice(-4)}`;
  }
  return '—';
}

function formatPaymentReceiptDate(isoStr) {
  if (!isoStr) return '—';
  const ms = Date.parse(isoStr);
  if (Number.isNaN(ms)) {
    return String(isoStr);
  }
  const locale = getNumberLocaleForLang(i18n.getLanguage());
  const dt = new Date(ms);
  const datePart = dt.toLocaleDateString(locale);
  const timePart = dt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return `${datePart} - ${timePart}`;
}

function setPaymentReceiptColumnsCount() {
  const columnsWrap = document.getElementById('payment-receipt-columns');
  if (!columnsWrap) return;
  const visibleColumns = Array.from(columnsWrap.querySelectorAll('.receipt-info-column')).filter(
    (col) => !col.hasAttribute('hidden')
  ).length;
  const columns = Math.max(1, Math.min(3, visibleColumns));
  columnsWrap.setAttribute('data-columns', String(columns));
}

function isBillTransactionType() {
  return [40, 41, 42, 43].includes(currentTransactionPrCode);
}

function isInstallmentTransactionType() {
  return currentTransactionPrCode === 71;
}

function appendReceiptExtraRow(container, label, value) {
  if (!container || value == null || String(value).trim() === '') return;
  const row = document.createElement('div');
  row.className = 'receipt-info-row';
  const labelEl = document.createElement('span');
  labelEl.className = 'receipt-info-row-label';
  labelEl.textContent = label;
  const valueEl = document.createElement('span');
  valueEl.className = 'receipt-info-row-value';
  valueEl.textContent = String(value);
  row.appendChild(labelEl);
  row.appendChild(valueEl);
  container.appendChild(row);
}

function renderPaymentReceiptExtraColumn(paymentReceipt) {
  const extraColumn = document.getElementById('payment-receipt-extra-column');
  const extraTitle = document.getElementById('payment-receipt-extra-title');
  const extraRows = document.getElementById('payment-receipt-extra-rows');
  if (!extraColumn || !extraTitle || !extraRows) return;

  extraRows.replaceChildren();

  const showInstallment = isInstallmentTransactionType();
  const showBill = isBillTransactionType();
  if (!showInstallment && !showBill) {
    extraColumn.setAttribute('hidden', '');
    setPaymentReceiptColumnsCount();
    return;
  }

  if (showInstallment) {
    extraTitle.setAttribute('data-i18n', 'receipt.sectionInstallmentInfo');
    extraTitle.textContent = i18n.t('receipt.sectionInstallmentInfo');
    appendReceiptExtraRow(
      extraRows,
      i18n.t('receipt.installmentCount'),
      paymentReceipt.installmentCount
    );
    appendReceiptExtraRow(
      extraRows,
      i18n.t('receipt.installmentAmount'),
      paymentReceipt.installmentAmount
    );
    appendReceiptExtraRow(
      extraRows,
      i18n.t('receipt.installmentNumber'),
      paymentReceipt.installmentNumber
    );
  }

  if (showBill) {
    extraTitle.setAttribute('data-i18n', 'receipt.sectionBillInfo');
    extraTitle.textContent = i18n.t('receipt.sectionBillInfo');
    appendReceiptExtraRow(extraRows, i18n.t('receipt.billInfoId'), paymentReceipt.billInfoId);
    appendReceiptExtraRow(extraRows, i18n.t('receipt.billId'), paymentReceipt.billId);
    appendReceiptExtraRow(extraRows, i18n.t('receipt.payId'), paymentReceipt.payId);
  }

  if (extraRows.children.length === 0) {
    extraColumn.setAttribute('hidden', '');
  } else {
    extraColumn.removeAttribute('hidden');
  }
  setPaymentReceiptColumnsCount();
}

function setPaymentReceiptOptionalRow(rowId, valueElId, value, displayValue = value) {
  const row = document.getElementById(rowId);
  const el = document.getElementById(valueElId);
  if (!row || !el) return;
  if (value != null && String(value).trim() !== '') {
    el.textContent = String(displayValue);
    row.hidden = false;
  } else {
    row.hidden = true;
  }
}

function getCurrencyAmountLabel(amount) {
  const lang = typeof i18n.getLanguage === 'function' ? i18n.getLanguage() : 'fa';
  const locale = getNumberLocaleForLang(lang);
  return `${Number(amount).toLocaleString(locale)} ${i18n.t('transaction.rial')}`;
}

function summarizeDigitalReceipt(value) {
  const text = String(value ?? '').trim();
  if (text.length <= 30) return text;
  return `${text.slice(0, 14)}...${text.slice(-10)}`;
}

function getReceiptIssuerBankName(paymentReceipt) {
  const bySelectedCard = selectedSavedCardForApi?.bankName;
  if (bySelectedCard) return String(bySelectedCard);
  const fromInput = detectBank(cardNumberInput?.getValue?.() || '')?.name;
  if (fromInput) return String(fromInput);
  const fromMasked = detectBank(paymentReceipt?.maskedPan || '')?.name;
  if (fromMasked) return String(fromMasked);
  return '';
}

function renderReceiptIssuerBankRow(paymentReceipt) {
  const bankRow = document.getElementById('payment-receipt-row-bank');
  const bankValueEl = document.getElementById('payment-receipt-issuer-bank');
  if (!bankRow || !bankValueEl) return;

  const bankName = getReceiptIssuerBankName(paymentReceipt);
  if (!bankName) {
    bankRow.hidden = true;
    bankValueEl.textContent = '';
    return;
  }

  const lang = typeof i18n.getLanguage === 'function' ? i18n.getLanguage() : 'fa';
  const localizedName = getLocalizedBankName(bankName, lang) || bankName;
  const logoPath = getBankLogo(bankName);
  const hasLogo = Boolean(logoPath && !logoPath.includes('icn-square-info.svg'));
  bankValueEl.innerHTML = hasLogo
    ? `<span class="receipt-bank-value"><img class="receipt-bank-logo" src="${logoPath}" alt="${localizedName}" /><span>${localizedName}</span></span>`
    : localizedName;
  bankRow.hidden = false;
}

function clearPaymentReceiptReturnTimer() {
  if (paymentReceiptReturnIntervalId != null) {
    clearInterval(paymentReceiptReturnIntervalId);
    paymentReceiptReturnIntervalId = null;
  }
}

function setTimerProgressIndicator(progressEl, ratio) {
  if (!progressEl) return;
  const safeRatio = Math.max(0, Math.min(1, Number(ratio)));
  progressEl.style.setProperty('--timer-progress', String(safeRatio));
}

function isButtonClickLocked(buttonEl) {
  return Boolean(buttonEl && clickLockMap.get(buttonEl));
}

function lockButtonClick(buttonEl) {
  if (!buttonEl) return;
  clickLockMap.set(buttonEl, true);
  buttonEl.disabled = true;
  buttonEl.setAttribute('aria-disabled', 'true');
}

function unlockButtonClick(buttonEl) {
  if (!buttonEl) return;
  clickLockMap.set(buttonEl, false);
  buttonEl.disabled = false;
  buttonEl.removeAttribute('aria-disabled');
}

function getMerchantReturnUrl() {
  if (paymentReceiptRedirectUrl) return paymentReceiptRedirectUrl;
  const site = String(paymentReceiptMerchantContext?.merchantSite || '').trim();
  if (!site) return '';
  if (/^https?:\/\//i.test(site)) return site;
  return `https://${site}`;
}

function syncPaymentReceiptReturnTimer() {
  clearPaymentReceiptReturnTimer();
  const timerWrap = document.getElementById('payment-receipt-return-timer');
  const timerValue = document.getElementById('payment-receipt-return-time-value');
  const timerProgress = timerWrap?.querySelector('.timer-progress');
  if (!timerWrap || !timerValue) return;

  const totalSeconds = Math.max(0, Number(paymentReceiptReturnSeconds) || 0);
  let remaining = totalSeconds;
  if (remaining <= 0 || !getMerchantReturnUrl()) {
    timerWrap.hidden = true;
    return;
  }

  timerWrap.hidden = false;
  timerWrap.classList.remove('warning', 'danger');
  timerValue.textContent = formatSecondsAsMmSs(remaining);
  setTimerProgressIndicator(timerProgress, totalSeconds > 0 ? remaining / totalSeconds : 0);
  paymentReceiptReturnIntervalId = setInterval(() => {
    remaining -= 1;
    const ratio = totalSeconds > 0 ? remaining / totalSeconds : 0;
    timerWrap.classList.toggle('danger', ratio <= 1 / 3);
    timerWrap.classList.toggle('warning', ratio > 1 / 3 && ratio <= 2 / 3);
    if (remaining <= 0) {
      timerValue.textContent = '00:00';
      setTimerProgressIndicator(timerProgress, 0);
      clearPaymentReceiptReturnTimer();
      const url = getMerchantReturnUrl();
      if (url) {
        window.location.href = url;
      }
      return;
    }
    timerValue.textContent = formatSecondsAsMmSs(remaining);
    setTimerProgressIndicator(timerProgress, totalSeconds > 0 ? remaining / totalSeconds : 0);
  }, 1000);
}

/**
 * Fill inline success receipt from pay API `paymentReceipt` and merchant context.
 */
function fillPaymentReceiptFromService(paymentReceipt) {
  if (!paymentReceipt) return;

  lastPaymentReceiptData = { ...paymentReceipt };

  const success = paymentReceipt.isSuccess !== false;
  const typeInfo = getTransactionTypeInfo(currentTransactionPrCode, (k) => i18n.t(k));

  const statusBadge = document.getElementById('payment-receipt-status-badge');
  const title = document.getElementById('payment-receipt-title');
  const subtitle = document.getElementById('payment-receipt-subtitle');
  const amountEl = document.getElementById('payment-receipt-amount');
  const headlineEl = document.getElementById('payment-receipt-headline');
  const digitalReceiptEl = document.getElementById('payment-receipt-digital-receipt');

  if (statusBadge) {
    statusBadge.className = `badge badge-${success ? 'success' : 'danger'}`;
    statusBadge.textContent = success
      ? i18n.t('receipt.statusSuccessDetail')
      : i18n.t('receipt.statusFailedDetail');
  }
  if (title) {
    title.textContent = success ? i18n.t('receipt.success') : i18n.t('receipt.failed');
  }
  if (subtitle) {
    const desc =
      typeof paymentReceipt.resultDescription === 'string' &&
      paymentReceipt.resultDescription.trim() !== ''
        ? paymentReceipt.resultDescription
        : success
          ? i18n.t('receipt.paymentSuccessDesc')
          : i18n.t('receipt.paymentFailedDesc');
    subtitle.textContent = desc;
  }

  const totalAmount =
    typeof paymentReceipt.totalAmount === 'number'
      ? paymentReceipt.totalAmount
      : typeof paymentReceipt.affectiveAmount === 'number'
        ? paymentReceipt.affectiveAmount
        : null;
  const affectiveAmount =
    typeof paymentReceipt.affectiveAmount === 'number' ? paymentReceipt.affectiveAmount : totalAmount;
  const discountAmount =
    typeof totalAmount === 'number' && typeof affectiveAmount === 'number'
      ? Math.max(0, totalAmount - affectiveAmount)
      : null;

  if (amountEl && affectiveAmount != null && !Number.isNaN(affectiveAmount)) {
    amountEl.textContent = getCurrencyAmountLabel(affectiveAmount);
  }

  if (headlineEl) {
    headlineEl.textContent = typeInfo.label;
  }

  const traceVal =
    paymentReceipt.traceNo != null && String(paymentReceipt.traceNo).trim() !== ''
      ? String(paymentReceipt.traceNo)
      : paymentReceipt.ipgTransactionId != null
        ? String(paymentReceipt.ipgTransactionId)
        : '';
  const digitalReceiptRaw =
    paymentReceipt.receiptRefNum ?? paymentReceipt.receiptEnc ?? paymentReceipt.receiptNonce ?? '';
  const cardDisplay = getPaymentReceiptCardDisplay(paymentReceipt);
  if (digitalReceiptEl) {
    const text = summarizeDigitalReceipt(digitalReceiptRaw);
    digitalReceiptEl.textContent = text;
    digitalReceiptEl.setAttribute('title', String(digitalReceiptRaw || ''));
  }

  setPaymentReceiptOptionalRow(
    'payment-receipt-row-transaction-type',
    'payment-receipt-transaction-type',
    typeInfo.label
  );
  setPaymentReceiptOptionalRow(
    'payment-receipt-row-status',
    'payment-receipt-status-badge',
    success ? i18n.t('receipt.success') : i18n.t('receipt.failed')
  );
  setPaymentReceiptOptionalRow('payment-receipt-row-trace', 'payment-receipt-trace', traceVal);
  setPaymentReceiptOptionalRow(
    'payment-receipt-row-digital-receipt',
    'payment-receipt-digital-receipt',
    digitalReceiptRaw,
    summarizeDigitalReceipt(digitalReceiptRaw)
  );
  setPaymentReceiptOptionalRow(
    'payment-receipt-row-rrn',
    'payment-receipt-rrn',
    paymentReceipt.rrn != null ? String(paymentReceipt.rrn) : ''
  );
  setPaymentReceiptOptionalRow(
    'payment-receipt-row-card',
    'payment-receipt-card-number',
    cardDisplay === '—' ? '' : cardDisplay
  );
  renderReceiptIssuerBankRow(paymentReceipt);
  setPaymentReceiptOptionalRow(
    'payment-receipt-row-date',
    'payment-receipt-date',
    formatPaymentReceiptDate(paymentReceipt.receiptDate)
  );
  setPaymentReceiptOptionalRow(
    'payment-receipt-row-total-amount',
    'payment-receipt-total-amount',
    totalAmount != null ? String(totalAmount) : '',
    totalAmount != null ? getCurrencyAmountLabel(totalAmount) : ''
  );
  setPaymentReceiptOptionalRow(
    'payment-receipt-row-discount-amount',
    'payment-receipt-discount-amount',
    discountAmount != null ? String(discountAmount) : '',
    discountAmount != null ? getCurrencyAmountLabel(discountAmount) : ''
  );
  setPaymentReceiptOptionalRow(
    'payment-receipt-row-affective-amount',
    'payment-receipt-affective-amount',
    affectiveAmount != null ? String(affectiveAmount) : '',
    affectiveAmount != null ? getCurrencyAmountLabel(affectiveAmount) : ''
  );

  setPaymentReceiptOptionalRow(
    'payment-receipt-row-merchant-number',
    'payment-receipt-merchant-number',
    paymentReceiptMerchantContext?.merchantNumber
  );
  setPaymentReceiptOptionalRow(
    'payment-receipt-row-terminal',
    'payment-receipt-terminal',
    paymentReceipt.terminalNumber != null
      ? String(paymentReceipt.terminalNumber)
      : paymentReceiptMerchantContext?.terminalNumber
  );
  setPaymentReceiptOptionalRow(
    'payment-receipt-row-gateway-code',
    'payment-receipt-gateway-code',
    paymentReceiptMerchantContext?.gatewayCode
  );
  setPaymentReceiptOptionalRow(
    'payment-receipt-row-facilitator',
    'payment-receipt-facilitator',
    paymentReceiptMerchantContext?.paymentFacilitator
  );
  setPaymentReceiptOptionalRow(
    'payment-receipt-row-merchant-name',
    'payment-receipt-merchant-name',
    paymentReceiptMerchantContext?.merchant ?? i18n.t('transaction.demo.merchantName')
  );
  setPaymentReceiptOptionalRow(
    'payment-receipt-row-merchant-site',
    'payment-receipt-merchant-site',
    paymentReceiptMerchantContext?.merchantSite
  );
  renderPaymentReceiptExtraColumn(paymentReceipt);
  syncPaymentReceiptReturnTimer();

  i18n.applyDataI18n(document.getElementById('payment-receipt-card') || document);
}

function generatePaymentReceiptPlainText() {
  const title = document.getElementById('payment-receipt-title')?.textContent ?? '';
  const amount = document.getElementById('payment-receipt-amount')?.textContent ?? '';
  const merchant = document.getElementById('payment-receipt-merchant-name')?.textContent ?? '';
  const trace = document.getElementById('payment-receipt-trace')?.textContent ?? '';
  const date = document.getElementById('payment-receipt-date')?.textContent ?? '';
  const rrnRow = document.getElementById('payment-receipt-row-rrn');
  const rrn = !rrnRow?.hidden
    ? document.getElementById('payment-receipt-rrn')?.textContent ?? ''
    : '';

  let text = `${title}\n${i18n.t('receipt.plain.amount')} ${amount}\n${i18n.t('receipt.plain.merchant')} ${merchant}\n${i18n.t('receipt.traceNo')}: ${trace}\n${i18n.t('receipt.plain.date')} ${date}`.trim();
  if (rrn) {
    text += `\n${i18n.t('receipt.rrn')}: ${rrn}`;
  }
  return text;
}

/**
 * Show full-width receipt section (same layout as init-error / receipt.html) and hide checkout grid.
 */
function showPaymentReceiptScreen(paymentReceipt) {
  if (timer && typeof timer.stop === 'function') {
    timer.stop();
  }

  const flow = document.getElementById('payment-flow-section');
  const receiptSection = document.getElementById('payment-receipt-section');
  if (flow) flow.hidden = true;
  if (receiptSection) {
    const completeButton = document.getElementById('payment-receipt-complete-button');
    if (completeButton) {
      completeButton.hidden = !getMerchantReturnUrl();
    }
    fillPaymentReceiptFromService(paymentReceipt);
    receiptSection.hidden = false;
  }
}

function attachPaymentReceiptActions() {
  const shareBtn = document.getElementById('payment-receipt-share-button');
  const saveBtn = document.getElementById('payment-receipt-save-button');
  const completeBtn = document.getElementById('payment-receipt-complete-button');
  const card = document.getElementById('payment-receipt-card');
  if (!shareBtn || shareBtn.dataset.bound === '1') return;
  shareBtn.dataset.bound = '1';
  saveBtn.dataset.bound = '1';
  if (completeBtn) {
    completeBtn.dataset.bound = '1';
  }

  shareBtn.addEventListener('click', async () => {
    if (isButtonClickLocked(shareBtn)) return;
    lockButtonClick(shareBtn);
    try {
      const receiptText = generatePaymentReceiptPlainText();
      const ok = await shareContent({ text: receiptText });
      if (!ok) {
        const { copyToClipboard } = await import('../utils/clipboard.js');
        await copyToClipboard(receiptText);
        alert(i18n.t('receipt.copied'));
      }
    } finally {
      unlockButtonClick(shareBtn);
    }
  });

  saveBtn.addEventListener('click', async () => {
    if (isButtonClickLocked(saveBtn)) return;
    lockButtonClick(saveBtn);
    try {
      const ok = await downloadElementAsPng(card, 'receipt.png');
      if (!ok) {
        alert(i18n.t('receipt.saveError'));
      }
    } finally {
      unlockButtonClick(saveBtn);
    }
  });

  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      if (isButtonClickLocked(completeBtn)) return;
      lockButtonClick(completeBtn);
      const url = getMerchantReturnUrl();
      if (!url) {
        unlockButtonClick(completeBtn);
        return;
      }
      window.location.href = url;
    });
  }
}

function attachFormEvents() {
  const form = document.getElementById('payment-form');
  const saveCardCheckbox = document.getElementById('save-card-checkbox');
  const showReceiptToggle = document.getElementById('show-receipt-toggle');
  const receiptFields = document.getElementById('receipt-fields');
  const payButton = document.getElementById('pay-button');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (paySubmitInFlight) return;
    paySubmitInFlight = true;

    // Validate all fields
    const isValid = [
      cardNumberInput.validate(),
      cvv2Input.validate(),
      expiryDateInput.validate(),
      captchaInput.validate(),
      otpInput.validate(),
    ].every((v) => v);

    if (!isValid) {
      setPayButtonState('disabled');
      errorHandler.show({
        message: i18n.t('form.validation.error'),
        mode: 'toast',
        type: 'error',
      });

      // Restore active state after a short delay
      setTimeout(() => {
        setPayButtonState('active');
      }, 2000);
      paySubmitInFlight = false;
      return;
    }

    const cardPart = buildCardPayloadForIpg();
    if (!cardPart || !captchaTokenKey) {
      errorHandler.show({
        message: i18n.t('form.validation.error'),
        mode: 'toast',
        type: 'error',
      });
      paySubmitInFlight = false;
      return;
    }

    setPayButtonState('processing');
    soundManager.beep();

    try {
      const saveCardEl = document.getElementById('save-card-checkbox');
      const showReceiptEl = document.getElementById('show-receipt-toggle');
      const receiptOpen = showReceiptEl?.checked;

      const payBody = {
        ...cardPart,
        cvv2: extractNumbers(cvv2Input.getValue()),
        pin2: extractNumbers(otpInput.getValue()),
        cellNumber:
          receiptOpen && mobileInput ? extractNumbers(mobileInput.getValue()) || null : null,
        email: receiptOpen && emailInput ? emailInput.getValue().trim() || null : null,
        saveCardAfterPay: Boolean(saveCardEl?.checked),
        bill: null,
      };
      if (shouldSendExpiryDateInPayRequest()) {
        payBody.expiryDate = getExpiryDateForApi();
      }

      const payRes = await ipgService.payTransaction(payBody, {
        captchaToken: captchaTokenKey,
        captchaResponse: captchaInput.getValue(),
      });

      const redirectRes = await ipgService.getReceiptRedirectParams();
      const redirectUrl = redirectRes?.data?.redirectUrl;
      paymentReceiptRedirectUrl =
        typeof redirectUrl === 'string' && redirectUrl.trim() !== '' ? redirectUrl.trim() : null;

      const paymentReceipt = payRes?.data?.paymentReceipt ?? null;
      if (paymentReceipt) {
        showPaymentReceiptScreen(paymentReceipt);
        errorHandler.show({
          message: i18n.t('form.pay.success'),
          mode: 'toast',
          type: 'success',
        });
        return;
      }

      errorHandler.show({
        message: i18n.t('form.pay.success'),
        mode: 'toast',
        type: 'success',
      });
    } catch (err) {
      console.error(err);
      errorHandler.show({
        message: err.message || i18n.t('error.network'),
        mode: 'toast',
        type: 'error',
      });
    } finally {
      setPayButtonState('active');
      paySubmitInFlight = false;
    }
  });

  if (showReceiptToggle) {
    const iconWrapper = document.querySelector('.show-receipt-icon .app-icon');

    showReceiptToggle.addEventListener('change', () => {
      const isChecked = showReceiptToggle.checked;
      if (isChecked) {
        receiptFields.classList.add('show');
        if (iconWrapper) {
          setAppIconFile(iconWrapper, 'icn-square-minus.svg');
        }
      } else {
        receiptFields.classList.remove('show');
        if (iconWrapper) {
          setAppIconFile(iconWrapper, 'icn-square-plus.svg');
        }
      }
    });
  }

  if (saveCardCheckbox) {
    const saveCardIcon = document.querySelector('.save-card-icon .app-icon');
    const updateSaveCardIcon = () => {
      if (!saveCardIcon) return;
      setAppIconFile(
        saveCardIcon,
        saveCardCheckbox.checked ? 'icn-square-check-filled.svg' : 'icn-square-check.svg'
      );
    };
    updateSaveCardIcon();
    saveCardCheckbox.addEventListener('change', updateSaveCardIcon);
  }

  document.getElementById('cancel-button').addEventListener('click', () => {
    const cancelButton = document.getElementById('cancel-button');
    if (isButtonClickLocked(cancelButton)) return;
    lockButtonClick(cancelButton);
    openCancelPaymentConfirm();
    setTimeout(() => unlockButtonClick(cancelButton), 700);
  });

  attachPaymentReceiptActions();
}

/**
 * Handle language change event
 */
function handleLanguageChange() {
  updatePageContent();
}

/** Re-run validators for fields still in error state so messages match the active language. */
function revalidateVisibleFormErrorsAfterLanguageChange() {
  cardNumberInput?.revalidateIfShowingError?.();
  cvv2Input?.revalidateIfShowingError?.();
  captchaInput?.revalidateIfShowingError?.();
  otpInput?.revalidateIfShowingError?.();
  mobileInput?.revalidateIfShowingError?.();
  emailInput?.revalidateIfShowingError?.();
  const groupErr = document.getElementById('expiry-date-group-error');
  if (
    groupErr &&
    groupErr.style.visibility === 'visible' &&
    typeof expiryDateInput?.validate === 'function'
  ) {
    expiryDateInput.validate();
  }
}

/**
 * Update page content after language change
 */
function updatePageContent() {
  if (header) {
    header.updateTitle(i18n.t('header.title'));
  }
  if (footer) {
    footer.updateCopyright(i18n.t('footer.copyright'));
    footer.updateSupportPrefix(i18n.t('footer.supportPrefix'));
    footer.updateSupportPhone(i18n.t('footer.supportPhone'));
  }
  syncGetOtpButtonState();

  i18n.applyDataI18n(document);
  const headerHelpButton = document.getElementById('card-header-help-button');
  if (headerHelpButton) {
    headerHelpButton.setAttribute('aria-label', i18n.t('common.help'));
    headerHelpButton.setAttribute('title', i18n.t('common.help'));
  }

  // Update form labels and placeholders
  if (cardNumberInput) {
    const showCardUi = isCardListUiEnabled();
    cardNumberInput.setLabel(
      showCardUi ? i18n.t('form.cardNumber.selectCard') : i18n.t('form.cardNumber')
    );
    cardNumberInput.setPlaceholder(i18n.t('form.cardNumber.placeholder'));
    cardNumberInput.setRightActionAriaLabel(i18n.t('form.showCards'));
    cardNumberInput.setClearButtonAriaLabel(i18n.t('common.clear'));
  }
  if (cardDropdown) {
    cardDropdown.updateItems(buildCardDropdownItems());
  }
  if (typeof refreshCardDropdownFooterButtons === 'function') {
    refreshCardDropdownFooterButtons();
  }
  if (cvv2Input) {
    cvv2Input.setLabel(i18n.t('form.cvv2'));
    cvv2Input.setPlaceholder(i18n.t('form.cvv2.placeholder'));
    cvv2Input.setHint(i18n.t('form.cvv2.hint'));
    cvv2Input.setRightActionAriaLabel(i18n.t('form.virtualPinPad'));
    cvv2Input.setClearButtonAriaLabel(i18n.t('common.clear'));
  }
  const expiryGroupLabelEl = document.getElementById('expiry-date-group-label');
  if (expiryGroupLabelEl) {
    expiryGroupLabelEl.textContent = i18n.t('form.expiryDate');
  }
  if (expiryMonthInput) {
    expiryMonthInput.setPlaceholder(
      isExpiryDateLockedFromCard ? '\u2022\u2022' : i18n.t('form.expiryMonth')
    );
    expiryMonthInput.setAriaLabel(i18n.t('form.expiryMonth'));
    expiryMonthInput.setClearButtonAriaLabel(i18n.t('common.clear'));
  }
  if (expiryYearInput) {
    expiryYearInput.setPlaceholder(
      isExpiryDateLockedFromCard ? '\u2022\u2022' : i18n.t('form.expiryYear')
    );
    expiryYearInput.setAriaLabel(i18n.t('form.expiryYear'));
    expiryYearInput.setRightActionAriaLabel(i18n.t('common.edit'));
    expiryYearInput.setClearButtonAriaLabel(i18n.t('common.clear'));
  }
  if (captchaInput) {
    captchaInput.setPlaceholder(i18n.t('form.captcha.placeholder'));
    captchaInput.setRightActionAriaLabel(i18n.t('form.reloadCaptcha'));
    captchaInput.setClearButtonAriaLabel(i18n.t('common.clear'));
    if (captchaLabelElement) {
      captchaLabelElement.textContent = i18n.t('form.securityCode');
    }
  }
  const captchaImg = document.querySelector('.captcha-image');
  if (captchaImg) captchaImg.setAttribute('alt', i18n.t('form.captchaImageAlt'));
  const captchaAudioBtn = document.querySelector('.captcha-audio-btn');
  if (captchaAudioBtn) captchaAudioBtn.setAttribute('aria-label', i18n.t('form.captchaAudio'));
  if (otpInput) {
    otpInput.setPlaceholder(i18n.t('form.otp.placeholder'));
    otpInput.setRightActionAriaLabel(i18n.t('form.virtualPinPad'));
    otpInput.setClearButtonAriaLabel(i18n.t('common.clear'));
    // Update separate OTP label
    if (otpLabelElement) {
      otpLabelElement.textContent = i18n.t('form.otp');
    }
  }
  if (mobileInput) {
    mobileInput.setLabel(i18n.t('form.mobile'));
    mobileInput.setPlaceholder(i18n.t('form.mobile.placeholder'));
    mobileInput.setClearButtonAriaLabel(i18n.t('common.clear'));
  }
  if (emailInput) {
    emailInput.setLabel(i18n.t('form.email'));
    emailInput.setPlaceholder(i18n.t('form.email.placeholder'));
    emailInput.setClearButtonAriaLabel(i18n.t('common.clear'));
  }

  // Buttons are now updated via data-i18n above

  // Transaction summary: labels marked in HTML with `data-transaction-field` (see initializeTransactionInfo)
  document.querySelectorAll('[data-transaction-field]').forEach((label) => {
    const field = label.getAttribute('data-transaction-field');
    const i18nKey = field ? transactionFieldToI18nKey[field] : null;
    if (i18nKey) {
      label.textContent = i18n.t(i18nKey);
    }
  });
  refreshTransactionTypeValue();
  refreshTransactionAmountValues();

  const descToggle = document.getElementById('transaction-description-toggle');
  const descTextEl = document.getElementById('transaction-description-text');
  if (descToggle && !descToggle.hidden && descTextEl) {
    const expanded = descTextEl.classList.contains('is-expanded');
    descToggle.setAttribute(
      'aria-label',
      i18n.t(expanded ? 'transaction.descriptionCollapse' : 'transaction.descriptionExpand')
    );
  }

  // Update more/less toggle button
  const moreToggle = document.getElementById('more-toggle');
  if (moreToggle) {
    const moreContent = document.getElementById('more-transaction-info');
    if (moreContent && moreContent.classList.contains('show')) {
      moreToggle.textContent = i18n.t('transaction.showLess');
    } else {
      moreToggle.textContent = i18n.t('transaction.showMore');
    }
  }

  // Checkbox label is now updated via data-i18n above

  const receiptSection = document.getElementById('payment-receipt-section');
  if (receiptSection && !receiptSection.hidden && lastPaymentReceiptData) {
    fillPaymentReceiptFromService(lastPaymentReceiptData);
  }

  const receiptShareBtn = document.getElementById('payment-receipt-share-button');
  const receiptSaveBtn = document.getElementById('payment-receipt-save-button');
  if (receiptShareBtn) receiptShareBtn.setAttribute('aria-label', i18n.t('receipt.share'));
  if (receiptSaveBtn) receiptSaveBtn.setAttribute('aria-label', i18n.t('receipt.save'));

  // Ensure pay button label uses current language and amount
  setPayButtonState('active');

  revalidateVisibleFormErrorsAfterLanguageChange();
}
