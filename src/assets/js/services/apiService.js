/**
 * API Service - Handle HTTP requests
 */
class ApiService {
  constructor() {
    this.baseURL = '';
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Set base URL
   * @param {string} url - Base URL
   */
  setBaseURL(url) {
    this.baseURL = url;
  }

  /**
   * Set default headers
   * @param {Object} headers - Headers object
   */
  setDefaultHeaders(headers) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Make API request
   * @param {Object} options - Request options
   * @param {string} options.endpoint - API endpoint
   * @param {string} options.method - HTTP method (GET, POST, etc.)
   * @param {Object} options.data - Request data
   * @param {Object} options.headers - Additional headers
   * @param {Object} options.queryParams - Query string parameters
   * @param {boolean} options.freezePage - Freeze page during request
   * @param {boolean} options.showLoading - Show loading on button
   * @param {HTMLElement} options.loadingButton - Button element for loading
   * @param {boolean} options.background - Background request (no loading)
   * @returns {Promise<Object>} - Response data
   */
  async request(options) {
    const {
      endpoint,
      method = 'GET',
      data = null,
      headers = {},
      queryParams = null,
      freezePage = false,
      showLoading = false,
      loadingButton = null,
      background = false
    } = options;

    // Build URL
    let url = this.baseURL + endpoint;
    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      url += '?' + params.toString();
    }

    // Prepare headers
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    // Prepare body
    let body = null;
    if (data) {
      if (data instanceof FormData) {
        body = data;
        // Remove Content-Type header for FormData (browser sets it automatically)
        delete requestHeaders['Content-Type'];
      } else {
        body = JSON.stringify(data);
      }
    }

    // Freeze page if needed
    if (freezePage && !background) {
      this.freezePage(true);
    }

    // Show loading on button if needed
    if (showLoading && loadingButton && !background) {
      this.showButtonLoading(loadingButton, true);
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Request failed');
      }

      return responseData;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    } finally {
      // Unfreeze page
      if (freezePage && !background) {
        this.freezePage(false);
      }

      // Hide loading on button
      if (showLoading && loadingButton && !background) {
        this.showButtonLoading(loadingButton, false);
      }
    }
  }

  /**
   * Freeze/unfreeze page
   * @param {boolean} freeze - Freeze state
   */
  freezePage(freeze) {
    const body = document.body;
    if (freeze) {
      body.style.pointerEvents = 'none';
      body.style.opacity = '0.7';
      body.style.cursor = 'wait';
    } else {
      body.style.pointerEvents = '';
      body.style.opacity = '';
      body.style.cursor = '';
    }
  }

  /**
   * Show/hide loading on button
   * @param {HTMLElement} button - Button element
   * @param {boolean} show - Show state
   */
  showButtonLoading(button, show) {
    if (!button) return;

    if (show) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.innerHTML = '<span class="spinner"></span> ' + button.dataset.originalText;
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText || button.textContent;
    }
  }

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request({ ...options, endpoint, method: 'GET' });
  }

  /**
   * POST request
   */
  post(endpoint, data, options = {}) {
    return this.request({ ...options, endpoint, method: 'POST', data });
  }

  /**
   * PUT request
   */
  put(endpoint, data, options = {}) {
    return this.request({ ...options, endpoint, method: 'PUT', data });
  }

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request({ ...options, endpoint, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiService = new ApiService();
