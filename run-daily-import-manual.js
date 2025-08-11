#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Validate required environment variables
if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  if (!process.env.VITE_SUPABASE_URL) console.error('   - VITE_SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('Please set these in your .env.local file or environment.')
  process.exit(1)
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runDailyImport() {
  console.log('🔄 Running manual daily import...')
  console.log('=' .repeat(50))
  
  const startTime = Date.now()
  let newAnime = 0
  let newManga = 0
  const errors = []

  try {
    // Import recent high-quality anime (2 pages = 100 items max)
    console.log('\n📥 Importing new anime...')
    
    for (let page = 1; page <= 2; page++) {
      console.log(`   Processing anime page ${page}/2...`)
      
      const query = `
        query ($page: Int) {
          Page(page: $page, perPage: 50) {
            media(type: ANIME, sort: [UPDATED_AT_DESC]) {
              id
              title { romaji english native }
              description
              startDate { year month day }
              endDate { year month day }
              episodes
              duration
              season
              seasonYear
              status
              genres
              averageScore
              popularity
              coverImage { large medium }
              bannerImage
              studios { nodes { id name } }
              isAdult
              updatedAt
            }
          }
        }
      `
      
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { page } })
      })
      
      if (!response.ok) {
        throw new Error(`AniList API error: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
      }
      
      const media = result.data?.Page?.media || []
      console.log(`   Found ${media.length} anime on page ${page}`)
      
      for (const anime of media) {
        try {
          // Skip adult content and low-quality content
          if (anime.isAdult) continue
          if (anime.averageScore && anime.averageScore < 60) continue // Score < 6.0
          
          // Check if anime already exists
          const { data: existing } = await supabase
            .from('titles')
            .select('id')
            .eq('anilist_id', anime.id)
            .single()
          
          if (existing) continue // Skip existing anime
          
          // Prepare anime data
          const titleData = {
            anilist_id: anime.id,
            title: anime.title?.romaji || 'Unknown Title',
            title_english: anime.title?.english || null,
            title_native: anime.title?.native || null,
            description: anime.description || null,
            content_type: 'anime',
            score: anime.averageScore ? anime.averageScore / 10 : null,
            popularity: anime.popularity || 0,
            image_url: anime.coverImage?.large || anime.coverImage?.medium || null,
            banner_image: anime.bannerImage || null,
            status: anime.status || 'UNKNOWN',
            aired_from: anime.startDate ? 
              `${anime.startDate.year || 1900}-${String(anime.startDate.month || 1).padStart(2, '0')}-${String(anime.startDate.day || 1).padStart(2, '0')}` : null,
            aired_to: anime.endDate ? 
              `${anime.endDate.year || 1900}-${String(anime.endDate.month || 1).padStart(2, '0')}-${String(anime.endDate.day || 1).padStart(2, '0')}` : null,
            updated_at: new Date().toISOString()
          }
          
          // Insert title
          const { data: newTitle, error: titleError } = await supabase
            .from('titles')
            .insert(titleData)
            .select('id')
            .single()
          
          if (titleError) {
            errors.push(`Insert title ${anime.id}: ${titleError.message}`)
            continue
          }
          
          // Insert anime details
          const animeDetails = {
            title_id: newTitle.id,
            episodes: anime.episodes || null,
            duration: anime.duration || null,
            season: anime.season || null,
            season_year: anime.seasonYear || null,
            studios_data: anime.studios?.nodes || []
          }
          
          const { error: detailsError } = await supabase
            .from('anime_details')
            .insert(animeDetails)
          
          if (detailsError) {
            errors.push(`Insert anime details ${anime.id}: ${detailsError.message}`)
          } else {
            newAnime++
            if (newAnime % 10 === 0) {
              console.log(`   ✅ Imported ${newAnime} new anime...`)
            }
          }
          
          // Process genres
          if (anime.genres && anime.genres.length > 0) {
            for (const genreName of anime.genres.slice(0, 5)) { // Limit to 5 genres
              try {
                // Get or create genre
                let { data: genre } = await supabase
                  .from('genres')
                  .select('id')
                  .eq('name', genreName)
                  .eq('type', 'anime')
                  .single()
                
                if (!genre) {
                  const { data: newGenre } = await supabase
                    .from('genres')
                    .insert({ name: genreName, type: 'anime' })
                    .select('id')
                    .single()
                  genre = newGenre
                }
                
                if (genre) {
                  await supabase
                    .from('title_genres')
                    .insert({ title_id: newTitle.id, genre_id: genre.id })
                }
              } catch (genreError) {
                // Ignore genre errors
              }
            }
          }
          
        } catch (itemError) {
          errors.push(`Process anime ${anime.id}: ${itemError.message}`)
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log(`   ✅ Anime phase complete: ${newAnime} new titles imported`)
    
    // Import recent high-quality manga (1 page = 50 items max)
    console.log('\n📚 Importing new manga...')
    
    const mangaQuery = `
      query {
        Page(page: 1, perPage: 50) {
          media(type: MANGA, sort: [UPDATED_AT_DESC]) {
            id
            title { romaji english native }
            description
            startDate { year month day }
            endDate { year month day }
            chapters
            volumes
            status
            genres
            averageScore
            popularity
            coverImage { large medium }
            bannerImage
            isAdult
            updatedAt
          }
        }
      }
    `
    
    const mangaResponse = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: mangaQuery })
    })
    
    if (!mangaResponse.ok) {
      throw new Error(`Manga AniList API error: ${mangaResponse.status}`)
    }
    
    const mangaResult = await mangaResponse.json()
    const mangaMedia = mangaResult.data?.Page?.media || []
    console.log(`   Found ${mangaMedia.length} manga`)
    
    for (const manga of mangaMedia) {
      try {
        // Skip adult content and low-quality content
        if (manga.isAdult) continue
        if (manga.averageScore && manga.averageScore < 60) continue
        
        // Check if manga already exists
        const { data: existing } = await supabase
          .from('titles')
          .select('id')
          .eq('anilist_id', manga.id)
          .single()
        
        if (existing) continue
        
        // Prepare manga data
        const titleData = {
          anilist_id: manga.id,
          title: manga.title?.romaji || 'Unknown Title',
          title_english: manga.title?.english || null,
          title_native: manga.title?.native || null,
          description: manga.description || null,
          content_type: 'manga',
          score: manga.averageScore ? manga.averageScore / 10 : null,
          popularity: manga.popularity || 0,
          image_url: manga.coverImage?.large || manga.coverImage?.medium || null,
          banner_image: manga.bannerImage || null,
          status: manga.status || 'UNKNOWN',
          aired_from: manga.startDate ? 
            `${manga.startDate.year || 1900}-${String(manga.startDate.month || 1).padStart(2, '0')}-${String(manga.startDate.day || 1).padStart(2, '0')}` : null,
          aired_to: manga.endDate ? 
            `${manga.endDate.year || 1900}-${String(manga.endDate.month || 1).padStart(2, '0')}-${String(manga.endDate.day || 1).padStart(2, '0')}` : null,
          updated_at: new Date().toISOString()
        }
        
        // Insert title
        const { data: newTitle, error: titleError } = await supabase
          .from('titles')
          .insert(titleData)
          .select('id')
          .single()
        
        if (titleError) {
          errors.push(`Insert manga ${manga.id}: ${titleError.message}`)
          continue
        }
        
        // Insert manga details
        const mangaDetails = {
          title_id: newTitle.id,
          chapters: manga.chapters || null,
          volumes: manga.volumes || null
        }
        
        const { error: detailsError } = await supabase
          .from('manga_details')
          .insert(mangaDetails)
        
        if (detailsError) {
          errors.push(`Insert manga details ${manga.id}: ${detailsError.message}`)
        } else {
          newManga++
          if (newManga % 5 === 0) {
            console.log(`   ✅ Imported ${newManga} new manga...`)
          }
        }
        
      } catch (itemError) {
        errors.push(`Process manga ${manga.id}: ${itemError.message}`)
      }
    }
    
    console.log(`   ✅ Manga phase complete: ${newManga} new titles imported`)
    
    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    
    console.log('\n' + '=' .repeat(50))
    console.log('📊 DAILY IMPORT SUMMARY')
    console.log('=' .repeat(50))
    console.log(`⏱️  Duration: ${duration} seconds`)
    console.log(`📥 New anime imported: ${newAnime}`)
    console.log(`📚 New manga imported: ${newManga}`)
    console.log(`🎯 Total new titles: ${newAnime + newManga}`)
    console.log(`❌ Errors: ${errors.length}`)
    
    if (errors.length > 0) {
      console.log('\n⚠️  First 5 errors:')
      errors.slice(0, 5).forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`)
      })
    }
    
    // Get current database stats
    const { count: totalTitles } = await supabase
      .from('titles')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n📈 Current database: ${(totalTitles || 0).toLocaleString()} total titles`)
    console.log('\n✅ Daily import completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Daily import failed:', error.message)
    process.exit(1)
  }
}

runDailyImport()