// Presence Store — Online status & typing indicators
'use client';

import { create } from 'zustand';
import type { TypingUser } from '@/types';

interface PresenceState {
  onlineUsers: Set<string>;
  typingUsers: TypingUser[];

  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
  addTypingUser: (user: TypingUser) => void;
  removeTypingUser: (userId: string, chatId: string) => void;
  getTypingUsersForChat: (chatId: string) => TypingUser[];
  isUserOnline: (userId: string) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: new Set<string>(),
  typingUsers: [],

  setUserOnline: (userId: string) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.add(userId);
      return { onlineUsers: newSet };
    });
  },

  setUserOffline: (userId: string) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(userId);
      return { onlineUsers: newSet };
    });
  },

  setOnlineUsers: (userIds: string[]) => {
    set({ onlineUsers: new Set(userIds) });
  },

  addTypingUser: (user: TypingUser) => {
    set((state) => {
      const filtered = state.typingUsers.filter(
        (t) => !(t.user_id === user.user_id && t.chat_id === user.chat_id)
      );
      return { typingUsers: [...filtered, user] };
    });

    // Auto-remove after 3 seconds
    setTimeout(() => {
      get().removeTypingUser(user.user_id, user.chat_id);
    }, 3000);
  },

  removeTypingUser: (userId: string, chatId: string) => {
    set((state) => ({
      typingUsers: state.typingUsers.filter(
        (t) => !(t.user_id === userId && t.chat_id === chatId)
      ),
    }));
  },

  getTypingUsersForChat: (chatId: string) => {
    return get().typingUsers.filter((t) => t.chat_id === chatId);
  },

  isUserOnline: (userId: string) => {
    return get().onlineUsers.has(userId);
  },
}));
