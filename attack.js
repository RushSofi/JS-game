import generateLogs from './logs.js';
import getRandom from './utils.js';

export const HIT = {
    head: 30,
    body: 25,
    foot: 20,
}

const ATTACK = ['head', 'body', 'foot'];

export function processAttack(attacker, defender, attack, defend) {
    if (attack.hit !== defend.defence) {
        defender.changeHP(attack.value);
        defender.renderHP();
        generateLogs('hit', attacker, defender, attack.value);
    } else {
        generateLogs('defence', attacker, defender);
    }
}

export function enemyAttack() {
    const hit = ATTACK[getRandom(ATTACK.length - 1)];
    const defence = ATTACK[getRandom(ATTACK.length - 1)];
    const value = HIT[hit];

    return {
        value,
        hit,
        defence
    };
}
