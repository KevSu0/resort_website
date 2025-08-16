import React from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import useNetworkStatus from '@/hooks/useNetworkStatus';

export function NetworkStatusIndicator() {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  if (isOnline && !isSlowConnection) {
    return null; // Don't show anything when connection is good
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {!isOnline && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Some features may not work.</span>
          </div>
        </div>
      )}
      
      {isOnline && isSlowConnection && (
        <div className="bg-yellow-600 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Slow connection detected. Loading may take longer.</span>
          </div>
        </div>
      )}
    </div>
  );
}