const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let has404 = false;
  page.on('response', response => {
    if (response.status() === 404) {
      console.log('404:', response.url());
      has404 = true;
    }
  });

  await page.goto('https://citysmesb.github.io/smesb/shafal/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => localStorage.setItem('shafal_logged_in', 'true'));
  await page.goto('https://citysmesb.github.io/smesb/shafal/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  if (!has404) console.log("NO 404 ERRORS!");
  
  await browser.close();
})();