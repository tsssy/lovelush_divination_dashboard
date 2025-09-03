// Statistics API Mock Responses

export const mockGetAllStatisticsResponse = {
  code: 200,
  msg: 'success',
  data: {
    statistics: [
      {
        id: '1',
        name: 'Active Users',
        pipeline: '[ { "$match": { "status": "active" } }, { "$count": "active_users" } ]',
        timelapse: [
          { timestamp: '2024-01-01T00:00:00Z', value: 1250 },
          { timestamp: '2024-01-02T00:00:00Z', value: 1340 },
          { timestamp: '2024-01-03T00:00:00Z', value: 1420 },
          { timestamp: '2024-01-04T00:00:00Z', value: 1380 },
          { timestamp: '2024-01-05T00:00:00Z', value: 1560 },
          { timestamp: '2024-01-06T00:00:00Z', value: 1620 },
          { timestamp: '2024-01-07T00:00:00Z', value: 1580 },
        ],
        is_polling: true,
        current_value: 1580,
        polling_frequency: 300 // 5 minutes
      },
      {
        id: '2',
        name: 'New Registrations',
        pipeline: '[ { "$match": { "created_at": { "$gte": "2024-01-01" } } }, { "$count": "new_registrations" } ]',
        timelapse: [
          { timestamp: '2024-01-01T00:00:00Z', value: 45 },
          { timestamp: '2024-01-02T00:00:00Z', value: 67 },
          { timestamp: '2024-01-03T00:00:00Z', value: 52 },
          { timestamp: '2024-01-04T00:00:00Z', value: 78 },
          { timestamp: '2024-01-05T00:00:00Z', value: 89 },
          { timestamp: '2024-01-06T00:00:00Z', value: 34 },
          { timestamp: '2024-01-07T00:00:00Z', value: 56 },
        ],
        is_polling: false,
        current_value: 56,
        polling_frequency: 1800 // 30 minutes
      },
      {
        id: '3',
        name: 'Daily Revenue',
        pipeline: '[ { "$match": { "type": "purchase", "date": { "$gte": "2024-01-01" } } }, { "$group": { "_id": null, "total": { "$sum": "$amount" } } } ]',
        timelapse: [
          { timestamp: '2024-01-01T00:00:00Z', value: 2450 },
          { timestamp: '2024-01-02T00:00:00Z', value: 3200 },
          { timestamp: '2024-01-03T00:00:00Z', value: 2800 },
          { timestamp: '2024-01-04T00:00:00Z', value: 3500 },
          { timestamp: '2024-01-05T00:00:00Z', value: 4100 },
          { timestamp: '2024-01-06T00:00:00Z', value: 2900 },
          { timestamp: '2024-01-07T00:00:00Z', value: 3800 },
        ],
        is_polling: true,
        current_value: 3800,
        polling_frequency: 600 // 10 minutes
      },
      {
        id: '4',
        name: 'Conversion Rate',
        pipeline: '[ { "$facet": { "total_visitors": [{ "$count": "count" }], "conversions": [{ "$match": { "converted": true } }, { "$count": "count" }] } }, { "$project": { "rate": { "$multiply": [{ "$divide": [{ "$arrayElemAt": ["$conversions.count", 0] }, { "$arrayElemAt": ["$total_visitors.count", 0] }] }, 100] } } } ]',
        timelapse: [
          { timestamp: '2024-01-01T00:00:00Z', value: 3.2 },
          { timestamp: '2024-01-02T00:00:00Z', value: 4.1 },
          { timestamp: '2024-01-03T00:00:00Z', value: 3.8 },
          { timestamp: '2024-01-04T00:00:00Z', value: 4.5 },
          { timestamp: '2024-01-05T00:00:00Z', value: 3.9 },
          { timestamp: '2024-01-06T00:00:00Z', value: 4.2 },
          { timestamp: '2024-01-07T00:00:00Z', value: 4.0 },
        ],
        is_polling: true,
        current_value: 4.0,
        polling_frequency: 900 // 15 minutes
      }
    ]
  },
};

