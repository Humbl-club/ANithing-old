#!/usr/bin/env node
import fs from 'fs';

const SUPABASE_PROJECT_URL = 'https://axtpbgsjbmhbuqomarcr.supabase.co';

console.log('\n📋 SQL Migration Instructions\n');
console.log('=' .repeat(60));
console.log('\nSince we cannot directly execute SQL via the API, please follow these steps:\n');
console.log('1. Open your Supabase Dashboard:');
console.log(`   ${SUPABASE_PROJECT_URL.replace('.supabase.co', '.supabase.com')}/sql\n`);
console.log('2. Copy and paste the SQL from the file:');
console.log('   supabase/migrations/20250811100000_add_user_tables.sql\n');
console.log('3. Click "Run" to execute the migration\n');
console.log('=' .repeat(60));
console.log('\nAlternatively, here\'s a condensed version to run immediately:\n');

const condensedSQL = `
-- Quick setup for missing tables
CREATE TABLE IF NOT EXISTS list_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO list_statuses (name, color) VALUES
  ('watching', '#10b981'),
  ('completed', '#3b82f6'),
  ('on_hold', '#f59e0b'),
  ('dropped', '#ef4444'),
  ('plan_to_watch', '#8b5cf6')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title_id UUID,
  status_id UUID,
  score INTEGER,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS with public read
ALTER TABLE list_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_list_statuses" ON list_statuses FOR SELECT USING (true);
CREATE POLICY "public_read_profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "public_read_user_lists" ON user_lists FOR SELECT USING (true);
CREATE POLICY "public_read_user_preferences" ON user_preferences FOR SELECT USING (true);
`;

console.log(condensedSQL);
console.log('\n✅ Copy the SQL above and run it in your Supabase SQL Editor');
console.log('   This will fix the missing table errors immediately.\n');