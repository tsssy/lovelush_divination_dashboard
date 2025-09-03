// Chat API Mock Responses

export const mockGetAllChatDataResponse = {
  code: 200,
  msg: 'success',
  data: {
    subaccounts: [
      {
        subaccount_id: 'sub_001',
        agent_id: 'agent_67890',
        profile_name: 'Emma Thompson',
        avatar_url: 'https://api.lovelush.com/avatars/sub_001.jpg',
        bio: 'Adventure seeker, coffee lover, always up for good conversation',
        age: 28,
        location: 'Los Angeles, CA',
        preferences: {
          interests: ['travel', 'photography', 'fitness'],
          looking_for: 'casual_dating',
        },
        is_active: true,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-12-15T14:30:00Z',
        total_matches: 45,
        active_matches: 12,
      },
      {
        subaccount_id: 'sub_002',
        agent_id: 'agent_67890',
        profile_name: 'Sophia Martinez',
        avatar_url: 'https://api.lovelush.com/avatars/sub_002.jpg',
        bio: 'Artist and dreamer, love creating beautiful things',
        age: 25,
        location: 'Miami, FL',
        preferences: {
          interests: ['art', 'music', 'dancing'],
          looking_for: 'serious_relationship',
        },
        is_active: true,
        created_at: '2024-10-15T09:30:00Z',
        updated_at: '2024-12-14T16:45:00Z',
        total_matches: 38,
        active_matches: 8,
      },
    ],
    matches: [
      {
        match_id: 'match_001',
        subaccount_id: 'sub_001',
        user_id: 'user_001',
        user_profile: {
          user_id: 'user_001',
          display_name: 'Alex Chen',
          avatar_url: 'https://api.lovelush.com/users/user_001.jpg',
          age: 30,
          location: 'Los Angeles, CA',
          bio: 'Tech entrepreneur, love hiking and good food',
          is_online: true,
          last_seen_at: '2024-12-15T18:30:00Z',
        },
        match_status: 'active',
        last_message: {
          message_id: 'msg_001',
          match_id: 'match_001',
          sender_id: 'user_001',
          sender_type: 'user',
          message_type: 'text',
          content: 'Hey! How was your day?',
          timestamp: '2024-12-15T18:25:00Z',
          is_read: false,
          is_edited: false,
        },
        unread_count: 2,
        created_at: '2024-12-10T14:00:00Z',
        updated_at: '2024-12-15T18:25:00Z',
        last_activity_at: '2024-12-15T18:25:00Z',
      },
    ],
    recent_messages: [
      {
        message_id: 'msg_001',
        match_id: 'match_001',
        sender_id: 'user_001',
        sender_type: 'user',
        message_type: 'text',
        content: 'Hey! How was your day?',
        timestamp: '2024-12-15T18:25:00Z',
        is_read: false,
        read_at: null,
        is_edited: false,
        edited_at: null,
        reply_to: null,
      },
    ],
    unread_counts: {
      'match_001': 2,
      'match_002': 1,
    },
    total_matches: 20,
    active_subaccounts: 2,
  },
};

export const mockGetSubaccountsResponse = {
  code: 200,
  msg: 'success',
  data: {
    subaccounts: [
      {
        id: '1',
        user_id: 'USR001',
        user_name: 'Alice Johnson',
        user_age: 28,
        user_location: 'New York, NY',
        user_occupation: 'Software Engineer',
        user_tags: ['tech', 'travel', 'photography'],
        user_photo_url: [
          'https://images.unsplash.com/photo-1494790108755-2616b612d5b7?w=150',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        ],
        matches: [
          { id: '1', name: 'John Doe', lastMessage: 'Hey there!', timestamp: '2 min ago' },
          { id: '2', name: 'Jane Smith', lastMessage: 'How are you?', timestamp: '5 min ago' }
        ],
        is_active: true,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-12-15T14:30:00Z'
      },
      {
        id: '2',
        user_id: 'USR002',
        user_name: 'Bob Wilson',
        user_age: 32,
        user_location: 'Los Angeles, CA',
        user_occupation: 'Graphic Designer',
        user_tags: ['design', 'art', 'music'],
        user_photo_url: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
        ],
        matches: [
          { id: '3', name: 'Mike Brown', lastMessage: 'Great to meet you', timestamp: '1 hr ago' },
          { id: '4', name: 'Sarah Davis', lastMessage: 'Looking forward to chatting', timestamp: '2 hr ago' }
        ],
        is_active: true,
        created_at: '2024-10-15T09:30:00Z',
        updated_at: '2024-12-14T16:45:00Z'
      },
      {
        id: '3',
        user_id: 'USR003',
        user_name: 'Carol Martinez',
        user_age: 26,
        user_location: 'Chicago, IL',
        user_occupation: 'Marketing Manager',
        user_tags: ['marketing', 'fitness', 'cooking'],
        user_photo_url: [
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
          'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150'
        ],
        matches: [
          { id: '5', name: 'Tom Wilson', lastMessage: 'Thanks for the message', timestamp: '3 hr ago' }
        ],
        is_active: true,
        created_at: '2024-09-20T12:15:00Z',
        updated_at: '2024-12-13T11:20:00Z'
      }
    ],
    pagination: {
      current_page: 1,
      per_page: 20,
      total_pages: 1,
      total_items: 3,
      has_next_page: false,
      has_prev_page: false
    }
  }
};

