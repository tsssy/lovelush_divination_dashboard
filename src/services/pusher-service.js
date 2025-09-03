import Pusher from 'pusher-js';
import { PUSHER_CONFIG, getPusherConfig } from './pusher-config.js';
import httpRequests from '../http_requests.js';
import CONFIG from '../config.js';

class PusherService {
  constructor() {
    this.pusher = null;
    this.channels = new Map();
    this.isConnected = false;
    this.isConnecting = false;
    this.authToken = null;
    this.currentUserId = null;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = PUSHER_CONFIG.connection.reconnection.maxReconnectAttempts;
    this.reconnectTimer = null;
    
    // Event listeners storage
    this.eventListeners = new Map();
    
    // Bind methods to preserve 'this' context
    this.handleConnectionStateChange = this.handleConnectionStateChange.bind(this);
    this.handleConnectionError = this.handleConnectionError.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  // Initialize Pusher connection with dynamic config from API (following exact HTML example pattern)
  async initializeWithConfig(authToken, userId = null, pusherConfig) {
    if (this.isConnecting || this.isConnected) {
      console.warn('🔄 Pusher already connecting or connected');
      return;
    }

    try {
      this.isConnecting = true;
      this.authToken = authToken;
      this.currentUserId = userId;

      console.log('🚀 Initializing Pusher connection with dynamic config...', {
        userId,
        hasToken: !!authToken,
        config: pusherConfig
      });

      if (!pusherConfig) {
        throw new Error('No Pusher configuration provided');
      }

      console.log('📤 PUSHER CONFIGURATION DETAILS:');
      console.log('App Key:', pusherConfig.key);
      console.log('WS Host:', pusherConfig.wsHost);
      console.log('WS Port:', pusherConfig.wsPort);
      console.log('WSS Port:', pusherConfig.wssPort);
      console.log('WS Path:', pusherConfig.wsPath);
      console.log('WSS Path:', pusherConfig.wssPath);
      console.log('Force TLS:', pusherConfig.forceTLS);
      console.log('Cluster:', pusherConfig.cluster);
      console.log('Auth Endpoint:', pusherConfig.auth_endpoint);

      // Initialize Pusher exactly like the HTML example, but using dynamic config from API
      const pusherOptions = {
        wsHost: pusherConfig.wsHost,
        wsPort: pusherConfig.wsPort,
        wssPort: pusherConfig.wssPort || 443,
        forceTLS: pusherConfig.forceTLS,
        cluster: pusherConfig.cluster,
        disableStats: true,
        // Add wsPath and wssPath for proper connection routing
        ...(pusherConfig.wsPath && { wsPath: pusherConfig.wsPath }),
        ...(pusherConfig.wssPath && { wssPath: pusherConfig.wssPath }),
        authorizer: (channel, options) => ({
          authorize: async (socketId, callback) => {
            try {
              const token = this.authToken.startsWith('Bearer ') ? this.authToken : `Bearer ${this.authToken}`;
              
              console.log('🔐 PUSHER AUTH REQUEST:');
              console.log('Channel Name:', channel.name);
              console.log('Socket ID:', socketId);
              console.log('Authorization URL:', `${CONFIG.api.base_url}${pusherConfig.auth_endpoint || '/api/v1/pusher/auth'}`);
              console.log('Request Headers:', {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": token.substring(0, 20) + '...'
              });
              
              const authPayload = {
                channel_name: channel.name,
                socket_id: socketId
              };
              console.log('Auth Payload:', JSON.stringify(authPayload, null, 2));
              
              const resp = await fetch(`${CONFIG.api.base_url}${pusherConfig.auth_endpoint || '/api/v1/pusher/auth'}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  "Authorization": token
                },
                body: JSON.stringify(authPayload)
              });
              
              console.log('🔐 PUSHER AUTH RESPONSE:');
              console.log('Status:', resp.status, resp.statusText);
              console.log('Response Headers:', Object.fromEntries(resp.headers.entries()));
              
              const json = await resp.json();
              console.log('Response Body:', JSON.stringify(json, null, 2));
              
              if (!resp.ok) {
                const errMsg = json?.msg || json?.detail || `HTTP ${resp.status}`;
                console.error(`❌ Channel authorization failed: ${errMsg}`);
                return callback(new Error(errMsg), null);
              }
              
              // Handle backend wrapper: {code,msg,data:{auth, channel_data?}}
              const payload = json?.data || json;
              if (!payload?.auth) {
                console.error(`❌ Missing auth field in response: ${JSON.stringify(json)}`);
                return callback(new Error("Missing auth in response"), null);
              }
              
              console.log('✅ Channel authorization successful');
              callback(null, payload);
            } catch (e) {
              console.error(`❌ Channel authorization error: ${e.message}`);
              callback(e, null);
            }
          }
        })
      };

      console.log('📤 FINAL PUSHER OPTIONS:', JSON.stringify(pusherOptions, null, 2));

      this.pusher = new Pusher(pusherConfig.key, pusherOptions);

      // Set up connection event handlers exactly like the example
      this.setupConnectionHandlers();

      console.log('✅ Pusher initialized successfully with dynamic config');

    } catch (error) {
      console.error('❌ Failed to initialize Pusher:', error);
      this.isConnecting = false;
      throw error;
    }
  }

  // Setup connection event handlers (following exact HTML example pattern)
  setupConnectionHandlers() {
    if (!this.pusher) return;

    // Connection state changes
    this.pusher.connection.bind('state_change', this.handleConnectionStateChange);
    this.pusher.connection.bind('error', this.handleConnectionError);

    // Connection events - exactly like the HTML example
    this.pusher.connection.bind('connecting', () => {
      console.log('🔗 正在连接到 Soketi...');
    });

    this.pusher.connection.bind('connected', () => {
      console.log('✅ 已连接到 Soketi');
      console.log(`Socket ID: ${this.pusher.connection.socket_id}`);
      this.isConnected = true;
      this.isConnecting = false;
      this.connectionAttempts = 0;
      
      // Emit connection success event
      this.emitEvent('connection:success', {
        socketId: this.pusher.connection.socket_id,
        state: 'connected'
      });
    });

    this.pusher.connection.bind('disconnected', () => {
      console.log('❌ 连接已断开');
      this.isConnected = false;
      this.isConnecting = false;
      
      // Emit disconnection event
      this.emitEvent('connection:disconnected', { state: 'disconnected' });
      
      // Attempt to reconnect if we have auth token
      if (this.authToken && this.connectionAttempts < this.maxConnectionAttempts) {
        this.scheduleReconnect();
      }
    });

    this.pusher.connection.bind('error', (err) => {
      console.log(`❌ 连接错误: ${JSON.stringify(err)}`);
    });

    this.pusher.connection.bind('failed', (err) => {
      console.log(`❌ 连接失败: ${JSON.stringify(err)}`);
      this.isConnected = false;
      this.isConnecting = false;
      
      // Emit connection failure event
      this.emitEvent('connection:failed', { state: 'failed' });
      
      // Attempt to reconnect if we have auth token
      if (this.authToken && this.connectionAttempts < this.maxConnectionAttempts) {
        this.scheduleReconnect();
      }
    });

    this.pusher.connection.bind('unavailable', () => {
      console.error('⚠️ Pusher connection unavailable');
      this.isConnected = false;
      this.isConnecting = false;
      
      // Attempt to reconnect if we have auth token
      if (this.authToken && this.connectionAttempts < this.maxConnectionAttempts) {
        this.scheduleReconnect();
      }
    });
  }

  // Handle connection state changes
  handleConnectionStateChange(states) {
    console.log(`🔄 Pusher connection state changed: ${states.previous} → ${states.current}`, states);
    
    if (PUSHER_CONFIG.debug.logConnectionEvents) {
      console.log('📊 Connection state details:', {
        previous: states.previous,
        current: states.current,
        socketId: this.pusher?.connection.socket_id,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Handle connection errors
  handleConnectionError(error) {
    console.error('❌ Pusher connection error:', error);
    
    if (PUSHER_CONFIG.debug.logErrors) {
      console.error('🐛 Connection error details:', {
        error: error,
        type: error.type,
        data: error.data,
        timestamp: new Date().toISOString()
      });
    }
    
    // Emit error event
    this.emitEvent('connection:error', { error, timestamp: new Date().toISOString() });
  }

  // Schedule reconnection attempt
  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.connectionAttempts++;
    const delay = Math.min(
      PUSHER_CONFIG.connection.reconnection.minReconnectionDelay * 
      Math.pow(PUSHER_CONFIG.connection.reconnection.reconnectionDelayGrowFactor, this.connectionAttempts - 1),
      PUSHER_CONFIG.connection.reconnection.maxReconnectionDelay
    );

    console.log(`🔄 Scheduling Pusher reconnection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.attemptReconnect();
    }, delay);
  }

  // Attempt to reconnect
  async attemptReconnect() {
    if (this.isConnected || this.isConnecting) {
      console.log('🔄 Reconnect cancelled - already connected or connecting');
      return;
    }

    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.error(`❌ Pusher reconnection failed - max attempts reached (${this.maxConnectionAttempts})`);
      this.emitEvent('connection:max_attempts_reached', { 
        attempts: this.connectionAttempts,
        maxAttempts: this.maxConnectionAttempts 
      });
      return;
    }

    if (!this.authToken) {
      console.error('❌ Pusher reconnection failed - no auth token available');
      return;
    }

    try {
      console.log(`🔄 Attempting Pusher reconnection (${this.connectionAttempts}/${this.maxConnectionAttempts})...`);
      
      // For now, just log that reconnection would need to be handled by the calling code
      console.log('⚠️ Reconnection requires re-initializing with config from auth service');
      
    } catch (error) {
      console.error(`❌ Pusher reconnection attempt ${this.connectionAttempts} failed:`, error);
      
      // Schedule next attempt if we haven't reached max attempts
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        this.scheduleReconnect();
      }
    }
  }

  // Resubscribe to all active channels after reconnection
  async resubscribeToChannels() {
    if (this.channels.size === 0) {
      console.log('🔄 No channels to resubscribe to');
      return;
    }

    console.log(`🔄 Resubscribing to ${this.channels.size} channels after reconnection...`);
    
    // Store current channels to resubscribe
    const channelsToResubscribe = Array.from(this.channels.keys());
    
    // Clear current channels
    this.channels.clear();
    
    // Resubscribe to each channel
    for (const channelName of channelsToResubscribe) {
      try {
        console.log(`🔄 Resubscribing to channel: ${channelName}`);
        
        // For now, just subscribe without event handlers - 
        // the calling code should handle resubscription with proper handlers
        const channel = this.pusher.subscribe(channelName);
        this.channels.set(channelName, channel);
        
        this.emitEvent('channel:resubscribed', { channelName });
      } catch (error) {
        console.error(`❌ Failed to resubscribe to channel ${channelName}:`, error);
      }
    }
    
    console.log(`✅ Resubscribed to ${this.channels.size} channels`);
  }

  // Subscribe to a channel (following exact HTML example pattern)
  subscribeToChannel(channelName, eventHandlers = {}) {
    if (!this.pusher || !this.isConnected) {
      console.error('❌ Cannot subscribe to channel: Pusher not connected');
      return null;
    }

    try {
      console.log(`🔔 ==========================================`);
      console.log(`🔔 SUBSCRIBING TO CHANNEL: ${channelName}`);
      console.log(`🔔 Connection Status: ${this.isConnected ? 'Connected' : 'Disconnected'}`);
      console.log(`🔔 Socket ID: ${this.pusher?.connection.socket_id}`);
      console.log(`🔔 Event Handlers:`, Object.keys(eventHandlers));
      console.log(`🔔 ==========================================`);
      
      const channel = this.pusher.subscribe(channelName);
      this.channels.set(channelName, channel);

      // Bind subscription events exactly like the HTML example
      channel.bind('pusher:subscription_succeeded', () => {
        console.log(`✅ 成功订阅频道: ${channelName}`);
        
        if (PUSHER_CONFIG.debug.logChannelEvents) {
          console.log('📋 Channel subscription details:', {
            channel: channelName,
            timestamp: new Date().toISOString()
          });
        }
      });

      channel.bind('pusher:subscription_error', (err) => {
        console.log(`❌ 订阅失败: ${JSON.stringify(err)}`);
        console.error(`❌ SUBSCRIPTION ERROR for ${channelName}:`, err);
        this.channels.delete(channelName);
      });

      // Bind custom event handlers
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        console.log(`🎯 Binding event handler: ${event} for channel ${channelName}`);
        channel.bind(event, (data) => {
          console.log(`📨 [收到消息] Channel: ${channelName}, Event: ${event}:`, data);
          
          if (PUSHER_CONFIG.debug.logMessageEvents) {
            console.log('💬 Message event details:', {
              channel: channelName,
              event: event,
              data: data,
              timestamp: new Date().toISOString()
            });
          }
          
          // Call the handler
          handler(data);
          
          // Also call our general message handler
          this.handleMessage(channelName, event, data);
        });
      });

      console.log(`🔔 Channel subscription initiated: ${channelName}`);
      return channel;
    } catch (error) {
      console.error(`❌ Failed to subscribe to channel ${channelName}:`, error);
      return null;
    }
  }

  // Subscribe to user private channel (like the HTML example)
  subscribeToUserChannel(userId, eventHandlers = {}) {
    const channelName = PUSHER_CONFIG.channels.private.user(userId);
    
    const defaultHandlers = {
      "new_message": (data) => {
        console.log(`📨 [收到消息] ${data.from_user_id} -> ${data.to_user_id}: ${data.body}`);
        this.emitEvent('message:received', data);
      },
      ...eventHandlers
    };

    return this.subscribeToChannel(channelName, defaultHandlers);
  }

  // Subscribe to chatroom channel
  subscribeToChatroom(chatroomId, eventHandlers = {}) {
    const channelName = PUSHER_CONFIG.channels.private.chatroom(chatroomId);
    
    const defaultHandlers = {
      [PUSHER_CONFIG.events.chat.NEW_MESSAGE]: (data) => {
        console.log('💬 New message received:', data);
        this.emitEvent('message:received', data);
      },
      [PUSHER_CONFIG.events.chat.SYSTEM_MESSAGE]: (data) => {
        console.log('🔔 System message received:', data);
        this.emitEvent('system:message', data);
      },
      [PUSHER_CONFIG.events.chat.TYPING_INDICATOR]: (data) => {
        console.log('⌨️ Typing indicator:', data);
        this.emitEvent('typing:indicator', data);
      },
      [PUSHER_CONFIG.events.chat.STATUS_CHANGE]: (data) => {
        console.log('📊 Status change:', data);
        this.emitEvent('chatroom:status_change', data);
      },
      ...eventHandlers
    };

    return this.subscribeToChannel(channelName, defaultHandlers);
  }

  // Subscribe to agent channel
  subscribeToAgent(agentId, eventHandlers = {}) {
    const channelName = PUSHER_CONFIG.channels.private.agent(agentId);
    
    const defaultHandlers = {
      [PUSHER_CONFIG.events.agent.MATCH_AVAILABLE]: (data) => {
        console.log('💕 New match available:', data);
        this.emitEvent('match:available', data);
      },
      [PUSHER_CONFIG.events.agent.CREDITS_UPDATED]: (data) => {
        console.log('💰 Credits updated:', data);
        this.emitEvent('credits:updated', data);
      },
      [PUSHER_CONFIG.events.agent.NOTIFICATION]: (data) => {
        console.log('🔔 Agent notification:', data);
        this.emitEvent('agent:notification', data);
      },
      ...eventHandlers
    };

    return this.subscribeToChannel(channelName, defaultHandlers);
  }

  // Unsubscribe from a channel
  unsubscribeFromChannel(channelName) {
    if (!this.pusher) return;

    try {
      console.log(`📡 Unsubscribing from channel: ${channelName}`);
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
      console.log(`✅ Unsubscribed from channel: ${channelName}`);
    } catch (error) {
      console.error(`❌ Failed to unsubscribe from channel ${channelName}:`, error);
    }
  }

  // General message handler
  handleMessage(channelName, eventName, data) {
    // Always log to console as requested
    console.log(`📨 [Pusher Message] Channel: ${channelName}, Event: ${eventName}`, {
      channel: channelName,
      event: eventName,
      data: data,
      timestamp: new Date().toISOString(),
      userId: this.currentUserId
    });
    
    // Emit to any listeners
    this.emitEvent('message:any', { channelName, eventName, data });
  }

  // Event listener management
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  emitEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  getConnectionState() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      state: this.pusher?.connection.state || 'disconnected',
      socketId: this.pusher?.connection.socket_id || null,
      channels: Array.from(this.channels.keys()),
      connectionAttempts: this.connectionAttempts,
    };
  }

