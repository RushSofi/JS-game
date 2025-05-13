import Game from '../game.js';
import Player from '../player.js';

describe('Game Class', () => {
  let game;
  let player1, player2;

  beforeAll(() => {
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'getItem');
  });

  beforeEach(() => {
    // Полностью инициализируем DOM
    document.body.innerHTML = `
      <div class="arenas">
        <div class="player1">
          <div class="life" style="width: 100%"></div>
        </div>
        <div class="player2">
          <div class="life" style="width: 100%"></div>
        </div>
      </div>
      <form class="control"></form>
      <div class="chat"></div>
    `;

    // Правильный mock для localStorage
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn();  

    // Инициализация перед каждым тестом
    game = new Game();
    player1 = new Player({ player: 1, name: 'Scorpion', hp: 100 });
    player2 = new Player({ player: 2, name: 'Subzero', hp: 100 });

    // Мокируем DOM элементы
    document.body.innerHTML = `
      <form class="control">
        <input type="radio" name="hit" value="head" checked>
        <input type="radio" name="defence" value="body" checked>
      </form>
      <div class="arenas"></div>
      <div class="chat"></div>
    `;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('processAttack()', () => {
    test('should handle successful attack', () => {
      game.processAttack(player1, player2, { hit: 'head', value: 20 }, { defence: 'foot' });
      expect(player2.hp).toBe(80);
    });

    test('should handle blocked attack', () => {
      game.processAttack(player1, player2, { hit: 'head', value: 20 }, { defence: 'head' });
      expect(player2.hp).toBe(100);
    });

    test('should trigger critical hit', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.09);
      game.processAttack(player1, player2, { hit: 'head', value: 20 }, { defence: 'foot' });
      expect(player2.hp).toBeLessThan(100);
    });
  });

  describe('Level System', () => {
    test('should level up when XP reaches 100', () => {
      game.playerLevel = { level: 1, xp: 95 };
      game.addXP(5);
      expect(game.playerLevel).toEqual({ level: 2, xp: 0 });
    });

    test('should not level up when max level reached', () => {
      game.playerLevel = { level: 10, xp: 0 };
      game.addXP(100);
      expect(game.playerLevel.level).toBe(10);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      game = new Game();
    });

    test('should save stats to localStorage', () => {
      // Подготовка
      game.stats = { wins: 5, losses: 3, draws: 2 };
      
      game.saveStats();
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mkStats',
        JSON.stringify({ wins: 5, losses: 3, draws: 2 })
      );
    });
    
    test('should load stats from localStorage', () => {
      // Настройка mock
      Storage.prototype.getItem = jest.fn((key) => 
        key === 'mkStats' ? '{"wins":3}' : null
      );

      // Проверка
      expect(game.loadStats()).toEqual({ wins: 3, losses: 0, draws: 0 });
    });

    beforeEach(() => {
      Storage.prototype.setItem = jest.fn();
      Storage.prototype.getItem = jest.fn();
      
      game = new Game();
    });
    
    test('saveStats should normalize values', () => {
      game.stats = { wins: "10", losses: null, draws: "abc" };
      
      Storage.prototype.getItem.mockReturnValueOnce(null);
      game.saveStats();
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mkStats',
        JSON.stringify({ wins: 10, losses: 0, draws: 0 })
      );
    });

    test('should handle integer overflow correctly', () => {
      game.stats = {
        wins: Number.MAX_SAFE_INTEGER + 1, // Превышение
        losses: '10000000000000000000', // Больше MAX_SAFE_INTEGER
        draws: 1e20 // Также превышение
      };
    
      game.saveStats();
    
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mkStats',
        JSON.stringify({
          wins: Number.MAX_SAFE_INTEGER,
          losses: Number.MAX_SAFE_INTEGER,
          draws: Number.MAX_SAFE_INTEGER
        })
      );
    });

    test('should convert Infinity to 0', () => {
      game.stats = { wins: Infinity, losses: -Infinity, draws: NaN };
      game.saveStats();
      expect(JSON.parse(localStorage.setItem.mock.calls[0][1])).toEqual({
        wins: 0,
        losses: 0,
        draws: 0
      });
    });
  });

  describe('UI Methods', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="arenas"></div>
        <form class="control"></form>
      `;
      game = new Game();
    });

    test('should create restart button', () => {
      // Действие
      game.createReloadButton();
      
      // Проверка
      const button = document.querySelector('.button');
      expect(button).not.toBeNull();
      expect(button.textContent).toBe('RESTART'); 
    });
    
    test('should display winner text', () => {
      // Действие
      game.showResultText('Scorpion');
      
      // Проверка
      const resultElement = document.querySelector('.showResult');
      expect(resultElement.textContent).toBe('Scorpion WINS');
    });
  });
  
  describe('updateStats()', () => {
    beforeEach(() => {
      // Полная инициализация DOM
      document.body.innerHTML = `
        <div class="arenas">
          <div class="stats"></div>
        </div>
      `;
    });

    test('should increase wins for "win" result', () => {
      game.updateStats('win');
      expect(game.stats.wins).toBe(1);
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  
    test('should increase losses for "lose" result', () => {
      game.updateStats('lose');
      expect(game.stats.losses).toBe(1);
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  
    test('should increase draws for "draw" result', () => {
      game.updateStats('draw');
      expect(game.stats.draws).toBe(1);
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('renderStats()', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div class="arenas"></div>';
      game = new Game();
    });
  
    test('should create stats element if not exists', () => {
      game.renderStats();
      expect(document.querySelector('.stats')).not.toBeNull();
    });
  
    test('should create reset button', () => {
      game.renderStats();
      const resetButton = document.getElementById('resetStats');
      expect(resetButton).not.toBeNull();
    });
  
    test('reset button should reset stats', () => {
      game.stats = { wins: 5, losses: 3, draws: 2 };
      game.renderStats();
      
      const resetButton = document.getElementById('resetStats');
      resetButton.click();
      
      expect(game.stats).toEqual({ wins: 0, losses: 0, draws: 0 });
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('start()', () => {
    beforeEach(() => {
      // Настраиваем localStorage
      localStorage.setItem('player1', JSON.stringify({ 
        name: 'P1', hp: 100, gifPath: 'p1.gif' 
      }));
      localStorage.setItem('player2', JSON.stringify({ 
        name: 'P2', hp: 100, gifPath: 'p2.gif' 
      }));
      
      // Полноценно инициализируем DOM
      document.body.innerHTML = `
        <div class="arenas">
          <div class="stats">
            <button id="resetStats"></button>
          </div>
        </div>
        <form class="control"></form>
        <div class="chat"></div>
      `;
      
      // Создаем экземпляр игры
      game = new Game();
    });
  
    test('should initialize players from localStorage', async () => {
      await game.start();
      
      // Проверяем, что игроки созданы
      expect(document.querySelector('.player1')).not.toBeNull();
      expect(document.querySelector('.player2')).not.toBeNull();
      
      // Проверяем, что статистика отрендерена
      expect(document.querySelector('.stats')).not.toBeNull();
    });
  });

  describe('fetchFightResult()', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });
  
    test('should throw error on server failure', async () => {
      fetch.mockResolvedValue({ ok: false });
      await expect(game.fetchFightResult('head', 'body')).rejects.toThrow('Ошибка запроса к серверу');
    });
  
    test('should return data on success', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ player1: {}, player2: {} })
      });
      const result = await game.fetchFightResult('head', 'body');
      expect(result).toEqual({ player1: {}, player2: {} });
    });
  });

  describe('getPlayerAttack()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form class="control">
          <input type="radio" name="hit" value="head" checked>
          <input type="radio" name="defence" value="body" checked>
        </form>
        <div class="arenas"></div>
      `;
      game = new Game();
      game.form = document.querySelector('.control');
    });
  
    test('should parse attack from form', () => {
      const attack = game.getPlayerAttack();
      expect(attack).toEqual({
        value: 0,
        hit: 'head',
        defence: 'body'
      });
    });
  });

  describe('endGame()', () => {
    let game;
    let player1, player2;
  
    beforeEach(() => {
      // Мокируем renderAchievements перед импортом Game
      mockRenderAchievements = jest.fn();
      jest.mock('../achievements.js', () => ({
        renderAchievements: mockRenderAchievements,
        checkAchievements: jest.fn().mockReturnValue([])
      }));

      // Переимпортируем Game после мокирования
      jest.resetModules();
      const Game = require('../game.js').default;
      
      // Инициализация DOM со всеми необходимыми элементами
      document.body.innerHTML = `
        <button class="randomButton"></button>
        <div class="arenas"></div>
        <div class="chat"></div> <!-- Добавляем элемент чата -->
      `;
      
      // Инициализация игры и игроков
      game = new Game();
      player1 = new Player({ player: 1, name: 'P1', hp: 100 });
      player2 = new Player({ player: 2, name: 'P2', hp: 100 });
      
      // Мокируем необходимые методы
      game.updateStats = jest.fn();
      game.addXP = jest.fn();
      game.showResultText = jest.fn();
      game.createReloadButton = jest.fn();
      
      // Инициализация кнопки
      game.randomButton = document.querySelector('.randomButton');
    });
  
    test('should handle draw when both players dead', () => {
      player1.hp = 0;
      player2.hp = 0;
      
      game.endGame(player1, player2);
      
      expect(game.updateStats).toHaveBeenCalledWith('draw');
      expect(game.addXP).toHaveBeenCalledWith(10);
      expect(game.randomButton.disabled).toBe(true);
      expect(game.createReloadButton).toHaveBeenCalled();
    });
  
    test('should handle player1 win', () => {
      player2.hp = 0;
      
      game.endGame(player1, player2);
      
      expect(game.showResultText).toHaveBeenCalledWith('P1');
      expect(game.updateStats).toHaveBeenCalledWith('win');
      expect(game.addXP).toHaveBeenCalledWith(20);
      expect(game.randomButton.disabled).toBe(true);
    });
  
    test('should handle player2 win', () => {
      player1.hp = 0;
      
      game.endGame(player1, player2);
      
      expect(game.showResultText).toHaveBeenCalledWith('P2');
      expect(game.updateStats).toHaveBeenCalledWith('lose');
      expect(game.addXP).toHaveBeenCalledWith(5);
      expect(mockRenderAchievements).toHaveBeenCalled();
    });
  });

});