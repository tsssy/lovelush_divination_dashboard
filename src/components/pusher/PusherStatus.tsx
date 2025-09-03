import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import authApiService from '../../api_services/auth.js';

interface PusherStatusProps {
  className?: string;
}

export function PusherStatus({ className }: PusherStatusProps) {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const pusherService = authApiService.getPusherService();
    
    // Update connection status periodically
    const updateStatus = () => {
      const status = pusherService.getConnectionState();
      setConnectionStatus(status);
    };

    // Initial status update
    updateStatus();

    // Set up interval to update status
    const interval = setInterval(updateStatus, 1000);

    // Listen for Pusher events
    const handleConnectionSuccess = (data: any) => {
      console.log('🟢 Pusher connection established', data);
      updateStatus();
    };

    const handleConnectionDisconnected = (data: any) => {
      console.log('🔴 Pusher disconnected', data);
      updateStatus();
    };

    const handleConnectionError = (data: any) => {
      console.log('❌ Pusher connection error', data);
      updateStatus();
    };

    const handleMessage = (data: any) => {
      console.log('📨 Latest Pusher message:', data);
      setLastMessage({
        ...data,
        timestamp: new Date().toISOString()
      });
    };

    // Add event listeners
    pusherService.addEventListener('connection:success', handleConnectionSuccess);
    pusherService.addEventListener('connection:disconnected', handleConnectionDisconnected);
    pusherService.addEventListener('connection:error', handleConnectionError);
    pusherService.addEventListener('message:any', handleMessage);

    return () => {
      clearInterval(interval);
      // Remove event listeners
      pusherService.removeEventListener('connection:success', handleConnectionSuccess);
      pusherService.removeEventListener('connection:disconnected', handleConnectionDisconnected);
      pusherService.removeEventListener('connection:error', handleConnectionError);
      pusherService.removeEventListener('message:any', handleMessage);
    };
  }, []);

  const handleForceReconnect = async () => {
    setIsReconnecting(true);
    try {
      const pusherService = authApiService.getPusherService();
      await pusherService.forceReconnect();
    } catch (error) {
      console.error('Failed to force reconnect:', error);
    }
    setIsReconnecting(false);
  };

  const getStatusBadge = () => {
    if (!connectionStatus) return <Badge variant="secondary">Unknown</Badge>;
    
    const { isConnected, isConnecting, state } = connectionStatus;
    
    if (isConnected) {
      return <Badge variant="default" className="bg-green-500">Connected</Badge>;
    } else if (isConnecting) {
      return <Badge variant="secondary" className="bg-yellow-500">Connecting...</Badge>;
    } else {
      return <Badge variant="destructive">Disconnected</Badge>;
    }
  };

  const getStateEmoji = () => {
    if (!connectionStatus) return '❓';
    
    const { isConnected, isConnecting } = connectionStatus;
    
    if (isConnected) return '🟢';
    if (isConnecting) return '🟡';
    return '🔴';
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            {getStateEmoji()} Pusher Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Connection:</span>
            {getStatusBadge()}
          </div>
          
          {connectionStatus && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm">State:</span>
                <span className="text-sm font-mono">{connectionStatus.state}</span>
              </div>
              
              {connectionStatus.socketId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Socket ID:</span>
                  <span className="text-xs font-mono truncate max-w-[100px]">
                    {connectionStatus.socketId}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Channels:</span>
                <span className="text-sm">{connectionStatus.channels.length}</span>
              </div>
              
              {connectionStatus.connectionAttempts > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reconnect attempts:</span>
                  <span className="text-sm">{connectionStatus.connectionAttempts}</span>
                </div>
              )}
            </>
          )}
          
          {lastMessage && (
            <div className="border-t pt-3">
              <div className="text-xs text-muted-foreground mb-1">Latest Message:</div>
              <div className="text-xs bg-muted p-2 rounded">
                <div><strong>Channel:</strong> {lastMessage.channelName}</div>
                <div><strong>Event:</strong> {lastMessage.eventName}</div>
                <div><strong>Time:</strong> {new Date(lastMessage.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleForceReconnect}
              disabled={isReconnecting || connectionStatus?.isConnecting}
            >
              {isReconnecting ? 'Reconnecting...' : 'Force Reconnect'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}