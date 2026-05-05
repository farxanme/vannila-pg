/**
 * Turkish Translations
 */
export default {
  // Common
  'common.cancel': 'İptal',
  'common.close': 'Kapat',
  'common.help': 'Yardım',
  'common.delete': 'Sil',
  'common.edit': 'Düzenle',
  'common.clear': 'Temizle',
  'common.required': 'Bu alan zorunludur',
  'common.processing': 'İşleniyor...',
  'common.loading': 'Yükleniyor...',
  'common.tryAgain': 'Tekrar dene',
  'network.offline.title': 'Internet baglantisi kesildi',
  'network.offline.description': 'Baglanti geri geldiginde bu sayfa kaldiginiz yerden devam eder.',

  // Redirect
  'redirect.loadingTitle': 'Satici sitesine yonlendiriliyor',

  // Help drawer (payment form)
  'helpDrawer.title': 'Yardim',
  'helpDrawer.tablistAriaLabel': 'Yardim konulari',
  'helpDrawer.tabSecurity': 'Guvenlik ipuclari',
  'helpDrawer.tabOtp': 'Dinamik sifre (OTP)',
  'helpDrawer.tabPayment': 'Odeme rehberi',
  'helpDrawer.securityBody':
    'SEP odeme gecidi guvenli SSL protokolu ile sunulur ve adresi https://sep.shaparak.ir ile baslar. Herhangi bir bilgi girmeden once tarayicidaki adresi bu adresle karsilastirin. Herhangi bir uyumsuzlukta odemeye devam etmeyin.\n\n' +
    'Kart sifresi, CVV2 ve tek kullanimlik sifreyi kimseyle paylasmayin; telefon destegi dahil.\n\n' +
    'Genel aglarda, acik Wi-Fi ortamlarda ve paylasilan cihazlarda odeme yapmaktan kacinin.\n\n' +
    'Satici adini ve odeme tutarini kontrol edin; sadece emin oldugunuzda devam edin.\n\n' +
    'Bilgi sizmasi riskini azaltmak icin mumkun oldugunca guvenli/sanal klavye kullanin.\n\n' +
    'Isiniz bittiginde, ozellikle paylasilan bilgisayarlarda, hesaptan cikis yapin ve tarayiciyi kapatin.\n\n' +
    'Daha fazla bilgi, supheli magazalari bildirme veya internet satici durumu icin 021-84080 numarasini arayin ya da epay@sep.ir adresine e-posta gonderin.',
  'helpDrawer.otpBody':
    'Dinamik sifre, kart internet sifresi yerine kullanilan tek kullanimlik bir koddur.\n\n' +
    'Dinamik sifreyi yalnizca odemeyi son kez onaylamaya hazir oldugunuzda isteyin. Kodu suresi dolmadan girin; sure dolarsa yeni kod alin ve eski kodlari kullanmayin.\n\n' +
    'Birden fazla kod geldiyse sadece en son gecerli kodu girin ve baskalariyla paylasmayin.\n\n' +
    'Adim 1: Kartinizi veren bankanin talimatina gore dinamik sifreyi aktif edin.\n\n' +
    'Adim 2: Dinamik sifreyi bankanin bildirdigi yontemlerden biriyle alin:\n' +
    '1- Banka uygulamasi, internet bankaciligi veya mobil bankacilik.\n' +
    '2- Bankanizin USSD kodu.\n' +
    '3- Odeme gecidindeki "OTP Al" dugmesi.\n\n' +
    'Adim 3: Kodu aldiktan sonra "Ikinci Sifre/OTP" alanina girin, sonra diger bilgileri tamamlayip odemeyi bitirin.',
  'helpDrawer.paymentBody':
    'Odeme icin asagidaki bilgileri dikkatle girin:\n' +
    '1- Kart numarasi: Kart uzerinde 4x4 formatinda yazilan 16 hanedir.\n' +
    '2- CVV2: Kartin on veya arka yuzunde bulunan 3 ya da 4 haneli guvenlik kodudur.\n' +
    '3- Son kullanma tarihi: Kart numarasinin yanindaki ay ve yil bilgisidir.\n' +
    '4- Dinamik sifre: Ikinci sifre veya internet sifresi olarak da gorunebilir; bankadan veya bankanin ATM' +
    'lerinden alinip degistirilebilir.\n' +
    '5- Guvenlik kodu (captcha): Odeme sayfasindaki gorselde yer alan sayisal koddur ve ilgili alana girilmelidir.\n\n' +
    'Odemeyi tamamlamadan once tutari ve satici adini kontrol edin.\n\n' +
    'Odeme basarili olduktan sonra, urun veya hizmet teslim edilene kadar dekontu saklayin.\n\n' +
    'Herhangi bir anormallik gorurseniz odemeyi durdurun ve banka veya satici ile resmi kanallardan iletisime gecin.',

  // Header
  'header.title': 'Ödeme Ağ Geçidi',

  // Footer
  'footer.supportPrefix': '7/24 musteri iletisim merkezi:',
  'footer.supportPhone': '021-84080',
  'footer.copyrightLineFirst': '© 2020 - 2025 (SEP) Saman Electronic Payment',
  'footer.copyrightLineSecondBefore': 'Tum maddi ve manevi haklar ',
  'footer.copyrightBrandLink': 'Saman Electronic Payment',
  'footer.copyrightLineSecondAfter': ' icin saklidir.',
  'footer.copyrightBrandLinkAriaLabel':
    'Saman Electronic Payment web sitesi, sep.ir — yeni sekmede acilir',

  // Form
  'form.cardNumber': 'Kart Numarası',
  'form.cardNumber.selectCard': 'Kart seçin',
  'form.cardNumber.placeholder': '●●●● ●●●● ●●●● ●●●●',
  'form.cardNumber.required': 'Kart numarası gereklidir',
  'form.cardNumber.invalid': 'Geçersiz kart numarası',
  'form.cardNumber.mustBe16Digits': 'Kart numarası 16 haneli olmalıdır',
  'form.cvv2': 'CVV2',
  'form.cvv2.placeholder': '123',
  'form.cvv2.required': 'CVV2 gereklidir',
  'form.cvv2.hint': 'Kartın arkasındaki 3 veya 4 haneli kod',
  'form.cvv2.invalidLength': 'CVV2 {{count}} haneli olmalıdır',
  'form.cvv2.invalidLengthRange': 'CVV2 3 veya 4 haneli olmalıdır',
  'form.expiryDate': 'Son Kullanma Tarihi',
  'form.expiryMonth': 'Ay',
  'form.expiryYear': 'Yıl',
  'form.expiryDate.required': 'Son kullanma tarihi gereklidir',
  'form.expiryDate.invalidMonth': 'Geçersiz ay',
  'form.expiryDate.expired': 'Kartın süresi dolmuş',
  'form.expiryDate.incomplete': 'Ay ve yılı ikişer hane girin',
  'form.securityCode': 'Güvenlik Kodu',
  'form.otp': 'OTP',
  'form.otp.placeholder': '123456',
  'form.otp.required': 'OTP gereklidir',
  'form.otp.invalidLengthRange': 'OTP {{min}} ile {{max}} hane arasında olmalıdır',
  'form.otp.gift': 'OTP / Internet Sifresi',
  'form.otp.gift.placeholder': 'OTP / Internet Sifresi',
  'form.otp.gift.required': 'OTP / Internet Sifresi gereklidir',
  'form.otp.gift.invalidLengthRange':
    'OTP / Internet Sifresi {{min}} ile {{max}} hane arasında olmalıdır',
  'form.mobile': 'Cep Telefonu',
  'form.mobile.placeholder': '09123456789',
  'form.mobile.required': 'Cep telefonu gereklidir',
  'form.mobile.invalid': 'Geçersiz cep telefonu',
  'form.email': 'E-posta',
  'form.email.placeholder': 'example@email.com',
  'form.email.required': 'E-posta gereklidir',
  'form.email.invalid': 'Geçersiz e-posta',
  'form.saveCard': 'Kartı SEP ağ geçidinde kaydet',
  'form.pay': 'Öde',
  'form.pay.securePrefix': 'Güvenli ödeme',
  'form.pay.secureWithAmount': 'Güvenli ödeme ({{amount}} {{currency}})',
  'form.pay.disabled': 'Lütfen tüm bilgileri doldurun',
  'form.pay.processing': 'İşlem işleniyor...',
  'form.pay.success': 'Ödeme başarıyla tamamlandı',
  'form.pay.errorCodeLabel': 'Hata kodu',
  'form.cancel': 'İptal',
  'form.title': 'Kart bilgilerinizi girin',
  'form.captcha.placeholder': 'Kodu girin',
  'form.captcha.required': 'Guvenlik kodu gereklidir',
  'form.captcha.invalidLength': 'Guvenlik kodu {{count}} haneli olmalidir',
  'form.validation.error': 'Lütfen tüm alanları doğru şekilde doldurun',
  'form.showCards': 'Kartları göster',
  'form.virtualPinPad': 'Sanal PIN pad',
  'form.reloadCaptcha': 'Doğrulama kodunu yenile',
  'form.getOtp': 'OTP al',
  'form.getOtpSuccess': 'OTP başarıyla gönderildi',
  'form.getOtpExhausted': 'Bu kart için maksimum OTP isteği kullanıldı.',
  'form.getOtpCountdownAria': 'OTP için tekrar istekte bulunmadan önce {{time}} bekleyin',
  'form.captchaImageAlt': 'Güvenlik kodu',
  'form.captchaAudio': 'Doğrulama kodu sesini çal',
  'form.audioPlay': 'Sesi oynat',
  'cancelConfirm.title': 'Ödemeyi iptal etmek mi?',
  'cancelConfirm.description':
    'Şimdi ayrılırsanız ödemeniz tamamlanmayabilir. Emin olmak için bir seçenek seçin.',
  'cancelConfirm.imageAlt': 'Ödemeden çıkış görseli',
  'cancelConfirm.continuePay': 'Ödemeye devam et',
  'cancelConfirm.confirmLeave': 'Ödemeyi iptal et',
  'form.giftCardNotice':
    'Bazı banka hediye kartlarında tek kullanımlık şifre (OTP) gerekmez; bu durumda hediye kartınızın internet şifresini kullanabilirsiniz.',
  'form.panProductRestriction.inlineNotice':
    '“{{productTitle}}” ödemelerinde yalnızca bu işlemin izin listesindeki kartlar kullanılabilir. Diğer kartlarla bu ödeme tamamlanamaz.',
  'form.panProductRestriction.invalidCard':
    'Bu kart bu işlemde “{{productTitle}}” için izinli değil. Başka bir kayıtlı kart seçin veya yukarıdaki kurala uyan bir kart numarası girin.',
  'form.panProductRestriction.fallbackProduct': 'bu ödeme türü',
  'form.showReceiptToggle': 'Makbuz için e-posta veya cep (isteğe bağlı)',

  // Payment init (SSR session)
  'paymentInit.error.title': 'Ödeme başlatılamadı',
  'paymentInit.error.description':
    'Ödeme oturum verileri eksik veya geçersiz. Lütfen geçit için doğru bağlantıyı kullanın veya daha sonra tekrar deneyin.',
  'transactionInit.error.title': 'Islem bilgileri yuklenemedi',
  'transactionInit.error.description':
    'Islem servisine su anda ulasilamiyor. Lutfen tekrar deneyin.',

  // Accessibility
  'accessibility.selectLanguage': 'Dil seçin',
  'accessibility.partnerLogo': 'İş ortağı logosu',
  'accessibility.openSettings': 'Ayarlar',

  'settings.theme': 'Gecit gorunumu',
  'settings.theme.light': 'Gunduz modu',
  'settings.theme.dark': 'Gece modu',
  'settings.theme.system': 'Isletim sistemi ayarina gore',

  // Card List
  'cardList.addNew': 'Yeni Kart Ekle',
  'cardList.manage': 'Kartları Yönet',
  'cardList.sheetTitle': 'Banka karti sec',
  'cardList.sheetSubtitle': 'Son zamanlarda asagidaki banka kartlarini kullandiniz',
  'cardList.empty': 'Gösterilecek kayıtlı kart yok',
  'cardList.removeNotAllowed': 'Bu kart kaldırılamaz.',
  'cardList.removeSuccess': 'Kart başarıyla kaldırıldı.',

  // Receipt
  'receipt.success': 'Bakiye Düşümü Başarılı',
  'receipt.failed': 'Bakiye Düşümü Başarısız',
  'receipt.merchant': 'Uye Isyeri',
  'receipt.share': 'Paylaş',
  'receipt.save': 'Galeriye Kaydet',
  'receipt.paymentSuccessDesc': 'Karttan tutar başarıyla düşüldü.',
  'receipt.paymentFailedDesc': 'Karttan tutar düşürülemedi.',
  'receipt.copied': 'Fiş metni kopyalandı',
  'receipt.saveError': 'Fiş kaydedilirken hata',
  'receipt.shareText': 'İşlem fişi',
  'receipt.download': 'Fişi indir',
  'receipt.status': 'İşlem durumu',
  'receipt.statusSuccessDetail': 'Karttan tutar başarıyla düşüldü',
  'receipt.statusFailedDetail': 'Karttan tutar düşürülemedi',
  'receipt.plain.amount': 'Tutar:',
  'receipt.plain.merchant': 'Uye Isyeri',
  'receipt.plain.transactionId': 'İşlem numarası',
  'receipt.plain.date': 'Tarih',
  'receipt.plain.card': 'Kart numarası',
  'receipt.sectionMerchant': 'İşyeri bilgileri',
  'receipt.sectionTransaction': 'İşlem bilgileri',
  'receipt.receiptTitle': 'Makbuz',
  'receipt.sectionInstallmentInfo': 'Taksitli işlem bilgileri',
  'receipt.sectionBillInfo': 'Ödenen fatura bilgileri',
  'receipt.installmentCount': 'Taksit sayısı',
  'receipt.installmentAmount': 'Taksit tutarı',
  'receipt.installmentNumber': 'Taksit numarası',
  'receipt.billInfoId': 'Fatura bilgi ID',
  'receipt.billId': 'Fatura numarası',
  'receipt.payId': 'Ödeme ID',
  'receipt.completeAndReturn': 'Sureci bitir ve uye isyeri sitesine don',
  'receipt.autoReturnPrefix': 'Otomatik dönüş',
  'receipt.traceCode': 'Takip kodu',
  'receipt.digitalReceipt': 'Dijital makbuz',
  'receipt.transactionType': 'İşlem türü',
  'receipt.transactionTime': 'İşlem zamanı',
  'receipt.transactionAmount': 'İşlem tutarı',
  'receipt.discountAmount': 'İndirim tutarı',
  'receipt.deductedAmount': 'Karttan çekilen tutar',
  'receipt.issuerBank': 'Kartı çıkaran banka',
  'receipt.merchantNumber': 'Uye Isyeri numarasi',
  'receipt.terminalNumber': 'Terminal numarası',
  'receipt.gatewayCode': 'Geçit kodu',
  'receipt.paymentFacilitator': 'Ödeme sağlayıcısı',
  'receipt.merchantSiteAddress': 'Uye Isyeri site adresi',
  'receipt.noticePolicy':
    "Uye Isyeri, mal veya hizmet teslim onayini 30 dakika icinde SEP'e bildirmezse, cekilen tutar 72 saat icinde hesabiniza iade edilir.",
  'receipt.finalizationNotice':
    'Bu makbuz nihai degildir; mal veya hizmet teslimi uye isyeri tarafindan onaylandiginda nihai olur.',
  'receipt.rrn': 'RRN',
  'receipt.demo.transactionType': 'Satın alma',

  // Transaction
  'transaction.merchant': 'Uye Isyeri',
  'transaction.amount': 'Tutar',
  'transaction.terminal': 'Uye Isyeri / Terminal Numarasi',
  'transaction.site': 'Uye Isyeri Sitesi',
  'transaction.paymentFacilitatorName': 'Odeme Saglayici Adi',
  'transaction.transactionType': 'Islem Turu',
  'transaction.description': 'Açıklama',
  'bill.type.water': 'Su Faturasi',
  'bill.type.electricity': 'Elektrik Faturasi',
  'bill.type.gas': 'Gaz Faturasi',
  'bill.type.phone': 'Telefon Faturasi',
  'bill.type.mobile': 'Mobil Hat Faturasi',
  'bill.type.municipality': 'Belediye Faturasi',
  'bill.type.tax': 'Vergi Faturasi',
  'bill.type.traffic': 'Trafik Cezasi',
  'bill.type.unknown': 'Bilinmeyen Fatura Turu',
  'bill.status.paid': 'Odendi',
  'bill.status.ready': 'Odeme icin hazir',
  'bill.action.viewReceipt': 'Dekontu gor',
  'bill.selector.title': 'Fatura sec',
  'bill.selector.subtitle': 'Asagidaki faturalardan birini secin',
  'bill.selector.required': 'Fatura secimi zorunludur',
  'bill.hint.payableCount': 'Odeme icin hazir: {{count}}',
  'bill.hint.paidCount': 'Odendi: {{count}}',
  'bill.flow.skipRemaining': 'Kalan faturalari atla',
  'bill.flow.completeTitle': 'Fatura odeme sureci tamamlandi',
  'bill.flow.completeDescription':
    'Simdi uye isyeri sitesine donebilir veya otomatik donusu bekleyebilirsiniz.',
  'bill.flow.summarySectionTitle': 'Fatura odeme ozeti',
  'bill.flow.summaryPaid': 'Odenen fatura sayisi:',
  'bill.flow.summaryUnpaid': 'Odenmeyen/basarisiz fatura sayisi:',
  'bill.flow.summaryPaidAmount': 'Toplam odenen tutar:',
  'bill.flow.noticeSettlement':
    'Fatura tahsilati genellikle anliktir; ancak hizmet saglayici altyapisi nedeniyle bazi durumlarda 48 saate kadar gecikebilir. Odemeniz basariliysa endise etmeyin, faturaniz yine de tahsil edilir.',
  'bill.flow.completeAndReturn': 'Fatura surecini tamamla ve uye isyeri sitesine don',
  'bill.receipt.modalTitle': 'Fatura odeme makbuzu',
  'bill.receipt.unavailable': 'Bu fatura icin makbuz verisi bulunamadi.',
  'bill.flow.waitForOtpCooldownAfterSuccess':
    'Bu fatura basariyla odendi. Sonraki faturayi odemek icin lutfen 2 dakikalik OTP bekleme suresi bitene kadar bekleyin, sonra sonraki faturayi secip odeyin.',
  'transaction.descriptionExpand': 'Tam açıklamayı göster',
  'transaction.descriptionCollapse': 'Daha az göster',
  'transaction.type.balance': 'Bakiye Sorgulama',
  'transaction.type.purchase': 'Satin Alma',
  'transaction.type.thirdParty': 'Ucuncu Taraf',
  'transaction.type.gamPapers': 'GAM Evraklari',
  'transaction.type.charge': 'PIN Yukleme Satin Alma',
  'transaction.type.bill': 'Fatura Odeme',
  'transaction.type.specialBill': 'Ozel Fatura Odeme',
  'transaction.type.billManualVerify': 'Fatura (Manuel Dogrulama)',
  'transaction.type.billThirdParty': 'Hizmet Faturasi (Ucuncu Taraf Tahsilat)',
  'transaction.type.payment': 'UD Odeme',
  'transaction.type.groupCharge': 'Toplu PIN Yukleme',
  'transaction.type.transfer': 'Transfer',
  'transaction.type.topUp': 'Top-Up ve Paket',
  'transaction.type.government': 'Devlet Islemi',
  'transaction.type.chargePayment': 'Yukleme Islemi',
  'transaction.type.sepSegmentPayment': 'Kurumsal Kart Islemi',
  'transaction.type.unknown': 'Bilinmiyor',
  'transaction.showMore': 'Daha Fazla Göster',
  'transaction.showLess': 'Daha Az Göster',
  'transaction.rial': 'Riyal',
  'transaction.amountInWordsPrefix': 'Esdegeri',
  'transaction.toman': 'Toman',
  'transaction.demo.merchantName': 'Örnek mağaza',
  'transaction.demo.siteHost': 'example.com',

  // Pin Pad
  'pinPad.secureKeyboardTitle': 'Güvenli klavye',
  'pinPad.clear': 'Temizle',

  // Timer
  'timer.title': 'Kalan Süre',
  'timer.expired': 'Süre doldu',
  'timer.transactionExpiredTitle': 'Islem suresi doldu',
  'timer.transactionExpiredDescription':
    'Bir dakika icinde uye isyeri sitesine yonlendirileceksiniz.',
  'timer.returnToMerchant': 'Uye Isyeri sitesine git',

  // Errors
  'error.network': 'Ağ hatası',
  'error.unknown': 'Bilinmeyen hata',
};
