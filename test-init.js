// Simple test to check if the app initialization issues
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test basic connection
    const { data: session } = await supabase.auth.getSession();
    console.log('✅ Auth session check:', session ? 'Has session' : 'No session');
    
    // Test database connection
    const { data, error } = await supabase
      .from('titles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Database error:', error.message);
    } else {
      console.log('✅ Database connection:', data ? 'Success' : 'No data');
    }
    
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

testConnection();