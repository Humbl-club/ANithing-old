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
 * GET CONTENT DETAILS FUNCTION
 * Fetches detailed information for a specific anime or manga title
 * Includes all related data like genres, studios/authors, characters, and recommendations
 */
Deno.serve(async (req) => {
  const correlationId = req.headers.get('x-correlation-id') ?? crypto.randomUUID()
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { contentId, contentType = 'anime', includeRecommendations = true } = await req.json()

    if (!contentId) {
      throw new Error('contentId is required')
    }

    // Build the main query based on content type
    const selectFields = contentType === 'anime' 
      ? `
          *,
          anime_details(*),
          title_genres(genres(*)),
          title_studios(studios(*))
        `
      : `
          *,
          manga_details(*),
          title_genres(genres(*)),
          title_authors(authors(*))
        `

    // Fetch main content details - handle both UUID and AniList ID formats
    let query = supabase
      .from('titles')
      .select(selectFields)
      .eq('content_type', contentType)

    // Check if contentId looks like a UUID (contains hyphens) or is numeric (AniList ID)
    const isUuid = typeof contentId === 'string' && contentId.includes('-')
    
    if (isUuid) {
      query = query.eq('id', contentId)
    } else {
      // Assume it's an AniList ID (numeric)
      query = query.eq('anilist_id', parseInt(contentId))
    }

    const { data: content, error: contentError } = await query.single()

    if (contentError) {
      throw new Error(`Failed to fetch content: ${contentError.message}`)
    }

    if (!content) {
      throw new Error('Content not found')
    }

    // Fetch additional data in parallel
    const additionalPromises: Promise<any>[] = []

    // Get user ratings/reviews for this content
    additionalPromises.push(
      supabase
        .from('user_ratings')
        .select(`
          rating,
          review_title,
          review_text,
          contains_spoilers,
          helpful_count,
          created_at,
          profiles(username, display_name)
        `)
        .eq('title_id', contentId)
        .order('helpful_count', { ascending: false })
        .limit(10)
        .then(result => ({ reviews: result.data || [] }))
    )

    // Get user list statistics (how many people have it in their lists)
    additionalPromises.push(
      supabase
        .from('user_lists')
        .select('status_id, list_statuses(name)')
        .eq('title_id', contentId)
        .then(result => {
          const stats: Record<string, number> = {}
          result.data?.forEach(item => {
            const status = item.list_statuses?.name
            if (status) {
              stats[status] = (stats[status] || 0) + 1
            }
          })
          return { listStats: stats }
        })
    )

    // Get recommendations if requested
    if (includeRecommendations) {
      const genres = content.title_genres?.map((tg: any) => tg.genres?.id).filter(Boolean) || []
      
      if (genres.length > 0) {
        additionalPromises.push(
          supabase
            .from('titles')
            .select('*, title_genres!inner(genre_id)')
            .eq('content_type', contentType)
            .in('title_genres.genre_id', genres)
            .neq('id', contentId)
            .order('score', { ascending: false })
            .limit(10)
            .then(result => ({ recommendations: result.data || [] }))
        )
      } else {
        additionalPromises.push(Promise.resolve({ recommendations: [] }))
      }
    }

    // Get character information if available
    additionalPromises.push(
      supabase
        .from('title_characters')
        .select(`
          character_name,
          character_role,
          character_image_url,
          voice_actors(
            actor_name,
            actor_language,
            actor_image_url
          )
        `)
        .eq('title_id', contentId)
        .order('character_role')
        .limit(20)
        .then(result => ({ characters: result.data || [] }))
        .catch(() => ({ characters: [] })) // Table might not exist
    )

    // Wait for all additional data
    const additionalData = await Promise.all(additionalPromises)
    const mergedAdditional = additionalData.reduce((acc, curr) => ({ ...acc, ...curr }), {})

    // Calculate average rating
    const avgRating = mergedAdditional.reviews?.length > 0
      ? mergedAdditional.reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / mergedAdditional.reviews.length
      : null

    // Prepare the final response
    const result = {
      ...content,
      ...mergedAdditional,
      meta: {
        averageUserRating: avgRating,
        totalReviews: mergedAdditional.reviews?.length || 0,
        totalInLists: Object.values(mergedAdditional.listStats || {}).reduce((a: number, b: number) => a + b, 0)
      }
    }

    const payload = {
      success: true,
      data: result,
      error: null,
      meta: { 
        correlationId, 
        timestamp: new Date().toISOString(),
        contentType,
        includeRecommendations
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
    console.error('Get content details error:', error)
    
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