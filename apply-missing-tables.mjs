import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('Please set VITE_SUPABASE_URL environment variable');
  console.log('You can find it in your Supabase dashboard under Settings > Project URL');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.log('You can find it in your Supabase dashboard under Settings > API');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createMissingTables() {
  console.log('🔧 Creating missing tables...\n');
  
  try {
    // Test connection
    const { data: test, error: testError } = await supabase
      .from('titles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Cannot connect to database:', testError.message);
      return;
    }
    
    console.log('✅ Connected to database\n');
    
    // Check if list_statuses exists
    const { data: checkTable, error: checkError } = await supabase
      .from('list_statuses')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('⚠️  Table list_statuses does not exist');
      console.log('📝 This table needs to be created via Supabase Dashboard or migrations');
      console.log('\nSQL to run in Supabase SQL Editor:');
      console.log('=' .repeat(50));
      console.log(`
-- List statuses lookup table
CREATE TABLE IF NOT EXISTS list_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default statuses
INSERT INTO list_statuses (name, color) VALUES
  ('watching', '#10b981'),
  ('completed', '#3b82f6'),
  ('on_hold', '#f59e0b'),
  ('dropped', '#ef4444'),
  ('plan_to_watch', '#8b5cf6')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE list_statuses ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Public read list_statuses" ON list_statuses FOR SELECT USING (true);
      `);
      console.log('=' .repeat(50));
      console.log('\n📌 Please run the above SQL in your Supabase Dashboard:');
      console.log(`   ${SUPABASE_URL.replace('.supabase.co', '')}/sql`);
    } else if (!checkError) {
      console.log('✅ Table list_statuses already exists');
      
      // Check if it has data
      const { count } = await supabase
        .from('list_statuses')
        .select('*', { count: 'exact', head: true });
      
      if (count === 0) {
        // Insert default statuses
        const { error: insertError } = await supabase
          .from('list_statuses')
          .insert([
            { name: 'watching', color: '#10b981' },
            { name: 'completed', color: '#3b82f6' },
            { name: 'on_hold', color: '#f59e0b' },
            { name: 'dropped', color: '#ef4444' },
            { name: 'plan_to_watch', color: '#8b5cf6' }
          ]);
        
        if (insertError) {
          console.log('⚠️  Could not insert default statuses:', insertError.message);
        } else {
          console.log('✅ Inserted default list statuses');
        }
      } else {
        console.log(`✅ List statuses already populated (${count} entries)`);
      }
    }
    
    // Check other tables
    const tablesToCheck = ['profiles', 'user_lists', 'user_ratings', 'user_preferences'];
    
    for (const table of tablesToCheck) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.log(`⚠️  Table ${table} does not exist - needs creation via migrations`);
      } else {
        console.log(`✅ Table ${table} exists`);
      }
    }
    
    console.log('\n✨ Database check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createMissingTables();