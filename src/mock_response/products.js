// Products API Mock Responses

export const mockGetAllProductsResponse = {
  code: 200,
  msg: 'success',
  data: {
    products: [
      {
        _id: '1',
        title: 'Premium Boost',
        description: 'Get more visibility on your profile',
        price: 9.99,
        credits: 50,
        category: 'boosts',
        photo_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200',
        feature_text: 'Most Popular',
        show_feature: true,
        stock_limit: 100,
        meta: { popularity: 'high' },
        is_active: true,
        show_in_shop: true,
        user_filter: {
          number_of_messages: {
            lower_bound: 10,
            upper_bound: null
          },
          paid_amount_stars: {
            lower_bound: null,
            upper_bound: 50
          }
        }
      },
      {
        _id: '2',
        title: 'Super Like Pack',
        description: 'Show extra interest with super likes',
        price: 4.99,
        credits: 25,
        category: 'likes',
        photo_url: 'https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?w=200',
        feature_text: 'Limited Time',
        show_feature: false,
        stock_limit: 200,
        meta: { type: 'consumable' },
        is_active: true,
        show_in_shop: true,
        user_filter: {
          number_of_messages: {
            lower_bound: null,
            upper_bound: 50
          }
        }
      },
      {
        _id: '3',
        title: 'Profile Badge',
        description: 'Stand out with a verified badge',
        price: 19.99,
        credits: 0,
        category: 'badges',
        photo_url: 'https://images.unsplash.com/photo-1555374018-13a8994ab246?w=200',
        feature_text: 'Exclusive',
        show_feature: true,
        stock_limit: 50,
        meta: { duration: 'permanent' },
        is_active: false,
        show_in_shop: false,
        user_filter: {
          paid_amount_stars: {
            lower_bound: 100,
            upper_bound: null
          }
        }
      }
    ]
  },
};

export const mockUpsertProductResponse = {
  code: 200,
  msg: 'success',
  data: {
    product: {
      _id: '4',
      title: 'Designer Chat Bundle',
      description: 'Premium chat features bundle',
      price: 29.99,
      credits: 100,
      category: 'premium',
      photo_url: 'https://images.unsplash.com/photo-1555374018-13a8994ab246?w=200',
      feature_text: 'New',
      show_feature: true,
      stock_limit: 25,
      meta: { type: 'bundle' },
      is_active: true,
      show_in_shop: true,
      user_filter: {
        number_of_messages: {
          lower_bound: 5,
          upper_bound: null
        }
      }
    },
    is_new: true,
  },
};

export const mockGetCategoriesResponse = {
  code: 200,
  msg: 'success',
  data: {
    categories: [
      {
        _id: 'boosts',
        name: 'Boosts',
        description: 'Profile visibility boosters',
        is_active: true,
      },
      {
        _id: 'likes',
        name: 'Likes',
        description: 'Like packs and super likes',
        is_active: true,
      },
      {
        _id: 'badges',
        name: 'Badges',
        description: 'Profile badges and verification',
        is_active: true,
      },
      {
        _id: 'premium',
        name: 'Premium',
        description: 'Premium features and bundles',
        is_active: true,
      },
    ],
    total_categories: 4,
  },
};

export const mockUpsertCategoryResponse = {
  code: 200,
  msg: 'success',
  data: {
    category: {
      _id: 'gifts',
      name: 'Gifts',
      description: 'Virtual gifts and stickers',
      is_active: true,
    },
    is_new: true,
  },
};

export const mockBulkUpsertProductsResponse = {
  code: 200,
  msg: 'success',
  data: {
    processed_products: [
      {
        _id: '5',
        title: 'Message Pack Small',
        price: 2.99,
        is_active: true,
      },
      {
        _id: '6', 
        title: 'Message Pack Large',
        price: 7.99,
        is_active: true,
      },
    ],
    created_count: 2,
    updated_count: 0,
    errors: [],
  },
};

export const mockBulkDeleteProductsResponse = {
  code: 200,
  msg: 'success',
  data: {
    deleted_count: 3,
    failed_deletions: [],
  },
};

export const mockSearchProductsResponse = {
  code: 200,
  msg: 'success',
  data: {
    products: [
      {
        _id: '1',
        title: 'Premium Boost',
        description: 'Get more visibility on your profile',
        price: 9.99,
        credits: 50,
        category: 'boosts',
        photo_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200',
        feature_text: 'Most Popular',
        show_feature: true,
        stock_limit: 100,
        meta: { popularity: 'high' },
        is_active: true,
        show_in_shop: true,
        user_filter: {
          number_of_messages: {
            lower_bound: 10,
            upper_bound: null
          }
        }
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
      query: 'premium boost',
      category: 'boosts',
      is_active: true,
    },
  },
};

export const mockUpdateProductStatusResponse = {
  code: 200,
  msg: 'success',
  data: {
    _id: '1',
    old_status: true,
    new_status: false,
    updated_at: new Date().toISOString(),
  },
};

export const mockUpdateProductInventoryResponse = {
  code: 200,
  msg: 'success',
  data: {
    _id: '1',
    old_stock: 100,
    new_stock: 150,
    operation: 'add',
    updated_at: new Date().toISOString(),
  },
};

export const mockGetProductResponse = {
  code: 200,
  msg: 'success',
  data: {
    product: {
      _id: '1',
      title: 'Premium Boost',
      description: 'Get more visibility on your profile',
      price: 9.99,
      credits: 50,
      category: 'boosts',
      photo_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200',
      feature_text: 'Most Popular',
      show_feature: true,
      stock_limit: 100,
      meta: { popularity: 'high' },
      is_active: true,
      show_in_shop: true,
      user_filter: {
        number_of_messages: {
          lower_bound: 10,
          upper_bound: null
        },
        paid_amount_stars: {
          lower_bound: null,
          upper_bound: 50
        }
      }
    },
  },
};

export const mockDeleteProductResponse = {
  code: 200,
  msg: 'success',
  data: {
    _id: '1',
    deleted_at: new Date().toISOString(),
    message: 'Product deleted successfully',
  },
};

export default {
  // Products API endpoint mappings
  'GET_/products/all': mockGetAllProductsResponse,
  'POST_/products': mockUpsertProductResponse,
  'PUT_/products': mockUpsertProductResponse, // Same response for PUT (update)
  'GET_/products': mockGetProductResponse, // This will handle /products/{product_id}
  'DELETE_/products': mockDeleteProductResponse, // This will handle /products/{product_id}
  'POST_/products/bulk-upsert': mockBulkUpsertProductsResponse,
  'POST_/products/bulk-delete': mockBulkDeleteProductsResponse,
  'GET_/products/categories': mockGetCategoriesResponse,
  'POST_/products/categories': mockUpsertCategoryResponse,
  'PUT_/products/categories': mockUpsertCategoryResponse, // Same response for PUT
  'POST_/products/search': mockSearchProductsResponse,
  'PATCH_/products': mockUpdateProductStatusResponse, // This will handle /products/{product_id}/status
  'PATCH_/products/inventory': mockUpdateProductInventoryResponse, // This will handle /products/{product_id}/inventory
  
  // Legacy exports for backward compatibility
  mockGetAllProductsResponse,
  mockUpsertProductResponse,
  mockGetCategoriesResponse,
  mockUpsertCategoryResponse,
  mockBulkUpsertProductsResponse,
  mockBulkDeleteProductsResponse,
  mockSearchProductsResponse,
  mockUpdateProductStatusResponse,
  mockUpdateProductInventoryResponse,
  mockGetProductResponse,
  mockDeleteProductResponse,
};