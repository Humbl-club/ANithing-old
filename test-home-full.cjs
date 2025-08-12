const { chromium } = require('playwright');

async function testHomePage() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Testing home page with full page screenshot...\n');

  // Enable console logging
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });

  // Navigate to home
  await page.goto('http://localhost:8081/', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  // Wait for any content to load
  await page.waitForTimeout(3000);
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'screenshots/home-full-page.png',
    fullPage: true 
  });
  
  // Check what sections are visible
  const sections = await page.evaluate(() => {
    const results = {
      navigation: !!document.querySelector('nav'),
      heroBanner: !!document.querySelector('[class*="HeroBanner"]'),
      personalizedSection: !!document.querySelector('[class*="PersonalizedSection"]'),
      trendingTabs: !!document.querySelector('[class*="TrendingTabs"]'),
      seasonalAnime: !!document.querySelector('[class*="SeasonalAnime"]'),
      newsUpdates: !!document.querySelector('[class*="NewsAndUpdates"]'),
      emptyState: !!document.querySelector('h3')?.textContent?.includes('No Content'),
      bodyHeight: document.body.scrollHeight,
      visibleText: document.body.innerText.substring(0, 500)
    };
    return results;
  });
  
  console.log('Page analysis:', sections);
  
  await browser.close();
  console.log('\nScreenshot saved to screenshots/home-full-page.png');
}

testHomePage().catch(console.error);