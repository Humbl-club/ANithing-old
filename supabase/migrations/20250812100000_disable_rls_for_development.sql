-- Disable RLS policies for development (to be removed before production)
-- This migration temporarily disables Row Level Security to allow unrestricted access during development

-- Disable RLS on all user-related tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_list_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_entries DISABLE ROW LEVEL SECURITY;

-- Disable RLS on content tables (these are typically public anyway)
ALTER TABLE public.titles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.anime_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.studios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.title_genres DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.title_studios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.title_authors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.title_characters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.title_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_statuses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaming_providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.title_streaming_providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_history DISABLE ROW LEVEL SECURITY;

-- Create public access policies for testing (allows all operations without authentication)
-- These policies will allow reading/writing without authentication

-- Grant public access to all tables for development
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Note: This is for DEVELOPMENT ONLY
-- Before production deployment, this migration should be reverted
-- and proper RLS policies should be enabled as per the production migration