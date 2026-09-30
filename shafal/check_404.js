const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('response', response => {
    if (response.status() === 404) {
      console.log('404:', response.url());
    }
  });

  await page.goto('https://citysmesb.github.io/smesb/shafal/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  await page.evaluate(() => localStorage.setItem('shafal_logged_in', 'true'));
  await page.goto('https://citysmesb.github.io/smesb/shafal/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  await browser.close();
})();