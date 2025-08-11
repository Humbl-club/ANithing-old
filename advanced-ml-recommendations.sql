-- Advanced FREE ML Recommendation Engine for PostgreSQL
-- Zero external costs - runs entirely on your existing Supabase database

-- 1. COLLABORATIVE FILTERING - Find users with similar taste
CREATE OR REPLACE FUNCTION get_user_similarity(user1_id UUID, user2_id UUID)
RETURNS FLOAT AS $$
DECLARE
  correlation_coefficient FLOAT;
BEGIN
  -- Calculate Pearson correlation coefficient between two users
  WITH user_ratings AS (
    SELECT 
      r1.rating as r1_rating,
      r2.rating as r2_rating
    FROM reviews r1
    INNER JOIN reviews r2 ON r1.title_id = r2.title_id
    WHERE r1.user_id = user1_id AND r2.user_id = user2_id
  ),
  stats AS (
    SELECT 
      COUNT(*) as n,
      AVG(r1_rating) as avg1,
      AVG(r2_rating) as avg2,
      SUM(r1_rating * r2_rating) as sum_xy,
      SUM(r1_rating * r1_rating) as sum_x2,
      SUM(r2_rating * r2_rating) as sum_y2
    FROM user_ratings
  )
  SELECT 
    CASE 
      WHEN n < 2 THEN 0
      ELSE (n * sum_xy - AVG(r1_rating * n) * AVG(r2_rating * n)) / 
           SQRT((n * sum_x2 - AVG(r1_rating * n)^2) * (n * sum_y2 - AVG(r2_rating * n)^2))
    END
  INTO correlation_coefficient
  FROM stats, user_ratings;
  
  RETURN COALESCE(correlation_coefficient, 0);
END;
$$ LANGUAGE plpgsql;

