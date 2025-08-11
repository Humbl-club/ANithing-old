import { supabase } from "@/integrations/supabase/client";
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
class DataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly LONG_TTL = 30 * 60 * 1000; // 30 minutes
  // Generate cache key
  private getCacheKey(table: string, query: any): string {
    return `${table}:${JSON.stringify(query)}`;
  }
  // Check if cache entry is still valid
  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }
  // Get from cache
  private get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && this.isValid(entry)) {
      return entry.data;
    }
    // Remove expired entry
    if (entry) {
      this.cache.delete(key);
    }
    return null;
  }
  // Set cache entry
  private set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  // Optimized cleanup using batch processing to avoid O(n²) performance
  private cleanupExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Collect expired keys first (single pass)
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        expiredKeys.push(key);
      }
    }
    
    // Batch delete expired keys
    for (const key of expiredKeys) {
      this.cache.delete(key);
    }
    
    // Log cleanup stats in development
    if (process.env.NODE_ENV === 'development' && expiredKeys.length > 0) {
    }
  }
  // Fetch with cache
  async fetchWithCache<T>(
    table: string,
    queryBuilder: () => any,
    ttl?: number
  ): Promise<{ data: T | null; error: any }> {
    // Clean up expired entries periodically
    if (Math.random() < 0.1) { // 10% chance
      this.cleanupExpired();
    }
    // Generate cache key from query
    const query = queryBuilder();
    const key = this.getCacheKey(table, query);
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return { data: cached, error: null };
    }
    // Fetch from database
    const { data, error } = await query;
    // Cache successful results
    if (data && !error) {
      this.set(key, data, ttl || this.DEFAULT_TTL);
    }
    return { data, error };
  }
  // Cache popular/trending content with longer TTL
  async fetchTrending<T>(
    queryBuilder: () => any
  ): Promise<{ data: T | null; error: any }> {
    return this.fetchWithCache('trending', queryBuilder, this.LONG_TTL);
  }
  // Cache anime/manga details with medium TTL
  async fetchDetails<T>(
    id: string,
    queryBuilder: () => any
  ): Promise<{ data: T | null; error: any }> {
    const key = `details:${id}`;
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return { data: cached, error: null };
    }
    // Fetch from database
    const { data, error } = await queryBuilder();
    // Cache successful results
    if (data && !error) {
      this.set(key, data, this.DEFAULT_TTL);
    }
    return { data, error };
  }
  // Invalidate cache for specific keys
  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
  // Clear all cache
  clear(): void {
    this.cache.clear();
  }
  // Get cache statistics
  getStats(): { size: number; entries: number } {
    let size = 0;
    for (const entry of this.cache.values()) {
      size += JSON.stringify(entry).length;
    }
    return {
      size,
      entries: this.cache.size
    };
  }
}
// Export singleton instance
export const dataCache = new DataCache();
// Helper hooks for common queries
export const cachedQueries = {
  // Fetch anime with cache
  async getAnime(id: string) {
    return dataCache.fetchDetails(id, () => 
      supabase
        .from('titles')
        .select(`
          *,
          anime_details!inner(*),
          genres:title_genres(genre:genres(name)),
          studios:title_studios(studio:studios(name))
        `)
        .eq('id', id)
        .eq('content_type', 'anime')
        .single()
    );
  },
  // Fetch manga with cache
  async getManga(id: string) {
    return dataCache.fetchDetails(id, () => 
      supabase
        .from('titles')
        .select(`
          *,
          manga_details!inner(*),
          genres:title_genres(genre:genres(name)),
          authors:title_authors(author:authors(name))
        `)
        .eq('id', id)
        .eq('content_type', 'manga')
        .single()
    );
  },
  // Fetch trending with cache
  async getTrending(contentType: 'anime' | 'manga', limit = 10) {
    return dataCache.fetchTrending(() =>
      supabase
        .from('titles')
        .select('*')
        .eq('content_type', contentType)
        .order('popularity', { ascending: false })
        .limit(limit)
    );
  },
  // Fetch popular with cache
  async getPopular(contentType: 'anime' | 'manga', limit = 20) {
    return dataCache.fetchWithCache('popular', () =>
      supabase
        .from('titles')
        .select('*')
        .eq('content_type', contentType)
        .order('score', { ascending: false })
        .limit(limit)
    );
  }
};