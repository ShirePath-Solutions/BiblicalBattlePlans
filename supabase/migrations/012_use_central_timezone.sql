-- Migration: Use Central Timezone for Profile Timestamps
-- Updates profiles created_at and updated_at to use America/Chicago timezone

-- ============================================
-- UPDATE PROFILES TABLE DEFAULTS
-- ============================================
ALTER TABLE profiles
  ALTER COLUMN created_at SET DEFAULT timezone('America/Chicago', NOW()),
  ALTER COLUMN updated_at SET DEFAULT timezone('America/Chicago', NOW());
