import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultCount?: number;
  contentType?: 'anime' | 'manga' | 'all';
}

interface UseSearchHistoryReturn {
  searchHistory: string[];
  fullHistory: SearchHistoryItem[];
  addToHistory: (query: string, contentType?: 'anime' | 'manga' | 'all', resultCount?: number) => void;
  removeFromHistory: (query: string) => void;
  clearHistory: () => void;
  getPopularSearches: (limit?: number) => string[];
  getTrendingSearches: (days?: number, limit?: number) => string[];
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'search-history';
const MAX_HISTORY_ITEMS = 100;
const TRENDING_DAYS = 7;

export function useSearchHistory(): UseSearchHistoryReturn {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [fullHistory, setFullHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load search history from localStorage on mount
  useEffect(() => {
    setLoading(true);
    try {
      const storageKey = user ? `${STORAGE_KEY}-${user.id}` : STORAGE_KEY;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const parsed: SearchHistoryItem[] = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        
        setFullHistory(parsed);
        setSearchHistory(parsed.map(item => item.query));
      }
    } catch (err) {
      console.error('Failed to load search history:', err);
      setError('Failed to load search history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    if (fullHistory.length === 0) return;
    
    try {
      const storageKey = user ? `${STORAGE_KEY}-${user.id}` : STORAGE_KEY;
      localStorage.setItem(storageKey, JSON.stringify(fullHistory));
    } catch (err) {
      console.error('Failed to save search history:', err);
      setError('Failed to save search history');
    }
  }, [fullHistory, user]);

  // Add search query to history
  const addToHistory = useCallback((query: string, contentType: 'anime' | 'manga' | 'all' = 'all', resultCount?: number) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) return;

    setFullHistory(prev => {
      // Remove existing entry if it exists
      const filtered = prev.filter(item => item.query.toLowerCase() !== trimmedQuery.toLowerCase());
      
      // Add new entry at the beginning
      const newItem: SearchHistoryItem = {
        query: trimmedQuery,
        timestamp: new Date(),
        contentType,
        resultCount
      };
      
      // Keep only the most recent MAX_HISTORY_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      return updated;
    });
    
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmedQuery.toLowerCase());
      return [trimmedQuery, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  // Remove specific query from history
  const removeFromHistory = useCallback((query: string) => {
    setFullHistory(prev => prev.filter(item => item.query !== query));
    setSearchHistory(prev => prev.filter(q => q !== query));
  }, []);

  // Clear all search history
  const clearHistory = useCallback(() => {
    setFullHistory([]);
    setSearchHistory([]);
    
    try {
      const storageKey = user ? `${STORAGE_KEY}-${user.id}` : STORAGE_KEY;
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.error('Failed to clear search history:', err);
    }
  }, [user]);

  // Get popular searches based on frequency
  const getPopularSearches = useCallback((limit: number = 6): string[] => {
    // Count frequency of each search term
    const frequency = new Map<string, number>();
    
    fullHistory.forEach(item => {
      const query = item.query.toLowerCase();
      frequency.set(query, (frequency.get(query) || 0) + 1);
    });
    
    // Sort by frequency and return top results
    return Array.from(frequency.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query]) => {
        // Return the original case version
        return fullHistory.find(item => item.query.toLowerCase() === query)?.query || query;
      });
  }, [fullHistory]);

  // Get trending searches (searches from recent days)
  const getTrendingSearches = useCallback((days: number = TRENDING_DAYS, limit: number = 6): string[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Filter recent searches and count frequency
    const recentSearches = fullHistory.filter(item => item.timestamp >= cutoffDate);
    const frequency = new Map<string, number>();
    
    recentSearches.forEach(item => {
      const query = item.query.toLowerCase();
      frequency.set(query, (frequency.get(query) || 0) + 1);
    });
    
    // Sort by frequency and return top results
    return Array.from(frequency.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query]) => {
        // Return the original case version
        return recentSearches.find(item => item.query.toLowerCase() === query)?.query || query;
      });
  }, [fullHistory]);

  return {
    searchHistory,
    fullHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getPopularSearches,
    getTrendingSearches,
    loading,
    error
  };
}
