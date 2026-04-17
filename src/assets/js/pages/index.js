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
} from '../utils/validators.js';
import { detectBank, formatCardNumber, getBankLogo } from '../utils/bankDetector.js';
import { extractNumbers, numberToWordsByLang } from '../utils/numberConverter.js';
import { getNumberLocaleForLang } from '../utils/localeHelpers.js';
import { parseTimeSpanToSeconds, formatSecondsAsMmSs } from '../utils/timeFormat.js';
import { resolveMerchantLogoUrl } from '../utils/merchantAssets.js';
import { getTransactionTypeInfo } from '../utils/transactionType.js';
import { dataStore } from '../services/dataStore.js';
import { cardService } from '../services/cardService.js';
import { getPaymentInitData, validatePaymentInitData } from '../services/paymentInitData.js';
import { fetchCaptcha, fetchCaptchaAudio } from '../services/captchaService.js';
import * as ipgService from '../services/ipgService.js';
import { i18n } from '../main.js';
import { errorHandler } from '../utils/errorHandler.js';
import { soundManager } from '../utils/sound.js';
import { Modal } from '../components/Modal.js';

// Initialize sound manager
soundManager.init();

// Initialize components
let header,
  footer,
  timer,
  cardNumberInput,
  cvv2Input,
  expiryDateInput,
  captchaInput,
  otpInput,
  mobileInput,
  emailInput;
let cardDropdown, cvv2PinPad, otpPinPad;
let cardList = [];
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

/** Per-card OTP tries remaining (key → count). */
const otpTriesRemainingByCardKey = Object.create(null);
/** Per-card cooldown end timestamp (ms) after a successful OTP request. */
const otpCooldownUntilByCardKey = Object.create(null);

let otpButtonCountdownIntervalId = null;
let otpRequestInFlight = false;
let currentTransactionPrCode = null;

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
  const btn = document.getElementById('get-otp-button');
  if (!btn) return;

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

  if (otpRequestInFlight) {
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.textContent = i18n.t('common.processing');
    btn.removeAttribute('aria-label');
    return;
  }
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
  const n = extractNumbers(expiryDateInput.getValue());
  return n.length === 4 ? n : '';
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

function getExpectedCvvLength() {
  const bankName = getCurrentCardBankName();
  const normalized = bankName.trim().toLowerCase();
  const isSamanBank = normalized === 'saman' || bankName.includes('سامان');
  return isSamanBank ? 3 : 4;
}

function shouldSendExpiryDateInPayRequest() {
  return !isExpiryDateLockedFromCard || hasUserEnabledExpiryDateEdit;
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
  const timerValue = timerContainer.querySelector('.timer-value');
  const total = Math.max(1, durationSeconds);

  timer = new Timer({
    duration: total,
    onTick: (remaining) => {
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      timerValue.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

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
      errorHandler.show({
        message: i18n.t('timer.expired'),
        mode: 'toast',
        type: 'warning',
      });
    },
  });

  timer.start();
}

/**
 * Load cards from API service
 */
