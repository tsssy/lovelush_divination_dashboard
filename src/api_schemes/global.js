// Global API Schemes - Common request/response structures

// Base response structure
export const BaseResponse = {
  code: 0, // int
  msg: '', // string
  data: {}, // object with string keys and any values
};

// Authentication schemes
export const AuthLoginRequest = {
  domain: '', // string
  agent_id: '', // string
  password: '', // string
};

export const AuthLoginResponse = {
  code: 200,
  msg: 'success',
  data: {
    token: '', // string - JWT token
    user_id: '', // string
    agent_id: '', // string
    expires_at: '', // string - ISO date
    permissions: [], // array of strings
  },
};

// User profile schemes
export const UserProfileResponse = {
  code: 200,
  msg: 'success',
  data: {
    user_id: '', // string
    agent_id: '', // string
    email: '', // string
    display_name: '', // string
    avatar_url: '', // string
    created_at: '', // string - ISO date
    updated_at: '', // string - ISO date
    settings: {}, // object
  },
};

export const UpdateUserProfileRequest = {
  display_name: '', // string (optional)
  email: '', // string (optional)
  avatar_url: '', // string (optional)
  settings: {}, // object (optional)
};

// File upload schemes
export const FileUploadRequest = {
  file: null, // File object
  type: '', // string - file type category
};

export const FileUploadResponse = {
  code: 200,
  msg: 'success',
  data: {
    file_id: '', // string
    file_url: '', // string
    file_name: '', // string
    file_size: 0, // number
    file_type: '', // string
    uploaded_at: '', // string - ISO date
  },
};

// Health check scheme
export const HealthCheckResponse = {
  code: 200,
  msg: 'success',
  data: {
    status: 'healthy', // string
    timestamp: '', // string - ISO date
    version: '', // string
    uptime: 0, // number - seconds
    dependencies: {
      database: 'healthy', // string
      cache: 'healthy', // string
      soketi: 'healthy', // string
    },
  },
};

// Error response scheme
export const ErrorResponse = {
  code: 400, // int - error code
  msg: '', // string - error message
  data: {
    error_type: '', // string
    error_details: {}, // object (optional)
    request_id: '', // string (optional)
  },
};

// Pagination scheme
export const PaginationMeta = {
  current_page: 1, // number
  per_page: 20, // number
  total_pages: 1, // number
  total_items: 0, // number
  has_next_page: false, // boolean
  has_prev_page: false, // boolean
};

// Common filter schemes
export const DateRangeFilter = {
  start_date: '', // string - ISO date (optional)
  end_date: '', // string - ISO date (optional)
};

export const SearchFilter = {
  query: '', // string
  page: 1, // number (optional)
  limit: 20, // number (optional)
  sort_by: '', // string (optional)
  sort_order: 'asc', // string - 'asc' or 'desc' (optional)
};

export default {
  BaseResponse,
  AuthLoginRequest,
  AuthLoginResponse,
  UserProfileResponse,
  UpdateUserProfileRequest,
  FileUploadRequest,
  FileUploadResponse,
  HealthCheckResponse,
  ErrorResponse,
  PaginationMeta,
  DateRangeFilter,
  SearchFilter,
};