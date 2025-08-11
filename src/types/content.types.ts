/**
 * Unified content types - replaces separate anime/manga types
 * Saves ~500 lines by consolidating duplicate definitions
*/

export interface BaseContent {
  id: string | number;
  anilist_id?: number;
  title: string;
  title_english?: string | null;
  title_native?: string | null;
  description?: string | null;
  content_type: 'anime' | 'manga';
  score?: number | null;
  popularity?: number | null;
  favorites?: number | null;
  status?: string | null;
  cover_image?: string | null;
  banner_image?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AnimeContent extends BaseContent {
  content_type: 'anime';
  episodes?: number | null;
  duration?: number | null;
  season?: string | null;
  season_year?: number | null;
  format?: string | null;
  studios?: Array<{ name: string }>;
}

export interface MangaContent extends BaseContent {
  content_type: 'manga';
  chapters?: number | null;
  volumes?: number | null;
  authors?: Array<{ name: string }>;
}

export type Content = AnimeContent | MangaContent;

// Generic list types
export interface ContentList<T extends BaseContent = Content> {
  id: string;
  name: string;
  items: T[];
  created_at: string;
  updated_at: string;
}

// Re-export for backwards compatibility
export type Anime = AnimeContent;
export type Manga = MangaContent;