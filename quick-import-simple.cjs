#!/usr/bin/env node

/**
 * Quick Import Utility (CommonJS version)
 * Imports a small set of popular anime if the database is empty
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
);

// Sample popular anime data
const sampleAnime = [
  {
    anilist_id: 21,
    title: "One Piece",
    title_english: "One Piece",
    content_type: "anime",
    description: "Gol D. Roger was known as the Pirate King, the strongest and most infamous being to have sailed the Grand Line. The capture and execution of Roger by the World Government brought a change throughout the world. His last words before his death revealed the existence of the greatest treasure in the world, One Piece. It was this revelation that brought about the Grand Age of Pirates, men who dreamed of finding One Piece—which promises an unlimited amount of riches and fame—and quite possibly the pinnacle of glory and the title of the Pirate King.",
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDoj1EkSiMv.jpg",
    banner_image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg",
    score: 9.0,
    popularity: 654321,
    year: 1999,
    status: "RELEASING",
    genres: ["Action", "Adventure", "Comedy", "Drama", "Shounen"]
  },
  {
    anilist_id: 20,
    title: "Naruto",
    title_english: "Naruto",
    content_type: "anime", 
    description: "Naruto Uzumaki, a hyperactive and knuckle-headed ninja, lives in Konohagakure, the Hidden Leaf village. Moments prior to Naruto's birth, a huge demon known as the Kyuubi, the Nine-tailed Fox, attacked Konohagakure and wreaked havoc. In order to put an end to the Kyuubi's rampage, the leader of the village, the 4th Hokage, sacrificed his life and sealed the monstrous beast inside the newborn Naruto.",
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-YJvLbgJQp9ux.png",
    banner_image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20-HHxhPj5JD13a.jpg",
    score: 8.3,
    popularity: 543210,
    year: 2002,
    status: "FINISHED",
    genres: ["Action", "Martial Arts", "Comedy", "Shounen"]
  },
  {
    anilist_id: 1535,
    title: "Death Note",
    title_english: "Death Note",
    content_type: "anime",
    description: "Light Yagami is a brilliant seventeen-year-old student, one of the top scorers on his exams in all of Japan. One day, on the way home from class, Light stumbles upon a dark notebook with 'Death Note' written on the front. Intrigued by its appearance, Light reads the first few sentences, only to find out that it states that anyone whose name is written in the notebook will die.",
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-4r88a1tsBEIz.jpg",
    banner_image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg",
    score: 9.0,
    popularity: 432100,
    year: 2006,
    status: "FINISHED",
    genres: ["Supernatural", "Thriller", "Psychological", "Shounen"]
  },
  {
    anilist_id: 11061,
    title: "Hunter x Hunter (2011)",
    title_english: "Hunter x Hunter",
    content_type: "anime",
    description: "Gon Freecss discovers that the father he had always been told was dead is in fact alive and well. His father, Ging, is a Hunter—a member of society's elite with a license to go anywhere or do almost anything. Now Gon will test his skills and bravery as he struggles to follow in his father's footsteps.",
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-sIlbWgEc8tD8.png",
    banner_image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/11061-8WkkTZ6duKpq.jpg",
    score: 9.1,
    popularity: 345670,
    year: 2011,
    status: "FINISHED",
    genres: ["Action", "Adventure", "Fantasy", "Shounen"]
  },
  {
    anilist_id: 113415,
    title: "Jujutsu Kaisen",
    title_english: "Jujutsu Kaisen",
    content_type: "anime",
    description: "Idly indulging in baseless paranormal activities with the Occult Club, high schooler Yuuji Itadori spends his days at either the clubroom or the hospital, where he visits his bedridden grandfather. However, this leisurely lifestyle soon takes a turn for the strange when he unknowingly encounters a cursed item.",
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",
    banner_image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg",
    score: 8.5,
    popularity: 567890,
    year: 2020,
    status: "FINISHED",
    genres: ["Action", "School", "Shounen", "Supernatural"]
  },
  {
    anilist_id: 100166,
    title: "Spy x Family",
    title_english: "Spy x Family",
    content_type: "anime",
    description: "Master spy Twilight is the best at what he does when it comes to going undercover on dangerous missions in the name of a better world. But when he receives the ultimate impossible assignment—get married and have a kid—he may finally be in over his head!",
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx100166-2OMCgWm6zfh7.png",
    banner_image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/100166-R3cl3lDUwo5G.jpg",
    score: 8.7,
    popularity: 478520,
    year: 2022,
    status: "FINISHED",
    genres: ["Action", "Comedy", "Family", "Shounen"]
  }
];

async function quickImport() {
  console.log('🚀 Starting quick import...');

  try {
    // Check if we have any data
    const { data: existingTitles, error: checkError } = await supabase
      .from('titles')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking existing data:', checkError);
      return;
    }

    if (existingTitles && existingTitles.length > 6) {
      console.log('✅ Database already has sufficient content. Skipping import.');
      return;
    }

    console.log('📥 Database needs more content. Importing sample content...');

    // Import sample anime
    for (const anime of sampleAnime) {
      console.log(`📺 Importing: ${anime.title}`);
      
      // Check if this anime already exists
      const { data: existing } = await supabase
        .from('titles')
        .select('id')
        .eq('anilist_id', anime.anilist_id)
        .single();

      if (existing) {
        console.log(`⏭️  Skipping ${anime.title} - already exists`);
        continue;
      }
      
      // Insert title
      const { data: titleData, error: titleError } = await supabase
        .from('titles')
        .insert([{
          anilist_id: anime.anilist_id,
          title: anime.title,
          title_english: anime.title_english,
          content_type: anime.content_type,
          description: anime.description,
          cover_image: anime.cover_image,
          banner_image: anime.banner_image,
          score: anime.score,
          popularity: anime.popularity,
          year: anime.year,
          status: anime.status,
          genres: anime.genres
        }])
        .select()
        .single();

      if (titleError) {
        console.error(`❌ Error importing ${anime.title}:`, titleError);
        continue;
      }

      // Insert anime details
      const { error: animeError } = await supabase
        .from('anime_details')
        .insert([{
          title_id: titleData.id,
          episodes: Math.floor(Math.random() * 500) + 12, // Random episode count
          duration: 24,
          studios: ['Studio Example'],
          source: 'MANGA'
        }]);

      if (animeError) {
        console.error(`❌ Error adding anime details for ${anime.title}:`, animeError);
      } else {
        console.log(`✅ Successfully imported ${anime.title}`);
      }
    }

    console.log('✅ Quick import completed successfully!');
    console.log(`📊 Imported sample titles to populate the home page`);

  } catch (error) {
    console.error('❌ Quick import failed:', error);
  }
}

// Run the import
quickImport().then(() => {
  console.log('🎯 Import finished. You can now refresh your app to see the content!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});