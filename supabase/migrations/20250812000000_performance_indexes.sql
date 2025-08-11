-- Performance optimization: Add composite indexes for common query patterns

-- Composite indexes for home page queries (used by RPCs)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_content_popularity_score 
ON titles (content_type, popularity DESC NULLS LAST, score DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_content_created_at 
ON titles (content_type, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_content_score 
ON titles (content_type, score DESC NULLS LAST);

-- Index for searching by status and content type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_anime_details_status 
ON anime_details (status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_manga_details_status 
ON manga_details (status);

-- Composite index for user list queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_lists_user_title_status 
ON user_lists (user_id, title_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_lists_user_status_updated 
ON user_lists (user_id, status, updated_at DESC);

-- Index for rating queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_ratings_user_title 
ON user_ratings (user_id, title_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_ratings_title_rating 
ON user_ratings (title_id, rating DESC);

-- Genre association indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_title_genres_title 
ON title_genres (title_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_title_genres_genre 
ON title_genres (genre_id);

-- Studio association indexes  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_title_studios_title 
ON title_studios (title_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_title_studios_studio 
ON title_studios (studio_id);

-- Author association indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_title_authors_title 
ON title_authors (title_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_title_authors_author 
ON title_authors (author_id);

-- Import optimization indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_anilist_id 
ON titles (anilist_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_genres_name_type 
ON genres (name, type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_studios_name 
ON studios (name);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_authors_name 
ON authors (name);

-- Search optimization indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_title_trgm 
ON titles USING gin (title gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_titles_title_english_trgm 
ON titles USING gin (title_english gin_trgm_ops);

-- Enable pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Analyze tables to update statistics after index creation
ANALYZE titles;
ANALYZE anime_details;
ANALYZE manga_details;
ANALYZE user_lists;
ANALYZE user_ratings;
ANALYZE genres;
ANALYZE studios;
ANALYZE authors;
ANALYZE title_genres;
ANALYZE title_studios;
ANALYZE title_authors;