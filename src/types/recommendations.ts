export interface RecommendationItem {
  id: number;
  title: string;
  title_english?: string;
  image_url?: string;
  cover_image?: string;
  score?: number;
  status?: string;
  content_type: 'anime' | 'manga';
  recommendationType?: string;
  confidence?: number;
  [key: string]: any;
}

export interface SmartRecommendation {
  id: number;
  title: string;
  title_english?: string;
  image_url?: string;
  cover_image?: string;
  score?: number;
  status?: string;
  content_type: 'anime' | 'manga';
  reason?: string;
  confidence?: number;
}

export interface ExtendedSmartRecommendation extends SmartRecommendation {
  image_url?: string;
  synopsis?: string;
  genres?: string[];
}
