/**
 * Persian (Farsi) Translations
 */
export default {
  // Common
  'common.cancel': 'انصراف',
  'common.close': 'بستن',
  'common.help': 'راهنما',
  'common.delete': 'حذف',
  'common.edit': 'ویرایش',
  'common.clear': 'پاک کردن',
  'common.required': 'این فیلد الزامی است',
  'common.processing': 'در حال پردازش...',
  'common.loading': 'در حال بارگذاری...',
  'common.tryAgain': 'تلاش دوباره',
  'network.offline.title': 'دسترسی اینترنت قطع است',
  'network.offline.description': 'پس از اتصال مجدد اینترنت، ادامه همین صفحه نمایش داده می‌شود.',

  // Redirect
  'redirect.loadingTitle': 'در حال انتقال به سایت پذیرنده',

  // Help drawer (payment form)
  'helpDrawer.title': 'راهنما',
  'helpDrawer.tablistAriaLabel': 'موضوعات راهنما',
  'helpDrawer.tabSecurity': 'نکات امنیتی',
  'helpDrawer.tabOtp': 'راهنمای استفاده از رمز پویا',
  'helpDrawer.tabPayment': 'راهنمای پرداخت',
  'helpDrawer.securityBody':
    'درگاه پرداخت اینترنتی سپ (پرداخت الکترونیک سامان) با استفاده از پروتکل امن SSL ارائه می‌شود و آدرس آن با https://sep.shaparak.ir شروع می‌شود. پیش از ورود هرگونه اطلاعات، آدرس نمایش‌داده‌شده در مرورگر را با این آدرس تطبیق دهید و در صورت مشاهده هرگونه مغایرت، از ادامه پرداخت خودداری کنید.\n\n' +
    'رمز کارت، CVV2 و رمز یک‌بارمصرف را با هیچ‌کس، حتی پشتیبانی تلفنی، به اشتراک نگذارید.\n\n' +
    'از پرداخت در شبکه‌های عمومی، وای‌فای باز و دستگاه‌های مشترک خودداری کنید.\n\n' +
    'نام فروشنده و مبلغ نمایش داده‌شده را با خرید خود تطبیق دهید و فقط در صورت اطمینان پرداخت را ادامه دهید.\n\n' +
    'برای کاهش ریسک افشای اطلاعات، حتی‌المقدور از صفحه‌کلید امن/مجازی استفاده کنید.\n\n' +
    'پس از اتمام کار، به‌ویژه در رایانه مشترک، از حساب کاربری خارج شوید و مرورگر را ببندید.\n\n' +
    'برای دریافت اطلاعات بیشتر، گزارش فروشگاه‌های مشکوک یا استعلام وضعیت پذیرندگان اینترنتی می‌توانید با شماره 84080-021 تماس بگیرید یا به ایمیل epay@sep.ir پیام ارسال کنید.',
  'helpDrawer.otpBody':
    'رمز پویا، رمز یک‌بارمصرفی است که به جای رمز اینترنتی کارت استفاده می‌شود.\n\n' +
    'رمز پویا را فقط زمانی درخواست کنید که آماده تأیید نهایی پرداخت هستید. کد را پیش از پایان اعتبار در فیلد مربوطه وارد کنید؛ اگر منقضی شد، کد جدید بگیرید و از کدهای قبلی استفاده نکنید.\n\n' +
    'اگر چند کد دریافت کردید، فقط آخرین کد معتبر را وارد کنید و آن را در اختیار دیگران قرار ندهید.\n\n' +
    'مرحله اول: مطابق دستورالعمل بانک صادرکننده کارت، رمز پویا را فعال کنید.\n\n' +
    'مرحله دوم: رمز پویا را بر اساس روش اعلامی بانک صادرکننده، از یکی از این روش‌ها دریافت کنید:\n' +
    '1- برنامه کاربردی بانک، اینترنت‌بانک یا موبایل‌بانک.\n' +
    '2- کد USSD بانک صادرکننده کارت.\n' +
    '3- دکمه «دریافت رمز پویا» در درگاه پرداخت اینترنتی.\n\n' +
    'مرحله سوم: پس از دریافت رمز، آن را در محل «رمز دوم» وارد کنید و سپس بقیه اطلاعات را تکمیل و پرداخت را نهایی کنید.',
  'helpDrawer.paymentBody':
    'برای انجام پرداخت، اطلاعات زیر را با دقت وارد کنید:\n' +
    '1- شماره کارت: 16 رقمی است و به صورت 4 بخش 4 رقمی روی کارت درج شده است.\n' +
    '2- CVV2: کد 3 یا 4 رقمی امنیتی کارت است که روی یا پشت کارت درج می‌شود.\n' +
    '3- تاریخ انقضا: شامل ماه و سال انقضا است و کنار شماره کارت قرار دارد.\n' +
    '4- رمز پویا: ممکن است با عنوان رمز دوم یا رمز اینترنتی نیز نمایش داده شود و از طریق بانک صادرکننده یا دستگاه خودپرداز قابل دریافت/تغییر است.\n' +
    '5- کد امنیتی: عددی است که در تصویر صفحه پرداخت نمایش داده می‌شود و باید در فیلد مربوطه وارد شود.\n\n' +
    'پیش از نهایی کردن پرداخت، مبلغ و نام پذیرنده را بررسی کنید.\n\n' +
    'پس از پرداخت موفق، رسید را تا زمان تحویل کالا یا خدمت نزد خود نگه دارید.\n\n' +
    'در صورت مشاهده هر مورد غیرعادی، از ادامه پرداخت خودداری کنید و موضوع را از طریق کانال‌های رسمی بانک یا پذیرنده پیگیری کنید.',

  // Header
  'header.title': 'درگاه پرداخت اینترنتی سِپ',

  // Footer
  'footer.supportPrefix': 'مرکز شبانه روزی ارتباط با مشتریان:',
  'footer.supportPhone': '021-84080',
  'footer.copyrightLineFirst': '© 2020 - 2025 (SEP) Saman Electronic Payment',
  'footer.copyrightLineSecondBefore': 'تمام حقوق مادی و معنوی برای ',
  'footer.copyrightBrandLink': 'پرداخت الکترونیک سامان',
  'footer.copyrightLineSecondAfter': ' محفوظ است.',
  'footer.copyrightBrandLinkAriaLabel':
    'وب‌سایت پرداخت الکترونیک سامان، sep.ir — باز شدن در زبانه جدید',

  // Form
  'form.cardNumber': 'شماره کارت',
  'form.cardNumber.selectCard': 'انتخاب کارت',
  'form.cardNumber.placeholder': '●●●● ●●●● ●●●● ●●●●',
  'form.cardNumber.required': 'شماره کارت الزامی است',
  'form.cardNumber.invalid': 'شماره کارت نامعتبر است',
  'form.cardNumber.mustBe16Digits': 'شماره کارت باید ۱۶ رقم باشد',
  'form.cvv2': 'CVV2',
  'form.cvv2.placeholder': '●●●',
  'form.cvv2.required': 'CVV2 الزامی است',
  'form.cvv2.hint': 'کد ۳ یا ۴ رقمی پشت کارت',
  'form.cvv2.invalidLength': 'CVV2 باید {{count}} رقمی باشد',
  'form.cvv2.invalidLengthRange': 'CVV2 باید ۳ یا ۴ رقمی باشد',
  'form.expiryDate': 'تاریخ انقضا',
  'form.expiryMonth': 'ماه',
  'form.expiryYear': 'سال',
  'form.expiryDate.required': 'تاریخ انقضا الزامی است',
  'form.expiryDate.invalidMonth': 'ماه نامعتبر است',
  'form.expiryDate.expired': 'اعتبار کارت به پایان رسیده است',
  'form.expiryDate.incomplete': 'ماه و سال را دو رقمی وارد کنید',
  'form.securityCode': 'کد امنیتی',
  'form.otp': 'رمز پویا',
  'form.otp.placeholder': 'رمز پویا',
  'form.otp.required': 'رمز پویا الزامی است',
  'form.otp.invalidLengthRange': 'رمز پویا باید بین {{min}} تا {{max}} رقم باشد',
  'form.otp.gift': 'رمز پویا/رمز اینترنتی',
  'form.otp.gift.placeholder': 'رمز پویا/رمز اینترنتی',
  'form.otp.gift.required': 'رمز پویا/رمز اینترنتی الزامی است',
  'form.otp.gift.invalidLengthRange': 'رمز پویا/رمز اینترنتی باید بین {{min}} تا {{max}} رقم باشد',
  'form.mobile': 'شماره موبایل',
  'form.mobile.placeholder': '09123456789',
  'form.mobile.required': 'شماره موبایل الزامی است',
  'form.mobile.invalid': 'شماره موبایل نامعتبر است',
  'form.email': 'ایمیل',
  'form.email.placeholder': 'example@email.com',
  'form.email.required': 'ایمیل الزامی است',
  'form.email.invalid': 'ایمیل نامعتبر است',
  'form.saveCard': 'ذخیره امن اطلاعات غیر حساس کارت در درگاه سپ',
  'form.pay': 'پرداخت',
  'form.pay.securePrefix': 'پرداخت امن',
  'form.pay.secureWithAmount': 'پرداخت امن ({{amount}} {{currency}})',
  'form.pay.disabled': 'لطفا اطلاعات را کامل وارد کنید',
  'form.pay.processing': 'در حال پردازش تراکنش...',
  'form.pay.success': 'پرداخت با موفقیت ثبت شد',
  'form.pay.errorCodeLabel': 'کد خطا',
  'form.cancel': 'انصراف',
  'form.title': 'اطلاعات کارت خود را وارد کنید',
  'form.captcha.placeholder': 'کد را وارد کنید',
  'form.captcha.required': 'کد امنیتی الزامی است',
  'form.captcha.invalidLength': 'کد امنیتی باید {{count}} رقمی باشد',
  'form.validation.error': 'لطفا تمام فیلدها را به درستی پر کنید',
  'form.showCards': 'نمایش کارت‌ها',
  'form.virtualPinPad': 'صفحه کلید مجازی',
  'form.reloadCaptcha': 'بارگذاری مجدد کد امنیتی',
  'form.getOtp': 'دریافت رمز پویا',
  'form.getOtpSuccess': 'رمز پویا ارسال شد',
  'form.getOtpExhausted': 'حداکثر تعداد دریافت رمز پویا برای این کارت انجام شده است.',
  'form.getOtpCountdownAria': 'تا دریافت مجدد رمز پویا {{time}} صبر کنید',
  'form.captchaImageAlt': 'کد امنیتی',
  'form.captchaAudio': 'پخش صدای کد امنیتی',
  'form.audioPlay': 'پخش صوتی',
  'cancelConfirm.title': 'انصراف از پرداخت؟',
  'cancelConfirm.description':
    'اگر همین حالا ترک کنید، پرداخت شما ممکن است ناتمام بماند. برای اطمینان، یکی از گزینه‌ها را انتخاب کنید.',
  'cancelConfirm.imageAlt': 'راهنمای انصراف از پرداخت',
  'cancelConfirm.continuePay': 'ادامه پرداخت',
  'cancelConfirm.confirmLeave': 'انصراف از پرداخت',
  'form.giftCardNotice':
    'برای برخی کارت‌های هدیه بانک‌ها دریافت رمز پویا لازم نیست؛ در این صورت می‌توانید از رمز اینترنتی همان کارت‌هدیه استفاده کنید.',
  'form.panProductRestriction.inlineNotice':
    'برای پرداخت «{{productTitle}}» فقط کارت‌های مجاز این تراکنش قابل‌استفاده‌اند و با سایر کارت‌ها امکان تکمیل پرداخت وجود ندارد.',
  'form.panProductRestriction.invalidCard':
    'این کارت برای پرداخت «{{productTitle}}» در این تراکنش مجاز نیست؛ کارت دیگری انتخاب کنید.',
  'form.panProductRestriction.fallbackProduct': 'این روش پرداخت',
  'form.showReceiptToggle': 'ایمیل یا شماره موبایل برای ارسال رسید پرداخت (اختیاری)',

  // Payment init (SSR session)
  'paymentInit.error.title': 'خطا در شروع پرداخت',
  'paymentInit.error.description':
    'اطلاعات نشست پرداخت کامل نیست یا نامعتبر است. لطفا از مسیر صحیح وارد درگاه شوید یا بعدا دوباره تلاش کنید.',
  'transactionInit.error.title': 'خطا در دریافت اطلاعات تراکنش',
  'transactionInit.error.description': 'ارتباط با سرویس تراکنش برقرار نشد. لطفا دوباره تلاش کنید.',

  // Accessibility
  'accessibility.selectLanguage': 'انتخاب زبان',
  'accessibility.partnerLogo': 'لوگوی همکار',
  'accessibility.openSettings': 'تنظیمات',

  'settings.theme': 'نمایش درگاه',
  'settings.theme.light': 'حالت روز',
  'settings.theme.dark': 'حالت شب',
  'settings.theme.system': 'مطابق با سیستم عامل',

  // Card List
  'cardList.addNew': 'افزودن کارت جدید',
  'cardList.manage': 'مدیریت کارت‌ها',
  'cardList.sheetTitle': 'انتخاب کارت بانکی',
  'cardList.sheetSubtitle': 'به تازگی از کارت‌های بانکی زیر استفاده کردید',
  'cardList.empty': 'کارتی جهت نمایش وجود ندارد',
  'cardList.removeNotAllowed': 'امکان حذف این کارت وجود ندارد.',
  'cardList.removeSuccess': 'کارت با موفقیت حذف شد.',

  // Receipt
  'receipt.success': 'برداشت موفق',
  'receipt.failed': 'برداشت ناموفق',
  'receipt.merchant': 'پذیرنده',
  'receipt.share': 'اشتراک‌گذاری',
  'receipt.save': 'ذخیره در گالری',
  'receipt.paymentSuccessDesc': 'برداشت از کارت با موفقیت انجام شد.',
  'receipt.paymentFailedDesc': 'برداشت از کارت انجام نشد.',
  'receipt.copied': 'متن رسید کپی شد',
  'receipt.saveError': 'خطا در ذخیره رسید',
  'receipt.shareText': 'رسید تراکنش',
  'receipt.download': 'دریافت رسید',
  'receipt.status': 'وضعیت تراکنش',
  'receipt.statusSuccessDetail': 'برداشت از کارت با موفقیت انجام شد',
  'receipt.statusFailedDetail': 'برداشت از کارت انجام نشد',
  'receipt.plain.amount': 'مبلغ:',
  'receipt.plain.merchant': 'پذیرنده:',
  'receipt.plain.transactionId': 'شماره تراکنش:',
  'receipt.plain.date': 'تاریخ:',
  'receipt.plain.card': 'شماره کارت',
  'receipt.sectionMerchant': 'اطلاعات پذیرنده',
  'receipt.sectionTransaction': 'اطلاعات تراکنش',
  'receipt.receiptTitle': 'رسید',
  'receipt.sectionInstallmentInfo': 'اطلاعات تراکنش اقساطی',
  'receipt.sectionBillInfo': 'اطلاعات قبوض پرداختی',
  'receipt.installmentCount': 'تعداد اقساط',
  'receipt.installmentAmount': 'مبلغ قسط',
  'receipt.installmentNumber': 'شماره قسط',
  'receipt.billInfoId': 'شناسه قبض',
  'receipt.billId': 'شماره قبض',
  'receipt.payId': 'شناسه پرداخت',
  'receipt.completeAndReturn': 'اتمام فرآیند و بازگشت به سایت پذیرنده',
  'receipt.autoReturnPrefix': 'بازگشت خودکار تا',
  'receipt.traceCode': 'کد رهگیری',
  'receipt.digitalReceipt': 'رسید دیجیتالی',
  'receipt.transactionType': 'نوع تراکنش',
  'receipt.transactionTime': 'زمان تراکنش',
  'receipt.transactionAmount': 'مبلغ تراکنش',
  'receipt.discountAmount': 'مبلغ تخفیف',
  'receipt.deductedAmount': 'مبلغ کسر شده از کارت',
  'receipt.issuerBank': 'بانک صادرکننده کارت',
  'receipt.merchantNumber': 'شماره پذیرنده',
  'receipt.terminalNumber': 'شماره ترمینال',
  'receipt.gatewayCode': 'کد درگاه',
  'receipt.paymentFacilitator': 'پرداخت یار',
  'receipt.merchantSiteAddress': 'آدرس سایت پذیرنده',
  'receipt.noticePolicy':
    'در صورتی که طی 30 دقیقه، پذیرنده تایید تحویل کالا یا خدمت را به شرکت سِپ اطلاع رسانی نکند، مبلغ کسر شده طی 72 ساعت به حساب شما برگشت داده می‌شود.',
  'receipt.finalizationNotice':
    'این رسید نهایی نیست، پس از تایید تحویل کالا یا خدمت توسط پذیرنده نهایی می شود.',
  'receipt.rrn': 'شماره مرجع (RRN)',
  'receipt.demo.transactionType': 'خرید',

  // Transaction
  'transaction.merchant': 'پذیرنده',
  'transaction.amount': 'مبلغ',
  'transaction.terminal': 'شماره پذیرنده / ترمینال',
  'transaction.site': 'سایت پذیرنده',
  'transaction.paymentFacilitatorName': 'نام پرداخت یار',
  'transaction.transactionType': 'نوع تراکنش',
  'transaction.description': 'توضیحات',
  'bill.type.water': 'قبض آب',
  'bill.type.electricity': 'قبض برق',
  'bill.type.gas': 'قبض گاز',
  'bill.type.phone': 'قبض تلفن',
  'bill.type.mobile': 'قبض تلفن همراه',
  'bill.type.municipality': 'قبض شهرداری',
  'bill.type.tax': 'قبض مالیات',
  'bill.type.traffic': 'قبض راهنمایی و رانندگی',
  'bill.type.unknown': 'نوع قبض نامشخص',
  'bill.status.paid': 'پرداخت شده',
  'bill.status.ready': 'آماده پرداخت',
  'bill.action.viewReceipt': 'نمایش رسید',
  'bill.selector.title': 'انتخاب قبض',
  'bill.selector.required': 'انتخاب قبض الزامی است',
  'bill.hint.payableCount': 'آماده پرداخت: {{count}}',
  'bill.hint.paidCount': 'پرداخت شده: {{count}}',
  'bill.flow.skipRemaining': 'انصراف از قبوض باقی‌مانده',
  'bill.flow.completeTitle': 'فرآیند پرداخت قبض شما تکمیل شد',
  'bill.flow.completeDescription':
    'شما می‌توانید به سایت پذیرنده بازگردید یا منتظر بازگشت خودکار بمانید.',
  'bill.flow.summarySectionTitle': 'خلاصه پرداخت قبض',
  'bill.flow.summaryPaid': 'تعداد قبض پرداخت شده:',
  'bill.flow.summaryUnpaid': 'تعداد قبض پرداخت نشده/ناموفق:',
  'bill.flow.summaryPaidAmount': 'جمع مبالغ پرداخت شده:',
  'bill.flow.noticeSettlement':
    'تسویه قبوض معمولا آنی است، اما گاهی به‌دلیل زیرساخت شرکت خدماتی تا ۴۸ ساعت تاخیر دارد. اگر پرداخت شما موفق بوده، نگران نباشید؛ قبض شما در هر صورت تسویه می‌شود.',
  'bill.flow.completeAndReturn': 'تکمیل فرآیند قبض و بازگشت به سایت پذیرنده',
  'bill.receipt.modalTitle': 'رسید پرداخت قبض',
  'bill.receipt.unavailable': 'اطلاعات رسید برای این قبض موجود نیست.',
  'bill.flow.waitForOtpCooldownAfterSuccess':
    'پرداخت این قبض با موفقیت انجام شد. برای پرداخت قبض بعدی، لطفا تا پایان مهلت ۲ دقیقه‌ای دریافت رمز پویا صبر کنید؛ سپس قبض بعد را انتخاب و پرداخت کنید.',
  'transaction.descriptionExpand': 'نمایش کامل توضیحات',
  'transaction.descriptionCollapse': 'نمایش کمتر',
  'transaction.type.balance': 'مانده گیری',
  'transaction.type.purchase': 'خرید',
  'transaction.type.thirdParty': 'موسسات سوم',
  'transaction.type.gamPapers': 'اوراق گام',
  'transaction.type.charge': 'خرید شارژ پین',
  'transaction.type.bill': 'پرداخت قبض',
  'transaction.type.specialBill': 'پرداخت قبض ویژه',
  'transaction.type.billManualVerify': 'قبض با تایید دستی پذیرنده',
  'transaction.type.billThirdParty': 'قبض خدماتی با تسویه پذیرنده',
  'transaction.type.payment': 'پرداخت UD',
  'transaction.type.groupCharge': 'شارژ گروهی پین',
  'transaction.type.transfer': 'انتقال وجه',
  'transaction.type.topUp': 'تاپ آپ و بسته',
  'transaction.type.government': 'تراکنش دولتی',
  'transaction.type.chargePayment': 'تراکنش شارژ',
  'transaction.type.sepSegmentPayment': 'تراکنش کارت سازمانی',
  'transaction.type.unknown': 'نامشخص',
  'transaction.showMore': 'نمایش بیشتر',
  'transaction.showLess': 'نمایش کمتر',
  'transaction.rial': 'ریال',
  'transaction.amountInWordsPrefix': 'معادل',
  'transaction.toman': 'تومان',
  'transaction.demo.merchantName': 'پذیرنده نمونه',
  'transaction.demo.siteHost': 'example.com',

  // Pin Pad
  'pinPad.secureKeyboardTitle': 'صفحه کلید امن',
  'pinPad.clear': 'پاک کردن',

  // Timer
  'timer.title': 'زمان باقی‌مانده',
  'timer.expired': 'زمان به پایان رسید',
  'timer.transactionExpiredTitle': 'زمان انجام تراکنش به پایان رسید',
  'timer.transactionExpiredDescription': 'شما تا چند لحظه دیگر به سایت پذیرنده منتقل می‌شوید.',
  'timer.returnToMerchant': 'انتقال به سایت پذیرنده',

  // Errors
  'error.network': 'خطا در ارتباط با سرور',
  'error.unknown': 'خطای ناشناخته',
};
