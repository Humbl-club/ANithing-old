import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Track progress
let totalImported = 0
let totalSkipped = 0
let totalErrors = 0
const startTime = Date.now()

// Save progress to file
function saveProgress(page, totalPages) {
  const progress = {
    lastPage: page,
    totalPages,
    totalImported,
    totalSkipped,
    totalErrors,
    timestamp: new Date().toISOString()
  }
  fs.writeFileSync('import-progress.json', JSON.stringify(progress, null, 2))
}

// Load progress from file
function loadProgress() {
  try {
    const data = fs.readFileSync('import-progress.json', 'utf8')
    return JSON.parse(data)
  } catch {
    return { lastPage: 0 }
  }
}

// GraphQL query for anime with all data
const ANIME_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(type: ANIME, sort: ID_DESC, isAdult: false) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        large
        color
      }
      bannerImage
      averageScore
      meanScore
      popularity
      favourites
      episodes
      status
      format
      season
      seasonYear
      seasonInt
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      duration
      countryOfOrigin
      isLicensed
      source
      hashtag
      trailer {
        id
        site
      }
      updatedAt
      genres
      synonyms
      studios(isMain: true) {
        nodes {
          name
          isAnimationStudio
        }
      }
      isAdult
      nextAiringEpisode {
        airingAt
        episode
      }
      airingSchedule(perPage: 1) {
        nodes {
          episode
          airingAt
        }
      }
      trends(perPage: 1, sort: DATE_DESC) {
        nodes {
          date
          trending
          popularity
          inProgress
        }
      }
      
      # Rich data - characters
      characters(sort: [ROLE, RELEVANCE], perPage: 15) {
        edges {
          role
          node {
            id
            name {
              full
              native
            }
            image {
              large
            }
          }
        }
      }
      
      # External links
      externalLinks {
        url
        site
        type
        language
        color
        icon
      }
      
      # Tags
      tags {
        id
        name
        description
        category
        rank
        isGeneralSpoiler
        isMediaSpoiler
        isAdult
      }
      
      # Relations
      relations {
        edges {
          relationType
          node {
            id
            title {
              romaji
              english
            }
            format
            type
            status
            coverImage {
              large
            }
          }
        }
      }
      
      # Recommendations
      recommendations(sort: [RATING_DESC], perPage: 10) {
        edges {
          node {
            rating
            userRating
            mediaRecommendation {
              id
              title {
                romaji
                english
              }
              coverImage {
                large
              }
              averageScore
              popularity
            }
          }
        }
      }
      
      # Stats
      stats {
        scoreDistribution {
          score
          amount
        }
        statusDistribution {
          status
          amount
        }
      }
      
      # Rankings
      rankings {
        id
        rank
        type
        format
        year
        season
        allTime
        context
      }
    }
  }
}
`

function formatDate(date) {
  if (!date?.year) return null
  const month = date.month || 1
  const day = date.day || 1
  return `${date.year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

async function importAnimePage(page, perPage = 50) {
  try {
    // Fetch from AniList API
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: ANIME_QUERY,
        variables: { page, perPage }
      })
    })

    // Check rate limit
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
    const rateLimitReset = response.headers.get('X-RateLimit-Reset')
    
    if (rateLimitRemaining) {
      const remaining = parseInt(rateLimitRemaining)
      if (remaining < 10) {
        const resetTime = rateLimitReset ? parseInt(rateLimitReset) * 1000 : Date.now() + 60000
        const waitTime = Math.max(0, resetTime - Date.now())
        console.log(`⏳ Rate limit approaching (${remaining} left), waiting ${Math.ceil(waitTime/1000)}s...`)
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 60000)))
      }
    }

    if (!response.ok) {
      if (response.status === 429) {
        console.error('❌ Rate limited, waiting 60s...')
        await new Promise(resolve => setTimeout(resolve, 60000))
        return { imported: 0, skipped: 0, errors: 0, hasMore: true }
      }
      throw new Error(`AniList API error: ${response.status}`)
    }

    const { data, errors } = await response.json()
    
    if (errors) {
      console.error('❌ GraphQL errors:', errors)
      throw new Error('GraphQL errors')
    }

    const animeList = data?.Page?.media || []
    const pageInfo = data?.Page?.pageInfo || {}
    
    let imported = 0
    let skipped = 0
    let errorCount = 0

    // Process each anime
    for (const anime of animeList) {
      try {
        // Skip if no valid title or ID
        if (!anime.id || (!anime.title?.romaji && !anime.title?.english && !anime.title?.native)) {
          skipped++
          continue
        }

        // Skip adult content
        if (anime.isAdult || anime.genres?.includes('Hentai')) {
          skipped++
          continue
        }

        // Prepare title data
        const titleData = {
          anilist_id: anime.id,
          title: anime.title.romaji || anime.title.english || anime.title.native || '',
          title_english: anime.title.english,
          title_japanese: anime.title.native,
          content_type: 'anime',
          synopsis: anime.description,
          image_url: anime.coverImage?.large,
          color_theme: anime.coverImage?.color,
          score: anime.averageScore ? anime.averageScore / 10 : null,
          popularity: anime.popularity,
          favorites: anime.favourites,
          year: anime.seasonYear,
          members: anime.favourites,
          rank: anime.rankings?.find(r => r.type === 'RATED' && r.allTime)?.rank,
        }

        // Upsert title
        const { data: upsertedTitle, error: titleError } = await supabase
          .from('titles')
          .upsert(titleData, { 
            onConflict: 'anilist_id',
            ignoreDuplicates: false 
          })
          .select('id')
          .single()

        if (titleError || !upsertedTitle) {
          throw new Error(`Failed to upsert title: ${titleError?.message || 'No data returned'}`)
        }

        const titleId = upsertedTitle.id

        // Check if anime details exist
        const { data: existingDetails } = await supabase
          .from('anime_details')
          .select('id')
          .eq('title_id', titleId)
          .single()

        // Prepare anime details
        const animeDetails = {
          title_id: titleId,
          episodes: anime.episodes,
          status: anime.status,
          type: anime.format,
          season: anime.season,
          aired_from: formatDate(anime.startDate),
          aired_to: formatDate(anime.endDate),
          trailer_url: anime.trailer?.site === 'youtube' && anime.trailer?.id
            ? `https://www.youtube.com/watch?v=${anime.trailer.id}`
            : null,
          next_episode_date: anime.nextAiringEpisode?.airingAt
            ? new Date(anime.nextAiringEpisode.airingAt * 1000).toISOString()
            : null,
          next_episode_number: anime.nextAiringEpisode?.episode,
        }

        if (existingDetails) {
          await supabase
            .from('anime_details')
            .update(animeDetails)
            .eq('title_id', titleId)
        } else {
          await supabase
            .from('anime_details')
            .insert(animeDetails)
        }

        // Handle genres
        if (anime.genres?.length > 0) {
          for (const genreName of anime.genres) {
            const { data: genre } = await supabase
              .from('genres')
              .select('id')
              .eq('name', genreName)
              .single()

            let genreId = genre?.id
            if (!genreId) {
              const { data: newGenre } = await supabase
                .from('genres')
                .insert({ name: genreName, type: 'anime' })
                .select('id')
                .single()
              genreId = newGenre?.id
            }

            if (genreId) {
              await supabase
                .from('title_genres')
                .delete()
                .eq('title_id', titleId)
                .eq('genre_id', genreId)

              await supabase
                .from('title_genres')
                .insert({ title_id: titleId, genre_id: genreId })
            }
          }
        }

        // Handle studios
        if (anime.studios?.nodes?.length > 0) {
          for (const studio of anime.studios.nodes) {
            if (!studio.name) continue

            const { data: studioData } = await supabase
              .from('studios')
              .select('id')
              .eq('name', studio.name)
              .single()

            let studioId = studioData?.id
            if (!studioId) {
              const { data: newStudio } = await supabase
                .from('studios')
                .insert({ name: studio.name })
                .select('id')
                .single()
              studioId = newStudio?.id
            }

            if (studioId) {
              await supabase
                .from('title_studios')
                .delete()
                .eq('title_id', titleId)
                .eq('studio_id', studioId)

              await supabase
                .from('title_studios')
                .insert({ title_id: titleId, studio_id: studioId })
            }
          }
        }

        imported++
        
      } catch (error) {
        errorCount++
        console.error(`❌ Failed to import ${anime.title?.romaji}:`, error.message)
      }
    }

    return { 
      imported, 
      skipped, 
      errors: errorCount, 
      pageInfo,
      hasMore: pageInfo.hasNextPage 
    }

  } catch (error) {
    console.error('❌ Page import failed:', error)
    return { imported: 0, skipped: 0, errors: 1, hasMore: true }
  }
}

