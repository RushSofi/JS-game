import Player from './player.js';
import { createElement } from './utils.js';
import { generateLogs } from './logs.js';
import { checkAchievements, renderAchievements } from './achievements.js';
import { calculateRating, renderRating } from './rating.js';
import { animateHit, animateLevelUp } from './animations.js';
import { ComboSystem } from './combo.js';
import { isCriticalHit, getCriticalDamage } from './critical.js';
import { isRageMode, getRageDamage } from './rage.js';
import { getSpecialAttack } from './specialAttacks.js';
import { showHint } from './hints.js';
import { gameLogger } from './logger.js'; 

export default class Game {
  constructor() {
    gameLogger.info('Экземпляр игры создан');
    this.arenaEl = document.querySelector('.arenas');
    this.randomButton = document.querySelector('.button');
    this.form = document.querySelector('.control');
    this.stats = this.loadStats(); 
    this.playerLevel = this.loadLevel();
    this.achievements = [];
    this.comboSystem = new ComboSystem();
  }

  // Загрузка уровня из localStorage
  loadLevel() {
    const level = localStorage.getItem('mkLevel');
    return level ? JSON.parse(level) : { level: 1, xp: 0 };
  }

  // Сохранение уровня в localStorage
  saveLevel() {
    localStorage.setItem('mkLevel', JSON.stringify(this.playerLevel));
  }

  // Добавление опыта
  addXP(amount) {
    this.playerLevel.xp += amount;
    gameLogger.info(`Добавлено ${amount} XP (итого: ${this.playerLevel.xp}/100)`);
    if (this.playerLevel.level >= 10) {return;}
    if (this.playerLevel.xp >= 100) {
      this.playerLevel.level += 1;
      this.playerLevel.xp = 0;
      gameLogger.info(`Новый уровень: ${this.playerLevel.level}`);
      generateLogs('levelUp', this.playerLevel.level);
      animateLevelUp();
    }
    this.saveLevel();
    this.renderLevel();
  }

  // Отображение уровня и опыта
  renderLevel() {
    let levelEl = document.querySelector('.level');
    if (!levelEl) {
      levelEl = createElement('div', 'level');
      this.arenaEl.appendChild(levelEl);
    }
    levelEl.innerHTML = `
            <h3>Уровень: ${this.playerLevel.level}</h3>
            <p>Опыт: ${this.playerLevel.xp}/100</p>
        `;
  }

  loadStats() {
    const stats = localStorage.getItem('mkStats');
    if (!stats) {return { wins: 0, losses: 0, draws: 0 };}
    
    const parsed = JSON.parse(stats);
    // Гарантируем наличие всех полей
    return {
      wins: parsed.wins || 0,
      losses: parsed.losses || 0,
      draws: parsed.draws || 0
    };
  }

  // Сохранение статистики в localStorage
  saveStats() {
    const safeValue = (value) => {
      // Сначала пробуем преобразовать в число
      const num = Number(value);
      
      // Обрабатываем особые случаи
      if (!Number.isFinite(num)) {return 0;} // NaN, Infinity, -Infinity
      if (num <= 0) {return 0;}
      return Math.min(num, Number.MAX_SAFE_INTEGER);
    };
  
    const normalized = {
      wins: safeValue(this.stats.wins),
      losses: safeValue(this.stats.losses),
      draws: safeValue(this.stats.draws)
    };
    
    localStorage.setItem('mkStats', JSON.stringify(normalized));
  }

  // Обновление статистики
  updateStats(result) {
    gameLogger.info(`Обновление статистики: результат — ${result}`);
    if (result === 'win') {
      this.stats.wins += 1;
    } else if (result === 'lose') {
      this.stats.losses += 1;
    } else if (result === 'draw') {
      this.stats.draws += 1;
    }
    this.saveStats();

    const rating = calculateRating(this.stats);
    renderRating(rating);

    this.renderStats();
  }

  // Отображение статистики
  renderStats() {
    let statsEl = document.querySelector('.stats');
    if (!statsEl) {
      statsEl = createElement('div', 'stats');
      this.arenaEl.appendChild(statsEl);
    }
    statsEl.innerHTML = `
            <h3>Статистика:</h3>
            <p>Победы: ${this.stats.wins}</p>
            <p>Поражения: ${this.stats.losses}</p>
            <p>Ничьи: ${this.stats.draws}</p>
            <button id="resetStats">Сбросить статистику</button>
        `;

    const resetButton = document.getElementById('resetStats');
    if (resetButton) {  // Добавляем проверку
      resetButton.addEventListener('click', () => {
        gameLogger.warn('Статистика сброшена пользователем');
        this.stats = { wins: 0, losses: 0, draws: 0 };
        this.saveStats();
        this.renderStats();
      });
    }
  }

