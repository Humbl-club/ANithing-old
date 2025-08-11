-- Create missing tables required by the frontend

-- List statuses lookup table
CREATE TABLE IF NOT EXISTS list_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default statuses
INSERT INTO list_statuses (name, color) VALUES
  ('watching', '#10b981'),
  ('completed', '#3b82f6'),
  ('on_hold', '#f59e0b'),
  ('dropped', '#ef4444'),
  ('plan_to_watch', '#8b5cf6')
ON CONFLICT (name) DO NOTHING;

-- User profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User lists table
CREATE TABLE IF NOT EXISTS user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  status_id UUID REFERENCES list_statuses(id),
  score INTEGER CHECK (score >= 0 AND score <= 10),
  progress INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, title_id)
);

-- User ratings table
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, title_id)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'en',
  show_adult_content BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_title_id ON user_lists(title_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_status_id ON user_lists(status_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_title_id ON user_ratings(title_id);

-- Enable RLS
ALTER TABLE list_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read list_statuses" ON list_statuses FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "Users can manage their own lists" ON user_lists 
  FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can manage their own ratings" ON user_ratings 
  FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can manage their own preferences" ON user_preferences 
  FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);