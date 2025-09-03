// Campaign API Schemes - Request/response structures for in-app campaign management

// Campaign schema
export const CampaignSchema = {
  campaign_id: '', // string
  name: '', // string
  description: '', // string
  type: 'notification', // string - 'notification', 'banner', 'popup', 'email'
  status: 'draft', // string - 'draft', 'active', 'paused', 'completed', 'archived'
  priority: 'medium', // string - 'low', 'medium', 'high', 'urgent'
  content: {
    title: '', // string
    body: '', // string
    image_url: '', // string (optional)
    action_button: {
      text: '', // string (optional)
      url: '', // string (optional)
      action: '', // string (optional) - 'open_url', 'deep_link', 'dismiss'
    },
    style: {}, // object - styling configuration
  },
  targeting: {
    user_segments: [], // array of strings
    location_filters: [], // array of strings
    age_range: {
      min: 18, // number (optional)
      max: 65, // number (optional)
    },
    gender_filter: [], // array of strings (optional)
    device_types: [], // array of strings (optional)
    custom_filters: {}, // object (optional)
  },
  schedule: {
    start_date: '', // string - ISO date
    end_date: '', // string - ISO date (optional)
    timezone: 'UTC', // string
    delivery_time: {
      hour: 12, // number (0-23) (optional)
      minute: 0, // number (0-59) (optional)
    },
    frequency: 'once', // string - 'once', 'daily', 'weekly', 'monthly'
    max_deliveries: 1, // number (optional)
  },
  analytics: {
    sent_count: 0, // number
    delivered_count: 0, // number
    opened_count: 0, // number
    clicked_count: 0, // number
    conversion_count: 0, // number
    delivery_rate: 0.0, // number (percentage)
    open_rate: 0.0, // number (percentage)
    click_rate: 0.0, // number (percentage)
    conversion_rate: 0.0, // number (percentage)
  },
  created_at: '', // string - ISO date
  updated_at: '', // string - ISO date
  created_by: '', // string - agent_id
  updated_by: '', // string - agent_id
};

// Get all campaigns response
export const GetAllCampaignsResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaigns: [], // array of CampaignSchema
    total_campaigns: 0, // number
    active_campaigns: 0, // number
    draft_campaigns: 0, // number
    completed_campaigns: 0, // number
    campaign_types: [], // array of strings - available campaign types
    user_segments: [], // array of strings - available user segments
  },
};

// Upsert campaign request (create or update)
export const UpsertCampaignRequest = {
  campaign_id: '', // string (optional, for updates)
  name: '', // string
  description: '', // string (optional)
  type: 'notification', // string
  priority: 'medium', // string (optional)
  content: {
    title: '', // string
    body: '', // string
    image_url: '', // string (optional)
    action_button: {
      text: '', // string (optional)
      url: '', // string (optional)
      action: '', // string (optional)
    },
    style: {}, // object (optional)
  },
  targeting: {
    user_segments: [], // array of strings (optional)
    location_filters: [], // array of strings (optional)
    age_range: {
      min: 18, // number (optional)
      max: 65, // number (optional)
    },
    gender_filter: [], // array of strings (optional)
    device_types: [], // array of strings (optional)
    custom_filters: {}, // object (optional)
  },
  schedule: {
    start_date: '', // string - ISO date (optional)
    end_date: '', // string - ISO date (optional)
    timezone: 'UTC', // string (optional)
    delivery_time: {
      hour: 12, // number (optional)
      minute: 0, // number (optional)
    },
    frequency: 'once', // string (optional)
    max_deliveries: 1, // number (optional)
  },
};

export const UpsertCampaignResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign: {}, // CampaignSchema
    is_new: true, // boolean - true if created, false if updated
  },
};

// Campaign status update
export const UpdateCampaignStatusRequest = {
  status: 'active', // string - 'draft', 'active', 'paused', 'completed', 'archived'
};

export const UpdateCampaignStatusResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign_id: '', // string
    old_status: '', // string
    new_status: '', // string
    updated_at: '', // string - ISO date
  },
};

// Campaign scheduling
export const ScheduleCampaignRequest = {
  start_date: '', // string - ISO date
  end_date: '', // string - ISO date (optional)
  timezone: 'UTC', // string (optional)
  delivery_time: {
    hour: 12, // number (optional)
    minute: 0, // number (optional)
  },
  frequency: 'once', // string (optional)
  max_deliveries: 1, // number (optional)
};

