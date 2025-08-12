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
 * IMPORT DATA ENHANCED FUNCTION
 * Enhanced data import with rate limiting and error recovery
 * Supports anime, manga, or both content types
 * Uses AniList GraphQL API with proper error handling
 */
Deno.serve(async (req) => {
  const correlationId = req.headers.get('x-correlation-id') ?? crypto.randomUUID()
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      type = 'anime', 
      pages = 1, 
      itemsPerPage = 50,
      startPage = 1 
    } = await req.json()

    console.log(`Starting enhanced import: type=${type}, pages=${pages}, itemsPerPage=${itemsPerPage}`)

    let totalImported = 0
    let totalErrors = 0
    const errors: string[] = []

    const importPromises: Promise<any>[] = []

    // Import anime data
    if (type === 'anime' || type === 'both') {
      for (let page = startPage; page < startPage + pages; page++) {
        importPromises.push(
          importAnimeData(page, itemsPerPage)
            .then(result => {
              totalImported += result.imported
              return result
            })
            .catch(error => {
              totalErrors++
              errors.push(`Anime page ${page}: ${error.message}`)
              return { imported: 0, page }
            })
        )
      }
    }

    // Import manga data
    if (type === 'manga' || type === 'both') {
      for (let page = startPage; page < startPage + pages; page++) {
        importPromises.push(
          importMangaData(page, itemsPerPage)
            .then(result => {
              totalImported += result.imported
              return result
            })
            .catch(error => {
              totalErrors++
              errors.push(`Manga page ${page}: ${error.message}`)
              return { imported: 0, page }
            })
        )
      }
    }

    // Execute all imports with rate limiting
    const batchSize = 3 // Process 3 pages concurrently to respect rate limits
    const results = []

    for (let i = 0; i < importPromises.length; i += batchSize) {
      const batch = importPromises.slice(i, i + batchSize)
      const batchResults = await Promise.all(batch)
      results.push(...batchResults)
      
      // Rate limiting delay between batches
      if (i + batchSize < importPromises.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    const payload = {
      success: totalErrors === 0 || totalImported > 0,
      data: {
        totalImported,
        totalErrors,
        errors: errors.slice(0, 10), // Limit error messages
        results: results.map(r => ({ page: r.page, imported: r.imported }))
      },
      error: totalErrors > 0 && totalImported === 0 ? 'All imports failed' : null,
      meta: { 
        correlationId, 
        timestamp: new Date().toISOString(),
        type,
        pagesRequested: pages,
        itemsPerPage
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
    console.error('Import data enhanced error:', error)
    
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

async function importAnimeData(page: number, perPage: number): Promise<{ imported: number; page: number }> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: [POPULARITY_DESC]) {
          id
          title { romaji english native }
          description
          coverImage { large medium }
          bannerImage
          averageScore
          meanScore
          popularity
          favourites
          episodes
          duration
          status
          format
          season
          seasonYear
          studios { nodes { name } }
          genres
          tags { name rank }
          startDate { year month day }
          endDate { year month day }
          nextAiringEpisode { episode airingAt }
          trailer { id site }
        }
      }
    }
  `

  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { page, perPage } })
  })

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (data.errors) {
    throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`)
  }

  const media = data.data?.Page?.media || []
  let imported = 0

  for (const item of media) {
    try {
      await importSingleAnime(item)
      imported++
    } catch (error) {
      console.error(`Failed to import anime ${item.id}:`, error)
    }
  }

  return { imported, page }
}

async function importMangaData(page: number, perPage: number): Promise<{ imported: number; page: number }> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: [POPULARITY_DESC]) {
          id
          title { romaji english native }
          description
          coverImage { large medium }
          bannerImage
          averageScore
          meanScore
          popularity
          favourites
          chapters
          volumes
          status
          format
          genres
          tags { name rank }
          startDate { year month day }
          endDate { year month day }
          staff { edges { node { name { full } } role } }
        }
      }
    }
  `

  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { page, perPage } })
  })

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (data.errors) {
    throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`)
  }

  const media = data.data?.Page?.media || []
  let imported = 0

  for (const item of media) {
    try {
      await importSingleManga(item)
      imported++
    } catch (error) {
      console.error(`Failed to import manga ${item.id}:`, error)
    }
  }

  return { imported, page }
}

async function importSingleAnime(item: any) {
  // Insert title
  const { data: title, error: titleError } = await supabase
    .from('titles')
    .upsert({
      anilist_id: item.id,
      title: item.title?.romaji || item.title?.english || 'Unknown',
      title_english: item.title?.english,
      title_japanese: item.title?.native,
      synopsis: item.description,
      image_url: item.coverImage?.large || item.coverImage?.medium,
      score: item.averageScore ? item.averageScore / 10 : null,
      anilist_score: item.averageScore ? item.averageScore / 10 : null,
      popularity: item.popularity,
      favorites: item.favourites,
      year: item.seasonYear || item.startDate?.year,
      content_type: 'anime'
    }, { onConflict: 'anilist_id' })
    .select()
    .single()

  if (titleError) throw titleError

  // Insert anime details
  if (title) {
    await supabase
      .from('anime_details')
      .upsert({
        title_id: title.id,
        episodes: item.episodes,
        aired_from: item.startDate ? formatDate(item.startDate) : null,
        aired_to: item.endDate ? formatDate(item.endDate) : null,
        season: item.season,
        season_year: item.seasonYear,
        status: item.status,
        type: item.format,
        trailer_url: item.trailer ? `https://www.youtube.com/watch?v=${item.trailer.id}` : null,
        next_episode_date: item.nextAiringEpisode ? new Date(item.nextAiringEpisode.airingAt * 1000).toISOString() : null
      }, { onConflict: 'title_id' })
  }
}

async function importSingleManga(item: any) {
  // Insert title
  const { data: title, error: titleError } = await supabase
    .from('titles')
    .upsert({
      anilist_id: item.id,
      title: item.title?.romaji || item.title?.english || 'Unknown',
      title_english: item.title?.english,
      title_japanese: item.title?.native,
      synopsis: item.description,
      image_url: item.coverImage?.large || item.coverImage?.medium,
      score: item.averageScore ? item.averageScore / 10 : null,
      anilist_score: item.averageScore ? item.averageScore / 10 : null,
      popularity: item.popularity,
      favorites: item.favourites,
      year: item.startDate?.year,
      content_type: 'manga'
    }, { onConflict: 'anilist_id' })
    .select()
    .single()

  if (titleError) throw titleError

  // Insert manga details
  if (title) {
    await supabase
      .from('manga_details')
      .upsert({
        title_id: title.id,
        chapters: item.chapters,
        volumes: item.volumes,
        published_from: item.startDate ? formatDate(item.startDate) : null,
        published_to: item.endDate ? formatDate(item.endDate) : null,
        status: item.status,
        type: item.format
      }, { onConflict: 'title_id' })
  }
}

function formatDate(dateObj: any): string | null {
  if (!dateObj) return null
  const { year, month, day } = dateObj
  if (!year) return null
  
  const monthStr = month ? month.toString().padStart(2, '0') : '01'
  const dayStr = day ? day.toString().padStart(2, '0') : '01'
  
  return `${year}-${monthStr}-${dayStr}`
}