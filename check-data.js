import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Use service role key to bypass RLS
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  serviceRoleKey
)

async function checkData() {
  console.log('🔍 Checking database contents...')
  console.log('🔗 Supabase URL:', process.env.VITE_SUPABASE_URL)
  
  // Get exact counts first
  const { count: totalTitles } = await supabase
    .from('titles')
    .select('*', { count: 'exact', head: true })
  
  const { count: totalAnime } = await supabase
    .from('anime_details')
    .select('*', { count: 'exact', head: true })
    
  const { count: totalManga } = await supabase
    .from('manga_details')
    .select('*', { count: 'exact', head: true })
  
  console.log('\n📊 DATABASE COUNTS:')
  console.log(`Total Titles: ${totalTitles || 0}`)
  console.log(`Total Anime: ${totalAnime || 0}`)
  console.log(`Total Manga: ${totalManga || 0}`)
  
  // Check titles table
  const { data: titles, error: titlesError } = await supabase
    .from('titles')
    .select('id, title, content_type')
    .limit(10)
  
  console.log('\n📊 TITLES TABLE:')
  console.log('Total titles found:', titles?.length || 0)
  if (titlesError) {
    console.error('❌ Titles error:', titlesError)
  } else if (titles && titles.length > 0) {
    titles.forEach(title => {
      console.log(`- ${title.content_type}: ${title.title}`)
    })
  }
  
  // Check anime details
  const { data: animeDetails, error: animeError } = await supabase
    .from('anime_details')
    .select('id, title_id, episodes')
    .limit(5)
  
  console.log('\n🎬 ANIME DETAILS:')
  console.log('Anime details found:', animeDetails?.length || 0)
  if (animeError) console.error('❌ Anime error:', animeError)
  
  // Check manga details
  const { data: mangaDetails, error: mangaError } = await supabase
    .from('manga_details')
    .select('id, title_id, chapters')
    .limit(5)
  
  console.log('\n📚 MANGA DETAILS:')
  console.log('Manga details found:', mangaDetails?.length || 0)
  if (mangaError) console.error('❌ Manga error:', mangaError)
  
  // Test the query your app might be using
  const { data: animeWithDetails, error: joinError } = await supabase
    .from('titles')
    .select(`
      *,
      anime_details!inner(*)
    `)
    .eq('content_type', 'anime')
    .limit(3)
  
  console.log('\n🔍 JOINED ANIME QUERY (what your app uses):')
  console.log('Joined anime found:', animeWithDetails?.length || 0)
  if (joinError) {
    console.error('❌ Join error:', joinError)
  } else if (animeWithDetails) {
    animeWithDetails.forEach(anime => {
      console.log(`- ${anime.title} (${anime.anime_details[0]?.episodes} episodes)`)
    })
  }
}

checkData()
