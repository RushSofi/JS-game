import { createElement } from './utils.js';

const $parent = document.querySelector('.parent');
const $player = document.querySelector('.player');

async function fetchCharacters() {
  try {
    const response = await fetch('http://localhost:3001/api/players');
    if (!response.ok) {
      throw new Error('Ошибка загрузки данных игроков');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    return [];
  }
}

async function getEnemyCharacter() {
  try {
    const response = await fetch('http://localhost:3001/api/player');
    if (!response.ok) {
      throw new Error('Ошибка при выборе случайного соперника');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    return null;
  }
}

function createEmptyPlayerBlock() {
  const el = createElement('div', ['character', 'div11', 'disabled']);
  const img = createElement('img');
  img.src = 'http://localhost:3001/assets/players/avatar/11.png';
  el.appendChild(img);
  $parent.appendChild(el);
}

function showPlayerCard(character, onConfirm) {
  let $card = document.querySelector('.player-card');
    
  if (!$card) {
    $card = createElement('div', ['player-card']);
    document.body.appendChild($card);
  }

  $card.innerHTML = `
        <div class="card-content">
            <img class="card-avatar" src="${character.avatarPath}" alt="${character.name}">
            <h2 class="card-name">${character.name}</h2>
            <p class="card-description">${character.description || 'Нет описания'}</p>
            <button class="select-btn">Выбрать</button>
        </div>
    `;

  $card.classList.remove('hidden');

  document.querySelector('.select-btn').addEventListener('click', () => {
    onConfirm();
    $card.classList.add('hidden');
  });

  $card.addEventListener('click', (e) => {
    if (e.target === $card) {
      $card.classList.add('hidden');
    }
  });
}

async function init() {
  localStorage.removeItem('player1');
  localStorage.removeItem('player2');

  const characters = await fetchCharacters();
  if (characters.length === 0) {
    console.error('Список игроков пуст или не загружен');
    return;
  }

  let imgSrc = null;
  createEmptyPlayerBlock();

  for (const character of characters) {
    if (character.id === 11) {
      continue;
    }
  
    const el = createElement('div', ['character', `div${character.id}`]);
    const img = createElement('img');
  
    el.addEventListener('mousemove', () => {
      if (imgSrc === null) {
        imgSrc = character;
        const $img = createElement('img');
        $img.src = imgSrc.avatarPath;
        $player.appendChild($img);
      }
    });
  
    el.addEventListener('mouseout', () => {
      if (imgSrc) {
        imgSrc = null;
        $player.innerHTML = '';
      }
    });
  
    el.addEventListener('click', async () => {
      showPlayerCard(character, async () => {
        localStorage.setItem('player1', JSON.stringify(character));
  
        const enemy = await getEnemyCharacter();
        if (enemy) {
          localStorage.setItem('player2', JSON.stringify(enemy));
          el.classList.add('active');
          setTimeout(() => {
            window.location.pathname = 'arena.html';
          }, 1000);
        } else {
          console.error('Не удалось выбрать случайного соперника');
        }
      });
    });
  
    img.src = character.avatarPath;
    img.alt = `${character.name}_${character.id}`;
  
    el.appendChild(img);
    $parent.appendChild(el);
  }
}

init();
