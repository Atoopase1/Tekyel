const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/store/chat-store.ts');
let code = fs.readFileSync(file, 'utf8');

// 1. ChatState
code = code.replace(
  'messages: Message[];',
  'messages: Message[];\n  messagesByChat: Record<string, Message[]>;'
);

// 2. Initial state
code = code.replace(
  'messages: [],\n  isLoadingChats: false,',
  'messages: [],\n  messagesByChat: {},\n  isLoadingChats: false,'
);

// 3. setActiveChat
code = code.replace(
  `  setActiveChat: async (chatId: string | null) => {
    if (!chatId) {
      set({ activeChat: null, activeChatId: null, messages: [] });
      return;
    }

    set({ activeChatId: chatId });

    const chat = get().chats.find((c) => c.id === chatId);
    if (chat) {
      set({ activeChat: chat });
    }`,
  `  setActiveChat: async (chatId: string | null) => {
    if (!chatId) {
      set({ activeChat: null, activeChatId: null, messages: [] });
      return;
    }

    const cached = get().messagesByChat[chatId];
    set({ 
      activeChatId: chatId,
      messages: cached || [],
      hasMoreMessages: cached ? cached.length >= 50 : true
    });

    const chat = get().chats.find((c) => c.id === chatId);
    if (chat) {
      set({ activeChat: chat });
    }`
);

// 4. fetchMessages loader
code = code.replace(
  `  fetchMessages: async (chatId: string, before?: string) => {
    set({ isLoadingMessages: true });`,
  `  fetchMessages: async (chatId: string, before?: string) => {
    const hasCached = (get().messagesByChat[chatId]?.length || 0) > 0;
    if (!before && !hasCached) {
      set({ isLoadingMessages: true });
    }`
);

// 5. fetchMessages success
code = code.replace(
  `      if (before) {
        // Prepend older messages
        set((state) => ({
          messages: [...messages, ...state.messages],
          hasMoreMessages: messages.length === 50,
          isLoadingMessages: false,
        }));
      } else {
        set({
          messages,
          hasMoreMessages: messages.length === 50,
          isLoadingMessages: false,
        });
      }`,
  `      if (before) {
        // Prepend older messages
        set((state) => {
          const combined = [...messages, ...state.messages];
          return {
            messages: combined,
            messagesByChat: { ...state.messagesByChat, [chatId]: combined },
            hasMoreMessages: messages.length === 50,
            isLoadingMessages: false,
          };
        });
      } else {
        set((state) => ({
          messages,
          messagesByChat: { ...state.messagesByChat, [chatId]: messages },
          hasMoreMessages: messages.length === 50,
          isLoadingMessages: false,
        }));
      }`
);

// 6. addMessage
code = code.replace(
  `  addMessage: (message: Message) => {
    set((state) => {
      // Avoid duplicates
      if (state.messages.some((m) => m.id === message.id)) return state;
      return { messages: [...state.messages, message] };
    });`,
  `  addMessage: (message: Message) => {
    set((state) => {
      const chatId = message.chat_id;
      const cached = state.messagesByChat[chatId] || [];
      if (cached.some((m) => m.id === message.id)) return state;
      
      const newCache = [...cached, message];
      const updates: Partial<ChatState> = {
        messagesByChat: { ...state.messagesByChat, [chatId]: newCache }
      };
      if (state.activeChatId === chatId) {
        updates.messages = [...state.messages, message];
      }
      return updates;
    });`
);

// 7. updateMessageInList
code = code.replace(
  `  updateMessageInList: (message: Message) => {
    set((state) => ({
      messages: state.messages.map((m) => (m.id === message.id ? { ...message, sender: m.sender } : m)),
    }));
  },`,
  `  updateMessageInList: (message: Message) => {
    set((state) => {
      const chatId = message.chat_id;
      const cached = state.messagesByChat[chatId] || [];
      const newCache = cached.map((m) => (m.id === message.id ? { ...message, sender: m.sender } : m));
      
      const updates: Partial<ChatState> = {
        messagesByChat: { ...state.messagesByChat, [chatId]: newCache }
      };
      if (state.activeChatId === chatId) {
        updates.messages = state.messages.map((m) => (m.id === message.id ? { ...message, sender: m.sender } : m));
      }
      return updates;
    });
  },`
);

