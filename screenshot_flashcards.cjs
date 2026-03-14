const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to app...');
  await page.goto('http://localhost:5173');
  
  console.log('Logging in...');
  await page.fill('input[type="email"]', 'tarun@gmail.com');
  await page.fill('input[type="password"]', 'mvemjsun@9');
  await page.click('button.w-full.btn-gradient');
  
  console.log('Waiting for Dashboard...');
  await page.waitForTimeout(5000);
  
  console.log('Switching to Flashcards tab...');
  // Find the button with text "Flashcards"
  await page.click('button:has-text("Flashcards")');
  await page.waitForTimeout(2000);
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'flashcards_seeded.png', fullPage: true });
  
  console.log('Done!');
  await browser.close();
})();
