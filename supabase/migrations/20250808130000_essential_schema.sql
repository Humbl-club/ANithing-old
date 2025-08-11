-- ============================================================================
-- ESSENTIAL SCHEMA CREATION - Just create the tables without data migration
-- ============================================================================

-- Core titles table (unified data for anime/manga)
CREATE TABLE IF NOT EXISTS titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anilist_id INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_english TEXT,
  title_japanese TEXT,
  synopsis TEXT,
  image_url TEXT,
  score NUMERIC,
  rank INTEGER,
  popularity INTEGER,
  members INTEGER,
  favorites INTEGER,
  year INTEGER,
  color_theme TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('anime', 'manga')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anime-specific details table
CREATE TABLE IF NOT EXISTS anime_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  episodes INTEGER,
  aired_from DATE,
  aired_to DATE,
  season TEXT,
  status TEXT DEFAULT 'Finished Airing',
  type TEXT DEFAULT 'TV',
  trailer_url TEXT,
  trailer_site TEXT,
  trailer_id TEXT,
  next_episode_date TIMESTAMPTZ,
  next_episode_number INTEGER,
  last_sync_check TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manga-specific details table
CREATE TABLE IF NOT EXISTS manga_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  chapters INTEGER,
  volumes INTEGER,
  published_from DATE,
  published_to DATE,
  status TEXT DEFAULT 'Finished',
  type TEXT DEFAULT 'Manga',
  next_chapter_date TIMESTAMPTZ,
  next_chapter_number INTEGER,
  last_sync_check TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Normalized genres system
CREATE TABLE IF NOT EXISTS genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('anime', 'manga', 'both')) DEFAULT 'both',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Title-genre mapping table
CREATE TABLE IF NOT EXISTS title_genres (
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (title_id, genre_id)
);

-- Studios table (normalized)
CREATE TABLE IF NOT EXISTS studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Title-studio mapping
CREATE TABLE IF NOT EXISTS title_studios (
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  studio_id UUID REFERENCES studios(id) ON DELETE CASCADE,
  PRIMARY KEY (title_id, studio_id)
);

-- Authors table (for manga)
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Title-author mapping
CREATE TABLE IF NOT EXISTS title_authors (
  title_id UUID REFERENCES titles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  PRIMARY KEY (title_id, author_id)
);

-- Essential indexes for performance
CREATE INDEX IF NOT EXISTS idx_titles_content_type ON titles(content_type);
CREATE INDEX IF NOT EXISTS idx_titles_score ON titles(score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_titles_anilist_id ON titles(anilist_id);
CREATE INDEX IF NOT EXISTS idx_anime_details_title_id ON anime_details(title_id);
CREATE INDEX IF NOT EXISTS idx_manga_details_title_id ON manga_details(title_id);

-- Enable Row Level Security
ALTER TABLE titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE manga_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE title_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE title_studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE title_authors ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Public read titles" ON titles FOR SELECT USING (true);
CREATE POLICY "Public read anime_details" ON anime_details FOR SELECT USING (true);
CREATE POLICY "Public read manga_details" ON manga_details FOR SELECT USING (true);
CREATE POLICY "Public read genres" ON genres FOR SELECT USING (true);
CREATE POLICY "Public read title_genres" ON title_genres FOR SELECT USING (true);
CREATE POLICY "Public read studios" ON studios FOR SELECT USING (true);
CREATE POLICY "Public read title_studios" ON title_studios FOR SELECT USING (true);
CREATE POLICY "Public read authors" ON authors FOR SELECT USING (true);
CREATE POLICY "Public read title_authors" ON title_authors FOR SELECT USING (true);

-- Service role can manage everything
CREATE POLICY "Service role manages titles" ON titles FOR ALL USING (true);
CREATE POLICY "Service role manages anime_details" ON anime_details FOR ALL USING (true);
CREATE POLICY "Service role manages manga_details" ON manga_details FOR ALL USING (true);
CREATE POLICY "Service role manages genres" ON genres FOR ALL USING (true);
CREATE POLICY "Service role manages title_genres" ON title_genres FOR ALL USING (true);
CREATE POLICY "Service role manages studios" ON studios FOR ALL USING (true);
CREATE POLICY "Service role manages title_studios" ON title_studios FOR ALL USING (true);
CREATE POLICY "Service role manages authors" ON authors FOR ALL USING (true);
CREATE POLICY "Service role manages title_authors" ON title_authors FOR ALL USING (true);
