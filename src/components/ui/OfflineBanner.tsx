// OfflineBanner — Subtle, professional "Waiting for network" indicator
'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, Wifi, Clock } from 'lucide-react';

export default function OfflineBanner() {
  const { isOnline, wasOffline, secondsOffline } = useNetworkStatus();

  // Format offline duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  // Reconnected state — brief green banner
  if (wasOffline && isOnline) {
    return (
      <div className="offline-banner offline-banner--reconnected">
        <div className="offline-banner__content">
          <div className="offline-banner__icon offline-banner__icon--online">
            <Wifi size={14} strokeWidth={2.5} />
          </div>
          <span className="offline-banner__text">Connected</span>
        </div>
      </div>
    );
  }

  // Offline state
  if (!isOnline) {
    return (
      <div className="offline-banner offline-banner--offline">
        <div className="offline-banner__content">
          <div className="offline-banner__icon offline-banner__icon--offline">
            <WifiOff size={14} strokeWidth={2.5} />
          </div>
          <span className="offline-banner__text">Waiting for network</span>
          {secondsOffline > 3 && (
            <span className="offline-banner__timer">
              <Clock size={11} strokeWidth={2.5} />
              {formatDuration(secondsOffline)}
            </span>
          )}
        </div>
        <div className="offline-banner__progress" />
      </div>
    );
  }

  return null;
}
