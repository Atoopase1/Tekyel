// ============================================================
// ChatSidebar — Premium left panel with LinkedIn-style cover
// ============================================================
'use client';

import { useState, useEffect, useMemo } from 'react';
import { MessageSquarePlus, Users, Settings, LogOut, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/ui/SearchInput';
import ChatListItem from '@/components/chat/ChatListItem';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import CreateGroupModal from '@/components/chat/CreateGroupModal';
import { useChatStore } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

export default function ChatSidebar() {
  const router = useRouter();
  const { chats, isLoadingChats, fetchChats, setActiveChat, activeChatId, startDirectChat } = useChatStore();
  const { profile, signOut } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [searchUsers, setSearchUsers] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Search users for new chat
  useEffect(() => {
    if (!showNewChat) return;
    const searchForUsers = async () => {
      setIsSearching(true);
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', profile?.id || '')
        .order('display_name');

      setSearchUsers((data as Profile[]) || []);
      setIsSearching(false);
    };
    searchForUsers();
  }, [showNewChat, profile?.id]);

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      const name = chat.is_group
        ? chat.group_name
        : chat.other_user?.display_name;
      return name?.toLowerCase().includes(q);
    });
  }, [chats, searchQuery]);

  const handleStartChat = async (userId: string) => {
    const chatId = await startDirectChat(userId);
    if (chatId) {
      setShowNewChat(false);
      router.push(`/${chatId}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">

      {/* ── LinkedIn-style Cover + Profile Header ── */}
      <div className="relative shrink-0">
        {/* Cover Photo Banner */}
        <button
          onClick={() => profile?.id && router.push(`/profile/${profile.id}`)}
          className="block w-full h-24 overflow-hidden relative group"
        >
          {profile?.cover_url ? (
            <img
              src={profile.cover_url}
              alt="Cover"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--navy) 0%, #1a2332 40%, var(--emerald-dark, #15803D) 100%)',
              }}
            >
              <ImageIcon size={28} className="text-white/8" />
            </div>
          )}
          {/* Gradient vignette at bottom for readability */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </button>

        {/* Profile Info — overlapping the cover */}
        <div className="relative px-4 -mt-8 flex justify-between items-start">
          {/* Avatar + Name */}
          <div className="flex gap-3">
            <button
              onClick={() => profile?.id && router.push(`/profile/${profile.id}`)}
              className="shrink-0 rounded-full border-[4px] border-[var(--bg-primary)] shadow-lg hover:shadow-xl transition-shadow relative z-10 bg-[var(--bg-primary)]"
            >
              <Avatar
                src={profile?.avatar_url}
                name={profile?.display_name || 'User'}
                size="xl"
              />
            </button>
            <div className="pt-[38px] flex flex-col">
              <button
                onClick={() => profile?.id && router.push(`/profile/${profile.id}`)}
                className="text-left group"
              >
                <span className="font-bold text-[var(--text-primary)] text-[16px] block leading-tight group-hover:text-[var(--emerald)] transition-colors">
                  {profile?.display_name || 'User'}
                </span>
              </button>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] shadow-[0_0_5px_var(--emerald)] animate-pulse" />
                <span className="text-[13px] text-[var(--text-muted)] font-medium tracking-wide">Online</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 pt-[38px]">
            <button
              onClick={() => setShowNewGroup(true)}
              className="p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title="New group"
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title="New chat"
            >
              <MessageSquarePlus size={20} />
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 text-[var(--text-muted)] hover:text-red-500"
              title="Log out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-2 mx-4 h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent" />
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoadingChats && filteredChats.length === 0 ? (
          <Spinner className="mt-12" />
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-[var(--text-muted)] px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
              <MessageSquarePlus size={28} className="opacity-40" />
            </div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">No conversations yet</p>
            <p className="text-[13px] mt-1.5 text-[var(--text-muted)]">Start a new chat to get going</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onClick={() => {
                setActiveChat(chat.id);
                router.push(`/${chat.id}`);
              }}
            />
          ))
        )}
      </div>

      {/* New Chat Modal */}
      <Modal isOpen={showNewChat} onClose={() => setShowNewChat(false)} title="New Chat">
        <div className="max-h-80 overflow-y-auto -mx-2">
          {isSearching ? (
            <Spinner className="my-8" />
          ) : searchUsers.length === 0 ? (
            <p className="text-center text-[var(--text-muted)] py-8 text-sm">No users found</p>
          ) : (
            searchUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleStartChat(user.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200"
              >
                <Avatar src={user.avatar_url} name={user.display_name} size="md" />
                <div className="text-left">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{user.display_name}</p>
                  <p className="text-[13px] text-[var(--text-muted)]">{user.bio || 'Hey there!'}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Create Group Modal */}
      <CreateGroupModal isOpen={showNewGroup} onClose={() => setShowNewGroup(false)} />
    </div>
  );
}
