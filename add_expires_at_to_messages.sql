-- Add expires_at column to messages for expiring media feature
ALTER TABLE messages ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT NULL;
