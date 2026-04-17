/**
 * Turkish Translations
 */
export default {
  // Common
  'common.submit': 'Gönder',
  'common.cancel': 'İptal',
  'common.close': 'Kapat',
  'common.confirm': 'Onayla',
  'common.help': 'Yardım',
  'common.delete': 'Sil',
  'common.edit': 'Düzenle',
  'common.save': 'Kaydet',
  'common.loading': 'Yükleniyor...',
  'common.error': 'Hata',
  'common.success': 'Başarılı',
  'common.clear': 'Temizle',
  'common.required': 'Bu alan zorunludur',
  'common.processing': 'İşleniyor...',

  // Redirect
  'redirect.loading': 'Yönlendiriliyor...',

  // Header
  'header.title': 'Ödeme Ağ Geçidi',

  // Footer
  'footer.supportPrefix': '7/24 musteri iletisim merkezi:',
  'footer.supportPhone': '021-84080',
  'footer.copyright':
    '© 2020 - 2025 (SEP) Saman Electronic Payment\nTum maddi ve manevi haklar Saman Electronic Payment icin saklidir.',

  // Form
  'form.cardNumber': 'Kart Numarası',
  'form.cardNumber.selectCard': 'Kart seçin',
  'form.cardNumber.placeholder': '1234 5678 9012 3456',
  'form.cardNumber.required': 'Kart numarası gereklidir',
  'form.cardNumber.invalid': 'Geçersiz kart numarası',
  'form.cvv2': 'CVV2',
  'form.cvv2.placeholder': '123',
  'form.cvv2.required': 'CVV2 gereklidir',
  'form.cvv2.hint': 'Kartın arkasındaki 3 veya 4 haneli kod',
  'form.cvv2.invalidLength': 'CVV2 {{count}} haneli olmalıdır',
  'form.expiryDate': 'Son Kullanma Tarihi',
  'form.expiryMonth': 'Ay',
  'form.expiryYear': 'Yıl',
  'form.expiryDate.required': 'Son kullanma tarihi gereklidir',
  'form.expiryDate.invalid': 'Geçersiz son kullanma tarihi',
  'form.securityCode': 'Güvenlik Kodu',
  'form.securityCode.required': 'Güvenlik kodu gereklidir',
  'form.otp': 'OTP',
  'form.otp.placeholder': '123456',
  'form.otp.required': 'OTP gereklidir',
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
  'form.pay.disabled': 'Lütfen tüm bilgileri doldurun',
  'form.pay.processing': 'Banka ile bağlantı kuruluyor...',
  'form.pay.success': 'Ödeme başarıyla tamamlandı',
  'form.captchaAudioUnavailable': 'Bu sürümde sesli captcha yok',
  'form.cancel': 'İptal',
  'form.showReceipt': 'Fişi Göster',
  'form.title': 'Ödeme Bilgileri',
  'form.submit': 'Gönder',
  'form.captcha': 'Güvenlik Kodu',
  'form.captcha.placeholder': 'Kodu girin',
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
  'form.expiryPlaceholder': 'AA/YY',
  'form.giftCardNotice': 'Bu bir hediye kartıdır',
  'form.showReceiptToggle': 'Makbuz için e-posta veya cep (isteğe bağlı)',

  // Accessibility
  'accessibility.selectLanguage': 'Dil seçin',
  'accessibility.partnerLogo': 'İş ortağı logosu',
  'accessibility.openSettings': 'Ayarlar',

  'settings.theme': 'Tema',
  'settings.theme.light': 'Açık',
  'settings.theme.dark': 'Koyu',
  'settings.theme.system': 'Sistem (günün saatine göre)',

  // Card List
  'cardList.addNew': 'Yeni Kart Ekle',
  'cardList.manage': 'Kartları Yönet',
  'cardList.pin': 'Sabitle',
  'cardList.unpin': 'Sabitlemeyi Kaldır',
  'cardList.delete': 'Sil',
  'cardList.deleteConfirm': 'Bu kartı silmek istediğinizden emin misiniz?',
  'cardList.empty': 'Kayıtlı kart yok',

  // Receipt
  'receipt.success': 'İşlem Başarılı',
  'receipt.failed': 'İşlem Başarısız',
  'receipt.pending': 'İşleniyor',
  'receipt.amount': 'Tutar',
  'receipt.transactionType': 'İşlem Türü',
  'receipt.merchant': 'Satıcı',
  'receipt.terminal': 'Terminal',
  'receipt.site': 'Satıcı Sitesi',
  'receipt.share': 'Paylaş',
  'receipt.save': 'Galeriye Kaydet',
  'receipt.paymentSuccessDesc': 'Ödeme başarıyla tamamlandı',
  'receipt.paymentFailedDesc': 'Ödeme başarısız',
  'receipt.copied': 'Fiş metni kopyalandı',
  'receipt.saveError': 'Fiş kaydedilirken hata',
  'receipt.shareText': 'İşlem fişi',
  'receipt.plain.amount': 'Tutar:',
  'receipt.plain.merchant': 'Satıcı:',
  'receipt.plain.transactionId': 'İşlem numarası:',
  'receipt.plain.date': 'Tarih:',
  'receipt.demo.transactionType': 'Satın alma',

  // Transaction
  'transaction.merchant': 'Satıcı',
  'transaction.amount': 'Tutar',
  'transaction.terminal': 'Satıcı / Terminal Numarası',
  'transaction.site': 'Satıcı Sitesi',
  'transaction.showMore': 'Daha Fazla Göster',
  'transaction.showLess': 'Daha Az Göster',
  'transaction.rial': 'Riyal',
  'transaction.toman': 'Toman',
  'transaction.demo.merchantName': 'Örnek mağaza',
  'transaction.demo.siteHost': 'example.com',

  // Pin Pad
  'pinPad.title': 'PIN Gir',
  'pinPad.clear': 'Temizle',

  // Timer
  'timer.title': 'Kalan Süre',
  'timer.expired': 'Süre doldu',

  // Payment init (SSR session)
  'paymentInit.error.title': 'Ödeme başlatılamadı',
  'paymentInit.error.description':
    'Ödeme oturum verileri eksik veya geçersiz. Lütfen geçit için doğru bağlantıyı kullanın veya daha sonra tekrar deneyin.',

  // Errors
  'error.network': 'Ağ hatası',
  'error.invalidData': 'Geçersiz veri',
  'error.unknown': 'Bilinmeyen hata',
};
