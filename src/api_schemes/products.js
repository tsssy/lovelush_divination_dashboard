// Products API Schemes - Request/response structures for product management

// Product schema
export const ProductSchema = {
  product_id: '', // string
  name: '', // string
  description: '', // string
  price: 0.00, // number - decimal
  currency: 'USD', // string
  category_id: '', // string
  category_name: '', // string
  sku: '', // string
  stock_quantity: 0, // number
  status: 'active', // string - 'active', 'inactive', 'out_of_stock'
  images: [], // array of strings (URLs)
  tags: [], // array of strings
  weight: 0.0, // number (optional)
  dimensions: {
    length: 0.0, // number (optional)
    width: 0.0, // number (optional)
    height: 0.0, // number (optional)
  },
  metadata: {}, // object - additional product data
  created_at: '', // string - ISO date
  updated_at: '', // string - ISO date
  created_by: '', // string - agent_id
  updated_by: '', // string - agent_id
};

// Get all products response
export const GetAllProductsResponse = {
  code: 200,
  msg: 'success',
  data: {
    products: [], // array of ProductSchema
    categories: [], // array of CategorySchema
    total_products: 0, // number
    active_products: 0, // number
    out_of_stock_products: 0, // number
  },
};

// Upsert product request (create or update)
export const UpsertProductRequest = {
  product_id: '', // string (optional, for updates)
  name: '', // string
  description: '', // string (optional)
  price: 0.00, // number
  currency: 'USD', // string (optional)
  category_id: '', // string (optional)
  sku: '', // string (optional)
  stock_quantity: 0, // number (optional)
  status: 'active', // string (optional)
  images: [], // array of strings (optional)
  tags: [], // array of strings (optional)
  weight: 0.0, // number (optional)
  dimensions: {
    length: 0.0, // number (optional)
    width: 0.0, // number (optional)
    height: 0.0, // number (optional)
  },
  metadata: {}, // object (optional)
};

export const UpsertProductResponse = {
  code: 200,
  msg: 'success',
  data: {
    product: {}, // ProductSchema
    is_new: true, // boolean - true if created, false if updated
  },
};

// Category schema
export const CategorySchema = {
  category_id: '', // string
  name: '', // string
  description: '', // string (optional)
  parent_category_id: '', // string (optional) - for hierarchical categories
  image_url: '', // string (optional)
  sort_order: 0, // number
  is_active: true, // boolean
  product_count: 0, // number
  created_at: '', // string - ISO date
  updated_at: '', // string - ISO date
};

export const GetCategoriesResponse = {
  code: 200,
  msg: 'success',
  data: {
    categories: [], // array of CategorySchema
    total_categories: 0, // number
  },
};

export const UpsertCategoryRequest = {
  category_id: '', // string (optional, for updates)
  name: '', // string
  description: '', // string (optional)
  parent_category_id: '', // string (optional)
  image_url: '', // string (optional)
  sort_order: 0, // number (optional)
  is_active: true, // boolean (optional)
};

export const UpsertCategoryResponse = {
  code: 200,
  msg: 'success',
  data: {
    category: {}, // CategorySchema
    is_new: true, // boolean
  },
};

// Bulk operations
export const BulkUpsertProductsRequest = {
  products: [], // array of UpsertProductRequest
};

export const BulkUpsertProductsResponse = {
  code: 200,
  msg: 'success',
  data: {
    processed_products: [], // array of ProductSchema
    created_count: 0, // number
    updated_count: 0, // number
    errors: [], // array of error objects
  },
};

export const BulkDeleteProductsRequest = {
  product_ids: [], // array of strings
};

export const BulkDeleteProductsResponse = {
  code: 200,
  msg: 'success',
  data: {
    deleted_count: 0, // number
    failed_deletions: [], // array of error objects
  },
};

// Product search
export const SearchProductsRequest = {
  query: '', // string
  category_id: '', // string (optional)
  status: '', // string (optional)
  price_range: {
    min: 0.00, // number (optional)
    max: 0.00, // number (optional)
  },
  in_stock_only: false, // boolean (optional)
  tags: [], // array of strings (optional)
  sort_by: 'name', // string (optional) - 'name', 'price', 'created_at', 'stock_quantity'
  sort_order: 'asc', // string (optional) - 'asc', 'desc'
  page: 1, // number (optional)
  limit: 20, // number (optional)
};

export const SearchProductsResponse = {
  code: 200,
  msg: 'success',
  data: {
    products: [], // array of ProductSchema
    pagination: {}, // PaginationMeta
    filters_applied: {}, // object - summary of applied filters
  },
};

// Product status update
export const UpdateProductStatusRequest = {
  status: 'active', // string - 'active', 'inactive', 'out_of_stock'
};

export const UpdateProductStatusResponse = {
  code: 200,
  msg: 'success',
  data: {
    product_id: '', // string
    old_status: '', // string
    new_status: '', // string
    updated_at: '', // string - ISO date
  },
};

// Inventory update
export const UpdateProductInventoryRequest = {
  stock_quantity: 0, // number
  operation: 'set', // string - 'set', 'add', 'subtract'
  reason: '', // string (optional) - reason for inventory change
};

export const UpdateProductInventoryResponse = {
  code: 200,
  msg: 'success',
  data: {
    product_id: '', // string
    old_stock: 0, // number
    new_stock: 0, // number
    operation: '', // string
    updated_at: '', // string - ISO date
  },
};

export default {
  ProductSchema,
  GetAllProductsResponse,
  UpsertProductRequest,
  UpsertProductResponse,
  CategorySchema,
  GetCategoriesResponse,
  UpsertCategoryRequest,
  UpsertCategoryResponse,
  BulkUpsertProductsRequest,
  BulkUpsertProductsResponse,
  BulkDeleteProductsRequest,
  BulkDeleteProductsResponse,
  SearchProductsRequest,
  SearchProductsResponse,
  UpdateProductStatusRequest,
  UpdateProductStatusResponse,
  UpdateProductInventoryRequest,
  UpdateProductInventoryResponse,
};