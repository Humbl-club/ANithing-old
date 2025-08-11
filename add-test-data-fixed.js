import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Adding test anime data...');
console.log(`📍 Supabase URL: ${supabaseUrl}`);

const testAnime = [
  {
    anilist_id: 21,
    title: 'One Piece',
    title_english: 'One Piece',
    synopsis: 'Follow Monkey D. Luffy, a young pirate who gains rubber powers after eating a Devil Fruit.',
    episodes: 1000,
    score: 9.0,
    image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDoj1EkAxFn.jpg'
  },
  {
    anilist_id: 20,
    title: 'Naruto',
    title_english: 'Naruto',
    synopsis: 'Naruto Uzumaki is a young ninja who seeks recognition from his peers.',
    episodes: 720,
    score: 8.5,
    image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-YJyJr2dTqyPC.jpg'
  },
  {
    anilist_id: 11061,
    title: 'Hunter x Hunter (2011)',
    title_english: 'Hunter x Hunter',
    synopsis: 'A young boy named Gon Freecss discovers that his father is a legendary Hunter.',
    episodes: 148,
    score: 9.4,
    image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-sIpJPA2cTrFk.jpg'
  },
  {
    anilist_id: 1535,
    title: 'Death Note',
    title_english: 'Death Note',
    synopsis: 'A high school student discovers a supernatural notebook.',
    episodes: 37,
    score: 8.9,
    image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-lawCwhzhi96X.jpg'
  },
  {
    anilist_id: 16498,
    title: 'Shingeki no Kyojin',
    title_english: 'Attack on Titan',
    synopsis: 'Humanity fights for survival against giant humanoid Titans.',
    episodes: 87,
    score: 9.0,
    image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-73IhOXpJZiMF.jpg'
  }
];

async function insertTestData() {
  console.log('💾 Inserting test anime data...');

  for (const anime of testAnime) {
    try {
      console.log(`📝 Adding: ${anime.title}...`);

      // Insert into titles table with correct schema
      const { data: titleData, error: titleError } = await supabase
        .from('titles')
        .insert({
          anilist_id: anime.anilist_id,
          title: anime.title,
          title_english: anime.title_english,
          synopsis: anime.synopsis,
          content_type: 'anime',
          image_url: anime.image_url,
          score: anime.score,
          popularity: Math.floor(Math.random() * 100000) + 10000,
          favorites: Math.floor(Math.random() * 50000) + 1000,
          year: 2024,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (titleError) {
        console.error(`❌ Error inserting ${anime.title}:`, titleError);
        continue;
      }

      console.log(`✅ Title inserted with ID: ${titleData.id}`);

      // Insert into anime_details table
      const { error: animeError } = await supabase
        .from('anime_details')
        .insert({
          title_id: titleData.id,
          episodes: anime.episodes,
          format: 'TV',
          updated_at: new Date().toISOString()
        });

      if (animeError) {
        console.error(`❌ Error inserting anime details for ${anime.title}:`, animeError);
        continue;
      }

      console.log(`🎉 Successfully added: ${anime.title}`);

    } catch (error) {
      console.error(`❌ Unexpected error with ${anime.title}:`, error.message);
    }
  }
}

async function main() {
  await insertTestData();

  console.log('\n🔍 Checking results...');
  
  const { count } = await supabase
    .from('titles')
    .select('*', { count: 'exact', head: true });
    
  console.log(`📊 Total titles in database: ${count}`);
  
  if (count > 0) {
    const { data: samples } = await supabase
      .from('titles')
      .select('title, anilist_id, score, content_type')
      .limit(10);
      
    console.log('\n📋 Added titles:');
    samples?.forEach(title => 
      console.log(`  - ${title.title} (Score: ${title.score}, Type: ${title.content_type})`)
    );
  }

  console.log('\n🎉 Test data import completed!');
  console.log('🌐 Your app should now show anime content at http://localhost:8081');
}

main().catch(console.error);