export const mockUpsertStatisticsResponse = {
  code: 200,
  msg: 'success',
  data: {
    updated_cards: [
      {
        card_id: 'total_revenue',
        title: 'Total Revenue',
        type: 'currency',
        category: 'overview',
        value: 127890.75,
        previous_value: 125430.50,
        change: 1.96,
        change_direction: 'up',
        updated_at: new Date().toISOString(),
      },
    ],
    created_cards: [
      {
        card_id: 'new_metric',
        title: 'New Custom Metric',
        type: 'number',
        category: 'custom',
        value: 456,
        previous_value: 0,
        change: 100.0,
        change_direction: 'up',
        updated_at: new Date().toISOString(),
      },
    ],
    updated_at: new Date().toISOString(),
  },
};

export const mockRevenueStatsResponse = {
  code: 200,
  msg: 'success',
  data: {
    total_revenue: 125430.50,
    revenue_change: 6.07,
    revenue_by_period: [
      { period: '2024-11-15', amount: 4250.75 },
      { period: '2024-11-16', amount: 3890.25 },
      { period: '2024-11-17', amount: 5120.50 },
      { period: '2024-11-18', amount: 4750.25 },
      { period: '2024-11-19', amount: 5890.75 },
      { period: '2024-11-20', amount: 4320.50 },
      { period: '2024-11-21', amount: 6150.25 },
    ],
    top_products: [
      { product_name: 'Premium Silk Dress', revenue: 12450.75, units_sold: 42 },
      { product_name: 'Luxury Perfume Set', revenue: 8970.25, units_sold: 45 },
      { product_name: 'Designer Handbag', revenue: 7650.50, units_sold: 17 },
    ],
    revenue_channels: [
      { channel: 'direct', revenue: 62715.25, percentage: 50.0 },
      { channel: 'social_media', revenue: 37629.15, percentage: 30.0 },
      { channel: 'email', revenue: 18772.08, percentage: 15.0 },
      { channel: 'referral', revenue: 6314.03, percentage: 5.0 },
    ],
    currency: 'USD',
    chart_data: {
      labels: ['Nov 15', 'Nov 16', 'Nov 17', 'Nov 18', 'Nov 19', 'Nov 20', 'Nov 21'],
      datasets: [
        {
          label: 'Daily Revenue',
          data: [4250.75, 3890.25, 5120.50, 4750.25, 5890.75, 4320.50, 6150.25],
          backgroundColor: '#3b82f6',
          borderColor: '#1e40af',
          fill: false,
        },
      ],
    },
  },
};

export const mockUserStatsResponse = {
  code: 200,
  msg: 'success',
  data: {
    total_users: 24567,
    new_users: 1463,
    active_users: 18940,
    returning_users: 16850,
    user_growth_rate: 13.68,
    user_retention_rate: 78.5,
    users_by_period: [
      { period: '2024-11-15', count: 47 },
      { period: '2024-11-16', count: 52 },
      { period: '2024-11-17', count: 38 },
      { period: '2024-11-18', count: 61 },
      { period: '2024-11-19', count: 45 },
      { period: '2024-11-20', count: 39 },
      { period: '2024-11-21', count: 58 },
    ],
    demographic_breakdown: {
      age_groups: [
        { range: '18-24', count: 4913, percentage: 20.0 },
        { range: '25-34', count: 8627, percentage: 35.1 },
        { range: '35-44', count: 7370, percentage: 30.0 },
        { range: '45-65', count: 3657, percentage: 14.9 },
      ],
      gender_distribution: [
        { gender: 'female', count: 16797, percentage: 68.4 },
        { gender: 'male', count: 7770, percentage: 31.6 },
      ],
      location_distribution: [
        { location: 'US', count: 12284, percentage: 50.0 },
        { location: 'CA', count: 4913, percentage: 20.0 },
        { location: 'UK', count: 3684, percentage: 15.0 },
        { location: 'Other', count: 3686, percentage: 15.0 },
      ],
    },
    chart_data: {
      labels: ['Nov 15', 'Nov 16', 'Nov 17', 'Nov 18', 'Nov 19', 'Nov 20', 'Nov 21'],
      datasets: [
        {
          label: 'New Users',
          data: [47, 52, 38, 61, 45, 39, 58],
          backgroundColor: '#10b981',
          borderColor: '#059669',
          fill: false,
        },
      ],
    },
  },
};

