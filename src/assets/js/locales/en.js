/**
 * English Translations
 */
export default {
  // Common
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.help': 'Help',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.clear': 'Clear',
  'common.required': 'This field is required',
  'common.processing': 'Processing...',
  'common.loading': 'Loading...',
  'common.tryAgain': 'Try Again',
  'network.offline.title': 'Internet connection is unavailable',
  'network.offline.description':
    'Once your connection is restored, this page will continue from where you left off.',

  // Redirect
  'redirect.loadingTitle': 'Redirecting to merchant website',

  // Help drawer (payment form)
  'helpDrawer.title': 'Help',
  'helpDrawer.tablistAriaLabel': 'Help topics',
  'helpDrawer.tabSecurity': 'Security tips',
  'helpDrawer.tabOtp': 'Dynamic password (OTP)',
  'helpDrawer.tabPayment': 'Payment guide',
  'helpDrawer.securityBody':
    'SEP online payment gateway is provided over secure SSL and starts with https://sep.shaparak.ir. Before entering any card details, compare the address shown in your browser with this address. If there is any mismatch, do not continue the payment.\n\n' +
    'Never share your card password, CVV2, or one-time password with anyone, including phone support.\n\n' +
    'Avoid paying on public networks, open Wi-Fi, or shared devices.\n\n' +
    'Verify the merchant name and payable amount, and continue only if everything matches your purchase.\n\n' +
    'To reduce the risk of information disclosure, use the secure/virtual keyboard whenever possible.\n\n' +
    'When finished, especially on shared computers, sign out and close the browser.\n\n' +
    'For more information, reporting suspicious stores, or checking internet-merchant status, call 021-84080 or email epay@sep.ir.',
  'helpDrawer.otpBody':
    'A dynamic password is a one-time code used instead of your card internet password.\n\n' +
    'Request the dynamic password only when you are ready for final payment confirmation. Enter the code before it expires; if it expires, request a new code and do not reuse older ones.\n\n' +
    'If you receive multiple codes, enter only the latest valid code and never share it with others.\n\n' +
    'Step 1: Activate dynamic password according to your card issuer bank instructions.\n\n' +
    'Step 2: Receive dynamic password using one of the bank-provided methods:\n' +
    '1- Bank app, internet banking, or mobile banking.\n' +
    '2- Your issuer bank USSD code.\n' +
    '3- The "Get OTP" button on the payment gateway.\n\n' +
    'Step 3: After receiving the code, enter it in the "Second Password/OTP" field, then complete the rest of the information and finalize payment.',
  'helpDrawer.paymentBody':
    'To complete payment, enter the following information carefully:\n' +
    '1- Card number: 16 digits, printed on the card in four 4-digit groups.\n' +
    '2- CVV2: A 3- or 4-digit security code printed on the front or back of the card.\n' +
    '3- Expiry date: Includes expiry month and year, printed near the card number.\n' +
    '4- Dynamic password: May also appear as second password or internet password, and can be obtained/changed via the issuer bank or its ATMs.\n' +
    '5- Security code (captcha): A numeric code shown in the payment page image, which must be entered in the related field.\n\n' +
    'Before finalizing payment, verify the payable amount and merchant name.\n\n' +
    'After a successful payment, keep the receipt until goods or service delivery.\n\n' +
    'If you notice anything unusual, stop the payment and follow up through official bank or merchant channels.',

  // Header
  'header.title': 'Payment Gateway',

  // Footer
  'footer.supportPrefix': '24/7 customer support center:',
  'footer.supportPhone': '021-84080',
  'footer.copyrightLineFirst': '© 2020 - 2025 (SEP) Saman Electronic Payment',
  'footer.copyrightLineSecondBefore': 'All material and intellectual rights are reserved for ',
  'footer.copyrightBrandLink': 'Saman Electronic Payment',
  'footer.copyrightLineSecondAfter': '.',
  'footer.copyrightBrandLinkAriaLabel':
    'Saman Electronic Payment website, sep.ir — opens in a new tab',

  // Form
  'form.cardNumber': 'Card Number',
  'form.cardNumber.selectCard': 'Select card',
  'form.cardNumber.placeholder': '●●●● ●●●● ●●●● ●●●●',
  'form.cardNumber.required': 'Card number is required',
  'form.cardNumber.invalid': 'Invalid card number',
  'form.cardNumber.mustBe16Digits': 'Card number must be 16 digits',
  'form.cvv2': 'CVV2',
  'form.cvv2.placeholder': '123',
  'form.cvv2.required': 'CVV2 is required',
  'form.cvv2.hint': '3 or 4 digit code on the back of the card',
  'form.cvv2.invalidLength': 'CVV2 must be {{count}} digits',
  'form.cvv2.invalidLengthRange': 'CVV2 must be 3 or 4 digits',
  'form.expiryDate': 'Expiry Date',
  'form.expiryMonth': 'Month',
  'form.expiryYear': 'Year',
  'form.expiryDate.required': 'Expiry date is required',
  'form.expiryDate.invalidMonth': 'Invalid month',
  'form.expiryDate.expired': 'Card has expired',
  'form.expiryDate.incomplete': 'Enter 2-digit month and 2-digit year',
  'form.securityCode': 'Security Code',
  'form.otp': 'OTP',
  'form.otp.placeholder': '123456',
  'form.otp.required': 'OTP is required',
  'form.otp.invalidLengthRange': 'OTP must be between {{min}} and {{max}} digits',
  'form.otp.gift': 'OTP / Internet Password',
  'form.otp.gift.placeholder': 'OTP / Internet Password',
  'form.otp.gift.required': 'OTP / Internet Password is required',
  'form.otp.gift.invalidLengthRange':
    'OTP / Internet Password must be between {{min}} and {{max}} digits',
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
  'form.pay.secureWithAmount': 'Secure payment ({{amount}} {{currency}})',
  'form.pay.disabled': 'Please complete all information',
  'form.pay.processing': 'Processing transaction...',
  'form.pay.success': 'Payment completed successfully',
  'form.pay.errorCodeLabel': 'Error code',
  'form.cancel': 'Cancel',
  'form.title': 'Enter your card details',
  'form.captcha.placeholder': 'Enter code',
  'form.captcha.required': 'Security code is required',
  'form.captcha.invalidLength': 'Security code must be {{count}} digits',
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
  'form.giftCardNotice':
    'Some bank-issued gift cards do not require a one-time password (OTP). In that case, use the internet password for your gift card.',
  'form.panProductRestriction.inlineNotice':
    'For “{{productTitle}}” payments, only cards on this transaction’s allow-list can be used. Other cards cannot complete this payment.',
  'form.panProductRestriction.invalidCard':
    'This card is not allowed for “{{productTitle}}” on this transaction. Pick another saved card or enter a card number that matches the rule above.',
  'form.panProductRestriction.fallbackProduct': 'this payment type',
  'form.showReceiptToggle': 'Email or mobile to receive receipt (optional)',

  // Payment init (SSR session)
  'paymentInit.error.title': 'Cannot start payment',
  'paymentInit.error.description':
    'Payment session data is missing or invalid. Please use the correct link to open the gateway or try again later.',
  'transactionInit.error.title': 'Cannot load transaction information',
  'transactionInit.error.description':
    'The transaction service is unavailable right now. Please try again.',

  // Accessibility
  'accessibility.selectLanguage': 'Select language',
  'accessibility.partnerLogo': 'Partner logo',
  'accessibility.openSettings': 'Settings',

  'settings.theme': 'Gateway display',
  'settings.theme.light': 'Day mode',
  'settings.theme.dark': 'Night mode',
  'settings.theme.system': 'Follow OS setting',

  // Card List
  'cardList.addNew': 'Add New Card',
  'cardList.manage': 'Manage Cards',
  'cardList.sheetTitle': 'Select Bank Card',
  'cardList.sheetSubtitle': 'You recently used the following bank cards',
  'cardList.empty': 'No saved card to display',
  'cardList.removeNotAllowed': 'This card cannot be removed.',
  'cardList.removeSuccess': 'Card removed successfully.',

  // Receipt
  'receipt.success': 'Debit Successful',
  'receipt.failed': 'Debit Failed',
  'receipt.merchant': 'Merchant',
  'receipt.share': 'Share',
  'receipt.save': 'Save to Gallery',
  'receipt.paymentSuccessDesc': 'Card debit completed successfully.',
  'receipt.paymentFailedDesc': 'Card debit could not be completed.',
  'receipt.copied': 'Receipt text copied',
  'receipt.saveError': 'Error saving receipt',
  'receipt.shareText': 'Transaction receipt',
  'receipt.download': 'Download receipt',
  'receipt.status': 'Transaction status',
  'receipt.statusSuccessDetail': 'Card debit completed successfully',
  'receipt.statusFailedDetail': 'Card debit could not be completed',
  'receipt.plain.amount': 'Amount',
  'receipt.plain.merchant': 'Merchant:',
  'receipt.plain.transactionId': 'Transaction ID',
  'receipt.plain.date': 'Date',
  'receipt.plain.card': 'Card number',
  'receipt.sectionMerchant': 'Acceptor details',
  'receipt.sectionTransaction': 'Transaction details',
  'receipt.receiptTitle': 'Receipt',
  'receipt.sectionInstallmentInfo': 'Installment transaction details',
  'receipt.sectionBillInfo': 'Paid bills details',
  'receipt.installmentCount': 'Installment count',
  'receipt.installmentAmount': 'Installment amount',
  'receipt.installmentNumber': 'Installment number',
  'receipt.billInfoId': 'Bill info ID',
  'receipt.billId': 'Bill ID',
  'receipt.payId': 'Pay ID',
  'receipt.completeAndReturn': 'Finish process and return to merchant site',
  'receipt.autoReturnPrefix': 'Automatic return in',
  'receipt.traceCode': 'Tracking code',
  'receipt.digitalReceipt': 'Digital receipt',
  'receipt.transactionType': 'Transaction type',
  'receipt.transactionTime': 'Transaction time',
  'receipt.transactionAmount': 'Transaction amount',
  'receipt.discountAmount': 'Discount amount',
  'receipt.deductedAmount': 'Deducted amount',
  'receipt.issuerBank': 'Card issuer bank',
  'receipt.merchantNumber': 'Merchant number',
  'receipt.terminalNumber': 'Terminal number',
  'receipt.gatewayCode': 'Gateway code',
  'receipt.paymentFacilitator': 'Payment facilitator',
  'receipt.merchantSiteAddress': 'Merchant website',
  'receipt.noticePolicy':
    'If the merchant does not confirm delivery of goods or services to SEP within 30 minutes, the deducted amount will be returned to your account within 72 hours.',
  'receipt.finalizationNotice':
    'This receipt is not final. It becomes final after delivery of goods or services is confirmed by the acceptor.',
  'receipt.rrn': 'RRN',
  'receipt.demo.transactionType': 'Purchase',

  // Transaction
  'transaction.merchant': 'Merchant',
  'transaction.amount': 'Amount',
  'transaction.terminal': 'Merchant / Terminal Number',
  'transaction.site': 'Merchant Site',
  'transaction.paymentFacilitatorName': 'Payment Facilitator Name',
  'transaction.transactionType': 'Transaction Type',
  'transaction.description': 'Description',
  'bill.type.water': 'Water Bill',
  'bill.type.electricity': 'Electricity Bill',
  'bill.type.gas': 'Gas Bill',
  'bill.type.phone': 'Phone Bill',
  'bill.type.mobile': 'Mobile Bill',
  'bill.type.municipality': 'Municipality Bill',
  'bill.type.tax': 'Tax Bill',
  'bill.type.traffic': 'Traffic Fine',
  'bill.type.unknown': 'Unknown Bill Type',
  'bill.status.paid': 'Paid',
  'bill.status.ready': 'Ready to pay',
  'bill.action.viewReceipt': 'View receipt',
  'bill.selector.title': 'Select bill',
  'bill.selector.subtitle': 'Select one of the bills below',
  'bill.selector.required': 'Selecting a bill is required',
  'bill.hint.payableCount': 'Ready to pay: {{count}}',
  'bill.hint.paidCount': 'Paid: {{count}}',
  'bill.flow.skipRemaining': 'Skip remaining bills',
  'bill.flow.completeTitle': 'Your bill payment flow is complete',
  'bill.flow.completeDescription':
    'You can return to the merchant website now or wait for automatic return.',
  'bill.flow.summarySectionTitle': 'Bill payment summary',
  'bill.flow.summaryPaid': 'Paid bills count:',
  'bill.flow.summaryUnpaid': 'Unpaid/failed bills count:',
  'bill.flow.summaryPaidAmount': 'Total paid amount:',
  'bill.flow.noticeSettlement':
    'Bill settlement is usually instant, but in some cases it can be delayed up to 48 hours due to utility-provider infrastructure. If your payment was successful, your bill will still be settled.',
  'bill.flow.completeAndReturn': 'Complete bill flow and return to merchant website',
  'bill.receipt.modalTitle': 'Bill payment receipt',
  'bill.receipt.unavailable': 'No receipt data is available for this bill.',
  'bill.flow.waitForOtpCooldownAfterSuccess':
    'This bill was paid successfully. To pay the next bill, please wait until the 2-minute OTP cooldown ends, then select and pay the next bill.',
  'transaction.descriptionExpand': 'Show full description',
  'transaction.descriptionCollapse': 'Show less',
  'transaction.type.balance': 'Balance Inquiry',
  'transaction.type.purchase': 'Purchase',
  'transaction.type.thirdParty': 'Third Party',
  'transaction.type.gamPapers': 'GAM Papers',
  'transaction.type.charge': 'Charge PIN Purchase',
  'transaction.type.bill': 'Bill Payment',
  'transaction.type.specialBill': 'Special Bill Payment',
  'transaction.type.billManualVerify': 'Bill (Manual Verification)',
  'transaction.type.billThirdParty': 'Service Bill (Third-Party Settlement)',
  'transaction.type.payment': 'UD Payment',
  'transaction.type.groupCharge': 'Group Charge PIN',
  'transaction.type.transfer': 'Transfer',
  'transaction.type.topUp': 'Top-Up and Package',
  'transaction.type.government': 'Government Transaction',
  'transaction.type.chargePayment': 'Charge Transaction',
  'transaction.type.sepSegmentPayment': 'Organizational Card Transaction',
  'transaction.type.unknown': 'Unknown',
  'transaction.showMore': 'Show More',
  'transaction.showLess': 'Show Less',
  'transaction.rial': 'Rial',
  'transaction.amountInWordsPrefix': 'Equivalent',
  'transaction.toman': 'Toman',
  'transaction.demo.merchantName': 'Sample store',
  'transaction.demo.siteHost': 'example.com',

  // Pin Pad
  'pinPad.secureKeyboardTitle': 'Secure keyboard',
  'pinPad.clear': 'Clear',

  // Timer
  'timer.title': 'Remaining Time',
  'timer.expired': 'Time expired',
  'timer.transactionExpiredTitle': 'Transaction time has expired',
  'timer.transactionExpiredDescription':
    'You will be redirected to merchant website in one minute.',
  'timer.returnToMerchant': 'Return to merchant website',

  // Errors
  'error.network': 'Network error',
  'error.unknown': 'Unknown error',
};
