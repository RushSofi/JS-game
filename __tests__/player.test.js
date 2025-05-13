import Player from '../player.js';

describe('Player Class', () => {
  let player;

  // Мокируем DOM перед всеми тестами
  beforeAll(() => {
    document.body.innerHTML = `
      <div class="player1">
        <div class="progressbar">
          <div class="life" style="width: 100%"></div>
          <div class="name"></div>
        </div>
      </div>
    `;
  });

  beforeEach(() => {
    // Полная инициализация DOM
    document.body.innerHTML = `
      <div class="player1">
        <div class="progressbar">
          <div class="life" style="width: 100%"></div>
        </div>
      </div>
    `;

    player = new Player({
      player: 1,
      name: 'Scorpion',
      hp: 100,
      img: 'test.gif'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('changeHP()', () => {
    const testCases = [
      { damage: 20, expected: 80, name: 'normal damage' },
      { damage: 150, expected: 0, name: 'overkill damage' },
      { damage: 0, expected: 100, name: 'zero damage' }
    ];

    testCases.forEach(({ damage, expected, name }) => {
      test(`should handle ${name}`, () => {
        player.changeHP(damage);
        expect(player.hp).toBe(expected);
      });
    });
  });

  describe('createPlayer()', () => {
    test('should generate valid DOM structure', () => {
      const element = player.createPlayer();
      
      expect(element).toMatchSnapshot();
      expect(element.classList.contains('player1')).toBe(true);
      expect(element.querySelector('.name').textContent).toBe('Scorpion');
      expect(element.querySelector('img').src).toContain('test.gif');
    });
  });

  describe('renderHP()', () => {
    test('should update HP visualisation', () => {
      player.hp = 75;
      player.renderHP();
      
      const lifeElement = document.querySelector('.life');
      expect(lifeElement.style.width).toBe('75%');
    });
  });

  describe('elHP()', () => {
    test('elHP() should handle missing DOM element', () => {
      document.body.innerHTML = ''; // Очищаем DOM
      const lifeElement = player.elHP();
      expect(lifeElement.style).toBeDefined(); 
    });
  });
});