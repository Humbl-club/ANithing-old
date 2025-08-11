-- Add JSONB columns for enhanced data if they don't exist

-- For anime_details table
ALTER TABLE anime_details 
ADD COLUMN IF NOT EXISTS characters_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS staff_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS external_links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS streaming_episodes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS detailed_tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS relations_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS recommendations_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS airing_schedule JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rankings JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT NULL;

-- For manga_details table
ALTER TABLE manga_details
ADD COLUMN IF NOT EXISTS characters_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS staff_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS external_links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS detailed_tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS relations_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS recommendations_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rankings JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT NULL;

-- Add missing columns to titles table if needed
ALTER TABLE titles
ADD COLUMN IF NOT EXISTS banner_image TEXT,
ADD COLUMN IF NOT EXISTS mean_score NUMERIC,
ADD COLUMN IF NOT EXISTS hashtag TEXT,
ADD COLUMN IF NOT EXISTS synonyms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS country_of_origin TEXT,
ADD COLUMN IF NOT EXISTS source TEXT;

-- Add indexes for JSONB columns for better query performance
CREATE INDEX IF NOT EXISTS idx_anime_characters_data ON anime_details USING GIN (characters_data);
CREATE INDEX IF NOT EXISTS idx_anime_external_links ON anime_details USING GIN (external_links);
CREATE INDEX IF NOT EXISTS idx_anime_detailed_tags ON anime_details USING GIN (detailed_tags);
CREATE INDEX IF NOT EXISTS idx_anime_relations_data ON anime_details USING GIN (relations_data);

CREATE INDEX IF NOT EXISTS idx_manga_characters_data ON manga_details USING GIN (characters_data);
CREATE INDEX IF NOT EXISTS idx_manga_external_links ON manga_details USING GIN (external_links);
CREATE INDEX IF NOT EXISTS idx_manga_detailed_tags ON manga_details USING GIN (detailed_tags);
CREATE INDEX IF NOT EXISTS idx_manga_relations_data ON manga_details USING GIN (relations_data);

-- Create sync_status table if it doesn't exist (for incremental updates)
CREATE TABLE IF NOT EXISTS sync_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT UNIQUE NOT NULL CHECK (content_type IN ('anime', 'manga')),
  last_sync_check TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default sync status
INSERT INTO sync_status (content_type)
VALUES ('anime'), ('manga')
ON CONFLICT (content_type) DO NOTHING;