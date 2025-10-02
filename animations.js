import { createElement } from './utils.js';

export function animateHit(target) {
  if (!target || !target.classList) {return;} // Защитная проверка
  target.classList.add('hit-animation');
  setTimeout(() => {
    target.classList.remove('hit-animation');
  }, 500);
}

export function animateLevelUp() {
  const levelUpEl = createElement('div', 'level-up');
  levelUpEl.innerText = 'LEVEL UP!';
  document.body.appendChild(levelUpEl);
  setTimeout(() => {
    levelUpEl.remove();
  }, 2000);
}