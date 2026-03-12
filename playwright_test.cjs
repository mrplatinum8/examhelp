const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let logs = [];
  page.on('console', msg => logs.push('LOG: ' + msg.text()));
  page.on('pageerror', error => logs.push('ERROR: ' + error.message + '\n' + error.stack));
  
  await page.goto('http://localhost:5173', {waitUntil: 'networkidle'});
  
  await page.fill('input[type="email"]', 'tarun@gmail.com');
  await page.fill('input[type="password"]', 'mvemjsun@9');
  await page.click('button.w-full.btn-gradient'); 
  
  await new Promise(r => setTimeout(r, 6000));
  
  fs.writeFileSync('react_error.log', logs.join('\n\n'));
  await browser.close();
})();
