import httpRequests from '../http_requests.js';
import CONFIG from '../config.js';
import pusherService from '../services/pusher-service.js';

class AuthApiService {
  constructor() {
    this.userSession = null;
  }

  // Agent login using OAuth2 form authentication - following exact example pattern
  async agent_login(username, password) {
    try {
      console.log("🖱️ Starting authentication process...", { username });

      if (!username || !password) {
        console.log("❌ Missing username or password", 'warning');
        throw new Error("Please enter username and password");
      }

      // Create form data exactly like the example
      const form = new URLSearchParams();
      form.set("username", username);
      form.set("password", password);

      console.log("🔄 Making authentication request...");
      
      const resp = await fetch(`${CONFIG.api.base_url}/api/v1/agents/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: form.toString()
      });

      const result = await resp.json();

      if (!resp.ok) {
        const errMsg = result?.msg || result?.detail || `HTTP ${resp.status}`;
        console.log(`❌ Authentication failed: ${errMsg}`, 'error');
        throw new Error(errMsg);
      }

      // Expecting { code, msg, data: {...} } or direct data from agent-auth API
      const responseData = result.data || result;
      
      if (!responseData || typeof responseData !== "object") {
        console.log("❌ Login response format incorrect (missing data)", 'error');
        throw new Error("Login response format incorrect (missing data)");
      }

      const data = responseData;
      const token = data.access_token;
      const userId = data.agent?.id;

      if (!token) {
        console.log("❌ No token received from authentication (access_token/token)", 'error');
        throw new Error("No token received from authentication");
      }
      if (!userId) {
        console.log("❌ No agent ID received from authentication (agent.id)", 'error');
        throw new Error("No agent ID received from authentication");
      }

      console.log(`✅ Authentication successful (agent_id=${userId}). JWT and agent ID received.`, 'success');

      const response = {
        code: 200,
        msg: 'Authentication successful',
        data: {
          access_token: token,
          refresh_token: data.refresh_token,
          token_type: data.token_type || 'Bearer',
          expires_at: data.expires_at,
          agent: data.agent
        }
      };

      // If successful, store the session data and set auth token
      this.userSession = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        token_type: response.data.token_type,
        expires_at: response.data.expires_at,
        agent: response.data.agent
      };
      
      // Set the auth token for future requests
      httpRequests.setAuthToken(response.data.access_token);
      
      // Store in localStorage for persistence
      localStorage.setItem('userSession', JSON.stringify(this.userSession));
      
      console.log('✅ Authentication successful, session stored');

      return response;
    } catch (error) {
      console.error('❌ Authentication request exception:', error.message);
      throw error;
    }
  }

  // Get Pusher configuration from API using access token
  async getPusherConfig() {
    if (!this.userSession?.access_token) {
      throw new Error('No authentication session available for config API');
    }

    try {
      console.log('🔄 Getting Pusher configuration from API...');
      
      const token = this.userSession.access_token.startsWith('Bearer ') ? 
        this.userSession.access_token : 
        `Bearer ${this.userSession.access_token}`;

      console.log('📤 CONFIG API REQUEST:');
      console.log('URL:', `${CONFIG.api.base_url}/api/v1/pusher/config`);
      console.log('Method: GET');
      console.log('Headers:', {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": token.substring(0, 20) + '...' // Don't log full token
      });

      const resp = await fetch(`${CONFIG.api.base_url}/api/v1/pusher/config`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": token
        }
      });

      console.log('📥 CONFIG API RESPONSE:');
      console.log('Status:', resp.status, resp.statusText);
      console.log('Headers:', Object.fromEntries(resp.headers.entries()));

      const result = await resp.json();
      console.log('Response Body:', JSON.stringify(result, null, 2));

      if (!resp.ok) {
        const errMsg = result?.msg || result?.detail || `HTTP ${resp.status}`;
        console.log(`❌ Config API failed: ${errMsg}`, 'error');
        throw new Error(errMsg);
      }

      // Handle backend wrapper: {code,msg,data:{...}}
      const configData = result?.data || result;
      
      console.log('✅ Pusher configuration received from API');
      console.log('Config Data:', JSON.stringify(configData, null, 2));
      return configData;
    } catch (error) {
      console.error('❌ Config API request exception:', error.message);
      throw error;
    }
  }

  // Logout and clear session
  logout() {
    // Stop auto-resubscription monitoring
    this.stopAutoResubscription();
    
    // Disconnect Pusher first
    try {
      pusherService.disconnect();
      console.log('✅ Pusher disconnected during logout');
    } catch (error) {
      console.warn('⚠️ Error disconnecting Pusher during logout:', error);
    }
    
    this.userSession = null;
    httpRequests.setAuthToken(null);
    localStorage.removeItem('userSession');
  }

  // Restore session from localStorage
  async restoreSession() {
    try {
      const storedSession = localStorage.getItem('userSession');
      if (storedSession) {
        this.userSession = JSON.parse(storedSession);
        
        // Check if token is still valid
        const expiresAt = new Date(this.userSession.expires_at);
        if (expiresAt > new Date()) {
          httpRequests.setAuthToken(this.userSession.access_token);
          
          // Don't reinitialize Pusher automatically - wait for user to click Connect
          console.log('✅ Session restored, Pusher connection will be initialized when Connect is clicked');
          
          return this.userSession;
        } else {
          // Token expired, clear session
          this.logout();
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      this.logout();
    }
    return null;
  }

  // Get current session
  getSession() {
    return this.userSession;
  }

  // Check if user is authenticated
  isAuthenticated() {
    if (!this.userSession) return false;
    
    // Check token expiration
    const expiresAt = new Date(this.userSession.expires_at);
    return expiresAt > new Date();
  }

  // Get agent info
  getAgentInfo() {
    return this.userSession?.agent || null;
  }

  // Refresh token (if needed in the future)
  async refreshToken() {
    if (!this.userSession?.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      // This endpoint would need to be implemented on the backend
      const response = await httpRequests.post('/api/v1/agents/refresh', {
        refresh_token: this.userSession.refresh_token
      });

      if (response.code === 200) {
        this.userSession.access_token = response.data.access_token;
        this.userSession.expires_at = response.data.expires_at;
        
        httpRequests.setAuthToken(response.data.access_token);
        localStorage.setItem('userSession', JSON.stringify(this.userSession));
      }

      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      throw error;
    }
  }
  // Load sub-accounts (following exact HTML example pattern)
  async loadSubAccounts() {
    if (!this.userSession?.access_token) {
      throw new Error('No authentication session available for sub-accounts API');
    }

    try {
      const response = await fetch(`${CONFIG.api.base_url}/api/v1/agents/sub-accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.userSession.access_token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        const errMsg = result?.msg || result?.detail || `HTTP ${response.status}`;
        console.log(`❌ Sub-accounts API failed: ${errMsg}`, 'error');
        throw new Error(errMsg);
      }

      const subAccounts = result.data?.sub_accounts || [];
      console.log(`✅ Loaded ${subAccounts.length} sub-accounts`);
      return subAccounts;
    } catch (error) {
      console.error('❌ Failed to load sub-accounts:', error.message);
      throw error;
    }
  }

