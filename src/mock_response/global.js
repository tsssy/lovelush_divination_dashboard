// Global API Mock Responses

export const mockAuthLoginResponse = {
  code: 200,
  msg: 'success',
  data: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_jwt_token_here',
    user_id: 'user_12345',
    agent_id: 'agent_67890',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    permissions: ['read_chats', 'write_chats', 'manage_products', 'view_analytics'],
  },
};

export const mockUserProfileResponse = {
  code: 200,
  msg: 'success',
  data: {
    user_id: 'user_12345',
    agent_id: 'agent_67890',
    email: 'agent@lovelush.com',
    display_name: 'Sarah Johnson',
    avatar_url: 'https://api.lovelush.com/avatars/agent_67890.jpg',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-12-01T14:22:00Z',
    settings: {
      theme: 'light',
      notifications: true,
      language: 'en',
    },
  },
};

export const mockFileUploadResponse = {
  code: 200,
  msg: 'success',
  data: {
    file_id: 'file_abc123',
    file_url: 'https://cdn.lovelush.com/uploads/file_abc123.jpg',
    file_name: 'profile_image.jpg',
    file_size: 1024768,
    file_type: 'image/jpeg',
    uploaded_at: new Date().toISOString(),
  },
};

export const mockHealthCheckResponse = {
  code: 200,
  msg: 'success',
  data: {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: 86400,
    dependencies: {
      database: 'healthy',
      cache: 'healthy',
      soketi: 'healthy',
    },
  },
};

export const mockLogoutResponse = {
  code: 200,
  msg: 'success',
  data: {
    message: 'Successfully logged out',
    logged_out_at: new Date().toISOString(),
  },
};

export const mockUpdateUserProfileResponse = {
  code: 200,
  msg: 'success',
  data: {
    user_id: 'user_12345',
    agent_id: 'agent_67890',
    email: 'agent@lovelush.com',
    display_name: 'Sarah Johnson',
    avatar_url: 'https://api.lovelush.com/avatars/agent_67890.jpg',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: new Date().toISOString(),
    settings: {
      theme: 'dark',
      notifications: true,
      language: 'en',
    },
  },
};

export default {
  // Global API endpoint mappings
  'POST_/auth/login': mockAuthLoginResponse,
  'POST_/auth/logout': mockLogoutResponse,
  'GET_/user/profile': mockUserProfileResponse,
  'PUT_/user/profile': mockUpdateUserProfileResponse,
  'POST_/files/upload': mockFileUploadResponse,
  'GET_/health': mockHealthCheckResponse,
  'GET_/': mockHealthCheckResponse, // Root health check
  
  // Default response for unmatched endpoints
  'DEFAULT': {
    code: 404,
    msg: 'Mock endpoint not found',
    data: {
      error: 'No mock response configured for this endpoint',
      tip: 'Add the endpoint mapping to the appropriate mock response file'
    }
  },
  
  // Legacy exports for backward compatibility
  mockAuthLoginResponse,
  mockUserProfileResponse,
  mockFileUploadResponse,
  mockHealthCheckResponse,
  mockLogoutResponse,
  mockUpdateUserProfileResponse,
};