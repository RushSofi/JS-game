// // __tests__/memory-leaks.test.js
// import puppeteer from 'puppeteer';
// import fs from 'fs';
// import path from 'path';
// import assert from 'assert';

// const BASE_URL = 'http://localhost:5500';  // твой порт
// const SNAP_DIR = path.resolve(process.cwd(), '__tests__', '__snapshots__');
// if (!fs.existsSync(SNAP_DIR)) fs.mkdirSync(SNAP_DIR, { recursive: true });

// // Helper: delay ms
// const delay = ms => new Promise(r => setTimeout(r, ms));


// // async function takeHeapSnapshot(client, name) {
// //   const file = path.join(SNAP_DIR, `heap_${name}.heapsnapshot`);
// //   const write = fs.createWriteStream(file);
// //   await client.send('HeapProfiler.enable');
// //   client.on('HeapProfiler.addHeapSnapshotChunk', ({ chunk }) => write.write(chunk));
// //   client.once('HeapProfiler.reportHeapSnapshotProgress', ({ finished }) => finished && write.end());
// //   await client.send('HeapProfiler.takeHeapSnapshot', { reportProgress: true });
// //   console.log(`  → snapshot "${name}" → ${file}`);
// // }

// async function takeHeapSnapshot(client, name) {
//   const file = path.join(SNAP_DIR, `heap_${name}.heapsnapshot`);
//   const write = fs.createWriteStream(file);

//   await client.send('HeapProfiler.enable');

//   // Записываем бинарные данные
//   client.on('HeapProfiler.addHeapSnapshotChunk', ({ chunk }) => {
//     write.write(Buffer.from(chunk, 'utf8'));
//   });

//   // Ждём окончания
//   client.once('HeapProfiler.reportHeapSnapshotProgress', ({ done, total }) => {
//     if (done === total) write.end();
//   });

//   // Делаем снятие снимка
//   await client.send('HeapProfiler.takeHeapSnapshot', { reportProgress: true });
//   console.log(`  → snapshot "${name}" → ${file}`);
// }


// // Норма: выбор персонажа → арена → бой до RESTART
// async function normalFight(page) {
//   // 1) Заходим на главную страницу
//   await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

//   // 2) Ждём и кликаем первый персонаж через evaluate
//   await page.waitForSelector('.character:not(.div11)', { timeout: 15000 });
//   await page.evaluate(() => document.querySelector('.character:not(.div11)').click());

//   // 3) Ждём появления карточки
//   await page.waitForSelector('.player-card', { timeout: 10000 });

//   // 4) Скрин до выбора
//   await page.screenshot({ path: path.join(SNAP_DIR, 'debug-before-select.png') });

//   // 5) Кликаем «Выбрать»
//   await page.click('.player-card .select-btn');

//   // 6) Ждём смены пути на /arena.html
//   await page.waitForFunction(
//     () => window.location.pathname.endsWith('arena.html'),
//     { timeout: 10000 }
//   );
//   console.log('► Навигация на', page.url());

//   // 7) Скрин экрана выбора арены
//   await page.screenshot({ path: path.join(SNAP_DIR, 'debug-arena-choice.png') });

//   // 8) Выбираем первую арену
//   await page.click('.arena-option');

//   // 9) Ждём активной кнопки и кликаем «Start Fight»
//   await page.waitForSelector('#startFight:not([disabled])', { timeout: 5000 });
//   await page.click('#startFight');

//   // 10) Скрин до боя
//   await page.screenshot({ path: path.join(SNAP_DIR, 'debug-battle-start.png') });

//   // 11) Цикл боя до RESTART
//   await page.waitForSelector('.control', { timeout: 10000 });
//   while (true) {
//     await page.evaluate(() => {
//       document.querySelector('input[name="hit"][value="head"]').click();
//       document.querySelector('input[name="defence"][value="body"]').click();
//       document.querySelector('.control .button').click();
//     });
//     if (await page.$('.reloadWrap .button')) break;
//   }

//   // 12) Скрин экрана после боя
//   await page.screenshot({ path: path.join(SNAP_DIR, 'debug-after-battle.png') });
// }



// // Нестандарт: зайти сразу на арену и перезагрузить
// async function rapidReload(page) {
//   await page.goto(`${BASE_URL}/arenas.html`, { waitUntil: 'networkidle0' });
//   await page.reload({ waitUntil: 'networkidle0' });
// }

