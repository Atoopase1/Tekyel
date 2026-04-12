// ============================================================
// Chat Layout — Sidebar + Main panel (protected)
// ============================================================
'use client';

import { useEffect } from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import { useAuthStore } from '@/store/auth-store';
import { usePresence } from '@/hooks/usePresence';
import { useRealtimeChatList } from '@/hooks/useRealtimeMessages';
import Spinner from '@/components/ui/Spinner';
import { Toaster } from 'react-hot-toast';
import AppNavigation from '@/components/layout/AppNavigation';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { initialize, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Start presence tracking
  usePresence();

  // Subscribe to chat list updates
  useRealtimeChatList();

  if (!isInitialized || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-[var(--text-muted)] text-sm animate-pulse">Loading WhatsApp Clone…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[var(--bg-app)]">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
          },
        }}
      />

      {/* Main Navigation Tab Bar */}
      <AppNavigation />

      {/* Main content area wrapped properly for mobile tabs */}
      <div className="flex-1 flex min-w-0 lg:h-full h-[calc(100vh-64px)] relative">
        {/* Sidebar (Chats/etc) - now hidden on other tabs via CSS in children components if needed, or by default it's always here but on mobile we switch routes entirely. For now we will rely on route pages for the main layout. Wait, chat sidebar is currently hardcoded here. I will move ChatSidebar into the actual page contents so the layout doesn't hardcode it. Let me leave children here. */}
        <div className="flex-1 flex min-w-0 h-full w-full">
            {children}
        </div>
      </div>
    </div>
  );
}
