const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('https://citysmesb.github.io/smesb/shafal/login');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'C:/Users/Hadoop/.gemini/antigravity/brain/dff26b87-8569-4c59-b97f-9c090260e699/scratch/live_site_screenshot.png' });
  await browser.close();
})();