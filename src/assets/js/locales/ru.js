/**
 * Russian Translations
 */
export default {
  // Common
  'common.submit': 'Отправить',
  'common.cancel': 'Отмена',
  'common.close': 'Закрыть',
  'common.confirm': 'Подтвердить',
  'common.delete': 'Удалить',
  'common.edit': 'Редактировать',
  'common.save': 'Сохранить',
  'common.loading': 'Загрузка...',
  'common.error': 'Ошибка',
  'common.success': 'Успешно',
  'common.clear': 'Очистить',
  'common.required': 'Обязательное поле',
  'common.processing': 'Обработка...',

  // Redirect
  'redirect.loading': 'Перенаправление...',

  // Header
  'header.title': 'Платежный шлюз',

  // Footer
  'footer.copyright': '© 2024 Все права защищены',

  // Form
  'form.cardNumber': 'Номер карты',
  'form.cardNumber.placeholder': '1234 5678 9012 3456',
  'form.cardNumber.required': 'Номер карты обязателен',
  'form.cardNumber.invalid': 'Неверный номер карты',
  'form.cvv2': 'CVV2',
  'form.cvv2.placeholder': '123',
  'form.cvv2.required': 'CVV2 обязателен',
  'form.cvv2.hint': '3- или 4-значный код на обороте карты',
  'form.expiryDate': 'Срок действия',
  'form.expiryMonth': 'Месяц',
  'form.expiryYear': 'Год',
  'form.expiryDate.required': 'Срок действия обязателен',
  'form.expiryDate.invalid': 'Неверный срок действия',
  'form.securityCode': 'Код безопасности',
  'form.securityCode.required': 'Код безопасности обязателен',
  'form.otp': 'OTP',
  'form.otp.placeholder': '123456',
  'form.otp.required': 'OTP обязателен',
  'form.mobile': 'Номер мобильного',
  'form.mobile.placeholder': '09123456789',
  'form.mobile.required': 'Номер мобильного обязателен',
  'form.mobile.invalid': 'Неверный номер мобильного',
  'form.email': 'Электронная почта',
  'form.email.placeholder': 'example@email.com',
  'form.email.required': 'Электронная почта обязательна',
  'form.email.invalid': 'Неверная электронная почта',
  'form.saveCard': 'Сохранить карту в шлюзе SEP',
  'form.pay': 'Оплатить',
  'form.pay.securePrefix': 'Безопасная оплата',
  'form.pay.disabled': 'Пожалуйста, заполните всю информацию',
  'form.pay.processing': 'Подключение к банку...',
  'form.pay.success': 'Платёж успешно выполнен',
  'form.captchaAudioUnavailable': 'Аудио капчи недоступно в этой сборке',
  'form.cancel': 'Отмена',
  'form.showReceipt': 'Показать квитанцию',
  'form.title': 'Информация об оплате',
  'form.submit': 'Отправить',
  'form.captcha': 'Код безопасности',
  'form.captcha.placeholder': 'Введите код',
  'form.validation.error': 'Пожалуйста, заполните все поля правильно',
  'form.showCards': 'Показать карты',
  'form.virtualPinPad': 'Виртуальная клавиатура PIN',
  'form.reloadCaptcha': 'Обновить капчу',
  'form.getOtp': 'Получить OTP',
  'form.getOtpSuccess': 'OTP успешно отправлен',
  'form.getOtpExhausted': 'Исчерпан лимит запросов OTP для этой карты.',
  'form.getOtpCountdownAria': 'Подождите {{time}}, прежде чем снова запросить OTP',
  'form.captchaImageAlt': 'Код безопасности',
  'form.captchaAudio': 'Воспроизвести аудио капчи',
  'form.audioPlay': 'Воспроизвести аудио',
  'cancelConfirm.title': 'Отменить оплату?',
  'cancelConfirm.description':
    'Если вы уйдёте сейчас, оплата может остаться незавершённой. Выберите действие.',
  'cancelConfirm.imageAlt': 'Иллюстрация: отмена оплаты',
  'cancelConfirm.continuePay': 'Продолжить оплату',
  'cancelConfirm.confirmLeave': 'Покинуть оплату',
  'form.expiryPlaceholder': 'ММ/ГГ',

  // Accessibility
  'accessibility.selectLanguage': 'Выбрать язык',
  'accessibility.partnerLogo': 'Логотип партнера',

  // Card List
  'cardList.addNew': 'Добавить новую карту',
  'cardList.manage': 'Управление картами',
  'cardList.pin': 'Закрепить',
  'cardList.unpin': 'Открепить',
  'cardList.delete': 'Удалить',
  'cardList.deleteConfirm': 'Вы уверены, что хотите удалить эту карту?',
  'cardList.empty': 'Нет зарегистрированных карт',

  // Receipt
  'receipt.success': 'Транзакция успешна',
  'receipt.failed': 'Транзакция не удалась',
  'receipt.pending': 'Обработка',
  'receipt.amount': 'Сумма',
  'receipt.transactionType': 'Тип транзакции',
  'receipt.merchant': 'Торговец',
  'receipt.terminal': 'Терминал',
  'receipt.site': 'Сайт торговца',
  'receipt.share': 'Поделиться',
  'receipt.save': 'Сохранить в галерею',
  'receipt.paymentSuccessDesc': 'Оплата успешно завершена',
  'receipt.paymentFailedDesc': 'Оплата не удалась',
  'receipt.copied': 'Текст квитанции скопирован',
  'receipt.saveError': 'Ошибка сохранения квитанции',
  'receipt.shareText': 'Квитанция транзакции',

  // Transaction
  'transaction.merchant': 'Торговец',
  'transaction.amount': 'Сумма',
  'transaction.terminal': 'Номер торговца / Терминал',
  'transaction.site': 'Сайт торговца',
  'transaction.showMore': 'Показать больше',
  'transaction.showLess': 'Показать меньше',
  'transaction.rial': 'Риал',
  'transaction.toman': 'Томан',

  // Pin Pad
  'pinPad.title': 'Введите PIN',
  'pinPad.clear': 'Очистить',

  // Timer
  'timer.title': 'Оставшееся время',
  'timer.expired': 'Время истекло',

  // Payment init (SSR session)
  'paymentInit.error.title': 'Невозможно начать оплату',
  'paymentInit.error.description':
    'Данные платёжной сессии отсутствуют или недействительны. Откройте шлюз по правильной ссылке или повторите попытку позже.',

  // Errors
  'error.network': 'Ошибка сети',
  'error.invalidData': 'Неверные данные',
  'error.unknown': 'Неизвестная ошибка',
};
