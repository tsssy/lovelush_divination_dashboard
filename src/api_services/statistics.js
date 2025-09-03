import httpRequests from '../http_requests.js';
import CONFIG from '../config.js';

class StatisticsApiService {
  // Get all statistics (initial load and polling)
  async get_all_statistics() {
    return await httpRequests.get_request('/statistics/all');
  }

  // Update/upsert statistics cards
  async upsert_statistics(statistics_data) {
    return await httpRequests.post_request('/statistics/upsert', statistics_data);
  }

  // Get specific statistic categories
  async get_dashboard_stats() {
    return await httpRequests.get_request('/statistics/dashboard');
  }

  async get_revenue_stats(date_range = {}) {
    return await httpRequests.post_request('/statistics/revenue', date_range);
  }

  async get_user_stats(date_range = {}) {
    return await httpRequests.post_request('/statistics/users', date_range);
  }

  async get_engagement_stats(date_range = {}) {
    return await httpRequests.post_request('/statistics/engagement', date_range);
  }

  async get_conversion_stats(date_range = {}) {
    return await httpRequests.post_request('/statistics/conversions', date_range);
  }

  // Real-time statistics updates
  async get_realtime_stats() {
    return await httpRequests.get_request('/statistics/realtime');
  }

  // Historical data
  async get_historical_stats(date_range, granularity = 'day') {
    return await httpRequests.post_request('/statistics/historical', {
      ...date_range,
      granularity,
    });
  }

  // Statistics configuration
  async get_statistics_config() {
    return await httpRequests.get_request('/statistics/config');
  }

  async update_statistics_config(config_data) {
    return await httpRequests.put_request('/statistics/config', config_data);
  }

  // Custom metrics
  async get_custom_metrics() {
    return await httpRequests.get_request('/statistics/custom-metrics');
  }

  async create_custom_metric(metric_data) {
    return await httpRequests.post_request('/statistics/custom-metrics', metric_data);
  }

  async update_custom_metric(metric_id, metric_data) {
    return await httpRequests.put_request(`/statistics/custom-metrics/${metric_id}`, metric_data);
  }

  async delete_custom_metric(metric_id) {
    return await httpRequests.delete_request(`/statistics/custom-metrics/${metric_id}`);
  }

  // Export statistics
  async export_statistics(date_range = {}, format = 'csv') {
    return await httpRequests.post_request('/statistics/export', {
      ...date_range,
      format,
    });
  }

  // Polling frequency management
  async get_polling_frequency() {
    return await httpRequests.get_request('/statistics/polling-frequency');
  }

  // Statistics alerts
  async get_statistics_alerts() {
    return await httpRequests.get_request('/statistics/alerts');
  }

  async create_statistics_alert(alert_data) {
    return await httpRequests.post_request('/statistics/alerts', alert_data);
  }

  async update_statistics_alert(alert_id, alert_data) {
    return await httpRequests.put_request(`/statistics/alerts/${alert_id}`, alert_data);
  }

  async delete_statistics_alert(alert_id) {
    return await httpRequests.delete_request(`/statistics/alerts/${alert_id}`);
  }
}

const statisticsApiService = new StatisticsApiService();

export default statisticsApiService;
export { StatisticsApiService };