export const mockCreateSubaccountResponse = {
  code: 200,
  msg: 'success',
  data: {
    subaccount: {
      id: '4',
      user_id: 'USR004',
      user_name: 'Jessica Williams',
      user_age: 26,
      user_location: 'New York, NY',
      user_occupation: 'Product Manager',
      user_tags: ['books', 'yoga', 'technology'],
      user_photo_url: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'],
      matches: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
};

export const mockGetMatchesResponse = {
  code: 200,
  msg: 'success',
  data: {
    matches: [
      {
        match_id: 'match_001',
        subaccount_id: 'sub_001',
        user_id: 'user_001',
        user_profile: {
          user_id: 'user_001',
          display_name: 'Alex Chen',
          avatar_url: 'https://api.lovelush.com/users/user_001.jpg',
          age: 30,
          location: 'Los Angeles, CA',
          bio: 'Tech entrepreneur',
          is_online: true,
          last_seen_at: '2024-12-15T18:30:00Z',
        },
        match_status: 'active',
        unread_count: 2,
        created_at: '2024-12-10T14:00:00Z',
        updated_at: '2024-12-15T18:25:00Z',
        last_activity_at: '2024-12-15T18:25:00Z',
      },
    ],
    pagination: {
      current_page: 1,
      per_page: 20,
      total_pages: 1,
      total_items: 1,
      has_next_page: false,
      has_prev_page: false,
    },
  },
};

export const mockGetMessagesResponse = {
  code: 200,
  msg: 'success',
  data: {
    messages: [
      {
        message_id: 'msg_001',
        match_id: 'match_001',
        sender_id: 'sub_001',
        sender_type: 'subaccount',
        message_type: 'text',
        content: 'Hi! Nice to meet you!',
        timestamp: '2024-12-15T17:00:00Z',
        is_read: true,
        read_at: '2024-12-15T17:05:00Z',
        is_edited: false,
      },
      {
        message_id: 'msg_002',
        match_id: 'match_001',
        sender_id: 'user_001',
        sender_type: 'user',
        message_type: 'text',
        content: 'Hey! How was your day?',
        timestamp: '2024-12-15T18:25:00Z',
        is_read: false,
        is_edited: false,
      },
    ],
    pagination: {
      current_page: 1,
      per_page: 50,
      total_pages: 1,
      total_items: 2,
      has_next_page: false,
      has_prev_page: false,
    },
  },
};

export const mockSendMessageResponse = {
  code: 200,
  msg: 'success',
  data: {
    message: {
      message_id: 'msg_003',
      match_id: 'match_001',
      sender_id: 'sub_001',
      sender_type: 'subaccount',
      message_type: 'text',
      content: 'It was great, thanks for asking! How about yours?',
      timestamp: new Date().toISOString(),
      is_read: false,
      is_edited: false,
    },
  },
};

export const mockUpdateMessageResponse = {
  code: 200,
  msg: 'success',
  data: {
    message: {
      message_id: 'msg_003',
      match_id: 'match_001',
      sender_id: 'sub_001',
      sender_type: 'subaccount',
      message_type: 'text',
      content: 'It was amazing, thanks for asking! How about yours?',
      timestamp: '2024-12-15T18:30:00Z',
      is_read: false,
      is_edited: true,
      edited_at: new Date().toISOString(),
    },
  },
};

export const mockMarkMessagesAsReadResponse = {
  code: 200,
  msg: 'success',
  data: {
    marked_count: 2,
    messages_marked: ['msg_001', 'msg_002'],
    marked_at: new Date().toISOString(),
  },
};

export const mockUpdateMatchInfoResponse = {
  code: 200,
  msg: 'success',
  data: {
    match: {
      match_id: 'match_001',
      subaccount_id: 'sub_001',
      user_id: 'user_001',
      user_profile: {
        user_id: 'user_001',
        display_name: 'Alex Chen',
        avatar_url: 'https://api.lovelush.com/users/user_001.jpg',
        age: 30,
        location: 'Los Angeles, CA',
        bio: 'Tech entrepreneur, love hiking and good food',
        is_online: true,
        last_seen_at: new Date().toISOString(),
      },
      match_status: 'active',
      unread_count: 0,
      created_at: '2024-12-10T14:00:00Z',
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    },
  },
};

export const mockSearchMatchesResponse = {
  code: 200,
  msg: 'success',
  data: {
    matches: [
      {
        match_id: 'match_001',
        subaccount_id: 'sub_001',
        user_id: 'user_001',
        user_profile: {
          user_id: 'user_001',
          display_name: 'Alex Chen',
          avatar_url: 'https://api.lovelush.com/users/user_001.jpg',
          age: 30,
          location: 'Los Angeles, CA',
          bio: 'Tech entrepreneur',
          is_online: true,
          last_seen_at: '2024-12-15T18:30:00Z',
        },
        match_status: 'active',
        unread_count: 0,
        created_at: '2024-12-10T14:00:00Z',
        updated_at: '2024-12-15T18:25:00Z',
        last_activity_at: '2024-12-15T18:25:00Z',
      },
    ],
    pagination: {
      current_page: 1,
      per_page: 20,
      total_pages: 1,
      total_items: 1,
      has_next_page: false,
      has_prev_page: false,
    },
  },
};

export const mockGetChatSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    settings: {
      auto_reply_enabled: false,
      auto_reply_message: '',
      typing_indicators: true,
      read_receipts: true,
      notification_sound: true,
      desktop_notifications: true,
      message_retention_days: 30,
    },
  },
};

