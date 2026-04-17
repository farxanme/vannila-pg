const prCodeToTypeKey = {
  31: 'transaction.type.balance',
  0: 'transaction.type.purchase',
  60: 'transaction.type.thirdParty',
  69: 'transaction.type.gamPapers',
  30: 'transaction.type.charge',
  40: 'transaction.type.bill',
  41: 'transaction.type.specialBill',
  42: 'transaction.type.billManualVerify',
  43: 'transaction.type.billThirdParty',
  70: 'transaction.type.payment',
  35: 'transaction.type.groupCharge',
  10: 'transaction.type.transfer',
  37: 'transaction.type.topUp',
  80: 'transaction.type.government',
  36: 'transaction.type.chargePayment',
  71: 'transaction.type.sepSegmentPayment',
};

const prCodeToIcon = {
  31: '/assets/images/icons/icn-credit-card.svg',
  0: '/assets/images/icons/icn-shopping-bag.svg',
  60: '/assets/images/icons/icn-world.svg',
  69: '/assets/images/icons/icn-cash-banknote.svg',
  30: '/assets/images/icons/icn-cash-banknote.svg',
  40: '/assets/images/icons/icn-cash-banknote.svg',
  41: '/assets/images/icons/icn-cash-banknote.svg',
  42: '/assets/images/icons/icn-cash-banknote.svg',
  43: '/assets/images/icons/icn-cash-banknote.svg',
  70: '/assets/images/icons/icn-credit-card.svg',
  35: '/assets/images/icons/icn-cash-banknote.svg',
  10: '/assets/images/icons/icn-credit-card.svg',
  37: '/assets/images/icons/icn-cash-banknote.svg',
  80: '/assets/images/icons/icn-world.svg',
  36: '/assets/images/icons/icn-cash-banknote.svg',
  71: '/assets/images/icons/icn-credit-card.svg',
};

/**
 * Resolve normalized transaction type for a given prCode.
 * @param {number|null|undefined} prCode
 * @param {(key: string) => string} t - i18n translator function
 * @returns {{ key: string, label: string, icon: string }}
 */
export function getTransactionTypeInfo(prCode, t) {
  const code = typeof prCode === 'number' && !Number.isNaN(prCode) ? prCode : null;
  const key = code != null && prCodeToTypeKey[code] ? prCodeToTypeKey[code] : 'transaction.type.unknown';
  const icon =
    code != null && prCodeToIcon[code]
      ? prCodeToIcon[code]
      : '/assets/images/icons/icn-square-info.svg';
  return {
    key,
    label: t(key),
    icon,
  };
}
