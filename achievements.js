export const ACHIEVEMENTS = [
  { id: 1, name: 'Новичок', condition: (stats) => stats.wins >= 1 },
  { id: 2, name: 'Боец', condition: (stats) => stats.wins >= 5 },
  { id: 3, name: 'Ветеран', condition: (stats) => stats.wins >= 10 },
  { id: 4, name: 'Серия побед', condition: (stats) => stats.wins >= 3 && stats.losses === 0 },
];

export function checkAchievements(stats) {
  const unlocked = [];
  ACHIEVEMENTS.forEach((achievement) => {
    if (achievement.condition(stats)) {
      unlocked.push(achievement);
    }
  });
  return unlocked;
}

export function renderAchievements(unlocked) {
  const achievementsEl = document.querySelector('.achievements');
  if (!achievementsEl) {return;}

  achievementsEl.innerHTML = `
      <h3>Достижения:</h3>
      ${unlocked.map((achievement) => `<p>${achievement.name}</p>`).join('')}
  `;
}