// memory-load.js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5500';
const OUT_CSV  = path.resolve(process.cwd(), 'memory_metrics.csv');
fs.writeFileSync(OUT_CSV, 'scenario,heapDelta_MB,rssDelta_MB,timeMs,usedJSHeap_MB,domNodes\n');

const delay = ms => new Promise(r => setTimeout(r, ms));

// ==== стандартный бой ====
async function singleFight(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.character:not(.div11)', { timeout: 15000 });
  await page.evaluate(() => {
    document.querySelector('.character:not(.div11)').click();
  });
  await page.waitForSelector('.player-card', { timeout: 10000 });
  await page.evaluate(() => {
    document.querySelector('.player-card .select-btn').click();
  });
  await page.waitForFunction(
    () => window.location.pathname.endsWith('arena.html'),
    { timeout: 10000 }
  );
  await page.evaluate(() => {
    document.querySelector('.arena-option')?.click();
    document.getElementById('startFight')?.click();
  });
  await page.waitForSelector('.control', { timeout: 10000 });
  await page.evaluate(() => {
    document.querySelector('input[name="hit"][value="head"]')?.click();
    document.querySelector('input[name="defence"][value="body"]')?.click();
    document.querySelector('.control .button')?.click();
  });
}

// ==== быстрая перезагрузка ====
async function rapidReload(page) {
  await page.goto(`${BASE_URL}/arenas.html`, { waitUntil: 'networkidle0' });
  await page.reload({ waitUntil: 'networkidle0' });
}

// ==== перезапуск боя ====
async function restartFight(page) {
  await page.evaluate(() => {
    const btn = document.querySelector('.reloadWrap .button');
    if (btn) btn.click();
  });

  await page.waitForFunction(() => {
    return document.querySelectorAll('.character').length > 1;
  }, { timeout: 5000 });

  await delay(300);
}

// ==== стресс N боёв ====
function createStress(cycles) {
  return async page => {
    for (let i = 0; i < cycles; i++) {
      console.log(`  — цикл ${i + 1}/${cycles}`);
      try {
        await singleFight(page);
        await restartFight(page);
      } catch (err) {
        console.warn(`⚠️ Пропущен бой ${i + 1} (ошибка навигации): ${err.message}`);
      }
    }
  };
}

// ==== нестандартный: множественные клики ====
async function testManyClicks(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

  for (let i = 0; i < 30; i++) {
    await page.evaluate(() => {
      const chars = Array.from(document.querySelectorAll('.character:not(.div11)'));
      chars[Math.floor(Math.random() * chars.length)]?.click();
    });
    await delay(100);
  }

  await page.evaluate(() => {
    document.querySelector('.character:not(.div11)')?.click();
  });

  await page.waitForSelector('.player-card');
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => {
      document.querySelector('.player-card .select-btn')?.click();
    });
    await delay(100);
  }

  await page.waitForFunction(() => window.location.pathname.endsWith('arena.html'), { timeout: 5000 });
}

// ==== нестандартный: неправильные действия ====
async function testInvalidInput(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.mouse.click(10, 10);
  await delay(500);
  await page.reload({ waitUntil: 'networkidle0' });
  await singleFight(page);

  await page.evaluate(() => {
    const btn = document.querySelector('.reloadWrap .button');
    if (btn) btn.click();
  });

  await delay(500);
  await page.evaluate(() => {
    document.querySelector('.character:not(.div11)')?.click();
  });

  await delay(1000);
}

// ==== запуск ====
(async () => {
  if (typeof global.gc !== 'function') {
    console.warn('⚠️ Для точных замеров запустите:\n   node --expose-gc memory-load.js');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--js-flags="--expose-gc"']
  });
  const page = await browser.newPage();

  const scenarios = [
    ['single_fight',     singleFight],
    ['rapid_reload',     rapidReload],
    ['stress_50',        createStress(50)],
    ['test_many_clicks', testManyClicks],
    ['test_invalid_input', testInvalidInput]
  ];

  for (const [name, fn] of scenarios) {
    global.gc && global.gc();
    const beforeHeap = process.memoryUsage().heapUsed;
    const beforeRss  = process.memoryUsage().rss;
    const t0 = Date.now();

    await fn(page);

    global.gc && global.gc();
    const afterHeap = process.memoryUsage().heapUsed;
    const afterRss  = process.memoryUsage().rss;
    const dt = Date.now() - t0;

    // Метрики из браузера
    const perf = await page.evaluate(() => {
      const mem = performance.memory || {};
      return {
        usedJSHeap_MB: mem.usedJSHeapSize ? (mem.usedJSHeapSize / 1024 / 1024).toFixed(2) : 'n/a',
        domNodes: document.getElementsByTagName('*').length
      };
    });

    const row = [
      name,
      ((afterHeap - beforeHeap) / 1024 / 1024).toFixed(2),
      ((afterRss  - beforeRss)  / 1024 / 1024).toFixed(2),
      dt,
      perf.usedJSHeap_MB,
      perf.domNodes
    ].join(',') + '\n';

    fs.appendFileSync(OUT_CSV, row);
    // console.log(`✔ ${name}: Δheap=${row.split(',')[1]}MB, Δrss=${row.split(',')[2]}MB, time=${dt}ms`);
    const parts = row.trim().split(',');
    console.log(
      `✔ ${parts[0]}: ` +
      `Δheap=${parts[1]} MB, ` +
      `Δrss=${parts[2]} MB, ` +
      `time=${parts[3]} ms, ` +
      `ΔusedJSHeap=${parts[4]} MB, ` +
      `ΔdomNodes=${parts[5]}`
    );
    await delay(500);
  }

  await browser.close();
  console.log(`\n🏁 Готово — метрики записаны в ${OUT_CSV}`);
})();
