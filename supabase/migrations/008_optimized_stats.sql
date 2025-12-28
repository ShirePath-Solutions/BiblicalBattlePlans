-- Optimize stats/streak calculation by storing computed values on profile
-- This eliminates the need to fetch all daily_progress records

-- Add stats columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_chapters_read INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_days_reading INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reading_date DATE;

-- Function to calculate chapters from a daily_progress record
CREATE OR REPLACE FUNCTION calculate_chapters_for_progress(
  p_completed_sections TEXT[],
  p_user_plan_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  sections_count INTEGER;
  plan_type TEXT;
  chapters_per_day INTEGER;
BEGIN
  sections_count := COALESCE(array_length(p_completed_sections, 1), 0);

  -- Get plan type and chapters_per_day from the user_plan's reading_plan
  SELECT
    rp.daily_structure->>'type',
    COALESCE((rp.daily_structure->>'chapters_per_day')::INTEGER, 3)
  INTO plan_type, chapters_per_day
  FROM user_plans up
  JOIN reading_plans rp ON up.plan_id = rp.id
  WHERE up.id = p_user_plan_id;

  -- For sequential plans, multiply by chapters_per_day
  IF plan_type = 'sequential' THEN
    RETURN sections_count * chapters_per_day;
  END IF;

  -- For other plan types, each section is one chapter
  RETURN sections_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to recalculate all stats for a user
CREATE OR REPLACE FUNCTION recalculate_user_stats(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_streak_minimum INTEGER;
  v_total_chapters INTEGER := 0;
  v_total_days INTEGER := 0;
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_last_reading_date DATE;
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
  rec RECORD;
  v_prev_date DATE;
  v_streak_count INTEGER := 0;
  v_is_current_streak BOOLEAN := FALSE;
BEGIN
  -- Get user's streak minimum preference
  SELECT COALESCE(streak_minimum, 3) INTO v_streak_minimum
  FROM profiles WHERE id = p_user_id;

  -- Aggregate chapters by date
  CREATE TEMP TABLE temp_daily_chapters ON COMMIT DROP AS
  SELECT
    dp.date,
    SUM(calculate_chapters_for_progress(dp.completed_sections, dp.user_plan_id)) as chapters
  FROM daily_progress dp
  WHERE dp.user_id = p_user_id
  GROUP BY dp.date
  ORDER BY dp.date DESC;

  -- Calculate totals
  SELECT
    COALESCE(SUM(chapters), 0),
    COUNT(*) FILTER (WHERE chapters >= v_streak_minimum)
  INTO v_total_chapters, v_total_days
  FROM temp_daily_chapters;

  -- Get last reading date
  SELECT date INTO v_last_reading_date
  FROM temp_daily_chapters
  WHERE chapters >= v_streak_minimum
  ORDER BY date DESC
  LIMIT 1;

  -- Calculate streaks from dates that met minimum
  v_prev_date := NULL;
  v_streak_count := 0;

  FOR rec IN
    SELECT date FROM temp_daily_chapters
    WHERE chapters >= v_streak_minimum
    ORDER BY date DESC
  LOOP
    IF v_prev_date IS NULL THEN
      -- First date
      v_streak_count := 1;
      v_is_current_streak := (rec.date = v_today OR rec.date = v_yesterday);
    ELSIF v_prev_date - rec.date = 1 THEN
      -- Consecutive day
      v_streak_count := v_streak_count + 1;
    ELSE
      -- Streak broken
      IF v_is_current_streak AND v_current_streak = 0 THEN
        v_current_streak := v_streak_count;
      END IF;
      v_longest_streak := GREATEST(v_longest_streak, v_streak_count);
      v_streak_count := 1;
      v_is_current_streak := FALSE;
    END IF;
    v_prev_date := rec.date;
  END LOOP;

  -- Handle final streak
  IF v_is_current_streak AND v_current_streak = 0 THEN
    v_current_streak := v_streak_count;
  END IF;
  v_longest_streak := GREATEST(v_longest_streak, v_streak_count);

  -- Update profile
  UPDATE profiles SET
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    total_chapters_read = v_total_chapters,
    total_days_reading = v_total_days,
    last_reading_date = v_last_reading_date,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update stats when daily_progress changes
CREATE OR REPLACE FUNCTION update_user_stats_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_user_stats(OLD.user_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_user_stats(NEW.user_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on daily_progress
DROP TRIGGER IF EXISTS daily_progress_stats_trigger ON daily_progress;
CREATE TRIGGER daily_progress_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON daily_progress
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_trigger();

-- Backfill stats for all existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM profiles LOOP
    PERFORM recalculate_user_stats(user_record.id);
  END LOOP;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN profiles.current_streak IS 'Current consecutive days of reading (meeting streak_minimum). Updated automatically by trigger.';
COMMENT ON COLUMN profiles.longest_streak IS 'Longest streak ever achieved. Updated automatically by trigger.';
COMMENT ON COLUMN profiles.total_chapters_read IS 'Total chapters read across all plans. Updated automatically by trigger.';
COMMENT ON COLUMN profiles.total_days_reading IS 'Total unique days with reading meeting streak_minimum. Updated automatically by trigger.';
