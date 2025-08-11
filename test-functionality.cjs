#!/usr/bin/env node

const https = require('https');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Test configuration
const SUPABASE_URL = 'https://axtpbgsjbmhbuqomarcr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHBiZ3NqYm1oYnVxb21hcmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MDk0NzksImV4cCI6MjA2MzA4NTQ3OX0.ySdY2C6kZQhKKNfFVaLeLIzGEw00cJy2iJRFhxixqDo';

let passedTests = 0;
let failedTests = 0;

// Helper function to make HTTP requests
function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test runner
async function runTest(name, testFn) {
  process.stdout.write(`Testing ${name}... `);
  try {
    await testFn();
    console.log(`${colors.green}✓${colors.reset}`);
    passedTests++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset}`);
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    failedTests++;
  }
}

// Tests
async function main() {
  console.log(`${colors.blue}=== AniThing Functionality Test Suite ===${colors.reset}\n`);

  // Test 1: Database connectivity
  await runTest('Database connectivity', async () => {
    const res = await makeRequest({
      hostname: 'axtpbgsjbmhbuqomarcr.supabase.co',
      path: '/rest/v1/titles?limit=1',
      method: 'GET',
      headers: {
        'apikey': ANON_KEY
      }
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });

  // Test 2: Check if titles exist
  await runTest('Titles exist in database', async () => {
    const res = await makeRequest({
      hostname: 'axtpbgsjbmhbuqomarcr.supabase.co',
      path: '/rest/v1/titles?select=id&limit=1',
      method: 'HEAD',
      headers: {
        'apikey': ANON_KEY,
        'Prefer': 'count=exact'
      }
    });
    const range = res.headers['content-range'];
    const count = parseInt(range.split('/')[1]);
    if (count === 0) throw new Error('No titles in database');
    console.log(`  ${colors.yellow}Found ${count} titles${colors.reset}`);
  });

  // Test 3: Edge function - health check
  await runTest('Edge function: health', async () => {
    const res = await makeRequest({
      hostname: 'axtpbgsjbmhbuqomarcr.supabase.co',
      path: '/functions/v1/health',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {});
    if (!res.data.success) throw new Error('Health check failed');
  });

  // Test 4: Edge function - get-home-data
  await runTest('Edge function: get-home-data', async () => {
    const res = await makeRequest({
      hostname: 'axtpbgsjbmhbuqomarcr.supabase.co',
      path: '/functions/v1/get-home-data',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      sections: ['trending-anime', 'recent-anime'],
      limit: 5
    });
    
    if (!res.data.success) throw new Error('Function failed');
    if (!res.data.data.trendingAnime) throw new Error('No trending anime');
    if (!res.data.data.recentAnime) throw new Error('No recent anime');
    
    console.log(`  ${colors.yellow}Trending: ${res.data.data.trendingAnime.length}, Recent: ${res.data.data.recentAnime.length}${colors.reset}`);
  });

  // Test 5: Check anime details exist
  await runTest('Anime details relationships', async () => {
    const res = await makeRequest({
      hostname: 'axtpbgsjbmhbuqomarcr.supabase.co',
      path: '/rest/v1/anime_details?select=id&limit=1',
      method: 'HEAD',
      headers: {
        'apikey': ANON_KEY,
        'Prefer': 'count=exact'
      }
    });
    const range = res.headers['content-range'];
    const count = parseInt(range.split('/')[1]);
    if (count === 0) throw new Error('No anime details');
    console.log(`  ${colors.yellow}Found ${count} anime details${colors.reset}`);
  });

  // Test 6: Check manga details exist
  await runTest('Manga details relationships', async () => {
    const res = await makeRequest({
      hostname: 'axtpbgsjbmhbuqomarcr.supabase.co',
      path: '/rest/v1/manga_details?select=id&limit=1',
      method: 'HEAD',
      headers: {
        'apikey': ANON_KEY,
        'Prefer': 'count=exact'
      }
    });
    const range = res.headers['content-range'];
    const count = parseInt(range.split('/')[1]);
    if (count === 0) throw new Error('No manga details');
    console.log(`  ${colors.yellow}Found ${count} manga details${colors.reset}`);
  });

  // Test 7: Check genres exist
  await runTest('Genres populated', async () => {
    const res = await makeRequest({
      hostname: 'axtpbgsjbmhbuqomarcr.supabase.co',
      path: '/rest/v1/genres?select=id&limit=1',
      method: 'HEAD',
      headers: {
        'apikey': ANON_KEY,
        'Prefer': 'count=exact'
      }
    });
    const range = res.headers['content-range'];
    const count = parseInt(range.split('/')[1]);
    if (count === 0) throw new Error('No genres');
    console.log(`  ${colors.yellow}Found ${count} genres${colors.reset}`);
  });

  // Test 8: Test RPC functions
  await runTest('RPC: get_trending_anime', async () => {
    const res = await makeRequest({
      hostname: 'axtpbgsjbmhbuqomarcr.supabase.co',
      path: '/rest/v1/rpc/get_trending_anime',
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
      }
    }, { limit_param: 5 });
    
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Not an array');
    console.log(`  ${colors.yellow}Returned ${res.data.length} items${colors.reset}`);
  });

  // Test 9: Frontend accessibility
  await runTest('Frontend server running', async () => {
    const http = require('http');
    return new Promise((resolve, reject) => {
      http.get('http://localhost:8080/', (res) => {
        if (res.statusCode !== 200) reject(new Error(`Status ${res.statusCode}`));
        else resolve();
      }).on('error', () => {
        reject(new Error('Frontend not accessible on port 8080'));
      });
    });
  });

  // Summary
  console.log(`\n${colors.blue}=== Test Summary ===${colors.reset}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  
  if (failedTests === 0) {
    console.log(`\n${colors.green}✓ All tests passed! The application is fully functional.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}✗ Some tests failed. Please check the errors above.${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
main().catch(console.error);