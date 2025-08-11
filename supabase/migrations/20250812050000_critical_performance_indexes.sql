-- CRITICAL PERFORMANCE INDEXES FOR 10K CONCURRENT USERS
-- ====================================================

-- Connection pool and query optimization indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_content_popularity_created 
ON titles (content_type, popularity DESC NULLS LAST, created_at DESC) 
WHERE popularity > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_updated_at_content
ON titles (updated_at DESC, content_type);

-- High-frequency query optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_lists_user_status_score
ON user_lists (user_id, status, score DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_user_type
ON user_preferences (user_id, preference_type);

-- Session and auth performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id_active
ON profiles (user_id) WHERE is_active = true;

-- Real-time features optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_ratings_created_at_desc
ON user_ratings (created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_lists_updated_at_desc
ON user_lists (updated_at DESC);

-- Search performance boost
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_title_prefix
ON titles (lower(title) text_pattern_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_title_english_prefix
ON titles (lower(title_english) text_pattern_ops) WHERE title_english IS NOT NULL;

-- Genre filtering performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_title_genres_covering
ON title_genres (genre_id, title_id) INCLUDE (created_at);

-- Memory and cache optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_essential_data
ON titles (id, anilist_id, title, image_url, score, popularity, content_type);

-- Connection pooling settings (comments for production deployment)
-- These should be applied at the PostgreSQL configuration level:
--
-- # CONNECTION POOLING FOR 10K CONCURRENT USERS
-- max_connections = 500
-- shared_buffers = 512MB
-- effective_cache_size = 2GB  
-- work_mem = 8MB
-- maintenance_work_mem = 128MB
-- checkpoint_completion_target = 0.9
-- wal_buffers = 16MB
-- default_statistics_target = 100
-- random_page_cost = 1.1
-- effective_io_concurrency = 200
-- 
-- # Connection pooling with PgBouncer recommended settings:
-- pool_mode = transaction
-- max_client_conn = 10000
-- default_pool_size = 100
-- reserve_pool_size = 25

-- Update statistics for all tables
ANALYZE;

-- Add comments for monitoring
COMMENT ON INDEX idx_titles_content_popularity_created IS 'Critical index for home page queries under load';
COMMENT ON INDEX idx_user_lists_user_status_score IS 'User dashboard performance optimization';