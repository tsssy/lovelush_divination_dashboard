import httpRequests from '../http_requests.js';
import CONFIG from '../config.js';

class ProductsApiService {
  // Get paginated product list - no authentication required
  async get_all_products(limit = 50, offset = 0) {
    return await httpRequests.get_request(`/api/v1/products/?limit=${limit}&offset=${offset}`);
  }

  // Create new product - requires authentication
  async create_product(product_data) {
    return await httpRequests.post_request('/api/v1/products/', product_data);
  }

  // Update existing product - no authentication required
  async update_product(product_id, product_data) {
    return await httpRequests.put_request(`/api/v1/products/${product_id}`, product_data);
  }

  // Delete product - no authentication required
  async delete_product(product_id) {
    return await httpRequests.delete_request(`/api/v1/products/${product_id}`);
  }

  // Get product by ID (keeping for backwards compatibility) - no authentication required
  async get_product(product_id) {
    return await httpRequests.get_request(`/api/v1/products/${product_id}`);
  }
}

const productsApiService = new ProductsApiService();

export default productsApiService;
export { ProductsApiService };