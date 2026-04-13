// ============================================================
// ChatListItem — Premium row in chat list
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
      className={`w-full flex items-center gap-3.5 px-5 py-3.5 transition-all duration-200 relative group ${
        isActive 
          ? 'bg-[var(--bg-hover)]' 
          : 'hover:bg-[var(--bg-hover)]'
      }`}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[var(--emerald)]" />
      )}

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
              className={`text-[12px] shrink-0 ml-2 font-light ${
                unreadCount > 0 ? 'text-[var(--emerald)] font-medium' : 'text-[var(--text-muted)]'
              }`}
            >
              {formatChatTime(chat.last_message_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[13px] text-[var(--text-muted)] truncate leading-snug">
            {lastMessagePreview}
          </p>
          {unreadCount > 0 && (
            <span 
              className="shrink-0 ml-2 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-[var(--emerald)] text-white text-[11px] font-bold rounded-full"
              style={{ boxShadow: '0 0 8px rgba(22, 163, 74, 0.3)' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
