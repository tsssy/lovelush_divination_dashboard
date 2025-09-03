// Settings API Schemes - Request/response structures for settings management

// App Settings schema (new structure based on Figma design)
export const AppSettingsSchema = {
  cost_per_message: 10, // number - coins needed to send a message
  initial_free_matches: 5, // number - free matches for new users
  daily_free_matches: 3, // number - daily free matches allocation
  match_cost_in_coins: 5, // number - coins needed to create a match/swipe
  initial_free_coins: 100, // number - free coins for new users
  updated_at: '', // string - ISO date
  updated_by: '', // string - agent_id
};

// Get all settings response
export const GetAllSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    app_settings: {}, // AppSettingsSchema
  },
};

// Update settings request
export const UpdateSettingsRequest = {
  cost_per_message: 10, // number (optional)
  initial_free_matches: 5, // number (optional)
  daily_free_matches: 3, // number (optional)
  match_cost_in_coins: 5, // number (optional)
  initial_free_coins: 100, // number (optional)
};

export const UpdateSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    app_settings: {}, // AppSettingsSchema
    updated_fields: [], // array of strings - which fields were updated
    updated_at: '', // string - ISO date
  },
};

// Reset settings to defaults
export const ResetSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    app_settings: {}, // AppSettingsSchema with default values
    reset_at: '', // string - ISO date
    message: 'Settings reset to default values successfully',
  },
};

// Settings validation schema
export const SettingsValidationRules = {
  cost_per_message: {
    min: 1,
    max: 1000,
    type: 'integer',
  },
  initial_free_matches: {
    min: 0,
    max: 50,
    type: 'integer',
  },
  daily_free_matches: {
    min: 0,
    max: 20,
    type: 'integer',
  },
  match_cost_in_coins: {
    min: 1,
    max: 100,
    type: 'integer',
  },
  initial_free_coins: {
    min: 0,
    max: 1000,
    type: 'integer',
  },
};

// Settings history schema
export const SettingsHistorySchema = {
  history_id: '', // string
  field_name: '', // string
  old_value: 0, // number
  new_value: 0, // number
  changed_by: '', // string - agent_id
  changed_at: '', // string - ISO date
  reason: '', // string (optional)
};

export const GetSettingsHistoryResponse = {
  code: 200,
  msg: 'success',
  data: {
    history: [], // array of SettingsHistorySchema
    pagination: {}, // PaginationMeta
  },
};

// Settings impact analysis
export const SettingsImpactAnalysis = {
  estimated_user_impact: 0, // number - users affected
  revenue_impact_estimate: 0.0, // number - estimated revenue change percentage
  engagement_impact_estimate: 0.0, // number - estimated engagement change percentage
  recommendations: [], // array of strings - suggested considerations
};

export const GetSettingsImpactResponse = {
  code: 200,
  msg: 'success',
  data: {
    current_settings: {}, // AppSettingsSchema
    proposed_changes: {}, // partial AppSettingsSchema
    impact_analysis: {}, // SettingsImpactAnalysis
    analyzed_at: '', // string - ISO date
  },
};

// Legacy settings structures (for backward compatibility)
export const LegacySettingsSchema = {
  account_settings: {
    profile: {
      display_name: '', // string
      email: '', // string
      avatar_url: '', // string
      timezone: 'UTC', // string
      language: 'en', // string
      date_format: 'YYYY-MM-DD', // string
      time_format: '24h', // string - '12h' or '24h'
    },
    security: {
      two_factor_enabled: false, // boolean
      session_timeout: 3600, // number - seconds
      password_expiry_days: 90, // number
      login_notifications: true, // boolean
    },
    preferences: {
      auto_save: true, // boolean
      compact_mode: false, // boolean
      show_tooltips: true, // boolean
      keyboard_shortcuts: true, // boolean
    },
  },
  notification_settings: {
    email_notifications: {
      new_messages: true, // boolean
      new_matches: true, // boolean
      system_alerts: true, // boolean
      marketing_emails: false, // boolean
      weekly_summary: true, // boolean
    },
    desktop_notifications: {
      enabled: true, // boolean
      sound_enabled: true, // boolean
      badge_count: true, // boolean
      show_preview: true, // boolean
    },
    mobile_notifications: {
      push_enabled: true, // boolean
      sound_enabled: true, // boolean
      vibration_enabled: true, // boolean
      quiet_hours: {
        enabled: false, // boolean
        start_time: '22:00', // string
        end_time: '08:00', // string
      },
    },
  },
  privacy_settings: {
    profile_visibility: {
      public_profile: false, // boolean
      show_online_status: true, // boolean
      show_last_seen: true, // boolean
    },
    data_collection: {
      analytics_tracking: true, // boolean
      usage_statistics: true, // boolean
      crash_reporting: true, // boolean
      marketing_tracking: false, // boolean
    },
    communication: {
      allow_direct_messages: true, // boolean
      auto_accept_matches: false, // boolean
      block_inappropriate_content: true, // boolean
    },
  },
};

export default {
  AppSettingsSchema,
  GetAllSettingsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  ResetSettingsResponse,
  SettingsValidationRules,
  SettingsHistorySchema,
  GetSettingsHistoryResponse,
  SettingsImpactAnalysis,
  GetSettingsImpactResponse,
  LegacySettingsSchema,
};