import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import 'dotenv/config';

const url = process.env.VITE_SUPABASE_URL as string;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!url || !serviceRole) {
  console.error('Missing env: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceRole);

async function main() {
  console.log('Seeding minimal data...');
  const toInsert = [
    {
      id: randomUUID(),
      anilist_id: 9999991,
      title: 'Example Anime Seed',
      title_english: 'Example Anime Seed',
      synopsis: 'Seeded example for local dev',
      image_url: null,
      content_type: 'anime' as const,
    },
    {
      id: randomUUID(),
      anilist_id: 9999992,
      title: 'Example Manga Seed',
      title_english: 'Example Manga Seed',
      synopsis: 'Seeded example for local dev',
      image_url: null,
      content_type: 'manga' as const,
    }
  ];

  const { data, error } = await supabase.from('titles').upsert(toInsert, { onConflict: 'anilist_id' }).select();
  if (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
  console.log('Seeded/Upserted:', data?.length);
}

main().catch((e) => { console.error(e); process.exit(1); });
