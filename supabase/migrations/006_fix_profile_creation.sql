-- Migration: Fix Profile Creation
-- Updates the handle_new_user trigger to properly set username and display_name

-- ============================================
-- UPDATE PROFILE CREATION TRIGGER
-- Properly handle username and display_name from user metadata
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'full_name'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

