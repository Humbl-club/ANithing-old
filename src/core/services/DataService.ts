import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  listTitles, 
  getTitleById, 
  getHomepageSections,
  getOrFetchTitleByAnilistId,
  type ListParams,
  type DomainTitle 
} from '@/repositories/contentRepository';
/**
 * Unified Data Service
 * Single source of truth for all data operations
/**
 * Replaces direct Supabase queries, repository calls, and edge function invocations
*/
export class DataService {
  private client: SupabaseClient;
  constructor(client: SupabaseClient = supabase) {
    this.client = client;
  }
  // ============================================
  // CONTENT OPERATIONS
  // ============================================
  /**
/**
 * Get a single title by ID
*/
  async getTitle(id: string): Promise<DomainTitle | null> {
    return getTitleById(this.client, id);
  }
  /**
/**
 * List titles with filtering and pagination
*/
  async listTitles(params: ListParams = {}) {
    return listTitles(this.client, params);
  }
  /**
/**
 * Get or fetch title by AniList ID
*/
  async getTitleByAnilistId(
    anilistId: number, 
    contentType: 'anime' | 'manga'
  ): Promise<DomainTitle | null> {
    return getOrFetchTitleByAnilistId(this.client, anilistId, contentType);
  }
  /**
/**
 * Get homepage sections (trending, recent, etc.)
*/
  async getHomeSections() {
    // Try edge function first for cached data
    try {
      console.log('🔍 Attempting to fetch home data from edge function...');
      const { data, error } = await this.client.functions.invoke('get-home-data', {
        body: {
          sections: ['trending-anime', 'recent-anime', 'trending-manga', 'recent-manga'],
          limit: 20
        }
      });
      
      if (error) {
        console.warn('⚠️ Edge function error:', error);
      } else if (data?.success && data?.data) {
        console.log('✅ Edge function success, data received:', {
          trendingAnime: data.data.trendingAnime?.length || 0,
          recentAnime: data.data.recentAnime?.length || 0,
          trendingManga: data.data.trendingManga?.length || 0,
          recentManga: data.data.recentManga?.length || 0
        });
        return {
          trendingAnime: data.data.trendingAnime || [],
          recentAnime: data.data.recentAnime || [],
          trendingManga: data.data.trendingManga || [],
          recentManga: data.data.recentManga || []
        };
      }
    } catch (e) {
      console.warn('⚠️ Edge function exception, falling back to direct query:', e);
    }
    
    // Fallback to repository method
    console.log('📊 Falling back to repository method...');
    const result = await getHomepageSections(this.client);
    console.log('✅ Repository method success:', {
      trendingAnime: result.trendingAnime?.length || 0,
      recentAnime: result.recentAnime?.length || 0,
      trendingManga: result.trendingManga?.length || 0,
      recentManga: result.recentManga?.length || 0
    });
    return result;
  }
  /**
/**
 * Search titles
*/
  async searchTitles(
    query: string,
    options: {
      contentType?: 'anime' | 'manga' | 'both';
      limit?: number;
      page?: number;
    } = {}
  ) {
    const { contentType = 'both', limit = 20, page = 1 } = options;
    let dbQuery = this.client
      .from('titles')
      .select('*, anime_details(*), manga_details(*)', { count: 'exact' })
      .or(`title.ilike.%${query}%,title_english.ilike.%${query}%`)
      .order('popularity', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (contentType !== 'both') {
      dbQuery = dbQuery.eq('content_type', contentType);
    }
    const { data, error, count } = await dbQuery;
    if (error) throw error;
    return {
      items: data || [],
      total: count || 0,
      hasMore: count ? (page * limit < count) : false
    };
  }
  // ============================================
  // USER OPERATIONS
  // ============================================
  /**
/**
 * Get user profile
*/
  async getUserProfile(userId: string) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }
  /**
/**
 * Get user lists
*/
  async getUserLists(userId: string) {
    const { data, error } = await this.client
      .from('user_lists')
      .select(`
        *,
        titles (
          id, title, title_english, image_url, content_type
        ),
        list_statuses (name, color)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  /**
/**
 * Add title to user list
*/
  async addToList(
    userId: string, 
    titleId: string, 
    statusId: string,
    score?: number
  ) {
    const { data, error } = await this.client
      .from('user_lists')
      .upsert({
        user_id: userId,
        title_id: titleId,
        status_id: statusId,
        score,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,title_id'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  /**
/**
 * Update list item
*/
  async updateListItem(
    listItemId: string,
    updates: {
      status_id?: string;
      score?: number;
      progress?: number;
      notes?: string;
    }
  ) {
    const { data, error } = await this.client
      .from('user_lists')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', listItemId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  /**
/**
 * Remove from list
*/
  async removeFromList(userId: string, titleId: string) {
    const { error } = await this.client
      .from('user_lists')
      .delete()
      .eq('user_id', userId)
      .eq('title_id', titleId);
    if (error) throw error;
  }
  // ============================================
  // STATISTICS OPERATIONS
  // ============================================
  /**
/**
 * Get platform statistics
*/
  async getStats() {
    const [animeCount, mangaCount, userCount] = await Promise.all([
      this.client
        .from('titles')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', 'anime'),
      this.client
        .from('titles')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', 'manga'),
      this.client
        .from('profiles')
        .select('*', { count: 'exact', head: true })
    ]);
    return {
      animeCount: animeCount.count || 0,
      mangaCount: mangaCount.count || 0,
      userCount: userCount.count || 0
    };
  }
  // ============================================
  // IMPORT OPERATIONS
  // ============================================
  /**
/**
 * Trigger data import from AniList
*/
  async importData(
    type: 'anime' | 'manga' | 'both' = 'both',
    pages: number = 2,
    itemsPerPage: number = 30
  ) {
    const { data, error } = await this.client.functions.invoke('scheduled-import', {
      body: {
        type,
        pages,
        itemsPerPage,
        mode: 'manual'
      }
    });
    if (error) throw error;
    return data;
  }
  // ============================================
  // HEALTH CHECK
  // ============================================
  /**
/**
 * Check system health
*/
  async checkHealth() {
    const { data, error } = await this.client.functions.invoke('health', {
      body: {}
    });
    if (error) throw error;
    return data;
  }
}
// Export singleton instance
export const dataService = new DataService();
// Export types
export type { DomainTitle, ListParams } from '@/repositories/contentRepository';