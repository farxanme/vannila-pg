import CryptoJS from 'crypto-js';

/**
 * Encrypted Data Store using LocalStorage
 */
class DataStore {
  constructor() {
    this.secretKey = 'pg-secret-key-2024'; // In production, use environment variable
  }

  /**
   * Encrypt data
   * @param {string} data - Data to encrypt
   * @returns {string} - Encrypted data
   */
  encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
  }

  /**
   * Decrypt data
   * @param {string} encryptedData - Encrypted data
   * @returns {*} - Decrypted data
   */
  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (err) {
      console.error('Decryption failed:', err);
      return null;
    }
  }

  /**
   * Set data
   * @param {string} key - Unique key
   * @param {*} value - Value to store
   * @returns {boolean} - Success status
   */
  set(key, value) {
    try {
      const encrypted = this.encrypt(value);
      localStorage.setItem(`pg_${key}`, encrypted);
      return true;
    } catch (err) {
      console.error('Storage set failed:', err);
      return false;
    }
  }

  /**
   * Get data
   * @param {string} key - Unique key
   * @returns {*} - Stored value or null
   */
  get(key) {
    try {
      const encrypted = localStorage.getItem(`pg_${key}`);
      if (!encrypted) return null;
      return this.decrypt(encrypted);
    } catch (err) {
      console.error('Storage get failed:', err);
      return null;
    }
  }

  /**
   * Update data
   * @param {string} key - Unique key
   * @param {*} value - New value
   * @returns {boolean} - Success status
   */
  update(key, value) {
    return this.set(key, value);
  }

  /**
   * Remove data
   * @param {string} key - Unique key
   * @returns {boolean} - Success status
   */
  remove(key) {
    try {
      localStorage.removeItem(`pg_${key}`);
      return true;
    } catch (err) {
      console.error('Storage remove failed:', err);
      return false;
    }
  }

  /**
   * Clear all data
   * @returns {boolean} - Success status
   */
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('pg_')) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (err) {
      console.error('Storage clear failed:', err);
      return false;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Unique key
   * @returns {boolean} - Exists status
   */
  has(key) {
    return localStorage.getItem(`pg_${key}`) !== null;
  }
}

// Export singleton instance
export const dataStore = new DataStore();
