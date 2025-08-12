const { chromium } = require('playwright');

async function quickTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newContext().then(ctx => ctx.newPage());
  
  // Test home page
  console.log('Opening home page...');
  await page.goto('http://localhost:8081/');
  await page.waitForTimeout(3000);
  
  const homeData = await page.evaluate(() => {
    return {
      hasImages: document.querySelectorAll('img').length,
      hasCards: document.querySelectorAll('[class*="card"]').length,
      bodyText: document.body.innerText.substring(0, 200)
    };
  });
  
  console.log('Home page:', homeData);
  
  // Test browse page
  console.log('\nOpening browse page...');
  await page.goto('http://localhost:8081/browse');
  await page.waitForTimeout(2000);
  
  const browseData = await page.evaluate(() => {
    return {
      hasSearchInput: !!document.querySelector('input'),
      hasCards: document.querySelectorAll('[class*="card"]').length
    };
  });
  
  console.log('Browse page:', browseData);
  
  // Test anime detail
  console.log('\nOpening anime page to get ID...');
  await page.goto('http://localhost:8081/anime');
  await page.waitForTimeout(2000);
  
  const animeLink = await page.evaluate(() => {
    const link = document.querySelector('a[href*="/anime/"]');
    return link ? link.getAttribute('href') : null;
  });
  
  if (animeLink) {
    console.log('Testing detail page:', animeLink);
    await page.goto('http://localhost:8081' + animeLink);
    await page.waitForTimeout(2000);
    
    const detailData = await page.evaluate(() => {
      return {
        hasTitle: !!document.querySelector('h1'),
        hasError: document.body.innerText.includes('Not Found'),
        bodyText: document.body.innerText.substring(0, 200)
      };
    });
    
    console.log('Detail page:', detailData);
  }
  
  console.log('\nLeaving browser open for manual inspection...');
  console.log('Press Ctrl+C to close');
  
  // Keep browser open
  await new Promise(() => {});
}

quickTest().catch(console.error);