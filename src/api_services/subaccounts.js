import httpRequests from '../http_requests.js';

/**
 * @typedef {Object} SubAccount
 * @property {string} id
 * @property {string} agent_id
 * @property {string} name
 * @property {string} display_name
 * @property {string} status
 * @property {string|null} avatar_url
 * @property {string|null} bio
 * @property {number} age
 * @property {string|null} location
 * @property {string|null} gender
 * @property {string[]} photo_urls
 * @property {string[]} tags
 * @property {boolean} is_active
 * @property {number} current_chat_count
 * @property {number} max_concurrent_chats
 * @property {string|null} last_activity_at
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} SubAccountsResponse
 * @property {number} code
 * @property {string} msg
 * @property {Object} data
 * @property {SubAccount[]} data.sub_accounts
 */

class SubAccountsApiService {
  constructor() {
    // No initialization needed
  }

  // Get all sub-accounts for the authenticated agent
  async get_all_subaccounts() {
    try {
      console.log('🚀 Loading sub-accounts...');
      const response = await httpRequests.get('/api/v1/agents/sub-accounts');
      
      if (response.code === 200 && response.data) {
        console.log('✅ Sub-accounts loaded successfully:', response.data);
        return response;
      } else {
        console.error('❌ Failed to load sub-accounts:', response);
        throw new Error(response.msg || 'Failed to load sub-accounts');
      }
    } catch (error) {
      console.error('❌ Sub-accounts API error:', error);
      throw error;
    }
  }

  // Create a new sub-account
  async create_subaccount(subAccountData) {
    try {
      console.log('🚀 Creating new sub-account:', subAccountData);
      const response = await httpRequests.post('/api/v1/agents/sub-accounts', subAccountData);
      
      if (response.code === 201 && response.data) {
        console.log('✅ Sub-account created successfully:', response.data);
        return response;
      } else {
        console.error('❌ Failed to create sub-account:', response);
        throw new Error(response.msg || 'Failed to create sub-account');
      }
    } catch (error) {
      console.error('❌ Create sub-account API error:', error);
      throw error;
    }
  }

  // Get sub-account by ID
  async get_subaccount_by_id(subAccountId) {
    try {
      console.log('🚀 Loading sub-account by ID:', subAccountId);
      const response = await httpRequests.get(`/api/v1/agents/sub-accounts/${subAccountId}`);
      
      if (response.code === 200 && response.data) {
        console.log('✅ Sub-account loaded successfully:', response.data);
        return response;
      } else {
        console.error('❌ Failed to load sub-account:', response);
        throw new Error(response.msg || 'Failed to load sub-account');
      }
    } catch (error) {
      console.error('❌ Get sub-account API error:', error);
      throw error;
    }
  }

  // Update sub-account
  async update_subaccount(subAccountId, subAccountData) {
    try {
      console.log('🚀 Updating sub-account:', subAccountId, subAccountData);
      const response = await httpRequests.put(`/api/v1/agents/sub-accounts/${subAccountId}`, subAccountData);
      
      if (response.code === 200 && response.data) {
        console.log('✅ Sub-account updated successfully:', response.data);
        return response;
      } else {
        console.error('❌ Failed to update sub-account:', response);
        throw new Error(response.msg || 'Failed to update sub-account');
      }
    } catch (error) {
      console.error('❌ Update sub-account API error:', error);
      throw error;
    }
  }

  // Delete sub-account (soft delete)
  async delete_subaccount(subAccountId) {
    try {
      console.log('🚀 Deleting sub-account:', subAccountId);
      const response = await httpRequests.delete(`/api/v1/agents/sub-accounts/${subAccountId}`);
      
      if (response.code === 204) {
        console.log('✅ Sub-account deleted successfully');
        return response;
      } else {
        console.error('❌ Failed to delete sub-account:', response);
        throw new Error(response.msg || 'Failed to delete sub-account');
      }
    } catch (error) {
      console.error('❌ Delete sub-account API error:', error);
      throw error;
    }
  }

  // Helper method to get sub-accounts count
  async get_subaccounts_count() {
    try {
      const response = await this.get_all_subaccounts();
      return response.data?.sub_accounts?.length || 0;
    } catch (error) {
      console.error('❌ Failed to get sub-accounts count:', error);
      return 0;
    }
  }

  // Helper method to get active sub-accounts only
  async get_active_subaccounts() {
    try {
      const response = await this.get_all_subaccounts();
      if (response.data?.sub_accounts) {
        return response.data.sub_accounts.filter(account => account.is_active);
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to get active sub-accounts:', error);
      return [];
    }
  }

  // Helper method to get sub-account by ID
  async get_subaccount_by_id(subAccountId) {
    try {
      const response = await this.get_all_subaccounts();
      if (response.data?.sub_accounts) {
        return response.data.sub_accounts.find(account => account.id === subAccountId) || null;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get sub-account by ID:', error);
      return null;
    }
  }

  // Helper method to get sub-accounts with current chats
  async get_subaccounts_with_active_chats() {
    try {
      const response = await this.get_all_subaccounts();
      if (response.data?.sub_accounts) {
        return response.data.sub_accounts.filter(account => account.current_chat_count > 0);
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to get sub-accounts with active chats:', error);
      return [];
    }
  }
}

const subAccountsApiService = new SubAccountsApiService();

export default subAccountsApiService;
export { SubAccountsApiService };