export const CONFIG = {
  // ========================================
  // MOCK MODE TOGGLE - CHANGE THIS TO SWITCH BETWEEN MOCK AND REAL APIs
  // ========================================
  use_mock_responses: false, // Set to false for real API calls
  
  // ========================================
  // 🔴 MOCK MODE IS CURRENTLY: DISABLED
  // 🟢 Using real API endpoints
  // ========================================
  
  // API Configuration
  api: {
    base_url: 'https://lovetapoversea.xyz/lovelush',
    // base_url: "https://5aec691465f1.ngrok-free.app",
    timeout: 30000,
    retries: 3,
  },

  // Chat Configuration
  chat: {
    max_subaccounts: 5,
    message_batch_size: 50,
    auto_scroll_threshold: 100,
    auto_load_chatrooms_on_login: true, // Set to false to disable automatic chatroom loading during login
  },

  // Polling Configuration
  polling: {
    statistics_frequency: 300000, // 5 minutes in milliseconds
    health_check_frequency: 60000, // 1 minute
  },

  // Pagination
  pagination: {
    default_page_size: 20,
    max_page_size: 100,
  },

  // File Upload
  upload: {
    max_file_size: 10 * 1024 * 1024, // 10MB
    allowed_types: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },

  // Cache
  cache: {
    user_cache_duration: 300000, // 5 minutes
    product_cache_duration: 600000, // 10 minutes
  },

  // Development
  dev: {
    enable_mock_responses: false,
    debug_api_calls: true,
    debug_socket_events: true,
  },
};

export default CONFIG;