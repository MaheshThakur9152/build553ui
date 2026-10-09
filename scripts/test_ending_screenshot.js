import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Users\\mahesh\\AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\Brave.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  
  console.log('Waiting for warmup:done...');
  await page.waitForFunction(() => window.__warmupDone === true, { timeout: 30000 });
  await page.waitForTimeout(2000);

  // Click initiate button
  const cta = await page.waitForSelector('#custom-cta', { state: 'visible' });
  await cta.click();
  console.log('Clicked #custom-cta');
  await page.waitForTimeout(2000);

  // Jump ScrollManager to the very end
  await page.evaluate(() => {
    const app = pc.Application.getApplication();
    const sm = app.root.findScripts('scrollManager')[0];
    if (sm) {
      sm._targetRaw = 35000;
      sm._raw = 35000;
      sm._progress = 1.0;
    }
  });

  console.log('Scrolled to 1.0, waiting for ending credits fade-in...');
  await page.waitForTimeout(5000);

  await page.screenshot({ path: path.join(__dirname, '..', 'screenshots', '05-ending-coming-soon.png') });
  console.log('Saved 05-ending-coming-soon.png');

  await browser.close();
}

main().catch(console.error);
