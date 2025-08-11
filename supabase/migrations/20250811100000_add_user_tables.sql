-- ============================================================================
-- USER SYSTEM TABLES - Complete user functionality
-- ============================================================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Public read list_statuses" ON list_statuses;
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own lists" ON user_lists;
DROP POLICY IF EXISTS "Users can manage their own ratings" ON user_ratings;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- List statuses lookup table
CREATE TABLE IF NOT EXISTS list_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default statuses with proper ordering
INSERT INTO list_statuses (name, color, icon, sort_order) VALUES
  ('watching', '#10b981', 'play-circle', 1),
  ('completed', '#3b82f6', 'check-circle', 2),
  ('on_hold', '#f59e0b', 'pause-circle', 3),
  ('dropped', '#ef4444', 'x-circle', 4),
  ('plan_to_watch', '#8b5cf6', 'clock', 5),
  ('reading', '#10b981', 'book-open', 6),
  ('plan_to_read', '#8b5cf6', 'bookmark', 7)
ON CONFLICT (name) DO UPDATE SET 
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  twitter_handle TEXT,
  favorite_genres TEXT[],
  show_adult_content BOOLEAN DEFAULT false,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User lists table (watchlist/readlist)
CREATE TABLE IF NOT EXISTS user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  status_id UUID REFERENCES list_statuses(id),
  score DECIMAL(3,1) CHECK (score >= 0 AND score <= 10),
  progress INTEGER DEFAULT 0,
  progress_volumes INTEGER DEFAULT 0, -- For manga
  start_date DATE,
  finish_date DATE,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  rewatch_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, title_id)
);

-- User ratings and reviews
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  review_title TEXT,
  review_text TEXT,
  contains_spoilers BOOLEAN DEFAULT false,
  is_recommended BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, title_id)
);

-- User preferences/settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Display preferences
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'en',
  title_language TEXT DEFAULT 'english' CHECK (title_language IN ('english', 'romaji', 'native')),
  
  -- Content preferences
  show_adult_content BOOLEAN DEFAULT false,
  auto_play_trailers BOOLEAN DEFAULT true,
  default_content_type TEXT DEFAULT 'both' CHECK (default_content_type IN ('anime', 'manga', 'both')),
  
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT true,
  email_on_episode_release BOOLEAN DEFAULT true,
  email_on_friend_activity BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT false,
  push_on_episode_release BOOLEAN DEFAULT false,
  
  -- Privacy preferences
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  show_watching_status BOOLEAN DEFAULT true,
  allow_friend_requests BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Activity feed for user actions
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('started', 'completed', 'rated', 'reviewed', 'added', 'updated')),
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  metadata JSONB,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User follows/friends system
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Watchlist sharing
CREATE TABLE IF NOT EXISTS shared_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items in shared lists
CREATE TABLE IF NOT EXISTS shared_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES shared_lists(id) ON DELETE CASCADE,
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, title_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_title_id ON user_lists(title_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_status_id ON user_lists(status_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_is_favorite ON user_lists(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_title_id ON user_ratings(title_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rating ON user_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Enable Row Level Security
ALTER TABLE list_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Everyone can read list statuses
CREATE POLICY "Anyone can read list statuses" ON list_statuses
  FOR SELECT USING (true);

-- Profiles are public by default
CREATE POLICY "Public profiles are readable" ON profiles
  FOR SELECT USING (
    profile_visibility = 'public' OR 
    auth.uid() = id OR
    auth.uid() IS NULL -- Allow anonymous reads of public profiles
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User lists policies
CREATE POLICY "Users can view public lists" ON user_lists
  FOR SELECT USING (
    is_private = false OR 
    auth.uid() = user_id OR
    auth.uid() IS NULL
  );

CREATE POLICY "Users can manage own lists" ON user_lists
  FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- User ratings policies
CREATE POLICY "Anyone can view ratings" ON user_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own ratings" ON user_ratings
  FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Activity feed policies
CREATE POLICY "Public activities are visible" ON user_activities
  FOR SELECT USING (
    is_private = false OR 
    auth.uid() = user_id OR
    auth.uid() IS NULL
  );

CREATE POLICY "Users can manage own activities" ON user_activities
  FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Follow system policies
CREATE POLICY "Anyone can view follows" ON user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id OR auth.uid() IS NULL);

CREATE POLICY "Users can unfollow" ON user_follows
  FOR DELETE USING (auth.uid() = follower_id OR auth.uid() IS NULL);

-- Shared lists policies
CREATE POLICY "Public lists are visible" ON shared_lists
  FOR SELECT USING (
    is_public = true OR 
    auth.uid() = user_id OR
    auth.uid() IS NULL
  );

CREATE POLICY "Users can manage own shared lists" ON shared_lists
  FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Public list items are visible" ON shared_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_lists 
      WHERE shared_lists.id = shared_list_items.list_id 
      AND (shared_lists.is_public = true OR shared_lists.user_id = auth.uid() OR auth.uid() IS NULL)
    )
  );

CREATE POLICY "Users can manage own list items" ON shared_list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shared_lists 
      WHERE shared_lists.id = shared_list_items.list_id 
      AND (shared_lists.user_id = auth.uid() OR auth.uid() IS NULL)
    )
  );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username')
  );
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lists_updated_at BEFORE UPDATE ON user_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ratings_updated_at BEFORE UPDATE ON user_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_lists_updated_at BEFORE UPDATE ON shared_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();