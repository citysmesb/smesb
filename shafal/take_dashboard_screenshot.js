const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  await page.goto('https://citysmesb.github.io/smesb/shafal/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('shafal_logged_in', 'true');
  });
  await page.goto('https://citysmesb.github.io/smesb/shafal/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'C:/Users/Hadoop/.gemini/antigravity/brain/dff26b87-8569-4c59-b97f-9c090260e699/scratch/live_dashboard.png' });
  await browser.close();
})();