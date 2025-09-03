import { Badge } from './ui/badge';

interface StatusDisplayProps {
  isConnected: boolean;
  domain?: string;
  permissionLevel?: string;
}

export function StatusDisplay({ isConnected, domain, permissionLevel = 'Admin' }: StatusDisplayProps) {
  const getStatusColor = () => {
    if (!isConnected) return 'destructive';
    return 'default';
  };

  const getPermissionColor = () => {
    switch (permissionLevel.toLowerCase()) {
      case 'admin':
        return 'default';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <span className="text-base">
          {isConnected ? '📶' : '📵'}
        </span>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor()} className="text-xs">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          {isConnected && domain && (
            <span className="text-xs text-muted-foreground">
              to {domain}
            </span>
          )}
        </div>
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-border" />

      {/* Permission Level */}
      <div className="flex items-center gap-2">
        <span className="text-base">🛡️</span>
        <Badge variant={getPermissionColor()} className="text-xs">
          {permissionLevel}
        </Badge>
      </div>
    </div>
  );
}