/**
 * Card Service - Handle card-related API calls
 */
import { apiService } from './apiService.js';

class CardService {
  /**
   * Get user's saved cards
   * @returns {Promise<Object>} - Cards response with Data array
   */
  async getCards() {
    try {
      // Mock data for development
      if (this.isMockMode()) {
        return this.getMockCards();
      }

      // Real API call
      const response = await apiService.get('/api/cards', {
        background: true
      });

      return response;
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      // Return empty data on error
      return { Data: [] };
    }
  }

  /**
   * Check if mock mode is enabled
   * @returns {boolean}
   */
  isMockMode() {
    // Check for mock flag in localStorage or URL params
    const urlParams = new URLSearchParams(window.location.search);
    const useMock = urlParams.get('mock') === 'true' || localStorage.getItem('useMockCards') === 'true';
    return useMock || !apiService.baseURL; // Use mock if no base URL is set
  }

  /**
   * Get mock cards data
   * @returns {Object} - Mock cards response
   */
  getMockCards() {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          Data: [
            {
              SecurePan: "621986######5273",
              SubscriberCardId: 280907372,
              IsGiftCard: false,
              CardOwner: 1,
              HasValidExpiredDate: true,
              Selected: false,
              BankName: "بانک سامان",
              CanDeActive: true,
              IsLimited: false
            },
            {
              SecurePan: "621986######1630",
              SubscriberCardId: 191030028,
              IsGiftCard: false,
              CardOwner: 1,
              HasValidExpiredDate: true,
              Selected: false,
              BankName: "بانک سامان",
              CanDeActive: true,
              IsLimited: false
            },
            {
              SecurePan: "502229######9053",
              SubscriberCardId: 368937351,
              IsGiftCard: false,
              CardOwner: 1,
              HasValidExpiredDate: true,
              Selected: false,
              BankName: "بانک پاسارگاد",
              CanDeActive: true,
              IsLimited: false
            },
            {
              SecurePan: "621986######4430",
              SubscriberCardId: 363588257,
              IsGiftCard: false,
              CardOwner: 1,
              HasValidExpiredDate: true,
              Selected: false,
              BankName: "بانک سامان",
              CanDeActive: true,
              IsLimited: false
            },
            {
              SecurePan: "636214######5307",
              SubscriberCardId: 315500287,
              IsGiftCard: false,
              CardOwner: 1,
              HasValidExpiredDate: true,
              Selected: false,
              BankName: "بانک آینده (تات)",
              CanDeActive: true,
              IsLimited: false
            },
            {
              SecurePan: "621986######1013",
              SubscriberCardId: 67021321,
              IsGiftCard: true,
              CardOwner: 1,
              HasValidExpiredDate: true,
              Selected: false,
              BankName: "بانک سامان",
              CanDeActive: true,
              IsLimited: false
            },
            {
              SecurePan: "621986######2497",
              SubscriberCardId: 23647809,
              IsGiftCard: false,
              CardOwner: 1,
              HasValidExpiredDate: false,
              Selected: false,
              BankName: "بانک سامان",
              CanDeActive: true,
              IsLimited: false
            },
            {
              SecurePan: "504172######1195",
              SubscriberCardId: 266139817,
              IsGiftCard: false,
              CardOwner: 1,
              HasValidExpiredDate: true,
              Selected: false,
              BankName: "بانک قرض الحسنه رسالت",
              CanDeActive: true,
              IsLimited: false
            },
            {
              SecurePan: "502229######3373",
              SubscriberCardId: 247204029,
              IsGiftCard: false,
              CardOwner: 1,
              HasValidExpiredDate: true,
              Selected: false,
              BankName: "بانک پاسارگاد",
              CanDeActive: true,
              IsLimited: false
            }
          ]
        });
      }, 300); // Simulate 300ms delay
    });
  }

  /**
   * Convert API card format to internal format
   * @param {Object} apiCard - Card from API
   * @returns {Object} - Internal card format
   */
  convertCardFormat(apiCard) {
    // Extract only digits from SecurePan (remove # symbols)
    const cardNumber = apiCard.SecurePan.replace(/[^0-9]/g, '');
    
    return {
      number: cardNumber,
      securePan: apiCard.SecurePan,
      subscriberCardId: apiCard.SubscriberCardId,
      bankName: apiCard.BankName,
      isGiftCard: apiCard.IsGiftCard,
      hasValidExpiredDate: apiCard.HasValidExpiredDate,
      selected: apiCard.Selected,
      canDeActive: apiCard.CanDeActive,
      isLimited: apiCard.IsLimited,
      pinned: false // Default pinned state
    };
  }
}

// Export singleton instance
export const cardService = new CardService();
