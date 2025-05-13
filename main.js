import Game from './game.js';

const game = new Game();

document.addEventListener('DOMContentLoaded', () => {
  const selectedArena = localStorage.getItem('selectedArena') || 'arena1';
  const arenas = document.querySelector('.arenas');

  // Очищаем старые классы
  arenas.classList.remove('arena1', 'arena2', 'arena3', 'arena4', 'arena5');

  // Применяем выбранную арену
  arenas.classList.add(selectedArena);
});


game.start();