'use client';

import { useEffect, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export function usePushNotifications() {
  const { user } = useAuthStore();
  const hasSubscribedRef = useRef(false);

  useEffect(() => {
    if (!user || hasSubscribedRef.current) return;

    const setupPush = async () => {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          return;
        }

        // Wait for the service worker to be ready
        const registration = await navigator.serviceWorker.ready;

        // Check current subscription
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          // Ask for permission if not granted
          if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return;
          } else if (Notification.permission === 'denied') {
            return;
          }

          // Subscribe
          const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!publicVapidKey) {
            console.warn('[Web Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing');
            return;
          }

          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
          });
        }

        // Extract keys
        const subJSON = subscription.toJSON();
        const endpoint = subJSON.endpoint;
        const p256dh = subJSON.keys?.p256dh;
        const auth = subJSON.keys?.auth;

        if (!endpoint || !p256dh || !auth) return;

        // Save to Supabase
        const supabase = getSupabaseBrowserClient();
        
        // We use upsert to avoid duplicate endpoint errors
        const { error } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            endpoint,
            p256dh,
            auth,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id, endpoint' });

        if (error) {
          console.warn('[Web Push] Failed to save subscription to DB:', error.message);
        } else {
          hasSubscribedRef.current = true;
          console.log('[Web Push] Successfully subscribed to background notifications');
        }

      } catch (err) {
        console.warn('[Web Push] Subscription error:', err);
      }
    };

    setupPush();
  }, [user]);
}