// 8. Mutations that don't have the message object (delete, star, reaction)
function patchMutation(methodName, innerReplace) {
  const regex = new RegExp(\`  \${methodName}: [\\\\s\\\\S]*?\\\\}\\)\\);\\n  \\},?\`);
  const match = code.match(regex);
  if (match) {
    let replaced = match[0].replace(
      /messages: state\.messages\.([^,]+),/,
      \`messages: state.messages.$1,
      messagesByChat: Object.fromEntries(
        Object.entries(state.messagesByChat).map(([cId, msgs]) => [
          cId,
          msgs.$1
        ])
      ),\`
    );
    // Unstar / reactions have slightly different code
    code = code.replace(match[0], replaced);
  }
}

// Custom replace for starMessage since it's slightly different
const deleteMeMatch = code.match(/messages: state\.messages\.filter\\\(\(m\) => m\.id !== messageId\\\),/g);
if(deleteMeMatch) {
  code = code.replace(
    deleteMeMatch[0],
    \`messages: state.messages.filter((m) => m.id !== messageId),
      messagesByChat: Object.fromEntries(
        Object.entries(state.messagesByChat).map(([cId, msgs]) => [
          cId,
          msgs.filter((m) => m.id !== messageId)
        ])
      ),\`
  );
}

const deleteEveryoneMatch = code.match(/messages: state\.messages\.map\\\(\(m\) => \\n\\s*m\.id === messageId \? \\{ \.\.\.m, is_deleted: true \\} : m\\n\\s*\\\),/g);
if(deleteEveryoneMatch) {
  code = code.replace(
    deleteEveryoneMatch[0],
    \`messages: state.messages.map((m) => 
        m.id === messageId ? { ...m, is_deleted: true } : m
      ),
      messagesByChat: Object.fromEntries(
        Object.entries(state.messagesByChat).map(([cId, msgs]) => [
          cId,
          msgs.map((m) => m.id === messageId ? { ...m, is_deleted: true } : m)
        ])
      ),\`
  );
}

const starMatch = code.match(/messages: state\.messages\.map\\\(\(m\) => \\n\\s*m\.id === messageId \? \\{ \\n\\s*\.\.\.m, \\n\\s*stars: \[\.\.\.\(m\.stars \|\| \[\]\), \\{ id: 'temp', user_id: user\.id, message_id: messageId, created_at: '' \\}\] \\n\\s*\\} : m\\n\\s*\\\),/g);
if(starMatch) {
  code = code.replace(
    starMatch[0],
    \`messages: state.messages.map((m) => 
        m.id === messageId ? { 
          ...m, 
          stars: [...(m.stars || []), { id: 'temp', user_id: user.id, message_id: messageId, created_at: '' }] 
        } : m
      ),
      messagesByChat: Object.fromEntries(
        Object.entries(state.messagesByChat).map(([cId, msgs]) => [
          cId,
          msgs.map((m) => m.id === messageId ? { ...m, stars: [...(m.stars || []), { id: 'temp', user_id: user.id, message_id: messageId, created_at: '' }] } : m)
        ])
      ),\`
  );
}

const unstarMatch = code.match(/messages: state\.messages\.map\\\(\(m\) => \\n\\s*m\.id === messageId \? \\{ \\n\\s*\.\.\.m, \\n\\s*stars: \(m\.stars \|\| \[\]\)\.filter\\\(s => s\.user_id !== user\.id\\\) \\n\\s*\\} : m\\n\\s*\\\),/g);
if(unstarMatch) {
  code = code.replace(
    unstarMatch[0],
    \`messages: state.messages.map((m) => 
        m.id === messageId ? { 
          ...m, 
          stars: (m.stars || []).filter(s => s.user_id !== user.id) 
        } : m
      ),
      messagesByChat: Object.fromEntries(
        Object.entries(state.messagesByChat).map(([cId, msgs]) => [
          cId,
          msgs.map((m) => m.id === messageId ? { ...m, stars: (m.stars || []).filter(s => s.user_id !== user.id) } : m)
        ])
      ),\`
  );
}


fs.writeFileSync(file, code);
console.log('Patch complete.');
