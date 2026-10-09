import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Users\\mahesh\\AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Click splash wrapper if still up
  const splash = await page.$('#custom-splash-wrapper');
  if (splash) {
    await splash.click();
    await page.waitForTimeout(2000);
  }

  // Scroll a little bit to activate overlay
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(__dirname, '..', 'screenshots', '03-header-logo.png') });
  console.log('Saved 03-header-logo.png');

  await browser.close();
}

main().catch(console.error);
