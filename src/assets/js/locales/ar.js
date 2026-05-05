/**
 * Arabic Translations
 */
export default {
  // Common
  'common.cancel': 'إلغاء',
  'common.close': 'إغلاق',
  'common.help': 'مساعدة',
  'common.delete': 'حذف',
  'common.edit': 'تعديل',
  'common.clear': 'مسح',
  'common.required': 'هذا الحقل مطلوب',
  'common.processing': 'جاري المعالجة...',
  'common.loading': 'جاري التحميل...',
  'common.tryAgain': 'حاول مرة أخرى',
  'network.offline.title': 'اتصال الإنترنت غير متاح',
  'network.offline.description': 'بعد عودة الاتصال، ستستمر هذه الصفحة من نفس الحالة السابقة.',

  // Redirect
  'redirect.loadingTitle': 'جاري التحويل إلى موقع التاجر',

  // Help drawer (payment form)
  'helpDrawer.title': 'مساعدة',
  'helpDrawer.tablistAriaLabel': 'مواضيع المساعدة',
  'helpDrawer.tabSecurity': 'نصائح أمنية',
  'helpDrawer.tabOtp': 'دليل كلمة المرور لمرة واحدة',
  'helpDrawer.tabPayment': 'دليل الدفع',
  'helpDrawer.securityBody':
    'تُقدَّم بوابة الدفع الإلكتروني من سِپ عبر بروتوكول SSL الآمن، ويبدأ عنوانها بـ https://sep.shaparak.ir. قبل إدخال أي معلومات، قارن العنوان الظاهر في المتصفح بهذا العنوان، وفي حال وجود أي اختلاف لا تُكمل عملية الدفع.\n\n' +
    'لا تشارك كلمة مرور البطاقة أو CVV2 أو كلمة المرور لمرة واحدة مع أي شخص، بما في ذلك الدعم الهاتفي.\n\n' +
    'تجنب الدفع عبر الشبكات العامة، أو Wi-Fi المفتوح، أو الأجهزة المشتركة.\n\n' +
    'تحقق من اسم التاجر والمبلغ المعروض، ولا تتابع الدفع إلا بعد التأكد.\n\n' +
    'للحد من مخاطر تسرب المعلومات، استخدم لوحة المفاتيح الآمنة/الافتراضية قدر الإمكان.\n\n' +
    'بعد الانتهاء، خصوصاً على الأجهزة المشتركة، سجّل الخروج وأغلق المتصفح.\n\n' +
    'للمزيد من المعلومات، أو للإبلاغ عن المتاجر المشبوهة، أو للاستعلام عن حالة المتاجر الإلكترونية، اتصل على 021-84080 أو راسل epay@sep.ir.',
  'helpDrawer.otpBody':
    'كلمة المرور الديناميكية هي رمز لمرة واحدة يُستخدم بدلاً من كلمة مرور الإنترنت للبطاقة.\n\n' +
    'اطلب كلمة المرور الديناميكية فقط عندما تكون جاهزاً للتأكيد النهائي للدفع. أدخل الرمز قبل انتهاء صلاحيته؛ وإذا انتهت الصلاحية فاطلب رمزاً جديداً ولا تستخدم الرموز القديمة.\n\n' +
    'إذا استلمت عدة رموز، أدخل أحدث رمز صالح فقط، ولا تشاركه مع الآخرين.\n\n' +
    'الخطوة 1: فعّل كلمة المرور الديناميكية وفق تعليمات البنك المُصدِر للبطاقة.\n\n' +
    'الخطوة 2: استلم كلمة المرور الديناميكية بإحدى الطرق التي يحددها البنك المُصدِر:\n' +
    '1- تطبيق البنك، أو الإنترنت البنكي، أو الهاتف البنكي.\n' +
    '2- كود USSD الخاص بالبنك المُصدِر.\n' +
    '3- زر "الحصول على OTP" في بوابة الدفع.\n\n' +
    'الخطوة 3: بعد استلام الرمز، أدخله في حقل "كلمة المرور الثانية/OTP"، ثم أكمل بقية البيانات وأنهِ الدفع.',
  'helpDrawer.paymentBody':
    'لإتمام الدفع، أدخل المعلومات التالية بدقة:\n' +
    '1- رقم البطاقة: يتكوّن من 16 رقماً ومطبوع على البطاقة في أربع مجموعات (4 أرقام).\n' +
    '2- CVV2: رمز أمني من 3 أو 4 أرقام مطبوع على وجه البطاقة أو خلفها.\n' +
    '3- تاريخ الانتهاء: يتضمن شهر وسنة الانتهاء، ويظهر بجانب رقم البطاقة.\n' +
    '4- كلمة المرور الديناميكية: قد تُعرض أيضاً ككلمة المرور الثانية أو كلمة مرور الإنترنت، ويمكن الحصول عليها/تغييرها عبر البنك المُصدِر أو أجهزة الصراف التابعة له.\n' +
    '5- رمز الأمان (Captcha): رقم يظهر في صورة صفحة الدفع ويجب إدخاله في الحقل المخصص.\n\n' +
    'قبل إنهاء الدفع، تحقق من المبلغ واسم التاجر.\n\n' +
    'بعد نجاح الدفع، احتفظ بالإيصال حتى استلام السلعة أو الخدمة.\n\n' +
    'إذا لاحظت أي أمر غير طبيعي، أوقف الدفع وتابع عبر القنوات الرسمية للبنك أو التاجر.',

  // Header
  'header.title': 'بوابة الدفع',

  // Footer
  'footer.supportPrefix': 'مركز خدمة العملاء على مدار الساعة:',
  'footer.supportPhone': '021-84080',
  'footer.copyrightLineFirst': '© 2020 - 2025 (SEP) Saman Electronic Payment',
  'footer.copyrightLineSecondBefore': 'جميع الحقوق المادية والمعنوية محفوظة لصالح ',
  'footer.copyrightBrandLink': 'سامان للدفع الإلكتروني',
  'footer.copyrightLineSecondAfter': '.',
  'footer.copyrightBrandLinkAriaLabel':
    'موقع سامان للدفع الإلكتروني، sep.ir — يفتح في علامة تبويب جديدة',

  // Form
  'form.cardNumber': 'رقم البطاقة',
  'form.cardNumber.selectCard': 'اختر البطاقة',
  'form.cardNumber.placeholder': '●●●● ●●●● ●●●● ●●●●',
  'form.cardNumber.required': 'رقم البطاقة مطلوب',
  'form.cardNumber.invalid': 'رقم البطاقة غير صالح',
  'form.cardNumber.mustBe16Digits': 'يجب أن يتكون رقم البطاقة من 16 رقماً',
  'form.cvv2': 'CVV2',
  'form.cvv2.placeholder': '123',
  'form.cvv2.required': 'CVV2 مطلوب',
  'form.cvv2.hint': 'الرمز المكون من 3 أو 4 أرقام خلف البطاقة',
  'form.cvv2.invalidLength': 'يجب أن يكون CVV2 مكوّناً من {{count}} أرقام',
  'form.cvv2.invalidLengthRange': 'يجب أن يكون CVV2 مكوّناً من 3 أو 4 أرقام',
  'form.expiryDate': 'تاريخ الانتهاء',
  'form.expiryMonth': 'الشهر',
  'form.expiryYear': 'السنة',
  'form.expiryDate.required': 'تاريخ الانتهاء مطلوب',
  'form.expiryDate.invalidMonth': 'الشهر غير صالح',
  'form.expiryDate.expired': 'انتهت صلاحية البطاقة',
  'form.expiryDate.incomplete': 'أدخل شهرًا وسنة من رقمين لكل منهما',
  'form.securityCode': 'رمز الأمان',
  'form.otp': 'OTP',
  'form.otp.placeholder': '123456',
  'form.otp.required': 'OTP مطلوب',
  'form.otp.invalidLengthRange': 'يجب أن يتكون OTP من {{min}} إلى {{max}} أرقام',
  'form.otp.gift': 'OTP / كلمة مرور الإنترنت',
  'form.otp.gift.placeholder': 'OTP / كلمة مرور الإنترنت',
  'form.otp.gift.required': 'OTP / كلمة مرور الإنترنت مطلوب',
  'form.otp.gift.invalidLengthRange':
    'يجب أن يتكون OTP / كلمة مرور الإنترنت من {{min}} إلى {{max}} أرقام',
  'form.mobile': 'رقم الجوال',
  'form.mobile.placeholder': '09123456789',
  'form.mobile.required': 'رقم الجوال مطلوب',
  'form.mobile.invalid': 'رقم الجوال غير صالح',
  'form.email': 'البريد الإلكتروني',
  'form.email.placeholder': 'example@email.com',
  'form.email.required': 'البريد الإلكتروني مطلوب',
  'form.email.invalid': 'البريد الإلكتروني غير صالح',
  'form.saveCard': 'حفظ البطاقة في بوابة SEP',
  'form.pay': 'دفع',
  'form.pay.securePrefix': 'دفع آمن',
  'form.pay.secureWithAmount': 'دفع آمن ({{amount}} {{currency}})',
  'form.pay.disabled': 'يرجى إدخال جميع المعلومات',
  'form.pay.processing': 'جارٍ معالجة المعاملة...',
  'form.pay.success': 'تم الدفع بنجاح',
  'form.pay.errorCodeLabel': 'رمز الخطأ',
  'form.cancel': 'إلغاء',
  'form.title': 'أدخل بيانات بطاقتك',
  'form.captcha.placeholder': 'أدخل الرمز',
  'form.captcha.required': 'رمز الأمان مطلوب',
  'form.captcha.invalidLength': 'يجب أن يتكون رمز الأمان من {{count}} أرقام',
  'form.validation.error': 'يرجى ملء جميع الحقول بشكل صحيح',
  'form.showCards': 'عرض البطاقات',
  'form.virtualPinPad': 'لوحة PIN الافتراضية',
  'form.reloadCaptcha': 'إعادة تحميل رمز التحقق',
  'form.getOtp': 'الحصول على OTP',
  'form.getOtpSuccess': 'تم إرسال OTP بنجاح',
  'form.getOtpExhausted': 'تم استخدام الحد الأقصى لطلبات OTP لهذه البطاقة.',
  'form.getOtpCountdownAria': 'انتظر {{time}} قبل طلب OTP مرة أخرى',
  'form.captchaImageAlt': 'رمز الأمان',
  'form.captchaAudio': 'تشغيل صوت رمز التحقق',
  'form.audioPlay': 'تشغيل الصوت',
  'cancelConfirm.title': 'إلغاء الدفع؟',
  'cancelConfirm.description': 'إذا غادرت الآن، قد لا يكتمل الدفع. اختر خياراً للتأكيد.',
  'cancelConfirm.imageAlt': 'توضيح إلغاء الدفع',
  'cancelConfirm.continuePay': 'متابعة الدفع',
  'cancelConfirm.confirmLeave': 'إلغاء الدفع',
  'form.giftCardNotice':
    'بعض بطاقات الهدية المصدرة من البنوك لا تحتاج إلى رمز لمرة واحدة؛ في هذه الحالة استخدم كلمة مرور الإنترنت لبطاقة الهدية نفسها.',
  'form.panProductRestriction.inlineNotice':
    'لدفع «{{productTitle}}» يُسمح فقط بالبطاقات المدرجة في قائمة السماح لهذه المعاملة، ولا يمكن إكمال الدفع ببطاقات أخرى.',
  'form.panProductRestriction.invalidCard':
    'هذه البطاقة غير مسموح بها لدفع «{{productTitle}}» في هذه المعاملة. اختر بطاقة أخرى أو أدخل رقم بطاقة يطابق القاعدة أعلاه.',
  'form.panProductRestriction.fallbackProduct': 'طريقة الدفع هذه',
  'form.showReceiptToggle': 'البريد أو الجوال لاستلام الإيصال (اختياري)',

  // Payment init (SSR session)
  'paymentInit.error.title': 'تعذر بدء الدفع',
  'paymentInit.error.description':
    'بيانات جلسة الدفع غير مكتملة أو غير صالحة. يرجى فتح البوابة عبر الرابط الصحيح أو المحاولة لاحقاً.',
  'transactionInit.error.title': 'تعذر تحميل معلومات المعاملة',
  'transactionInit.error.description': 'خدمة المعاملات غير متاحة حالياً. يرجى المحاولة مرة أخرى.',

  // Accessibility
  'accessibility.selectLanguage': 'اختيار اللغة',
  'accessibility.partnerLogo': 'شعار الشريك',
  'accessibility.openSettings': 'الإعدادات',

  'settings.theme': 'عرض البوابة',
  'settings.theme.light': 'وضع النهار',
  'settings.theme.dark': 'وضع الليل',
  'settings.theme.system': 'مطابق لإعداد النظام',

  // Card List
  'cardList.addNew': 'إضافة بطاقة جديدة',
  'cardList.manage': 'إدارة البطاقات',
  'cardList.sheetTitle': 'اختيار البطاقة البنكية',
  'cardList.sheetSubtitle': 'لقد استخدمت مؤخراً البطاقات البنكية التالية',
  'cardList.empty': 'لا توجد بطاقة محفوظة للعرض',
  'cardList.removeNotAllowed': 'لا يمكن إزالة هذه البطاقة.',
  'cardList.removeSuccess': 'تمت إزالة البطاقة بنجاح.',

  // Receipt
  'receipt.success': 'تم الخصم بنجاح',
  'receipt.failed': 'فشل الخصم',
  'receipt.merchant': 'التاجر',
  'receipt.share': 'مشاركة',
  'receipt.save': 'حفظ في المعرض',
  'receipt.paymentSuccessDesc': 'تم خصم المبلغ من البطاقة بنجاح.',
  'receipt.paymentFailedDesc': 'تعذر خصم المبلغ من البطاقة.',
  'receipt.copied': 'تم نسخ نص الإيصال',
  'receipt.saveError': 'خطأ في حفظ الإيصال',
  'receipt.shareText': 'إيصال المعاملة',
  'receipt.download': 'تحميل الإيصال',
  'receipt.status': 'حالة المعاملة',
  'receipt.statusSuccessDetail': 'تم خصم المبلغ من البطاقة بنجاح',
  'receipt.statusFailedDetail': 'تعذر خصم المبلغ من البطاقة',
  'receipt.plain.amount': 'المبلغ',
  'receipt.plain.merchant': 'التاجر',
  'receipt.plain.transactionId': 'رقم المعاملة',
  'receipt.plain.date': 'التاريخ',
  'receipt.plain.card': 'رقم البطاقة',
  'receipt.sectionMerchant': 'بيانات التاجر',
  'receipt.sectionTransaction': 'بيانات المعاملة',
  'receipt.receiptTitle': 'إيصال',
  'receipt.sectionInstallmentInfo': 'بيانات معاملة الأقساط',
  'receipt.sectionBillInfo': 'بيانات الفواتير المدفوعة',
  'receipt.installmentCount': 'عدد الأقساط',
  'receipt.installmentAmount': 'مبلغ القسط',
  'receipt.installmentNumber': 'رقم القسط',
  'receipt.billInfoId': 'معرّف الفاتورة',
  'receipt.billId': 'رقم الفاتورة',
  'receipt.payId': 'معرّف الدفع',
  'receipt.completeAndReturn': 'إنهاء العملية والعودة إلى موقع التاجر',
  'receipt.autoReturnPrefix': 'العودة التلقائية خلال',
  'receipt.traceCode': 'رمز التتبع',
  'receipt.digitalReceipt': 'الإيصال الرقمي',
  'receipt.transactionType': 'نوع المعاملة',
  'receipt.transactionTime': 'وقت المعاملة',
  'receipt.transactionAmount': 'مبلغ المعاملة',
  'receipt.discountAmount': 'مبلغ الخصم',
  'receipt.deductedAmount': 'المبلغ المخصوم من البطاقة',
  'receipt.issuerBank': 'البنك المُصدر للبطاقة',
  'receipt.merchantNumber': 'رقم التاجر',
  'receipt.terminalNumber': 'رقم الطرفية',
  'receipt.gatewayCode': 'رمز البوابة',
  'receipt.paymentFacilitator': 'مُيسّر الدفع',
  'receipt.merchantSiteAddress': 'عنوان موقع التاجر',
  'receipt.noticePolicy':
    'إذا لم يقم التاجر بإبلاغ شركة SEP بتأكيد تسليم السلع أو الخدمات خلال 30 دقيقة، فسيتم إعادة المبلغ المخصوم إلى حسابك خلال 72 ساعة.',
  'receipt.finalizationNotice':
    'هذا الإيصال غير نهائي، ويصبح نهائياً بعد تأكيد تسليم السلعة أو الخدمة من قبل التاجر.',
  'receipt.rrn': 'الرقم المرجعي (RRN)',
  'receipt.demo.transactionType': 'شراء',

  // Transaction
  'transaction.merchant': 'التاجر',
  'transaction.amount': 'المبلغ',
  'transaction.terminal': 'رقم التاجر / الطرفية',
  'transaction.site': 'موقع التاجر',
  'transaction.paymentFacilitatorName': 'اسم مُيسّر الدفع',
  'transaction.transactionType': 'نوع المعاملة',
  'transaction.description': 'الوصف',
  'bill.type.water': 'فاتورة المياه',
  'bill.type.electricity': 'فاتورة الكهرباء',
  'bill.type.gas': 'فاتورة الغاز',
  'bill.type.phone': 'فاتورة الهاتف',
  'bill.type.mobile': 'فاتورة الجوال',
  'bill.type.municipality': 'فاتورة البلدية',
  'bill.type.tax': 'فاتورة الضريبة',
  'bill.type.traffic': 'مخالفة مرور',
  'bill.type.unknown': 'نوع فاتورة غير معروف',
  'bill.status.paid': 'تم الدفع',
  'bill.status.ready': 'جاهزة للدفع',
  'bill.action.viewReceipt': 'عرض الإيصال',
  'bill.selector.title': 'اختيار الفاتورة',
  'bill.selector.subtitle': 'اختر واحدة من الفواتير التالية',
  'bill.selector.required': 'اختيار الفاتورة مطلوب',
  'bill.hint.payableCount': 'جاهزة للدفع: {{count}}',
  'bill.hint.paidCount': 'مدفوعة: {{count}}',
  'bill.flow.skipRemaining': 'تخطي دفع بقية الفواتير',
  'bill.flow.completeTitle': 'اكتملت عملية دفع الفواتير',
  'bill.flow.completeDescription': 'يمكنك العودة إلى موقع التاجر الآن أو انتظار العودة التلقائية.',
  'bill.flow.summarySectionTitle': 'ملخص دفع الفواتير',
  'bill.flow.summaryPaid': 'عدد الفواتير المدفوعة:',
  'bill.flow.summaryUnpaid': 'عدد الفواتير غير المدفوعة/الفاشلة:',
  'bill.flow.summaryPaidAmount': 'إجمالي المبالغ المدفوعة:',
  'bill.flow.noticeSettlement':
    'تسوية الفواتير تكون فورية غالبا، لكن قد تتاخر احيانا حتى 48 ساعة بسبب بنية شركة الخدمات. اذا نجحت عملية الدفع فلا داعي للقلق؛ ستتم تسوية الفاتورة.',
  'bill.flow.completeAndReturn': 'إنهاء دفع الفواتير والعودة إلى موقع التاجر',
  'bill.receipt.modalTitle': 'إيصال دفع الفاتورة',
  'bill.receipt.unavailable': 'لا تتوفر بيانات إيصال لهذه الفاتورة.',
  'bill.flow.waitForOtpCooldownAfterSuccess':
    'تم دفع هذه الفاتورة بنجاح. لدفع الفاتورة التالية، يرجى الانتظار حتى انتهاء مهلة دقيقتين لرمز OTP، ثم اختيار الفاتورة التالية ودفعها.',
  'transaction.descriptionExpand': 'عرض الوصف كاملاً',
  'transaction.descriptionCollapse': 'عرض أقل',
  'transaction.type.balance': 'استعلام الرصيد',
  'transaction.type.purchase': 'شراء',
  'transaction.type.thirdParty': 'الطرف الثالث',
  'transaction.type.gamPapers': 'أوراق GAM',
  'transaction.type.charge': 'شراء شحن PIN',
  'transaction.type.bill': 'دفع فاتورة',
  'transaction.type.specialBill': 'دفع فاتورة خاصة',
  'transaction.type.billManualVerify': 'فاتورة (تحقق يدوي)',
  'transaction.type.billThirdParty': 'فاتورة خدمية (تسوية طرف ثالث)',
  'transaction.type.payment': 'دفع UD',
  'transaction.type.groupCharge': 'شحن جماعي PIN',
  'transaction.type.transfer': 'تحويل',
  'transaction.type.topUp': 'تعبئة وباقة',
  'transaction.type.government': 'معاملة حكومية',
  'transaction.type.chargePayment': 'معاملة شحن',
  'transaction.type.sepSegmentPayment': 'معاملة بطاقة مؤسسية',
  'transaction.type.unknown': 'غير معروف',
  'transaction.showMore': 'عرض المزيد',
  'transaction.showLess': 'عرض أقل',
  'transaction.rial': 'ريال',
  'transaction.amountInWordsPrefix': 'ما يعادل',
  'transaction.toman': 'تومان',
  'transaction.demo.merchantName': 'متجر تجريبي',
  'transaction.demo.siteHost': 'example.com',

  // Pin Pad
  'pinPad.secureKeyboardTitle': 'لوحة مفاتيح آمنة',
  'pinPad.clear': 'مسح',

  // Timer
  'timer.title': 'الوقت المتبقي',
  'timer.expired': 'انتهى الوقت',
  'timer.transactionExpiredTitle': 'انتهى وقت تنفيذ المعاملة',
  'timer.transactionExpiredDescription': 'سيتم تحويلك إلى موقع التاجر خلال دقيقة واحدة.',
  'timer.returnToMerchant': 'التحويل إلى موقع التاجر',

  // Errors
  'error.network': 'خطأ في الشبكة',
  'error.unknown': 'خطأ غير معروف',
};
