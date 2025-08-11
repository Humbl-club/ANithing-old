export interface BaseContent {
  id: string | number;
  title: string;
  title_english?: string;
  image_url?: string;
  cover_image?: string;
  score?: number;
  status?: string;
  content_type: 'anime' | 'manga';
  synopsis?: string;
  genres?: string[];
  type?: string;
}

export interface Anime extends BaseContent {
  content_type: 'anime';
  episodes?: number;
  aired_from?: string;
  aired_to?: string;
  type: string;
  genres: string[];
  synopsis: string;
}

export interface Manga extends BaseContent {
  content_type: 'manga';
  chapters?: number;
  volumes?: number;
  published_from?: string;
  published_to?: string;
}
