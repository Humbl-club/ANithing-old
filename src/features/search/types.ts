// Search feature types
export interface SearchFilters {
  genre?: string[];
  year?: number;
  status?: string;
  type?: 'anime' | 'manga';
  minScore?: number;
  maxScore?: number;
}
export interface SearchResult {
  id: string;
  title: string;
  type: 'anime' | 'manga';
  coverImage?: string;
  score?: number;
  year?: number;
  status?: string;
}
export interface SearchAutocompleteProps {
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
  filters?: SearchFilters;
}
export interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error?: string;
  filters: SearchFilters;
}