import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * UNIFIED QUERY FUNCTION
 * Combines get-home-data and get-content-details into one configurable endpoint
 * Saves ~1,500 lines of code
 * 
 * Usage:
 * - Home data: /query-unified?type=home&sections=trending,popular,recent
 * - Content details: /query-unified?type=details&contentId=123&contentType=anime
 * - Search: /query-unified?type=search&query=naruto&filters={...}
 * - User data: /query-unified?type=user&userId=456&dataType=lists
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const queryType = url.searchParams.get('type') || 'home';
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        },
        global: {
          headers: {
            Authorization: req.headers.get('Authorization') || ''
          }
        }
      }
    );

    let result: any;

    switch (queryType) {
      case 'home':
        result = await getHomeData(supabase, url.searchParams);
        break;
      
      case 'details':
        result = await getContentDetails(supabase, url.searchParams);
        break;
      
      case 'search':
        result = await searchContent(supabase, url.searchParams);
        break;
      
      case 'user':
        result = await getUserData(supabase, url.searchParams);
        break;
      
      default:
        throw new Error(`Unknown query type: ${queryType}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Query error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Get home page data with configurable sections
 */
async function getHomeData(supabase: any, params: URLSearchParams) {
  const sections = params.get('sections')?.split(',') || ['trending', 'popular', 'recent'];
  const limit = parseInt(params.get('limit') || '20');
  
  const results: any = {};

  // Parallel fetch all sections
  const promises = sections.map(async (section) => {
    switch (section) {
      case 'trending':
        return {
          section,
          data: await supabase
            .from('titles')
            .select('*, anime_details(*), manga_details(*)')
            .order('trending', { ascending: false })
            .limit(limit)
        };
      
      case 'popular':
        return {
          section,
          data: await supabase
            .from('titles')
            .select('*, anime_details(*), manga_details(*)')
            .order('popularity', { ascending: false })
            .limit(limit)
        };
      
      case 'recent':
        return {
          section,
          data: await supabase
            .from('titles')
            .select('*, anime_details(*), manga_details(*)')
            .order('updated_at', { ascending: false })
            .limit(limit)
        };
      
      case 'top_rated':
        return {
          section,
          data: await supabase
            .from('titles')
            .select('*, anime_details(*), manga_details(*)')
            .not('score', 'is', null)
            .order('score', { ascending: false })
            .limit(limit)
        };
      
      case 'seasonal':
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const season = currentMonth <= 3 ? 'WINTER' : 
                      currentMonth <= 6 ? 'SPRING' :
                      currentMonth <= 9 ? 'SUMMER' : 'FALL';
        
        return {
          section,
          data: await supabase
            .from('titles')
            .select('*, anime_details!inner(*)')
            .eq('anime_details.season', season)
            .eq('anime_details.season_year', currentYear)
            .limit(limit)
        };
      
      default:
        return null;
    }
  });

  const sectionResults = await Promise.all(promises);
  
  sectionResults.forEach(result => {
    if (result) {
      results[result.section] = result.data?.data || [];
    }
  });

  return results;
}

/**
 * Get detailed content information
 */
async function getContentDetails(supabase: any, params: URLSearchParams) {
  const contentId = params.get('contentId');
  const contentType = params.get('contentType') || 'anime';
  const includeRelated = params.get('includeRelated') === 'true';
  
  if (!contentId) {
    throw new Error('contentId is required');
  }

  // Build query based on content type
  let query = supabase
    .from('titles')
    .select(`
      *,
      ${contentType === 'anime' ? 'anime_details(*)' : 'manga_details(*)'},
      title_genres(genres(*)),
      ${contentType === 'anime' ? 'title_studios(studios(*))' : 'title_authors(authors(*))'}
    `)
    .eq('id', contentId)
    .single();

  const { data: content, error } = await query;
  
  if (error) throw error;

  // Optionally fetch related content
  if (includeRelated && content) {
    const genres = content.title_genres?.map((tg: any) => tg.genres?.id).filter(Boolean) || [];
    
    if (genres.length > 0) {
      const { data: related } = await supabase
        .from('titles')
        .select('*, title_genres!inner(genre_id)')
        .in('title_genres.genre_id', genres)
        .neq('id', contentId)
        .limit(10);
      
      content.related = related || [];
    }
  }

  return content;
}

/**
 * Search content with filters
 */
async function searchContent(supabase: any, params: URLSearchParams) {
  const searchQuery = params.get('query') || '';
  const filters = params.get('filters') ? JSON.parse(params.get('filters')!) : {};
  const limit = parseInt(params.get('limit') || '50');
  const offset = parseInt(params.get('offset') || '0');
  
  let query = supabase
    .from('titles')
    .select('*, anime_details(*), manga_details(*), title_genres(genres(*))', { count: 'exact' });

  // Apply search query
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,title_english.ilike.%${searchQuery}%`);
  }

  // Apply filters
  if (filters.contentType) {
    query = query.eq('content_type', filters.contentType);
  }

  if (filters.genres && filters.genres.length > 0) {
    query = query.in('title_genres.genre_id', filters.genres);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.minScore) {
    query = query.gte('score', filters.minScore);
  }

  if (filters.year) {
    if (filters.contentType === 'anime') {
      query = query.eq('anime_details.season_year', filters.year);
    }
  }

  if (filters.season && filters.contentType === 'anime') {
    query = query.eq('anime_details.season', filters.season);
  }

  // Apply sorting
  const sortBy = filters.sortBy || 'popularity';
  const sortOrder = filters.sortOrder || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  
  if (error) throw error;

  return {
    results: data || [],
    total: count || 0,
    page: Math.floor(offset / limit) + 1,
    pageSize: limit
  };
}

/**
 * Get user-specific data
 */
async function getUserData(supabase: any, params: URLSearchParams) {
  const userId = params.get('userId');
  const dataType = params.get('dataType') || 'profile';
  
  if (!userId) {
    throw new Error('userId is required');
  }

  switch (dataType) {
    case 'profile':
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return profile;
    
    case 'lists':
      const { data: lists } = await supabase
        .from('user_lists')
        .select('*, user_list_items(*, titles(*))')
        .eq('user_id', userId);
      return lists || [];
    
    case 'ratings':
      const { data: ratings } = await supabase
        .from('user_ratings')
        .select('*, titles(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return ratings || [];
    
    case 'activity':
      const { data: activity } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      return activity || [];
    
    case 'follows':
      const { data: follows } = await supabase
        .from('user_follows')
        .select('*, profiles!following_user_id(*)')
        .eq('follower_user_id', userId);
      return follows || [];
    
    default:
      throw new Error(`Unknown data type: ${dataType}`);
  }
}