// // Стресс: 5 полных циклов боя с RESTART
// async function multipleCycles(page, cycles = 5) {
//   for (let i = 0; i < cycles; i++) {
//     console.log(`  — цикл ${i + 1}/${cycles}`);
//     await normalFight(page);
//     await page.click('.reloadWrap .button');
//     await page.waitForSelector('.character:not(.div11)', { timeout: 10000 });
//   }
// }

// (async () => {
//   if (typeof global.gc !== 'function') {
//     console.error('Запускай тест с флагом --expose-gc');
//     process.exit(1);
//   }

//   const browser = await puppeteer.launch({
//     headless: true,
//     args: ['--js-flags="--expose-gc"','--disable-web-security']
//   });
//   const page = await browser.newPage();
//   const client = await page.target().createCDPSession();
  
//   page.on('console', msg => {
//     if (msg.type() === 'error') console.error('PAGE ERROR ›', msg.text());
//   });

//   console.log('\n=== NORMAL FIGHT scenario ===');
//   await takeHeapSnapshot(client, 'before_normal');
//   await normalFight(page);
//   await takeHeapSnapshot(client, 'after_normal');

//   console.log('\n=== RAPID RELOAD scenario ===');
//   await takeHeapSnapshot(client, 'before_reload');
//   await rapidReload(page);
//   await takeHeapSnapshot(client, 'after_reload');

//   console.log('\n=== MULTIPLE CYCLES scenario ===');
//   await takeHeapSnapshot(client, 'before_cycles');
//   await multipleCycles(page, 5);
//   await takeHeapSnapshot(client, 'after_cycles');

//   // Финальный замер Node.js heap
//   global.gc();
//   const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
//   console.log(`\nNode.js heapUsed final: ${memMB} MB`);

//   await client.detach();
//   await browser.close();

//   // Проверка: итоговый рост памяти в пределах 200MB
//   assert(parseFloat(memMB) < 200, 'слишком много памяти занято!');
// })();


// __tests__/memory-load.test.js
import Game from '../game.js';
import Player from '../player.js';

const delay = ms => new Promise(r => setTimeout(r, ms)); // если нужен тайминг

describe('Dynamic Memory Load Tests', () => {
  // Подготовка фиктивного API для Game.fetchFightResult
  beforeAll(() => {
    jest.spyOn(Game.prototype, 'fetchFightResult').mockImplementation(async () => ({
      player1: { hit: 'head', defence: 'body', value: Math.floor(Math.random()*16)+5 },
      player2: { hit: 'body', defence: 'head', value: Math.floor(Math.random()*16)+5 },
    }));
  });

  test('100 simulated fights should not leak memory excessively', async () => {
    if (typeof global.gc !== 'function') {
      console.warn('Запустите Jest с --expose-gc для корректных замеров');
    }

    const results = [];
    const runs = 100;
    for (let i = 1; i <= runs; i++) {
      global.gc && global.gc();
      const before = process.memoryUsage().heapUsed;
      const start = Date.now();

      // Симулируем один бой полностью
      const game = new Game();
      // создаём двух игроков вручную, без DOM
      const p1 = new Player({ player:1, name:'A', hp:100, img:'' });
      const p2 = new Player({ player:2, name:'B', hp:100, img:'' });
      // прогоняем удары до конца
      while (p1.hp > 0 && p2.hp > 0) {
        const { player1, player2 } = await game.fetchFightResult('head','body');
        game.processAttack(p1, p2, player2, player1);
        game.processAttack(p2, p1, player1, player2);
      }
      // итоговая статистика
      global.gc && global.gc();
      const after = process.memoryUsage().heapUsed;
      const duration = Date.now() - start;

      results.push({
        iteration: i,
        heapBeforeMB: (before/1024/1024).toFixed(2),
        heapAfterMB: (after/1024/1024).toFixed(2),
        deltaMB: ((after-before)/1024/1024).toFixed(2),
        timeMs: duration,
      });
    }

    // Выведем результаты в консоль
    console.table(results.slice(0,10)); // первые 10
    // и проверка: средний дельта не больше 1 MB
    const avgDelta = results.reduce((sum,r) => sum + parseFloat(r.deltaMB), 0)/runs;
    expect(avgDelta).toBeLessThan(1);
  });
});

