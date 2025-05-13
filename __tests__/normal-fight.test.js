import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5500';
const SNAP_DIR = path.resolve(process.cwd(), '__tests__', '__snapshots__');
if (!fs.existsSync(SNAP_DIR)) fs.mkdirSync(SNAP_DIR, { recursive: true });

async function takeHeapSnapshot(client, name) {
  const file = path.join(SNAP_DIR, `heap_${name}.heapsnapshot`);
  const write = fs.createWriteStream(file);
  await client.send('HeapProfiler.enable');
  client.on('HeapProfiler.addHeapSnapshotChunk', ({ chunk }) => write.write(chunk));
  client.once('HeapProfiler.reportHeapSnapshotProgress', ({ finished }) => finished && write.end());
  await client.send('HeapProfiler.takeHeapSnapshot', { reportProgress: true });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--js-flags="--expose-gc"'] });
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();

  // Before
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await takeHeapSnapshot(client, 'normal_before');

  // Scenario: normal fight
  await page.evaluate(() => document.querySelector('.character:not(.div11)').click());
  await page.waitForTimeout(1200);
  await page.click('.player-card .select-btn');
  await page.waitForFunction(() => location.pathname.endsWith('arena.html'), { timeout: 10000 });
  await page.click('.arena-option');
  await page.click('#startFight');
  await page.waitForSelector('.control');
  while (!(await page.$('.reloadWrap .button'))) {
    await page.click('input[name="hit"][value="head"]');
    await page.click('input[name="defence"][value="body"]');
    await page.click('.control .button');
  }

  // After
  await takeHeapSnapshot(client, 'normal_after');

  await client.detach();
  await browser.close();
})();
