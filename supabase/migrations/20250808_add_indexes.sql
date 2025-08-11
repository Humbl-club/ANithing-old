-- Helpful indexes for common filters and sorts
create index if not exists idx_titles_content_type on public.titles (content_type);
-- was: anilist_score; schema uses 'score'
create index if not exists idx_titles_anilist_score on public.titles (score desc);
create index if not exists idx_titles_popularity on public.titles (popularity desc);
create index if not exists idx_titles_updated_at on public.titles (updated_at desc);

create index if not exists idx_anime_details_status on public.anime_details (status);
create index if not exists idx_anime_details_season on public.anime_details (season);

create index if not exists idx_manga_details_status on public.manga_details (status);

-- Join helper indexes
create index if not exists idx_title_genres_title on public.title_genres (title_id);
create index if not exists idx_title_studios_title on public.title_studios (title_id);
create index if not exists idx_title_authors_title on public.title_authors (title_id);
