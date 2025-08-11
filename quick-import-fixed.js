import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Quick importing some popular anime...');
console.log(`📍 Supabase URL: ${supabaseUrl}`);

// Popular anime IDs from AniList  
const popularAnime = [21, 20, 11061, 1535, 16498]; // Start with just 5

async function fetchAnimeFromAniList(id) {
  const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        description
        format
        episodes
        status
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
        season
        seasonYear
        averageScore
        meanScore
        popularity
        favourites
        genres
        studios(main: true) {
          nodes {
            name
          }
        }
        coverImage {
          large
          medium
        }
        bannerImage
        isAdult
        source
        hashtag
        updatedAt
      }
    }
  `;

  const variables = { id };
  
  try {
    console.log(`📡 Fetching anime ${id} from AniList...`);
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error(`❌ GraphQL errors for anime ${id}:`, data.errors);
      return null;
    }
    
    console.log(`✅ Fetched: ${data.data?.Media?.title?.romaji || 'Unknown'}`);
    return data.data?.Media;
  } catch (error) {
    console.error(`❌ Error fetching anime ${id}:`, error.message);
    return null;
  }
}

async function insertAnime(anime) {
  if (!anime) return false;

  try {
    console.log(`💾 Inserting: ${anime.title.romaji}...`);
    
    // Insert into titles table
    const { data: titleData, error: titleError } = await supabase
      .from('titles')
      .insert({
        anilist_id: anime.id,
        title: anime.title.romaji,
        title_english: anime.title.english,
        title_native: anime.title.native,
        synopsis: anime.description ? anime.description.replace(/<[^>]*>/g, '') : null,
        content_type: 'anime',
        image_url: anime.coverImage?.large || anime.coverImage?.medium,
        cover_image: anime.coverImage?.large || anime.coverImage?.medium,
        banner_image: anime.bannerImage,
        score: anime.averageScore,
        mean_score: anime.meanScore,
        popularity: anime.popularity,
        favorites: anime.favourites,
        status: anime.status ? anime.status.toLowerCase().replace('_', ' ') : null,
        adult_content: anime.isAdult || false,
        source: anime.source,
        hashtag: anime.hashtag,
        year: anime.seasonYear,
        season: anime.season ? anime.season.toLowerCase() : null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (titleError) {
      console.error(`❌ Title error for ${anime.title.romaji}:`, titleError.message);
      return false;
    }

    console.log(`✅ Title inserted with ID: ${titleData.id}`);

    // Insert into anime_details table
    const { error: animeError } = await supabase
      .from('anime_details')
      .insert({
        title_id: titleData.id,
        episodes: anime.episodes,
        format: anime.format ? anime.format.toLowerCase().replace('_', ' ') : null,
        aired_from: anime.startDate ? 
          `${anime.startDate.year}-${String(anime.startDate.month || 1).padStart(2, '0')}-${String(anime.startDate.day || 1).padStart(2, '0')}` : null,
        aired_to: anime.endDate ? 
          `${anime.endDate.year}-${String(anime.endDate.month || 1).padStart(2, '0')}-${String(anime.endDate.day || 1).padStart(2, '0')}` : null,
        updated_at: new Date().toISOString()
      });

    if (animeError) {
      console.error(`❌ Anime details error for ${anime.title.romaji}:`, animeError.message);
      return false;
    }

    console.log(`🎉 Successfully imported: ${anime.title.romaji} (${anime.id})`);
    return true;

  } catch (error) {
    console.error(`❌ Unexpected error importing ${anime.title?.romaji}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Starting sequential import...');
  let imported = 0;
  
  for (const animeId of popularAnime) {
    console.log(`\n--- Processing anime ${animeId} ---`);
    
    const anime = await fetchAnimeFromAniList(animeId);
    
    if (anime) {
      const success = await insertAnime(anime);
      if (success) imported++;
    }
    
    // Small delay between requests
    console.log('⏰ Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n🎉 Import completed! Successfully imported: ${imported}/${popularAnime.length}`);
  
  // Check final results
  console.log('🔍 Checking database...');
  const { count } = await supabase
    .from('titles')
    .select('*', { count: 'exact', head: true });
    
  console.log(`📊 Total titles in database: ${count}`);
  
  if (count > 0) {
    const { data: samples } = await supabase
      .from('titles')
      .select('title, anilist_id')
      .limit(3);
      
    console.log('📋 Sample titles:');
    samples?.forEach(title => console.log(`  - ${title.title} (${title.anilist_id})`));
  }
}

main().catch(console.error);