// Settings API Mock Responses

// New App Settings Mock Responses (based on Figma design)
export const mockGetAppSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    app_settings: {
      cost_per_message: 10,
      initial_free_matches: 5,
      daily_free_matches: 3,
      match_cost_in_coins: 5,
      initial_free_coins: 100,
      updated_at: '2024-12-10T15:30:00Z',
      updated_by: 'agent_67890',
    },
  },
};

export const mockUpdateAppSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    app_settings: {
      cost_per_message: 15,
      initial_free_matches: 7,
      daily_free_matches: 4,
      match_cost_in_coins: 6,
      initial_free_coins: 120,
      updated_at: new Date().toISOString(),
      updated_by: 'agent_67890',
    },
    updated_fields: ['cost_per_message', 'initial_free_matches', 'daily_free_matches', 'match_cost_in_coins', 'initial_free_coins'],
    updated_at: new Date().toISOString(),
  },
};

export const mockResetAppSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    app_settings: {
      cost_per_message: 10,
      initial_free_matches: 5,
      daily_free_matches: 3,
      match_cost_in_coins: 5,
      initial_free_coins: 100,
      updated_at: new Date().toISOString(),
      updated_by: 'agent_67890',
    },
    reset_at: new Date().toISOString(),
    message: 'Settings reset to default values successfully',
  },
};

export const mockValidateAppSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    is_valid: true,
    validation_errors: [],
    warnings: [],
    validated_at: new Date().toISOString(),
  },
};

export const mockValidateAppSettingsErrorResponse = {
  code: 400,
  msg: 'validation_failed',
  data: {
    is_valid: false,
    validation_errors: [
      {
        field: 'cost_per_message',
        message: 'Value must be between 1 and 1000',
        current_value: 1500,
        allowed_range: { min: 1, max: 1000 },
      },
      {
        field: 'initial_free_coins',
        message: 'Value cannot be negative',
        current_value: -50,
        allowed_range: { min: 0, max: 1000 },
      },
    ],
    warnings: [
      {
        field: 'match_cost_in_coins',
        message: 'High match cost may reduce user engagement',
        current_value: 25,
        recommendation: 'Consider keeping below 10 for better retention',
      },
    ],
    validated_at: new Date().toISOString(),
  },
};

export const mockGetSettingsHistoryResponse = {
  code: 200,
  msg: 'success',
  data: {
    history: [
      {
        history_id: 'hist_001',
        field_name: 'cost_per_message',
        old_value: 8,
        new_value: 10,
        changed_by: 'agent_67890',
        changed_at: '2024-12-15T14:30:00Z',
        reason: 'Increase revenue per message',
      },
      {
        history_id: 'hist_002',
        field_name: 'initial_free_coins',
        old_value: 80,
        new_value: 100,
        changed_by: 'agent_67890',
        changed_at: '2024-12-10T10:15:00Z',
        reason: 'Improve new user onboarding experience',
      },
      {
        history_id: 'hist_003',
        field_name: 'daily_free_matches',
        old_value: 2,
        new_value: 3,
        changed_by: 'agent_67890',
        changed_at: '2024-12-05T16:20:00Z',
        reason: 'Increase daily engagement',
      },
    ],
    pagination: {
      current_page: 1,
      per_page: 20,
      total_pages: 1,
      total_items: 3,
      has_next_page: false,
      has_prev_page: false,
    },
  },
};

export const mockGetSettingsImpactAnalysisResponse = {
  code: 200,
  msg: 'success',
  data: {
    current_settings: {
      cost_per_message: 10,
      initial_free_matches: 5,
      daily_free_matches: 3,
      match_cost_in_coins: 5,
      initial_free_coins: 100,
    },
    proposed_changes: {
      cost_per_message: 15,
      match_cost_in_coins: 8,
    },
    impact_analysis: {
      estimated_user_impact: 24567,
      revenue_impact_estimate: 12.5,
      engagement_impact_estimate: -8.2,
      recommendations: [
        'Gradual implementation over 2-3 weeks to minimize user shock',
        'Consider offering temporary promotional bonuses during transition',
        'Monitor user retention metrics closely for first 30 days',
        'Prepare customer support for increased pricing inquiries',
        'Consider A/B testing with subset of users first',
      ],
    },
    analyzed_at: new Date().toISOString(),
  },
};

// Legacy Settings Mock Responses (for backward compatibility)
export const mockGetAllSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    settings: {
      account_settings: {
        profile: {
          display_name: 'Sarah Johnson',
          email: 'agent@lovelush.com',
          avatar_url: 'https://api.lovelush.com/avatars/agent_67890.jpg',
          timezone: 'America/Los_Angeles',
          language: 'en',
          date_format: 'MM/DD/YYYY',
          time_format: '12h',
        },
        security: {
          two_factor_enabled: true,
          session_timeout: 7200,
          password_expiry_days: 90,
          login_notifications: true,
        },
        preferences: {
          auto_save: true,
          compact_mode: false,
          show_tooltips: true,
          keyboard_shortcuts: true,
        },
      },
      notification_settings: {
        email_notifications: {
          new_messages: true,
          new_matches: true,
          system_alerts: true,
          marketing_emails: false,
          weekly_summary: true,
        },
        desktop_notifications: {
          enabled: true,
          sound_enabled: true,
          badge_count: true,
          show_preview: true,
        },
        mobile_notifications: {
          push_enabled: true,
          sound_enabled: true,
          vibration_enabled: true,
          quiet_hours: {
            enabled: true,
            start_time: '22:00',
            end_time: '08:00',
          },
        },
      },
      privacy_settings: {
        profile_visibility: {
          public_profile: false,
          show_online_status: true,
          show_last_seen: true,
        },
        data_collection: {
          analytics_tracking: true,
          usage_statistics: true,
          crash_reporting: true,
          marketing_tracking: false,
        },
        communication: {
          allow_direct_messages: true,
          auto_accept_matches: false,
          block_inappropriate_content: true,
        },
      },
    },
  },
};