export const ScheduleCampaignResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign_id: '', // string
    schedule: {}, // schedule object
    next_delivery: '', // string - ISO date (optional)
  },
};

// Campaign analytics
export const GetCampaignAnalyticsRequest = {
  start_date: '', // string - ISO date (optional)
  end_date: '', // string - ISO date (optional)
  granularity: 'day', // string (optional) - 'hour', 'day', 'week', 'month'
};

export const GetCampaignAnalyticsResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign_id: '', // string
    analytics: {}, // analytics object from CampaignSchema
    time_series: [], // array of time-based analytics data
    demographic_breakdown: {}, // object with demographic analysis
    device_breakdown: {}, // object with device type analysis
  },
};

// Campaign targeting
export const UpdateCampaignTargetingRequest = {
  user_segments: [], // array of strings (optional)
  location_filters: [], // array of strings (optional)
  age_range: {
    min: 18, // number (optional)
    max: 65, // number (optional)
  },
  gender_filter: [], // array of strings (optional)
  device_types: [], // array of strings (optional)
  custom_filters: {}, // object (optional)
};

export const UpdateCampaignTargetingResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign_id: '', // string
    targeting: {}, // targeting object
    estimated_audience_size: 0, // number
  },
};

// Campaign templates
export const CampaignTemplateSchema = {
  template_id: '', // string
  name: '', // string
  description: '', // string
  type: 'notification', // string
  content_template: {}, // object - template structure for content
  default_targeting: {}, // object - default targeting settings
  created_at: '', // string - ISO date
};

export const GetCampaignTemplatesResponse = {
  code: 200,
  msg: 'success',
  data: {
    templates: [], // array of CampaignTemplateSchema
  },
};

export const CreateCampaignFromTemplateRequest = {
  name: '', // string
  customizations: {}, // object - overrides for template defaults
};

export const CreateCampaignFromTemplateResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign: {}, // CampaignSchema
  },
};

// Bulk operations
export const BulkUpdateCampaignsRequest = {
  campaigns: [], // array of objects with campaign_id and update data
};

export const BulkUpdateCampaignsResponse = {
  code: 200,
  msg: 'success',
  data: {
    updated_campaigns: [], // array of CampaignSchema
    failed_updates: [], // array of error objects
  },
};

export const BulkDeleteCampaignsRequest = {
  campaign_ids: [], // array of strings
};

export const BulkDeleteCampaignsResponse = {
  code: 200,
  msg: 'success',
  data: {
    deleted_count: 0, // number
    failed_deletions: [], // array of error objects
  },
};

// Campaign search
export const SearchCampaignsRequest = {
  query: '', // string
  status: '', // string (optional)
  type: '', // string (optional)
  priority: '', // string (optional)
  date_range: {
    start_date: '', // string - ISO date (optional)
    end_date: '', // string - ISO date (optional)
  },
  created_by: '', // string - agent_id (optional)
  sort_by: 'created_at', // string (optional)
  sort_order: 'desc', // string (optional)
  page: 1, // number (optional)
  limit: 20, // number (optional)
};

export const SearchCampaignsResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaigns: [], // array of CampaignSchema
    pagination: {}, // PaginationMeta
    filters_applied: {}, // object
  },
};

export default {
  CampaignSchema,
  GetAllCampaignsResponse,
  UpsertCampaignRequest,
  UpsertCampaignResponse,
  UpdateCampaignStatusRequest,
  UpdateCampaignStatusResponse,
  ScheduleCampaignRequest,
  ScheduleCampaignResponse,
  GetCampaignAnalyticsRequest,
  GetCampaignAnalyticsResponse,
  UpdateCampaignTargetingRequest,
  UpdateCampaignTargetingResponse,
  CampaignTemplateSchema,
  GetCampaignTemplatesResponse,
  CreateCampaignFromTemplateRequest,
  CreateCampaignFromTemplateResponse,
  BulkUpdateCampaignsRequest,
  BulkUpdateCampaignsResponse,
  BulkDeleteCampaignsRequest,
  BulkDeleteCampaignsResponse,
  SearchCampaignsRequest,
  SearchCampaignsResponse,
};