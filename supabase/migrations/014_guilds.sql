-- Biblical Battle Plans - Guilds Feature (Issue #13)
-- Core guild functionality: create, join, manage

-- ============================================
-- RENAME TABLES: groups -> guilds
-- ============================================

-- Rename tables to match "Guild" naming
ALTER TABLE groups RENAME TO guilds;
ALTER TABLE group_members RENAME TO guild_members;

-- Rename foreign key column
ALTER TABLE guild_members RENAME COLUMN group_id TO guild_id;

-- Update index names
ALTER INDEX idx_group_members_group RENAME TO idx_guild_members_guild;
ALTER INDEX idx_group_members_user RENAME TO idx_guild_members_user;

-- ============================================
-- EXPAND GUILDS TABLE
-- ============================================

-- Add new columns to guilds
ALTER TABLE guilds
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;

-- Create index on invite_code for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_guilds_invite_code
ON guilds(invite_code) WHERE invite_code IS NOT NULL;

-- ============================================
-- EXPAND GUILD_MEMBERS TABLE
-- ============================================

-- Add role column
ALTER TABLE guild_members
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member'
CHECK (role IN ('admin', 'member'));

-- ============================================
-- INVITE CODE GENERATION
-- ============================================

-- Function to generate unique invite code (6 alphanumeric chars)
-- Excludes confusing characters: 0/O, 1/I/L
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invite code on guild creation or regeneration
-- Must be SECURITY DEFINER to query all guilds for uniqueness check
CREATE OR REPLACE FUNCTION set_guild_invite_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  attempts INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  IF NEW.invite_code IS NULL THEN
    LOOP
      new_code := generate_invite_code();
      -- Check if code already exists
      IF NOT EXISTS (SELECT 1 FROM guilds WHERE invite_code = new_code) THEN
        NEW.invite_code := new_code;
        EXIT;
      END IF;
      attempts := attempts + 1;
      IF attempts >= max_attempts THEN
        RAISE EXCEPTION 'Could not generate unique invite code after % attempts', max_attempts;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS guilds_invite_code_trigger ON guilds;
CREATE TRIGGER guilds_invite_code_trigger
BEFORE INSERT OR UPDATE ON guilds
FOR EACH ROW
EXECUTE FUNCTION set_guild_invite_code();

-- ============================================
-- MEMBER COUNT MANAGEMENT
-- ============================================

-- Function to update member count when members join/leave
-- Must be SECURITY DEFINER to bypass RLS on guilds table
CREATE OR REPLACE FUNCTION update_guild_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE guilds SET member_count = member_count + 1 WHERE id = NEW.guild_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE guilds SET member_count = member_count - 1 WHERE id = OLD.guild_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS guild_members_count_trigger ON guild_members;
CREATE TRIGGER guild_members_count_trigger
AFTER INSERT OR DELETE ON guild_members
FOR EACH ROW
EXECUTE FUNCTION update_guild_member_count();

-- ============================================
-- AUTO-ADD CREATOR AS ADMIN
-- ============================================

-- Function to add guild creator as admin member
-- Must be SECURITY DEFINER to bypass RLS (which only allows role='member' for user inserts)
CREATE OR REPLACE FUNCTION add_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO guild_members (guild_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS guilds_add_creator_trigger ON guilds;
CREATE TRIGGER guilds_add_creator_trigger
AFTER INSERT ON guilds
FOR EACH ROW
EXECUTE FUNCTION add_creator_as_admin();

-- ============================================
-- HELPER FUNCTIONS FOR RLS (SECURITY DEFINER)
-- These bypass RLS to avoid infinite recursion
-- ============================================

-- Check if user is a member of a guild
CREATE OR REPLACE FUNCTION is_guild_member(p_guild_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM guild_members
    WHERE guild_id = p_guild_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is an admin of a guild
CREATE OR REPLACE FUNCTION is_guild_admin(p_guild_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM guild_members
    WHERE guild_id = p_guild_id AND user_id = p_user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Drop existing policies (from initial schema)
DROP POLICY IF EXISTS "Group members can view their groups" ON guilds;
DROP POLICY IF EXISTS "Users can create groups" ON guilds;
DROP POLICY IF EXISTS "Users can view members of their groups" ON guild_members;

-- GUILDS POLICIES

-- Anyone can view public guilds; members can view private guilds
CREATE POLICY "View public or member guilds"
  ON guilds FOR SELECT
  USING (
    is_public = true
    OR is_guild_member(id, auth.uid())
  );

-- Authenticated users can create guilds
CREATE POLICY "Authenticated users can create guilds"
  ON guilds FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Only admins can update guilds
CREATE POLICY "Admins can update guilds"
  ON guilds FOR UPDATE
  USING (
    is_guild_admin(id, auth.uid())
  );

-- Only admins can delete guilds
CREATE POLICY "Admins can delete guilds"
  ON guilds FOR DELETE
  USING (
    is_guild_admin(id, auth.uid())
  );

-- GUILD_MEMBERS POLICIES

-- Members can view other members of their guilds
CREATE POLICY "Members can view guild members"
  ON guild_members FOR SELECT
  USING (
    is_guild_member(guild_id, auth.uid())
  );

-- Users can join guilds (insert themselves as member only)
CREATE POLICY "Users can join guilds"
  ON guild_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'member'
  );

-- Users can leave guilds, or admins can remove members
CREATE POLICY "Users can leave or admins can remove"
  ON guild_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR is_guild_admin(guild_id, auth.uid())
  );

-- Admins can update member roles (promote/demote)
CREATE POLICY "Admins can update member roles"
  ON guild_members FOR UPDATE
  USING (
    is_guild_admin(guild_id, auth.uid())
  );

-- ============================================
-- INITIALIZE MEMBER COUNTS FOR EXISTING GUILDS
-- ============================================

-- Update member_count for any existing guilds
UPDATE guilds g
SET member_count = (
  SELECT COUNT(*) FROM guild_members gm WHERE gm.guild_id = g.id
);