export const mockSearchMatchesBySubaccountResponse = {
  code: 200,
  msg: 'success',
  data: {
    matches: [
      {
        match_id: 'match_001',
        subaccount_id: 'sub_001',
        user_id: 'user_001',
        user_profile: {
          user_id: 'user_001',
          display_name: 'Alex Chen',
          avatar_url: 'https://api.lovelush.com/users/user_001.jpg',
          age: 30,
          location: 'Los Angeles, CA',
          bio: 'Tech entrepreneur',
          is_online: true,
          last_seen_at: '2024-12-15T18:30:00Z',
        },
        match_status: 'active',
        last_message: {
          content: 'Hey there! How are you?',
          timestamp: '2024-12-15T18:20:00Z'
        },
        unread_count: 0,
        created_at: '2024-12-10T14:00:00Z',
        updated_at: '2024-12-15T18:25:00Z',
        last_activity_at: '2024-12-15T18:25:00Z',
      },
    ],
    pagination: {
      current_page: 1,
      per_page: 20,
      total_pages: 1,
      total_items: 1,
      has_next_page: false,
      has_prev_page: false,
    },
    search_query: '',
    subaccount_id: '',
  },
};

export const mockUpdateChatSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    settings: {
      auto_reply_enabled: true,
      auto_reply_message: 'Thanks for your message! I\'ll get back to you soon.',
      typing_indicators: true,
      read_receipts: true,
      notification_sound: true,
      desktop_notifications: true,
      message_retention_days: 30,
    },
    updated_at: new Date().toISOString(),
  },
};

export default {
  // Chat API endpoint mappings
  'GET_/chat/all': mockGetAllChatDataResponse,
  'GET_/chat/subaccounts': mockGetSubaccountsResponse,
  'POST_/chat/subaccounts': mockCreateSubaccountResponse,
  'PUT_/chat/subaccounts': { code: 200, msg: 'success', data: { updated: true } }, // Generic update response
  'GET_/chat/matches': mockGetMatchesResponse,
  'GET_/chat/messages': mockGetMessagesResponse, // This will handle /chat/messages/{match_id}
  'POST_/chat/messages': mockSendMessageResponse, // This will handle /chat/messages/{match_id}
  'PUT_/chat/messages/update': mockUpdateMessageResponse,
  'DELETE_/chat/messages': { code: 200, msg: 'Message deleted successfully', data: { deleted: true } },
  'POST_/chat/messages/mark-read': mockMarkMessagesAsReadResponse,
  'GET_/chat/match-info': mockUpdateMatchInfoResponse,
  'GET_/chat/user-info': mockUpdateMatchInfoResponse, // Reuse match info for user info
  'POST_/chat/matches/search': mockSearchMatchesBySubaccountResponse, // Only subaccount search
  'GET_/chat/settings': mockGetChatSettingsResponse,
  'PUT_/chat/settings': mockUpdateChatSettingsResponse,
  
  // Legacy exports for backward compatibility
  mockGetAllChatDataResponse,
  mockGetSubaccountsResponse,
  mockCreateSubaccountResponse,
  mockGetMatchesResponse,
  mockGetMessagesResponse,
  mockSendMessageResponse,
  mockUpdateMessageResponse,
  mockMarkMessagesAsReadResponse,
  mockUpdateMatchInfoResponse,
  mockSearchMatchesBySubaccountResponse,
  mockGetChatSettingsResponse,
  mockUpdateChatSettingsResponse,
};