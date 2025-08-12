-- Production Readiness: Re-enable RLS on all core tables
-- This migration ensures proper security policies are active

-- Core content tables - allow public read access for content discovery
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anime_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.title_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.title_studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.title_authors ENABLE ROW LEVEL SECURITY;

-- User data tables - proper user isolation
ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Production-ready RLS policies for core content (public read access)
CREATE POLICY "Allow public read access to titles" ON public.titles
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to anime_details" ON public.anime_details
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to manga_details" ON public.manga_details
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to genres" ON public.genres
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to title_genres" ON public.title_genres
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to studios" ON public.studios
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to title_studios" ON public.title_studios
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to authors" ON public.authors
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to title_authors" ON public.title_authors
    FOR SELECT USING (true);

-- User data policies - secure user isolation
CREATE POLICY "Users can manage their own lists" ON public.user_lists
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own ratings" ON public.user_ratings
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
    USING (auth.uid() = user_id);

-- Enable service role access for edge functions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;