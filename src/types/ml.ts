export interface MLRecommendation {
  title_id: string;
  title: string;
  image_url?: string;
  content_type: string;
  original_score?: number;
  ml_score: number;
  recommendation_type: string;
  reason: string;
  confidence: number;
}

export interface UserPreference {
  genre: string;
  weight: number;
  confidence: number;
}