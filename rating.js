export function calculateRating(stats) {
  return stats.wins * 10 - stats.losses * 5;
}

export function renderRating(rating) {
  const ratingEl = document.querySelector('.rating');
  if (!ratingEl) {return;}

  ratingEl.innerHTML = `
      <h3>Рейтинг: ${rating}</h3>
  `;
}