-- SUPABASE REAL-TIME SECURE INDEXES & RLS POLICIES --
-- Run this in your Supabase SQL Editor.

-- 1. Index for loading messages sequentially within a chat (Infinite Scroll & Batching)
CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created_at 
ON public.messages(chat_id, created_at DESC);

-- 2. Index for filtering messages securely by sender
CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
ON public.messages(sender_id);

-- Optional: Since we are querying chat participations actively
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id 
ON public.chat_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id 
ON public.chat_participants(chat_id);


-- 3. Row Level Security Policies
-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Select Policy: Users can only select messages if they are participating in the chat
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
CREATE POLICY "Users can view messages in their chats"
ON public.messages
FOR SELECT
USING (
  auth.uid() IN (
    SELECT cp.user_id 
    FROM public.chat_participants cp 
    WHERE cp.chat_id = messages.chat_id
  )
);

-- Insert Policy: Users can only write messages to chats they participate in, and sender_id must be themselves.
DROP POLICY IF EXISTS "Users can insert messages into their chats" ON public.messages;
CREATE POLICY "Users can insert messages into their chats"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  auth.uid() IN (
    SELECT cp.user_id 
    FROM public.chat_participants cp 
    WHERE cp.chat_id = messages.chat_id
  )
);

-- Update Policy: Users can only edit their own messages
DROP POLICY IF EXISTS "Users can edit their own messages" ON public.messages;
CREATE POLICY "Users can edit their own messages"
ON public.messages
FOR UPDATE
USING (
  auth.uid() = sender_id
);
