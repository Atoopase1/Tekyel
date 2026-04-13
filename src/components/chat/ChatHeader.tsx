// ============================================================
// ChatHeader — Premium glass header with call actions
// ============================================================
'use client';

import { ArrowLeft, Phone, Video, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import { usePresenceStore } from '@/store/presence-store';
import { useAuthStore } from '@/store/auth-store';
import { useCallStore } from '@/store/call-store';
import { formatLastSeen } from '@/lib/utils';
import type { ChatWithDetails } from '@/types';

interface ChatHeaderProps {
  chat: ChatWithDetails;
  onInfoClick?: () => void;
}

export default function ChatHeader({ chat, onInfoClick }: ChatHeaderProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { isUserOnline, getTypingUsersForChat } = usePresenceStore();
  const initiateCall = useCallStore((s) => s.initiateCall);

  const displayName = chat.is_group
    ? chat.group_name || 'Group'
    : chat.other_user?.display_name || 'Unknown';

  const avatarSrc = chat.is_group ? chat.group_icon_url : chat.other_user?.avatar_url;

  const isOnline = !chat.is_group && chat.other_user
    ? isUserOnline(chat.other_user.id)
    : undefined;

  const typingUsers = getTypingUsersForChat(chat.id).filter(
    (t) => t.user_id !== user?.id
  );

  let statusText: React.ReactNode = '';
  if (typingUsers.length > 0) {
    const names = typingUsers.map((t) => t.display_name).join(', ');
    statusText = (
      <span className="text-[var(--emerald)] font-medium flex items-center gap-1.5">
        <span className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-[var(--emerald)]" style={{ animation: 'typingBounce 1.2s infinite', animationDelay: '0ms' }} />
          <span className="w-1 h-1 rounded-full bg-[var(--emerald)]" style={{ animation: 'typingBounce 1.2s infinite', animationDelay: '200ms' }} />
          <span className="w-1 h-1 rounded-full bg-[var(--emerald)]" style={{ animation: 'typingBounce 1.2s infinite', animationDelay: '400ms' }} />
        </span>
        {chat.is_group ? `${names} typing…` : 'typing…'}
      </span>
    );
  } else if (chat.is_group) {
    const participantNames = chat.participants
      .map((p) => (p.profile?.id === user?.id ? 'You' : p.profile?.display_name || 'Unknown'))
      .join(', ');
    statusText = participantNames;
  } else if (isOnline) {
    statusText = <span className="text-[var(--emerald)] font-medium">online</span>;
  } else if (chat.other_user?.last_seen) {
    statusText = formatLastSeen(chat.other_user.last_seen);
  }

  const handleVideoCall = () => {
    if (!chat.is_group && chat.other_user) {
      initiateCall(chat.other_user, 'video');
    }
  };

  const handleAudioCall = () => {
    if (!chat.is_group && chat.other_user) {
      initiateCall(chat.other_user, 'audio');
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 glass-header border-b border-[var(--border-color)]">
      {/* Back button (mobile) */}
      <button
        onClick={() => router.push('/')}
        className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Avatar */}
      <button onClick={onInfoClick} className="shrink-0">
        <Avatar src={avatarSrc} name={displayName} size="md" isOnline={isOnline} />
      </button>

      {/* Name & Status */}
      <button onClick={onInfoClick} className="flex-1 min-w-0 text-left">
        <h2 className="font-semibold text-[var(--text-primary)] text-[15px] truncate">
          {displayName}
        </h2>
        {statusText && (
          <p className="text-[12px] text-[var(--text-muted)] truncate mt-0.5">{statusText}</p>
        )}
      </button>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        {!chat.is_group && (
          <>
            <button
              onClick={handleVideoCall}
              className="p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--emerald)]"
              title="Video call"
            >
              <Video size={19} />
            </button>
            <button
              onClick={handleAudioCall}
              className="p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--emerald)]"
              title="Audio call"
            >
              <Phone size={19} />
            </button>
          </>
        )}
        <button className="p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <Search size={19} />
        </button>
      </div>
    </div>
  );
}
