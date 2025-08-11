import { supabase } from '@/integrations/supabase/client';
import { connectionManager } from '@/lib/supabaseConnection';
import { AppError } from '@/lib/errorHandling';
import { generateUUID } from '@/utils/uuid';
import { toast } from 'sonner';
// Common interfaces
export interface ApiResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
  filters?: {
    search?: string;
    genre?: string;
    status?: string;
    type?: string;
    year?: string;
    season?: string;
    sort_by: string;
    order: string;
  };
}
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}
export interface BaseQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  status?: string;
  type?: string;
  year?: string;
  season?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
}
export interface BaseContent {
  id: string;
  anilist_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  synopsis: string;
  image_url: string;
  score?: number;
  anilist_score?: number;
  rank?: number;
  popularity?: number;
  favorites: number;
  year?: number;
  color_theme?: string;
  genres: string[];
  members: number;
  status: string;
  type: string;
}
// Base service class with shared functionality
export abstract class BaseApiService {
  protected supabase = supabase;
  protected async handleSupabaseRequest<T>(
    request: () => Promise<{ data: T | null; error: any }>
  ): Promise<ServiceResponse<T>> {
    try {
      // Use connection manager for retry logic
      const result = await connectionManager.executeWithRetry(
        request,
        'API Request'
      );
      const { data, error } = result;
      if (error) {
        // Map Supabase errors to app errors
        if (error.code === 'PGRST301') {
          throw new AppError(
            'Service temporarily unavailable',
            'SERVICE_UNAVAILABLE',
            503
          );
        }
        if (error.code === '42501') {
          throw new AppError(
            'Insufficient permissions',
            'FORBIDDEN',
            403
          );
        }
        if (error.code === 'PGRST116') {
          throw new AppError(
            'No data found',
            'NOT_FOUND',
            404
          );
        }
        if (error.code === '23505') {
          throw new AppError(
            'Duplicate entry',
            'CONFLICT',
            409
          );
        }
        throw new AppError(error.message, 'API_ERROR', 400);
      }
      if (!data) {
        // No rows case still returns success with null data
        return {
          success: true,
          data: null,
          error: null
        };
      }
      return {
        success: true,
        data,
        error: null
      };
    } catch (error) {
      if (error instanceof AppError) {
        return {
          success: false,
          data: null,
          error: error.message
        };
      }
      
      // Log unexpected errors properly
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[BaseService] Unexpected error:', error);
      
      return {
        success: false,
        data: null,
        error: errorMessage
      };
    }
  }
  // Centralized edge function invocation with graceful fallback
  protected async invokeEdgeFunction<T>(functionName: string, payload: any): Promise<ServiceResponse<T>> {
    try {
      const allowed = new Set([
        'get-home-data',
        'get-content-details',
        'import-data',
        'import-anime',
        'import-manga',
        'send-auth-emails',
        'check-email-exists',
        'check-email-secure'
      ]);
      if (!allowed.has(functionName)) {
        return { success: false, data: null, error: `Edge function ${functionName} not available` };
      }
      const correlationId = generateUUID();
      const { data, error } = await this.supabase.functions.invoke(functionName, { 
        body: payload,
        headers: { 'x-correlation-id': correlationId }
      });
      if (error) {
        return { success: false, data: null, error: error.message || 'Edge error' };
      }
      // Standardized shape support
      const normalized = (data && typeof data === 'object' && 'success' in data)
        ? (data as any)
        : { success: true, data, error: null };
      if (!normalized.success) {
        return { success: false, data: null, error: normalized.error || 'Edge error' };
      }
      return { success: true, data: (normalized.data as T) ?? null, error: null };
    } catch (e: any) {
      return { success: false, data: null, error: e.message || 'Edge exception' };
    }
  }
  protected handleError<T = null>(error: Error | unknown, operation: string): ServiceResponse<T> {
    // Log error properly with context
    console.error(`[BaseService] ${operation} failed:`, error);
    toast.error(`Failed to ${operation.toLowerCase()}`);
    const errorMessage = error instanceof Error 
      ? error.message 
      : `Failed to ${operation.toLowerCase()}`;
    return {
      data: null as T,
      error: errorMessage,
      success: false
    };
  }
  protected handleSuccess<T>(data: T | null, message?: string): ServiceResponse<T> {
    if (message) {
      toast.success(message);
    }
    return {
      data,
      error: null,
      success: true
    };
  }
  // Sync from external API
  protected async syncFromExternalAPI(contentType: 'anime' | 'manga', pages = 1): Promise<ServiceResponse<unknown>> {
    try {
      const correlationId = generateUUID();
      const { data, error } = await this.supabase.functions.invoke('import-data', {
        body: { type: contentType, pages, itemsPerPage: 50 },
        headers: { 'x-correlation-id': correlationId }
      });
      if (error) return { success: false, data: null, error: error.message };
      const normalized = (data && typeof data === 'object' && 'success' in data) ? (data as any) : { success: true, data, error: null };
      if (!normalized.success) return { success: false, data: null, error: normalized.error || 'Import error' };
      return { success: true, data: normalized.data ?? null, error: null };
    } catch (e: any) {
      return { success: false, data: null, error: e.message };
    }
  }
  protected async syncImages(_contentType: 'anime' | 'manga', _limit = 10): Promise<ServiceResponse<unknown>> {
    // No-op since sync-images was removed; return success
    return { success: true, data: { skipped: true }, error: null };
  }
  // Build URL parameters for API calls
  protected buildUrlParams(options: BaseQueryOptions): URLSearchParams {
    const {
      page = 1,
      limit = 20,
      search,
      genre,
      status,
      type,
      year,
      season,
      sort_by = 'score',
      order = 'desc'
    } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort_by,
      order
    });
    if (search) params.append('search', search);
    if (genre) params.append('genre', genre);
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    if (year) params.append('year', year);
    if (season) params.append('season', season);
    return params;
  }
}