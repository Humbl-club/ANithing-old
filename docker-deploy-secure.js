#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = `
CREATE OR REPLACE FUNCTION check_email_exists_secure(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    email_exists BOOLEAN := FALSE;
BEGIN
    IF email_to_check IS NULL OR LENGTH(trim(email_to_check)) = 0 THEN
        RETURN FALSE;
    END IF;
    
    email_to_check := LOWER(TRIM(email_to_check));
    
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = email_to_check
        LIMIT 1
    ) INTO email_exists;
    
    RETURN email_exists;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION check_email_exists_secure(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION check_email_exists_secure(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_email_exists_secure(TEXT) TO anon;
`

async function deployViaDocker() {
  console.log('🐳 Docker-based Deployment of Secure Email Function')
  console.log('=' .repeat(60))
  
  // First, test local connection
  console.log('1. Testing local connection...')
  try {
    const localSupabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    )
    
    const { error: localError } = await localSupabase.from('titles').select('id').limit(1)
    if (localError) {
      console.log(`❌ Local connection failed: ${localError.message}`)
    } else {
      console.log('✅ Local Supabase is accessible')
    }
  } catch (err) {
    console.log(`❌ Local connection error: ${err.message}`)
  }
  
  // Test production connection
  console.log('2. Testing production connection...')
  try {
    const prodSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    )
    
    const { error: prodError } = await prodSupabase.from('titles').select('id').limit(1)
    if (prodError) {
      console.log(`❌ Production connection failed: ${prodError.message}`)
    } else {
      console.log('✅ Production Supabase is accessible')
    }
  } catch (err) {
    console.log(`❌ Production connection error: ${err.message}`)
  }
  
  // Try to apply function to production using service role
  console.log('3. Applying function to production database...')
  try {
    // Use service role key with production URL
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: sql
      })
    })
    
    console.log(`Response status: ${response.status}`)
    
    if (response.ok) {
      console.log('✅ Function applied via REST API!')
    } else {
      const errorText = await response.text()
      console.log(`❌ REST API failed: ${errorText}`)
    }
  } catch (err) {
    console.log(`❌ Production deployment error: ${err.message}`)
  }
  
  // Test if function exists in production
  console.log('4. Testing if function exists in production...')
  try {
    const prodSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    )
    
    const { data, error } = await prodSupabase.rpc('check_email_exists_secure', {
      email_to_check: 'test@example.com'
    })
    
    if (error) {
      console.log(`❌ Function test failed: ${error.message}`)
      return false
    } else {
      console.log(`✅ Function test successful: ${data}`)
      return true
    }
  } catch (err) {
    console.log(`❌ Function test error: ${err.message}`)
    return false
  }
}

deployViaDocker().then(success => {
  if (success) {
    console.log('\n🎉 SUCCESS! Function deployed and working!')
    console.log('Run final test: node test-secure-email-final.js')
  } else {
    console.log('\n😔 Deployment incomplete. Function may need manual creation.')
    console.log('\nManual steps:')
    console.log('1. Go to: https://supabase.com/dashboard/project/axtpbgsjbmhbuqomarcr/sql')
    console.log('2. Run the SQL from the script output above')
  }
}).catch(console.error)