export const mockEngagementStatsResponse = {
  code: 200,
  msg: 'success',
  data: {
    session_duration: {
      average: 342,
      median: 285,
      change: 7.55,
    },
    page_views: {
      total: 156789,
      unique: 89456,
      change: 12.34,
    },
    bounce_rate: 24.5,
    interaction_rate: 67.8,
    most_popular_pages: [
      { page: '/chat', views: 45678, percentage: 29.1 },
      { page: '/products', views: 28934, percentage: 18.5 },
      { page: '/dashboard', views: 21456, percentage: 13.7 },
    ],
    user_journey: [
      { step: 'landing', users: 10000, conversion_rate: 100.0 },
      { step: 'registration', users: 7500, conversion_rate: 75.0 },
      { step: 'profile_setup', users: 6000, conversion_rate: 80.0 },
      { step: 'first_match', users: 4500, conversion_rate: 75.0 },
      { step: 'first_message', users: 3150, conversion_rate: 70.0 },
    ],
    chart_data: {
      labels: ['Landing', 'Registration', 'Profile Setup', 'First Match', 'First Message'],
      datasets: [
        {
          label: 'Users',
          data: [10000, 7500, 6000, 4500, 3150],
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          fill: false,
        },
      ],
    },
  },
};

export const mockConversionStatsResponse = {
  code: 200,
  msg: 'success',
  data: {
    overall_conversion_rate: 3.24,
    conversion_by_funnel: [
      { funnel: 'signup', conversion_rate: 15.6, conversions: 1560 },
      { funnel: 'purchase', conversion_rate: 3.24, conversions: 324 },
      { funnel: 'subscription', conversion_rate: 1.8, conversions: 180 },
    ],
    conversion_by_source: [
      { source: 'direct', conversion_rate: 4.2, conversions: 420 },
      { source: 'social_media', conversion_rate: 2.8, conversions: 280 },
      { source: 'email', conversion_rate: 5.1, conversions: 255 },
      { source: 'referral', conversion_rate: 6.3, conversions: 63 },
    ],
    abandonment_points: [
      { point: 'cart', abandonment_rate: 68.5, users: 6850 },
      { point: 'checkout', abandonment_rate: 35.2, users: 2168 },
      { point: 'payment', abandonment_rate: 15.7, users: 340 },
    ],
    conversion_value: 98750.25,
    chart_data: {
      labels: ['Direct', 'Social Media', 'Email', 'Referral'],
      datasets: [
        {
          label: 'Conversion Rate %',
          data: [4.2, 2.8, 5.1, 6.3],
          backgroundColor: '#8b5cf6',
          borderColor: '#7c3aed',
          fill: false,
        },
      ],
    },
  },
};

export const mockGetRealtimeStatsResponse = {
  code: 200,
  msg: 'success',
  data: {
    active_users: 1847,
    live_sessions: 2104,
    current_revenue: 15670.25,
    recent_events: [
      { event: 'user_registered', timestamp: new Date(Date.now() - 120000).toISOString(), user_id: 'user_12345' },
      { event: 'message_sent', timestamp: new Date(Date.now() - 85000).toISOString(), match_id: 'match_789' },
      { event: 'order_completed', timestamp: new Date(Date.now() - 45000).toISOString(), order_value: 299.99 },
      { event: 'campaign_opened', timestamp: new Date(Date.now() - 15000).toISOString(), campaign_id: 'camp_001' },
    ],
    real_time_metrics: {
      page_views_per_minute: 127,
      signups_per_hour: 43,
      sales_per_hour: 2750.50,
    },
    updated_at: new Date().toISOString(),
  },
};

export const mockGetHistoricalStatsResponse = {
  code: 200,
  msg: 'success',
  data: {
    time_series: [
      { date: '2024-11-01', revenue: 95430.25, users: 23104, sessions: 15670 },
      { date: '2024-11-08', revenue: 102890.50, users: 23456, sessions: 16240 },
      { date: '2024-11-15', revenue: 118250.75, users: 23890, sessions: 17120 },
      { date: '2024-11-22', revenue: 125430.50, users: 24567, sessions: 18450 },
    ],
    aggregates: {
      total_revenue: 441002.00,
      avg_daily_revenue: 14700.07,
      total_new_users: 1463,
      avg_session_duration: 342,
    },
    trends: {
      revenue_trend: 'increasing',
      user_growth_trend: 'steady',
      engagement_trend: 'improving',
    },
    chart_data: {
      labels: ['Nov 1', 'Nov 8', 'Nov 15', 'Nov 22'],
      datasets: [
        {
          label: 'Revenue',
          data: [95430.25, 102890.50, 118250.75, 125430.50],
          backgroundColor: '#3b82f6',
          borderColor: '#1e40af',
          fill: false,
        },
        {
          label: 'Users',
          data: [23104, 23456, 23890, 24567],
          backgroundColor: '#10b981',
          borderColor: '#059669',
          fill: false,
        },
      ],
    },
  },
};

