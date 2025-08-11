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
const popularAnime = [
  21, // One Piece
  20, // Naruto
  11061, // Hunter x Hunter (2011) 
  1535, // Death Note
  16498, // Attack on Titan
  21459, // My Hero Academia
  113415, // Demon Slayer
  101922, // Your Name
  129874, // Wonder Egg Priority
  114308 // Jujutsu Kaisen
];

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
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    });

    const data = await response.json();
    return data.data?.Media;
  } catch (error) {
    console.error(`❌ Error fetching anime ${id}:`, error.message);
    return null;
  }
}

async function insertAnime(anime) {
  if (!anime) return;

  try {
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
      console.error(`❌ Error inserting title for ${anime.title.romaji}:`, titleError);
      return;
    }

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
      console.error(`❌ Error inserting anime details for ${anime.title.romaji}:`, animeError);
      return;
    }

    console.log(`✅ Imported: ${anime.title.romaji} (${anime.id})`);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

  } catch (error) {
    console.error(`❌ Error importing ${anime.title?.romaji}:`, error.message);
  }
}

async function main() {
  console.log('Starting quick import...');
  
  for (const animeId of popularAnime) {
    console.log(`📥 Fetching anime ${animeId}...`);
    const anime = await fetchAnimeFromAniList(animeId);
    
    if (anime) {
      await insertAnime(anime);
    }
  }

  console.log('🎉 Quick import completed!');
  console.log('🔍 Checking results...');
  
  const { count } = await supabase
    .from('titles')
    .select('*', { count: 'exact', head: true });
    
  console.log(`📊 Total titles in database: ${count}`);
}

main().catch(console.error);