-- ============================================================================
-- QUICK USER TABLES SETUP - Run this in Supabase SQL Editor
-- ============================================================================

-- 1. List statuses (required for user lists)
CREATE TABLE IF NOT EXISTS list_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO list_statuses (name, color, icon, sort_order) VALUES
  ('watching', '#10b981', 'play-circle', 1),
  ('completed', '#3b82f6', 'check-circle', 2),
  ('on_hold', '#f59e0b', 'pause-circle', 3),
  ('dropped', '#ef4444', 'x-circle', 4),
  ('plan_to_watch', '#8b5cf6', 'clock', 5),
  ('reading', '#10b981', 'book-open', 6),
  ('plan_to_read', '#8b5cf6', 'bookmark', 7)
ON CONFLICT (name) DO NOTHING;

-- 2. User profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User lists (watchlist/readlist)
CREATE TABLE IF NOT EXISTS user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  status_id UUID REFERENCES list_statuses(id),
  score DECIMAL(3,1) CHECK (score >= 0 AND score <= 10),
  progress INTEGER DEFAULT 0,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'en',
  show_adult_content BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User ratings
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS with permissive policies for now
ALTER TABLE list_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- Allow public read for all tables
CREATE POLICY "Public read list_statuses" ON list_statuses FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read user_lists" ON user_lists FOR SELECT USING (true);
CREATE POLICY "Public manage user_lists" ON user_lists FOR ALL USING (true);
CREATE POLICY "Public read user_preferences" ON user_preferences FOR SELECT USING (true);
CREATE POLICY "Public manage user_preferences" ON user_preferences FOR ALL USING (true);
CREATE POLICY "Public read user_ratings" ON user_ratings FOR SELECT USING (true);
CREATE POLICY "Public manage user_ratings" ON user_ratings FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_title_id ON user_lists(title_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_title_id ON user_ratings(title_id);

-- Success message
SELECT 'User tables created successfully!' as message;