import httpRequests from '../http_requests.js';
import CONFIG from '../config.js';
import subAccountsApiService from './subaccounts.js';

class ChatApiService {
  // Get all chat data for the agent (matches, subaccounts, messages)
  async get_all_chat_data() {
    return await httpRequests.get_request('/chat/all');
  }

  // Get all sub-accounts using the dedicated sub-accounts API
  async get_subaccounts() {
    return await subAccountsApiService.get_all_subaccounts();
  }

  async create_subaccount(subaccount_data) {
    return await subAccountsApiService.create_subaccount(subaccount_data);
  }

  async update_subaccount(subaccount_id, subaccount_data) {
    return await subAccountsApiService.update_subaccount(subaccount_id, subaccount_data);
  }

  async delete_subaccount(subaccount_id) {
    return await subAccountsApiService.delete_subaccount(subaccount_id);
  }

  // Match pagination (for Previous/Next navigation through matches)
  async get_matches(page = 1, limit = CONFIG.pagination.default_page_size) {
    return await httpRequests.get_request(`/chat/matches?page=${page}&limit=${limit}`);
  }

  // Message pagination (for Previous/Next navigation through messages in a match)
  async get_messages(match_id, page = 1, limit = CONFIG.pagination.default_page_size) {
    return await httpRequests.get_request(`/chat/messages/${match_id}?page=${page}&limit=${limit}`);
  }

  async send_message(match_id, message_data) {
    return await httpRequests.post_request(`/chat/messages/${match_id}`, message_data);
  }

  async update_message(message_id, message_data) {
    return await httpRequests.put_request(`/chat/messages/update/${message_id}`, message_data);
  }

  async delete_message(message_id) {
    return await httpRequests.delete_request(`/chat/messages/${message_id}`);
  }

  // Message status updates
  async mark_messages_as_read(match_id, message_ids) {
    return await httpRequests.post_request(`/chat/messages/mark-read/${match_id}`, {
      message_ids,
    });
  }

  // User information updates (triggered by soketi)
  async update_match_info(match_id) {
    return await httpRequests.get_request(`/chat/match-info/${match_id}`);
  }

  async update_user_info(user_id) {
    return await httpRequests.get_request(`/chat/user-info/${user_id}`);
  }

  // Search matches under a specific subaccount
  async search_matches_by_subaccount(subaccount_id, query, filters = {}) {
    return await httpRequests.post_request('/chat/matches/search', {
      query,
      subaccount_id,
      ...filters,
    });
  }

  // Chat settings
  async get_chat_settings() {
    return await httpRequests.get_request('/chat/settings');
  }

  async update_chat_settings(settings_data) {
    return await httpRequests.put_request('/chat/settings', settings_data);
  }
}

const chatApiService = new ChatApiService();

export default chatApiService;
export { ChatApiService };