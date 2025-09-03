// Campaign API Mock Responses

export const mockGetAllCampaignsResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaigns: [
      {
        campaign_id: "flash_sale_01",
        is_active: true,
        description: "Limited time flash sale with 50% discount on premium features",
        number_of_impression: 12847,
        number_of_clicks: 1562,
        number_of_payment: 234,
        user_filter: {
          number_of_messages: {
            lower_bound: 50,
            upper_bound: 500
          },
          paid_amount_stars: {
            lower_bound: null,
            upper_bound: 100
          }
        },
        page_to_push: "3",
        display_properties: {
          backgroundImageUrl: "https://images.unsplash.com/photo-1607703703520-bb638e84caf2?w=400",
          closeOnOutsideClick: true,
          cancelButtonPosition: "top-right",
          countdown: {
            show: true,
            time: "2025-08-25T21:00:00Z",
            position: "top"
          },
          button: {
            text: "Buy Now!",
            position: "bottom",
            action: {
              type: "pay",
              value: "product_12345"
            },
            style: {
              color: "#E53935",
              textStyle: "bold",
              textSize: "18px"
            }
          }
        }
      },
      {
        campaign_id: "valentine_special_02",
        is_active: true,
        description: "Valentine's Day special campaign with romantic boost packages",
        number_of_impression: 8934,
        number_of_clicks: 892,
        number_of_payment: 156,
        user_filter: {
          number_of_messages: {
            lower_bound: null,
            upper_bound: 10
          }
        },
        page_to_push: "1",
        display_properties: {
          backgroundImageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400",
          closeOnOutsideClick: false,
          cancelButtonPosition: "top-left",
          countdown: {
            show: true,
            time: "2025-02-14T23:59:59Z",
            position: "center"
          },
          button: {
            text: "Find Love ❤️",
            position: "bottom",
            action: {
              type: "navigate",
              value: "/boost-packages"
            },
            style: {
              color: "#E91E63",
              textStyle: "bold",
              textSize: "16px"
            }
          }
        }
      },
      {
        campaign_id: "telegram_reminder_03",
        is_active: false,
        description: "Daily reminder via Telegram to check new matches",
        number_of_impression: 5672,
        number_of_clicks: 423,
        number_of_payment: 89,
        user_filter: {
          paid_amount_stars: {
            lower_bound: 500,
            upper_bound: null
          }
        },
        page_to_push: "6",
        telegram_schedule_time: "09:00",
        display_properties: {
          backgroundImageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
          closeOnOutsideClick: true,
          cancelButtonPosition: "top-right",
          countdown: {
            show: false,
            time: "",
            position: "top"
          },
          button: {
            text: "Check Matches",
            position: "center",
            action: {
              type: "external",
              value: "https://t.me/your_bot"
            },
            style: {
              color: "#1976D2",
              textStyle: "normal",
              textSize: "16px"
            }
          }
        }
      }
    ]
  },
};

export const mockUpsertCampaignResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign: {
      campaign_id: 'camp_003',
      name: 'Holiday Special Offers',
      description: 'Special deals for the holiday season',
      type: 'popup',
      status: 'draft',
      priority: 'medium',
      content: {
        title: 'Holiday Special - Limited Time!',
        body: 'Get 30% off on selected holiday items. Perfect gifts for your loved ones.',
        image_url: 'https://cdn.lovelush.com/campaigns/holiday-special.jpg',
        action_button: {
          text: 'Get Offer',
          url: 'https://lovelush.com/holiday-deals',
          action: 'open_url',
        },
        style: {
          background_color: '#d4edda',
          text_color: '#155724',
          button_color: '#28a745',
        },
      },
      targeting: {
        user_segments: ['all_customers'],
        location_filters: ['US'],
        age_range: {
          min: 18,
          max: 65,
        },
        gender_filter: ['all'],
        device_types: ['mobile', 'desktop'],
        custom_filters: {},
      },
      schedule: {
        start_date: '2024-12-20T00:00:00Z',
        end_date: '2024-12-26T23:59:59Z',
        timezone: 'UTC',
        delivery_time: {
          hour: 12,
          minute: 0,
        },
        frequency: 'once',
        max_deliveries: 1,
      },
      analytics: {
        sent_count: 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        conversion_count: 0,
        delivery_rate: 0.0,
        open_rate: 0.0,
        click_rate: 0.0,
        conversion_rate: 0.0,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'agent_67890',
      updated_by: 'agent_67890',
    },
    is_new: true,
  },
};

export const mockUpdateCampaignStatusResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign_id: 'camp_002',
    old_status: 'draft',
    new_status: 'active',
    updated_at: new Date().toISOString(),
  },
};

