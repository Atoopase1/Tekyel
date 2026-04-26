-- Add pinned_until column to statuses for pin-to-extend feature
-- Pinned statuses last up to 5 days instead of the normal 50 hours
ALTER TABLE statuses ADD COLUMN IF NOT EXISTS pinned_until timestamptz DEFAULT NULL;
