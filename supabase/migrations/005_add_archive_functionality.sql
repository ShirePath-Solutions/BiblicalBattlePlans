-- Migration: Add Archive Functionality to User Plans
-- Allows users to hide plans from "Today's Missions" without deleting historical data
-- Created: 2025-12-26

-- ============================================
-- ADD IS_ARCHIVED COLUMN TO USER_PLANS
-- Archived plans are hidden from active views but preserve all data
-- ============================================
ALTER TABLE user_plans
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- ============================================
-- ADD ARCHIVED_AT TIMESTAMP
-- Track when plan was archived for audit purposes
-- ============================================
ALTER TABLE user_plans
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- ============================================
-- ADD INDEX FOR PERFORMANCE
-- Optimize filtering of non-archived plans
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_plans_archived ON user_plans(user_id, is_archived);

-- ============================================
-- DOCUMENTATION
-- ============================================
COMMENT ON COLUMN user_plans.is_archived IS 'When true, plan is hidden from Today''s Missions but remains accessible for stats and can be unarchived';
COMMENT ON COLUMN user_plans.archived_at IS 'Timestamp when plan was archived';
