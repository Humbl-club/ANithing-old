-- Ensure unique detail rows per title for upserts
CREATE UNIQUE INDEX IF NOT EXISTS ux_anime_details_title_id ON public.anime_details (title_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_manga_details_title_id ON public.manga_details (title_id);
