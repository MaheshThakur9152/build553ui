import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const outDir = path.join(__dirname, '..', 'screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: 'C:\\Users\\mahesh\\AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to http://localhost:3000/ ...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Take screenshot of loading / splash state
  await page.screenshot({ path: path.join(outDir, '01-ditto-splash.png') });
  console.log('Saved 01-ditto-splash.png');

  // If there is a click-to-enter or initiate button, click it
  try {
    const cta = await page.$('#custom-splash-wrapper');
    if (cta) {
      await cta.click();
      console.log('Clicked splash wrapper');
    }
  } catch (e) {
    console.log('No splash wrapper click needed');
  }

  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(outDir, '02-ditto-experience.png') });
  console.log('Saved 02-ditto-experience.png');

  await browser.close();
  console.log('Verification screenshots complete.');
}

main().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
