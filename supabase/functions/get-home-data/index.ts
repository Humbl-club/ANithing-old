/// <reference path="../_shared/deno.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-correlation-id',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceKey = Deno.env.get('SERVICE_ROLE_KEY') 
  || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  || Deno.env.get('SUPABASE_ANON_KEY')
  || ''

const supabase = createClient(supabaseUrl, serviceKey)

/**
 * GET HOME DATA FUNCTION
 * Efficiently fetches all homepage sections using stored procedures
 * Returns trending anime, trending manga, recent updates, and popular content
 */
Deno.serve(async (req) => {
  const correlationId = req.headers.get('x-correlation-id') ?? crypto.randomUUID();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sections = ['trending', 'popular', 'recent'], limit = 20 } = await req.json().catch(() => ({}))

    const results: any = {}

    // Use database RPC functions for optimized queries
    const promises = sections.map(async (section: string) => {
      try {
        switch (section) {
          case 'trending':
            const [trendingAnime, trendingManga] = await Promise.all([
              supabase.rpc('get_trending_anime', { page_limit: limit }),
              supabase.rpc('get_trending_manga', { page_limit: limit })
            ])
            return {
              section,
              data: {
                anime: trendingAnime.data || [],
                manga: trendingManga.data || []
              }
            }

          case 'popular':
            const [popularAnime, popularManga] = await Promise.all([
              supabase.rpc('get_popular_anime', { page_limit: limit }),
              supabase.rpc('get_popular_manga', { page_limit: limit })
            ])
            return {
              section,
              data: {
                anime: popularAnime.data || [],
                manga: popularManga.data || []
              }
            }

          case 'recent':
            const [recentAnime, recentManga] = await Promise.all([
              supabase.rpc('get_recent_anime', { page_limit: limit }),
              supabase.rpc('get_recent_manga', { page_limit: limit })
            ])
            return {
              section,
              data: {
                anime: recentAnime.data || [],
                manga: recentManga.data || []
              }
            }

          case 'top_rated':
            const [topAnime, topManga] = await Promise.all([
              supabase
                .from('titles')
                .select('*, anime_details(*), manga_details(*)')
                .not('score', 'is', null)
                .order('score', { ascending: false })
                .limit(limit),
              supabase
                .from('titles')
                .select('*, anime_details(*), manga_details(*)')
                .eq('content_type', 'manga')
                .not('score', 'is', null)
                .order('score', { ascending: false })
                .limit(limit)
            ])
            return {
              section,
              data: {
                anime: topAnime.data || [],
                manga: topManga.data || []
              }
            }

          case 'seasonal':
            const currentYear = new Date().getFullYear()
            const currentMonth = new Date().getMonth() + 1
            const season = currentMonth <= 3 ? 'WINTER' : 
                          currentMonth <= 6 ? 'SPRING' :
                          currentMonth <= 9 ? 'SUMMER' : 'FALL'
            
            const seasonalAnime = await supabase
              .from('titles')
              .select('*, anime_details!inner(*)')
              .eq('anime_details.season', season)
              .eq('anime_details.season_year', currentYear)
              .order('popularity', { ascending: false })
              .limit(limit)

            return {
              section,
              data: {
                anime: seasonalAnime.data || [],
                manga: []
              }
            }

          default:
            return null
        }
      } catch (error) {
        console.error(`Error fetching ${section}:`, error)
        return null
      }
    })

    const sectionResults = await Promise.all(promises)
    
    sectionResults.forEach(result => {
      if (result) {
        results[result.section] = result.data
      }
    })

    // Fallback queries if RPC functions don't exist
    if (Object.keys(results).length === 0) {
      console.log('Using fallback queries...')
      
      const [anime, manga] = await Promise.all([
        supabase
          .from('titles')
          .select('*, anime_details(*)')
          .eq('content_type', 'anime')
          .order('popularity', { ascending: false })
          .limit(limit),
        supabase
          .from('titles')
          .select('*, manga_details(*)')
          .eq('content_type', 'manga')
          .order('popularity', { ascending: false })
          .limit(limit)
      ])

      results.trending = {
        anime: anime.data || [],
        manga: manga.data || []
      }
    }

    const payload = {
      success: true,
      data: results,
      error: null,
      meta: { 
        correlationId, 
        timestamp: new Date().toISOString(),
        sectionsRequested: sections.length,
        sectionsReturned: Object.keys(results).length
      }
    }

    return new Response(JSON.stringify(payload), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId
      }
    })

  } catch (error) {
    console.error('Get home data error:', error)
    
    const payload = {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      meta: { correlationId, timestamp: new Date().toISOString() }
    }

    return new Response(JSON.stringify(payload), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId
      }
    })
  }
})