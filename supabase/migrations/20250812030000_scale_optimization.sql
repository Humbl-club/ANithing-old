-- SCALE OPTIMIZATION FOR 10K CONCURRENT USERS
-- =============================================

-- 1. Additional performance indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_popularity_desc 
ON titles (popularity DESC NULLS LAST) WHERE popularity IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_score_desc_filtered
ON titles (score DESC NULLS LAST) WHERE score IS NOT NULL AND score > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_year_desc
ON titles (year DESC NULLS LAST) WHERE year IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_favorites_desc
ON titles (favorites DESC NULLS LAST) WHERE favorites IS NOT NULL;

-- 2. Partial indexes for better performance on filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_anime_high_score
ON titles (score DESC, popularity DESC) 
WHERE content_type = 'anime' AND score >= 8.0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_manga_high_score
ON titles (score DESC, popularity DESC) 
WHERE content_type = 'manga' AND score >= 8.0;

-- 3. Status-based indexes for anime/manga details
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_anime_details_status_episodes
ON anime_details (status, episodes DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_manga_details_status_chapters
ON manga_details (status, chapters DESC NULLS LAST);

-- 4. Search optimization indexes (for fuzzy text search)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_title_gin
ON titles USING gin (to_tsvector('english', title));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_title_english_gin  
ON titles USING gin (to_tsvector('english', coalesce(title_english, '')));

-- 5. Composite indexes for complex home page queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_content_year_score
ON titles (content_type, year DESC, score DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_content_favorites_score
ON titles (content_type, favorites DESC NULLS LAST, score DESC NULLS LAST);

-- 6. Genre filtering optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_title_genres_composite
ON title_genres (genre_id, title_id);

-- 7. Connection pooling configuration (for production)
-- These settings should be applied at the PostgreSQL level
-- ALTER SYSTEM SET max_connections = 200;
-- ALTER SYSTEM SET shared_buffers = '256MB';
-- ALTER SYSTEM SET effective_cache_size = '1GB';
-- ALTER SYSTEM SET work_mem = '4MB';
-- ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- 8. Add database statistics for better query planning
CREATE STATISTICS IF NOT EXISTS titles_multi_stats 
ON content_type, score, popularity FROM titles;

-- 9. Ensure proper constraints are in place
ALTER TABLE titles ADD CONSTRAINT check_score_range 
CHECK (score IS NULL OR (score >= 0 AND score <= 10));

ALTER TABLE titles ADD CONSTRAINT check_popularity_positive
CHECK (popularity IS NULL OR popularity >= 0);

-- 10. Update table statistics
ANALYZE titles;
ANALYZE anime_details;
ANALYZE manga_details;
ANALYZE genres;
ANALYZE studios;
ANALYZE authors;
ANALYZE title_genres;
ANALYZE title_studios;
ANALYZE title_authors;

-- 11. Add helpful comments for monitoring
COMMENT ON TABLE titles IS 'Main content table - optimized for 10k concurrent users';
COMMENT ON INDEX idx_titles_popularity_desc IS 'Primary index for popularity-based queries';
COMMENT ON INDEX idx_titles_score_desc_filtered IS 'Primary index for score-based queries';