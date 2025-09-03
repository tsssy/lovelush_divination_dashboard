import httpRequests from '../http_requests.js';

class SettingsApiService {
  constructor() {
    this.baseEndpoint = '/api/v1/settings';
  }

  // GET /api/v1/settings/ - Get all settings with pagination
  async getAllSettings(limit = 10, offset = 0) {
    try {
      const response = await httpRequests.get(`${this.baseEndpoint}/`, {
        params: { limit, offset }
      });
      return {
        success: response.success || true,
        data: response.data,
        total: response.data?.total || 0
      };
    } catch (error) {
      console.error('❌ Error getting all settings:', error);
      throw error;
    }
  }

  // GET /api/v1/settings/active - Get active settings
  async getActiveSettings() {
    try {
      const response = await httpRequests.get(`${this.baseEndpoint}/active`);
      return {
        success: response.success || true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error getting active settings:', error);
      throw error;
    }
  }

  // GET /api/v1/settings/default - Get default settings
  async getDefaultSettings() {
    try {
      const response = await httpRequests.get(`${this.baseEndpoint}/default`);
      return {
        success: response.success || true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error getting default settings:', error);
      throw error;
    }
  }

  // GET /api/v1/settings/{settings_id} - Get specific settings by ID
  async getSettingsById(settingsId) {
    try {
      const response = await httpRequests.get(`${this.baseEndpoint}/${settingsId}`);
      return {
        success: response.success || true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error getting settings by ID:', error);
      throw error;
    }
  }

  // GET /api/v1/settings/by-name/{name} - Get settings by name
  async getSettingsByName(name) {
    try {
      const response = await httpRequests.get(`${this.baseEndpoint}/by-name/${encodeURIComponent(name)}`);
      return {
        success: response.success || true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error getting settings by name:', error);
      throw error;
    }
  }

  // POST /api/v1/settings/ - Create new settings
  async createSettings(settingsData) {
    try {
      const response = await httpRequests.post(`${this.baseEndpoint}/`, settingsData);
      return {
        success: response.success || true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('❌ Error creating settings:', error);
      throw error;
    }
  }

  // PUT /api/v1/settings/{settings_id} - Update settings
  async updateSettings(settingsId, settingsData) {
    try {
      const response = await httpRequests.put(`${this.baseEndpoint}/${settingsId}`, settingsData);
      return {
        success: response.success || true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      throw error;
    }
  }

  // DELETE /api/v1/settings/{settings_id} - Delete settings
  async deleteSettings(settingsId) {
    try {
      const response = await httpRequests.delete(`${this.baseEndpoint}/${settingsId}`);
      return {
        success: response.success || true,
        message: response.message
      };
    } catch (error) {
      console.error('❌ Error deleting settings:', error);
      throw error;
    }
  }

  // POST /api/v1/settings/{settings_id}/activate - Activate settings
  async activateSettings(settingsId) {
    try {
      const response = await httpRequests.post(`${this.baseEndpoint}/${settingsId}/activate`);
      return {
        success: response.success || true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('❌ Error activating settings:', error);
      throw error;
    }
  }

  // POST /api/v1/settings/{settings_id}/set-default - Set as default
  async setDefaultSettings(settingsId) {
    try {
      const response = await httpRequests.post(`${this.baseEndpoint}/${settingsId}/set-default`);
      return {
        success: response.success || true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('❌ Error setting default settings:', error);
      throw error;
    }
  }

  // Helper method to get settings with fallback
  async getSettingsWithFallback() {
    try {
      // Try to get active settings first
      const activeResponse = await this.getActiveSettings();
      if (activeResponse.success && activeResponse.data) {
        return { ...activeResponse, isActive: true };
      }
    } catch (error) {
      console.warn('⚠️ No active settings found, trying default...');
    }

    try {
      // Fallback to default settings
      const defaultResponse = await this.getDefaultSettings();
      if (defaultResponse.success && defaultResponse.data) {
        return { ...defaultResponse, isDefault: true };
      }
    } catch (error) {
      console.warn('⚠️ No default settings found, trying first available...');
    }

    // Last resort: get first available settings
    const allSettings = await this.getAllSettings(1, 0);
    if (allSettings.success && allSettings.data?.settings?.length > 0) {
      return {
        success: true,
        data: allSettings.data.settings[0],
        isFirstAvailable: true
      };
    }

    throw new Error('No settings found');
  }
}

// Create and export singleton instance
const settingsApiService = new SettingsApiService();

export default settingsApiService;
export { SettingsApiService };