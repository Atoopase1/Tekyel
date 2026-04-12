// ============================================================
// Real-time messages hook — subscribes to new messages via Supabase Realtime
// ============================================================
'use client';

import { useEffect, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useChatStore } from '@/store/chat-store';
import type { Message } from '@/types';

export function useRealtimeMessages(chatId: string | null) {
  const addMessage = useChatStore((s) => s.addMessage);
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseBrowserClient>['channel']> | null>(null);

  useEffect(() => {
    if (!chatId) return;

    const supabase = getSupabaseBrowserClient();

    // Clean up previous subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;

          // Fetch sender profile
          const { data: sender } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newMessage.sender_id)
            .single();

          addMessage({ ...newMessage, sender: sender || undefined } as Message);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, addMessage]);
}

/**
 * Hook to subscribe to all chats for the current user (chat list updates)
 */
export function useRealtimeChatList() {
  const fetchChats = useChatStore((s) => s.fetchChats);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel('chat-list-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_participants',
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchChats]);
}
