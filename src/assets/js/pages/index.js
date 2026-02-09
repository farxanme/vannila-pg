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

  // Expiry Date Input (MM/YY format)
  const expiryDateContainer = document.getElementById('expiry-date-container');
  expiryDateInput = new Input(expiryDateContainer, {
    id: 'expiry-date',
    name: 'expiryDate',
    type: 'password',
    label: i18n.t('form.expiryDate'),
    placeholder: 'MM/YY',
    required: true,
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

/**
 * Convert number to Persian words (simplified version)
 */
function numberToPersianWords(num) {
  const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const hundreds = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  
  if (num === 0) return 'صفر';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one > 0 ? ' و ' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return hundreds[hundred] + (remainder > 0 ? ' و ' + numberToPersianWords(remainder) : '');
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return numberToPersianWords(thousand) + ' هزار' + (remainder > 0 ? ' و ' + numberToPersianWords(remainder) : '');
  }
  if (num < 1000000000) {
    const million = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    return numberToPersianWords(million) + ' میلیون' + (remainder > 0 ? ' و ' + numberToPersianWords(remainder) : '');
  }
  return num.toString();
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
    <div class="transaction-info-item">
      <div class="transaction-info-icon">🏪</div>
      <div class="transaction-info-content">
        <div class="transaction-info-label">${i18n.t('transaction.merchant')}</div>
        <div class="transaction-info-value">${transactionData.merchant}</div>
      </div>
    </div>
    <div class="transaction-info-item">
      <div class="transaction-info-icon">💰</div>
      <div class="transaction-info-content">
        <div class="transaction-info-label">${i18n.t('transaction.amount')}</div>
        <div class="transaction-info-value">
          <div class="transaction-amount-rial">${transactionData.amount.toLocaleString('fa-IR')} ${i18n.t('transaction.rial')}</div>
          <div class="transaction-amount-toman">${amountInWords} ${i18n.t('transaction.toman')}</div>
        </div>
      </div>
    </div>
    <div class="more-content" id="more-transaction-info">
      <div class="transaction-info-item">
        <div class="transaction-info-icon">🔢</div>
        <div class="transaction-info-content">
          <div class="transaction-info-label">${i18n.t('transaction.terminal')}</div>
          <div class="transaction-info-value">${transactionData.terminal}</div>
        </div>
      </div>
      <div class="transaction-info-item">
        <div class="transaction-info-icon">🌐</div>
        <div class="transaction-info-content">
          <div class="transaction-info-label">${i18n.t('transaction.site')}</div>
          <div class="transaction-info-value">${transactionData.site}</div>
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
    img.alt = 'Partner logo';
    img.onerror = () => {
      // Hide image if it fails to load
      img.style.display = 'none';
    };
    container.appendChild(img);
  });
  
  // Hide section if no valid logos were added
  const visibleLogos = Array.from(container.children).filter(img => img.style.display !== 'none');
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

  // Update all elements with data-i18n attribute
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
    expiryDateInput.setPlaceholder('MM/YY');
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
        } else if (iconText === '🔢') {
          label.textContent = i18n.t('transaction.terminal');
        } else if (iconText === '🌐') {
          label.textContent = i18n.t('transaction.site');
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