async function loadCards() {
  try {
    const response = await cardService.getCards();

    if (response && response.Data && Array.isArray(response.Data)) {
      // cardService.getCards() already maps API → internal format; do not convert again
      cardList = response.Data.filter((card) => card != null);

      // Also save to localStorage for offline access
      dataStore.set('savedCards', cardList);
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
  const syncCvv2Constraints = () => {
    if (!cvv2Input || !cvv2Input.element) return;
    const expectedLength = getExpectedCvvLength();
    cvv2Input.options.maxLength = expectedLength;
    cvv2Input.element.maxLength = expectedLength;

    const digitsOnly = extractNumbers(cvv2Input.getValue()).slice(0, expectedLength);
    if (digitsOnly !== cvv2Input.getValue()) {
      cvv2Input.setValue(digitsOnly);
    }

    if (cvv2PinPad) {
      cvv2PinPad.options.maxLength = expectedLength;
      if (cvv2PinPad.currentValue.length > expectedLength) {
        cvv2PinPad.currentValue = cvv2PinPad.currentValue.slice(0, expectedLength);
        cvv2PinPad.updateDisplay();
        cvv2PinPad.updateInput();
      } else {
        cvv2PinPad.updateDisplay();
      }
    }
  };

  const getExpiryEditActionButton = () => {
    return expiryDateInput?.wrapper?.querySelector('.input-action-right') || null;
  };

  const setExpiryDateLocked = (locked) => {
    if (!expiryDateInput || !expiryDateInput.element) return;
    isExpiryDateLockedFromCard = Boolean(locked);
    const inputEl = expiryDateInput.element;
    inputEl.disabled = Boolean(locked);
    inputEl.setAttribute('aria-disabled', locked ? 'true' : 'false');
    // Keep options.disabled false so the edit action remains clickable while field is locked.
    expiryDateInput.options.disabled = false;
    if (expiryDateInput.wrapper) {
      expiryDateInput.wrapper.classList.toggle('disabled', Boolean(locked));
    }
    if (expiryDateInput.inputContainer) {
      expiryDateInput.inputContainer.classList.toggle('disabled', Boolean(locked));
    }
    const editActionBtn = getExpiryEditActionButton();
    if (editActionBtn) {
      editActionBtn.style.display = locked ? 'inline-flex' : 'none';
      editActionBtn.disabled = false;
      editActionBtn.setAttribute('aria-disabled', 'false');
      editActionBtn.tabIndex = 0;
    }
    if (expiryDateInput.clearButton) {
      if (locked) {
        expiryDateInput.clearButton.style.display = 'none';
      } else {
        expiryDateInput.updateClearButton();
      }
    }
  };

  const applyExpiryDateModeForSelectedCard = () => {
    const lockByCard =
      Boolean(selectedSavedCardForApi?.hasValidExpiredDate) && !hasUserEnabledExpiryDateEdit;
    setExpiryDateLocked(lockByCard);
  };

  // Card Number Input
  const cardNumberContainer = document.getElementById('card-number-input-container');
  const hasSavedCards = cardList.length > 0;
  const cardNumberLabel = hasSavedCards
    ? i18n.t('form.cardNumber.selectCard')
    : i18n.t('form.cardNumber');
  cardNumberInput = new Input(cardNumberContainer, {
    id: 'card-number',
    name: 'cardNumber',
    type: 'text',
    label: cardNumberLabel,
    placeholder: i18n.t('form.cardNumber.placeholder'),
    required: true,
    requiredMessage: i18n.t('common.required'),
    clearButtonAriaLabel: i18n.t('common.clear'),
    validator: validateCardNumber,
    maxLength: 19, // 16 digits + 3 spaces
    rightAction: hasSavedCards
      ? {
          icon: '<img src="/assets/images/icons/icn-credit-card.svg" alt="" aria-hidden="true" />',
          label: i18n.t('form.showCards'),
          onClick: () => toggleCardList(),
        }
      : null,
    onInput: (value) => {
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

      // Auto-open card list if cards exist and input is focused
      if (cardList.length > 0 && value.length === 0) {
        // Will be handled by focus event
      }
    },
    onFocus: () => {
      if (cardList.length > 0 && !cardNumberInput.getValue()) {
        setTimeout(() => {
          if (cardDropdown) {
            cardDropdown.open();
          }
        }, 100);
      }
    },
  });

  function getMaskedDisplayPan(securePan) {
    if (!securePan) return '';
    const raw = securePan.replace(/\s/g, '').replace(/#/g, '●').replace(/\*/g, '●');
    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.substring(i, i + 4));
    }
    return parts.join(' ');
  }

  // Create card dropdown if cards exist
  if (cardList.length > 0) {
    cardDropdown = new Dropdown(cardNumberInput.element, {
      items: cardList.map((card) => ({
        text: getMaskedDisplayPan(card.securePan),
        value: card.number,
        html: (() => {
          const logoPath = getBankLogo(card.bankName);
          const bankName = card.bankName || '';
          const maskedPan = getMaskedDisplayPan(card.securePan);
          return `
            <div class="dropdown-card-item">
              <div class="dropdown-card-bank">
                ${logoPath ? `<img class="dropdown-card-bank-logo" src="${logoPath}" alt="${bankName}" />` : ''}
                <span class="dropdown-card-bank-name">${bankName}</span>
              </div>
              <div class="dropdown-card-meta">
                <span class="dropdown-card-number">${maskedPan}</span>
                ${card.pinned ? '<span class="dropdown-card-pinned">📌</span>' : ''}
              </div>
            </div>
          `;
        })(),
      })),
      onSelect: (item) => {
        const card = cardList.find((c) => c.number === item.value);
        if (card) {
          selectedSavedCardForApi = card;
          hasUserEnabledExpiryDateEdit = false;
          cardNumberInput.setValue(getMaskedDisplayPan(card.securePan));
          // Use API bank name (Persian) for logo to avoid any BIN masking issues
          updateBankLogo({ name: card.bankName });
          handleGiftCardNotificationFromPan(card.securePan);
          applyExpiryDateModeForSelectedCard();
          syncCvv2Constraints();
          syncGetOtpButtonState();
          focusNextVisibleInputField(cardNumberInput.element);
        }
      },
    });
  }

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
    label: i18n.t('form.cvv2'),
    placeholder: i18n.t('form.cvv2.placeholder'),
    hint: i18n.t('form.cvv2.hint'),
    required: true,
    requiredMessage: i18n.t('common.required'),
    clearButtonAriaLabel: i18n.t('common.clear'),
    validator: (value) => {
      const expectedLength = getExpectedCvvLength();
      const numbers = extractNumbers(value);
      if (!numbers || numbers.length === 0) {
        return { valid: false, message: i18n.t('common.required') };
      }
      if (numbers.length !== expectedLength) {
        return {
          valid: false,
          message: i18n.t('form.cvv2.invalidLength', { count: String(expectedLength) }),
        };
      }
      return { valid: true, message: '' };
    },
    inputMode: 'numeric',
    maskWithPasswordFont: true,
    maxLength: getExpectedCvvLength(),
    onInput: (value) => {
      const expectedLength = getExpectedCvvLength();
      const digitsOnly = extractNumbers(value).slice(0, expectedLength);
      if (digitsOnly !== value) {
        cvv2Input.setValue(digitsOnly);
      }
      if (digitsOnly.length >= expectedLength) {
        focusNextVisibleInputField(cvv2Input.element);
      }
    },
    rightAction: {
      icon: '<img src="/assets/images/icons/icn-pinpad.svg" alt="" aria-hidden="true" />',
      label: i18n.t('form.virtualPinPad'),
      onClick: () => {
        if (!cvv2PinPad) {
          cvv2PinPad = new VirtualPinPad(cvv2Input.element, {
            maxLength: getExpectedCvvLength(),
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

  // Expiry Date Input (MM/YY format)
  const expiryDateContainer = document.getElementById('expiry-date-container');
  expiryDateInput = new Input(expiryDateContainer, {
    id: 'expiry-date',
    name: 'expiryDate',
    type: 'password',
    label: i18n.t('form.expiryDate'),
    placeholder: i18n.t('form.expiryPlaceholder'),
    required: true,
    requiredMessage: i18n.t('common.required'),
    clearButtonAriaLabel: i18n.t('common.clear'),
    inputMode: 'numeric',
    maxLength: 5,
    rightAction: {
      icon: '<img src="/assets/images/icons/icn-calendar.svg" alt="" aria-hidden="true" />',
      label: i18n.t('common.edit'),
      onClick: () => {
        if (!isExpiryDateLockedFromCard) return;
        hasUserEnabledExpiryDateEdit = true;
        applyExpiryDateModeForSelectedCard();
        expiryDateInput.focus();
      },
    },
    onInput: (value) => {
      // Auto-format as MM/YY
      const numbers = extractNumbers(value);
      let formatted = numbers;
      if (numbers.length >= 2) {
        formatted = numbers.substring(0, 2) + '/' + numbers.substring(2, 4);
      }
      if (formatted !== value) {
        expiryDateInput.setValue(formatted);
      }
      if (numbers.length >= 4) {
        focusNextVisibleInputField(expiryDateInput.element);
      }
    },
    validator: (value) => {
      if (!shouldSendExpiryDateInPayRequest()) {
        return { valid: true, message: '' };
      }
      const numbers = extractNumbers(value);
      if (numbers.length !== 4) {
        return { valid: false, message: i18n.t('form.expiryDate.invalid') };
      }
      const month = parseInt(numbers.substring(0, 2));
      const year = parseInt(numbers.substring(2, 4));
      if (month < 1 || month > 12) {
        return { valid: false, message: i18n.t('form.expiryDate.invalid') };
      }
      // Validate expiry date (not expired)
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return { valid: false, message: i18n.t('form.expiryDate.invalid') };
      }
      return { valid: true, message: '' };
    },
  });
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
    label: '',
    placeholder: i18n.t('form.captcha.placeholder'),
    required: true,
    requiredMessage: i18n.t('common.required'),
    clearButtonAriaLabel: i18n.t('common.clear'),
    maxLength: 6,
    inputMode: 'numeric',
    onInput: (value) => {
      const digitsOnly = extractNumbers(value).slice(0, 6);
      if (digitsOnly !== value) {
        captchaInput.setValue(digitsOnly);
      }
      if (digitsOnly.length >= 6) {
        focusNextVisibleInputField(captchaInput.element);
      }
    },
    rightAction: {
      icon: '<img src="/assets/images/icons/icn-refresh.svg" alt="" aria-hidden="true" />',
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
    <span data-i18n="form.audioPlay">${i18n.t('form.audioPlay')}</span>
    <span class="btn-icon" aria-hidden="true">
      <img src="/assets/images/icons/icn-volume.svg" alt="" />
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
    label: '',
    placeholder: i18n.t('form.otp.placeholder'),
    required: true,
    requiredMessage: i18n.t('common.required'),
    clearButtonAriaLabel: i18n.t('common.clear'),
    validator: validateOTP,
    inputMode: 'numeric',
    maskWithPasswordFont: true,
    maxLength: 6,
    onInput: (value) => {
      const digitsOnly = extractNumbers(value).slice(0, 6);
      if (digitsOnly !== value) {
        otpInput.setValue(digitsOnly);
      }
      if (digitsOnly.length >= 6) {
        focusNextVisibleInputField(otpInput.element);
      }
    },
    rightAction: {
      icon: '<img src="/assets/images/icons/icn-pinpad.svg" alt="" aria-hidden="true" />',
      label: i18n.t('form.virtualPinPad'),
      onClick: () => {
        if (!otpPinPad) {
          otpPinPad = new VirtualPinPad(otpInput.element, {
            maxLength: 6,
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

  // Mobile Input (hidden initially)
  const mobileContainer = document.getElementById('mobile-input-container');
  mobileInput = new Input(mobileContainer, {
    id: 'mobile',
    name: 'mobile',
    type: 'tel',
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
  if (cardDropdown) {
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

  const transactionData = {
    merchant: txPayload?.merchant?.merchantName ?? i18n.t('transaction.demo.merchantName'),
    amount: typeof txPayload?.totalAmount === 'number' ? txPayload.totalAmount : 100000,
    terminal: init?.terminalNumber || String(txPayload?.terminalNumber ?? '12345678'),
    site:
      txPayload?.merchant?.merchantWebSite?.replace(/^https?:\/\//, '')?.replace(/\/$/, '') ??
      i18n.t('transaction.demo.siteHost'),
  };

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

  // Convert amount to Tomans (divide by 10)
  const amountInTomans = Math.floor(transactionData.amount / 10);
  const amountInWords = numberToWordsByLang(amountInTomans, i18n.getLanguage());
  const amountLocale = getNumberLocaleForLang(i18n.getLanguage());

  container.innerHTML = `
    <div class="transaction-summary-card">
      <div class="transaction-info-item">
        <div class="transaction-info-icon">
          <img src="/assets/images/icons/icn-shopping-bag.svg" alt="" aria-hidden="true" />
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label" data-transaction-field="merchant">${i18n.t('transaction.merchant')}</div>
          <div class="transaction-info-value">${transactionData.merchant}</div>
        </div>
      </div>
      <div class="transaction-info-item">
        <div class="transaction-info-icon">
          <img src="/assets/images/icons/icn-cash-banknote.svg" alt="" aria-hidden="true" />
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
          <img src="/assets/images/icons/icn-shop.svg" alt="" aria-hidden="true" />
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label" data-transaction-field="terminal">${i18n.t('transaction.terminal')}</div>
          <div class="transaction-info-value">${transactionData.terminal}</div>
        </div>
      </div>
      <div class="transaction-info-item">
        <div class="transaction-info-icon">
          <img src="/assets/images/icons/icn-world.svg" alt="" aria-hidden="true" />
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label" data-transaction-field="site">${i18n.t('transaction.site')}</div>
          <div class="transaction-info-value">${transactionData.site}</div>
        </div>
      </div>
      <div class="transaction-info-item">
        <div class="transaction-info-icon">
          <img src="${transactionTypeInfo.icon}" alt="" aria-hidden="true" />
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label" data-transaction-field="transactionType">${i18n.t('transaction.transactionType')}</div>
          <div class="transaction-info-value" id="transaction-type-value">${transactionTypeInfo.label}</div>
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
  // Initialize pay button label with current amount
  setPayButtonState('active');
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
      payButton.textContent = `${i18n.t('form.pay.securePrefix')} ${formattedAmount} ${i18n.t('transaction.rial')}`;
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

function initializePartnerLogos(merchantLogoUrl) {
  const container = document.getElementById('partner-logos');
  const section = document.getElementById('partner-logos-section');

  const logos = merchantLogoUrl
    ? [merchantLogoUrl]
    : ['/assets/images/partners/logo1.svg', '/assets/images/partners/logo2.svg'];

  // Hide section if no logos
  if (!logos || logos.length === 0) {
    if (section) {
      section.classList.add('hidden');
    }
    return;
  }

  // Show section if logos exist
  if (section) {
    section.classList.remove('hidden');
  }

  // Clear container first
  container.innerHTML = '';

  // Add logos (max 2 logos side by side)
  logos.slice(0, 2).forEach((src) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'partner-logo';
    img.alt = i18n.t('accessibility.partnerLogo');
    img.onerror = () => {
      // Hide image if it fails to load
      img.classList.add('hidden');
    };
    container.appendChild(img);
  });

  // Hide section if no valid logos were added
  const visibleLogos = Array.from(container.children).filter(
    (img) => !img.classList.contains('hidden')
  );
  if (visibleLogos.length === 0) {
    if (section) {
      section.classList.add('hidden');
    }
    return;
  }

  // Add class for single logo (center it)
  if (visibleLogos.length === 1) {
    container.classList.add('single-logo');
  } else {
    container.classList.remove('single-logo');
  }
}

/** Illustration for cancel confirmation (served from Vite root `src/assets`). */
const cancelConfirmImageUrl = '/assets/images/icons/icn-square-help.svg';

/**
 * Open cancel confirmation: desktop = modal, mobile = bottom sheet (via Modal).
 */
function openCancelPaymentConfirm() {
  let modalRef = null;
  modalRef = new Modal({
    title: i18n.t('cancelConfirm.title'),
    description: i18n.t('cancelConfirm.description'),
    image: cancelConfirmImageUrl,
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

function attachFormEvents() {
  const form = document.getElementById('payment-form');
  const showReceiptToggle = document.getElementById('show-receipt-toggle');
  const receiptFields = document.getElementById('receipt-fields');
  const payButton = document.getElementById('pay-button');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

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
      return;
    }

    const cardPart = buildCardPayloadForIpg();
    if (!cardPart || !captchaTokenKey) {
      errorHandler.show({
        message: i18n.t('form.validation.error'),
        mode: 'toast',
        type: 'error',
      });
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

      await ipgService.payTransaction(payBody, {
        captchaToken: captchaTokenKey,
        captchaResponse: captchaInput.getValue(),
      });

      const redirectRes = await ipgService.getReceiptRedirectParams();
      const redirectUrl = redirectRes?.data?.redirectUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
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
    }
  });

  if (showReceiptToggle) {
    const iconWrapper = document.querySelector('.show-receipt-icon img');

    showReceiptToggle.addEventListener('change', () => {
      const isChecked = showReceiptToggle.checked;
      if (isChecked) {
        receiptFields.classList.add('show');
        if (iconWrapper) {
          iconWrapper.src = '/assets/images/icons/icn-square-minus.svg';
        }
      } else {
        receiptFields.classList.remove('show');
        if (iconWrapper) {
          iconWrapper.src = '/assets/images/icons/icn-square-plus.svg';
        }
      }
    });
  }

  document.getElementById('cancel-button').addEventListener('click', () => {
    openCancelPaymentConfirm();
  });
}

/**
 * Handle language change event
 */
function handleLanguageChange(event) {
  updatePageContent();
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
    const hasSavedCards = cardList.length > 0;
    cardNumberInput.setLabel(
      hasSavedCards ? i18n.t('form.cardNumber.selectCard') : i18n.t('form.cardNumber')
    );
    cardNumberInput.setPlaceholder(i18n.t('form.cardNumber.placeholder'));
  }
  if (cvv2Input) {
    cvv2Input.setLabel(i18n.t('form.cvv2'));
    cvv2Input.setPlaceholder(i18n.t('form.cvv2.placeholder'));
  }
  if (expiryDateInput) {
    expiryDateInput.setLabel(i18n.t('form.expiryDate'));
    expiryDateInput.setPlaceholder(i18n.t('form.expiryPlaceholder'));
    const expiryEditBtn = expiryDateInput.wrapper?.querySelector('.input-action-right');
    if (expiryEditBtn) {
      expiryEditBtn.setAttribute('aria-label', i18n.t('common.edit'));
    }
  }
  if (captchaInput) {
    captchaInput.setPlaceholder(i18n.t('form.captcha.placeholder'));
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
    // Update separate OTP label
    if (otpLabelElement) {
      otpLabelElement.textContent = i18n.t('form.otp');
    }
  }
  if (mobileInput) {
    mobileInput.setLabel(i18n.t('form.mobile'));
    mobileInput.setPlaceholder(i18n.t('form.mobile.placeholder'));
  }
  if (emailInput) {
    emailInput.setLabel(i18n.t('form.email'));
    emailInput.setPlaceholder(i18n.t('form.email.placeholder'));
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

  // Ensure pay button label uses current language and amount
  setPayButtonState('active');
}
