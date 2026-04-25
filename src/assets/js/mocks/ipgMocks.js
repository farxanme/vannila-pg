/**
 * IPG API mock payloads (aligned with spg-webapp-samples).
 */
import {
  getMockCardViewTimeout,
  getMockReceiptViewTimeout,
  getMockTransactionMode,
} from '../config/env.js';

function buildMockBills() {
  return [
    {
      id: 16,
      ipgTransactionId: 75,
      billId: '2306031018',
      payId: '1210107',
      amount: 12000,
      paymentReceipt: null,
      hasReceipt: false,
    },
    {
      id: 17,
      ipgTransactionId: 75,
      billId: '8586431014',
      payId: '1210102',
      amount: 12000,
      paymentReceipt: null,
      hasReceipt: false,
    },
  ];
}

function buildMockGetTransactionResponse() {
  const mode = getMockTransactionMode();
  const isBillMode = mode === 'bill';

  return {
    data: {
      transactionState: 1,
      expired: false,
      terminalNumber: 2765,
      totalAmount: 24000,
      wage: 0,
      prCode: isBillMode ? 40 : 0,
      transactionId: 75,
      refNum: '8572993840D2D52F9F32280F4389468877298A9FAF4E0D7CB452E414307F94B7',
      salt: '0cc0583ff53e468ca6c3657bb4a93479',
      userSessionKey: '4DCDC07C8F79EABD7002824258717FA71E8A4AA0ECAFA6E6104598075AF7A691',
      bills: isBillMode ? buildMockBills() : [],
      merchant: {
        merchantNumber: 27650,
        merchantName: 'تست توسعه',
        merchantLogoUri: '/images/6060666dc75745e6b9c0fc8eae397283.gif',
        merchantWebSite: 'https://dev.net',
        description:
          'توضیحات تستی ترمینال تستی در محیط تستی در حالت توضیحات فعال با تعداد کاراکتر های زیاد جهت نمایش در صفحه کارت درگاه پرداخت اینترنتی آنلاین پی جی سپ (پرداخت الکترونیک سامان کیش)',
        paymentFacilitatorInfo: isBillMode
          ? {
              merchantNumber: 27650,
              merchantName: 'پرداخت یار توسعه',
              merchantLogoUri: '/images/payment-facilitor-dev.jpg',
              merchantWebSite: 'http://pglauncher.dev.net/',
              description: '',
              paymentFacilitatorInfo: null,
            }
          : null,
      },
      appSettings: {
        cardViewTimeOut: getMockCardViewTimeout(),
        receiptViewTimeOut: getMockReceiptViewTimeout(),
        prCodesPanLimits: null,
        billsSettings: {
          maxCount: 10,
          staticPinMaxAmount: 1000000,
        },
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
}

export const mockGetTransactionResponse = buildMockGetTransactionResponse();

export const mockGetUserCardsResponse = {
  data: {
    userCards: [
      {
        cardId: '20616',
        cardRegisteredType: 1,
        maskedPan: '62198*******8080',
        expireDate: true,
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

export const mockGetBankBinsResponse = [
  {
    bin: '10060',
    bankName: 'IRI CentralBank',
    bankCode: '10',
  },
  {
    bin: '170019',
    bankName: 'Melli Iran',
    bankCode: '17',
  },
];

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
      maskedPan: '5022**********1234',
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

export const mockCancelTransactionResponse = {
  data: {},
  statusCode: 2000,
  statusTitle: 'Success',
  validationErrors: [],
};

export function mockDelay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
