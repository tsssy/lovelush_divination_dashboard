import CONFIG from './config.js';

// Import all mock response modules
import chatMockResponses from './mock_response/chat.js';
import productsMockResponses from './mock_response/products.js';
import campaignMockResponses from './mock_response/campaign.js';
import statisticsMockResponses from './mock_response/statistics.js';
import settingsMockResponses from './mock_response/settings.js';
import globalMockResponses from './mock_response/global.js';

class HttpRequests {
  constructor() {
    this.baseURL = CONFIG.api.base_url;
    this.timeout = CONFIG.api.timeout;
    this.retries = CONFIG.api.retries;
    this.authToken = null;
    
    // Initialize mock response registry
    this.mockResponses = {
      ...globalMockResponses,
      ...chatMockResponses,
      ...productsMockResponses,
      ...campaignMockResponses,
      ...statisticsMockResponses,
      ...settingsMockResponses,
    };
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  getAuthHeaders() {
    return this.authToken 
      ? { 'Authorization': `Bearer ${this.authToken}` }
      : {};
  }

  // Mock response handler
  async getMockResponse(method, endpoint, data = null) {
    if (CONFIG.dev.debug_api_calls) {
      console.log(`🎭 Mock Request [${method}] ${endpoint}:`, data);
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
    
    // Strip query parameters from endpoint for mock lookup
    const cleanEndpoint = endpoint.split('?')[0];
    
    // Create a key for the mock response lookup
    let key = `${method.toUpperCase()}_${cleanEndpoint}`;
    
    // Look up exact match first
    let mockResponse = this.mockResponses[key];
    
    // If no exact match, try pattern matching for parameterized endpoints
    if (!mockResponse) {
      // Common patterns for parameterized endpoints
      const patterns = [
        // Remove IDs from endpoints - /chat/messages/match_123 -> /chat/messages
        { pattern: /\/[a-zA-Z0-9_-]+$/, replacement: '' },
        // Remove multiple path segments after base - /chat/messages/match_123/read -> /chat/messages
        { pattern: /\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/, replacement: '' },
        // Handle specific patterns
        { pattern: /\/messages\/[a-zA-Z0-9_-]+$/, replacement: '/messages' },
        { pattern: /\/subaccounts\/[a-zA-Z0-9_-]+$/, replacement: '/subaccounts' },
        { pattern: /\/products\/[a-zA-Z0-9_-]+$/, replacement: '/products' },
        { pattern: /\/campaigns\/[a-zA-Z0-9_-]+$/, replacement: '/campaigns' },
        { pattern: /\/custom-metrics\/[a-zA-Z0-9_-]+$/, replacement: '/custom-metrics' },
        { pattern: /\/alerts\/[a-zA-Z0-9_-]+$/, replacement: '/alerts' },
        { pattern: /\/api-keys\/[a-zA-Z0-9_-]+$/, replacement: '/api-keys' },
        { pattern: /\/webhooks\/[a-zA-Z0-9_-]+$/, replacement: '/webhooks' },
      ];
      
      for (const { pattern, replacement } of patterns) {
        if (pattern.test(cleanEndpoint)) {
          const normalizedEndpoint = cleanEndpoint.replace(pattern, replacement);
          const normalizedKey = `${method.toUpperCase()}_${normalizedEndpoint}`;
          mockResponse = this.mockResponses[normalizedKey];
          if (mockResponse) {
            console.log(`📍 Mock endpoint matched: ${key} -> ${normalizedKey}`);
            break;
          }
        }
      }
    }
    
    // If still no match, try the DEFAULT response
    if (!mockResponse) {
      mockResponse = this.mockResponses['DEFAULT'] || {
        code: 404,
        msg: `Mock endpoint not found`,
        data: {
          error: 'No mock response configured for this endpoint',
          attempted_key: key,
          tip: 'Add the endpoint mapping to the appropriate mock response file'
        }
      };
    }
    
    // If mock response is a function, call it with the data
    if (typeof mockResponse === 'function') {
      mockResponse = mockResponse(data);
    }
    
    // Deep clone the response to avoid reference issues
    const clonedResponse = JSON.parse(JSON.stringify(mockResponse));
    
    if (CONFIG.dev.debug_api_calls) {
      console.log(`✅ Mock Response [${method}] ${endpoint}:`, clonedResponse);
    }
    
    return clonedResponse;
  }

  async makeRequest(method, endpoint, data = null, options = {}) {
    // Check if we should use mock responses
    if (CONFIG.use_mock_responses) {
      return this.getMockResponse(method, endpoint, data);
    }
    
    // Continue with real API call
    const url = `${this.baseURL}${endpoint}`;
    
    // Handle different content types
    let body = null;
    let defaultHeaders = {};
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      if (data instanceof URLSearchParams) {
        // Form-encoded data (for OAuth2)
        body = data.toString();
        defaultHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        // JSON data (default)
        body = JSON.stringify(data);
        defaultHeaders['Content-Type'] = 'application/json';
      }
    }
    
    const headers = {
      ...defaultHeaders,
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const config = {
      method,
      headers,
      body,
      ...options,
    };

    if (CONFIG.dev.debug_api_calls) {
      console.log(`🚀 Real API Request [${method}] ${url}:`, data);
    }

    let lastError;
    
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseData = await response.json();

        if (CONFIG.dev.debug_api_calls) {
          console.log(`✅ Real API Response [${method}] ${url}:`, responseData);
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${responseData.msg || responseData.detail || 'Unknown error'}`);
        }

        return responseData;
      } catch (error) {
        lastError = error;
        console.error(`❌ Real API Error [${method}] ${url} (Attempt ${attempt}/${this.retries}):`, error);
        
        if (attempt < this.retries && !error.name === 'AbortError') {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        
        throw error;
      }
    }

    throw lastError;
  }

  async get(endpoint, options = {}) {
    return this.makeRequest('GET', endpoint, null, options);
  }

  async post(endpoint, data, options = {}) {
    return this.makeRequest('POST', endpoint, data, options);
  }

  async put(endpoint, data, options = {}) {
    return this.makeRequest('PUT', endpoint, data, options);
  }

  async patch(endpoint, data, options = {}) {
    return this.makeRequest('PATCH', endpoint, data, options);
  }

  async delete(endpoint, options = {}) {
    return this.makeRequest('DELETE', endpoint, null, options);
  }

  // Snake case convenience methods
  async get_request(endpoint, options = {}) {
    return this.get(endpoint, options);
  }

  async post_request(endpoint, data, options = {}) {
    return this.post(endpoint, data, options);
  }

  async put_request(endpoint, data, options = {}) {
    return this.put(endpoint, data, options);
  }

  async patch_request(endpoint, data, options = {}) {
    return this.patch(endpoint, data, options);
  }

  async delete_request(endpoint, options = {}) {
    return this.delete(endpoint, options);
  }
}

// Create and export a singleton instance
const httpRequests = new HttpRequests();

export default httpRequests;
export { HttpRequests };