export const mockUpdateSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    settings: {
      account_settings: {
        profile: {
          display_name: 'Sarah Johnson',
          email: 'agent@lovelush.com',
          avatar_url: 'https://api.lovelush.com/avatars/agent_67890.jpg',
          timezone: 'America/New_York',
          language: 'en',
          date_format: 'YYYY-MM-DD',
          time_format: '24h',
        },
        security: {
          two_factor_enabled: true,
          session_timeout: 3600,
          password_expiry_days: 60,
          login_notifications: true,
        },
        preferences: {
          auto_save: true,
          compact_mode: true,
          show_tooltips: false,
          keyboard_shortcuts: true,
        },
      },
    },
    updated_sections: ['account_settings'],
  },
};

export const mockGetAccountSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    account_settings: {
      profile: {
        display_name: 'Sarah Johnson',
        email: 'agent@lovelush.com',
        avatar_url: 'https://api.lovelush.com/avatars/agent_67890.jpg',
        timezone: 'America/Los_Angeles',
        language: 'en',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
      },
      security: {
        two_factor_enabled: true,
        session_timeout: 7200,
        password_expiry_days: 90,
        login_notifications: true,
      },
      preferences: {
        auto_save: true,
        compact_mode: false,
        show_tooltips: true,
        keyboard_shortcuts: true,
      },
    },
  },
};

export const mockGetNotificationSettingsResponse = {
  code: 200,
  msg: 'success',
  data: {
    notification_settings: {
      email_notifications: {
        new_messages: true,
        new_matches: true,
        system_alerts: true,
        marketing_emails: false,
        weekly_summary: true,
      },
      desktop_notifications: {
        enabled: true,
        sound_enabled: true,
        badge_count: true,
        show_preview: true,
      },
      mobile_notifications: {
        push_enabled: true,
        sound_enabled: true,
        vibration_enabled: true,
        quiet_hours: {
          enabled: true,
          start_time: '22:00',
          end_time: '08:00',
        },
      },
    },
  },
};

export default {
  // Settings API endpoint mappings
  'GET_/settings/app': mockGetAppSettingsResponse,
  'PUT_/settings/app': mockUpdateAppSettingsResponse,
  'POST_/settings/app/reset': mockResetAppSettingsResponse,
  'POST_/settings/app/validate': mockValidateAppSettingsResponse,
  'GET_/settings/app/history': mockGetSettingsHistoryResponse,
  'POST_/settings/app/impact-analysis': mockGetSettingsImpactAnalysisResponse,
  
  // Legacy settings endpoints (for backward compatibility)
  'GET_/settings/all': mockGetAllSettingsResponse,
  'PUT_/settings': mockUpdateSettingsResponse,
  'GET_/settings/account': mockGetAccountSettingsResponse,
  'PUT_/settings/account': mockGetAccountSettingsResponse, // Reuse for updates
  'GET_/settings/notifications': mockGetNotificationSettingsResponse,
  'PUT_/settings/notifications': mockGetNotificationSettingsResponse, // Reuse for updates
  'GET_/settings/privacy': mockGetAccountSettingsResponse, // Reuse account settings
  'PUT_/settings/privacy': mockGetAccountSettingsResponse,
  'GET_/settings/integrations': mockGetAccountSettingsResponse, // Reuse account settings
  'PUT_/settings/integrations': mockGetAccountSettingsResponse,
  'GET_/settings/api-keys': { code: 200, msg: 'success', data: { api_keys: [] } },
  'POST_/settings/api-keys': { code: 200, msg: 'success', data: { api_key: 'new_key_123' } },
  'PUT_/settings/api-keys': { code: 200, msg: 'success', data: { updated: true } },
  'DELETE_/settings/api-keys': { code: 200, msg: 'success', data: { deleted: true } },
  'GET_/settings/webhooks': { code: 200, msg: 'success', data: { webhooks: [] } },
  'POST_/settings/webhooks': { code: 200, msg: 'success', data: { webhook: 'webhook_123' } },
  'PUT_/settings/webhooks': { code: 200, msg: 'success', data: { updated: true } },
  'DELETE_/settings/webhooks': { code: 200, msg: 'success', data: { deleted: true } },
  'POST_/settings/webhooks/test': { code: 200, msg: 'success', data: { test_result: 'ok' } },
  'GET_/settings/theme': mockGetAccountSettingsResponse, // Reuse account settings
  'PUT_/settings/theme': mockGetAccountSettingsResponse,
  'GET_/settings/export': { code: 200, msg: 'success', data: { export_url: 'https://api.example.com/exports/settings.json' } },
  'POST_/settings/import': { code: 200, msg: 'success', data: { imported: true } },
  
  // Legacy exports for backward compatibility
  mockGetAppSettingsResponse,
  mockUpdateAppSettingsResponse,
  mockResetAppSettingsResponse,
  mockValidateAppSettingsResponse,
  mockValidateAppSettingsErrorResponse,
  mockGetSettingsHistoryResponse,
  mockGetSettingsImpactAnalysisResponse,
  mockGetAllSettingsResponse,
  mockUpdateSettingsResponse,
  mockGetAccountSettingsResponse,
  mockGetNotificationSettingsResponse,
};