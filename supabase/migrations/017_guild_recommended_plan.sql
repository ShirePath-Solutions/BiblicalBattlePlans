-- Guild Recommended Plans Feature (Issue #16)
-- Allow guild admins to recommend a reading plan to group members

-- Add recommended plan column to guilds table
ALTER TABLE guilds
ADD COLUMN recommended_plan_id UUID REFERENCES reading_plans(id) ON DELETE SET NULL;

-- Add index for efficient lookups
CREATE INDEX idx_guilds_recommended_plan ON guilds(recommended_plan_id)
WHERE recommended_plan_id IS NOT NULL;

-- Note: Existing RLS policies on guilds table already allow admins to update
-- The update policy checks guild membership and admin role

COMMENT ON COLUMN guilds.recommended_plan_id IS 'Reading plan recommended by guild admin for members to follow';
