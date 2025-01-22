import Player from './player.js';
import { createElement } from './utils.js';
import { generateLogs } from './logs.js';

export default class Game {
    constructor() {
        this.arenaEl = document.querySelector('.arenas');
        this.randomButton = document.querySelector('.button');
        this.form = document.querySelector('.control');
    }

    async start() {
        const player1Data = JSON.parse(localStorage.getItem('player1'));
        const player2Data = JSON.parse(localStorage.getItem('player2'));

        const player1 = new Player({
            player: 1,
            name: player1Data.name,
            hp: player1Data.hp,
            img: player1Data.gifPath,
        });

        const player2 = new Player({
            player: 2,
            name: player2Data.name,
            hp: player2Data.hp,
            img: player2Data.gifPath,
        });

        this.arenaEl.appendChild(player1.createPlayer());
        this.arenaEl.appendChild(player2.createPlayer());

        generateLogs('start', player1, player2);

        this.form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const playerAttack = this.getPlayerAttack();

            try {
                const fightResult = await this.fetchFightResult(playerAttack.hit, playerAttack.defence);

                this.processAttack(player1, player2, fightResult.player2, fightResult.player1);
                this.processAttack(player2, player1, fightResult.player1, fightResult.player2);

                player1.renderHP();
                player2.renderHP();

                if (player1.hp <= 0 || player2.hp <= 0) {
                    this.endGame(player1, player2);
                }
            } catch (error) {
                console.error('Ошибка во время боя:', error);
            }
        });
    }

    async fetchFightResult(hit, defence) {
        const response = await fetch('http://localhost:3001/api/player/fight', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ hit, defence }),
        });

        if (!response.ok) {
            throw new Error('Ошибка запроса к серверу');
        }

        return await response.json();
    }

    getPlayerAttack() {
        let playerAttack = {
            value: 0,
            hit: '',
            defence: '',
        };

        for (const item of this.form) {
            if (item.checked && item.name === 'hit') {
                playerAttack.hit = item.value;
            }

            if (item.checked && item.name === 'defence') {
                playerAttack.defence = item.value;
            }
        }

        return playerAttack;
    }

    processAttack(attacker, defender, attack, defend) {
        if (attack.hit !== defend.defence) {
            defender.changeHP(attack.value);
            defender.renderHP();
            generateLogs('hit', attacker, defender, attack.value);
        } else {
            generateLogs('defence', attacker, defender);
        }
    }

    endGame(player1, player2) {
        if (player1.hp <= 0 && player2.hp <= 0) {
            generateLogs('draw');
        } else if (player1.hp <= 0) {
            generateLogs('end', player2, player1);
            this.showResultText(player2.name);
        } else if (player2.hp <= 0) {
            generateLogs('end', player1, player2);
            this.showResultText(player1.name);
        }
        this.randomButton.disabled = true;
        this.createReloadButton();
    }

    showResultText(name) {
        const showResultEl = createElement('div', 'showResult');
        showResultEl.innerText = `${name} WINS`;
        this.arenaEl.appendChild(showResultEl);
    }

    createReloadButton() {
        const reloadDivEl = createElement('div', 'reloadWrap');
        const reloadButtonEl = createElement('button', 'button');
        reloadButtonEl.innerText = 'RESTART';

        reloadButtonEl.addEventListener('click', () => {
            window.location.pathname = './index.html';
        });

        reloadDivEl.appendChild(reloadButtonEl);
        this.arenaEl.appendChild(reloadDivEl);
    }
}
