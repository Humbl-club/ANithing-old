import { supabase } from '@/integrations/supabase/client';
import { BaseContent } from '@/types/content.types';

/**
 * Unified Content Service
 * Consolidates anime and manga services into one
 * Saves ~600 lines by eliminating duplication
 */
export class ContentService {
  private static instance: ContentService;

  private constructor() {}

  static getInstance(): ContentService {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService();
    }
    return ContentService.instance;
  }

  /**
   * Fetch content by ID
   */
  async getById(id: string, type: 'anime' | 'manga') {
    const { data, error } = await supabase
      .from('titles')
      .select(`
        *,
        ${type === 'anime' ? 'anime_details(*)' : 'manga_details(*)'},
        title_genres(genres(*)),
        ${type === 'anime' ? 'title_studios(studios(*))' : 'title_authors(authors(*))'}
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Search content
   */
  async search(query: string, type?: 'anime' | 'manga' | 'both', limit = 50) {
    let dbQuery = supabase
      .from('titles')
      .select('*')
      .or(`title.ilike.%${query}%,title_english.ilike.%${query}%`)
      .limit(limit);

    if (type && type !== 'both') {
      dbQuery = dbQuery.eq('content_type', type);
    }

    const { data, error } = await dbQuery;
    if (error) throw error;
    return data as BaseContent[];
  }

  /**
   * Get trending content
   */
  async getTrending(type?: 'anime' | 'manga' | 'both', limit = 20) {
    let query = supabase
      .from('titles')
      .select('*')
      .order('trending', { ascending: false })
      .limit(limit);

    if (type && type !== 'both') {
      query = query.eq('content_type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as BaseContent[];
  }

  /**
   * Get popular content
   */
  async getPopular(type?: 'anime' | 'manga' | 'both', limit = 20) {
    let query = supabase
      .from('titles')
      .select('*')
      .order('popularity', { ascending: false })
      .limit(limit);

    if (type && type !== 'both') {
      query = query.eq('content_type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as BaseContent[];
  }

  /**
   * Get top rated content
   */
  async getTopRated(type?: 'anime' | 'manga' | 'both', limit = 20) {
    let query = supabase
      .from('titles')
      .select('*')
      .not('score', 'is', null)
      .order('score', { ascending: false })
      .limit(limit);

    if (type && type !== 'both') {
      query = query.eq('content_type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as BaseContent[];
  }

  /**
   * Get seasonal anime
   */
  async getSeasonal(year: number, season: string) {
    const { data, error } = await supabase
      .from('titles')
      .select('*, anime_details!inner(*)')
      .eq('content_type', 'anime')
      .eq('anime_details.season_year', year)
      .eq('anime_details.season', season)
      .order('popularity', { ascending: false });

    if (error) throw error;
    return data as BaseContent[];
  }

  /**
   * Get recommendations based on content
   */
  async getRecommendations(contentId: string, type: 'anime' | 'manga', limit = 10) {
    // First get the content's genres
    const { data: content } = await supabase
      .from('titles')
      .select('*, title_genres(genre_id)')
      .eq('id', contentId)
      .single();

    if (!content) return [];

    const genreIds = content.title_genres?.map((tg: any) => tg.genre_id) || [];
    
    if (genreIds.length === 0) return [];

    // Find similar content by genres
    const { data, error } = await supabase
      .from('titles')
      .select('*, title_genres!inner(genre_id)')
      .eq('content_type', type)
      .in('title_genres.genre_id', genreIds)
      .neq('id', contentId)
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as BaseContent[];
  }

  /**
   * Batch fetch multiple content items
   */
  async getBatch(ids: string[]) {
    const { data, error } = await supabase
      .from('titles')
      .select('*')
      .in('id', ids);

    if (error) throw error;
    return data as BaseContent[];
  }

  /**
   * Get user's list items
   */
  async getUserListItems(userId: string, listId?: string) {
    let query = supabase
      .from('user_list_items')
      .select('*, titles(*)')
      .eq('user_id', userId);

    if (listId) {
      query = query.eq('list_id', listId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Add to user list
   */
  async addToList(userId: string, listId: string, titleId: string, status?: string) {
    const { data, error } = await supabase
      .from('user_list_items')
      .upsert({
        user_id: userId,
        list_id: listId,
        title_id: titleId,
        user_status: status,
        added_at: new Date().toISOString()
      }, { onConflict: 'list_id,title_id' });

    if (error) throw error;
    return data;
  }

  /**
   * Remove from user list
   */
  async removeFromList(listId: string, titleId: string) {
    const { error } = await supabase
      .from('user_list_items')
      .delete()
      .eq('list_id', listId)
      .eq('title_id', titleId);

    if (error) throw error;
  }

  /**
   * Update user rating
   */
  async updateRating(userId: string, titleId: string, rating: number) {
    const { data, error } = await supabase
      .from('user_ratings')
      .upsert({
        user_id: userId,
        title_id: titleId,
        rating,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,title_id' });

    if (error) throw error;
    return data;
  }
}

// Export singleton instance
export const contentService = ContentService.getInstance();