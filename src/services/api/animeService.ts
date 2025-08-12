import { BaseApiService, ServiceResponse } from './baseService';
import { contentService } from './contentService';
import { BaseContent } from '@/types/content.types';

export type AnimeContent = BaseContent & {
  episodes?: number;
  aired_from?: string;
  aired_to?: string;
  season?: string;
  season_year?: number;
  status?: string;
  type?: string;
  trailer_url?: string;
  studios?: string[];
};

class AnimeApiService extends BaseApiService {
  /**
   * Get all anime with pagination and filters
   */
  async getAll(options: {
    page?: number;
    limit?: number;
    sort?: 'popularity' | 'score' | 'updated_at';
    order?: 'asc' | 'desc';
    search?: string;
    genre?: string;
    status?: string;
    season?: string;
    year?: number;
  } = {}): Promise<ServiceResponse<AnimeContent[]>> {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'popularity',
        order = 'desc',
        search,
        genre,
        status,
        season,
        year
      } = options;

      let query = this.supabase
        .from('titles')
        .select(`
          *,
          anime_details(*),
          title_genres(genres(*)),
          title_studios(studios(*))
        `)
        .eq('content_type', 'anime')
        .order(sort, { ascending: order === 'asc' });

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,title_english.ilike.%${search}%`);
      }

      if (status) {
        query = query.eq('anime_details.status', status);
      }

      if (season) {
        query = query.eq('anime_details.season', season);
      }

      if (year) {
        query = query.eq('anime_details.season_year', year);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      return this.handleSuccess(data as AnimeContent[] || []);
    } catch (error) {
      return this.handleError(error as Error, 'fetch anime list');
    }
  }

  /**
   * Get anime by ID with full details
   */
  async getById(id: string): Promise<ServiceResponse<AnimeContent | null>> {
    try {
      const data = await contentService.getById(id, 'anime');
      return this.handleSuccess(data as AnimeContent);
    } catch (error) {
      return this.handleError(error as Error, 'fetch anime details');
    }
  }

  /**
   * Search anime
   */
  async search(query: string, limit = 50): Promise<ServiceResponse<AnimeContent[]>> {
    try {
      const data = await contentService.search(query, 'anime', limit);
      return this.handleSuccess(data as AnimeContent[]);
    } catch (error) {
      return this.handleError(error as Error, 'search anime');
    }
  }

  /**
   * Get trending anime
   */
  async getTrending(limit = 20): Promise<ServiceResponse<AnimeContent[]>> {
    try {
      const data = await contentService.getTrending('anime', limit);
      return this.handleSuccess(data as AnimeContent[]);
    } catch (error) {
      return this.handleError(error as Error, 'fetch trending anime');
    }
  }

  /**
   * Get popular anime
   */
  async getPopular(limit = 20): Promise<ServiceResponse<AnimeContent[]>> {
    try {
      const data = await contentService.getPopular('anime', limit);
      return this.handleSuccess(data as AnimeContent[]);
    } catch (error) {
      return this.handleError(error as Error, 'fetch popular anime');
    }
  }

  /**
   * Get top rated anime
   */
  async getTopRated(limit = 20): Promise<ServiceResponse<AnimeContent[]>> {
    try {
      const data = await contentService.getTopRated('anime', limit);
      return this.handleSuccess(data as AnimeContent[]);
    } catch (error) {
      return this.handleError(error as Error, 'fetch top rated anime');
    }
  }

  /**
   * Get seasonal anime
   */
  async getSeasonal(year: number, season: string): Promise<ServiceResponse<AnimeContent[]>> {
    try {
      const data = await contentService.getSeasonal(year, season);
      return this.handleSuccess(data as AnimeContent[]);
    } catch (error) {
      return this.handleError(error as Error, 'fetch seasonal anime');
    }
  }

  /**
   * Get anime recommendations
   */
  async getRecommendations(animeId: string, limit = 10): Promise<ServiceResponse<AnimeContent[]>> {
    try {
      const data = await contentService.getRecommendations(animeId, 'anime', limit);
      return this.handleSuccess(data as AnimeContent[]);
    } catch (error) {
      return this.handleError(error as Error, 'fetch anime recommendations');
    }
  }

  /**
   * Sync anime data from external API
   */
  async syncAnime(pages = 1): Promise<ServiceResponse<unknown>> {
    return this.syncFromExternalAPI('anime', pages);
  }

  /**
   * Sync anime images (deprecated - handled by main sync)
   */
  async syncAnimeImages(): Promise<ServiceResponse<unknown>> {
    return this.syncImages('anime');
  }

  /**
   * Get anime by AniList ID
   */
  async getByAnilistId(anilistId: number): Promise<ServiceResponse<AnimeContent | null>> {
    try {
      const { data, error } = await this.supabase
        .from('titles')
        .select(`
          *,
          anime_details(*),
          title_genres(genres(*)),
          title_studios(studios(*))
        `)
        .eq('content_type', 'anime')
        .eq('anilist_id', anilistId)
        .maybeSingle();

      if (error) throw error;

      return this.handleSuccess(data as AnimeContent);
    } catch (error) {
      return this.handleError(error as Error, 'fetch anime by AniList ID');
    }
  }

  /**
   * Get anime statistics
   */
  async getStats(): Promise<ServiceResponse<{ total: number; byStatus: Record<string, number> }>> {
    try {
      const { count: total, error: totalError } = await this.supabase
        .from('titles')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', 'anime');

      if (totalError) throw totalError;

      const { data: statusData, error: statusError } = await this.supabase
        .from('titles')
        .select('anime_details(status)')
        .eq('content_type', 'anime')
        .not('anime_details.status', 'is', null);

      if (statusError) throw statusError;

      const byStatus = (statusData || []).reduce((acc: Record<string, number>, item: any) => {
        const status = item.anime_details?.status;
        if (status) {
          acc[status] = (acc[status] || 0) + 1;
        }
        return acc;
      }, {});

      return this.handleSuccess({
        total: total || 0,
        byStatus
      });
    } catch (error) {
      return this.handleError(error as Error, 'fetch anime statistics');
    }
  }
}

export const animeService = new AnimeApiService();
