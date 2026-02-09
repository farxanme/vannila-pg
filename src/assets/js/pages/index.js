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
import { convertToEnglishNumbers, extractNumbers } from '../utils/numberConverter.js';
import { dataStore } from '../services/dataStore.js';
import { i18n } from '../main.js';
import { errorHandler } from '../utils/errorHandler.js';
import { soundManager } from '../utils/sound.js';

// Initialize sound manager
soundManager.init();

// Initialize components
let header, footer, timer, cardNumberInput, cvv2Input, expiryMonthInput, expiryYearInput, captchaInput, otpInput, mobileInput, emailInput;
let cardDropdown, cvv2PinPad, otpPinPad;
let cardList = [];
let isManagingCards = false;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await initializePage();
});

async function initializePage() {
  // Show loading screen
  const loadingScreen = new LoadingScreen({
    text: i18n.t('common.loading')
  });
  loadingScreen.show();

  try {
    // Initialize header
    header = new Header({
      title: i18n.t('header.title'),
      logo: '/assets/images/logo.svg',
      secondaryLogo: '/assets/images/partners/logo1.svg',
      showCard: false
    });

    // Initialize footer
    footer = new Footer({
      logo: '/assets/images/logo-small.svg',
      copyright: '© 2024 All rights reserved'
    });

    // Load saved cards
    cardList = dataStore.get('savedCards') || [];

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
  const timerValue = timerContainer.querySelector('.timer-value');

  timer = new Timer({
    duration: 900, // 15 minutes
    onTick: (remaining) => {
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      timerValue.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      // Update timer class based on progress
      timerContainer.classList.remove('warning', 'danger');
      const progress = remaining / 900;
      if (progress <= 1/3) {
        timerContainer.classList.add('danger');
      } else if (progress <= 2/3) {
        timerContainer.classList.add('warning');
      }
    },
    onOneThird: () => {
      timerContainer.classList.add('warning');
    },
    onTwoThird: () => {
      timerContainer.classList.add('danger');
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
    validator: validateCardNumber,
    maxLength: 19, // 16 digits + 3 spaces
    rightAction: cardList.length > 0 ? {
      icon: '▼',
      label: 'Show cards',
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

  // Create card dropdown if cards exist
  if (cardList.length > 0) {
    cardDropdown = new Dropdown(cardNumberInput.element, {
      items: cardList.map(card => ({
        text: formatCardNumber(card.number),
        value: card.number,
        html: `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>${card.bankName || ''}</span>
            <span style="font-family: monospace;">${formatCardNumber(card.number)}</span>
            ${card.pinned ? '<span style="color: var(--color-primary);">📌</span>' : ''}
          </div>
        `
      })),
      onSelect: (item) => {
        const card = cardList.find(c => c.number === item.value);
        if (card) {
          cardNumberInput.setValue(formatCardNumber(card.number));
          updateBankLogo(detectBank(card.number));
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
    validator: validateCVV2,
    inputMode: 'numeric',
    maxLength: 4,
    rightAction: {
      icon: '🔢',
      label: 'Virtual PIN pad',
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

  // Expiry Month Input
  const expiryMonthContainer = document.getElementById('expiry-month-container');
  expiryMonthInput = new Input(expiryMonthContainer, {
    id: 'expiry-month',
    name: 'expiryMonth',
    type: 'password',
    label: i18n.t('form.expiryMonth'),
    placeholder: 'MM',
    required: true,
    inputMode: 'numeric',
    maxLength: 2,
    validator: (value) => {
      const month = parseInt(extractNumbers(value));
      if (month < 1 || month > 12) {
        return { valid: false, message: 'Invalid month' };
      }
      return { valid: true, message: '' };
    }
  });

  // Expiry Year Input
  const expiryYearContainer = document.getElementById('expiry-year-container');
  expiryYearInput = new Input(expiryYearContainer, {
    id: 'expiry-year',
    name: 'expiryYear',
    type: 'password',
    label: i18n.t('form.expiryYear'),
    placeholder: 'YY',
    required: true,
    inputMode: 'numeric',
    maxLength: 2,
    validator: (value) => {
      const year = parseInt(extractNumbers(value));
      if (year < 0 || year > 99) {
        return { valid: false, message: 'Invalid year' };
      }
      return { valid: true, message: '' };
    }
  });

  // Captcha Input
  const captchaContainer = document.getElementById('captcha-container');
  const captchaWrapper = document.createElement('div');
  captchaWrapper.className = 'captcha-container';
  
  captchaInput = new Input(captchaWrapper, {
    id: 'captcha',
    name: 'captcha',
    type: 'text',
    label: i18n.t('form.securityCode'),
    placeholder: 'Enter code',
    required: true,
    maxLength: 6
  });
  
  const captchaImage = document.createElement('img');
  captchaImage.src = '/api/captcha/image';
  captchaImage.className = 'captcha-image';
  captchaImage.alt = 'Captcha';
  captchaImage.onclick = () => {
    captchaImage.src = '/api/captcha/image?' + Date.now();
  };
  
  const captchaAudio = document.createElement('button');
  captchaAudio.type = 'button';
  captchaAudio.className = 'captcha-audio';
  captchaAudio.innerHTML = '🔊';
  captchaAudio.onclick = () => {
    const audio = new Audio('/api/captcha/audio');
    audio.play();
  };
  
  captchaWrapper.appendChild(captchaImage);
  captchaWrapper.appendChild(captchaAudio);
  captchaContainer.appendChild(captchaWrapper);

  // OTP Input
  const otpContainer = document.getElementById('otp-input-container');
  const otpWrapper = document.createElement('div');
  otpWrapper.style.display = 'flex';
  otpWrapper.style.gap = 'var(--spacing-sm)';
  otpWrapper.style.alignItems = 'flex-end';
  
  otpInput = new Input(otpWrapper, {
    id: 'otp',
    name: 'otp',
    type: 'password',
    label: i18n.t('form.otp'),
    placeholder: i18n.t('form.otp.placeholder'),
    required: true,
    validator: validateOTP,
    inputMode: 'numeric',
    maxLength: 6,
    rightAction: {
      icon: '🔢',
      label: 'Virtual PIN pad',
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
  
  const getOtpButton = document.createElement('button');
  getOtpButton.type = 'button';
  getOtpButton.className = 'btn btn-secondary';
  getOtpButton.textContent = 'دریافت رمز پویا';
  getOtpButton.onclick = () => {
    // Request OTP
    errorHandler.show({
      message: 'رمز پویا ارسال شد',
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
  // This would update a bank logo element if it exists
  // Implementation depends on where the logo should be displayed
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
    amount: 100000,
    terminal: '12345678',
    site: 'example.com'
  };
  
  container.innerHTML = `
    <div class="transaction-info-item">
      <span class="transaction-info-label">پذیرنده:</span>
      <span class="transaction-info-value">${transactionData.merchant}</span>
    </div>
    <div class="transaction-info-item">
      <span class="transaction-info-label">مبلغ:</span>
      <span class="transaction-info-value">${transactionData.amount.toLocaleString()} ریال</span>
    </div>
    <div class="more-content" id="more-transaction-info">
      <div class="transaction-info-item">
        <span class="transaction-info-label">شماره پذیرنده / ترمینال:</span>
        <span class="transaction-info-value">${transactionData.terminal}</span>
      </div>
      <div class="transaction-info-item">
        <span class="transaction-info-label">سایت پذیرنده:</span>
        <span class="transaction-info-value">${transactionData.site}</span>
      </div>
    </div>
    <button type="button" class="more-toggle" id="more-toggle">نمایش بیشتر</button>
  `;
  
  const moreToggle = document.getElementById('more-toggle');
  const moreContent = document.getElementById('more-transaction-info');
  
  moreToggle.onclick = () => {
    const isShowing = moreContent.classList.contains('show');
    if (isShowing) {
      moreContent.classList.remove('show');
      moreToggle.textContent = 'نمایش بیشتر';
    } else {
      moreContent.classList.add('show');
      moreToggle.textContent = 'نمایش کمتر';
    }
  };
}

function initializePartnerLogos() {
  const container = document.getElementById('partner-logos');
  
  // Mock partner logos
  const logos = [
    '/assets/images/partners/logo1.svg',
    '/assets/images/partners/logo2.svg'
  ];
  
  logos.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'partner-logo';
    img.alt = 'Partner logo';
    container.appendChild(img);
  });
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
      expiryMonthInput.validate(),
      expiryYearInput.validate(),
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
    
    // Validate expiry date together
    const expiryValidation = validateExpiryDate(
      expiryMonthInput.getValue(),
      expiryYearInput.getValue()
    );
    
    if (!expiryValidation.valid) {
      errorHandler.show({
        message: expiryValidation.message,
        mode: 'toast',
        type: 'error'
      });
      return;
    }
    
    // Submit form
    // This would call the payment API
    soundManager.beep();
    errorHandler.show({
      message: 'در حال پردازش...',
      mode: 'toast',
      type: 'info'
    });
  });
  
  showReceiptButton.addEventListener('click', () => {
    receiptFields.style.display = receiptFields.style.display === 'none' ? 'block' : 'none';
    if (receiptFields.style.display === 'block') {
      showReceiptButton.style.display = 'none';
    }
  });
  
  document.getElementById('cancel-button').addEventListener('click', () => {
    if (confirm('آیا از انصراف اطمینان دارید؟')) {
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
  // Update header title
  if (header) {
    header.updateTitle(i18n.t('header.title'));
  }

  // Update card titles
  const cardTitles = document.querySelectorAll('.card-title');
  cardTitles.forEach((title, index) => {
    if (index === 0) {
      title.textContent = i18n.t('timer.title');
    } else if (index === 1) {
      title.textContent = i18n.t('form.partnerLogos');
    } else if (index === 2) {
      title.textContent = i18n.t('form.title');
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
  if (expiryMonthInput) {
    expiryMonthInput.setLabel(i18n.t('form.expiryMonth'));
  }
  if (expiryYearInput) {
    expiryYearInput.setLabel(i18n.t('form.expiryYear'));
  }
  if (captchaInput) {
    captchaInput.setLabel(i18n.t('form.captcha'));
    captchaInput.setPlaceholder(i18n.t('form.captcha.placeholder'));
  }
  if (otpInput) {
    otpInput.setLabel(i18n.t('form.otp'));
    otpInput.setPlaceholder(i18n.t('form.otp.placeholder'));
  }
  if (mobileInput) {
    mobileInput.setLabel(i18n.t('form.mobile'));
    mobileInput.setPlaceholder(i18n.t('form.mobile.placeholder'));
  }
  if (emailInput) {
    emailInput.setLabel(i18n.t('form.email'));
    emailInput.setPlaceholder(i18n.t('form.email.placeholder'));
  }

  // Update buttons
  const submitButton = document.getElementById('submit-button');
  if (submitButton) {
    submitButton.textContent = i18n.t('form.submit');
  }
  const cancelButton = document.getElementById('cancel-button');
  if (cancelButton) {
    cancelButton.textContent = i18n.t('form.cancel');
  }
  const showReceiptButton = document.getElementById('show-receipt-button');
  if (showReceiptButton) {
    showReceiptButton.textContent = i18n.t('form.showReceipt');
  }

  // Update transaction info labels
  const transactionLabels = document.querySelectorAll('.transaction-info-label');
  transactionLabels.forEach((label, index) => {
    const text = label.textContent.trim();
    if (text.includes('پذیرنده') || text.includes('Merchant')) {
      label.textContent = i18n.t('transaction.merchant') + ':';
    } else if (text.includes('مبلغ') || text.includes('Amount')) {
      label.textContent = i18n.t('transaction.amount') + ':';
    } else if (text.includes('ترمینال') || text.includes('Terminal')) {
      label.textContent = i18n.t('transaction.terminal') + ':';
    } else if (text.includes('سایت') || text.includes('Site')) {
      label.textContent = i18n.t('transaction.site') + ':';
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

  // Update checkbox label
  const saveCardCheckbox = document.querySelector('#save-card-checkbox + label');
  if (saveCardCheckbox) {
    saveCardCheckbox.textContent = i18n.t('form.saveCard');
  }
}
