-- OPTIMIZED RPC FUNCTIONS FOR 10K CONCURRENT USERS
-- =================================================

-- Drop existing functions to recreate them optimized
DROP FUNCTION IF EXISTS get_trending_anime(INT);
DROP FUNCTION IF EXISTS get_trending_manga(INT);
DROP FUNCTION IF EXISTS get_recent_anime(INT);
DROP FUNCTION IF EXISTS get_recent_manga(INT);

-- Optimized trending anime function with better indexing and caching
CREATE OR REPLACE FUNCTION get_trending_anime(limit_param INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  anilist_id INTEGER,
  title TEXT,
  title_english TEXT,
  title_japanese TEXT,
  synopsis TEXT,
  image_url TEXT,
  score NUMERIC,
  popularity INTEGER,
  favorites INTEGER,
  year INTEGER,
  color_theme TEXT,
  episodes INTEGER,
  status TEXT,
  type TEXT,
  season TEXT,
  aired_from DATE,
  aired_to DATE
) LANGUAGE SQL STABLE PARALLEL SAFE AS $$
  SELECT 
    t.id,
    t.anilist_id,
    t.title,
    t.title_english,
    t.title_japanese,
    CASE 
      WHEN length(t.synopsis) > 300 THEN substring(t.synopsis from 1 for 300) || '...'
      ELSE t.synopsis
    END as synopsis,
    t.image_url,
    t.score,
    t.popularity,
    t.favorites,
    t.year,
    t.color_theme,
    ad.episodes,
    ad.status,
    ad.type,
    ad.season,
    ad.aired_from,
    ad.aired_to
  FROM titles t
  LEFT JOIN anime_details ad ON t.id = ad.title_id
  WHERE t.content_type = 'anime' 
    AND t.popularity IS NOT NULL 
    AND t.popularity > 0
  ORDER BY t.popularity DESC, t.score DESC NULLS LAST
  LIMIT limit_param;
$$;

-- Optimized trending manga function
CREATE OR REPLACE FUNCTION get_trending_manga(limit_param INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  anilist_id INTEGER,
  title TEXT,
  title_english TEXT,
  title_japanese TEXT,
  synopsis TEXT,
  image_url TEXT,
  score NUMERIC,
  popularity INTEGER,
  favorites INTEGER,
  year INTEGER,
  color_theme TEXT,
  chapters INTEGER,
  volumes INTEGER,
  status TEXT,
  type TEXT,
  published_from DATE,
  published_to DATE
) LANGUAGE SQL STABLE PARALLEL SAFE AS $$
  SELECT 
    t.id,
    t.anilist_id,
    t.title,
    t.title_english,
    t.title_japanese,
    CASE 
      WHEN length(t.synopsis) > 300 THEN substring(t.synopsis from 1 for 300) || '...'
      ELSE t.synopsis
    END as synopsis,
    t.image_url,
    t.score,
    t.popularity,
    t.favorites,
    t.year,
    t.color_theme,
    md.chapters,
    md.volumes,
    md.status,
    md.type,
    md.published_from,
    md.published_to
  FROM titles t
  LEFT JOIN manga_details md ON t.id = md.title_id
  WHERE t.content_type = 'manga' 
    AND t.popularity IS NOT NULL 
    AND t.popularity > 0
  ORDER BY t.popularity DESC, t.score DESC NULLS LAST
  LIMIT limit_param;
$$;

-- High-performance top-rated anime function
CREATE OR REPLACE FUNCTION get_top_rated_anime(limit_param INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  anilist_id INTEGER,
  title TEXT,
  title_english TEXT,
  image_url TEXT,
  score NUMERIC,
  popularity INTEGER,
  episodes INTEGER,
  status TEXT,
  year INTEGER
) LANGUAGE SQL STABLE PARALLEL SAFE AS $$
  SELECT 
    t.id,
    t.anilist_id,
    t.title,
    t.title_english,
    t.image_url,
    t.score,
    t.popularity,
    ad.episodes,
    ad.status,
    t.year
  FROM titles t
  LEFT JOIN anime_details ad ON t.id = ad.title_id
  WHERE t.content_type = 'anime' 
    AND t.score IS NOT NULL 
    AND t.score >= 8.0
  ORDER BY t.score DESC, t.popularity DESC
  LIMIT limit_param;
$$;

