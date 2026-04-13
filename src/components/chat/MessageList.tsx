// ============================================================
// MessageList — Scrollable message list with date separators
// ============================================================
'use client';

import { useRef, useEffect, useCallback } from 'react';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import Spinner from '@/components/ui/Spinner';
import { useChatStore } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';
import { usePresenceStore } from '@/store/presence-store';
import { formatDateSeparator } from '@/lib/utils';
import type { Message } from '@/types';
import { Pin } from 'lucide-react';

interface MessageListProps {
  chatId: string;
  isGroup: boolean;
}

export default function MessageList({ chatId, isGroup }: MessageListProps) {
  const messages = useChatStore((s) => s.messages);
  const isLoadingMessages = useChatStore((s) => s.isLoadingMessages);
  const hasMoreMessages = useChatStore((s) => s.hasMoreMessages);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const activeChat = useChatStore(s => s.activeChat);
  const user = useAuthStore((s) => s.user);
  const typingUsersAll = usePresenceStore((s) => s.typingUsers);
  const typingUsers = typingUsersAll.filter((t) => t.chat_id === chatId);

  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isAutoScrollRef = useRef(true);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAutoScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initial scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [chatId]);

  // Track if user is near bottom
  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    isAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 100;

    // Load more messages when scrolled to top
    if (scrollTop < 50 && hasMoreMessages && !isLoadingMessages && messages.length > 0) {
      const oldScrollHeight = scrollHeight;
      fetchMessages(chatId, messages[0].created_at).then(() => {
        // Maintain scroll position after prepending
        requestAnimationFrame(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight - oldScrollHeight;
          }
        });
      });
    }
  }, [chatId, hasMoreMessages, isLoadingMessages, messages, fetchMessages]);

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const dateStr = new Date(msg.created_at).toDateString();
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, messages: [msg] });
    }
  });

  const filteredTyping = typingUsers.filter((t) => t.user_id !== user?.id);

  const pinnedMessage = activeChat?.pinned_message_id 
    ? messages.find(m => m.id === activeChat.pinned_message_id) 
    : null;

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-[var(--bg-chat)]" style={{
      backgroundImage: 'var(--chat-bg-pattern)',
      backgroundSize: '400px',
      backgroundRepeat: 'repeat',
    }}>
      {pinnedMessage && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-[var(--bg-header)]/95 backdrop-blur-sm border-b border-[var(--border-color)] p-2 px-4 shadow-sm flex items-center gap-3 cursor-pointer" onClick={() => {
          // Optional: scroll to message
        }}>
          <Pin size={16} className="text-[var(--wa-green)] shrink-0" />
          <div className="flex-1 min-w-0 border-l-4 border-[var(--wa-green)] pl-2">
            <p className="text-xs font-semibold text-[var(--wa-green)] mb-0.5">Pinned Message</p>
            <p className="text-sm text-[var(--text-secondary)] truncate">{pinnedMessage.content || (pinnedMessage.media_url ? '[Media]' : '')}</p>
          </div>
        </div>
      )}

      <div
        ref={listRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto scrollbar-thin ${pinnedMessage ? 'pt-16' : ''}`}
      >
      {/* Loading spinner for older messages */}
      {isLoadingMessages && messages.length > 0 && (
        <Spinner size="sm" className="py-4" />
      )}

      {/* Initial loading */}
      {isLoadingMessages && messages.length === 0 && (
        <Spinner className="mt-20" />
      )}

      {/* Messages */}
      <div className="py-2">
        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-3">
              <span className="px-3 py-1 bg-[var(--bg-date-separator)] text-[var(--text-muted)] text-xs rounded-lg shadow-sm">
                {formatDateSeparator(group.date)}
              </span>
            </div>
            {/* Messages for this date */}
            {group.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_id === user?.id}
                showSenderName={isGroup}
              />
            ))}
          </div>
        ))}

        {/* Typing indicator */}
        <TypingIndicator names={filteredTyping.map((t) => t.display_name)} />
      </div>

      <div ref={bottomRef} />
      </div>
    </div>
  );
}
