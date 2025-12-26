-- Migration: Independent List Tracking
-- Changes reading progress from day-based to list-position-based tracking

-- ============================================
-- ADD LIST POSITIONS TO USER PLANS
-- Tracks current chapter position for each list independently
-- Format: { "list_id": chapter_index, ... }
-- ============================================
ALTER TABLE user_plans
ADD COLUMN IF NOT EXISTS list_positions JSONB DEFAULT '{}';

-- ============================================
-- ADD STREAK MINIMUM PREFERENCE TO PROFILES
-- User-configurable minimum chapters per day for streak
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS streak_minimum INTEGER DEFAULT 3;

-- ============================================
-- MODIFY DAILY PROGRESS
-- Change from day_number-based to pure date-based tracking
-- completed_sections now stores chapter identifiers: ["list1:5", "list1:6", "list2:1"]
-- ============================================

-- Drop the unique constraint on user_plan_id + day_number
ALTER TABLE daily_progress
DROP CONSTRAINT IF EXISTS daily_progress_user_plan_id_day_number_key;

-- Add new unique constraint on user_plan_id + date
-- (allows one progress entry per plan per date)
ALTER TABLE daily_progress
ADD CONSTRAINT daily_progress_user_plan_id_date_key UNIQUE (user_plan_id, date);

-- Add index for date-based queries
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON daily_progress(date);

-- ============================================
-- MIGRATION HELPER: Initialize list_positions for existing cycling plans
-- ============================================
-- This updates existing user_plans with cycling_lists type to have
-- initial list_positions based on their current_day

-- Note: Run this as a one-time migration for existing data
-- For each existing user_plan with a cycling_lists plan,
-- set list_positions based on current_day
UPDATE user_plans up
SET list_positions = (
  SELECT jsonb_object_agg(
    list_elem->>'id',
    GREATEST(0, up.current_day - 1)
  )
  FROM reading_plans rp,
       jsonb_array_elements(rp.daily_structure->'lists') AS list_elem
  WHERE rp.id = up.plan_id
    AND rp.daily_structure->>'type' = 'cycling_lists'
)
WHERE EXISTS (
  SELECT 1 FROM reading_plans rp
  WHERE rp.id = up.plan_id
    AND rp.daily_structure->>'type' = 'cycling_lists'
)
AND (up.list_positions IS NULL OR up.list_positions = '{}');