-- High-performance top-rated manga function
CREATE OR REPLACE FUNCTION get_top_rated_manga(limit_param INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  anilist_id INTEGER,
  title TEXT,
  title_english TEXT,
  image_url TEXT,
  score NUMERIC,
  popularity INTEGER,
  chapters INTEGER,
  status TEXT,
  year INTEGER
) LANGUAGE SQL STABLE PARALLEL SAFE AS $$
  SELECT 
    t.id,
    t.anilist_id,
    t.title,
    t.title_english,
    t.image_url,
    t.score,
    t.popularity,
    md.chapters,
    md.status,
    t.year
  FROM titles t
  LEFT JOIN manga_details md ON t.id = md.title_id
  WHERE t.content_type = 'manga' 
    AND t.score IS NOT NULL 
    AND t.score >= 8.0
  ORDER BY t.score DESC, t.popularity DESC
  LIMIT limit_param;
$$;

-- Fast search function with text search capabilities
CREATE OR REPLACE FUNCTION search_titles(
  search_query TEXT,
  content_filter TEXT DEFAULT 'all',
  limit_param INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  anilist_id INTEGER,
  title TEXT,
  title_english TEXT,
  image_url TEXT,
  score NUMERIC,
  popularity INTEGER,
  content_type TEXT,
  year INTEGER,
  rank REAL
) LANGUAGE SQL STABLE PARALLEL SAFE AS $$
  SELECT 
    t.id,
    t.anilist_id,
    t.title,
    t.title_english,
    t.image_url,
    t.score,
    t.popularity,
    t.content_type,
    t.year,
    GREATEST(
      similarity(t.title, search_query),
      similarity(coalesce(t.title_english, ''), search_query)
    ) as rank
  FROM titles t
  WHERE (content_filter = 'all' OR t.content_type = content_filter)
    AND (
      t.title ILIKE '%' || search_query || '%'
      OR t.title_english ILIKE '%' || search_query || '%'
      OR t.title % search_query
      OR t.title_english % search_query
    )
  ORDER BY rank DESC, t.popularity DESC NULLS LAST
  LIMIT limit_param;
$$;

-- Batch home data function (reduces round trips)
CREATE OR REPLACE FUNCTION get_home_data()
RETURNS JSON LANGUAGE SQL STABLE PARALLEL SAFE AS $$
  SELECT json_build_object(
    'trending_anime', (
      SELECT json_agg(row_to_json(t))
      FROM (SELECT * FROM get_trending_anime(12)) t
    ),
    'trending_manga', (
      SELECT json_agg(row_to_json(t))
      FROM (SELECT * FROM get_trending_manga(12)) t
    ),
    'top_rated_anime', (
      SELECT json_agg(row_to_json(t))
      FROM (SELECT * FROM get_top_rated_anime(12)) t
    ),
    'top_rated_manga', (
      SELECT json_agg(row_to_json(t))
      FROM (SELECT * FROM get_top_rated_manga(12)) t
    )
  );
$$;

-- Genre-based recommendations function
CREATE OR REPLACE FUNCTION get_titles_by_genre(
  genre_name TEXT,
  content_filter TEXT DEFAULT 'all',
  limit_param INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  anilist_id INTEGER,
  title TEXT,
  title_english TEXT,
  image_url TEXT,
  score NUMERIC,
  popularity INTEGER,
  content_type TEXT
) LANGUAGE SQL STABLE PARALLEL SAFE AS $$
  SELECT 
    t.id,
    t.anilist_id,
    t.title,
    t.title_english,
    t.image_url,
    t.score,
    t.popularity,
    t.content_type
  FROM titles t
  INNER JOIN title_genres tg ON t.id = tg.title_id
  INNER JOIN genres g ON tg.genre_id = g.id
  WHERE g.name ILIKE genre_name
    AND (content_filter = 'all' OR t.content_type = content_filter)
  ORDER BY t.score DESC NULLS LAST, t.popularity DESC NULLS LAST
  LIMIT limit_param;
$$;

-- Set function costs for better query planning
ALTER FUNCTION get_trending_anime(INT) SET cpu_multiplier = 10;
ALTER FUNCTION get_trending_manga(INT) SET cpu_multiplier = 10;
ALTER FUNCTION get_top_rated_anime(INT) SET cpu_multiplier = 8;
ALTER FUNCTION get_top_rated_manga(INT) SET cpu_multiplier = 8;
ALTER FUNCTION search_titles(TEXT, TEXT, INT) SET cpu_multiplier = 50;
ALTER FUNCTION get_home_data() SET cpu_multiplier = 20;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_trending_anime(INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_trending_manga(INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_top_rated_anime(INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_top_rated_manga(INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_titles(TEXT, TEXT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_home_data() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_titles_by_genre(TEXT, TEXT, INT) TO anon, authenticated;