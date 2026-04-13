-- SUPABASE MIGRATION: ADVANCED CHAT INTERACTIONS
-- Creates tables for message stars, reactions, and deletions

-- 1. Message Stars Table
CREATE TABLE IF NOT EXISTS public.message_stars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, message_id)
);

-- 2. Message Reactions Table
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, message_id, emoji)
);

-- 3. Message Deletions Table (for "Delete for me")
CREATE TABLE IF NOT EXISTS public.message_deletions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, message_id)
);

-- Enable RLS for these new tables
ALTER TABLE public.message_stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_deletions ENABLE ROW LEVEL SECURITY;

-- Policies for Stars
CREATE POLICY "Users can manage their own stars"
ON public.message_stars FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see stars in their chats"
ON public.message_stars FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.chat_participants cp ON cp.chat_id = m.chat_id
    WHERE m.id = message_stars.message_id AND cp.user_id = auth.uid()
  )
);

-- Policies for Reactions
CREATE POLICY "Users can manage their own reactions"
ON public.message_reactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see reactions in their chats"
ON public.message_reactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.chat_participants cp ON cp.chat_id = m.chat_id
    WHERE m.id = message_reactions.message_id AND cp.user_id = auth.uid()
  )
);

-- Policies for Deletions
CREATE POLICY "Users can manage their own deletions"
ON public.message_deletions FOR ALL USING (auth.uid() = user_id);
