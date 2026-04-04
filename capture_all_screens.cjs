const fs = require('fs');
const { chromium } = require('playwright');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

(async () => {
  console.log('Starting browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(`[CONSOLE] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[PAGE ERROR] ${err.message}`));

  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '00a_initial_load.png') });

    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      console.log('Filling credentials...');
      await page.fill('input[type="email"]', 'tarun@gmail.com');
      await page.fill('input[type="password"]', 'mvemjsun@9');
      await page.screenshot({ path: path.join(screenshotsDir, '00b_after_fill.png') });
      
      console.log('Clicking Submit (Sign In)...');
      // Use a very specific selector for the submit button
      const submitBtn = page.locator('div.space-y-4 button.btn-gradient');
      await submitBtn.click();
      
      console.log('Waiting for login redirect...');
      // Wait for the login card to disappear or the navigation to happen
      await page.waitForTimeout(5000);
      await page.screenshot({ path: path.join(screenshotsDir, '00c_after_click.png') });

      // If still on login page, maybe try the other "Sign In" text match just in case
      if (await emailInput.isVisible()) {
          console.log('Still on login page. Checking for error message...');
          const errorMsg = await page.locator('div:has(svg.lucide-alert-circle)').innerText().catch(() => 'No error msg');
          console.log('Error message on page:', errorMsg);
      }
    }

    const tabs = [
      'Dashboard', 'Subjects', 'Pomodoro', 'Calendar', 
      'Flashcards', 'Revision', 'Schedule', 'Exams', 
      'Analytics', 'Heatmap'
    ];

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      console.log(`Navigating to tab: ${tab}...`);
      
      // Try multiple ways to find the tab button
      let tabButton = page.locator('aside button, nav button, aside a, nav a').filter({ hasText: new RegExp(`^${tab}$`, 'i') }).first();
      
      if (!(await tabButton.isVisible())) {
          tabButton = page.getByRole('button', { name: tab, exact: false }).first();
      }

      if (await tabButton.isVisible()) {
        await tabButton.click();
        console.log(`Clicked ${tab}. Waiting for content...`);
        await page.waitForTimeout(2000); 
        // Wait for spinner
        await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(1000); 

        const fileName = `${String(i + 1).padStart(2, '0')}_${tab}.png`;
        console.log(`Taking screenshot: ${fileName}`);
        await page.screenshot({ path: path.join(screenshotsDir, fileName), fullPage: true });
      } else {
        console.log(`Could not find button for tab: ${tab}`);
      }
    }
    
    console.log('Script completed.');
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    fs.writeFileSync(path.join(screenshotsDir, 'browser_logs_v2.txt'), logs.join('\n'));
    await browser.close();
  }
})();
