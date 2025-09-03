// Pusher/Soketi Configuration
export const PUSHER_CONFIG = {
  // Soketi Configuration (for development/self-hosted)
  soketi: {
    wsHost: '8.216.32.239',
    wsPort: 6001,
    wssPort: 6001,
    forceTLS: false,
    scheme: 'ws',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    // Note: Using authorizer instead of hardcoded credentials
  },

  // Pusher Configuration (for production Pusher service)
  pusher: {
    wsHost: 'api.pusherapp.com',
    wsPort: 80,
    wssPort: 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
  },

  // Channel Configuration
  channels: {
    // Private channel patterns
    private: {
      chatroom: (chatroomId) => `presence-chatroom-${chatroomId}`,
      agent: (agentId) => `private-agent-${agentId}`,
      user: (userId) => `private-user-${userId}`,
    },
    
    // Presence channel patterns
    presence: {
      chatroom: (chatroomId) => `presence-chatroom-${chatroomId}`,
      lobby: () => `presence-lobby`,
    },
    
    // Public channel patterns
    public: {
      announcements: () => `announcements`,
      system: () => `system-updates`,
    }
  },

  // Event Configuration
  events: {
    // Chat events
    chat: {
      NEW_MESSAGE: 'new_message',
      SYSTEM_MESSAGE: 'system_message',
      TYPING_INDICATOR: 'typing_indicator',
      MESSAGE_READ: 'message_read',
      MESSAGE_DELETED: 'message_deleted',
      STATUS_CHANGE: 'status_change',
    },
    
    // User presence events
    presence: {
      USER_JOINED: 'pusher:member_added',
      USER_LEFT: 'pusher:member_removed',
      SUBSCRIPTION_SUCCEEDED: 'pusher:subscription_succeeded',
      SUBSCRIPTION_ERROR: 'pusher:subscription_error',
    },
    
    // Agent events
    agent: {
      MATCH_AVAILABLE: 'match_available',
      CREDITS_UPDATED: 'credits_updated',
      NOTIFICATION: 'notification',
    },
    
    // System events
    system: {
      MAINTENANCE_MODE: 'maintenance_mode',
      ANNOUNCEMENT: 'announcement',
      FORCE_LOGOUT: 'force_logout',
    }
  },

  // Connection Configuration
  connection: {
    // Reconnection settings
    reconnection: {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      maxReconnectAttempts: 10,
      timeoutConnect: 10000,
    },
    
    // Heartbeat settings
    heartbeat: {
      interval: 30000, // 30 seconds
      timeout: 5000,   // 5 seconds
    },
    
    // Activity timeout (disconnect after inactivity)
    activityTimeout: 300000, // 5 minutes
    pongTimeout: 10000,      // 10 seconds
  },

  // Debug Configuration
  debug: {
    enabled: true,
    logConnectionEvents: true,
    logChannelEvents: true,
    logMessageEvents: true,
    logErrors: true,
  },
};

// Environment-based configuration
export const getPusherConfig = (environment = 'development') => {
  const baseConfig = environment === 'production' ? PUSHER_CONFIG.pusher : PUSHER_CONFIG.soketi;
  
  return {
    ...baseConfig,
    auth: {
      headers: {
        'Content-Type': 'application/json',
      }
    },
    authEndpoint: '/api/v1/pusher/auth',
    ...PUSHER_CONFIG.connection,
  };
};

export default PUSHER_CONFIG;