import httpRequests from '../http_requests.js';
import CONFIG from '../config.js';

class GlobalApiService {
  // Authentication
  async authenticate(domain, agent_id, password) {
    const response = await httpRequests.post_request('/auth/login', {
      domain,
      agent_id,
      password,
    });
    
    if (response.code === 200 && response.data.token) {
      httpRequests.setAuthToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    const response = await httpRequests.post_request('/auth/logout', {});
    httpRequests.setAuthToken(null);
    return response;
  }

  // Health check
  async health_check() {
    return await httpRequests.get_request('/health');
  }

  // User profile
  async get_user_profile() {
    return await httpRequests.get_request('/user/profile');
  }

  async update_user_profile(profile_data) {
    return await httpRequests.put_request('/user/profile', profile_data);
  }

  // File upload
  async upload_file(file_data, file_type) {
    const form_data = new FormData();
    form_data.append('file', file_data);
    form_data.append('type', file_type);

    return await httpRequests.post_request('/upload', form_data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

const globalApiService = new GlobalApiService();

export default globalApiService;
export { GlobalApiService };