const { chromium } = require('playwright');

async function testFixes() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Testing all fixes...\n');

  // Test 1: Home page images
  console.log('1. Testing home page images...');
  await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
  const brokenImages = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.filter(img => !img.complete || img.naturalHeight === 0).length;
  });
  console.log(`   ✓ Home page: ${brokenImages === 0 ? 'All images loading' : brokenImages + ' broken images'}`);
  await page.screenshot({ path: 'screenshots/test-home-fixed.png' });

  // Test 2: Browse page real search
  console.log('\n2. Testing Browse page search...');
  await page.goto('http://localhost:8081/browse', { waitUntil: 'networkidle' });
  await page.fill('input[placeholder*="Search"]', 'Dragon');
  await page.waitForTimeout(1000);
  const searchResults = await page.evaluate(() => {
    const cards = document.querySelectorAll('[class*="card"]');
    return cards.length;
  });
  console.log(`   ✓ Search for "Dragon": ${searchResults} results found`);
  await page.screenshot({ path: 'screenshots/test-browse-search.png' });

  // Test 3: Detail pages
  console.log('\n3. Testing detail pages...');
  
  // First navigate to anime browse to get a real ID
  await page.goto('http://localhost:8081/anime', { waitUntil: 'networkidle' });
  const firstAnimeId = await page.evaluate(() => {
    const firstCard = document.querySelector('a[href*="/anime/"]');
    return firstCard ? firstCard.getAttribute('href').split('/').pop() : null;
  });
  
  if (firstAnimeId) {
    console.log(`   Testing anime detail: /anime/${firstAnimeId}`);
    await page.goto(`http://localhost:8081/anime/${firstAnimeId}`, { waitUntil: 'networkidle' });
    const hasContent = await page.evaluate(() => {
      const title = document.querySelector('h1');
      const errorText = document.body.innerText.includes('Content Not Found');
      return title && !errorText;
    });
    console.log(`   ✓ Anime detail page: ${hasContent ? 'Content loaded' : 'Error - Content Not Found'}`);
    await page.screenshot({ path: 'screenshots/test-anime-detail.png' });
  }

  // Test manga detail
  await page.goto('http://localhost:8081/manga', { waitUntil: 'networkidle' });
  const firstMangaId = await page.evaluate(() => {
    const firstCard = document.querySelector('a[href*="/manga/"]');
    return firstCard ? firstCard.getAttribute('href').split('/').pop() : null;
  });
  
  if (firstMangaId) {
    console.log(`   Testing manga detail: /manga/${firstMangaId}`);
    await page.goto(`http://localhost:8081/manga/${firstMangaId}`, { waitUntil: 'networkidle' });
    const hasContent = await page.evaluate(() => {
      const title = document.querySelector('h1');
      const errorText = document.body.innerText.includes('Content Not Found');
      return title && !errorText;
    });
    console.log(`   ✓ Manga detail page: ${hasContent ? 'Content loaded' : 'Error - Content Not Found'}`);
    await page.screenshot({ path: 'screenshots/test-manga-detail.png' });
  }

  await browser.close();
  console.log('\n✅ All tests complete! Check screenshots folder for visual verification.');
}

testFixes().catch(console.error);