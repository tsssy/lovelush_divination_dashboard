// Statistics API Schemes - Request/response structures for statistics and analytics

// Statistics card schema
export const StatisticsCardSchema = {
  card_id: '', // string
  title: '', // string
  type: 'number', // string - 'number', 'percentage', 'currency', 'chart'
  category: 'overview', // string - 'overview', 'revenue', 'users', 'engagement'
  value: 0, // number - current value
  previous_value: 0, // number - previous period value
  change: 0.0, // number - percentage change
  change_direction: 'up', // string - 'up', 'down', 'neutral'
  trend_data: [], // array of numbers - for mini charts
  unit: '', // string - unit of measurement
  format: 'number', // string - how to display the value
  description: '', // string - additional context
  updated_at: '', // string - ISO date
};

// Dashboard statistics schema
export const DashboardStatsSchema = {
  overview_cards: [], // array of StatisticsCardSchema
  revenue_cards: [], // array of StatisticsCardSchema
  user_cards: [], // array of StatisticsCardSchema
  engagement_cards: [], // array of StatisticsCardSchema
  quick_stats: {
    total_revenue: 0.00, // number
    total_users: 0, // number
    active_sessions: 0, // number
    conversion_rate: 0.0, // number (percentage)
  },
  time_range: {
    start_date: '', // string - ISO date
    end_date: '', // string - ISO date
    period: 'last_30_days', // string
  },
};

// Chart data schema
export const ChartDataSchema = {
  labels: [], // array of strings - x-axis labels
  datasets: [
    {
      label: '', // string
      data: [], // array of numbers
      backgroundColor: '', // string - color
      borderColor: '', // string - color
      fill: false, // boolean
    },
  ],
  options: {}, // object - chart configuration
};

// Get all statistics response
export const GetAllStatisticsResponse = {
  code: 200,
  msg: 'success',
  data: {
    dashboard_stats: {}, // DashboardStatsSchema
    polling_frequency: 300000, // number - milliseconds
    last_updated: '', // string - ISO date
    data_freshness: 'real-time', // string - 'real-time', 'near-real-time', 'batch'
  },
};

// Upsert statistics request
export const UpsertStatisticsRequest = {
  cards: [], // array of partial StatisticsCardSchema
  quick_stats: {}, // object (optional)
  custom_metrics: [], // array of custom metric objects (optional)
};

export const UpsertStatisticsResponse = {
  code: 200,
  msg: 'success',
  data: {
    updated_cards: [], // array of StatisticsCardSchema
    created_cards: [], // array of StatisticsCardSchema
    updated_at: '', // string - ISO date
  },
};

// Revenue statistics
export const RevenueStatsRequest = {
  start_date: '', // string - ISO date (optional)
  end_date: '', // string - ISO date (optional)
  granularity: 'day', // string - 'hour', 'day', 'week', 'month'
  currency: 'USD', // string (optional)
  breakdown_by: [], // array of strings - 'product', 'channel', 'region' (optional)
};

export const RevenueStatsResponse = {
  code: 200,
  msg: 'success',
  data: {
    total_revenue: 0.00, // number
    revenue_change: 0.0, // number (percentage)
    revenue_by_period: [], // array of {period: string, amount: number}
    top_products: [], // array of product revenue data
    revenue_channels: [], // array of channel revenue data
    currency: 'USD', // string
    chart_data: {}, // ChartDataSchema
  },
};

// User statistics
export const UserStatsRequest = {
  start_date: '', // string - ISO date (optional)
  end_date: '', // string - ISO date (optional)
  granularity: 'day', // string (optional)
  user_type: 'all', // string - 'all', 'new', 'returning', 'active' (optional)
};

export const UserStatsResponse = {
  code: 200,
  msg: 'success',
  data: {
    total_users: 0, // number
    new_users: 0, // number
    active_users: 0, // number
    returning_users: 0, // number
    user_growth_rate: 0.0, // number (percentage)
    user_retention_rate: 0.0, // number (percentage)
    users_by_period: [], // array of {period: string, count: number}
    demographic_breakdown: {
      age_groups: [], // array of age group data
      gender_distribution: [], // array of gender data
      location_distribution: [], // array of location data
    },
    chart_data: {}, // ChartDataSchema
  },
};

// Engagement statistics
export const EngagementStatsRequest = {
  start_date: '', // string - ISO date (optional)
  end_date: '', // string - ISO date (optional)
  metrics: [], // array of strings - specific metrics to include (optional)
};

export const EngagementStatsResponse = {
  code: 200,
  msg: 'success',
  data: {
    session_duration: {
      average: 0, // number - seconds
      median: 0, // number - seconds
      change: 0.0, // number (percentage)
    },
    page_views: {
      total: 0, // number
      unique: 0, // number
      change: 0.0, // number (percentage)
    },
    bounce_rate: 0.0, // number (percentage)
    interaction_rate: 0.0, // number (percentage)
    most_popular_pages: [], // array of page data
    user_journey: [], // array of journey step data
    chart_data: {}, // ChartDataSchema
  },
};

// Conversion statistics
export const ConversionStatsRequest = {
  start_date: '', // string - ISO date (optional)
  end_date: '', // string - ISO date (optional)
  funnel_type: 'all', // string - 'all', 'signup', 'purchase', 'subscription' (optional)
};

export const ConversionStatsResponse = {
  code: 200,
  msg: 'success',
  data: {
    overall_conversion_rate: 0.0, // number (percentage)
    conversion_by_funnel: [], // array of funnel conversion data
    conversion_by_source: [], // array of source conversion data
    abandonment_points: [], // array of abandonment data
    conversion_value: 0.00, // number - total value from conversions
    chart_data: {}, // ChartDataSchema
  },
};

