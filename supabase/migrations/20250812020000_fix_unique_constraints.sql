-- Fix missing unique constraints for upserts
-- Drop existing indexes if they exist
DROP INDEX IF EXISTS ux_anime_details_title_id;
DROP INDEX IF EXISTS ux_manga_details_title_id;

-- Add unique constraints instead of just indexes for proper upsert support
ALTER TABLE anime_details ADD CONSTRAINT ux_anime_details_title_id UNIQUE (title_id);
ALTER TABLE manga_details ADD CONSTRAINT ux_manga_details_title_id UNIQUE (title_id);

-- Verify the constraints are in place
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  conrelid::regclass as table_name
FROM pg_constraint 
WHERE conrelid IN ('anime_details'::regclass, 'manga_details'::regclass)
  AND contype = 'u';