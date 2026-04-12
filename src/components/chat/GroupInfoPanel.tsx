// ============================================================
// GroupInfoPanel — Group details side panel
// ============================================================
'use client';

import { X } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth-store';
import { usePresenceStore } from '@/store/presence-store';
import type { ChatWithDetails } from '@/types';

interface GroupInfoPanelProps {
  chat: ChatWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export default function GroupInfoPanel({ chat, isOpen, onClose }: GroupInfoPanelProps) {
  const user = useAuthStore((s) => s.user);
  const isUserOnline = usePresenceStore((s) => s.isUserOnline);

  if (!isOpen) return null;

  const isAdmin = chat.participants.some(
    (p) => p.user_id === user?.id && p.role === 'admin'
  );

  return (
    <div className="w-80 h-full bg-[var(--bg-primary)] border-l border-[var(--border-color)] flex flex-col animate-slideInRight">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-[var(--bg-header)] border-b border-[var(--border-color)]">
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-muted)]"
        >
          <X size={20} />
        </button>
        <h2 className="font-semibold text-[var(--text-primary)]">Group info</h2>
      </div>

      {/* Group details */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center py-6 px-4 border-b border-[var(--border-color)]">
          <Avatar
            src={chat.group_icon_url}
            name={chat.group_name || 'Group'}
            size="xl"
          />
          <h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
            {chat.group_name || 'Group'}
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            Group · {chat.participants.length} participants
          </p>
          {chat.group_description && (
            <p className="mt-2 text-sm text-[var(--text-secondary)] text-center">
              {chat.group_description}
            </p>
          )}
        </div>

        {/* Participants */}
        <div className="py-4">
          <p className="px-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            {chat.participants.length} Participants
          </p>
          {chat.participants.map((p) => (
            <div
              key={p.user_id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Avatar
                src={p.profile?.avatar_url}
                name={p.profile?.display_name || 'User'}
                size="md"
                isOnline={isUserOnline(p.user_id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {p.user_id === user?.id ? 'You' : p.profile?.display_name || 'User'}
                  </span>
                  {p.role === 'admin' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-[var(--wa-green)] bg-opacity-15 text-[var(--wa-green)] rounded font-semibold">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {p.profile?.bio || 'Hey there!'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