export const mockGetStatisticsConfigResponse = {
  code: 200,
  msg: 'success',
  data: {
    config: {
      polling_frequency: 300000,
      data_retention_days: 365,
      enabled_metrics: ['revenue', 'users', 'engagement', 'conversions'],
      dashboard_layout: [
        { section: 'overview', position: 1, visible: true },
        { section: 'revenue', position: 2, visible: true },
        { section: 'users', position: 3, visible: true },
        { section: 'engagement', position: 4, visible: false },
      ],
      alert_thresholds: {
        revenue_drop: -10.0,
        conversion_rate_drop: -15.0,
        server_downtime: 5,
      },
      custom_calculations: [
        {
          name: 'Customer Lifetime Value',
          formula: 'avg_order_value * purchase_frequency * customer_lifespan',
          enabled: true,
        },
      ],
    },
  },
};

export const mockUpdateStatisticsConfigResponse = {
  code: 200,
  msg: 'success',
  data: {
    config: {
      polling_frequency: 180000,
      data_retention_days: 365,
      enabled_metrics: ['revenue', 'users', 'engagement', 'conversions', 'custom'],
      dashboard_layout: [
        { section: 'overview', position: 1, visible: true },
        { section: 'revenue', position: 2, visible: true },
        { section: 'users', position: 3, visible: true },
        { section: 'engagement', position: 4, visible: true },
      ],
      alert_thresholds: {
        revenue_drop: -5.0,
        conversion_rate_drop: -10.0,
        server_downtime: 3,
      },
      custom_calculations: [
        {
          name: 'Customer Lifetime Value',
          formula: 'avg_order_value * purchase_frequency * customer_lifespan',
          enabled: true,
        },
      ],
    },
    updated_at: new Date().toISOString(),
  },
};

export const mockGetCustomMetricsResponse = {
  code: 200,
  msg: 'success',
  data: {
    custom_metrics: [
      {
        metric_id: 'metric_001',
        name: 'Customer Lifetime Value',
        description: 'Average revenue per customer over their lifetime',
        calculation_type: 'custom',
        data_source: 'orders',
        formula: 'avg_order_value * purchase_frequency * customer_lifespan',
        unit: 'USD',
        format: 'currency',
        category: 'revenue',
        is_active: true,
        created_at: '2024-10-01T10:00:00Z',
        updated_at: '2024-11-15T14:30:00Z',
      },
      {
        metric_id: 'metric_002',
        name: 'Message Response Rate',
        description: 'Percentage of messages that receive a response',
        calculation_type: 'percentage',
        data_source: 'messages',
        formula: '(responses / total_messages) * 100',
        unit: '%',
        format: 'percentage',
        category: 'engagement',
        is_active: true,
        created_at: '2024-09-15T12:00:00Z',
        updated_at: '2024-12-01T09:45:00Z',
      },
    ],
  },
};