// Real-time statistics
export const GetRealtimeStatsResponse = {
  code: 200,
  msg: 'success',
  data: {
    active_users: 0, // number - current active users
    live_sessions: 0, // number
    current_revenue: 0.00, // number - today's revenue so far
    recent_events: [], // array of recent event objects
    real_time_metrics: {
      page_views_per_minute: 0, // number
      signups_per_hour: 0, // number
      sales_per_hour: 0.00, // number
    },
    updated_at: '', // string - ISO date
  },
};

// Historical statistics
export const GetHistoricalStatsRequest = {
  start_date: '', // string - ISO date
  end_date: '', // string - ISO date
  granularity: 'day', // string - 'hour', 'day', 'week', 'month'
  metrics: [], // array of strings - specific metrics to include
};

export const GetHistoricalStatsResponse = {
  code: 200,
  msg: 'success',
  data: {
    time_series: [], // array of time-based data points
    aggregates: {}, // object with aggregated values
    trends: {}, // object with trend analysis
    chart_data: {}, // ChartDataSchema
  },
};

// Statistics configuration
export const StatisticsConfigSchema = {
  polling_frequency: 300000, // number - milliseconds
  data_retention_days: 365, // number
  enabled_metrics: [], // array of strings
  dashboard_layout: [], // array of layout configuration objects
  alert_thresholds: {}, // object with metric thresholds
  custom_calculations: [], // array of custom calculation definitions
};

export const GetStatisticsConfigResponse = {
  code: 200,
  msg: 'success',
  data: {
    config: {}, // StatisticsConfigSchema
  },
};

export const UpdateStatisticsConfigRequest = {
  polling_frequency: 300000, // number (optional)
  data_retention_days: 365, // number (optional)
  enabled_metrics: [], // array of strings (optional)
  dashboard_layout: [], // array of objects (optional)
  alert_thresholds: {}, // object (optional)
  custom_calculations: [], // array of objects (optional)
};

// Custom metrics
export const CustomMetricSchema = {
  metric_id: '', // string
  name: '', // string
  description: '', // string
  calculation_type: 'sum', // string - 'sum', 'average', 'count', 'custom'
  data_source: '', // string - where to pull data from
  formula: '', // string - calculation formula (for custom type)
  unit: '', // string
  format: 'number', // string
  category: 'custom', // string
  is_active: true, // boolean
  created_at: '', // string - ISO date
  updated_at: '', // string - ISO date
};

export const GetCustomMetricsResponse = {
  code: 200,
  msg: 'success',
  data: {
    custom_metrics: [], // array of CustomMetricSchema
  },
};

export const CreateCustomMetricRequest = {
  name: '', // string
  description: '', // string
  calculation_type: 'sum', // string
  data_source: '', // string
  formula: '', // string (optional)
  unit: '', // string (optional)
  format: 'number', // string (optional)
  category: 'custom', // string (optional)
};

// Statistics alerts
export const StatisticsAlertSchema = {
  alert_id: '', // string
  name: '', // string
  metric: '', // string - metric to monitor
  condition: 'greater_than', // string - 'greater_than', 'less_than', 'equals', 'change_by'
  threshold: 0, // number
  notification_methods: [], // array of strings - 'email', 'webhook', 'dashboard'
  is_active: true, // boolean
  last_triggered_at: '', // string - ISO date (optional)
  created_at: '', // string - ISO date
  updated_at: '', // string - ISO date
};

export const GetStatisticsAlertsResponse = {
  code: 200,
  msg: 'success',
  data: {
    alerts: [], // array of StatisticsAlertSchema
    available_metrics: [], // array of strings - metrics that can be monitored
  },
};

export const CreateStatisticsAlertRequest = {
  name: '', // string
  metric: '', // string
  condition: 'greater_than', // string
  threshold: 0, // number
  notification_methods: [], // array of strings
};

// Export statistics
export const ExportStatisticsRequest = {
  start_date: '', // string - ISO date (optional)
  end_date: '', // string - ISO date (optional)
  format: 'csv', // string - 'csv', 'json', 'xlsx'
  metrics: [], // array of strings - specific metrics to export (optional)
  include_charts: false, // boolean (optional)
};

export const ExportStatisticsResponse = {
  code: 200,
  msg: 'success',
  data: {
    download_url: '', // string - URL to download the export
    file_size: 0, // number - bytes
    record_count: 0, // number
    expires_at: '', // string - ISO date
  },
};

export default {
  StatisticsCardSchema,
  DashboardStatsSchema,
  ChartDataSchema,
  GetAllStatisticsResponse,
  UpsertStatisticsRequest,
  UpsertStatisticsResponse,
  RevenueStatsRequest,
  RevenueStatsResponse,
  UserStatsRequest,
  UserStatsResponse,
  EngagementStatsRequest,
  EngagementStatsResponse,
  ConversionStatsRequest,
  ConversionStatsResponse,
  GetRealtimeStatsResponse,
  GetHistoricalStatsRequest,
  GetHistoricalStatsResponse,
  StatisticsConfigSchema,
  GetStatisticsConfigResponse,
  UpdateStatisticsConfigRequest,
  CustomMetricSchema,
  GetCustomMetricsResponse,
  CreateCustomMetricRequest,
  StatisticsAlertSchema,
  GetStatisticsAlertsResponse,
  CreateStatisticsAlertRequest,
  ExportStatisticsRequest,
  ExportStatisticsResponse,
};