  // Disconnect from Pusher
  disconnect() {
    if (!this.pusher) return;

    try {
      console.log('🔄 Disconnecting from Pusher...');
      
      // Clear reconnection timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // Unsubscribe from all channels
      this.channels.forEach((channel, channelName) => {
        this.unsubscribeFromChannel(channelName);
      });
      
      // Clear channels
      this.channels.clear();
      
      // Disconnect Pusher
      this.pusher.disconnect();
      this.pusher = null;
      
      // Reset state
      this.isConnected = false;
      this.isConnecting = false;
      this.authToken = null;
      this.currentUserId = null;
      this.connectionAttempts = 0;
      
      // Clear event listeners
      this.eventListeners.clear();
      
      console.log('✅ Disconnected from Pusher successfully');
    } catch (error) {
      console.error('❌ Error during Pusher disconnect:', error);
    }
  }

  // Utility: Force reconnect (manual trigger)
  async forceReconnect() {
    console.log('🔄 Forcing Pusher reconnection...');
    
    if (this.pusher) {
      this.pusher.disconnect();
    }
    
    // Reset connection attempts for manual reconnect
    this.connectionAttempts = 0;
    
    if (this.authToken) {
      await this.attemptReconnect();
    } else {
      console.error('❌ Cannot force reconnect - no auth token available');
    }
  }

  // Utility: Check if channel exists
  hasChannel(channelName) {
    return this.channels.has(channelName);
  }

  // Utility: Get channel
  getChannel(channelName) {
    return this.channels.get(channelName);
  }

  // Utility: Get all active channels
  getActiveChannels() {
    return Array.from(this.channels.keys());
  }
}

// Create singleton instance
const pusherService = new PusherService();

export default pusherService;
export { PusherService, PUSHER_CONFIG };