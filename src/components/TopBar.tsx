import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { StatusDisplay } from './StatusDisplay';
import { PusherStatus } from './pusher/PusherStatus';

interface TopBarProps {
  onConnect: (username: string, password: string) => void;
  onDisconnect: () => void;
  connectionData?: {
    username: string;
    password: string;
  } | null;
  authState?: {
    isAuthenticated: boolean;
    isLoadingSubAccounts?: boolean;
    subAccounts?: any[];
    currentSubAccount?: any;
    isPusherConnected?: boolean;
    agent?: {
      name: string;
      id: string;
    } | null;
  };
}

export function TopBar({ 
  onConnect, 
  onDisconnect, 
  connectionData, 
  authState 
}: TopBarProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const isConnected = !!connectionData;

  // Reset form when disconnected
  useEffect(() => {
    if (!isConnected) {
      setUsername('');
      setPassword('');
    }
  }, [isConnected]);

  const handleConnect = () => {
    if (username && password) {
      onConnect(username, password);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
  };

  return (
    <div className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h1>App Management Dashboard</h1>
        <StatusDisplay 
          isConnected={isConnected}
          domain={connectionData?.username}
          permissionLevel="Admin"
        />
        {/* Show Pusher status when connected */}
        {isConnected && authState?.isAuthenticated && (
          <PusherStatus className="max-w-xs" />
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {isConnected && authState?.isAuthenticated ? (
          // Authenticated state - show agent info, sub-accounts, and connection status
          <div className="flex items-center gap-4">
            {/* Agent Info */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Agent:</span>
              <span className="font-medium text-foreground">
                {authState?.agent?.name || connectionData?.username}
              </span>
              <span className="text-xs text-muted-foreground">
                ({authState?.agent?.id})
              </span>
            </div>

            {/* Sub-Accounts Count */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sub-Accounts:</span>
              {authState.isLoadingSubAccounts ? (
                <span className="text-xs text-muted-foreground">Loading...</span>
              ) : (
                <span className="font-medium text-green-600">
                  {authState.subAccounts?.length || 0}
                </span>
              )}
            </div>

            {/* Pusher Connection Status */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Pusher:</span>
              <span className={`font-medium ${authState.isPusherConnected ? 'text-green-600' : 'text-amber-600'}`}>
                {authState.isPusherConnected ? '✅ Connected & Subscribed' : '🔄 Connecting...'}
              </span>
            </div>

            {/* Logout Button */}
            <Button 
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
              className="text-xs"
            >
              Logout
            </Button>
          </div>
        ) : isConnected ? (
          // Connected but still processing - show progress
          <div className="flex items-center gap-4">
            <span className="text-sm text-amber-600">
              {authState?.isLoadingSubAccounts ? 'Loading sub-accounts...' : 'Authentication in progress...'}
            </span>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
            >
              Cancel
            </Button>
          </div>
        ) : (
          // Disconnected state - show login form
          <>
            <Input
              placeholder="Agent Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-32"
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-32"
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            />
            <Button 
              onClick={handleConnect}
              disabled={!username || !password}
            >
              Login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}