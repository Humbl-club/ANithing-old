-- Create trending and recent content RPC functions
-- These are needed for the home page

-- Function to get trending anime
CREATE OR REPLACE FUNCTION get_trending_anime(limit_param INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  anilist_id INTEGER,
  title TEXT,
  title_english TEXT,
  title_japanese TEXT,
  synopsis TEXT,
  image_url TEXT,
  score DECIMAL,
  rank DECIMAL,
  popularity INTEGER,
  members DECIMAL,
  favorites INTEGER,
  year INTEGER,
  color_theme TEXT,
  content_type TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  episodes INTEGER,
  aired_from DATE,
  aired_to DATE,
  season TEXT,
  status TEXT,
  type TEXT,
  trailer_url TEXT,
  trailer_site TEXT,
  trailer_id TEXT,
  next_episode_date DATE,
  next_episode_number INTEGER
) LANGUAGE SQL STABLE AS $$
  SELECT 
    t.id,
    t.anilist_id,
    t.title,
    t.title_english,
    t.title_japanese,
    t.synopsis,
    t.image_url,
    t.score,
    t.rank,
    t.popularity,
    t.members,
    t.favorites,
    t.year,
    t.color_theme,
    t.content_type,
    t.created_at,
    t.updated_at,
    ad.episodes,
    ad.aired_from,
    ad.aired_to,
    ad.season,
    ad.status,
    ad.type,
    ad.trailer_url,
    ad.trailer_site,
    ad.trailer_id,
    ad.next_episode_date,
    ad.next_episode_number
  FROM titles t
  LEFT JOIN anime_details ad ON t.id = ad.title_id
  WHERE t.content_type = 'anime'
  ORDER BY t.popularity DESC NULLS LAST, t.score DESC NULLS LAST
  LIMIT limit_param;
$$;

-- Function to get trending manga
CREATE OR REPLACE FUNCTION get_trending_manga(limit_param INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  anilist_id INTEGER,
  title TEXT,
  title_english TEXT,
  title_japanese TEXT,
  synopsis TEXT,
  image_url TEXT,
  score DECIMAL,
  rank DECIMAL,
  popularity INTEGER,
  members DECIMAL,
  favorites INTEGER,
  year INTEGER,
  color_theme TEXT,
  content_type TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  chapters INTEGER,
  volumes INTEGER,
  published_from DATE,
  published_to DATE,
  status TEXT,
  type TEXT,
  next_chapter_date DATE,
  next_chapter_number INTEGER
) LANGUAGE SQL STABLE AS $$
  SELECT 
    t.id,
    t.anilist_id,
    t.title,
    t.title_english,
    t.title_japanese,
    t.synopsis,
    t.image_url,
    t.score,
    t.rank,
    t.popularity,
    t.members,
    t.favorites,
    t.year,
    t.color_theme,
    t.content_type,
    t.created_at,
    t.updated_at,
    md.chapters,
    md.volumes,
    md.published_from,
    md.published_to,
    md.status,
    md.type,
    md.next_chapter_date,
    md.next_chapter_number
  FROM titles t
  LEFT JOIN manga_details md ON t.id = md.title_id
  WHERE t.content_type = 'manga'
  ORDER BY t.popularity DESC NULLS LAST, t.score DESC NULLS LAST
  LIMIT limit_param;
$$;

-- Function to get recent anime
CREATE OR REPLACE FUNCTION get_recent_anime(limit_param INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  anilist_id INTEGER,
  title TEXT,
  title_english TEXT,
  title_japanese TEXT,
  synopsis TEXT,
  image_url TEXT,
  score DECIMAL,
  rank DECIMAL,
  popularity INTEGER,
  members DECIMAL,
  favorites INTEGER,
  year INTEGER,
  color_theme TEXT,
  content_type TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  episodes INTEGER,
  aired_from DATE,
  aired_to DATE,
  season TEXT,
  status TEXT,
  type TEXT,
  trailer_url TEXT,
  trailer_site TEXT,
  trailer_id TEXT,
  next_episode_date DATE,
  next_episode_number INTEGER
) LANGUAGE SQL STABLE AS $$
  SELECT 
    t.id,
    t.anilist_id,
    t.title,
    t.title_english,
    t.title_japanese,
    t.synopsis,
    t.image_url,
    t.score,
    t.rank,
    t.popularity,
    t.members,
    t.favorites,
    t.year,
    t.color_theme,
    t.content_type,
    t.created_at,
    t.updated_at,
    ad.episodes,
    ad.aired_from,
    ad.aired_to,
    ad.season,
    ad.status,
    ad.type,
    ad.trailer_url,
    ad.trailer_site,
    ad.trailer_id,
    ad.next_episode_date,
    ad.next_episode_number
  FROM titles t
  LEFT JOIN anime_details ad ON t.id = ad.title_id
  WHERE t.content_type = 'anime'
  ORDER BY t.created_at DESC NULLS LAST
  LIMIT limit_param;
$$;

-- Function to get recent manga
CREATE OR REPLACE FUNCTION get_recent_manga(limit_param INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  anilist_id INTEGER,
  title TEXT,
  title_english TEXT,
  title_japanese TEXT,
  synopsis TEXT,
  image_url TEXT,
  score DECIMAL,
  rank DECIMAL,
  popularity INTEGER,
  members DECIMAL,
  favorites INTEGER,
  year INTEGER,
  color_theme TEXT,
  content_type TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  chapters INTEGER,
  volumes INTEGER,
  published_from DATE,
  published_to DATE,
  status TEXT,
  type TEXT,
  next_chapter_date DATE,
  next_chapter_number INTEGER
) LANGUAGE SQL STABLE AS $$
  SELECT 
    t.id,
    t.anilist_id,
    t.title,
    t.title_english,
    t.title_japanese,
    t.synopsis,
    t.image_url,
    t.score,
    t.rank,
    t.popularity,
    t.members,
    t.favorites,
    t.year,
    t.color_theme,
    t.content_type,
    t.created_at,
    t.updated_at,
    md.chapters,
    md.volumes,
    md.published_from,
    md.published_to,
    md.status,
    md.type,
    md.next_chapter_date,
    md.next_chapter_number
  FROM titles t
  LEFT JOIN manga_details md ON t.id = md.title_id
  WHERE t.content_type = 'manga'
  ORDER BY t.created_at DESC NULLS LAST
  LIMIT limit_param;
$$;
