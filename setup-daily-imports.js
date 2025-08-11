#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Validate required environment variables
if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  if (!process.env.VITE_SUPABASE_URL) console.error('   - VITE_SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('Please set these in your .env.local file or environment.')
  process.exit(1)
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupDailyImports() {
  console.log('🔧 Setting up automated daily imports...')
  console.log('=' .repeat(50))

  try {
    // Test the daily-import function first
    console.log('\n🧪 Testing daily import function...')
    
    const { data, error } = await supabase.functions.invoke('daily-import', {
      body: { test: true }
    })

    if (error) {
      console.error('❌ Daily import function test failed:', error)
      console.log('\n💡 To fix this issue:')
      console.log('1. Deploy the function: npx supabase functions deploy daily-import')
      console.log('2. Run this script again')
      return
    }

    console.log('✅ Daily import function is working')
    if (data?.results) {
      console.log(`   - New anime: ${data.results.newAnime}`)
      console.log(`   - Updated anime: ${data.results.updatedAnime}`)
      console.log(`   - New manga: ${data.results.newManga}`)
      console.log(`   - Updated manga: ${data.results.updatedManga}`)
      console.log(`   - Errors: ${data.results.totalErrors}`)
    }

    // Create a database table to track import history
    console.log('\n📊 Setting up import tracking...')
    
    const { error: tableError } = await supabase.rpc('create_import_log_table')
    
    if (tableError && !tableError.message.includes('already exists')) {
      console.log('⚠️  Could not create import log table automatically')
      console.log('   Manual SQL needed in Supabase Dashboard:')
      console.log(`
CREATE TABLE IF NOT EXISTS import_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  import_type TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running',
  results JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_import_logs_type_date ON import_logs(import_type, started_at DESC);
`)
    } else {
      console.log('✅ Import tracking table ready')
    }

    // Set up GitHub Actions workflow for scheduled imports
    console.log('\n⚙️  Setting up GitHub Actions workflow...')
    
    const workflowContent = `name: Daily Data Import

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

env:
  SUPABASE_URL: \${{ secrets.SUPABASE_URL }}
  SUPABASE_SERVICE_ROLE_KEY: \${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

jobs:
  import-data:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install @supabase/supabase-js
        
      - name: Run daily import
        run: |
          node -e "
          import { createClient } from '@supabase/supabase-js';
          
          const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          );
          
          async function runImport() {
            console.log('Starting scheduled daily import...');
            
            try {
              const { data, error } = await supabase.functions.invoke('daily-import');
              
              if (error) {
                console.error('Import failed:', error);
                process.exit(1);
              }
              
              console.log('Import completed successfully:', data);
              
              // Log to database
              await supabase.from('import_logs').insert({
                import_type: 'daily_scheduled',
                completed_at: new Date().toISOString(),
                status: 'completed',
                results: data?.results || {}
              });
              
            } catch (err) {
              console.error('Unexpected error:', err);
              
              // Log error to database
              await supabase.from('import_logs').insert({
                import_type: 'daily_scheduled',
                completed_at: new Date().toISOString(),
                status: 'failed',
                error_message: err.message
              });
              
              process.exit(1);
            }
          }
          
          runImport();
          "
`

    // Create .github/workflows directory and file
    const fs = await import('fs')
    const path = await import('path')
    
    const workflowDir = '.github/workflows'
    const workflowPath = path.join(workflowDir, 'daily-import.yml')
    
    if (!fs.existsSync(workflowDir)) {
      fs.mkdirSync(workflowDir, { recursive: true })
    }
    
    fs.writeFileSync(workflowPath, workflowContent)
    console.log('✅ GitHub Actions workflow created at .github/workflows/daily-import.yml')

    // Create a manual trigger script
    const manualImportScript = `#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Validate required environment variables
if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  if (!process.env.VITE_SUPABASE_URL) console.error('   - VITE_SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('Please set these in your .env.local file or environment.')
  process.exit(1)
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runManualImport() {
  console.log('🔄 Running manual daily import...')
  
  const startTime = Date.now()
  
  try {
    // Log start
    const { data: logEntry } = await supabase
      .from('import_logs')
      .insert({
        import_type: 'manual',
        status: 'running'
      })
      .select('id')
      .single()

    // Run import
    const { data, error } = await supabase.functions.invoke('daily-import')
    
    if (error) {
      throw new Error(\`Import function error: \${error.message}\`)
    }
    
    // Update log
    if (logEntry) {
      await supabase
        .from('import_logs')
        .update({
          completed_at: new Date().toISOString(),
          status: 'completed',
          results: data?.results || {}
        })
        .eq('id', logEntry.id)
    }
    
    console.log('✅ Import completed successfully!')
    console.log('Results:', data?.results)
    console.log(\`Duration: \${((Date.now() - startTime) / 1000).toFixed(1)}s\`)
    
  } catch (error) {
    console.error('❌ Import failed:', error.message)
    
    // Update log
    if (logEntry) {
      await supabase
        .from('import_logs')
        .update({
          completed_at: new Date().toISOString(),
          status: 'failed',
          error_message: error.message
        })
        .eq('id', logEntry.id)
    }
    
    process.exit(1)
  }
}

runManualImport()
`

    fs.writeFileSync('run-manual-import.js', manualImportScript)
    console.log('✅ Manual import script created: run-manual-import.js')

    // Create import status checker
    const statusCheckerScript = `#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Validate required environment variables
if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  if (!process.env.VITE_SUPABASE_URL) console.error('   - VITE_SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('Please set these in your .env.local file or environment.')
  process.exit(1)
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkImportStatus() {
  console.log('📊 Checking import history...')
  console.log('=' .repeat(50))
  
  try {
    // Get recent import logs
    const { data: logs, error } = await supabase
      .from('import_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Could not fetch import logs:', error.message)
      console.log('💡 Make sure to run setup-daily-imports.js first')
      return
    }
    
    if (!logs || logs.length === 0) {
      console.log('📝 No import history found')
      return
    }
    
    console.log(\`📈 Last \${logs.length} imports:\\n\`)
    
    logs.forEach((log, index) => {
      const date = new Date(log.started_at).toLocaleString()
      const duration = log.completed_at 
        ? \`(\${((new Date(log.completed_at) - new Date(log.started_at)) / 1000).toFixed(1)}s)\`
        : '(running)'
      
      const status = log.status === 'completed' ? '✅' : 
                    log.status === 'failed' ? '❌' : 
                    '⏳'
      
      console.log(\`\${index + 1}. \${status} \${log.import_type} - \${date} \${duration}\`)
      
      if (log.results) {
        const r = log.results
        console.log(\`   New: \${r.newAnime || 0} anime, \${r.newManga || 0} manga\`)
        console.log(\`   Updated: \${r.updatedAnime || 0} anime, \${r.updatedManga || 0} manga\`)
        if (r.totalErrors > 0) {
          console.log(\`   Errors: \${r.totalErrors}\`)
        }
      }
      
      if (log.error_message) {
        console.log(\`   Error: \${log.error_message}\`)
      }
      
      console.log()
    })
    
    // Get database statistics
    const { count: totalTitles } = await supabase
      .from('titles')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalAnime } = await supabase
      .from('titles')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'anime')
    
    const { count: totalManga } = await supabase
      .from('titles')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'manga')
    
    console.log('📊 Current database stats:')
    console.log(\`   Total titles: \${(totalTitles || 0).toLocaleString()}\`)
    console.log(\`   Anime: \${(totalAnime || 0).toLocaleString()}\`)
    console.log(\`   Manga: \${(totalManga || 0).toLocaleString()}\`)
    
  } catch (error) {
    console.error('❌ Error checking status:', error.message)
  }
}

checkImportStatus()
`

    fs.writeFileSync('check-import-status.js', statusCheckerScript)
    console.log('✅ Status checker created: check-import-status.js')

    console.log('\n' + '=' .repeat(50))
    console.log('🎉 DAILY IMPORT SYSTEM SETUP COMPLETE!')
    console.log('=' .repeat(50))

    console.log('\n📋 Available commands:')
    console.log('   node run-manual-import.js     - Run import manually')
    console.log('   node check-import-status.js   - View import history')
    console.log('   npx supabase functions deploy daily-import  - Deploy function')

    console.log('\n⚙️  Automated schedule:')
    console.log('   • GitHub Actions will run daily at 2 AM UTC')
    console.log('   • Imports up to 100 new titles + 500 updates per run')
    console.log('   • Only high-quality content (score ≥ 6.0)')
    console.log('   • Rate limited to respect AniList API')

    console.log('\n🔧 Next steps:')
    console.log('   1. Deploy function: npx supabase functions deploy daily-import')
    console.log('   2. Add GitHub secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    console.log('   3. Test: node run-manual-import.js')
    console.log('   4. Monitor: node check-import-status.js')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

setupDailyImports()