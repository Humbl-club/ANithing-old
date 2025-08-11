-- Social Features Migration
-- Run this in Supabase Dashboard SQL Editor to enable social features

-- Create user_follows table for follow/unfollow functionality
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_user_id, following_user_id),
  -- Prevent self-follows
  CONSTRAINT no_self_follow CHECK (follower_user_id != following_user_id)
);

-- Create user_lists table for custom lists
CREATE TABLE IF NOT EXISTS user_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'friends')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_list_items table to store list contents
CREATE TABLE IF NOT EXISTS user_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
  title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 10),
  user_status TEXT CHECK (user_status IN ('watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch')),
  notes TEXT,
  UNIQUE(list_id, title_id)
);

-- Create list_likes table for liking lists
CREATE TABLE IF NOT EXISTS list_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, list_id)
);

-- Create user_activity table for activity feed
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('follow', 'create_list', 'add_to_list', 'rate_title', 'review')),
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_list_id UUID REFERENCES user_lists(id) ON DELETE CASCADE,
  target_title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_visibility ON user_lists(visibility);
CREATE INDEX IF NOT EXISTS idx_user_list_items_list_id ON user_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_user_list_items_title_id ON user_list_items(title_id);
CREATE INDEX IF NOT EXISTS idx_list_likes_user_id ON list_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_list_likes_list_id ON list_likes(list_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);

-- Create RLS policies for security
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_follows
CREATE POLICY "Users can view public follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON user_follows FOR ALL USING (auth.uid() = follower_user_id);

-- RLS Policies for user_lists
CREATE POLICY "Users can view public and friends lists" ON user_lists FOR SELECT USING (
  visibility = 'public' OR 
  user_id = auth.uid() OR
  (visibility = 'friends' AND EXISTS (
    SELECT 1 FROM user_follows WHERE follower_user_id = auth.uid() AND following_user_id = user_lists.user_id
  ))
);
CREATE POLICY "Users can manage their own lists" ON user_lists FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_list_items
CREATE POLICY "Users can view list items based on list visibility" ON user_list_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_lists WHERE 
    user_lists.id = user_list_items.list_id AND (
      user_lists.visibility = 'public' OR 
      user_lists.user_id = auth.uid() OR
      (user_lists.visibility = 'friends' AND EXISTS (
        SELECT 1 FROM user_follows WHERE follower_user_id = auth.uid() AND following_user_id = user_lists.user_id
      ))
    )
  )
);
CREATE POLICY "Users can manage items in their own lists" ON user_list_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_lists WHERE user_lists.id = user_list_items.list_id AND user_lists.user_id = auth.uid()
  )
);

-- RLS Policies for list_likes
CREATE POLICY "Users can view all list likes" ON list_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own likes" ON list_likes FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_activity
CREATE POLICY "Users can view public activity" ON user_activity FOR SELECT USING (true);
CREATE POLICY "Users can insert their own activity" ON user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own activity" ON user_activity FOR DELETE USING (auth.uid() = user_id);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_stats(target_user_id UUID)
RETURNS TABLE (
  followers_count BIGINT,
  following_count BIGINT,
  lists_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM user_follows WHERE following_user_id = target_user_id) as followers_count,
    (SELECT COUNT(*) FROM user_follows WHERE follower_user_id = target_user_id) as following_count,
    (SELECT COUNT(*) FROM user_lists WHERE user_id = target_user_id AND visibility = 'public') as lists_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user feed
CREATE OR REPLACE FUNCTION get_user_feed(target_user_id UUID, limit_count INT DEFAULT 20)
RETURNS TABLE (
  activity_id UUID,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  activity_type TEXT,
  created_at TIMESTAMPTZ,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.id as activity_id,
    ua.user_id,
    p.username,
    p.avatar_url,
    ua.activity_type,
    ua.created_at,
    ua.metadata
  FROM user_activity ua
  LEFT JOIN profiles p ON ua.user_id = p.id
  WHERE ua.user_id IN (
    SELECT following_user_id 
    FROM user_follows 
    WHERE follower_user_id = target_user_id
  )
  OR ua.user_id = target_user_id
  ORDER BY ua.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for activity logging
CREATE OR REPLACE FUNCTION log_follow_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_activity (user_id, activity_type, target_user_id)
    VALUES (NEW.follower_user_id, 'follow', NEW.following_user_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_list_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_activity (user_id, activity_type, target_list_id, metadata)
    VALUES (NEW.user_id, 'create_list', NEW.id, jsonb_build_object('list_name', NEW.name));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_follow_activity
  AFTER INSERT ON user_follows
  FOR EACH ROW EXECUTE FUNCTION log_follow_activity();

CREATE TRIGGER trigger_list_activity
  AFTER INSERT ON user_lists
  FOR EACH ROW EXECUTE FUNCTION log_list_activity();

-- Insert some default lists for existing users (optional)
INSERT INTO user_lists (user_id, name, description, visibility)
SELECT 
  id as user_id,
  'Watching' as name,
  'Currently watching anime and reading manga' as description,
  'public' as visibility
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_lists WHERE user_lists.user_id = auth.users.id AND name = 'Watching'
)
ON CONFLICT DO NOTHING;

INSERT INTO user_lists (user_id, name, description, visibility)
SELECT 
  id as user_id,
  'Plan to Watch' as name,
  'Planning to watch these titles' as description,
  'public' as visibility
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_lists WHERE user_lists.user_id = auth.users.id AND name = 'Plan to Watch'
)
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Social features migration completed successfully!';
  RAISE NOTICE 'Created tables: user_follows, user_lists, user_list_items, list_likes, user_activity';
  RAISE NOTICE 'Added RLS policies, indexes, and helper functions';
  RAISE NOTICE 'Users can now follow each other, create custom lists, and share content';
END $$;