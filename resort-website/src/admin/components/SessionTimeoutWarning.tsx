import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { Clock, RefreshCw } from 'lucide-react';

interface SessionTimeoutWarningProps {
  onTimeout?: () => void;
}

export function SessionTimeoutWarning({ onTimeout }: SessionTimeoutWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const handleWarning = useCallback((time: number) => {
    setShowWarning(true);
    setTimeRemaining(time);
  }, []);

  const { resetTimers } = useSessionTimeout({
    onWarning: handleWarning,
    onTimeout,
    enabled: true
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (showWarning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1000;
          if (newTime <= 0) {
            setShowWarning(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showWarning, timeRemaining]);

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Session Expiring Soon
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-300">
              Your session will expire in {formatTime(timeRemaining)}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                resetTimers();
                setShowWarning(false);
              }}
              className="h-8 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Stay Logged In
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onTimeout?.();
              }}
              className="h-8 text-xs"
            >
              Logout Now
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}