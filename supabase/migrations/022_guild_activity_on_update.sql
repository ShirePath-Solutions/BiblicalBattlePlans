-- Fix: Log guild reading activity on UPDATE as well as INSERT
-- This ensures that Free Reading chapter picker contributions are logged to guild activity

-- Drop the existing trigger (INSERT only)
DROP TRIGGER IF EXISTS guild_reading_activity_trigger ON daily_progress;

-- Create improved function that handles both INSERT and UPDATE
-- For INSERT: logs the initial reading activity
-- For UPDATE: logs incremental reading activity when chapters increase
CREATE OR REPLACE FUNCTION log_guild_reading_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_guild RECORD;
  v_plan_name TEXT;
  v_chapters INTEGER;
  v_old_chapters INTEGER;
  v_new_chapters INTEGER;
BEGIN
  BEGIN
    -- Get the plan name for context
    SELECT rp.name INTO v_plan_name
    FROM user_plans up
    JOIN reading_plans rp ON up.plan_id = rp.id
    WHERE up.id = NEW.user_plan_id;

    -- For INSERT: count all chapters in the new record
    -- For UPDATE: count only newly added chapters
    IF TG_OP = 'INSERT' THEN
      v_chapters := calculate_chapters_for_progress(NEW.completed_sections, NEW.user_plan_id);
    ELSIF TG_OP = 'UPDATE' THEN
      -- Calculate chapters in old and new records
      v_old_chapters := calculate_chapters_for_progress(OLD.completed_sections, OLD.user_plan_id);
      v_new_chapters := calculate_chapters_for_progress(NEW.completed_sections, NEW.user_plan_id);
      v_chapters := v_new_chapters - v_old_chapters;
    END IF;

    -- Only log if there are actual NEW chapters read (positive delta)
    -- This prevents logging when chapters are unchecked (negative delta) or no change (zero)
    IF v_chapters > 0 THEN
      -- Log activity for all guilds the user is a member of
      FOR v_guild IN
        SELECT guild_id FROM guild_members WHERE user_id = NEW.user_id
      LOOP
        INSERT INTO guild_activities (guild_id, user_id, activity_type, metadata)
        VALUES (
          v_guild.guild_id,
          NEW.user_id,
          'reading_completed',
          jsonb_build_object(
            'plan_name', v_plan_name,
            'day_number', NEW.day_number,
            'chapters_read', v_chapters,
            'date', NEW.date::TEXT
          )
        );
      END LOOP;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[GuildActivity] Failed to log reading_completed for user % (plan %): % (SQLSTATE: %)',
      NEW.user_id, NEW.user_plan_id, SQLERRM, SQLSTATE;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires on both INSERT and UPDATE
CREATE TRIGGER guild_reading_activity_trigger
AFTER INSERT OR UPDATE OF completed_sections ON daily_progress
FOR EACH ROW
EXECUTE FUNCTION log_guild_reading_activity();

-- Add comment documenting the change
COMMENT ON FUNCTION log_guild_reading_activity IS 
  'Logs reading activity to guild_activities when daily_progress is inserted or updated. 
   For updates, only logs the incremental chapters added (not total).
   This ensures Free Reading chapter picker contributions are properly logged.';

