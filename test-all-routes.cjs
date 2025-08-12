const { chromium } = require('playwright');

async function testAllRoutes() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const routes = [
    { path: '/', name: 'home' },
    { path: '/anime', name: 'anime' },
    { path: '/manga', name: 'manga' },
    { path: '/browse', name: 'browse' },
    { path: '/trending', name: 'trending' },
    { path: '/my-lists', name: 'my-lists' },
    { path: '/settings', name: 'settings' },
    { path: '/activity', name: 'activity' },
    { path: '/analytics', name: 'analytics' },
    { path: '/gamification', name: 'gamification' },
    { path: '/anime/1', name: 'anime-detail' },
    { path: '/manga/1', name: 'manga-detail' },
    { path: '/creator/test', name: 'creator' },
    { path: '/studio/test', name: 'studio' },
    { path: '/admin', name: 'admin' }
  ];

  console.log('Testing all routes and taking screenshots...\n');

  for (const route of routes) {
    try {
      console.log(`Testing ${route.name} (${route.path})...`);
      
      // Navigate to route
      await page.goto(`http://localhost:8081${route.path}`, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      // Wait a bit for any animations
      await page.waitForTimeout(1000);
      
      // Take screenshot
      await page.screenshot({ 
        path: `screenshots/${route.name}.png`,
        fullPage: false 
      });
      
      // Check for errors in console
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Check for visible error messages on page
      const errorElements = await page.$$('text=/error|Error|failed|Failed/i');
      const hasVisibleErrors = errorElements.length > 0;
      
      // Get page title
      const title = await page.title();
      
      // Check if page has content
      const hasContent = await page.evaluate(() => {
        const body = document.body;
        return body && body.innerText && body.innerText.trim().length > 100;
      });
      
      console.log(`  ✓ Screenshot saved: screenshots/${route.name}.png`);
      console.log(`  Title: ${title}`);
      console.log(`  Has content: ${hasContent}`);
      if (hasVisibleErrors) {
        console.log(`  ⚠️ Visible errors on page`);
      }
      if (consoleErrors.length > 0) {
        console.log(`  ⚠️ Console errors: ${consoleErrors.join(', ')}`);
      }
      console.log('');
      
    } catch (error) {
      console.log(`  ✗ Error testing ${route.name}: ${error.message}\n`);
    }
  }

  await browser.close();
  console.log('Testing complete! Check the screenshots folder.');
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

testAllRoutes().catch(console.error);