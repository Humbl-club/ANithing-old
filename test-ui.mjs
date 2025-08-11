import { chromium } from '@playwright/test';

async function testUI() {
  console.log('🚀 Starting UI tests...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Test 1: Homepage loads
    console.log('📍 Testing homepage load...');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`  ✅ Page title: ${title}`);
    
    // Test 2: Wait for main content
    console.log('\n📍 Checking for main content...');
    await page.waitForSelector('.min-h-screen', { timeout: 10000 });
    console.log('  ✅ Main container loaded');
    
    // Test 3: Check for trending anime section
    console.log('\n📍 Looking for anime content...');
    const hasTrendingSection = await page.locator('text=/Trending Anime/i').count();
    if (hasTrendingSection > 0) {
      console.log('  ✅ Trending Anime section found');
      
      // Count anime cards
      const animeCards = await page.locator('[class*="AnimeCard"], [class*="anime-card"], img[alt*="anime" i], img[alt*="manga" i]').count();
      console.log(`  ✅ Found ${animeCards} content cards`);
    } else {
      console.log('  ⚠️  No Trending Anime section found (might be loading)');
    }
    
    // Test 4: Check for navigation
    console.log('\n📍 Checking navigation...');
    const hasNav = await page.locator('nav, [role="navigation"], header').count();
    console.log(`  ✅ Navigation elements: ${hasNav}`);
    
    // Test 5: Check for any data from edge functions
    console.log('\n📍 Checking for dynamic content...');
    await page.waitForTimeout(3000); // Give time for data to load
    
    // Look for any images (anime/manga covers)
    const images = await page.locator('img[src*="http"], img[src*="https"]').count();
    console.log(`  ✅ External images loaded: ${images}`);
    
    // Test 6: Check console for errors
    console.log('\n📍 Checking for console errors...');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log(`  ⚠️  Found ${consoleErrors.length} console errors:`);
      consoleErrors.slice(0, 3).forEach(err => console.log(`    - ${err.substring(0, 100)}`));
    } else {
      console.log('  ✅ No console errors');
    }
    
    // Test 7: Check API calls
    console.log('\n📍 Monitoring API calls...');
    const apiCalls = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('supabase.co')) {
        apiCalls.push({
          url: url.split('?')[0],
          status: response.status()
        });
      }
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    if (apiCalls.length > 0) {
      console.log(`  ✅ Made ${apiCalls.length} API calls`);
      const uniqueEndpoints = [...new Set(apiCalls.map(c => c.url))];
      uniqueEndpoints.slice(0, 5).forEach(endpoint => {
        console.log(`    - ${endpoint.replace('https://axtpbgsjbmhbuqomarcr.supabase.co', '')}`);
      });
    } else {
      console.log('  ⚠️  No API calls detected');
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✨ UI Test Summary:');
    console.log('  - Page loads successfully');
    console.log(`  - Found ${images} images`);
    console.log(`  - Made ${apiCalls.length} API calls`);
    console.log(`  - Console errors: ${consoleErrors.length}`);
    
    if (images > 0 && apiCalls.length > 0) {
      console.log('\n✅ UI is functional and displaying data!');
    } else {
      console.log('\n⚠️  UI loads but may not be displaying data properly');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testUI().catch(console.error);