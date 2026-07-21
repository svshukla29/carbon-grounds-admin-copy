const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', (msg) => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGEERROR:', err.message));
  page.on('requestfailed', (req) => console.log('REQFAILED:', req.url(), req.failure()?.errorText));

  await page.goto('http://localhost:3001/login');
  await page.fill('#email', 'admin@carbongrounds.com');
  await page.fill('#password', 'Admin@123');

  const [response] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/auth/login')),
    page.click('button[type="submit"]'),
  ]);
  console.log('LOGIN RESPONSE STATUS:', response.status());

  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('CURRENT URL:', page.url());

  const localStorageData = await page.evaluate(() => ({
    accessToken: localStorage.getItem('accessToken'),
    user: localStorage.getItem('user'),
  }));
  console.log('LOCAL STORAGE:', JSON.stringify(localStorageData));

  // Wait for dashboard stats to load
  await page.waitForTimeout(2000);
  const bodyText = await page.textContent('body');
  console.log('DASHBOARD CONTAINS "Total Farmers":', bodyText.includes('Total Farmers'));
  console.log('DASHBOARD CONTAINS "Sign in":', bodyText.includes('Sign in'));

  await browser.close();
})().catch((e) => {
  console.error('TEST FAILED:', e.message);
  process.exit(1);
});
