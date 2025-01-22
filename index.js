import { createElement } from "./utils.js";

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

    for (let i = 0; i < characters.length; i++) {
        if (characters[i].id === 11) {
            continue;
        }

        const el = createElement('div', ['character', `div${characters[i].id}`]);
        const img = createElement('img');

        el.addEventListener('mousemove', () => {
            if (imgSrc === null) {
                imgSrc = characters[i];
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
            localStorage.setItem('player1', JSON.stringify(imgSrc));

            const enemy = await getEnemyCharacter();
            if (enemy) {
                localStorage.setItem('player2', JSON.stringify(enemy));
                el.classList.add('active');
                setTimeout(() => {
                    window.location.pathname = 'arenas.html';
                }, 1000);
            } else {
                console.error('Не удалось выбрать случайного соперника');
            }
        });

        img.src = characters[i].avatarPath;
        img.alt = `${characters[i].name}_${characters[i].id}`;

        el.appendChild(img);
        $parent.appendChild(el);
    }
}

init();
