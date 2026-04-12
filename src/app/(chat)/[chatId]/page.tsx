// ============================================================
// Individual Chat Page — Message thread for a specific chat
// ============================================================
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import GroupInfoPanel from '@/components/chat/GroupInfoPanel';
import ChatSidebar from '@/components/chat/ChatSidebar';
import Spinner from '@/components/ui/Spinner';
import { useChatStore } from '@/store/chat-store';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useMessageStatus } from '@/hooks/useMessageStatus';

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { activeChat, setActiveChat, fetchChats, chats } = useChatStore();
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  // Subscribe to realtime messages
  useRealtimeMessages(chatId);
  useMessageStatus(chatId);

  useEffect(() => {
    // If chats not loaded yet, fetch them first
    if (chats.length === 0) {
      fetchChats().then(() => {
        setActiveChat(chatId);
      });
    } else {
      setActiveChat(chatId);
    }

    return () => {
      // Don't clear active chat on unmount to prevent flicker
    };
  }, [chatId, chats.length, fetchChats, setActiveChat]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-chat)]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex w-full h-full">
      {/* Desktop sidebar */}
      <div className="w-full max-w-[420px] lg:w-[420px] shrink-0 hidden lg:flex flex-col z-10 border-r border-[var(--border-color)]">
        <ChatSidebar />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex h-full">
        <div className="flex-1 flex flex-col min-w-0">
          <ChatHeader
            chat={activeChat}
            onInfoClick={activeChat.is_group ? () => setShowGroupInfo(!showGroupInfo) : undefined}
          />
          <MessageList chatId={chatId} isGroup={activeChat.is_group} />
          <MessageInput chatId={chatId} />
        </div>

        {/* Group info panel */}
        {activeChat.is_group && (
          <GroupInfoPanel
            chat={activeChat}
            isOpen={showGroupInfo}
            onClose={() => setShowGroupInfo(false)}
          />
        )}
      </div>
    </div>
  );
}
