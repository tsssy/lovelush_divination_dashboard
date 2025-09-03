import httpRequests from '../http_requests.js';
import CONFIG from '../config.js';

class CampaignApiService {
  // Get all campaigns
  async get_all_campaigns() {
    return await httpRequests.get_request('/campaigns/all');
  }

  // Upsert campaign (create or update)
  async upsert_campaign(campaign_data) {
    if (campaign_data.campaign_id) {
      // Update existing campaign
      return await httpRequests.put_request(`/campaigns/${campaign_data.campaign_id}`, campaign_data);
    } else {
      // Create new campaign
      return await httpRequests.post_request('/campaigns', campaign_data);
    }
  }

  // Delete campaign
  async delete_campaign(campaign_id) {
    return await httpRequests.delete_request(`/campaigns/${campaign_id}`);
  }

  // Get campaign by ID
  async get_campaign(campaign_id) {
    return await httpRequests.get_request(`/campaigns/${campaign_id}`);
  }

  // Campaign status management
  async update_campaign_status(campaign_id, status) {
    return await httpRequests.patch_request(`/campaigns/${campaign_id}/status`, {
      status,
    });
  }

  // Campaign scheduling
  async schedule_campaign(campaign_id, schedule_data) {
    return await httpRequests.post_request(`/campaigns/${campaign_id}/schedule`, schedule_data);
  }

  async update_campaign_schedule(campaign_id, schedule_data) {
    return await httpRequests.put_request(`/campaigns/${campaign_id}/schedule`, schedule_data);
  }

  // Campaign analytics
  async get_campaign_analytics(campaign_id, date_range = {}) {
    return await httpRequests.post_request(`/campaigns/${campaign_id}/analytics`, date_range);
  }

  // Campaign targeting
  async update_campaign_targeting(campaign_id, targeting_data) {
    return await httpRequests.put_request(`/campaigns/${campaign_id}/targeting`, targeting_data);
  }

  // Campaign templates
  async get_campaign_templates() {
    return await httpRequests.get_request('/campaigns/templates');
  }

  async create_campaign_from_template(template_id, campaign_data) {
    return await httpRequests.post_request(`/campaigns/templates/${template_id}/create`, campaign_data);
  }

  // Bulk operations
  async bulk_update_campaigns(campaigns_data) {
    return await httpRequests.post_request('/campaigns/bulk-update', {
      campaigns: campaigns_data,
    });
  }

  async bulk_delete_campaigns(campaign_ids) {
    return await httpRequests.post_request('/campaigns/bulk-delete', {
      campaign_ids,
    });
  }

  // Campaign search and filters
  async search_campaigns(query, filters = {}) {
    return await httpRequests.post_request('/campaigns/search', {
      query,
      ...filters,
    });
  }
}

const campaignApiService = new CampaignApiService();

export default campaignApiService;
export { CampaignApiService };