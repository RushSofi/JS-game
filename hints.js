export const HINTS = [
  'Попробуй ударить в голову!',
  'Защитись от следующей атаки!',
  'Используй специальную атаку!',
  'Не дай противнику собрать комбо!',
];

export function getRandomHint() {
  return HINTS[Math.floor(Math.random() * HINTS.length)];
}

export function showHint() {
  const hintEl = document.querySelector('.hint');
  if (hintEl) {
    hintEl.innerText = getRandomHint();
  }
}