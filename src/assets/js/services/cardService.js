/**
 * Card Service — saved cards from IPG /user/cards
 */
import { useIpgMock, getIpgBaseUrl } from '../config/env.js';
import { getUserCards } from './ipgService.js';
import { detectBank, detectBankFromMaskedPan } from '../utils/bankDetector.js';

class CardService {
  /**
   * Get user's saved cards for current session
   * @returns {Promise<{ Data: object[] }>}
   */
  async getCards() {
    try {
      if (useIpgMock()) {
        const res = await getUserCards();
        const list = res.data?.userCards ?? [];
        return { Data: list.map((c) => this.convertCardFormat(c)).filter(Boolean) };
      }

      const base = getIpgBaseUrl();
      if (!base) {
        return { Data: [] };
      }

      const res = await getUserCards();
      const list = res.data?.userCards ?? [];
      return { Data: list.map((c) => this.convertCardFormat(c)).filter(Boolean) };
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      return { Data: [] };
    }
  }

  /**
   * Convert API card to internal format (legacy SecurePan or IPG userCards item).
   * @param {object} apiCard - Card from API
   * @returns {object} - Internal card format
   */
  convertCardFormat(apiCard) {
    if (apiCard == null || typeof apiCard !== 'object') {
      return null;
    }

    // IPG userCards: maskedPan (null means use legacy or skip)
    if (apiCard.maskedPan != null && String(apiCard.maskedPan).trim() !== '') {
      const masked = String(apiCard.maskedPan);
      const bank = detectBankFromMaskedPan(masked);
      const digitsFromMasked = masked.replace(/\D/g, '');
      const bin6FromBank = bank?.bin ? String(bank.bin).replace(/\D/g, '').slice(0, 6) : '';
      const paddedPan = bin6FromBank
        ? (bin6FromBank + '0000000000').slice(0, 16)
        : (digitsFromMasked + '0000000000000000').slice(0, 16);
      const cardIdNum = Number(apiCard.cardId);
      // Prefer cardId for `number` so rows stay unique (BIN-based paddedPan repeats per bank).
      const numberFromId =
        apiCard.cardId != null && String(apiCard.cardId).trim() !== ''
          ? String(apiCard.cardId)
          : paddedPan;
      const registeredType = Number(apiCard.cardRegisteredType);
      return {
        number: numberFromId,
        securePan: masked,
        subscriberCardId: Number.isNaN(cardIdNum) ? apiCard.cardId : cardIdNum,
        bankName: bank?.name || '',
        bankBin: bank?.bin || '',
        isGiftCard: Boolean(apiCard.isGiftCard),
        hasValidExpiredDate: apiCard.expireDate != null,
        selected: Boolean(apiCard.selected),
        canDeActive: registeredType === 1,
        isLimited: Boolean(apiCard.isLimited),
        pinned: false,
        cardRegisteredType: apiCard.cardRegisteredType,
      };
    }

    // Legacy SEP card shape
    if (apiCard.SecurePan != null && String(apiCard.SecurePan).trim() !== '') {
      const secure = String(apiCard.SecurePan);
      const cardNumber = secure.replace(/[^0-9]/g, '');
      const bank = detectBankFromMaskedPan(secure) || detectBank(cardNumber);
      const legacyRegType = apiCard.cardRegisteredType ?? apiCard.CardRegisteredType;
      return {
        number: cardNumber,
        securePan: secure,
        subscriberCardId: apiCard.SubscriberCardId,
        bankName: apiCard.BankName || bank?.name || '',
        bankBin: bank?.bin || '',
        isGiftCard: apiCard.IsGiftCard,
        hasValidExpiredDate: apiCard.HasValidExpiredDate,
        selected: apiCard.Selected,
        canDeActive: apiCard.CanDeActive,
        isLimited: apiCard.IsLimited,
        pinned: false,
        cardRegisteredType: legacyRegType,
      };
    }

    return null;
  }
}

export const cardService = new CardService();
