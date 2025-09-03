import CONFIG from './config.js';

class SoketiManager {
  constructor() {
    this.pusher = null;
    this.channels = {};
    this.connectionData = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.eventListeners = {};
    this.jwtToken = null;
  }

  async connect(domain, agentId, password) {
    try {
      this.connectionData = { domain, agentId, password };
      
      if (CONFIG.dev.debug_socket_events) {
        console.log('🔌 Connecting to Soketi with:', { domain, agentId });
      }

      // Import Pusher dynamically to avoid issues if not installed
      const Pusher = await import('pusher-js').then(m => m.default || m);

      // Generate JWT token (in real implementation, this would come from your auth API)
      this.jwtToken = await this.generateJwtToken(domain, agentId, password);

      const pusherConfig = {
        ...CONFIG.socket,
        wsHost: domain || CONFIG.socket.host,
        auth: {
          headers: {
            'Authorization': `Bearer ${this.jwtToken}`
          }
        },
        authEndpoint: `${CONFIG.api.base_url}/auth/pusher`,
      };

      this.pusher = new Pusher(CONFIG.socket.key, pusherConfig);

      // Connection event handlers
      this.pusher.connection.bind('connected', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        if (CONFIG.dev.debug_socket_events) {
          console.log('✅ Connected to Soketi');
        }
        this.emit('connected', { domain, agentId });
      });

      this.pusher.connection.bind('disconnected', () => {
        this.isConnected = false;
        if (CONFIG.dev.debug_socket_events) {
          console.log('❌ Disconnected from Soketi');
        }
        this.emit('disconnected');
      });

      this.pusher.connection.bind('error', (error) => {
        console.error('🚨 Soketi connection error:', error);
        this.emit('error', error);
      });

      // Auto-reconnection logic
      this.pusher.connection.bind('unavailable', () => {
        this.handleReconnection();
      });

    } catch (error) {
      console.error('❌ Failed to connect to Soketi:', error);
      throw error;
    }
  }

  async generateJwtToken(domain, agentId, password) {
    // In real implementation, make API call to get JWT
    // For now, return a mock token
    return `mock-jwt-token-${agentId}-${Date.now()}`;
  }

  async disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
      this.channels = {};
      this.isConnected = false;
      this.connectionData = null;
      this.jwtToken = null;
      
      if (CONFIG.dev.debug_socket_events) {
        console.log('🔌 Disconnected from Soketi');
      }
    }
  }

  async handleReconnection() {
    if (this.reconnectAttempts >= CONFIG.socket.max_reconnect_attempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    
    if (CONFIG.dev.debug_socket_events) {
      console.log(`🔄 Reconnecting to Soketi (Attempt ${this.reconnectAttempts}/${CONFIG.socket.max_reconnect_attempts})`);
    }

    setTimeout(() => {
      if (this.connectionData && !this.isConnected) {
        this.connect(
          this.connectionData.domain,
          this.connectionData.agentId,
          this.connectionData.password
        );
      }
    }, CONFIG.socket.reconnect_delay * this.reconnectAttempts);
  }

  subscribe(channelName, eventName, callback) {
    if (!this.pusher || !this.isConnected) {
      console.warn('⚠️ Soketi not connected. Queueing subscription:', channelName);
      // Queue subscription for when connected
      this.on('connected', () => {
        this.subscribe(channelName, eventName, callback);
      });
      return;
    }

    if (!this.channels[channelName]) {
      this.channels[channelName] = this.pusher.subscribe(channelName);
      
      if (CONFIG.dev.debug_socket_events) {
        console.log(`📡 Subscribed to channel: ${channelName}`);
      }
    }

    this.channels[channelName].bind(eventName, (data) => {
      if (CONFIG.dev.debug_socket_events) {
        console.log(`📨 Received event ${eventName} on ${channelName}:`, data);
      }
      callback(data);
    });
  }

  unsubscribe(channelName) {
    if (this.channels[channelName]) {
      this.pusher.unsubscribe(channelName);
      delete this.channels[channelName];
      
      if (CONFIG.dev.debug_socket_events) {
        console.log(`🚫 Unsubscribed from channel: ${channelName}`);
      }
    }
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // Chat-specific convenience methods
  subscribeToChat(userId, callback) {
    this.subscribe(`chat.${userId}`, 'new-message', callback);
  }

  subscribeToMatchUpdates(agentId, callback) {
    this.subscribe(`matches.${agentId}`, 'match-update', callback);
  }

  subscribeToUserStatus(userId, callback) {
    this.subscribe(`user.${userId}`, 'status-change', callback);
  }

  // Subaccount management
  subscribeToSubaccount(subaccountId, callback) {
    this.subscribe(`subaccount.${subaccountId}`, 'message', callback);
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      connectionData: this.connectionData,
      reconnectAttempts: this.reconnectAttempts,
      channels: Object.keys(this.channels),
    };
  }
}

// Create and export singleton instance
const soketiManager = new SoketiManager();

export default soketiManager;
export { SoketiManager };