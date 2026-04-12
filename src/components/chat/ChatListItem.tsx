// ============================================================
// ChatListItem — Single row in the chat list sidebar
// ============================================================
'use client';

import Avatar from '@/components/ui/Avatar';
import { formatChatTime, truncate } from '@/lib/utils';
import { usePresenceStore } from '@/store/presence-store';
import type { ChatWithDetails } from '@/types';

interface ChatListItemProps {
  chat: ChatWithDetails;
  isActive: boolean;
  onClick: () => void;
}

export default function ChatListItem({ chat, isActive, onClick }: ChatListItemProps) {
  const isUserOnline = usePresenceStore((s) => s.isUserOnline);

  const displayName = chat.is_group
    ? chat.group_name || 'Group'
    : chat.other_user?.display_name || 'Unknown';

  const avatarSrc = chat.is_group ? chat.group_icon_url : chat.other_user?.avatar_url;

  const lastMessagePreview = chat.last_message
    ? chat.last_message.message_type !== 'text'
      ? `📎 ${chat.last_message.message_type.charAt(0).toUpperCase() + chat.last_message.message_type.slice(1)}`
      : truncate(chat.last_message.content || '', 40)
    : 'No messages yet';

  const unreadCount = chat.my_participant?.unread_count || 0;
  const showOnline = !chat.is_group && chat.other_user ? isUserOnline(chat.other_user.id) : undefined;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 hover:bg-[var(--bg-hover)] ${
        isActive ? 'bg-[var(--bg-active)]' : ''
      }`}
    >
      <Avatar
        src={avatarSrc}
        name={displayName}
        size="lg"
        isOnline={showOnline}
      />
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <span className="font-medium text-[var(--text-primary)] truncate text-[15px]">
            {displayName}
          </span>
          {chat.last_message_at && (
            <span
              className={`text-xs shrink-0 ml-2 ${
                unreadCount > 0 ? 'text-[var(--wa-green)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {formatChatTime(chat.last_message_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-sm text-[var(--text-muted)] truncate">
            {lastMessagePreview}
          </p>
          {unreadCount > 0 && (
            <span className="shrink-0 ml-2 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-[var(--wa-green)] text-white text-xs font-bold rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
