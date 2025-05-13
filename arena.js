document.addEventListener('DOMContentLoaded', () => {
  const arenas = [
    { name: 'Scorpion\'s Lair', file: 'scorpions-lair-arenas.png', class: 'arena1' },
    { name: 'The Cave', file: 'the-cave.png', class: 'arena2' },
    { name: 'Jade\'s Desert', file: 'jade-s-desert.png', class: 'arena3' },
    { name: 'Scislac Busorez', file: 'scislac-busorez.png', class: 'arena4' },
    { name: 'Waterfront', file: 'waterfront.png', class: 'arena5' }
  ];

  const arenaSelection = document.querySelector('.arena-selection');
  const startButton = document.getElementById('startFight');

  arenas.forEach(arena => {
    const img = document.createElement('img');
    img.src = `public/assets/${arena.file}`;
    img.dataset.arena = arena.class;
    img.alt = arena.name;
    img.classList.add('arena-option');

    img.addEventListener('click', () => {
      localStorage.setItem('selectedArena', arena.class);
          
      document.querySelectorAll('.arena-option').forEach(el => el.classList.remove('selected-arena'));
          
      img.classList.add('selected-arena');

      startButton.disabled = false;
    });

    arenaSelection.appendChild(img);
  });

  startButton.addEventListener('click', () => {
    window.location.href = 'arenas.html'; 
  });
});
