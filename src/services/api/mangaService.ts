import { BaseApiService, ServiceResponse } from './baseService';
import { contentService } from './contentService';
import { BaseContent } from '@/types/content.types';

export type MangaContent = BaseContent & {
  chapters?: number;
  volumes?: number;
  published_from?: string;
  published_to?: string;
  status?: string;
  type?: string;
  authors?: string[];
};

class MangaApiService extends BaseApiService {
  /**
   * Get all manga with pagination and filters
   */
  async getAll(options: {
    page?: number;
    limit?: number;
    sort?: 'popularity' | 'score' | 'updated_at';
    order?: 'asc' | 'desc';
    search?: string;
    genre?: string;
    status?: string;
    type?: string;
  } = {}): Promise<ServiceResponse<MangaContent[]>> {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'popularity',
        order = 'desc',
        search,
        genre,
        status,
        type
      } = options;

      let query = this.supabase
        .from('titles')
        .select(`
          *,
          manga_details(*),
          title_genres(genres(*)),
          title_authors(authors(*))
        `)
        .eq('content_type', 'manga')
        .order(sort, { ascending: order === 'asc' });

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,title_english.ilike.%${search}%`);
      }

      if (status) {
        query = query.eq('manga_details.status', status);
      }

      if (type) {
        query = query.eq('manga_details.type', type);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      return this.handleSuccess(data as MangaContent[] || []);
    } catch (error) {
      return this.handleError(error as Error, 'fetch manga list');
    }
  }

  /**
   * Get manga by ID with full details
   */
  async getById(id: string): Promise<ServiceResponse<MangaContent | null>> {
    try {
      const data = await contentService.getById(id, 'manga');
      return this.handleSuccess(data as MangaContent);
    } catch (error) {
      return this.handleError(error as Error, 'fetch manga details');
    }
  }

  /**
   * Search manga
   */
  async search(query: string, limit = 50): Promise<ServiceResponse<MangaContent[]>> {
    try {
      const data = await contentService.search(query, 'manga', limit);
      return this.handleSuccess(data as MangaContent[]);
    } catch (error) {
      return this.handleError(error as Error, 'search manga');
    }
  }

  /**
   * Get trending manga
   */
  async getTrending(limit = 20): Promise<ServiceResponse<MangaContent[]>> {
    try {
      const data = await contentService.getTrending('manga', limit);
      return this.handleSuccess(data as MangaContent[]);
    } catch (error) {
      return this.handleError(error as Error, 'fetch trending manga');
    }
  }

  /**
   * Get popular manga
   */
  async getPopular(limit = 20): Promise<ServiceResponse<MangaContent[]>> {
    try {
      const data = await contentService.getPopular('manga', limit);
      return this.handleSuccess(data as MangaContent[]);
    } catch (error) {
      return this.handleError(error as Error, 'fetch popular manga');
    }
  }

  /**
   * Get top rated manga
   */
  async getTopRated(limit = 20): Promise<ServiceResponse<MangaContent[]>> {
    try {
      const data = await contentService.getTopRated('manga', limit);
      return this.handleSuccess(data as MangaContent[]);
    } catch (error) {
      return this.handleError(error as Error, 'fetch top rated manga');
    }
  }

  /**
   * Get manga recommendations
   */
  async getRecommendations(mangaId: string, limit = 10): Promise<ServiceResponse<MangaContent[]>> {
    try {
      const data = await contentService.getRecommendations(mangaId, 'manga', limit);
      return this.handleSuccess(data as MangaContent[]);
    } catch (error) {
      return this.handleError(error as Error, 'fetch manga recommendations');
    }
  }

  /**
   * Sync manga data from external API
   */
  async syncManga(pages = 1): Promise<ServiceResponse<unknown>> {
    return this.syncFromExternalAPI('manga', pages);
  }

  /**
   * Sync manga images (deprecated - handled by main sync)
   */
  async syncMangaImages(): Promise<ServiceResponse<unknown>> {
    return this.syncImages('manga');
  }

  /**
   * Get manga by AniList ID
   */
  async getByAnilistId(anilistId: number): Promise<ServiceResponse<MangaContent | null>> {
    try {
      const { data, error } = await this.supabase
        .from('titles')
        .select(`
          *,
          manga_details(*),
          title_genres(genres(*)),
          title_authors(authors(*))
        `)
        .eq('content_type', 'manga')
        .eq('anilist_id', anilistId)
        .maybeSingle();

      if (error) throw error;

      return this.handleSuccess(data as MangaContent);
    } catch (error) {
      return this.handleError(error as Error, 'fetch manga by AniList ID');
    }
  }

  /**
   * Get manga statistics
   */
  async getStats(): Promise<ServiceResponse<{ total: number; byStatus: Record<string, number> }>> {
    try {
      const { count: total, error: totalError } = await this.supabase
        .from('titles')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', 'manga');

      if (totalError) throw totalError;

      const { data: statusData, error: statusError } = await this.supabase
        .from('titles')
        .select('manga_details(status)')
        .eq('content_type', 'manga')
        .not('manga_details.status', 'is', null);

      if (statusError) throw statusError;

      const byStatus = (statusData || []).reduce((acc: Record<string, number>, item: any) => {
        const status = item.manga_details?.status;
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
      return this.handleError(error as Error, 'fetch manga statistics');
    }
  }

  /**
   * Get manga by genre
   */
  async getByGenre(genreName: string, limit = 20): Promise<ServiceResponse<MangaContent[]>> {
    try {
      const { data, error } = await this.supabase
        .from('titles')
        .select(`
          *,
          manga_details(*),
          title_genres!inner(genres!inner(*))
        `)
        .eq('content_type', 'manga')
        .eq('title_genres.genres.name', genreName)
        .order('popularity', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.handleSuccess(data as MangaContent[] || []);
    } catch (error) {
      return this.handleError(error as Error, 'fetch manga by genre');
    }
  }

  /**
   * Get manga by author
   */
  async getByAuthor(authorName: string, limit = 20): Promise<ServiceResponse<MangaContent[]>> {
    try {
      const { data, error } = await this.supabase
        .from('titles')
        .select(`
          *,
          manga_details(*),
          title_authors!inner(authors!inner(*))
        `)
        .eq('content_type', 'manga')
        .eq('title_authors.authors.name', authorName)
        .order('popularity', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.handleSuccess(data as MangaContent[] || []);
    } catch (error) {
      return this.handleError(error as Error, 'fetch manga by author');
    }
  }
}

export const mangaService = new MangaApiService();
