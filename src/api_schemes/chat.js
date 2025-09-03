// Chat API Schemes - Request/response structures for chat functionality

// Get all chat data response
export const GetAllChatDataResponse = {
  code: 200,
  msg: 'success',
  data: {
    subaccounts: [], // array of SubaccountSchema
    matches: [], // array of MatchSchema
    recent_messages: [], // array of MessageSchema
    unread_counts: {}, // object with match_id as key and count as value
    total_matches: 0, // number
    active_subaccounts: 0, // number
  },
};

// Subaccount schemes
export const SubaccountSchema = {
  subaccount_id: '', // string
  agent_id: '', // string
  profile_name: '', // string
  avatar_url: '', // string
  bio: '', // string
  age: 0, // number
  location: '', // string
  preferences: {}, // object
  is_active: true, // boolean
  created_at: '', // string - ISO date
  updated_at: '', // string - ISO date
  total_matches: 0, // number
  active_matches: 0, // number
};

export const CreateSubaccountRequest = {
  profile_name: '', // string
  avatar_url: '', // string (optional)
  bio: '', // string (optional)
  age: 0, // number
  location: '', // string (optional)
  preferences: {}, // object (optional)
};

export const UpdateSubaccountRequest = {
  profile_name: '', // string (optional)
  avatar_url: '', // string (optional)
  bio: '', // string (optional)
  age: 0, // number (optional)
  location: '', // string (optional)
  preferences: {}, // object (optional)
  is_active: true, // boolean (optional)
};

// Match schemes
export const MatchSchema = {
  match_id: '', // string
  subaccount_id: '', // string
  user_id: '', // string
  user_profile: {}, // UserProfileSchema
  match_status: '', // string - 'active', 'paused', 'ended'
  last_message: {}, // MessageSchema (optional)
  unread_count: 0, // number
  created_at: '', // string - ISO date
  updated_at: '', // string - ISO date
  last_activity_at: '', // string - ISO date
};

export const UserProfileSchema = {
  user_id: '', // string
  display_name: '', // string
  avatar_url: '', // string
  age: 0, // number
  location: '', // string
  bio: '', // string
  is_online: false, // boolean
  last_seen_at: '', // string - ISO date
};

export const GetMatchesResponse = {
  code: 200,
  msg: 'success',
  data: {
    matches: [], // array of MatchSchema
    pagination: {}, // PaginationMeta
  },
};

// Message schemes
export const MessageSchema = {
  message_id: '', // string
  match_id: '', // string
  sender_id: '', // string - subaccount_id or user_id
  sender_type: '', // string - 'subaccount' or 'user'
  message_type: '', // string - 'text', 'image', 'gif', 'sticker'
  content: '', // string - message content
  media_url: '', // string (optional) - for images/gifs
  timestamp: '', // string - ISO date
  is_read: false, // boolean
  read_at: '', // string - ISO date (optional)
  is_edited: false, // boolean
  edited_at: '', // string - ISO date (optional)
  reply_to: '', // string - message_id (optional)
};

export const GetMessagesResponse = {
  code: 200,
  msg: 'success',
  data: {
    messages: [], // array of MessageSchema
    pagination: {}, // PaginationMeta
  },
};

export const SendMessageRequest = {
  message_type: 'text', // string - 'text', 'image', 'gif', 'sticker'
  content: '', // string
  media_url: '', // string (optional)
  reply_to: '', // string - message_id (optional)
};

export const SendMessageResponse = {
  code: 200,
  msg: 'success',
  data: {
    message: {}, // MessageSchema
  },
};

export const UpdateMessageRequest = {
  content: '', // string
};

export const MarkMessagesAsReadRequest = {
  message_ids: [], // array of strings
};

// Match info update (from soketi)
export const UpdateMatchInfoResponse = {
  code: 200,
  msg: 'success',
  data: {
    match: {}, // MatchSchema
  },
};

export const UpdateUserInfoResponse = {
  code: 200,
  msg: 'success',
  data: {
    user: {}, // UserProfileSchema
  },
};

// Search matches
export const SearchMatchesRequest = {
  query: '', // string
  filters: {
    status: '', // string (optional)
    subaccount_id: '', // string (optional)
    has_unread: false, // boolean (optional)
    date_range: {}, // DateRangeFilter (optional)
  },
  page: 1, // number (optional)
  limit: 20, // number (optional)
};

export const SearchMatchesResponse = {
  code: 200,
  msg: 'success',
  data: {
    matches: [], // array of MatchSchema
    pagination: {}, // PaginationMeta
  },
};

// Chat settings schemes
export const ChatSettingsSchema = {
  auto_reply_enabled: false, // boolean
  auto_reply_message: '', // string
  typing_indicators: true, // boolean
  read_receipts: true, // boolean
  notification_sound: true, // boolean
  desktop_notifications: true, // boolean
  message_retention_days: 30, // number
};

export const GetChatSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    settings: {}, // ChatSettingsSchema
  },
};

export const UpdateChatSettingsRequest = {
  auto_reply_enabled: false, // boolean (optional)
  auto_reply_message: '', // string (optional)
  typing_indicators: true, // boolean (optional)
  read_receipts: true, // boolean (optional)
  notification_sound: true, // boolean (optional)
  desktop_notifications: true, // boolean (optional)
  message_retention_days: 30, // number (optional)
};

export default {
  GetAllChatDataResponse,
  SubaccountSchema,
  CreateSubaccountRequest,
  UpdateSubaccountRequest,
  MatchSchema,
  UserProfileSchema,
  GetMatchesResponse,
  MessageSchema,
  GetMessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
  UpdateMessageRequest,
  MarkMessagesAsReadRequest,
  UpdateMatchInfoResponse,
  UpdateUserInfoResponse,
  SearchMatchesRequest,
  SearchMatchesResponse,
  ChatSettingsSchema,
  GetChatSettingsResponse,
  UpdateChatSettingsRequest,
};