async function importAllAnime() {
  console.log('🚀 Starting comprehensive anime import from AniList')
  console.log('=' .repeat(60))
  
  // Load previous progress
  const progress = loadProgress()
  let currentPage = progress.lastPage || 1
  let hasMore = true
  
  console.log(`📊 Starting from page ${currentPage}`)
  
  while (hasMore) {
    console.log(`\n📥 Importing page ${currentPage}...`)
    
    const result = await importAnimePage(currentPage, 50)
    
    totalImported += result.imported
    totalSkipped += result.skipped
    totalErrors += result.errors
    
    console.log(`   ✅ Imported: ${result.imported}`)
    console.log(`   ⚠️  Skipped: ${result.skipped}`)
    console.log(`   ❌ Errors: ${result.errors}`)
    
    if (result.pageInfo) {
      console.log(`   📄 Progress: ${currentPage}/${result.pageInfo.lastPage} pages`)
      saveProgress(currentPage, result.pageInfo.lastPage)
    }
    
    hasMore = result.hasMore
    currentPage++
    
    // Show overall progress every 10 pages
    if (currentPage % 10 === 0) {
      const elapsed = (Date.now() - startTime) / 1000
      const rate = totalImported / elapsed
      console.log(`\n📊 Overall Progress:`)
      console.log(`   Total imported: ${totalImported}`)
      console.log(`   Total skipped: ${totalSkipped}`)
      console.log(`   Total errors: ${totalErrors}`)
      console.log(`   Rate: ${rate.toFixed(1)} anime/second`)
      console.log(`   Elapsed: ${Math.floor(elapsed / 60)} minutes`)
    }
    
    // Small delay between pages to be respectful
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Optional: Stop after a certain number of pages for testing
    // if (currentPage > 10) break
  }
  
  const elapsed = (Date.now() - startTime) / 1000
  console.log('\n' + '=' .repeat(60))
  console.log('✅ Import completed!')
  console.log(`   Total imported: ${totalImported}`)
  console.log(`   Total skipped: ${totalSkipped}`)
  console.log(`   Total errors: ${totalErrors}`)
  console.log(`   Total time: ${Math.floor(elapsed / 60)} minutes`)
  console.log(`   Average rate: ${(totalImported / elapsed).toFixed(1)} anime/second`)
}

// Add graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Import interrupted! Progress has been saved.')
  console.log('Run the script again to resume from where you left off.')
  process.exit(0)
})

// Run the import
importAllAnime().catch(console.error)