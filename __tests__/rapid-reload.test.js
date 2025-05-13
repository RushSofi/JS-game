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

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--js-flags="--expose-gc"'] });
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();

  await page.goto(`${BASE_URL}/arenas.html`, { waitUntil: 'networkidle0' });
  await takeHeapSnapshot(client, 'reload_before');
  await page.reload({ waitUntil: 'networkidle0' });
  await takeHeapSnapshot(client, 'reload_after');

  await client.detach();
  await browser.close();
})();