export const mockScheduleCampaignResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign_id: 'camp_003',
    schedule: {
      start_date: '2024-12-20T00:00:00Z',
      end_date: '2024-12-26T23:59:59Z',
      timezone: 'UTC',
      delivery_time: {
        hour: 12,
        minute: 0,
      },
      frequency: 'once',
      max_deliveries: 1,
    },
    next_delivery: '2024-12-20T12:00:00Z',
  },
};

export const mockGetCampaignAnalyticsResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign_id: 'camp_001',
    analytics: {
      sent_count: 15420,
      delivered_count: 14896,
      opened_count: 7348,
      clicked_count: 2204,
      conversion_count: 441,
      delivery_rate: 96.6,
      open_rate: 49.4,
      click_rate: 30.0,
      conversion_rate: 20.0,
    },
    time_series: [
      { date: '2024-11-29', sent: 3855, delivered: 3724, opened: 1837, clicked: 551, conversions: 110 },
      { date: '2024-11-30', sent: 3855, delivered: 3724, opened: 1837, clicked: 551, conversions: 110 },
      { date: '2024-12-01', sent: 3855, delivered: 3724, opened: 1837, clicked: 551, conversions: 110 },
      { date: '2024-12-02', sent: 3855, delivered: 3724, opened: 1837, clicked: 551, conversions: 110 },
    ],
    demographic_breakdown: {
      age_groups: [
        { range: '18-24', percentage: 22.5, conversions: 99 },
        { range: '25-34', percentage: 35.2, conversions: 155 },
        { range: '35-44', percentage: 28.1, conversions: 124 },
        { range: '45-65', percentage: 14.2, conversions: 63 },
      ],
      gender_breakdown: [
        { gender: 'female', percentage: 68.3, conversions: 301 },
        { gender: 'male', percentage: 31.7, conversions: 140 },
      ],
    },
    device_breakdown: {
      mobile: { percentage: 73.2, conversions: 323 },
      desktop: { percentage: 26.8, conversions: 118 },
    },
  },
};

export const mockUpdateCampaignTargetingResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign_id: 'camp_003',
    targeting: {
      user_segments: ['premium_customers'],
      location_filters: ['US', 'CA'],
      age_range: {
        min: 25,
        max: 55,
      },
      gender_filter: ['female'],
      device_types: ['mobile'],
      custom_filters: {
        min_purchase_amount: 150,
      },
    },
    estimated_audience_size: 8750,
  },
};