  // Switch to a sub-account (following exact HTML example pattern)
  switchSubAccount(subAccountId) {
    if (!this.userSession) {
      throw new Error('No authentication session available');
    }
    
    this.userSession.currentSubAccountId = subAccountId;
    localStorage.setItem('userSession', JSON.stringify(this.userSession));
    console.log(`✅ Switched to sub-account: ${subAccountId}`);
  }

  // Get current sub-account ID
  getCurrentSubAccountId() {
    return this.userSession?.currentSubAccountId || null;
  }

  // Manually initialize Pusher connection (called when Connect button is clicked) - following exact example pattern
  async initializePusherConnection() {
    if (!this.userSession?.access_token) {
      throw new Error('No authentication session available for Pusher connection');
    }

    try {
      console.log('🔌 Initializing Pusher connection on user request...');
      
      // First get Pusher configuration from API
      const pusherConfig = await this.getPusherConfig();
      
      // Initialize Pusher using the dynamic config from API, following the example
      await pusherService.initializeWithConfig(
        this.userSession.access_token,
        this.userSession.agent.id,
        pusherConfig
      );
      
      // Subscribe to private-agent-{agent_id} channel with retry logic
      const agentId = this.userSession.agent.id;
      const privateUserChannel = `private-agent-${agentId}`;
      console.log(`🔔 Subscribing to private-agent channel: ${privateUserChannel}`);
      
      let subscriptionSuccess = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!subscriptionSuccess && attempts < maxAttempts) {
        attempts++;
        try {
          console.log(`🔔 Attempting to subscribe to ${privateUserChannel} (attempt ${attempts}/${maxAttempts})...`);
          
          // Subscribe to private-agent-{agent_id} channel directly with ALL events
          const userChannel = pusherService.subscribeToChannel(privateUserChannel, {
            'notification': (data) => {
              console.log(`🔔 User notification received on ${privateUserChannel}:`, data);
              // TODO: Implement actual notification handling mechanism later
            },
            'message.new_in_chatroom': (data) => {
              console.log(`💬 New chatroom message received on ${privateUserChannel}:`, data);
              // This will be handled by the general message handler
            }
          });
          
          if (userChannel) {
            subscriptionSuccess = true;
            console.log(`✅ Successfully subscribed to ${privateUserChannel}`);
          } else {
            throw new Error('Failed to create private-agent channel subscription');
          }
          
        } catch (error) {
          console.error(`❌ Failed to subscribe to ${privateUserChannel} (attempt ${attempts}/${maxAttempts}):`, error);
          
          if (attempts >= maxAttempts) {
            console.error(`❌ Failed to subscribe to private-agent channel after ${maxAttempts} attempts`);
            throw new Error(`Failed to subscribe to private-agent channel after ${maxAttempts} attempts: ${error.message}`);
          }
          
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      console.log('✅ Pusher connected successfully with private-agent channel subscription');
      
      // Start auto-resubscription monitoring
      this.startAutoResubscription();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Pusher connection:', error);
      throw error;
    }
  }

  // Auto-resubscribe to private-agent channel (called on reconnection)
  async ensurePrivateAgentSubscription() {
    if (!this.userSession?.agent?.id) {
      console.warn('⚠️ No agent ID available for private-agent subscription');
      return;
    }

    const agentId = this.userSession.agent.id;
    const privateAgentChannel = `private-agent-${agentId}`;
    
    try {
      console.log(`🔄 Ensuring private-agent subscription: ${privateAgentChannel}`);
      const pusherService = this.getPusherService();
      
      // Check if already subscribed
      if (pusherService.hasChannel(privateAgentChannel)) {
        console.log(`✅ Already subscribed to ${privateAgentChannel}`);
        return true;
      }
      
      // Subscribe to private-agent channel
      const agentChannel = pusherService.subscribeToChannel(privateAgentChannel, {
        'notification': (data) => {
          console.log(`🔔 Agent notification received on ${privateAgentChannel}:`, data);
          // TODO: Implement actual notification handling mechanism later
        }
      });
      
      if (agentChannel) {
        console.log(`✅ Successfully resubscribed to ${privateAgentChannel}`);
        return true;
      } else {
        throw new Error('Failed to create private-agent channel subscription');
      }
      
    } catch (error) {
      console.error(`❌ Failed to ensure private-agent subscription:`, error);
      return false;
    }
  }

  // Start auto-resubscription monitoring
  startAutoResubscription() {
    if (!this.userSession?.agent?.id) {
      console.warn('⚠️ Cannot start auto-resubscription without agent ID');
      return;
    }

    console.log('🔄 Starting auto-resubscription monitoring for private-agent channel');
    
    const pusherService = this.getPusherService();
    
    // Listen for connection success events to resubscribe
    pusherService.addEventListener('connection:success', async () => {
      console.log('🔄 Connection restored, ensuring private-agent subscription...');
      await this.ensurePrivateAgentSubscription();
    });

    // Set up periodic check (every 30 seconds)
    this.resubscriptionInterval = setInterval(async () => {
      const connectionState = pusherService.getConnectionState();
      if (connectionState.isConnected) {
        await this.ensurePrivateAgentSubscription();
      }
    }, 30000);

    console.log('✅ Auto-resubscription monitoring started');
  }

  // Stop auto-resubscription monitoring
  stopAutoResubscription() {
    if (this.resubscriptionInterval) {
      clearInterval(this.resubscriptionInterval);
      this.resubscriptionInterval = null;
      console.log('🛑 Auto-resubscription monitoring stopped');
    }
  }
  async subscribeToChatroom(chatroomId, subAccountName = '') {
    if (!this.userSession?.access_token) {
      throw new Error('No authentication session available for chatroom subscription');
    }

    try {
      console.log(`🔔 Subscribing to individual chatroom: ${chatroomId} (${subAccountName})`);
      const pusherService = this.getPusherService();
      
      const channelName = `presence-chatroom-${chatroomId}`;
      pusherService.subscribeToChannel(channelName, {
        // Event handlers for real-time chat events
        'new_message': (data) => {
          console.log(`💬 [${subAccountName}] New message in chatroom ${chatroomId}:`, data);
        },
        'system_message': (data) => {
          console.log(`🔔 [${subAccountName}] System message in chatroom ${chatroomId}:`, data);
        },
        'user_joined': (data) => {
          console.log(`👋 [${subAccountName}] User joined chatroom ${chatroomId}:`, data);
        },
        'typing_indicator': (data) => {
          console.log(`⌨️ [${subAccountName}] Typing indicator in chatroom ${chatroomId}:`, data);
        },
        'status_change': (data) => {
          console.log(`📊 [${subAccountName}] Status change in chatroom ${chatroomId}:`, data);
        },
        // Presence channel specific events
        'pusher:subscription_succeeded': (members) => {
          console.log(`✅ [${subAccountName}] Joined presence chatroom ${chatroomId}. Members:`, members);
          console.log(`👥 Current members count: ${members.count}`);
          console.log(`🔍 My user_id in presence: ${members.me?.id}`);
          console.log(`📋 My user_info: ${JSON.stringify(members.me?.info)}`);
          members.each((member) => {
            console.log(`👤 Member: ${member.info.name} (${member.info.type}) - ID: ${member.id}`);
          });
          
          // Presence registration complete - member info logged above
          console.log(`🎯 [${subAccountName}] Successfully registered presence for chatroom ${chatroomId}`);
        },
        'pusher:member_added': (member) => {
          console.log(`👋 [${subAccountName}] Agent joined chatroom ${chatroomId}:`, member.info);
          console.log(`🆔 Added member ID: ${member.id}`);
        },
        'pusher:member_removed': (member) => {
          console.log(`👋 [${subAccountName}] Agent left chatroom ${chatroomId}:`, member.info);
          console.log(`🆔 Removed member ID: ${member.id}`);
        }
      });
      
      console.log(`✅ Successfully subscribed to chatroom ${chatroomId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to subscribe to chatroom ${chatroomId}:`, error);
      throw error;
    }
  }

  // Unsubscribe from a specific chatroom
  async unsubscribeFromChatroom(chatroomId, subAccountName = '') {
    try {
      console.log(`🔕 Unsubscribing from chatroom: ${chatroomId} (${subAccountName})`);
      const pusherService = this.getPusherService();
      
      const channelName = `presence-chatroom-${chatroomId}`;
      pusherService.unsubscribeFromChannel(channelName);
      
      console.log(`✅ Successfully unsubscribed from chatroom ${chatroomId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to unsubscribe from chatroom ${chatroomId}:`, error);
      throw error;
    }
  }
  async subscribeToAgentAndChatrooms() {
    try {
      // DON'T subscribe to agent channel - the HTML example doesn't do this
      // Instead, just load chatrooms for all sub-accounts and let them be subscribed to individually
      
      // Load chatrooms for all sub-accounts and subscribe to them
      console.log('🚀 Loading chatrooms for all sub-accounts...');
      
      // Get all sub-accounts (we already loaded them, so get from session or reload)
      let subAccounts = [];
      try {
        subAccounts = await this.loadSubAccounts();
      } catch (error) {
        console.error('❌ Failed to reload sub-accounts for chatroom subscription:', error);
        return; // Exit early if we can't get sub-accounts
      }
      
      // For each sub-account, load their chatrooms and subscribe
      for (const subAccount of subAccounts) {
        try {
          console.log(`📋 Loading chatrooms for sub-account: ${subAccount.display_name} (${subAccount.id})`);
          
          // Load chatrooms for this sub-account using chat API service
          const response = await fetch(`${CONFIG.api.base_url}/api/v1/agent/chatrooms/?sub_account_id=${subAccount.id}`, {
            headers: {
              'Authorization': `Bearer ${this.userSession.access_token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const result = await response.json();
          
          if (response.ok && result.data) {
            const chatrooms = result.data || [];
            
            console.log(`📋 Found ${chatrooms.length} chatrooms for ${subAccount.display_name}`);
            
            // Subscribe to each chatroom following the HTML example pattern
            for (const chatroom of chatrooms) {
              try {
                console.log(`🔔 Subscribing to chatroom: ${chatroom.id} (${subAccount.display_name})`);
                pusherService.subscribeToChatroom(chatroom.id, {
                  // Event handlers for real-time chat events - following HTML example
                  'new_message': (data) => {
                    console.log(`💬 [${subAccount.display_name}] New message in chatroom ${chatroom.id}:`, data);
                  },
                  'system_message': (data) => {
                    console.log(`🔔 [${subAccount.display_name}] System message in chatroom ${chatroom.id}:`, data);
                  },
                  'user_joined': (data) => {
                    console.log(`👋 [${subAccount.display_name}] User joined chatroom ${chatroom.id}:`, data);
                  },
                  'typing_indicator': (data) => {
                    console.log(`⌨️ [${subAccount.display_name}] Typing indicator in chatroom ${chatroom.id}:`, data);
                  },
                  'status_change': (data) => {
                    console.log(`📊 [${subAccount.display_name}] Status change in chatroom ${chatroom.id}:`, data);
                  }
                });
              } catch (error) {
                console.error(`❌ Failed to subscribe to chatroom ${chatroom.id}:`, error);
              }
            }
          } else {
            console.warn(`⚠️ Failed to load chatrooms for sub-account ${subAccount.id}:`, result.msg || result.detail || 'Unknown error');
          }
        } catch (error) {
          console.error(`❌ Error loading chatrooms for sub-account ${subAccount.id}:`, error);
        }
      }
      
      console.log('✅ Completed subscribing to all chatroom channels');
    } catch (error) {
      console.error('❌ Failed to subscribe to chatrooms:', error);
      throw error;
    }
  }

  // Get Pusher service instance
  getPusherService() {
    return pusherService;
  }

  // Get Pusher connection status
  getPusherStatus() {
    return pusherService.getConnectionState();
  }
}

const authApiService = new AuthApiService();

export default authApiService;
export { AuthApiService };