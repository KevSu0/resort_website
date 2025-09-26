import { useEffect, useRef, useCallback } from 'react';
import { authService } from '../services/authService';

const INACTIVITY_CHECK_INTERVAL = 60000; // 1 minute
const WARNING_BEFORE_TIMEOUT = 30000; // 30 seconds

export interface SessionTimeoutConfig {
  onTimeout?: () => void;
  onWarning?: (timeRemaining: number) => void;
  enabled?: boolean;
}

export function useSessionTimeout(config: SessionTimeoutConfig = {}) {
  const { onTimeout, onWarning, enabled = true } = config;
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const warningRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastActivityRef = useRef(Date.now());
  const isWarningShown = useRef(false);

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    isWarningShown.current = false;

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    if (!enabled) return;

    // Set warning timer
    warningRef.current = setTimeout(() => {
      const timeRemaining = 15 * 60 * 1000 - INACTIVITY_CHECK_INTERVAL;
      if (onWarning && !isWarningShown.current) {
        onWarning(timeRemaining);
        isWarningShown.current = true;
      }
    }, 15 * 60 * 1000 - WARNING_BEFORE_TIMEOUT - INACTIVITY_CHECK_INTERVAL);

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      if (onTimeout) {
        onTimeout();
      } else {
        authService.logout();
        window.location.reload();
      }
    }, 15 * 60 * 1000);
  }, [onTimeout, onWarning, enabled]);

  const handleActivity = useCallback(() => {
    if (!enabled) return;

    // Extend session if needed
    authService.extendSession();
    resetTimers();
  }, [resetTimers, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Activity listeners
    const events = [
      'mousedown', 'mousemove', 'keypress',
      'scroll', 'touchstart', 'click',
      'keydown', 'wheel'
    ];

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
      handleActivity();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Check for inactivity periodically
    const intervalId = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      if (timeSinceActivity >= 15 * 60 * 1000) {
        if (onTimeout) {
          onTimeout();
        } else {
          authService.logout();
          window.location.reload();
        }
      }
    }, INACTIVITY_CHECK_INTERVAL);

    // Initialize timers
    resetTimers();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      clearInterval(intervalId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [resetTimers, handleActivity, onTimeout, enabled]);

  return {
    resetTimers,
    timeRemaining: Math.max(0, 15 * 60 * 1000 - (Date.now() - lastActivityRef.current))
  };
}