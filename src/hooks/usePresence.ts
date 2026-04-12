// ============================================================
// Presence hook — online status & typing indicators
// ============================================================
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { usePresenceStore } from '@/store/presence-store';
import { useAuthStore } from '@/store/auth-store';

/**
 * Track current user's online presence and subscribe to others' presence
 */
export function usePresence() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const { setUserOnline, setUserOffline, setOnlineUsers } = usePresenceStore();

  useEffect(() => {
    if (!user) return;

    const supabase = getSupabaseBrowserClient();

    // Set user online
    supabase
      .from('profiles')
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq('id', user.id)
      .then();

    // Track presence via Supabase Realtime Presence
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineIds = Object.keys(state);
        setOnlineUsers(onlineIds);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key) setUserOnline(key);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key) setUserOffline(key);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            display_name: profile?.display_name || 'User',
            online_at: new Date().toISOString(),
          });
        }
      });

    // Handle page visibility / beforeunload
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        supabase
          .from('profiles')
          .update({ is_online: false, last_seen: new Date().toISOString() })
          .eq('id', user.id)
          .then();
      } else {
        supabase
          .from('profiles')
          .update({ is_online: true })
          .eq('id', user.id)
          .then();
      }
    };

    const handleBeforeUnload = () => {
      // Use fetch with keepalive for reliability on page close
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`;
      const body = JSON.stringify({ is_online: false, last_seen: new Date().toISOString() });
      try {
        fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            'Prefer': 'return=minimal',
          },
          body,
          keepalive: true,
        });
      } catch {
        // Best-effort on unload
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      supabase.removeChannel(channel);

      supabase
        .from('profiles')
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('id', user.id)
        .then();
    };
  }, [user, profile, setUserOnline, setUserOffline, setOnlineUsers]);
}

/**
 * Hook to send "typing" indicator to a specific chat
 */
export function useTypingIndicator(chatId: string | null) {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const { addTypingUser } = usePresenceStore();
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseBrowserClient>['channel']> | null>(null);
  const lastTypingRef = useRef<number>(0);

  useEffect(() => {
    if (!chatId || !user) return;

    const supabase = getSupabaseBrowserClient();

    const channel = supabase.channel(`typing:${chatId}`);

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== user.id) {
          addTypingUser({
            user_id: payload.user_id,
            display_name: payload.display_name,
            chat_id: chatId,
          });
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user, addTypingUser]);

  const sendTyping = useCallback(() => {
    if (!channelRef.current || !user || !chatId) return;

    // Throttle to once per 2 seconds
    const now = Date.now();
    if (now - lastTypingRef.current < 2000) return;
    lastTypingRef.current = now;

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        display_name: profile?.display_name || 'User',
      },
    });
  }, [user, profile, chatId]);

  return { sendTyping };
}