  async start() {
    gameLogger.info('Игра началась');

    const player1Data = JSON.parse(localStorage.getItem('player1') || '{}');
    const player2Data = JSON.parse(localStorage.getItem('player2') || '{}');

    gameLogger.debug('Загружены данные игроков:', player1Data, player2Data);

    const player1 = new Player({
      player: 1,
      name: player1Data.name || 'Player 1',
      hp: player1Data.hp || 100,
      img: player1Data.gifPath || 'default.gif',
    });

    const player2 = new Player({
      player: 2,
      name: player2Data.name || 'Player 2',
      hp: player2Data.hp || 100,
      img: player2Data.gifPath || 'default.gif',
    });

    this.arenaEl.appendChild(player1.createPlayer());
    this.arenaEl.appendChild(player2.createPlayer());

    generateLogs('start', player1, player2);

    this.renderStats(); 
    this.renderLevel();

    this.form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const playerAttack = this.getPlayerAttack();
      gameLogger.debug('Атака игрока:', playerAttack);

      try {
        const fightResult = await this.fetchFightResult(playerAttack.hit, playerAttack.defence);

        this.processAttack(player1, player2, fightResult.player2, fightResult.player1);
        this.processAttack(player2, player1, fightResult.player1, fightResult.player2);

        player1.renderHP();
        player2.renderHP();

        if (player1.hp <= 0 || player2.hp <= 0) {
          this.endGame(player1, player2);
        }
      } catch (error) {
        gameLogger.error('Ошибка во время боя', error);
        // console.error('Ошибка во время боя:', error);
      }
    });
  }

  async fetchFightResult(hit, defence) {
    const response = await fetch('http://localhost:3001/api/player/fight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hit, defence }),
    });

    if (!response.ok) {
      throw new Error('Ошибка запроса к серверу');
    }

    return await response.json();
  }

  getPlayerAttack() {
    const formData = new FormData(this.form);
    return {
      value: 0,
      hit: formData.get('hit'),
      defence: formData.get('defence')
    };
  }

  processAttack(attacker, defender, attack, defend) {
    // Добавляем проверку
    gameLogger.debug(`Обработка атаки от ${attacker.name} → ${defender.name}`);
    if (!defender || !attacker) {return;}
    
    const defenderEl = defender.elHP();
    if (defenderEl && defenderEl.style) {
      animateHit(defenderEl);
    }

    if (attack.hit !== defend.defence) {
            
      let damage = attack.value;
      const specialAttack = getSpecialAttack(attacker.name, attacker.hp);
      if (specialAttack) {
        //console.log(specialAttack.damage, specialAttack.name, specialAttack)
        damage = specialAttack.damage;
        gameLogger.debug(`Спец-атака: ${specialAttack.name} на ${damage} урона`);
        generateLogs('special', attacker, defender, damage, specialAttack.name); 
      }

      if (isCriticalHit()) {
        damage = getCriticalDamage(damage);
        gameLogger.debug(`Критический удар: ${damage} урона`);
        generateLogs('critical', attacker, defender, damage);
      }

      if (isRageMode(attacker.hp)) {
        damage = getRageDamage(damage);
        gameLogger.debug(`Режим ярости: итоговый урон ${damage}`);
        generateLogs('rage', attacker, defender, damage);
      }

      defender.changeHP(attack.value);
      defender.renderHP();
      animateHit(defender.elHP());
      this.comboSystem.increaseCombo();
      gameLogger.info(`${attacker.name} нанёс ${damage} урона по ${defender.name}`);
      generateLogs('hit', attacker, defender, attack.value);
      showHint();
    } else {
      this.comboSystem.resetCombo();
      gameLogger.info(`${defender.name} успешно защитился от удара`);
      generateLogs('defence', attacker, defender);
    }
  }

  endGame(player1, player2) {
    const result = player1.hp <= 0 && player2.hp <= 0 ? 'Ничья' : player1.hp <= 0 ? player2.name : player1.name;
    gameLogger.info(`Бой завершён. Победитель: ${result}`);

    if (player1.hp <= 0 && player2.hp <= 0) {
      generateLogs('draw');
      this.updateStats('draw');
      this.addXP(10);
    } else if (player1.hp <= 0) {
      generateLogs('end', player1, player2);
      this.showResultText(player2.name);
      this.updateStats('lose');
      this.addXP(5);
    } else if (player2.hp <= 0) {
      generateLogs('end', player1, player2);
      this.showResultText(player1.name);
      this.updateStats('win');
      this.addXP(20);
    }

    this.achievements = checkAchievements(this.stats);
    renderAchievements(this.achievements);

    this.randomButton.disabled = true;
    this.createReloadButton();
  }

  showResultText(name) {
    const showResultEl = createElement('div', 'showResult');
    showResultEl.innerText = `${name} WINS`;
    showResultEl.textContent = `${name} WINS`; // Явное присвоение текста
    this.arenaEl.appendChild(showResultEl);
  }

  createReloadButton() {
    const reloadDivEl = createElement('div', 'reloadWrap');
    const reloadButtonEl = createElement('button', 'button');
    reloadButtonEl.innerText = 'RESTART';
    reloadButtonEl.textContent = 'RESTART'; // Явное присвоение текста

    reloadButtonEl.addEventListener('click', () => {
      window.location.pathname = './index.html';
    });

    reloadDivEl.appendChild(reloadButtonEl);
    this.arenaEl.appendChild(reloadDivEl);
  }
}
