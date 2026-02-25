/**
 * Index Page Script
 */
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Input } from '../components/Input.js';
import { Dropdown } from '../components/Dropdown.js';
import { VirtualPinPad } from '../components/VirtualPinPad.js';
import { Timer } from '../classes/Timer.js';
import { Modal } from '../components/Modal.js';
import { LoadingScreen } from '../components/LoadingScreen.js';
import { validateCardNumber, validateCVV2, validateExpiryDate, validateMobile, validateEmail, validateOTP } from '../utils/validators.js';
import { detectBank, formatCardNumber, getBankLogo } from '../utils/bankDetector.js';
import { extractNumbers, numberToPersianWords } from '../utils/numberConverter.js';
import { dataStore } from '../services/dataStore.js';
import { cardService } from '../services/cardService.js';
import { i18n } from '../main.js';
import { errorHandler } from '../utils/errorHandler.js';
import { soundManager } from '../utils/sound.js';

// Initialize sound manager
soundManager.init();

// Initialize components
let header, footer, timer, cardNumberInput, cvv2Input, expiryDateInput, captchaInput, otpInput, mobileInput, emailInput;
let cardDropdown, cvv2PinPad, otpPinPad;
let cardList = [];
let otpLabelElement = null;
let captchaLabelElement = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await initializePage();
});

async function initializePage() {
  await i18n.readyPromise;

  const loadingScreen = new LoadingScreen({
    logo: '/assets/images/logo.svg',
    text: i18n.t('common.loading'),
    showProgressBar: true
  });
  loadingScreen.show();

  try {
    // Initialize header
    header = new Header({
      title: i18n.t('header.title'),
      logo: '/assets/images/logo-shaparak.svg',
      secondaryLogo: '/assets/images/logo.svg',
      showCard: false
    });

    // Initialize footer
    footer = new Footer({
      logo: '/assets/images/logo.svg',
      copyright: i18n.t('footer.copyright')
    });

    // Load saved cards from API
    await loadCards();

    // Initialize timer
    initializeTimer();

    // Initialize form inputs
    initializeFormInputs();

    // Initialize transaction info
    initializeTransactionInfo();

    // Initialize partner logos
    initializePartnerLogos();

    // Attach form events
    attachFormEvents();

    // Update page content with current language
    updatePageContent();

    // Listen for language changes
    document.addEventListener('languageChange', handleLanguageChange);

    // Hide loading screen
    loadingScreen.hide();
    loadingScreen.destroy();
  } catch (error) {
    console.error('Initialization error:', error);
    errorHandler.show({
      message: i18n.t('error.unknown'),
      mode: 'toast',
      type: 'error'
    });
    loadingScreen.hide();
    loadingScreen.destroy();
  }
}

