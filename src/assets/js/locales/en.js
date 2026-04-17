/**
 * English Translations
 */
export default {
  // Common
  'common.submit': 'Submit',
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.confirm': 'Confirm',
  'common.help': 'Help',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.save': 'Save',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.clear': 'Clear',
  'common.required': 'This field is required',
  'common.processing': 'Processing...',

  // Redirect
  'redirect.loading': 'Redirecting...',

  // Header
  'header.title': 'Payment Gateway',

  // Footer
  'footer.supportPrefix': '24/7 customer support center:',
  'footer.supportPhone': '021-84080',
  'footer.copyright':
    '© 2020 - 2025 (SEP) Saman Electronic Payment\nAll material and intellectual rights are reserved for Saman Electronic Payment.',

  // Form
  'form.cardNumber': 'Card Number',
  'form.cardNumber.selectCard': 'Select card',
  'form.cardNumber.placeholder': '1234 5678 9012 3456',
  'form.cardNumber.required': 'Card number is required',
  'form.cardNumber.invalid': 'Invalid card number',
  'form.cvv2': 'CVV2',
  'form.cvv2.placeholder': '123',
  'form.cvv2.required': 'CVV2 is required',
  'form.cvv2.hint': '3 or 4 digit code on the back of the card',
  'form.cvv2.invalidLength': 'CVV2 must be {{count}} digits',
  'form.expiryDate': 'Expiry Date',
  'form.expiryMonth': 'Month',
  'form.expiryYear': 'Year',
  'form.expiryDate.required': 'Expiry date is required',
  'form.expiryDate.invalid': 'Invalid expiry date',
  'form.securityCode': 'Security Code',
  'form.securityCode.required': 'Security code is required',
  'form.otp': 'OTP',
  'form.otp.placeholder': '123456',
  'form.otp.required': 'OTP is required',
  'form.mobile': 'Mobile Number',
  'form.mobile.placeholder': '09123456789',
  'form.mobile.required': 'Mobile number is required',
  'form.mobile.invalid': 'Invalid mobile number',
  'form.email': 'Email',
  'form.email.placeholder': 'example@email.com',
  'form.email.required': 'Email is required',
  'form.email.invalid': 'Invalid email',
  'form.saveCard': 'Save card in SEP gateway',
  'form.pay': 'Pay',
  'form.pay.securePrefix': 'Secure payment',
  'form.pay.disabled': 'Please complete all information',
  'form.pay.processing': 'Connecting to bank...',
  'form.pay.success': 'Payment completed successfully',
  'form.captchaAudioUnavailable': 'Captcha audio is not available in this build',
  'form.cancel': 'Cancel',
  'form.showReceipt': 'Show Receipt',
  'form.title': 'Payment Information',
  'form.submit': 'Submit',
  'form.captcha': 'Security Code',
  'form.captcha.placeholder': 'Enter code',
  'form.validation.error': 'Please fill all fields correctly',
  'form.showCards': 'Show cards',
  'form.virtualPinPad': 'Virtual PIN pad',
  'form.reloadCaptcha': 'Reload captcha',
  'form.getOtp': 'Get OTP',
  'form.getOtpSuccess': 'OTP sent successfully',
  'form.getOtpExhausted': 'Maximum OTP requests for this card have been used.',
  'form.getOtpCountdownAria': 'Wait {{time}} before requesting OTP again',
  'form.captchaImageAlt': 'Security code',
  'form.captchaAudio': 'Play captcha audio',
  'form.audioPlay': 'Play audio',
  'cancelConfirm.title': 'Cancel payment?',
  'cancelConfirm.description':
    'If you leave now, your payment might not complete. Choose an option to be sure.',
  'cancelConfirm.imageAlt': 'Illustration for leaving payment',
  'cancelConfirm.continuePay': 'Continue payment',
  'cancelConfirm.confirmLeave': 'Leave payment',
  'form.expiryPlaceholder': 'MM/YY',
  'form.giftCardNotice': 'This is a gift card',

  // Payment init (SSR session)
  'paymentInit.error.title': 'Cannot start payment',
  'paymentInit.error.description':
    'Payment session data is missing or invalid. Please use the correct link to open the gateway or try again later.',

  // Accessibility
  'accessibility.selectLanguage': 'Select language',
  'accessibility.partnerLogo': 'Partner logo',
  'accessibility.openSettings': 'Settings',

  'settings.theme': 'Theme',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',
  'settings.theme.system': 'System (time of day)',

  // Card List
  'cardList.addNew': 'Add New Card',
  'cardList.manage': 'Manage Cards',
  'cardList.pin': 'Pin',
  'cardList.unpin': 'Unpin',
  'cardList.delete': 'Delete',
  'cardList.deleteConfirm': 'Are you sure you want to delete this card?',
  'cardList.empty': 'No cards registered',

  // Receipt
  'receipt.success': 'Transaction Successful',
  'receipt.failed': 'Transaction Failed',
  'receipt.pending': 'Processing',
  'receipt.amount': 'Amount',
  'receipt.transactionType': 'Transaction Type',
  'receipt.merchant': 'Merchant',
  'receipt.terminal': 'Terminal',
  'receipt.site': 'Merchant Site',
  'receipt.share': 'Share',
  'receipt.save': 'Save to Gallery',
  'receipt.paymentSuccessDesc': 'Payment completed successfully',
  'receipt.paymentFailedDesc': 'Payment failed',
  'receipt.copied': 'Receipt text copied',
  'receipt.saveError': 'Error saving receipt',
  'receipt.shareText': 'Transaction receipt',
  'receipt.plain.amount': 'Amount:',
  'receipt.plain.merchant': 'Merchant:',
  'receipt.plain.transactionId': 'Transaction ID:',
  'receipt.plain.date': 'Date:',
  'receipt.demo.transactionType': 'Purchase',

  // Transaction
  'transaction.merchant': 'Merchant',
  'transaction.amount': 'Amount',
  'transaction.terminal': 'Merchant / Terminal Number',
  'transaction.site': 'Merchant Site',
  'transaction.showMore': 'Show More',
  'transaction.showLess': 'Show Less',
  'transaction.rial': 'Rial',
  'transaction.toman': 'Toman',
  'transaction.demo.merchantName': 'Sample store',
  'transaction.demo.siteHost': 'example.com',

  // Pin Pad
  'pinPad.title': 'Enter PIN',
  'pinPad.clear': 'Clear',

  // Timer
  'timer.title': 'Remaining Time',
  'timer.expired': 'Time expired',

  'form.showReceiptToggle': 'Email or mobile to receive receipt (optional)',

  // Errors
  'error.network': 'Network error',
  'error.invalidData': 'Invalid data',
  'error.unknown': 'Unknown error',
};
