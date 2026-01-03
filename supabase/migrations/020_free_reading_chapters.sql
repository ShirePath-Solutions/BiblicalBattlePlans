-- Free Reading Chapters - Track individual chapter completions for Free Reading plans
-- This enables granular Bible/Apocrypha tracking with chapter-level checkboxes

-- ============================================
-- FREE READING CHAPTERS TABLE
-- Tracks which specific chapters a user has read
-- ============================================
CREATE TABLE free_reading_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plan_id UUID REFERENCES user_plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book TEXT NOT NULL,           -- e.g., "Genesis", "Tobit"
  chapter INTEGER NOT NULL,     -- e.g., 1, 2, 3...
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_plan_id, book, chapter)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_free_reading_chapters_user_plan ON free_reading_chapters(user_plan_id);
CREATE INDEX idx_free_reading_chapters_user ON free_reading_chapters(user_id);
CREATE INDEX idx_free_reading_chapters_book ON free_reading_chapters(user_plan_id, book);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE free_reading_chapters ENABLE ROW LEVEL SECURITY;

-- Users can only view their own chapter completions
CREATE POLICY "Users can view their own chapter completions"
  ON free_reading_chapters FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own chapter completions
CREATE POLICY "Users can insert their own chapter completions"
  ON free_reading_chapters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own chapter completions (for unchecking)
CREATE POLICY "Users can delete their own chapter completions"
  ON free_reading_chapters FOR DELETE
  USING (auth.uid() = user_id);

-- Note: No UPDATE policy needed - chapters are either completed or not (insert/delete)


