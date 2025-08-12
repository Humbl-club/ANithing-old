-- ============================================================================
-- ENHANCED LIST MANAGEMENT SYSTEM
-- ============================================================================

-- Custom list types for advanced list management
CREATE TABLE IF NOT EXISTS custom_list_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_system BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default custom list types
INSERT INTO custom_list_types (name, description, icon, color, is_system, sort_order) VALUES
  ('favorites', 'Your favorite titles', 'heart', '#ef4444', true, 1),
  ('recommended', 'Titles you recommend to others', 'thumbs-up', '#10b981', true, 2),
  ('rewatching', 'Titles you are rewatching/rereading', 'rotate-cw', '#3b82f6', true, 3),
  ('priority', 'High priority titles to watch/read', 'star', '#f59e0b', true, 4),
  ('seasonal', 'Currently airing seasonal anime', 'calendar', '#8b5cf6', true, 5)
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order;

-- Custom user lists
CREATE TABLE IF NOT EXISTS custom_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  list_type_id UUID REFERENCES custom_list_types(id),
  is_public BOOLEAN DEFAULT false,
  is_collaborative BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Items in custom lists with advanced features
CREATE TABLE IF NOT EXISTS custom_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES custom_lists(id) ON DELETE CASCADE,
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  notes TEXT,
  personal_rating DECIMAL(3,1) CHECK (personal_rating >= 0 AND personal_rating <= 10),
  date_added TIMESTAMPTZ DEFAULT NOW(),
  added_by_user_id UUID REFERENCES auth.users(id),
  is_pinned BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  UNIQUE(list_id, title_id)
);

-- Enhance existing list_statuses table with additional fields
ALTER TABLE list_statuses ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'both' CHECK (media_type IN ('anime', 'manga', 'both'));
ALTER TABLE list_statuses ADD COLUMN IF NOT EXISTS label TEXT;

-- Update existing statuses with media types and labels
UPDATE list_statuses SET 
  media_type = CASE 
    WHEN name IN ('watching', 'plan_to_watch') THEN 'anime'
    WHEN name IN ('reading', 'plan_to_read') THEN 'manga'
    ELSE 'both'
  END,
  label = CASE name
    WHEN 'watching' THEN 'Watching'
    WHEN 'completed' THEN 'Completed'
    WHEN 'on_hold' THEN 'On Hold'
    WHEN 'dropped' THEN 'Dropped'
    WHEN 'plan_to_watch' THEN 'Plan to Watch'
    WHEN 'reading' THEN 'Reading'
    WHEN 'plan_to_read' THEN 'Plan to Read'
    ELSE INITCAP(REPLACE(name, '_', ' '))
  END
WHERE label IS NULL OR media_type IS NULL;

-- Enhance user_lists table with additional fields for better list management
ALTER TABLE user_lists ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE user_lists ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE user_lists ADD COLUMN IF NOT EXISTS custom_status TEXT;
ALTER TABLE user_lists ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE user_lists ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'friends', 'private'));
ALTER TABLE user_lists ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- List collaboration features
CREATE TABLE IF NOT EXISTS list_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES custom_lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT DEFAULT 'viewer' CHECK (permission_level IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(list_id, user_id)
);

-- List likes system
CREATE TABLE IF NOT EXISTS list_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES custom_lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, user_id)
);

-- Import/Export tracking
CREATE TABLE IF NOT EXISTS list_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('myanimelist', 'anilist', 'kitsu', 'csv', 'json')),
  import_status TEXT DEFAULT 'pending' CHECK (import_status IN ('pending', 'processing', 'completed', 'failed')),
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  import_data JSONB,
  error_log JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_lists_user_id ON custom_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_lists_is_public ON custom_lists(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_custom_lists_share_token ON custom_lists(share_token);
CREATE INDEX IF NOT EXISTS idx_custom_list_items_list_id ON custom_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_custom_list_items_title_id ON custom_list_items(title_id);
CREATE INDEX IF NOT EXISTS idx_custom_list_items_sort_order ON custom_list_items(list_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_user_lists_sort_order ON user_lists(user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_user_lists_tags ON user_lists USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_lists_visibility ON user_lists(user_id, visibility);
CREATE INDEX IF NOT EXISTS idx_user_lists_last_activity ON user_lists(user_id, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_list_collaborators_list_user ON list_collaborators(list_id, user_id);
CREATE INDEX IF NOT EXISTS idx_list_likes_list_id ON list_likes(list_id);
CREATE INDEX IF NOT EXISTS idx_list_imports_user_status ON list_imports(user_id, import_status);

-- Enable Row Level Security
ALTER TABLE custom_list_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_imports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom list types (everyone can read)
CREATE POLICY "Everyone can read custom list types" ON custom_list_types
  FOR SELECT USING (true);

-- RLS Policies for custom lists
CREATE POLICY "Public custom lists are readable" ON custom_lists
  FOR SELECT USING (
    is_public = true OR 
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM list_collaborators 
      WHERE list_collaborators.list_id = custom_lists.id 
      AND list_collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own custom lists" ON custom_lists
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for custom list items
CREATE POLICY "Custom list items follow list visibility" ON custom_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_lists 
      WHERE custom_lists.id = custom_list_items.list_id 
      AND (
        custom_lists.is_public = true OR 
        custom_lists.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM list_collaborators 
          WHERE list_collaborators.list_id = custom_lists.id 
          AND list_collaborators.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can modify their list items" ON custom_list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM custom_lists 
      WHERE custom_lists.id = custom_list_items.list_id 
      AND (
        custom_lists.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM list_collaborators 
          WHERE list_collaborators.list_id = custom_lists.id 
          AND list_collaborators.user_id = auth.uid()
          AND list_collaborators.permission_level IN ('owner', 'editor')
        )
      )
    )
  );

-- RLS Policies for list collaborators
CREATE POLICY "Users can view list collaborators" ON list_collaborators
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM custom_lists 
      WHERE custom_lists.id = list_collaborators.list_id 
      AND custom_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "List owners can manage collaborators" ON list_collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM custom_lists 
      WHERE custom_lists.id = list_collaborators.list_id 
      AND custom_lists.user_id = auth.uid()
    )
  );

-- RLS Policies for list likes
CREATE POLICY "Anyone can view list likes" ON list_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like/unlike lists" ON list_likes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their likes" ON list_likes
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for list imports
CREATE POLICY "Users can view own imports" ON list_imports
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own imports" ON list_imports
  FOR ALL USING (user_id = auth.uid());

-- Create updated_at triggers
CREATE TRIGGER update_custom_list_types_updated_at BEFORE UPDATE ON custom_list_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_lists_updated_at BEFORE UPDATE ON custom_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update list activity timestamp
CREATE OR REPLACE FUNCTION update_list_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_lists SET last_activity_at = NOW()
  WHERE id = NEW.id OR id = OLD.id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_activity_at on user_lists changes
CREATE TRIGGER update_user_lists_activity AFTER INSERT OR UPDATE OR DELETE ON user_lists
  FOR EACH ROW EXECUTE FUNCTION update_list_activity();

-- Function to update custom list like count
CREATE OR REPLACE FUNCTION update_list_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE custom_lists SET like_count = like_count + 1 WHERE id = NEW.list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE custom_lists SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain like count
CREATE TRIGGER update_custom_list_like_count
  AFTER INSERT OR DELETE ON list_likes
  FOR EACH ROW EXECUTE FUNCTION update_list_like_count();