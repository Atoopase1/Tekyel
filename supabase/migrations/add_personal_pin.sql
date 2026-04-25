-- MIGRATION: Add personal pinned message to chat_participants
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)

ALTER TABLE public.chat_participants 
ADD COLUMN IF NOT EXISTS pinned_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;
