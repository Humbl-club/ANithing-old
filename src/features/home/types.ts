// Home feature types
export interface HeroSectionProps {
  onSearch?: (query: string) => void;
}
export interface RecommendationSection {
  title: string;
  items: RecommendationItem[];
  type: 'anime' | 'manga' | 'mixed';
}
export interface RecommendationItem {
  id: string;
  title: string;
  coverImage?: string;
  score?: number;
  type: 'anime' | 'manga';
  reason?: string;
}
export interface TrendingContentProps {
  type: 'anime' | 'manga';
  timeRange: 'day' | 'week' | 'month';
  limit?: number;
}
export interface PersonalizedDashboardData {
  currentlyWatching: any[];
  recommendations: RecommendationSection[];
  recentActivity: any[];
  stats: {
    totalWatched: number;
    totalPlanned: number;
    hoursWatched: number;
  };
}