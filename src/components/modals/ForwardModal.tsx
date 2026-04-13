// ============================================================
// ForwardModal — Modal to select chats to forward to
// ============================================================
'use client';

import { useState } from 'react';
import { X, Search, Check, Send } from 'lucide-react';
import type { ChatWithDetails, Message } from '@/types';
import { useChatStore } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';

interface ForwardModalProps {
  message: Message;
  onClose: () => void;
}

export default function ForwardModal({ message, onClose }: ForwardModalProps) {
  const chats = useChatStore(s => s.chats);
  const sendMessage = useChatStore(s => s.sendMessage);
  const currentUser = useAuthStore(s => s.user);
  
  const [search, setSearch] = useState('');
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const filteredChats = chats.filter(c => {
    if (!search) return true;
    const name = c.is_group ? c.group_name : c.other_user?.display_name;
    return name?.toLowerCase().includes(search.toLowerCase());
  });

  const toggleSelect = (id: string) => {
    setSelectedChatIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleForward = async () => {
    if (selectedChatIds.length === 0 || isSending) return;
    setIsSending(true);

    try {
      for (const chatId of selectedChatIds) {
        let content = message.content;
        // Optionally prepend "Forwarded:" or let WhatsApp style imply it via flags (we don't have forwarded flag yet)
        await sendMessage(
          chatId,
          content || '',
          message.message_type,
          message.media_url || undefined,
          message.media_metadata || undefined
        );
      }
    } finally {
      setIsSending(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
      <div className="bg-[var(--bg-primary)] w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh] animate-scaleIn">
        
        <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center gap-3 bg-[var(--bg-header)]">
          <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
            <X size={20} />
          </button>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] flex-1">Forward to...</h2>
        </div>

        <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-search)]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search chats"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="p-2 overflow-y-auto flex-1 h-[300px]">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-sm text-[var(--text-muted)]">No chats found</div>
          ) : (
            filteredChats.map(chat => {
              const name = chat.is_group ? chat.group_name : chat.other_user?.display_name;
              const img = chat.is_group ? chat.group_icon_url : chat.other_user?.avatar_url;
              const isSelected = selectedChatIds.includes(chat.id);

              return (
                <button
                  key={chat.id}
                  onClick={() => toggleSelect(chat.id)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-[var(--bg-hover)] rounded-xl transition-colors text-left"
                >
                  <div className="relative">
                    {img ? (
                      <img src={img} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[var(--bg-active)] flex items-center justify-center text-[var(--text-primary)] text-lg uppercase font-semibold">
                        {name?.charAt(0)}
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--wa-green)] rounded-full flex items-center justify-center border-2 border-[var(--bg-primary)]">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">{name}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {selectedChatIds.length > 0 && (
          <div className="p-4 bg-[var(--bg-header)] border-t border-[var(--border-color)] flex justify-between items-center">
            <span className="text-sm text-[var(--text-muted)]">{selectedChatIds.length} active chats selected</span>
            <button
              onClick={handleForward}
              disabled={isSending}
              className="w-12 h-12 bg-[var(--wa-green)] rounded-full flex items-center justify-center text-white hover:bg-[var(--wa-green-dark)] transition-colors disabled:opacity-50 shadow-md"
            >
              <Send size={20} className={isSending ? "animate-pulse" : ""} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