export const mockGetCampaignTemplatesResponse = {
  code: 200,
  msg: 'success',
  data: {
    templates: [
      {
        template_id: 'template_001',
        name: 'Sale Announcement',
        description: 'Template for announcing sales and discounts',
        type: 'notification',
        content_template: {
          title: '{{discount_percentage}}% Off - {{sale_name}}',
          body: 'Don\'t miss our {{sale_name}}! Save {{discount_percentage}}% on {{product_category}}.',
          action_button: {
            text: 'Shop Now',
            url: '{{sale_url}}',
            action: 'open_url',
          },
        },
        default_targeting: {
          user_segments: ['all_customers'],
          age_range: { min: 18, max: 65 },
          device_types: ['mobile', 'desktop'],
        },
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        template_id: 'template_002',
        name: 'New Product Launch',
        description: 'Template for launching new products',
        type: 'banner',
        content_template: {
          title: 'New Arrival: {{product_name}}',
          body: 'Discover our latest {{product_category}} - {{product_name}}.',
          action_button: {
            text: 'View Product',
            url: '{{product_url}}',
            action: 'open_url',
          },
        },
        default_targeting: {
          user_segments: ['style_enthusiasts', 'frequent_buyers'],
          age_range: { min: 20, max: 50 },
          device_types: ['mobile'],
        },
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
  },
};

export const mockCreateCampaignFromTemplateResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign: {
      campaign_id: 'camp_004',
      name: 'Summer Sale 2024',
      description: 'Summer sale campaign based on sale template',
      type: 'notification',
      status: 'draft',
      priority: 'medium',
      content: {
        title: '50% Off - Summer Sale',
        body: 'Don\'t miss our Summer Sale! Save 50% on clothing.',
        action_button: {
          text: 'Shop Now',
          url: 'https://lovelush.com/summer-sale',
          action: 'open_url',
        },
      },
      targeting: {
        user_segments: ['all_customers'],
        age_range: { min: 18, max: 65 },
        device_types: ['mobile', 'desktop'],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'agent_67890',
      updated_by: 'agent_67890',
    },
  },
};

export const mockBulkUpdateCampaignsResponse = {
  code: 200,
  msg: 'success',
  data: {
    updated_campaigns: [
      {
        campaign_id: 'flash_sale_01',
        is_active: false,
        updated_at: new Date().toISOString(),
      },
      {
        campaign_id: 'valentine_special_02',
        is_active: false,
        updated_at: new Date().toISOString(),
      },
    ],
    failed_updates: [],
  },
};

export const mockBulkDeleteCampaignsResponse = {
  code: 200,
  msg: 'success',
  data: {
    deleted_count: 3,
    failed_deletions: [],
  },
};

export const mockSearchCampaignsResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaigns: [
      {
        campaign_id: 'camp_001',
        name: 'Black Friday Sale 2024',
        description: 'Special discount campaign for Black Friday',
        type: 'notification',
        status: 'active',
        priority: 'high',
        created_at: '2024-11-15T10:00:00Z',
        updated_at: '2024-11-28T14:30:00Z',
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
    filters_applied: {
      query: 'Black Friday',
      status: 'active',
      type: 'notification',
    },
  },
};

export const mockGetCampaignResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign: {
      campaign_id: 'camp_001',
      name: 'Black Friday Sale 2024',
      description: 'Special discount campaign for Black Friday',
      type: 'notification',
      status: 'active',
      priority: 'high',
      content: {
        title: 'Black Friday Sale - Up to 70% Off!',
        body: 'Don\'t miss our biggest sale of the year.',
        image_url: 'https://cdn.lovelush.com/campaigns/black-friday-2024.jpg',
        action_button: {
          text: 'Shop Now',
          url: 'https://lovelush.com/sale',
          action: 'open_url',
        },
      },
      targeting: {
        user_segments: ['premium_customers', 'frequent_buyers'],
        location_filters: ['US', 'CA', 'UK'],
      },
      analytics: {
        sent_count: 15420,
        delivered_count: 14896,
        opened_count: 7348,
        clicked_count: 2204,
        conversion_count: 441,
      },
      created_at: '2024-11-15T10:00:00Z',
      updated_at: '2024-11-28T14:30:00Z',
    },
  },
};

export const mockDeleteCampaignResponse = {
  code: 200,
  msg: 'success',
  data: {
    campaign_id: 'camp_001',
    deleted_at: new Date().toISOString(),
    message: 'Campaign deleted successfully',
  },
};

export default {
  // Campaign API endpoint mappings
  'GET_/campaigns/all': mockGetAllCampaignsResponse,
  'POST_/campaigns': mockUpsertCampaignResponse,
  'PUT_/campaigns': mockUpsertCampaignResponse, // Same response for PUT (update)
  'GET_/campaigns': mockGetCampaignResponse, // This will handle /campaigns/{campaign_id}
  'DELETE_/campaigns': mockDeleteCampaignResponse, // This will handle /campaigns/{campaign_id}
  'PATCH_/campaigns': mockUpdateCampaignStatusResponse, // This will handle /campaigns/{campaign_id}/status
  'POST_/campaigns/schedule': mockScheduleCampaignResponse, // This will handle /campaigns/{campaign_id}/schedule
  'PUT_/campaigns/schedule': mockScheduleCampaignResponse, // Same for PUT schedule
  'POST_/campaigns/analytics': mockGetCampaignAnalyticsResponse, // This will handle /campaigns/{campaign_id}/analytics
  'PUT_/campaigns/targeting': mockUpdateCampaignTargetingResponse, // This will handle /campaigns/{campaign_id}/targeting
  'GET_/campaigns/templates': mockGetCampaignTemplatesResponse,
  'POST_/campaigns/templates': mockCreateCampaignFromTemplateResponse, // This will handle /campaigns/templates/{template_id}/create
  'POST_/campaigns/bulk-update': mockBulkUpdateCampaignsResponse,
  'POST_/campaigns/bulk-delete': mockBulkDeleteCampaignsResponse,
  'POST_/campaigns/search': mockSearchCampaignsResponse,
  
  // Legacy exports for backward compatibility
  mockGetAllCampaignsResponse,
  mockUpsertCampaignResponse,
  mockUpdateCampaignStatusResponse,
  mockScheduleCampaignResponse,
  mockGetCampaignAnalyticsResponse,
  mockUpdateCampaignTargetingResponse,
  mockGetCampaignTemplatesResponse,
  mockCreateCampaignFromTemplateResponse,
  mockBulkUpdateCampaignsResponse,
  mockBulkDeleteCampaignsResponse,
  mockSearchCampaignsResponse,
  mockGetCampaignResponse,
  mockDeleteCampaignResponse,
};