-- 2. COLLABORATIVE FILTERING RECOMMENDATIONS
CREATE OR REPLACE FUNCTION get_collaborative_recommendations(
  target_user_id UUID, 
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  title_id UUID,
  title TEXT,
  predicted_rating FLOAT,
  confidence FLOAT,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH similar_users AS (
    SELECT 
      r.user_id,
      get_user_similarity(target_user_id, r.user_id) as similarity
    FROM reviews r
    WHERE r.user_id != target_user_id
      AND get_user_similarity(target_user_id, r.user_id) > 0.1
    GROUP BY r.user_id
    HAVING COUNT(DISTINCT r.title_id) >= 5
    ORDER BY similarity DESC
    LIMIT 50
  ),
  weighted_ratings AS (
    SELECT 
      r.title_id,
      SUM(r.rating * su.similarity) / SUM(su.similarity) as predicted_score,
      COUNT(*) as rating_count,
      AVG(su.similarity) as avg_similarity
    FROM similar_users su
    JOIN reviews r ON su.user_id = r.user_id
    WHERE r.title_id NOT IN (
      SELECT title_id FROM reviews WHERE user_id = target_user_id
    )
    GROUP BY r.title_id
    HAVING COUNT(*) >= 3
  )
  SELECT 
    t.id,
    t.title,
    wr.predicted_score,
    LEAST(wr.rating_count::FLOAT / 10, 1.0) * wr.avg_similarity as confidence,
    'Users with similar taste rated this ' || ROUND(wr.predicted_score, 1) || ' stars'
  FROM weighted_ratings wr
  JOIN titles t ON wr.title_id = t.id
  ORDER BY (wr.predicted_score * confidence) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 3. CONTENT-BASED RECOMMENDATIONS WITH VECTOR SIMILARITY
CREATE OR REPLACE FUNCTION get_content_based_recommendations(
  target_user_id UUID,
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  title_id UUID,
  title TEXT,
  similarity_score FLOAT,
  confidence FLOAT,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_genre_preferences AS (
    -- Calculate user's genre preferences weighted by ratings
    SELECT 
      g.name as genre_name,
      AVG(r.rating) as avg_rating,
      COUNT(*) as genre_count,
      STDDEV(r.rating) as rating_variance
    FROM reviews r
    JOIN title_genres tg ON r.title_id = tg.title_id
    JOIN genres g ON tg.genre_id = g.id
    WHERE r.user_id = target_user_id
    GROUP BY g.name
    HAVING COUNT(*) >= 2
  ),
  user_studio_preferences AS (
    -- Calculate user's studio preferences
    SELECT 
      s.name as studio_name,
      AVG(r.rating) as avg_rating,
      COUNT(*) as studio_count
    FROM reviews r
    JOIN title_studios ts ON r.title_id = ts.title_id
    JOIN studios s ON ts.studio_id = s.id
    WHERE r.user_id = target_user_id
    GROUP BY s.name
    HAVING COUNT(*) >= 1
  ),
  title_scores AS (
    SELECT 
      t.id,
      t.title,
      -- Genre similarity score
      COALESCE(SUM(ugp.avg_rating * ugp.genre_count) / NULLIF(SUM(ugp.genre_count), 0), 0) as genre_score,
      -- Studio similarity score  
      COALESCE(MAX(usp.avg_rating), 0) as studio_score,
      -- Popularity boost for highly rated titles
      COALESCE(t.score / 10, 0) as quality_score,
      -- Count of matching preferences
      COUNT(DISTINCT ugp.genre_name) as genre_matches,
      COUNT(DISTINCT usp.studio_name) as studio_matches
    FROM titles t
    LEFT JOIN title_genres tg ON t.id = tg.title_id
    LEFT JOIN genres g ON tg.genre_id = g.id
    LEFT JOIN user_genre_preferences ugp ON g.name = ugp.genre_name
    LEFT JOIN title_studios ts ON t.id = ts.title_id
    LEFT JOIN studios s ON ts.studio_id = s.id
    LEFT JOIN user_studio_preferences usp ON s.name = usp.studio_name
    WHERE t.id NOT IN (
      SELECT title_id FROM reviews WHERE user_id = target_user_id
    )
    GROUP BY t.id, t.title, t.score
    HAVING COUNT(DISTINCT ugp.genre_name) >= 1 OR COUNT(DISTINCT usp.studio_name) >= 1
  ),
  final_scores AS (
    SELECT 
      *,
      (genre_score * 0.5 + studio_score * 0.3 + quality_score * 0.2) as combined_score,
      LEAST((genre_matches + studio_matches)::FLOAT / 5, 1.0) as confidence_score
    FROM title_scores
  )
  SELECT 
    fs.id,
    fs.title,
    fs.combined_score,
    fs.confidence_score,
    CASE 
      WHEN fs.genre_matches > 0 AND fs.studio_matches > 0 THEN
        'Matches ' || fs.genre_matches || ' of your favorite genres and a preferred studio'
      WHEN fs.genre_matches > 0 THEN
        'Matches ' || fs.genre_matches || ' of your favorite genres'
      ELSE
        'From a studio you enjoy'
    END as reason
  FROM final_scores fs
  ORDER BY (fs.combined_score * fs.confidence_score) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 4. HYBRID RECOMMENDATIONS COMBINING MULTIPLE ALGORITHMS
CREATE OR REPLACE FUNCTION get_hybrid_recommendations(
  target_user_id UUID,
  limit_count INT DEFAULT 20
)
RETURNS TABLE (
  title_id UUID,
  title TEXT,
  image_url TEXT,
  content_type TEXT,
  score FLOAT,
  final_score FLOAT,
  recommendation_type TEXT,
  reason TEXT,
  confidence FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH collaborative_recs AS (
    SELECT 
      cr.title_id, cr.title, cr.predicted_rating as score, 
      cr.confidence, 'collaborative' as rec_type, cr.reason
    FROM get_collaborative_recommendations(target_user_id, 15) cr
  ),
  content_recs AS (
    SELECT 
      cb.title_id, cb.title, cb.similarity_score as score,
      cb.confidence, 'content' as rec_type, cb.reason
    FROM get_content_based_recommendations(target_user_id, 15) cb
  ),
  trending_recs AS (
    -- Add trending/popular items for diversity
    SELECT 
      t.id as title_id, t.title, COALESCE(t.score, 0) as score,
      0.7 as confidence, 'trending' as rec_type,
      'Currently popular with high ratings' as reason
    FROM titles t
    WHERE t.score >= 8.0 
      AND t.popularity > 10000
      AND t.id NOT IN (SELECT title_id FROM reviews WHERE user_id = target_user_id)
    ORDER BY t.popularity DESC, t.score DESC
    LIMIT 10
  ),
  combined_recs AS (
    SELECT * FROM collaborative_recs
    UNION ALL
    SELECT * FROM content_recs  
    UNION ALL
    SELECT * FROM trending_recs
  ),
  weighted_final AS (
    SELECT 
      cr.title_id,
      cr.title,
      cr.score,
      cr.confidence,
      cr.rec_type,
      cr.reason,
      -- Weight collaborative filtering higher, but boost content-based for new users
      CASE cr.rec_type
        WHEN 'collaborative' THEN cr.score * 1.2 * cr.confidence
        WHEN 'content' THEN cr.score * 1.0 * cr.confidence  
        WHEN 'trending' THEN cr.score * 0.8 * cr.confidence
      END as final_weighted_score
    FROM combined_recs cr
  )
  SELECT 
    t.id, t.title, t.image_url, t.content_type, t.score,
    wf.final_weighted_score, wf.rec_type, wf.reason, wf.confidence
  FROM weighted_final wf
  JOIN titles t ON wf.title_id = t.id
  ORDER BY wf.final_weighted_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 5. SEASONAL AND CONTEXTUAL RECOMMENDATIONS  
CREATE OR REPLACE FUNCTION get_seasonal_recommendations(
  target_user_id UUID,
  current_season TEXT DEFAULT NULL,
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  title_id UUID,
  title TEXT,
  seasonal_score FLOAT,
  reason TEXT
) AS $$
DECLARE
  detected_season TEXT;
BEGIN
  -- Auto-detect current season if not provided
  IF current_season IS NULL THEN
    SELECT CASE 
      WHEN EXTRACT(MONTH FROM NOW()) IN (12, 1, 2) THEN 'WINTER'
      WHEN EXTRACT(MONTH FROM NOW()) IN (3, 4, 5) THEN 'SPRING'
      WHEN EXTRACT(MONTH FROM NOW()) IN (6, 7, 8) THEN 'SUMMER'
      ELSE 'FALL'
    END INTO detected_season;
  ELSE
    detected_season := current_season;
  END IF;

  RETURN QUERY
  WITH user_preferences AS (
    SELECT AVG(rating) as avg_user_rating
    FROM reviews 
    WHERE user_id = target_user_id
  ),
  seasonal_titles AS (
    SELECT 
      t.id, t.title, t.score, ad.season,
      -- Boost score for matching season
      CASE 
        WHEN ad.season = detected_season THEN t.score * 1.3
        ELSE t.score * 1.0
      END as seasonal_adjusted_score
    FROM titles t
    JOIN anime_details ad ON t.id = ad.title_id
    WHERE t.content_type = 'anime'
      AND t.score >= 7.0
      AND t.id NOT IN (SELECT title_id FROM reviews WHERE user_id = target_user_id)
  )
  SELECT 
    st.id, st.title, st.seasonal_adjusted_score,
    CASE 
      WHEN st.season = detected_season THEN 'Perfect for ' || detected_season || ' season viewing!'
      ELSE 'Highly rated title you might enjoy'
    END as reason
  FROM seasonal_titles st
  CROSS JOIN user_preferences up
  WHERE st.seasonal_adjusted_score >= up.avg_user_rating - 1.0
  ORDER BY st.seasonal_adjusted_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 6. DIVERSITY INJECTION - Prevent recommendation bubbles
CREATE OR REPLACE FUNCTION get_diverse_recommendations(
  target_user_id UUID,
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  title_id UUID,
  title TEXT,
  diversity_score FLOAT,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_genre_history AS (
    SELECT g.name, COUNT(*) as frequency
    FROM reviews r
    JOIN title_genres tg ON r.title_id = tg.title_id  
    JOIN genres g ON tg.genre_id = g.id
    WHERE r.user_id = target_user_id
    GROUP BY g.name
  ),
  unexplored_genres AS (
    SELECT g.name
    FROM genres g
    WHERE g.name NOT IN (SELECT name FROM user_genre_history)
      AND g.type = 'anime'
    LIMIT 5
  ),
  diverse_titles AS (
    SELECT 
      t.id, t.title, t.score,
      -- Higher score for unexplored genres
      t.score + 2.0 as boosted_score
    FROM titles t
    JOIN title_genres tg ON t.id = tg.title_id
    JOIN genres g ON tg.genre_id = g.id
    JOIN unexplored_genres ug ON g.name = ug.name
    WHERE t.score >= 7.5
      AND t.id NOT IN (SELECT title_id FROM reviews WHERE user_id = target_user_id)
    GROUP BY t.id, t.title, t.score
  )
  SELECT 
    dt.id, dt.title, dt.boosted_score,
    'Explore a new genre - highly rated ' || 
    (SELECT string_agg(g.name, ', ') 
     FROM title_genres tg 
     JOIN genres g ON tg.genre_id = g.id 
     WHERE tg.title_id = dt.id LIMIT 3) as reason
  FROM diverse_titles dt
  ORDER BY dt.boosted_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 7. MASTER RECOMMENDATION FUNCTION - Combines everything
CREATE OR REPLACE FUNCTION get_smart_recommendations(
  target_user_id UUID,
  limit_count INT DEFAULT 20,
  include_diverse BOOLEAN DEFAULT true,
  include_seasonal BOOLEAN DEFAULT true
)
RETURNS TABLE (
  title_id UUID,
  title TEXT,
  image_url TEXT,
  content_type TEXT,
  original_score FLOAT,
  ml_score FLOAT,
  recommendation_type TEXT,
  reason TEXT,
  confidence FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH all_recommendations AS (
    -- Hybrid recommendations (70% of results)
    SELECT 
      hr.title_id, hr.title, hr.image_url, hr.content_type,
      hr.score, hr.final_score, hr.recommendation_type, hr.reason, hr.confidence,
      ROW_NUMBER() OVER (ORDER BY hr.final_score DESC) as rank,
      'primary' as category
    FROM get_hybrid_recommendations(target_user_id, CEIL(limit_count * 0.7)::INT) hr
    
    UNION ALL
    
    -- Seasonal recommendations (15% of results)  
    SELECT 
      sr.title_id, t.title, t.image_url, t.content_type,
      t.score, sr.seasonal_score, 'seasonal', sr.reason, 0.8,
      ROW_NUMBER() OVER (ORDER BY sr.seasonal_score DESC) as rank,
      'seasonal' as category
    FROM get_seasonal_recommendations(target_user_id, NULL, CEIL(limit_count * 0.15)::INT) sr
    JOIN titles t ON sr.title_id = t.id
    WHERE include_seasonal = true
    
    UNION ALL
    
    -- Diverse recommendations (15% of results)
    SELECT 
      dr.title_id, t.title, t.image_url, t.content_type, 
      t.score, dr.diversity_score, 'diversity', dr.reason, 0.6,
      ROW_NUMBER() OVER (ORDER BY dr.diversity_score DESC) as rank,
      'diverse' as category  
    FROM get_diverse_recommendations(target_user_id, CEIL(limit_count * 0.15)::INT) dr
    JOIN titles t ON dr.title_id = t.id
    WHERE include_diverse = true
  ),
  deduplicated AS (
    SELECT DISTINCT ON (ar.title_id) *
    FROM all_recommendations ar
    ORDER BY ar.title_id, ar.ml_score DESC
  )
  SELECT 
    d.title_id, d.title, d.image_url, d.content_type,
    d.original_score, d.ml_score, d.recommendation_type, d.reason, d.confidence
  FROM deduplicated d
  ORDER BY d.ml_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 8. PERFORMANCE OPTIMIZATION INDEXES
CREATE INDEX IF NOT EXISTS idx_reviews_user_title ON reviews(user_id, title_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_titles_score_popularity ON titles(score DESC, popularity DESC) WHERE score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_title_genres_composite ON title_genres(title_id, genre_id);
CREATE INDEX IF NOT EXISTS idx_title_studios_composite ON title_studios(title_id, studio_id);

-- 9. RECOMMENDATION CACHING FOR PERFORMANCE  
CREATE TABLE IF NOT EXISTS recommendation_cache (
  user_id UUID NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '6 hours',
  PRIMARY KEY (user_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendation_cache_expires ON recommendation_cache(expires_at);

-- Auto-cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_recommendation_cache() RETURNS void AS $$
BEGIN
  DELETE FROM recommendation_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Advanced ML Recommendation Engine installed successfully! 🚀' as status;