function initializeTimer() {
  const timerContainer = document.getElementById('timer-container');
  const timerHeader = document.getElementById('timer-header');
  const timerValue = timerContainer.querySelector('.timer-value');

  timer = new Timer({
    duration: 900, // 15 minutes
    onTick: (remaining) => {
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      timerValue.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      // Update timer header style based on progress
      if (timerHeader) {
        timerHeader.classList.remove('warning', 'danger');
      }
      const progress = remaining / 900;
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
        type: 'warning'
      });
    }
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
      // Convert API format to internal format
      cardList = response.Data.map(card => cardService.convertCardFormat(card));

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
  // Card Number Input
  const cardNumberContainer = document.getElementById('card-number-input-container');
  cardNumberInput = new Input(cardNumberContainer, {
    id: 'card-number',
    name: 'cardNumber',
    type: 'text',
    label: i18n.t('form.cardNumber'),
    placeholder: i18n.t('form.cardNumber.placeholder'),
    required: true,
    requiredMessage: i18n.t('common.required'),
    clearButtonAriaLabel: i18n.t('common.clear'),
    validator: validateCardNumber,
    maxLength: 19, // 16 digits + 3 spaces
    rightAction: cardList.length > 0 ? {
      icon: '<img src=\"/assets/images/icons/icn-credit-card.svg\" alt=\"\" aria-hidden=\"true\" />',
      label: i18n.t('form.showCards'),
      onClick: () => toggleCardList()
    } : null,
    onInput: (value) => {
      // Format card number (4-4-4-4)
      const formatted = formatCardNumber(value);
      if (formatted !== value) {
        cardNumberInput.setValue(formatted);
      }

      // Detect bank and show logo
      const bank = detectBank(value);
      updateBankLogo(bank);

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
    }
  });

  function getMaskedDisplayPan(securePan) {
    if (!securePan) return '';
    const raw = securePan.replace(/\s/g, '').replace(/#/g, '●');
    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.substring(i, i + 4));
    }
    return parts.join(' ');
  }

  // Create card dropdown if cards exist
  if (cardList.length > 0) {
    cardDropdown = new Dropdown(cardNumberInput.element, {
      items: cardList.map(card => ({
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
        })()
      })),
      onSelect: (item) => {
        const card = cardList.find(c => c.number === item.value);
        if (card) {
          cardNumberInput.setValue(getMaskedDisplayPan(card.securePan));
          updateBankLogo(detectBank(card.securePan));
        }
      }
    });
  }

  // CVV2 Input
  const cvv2Container = document.getElementById('cvv2-input-container');
  cvv2Input = new Input(cvv2Container, {
    id: 'cvv2',
    name: 'cvv2',
    type: 'password',
    label: i18n.t('form.cvv2'),
    placeholder: i18n.t('form.cvv2.placeholder'),
    required: true,
    requiredMessage: i18n.t('common.required'),
    clearButtonAriaLabel: i18n.t('common.clear'),
    validator: validateCVV2,
    inputMode: 'numeric',
    maxLength: 4,
    rightAction: {
      icon: '<img src=\"/assets/images/icons/icn-pinpad.svg\" alt=\"\" aria-hidden=\"true\" />',
      label: i18n.t('form.virtualPinPad'),
      onClick: () => {
        if (!cvv2PinPad) {
          cvv2PinPad = new VirtualPinPad(cvv2Input.element, {
            maxLength: 4,
            onInput: (value) => {
              cvv2Input.setValue(value);
            }
          });
        }
        cvv2PinPad.open();
      }
    }
  });

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
    },
    validator: (value) => {
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
    }
  });

  // Captcha Input
  const captchaContainer = document.getElementById('captcha-container');

  // Create label separately (outside flex container)
  captchaLabelElement = document.createElement('label');
  captchaLabelElement.className = 'input-label';
  captchaLabelElement.setAttribute('for', 'captcha');
  captchaLabelElement.innerHTML = i18n.t('form.securityCode') + ' <span class="input-required">*</span>';
  captchaContainer.appendChild(captchaLabelElement);

  // Create flex wrapper for image and input
  const captchaRow = document.createElement('div');
  captchaRow.className = 'captcha-input-row';

  // Create input without label, with reload action inside (first in row)
  captchaInput = new Input(captchaRow, {
    id: 'captcha',
    name: 'captcha',
    type: 'text',
    label: '',
    placeholder: i18n.t('form.captcha.placeholder'),
    required: true,
    requiredMessage: i18n.t('common.required'),
    clearButtonAriaLabel: i18n.t('common.clear'),
    maxLength: 6,
    rightAction: {
      icon: '<img src=\"/assets/images/icons/icn-refresh.svg\" alt=\"\" aria-hidden=\"true\" />',
      label: i18n.t('form.reloadCaptcha'),
      onClick: () => {
        captchaImage.src = '/api/captcha/image?' + Date.now();
      }
    }
  });

  // Hide the label inside input-wrapper since we have it separately
  const captchaInputWrapper = captchaRow.querySelector('.input-wrapper');
  if (captchaInputWrapper) {
    const innerLabel = captchaInputWrapper.querySelector('.input-label');
    if (innerLabel) {
      innerLabel.style.display = 'none';
    }
  }

  // Create captcha image (will be attached after input visually)
  const captchaImage = document.createElement('img');
  captchaImage.src = '/api/captcha/image';
  captchaImage.className = 'captcha-image';
  captchaImage.alt = i18n.t('form.captchaImageAlt');
  captchaImage.onclick = () => {
    captchaImage.src = '/api/captcha/image?' + Date.now();
  };

  // Append image after input wrapper (visually attached)
  captchaRow.appendChild(captchaImage);

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
  captchaAudio.onclick = () => {
    const audio = new Audio('/api/captcha/audio');
    audio.play();
  };

  captchaRow.appendChild(captchaAudio);
  captchaContainer.appendChild(captchaRow);

  // OTP Input
  const otpContainer = document.getElementById('otp-input-container');

  // Create label separately (outside flex container)
  otpLabelElement = document.createElement('label');
  otpLabelElement.className = 'input-label';
  otpLabelElement.setAttribute('for', 'otp');
  otpLabelElement.innerHTML = i18n.t('form.otp') + ' <span class="input-required">*</span>';
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
    maxLength: 6,
    rightAction: {
      icon: '<img src=\"/assets/images/icons/icn-pinpad.svg\" alt=\"\" aria-hidden=\"true\" />',
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
            }
          });
        }
        otpPinPad.open();
      }
    }
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
  getOtpButton.onclick = () => {
    errorHandler.show({
      message: i18n.t('form.getOtpSuccess'),
      mode: 'toast',
      type: 'success'
    });
  };
  otpWrapper.appendChild(getOtpButton);
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
    inputMode: 'tel'
  });

  // Email Input (hidden initially)
  const emailContainer = document.getElementById('email-input-container');
  emailInput = new Input(emailContainer, {
    id: 'email',
    name: 'email',
    type: 'email',
    label: i18n.t('form.email'),
    placeholder: i18n.t('form.email.placeholder'),
    validator: validateEmail
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
    container.insertBefore(logoWrapper, container.firstChild);
  }

  if (!bank || !bank.name) {
    logoWrapper.innerHTML = '';
    logoWrapper.classList.add('hidden');
    return;
  }

  const logoPath = getBankLogo(bank.name);
  if (!logoPath) {
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

function initializeTransactionInfo() {
  const container = document.getElementById('transaction-info');

  // Mock transaction data
  const transactionData = {
    merchant: 'فروشگاه نمونه',
    amount: 100000, // in Rials
    terminal: '12345678',
    site: 'example.com'
  };

  // Convert amount to Tomans (divide by 10)
  const amountInTomans = Math.floor(transactionData.amount / 10);
  const amountInWords = numberToPersianWords(amountInTomans);

  container.innerHTML = `
    <div class="more-content" id="more-transaction-info">
      <div class="transaction-info-item">
        <div class="transaction-info-icon">
          <img src="/assets/images/icons/icn-shop.svg" alt="" aria-hidden="true" />
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label">${i18n.t('transaction.terminal')}</div>
          <div class="transaction-info-value">${transactionData.terminal}</div>
        </div>
      </div>
      <div class="transaction-info-item">
        <div class="transaction-info-icon">
          <img src="/assets/images/icons/icn-world.svg" alt="" aria-hidden="true" />
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label">${i18n.t('transaction.site')}</div>
          <div class="transaction-info-value">${transactionData.site}</div>
        </div>
      </div>
    </div>
    <div class="transaction-summary-card">
      <div class="transaction-info-item">
        <div class="transaction-info-icon">
          <img src="/assets/images/icons/icn-shopping-bag.svg" alt="" aria-hidden="true" />
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label">${i18n.t('transaction.merchant')}</div>
          <div class="transaction-info-value">${transactionData.merchant}</div>
        </div>
      </div>
      <div class="transaction-info-item">
        <div class="transaction-info-icon">
          <img src="/assets/images/icons/icn-cash-banknote.svg" alt="" aria-hidden="true" />
        </div>
        <div class="transaction-info-content">
          <div class="transaction-info-label">${i18n.t('transaction.amount')}</div>
          <div class="transaction-info-value">
            <div class="transaction-amount-rial">${transactionData.amount.toLocaleString('fa-IR')} ${i18n.t('transaction.rial')}</div>
            <div class="transaction-amount-toman">${amountInWords} ${i18n.t('transaction.toman')}</div>
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
}

function initializePartnerLogos() {
  const container = document.getElementById('partner-logos');
  const section = document.getElementById('partner-logos-section');

  // Mock partner logos - can be empty array
  const logos = [
    '/assets/images/partners/logo1.svg',
    '/assets/images/partners/logo2.svg'
  ];

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
  logos.slice(0, 2).forEach(src => {
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
  const visibleLogos = Array.from(container.children).filter(img => !img.classList.contains('hidden'));
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

function attachFormEvents() {
  const form = document.getElementById('payment-form');
  const showReceiptButton = document.getElementById('show-receipt-button');
  const receiptFields = document.getElementById('receipt-fields');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    const isValid = [
      cardNumberInput.validate(),
      cvv2Input.validate(),
      expiryDateInput.validate(),
      captchaInput.validate(),
      otpInput.validate()
    ].every(v => v);

    if (!isValid) {
      errorHandler.show({
        message: i18n.t('form.validation.error'),
        mode: 'toast',
        type: 'error'
      });
      return;
    }

    // Submit form
    // This would call the payment API
    soundManager.beep();
    errorHandler.show({
      message: i18n.t('common.processing'),
      mode: 'toast',
      type: 'info'
    });
  });

  showReceiptButton.addEventListener('click', () => {
    const isShowing = receiptFields.classList.contains('show');
    if (isShowing) {
      receiptFields.classList.remove('show');
    } else {
      receiptFields.classList.add('show');
      showReceiptButton.classList.add('hidden');
    }
  });

  document.getElementById('cancel-button').addEventListener('click', () => {
    if (confirm(i18n.t('form.confirmCancel'))) {
      window.location.href = '/';
    }
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
  }
  const getOtpBtn = document.getElementById('get-otp-button');
  if (getOtpBtn) {
    getOtpBtn.textContent = i18n.t('form.getOtp');
  }

  const i18nElements = document.querySelectorAll('[data-i18n]');
  i18nElements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      element.textContent = i18n.t(key);
    }
  });

  // Update form labels and placeholders
  if (cardNumberInput) {
    cardNumberInput.setLabel(i18n.t('form.cardNumber'));
    cardNumberInput.setPlaceholder(i18n.t('form.cardNumber.placeholder'));
  }
  if (cvv2Input) {
    cvv2Input.setLabel(i18n.t('form.cvv2'));
    cvv2Input.setPlaceholder(i18n.t('form.cvv2.placeholder'));
  }
  if (expiryDateInput) {
    expiryDateInput.setLabel(i18n.t('form.expiryDate'));
    expiryDateInput.setPlaceholder(i18n.t('form.expiryPlaceholder'));
  }
  if (captchaInput) {
    captchaInput.setPlaceholder(i18n.t('form.captcha.placeholder'));
    if (captchaLabelElement) {
      captchaLabelElement.innerHTML = i18n.t('form.securityCode') + ' <span class="input-required">*</span>';
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
      otpLabelElement.innerHTML = i18n.t('form.otp') + ' <span class="input-required">*</span>';
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

  // Update transaction info labels and values
  const transactionLabels = document.querySelectorAll('.transaction-info-label');
  transactionLabels.forEach((label) => {
    const parentItem = label.closest('.transaction-info-item');
    if (parentItem) {
      const icon = parentItem.querySelector('.transaction-info-icon');
      if (icon) {
        const iconText = icon.textContent.trim();
        if (iconText === '🏪') {
          label.textContent = i18n.t('transaction.merchant');
        } else if (iconText === '💰') {
          label.textContent = i18n.t('transaction.amount');
          // Update amount values (rial and toman)
          const valueContainer = parentItem.querySelector('.transaction-info-value');
          if (valueContainer) {
            const rialElement = valueContainer.querySelector('.transaction-amount-rial');
            const tomanElement = valueContainer.querySelector('.transaction-amount-toman');
            if (rialElement && tomanElement) {
              const amountMatch = rialElement.textContent.match(/[\d,]+/);
              if (amountMatch) {
                const amount = amountMatch[0].replace(/,/g, '');
                const amountInTomans = Math.floor(parseInt(amount) / 10);
                const amountInWords = numberToPersianWords(amountInTomans);
                rialElement.textContent = `${parseInt(amount).toLocaleString('fa-IR')} ${i18n.t('transaction.rial')}`;
                tomanElement.textContent = `${amountInWords} ${i18n.t('transaction.toman')}`;
              }
            }
          }
        }
      }
    }
  });

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
}
