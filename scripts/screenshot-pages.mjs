import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const OUT = 'C:/Users/leona/Desktop/lemo-screenshots';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const USER = JSON.stringify({ name: 'Mario Rossi', firstName: 'Mario', lastName: 'Rossi', hospital: 'Careggi', department: 'Oncologia', patientType: 'adulti', mode: 'guided' });
const PROGRESS = JSON.stringify([1,2,3,4]);

async function screenshot(url, file, inject = false, mobile = false) {
  const page = await browser.newPage();
  await page.setViewport(mobile
    ? { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
    : { width: 1440, height: 900 }
  );
  if (inject) {
    await page.evaluateOnNewDocument((u, p) => {
      localStorage.setItem('lemo_user', u);
      localStorage.setItem('lemo_progress_Mario Rossi', p);
    }, USER, PROGRESS);
  } else {
    await page.evaluateOnNewDocument(() => localStorage.clear());
  }
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await sleep(2500);
  await page.screenshot({ path: `${OUT}/${file}`, fullPage: true });
  await page.close();
  console.log('✓', file);
}

// Desktop
await screenshot('https://lemo-training.vercel.app/', '01-login.png', false, false);
await screenshot('https://lemo-training.vercel.app/home?mode=guided', '02-home.png', true, false);
await screenshot('https://lemo-training.vercel.app/modules?mode=guided', '03-modules.png', true, false);
await screenshot('https://lemo-training.vercel.app/support', '04-support.png', true, false);

// Mobile
await screenshot('https://lemo-training.vercel.app/', '05-login-mobile.png', false, true);
await screenshot('https://lemo-training.vercel.app/home?mode=guided', '06-home-mobile.png', true, true);
await screenshot('https://lemo-training.vercel.app/modules?mode=guided', '07-modules-mobile.png', true, true);
await screenshot('https://lemo-training.vercel.app/support', '08-support-mobile.png', true, true);

await browser.close();
console.log(`\nDone! Saved to: ${OUT}`);
