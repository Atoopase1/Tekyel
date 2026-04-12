// ============================================================
// Message status hook — track delivery & read receipts
// ============================================================
'use client';

import { useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';

export function useMessageStatus(chatId: string | null) {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!chatId || !user) return;

    const supabase = getSupabaseBrowserClient();

    // Subscribe to message_status changes to update tick marks
    const channel = supabase
      .channel(`status:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_status',
        },
        (payload) => {
          // Could update local message status here for real-time tick changes
          // For now, the status is fetched with messages
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user]);
}
