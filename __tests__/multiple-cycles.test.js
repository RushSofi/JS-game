import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5500';
const SNAP_DIR = path.resolve(process.cwd(), '__tests__', '__snapshots__');

async function takeHeapSnapshot(client, name) {
  const file = path.join(SNAP_DIR, `heap_${name}.heapsnapshot`);
  const write = fs.createWriteStream(file);
  await client.send('HeapProfiler.enable');
  client.on('HeapProfiler.addHeapSnapshotChunk', ({ chunk }) => write.write(chunk));
  client.once('HeapProfiler.reportHeapSnapshotProgress', ({ finished }) => finished && write.end());
  await client.send('HeapProfiler.takeHeapSnapshot', { reportProgress: true });
}

async function fightOnce(page) { 
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
 }

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--js-flags="--expose-gc"'] });
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();

  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await takeHeapSnapshot(client, 'cycles_before');
  for (let i = 0; i < 5; i++) {
    await fightOnce(page);
    await page.click('.reloadWrap .button');
    await page.waitForSelector('.character:not(.div11)');
  }
  await takeHeapSnapshot(client, 'cycles_after');

  await client.detach();
  await browser.close();
})();
