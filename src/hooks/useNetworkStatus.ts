// useNetworkStatus — Track online/offline state with smart reconnect detection
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;       // true briefly after coming back online (for sync UX)
  secondsOffline: number;    // how long we've been offline
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [secondsOffline, setSecondsOffline] = useState(0);
  const offlineTimerRef = useRef<NodeJS.Timeout | null>(null);
  const offlineStartRef = useRef<number | null>(null);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setSecondsOffline(0);

    // Clear the offline timer
    if (offlineTimerRef.current) {
      clearInterval(offlineTimerRef.current);
      offlineTimerRef.current = null;
    }
    offlineStartRef.current = null;

    // Briefly show "reconnected" state
    setWasOffline(true);
    setTimeout(() => setWasOffline(false), 3000);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(false);
    offlineStartRef.current = Date.now();

    // Start counting seconds offline
    offlineTimerRef.current = setInterval(() => {
      if (offlineStartRef.current) {
        setSecondsOffline(Math.floor((Date.now() - offlineStartRef.current) / 1000));
      }
    }, 1000);
  }, []);

  useEffect(() => {
    // Initialize with current state
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) {
        handleOffline();
      }
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (offlineTimerRef.current) {
        clearInterval(offlineTimerRef.current);
      }
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline, secondsOffline };
}
