-- Manual SQL to add JSONB columns for rich data
-- Run this in Supabase SQL Editor

-- Add JSONB columns to anime_details table
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

-- Add JSONB columns to manga_details table
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

-- Create indexes for JSONB columns for better performance
CREATE INDEX IF NOT EXISTS idx_anime_characters_data ON anime_details USING GIN (characters_data);
CREATE INDEX IF NOT EXISTS idx_anime_external_links ON anime_details USING GIN (external_links);
CREATE INDEX IF NOT EXISTS idx_anime_detailed_tags ON anime_details USING GIN (detailed_tags);
CREATE INDEX IF NOT EXISTS idx_anime_relations_data ON anime_details USING GIN (relations_data);
CREATE INDEX IF NOT EXISTS idx_anime_recommendations_data ON anime_details USING GIN (recommendations_data);

CREATE INDEX IF NOT EXISTS idx_manga_characters_data ON manga_details USING GIN (characters_data);
CREATE INDEX IF NOT EXISTS idx_manga_external_links ON manga_details USING GIN (external_links);
CREATE INDEX IF NOT EXISTS idx_manga_detailed_tags ON manga_details USING GIN (detailed_tags);
CREATE INDEX IF NOT EXISTS idx_manga_relations_data ON manga_details USING GIN (relations_data);
CREATE INDEX IF NOT EXISTS idx_manga_recommendations_data ON manga_details USING GIN (recommendations_data);

-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_titles_anilist_id ON titles(anilist_id);
CREATE INDEX IF NOT EXISTS idx_titles_content_type ON titles(content_type);
CREATE INDEX IF NOT EXISTS idx_titles_score ON titles(score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_titles_popularity ON titles(popularity DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_titles_year ON titles(year);
CREATE INDEX IF NOT EXISTS idx_titles_updated_at ON titles(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_anime_details_title_id ON anime_details(title_id);
CREATE INDEX IF NOT EXISTS idx_anime_details_season ON anime_details(season);
CREATE INDEX IF NOT EXISTS idx_anime_details_status ON anime_details(status);
CREATE INDEX IF NOT EXISTS idx_anime_details_aired_from ON anime_details(aired_from);

CREATE INDEX IF NOT EXISTS idx_manga_details_title_id ON manga_details(title_id);
CREATE INDEX IF NOT EXISTS idx_manga_details_status ON manga_details(status);
CREATE INDEX IF NOT EXISTS idx_manga_details_published_from ON manga_details(published_from);

-- Create composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_titles_type_score ON titles(content_type, score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_titles_type_popularity ON titles(content_type, popularity DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_anime_season_year ON anime_details(season, aired_from);

-- Add constraint to ensure title_id is unique in anime_details
ALTER TABLE anime_details 
ADD CONSTRAINT anime_details_title_id_unique UNIQUE (title_id);

-- Add constraint to ensure title_id is unique in manga_details
ALTER TABLE manga_details 
ADD CONSTRAINT manga_details_title_id_unique UNIQUE (title_id);

-- Create a function to search characters across anime
CREATE OR REPLACE FUNCTION search_anime_characters(search_term TEXT)
RETURNS TABLE (
    title_id UUID,
    title TEXT,
    character_name TEXT,
    character_role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ad.title_id,
        t.title,
        (char_data->>'node'->>'name'->>'full')::TEXT as character_name,
        (char_data->>'role')::TEXT as character_role
    FROM anime_details ad
    JOIN titles t ON t.id = ad.title_id
    CROSS JOIN LATERAL jsonb_array_elements(ad.characters_data) AS char_data
    WHERE (char_data->>'node'->>'name'->>'full')::TEXT ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql;

-- Create a function to get streaming platforms for an anime
CREATE OR REPLACE FUNCTION get_anime_streaming_platforms(anime_title_id UUID)
RETURNS TABLE (
    site TEXT,
    url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (link->>'site')::TEXT,
        (link->>'url')::TEXT
    FROM anime_details ad
    CROSS JOIN LATERAL jsonb_array_elements(ad.external_links) AS link
    WHERE ad.title_id = anime_title_id
    AND (link->>'type')::TEXT = 'STREAMING';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON anime_details TO authenticated;
GRANT ALL ON manga_details TO authenticated;
GRANT ALL ON titles TO authenticated;
GRANT EXECUTE ON FUNCTION search_anime_characters TO authenticated;
GRANT EXECUTE ON FUNCTION get_anime_streaming_platforms TO authenticated;