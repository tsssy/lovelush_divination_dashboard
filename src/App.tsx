import { useState, useCallback, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Navigation } from './components/Navigation';
import { ChatInterface } from './components/ChatInterface';
import { ProductManagement } from './components/ProductManagement';
import { InappCampaign } from './components/InappCampaign';
import { Statistics } from './components/Statistics';
import { Settings } from './components/Settings';
import authApiService from './api_services/auth.js';
import { Toaster } from 'sonner';

interface ConnectionData {
  username: string;
  password: string;
}

interface AuthState {
  isAuthenticated: boolean;
  userSession: any | null;
  isConnecting: boolean;
  error: string | null;
  agent: any | null;
  subAccounts: any[];
  currentSubAccount: any | null;
  isLoadingSubAccounts: boolean;
  isPusherConnected: boolean;
}

export default function App() {
  const [activeSection, setActiveSection] = useState('chat');
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userSession: null,
    isConnecting: false,
    error: null,
    agent: null,
    subAccounts: [],
    currentSubAccount: null,
    isLoadingSubAccounts: false,
    isPusherConnected: false
  });

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await authApiService.restoreSession();
        if (session) {
          setAuthState({
            isAuthenticated: true,
            userSession: session,
            isConnecting: false,
            error: null,
            agent: session.agent,
            subAccounts: [],
            currentSubAccount: null,
            isLoadingSubAccounts: false,
            isPusherConnected: false
          });
          
          // Load sub-accounts after restoring session (but don't auto-connect Pusher)
          await loadSubAccounts(session);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    };
    
    restoreSession();
  }, []);

  // Load sub-accounts function following HTML example pattern
  const loadSubAccounts = useCallback(async (session = null) => {
    const currentSession = session || authApiService.getSession();
    if (!currentSession) return;

    try {
      setAuthState(prev => ({ ...prev, isLoadingSubAccounts: true, error: null }));
      
      console.log('🚀 Loading sub-accounts...');
      const subAccounts = await authApiService.loadSubAccounts();
      
      setAuthState(prev => ({ 
        ...prev, 
        subAccounts,
        isLoadingSubAccounts: false
      }));
      
      console.log(`✅ Loaded ${subAccounts.length} sub-accounts`);
    } catch (error) {
      console.error('❌ Failed to load sub-accounts:', error);
      setAuthState(prev => ({ 
        ...prev, 
        error: `Failed to load sub-accounts: ${error.message}`,
        isLoadingSubAccounts: false
      }));
    }
  }, []);

  const handleConnect = useCallback(async (username: string, password: string) => {
    const newConnectionData = { username, password };
    setConnectionData(newConnectionData);
    
    try {
      setAuthState(prev => ({ ...prev, isConnecting: true, error: null }));
      
      console.log('🔌 Step 1: Authenticating agent...', { username });
      
      // Step 1: Agent login and get JWT token
      const authResponse = await authApiService.agent_login(username, password);
      
      if (authResponse.code === 200) {
        const session = authApiService.getSession();
        
        // Update state after successful authentication
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          userSession: session,
          agent: session?.agent || null,
          isLoadingSubAccounts: true
        }));
        
        console.log('✅ Step 1 complete: Authentication successful');
        console.log('🚀 Step 2: Loading sub-accounts...');
        
        // Step 2: Load sub-accounts after successful authentication
        const subAccounts = await authApiService.loadSubAccounts();
        
        setAuthState(prev => ({ 
          ...prev, 
          subAccounts,
          isLoadingSubAccounts: false
        }));
        
        console.log(`✅ Step 2 complete: Loaded ${subAccounts.length} sub-accounts`);
        console.log('🚀 Step 3: Connecting to Pusher...');
        
        // Step 3: Initialize Pusher connection
        await authApiService.initializePusherConnection();
        
        // Step 4 is automatically handled inside initializePusherConnection() 
        // which calls subscribeToAgentAndChatrooms()
        
        setAuthState(prev => ({
          ...prev,
          isConnecting: false,
          isPusherConnected: true,
          error: null
        }));
        
        console.log('✅ All steps complete: Agent authenticated, sub-accounts loaded, Pusher connected, and subscribed to all chatrooms');
        
      } else {
        throw new Error(authResponse.msg || 'Authentication failed');
      }
    } catch (err) {
      console.error('❌ Login process failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login process failed';
      setAuthState({
        isAuthenticated: false,
        userSession: null,
        isConnecting: false,
        error: errorMessage,
        agent: null,
        subAccounts: [],
        currentSubAccount: null,
        isLoadingSubAccounts: false,
        isPusherConnected: false
      });
      // Keep connectionData but mark as unauthenticated
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    authApiService.logout();
    setConnectionData(null);
    setAuthState({
      isAuthenticated: false,
      userSession: null,
      isConnecting: false,
      error: null,
      agent: null,
      subAccounts: [],
      currentSubAccount: null,
      isLoadingSubAccounts: false,
      isPusherConnected: false
    });
    console.log('🔌 Disconnected from account');
  }, []);

  const renderMainContent = () => {
    // Show authentication required screen for all pages if not authenticated
    if (!authState.isAuthenticated) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md mx-auto p-6">
            {authState.isConnecting ? (
              <>
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-2xl font-semibold mb-4">Authenticating...</h2>
                <p className="text-muted-foreground mb-4">
                  Getting authentication token from API
                </p>
                <div className="animate-pulse bg-muted h-2 rounded-full">
                  <div className="bg-primary h-2 rounded-full w-3/4"></div>
                </div>
              </>
            ) : authState.error ? (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-semibold mb-4">Authentication Failed</h2>
                <p className="text-red-600 mb-6">{authState.error}</p>
                <p className="text-muted-foreground">
                  Please use the Connect button in the top bar to authenticate and access the dashboard.
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
                <p className="text-muted-foreground mb-6">
                  You need to connect and authenticate to access the dashboard.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    📝 Use the <strong>Connect</strong> button in the top bar to:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Enter your domain and credentials</li>
                    <li>• Obtain a JWT token for API access</li>
                    <li>• Access all dashboard features</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    // Only render actual content when authenticated
    switch (activeSection) {
      case 'chat':
        return <ChatInterface authState={authState} />;
      case 'products':
        return <ProductManagement authState={authState} />;
      case 'campaign':
        return <InappCampaign authState={authState} />;
      case 'statistics':
        return <Statistics authState={authState} />;
      case 'settings':
        return <Settings authState={authState} />;
      default:
        return <ChatInterface authState={authState} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <TopBar 
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        connectionData={connectionData}
        authState={authState}
      />
      
      {/* Navigation Bar */}
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-background">
        {renderMainContent()}
      </div>
      
      {/* Sonner Toast Notifications */}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={5000}
      />
    </div>
  );
}