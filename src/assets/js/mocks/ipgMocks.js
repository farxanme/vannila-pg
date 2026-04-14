/**
 * IPG API mock payloads (aligned with spg-webapp-samples).
 */

export const mockGetTransactionResponse = {
  data: {
    transactionId: 63,
    refNum: '9CCA4792E9F80F7E94513EC464412F4D97EF887A8B5300C95D2CD5E8ED5A8E56',
    salt: '7f479858b67248068fb4aa2a0b258965',
    userSessionKey: '13D8B41B8364727437F907D6F456ADDAD9249C40948537128C0F09AAA8551D88',
    terminalNumber: 2765,
    totalAmount: 120000,
    merchant: {
      merchantNumber: 27650,
      merchantName: 'تست توسعه',
      merchantLogoUri: '/images/6060666dc75745e6b9c0fc8eae397283.gif',
      merchantWebSite: 'https://dev.net',
    },
    appSettings: {
      cardViewTimeOut: '00:10:00',
      receiptViewTimeOut: '00:00:10',
      prCodesPanLimits: {
        prCode: 0,
        panProductCodes: [],
      },
      billsSettings: null,
      otpSettings: {
        maxTries: 5,
        nextTryTime: '00:02:00',
      },
    },
  },
  statusCode: 2000,
  statusTitle: 'Success',
  validationErrors: [],
};

export const mockGetUserCardsResponse = {
  data: {
    userCards: [
      {
        cardId: '20616',
        cardRegisteredType: 1,
        maskedPan: '62198*******8080',
        expireDate: null,
        selected: false,
        isGiftCard: true,
        isLimited: false,
      },
      {
        cardId: '20609',
        cardRegisteredType: 1,
        maskedPan: '58946*******0771',
        expireDate: null,
        selected: false,
        isGiftCard: false,
        isLimited: false,
      },
      {
        cardId: '20605',
        cardRegisteredType: 1,
        maskedPan: '62198*******4265',
        expireDate: null,
        selected: false,
        isGiftCard: true,
        isLimited: false,
      },
      {
        cardId: '20602',
        cardRegisteredType: 1,
        maskedPan: '50222*******2438',
        expireDate: null,
        selected: false,
        isGiftCard: false,
        isLimited: false,
      },
    ],
  },
  statusCode: 2000,
  statusTitle: 'Success',
  validationErrors: [],
};

export const mockSendOtpResponse = {
  data: null,
  statusCode: 2000,
  statusTitle: 'Success',
  validationErrors: [],
};

export const mockPayTransactionResponse = {
  data: {
    paymentReceipt: {
      id: 0,
      ipgTransactionId: 63,
      billInfoId: null,
      receiptDate: '2026-04-06T08:04:57.9557457+03:30',
      pTraceNo: 25765,
      rrn: '22957907813',
      receiptRefNum: 'de608c6d28d348d7912bb1215dd5cd5e',
      totalAmount: 12000,
      affectiveAmount: 12000,
      traceNo: '190802',
      sTraceNo: null,
      terminalNumber: 2765,
      maskedPan: null,
      hashedPan: null,
      resultCode: '00',
      resultDescription: 'پرداخت با موفقیت انجام شد',
      canRetry: false,
      isSuccess: true,
    },
  },
  statusCode: 2000,
  statusTitle: 'Success',
  validationErrors: [],
};

export const mockReceiptRedirectParamsResponse = {
  data: {
    redirectUrl: 'https://unit-test/return',
    refNum: '9CCA4792E9F80F7E94513EC464412F4D97EF887A8B5300C95D2CD5E8ED5A8E56',
    receiptEnc:
      '613rzZczTIn/3y/IjJz0iqXwDSpjH6PwD3IFxRXhRYQ52iPDFMy4JCbeZ3i65mIy2AzdTsPxTqWl6A9W/ME9QSenkme5DKOXxQBaGqwBfpBzSmGkR2Wcq+TjmIbsWEZirlXjLt+N+dggEmF+F/j0yVoK//IMeuWrLaBHFeH1JzmJp1EF6PBwhHQxl6M0dwoEIweaKzCvxNcleEsGQujME942vo2WybO3IdKWAFwJPDih0QiwG0DeXsLtbGKOlxEAE+rtSY7/FIR+W/ct24v3QruID6/llZhvEbxJ6S5ngSlDmjlpOgGCcBKEDYSmmxnFsk1uR8LpOJPGu6Rh5f8M3hDshVqki1/ZEwXcdu2QyUw2zgZQP7irHbsw9zwKMKmbAUN4a5/Gyf7zMFyPpDAaJrmAr6P5YNqwHrLgfgBDUlHS2AEcygQvBzQ0LlzTcrVdo75iX+DjIlBv+88QjUy6Z4ZzPaIaTl5qnPzgDg==',
    receiptNonce: 'O9DIHkFx6SW3CiUz',
    receiptTag: 'Owm6dbhhDgql6uPIDnwQxQ==',
  },
  statusCode: 2000,
  statusTitle: 'Success',
  validationErrors: [],
};

export function mockDelay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
