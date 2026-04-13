// ============================================================
// MessageInfoModal — Modal to show read receipts and delivery
// ============================================================
'use client';

import { X, Check, CheckCheck } from 'lucide-react';
import type { Message, Profile } from '@/types';
import { formatMessageTime } from '@/lib/utils';
import { useChatStore } from '@/store/chat-store';

interface MessageInfoModalProps {
  message: Message;
  chatParticipants: { user_id: string; profile: Profile }[];
  onClose: () => void;
}

export default function MessageInfoModal({ message, chatParticipants, onClose }: MessageInfoModalProps) {
  // Map statuses
  const statuses = message.status || [];
  
  const getStatusIcon = (status: string) => {
    if (status === 'seen') return <CheckCheck size={16} className="text-[#53BDEB]" />;
    if (status === 'delivered') return <CheckCheck size={16} className="text-[var(--text-muted)]" />;
    return <Check size={16} className="text-[var(--text-muted)]" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
      <div className="bg-[var(--bg-primary)] w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh] animate-scaleIn">
        
        <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-header)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Message Info</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {/* Display original message content briefly */}
          <div className="mb-6 bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]">
            <p className="text-sm text-[var(--text-primary)]">{message.content || (message.media_url ? '[Media Message]' : '')}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{formatMessageTime(message.created_at)}</p>
          </div>

          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Read by</h3>
          <div className="space-y-4 mb-6">
            {chatParticipants.filter(p => statuses.find(s => s.user_id === p.user_id && s.status === 'seen')).length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No one yet</p>
            ) : null}
            
            {chatParticipants.filter(p => statuses.find(s => s.user_id === p.user_id && s.status === 'seen')).map(p => {
              const status = statuses.find(s => s.user_id === p.user_id && s.status === 'seen')!;
              return (
                <div key={p.user_id} className="flex flex-row items-center gap-3">
                  {p.profile.avatar_url ? (
                    <img src={p.profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-primary)] uppercase font-semibold">
                      {p.profile.display_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-primary)] font-medium">{p.profile.display_name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getStatusIcon(status.status)}
                      <p className="text-xs text-[var(--text-muted)]">{formatMessageTime(status.updated_at)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Delivered to</h3>
          <div className="space-y-4">
            {chatParticipants.filter(p => statuses.find(s => s.user_id === p.user_id && s.status === 'delivered')).length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No one else</p>
            ) : null}
            
            {chatParticipants.filter(p => statuses.find(s => s.user_id === p.user_id && s.status === 'delivered')).map(p => {
              const status = statuses.find(s => s.user_id === p.user_id && s.status === 'delivered')!;
              return (
                <div key={p.user_id} className="flex flex-row items-center gap-3">
                  {p.profile.avatar_url ? (
                    <img src={p.profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-primary)] uppercase font-semibold">
                      {p.profile.display_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-primary)] font-medium">{p.profile.display_name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getStatusIcon(status.status)}
                      <p className="text-xs text-[var(--text-muted)]">{formatMessageTime(status.updated_at)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