export const mockCreateCustomMetricResponse = {
  code: 200,
  msg: 'success',
  data: {
    custom_metric: {
      metric_id: 'metric_003',
      name: 'Average Match Quality Score',
      description: 'Average compatibility score of user matches',
      calculation_type: 'average',
      data_source: 'matches',
      formula: null,
      unit: '',
      format: 'number',
      category: 'engagement',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
};

export const mockGetStatisticsAlertsResponse = {
  code: 200,
  msg: 'success',
  data: {
    alerts: [
      {
        alert_id: 'alert_001',
        name: 'Revenue Drop Alert',
        metric: 'total_revenue',
        condition: 'change_by',
        threshold: -10.0,
        notification_methods: ['email', 'dashboard'],
        is_active: true,
        last_triggered_at: '2024-11-20T15:30:00Z',
        created_at: '2024-09-01T10:00:00Z',
        updated_at: '2024-11-20T15:30:00Z',
      },
      {
        alert_id: 'alert_002',
        name: 'Low Conversion Rate',
        metric: 'conversion_rate',
        condition: 'less_than',
        threshold: 2.0,
        notification_methods: ['email', 'webhook'],
        is_active: true,
        last_triggered_at: null,
        created_at: '2024-10-15T14:20:00Z',
        updated_at: '2024-10-15T14:20:00Z',
      },
    ],
    available_metrics: [
      'total_revenue',
      'total_users',
      'active_sessions',
      'conversion_rate',
      'avg_session_duration',
      'bounce_rate',
    ],
  },
};

export const mockCreateStatisticsAlertResponse = {
  code: 200,
  msg: 'success',
  data: {
    alert: {
      alert_id: 'alert_003',
      name: 'High Active Sessions',
      metric: 'active_sessions',
      condition: 'greater_than',
      threshold: 2000,
      notification_methods: ['dashboard'],
      is_active: true,
      last_triggered_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
};

export const mockExportStatisticsResponse = {
  code: 200,
  msg: 'success',
  data: {
    download_url: 'https://api.lovelush.com/exports/statistics_20241215_183045.csv',
    file_size: 2048576,
    record_count: 15420,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
};

export const mockGetPollingFrequencyResponse = {
  code: 200,
  msg: 'success',
  data: {
    global_frequency: 300, // 5 minutes in seconds
    auto_polling_enabled: true,
    last_updated: new Date().toISOString(),
    next_update: new Date(Date.now() + 300000).toISOString(),
  },
};

export default {
  // Statistics API endpoint mappings
  'GET_/statistics/all': mockGetAllStatisticsResponse,
  'POST_/statistics/upsert': mockUpsertStatisticsResponse,
  'GET_/statistics/dashboard': mockGetAllStatisticsResponse, // Reuse all stats
  'POST_/statistics/revenue': mockRevenueStatsResponse,
  'POST_/statistics/users': mockUserStatsResponse,
  'POST_/statistics/engagement': mockEngagementStatsResponse,
  'POST_/statistics/conversions': mockConversionStatsResponse,
  'GET_/statistics/realtime': mockGetRealtimeStatsResponse,
  'POST_/statistics/historical': mockGetHistoricalStatsResponse,
  'GET_/statistics/config': mockGetStatisticsConfigResponse,
  'PUT_/statistics/config': mockUpdateStatisticsConfigResponse,
  'GET_/statistics/custom-metrics': mockGetCustomMetricsResponse,
  'POST_/statistics/custom-metrics': mockCreateCustomMetricResponse,
  'PUT_/statistics/custom-metrics': mockCreateCustomMetricResponse, // Reuse for updates
  'DELETE_/statistics/custom-metrics': { code: 200, msg: 'success', data: { deleted: true } },
  'POST_/statistics/export': mockExportStatisticsResponse,
  'GET_/statistics/polling-frequency': mockGetPollingFrequencyResponse,
  'GET_/statistics/alerts': mockGetStatisticsAlertsResponse,
  'POST_/statistics/alerts': mockCreateStatisticsAlertResponse,
  'PUT_/statistics/alerts': mockCreateStatisticsAlertResponse, // Reuse for updates
  'DELETE_/statistics/alerts': { code: 200, msg: 'success', data: { deleted: true } },
  
  // Legacy exports for backward compatibility
  mockGetAllStatisticsResponse,
  mockUpsertStatisticsResponse,
  mockRevenueStatsResponse,
  mockUserStatsResponse,
  mockEngagementStatsResponse,
  mockConversionStatsResponse,
  mockGetRealtimeStatsResponse,
  mockGetHistoricalStatsResponse,
  mockGetStatisticsConfigResponse,
  mockUpdateStatisticsConfigResponse,
  mockGetCustomMetricsResponse,
  mockCreateCustomMetricResponse,
  mockGetStatisticsAlertsResponse,
  mockCreateStatisticsAlertResponse,
  mockExportStatisticsResponse,
  mockGetPollingFrequencyResponse,
};